# Model Identity Verification Options 🔐

## Current State

**Models currently:**
- ✅ Upload photos during onboarding
- ✅ Submit profile information
- ✅ Status set to 'pending' until admin approval
- ❌ **No automated face verification**
- ❌ **No identity document verification**

**Professionals have:**
- ✅ Selfie verification step
- ✅ Government ID upload
- ✅ License verification

---

## Why Verify Models?

1. **Prevent Fraud** - Ensure models are real people
2. **Age Verification** - Confirm they're 18+
3. **Identity Matching** - Match photos to ID documents
4. **Safety** - Protect professionals and platform
5. **Compliance** - Meet legal requirements

---

## Verification Options

### **Option 1: AWS Rekognition Face Comparison** ⭐ RECOMMENDED

**How it works:**
- Model uploads government ID (driver's license, passport)
- Model takes a selfie with their phone
- Rekognition compares selfie to ID photo
- Returns confidence score (0-100%)

**Pros:**
- ✅ Integrated with AWS (already using Amplify)
- ✅ Very accurate (99%+ for good photos)
- ✅ Fast (1-2 seconds)
- ✅ Cost-effective ($1 per 1,000 verifications)
- ✅ No third-party dependency

**Cons:**
- ❌ Requires ID document upload
- ❌ Needs good lighting/photo quality
- ❌ May need manual review for low scores

**Cost:**
- **Face comparison:** $1.00 per 1,000 images
- **Face detection:** $1.00 per 1,000 images
- **Example:** 100 models/month = $0.10/month

**Implementation:**
```javascript
// Lambda function using AWS Rekognition
import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition';

async function verifyIdentity(selfieImage, idImage) {
  const client = new RekognitionClient({ region: 'us-east-1' });
  
  const command = new CompareFacesCommand({
    SourceImage: { Bytes: selfieImage },
    TargetImage: { Bytes: idImage },
    SimilarityThreshold: 80, // 80% match required
  });
  
  const response = await client.send(command);
  
  return {
    verified: response.FaceMatches?.[0]?.Similarity >= 80,
    confidence: response.FaceMatches?.[0]?.Similarity || 0,
    faceFound: response.FaceMatches?.length > 0,
  };
}
```

---

### **Option 2: AWS Rekognition + Textract (ID Document OCR)**

**How it works:**
- Model uploads ID photo
- Textract extracts: Name, DOB, ID number, expiration
- Rekognition compares selfie to ID photo
- Validates age (must be 18+)
- Stores extracted data

**Pros:**
- ✅ Automatic data extraction
- ✅ Age verification built-in
- ✅ Reduces manual data entry
- ✅ Validates ID authenticity

**Cons:**
- ❌ Slightly more expensive
- ❌ More complex setup

**Cost:**
- **Face comparison:** $1.00 per 1,000
- **Textract (ID):** $1.50 per 1,000 pages
- **Total:** ~$2.50 per 1,000 verifications

---

### **Option 3: Third-Party Services**

#### **3a. Jumio (Enterprise)**
- **Cost:** $1-3 per verification
- **Features:** ID verification, liveness detection, AML checks
- **Best for:** High-volume, enterprise needs

#### **3b. Onfido**
- **Cost:** $1-2 per verification
- **Features:** ID + selfie, liveness, document checks
- **Best for:** Global coverage, multiple ID types

#### **3c. Persona**
- **Cost:** $0.50-2 per verification
- **Features:** ID verification, selfie, watchlist screening
- **Best for:** Modern UX, developer-friendly

---

### **Option 4: Simple Selfie Verification (No ID)**

**How it works:**
- Model takes selfie holding a sign with their name/date
- Admin manually reviews
- Or use basic face detection to ensure it's a real person

**Pros:**
- ✅ Simple to implement
- ✅ No ID required (privacy-friendly)
- ✅ Low cost

**Cons:**
- ❌ Less secure
- ❌ Manual review needed
- ❌ Can't verify age automatically

---

## Recommended Implementation: AWS Rekognition

### **Step 1: Add Verification Fields to Schema**

```typescript
ModelProfile: a.model({
  // ... existing fields ...
  
  // Verification
  identityVerified: a.boolean().default(false),
  identityVerificationStatus: a.enum(['pending', 'verified', 'failed', 'manual_review']),
  identityVerificationScore: a.float(), // 0-100 confidence
  identityVerifiedAt: a.datetime(),
  
  // ID Document (S3 key)
  idDocumentUrl: a.string(), // Driver's license, passport, etc.
  idDocumentType: a.enum(['drivers_license', 'passport', 'state_id', 'other']),
  
  // Selfie (S3 key)
  verificationSelfieUrl: a.string(),
  
  // Extracted Data (from Textract)
  idName: a.string(), // Extracted from ID
  idDateOfBirth: a.date(), // For age verification
  idNumber: a.string(), // Last 4 digits only
  idExpirationDate: a.date(),
  
  // Admin Review
  verificationAdminNotes: a.string(),
  verificationReviewedBy: a.string(), // Admin userId
  verificationReviewedAt: a.datetime(),
})
```

### **Step 2: Add Verification Step to Onboarding**

Add a new step after photo upload:

```javascript
const steps = [
  { title: 'Basic Info', component: StepBasicInfo },
  { title: 'Photos', component: StepPhotos },
  { title: 'Identity Verification', component: StepIdentityVerification }, // NEW
  { title: 'Review', component: StepReview },
];
```

### **Step 3: Create Verification Component**

```javascript
// StepIdentityVerification.jsx
import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';

export default function StepIdentityVerification({ data, setData }) {
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      // Upload images to S3
      const idKey = await uploadIdDocument(idImage);
      const selfieKey = await uploadSelfie(selfieImage);
      
      // Call Lambda function to verify
      const result = await verifyIdentity(idKey, selfieKey);
      
      setVerificationResult(result);
      setData({
        ...data,
        idDocumentUrl: idKey,
        verificationSelfieUrl: selfieKey,
        identityVerificationStatus: result.verified ? 'verified' : 'manual_review',
        identityVerificationScore: result.confidence,
      });
    } catch (error) {
      console.error('Verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      <h3>Verify Your Identity</h3>
      <p>We need to verify you're 18+ and who you say you are.</p>
      
      {/* ID Upload */}
      <div>
        <label>Upload Government ID</label>
        <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files[0])} />
        <small>Driver's license, passport, or state ID</small>
      </div>
      
      {/* Selfie Upload */}
      <div>
        <label>Take a Selfie</label>
        <input type="file" accept="image/*" capture="user" onChange={(e) => setSelfieImage(e.target.files[0])} />
        <small>Make sure your face is clearly visible</small>
      </div>
      
      <button onClick={handleVerify} disabled={!idImage || !selfieImage || verifying}>
        {verifying ? 'Verifying...' : 'Verify Identity'}
      </button>
      
      {verificationResult && (
        <div>
          {verificationResult.verified ? (
            <div style={{ color: 'green' }}>
              ✅ Identity verified! ({verificationResult.confidence}% match)
            </div>
          ) : (
            <div style={{ color: 'orange' }}>
              ⚠️ Verification needs manual review ({verificationResult.confidence}% match)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### **Step 4: Create Lambda Function**

```javascript
// amplify/functions/identity-verification/resource.ts
import { defineFunction } from '@aws-amplify/backend';

export const identityVerificationFunction = defineFunction({
  name: 'identity-verification',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1',
  },
});

// amplify/functions/identity-verification/handler.ts
import { RekognitionClient, CompareFacesCommand } from '@aws-sdk/client-rekognition';
import { TextractClient, AnalyzeIDCommand } from '@aws-sdk/client-textract';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

export const handler = async (event) => {
  const { idImageKey, selfieImageKey } = event.arguments;
  
  // Get images from S3
  const idImage = await getS3Object(idImageKey);
  const selfieImage = await getS3Object(selfieImageKey);
  
  // Compare faces
  const rekognition = new RekognitionClient({ region: 'us-east-1' });
  const compareCommand = new CompareFacesCommand({
    SourceImage: { Bytes: selfieImage },
    TargetImage: { Bytes: idImage },
    SimilarityThreshold: 80,
  });
  
  const faceResult = await rekognition.send(compareCommand);
  const confidence = faceResult.FaceMatches?.[0]?.Similarity || 0;
  
  // Extract ID data (optional)
  const textract = new TextractClient({ region: 'us-east-1' });
  const idCommand = new AnalyzeIDCommand({
    DocumentPages: [{ Bytes: idImage }],
  });
  
  const idData = await textract.send(idCommand);
  
  // Calculate age
  const dob = extractDateOfBirth(idData);
  const age = calculateAge(dob);
  
  return {
    verified: confidence >= 80 && age >= 18,
    confidence,
    age,
    ageVerified: age >= 18,
    extractedData: {
      name: extractName(idData),
      dateOfBirth: dob,
      idNumber: extractIdNumber(idData),
    },
  };
};
```

---

## Implementation Phases

### **Phase 1: Basic Selfie Verification** (Quick Start)
- Model takes selfie holding sign with name/date
- Admin manually reviews
- **Timeline:** 1 day
- **Cost:** $0

### **Phase 2: AWS Rekognition Face Comparison** (Recommended)
- Add ID upload + selfie
- Automated face comparison
- Manual review for low scores
- **Timeline:** 3-5 days
- **Cost:** ~$0.10/month for 100 models

### **Phase 3: Full ID Verification** (Advanced)
- Add Textract for ID OCR
- Automatic age verification
- Data extraction
- **Timeline:** 1-2 weeks
- **Cost:** ~$0.25/month for 100 models

---

## Admin Review Interface

Add to admin panel:

```javascript
// Admin Verification Queue
- List of pending verifications
- Show: Model name, photos, confidence score
- Quick actions: Approve, Reject, Request New Photos
- Filter by: Status, confidence score, date
```

---

## Privacy & Security

### **Data Storage:**
- ID documents stored encrypted in S3
- Only accessible by admin
- Auto-delete after 90 days (optional)
- Last 4 digits of ID only stored

### **Compliance:**
- GDPR compliant (can delete on request)
- PII encryption
- Access logging
- Secure transmission (HTTPS)

---

## Cost Summary

| Solution | Cost per Verification | Monthly (100 models) | Best For |
|----------|----------------------|---------------------|----------|
| **AWS Rekognition** | $0.001 | **$0.10** | ⭐ Recommended |
| **Rekognition + Textract** | $0.0025 | **$0.25** | Full verification |
| **Jumio** | $1-3 | **$100-300** | Enterprise |
| **Onfido** | $1-2 | **$100-200** | Global |
| **Manual Review** | $0 | **$0** | Low volume |

---

## Recommendation

**Start with AWS Rekognition Face Comparison:**
1. ✅ Lowest cost ($0.10/month for 100 models)
2. ✅ Integrated with your AWS stack
3. ✅ Fast implementation (3-5 days)
4. ✅ High accuracy (99%+)
5. ✅ Can upgrade to Textract later if needed

**Add to onboarding:**
- Step after photo upload
- ID document upload
- Selfie capture
- Instant verification result
- Manual review queue for edge cases

---

**Would you like me to implement the AWS Rekognition verification step?** 🚀

