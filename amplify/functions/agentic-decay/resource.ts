import { defineFunction } from '@aws-amplify/backend';

/**
 * Agentic Decay Function
 *
 * Scheduled Lambda to apply inactivity decay to model agentic scores.
 * Runs monthly (1st of month) via EventBridge.
 * Decays reliability, engagement, compatibility for models inactive 60+ days.
 */
export const agenticDecayFunction = defineFunction({
  name: 'agentic-decay',
  entry: './handler.ts',
  schedule: 'every month',
  timeoutSeconds: 300,
  environment: {
    IDLE_DAYS_THRESHOLD: '60',
    RELIABILITY_DECAY: '0.95',
    ENGAGEMENT_DECAY: '0.95',
    COMPATIBILITY_DECAY: '0.96',
  },
});
