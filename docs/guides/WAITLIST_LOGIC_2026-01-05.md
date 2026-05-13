# Waitlist Logic Implementation 🔄

## Overview

**Key Feature**: Multiple matches per request → First to pay wins → Rest go to waitlist

---

## Race Condition Handling

### **Problem:**
- 5 models receive match notifications simultaneously
- All can try to accept at the same time
- Only ONE should get the booking
- Others should go to waitlist

### **Solution: Atomic Database Update**

```javascript
// Critical: Use conditional update to prevent race condition
const updateParams = {
  TableName: 'Match-dev',
  Key: { id: matchId },
  UpdateExpression: 'SET #status = :accepted, #bookingId = :bookingId',
  ConditionExpression: '#status = :sent AND attribute_not_exists(#bookingId)',
  // ↑ This ensures only the FIRST update succeeds
  ExpressionAttributeNames: {
    '#status': 'status',
    '#bookingId': 'bookingId',
  },
  ExpressionAttributeValues: {
    ':accepted': 'accepted',
    ':sent': 'sent',
    ':bookingId': bookingId,
  },
};

try {
  const result = await dynamodb.update(updateParams).promise();
  // ✅ Success - this model got it!
  return { success: true, match: result.Attributes };
} catch (error) {
  if (error.code === 'ConditionalCheckFailedException') {
    // ❌ Someone else got it first
    // Move this match to waitlist
    await moveToWaitlist(matchId, requestId);
    return { success: false, waitlist: true };
  }
  throw error;
}
```

---

## Waitlist Flow

### **Step 1: Multiple Matches Created**
```
Request: req-123 (Blowout, Dec 20)
  ├─→ Match 1: Emma (92%) - status: "sent"
  ├─→ Match 2: Sophia (78%) - status: "sent"
  ├─→ Match 3: Olivia (65%) - status: "sent"
  ├─→ Match 4: Ava (60%) - status: "sent"
  └─→ Match 5: Isabella (55%) - status: "sent"
```

### **Step 2: All Models Notified Simultaneously**
```
09:15:00 - Emma receives notification
09:15:01 - Sophia receives notification
09:15:02 - Olivia receives notification
09:15:03 - Ava receives notification
09:15:04 - Isabella receives notification
```

### **Step 3: Race to Accept**
```
10:00:00 - Emma clicks "Accept" → Atomic update succeeds ✅
10:00:01 - Sophia clicks "Accept" → Conditional check fails ❌
10:00:02 - Olivia clicks "Accept" → Conditional check fails ❌
10:00:03 - Ava clicks "Accept" → Conditional check fails ❌
10:00:04 - Isabella clicks "Accept" → Conditional check fails ❌
```

### **Step 4: Waitlist Assignment**
```
After Emma's successful booking:
  ├─→ Match 1: Emma - status: "accepted", bookingId: "booking-123" ✅
  ├─→ Match 2: Sophia - status: "waitlist", waitlistPosition: 1
  ├─→ Match 3: Olivia - status: "waitlist", waitlistPosition: 2
  ├─→ Match 4: Ava - status: "waitlist", waitlistPosition: 3
  └─→ Match 5: Isabella - status: "waitlist", waitlistPosition: 4
```

### **Step 5: Waitlist Notifications**
```
Sophia receives: "Booking was taken, but you're #1 on the waitlist!"
Olivia receives: "Booking was taken, but you're #2 on the waitlist!"
Ava receives: "Booking was taken, but you're #3 on the waitlist!"
Isabella receives: "Booking was taken, but you're #4 on the waitlist!"
```

---

## Waitlist Position Calculation

```javascript
// Calculate waitlist position based on match score (higher score = better position)
function calculateWaitlistPosition(match, allWaitlistedMatches) {
  // Sort by match score (descending)
  const sorted = allWaitlistedMatches
    .filter(m => m.status === 'waitlist')
    .sort((a, b) => b.matchScore - a.matchScore);
  
  // Find position
  const position = sorted.findIndex(m => m.id === match.id) + 1;
  return position;
}
```

**Alternative: First-come-first-served**
```javascript
// Or use timestamp (first to try gets better position)
function calculateWaitlistPosition(match, allWaitlistedMatches) {
  const sorted = allWaitlistedMatches
    .filter(m => m.status === 'waitlist')
    .sort((a, b) => new Date(a.respondedAt) - new Date(b.respondedAt));
  
  return sorted.findIndex(m => m.id === match.id) + 1;
}
```

---

## If Booking Cancels

### **Step 1: Booking Cancelled**
```javascript
// Update booking status
await updateBooking(bookingId, { status: 'cancelled' });
```

### **Step 2: Find Next on Waitlist**
```javascript
// Query for waitlist position 1
const nextMatch = await queryMatches({
  requestId: requestId,
  status: 'waitlist',
  waitlistPosition: 1,
  limit: 1,
});
```

### **Step 3: Promote from Waitlist**
```javascript
// Update match to accepted
await updateMatch(nextMatch.id, {
  status: 'accepted',
  waitlistPosition: null,
  bookingId: newBookingId,
});

// Update other waitlist positions
await updateWaitlistPositions(requestId);
```

### **Step 4: Notify Promoted Model**
```javascript
await sendNotification({
  type: 'email',
  template: 'waitlist_promotion',
  recipient: {
    email: nextMatch.modelEmail,
    name: nextMatch.modelName,
  },
  data: {
    serviceType: 'blowout',
    message: 'Great news! A booking opened up and you're next in line!',
    bookingLink: `https://app.modeled.com/match/${nextMatch.id}/accept`,
  }
});
```

---

## Database Schema Updates

### **Match Model** (Updated)
```typescript
Match: {
  id: string,
  requestId: string,
  modelId: string,
  matchScore: number,
  status: 'pending' | 'approved' | 'sent' | 'accepted' | 'declined' | 'expired' | 'waitlist',
  waitlistPosition: number | null, // 1, 2, 3, etc.
  bookingId: string | null, // Set if match resulted in booking
  sentAt: datetime,
  respondedAt: datetime,
}
```

### **DynamoDB Indexes Needed**
```javascript
// GSI 1: Query by request and status
{
  IndexName: 'requestId-status-index',
  PartitionKey: 'requestId',
  SortKey: 'status',
}

// GSI 2: Query waitlist by position
{
  IndexName: 'requestId-waitlistPosition-index',
  PartitionKey: 'requestId',
  SortKey: 'waitlistPosition',
  FilterExpression: 'status = :waitlist',
}
```

---

## Implementation Code

### **Accept Match with Race Condition Handling**
```javascript
// src/utils/matching.js
export async function acceptMatch(matchId, modelId) {
  const client = generateClient();
  
  try {
    // Step 1: Try to claim the match (atomic update)
    const result = await client.graphql({
      query: updateMatch,
      variables: {
        input: {
          id: matchId,
          status: 'accepted',
          respondedAt: new Date().toISOString(),
        },
        condition: {
          status: { eq: 'sent' },
          bookingId: { attributeExists: false },
        }
      }
    });
    
    // Step 2: If successful, create booking
    if (result.data.updateMatch) {
      const booking = await createBooking(result.data.updateMatch);
      
      // Step 3: Move other matches to waitlist
      await moveOtherMatchesToWaitlist(result.data.updateMatch.requestId, matchId);
      
      return { success: true, booking };
    }
    
  } catch (error) {
    if (error.errors?.[0]?.errorType === 'ConditionalCheckFailedException') {
      // Someone else got it - move to waitlist
      await moveToWaitlist(matchId);
      return { success: false, waitlist: true };
    }
    throw error;
  }
}
```

### **Move to Waitlist**
```javascript
async function moveToWaitlist(matchId, requestId) {
  // Get all matches for this request
  const allMatches = await getMatchesByRequestId(requestId);
  
  // Calculate position (by score or timestamp)
  const waitlistedMatches = allMatches.filter(m => 
    m.status === 'waitlist' || (m.status === 'sent' && m.id !== matchId)
  );
  
  const position = waitlistedMatches.length + 1;
  
  // Update this match
  await client.graphql({
    query: updateMatch,
    variables: {
      input: {
        id: matchId,
        status: 'waitlist',
        waitlistPosition: position,
        respondedAt: new Date().toISOString(),
      }
    }
  });
  
  // Notify model
  await sendWaitlistNotification(matchId, position);
}
```

---

## User Experience

### **Model Accepts Match**
```
Scenario 1: First to accept ✅
  → "Booking confirmed! Complete payment..."
  → Redirected to payment page

Scenario 2: Not first ❌
  → "This booking was just taken, but you're #2 on the waitlist!"
  → "We'll notify you if it opens up"
  → Waitlist notification sent
```

### **Waitlist Promotion**
```
Model receives email:
  Subject: "Great news! A booking opened up! 🎉"
  Body: "The blowout booking you were interested in is now available. 
         You're next in line! Click here to claim it."
  
  → Model clicks link
  → Goes to payment page
  → Completes booking
```

---

## Monitoring

### **CloudWatch Metrics**
```javascript
// Track waitlist activity
await putMetric('MatchWaitlisted', 1, 'Count', {
  RequestId: requestId,
  Position: waitlistPosition,
});

await putMetric('WaitlistPromoted', 1, 'Count', {
  RequestId: requestId,
  OriginalPosition: waitlistPosition,
});
```

---

**This ensures fair, race-condition-free waitlist management!** 🎯

