import { defineFunction } from '@aws-amplify/backend';

// Booking reminders: runs hourly via EventBridge
export const bookingRemindersFunction = defineFunction({
  name: 'booking-reminders',
  entry: './handler.ts',
  schedule: 'every 1h',
  timeoutSeconds: 30,
});


