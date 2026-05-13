# S3 Lambda Trigger Setup Guide
*Created: 2026-01-05*

## 🎯 Goal

Configure S3 to automatically trigger the `photo-analysis` Lambda function when model photos are uploaded, and enable Intelligent Tiering for cost optimization.

---

## ✅ Current Status

**Good News:** The trigger is already configured in code! 

Looking at `amplify/storage/resource.ts` (lines 107-111):
```typescript
triggers: {
  'profile-photos/models/{entity_id}/*': {
    onUpload: photoAnalysisFunction,
  },
},
```

However, this needs to be **deployed** to AWS for it to work.

---

## 🚀 Setup Steps

### **Step 1: Deploy Amplify Backend**

The S3 trigger is configured in the Amplify storage resource. When you deploy, Amplify should automatically:
1. Create the S3 bucket event notification
2. Configure the Lambda function as the destination
3. Set up proper IAM permissions

**Command:**
```bash
npx ampx sandbox
# or for production:
npx ampx pipeline-deploy --branch main
```

### **Step 1.5: Enable Intelligent Tiering (Recommended)**

After deployment, enable S3 Intelligent Tiering for cost optimization:

**Quick Setup (AWS Console):**
1. Go to S3 → Your bucket → Management tab
2. Scroll to "Intelligent-Tiering"
3. Click "Create Intelligent-Tiering configuration"
4. Name: `EntireBucket`, Scope: "Apply to all objects"
5. Click "Create configuration"

**Or use AWS CLI:**
```bash
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'modeledStorage')].Name" --output text)

aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id EntireBucket \
  --intelligent-tiering-configuration '{
    "Id": "EntireBucket",
    "Status": "Enabled",
    "Filter": {}
  }'
```

**See detailed guide:** `docs/deployment/2026-01-05_S3_INTELLIGENT_TIERING_SETUP.md`

### **Step 2: Verify Deployment**

After deployment, verify in AWS Console:

1. **S3 Bucket**
   - Go to S3 → `modeledStorage-*` bucket
   - Properties → Event notifications
   - Should see event for `profile-photos/models/*`

2. **Lambda Function**
   - Go to Lambda → `photo-analysis-*` function
   - Configuration → Triggers
   - Should see S3 trigger listed

3. **IAM Permissions**
   - Lambda execution role should have:
     - `s3:GetObject` (to read uploaded photos)
     - `rekognition:DetectLabels`
     - `rekognition:DetectFaces`
     - `bedrock:InvokeModel`
     - `dynamodb:UpdateItem` (to update ModelProfile)

### **Step 3: Test the Trigger**

1. **Upload a test photo** via the Model Portal
2. **Check CloudWatch Logs:**
   ```bash
   aws logs tail /aws/lambda/photo-analysis --follow
   ```
3. **Verify DynamoDB:**
   - Check ModelProfile in DynamoDB
   - Should see `autoTaggedAttributes` populated
   - Should see `attributeConfidence` populated

---

## 🔧 Manual Configuration (If Amplify Doesn't Work)

If the Amplify deployment doesn't set up the trigger automatically, configure it manually:

### **Option 1: AWS Console**

1. **S3 Bucket Event Notification**
   - Go to S3 → Your bucket → Properties
   - Event notifications → Create event notification
   - **Event name:** `photo-analysis-trigger`
   - **Prefix:** `profile-photos/models/`
   - **Event types:** `All object create events`
   - **Destination:** Lambda function → `photo-analysis-*`

2. **Lambda Permissions**
   - Go to Lambda → `photo-analysis-*` function
   - Configuration → Permissions
   - Add S3 bucket permission (if not already added)

### **Option 2: AWS CLI**

```bash
# Get bucket name
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'modeledStorage')].Name" --output text)

# Get Lambda function ARN
LAMBDA_ARN=$(aws lambda get-function --function-name photo-analysis-* --query 'Configuration.FunctionArn' --output text)

# Add S3 permission to Lambda
aws lambda add-permission \
  --function-name photo-analysis-* \
  --principal s3.amazonaws.com \
  --statement-id s3-trigger-permission \
  --action "lambda:InvokeFunction" \
  --source-arn "arn:aws:s3:::${BUCKET_NAME}" \
  --source-account $(aws sts get-caller-identity --query Account --output text)

# Create S3 event notification
aws s3api put-bucket-notification-configuration \
  --bucket ${BUCKET_NAME} \
  --notification-configuration '{
    "LambdaFunctionConfigurations": [{
      "Id": "photo-analysis-trigger",
      "LambdaFunctionArn": "'${LAMBDA_ARN}'",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": {
        "Key": {
          "FilterRules": [{
            "Name": "Prefix",
            "Value": "profile-photos/models/"
          }]
        }
      }
    }]
  }'
```

---

## 🧪 Testing

### **Test 1: Upload Photo**
1. Go to Model Portal → Photos
2. Upload a test photo
3. Wait 10-30 seconds
4. Check CloudWatch logs for Lambda execution

### **Test 2: Verify Analysis**
1. Check DynamoDB ModelProfile
2. Verify `autoTaggedAttributes` field is populated
3. Verify `attributeConfidence` field has scores
4. Check Model Portal → Profile to see auto-tagged attributes

### **Test 3: Error Handling**
1. Upload an invalid file (too large, wrong format)
2. Verify error is logged in CloudWatch
3. Verify user sees appropriate error message

---

## 🐛 Troubleshooting

### **Trigger Not Firing**
- Check S3 event notification is configured
- Check Lambda function has S3 permission
- Check CloudWatch logs for errors
- Verify photo path matches trigger prefix

### **Lambda Errors**
- Check IAM permissions (Rekognition, Bedrock, DynamoDB)
- Check Lambda timeout (should be 60s)
- Check Lambda memory (should be 1024MB)
- Check environment variables (BEDROCK_MODEL_ID, AWS_REGION)

### **Analysis Not Saving**
- Check DynamoDB permissions
- Check ModelProfile table name in environment variables
- Check userId extraction from S3 path
- Verify DynamoDB update command

---

## 📊 Monitoring

### **CloudWatch Metrics**
- Lambda invocations
- Lambda errors
- Lambda duration
- S3 uploads to trigger path

### **CloudWatch Alarms**
Set up alarms for:
- Lambda errors > 0
- Lambda duration > 50s
- Lambda failures > 5% of invocations

---

## ✅ Success Criteria

- [ ] S3 event notification configured
- [ ] Lambda function triggered on photo upload
- [ ] Photo analysis completes successfully
- [ ] Results saved to DynamoDB ModelProfile
- [ ] Auto-tagged attributes visible in Model Portal
- [ ] Error handling works for invalid files
- [ ] CloudWatch logs show successful executions
- [ ] **Intelligent Tiering enabled (optional but recommended)**

---

## 📝 Notes

- The trigger only fires for `profile-photos/models/*` path
- Professional and partner photos don't trigger analysis (by design)
- Analysis happens asynchronously (user doesn't wait)
- Results appear in profile after analysis completes

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Deployment

