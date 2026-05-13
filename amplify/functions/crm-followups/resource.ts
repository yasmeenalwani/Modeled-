import { defineFunction } from '@aws-amplify/backend';

/**
 * CRM Automated Follow-ups Lambda Function
 * 
 * Scheduled job that sends automated follow-up emails
 */
export const crmFollowupsFunction = defineFunction({
  name: 'crm-followups',
  entry: './handler.ts',
  timeoutSeconds: 60,
  memoryMB: 512,
});

