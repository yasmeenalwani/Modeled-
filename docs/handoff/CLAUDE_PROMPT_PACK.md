# Claude Prompt Pack - Modeled Testing and Hardening

Use these prompts directly in Claude Code. They are designed for strict, auditable execution.

---

## Master Orchestrator Prompt (Paste First)

```text
You are acting as a senior QA + reliability engineer for this repo.

Mission:
Execute a risk-first test program for Modeled across 15 test IDs (T-001 to T-015), in strict priority order (P0 -> P1 -> P2 -> P3).

Global rules:
1) Do not skip steps.
2) For each test ID, explicitly report:
   - Scope and goal
   - Files touched/read
   - Test implementation details
   - Commands run
   - Pass/fail result
   - Root cause for failures
   - Severity: critical/high/medium/low
   - Precise remediation plan (file-level)
   - Regression guard test to add
3) If a test cannot run due to missing infra, create a reliable local simulation and report assumptions.
4) Keep all findings factual and tied to exact files/symbols.
5) Prioritize fixing P0 failures before moving to P1.
6) After each test ID, output a mini gate decision:
   - GO (passes)
   - HOLD (failures needing fixes)
7) At the end, produce:
   - Executive risk summary
   - Deployment go/no-go recommendation
   - Ordered remediation backlog

Start with T-001 now.
```

---

## T-001 Prompt - Stripe Endpoint Access Control

```text
Execute T-001 (P0, complexity M): Stripe API auth hardening validation.

Goal:
Validate that payment/refund endpoints reject unauthorized callers and allow only intended authorized callers.

Scope files:
- amplify/backend.ts
- amplify/functions/stripe-payment/handler.ts

Tasks:
1) Inspect current authorization config for:
   - /payment
   - /refund
   - /webhook
2) Build and run tests for:
   - anonymous request to /payment
   - anonymous request to /refund
   - authenticated request to /payment
   - authenticated request to /refund
3) Verify webhook security still relies on signature verification and is not user-auth dependent.
4) Report concrete exploit risk if unauthorized access is possible.

Required output format:
- "Auth Matrix" table: Route | Anonymous | Authenticated | Expected | Actual | Pass/Fail
- "Risk Statement" with severity
- "Remediation Patch Plan" with exact file edits
- "Regression Tests to Add" list
```

---

## T-002 Prompt - Attach Payment Runtime Safety

```text
Execute T-002 (P0, complexity S): runtime safety for card-on-file flow.

Goal:
Eliminate runtime crashes and bad payload mapping in attach payment method path.

Scope files:
- src/utils/stripe.js
- src/components/CardOnFileSection.jsx
- src/components/ProCardOnFileSection.jsx

Tasks:
1) Trace function signature and payload assembly for attachPaymentMethod.
2) Detect undefined references, missing destructuring, or invalid keys.
3) Create targeted unit/integration tests for:
   - model profile attach path
   - professional attach path
   - missing required args path
4) Verify failure messages are actionable.

Required output format:
- "Fault Analysis" section with exact failing symbol and call chain
- "Test Cases Executed" list
- "Before/After Expected Behavior"
- "Remediation Patch Plan"
```

---

## T-003 Prompt - Photo Submission Schema Conformance

```text
Execute T-003 (P0, complexity M): schema and runtime payload conformance.

Goal:
Ensure photo submission updates only valid ModelProfile fields and never fails due to schema mismatch.

Scope files:
- src/utils/photoSubmission.js
- amplify/data/resource.ts

Tasks:
1) Compare update payload keys in photo submission utility to actual ModelProfile schema fields.
2) Identify any non-schema keys and classify them:
   - remove
   - remap
   - add to schema
3) Execute integration tests for submitPhotosForAnalysis in non-mock mode path.
4) Validate error behavior if schema rejects update.

Required output format:
- "Field Conformance Matrix": payloadKey | existsInSchema | action
- "Integration Test Results"
- "Data Integrity Risk"
- "Remediation Patch Plan"
```

---

## T-004 Prompt - Booking Authorization Integrity

```text
Execute T-004 (P0, complexity L): booking auth behavior vs portal expectations.

Goal:
Confirm that model/pro/admin booking access and updates align with product behavior.

Scope files:
- amplify/data/resource.ts
- src/utils/bookingService.js
- relevant portal booking pages/components

Tasks:
1) Build role access matrix for Booking model operations (list/get/update/create).
2) Test each role:
   - model user
   - professional user
   - admin user
3) Validate whether portal calls currently assume permissions that schema does not grant.
4) Identify breakpoints and user-visible failures.

Required output format:
- "Role Access Matrix"
- "Portal Assumption Mismatches"
- "Critical Failures"
- "Remediation Patch Plan"
```

---

## T-005 Prompt - Model Onboarding Reliability

```text
Execute T-005 (P1, complexity L): model onboarding submit stability.

Goal:
Ensure model onboarding always creates/updates profile correctly with full required validations.

Scope files:
- src/pages/ModelOnboard.jsx
- amplify/data/resource.ts

Tasks:
1) Enumerate all required validations and map to schema requirements.
2) Test scenarios:
   - happy path new profile
   - existing profile update path
   - missing required field rejections
   - identity verification required vs skip flag behavior
3) Validate persisted payload for correctness.

Required output format:
- "Validation Coverage Map"
- "Scenario Result Table"
- "Persisted Field Audit"
- "Remediation Patch Plan"
```

---

## T-006 Prompt - Professional Onboarding Reliability

```text
Execute T-006 (P1, complexity L): professional onboarding integrity.

Goal:
Ensure professional onboarding reliably persists complete and correct data.

Scope files:
- src/pages/ProfessionalOnboard.jsx
- src/utils/geocoding.js
- amplify/data/resource.ts

Tasks:
1) Test full onboarding including:
   - education fields
   - workplace structured address
   - geocoding
   - portfolio minimum and per-photo service labels
2) Validate derived fields and service extraction.
3) Verify failure handling for geocoding failure and unlabeled photos.

Required output format:
- "Input -> Persisted Output Mapping"
- "Failure Mode Tests"
- "Data Quality Risks"
- "Remediation Patch Plan"
```

---

## T-007 Prompt - Matching Determinism

```text
Execute T-007 (P1, complexity M): deterministic matching behavior.

Goal:
Prove match scoring and ranking are deterministic and logically consistent.

Scope files:
- src/matching/matchingEngine.js

Tasks:
1) Build fixture sets for models and requests covering:
   - dealbreakers
   - low attribute score floor
   - location and reachability interactions
   - ties and near ties
2) Run repeated executions and verify identical outputs.
3) Validate rank stability and expected thresholds.

Required output format:
- "Fixture Catalog"
- "Determinism Check Results"
- "Ranking Stability Report"
- "Remediation Patch Plan"
```

---

## T-008 Prompt - Auto-Matching Trigger Pipeline

```text
Execute T-008 (P1, complexity L): auto-matching trigger and status transitions.

Goal:
Ensure pending requests trigger matching pipeline and produce expected DB state transitions.

Scope files:
- amplify/functions/auto-matching/handler.ts
- src/utils/autoMatching.js
- amplify/backend.ts

Tasks:
1) Validate trigger assumptions for INSERT/MODIFY pending events.
2) Run handler with representative stream-like fixtures.
3) Confirm:
   - matches created
   - auto-approve threshold behavior
   - auto-send behavior
   - request status transition to matching
4) Identify missing wiring if stream config is incomplete.

Required output format:
- "Trigger Coverage Matrix"
- "State Transition Audit"
- "Wiring Gaps"
- "Remediation Patch Plan"
```

---

## T-009 Prompt - Stripe Webhook Idempotency

```text
Execute T-009 (P2, complexity M): webhook replay safety.

Goal:
Prevent duplicate booking creation and inconsistent side effects on repeated webhook deliveries.

Scope files:
- amplify/functions/stripe-payment/handler.ts

Tasks:
1) Replay identical payment_intent.succeeded payload multiple times.
2) Verify booking creation idempotency.
3) Verify match/request update idempotency.
4) Confirm safe logging and non-fatal behavior for duplicate events.

Required output format:
- "Replay Test Results"
- "Idempotency Evidence"
- "Residual Risks"
- "Remediation Patch Plan"
```

---

## T-010 Prompt - Booking Lifecycle Correctness

```text
Execute T-010 (P2, complexity M): booking lifecycle state integrity.

Goal:
Ensure booking state changes are coherent and side effects are correct.

Scope files:
- src/utils/bookingService.js
- amplify/data/resource.ts

Tasks:
1) Test transitions:
   - create/confirm
   - complete
   - cancel with refund
   - no_show penalty path
2) Validate related record changes:
   - Match status
   - ModelRequest status
   - payment/refund fields
   - penalties and score updates

Required output format:
- "Transition Matrix"
- "Side Effect Verification"
- "Data Consistency Risks"
- "Remediation Patch Plan"
```

---

## T-011 Prompt - Notification Reliability

```text
Execute T-011 (P2, complexity M): notification side-effect reliability.

Goal:
Ensure notifications are created correctly without blocking core transaction completion.

Scope files:
- src/utils/createNotification.js
- src/utils/bookingService.js
- src/utils/matchingApi.js

Tasks:
1) Validate notification creation payload correctness for key events.
2) Simulate notification failures and verify primary workflow still succeeds.
3) Confirm user targeting and message accuracy.

Required output format:
- "Notification Event Matrix"
- "Failure Injection Results"
- "Blocking vs Non-blocking Verification"
- "Remediation Patch Plan"
```

---

## T-012 Prompt - Scheduled Jobs Correctness

```text
Execute T-012 (P2, complexity L): scheduled automation correctness.

Goal:
Ensure reminders, match expiration, and chat activation run correctly around time boundaries.

Scope files:
- amplify/functions/booking-reminders/handler.ts
- amplify/functions/match-expiration/handler.ts
- amplify/functions/chat-activation/handler.ts

Tasks:
1) Build boundary fixtures for time windows (just before, on boundary, just after).
2) Execute handlers with these fixtures.
3) Validate update/query behavior and idempotency for repeated runs.

Required output format:
- "Boundary Case Matrix"
- "Handler Result Summary"
- "Repeat-Run Safety"
- "Remediation Patch Plan"
```

---

## T-013 Prompt - Mock vs Real Mode Drift

```text
Execute T-013 (P3, complexity M): prevent mock mode from hiding production defects.

Goal:
Guarantee real mode paths are tested and validated separately from mock paths.

Scope files:
- src/utils/mockDataService.js
- src/utils/bookingService.js
- src/utils/photoSubmission.js

Tasks:
1) Enumerate all branch points controlled by mock mode flags.
2) Run equivalent tests with mock mode on and off.
3) Identify hidden failures that only appear in real mode.

Required output format:
- "Mock Branch Inventory"
- "Mock vs Real Delta Report"
- "Production Exposure Risks"
- "Remediation Patch Plan"
```

---

## T-014 Prompt - Role Route Access Matrix

```text
Execute T-014 (P3, complexity M): route boundary enforcement.

Goal:
Ensure each role sees only intended routes and is redirected correctly otherwise.

Scope files:
- src/App.jsx
- src/components/ProtectedRoute.jsx

Tasks:
1) Build route matrix for model/pro/partner/admin.
2) Test direct navigation attempts to disallowed routes.
3) Validate redirect behavior and no privilege leaks.

Required output format:
- "Role Route Matrix"
- "Disallowed Route Attempt Results"
- "Privilege Leakage Findings"
- "Remediation Patch Plan"
```

---

## T-015 Prompt - Degraded Service UX Safety

```text
Execute T-015 (P3, complexity S): resilience under API failures.

Goal:
Ensure app degrades gracefully and does not blank-screen when critical APIs fail.

Scope files:
- src/components/ErrorBoundary.jsx
- src/App.jsx

Tasks:
1) Simulate API failures and thrown rendering/runtime errors.
2) Validate fallback rendering and user guidance.
3) Confirm recoverability and no hard crash loops.

Required output format:
- "Failure Injection Scenarios"
- "Fallback UX Results"
- "Residual UX Risks"
- "Remediation Patch Plan"
```

---

## Final Consolidation Prompt (Paste After All Tests)

```text
Now produce a final audit report across T-001 through T-015 with:

1) Executive summary (max 12 bullets)
2) Open defects grouped by severity
3) P0/P1 blockers still unresolved
4) Exact code-level remediation order (top 20)
5) Test coverage gaps that still remain
6) Deployment recommendation: GO / CONDITIONAL GO / NO-GO
7) If CONDITIONAL GO or NO-GO, include strict conditions to clear release
```

