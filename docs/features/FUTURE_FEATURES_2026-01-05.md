# 🚀 Future Features - Pre-Launch Checklist

## Shop Feature - Move to Main Website

**Status:** ⏳ Planned for before launch  
**Priority:** High  
**Current State:** Shop exists in Model Portal (`/model-portal/shop`)

### Decision
- **Shop should NOT be in the portal**
- **Shop should be on the main website** (public-facing)
- This makes it accessible to everyone, not just logged-in models

### Implementation Plan

1. **Create Shop Page on Main Website**
   - Route: `/shop` (public route, no auth required)
   - Accessible from main navigation
   - Show Wear Care products
   - Guest checkout support

2. **Remove Shop from Model Portal**
   - ✅ Already removed from navigation (commented out)
   - Keep route for now (in case needed for testing)
   - Remove completely before launch

3. **Features to Include:**
   - Product browsing
   - Product details
   - Shopping cart
   - Checkout (Stripe integration)
   - Guest checkout option
   - Account creation during checkout (optional)
   - Order history (for logged-in users)

4. **Integration Points:**
   - Link from main website navigation
   - Link from Model Portal (external link to `/shop`)
   - Maybe add "Shop" button in Model Portal that links out

### Notes
- Current Shop component: `src/portal/model-pages/ModelShop.jsx`
- Can be reused/adapted for main website
- Consider creating `src/pages/Shop.jsx` for main website version

---

## Other Future Features

### Beauty Maintenance Timeline Enhancements
- [ ] Calendar view showing when services are "due"
- [ ] Automated reminders ("You're due for a color touch-up!")
- [ ] Product recommendations based on time since last service

### Location Helper Enhancements
- [ ] Real-time transit updates (MTA API integration)
- [ ] Multiple route options
- [ ] "Leave by X time" calculator with notifications

### Chat Enhancements
- [ ] Photo sharing in chat
- [ ] Voice messages
- [ ] Translation support for non-English speakers

### Learn and Earn Enhancements
- [ ] Monthly leaderboards
- [ ] Achievement badges system
- [ ] Unlockable content based on XP/streaks
- [ ] Social sharing of achievements

### Inspiration Board Enhancements
- [ ] Share boards with professionals
- [ ] Public inspiration gallery
- [ ] Pinterest/Instagram import functionality
- [ ] Collaborative boards

---

**Last Updated:** Today  
**Next Review:** Before launch

