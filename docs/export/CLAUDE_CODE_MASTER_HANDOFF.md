# Modeled — Claude Code Master Handoff (full technical download index)

**Use this as the single entry point.** Attach this file + section files below to Claude Code.  
**Repo path:** `c:\Users\yalwa\modeled-frontend`  
**Generated:** June 2026

---

## 0. What “full code download” means here

You have **351 source files · ~134,529 lines** of application code (excluding `node_modules`).

| What | Path | Use |
|------|------|-----|
| **Every file path + line count** | `docs/export/CODEBASE_MANIFEST.json` | Machine-readable full inventory |
| **This index** | `docs/export/CLAUDE_CODE_MASTER_HANDOFF.md` | Start here |
| **Onboarding audit (code excerpts)** | `docs/handoff/ONBOARDING_TECHNICAL_AUDIT_PACK.md` | Fix join → admin → portal |
| **Onboarding fix brief** | `docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md` | Execution tasks |
| **Architecture + built %** | `docs/TECH_ARCHITECTURE_AND_BUILD_STATUS.md` | What’s done vs scaffolded |
| **Page / route map** | `docs/export/PAGE_INVENTORY_PRINT.md` | Every URL |
| **Investor truth sheet** | `docs/INVESTOR_PARTNER_DECK_BRIEF.md` | Product inventory |
| **Cursor ↔ Claude workflow** | `docs/export/CURSOR_CLAUDE_CODE_WORKFLOW.md` | How to run both AIs + voice |

**To zip the repo for Claude Code (exclude heavy folders):**
```powershell
cd c:\Users\yalwa\modeled-frontend
Compress-Archive -Path src,amplify,scripts,docs\export,docs\handoff,package.json,amplify_outputs.json -DestinationPath modeled-code-export.zip -Force
```
(Omit `node_modules`, `dist`. Add `amplify_outputs.json` only if safe — it’s gitignored.)

---

## 1. Scale snapshot (quantified)

| Metric | Count |
|--------|------:|
| Source files (src + amplify + scripts) | **351** |
| Lines of code | **~134,529** |
| Documentation files (`docs/`) | **~177** |
| DynamoDB / GraphQL models | **26** |
| Lambda handlers | **16** |
| Admin pages | **43** |
| Service catalog entries | **32** |
| Training curriculum hours | **800** |
| Git commits (repo) | **9** (initial May 13, 2026; prior work local/docs) |
| Calendar build (docs) | **Dec 2025 → Jun 2026 (~6 mo)** |
| Est. founder effort | **~800–1,200 hrs** |

### Largest files (complexity hotspots)

| Lines | File | Role |
|------:|------|------|
| 2,742 | `src/pages/ModelOnboard.jsx` | Model 10-step wizard + submit |
| 2,268 | `src/pages/ProfessionalOnboard.jsx` | Pro 11-step wizard |
| 1,753 | `src/portal/model-pages/ModelProfile.jsx` | Model portal profile |
| 1,624 | `src/matching/matchingEngine.js` | **Core IP** — scoring |
| 1,560 | `src/utils/matchService.js` | Match CRUD + send |
| 1,325 | `amplify/data/resource.ts` | **Schema** — all entities |
| 1,124 | `src/admin/pages/MatchApprovalPage.jsx` | Admin send matches |
| 1,045 | `src/utils/mockDataService.js` | Mock vs real toggle |

### Code by top-level area (approx.)

| Area | Files | Lines (sum of files in tree) |
|------|------:|-----------------------------:|
| `src/portal/` | ~120+ | **~43,800** |
| `src/admin/` | ~80+ | **~29,600** |
| `src/components/` | ~60+ | **~17,200** |
| `src/pages/` | ~15+ | **~8,400** |
| `src/utils/` | ~70+ | **~12,000+** |
| `src/matching/` | ~8 | **~2,300** |
| `amplify/` | ~60+ | **~8,000+** |

---

## 2. What is BUILT vs SCAFFOLDED (honest)

### BUILT — usable in dev/demo (may need prod deploy)

| System | Completion | Key paths |
|--------|:----------:|-----------|
| Admin Command Center (40+ screens) | **85%** | `src/admin/pages/`, `src/admin/adminRoutes.jsx` |
| Matching engine (client) | **90%** | `src/matching/matchingEngine.js` |
| Model portal UI | **70%** | `src/portal/model-pages/` |
| Pro portal UI | **70%** | `src/portal/pages/` |
| Partner portal UI | **65%** | `src/portal/partner-pages/` |
| Onboarding wizards | **75%** | `src/pages/ModelOnboard.jsx`, `ProfessionalOnboard.jsx`, `PartnerOnboard.jsx` |
| Demo mode (no login) | **100%** | `src/pages/demo/`, `src/utils/demoPortalMode.js` |
| Service catalog + pricing | **100%** | `src/admin/data/services.js` |
| Training curriculum data | **100%** | `src/admin/data/training.js` |
| Identity verification UI | **80%** | `src/components/IdentityVerification.jsx` |
| Photo upload / S3 | **75%** | `src/utils/identityVerificationUpload.js`, `PhotoUploader.jsx` |

### SCAFFOLDED — UI and/or Lambda exist; not launch-critical E2E

| System | State | Key paths |
|--------|-------|-----------|
| Auto-matching Lambda | Built, not wired | `amplify/functions/auto-matching/` |
| Stripe live payments | Partial | `amplify/functions/stripe-payment/` |
| SES / CRM email | Blocked / partial | `amplify/functions/crm-outreach/`, `notifications/` |
| Chat production | UI only | Portal chat pages + `chat-activation` |
| RDS analytics live | Pages + sync Lambda | `analytics-api`, `TrendsPage`, `RevenuePage` |
| Pro shop commerce | UI + schema | `ProShop.jsx`, Product/Order models |
| Pinpoint campaigns | Lambda scaffold | `pinpoint-campaigns`, `pinpoint-segments` |
| Agentic weights in ranking | Calculated, weight=0 | `matchingEngine.js` |
| Photo AI auto-tag at onboard | Lambda exists | `photo-analysis/handler.ts` |

### NOT WORKING E2E YET (fix first)

| Blocker | Files |
|---------|-------|
| Pro/Partner/waitlist `userId` = email not Cognito sub | `ProfessionalOnboard.jsx`, `PartnerOnboard.jsx`, `waitlist/*.jsx` |
| Onboard → admin → portal for all roles | `OnboardingPage.jsx`, `PortalStatusGate.jsx` |
| Model reads `Match` from DB | `amplify/data/resource.ts` auth on Match |
| `PrivateBetaLaunch` without `VITE_FULL_APP_ACCESS` | `App.jsx`, `PrivateBetaLaunch.jsx` |
| Roman K + Scott publish to prod DB | `partnerDrafts/`, `professionalDrafts/` |
| Production hosting / schema sync | `amplify/backend.ts`, deploy docs |

---

## 3. Architecture (one block for Claude)

```
React 19 + Vite + React Router 7
  → AWS Amplify Gen 2 Hosting
  → Cognito (Model, Professional, Partner, Admin)
  → AppSync GraphQL → DynamoDB (26 models)
  → S3 (photos, ID docs, portfolios)
  → 16 Lambdas (Stripe, Rekognition, notifications, CRM, …)
  → Optional RDS (analytics)
```

**Intelligence today:** Matching scores run **in the browser** (`matchingEngine.js`). Photo/ID AI in **Lambda**.

---

## 4. Section map — what to attach for each fix area

### A. Routes & auth shell
```
src/App.jsx
src/components/ProtectedRoute.jsx
src/components/PortalStatusGate.jsx
src/components/PrivateBetaLaunch.jsx
src/utils/authUtils.js
amplify/auth/resource.ts
```

### B. Join & onboarding (P0)
```
src/pages/JoinModeled.jsx
src/pages/ModelOnboard.jsx
src/pages/ProfessionalOnboard.jsx
src/pages/PartnerOnboard.jsx
src/pages/waitlist/*.jsx
src/utils/modelOnboardPayload.js
src/utils/deployedApiEnums.js
docs/handoff/ONBOARDING_TECHNICAL_AUDIT_PACK.md
docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md
```

### C. Admin ops
```
src/admin/adminRoutes.jsx
src/admin/AdminLayout.jsx
src/admin/pages/OnboardingPage.jsx
src/admin/pages/ModelsPage.jsx
src/admin/pages/ProfessionalsPage.jsx
src/admin/pages/SalonsPage.jsx
src/admin/pages/RequestsPage.jsx
src/admin/pages/MatchEnginePage.jsx
src/admin/pages/MatchApprovalPage.jsx
src/admin/utils/approvalStatus.js
```

### D. Matching (core IP)
```
src/matching/matchingEngine.js
src/utils/matchService.js
src/utils/agenticScoreCalculator.js
src/admin/pages/MatchCriteriaPage.jsx
docs/MATCHING_SYSTEM_TECHNICAL_WRITEUP.md
```

### E. Portals
```
src/portal/ModelPortalLayout.jsx
src/portal/ProPortalLayout.jsx
src/portal/PartnerPortalLayout.jsx
src/portal/model-pages/ModelProfile.jsx
src/portal/model-pages/ModelOpportunities.jsx
src/portal/pages/PortalProfile.jsx
src/portal/pages/ProMatching.jsx
src/portal/partner-pages/PartnerDashboard.jsx
src/utils/mockDataService.js
src/utils/demoPortalMode.js
```

### F. Backend schema & Lambdas
```
amplify/data/resource.ts
amplify/backend.ts
amplify/storage/resource.ts
amplify/functions/*/handler.ts
```

### G. Business / pricing (for deck, not code fixes)
```
src/admin/data/services.js
src/admin/data/training.js
src/admin/pages/PricingCalculatorPage.jsx
docs/export/ONE_PAGER_SOURCE_SERVICE_TRAINING_PRICING.md
```

---

## 5. DynamoDB entities (26 models in schema)

**Launch-critical:** `ModelProfile`, `Professional`, `Partner`, `ModelRequest`, `Match`, `Booking`, `Notification`, `Service`

**Future / scaffold:** `Conversation`, `Message`, `Product`, `Order`, `Prospect`, `OutreachCampaign`, `BusinessTrip`, `DailyQuestion`, etc.

Full schema: `amplify/data/resource.ts` (1,325 lines)

---

## 6. Lambda inventory (16 handlers)

| Function | Launch priority |
|----------|-----------------|
| `identity-verification` | Medium |
| `photo-analysis` | Later |
| `stripe-payment` | **High** |
| `notifications` | **High** |
| `auto-matching` | Low (manual admin at launch) |
| `match-expiration` | Medium |
| `booking-reminders` | Medium |
| `model-payment-reminders` | Medium |
| `chat-activation` | Later |
| `agentic-decay` | Later |
| `dynamodb-sync` | Later |
| `analytics-api` | Later |
| `pinpoint-campaigns` | Later |
| `pinpoint-segments` | Later |
| `crm-outreach` | Later |
| `crm-followups` | Later |

---

## 7. Admin pages (43 files)

`Dashboard`, `ModelsPage`, `ProfessionalsPage`, `SalonsPage`, `RequestsPage`, `MatchEnginePage`, `MatchApprovalPage`, `MatchCriteriaPage`, `OnboardingPage`, `BookingsPage`, `CalendarPage`, `CRMPage`, `ServicesPage`, `PackagesPage`, `TrainingPage`, `PhotosPage`, `CampaignsPage`, `TripManagementPage`, `ChatManagementPage`, analytics pages (`TrendsPage`, `RevenuePage`, `OnboardingAnalyticsPage`, …), ROLE Model sub-pages (`RoleModelPage`, …), `PlaceholderPage`, test pages (`DatabaseTestPage`, `RDSTestPage`), etc.

Routes: `src/admin/adminRoutes.jsx`

---

## 8. Environment variables (Claude must know)

```env
VITE_USE_MOCK_DATA=false          # real API for onboard
VITE_FULL_APP_ACCESS=true         # bypass beta wall for portal testing
VITE_SKIP_IDENTITY_VERIFICATION=true
VITE_REQUIRE_ONBOARD_IDENTITY=false
VITE_DEV_ADMIN_BYPASS=true        # localhost /admin without login
```

See `.env.example` and `docs/MODEL_ONBOARD_TODAY.md`

---

## 9. Suggested Claude Code session order

1. Read `ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md` → fix P0 bugs  
2. Read `ONBOARDING_TECHNICAL_AUDIT_PACK.md` → verify flows  
3. Read `matchingEngine.js` + `MatchApprovalPage.jsx` only if matching is in scope  
4. Do **not** refactor portal design demos or ROLE Model unless asked  
5. Return: files changed, env vars, E2E pass/fail per role  

---

## 10. Copy-paste prompt for Claude Code

```
You are fixing Modeled Management (modeled-frontend). Read these in order:
1. docs/export/CLAUDE_CODE_MASTER_HANDOFF.md
2. docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md
3. docs/handoff/ONBOARDING_TECHNICAL_AUDIT_PACK.md
4. docs/export/CODEBASE_MANIFEST.json (full file list)

Priority: join → onboard → DynamoDB profile → admin approve → portal loads correct user.
Use getAuthenticatorUserId() everywhere for userId. Do not git push unless asked.
Report files changed + manual E2E results for model, pro, partner.
```

---

*Regenerate manifest: `npm run export:manifest`*
