# CloudWatch & CloudTrail Deployment Guide 🚀

## Quick Setup

Since Amplify Gen 2 doesn't directly support CDK resources in the same way, you have two options:

### Option 1: Manual Setup (Recommended for Now)

Set up CloudWatch and CloudTrail via AWS Console - takes ~10 minutes:

1. **CloudWatch Dashboard**:
   - Go to AWS Console → CloudWatch → Dashboards
   - Create dashboard: `ModeledManagement-Main`
   - Add widgets for Lambda, DynamoDB, S3, AppSync metrics

2. **CloudWatch Alarms**:
   - Go to CloudWatch → Alarms
   - Create billing alarm (threshold: $100/month)
   - Create error rate alarm

3. **CloudTrail**:
   - Go to CloudTrail → Create trail
   - Name: `ModeledManagement-SecurityTrail`
   - Enable for all regions
   - Enable CloudWatch Logs integration

### Option 2: CDK Stack (Advanced)

Deploy monitoring resources via separate CDK stack:

```bash
# Create CDK stack
cdk init app --language typescript
# Copy resources from amplify/monitoring/resource.ts
cdk deploy
```

---

## What's Already Built

✅ **Frontend Monitoring Dashboard**: `/admin/monitoring`
✅ **CloudWatch Utilities**: `src/utils/cloudwatch.js`
✅ **CloudTrail Utilities**: `src/utils/cloudtrail.js`
✅ **Admin Integration**: Monitoring page added to admin sidebar

---

## Next Steps

1. Deploy your Amplify backend: `npx ampx sandbox`
2. Set up CloudWatch/CloudTrail (Option 1 or 2 above)
3. Access monitoring dashboard: `/admin/monitoring`
4. Start tracking metrics in your code

---

**Note**: The monitoring infrastructure code is ready - you just need to deploy it via AWS Console or CDK. The frontend is fully integrated and ready to use!

