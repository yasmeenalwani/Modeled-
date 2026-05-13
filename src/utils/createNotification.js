import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData } from './mockDataService';

let client = null;
// In demo mode, never initialize client to prevent database access
if (!shouldUseMockData()) {
  try {
    client = generateClient();
  } catch (error) {
    console.warn('Failed to generate Amplify client, will skip notifications:', error);
    client = null;
  }
} else {
  // Demo mode - explicitly keep client as null
  client = null;
}

/**
 * Create a portal notification
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.userType - 'model' | 'professional' | 'partner' | 'admin'
 * @param {string} params.type - Notification type (e.g., 'match_opportunity', 'payment_required')
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Array} params.actions - Array of {label, action, primary} objects
 * @param {Object} params.data - Additional data for the notification
 * @returns {Promise<Object>} Created notification
 */
export async function createNotification({
  userId,
  userType = 'model',
  type,
  title,
  message,
  link,
  actionText,
  relatedEntityId,
  actions = [],
  data = {},
}) {
  try {
    // Build actions array if link/actionText provided
    const notificationActions = actions.length > 0 ? actions : (link && actionText ? [{ label: actionText, action: 'view', primary: true }] : []);
    
    // Build data object
    const notificationData = {
      ...data,
      ...(link && { link }),
      ...(relatedEntityId && { relatedEntityId }),
    };

    if (shouldUseMockData() || !client?.models?.Notification || typeof client.models.Notification.create !== 'function') {
      console.log('📬 Notification (mock mode):', {
        userId,
        userType,
        type,
        title,
        message,
        actions: notificationActions,
        data: notificationData,
      });
      // Return a mock notification object
      return {
        id: `mock-notification-${Date.now()}`,
        userId,
        userType,
        type,
        title,
        message,
        actions: notificationActions,
        data: notificationData,
        read: false,
        createdAt: new Date().toISOString(),
      };
    }

    try {
      const { data: notification } = await client.models.Notification.create({
        userId,
        userType,
        type,
        title,
        message,
        actions: notificationActions,
        data: notificationData,
        read: false,
      });
      return notification || { id: 'created', userId, userType, type, title, message, actions: notificationActions, data: notificationData, read: false };
    } catch (error) {
      console.error('[createNotification] Database error:', error);
      // Don't throw - just log and return mock
      return {
        id: `mock-notification-${Date.now()}`,
        userId,
        userType,
        type,
        title,
        message,
        actions: notificationActions,
        data: notificationData,
        read: false,
        createdAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error in createNotification:', error);
    // Return mock notification as fallback
    return {
      id: `mock-notification-${Date.now()}`,
      userId,
      userType,
      type,
      title,
      message,
      actions: actions.length > 0 ? actions : [],
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };
  }
}

/**
 * Create notification and send email (if needed)
 */
export async function createNotificationWithEmail({
  userId,
  userType,
  type,
  title,
  message,
  actions = [],
  data = {},
  sendEmail = false,
  recipient = null,
}) {
  // Create portal notification
  const notification = await createNotification({
    userId,
    userType,
    type,
    title,
    message,
    actions,
    data,
  });

  // Send email if requested
  if (sendEmail && recipient) {
    try {
      const { sendNotification } = await import('./notifications');
      await sendNotification({
        type: 'email',
        template: type, // Use notification type as template name
        recipient,
        data,
      });
    } catch (error) {
      console.error('Error sending email notification:', error);
      // Don't fail if email fails
    }
  }

  return notification;
}

/**
 * Notification templates for common scenarios
 */
export const NotificationTemplates = {
  matchOpportunity: (userId, data) => ({
    userId,
    userType: 'model',
    type: 'match_opportunity',
    title: 'New opportunity!',
    message: `${data.professionalName} is looking for a model for ${data.serviceType} on ${data.appointmentDate} at ${data.appointmentTime}. You'd earn $${data.amount}.`,
    actions: [
      { label: 'View Details', action: 'view', primary: true },
      { label: 'Accept', action: 'accept', primary: true },
      { label: 'Decline', action: 'decline', primary: false },
    ],
    data,
  }),

  paymentRequired: (userId, data) => ({
    userId,
    userType: 'model',
    type: 'payment_required',
    title: 'Payment required',
    message: `Complete your booking by paying the model search fee ($${data.amount}).`,
    actions: [
      { label: 'Pay Now', action: 'pay', primary: true },
    ],
    data,
  }),

  bookingConfirmed: (userId, data) => ({
    userId,
    userType: 'model',
    type: 'booking_confirmed',
    title: 'Booking confirmed!',
    message: `Your booking with ${data.professionalName} is confirmed for ${data.appointmentDate} at ${data.appointmentTime}. Calendar invite sent to your email.`,
    actions: [
      { label: 'View Details', action: 'view', primary: true },
      { label: 'Add to Calendar', action: 'calendar', primary: false },
    ],
    data,
  }),

  bookingReminder: (userId, data) => ({
    userId,
    userType: 'model',
    type: 'booking_reminder',
    title: 'Reminder: Booking tomorrow!',
    message: `Your booking with ${data.professionalName} is tomorrow at ${data.appointmentTime}.`,
    actions: [
      { label: 'View Details', action: 'view', primary: true },
    ],
    data,
  }),

  profileApproved: (userId, data) => ({
    userId,
    userType: 'model',
    type: 'profile_approved',
    title: 'Profile approved!',
    message: `Your profile has been approved! You're now active and can receive match opportunities!`,
    actions: [
      { label: 'View Dashboard', action: 'dashboard', primary: true },
    ],
    data,
  }),
};

