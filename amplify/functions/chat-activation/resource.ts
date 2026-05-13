import { defineFunction } from '@aws-amplify/backend';

// Chat activation: runs every 15 min via EventBridge
export const chatActivationFunction = defineFunction({
  name: 'chat-activation',
  entry: './handler.ts',
  schedule: 'every 15m',
  timeoutSeconds: 30,
});


