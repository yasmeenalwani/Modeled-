# Photo Upload / Analysis — Full Logic & Guidelines (Copy-Paste Spec)

Use this as a reference to review and specify improvements.

---

## 1. PHOTO STEPS (6 required)

| Step ID | Title | Instruction | Requirements |
|---------|-------|--------------|--------------|
| front_face | Front Face Photo | Look directly at the camera with a neutral expression | faceRequired: true, minFaceSize: 0.20 |
| side_profile | Side Profile | Turn to show your side profile (left or right) | faceRequired: true, profileView: true |
| hair_front | Hair - Front View | Show your hair from the front, shoulders visible | minBodyVisible: 0.30, hairVisible: true |
| hair_back | Hair - Back View | Show the back of your hair to capture full length | backView: true, showHairLength: true |
| hair_closeup | Hair Texture Close-Up | Show your hair texture up close (6-12 inches from camera) | closeUp: true, minDetail: true |
| hair_natural | Hair - Natural State | Show your hair in its natural state (air-dried, no heat styling) | naturalState: true |

---

## 2. TECHNICAL REQUIREMENTS

```
minResolution: 480 x 480
maxResolution: 4096 x 4096
maxFileSize: 10 MB
acceptedFormats: image/jpeg, image/png, image/webp

Quality thresholds:
  minBrightness: 35 (0-255)     → reject if darker
  maxBrightness: 248 (0-255)    → reject if brighter
  maxBlur: 55                    → Laplacian variance, reject if LOWER (more blurry)
  Low-light warning: brightness 35-60
  Slight blur warning: variance 55-135

Face (for face steps):
  minFaceSize: 0.15 (15% of image)
  maxFaceSize: 0.85 (85% of image)
  minConfidence: 90% (Rekognition - server-side only)
  maxPhotoAge: 21 days (guidance only, not enforced)
```

---

## 3. VALIDATION ORDER (PhotoQualityChecker flow)

1. **File validation** (before load)
   - Format: JPG, PNG, WebP only
   - Size: max 10MB

2. **Dimension validation** (after load)
   - width >= 480 AND height >= 480
   - Error: "Image too small - use a higher resolution"

3. **Pixel analysis** (on scaled 500px canvas)
   - Content relevance (see section 4)
   - Brightness (see section 5)
   - Blur / sharpness (see section 6)

4. **Face steps only**: simulateFaceDetection
   - Currently ALWAYS returns detected: true (stub)
   - Face size check (minFaceSize, maxFaceSize) — never triggers due to stub

---

## 4. CONTENT RELEVANCE (checkImageContentRelevance)

**Method:** Pixel sampling (every 4th or 8th pixel). Counts:
- skinPct: % of pixels in skin-tone RGB range
- bluePct: % blue-dominant (water, sky)
- greenPct: % green-dominant (grass, landscape)
- neutralPct: % very uniform (range < 20)

**Skin tone heuristic:**
```
r > 55, g > 25, b > 12
r < 255, g < 245, b < 235
r > b
r > g OR |r-g| < 35
|r-g| < 100
max(r,g,b) - min(r,g,b) > 15
```

**Blue-dominant:**
- b > r AND b > g AND b > 100
- OR cyan: b > 120, g > 100, r < g, r < b

**Green-dominant:**
- g > r AND g > b AND g > 80

**Rejection rules:**
| Rule | Condition | Message |
|------|-----------|---------|
| Ocean/sky | bluePct > 42 AND skinPct < 3 | "Please upload a photo of yourself, not a landscape or scenery" |
| Landscape/grass | greenPct > 55 AND skinPct < 2 | Same |
| Uniform/blank | neutralPct > 95 AND skinPct < 1 | "This doesn't look like a photo of you..." |
| No face (face steps) | faceRequired AND skinPct < 5 | "This doesn't look like a photo of you..." |
| No person (hair steps) | hairVisible AND skinPct < 1 AND low blue/green | Same |

---

## 5. BRIGHTNESS CHECK

- **Formula:** Luminosity = R*0.299 + G*0.587 + B*0.114 (per pixel, averaged)
- **Error** (block): brightness < 35 → "Too dark - move to a brighter area"
- **Warning**: 35–60 → "Try moving to better lighting"
- **Warning**: > 248 → "Slightly overexposed - try less direct light"

---

## 6. BLUR / SHARPNESS CHECK

- **Method:** Grayscale pixel variance (simplified Laplacian)
- **Higher variance = sharper**
- **Error** (block): variance < 55 → "Too blurry - hold still and try again"
- **Warning**: 55–135 → "Hold steady - slight blur detected"
- **Note:** Image is scaled to max 500px before analysis; scaling reduces variance

---

## 7. ERROR MESSAGES (QUALITY_MESSAGES)

| Key | Message |
|-----|---------|
| tooDark | Too dark - move to a brighter area |
| tooBlurry | Too blurry - hold still and try again |
| noFace | No face detected - make sure your face is visible |
| faceTooSmall | Move closer - your face is too small |
| faceTooLarge | Move back - your face is too close |
| faceNotCentered | Center your face in the frame |
| wrongContent | This doesn't look like a photo of you - please upload a clear photo of your face or hair |
| wrongContentLandscape | Please upload a photo of yourself, not a landscape or scenery |
| tooSmall | Image too small - use a higher resolution |
| wrongFormat | Please use JPG, PNG, or WebP format |
| tooLarge | File too large - must be under 10MB |

---

## 8. UI / FLOW (GuidedPhotoCapture)

- **Required:** All 6 photos must pass validation (isValid) before submit
- **Accept button:** Disabled until qualityResult.isValid
- **Technical metrics:** Hidden from model onboard (showTechnicalMetrics=false), shown in admin
- **File input:** accept="image/jpeg,image/png,image/webp"
- **User guidance:** "JPG, PNG, or WebP • Max 10MB • Within last 3 weeks"

---

## 9. SCORE PENALTIES (checkPhotoQuality)

| Issue | Score change |
|-------|--------------|
| Wrong content | -50 |
| Too dark | -30 |
| Too blurry | -30 |
| Low light (warning) | -10 |
| Overexposed (warning) | -10 |
| Slight blur (warning) | -10 |
| Score clamped | 0–100 |

---

## 10. STEP-SPECIFIC CONTENT CHECKS

| Step          | faceRequired | hairVisible | Content checks applied                                         |
|---------------|--------------|-------------|-----------------------------------------------------------------|
| front_face    | ✓            | -           | skinPct ≥ 5, no ocean/landscape/uniform                         |
| side_profile  | ✓            | -           | skinPct ≥ 5, no ocean/landscape/uniform                         |
| hair_front    | -            | ✓           | skinPct ≥ 1 (or blue/green dominant), no ocean/landscape/uniform |
| hair_back     | -            | -           | only ocean/landscape/uniform (skin not required)               |
| hair_closeup  | -            | -           | only ocean/landscape/uniform (skin not required)                |
| hair_natural  | -            | -           | only ocean/landscape/uniform (skin not required)                |

---

## 11. CLIENT-SIDE FACE DETECTION (MediaPipe) — Implemented

- **Model:** MediaPipe Face Detector (BlazeFace short-range) via `@mediapipe/tasks-vision`
- **Location:** [src/utils/faceDetection.js](src/utils/faceDetection.js)
- **Flow:** Lazy-load on first face step; `detectFaces(img)` returns `{ detected, confidence (0–1), size, position }`
- **Validation:** No face → reject; face size outside min/max → reject. Uses largest face if multiple.
- **Fallback:** If model load or detection fails → allow with warning "Face detection unavailable — your photo will be checked after upload." Backend Rekognition remains final gate.
- **Timeout:** 5s detection timeout; on timeout, falls back to allow-with-warning.

## 12. EXIF ORIENTATION — Implemented

- **Location:** [src/utils/exifOrientation.js](src/utils/exifOrientation.js)
- **Flow:** `loadImageWithCorrectOrientation(file|url)` uses `createImageBitmap(blob, { imageOrientation: 'from-image' })` to respect EXIF before any analysis.
- **Order:** Applied first; dimensions, quality checks, and face detection all use the correctly oriented canvas.
- **Fallback:** If createImageBitmap fails (older browser), falls back to Image element load.
- **Browser support:** Chrome 112+, Safari 16+, Firefox 111+.

## 13. NOT IMPLEMENTED / PLACEHOLDER

- **Photo recency (validatePhotoRecency):** Always returns `isValid: true`. Shows guidance only; EXIF date not checked.

---

## 14. BACKEND (post-upload) — Rekognition Pipeline

```
Photo Upload → S3
    │
    ▼
1. DetectModerationLabels (runs first)
   → Reject if confidence ≥ 80%: Explicit Nudity, Suggestive, Nudity, Violence, Drug, Tobacco
    │ (if clean)
    ▼
2. DetectLabels (GENERAL_LABELS + IMAGE_PROPERTIES)
   → Person, Hair, Face, Skin, Blonde, Curly, etc.
    │
    ▼
3. DetectFaces (Attributes: ALL)
   → BoundingBox, Quality (Brightness, Sharpness), Pose (Yaw, Pitch), EyesOpen, etc.
    │
    ▼
4. Quality checks (server-side)
   - No face → reject
   - Sunglasses → reject
   - Eyes closed → reject
   - Yaw > 30° → reject
   - Pitch > 25° → reject
   - Sharpness < 50 → reject
   - Brightness < 40 → reject
    │
    ▼
5. AttributeMapper + BeautyMapper → ModelProfile
```

---

*End of spec. Tell me what to improve.*
