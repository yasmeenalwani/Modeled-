import * as cdk from 'aws-cdk-lib';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * CloudTrail Security Logging Configuration
 * 
 * Sets up:
 * - API call logging
 * - Security event tracking
 * - Audit trail
 */
export function addCloudTrailLogging(stack: cdk.Stack) {
  // S3 bucket for CloudTrail logs
  const trailBucket = new s3.Bucket(stack, 'CloudTrailLogsBucket', {
    bucketName: `modeled-management-cloudtrail-${cdk.Aws.ACCOUNT_ID}`,
    versioned: true,
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep logs for compliance
    lifecycleRules: [
      {
        id: 'DeleteOldLogs',
        expiration: cdk.Duration.days(90), // Keep logs for 90 days
      },
    ],
  });

  // CloudTrail Trail
  const trail = new cloudtrail.Trail(stack, 'ModeledManagementTrail', {
    trailName: 'ModeledManagement-SecurityTrail',
    bucket: trailBucket,
    isMultiRegionTrail: true, // Log events from all regions
    includeGlobalServiceEvents: true, // Include IAM, CloudFront, etc.
    enableFileValidation: true, // Validate log file integrity
    managementEvents: cloudtrail.ReadWriteType.ALL, // Log all management events
    sendToCloudWatchLogs: true, // Also send to CloudWatch for easier access
    cloudWatchLogsRetention: cdk.aws_logs.RetentionDays.ONE_MONTH,
  });

  // Add data events for S3 (track file access)
  trail.addEventSelector(cloudtrail.DataResourceType.S3_OBJECT, [
    `arn:aws:s3:::modeled-management-storage-${cdk.Aws.ACCOUNT_ID}/*`, // Your S3 bucket
  ], {
    readWriteType: cloudtrail.ReadWriteType.ALL,
  });

  // Add data events for Lambda (track function invocations)
  trail.addEventSelector(cloudtrail.DataResourceType.LAMBDA_FUNCTION, [
    'arn:aws:lambda:*:*:function:stripe-payment',
    'arn:aws:lambda:*:*:function:notifications',
  ], {
    readWriteType: cloudtrail.ReadWriteType.ALL,
  });

  // Output the trail ARN
  new cdk.CfnOutput(stack, 'CloudTrailArn', {
    value: trail.trailArn,
    description: 'CloudTrail ARN for security logging',
  });

  return trail;
}

