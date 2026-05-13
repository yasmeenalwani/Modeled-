# Complete Booking Workflow - Modeled Management

**Created:** January 6, 2026  
**Status:** Active Documentation  
**Purpose:** Map out the complete workflow from request creation to session completion

---

## 📋 Overview

This document maps the complete booking workflow from initial request creation through session completion and feedback. It includes all states, transitions, user actions, and system automations.

---

## 🔄 Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE BOOKING WORKFLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. REQUEST CREATION
   ↓
2. MATCHING PROCESS
   ↓
3. MATCH APPROVAL & NOTIFICATION
   ↓
4. MODEL ACCEPTANCE
   ↓
5. PAYMENT PROCESSING
   ↓
6. BOOKING CONFIRMATION
   ↓
7. PRE-SESSION (Reminders, Prep)
   ↓
8. SESSION COMPLETION
   ↓
9. FEEDBACK & RATINGS
   ↓
10. POST-SESSION (Analytics, Updates)
```

---

## 1️⃣ REQUEST CREATION

### **Who:** Professional
### **Where:** `/portal/request` (ProRequestCreationLuxury.jsx)
### **Status:** `ModelRequest.status = 'pending'`

### **Steps:**

1. **Professional fills out request form:**
   - Service type (haircut, color, blowdry, etc.)
   - Service description
   - Desired model attributes:
     - Hair color, length, texture, condition
     - Age range (optional)
     - Skin tone (optional)
     - Other preferences
   - Date & time
   - Duration
   - Location
   - Pricing (modelSearchFee, modelPayment)

2. **System validates:**
   - Required fields
   - Date/time in future
   - Service type exists
   - Pricing is valid

3. **Request created:**
   ```typescript
   ModelRequest {
     status: 'pending',
     professionalId: string,
     serviceType: string,
     requestedDate: date,
     requestedTime: string,
     // ... other fields
   }
   ```

4. **Notifications:**
   - ✅ Professional: "Request created successfully"
   - ✅ Admin: "New request pending matching" (if admin approval needed)

### **Next:** Request moves to matching queue

---

## 2️⃣ MATCHING PROCESS

### **Who:** System (Admin can trigger manually)
### **Where:** Admin dashboard `/admin/matching`
### **Status:** `ModelRequest.status = 'matching'`

### **Steps:**

1. **Admin triggers matching** (or automatic):
   - Selects request from queue
   - Clicks "Run Matching Engine"

2. **Matching engine runs:**
   ```typescript
   // src/matching/matchingEngine.js
   - Queries all active ModelProfiles
   - Calculates match scores (0-100) for each model
   - Score components:
     * Attribute Match (40%)
     * Agentic Learning (35%)
     * Location (15%)
     * Availability (10%)
   - Filters by dealbreakers (allergies, service availability)
   - Sorts by score (highest first)
   ```

3. **Matches created:**
   ```typescript
   Match {
     requestId: string,
     modelId: string,
     matchScore: float (0-100),
     scoreBreakdown: json,
     status: 'pending', // Not yet approved by admin
   }
   ```

4. **Admin reviews matches:**
   - Sees list of potential matches with scores
   - Can view model profiles
   - Selects which matches to approve

5. **Admin approves matches:**
   - Updates `Match.status = 'approved'`
   - Matches ready to be sent to models

### **Next:** Approved matches sent to models

---

## 3️⃣ MATCH APPROVAL & NOTIFICATION

### **Who:** Admin → System → Models
### **Where:** Admin dashboard → Notifications Lambda → Model portal
### **Status:** `Match.status = 'sent'`

### **Steps:**

1. **Admin sends matches:**
   - Clicks "Send to Models" on approved matches
   - System updates `Match.status = 'sent'`
   - Sets `Match.sentAt = now()`

2. **Notifications sent:**
   ```typescript
   // amplify/functions/notifications/handler.ts
   For each match:
     - Create Notification record
     - Send email to model
     - Send SMS (if enabled)
     - Send in-app notification
   ```

3. **Model receives notification:**
   - Email: "New booking opportunity!"
   - SMS: "You have a new match on Modeled"
   - In-app: Notification badge in portal

4. **Model views opportunity:**
   - Goes to `/model-portal/opportunities`
   - Sees match details:
     * Service type
     * Date & time
     * Location
     * Payment amount
     * Professional info

### **Next:** Model accepts or declines

---

## 4️⃣ MODEL ACCEPTANCE

### **Who:** Model
### **Where:** `/model-portal/opportunities`
### **Status:** `Match.status = 'accepted'` or `'declined'`

### **Steps:**

1. **Model reviews match:**
   - Views service details
   - Checks date/time availability
   - Reviews professional profile

2. **Model decision:**

   **If ACCEPT:**
   ```typescript
   Match {
     status: 'accepted',
     respondedAt: now(),
   }
   ```
   - Model clicks "Accept"
   - System updates match status
   - **Next:** Payment processing

   **If DECLINE:**
   ```typescript
   Match {
     status: 'declined',
     respondedAt: now(),
   }
   ```
   - Model clicks "Decline"
   - System updates match status
   - **Next:** Waitlist or find another match

3. **Notifications:**
   - ✅ Model: "You accepted the booking!"
   - ✅ Professional: "A model accepted your request"
   - ✅ Admin: "Match accepted - proceed to payment"

### **Next:** Payment processing (if accepted)

---

## 5️⃣ PAYMENT PROCESSING

### **Who:** Model → System (Stripe)
### **Where:** `/model-portal/opportunities` or payment page
### **Status:** `Booking.modelPaymentStatus = 'pending'` → `'paid'`

### **Steps:**

1. **Payment intent created:**
   ```typescript
   // amplify/functions/stripe-payment/handler.ts
   Stripe Payment Intent {
     amount: modelFee,
     currency: 'usd',
     customer: modelStripeCustomerId,
   }
   ```

2. **Model enters payment:**
   - Redirected to payment page
   - Enters card details
   - Confirms payment

3. **Payment processed:**
   ```typescript
   Stripe.confirmPayment()
   ```

4. **Webhook received:**
   ```typescript
   // Stripe webhook handler
   if (payment.succeeded) {
     Booking {
       modelPaymentStatus: 'paid',
       stripePaymentIntentId: string,
       stripeChargeId: string,
       paymentDate: now(),
     }
   }
   ```

5. **Booking created:**
   ```typescript
   Booking {
     matchId: string,
     requestId: string,
     modelId: string,
     professionalId: string,
     status: 'confirmed',
     modelPaymentStatus: 'paid',
     // ... other fields
   }
   ```

6. **Notifications:**
   - ✅ Model: "Payment successful - booking confirmed!"
   - ✅ Professional: "Payment received - booking confirmed"
   - ✅ Admin: "New booking confirmed"

### **Next:** Booking confirmation & calendar

---

## 6️⃣ BOOKING CONFIRMATION

### **Who:** System
### **Where:** Automatic after payment
### **Status:** `Booking.status = 'confirmed'`

### **Steps:**

1. **Booking finalized:**
   - All details confirmed
   - Payment received
   - Status updated to 'confirmed'

2. **Calendar events created:**
   ```typescript
   // Generate iCal files
   - Model calendar event
   - Professional calendar event
   - Include: date, time, location, service details
   ```

3. **Confirmation emails sent:**
   ```typescript
   // amplify/functions/notifications/handler.ts
   - Model: "Booking confirmed - see you on [date]!"
   - Professional: "Booking confirmed with [model name]"
   ```

4. **Notifications:**
   - ✅ Model: In-app notification
   - ✅ Professional: In-app notification

### **Next:** Pre-session reminders

---

## 7️⃣ PRE-SESSION (Reminders & Prep)

### **Who:** System (EventBridge scheduled)
### **Where:** Automated
### **Status:** `Booking.status = 'confirmed'`

### **Steps:**

1. **24 hours before appointment:**
   ```typescript
   // EventBridge scheduled rule: Every hour
   // Query bookings where:
   //   appointmentDate = tomorrow
   //   reminderSent = false
   
   For each booking:
     - Send reminder email to model
     - Send reminder email to professional
     - Send SMS (if enabled)
     - Update Booking.reminderSent = true
   ```

2. **Reminder content:**
   - Date & time
   - Location
   - Service type
   - Professional/Model contact info
   - Preparation instructions (if any)

3. **Day of appointment:**
   - Final reminder (optional)
   - Check-in notification

### **Next:** Session day

---

## 8️⃣ SESSION COMPLETION

### **Who:** Professional
### **Where:** `/portal/bookings/:bookingId/complete`
### **Status:** `Booking.status = 'completed'`

### **Steps:**

1. **Professional marks session complete:**
   - Goes to booking details
   - Clicks "Mark Session Complete"
   - Optionally uploads after photos

2. **Booking updated:**
   ```typescript
   Booking {
     status: 'completed',
     afterPhotos: string[], // S3 URLs
     completedAt: now(),
   }
   ```

3. **Notifications:**
   - ✅ Model: "Session completed - please leave feedback!"
   - ✅ Professional: "Session marked complete"

4. **Feedback requests sent:**
   - Model: "How was your experience?"
   - Professional: "Rate this model"

### **Next:** Feedback & ratings

---

## 9️⃣ FEEDBACK & RATINGS

### **Who:** Model & Professional
### **Where:** `/portal/feedback` or `/model-portal/feedback`
### **Status:** `Booking.status = 'completed'`

### **Steps:**

1. **Model feedback:**
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

2. **Professional feedback:**
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

3. **Agentic scores updated:**
   ```typescript
   // Update model's agentic learning scores
   - Reliability score (if punctuality feedback)
   - Feedback score (average ratings)
   - Experience score (booking count)
   - Compatibility score (success rate)
   ```

4. **Notifications:**
   - ✅ Model: "Thank you for your feedback!"
   - ✅ Professional: "Feedback received"

### **Next:** Post-session analytics

---

## 🔟 POST-SESSION (Analytics & Updates)

### **Who:** System
### **Where:** Automated
### **Status:** `Booking.status = 'completed'`

### **Steps:**

1. **Analytics updated:**
   - Booking count
   - Revenue metrics
   - Success rates
   - Model performance scores

2. **Model profile updated:**
   - Booking history
   - Average ratings
   - Agentic scores

3. **Professional profile updated:**
   - Booking history
   - Model ratings
   - Success metrics

4. **Admin dashboard updated:**
   - Completed bookings count
   - Revenue totals
   - Performance metrics

---

## 📊 Status Flow Summary

### **ModelRequest Status:**
```
pending → matching → matched → booked → completed → cancelled
```

### **Match Status:**
```
pending → approved → sent → accepted/declined → expired/waitlist
```

### **Booking Status:**
```
confirmed → completed → cancelled → no_show
```

### **Payment Status:**
```
pending → paid → refunded → failed
```

---

## 🔔 Notification Timeline

| Event | Who Notified | Method | Template |
|-------|-------------|--------|----------|
| Request created | Professional | Email, In-app | `request_created` |
| Matches found | Admin | In-app | `matches_ready` |
| Match sent | Model | Email, SMS, In-app | `match_opportunity` |
| Match accepted | Professional, Admin | Email, In-app | `match_accepted` |
| Payment required | Model | Email, In-app | `payment_required` |
| Payment received | Professional, Admin | Email, In-app | `payment_received` |
| Booking confirmed | Model, Professional | Email, In-app | `booking_confirmed` |
| 24h reminder | Model, Professional | Email, SMS | `booking_reminder` |
| Session complete | Model | Email, In-app | `feedback_request_model` |
| Feedback received | Professional | Email, In-app | `feedback_thank_you` |

---

## 🎯 Key Workflow States

### **Request States:**
- `pending`: Just created, waiting for matching
- `matching`: Matching engine running
- `matched`: Matches found and sent
- `booked`: Booking confirmed
- `completed`: Session done
- `cancelled`: Request cancelled

### **Match States:**
- `pending`: Created but not approved
- `approved`: Admin approved, ready to send
- `sent`: Sent to model
- `accepted`: Model accepted
- `declined`: Model declined
- `expired`: Time limit passed
- `waitlist`: Booking taken, on waitlist

### **Booking States:**
- `confirmed`: Payment received, confirmed
- `completed`: Session finished
- `cancelled`: Cancelled before session
- `no_show`: Model didn't show up

---

## 🚀 Automation Opportunities

### **Current (Manual):**
- ❌ Matching triggered manually
- ❌ Match approval manual
- ❌ Payment reminders not automated
- ❌ Booking reminders not automated

### **Future (EventBridge/Step Functions):**
- ✅ Automatic matching on request creation
- ✅ Automatic match approval (if score > threshold)
- ✅ Scheduled payment reminders (EventBridge)
- ✅ Scheduled booking reminders (EventBridge)
- ✅ Workflow orchestration (Step Functions)

---

## 📝 Implementation Notes

### **Current Implementation:**
- Request creation: ✅ Working
- Matching engine: ✅ Working
- Match approval: ✅ Manual (admin)
- Model acceptance: ✅ Working
- Payment: ✅ Stripe integration
- Booking creation: ✅ Working
- Reminders: ❌ Not automated
- Feedback: ✅ Working

### **Next Steps:**
1. Add EventBridge for scheduled reminders
2. Add Step Functions for workflow orchestration
3. Implement auto-save for request drafts
4. Add workflow state tracking UI
5. Implement smart defaults

---

**Last Updated:** January 6, 2026  
**Status:** Active Documentation

