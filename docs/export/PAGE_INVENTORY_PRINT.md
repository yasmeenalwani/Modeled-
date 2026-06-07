# Modeled — Full Page Inventory (print / PDF)

**Use this doc to print a route map of every admin screen, portal screen, and public flow.**  
**Base URL (local dev):** `http://localhost:80` — replace with `https://www.modeledmgmt.com` in production.

---

## How to print (pick one)

### Option A — Print this inventory (fastest)

1. Open this file in VS Code/Cursor.
2. **Markdown: Open Preview** (Ctrl+Shift+V).
3. **Print** (Ctrl+P) → Save as PDF or send to printer.

You get a **checklist of every URL** with built vs scaffolded notes — not screenshots.

### Option B — Print actual UI screens (browser)

1. Run `npm run dev` → open `http://localhost:80`.
2. **Admin:** go to `http://localhost:80/admin` (no login on localhost in dev).
3. **Demo portals (no login):** use `/demo`, `/demo/seraphina/...`, `/demo/sarah/...`, `/demo/partner`.
4. On each page: **Ctrl+P** → “Save as PDF” or print.
5. Work through the checklists in §3–§6 below.

### Option C — Attach to Claude for a “screen deck”

Paste this file + ask: *“Generate a one-page table per section with URL, status, and 1-line purpose.”*

**Related docs:** `docs/handoff/ADMIN_AND_PORTALS_CURRENT_STATE.md` (gates & gaps), `docs/TECH_ARCHITECTURE_AND_BUILD_STATUS.md` (built vs scaffolded features).

---

## Status legend

| Status | Meaning |
|--------|---------|
| **Built** | Real page component; usable UI (may still use mock data) |
| **Scaffold** | UI exists; mock data, partial backend, or not launch-critical |
| **Placeholder** | Sidebar link exists but route hits `PlaceholderPage` |
| **Design demo** | Exploration UI only — not product |
| **Public** | No portal login required |

---

## 1. Admin dashboard (`/admin`)

**Access:** Cognito group `Admin` in prod; **localhost dev** = open `/admin` without login.  
**Nav source:** `src/admin/AdminLayout.jsx` · **Routes:** `src/admin/adminRoutes.jsx`

| # | Sidebar label | URL path | Component | Status |
|---|---------------|----------|-----------|--------|
| 1 | Dashboard | `/admin` | Dashboard.jsx | Built |
| 2 | Trend Analysis | `/admin/trends` | TrendsPage.jsx | Scaffold (RDS/analytics) |
| 3 | Revenue Tracker | `/admin/revenue` | RevenuePage.jsx | Scaffold |
| 4 | Models | `/admin/models` | ModelsPage.jsx | Built |
| 5 | Professionals | `/admin/professionals` | ProfessionalsPage.jsx | Built |
| 6 | Salons / Partners | `/admin/salons` | SalonsPage.jsx | Built |
| 7 | Request Queue | `/admin/requests` | RequestsPage.jsx | Built |
| 8 | Match Engine | `/admin/matching` | MatchEnginePage.jsx | Built |
| 9 | Match Approval | `/admin/match-approval` | MatchApprovalPage.jsx | Built |
| 10 | Match Criteria | `/admin/criteria` | MatchCriteriaPage.jsx | Built |
| 11 | AI Analysis Demo | `/admin/ai-analysis` | PlaceholderPage | **Placeholder** |
| 12 | All Bookings | `/admin/bookings` | BookingsPage.jsx | Built |
| 13 | Calendar View | `/admin/calendar` | CalendarPage.jsx | Built |
| 14 | Waitlist | `/admin/waitlist` | WaitlistPage.jsx | Built (booking waitlist) |
| 15 | Service Catalog | `/admin/services` | ServicesPage.jsx | Built |
| 16 | Packages & Promos | `/admin/packages` | PackagesPage.jsx | Built (mock packages) |
| 17 | Review Queue | `/admin/onboarding` | OnboardingPage.jsx | Built |
| 18 | Training Program | `/admin/training` | TrainingPage.jsx | Built (curriculum shell) |
| 19 | Photo Gallery | `/admin/photos` | PhotosPage.jsx | Built |
| 20 | Video Library | `/admin/videos` | PlaceholderPage | **Placeholder** |
| 21 | CRM & Outreach | `/admin/crm` | CRMPage.jsx (+ Pricing Calculator tab) | Built / CRM email scaffold |
| 22 | Trip Management | `/admin/trips` | TripManagementPage.jsx | Scaffold |
| 23 | Campaigns | `/admin/campaigns` | CampaignsPage.jsx | Scaffold |
| 24 | Monitoring & Security | `/admin/monitoring` | MonitoringPage.jsx | Built |
| 25 | Performance | `/admin/performance` | PerformancePage.jsx | Built |
| 26 | Feedback | `/admin/feedback` | FeedbackPage.jsx | Built |
| 27 | Chat Management | `/admin/chat` | ChatManagementPage.jsx | Scaffold |
| 28 | Onboarding Analytics | `/admin/onboarding-analytics` | OnboardingAnalyticsPage.jsx | Built |
| 29 | Engagement Analytics | `/admin/engagement-analytics` | EngagementAnalyticsPage.jsx | Built |
| 30 | Conversion Analytics | `/admin/conversion-analytics` | ConversionAnalyticsPage.jsx | Built |
| 31 | Database Tests | `/admin/database-test` | DatabaseTestPage.jsx | Dev / test |
| 32 | RDS Tests | `/admin/rds-test` | RDSTestPage.jsx | Dev / test |
| 33 | ROLE Model | `/admin/role-model` | RoleModelPage.jsx | Scaffold (sub-program) |
| 34 | 4th Chair Applications | `/admin/role-model/applications` | RoleModelApplicationsPage.jsx | Scaffold |
| 35 | Pro Applications | `/admin/role-model/professionals` | RoleModelProfessionalsPage.jsx | Scaffold |
| 36 | ROLE Matching | `/admin/role-model/matching` | RoleModelMatchingPage.jsx | Scaffold |
| 37 | Wear Care Shop | `/admin/role-model/shop` | RoleModelShopPage.jsx | Scaffold |
| 38 | Impact Metrics | `/admin/role-model/metrics` | RoleModelMetricsPage.jsx | Scaffold |

**CRM sub-routes (tabs / nested):**

| URL | Component | Status |
|-----|-----------|--------|
| `/admin/crm` | CRMPage (main + Pricing Calculator tab) | Built |
| `/admin/crm/templates` | CRMEmailTemplates.jsx | Scaffold |
| `/admin/crm/analytics` | CRMAnalytics.jsx | Scaffold |
| `/admin/crm/revenue` | CRMRevenueRelationship.jsx | Scaffold |
| `/admin/trips/:id` | TripDetailPage.jsx | Scaffold |

**Admin print checklist (localhost):**

```
[ ] http://localhost:80/admin
[ ] http://localhost:80/admin/models
[ ] http://localhost:80/admin/professionals
[ ] http://localhost:80/admin/salons
[ ] http://localhost:80/admin/requests
[ ] http://localhost:80/admin/matching
[ ] http://localhost:80/admin/match-approval
[ ] http://localhost:80/admin/criteria
[ ] http://localhost:80/admin/bookings
[ ] http://localhost:80/admin/services
[ ] http://localhost:80/admin/onboarding
[ ] http://localhost:80/admin/crm
... (continue from table above)
```

---

## 2. Professional portal (`/portal`)

**Access:** Sign in + `VITE_FULL_APP_ACCESS=true` (or Admin) in prod; dev often bypasses approval.  
**Sidebar shows 5 items; many more routes exist in `App.jsx`.**

### In sidebar (product-facing)

| # | Label | URL | Status |
|---|-------|-----|--------|
| 1 | Pro Card | `/portal/profile` | Built |
| 2 | Matched | `/portal/matching` | Built |
| 3 | Looks | `/portal/portfolio` | Built |
| 4 | Education | `/portal/education` | Scaffold (content shell) |
| 5 | Pro Shop | `/portal/shop` | Scaffold (Stripe not live) |

### Routed but hidden from sidebar (still printable)

| URL | Purpose | Status |
|-----|---------|--------|
| `/portal/matching/create` | Create model request | Built |
| `/portal/matching/view/:requestId` | View matches for request | Built |
| `/portal/calendar` | Calendar | Built |
| `/portal/booked` | Booked sessions | Built |
| `/portal/portfolio/inspo` | Inspiration gallery | Built |
| `/portal/chat` | Chat | Scaffold |
| `/portal/bookings/:bookingId/complete` | Complete booking / training form | Built |
| `/portal/requests` | Legacy request dashboard | Built |
| `/portal/analytics` | Dashboard (legacy) | Built |
| `/portal/earnings` | Earnings view | Built |
| `/portal/schedule` | → calendar alias | Built |
| `/portal/training` | Training (alias) | Scaffold |
| `/portal/gallery` | Gallery | Built |
| `/portal/feedback` | Feedback | Built |

### Design demos only (do not treat as launch UI)

| URL | Status |
|-----|--------|
| `/portal/booked-design-demo` | Design demo |
| `/portal/booked-calendar-demo` | Design demo |
| `/portal/booked-calendar-views` | Design demo |
| `/portal/booked-calendar-refined` | Design demo |
| `/portal/booked-calendar-google` | Design demo |
| `/portal/profile-design-demo` | Design demo |

**Demo pro (no login):** `http://localhost:80/demo/sarah/profile` (+ matching, portfolio, calendar, education, shop, chat)

---

## 3. Model portal (`/model-portal`)

**Sidebar shows 4 items; extra routes exist for roadmap.**

### In sidebar

| # | Label | URL | Status |
|---|-------|-----|--------|
| 1 | Model Card | `/model-portal/profile` | Built |
| 2 | Matched | `/model-portal/opportunities` | Built |
| 3 | Looks | `/model-portal/photos` | Built |
| 4 | Play | `/model-portal/games` | Scaffold |

### Hidden from sidebar (routed)

| URL | Purpose | Status |
|-----|---------|--------|
| `/model-portal/sessions` | Session history | Built (mock-heavy) |
| `/model-portal/chat` | Chat | Scaffold |
| `/model-portal/calendar` | Calendar | Built |
| `/model-portal/savings` | Savings tracker | Scaffold |
| `/model-portal/feedback` | Feedback | Built |
| `/model-portal/role` | Role / XP | Built |

**Demo model (no login):** `http://localhost:80/demo/seraphina/profile` (+ opportunities, photos, games, chat, calendar, sessions)

---

## 4. Partner portal (`/partner-portal`)

**Sidebar aligns with routes.**

| # | Label | URL | Status |
|---|-------|-----|--------|
| 1 | Dashboard | `/partner-portal` | Built |
| 2 | Salon Profile | `/partner-portal/profile` | Built |
| 3 | Service Menu | `/partner-portal/services` | Built |
| 4 | Compliance | `/partner-portal/compliance` | Built |
| 5 | My Team | `/partner-portal/team` | Built |
| 6 | My Schedule | `/partner-portal/schedule` | Built |
| 7 | Campaigns | `/partner-portal/campaigns` | Scaffold (mock metrics) |
| 8 | Model Conversions | `/partner-portal/conversions` | Scaffold |
| 9 | Financials | `/partner-portal/financials` | Scaffold |
| 10 | Support | `/partner-portal/support` | Built |

**Demo partner (no login):** `http://localhost:80/demo/partner`

---

## 5. Public, onboarding & acquisition

| URL | Page | Status |
|-----|------|--------|
| `/` | Landing | Public |
| `/join` | Role picker | Public |
| `/enter` | Portal entry / beta gate | Public |
| `/thanks` | Waitlist thanks | Public |
| `/design/cherry-desk-mockups` | Design comparison | Public |
| `/demo` | Demo hub | Public |
| `/waitlist/model` | Short model waitlist | Public (+ auth wrapper) |
| `/waitlist/professional` | Short pro waitlist | Public (+ auth wrapper) |
| `/waitlist/partner` | Short partner waitlist | Public (+ auth wrapper) |
| `/onboard/model` | Full model onboard | Built |
| `/onboard/professional` | Full pro onboard | Built |
| `/onboard/partner` | Full partner onboard | Built |

**Redirects:** `/joinmodel`, `/apply/model`, `/joinpro`, `/joinpartner` → `/join?role=...`

---

## 6. App-wide scaffolded systems (not a single page)

These span multiple pages — listed in `docs/TECH_ARCHITECTURE_AND_BUILD_STATUS.md` Part B:

| System | Primary surfaces |
|--------|------------------|
| Auto-matching Lambda | Admin matching (manual at launch) |
| Agentic ranking weights | Match engine (weight = 0) |
| Stripe / model card on file | Model opportunities, booking accept |
| SES / CRM email | Admin CRM |
| Pinpoint campaigns | Admin campaigns |
| Chat activation | Portal chat + admin chat |
| Pro shop commerce | `/portal/shop` |
| Photo AI auto-tag | Onboard + admin photos |
| RDS live analytics | `/admin/trends`, `/admin/revenue` |

---

## 7. Suggested print binders

| Binder | Contents |
|--------|----------|
| **A — Admin ops** | §1 checklist PDFs + `ONE_PAGER_SOURCE_SERVICE_TRAINING_PRICING.md` |
| **B — Portals** | §2–4 demo URLs printed + `ADMIN_AND_PORTALS_CURRENT_STATE.md` |
| **C — Investor** | §5 public/demo + `INVESTOR_PARTNER_DECK_BRIEF.md` + architecture rollup |

---

## 8. Quick counts

| Area | Routes in nav / App | Placeholder | Design-only |
|------|---------------------|-------------|-------------|
| Admin | 38 sidebar + CRM/trip nested | 2 | 0 |
| Pro portal | 5 sidebar + ~15 extra | 0 | 6 demos |
| Model portal | 4 sidebar + 6 extra | 0 | 0 |
| Partner portal | 10 | 0 | 0 |
| Public + demo + onboard | 15+ | 0 | 1 design page |

---

*Generated from `src/App.jsx`, `src/admin/adminRoutes.jsx`, `src/admin/AdminLayout.jsx`. Update when routes change.*
