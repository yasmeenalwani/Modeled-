# Workflow: Admin Sends Match → Model Sees It (Matched Page)

## What should happen
1. **Admin** (Match Engine): Select request → Run engine → Select Seraphina → "Send booking links"
2. **Model** (Seraphina): Open Model portal → click **Matched** → sees the match card(s)

## Code connection (where it must align)

### WRITE side (Admin)
| Step | File | What happens |
|------|------|--------------|
| 1 | `MatchEnginePage.jsx` | `handleApproveAll()` → `requestId = selectedRequest.requestId \|\| selectedRequest.id` (e.g. `'mock-request-2'`) |
| 2 | `MatchEnginePage.jsx` | `matchesToCreate` = array of `{ modelId: 'mock-model-1', finalScore, breakdown }` (Seraphina = id 1 → mapped to `'mock-model-1'`) |
| 3 | `matchService.js` | `createMatchesForRequest(requestId, matchesToCreate)` → for each, `createMatch(requestId, matchData.modelId, matchData)` |
| 4 | `matchService.js` | `createMatch(..., 'mock-model-1', ...)` → `createMockMatch(requestId, mappedModelId, { matchScore, scoreBreakdown })` |
| 5 | `mockDataService.js` | `createMockMatch()` → push match to `data.matches` (modelId: `'mock-model-1'`) → `saveMockData(data)` → **same key** `'modeled_mock_data'` |
| 6 | `mockDataService.js` | `pushSeraphinaSessionMatch(match)` so in-memory list also has it (same-tab reliability) |

### READ side (Model)
| Step | File | What happens |
|------|------|--------------|
| 1 | User opens **Model portal** → **Matched** → route `/model-portal/opportunities` |
| 2 | `App.jsx` | Renders `<ModelOpportunities />` |
| 3 | `ModelOpportunities.jsx` | `loadMatches()` runs, `shouldUseMockData()` must be `true` so we use mock branch |
| 4 | `ModelOpportunities.jsx` | Mock branch calls **`getMatchesForSeraphina()`** (single source for “what Seraphina sees”) |
| 5 | `mockDataService.js` | `getMatchesForSeraphina()` = `getMockMatches({ modelId: 'mock-model-1' })` (from localStorage) + `getSeraphinaSessionMatches()` (in-memory), merged and deduped |
| 6 | `mockDataService.js` | `getMockData()` reads **same key** `'modeled_mock_data'` from localStorage |

## What must be true for it to work
- **Same storage key**: Admin and Model both use `localStorage.getItem('modeled_mock_data')` / `setItem(...)`. So same **origin** (same URL: scheme + host + port). Different tabs are OK if same origin.
- **Same model id**: Match is stored with `modelId: 'mock-model-1'` and read with `getMockMatches({ modelId: 'mock-model-1' })` / `getMatchesForSeraphina()`.
- **Mock mode on**: `VITE_USE_MOCK_DATA=true` (e.g. in `.env.local`) so `shouldUseMockData()` is true and Model uses `getMatchesForSeraphina()`.
- **Model goes to Matched**: Route must be `/model-portal/opportunities` (sidebar “Matched” link).

## If it still doesn’t show
- **Same tab**: After sending from Admin, navigate to Model → Matched in the **same tab**. Session list is in-memory, so the match should appear even if localStorage were wrong.
- **Different tab**: Refresh the Model **Matched** page (or click Refresh there) after sending so it re-reads localStorage.
- **Check**: In browser DevTools → Application → Local Storage → key `modeled_mock_data` → inspect `matches` array. After sending, there should be an object with `modelId: "mock-model-1"` and the correct `requestId`.
