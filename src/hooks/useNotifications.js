import { useState } from 'react';
import {
  sendBookingConfirmation,
  sendBookingReminder,
  sendMatchNotification,
  sendPaymentReminder,
} from '../utils/notifications';

/**
 * React Hook for Notifications
 * 
 * Provides easy-to-use functions for sending notifications
 */
export function useNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const send = async (notificationFn, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await notificationFn(...args);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // Booking notifications
    sendBookingConfirmation: (...args) => send(sendBookingConfirmation, ...args),
    sendBookingReminder: (...args) => send(sendBookingReminder, ...args),
    sendPaymentReminder: (...args) => send(sendPaymentReminder, ...args),
    
    // Match notifications
    sendMatchNotification: (...args) => send(sendMatchNotification, ...args),
    
    // State
    loading,
    error,
  };
}

