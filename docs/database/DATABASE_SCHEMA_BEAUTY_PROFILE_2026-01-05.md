# Beauty Profile Attributes - Database Schema

## Skin Analysis

### skinToneSimple (User-Facing)
- **Type:** enum
- **Options:** `fair`, `light`, `medium`, `olive`, `tan`, `brown`, `dark`
- **Description:** User-facing skin tone classification
- **Visibility:** User-facing

### skinUndertone
- **Type:** enum
- **Options:** `warm`, `cool`, `neutral`
- **Description:** Skin undertone (important for makeup matching)
- **Visibility:** User-facing

### skinType
- **Type:** enum
- **Options:** `dry`, `normal`, `oily`, `combination`
- **Description:** Skin type classification
- **Visibility:** User-facing

### skinToneDetailed (Admin-Only)
- **Type:** JSON
- **Structure:**
  ```json
  {
    "fitzpatrick": 1-6,
    "hex": "#xxx",
    "description": "..."
  }
  ```
- **Description:** Detailed skin tone analysis using Fitzpatrick scale
- **Visibility:** Admin-only

### skinConcerns
- **Type:** string array
- **Options:** `acne`, `redness`, `hyperpigmentation`, `fine_lines`, etc.
- **Description:** Skin concerns and issues
- **Visibility:** Admin-only

### skinTexture
- **Type:** enum
- **Options:** `smooth`, `normal`, `textured`, `rough`
- **Description:** Skin texture assessment
- **Visibility:** Admin-only

---

## Face Analysis

### faceShapeSimple (User-Facing)
- **Type:** enum
- **Options:** `oval`, `round`, `square`, `heart`, `oblong`, `diamond`
- **Description:** User-facing face shape
- **Visibility:** User-facing

### faceShapeDetailed (Admin-Only)
- **Type:** JSON
- **Structure:**
  ```json
  {
    "primary": "oval",
    "secondary": "heart",
    "proportions": {...}
  }
  ```
- **Description:** Detailed face shape analysis
- **Visibility:** Admin-only

### faceLength
- **Type:** enum
- **Options:** `short`, `average`, `long`
- **Description:** Face length measurement
- **Visibility:** Admin-only

### foreheadSize
- **Type:** enum
- **Options:** `small`, `average`, `large`
- **Description:** Forehead size relative to face
- **Visibility:** Admin-only

### cheekboneProminence
- **Type:** enum
- **Options:** `flat`, `average`, `prominent`
- **Description:** Cheekbone prominence
- **Visibility:** Admin-only

### jawlineType
- **Type:** enum
- **Options:** `soft`, `average`, `defined`, `angular`
- **Description:** Jawline definition
- **Visibility:** Admin-only

### chinShape
- **Type:** enum
- **Options:** `pointed`, `rounded`, `square`, `recessed`
- **Description:** Chin shape classification
- **Visibility:** Admin-only

---

## Eye Analysis

### eyeColorSimple (User-Facing)
- **Type:** enum
- **Options:** `brown`, `blue`, `green`, `hazel`, `gray`, `amber`
- **Description:** User-facing eye color
- **Visibility:** User-facing

### eyeShapeSimple (User-Facing)
- **Type:** enum
- **Options:** `almond`, `round`, `hooded`, `monolid`, `downturned`, `upturned`
- **Description:** User-facing eye shape
- **Visibility:** User-facing

### eyeColorDetailed (Admin-Only)
- **Type:** JSON
- **Structure:**
  ```json
  {
    "primary": "brown",
    "secondary": "amber",
    "pattern": "solid",
    "intensity": "dark"
  }
  ```
- **Description:** Detailed eye color analysis
- **Visibility:** Admin-only

### eyeSize
- **Type:** enum
- **Options:** `small`, `medium`, `large`
- **Description:** Eye size relative to face
- **Visibility:** Admin-only

### eyeSpacing
- **Type:** enum
- **Options:** `close_set`, `average`, `wide_set`
- **Description:** Distance between eyes
- **Visibility:** Admin-only

### eyeDepth
- **Type:** enum
- **Options:** `deep_set`, `average`, `prominent`
- **Description:** Eye depth/set
- **Visibility:** Admin-only

### eyeLidType
- **Type:** enum
- **Options:** `visible_crease`, `hooded`, `monolid`
- **Description:** Eyelid type (important for makeup)
- **Visibility:** Admin-only

---

## Eyebrow Analysis

### eyebrowShapeSimple (User-Facing)
- **Type:** enum
- **Options:** `arched`, `straight`, `curved`, `s_shaped`, `rounded`
- **Description:** User-facing eyebrow shape
- **Visibility:** User-facing

### eyebrowThickness (User-Facing)
- **Type:** enum
- **Options:** `thin`, `medium`, `thick`, `bushy`
- **Description:** Eyebrow thickness
- **Visibility:** User-facing

### eyebrowColorMatch (Admin-Only)
- **Type:** boolean
- **Description:** Does eyebrow color match hair color?
- **Visibility:** Admin-only

### eyebrowGap (Admin-Only)
- **Type:** enum
- **Options:** `narrow`, `average`, `wide`
- **Description:** Distance between eyebrows
- **Visibility:** Admin-only

### eyebrowTailLength (Admin-Only)
- **Type:** enum
- **Options:** `short`, `medium`, `long`
- **Description:** Length of eyebrow tail
- **Visibility:** Admin-only

### eyebrowArch (Admin-Only)
- **Type:** JSON
- **Structure:**
  ```json
  {
    "position": "high/medium/low",
    "angle": number
  }
  ```
- **Description:** Eyebrow arch details
- **Visibility:** Admin-only

---

## Lip Analysis

### lipShapeSimple (User-Facing)
- **Type:** enum
- **Options:** `full`, `thin`, `heart`, `wide`, `round`, `bow_shaped`
- **Description:** User-facing lip shape
- **Visibility:** User-facing

### lipSize (User-Facing)
- **Type:** enum
- **Options:** `thin`, `medium`, `full`, `very_full`
- **Description:** Lip size classification
- **Visibility:** User-facing

### lipProportions (Admin-Only)
- **Type:** JSON
- **Structure:**
  ```json
  {
    "upperToLower": ratio,
    "width": "narrow/average/wide"
  }
  ```
- **Description:** Detailed lip proportions
- **Visibility:** Admin-only

### lipColor
- **Type:** string
- **Description:** Natural lip color
- **Visibility:** Admin-only

### cupidsBow
- **Type:** enum
- **Options:** `defined`, `soft`, `flat`
- **Description:** Cupid's bow definition
- **Visibility:** Admin-only

---

## Nose Analysis (Admin-Only)

Used for contouring and makeup services only.

### noseShape
- **Type:** enum
- **Options:** `straight`, `roman`, `button`, `snub`, `wide`, `narrow`
- **Description:** Nose shape classification
- **Visibility:** Admin-only

### noseBridge
- **Type:** enum
- **Options:** `low`, `medium`, `high`
- **Description:** Nose bridge height
- **Visibility:** Admin-only

### noseWidth
- **Type:** enum
- **Options:** `narrow`, `average`, `wide`
- **Description:** Nose width
- **Visibility:** Admin-only

---

## Notes

- **Simple attributes** are user-facing and shown in profiles
- **Detailed attributes** are admin-only and used for advanced matching
- Beauty profile attributes are primarily used for makeup service matching
- All attributes can be auto-tagged by the Beauty Engine from photo analysis

