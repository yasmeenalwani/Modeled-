# Photo & Video Storage Strategy - Sizing, Limits & Cost Optimization
*Created: 2026-01-05*

## 🎯 Decisions Made

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

---

## 📏 Sizing Recommendations

### **Photo Sizing Strategy:**

#### **Option A: Balanced (Recommended)**
```
Profile Photos:
  - Max dimension: 2048px (width or height)
  - Max file size: 2MB
  - Format: JPEG (compressed to 85% quality)
  - Aspect ratio: Flexible (1:1, 4:3, 16:9)

Inspiration Photos:
  - Max dimension: 1920px
  - Max file size: 1.5MB
  - Format: JPEG (compressed to 80% quality)
  - Aspect ratio: Flexible

Thumbnails (auto-generated):
  - Size: 300x300px
  - Format: JPEG (compressed to 75% quality)
  - File size: ~30-50KB
```

**Rationale:**
- 2048px is sufficient for analysis (Rekognition works well at this resolution)
- 2MB balances quality vs. upload speed
- Thumbnails reduce bandwidth for gallery views
- **Estimated storage per photo: ~2MB (full) + 50KB (thumbnail) = 2.05MB**

#### **Option B: High Quality (Premium)**
```
Profile Photos:
  - Max dimension: 3072px
  - Max file size: 4MB
  - Format: JPEG (compressed to 90% quality)

Inspiration Photos:
  - Max dimension: 2560px
  - Max file size: 3MB
  - Format: JPEG (compressed to 85% quality)
```

**Rationale:**
- Better for professional portfolios
- Higher analysis accuracy
- **Estimated storage per photo: ~4MB (full) + 100KB (thumbnail) = 4.1MB**

#### **Option C: Cost Optimized (Budget)**
```
Profile Photos:
  - Max dimension: 1536px
  - Max file size: 1MB
  - Format: JPEG (compressed to 75% quality)

Inspiration Photos:
  - Max dimension: 1280px
  - Max file size: 800KB
  - Format: JPEG (compressed to 70% quality)
```

**Rationale:**
- Minimal storage costs
- Still sufficient for analysis
- **Estimated storage per photo: ~1MB (full) + 30KB (thumbnail) = 1.03MB**

---

### **Video Sizing Strategy:**

#### **Option A: Balanced (Recommended)**
```
Profile Videos:
  - Max duration: 30 seconds
  - Max resolution: 1080p (1920x1080)
  - Max file size: 15MB
  - Format: MP4 (H.264, 5Mbps bitrate)
  - Frame rate: 30fps

Inspiration Videos:
  - Max duration: 15 seconds
  - Max resolution: 720p (1280x720)
  - Max file size: 8MB
  - Format: MP4 (H.264, 4Mbps bitrate)
  - Frame rate: 30fps

Thumbnails (auto-generated):
  - Extract frame at 1 second
  - Size: 640x360px
  - Format: JPEG
  - File size: ~50KB
```

**Rationale:**
- 30 seconds is enough for profile showcase
- 1080p is standard quality
- 15MB balances quality vs. upload time
- **Estimated storage per video: ~15MB (full) + 50KB (thumbnail) = 15.05MB**

#### **Option B: High Quality (Premium)**
```
Profile Videos:
  - Max duration: 60 seconds
  - Max resolution: 1440p (2560x1440)
  - Max file size: 30MB
  - Format: MP4 (H.264, 8Mbps bitrate)

Inspiration Videos:
  - Max duration: 30 seconds
  - Max resolution: 1080p
  - Max file size: 15MB
```

**Rationale:**
- Better for professional portfolios
- More engaging content
- **Estimated storage per video: ~30MB (full) + 100KB (thumbnail) = 30.1MB**

#### **Option C: Cost Optimized (Budget)**
```
Profile Videos:
  - Max duration: 15 seconds
  - Max resolution: 720p (1280x720)
  - Max file size: 5MB
  - Format: MP4 (H.264, 3Mbps bitrate)

Inspiration Videos:
  - Max duration: 10 seconds
  - Max resolution: 480p (854x480)
  - Max file size: 3MB
```

**Rationale:**
- Minimal storage costs
- Still functional for previews
- **Estimated storage per video: ~5MB (full) + 30KB (thumbnail) = 5.03MB**

---

## 📊 Content Limits Per User Type

### **Models:**
```
Profile Photos:
  - Required: 3-10 photos (minimum 3 for analysis)
  - Maximum: 15 photos
  - Purpose: Profile display, matching, analysis

Profile Videos:
  - Optional: 0-3 videos
  - Maximum: 5 videos
  - Purpose: Profile showcase, personality

Inspiration Board:
  - Photos: 0-20 photos
  - Videos: 0-5 videos
  - Purpose: Style preferences, inspiration

Total Storage (Option A - Balanced):
  - Profile: 15 photos × 2.05MB = 30.75MB
  - Videos: 5 videos × 15.05MB = 75.25MB
  - Inspiration: 20 photos × 2.05MB + 5 videos × 15.05MB = 116.25MB
  - Total: ~222MB per model
```

### **Professionals:**
```
Profile Photos:
  - Required: 1-5 photos (self photos)
  - Maximum: 10 photos
  - Purpose: Profile display, verification

Portfolio Photos:
  - Required: 5-20 photos (before/after work)
  - Maximum: 50 photos
  - Purpose: Showcase work quality

Profile Videos:
  - Optional: 0-2 videos
  - Maximum: 3 videos
  - Purpose: Profile showcase

Portfolio Videos:
  - Optional: 0-5 videos
  - Maximum: 10 videos
  - Purpose: Work process, results

Inspiration Board:
  - Photos: 0-15 photos
  - Videos: 0-3 videos
  - Purpose: Style preferences

Total Storage (Option A - Balanced):
  - Profile: 10 photos × 2.05MB = 20.5MB
  - Portfolio: 50 photos × 2.05MB = 102.5MB
  - Videos: 13 videos × 15.05MB = 195.65MB
  - Inspiration: 15 photos × 2.05MB + 3 videos × 15.05MB = 76.2MB
  - Total: ~394MB per professional
```

### **Partners:**
```
Salon Photos:
  - Required: 3-10 photos (salon/studio space)
  - Maximum: 20 photos
  - Purpose: Showcase space, atmosphere

Contact Photos:
  - Required: 1-3 photos (contact person)
  - Maximum: 5 photos
  - Purpose: Verification

Profile Videos:
  - Optional: 0-2 videos
  - Maximum: 3 videos
  - Purpose: Salon tour, atmosphere

Inspiration Board:
  - Photos: 0-10 photos
  - Videos: 0-2 videos
  - Purpose: Brand aesthetic

Total Storage (Option A - Balanced):
  - Salon: 20 photos × 2.05MB = 41MB
  - Contact: 5 photos × 2.05MB = 10.25MB
  - Videos: 3 videos × 15.05MB = 45.15MB
  - Inspiration: 10 photos × 2.05MB + 2 videos × 15.05MB = 50.6MB
  - Total: ~147MB per partner
```

---

## 💰 Cost Analysis

### **S3 Storage Costs (us-east-1):**

#### **Option A: Balanced (Recommended)**
```
Storage Tiers:
  - Frequent Access (0-90 days): $0.023/GB/month
  - Infrequent Access (90-180 days): $0.0125/GB/month
  - Archive Access (180+ days): $0.004/GB/month
  - Deep Archive (180+ days, rarely accessed): $0.00099/GB/month

Monthly Active Users (MAU):
  - Models: 1,000 users × 222MB = 222GB
  - Professionals: 500 users × 394MB = 197GB
  - Partners: 100 users × 147MB = 14.7GB
  - Total: 433.7GB

Cost Breakdown (assuming 50% in Frequent, 30% in Infrequent, 20% in Archive):
  - Frequent: 216.85GB × $0.023 = $4.99/month
  - Infrequent: 130.11GB × $0.0125 = $1.63/month
  - Archive: 86.74GB × $0.004 = $0.35/month
  - Total: ~$7/month for 1,600 active users

At Scale (10,000 MAU):
  - Total: 4,337GB
  - Cost: ~$70/month
```

#### **Option B: High Quality (Premium)**
```
Monthly Active Users (MAU):
  - Models: 1,000 users × 444MB = 444GB
  - Professionals: 500 users × 788MB = 394GB
  - Partners: 100 users × 294MB = 29.4GB
  - Total: 867.4GB

Cost: ~$14/month for 1,600 active users
At Scale (10,000 MAU): ~$140/month
```

#### **Option C: Cost Optimized (Budget)**
```
Monthly Active Users (MAU):
  - Models: 1,000 users × 111MB = 111GB
  - Professionals: 500 users × 197MB = 98.5GB
  - Partners: 100 users × 73.5MB = 7.35GB
  - Total: 216.85GB

Cost: ~$3.50/month for 1,600 active users
At Scale (10,000 MAU): ~$35/month
```

### **S3 Request Costs:**
```
PUT Requests: $0.005 per 1,000 requests
GET Requests: $0.0004 per 1,000 requests

Estimated:
  - 1,600 users × 10 uploads/month = 16,000 PUT requests = $0.08/month
  - 1,600 users × 100 views/month = 160,000 GET requests = $0.064/month
  - Total: ~$0.15/month
```

### **Data Transfer Costs:**
```
Outbound to Internet: $0.09/GB (first 10TB)

Estimated:
  - 1,600 users × 500MB views/month = 800GB = $72/month
  - At Scale (10,000 MAU): 5,000GB = $450/month
```

### **Total Monthly Cost Estimate:**

#### **Option A: Balanced (Recommended)**
```
1,600 MAU:
  - Storage: $7
  - Requests: $0.15
  - Transfer: $72
  - Total: ~$79/month

10,000 MAU:
  - Storage: $70
  - Requests: $1
  - Transfer: $450
  - Total: ~$521/month
```

#### **Option C: Cost Optimized (Budget)**
```
1,600 MAU:
  - Storage: $3.50
  - Requests: $0.15
  - Transfer: $36 (smaller files = less transfer)
  - Total: ~$40/month

10,000 MAU:
  - Storage: $35
  - Requests: $1
  - Transfer: $225
  - Total: ~$261/month
```

---

## 🎯 Recommended Strategy

### **Recommended: Option A (Balanced)**

**Photo Limits:**
- Profile Photos: 2048px max, 2MB max
- Inspiration Photos: 1920px max, 1.5MB max
- Thumbnails: 300x300px (auto-generated)

**Video Limits:**
- Profile Videos: 30 seconds, 1080p, 15MB max
- Inspiration Videos: 15 seconds, 720p, 8MB max
- Thumbnails: Extract frame at 1 second (auto-generated)

**Content Limits:**
- **Models:** 15 profile photos, 5 profile videos, 20 inspiration photos, 5 inspiration videos
- **Professionals:** 10 profile photos, 50 portfolio photos, 3 profile videos, 10 portfolio videos, 15 inspiration photos, 3 inspiration videos
- **Partners:** 20 salon photos, 5 contact photos, 3 profile videos, 10 inspiration photos, 2 inspiration videos

**Cost:** ~$79/month for 1,600 MAU, ~$521/month for 10,000 MAU

**Benefits:**
- ✅ Good quality for analysis and display
- ✅ Reasonable upload times
- ✅ Cost-effective at scale
- ✅ Intelligent Tiering automatically optimizes costs
- ✅ Thumbnails reduce bandwidth

---

## 🔧 Implementation Recommendations

### **1. Client-Side Optimization:**
```javascript
// Resize photos before upload
- Use browser-image-compression library
- Resize to max dimension (2048px)
- Compress JPEG to 85% quality
- Generate thumbnail (300x300px)

// Video compression
- Use FFmpeg.wasm or similar
- Transcode to H.264, 5Mbps bitrate
- Limit duration to 30 seconds
- Extract thumbnail frame
```

### **2. Server-Side Processing (Lambda):**
```javascript
// Optional: Additional optimization
- Re-compress if client-side failed
- Generate multiple thumbnail sizes (300px, 600px, 1200px)
- Extract video metadata
- Store dimensions, file size, upload date
```

### **3. Storage Structure:**
```
profile-photos/models/{userId}/
  ├── original/
  │   └── {timestamp}.jpg (2048px, 2MB)
  ├── thumbnails/
  │   └── {timestamp}_thumb.jpg (300px, 50KB)
  └── metadata/
      └── {timestamp}.json (dimensions, size, etc.)

videos/reels/{userId}/
  ├── original/
  │   └── {timestamp}.mp4 (1080p, 15MB)
  ├── thumbnails/
  │   └── {timestamp}_thumb.jpg (640x360px, 50KB)
  └── metadata/
      └── {timestamp}.json (duration, resolution, etc.)
```

### **4. Validation & Limits:**
```javascript
// Frontend validation
- Check file size before upload
- Check dimensions before upload
- Check count limits before upload
- Show progress and errors

// Backend validation (Lambda)
- Verify file size limits
- Verify count limits (query DynamoDB)
- Reject if limits exceeded
- Return clear error messages
```

---

## 📋 Summary

### **Recommended Configuration:**
- **Photo Size:** 2048px max, 2MB max (profile), 1.5MB max (inspiration)
- **Video Size:** 30 seconds, 1080p, 15MB max (profile), 8MB max (inspiration)
- **Content Limits:** See limits per user type above
- **Storage:** S3 Intelligent Tiering (already configured)
- **Cost:** ~$79/month for 1,600 MAU, ~$521/month for 10,000 MAU

### **Next Steps:**
1. Implement client-side photo/video optimization
2. Add count limits to upload components
3. Generate thumbnails automatically
4. Add validation in frontend and backend
5. Monitor storage costs and adjust as needed

---

**Last Updated:** 2026-01-05  
**Status:** ✅ Ready for Implementation

