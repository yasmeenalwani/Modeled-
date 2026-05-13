# Hair Profile Types - Database Schema

## Simple Attributes (User-Facing)

These attributes are shown to users and used for basic matching.

### hairLengthSimple
- **Type:** enum
- **Options:** `short`, `medium`, `long`, `extra_long`
- **Description:** User-facing hair length classification
- **Visibility:** User-facing
- **Used For:** Basic matching, display in model profiles

### hairColorSimple
- **Type:** enum
- **Options:** `black`, `brown`, `blonde`, `red`, `gray`, `colored`
- **Description:** User-facing hair color classification
- **Visibility:** User-facing
- **Used For:** Basic matching, display in model profiles

### hairTextureSimple
- **Type:** enum
- **Options:** `straight`, `wavy`, `curly`, `coily`
- **Description:** User-facing hair texture classification
- **Visibility:** User-facing
- **Used For:** Basic matching, display in model profiles

---

## Detailed Attributes (Admin-Only)

These attributes are used for advanced matching and are not visible to users.

### hairLengthDetailed
- **Type:** string
- **Options:** `buzzed`, `chin-length`, `shoulder`, `mid-back`, `waist+`
- **Description:** Detailed hair length measurement
- **Visibility:** Admin-only
- **Used For:** Advanced matching algorithms

### hairColorDetailed
- **Type:** JSON
- **Structure:** 
  ```json
  {
    "natural": "dark_brown",
    "depth": 4,
    "undertone": "warm",
    "artificial": "none"
  }
  ```
- **Description:** Detailed color analysis with depth (1-10 scale) and undertone
- **Visibility:** Admin-only
- **Used For:** Precise color matching for color services

### hairTextureDetailed
- **Type:** string
- **Options:** `1A`, `1B`, `1C`, `2A`, `2B`, `2C`, `3A`, `3B`, `3C`, `4A`, `4B`, `4C`
- **Description:** Andre Walker curl pattern classification system
- **Visibility:** Admin-only
- **Used For:** Detailed texture matching for styling services

### hairDensity
- **Type:** enum
- **Options:** `thin`, `medium`, `thick`
- **Description:** Hair density/thickness
- **Visibility:** Admin-only
- **Used For:** Matching for volume-based services

### hairPorosity
- **Type:** enum
- **Options:** `low`, `medium`, `high`
- **Description:** Hair porosity level (important for color treatments)
- **Visibility:** Admin-only
- **Used For:** Critical for color service matching

### hairHealth
- **Type:** JSON
- **Structure:**
  ```json
  {
    "frizz": "low",
    "damage": "none",
    "splitEnds": false,
    "shine": "natural"
  }
  ```
- **Description:** Hair health metrics
- **Visibility:** Admin-only
- **Used For:** Service suitability assessment

### hairStyle
- **Type:** string
- **Options:** 
  - `natural`
  - `blowout`
  - `silk_press`
  - `braids`
  - `cornrows`
  - `locs`
  - `twists`
  - `afro`
  - `bantu_knots`
  - `ponytail`
  - `updo`
  - `bob`
  - `wig`
  - `weave`
  - `twa` (Teeny Weeny Afro)
  - `fade`
- **Description:** Current hair style
- **Visibility:** Admin-only
- **Used For:** Style-specific service matching

---

## Legacy Attributes (Backwards Compatibility)

These fields are maintained for backwards compatibility and map to the simple fields.

### hairLength (Legacy)
- **Type:** enum
- **Options:** `short`, `medium`, `long`, `extra_long`
- **Description:** Legacy field - maps to `hairLengthSimple`
- **Visibility:** User-facing
- **Note:** Use `hairLengthSimple` for new code

### hairColor (Legacy)
- **Type:** string
- **Options:** Free text
- **Description:** Legacy field - free text color description
- **Visibility:** User-facing
- **Note:** Use `hairColorSimple` for new code

### hairTexture (Legacy)
- **Type:** enum
- **Options:** `straight`, `wavy`, `curly`, `coily`
- **Description:** Legacy field - maps to `hairTextureSimple`
- **Visibility:** User-facing
- **Note:** Use `hairTextureSimple` for new code

### hairCondition
- **Type:** enum
- **Options:** `healthy`, `damaged`, `color_treated`, `virgin`
- **Description:** Overall hair condition
- **Visibility:** User-facing
- **Used For:** Service suitability (especially for color services)

---

## Notes

- **Simple attributes** are auto-populated by the Hair Engine from photo analysis
- **Detailed attributes** are used by the matching engine for precise matching
- **Legacy fields** are maintained for backwards compatibility but new code should use the `Simple` variants
- All attributes can be user-validated and corrected after auto-tagging

