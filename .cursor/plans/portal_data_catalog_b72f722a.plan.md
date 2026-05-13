---
name: Portal Data Catalog
overview: Produce a comprehensive Excel data catalog for Pro + Model portal collections, including schema, source, usage, gaps, and recommended metrics.
todos:
  - id: extract-schema
    content: Extract Pro+Model data entities and fields
    status: completed
  - id: map-usage
    content: Map fields to UI flows and storage use
    status: completed
  - id: gap-analysis
    content: Document gaps, validation, and quality issues
    status: completed
  - id: metrics-recs
    content: Add analytics/metrics recommendations
    status: completed
  - id: generate-xlsx
    content: Create Excel workbook in workspace
    status: completed
isProject: false
---

# Pro + Model Data Catalog Plan

## What you’ll get

- A structured Excel workbook that inventories all data collected/used in the Pro + Model portals.
- Each dataset includes fields, types, example values, source, where used, and gaps/quality concerns.
- A recommendations tab with additional metrics to collect.

## Workbook structure

- **01_Entities**: One row per entity/collection (Professional, Model, Request, Match, Booking, PortfolioItem, TrainingProgress, Feedback/Review, Chat, Products, etc.).
- **02_Fields**: Field-level catalog (entity, field name, type, required?, source, example, UI page, notes).
- **03_Workflows**: Key flows (request → match → booking → completion) with inputs/outputs and missing steps.
- **04_Gaps**: Missing or weakly defined data, validation issues, or inconsistent usage.
- **05_Metrics_Recs**: Suggested analytics metrics (retention, conversion, quality, operational KPIs).

## Data sources analyzed

- Mock storage in [c:\Users\yalwa\modeled-frontend\src\utils\mockDataService.js](c:\Users\yalwa\modeled-frontend\src\utils\mockDataService.js)
- Pro Profile data in [c:\Users\yalwa\modeled-frontend\src\portal\pages\PortalProfile.jsx](c:\Users\yalwa\modeled-frontend\src\portal\pages\PortalProfile.jsx)
- Pro Request data in [c:\Users\yalwa\modeled-frontend\src\portal\pages\ProRequestCreationLuxury.jsx](c:\Users\yalwa\modeled-frontend\src\portal\pages\ProRequestCreationLuxury.jsx)
- Pro Dashboard data in [c:\Users\yalwa\modeled-frontend\src\portal\pages\PortalDashboard.jsx](c:\Users\yalwa\modeled-frontend\src\portal\pages\PortalDashboard.jsx)
- Bookings data creation in [c:\Users\yalwa\modeled-frontend\src\portal\pages\ProBooked.jsx](c:\Users\yalwa\modeled-frontend\src\portal\pages\ProBooked.jsx)
- Model profile and requests in [c:\Users\yalwa\modeled-frontend\src\portal\model-pages\ModelProfile.jsx](c:\Users\yalwa\modeled-frontend\src\portal\model-pages\ModelProfile.jsx) and [c:\Users\yalwa\modeled-frontend\src\portal\model-pages\ModelOpportunities.jsx](c:\Users\yalwa\modeled-frontend\src\portal\model-pages\ModelOpportunities.jsx)

## Steps

1. Parse mock data schema and page-level mock structures to build entity + field catalog.
2. Map each field to its UI/flow usage and mark required vs optional.
3. Identify gaps (missing fields, inconsistent naming, missing validations, missing relationships).
4. Add recommended metrics and additional data points for quality/analytics.
5. Generate `portal-data-catalog.xlsx` in the workspace root.

## Output file

- `c:\Users\yalwa\modeled-frontend\portal-data-catalog.xlsx`

