# Profile Page Redesign - Implementation Plan

## Overview
Transform the Professional Profile page into a "Modeled Card" + easy editor, structured for matching with clear sections for identity, proof, specialties, and content.

---

## 1. FILE STRUCTURE & COMPONENTS

### New Components to Create:
```
src/components/profile/
├── ProCardOverview.jsx          # Section 1: Profile overview card
├── BasicInfoEditor.jsx           # Section 2: Basic & salon info
├── SpecialtiesEditor.jsx        # Section 3: Specialties, lanes, preferences
├── PortfolioEditor.jsx           # Section 4: Photos & portfolio
├── DocumentsCertifications.jsx   # Section 5: Documents & certs
├── SettingsPreferences.jsx      # Section 6: Settings & preferences
└── PublicProfilePreview.jsx     # Modal: Preview public profile
```

### Updated Files:
- `src/portal/pages/PortalProfile.jsx` - Main profile page (refactor)
- `amplify/data/resource.ts` - Add new Professional fields (if needed)

---

## 2. DATA SCHEMA UPDATES

### New Fields to Add to Professional Model:

```typescript
// Basic Info
pronouns: a.string(), // Optional: "she/her", "they/them", etc.
city: a.string(),

// Salon/Work Setup
workMode: a.enum(['salon_employee', 'booth_renter', 'independent', 'on_location']),
salonWebsite: a.string(),
usualWorkDays: a.string().array(), // ["monday", "tuesday", "wednesday"]
usualWorkHours: a.json(), // { start: "09:00", end: "18:00" }

// Specialties & Matching
hairSpecialties: a.string().array(), // ["blonding", "lived_in_color", "reds", "gray_coverage", "short_cuts", "curly_textured", "extensions", "styling_only"]
lanes: a.string().array(), // ["glam", "clean_girl", "editorial", "alt", "retro", "bridal", "mens"]
serviceComfort: a.json(), // { "haircuts": "love", "color": "ok", "extensions": "prefer_less" }
notAvailableFor: a.string().array(), // ["kids_cuts", "color_corrections"]

// Portfolio
portfolioItems: a.json().array(), // [{ url, tags: ["service", "hair_type", "vibe"], date, usedInCampaign: boolean }]
portfolioCompleteness: a.integer(), // 0-100

// Documents
documents: a.json().array(), // [{ type: "license", url, expiryDate, verified: boolean }]
externalCertifications: a.json().array(), // [{ brand: "Wella", name: "Master Colorist", year }]

// Settings
communicationPrefs: a.json(), // { sms: boolean, email: boolean, push: boolean, quietHours: { start, end } }
bookingPrefs: a.json(), // { travel: boolean, photos: boolean, video: boolean, minors: boolean, lateNights: boolean }

// Tier & Status
tier: a.enum(['apprentice', 'junior', 'senior']),
totalSessions: a.integer(),
memberSince: a.date(),
thisMonthEarnings: a.float(),
```

---

## 3. IMPLEMENTATION STEPS

### STEP 1: Create ProCardOverview Component
**File:** `src/components/profile/ProCardOverview.jsx`

**Features:**
- Avatar + name + salon line
- Status pills: Verified Pro, Tier, Certifications count, Top Rated
- Quick stats row: Total Sessions, Rating, Member Since, This Month's Earnings
- "Preview public profile" CTA button

**Data needed:**
- `profilePhoto`, `firstName`, `lastName`, `salonName`
- `tier`, `certificationsCount`, `isTopRated`
- `totalSessions`, `rating`, `memberSince`, `thisMonthEarnings`

---

### STEP 2: Create BasicInfoEditor Component
**File:** `src/components/profile/BasicInfoEditor.jsx`

**Fields:**
- **Basic Info:**
  - Name (first, last)
  - Pronouns (optional dropdown: she/her, they/them, he/him, prefer not to say)
  - Email (read-only or editable)
  - Phone
  - City
  
- **Bio:**
  - Textarea with character limit (e.g., 250 chars)
  - Character counter
  - Preview text below

- **Salon/Work Setup:**
  - Salon name
  - Address
  - Website (optional)
  - Instagram handle
  - Work mode chips (single select): "Salon employee", "Booth renter", "Independent / on-location"
  - Usual work days (multi-select checkboxes: Mon-Sun)
  - Usual work hours (time pickers: start/end)

---

### STEP 3: Create SpecialtiesEditor Component
**File:** `src/components/profile/SpecialtiesEditor.jsx`

**Fields:**
- **Hair Specialties** (multi-select chips):
  - Blonding, Lived-in color, Reds, Gray coverage, Short cuts, Curly/textured, Extensions, Styling only

- **Lanes / Vibe** (multi-select chips):
  - Glam, Clean girl, Editorial, Alt, Retro, Bridal, Men's

- **Service Comfort & Focus** (sliders or chips per service):
  - For each service: "Love" / "OK" / "Prefer less" / "Not available"
  - Services: Haircuts, Color, Blowouts, Extensions, Styling, Treatments

- **Not Available For** (multi-select):
  - Kids cuts, Color corrections, Late night sessions, Travel, etc.

**Note:** These fields feed directly into matching algorithm.

---

### STEP 4: Create PortfolioEditor Component
**File:** `src/components/profile/PortfolioEditor.jsx`

**Sections:**

1. **Professional Photos:**
   - Headshots and profile photos
   - Enforce aspect ratio/size
   - Show count remaining (e.g., "3 of 10 photos used")

2. **Portfolio / Recent Work:**
   - Grid layout with images
   - Each image has:
     - Tags (service, hair type, vibe) - editable
     - Date
     - "Used in campaign?" toggle
   - "Tag look" button on upload
   - Add image button

3. **Portfolio Completeness:**
   - Progress bar: "Portfolio completeness: X%"
   - Target: 9-12 tagged images
   - Shows what's missing

---

### STEP 5: Create DocumentsCertifications Component
**File:** `src/components/profile/DocumentsCertifications.jsx`

**Sections:**

1. **Documents:**
   - Upload area
   - Type selector per upload: License, Insurance, Brand Cert, Other
   - Expiry date field (optional)
   - Warning badge if expiring soon (< 30 days)
   - List of uploaded documents with actions

2. **Modeled Certifications:**
   - Tracks: Blowouts, Color, Haircuts
   - Status per track: Certified / In progress / Not started
   - Progress bars
   - "What you unlock" hint per certification:
     - "Certified in Color → Unlocks: Advanced campaigns, Senior tier eligibility"

3. **External Certifications:**
   - Add certification button
   - Fields: Brand (Wella, Redken, etc.), Name, Year
   - List of certifications

---

### STEP 6: Create SettingsPreferences Component
**File:** `src/components/profile/SettingsPreferences.jsx`

**Sections:**

1. **Communication Preferences:**
   - Toggles: SMS, Email, Push notifications
   - Quiet hours: Start time, End time

2. **Booking & Safety Preferences:**
   - Comfortable with:
     - Travel (Y/N)
     - Photos/video (Y/N)
     - Minors (Y/N)
     - Late nights (Y/N)

**Note:** These feed into matching and notification frequency.

---

### STEP 7: Create PublicProfilePreview Component
**File:** `src/components/profile/PublicProfilePreview.jsx`

**Features:**
- Modal that shows what models/clients see
- Read-only view of public profile
- Includes: Avatar, name, salon, bio, specialties, portfolio, certifications
- Close button

---

### STEP 8: Refactor PortalProfile.jsx

**Structure:**
```jsx
<Container>
  <ProCardOverview />
  <BasicInfoEditor />
  <SpecialtiesEditor />
  <PortfolioEditor />
  <DocumentsCertifications />
  <SettingsPreferences />
  <StorageUsage /> (at bottom, small)
</Container>
```

**State Management:**
- Use React state for form fields
- Save button at bottom (or auto-save)
- Loading states
- Success/error messages

---

## 4. CONSTANTS & UTILITIES

### Create: `src/utils/profileConstants.js`

```javascript
export const PRONOUNS_OPTIONS = [
  'she/her',
  'they/them',
  'he/him',
  'prefer not to say'
];

export const WORK_MODES = [
  { value: 'salon_employee', label: 'Salon Employee' },
  { value: 'booth_renter', label: 'Booth Renter' },
  { value: 'independent', label: 'Independent / On-location' },
];

export const HAIR_SPECIALTIES = [
  'Blonding',
  'Lived-in Color',
  'Reds',
  'Gray Coverage',
  'Short Cuts',
  'Curly/Textured',
  'Extensions',
  'Styling Only',
];

export const LANES = [
  'Glam',
  'Clean Girl',
  'Editorial',
  'Alt',
  'Retro',
  'Bridal',
  "Men's",
];

export const SERVICE_COMFORT_LEVELS = [
  { value: 'love', label: 'Love', color: '#4caf50' },
  { value: 'ok', label: 'OK', color: '#ffc107' },
  { value: 'prefer_less', label: 'Prefer Less', color: '#ff9800' },
  { value: 'not_available', label: 'Not Available', color: '#f44336' },
];

export const DOCUMENT_TYPES = [
  'License',
  'Insurance',
  'Brand Certification',
  'Other',
];
```

---

## 5. STYLING CONSISTENCY

**Design System:**
- Use existing color palette (Cherry #8B1E3F, Ivory #FFFEF9, etc.)
- Consistent card styling with borders and shadows
- Chip/tag styling for multi-select items
- Form input styling matching existing forms
- Responsive grid layouts

---

## 6. VALIDATION & ERROR HANDLING

**Validation Rules:**
- Bio: Max 250 characters
- Required fields: Name, Email, Phone, City, Salon name
- Work hours: End time must be after start time
- Portfolio: Minimum 3 photos for completeness
- Documents: License required, expiry date validation

**Error States:**
- Inline error messages
- Required field indicators
- Save error handling with retry

---

## 7. INTEGRATION POINTS

**Matching Engine:**
- `hairSpecialties` → Used in service matching
- `lanes` → Used in vibe/style matching
- `serviceComfort` → Filters available services
- `notAvailableFor` → Excludes from certain requests

**Campaigns:**
- `portfolioItems` with `usedInCampaign` flag
- Specialties determine campaign eligibility

**Notifications:**
- `communicationPrefs` → Controls notification channels
- `quietHours` → Suppresses notifications during these times

---

## 8. MOCK DATA STRUCTURE

```javascript
const mockProfessionalProfile = {
  // Basic
  firstName: 'Sarah',
  lastName: 'Mitchell',
  pronouns: 'she/her',
  email: 'sarah.m@email.com',
  phone: '(555) 123-4567',
  city: 'New York',
  bio: 'Passionate colorist specializing in balayage...',
  
  // Salon
  salonName: 'Luxe Studio',
  salonAddress: '123 Beauty Lane, NYC',
  salonWebsite: 'https://luxestudio.com',
  instagramHandle: '@sarahm_hair',
  workMode: 'salon_employee',
  usualWorkDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  usualWorkHours: { start: '09:00', end: '18:00' },
  
  // Specialties
  hairSpecialties: ['blonding', 'lived_in_color', 'reds'],
  lanes: ['glam', 'clean_girl', 'editorial'],
  serviceComfort: {
    haircuts: 'ok',
    color: 'love',
    blowouts: 'love',
    extensions: 'prefer_less',
  },
  notAvailableFor: ['kids_cuts'],
  
  // Portfolio
  portfolioItems: [
    { url: '...', tags: ['balayage', 'long', 'glam'], date: '2024-12-01', usedInCampaign: true },
    // ...
  ],
  portfolioCompleteness: 75,
  
  // Documents
  documents: [
    { type: 'license', url: '...', expiryDate: '2025-12-31', verified: true },
    // ...
  ],
  
  // Certifications
  modeledCertifications: {
    blowouts: { status: 'certified', progress: 100 },
    color: { status: 'certified', progress: 100 },
    haircuts: { status: 'in_progress', progress: 72 },
  },
  externalCertifications: [
    { brand: 'Wella', name: 'Master Colorist', year: 2023 },
  ],
  
  // Settings
  communicationPrefs: {
    sms: true,
    email: true,
    push: true,
    quietHours: { start: '22:00', end: '08:00' },
  },
  bookingPrefs: {
    travel: true,
    photos: true,
    video: true,
    minors: false,
    lateNights: false,
  },
  
  // Stats
  tier: 'senior',
  totalSessions: 42,
  rating: 4.9,
  memberSince: '2024-03-15',
  thisMonthEarnings: 1240,
  certificationsCount: 2,
  isTopRated: true,
};
```

---

## 9. IMPLEMENTATION ORDER

1. ✅ Create constants file (`profileConstants.js`)
2. ✅ Create `ProCardOverview` component
3. ✅ Create `BasicInfoEditor` component
4. ✅ Create `SpecialtiesEditor` component
5. ✅ Create `PortfolioEditor` component
6. ✅ Create `DocumentsCertifications` component
7. ✅ Create `SettingsPreferences` component
8. ✅ Create `PublicProfilePreview` modal
9. ✅ Refactor `PortalProfile.jsx` to use new components
10. ✅ Add form state management and save functionality
11. ✅ Add validation and error handling
12. ✅ Test all sections and integrations

---

## 10. TESTING CHECKLIST

- [ ] All form fields save correctly
- [ ] Validation works (bio length, required fields)
- [ ] Multi-select chips work properly
- [ ] Photo upload and tagging works
- [ ] Document expiry warnings show correctly
- [ ] Public profile preview matches actual public view
- [ ] Settings affect notifications correctly
- [ ] Specialties feed into matching (verify with matching engine)
- [ ] Portfolio completeness calculates correctly
- [ ] Responsive design works on mobile

---

## READY TO IMPLEMENT?

This plan provides:
- ✅ Clear component structure
- ✅ Data schema updates
- ✅ Step-by-step implementation order
- ✅ Constants and utilities needed
- ✅ Mock data structure
- ✅ Integration points

**Say "go" when ready for implementation!**

