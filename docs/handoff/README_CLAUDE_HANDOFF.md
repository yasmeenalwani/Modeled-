# Claude Test Handoff Bundle

This folder contains copy/paste-ready files you can hand to Claude Code to execute a strategic test and hardening program for Modeled.

## Files

- `CLAUDE_RETURN_BUNDLE_SCHEMA_CRM_ONBOARDING.md`
  - **Reply to Claude:** CRM “schema not deployed” source, onboarding vs `PrivateBetaLaunch`, what to paste, admin smoke-test checklist
- `ADMIN_AND_PORTALS_CURRENT_STATE.md`
  - **Admin + all three portals:** routes, auth gates (`PrivateBetaLaunch`, `PortalStatusGate`, `ProtectedRoute`), sidebar vs registered routes, known gaps — handoff for audits or refactors
- `WAITLIST_QA_CLAUDE_HANDOFF.md`
  - **Waitlist-only launch:** what to attach for design/UX review, local + deploy test steps, pre-public gaps, atomic prompts (T-WL-001…), and a master Claude prompt
- `MODELED_TEST_HANDOFF_MASTER_PLAN.md`
  - Risk-based strategy
  - Priority waves (P0-P3)
  - Complexity sizing (S/M/L/XL)
  - Exit criteria before deployment
- `modeled_test_matrix.csv`
  - Excel-ready test matrix
  - One row per test objective with goals, scope, and pass criteria
- `CLAUDE_PROMPT_PACK.md`
  - Copy/paste prompts to run in Claude
  - Includes a master orchestrator prompt and 15 detailed test prompts

## Recommended Usage

1. Start with `CLAUDE_PROMPT_PACK.md`.
2. Paste the "Master Orchestrator Prompt" into Claude first.
3. Then run prompts in this order:
   - P0: `T-001` through `T-004`
   - P1: `T-005` through `T-008`
   - P2: `T-009` through `T-012`
   - P3: `T-013` through `T-015`
4. Keep `modeled_test_matrix.csv` open in Excel to track progress.
5. Require Claude to produce:
   - test artifacts created
   - failing tests with root causes
   - exact file-level remediation proposals
   - risk rating per issue

## Definition of Done

- All P0 items passing
- No open auth/security blockers
- No payment idempotency or duplicate booking defects
- Onboarding flows stable in non-mock mode
- Matching and booking workflows reproducible in staging

