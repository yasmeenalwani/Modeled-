import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

/**
 * CloudWatch Metrics Utilities
 * 
 * Functions to send custom business metrics to CloudWatch
 */

const cloudwatchClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'us-east-1' });
const NAMESPACE = 'ModeledManagement/Custom';

/**
 * Send a custom metric to CloudWatch
 * 
 * @param {string} metricName - Name of the metric
 * @param {number} value - Metric value
 * @param {string} unit - Unit (Count, Seconds, Bytes, etc.)
 * @param {Object} dimensions - Additional dimensions (e.g., { ServiceType: 'haircut' })
 */
export async function putMetric(metricName, value, unit = 'Count', dimensions = {}) {
  try {
    const dimensionArray = Object.entries(dimensions).map(([Name, Value]) => ({
      Name,
      Value: String(Value),
    }));

    const command = new PutMetricDataCommand({
      Namespace: NAMESPACE,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: dimensionArray,
          Timestamp: new Date(),
        },
      ],
    });

    await cloudwatchClient.send(command);
  } catch (error) {
    console.error(`Failed to send metric ${metricName}:`, error);
    // Don't throw - metrics shouldn't break the app
  }
}

/**
 * Track booking confirmation
 */
export async function trackBookingConfirmation(booking) {
  await putMetric('BookingConfirmed', 1, 'Count', {
    ServiceType: booking.serviceType || 'unknown',
    Status: booking.status || 'confirmed',
  });
}

/**
 * Track payment processed
 */
export async function trackPayment(amount, status) {
  await putMetric('PaymentProcessed', 1, 'Count', {
    Status: status, // 'success', 'failed', 'refunded'
  });
  
  await putMetric('PaymentAmount', amount, 'None', {
    Status: status,
  });
}

/**
 * Track notification sent
 */
export async function trackNotification(type, channel, success) {
  await putMetric('NotificationSent', 1, 'Count', {
    Type: type, // 'booking_confirmation', 'reminder', etc.
    Channel: channel, // 'email', 'sms', 'both'
    Success: success ? 'true' : 'false',
  });
}

/**
 * Track match created
 */
export async function trackMatchCreated(matchScore) {
  await putMetric('MatchCreated', 1, 'Count');
  await putMetric('MatchScore', matchScore, 'None');
}

/**
 * Track user activity
 */
export async function trackUserActivity(action, userType) {
  await putMetric('UserActivity', 1, 'Count', {
    Action: action, // 'login', 'booking_view', 'profile_update', etc.
    UserType: userType, // 'model', 'professional', 'partner', 'admin'
  });
}

/**
 * Track API performance
 */
export async function trackAPIPerformance(operation, duration, success) {
  await putMetric('APILatency', duration, 'Milliseconds', {
    Operation: operation,
    Success: success ? 'true' : 'false',
  });
}

/**
 * Track storage usage
 */
export async function trackStorageOperation(operation, fileSize, fileType) {
  await putMetric('StorageOperation', 1, 'Count', {
    Operation: operation, // 'upload', 'download', 'delete'
    FileType: fileType || 'unknown',
  });
  
  if (fileSize) {
    await putMetric('StorageBytes', fileSize, 'Bytes', {
      Operation: operation,
    });
  }
}

/**
 * Track error
 */
export async function trackError(errorType, context) {
  await putMetric('ErrorOccurred', 1, 'Count', {
    ErrorType: errorType,
    Context: context || 'unknown',
  });
}

