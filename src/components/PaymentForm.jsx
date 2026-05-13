import React, { useState, useEffect } from 'react';
import { createPaymentIntent, confirmPayment } from '../utils/stripe';

// Check if Stripe packages are available
let StripeAvailable = false;
let PaymentElementComponent = null;
let useStripeHook = null;
let useElementsHook = null;

try {
  const stripeReact = require('@stripe/react-stripe-js');
  if (stripeReact && stripeReact.PaymentElement && stripeReact.useStripe && stripeReact.useElements) {
    StripeAvailable = true;
    PaymentElementComponent = stripeReact.PaymentElement;
    useStripeHook = stripeReact.useStripe;
    useElementsHook = stripeReact.useElements;
  }
} catch (error) {
  // Stripe not available - that's fine
  StripeAvailable = false;
}

/**
 * PaymentForm Component
 * 
 * Handles Stripe payment collection using Stripe Elements
 * Falls back to message if Stripe is not configured
 * 
 * @param {Object} props
 * @param {number} props.amount - Amount to charge in dollars
 * @param {string} props.bookingId - Booking ID
 * @param {string} props.customerId - Stripe customer ID (optional)
 * @param {Function} props.onSuccess - Callback when payment succeeds
 * @param {Function} props.onError - Callback when payment fails
 * @param {string} props.accentColor - Theme color (default: #8B1E3F)
 */
function PaymentFormInner({
  amount,
  bookingId,
  customerId,
  onSuccess,
  onError,
  accentColor = '#8B1E3F',
}) {
  const stripe = useStripeHook ? useStripeHook() : null;
  const elements = useElementsHook ? useElementsHook() : null;
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState(null);

  // Create payment intent on mount
  useEffect(() => {
    if (!amount || !bookingId) {
      setError('Missing required payment information');
      setIsLoading(false);
      return;
    }

    createPaymentIntent({
      amount,
      bookingId,
      customerId,
      captureMethod: 'manual',
      metadata: bookingId?.startsWith('match-') ? { matchId: bookingId } : {},
    })
      .then(({ clientSecret, paymentIntentId }) => {
        setClientSecret(clientSecret);
        setPaymentIntentId(paymentIntentId);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
        if (onError) onError(err);
      });
  }, [amount, bookingId, customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw confirmError;
      }

      if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture') {
        // Manual capture flow returns "requires_capture" after successful authorization.
        if (onSuccess) {
          onSuccess({
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            status: paymentIntent.status,
          });
        }
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    },
    header: {
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#2D2926',
      marginBottom: '0.5rem',
      fontFamily: '"Cormorant Garamond", Georgia, serif',
    },
    amount: {
      fontSize: '2rem',
      fontWeight: '700',
      color: accentColor,
      marginBottom: '1rem',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    paymentElement: {
      padding: '1rem',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '8px',
    },
    submitButton: {
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#fff',
      background: accentColor,
      border: 'none',
      borderRadius: '8px',
      cursor: isProcessing || !stripe ? 'not-allowed' : 'pointer',
      opacity: isProcessing || !stripe ? 0.6 : 1,
      transition: 'all 0.3s ease',
      fontFamily: '"Inter", sans-serif',
    },
    error: {
      padding: '1rem',
      background: 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
      borderRadius: '8px',
      fontSize: '0.9rem',
    },
    loading: {
      textAlign: 'center',
      padding: '2rem',
      color: '#5C5552',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⏳</div>
          <div>Setting up payment...</div>
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Complete Payment</h2>
        <div style={styles.amount}>
          ${amount.toFixed(2)}
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {PaymentElementComponent && (
          <div style={styles.paymentElement}>
            <PaymentElementComponent />
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          style={styles.submitButton}
          onMouseOver={(e) => {
            if (!isProcessing && stripe) {
              e.target.style.opacity = '0.9';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseOut={(e) => {
            if (!isProcessing && stripe) {
              e.target.style.opacity = '1';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {isProcessing ? 'Processing...' : `Authorize $${amount.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}

/**
 * Main PaymentForm export - shows fallback if Stripe not available
 */
export default function PaymentForm(props) {
  // Show fallback if Stripe is not available
  if (!StripeAvailable || !PaymentElementComponent) {
    return (
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '2rem',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: '#5C5552',
          background: 'rgba(255,193,7,0.1)',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💳</div>
          <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>
            Payment: ${props.amount?.toFixed(2) || '0.00'}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(0,0,0,0.6)' }}>
            Stripe payment processing is not configured yet.
            <br />
            Payment functionality will be available once Stripe keys are added.
          </div>
        </div>
      </div>
    );
  }

  return <PaymentFormInner {...props} />;
}
