# Pinpoint Hybrid Integration Setup Guide

## Overview

This guide covers setting up the Pinpoint hybrid integration for Modeled Management:
- **SES/SNS**: Transactional messages (bookings, confirmations) - Already working
- **Pinpoint**: Marketing campaigns (promotions, re-engagement, analytics) - New

---

## Prerequisites

1. ✅ AWS Account with Amplify backend
2. ✅ SES email identity verified (`noreply@modeledmanagement.com`)
3. ✅ SNS SMS configured (if using SMS)
4. ✅ Node.js 20.x installed

---

## Step 1: Deploy Pinpoint Resources

### 1.1 Update Environment Variables

The Pinpoint App ID will be created automatically when you deploy. After first deployment:

1. Go to AWS Console → Pinpoint
2. Find your "ModeledManagement" app
3. Copy the Application ID
4. Add to Lambda environment variables:

```bash
# In amplify/functions/pinpoint-campaigns/resource.ts
PINPOINT_APP_ID=your-app-id-here

# In amplify/functions/pinpoint-segments/resource.ts
PINPOINT_APP_ID=your-app-id-here
```

### 1.2 Deploy Backend

```bash
npx ampx sandbox
# or
npx ampx pipeline-deploy --branch main
```

### 1.3 Verify Pinpoint App

1. Go to AWS Console → Pinpoint
2. Verify "ModeledManagement" app exists
3. Check Email channel is connected to SES
4. Check SMS channel is enabled (if using SMS)

---

## Step 2: Create Initial Segments

After deployment, create your first segments:

```typescript
// In admin panel or Lambda function
import { SegmentHelpers } from '../utils/pinpointSegments';

// Create segments
await SegmentHelpers.activeModels();
await SegmentHelpers.inactiveModels();
await SegmentHelpers.activeProfessionals();
await SegmentHelpers.newUsers();
```

Or via AWS Console:
1. Go to Pinpoint → Segments
2. Create segment with criteria:
   - **Active Models**: `userType = Model` AND `lastActive < 30 days`
   - **Inactive Models**: `userType = Model` AND `lastActive > 60 days`
   - etc.

---

## Step 3: Sync User Data

When users sign up or update profiles, sync to Pinpoint:

```typescript
import { syncUserToPinpoint } from '../utils/pinpointTracking';

// After user profile created/updated
await syncUserToPinpoint(userId, {
  email: user.email,
  phone: user.phone,
  userType: 'Model', // or 'Professional', 'Partner'
  locationZip: user.locationZip,
  status: user.status,
});
```

---

## Step 4: Track Events

Add event tracking to key user actions:

```typescript
import { PinpointEvents } from '../utils/pinpointTracking';

// Track booking created
await PinpointEvents.bookingCreated(userId, {
  bookingId: booking.id,
  serviceType: booking.serviceType,
  amount: booking.amount,
});

// Track profile viewed
await PinpointEvents.profileViewed(userId, {
  profileType: 'model',
  profileId: model.id,
});

// Track login
await PinpointEvents.login(userId);
```

---

## Step 5: Send First Campaign

### 5.1 Create Campaign Template

```typescript
import { CampaignTemplates, sendCampaign } from '../utils/pinpointCampaigns';

// Get segment ID from Pinpoint Console or API
const segmentId = 'your-segment-id';

// Send welcome campaign
await sendCampaign(
  segmentId,
  CampaignTemplates.welcomeModel('Sarah', 'https://app.modeledmanagement.com/model-portal')
);
```

### 5.2 Or Create Scheduled Campaign

```typescript
import { createCampaign, CampaignTemplates } from '../utils/pinpointCampaigns';

await createCampaign(
  'Welcome New Models',
  segmentId,
  CampaignTemplates.welcomeModel('{{firstName}}', '{{portalLink}}'),
  {
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    timezone: 'America/New_York',
  }
);
```

---

## Step 6: View Analytics

1. Go to AWS Console → Pinpoint → Analytics
2. View:
   - Email open rates
   - Click-through rates
   - Engagement metrics
   - Campaign performance

---

## Testing

### Test Event Tracking

```typescript
import { trackEvent } from '../utils/pinpointTracking';

await trackEvent('test-user-id', 'test_event', {
  testAttribute: 'test-value',
});
```

### Test Campaign

```typescript
import { sendCampaign, CampaignTemplates } from '../utils/pinpointCampaigns';

// Send to test segment
await sendCampaign(
  'test-segment-id',
  CampaignTemplates.welcomeModel('Test User', 'https://app.modeledmanagement.com')
);
```

---

## Troubleshooting

### Pinpoint App Not Found
- Check AWS Console → Pinpoint
- Verify app was created during deployment
- Check CloudFormation stack for errors

### Email Not Sending
- Verify SES identity is verified
- Check Pinpoint email channel configuration
- Verify FROM_EMAIL matches verified SES identity

### Events Not Tracking
- Check Lambda function logs
- Verify PINPOINT_APP_ID is set
- Check IAM permissions

### Segments Empty
- Verify user data is synced to Pinpoint endpoints
- Check segment criteria matches user attributes
- Wait a few minutes for segment to update

---

## Next Steps

1. ✅ Deploy backend with Pinpoint resources
2. ✅ Create initial segments
3. ✅ Sync existing users to Pinpoint
4. ✅ Add event tracking to key actions
5. ✅ Create and send first campaign
6. ✅ Monitor analytics

---

**Status:** Ready for Deployment  
**Last Updated:** January 6, 2026

