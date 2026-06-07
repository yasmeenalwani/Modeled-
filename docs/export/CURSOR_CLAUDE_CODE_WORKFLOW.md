# Cursor + Claude Code + Voice — How to run both AIs on Modeled

You have **two AI coding surfaces** on the same repo. This is the practical workflow.

---

## Roles

| Tool | Best for |
|------|----------|
| **Cursor (this agent)** | Fast edits in IDE, running `npm run dev`, screenshots, reading your screen context, executing fixes after Claude plans |
| **Claude Code** | Long autonomous passes, multi-file refactors, reading huge handoff docs, terminal on its own clone |

They do **not** auto-sync. **Git** or **shared markdown handoffs** are the bridge.

---

## Recommended loop (voice-friendly)

### 1. You speak → Cursor plans
> “Fix model onboard so admin sees pending profiles.”

Cursor reads `docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md`, makes changes, runs dev server.

### 2. You test in browser (voice what you see)
> “I submitted as model but onboarding queue is empty.”

Tell Cursor exactly what you see. Cursor adjusts (e.g. dev `active` status bug).

### 3. Big pass → Claude Code
Copy prompt from `CLAUDE_CODE_MASTER_HANDOFF.md` §10 into Claude Code with:
- `docs/export/CLAUDE_CODE_MASTER_HANDOFF.md`
- `docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md`
- `CODEBASE_MANIFEST.json`

Claude Code works in its workspace. When done, it should list **files changed**.

### 4. Bring Claude’s work back to Cursor
```powershell
git status
git diff
```
Paste Claude’s summary into Cursor:
> “Claude changed ProfessionalOnboard userId and PartnerOnboard thanks redirect — verify and run E2E.”

Cursor reviews diff, fixes conflicts, runs tests.

### 5. Commit when stable (you ask explicitly)
One commit per fix area: `fix(onboard): cognito userId on pro/partner/waitlist`

---

## Voice activation tips (Windows)

| You say | Cursor should |
|---------|----------------|
| “Run dev” | `npm run dev` → http://localhost:80 |
| “Open admin” | http://localhost:80/admin |
| “Demo model” | http://localhost:80/demo/seraphina/profile |
| “Test model onboard” | `/join?role=model` walkthrough |
| “What broke?” | Read last error / Network tab / console |
| “Export for Claude” | Point to `docs/export/CLAUDE_CODE_MASTER_HANDOFF.md` |
| “Screenshot walkthrough” | `npm run screenshots:demo` |

**Cursor voice:** Use Cursor’s built-in voice input (if enabled) the same way — one clear command per turn.

**Claude Code:** Does not see your browser. You must **describe** what’s on screen or paste errors.

---

## Avoid conflicts

1. **One AI at a time** on the same files, OR use git branches:
   - `cursor/onboard-fixes`
   - `claude/onboard-fixes`
2. **Shared source of truth:** `docs/handoff/ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md` — update task list when something is done.
3. **Don’t duplicate work:** If Cursor fixed `userId`, tell Claude “skip item 1, already done in commit abc.”

---

## Files to keep open

| File | Why |
|------|-----|
| `CLAUDE_CODE_MASTER_HANDOFF.md` | Index for both AIs |
| `ONBOARDING_E2E_CLAUDE_CODE_BRIEF.md` | Current sprint tasks |
| `.env.local` | Mock/real API, beta gate |

---

## What we cannot do today

- **No live link** between Cursor and Claude Code (no shared session).
- **No automatic voice** from browser → both AIs (you narrate).
- **Full 134k-line paste** into Claude — use repo + manifest + section handoffs instead.

---

## Quick start today

1. Cursor: say **“execute onboarding brief P0 fixes”**
2. You: test `/join?role=model` → `/admin/onboarding`
3. Claude Code: paste §10 prompt from master handoff for anything Cursor didn’t finish
4. Cursor: **“merge Claude’s changes”** with pasted file list
