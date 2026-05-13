# S3 Intelligent Tiering Setup Guide
*Created: 2026-01-05*

## 🎯 Goal

Enable S3 Intelligent Tiering on the `modeledStorage` bucket to automatically optimize storage costs based on access patterns.

---

## 📊 What is Intelligent Tiering?

S3 Intelligent-Tiering automatically moves objects between access tiers based on their access patterns:
- **Frequent Access** - Default tier for newly uploaded objects
- **Infrequent Access** - After 30 days of no access
- **Archive Instant Access** - After 90 days of no access
- **Archive Access** - After 90 days (objects > 128KB)
- **Deep Archive Access** - After 180 days (objects > 128KB)

**Benefits:**
- ✅ Automatic cost optimization
- ✅ No performance impact
- ✅ No retrieval fees
- ✅ No minimum storage duration
- ✅ Small monthly monitoring fee per object

---

## 🚀 Setup Steps

### **Step 1: Deploy Amplify Backend**

First, deploy the storage bucket:
```bash
npx ampx sandbox
```

This creates the S3 bucket with the photo analysis trigger.

### **Step 2: Enable Intelligent Tiering via AWS Console**

1. **Go to S3 Console**
   - Navigate to S3 → Your bucket (`modeledStorage-*`)
   - Click on "Management" tab

2. **Create Intelligent-Tiering Configuration**
   - Scroll to "Intelligent-Tiering"
   - Click "Create Intelligent-Tiering configuration"

3. **Configure for Entire Bucket**
   - **Configuration name:** `EntireBucket`
   - **Scope:** "Apply to all objects in the bucket"
   - **Optional filters:** Leave empty (applies to all)
   - Click "Create configuration"

4. **Optional: Create Prefix-Specific Configurations**
   
   For better cost optimization, create separate configurations for different content types:

   **Profile Photos:**
   - **Configuration name:** `ProfilePhotos`
   - **Scope:** "Limit the scope of this configuration using filters"
   - **Prefix:** `profile-photos/`
   - Click "Create configuration"

   **Session Photos:**
   - **Configuration name:** `SessionPhotos`
   - **Prefix:** `session-photos/`
   - Click "Create configuration"

   **Portfolios:**
   - **Configuration name:** `Portfolios`
   - **Prefix:** `portfolios/`
   - Click "Create configuration"

   **Documents:**
   - **Configuration name:** `Documents`
   - **Prefix:** `documents/`
   - Click "Create configuration"

   **Videos:**
   - **Configuration name:** `Videos`
   - **Prefix:** `videos/`
   - Click "Create configuration"

   **Marketing:**
   - **Configuration name:** `Marketing`
   - **Prefix:** `marketing/`
   - Click "Create configuration"

### **Step 3: Enable Intelligent Tiering via AWS CLI**

Alternatively, use AWS CLI to configure:

```bash
# Get bucket name
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'modeledStorage')].Name" --output text)

# Enable Intelligent Tiering for entire bucket
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id EntireBucket \
  --intelligent-tiering-configuration '{
    "Id": "EntireBucket",
    "Status": "Enabled",
    "Filter": {}
  }'

# Enable for profile photos
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id ProfilePhotos \
  --intelligent-tiering-configuration '{
    "Id": "ProfilePhotos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "profile-photos/"
    }
  }'

# Enable for session photos
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id SessionPhotos \
  --intelligent-tiering-configuration '{
    "Id": "SessionPhotos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "session-photos/"
    }
  }'

# Enable for portfolios
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id Portfolios \
  --intelligent-tiering-configuration '{
    "Id": "Portfolios",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "portfolios/"
    }
  }'

# Enable for documents
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id Documents \
  --intelligent-tiering-configuration '{
    "Id": "Documents",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "documents/"
    }
  }'

# Enable for videos
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id Videos \
  --intelligent-tiering-configuration '{
    "Id": "Videos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "videos/"
    }
  }'

# Enable for marketing
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id Marketing \
  --intelligent-tiering-configuration '{
    "Id": "Marketing",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "marketing/"
    }
  }'
```

### **Step 4: Verify Configuration**

```bash
# List all intelligent tiering configurations
aws s3api list-bucket-intelligent-tiering-configurations \
  --bucket ${BUCKET_NAME}

# Get specific configuration details
aws s3api get-bucket-intelligent-tiering-configuration \
  --bucket ${BUCKET_NAME} \
  --id EntireBucket
```

---

## 📊 Cost Optimization Strategy

### **Content Type Analysis**

| Content Type | Access Pattern | Expected Tier | Savings |
|-------------|----------------|---------------|---------|
| **Profile Photos** | Frequently accessed (viewed often) | Frequent Access | Low (stays in frequent) |
| **Session Photos** | Accessed initially, then rarely | Infrequent → Archive | Medium (30-90 days) |
| **Portfolios** | Accessed occasionally | Infrequent | Medium (30+ days) |
| **Documents** | Rarely accessed after upload | Archive → Deep Archive | High (90-180 days) |
| **Videos** | Large files, rarely accessed | Archive → Deep Archive | Very High (90-180 days) |
| **Marketing** | Rarely accessed | Archive → Deep Archive | High (90-180 days) |

### **Expected Cost Savings**

- **Frequent Access:** $0.023 per GB/month (Standard pricing)
- **Infrequent Access:** $0.0125 per GB/month (40% savings)
- **Archive Instant Access:** $0.004 per GB/month (83% savings)
- **Archive Access:** $0.0036 per GB/month (84% savings)
- **Deep Archive Access:** $0.00099 per GB/month (96% savings)

**Monitoring Fee:** $0.0025 per 1,000 objects monitored per month

**Example Savings:**
- 10,000 photos (avg 2MB each) = 20 GB
- If 50% move to Infrequent Access after 30 days:
  - Savings: 10 GB × ($0.023 - $0.0125) = $0.105/month
  - Monitoring: 10,000 × $0.0025/1000 = $0.025/month
  - **Net Savings: $0.08/month** (small scale)
  - **At scale (100,000 photos): $0.80/month**
  - **At scale (1M photos): $8/month**

---

## 🔄 Automatic Tier Transitions

Intelligent Tiering automatically monitors and moves objects:

1. **Day 0-30:** Frequent Access tier
2. **Day 30+ (no access):** Move to Infrequent Access
3. **Day 90+ (no access):** Move to Archive Instant Access
4. **Day 90+ (no access, >128KB):** Move to Archive Access
5. **Day 180+ (no access, >128KB):** Move to Deep Archive Access

**Important:** Objects are automatically moved back to Frequent Access if accessed again.

---

## 🧪 Testing

### **Test 1: Verify Configuration**
```bash
# Check configurations are active
aws s3api list-bucket-intelligent-tiering-configurations \
  --bucket ${BUCKET_NAME} \
  --query 'IntelligentTieringConfigurationList[*].[Id,Status]' \
  --output table
```

### **Test 2: Upload Test Object**
```bash
# Upload a test file
echo "test content" > test.txt
aws s3 cp test.txt s3://${BUCKET_NAME}/profile-photos/test-user/test.txt \
  --storage-class INTELLIGENT_TIERING

# Verify object is in Intelligent Tiering
aws s3api head-object \
  --bucket ${BUCKET_NAME} \
  --key profile-photos/test-user/test.txt \
  --query 'StorageClass'
```

### **Test 3: Monitor Tier Transitions**
- Wait 30+ days for objects to transition
- Check S3 Storage Class Analysis in AWS Console
- Verify objects moved to Infrequent Access tier

---

## 📊 Monitoring

### **CloudWatch Metrics**
- `IntelligentTiering.NumberOfObjects`
- `IntelligentTiering.StorageSize`
- `IntelligentTiering.NumberOfObjectsInFrequentAccess`
- `IntelligentTiering.NumberOfObjectsInInfrequentAccess`
- `IntelligentTiering.NumberOfObjectsInArchiveInstantAccess`
- `IntelligentTiering.NumberOfObjectsInArchiveAccess`
- `IntelligentTiering.NumberOfObjectsInDeepArchiveAccess`

### **S3 Storage Class Analysis**
- Go to S3 → Your bucket → Metrics
- View "Storage class analysis" to see distribution
- Monitor cost savings over time

### **Cost Explorer**
- Filter by S3 service
- Group by Storage Class
- Compare costs before/after intelligent tiering

---

## ⚠️ Important Notes

1. **Minimum Object Size**
   - Objects < 128KB stay in Frequent Access
   - Only objects > 128KB can move to Archive/Deep Archive tiers

2. **Monitoring Fee**
   - $0.0025 per 1,000 objects per month
   - Only pay for objects being monitored
   - Worth it for cost savings on larger objects

3. **No Performance Impact**
   - All tiers provide same performance
   - No retrieval fees
   - Automatic tier transitions

4. **Existing Objects**
   - Intelligent Tiering applies to new uploads immediately
   - Existing objects can be transitioned via lifecycle policy (optional)

---

## 🔄 Transition Existing Objects (Optional)

If you want to move existing objects to Intelligent Tiering:

```bash
# Create lifecycle policy to transition existing objects
aws s3api put-bucket-lifecycle-configuration \
  --bucket ${BUCKET_NAME} \
  --lifecycle-configuration '{
    "Rules": [{
      "Id": "TransitionToIntelligentTiering",
      "Status": "Enabled",
      "Filter": {},
      "Transitions": [{
        "Days": 0,
        "StorageClass": "INTELLIGENT_TIERING"
      }]
    }]
  }'
```

**Note:** This is optional - new uploads will automatically use Intelligent Tiering if configured.

---

## ✅ Success Criteria

- [ ] Intelligent Tiering enabled for entire bucket
- [ ] Prefix-specific configurations created (optional)
- [ ] Test uploads use Intelligent Tiering storage class
- [ ] CloudWatch metrics showing tier distribution
- [ ] Cost savings visible in Cost Explorer (after 30+ days)

---

## 📝 Next Steps

1. **Monitor for 30 days** to see tier transitions
2. **Review cost savings** in Cost Explorer
3. **Adjust configurations** if needed based on access patterns
4. **Consider lifecycle policies** for additional optimization

---

## 🐛 Troubleshooting

### **Configuration Not Appearing**
- Wait a few minutes for propagation
- Check bucket permissions
- Verify configuration JSON syntax

### **Objects Not Transitioning**
- Wait 30+ days for first transition
- Verify objects are > 128KB for Archive tiers
- Check CloudWatch metrics for activity

### **Cost Not Decreasing**
- Intelligent Tiering takes time to optimize
- Monitor for 30-90 days to see savings
- Review access patterns - frequently accessed objects stay in Frequent tier

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Setup

