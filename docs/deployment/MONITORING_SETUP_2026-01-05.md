# CloudWatch & CloudTrail Setup Guide 📊🔒

## Overview

CloudWatch and CloudTrail are now integrated for:
- **Cost Management**: Track AWS spending in real-time
- **Performance Monitoring**: Monitor app health and performance
- **Security Logging**: Track all API calls and access events
- **Alerts**: Get notified of issues before they become problems

---

## ✅ What's Been Built

### **CloudWatch Integration**
- ✅ Custom metrics dashboard
- ✅ Billing alarm ($100/month threshold)
- ✅ Error rate alarm
- ✅ Lambda function monitoring
- ✅ DynamoDB, S3, AppSync metrics
- ✅ Log groups for Lambda functions
- ✅ Admin dashboard page (`/admin/monitoring`)

### **CloudTrail Integration**
- ✅ Security trail for all API calls
- ✅ S3 data event logging (file access)
- ✅ Lambda function invocation logging
- ✅ 90-day log retention
- ✅ CloudWatch Logs integration

### **Frontend Utilities**
- ✅ `src/utils/cloudwatch.js` - Send custom metrics
- ✅ `src/utils/cloudtrail.js` - Query security logs
- ✅ `src/admin/pages/MonitoringPage.jsx` - Admin monitoring dashboard

---

## 🚀 Setup Steps

### 1. **Deploy Backend**

The monitoring resources will be created automatically when you deploy:

```bash
npx ampx sandbox
```

This will create:
- CloudWatch dashboard: `ModeledManagement-Main`
- CloudWatch alarms
- CloudTrail trail: `ModeledManagement-SecurityTrail`
- S3 bucket for CloudTrail logs

### 2. **View CloudWatch Dashboard**

After deployment, access your dashboard:

1. Go to AWS Console → **CloudWatch** → **Dashboards**
2. Find `ModeledManagement-Main`
3. Or access from admin dashboard: `/admin/monitoring`

### 3. **View CloudTrail Logs**

1. Go to AWS Console → **CloudTrail** → **Event history**
2. Or access from admin dashboard: `/admin/monitoring` → Security tab

### 4. **Set Up Billing Alerts (Optional)**

The billing alarm is already configured for $100/month. To change:

1. Go to AWS Console → **CloudWatch** → **Alarms**
2. Find `ModeledManagement-MonthlyBilling`
3. Edit threshold as needed

---

## 💻 Using Custom Metrics

### Track Booking Confirmation

```javascript
import { trackBookingConfirmation } from '../utils/cloudwatch';

await trackBookingConfirmation({
  serviceType: 'Highlights',
  status: 'confirmed',
});
```

### Track Payment

```javascript
import { trackPayment } from '../utils/cloudwatch';

await trackPayment(25.00, 'success');
```

### Track Notification

```javascript
import { trackNotification } from '../utils/cloudwatch';

await trackNotification('booking_confirmation', 'email', true);
```

### Track User Activity

```javascript
import { trackUserActivity } from '../utils/cloudwatch';

await trackUserActivity('login', 'model');
```

---

## 📊 Admin Dashboard

Access the monitoring dashboard at `/admin/monitoring`:

### **Costs Tab**
- Total monthly costs
- Breakdown by service (Lambda, DynamoDB, S3, AppSync)
- Billing alarms status
- Links to CloudWatch console

### **Performance Tab**
- API latency
- Error rates
- Active users
- Bookings today

### **Security Tab**
- Recent security events
- Failed login attempts
- API call history
- Links to CloudTrail console

---

## 🔔 Alarms

### **Billing Alarm**
- **Name**: `ModeledManagement-MonthlyBilling`
- **Threshold**: $100/month
- **Action**: Sends notification when exceeded

### **Error Rate Alarm**
- **Name**: `ModeledManagement-HighErrorRate`
- **Threshold**: 10 errors in 5 minutes
- **Action**: Alerts when error rate is high

### **Lambda Duration Alarm**
- **Name**: `ModeledManagement-LambdaSlow`
- **Threshold**: 10 seconds average
- **Action**: Alerts when functions are slow

---

## 🔒 CloudTrail Security

### **What's Logged**
- All AWS API calls
- User login/logout
- Data access (S3, DynamoDB)
- Lambda function invocations
- Permission changes
- Failed access attempts

### **Log Retention**
- **CloudTrail**: 90 days in S3
- **CloudWatch Logs**: 30 days

### **Access Logs**
1. AWS Console → **CloudTrail** → **Event history**
2. Filter by:
   - User
   - Service
   - Time range
   - Event type

---

## 💰 Cost

### **CloudWatch**
- **Free Tier**: 10 custom metrics, 5GB logs, 10 alarms
- **After Free Tier**: ~$5-15/month for typical usage

### **CloudTrail**
- **Free Tier**: 1 trail (management events)
- **After Free Tier**: ~$2-10/month for data events

**Total**: ~$7-25/month for full monitoring

---

## 🧪 Testing

### Test Custom Metrics

```javascript
import { putMetric } from '../utils/cloudwatch';

// Send a test metric
await putMetric('TestMetric', 1, 'Count', {
  Test: 'true',
});

// Check CloudWatch console after a few minutes
```

### Test CloudTrail

1. Perform an action (e.g., create a booking)
2. Wait 5-10 minutes
3. Check CloudTrail Event History
4. Filter by your action

---

## 📚 Resources

- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [CloudTrail Documentation](https://docs.aws.amazon.com/cloudtrail/)
- [CloudWatch Pricing](https://aws.amazon.com/cloudwatch/pricing/)
- [CloudTrail Pricing](https://aws.amazon.com/cloudtrail/pricing/)

---

## ✅ Next Steps

1. ✅ Deploy backend (`npx ampx sandbox`)
2. ✅ View CloudWatch dashboard
3. ✅ Check CloudTrail logs
4. ⏳ Integrate metrics into booking flow
5. ⏳ Set up SNS notifications for alarms (optional)
6. ⏳ Customize alarm thresholds

---

## 🆘 Troubleshooting

### "Dashboard not found"
- Wait a few minutes after deployment
- Check CloudWatch console directly
- Verify deployment succeeded

### "No metrics showing"
- Custom metrics may take 1-2 minutes to appear
- Check that you're sending metrics correctly
- Verify IAM permissions

### "CloudTrail events not showing"
- Events may take 5-10 minutes to appear
- Check CloudTrail trail is active
- Verify S3 bucket permissions

---

**Status**: ✅ Ready to deploy and use!

