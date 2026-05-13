/**
 * Pinpoint Resource Configuration
 * 
 * Note: Pinpoint app will be created manually in AWS Console or via CDK
 * This file documents the required setup.
 * 
 * Hybrid Approach:
 * - SES/SNS: Transactional messages (bookings, confirmations)
 * - Pinpoint: Marketing campaigns (promotions, re-engagement, analytics)
 * 
 * Setup Steps:
 * 1. Create Pinpoint app in AWS Console
 * 2. Configure email channel (connect to SES)
 * 3. Configure SMS channel (connect to SNS)
 * 4. Add PINPOINT_APP_ID to Lambda environment variables
 * 5. Grant Lambda functions Pinpoint permissions
 */

export const PINPOINT_CONFIG = {
  // Pinpoint App ID - set after creating app in AWS Console
  APP_ID: process.env.PINPOINT_APP_ID || '',
  REGION: 'us-east-1',
  FROM_EMAIL: 'noreply@modeledmanagement.com',
  FROM_NAME: 'Modeled Management',
};

/**
 * Required IAM Permissions for Lambda Functions:
 * 
 * {
 *   "Effect": "Allow",
 *   "Action": [
 *     "pinpoint:SendMessages",
 *     "pinpoint:PutEvents",
 *     "pinpoint:UpdateEndpoint",
 *     "pinpoint:GetEndpoint",
 *     "pinpoint:CreateSegment",
 *     "pinpoint:GetSegment",
 *     "pinpoint:UpdateSegment",
 *     "pinpoint:DeleteSegment",
 *     "pinpoint:GetCampaign",
 *     "pinpoint:CreateCampaign",
 *     "pinpoint:UpdateCampaign",
 *     "pinpoint:GetApplicationSettings"
 *   ],
 *   "Resource": "arn:aws:pinpoint:us-east-1:*:apps/*"
 * }
 */

