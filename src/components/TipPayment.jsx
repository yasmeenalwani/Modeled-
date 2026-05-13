import React, { useState, useMemo } from 'react';
import StripeProvider from './StripeProvider';
import PaymentForm from './PaymentForm';

// Check if Stripe is configured
const isStripeAvailable = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  !!import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

// ============ STYLES ============
const styles = {
  container: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '2rem',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
  },
  
  // Suggested tips
  suggestedTips: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  tipButton: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  tipButtonSelected: {
    borderColor: '#667eea',
    background: 'rgba(102,126,234,0.2)',
  },
  tipAmount: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  tipPercent: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Custom amount
  customAmount: {
    marginBottom: '1.5rem',
  },
  customInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1.1rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Payment options
  paymentOptions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  paymentOption: {
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  paymentOptionSelected: {
    borderColor: '#667eea',
    background: 'rgba(102,126,234,0.1)',
  },
  paymentOptionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  paymentOptionDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.75rem',
  },
  paymentOptionFee: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  feeHighlight: {
    color: '#4caf50',
    fontWeight: '600',
  },
  
  // Fee breakdown
  feeBreakdown: {
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.85rem',
  },
  feeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  feeLabel: {
    color: 'rgba(255,255,255,0.6)',
  },
  feeValue: {
    fontWeight: '600',
  },
  feeTotal: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    paddingTop: '0.5rem',
    marginTop: '0.5rem',
    fontSize: '1rem',
  },
  
  // Venmo/Cash section
  externalPayment: {
    padding: '1.5rem',
    background: 'rgba(46,160,67,0.1)',
    border: '1px solid rgba(46,160,67,0.3)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  externalTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  venmoInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  venmoQR: {
    width: '120px',
    height: '120px',
    background: '#fff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  venmoDetails: {
    flex: 1,
  },
  venmoHandle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  venmoNote: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  cashOption: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  cashTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  cashNote: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  confirmButton: {
    padding: '0.5rem 1rem',
    background: 'rgba(46,160,67,0.2)',
    border: '1px solid rgba(46,160,67,0.3)',
    borderRadius: '6px',
    color: '#4caf50',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  
  // Manual entry
  manualEntry: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
  },
  manualTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  manualInput: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    marginBottom: '0.5rem',
  },
  
  // Actions
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  btn: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  btnDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
};

/**
 * Calculate Stripe processing fee
 * Stripe: 2.9% + $0.30 per transaction
 */
function calculateStripeFee(amount) {
  return (amount * 0.029) + 0.30;
}

/**
 * Calculate suggested tip amounts based on service price
 */
function calculateSuggestedTips(servicePrice) {
  const percentages = [15, 18, 20, 25, 30];
  return percentages.map(percent => ({
    percent,
    amount: Math.round((servicePrice * percent) / 100),
  }));
}

export default function TipPayment({
  servicePrice = 90, // Base service price
  professionalName = 'Sarah M.',
  professionalVenmo = '@sarah-stylist',
  professionalId,
  bookingId,
  onTipComplete,
  onSkip,
}) {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  // Default to Venmo if Stripe not available
  const [paymentMethod, setPaymentMethod] = useState(isStripeAvailable ? 'stripe' : 'venmo'); // 'stripe', 'venmo', 'cash'
  const [tipAmount, setTipAmount] = useState(0);
  const [venmoConfirmed, setVenmoConfirmed] = useState(false);
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [manualTipAmount, setManualTipAmount] = useState('');
  const [manualTipMethod, setManualTipMethod] = useState('');

  const suggestedTips = useMemo(() => calculateSuggestedTips(servicePrice), [servicePrice]);
  
  const finalTipAmount = useMemo(() => {
    if (selectedTip) return selectedTip.amount;
    if (customAmount) return parseFloat(customAmount) || 0;
    return 0;
  }, [selectedTip, customAmount]);
  
  const stripeFee = useMemo(() => {
    if (paymentMethod !== 'stripe' || finalTipAmount === 0) return 0;
    return calculateStripeFee(finalTipAmount);
  }, [paymentMethod, finalTipAmount]);
  
  const professionalReceives = useMemo(() => {
    if (paymentMethod === 'stripe') {
      return finalTipAmount - stripeFee;
    }
    return finalTipAmount; // Venmo/Cash = no fee
  }, [paymentMethod, finalTipAmount, stripeFee]);
  
  const handleTipSelect = (tip) => {
    setSelectedTip(tip);
    setCustomAmount('');
    setTipAmount(tip.amount);
  };
  
  const handleCustomAmount = (value) => {
    setCustomAmount(value);
    setSelectedTip(null);
    setTipAmount(parseFloat(value) || 0);
  };
  
  const handlePaymentSuccess = async (paymentResult) => {
    try {
      const tipData = {
        bookingId,
        professionalId,
        amount: finalTipAmount,
        method: 'stripe',
        fee: stripeFee,
        professionalReceives,
        stripePaymentIntentId: paymentResult.paymentIntent?.id,
      };
      
      if (onTipComplete) {
        await onTipComplete(tipData);
      }
    } catch (error) {
      console.error('Error processing tip:', error);
    }
  };
  
  const handleVenmoConfirm = () => {
    setVenmoConfirmed(true);
    if (onTipComplete) {
      onTipComplete({
        bookingId,
        professionalId,
        amount: finalTipAmount,
        method: 'venmo',
        fee: 0,
        professionalReceives: finalTipAmount,
        venmoHandle: professionalVenmo,
        confirmed: true,
      });
    }
  };
  
  const handleCashConfirm = () => {
    setCashConfirmed(true);
    if (onTipComplete) {
      onTipComplete({
        bookingId,
        professionalId,
        amount: finalTipAmount,
        method: 'cash',
        fee: 0,
        professionalReceives: finalTipAmount,
        confirmed: true,
      });
    }
  };
  
  const handleManualEntry = () => {
    if (manualTipAmount && manualTipMethod) {
      if (onTipComplete) {
        onTipComplete({
          bookingId,
          professionalId,
          amount: parseFloat(manualTipAmount),
          method: manualTipMethod,
          fee: 0,
          professionalReceives: parseFloat(manualTipAmount),
          manualEntry: true,
        });
      }
    }
  };
  
  if (venmoConfirmed || cashConfirmed) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.externalPayment, background: 'rgba(76,175,80,0.2)' }}>
          <div style={{ ...styles.externalTitle, color: '#4caf50' }}>
            ✓ Tip Recorded!
          </div>
          <div style={{ color: 'rgba(255,255,255,0.9)' }}>
            Your ${finalTipAmount} tip has been recorded. {professionalName} will receive the full amount with no fees!
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>💰</span> Tip Your Professional
        </div>
        <div style={styles.subtitle}>
          Show your appreciation! {professionalName} will receive 100% of tips via Venmo or Cash.
        </div>
      </div>
      
      {/* Suggested Tips */}
      <div style={styles.suggestedTips}>
        {suggestedTips.map((tip) => (
          <button
            key={tip.percent}
            style={{
              ...styles.tipButton,
              ...(selectedTip?.percent === tip.percent ? styles.tipButtonSelected : {}),
            }}
            onClick={() => handleTipSelect(tip)}
          >
            <div style={styles.tipAmount}>${tip.amount}</div>
            <div style={styles.tipPercent}>{tip.percent}%</div>
          </button>
        ))}
      </div>
      
      {/* Custom Amount */}
      <div style={styles.customAmount}>
        <input
          type="number"
          style={styles.customInput}
          placeholder="Or enter custom amount"
          value={customAmount}
          onChange={(e) => handleCustomAmount(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>
      
      {finalTipAmount > 0 && (
        <>
          {/* Payment Options */}
          <div style={styles.paymentOptions}>
            {/* Stripe Option - Only show if Stripe is available */}
            {isStripeAvailable && (
              <div
                style={{
                  ...styles.paymentOption,
                  ...(paymentMethod === 'stripe' ? styles.paymentOptionSelected : {}),
                }}
                onClick={() => setPaymentMethod('stripe')}
              >
                <div style={styles.paymentOptionTitle}>
                  <span>💳</span> Card Payment
                </div>
                <div style={styles.paymentOptionDesc}>
                  Secure payment via Stripe
                </div>
                <div style={styles.paymentOptionFee}>
                  Fee: ${stripeFee.toFixed(2)} ({((stripeFee / finalTipAmount) * 100).toFixed(1)}%)
                </div>
              </div>
            )}
            
            {/* Venmo/Cash Option */}
            <div
              style={{
                ...styles.paymentOption,
                ...(paymentMethod === 'venmo' ? styles.paymentOptionSelected : {}),
              }}
              onClick={() => setPaymentMethod('venmo')}
            >
              <div style={styles.paymentOptionTitle}>
                <span>💚</span> Venmo / Cash
              </div>
              <div style={styles.paymentOptionDesc}>
                No fees! Professional gets 100%
              </div>
              <div style={{ ...styles.paymentOptionFee, ...styles.feeHighlight }}>
                Fee: $0.00 (0%)
              </div>
            </div>
          </div>
          
          {/* Fee Breakdown (Stripe only) */}
          {paymentMethod === 'stripe' && (
            <div style={styles.feeBreakdown}>
              <div style={styles.feeRow}>
                <span style={styles.feeLabel}>Tip Amount:</span>
                <span style={styles.feeValue}>${finalTipAmount.toFixed(2)}</span>
              </div>
              <div style={styles.feeRow}>
                <span style={styles.feeLabel}>Processing Fee (2.9% + $0.30):</span>
                <span style={styles.feeValue}>-${stripeFee.toFixed(2)}</span>
              </div>
              <div style={{ ...styles.feeRow, ...styles.feeTotal }}>
                <span style={styles.feeLabel}>Professional Receives:</span>
                <span style={{ ...styles.feeValue, color: '#4caf50' }}>
                  ${professionalReceives.toFixed(2)}
                </span>
              </div>
            </div>
          )}
          
          {/* Venmo/Cash Details */}
          {paymentMethod === 'venmo' && (
            <div style={styles.externalPayment}>
              <div style={styles.externalTitle}>
                <span>💚</span> Tip via Venmo or Cash
              </div>
              
              <div style={styles.venmoInfo}>
                <div style={styles.venmoQR}>
                  {/* In real app, this would be a QR code */}
                  <span>📱</span>
                </div>
                <div style={styles.venmoDetails}>
                  <div style={styles.venmoHandle}>{professionalVenmo}</div>
                  <div style={styles.venmoNote}>
                    Send ${finalTipAmount} to {professionalVenmo} on Venmo, or pay cash directly.
                  </div>
                </div>
              </div>
              
              <div style={styles.cashOption}>
                <div style={styles.cashTitle}>💵 Cash Option</div>
                <div style={styles.cashNote}>
                  You can also tip ${finalTipAmount} in cash directly to {professionalName} at the appointment.
                </div>
              </div>
              
              <button
                style={styles.confirmButton}
                onClick={handleVenmoConfirm}
              >
                I've Sent the Tip
              </button>
            </div>
          )}
          
          {/* Stripe Payment Form */}
          {paymentMethod === 'stripe' && (
            <StripeProvider>
              <PaymentForm
                amount={finalTipAmount}
                description={`Tip for ${professionalName}`}
                onSuccess={handlePaymentSuccess}
                onError={(error) => console.error('Tip payment error:', error)}
              />
            </StripeProvider>
          )}
          
          {/* Manual Entry (for tracking external tips) */}
          <div style={styles.manualEntry}>
            <div style={styles.manualTitle}>
              Already tipped? Record it here:
            </div>
            <input
              type="number"
              style={styles.manualInput}
              placeholder="Tip amount"
              value={manualTipAmount}
              onChange={(e) => setManualTipAmount(e.target.value)}
            />
            <select
              style={styles.manualInput}
              value={manualTipMethod}
              onChange={(e) => setManualTipMethod(e.target.value)}
            >
              <option value="">Select method</option>
              <option value="venmo">Venmo</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
            <button
              style={styles.confirmButton}
              onClick={handleManualEntry}
              disabled={!manualTipAmount || !manualTipMethod}
            >
              Record Tip
            </button>
          </div>
        </>
      )}
      
      {/* Actions */}
      <div style={styles.actions}>
        {onSkip && (
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={onSkip}
          >
            Skip for Now
          </button>
        )}
      </div>
    </div>
  );
}

