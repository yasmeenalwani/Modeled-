# Schema and Infrastructure Guide

**Last updated:** For April 1 MVP launch

---

## Overview

This guide covers the backend schema, storage, and deployment configuration for Modeled.

---

## 1. Deploy the Backend (Get Real Schema)

**Current blocker:** `amplify_outputs.json` may have only the `Todo` demo schema. You need the real schema (ModelProfile, Professional, Partner, etc.) for onboarding and portals to work with real data.

### Deploy command
```bash
npx ampx sandbox
```

Or for production:
```bash
npx ampx pipeline-deploy --branch main
```

### What this does
- Deploys Auth (Cognito), Data (AppSync + DynamoDB), Storage (S3), and all Lambdas
- Generates `amplify_outputs.json` with the real schema and API config
- `shouldUseMockData()` returns `false` when ModelProfile exists → app uses real DynamoDB

---

## 2. Photo Storage Path (Aligned)

**Path format:** `profile-photos/models/{userId}/{filename}`

- **Frontend** ([photoSubmission.js](../src/utils/photoSubmission.js)): Uploads to `profile-photos/models/${userId}/${stepId}-${timestamp}.${ext}`
- **Storage access** ([storage/resource.ts](../amplify/storage/resource.ts)): `profile-photos/models/{entity_id}/*` — must match for upload to succeed
- **Photo-analysis Lambda**: Triggered on upload; parses path to extract `userId` for ModelProfile update
- **Permissions**: photoAnalysisFunction has read + delete (for moderation rejection compliance)

---

## 3. S3 Trigger → Photo Analysis

- **Trigger:** `storage.triggers.onUpload` → photoAnalysisFunction
- **Flow:** Model uploads photo → S3 PutObject → Lambda invoked → Rekognition + Bedrock → ModelProfile updated with autoTaggedAttributes, photoAnalysisStatus: 'completed'
- **Moderation:** Inappropriate content rejected → S3 object deleted immediately

---

## 4. Identity Verification API

- **Endpoint:** `POST /verify-identity` (REST API)
- **Config:** In `backend.addOutput` → `custom.API.identityVerificationApi` flows to `amplify_outputs.json`
- **MVP bypass:** Set `VITE_SKIP_IDENTITY_VERIFICATION=true` in `.env` to skip during testing

---

## 5. Lambda Wiring (backend.ts)

| Lambda | Purpose |
|--------|---------|
| photoAnalysisFunction | S3 trigger on photo upload; Rekognition + Bedrock |
| identityVerificationFunction | REST API /verify-identity |
| notificationsFunction | SES/SNS + Pinpoint; invoked by booking/model payment reminders |
| bookingRemindersFunction | EventBridge; sends reminders |
| modelPaymentRemindersFunction | EventBridge; payment reminders |
| matchExpirationFunction | EventBridge; expires old matches |
| chatActivationFunction | Activates chats before appointments |

---

## 6. Data Schema Authorization

- **Default:** Cognito user pool
- **Resource grants:** notificationsFunction, stripePaymentFunction, bookingRemindersFunction, matchExpirationFunction, modelPaymentRemindersFunction, chatActivationFunction, photoAnalysisFunction — can mutate data per schema rules

---

## 7. Pre-Deploy Checklist

- [ ] Node 20.x
- [ ] AWS CLI configured with credentials
- [ ] Amplify CLI: `npm install -g @aws-amplify/backend-cli`
- [ ] Run `npx ampx sandbox` from project root
- [ ] After deploy: copy `amplify_outputs.json` if using separate frontend build
