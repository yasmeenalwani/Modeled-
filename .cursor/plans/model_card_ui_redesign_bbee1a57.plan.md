---
name: Model Card UI Redesign
overview: "Redesign the model card to mirror the Pro Card inspo: hero at top (model context), featured portfolio pics next, then services open to, preferences, and an Education-style availability section (neighborhoods per day + 30-min time slots). Same coloring and styling as the Pro Card."
todos: []
isProject: false
---

# Model Card UI Redesign Plan

## Pro Card Inspiration (Reference)

Based on the provided Pro Card screenshots:

1. **Hero**: 150px circular avatar (initials on maroon) | name, location, bio, badges (Verified Pro, Junior, Certifications, Top Rated), stats (Total Sessions, Rating, Member Since), CTA (Preview Public Profile). Cream background, dark text, rounded corners.
2. **Professional Focus**: 2-column layout. **Left**: 2x2 portfolio grid with "PORTFOLIO 1–4" placeholders and gradient overlay. **Right**: "SIGNATURE SERVICES" list (item + "Featured"), "AWARDS & PRESS" capsule tags.
3. **Education**: Rounded card with "COSMETOLOGY" header, two-column details (School | Aveda Institute, Location | New York NY, Graduation | 2022). "+ Add education" button. Clean label-value layout.

## Current Model UIs

- **Admin ModelsPage** ([ModelsPage.jsx](src/admin/pages/ModelsPage.jsx)): Inline grid cards (avatar, hair brief, tags, stats); click opens `ModelDetailModal`
- **ModelDetailModal** ([ModelDetailModal.jsx](src/admin/components/ModelDetailModal.jsx)): Tabs (Overview, Verification, Notes, Files, Activity). Overview has Contact + Hair in 2 columns; no portfolio, no services panel, no availability
- **MatchApprovalPage** ([MatchApprovalPage.jsx](src/admin/pages/MatchApprovalPage.jsx)): Compact match cards (60px score circle, name, hair tags, availability snippet); no expanded full model view
- **ModelProfile** ([ModelProfile.jsx](src/portal/model-pages/ModelProfile.jsx)): Model’s own edit form with focusLayout (1.8fr | 1fr) — portfolio left, Services/Preferences/Availability right, but different visual treatment

## Model Data Available (schema + mock)

From [amplify/data/resource.ts](amplify/data/resource.ts) and [mockDataService.js](src/utils/mockDataService.js):

- **Portfolio**: `headshotUrl`, `photoUrls[]`
- **Services**: `openToHaircut`, `openToColor`, `openToStyling`, `openToMakeup`, `openToNails`, `openToSkincare` 
- **Hair**: `hairLength`, `hairColor`, `hairTexture`, `hairCondition`, `virginHair`; simple variants: `hairLengthSimple`, `hairColorSimple`, `hairTextureSimple`
- **Location**: `locationZip`, `willingToTravel`, `travelRadius`
- **Availability**: `availability` (json, e.g. `{ monday: ['9am','10am'], ... }`)
- **Preferences**: `somethingFun`, `whatYouCareAbout`, `favoriteService`, `communityInterests`, `allergies`
- **Stats**: `servicesCompleted`, `repeatBookings`, `agenticScores`, `identityVerified`

---

## Proposed Model Card Layout (Pro Card Inspo)

**Section order:** Hero → Portfolio (featured) → Services / Preferences (side-by-side) → Availability (separate section, Education-style)

### Structure Overview

```
+------------------------------------------------------------------+
|  1. HERO (Pro-style, model context)                               |
|     [Avatar 150px] | Name, Location • Bio • Badges • Stats • CTA  |
+------------------------------------------------------------------+
|  2. PORTFOLIO — Featured Photos (next)                            |
|     [2x2 or 2x3 grid, like Professional Focus, gradient overlay]  |
+------------------------------------------------------------------+
|  3. SERVICES OPEN TO        |  4. PREFERENCES                    |
|     Haircuts ✓ Colors ✓     |     Capsule tags: Prefer mornings, |
|     Styles ✓                 |     Love to chat, etc.              |
+------------------------------------------------------------------+
|  5. AVAILABILITY (Education-style, separate section below)       |
|     Per day: neighborhood + 30-min time slots, easy to select    |
+------------------------------------------------------------------+
```

**Coloring and styling:** Same as Pro Card — cream `#FFFEF9`, maroon `#8B1E3F`, dark text, rounded corners, capsule badges.

---

## Mockup 1: Hero (model context)

- **Left**: 150px circular avatar (headshot or initials on maroon gradient, "UPLOAD" button below like Pro)
- **Right**: Name, location (ZIP • city), bio (model-focused), badges (Verified, Active, Card on file — green/blue/yellow like Pro), stats (Total Bookings | Rating | Member Since), CTA (Preview Public Profile)

---

## Mockup 2: Portfolio — Featured Photos (next after hero)

```
+----------------------------------------------------------+
|  PORTFOLIO (Hair Pics)                                    |
|  +--------+  +--------+  +--------+                       |
|  |        |  |        |  |        |                       |
|  |  Pic 1 |  |  Pic 2 |  |  Pic 3 |  (4/5 aspect)        |
|  |        |  |        |  |        |                       |
|  +--------+  +--------+  +--------+                       |
|  +--------+  +--------+  +--------+                       |
|  |  Pic 4 |  |  Pic 5 |  |  Pic 6 |  or Add photo        |
|  +--------+  +--------+  +--------+                       |
+----------------------------------------------------------+
|  ABOUT                                                   |
|  Favorite service:  Color + highlights                    |
|  What I care about: Healthy hair, natural-looking color   |
|  Something fun:     Always trying new salons             |
|  Community:         [Blonding] [Curly hair] [Lived-in]   |
+----------------------------------------------------------+
```

- Portfolio: 6-tile grid (`repeat(auto-fill, minmax(180px, 1fr))`), same as Pro; `photoUrls` + `headshotUrl`; placeholder “Add photo” when empty
- About: `favoriteService`, `whatYouCareAbout`, `somethingFun`, `communityInterests` as chips

---

## Mockup 3: Model Focus — Right Column (Services + Hair + Prefs + Availability + Location)

```
+----------------------------------+
|  SERVICES                        |
|  Haircut     ✓ Open             |
|  Color       ✓ Open             |
|  Styling     ✓ Open             |
|  Makeup      — Not set          |
|  Nails       — Not set          |
|  Skincare    — Not set          |
+----------------------------------+
|  HAIR PROFILE                   |
|  Length    Long                 |
|  Color     Blonde w/ highlights |
|  Texture   Wavy                 |
|  Condition Color-treated       |
|  Virgin    No                   |
+----------------------------------+
|  PREFERENCES                    |
|  Allergies: None                |
|  Open to change: Yes            |
+----------------------------------+
|  AVAILABILITY                    |
|  Mon  Tue  Wed  Thu  Fri  Sat Sun|
|  9am  9am  —   10am  —   —   —  |
|  10am 10am     11am             |
+----------------------------------+
|  LOCATION                       |
|  ZIP: 10001                     |
|  Travel: Yes, 15 mi radius      |
+----------------------------------+
```

- Services: `openToHaircut`, `openToColor`, etc. as checklist with ✓/—
- Hair Profile: compact grid (label | value)
- Preferences: allergies, other relevant prefs
- Availability: compact 7-day view with time slots (like ModelProfile)
- Location: zip, willingToTravel, travelRadius

---

## Inspo-Driven Requirements (from Pro Card screenshots)

- **Services Open To**: Signature Services style — Haircuts ✓, Colors ✓, Styles ✓ with "Open" label (like "Featured")
- **Preferences**: Awards & Press style — capsule tags: Prefer mornings, Love to chat, Natural light photos, Soft glam
- **Availability**: Education-style — separate section below, rounded card per day. Per day: **neighborhood(s)** (e.g. SoHo, Brooklyn) and **30-min time slots** (9:00, 9:30, 10:00...). Easy to see and select. "+ Add availability" like "+ Add education". Schema may need `availability` extended for `{ day: { neighborhoods: [], slots: [] } }`.

---

## Implementation Plan

### Phase 1: Shared ModelCard component

1. Create `src/components/profile/ModelCardOverview.jsx`
  - Props: `model` (full profile object)
  - Layout: 150px avatar | name, location, badges, stats
  - Reuse Pro styling (`#8B1E3F`, `#FFFEF9`, `#4A2A1A`, Alike/Georgia)
2. Create `src/components/profile/ModelFocusLayout.jsx`
  - Left: `ModelPortfolioSection` (gallery from `photoUrls`, `headshotUrl`)
  - Left: `ModelAboutSection` (favorite service, what you care about, something fun, community interests)
  - Right: `ModelServicesSection` (openTo* checklist)
  - Right: `ModelHairProfileSection` (compact grid)
  - Right: `ModelPreferencesSection` (allergies, etc.)
  - Right: `ModelAvailabilitySection` (Education-style: per-day cards with neighborhood + 30-min slots)
  - Right: `ModelLocationSection` (zip, travel, radius)
3. Map model schema fields in both components; handle null/empty safely.

### Phase 2: Integrate into ModelDetailModal

1. Update [ModelDetailModal.jsx](src/admin/components/ModelDetailModal.jsx):
  - Overview tab: replace current two-column contact/hair layout with:
    - `ModelCardOverview` at top
    - `ModelFocusLayout` below
  - Keep Verification, Notes, Files, Activity tabs unchanged
  - Ensure admin actions (Match to Request, status, etc.) remain

### Phase 3: Integrate into MatchApprovalPage (optional expand)

1. Add “View full profile” or expand on match card:
  - Option A: Inline expand below match card with `ModelCardOverview` + `ModelFocusLayout`
  - Option B: Open `ModelDetailModal` in “read-only” mode for that model
  - Prefer Option B for reuse and consistency.

### Phase 4: Admin Models page grid (optional enhancement)

1. Keep current ModelsPage grid; clicking a card already opens `ModelDetailModal`. The modal gets the new layout from Phase 2, so no grid changes required unless desired.

### Phase 5: Styling and polish

1. Align colors/fonts with Pro Card: `#8B1E3F`, `#FFFEF9`, `#4A2A1A`, `#5A3A2A`, `rgba(139, 30, 63, 0.15)` borders
2. Ensure dark text on light backgrounds for accessibility
3. Responsive: stack columns on mobile (`gridTemplateColumns: '1fr'` when narrow)

---

## Data Mapping (model → UI)


| Section      | Schema fields                                                               | Fallback                |
| ------------ | --------------------------------------------------------------------------- | ----------------------- |
| Avatar       | `headshotUrl`                                                               | Initials from firstName |
| Portfolio    | `photoUrls[]`, `headshotUrl`                                                | Placeholder tiles       |
| Services     | `openToHaircut`, `openToColor`, etc.                                        | “Not set”               |
| Hair         | `hairLength`, `hairColor`, `hairTexture`, `hairCondition`, `virginHair`     | “Not specified”         |
| Location     | `locationZip`, `willingToTravel`, `travelRadius`                            | “Not provided”          |
| Availability | `availability` (json)                                                       | “Not set” / empty grid  |
| About        | `favoriteService`, `whatYouCareAbout`, `somethingFun`, `communityInterests` | Hide or “—”             |
| Stats        | `servicesCompleted`, `repeatBookings`, `agenticScores`                      | 0, computed avg         |


---

## File Summary


| Action    | File                                                                                                                                                  |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create    | `src/components/profile/ModelCardOverview.jsx`                                                                                                        |
| Create    | `src/components/profile/ModelFocusLayout.jsx` (or split into subcomponents)                                                                           |
| Modify    | `src/admin/components/ModelDetailModal.jsx` — Overview tab uses new components                                                                        |
| Optional  | `src/admin/pages/MatchApprovalPage.jsx` — “View full profile” opens modal                                                                             |
| Reference | [PortalProfile.jsx](src/portal/pages/PortalProfile.jsx) (Pro layout), [ProCardOverview.jsx](src/components/profile/ProCardOverview.jsx) (hero styles) |


---

## Visual Style Reference (Pro Card)

- Background: `#FFFEF9`
- Primary accent: `#8B1E3F`
- Text: `#4A2A1A`, secondary `#5A3A2A`
- Border: `1px solid rgba(139, 30, 63, 0.15)`
- Font: `"Alike", "Georgia", serif`
- Cards: `borderRadius: 12px`, soft shadow
- Chips: rounded, bordered `rgba(139, 30, 63, 0.2)`

Admin contexts (ModelDetailModal) use a dark theme; the new Model Card can either:

- Keep admin dark and adapt the Pro palette (e.g. light panels on dark)
- Or use light panels inside the modal for the model card to match Pro exactly

Recommendation: Use light model card (`#FFFEF9`) inside the modal for consistency with Pro and better scanability.