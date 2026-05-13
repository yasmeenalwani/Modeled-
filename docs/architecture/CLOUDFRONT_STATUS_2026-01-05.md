# ☁️ CloudFront Status & Recommendations

## Current Status

### **❌ Not Explicitly Configured**
You're **not explicitly using CloudFront** in your codebase, but:

1. **Amplify Hosting automatically uses CloudFront** ✅
   - If you deploy via AWS Amplify Hosting, your frontend is automatically served through CloudFront
   - This is transparent - you don't need to configure it

2. **S3 buckets don't have CloudFront** ❌
   - Your S3 buckets (photos, videos, documents) are accessed directly
   - No CDN in front of S3 assets

---

## What CloudFront Does

**CloudFront** is AWS's Content Delivery Network (CDN) that:
- ✅ **Caches content** at edge locations worldwide
- ✅ **Faster load times** - Serves content from nearest location
- ✅ **Reduces S3 costs** - Fewer direct S3 requests
- ✅ **Better performance** - Lower latency for users globally
- ✅ **DDoS protection** - Built-in security features

---

## Current Architecture

### **Frontend (React App)**
```
User → CloudFront (if using Amplify Hosting) → S3/Amplify
```
- ✅ **If deployed via Amplify Hosting:** CloudFront is automatic
- ❌ **If deployed elsewhere:** No CloudFront

### **S3 Assets (Photos, Videos, Documents)**
```
User → S3 Bucket (direct access)
```
- ❌ **No CloudFront** - Direct S3 access
- ⚠️ **Slower for global users** - Content served from single region
- ⚠️ **Higher S3 costs** - Every request hits S3 directly

---

## Should You Add CloudFront for S3?

### **Current Setup:**
- S3 buckets: `modeledStorage` (photos, videos, documents)
- Access: Direct S3 URLs via Amplify Storage
- No CDN caching

### **Benefits of Adding CloudFront for S3:**

1. **Performance** ⚡
   - Photos load 2-3x faster for users far from your S3 region
   - Better user experience globally

2. **Cost Savings** 💰
   - CloudFront data transfer: $0.085/GB (first 10TB)
   - S3 data transfer out: $0.09/GB (first 10TB)
   - **Savings:** ~$0.005/GB (small, but adds up)
   - **Bigger savings:** Fewer S3 requests (CloudFront caches)

3. **Scalability** 📈
   - Handles traffic spikes better
   - No S3 request rate limits

4. **Security** 🔒
   - Signed URLs for private content
   - DDoS protection
   - WAF integration

---

## Cost Comparison

### **Without CloudFront (Current):**
```
10,000 photo views/month
- Average photo size: 500KB
- Total data: 5GB
- S3 data transfer: 5GB × $0.09 = $0.45
- S3 requests: 10,000 × $0.0004/1,000 = $0.004
- Total: ~$0.45/month
```

### **With CloudFront:**
```
10,000 photo views/month
- Cache hit rate: 80% (8,000 cached)
- CloudFront data: 5GB × $0.085 = $0.425
- S3 data (cache misses): 1GB × $0.09 = $0.09
- S3 requests: 2,000 × $0.0004/1,000 = $0.0008
- Total: ~$0.52/month
```

**Note:** At low scale, CloudFront costs slightly more. At higher scale (100K+ views), CloudFront saves money.

---

## Recommendation

### **For Now: Optional**
- ✅ **If you have < 10,000 users:** Current setup is fine
- ✅ **If users are mostly in one region:** CloudFront benefit is minimal
- ✅ **If cost is a concern:** Skip CloudFront for now

### **Add CloudFront Later If:**
- 📈 You have > 50,000 monthly active users
- 🌍 Users are spread globally
- ⚡ You notice slow photo loading
- 💰 You want to reduce S3 costs at scale

---

## How to Add CloudFront for S3 (If Needed)

### **Option 1: Amplify Storage with CloudFront** (Easiest)
Amplify Gen 2 Storage doesn't automatically add CloudFront, but you can:

1. **Create CloudFront Distribution manually:**
   - AWS Console → CloudFront → Create Distribution
   - Origin: Your S3 bucket
   - Cache behavior: Cache photos/videos
   - Update Amplify Storage URLs to use CloudFront domain

2. **Use Amplify Hosting CDN:**
   - If using Amplify Hosting, it includes CloudFront
   - But this only covers your React app, not S3 assets

### **Option 2: Custom CDK Resource** (Recommended)
Add CloudFront distribution via CDK:

```typescript
// amplify/storage/cloudfront-resource.ts
import { addCustomCdkResources } from '@aws-amplify/backend';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';

export const cloudfrontDistribution = addCustomCdkResources((backend) => {
  const stack = backend.stack;
  
  // Get S3 bucket from Amplify Storage
  const bucket = s3.Bucket.fromBucketName(
    stack,
    'ModeledStorageBucket',
    'modeledStorage-...' // Your bucket name
  );
  
  // Create CloudFront distribution
  const distribution = new cloudfront.Distribution(stack, 'ModeledCDN', {
    defaultBehavior: {
      origin: new cloudfront.origins.S3Origin(bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      compress: true,
    },
    priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
  });
  
  return { distribution };
});
```

### **Option 3: Use S3 Website + CloudFront** (Not Recommended)
- More complex
- Requires public S3 bucket
- Less secure

---

## Implementation Steps (If You Want CloudFront)

### **Step 1: Create CloudFront Distribution**
1. AWS Console → CloudFront → Create Distribution
2. Origin: Your S3 bucket (`modeledStorage-...`)
3. Viewer Protocol: Redirect HTTP to HTTPS
4. Cache Policy: CachingOptimized
5. Price Class: PriceClass_100 (US, Canada, Europe) or PriceClass_All

### **Step 2: Update Storage URLs**
Modify `src/utils/storage.js` to use CloudFront URLs:

```javascript
// Get CloudFront domain from environment
const CLOUDFRONT_DOMAIN = import.meta.env.VITE_CLOUDFRONT_DOMAIN;

export const getFileUrl = async (key, expiresIn = 3600) => {
  if (CLOUDFRONT_DOMAIN) {
    // Use CloudFront URL
    return `https://${CLOUDFRONT_DOMAIN}/${key}`;
  } else {
    // Fallback to S3 signed URL
    const result = await getUrl({ key, options: { expiresIn } });
    return result.url.toString();
  }
};
```

### **Step 3: Configure Caching**
- **Photos:** Cache for 7 days (they don't change often)
- **Videos:** Cache for 30 days
- **Documents:** Cache for 1 day (may update)

### **Step 4: Set Up Signed URLs (For Private Content)**
Use CloudFront signed URLs for private photos:

```typescript
// Lambda function to generate CloudFront signed URLs
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';

export const getPrivateFileUrl = (key, expiresIn = 3600) => {
  const url = `https://${CLOUDFRONT_DOMAIN}/${key}`;
  return getSignedUrl({
    url,
    keyPairId: CLOUDFRONT_KEY_PAIR_ID,
    privateKey: CLOUDFRONT_PRIVATE_KEY,
    dateLessThan: new Date(Date.now() + expiresIn * 1000).toISOString(),
  });
};
```

---

## Current Status Summary

| Component | CloudFront Status | Notes |
|-----------|------------------|-------|
| **Frontend (React)** | ✅ **Automatic** (if Amplify Hosting) | Amplify Hosting includes CloudFront |
| **S3 Photos** | ❌ **Not configured** | Direct S3 access |
| **S3 Videos** | ❌ **Not configured** | Direct S3 access |
| **S3 Documents** | ❌ **Not configured** | Direct S3 access |

---

## Quick Answer

**Are you using CloudFront?**
- ✅ **Frontend:** Yes (if deployed via Amplify Hosting - automatic)
- ❌ **S3 Assets:** No (direct S3 access)

**Should you add CloudFront for S3?**
- **For now:** Optional (not critical)
- **Later:** Yes, if you scale globally or notice performance issues

---

## Next Steps

1. **Check your deployment method:**
   - If using Amplify Hosting → Frontend has CloudFront ✅
   - If using other hosting → No CloudFront ❌

2. **Monitor S3 costs:**
   - Check AWS Cost Explorer
   - If data transfer > $10/month → Consider CloudFront

3. **Test performance:**
   - Use tools like WebPageTest
   - If photos load slowly → Add CloudFront

4. **Add CloudFront when:**
   - You have > 50K monthly users
   - Global user base
   - Performance issues
   - Want to optimize costs

---

**Bottom Line:** Your frontend likely has CloudFront (via Amplify Hosting), but your S3 assets don't. This is fine for now! Add CloudFront for S3 later if you scale globally or notice performance issues. 🚀

