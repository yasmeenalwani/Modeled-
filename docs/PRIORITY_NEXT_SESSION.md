# Priority list — next session

## ✅ Done — Onboarding photo size (15MB)

- **photoRequirements.js:** `maxFileSize` 10MB → 15MB; message "under 10MB" → "under 15MB".
- **profileConstants.js:** `PHOTO_REQUIREMENTS.maxSize` → 15MB.
- **storage.js:** `STORAGE_CONFIG.photo.maxSizeMB` 2 → 15, `maxDimension` 2048 → 4096; `inspirationPhoto.maxSizeMB` 1.5 → 15.
- Model/Pro onboarding and profile photo uploads now accept files up to 15MB.

---

## #1 — Seraphina sees match on Matched page (blocking)

**Goal:** Admin sends booking link to Seraphina → she sees it under Model portal → **Matched** (Opportunities).

**What’s already in code:**
- Single read path: `getMatchesForSeraphina()` in `mockDataService.js` (localStorage + session list).
- Model Matched page uses it when `shouldUseMockData()` is true.
- Admin writes via `createMockMatch()` to same storage key `modeled_mock_data` and `pushSeraphinaSessionMatch()`.

**Tomorrow’s debug steps (in order):**
1. **Same origin:** Use one URL for everything (e.g. only `http://localhost:5173`). No mix of ports or `file://`.
2. **Mock on:** `.env.local` has `VITE_USE_MOCK_DATA=true`. Restart dev server after changing.
3. **Same-tab test:** Admin → send match → **then** in the same tab go to Model portal → **Matched**. Session list should show the match even if localStorage is wrong.
4. **Inspect storage:** DevTools → Application → Local Storage → `modeled_mock_data` → look at `matches`. After sending, expect an entry with `modelId: "mock-model-1"`.
5. **Confirm page:** Matched = route `/model-portal/opportunities` (sidebar “Matched” link).

**Reference:** `docs/WORKFLOW_MATCH_TO_MODEL.md` has the full write/read path and alignment.

---

## #2 — Feedback and photos after session is completed

**Goal:** After a session is done, pro can submit feedback and after-photos; that flows through and is stored/used correctly.

**To verify/implement:**
- Pro has a clear path to “complete” a booking (e.g. from Pro portal → completed session → Add feedback & photos).
- Completion hits the right API/mock (e.g. `bookingCompletion.js` / `completeBooking`) and updates booking + any training/agentic logic.
- Photos and feedback are persisted and visible where they should be (admin, model profile, etc.).

**Reference:** Previous workflow audit touched completion flow; `bookingCompletion.js` and `BookingCompletion.jsx` are in the path.

---

## After that

- Other workflows (onboarding, matching engine weights, notifications, etc.) as needed.
- Use this file to keep a short “next 3 things” so sessions stay focused.
