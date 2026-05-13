# Services Menu - Database Schema

## Service Catalog

All services available in the Modeled platform with pricing, fees, and requirements.

---

## 1. Haircut

- **Service ID:** `haircut`
- **Service Name:** Haircut
- **Category:** Hair
- **Price:** $125
- **Duration:** 60 minutes
- **Professional Fee Percent:** 17%
- **Professional Fee:** $21
- **Model Fee Percent:** 20%
- **Model Fee:** $25
- **Total Revenue (Platform):** $46
- **Description:** Precision cut and styling
- **Requirements:** Any hair type

---

## 2. Color

- **Service ID:** `color`
- **Service Name:** Color
- **Category:** Hair
- **Price:** $300
- **Duration:** 180 minutes (3 hours)
- **Professional Fee Percent:** 12%
- **Professional Fee:** $36
- **Model Fee Percent:** 10%
- **Model Fee:** $30
- **Total Revenue (Platform):** $66
- **Description:** Full color treatment
- **Requirements:** Virgin or color-treated hair

---

## 3. Blowdry

- **Service ID:** `blowdry`
- **Service Name:** Blowdry
- **Category:** Hair
- **Price:** $90
- **Duration:** 45 minutes
- **Professional Fee Percent:** 17%
- **Professional Fee:** $15
- **Model Fee Percent:** 22%
- **Model Fee:** $20
- **Total Revenue (Platform):** $35
- **Description:** Professional blowout styling
- **Requirements:** Medium to long hair preferred

---

## 4. Gloss

- **Service ID:** `gloss`
- **Service Name:** Gloss
- **Category:** Hair
- **Price:** $100
- **Duration:** 60 minutes
- **Professional Fee Percent:** 17%
- **Professional Fee:** $17
- **Model Fee Percent:** 25%
- **Model Fee:** $25
- **Total Revenue (Platform):** $42
- **Description:** Shine and toning treatment
- **Requirements:** Any hair type

---

## 5. Highlights

- **Service ID:** `highlights`
- **Service Name:** Highlights
- **Category:** Hair
- **Price:** $225
- **Duration:** 150 minutes (2.5 hours)
- **Professional Fee Percent:** 12%
- **Professional Fee:** $27
- **Model Fee Percent:** 13%
- **Model Fee:** $30
- **Total Revenue (Platform):** $57
- **Description:** Partial or full highlights
- **Requirements:** Virgin or lightly processed hair preferred

---

## 6. Keratin

- **Service ID:** `keratin`
- **Service Name:** Keratin
- **Category:** Hair
- **Price:** $300
- **Duration:** 180 minutes (3 hours)
- **Professional Fee Percent:** 12%
- **Professional Fee:** $36
- **Model Fee Percent:** 12%
- **Model Fee:** $35
- **Total Revenue (Platform):** $71
- **Description:** Keratin smoothing treatment
- **Requirements:** Frizzy or curly hair ideal

---

## Services Open To (Boolean Fields)

These boolean fields in the ModelProfile schema indicate which services a model is open to:

### openToHaircut
- **Type:** boolean
- **Description:** Model is open to haircut services
- **Related Service:** `haircut`

### openToColor
- **Type:** boolean
- **Description:** Model is open to color services
- **Related Services:** `color`, `highlights`

### openToStyling
- **Type:** boolean
- **Description:** Model is open to styling/blowdry services
- **Related Service:** `blowdry`

### openToMakeup
- **Type:** boolean
- **Description:** Model is open to makeup services
- **Related Service:** `makeup` (future service)

### openToNails
- **Type:** boolean
- **Description:** Model is open to nail services
- **Related Service:** `nails` (future service)

### openToSkincare
- **Type:** boolean
- **Description:** Model is open to skincare services
- **Related Service:** `skincare` (future service)

---

## Service Matching

Services are also stored in array format for matching:
- **Field:** `services` (string array)
- **Example:** `['haircut', 'color', 'blowdry', 'gloss', 'highlights']`
- **Used For:** Matching engine to find models willing to do specific services

---

## Pricing Summary

| Service | Price | Duration | Platform Revenue |
|---------|-------|----------|------------------|
| Haircut | $125 | 60 min | $46 |
| Blowdry | $90 | 45 min | $35 |
| Gloss | $100 | 60 min | $42 |
| Highlights | $225 | 150 min | $57 |
| Color | $300 | 180 min | $66 |
| Keratin | $300 | 180 min | $71 |

---

## Notes

- All prices are in USD
- Professional fees are percentages of the service price
- Model fees represent what models pay (discounted from market rate)
- Platform revenue is the sum of professional fee + model fee
- Services are used in the matching engine to connect models with professional requests
- Service requirements help filter suitable models for each service type

