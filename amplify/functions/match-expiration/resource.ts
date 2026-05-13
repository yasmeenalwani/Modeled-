import { defineFunction } from '@aws-amplify/backend';

/**
 * Match Expiration Function
 *
 * Scheduled Lambda to expire matches that haven't been responded to
 * Runs daily via EventBridge
 */
export const matchExpirationFunction = defineFunction({
  name: 'match-expiration',
  entry: './handler.ts',
  schedule: 'every day',
  timeoutSeconds: 300,
  environment: {
    MATCH_EXPIRATION_HOURS: '48',
  },
});

