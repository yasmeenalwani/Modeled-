# 📸 Photo Storage & Display - Complete Overview

## Current Architecture

### 1. **Storage Layer (S3)**
**Location:** `amplify/storage/resource.ts`

**Bucket Structure:**
```
modeledStorage/
├── profile-photos/
│   ├── models/{userId}/
│   ├── professionals/{userId}/
│   └── partners/{userId}/
├── session-photos/
│   ├── before/{bookingId}/
│   └── after/{bookingId}/
├── portfolios/
│   └── {professionalId}/
├── documents/
│   ├── licenses/{userId}/
│   └── insurance/{userId}/
├── videos/
│   ├── profile/{userId}/
│   └── portfolio/{professionalId}/
└── marketing/ (admin-only)
```

**Permissions:**
- Users can upload/delete their own photos
- Admins have full access
- Others can read approved photos

---

### 2. **Database Storage (DynamoDB)**
**Location:** `amplify/data/resource.ts`

**Photo Fields:**
- **ModelProfile:**
  - `photoUrls: string[]` - Array of S3 URLs/keys
  - `headshotUrl: string` - Primary profile photo
  
- **Professional:**
  - `portfolioUrls: string[]` - Work portfolio photos
  - `selfPhotoUrls: string[]` - Profile/verification photos
  
- **Partner:**
  - `selfPhotoUrls: string[]` - Contact person photos
  - `salonPhotoUrls: string[]` - Salon/studio photos

**Issue:** URLs vs. Keys not clearly separated in schema

---

### 3. **Upload Flow**
**Component:** `src/components/PhotoUploader.jsx`

**Process:**
1. User selects/drops files
2. **Client-side optimization** (resize, compress)
3. Generate S3 path via `pathGenerator` function
4. Upload to S3 with progress tracking
5. Get signed URL from S3
6. Store URL in database

**Configuration:**
- **Profile Photos:** Max 2MB, 2048px, 85% quality
- **Inspiration Photos:** Max 1.5MB, 1920px, 80% quality
- **Portfolio Photos:** Uses profile photo settings

---

### 4. **Photo Display Patterns**

**Current Implementation:**
1. **Direct URL display** - Photos stored as URLs in database
2. **Unsplash fallbacks** - `imageHelpers.js` provides fallback URLs
3. **Error handling** - `handleImageError` catches failed loads

**Usage Examples:**
- `ModelProfile.photoUrls` → Displayed in galleries
- `ModelProfile.headshotUrl` → Profile avatars
- `Professional.portfolioUrls` → Portfolio showcases
- Session photos → Before/after comparisons

---

## Current Issues & Gaps

### 1. **URL vs. Key Confusion** ⚠️
**Problem:** Database stores full URLs, but S3 uses keys
- URLs expire (signed URLs have expiration)
- Hard to regenerate URLs if expired
- Should store S3 keys, generate URLs on-demand

**Current:**
```javascript
photoUrls: ["https://bucket.s3.amazonaws.com/profile-photos/models/123/photo.jpg?signature=..."]
```

**Should be:**
```javascript
photoUrls: ["profile-photos/models/123/photo.jpg"]  // S3 key
// Generate URL on display: getUrl({ key: photoUrl })
```

---

### 2. **No Image CDN** ⚠️
**Problem:** Direct S3 access (no CloudFront/CDN)
- Slower loading
- No image optimization/transformation
- No caching benefits

**Recommendation:** Use CloudFront for image delivery

---

### 3. **No Thumbnails** ⚠️
**Problem:** Full-size images loaded everywhere
- Slow gallery loading
- Wasted bandwidth
- Poor mobile experience

**Recommendation:** Generate thumbnails on upload, store separately

---

### 4. **Inconsistent Display Logic** ⚠️
**Problem:** Different components handle photos differently
- Some use `photoUrls`, others use `headshotUrl`
- Fallback logic scattered
- Unsplash fallbacks mixed with real photos

**Recommendation:** Centralized photo display utility

---

### 5. **No Photo Management** ⚠️
**Problem:** Can't easily:
- View all photos
- Delete specific photos
- Reorder photos
- Set primary photo

**Recommendation:** Photo management UI

---

### 6. **Missing Photo Metadata** ⚠️
**Problem:** No metadata stored:
- Upload date
- File size
- Dimensions
- Tags/categories
- Approval status (for admin review)

**Recommendation:** Create `Photo` model with metadata

---

## Recommendations

### Priority 1: Fix URL vs. Key Storage

**Change:**
1. Store S3 **keys** in database (not full URLs)
2. Generate signed URLs on-demand when displaying
3. Add URL caching (cache signed URLs for 1 hour)

**Implementation:**
```javascript
// Store keys
photoUrls: ["profile-photos/models/123/photo.jpg"]

// Display helper
async function getPhotoUrl(key) {
  const cacheKey = `photo_url_${key}`;
  let url = sessionStorage.getItem(cacheKey);
  
  if (!url) {
    const result = await getUrl({ key, options: { expiresIn: 3600 } });
    url = result.url.toString();
    sessionStorage.setItem(cacheKey, url);
  }
  
  return url;
}
```

---

### Priority 2: Image Optimization & CDN

**Add CloudFront:**
1. Configure S3 bucket as CloudFront origin
2. Use CloudFront URLs for all photo displays
3. Enable image compression
4. Add cache headers

**Benefits:**
- Faster loading (edge locations)
- Automatic compression
- Better caching
- Lower S3 costs

---

### Priority 3: Thumbnail Generation

**On Upload:**
1. Generate multiple sizes:
   - Thumbnail: 200x200
   - Small: 400x400
   - Medium: 800x800
   - Large: 2048x2048 (original)
2. Store all sizes in S3
3. Use appropriate size for display context

**Storage Path:**
```
profile-photos/models/{userId}/
  ├── original/{timestamp}.jpg
  ├── large/{timestamp}.jpg
  ├── medium/{timestamp}.jpg
  └── thumb/{timestamp}.jpg
```

**Display:**
```javascript
function getPhotoUrl(key, size = 'medium') {
  const sizePath = size === 'original' ? '' : `${size}/`;
  return getUrl({ key: `${key.replace('/original/', `/${sizePath}`)}` });
}
```

---

### Priority 4: Centralized Photo Utility

**Create:** `src/utils/photoDisplay.js`

```javascript
// Get photo URL (handles keys, caching, fallbacks)
export async function getPhotoUrl(keyOrUrl, size = 'medium', fallback = null)

// Display photo component
export function Photo({ 
  src, // key or url
  size,
  alt,
  fallback,
  className 
})

// Photo gallery component
export function PhotoGallery({ 
  photos, // array of keys/urls
  size,
  onSelect,
  onDelete 
})
```

---

### Priority 5: Photo Management UI

**Features:**
- View all photos in one place
- Delete photos
- Reorder photos (drag & drop)
- Set primary/headshot photo
- Bulk operations
- Photo metadata (size, date, dimensions)

**Location:** Add to profile pages

---

### Priority 6: Photo Metadata Model

**New Model:** `Photo`

```typescript
Photo: a.model({
  key: a.string().required(), // S3 key
  userId: a.string().required(), // Owner
  type: a.enum(['profile', 'portfolio', 'session_before', 'session_after']),
  category: a.string(), // 'hair', 'color', 'cut', etc.
  
  // Metadata
  width: a.integer(),
  height: a.integer(),
  fileSize: a.integer(), // bytes
  uploadedAt: a.datetime(),
  
  // Sizes available
  sizes: a.json(), // { thumb: 'key', medium: 'key', large: 'key' }
  
  // Tags
  tags: a.string().array(),
  
  // Status
  status: a.enum(['pending', 'approved', 'rejected']),
  
  // Order (for galleries)
  displayOrder: a.integer(),
}).authorization(...)
```

---

## Display Patterns to Standardize

### 1. **Profile Avatars**
```javascript
// Always use headshotUrl, fallback to first photoUrl, then default avatar
<Avatar src={profile.headshotUrl || profile.photoUrls?.[0] || DEFAULT_AVATAR} />
```

### 2. **Photo Galleries**
```javascript
// Use PhotoGallery component with lazy loading
<PhotoGallery 
  photos={profile.photoUrls} 
  size="medium"
  lazy={true}
/>
```

### 3. **Portfolio Showcases**
```javascript
// Before/after pairs
<BeforeAfter 
  before={session.beforePhotoUrl}
  after={session.afterPhotoUrl}
/>
```

### 4. **Session Photos**
```javascript
// Service-specific photos
<SessionPhoto 
  service={booking.serviceType}
  photo={booking.photoUrl || getPhotoForService(booking.serviceType)}
/>
```

---

## Cost Optimization

### Current Settings:
- **Max photo size:** 2MB
- **Max dimension:** 2048px
- **Quality:** 85%

### Recommendations:
1. **Further compression:** Reduce quality to 80% for non-critical photos
2. **WebP format:** Convert JPEG to WebP (30% smaller)
3. **Lazy loading:** Only load visible photos
4. **Image CDN:** CloudFront reduces data transfer costs
5. **Delete unused photos:** Cleanup old/unused photos

---

## Migration Plan (If Needed)

### If switching from URLs to Keys:

1. **Phase 1:** Update upload to store keys
2. **Phase 2:** Create migration script to convert existing URLs to keys
3. **Phase 3:** Update all display code to use key→URL conversion
4. **Phase 4:** Remove URL storage, use keys only

---

## Questions for Discussion

1. **Should we store URLs or keys?** (Recommendation: Keys)
2. **Do we need CloudFront/CDN?** (Recommendation: Yes, for production)
3. **Should we generate thumbnails?** (Recommendation: Yes, for performance)
4. **Do we need a Photo model?** (Recommendation: Yes, for metadata)
5. **What's the photo approval workflow?** (Models may need admin approval?)
6. **Do we need photo analytics?** (Views, downloads, etc.)
7. **Should professionals see model photos before booking?** (Privacy consideration)
8. **How do we handle photo deletions?** (Orphaned S3 files vs. DB cleanup)

---

## Next Steps

1. **Decide on URL vs. Key storage**
2. **Implement photo display utility**
3. **Add thumbnail generation**
4. **Set up CloudFront (if approved)**
5. **Create Photo management UI**
6. **Add Photo metadata model (optional)**

---

**What would you like to discuss first?** 🎯

