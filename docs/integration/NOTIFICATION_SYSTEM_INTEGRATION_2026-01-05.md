# Notification System Integration Guide
## Portal-First Notifications with Email Backup

**Last Updated:** December 2024  
**Status:** ✅ Ready for Implementation

---

## 🎯 Overview

The notification system is designed with **portal notifications as primary** and **email as backup**. Models see notifications in their portal first, with email sent for important updates.

---

## 📋 Workflow: Accept → Pay → Approved → Calendar Invite

### **Step 1: Model Accepts Opportunity**

**Portal Notification:**
```javascript
await createNotificationWithEmail({
  userId: model.userId,
  userType: 'model',
  type: 'match_opportunity',
  title: 'New opportunity!',
  message: `${professionalName} is looking for a model for ${serviceType} on ${date} at ${time}. You'd earn $${amount}.`,
  actions: [
    { label: 'View Details', action: 'view', primary: true },
    { label: 'Accept', action: 'accept', primary: true },
    { label: 'Decline', action: 'decline', primary: false },
  ],
  data: { serviceType, professionalName, date, time, amount, opportunityId },
  sendEmail: true, // Backup email
  recipient: { email: model.email, name: model.firstName },
});
```

**What happens:**
- ✅ Portal notification created in DynamoDB
- ✅ Email sent (backup)
- ✅ Model sees notification in portal
- ✅ Model clicks "Accept"

---

### **Step 2: Model Pays Fee**

**Portal Notification:**
```javascript
await createNotificationWithEmail({
  userId: model.userId,
  userType: 'model',
  type: 'payment_required',
  title: 'Payment required',
  message: `Complete your booking by paying the model search fee ($${amount}).`,
  actions: [
    { label: 'Pay Now', action: 'pay', primary: true },
  ],
  data: { amount, bookingId, paymentLink },
  sendEmail: true,
  recipient: { email: model.email, name: model.firstName },
});
```

**What happens:**
- ✅ Portal notification created
- ✅ Email sent with payment link
- ✅ Model redirected to payment page
- ✅ Model completes payment via Stripe

---

### **Step 3: Payment Confirmed → Booking Approved**

**Portal Notification:**
```javascript
await createNotificationWithEmail({
  userId: model.userId,
  userType: 'model',
  type: 'booking_confirmed',
  title: 'Booking confirmed!',
  message: `Your booking with ${professionalName} is confirmed for ${date} at ${time}. Calendar invite sent to your email.`,
  actions: [
    { label: 'View Details', action: 'view', primary: true },
    { label: 'Add to Calendar', action: 'calendar', primary: false },
  ],
  data: { serviceType, professionalName, date, time, location, bookingId },
  sendEmail: true, // WITH CALENDAR INVITE
  recipient: { email: model.email, name: model.firstName },
});
```

**What happens:**
- ✅ Portal notification created
- ✅ Email sent WITH .ics calendar invite attached
- ✅ Booking status updated to 'confirmed'
- ✅ Model can add to calendar

---

### **Step 4: 24-Hour Reminder**

**Portal Notification:**
```javascript
await createNotificationWithEmail({
  userId: model.userId,
  userType: 'model',
  type: 'booking_reminder',
  title: 'Reminder: Booking tomorrow!',
  message: `Your booking with ${professionalName} is tomorrow at ${time}.`,
  actions: [
    { label: 'View Details', action: 'view', primary: true },
  ],
  data: { serviceType, professionalName, date, time, location },
  sendEmail: true,
  recipient: { email: model.email, name: model.firstName },
});
```

**What happens:**
- ✅ Portal notification created
- ✅ Email reminder sent
- ✅ SMS sent (if opted in)

---

## 🔧 Implementation Details

### **1. Notification Model (DynamoDB)**

```typescript
Notification {
  userId: string (required)
  userType: 'model' | 'professional' | 'partner' | 'admin'
  type: string (e.g., 'match_opportunity', 'payment_required')
  title: string
  message: string
  read: boolean (default: false)
  actions: JSON array [{label, action, primary}]
  data: JSON object (notification-specific data)
  createdAt: datetime
}
```

### **2. Portal Notification Component**

**Location:** `src/components/PortalNotifications.jsx`

**Features:**
- Real-time notification display
- Unread count badge
- Action buttons (Accept, Pay, View, etc.)
- Mark as read on click
- Auto-refresh every 30 seconds

**Usage:**
```jsx
import PortalNotifications from '../components/PortalNotifications';

<PortalNotifications 
  userId={user.userId} 
  userType="model" 
/>
```

### **3. Notification Creation Utility**

**Location:** `src/utils/createNotification.js`

**Functions:**
- `createNotification()` - Create portal notification only
- `createNotificationWithEmail()` - Create notification + send email
- `NotificationTemplates` - Pre-built templates

**Example:**
```javascript
import { createNotificationWithEmail, NotificationTemplates } from '../utils/createNotification';

// Using template
const notification = await createNotificationWithEmail(
  NotificationTemplates.matchOpportunity(userId, {
    professionalName: 'Sarah M.',
    serviceType: 'Blonde Balayage',
    appointmentDate: 'Dec 15',
    appointmentTime: '2:00 PM',
    amount: 30,
  })
);
```

### **4. Email Templates (SES)**

**Location:** `amplify/functions/notifications/handler.ts`

**Templates:**
- `match_opportunity` - New opportunity email
- `payment_required` - Payment required email
- `booking_confirmed` - Booking confirmed with calendar invite
- `booking_reminder` - 24-hour reminder

**Calendar Invite:**
- Automatically generated for `booking_confirmed` template
- Attached as .ics file to email
- Includes all booking details
- Includes 24-hour reminder alarm

---

## 📍 Where to Integrate

### **1. When Admin Approves Match**

**File:** `src/admin/pages/MatchingPage.jsx` (or wherever matches are approved)

```javascript
import { createNotificationWithEmail, NotificationTemplates } from '../../utils/createNotification';

// After approving match
await createNotificationWithEmail(
  NotificationTemplates.matchOpportunity(model.userId, {
    professionalName: professional.firstName + ' ' + professional.lastName,
    serviceType: request.serviceType,
    appointmentDate: request.requestedDate,
    appointmentTime: request.requestedTime,
    amount: request.modelPayment,
    opportunityId: match.id,
  })
);
```

### **2. When Model Accepts Opportunity**

**File:** `src/portal/model-pages/OpportunitiesPage.jsx` (or wherever accept happens)

```javascript
// After model clicks "Accept"
await createNotificationWithEmail(
  NotificationTemplates.paymentRequired(model.userId, {
    amount: opportunity.modelFee,
    bookingId: booking.id,
    paymentLink: `/model-portal/payment?booking=${booking.id}`,
  })
);
```

### **3. When Payment is Confirmed**

**File:** `amplify/functions/stripe-payment/handler.ts` (or payment webhook)

```javascript
import { createNotificationWithEmail, NotificationTemplates } from '../../utils/createNotification';

// After Stripe confirms payment
await createNotificationWithEmail(
  NotificationTemplates.bookingConfirmed(model.userId, {
    serviceType: booking.serviceType,
    professionalName: professional.firstName + ' ' + professional.lastName,
    appointmentDate: booking.appointmentDate,
    appointmentTime: booking.appointmentTime,
    location: booking.location,
    bookingId: booking.id,
  })
);
```

### **4. 24 Hours Before Appointment**

**File:** `amplify/functions/notifications/handler.ts` (scheduled Lambda or EventBridge)

```javascript
// Scheduled to run daily, check for appointments 24h away
const bookings = await getBookings24HoursAway();

for (const booking of bookings) {
  await createNotificationWithEmail(
    NotificationTemplates.bookingReminder(booking.modelId, {
      serviceType: booking.serviceType,
      professionalName: booking.professionalName,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      location: booking.location,
    })
  );
}
```

---

## 🎨 Portal Integration

### **Add Notification Bell to Portal Layout**

**File:** `src/portal/ModelPortalLayout.jsx`

```jsx
import { useState } from 'react';
import PortalNotifications from '../components/PortalNotifications';

// In the header/navbar area
const [showNotifications, setShowNotifications] = useState(false);

<div style={{ position: 'relative' }}>
  <button onClick={() => setShowNotifications(!showNotifications)}>
    🔔 Notifications
    {unreadCount > 0 && <span>{unreadCount}</span>}
  </button>
  
  {showNotifications && (
    <PortalNotifications 
      userId={user.userId} 
      userType="model" 
    />
  )}
</div>
```

---

## ✅ Checklist

- [x] Notification model added to schema
- [x] Portal notification component created
- [x] Notification creation utility created
- [x] Email templates updated (no AI references)
- [x] Calendar invite generation added
- [ ] Integrate into admin match approval
- [ ] Integrate into model accept flow
- [ ] Integrate into payment confirmation
- [ ] Add notification bell to portal layout
- [ ] Set up 24-hour reminder scheduler
- [ ] Test complete workflow

---

## 🚀 Next Steps

1. **Add notification bell to portal** - Update `ModelPortalLayout.jsx`
2. **Integrate into workflows** - Add notification creation at each step
3. **Test the flow** - Accept → Pay → Approved → Calendar Invite
4. **Set up scheduler** - For 24-hour reminders

---

**All messaging is now simplified (no AI references) and portal-first!** 🎉

