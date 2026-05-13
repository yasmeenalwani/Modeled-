# Go-live runbook: `www.modeledmgmt.com`

Use this as a **single ordered checklist**. Your **shareable onboarding links** (full forms) after go-live:

| Role | URL |
|------|-----|
| Model | `https://www.modeledmgmt.com/join?role=model` |
| Professional | `https://www.modeledmgmt.com/join?role=professional` |
| Partner | `https://www.modeledmgmt.com/join?role=partner` |
| Choose role | `https://www.modeledmgmt.com/join` |

**QR codes:** Encode exactly the HTTPS URLs above (any QR generator).

---

## Before you start (0)

- [ ] **0.1** You have access to **Route 53** (or whoever hosts DNS for `modeledmgmt.com`).
- [ ] **0.2** You have an **AWS account** and permission for **Amplify**, **Cognito**, **SES**, **ACM** (certificates).
- [ ] **0.3** Decide **apex vs www:** This runbook assumes the **canonical public site is `https://www.modeledmgmt.com`**. Plan to redirect `https://modeledmgmt.com` → `https://www.modeledmgmt.com` (SEO + one Cognito URL set).

---

## Phase A — Domain + Route 53 (`modeledmgmt.com`)

Do **Phase A** before Amplify custom domain (Amplify will tell you which DNS records to create **after** you start domain setup there).

### A.1 Own the domain

- [ ] **A.1a** If you do **not** already own `modeledmgmt.com`: register it (**Route 53 → Registered domains → Register domain**), or buy it at Namecheap, GoDaddy, Google Domains, etc.

### A.2 Route 53 hosted zone

- [ ] **A.2a** AWS Console → **Route 53** → **Hosted zones** → **Create hosted zone**.
- [ ] **A.2b** **Domain name:** `modeledmgmt.com` (apex only — the zone covers `www` and all subdomains).
- [ ] **A.2c** Type: **Public hosted zone** → Create.

### A.3 Point the registrar at Route 53 (required if domain is NOT “Route 53 as registrar”)

After the zone is created, Route 53 shows **four NS records** (e.g. `ns-1234.awsdns-12.org` …).

- [ ] **A.3a** Open your **domain registrar** (where you bought the name).
- [ ] **A.3b** Find **DNS / nameservers** (not “forwarding”).
- [ ] **A.3c** Replace the registrar’s default nameservers with **exactly** the **four** `NS` values from the Route 53 hosted zone (remove `www.` — these are for the **root** domain delegation).
- [ ] **A.3d** Save. Propagation can take **minutes to 48 hours** (often under an hour).

**If the domain was registered in Route 53 when you created the hosted zone**, AWS often wires delegation automatically — still open the hosted zone and confirm it shows **NS** and **SOA** records.

### A.4 Quick check (optional)

- [ ] **A.4a** From PowerShell: `nslookup -type=NS modeledmgmt.com` — you should eventually see your **awsdns** nameservers.

### A.5 What *not* to do yet

- Do **not** guess a **CNAME for `www`** until **Amplify Hosting → Custom domains** gives you the exact **target** (you’ll add that in **Phase B**). Wrong CNAME breaks SSL and routing.

**Phase A done when:** `modeledmgmt.com` uses Route 53’s four nameservers (or Route 53 shows the zone active with NS/SOA), and you can open the hosted zone and click **Create record** for the next phase.

---

## Step 1 — Production backend (Amplify Gen 2)

**Goal:** A stable deployed backend (not a personal sandbox) whose `amplify_outputs.json` you will ship with the frontend.

- [ ] **1.1** Connect this repo to **Amplify Gen 2** (Amplify Console → Create app → Git provider), or use your existing Amplify app with a **production** branch (e.g. `main`).
- [ ] **1.2** In the Amplify build settings, ensure **build spec** runs backend deploy then frontend build. (If you do not have `amplify.yml` yet, add one in the repo or configure in Console: install deps → `npx ampx pipeline-deploy` or your team’s equivalent → `npm run build` → publish `dist/`.)
- [ ] **1.3** Complete the first **successful** pipeline deploy so **Cognito**, **AppSync**, **S3**, and **Lambdas** exist in the **target AWS account/region**.
- [ ] **1.4** Download or confirm **`amplify_outputs.json`** for **that** environment is what the hosted site will load (often generated during CI into `amplify_outputs.json` at repo root).

**Done when:** App exists in Amplify Console; backend resources show green; you have the correct `amplify_outputs.json` for prod.

---

## Step 2 — Frontend hosting + custom domain `www.modeledmgmt.com`

**Goal:** `https://www.modeledmgmt.com` serves your Vite build over HTTPS.

- [ ] **2.1** In **Amplify Hosting** (same app as backend, or linked), enable **Hosting** and connect the branch you deploy from.
- [ ] **2.2** Add **custom domain** `www.modeledmgmt.com` in Amplify → Hosting → Custom domains.
- [ ] **2.3** ACM will issue a certificate; **add the DNS records** Amplify shows (usually CNAME for `www` and possibly for validation).
- [ ] **2.4** Wait until Amplify shows domain **Available** and HTTPS works in a browser.
- [ ] **2.5** (Recommended) Add **`modeledmgmt.com`** (apex) as a domain that **redirects (301)** to `https://www.modeledmgmt.com` in Amplify or DNS provider rules.

**Done when:** Opening `https://www.modeledmgmt.com` loads your app (even if auth is not finished yet).

---

## Step 3 — Cognito app client: callbacks for your real URL

**Goal:** Sign-up / sign-in from the hosted UI and Amplify Authenticator work on production, not only on localhost.

- [ ] **3.1** AWS Console → **Cognito** → your **User pool** (ID is inside `amplify_outputs.json` under `auth`).
- [ ] **3.2** **App integration** → **App client** (hosted UI / SPA client Amplify created).
- [ ] **3.3** Under **Hosted UI** (or OAuth settings), set **Allowed callback URLs** to include at least:
  - `https://www.modeledmgmt.com/`
  - `https://www.modeledmgmt.com`
  - (Keep dev) `http://localhost:5173/` if you still test locally with that pool **or** use a separate sandbox pool for local.
- [ ] **3.4** Set **Allowed sign-out URLs** similarly:
  - `https://www.modeledmgmt.com/`
  - `http://localhost:5173/` (optional, for dev)
- [ ] **3.5** Save. Wait a minute; test **incognito**: open `https://www.modeledmgmt.com/join?role=model` → create account → confirm you are not stuck on redirect errors.

**Done when:** A new user can verify email (if required) and land back on your site signed in.

---

## Step 4 — Email (SES) so Cognito messages deliver

**Goal:** Verification / password emails are not dropped (SES sandbox only sends to verified addresses).

- [ ] **4.1** In **SES**, verify **identity** for the **from** address or domain you use in [`amplify/auth/resource.ts`](../../amplify/auth/resource.ts) (`AMPLIFY_SES_FROM_EMAIL` / `noreply@modeled.app` or your chosen sender).
- [ ] **4.2** If the account is still in **SES sandbox**, either verify test recipient emails **or** request **production access** before inviting strangers.
- [ ] **4.3** Ensure **Cognito** has permission to use that SES identity (Amplify Gen2 often wires this on deploy; if emails fail, check Cognito’s email configuration and IAM).

**Done when:** You receive a real verification email at a **non-verified** inbox (proves prod SES path) **or** you consciously stay in sandbox for a closed pilot with verified emails only.

---

## Step 5 — Smoke test the full onboarding (production)

- [ ] **5.1** Incognito → `https://www.modeledmgmt.com/join?role=model` → full flow → submit.
- [ ] **5.2** Confirm row in **DynamoDB** (or Admin UI) for `ModelProfile` with your test user’s `userId`.
- [ ] **5.3** Repeat spot-check for professional/partner if you send those links.

**Done when:** Data lands in the **production** table you expect.

---

## Step 6 — Optional hardening (same week if time)

- [ ] **6.1** Set `VITE_FULL_APP_ACCESS` **unset** or `false` in production so non-admins see private beta after sign-in (your current product choice).
- [ ] **6.2** Add **Admin** Cognito user in group `Admin` for you to review applicants in `/admin`.
- [ ] **6.3** If photo uploads fail from production only: check **S3 CORS** and browser console for blocked `https://www.modeledmgmt.com` origin (Amplify storage often configures this with Gen2; fix in backend if needed).

---

## Quick reference — AWS pieces touched

| Service | Why |
|---------|-----|
| **Amplify Hosting** | Serves SPA + TLS + custom domain |
| **ACM** | Certificate for `www.modeledmgmt.com` |
| **Cognito** | Users + groups; callback URLs must match domain |
| **AppSync + DynamoDB** | Saves `ModelProfile` / `Professional` / `Partner` |
| **S3** | Profile / ID photos |
| **SES** | Transactional email from Cognito / app |

---

## If something fails

| Symptom | Likely fix |
|---------|------------|
| Blank app / wrong backend | Wrong `amplify_outputs.json` for this deploy |
| `redirect_mismatch` / auth loop | Cognito callback / sign-out URLs missing `https://www.modeledmgmt.com` |
| No verification email | SES sandbox or unverified sender |
| CORS on REST / S3 | Allowed origin must include `https://www.modeledmgmt.com` |

---

*Canonical hostname: `https://www.modeledmgmt.com`. Update this file if you switch to apex-only or add staging subdomains.*
