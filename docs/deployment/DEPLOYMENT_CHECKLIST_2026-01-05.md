# Deployment Checklist - Modeled Management Platform
## Prioritized Pre-Launch Tasks

---

## 🎯 **Priority 1: Core Automation (Before Soft Launch)**

### **1. S3 Lambda Triggers for Photo Analysis** ⭐ **HIGHEST PRIORITY**

**What**: Automate Rekognition/Bedrock tagging when photos are uploaded
**Why**: Critical for matching engine - photos need to be auto-tagged immediately
**Impact**: Enables matching engine to work with real data

**Tasks**:
- [ ] Configure S3 event trigger for `profile-photos/models/` uploads
- [ ] Connect to `photo-analysis` Lambda function
- [ ] Test trigger with sample photo upload
- [ ] Verify Rekognition labels are detected
- [ ] Verify Bedrock analysis completes
- [ ] Verify auto-tagged attributes save to DynamoDB
- [ ] Test error handling (invalid image, API failures)
- [ ] Set up retry logic for failed analyses

**AWS Console Steps**:
1. Go to S3 → `modeledStorage` bucket → Properties → Event notifications
2. Create event: `s3:ObjectCreated:*` for path `profile-photos/models/*`
3. Destination: Lambda function `photo-analysis`
4. Test with a sample upload

**Code Check**:
- ✅ Lambda function exists: `amplify/functions/photo-analysis/`
- ✅ Handler processes S3 events
- ✅ Calls Rekognition + Bedrock
- ✅ Updates DynamoDB ModelProfile

**Estimated Time**: 2-3 hours
**Risk**: Medium (if fails, photos won't be tagged, matching won't work)

---

### **2. Stripe Webhook Testing** ⭐ **HIGH PRIORITY**

**What**: Test end-to-end payment flow with real Stripe webhooks
**Why**: Payments are critical - need to verify everything works before launch
**Impact**: Ensures booking payments process correctly

**Tasks**:
- [ ] Set up Stripe test account
- [ ] Configure Stripe webhook endpoint in Amplify
- [ ] Test `payment_intent.succeeded` webhook
- [ ] Test `payment_intent.payment_failed` webhook
- [ ] Verify booking status updates on payment
- [ ] Test refund flow
- [ ] Test with real card (test mode)
- [ ] Switch to live mode when ready
- [ ] Set up webhook secret in Secrets Manager

**Stripe Dashboard Steps**:
1. Go to Developers → Webhooks
2. Add endpoint: `https://your-amplify-url.com/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook signing secret
5. Add to AWS Secrets Manager as `stripe-webhook-secret`

**Code Check**:
- ✅ Lambda function exists: `amplify/functions/stripe-payment/`
- ✅ Webhook handler validates signature
- ✅ Updates booking status on payment
- ✅ Sends notifications

**Estimated Time**: 3-4 hours
**Risk**: High (if fails, payments won't process)

---

## 🎯 **Priority 2: Monitoring & Alerts (Before Soft Launch)**

### **3. CloudWatch Alarms** ⭐ **HIGH PRIORITY**

**What**: Set up alerts for Lambda errors and DynamoDB throttling
**Why**: Need to know immediately if something breaks
**Impact**: Prevents silent failures, enables quick response

**Tasks**:
- [ ] Create CloudWatch alarm for Lambda errors
  - Metric: `Errors` for all Lambda functions
  - Threshold: > 0 errors in 5 minutes
  - Action: Send to SNS topic (email/SMS)
- [ ] Create CloudWatch alarm for DynamoDB throttling
  - Metric: `ThrottledRequests` for DynamoDB tables
  - Threshold: > 10 throttled requests in 5 minutes
  - Action: Send to SNS topic
- [ ] Create CloudWatch alarm for Lambda duration
  - Metric: `Duration` > 10 seconds
  - Action: Send to SNS topic
- [ ] Create CloudWatch alarm for API errors (AppSync)
  - Metric: `4XXError` or `5XXError`
  - Threshold: > 10 errors in 5 minutes
  - Action: Send to SNS topic
- [ ] Set up SNS topic for alerts
- [ ] Subscribe email/SMS to SNS topic
- [ ] Test alarms (trigger intentionally, verify alerts)

**AWS Console Steps**:
1. Go to CloudWatch → Alarms → Create alarm
2. Select metric (e.g., Lambda Errors)
3. Set threshold and period
4. Configure SNS action
5. Create SNS topic if needed
6. Subscribe email/SMS

**Recommended Alarms**:
- Lambda Errors (all functions)
- DynamoDB Throttling (all tables)
- Lambda Duration > 10s
- AppSync 4XX/5XX Errors
- S3 Upload Failures
- Stripe Webhook Failures

**Estimated Time**: 2-3 hours
**Risk**: Low (monitoring only, doesn't affect functionality)

---

### **4. Resource Tagging for Cost Tracking** ⭐ **MEDIUM PRIORITY**

**What**: Tag all AWS resources for Cost Explorer breakdowns
**Why**: Need to track costs by project, environment, service
**Impact**: Better cost visibility and optimization

**Tasks**:
- [ ] Tag all Lambda functions
  - `project: modeled`
  - `environment: production` (or `staging`)
  - `service: photo-analysis` (or function name)
- [ ] Tag all DynamoDB tables
  - `project: modeled`
  - `environment: production`
  - `table: ModelProfile` (or table name)
- [ ] Tag all S3 buckets
  - `project: modeled`
  - `environment: production`
  - `bucket: storage` (or bucket name)
- [ ] Tag all AppSync APIs
  - `project: modeled`
  - `environment: production`
- [ ] Tag all Amplify apps
  - `project: modeled`
  - `environment: production`
- [ ] Tag RDS instance (if using)
  - `project: modeled`
  - `environment: production`
- [ ] Verify tags in Cost Explorer
- [ ] Create Cost Explorer report by project tag

**Tagging Strategy**:
```
Required Tags:
- project: modeled
- environment: production | staging | development
- managed-by: amplify (or manual)

Optional Tags:
- service: photo-analysis | stripe-payment | etc.
- cost-center: engineering | operations
- owner: yasmeen@modeled.com
```

**AWS Console Steps**:
1. Go to each service (Lambda, DynamoDB, S3, etc.)
2. Select resource → Tags tab → Add tags
3. Or use AWS CLI/Terraform for bulk tagging

**Estimated Time**: 1-2 hours
**Risk**: None (metadata only)

---

## 🎯 **Priority 3: Pre-Launch Testing**

### **5. End-to-End Integration Testing**

**What**: Test the full flow with real AWS services
**Why**: Verify everything works together before users see it
**Impact**: Prevents broken user experience

**Tasks**:
- [ ] Test Model signup → Profile creation → Photo upload → Auto-tagging
- [ ] Test Pro request creation → Admin matching → Model notification
- [ ] Test Model accepts → Booking created → Payment processed
- [ ] Test Stripe payment → Webhook → Booking confirmed
- [ ] Test calendar updates across all portals
- [ ] Test notification delivery (email/SMS)
- [ ] Load test with 10-50 concurrent users
- [ ] Test error scenarios (failed payments, API errors)

**Estimated Time**: 4-6 hours
**Risk**: Medium (might find issues, but better to find now)

---

## 🎯 **Priority 4: Security & Compliance**

### **6. Security Hardening**

**Tasks**:
- [ ] Enable S3 bucket encryption
- [ ] Enable DynamoDB encryption at rest
- [ ] Review IAM permissions (least privilege)
- [ ] Enable CloudTrail for audit logging
- [ ] Set up WAF rules (if needed)
- [ ] Review Secrets Manager access
- [ ] Enable MFA for AWS Console access

**Estimated Time**: 2-3 hours
**Risk**: Low (security improvements)

---

## 📋 **Recommended Deployment Order**

### **Week 1: Core Automation**
1. ✅ S3 Lambda triggers for photo analysis
2. ✅ Stripe webhook testing
3. ✅ Basic CloudWatch alarms

### **Week 2: Monitoring & Tagging**
4. ✅ Complete CloudWatch alarms
5. ✅ Resource tagging
6. ✅ Cost Explorer setup

### **Week 3: Testing & Hardening**
7. ✅ End-to-end testing
8. ✅ Security hardening
9. ✅ Load testing

### **Week 4: Soft Launch**
10. ✅ Deploy to production
11. ✅ Monitor closely for first week
12. ✅ Fix any issues

---

## 🚨 **Critical Path Items**

**Must Have Before Launch**:
1. ✅ S3 Lambda triggers (photo analysis won't work)
2. ✅ Stripe webhooks (payments won't process)
3. ✅ Basic CloudWatch alarms (won't know if things break)

**Nice to Have**:
- Resource tagging (helps with costs, but not critical)
- Advanced monitoring (can add later)
- Security hardening (important, but can iterate)

---

## 📊 **Success Metrics**

**After Deployment, Monitor**:
- Photo upload → Auto-tagging success rate (target: >95%)
- Stripe payment success rate (target: >98%)
- Lambda error rate (target: <1%)
- DynamoDB throttling (target: 0)
- Average response time (target: <2s)
- Cost per transaction (track in Cost Explorer)

---

## 🛠️ **Quick Reference Commands**

### **Test S3 Trigger**
```bash
# Upload test photo via Amplify Storage
# Check CloudWatch logs for Lambda execution
aws logs tail /aws/lambda/photo-analysis --follow
```

### **Test Stripe Webhook**
```bash
# Use Stripe CLI to send test webhook
stripe listen --forward-to https://your-endpoint.com/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### **Check CloudWatch Alarms**
```bash
aws cloudwatch describe-alarms --alarm-name-prefix "modeled-"
```

### **Tag Resources (Bulk)**
```bash
# Example: Tag all Lambda functions
aws lambda list-functions --query 'Functions[].FunctionName' | \
  xargs -I {} aws lambda tag-resource \
    --resource arn:aws:lambda:region:account:function:{} \
    --tags project=modeled,environment=production
```

---

## 📝 **Notes**

- **Test Mode First**: Always test in staging/test environment before production
- **Gradual Rollout**: Consider feature flags for new functionality
- **Monitor Closely**: First week after launch, watch everything
- **Document Issues**: Keep a log of any problems and fixes
- **Iterate**: Don't try to perfect everything - launch, learn, improve

---

**Estimated Total Time**: 12-18 hours over 3-4 weeks
**Risk Level**: Low (if done in order, with testing at each step)
