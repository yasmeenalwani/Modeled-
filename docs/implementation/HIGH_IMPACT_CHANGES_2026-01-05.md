# High Value, High Impact Changes - Priority List

## 🔥 Critical User-Facing Features (Immediate Impact)

### 1. **Make Service Preferences Functional in Model Card**
**Impact:** HIGH | **Effort:** LOW | **Value:** Users can actually manage their service preferences
- Currently shows alert when clicking "Edit Services"
- Need to implement actual toggle/edit functionality
- Connect to database to save `openToHaircut`, `openToColor`, etc.
- **Files:** `src/portal/model-pages/ModelProfile.jsx`

### 2. **Make Preferences Add/Edit Functional**
**Impact:** HIGH | **Effort:** MEDIUM | **Value:** Users can add custom preference tags
- Currently just shows "+ Add Preference" button with no functionality
- Need modal/form to add/edit preference tags
- Save to `tags` array field in database
- **Files:** `src/portal/model-pages/ModelProfile.jsx`

### 3. **Photo Upload Functionality - Real Implementation**
**Impact:** HIGH | **Effort:** MEDIUM | **Value:** Users can upload profile photos
- Storage utilities exist but need to connect to UI
- Need proper error handling and progress indicators
- Update `headshotUrl` and `photoUrls` in database
- **Files:** `src/portal/model-pages/ModelProfile.jsx`, `src/components/PhotoUploader.jsx`

---

## ⚡ Core Platform Features (Business Critical)

### 4. **Connect Matching Engine to Real Database**
**Impact:** CRITICAL | **Effort:** HIGH | **Value:** Platform actually works with real data
- Matching engine currently uses mock data only
- Need to query real ModelProfile records
- Connect to ModelRequest and Match entities
- **Files:** `src/matching/matchingEngine.js`, Database queries

### 5. **Complete Onboarding Flow → Database Save**
**Impact:** CRITICAL | **Effort:** MEDIUM | **Value:** Users can actually complete signup
- Verify all onboarding steps save to database properly
- Ensure ModelProfile creation works end-to-end
- Test full user journey
- **Files:** `src/pages/ModelOnboard.jsx`, Database mutations

### 6. **Real-Time Matching Score Updates**
**Impact:** HIGH | **Effort:** HIGH | **Value:** Scores reflect actual user behavior
- Currently scores are static/mock
- Need to calculate agentic scores from real booking/feedback data
- Update reliability, experience, compatibility scores dynamically
- **Files:** Matching engine, Booking/Feedback handlers

---

## 🛠️ Admin Tools (Operational Efficiency)

### 7. **Replace Placeholder Pages with Real Functionality**
**Impact:** MEDIUM-HIGH | **Effort:** MEDIUM | **Value:** Admins can actually manage the platform
- Many admin pages are just placeholders
- Priority: Services Catalog, Match Criteria, Bookings
- **Files:** `src/admin/pages/PlaceholderPage.jsx` (multiple pages)

### 8. **Match Criteria Configuration UI**
**Impact:** HIGH | **Effort:** MEDIUM | **Value:** Adjust matching algorithm without code changes
- Currently matching weights are hardcoded
- Need admin UI to adjust service-specific weights
- Save configuration to database or config file
- **Files:** `src/admin/pages/MatchCriteriaPage.jsx`, `src/matching/matchingEngine.js`

---

## 📊 Data & Analytics (Strategic Value)

### 9. **Match-to-Booking Conversion Tracking**
**Impact:** HIGH | **Effort:** MEDIUM | **Value:** Understand matching effectiveness
- Track when matches become actual bookings
- Analytics on match scores vs. booking success
- **Files:** Analytics tracking, Dashboard

### 10. **Model Profile Completeness Score**
**Impact:** MEDIUM | **Effort:** LOW | **Value:** Encourage profile completion
- Calculate completeness percentage
- Show progress indicator
- Guide users to complete missing fields
- **Files:** Profile components, Database queries

---

## 🎯 Quick Wins (High Value, Low Effort)

### 11. **Add "Services Open To" Checkboxes in Onboarding**
**Impact:** MEDIUM | **Effort:** LOW | **Value:** Capture service preferences at signup
- Add service selection step to onboarding
- Save to database immediately
- **Files:** `src/pages/ModelOnboard.jsx`

### 12. **Preference Tags Pre-populated Suggestions**
**Impact:** MEDIUM | **Effort:** LOW | **Value:** Better UX for adding preferences
- Show common preferences as quick-add buttons
- Still allow custom text entry
- **Files:** `src/portal/model-pages/ModelProfile.jsx`

### 13. **Profile Photo Requirements/Guidelines**
**Impact:** MEDIUM | **Effort:** LOW | **Value:** Better photo quality
- Add helper text about photo requirements
- Show examples or guidelines
- Validate photos before upload
- **Files:** Photo upload components

---

## 🚀 Recommended Implementation Order

**Week 1 (Foundation):**
1. Make Service Preferences Functional (#1)
2. Complete Onboarding Flow → Database Save (#5)
3. Photo Upload Functionality (#3)

**Week 2 (Core Platform):**
4. Connect Matching Engine to Real Database (#4)
5. Make Preferences Add/Edit Functional (#2)

**Week 3 (Admin & Operations):**
6. Match Criteria Configuration UI (#8)
7. Replace Key Placeholder Pages (#7)

**Week 4 (Analytics & Optimization):**
8. Match-to-Booking Conversion Tracking (#9)
9. Real-Time Matching Score Updates (#6)

---

## Notes

- **High Impact + Low Effort** = Do these first (Quick Wins)
- **High Impact + High Effort** = Plan carefully, critical path items
- **Critical** = Blocks other functionality, do ASAP
- All changes should maintain existing functionality
- Test each change independently before moving to next

