# 🔄 Complete Professional Workflow

## The Full Flow: Request → Match → Acceptance → Confirmation

### Step 1: Professional Creates Request
**Who:** Professional  
**Action:** Creates a request for a model (e.g., "Need blonde model for balayage on Dec 15")  
**Status:** Request → `pending`  
**Location:** `/portal/request`

---

### Step 2: Admin Runs Matching Engine
**Who:** Admin  
**Action:** Runs matching algorithm to find suitable models  
**Status:** Request → `matching`  
**Location:** `/admin/matching`  
**Result:** Matches created with status `pending`

---

### Step 3: Admin Reviews & Approves Matches
**Who:** Admin  
**Action:** Reviews match scores, model profiles, and approves best matches  
**Status:** Match → `approved`  
**Location:** `/admin/match-approval`  
**Note:** Professional can **view** matches but cannot approve (read-only)

---

### Step 4: Admin Sends to Models
**Who:** Admin  
**Action:** Sends approved matches to models  
**Status:** Match → `sent_to_model`  
**Location:** `/admin/match-approval`  
**Result:** Models see opportunity in their "Matched" section

---

### Step 5: Model Accepts
**Who:** Model  
**Action:** Accepts the opportunity  
**Status:** Match → `booked`, Request → `booked`, Booking created → `confirmed`  
**Result:** 
- ✅ **Everything is confirmed** for both model and professional
- ✅ Both see confirmed booking in their calendars
- ✅ Chat opens between model and professional
- ✅ Reminders scheduled
- ✅ Admin gets paid

---

### Step 6: Admin Gets Paid
**Who:** Admin/Platform  
**Action:** Payment processed  
**Status:** Booking → `paid`  
**Note:** Professional does not receive payment - this is platform revenue

---

## Status Flow Summary

### Request Statuses:
- `pending` → Just created by professional
- `matching` → Admin running matching engine
- `matched` → Matches found
- `booked` → **Model accepted, everything confirmed**
- `completed` → Session finished
- `cancelled` → Cancelled

### Match Statuses:
- `pending` → Awaiting admin approval
- `approved` → Admin approved, ready to send
- `sent_to_model` → Sent to model, waiting for acceptance
- `rejected` → Admin rejected this match
- `booked` → **Model accepted, booking confirmed**

### Booking Statuses:
- `confirmed` → **Model accepted**
- `paid` → Admin/platform received payment
- `completed` → Session finished
- `cancelled` → Cancelled

---

## Professional's View

### In Request Dashboard (`/portal/requests`):
- See all their requests
- View status (pending, matching, matched, booked, completed)
- Cannot approve matches (admin-only)
- Can view matches but read-only

### In Match Viewing (`/portal/matches`):
- **View-only** - Cannot approve or reject
- See match status:
  - ⏳ **"Awaiting Admin Approval"** - Match pending admin review
  - ✅ **"Approved by Admin"** - Admin approved, waiting to send
  - 📤 **"Sent to Model"** - Waiting for model to accept
  - ✅ **"CONFIRMED (Model Accepted)"** - Model accepted, booking confirmed

### In Calendar/Schedule (`/portal/schedule`):
- Only **confirmed** bookings appear (after model accepts)
- Shows all booking details
- Chat available

---

## Key Differences from Previous Workflow

### ❌ Previous (Incorrect):
- Professional could approve matches
- Payment confirmed the booking
- Professional received payment

### ✅ Correct Workflow:
- **Admin** approves matches (professional view-only)
- **Model acceptance** confirms the booking (not payment)
- **Admin/Platform** gets paid (not professional)

---

## Permission Levels

### Professional:
- ✅ Create requests
- ✅ View their requests
- ✅ View matches (read-only)
- ✅ View confirmed bookings
- ❌ Approve/reject matches (admin-only)
- ❌ Send matches to models (admin-only)
- ❌ Receive payment (admin/platform receives)

### Admin:
- ✅ Run matching engine
- ✅ Approve/reject matches
- ✅ Send matches to models
- ✅ Receive payment from models
- ✅ Manage all requests and bookings

### Model:
- ✅ View matches sent to them
- ✅ Accept/reject opportunities
- ✅ Accept = Confirm booking
- ✅ Pay (payment goes to admin/platform)

---

## Automation Triggers (After Model Accepts)

1. **Booking created** with status `confirmed`
2. **Match updated** to status `booked`
3. **Request updated** to status `booked`
4. **Chat channel activated** between model and professional
5. **Email sent** to professional: "Your request is confirmed!"
6. **Email sent** to model: "Your booking is confirmed!"
7. **Reminders scheduled** (24h before, 1h before)
8. **Calendar events created** for both parties
9. **Payment processed** (model pays → admin/platform receives)

---

**Summary:** Professional creates → Admin matches & approves → Admin sends → Model accepts → Everything confirmed → Admin gets paid.

