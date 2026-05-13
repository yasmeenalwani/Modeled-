# S3 Storage Structure & Database Integration 📦

## Overview

This document explains how S3 storage is structured, how file paths are stored in the database, how to access files, and how S3 Intelligent-Tiering works.

---

## 🗂️ S3 Bucket Structure

### **Bucket Name:** `modeledStorage-{accountId}-{region}`

```
modeledStorage/
├── profile-photos/
│   ├── models/
│   │   └── {userId}/
│   │       ├── {timestamp}.jpg
│   │       ├── {timestamp}.png
│   │       └── headshot-{timestamp}.jpg
│   ├── professionals/
│   │   └── {userId}/
│   │       └── {timestamp}.jpg
│   └── partners/
│       └── {userId}/
│           └── {timestamp}.jpg
│
├── session-photos/
│   ├── before/
│   │   └── {bookingId}/
│   │       ├── {timestamp}.jpg
│   │       └── {timestamp}.jpg
│   └── after/
│       └── {bookingId}/
│           ├── {timestamp}.jpg
│           └── {timestamp}.jpg
│
├── portfolios/
│   └── {professionalId}/
│       ├── {timestamp}.jpg
│       └── {timestamp}.jpg
│
├── documents/
│   ├── licenses/
│   │   └── {professionalId}/
│   │       └── license-{timestamp}.pdf
│   └── insurance/
│       └── {partnerId}/
│           └── insurance-{timestamp}.pdf
│
└── marketing/
    └── admin-only/
        └── {filename}
```

---

## 💾 Database Storage Structure

### **What's Stored in DynamoDB:**

The database stores **S3 keys (paths)**, not the actual files. Files are stored in S3, and the database references them.

#### **ModelProfile Schema:**
```typescript
ModelProfile {
  // S3 Keys stored as strings
  photoUrls: string[]  // Array of S3 keys
  // Example: ["profile-photos/models/user-123/1702123456789.jpg"]
  
  headshotUrl: string  // Single S3 key
  // Example: "profile-photos/models/user-123/headshot-1702123456789.jpg"
}
```

#### **Booking Schema:**
```typescript
Booking {
  // S3 Keys stored as array
  afterPhotos: string[]
  // Example: [
  //   "session-photos/after/booking-456/1702123456789.jpg",
  //   "session-photos/after/booking-456/1702123456790.jpg"
  // ]
}
```

#### **Professional Schema:**
```typescript
Professional {
  portfolioUrls: string[]
  // Example: ["portfolios/pro-789/1702123456789.jpg"]
}
```

---

## 🔑 S3 Key Format Examples

### **Profile Photos:**
```
profile-photos/models/user-123/1702123456789.jpg
profile-photos/professionals/pro-456/1702123456789.jpg
profile-photos/partners/partner-789/1702123456789.jpg
```

### **Session Photos:**
```
session-photos/before/booking-123/1702123456789.jpg
session-photos/after/booking-123/1702123456790.jpg
```

### **Portfolios:**
```
portfolios/pro-456/1702123456789.jpg
portfolios/pro-456/1702123456790.jpg
```

### **Documents:**
```
documents/licenses/pro-456/license-1702123456789.pdf
documents/insurance/partner-789/insurance-1702123456789.pdf
```

---

## 📥 How to Access S3 Files

### **1. Using Amplify Storage API (Recommended)**

```javascript
import { getUrl, uploadData, remove } from 'aws-amplify/storage';

// Get a signed URL to view/download a file
const getFileUrl = async (s3Key) => {
  try {
    const { url } = await getUrl({
      key: s3Key,
      options: {
        expiresIn: 3600, // URL expires in 1 hour
      },
    });
    return url.toString();
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Upload a file
const uploadFile = async (file, s3Key) => {
  try {
    const result = await uploadData({
      key: s3Key,
      data: file,
      options: {
        contentType: file.type,
      },
    }).result;
    
    return result.key; // Returns the S3 key
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Delete a file
const deleteFile = async (s3Key) => {
  try {
    await remove({ key: s3Key });
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
```

### **2. Using the Storage Utility (`src/utils/storage.js`)**

```javascript
import { uploadFile, getProfilePhotoPath, getSessionPhotoPath } from '../utils/storage';

// Upload profile photo
const uploadProfilePhoto = async (file, userId, userType) => {
  const path = getProfilePhotoPath(userType, userId, file.name);
  const result = await uploadFile(file, path);
  
  // Store the S3 key in database
  await updateModelProfile(userId, {
    photoUrls: [...existingUrls, result.key],
  });
  
  return result;
};

// Upload session photo
const uploadSessionPhoto = async (file, bookingId, type) => {
  const path = getSessionPhotoPath(type, bookingId, file.name);
  const result = await uploadFile(file, path);
  
  // Store the S3 key in database
  await updateBooking(bookingId, {
    afterPhotos: [...existingPhotos, result.key],
  });
  
  return result;
};
```

### **3. Direct S3 Access (Admin/Backend Only)**

```javascript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

const getFileFromS3 = async (bucket, key) => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  const response = await s3Client.send(command);
  return response.Body; // Stream of file data
};
```

---

## 🔐 Access Control & Permissions

### **Profile Photos:**
- **Owner:** Can read, write, delete
- **Admin:** Can read, write, delete
- **Authenticated Users:** Can read (for approved photos)

### **Session Photos:**
- **Owner:** Can read, write, delete
- **Admin:** Can read, write, delete
- **Others:** No access (private)

### **Portfolios:**
- **Owner:** Can read, write, delete
- **Admin:** Can read, write, delete
- **Authenticated Users:** Can read (public portfolios)

### **Documents:**
- **Owner:** Can read, write, delete
- **Admin:** Can read, write, delete
- **Others:** No access (private)

---

## 📊 Database Query Examples

### **Get Model with Photos:**
```javascript
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Fetch model profile
const { data: model } = await client.models.ModelProfile.get({ id: modelId });

// Get photo URLs
const photoUrls = await Promise.all(
  model.photoUrls.map(async (s3Key) => {
    const { url } = await getUrl({ key: s3Key });
    return url.toString();
  })
);

// Now you have:
// model.photoUrls = ["profile-photos/models/user-123/1702123456789.jpg", ...]
// photoUrls = ["https://s3.amazonaws.com/...", ...]
```

### **Get Booking with After Photos:**
```javascript
const { data: booking } = await client.models.Booking.get({ id: bookingId });

// Get photo URLs
const afterPhotoUrls = await Promise.all(
  booking.afterPhotos.map(async (s3Key) => {
    const { url } = await getUrl({ key: s3Key });
    return url.toString();
  })
);
```

---

## 🧠 S3 Intelligent-Tiering

### **What is Intelligent-Tiering?**

S3 Intelligent-Tiering automatically moves objects between access tiers based on access patterns to optimize costs.

### **How It Works:**

1. **Automatic Monitoring:** S3 monitors access patterns for each object
2. **Automatic Movement:** Objects are moved between tiers based on access frequency
3. **Cost Optimization:** You only pay for the storage tier used, plus a small monitoring fee

### **Storage Tiers:**

1. **Frequent Access Tier** (Default)
   - For files accessed frequently
   - Standard S3 pricing
   - $0.023 per GB/month

2. **Infrequent Access Tier**
   - For files not accessed for 30+ days
   - Lower cost: $0.0125 per GB/month
   - Small retrieval fee: $0.01 per GB

3. **Archive Instant Access Tier**
   - For files not accessed for 90+ days
   - Even lower cost: $0.004 per GB/month
   - Small retrieval fee: $0.03 per GB

4. **Archive Access Tier**
   - For files not accessed for 90+ days
   - Lowest cost: $0.0036 per GB/month
   - Retrieval fee: $0.02 per GB (3-5 hour retrieval)

5. **Deep Archive Access Tier**
   - For files not accessed for 180+ days
   - Lowest cost: $0.00099 per GB/month
   - Retrieval fee: $0.02 per GB (12 hour retrieval)

### **Monitoring Fee:**
- $0.0025 per 1,000 objects monitored per month
- Only charged for objects in Intelligent-Tiering

### **When to Use Intelligent-Tiering:**

✅ **Use for:**
- Profile photos (accessed occasionally)
- Session photos (accessed rarely after initial upload)
- Old portfolios (accessed infrequently)
- Documents (accessed rarely)

❌ **Don't use for:**
- Frequently accessed files (use Standard tier)
- Files that need instant access (use Standard tier)
- Very small files (< 128 KB - minimum charge applies)

### **Configuration:**

```typescript
// In amplify/storage/resource.ts (if using CDK directly)
// Amplify Storage automatically handles this, but you can configure:

export const storage = defineStorage({
  name: 'modeledStorage',
  
  // Intelligent-Tiering is enabled by default in Amplify Storage
  // Files are automatically moved based on access patterns
  
  access: (allow) => ({
    // ... your access rules
  }),
});
```

### **Cost Savings Example:**

**Scenario:** 10,000 profile photos, average 2MB each = 20GB

- **Standard S3:** 20GB × $0.023 = **$0.46/month**
- **Intelligent-Tiering (50% infrequent):** 
  - 10GB × $0.023 = $0.23
  - 10GB × $0.0125 = $0.125
  - Monitoring: 10,000 × $0.0025/1000 = $0.025
  - **Total: $0.38/month** (17% savings)

**For larger archives:**
- **Archive Access:** 20GB × $0.0036 = **$0.072/month** (84% savings!)

---

## 🔄 File Lifecycle Management

### **Recommended Lifecycle Rules:**

1. **Profile Photos:**
   - Keep in Intelligent-Tiering
   - Move to Archive after 1 year of no access

2. **Session Photos:**
   - Keep in Intelligent-Tiering
   - Move to Archive after 6 months of no access

3. **Portfolios:**
   - Keep in Intelligent-Tiering
   - Move to Archive after 2 years of no access

4. **Documents:**
   - Keep in Standard (need instant access)
   - Or use Intelligent-Tiering with Archive after 1 year

### **Implementation:**

```typescript
// This would be configured in AWS Console or via CDK
// Amplify Storage handles basic lifecycle, but you can customize:

const lifecycleRules = [
  {
    id: 'session-photos-archive',
    status: 'Enabled',
    prefix: 'session-photos/',
    transitions: [
      {
        days: 180, // 6 months
        storageClass: 'INTELLIGENT_TIERING',
      },
    ],
  },
];
```

---

## 📝 Best Practices

1. **Always store S3 keys in database, not full URLs**
   - URLs expire (signed URLs)
   - Keys are permanent references

2. **Generate signed URLs when needed**
   - Use `getUrl()` to get temporary access URLs
   - URLs expire after set time (default 1 hour)

3. **Use consistent path structure**
   - Follow the pattern: `{category}/{subcategory}/{entityId}/{filename}`
   - Makes it easy to organize and query

4. **Clean up unused files**
   - When deleting database records, also delete S3 files
   - Use lifecycle rules for automatic cleanup

5. **Monitor storage costs**
   - Use CloudWatch metrics
   - Set up billing alerts
   - Review Intelligent-Tiering savings

---

## 🚨 Common Issues & Solutions

### **Issue: File not found**
- **Check:** S3 key is correct in database
- **Check:** File actually exists in S3 bucket
- **Check:** Access permissions are correct

### **Issue: URL expired**
- **Solution:** Generate new signed URL using `getUrl()`
- **Solution:** Increase expiration time if needed

### **Issue: Upload fails**
- **Check:** File size limits (default 5MB, can be increased)
- **Check:** File type is allowed
- **Check:** User has write permissions

### **Issue: High storage costs**
- **Solution:** Enable Intelligent-Tiering
- **Solution:** Set up lifecycle rules to archive old files
- **Solution:** Delete unused files

---

## 📚 Additional Resources

- [AWS S3 Intelligent-Tiering Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/intelligent-tiering.html)
- [Amplify Storage Documentation](https://docs.amplify.aws/react/build-a-backend/storage/)
- [S3 Pricing Calculator](https://calculator.aws/#/createCalculator/S3)

---

**This structure ensures efficient storage, easy access, and cost optimization!** 📦✨

