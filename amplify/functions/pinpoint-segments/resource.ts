import { defineFunction } from '@aws-amplify/backend';

/**
 * Pinpoint Segments Lambda Function
 * 
 * Handles:
 * - Creating user segments
 * - Updating segments
 * - Managing segment criteria
 * - Syncing user data to Pinpoint endpoints
 */
export const pinpointSegmentsFunction = defineFunction({
  name: 'pinpoint-segments',
  entry: './handler.ts',
  environment: {
    PINPOINT_REGION: 'us-east-1',
    // PINPOINT_APP_ID will be set dynamically from CDK
  },
  timeoutSeconds: 60,
});

