# COMPREHENSIVE WORKFLOW ARCHITECTURE & INTEGRATION GUIDE

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [User Roles & Portals](#user-roles--portals)
3. [End-to-End Workflow](#end-to-end-workflow)
4. [Data Models & Status Transitions](#data-models--status-transitions)
5. [Integration Points](#integration-points)
6. [AWS Architecture](#aws-architecture)
7. [Mock Data vs Production](#mock-data-vs-production)
8. [Testing Checklist](#testing-checklist)

---

## 🎯 System Overview

### Core Entities
- **ModelRequest**: Professional's booking request
- **Match**: Connection between Request and Model (with score)
- **Booking**: Confirmed appointment
- **ModelProfile**: Model user profile
- **Professional**: Professional user profile
- **Notification**: In-app notifications

### Key Services
- **matchService.js**: Match creation, approval, sending
- **bookingService.js**: Booking creation from matches
- **mockDataService.js**: Mock data persistence (localStorage)
- **createNotification.js**: Notification system

---

## 👥 User Roles & Portals

### 1. **Professional Portal** (`/portal/*`)
- **User**: Sarah Mitchell (`mock-pro-1`)
- **Key Pages**:
  - `ProRequestCreationLuxury.jsx`: Create new requests
  - `ProRequestDashboard.jsx`: View all requests
  - `ProMatchViewing.jsx`: View matches for requests
  - `ProfessionalCalendar.jsx`: View confirmed bookings

### 2. **Admin Portal** (`/admin/*`)
- **User**: Admin/Yasmeen
- **Key Pages**:
  - `RequestsPage.jsx`: View request queue
  - `MatchEnginePage.jsx`: Run matching engine, approve matches
  - `MatchApprovalPage.jsx`: Approve and send matches to models
  - `AdminCalendar.jsx`: View all bookings

### 3. **Model Portal** (`/portal/model-pages/*`)
- **User**: Emma Johnson (`mock-model-1`)
- **Key Pages**:
  - `ModelOpportunities.jsx`: View and respond to match opportunities
  - `ModelCalendar.jsx`: View confirmed bookings

---

## 🔄 End-to-End Workflow

### **Phase 1: Request Creation**

#### Step 1.1: Professional Creates Request
**Location**: `ProRequestCreationLuxury.jsx`
**Trigger**: Professional fills out multi-step form and clicks "Submit Request"

**Process**:
1. Form validation (service type, date, time required)
2. Load professional profile (fallback to Sarah Mitchell `mock-pro-1`)
3. Create request via `createMockRequest()` or database
4. **Status**: `'pending'`
5. Save to localStorage (mock) or database
6. Navigate to `/portal/requests`

**Data Created**:
```javascript
{
  id: 'mock-request-{n}',
  professionalId: 'mock-pro-1',
  serviceType: 'blowdry',
  requestedDate: '2024-12-15',
  requestedTime: '10:00 AM',
  status: 'pending',
  // ... other fields
}
```

**Files Involved**:
- `src/portal/pages/ProRequestCreationLuxury.jsx`
- `src/utils/mockDataService.js` → `createMockRequest()`

---

### **Phase 2: Admin Review & Matching**

#### Step 2.1: Admin Views Request Queue
**Location**: `RequestsPage.jsx`
**Trigger**: Admin navigates to `/admin/requests`

**Process**:
1. Load all requests with status `'pending'`
2. Display request cards with professional info
3. Show workflow progress indicator
4. Admin can click "Match" or "View Details"

**Data Retrieved**:
- `getMockRequests({ status: 'pending' })` or database query
- Enrich with professional data via `getMockProfessional()`

**Files Involved**:
- `src/admin/pages/RequestsPage.jsx`
- `src/utils/mockDataService.js` → `getMockRequests()`, `getMockProfessional()`

---

#### Step 2.2: Admin Runs Matching Engine
**Location**: `MatchEnginePage.jsx`
**Trigger**: Admin clicks "Match" button → navigates to `/admin/match-engine?requestId={id}`

**Process**:
1. Load request and professional data
2. Convert request to matching format
3. Run `findMatches()` with mock models
4. Display match results with scores
5. Admin selects models to approve
6. Click "Approve All" or "Send Booking Links"

**Matching Logic**:
- Uses `findMatches()` from `matching/matchingEngine.js`
- Prioritizes Emma Johnson (`mock-model-1`) if present
- Calculates match scores based on:
  - Attribute match (40% weight)
  - Agentic scores (35% weight)
  - Location (15% weight)
  - Availability (10% weight)

**Files Involved**:
- `src/admin/pages/MatchEnginePage.jsx`
- `src/matching/matchingEngine.js` → `findMatches()`
- `src/utils/matchService.js` → `createMatchesForRequest()`

---

#### Step 2.3: Admin Approves & Sends Matches
**Location**: `MatchApprovalPage.jsx` OR `MatchEnginePage.jsx`
**Trigger**: Admin clicks "Send Booking Links" after selecting models

**Process**:
1. **Create Matches**: `createMatchesForRequest(requestId, matchesToCreate)`
   - Maps numeric model IDs to string IDs (1 → `'mock-model-1'`)
   - Creates match records with status `'pending'`
   - **Status**: `'pending'`

2. **Approve Matches**: `approveMatches(matchIds)`
   - Updates each match status to `'approved'`
   - **Status**: `'approved'`

3. **Send to Models**: `sendMatchesToModels(matchIds)`
   - Updates each match status to `'sent'`
   - **Status**: `'sent'`
   - Creates notification for model
   - Updates request status to `'matching'`

**Status Transitions**:
```
pending → approved → sent
```

**Files Involved**:
- `src/admin/pages/MatchApprovalPage.jsx`
- `src/utils/matchService.js` → `createMatch()`, `approveMatch()`, `sendMatchToModel()`
- `src/utils/createNotification.js` → `createNotification()`

---

### **Phase 3: Model Response**

#### Step 3.1: Model Views Opportunities
**Location**: `ModelOpportunities.jsx`
**Trigger**: Model navigates to `/portal/model-pages/opportunities`

**Process**:
1. Load model profile (fallback to Emma `mock-model-1`)
2. Load matches with status `'sent'` for this model
3. Display in "New Opportunities" tab
4. Auto-refresh every 3 seconds

**Data Retrieved**:
- `getMatchesForModel('mock-model-1')` → filters by `modelId` and `status: 'sent'`
- Enrich with request and professional data

**Files Involved**:
- `src/portal/model-pages/ModelOpportunities.jsx`
- `src/utils/matchService.js` → `getMatchesForModel()`
- `src/utils/mockDataService.js` → `getMockMatches()`

---

#### Step 3.2: Model Accepts Match
**Location**: `ModelOpportunities.jsx`
**Trigger**: Model clicks "Accept" button on a match

**Process**:
1. Show payment confirmation (simplified for demo)
2. Call `acceptMatch(matchId, paymentData)`
3. Update match status to `'accepted'`
4. **Status**: `'accepted'`
5. Create booking via `createBookingFromMatch(matchId)`
6. Send notifications to:
   - Model (booking confirmed)
   - Professional (model accepted)
   - Admin (match completed)
7. Navigate to payment page (simulated)

**Status Transitions**:
```
sent → accepted
```

**Files Involved**:
- `src/portal/model-pages/ModelOpportunities.jsx`
- `src/utils/matchService.js` → `acceptMatch()`
- `src/utils/bookingService.js` → `createBookingFromMatch()`
- `src/utils/createNotification.js` → `createNotification()`

---

#### Step 3.3: Booking Creation
**Location**: `bookingService.js`
**Trigger**: Model accepts match

**Process**:
1. Get match data (status must be `'accepted'`)
2. Get request and model data
3. Create booking record:
   ```javascript
   {
     id: 'mock-booking-{n}',
     requestId: match.requestId,
     matchId: match.id,
     modelId: match.modelId,
     professionalId: request.professionalId,
     serviceType: request.serviceType,
     appointmentDate: request.requestedDate,
     appointmentTime: request.requestedTime,
     status: 'confirmed',
     // ... other fields
   }
   ```
4. Update match status to `'confirmed'` (optional)
5. Update request status to `'confirmed'`
6. **Status**: `'confirmed'`

**Files Involved**:
- `src/utils/bookingService.js` → `createBookingFromMatch()`
- `src/utils/mockDataService.js` → `createMockBooking()`, `updateMockMatch()`, `updateMockRequest()`

---

### **Phase 4: Calendar & Notifications**

#### Step 4.1: Calendar Updates
**Location**: `ModelCalendar.jsx`, `ProfessionalCalendar.jsx`, `AdminCalendar.jsx`
**Trigger**: Booking created or updated

**Process**:
1. Load bookings for user:
   - Model: `getBookingsForUser(userId, 'model')`
   - Professional: `getBookingsForUser(userId, 'professional')`
   - Admin: `getBookingsForUser(userId, 'admin')` (all bookings)
2. Display in calendar view
3. Show booking details (date, time, service, other party)

**Files Involved**:
- `src/portal/model-pages/ModelCalendar.jsx`
- `src/portal/pages/ProfessionalCalendar.jsx`
- `src/admin/pages/AdminCalendar.jsx`
- `src/utils/bookingService.js` → `getBookingsForUser()`

---

#### Step 4.2: Notifications
**Location**: `createNotification.js`
**Trigger**: Various workflow events

**Notification Types**:
1. **Match Opportunity** (`match_opportunity`)
   - **When**: Match sent to model
   - **Recipient**: Model
   - **Message**: "You've been matched for {service} on {date}"

2. **Booking Confirmed** (`booking_confirmed`)
   - **When**: Model accepts and booking created
   - **Recipients**: Model, Professional, Admin
   - **Message**: "Booking confirmed for {service} on {date}"

3. **Match Completed** (`match_completed`)
   - **When**: Booking created
   - **Recipient**: Admin
   - **Message**: "Match completed: {model} accepted {request}"

**Files Involved**:
- `src/utils/createNotification.js` → `createNotification()`

---

## 📊 Data Models & Status Transitions

### **ModelRequest Status Flow**
```
pending → matching → confirmed
```

**States**:
- `'pending'`: Request created, awaiting admin review
- `'matching'`: Admin approved, matches sent to models
- `'confirmed'`: Model accepted, booking created

**Transition Points**:
- `pending → matching`: When admin sends matches to models
- `matching → confirmed`: When model accepts and booking created

---

### **Match Status Flow**
```
pending → approved → sent → accepted → confirmed
```

**States**:
- `'pending'`: Match created, awaiting admin approval
- `'approved'`: Admin approved match
- `'sent'`: Match sent to model, awaiting response
- `'accepted'`: Model accepted match
- `'declined'`: Model declined match
- `'expired'`: Match expired (timeout)
- `'confirmed'`: Booking created from match

**Transition Points**:
- `pending → approved`: Admin approves match
- `approved → sent`: Admin sends match to model
- `sent → accepted`: Model accepts match
- `sent → declined`: Model declines match
- `accepted → confirmed`: Booking created

---

### **Booking Status Flow**
```
confirmed → completed → cancelled (optional)
```

**States**:
- `'confirmed'`: Booking created and confirmed
- `'completed'`: Service completed
- `'cancelled'`: Booking cancelled

---

## 🔌 Integration Points

### **1. Mock Data Service** (`mockDataService.js`)
**Purpose**: Provides persistent mock data via localStorage

**Key Functions**:
- `createMockRequest()`: Create request
- `getMockRequests()`: Get requests (with filters)
- `updateMockRequest()`: Update request status
- `createMockMatch()`: Create match
- `getMockMatches()`: Get matches (with filters)
- `updateMockMatch()`: Update match status
- `createMockBooking()`: Create booking
- `getMockBookings()`: Get bookings (with filters)
- `shouldUseMockData()`: Check if mock mode enabled

**Storage**: `localStorage.getItem('modeled_mock_data')`

---

### **2. Match Service** (`matchService.js`)
**Purpose**: Manages match lifecycle

**Key Functions**:
- `createMatch()`: Create single match
- `createMatchesForRequest()`: Create multiple matches
- `getMatchesForRequest()`: Get matches for request
- `getMatchesForModel()`: Get matches for model
- `approveMatch()`: Approve match (admin)
- `sendMatchToModel()`: Send match to model
- `acceptMatch()`: Model accepts match
- `declineMatch()`: Model declines match

**Integration**:
- Uses `mockDataService` when `shouldUseMockData()` is true
- Falls back to database when mock data unavailable

---

### **3. Booking Service** (`bookingService.js`)
**Purpose**: Manages booking lifecycle

**Key Functions**:
- `createBookingFromMatch()`: Create booking from accepted match
- `getBookingsForUser()`: Get bookings for user (model/pro/admin)

**Integration**:
- Called when model accepts match
- Creates booking, updates match and request status
- Sends notifications

---

### **4. Notification Service** (`createNotification.js`)
**Purpose**: Creates in-app notifications

**Key Function**:
- `createNotification({ userId, userType, type, title, message, data })`

**Integration Points**:
- Match sent to model
- Booking created
- Match completed

---

## ☁️ AWS Architecture

### **Current Setup (Mock Data Mode)**
- **Storage**: Browser localStorage
- **Data Persistence**: `localStorage.setItem('modeled_mock_data', JSON.stringify(data))`
- **No AWS Services Active**: All operations use mock data

### **Production Architecture (When Enabled)**

#### **AWS Amplify DataStore**
- **Schema**: Defined in `amplify/data/resource.ts`
- **Models**:
  - `ModelRequest`
  - `Match`
  - `Booking`
  - `ModelProfile`
  - `Professional`
  - `Notification`

#### **AWS Services (Planned)**
- **S3**: Photo storage
- **EventBridge**: Workflow automation
- **Lambda**: Serverless functions
- **SES**: Email notifications
- **Pinpoint**: Push notifications

---

## 🧪 Mock Data vs Production

### **Mock Data Mode** (Current)
**Enabled When**: `shouldUseMockData()` returns `true`

**Characteristics**:
- All data stored in `localStorage`
- No network calls
- Instant operations
- Data persists across page refreshes
- Primary mock users:
  - **Professional**: Sarah Mitchell (`mock-pro-1`)
  - **Model**: Emma Johnson (`mock-model-1`)

**How to Enable/Disable**:
- Check `src/utils/mockDataService.js` → `shouldUseMockData()`
- Currently returns `true` (always use mock)

---

### **Production Mode** (Future)
**Enabled When**: Database connection available

**Characteristics**:
- Data stored in AWS Amplify DataStore
- Network calls to AWS
- Real-time sync
- Multi-user support

---

## ✅ Testing Checklist

### **Phase 1: Request Creation**
- [ ] Professional can create request
- [ ] Request saved with status `'pending'`
- [ ] Request appears in admin queue
- [ ] Professional can view their requests

### **Phase 2: Admin Matching**
- [ ] Admin can view request queue
- [ ] Admin can navigate to match engine
- [ ] Matching engine runs and finds models
- [ ] Emma Johnson appears in results
- [ ] Admin can select models
- [ ] Admin can approve matches
- [ ] Matches created with status `'pending'`
- [ ] Matches updated to `'approved'`
- [ ] Matches sent (status `'sent'`)
- [ ] Request status updated to `'matching'`

### **Phase 3: Model Response**
- [ ] Model can view opportunities
- [ ] Matches with status `'sent'` appear
- [ ] Model can see match details
- [ ] Model can accept match
- [ ] Match status updated to `'accepted'`
- [ ] Booking created with status `'confirmed'`
- [ ] Notifications sent to all parties

### **Phase 4: Calendar & Notifications**
- [ ] Model calendar shows booking
- [ ] Professional calendar shows booking
- [ ] Admin calendar shows booking
- [ ] Notifications appear in UI
- [ ] All statuses correct in storage

---

## 🔍 Debugging Guide

### **Check Match Status**
```javascript
// In browser console
const data = JSON.parse(localStorage.getItem('modeled_mock_data'));
console.log('Matches:', data.matches);
console.log('Sent matches:', data.matches.filter(m => m.status === 'sent'));
```

### **Check Request Status**
```javascript
const data = JSON.parse(localStorage.getItem('modeled_mock_data'));
console.log('Requests:', data.requests);
```

### **Check Bookings**
```javascript
const data = JSON.parse(localStorage.getItem('modeled_mock_data'));
console.log('Bookings:', data.bookings);
```

### **Clear Mock Data** (if needed)
```javascript
localStorage.removeItem('modeled_mock_data');
```

---

## 📝 Key Files Reference

### **Professional Portal**
- `src/portal/pages/ProRequestCreationLuxury.jsx` - Create request
- `src/portal/pages/ProRequestDashboard.jsx` - View requests
- `src/portal/pages/ProMatchViewing.jsx` - View matches
- `src/portal/pages/ProfessionalCalendar.jsx` - View calendar

### **Admin Portal**
- `src/admin/pages/RequestsPage.jsx` - Request queue
- `src/admin/pages/MatchEnginePage.jsx` - Run matching
- `src/admin/pages/MatchApprovalPage.jsx` - Approve matches
- `src/admin/pages/AdminCalendar.jsx` - View calendar

### **Model Portal**
- `src/portal/model-pages/ModelOpportunities.jsx` - View/accept opportunities
- `src/portal/model-pages/ModelCalendar.jsx` - View calendar

### **Core Services**
- `src/utils/mockDataService.js` - Mock data management
- `src/utils/matchService.js` - Match operations
- `src/utils/bookingService.js` - Booking operations
- `src/utils/createNotification.js` - Notifications

### **Matching Engine**
- `src/matching/matchingEngine.js` - Matching algorithm
- `src/matching/mockModels.js` - Mock model data

---

## 🚀 Next Steps

1. **Test Each Phase**: Go through the testing checklist
2. **Verify Status Transitions**: Check console logs for status changes
3. **Check Data Persistence**: Verify data in localStorage
4. **Test Notifications**: Ensure notifications appear
5. **Verify Calendar Updates**: Check all three calendars

---

**Last Updated**: 2024-12-15
**Version**: 1.0
