import { defineFunction } from '@aws-amplify/backend';

// Model payment reminders: runs every 6 hours via EventBridge
export const modelPaymentRemindersFunction = defineFunction({
  name: 'model-payment-reminders',
  entry: './handler.ts',
  schedule: 'every 6h',
  timeoutSeconds: 30,
});


