import { defineFunction } from '@aws-amplify/backend';

/**
 * Analytics API Function
 * 
 * Provides secure access to RDS analytics data
 * Frontend calls this Lambda, which queries RDS
 */
export const analyticsApiFunction = defineFunction({
  name: 'analytics-api',
  entry: './handler.ts',
  environment: {
    // RDS credentials stored in Secrets Manager
    // Secret name: modeled-analytics-db-credentials
    // Format: {"username": "...", "password": "...", "host": "...", "port": 5432, "dbname": "modeled_analytics"}
    // Note: RDS_SECRET_ARN should be set to the full ARN of the secret
    // Example: arn:aws:secretsmanager:us-east-1:123456789012:secret:modeled-analytics-db-credentials-xxxxx
    // The handler will retrieve credentials from Secrets Manager using this ARN
    RDS_DATABASE: 'modeled_analytics',
    RDS_REGION: 'us-east-1',
    // RDS_SECRET_ARN and RDS_ENDPOINT will be set via AWS Console or after running setup script
    // The handler can retrieve endpoint from the secret if RDS_ENDPOINT is not set
  },
  timeoutSeconds: 30,
  memoryMB: 512,
});

