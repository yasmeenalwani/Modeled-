# Modeled Database Schema Documentation Index

Complete documentation of all database schema fields, types, and options for the Modeled platform.

---

## Documentation Files

1. **[Hair Profile Types](./DATABASE_SCHEMA_HAIR_PROFILE.md)**
   - Simple attributes (user-facing)
   - Detailed attributes (admin-only)
   - Legacy attributes (backwards compatibility)

2. **[Beauty Profile Attributes](./DATABASE_SCHEMA_BEAUTY_PROFILE.md)**
   - Skin analysis
   - Face analysis
   - Eye analysis
   - Eyebrow analysis
   - Lip analysis
   - Nose analysis

3. **[Services Menu](./DATABASE_SCHEMA_SERVICES.md)**
   - Complete service catalog with pricing
   - Services open to (boolean fields)
   - Service matching information

4. **[Preferences/Tags](./DATABASE_SCHEMA_PREFERENCES.md)**
   - Preference categories
   - How preferences are used
   - Examples and patterns

---

## Quick Reference

### Hair Profile - Simple Options
- **Length:** short, medium, long, extra_long
- **Color:** black, brown, blonde, red, gray, colored
- **Texture:** straight, wavy, curly, coily

### Services Available
1. Haircut - $125 (60 min)
2. Color - $300 (180 min)
3. Blowdry - $90 (45 min)
4. Gloss - $100 (60 min)
5. Highlights - $225 (150 min)
6. Keratin - $300 (180 min)

### Services Open To (Boolean Fields)
- openToHaircut
- openToColor
- openToStyling
- openToMakeup
- openToNails
- openToSkincare

### Preferences
- Stored in `tags` array field
- Free-text format
- Common categories: Service, Location, Time, Style, Special Requirements

---

## Schema Location

The database schema is defined in:
- **File:** `amplify/data/resource.ts`
- **Entity:** `ModelProfile`
- **Storage:** AWS Amplify Data (DynamoDB)

---

## How to Use This Documentation

1. **To add a new hair attribute:** Edit `DATABASE_SCHEMA_HAIR_PROFILE.md` and update the schema in `amplify/data/resource.ts`
2. **To add a new service:** Edit `DATABASE_SCHEMA_SERVICES.md` and update `src/admin/data/services.js`
3. **To add preference examples:** Edit `DATABASE_SCHEMA_PREFERENCES.md`
4. **To modify beauty attributes:** Edit `DATABASE_SCHEMA_BEAUTY_PROFILE.md` and update the schema

---

## Notes

- All markdown files are editable text files
- Schema changes require updates to:
  - Documentation (these .md files)
  - Database schema (`amplify/data/resource.ts`)
  - Frontend code (if UI needs updates)
  - Matching engine (if used in matching logic)

---

## Last Updated

Documentation generated: January 2025
Schema version: Current as of repository state

