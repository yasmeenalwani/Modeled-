# Workflow Clarifications - Pre-EventBridge Implementation

**Date:** January 6, 2026  
**Status:** Questions for Clarification

---

## 💰 Payment Flow Clarifications

### **Professional Payment:**
- ✅ Pro pays booking fee to **initiate request**
- ❓ **Question:** When should we send payment reminders to pros?
  - If payment is pending for X hours?
  - If request is created but payment not received?
  - How long should we wait before first reminder?

### **Model Payment:**
- ✅ Model pays booking fee to **get appointment confirmed**
- ❓ **Question:** When should we send payment reminders to models?
  - After match is accepted but payment not received?
  - How long after accepting match before first reminder?
  - Every 6 hours until paid?

### **Payment Status Flow:**
- ❓ **Question:** What are the payment statuses?
  - `pending` → `paid` → `confirmed`?
  - Or `pending` → `paid` (and booking is confirmed)?
  - What happens if payment fails?

---

## 💬 Chat Structure Clarifications

### **Current Understanding:**
1. **Pro ↔ Modeled Chat:**
   - Opens: 24 hours before appointment
   - Closes: 30 minutes after appointment
   - Participants: Professional + Modeled (admin/support)

2. **Model ↔ Modeled Chat:**
   - Opens: 24 hours before appointment
   - Closes: 30 minutes after appointment
   - Participants: Model + Modeled (admin/support)

3. **Pro ↔ Model Chat:**
   - Opens: 1 hour before appointment
   - Closes: 30 minutes after appointment
   - Participants: Professional + Model

### **Questions:**
- ❓ Are these **3 separate chat records** or **1 chat with different visibility**?
- ❓ Should we create `ModelToProChat` (Pro ↔ Model) and separate `ProfessionalToModeledChat` and `ModelToModeledChat`?
- ❓ Or one `ModelToProChat` with different `chatOpensAt`/`chatClosesAt` times for different participants?

---

## 🎯 Match Status Flow Clarifications

### **Current Understanding:**
- Matches **DON'T expire**
- Match statuses:
  - `pending` → Match created, not yet sent to model
  - `approved` → Admin approved, ready to send
  - `sent` → Sent to model
  - `accepted` → Model accepted
  - `declined` → Model declined
  - `booked` → Payment received, booking confirmed
  - `waitlist` → Not booked, on waitlist
  - `for_grabs` → Not booked, not waitlist, available for other models

### **Questions:**
- ❓ When does a match move to `waitlist`?
  - If model declines?
  - If model doesn't respond within X time?
  - If another model books the same request?
  
- ❓ When does a match move to `for_grabs`?
  - If waitlist is full?
  - If request is still open after X time?
  - Automatically or manual admin action?

- ❓ Can multiple models book the same request?
  - Or is it first-come-first-served (one model per request)?

---

## 📅 EventBridge Timing Clarifications

### **Reminders:**
- ✅ Booking reminders: 24 hours before appointment
- ❓ **Payment reminders:** 
  - For pros: When? (after request creation if payment pending?)
  - For models: When? (after match acceptance if payment pending?)
  - Frequency: Every 6 hours? Or different schedule?

### **Chat Activation:**
- ✅ Pro ↔ Modeled: Opens 24h before, closes 30min after
- ✅ Model ↔ Modeled: Opens 24h before, closes 30min after
- ✅ Pro ↔ Model: Opens 1h before, closes 30min after
- ❓ **Question:** Should we create all 3 chats when booking is confirmed, or create them at different times?

---

## 🔔 Notification Clarifications

### **Payment Reminders:**
- ❓ Who gets notified?
  - Pro: Email + SMS? In-app?
  - Model: Email + SMS? In-app?
  - Admin: Should admin be notified of pending payments?

### **Chat Activation:**
- ❓ Who gets notified when chats open?
  - Pro ↔ Modeled: Pro + Admin?
  - Model ↔ Modeled: Model + Admin?
  - Pro ↔ Model: Pro + Model?

---

## 📋 Summary of Questions

1. **Payment Reminders:**
   - When to send first reminder to pros? (after request creation if payment pending?)
   - When to send first reminder to models? (after match acceptance if payment pending?)
   - Frequency: Every 6 hours?

2. **Chat Structure:**
   - 3 separate chat records or 1 chat with different visibility?
   - Should we create `ProfessionalToModeledChat` and `ModelToModeledChat` models?

3. **Match Status Flow:**
   - When does match move to `waitlist`?
   - When does match move to `for_grabs`?
   - Can multiple models book same request?

4. **Chat Creation Timing:**
   - Create all 3 chats when booking confirmed?
   - Or create them at different times (24h before, 1h before)?

5. **Notification Recipients:**
   - Who gets payment reminder notifications?
   - Who gets chat activation notifications?

---

**Status:** Awaiting Clarification  
**Next:** Implement EventBridge after answers

