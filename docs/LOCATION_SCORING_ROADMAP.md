# Location Scoring Roadmap — Systematic Advancement

**Goal:** Make location scoring top-notch for both models and stylists, with cost optimization (no paid AWS geolocation APIs initially).

---

## Current State

| Component | Model Side | Stylist Side |
|-----------|------------|--------------|
| **Data collected** | `locationZip` only | `location` (free text, often full address) |
| **Travel prefs** | `willingToTravel`, `travelRadius` in schema but **not collected in onboarding** | N/A |
| **Distance calc** | ZCTA centroid + Haversine (implemented) | Same — uses `request.location` |
| **Request location** | N/A | Free text; may be "123 Main St, Manhattan, NY 10001" or "10001" |
| **ZIP extraction** | Direct (model has `locationZip`) | **Missing** — need to extract ZIP from address string |

---

## Advancement Elements (Work Through in Order)

### Element 1: Extract ZIP from Request Location
**Problem:** `ModelRequest.location` is often a full address. Matching uses it as-is; we need a 5-digit ZIP for distance.

**Solution:** Add `extractZipFromLocation(location)` utility:
- Regex: `\b\d{5}(-\d{4})?\b` to find ZIP in string
- Fallback: If Professional has `salonAddress`, extract ZIP from there
- Fallback: If Partner has `zip`, use that when request is at partner location

**Cost:** $0 (client-side logic)

**Files:** `src/matching/matchingEngine.js`, `src/utils/autoMatching.js`, `matchingApi.js`

---

### Element 2: Collect willingToTravel + travelRadius in Model Onboarding
**Problem:** Schema has these fields but they're never set. Defaults (willingToTravel=true, travelRadius=25) apply to all.

**Solution:** Add to ModelOnboard.jsx (or ModelProfile edit):
- `willingToTravel`: Toggle "Are you willing to travel to appointments?"
- `travelRadius`: If yes, "How far (miles)?" — dropdown: 5, 10, 15, 25, 30, 50

**Cost:** $0

**Files:** `src/pages/ModelOnboard.jsx`, `src/portal/model-pages/ModelProfile.jsx`

---

### Element 3: Stylist-Side Location Normalization
**Problem:** When a professional creates a request, `location` can be salon address. We should store/derive a canonical ZIP for matching.

**Solution:**
- Add `locationZip` to ModelRequest (optional) — extracted at create time
- When creating request: if `location` contains ZIP, extract and store in `locationZip`
- Matching engine: prefer `request.locationZip` over extracted-from-`location` for consistency

**Cost:** $0 (or small schema migration)

**Files:** `amplify/data/resource.ts`, `ProRequestCreationLuxury.jsx`, `ProRequestCreation.jsx`, matching engine

---

### Element 4: Professional/Partner locationZip for Fallback
**Problem:** Professional has `salonAddress` but no `locationZip`. When request.location is vague, we could use professional's salon ZIP.

**Solution:**
- Add `locationZip` to Professional (optional) — extracted from salonAddress or entered
- When request has no extractable ZIP, use professional's `locationZip` as request location for matching

**Cost:** $0

**Files:** `amplify/data/resource.ts`, Professional onboarding, request creation

---

### Element 5: Same-Borough Bonus (NYC)
**Problem:** Two Manhattan zips (10001, 10002) are ~1–2 mi apart; Manhattan–Brooklyn (10001, 11201) is ~5 mi. Same distance tier, but same-borough may be preferred (less transit hassle).

**Solution:** Optional NYC borough metadata:
- Map ZIP prefixes to borough: 100xx=Manhattan, 112xx=Brooklyn, 111xx–116xx=Queens, 104xx=Bronx, 103xx=Staten Island
- If model and request same borough and distance ≤ 10 mi: +5 bonus to location score (cap at 100)

**Cost:** $0 (static mapping)

**Files:** `src/matching/matchingEngine.js`, `src/matching/data/nycBoroughByZipPrefix.js` (small lookup)

---

### Element 6: Location Score in Match Breakdown (UI)
**Problem:** Admins see "Loc: 85" but don't know distance or why.

**Solution:** Include `distanceMiles` and `withinRadius` in `scoreBreakdown.location` so MatchApprovalPage can show "~5 mi, within your 10 mi radius".

**Cost:** $0

**Files:** `matchingEngine.js`, `MatchApprovalPage.jsx`, `ProMatchViewing.jsx`

---

### Element 7: Request-Side Travel Radius (Future)
**Problem:** Stylists might want "only models within X miles" — currently we don't filter by that.

**Solution:** Add `maxModelDistance` (optional) to ModelRequest. Filter or down-rank models beyond that distance.

**Cost:** $0

**Files:** Schema, request creation UI, matching engine

---

### Element 8: Amazon Location (Optional, Paid)
**When:** Only if you need address autocomplete, maps, or drive-time.

**What:** Geocoding (address→lat/lng), Place Index (autocomplete), Maps.

**Cost:** ~$0.50/1000 geocodes, $0.50/1000 place index requests. Skip until you have address-level matching or map UI.

---

## Recommended Order

1. **Element 1** — Extract ZIP from request location — DONE
2. **Element 2** — Collect willingToTravel + travelRadius — DONE
3. **Element 3** — Stylist-side locationZip on request — DONE
4. **Element 4** — Professional locationZip (fallback) — DONE
5. **Element 5** — Same-borough bonus (NYC polish) — DONE
6. **Element 6** — Location breakdown in UI — DONE
7. **Element 7** — Request-side max distance (later)

---

## Cost Summary

| Element | AWS Cost | Implementation |
|---------|----------|----------------|
| 1–7 | $0 | Code + schema (minimal) |
| 8 (Amazon Location) | ~$0.50/1k requests | Only when needed |

All core improvements (1–7) use free Census ZCTA data + client-side logic. No ongoing AWS geolocation costs.
