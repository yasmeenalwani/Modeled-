# Professional Profile Page - Feature Discussion & Planning

## CORE PURPOSE
The profile page should serve as:
1. **Identity & Proof** - Who you are, what you do, credentials
2. **Matching Engine Input** - Data that feeds the matching algorithm
3. **Public-Facing Card** - What models/clients see when browsing
4. **Self-Service Editor** - Easy to update and maintain

---

## FEATURE BREAKDOWN BY PRIORITY

### ESSENTIAL (Must Have)

#### 1. Profile Overview Card
- **Avatar/Photo** - Professional headshot
- **Name** - First + Last
- **Salon/Studio** - Where they work
- **Status Badges** - Verified Pro, Tier (Apprentice/Junior/Senior)
- **Quick Stats** - Sessions, Rating, Member Since
- **Preview Public Profile** - CTA to see what others see

**Why Essential:** First impression, establishes credibility, quick reference

---

#### 2. Basic Information
- **Name** (First, Last)
- **Email** (editable or read-only?)
- **Phone** (for bookings)
- **City/Location** (for matching)
- **Bio** (short, punchy - character limit?)

**Why Essential:** Core identity, contact info, location for matching

---

#### 3. Salon/Work Setup
- **Salon Name**
- **Address** (full or just city?)
- **Work Mode** - Salon employee / Booth renter / Independent / On-location
- **Usual Work Days** - Mon-Sun checkboxes
- **Usual Work Hours** - Start/End time

**Why Essential:** Critical for matching (availability, location), logistics

---

#### 4. Specialties & Matching Data
- **Hair Specialties** - Multi-select (Blonding, Color, Cuts, etc.)
- **Service Comfort Levels** - Love/OK/Prefer Less per service
- **Not Available For** - Kids cuts, color corrections, etc.

**Why Essential:** Directly feeds matching algorithm, determines which requests they see

---

#### 5. Professional Photos
- **Profile Photo** - Main headshot
- **Portfolio Photos** - Work examples (how many? 5? 10? unlimited?)
- **Photo Tagging** - Service type, hair type, vibe (for matching & Mag)

**Why Essential:** Visual proof of work, portfolio for models to see, Mag eligibility

---

#### 6. Certifications
- **Modeled Certifications** - Blowouts, Color, Haircuts (status: Certified/In Progress)
- **External Certifications** - Wella, Redken, etc. (optional)

**Why Essential:** Credibility, unlocks features (campaigns, tier), shows expertise

---

### IMPORTANT (Should Have)

#### 7. Documents
- **License** - Required, with expiry date
- **Insurance** - Optional but recommended
- **Brand Certifications** - Optional
- **Expiry Warnings** - Alert if expiring soon (< 30 days)

**Why Important:** Compliance, safety, professional requirements

---

#### 8. Portfolio Management
- **Portfolio Completeness** - Progress bar (target: 9-12 tagged images)
- **Tag Management** - Edit tags on existing photos
- **Campaign Usage** - Toggle "Used in campaign?" per photo
- **Date Tracking** - When photo was taken/uploaded

**Why Important:** Encourages quality portfolio, helps with Mag eligibility, better matching

---

#### 9. Settings & Preferences
- **Communication Preferences** - SMS/Email/Push toggles
- **Quiet Hours** - When not to send notifications
- **Booking Preferences** - Travel Y/N, Photos Y/N, Video Y/N, Minors Y/N, Late Nights Y/N

**Why Important:** User experience, respects their boundaries, affects matching

---

#### 10. Pronouns (Optional Field)
- **Pronouns** - she/her, they/them, he/him, prefer not to say

**Why Important:** Inclusivity, proper addressing in communications

---

### NICE TO HAVE (Could Add Later)

#### 11. Social Links
- **Instagram Handle** - @username
- **Website** - Personal or salon website
- **TikTok** - If relevant

**Why Nice to Have:** Additional credibility, cross-platform presence

---

#### 12. Lanes/Vibe Tags
- **Style Lanes** - Glam, Clean girl, Editorial, Alt, Retro, Bridal, Men's

**Why Nice to Have:** Helps with vibe matching, campaign targeting, but not critical for core matching

---

#### 13. Advanced Matching Preferences
- **Preferred Model Attributes** - Hair length, color, texture preferences
- **Distance Willing to Travel** - For on-location work
- **Price Range** - If they set their own rates

**Why Nice to Have:** Fine-tunes matching, but algorithm can work without this

---

#### 14. Analytics/Insights
- **Profile Views** - How many models viewed their profile
- **Match Success Rate** - % of matches that became bookings
- **Portfolio Performance** - Which photos get most views

**Why Nice to Have:** Motivates engagement, helps optimize profile

---

#### 15. Quick Actions
- **Request a Model** - Quick link
- **View Schedule** - Link to calendar
- **View Earnings** - Link to earnings page

**Why Nice to Have:** Navigation convenience, but not core to profile

---

## UX/UI CONSIDERATIONS

### Layout Structure
**Option A: Single Scroll (Recommended)**
- All sections in one long page
- Sticky save button at bottom
- Progress indicator showing completion %

**Option B: Tabbed Interface**
- Tabs: Overview, Info, Portfolio, Certifications, Settings
- More organized but requires clicks

**Option C: Accordion/Collapsible**
- Sections can be expanded/collapsed
- Good for long forms, less overwhelming

**Recommendation:** Option A with collapsible sections for less-used areas (Settings)

---

### Visual Hierarchy
1. **Hero Section** - Profile card (always visible)
2. **Primary Actions** - Save, Preview buttons (sticky or prominent)
3. **Core Info** - Basic info, specialties (above fold)
4. **Content** - Photos, portfolio (visual, engaging)
5. **Supporting** - Documents, settings (below fold, collapsible)

---

### Form UX Patterns

#### Input Types
- **Text Fields** - Name, email, phone (standard inputs)
- **Textarea** - Bio (with character counter, preview)
- **Multi-Select Chips** - Specialties, lanes (visual, easy to add/remove)
- **Radio Buttons/Chips** - Work mode (single select, clear options)
- **Checkboxes** - Work days (multi-select, familiar pattern)
- **Time Pickers** - Work hours (start/end)
- **Sliders** - Service comfort levels (visual, intuitive)
- **File Upload** - Photos, documents (drag-drop, preview)

#### Validation & Feedback
- **Inline Validation** - Show errors as user types
- **Required Field Indicators** - Asterisk or "Required" label
- **Character Counters** - Bio, descriptions
- **Progress Indicators** - Portfolio completeness, profile completion %
- **Success Messages** - "Saved!" confirmation
- **Warning Badges** - Document expiring soon, incomplete sections

---

### Mobile Considerations
- **Responsive Grid** - Stacks on mobile
- **Touch-Friendly** - Large tap targets, swipe gestures
- **Photo Upload** - Camera access on mobile
- **Simplified Forms** - Hide less critical fields on small screens

---

## INTEGRATIONS & LINKS

### Internal Links
- **Preview Public Profile** → Modal or new page showing public view
- **View Schedule** → `/portal/schedule`
- **View Earnings** → `/portal/earnings`
- **Request a Model** → `/portal/request`
- **Training** → `/portal/training`
- **Campaigns** → `/portal/campaigns`
- **Portfolio** → `/portal/portfolio` (if separate page)

### External Integrations
- **Photo Storage** → S3/Amplify Storage
- **Document Storage** → S3/Amplify Storage
- **Matching Engine** → Real-time updates when specialties/preferences change
- **Notification System** → Communication preferences feed into notification logic
- **Campaign System** → Portfolio photos with "used in campaign" flag
- **Modeled Mag** → Portfolio completeness affects eligibility

### Data Flow
```
Profile Edit → Save → 
  ├─ Update Professional model in database
  ├─ Trigger matching engine recalculation (if specialties changed)
  ├─ Update public profile cache
  ├─ Check Mag eligibility (if portfolio updated)
  └─ Send confirmation notification
```

---

## METRICS & TRACKING

### Profile Completion Metrics
- **Overall Completion %** - How complete is their profile?
- **Section Completion** - Which sections are incomplete?
- **Missing Critical Fields** - What's blocking them from being fully active?

### Engagement Metrics
- **Last Updated** - When did they last edit?
- **Profile Views** - How many models viewed? (if we track this)
- **Photo Count** - How many portfolio photos?
- **Certification Progress** - Training completion status

### Display Location
- **Dashboard Widget** - "Complete your profile: 75%"
- **Profile Page Banner** - "Add 3 more photos to unlock Modeled Mag"
- **Incomplete Section Badges** - Red dot or "Incomplete" label

---

## PHOTO MANAGEMENT

### Photo Types
1. **Profile Photo** - Main headshot (1 required, 1 max?)
2. **Portfolio Photos** - Work examples (how many? 5-20?)
3. **Before/After Photos** - Training progress (optional)

### Photo Requirements
- **Aspect Ratio** - Square? 4:3? 16:9? (Recommendation: Square for consistency)
- **File Size** - Max 5MB? 10MB?
- **File Types** - JPG, PNG, WebP?
- **Dimensions** - Min 800x800? 1200x1200?

### Photo Features
- **Upload** - Drag-drop, file picker, camera (mobile)
- **Crop/Edit** - Basic cropping tool?
- **Delete** - Remove photos
- **Reorder** - Drag to reorder portfolio?
- **Tagging** - Service, hair type, vibe (required for portfolio?)
- **Date** - Auto-set to upload date, editable?
- **Campaign Flag** - "Used in campaign?" toggle

### Photo Display
- **Grid View** - Portfolio grid
- **Lightbox** - Click to view full size
- **Edit Mode** - Inline editing of tags

---

## MATCHING ENGINE INTEGRATION

### Fields That Feed Matching
1. **Specialties** → Determines which service requests they see
2. **Service Comfort** → Filters available requests
3. **Not Available For** → Excludes certain request types
4. **Work Days/Hours** → Availability matching
5. **Location/City** → Distance calculations
6. **Portfolio Tags** → Vibe/style matching (future enhancement)

### Real-Time Updates
- **On Save** → Trigger matching recalculation?
- **Background Job** → Or queue for batch processing?
- **User Feedback** → "Your profile updates may affect matches within 24 hours"

---

## TIER & CERTIFICATION SYSTEM

### Tiers
- **Apprentice** - New, in training
- **Junior** - Some experience, some certifications
- **Senior** - Experienced, multiple certifications

### Tier Benefits
- **Campaign Access** - Senior gets more campaigns?
- **Request Priority** - Higher tier = better match scores?
- **Mag Eligibility** - Senior tier required?

### Certification Unlocks
- **Certified in Color** → Unlocks color campaigns, advanced requests
- **Certified in Haircuts** → Unlocks cut campaigns
- **All Certified** → Senior tier eligibility?

---

## DISCUSSION QUESTIONS

### Priority & Scope
1. **What's the minimum viable profile?** (What fields are absolutely required?)
2. **What can be added later?** (What's nice-to-have vs. must-have?)
3. **How many portfolio photos?** (5? 10? Unlimited?)
4. **Is photo tagging required?** (For portfolio photos to count toward Mag?)

### UX Decisions
5. **Single scroll or tabs?** (What feels better for editing?)
6. **Auto-save or Save button?** (Real-time saves vs. explicit save)
7. **Character limits?** (Bio: 150? 250? 500?)
8. **Mobile-first or desktop-first?** (Where do pros primarily edit?)

### Feature Priorities
9. **Lanes/Vibe tags** - Essential or nice-to-have?
10. **Social links** - Important for credibility or optional?
11. **Analytics/Insights** - Show profile views, match rates?
12. **Advanced preferences** - Preferred model attributes, travel distance?

### Technical
13. **Photo storage limits?** (Total MB per pro?)
14. **Document expiry tracking?** (How far in advance to warn?)
15. **Matching recalculation?** (Real-time or batch?)

---

## DESIGN INSPIRATION

### Profile Card Style
- **Clean, professional** - Like LinkedIn but for beauty pros
- **Visual hierarchy** - Photo prominent, info scannable
- **Status indicators** - Badges, progress bars, completion %

### Color Coding
- **Verified** - Green badge
- **In Progress** - Yellow/Orange
- **Incomplete** - Red/Gray
- **Certified** - Green checkmark

### Typography
- **Name** - Large, bold
- **Bio** - Readable, not too small
- **Labels** - Clear, consistent
- **Help Text** - Subtle, informative

---

## NEXT STEPS

1. **Review this document** - What resonates? What's missing?
2. **Prioritize features** - What's essential vs. nice-to-have?
3. **Decide on UX patterns** - Single scroll? Tabs? Accordion?
4. **Clarify requirements** - Photo limits, character counts, etc.
5. **Finalize scope** - What's in v1 vs. v2?

**Ready to discuss! What are your thoughts on:**
- Which features are most important?
- What UX pattern feels right?
- Any features we should add or remove?
- Technical constraints or preferences?

