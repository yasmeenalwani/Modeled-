import { defineFunction } from '@aws-amplify/backend';

/**
 * Photo Analysis Function
 * 
 * Analyzes model photos using AWS Rekognition and Bedrock
 * Triggered automatically when photos are uploaded to S3
 * 
 * NOTE: IAM permissions for Rekognition, Bedrock, and S3 need to be configured
 * in AWS Console or via CDK. The Lambda execution role needs:
 * - rekognition:DetectLabels
 * - rekognition:DetectFaces
 * - s3:GetObject (on your storage bucket)
 * - s3:DeleteObject (on your storage bucket - for moderation rejection compliance)
 * - bedrock:InvokeModel
 */
export const photoAnalysisFunction = defineFunction({
  name: 'photo-analysis',
  entry: './handler.ts',
  environment: {
    BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0', // Can switch to haiku for faster/cheaper
  },
  timeoutSeconds: 60, // Bedrock can take time
  memoryMB: 1024, // More memory for image processing
});

