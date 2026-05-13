# Photo upload & onboarding – full deep dive

## 1. Where the “face too small” error comes from

- **Message:** “Move closer – your face is too small” (Needs improvement).
- **Source:** Client-side only.  
  **File:** `src/utils/photoRequirements.js` → `QUALITY_MESSAGES.faceTooSmall`  
  **Used in:** `src/components/PhotoQualityChecker.jsx` when **face-required** steps (e.g. Front Face, Side Profile) are validated.
- **Rule:** The detected face must be at least **10% of the image area** (see below).  
  Previously 15%; relaxed to 10% so normal headshots (face not huge in frame) pass more often.

---

## 2. All photo parameters (single place to tune)

Everything below is what the app uses for **validation and quality**. Rekognition/Bedrock on the backend do **not** change these thresholds; they run **after** upload.

### 2.1 File & format (`src/utils/photoRequirements.js` → `PHOTO_TECHNICAL_REQUIREMENTS`)

| Parameter        | Value        | Meaning |
|-----------------|--------------|--------|
| **maxFileSize** | 15 MB        | Max file size (was 10 MB). |
| **acceptedFormats** | JPEG, PNG, WebP | Allowed MIME types. |
| **minResolution**   | 480×480 px   | Minimum dimensions (reject tiny images). |
| **maxResolution**   | 4096×4096 px | Not enforced in front-end; storage allows up to 4096. |

Same idea in **`src/utils/profileConstants.js`**: `PHOTO_REQUIREMENTS.maxSize` = 15 MB, `minDimensions` = 800×800 (used where that constant is imported).

### 2.2 Quality (brightness, blur, sharpness) – client-side only

In **`PHOTO_TECHNICAL_REQUIREMENTS.quality`**:

| Parameter       | Value | Meaning |
|----------------|-------|--------|
| **minBrightness** | 25  | Reject if too dark (0–255). |
| **maxBrightness** | 248 | Reject if overexposed. |
| **maxBlur**       | 55  | Laplacian variance; **below** this → “Too blurry”. |
| **minContrast**   | 30  | Minimum contrast. |
| **minSharpness**  | 50  | Sharpness score. |

Images are analyzed at **500px** scale for these checks.

### 2.3 Face (client-side – “face too small” lives here)

In **`PHOTO_TECHNICAL_REQUIREMENTS.face`**:

| Parameter           | Value | Meaning |
|--------------------|-------|--------|
| **minFaceSize**    | **0.10** (10%) | Face bounding box area / image area. **Below this → “Move closer – your face is too small.”** |
| **maxFaceSize**    | 0.85 (85%)     | Above this → “Move back – your face is too close.” |
| **minConfidence**  | 90             | Comment says “Rekognition %”; actually used as reference. Client uses MediaPipe. |
| **centerTolerance**| 0.3            | How far face center can be from image center (not currently enforced in checker). |

**Relaxing “face too small”:** Lower **minFaceSize** (e.g. 0.08 = 8%) in `photoRequirements.js` if you want to allow even smaller faces in frame.

### 2.4 Per-step requirements (model onboarding)

In **`PHOTO_STEPS`** in `photoRequirements.js`, each step can override or add:

- **front_face:** `faceRequired: true`, `minFaceSize: 0.20` (step-level; checker uses **global** 0.10).
- **side_profile:** `faceRequired: true`, `profileView: true`.
- **hair_front / hair_back:** `hairVisible`, `minBodyVisible`, etc.

The **effective** face-size check in code is the **global** `PHOTO_TECHNICAL_REQUIREMENTS.face.minFaceSize` (now 0.10), not the step’s 0.20.

### 2.5 Storage limits (upload path)

In **`src/utils/storage.js`** → `STORAGE_CONFIG`:

- **photo:** maxSizeMB = 15, maxDimension = 4096, quality = 0.85.
- **inspirationPhoto:** maxSizeMB = 15.

So: **file size and dimension limits** are 15 MB and 4096 px; **face size and quality** are from `photoRequirements.js` above.

---

## 3. Client-side flow (what runs in the browser)

### 3.1 Model onboarding (guided photo capture)

1. **Page:** `src/pages/ModelOnboard.jsx` → uses **`GuidedPhotoCapture`**.
2. **Component:** `src/components/GuidedPhotoCapture.jsx` → for each step, shows **`PhotoQualityChecker`**.
3. **Checker:** `src/components/PhotoQualityChecker.jsx`:
   - Validates **file** (format, size) via `validateImageFile()` from `photoRequirements.js`.
   - Validates **dimensions** via `validateImageDimensions()` (min 480×480).
   - Loads image with **EXIF orientation** (`exifOrientation.js`).
   - Draws to a **500px** canvas and runs:
     - **`checkPhotoQuality()`** → brightness, blur, **content relevance** (reject ocean/landscape, require skin for face steps).
     - If step has **`faceRequired`**: calls **`detectFaces()`** from `faceDetection.js`.
4. **Face detection:** **`src/utils/faceDetection.js`** – **MediaPipe BlazeFace** (client-side, no Rekognition here):
   - Returns `{ detected, confidence, size, position }`.
   - **size** = (face bounding box area) / (image area), 0–1.
   - If **size < PHOTO_TECHNICAL_REQUIREMENTS.face.minFaceSize** (0.10) → **“Move closer – your face is too small.”**

So: **“Face too small” = MediaPipe face area &lt; 10% of image.** No Rekognition or Bedrock in this path.

### 3.2 Pro onboarding (photos)

- **Page:** `src/pages/ProfessionalOnboard.jsx`.
- **Photos:** Self-photos and work portfolio; upload UI and validation may use **`PhotoUploader`** and/or **storage** helpers.
- **Limits:** Same **storage** config (e.g. 15 MB, 4096 px) and, where used, **profileConstants** / **photoRequirements** (e.g. 15 MB, format).

Pro onboarding does **not** use the same **guided face steps** as model onboarding, so there is **no “face too small”** check for pros unless you add a similar flow later.

---

## 4. Rekognition and Bedrock (backend, after upload)

- **When:** After the file is **uploaded to S3** (or when the **photo-analysis** Lambda is invoked with bucket/key).
- **Where:** **`amplify/functions/photo-analysis/handler.ts`** (Hair Engine).

Rough flow:

1. **Rekognition**
   - **DetectModerationLabels** → content policy; reject and delete if inappropriate.
   - **DetectFaces** → face presence/quality.
   - **DetectLabels** → scene/object labels.
2. **Quality gate** (in Lambda): `validatePhotoQuality(rekognitionResults, { stepId })` – can reject blur, occlusion, etc. **Does not use the same 10% face-size rule**; it uses Rekognition’s face metrics.
3. **Bedrock** (if configured): `analyzeWithBedrock(bucket, key, rekognitionResults)` – extra understanding.
4. **Attribute mapping:** `AttributeMapper` (hair) and `BeautyAttributeMapper` (beauty) map Rekognition + Bedrock to profile attributes.
5. **Write:** Update model profile (and optional training table).

So: **Rekognition/Bedrock do not show “Move closer – your face is too small.”** That message is **only** from the **client-side** MediaPipe + `minFaceSize` in `photoRequirements.js`. Backend can still reject photos for other reasons (moderation, quality, face not detected by Rekognition).

---

## 5. Quick reference – where to change what

| Goal | File | What to change |
|------|------|----------------|
| Allow smaller face in frame (“face too small”) | `src/utils/photoRequirements.js` | `PHOTO_TECHNICAL_REQUIREMENTS.face.minFaceSize` (e.g. 0.10 → 0.08). |
| Change “face too small” message | `src/utils/photoRequirements.js` | `QUALITY_MESSAGES.faceTooSmall.message`. |
| Max file size (e.g. 15 MB) | `photoRequirements.js`, `profileConstants.js`, `storage.js` | `maxFileSize` / `maxSize` / `maxSizeMB` (keep in sync). |
| Min resolution (e.g. 480×480) | `photoRequirements.js` | `PHOTO_TECHNICAL_REQUIREMENTS.minResolution`. |
| Brightness / blur / content checks | `photoRequirements.js` | `PHOTO_TECHNICAL_REQUIREMENTS.quality`, `checkImageContentRelevance`, `checkPhotoQuality`. |
| Backend quality / moderation | `amplify/functions/photo-analysis/handler.ts` | Rekognition calls, `validatePhotoQuality`, moderation handling. |

---

## 6. Summary

- **“Move closer – your face is too small”** = client-side only: MediaPipe face area **&lt; minFaceSize** (now **10%** of image). Relaxed from 15% so headshots like yours pass more often.
- **All “photo parameters”** that affect this and related messages live in **`src/utils/photoRequirements.js`** (and in part **`profileConstants.js`**, **`storage.js`** for size/dimensions).
- **Rekognition** and **Bedrock** run **after** upload in **`amplify/functions/photo-analysis`**; they do **not** control the “face too small” copy or the 10% rule. For onboarding UX, you only need to adjust the **client-side** parameters above.
