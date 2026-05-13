# 📊 Onboarding Analytics Guide

## Overview

You now have **complete onboarding funnel tracking** in your admin dashboard! Track sign-up clicks, completions, drop-offs, and engagement metrics.

## What You Can Track

### Key Metrics
- **Sign-Up Clicks**: How many people clicked "Sign Up"
- **Onboarding Started**: How many actually started the process
- **Completed**: How many finished onboarding
- **Drop-Off Rate**: Percentage who abandoned
- **Completion Rate**: Percentage who completed (e.g., 70 out of 100 = 70%)

### Detailed Analytics
- **Funnel Visualization**: See the flow from click → start → complete
- **Step-by-Step Drop-Off**: Identify where users abandon
- **User Type Breakdown**: Separate metrics for Models, Professionals, Partners
- **Daily Trends**: Track metrics over time (7, 30, or 90 days)

## How to Use

### 1. Access the Dashboard

Navigate to: **Admin → Analytics → Onboarding Analytics**

Or go directly to: `/admin/onboarding-analytics`

### 2. View Metrics

The dashboard shows:
- **Key Metrics Cards**: Total clicks, starts, completions, drop-off rate
- **Onboarding Funnel**: Visual representation of the conversion flow
- **Step Drop-Off Analysis**: See which steps have the highest abandonment
- **Stats by User Type**: Breakdown for Models, Professionals, Partners
- **Daily Trends Table**: Day-by-day breakdown

### 3. Filter Data

- **Time Range**: 7 days, 30 days, or 90 days
- **User Type**: Filter by Model, Professional, Partner, or view All

## How to Track Events in Your Code

### Basic Setup

Import the tracking utility:

```javascript
import { 
  trackSignupClicked, 
  trackSignupStarted,
  trackStepCompleted,
  trackOnboardingCompleted,
  trackOnboardingAbandoned 
} from '../utils/onboardingTracker';
```

### Track Sign-Up Clicks

When a user clicks "Sign Up" button:

```javascript
// In your sign-up button click handler
const handleSignupClick = (userType) => {
  trackSignupClicked(userType); // 'Model', 'Professional', or 'Partner'
  // ... rest of your code
};
```

### Track Onboarding Start

When user begins onboarding:

```javascript
// When onboarding page loads
useEffect(() => {
  trackSignupStarted('Model'); // or 'Professional', 'Partner'
}, []);
```

### Track Step Completion

When user completes a step:

```javascript
// After user completes a step
const handleStepComplete = (stepName, stepNumber) => {
  trackStepCompleted('Model', stepName, stepNumber);
  // Examples:
  // trackStepCompleted('Model', 'welcome', 1);
  // trackStepCompleted('Model', 'personal_info', 2);
  // trackStepCompleted('Model', 'verification', 3);
};
```

### Track Onboarding Completion

When user finishes onboarding:

```javascript
// After successful onboarding
const handleOnboardingComplete = (userId) => {
  trackOnboardingCompleted('Model', userId);
  // ... navigate to dashboard, etc.
};
```

### Track Abandonment

When user leaves without completing:

```javascript
// On page unload or navigation away
useEffect(() => {
  const handleBeforeUnload = () => {
    trackOnboardingAbandoned('Model', lastStepName, lastStepNumber);
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [lastStepName, lastStepNumber]);
```

## Example Integration

### In ModelOnboard.jsx

```javascript
import { 
  trackSignupStarted,
  trackStepCompleted,
  trackOnboardingCompleted 
} from '../utils/onboardingTracker';

// At the start of onboarding
useEffect(() => {
  trackSignupStarted('Model');
}, []);

// When a step is completed
const handleStepComplete = (stepName, stepNumber) => {
  trackStepCompleted('Model', stepName, stepNumber);
};

// When onboarding is complete
const handleComplete = async () => {
  const userId = await createUserAccount();
  trackOnboardingCompleted('Model', userId);
  navigate('/model/dashboard');
};
```

### In App.jsx (Sign-Up Buttons)

```javascript
import { trackSignupClicked } from './utils/onboardingTracker';

// In your sign-up button handlers
<button onClick={() => {
  trackSignupClicked('Model');
  navigate('/model/onboard');
}}>
  Sign Up as Model
</button>
```

## Database Schema

The system uses an `onboarding_events` table in RDS that tracks:
- Event type (clicked, started, completed, abandoned)
- User type (Model, Professional, Partner)
- Step information
- Session tracking
- Timestamps

## Next Steps

1. **Add tracking to your sign-up buttons** - Track when users click "Sign Up"
2. **Add tracking to onboarding pages** - Track step completions
3. **Deploy the RDS schema** - Run the updated `schema.sql` on your RDS instance
4. **Test the tracking** - Complete a test sign-up and verify events appear in the dashboard

## Troubleshooting

### Events Not Appearing

1. **Check RDS connection** - Ensure analytics API can connect to RDS
2. **Verify schema** - Make sure `onboarding_events` table exists
3. **Check browser console** - Look for tracking errors
4. **Verify API permissions** - Ensure Lambda has access to RDS

### Data Not Updating

- Materialized views refresh automatically, but you can manually refresh:
  - Call `refreshAnalyticsViews()` from analytics.js
  - Or wait for automatic refresh (usually within a few minutes)

## Cost

- **RDS**: Minimal impact (small table, efficient queries)
- **Lambda**: ~$0.01 per 1000 events
- **Total**: Essentially free for typical usage

---

**Ready to track!** Add the tracking calls to your sign-up flow and start seeing your funnel metrics! 🚀

