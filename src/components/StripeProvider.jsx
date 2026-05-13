import React from 'react';

/**
 * StripeProvider Component
 * 
 * Wraps the app with Stripe Elements provider
 * 
 * NOTE: Stripe is disabled until keys are configured.
 * To enable: Set VITE_STRIPE_PUBLISHABLE_KEY in .env file
 * Get your key from: https://dashboard.stripe.com/apikeys
 */
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 
  null;

const isStripeConfigured = STRIPE_PUBLISHABLE_KEY && 
  (STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_') || STRIPE_PUBLISHABLE_KEY.startsWith('pk_live_'));

// Lazy load Stripe only if configured
let StripeElements = null;
let stripePromise = null;

if (isStripeConfigured) {
  try {
    const stripeJs = require('@stripe/stripe-js');
    const stripeReact = require('@stripe/react-stripe-js');
    StripeElements = stripeReact.Elements;
    stripePromise = stripeJs.loadStripe(STRIPE_PUBLISHABLE_KEY);
  } catch (error) {
    // Stripe packages not installed - that's okay, we'll just skip Stripe
    console.warn('Stripe packages not available. Payment via Venmo/Cash only.');
  }
}

/**
 * StripeProvider
 * 
 * @param {ReactNode} children - Components that need Stripe access
 */
export default function StripeProvider({ children }) {
  // If Stripe is not configured or not available, just return children (no Stripe wrapper)
  if (!isStripeConfigured || !StripeElements) {
    return <>{children}</>;
  }

  return (
    <StripeElements
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#8B1E3F',
            colorBackground: '#fff',
            colorText: '#2D2926',
            colorDanger: '#f44336',
            fontFamily: '"Inter", sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      {children}
    </StripeElements>
  );
}
