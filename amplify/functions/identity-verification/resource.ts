import { defineFunction } from '@aws-amplify/backend';

export const identityVerificationFunction = defineFunction({
  name: 'identity-verification',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1',
  },
  timeoutSeconds: 30,
});

