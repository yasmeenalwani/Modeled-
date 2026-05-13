# Complete Workflow: Sarah → Admin → Emma

## Mock Profiles Setup

### Sarah Mitchell (Professional)
- **ID**: `mock-pro-1`
- **User ID**: `mock-pro-user-1`
- **Email**: `sarah@example.com`
- **Name**: Sarah Mitchell
- **Salon**: Luxe Studio
- **Address**: 123 Beauty St, New York, NY 10001

### Emma Johnson (Model)
- **ID**: `mock-model-1`
- **User ID**: `mock-user-1`
- **Email**: `emma@example.com`
- **Name**: Emma Johnson
- **Hair**: Long, Brown, Wavy, Healthy
- **Location**: 10001

## Complete Workflow Steps

### 1. Sarah Submits Request
- **Location**: Professional Portal → Create Request
- **Action**: Sarah creates a service request
- **Result**: Request saved with `professionalId: 'mock-pro-1'`
- **Status**: `pending`

### 2. Admin Reviews Request
- **Location**: Admin Portal → Request Queue
- **Action**: Admin sees Sarah's request
- **Result**: Request displayed with Sarah's info

### 3. Admin Matches Request
- **Location**: Admin Portal → Match Engine
- **Action**: Admin clicks "Match" → Runs matching engine
- **Result**: 
  - Matches created (Emma prioritized with highest score)
  - Model IDs mapped: `1` → `'mock-model-1'` (Emma)
  - Matches created with `modelId: 'mock-model-1'`
- **Status**: Matches created as `pending`

### 4. Admin Approves Matches
- **Location**: Admin Portal → Match Approval
- **Action**: Admin selects matches and clicks "Approve"
- **Result**: 
  - Matches status → `approved`
  - Then → `sent`
  - Notification sent to Emma

### 5. Emma Views Opportunity
- **Location**: Model Portal → Opportunities
- **Action**: Emma sees match notification
- **Result**: 
  - Match displayed with details
  - Shows Sarah's request info
  - Shows match score

### 6. Emma Accepts & Pays
- **Location**: Model Portal → Opportunities
- **Action**: Emma clicks "Accept" → Confirms payment
- **Result**: 
  - Match status → `accepted`
  - Booking created with:
    - `modelId: 'mock-model-1'` (Emma)
    - `professionalId: 'mock-pro-1'` (Sarah)
  - Request status → `booked`
  - Booking status → `confirmed`

### 7. Notifications Sent
- **Emma**: "🎉 Booking Confirmed!"
- **Sarah**: "✅ New Booking Confirmed" (with Emma's details)
- **Admin**: "✅ Booking Confirmed" (match completed)

### 8. Calendars Updated
- **Emma's Calendar**: Shows confirmed booking
- **Sarah's Calendar**: Shows confirmed booking
- **Admin Calendar**: Shows all bookings

## Key Integration Points

### ID Mapping
- Matching Engine uses numeric IDs (1, 2, 3)
- Mock Data Service uses string IDs ('mock-model-1', 'mock-model-2')
- **Mapping**: `1` → `'mock-model-1'` (Emma)
- **Mapping**: `mock-pro-1` → Sarah (consistent)

### Data Flow
1. **Request Creation**: Uses `professionalId: 'mock-pro-1'` (Sarah)
2. **Match Creation**: Maps `model.id: 1` → `'mock-model-1'` (Emma)
3. **Booking Creation**: Uses both IDs correctly
4. **Calendar Loading**: Filters by correct IDs

### Status Flow
- Request: `pending` → `matching` → `booked`
- Match: `pending` → `approved` → `sent` → `accepted`
- Booking: `confirmed`

## Testing Checklist

- [ ] Sarah creates request → Appears in admin queue
- [ ] Admin matches → Emma appears in results (prioritized)
- [ ] Admin approves → Matches sent to Emma
- [ ] Emma sees opportunity → Match details displayed
- [ ] Emma accepts → Booking created
- [ ] Sarah's calendar → Shows booking
- [ ] Emma's calendar → Shows booking
- [ ] Admin calendar → Shows booking
- [ ] Notifications → All parties notified
