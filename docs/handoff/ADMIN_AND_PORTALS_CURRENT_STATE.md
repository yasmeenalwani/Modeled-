**Primary routing file:** [`src/App.jsx`](../../src/App.jsx).  
**Auth groups (Cognito):** `Model`, `Professional`, `Partner`, `Admin` — see [`amplify/auth/resource.ts`](../../amplify/auth/resource.ts).

This document describes **what exists today**, how **access control** layers stack, and **gaps** (sidebar links without routes, beta gates, mock data). Attach this file to Claude when asking for audits, UX, security, or implementation plans.

---

## 1. Executive summary

| Area | State |
|------|--------|
| **Admin (“Command Center”)** | Large **dark-themed** sidebar app at `/admin`. **Cognito group `Admin` only** via `ProtectedRoute`; localhost dev often bypasses to allow access. Many pages are **lazy-loaded** React screens under `src/admin/pages/`. |
| **Professional portal** | `/portal/*` — ivory/cherry UI; **sidebar shows 5 items** (Pro Card, Matched, Looks, Education, Pro Shop). **More routes exist** in `App.jsx` than appear in the sidebar (calendar, chat, booked, demos, legacy paths). |
| **Model portal** | `/# Modeled frontend — Admin dashboard & portals: current state (handoff for Claude)

**Repo:** `modeled-frontend` (React 19 + Vite + React Router 7 + AWS Amplify Gen2 UI `Authenticator` + `aws-amplify` Data client).  
model-portal/*` — cherry-gradient sidebar; **sidebar shows 4 items** only (Model Card, Matched, Looks, Play). Comment in code: other areas **hidden for later roadmap** (sessions, chat, savings, calendar, etc. still routed in `App.jsx`). |
| **Partner portal** | `/partner-portal/*` — ivory/cherry; sidebar lists **dashboard + 9 sections** aligned with routes. |
| **Gating** | (A) **Global:** `Authenticator` wraps all non-public routes under `/*`. (B) **Private beta:** If user is **not** strict `Admin` and `VITE_FULL_APP_ACCESS` is not `true`, `AuthenticatedApp` shows **`PrivateBetaLaunch`** instead of any portal/admin routes — so **most signed-in users never see portal UI** in production config. (C) **Portals:** `PortalStatusGate` requires profile `status` in `['approved','active']` unless **mock data** or **`import.meta.env.DEV`** (then it lets everyone through). |
| **Onboarding** | Public-ish flows under `/onboard/*` and optional short `/waitlist/*`; `/join` defaults to **`/onboard/{role}`** for full applications. |

---

## 2. Technology & data

- **Client data access:** `generateClient()` from `aws-amplify/data` → AppSync GraphQL → DynamoDB models defined in [`amplify/data/resource.ts`](../../amplify/data/resource.ts) (`ModelProfile`, `Professional`, `Partner`, `Booking`, `Match`, etc.).
- **Storage:** Amplify Storage (S3) for photos/docs — see [`amplify/storage/resource.ts`](../../amplify/storage/resource.ts).
- **Auth UI:** `@aws-amplify/ui-react` `Authenticator` (email + `given_name`, `family_name`).
- **Lazy loading:** Admin and most portal page components are `React.lazy()` in `App.jsx` with a shared `Suspense` / `LoadingFallback`.

---

## 3. Route map (high level)

### Public (no `Authenticator` wrapper on the route tree leaf — some children use hooks)

| Path | Purpose |
|------|---------|
| `/` | Landing (`LandingPage` in `App.jsx`) |
| `/join` | Role picker → navigates to `/onboard/{role}` |
| `/enter` | “Enter Modeled” — portal role picker **or** private-beta message if not Admin / no full-app flag |
| `/thanks` | Post–short-waitlist thank you |
| `/waitlist/model`, `/waitlist/professional`, `/waitlist/partner` | Short forms (optional); each wrapped in its own `Authenticator` |
| `/onboard/model`, `/onboard/professional`, `/onboard/partner` | Full onboarding wizards |
| `/design/cherry-desk-mockups` | Design comparison page |

### Authenticated shell (`/*` → `Authenticator` → `AuthenticatedApp`)

**Important:** If `!VITE_FULL_APP_ACCESS && !useStrictAdmin().isAdmin`, the user **only** sees [`PrivateBetaLaunch`](../../src/components/PrivateBetaLaunch.jsx) — **no** portal routes. **Exception (local dev):** on `localhost` / `127.0.0.1`, if `VITE_DEV_ADMIN_BYPASS` is not `'false'`, the shell still renders when the URL is **`/admin` or `/admin/...`** so the same **ProtectedRoute** localhost admin bypass can apply inside `ProtectedRoute` (see `AuthenticatedApp` in `App.jsx`).

When gate passes (Admin **or** `VITE_FULL_APP_ACCESS=true`):

| Prefix | Layout | Notes |
|--------|--------|--------|
| `/portal` | `ProPortalLayout` | See §5 |
| `/model-portal` | `ModelPortalLayout` | See §6 |
| `/partner-portal` | `PartnerPortalLayout` | See §7 |
| `/admin` | `AdminLayout` inside `ProtectedRoute allowedGroups={['Admin']}` | See §4 |

`useStrictAdmin()` ([`ProtectedRoute.jsx`](../../src/components/ProtectedRoute.jsx)) checks **only** `cognito:groups` for `Admin` — **no** localhost bypass (unlike `useIsAdmin()` used elsewhere).

---

## 4. Admin dashboard (“Command Center”)

### 4.1 Access

- **URL:** `/admin` (and `/admin/...`).
- **Guard:** [`ProtectedRoute`](../../src/components/ProtectedRoute.jsx) with `allowedGroups={['Admin']}`, `redirectTo="/"`.
- **Dev behavior:** On `localhost` / `127.0.0.1`, `ProtectedRoute` can **bypass** for Admin routes when `VITE_DEV_ADMIN_BYPASS` is not `'false'` — see `ProtectedRoute` source.
- **Layout:** [`src/admin/AdminLayout.jsx`](../../src/admin/AdminLayout.jsx) — fixed **260px** dark sidebar (`#0d0d14`), `Inter` / Playfair styling, bottom **sign out** (Amplify `signOut`), static display name “Yasmeen” in user block (not wired to live Cognito profile).

### 4.2 Sidebar sections (from `navItems` in `AdminLayout.jsx`)

Sections: **Overview**, **People**, **Matching**, **Bookings**, **Offerings**, **Onboarding & Training**, **Media**, **Sales & Growth**, **Analytics**, **Testing**, **IMPACT** (ROLE Model subprogram).

### 4.3 Admin routes actually registered in `App.jsx`

These match many sidebar entries; **unmatched** sidebar links fall through to **`PlaceholderPage`** via `<Route path="*" element={<PlaceholderPage />} />` under `/admin`.

| Route | Lazy component (`src/admin/pages/`) |
|-------|--------------------------------------|
| `/admin` | `Dashboard` |
| `/admin/trends` | `TrendsPage` |
| `/admin/revenue` | `RevenuePage` |
| `/admin/models` | `ModelsPage` |
| `/admin/professionals` | `ProfessionalsPage` |
| `/admin/salons` | `SalonsPage` |
| `/admin/requests` | `RequestsPage` |
| `/admin/matching` | `MatchEnginePage` |
| `/admin/match-approval` | `MatchApprovalPage` |
| `/admin/criteria` | `MatchCriteriaPage` |
| `/admin/bookings` | `BookingsPage` |
| `/admin/calendar` | `CalendarPage` |
| `/admin/waitlist` | `WaitlistPage` (**booking waitlist**, not marketing waitlist) |
| `/admin/services` | `ServicesPage` |
| `/admin/packages` | `PackagesPage` |
| `/admin/onboarding` | `OnboardingPage` |
| `/admin/training` | `TrainingPage` |
| `/admin/photos` | `PhotosPage` |
| `/admin/monitoring` | `MonitoringPage` |
| `/admin/performance` | `PerformancePage` |
| `/admin/feedback` | `FeedbackPage` |
| `/admin/campaigns` | `CampaignsPage` |
| `/admin/crm` | `CRMPage` |
| `/admin/crm/templates` | `CRMEmailTemplates` |
| `/admin/crm/analytics` | `CRMAnalytics` |
| `/admin/crm/revenue` | `CRMRevenueRelationship` |
| `/admin/trips` | `TripManagementPage` |
| `/admin/trips/:id` | `TripDetailPage` |
| `/admin/chat` | `ChatManagementPage` |
| `/admin/onboarding-analytics` | `OnboardingAnalyticsPage` |
| `/admin/engagement-analytics` | `EngagementAnalyticsPage` |
| `/admin/conversion-analytics` | `ConversionAnalyticsPage` |
| `/admin/database-test` | `DatabaseTestPage` |
| `/admin/rds-test` | `RDSTestPage` |
| `/admin/role-model` | `RoleModelPage` |
| `/admin/role-model/applications` | `RoleModelApplicationsPage` |
| `/admin/role-model/professionals` | `RoleModelProfessionalsPage` |
| `/admin/role-model/matching` | `RoleModelMatchingPage` |
| `/admin/role-model/shop` | `RoleModelShopPage` |
| `/admin/role-model/metrics` | `RoleModelMetricsPage` |
| `/admin/*` (anything else) | `PlaceholderPage` |

### 4.4 Sidebar links **without** a matching `App.jsx` route (today)

These appear in `AdminLayout.jsx` `navItems` but **no** sibling `<Route>` in `App.jsx` was found — they will hit **`PlaceholderPage`** until implemented:

- `/admin/ai-analysis` (**AI Analysis Demo**)
- `/admin/videos` (**Video Library**)

### 4.5 Intended use of admin (for Claude)

- **Operational hub** for models/pros/partners/salons, matching pipeline, bookings, CRM, trips, ROLE Model program, analytics, and infra test pages.
- **Not** automatically aware of “marketing waitlist” vs full onboarding — acquisition filtering is usually by **Dynamo fields** (e.g. `status`, `adminNotes`) or manual review on **Models / Professionals / Salons** pages.

---

## 5. Professional portal (`/portal`)

### 5.1 Layout & UX

- **File:** [`src/portal/ProPortalLayout.jsx`](../../src/portal/ProPortalLayout.jsx).
- **Visual:** Ivory background, cherry accents, `Alike` / Georgia serif; **280px** fixed sidebar (drawer on `<768px`).
- **Extras:** `InactivityLogout` (30 min), `PortalStatusGate` with `userType="professional"`.

### 5.2 Sidebar navigation (visible items only)

| Label | Path |
|-------|------|
| Pro Card | `/portal/profile` |
| Matched | `/portal/matching` |
| Looks | `/portal/portfolio` |
| Education | `/portal/education` |
| Pro Shop | `/portal/shop` |

Comment in source: **Dashboard** (and related) **hidden for later roadmap**.

### 5.3 Additional routes in `App.jsx` (not all in sidebar)

Includes: `matching/create`, `matching/view/:requestId`, `calendar`, `booked`, portfolio inspo, **multiple booked/calendar design demos**, `profile-design-demo`, `chat` variants, `bookings/:bookingId/complete`, legacy `requests`, `request`, `analytics`, `earnings`, `schedule`, `training`, `gallery`, `feedback`, index redirect to **`/portal/profile`**.

### 5.4 Portal status gate (professional)

[`PortalStatusGate`](../../src/components/PortalStatusGate.jsx): loads `Professional` by `userId`; if `status` not in `approved`/`active`, shows **pending / wrong portal / no profile** messaging instead of children. **Bypass:** `shouldUseMockData()` **or** `import.meta.env.DEV` → treats as **`active`** (full access in local dev without approval).

---

## 6. Model portal (`/model-portal`)

### 6.1 Layout & UX

- **File:** [`src/portal/ModelPortalLayout.jsx`](../../src/portal/ModelPortalLayout.jsx).
- **Visual:** Pearl main area, **cherry gradient** sidebar; decorative fonts for brand; XP / level UI uses **hard-coded `currentUser` mock** (Seraphina Luna) — **not** fully wired to live `ModelProfile` in sidebar display.
- **Extras:** `PortalNotifications`, `NotificationBell`, `InactivityLogout`, `PortalStatusGate` `userType="model"`, `updateModelLastActive` on load.

### 6.2 Sidebar navigation (visible only)

| Label | Path |
|-------|------|
| Model Card | `/model-portal/profile` |
| Matched | `/model-portal/opportunities` |
| Looks | `/model-portal/photos` |
| Play | `/model-portal/games` |

Comment: **Dashboard, Education, Shop, Savings, Feedback, Calendar, Booked** hidden for later — but **`App.jsx` still defines routes** for `sessions`, `chat`, `role`, `calendar`, `savings`, `feedback` (deep links / future use).

### 6.3 Default route

- **`/model-portal`** index → `ModelProfile` (same as `/model-portal/profile` conceptually).

### 6.4 Portal status gate (model)

Same pattern as professional: **`approved` / `active`** required in prod-like mode; **dev + mock** bypass.

---

## 7. Partner portal (`/partner-portal`)

### 7.1 Layout & UX

- **File:** [`src/portal/PartnerPortalLayout.jsx`](../../src/portal/PartnerPortalLayout.jsx).
- **Visual:** Ivory/cherry aligned with pro portal; salon block in sidebar; mobile drawer.
- **Extras:** `InactivityLogout`, `PortalStatusGate` `userType="partner"`.

### 7.2 Sidebar navigation (matches routes closely)

| Label | Path |
|-------|------|
| Dashboard | `/partner-portal` |
| Salon Profile | `/partner-portal/profile` |
| Service Menu | `/partner-portal/services` |
| Compliance | `/partner-portal/compliance` |
| My Team | `/partner-portal/team` |
| My Schedule | `/partner-portal/schedule` |
| Campaigns | `/partner-portal/campaigns` |
| Model Conversions | `/partner-portal/conversions` |
| Financials | `/partner-portal/financials` |
| Support | `/partner-portal/support` |

`PartnerProfile` is **eager** imported in `App.jsx` (not lazy) — comment says temporarily for import error fix.

---

## 8. Cross-cutting behavior Claude should know

### 8.1 Private beta (`PrivateBetaLaunch`)

- **File:** [`src/components/PrivateBetaLaunch.jsx`](../../src/components/PrivateBetaLaunch.jsx).
- **When:** Non-Admin signed-in user and `VITE_FULL_APP_ACCESS` is not `'true'`.
- **Effect:** User **cannot** reach `/admin` or any portal layout through normal navigation — they only see beta messaging. **Admin** users (strict Cognito group) see the full `AuthenticatedApp` route tree.

### 8.2 `EnterModeled` (`/enter`)

- Uses **`useStrictAdmin`** + `VITE_FULL_APP_ACCESS` to decide if role cards (model/pro/partner/admin) appear or a **“portals in private beta”** screen with CTA back to `/join`.

### 8.3 Error boundary

- Root [`ErrorBoundary`](../../src/components/ErrorBoundary.jsx) wraps the router (`showDetails={true}`).

### 8.4 Documentation elsewhere in repo

- Admin / ops specs: `docs/admin/*.md`
- Deployment: `docs/deployment/MODELEDMGMT_WWW_GO_LIVE_STEPS.md`, SES guides under `docs/deployment/*SES*`
- Waitlist QA: `docs/handoff/WAITLIST_QA_CLAUDE_HANDOFF.md`

---

## 9. Known gaps / inconsistencies (good Claude prompts)

1. **Admin sidebar** links **`/admin/ai-analysis`** and **`/admin/videos`** — **no routes** → placeholder until implemented or removed from nav.
2. **Model portal sidebar** mock user vs real **`ModelProfile`** data.
3. **Private beta** hides **all** portals for non-Admins — intentional for launch, but **post–full onboarding** redirect to `/model-portal` can confuse applicants (they may only see beta after saving data).
4. **`PortalStatusGate`** dev bypass means **local testing ≠ production** approval flows.
5. **Many portal pages** are large single-file UIs; completeness vs mock data varies by page — treat each route as potentially partial MVP when auditing.

---

## 10. Suggested “attach to Claude” one-liner

> Read `docs/handoff/ADMIN_AND_PORTALS_CURRENT_STATE.md` and `src/App.jsx`. Assume AWS Amplify Gen2 backend. Help me [audit security / prioritize nav fixes / map data dependencies / compare to Figma] for the admin dashboard and the three portals.

---

*Generated from repository structure and key source files. Update when routes or gates change.*
