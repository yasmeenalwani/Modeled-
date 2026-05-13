# Matched Opportunities Page - Design Mockups

**Date:** January 6, 2026  
**Purpose:** Design options for models to view, accept, and book matched opportunities  
**Page:** `/model-portal/opportunities` (renamed to "Matched" in navigation)

---

## 🎨 DESIGN OPTION 1: Card Grid Layout (Current)

### **Layout:**
- Grid of cards (2-3 columns)
- Each card shows one match opportunity
- Score badge in top-right corner
- Action buttons at bottom

### **Pros:**
- ✅ Clean, scannable
- ✅ Easy to compare opportunities
- ✅ Works well on desktop

### **Cons:**
- ❌ Less detail visible at once
- ❌ Requires clicking to see more

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
│  View and respond to booking opportunities matched for you│
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Haircut      │  │ Color        │  │ Highlights   │ │
│  │ Sarah Johnson│  │  [92]        │  │  [88]        │ │
│  │              │  │              │  │              │ │
│  │ Date: Jan 10 │  │ Date: Jan 12 │  │ Date: Jan 15 │ │
│  │ Time: 10 AM  │  │ Time: 9 AM   │  │ Time: 10 AM  │ │
│  │ You Pay: $15 │  │ You Pay: $25 │  │ You Pay: $30 │ │
│  │              │  │              │  │              │ │
│  │ [Accept & Pay] [Decline]      │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN OPTION 2: List View with Expandable Details

### **Layout:**
- Vertical list of opportunities
- Each row shows key info
- Click to expand full details
- Score badge on left

### **Pros:**
- ✅ More information visible
- ✅ Better for mobile
- ✅ Easy to scan

### **Cons:**
- ❌ Less visual appeal
- ❌ More scrolling

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │ [92] Haircut • Sarah Johnson • Jan 10, 10 AM      │ │
│  │        You Pay: $15 • Location: 123 Main St        │ │
│  │        [Accept & Pay] [Decline] [View Details ▼] │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [88] Color • Maria Garcia • Jan 12, 9 AM         │ │
│  │        You Pay: $25 • Location: 456 Oak Ave      │ │
│  │        [Accept & Pay] [Decline] [View Details ▼] │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN OPTION 3: Hero Card + List Hybrid

### **Layout:**
- Large hero card for top match (highest score)
- List view for remaining matches
- Quick actions on hero card

### **Pros:**
- ✅ Highlights best match
- ✅ Encourages action on top match
- ✅ Still shows all opportunities

### **Cons:**
- ❌ Takes more vertical space
- ❌ May bias user to top match only

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────┐ │
│  │  ⭐ YOUR BEST MATCH                                │ │
│  │  ┌──────────┐                                      │ │
│  │  │   [92]   │  Haircut with Sarah Johnson          │ │
│  │  └──────────┘  Jan 10, 2024 • 10:00 AM            │ │
│  │              123 Main St, New York, NY            │ │
│  │              You Pay: $15 (Save $60)               │ │
│  │                                                     │ │
│  │  [Accept & Pay Now] [View Details] [Decline]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Other Opportunities:                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ [88] Color • Maria Garcia • Jan 12, 9 AM        │ │
│  │        [Accept & Pay] [Decline] [View Details]   │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN OPTION 4: Swipeable Cards (Mobile-First)

### **Layout:**
- Full-width cards
- Swipe left to decline, right to accept
- Tap to view details
- Score badge prominent

### **Pros:**
- ✅ Great mobile UX
- ✅ Fast decision making
- ✅ Engaging interaction

### **Cons:**
- ❌ Less efficient on desktop
- ❌ May miss opportunities

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                     │ │
│  │              [92]                                  │ │
│  │                                                     │ │
│  │         Haircut                                    │ │
│  │         Sarah Johnson                              │ │
│  │                                                     │ │
│  │         Jan 10, 2024 • 10:00 AM                    │ │
│  │         123 Main St, New York, NY                  │ │
│  │         You Pay: $15                                │ │
│  │                                                     │ │
│  │         [View Details]                             │ │
│  │                                                     │ │
│  │    [Decline]              [Accept & Pay]           │ │
│  │                                                     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ← Swipe left to decline • Swipe right to accept →     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN OPTION 5: Timeline View

### **Layout:**
- Vertical timeline
- Opportunities sorted by date
- Visual timeline line
- Score badges on timeline

### **Pros:**
- ✅ Shows chronological order
- ✅ Easy to see availability
- ✅ Visual flow

### **Cons:**
- ❌ Less focus on match quality
- ❌ May be cluttered

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Jan 10, 2024                                           │
│  │ [92] Haircut • Sarah Johnson • 10:00 AM            │
│  │        You Pay: $15 • [Accept & Pay] [Decline]     │
│  │                                                      │
│  Jan 12, 2024                                           │
│  │ [88] Color • Maria Garcia • 9:00 AM                │
│  │        You Pay: $25 • [Accept & Pay] [Decline]     │
│  │                                                      │
│  Jan 15, 2024                                           │
│  │ [85] Highlights • Lisa Chen • 10:00 AM             │
│  │        You Pay: $30 • [Accept & Pay] [Decline]     │
│  │                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 DESIGN OPTION 6: Comparison View

### **Layout:**
- Side-by-side comparison
- Key metrics highlighted
- Easy to compare opportunities
- Best match highlighted

### **Pros:**
- ✅ Easy comparison
- ✅ Decision support
- ✅ Clear value proposition

### **Cons:**
- ❌ Limited to 2-3 at a time
- ❌ May be overwhelming

### **Visual:**
```
┌─────────────────────────────────────────────────────────┐
│  Matched Opportunities                                   │
├─────────────────────────────────────────────────────────┤
│  [New] [Accepted] [Declined] [Expired]                  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Match Score  │  │ Match Score  │  │ Match Score  │ │
│  │     [92]     │  │     [88]     │  │     [85]     │ │
│  │              │  │              │  │              │ │
│  │ Service      │  │ Service      │  │ Service      │ │
│  │ Haircut      │  │ Color        │  │ Highlights   │ │
│  │              │  │              │  │              │ │
│  │ Professional │  │ Professional │  │ Professional │ │
│  │ Sarah Johnson│  │ Maria Garcia │  │ Lisa Chen    │ │
│  │              │  │              │  │              │ │
│  │ Date         │  │ Date         │  │ Date         │ │
│  │ Jan 10, 10 AM│  │ Jan 12, 9 AM │  │ Jan 15, 10 AM│ │
│  │              │  │              │  │              │ │
│  │ You Pay      │  │ You Pay      │  │ You Pay      │ │
│  │    $15       │  │    $25       │  │    $30       │ │
│  │              │  │              │  │              │ │
│  │ [Accept & Pay] [Accept & Pay] [Accept & Pay]     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 RECOMMENDED: Option 3 (Hero Card + List Hybrid)

### **Why:**
1. ✅ Highlights best match (encourages action)
2. ✅ Shows all opportunities (no hiding)
3. ✅ Works on mobile and desktop
4. ✅ Clear visual hierarchy
5. ✅ Balances engagement with information

### **Implementation Details:**

#### **Hero Card:**
- Large, prominent card for top match (highest score)
- "⭐ YOUR BEST MATCH" badge
- Large score badge (92)
- Full details visible
- Primary CTA: "Accept & Pay Now"
- Secondary: "View Details", "Decline"

#### **List View:**
- Compact cards for remaining matches
- Score badge on left
- Key info: Service, Professional, Date, Time, Price
- Quick actions: "Accept & Pay", "Decline", "View Details"

#### **Features:**
- Filter tabs: New, Accepted, Declined, Expired
- Sort options: Score (high to low), Date (soonest first), Price (low to high)
- Search/filter: By service type, location, date range
- Empty states: Clear messaging when no matches

---

## 📱 MOBILE CONSIDERATIONS

### **Responsive Design:**
- Hero card: Full width on mobile
- List view: Stack vertically on mobile
- Swipe gestures: Optional (can swipe to decline/accept)
- Touch targets: Large buttons (min 44x44px)
- Bottom sheet: Details in bottom sheet modal

---

## 🎨 COLOR & STYLING

### **Score Badges:**
- 90-100: Green gradient (#4caf50)
- 75-89: Yellow-green gradient (#8bc34a)
- 60-74: Yellow gradient (#ffc107)
- Below 60: Orange gradient (#ff9800)

### **Status Colors:**
- New/Sent: Yellow (#ffc107)
- Accepted: Green (#4caf50)
- Declined: Red (#f44336)
- Expired: Gray (#9e9e9e)

### **Action Buttons:**
- Accept: Cherry gradient (#8B1E3F → #A85A5A)
- Decline: Transparent with border
- View Details: Light background

---

## 🚀 IMPLEMENTATION PRIORITY

1. **Phase 1:** Implement Option 3 (Hero Card + List)
2. **Phase 2:** Add sorting and filtering
3. **Phase 3:** Add mobile swipe gestures
4. **Phase 4:** Add comparison view (optional)

---

## 📝 NOTES

- Rename "Opportunities" to "Matched" in navigation
- Keep existing functionality (accept, decline, view details)
- Add visual polish and better hierarchy
- Consider adding "Quick Accept" for high-score matches (>90)
- Add "Save for Later" option (bookmark matches)

---

**Last Updated:** January 6, 2026

