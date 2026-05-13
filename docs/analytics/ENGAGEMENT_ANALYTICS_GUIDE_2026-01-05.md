# 🎯 Engagement Analytics Guide

## Overview

You now have **complete engagement analytics tracking** for post-activation user behavior! This tracks everything that happens **after** a user completes onboarding and becomes "ready for matches."

## What's Tracked

### 1. Use & Stickiness Metrics
- **Sessions per user** (per week/month)
- **Average session duration** and total time in portal
- **Days active per week** (3+ days = "engaged")
- **Engagement rate** (% of users who are actively engaged)

### 2. Feature Engagement (Games/Quizzes/Learning)
- **Games started/completed** per user
- **Quiz completion rates**
- **Learning module completion**
- **Repeat plays** (who comes back to same games)
- **Feature usage** by type

### 3. Booking & Marketplace Behavior
- **Profile views** → **Booking intents** → **Confirmed bookings**
- **Waitlist interactions**: joins, conversions
- **Conversion rates** at each funnel step
- **Booking intent types** (booking, availability, interest)

## How to Use

### 1. Access the Dashboard

Navigate to: **Admin → Analytics → Engagement Analytics**

Or go directly to: `/admin/engagement-analytics`

### 2. View Metrics

The dashboard shows:
- **Key Metrics Cards**: Active users, sessions, duration, engagement rate
- **Feature Engagement**: Games/quizzes completion rates by feature
- **Booking Funnel**: Profile views → Intent → Booking conversion
- **Top Engaged Users**: Users with highest engagement
- **Stickiness Metrics**: Sessions per user, days active

### 3. Filter Data

- **Time Range**: 7 days, 30 days, or 90 days
- **User Type**: Filter by Model, Professional, Partner, or view All

## How to Track Events in Your Code

### Basic Setup

Import the tracking utility:

```javascript
import { 
  trackSessionStart,
  trackSessionEnd,
  trackGameStarted,
  trackGameCompleted,
  trackQuizCompleted,
  trackBookingIntent,
  trackBookingConfirmed,
  trackWaitlistJoined
} from '../utils/engagementTracker';
```

### Track Sessions

**On app/portal load:**

```javascript
import { trackSessionStart } from '../utils/engagementTracker';

useEffect(() => {
  // When user enters portal
  const sessionId = trackSessionStart(userId, 'Model');
  
  // On page unload
  return () => {
    trackSessionEnd(userId, 'Model');
  };
}, [userId]);
```

### Track Game/Quiz Events

**When user starts a game:**

```javascript
// In ModelGames.jsx or similar
const handleGameStart = (gameName) => {
  trackGameStarted(userId, 'Model', gameName, 'game');
  // ... start game logic
};

// When game completes
const handleGameComplete = (gameName, score) => {
  trackGameCompleted(userId, 'Model', gameName, 'game', score);
  // ... completion logic
};
```

**When user starts/completes a quiz:**

```javascript
// In quiz component
const handleQuizStart = (quizName) => {
  trackQuizStarted(userId, 'Model', quizName);
};

const handleQuizComplete = (quizName, score) => {
  trackQuizCompleted(userId, 'Model', quizName, score);
};
```

### Track Booking Behavior

**When user views a profile:**

```javascript
const handleProfileView = (viewedUserId) => {
  trackProfileViewed(userId, 'Model', viewedUserId);
};
```

**When user creates booking intent:**

```javascript
const handleBookingIntent = (requestId) => {
  trackBookingIntent(userId, 'Model', requestId, 'booking');
};
```

**When booking is confirmed:**

```javascript
const handleBookingConfirm = (bookingId, requestId) => {
  trackBookingConfirmed(userId, 'Model', bookingId, requestId);
};
```

**When user joins waitlist:**

```javascript
const handleWaitlistJoin = (waitlistId, requestId) => {
  trackWaitlistJoined(userId, 'Model', waitlistId, requestId);
};
```

**When waitlist converts to booking:**

```javascript
const handleWaitlistConvert = (waitlistId, bookingId) => {
  trackWaitlistConverted(userId, 'Model', waitlistId, bookingId);
};
```

## Event Types Reference

### Session Events
- `session_start` - User starts a session
- `session_end` - User ends a session
- `page_view` - User views a page

### Feature Events
- `game_started` - User starts a game
- `game_completed` - User completes a game
- `quiz_started` - User starts a quiz
- `quiz_completed` - User completes a quiz
- `learning_module_completed` - User completes a learning module
- `feature_used` - User uses any feature

### Booking Events
- `profile_viewed` - User views a profile
- `booking_intent_created` - User expresses booking interest
- `booking_confirmed` - Booking is confirmed
- `waitlist_joined` - User joins waitlist
- `waitlist_converted` - Waitlist converts to booking

## Example Integration

### In ModelPortalLayout.jsx

```javascript
import { trackSessionStart, trackSessionEnd } from '../utils/engagementTracker';

useEffect(() => {
  // Start session when portal loads
  const sessionId = trackSessionStart(currentUser.id, 'Model');
  
  // Track page views
  trackPageView(currentUser.id, 'Model', location.pathname);
  
  // End session on unmount
  return () => {
    trackSessionEnd(currentUser.id, 'Model');
  };
}, [currentUser.id, location.pathname]);
```

### In ModelGames.jsx

```javascript
import { trackGameStarted, trackGameCompleted } from '../utils/engagementTracker';

const handlePlayGame = (game) => {
  trackGameStarted(currentUser.id, 'Model', game.name, game.type);
  // ... start game
};

const handleGameFinish = (game, score) => {
  trackGameCompleted(currentUser.id, 'Model', game.name, game.type, score);
  // ... finish game
};
```

### In Booking Components

```javascript
import { 
  trackBookingIntent, 
  trackBookingConfirmed,
  trackWaitlistJoined 
} from '../utils/engagementTracker';

// When user clicks "I'm interested"
const handleExpressInterest = (requestId) => {
  trackBookingIntent(currentUser.id, 'Model', requestId, 'interest');
};

// When booking is confirmed
const handleBookingConfirm = (bookingId, requestId) => {
  trackBookingConfirmed(currentUser.id, 'Model', bookingId, requestId);
};
```

## Database Schema

The system uses:
- **`engagement_events`** table - All engagement events
- **`user_sessions`** table - Session tracking
- **Materialized views** for fast analytics queries:
  - `engagement_summary` - Daily engagement metrics
  - `user_engagement_metrics` - Per-user engagement stats
  - `feature_engagement` - Feature usage analytics
  - `booking_funnel` - Booking conversion funnel

## Metrics Explained

### Engagement Rate
Users who are "engaged" = 3+ days active in the period. Engagement rate = (engaged users / total users) × 100

### Session Duration
Average time users spend in a single session (in seconds/minutes)

### Completion Rate
For games/quizzes: (completed / started) × 100

### Booking Conversion Rate
(confirmed bookings / booking intents) × 100

### Stickiness
- **Sessions per user**: Average number of sessions per active user
- **Days active**: Average number of days a user is active in the period

## Next Steps

1. **Add session tracking** to portal layouts
2. **Add game/quiz tracking** to game components
3. **Add booking tracking** to booking flow
4. **Deploy the RDS schema** - Run updated `schema.sql` on your RDS instance
5. **Test tracking** - Complete some actions and verify events appear

## Troubleshooting

### Events Not Appearing

1. **Check RDS connection** - Ensure analytics API can connect
2. **Verify schema** - Make sure `engagement_events` table exists
3. **Check browser console** - Look for tracking errors
4. **Verify API permissions** - Ensure Lambda has RDS access

### Data Not Updating

- Materialized views refresh automatically
- You can manually refresh by calling `refreshAnalyticsViews()`
- Or wait for automatic refresh (usually within a few minutes)

## Cost

- **RDS**: Minimal impact (efficient queries, indexed tables)
- **Lambda**: ~$0.01 per 1000 events
- **Total**: Essentially free for typical usage

---

## Quick Reference: Event Names

| Event | Function | Category |
|-------|----------|----------|
| Session Start | `trackSessionStart()` | session |
| Session End | `trackSessionEnd()` | session |
| Game Started | `trackGameStarted()` | feature |
| Game Completed | `trackGameCompleted()` | feature |
| Quiz Started | `trackQuizStarted()` | learning |
| Quiz Completed | `trackQuizCompleted()` | learning |
| Booking Intent | `trackBookingIntent()` | booking |
| Booking Confirmed | `trackBookingConfirmed()` | booking |
| Waitlist Joined | `trackWaitlistJoined()` | booking |
| Waitlist Converted | `trackWaitlistConverted()` | booking |
| Profile Viewed | `trackProfileViewed()` | booking |

---

**Ready to track engagement!** Add tracking calls throughout your portal and start seeing how users interact with your platform! 🚀

