# WORKFLOW VISUAL DIAGRAM & TRIGGER POINTS

## 🎯 Complete Workflow Flowchart

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 1: REQUEST CREATION                     │
└─────────────────────────────────────────────────────────────────┘

[Professional Portal]
  │
  ├─> ProRequestCreationLuxury.jsx
  │   │
  │   ├─> Fill Form (Service, Date, Time, Attributes)
  │   │
  │   ├─> Click "Submit Request"
  │   │   │
  │   │   ├─> TRIGGER: handleSubmit()
  │   │   │
  │   │   ├─> createMockRequest() OR client.models.ModelRequest.create()
  │   │   │
  │   │   └─> STATUS: 'pending'
  │   │
  │   └─> Navigate to /portal/requests
  │
  └─> [Data Created]
      └─> ModelRequest {
            id: 'mock-request-{n}',
            professionalId: 'mock-pro-1',
            status: 'pending',
            ...
          }


┌─────────────────────────────────────────────────────────────────┐
│              PHASE 2: ADMIN REVIEW & MATCHING                    │
└─────────────────────────────────────────────────────────────────┘

[Admin Portal]
  │
  ├─> RequestsPage.jsx
  │   │
  │   ├─> Load Requests (status: 'pending')
  │   │   │
  │   │   └─> getMockRequests({ status: 'pending' })
  │   │
  │   ├─> Display Request Cards
  │   │
  │   └─> Click "Match" Button
  │       │
  │       └─> Navigate to /admin/match-engine?requestId={id}
  │
  ├─> MatchEnginePage.jsx
  │   │
  │   ├─> Load Request & Professional Data
  │   │
  │   ├─> Run Matching Engine
  │   │   │
  │   │   ├─> TRIGGER: handleRunEngine()
  │   │   │
  │   │   ├─> findMatches(models, request)
  │   │   │   │
  │   │   │   └─> Returns: Matched models with scores
  │   │   │
  │   │   └─> Display Results (Emma Johnson prioritized)
  │   │
  │   ├─> Admin Selects Models
  │   │
  │   └─> Click "Approve All" or "Send Booking Links"
  │       │
  │       └─> Navigate to /admin/match-approval?requestId={id}
  │
  └─> MatchApprovalPage.jsx
      │
      ├─> TRIGGER: handleApproveMatches()
      │   │
      │   ├─> Step 1: Create Matches
      │   │   │
      │   │   ├─> createMatchesForRequest(requestId, matchesToCreate)
      │   │   │   │
      │   │   │   ├─> For each model:
      │   │   │   │   └─> createMatch(requestId, modelId, matchData)
      │   │   │   │       │
      │   │   │   │       ├─> Map ID: 1 → 'mock-model-1'
      │   │   │   │       │
      │   │   │   │       └─> STATUS: 'pending'
      │   │   │   │
      │   │   │   └─> [Data Created]
      │   │   │       └─> Match {
      │   │   │             id: 'mock-match-{n}',
      │   │   │             requestId: 'mock-request-{n}',
      │   │   │             modelId: 'mock-model-1',
      │   │   │             status: 'pending',
      │   │   │             matchScore: 85,
      │   │   │             ...
      │   │   │           }
      │   │   │
      │   │   ├─> Step 2: Approve Matches
      │   │   │   │
      │   │   │   ├─> approveMatches(matchIds)
      │   │   │   │   │
      │   │   │   │   └─> For each match:
      │   │   │   │       └─> approveMatch(matchId)
      │   │   │   │           │
      │   │   │   │           └─> STATUS: 'approved'
      │   │   │   │
      │   │   │   └─> updateMockMatch(matchId, { status: 'approved' })
      │   │   │
      │   │   └─> Step 3: Send to Models
      │   │       │
      │   │       ├─> sendMatchesToModels(matchIds)
      │   │       │   │
      │   │       │   └─> For each match:
      │   │       │       └─> sendMatchToModel(matchId)
      │   │       │           │
      │   │       │           ├─> updateMockMatch(matchId, { status: 'sent' })
      │   │       │           │
      │   │       │           ├─> STATUS: 'sent'
      │   │       │           │
      │   │       │           └─> createNotification({
      │   │       │                 userId: model.userId,
      │   │       │                 type: 'match_opportunity',
      │   │       │                 ...
      │   │       │               })
      │   │       │
      │   │       └─> updateMockRequest(requestId, { status: 'matching' })
      │   │
      │   └─> [Status Updates]
      │       ├─> Match: 'pending' → 'approved' → 'sent'
      │       └─> Request: 'pending' → 'matching'


┌─────────────────────────────────────────────────────────────────┐
│                    PHASE 3: MODEL RESPONSE                       │
└─────────────────────────────────────────────────────────────────┘

[Model Portal]
  │
  ├─> ModelOpportunities.jsx
  │   │
  │   ├─> Load Model Profile (fallback to Emma: 'mock-model-1')
  │   │
  │   ├─> Load Matches
  │   │   │
  │   │   ├─> getMatchesForModel('mock-model-1')
  │   │   │   │
  │   │   │   └─> Filter: status === 'sent'
  │   │   │
  │   │   └─> Display in "New Opportunities" Tab
  │   │
  │   ├─> Model Views Match Details
  │   │   │
  │   │   └─> Shows: Service, Date, Time, Location, Score, Professional
  │   │
  │   └─> Click "Accept" Button
  │       │
  │       ├─> TRIGGER: handleAccept(matchId)
  │       │   │
  │       │   ├─> Show Payment Confirmation (simplified)
  │       │   │
  │       │   ├─> acceptMatch(matchId, paymentData)
  │       │   │   │
  │       │   │   ├─> updateMockMatch(matchId, { status: 'accepted' })
  │       │   │   │
  │       │   │   └─> STATUS: 'sent' → 'accepted'
  │       │   │
  │       │   └─> createBookingFromMatch(matchId)
  │       │       │
  │       │       ├─> Get Match, Request, Model, Professional Data
  │       │       │
  │       │       ├─> createMockBooking({
  │       │       │     matchId: match.id,
  │       │       │     requestId: match.requestId,
  │       │       │     modelId: match.modelId,
  │       │       │     professionalId: request.professionalId,
  │       │       │     serviceType: request.serviceType,
  │       │       │     appointmentDate: request.requestedDate,
  │       │       │     appointmentTime: request.requestedTime,
  │       │       │     status: 'confirmed',
  │       │       │     ...
  │       │       │   })
  │       │       │
  │       │       ├─> updateMockMatch(matchId, { status: 'confirmed' })
  │       │       │
  │       │       ├─> updateMockRequest(requestId, { status: 'confirmed' })
  │       │       │
  │       │       └─> sendBookingNotifications()
  │       │           │
  │       │           ├─> Notification to Model
  │       │           ├─> Notification to Professional
  │       │           └─> Notification to Admin
  │       │
  │       └─> Navigate to Payment Page (simulated)
  │
  └─> [Data Created]
      └─> Booking {
            id: 'mock-booking-{n}',
            matchId: 'mock-match-{n}',
            requestId: 'mock-request-{n}',
            modelId: 'mock-model-1',
            professionalId: 'mock-pro-1',
            status: 'confirmed',
            ...
          }


┌─────────────────────────────────────────────────────────────────┐
│              PHASE 4: CALENDAR & NOTIFICATIONS                   │
└─────────────────────────────────────────────────────────────────┘

[All Portals]
  │
  ├─> ModelCalendar.jsx
  │   │
  │   ├─> getBookingsForUser(userId, 'model')
  │   │   │
  │   │   └─> Filter: modelId === 'mock-model-1'
  │   │
  │   └─> Display Bookings in Calendar
  │
  ├─> ProfessionalCalendar.jsx
  │   │
  │   ├─> getBookingsForUser(userId, 'professional')
  │   │   │
  │   │   └─> Filter: professionalId === 'mock-pro-1'
  │   │
  │   └─> Display Bookings in Calendar
  │
  └─> AdminCalendar.jsx
      │
      ├─> getBookingsForUser(userId, 'admin')
      │   │
      │   └─> Returns: All bookings
      │
      └─> Display All Bookings in Calendar
```

---

## 🔄 Status Transition Diagram

### Request Status Flow
```
┌─────────┐
│ pending │  ← Created by Professional
└────┬────┘
     │
     │ Admin sends matches
     ▼
┌──────────┐
│ matching │  ← Matches sent to models
└────┬─────┘
     │
     │ Model accepts match
     ▼
┌───────────┐
│ confirmed │  ← Booking created
└───────────┘
```

### Match Status Flow
```
┌─────────┐
│ pending │  ← Created by Admin
└────┬────┘
     │
     │ Admin approves
     ▼
┌──────────┐
│ approved │
└────┬─────┘
     │
     │ Admin sends to model
     ▼
┌──────┐
│ sent │  ← Visible to Model
└──┬───┘
   │
   ├─> Model accepts
   │   ▼
   │ ┌──────────┐
   │ │ accepted │
   │ └────┬─────┘
   │      │
   │      │ Booking created
   │      ▼
   │ ┌───────────┐
   │ │ confirmed │
   │ └───────────┘
   │
   └─> Model declines
       ▼
     ┌─────────┐
     │declined │
     └─────────┘
```

### Booking Status Flow
```
┌───────────┐
│ confirmed │  ← Created from accepted match
└─────┬─────┘
      │
      │ Service completed
      ▼
┌───────────┐
│ completed │
└───────────┘
```

---

## 🎯 Trigger Points & Automation

### **Automatic Triggers**

1. **Request Created** → Auto-generate matches (DISABLED - Admin does manually)
   - **Location**: `ProRequestCreationLuxury.jsx`
   - **Current**: Request stays `'pending'` until admin reviews

2. **Match Sent** → Create notification
   - **Location**: `matchService.js` → `sendMatchToModel()`
   - **Action**: `createNotification()` for model

3. **Match Accepted** → Create booking
   - **Location**: `matchService.js` → `acceptMatch()`
   - **Action**: `createBookingFromMatch()`

4. **Booking Created** → Send notifications
   - **Location**: `bookingService.js` → `createBookingFromMatch()`
   - **Action**: Notify model, professional, admin

5. **Booking Created** → Update statuses
   - **Location**: `bookingService.js` → `createBookingFromMatch()`
   - **Action**: Update match to `'confirmed'`, request to `'confirmed'`

### **Manual Triggers (Admin Actions)**

1. **Admin Runs Matching Engine**
   - **Location**: `MatchEnginePage.jsx`
   - **Action**: `findMatches()` → Display results

2. **Admin Approves Matches**
   - **Location**: `MatchApprovalPage.jsx`
   - **Action**: `approveMatches()` → Status: `'approved'`

3. **Admin Sends Matches**
   - **Location**: `MatchApprovalPage.jsx`
   - **Action**: `sendMatchesToModels()` → Status: `'sent'`

### **User Actions**

1. **Professional Creates Request**
   - **Location**: `ProRequestCreationLuxury.jsx`
   - **Action**: `createMockRequest()` → Status: `'pending'`

2. **Model Accepts Match**
   - **Location**: `ModelOpportunities.jsx`
   - **Action**: `acceptMatch()` → Status: `'accepted'`

3. **Model Declines Match**
   - **Location**: `ModelOpportunities.jsx`
   - **Action**: `declineMatch()` → Status: `'declined'`

---

## 🔌 Integration Points

### **Data Flow Between Services**

```
┌──────────────────┐
│ mockDataService  │  ← Central storage (localStorage)
└────────┬─────────┘
         │
         ├─> Used by matchService
         ├─> Used by bookingService
         └─> Used by all portal pages
```

### **Service Dependencies**

```
matchService.js
  ├─> Depends on: mockDataService.js
  ├─> Calls: createNotification.js
  └─> Used by: MatchEnginePage, MatchApprovalPage, ModelOpportunities

bookingService.js
  ├─> Depends on: mockDataService.js
  ├─> Calls: createNotification.js
  └─> Used by: ModelOpportunities, Calendar pages

createNotification.js
  └─> Standalone service
      └─> Used by: matchService, bookingService
```

---

## 📍 Key File Locations

### **Professional Portal**
- Request Creation: `src/portal/pages/ProRequestCreationLuxury.jsx`
- Request Dashboard: `src/portal/pages/ProRequestDashboard.jsx`
- Match Viewing: `src/portal/pages/ProMatchViewing.jsx`
- Calendar: `src/portal/pages/ProfessionalCalendar.jsx`

### **Admin Portal**
- Request Queue: `src/admin/pages/RequestsPage.jsx`
- Match Engine: `src/admin/pages/MatchEnginePage.jsx`
- Match Approval: `src/admin/pages/MatchApprovalPage.jsx`
- Calendar: `src/admin/pages/AdminCalendar.jsx`

### **Model Portal**
- Opportunities: `src/portal/model-pages/ModelOpportunities.jsx`
- Calendar: `src/portal/model-pages/ModelCalendar.jsx`

### **Core Services**
- Mock Data: `src/utils/mockDataService.js`
- Match Operations: `src/utils/matchService.js`
- Booking Operations: `src/utils/bookingService.js`
- Notifications: `src/utils/createNotification.js`

---

## 🧪 Testing Points

### **Phase 1: Request Creation**
- ✅ Professional can create request
- ✅ Request saved with status `'pending'`
- ✅ Request appears in admin queue

### **Phase 2: Admin Matching**
- ✅ Admin can view request queue
- ✅ Admin can run matching engine
- ✅ Matches created with status `'pending'`
- ✅ Matches approved (status `'approved'`)
- ✅ Matches sent (status `'sent'`)

### **Phase 3: Model Response**
- ✅ Model can view opportunities (status `'sent'`)
- ✅ Model can accept match
- ✅ Match status → `'accepted'`
- ✅ Booking created (status `'confirmed'`)

### **Phase 4: Calendar & Notifications**
- ✅ Bookings appear in all calendars
- ✅ Notifications sent to all parties

---

**Last Updated**: 2024-12-15
