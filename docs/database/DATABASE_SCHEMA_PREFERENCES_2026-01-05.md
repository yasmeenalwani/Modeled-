# Preferences/Tags - Database Schema

## Overview

Preferences are stored as free-text tags in the `tags` array field in the ModelProfile schema. This allows flexibility for users to express their preferences in their own words.

- **Field:** `tags`
- **Type:** string array
- **Example:** `["Open to color", "Love balayage", "Mornings preferred", "Manhattan only"]`
- **Storage:** Stored as an array of strings in the database

---

## Preference Categories

Based on UI examples and common use cases, preferences typically fall into these categories:

### 1. Service Preferences

Preferences related to specific services or techniques:

**Examples:**
- `Open to color`
- `Love balayage`
- `Trims OK`
- `Love blowouts`
- `No bleach`
- `Open to highlights`
- `Prefer natural colors`
- `Bold changes welcome`
- `Conservative styles only`

**Used For:** Filtering models for specific service types or techniques

---

### 2. Location Preferences

Preferences about where services can take place:

**Examples:**
- `Manhattan only`
- `Brooklyn preferred`
- `Willing to travel`
- `Upper East Side only`
- `Downtown preferred`
- `No travel`

**Used For:** Location-based matching and logistics

---

### 3. Time Preferences

Preferences about scheduling and availability:

**Examples:**
- `Mornings preferred`
- `Afternoons only`
- `Weekends only`
- `Weekdays preferred`
- `Evenings OK`
- `Flexible schedule`

**Used For:** Scheduling and availability matching

---

### 4. Style Preferences

Preferences about hair styles and changes:

**Examples:**
- `Natural styles`
- `Bold changes`
- `Conservative`
- `Open to experiment`
- `Prefer length maintenance`
- `Open to significant cuts`
- `Color changes welcome`

**Used For:** Matching with professionals who offer compatible styles

---

### 5. Special Requirements

Special needs or restrictions:

**Examples:**
- `No chemicals`
- `Organic products only`
- `Sensitive scalp`
- `Allergy: [specific allergen]`
- `Pregnant-friendly products only`

**Used For:** Safety and compatibility filtering

---

## How Preferences Are Used

1. **Display:** Shown in the Model Card section as tags/badges
2. **Matching:** Used by matching engine as secondary criteria
3. **Filtering:** Help professionals find models who match their needs
4. **Search:** Can be used for tag-based search functionality

---

## Adding/Editing Preferences

Preferences can be added by:
1. Users through the Model Card/Profile page
2. Admins through the admin panel
3. Programmatically through the API

**UI Pattern:** 
- Click "+ Add Preference" button
- Type preference text
- Add as a tag
- Stored in the `tags` array field

---

## Current Examples (From UI)

Based on the Model Card UI, common preferences include:
- Open to color
- Love balayage
- Trims OK
- Love blowouts
- No bleach
- Mornings preferred
- Manhattan only

---

## Notes

- Preferences are free-text, so users can express preferences in their own words
- No predefined list - completely flexible
- Tags are case-sensitive (though UI may normalize)
- Multiple preferences can be stored in the array
- Preferences are optional - models don't have to add any
- Can be edited/removed by users at any time
- Used as secondary matching criteria (not dealbreakers like services or location)

---

## Future Enhancements

Potential improvements:
- Categorize preferences automatically
- Suggest common preferences based on user type
- Use preferences for personalized recommendations
- Analytics on most common preferences
- Preference-based filtering in admin panel

