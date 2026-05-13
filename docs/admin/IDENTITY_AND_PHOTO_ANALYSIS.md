# Identity Verification & Photo Analysis — Design & Accuracy

Answers to: ID upload necessity, AWS vs third-party, selfie-only option, and photo analysis accuracy/bias for diverse hair.

---

## 1. Identity Verification: ID + Selfie vs Selfie-Only

### Do we need to upload ID?

**Yes.** For true identity verification (proving the person is who they claim), you need both:

1. **ID document** — Establishes identity (government-issued)
2. **Selfie** — Proves the live person matches the ID photo

**Rekognition CompareFaces** requires two images:
- **Source:** Selfie (live person)
- **Target:** ID photo

It returns a similarity score (0–100%). Without the ID, you cannot verify identity—you can only detect that a face is present.

### Selfie-only through Rekognition?

**Not sufficient for identity verification.** Rekognition can:
- Detect faces
- Run liveness (Face Liveness)

Liveness proves “a real person is in front of the camera,” not “this person is Jane Doe.” For KYC-style verification you need ID + selfie comparison.

### What we use today

- **AWS Rekognition CompareFaces** (no third-party vendor)
- ID and selfie stored in S3 `identity-verification/`
- Lambda `identity-verification` compares them
- Thresholds: ≥80% = verified, 70–79% = manual_review, &lt;70% = failed

---

## 2. Third-Party vs AWS

**Everything is AWS native:**

| Component | Service | Purpose |
|-----------|---------|---------|
| Identity verification | Rekognition CompareFaces | Compare selfie to ID |
| Photo analysis | Rekognition DetectLabels, DetectFaces | Objects, concepts, face attributes |
| Enhanced analysis | Bedrock (Claude) | Structured hair/beauty attributes |
| Storage | S3 | ID, selfie, photos |
| Compute | Lambda | Orchestration |

No Stripe Identity, Persona, Onfido, etc. All processing stays within AWS.

---

## 3. Photo Analysis: Accuracy & Bias

### Pipeline

1. **Rekognition** — DetectLabels (labels), DetectFaces (face details)
2. **Bedrock** — Claude vision prompt for structured hair/beauty attributes
3. **Attribute mappers** — Map to our schema (Andre Walker, color depth, etc.)

### Rekognition limitations

- **Labels:** Generic terms (Person, Hair, etc.). No documented hair-specific labels.
- **Bias:** Rekognition has documented bias—e.g. gender prediction based on appearance (including hair).
- **Hair nuance:** Standard DetectLabels is not tuned for braids, locs, coily vs curly, colored hair, etc.

### Bedrock (Claude) prompt coverage

Our Bedrock prompt explicitly asks for:

- **Hair texture:** straight, wavy, curly, coily
- **Curl pattern:** Andre Walker 1A–4C
- **Hairstyle:** natural, braids, cornrows, locs, twists, afro, bantu_knots, silk_press, etc.
- **Hair color:** black, brown, blonde, red, gray, **colored** (purple, pink, blue, green)
- **Color depth:** 1–10 (1 = jet black, 10 = platinum)

### What we support in code

**Attribute mapper** (`attributeMapper.ts`):

| Category | Supported | Notes |
|----------|------------|-------|
| **Black hair** | Yes | `COLOR_DEPTH_MAP` 1–2, `hairColor: 'black'` |
| **Braids** | Yes | `HAIRSTYLE_MAP`: braids, cornrows |
| **Curly vs coily** | Yes | 3A–3C curly, 4A–4C coily (Andre Walker) |
| **Blue/purple/colored** | Yes | `classifyHairColor` → `simple: 'colored'` for purple, pink, blue, green |
| **Multi-colored** | Partial | Single dominant color from analysis; no explicit “ombré” / multi-tone yet |
| **Locs, afro, twists** | Yes | HAIRSTYLE_MAP |

### Accuracy vs bias

- **Rekognition fallback:** Depends on labels (e.g. “black hair”, “curly”). Label set may underrepresent diverse hair.
- **Bedrock path:** Much better for nuance, but still model-dependent. No formal accuracy study for our use case.
- **User validation:** User can confirm/correct during onboarding → stored in `userValidatedAttributes`. This is the main safeguard.

### Recommendations

1. **Use Bedrock where possible** — More robust for diverse hair than Rekognition labels.
2. **Always allow user correction** — Treat AI output as a suggestion; user confirmation is authoritative.
3. **Low-confidence handling** — Flag low-confidence attributes and require user confirmation.
4. **Monitoring** — Log corrections to spot systematic bias or misclassifications.

---

## 4. Summary Table

| Question | Answer |
|----------|--------|
| Upload ID? | Yes. Required for identity verification. |
| Third-party? | No. AWS Rekognition + Bedrock only. |
| Selfie-only? | No. CompareFaces needs ID + selfie. |
| Black hair? | Supported (color depth 1–2, styles like afro, braids, locs). |
| Braids? | Supported. |
| Curly vs coily? | Supported (3A–4C). |
| Blue/purple/colored? | Supported → `colored`. |
| Multi-colored? | Partial; single dominant color only for now. |
| Accuracy/bias? | Rekognition has known limitations; Bedrock + user validation improve reliability. |

---

## 5. Admin Verification Tab

The admin modals now include a **Verification** tab showing:

- **Identity:** Status (verified / manual_review / failed), score, ID type
- **Documents:** Links to view ID and selfie (if available)
- **Photo analysis (Models):** Status (completed / pending / failed)
- **License (Professionals):** Number and note to verify manually with the board

See `ModelDetailModal.jsx` and `ProfessionalDetailModal.jsx`.
