# Cherry Desk UI Mockups - Magazine Style
**Vogue Insider / Playful Professional / Cherry Desk Brand**

Three concrete mockup variants for the **Cherry Desk** page (Model Dashboard - `/model-portal`). Each uses the same data but presents it with different framing and hierarchy.

**Target Component:** `src/portal/model-pages/ModelDashboard.jsx`

---

## Mockup 1: "Magazine Cover" Cherry Desk
*Editorial, bold, hero-focused*

### Layout Structure

#### **Top Hero Row (Full Width)**
**Split Layout: Left 60% / Right 40%**

**Left Side:**
- **Large Heading:** "Cherry Desk" 
  - Font: Bold serif (Alike/Georgia), 48px
  - Color: `#8B1E3F` (Cherry red)
  - Letter spacing: -0.02em
- **Tagline/Subline:** "Well red, well done, you're rare."
  - Font: Italic serif, 18px
  - Color: `#5A3A2A` (Espresso brown)
  - Margin: 0.5rem 0 1rem 0
- **Pill Chips (Horizontal Stack):**
  - `ROLE Model` - Cherry red background, white text, pill shape, 12px padding
  - `Gold+ in 550 XP` - Gradient background (cherry to pink), white text, pill shape, 12px padding
  - Gap: 0.75rem

**Right Side:**
- **Vertical Stat Strip (3 Cherry Chips):**
  - Each chip: 120px wide, rounded rectangle, subtle gradient background
  - Chip 1: 
    - Main: "12 Sessions"
    - Sub (smaller, muted): "+2 this month"
    - Icon: ✂️ (subtle)
  - Chip 2:
    - Main: "$840 Saved"
    - Sub: "$150 this month"
    - Icon: 💰 (subtle)
  - Chip 3:
    - Main: "2450 XP"
    - Sub: "Your Impact $12.87"
    - Icon: ⭐ (subtle)
  - Gap: 1rem between chips
  - Hover effect: slight scale up

**Background:** Subtle gradient (`#FFFEF9` to `rgba(139, 30, 63, 0.03)`)

---

#### **Middle Grid (2 Columns)**

**Left Column (50%):**

**Card 1: "My Model Card"**
- Large card, 400px height
- **Large Avatar (Centered, Top):**
  - 120px × 120px, circular
  - Gradient border (cherry to pink), 3px width
  - Photo or initials with cherry gradient background
- **Tagline (Below Avatar):**
  - "Cherry Bold, Rare Energy"
  - Font: Bold serif, 20px, `#4A2A1A`
  - Centered, italic styling
- **Link (Bottom):**
  - "View full card →"
  - Cherry red color, underline on hover
  - Arrow transitions on hover

**Card 2: "My Sessions"**
- Vertical list of last 3 sessions
- Each session item:
  - Service name (bold, 16px)
  - Date + Professional name (smaller, muted)
  - Value saved (cherry red, right-aligned)
  - Divider line between items
- Background: `rgba(139, 30, 63, 0.05)`
- Border radius: 12px

**Right Column (50%):**

**Card 3: "Play & Glow"**
- Quiz section with pill-style buttons
- **Quizzes (3-column grid):**
  - Hair Type (unlocked)
  - Color Match (unlocked)
  - Style Finder (locked - grayed out)
- Each quiz pill:
  - Rounded pill shape, cherry border
  - Icon + title + XP value
  - Locked quizzes: 50% opacity
- **Progress Text (Bottom):**
  - "Complete 3 more to unlock Style Finder."
  - Small, muted, centered

**Card 4: "Getting Paid to Play"**
- Large number display:
  - "$840 total saved" - 32px, bold, cherry red
- Smaller metrics:
  - "$12.87 impact - Top 10%" - 14px, muted brown
- **Progress Bar:**
  - Cherry gradient fill
  - Label: "On track for this month's glow goal."
  - Subtle animation on load

---

#### **Bottom Strip (Full Width)**
- Slim banner, 60px height
- **"Next best move" Banner:**
  - Background: Cherry gradient (subtle)
  - Text (left): "You're 1 quiz away from sharper matches."
  - Action (right): "Take Color Match →"
  - Button: Cherry red, rounded, hover scale
  - Subtle pulse animation

---

## Mockup 2: "Tiles Hub" Cherry Desk
*Clean, organized, grid-based*

### Layout Structure

#### **Top Stats Bar (4 Equal Cards)**
- Grid: 4 columns, equal width
- Each card:
  - **Card 1: Total Sessions**
    - Large number: 12
    - Label: "Sessions"
    - Tag: "Top 10%" (tiny pill, top-right)
    - Gradient background: Cherry to pink (subtle)
  - **Card 2: Total Saved**
    - Large number: $840
    - Label: "Saved"
    - Tag: "+$150 this month"
  - **Card 3: Rating**
    - Large number: 4.9
    - Label: "Rating"
    - Tag: "Top 10%"
  - **Card 4: Total XP + Impact**
    - Large number: 2450
    - Label: "XP"
    - Tag: "Impact $12.87"
- Cards: Soft gradient backgrounds, subtle shadows, hover lift effect
- Border radius: 16px
- Gap: 1.5rem

---

#### **Middle: 3×2 Tile Grid**
- Grid: 3 columns × 2 rows
- Each tile: Equal size, rounded corners, hover effect

**Tile 1: "Model Card"**
- Photo collage or single large photo (background)
- Overlay: Semi-transparent dark gradient
- **Content (on overlay):**
  - Tagline: "Cherry Bold, Rare Energy"
  - Button: "Edit card" (white, outlined)
- Hover: Photo brightens, button fills with cherry

**Tile 2: "Model Sessions"**
- Mini chart visualization (fake bars, cherry-colored)
- **Content:**
  - "12 Sessions"
  - Last session label: "Balayage - Dec 2"
  - Small icon: ✂️
- Background: Light cherry gradient

**Tile 3: "Portfolio"**
- 3-photo collage thumbnail (masonry layout)
- **Content:**
  - "View Portfolio"
  - "Open portfolio →" link
- Hover: Photos slightly zoom

**Tile 4: "Learning"**
- Progress ring (circular, 60% filled)
- **Content:**
  - Current course/quiz name
  - "60% complete"
  - Button: "Continue →"
- Cherry-colored progress ring

**Tile 5: "Play & Glow"**
- Badges display (3-4 small badge icons)
- **Content:**
  - Streak: "3-week booking streak" 🔥
  - Fun copy: "You're glowing!"
  - XP badges grid
- Background: Golden gradient

**Tile 6: "Money & Perks"**
- Large savings number: $840
- **Content:**
  - "Next perk unlocks at $1000"
  - Progress bar: 84% filled
  - Cherry gradient fill

---

#### **Bottom: Support Strip**
- Full width, 50px height
- **Layout:**
  - Left text: "Need anything? Read etiquette, safety, or get help →"
  - Right: Tiny bell icon or support icon (cherry-colored)
- Background: `rgba(139, 30, 63, 0.05)`
- Border-top: 1px solid `rgba(139, 30, 63, 0.1)`
- Hover: Link color changes to cherry red

---

## Mockup 3: "Storyline" Cherry Desk
*Narrative, timeline-driven, story-focused*

### Layout Structure

#### **Hero Row (Split 60/40)**

**Left Side (60%):**
- **Big Text (Magazine Headline Style):**
  - "This month's storyline: Winter Blonde Lab"
  - Font: Bold serif, 36px, cherry red
  - Line height: 1.2
- **Sub (Beneath Headline):**
  - "3 looks - $240 saved - 2 quizzes finished"
  - Font: Regular, 16px, espresso brown
  - Styled as magazine subhead
- **Button (Below Sub):**
  - "Continue your story →"
  - Cherry gradient button, rounded
  - Routes to Book or Quiz depending on state
  - Hover: Scale and brighten

**Right Side (40%):**
- **Image-Style Card (Faux Magazine Cover):**
  - Large photo (model avatar or hair photo)
  - Magazine-style overlay:
    - "Cover girl of the week" text (serif, italic, white)
    - Issue number/date styling
  - Border: 3px cherry red
  - Box shadow: Dramatic, magazine-like
  - Hover: Slight rotation effect

---

#### **Middle: Timeline + Suggestions (Split 50/50)**

**Left: "Your Cherry Timeline"**
- Horizontal or vertical timeline
- **Timeline Style:**
  - Vertical line (cherry red) with dots
  - Each session as a timeline item
- **Session Items:**
  - Icon (cut ✂️, color 🎨, style 💨)
  - Date (small, muted)
  - Service name (bold)
  - Professional name (smaller)
  - Value saved (cherry, small)
- **Styling:**
  - Alternating left/right layout
  - Subtle background cards
  - Hover: Expand slightly

**Right: "Because of your last look…"**
- **2 Suggestion Cards:**

**Card 1: "Gloss / Toner in 4–6 weeks"**
- Photo thumbnail (hair/salon)
- Title: Bold, 18px
- Subtitle: "Recommended based on your Balayage"
- Button: "Preview matches" (outlined, cherry)
- Background: Light cherry gradient

**Card 2: "Style quiz: Red & Rare"**
- Icon or image
- Title: Bold
- Subtitle: "Unlock new looks"
- Button: "Take now" (filled, cherry)
- Background: Subtle gradient

---

#### **Bottom: Mini Row**
- 3 minimal chips (horizontal, centered)
- Each chip:
  - Text only (no background initially)
  - Hover: Cherry background, white text
  - Click: Opens respective section
- **Chips:**
  - "Model Card"
  - "Portfolio"
  - "Play & Glow"
- Spacing: Equal gaps, centered alignment
- Font: Regular, 14px, cherry color
- Border: 1px dashed cherry (subtle) when not hovered

---

## Design System Notes

### Colors
- **Primary Cherry:** `#8B1E3F`
- **Cherry Light:** `#A85A5A`
- **Espresso Brown:** `#4A2A1A`
- **Muted Brown:** `#5A3A2A`
- **Ivory Background:** `#FFFEF9`

### Typography
- **Headings:** Alike/Georgia (serif), bold, variable sizes
- **Body:** Alike/Georgia (serif), regular, 14-16px
- **Labels:** Same family, smaller (12-14px), muted colors
- **Taglines:** Italic styling

### Interactions
- **Hover Effects:** Subtle scale, color shifts, brightness changes
- **Transitions:** 0.3s ease for smooth animations
- **Loading:** Slight pulse or shimmer on data-heavy sections
- **Buttons:** Rounded (12-25px radius), gradient backgrounds, hover lift

### Spacing
- **Grid Gaps:** 1.5rem standard, 1rem for tight grids
- **Card Padding:** 1.5-2rem
- **Section Margins:** 2rem vertical

---

## Implementation Priority

1. **Mockup 1 (Magazine Cover)** - Best for initial impact, editorial feel
2. **Mockup 2 (Tiles Hub)** - Best for information density, organized
3. **Mockup 3 (Storyline)** - Best for engagement, narrative-driven

Each mockup uses the same data structure from `ModelProfile` and `ModelDashboard` components, just reorganized with different visual hierarchy.

---

## Next Steps

1. **Figma/Cursor Recreation:** Pick one mockup to recreate in detail
2. **Component Breakdown:** Identify reusable components (stat chips, timeline items, tiles)
3. **Data Integration:** Connect to existing GraphQL queries
4. **Animation Library:** Add smooth transitions and hover effects
5. **Responsive Design:** Adapt layouts for mobile/tablet

