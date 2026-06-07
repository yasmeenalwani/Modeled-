# COPY-PASTE BRIEF FOR CLAUDE CODE — Join → Onboard → Admin → Portal E2E

**Repo:** `modeled-frontend` (React 19 + Vite + React Router 7 + AWS Amplify Gen2 + Cognito + AppSync/DynamoDB)

**Goal:** Make the full acquisition flow work end-to-end for **Model**, **Professional**, and **Partner** with zero ambiguity. User can join → onboard → profile in DB → admin sees them → admin approves → user sees their portal profile.

**Do NOT:** refactor unrelated code, add tests unless needed to verify fixes, change matching/booking, or commit without listing what changed.

---

## ACCEPTANCE CRITERIA (all must pass)

### Model
1. `/join?role=model` → sign up → `/onboard/model` (10 steps, 3+ photos) → submit succeeds
2. Row in DynamoDB `ModelProfile` with `userId` = Cognito **sub** (NOT email)
3. Row appears in **`/admin/onboarding`** (Models tab) when `status: pending` OR identity needs review
4. Admin Approve → `status: active`
5. Same user signs in → **`/model-portal/profile`** shows **their** data (not Seraphina demo, not empty)

### Professional
1. `/join?role=professional` → `/onboard/professional` → submit succeeds
2. `Professional` row with correct Cognito `userId`
3. Appears in **`/admin/onboarding`** (Professionals tab)
4. Admin Approve → portal **`/portal/profile`** loads their data

### Partner
1. `/join?role=partner` → `/onboard/partner` → submit succeeds
2. `Partner` row with correct Cognito `userId`
3. Appears in **`/admin/salons`** with pending status (and ideally **`/admin/onboarding`** if you add partners to queue)
4. Admin Approve → **`/partner-portal`** loads

### Cross-cutting
- Works with `VITE_USE_MOCK_DATA=false` (real API)
- Signed-in approved user can reach portals when `VITE_FULL_APP_ACCESS=true` (or is Cognito Admin)
- Consistent thank-you / next-steps after submit (at minimum: model already goes to `/thanks`; align pro/partner)
- Document required `.env.local` keys in `.env.example` or `docs/MODEL_ONBOARD_TODAY.md`

---

## FLOW MAP

```
/join (JoinModeled.jsx)
  → localStorage selectedRole = model | professional | partner
  → /onboard/{role} (each wrapped in Authenticator in App.jsx)

Model:    ModelOnboard.jsx     → ModelProfile.create/update  → /thanks?role=model&applied=1
Pro:      ProfessionalOnboard.jsx → Professional.create     → / (should be /thanks)
Partner:  PartnerOnboard.jsx   → Partner.create              → / (should be /thanks)

Admin:
  Model + Pro → /admin/onboarding (OnboardingPage.jsx)
  Partner     → /admin/salons (SalonsPage.jsx) — NOT in onboarding queue today

Portal gate: PortalStatusGate.jsx — requires status in ['approved','active']
Beta gate:   AuthenticatedApp in App.jsx — PrivateBetaLaunch unless VITE_FULL_APP_ACCESS=true or Admin
```

---

## P0 BUGS TO FIX (in priority order)

### 1. Wrong `userId` on create (Pro, Partner, Waitlists)
**Files:**
- `src/pages/ProfessionalOnboard.jsx` (~line 1955 submit)
- `src/pages/PartnerOnboard.jsx` (~line 165 submit)
- `src/pages/waitlist/ModelWaitlist.jsx`
- `src/pages/waitlist/ProfessionalWaitlist.jsx`
- `src/pages/waitlist/PartnerWaitlist.jsx`

**Bug:** Uses `user?.userId || user?.username || user?.signInDetails?.loginId` — `loginId` is **email**.

**Fix:** Import and use `getAuthenticatorUserId(user)` from `src/utils/authUtils.js` (already used correctly in `ModelOnboard.jsx` and `PortalStatusGate.jsx`).

Also pass `getAuthenticatorUserId(user)` to child components / IdentityVerification `userId` prop in Pro onboard.

### 2. Professional onboard — no mock-mode guard
**File:** `ProfessionalOnboard.jsx` imports `shouldUseMockData` but doesn't block submit.

**Fix:** Match ModelOnboard — alert and return if `shouldUseMockData()` true on submit.

### 3. Dev-only model `active` status hides admin queue
**File:** `ModelOnboard.jsx` ~line 2482-2485

```js
const profileStatus = normalizeDeployedProfileStatus(
  import.meta.env.DEV ? 'active' : 'pending',
  'pending'
);
```

**Fix:** Use `'pending'` in all environments for E2E unless `VITE_DEV_SUBMIT_ACTIVE=true`. Document env flag. Admin queue must show new models.

### 4. Partner not in admin review queue
**File:** `src/admin/pages/OnboardingPage.jsx` — only loads ModelProfile + Professional.

**Fix:** Add Partner tab or include partners in combined queue; map with `mapPartnerRow`; approve via `Partner.update({ status: 'active' })`. Link to `/admin/salons` in UI until done.

### 5. Partner onboard — no `selectedRole` guard
**Files:** `PartnerOnboard.jsx`, mirror Model/Pro pattern from `ModelOnboard.jsx` lines 2243-2250.

### 6. Post-submit navigation inconsistent
- Model → `/thanks?role=model&applied=1` ✓
- Pro → `/` ✗ → `/thanks?role=professional&applied=1`
- Partner → `/` ✗ → `/thanks?role=partner&applied=1`

**File:** `src/pages/waitlist/WaitlistThanks.jsx` — extend if needed for `applied=1` messaging.

### 7. Portal beta gate blocks approved users
Not a code bug — document env. For local E2E: `VITE_FULL_APP_ACCESS=true`.

Optional code improvement: after onboard submit, show clear message: "Application received — you'll get portal access after admin approval" and don't imply they can enter portal immediately.

---

## P1 IMPROVEMENTS (if time permits)

1. **Cognito group assignment** — No Lambda assigns `Model`/`Professional`/`Partner` on approve. Options:
   - Document manual Cognito group step in handoff doc, OR
   - Add minimal post-approval note in admin UI, OR
   - Scaffold Lambda (only if fast in this repo)

2. **Pro portfolio friction** — 6 labeled portfolio photos blocks pilot. Consider `VITE_PRO_ONBOARD_MIN_PORTFOLIO=1` env override for dev/pilot (default 6 in prod).

3. **Geocode failure** — `ProfessionalOnboard.jsx` hard-blocks if geocode fails. Allow submit with `salonLat/salonLng` null + `status: pending` and flag for admin (or skip geocode in dev).

4. **Identity verification** — Steps exist; submit allows skip when `VITE_SKIP_IDENTITY_VERIFICATION=true`. Ensure ID uploads use `getAuthenticatorUserId` for S3 paths.

5. **`normalizeDeployedProfileStatus`** — `src/utils/deployedApiEnums.js` maps `manual_review` → `pending` on create if deployed API lacks enum. Don't send unsupported status values on create.

---

## KEY FILES REFERENCE

| Area | Path |
|------|------|
| Join | `src/pages/JoinModeled.jsx` |
| Model onboard | `src/pages/ModelOnboard.jsx` |
| Pro onboard | `src/pages/ProfessionalOnboard.jsx` |
| Partner onboard | `src/pages/PartnerOnboard.jsx` |
| Waitlists | `src/pages/waitlist/*.jsx` |
| Auth user id | `src/utils/authUtils.js` → `getAuthenticatorUserId()` |
| Status normalize | `src/utils/deployedApiEnums.js` |
| Admin queue | `src/admin/pages/OnboardingPage.jsx` |
| Admin approval helpers | `src/admin/utils/approvalStatus.js` |
| Portal gate | `src/components/PortalStatusGate.jsx` |
| Beta gate | `src/components/PrivateBetaLaunch.jsx`, `src/App.jsx` AuthenticatedApp |
| Schema | `amplify/data/resource.ts` — ModelProfile, Professional, Partner `status` enum |
| Routes | `src/App.jsx` |
| Env checklist | `docs/MODEL_ONBOARD_TODAY.md`, `.env.example` |

---

## REQUIRED LOCAL ENV (`.env.local`)

```env
VITE_USE_MOCK_DATA=false
VITE_FULL_APP_ACCESS=true
VITE_SKIP_IDENTITY_VERIFICATION=true
VITE_REQUIRE_ONBOARD_IDENTITY=false
# Optional for faster pro pilot testing:
# VITE_PRO_ONBOARD_MIN_PORTFOLIO=1
# VITE_DEV_SUBMIT_ACTIVE=false
```

Restart `npm run dev` after changes. Dev server: `http://localhost:80`. Admin on localhost: `/admin` without login (dev only).

---

## MANUAL E2E TEST SCRIPT (run after fixes)

```text
MODEL:
  /join?role=model → new email signup → complete onboard (3 photos) → submit
  → /admin/onboarding → see row → Approve
  → sign in as user → /model-portal/profile → correct name/photos

PRO:
  /join?role=professional → signup → complete onboard → submit
  → /admin/onboarding → Approve
  → /portal/profile → correct data

PARTNER:
  /join?role=partner → signup → submit inquiry
  → /admin/salons (or onboarding if added) → Approve
  → /partner-portal → correct data
```

---

## DELIVERABLES FOR HANDOFF BACK TO CURSOR

1. List of files changed with one-line reason each
2. Any new env vars documented
3. Results of manual E2E (pass/fail per role)
4. Remaining blockers that need AWS/console action (Cognito groups, amplify push, SES, etc.)
5. Do NOT push to remote unless explicitly asked

---

## OUT OF SCOPE

- Match approval, booking completion, Stripe card on file, CRM email, production DNS
- Screenshot tooling (`npm run screenshots:demo`)
- Large partner onboard wizard redesign

---

*Generated for Claude Code execution pass. Return to Cursor agent to implement/review/merge.*
