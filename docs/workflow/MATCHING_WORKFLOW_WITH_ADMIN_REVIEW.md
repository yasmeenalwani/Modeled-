# Matching Workflow - Manual Admin Review Process

**Created:** January 6, 2026  
**Status:** Active Documentation  
**Purpose:** Clarify manual admin review steps vs automated processes

---

## 🎯 Overview

This workflow shows **exactly where admin review and approval is required** vs what happens automatically in the background.

---

## 📋 Complete Workflow with Admin Review Points

```
┌─────────────────────────────────────────────────────────────────┐
│              MATCHING WORKFLOW - ADMIN REVIEW PROCESS              │
└─────────────────────────────────────────────────────────────────┘

1. REQUEST CREATION (Professional)
   ↓ [AUTOMATED]
2. REQUEST QUEUE (Admin Reviews)
   ↓ [👤 ADMIN REVIEW REQUIRED]
3. RUN MATCHING (Admin Clicks "Match" Button)
   ↓ [AUTOMATED]
4. MATCHES GENERATED (System Calculates Scores)
   ↓ [👤 ADMIN REVIEW REQUIRED]
5. APPROVE MATCHES (Admin Clicks "Approve" Button)
   ↓ [👤 ADMIN REVIEW REQUIRED]
6. SEND TO MODELS (Admin Clicks "Send" Button)
   ↓ [AUTOMATED]
7. NOTIFICATIONS SENT (System Sends Emails/SMS)
   ↓ [AUTOMATED]
8. MODEL RESPONSE (Model Accepts/Declines)
   ↓ [AUTOMATED]
9. PAYMENT PROCESSING (Stripe)
   ↓ [AUTOMATED]
10. BOOKING CONFIRMED (System Creates Booking)
```

---

## 1️⃣ REQUEST CREATION (AUTOMATED)

### **Who:** Professional
### **Action:** Professional creates request via portal
### **Status:** `ModelRequest.status = 'pending'`

### **What Happens Automatically:**
- ✅ Request saved to database
- ✅ Professional gets confirmation notification
- ✅ Request appears in admin queue

### **Admin Action Required:** ❌ None
### **Next:** Request appears in admin queue for review

---

## 2️⃣ REQUEST REVIEW (👤 ADMIN REVIEW REQUIRED)

### **Who:** Admin
### **Where:** `/admin/requests` (RequestsPage.jsx)
### **Status:** `ModelRequest.status = 'pending'`

### **What Admin Sees:**
- Request details (service, date, time, location)
- Professional info (name, salon, contact)
- Desired model attributes
- Priority level

### **Admin Actions Available:**
1. **Review Request Details** - Check if request is complete and valid
2. **Edit Request** (if needed) - Fix any issues
3. **Reject Request** (if invalid) - Cancel request
4. **Approve for Matching** - Click "Run Match Engine" button

### **Admin Decision Point:**
```
👤 ADMIN REVIEWS REQUEST
   ↓
   Is request valid and ready?
   ├─ YES → Click "Run Match Engine" button → Go to Step 3
   └─ NO → Reject/Edit request → End workflow
```

### **What Happens When Admin Clicks "Run Match Engine":**
- Request status updated to `'matching'`
- Admin redirected to `/admin/matching` page
- Matching engine ready to run

### **Automated:** ❌ None - Admin must manually trigger

---

## 3️⃣ RUN MATCHING ENGINE (👤 ADMIN TRIGGERS, THEN AUTOMATED)

### **Who:** Admin → System
### **Where:** `/admin/matching` (MatchEnginePage.jsx)
### **Status:** `ModelRequest.status = 'matching'`

### **What Admin Sees:**
- Request details panel (left side)
- "Run Matching Engine" button
- Empty matches panel (right side)

### **Admin Action Required:**
```
👤 ADMIN CLICKS "Run Matching Engine" BUTTON
```

### **What Happens Automatically After Admin Clicks:**
1. ✅ System queries all active `ModelProfile` records
2. ✅ System calculates match scores (0-100) for each model
3. ✅ System filters by dealbreakers (allergies, service availability)
4. ✅ System sorts by score (highest first)
5. ✅ System creates `Match` records with status `'pending'`
6. ✅ Matches displayed in UI with scores and breakdowns

### **Match Records Created:**
```typescript
Match {
  requestId: string,
  modelId: string,
  matchScore: float (0-100),
  scoreBreakdown: json,
  status: 'pending', // Not yet approved by admin
  createdAt: datetime,
}
```

### **Admin Action Required:** ❌ None (matches are generated automatically)
### **Next:** Matches appear in UI for admin review

---

## 4️⃣ MATCH REVIEW (👤 ADMIN REVIEW REQUIRED)

### **Who:** Admin
### **Where:** `/admin/matching` (MatchEnginePage.jsx)
### **Status:** `Match.status = 'pending'`

### **What Admin Sees:**
- List of potential matches with scores
- Each match shows:
  - Model name and photo
  - Match score (0-100)
  - Score breakdown (attribute match, agentic scores, etc.)
  - Model attributes (hair color, length, etc.)
  - Agentic scores (reliability, feedback, experience, etc.)
- "Approve" button for each match
- "Approve All" button (if score > threshold)

### **Admin Actions Available:**
1. **Review Each Match** - Check scores, model profile, attributes
2. **View Model Profile** - Click to see full model details
3. **Select Matches to Approve** - Check boxes or click "Approve" button
4. **Approve Selected Matches** - Click "Approve" button

### **Admin Decision Point:**
```
👤 ADMIN REVIEWS MATCHES
   ↓
   Which matches are good enough?
   ├─ Select matches to approve
   └─ Click "Approve" button → Go to Step 5
```

### **What Happens When Admin Clicks "Approve":**
- Selected matches status updated to `'approved'`
- Matches ready to be sent to models
- Matches appear in approval queue

### **Automated:** ❌ None - Admin must manually approve each match

---

## 5️⃣ APPROVE MATCHES (👤 ADMIN REVIEW REQUIRED)

### **Who:** Admin
### **Where:** `/admin/match-approval` (MatchApprovalPage.jsx)
### **Status:** `Match.status = 'approved'`

### **What Admin Sees:**
- List of approved matches
- Match details (model, score, request info)
- "Send to Models" button

### **Admin Action Required:**
```
👤 ADMIN REVIEWS APPROVED MATCHES
   ↓
   Are matches ready to send?
   ├─ YES → Click "Send to Models" button → Go to Step 6
   └─ NO → Unapprove or edit matches
```

### **What Happens When Admin Clicks "Send to Models":**
- Matches status updated to `'sent'`
- `Match.sentAt` timestamp set
- System ready to send notifications

### **Automated:** ❌ None - Admin must manually send

---

## 6️⃣ SEND TO MODELS (👤 ADMIN TRIGGERS, THEN AUTOMATED)

### **Who:** Admin → System
### **Where:** `/admin/match-approval` (MatchApprovalPage.jsx)
### **Status:** `Match.status = 'sent'`

### **Admin Action Required:**
```
👤 ADMIN CLICKS "Send to Models" BUTTON
```

### **What Happens Automatically After Admin Clicks:**
1. ✅ For each match:
   - Create `Notification` record
   - Send email to model
   - Send SMS (if enabled)
   - Send in-app notification
2. ✅ Update `Match.status = 'sent'`
3. ✅ Set `Match.sentAt = now()`
4. ✅ Update `ModelRequest.status = 'matched'`

### **Notification Content:**
- Service type
- Date & time
- Location
- Payment amount
- Professional info
- Link to view details

### **Admin Action Required:** ❌ None (notifications sent automatically)
### **Next:** Models receive notifications

---

## 7️⃣ MODEL RESPONSE (AUTOMATED)

### **Who:** Model
### **Where:** `/model-portal/opportunities`
### **Status:** `Match.status = 'accepted'` or `'declined'`

### **What Happens Automatically:**
- Model views opportunity
- Model clicks "Accept" or "Decline"
- System updates `Match.status`
- System sends notifications:
  - ✅ Professional: "Model accepted/declined"
  - ✅ Admin: "Match accepted/declined"

### **Admin Action Required:** ❌ None
### **Next:** If accepted → Payment processing

---

## 8️⃣ PAYMENT PROCESSING (AUTOMATED)

### **Who:** Model → System (Stripe)
### **Where:** Payment page
### **Status:** `Booking.modelPaymentStatus = 'pending'` → `'paid'`

### **What Happens Automatically:**
1. ✅ Payment intent created (Stripe)
2. ✅ Model enters payment details
3. ✅ Payment processed
4. ✅ Webhook received
5. ✅ Booking created
6. ✅ Notifications sent

### **Admin Action Required:** ❌ None
### **Next:** Booking confirmed

---

## 9️⃣ BOOKING CONFIRMED (AUTOMATED)

### **Who:** System
### **Status:** `Booking.status = 'confirmed'`

### **What Happens Automatically:**
1. ✅ Booking finalized
2. ✅ Calendar events created
3. ✅ Confirmation emails sent
4. ✅ In-app notifications sent

### **Admin Action Required:** ❌ None
### **Next:** Pre-session reminders (automated)

---

## 🔟 PRE-SESSION REMINDERS (AUTOMATED - EventBridge)

### **Who:** System (EventBridge scheduled)
### **When:** 24 hours before appointment
### **Status:** `Booking.status = 'confirmed'`

### **What Happens Automatically:**
- ✅ EventBridge scheduled rule runs (every hour)
- ✅ Query bookings where `appointmentDate = tomorrow` AND `reminderSent = false`
- ✅ Send reminder email to model
- ✅ Send reminder email to professional
- ✅ Send SMS (if enabled)
- ✅ Update `Booking.reminderSent = true`

### **Admin Action Required:** ❌ None
### **Next:** Chat activation (1 hour before appointment)

---

## 1️⃣1️⃣ CHAT ACTIVATION (AUTOMATED - EventBridge)

### **Who:** System (EventBridge scheduled)
### **When:** 1 hour before appointment
### **Status:** `Booking.status = 'confirmed'`, `ModelToProChat.isActive = false`

### **What Happens Automatically:**
1. ✅ EventBridge scheduled rule runs (every 15 minutes)
2. ✅ Query bookings where:
   - `appointmentDate = today`
   - `appointmentTime` is within 1 hour
   - `ModelToProChat.isActive = false`
3. ✅ For each booking:
   - Find or create `ModelToProChat` record
   - Set `chatOpensAt = appointmentTime - 1 hour`
   - Set `chatClosesAt = appointmentTime + 1 hour`
   - Set `isActive = true`
   - Send notification to model: "Chat is now open!"
   - Send notification to professional: "Chat is now open!"

### **Chat Record:**
```typescript
ModelToProChat {
  bookingId: string,
  modelId: string,
  professionalId: string,
  chatOpensAt: datetime, // 1 hour before appointment
  chatClosesAt: datetime, // 1 hour after appointment
  isActive: boolean, // true when chat window is open
  status: 'active', // 'pending', 'active', 'closed'
}
```

### **What Users Can Do:**
- ✅ Model and Professional can send messages
- ✅ Quick prompts available (e.g., "On my way!", "Running late")
- ✅ Messages visible in both portals
- ✅ Chat closes automatically 1 hour after appointment

### **Admin Action Required:** ❌ None
### **Next:** Session day

---

## 1️⃣2️⃣ SESSION DAY (AUTOMATED)

### **Who:** Model & Professional
### **When:** Day of appointment
### **Status:** `Booking.status = 'confirmed'`, `ModelToProChat.isActive = true`

### **What Happens Automatically:**
- ✅ Chat is active (opened 1 hour before)
- ✅ Users can communicate via chat
- ✅ Location sharing available
- ✅ Quick status updates available

### **Admin Action Required:** ❌ None
### **Next:** Session completion

---

## 1️⃣3️⃣ SESSION COMPLETION (👤 PROFESSIONAL ACTION)

### **Who:** Professional
### **Where:** `/portal/bookings/:bookingId/complete`
### **Status:** `Booking.status = 'completed'`

### **What Professional Does:**
1. **Marks session complete:**
   - Goes to booking details
   - Clicks "Mark Session Complete" button
   - Optionally uploads after photos

2. **System Updates:**
   ```typescript
   Booking {
     status: 'completed',
     afterPhotos: string[], // S3 URLs
     completedAt: datetime,
   }
   ```

3. **Chat Closes:**
   - `ModelToProChat.isActive = false`
   - `ModelToProChat.status = 'closed'`
   - Chat closes automatically 1 hour after appointment (if not already closed)

### **What Happens Automatically:**
- ✅ Notifications sent:
  - Model: "Session completed - please leave feedback!"
  - Professional: "Session marked complete"
- ✅ Feedback requests sent:
  - Model: "How was your experience?"
  - Professional: "Rate this model"

### **Admin Action Required:** ❌ None
### **Next:** Feedback and photo submission

---

## 1️⃣4️⃣ FEEDBACK & PHOTO SUBMISSION (👤 USER ACTION)

### **Who:** Model & Professional
### **Where:** `/portal/feedback` or `/model-portal/feedback`
### **Status:** `Booking.status = 'completed'`

### **What Model Does:**
1. **Submits Feedback:**
   ```typescript
   Booking.modelFeedback {
     overallRating: 1-5,
     serviceQuality: 1-5,
     communication: 1-5,
     professionalism: 1-5,
     comments: string,
     wouldBookAgain: boolean,
   }
   ```

2. **Uploads Photos (Optional):**
   - After photos from session
   - Portfolio photos
   - Photos tagged with service type, hair attributes, etc.

### **What Professional Does:**
1. **Submits Feedback:**
   ```typescript
   Booking.professionalFeedback {
     overallRating: 1-5,
     cooperation: 1-5,
     punctuality: 1-5,
     photoQuality: 1-5,
     comments: string,
     wouldBookAgain: boolean,
   }
   ```

2. **Uploads Photos (Optional):**
   - After photos from session
   - Portfolio photos
   - Photos tagged with service type, model attributes, etc.

### **What Happens Automatically:**
1. ✅ **Agentic Scores Updated:**
   ```typescript
   // Update model's agentic learning scores
   - Reliability score (if punctuality feedback)
   - Feedback score (average ratings)
   - Experience score (booking count)
   - Compatibility score (success rate)
   ```

2. ✅ **Photos Processed:**
   - Photos uploaded to S3
   - Auto-tagged with attributes (hair engine)
   - Added to model/professional portfolios
   - Available for matching engine

3. ✅ **Notifications:**
   - Model: "Thank you for your feedback!"
   - Professional: "Feedback received"
   - Admin: "New feedback submitted"

### **Admin Action Required:** ❌ None
### **Next:** Portal updates and analytics

---

## 1️⃣5️⃣ PORTAL UPDATES & ANALYTICS (AUTOMATED)

### **Who:** System
### **Where:** Automated background processes
### **Status:** `Booking.status = 'completed'`

### **What Happens Automatically:**

1. ✅ **Model Profile Updated:**
   - Booking history updated
   - Average ratings calculated
   - Agentic scores recalculated
   - Portfolio photos added
   - Total bookings count incremented

2. ✅ **Professional Profile Updated:**
   - Booking history updated
   - Model ratings updated
   - Success metrics calculated
   - Portfolio photos added
   - Total bookings count incremented

3. ✅ **Admin Dashboard Updated:**
   - Completed bookings count incremented
   - Revenue totals updated
   - Performance metrics updated
   - Match success rates calculated

4. ✅ **Matching Engine Updated:**
   - Model scores recalculated
   - Compatibility scores updated
   - Reliability scores updated
   - Experience scores updated

5. ✅ **Analytics Updated:**
   - Booking completion rate
   - Average ratings per service type
   - Model performance trends
   - Professional success rates

### **Admin Action Required:** ❌ None
### **Next:** Workflow complete

---

## 📊 Summary: Manual vs Automated

### **👤 MANUAL (Admin Review Required):**
1. ✅ **Review Request** - Admin reviews request details
2. ✅ **Click "Run Match Engine"** - Admin triggers matching
3. ✅ **Review Matches** - Admin reviews match scores and details
4. ✅ **Click "Approve"** - Admin approves selected matches
5. ✅ **Click "Send to Models"** - Admin sends approved matches

### **🤖 AUTOMATED (System Handles):**
1. ✅ Request creation and saving
2. ✅ Matching algorithm execution (after admin clicks "Run")
3. ✅ Match score calculation
4. ✅ Notification sending (after admin clicks "Send")
5. ✅ Model response handling
6. ✅ Payment processing
7. ✅ Booking creation
8. ✅ Reminder scheduling (EventBridge - 24h before)
9. ✅ Chat activation (EventBridge - 1h before)
10. ✅ Session completion (Professional marks complete)
11. ✅ Feedback collection (Users submit)
12. ✅ Photo processing and tagging
13. ✅ Score updates (Agentic learning)
14. ✅ Portal updates (Analytics, dashboards)
15. ✅ Analytics calculations

---

## 🎯 Admin Workflow Summary

```
1. Go to /admin/requests
   ↓
2. Review request details
   ↓
3. Click "Run Match Engine" button
   ↓
4. Go to /admin/matching
   ↓
5. Review matches (scores, profiles)
   ↓
6. Click "Approve" button for selected matches
   ↓
7. Go to /admin/match-approval
   ↓
8. Review approved matches
   ↓
9. Click "Send to Models" button
   ↓
10. Done! System handles rest automatically:
    - Reminders (EventBridge - 24h before)
    - Chat activation (EventBridge - 1h before)
    - Session completion (Professional)
    - Feedback & photos (Users)
    - Portal updates (Automated)
```

---

## 🔔 Notification Flow

### **When Admin Reviews Request:**
- ❌ No notifications (admin action)

### **When Admin Clicks "Run Match Engine":**
- ❌ No notifications (admin action)

### **When Admin Approves Matches:**
- ❌ No notifications (admin action)

### **When Admin Clicks "Send to Models":**
- ✅ **Model:** Email, SMS, In-app notification
- ✅ **Professional:** "Matches sent to models"
- ✅ **Admin:** "Matches sent successfully"

### **After Admin Sends (All Automated):**
- ✅ Model accepts/declines → Automated notifications
- ✅ Payment → Automated notifications
- ✅ Booking confirmed → Automated notifications
- ✅ Reminders (24h before) → Automated (EventBridge)
- ✅ Chat activation (1h before) → Automated (EventBridge)
- ✅ Session completion → Automated notifications
- ✅ Feedback requests → Automated notifications
- ✅ Feedback submitted → Automated notifications
- ✅ Portal updates → Automated (background)

---

## 🚀 Implementation Status

### **Current Implementation:**
- ✅ Request creation: Working
- ✅ Request review page: Working
- ✅ Match engine page: Working
- ✅ Match approval page: Working
- ✅ Manual "Run Match Engine" button: Working
- ✅ Manual "Approve" button: Working
- ✅ Manual "Send to Models" button: Working
- ✅ Notification sending: Working (after admin clicks "Send")

### **Future Enhancements:**
- ⏳ EventBridge for reminders (scheduled) - **IN PROGRESS**
- ⏳ EventBridge for chat activation (scheduled) - **IN PROGRESS**
- ⏳ Real-time score updates (event-driven)
- ⏳ Admin dashboard notifications
- ⏳ Batch operations (approve multiple at once)
- ⏳ Photo auto-tagging improvements
- ⏳ Analytics dashboard enhancements

---

## 📝 Key Points

1. **Admin has full control** - Every critical step requires admin review
2. **No auto-matching** - Admin must click "Run Match Engine"
3. **No auto-approval** - Admin must manually approve each match
4. **No auto-send** - Admin must manually click "Send to Models"
5. **After admin sends** - Everything else is automated:
   - Reminders (EventBridge - 24h before)
   - Chat activation (EventBridge - 1h before)
   - Session completion (Professional action)
   - Feedback & photos (User actions)
   - Portal updates (Automated background)
6. **EventBridge automations** - Scheduled reminders and chat activation
7. **User actions** - Professional marks complete, users submit feedback/photos
8. **Background updates** - Scores, analytics, portal updates happen automatically

---

**Last Updated:** January 6, 2026  
**Status:** Active Documentation

