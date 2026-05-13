import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';
import outputs from '../../amplify_outputs.json';

/**
 * Stripe Payment Utilities
 * 
 * Functions to interact with the Stripe payment Lambda function
 * 
 * Note: After deployment, the function will be available via API Gateway
 * Update the API endpoint in amplify_outputs.json
 */

/**
 * Create a payment intent for a booking
 * 
 * @param {Object} params
 * @param {number} params.amount - Amount in dollars
 * @param {string} params.bookingId - Booking ID
 * @param {string} params.customerId - Stripe customer ID (optional)
 * @param {'automatic'|'manual'} [params.captureMethod] - Stripe capture mode
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
export async function createPaymentIntent({ amount, bookingId, customerId, captureMethod, metadata = {} }) {
  try {
    const session = await fetchAuthSession();
    
    const apiName = (
      outputs?.custom?.stripeApiName ||
      outputs?.custom?.stripePaymentFunctionName ||
      outputs?.api?.stripePaymentFunction?.name ||
      import.meta?.env?.VITE_STRIPE_API_NAME
    );
    if (!apiName) {
      throw new Error('Stripe API is not configured. Set outputs.custom.stripeApiName or VITE_STRIPE_API_NAME.');
    }
    
    const response = await post({
      apiName,
      path: '/payment',
      options: {
        body: {
          action: 'createPaymentIntent',
          data: {
            amount,
            currency: 'usd',
            bookingId,
            customerId,
            captureMethod,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString(),
            },
          },
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    return {
      clientSecret: body.clientSecret,
      paymentIntentId: body.paymentIntentId,
      status: body.status,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
}

/**
 * Confirm a payment
 * 
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} paymentMethodId - Stripe payment method ID
 * @returns {Promise<{status: string, amount: number}>}
 */
export async function confirmPayment(paymentIntentId, paymentMethodId) {
  try {
    const session = await fetchAuthSession();
    const apiName = (
      outputs?.custom?.stripeApiName ||
      outputs?.custom?.stripePaymentFunctionName ||
      outputs?.api?.stripePaymentFunction?.name ||
      import.meta?.env?.VITE_STRIPE_API_NAME
    );
    if (!apiName) {
      throw new Error('Stripe API is not configured. Set outputs.custom.stripeApiName or VITE_STRIPE_API_NAME.');
    }
    
    const response = await post({
      apiName,
      path: '/payment',
      options: {
        body: {
          action: 'confirmPayment',
          data: {
            paymentIntentId,
            paymentMethodId,
          },
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    return {
      status: body.status,
      amount: body.amount,
      paymentIntentId: body.paymentIntentId,
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error(`Failed to confirm payment: ${error.message}`);
  }
}

/**
 * Refund a payment
 * 
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund in dollars (optional, full refund if not provided)
 * @returns {Promise<{refundId: string, amount: number, status: string}>}
 */
export async function refundPayment(paymentIntentId, amount = null) {
  try {
    const session = await fetchAuthSession();
    const apiName = (
      outputs?.custom?.stripeApiName ||
      outputs?.custom?.stripePaymentFunctionName ||
      outputs?.api?.stripePaymentFunction?.name ||
      import.meta?.env?.VITE_STRIPE_API_NAME
    );
    if (!apiName) {
      throw new Error('Stripe API is not configured. Set outputs.custom.stripeApiName or VITE_STRIPE_API_NAME.');
    }
    
    const response = await post({
      apiName,
      path: '/refund',
      options: {
        body: {
          action: 'refund',
          data: {
            paymentIntentId,
            amount,
          },
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    return {
      refundId: body.refundId,
      amount: body.amount,
      status: body.status,
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw new Error(`Failed to refund payment: ${error.message}`);
  }
}

/**
 * Create a SetupIntent for saving a card on file (no charge)
 *
 * @param {Object} params
 * @param {string} [params.modelProfileId] - Model profile ID (for models)
 * @param {string} [params.professionalId] - Professional ID (for pros)
 * @param {string} [params.customerId] - Existing Stripe customer ID (optional - creates new if not provided)
 * @returns {Promise<{clientSecret: string, setupIntentId: string, customerId: string}>}
 */
export async function createSetupIntent({ modelProfileId, professionalId, customerId }) {
  try {
    const session = await fetchAuthSession();
    const apiName = (
      outputs?.custom?.stripeApiName ||
      outputs?.custom?.stripePaymentFunctionName ||
      outputs?.api?.stripePaymentFunction?.name ||
      import.meta?.env?.VITE_STRIPE_API_NAME
    );
    if (!apiName) {
      throw new Error('Stripe API is not configured.');
    }

    const response = await post({
      apiName,
      path: '/payment',
      options: {
        body: {
          action: 'createSetupIntent',
          data: {
            modelProfileId: modelProfileId || undefined,
            professionalId: professionalId || undefined,
            customerId,
            metadata: { modelProfileId, professionalId, timestamp: new Date().toISOString() },
          },
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    return {
      clientSecret: body.clientSecret,
      setupIntentId: body.setupIntentId,
      customerId: body.customerId,
    };
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw new Error(`Failed to set up payment method: ${error.message}`);
  }
}

/**
 * Attach a payment method to a model profile (save card on file)
 *
 * @param {Object} params
 * @param {string} params.modelProfileId - Model profile ID to update
 * @param {string} params.paymentMethodId - Stripe payment method ID (pm_xxx)
 * @param {string} params.customerId - Stripe customer ID
 * @returns {Promise<{status: string}>}
 */
export async function attachPaymentMethod({ modelProfileId, paymentMethodId, customerId }) {
  try {
    const session = await fetchAuthSession();
    const apiName = (
      outputs?.custom?.stripeApiName ||
      outputs?.custom?.stripePaymentFunctionName ||
      outputs?.api?.stripePaymentFunction?.name ||
      import.meta?.env?.VITE_STRIPE_API_NAME
    );
    if (!apiName) {
      throw new Error('Stripe API is not configured.');
    }

    const response = await post({
      apiName,
      path: '/payment',
      options: {
        body: {
          action: 'attachPaymentMethod',
          data: {
            modelProfileId: modelProfileId || undefined,
            professionalId: professionalId || undefined,
            paymentMethodId,
            customerId,
          },
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
    return { status: body.status || 'succeeded' };
  } catch (error) {
    console.error('Error attaching payment method:', error);
    throw new Error(`Failed to save payment method: ${error.message}`);
  }
}

/**
 * Format amount for display
 */
export function formatAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

