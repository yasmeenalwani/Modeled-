import { defineFunction } from '@aws-amplify/backend';

/**
 * Pinpoint Campaigns Lambda Function
 * 
 * Handles:
 * - Sending marketing campaigns via Pinpoint
 * - Creating and managing campaigns
 * - Segment targeting
 * - Campaign analytics
 */
export const pinpointCampaignsFunction = defineFunction({
  name: 'pinpoint-campaigns',
  entry: './handler.ts',
  environment: {
    PINPOINT_REGION: 'us-east-1',
    // PINPOINT_APP_ID will be set dynamically from CDK
    FROM_EMAIL: 'noreply@modeledmanagement.com',
    FROM_NAME: 'Modeled Management',
    PORTAL_URL: process.env.PORTAL_URL || 'https://app.modeledmanagement.com',
  },
  timeoutSeconds: 60,
});

