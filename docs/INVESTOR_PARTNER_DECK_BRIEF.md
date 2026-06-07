# Modeled — Investor & Partner Deck Brief

**Purpose:** Single source of truth for building a pitch deck. Feed this document (whole or in sections) into Claude to structure slides, design, and narrative.  
**As of:** May 19, 2026  
**Launch target:** June 1, 2026 (NYC pilot: Roman K Salon + Scott Waldman + real models)

---

## How to use this with Claude

Suggested prompt:

> You are helping me build an investor/partner pitch deck for Modeled Management. Use the attached brief as fact. Be honest about what is built vs in progress. Propose 12–15 slides with headline, 3–5 bullets, and speaker notes. Separate **investor** vs **salon partner** versions where useful. Include a demo script using the `/demo/*` URLs.

---

## 1. One-liner & elevator pitch

**Modeled** is a three-sided marketplace that connects **beauty professionals** (who need practice models at reduced rates) with **models** (who get professional services at a fraction of salon price) under **human-curated matching** — with salons/partners as the supply anchor and Modeled as the quality layer.

**Tagline options for deck:**
- “Professional beauty, modeled for you.”
- “The match layer between salons, stylists, and models.”
- “Curated model matching for the modern salon.”

**Why now:** Salons need training throughput and marketing content; aspiring models and everyday clients want affordable pro services; no one owns the **attribute-aware matching + ops** layer for beauty.

---

## 2. Problem (3 sides)

| Stakeholder | Pain |
|-------------|------|
| **Salon / partner** | Hard to fill training chairs, onboard stylists, track conversions, run events — scattered tools |
| **Professional (stylist)** | Needs models for cuts/color/classes; Instagram DMs and word-of-mouth don’t scale; no quality filter |
| **Model (client)** | Wants pro services cheaply but lacks trust, scheduling, and fit (hair type, service, location) |

**Insight:** Generic gig/booking apps don’t encode **hair texture, virgin color, allergies, ZIP reachability, or service opt-in** — Modeled does.

---

## 3. Solution & operating model

Modeled is **not** “Uber for hair.” Stylists **request**; **Modeled admin reviews** and runs the match engine; **only approved models** receive opportunities; **first to accept + pay** holds the slot.

```
Partner (salon) → publishes locations & team
Professional → creates ModelRequest (service, date, ideal attributes)
Admin (Modeled) → scores models → approves → sends opportunities
Model → sees match card → accepts → pays → booking confirmed
```

**Differentiator:** Proprietary **matching engine** (attribute + reachability scoring, dealbreakers, launch-tuned weights) + **admin quality gate** + full **portal stack** per role.

---

## 4. What has been built (honest inventory)

### 4.1 Platform surfaces — **UI largely built**

| Surface | URL (auth) | Demo (no login) | Maturity |
|---------|------------|-----------------|----------|
| **Admin Command Center** | `/admin` | — | **High** — 40+ pages, dark ops UI |
| **Model portal** | `/model-portal` | `/demo/seraphina` | **Medium–High** — profile, matched, photos, games |
| **Professional portal** | `/portal` | `/demo/sarah` | **Medium–High** — pro card, matching, portfolio, education, shop |
| **Partner portal** | `/partner-portal` | `/demo/partner` | **Medium** — dashboard, team, schedule, campaigns, financials |
| **Public onboarding** | `/join`, `/onboard/*` | — | **Medium** — 10-step model flow, pro/partner wizards |
| **Demo hub** | `/demo` | ✓ | **New** — one-click walkthrough links |

**Tech stack:** React 19, Vite, React Router 7, AWS Amplify Gen 2 (AppSync, DynamoDB, Cognito, S3, Lambda).

### 4.2 Backend & data model — **schema built; prod alignment in progress**

**DynamoDB entities (Amplify Data):**  
`ModelProfile`, `Professional`, `Partner`, `ModelRequest`, `Match`, `Booking`, `Notification`, `Service`, plus chat, commerce, CRM/outreach, trips, analytics-adjacent models.

**Auth:** Cognito groups — `Model`, `Professional`, `Partner`, `Admin`.

**Storage:** S3 for photos, ID docs, portfolios (guided photo capture + identity verification flow exists).

**Known prod gap:** Local schema is **ahead** of deployed API in places; workarounds exist for partner/pro publish (enum normalization, extended fields in `adminNotes`).

### 4.3 Matching system — **core IP built**

| Component | Status |
|-----------|--------|
| Attribute scoring (hair, beauty, condition, virgin, allergies) | ✅ Built |
| Reachability (ZIP, borough, travel time, availability slot) | ✅ Built |
| Service opt-in filters (`openToHaircut`, etc.) | ✅ Built |
| Agentic learning scores (reliability, feedback, …) | ✅ Computed; **weight 0 at launch** |
| Admin match approval + send | ✅ Built |
| Auto-matching Lambda on stream | ⏸ Planned, not required for pilot |
| Production E2E (real models see sent matches) | 🔧 Blocked on auth rules + seed data |

**Launch weights:** 72% attribute fit, 28% reachability, 0% agentic (until booking history exists).

### 4.4 Admin ops — **built for launch control**

| Capability | Route | Notes |
|------------|-------|-------|
| Model roster + tags + photos | `/admin/models` | Gallery tags, cover images |
| Professional roster | `/admin/professionals` | Scott Waldman draft + publish flow |
| Partner / salons | `/admin/salons` | Roman K multi-location draft |
| Request queue + create | `/admin/requests` | 3-step intake modal, 22 services, criteria |
| Match engine (explore) | `/admin/matching` | Score breakdown |
| Match approval + send | `/admin/match-approval` | Human-in-the-loop send |
| Onboarding review | `/admin/onboarding` | Approve model/pro/partner |
| Bookings, calendar, CRM, trips, analytics | Various | UI present; depth varies |
| ID verification review | Admin modals + Rekognition Lambda | P1 for trust story |

### 4.5 Onboarding & identity — **built; hardening this week**

| Flow | Status |
|------|--------|
| Model 10-step onboard (photos, prefs, availability, optional ID) | ✅ UI + DB create |
| Pro / partner onboard | ✅ UI + publish helpers |
| Cognito email/SMS verification | ✅ Bypass flags for dev |
| Identity verification (Rekognition) | ✅ Component + Lambda |
| Model profile → portal load (userId fix) | 🔧 Recently fixed |

### 4.6 Payments & notifications — **partial**

| Item | Status |
|------|--------|
| Stripe integration (concepts, customer, payment method) | 🔧 Partial / test mode |
| `cardOnFileStatus` on models | Schema + matching filter |
| SES email | 🔧 Sandbox / production access pending |
| In-app notifications | Mock + create path; DB persist incomplete |
| SMS (Pinpoint/SNS) | Documented, not full prod |

### 4.7 Pilot customers (real names for deck)

| Entity | Role | Status |
|--------|------|--------|
| **Roman K Salon** | Partner | Draft in admin; publish pending backend sync |
| **Scott Waldman** | Professional @ Roman K | Draft; “create request for Scott” wired in admin |
| **Seraphina Luna** | Demo model | Mock persona for demos (`/demo/seraphina`) |
| **Sarah Mitchell @ Luxe Studio** | Demo pro | Mock persona (`/demo/sarah`) |

**June 1 success criteria:** One real request for Scott → 2+ models sent → 1 accepts → booking on production URL.

---

## 5. Business model (for deck — validate numbers with Yasmeen)

From product docs (`PROCESS_FLOW_VISUAL` example):

| Party | Pays | Example |
|-------|------|---------|
| Professional | Platform / session fee | ~$15 on $50 service |
| Model | Discounted service fee | ~$10 |
| **Modeled** | **Platform take** | **~$25** (50% of nominal in example) |

**Revenue streams to show investors:**
1. **Per-booking platform fee** (primary at launch)
2. **Partner / salon subscriptions** (team dashboard, compliance, campaigns — portal built)
3. **Pro shop / affiliate** (portal page exists)
4. **ROLE Model program** (admin sub-app — community / impact angle)
5. **Future:** Data & matching API for salon groups; education content

**Unit economics slide:** Use pilot assumptions — e.g. 4 bookings/stylist/month × $25 take × 20 stylists = $2K MRR per anchor salon (illustrative only).

---

## 6. Traction & proof points (what you can claim today)

**Can claim honestly:**
- Full-stack product built (4 portals + admin + matching engine)
- AWS-native architecture with documented cost model (~low hundreds/month at pilot scale)
- Real pilot partners identified (Roman K, Scott)
- Demo-ready walkthrough without login (`/demo`)
- 22-service catalog + rich model criteria aligned to engine
- Human-in-the-loop matching (quality story for partners)

**Do not overclaim:**
- “Live in production” until `modeledmgmt.com` + E2E without mock
- “Automated matching at scale” — admin sends today
- “Thousands of users” — seed/pilot stage
- “Agentic AI matching live” — weights disabled at launch

---

## 7. Roadmap (for deck timeline slide)

### Phase 0 — **Now → June 1, 2026** (Pilot launch)
- Publish Roman K + Scott to production DB
- 3–5 NYC models approved with photos + ZIP + card flag
- Fix `Match` / `Notification` read auth for models
- Production hosting + env (`VITE_USE_MOCK_DATA=false`)
- One salon, one stylist, 2+ booked sessions

### Phase 1 — **Q2–Q3 2026** (NYC density)
- Model onboard funnel stable (no mock)
- Pro self-serve request → admin SLA queue
- Stripe test → live for model fees
- SES production email
- Partner portal used by Roman K for team view

### Phase 2 — **H2 2026** (Scale matching)
- Re-enable agentic score weight
- Auto-matching suggestions (admin still approves send)
- Pro “suggested matches” read-only
- RDS analytics dashboards wired to real bookings
- Second anchor salon

### Phase 3 — **2027+** (Platform)
- Hair/beauty engine auto-tagging from photos (Bedrock/Rekognition pipeline)
- Multi-city expansion playbook
- Partner API / white-label matching
- Mobile-optimized model experience

---

## 8. Competitive positioning (slide fodder)

| Alternative | Limitation | Modeled |
|-------------|------------|---------|
| Instagram / DMs | No matching, no payment, no compliance | Structured requests + scores |
| Generic booking (Booksy, etc.) | Pays full price; not training-model use case | Discounted model economy |
| Staffing agencies | Manual, not attribute-aware | Engine + admin scale |
| School clinic only | Limited to students | Pros + partners + ongoing marketplace |

**Moat:** Attribute schema + matching weights + operational workflow + three portals + pilot salon relationships.

---

## 9. Architecture slide (simplified for investors)

```
React app (Amplify Hosting / CloudFront)
    → AppSync GraphQL
        → DynamoDB (profiles, requests, matches, bookings)
        → S3 (photos, documents)
        → Cognito (auth, roles)
        → Lambda (identity verification, future auto-match)
        → SES / Pinpoint (comms)
        → Stripe (payments)
        → RDS (analytics, optional)
```

**Cost story:** Pilot-scale AWS ~$50–150/mo documented in `docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md`.

---

## 10. Risks & mitigations (be upfront in appendix)

| Risk | Mitigation |
|------|------------|
| Chicken-and-egg (models vs pros) | Anchor salon + admin-seeded models; stylist-led requests |
| Matching returns zero in prod | Pilot data requirements documented; admin bypass toggles |
| Schema drift local vs deployed | `amplify push`, enum normalization helpers |
| Legal (model vs employee) | Terms, model agreement, insurance docs in progress (`docs/legal/`) |
| Trust / safety | ID verification, admin approval, allergies dealbreakers |

---

## 11. Recommended deck structure (12–15 slides)

### Version A — **Investor**

1. **Title** — Modeled Management + tagline  
2. **Problem** — 3-sided pain (salon, pro, model)  
3. **Solution** — Marketplace + curated matching (diagram)  
4. **Product** — Screenshots: admin match approval, model opportunity card, pro request  
5. **How it works** — 5-step flow (from §3)  
6. **Matching IP** — Attributes + reachability; admin gate; future agentic  
7. **What’s built** — Table from §4 (honest maturity)  
8. **Demo** — QR/links to `/demo/seraphina`, `/demo/sarah`, `/demo/partner`  
9. **Business model** — Fee split diagram (§5)  
10. **Go-to-market** — Roman K pilot → NYC salons → pro-led requests  
11. **Roadmap** — Phase 0–2 timeline (§7)  
12. **Team** — Founder + advisors (you fill in)  
13. **Ask** — Raise amount, use of funds (you fill in)  
14. **Appendix** — Architecture, unit economics assumptions, legal status  

### Version B — **Salon partner**

1. Title — “Partner with Modeled”  
2. Their problem — training chairs, content, apprentice throughput  
3. Partner portal — dashboard, team, schedule, conversions (screenshot `/demo/partner`)  
4. How requests work — Scott creates → you approve models → booked sessions  
5. Quality control — Modeled reviews every match  
6. Pilot offer — Roman K package (dates, # stylists, # sessions)  
7. Next steps — publish salon, onboard team, first request  

---

## 12. Live demo script (5–7 minutes)

Use **no-login demo URLs** (hard refresh after deploy):

1. **`/demo/partner`** — “This is Luxe Studio’s view: team, bookings, campaigns.”  
2. **`/demo/sarah/profile`** — “Sarah’s pro card — specialties, salon, portfolio.”  
3. **`/demo/sarah/matching`** — “Where stylists see match requests.” (If sparse, say: “Admin creates request in parallel.”)  
4. **Admin** (your login) — `/admin/requests` → create request for Scott → `/admin/match-approval`  
5. **`/demo/seraphina/opportunities`** — “Model sees the opportunity we sent.”  
6. Close — “June 1: this path on production with Roman K and real NYC models.”

**Backup:** If admin matching shows 0, show match engine page with mock data and explain pilot seeding — don’t pretend it’s live.

---

## 13. Key metrics to track post-launch (for “traction” slide updates)

| Metric | Source |
|--------|--------|
| Active models (approved) | `/admin/models` |
| Active professionals | `/admin/professionals` |
| Partner locations live | `/admin/salons` |
| Requests / month | `ModelRequest` count |
| Match send → accept rate | `Match` status funnel |
| Bookings completed | `Booking` |
| Platform revenue | Stripe + `/admin/revenue` |
| Time to match (SLA) | Request created → first `sent` |

---

## 14. Supporting docs (for Claude appendix or speaker prep)

| Topic | File |
|-------|------|
| Launch plan | `docs/LAUNCH_PLAN_JUNE_2026.md` |
| E2E flow | `docs/E2E_SALON_TO_MODEL_FLOW.md` |
| Admin/portals state | `docs/handoff/ADMIN_AND_PORTALS_CURRENT_STATE.md` |
| Matching deep dive | `docs/MATCHING_SYSTEM_TECHNICAL_WRITEUP.md` |
| AWS architecture & costs | `docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md` |
| Print hub | `docs/PRINT_HUB.md` |
| Full system doc | `COMPLETE_SYSTEM_DOCUMENTATION.md` |

---

## 15. Fill-in blanks (you complete before final deck)

- [ ] Founder bio & photo  
- [ ] Exact raise amount & instrument (SAFE, equity, etc.)  
- [ ] Use of funds breakdown (% product, GTM, ops, legal)  
- [ ] Confirmed Roman K commercial terms  
- [ ] Model count target for June 1  
- [ ] Insurance / liability status  
- [ ] Trademark status (`docs/legal/TRADEMARK_SEARCH_CLEARANCE.md`)  

---

*This brief is the canonical deck input. Update after June 1 pilot with real booking numbers and screenshots from production.*
