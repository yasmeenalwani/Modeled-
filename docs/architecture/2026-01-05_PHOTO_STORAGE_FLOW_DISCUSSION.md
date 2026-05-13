# Photo Storage, Flow, Integration & Analysis - Discussion Document
*Created: 2026-01-05*

## 🎯 Purpose

This document outlines the current photo storage architecture, upload flow, analysis integration, and key discussion points before implementing enhancements.

---

## 📁 Current Photo Storage Architecture

### **S3 Bucket Structure:**
```
modeledStorage/
├── profile-photos/
│   ├── models/{userId}/          ← Model profile photos (TRIGGERED for analysis)
│   ├── professionals/{userId}/    ← Professional profile photos
│   └── partners/{userId}/         ← Partner profile photos
├── session-photos/
│   ├── before/{bookingId}/        ← Before session photos
│   └── after/{bookingId}/        ← After session photos
├── portfolios/
│   └── {professionalId}/         ← Professional portfolio images
├── documents/
│   ├── licenses/                  ← License documents
│   └── insurance/                ← Insurance documents
└── marketing/                    ← Admin-only marketing assets
```

### **Access Control:**
- **Profile Photos:** Owner can read/write/delete, Admin can read/write/delete, Authenticated users can read
- **Session Photos:** Owner can read/write/delete, Admin can read/write/delete
- **Portfolios:** Owner can read/write/delete, Admin can read/write/delete, Authenticated users can read
- **Documents:** Owner can read/write/delete, Admin can read/write/delete

### **Storage Configuration:**
- **Photo Limits:**
  - Max size: 10MB
  - Accepted types: JPEG, PNG, WebP, HEIC
  - Max dimension: 4096px
- **Document Limits:**
  - Max size: 25MB
  - Accepted types: PDF, JPEG, PNG
- **Video Limits (Phase 2):**
  - Max size: 50MB
  - Max duration: 30 seconds
  - Accepted types: MP4, QuickTime, WebM

---

## 🔄 Current Photo Upload Flow

### **1. Model Onboarding Flow:**
```
User selects photos
  ↓
GuidedPhotoCapture component
  ↓
PhotoQualityChecker validates
  ↓
uploadFile() → S3 (profile-photos/models/{userId}/)
  ↓
S3 Trigger → photoAnalysisFunction (Lambda)
  ↓
Analysis updates ModelProfile in DynamoDB
  ↓
photoUrls array saved in ModelProfile
```

### **2. Professional/Partner Upload Flow:**
```
User selects photos
  ↓
PhotoUploader component
  ↓
validateFile() checks size/type
  ↓
uploadFile() → S3
  ↓
photoUrls saved in Professional/Partner profile
```

### **3. Session Photo Upload Flow:**
```
Professional completes session
  ↓
SessionPhotoUploader component
  ↓
Upload before/after photos
  ↓
Save to session-photos/{type}/{bookingId}/
  ↓
Link to Booking record
```

---

## 🤖 Photo Analysis Integration

### **Current Implementation:**

#### **S3 Trigger:**
- **Trigger:** `profile-photos/models/{entity_id}/*` on upload
- **Function:** `photoAnalysisFunction` (Lambda)
- **Status:** ✅ Configured in `amplify/storage/resource.ts`

#### **Analysis Pipeline:**
```
1. S3 Event → Lambda triggered
   ↓
2. Rekognition Analysis
   - DetectLabels (50 labels, 50% confidence)
   - DetectFaces (ALL attributes)
   ↓
3. Bedrock Analysis (Claude Haiku)
   - Specialized hair/beauty prompt
   - JSON response with attributes
   ↓
4. Attribute Mapping
   - HairAttributeMapper → simple + detailed
   - BeautyAttributeMapper → simple + detailed
   ↓
5. Update ModelProfile
   - Save autoTaggedAttributes
   - Save attributeConfidence
   - Update photoAnalysisStatus = 'completed'
   ↓
6. Training Data Recording
   - Store in HairEngineTrainingData table
   - Flag for commercial use
```

#### **Analysis Output:**
- **User View (Simple):**
  - `hairLengthSimple`, `hairColorSimple`, `hairTextureSimple`
  - `skinToneSimple`, `faceShapeSimple`, `eyeColorSimple`, etc.
- **Admin View (Detailed):**
  - `hairLengthDetailed`, `hairColorDetailed` (JSON), `curlPattern` (1A-4C)
  - `skinToneDetailed` (Fitzpatrick), `faceShapeDetailed` (JSON), etc.
- **Confidence Scores:**
  - Per-attribute confidence (0-100)
  - Low confidence prompts user validation

---

## 🔍 Key Discussion Points

### **1. Photo Analysis Trigger Scope**

**Current:** Only model profile photos trigger analysis

**Questions:**
- Should professional/partner photos also trigger analysis?
- Should session photos (before/after) trigger analysis for comparison?
- Should portfolio photos trigger analysis for professional matching?

**Considerations:**
- Cost: Each analysis = Rekognition + Bedrock costs
- Value: What insights do we gain from analyzing professional/partner photos?
- Timing: When should analysis run? (immediate vs. batch)

---

### **2. Photo Analysis Timing & User Experience**

**Current:** Analysis runs automatically on upload (async)

**Questions:**
- Should users see analysis results immediately or later?
- How do we handle analysis failures/timeouts?
- Should we show a "Processing..." state in the UI?
- Do we need a retry mechanism for failed analyses?

**Considerations:**
- Analysis can take 5-30 seconds (Rekognition + Bedrock)
- Users might navigate away before analysis completes
- Need to handle partial analysis results

---

### **3. Photo Quality & Requirements**

**Current:**
- `PhotoQualityChecker` validates photos
- `GuidedPhotoCapture` ensures required photos are captured
- Max dimension: 4096px

**Questions:**
- Should we resize/optimize photos before upload?
- Should we generate thumbnails for faster loading?
- Do we need different quality requirements for different photo types?
- Should we compress photos to reduce storage costs?

**Considerations:**
- Large photos = higher S3 costs
- Large photos = slower uploads
- Analysis works better with high-quality photos
- Need balance between quality and cost

---

### **4. Photo Storage & Lifecycle**

**Current:**
- S3 Intelligent Tiering configured (90 days → Archive, 180 days → Deep Archive)
- No automatic deletion
- No versioning strategy

**Questions:**
- Should we delete old photos when users upload new ones?
- Should we keep a history of all photos?
- Do we need photo versioning (keep previous versions)?
- Should we archive photos after a certain period?

**Considerations:**
- Storage costs accumulate over time
- Users might want to revert to old photos
- Need to balance storage costs vs. user needs

---

### **5. Photo Analysis Accuracy & User Validation**

**Current:**
- Analysis provides confidence scores
- Low confidence attributes prompt user validation
- User validation stored in `userValidatedAttributes`

**Questions:**
- How do we present analysis results to users?
- Should users be required to validate before profile is active?
- How do we use user validation to improve analysis?
- Should we show confidence scores to users?

**Considerations:**
- User validation = proprietary training data
- Can improve ML model over time
- Need clear UI for validation flow

---

### **6. Multiple Photo Analysis Strategy**

**Current:** Each photo triggers separate analysis

**Questions:**
- Should we analyze all photos and aggregate results?
- Should we pick the "best" photo for analysis?
- How do we handle conflicting analysis results?
- Should we analyze photos in batches?

**Considerations:**
- Multiple analyses = higher costs
- Aggregated results might be more accurate
- Need to define "best" photo criteria

---

### **7. Photo Analysis Error Handling**

**Current:** Basic error handling in Lambda

**Questions:**
- How do we handle Rekognition failures?
- How do we handle Bedrock failures?
- Should we fall back to rule-based analysis if ML fails?
- How do we notify users of analysis failures?

**Considerations:**
- Rekognition/Bedrock can fail (rate limits, service errors)
- Need graceful degradation
- Users should know if analysis failed

---

### **8. Photo Analysis Cost Optimization**

**Current:**
- Rekognition: ~$0.001 per image (DetectLabels + DetectFaces)
- Bedrock Claude Haiku: ~$0.00025 per 1K tokens
- Estimated: ~$0.002-0.005 per photo analysis

**Questions:**
- Should we skip Bedrock for low-confidence Rekognition results?
- Should we batch analyze photos to reduce costs?
- Should we cache analysis results for similar photos?
- Do we need analysis for every photo or just the first one?

**Considerations:**
- At 1000 photos/month = $2-5/month
- At 10,000 photos/month = $20-50/month
- Need to balance cost vs. value

---

### **9. Photo URLs & CDN**

**Current:** Direct S3 signed URLs

**Questions:**
- Should we use CloudFront CDN for faster delivery?
- Should we generate permanent URLs vs. signed URLs?
- How long should signed URLs be valid?
- Should we cache photo URLs in the frontend?

**Considerations:**
- CDN = faster loading, lower S3 costs
- Signed URLs = security, but expire
- Need to balance security vs. performance

---

### **10. Photo Metadata & Tagging**

**Current:** Basic photo storage with S3 keys

**Questions:**
- Should we store photo metadata (dimensions, file size, upload date)?
- Should we tag photos (profile, headshot, hair, beauty)?
- Should we link photos to specific attributes (e.g., "this photo shows hair color")?
- Do we need photo search/filtering capabilities?

**Considerations:**
- Metadata helps with organization
- Tags help with matching
- Need to balance metadata storage vs. complexity

---

### **11. Photo Analysis Results Storage**

**Current:**
- Results stored in `ModelProfile.autoTaggedAttributes` (JSON)
- Confidence scores in `ModelProfile.attributeConfidence` (JSON)
- Training data in `HairEngineTrainingData` table

**Questions:**
- Should we store analysis results per-photo or aggregated?
- Should we keep analysis history (how attributes changed over time)?
- How do we handle analysis updates when photos are replaced?
- Should we store raw Rekognition/Bedrock responses?

**Considerations:**
- Per-photo results = more data, more insights
- Aggregated results = simpler, less storage
- History = can track changes over time

---

### **12. Photo Analysis for Matching**

**Current:** Analysis results feed into matching engine

**Questions:**
- How do we use photo analysis results in matching?
- Should we match based on visual attributes or just service preferences?
- How do we handle models with multiple photos (different looks)?
- Should we prioritize recent photos vs. old photos?

**Considerations:**
- Visual matching = better matches
- Multiple photos = more data points
- Need to define matching strategy

---

## 🚀 Enhancement Opportunities

### **High Priority:**
1. **Photo Optimization:**
   - Resize/compress before upload
   - Generate thumbnails
   - Use CloudFront CDN

2. **Analysis UX:**
   - Show "Processing..." state
   - Display analysis results to users
   - User validation flow

3. **Error Handling:**
   - Retry mechanism for failed analyses
   - Fallback to rule-based analysis
   - User notifications for failures

### **Medium Priority:**
4. **Cost Optimization:**
   - Skip Bedrock for low-confidence results
   - Batch analysis
   - Cache analysis results

5. **Multiple Photo Strategy:**
   - Aggregate results from multiple photos
   - Pick "best" photo for analysis
   - Handle conflicting results

6. **Photo Lifecycle:**
   - Automatic cleanup of old photos
   - Photo versioning
   - Archive strategy

### **Low Priority:**
7. **Advanced Features:**
   - Photo search/filtering
   - Photo metadata storage
   - Analysis history tracking

---

## ✅ Decisions Made

### **1. Analysis Scope:**
✅ **Analyze ALL photos** (models, professionals, partners, session photos)

### **2. User Experience:**
✅ **Admin sees full analysis** (detailed attributes, confidence scores, raw data)
✅ **Users see limited view** (simple attributes only, no confidence scores)

### **3. Storage Strategy:**
✅ **S3 Intelligent Tiering** (already configured)
✅ **Limit photo/video counts** per user type
✅ **Cost optimization** priority

### **4. Content Types:**
✅ Users can have:
- **Profile Photos** (required for models)
- **Profile Videos** (optional)
- **Inspiration Board Photos** (optional)
- **Inspiration Board Videos** (optional)

**See:** `2026-01-05_PHOTO_STORAGE_STRATEGY.md` for detailed sizing, limits, and cost analysis.

---

## 📊 Current State Summary

### **✅ What's Working:**
- S3 storage configured with proper access control
- Photo upload flow functional
- S3 trigger configured for model photos
- Analysis pipeline implemented (Rekognition + Bedrock)
- Results stored in ModelProfile
- Training data collection in place

### **⚠️ What Needs Discussion:**
- Analysis scope (which photos?)
- User experience (when/how to show results?)
- Cost optimization strategy
- Photo optimization/resizing
- Error handling & retry logic
- Multiple photo strategy
- Storage lifecycle management

### **🔧 What Needs Implementation:**
- Photo optimization/resizing
- Thumbnail generation
- CloudFront CDN (optional)
- Analysis result UI
- User validation flow
- Error handling improvements
- Retry mechanism

---

## 🎯 Next Steps

1. **Discuss key questions** (this document)
2. **Prioritize enhancements** based on discussion
3. **Design solutions** for prioritized items
4. **Implement enhancements** in priority order
5. **Test & validate** improvements

---

**Last Updated:** 2026-01-05  
**Status:** 📋 Ready for Discussion

