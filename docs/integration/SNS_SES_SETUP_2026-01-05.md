# SNS & SES Setup Guide 📧📱

## Overview

Amazon SES (Simple Email Service) and SNS (Simple Notification Service) are now integrated for automated notifications:
- **SES**: Sends beautiful HTML emails (booking confirmations, reminders, etc.)
- **SNS**: Sends SMS/text messages to users' phones

---

## 🚀 Setup Steps

### 1. **Verify Your Email Domain (SES)**

SES starts in "Sandbox Mode" - you can only send to verified emails.

#### Option A: Verify Individual Email (Quick Start)
1. Go to AWS Console → **SES** → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter your email (e.g., `noreply@modeledmanagement.com`)
5. Check your email and click the verification link
6. Update `amplify/functions/notifications/resource.ts`:
   ```typescript
   FROM_EMAIL: 'noreply@modeledmanagement.com',
   ```

#### Option B: Verify Domain (Production)
1. Go to AWS Console → **SES** → **Verified identities**
2. Click **Create identity** → **Domain**
3. Enter your domain (e.g., `modeledmanagement.com`)
4. Add the DNS records provided by AWS to your domain
5. Wait for verification (can take 24-48 hours)

#### Request Production Access (Remove Sandbox)
1. Go to AWS Console → **SES** → **Account dashboard**
2. Click **Request production access**
3. Fill out the form:
   - Use case: Transactional emails (booking confirmations, reminders)
   - Website URL: Your app URL
   - Describe your use case
4. Wait for approval (usually 24-48 hours)

---

### 2. **Set Up SMS (SNS)**

SNS SMS has some requirements:

#### Option A: Enable SMS in Sandbox (Free Tier)
- SMS is available immediately in sandbox mode
- Limited to 100 SMS/day (free tier)
- No verification needed for receiving

#### Option B: Request SMS Spending Limit (Production)
1. Go to AWS Console → **SNS** → **Text messaging (SMS)**
2. Click **Edit** on **Account preferences**
3. Set **Default maximum spending limit** (e.g., $10/month)
4. Click **Save**

**Note**: SMS pricing varies by country:
- US: ~$0.00645 per SMS
- International: Varies (check AWS pricing)

---

### 3. **Update Lambda Environment Variables**

After verifying your email, update `amplify/functions/notifications/resource.ts`:

```typescript
environment: {
  SES_REGION: 'us-east-1',
  FROM_EMAIL: 'noreply@yourdomain.com', // Your verified email
  FROM_NAME: 'Modeled Management',
  SNS_REGION: 'us-east-1',
},
```

---

### 4. **Deploy**

```bash
npx ampx sandbox
```

This will:
- Deploy the notifications Lambda function
- Set up IAM permissions for SES and SNS
- Configure the function with your environment variables

---

## 📧 Email Templates

The following email templates are available:

### 1. **Booking Confirmation**
- Sent when a booking is confirmed
- Includes: Service, date, time, location, payment link
- Template: `booking_confirmation`

### 2. **Booking Reminder**
- Sent 24 hours before appointment
- Includes: Service, date, time, location
- Template: `booking_reminder`

### 3. **Match Notification**
- Sent when a new match is found
- Includes: Service, date, match score, booking link
- Template: `match_notification`

### 4. **Payment Reminder**
- Sent when payment is required
- Includes: Amount, service, payment link
- Template: `payment_reminder`

---

## 📱 SMS Templates

SMS messages are shorter versions of emails:

- **Booking Confirmation**: `🍒 Modeled: Booking confirmed! [Service] on [Date] at [Time]...`
- **Booking Reminder**: `⏰ Modeled: Reminder - Your [Service] appointment is tomorrow...`
- **Match Notification**: `🎉 Modeled: New match! [Service] on [Date]...`
- **Payment Reminder**: `💳 Modeled: Payment required ($[Amount]) for [Service]...`

---

## 💻 Usage Examples

### Send Booking Confirmation (Email + SMS)

```javascript
import { sendBookingConfirmation } from '../utils/notifications';

await sendBookingConfirmation(
  {
    id: 'booking-123',
    serviceType: 'Highlights',
    appointmentDate: 'Dec 15, 2024',
    appointmentTime: '10:00 AM',
    location: 'Luxe Studio',
    professionalName: 'Sarah Mitchell',
    paymentLink: 'https://app.modeled.com/payment/booking-123',
  },
  {
    email: 'model@example.com',
    phone: '+1234567890',
    name: 'Emma Johnson',
  },
  {
    sendEmail: true,
    sendSMS: true, // Also send SMS
  }
);
```

### Using the React Hook

```javascript
import { useNotifications } from '../hooks/useNotifications';

function BookingComponent() {
  const { sendBookingConfirmation, loading, error } = useNotifications();

  const handleConfirm = async () => {
    try {
      await sendBookingConfirmation(booking, recipient, { sendEmail: true, sendSMS: true });
      alert('Confirmation sent!');
    } catch (err) {
      alert('Failed to send: ' + err.message);
    }
  };

  return (
    <button onClick={handleConfirm} disabled={loading}>
      {loading ? 'Sending...' : 'Confirm Booking'}
    </button>
  );
}
```

---

## 🔧 Integration Points

### When to Send Notifications

| Event | Notification | Type |
|-------|-------------|------|
| Booking confirmed | `booking_confirmation` | Email + SMS |
| 24h before appointment | `booking_reminder` | Email + SMS |
| New match found | `match_notification` | Email |
| Payment required | `payment_reminder` | Email |
| Booking cancelled | (custom) | Email |

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

**Example Costs**:
- 1,000 booking confirmations/month = **$0.10** (email) + **$6.45** (SMS) = **$6.55/month**

---

## 🔒 Security & Best Practices

1. **Verify Email Domain**: Use a verified domain for production
2. **Rate Limiting**: SES has sending limits (start at 1 email/second)
3. **Bounce Handling**: Monitor bounces and complaints
4. **SMS Opt-Out**: Users can reply "STOP" to opt out (handled automatically by SNS)
5. **Phone Number Format**: Always format as `+1XXXXXXXXXX` for US numbers

---

## 🧪 Testing

### Test Email
1. Verify your test email in SES
2. Send a test notification:
   ```javascript
   await sendBookingConfirmation(testBooking, { email: 'your-test@email.com', name: 'Test' });
   ```
3. Check your inbox!

### Test SMS
1. Use a real phone number (format: `+1234567890`)
2. Send a test notification:
   ```javascript
   await sendBookingConfirmation(testBooking, { phone: '+1234567890', name: 'Test' }, { sendSMS: true });
   ```
3. Check your phone!

---

## 🆘 Troubleshooting

### "Email address not verified"
- **Solution**: Verify your email in SES Console
- Or verify your domain for production

### "SMS sending failed"
- **Solution**: Check phone number format (must start with `+`)
- Verify SMS spending limit is set in SNS

### "Rate limit exceeded"
- **Solution**: SES starts with 1 email/second limit
- Request limit increase in SES Console → **Sending limits**

### "Bounce rate too high"
- **Solution**: Clean your email list
- Remove invalid email addresses
- Monitor bounce rate in SES Console

---

## 📚 Resources

- [SES Documentation](https://docs.aws.amazon.com/ses/)
- [SNS Documentation](https://docs.aws.amazon.com/sns/)
- [SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SNS Pricing](https://aws.amazon.com/sns/pricing/)

---

## ✅ Next Steps

1. ✅ Verify email in SES
2. ✅ Set SMS spending limit in SNS
3. ✅ Update FROM_EMAIL in Lambda config
4. ✅ Deploy (`npx ampx sandbox`)
5. ✅ Test with your email/phone
6. ⏳ Request production access (when ready)
7. ⏳ Set up bounce/complaint handling (optional)

---

**Questions?** Check AWS CloudWatch logs for detailed error messages from the Lambda function.

