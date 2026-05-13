# Portfolio & Photo Experience — Design Discussion

## Overview

This doc outlines the **Model Card vs Portfolio** split for models, the mirrored **Pro Card vs Portfolio** for professionals, and the **post-booking photo flow** across Model Portal, Pro Portal, and Admin.

---

## 1. Model Side

### Model Card (comp card / main pics)
**Purpose:** First impression for matching — headshots and best shots that represent the model.

| Attribute | Details |
|-----------|---------|
| **Location** | Model Profile page → "My Photos & Video" section |
| **Content** | Headshot, profile angles, main portfolio shots (like a comp card) |
| **Upload flow** | PhotoUploader with guided angles (front, side, back, etc.) |
| **Use** | Shown to stylists during matching; used for comp-card-style presentation |
| **Tags** | Optional: hair type, length, color — for internal categorization |

**Current state:** ModelProfile has "Profile Photos" + "Video Reel". These are the Model Card photos.

---

### Portfolio (session work / past looks)
**Purpose:** Gallery of past session results — work done through Modeled.

| Attribute | Details |
|-----------|---------|
| **Location** | Model Portal → **Portfolio** tab/page (mirror of Pro portfolio) |
| **Content** | Photos from completed bookings — uploaded post-session |
| **Style** | Gallery layout with tags, filters (service type, stylist, date) |
| **Source** | Post-booking upload by model, stylist, or admin |
| **Tags** | Service type (balayage, blowout, color…), stylist name, date, hair attributes |

**Current state:** ModelSessionsConsolidated has a "Photos" view with GalleryTagFilter. Photos are either mock or from sessions. A dedicated **Model Portfolio** page (separate from Model Card) would formalize this.

---

## 2. Professional Side

### Pro Card (main representation)
**Purpose:** Professional identity — headshot, bio, services, certifications.

| Attribute | Details |
|-----------|---------|
| **Location** | Pro Portal → **Pro Card** (formerly "Profile") |
| **Content** | Profile photo, salon photos, portfolio highlights (curated best work) |
| **Use** | Shown to models during matching; public-facing representation |
| **Tags** | Service labels on portfolio items (blowout, color, cut…) |

**Current state:** PortalProfile (Pro Card) has ProCardOverview, salon photos, portfolioItems (work portfolio). These are the “before I match” / “this is who I am” assets.

---

### Portfolio (session work / past looks)
**Purpose:** Gallery of work done through Modeled — before/after, styled looks.

| Attribute | Details |
|-----------|---------|
| **Location** | Pro Portal → **Portfolio** tab (ProPortfolioConsolidated) |
| **Content** | Photos from completed bookings — uploaded post-session |
| **Style** | Same gallery + tags pattern as model portfolio |
| **Source** | Post-booking upload by pro, model, or admin |
| **Tags** | Service, model (anonymized if needed), date |

**Current state:** Pro already has `/portal/portfolio` (ProPortfolioConsolidated). It uses portfolioItems from the Pro Card. The distinction should be:

- **Pro Card portfolio** = Curated best work (pre-signup / manually added)
- **Pro Portfolio** = Session-based gallery that grows with each completed booking

---

## 3. Post-Booking Photo Flow (All Portals)

### When it happens
After a booking is completed (status = `completed`), either:
- Model uploads session photos
- Pro uploads session photos  
- Admin uploads on behalf of either

### Data model (conceptual)

```
SessionPhoto / BookingPhoto
├── id
├── bookingId
├── modelId
├── professionalId
├── url(s)
├── uploadedBy: 'model' | 'professional' | 'admin'
├── tags: [serviceType, hairColor, style, ...]
├── caption (optional)
├── createdAt
└── visibility: 'both' | 'model_only' | 'pro_only' | 'admin_only'
```

### Visibility rules

| Uploader | Model sees | Pro sees | Admin sees |
|----------|------------|----------|------------|
| Model    | ✓          | ✓        | ✓          |
| Pro      | ✓          | ✓        | ✓          |
| Admin    | ✓          | ✓        | ✓          |

Both sides see the same session gallery. Admin can moderate and edit tags.

---

## 4. UX Flows by Role

### Model portal
1. **Model Card** → Headshots + main photos (on Model Profile)
2. **Portfolio** → Dedicated page/tab with session gallery
   - Filter by: service type, date, stylist
   - Same GalleryTagFilter pattern as today
   - Empty state: "Complete sessions to build your portfolio"

### Professional portal
1. **Pro Card** → Headshot, salon photos, curated portfolio (on Pro Card page)
2. **Portfolio** → Dedicated page with session gallery
   - Filter by: service, date, model (if allowed)
   - Same gallery + tags experience

### Admin
1. **Booking detail** → "Session photos" section
   - Upload photos for a completed booking
   - Assign tags (service, style)
   - Photos flow to both model and pro portfolios
2. **Model/Pro profile view** → See their full portfolio (Model Card + Portfolio combined or split by source)

---

## 5. Recommended Implementation Order

1. **Rename done** ✓ — Profile → Pro Card in Pro Portal
2. **Clarify Model structure:**
   - Model Card = photos on Model Profile (comp card style)
   - Model Portfolio = new or enhanced route (e.g. `/model-portal/portfolio`) with session-based gallery
3. **Pro Portfolio** — Ensure Pro’s `/portal/portfolio` clearly separates:
   - Curated Pro Card work
   - Session-based portfolio (from completed bookings)
4. **Post-booking upload** — Add upload UI to:
   - Model: Booked session detail or Portfolio page
   - Pro: Booked session detail or Portfolio page
   - Admin: Booking/photo management page
5. **Schema** — Add `SessionPhoto` / `BookingPhoto` (or extend `Booking`) to store post-booking photos and tags.

---

## 6. Open Questions

1. **Model Portfolio routing** — New `/model-portal/portfolio` vs reusing Photos tab in Sessions?
2. **Tag taxonomy** — Shared list for model & pro, or role-specific?
3. **Consent** — Do model and pro both need to approve a photo before it appears in the other’s portfolio?
4. **Pro Card vs Portfolio merge** — Keep Pro Card portfolio as "curated" and Portfolio as "session" only, or allow pros to promote session photos into Pro Card?

---

## Summary

| Concept      | Model Card    | Model Portfolio | Pro Card       | Pro Portfolio  |
|-------------|---------------|-----------------|----------------|----------------|
| **Content** | Headshots, comp | Session results | Headshot, salon, curated work | Session results |
| **Source** | Onboarding + manual | Post-booking    | Onboarding + manual | Post-booking    |
| **UI**     | Model Profile | Portfolio page  | Pro Card page  | Portfolio page |
| **Tags**   | Optional      | Service, date, stylist | Service labels | Service, date, model |
