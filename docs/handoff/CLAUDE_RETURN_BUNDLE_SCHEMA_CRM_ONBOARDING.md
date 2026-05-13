# Return bundle for Claude — schema vs CRM, onboarding auth, admin smoke tests

**Give Claude this whole file** plus anything marked “optional paste” below if they need raw code.

---

## 1. Correction: `PrivateBetaLaunch` does **not** block `/onboard/*`

Claude asked whether applicants must sign in *before* the onboarding form and whether `PrivateBetaLaunch` prevents finishing onboarding.

**Facts from `src/App.jsx`:**

- **`/onboard/model`**, **`/onboard/professional`**, **`/onboard/partner`** are **separate routes**, each wrapped in **`Authenticator`** + the onboarding page only. They are **not** children of **`AuthenticatedApp`**.
- **`PrivateBetaLaunch`** is rendered **only inside `AuthenticatedApp`**, which is mounted for **`path="/*"`** (portals, `/admin`, etc.).

So the flow is:

1. User hits `/join?role=model` → `/onboard/model` → **Authenticator** (sign up / sign in) → **full `ModelOnboard` wizard** runs inside that route. **`PrivateBetaLaunch` never appears during the wizard.**
2. After submit, `ModelOnboard` navigates to **`/model-portal`** (see `ModelOnboard.jsx` `navigate('/model-portal')`). **That** path is under **`AuthenticatedApp`**, so a **non-Admin** user then sees **`PrivateBetaLaunch`** — but the **`ModelProfile` save has already run** in the submit handler.

**Answer to Claude’s (a)/(b)/(c):** **(a)** They authenticate **via `Authenticator` on the `/onboard/*` route first** (email + name), **then** complete the multi-step form. **(c)** `/onboard/*` is not “public” — it requires auth for the wrapped tree — but it is **not** the same shell as portals, so no private-beta wall during the form.

---

## 2. “Database schema not deployed. Please run: npx ampx sandbox” — exact source

**File:** `src/admin/pages/CRMPage.jsx`  
**Function:** `loadData` (and similar string in `handleCreateProspect` alert).

**Logic:** On tabs **Prospects**, **Campaigns**, or **Cities**, the page calls:

- `client.models.Prospect.list(...)`
- `client.models.OutreachCampaign.list(...)`
- `client.models.CityExpansion.list(...)`

If the thrown error message **includes** substrings like `Prospect`, `OutreachCampaign`, `CityExpansion`, `not found`, or `does not exist`, the UI sets:

```text
Database schema not deployed. Please run: npx ampx sandbox
```

So the banner is a **heuristic UI message**, not a string returned by Amplify verbatim. Typical real causes:

| Cause | What to do |
|--------|------------|
| **`amplify_outputs.json` out of sync** with the API that actually has `Prospect` / etc. | Regenerate from the environment where you deployed Gen2 (`ampx sandbox` or pipeline); redeploy frontend. |
| **Sandbox stopped / wrong region / wrong app** | Same: align outputs with the stack you’re hitting. |
| **Auth / IAM** — GraphQL error wording doesn’t match the `if` | Message might differ; CRM would show a different `setError` line — check browser **Network** tab for the AppSync response. |

---

## 3. Schema: CRM models **are** defined in `amplify/data/resource.ts`

These models exist in the repo schema (search the file for the type name):

| Model | Approx. line in `amplify/data/resource.ts` (grep in repo) |
|-------|-------------------------------------------------------------|
| `Prospect` | ~982 |
| `OutreachCampaign` | ~1060 |
| `CityExpansion` | ~1140 |

So **Scenario B “tables missing from schema”** is **less likely** than **deploy / outputs / API mismatch** unless an old `amplify_outputs.json` is bundled (e.g. demo schema).

---

## 4. What to paste or attach for Claude (priority order)

1. **`amplify/data/resource.ts`** — full file (large but single source of truth).  
2. **Root `amplify_outputs.json`** — redact if needed; Claude mainly needs to see **`data.url`**, **`auth`** user pool id, and that **`model_introspection`** includes `Prospect` (or confirm it doesn’t).  
3. **`src/admin/pages/CRMPage.jsx`** — at least `loadData` + `handleCreateProspect` (~lines 299–410).  
4. **`src/App.jsx`** — route block showing **`/onboard/*`** vs **`path="/*"`** + `AuthenticatedApp` / `PrivateBetaLaunch` (for auth-flow correction).  
5. **`src/pages/ModelOnboard.jsx`** — `handleSubmit` from `const handleSubmit = async` through **`ModelProfile.create` / `update`** and the following `navigate(...)` (~80–120 lines). *File is huge; slice is enough.*

Optional:

6. **`src/admin/pages/ModelsPage.jsx`** — top ~50 lines + wherever it calls `ModelProfile.list` (to compare CRM vs core models).

---

## 5. Smoke test script for you (reply to Claude with results)

On **localhost** (with dev server + backend you use day-to-day):

| URL | What to report |
|-----|----------------|
| `/admin/models` | Loads? Error text? Empty list? |
| `/admin/professionals` | Same |
| `/admin/onboarding` | Same |
| `/admin/crm` | Same — note exact **red** error line if any |

If **models/professionals work** but **CRM** shows “schema not deployed”, that strongly points to **Prospect / OutreachCampaign / CityExpansion** not present on the **deployed** API your `amplify_outputs.json` points at—not “admin is broken globally.”

---

## 6. DNS / SES “Hour 1” (Claude’s plan)

Still valid operationally; not repo-specific. Keep **MX** for `modeledmgmt.com` in Route 53, verify **SES** identity, request **production** SES when ready. Documented separately: `docs/deployment/MODELEDMGMT_WWW_GO_LIVE_STEPS.md`, SES guides under `docs/deployment/`.

---

## 7. One-line paste to start Claude after they read this file

```
Read docs/handoff/CLAUDE_RETURN_BUNDLE_SCHEMA_CRM_ONBOARDING.md. I will paste amplify_outputs.json (summary) and CRMPage loadData next. Diagnose why Prospect.list fails vs ModelProfile.list working, and list exact AWS/console checks (sandbox vs prod, outputs refresh).
```

---

*Generated from `modeled-frontend` repo inspection. Update if CRM error strings or routes change.*
