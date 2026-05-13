# Data Needed From User - Quick Reference

## 🎯 Purpose
To complete workflow implementation and Pinpoint integration, I need you to review and confirm/update the following data lists.

---

## 1. 📋 SERVICE LIST

**Current Services (6):**
- Haircut ($125, 60 min)
- Color ($300, 180 min)
- Blowdry ($90, 45 min)
- Gloss ($100, 60 min)
- Highlights ($225, 150 min)
- Keratin ($300, 180 min)

**Questions:**
- [ ] Are there additional services to add? (e.g., extensions, treatments, styling)
- [ ] Are service names correct?
- [ ] Are prices accurate?
- [ ] Are durations correct?
- [ ] Are professional/model fee percentages correct?

**File Location:** `src/admin/data/services.js`

---

## 2. 🏷️ PREFERENCE LIST

**Current Count:** 37 preferences across 5 categories

**Categories:**
- **Service Preferences** (12 options): Open to color, Love balayage, Prefer highlights, etc.
- **Location Preferences** (8 options): Manhattan only, Brooklyn preferred, Willing to travel, etc.
- **Time Preferences** (7 options): Mornings preferred, Weekends only, Flexible schedule, etc.
- **Style Preferences** (6 options): Natural styles, Open to experiment, Classic styles preferred, etc.
- **Restrictions/Special Requirements** (7 options): No bleach, No chemicals, Sensitive scalp, etc.

**Questions:**
- [ ] Is the preference list complete?
- [ ] Are all preferences accurate?
- [ ] Any preferences to add/remove?
- [ ] Are categories correct?

**File Location:** `docs/implementation/PREFERENCES_LIST_2026-01-05.md`

---

## 3. 🎨 ATTRIBUTE LIST (For Matching)

**Current Attributes:**
- **Hair:** Length, Color, Texture, Density, Porosity, Health, Style
- **Face:** Shape, Jawline, Cheekbones
- **Eye:** Color, Shape, Size, Spacing, Lid Type
- **Eyebrow:** Shape, Thickness, Spacing
- **Lip:** Shape, Fullness, Cupid's Bow
- **Nose:** Shape, Bridge, Width

**Questions:**
- [ ] Are all matching attributes included?
- [ ] Are attribute options complete? (e.g., hair colors, textures)
- [ ] Are attribute weights correct for matching?
- [ ] Any attributes to add/remove?

**File Location:** `src/matching/matchingEngine.js`

---

## 4. 💰 PRICING STRUCTURE

**Current Structure:**
- Base price per service
- Professional fee: 12-17% of base price
- Model fee: 10-25% of base price
- Total revenue: Professional fee + Model fee

**Questions:**
- [ ] Are base prices correct?
- [ ] Are professional fee percentages accurate? (currently 12-17%)
- [ ] Are model fee percentages accurate? (currently 10-25%)
- [ ] Is the revenue calculation correct?
- [ ] Any special pricing rules? (discounts, packages, etc.)

**File Location:** `src/admin/data/services.js`

---

## 5. 📍 LOCATION/GEOGRAPHY DATA

**Current:**
- Basic zip code storage
- Travel radius (miles)
- Willing to travel (boolean)

**Questions:**
- [ ] What neighborhoods/areas are supported? (e.g., Upper East Side, SoHo, Williamsburg)
- [ ] What zip codes are in service area?
- [ ] What are travel radius options? (5 miles, 10 miles, 20 miles, etc.)
- [ ] Are there location-specific preferences or restrictions?

**Needed For:**
- Location-based matching
- Travel radius calculations
- Preference filtering

---

## 6. ⏰ TIME SLOT PREFERENCES

**Current:**
- Basic categories: Morning, Afternoon, Evening
- Weekday/Weekend distinction

**Questions:**
- [ ] What are exact time windows?
  - Morning: ? (e.g., 8am-12pm)
  - Afternoon: ? (e.g., 12pm-5pm)
  - Evening: ? (e.g., 5pm-9pm)
- [ ] What are availability slot options? (hourly? 30-min intervals?)
- [ ] Are there preferred time slots?
- [ ] What are business hours? (when can services be booked?)
- [ ] Any time restrictions? (e.g., no services after 8pm)

**Needed For:**
- Availability matching
- Calendar scheduling
- Preference filtering

---

## 7. 📧 PINPOINT DECISION

**Current Setup:**
- Using SES (email) + SNS (SMS) for transactional messages
- No marketing campaigns yet

**Decision Needed:**
- [ ] Keep SES/SNS only (for transactional messages)
- [ ] Add Pinpoint (for marketing campaigns, segmentation, analytics)
- [ ] Hybrid approach (SES/SNS for transactional + Pinpoint for marketing)

**Reference:** `docs/architecture/PINPOINT_ANALYSIS_2026-01-05.md`

**Questions:**
- [ ] Do you need marketing campaigns? (promotions, re-engagement, announcements)
- [ ] Do you want user segmentation? (target specific groups)
- [ ] Do you need analytics? (open rates, click rates, engagement)
- [ ] What's your budget for messaging? (Pinpoint adds ~$2.50/month)

---

## 📝 HOW TO PROVIDE DATA

**Option 1: Direct Answers**
- Answer questions directly in this document or chat
- I'll update the code files accordingly

**Option 2: Spreadsheet/List**
- Provide updated lists in any format (Excel, Google Sheets, text)
- I'll integrate into codebase

**Option 3: Mark Current as Correct**
- If current data is correct, just confirm
- I'll proceed with current data

---

## 🎯 PRIORITY ORDER

1. **Service List** - Needed for request creation integration
2. **Preference List** - Needed for model profile integration
3. **Attribute List** - Needed for matching engine verification
4. **Pricing Structure** - Needed for financial calculations
5. **Location Data** - Needed for location-based matching
6. **Time Slots** - Needed for availability matching
7. **Pinpoint Decision** - Needed for integration planning

---

**Status:** ⏳ Waiting for user input

**Last Updated:** January 6, 2026

