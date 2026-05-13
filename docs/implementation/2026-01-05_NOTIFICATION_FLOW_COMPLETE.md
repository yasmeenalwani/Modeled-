# Complete Notification Flow Design
*Created: 2026-01-05*

## 📧 Overview

This document outlines the complete notification system for Modeled Management, covering all user journeys and notification triggers.

---

## 🎯 Notification Types

### **Email Notifications (SES)**
- Welcome emails (Model, Professional, Partner)
- Profile approval/rejection
- Match opportunities
- Booking confirmations
- Booking reminders (24h before)
- Payment required
- Payment reminders
- Booking cancellations
- Booking rescheduled
- Session feedback requests
- Admin notifications

### **SMS Notifications (SNS)** - Optional for MVP
- Critical booking reminders
- Match notifications (if opted in)
- Payment reminders
- Urgent cancellations

---

## 🔄 Complete Notification Flow

### **1. User Onboarding Flow**

#### **Model Onboarding**
```
1. User signs up → Welcome Email
   Template: welcome_model
   Trigger: After Cognito signup
   Data: { name, email, portalLink }

2. Profile submitted → Admin Notification
   Template: admin_new_model_signup
   Trigger: After ModelProfile created
   Recipient: Admin email
   Data: { modelName, email, profileLink }

3. Profile approved → Approval Email
   Template: profile_approved
   Trigger: Admin approves profile
   Data: { name, portalLink }

4. Profile rejected → Rejection Email
   Template: profile_rejected
   Trigger: Admin rejects profile
   Data: { name, reason, resubmitLink }
```

#### **Professional Onboarding**
```
1. User signs up → Welcome Email
   Template: welcome_professional
   Trigger: After Cognito signup
   Data: { name, email, portalLink }

2. Profile submitted → Admin Notification
   Template: admin_new_professional_signup
   Trigger: After Professional created
   Recipient: Admin email
   Data: { professionalName, email, profileLink }

3. Profile approved → Approval Email
   Template: profile_approved
   Trigger: Admin approves profile
   Data: { name, portalLink }

4. Profile rejected → Rejection Email
   Template: profile_rejected
   Trigger: Admin rejects profile
   Data: { name, reason, resubmitLink }
```

#### **Partner Onboarding**
```
1. User signs up → Welcome Email
   Template: welcome_partner
   Trigger: After Cognito signup
   Data: { businessName, contactName, email, portalLink }

2. Profile submitted → Admin Notification
   Template: admin_new_partner_signup
   Trigger: After Partner created
   Recipient: Admin email
   Data: { businessName, contactName, email, profileLink }

3. Profile approved → Approval Email
   Template: profile_approved
   Trigger: Admin approves profile
   Data: { businessName, contactName, portalLink }
```

---

### **2. Matching & Booking Flow**

#### **Match Opportunity**
```
1. Admin runs matching → Match Notification to Model
   Template: match_opportunity
   Trigger: Match created and approved by admin
   Recipient: Model email + SMS (if opted in)
   Data: {
     serviceType,
     professionalName,
     appointmentDate,
     appointmentTime,
     location,
     amount,
     portalLink,
     matchScore
   }
   Priority: High
   Timing: Immediate
```

#### **Model Accepts Match**
```
1. Model accepts → Payment Required Email
   Template: payment_required
   Trigger: Model accepts match
   Data: {
     serviceType,
     professionalName,
     appointmentDate,
     appointmentTime,
     amount,
     paymentLink,
     deadline (24 hours)
   }
   Priority: High
   Timing: Immediate

2. Model accepts → Professional Notification
   Template: professional_match_accepted
   Trigger: Model accepts match
   Recipient: Professional email
   Data: {
     modelName,
     serviceType,
     appointmentDate,
     appointmentTime,
     status: 'pending_payment'
   }
```

#### **Payment Flow**
```
1. Payment completed → Booking Confirmed Email
   Template: booking_confirmed
   Trigger: Stripe webhook confirms payment
   Recipient: Model email + SMS (if opted in)
   Data: {
     bookingId,
     serviceType,
     professionalName,
     professionalPhone,
     appointmentDate,
     appointmentTime,
     location,
     calendarInviteLink,
     portalLink
   }
   Attachments: Calendar invite (.ics file)
   Priority: High
   Timing: Immediate

2. Payment completed → Professional Confirmation
   Template: professional_booking_confirmed
   Trigger: Stripe webhook confirms payment
   Recipient: Professional email
   Data: {
     bookingId,
     modelName,
     modelPhone,
     serviceType,
     appointmentDate,
     appointmentTime,
     location,
     calendarInviteLink,
     portalLink
   }
   Attachments: Calendar invite (.ics file)

3. Payment failed → Payment Failed Email
   Template: payment_failed
   Trigger: Stripe webhook payment failed
   Data: {
     amount,
     reason,
     retryLink
   }
   Priority: High
   Timing: Immediate

4. Payment not completed within 24h → Payment Reminder
   Template: payment_reminder
   Trigger: Scheduled (24h after match acceptance)
   Data: {
     amount,
     deadline,
     paymentLink
   }
   Priority: Medium
   Timing: 24h after acceptance
```

#### **Waitlist Flow**
```
1. Booking taken → Waitlist Notification
   Template: waitlist_notification
   Trigger: Booking confirmed by another model
   Data: {
     serviceType,
     professionalName,
     appointmentDate,
     waitlistPosition,
     portalLink
   }
   Priority: Medium
   Timing: Immediate

2. Waitlist spot opens → Waitlist Opportunity
   Template: waitlist_opportunity
   Trigger: Booking cancelled or payment expired
   Data: {
     serviceType,
     professionalName,
     appointmentDate,
     appointmentTime,
     amount,
     portalLink
   }
   Priority: High
   Timing: Immediate
```

---

### **3. Booking Management Flow**

#### **Booking Reminders**
```
1. 24h Before Appointment → Reminder Email + SMS
   Template: booking_reminder
   Trigger: Scheduled (24h before appointment)
   Recipient: Model email + SMS
   Data: {
     serviceType,
     professionalName,
     appointmentDate,
     appointmentTime,
     location,
     professionalPhone,
     portalLink
   }
   Priority: High
   Timing: 24h before appointment

2. 24h Before Appointment → Professional Reminder
   Template: professional_booking_reminder
   Trigger: Scheduled (24h before appointment)
   Recipient: Professional email
   Data: {
     bookingId,
     modelName,
     modelPhone,
     serviceType,
     appointmentDate,
     appointmentTime,
     location
   }
```

#### **Booking Cancellations**
```
1. Model cancels → Cancellation Email
   Template: booking_cancelled
   Trigger: Model cancels booking
   Recipient: Model email
   Data: {
     bookingId,
     serviceType,
     appointmentDate,
     cancellationReason,
     refundStatus,
     portalLink
   }
   Priority: High
   Timing: Immediate

2. Model cancels → Professional Notification
   Template: professional_booking_cancelled
   Trigger: Model cancels booking
   Recipient: Professional email
   Data: {
     bookingId,
     modelName,
     serviceType,
     appointmentDate,
     cancellationReason
   }

3. Professional cancels → Model Notification
   Template: booking_cancelled_by_professional
   Trigger: Professional cancels booking
   Recipient: Model email + SMS
   Data: {
     bookingId,
     serviceType,
     appointmentDate,
     cancellationReason,
     refundStatus,
     portalLink
   }
```

#### **Booking Rescheduled**
```
1. Booking rescheduled → Reschedule Email
   Template: booking_rescheduled
   Trigger: Booking rescheduled
   Recipient: Model email + SMS
   Data: {
     bookingId,
     serviceType,
     oldDate,
     oldTime,
     newDate,
     newTime,
     reason,
     calendarInviteLink,
     portalLink
   }
   Attachments: Updated calendar invite
   Priority: High
   Timing: Immediate

2. Booking rescheduled → Professional Notification
   Template: professional_booking_rescheduled
   Trigger: Booking rescheduled
   Recipient: Professional email
   Data: {
     bookingId,
     modelName,
     serviceType,
     oldDate,
     oldTime,
     newDate,
     newTime
   }
```

---

### **4. Post-Session Flow**

#### **Feedback Requests**
```
1. Session completed → Feedback Request to Model
   Template: feedback_request_model
   Trigger: Professional marks session complete
   Data: {
     bookingId,
     serviceType,
     professionalName,
     appointmentDate,
     feedbackLink
   }
   Priority: Medium
   Timing: Immediately after completion

2. Session completed → Feedback Request to Professional
   Template: feedback_request_professional
   Trigger: Session marked complete
   Data: {
     bookingId,
     serviceType,
     modelName,
     appointmentDate,
     feedbackLink
   }
   Priority: Medium
   Timing: Immediately after completion

3. Feedback submitted → Thank You Email
   Template: feedback_thank_you
   Trigger: Feedback submitted
   Data: {
     name,
     rating,
     portalLink
   }
   Priority: Low
   Timing: Immediate
```

---

### **5. Admin Notifications**

#### **Admin Alerts**
```
1. New signup → Admin Notification
   Template: admin_new_signup
   Trigger: Any user type signs up
   Recipient: Admin email
   Data: {
     userType,
     name,
     email,
     profileLink,
     reviewLink
   }
   Priority: Medium
   Timing: Immediate

2. Payment issues → Admin Alert
   Template: admin_payment_issue
   Trigger: Payment fails or expires
   Recipient: Admin email
   Data: {
     bookingId,
     modelName,
     amount,
     issue,
     actionLink
   }
   Priority: High
   Timing: Immediate

3. High-value booking → Admin Notification
   Template: admin_high_value_booking
   Trigger: Booking > $500
   Recipient: Admin email
   Data: {
     bookingId,
     modelName,
     professionalName,
     amount,
     serviceType
   }
   Priority: Low
   Timing: Immediate
```

---

## 🔧 Implementation Details

### **Notification Lambda Function**

**Location:** `amplify/functions/notifications/handler.ts`

**Event Structure:**
```typescript
{
  type: 'email' | 'sms' | 'both',
  template: string, // Template name
  recipient: {
    email: string,
    phone?: string,
    name: string
  },
  data: {
    // Template-specific data
    bookingId?: string,
    appointmentDate?: string,
    appointmentTime?: string,
    serviceType?: string,
    professionalName?: string,
    modelName?: string,
    amount?: number,
    portalLink?: string,
    paymentLink?: string,
    calendarInviteLink?: string,
    // ... other fields
  }
}
```

### **Calling the Notification Function**

**From Frontend (via AppSync/API):**
```javascript
// Example: Send booking confirmation
await invoke({
  functionName: 'notifications',
  payload: {
    type: 'email',
    template: 'booking_confirmed',
    recipient: {
      email: model.email,
      name: model.firstName
    },
    data: {
      bookingId: booking.id,
      serviceType: booking.serviceType,
      professionalName: professional.firstName,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      location: booking.location,
      calendarInviteLink: calendarLink,
      portalLink: `https://app.modeledmanagement.com/model-portal/bookings/${booking.id}`
    }
  }
});
```

**From Lambda Functions:**
```typescript
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const lambdaClient = new LambdaClient({ region: 'us-east-1' });

await lambdaClient.send(new InvokeCommand({
  FunctionName: 'notifications',
  Payload: JSON.stringify({
    type: 'email',
    template: 'booking_confirmed',
    recipient: { email, name },
    data: { ... }
  })
}));
```

**From DynamoDB Streams (Automatic):**
- Configure DynamoDB Streams on Booking table
- Lambda function processes stream events
- Automatically sends notifications on status changes

---

## 📋 Notification Triggers Map

| Event | Trigger Location | Template | Recipients |
|-------|-----------------|----------|------------|
| User signs up | Cognito Post-Confirmation Lambda | `welcome_*` | New user |
| Profile submitted | ModelOnboard/ProfessionalOnboard/PartnerOnboard | `admin_new_*_signup` | Admin |
| Profile approved | Admin portal action | `profile_approved` | User |
| Profile rejected | Admin portal action | `profile_rejected` | User |
| Match created | Admin matching page | `match_opportunity` | Model |
| Model accepts | Model portal action | `payment_required` | Model |
| Model accepts | Model portal action | `professional_match_accepted` | Professional |
| Payment completed | Stripe webhook | `booking_confirmed` | Model, Professional |
| Payment failed | Stripe webhook | `payment_failed` | Model |
| Payment expired | Scheduled Lambda | `payment_reminder` | Model |
| Booking cancelled | Booking management | `booking_cancelled` | Model, Professional |
| Booking rescheduled | Booking management | `booking_rescheduled` | Model, Professional |
| 24h before appointment | Scheduled Lambda | `booking_reminder` | Model, Professional |
| Session completed | Professional marks complete | `feedback_request_*` | Model, Professional |
| Feedback submitted | Feedback form | `feedback_thank_you` | User |

---

## ⏰ Scheduled Notifications

### **Booking Reminders (24h before)**
- **Trigger:** EventBridge scheduled rule
- **Frequency:** Every hour
- **Logic:** Query bookings where `appointmentDate = tomorrow` AND `reminderSent = false`
- **Action:** Send reminder, mark `reminderSent = true`

### **Payment Reminders**
- **Trigger:** EventBridge scheduled rule
- **Frequency:** Every 6 hours
- **Logic:** Query matches where `status = 'accepted'` AND `paymentStatus = 'pending'` AND `acceptedAt < 24h ago`
- **Action:** Send payment reminder

### **Waitlist Opportunities**
- **Trigger:** DynamoDB Stream on Booking table
- **Logic:** When booking status changes to 'cancelled' or 'expired'
- **Action:** Notify next waitlist model

---

## 📧 Email Templates

### **Template Categories**

1. **Welcome Emails**
   - `welcome_model`
   - `welcome_professional`
   - `welcome_partner`

2. **Profile Management**
   - `profile_approved`
   - `profile_rejected`
   - `admin_new_model_signup`
   - `admin_new_professional_signup`
   - `admin_new_partner_signup`

3. **Matching & Booking**
   - `match_opportunity`
   - `payment_required`
   - `payment_reminder`
   - `payment_failed`
   - `booking_confirmed`
   - `booking_reminder`
   - `booking_cancelled`
   - `booking_rescheduled`
   - `professional_match_accepted`
   - `professional_booking_confirmed`
   - `professional_booking_reminder`
   - `professional_booking_cancelled`
   - `professional_booking_rescheduled`

4. **Waitlist**
   - `waitlist_notification`
   - `waitlist_opportunity`

5. **Feedback**
   - `feedback_request_model`
   - `feedback_request_professional`
   - `feedback_thank_you`

6. **Admin**
   - `admin_new_signup`
   - `admin_payment_issue`
   - `admin_high_value_booking`

---

## 🔔 SMS Notifications (Optional for MVP)

### **When to Send SMS**
- Critical booking reminders (24h before)
- Urgent cancellations
- Payment reminders (if payment expires soon)
- Waitlist opportunities (time-sensitive)

### **User Preferences**
- Add `smsOptIn` field to user profiles
- Allow users to opt-in/opt-out in portal settings
- Default: Opt-out (email only)

---

## 🎨 Email Design Guidelines

### **Brand Colors**
- Primary: `#8B1E3F` (Cherry)
- Background: `#FFFEF9` (Ivory)
- Text: `#4A2A1A` (Dark Brown)
- Accent: `#5A3A2A` (Muted Brown)

### **Font**
- Body: `"Alike", "Georgia", serif`
- Headers: `"Alike", "Georgia", serif` (larger, bold)

### **Structure**
- Header with logo/brand
- Clear subject line
- Personalized greeting
- Main content with key information
- Call-to-action button
- Footer with contact info and unsubscribe

### **Calendar Invites**
- Generate `.ics` files for booking confirmations
- Store in S3
- Include download link in email
- Future: Attach directly via SendRawEmailCommand

---

## 🚀 Implementation Priority

### **Phase 1: MVP (Critical)**
1. ✅ Welcome emails (all user types)
2. ✅ Profile approval/rejection emails
3. ✅ Match opportunity emails
4. ✅ Payment required emails
5. ✅ Booking confirmation emails
6. ✅ Booking reminder emails (24h before)

### **Phase 2: Post-MVP**
7. Payment reminder emails
8. Booking cancellation emails
9. Booking rescheduled emails
10. Feedback request emails
11. Waitlist notifications

### **Phase 3: Enhanced**
12. SMS notifications (opt-in)
13. Admin notifications
14. Calendar invite attachments
15. Email preferences management

---

## 📝 Next Steps

1. **SES Setup**
   - Verify domain or email address
   - Move out of SES sandbox (if needed)
   - Configure FROM_EMAIL environment variable

2. **Template Implementation**
   - Review and finalize all email templates
   - Test email rendering
   - Add personalization variables

3. **Integration Points**
   - Identify all places in code that need to trigger notifications
   - Create helper functions for common notification calls
   - Set up DynamoDB Streams for automatic triggers

4. **Scheduled Jobs**
   - Set up EventBridge rules for reminders
   - Create Lambda functions for scheduled notifications
   - Test scheduling logic

5. **Testing**
   - Test all email templates
   - Test SMS notifications (if enabled)
   - Test scheduled notifications
   - Test error handling

---

## ❓ Questions for Discussion

1. **SMS Notifications**
   - Should SMS be included in MVP?
   - What's the opt-in strategy?
   - Cost considerations?

2. **Email Frequency**
   - How many emails is too many?
   - Should we batch notifications?
   - Unsubscribe options?

3. **Calendar Invites**
   - Attach directly or link to download?
   - Include in all booking emails?
   - Update on reschedule?

4. **Admin Notifications**
   - Which admin events need notifications?
   - Email or in-app notifications?
   - Notification preferences for admins?

5. **Error Handling**
   - What happens if email fails?
   - Retry logic?
   - Fallback notifications?

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Implementation Discussion

