import { defineFunction } from '@aws-amplify/backend';

/**
 * Auto-Matching Lambda Function
 *
 * Automatically runs matching when a ModelRequest is created or updated to 'pending' status.
 *
 * Triggers:
 * - DynamoDB Stream on ModelRequest table (INSERT/MODIFY events)
 *
 * Behavior:
 * 1. On request creation with status='pending' → Run matching
 * 2. Auto-approve matches with score > 85
 * 3. Auto-send approved matches to models
 */
export const autoMatchingFunction = defineFunction({
  name: 'auto-matching',
  entry: './handler.ts',
  resourceGroupName: 'data', // Required for DynamoDB Stream trigger
  timeoutSeconds: 60,
  memoryMB: 512,
  environment: {
    AUTO_APPROVE_THRESHOLD: '85', // Auto-approve matches with score >= 85
    AUTO_SEND_TO_MODELS: 'true', // Auto-send approved matches to models
  },
});

