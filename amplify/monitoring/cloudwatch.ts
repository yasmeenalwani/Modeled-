import { defineBackend } from '@aws-amplify/backend';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';

/**
 * CloudWatch Monitoring Configuration
 * 
 * Sets up:
 * - Custom metrics dashboards
 * - Billing alarms
 * - Error rate alarms
 * - Log groups
 */
export function addCloudWatchMonitoring(stack: cdk.Stack) {
  // ============ LOG GROUPS ============
  
  // Stripe Payment Function Logs
  new logs.LogGroup(stack, 'StripePaymentLogs', {
    logGroupName: '/aws/lambda/stripe-payment',
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  // Notifications Function Logs
  new logs.LogGroup(stack, 'NotificationsLogs', {
    logGroupName: '/aws/lambda/notifications',
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  // ============ CUSTOM METRICS DASHBOARD ============
  
  const dashboard = new cloudwatch.Dashboard(stack, 'ModeledManagementDashboard', {
    dashboardName: 'ModeledManagement-Main',
  });

  // Cost Overview Widget
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

  // Lambda Invocations
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'Lambda Invocations',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensionsMap: {
            FunctionName: 'stripe-payment',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Stripe Payments',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensionsMap: {
            FunctionName: 'notifications',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Notifications',
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // Lambda Errors
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'Lambda Errors',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: 'stripe-payment',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Stripe Payment Errors',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensionsMap: {
            FunctionName: 'notifications',
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Notification Errors',
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // DynamoDB Metrics
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'DynamoDB Read/Write Capacity',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedReadCapacityUnits',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Read Capacity',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/DynamoDB',
          metricName: 'ConsumedWriteCapacityUnits',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: 'Write Capacity',
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // S3 Storage
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'S3 Storage (Bytes)',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/S3',
          metricName: 'BucketSizeBytes',
          statistic: 'Average',
          period: cdk.Duration.days(1),
          label: 'Storage Used',
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // AppSync Metrics
  dashboard.addWidgets(
    new cloudwatch.GraphWidget({
      title: 'AppSync API Calls',
      left: [
        new cloudwatch.Metric({
          namespace: 'AWS/AppSync',
          metricName: '4XXError',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '4XX Errors',
        }),
        new cloudwatch.Metric({
          namespace: 'AWS/AppSync',
          metricName: '5XXError',
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
          label: '5XX Errors',
        }),
      ],
      width: 12,
      height: 6,
    })
  );

  // ============ ALARMS ============

  // Billing Alarm (Alert if monthly cost exceeds threshold)
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
    threshold: 100, // Alert if cost exceeds $100/month
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alert when monthly AWS costs exceed $100',
  });

  // High Error Rate Alarm
  new cloudwatch.Alarm(stack, 'HighErrorRateAlarm', {
    alarmName: 'ModeledManagement-HighErrorRate',
    metric: new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Errors',
      statistic: 'Sum',
      period: cdk.Duration.minutes(5),
    }),
    threshold: 10, // Alert if more than 10 errors in 5 minutes
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alert when error rate is high',
  });

  // Lambda Duration Alarm
  new cloudwatch.Alarm(stack, 'LambdaDurationAlarm', {
    alarmName: 'ModeledManagement-LambdaSlow',
    metric: new cloudwatch.Metric({
      namespace: 'AWS/Lambda',
      metricName: 'Duration',
      statistic: 'Average',
      period: cdk.Duration.minutes(5),
    }),
    threshold: 10000, // Alert if average duration > 10 seconds
    evaluationPeriods: 2,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    alarmDescription: 'Alert when Lambda functions are slow',
  });
}

