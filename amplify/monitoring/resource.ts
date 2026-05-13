import { defineBackend } from '@aws-amplify/backend';
import { addCustomCdkResources } from '@aws-amplify/backend';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as s3 from 'aws-cdk-lib/aws-s3';

/**
 * CloudWatch & CloudTrail Monitoring Setup
 * 
 * This will be added to the backend via custom CDK resources
 */
export const monitoring = addCustomCdkResources((backend) => {
  const stack = backend.stack;

  // ============ CLOUDWATCH LOG GROUPS ============
  
  new logs.LogGroup(stack, 'StripePaymentLogs', {
    logGroupName: '/aws/lambda/stripe-payment',
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  new logs.LogGroup(stack, 'NotificationsLogs', {
    logGroupName: '/aws/lambda/notifications',
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  // ============ CLOUDWATCH DASHBOARD ============
  
  const dashboard = new cloudwatch.Dashboard(stack, 'ModeledManagementDashboard', {
    dashboardName: 'ModeledManagement-Main',
  });

  // Cost Overview
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'Monthly AWS Costs',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Billing',
          metricName: 'EstimatedCharges',
          dimensionsMap: {
            Currency: 'USD',
          },
          statistic: 'Maximum',
          period: cdk.Duration.hours(6),
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // Lambda Metrics
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'Lambda Invocations',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ],
      width: 12,
      height: 6,
    }),
    new cloudwatch.GraphWidget({
      title: 'Lambda Errors',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // ============ CLOUDWATCH ALARMS ============

  // Billing Alarm
  new cloudwatch.Alarm(stack, 'MonthlyBillingAlarm', {
    alarmName: 'ModeledManagement-MonthlyBilling',
    metric: new cloudwatch.Metric({
      namespace: 'AWS/Billing',
      metricName: 'EstimatedCharges',
      dimensionsMap: {
        Currency: 'USD',
      },
      statistic: 'Maximum',
      period: cdk.Duration.hours(6),
    }),
    threshold: 100,
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alert when monthly AWS costs exceed $100',
  });

  // Error Rate Alarm
  new cloudwatch.Alarm(stack, 'HighErrorRateAlarm', {
    alarmName: 'ModeledManagement-HighErrorRate',
    metric: new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Errors',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    }),
    threshold: 10,
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alert when error rate is high',
  });

  // ============ CLOUDTRAIL ============

  const trailBucket = new s3.Bucket(stack, 'CloudTrailLogsBucket', {
    bucketName: `modeled-management-cloudtrail-${cdk.Aws.ACCOUNT_ID}`,
    versioned: true,
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    removalPolicy: cdk.RemovalPolicy.RETAIN,
    lifecycleRules: [
      {
        id: 'DeleteOldLogs',
        expiration: cdk.Duration.days(90),
      },
    ],
  });

  const trail = new cloudtrail.Trail(stack, 'ModeledManagementTrail', {
    trailName: 'ModeledManagement-SecurityTrail',
    bucket: trailBucket,
    isMultiRegionTrail: true,
    includeGlobalServiceEvents: true,
    enableFileValidation: true,
    managementEvents: cloudtrail.ReadWriteType.ALL,
    sendToCloudWatchLogs: true,
    cloudWatchLogsRetention: logs.RetentionDays.ONE_MONTH,
  });

  new cdk.CfnOutput(stack, 'CloudTrailArn', {
    value: trail.trailArn,
    description: 'CloudTrail ARN for security logging',
  });
});

