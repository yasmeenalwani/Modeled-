# Modeled Admin — Comprehensive Spec for MVP Tightening

**Purpose:** Handoff document for Claude/Perplexity to tighten admin flows for MVP.  
**Version:** 1.0  
**Last Updated:** March 2025

---

## 1. Admin Routes & Views

### Route configuration

Defined in `App.jsx` (lines ~321–369). Admin routes live under `/admin` with `AdminLayout` as the layout.

### Complete route list

| URL | Component | Purpose |
|-----|-----------|---------|
| `/admin` | AdminDashboard | Main dashboard, stats, recent activity |
| `/admin/trends` | AdminTrends | Trend analysis |
| `/admin/revenue` | AdminRevenue | Revenue tracking |
| `/admin/models` | AdminModels | Model directory – list, filter (all/active/pending/inactive), approve via modal |
| `/admin/professionals` | AdminProfessionals | Professional directory – same pattern |
| `/admin/salons` | AdminSalons | Salons / Partners |
| `/admin/requests` | AdminRequests | Request queue (ModelRequest) |
| `/admin/matching` | AdminMatchEngine | Match engine – run matching, review matches, approve |
| `/admin/match-approval` | AdminMatchApproval | Approve & send matches to models |
| `/admin/criteria` | AdminMatchCriteria | Match criteria docs |
| `/admin/bookings` | AdminBookings | All bookings |
| `/admin/calendar` | AdminCalendar | Calendar view |
| `/admin/waitlist` | AdminWaitlist | Waitlist |
| `/admin/services` | AdminServices | Service catalog |
| `/admin/packages` | AdminPackages | Packages & promos |
| `/admin/onboarding` | AdminOnboarding | Pro onboarding review |
| `/admin/training` | AdminTraining | Training program |
| `/admin/photos` | AdminPhotos | Photo gallery |
| `/admin/monitoring` | AdminMonitoring | Monitoring & security |
| `/admin/performance` | AdminPerformance | Performance metrics |
| `/admin/feedback` | AdminFeedback | Feedback |
| `/admin/campaigns` | AdminCampaigns | Campaigns |
| `/admin/crm` | AdminCRM | CRM & outreach |
| `/admin/crm/templates` | AdminCRMTemplates | CRM email templates |
| `/admin/crm/analytics` | AdminCRMAnalytics | CRM analytics |
| `/admin/crm/revenue` | AdminCRMRevenue | CRM revenue |
| `/admin/trips` | AdminTripManagement | Trip management |
| `/admin/trips/:id` | AdminTripDetail | Trip detail |
| `/admin/chat` | AdminChat | Chat management |
| `/admin/onboarding-analytics` | AdminOnboardingAnalytics | Onboarding analytics |
| `/admin/engagement-analytics` | AdminEngagementAnalytics | Engagement analytics |
| `/admin/conversion-analytics` | AdminConversionAnalytics | Conversion analytics |
| `/admin/database-test` | AdminDatabaseTest | Database test |
| `/admin/rds-test` | AdminRDSTest | RDS test |
| `/admin/role-model` | AdminRoleModel | ROLE Model (IMPACT program) |
| `/admin/role-model/applications` | AdminRoleModelApplications | 4th Chair applications |
| `/admin/role-model/professionals` | AdminRoleModelProfessionals | Pro applications |
| `/admin/role-model/matching` | AdminRoleModelMatching | Matching |
| `/admin/role-model/shop` | AdminRoleModelShop | Wear Care shop |
| `/admin/role-model/metrics` | AdminRoleModelMetrics | Impact metrics |
| `*` | PlaceholderPage | Unmatched admin routes |

### Nav-only routes (no route in App.jsx)

- `/admin/ai-analysis` → falls through to PlaceholderPage  
- `/admin/videos` → falls through to PlaceholderPage

### Admin nav sections (AdminLayout.jsx)

- **Overview:** Dashboard, Trend Analysis, Revenue Tracker  
- **People:** Models, Professionals, Salons/Partners  
- **Matching:** Request Queue, Match Engine, Match Approval, Match Criteria  
- **Bookings:** All Bookings, Calendar View, Waitlist  
- **Offerings:** Service Catalog, Packages & Promos  
- **Onboarding & Training:** Pro Onboarding, Training Program  
- **Media:** Photo Gallery, Video Library  
- **Sales & Growth:** CRM & Outreach, Trip Management, Campaigns  
- **Analytics:** Monitoring, Performance, Feedback, Chat, Onboarding/Engagement/Conversion Analytics  
- **Testing:** Database Tests, RDS Tests  
- **IMPACT:** ROLE Model, 4th Chair, Pro Applications, Matching, Shop, Metrics  

---

## 2. Roles & Auth

### Cognito groups

- `Admin` – full admin access  
- `Model`  
- `Professional`  
- `Partner`  

### Auth utilities (`src/utils/authUtils.js`)

- `getUserGroups()` – `cognito:groups`  
- `getUserType()` – Model / Professional / Partner / Admin (Admin highest priority)  
- `isAdmin()` – `groups.includes('Admin')`  
- `getRedirectPath()` – Admin → `/admin`  

### Current admin protection

- Admin routes are **not** wrapped in `ProtectedRoute`  
- Any authenticated user can hit `/admin`  
- Data access is enforced by Amplify `allow.group('Admin')` on most admin-only models  
- Non-admins will see empty/error states when API calls fail  

### PortalStatusGate (Model/Pro/Partner)

- Only applies to Model, Professional, Partner portals  
- Requires profile `status` in `['approved', 'active']`  
- Admin portal does **not** use it  

### Gap for MVP

Add `ProtectedRoute` with `allowedGroups: ['Admin']` around `/admin` routes. Admin entry is via direct `/admin`; EnterModeled offers Model/Pro/Partner only.

---

## 3. Data Models (Admin-accessible)

### Core models & auth

| Model | Auth | Admin use |
|-------|------|-----------|
| ModelProfile | allow.owner(), allow.group('Admin') | Models page, matching, booking |
| Professional | allow.owner(), allow.group('Admin') | Professionals page, request/matching |
| Partner | allow.owner(), allow.group('Admin') | Salons page |
| ModelRequest | allow.owner(), allow.group('Admin') | Request queue, match engine |
| Match | **allow.group('Admin') only** | Match engine, approval |
| Booking | allow.group('Admin') | Bookings, calendar |
| Service | allow.group('Admin') | Services catalog |
| Notification | allow.owner(), allow.group('Admin') | Chat/notifications |
| Conversation | ownerDefinedIn + Admin | Chat |
| Message | ownerDefinedIn + Admin | Chat |
| Prospect | allow.group('Admin') | CRM |
| OutreachCampaign | allow.group('Admin') | Campaigns |
| BusinessTrip, TripContact | allow.group('Admin') | Trips |
| Product, Order | allow.owner() + Admin | Wear Care shop |
| DailyQuestion, QuestionAnswer | allow.group('Admin') | Training |
| ModelToProChat, ModelToProMessage | ownerDefinedIn + Admin | Model–Pro chat |
| BeautyMaintenanceRoutine, InspirationPhoto | ownerDefinedIn + Admin | Model maintenance |

### Relationships

```
ModelRequest (professionalId) → Professional
Match (requestId, modelId) → ModelRequest, ModelProfile
Booking (matchId, requestId, modelId, professionalId) → Match, ModelRequest, ModelProfile, Professional
```

---

## 4. Automations (No Human Touch)

| Function | Trigger | Action |
|----------|---------|--------|
| **notifications** | Event/invocation | Create in-app Notification records, SES/SNS |
| **stripe-payment** | Stripe webhook | On success: create Booking, update Match |
| **booking-reminders** | EventBridge (scheduled) | 24h before appointment reminders |
| **match-expiration** | EventBridge (scheduled) | Expire old sent matches |
| **model-payment-reminders** | EventBridge | Payment reminders to models |
| **chat-activation** | EventBridge | 1h before appointment → activate ModelToProChat |
| **photo-analysis** | S3 trigger | Rekognition → update ModelProfile autoTaggedAttributes |
| **identity-verification** | Invoked | Rekognition identity check |
| **agentic-decay** | Scheduled | Decay agentic scores over time |
| **crm-outreach, crm-followups** | Invoked / scheduled | CRM email/SMS sequences |
| **pin-point-segments, pinpoint-campaigns** | Invoked | Pinpoint segmentation/campaigns |
| **auto-matching** | Event/invoked | Auto-matching (backend) |

### Matching engine (client-side)

- `src/matching/matchingEngine.js`  
- Exports: `findMatches`, `calculateMatchScore`, `AGENTIC_SCORES`, `SERVICE_WEIGHTS`, `MODEL_ATTRIBUTES`  
- Scoring: hair, location, availability, agentic scores  
- Used by: MatchEnginePage, MatchApprovalPage, matchingApi, autoMatching, matchService  

### Agentic scores

- `reliabilityScore`, `feedbackScore`, `experienceScore`, `engagementScore`, `compatibilityScore`  
- Updated via `updateScoresAfterBooking`  
- `agenticScores.js`, `agenticScoreCalculator.js`  

---

## 5. Human Touches (Admin Actions)

### Profile approvals

| Entity | Where | Action |
|--------|-------|--------|
| **Model** | `/admin/models` → ModelDetailModal | Change status: pending → approved/active |
| **Professional** | `/admin/professionals` → ProfessionalDetailModal | Change status: pending → approved/active |
| **Partner** | `/admin/salons` → PartnerDetailModal | Change status: pending → approved/active |

PortalStatusGate blocks portal access until `status` is `approved` or `active`.

### Request → Match flow

1. Pro creates Request → ModelRequest  
2. Admin at `/admin/requests` reviews → "Run Match Engine"  
3. Request `status` → `matching`  
4. Admin at `/admin/matching` runs engine, sees scored matches  
5. Admin selects models → "Approve" → Match records created (`status: approved`)  
6. Admin at `/admin/match-approval` → "Send to Models" → Match `status: sent`  
7. Notifications to models  
8. Model accepts/declines → Match `status: accepted` / `declined`  
9. Payment → Booking created (Stripe webhook or frontend)  

### Other admin actions

- Status changes for models, pros, partners (via modals)  
- CRM: prospect management, campaigns, outreach  
- Trips: create/manage trips and contacts  
- Service catalog: CRUD  
- Training: manage DailyQuestion  
- Chat: view conversations and messages  
- Wear Care: products, orders  

---

## 6. Data Collection

### Model onboarding (ModelOnboard.jsx)

- **Identity:** email, firstName, lastName, phone, locationZip  
- **Personality:** somethingFun, whatYouCareAbout, favoriteService, communityInterests  
- **Hair:** hairLength, hairColor, hairTexture, hairCondition, virginHair, allergies  
- **Beauty:** skinTone, skinToneSimple, faceShapeSimple, eyeColorSimple  
- **Services:** openToHaircut, openToColor, openToStyling, openToMakeup, openToNails, openToSkincare  
- **Availability:** availability JSON, willingToTravel, travelRadius  
- **Photos:** GuidedPhotoCapture, headshotUrl, photoUrls  
- **Identity verification:** ID, verification selfie  
- **Terms:** termsAccepted, termsAcceptedAt  
- **Acquisition:** howDidYouHear  

### Professional onboarding (ProfessionalOnboard.jsx)

- **Identity:** email, firstName, lastName, phone  
- **Professional:** specialties, experienceLevel, licenseNumber, yearsWorking, education  
- **Salon:** salonName, salonAddress, salonLat/Lng, locationZip, partnerId  
- **Portfolio:** portfolioItems with service labels  
- **Identity verification, terms, acquisition**  

### Partner onboarding (PartnerOnboard.jsx)

- **Business:** businessName, contactName, phone, address, businessType  
- **Acquisition, terms**  

### Request creation (Pro portal)

- serviceType, serviceDescription, desiredHair*, requestedDate, requestedTime, duration, location, budget  

### Match

- requestId, modelId, matchScore, scoreBreakdown, status, timestamps  

### Booking

- From Match + request; payment, feedback, afterPhotos  

---

## 7. Key Flows

### Model approval

1. Model completes onboarding → ModelProfile `status: pending`  
2. Admin at `/admin/models` → open model → set status `approved` or `active`  
3. PortalStatusGate allows access  

### Pro approval

1. Pro completes onboarding → Professional `status: pending`  
2. Admin at `/admin/professionals` → open pro → set status `approved` or `active`  
3. PortalStatusGate allows access  

### Match approval (full flow)

1. Pro creates Request → ModelRequest `status: pending`  
2. Admin at `/admin/requests` → "Run Match Engine" → Request `status: matching`  
3. Admin at `/admin/matching` → run engine → review matches → approve selected  
4. Matches created with `status: approved`  
5. Admin at `/admin/match-approval` → "Send to Models" → Match `status: sent`  
6. Notifications to models  
7. Model accepts → Match `status: accepted`, payment flow  
8. Payment success → Booking created  
9. Booking reminders (EventBridge), chat activation (1h before)  
10. Pro marks complete; feedback and photos collected  

### Request → Match → Booking (summary)

```
Pro creates Request → Admin reviews → Run Match Engine → Admin approves matches
→ Admin sends to models → Model accepts → Payment → Booking
→ Reminders → Chat → Session → Pro completes → Feedback
```

---

## 8. Mock vs Real Data

### `shouldUseMockData()` (mockDataService.js)

- Returns true if `VITE_USE_MOCK_DATA=true` or Amplify schema lacks `ModelProfile.list`  
- Mock data in `localStorage` under `modeled_mock_data`  

### Mock vs real by admin page

| Page | Mock source | Real source |
|------|-------------|-------------|
| ModelsPage | mockModels from matching/mockModels | ModelProfile |
| ProfessionalsPage | mockProfessionals | Professional |
| RequestsPage | mockDataService | ModelRequest |
| MatchEnginePage | mockDataService | ModelRequest, Match, ModelProfile |
| MatchApprovalPage | mockDataService | Match, ModelRequest, ModelProfile, Professional |
| BookingsPage | getBookingsForUser | Booking |
| Dashboard | matchingApi | ModelProfile, Professional, ModelRequest, Booking |
| OnboardingPage | mockProfessionals | Professional |

### Mock data contents (mockDataService.js)

- requests, matches, bookings, models, professionals, stylists, stylistRequests, stylistMatches  
- `autoCreateMatchesForRequest`, `createMockMatch`, `updateMockMatch`, etc.  

### Services using mock

- matchService, requestService, bookingService, profileService, createNotification, photoSubmission, agenticScores  

---

## 9. MVP Tightening Recommendations

### Auth & access

1. Add `ProtectedRoute` with `allowedGroups: ['Admin']` around `/admin` routes  
2. Add Admin option to EnterModeled (or direct Admin link) for Admin users  
3. Replace hardcoded "Yasmeen" in AdminLayout with real user info  

### Orphan nav items

4. Implement or remove `/admin/ai-analysis` and `/admin/videos`  

### Approval flows

5. Add clear, dedicated Model/Pro approval flows if status changes stay manual  
6. Ensure status changes in modals persist to DB (and are not mock-only)  

### Matching flow

7. Validate end-to-end: Request → Match Engine → Approve → Send → Model accepts → Payment → Booking  
8. Ensure match expiration, payment reminders, and chat activation schedules are correct  

### Stripe & payments

9. Confirm Stripe webhook: payment success → Booking creation + Match update  
10. Add pro card-on-file charge when model accepts (Phase 2)  

### Mock behavior

11. Clarify which admin pages work in mock mode vs show empty  
12. Document `VITE_USE_MOCK_DATA` behavior and switchover to real data  

### Data & schema

13. Ensure ModelProfile, Professional, Partner have `status` and required approval fields  
14. Ensure Match, Booking, ModelRequest have correct status enums and transitions  

---

## 10. File Reference

| Area | Files |
|------|-------|
| Routes | `App.jsx` |
| Admin layout | `admin/AdminLayout.jsx` |
| Auth | `utils/authUtils.js`, `components/PortalStatusGate.jsx`, `components/ProtectedRoute.jsx` |
| Matching | `matching/matchingEngine.js`, `utils/matchingApi.js`, `utils/matchService.js` |
| Mock | `utils/mockDataService.js` |
| Schema | `amplify/data/resource.ts` |
| Lambdas | `amplify/functions/*/` |

---

*Document generated for MVP tightening handoff. Use with Claude/Perplexity for implementation guidance.*
