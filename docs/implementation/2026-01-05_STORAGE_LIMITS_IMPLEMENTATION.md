# Storage Limits Implementation Guide
*Created: 2026-01-05*

## 🎯 Overview

Implementation guide for storage limits and sizing strategy based on cost optimization decisions.

---

## ✅ Decisions Summary

1. **Analysis Scope:** Analyze ALL photos (models, professionals, partners, session photos)
2. **User Experience:** Admin sees full analysis, users see limited view
3. **Storage Strategy:** S3 Intelligent Tiering + content limits
4. **Content Types:** Profile photos/videos + Inspiration board photos/videos

---

## 📏 Updated Storage Configuration

### **Photo Limits:**
- **Profile Photos:** 2048px max, 2MB max, 85% JPEG quality
- **Inspiration Photos:** 1920px max, 1.5MB max, 80% JPEG quality
- **Thumbnails:** 300x300px, 75% JPEG quality, ~50KB

### **Video Limits:**
- **Profile Videos:** 30 seconds, 1080p, 15MB max, 5Mbps bitrate
- **Inspiration Videos:** 15 seconds, 720p, 8MB max, 4Mbps bitrate
- **Thumbnails:** Extract frame at 1 second, 640x360px, ~50KB

### **Content Limits Per User Type:**

#### **Models:**
- Profile Photos: 3-15 (required: 3 minimum)
- Profile Videos: 0-5
- Inspiration Photos: 0-20
- Inspiration Videos: 0-5
- **Estimated Storage:** ~222MB

#### **Professionals:**
- Profile Photos: 1-10 (required: 1 minimum)
- Portfolio Photos: 5-50 (required: 5 minimum)
- Profile Videos: 0-3
- Portfolio Videos: 0-10
- Inspiration Photos: 0-15
- Inspiration Videos: 0-3
- **Estimated Storage:** ~394MB

#### **Partners:**
- Salon Photos: 3-20 (required: 3 minimum)
- Contact Photos: 1-5 (required: 1 minimum)
- Profile Videos: 0-3
- Inspiration Photos: 0-10
- Inspiration Videos: 0-2
- **Estimated Storage:** ~147MB

---

## 🔧 Implementation Changes

### **1. Updated Files:**

#### **`src/utils/storage.js`:**
- ✅ Updated `STORAGE_CONFIG` with new limits
- ✅ Added `inspirationPhoto` and `inspirationVideo` configs
- ✅ Added `thumbnail` config
- ✅ Reduced photo max size from 10MB → 2MB
- ✅ Reduced photo max dimension from 4096px → 2048px
- ✅ Reduced video max size from 50MB → 15MB

#### **`src/utils/storageLimits.js` (NEW):**
- ✅ Created storage limits configuration
- ✅ Added `getStorageLimits()` function
- ✅ Added `checkContentLimit()` function
- ✅ Added `getEstimatedStorage()` function
- ✅ Added `validateAllLimits()` function

#### **`amplify/storage/resource.ts`:**
- ✅ Added video paths: `videos/profile/`, `videos/portfolio/`, `videos/inspiration/`
- ✅ Added inspiration board path: `inspiration/photos/`
- ✅ Updated S3 triggers to analyze ALL photos (models, professionals, partners, session, portfolio)

---

## 📋 Next Steps

### **High Priority:**
1. **Update Upload Components:**
   - Add limit checking in `PhotoUploader.jsx`
   - Add limit checking in `VideoUploader.jsx`
   - Show remaining count to users
   - Prevent uploads when limits reached

2. **Client-Side Optimization:**
   - Implement photo resizing (2048px max)
   - Implement photo compression (85% quality)
   - Implement video transcoding (1080p, 5Mbps)
   - Generate thumbnails automatically

3. **Backend Validation:**
   - Add Lambda function to validate limits before upload
   - Query DynamoDB to count existing content
   - Reject uploads that exceed limits

### **Medium Priority:**
4. **UI Updates:**
   - Show storage usage to users
   - Display remaining slots for each content type
   - Add upgrade prompts when limits reached

5. **Inspiration Board:**
   - Create `InspirationBoard` component for photos/videos
   - Add upload functionality
   - Add gallery view

### **Low Priority:**
6. **Analytics:**
   - Track storage usage per user
   - Monitor cost trends
   - Alert when approaching budget limits

---

## 💰 Cost Estimates

### **At 1,600 MAU (Monthly Active Users):**
- **Storage:** ~$7/month (S3 Intelligent Tiering)
- **Requests:** ~$0.15/month
- **Transfer:** ~$72/month
- **Total:** ~$79/month

### **At 10,000 MAU:**
- **Storage:** ~$70/month
- **Requests:** ~$1/month
- **Transfer:** ~$450/month
- **Total:** ~$521/month

---

## 🧪 Testing Checklist

- [ ] Photo upload respects 2MB limit
- [ ] Photo upload respects 2048px dimension limit
- [ ] Video upload respects 15MB limit
- [ ] Video upload respects 30-second duration limit
- [ ] Content count limits enforced per user type
- [ ] Thumbnails generated automatically
- [ ] S3 triggers fire for all photo types
- [ ] Analysis runs for all uploaded photos
- [ ] Storage usage calculated correctly
- [ ] Error messages clear when limits exceeded

---

**Last Updated:** 2026-01-05  
**Status:** ✅ Configuration Updated, Ready for Component Updates

