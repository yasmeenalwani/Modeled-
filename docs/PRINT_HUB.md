# Modeled — Print & organize hub

Use this page to find docs worth printing or binding. Open any file in VS Code → **Markdown: Open Preview** → **Print** (Ctrl+P / Cmd+P).

---

## Start here (roadmap & product)

| Doc | Path |
|-----|------|
| **Tech architecture & build status (print)** | `docs/TECH_ARCHITECTURE_AND_BUILD_STATUS.md` |
| **Investor / partner deck brief** | `docs/INVESTOR_PARTNER_DECK_BRIEF.md` |
| **June launch plan** | `docs/LAUNCH_PLAN_JUNE_2026.md` |
| **E2E salon → model flow** | `docs/E2E_SALON_TO_MODEL_FLOW.md` |
| **Model onboard today** | `docs/MODEL_ONBOARD_TODAY.md` |
| **One-pager source: catalog + training + pricing** | `docs/export/ONE_PAGER_SOURCE_SERVICE_TRAINING_PRICING.md` |
| **Full page inventory (admin + portals + print how-to)** | `docs/export/PAGE_INVENTORY_PRINT.md` |
| **Demo walkthrough screenshots (PNG folder + zip)** | `docs/export/demo-walkthrough-screenshots/` · zip: `demo-walkthrough-screenshots.zip` — regenerate: `npm run screenshots:demo` |
| **Claude Code master handoff (full codebase index)** | `docs/export/CLAUDE_CODE_MASTER_HANDOFF.md` |
| **Full file manifest (351 files, line counts)** | `docs/export/CODEBASE_MANIFEST.json` — regenerate: `npm run export:manifest` |
| **Cursor + Claude Code + voice workflow** | `docs/export/CURSOR_CLAUDE_CODE_WORKFLOW.md` |
| **Admin & portals handoff (gates, gaps)** | `docs/handoff/ADMIN_AND_PORTALS_CURRENT_STATE.md` |
| **Complete system overview** | `COMPLETE_SYSTEM_DOCUMENTATION.md` |
| **Documentation master index** | `DOCUMENTATION_INDEX.md` |
| **Docs folder index** | `docs/README_2026-01-05.md` |

---

## Architecture (print as “technical volume”)

| Doc | Path |
|-----|------|
| AWS architecture & costs | `docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md` |
| Dashboard architecture | `docs/architecture/DASHBOARD_ARCHITECTURE_2026-01-05.md` |
| Why DynamoDB vs RDS | `docs/architecture/WHY_DYNAMODB_VS_RDS_2026-01-05.md` |
| EventBridge / Step Functions | `docs/architecture/EVENTBRIDGE_STEP_FUNCTIONS_COMPREHENSIVE.md` |
| Photo storage strategy | `docs/architecture/2026-01-05_PHOTO_STORAGE_STRATEGY.md` |
| Architecture patterns (root) | `ARCHITECTURE_PATTERNS.md` |
| Comprehensive workflow architecture | `COMPREHENSIVE_WORKFLOW_ARCHITECTURE.md` |

---

## Database & data model

| Doc | Path |
|-----|------|
| Schema index | `docs/database/DATABASE_SCHEMA_INDEX_2026-01-05.md` |
| Hair profile schema | `docs/database/DATABASE_SCHEMA_HAIR_PROFILE_2026-01-05.md` |
| Beauty profile schema | `docs/database/DATABASE_SCHEMA_BEAUTY_PROFILE_2026-01-05.md` |
| Services schema | `docs/database/DATABASE_SCHEMA_SERVICES_2026-01-05.md` |

---

## Matching & workflows

| Doc | Path |
|-----|------|
| Matching technical writeup | `docs/MATCHING_SYSTEM_TECHNICAL_WRITEUP.md` |
| Matching process summary | `docs/features/MATCHING_PROCESS_SUMMARY_2026-01-05.md` |
| Match approval workflow | `docs/workflow/MATCHING_WORKFLOW_WITH_ADMIN_REVIEW.md` |
| Complete booking workflow | `docs/workflow/COMPLETE_BOOKING_WORKFLOW.md` |
| Agentic scoring spec | `docs/AGENTIC_SCORING_SPEC.md` |

---

## Deployment & ops

| Doc | Path |
|-----|------|
| Deployment checklist | `docs/deployment/2026-01-05_DEPLOYMENT_CHECKLIST.md` |
| MVP action plan | `docs/deployment/MVP_ACTION_PLAN_2026-01-05.md` |
| Go-live (modeledmgmt.com) | `docs/deployment/MODELEDMGMT_WWW_GO_LIVE_STEPS.md` |
| Admin & portals state | `docs/handoff/ADMIN_AND_PORTALS_CURRENT_STATE.md` |

---

## Demo URLs (no login)

| Persona | URL |
|---------|-----|
| Hub | `http://localhost/demo` |
| Seraphina (model) | `http://localhost/demo/seraphina/profile` |
| Sarah (pro) | `http://localhost/demo/sarah/profile` |
| Luxe partner | `http://localhost/demo/partner` |

---

## Suggested binders

1. **Investor / partner deck backup** — Launch plan + E2E flow + AWS architecture (costs page)
2. **Engineering** — Schema index + matching writeup + deployment checklist
3. **Operations** — Verification flow + booking workflow + MODEL_ONBOARD_TODAY

---

*Add new canonical docs here when you create them; avoid duplicating “TODAY_*.md” root files in print sets unless they’re still current.*
