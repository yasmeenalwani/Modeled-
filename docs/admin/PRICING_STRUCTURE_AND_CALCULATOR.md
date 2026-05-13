# Pricing Structure & Calculator

**Admin tool for sizing and pricing pros/partners during sales. Training program model + full Modeled profit (pro + model sides).**

---

## 1. Current Pricing Structure (Take)

### What You Have

| Layer | Where | Purpose |
|-------|-------|---------|
| **Service Catalog** | `services.js`, Service model | Per-service: price, professionalFee, modelFee, totalRevenue |
| **Per Request** | ModelRequest | modelSearchFee (pro pays Modeled), modelPayment (model gets) |
| **Partner** | Partner.servicesList | Salon's own menu: [{ name, price }] |

### Economics (Interpretation)

For each **booking**:
- **Professional** pays Modeled → `professionalFee` (e.g. $21 for haircut)
- **Model** pays Modeled (or pro charges model; model gets paid) → `modelFee` (e.g. $25 for haircut)
- **Modeled total** = professionalFee + modelFee (e.g. $46 per haircut)

The `price` in Service (e.g. $125) is the **full service price** the pro charges the model. Modeled's cut is a % of that (professionalFeePercent, modelFeePercent).

### Strengths

- **Dual-side revenue** — You take from both pro and model; good unit economics.
- **Service-level config** — Different cuts per service (color vs blowdry) reflects value and complexity.
- **Transparent to pros** — professionalFee is clear: “You pay $X per booking.”

### Gaps / Recommendations

| Gap | Recommendation |
|-----|----------------|
| **Per-request vs catalog mismatch** | ModelRequest uses modelSearchFee/modelPayment (flat per request). Consider deriving from Service when serviceType matches, or document the override flow. |
| **Partner vs Professional** | Partners have servicesList (their menu). Pros create ModelRequests with ad-hoc pricing. Align: do partners get different fee structure? Volume tiers? |
| **Volume tiers** | No tiered pricing yet (e.g. 20+ bookings/mo = 15% vs 17%). Add if you want to incentivize high-volume salons. |
| **Packages** | Packages/promos exist as a route; ensure package pricing rolls up cleanly into the same fee logic. |
| **Single source of truth** | Service catalog in `services.js` may diverge from DB (Service model). Prefer DB as source; use catalog for defaults/display. |

---

## 2. Pricing Calculator (Admin)

**Location:** Admin → Sales & Growth → **CRM & Outreach** → **Pricing Calculator** tab  
**Route:** `/admin/crm` (Pricing Calculator tab)

### What It Does

- **Size tiers** — Solo Pro, Small Salon, Medium Salon, Large/Multi (preset pros, models, bookings)
- **Inputs** — # professionals, # models, bookings/month, avg Modeled revenue per booking
- **Outputs** — Modeled revenue (monthly, annual), per-pro revenue, bookings per pro

### Use Case

During sales calls with pros/partners:
1. Select a size tier (e.g. Medium Salon)
2. Adjust bookings if they have real numbers
3. Show: “At 80 bookings/month at ~$50/booking, you’re generating $4K/mo for Modeled; that’s $800/pro if you have 5.”
4. Use to size deals and set expectations

### Future Enhancements

- **Fee calculator** — Input desired modelPayment, get suggested modelSearchFee
- **Break-even** — “How many bookings to cover platform cost?”
- **Export** — PDF/print for proposals
- **Link to Prospect** — Attach calculator result to CRM prospect

---

## 3. File Reference

| File | Purpose |
|------|---------|
| `src/admin/pages/PricingCalculatorPage.jsx` | Calculator UI |
| `src/admin/data/services.js` | Service catalog (default avg revenue) |
| `docs/admin/PRICING_STRUCTURE_AND_CALCULATOR.md` | This doc |