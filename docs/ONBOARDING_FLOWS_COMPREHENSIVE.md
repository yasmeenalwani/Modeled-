# Onboarding Flows – Comprehensive Overview

**Last updated:** Based on current codebase review  
**Purpose:** Full reference for all three onboarding flows, data, AWS tools, verification, admin review, and gaps.

---

## 1. Flow Comparison

| Aspect | **Model** | **Professional** | **Partner** |
|--------|-----------|------------------|-------------|
| **Route** | `/onboard/model` | `/onboard/professional` | `/onboard/partner` |
| **Auth** | Required (Authenticator) | Required (Authenticator) | Required (Authenticator) |
| **Type** | Multi-step (9 steps) | Multi-step (12 steps) | Single-page inquiry form |
| **Identity verification** | Yes (ID + selfie) | Yes (ID + selfie) | No |
| **Redirect after submit** | `/model-portal` | `/portal` | `/` (home) |

---

## 2. Model Onboarding – Step-by-Step

| # | Step | Purpose |
|---|------|---------|
| 0 | Welcome | Intro, value prop |
| 1 | Basic Info | firstName, lastName, email, phone, locationZip, **howDidYouHear** |
| 2 | Email Verification | 6-digit code – **mock/skip** |
| 3 | Phone Verification | 6-digit code – **mock/skip** |
| 4 | Photos | Guided photo capture (profile photos) |
| 5 | Get to Know You | somethingFun, whatYouCareAbout, serviceYouLove, serviceYouWantToTry, communityInterests |
| 6 | Identity Verification | Gov ID + selfie upload → Rekognition CompareFaces |
| 7 | Data Privacy & Terms | Info + terms checkbox |
| 8 | Review | Summary, submit |

**Travel removed:** All models have `willingToTravel: true`, `travelRadius: null`. Distance should be computed from ZIP + salon lat/long.

**Hair & Safety removed:** allergies, virginHair default to `false`. Set in portal later.

---

## 3. Professional Onboarding – Step-by-Step

| # | Step | Purpose |
|---|------|---------|
| 0 | Welcome | Intro |
| 1 | Basic Info | firstName, lastName, email, phone, instagramHandle, **howDidYouHear** |
| 2 | Email Verification | Mock/skip |
| 3 | Phone Verification | Mock/skip |
| 4 | **Education** | educationSchool, educationYearsCompleted, educationWorkshopsCourses, inSalonTraining, certifications |
| 5 | **Workplace** | salonName, salonLocationSuffix, salonStreet, salonCity, salonState, salonZip |
| 6 | **Experience** | experienceLevel, yearsWorking, yearsInSalon, licenseNumber |
| 7 | Get to Know You | somethingFun, whatYouCareAbout, signatureService, serviceWantToTry, workValues |
| 8 | **Verification** | Self photos, 6+ portfolio photos with service labels, IdentityVerification |
| 9 | Data Privacy | Info only |
| 10 | Terms & Conditions | Checkbox |
| 11 | Review | Summary, submit |

---

## 4. Partner Onboarding – Single Form

Single-page inquiry. No identity verification, no multi-step.

**Fields:**
- businessName *, contactName *, email *, phone *
- website, city, state, zip
- message (textarea – "Tell us about your business")
- howDidYouHear (dropdown + other)
- terms checkbox *

---

## 5. Data Models (Amplify / DynamoDB)

### ModelProfile
- **Required:** userId, email, firstName, lastName, phone
- **Key fields:** locationZip, photoUrls, communityInterests, somethingFun, whatYouCareAbout, favoriteService
- **Identity:** idDocumentUrl, idDocumentType, verificationSelfieUrl, identityVerificationStatus, identityVerificationScore
- **Status:** pending | approved | active | inactive
- **Hair/Safety:** virginHair, allergies (set in portal)

### Professional
- **Required:** userId, email, firstName, lastName, phone, licenseNumber
- **Education:** educationSchool, educationYearsCompleted, educationWorkshopsCourses, inSalonTraining, inSalonTrainingDetails
- **Experience:** experienceLevel, yearsWorking, yearsInSalon
- **Workplace:** salonName, salonStreet, salonCity, salonState, salonZip, salonLat, salonLng
- **Portfolio:** portfolioItems [{url, key, serviceLabel}], portfolioUrls, specialties (derived from labels)
- **Identity:** same as ModelProfile
- **Status:** pending | approved | active | inactive

### Partner
- **Required:** userId, email, businessName, contactName, phone
- **Optional:** website, city, state, zip, address
- **Status:** pending | approved | active | inactive
- **No identity verification** in inquiry flow

---

## 6. AWS Tools Used

| Tool | Purpose | Where |
|------|---------|-------|
| **Cognito** | Auth | All onboarding (Authenticator) |
| **AppSync + DynamoDB** | Persist profiles | ModelProfile.create, Professional.create, Partner.create |
| **S3 (Amplify Storage)** | Photos, ID, selfie | PhotoUploader, IdentityVerification |
| **Rekognition – CompareFaces** | ID vs selfie match | `identity-verification` Lambda |
| **Rekognition – DetectLabels, DetectFaces** | Hair/beauty analysis | `photo-analysis` Lambda (model photos only, S3 trigger) |
| **Rekognition – DetectModerationLabels** | Content moderation | `photo-analysis` pipeline |

---

## 7. Identity Verification (ID + Selfie)

### Flow
1. User uploads **government ID** (driver’s license, passport, state ID).
2. User uploads **selfie**.
3. Both stored in S3 via Amplify Storage.
4. User clicks “Verify” → frontend calls **`/api/verify-identity`**.

### Current state (wired)
- **Frontend:** `IdentityVerification.jsx` → `post()` from `aws-amplify/api` to REST API `identityVerificationApi` path `/verify-identity`.
- **Backend:** REST API Gateway at `POST /verify-identity` → invokes `identity-verification` Lambda.
- **Lambda:** `amplify/functions/identity-verification/handler.ts` uses Rekognition `CompareFaces` (ID vs selfie). **Now called from frontend via REST API.**

### What works
- Lambda exists and logic is correct (CompareFaces, 80%+ = verified, 70–79% = manual_review).
- S3 keys extracted from URLs, images loaded, Rekognition invoked.
- Response shape matches what the frontend expects.

### What’s missing
- Run `npx ampx sandbox` (or `--once`) to deploy. This adds `custom.API.identityVerificationApi` to `amplify_outputs.json`.

---

## 8. Photo Analysis (Model Photos – Rekognition)

**Separate from identity verification.** Triggered when models upload profile photos.

| Step | Tool | Purpose |
|------|------|---------|
| 1 | DetectModerationLabels | Block unsafe content |
| 2 | DetectLabels | Hair, skin, objects |
| 3 | DetectFaces | Quality, pose, attributes |
| 4 | AttributeMapper | Map to hair/beauty schema |
| 5 | Update ModelProfile | Store auto-tagged attributes |

Documented in `docs/REKOGNITION_PHOTO_ANALYSIS.md`.

---

## 9. Admin Review & Approval

### Where submissions appear
- **Real data:** `OnboardingTestPage` fetches from AppSync and shows pending/approved counts. *Note: This page exists but is **not currently routed** in the app.*
- **Database tests:** `/admin/database-test` → `DatabaseTestPage` (CRUD/authorization tests, different from OnboardingTestPage).
- **Primary admin UIs:** `/admin/models`, `/admin/professionals`, `/admin/salons` use **mock data** (mockModels, mockProfessionals, mockSalons), so real pending applications are **not listed** there.

### Approval mechanics
- **Detail modals:** `ModelDetailModal`, `ProfessionalDetailModal`, `PartnerDetailModal` support status changes.
- They call `ModelProfile.update`, `Professional.update`, `Partner.update` with `status: 'approved' | 'active' | 'inactive'`.
- **Catch-22:** Modals are opened from list pages that use mock data. To approve a real applicant, you must open a real record (e.g. from OnboardingTestPage or a different source).

### Status lifecycle
- **On submit:** `status: 'pending'`
- **Admin approves:** `status: 'approved'` (or `'active'` depending on flow)
- **Portal access:** Typically gated by `status === 'approved'` or `status === 'active'`

---

## 10. Post-Submit Flow

| Role | On submit | Portal access |
|------|-----------|---------------|
| **Model** | `ModelProfile.create` → `status: 'pending'` | Redirect to `/model-portal` |
| **Professional** | `Professional.create` → `status: 'pending'` | Redirect to `/portal` |
| **Partner** | `Partner.create` → `status: 'pending'` | Redirect to `/` (home) |

**Note:** Portal layouts may or may not enforce `status === 'approved'`. If not enforced, users can enter the portal before admin approval.

---

## 11. Gaps, Risks & Things to Review

### Critical
1. **Identity verification not wired**
   - Frontend expects `/api/verify-identity`, which does not exist.
   - Lambda exists but is never called.
   - **Action:** Expose Lambda via API or Amplify function invoke and point frontend to it.

2. **Admin lists use mock data**
   - `/admin/models`, `/admin/professionals`, `/admin/salons` show mock data, not DynamoDB.
   - **Action:** Switch these pages to `ModelProfile.list`, `Professional.list`, `Partner.list` and filter by `status: 'pending'` for review.

3. **Email/phone verification**
   - Both use mock “skip” or fake codes.
   - **Action:** Implement Cognito or a custom verification flow for production.

### Important
4. **Partner verification script**
   - `onboardingVerification.js` expects `website`, `salonPhotoUrls`, `selfPhotoUrls` for Partner. Inquiry form does not collect these.
   - **Action:** Relax checks or add placeholder values for inquiry flow.

5. **Portal access control**
   - Confirm that portals check `status === 'approved'` (or equivalent) before allowing use.
   - If not, pending users could access features before approval.

6. **Distance calculation**
   - Travel removed; “derive from ZIP + salon lat/long” not implemented.
   - **Action:** Add distance/time logic (e.g. Haversine or mapping API) for matching.

### Minor
7. **Hair & safety in portal**
   - allergies, virginHair moved out of onboarding. Ensure model portal has UI to set them.
8. **Auto-save**
   - Professional/Model use `saveProgress` (localStorage). Partner inquiry does not (single-page).
9. **Nominatim / geocoding**
   - Professional salon address uses Nominatim for lat/long. Confirm it’s wired and fallbacks exist.

---

## 12. What to Check for Approval

### Model
- [ ] Identity verification status (verified | manual_review | failed)
- [ ] Photos uploaded and acceptable
- [ ] Required fields present (name, email, phone, ZIP)
- [ ] Terms accepted
- [ ] Community interests selected

### Professional
- [ ] Identity verification status
- [ ] License number present
- [ ] Education (school, years completed)
- [ ] Salon address valid
- [ ] 6+ portfolio photos with service labels
- [ ] Self photos uploaded

### Partner
- [ ] Business name, contact, email, phone
- [ ] Message/inquiry content
- [ ] Terms accepted

---

## 13. Quick Reference – File Locations

| Component | Path |
|-----------|------|
| Model onboarding | `src/pages/ModelOnboard.jsx` |
| Professional onboarding | `src/pages/ProfessionalOnboard.jsx` |
| Partner onboarding | `src/pages/PartnerOnboard.jsx` |
| Identity verification UI | `src/components/IdentityVerification.jsx` |
| Identity verification Lambda | `amplify/functions/identity-verification/handler.ts` |
| Photo analysis Lambda | `amplify/functions/photo-analysis/handler.ts` |
| Admin Models | `src/admin/pages/ModelsPage.jsx` |
| Admin Professionals | `src/admin/pages/ProfessionalsPage.jsx` |
| Admin Salons | `src/admin/pages/SalonsPage.jsx` |
| Onboarding test (real data, not routed) | `src/admin/pages/OnboardingTestPage.jsx` |
| Database tests (`/admin/database-test`) | `src/admin/pages/DatabaseTestPage.jsx` |
| Detail modals (approve) | `src/admin/components/ModelDetailModal.jsx`, etc. |
| Schema | `amplify/data/resource.ts` |
| Rekognition photo docs | `docs/REKOGNITION_PHOTO_ANALYSIS.md` |

---

## 14. Questions for You

1. **Admin workflow:** Do you want a dedicated “Pending Applications” view (Models, Professionals, Partners) that lists real DynamoDB records, or is OnboardingTestPage enough for now?
2. **Identity verification:** Should we wire the identity-verification Lambda via a REST API or an Amplify function invoke from the frontend?
3. **Portal gating:** Do portals already block users with `status !== 'approved'`? If not, should we add that?
4. **Distance:** Any preference for how to compute distance (Haversine vs. Google Maps/Distance Matrix vs. other)?
5. **Partner inquiry:** Should partners receive an email when their inquiry is received? Any other follow-up automation?
