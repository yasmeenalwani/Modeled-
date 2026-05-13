# Match Actions Implementation
*Created: 2026-01-05*

## 🎯 Overview

Comprehensive match management system for handling the complete match lifecycle from creation to booking, including approval, sending, acceptance, decline, expiration, and waitlist management.

---

## ✅ Completed

### **1. Match Service (`src/utils/matchService.js`)**
Created comprehensive match management utility with:

#### **Match Creation**
- `createMatch()` - Create a single match
- `createMatchesForRequest()` - Create multiple matches for a request (from matching engine)

#### **Match Queries**
- `getMatchesForRequest()` - Get all matches for a request
- `getMatchesForModel()` - Get all matches for a model
- `getAllMatches()` - Get all matches (admin)
- `getMatchById()` - Get single match
- `getPendingMatches()` - Get pending matches (awaiting approval)
- `getSentMatches()` - Get sent matches (awaiting model response)
- `getAcceptedMatches()` - Get accepted matches

#### **Match Actions**
- `approveMatch()` - Admin approves match (ready to send)
- `approveMatches()` - Approve multiple matches
- `sendMatchToModel()` - Send match to model (change status to 'sent', send notification)
- `sendMatchesToModels()` - Send multiple matches
- `acceptMatch()` - Model accepts match (triggers booking creation)
- `declineMatch()` - Model declines match
- `expireMatch()` - Expire match (if not responded to)
- `expireOldMatches()` - Expire all old matches (scheduled job)

#### **Waitlist Management**
- `addMatchToWaitlist()` - Add match to waitlist
- `getWaitlistForRequest()` - Get waitlist for a request
- `promoteFromWaitlist()` - Promote next model from waitlist
- Automatic waitlist handling after decline/expiration

#### **Utilities**
- `updateMatchStatus()` - Update match status
- `getMatchStatistics()` - Get match statistics

#### **Notifications**
- Automatic notifications for:
  - Match sent to model
  - Match accepted
  - Match declined
  - Match expired

### **2. MatchEnginePage Updates**
- ✅ Updated to use real database match service
- ✅ Creates matches in database when approved
- ✅ Sends matches to models automatically
- ✅ Updates request status

---

## 📋 Pending Tasks

### **3. MatchApprovalPage Updates**
- Update to use real database match service
- Load matches from database instead of mocks
- Implement approve/send actions using real service

### **4. Model Match Acceptance Flow**
- Create UI for models to accept/decline matches
- Integrate with payment flow
- Connect to booking creation

### **5. Match Expiration Job**
- Set up scheduled Lambda function to expire old matches
- Run `expireOldMatches()` daily

### **6. Waitlist UI**
- Display waitlist in admin/match pages
- Show waitlist position to models
- Allow manual waitlist promotion

---

## 🔄 Match Flow

### **Complete Match Lifecycle:**

```
1. Request Created
   ↓
2. Matching Engine Runs
   ↓
3. Matches Created (status: 'pending')
   ↓
4. Admin Approves Matches (status: 'approved')
   ↓
5. Admin Sends to Models (status: 'sent')
   ↓
6a. Model Accepts → Booking Created (status: 'accepted')
6b. Model Declines → Next in Waitlist (status: 'declined')
6c. No Response → Expires (status: 'expired')
   ↓
7. Booking Flow Continues...
```

### **Status Transitions:**
```
pending → approved → sent → accepted (booking created)
pending → approved → sent → declined (waitlist)
pending → approved → sent → expired (waitlist)
pending → approved → sent → waitlist (if booking taken)
```

---

## 📊 Match Data Structure

```typescript
Match {
  // Identifiers
  requestId: string
  modelId: string
  
  // Scoring
  matchScore: float (0-100)
  scoreBreakdown: json // { hairColor: 20, availability: 30, ... }
  
  // Status
  status: 'pending' | 'approved' | 'sent' | 'accepted' | 'declined' | 'expired' | 'waitlist'
  
  // Waitlist
  waitlistPosition: integer // 1 = first in line
  bookingId: string // Set if match resulted in booking
  
  // Timestamps
  sentAt: datetime
  respondedAt: datetime
  
  // Admin
  adminNotes: string
}
```

---

## 🔧 Usage Examples

### **Create Matches from Matching Engine**
```javascript
import { createMatchesForRequest } from '../utils/matchService';

const matches = await createMatchesForRequest(requestId, [
  {
    modelId: 'model-1',
    finalScore: 85,
    breakdown: { hairColor: 20, availability: 30, ... },
  },
  {
    modelId: 'model-2',
    finalScore: 78,
    breakdown: { ... },
  },
]);
```

### **Approve and Send Matches**
```javascript
import { approveMatches, sendMatchesToModels } from '../utils/matchService';

// Approve matches
const matchIds = ['match-1', 'match-2'];
await approveMatches(matchIds, 'Approved from match engine');

// Send to models
await sendMatchesToModels(matchIds);
```

### **Model Accepts Match**
```javascript
import { acceptMatch } from '../utils/matchService';

const result = await acceptMatch(matchId, {
  modelPaid: true,
  proPaid: true,
  paymentIntentId: 'pi_xxx',
  customerId: 'cus_xxx',
  appointmentDate: '2024-12-15',
  appointmentTime: '10:00',
  location: '123 Main St',
});

// result.booking contains the created booking
```

### **Model Declines Match**
```javascript
import { declineMatch } from '../utils/matchService';

await declineMatch(matchId, 'Schedule conflict');
```

### **Get Matches for Model**
```javascript
import { getMatchesForModel } from '../utils/matchService';

const matches = await getMatchesForModel(modelId, {
  status: 'sent', // Only get sent matches
});
```

### **Expire Old Matches (Scheduled Job)**
```javascript
import { expireOldMatches } from '../utils/matchService';

// Run daily - expire matches older than 48 hours
const expired = await expireOldMatches(48);
console.log(`Expired ${expired.length} matches`);
```

### **Waitlist Management**
```javascript
import { getWaitlistForRequest, promoteFromWaitlist } from '../utils/matchService';

// Get waitlist
const waitlist = await getWaitlistForRequest(requestId);

// Promote next model
const nextMatch = await promoteFromWaitlist(requestId);
```

---

## 🚀 Next Steps

1. **Update MatchApprovalPage** - Use real database data
2. **Model Match UI** - Create interface for models to view/accept/decline matches
3. **Match Expiration Job** - Set up scheduled Lambda function
4. **Waitlist UI** - Display and manage waitlists
5. **Match Analytics** - Track acceptance rates, response times, etc.

---

## 📝 Notes

- All match actions include automatic notifications
- Waitlist is automatically managed when matches are declined/expired
- Match expiration runs as a scheduled job (48 hours default)
- Match acceptance automatically creates booking
- Status transitions are validated (can't accept a pending match, etc.)

---

**Last Updated:** 2026-01-05  
**Status:** Core functionality complete, UI integration in progress

