# Modeled Platform Test and Deployment Readiness Plan

## Objective

Stabilize onboarding, matching, payment, booking, and operational workflows with a risk-first, production-focused test program.

## Strategic Prioritization Framework

### Priority Levels

- **P0 (Blocker):** Security, payment integrity, authorization, data corruption, runtime crashes in critical paths.
- **P1 (High):** Core user and revenue workflows (onboarding, matching, booking initiation).
- **P2 (Medium):** Reliability, idempotency, notifications, and scheduled automation.
- **P3 (Low):** Drift prevention, role boundary hardening, degraded UX behavior.

### Complexity Scale

- **S (Small):** Isolated function/module tests with minimal setup.
- **M (Medium):** Multi-function integration tests with fixture data and mocked dependencies.
- **L (Large):** Cross-layer tests across frontend utility, backend lambda, and schema/auth constraints.
- **XL (Very Large):** End-to-end multi-role workflows, time-based jobs, and reproducibility checks.

## Core Risks to Eliminate First

1. Open payment/refund attack surface.
2. Runtime faults in card-on-file/payment method attach flow.
3. Schema/runtime mismatch in photo onboarding writes.
4. Booking authorization mismatch between data schema and portal expectations.
5. Trigger reliability for auto-matching and status transitions.

## Execution Waves

## Wave 1 - P0 Blockers (Ship-stoppers)

### T-001 Stripe Endpoint Access Control
- **Complexity:** M
- **Goal:** Ensure payment and refund routes reject unauthorized access.
- **Validates:** API auth mode, route policy, expected IAM/Cognito constraints.

### T-002 Payment Method Attach Runtime Safety
- **Complexity:** S
- **Goal:** Catch and prevent runtime exceptions during card-on-file setup.
- **Validates:** parameter handling, payload shape, undefined references.

### T-003 Photo Submission Schema Conformance
- **Complexity:** M
- **Goal:** Prevent onboarding write failures due to schema mismatch.
- **Validates:** update payload fields against `ModelProfile` schema.

### T-004 Booking Authorization Integrity
- **Complexity:** L
- **Goal:** Confirm correct read/update permissions for model/pro/admin roles.
- **Validates:** real role behavior against schema authorization.

## Wave 2 - P1 Core Workflow Integrity

### T-005 Model Onboarding Submit Reliability
- **Complexity:** L
- **Goal:** Ensure create/update flow is deterministic and complete.
- **Validates:** required fields, final payload mapping, duplicate profile handling.

### T-006 Professional Onboarding Submit Reliability
- **Complexity:** L
- **Goal:** Ensure education/workplace/portfolio/geocode flow is robust.
- **Validates:** address integrity, geocode path, service labels, submission behavior.

### T-007 Matching Score Determinism
- **Complexity:** M
- **Goal:** Ensure score calculations and rank ordering are consistent.
- **Validates:** weighting, dealbreakers, reachability, deterministic outputs.

### T-008 Auto-Matching Trigger Pipeline
- **Complexity:** L
- **Goal:** Ensure pending requests result in expected match operations.
- **Validates:** trigger handling, match creation, approval/send logic, status updates.

## Wave 3 - P2 Reliability and Operations

### T-009 Stripe Webhook Idempotency
- **Complexity:** M
- **Goal:** Prevent duplicate booking creation on replayed events.
- **Validates:** safe repeated processing of payment success events.

### T-010 Booking Lifecycle State Correctness
- **Complexity:** M
- **Goal:** Enforce consistent state transitions and side effects.
- **Validates:** confirm, complete, cancel, refund, no-show pathways.

### T-011 Notification Dispatch Reliability
- **Complexity:** M
- **Goal:** Ensure notification side effects are reliable but non-blocking.
- **Validates:** notification creation under success and partial failure.

### T-012 Scheduled Job Correctness
- **Complexity:** L
- **Goal:** Ensure reminder/expiration/chat jobs do expected updates on schedule.
- **Validates:** time-window logic, query/update correctness, repeat behavior.

## Wave 4 - P3 Hardening and Drift Prevention

### T-013 Mock vs Real Mode Drift Detection
- **Complexity:** M
- **Goal:** Prevent false confidence from mock fallbacks.
- **Validates:** production path is actually exercised and tested.

### T-014 Role Route Access Matrix
- **Complexity:** M
- **Goal:** Confirm route boundary enforcement by role.
- **Validates:** role-specific path access and redirects.

### T-015 Degraded Service UX Safety
- **Complexity:** S
- **Goal:** Ensure app remains usable under API failures.
- **Validates:** error boundaries, fallback messages, no blank screen regressions.

## Test Output Requirements (for Claude)

For each test ID, require:

1. **Scope recap** (what is tested and why).
2. **Test implementation** (files, fixtures, mocks).
3. **Execution result** (pass/fail, command output summary).
4. **Failures and root cause** (file-level diagnosis).
5. **Risk score** (`critical`, `high`, `medium`, `low`).
6. **Remediation proposal** (specific code edits).
7. **Regression guard suggestion** (new tests to prevent reoccurrence).

## Exit Criteria Before Deployment

- All P0 tests passing.
- No unresolved security or payment-critical defects.
- No duplicate payment/booking creation defects.
- Onboarding create/update stable in non-mock mode.
- Matching and booking reproducible with deterministic outcomes.
- Scheduled jobs validated for expected windows and transitions.

