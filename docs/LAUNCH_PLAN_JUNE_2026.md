# Modeled — June 1 launch plan

**Target:** Live, end-to-end flow you can run with real clients (Roman K, Scott, 2–3 NYC models).  
**Today:** May 19, 2026 · **Launch:** June 1, 2026 · **Working days:** ~8

---

## What “working for real” means

| Step | Done when |
|------|-----------|
| Partner + pro in DB | Roman K + Scott **published** (not draft-only) |
| Admin creates request | Full service list + model criteria → saved → matching queue |
| Matching | Engine returns scored models; you approve & send |
| Model sees opportunity | Model portal (not mock) shows match + can accept |
| Booking | Accept → payment path → calendar/booking record |
| Hosting | `modeledmgmt.com` serves the app (Amplify or current host) |

---

## This week — daily execution (P0)

### Wed–Thu May 21–22: **Make the pipe real**

1. **Deploy backend** (`amplify push` or CI pipeline)
   - Schema already has `ModelRequest`, `Match`, `Partner`, `Professional`
   - Confirm env: prod vs staging sandbox

2. **Publish entities (30 min)**
   - Admin → Salons → Roman K → **Publish**
   - Admin → Professionals → Scott Waldman → **Publish** (links `partnerId`)
   - Set Scott `userId` = his Cognito `sub` when he has a login

3. **Seed 3–5 NYC models for launch**
   - `status: approved`, real ZIPs (10016, 10013, 10028…)
   - Set `cardOnFileStatus: valid` OR add admin toggle “include models without card” on match approval (quick win)
   - Fill `hairLengthSimple`, `hairColorSimple`, `hairTextureSimple`, `openToHaircut`, `openToColor`, etc.

4. **Run one real request**
   - `/admin/requests` → Scott → service → criteria → **Create & open matching**
   - `/admin/match-approval` → send to 2 models
   - Model login → opportunities → accept

### Fri May 23: **Auth & notifications**

5. **Fix Match read for models** (`amplify/data/resource.ts`)
   - Today: Admin-only on `Match` → models never see sent opportunities in prod
   - Add: `allow.owner()` on `modelId` or custom rule `allow.authenticated().to(['read']).where(modelId.eq(...))`

6. **Notifications**
   - Persist `Notification` on send; model inbox reads from DB (not localStorage-only)

### Mon May 26: **Hosting & domain**

7. **Frontend deploy**
   - `npm run build` → Amplify Hosting branch `main` / production
   - Verify `modeledmgmt.com` DNS → CloudFront/Amplify (connection refused = DNS/hosting, not React)

8. **Env vars on prod**
   - Remove or set `VITE_USE_MOCK_DATA=false`
   - Cognito pool IDs, API URL from `amplify_outputs.json`

### Tue–Wed May 27–28: **Client-ready polish**

9. **SES** — production access or verified recipient list for model/pro emails

10. **Stripe / card on file** — test mode OK for June 1 if you manually mark `cardOnFileStatus: valid` for pilot models

11. **Walkthrough with Scott (or you as admin)**
    - Documented in `docs/E2E_SALON_TO_MODEL_FLOW.md`
    - SLA copy: “We match within 24–48h”

### Thu–Fri May 29–30: **Buffer & first client**

12. **Roman K pilot**
    - One haircut request, one color request
    - 2 models booked = launch criteria met

13. **Smoke checklist** (run before June 1)
    - [ ] Login admin / pro / model
    - [ ] Create request (all service categories visible)
    - [ ] Match scores > 0 for at least 1 model
    - [ ] Send → model sees opportunity
    - [ ] Accept → booking exists
    - [ ] Production URL loads

---

## Code status (just shipped)

- **22 services** across Hair (cuts, color, treatments, extensions), Beauty, Bridal — grouped in create-request modal
- **Model criteria:** color, length, texture, condition, density, curl pattern (1A–4C), age range, skin tone, virgin required, open to change — aligned with matching engine values (`extra_long`, `color_treated`, `colored`, etc.)
- Extended criteria stored in `adminNotes` as `__matchCriteria__={...}` and parsed on match approval

---

## Blockers → owner → fix

| # | Blocker | Fix | ETA |
|---|---------|-----|-----|
| 1 | Drafts only (Roman K, Scott) | Publish in admin | Day 1 |
| 2 | Models can’t read `Match` | Schema auth rule | Day 2 |
| 3 | `cardOnFileStatus` filters everyone | Valid on pilot models or admin bypass | Day 1 |
| 4 | Site down / connection refused | Amplify hosting + DNS | Day 4 |
| 5 | SES sandbox | AWS production access or verified emails | Day 5 |
| 6 | Mock mode on in prod | `.env` / Amplify env `VITE_USE_MOCK_DATA=false` | Day 4 |

---

## What to skip until after June 1

- Agentic score weight > 0
- Auto-matching Lambda (stay manual)
- Full Roman K service price sync to engine
- Pro “suggested matches” read-only view
- CRM email campaigns (SES blocked)

---

## Your daily focus (minimum)

1. **Morning:** One deploy or schema fix  
2. **Midday:** One end-to-end test (request → send → model view)  
3. **EOD:** Note what broke in `docs/E2E_SALON_TO_MODEL_FLOW.md` gaps table  

---

## Key files

| Area | Path |
|------|------|
| Create request UI | `src/admin/components/AdminRequestIntakeModal.jsx` |
| Service catalog | `src/admin/data/services.js` |
| Criteria helpers | `src/utils/requestIntakeOptions.js` |
| Matching | `src/matching/matchingEngine.js` |
| Match send | `src/admin/pages/MatchApprovalPage.jsx` |
| Schema | `amplify/data/resource.ts` |
| E2E doc | `docs/E2E_SALON_TO_MODEL_FLOW.md` |

---

## Success on June 1

You can onboard a salon contact, create a request for their stylist, match 2+ real models, send opportunities, and have at least one model accept — **on production URL**, without mock data.
