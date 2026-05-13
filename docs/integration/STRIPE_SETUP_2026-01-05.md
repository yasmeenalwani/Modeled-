# Stripe Payment Integration Setup Guide 🎯

## Overview

Stripe payment processing is now integrated into Modeled Management. This enables:
- **Model Fees**: Models pay a small fee per booking
- **Professional Fees**: Professionals pay a search/match fee
- **Secure Payments**: PCI-compliant payment processing via Stripe
- **Refunds**: Full and partial refund support

---

## 🚀 Setup Steps

### 1. **Get Stripe API Keys**

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up or log in
3. Navigate to **Developers → API Keys**
4. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
5. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 2. **Configure Frontend (React)**

Create a `.env` file in the project root:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...your_key_here
```

**OR** update `src/components/StripeProvider.jsx`:

```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51...your_key_here';
```

### 3. **Configure Backend (Lambda)**

#### Option A: AWS Secrets Manager (Recommended)

1. Go to AWS Console → **Secrets Manager**
2. Create a new secret:
   - Name: `stripe-secret-key`
   - Type: **Plaintext**
   - Value: Your Stripe Secret Key (`sk_test_...` or `sk_live_...`)
3. The Lambda function will automatically read from this secret

#### Option B: Environment Variables

Update `amplify/functions/stripe-payment/resource.ts`:

```typescript
environment: {
  STRIPE_SECRET_KEY: 'sk_test_...your_key_here',
},
```

### 4. **Install Dependencies**

```bash
npm install
```

This will install:
- `@stripe/stripe-js`
- `@stripe/react-stripe-js`
- `stripe` (for Lambda)

### 5. **Deploy Backend**

```bash
npx ampx sandbox
```

This will:
- Deploy the Lambda function
- Set up IAM permissions
- Configure Secrets Manager access

### 6. **Set Up Webhook (Optional but Recommended)**

For real-time payment status updates:

1. Go to Stripe Dashboard → **Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-api-gateway-url/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to AWS Secrets Manager as `stripe-webhook-secret`

---

## 📋 Payment Flow

### For Models (Paying for Service)

1. Model accepts a booking match
2. Redirected to `/payment/:bookingId`
3. Enters payment details via Stripe Elements
4. Payment processed securely
5. Booking status updated to `confirmed`

### For Professionals (Paying Search Fee)

1. Professional creates a model request
2. When match is sent, professional is charged
3. Payment processed via admin dashboard or automatic

---

## 🔧 Integration Points

### Booking Creation

When a booking is confirmed, call:

```javascript
import { createPaymentIntent } from '../utils/stripe';

const { clientSecret, paymentIntentId } = await createPaymentIntent({
  amount: 25.00, // Model fee
  bookingId: 'booking-123',
  customerId: 'cus_...', // Optional: Stripe customer ID
});
```

### Payment Page

The payment page is already set up at `/payment/:bookingId`

### Admin Refunds

```javascript
import { refundPayment } from '../utils/stripe';

await refundPayment('pi_...', 25.00); // Full refund
await refundPayment('pi_...', 10.00); // Partial refund
```

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date and any CVC.

### Test Mode vs Live Mode

- **Test Mode**: Use `pk_test_` and `sk_test_` keys
- **Live Mode**: Use `pk_live_` and `sk_live_` keys (after Stripe account verification)

---

## 📊 Payment Status Tracking

The `Booking` model tracks:
- `modelPaymentStatus`: `pending` | `paid` | `refunded` | `failed`
- `professionalPaymentStatus`: `pending` | `paid` | `refunded` | `failed`
- `stripePaymentIntentId`: Stripe payment intent ID
- `paymentAmount`: Total amount charged
- `paymentDate`: When payment was processed

---

## 🔒 Security Notes

1. **Never expose secret keys** in frontend code
2. **Always use HTTPS** in production
3. **Validate webhook signatures** (already implemented)
4. **Store keys in Secrets Manager**, not in code
5. **Use environment variables** for publishable keys

---

## 💰 Pricing

Stripe charges:
- **2.9% + $0.30** per successful card charge
- **No monthly fees**
- **No setup fees**

Example: $25 booking fee
- Stripe fee: $1.03
- You receive: $23.97

---

## 🆘 Troubleshooting

### "Stripe publishable key not configured"
- Check `.env` file exists
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set
- Restart dev server after adding env vars

### "Failed to create payment intent"
- Check Lambda function is deployed
- Verify Stripe secret key in Secrets Manager
- Check CloudWatch logs for errors

### "Webhook signature verification failed"
- Verify webhook secret in Secrets Manager
- Check webhook endpoint URL is correct
- Ensure webhook is receiving POST requests

---

## 📚 Resources

- [Stripe Docs](https://stripe.com/docs)
- [Stripe React Elements](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing](https://stripe.com/docs/testing)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)

---

## ✅ Next Steps

1. ✅ Get Stripe API keys
2. ✅ Configure frontend publishable key
3. ✅ Configure backend secret key
4. ✅ Deploy Lambda function
5. ✅ Test payment flow
6. ⏳ Set up webhooks (optional)
7. ⏳ Switch to live mode (when ready)

---

**Questions?** Check the Stripe Dashboard or AWS CloudWatch logs for detailed error messages.

