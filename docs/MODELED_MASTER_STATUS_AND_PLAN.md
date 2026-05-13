# MODELED — Master Status, Architecture & Launch Plan
**Generated:** March 2026  
**Purpose:** Complete picture of what was built, what's left, and exactly what to do in the next 5 hours and before April 1.

---

## What Modeled Is (The Pitch, In One Paragraph)

Modeled is a **matchmaking machine** for the beauty industry. Stylists (professionals) submit a request for the type of hair and service they want to practice. The platform algorithmically matches them to a model with that exact hair profile. The model gets free services. The stylist gets real practice. Modeled takes a fee from both sides. Every step — onboarding, matching, booking, payment, reminders, session completion, feedback — is designed to require zero manual coordination. The admin approves early; eventually even that is automated.

---

## 1. Architecture

```
React (Vite) → AWS Amplify Hosting (CloudFront + S3)
                      ↓
              AWS AppSync (GraphQL)
          ┌────────────────────────┐
          ↓         ↓        ↓     ↓
       DynamoDB    S3     Lambda  Cognito
       (core data) (photos) (automation) (auth + roles)
          ↓                  ↓
       RDS PostgreSQL    Rekognition + Bedrock
       (analytics)       (photo analysis + AI)
                              ↓
                     Stripe (payments)
                     SES/SNS (emails/SMS)
                     EventBridge (scheduling)
                     Pinpoint (campaigns)
```

### Data Models (DynamoDB via AppSync)
| Model | Purpose |
|---|---|
| ModelProfile | Model identity, hair attributes, agentic scores, photos |
| Professional | Stylist identity, salon, specialties, portfolio |
| Partner | Salon/studio partner |
| ModelRequest | Stylist's service request (what hair they need) |
| Match | Algorithmic match between request + model (scored) |
| Booking | Confirmed appointment from accepted match |
| Notification | In-app + email/SMS triggers |
| Conversation / Message | Chat between model and pro |
| ModelToProChat | 1:1 chat activated 1hr before appointment |
| Service | Service catalog with fees |
| Product / Order | Wear Care shop |
| Prospect | CRM |
| BusinessTrip | Sales trip management |

### Auth (Cognito)
Roles: `Admin`, `Model`, `Professional`, `Partner`  
Entry: `/join` → onboarding, `/enter` → portal

---

## 2. What Has Been Built

### Frontend (React)
| Area | Status |
|---|---|
| Landing page | Done |
| Join flow (role selection) | Done |
| Model onboarding (multi-step) | Done |
| Professional onboarding (multi-step) | Done |
| Partner onboarding (inquiry) | Done |
| Model portal (profile, photos, sessions, calendar, chat, savings, games) | Done |
| Professional portal (profile, matching, requests, portfolio, calendar, booked, chat, training, shop) | Done |
| Partner portal (dashboard, financials, roster, calendar) | Done (partial) |
| Admin panel (30+ routes: models, pros, requests, matching, bookings, CRM, calendar, analytics) | Done |
| Model card / pro card UI | Done |
| Matching engine (client-side scoring) | Done |
| Request creation (luxury multi-step) | Done |
| Booking system frontend | Done |
| Agentic scoring system | Done |
| Identity verification (Rekognition) | Done |
| Photo upload + S3 | Done |
| Stripe integration (frontend) | Done |
| Calendar exports (Google, Outlook, ICS) | Done |
| Mock data layer (full demo mode) | Done |

### Backend (AWS / Amplify)
| Area | Status |
|---|---|
| Amplify Gen2 project | Done |
| AppSync schema (1300+ lines) | Done |
| Cognito auth (4 groups, custom attrs) | Done |
| DynamoDB tables (all models) | Done |
| S3 storage (profiles, portfolios, sessions) | Done |
| Lambda functions scaffolded | Done (need wiring) |
| RDS PostgreSQL (analytics) | Setup done |
| SES (email) | Setup done |
| EventBridge (scheduling) | Scaffolded |
| Stripe webhooks | Scaffolded |
| Rekognition (photo analysis) | Scaffolded |
| Bedrock | Scaffolded |

---

## 3. Estimated Build Time & Cost

| Phase | Description | Est. Hours |
|---|---|---|
| Phase 0 | Architecture decisions, schema design, Amplify setup | ~20 hrs |
| Phase 1 | Onboarding flows (model, pro, partner) | ~30 hrs |
| Phase 2 | Admin panel (all pages, matching engine) | ~40 hrs |
| Phase 3 | Model portal (all pages, calendar, chat) | ~30 hrs |
| Phase 4 | Pro portal (all pages, requests, bookings) | ~30 hrs |
| Phase 5 | Booking system, payment flow, notifications | ~20 hrs |
| Phase 6 | Agentic scoring, identity verification | ~15 hrs |
| Phase 7 | Photo analysis, S3 triggers | ~10 hrs |
| Phase 8 | UI polish, brand alignment, design system | ~20 hrs |
| Phase 9 | Mock data layer, demo polish | ~10 hrs |
| **Total estimated** | | **~225 hrs** |

### AWS Monthly Cost (MVP scale — 5–50 users)
| Service | Est. Monthly |
|---|---|
| Amplify Hosting | ~$8 |
| AppSync (GraphQL) | ~$5 |
| DynamoDB | ~$5 |
| S3 (photos) | ~$5 |
| Lambda | ~$2 |
| Cognito | Free (under 50k MAU) |
| RDS PostgreSQL (t3.micro) | ~$15 |
| SES (emails) | ~$1 |
| Rekognition | ~$5 |
| EventBridge | ~$1 |
| CloudWatch | ~$2 |
| **Total MVP** | **~$50/month** |

### Stripe Costs (per booking)
- 2.9% + $0.30 per transaction  
- At $50 avg booking fee: ~$1.75 per booking  
- At 100 bookings/mo: ~$175/mo to Stripe

---

## 4. Remaining Tasks — Prioritized

### CRITICAL — Must be done before any real user touches the product

| # | Task | Priority | Est. Time | Notes |
|---|---|---|---|---|
| 1 | Wire Stripe live keys (publishable + secret) | CRITICAL | 30 min | Already know how — just need to set env vars |
| 2 | Confirm onboarding saves to real DynamoDB | CRITICAL | 2 hrs | Test Model + Pro onboarding end-to-end |
| 3 | Admin can approve model/pro (status change hits DB) | CRITICAL | 1 hr | Test in admin panel, verify DynamoDB |
| 4 | PortalStatusGate works with real profiles | CRITICAL | 1 hr | After #2 is done |
| 5 | Pro can create a request (saved to ModelRequest) | CRITICAL | 1 hr | Test in pro portal |
| 6 | Admin match engine runs on real data | CRITICAL | 2 hrs | Match engine reads real ModelProfile + ModelRequest |
| 7 | Admin can send match to model (Match record created) | CRITICAL | 1 hr | Match status: sent → model sees opportunity |
| 8 | Model can accept match (Match status: accepted) | CRITICAL | 1 hr | Model opportunities page |
| 9 | Payment → Booking creation | CRITICAL | 2 hrs | Stripe webhook OR frontend trigger |
| 10 | Model + Pro see their bookings | CRITICAL | 1 hr | After booking is created |

**Total critical: ~13 hours** — split across 3 focused sessions

### HIGH — Needed for a solid April 1 launch

| # | Task | Priority | Est. Time | Notes |
|---|---|---|---|---|
| 11 | Email notifications (SES) on match sent / booking confirmed | HIGH | 2 hrs | SES already set up |
| 12 | Auth redirect: login → correct portal | HIGH | 1 hr | EnterModeled role routing |
| 13 | Protected admin route (only Admin group) | HIGH | 30 min | Add ProtectedRoute to /admin |
| 14 | Mock data → real data (flip switch) | HIGH | 1 hr | Set VITE_USE_MOCK_DATA=false, test everything |
| 15 | Photo upload works in real mode (S3 keys stored) | HIGH | 1 hr | Verify S3 path generation |
| 16 | Stripe payment confirmation → booking status update | HIGH | 2 hrs | Webhook handler |
| 17 | Session reminders (EventBridge — 24hr before) | HIGH | 2 hrs | Lambda + EventBridge rule |
| 18 | Chat activation 1hr before appointment | HIGH | 2 hrs | EventBridge + Lambda |

**Total high: ~12 hours**

### MEDIUM — Important but not blocking launch

| # | Task | Priority | Est. Time | Notes |
|---|---|---|---|---|
| 19 | Rekognition photo analysis pipeline (S3 trigger → Lambda → update ModelProfile) | MEDIUM | 3 hrs | Auto-tag hair attributes |
| 20 | Booking completion flow (pro marks complete, feedback collected) | MEDIUM | 2 hrs | Booking status: completed |
| 21 | Model savings page (real earnings data) | MEDIUM | 1 hr | Connect to real bookings |
| 22 | Agentic scores update after booking | MEDIUM | 2 hrs | Score update Lambda |
| 23 | Partner portal real data | MEDIUM | 3 hrs | Not critical for first cohort |
| 24 | Admin CRM live (prospect management) | MEDIUM | 2 hrs | For outreach |
| 25 | Mobile responsiveness audit | MEDIUM | 3 hrs | Models may be on mobile |

**Total medium: ~16 hours**

### LOW — Phase 2 / Post-launch

| # | Task | Priority | Est. Time | Notes |
|---|---|---|---|---|
| 26 | Real-time chat (AppSync subscriptions) | LOW | 5 hrs | Currently mock |
| 27 | Advanced analytics (RDS PostgreSQL) | LOW | 5 hrs | Admin insights |
| 28 | Auto-matching (backend Lambda, no admin needed) | LOW | 4 hrs | Phase 2 automation |
| 29 | Pinpoint campaigns (email/SMS sequences) | LOW | 3 hrs | Marketing automation |
| 30 | Video library admin | LOW | 2 hrs | Training videos |
| 31 | Wear Care shop (Stripe checkout) | LOW | 3 hrs | |
| 32 | 4th Chair / ROLE Model application flow | LOW | 3 hrs | IMPACT program |
| 33 | Gamification / badges | LOW | 4 hrs | Engagement feature |

---

## 5. Your Next 5 Hours — Right Now

In priority order:

| Hour | Task | What to Do |
|---|---|---|
| Hour 1 | Stripe keys | Set `VITE_STRIPE_PUBLISHABLE_KEY` in Amplify console + add secret key to Lambda env. Test checkout. |
| Hour 2 | Test onboarding → DB | Sign up as model → complete onboarding → check DynamoDB in AWS console. Fix any save errors. |
| Hour 2 | Test onboarding → DB | Sign up as pro → complete onboarding → check DynamoDB. |
| Hour 3 | Admin approval → portal access | Approve the model + pro in admin. Try logging in as each. Verify PortalStatusGate passes. |
| Hour 4 | Request → Match → Send | Pro creates request → admin runs match engine → admin sends match → check model sees it. |
| Hour 5 | Mock → Real flip | Set VITE_USE_MOCK_DATA=false. Walk every page. Note what breaks. Fix the critical ones. |

### What happens when you flip mock → real?
Nothing goes blank if the DB has data. Here's the truth:
- Pages that already have real data → show real data (good)
- Pages with no real data yet → show empty state (fine — you just need to add one real user)
- The mock data in localStorage stays there but gets ignored once `shouldUseMockData()` returns false
- **Recommendation:** Keep one demo admin account with mock data on, and test real data on a separate account. Then flip it for launch.

---

## 6. The Agentic Team (Verifier, Matchmaker, Concierge)

This is your AI layer — three agents that run behind the scenes.

### Verifier
**What it does:** Validates every profile before it enters the matching pool.
- Checks model photos are real hair (not AI-generated, not stock)
- Confirms pro license number format is valid
- Runs Rekognition identity check (face match between ID + selfie)
- Tags hair attributes automatically (length, color, texture, condition)
- Outputs: `identityVerified: true/false`, `autoTaggedAttributes: {}`, confidence scores

**AWS services:** Rekognition, Lambda, S3 trigger  
**Status:** Scaffolded — needs S3 trigger wiring and Lambda logic completion  
**What to tell AWS SA:** "We need an S3 trigger on profile photo upload → Lambda → Rekognition → write results back to DynamoDB. Can you help us confirm the IAM permissions and the async write-back pattern?"

### Matchmaker
**What it does:** Scores every model against a request, ranked by fit.
- Hair scoring (length match, color match, texture, condition)
- Location scoring (ZIP-based radius with haversine distance)
- Availability scoring (requested date vs model calendar)
- Agentic scoring (reliability, feedback, experience, compatibility)
- Outputs a ranked list of models with score breakdown per dimension

**AWS services:** Lambda (for backend version), AppSync (query), DynamoDB  
**Status:** Full client-side engine exists (`matchingEngine.js`). Needs to move to Lambda for production.  
**What to tell AWS SA:** "We have our scoring algorithm in JavaScript. We want to run it as a Lambda invoked by an AppSync resolver or Step Function. What's the cleanest pattern for returning a ranked list back to the admin UI?"

### Concierge
**What it does:** Handles all the time-based coordination so no human has to.
- 24 hours before appointment: send reminder to model + pro
- 1 hour before: activate the ModelToProChat channel
- Match expiration: if model doesn't respond in 48hr, auto-decline and move to waitlist
- Payment reminders: if model hasn't paid deposit, send nudge
- Post-session: request feedback from both sides, unlock next booking

**AWS services:** EventBridge (scheduler), Lambda, SES, SNS, AppSync  
**Status:** Scaffolded — EventBridge rules need to be wired to specific Lambda handlers  
**What to tell AWS SA:** "We're using EventBridge Scheduler to fire reminders based on booking timestamps. Is it better to create individual scheduled events per booking, or use a rule that queries upcoming bookings every 30 minutes? What's the cost difference at scale?"

---

## 7. AWS Technical Solutions Meeting — March 11

### Agenda Suggestions

1. **Confirm architecture is correct** — Ask them to review your AppSync + DynamoDB + Lambda pattern and tell you if anything is wrong for your scale target.

2. **S3 trigger → Rekognition pipeline** — "We upload photos to S3. We want Lambda to fire, send to Rekognition, and write attributes back to DynamoDB. Can you walk us through the IAM role and async pattern?"

3. **EventBridge Scheduler vs EventBridge Rules** — "We need per-booking reminders (variable times). Scheduler creates one schedule per booking. Rules query all bookings on a cron. Which should we use at 1,000 bookings/month? 10,000?"

4. **Stripe webhook → AppSync mutation** — "Stripe hits an API endpoint on payment success. We want that to trigger a booking creation in DynamoDB via AppSync. Is Lambda → AppSync mutation the right pattern or should we write directly to DynamoDB?"

5. **Cost optimization** — "At 100 users (50 models, 50 pros) with ~200 bookings/month, what's our realistic AWS bill? What's it at 1,000 bookings?"

6. **Step Functions for the match flow** — "Our match flow has 6 steps: Request → Match Engine → Approve → Send → Accept → Book. Should we use Step Functions to orchestrate this, or is Lambda chaining fine?"

7. **WAF / Security** — "What's the minimum security setup for HIPAA-adjacent data (identity photos, personal info)?" (Not HIPAA but you handle sensitive data.)

### Smart Questions to Ask (That Make You Sound Like You Know What You're Doing)

- "What's your recommended pattern for fan-out notifications — SNS to SES and SES direct to model, or Pinpoint for everything?"
- "We're using Amplify Gen2. Is there anything you'd warn us about moving to production vs a custom CDK stack?"
- "What CloudWatch alarms should we have in place for day one of real users?"
- "We want eventual auto-matching — the Matchmaker running in the background. Is Step Functions or just Lambda + EventBridge the better choice for a workflow that could take hours?"
- "How do we handle Rekognition confidence thresholds? If a photo scores 80% on face match, do we auto-approve or flag for manual review?"

---

## 8. Modeled as a Matchmaking Machine — The Core Loop

```
PROFESSIONAL                    MODELED                         MODEL
     │                             │                              │
     │── Submit Request ──────────►│                              │
     │   (service, hair needed,    │                              │
     │    date, location)          │                              │
     │                             │◄── Verifier validates ───────┤
     │                             │    model hair attributes     │
     │                             │                              │
     │                             │── Matchmaker scores ────────►│
     │                             │   all eligible models        │
     │                             │                              │
     │                             │── Admin approves top matches │
     │                             │                              │
     │                             │── Sends match to model ─────►│
     │                             │                              │
     │                             │◄── Model accepts ────────────┤
     │                             │                              │
     │◄── Booking confirmed ───────│── Concierge takes over ──────│
     │                             │   (reminders, chat,          │
     │                             │    payment, follow-up)       │
     │                             │                              │
     │◄── Session complete ────────│─────────────────────────────►│
     │    Feedback collected       │                              │
     │                             │── Agentic scores updated ────│
     │                             │   (both sides)               │
```

This loop is the product. Everything else is infrastructure for this loop.

---

## 9. Mock Data Safety Plan

**Fear:** Flipping to real data will make everything go blank.  
**Reality:** It will make things go blank only where there is no real data yet. Here's the controlled way:

| Step | Action |
|---|---|
| 1 | Keep `VITE_USE_MOCK_DATA=true` in dev `.env` |
| 2 | Create one real model account + one real pro account in staging |
| 3 | Set `VITE_USE_MOCK_DATA=false` only in staging, verify each page |
| 4 | Fix any empty states that are jarring |
| 5 | For production launch, start with real data only |
| 6 | The mock data localStorage key (`modeled_mock_data`) is ignored in real mode — it stays there harmlessly |

**Pages that are safe immediately:**
- Onboarding (writes to real DB already)
- Admin (reads from DB, shows empty if no data — not broken)
- Auth / login / routing (nothing to do with mock)

**Pages to check first:**
- Model opportunities (reads Match records)
- Pro requests / matching (reads ModelRequest)
- Booked / calendar (reads Booking records)
- Admin match engine (reads ModelProfile + ModelRequest)

---

## 10. Revenue Model Summary

| Per Booking | Amount |
|---|---|
| Professional pays Modeled | ~$21 (haircut) / ~$30 (color) |
| Model pays Modeled (or waived in early cohort) | ~$25 (haircut) / ~$35 (color) |
| Modeled total per booking | ~$46–$65 |
| Stripe fee (2.9% + $0.30) | ~$1.75 |
| **Net per booking** | **~$44–$63** |

**At 100 bookings/month:** ~$4,400–$6,300 gross  
**At 500 bookings/month:** ~$22,000–$31,500 gross  
**At 2,000 bookings/month:** ~$88,000–$126,000 gross

---

*This document is the source of truth. Update it as tasks are completed. The goal is one clean loop: Request → Match → Book → Complete.*
