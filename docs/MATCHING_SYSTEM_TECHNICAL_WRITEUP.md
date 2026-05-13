# MODELED MATCHING SYSTEM – TECHNICAL WRITEUP

**Purpose:** Technical reference for building a roadmap to advance matchmaking.  
**Last Updated:** February 2025

---

## 1. ARCHITECTURE OVERVIEW

### Stack
- **Frontend:** React + Vite
- **Backend:** AWS Amplify Gen 2
- **Data:** AppSync (GraphQL) + DynamoDB
- **Storage:** S3 (profile photos, session photos, portfolios)
- **Functions:** Lambda (Node.js)

### Core Entities
| Entity | Purpose |
|--------|---------|
| **ModelProfile** | Models (attributes, preferences, agentic scores) |
| **ModelRequest** | What professionals request (service, date, desired attributes) |
| **Match** | Pairing of request + model with score |
| **Booking** | Confirmed appointment (from accepted match) |

---

## 2. SCHEMA (Matching-Relevant Fields)

### ModelProfile
| Field | Type | Purpose |
|-------|------|---------|
| **Hair (simple)** | | |
| hairLength, hairLengthSimple | enum | short, medium, long, extra_long |
| hairColor, hairColorSimple | string/enum | black, brown, blonde, red, gray, colored |
| hairTexture, hairTextureSimple | enum | straight, wavy, curly, coily |
| hairCondition | enum | healthy, damaged, color_treated, virgin |
| virginHair | boolean | Explicit virgin hair flag |
| allergies | boolean | Chemical/product allergies (dealbreaker) |
| **Beauty** | | |
| skinTone, skinToneSimple | string/enum | fair, light, medium, olive, tan, brown, dark |
| faceShapeSimple, eyeColorSimple, lipShapeSimple, etc. | enum | Beauty engine attributes |
| **Location** | | |
| locationZip | string | ZIP code |
| willingToTravel | boolean | |
| travelRadius | integer | miles |
| **Services** | | |
| openToHaircut, openToColor, openToStyling | boolean | Service opt-in |
| openToMakeup, openToNails, openToSkincare | boolean | |
| **Availability** | | |
| availability | json | { monday: ['9am'], tuesday: [...] } |
| **Auto-tagged** | | |
| autoTaggedAttributes | json | Hair/Beauty engine output |
| attributeConfidence | json | Per-attribute confidence |
| userValidatedAttributes | json | User corrections |
| **Agentic scores** | | |
| reliabilityScore | float | 0–100 |
| feedbackScore | float | 0–100 |
| experienceScore | float | 0–100 |
| engagementScore | float | 0–100 |
| compatibilityScore | float | 0–100 |
| agenticScores | json | Full { reliability, feedback, ... } |
| **Status** | | |
| status | enum | pending, approved, active, inactive |

### ModelRequest
| Field | Type | Purpose |
|-------|------|---------|
| professionalId | string | Required |
| serviceType | string | haircut, color, blowdry, etc. |
| desiredHairLength | enum | short, medium, long, extra_long |
| desiredHairColor | string | |
| desiredHairTexture | enum | straight, wavy, curly, coily |
| desiredHairCondition | enum | healthy, damaged, color_treated, virgin |
| requestedDate | date | Required |
| requestedTime | string | Required |
| location | string | ZIP or address |
| status | enum | pending, matching, matched, booked, completed, cancelled |

### Match
| Field | Type | Purpose |
|-------|------|---------|
| requestId | string | Required |
| modelId | string | Required |
| matchScore | float | 0–100 |
| scoreBreakdown | json | { attribute, agentic, location, availability } |
| status | enum | pending, approved, sent, accepted, declined, expired, waitlist |
| bookingId | string | Set when match → booking |
| sentAt, respondedAt | datetime | |

---

## 3. MATCHING ENGINE (ALGORITHM)

### Location
`src/matching/matchingEngine.js`

### Score Composition (0–100)
| Component | Weight | Description |
|-----------|--------|-------------|
| Attribute match | 40% | Hair, skin, services, etc. |
| Agentic learning | 35% | Reliability, feedback, experience, engagement, compatibility |
| Location | 15% | Zip-based distance |
| Availability | 10% | Schedule alignment |

### Match Types
- **DIRECT:** Must match exactly (hair length, services, location, allergies)
- **INDIRECT:** Partial matches (hair color, texture)
- **IF_REQUESTED:** Only when requested (virgin hair, age range, skin tone)
- **NO_MATCH:** Not used for scoring (name, socials, etc.)

### Dealbreakers (0 score)
- `allergies` on model + chemical service (color, keratin)
- Model not opted into service (`openToHaircut`, `openToColor`, etc.)

### Service-Specific Weights
Different services emphasize different attributes:

| Service | Key Attributes |
|---------|----------------|
| Haircut | hairLength 1.5x, hairTexture 1.3x |
| Color | hairCondition 2.0x, virginHair 2.0x, allergies 2.0x |
| Highlights | hairColor 1.8x, hairCondition 1.5x |
| Blowdry | hairTexture 1.5x, hairLength 1.4x |
| Keratin | hairTexture 1.8x, allergies 2.0x |

### Location Scoring
- Zip-based heuristic: same 5 digits = 0 mi, same 3 = ~15 mi, same 2 = ~75 mi, same 1 = ~200 mi
- 0–5 mi → 95, 5–15 mi → 90, 15–25 mi → 80, 25–50 mi → 65, 50–100 mi → 45, 100–200 mi → 25, 200+ mi → 5–10

### Request → Criteria Mapping
`autoMatching.js` maps `ModelRequest.desired*` → `request.criteria`:

- `desiredHairLength` → `criteria.hairLength`
- `desiredHairColor` → `criteria.hairColor`
- `desiredHairTexture` → `criteria.hairTexture`
- `desiredHairCondition` → `criteria.hairCondition`
- `desiredHairCondition === 'virgin'` → `criteria.virginHair`

### Service Type Mapping
`haircut`/`cut` → `haircut`, `blowout`/`styling` → `blowdry`, `gloss`/`highlights` → `color`, etc.

---

## 4. AUTOMATIONS & WORKFLOWS

### Auto-Matching (Lambda: `auto-matching`)
- **Trigger:** DynamoDB Stream on `ModelRequest` (currently not wired; Amplify Gen 2 limitation)
- **Intent:** On INSERT/MODIFY with `status='pending'`, run matching
- **Behavior:**
  1. Load request + active models
  2. Build criteria from `desired*`
  3. Call `findMatches(models, request)` → top 20, min score 30
  4. Create Match records
  5. Auto-approve matches with score ≥ 85 (configurable)
  6. Optionally auto-send to models (`AUTO_SEND_TO_MODELS`)
  7. Update request status to `matching`
- **Status:** Lambda exists; DynamoDB Stream not connected; can be invoked manually or via scheduled job

### Match Expiration (Lambda: `match-expiration`)
- **Schedule:** EventBridge daily
- **Behavior:** Expire matches with `status='sent'` older than 48 hours (configurable)
- **Config:** `MATCH_EXPIRATION_HOURS=48`

### Booking Reminders (Lambda: `booking-reminders`)
- **Schedule:** EventBridge every 1 hour
- **Behavior:** Find upcoming bookings, invoke notifications Lambda

### Model Payment Reminders (Lambda: `model-payment-reminders`)
- **Schedule:** EventBridge (e.g. every 6 hours)
- **Behavior:** Find matches with `status='accepted'` and no payment, invoke notifications

### Chat Activation (Lambda: `chat-activation`)
- **Schedule:** EventBridge (e.g. every 15 minutes)
- **Behavior:** Open/close ModelToProChat around appointment times

### Photo Analysis (Lambda: `photo-analysis`)
- **Trigger:** S3 `onUpload` on storage bucket
- **Behavior:** Rekognition + Bedrock for hair/beauty attributes; updates `ModelProfile` (`autoTaggedAttributes`, `attributeConfidence`)

### Agentic Score Updates
- **Trigger:** `completeBooking()` in `bookingService.js`
- **Behavior:** `updateScoresAfterCompletedBooking()` updates `reliabilityScore`, `feedbackScore`, `experienceScore`, `compatibilityScore` on `ModelProfile`
- **Cancellation:** `applyCancellationPenalty()` reduces `reliabilityScore` (no-show: -20, model cancelled: -10)

---

## 5. DATA FLOW (End-to-End)

1. **Model onboarding** → ModelProfile created (allergies, virginHair, services, availability)
2. **Photo upload** → S3 trigger → photo-analysis → `autoTaggedAttributes`, `attributeConfidence`
3. **Pro creates request** → ModelRequest created with `status='pending'`
4. **Auto-matching** (when trigger is wired) → Match records created
5. **Admin approves** → Match status `approved` → `sent`
6. **Model responds** → `accepted` or `declined` or `expired`
7. **Accept** → Booking created → Stripe payment
8. **Booking completed** → Agentic scores updated

---

## 6. GAPS & KNOWN LIMITATIONS

| Gap | Status |
|-----|--------|
| DynamoDB Stream for auto-matching | Not wired; Amplify Gen 2 limitation |
| Match-to-booking conversion analytics | Not implemented |
| Admin weight controls | Not implemented |
| Score breakdown in admin UI | Not implemented |
| Engagement score updates | Not implemented (profile/activity) |
| User-validated attributes in matching | Not used; engine uses `autoTaggedAttributes` |
| Confidence-weighted matching | Not implemented |

---

## 7. SUGGESTIONS FOR IMPROVEMENTS

### 7.1 Trigger Auto-Matching
- **Option A:** Scheduled job (e.g. every 15 min) that queries `ModelRequest` with `status='pending'` and runs matching
- **Option B:** Custom GraphQL mutation that triggers matching when invoked
- **Option C:** Revisit DynamoDB Stream when Amplify exposes `tableStreamArn` for Amplify-managed tables

### 7.2 Data Quality
- **Use userValidatedAttributes:** Prefer user-corrected attributes over auto-tagged when present
- **Confidence-weighted matching:** Lower weight for low-confidence attributes
- **Allergies detail:** Add `allergiesDetail` (string) for specific allergens

### 7.3 Location
- **Zip centroid lookup:** Add zip centroid lookup (e.g. SimpleMaps CSV) and Haversine distance
- **Travel radius:** Use `willingToTravel` and `travelRadius` in model scoring

### 7.4 Availability
- **Availability scoring:** Improve `calculateAvailabilityScore` for time ranges, recurring availability, timezone
- **Calendar integration:** Sync with real availability

### 7.5 Agentic Scores
- **Engagement updates:** Implement when profile/photo/activity changes
- **Decay:** Implement 5% decay per month of inactivity
- **Service history:** Track `serviceHistory` per model for compatibility

### 7.6 Admin & UX
- **Score breakdown UI:** Show attribute, agentic, location, availability in admin
- **Manual overrides:** Boost/demote per model
- **Threshold controls:** Per-request min score, auto-approve threshold
- **Analytics:** Match-to-booking rate, average score of booked vs not booked

### 7.7 Algorithm
- **Diversity:** Avoid returning many nearly identical models
- **Recency:** Slight boost for models who haven’t been matched recently
- **Match-to-booking learning:** Use historical bookings to tune weights

### 7.8 Scalability
- **Pagination:** For large model pools, paginate or batch
- **Caching:** Cache agentic scores, location data
- **Async:** Run matching asynchronously and notify when done

### 7.9 ML / Advanced
- **ML-based scoring:** Train model on historical bookings to predict “will pro book?”
- **Embeddings:** Use embeddings for hair/beauty attributes and match by similarity
- **A/B testing:** Different weight configs and measure conversion

---

## 8. FILE REFERENCE

| File | Purpose |
|------|---------|
| `amplify/data/resource.ts` | Schema (ModelProfile, ModelRequest, Match, Booking) |
| `src/matching/matchingEngine.js` | Scoring engine logic |
| `src/matching/MATCHING_ENGINE_SPEC.md` | Spec and behavior |
| `src/utils/autoMatching.js` | `runMatchingForRequest`, `approveMatch`, `sendMatchToModel` |
| `src/utils/agenticScores.js` | Score updates on booking complete/cancel |
| `src/utils/bookingService.js` | Booking lifecycle, calls agentic updates |
| `amplify/functions/auto-matching/` | Auto-matching Lambda |
| `amplify/functions/photo-analysis/` | Photo analysis Lambda |
| `amplify/storage/resource.ts` | S3 triggers for photo analysis |

---

*End of write-up*
