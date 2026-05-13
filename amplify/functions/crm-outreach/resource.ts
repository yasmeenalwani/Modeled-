import { defineFunction } from '@aws-amplify/backend';

/**
 * CRM Outreach Lambda Function
 * 
 * Handles email and SMS outreach for CRM campaigns
 */
export const crmOutreachFunction = defineFunction({
  name: 'crm-outreach',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    FROM_EMAIL: 'noreply@modeled.com',
    PINPOINT_APP_ID: process.env.PINPOINT_APP_ID || '',
  },
});

