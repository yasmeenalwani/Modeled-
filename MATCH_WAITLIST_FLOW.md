# Match & Waitlist Flow - Clarified

**Date:** January 6, 2026  
**Status:** Confirmed Flow

---

## 🎯 Match Status Flow

### **Statuses:**
1. `pending` → Match created, not yet sent to model
2. `approved` → Admin approved, ready to send
3. `sent` → Sent to model (notification sent)
4. `accepted` → Model accepted match
5. `declined` → Model declined match
6. `booked` → Payment received, booking confirmed
7. `waitlist` → Not booked, on waitlist (max 25 people)
8. `for_grabs` → Not booked, not waitlist, available in platform

---

## 💰 Payment Flow

### **Professional Payment:**
- ✅ Pro **MUST pay** booking fee to **initiate request**
- ✅ Request **doesn't send** to matching unless paid
- ❌ No payment reminders needed for pros (payment required upfront)

### **Model Payment:**
- ✅ Model **MUST pay** booking fee to **confirm booking**
- ✅ Match status changes to `booked` only after payment
- ✅ Payment reminders sent if model accepts but doesn't pay

---

## 🎯 Double Booking Logic

### **First Come, First Served:**
- ✅ **First model to pay** gets the booking slot
- ✅ Status changes to `booked`
- ✅ **Second model** (and subsequent) automatically go to `waitlist`
- ✅ Waitlist max: **25 people**

### **Waitlist Usage:**
- ✅ If first model cancels → Next person on waitlist gets notified
- ✅ They can then pay to claim the booking
- ✅ Process continues down waitlist

### **For Grabs:**
- ✅ If not booked and not on waitlist → Available "for grabs" in platform
- ✅ Other models can see and book it
- ✅ First to pay gets it

---

## 📊 Flow Diagram

```
Request Created (Pro paid)
   ↓
Admin Reviews → Runs Matching
   ↓
Matches Created (status: 'pending')
   ↓
Admin Approves → Sends to Models (status: 'sent')
   ↓
Model Accepts (status: 'accepted')
   ↓
Model Pays?
   ├─ YES → Booking Confirmed (status: 'booked')
   │         └─ Other matches for same request → 'waitlist'
   │
   └─ NO → Payment Reminders Sent
            └─ If another model pays first → This match → 'waitlist'
            └─ If waitlist full (25) → This match → 'for_grabs'
```

---

## 🔔 Payment Reminders (Models Only)

### **When to Send:**
- ✅ After model accepts match (`status = 'accepted'`)
- ✅ If payment not received within 24 hours
- ✅ Frequency: Every 6 hours until paid or booking taken

### **Reminder Logic:**
```typescript
// EventBridge: Run every 6 hours
Query matches where:
  - status = 'accepted'
  - paymentStatus = 'pending'
  - acceptedAt < 24 hours ago
  - bookingId = null (not yet booked)

For each match:
  - Check if request is still available
  - If another model booked → Move to 'waitlist'
  - If waitlist full → Move to 'for_grabs'
  - Otherwise → Send payment reminder
```

---

## 📋 Waitlist Management

### **Waitlist Rules:**
- ✅ Max 25 people per request
- ✅ First come, first served (by acceptance time)
- ✅ If first model cancels → Notify next on waitlist
- ✅ If waitlist full → New accepts go to 'for_grabs'

### **Waitlist Notification:**
```typescript
// When first model cancels
1. Find next person on waitlist (sorted by acceptedAt)
2. Update their match status: 'waitlist' → 'accepted'
3. Send notification: "A spot opened up! Pay now to claim it."
4. Start payment reminder timer (24 hours)
```

---

## 🎯 Status Transitions

### **Match Status Flow:**
```
pending → approved → sent → accepted → booked
                              ↓
                         declined
                              ↓
                         waitlist (if another booked)
                              ↓
                         for_grabs (if waitlist full)
```

### **When Status Changes:**
- `pending` → `approved`: Admin approves
- `approved` → `sent`: Admin sends to model
- `sent` → `accepted`: Model accepts
- `sent` → `declined`: Model declines
- `accepted` → `booked`: Model pays
- `accepted` → `waitlist`: Another model pays first
- `accepted` → `for_grabs`: Waitlist full, not booked
- `waitlist` → `accepted`: First model cancels, spot opens

---

## ✅ Confirmed Rules

1. ✅ **Pro must pay** before request is sent to matching
2. ✅ **Model must pay** to confirm booking
3. ✅ **First to pay** gets booking slot
4. ✅ **Second+ models** automatically go to waitlist
5. ✅ **Waitlist max: 25 people**
6. ✅ **If waitlist full** → New accepts go to 'for_grabs'
7. ✅ **If first cancels** → Next on waitlist gets notified
8. ✅ **Payment reminders** only for models (after acceptance)

---

**Status:** Ready for Implementation  
**Next:** EventBridge setup

