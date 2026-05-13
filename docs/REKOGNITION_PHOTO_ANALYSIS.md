# Rekognition Photo Analysis – How It Works

## Overview

When a model uploads a photo (profile, hair, or headshot), the **photo-analysis** Lambda runs and uses **AWS Rekognition** to analyze it. This document describes exactly what happens, step by step.

---

## Step-by-Step: What Happens When a Girl Uploads a Photo

### 1. **Trigger**
- **S3 trigger**: Photo is uploaded to `profile-photos/models/{userId}/` or similar path → Lambda runs automatically.
- **Direct invocation**: Admin or app can call the Lambda with `{ bucket, key, userId, photoType }`.

### 2. **Rekognition Analysis (Current)**

The Lambda calls **two** Rekognition APIs:

#### A. **DetectLabels**
```
Input: S3 image (JPEG/PNG)
Output: Up to 50 labels with confidence scores
```

**What it detects:**
- **Objects**: Person, Hair, Face, Skin, Clothing, Jewelry, Glasses, etc.
- **Concepts**: Portrait, Indoor, Outdoor, Studio, Selfie, etc.
- **Image properties**: Dominant colors (RGB), brightness, sharpness

**Current settings:**
- `MaxLabels: 50`
- `MinConfidence: 50`
- `Features: ['GENERAL_LABELS', 'IMAGE_PROPERTIES']`

**Example output:**
```json
{
  "Labels": [
    { "Name": "Person", "Confidence": 99.8 },
    { "Name": "Hair", "Confidence": 98.2 },
    { "Name": "Face", "Confidence": 99.1 },
    { "Name": "Portrait", "Confidence": 95.0 },
    { "Name": "Skin", "Confidence": 92.0 },
    { "Name": "Human", "Confidence": 99.9 },
    { "Name": "Blonde", "Confidence": 78.0 },
    { "Name": "Wavy", "Confidence": 65.0 }
  ],
  "ImageProperties": {
    "DominantColors": [
      { "Color": { "Red": 180, "Green": 150, "Blue": 120 } }
    ]
  }
}
```

**How we use it:**
- **Hair Engine**: Maps labels like "Blonde", "Wavy", "Curly", "Black", "Brown" → `hairColor`, `hairTexture`, `hairLength`.
- **Beauty Engine**: Uses "Skin", "Face", dominant colors → `skinTone`, `skinUndertone`.
- **AttributeMapper** and **BeautyAttributeMapper** apply rule-based logic to turn labels into our schema.

---

#### B. **DetectFaces**
```
Input: S3 image
Output: FaceDetails for each face (up to 100 largest)
```

**What it detects (with `Attributes: ['ALL']`):**

| Attribute | What It Returns | How We Use It |
|-----------|-----------------|---------------|
| **BoundingBox** | Face location (left, top, width, height) | Crop/region of interest |
| **Confidence** | Face detection confidence | Quality filter |
| **AgeRange** | `{ Low: 22, High: 28 }` | Age estimate (not stored for matching) |
| **Gender** | `{ Value: "Female", Confidence: 99.2 }` | Validation (model must be person) |
| **Emotions** | Happy, Sad, Angry, Confused, Disgusted, Surprised, Calm, Fear | Expression/quality hint |
| **Eyeglasses** | `{ Value: true, Confidence: 95 }` | Occlusion note |
| **Sunglasses** | Same | Occlusion note |
| **Beard** | Present/absent | Face feature |
| **Mustache** | Present/absent | Face feature |
| **EyesOpen** | `{ Value: true, Confidence: 98 }` | Photo quality |
| **MouthOpen** | Same | Photo quality |
| **Smile** | `{ Value: true, Confidence: 85 }` | Expression |
| **Pose** | Pitch, Roll, Yaw (head angle) | Quality – reject if face too tilted |
| **Quality** | Brightness, Sharpness | Reject blurry/dark photos |
| **Landmarks** | Eye, nose, mouth coordinates | Face geometry for future use |

**Example FaceDetails:**
```json
{
  "BoundingBox": { "Width": 0.35, "Height": 0.5, "Left": 0.32, "Top": 0.2 },
  "Confidence": 99.8,
  "AgeRange": { "Low": 22, "High": 28 },
  "Gender": { "Value": "Female", "Confidence": 99.2 },
  "Emotions": [
    { "Type": "HAPPY", "Confidence": 85.0 },
    { "Type": "CALM", "Confidence": 12.0 }
  ],
  "Eyeglasses": { "Value": false, "Confidence": 99.0 },
  "Sunglasses": { "Value": false, "Confidence": 99.0 },
  "EyesOpen": { "Value": true, "Confidence": 98.0 },
  "MouthOpen": { "Value": false, "Confidence": 97.0 },
  "Smile": { "Value": true, "Confidence": 85.0 },
  "Pose": { "Pitch": 2.1, "Roll": -1.5, "Yaw": 5.2 },
  "Quality": { "Brightness": 72.5, "Sharpness": 88.0 },
  "Landmarks": [
    { "Type": "eyeLeft", "X": 0.42, "Y": 0.35 },
    { "Type": "eyeRight", "X": 0.58, "Y": 0.34 },
    { "Type": "nose", "X": 0.50, "Y": 0.42 },
    { "Type": "mouthLeft", "X": 0.44, "Y": 0.52 },
    { "Type": "mouthRight", "X": 0.56, "Y": 0.51 }
  ]
}
```

**How we use it:**
- **Beauty Engine**: Uses face presence, quality, pose → confidence and quality checks.
- **AttributeMapper**: Uses labels + face context for hair/beauty mapping.
- **Quality**: Reject or flag photos with low sharpness, eyes closed, heavy occlusion.

---

### 3. **Mapping to Our Schema**

| Rekognition Source | Our ModelProfile Fields |
|--------------------|-------------------------|
| Labels: Blonde, Brown, Black, Red, Gray | `hairColorSimple`, `hairColorDetailed` |
| Labels: Wavy, Curly, Straight | `hairTextureSimple`, `hairTextureDetailed`, `curlPattern` |
| Labels: Hair + geometry | `hairLengthSimple`, `hairLengthDetailed` |
| Labels: Skin + DominantColors | `skinToneSimple`, `skinToneDetailed`, `skinUndertone` |
| FaceDetails: Quality, Pose | `attributeConfidence`, photo quality flags |
| FaceDetails: Landmarks | (Future: face shape, eye spacing, etc.) |

---

### 4. **Bedrock (Currently Used)**

After Rekognition, we call **Bedrock** (Claude Haiku) with:
- The image (base64)
- Rekognition labels as context
- A structured prompt for hair + beauty attributes

Bedrock returns a JSON with detailed attributes. If Bedrock succeeds, we use it; otherwise we fall back to Rekognition-only mapping.

---

## Rekognition APIs We're NOT Using Yet

| API | Purpose | Value for Modeled |
|-----|---------|-------------------|
| **DetectModerationLabels** | Detect inappropriate content | Block/reject unsafe photos before they go live |
| **RecognizeCelebrities** | Identify celebrities | "Look inspiration" or styling references |
| **DetectText** | OCR in image | Read text (e.g., signs, watermarks) if needed |
| **IndexFaces / SearchFacesByImage** | Face indexing & search | Deduplicate profiles, find similar faces |

---

## Recommended: Add DetectModerationLabels

**Flow:**
1. Run **DetectModerationLabels** first (before DetectLabels/DetectFaces).
2. If any moderation label exceeds a threshold (e.g., 80% confidence for "Explicit Nudity") → reject photo, return error, do not process.
3. If clean → continue with DetectLabels + DetectFaces as today.

**Benefits:**
- Protects the platform from inappropriate uploads.
- Rekognition moderation is built for this use case.
- Low cost (~$0.001–0.002 per image).

---

## Rekognition-Only Mode (No Bedrock)

To use Rekognition to its fullest **without** Bedrock:

1. **DetectLabels** – already used for hair/skin/objects.
2. **DetectFaces** – already used for quality and face context.
3. **DetectModerationLabels** – add for safety.
4. **Improve mappers** – use more of the raw Rekognition output:
   - **FaceDetails.Pose** → reject if Yaw > 30° or Pitch > 20° (face too turned).
   - **FaceDetails.Quality** → reject if Sharpness < 50 or Brightness < 40.
   - **FaceDetails.EyesOpen** → reject if eyes closed.
   - **FaceDetails.Landmarks** → derive face proportions (forehead vs cheek vs jaw) for face shape.
   - **ImageProperties.DominantColors** → refine skin tone from actual pixel colors.
   - **Labels hierarchy** – use parent/child labels (e.g., "Hair" → "Curly" → "Tight Curls") for better texture mapping.

---

## Implemented: Moderation & Quality Gates

### DetectModerationLabels (Step 1)
- **Runs first** before any other processing
- Blocks if confidence ≥ 80% for: Explicit Nudity, Suggestive, Nudity, Violence, Drug, Tobacco
- Returns 400 with clear message if rejected
- Configurable via `MODERATION_THRESHOLD` env var (default: 80)

### Quality Validation (Step 3)
Uses **FaceDetails** from DetectFaces:
- **No face** → Reject: "No face detected"
- **Sunglasses** → Reject: "Remove sunglasses"
- **Eyes closed** → Reject: "Eyes appear closed"
- **Yaw > 30°** → Reject: "Face turned too far"
- **Pitch > 25°** → Reject: "Photo angle too steep"
- **Sharpness < 50** → Reject: "Photo is blurry"
- **Brightness < 40** → Reject: "Photo too dark"

---

## Summary: Full Rekognition Pipeline (Implemented)

```
Photo Upload
    │
    ▼
┌─────────────────────────────────────┐
│ 1. DetectModerationLabels           │  ← IMPLEMENTED: Safety gate
│    → If inappropriate: REJECT        │
└─────────────────────────────────────┘
    │ (if clean)
    ▼
┌─────────────────────────────────────┐
│ 2. DetectLabels                     │  ← Current
│    GENERAL_LABELS + IMAGE_PROPERTIES │
│    → Hair, Skin, Face, objects       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. DetectFaces (Attributes: ALL)    │  ← Implemented
│    → Age, Gender, Emotions, Quality  │
│    → Pose, Landmarks, EyesOpen, etc. │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Quality checks                   │  ← IMPLEMENTED: Pose, Quality, EyesOpen
│    → Reject blurry, tilted, occluded │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 5. AttributeMapper + BeautyMapper   │  ← Implemented (Bedrock optional)
│    → Hair + Beauty schema            │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 6. Update ModelProfile              │  ← Implemented
└─────────────────────────────────────┘
```

---

## Cost (Rekognition Only)

| API | Cost per image | Free tier |
|-----|----------------|-----------|
| DetectLabels | ~$0.001 | 5,000 images/mo |
| DetectFaces | ~$0.001 | 5,000 images/mo |
| DetectModerationLabels | ~$0.001 | 5,000 images/mo |

**Total per photo**: ~$0.003 (all three APIs). At 1,000 uploads/month ≈ $3.
