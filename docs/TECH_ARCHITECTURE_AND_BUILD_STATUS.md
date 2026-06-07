# Modeled — Technical Architecture & Build Status (Print Edition)

**As of:** May 19, 2026  
**Purpose:** Copy, print, or attach to Claude. Plain-language technical truth sheet.  
**Build period:** December 2025 → present (~6 months)

---

## 1. What Modeled is (technical)

A **React single-page app** on **AWS Amplify Gen 2**, talking to **AppSync GraphQL → DynamoDB**, with **Cognito** auth, **S3** for media, and **Lambda** for payments, AI, and automation. Four user-facing surfaces plus public onboarding:

| Surface | URL | Auth |
|---------|-----|------|
| Admin Command Center | `/admin` | Cognito Admin group |
| Model portal | `/model-portal` | Cognito Model |
| Professional portal | `/portal` | Cognito Professional |
| Partner portal | `/partner-portal` | Cognito Partner |
| Public demo (no login) | `/demo`, `/demo/seraphina`, `/demo/sarah`, `/demo/partner` | None |
| Onboarding | `/join`, `/onboard/*` | Cognito on submit |

---

## 2. Architecture (one page)

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER — React 19 + Vite + React Router 7                      │
│  Portals · Admin · Onboarding · Matching engine (client-side)    │
└────────────────────────────┬────────────────────────────────────┘
                             │ Amplify JS SDK
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS AMPLIFY HOSTING — CloudFront + S3 static assets             │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  COGNITO    │    │  APPSYNC    │    │  S3         │
│  Auth       │    │  GraphQL    │    │  Photos/IDs │
│  4 groups   │    │  API        │    │  portfolios │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  DYNAMODB   │  ← operational data (profiles, requests, matches, bookings)
                   └──────┬──────┘
                          │ streams (optional)
                          ▼
                   ┌─────────────┐
                   │  RDS Postgres│  ← analytics / reporting (optional at launch)
                   └─────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAMBDA FUNCTIONS (15 defined in amplify/backend.ts)             │
│  Stripe · Notifications · Photo AI · Identity · Auto-match · CRM │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ Stripe  │         │ SES/SNS │         │Rekognition│
    │ payments│         │ email   │         │ Bedrock  │
    └─────────┘         └─────────┘         └─────────┘
```

**Where “intelligence” lives today:**
- **Matching scores:** mostly **in the browser** (`src/matching/matchingEngine.js`) — fast, no server round-trip for admin review.
- **Photo / ID AI:** **Lambda** (Rekognition + Bedrock) — wired but not fully production-hardened.
- **Automation:** Lambdas exist (auto-match, reminders, CRM) — **mostly scaffolded**, admin is manual at launch.

---

## 3. Technology stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, React Router 7 |
| UI | Custom inline styles + Amplify UI (auth) |
| API | AWS AppSync (GraphQL), Amplify Data client |
| Database | Amazon DynamoDB |
| Analytics DB | Amazon RDS PostgreSQL (schema + admin pages; sync Lambda exists) |
| Auth | Amazon Cognito (groups: Admin, Model, Professional, Partner) |
| Files | Amazon S3 (Amplify Storage) |
| Compute | AWS Lambda (Node.js, CDK-defined) |
| Email / SMS | Amazon SES, SNS, Pinpoint (Pinpoint scaffolded) |
| AI / ML | Amazon Rekognition, AWS Bedrock (Claude) |
| Payments | Stripe (Lambda + React; test mode) |
| Hosting / CI | AWS Amplify Hosting, GitHub |
| Monitoring | CloudWatch (alarms documented; optional CDK module) |

---

## 4. Data model (DynamoDB entities)

**Core marketplace (launch-critical):**

| Entity | Purpose |
|--------|---------|
| `ModelProfile` | Model attributes, photos, availability, scores, card-on-file |
| `Professional` | Stylist profile, salon link, specialties |
| `Partner` | Salon / business, locations, team |
| `ModelRequest` | Stylist’s ask: service, date, criteria, location |
| `Match` | Model × request pairing with score and status |
| `Booking` | Confirmed appointment after accept + pay |
| `Notification` | In-app / trigger for email |
| `Service` | Service catalog |

**Built for later rollouts (schema + often UI exists):**

| Entity | Purpose |
|--------|---------|
| `Conversation`, `Message` | Chat |
| `ModelToProChat`, `ModelToProMessage` | Scoped pro–model chat |
| `Product`, `Order`, `OrderItem`, `Donation` | Pro shop / commerce |
| `Prospect`, `OutreachCampaign`, `OutreachActivity` | CRM outreach |
| `BusinessTrip`, `TripContact`, `CityExpansion` | Field sales / expansion |
| `BeautyMaintenanceRoutine`, `InspirationPhoto` | Model education / looks |
| `DailyQuestion`, `QuestionAnswer` | Engagement / games |

---

## 5. Lambda functions (backend)

| Function | Purpose | Launch need |
|----------|---------|-------------|
| `identity-verification` | ID doc + selfie via Rekognition | Medium — trust story |
| `photo-analysis` | Auto-tag hair/beauty from photos | Later — manual tags OK for pilot |
| `stripe-payment` | Payment intents, webhooks | **High** — model fees |
| `notifications` | SES email, SNS SMS | **High** — match sent, booking |
| `auto-matching` | Stream-triggered match creation | **Low** — admin manual at launch |
| `match-expiration` | Expire stale matches | Medium |
| `booking-reminders` | Pre-appointment reminders | Medium |
| `model-payment-reminders` | Card / payment nudges | Medium |
| `chat-activation` | Open chat on booking | Later |
| `agentic-decay` | Decay model engagement scores | Later |
| `dynamodb-sync` | DynamoDB → RDS | Later |
| `analytics-api` | RDS queries for admin charts | Later |
| `pinpoint-campaigns`, `pinpoint-segments` | Marketing campaigns | Later |
| `crm-outreach`, `crm-followups` | Sales automation | Later |

---

# PART A — WHAT IS DONE & COMPLETE

*“Complete” = built and usable in dev/demo; may still need prod deploy or data seeding.*

## A1. Admin Command Center — **~85% complete**

**Done:**
- 40+ pages: dashboard, models, professionals, salons, requests, matching, match approval, bookings, calendar, CRM, trips, analytics, onboarding review, photos, services, packages, training, campaigns, chat admin, ROLE Model sub-program
- Model gallery: tags, cover images, detail modals
- Partner multi-location, Roman K / Scott Waldman draft profiles
- 3-step **Create Request** modal: 22 services, model criteria, flexible/recurring scheduling
- Match approval: score breakdown, approve, send to models
- Identity doc viewing in admin (signed URLs)

**Not complete:**
- Some sidebar links → placeholder (`/admin/ai-analysis`, `/admin/videos`)
- CRM email send blocked on SES production access
- Analytics pages partly mock / RDS not fully wired

## A2. Matching engine — **~90% complete (client-side)**

**Done:**
- Attribute scoring (hair, beauty, condition, virgin, allergies dealbreakers)
- Reachability (ZIP, travel time, availability vs appointment)
- Service opt-in filters
- Agentic score **calculation** (reliability, feedback, etc.)
- Launch weights: 72% attributes, 28% reachability, **0% agentic**
- Admin match engine + approval pages

**Not complete:**
- Production E2E with real DB models (auth + seed data gaps)
- Auto-matching Lambda not required for launch
- Agentic weight re-enable after booking history

## A3. Model portal — **~70% complete**

**Done (UI + routes):**
- Model Card (profile), Matched (opportunities), Looks (photos), Play (games)
- Also routed but de-emphasized in nav: sessions, chat, calendar, savings, feedback, role

**Done (flows):**
- View opportunities (mock + partial DB)
- Accept/decline match logic (mock path works)
- Profile edit, service preferences

**Not complete:**
- Real `Match` read from DB (schema auth)
- Sidebar still partly demo chrome (Seraphina) vs live profile
- Stripe pay on accept — partial

## A4. Professional portal — **~70% complete**

**Done:**
- Pro Card (rich profile), Matched, Looks/portfolio, Education, Pro Shop
- Request creation (luxury UI), match viewing, calendar, booked, chat routes
- Design demo pages (calendar variants)

**Not complete:**
- Scott Waldman not published → falls back to demo Sarah
- Request → DB create works with fallbacks; prod schema drift handled in code
- Many secondary routes not in sidebar

## A5. Partner portal — **~65% complete**

**Done:**
- Full nav: dashboard, profile, services, compliance, team, schedule, campaigns, conversions, financials, support
- Dashboard with team/bookings/campaigns **mock data** (good for demos)

**Not complete:**
- Roman K publish to DB
- Live data from `Partner` entity vs hardcoded dashboard
- Partner userId ↔ Cognito linkage for real login

## A6. Onboarding — **~75% complete**

**Done:**
- Model: 10-step wizard (info, path, services, availability, photos, terms, optional verify, submit)
- Pro + partner wizards
- `/join` role picker, waitlist shortcuts
- S3 photo upload path, identity verification component
- `ModelProfile.create` / update to DynamoDB

**Not complete:**
- Prod enum/schema sync (workarounds in place)
- userId consistency (recently fixed)
- SES for verification emails in prod
- Every new model → admin approve before portal (by design)

## A7. Auth & gating — **~80% complete**

**Done:**
- Cognito email signup, 4 role groups
- Private beta shell (`PrivateBetaLaunch`) for non-admins
- Portal status gate (approved/active)
- Admin-only routes, dev localhost bypasses
- Public `/demo/*` routes (no login)

**Not complete:**
- `VITE_FULL_APP_ACCESS` / production beta policy decision
- Model read access on `Match` and `Notification` records

## A8. Infrastructure & deploy — **~60% complete**

**Done:**
- Amplify Gen 2 backend definition (`amplify/backend.ts`)
- Full schema in `amplify/data/resource.ts`
- S3 storage rules, identity Lambda
- CI amplify outputs, hosting-only deploy path
- SES domain modeledmgmt.com configured for Cognito (May 2026)

**Not complete:**
- Full `amplify push` / backend in sync with local schema everywhere
- modeledmgmt.com reliably serving app (DNS/hosting was blocked)
- Production env vars locked (`VITE_USE_MOCK_DATA=false`)
- CloudWatch alarms / monitoring CDK optional module not enabled

---

# PART B — WHAT IS SCAFFOLDED (future rollouts)

*UI and/or schema exist; not launch-critical or uses mock data.*

| Feature | Where | State |
|---------|-------|-------|
| **Pro Shop** | `/portal/shop` | UI built; Product/Order schema; Stripe catalog not live |
| **Model games / Play** | `/model-portal/games` | Engagement UI; DailyQuestion schema |
| **Education / Training** | `/portal/education`, admin training | Content shell |
| **Partner campaigns & conversions** | Partner portal | Mock metrics |
| **Partner financials** | Partner portal | Mock |
| **CRM outreach** | Admin CRM + Lambdas | UI + functions; SES blocked |
| **Pinpoint campaigns** | Lambda + admin campaigns | Scaffolded |
| **Chat (pro/model/support)** | Portal chat pages + Conversation schema | UI exists; activation Lambda scaffolded |
| **ROLE Model program** | `/admin/role-model/*` | Full admin sub-app; community rollout |
| **Trips / city expansion** | Admin trips | Sales ops scaffold |
| **RDS analytics** | Admin trends/revenue + sync Lambda | Pages exist; live sync optional |
| **Auto-matching** | Lambda on DynamoDB stream | Built, not wired for launch |
| **Agentic learning in ranking** | matchingEngine weights | Scores computed; weight = 0 |
| **Photo AI auto-tagging** | photo-analysis Lambda | Built; manual attributes OK for pilot |
| **Booked calendar design demos** | Multiple `/portal/*-demo` routes | Design exploration only |
| **Commerce / donations** | Schema | Future |

---

# PART C — STILL NEEDED FOR FULL FUNCTIONING (launch)

Priority order for **June 1, 2026 pilot**:

| # | Item | Complexity | Est. time |
|---|------|------------|-----------|
| 1 | Deploy backend so schema matches code (`amplify push` / CI fullstack) | Medium | 2–4 days |
| 2 | Publish Roman K (Partner) + Scott (Professional) in admin | Low | 0.5 day |
| 3 | Seed 3–5 real NYC models (approved, ZIP, photos, `cardOnFileStatus`) | Low | 1–2 days |
| 4 | Fix `Match` + `Notification` auth so models read their rows | Low | 1 day |
| 5 | End-to-end test: request → match → send → model sees → accept | Medium | 2–3 days |
| 6 | Production hosting + DNS (`modeledmgmt.com`) | Medium | 1–2 days |
| 7 | Stripe test (or manual card flag) for model payment on accept | Medium | 3–5 days |
| 8 | SES production or verified recipients for transactional email | Medium | 3–10 days (AWS approval) |
| 9 | Turn off mock mode in production env | Low | 0.5 day |
| 10 | Model onboard path hardened (photos, userId) — recent fixes | Low | 1 day QA |

**Total to pilot-ready:** roughly **2–4 weeks** of focused engineering (can overlap with AWS approvals).

**Not required for June 1 but required for “full product”:**
- Agentic weights in matching (1 week)
- Auto-matching with admin override (1–2 weeks)
- Pro shop live (2–3 weeks)
- RDS analytics live (1–2 weeks)
- Chat production (2 weeks)
- Photo AI auto-tag in onboarding (1 week + tuning)
- CRM email campaigns (depends on SES)

---

# PART D — FEATURE ROLLOUT ROADMAP

## Phase 0 — Pilot (May 19 – Jun 1, 2026)
- Real partner + pro in DB
- Manual admin matching + send
- 5–10 models onboarded
- 2+ completed bookings
- Demo URLs for investors/partners

## Phase 1 — NYC single-market (Jun – Aug 2026)
- Model self-serve onboard → admin approve
- Pro self-serve requests
- Stripe live for model fees
- Notifications in DB + email
- Partner portal on real Roman K data
- Remove dev/mock bypasses in prod

## Phase 2 — Operational scale (Sep – Dec 2026)
- Auto-match suggestions (admin still sends)
- Agentic scores in ranking (weight > 0)
- Booking reminders + match expiration Lambdas live
- RDS dashboards with real revenue
- Second anchor salon
- Mobile-responsive pass on model matched page

## Phase 3 — Platform expansion (2027)
- Pro shop + affiliate revenue
- Photo AI auto-tag at scale
- Chat + content (Looks, education)
- CRM + Pinpoint for reactivation
- Multi-city playbook
- Partner API / white-label matching

---

# PART E — BUILD TIMELINE (December 2025 → May 2026)

*Reconstructed from documentation dates, repo history, and feature milestones. This git repo’s first commit is **May 13, 2026**; earlier work may live in local iterations or docs-only planning starting **December 2025**.*

| Period | Focus | Milestones |
|--------|-------|------------|
| **Dec 2025** | Vision, schema design, stack choice | AWS Amplify Gen 2 selected; entity model (Model, Pro, Partner, Request, Match, Booking); matching concept |
| **Jan 2026** | Foundation documentation & architecture | 245+ docs indexed; database schema CSV/Excel; AWS architecture & cost model; matching technical writeup; portal route map |
| **Jan–Feb 2026** | Core product build | Admin layout + pages; three portals; matching engine v1; mock data service; onboarding wizards; S3 photo flow |
| **Feb–Mar 2026** | Matching & workflows | Agentic scoring spec; match approval; request queue; booking flow; notification hooks; identity verification Lambda |
| **Mar–Apr 2026** | Admin ops & partners | Salons page, Roman K draft, Scott Waldman, gallery tags, CRM pages, trip management, analytics pages |
| **Apr 2026** | Intake & criteria | Admin request modal (3-step); 22 services; flexible scheduling; deployed-API workarounds for schema drift |
| **May 1–12 2026** | Hardening & launch prep | Match approval fixes; partner publish payloads; professional onboard; E2E documentation |
| **May 13 2026** | Repo consolidation | Git initial commit — frontend monorepo formalized |
| **May 17 2026** | Deploy & go-live push | Amplify CI, hosting-only deploy, SES/Cognito domain, fullstack deploy re-enabled |
| **May 19 2026** | Demo & deck | Public `/demo/*` routes; model onboard userId fix; investor deck brief; matching debug |

**Calendar duration:** ~**6 months** (Dec 2025 → May 2026)  
**Repo-tracked duration:** ~**6 weeks** (May 13 → present) — intensive integration phase

**Rough build effort (estimate):**
- Equivalent to **1 senior full-stack engineer × 6 months**, or **~800–1,200 hours** including design, docs, and iteration (not a hired team; founder-led build).

---

# PART F — COMPLEXITY & TIME TO BUILD (reference)

| Work unit | Complexity | Typical calendar time (1 dev) |
|-----------|------------|-------------------------------|
| Amplify backend + schema (what you have) | High | 6–10 weeks |
| Matching engine (client) | High | 4–6 weeks |
| Admin 40+ pages | High | 8–12 weeks |
| 3 portals (MVP nav) | High | 6–8 weeks |
| Onboarding (3 roles) | Medium | 3–4 weeks |
| 15 Lambda functions (scaffold) | Medium | 4–6 weeks |
| Identity + photo AI | Medium | 2–3 weeks |
| Stripe integration (end-to-end) | Medium | 2–3 weeks |
| **Remaining to pilot** | Medium | **2–4 weeks** |
| **Remaining to “full v1”** | High | **3–4 months** after pilot |

---

# PART G — COST TO RUN & SCALE (AWS)

*From `docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md`. Stripe fees are separate (~2.9% + $0.30 per transaction).*

| Scale | Users/month | AWS/month | + Stripe (illustrative) | Total infra-ish |
|-------|-------------|-----------|-------------------------|-----------------|
| **MVP / Pilot** | 0–1,000 | **~$28** (~$11 yr-1 with RDS free tier) | ~$50–150 | **~$80–180/mo** |
| **Growth** | 1K–10K | **~$104** | scales with GMV | **~$200–400/mo** |
| **Scale** | 10K–100K | **~$1,165** | scales with GMV | **~$1.5–2K/mo** |
| **Enterprise** | 100K+ | **~$7,495** | scales with GMV | **~$8–10K/mo** |

**Cost per user (AWS only, approximate):**
- 0–1K users: ~$0.03/user/month  
- 1K–10K: ~$0.01/user/month  
- 10K–100K: ~$0.01/user/month  

**Largest cost drivers at scale:** S3 photo storage, Cognito MAU after 50K, DynamoDB read/write volume, Rekognition if auto-tagging every upload.

**Current spend:** Near **$0–50/month** if hosting partially up; full production stack ≈ **$28–80/month** at pilot volume.

---

# PART H — FILE & REPO MAP (for technical readers)

| Area | Path |
|------|------|
| Routes | `src/App.jsx` |
| Admin pages | `src/admin/pages/` |
| Model portal | `src/portal/model-pages/`, `ModelPortalLayout.jsx` |
| Pro portal | `src/portal/pages/`, `ProPortalLayout.jsx` |
| Partner portal | `src/portal/partner-pages/`, `PartnerPortalLayout.jsx` |
| Matching | `src/matching/matchingEngine.js` |
| Mock / demo | `src/utils/mockDataService.js`, `src/utils/demoPortalMode.js` |
| Schema | `amplify/data/resource.ts` |
| Backend | `amplify/backend.ts` |
| Lambdas | `amplify/functions/*/handler.ts` |

---

# PART I — ONE-PAGE SUMMARY

**Built:** A full AWS-native beauty marketplace platform — admin ops, proprietary matching, three portals, onboarding, 15 Lambda scaffolds, demo mode, 6 months of founder-led development.

**Works today:** Demos (`/demo`), admin UI, matching math, mock E2E, partial DB writes, onboarding UI.

**Does not work end-to-end in prod yet:** Model sees sent match from real DB, payment capture, email notifications, Roman K/Scott published, domain live.

**To pilot (June 1):** ~2–4 weeks — deploy schema, auth fix, seed models, DNS, Stripe/SES minimum.

**To full v1:** ~3–4 months after pilot — automation, analytics, shop, chat, AI tagging.

**To run pilot:** ~**$80–180/month** all-in (AWS + light Stripe volume).

**To scale 10K users:** ~**$200–400/month** AWS-side.

---

*Related docs: `docs/INVESTOR_PARTNER_DECK_BRIEF.md`, `docs/LAUNCH_PLAN_JUNE_2026.md`, `docs/PRINT_HUB.md`, `docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md`*
