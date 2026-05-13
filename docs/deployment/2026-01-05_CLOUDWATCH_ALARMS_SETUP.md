# CloudWatch Alarms Setup Guide
*Created: 2026-01-05*

## 🎯 Goal

Set up comprehensive CloudWatch alarms to monitor critical system health metrics and get notified immediately when issues occur.

---

## 📊 Alarm Strategy

### **Critical Alarms (Must Have)**
These alert you immediately when something breaks:
- Lambda function errors
- DynamoDB throttling
- AppSync API errors
- SES bounce/complaint rates

### **Performance Alarms (Should Have)**
These alert you when performance degrades:
- Lambda duration too high
- DynamoDB capacity issues
- API response times

### **Cost Alarms (Nice to Have)**
These alert you about unexpected costs:
- Monthly billing threshold
- S3 storage growth
- Data transfer costs

---

## 🚀 Setup Steps

### **Step 1: Create SNS Topic for Alerts**

First, create an SNS topic to receive alarm notifications:

#### **Option A: AWS Console**

1. **Go to SNS Console**
   - Navigate to SNS → Topics
   - Click "Create topic"

2. **Create Topic**
   - **Type:** Standard
   - **Name:** `modeled-management-alerts`
   - **Display name:** `Modeled Management Alerts`
   - Click "Create topic"

3. **Subscribe Email**
   - Click on the topic
   - Click "Create subscription"
   - **Protocol:** Email
   - **Endpoint:** Your email address
   - Click "Create subscription"
   - **Check your email** and confirm subscription

4. **Subscribe SMS (Optional)**
   - Click "Create subscription"
   - **Protocol:** SMS
   - **Endpoint:** Your phone number (+1234567890)
   - Click "Create subscription"

#### **Option B: AWS CLI**

```bash
# Create SNS topic
aws sns create-topic --name modeled-management-alerts

# Get topic ARN
TOPIC_ARN=$(aws sns list-topics --query "Topics[?contains(TopicArn, 'modeled-management-alerts')].TopicArn" --output text)

# Subscribe email
aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com

# Subscribe SMS (optional)
aws sns subscribe \
  --topic-arn $TOPIC_ARN \
  --protocol sms \
  --notification-endpoint +1234567890
```

---

## 🔴 Critical Alarms

### **Alarm 1: Lambda Function Errors**

**What:** Alert when any Lambda function has errors

**Setup:**

1. **Go to CloudWatch Console**
   - Navigate to CloudWatch → Alarms → All alarms
   - Click "Create alarm"

2. **Select Metric**
   - Click "Select metric"
   - **Namespace:** AWS/Lambda
   - **Metric name:** Errors
   - **Function name:** Select "All functions" or specific function
   - Click "Select metric"

3. **Configure Alarm**
   - **Alarm name:** `ModeledManagement-LambdaErrors`
   - **Threshold type:** Static
   - **Whenever Errors is:** Greater than threshold
   - **Threshold value:** `1` (alert on any error)
   - **Evaluation period:** 1 period of 5 minutes
   - Click "Next"

4. **Configure Actions**
   - **Notification:** Select your SNS topic
   - Click "Next"

5. **Add Description**
   - **Alarm description:** `Alert when Lambda functions have errors`
   - Click "Next" → "Create alarm"

**AWS CLI:**
```bash
TOPIC_ARN=$(aws sns list-topics --query "Topics[?contains(TopicArn, 'modeled-management-alerts')].TopicArn" --output text)

aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-LambdaErrors \
  --alarm-description "Alert when Lambda functions have errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

### **Alarm 2: DynamoDB Throttling**

**What:** Alert when DynamoDB tables are being throttled

**Setup:**

1. **Create Alarm**
   - CloudWatch → Alarms → Create alarm
   - **Metric:** AWS/DynamoDB → ThrottledRequests
   - **Table name:** Select all tables or specific table
   - **Alarm name:** `ModeledManagement-DynamoDBThrottling`
   - **Threshold:** Greater than `10` in 5 minutes
   - **Action:** Send to SNS topic

**AWS CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-DynamoDBThrottling \
  --alarm-description "Alert when DynamoDB tables are throttled" \
  --metric-name ThrottledRequests \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

### **Alarm 3: AppSync API Errors**

**What:** Alert when AppSync API has errors

**Setup:**

1. **Create Alarm for 5XX Errors**
   - **Metric:** AWS/AppSync → 5XXError
   - **Alarm name:** `ModeledManagement-AppSync5XXErrors`
   - **Threshold:** Greater than `5` in 5 minutes
   - **Action:** Send to SNS topic

2. **Create Alarm for 4XX Errors (Optional)**
   - **Metric:** AWS/AppSync → 4XXError
   - **Alarm name:** `ModeledManagement-AppSync4XXErrors`
   - **Threshold:** Greater than `50` in 5 minutes (higher threshold for client errors)

**AWS CLI:**
```bash
# 5XX Errors
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-AppSync5XXErrors \
  --alarm-description "Alert when AppSync has server errors" \
  --metric-name 5XXError \
  --namespace AWS/AppSync \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN

# 4XX Errors (optional)
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-AppSync4XXErrors \
  --alarm-description "Alert when AppSync has high client errors" \
  --metric-name 4XXError \
  --namespace AWS/AppSync \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

### **Alarm 4: SES Bounce Rate**

**What:** Alert when email bounce rate is too high

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/SES → Reputation.BounceRate
   - **Alarm name:** `ModeledManagement-SESBounceRate`
   - **Threshold:** Greater than `5%` (5.0)
   - **Action:** Send to SNS topic

**AWS CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-SESBounceRate \
  --alarm-description "Alert when SES bounce rate exceeds 5%" \
  --metric-name Reputation.BounceRate \
  --namespace AWS/SES \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 5.0 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

### **Alarm 5: SES Complaint Rate**

**What:** Alert when email complaint rate is too high

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/SES → Reputation.ComplaintRate
   - **Alarm name:** `ModeledManagement-SESComplaintRate`
   - **Threshold:** Greater than `0.1%` (0.1)
   - **Action:** Send to SNS topic

**AWS CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-SESComplaintRate \
  --alarm-description "Alert when SES complaint rate exceeds 0.1%" \
  --metric-name Reputation.ComplaintRate \
  --namespace AWS/SES \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 0.1 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

## ⚡ Performance Alarms

### **Alarm 6: Lambda Duration**

**What:** Alert when Lambda functions are too slow

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/Lambda → Duration
   - **Alarm name:** `ModeledManagement-LambdaSlow`
   - **Threshold:** Greater than `10000` milliseconds (10 seconds)
   - **Statistic:** Average
   - **Evaluation periods:** 2 (to avoid false alarms)
   - **Action:** Send to SNS topic

**AWS CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-LambdaSlow \
  --alarm-description "Alert when Lambda functions are slow (>10s)" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 10000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions $TOPIC_ARN
```

---

### **Alarm 7: DynamoDB Capacity**

**What:** Alert when DynamoDB is approaching capacity limits

**Setup:**

1. **Create Alarm for Read Capacity**
   - **Metric:** AWS/DynamoDB → ConsumedReadCapacityUnits
   - **Alarm name:** `ModeledManagement-DynamoDBReadCapacity`
   - **Threshold:** Greater than `80%` of provisioned capacity
   - **Action:** Send to SNS topic

2. **Create Alarm for Write Capacity**
   - **Metric:** AWS/DynamoDB → ConsumedWriteCapacityUnits
   - **Alarm name:** `ModeledManagement-DynamoDBWriteCapacity`
   - **Threshold:** Greater than `80%` of provisioned capacity
   - **Action:** Send to SNS topic

**Note:** For on-demand tables, monitor throttling instead.

---

### **Alarm 8: AppSync Latency**

**What:** Alert when API response times are high

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/AppSync → Latency
   - **Alarm name:** `ModeledManagement-AppSyncLatency`
   - **Threshold:** Greater than `2000` milliseconds (2 seconds)
   - **Statistic:** p95 (95th percentile)
   - **Action:** Send to SNS topic

---

## 💰 Cost Alarms

### **Alarm 9: Monthly Billing**

**What:** Alert when monthly AWS costs exceed threshold

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/Billing → EstimatedCharges
   - **Dimension:** Currency = USD
   - **Alarm name:** `ModeledManagement-MonthlyBilling`
   - **Threshold:** Greater than `$100` (adjust as needed)
   - **Period:** 6 hours (billing updates every 6 hours)
   - **Action:** Send to SNS topic

**AWS CLI:**
```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-MonthlyBilling \
  --alarm-description "Alert when monthly AWS costs exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=Currency,Value=USD \
  --alarm-actions $TOPIC_ARN
```

**Note:** Billing metrics must be enabled in Billing Console first.

---

### **Alarm 10: S3 Storage Growth**

**What:** Alert when S3 storage is growing unexpectedly

**Setup:**

1. **Create Alarm**
   - **Metric:** AWS/S3 → BucketSizeBytes
   - **Alarm name:** `ModeledManagement-S3StorageGrowth`
   - **Threshold:** Greater than `50 GB` (adjust as needed)
   - **Period:** 1 day (storage metrics update daily)
   - **Action:** Send to SNS topic

---

## 🔧 Function-Specific Alarms

### **Photo Analysis Function**

```bash
# Get function name
FUNCTION_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'photo-analysis')].FunctionName" --output text)

# Error alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-PhotoAnalysisErrors \
  --alarm-description "Alert when photo analysis fails" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=$FUNCTION_NAME \
  --alarm-actions $TOPIC_ARN

# Duration alarm
aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-PhotoAnalysisSlow \
  --alarm-description "Alert when photo analysis is slow" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --evaluation-periods 2 \
  --threshold 60000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=$FUNCTION_NAME \
  --alarm-actions $TOPIC_ARN
```

### **Notifications Function**

```bash
FUNCTION_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'notifications')].FunctionName" --output text)

aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-NotificationErrors \
  --alarm-description "Alert when notifications fail" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=$FUNCTION_NAME \
  --alarm-actions $TOPIC_ARN
```

### **Stripe Payment Function**

```bash
FUNCTION_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'stripe-payment')].FunctionName" --output text)

aws cloudwatch put-metric-alarm \
  --alarm-name ModeledManagement-StripePaymentErrors \
  --alarm-description "Alert when Stripe payments fail" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=$FUNCTION_NAME \
  --alarm-actions $TOPIC_ARN
```

---

## 📊 CloudWatch Dashboard

### **Create Custom Dashboard**

1. **Go to CloudWatch Console**
   - Navigate to CloudWatch → Dashboards
   - Click "Create dashboard"

2. **Add Widgets**
   - **Lambda Errors:** Graph widget showing all Lambda errors
   - **Lambda Duration:** Graph widget showing average duration
   - **DynamoDB Throttling:** Graph widget showing throttled requests
   - **AppSync Errors:** Graph widget showing 4XX/5XX errors
   - **SES Metrics:** Graph widget showing bounce/complaint rates
   - **Cost Overview:** Number widget showing estimated charges

3. **Save Dashboard**
   - Name: `ModeledManagement-Main`
   - Click "Save dashboard"

---

## 🧪 Testing Alarms

### **Test 1: Trigger Lambda Error**

1. **Intentionally cause error**
   - Invoke Lambda with invalid payload
   - Or modify Lambda code to throw error

2. **Verify Alarm**
   - Wait 5 minutes
   - Check CloudWatch → Alarms
   - Alarm should be in "ALARM" state
   - Check email/SMS for notification

### **Test 2: Test SNS Topic**

```bash
# Send test message
TOPIC_ARN=$(aws sns list-topics --query "Topics[?contains(TopicArn, 'modeled-management-alerts')].TopicArn" --output text)

aws sns publish \
  --topic-arn $TOPIC_ARN \
  --message "Test alert from Modeled Management" \
  --subject "Test Alert"
```

---

## 📋 Recommended Alarm Summary

| Alarm Name | Metric | Threshold | Priority |
|------------|--------|-----------|----------|
| Lambda Errors | AWS/Lambda Errors | > 1 in 5 min | 🔴 Critical |
| DynamoDB Throttling | AWS/DynamoDB ThrottledRequests | > 10 in 5 min | 🔴 Critical |
| AppSync 5XX Errors | AWS/AppSync 5XXError | > 5 in 5 min | 🔴 Critical |
| SES Bounce Rate | AWS/SES Reputation.BounceRate | > 5% | 🔴 Critical |
| SES Complaint Rate | AWS/SES Reputation.ComplaintRate | > 0.1% | 🔴 Critical |
| Lambda Duration | AWS/Lambda Duration | > 10s (avg) | 🟠 High |
| AppSync Latency | AWS/AppSync Latency | > 2s (p95) | 🟠 High |
| Monthly Billing | AWS/Billing EstimatedCharges | > $100 | 🟡 Medium |
| S3 Storage | AWS/S3 BucketSizeBytes | > 50 GB | 🟡 Medium |

---

## 🔄 Integration with Existing Monitoring

The monitoring code in `amplify/monitoring/resource.ts` can be integrated into the backend. To activate it:

1. **Update backend.ts** to include monitoring:
```typescript
import { monitoring } from './monitoring/resource';

defineBackend({
  auth,
  data,
  storage,
  // ... other resources
  ...monitoring, // Add monitoring
});
```

2. **Deploy:**
```bash
npx ampx sandbox
```

This will create:
- CloudWatch dashboard
- Basic alarms (billing, error rate, duration)
- Log groups

---

## 📝 Quick Setup Script

I'll create a PowerShell script to set up all alarms at once:

```powershell
# See scripts/setup-cloudwatch-alarms.ps1
```

---

## ✅ Success Criteria

- [ ] SNS topic created and subscribed
- [ ] All critical alarms created
- [ ] Alarms tested and working
- [ ] Email/SMS notifications received
- [ ] CloudWatch dashboard created
- [ ] Monitoring integrated into backend (optional)

---

## 🐛 Troubleshooting

### **Alarm Not Triggering**
- Check metric is being published
- Verify threshold is correct
- Check evaluation period
- Verify SNS topic is subscribed

### **Too Many Alerts**
- Increase threshold
- Increase evaluation periods
- Add alarm action to suppress during maintenance

### **No Notifications**
- Check SNS subscription is confirmed
- Verify email/SMS is correct
- Check spam folder
- Verify SNS topic ARN in alarm

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Setup

