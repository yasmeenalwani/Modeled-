import { Stripe } from 'stripe';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Handler } from 'aws-lambda';
import type { Schema } from '../../data/resource';

// Get Stripe secret from Secrets Manager
async function getStripeSecret() {
  // Try environment variable first (for local dev)
  if (process.env.STRIPE_SECRET_KEY) {
    return process.env.STRIPE_SECRET_KEY;
  }

  // Get from Secrets Manager
  const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });
  const secretName = process.env.STRIPE_SECRET_ARN || 'stripe-secret-key';
  
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: secretName,
      })
    );
    
    const secret = JSON.parse(response.SecretString || '{}');
    return secret.stripe_secret_key || secret.STRIPE_SECRET_KEY || '';
  } catch (error) {
    console.error('Error getting Stripe secret:', error);
    throw new Error('Stripe secret key not configured. Please set it in Secrets Manager.');
  }
}

// Initialize Stripe (lazy initialization)
let stripeInstance: Stripe | null = null;

async function getStripe(): Promise<Stripe> {
  if (!stripeInstance) {
    const secretKey = await getStripeSecret();
    if (!secretKey) {
      throw new Error('Stripe secret key not configured');
    }
    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeInstance;
}

/**
 * Lambda Handler for Stripe Payment Operations
 * 
 * Event structure:
 * {
 *   action: 'createPaymentIntent' | 'confirmPayment' | 'refund' | 'webhook',
 *   data: { ... }
 * }
 */
export const handler: Handler = async (event) => {
  console.log('Stripe Payment Handler:', JSON.stringify(event, null, 2));

  try {
    const stripe = await getStripe();
    const { action, data } = event;

    switch (action) {
      case 'createPaymentIntent':
        return await createPaymentIntent(data);
      
      case 'confirmPayment':
        return await confirmPayment(data);
      
      case 'refund':
        return await refundPayment(data);
      
      case 'createSetupIntent':
        return await createSetupIntent(data);
      
      case 'attachPaymentMethod':
        return await attachPaymentMethod(data);
      
      case 'webhook':
        return await handleWebhook(data);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Stripe Payment Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Payment processing failed',
      }),
    };
  }
};

/**
 * Retry logic helper
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt - 1)));
      }
    }
  }
  
  throw lastError || new Error('Operation failed after retries');
}

/**
 * Create a Payment Intent (with retry logic)
 * 
 * data: {
 *   amount: number (in cents),
 *   currency: string (default: 'usd'),
 *   bookingId: string,
 *   customerId?: string,
 *   metadata: { ... }
 * }
 */
async function createPaymentIntent(data: any) {
  return retryOperation(async () => {
    const stripe = await getStripe();
    
    const {
      amount,
      currency = 'usd',
      bookingId,
      customerId,
      metadata = {},
      captureMethod,
    } = data;

    if (!amount || !bookingId) {
      throw new Error('Missing required fields: amount, bookingId');
    }

    const shouldDefaultManualCapture =
      Boolean(metadata?.matchId) ||
      (typeof bookingId === 'string' && bookingId.startsWith('match-'));
    const resolvedCaptureMethod = captureMethod === 'manual' || captureMethod === 'automatic'
      ? captureMethod
      : (shouldDefaultManualCapture ? 'manual' : 'automatic');

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: customerId,
      metadata: {
        bookingId,
        ...metadata,
      },
      capture_method: resolvedCaptureMethod,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        captureMethod: paymentIntent.capture_method,
      }),
    };
  });
}

/**
 * Confirm a Payment (with retry logic)
 * 
 * data: {
 *   paymentIntentId: string,
 *   paymentMethodId?: string
 * }
 */
async function confirmPayment(data: any) {
  return retryOperation(async () => {
    const stripe = await getStripe();
    const { paymentIntentId, paymentMethodId } = data;

    if (!paymentIntentId) {
      throw new Error('Missing paymentIntentId');
    }

    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert back to dollars
      }),
    };
  });
}

/**
 * Create a SetupIntent for saving card on file (no charge)
 * Supports modelProfileId (ModelProfile) or professionalId (Professional)
 */
async function createSetupIntent(data: any) {
  const stripe = await getStripe();
  const { modelProfileId, professionalId, customerId } = data;
  const entityId = modelProfileId || professionalId;
  const entityType = modelProfileId ? 'model' : 'professional';

  let stripeCustomerId = customerId;

  if (!stripeCustomerId && entityId) {
    try {
      const { env } = await import('$amplify/env/stripe-payment');
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
      Amplify.configure(resourceConfig, libraryOptions);
      const client = generateClient<Schema>();
      if (entityType === 'model') {
        const { data: profile } = await client.models.ModelProfile.get({ id: entityId });
        stripeCustomerId = profile?.stripeCustomerId || undefined;
      } else {
        const { data: pro } = await client.models.Professional.get({ id: entityId });
        stripeCustomerId = (pro as any)?.stripeCustomerId || undefined;
      }
    } catch {
      stripeCustomerId = undefined;
    }
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      metadata: { [modelProfileId ? 'modelProfileId' : 'professionalId']: entityId || '' },
    });
    stripeCustomerId = customer.id;
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    metadata: modelProfileId ? { modelProfileId } : { professionalId: professionalId || '' },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: stripeCustomerId,
    }),
  };
}

/**
 * Attach payment method to customer and update ModelProfile or Professional
 */
async function attachPaymentMethod(data: any) {
  const stripe = await getStripe();
  const { modelProfileId, professionalId, paymentMethodId, customerId } = data;
  const entityId = modelProfileId || professionalId;

  if (!paymentMethodId || !customerId || !entityId) {
    throw new Error('Missing required fields: modelProfileId or professionalId, paymentMethodId, customerId');
  }

  const metadata: Record<string, string> = modelProfileId
    ? { modelProfileId }
    : { professionalId: professionalId! };

  // PM is already attached via SetupIntent; ensure it's set as default and has metadata
  await stripe.paymentMethods.update(paymentMethodId, { metadata });
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: paymentMethodId },
    metadata,
  });

  const { env } = await import('$amplify/env/stripe-payment');
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
  Amplify.configure(resourceConfig, libraryOptions);
  const client = generateClient<Schema>();

  const updatePayload = {
    stripeCustomerId: customerId,
    defaultPaymentMethodId: paymentMethodId,
    cardOnFileStatus: 'valid' as const,
    cardOnFileFlaggedAt: null as string | null,
  };

  if (modelProfileId) {
    await client.models.ModelProfile.update({ id: modelProfileId, ...updatePayload });
  } else {
    await client.models.Professional.update({ id: professionalId!, ...updatePayload });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'succeeded' }),
  };
}

/**
 * Refund a Payment
 * 
 * data: {
 *   paymentIntentId: string,
 *   amount?: number (partial refund if provided)
 * }
 */
async function refundPayment(data: any) {
  const stripe = await getStripe();
  const { paymentIntentId, amount } = data;

  if (!paymentIntentId) {
    throw new Error('Missing paymentIntentId');
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined, // Full refund if not specified
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    }),
  };
}

/**
 * Create a Booking from a Match (webhook flow - after payment succeeds)
 * Idempotent: skips if booking already exists for this match.
 */
async function createBookingFromMatchInWebhook(
  matchId: string,
  paymentData: { paymentIntentId: string; amount: number; chargeId?: string }
) {
  const { env } = await import('$amplify/env/stripe-payment');
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
  Amplify.configure(resourceConfig, libraryOptions);
  const client = generateClient<Schema>();

  // 1. Check if booking already exists (idempotent - frontend may have created it)
  const { data: existingBookings } = await client.models.Booking.list({
    filter: { matchId: { eq: matchId } },
  });
  if (existingBookings && existingBookings.length > 0) {
    console.log('Booking already exists for match:', matchId);
    return;
  }

  // 2. Get match
  const { data: match } = await client.models.Match.get({ id: matchId });
  if (!match) throw new Error('Match not found');

  // 3. Get request
  const { data: request } = await client.models.ModelRequest.get({ id: match.requestId });
  if (!request) throw new Error('Request not found');

  // 4. Get professional (for location)
  const { data: professional } = await client.models.Professional.get({ id: request.professionalId });
  const location = request.location || professional?.salonAddress || 'TBD';

  // 5. Parse appointment date/time
  const rawDate = request.requestedDate;
  const appointmentDate = typeof rawDate === 'string'
    ? rawDate.split('T')[0] || rawDate.split(' ')[0]
    : rawDate && typeof rawDate === 'object' && 'toISOString' in rawDate
      ? (rawDate as Date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
  const appointmentTime = typeof request.requestedTime === 'string'
    ? request.requestedTime
    : '10:00';

  const modelFee = paymentData.amount || 25;
  const professionalFee = 25; // Default; pro pays separately

  // 6. Create Booking
  const { data: booking, errors } = await client.models.Booking.create({
    matchId: match.id,
    requestId: match.requestId,
    modelId: match.modelId,
    professionalId: request.professionalId,
    appointmentDate,
    appointmentTime,
    duration: request.duration || 60,
    location,
    serviceType: request.serviceType || 'haircut',
    serviceDescription: request.serviceDescription || '',
    modelFee,
    modelPaymentStatus: 'paid',
    professionalFee,
    professionalPaymentStatus: 'pending',
    stripePaymentIntentId: paymentData.paymentIntentId,
    stripeChargeId: paymentData.chargeId,
    paymentAmount: modelFee + professionalFee,
    paymentCurrency: 'usd',
    paymentDate: new Date().toISOString(),
    status: 'confirmed',
  });

  if (errors || !booking) {
    throw new Error(errors?.[0]?.message || 'Failed to create booking');
  }

  // 7. Update match
  await client.models.Match.update({
    id: matchId,
    status: 'accepted',
    bookingId: booking.id,
  });

  // 8. Update request
  await client.models.ModelRequest.update({
    id: match.requestId,
    status: 'booked',
  });
}

/**
 * Flag model's card status when card is removed/expired/declined
 */
async function flagModelCardStatus(modelProfileId: string, status: 'removed' | 'expired' | 'declined') {
  try {
    const { env } = await import('$amplify/env/stripe-payment');
    const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
    Amplify.configure(resourceConfig, libraryOptions);
    const client = generateClient<Schema>();
    await client.models.ModelProfile.update({
      id: modelProfileId,
      cardOnFileStatus: status,
      cardOnFileFlaggedAt: new Date().toISOString(),
      defaultPaymentMethodId: null,
    });
    console.log('Flagged model card status:', modelProfileId, status);
  } catch (err: any) {
    console.error('Failed to flag model card status:', err);
  }
}

/**
 * Handle Stripe Webhooks
 * 
 * Validates webhook signature and processes events
 */
async function handleWebhook(data: any) {
  const stripe = await getStripe();
  const { signature, body } = data;
  
  // Get webhook secret from Secrets Manager
  const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });
  let webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    try {
      const response = await secretsClient.send(
        new GetSecretValueCommand({
          SecretId: 'stripe-webhook-secret',
        })
      );
      const secret = JSON.parse(response.SecretString || '{}');
      webhookSecret = secret.webhook_secret || secret.STRIPE_WEBHOOK_SECRET;
    } catch (error) {
      console.error('Error getting webhook secret:', error);
    }
  }

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` }),
    };
  }

  // Handle different event types
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment succeeded:', paymentIntent.id, 'metadata:', paymentIntent.metadata);
      // Create booking from match when metadata indicates match payment
      const matchId = paymentIntent.metadata?.matchId as string | undefined
        || (typeof paymentIntent.metadata?.bookingId === 'string' && paymentIntent.metadata.bookingId.startsWith('match-')
          ? paymentIntent.metadata.bookingId
          : undefined);
      if (matchId) {
        try {
          const chargeId = typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : (paymentIntent.latest_charge as { id?: string })?.id;
          await createBookingFromMatchInWebhook(matchId, {
            paymentIntentId: paymentIntent.id,
            amount: (paymentIntent.amount || 0) / 100,
            chargeId,
          });
          console.log('Booking created from match:', matchId);
        } catch (err: any) {
          console.error('Failed to create booking from match:', err);
          // Don't fail webhook - payment succeeded; frontend may retry or support can fix
        }
      }
      break;
    }

    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      // TODO: Notify user and update booking
      break;

    case 'charge.refunded':
      console.log('Refund processed:', event.data.object);
      // TODO: Update booking refund status
      break;

    case 'payment_method.detached': {
      const pm = event.data.object as Stripe.PaymentMethod;
      const modelProfileId = pm.metadata?.modelProfileId;
      if (modelProfileId) {
        await flagModelCardStatus(modelProfileId, 'removed');
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  };
}

