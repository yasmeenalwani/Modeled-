# ✅ Model Acceptance = Confirmation Flow

## The Rule: **Model Acceptance Confirms the Booking for Everyone**

When a **model accepts** the opportunity, the booking is **automatically confirmed** for:
- ✅ The model
- ✅ The professional
- ✅ The system

**Note:** Payment happens separately - model pays admin/platform, not professional.

---

## Complete Workflow

### 1. Request Creation
**Who:** Professional  
**What:** Creates a request for a model (e.g., "Need blonde model for balayage")  
**Status:** `pending`

### 2. Matching
**Who:** Admin (or auto-matching system)  
**What:** Runs matching engine, finds suitable models  
**Status:** Request → `matching`, Matches → `pending`

### 3. Match Approval
**Who:** Admin or Professional  
**What:** Reviews matches, approves the best ones  
**Action:** "Send to Model"  
**Status:** Match → `sent_to_model` or `approved`

### 4. Model Views Match
**Who:** Model  
**What:** Sees the opportunity in their "Matched" section  
**Action:** Can accept or decline

### 5. ✅ MODEL ACCEPTANCE = CONFIRMATION
**Who:** Model  
**What:** Accepts the opportunity  
**Result:**
- ✅ Booking status → `confirmed`
- ✅ Match status → `booked`
- ✅ Request status → `booked`
- ✅ Both model AND professional see confirmed booking in calendars
- ✅ Chat opens between model and professional
- ✅ Reminders are scheduled
- ✅ Professional is notified: "Your request is confirmed!"

### 6. 💰 PAYMENT (Separate Step)
**Who:** Model  
**What:** Pays for the booking  
**Result:**
- ✅ Payment goes to **admin/platform** (not professional)
- ✅ Booking status → `paid`
- ✅ Admin/platform receives revenue

---

## Status Flow

### Match Statuses:
- `pending` → Admin/Pro needs to review
- `sent_to_model` → Sent to model, waiting for acceptance
- `approved` → Admin approved, ready to send
- `rejected` → Admin rejected this match
- `booked` → **Model accepted, booking confirmed**

### Request Statuses:
- `pending` → Just created
- `matching` → Admin running matching engine
- `matched` → Matches found, awaiting approval/payment
- `booked` → **Model paid, booking confirmed**
- `completed` → Session finished
- `cancelled` → Cancelled by either party

### Booking Statuses:
- `pending` → Created but not paid
- `confirmed` → **Model accepted, booking is confirmed**
- `paid` → Model paid (admin/platform receives)
- `completed` → Session finished
- `cancelled` → Cancelled

---

## Key Points

1. **No confirmation without payment** - Until the model pays, nothing is confirmed
2. **Payment = Commitment** - Once paid, both parties are committed
3. **Calendar visibility** - Confirmed bookings appear in both calendars
4. **Refunds** - Cancellation policies apply after payment
5. **First come, first served** - If multiple models are sent the same opportunity, first to pay gets it

---

## Professional's View

### In Match Viewing Page:
- ⏳ **"Sent to Model"** - Waiting for model to pay
- ✅ **"CONFIRMED (Paid)"** - Model paid, booking is confirmed
- ❌ **"Rejected"** - You rejected this match

### In Request Dashboard:
- 📋 **"Pending"** - Just created
- 🎯 **"Matching"** - Finding models
- 👀 **"Matched"** - Matches found, awaiting approval
- ✅ **"Booked"** - Model paid, confirmed!
- ✅ **"Completed"** - Session finished

### In Calendar:
- Only **confirmed** (paid) bookings appear
- Status badge: "Confirmed"
- Color: Green

---

## Model's View

### In "Matched" Section:
- 🎁 **"New Match!"** - Sent to you, pay to confirm
- 💰 **"Booking: $XX"** - Amount to pay
- 📅 **Date, time, location**
- ✅ **"Book Now"** button → Pay → Confirmed!

### In "Booked" Section:
- Only **paid** (confirmed) bookings appear
- Shows professional details
- Shows session details
- Chat is available

---

## Automation Triggers (After Payment)

1. **Booking created** with status `confirmed`
2. **Match updated** to status `booked`
3. **Request updated** to status `booked`
4. **Chat channel activated** between model and professional
5. **Email sent** to professional: "Your request is confirmed!"
6. **Email sent** to model: "Your booking is confirmed!"
7. **Reminders scheduled** (24h before, 1h before)
8. **Calendar events created** for both parties

---

## Edge Cases

### Multiple Models for Same Slot
- First to pay gets the booking
- Others get "Sorry, this opportunity was booked" message
- Their payment is not processed

### Cancellations
- **Model cancels:** Refund per policy, professional notified
- **Professional cancels:** Model refunded, finds replacement
- **Admin cancels:** Everyone notified, full refunds

### Failed Payments
- Booking not created
- Match stays in `sent_to_model` status
- Model can retry payment

---

**Summary:** Model acceptance is the confirmation. Payment is separate (goes to admin/platform). Model accepts → Everyone sees it as confirmed → Model pays → Admin gets paid.

