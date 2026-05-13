import { defineFunction } from '@aws-amplify/backend';

/**
 * Notifications Lambda Function
 * 
 * Handles:
 * - Sending emails via SES
 * - Sending SMS via SNS
 * - Booking confirmations
 * - Reminders
 * - Status updates
 */
export const notificationsFunction = defineFunction({
  name: 'notifications',
  entry: './handler.ts',
  environment: {
    // SES configuration
    SES_REGION: 'us-east-1',
    FROM_EMAIL: 'noreply@modeledmanagement.com', // ⚠️ MUST be verified in SES Console
    FROM_NAME: 'Modeled Management',
    
    // SNS configuration
    SNS_REGION: 'us-east-1',
    
    // Portal URL for email links
    PORTAL_URL: process.env.PORTAL_URL || 'https://app.modeledmanagement.com',
  },
  timeoutSeconds: 30,
});

