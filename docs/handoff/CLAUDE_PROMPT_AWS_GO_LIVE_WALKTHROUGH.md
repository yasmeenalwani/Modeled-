# Copy-paste for Claude: walk me through AWS go-live + credits

**Instructions for you (Claude):**  
- Walk the user through **one small step at a time**. After each step, **stop** and ask them to confirm completion (or paste errors/screenshots) before continuing.  
- Assume the user is on **Windows**, may not have **AWS CLI** installed (console-first is fine).  
- Canonical site: **`https://www.modeledmgmt.com`**. Apex domain: **`modeledmgmt.com`** (they should redirect apex → www later).  
- They have **~$119 AWS promotional credits expiring in ~10 days** — address **how credits apply**, **what to deploy first to use them**, and **what might not be covered** (e.g. some registrar/domain charges).  
- Do **not** invent AWS console button labels if unsure; say “search the console for X” or “open service Y”.  
- If they lack prerequisites (no AWS account, no domain), call that out before deep steps.

**Context for the project:**  
- React + Vite frontend in repo `modeled-frontend`; production build is `npm run build` → `dist/`.  
- Backend is **AWS Amplify Gen 2** (Cognito, AppSync, DynamoDB, S3, Lambdas). Config lives under `amplify/`.  
- After go-live, shareable onboarding links (full forms, not short waitlist-only):  
  - `https://www.modeledmgmt.com/join?role=model`  
  - `https://www.modeledmgmt.com/join?role=professional`  
  - `https://www.modeledmgmt.com/join?role=partner`  
- Detailed runbook path in repo: `docs/deployment/MODELEDMGMT_WWW_GO_LIVE_STEPS.md` (Phase A = Route 53 + hosted zone + registrar nameservers; later phases = Amplify deploy, custom domain, Cognito callbacks, SES).

---

## Paste everything below this line into Claude

```
You are my AWS deployment coach. I need step-by-step guidance only—one sub-step at a time, then wait for my “done” or my error message before the next sub-step.

Context:
- Domain: modeledmgmt.com. I want the public site at https://www.modeledmgmt.com (www as canonical).
- I have about $119 in AWS promotional credits that expire in about 10 days. I want to know: (1) how to confirm credits are on my account and what they cover, (2) what to deploy/configure first so credits actually get used before expiry, (3) what charges might NOT be covered (e.g. domain purchase outside normal AWS service billing).
- I may not have AWS CLI installed; prefer AWS Console clicks unless CLI is clearly better.
- My app is a React+Vite SPA with Amplify Gen2 backend (Cognito, AppSync, DynamoDB, S3). After DNS/hosting work, onboarding links will be:
  https://www.modeledmgmt.com/join?role=model
  https://www.modeledmgmt.com/join?role=professional
  https://www.modeledmgmt.com/join?role=partner

Start with Phase 0—prerequisites check (account access, whether I already own the domain, whether Route 53 or another DNS will be used). Then Phase A—Route 53 public hosted zone for modeledmgmt.com and nameserver delegation at my registrar if needed. Remind me not to create a random www CNAME until Amplify gives me the exact records.

For credits: tell me exactly where in AWS Billing to look (Credits / Cost Explorer) and a sensible order of operations so infra posts charges while credits are still valid.

Begin with Phase 0 only. Ask me 3–5 yes/no or short questions, then give me only the first concrete action.
```

---

## Optional second message to Claude (after Phase A is done)

Paste when Route 53 is ready:

```
Phase A is done: Route 53 public hosted zone exists for modeledmgmt.com and nameservers are delegated (or Route 53 is registrar). Next: Amplify Hosting + custom domain www.modeledmgmt.com. Walk me one sub-step at a time: create/link Amplify app, connect Git branch, add custom domain, add the DNS records Amplify shows into Route 53, wait for certificate/domain status. Stop after each sub-step for my confirmation.
```
