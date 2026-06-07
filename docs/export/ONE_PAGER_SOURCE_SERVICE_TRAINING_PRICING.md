# Modeled — One-Pager Source: Service Catalog, Training Pipeline & Pricing Calculator

**Purpose:** Feed this document to Claude (or any designer) to build a sales/investor one-pager.  
**Source of truth in code:** `src/admin/data/services.js`, `src/admin/data/training.js`, `src/admin/pages/PricingCalculatorPage.jsx`  
**Admin UI:** `/admin/crm` → **Pricing Calculator** tab

---

## 1. How pricing works (30-second model)

| Role | Pays | Gets |
|------|------|------|
| **Professional** | % of full service price per **paid** training session → Modeled (`professionalFee`) | Hands-on practice on real models; tips from models; builds client pipeline |
| **Model** | Flat **booking fee** per session → Modeled (`modelFee`) | Discounted beauty service (full `price` is salon list value; model pays less) |
| **Modeled** | — | `professionalFee` + `modelFee` = **totalRevenue** per booking |

- **`price`** = full salon list price for the service (what the service is “worth” in-market).
- Fee **percents** vary by service complexity (color lower %, quick services higher %).
- Training programs add **2 free sessions** per pro: test-out + first client (not paid by pro to Modeled).

---

## 2. Full service catalog (32 services)

| ID | Service | Category | List price | Duration | Pro % | Pro fee | Model % | Model fee | Modeled total |
|----|---------|----------|------------|----------|-------|---------|---------|-----------|---------------|
| haircut | Women's haircut | Hair — Cuts & styling | $125 | 90 min | 17% | $21 | 20% | $25 | $46 |
| mens_cut | Men's haircut | Hair — Cuts & styling | $95 | 60 min | 17% | $16 | 20% | $19 | $35 |
| blowdry | Blowdry / blowout | Hair — Cuts & styling | $90 | 60 min | 17% | $15 | 22% | $20 | $35 |
| updo | Updo / special occasion | Hair — Cuts & styling | $175 | 90 min | 15% | $26 | 18% | $32 | $58 |
| styling | Styling session | Hair — Cuts & styling | $100 | 75 min | 17% | $17 | 20% | $20 | $37 |
| color | Single process color | Hair — Color | $300 | 180 min | 12% | $36 | 10% | $30 | $66 |
| highlights | Highlights / foils | Hair — Color | $225 | 150 min | 12% | $27 | 13% | $30 | $57 |
| balayage | Balayage / hand-paint | Hair — Color | $275 | 180 min | 12% | $33 | 12% | $33 | $66 |
| gloss | Gloss / toner | Hair — Color | $100 | 90 min | 17% | $17 | 25% | $25 | $42 |
| root_touchup | Root touch-up | Hair — Color | $160 | 90 min | 14% | $22 | 15% | $24 | $46 |
| color_correction | Color correction | Hair — Color | $350 | 240 min | 10% | $35 | 10% | $35 | $70 |
| keratin | Keratin / smoothing | Hair — Treatments | $300 | 150 min | 12% | $36 | 12% | $35 | $71 |
| deep_conditioning | Deep conditioning / mask | Hair — Treatments | $85 | 60 min | 18% | $15 | 22% | $19 | $34 |
| scalp_treatment | Scalp treatment | Hair — Treatments | $75 | 45 min | 18% | $14 | 22% | $17 | $31 |
| extensions | Hair extensions | Hair — Extensions | $400 | 180 min | 10% | $40 | 10% | $40 | $80 |
| extensions_consult | Extensions consultation | Hair — Extensions | $0 | 30 min | 0% | $0 | 0% | $0 | $0 |
| makeup | Makeup application | Beauty | $200 | 90 min | 15% | $30 | 15% | $30 | $60 |
| brows | Brows / lamination | Beauty | $50 | 45 min | 20% | $10 | 25% | $13 | $23 |
| lashes | Lash lift / tint | Beauty | $160 | 75 min | 15% | $24 | 18% | $29 | $53 |
| nails_manicure | Manicure | Beauty | $65 | 60 min | 18% | $12 | 22% | $14 | $26 |
| nails_pedi | Pedicure | Beauty | $75 | 75 min | 18% | $14 | 22% | $17 | $31 |
| skincare | Skincare / facial | Beauty | $120 | 60 min | 15% | $18 | 18% | $22 | $40 |
| waxing | Waxing / threading | Beauty | $45 | 30 min | 20% | $9 | 25% | $11 | $20 |
| bridal_hair | Bridal hair | Bridal | $250 | 120 min | 12% | $30 | 12% | $30 | $60 |
| bridal_makeup | Bridal makeup | Bridal | $250 | 90 min | 12% | $30 | 12% | $30 | $60 |
| bridal_trial | Bridal trial | Bridal | $150 | 90 min | 14% | $21 | 15% | $23 | $44 |

**Category roll-up (avg Modeled revenue per booking):** ~$44 across catalog (range $20–$80).

**Packages (promo layer — mock data):**

| Package | Services bundled | List sum | Package price | Discount |
|---------|------------------|----------|---------------|----------|
| Holiday Glam | color + haircut + blowdry | $515 | $450 | 12.6% |
| New Model Welcome | haircut + blowdry | $215 | $180 | 16.3% |
| Color Specialist Training | highlights + gloss | $325 | $280 | 13.8% |

---

## 3. Professional training pipeline

### Program structure

| Track | Total hours | Modules | Focus |
|-------|-------------|---------|-------|
| **Blowouts & Styling** | 250 hrs | 10 | Speed, finish, client comms, product control |
| **Haircuts** | 250 hrs | 10 | Precision, sectioning, scissor/razor, trends |
| **Color** | 300 hrs | 10 | Consultation, formulation, application, correction basics |
| **Total certification path** | **800 hrs** | 30 modules | Full pro certification |

### Blowouts & Styling — modules (250 hrs)

| Module | Hours | Type |
|--------|-------|------|
| Blowout Fundamentals | 20 | video |
| Round Brush Techniques | 30 | video |
| Smoothing & Shine | 25 | hands-on |
| Volume & Body | 30 | hands-on |
| Curly to Straight | 35 | hands-on |
| Product Knowledge | 15 | quiz |
| Speed Training | 40 | hands-on |
| Client Consultation | 20 | video |
| Styling Finishing | 25 | hands-on |
| Final Assessment | 10 | assessment |

### Haircuts — modules (250 hrs)

| Module | Hours | Type |
|--------|-------|------|
| Cutting Fundamentals | 25 | video |
| Sectioning & Mapping | 20 | video |
| Scissor Techniques | 35 | hands-on |
| Razor Cutting | 30 | hands-on |
| Layering Techniques | 30 | hands-on |
| Bob & Lob Cuts | 25 | hands-on |
| Textured Cuts | 25 | hands-on |
| Men's Cutting Basics | 20 | hands-on |
| Trend Adaptations | 25 | video |
| Final Assessment | 15 | assessment |

### Color — modules (300 hrs)

| Module | Hours | Type |
|--------|-------|------|
| Color Theory | 30 | video |
| Consultation & Analysis | 25 | video |
| Product & Formulation | 35 | quiz |
| Root Touch-Up | 30 | hands-on |
| Global Color | 35 | hands-on |
| Highlights - Foils | 40 | hands-on |
| Highlights - Balayage | 40 | hands-on |
| Toning & Glazing | 25 | hands-on |
| Color Correction Basics | 25 | hands-on |
| Final Assessment | 15 | assessment |

### Pro onboarding gates (before / during training)

1. **Profile** — bio, portfolio, photo  
2. **Verification** — ID, selfie, cosmetology license, background consent  
3. **Documents** — service agreement, NDA, code of conduct, payment terms  
4. **Initial training** — platform overview, model guidelines, safety, booking, ratings  
5. **Skills assessment** — category selection, experience quiz, availability  
6. **Final approval** — admin review → account activation  

**Pro statuses:** `pending_verification` → `in_onboarding` → `in_training` → `active` (or suspended/inactive)

### Training hours logged per booking (mandatory)

- After photo(s), model rating, overall experience write-up, technical notes, training category (Blowouts / Haircuts / Color)  
- Hours only count after form complete — prevents fake logging  

---

## 4. Pricing calculator — inputs & formulas

**Location:** Admin → CRM → Pricing Calculator (`PricingCalculatorPage.jsx`)

### Inputs

| Input | Default | Notes |
|-------|---------|-------|
| Mode | Single Pro | Or **Partner / Salon** (multi-pro scale) |
| Service | Blowdry ($90) | Pulls catalog price; can override via URL fetch or manual $ |
| Sessions / week | 2 | 1–7 |
| Commitment (months) | 6 | 1–24 |
| Pro pays (% of list price) | 20% | Sales-adjustable; catalog uses per-service % |
| Model booking fee ($) | $20 | Auto-fills from catalog `modelFee` on service change |
| Est. tip % (pro ROI) | 20% | For talking points only |
| Partner: # of pros | 1 | Scales revenue |
| Partner: salon discount | 0% | Subtracts from pro % (e.g. 20% pro − 5% salon = 15% effective) |

### Constants

- `WEEKS_PER_MONTH = 4.33`
- `PRO_FREE_SESSIONS = 2` (test-out + first client — in pipeline, not pro-paid)

### Formulas

```
paidSessions     = round(sessionsPerWeek × 4.33 × months)
totalModels      = paidSessions + 2

proRevenue       = paidSessions × (fullPrice × effectiveProPercent / 100)
modelRevenue     = totalModels × modelBookingFee
totalModeled     = proRevenue + modelRevenue

tipsEarned       = totalModels × (fullPrice × tipPercent / 100)   // pro keeps
pipelineValue    = totalModels × fullPrice                        // future client $ at full price

partner scaled   = (proRevenue + modelRevenue) × proCount
effectivePro%    = proPercent − salonDiscountPercent  (partner mode)
proPayment/month ≈ sessionsPerWeek × 4.33 × fullPrice × effectivePro% / 100
```

---

## 5. Pricing calculator — worked scenarios

Use these tables on the one-pager as “example programs.” Tip % = 20% in all scenarios below.

### Scenario A — Default sales deck (Blowdry, 6 months, 2 sessions/week)

| Assumption | Value |
|------------|-------|
| List price | $90 |
| Pro pays | 20% ($18/session) |
| Model booking fee | $20/session |
| Paid sessions | 52 |
| Total models (incl. 2 free) | 54 |

| Metric | Amount |
|--------|--------|
| Modeled — from pro | $936 |
| Modeled — from models | $1,080 |
| **Total Modeled profit** | **$2,016** |
| Pro est. tips (during program) | $972 |
| Pro pipeline value (54 clients × $90) | $4,860 |
| Pro pays Modeled / month (approx) | ~$156 |

---

### Scenario B — Blowdry using **catalog** fee rates (17% pro, $20 model)

| Metric | Amount |
|--------|--------|
| Total Modeled profit | $1,876 |
| Pro side | $796 |
| Model side | $1,080 |

---

### Scenario C — Haircut track (6 mo, 2/wk, catalog: 17% / $25 model)

| Assumption | Value |
|------------|-------|
| List price | $125 |
| Paid sessions / total models | 52 / 54 |

| Metric | Amount |
|--------|--------|
| **Total Modeled profit** | **$2,455** |
| Pro est. tips | $1,350 |
| Pipeline value | $6,750 |

---

### Scenario D — Color track (6 mo, 1/wk, catalog: 12% / $30 model)

| Assumption | Value |
|------------|-------|
| List price | $300 |
| Paid sessions / total models | 26 / 28 |

| Metric | Amount |
|--------|--------|
| **Total Modeled profit** | **$1,776** |
| Pro est. tips | $1,680 |
| Pipeline value | $8,400 |

---

### Scenario E — Balayage intensive (3 mo, 3/wk, catalog: 12% / $33 model)

| Assumption | Value |
|------------|-------|
| List price | $275 |
| Paid sessions / total models | 39 / 41 |

| Metric | Amount |
|--------|--------|
| **Total Modeled profit** | **$2,640** |
| Pro est. tips | $2,255 |
| Pipeline value | $11,275 |

---

### Scenario F — Partner / salon (5 pros, blowdry, 6 mo, 2/wk, 5% salon discount on pro rate)

| Assumption | Value |
|------------|-------|
| Effective pro % | 15% (20% − 5%) |
| Per-pro Modeled profit | $1,782 |
| **Salon total (×5 pros)** | **$8,910** |

---

### Scenario G — Light / entry program (Gloss, 3 mo, 1/wk, catalog)

| Assumption | Value |
|------------|-------|
| List price | $100 |
| Paid sessions / total models | 13 / 15 |

| Metric | Amount |
|--------|--------|
| **Total Modeled profit** | **$596** |
| Pipeline value | $1,500 |

---

## 6. One-pager talking points (copy-ready)

**For professionals**
- Pay a small % of salon list price per model session — not full booth rent.
- Get 50+ real clients through training (paid sessions + 2 complimentary pipeline builders).
- Earn tips (~20% of service value) while building a rebook pipeline at full salon pricing later.
- 800-hour structured path: Blowouts (250h) + Haircuts (250h) + Color (300h).

**For models**
- Booking fee as low as $11–$40 depending on service — access to $45–$400 services.
- Cherry-picked, inclusive self-care opportunity.

**For Modeled / investors**
- Dual-sided unit economics: every booking = pro fee + model fee.
- Example 6-month blowdry program: **~$2K Modeled profit per pro** at default calculator settings.
- Salon scale: 5 pros on same program → **~$9K** (Scenario F).
- Highest per-booking platform take: extensions ($80), color correction ($70), keratin ($71).

**For partners / salons**
- Multi-pro calculator mode; optional salon-level discount on pro %.
- Partner maintains own `servicesList` menu; platform fees align to Modeled catalog logic.

---

## 7. File reference

| File | Contents |
|------|----------|
| `src/admin/data/services.js` | Full 32-service catalog |
| `src/admin/data/training.js` | 800hr curriculum + onboarding steps |
| `src/admin/pages/PricingCalculatorPage.jsx` | Interactive calculator |
| `src/admin/data/mockPackages.js` | Package / promo examples |
| `docs/admin/PRICING_STRUCTURE_AND_CALCULATOR.md` | Shorter admin notes |
| `docs/guides/TRAINING_COMPLETION_REQUIREMENTS_2026-01-05.md` | Booking → hours logging rules |

---

*Generated from live codebase for one-pager / deck production. Numbers in §5 match calculator logic as of export date.*
