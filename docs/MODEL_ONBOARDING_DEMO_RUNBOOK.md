# Model Onboarding — DEMO TODAY Runbook

**Date:** 2026-06-07  
**Read this first.** It separates what is **done in code** from what **only you can do in AWS**.

---

## What changed (code — done & verified to build)

1. **No more self-selects.** Removed every hair/skin/eye dropdown — both the "Confirm your look" step and the hidden "Quick features (self-selected)" selects in the Modeling-path step. Replaced with a read-only **"AI vision analysis"** step.
2. **Age 18+ verification.** DOB is required and **18+ is enforced** at step advance and at submit. Under-18 cannot continue.
3. **Gov ID required.** Submission now requires ID verification (verified/manual_review) unless dev-bypassed.
4. **Rekognition linkage fixed.** Photos are stored under the Cognito **identity id**, but profiles are keyed by Cognito **sub**. A profile **draft is created before photo upload**, `storageIdentityId` is stored, and the Lambda matches on **sub OR storageIdentityId**.
5. **Photo upload hardened.** Identity resolved at upload time with refresh fallback.

---

## What must happen in YOUR AWS for the demo to work

### A. Deploy the backend
```bash
npx ampx sandbox
# or: npx ampx pipeline-deploy --branch main --app-id <id>
```

### B. Email verification
- Cognito verifies email at sign-up using its default sender.
- For reliable sending, verify **SES** and set `AMPLIFY_SES_FROM_EMAIL`.

### C. SMS verification
- Cognito SMS needs **SNS** with origination number / spending limit.
- **Demo recommendation:** keep phone as "verify or skip" and demo email + gov ID + age.

### D. Rekognition + Bedrock
- Enable **Claude 3.5 Sonnet + Haiku** in Bedrock (us-east-1).
- Deploy photo-analysis Lambda fix.

### E. Cognito Admin group
- User Pool → Groups → **Admin** → add your user.

---

## Demo-day env flags (`.env.local`, restart `npm run dev`)

**Option 1 — Full real verification:**
```env
VITE_USE_MOCK_DATA=false
VITE_FULL_APP_ACCESS=true
VITE_BYPASS_ONBOARDING_VERIFICATION=false
VITE_SKIP_IDENTITY_VERIFICATION=false
```

**Option 2 — Safe fallback if SMS/Rekognition aren't ready:**
```env
VITE_USE_MOCK_DATA=false
VITE_FULL_APP_ACCESS=true
VITE_BYPASS_ONBOARDING_VERIFICATION=true
```
*Age 18+ is still enforced in Option 2.*

---

## The flow you'll demo (11 steps)

```
Basic Info (DOB → 18+ gate) → Modeling path → Service prefs → Availability
→ Photos (3+, upload to S3) → AI vision analysis (Rekognition, read-only)
→ Data Privacy & Terms → Review → Email verify → Phone verify (or skip)
→ Gov ID verify → Submit → /admin/onboarding → Approve → active
```

---

## Straight talk

- **Works after deploy + flags:** no self-selects, age 18+, guided flow, photo upload, gov-ID UI, admin capture.
- **Needs AWS config to be live:** email (SES), SMS (SNS), Rekognition auto-attributes + ID face-match.
- **Smoke-test after deploy:** onboard a model → check `ModelProfile` gets `autoTaggedAttributes` after photo analysis.
