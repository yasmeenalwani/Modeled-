# Professional Onboarding Flow – Audit

**Date:** 2025  
**Scope:** `/onboard/professional` – start-to-end professional sign-up

---

## Flow Overview

| Step | Name | Purpose |
|------|------|---------|
| 0 | Welcome | Intro, value prop |
| 1 | Basic Info | firstName, lastName, email, phone, instagramHandle |
| 2 | Email Verification | 6-digit code – **mock/skip only** |
| 3 | Phone Verification | 6-digit code – **mock/skip only** |
| 4 | Professional Info | experienceLevel, specialties |
| 5 | Get to Know You | somethingFun, whatYouCareAbout, favoriteService, serviceWantToTry, communityInterests |
| 6 | Workplace | salonName, salonAddress, hasPartner |
| 7 | Verification | yearsWorking, licenseNumber, certifications, self photos, portfolio photos, IdentityVerification |
| 8 | Data Privacy | Info only, no input |
| 9 | Terms & Conditions | Checkbox + link |
| 10 | Review | Read-only summary |

---

## Schema vs Form Mapping

### Captured & Persisted

| Form Field | Schema Field | Required | Notes |
|------------|--------------|----------|-------|
| firstName | firstName | ✓ | |
| lastName | lastName | ✓ | |
| email | email | ✓ | Pre-filled from Cognito |
| phone | phone | ✓ | |
| instagramHandle | instagramHandle | | |
| experienceLevel | experienceLevel | ✓ | student, apprentice, junior, senior |
| specialties | specialties | | Array of keys (haircuts, coloring, etc.) |
| yearsWorking | yearsWorking | ✓ | |
| licenseNumber | licenseNumber | ✓ | |
| certifications | certifications | | Array |
| education | education | | **NOT in current form** |
| somethingFun | somethingFun | ✓ | |
| whatYouCareAbout | whatYouCareAbout | ✓ | |
| favoriteService | favoriteService | ✓ | |
| serviceWantToTry | serviceWantToTry | | **Added to schema** – now persisted |
| communityInterests | communityInterests | ✓ | |
| communityInterestsOther | communityInterestsOther | | |
| salonName | salonName | | |
| salonAddress | salonAddress | | Geocoded to salonLat/Lng |
| salonLat, salonLng | salonLat, salonLng | | From geocoding |
| locationZip | locationZip | | Extracted from address |
| selfPhotoUrls | selfPhotoUrls | ✓ | S3 URLs |
| portfolioUrls | portfolioUrls | ✓ | S3 URLs |
| identityVerified | identityVerified | | |
| identityVerificationStatus | identityVerificationStatus | ✓ | verified \| manual_review |
| identityVerificationScore | identityVerificationScore | | |
| idDocumentUrl | idDocumentUrl | | |
| idDocumentType | idDocumentType | | |
| verificationSelfieUrl | verificationSelfieUrl | | |
| termsAccepted | termsAccepted | ✓ | |
| termsAcceptedAt | termsAcceptedAt | | |
| hasPartner | — | | **Not in schema** – not persisted |

---

## Gaps & Issues

### Critical (blocks sign-up)

1. **Text legibility** – White text (`rgba(255,255,255,...)`) on light background – unreadable. **FIXED** in this session.

2. **Identity verification** – Calls `/api/verify-identity` (404). Fallback mock always passes. For production: wire to Lambda/Rekognition or equivalent.

3. **Photo upload** – Depends on Amplify Storage. Must be deployed and configured for S3 access.

### High (degrades experience)

4. **Email verification** – No real send/verify. "Skip for now (Testing)" present. Need Cognito or custom flow for production.

5. **Phone verification** – Same as email – mock only, skip for now.

6. ~~**serviceWantToTry**~~ – Fixed: Added to Professional schema and form mapping.

7. **education** – In schema, not collected in form.

8. **hasPartner / partnerId** – Form asks about partner salon; `partnerId` is always null. No partner selection.

### Medium (polish)

9. **Step order** – Verification (photos + ID) before Terms. Consider moving Terms earlier.

10. **Salon address** – Optional. Matching uses location; empty address may hurt match quality.

11. **License state** – License number collected but not state/country.

12. **Brand copy** – "Cherry Desk" in Welcome step – confirm desired product name.

---

## Post-Onboard Flow

- On success: `navigate('/portal')` → ProPortalLayout → PortalDashboard
- `getProfessionalProfile(userId)` queries `Professional.list({ filter: { userId } })`
- Portal expects: id, firstName, lastName, salonName, etc.
- Professional status: `pending` – admin must approve for full access

---

## Session Changes (Today)

1. **Text legibility** – All white text (`rgba(255,255,255,...)`) replaced with dark palette (#2D2926, #4A2A1A, #5A3A2A).
2. **serviceWantToTry** – Added to Professional schema; form now persists this field.
3. **Welcome copy** – "Cherry Desk" → "Modeled professional profile".
4. **Skip buttons** – "Skip for now (Testing)" → "I'll verify later".

**Schema change:** Run `npx ampx sandbox` (or deploy) to apply the new `serviceWantToTry` field.

---

## Recommendations (Future)

1. Add `education` field to form if needed.
2. Replace email/phone verification with real flows or remove steps for MVP.
3. Wire identity verification to Rekognition Lambda (or equivalent).
4. Add partner selection if partners exist in the system.
5. Consider making salon address required for location-based matching.
