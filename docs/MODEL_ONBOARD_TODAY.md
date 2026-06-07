# Model onboard — today’s checklist

**Goal:** A real person can sign up, finish onboarding, and see their profile in admin + model portal.

Matching / salon requests are **out of scope** for this pass.

---

## 1. Local env (`.env.local`)

```env
VITE_USE_MOCK_DATA=false
VITE_BYPASS_ONBOARDING_VERIFICATION=true
VITE_REQUIRE_ONBOARD_IDENTITY=false
VITE_SKIP_IDENTITY_VERIFICATION=true
VITE_FULL_APP_ACCESS=true
```

Pro onboard pilot (optional — lowers friction for same-day testing):

```env
VITE_PRO_ONBOARD_MIN_PORTFOLIO=1
VITE_SKIP_PRO_GEOCODE=true
```

Do **not** set `VITE_DEV_SUBMIT_ACTIVE=true` unless you want models to skip the admin queue.

Restart dev server after any env change.

---

## 2. Test flow (15–20 min)

| Step | URL | Pass? |
|------|-----|-------|
| 1 | `/join?role=model` → sign up / sign in | |
| 2 | `/onboard/model` — all 10 steps, **3+ photos** upload | |
| 3 | Submit → alert with **profile ID** → `/thanks?role=model&applied=1` | |
| 4 | Admin `/admin/onboarding` — new row appears | |
| 5 | Approve in `/admin/onboarding` (models submit as `pending` by default) | |
| 6 | Model `/model-portal/profile` — loads **their** data, not Seraphina demo | |

---

## 3. If something fails

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Photos won’t upload | `VITE_USE_MOCK_DATA=true` | Set `false`, restart |
| Submit error / enum | Deployed API older than local schema | Status is normalized on submit; share error text |
| Portal empty / demo Seraphina | Profile saved with **email** as `userId` (old bug) | Re-onboard after today’s fix, or fix row in admin |
| “Application under review” | `status: pending` | Approve in `/admin/onboarding` (dev auto-`active`) |
| Waitlist shell after login | `PrivateBetaLaunch` | `VITE_FULL_APP_ACCESS=true` or Cognito Admin group |

---

## 4. Key files

- Onboarding: `src/pages/ModelOnboard.jsx`
- Portal profile: `src/portal/model-pages/ModelProfile.jsx`
- Admin queue: `src/admin/pages/OnboardingPage.jsx`
- Auth user id helper: `src/utils/authUtils.js` → `getAuthenticatorUserId()`

---

## 5. What we fixed (this pass)

- **Same Cognito id** on create and portal load (no email as `userId`)
- **Deployed API status** normalization on create
- **Service prefs** → `openToHaircut` / `openToColor` / etc.
- **Clear alert** if mock mode blocks save
- **Dev:** new profiles submit as `active` for faster local testing
