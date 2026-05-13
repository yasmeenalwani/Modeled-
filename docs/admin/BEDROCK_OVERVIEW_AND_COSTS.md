# Modeled — Full AWS Cost Breakdown by Scale

**Complete cost overview for photo analysis, identity verification, and platform operations — aligned to scale.**

---

## Full Cost Breakdown by Scale

**Assumptions:**
- **Models:** Each model uploads ~6 photos during onboarding (front, side, hair shots). ~10% re-upload rate.
- **Professionals:** Each pro completes identity verification (ID + selfie) once.
- **Identity verification:** Rekognition CompareFaces (1 call per model/pro) = Group 1 pricing.
- **Photo analysis per photo:** Rekognition (4 units: Moderation + DetectLabels×2 + DetectFaces) + Bedrock Haiku.
- **Pricing:** US East (N. Virginia), on-demand, first-tier rates where applicable.

### Per-Unit Cost (Single Photo / Single User)

| Service | Usage | Cost per Unit |
|---------|-------|---------------|
| **Rekognition (photo)** | 4 image units (Moderation + Labels + Labels/Props + Faces) | $0.004/photo |
| **Bedrock** | Claude 3 Haiku, ~2K in / 600 out tokens | $0.00125/photo |
| **Rekognition (identity)** | CompareFaces, 1 per model/pro | $0.001/user |
| **Lambda** | photo-analysis, ~8s @ 1GB | ~$0.0002/photo |
| **S3** | PUT/GET, storage | negligible |
| **DynamoDB** | Training data + ModelProfile update | negligible |

**Total per photo:** ~**$0.0055**  
**Total per model (6 photos + identity):** ~**$0.034**  
**Total per professional (identity only):** ~**$0.001**

---

### Scaled Monthly Cost Matrix

| Scale | Models | Pros | Photos/Mo | Identity Checks | Rekognition | Bedrock | Lambda | **Total/Mo** |
|-------|--------|-----|-----------|----------------|-------------|---------|--------|--------------|
| **MVP** | 25 | 50 | 165 | 75 | $0.74 | $0.21 | $0.03 | **~$0.98** |
| **Launch** | 100 | 200 | 660 | 300 | $2.94 | $0.83 | $0.13 | **~$3.90** |
| **Growth** | 500 | 500 | 3,300 | 1,000 | $14.20 | $4.13 | $0.66 | **~$19.00** |
| **Scale** | 2,000 | 1,000 | 13,200 | 3,000 | $55.80 | $16.50 | $2.64 | **~$75.00** |
| **Enterprise** | 10,000 | 5,000 | 66,000 | 15,000 | $279 | $82.50 | $13.20 | **~$375** |

*Photos = models × 6 × 1.1 (10% re-upload). Identity = models + pros. Rekognition = photo analysis (4 units/photo) + identity (1 unit/user). Volume discounts (Rekognition $0.0008, $0.0006 at higher tiers) will reduce cost as you scale.*

---

### Cost per Model (Onboarding)

| Component | Cost |
|-----------|------|
| 6 photos × ($0.004 Rek + $0.00125 Bedrock + $0.0002 Lambda) | ~$0.032 |
| 1 identity verification | ~$0.001 |
| **Total per model** | **~$0.033** |

### Cost per Professional (Onboarding)

| Component | Cost |
|-----------|------|
| 1 identity verification | ~$0.001 |
| **Total per professional** | **~$0.001** |

---

### Not Included (Add Separately)

| Service | Notes |
|---------|-------|
| **Full platform** | See `docs/admin/PLATFORM_OPERATIONAL_COSTS.md` for Cognito, AppSync, DynamoDB, S3, Lambda, Amplify, SES, and scaled cost matrix |

---

# Bedrock in Modeled — Overview & Cost Breakdown

**Full overview of how AWS Bedrock is used in Modeled and estimated costs.**

---

## 1. Where Bedrock Is Used

| Location | Purpose | Trigger |
|----------|---------|---------|
| **`photo-analysis` Lambda** | Hair + beauty attribute analysis from model photos | S3 event when a model uploads a photo to `profile-photos/models/{userId}/` |

**Bedrock is used in only one place:** the **photo-analysis** Lambda, for enhanced AI analysis on top of Rekognition.

---

## 2. Flow (Step-by-Step)

When a model uploads a photo during onboarding:

1. **S3 event** → triggers `photo-analysis` Lambda
2. **Moderation** → Rekognition `DetectModerationLabels` (blocks inappropriate content)
3. **Rekognition** → `DetectLabels` + `DetectFaces` (objects, face attributes)
4. **Quality gate** → Reject blurry, tilted, occluded faces
5. **Bedrock** → Claude Haiku vision: structured hair + beauty attributes from image
6. **Attribute mappers** → Map Bedrock result (or Rekognition fallback) to schema
7. **DB update** → ModelProfile gets `autoTaggedAttributes`, `hairLengthSimple`, etc.
8. **Training data** → Optional recording for ML

**If Bedrock fails** → Lambda falls back to Rekognition labels; analysis still completes but with lower fidelity.

---

## 3. Model & Configuration

| Setting | Value |
|---------|--------|
| **Model ID** | `anthropic.claude-3-haiku-20240307-v1:0` (default) |
| **Configurable via** | `BEDROCK_MODEL_ID` env var |
| **API** | `InvokeModelCommand` (Bedrock Runtime) |
| **Format** | Multimodal: image (base64) + text prompt |
| **Max output tokens** | 1,500 |

Haiku was chosen for **cost optimization** vs Sonnet/Opus.

---

## 4. What Bedrock Receives & Returns

### Input

- **Image:** Base64-encoded JPEG from S3 (model headshot / hair photo)
- **Text prompt:** Structured instructions asking for JSON with:
  - Hair: length, color, texture, curl pattern (1A–4C), density, porosity, condition, hairstyle
  - Skin: tone, undertone, type, concerns, Fitzpatrick
  - Face: shape, length, cheekbones, jawline, chin
  - Eyes: color, shape, size, spacing, eyelids
  - Eyebrows: shape, thickness
  - Lips: shape, size
  - Nose: shape, bridge, width

### Output

- **JSON blob** with those attributes + `confidence` and `reasoning`
- Parsed by `AttributeMapper` and `BeautyAttributeMapper`, then stored in `ModelProfile` and training data

---

## 5. Pricing (Claude 3 Haiku on Bedrock)

**On-demand pricing (US East / us-east-1):**

| Token Type | Price per 1M tokens |
|------------|----------------------|
| Input | $0.25 |
| Output | $1.25 |

*Source: [AWS Bedrock Pricing](https://aws.amazon.com/bedrock/pricing/), Anthropic Claude 3 Haiku. Exact rates can vary by region.*

### Token Estimates per Photo

| Component | Est. Tokens |
|-----------|-------------|
| Text prompt (buildHairEnginePrompt) | ~800–1,000 |
| Image (typical headshot JPEG) | ~800–1,200 |
| **Total input** | **~1,800–2,200** |
| Output (JSON response) | ~500–800 |

### Cost per Photo Analysis

| Scenario | Input Cost | Output Cost | Total per Photo |
|----------|------------|-------------|------------------|
| Low (1.8K in, 500 out) | $0.00045 | $0.00063 | **~$0.001** |
| Typical (2K in, 600 out) | $0.00050 | $0.00075 | **~$0.00125** |
| High (2.2K in, 800 out) | $0.00055 | $0.00100 | **~$0.00155** |

**Rule of thumb:** ~**$0.001–$0.002 per photo** (~$0.00125 on average).

---

## 6. Cost Projections

| Scenario | Photos/Month | Bedrock Cost/Month |
|----------|--------------|--------------------|
| 10 models × 5 photos each | 50 | ~$0.06 |
| 100 models × 5 photos | 500 | ~$0.63 |
| 500 models × 6 photos | 3,000 | ~$3.75 |
| 1,000 models × 6 photos | 6,000 | ~$7.50 |
| 5,000 models × 6 photos | 30,000 | ~$37.50 |

**Re-uploads:** Each new/retried upload triggers another run, so actual usage can be higher if models re-upload often.

---

## 7. Cost Optimization Options

| Option | Benefit |
|--------|---------|
| **Batch inference** | Up to ~50% discount for async workloads |
| **Provisioned throughput** | Predictable spend for high volume; talk to AWS |
| **Rekognition-only fallback** | Set `BEDROCK_MODEL_ID` empty or fail fast to skip Bedrock; saves cost but loses hair/beauty detail |
| **Model upgrade** | Newer Haiku versions may have different pricing; check current Bedrock pricing for your region |

---

## 8. Other AWS Costs (Not Bedrock)

For context, the same flow uses:

| Service | Usage | Est. Cost |
|---------|-------|-----------|
| **Rekognition** | DetectLabels, DetectFaces, DetectModerationLabels per photo | ~$0.001–$0.002/photo |
| **Lambda** | photo-analysis invocations | Free tier then ~$0.0000002/invocation |
| **S3** | Storage, requests | Minimal for MVP |
| **DynamoDB** | Training data table | Pay per request |

Rekognition and Bedrock are the main variable cost drivers per photo.

---

## 9. Summary

| Item | Details |
|------|---------|
| **Use case** | Photo analysis (hair + beauty attributes) for models |
| **Model** | Claude 3 Haiku (`anthropic.claude-3-haiku-20240307-v1:0`) |
| **Trigger** | S3 upload to model profile-photos |
| **Cost per photo** | ~$0.001–$0.002 |
| **Fallback** | Rekognition labels if Bedrock fails |
| **Alternatives** | Rekognition-only, or Batch inference for bulk processing |
