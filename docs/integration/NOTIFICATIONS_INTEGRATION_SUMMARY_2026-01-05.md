# ✅ SNS & SES Integration - Complete! 📧📱

## What's Been Built

### ✅ Backend (AWS Lambda)
- **Lambda Function**: `amplify/functions/notifications/`
  - Sends emails via SES (Amazon Simple Email Service)
  - Sends SMS via SNS (Amazon Simple Notification Service)
  - Beautiful HTML email templates
  - Concise SMS templates
- **Email Templates**:
  - Booking confirmation
  - Booking reminder (24h before)
  - Match notification
  - Payment reminder
- **SMS Templates**: Short versions of all email templates

### ✅ Frontend (React)
- **Notification Utilities**: `src/utils/notifications.js`
  - `sendNotification()` - Generic notification sender
  - `sendBookingConfirmation()` - Booking confirmations
  - `sendBookingReminder()` - Appointment reminders
  - `sendMatchNotification()` - New match alerts
  - `sendPaymentReminder()` - Payment reminders
- **React Hook**: `src/hooks/useNotifications.js`
  - Easy-to-use hook for components
  - Loading and error states
- **UI Component**: `src/components/SendNotificationButton.jsx`
  - Reusable button for sending notifications
  - Visual feedback (loading, success)

### ✅ Integration Points
- Ready to integrate into:
  - Booking confirmation flow
  - Match notification system
  - Payment reminders
  - Admin dashboard actions

---

## 🚀 Next Steps to Go Live

### 1. **Verify Email in SES**
1. Go to AWS Console → **SES** → **Verified identities**
2. Click **Create identity** → **Email address**
3. Enter your email (e.g., `noreply@modeledmanagement.com`)
4. Check email and click verification link
5. Update `amplify/functions/notifications/resource.ts`:
   ```typescript
   FROM_EMAIL: 'noreply@modeledmanagement.com',
   ```

### 2. **Set SMS Spending Limit**
1. Go to AWS Console → **SNS** → **Text messaging (SMS)**
2. Click **Edit** on **Account preferences**
3. Set spending limit (e.g., $10/month)
4. Click **Save**

### 3. **Deploy**
```bash
npx ampx sandbox
```

### 4. **Test**
```javascript
import { sendBookingConfirmation } from './utils/notifications';

await sendBookingConfirmation(
  booking,
  { email: 'test@example.com', phone: '+1234567890', name: 'Test User' },
  { sendEmail: true, sendSMS: true }
);
```

---

## 📁 Files Created/Modified

### New Files
- `amplify/functions/notifications/resource.ts`
- `amplify/functions/notifications/handler.ts`
- `amplify/functions/notifications/package.json`
- `src/utils/notifications.js`
- `src/hooks/useNotifications.js`
- `src/components/SendNotificationButton.jsx`
- `SNS_SES_SETUP.md`

### Modified Files
- `amplify/backend.ts` - Added notifications function

---

## 💰 Pricing

### SES (Email)
- **Free Tier**: 62,000 emails/month (if using EC2)
- **After Free Tier**: $0.10 per 1,000 emails
- **Very affordable** for transactional emails

### SNS (SMS)
- **US**: ~$0.00645 per SMS
- **International**: Varies by country
- **Free Tier**: 100 SMS/month (first 12 months)

**Example Monthly Cost**:
- 1,000 booking confirmations = **$0.10** (email) + **$6.45** (SMS) = **$6.55/month**

---

## 📧 Available Templates

| Template | When to Use | Email | SMS |
|----------|-------------|-------|-----|
| `booking_confirmation` | Booking confirmed | ✅ | ✅ |
| `booking_reminder` | 24h before appointment | ✅ | ✅ |
| `match_notification` | New match found | ✅ | ✅ |
| `payment_reminder` | Payment required | ✅ | ✅ |

---

## 💻 Usage Examples

### In a Component
```javascript
import { useNotifications } from '../hooks/useNotifications';

function BookingComponent() {
  const { sendBookingConfirmation, loading } = useNotifications();

  const handleConfirm = async () => {
    await sendBookingConfirmation(
      booking,
      { email: 'user@example.com', phone: '+1234567890', name: 'User Name' },
      { sendEmail: true, sendSMS: true }
    );
  };
}
```

### Using the Button Component
```javascript
import SendNotificationButton from '../components/SendNotificationButton';

<SendNotificationButton
  template="booking_confirmation"
  recipient={{ email: 'user@example.com', name: 'User' }}
  data={bookingData}
  options={{ sendEmail: true, sendSMS: false }}
  buttonText="Send Confirmation"
  onSuccess={() => alert('Sent!')}
/>
```

---

## 🔧 Integration Points

### When to Send Notifications

1. **Booking Confirmed**
   - After payment is processed
   - Send to both model and professional
   - Include payment link if needed

2. **24 Hours Before Appointment**
   - Automated reminder
   - Send to both parties
   - Include location and time

3. **New Match Found**
   - When match is created
   - Send to model
   - Include booking link

4. **Payment Required**
   - When booking needs payment
   - Send to model
   - Include payment link

---

## 🧪 Testing

### Test Email
1. Verify your email in SES
2. Send test notification
3. Check inbox

### Test SMS
1. Use real phone number (`+1234567890`)
2. Send test notification
3. Check phone

---

## 📚 Documentation

See `SNS_SES_SETUP.md` for:
- Detailed setup instructions
- Email domain verification
- SMS configuration
- Troubleshooting
- Best practices

---

## ✅ Status

**Ready for configuration and deployment!**

1. ✅ Lambda function created
2. ✅ Email templates built
3. ✅ SMS templates built
4. ✅ Frontend utilities created
5. ✅ React hook created
6. ⏳ Verify email in SES
7. ⏳ Set SMS spending limit
8. ⏳ Deploy and test

---

**Next**: Follow `SNS_SES_SETUP.md` to configure and deploy! 🚀

