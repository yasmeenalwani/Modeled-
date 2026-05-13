import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';

/**
 * Notifications Utilities
 * 
 * Functions to send emails and SMS via SES/SNS
 */

/**
 * Send a notification (email, SMS, or both)
 * 
 * @param {Object} params
 * @param {string} params.type - 'email' | 'sms' | 'both'
 * @param {string} params.template - Template name
 * @param {Object} params.recipient - { email, phone, name }
 * @param {Object} params.data - Template data
 * @returns {Promise<{email?: Object, sms?: Object}>}
 */
export async function sendNotification({ type, template, recipient, data }) {
  try {
    const session = await fetchAuthSession();
    const apiName = 'notificationsFunction';
    
    const response = await post({
      apiName,
      path: '/notify',
      options: {
        body: {
          type,
          template,
          recipient,
          data,
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    return result.results || {};
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error(`Failed to send notification: ${error.message}`);
  }
}

/**
 * Send booking confirmation
 */
export async function sendBookingConfirmation(booking, recipient, options = {}) {
  const { sendEmail = true, sendSMS = false } = options;
  
  return await sendNotification({
    type: sendEmail && sendSMS ? 'both' : sendEmail ? 'email' : 'sms',
    template: 'booking_confirmation',
    recipient: {
      email: recipient.email,
      phone: recipient.phone,
      name: recipient.name,
    },
    data: {
      bookingId: booking.id,
      serviceType: booking.serviceType,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      location: booking.location,
      professionalName: booking.professionalName,
      paymentLink: booking.paymentLink,
    },
  });
}

/**
 * Send booking reminder (24 hours before)
 */
export async function sendBookingReminder(booking, recipient, options = {}) {
  const { sendEmail = true, sendSMS = true } = options;
  
  return await sendNotification({
    type: sendEmail && sendSMS ? 'both' : sendEmail ? 'email' : 'sms',
    template: 'booking_reminder',
    recipient: {
      email: recipient.email,
      phone: recipient.phone,
      name: recipient.name,
    },
    data: {
      serviceType: booking.serviceType,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
      location: booking.location,
    },
  });
}

/**
 * Send match notification
 */
export async function sendMatchNotification(match, recipient, options = {}) {
  const { sendEmail = true, sendSMS = false } = options;
  
  return await sendNotification({
    type: sendEmail && sendSMS ? 'both' : sendEmail ? 'email' : 'sms',
    template: 'match_notification',
    recipient: {
      email: recipient.email,
      phone: recipient.phone,
      name: recipient.name,
    },
    data: {
      serviceType: match.serviceType,
      appointmentDate: match.appointmentDate,
      appointmentTime: match.appointmentTime,
      matchScore: match.matchScore,
      bookingLink: match.bookingLink,
    },
  });
}

/**
 * Send payment reminder
 */
export async function sendPaymentReminder(booking, recipient, options = {}) {
  const { sendEmail = true, sendSMS = false } = options;
  
  return await sendNotification({
    type: sendEmail && sendSMS ? 'both' : sendEmail ? 'email' : 'sms',
    template: 'payment_reminder',
    recipient: {
      email: recipient.email,
      phone: recipient.phone,
      name: recipient.name,
    },
    data: {
      amount: booking.modelFee || booking.amount,
      serviceType: booking.serviceType,
      appointmentDate: booking.appointmentDate,
      paymentLink: booking.paymentLink,
    },
  });
}

/**
 * Helper to format phone number for SMS
 */
export function formatPhoneNumber(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // If it's 10 digits, assume US number and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  // If it's 11 digits and starts with 1, add +
  if (digits.length === 11 && digits[0] === '1') {
    return `+${digits}`;
  }
  
  // If it already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Default: assume US and add +1
  return `+1${digits}`;
}

