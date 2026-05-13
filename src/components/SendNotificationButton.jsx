import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * SendNotificationButton Component
 * 
 * A reusable button component for sending notifications
 * 
 * @param {Object} props
 * @param {string} props.template - Template name
 * @param {Object} props.recipient - { email, phone, name }
 * @param {Object} props.data - Template data
 * @param {Object} props.options - { sendEmail, sendSMS }
 * @param {string} props.buttonText - Button label
 * @param {string} props.accentColor - Theme color
 */
export default function SendNotificationButton({
  template,
  recipient,
  data,
  options = { sendEmail: true, sendSMS: false },
  buttonText = 'Send Notification',
  accentColor = '#8B1E3F',
  onSuccess,
  onError,
}) {
  const { loading, error } = useNotifications();
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    try {
      // Import the appropriate function based on template
      const { sendNotification } = await import('../utils/notifications');
      
      await sendNotification({
        type: options.sendEmail && options.sendSMS ? 'both' : options.sendEmail ? 'email' : 'sms',
        template,
        recipient,
        data,
      });

      setSent(true);
      if (onSuccess) onSuccess();
      
      // Reset after 3 seconds
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      if (onError) onError(err);
    }
  };

  const styles = {
    button: {
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#fff',
      background: accentColor,
      border: 'none',
      borderRadius: '6px',
      cursor: loading || sent ? 'not-allowed' : 'pointer',
      opacity: loading || sent ? 0.7 : 1,
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    icon: {
      fontSize: '1rem',
    },
  };

  if (sent) {
    return (
      <span style={{ ...styles.button, background: '#4caf50' }}>
        <span style={styles.icon}>✅</span>
        Sent!
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={loading || sent}
      style={styles.button}
      onMouseOver={(e) => {
        if (!loading && !sent) {
          e.target.style.opacity = '0.9';
          e.target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseOut={(e) => {
        if (!loading && !sent) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      {loading ? (
        <>
          <span style={styles.icon}>⏳</span>
          Sending...
        </>
      ) : (
        <>
          <span style={styles.icon}>📧</span>
          {buttonText}
        </>
      )}
    </button>
  );
}

