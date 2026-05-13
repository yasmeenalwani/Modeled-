import { defineFunction } from '@aws-amplify/backend';

/**
 * DynamoDB to RDS Sync Function
 * 
 * Syncs data from DynamoDB to RDS for analytics
 * Triggered by DynamoDB Streams
 */
export const dynamodbSyncFunction = defineFunction({
  name: 'dynamodb-sync',
  entry: './handler.ts',
  environment: {
    // TODO: Set these after RDS is provisioned (Phase 2 analytics)
    RDS_SECRET_ARN: 'PENDING',
    RDS_ENDPOINT: 'PENDING',
    RDS_DATABASE: 'modeled_analytics',
    RDS_REGION: 'us-east-1',
  },
  timeoutSeconds: 60,
  memoryMB: 512,
});

