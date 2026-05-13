/**
 * Card On File Section
 * 
 * Allows models to add a payment method in their profile.
 * Required for matching - models without valid card on file cannot be matched.
 */

import React, { useState, useEffect } from 'react';
import { createSetupIntent, attachPaymentMethod } from '../utils/stripe';

let StripeAvailable = false;
let PaymentElementComponent = null;
let useStripeHook = null;
let useElementsHook = null;
let Elements = null;
let loadStripe = null;

try {
  const stripeReact = require('@stripe/react-stripe-js');
  const stripeJs = require('@stripe/stripe-js');
  if (stripeReact?.PaymentElement && stripeReact?.useStripe && stripeReact?.useElements && stripeReact?.Elements) {
    StripeAvailable = true;
    PaymentElementComponent = stripeReact.PaymentElement;
    useStripeHook = stripeReact.useStripe;
    useElementsHook = stripeReact.useElements;
    Elements = stripeReact.Elements;
  }
  if (stripeJs?.loadStripe) loadStripe = stripeJs.loadStripe;
} catch {
  StripeAvailable = false;
}

const CARD_STATUS_MESSAGES = {
  none: { label: 'No card on file', sub: 'Add a card to be eligible for matches', status: 'required' },
  valid: { label: 'Card on file', sub: 'You\'re eligible for matches', status: 'good' },
  expired: { label: 'Card expired', sub: 'Update your card to continue receiving matches', status: 'flagged' },
  declined: { label: 'Card declined', sub: 'Update your card to continue receiving matches', status: 'flagged' },
  removed: { label: 'Card removed', sub: 'Add a card to be eligible for matches', status: 'flagged' },
};

function CardOnFileFormInner({ modelProfileId, customerId, clientSecret, onSuccess, onError, accentColor = '#8B1E3F' }) {
  const stripe = useStripeHook?.();
  const elements = useElementsHook?.();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret || !customerId || !modelProfileId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { setupIntent, error: confirmError } = await stripe.confirmSetup({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/model-portal/profile`,
        },
        redirect: 'if_required',
      });

      if (confirmError) throw confirmError;

      if (setupIntent?.status === 'succeeded' && setupIntent.payment_method) {
        await attachPaymentMethod({
          modelProfileId,
          paymentMethodId: setupIntent.payment_method,
          customerId,
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(err?.message || 'Failed to save card');
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElementComponent
        options={{
          layout: 'tabs',
          defaultCollapsed: false,
        }}
      />
      {error && (
        <div style={{ color: '#c0392b', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        style={{
          marginTop: '1rem',
          padding: '0.6rem 1.25rem',
          background: `linear-gradient(135deg, ${accentColor}, #A85A5A)`,
          color: '#FFFEF9',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          opacity: !stripe || isProcessing ? 0.6 : 1,
        }}
      >
        {isProcessing ? 'Saving...' : 'Save card'}
      </button>
    </form>
  );
}

export default function CardOnFileSection({
  modelProfile,
  onUpdate,
  accentColor = '#8B1E3F',
}) {
  const [showForm, setShowForm] = useState(false);
  const [loadingSetup, setLoadingSetup] = useState(false);
  const [setupIntent, setSetupIntent] = useState(null);
  const status = modelProfile?.cardOnFileStatus || 'none';
  const config = CARD_STATUS_MESSAGES[status] || CARD_STATUS_MESSAGES.none;
  const hasValidCard = status === 'valid';
  const isFlagged = ['expired', 'declined', 'removed'].includes(status);

  const stripePublishableKey = import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY;
  const canAddCard = StripeAvailable && stripePublishableKey && modelProfile?.id && modelProfile.id !== 'mock';

  const content = (
    <div style={styles.section}>
      <div style={styles.header}>
        <div style={styles.title}>Payment method</div>
        <div style={styles.subtitle}>
          Required to receive matches. Your card is charged when you accept a booking.
        </div>
      </div>

      {/* Status */}
      <div
        style={{
          ...styles.statusBox,
          ...(hasValidCard ? styles.statusGood : {}),
          ...(isFlagged ? styles.statusFlagged : {}),
          ...(!hasValidCard && !isFlagged ? styles.statusRequired : {}),
        }}
      >
        <div style={styles.statusLabel}>{config.label}</div>
        <div style={styles.statusSub}>{config.sub}</div>
        {hasValidCard && (
          <div style={{ fontSize: '0.75rem', color: '#27ae60', marginTop: '0.25rem' }}>
            •••• •••• •••• (saved)
          </div>
        )}
      </div>

      {/* Add/Update button */}
      {canAddCard && (
        <>
          {showForm ? (
            <div style={styles.formWrap}>
              {loadingSetup && <div style={{ padding: '1rem', color: '#5A3A2A' }}>Loading...</div>}
              {setupIntent?.clientSecret && loadStripe && Elements && (() => {
                const stripePromise = loadStripe(stripePublishableKey);
                return (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: setupIntent.clientSecret,
                      appearance: { theme: 'stripe' },
                    }}
                  >
                    <CardOnFileFormInner
                      modelProfileId={modelProfile.id}
                      customerId={setupIntent.customerId}
                      clientSecret={setupIntent.clientSecret}
                      accentColor={accentColor}
                      onSuccess={() => {
                        setShowForm(false);
                        setSetupIntent(null);
                        if (onUpdate) onUpdate({ cardOnFileStatus: 'valid' });
                      }}
                      onError={() => {}}
                    />
                  </Elements>
                );
              })()}
              <button
                type="button"
                onClick={() => { setShowForm(false); setSetupIntent(null); }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={async () => {
                setShowForm(true);
                setLoadingSetup(true);
                try {
                  const result = await createSetupIntent({
                    modelProfileId: modelProfile.id,
                    customerId: modelProfile.stripeCustomerId || null,
                  });
                  setSetupIntent(result);
                } catch (err) {
                  console.error('SetupIntent error:', err);
                  setShowForm(false);
                } finally {
                  setLoadingSetup(false);
                }
              }}
              style={{
                ...styles.addBtn,
                background: hasValidCard ? 'transparent' : `linear-gradient(135deg, ${accentColor}, #A85A5A)`,
                border: hasValidCard ? `2px solid ${accentColor}` : 'none',
                color: hasValidCard ? accentColor : '#FFFEF9',
              }}
            >
              {hasValidCard ? 'Update card' : 'Add card'}
            </button>
          )}
        </>
      )}

      {(!canAddCard && !hasValidCard) && (
        <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem' }}>
          Payment setup will be available after you complete onboarding.
        </div>
      )}
    </div>
  );

  if (!StripeAvailable || !stripePublishableKey) {
    return (
      <div style={styles.section}>
        <div style={styles.header}>
          <div style={styles.title}>Payment method</div>
          <div style={styles.subtitle}>Required to receive matches.</div>
        </div>
        <div style={styles.statusBox}>
          <div style={styles.statusLabel}>Setup unavailable</div>
          <div style={styles.statusSub}>Payment configuration is in progress. Please check back soon.</div>
        </div>
      </div>
    );
  }

  return content;
}

const styles = {
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  header: {
    marginBottom: '0.75rem',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.25rem',
  },
  statusBox: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  statusGood: {
    background: 'rgba(39, 174, 96, 0.1)',
    border: '1px solid rgba(39, 174, 96, 0.3)',
  },
  statusFlagged: {
    background: 'rgba(230, 126, 34, 0.1)',
    border: '1px solid rgba(230, 126, 34, 0.3)',
  },
  statusRequired: {
    background: 'rgba(139, 30, 63, 0.08)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
  },
  statusLabel: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statusSub: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.2rem',
  },
  addBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cancelBtn: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#5A3A2A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  formWrap: {
    marginTop: '0.5rem',
  },
};
