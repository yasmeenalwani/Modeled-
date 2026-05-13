# Implementation Tracking - High Impact Changes

## ✅ Approved to Implement (READY TO START)

1. **Make Service Preferences Functional in Model Card** ✅
2. **Make Preferences Add/Edit Functional** ✅ (with predefined list - CREATED, see PREFERENCES_LIST.md)
4. **Complete Onboarding Flow → Database Save** ✅
5. **Add "Services Open To" Checkboxes in Onboarding** ✅
8. **Preference Tags Pre-populated Suggestions** ✅
9. **Match-to-Booking Conversion Tracking** ✅
10. **Replace Placeholder Pages** ✅ (user will provide priorities)
12. **Real-Time Matching Score Updates** ✅ (dynamic scoring - YES)

## ⏸️ On Hold (Discuss Later)

3. **Photo Upload Functionality** - Hold off, discuss later
11. **Profile Photo Requirements/Guidelines** - Hold off, discuss later

## ⏸️ On Hold (Waiting for User Input)

### 10. Replace Placeholder Pages
**Status:** User will provide priorities later
**Need:** Which placeholder pages to implement first and requirements for each
**Note:** Can start other items while waiting

## ❌ Not Doing Now

6. Connect Matching Engine to Real Database (keeping mock data for now)

---

## 📋 Questions for User

### ✅ Preferences List Created
**Status:** Created in PREFERENCES_LIST.md
**Total:** 37 preference options across 5 categories
**Note:** Users select multiple, can remove, stored in `tags` array

---

## 🔍 Questions Before Implementation

### For Item 2 & 8 (Preferences):
✅ **RESOLVED:** 
- Predefined list created (37 options, see PREFERENCES_LIST.md)
- Multi-select (users can choose multiple)
- Users can remove preferences
- Stored in `tags` array field

### For Item 4 (Onboarding → Database):
7. **Which fields are REQUIRED** to complete onboarding?
8. **Should onboarding allow partial saves** (save progress, come back later)?
9. **Validation requirements:** Any fields that need special validation before saving?

### For Item 5 (Services in Onboarding):
10. **Should this be:**
    - A separate step in the onboarding flow?
    - Part of an existing step?
    - Required or optional?
11. **UI preference:** Checkboxes, toggle switches, or multi-select buttons?


---

## 📝 Implementation Notes

- **Mock Data:** Keep using mock data for matching engine (per user request)
- **Preferences:** Must be from predefined list (user will provide)
- **Database:** Use existing Amplify Data schema
- **UI Style:** Match existing Modeled design system (cherry/ivory colors, serif fonts)

---

## Next Steps

1. ✅ Preferences list created - READY
2. ✅ Item 12 clarified - Dynamic scoring YES - READY
3. ⏸️ Placeholder page priorities (Item 10) - Can start other items
4. ⏸️ Photo items (3, 11) - Discuss later
5. 🚀 **READY TO START IMPLEMENTATION** - Items 1, 2, 4, 5, 8, 9, 10, 12

