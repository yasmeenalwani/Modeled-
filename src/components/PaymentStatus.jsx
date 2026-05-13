import React from 'react';

/**
 * PaymentStatus Component
 * 
 * Displays payment status with appropriate styling
 * 
 * @param {Object} props
 * @param {string} props.status - 'pending' | 'paid' | 'refunded' | 'failed'
 * @param {number} props.amount - Payment amount
 * @param {string} props.paymentDate - Payment date (optional)
 */
export default function PaymentStatus({ status, amount, paymentDate }) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      label: 'Pending',
      color: '#ffc107',
      bg: 'rgba(255, 193, 7, 0.1)',
    },
    paid: {
      icon: '✅',
      label: 'Paid',
      color: '#4caf50',
      bg: 'rgba(76, 175, 80, 0.1)',
    },
    refunded: {
      icon: '↩️',
      label: 'Refunded',
      color: '#ff9800',
      bg: 'rgba(255, 152, 0, 0.1)',
    },
    failed: {
      icon: '❌',
      label: 'Failed',
      color: '#f44336',
      bg: 'rgba(244, 67, 54, 0.1)',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  const styles = {
    container: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      background: config.bg,
      color: config.color,
      fontSize: '0.85rem',
      fontWeight: '500',
    },
    amount: {
      marginLeft: '0.5rem',
      fontWeight: '600',
    },
    date: {
      fontSize: '0.75rem',
      opacity: 0.7,
      marginTop: '0.25rem',
    },
  };

  return (
    <div>
      <div style={styles.container}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
        {amount && (
          <span style={styles.amount}>
            ${amount.toFixed(2)}
          </span>
        )}
      </div>
      {paymentDate && (
        <div style={styles.date}>
          {new Date(paymentDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

