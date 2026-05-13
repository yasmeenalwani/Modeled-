# Fix Backend Yaw Check for side_profile Step

**Status: Implemented**

## Problem

The photo-analysis Lambda applies a quality gate to **all** uploaded photos. One check rejects when **yaw > 30** with:

> "Face is turned too far. Please use a front-facing photo."

For **side_profile** photos, a turned face (yaw ~60–90°) is **required**. Valid side profile shots are incorrectly rejected.

---

## Current Flow

1. **S3 key format:** `models/{userId}/profile-photos/{stepId}-{timestamp}.{ext}`
   - Examples: `front_face-123456.jpg`, `side_profile-123456.jpg`, `hair_front-123456.jpg`
2. **`determinePhotoType(key)`** maps key → `'profile' | 'hair' | 'headshot'` (does not expose stepId)
3. **`validatePhotoQuality(rekognitionResults)`** always applies:
   - yaw > 30 → reject
   - pitch > 25 → reject
   - sharpness < 50 → reject
   - brightness < 40 → reject
   - sunglasses, eyes closed → reject

---

## Approach

Make the quality gate **step-aware** by deriving the step from the S3 key and relaxing rules for `side_profile`.

### 1. Extract stepId from S3 key

Add `extractStepIdFromKey(key: string): string | null`:

- Parse filename (e.g. `side_profile-123456.jpg`)
- Split on `-` and take the first segment that matches a known step
- PHOTO_STEPS ids: `front_face`, `side_profile`, `hair_front`, `hair_back`, `hair_closeup`, `hair_natural`
- Return `null` if not found (fallback to strict checks)

### 2. Update `validatePhotoQuality` signature

```ts
function validatePhotoQuality(
  rekognitionResults: { faces: any[] },
  options?: { stepId?: string | null }
): { passed: boolean; reason?: string }
```

### 3. Relax yaw for side_profile

| Step           | Yaw rule                          |
|----------------|-----------------------------------|
| side_profile   | Skip yaw check (or allow up to 90)|
| All others     | yaw > 30 → reject                 |

### 4. Optionally relax pitch for side_profile

For a true 90° profile, pitch can be slightly elevated. Consider:
- side_profile: pitch > 35 (slightly relaxed)
- Others: pitch > 25 (current)

---

## Implementation Plan

### File: [amplify/functions/photo-analysis/handler.ts](amplify/functions/photo-analysis/handler.ts)

1. **Add `extractStepIdFromKey`** (near `determinePhotoType`):

```ts
const KNOWN_STEP_IDS = ['front_face', 'side_profile', 'hair_front', 'hair_back', 'hair_closeup', 'hair_natural'];

function extractStepIdFromKey(key: string): string | null {
  const filename = key.split('/').pop() || '';
  const base = filename.split('.')[0] || '';
  const parts = base.split('-');
  for (const part of parts) {
    if (KNOWN_STEP_IDS.includes(part)) return part;
  }
  return null;
}
```

2. **Update `validatePhotoQuality`**:
   - Add second param: `options?: { stepId?: string | null }`
   - Before `if (yaw > 30)`: `if (options?.stepId !== 'side_profile' && yaw > 30)`
   - Optionally relax pitch for side_profile: `const maxPitch = options?.stepId === 'side_profile' ? 35 : 25;`

3. **Update call site** in `analyzePhoto`:
   - `const stepId = extractStepIdFromKey(key);`
   - `const qualityResult = validatePhotoQuality(rekognitionResults, { stepId });`

---

## Hair Steps (hair_front, hair_back, hair_closeup, hair_natural)

These steps may have limited or no face visibility (e.g. hair_closeup = hair texture). Current logic:

- `faces.length === 0` → reject "No face detected"

For hair_closeup and hair_back, a face may not be visible. Options:
- **A)** Skip face quality gate for hair steps (only run moderation + basic checks)
- **B)** Require at least one face for hair_front, hair_natural; relax for hair_back, hair_closeup

**Recommendation for this fix:** Keep current "no face → reject" for now. Hair steps often show partial face. If you see false rejections, we can add step-specific handling in a follow-up.

---

## Testing

1. Upload `front_face` with face turned 45° → should reject
2. Upload `side_profile` with face turned ~90° → should pass (no yaw reject)
3. Upload `side_profile` with front face → should still pass (face detected; yaw check skipped)
4. Upload `hair_front` → unchanged behavior

---

## Files to Touch

| File | Change |
|------|--------|
| `amplify/functions/photo-analysis/handler.ts` | Add `extractStepIdFromKey`, update `validatePhotoQuality`, update call site |
