import { defineFunction } from '@aws-amplify/backend';

/**
 * Stripe Payment Lambda Function
 * 
 * Handles:
 * - Creating payment intents
 * - Processing payments
 * - Handling webhooks
 * - Refunds
 */
export const stripePaymentFunction = defineFunction({
  name: 'stripe-payment',
  entry: './handler.ts',
  environment: {
    // Stripe secret key - set via AWS Secrets Manager
    // Secret name: stripe-secret-key
    // Format: { "stripe_secret_key": "sk_test_..." }
    // The handler will fetch from Secrets Manager automatically
    STRIPE_SECRET_ARN: 'stripe-secret-key', // Secret name in Secrets Manager
  },
  timeoutSeconds: 30,
});

