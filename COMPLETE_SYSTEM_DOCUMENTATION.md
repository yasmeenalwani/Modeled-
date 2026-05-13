# MODELED MANAGEMENT - COMPLETE SYSTEM DOCUMENTATION
## Workflows, Operations, Data, Automations, Integrations, Triggers & Architecture

**Generated:** January 6, 2026  
**Version:** 1.0  
**Status:** Comprehensive Master Document

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Architecture & AWS Services](#2-architecture--aws-services)
3. [Data Models & Schema](#3-data-models--schema)
4. [Complete Workflow Operations](#4-complete-workflow-operations)
5. [Automations & Triggers](#5-automations--triggers)
6. [Integrations & External Services](#6-integrations--external-services)
7. [EventBridge & Step Functions](#7-eventbridge--step-functions)
8. [Operations & Critical Tasks](#8-operations--critical-tasks)
9. [Code Patterns & Best Practices](#9-code-patterns--best-practices)
10. [API Endpoints & Services](#10-api-endpoints--services)

---

# 1. SYSTEM OVERVIEW

## Core Entities

- **ModelRequest**: Professional's booking request
- **Match**: Connection between Request and Model (with score)
- **Booking**: Confirmed appointment
- **ModelProfile**: Model user profile
- **Professional**: Professional user profile
- **Partner**: Salon/studio profile
- **Notification**: In-app notifications

## User Roles & Portals

### Professional Portal (`/portal/*`)
- **User**: Sarah Mitchell (`mock-pro-1`)
- **Key Pages**: Request Creation, Dashboard, Calendar, Matching, Portfolio
- **Functions**: Create requests, view matches, manage bookings, track earnings

### Admin Portal (`/admin/*`)
- **User**: Admin/Yasmeen
- **Key Pages**: Requests Queue, Match Engine, Match Approval, Dashboard, Calendar
- **Functions**: Review requests, run matching, approve matches, monitor system

### Model Portal (`/model-portal/*`)
- **User**: Seraphina Luna (`mock-model-1`)
- **Key Pages**: Opportunities, Profile, Calendar, Sessions
- **Functions**: View opportunities, accept/decline matches, manage bookings

---

# 2. ARCHITECTURE & AWS SERVICES

## AWS Stack

### Core Services
- **AWS Amplify**: Frontend hosting & CI/CD
- **AWS AppSync**: GraphQL API
- **Amazon DynamoDB**: Primary database
- **Amazon S3**: Photo/document storage
- **Amazon Cognito**: User authentication
- **AWS Lambda**: Serverless functions
- **Amazon EventBridge**: Scheduled tasks & event routing
- **AWS Step Functions**: Workflow orchestration (planned)
- **Amazon SES**: Email notifications
- **Amazon Pinpoint**: Push notifications & SMS
- **Amazon CloudWatch**: Monitoring & logging
- **Amazon RDS PostgreSQL**: Analytics database

## Data Flow Architecture

```
Frontend (React) 
  → AWS Amplify (Hosting)
    → AWS AppSync (GraphQL API)
      → DynamoDB (Primary Data)
      → S3 (Storage)
      → Lambda (Business Logic)
        → EventBridge (Scheduled Tasks)
        → Step Functions (Workflows)
        → SES/Pinpoint (Notifications)
        → Stripe (Payments)
```

## File Structure

```
src/
├── portal/              # Professional Portal
│   ├── pages/          # Pro Portal pages
│   └── ProPortalLayout.jsx
├── admin/              # Admin Portal
│   ├── pages/         # Admin pages
│   └── AdminLayout.jsx
├── portal/model-pages/ # Model Portal
│   └── ModelPortalLayout.jsx
├── utils/              # Utilities
│   ├── mockDataService.js
│   ├── matchService.js
│   ├── bookingService.js
│   ├── createNotification.js
│   ├── bookingFlow.js
│   ├── amplifyClient.js
│   ├── errorHandling.js
│   └── databaseOperations.js
├── matching/           # Matching Engine
│   ├── matchingEngine.js
│   └── mockModels.js
└── components/         # Shared components
    ├── ErrorBoundary.jsx
    ├── PhotoUploader.jsx
    └── ChatSchedule.jsx

amplify/
├── backend.ts          # Backend config
├── auth/              # Cognito config
├── data/              # AppSync schema
├── storage/           # S3 config
├── functions/         # Lambda functions
│   ├── booking-reminders/
│   ├── chat-activation/
│   ├── model-payment-reminders/
│   ├── match-expiration/
│   ├── notifications/
│   ├── stripe-payment/
│   └── ... (20+ functions)
└── eventbridge/       # EventBridge rules (reference)
```

---

# 3. DATA MODELS & SCHEMA

## ModelRequest Schema

```typescript
{
  id: string
  professionalId: string
  serviceType: 'blowdry' | 'color' | 'haircut' | 'styling' | 'makeup' | 'nails'
  requestedDate: string (ISO date)
  requestedTime: string
  location: string
  status: 'pending' | 'matching' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: datetime
  updatedAt: datetime
  
  // Matching criteria
  hairLength?: 'short' | 'medium' | 'long' | 'extra_long'
  hairColor?: string
  hairTexture?: 'straight' | 'wavy' | 'curly' | 'coily'
  preferences?: string[]
  
  // Pricing
  budget?: number
  paymentStatus?: 'pending' | 'paid' | 'refunded'
}
```

## Match Schema

```typescript
{
  id: string
  requestId: string
  modelId: string
  professionalId: string
  
  // Scoring
  score: number (0-100)
  attributeMatch: number (0-100)
  agenticScore: number (0-100)
  locationScore: number (0-100)
  availabilityScore: number (0-100)
  
  // Status flow: pending → approved → sent → accepted → confirmed
  status: 'pending' | 'approved' | 'sent' | 'accepted' | 'declined' | 'expired' | 'confirmed'
  
  // Payment
  paymentStatus?: 'pending' | 'paid' | 'refunded'
  paymentAmount?: number
  
  createdAt: datetime
  updatedAt: datetime
  sentAt?: datetime
  acceptedAt?: datetime
  expiredAt?: datetime
}
```

## Booking Schema

```typescript
{
  id: string
  requestId: string
  matchId: string
  modelId: string
  professionalId: string
  
  serviceType: string
  appointmentDate: string (ISO date)
  appointmentTime: string
  location: string
  
  status: 'confirmed' | 'completed' | 'cancelled'
  
  // Reminders
  reminderSent: boolean
  reminderSentAt?: datetime
  
  // Chat
  chatActive: boolean
  chatOpensAt?: datetime
  chatClosesAt?: datetime
  
  createdAt: datetime
  updatedAt: datetime
  completedAt?: datetime
}
```

## ModelProfile Schema

```typescript
{
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  phone: string
  
  // Hair attributes (for matching)
  hairLength: 'short' | 'medium' | 'long' | 'extra_long'
  hairColor: string
  hairTexture: 'straight' | 'wavy' | 'curly' | 'coily'
  hairCondition: 'healthy' | 'damaged' | 'color_treated' | 'virgin'
  
  // Auto-tagged (Hair Engine)
  hairLengthSimple?: enum
  hairColorSimple?: enum
  hairTextureSimple?: enum
  autoTaggedAttributes?: JSON
  attributeConfidence?: JSON
  
  // Services
  openToHaircut: boolean
  openToColor: boolean
  openToStyling: boolean
  openToMakeup: boolean
  openToNails: boolean
  openToSkincare: boolean
  
  // Photos
  photoUrls: string[] (S3 keys)
  headshotUrl: string (S3 key)
  
  // Status
  status: 'pending' | 'approved' | 'active' | 'inactive'
  
  // Identity verification
  identityVerified: boolean
  identityVerificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review'
  
  // Agentic scores
  reliabilityScore?: number (0-100)
  experienceScore?: number (0-100)
  compatibilityScore?: number (0-100)
  feedbackScore?: number (0-100)
  engagementScore?: number (0-100)
  
  // Location
  locationZip: string
  willingToTravel: boolean
  travelRadius?: number (miles)
  
  // Availability
  availability: JSON // { monday: ['9am', '10am'], ... }
}
```

## Status Transitions

### ModelRequest Status Flow
```
pending → matching → confirmed → completed
                      ↓
                  cancelled
```

**Transition Points:**
- `pending → matching`: Admin sends matches to models
- `matching → confirmed`: Model accepts and booking created
- `confirmed → completed`: Service completed
- `confirmed → cancelled`: Booking cancelled

### Match Status Flow
```
pending → approved → sent → accepted → confirmed
                      ↓         ↓
                   expired   declined
```

**Transition Points:**
- `pending → approved`: Admin approves match
- `approved → sent`: Admin sends match to model
- `sent → accepted`: Model accepts match
- `sent → declined`: Model declines match
- `sent → expired`: Match expires (timeout)
- `accepted → confirmed`: Booking created

### Booking Status Flow
```
confirmed → completed
    ↓
cancelled
```

---

# 4. COMPLETE WORKFLOW OPERATIONS

## Phase 1: Request Creation

### Step 1.1: Professional Creates Request
**Location**: `src/portal/pages/ProRequestCreationLuxury.jsx`  
**Trigger**: Professional fills form and clicks "Submit Request"

**Process:**
1. Form validation (service type, date, time required)
2. Load professional profile (fallback to `mock-pro-1`)
3. Create request via `createMockRequest()` or database
4. Status: `'pending'`
5. Save to localStorage (mock) or DynamoDB
6. Navigate to `/portal/requests`

**Data Created:**
```javascript
{
  id: 'mock-request-{n}',
  professionalId: 'mock-pro-1',
  serviceType: 'blowdry',
  requestedDate: '2024-12-15',
  requestedTime: '10:00 AM',
  status: 'pending',
  createdAt: new Date().toISOString()
}
```

**Files:**
- `src/portal/pages/ProRequestCreationLuxury.jsx`
- `src/utils/mockDataService.js` → `createMockRequest()`

---

## Phase 2: Admin Review & Matching

### Step 2.1: Admin Views Request Queue
**Location**: `src/admin/pages/RequestsPage.jsx`  
**Trigger**: Admin navigates to `/admin/requests`

**Process:**
1. Load all requests with status `'pending'`
2. Display request cards with professional info
3. Show workflow progress indicator
4. Admin clicks "Match" or "View Details"

**Data Retrieved:**
- `getMockRequests({ status: 'pending' })` or AppSync query
- Enrich with professional data via `getMockProfessional()`

**Files:**
- `src/admin/pages/RequestsPage.jsx`
- `src/utils/mockDataService.js`

---

### Step 2.2: Admin Runs Matching Engine
**Location**: `src/admin/pages/MatchEnginePage.jsx`  
**Trigger**: Admin clicks "Match" → `/admin/match-engine?requestId={id}`

**Process:**
1. Load request and professional data
2. Convert request to matching format
3. Run `findMatches()` with all models
4. Display match results with scores
5. Admin selects models to approve
6. Click "Approve All" or "Send Booking Links"

**Matching Algorithm** (`src/matching/matchingEngine.js`):
- **Attribute Match** (40% weight): Hair length, color, texture, condition
- **Agentic Score** (35% weight): Reliability, experience, compatibility, feedback, engagement
- **Location Score** (15% weight): Distance between model and request location
- **Availability Score** (10% weight): Schedule alignment

**Files:**
- `src/admin/pages/MatchEnginePage.jsx`
- `src/matching/matchingEngine.js` → `findMatches()`
- `src/utils/matchService.js` → `createMatchesForRequest()`

---

### Step 2.3: Admin Approves & Sends Matches
**Location**: `src/admin/pages/MatchApprovalPage.jsx`  
**Trigger**: Admin clicks "Send Booking Links"

**Process:**
1. **Create Matches**: `createMatchesForRequest(requestId, matchesToCreate)`
   - Creates match records with status `'pending'`
   
2. **Approve Matches**: `approveMatches(matchIds)`
   - Updates each match status to `'approved'`
   
3. **Send to Models**: `sendMatchesToModels(matchIds)`
   - Updates each match status to `'sent'`
   - Creates notification for model
   - Updates request status to `'matching'`

**Status Transitions:**
```
pending → approved → sent
```

**Files:**
- `src/admin/pages/MatchApprovalPage.jsx`
- `src/utils/matchService.js` → `createMatch()`, `approveMatch()`, `sendMatchToModel()`
- `src/utils/createNotification.js` → `createNotification()`

---

## Phase 3: Model Response

### Step 3.1: Model Views Opportunities
**Location**: `src/portal/model-pages/ModelOpportunities.jsx`  
**Trigger**: Model navigates to `/model-portal/opportunities`

**Process:**
1. Load model profile (fallback to `mock-model-1`)
2. Load matches with status `'sent'` for this model
3. Display in "New Opportunities" tab
4. Auto-refresh every 3 seconds

**Data Retrieved:**
- `getMatchesForModel('mock-model-1')` → filters by `modelId` and `status: 'sent'`
- Enrich with request and professional data

**Files:**
- `src/portal/model-pages/ModelOpportunities.jsx`
- `src/utils/matchService.js` → `getMatchesForModel()`

---

### Step 3.2: Model Accepts Match
**Location**: `src/portal/model-pages/ModelOpportunities.jsx`  
**Trigger**: Model clicks "Accept" button

**Process:**
1. Show payment confirmation (simplified for demo)
2. Call `acceptMatch(matchId, paymentData)`
3. Update match status to `'accepted'`
4. Create booking via `createBookingFromMatch(matchId)`
5. Send notifications to:
   - Model (booking confirmed)
   - Professional (model accepted)
   - Admin (match completed)
6. Navigate to payment page (simulated)

**Status Transitions:**
```
sent → accepted
```

**Files:**
- `src/portal/model-pages/ModelOpportunities.jsx`
- `src/utils/matchService.js` → `acceptMatch()`
- `src/utils/bookingService.js` → `createBookingFromMatch()`
- `src/utils/createNotification.js`

---

### Step 3.3: Booking Creation
**Location**: `src/utils/bookingService.js`  
**Trigger**: Model accepts match

**Process:**
1. Get match data (status must be `'accepted'`)
2. Get request and model data
3. Create booking record
4. Update match status to `'confirmed'` (optional)
5. Update request status to `'confirmed'`

**Booking Data:**
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
  reminderSent: false,
  chatActive: false
}
```

**Files:**
- `src/utils/bookingService.js` → `createBookingFromMatch()`
- `src/utils/mockDataService.js` → `createMockBooking()`

---

## Phase 4: Booking Management

### Step 4.1: Calendar Updates
**Location**: Various calendar components  
**Trigger**: Booking created or updated

**Process:**
1. Load bookings for user:
   - Model: `getBookingsForUser(userId, 'model')`
   - Professional: `getBookingsForUser(userId, 'professional')`
   - Admin: `getBookingsForUser(userId, 'admin')` (all bookings)
2. Display in calendar view
3. Show booking details (date, time, service, other party)

**Files:**
- `src/portal/model-pages/ModelCalendar.jsx`
- `src/portal/pages/ProCalendar.jsx`
- `src/admin/pages/AdminCalendar.jsx`
- `src/utils/bookingService.js` → `getBookingsForUser()`

---

### Step 4.2: Notifications
**Location**: `src/utils/createNotification.js`  
**Trigger**: Various workflow events

**Notification Types:**
1. **Match Opportunity** (`match_opportunity`)
   - When: Match sent to model
   - Recipient: Model
   - Message: "You've been matched for {service} on {date}"

2. **Booking Confirmed** (`booking_confirmed`)
   - When: Model accepts and booking created
   - Recipients: Model, Professional, Admin
   - Message: "Booking confirmed for {service} on {date}"

3. **Match Completed** (`match_completed`)
   - When: Booking created
   - Recipient: Admin
   - Message: "Match completed: {model} accepted {request}"

**Files:**
- `src/utils/createNotification.js` → `createNotification()`

---

# 5. AUTOMATIONS & TRIGGERS

## Scheduled Tasks (EventBridge)

### 1. Booking Reminders (24h before)
**Lambda**: `amplify/functions/booking-reminders/`  
**Schedule**: `rate(1 hour)` (runs every hour)  
**Logic**: Query bookings where `appointmentDate = tomorrow` AND `reminderSent = false`  
**Action**: 
- Send email/SMS reminders via SES/Pinpoint
- Update `reminderSent = true`

**Status**: ✅ Lambda created, ⏳ EventBridge rule pending

---

### 2. Chat Activation
**Lambda**: `amplify/functions/chat-activation/`  
**Schedule**: `rate(15 minutes)` (runs every 15 minutes)  
**Logic**:
- Support chats: Opens 24h before, closes 30min after
- Direct chats: Opens 1h before, closes 30min after
**Action**:
- Create/activate chat records
- Set `chatActive = true`
- Set `chatOpensAt` and `chatClosesAt`
- Send notifications

**Status**: ✅ Lambda created, ⏳ EventBridge rule pending

---

### 3. Model Payment Reminders
**Lambda**: `amplify/functions/model-payment-reminders/`  
**Schedule**: `rate(6 hours)` (runs every 6 hours)  
**Logic**: Query matches where:
- `status = 'accepted'`
- `paymentStatus = 'pending'`
- `acceptedAt < 24h ago`
**Action**: Send payment reminder notifications

**Status**: ✅ Lambda created, ⏳ EventBridge rule pending

---

### 4. Match Expiration
**Lambda**: `amplify/functions/match-expiration/`  
**Schedule**: `cron(0 2 * * ? *)` (daily at 2am)  
**Logic**: Query matches where:
- `status = 'sent'`
- `sentAt < 48h ago` (or configured timeout)
**Action**:
- Update match status to `'expired'`
- Notify professional of expiration
- Optionally trigger waitlist matching

**Status**: ✅ Lambda created, ⏳ EventBridge rule pending

---

### 5. Daily Analytics Jobs
**Lambda**: `amplify/functions/analytics-daily/` (to be created)  
**Schedule**: `cron(0 3 * * ? *)` (daily at 3am)  
**Logic**: Calculate daily metrics:
- Request creation rate
- Match success rate
- Booking completion rate
- Revenue totals
**Action**: Update RDS analytics tables

**Status**: ⏳ Not yet created

---

## Event-Driven Triggers

### 1. Request Created → Auto-Matching
**Trigger**: DynamoDB Stream on `ModelRequest` table (status = 'pending')  
**Target**: Lambda function `auto-matching`  
**Logic**:
- Auto-run matching when request created
- Auto-approve matches with score > 85
- Auto-send approved matches to models

**Status**: ⏳ Not yet implemented

**Files to create:**
- `amplify/functions/auto-matching/`
- DynamoDB Stream trigger in `amplify/data/resource.ts`

---

### 2. Booking Created → Chat Activation
**Trigger**: DynamoDB Stream on `Booking` table (status = 'confirmed')  
**Target**: Lambda function `chat-activation`  
**Logic**:
- Create chat records for booking
- Schedule chat activation (24h before)
- Send chat notification

**Status**: ⏳ Not yet implemented

---

### 3. Payment Completed → Booking Confirmation
**Trigger**: Stripe webhook (payment_intent.succeeded)  
**Target**: Lambda function `stripe-payment`  
**Logic**:
- Update match `paymentStatus = 'paid'`
- Update booking status
- Send confirmation notifications
- Activate calendar events

**Status**: ✅ Implemented (Stripe webhook handler exists)

---

### 4. Booking Completed → Score Updates
**Trigger**: DynamoDB Stream on `Booking` table (status = 'completed')  
**Target**: Lambda function `score-updater`  
**Logic**:
- Update model reliability score (+5)
- Update model experience score (+10)
- Update compatibility score based on feedback
- Update professional feedback score

**Status**: ⏳ Not yet implemented

---

# 6. INTEGRATIONS & EXTERNAL SERVICES

## Stripe Integration
**Purpose**: Payment processing  
**Functions**: `amplify/functions/stripe-payment/`

**Endpoints:**
- Create payment intent
- Confirm payment
- Handle webhooks
- Process refunds

**Webhooks:**
- `payment_intent.succeeded` → Update booking, send confirmation
- `payment_intent.failed` → Notify user, retry logic
- `charge.refunded` → Update booking, notify parties

**Files:**
- `src/utils/stripeService.js` (if exists)
- `amplify/functions/stripe-payment/handler.ts`

---

## AWS SES (Email Notifications)
**Purpose**: Transactional emails  
**Functions**: `amplify/functions/notifications/`

**Email Types:**
- Booking confirmations
- Booking reminders (24h before)
- Payment confirmations
- Match opportunities
- Match expirations
- Account verification

**Templates**: Stored in SES or Lambda code

**Files:**
- `amplify/functions/notifications/handler.ts`

---

## Amazon Pinpoint (Push Notifications & SMS)
**Purpose**: Mobile push notifications and SMS  
**Functions**: `amplify/functions/notifications/`

**Notification Types:**
- Match opportunities (push + SMS)
- Booking reminders (SMS 24h before)
- Payment reminders (SMS)
- Chat activations (push)

**Setup**: 
- Pinpoint project configured
- iOS/Android apps registered
- SMS enabled (requires phone number verification)

**Files:**
- `amplify/functions/notifications/handler.ts`
- `docs/integration/PINPOINT_COMPREHENSIVE_INTEGRATION.md`

---

## S3 Storage Integration
**Purpose**: Photo/document storage  
**Configuration**: `amplify/storage/resource.ts`

**Storage Paths:**
- Profile photos: `profile-photos/{userType}/{userId}/{filename}`
- Session photos: `session-photos/{bookingId}/{before|after}/{filename}`
- Documents: `documents/{userType}/{userId}/{filename}`
- Videos: `videos/{userType}/{userId}/{filename}`

**Access Control:**
- Public read for profile photos
- Private for documents
- Signed URLs for temporary access

**Files:**
- `src/utils/storage.js`
- `amplify/storage/resource.ts`

---

## Calendar Integration
**Purpose**: Add bookings to Google/Apple calendars  
**Component**: `src/components/AddToCalendar.jsx`

**Supported Formats:**
- Google Calendar (`.ics` download)
- Apple Calendar (`.ics` download)
- Outlook Calendar (`.ics` download)

**Files:**
- `src/components/AddToCalendar.jsx`

---

# 7. EVENTBRIDGE & STEP FUNCTIONS

## EventBridge Use Cases

### Scheduled Rules

1. **Booking Reminders Rule**
   - Name: `booking-reminders-24h`
   - Schedule: `rate(1 hour)`
   - Target: `booking-reminders` Lambda
   - Status: ⏳ Pending AWS Console setup

2. **Payment Reminders Rule**
   - Name: `model-payment-reminders`
   - Schedule: `rate(6 hours)`
   - Target: `model-payment-reminders` Lambda
   - Status: ⏳ Pending AWS Console setup

3. **Chat Activation Rule**
   - Name: `chat-activation-scheduled`
   - Schedule: `rate(15 minutes)`
   - Target: `chat-activation` Lambda
   - Status: ⏳ Pending AWS Console setup

4. **Match Expiration Rule**
   - Name: `match-expiration-daily`
   - Schedule: `cron(0 2 * * ? *)` (daily at 2am)
   - Target: `match-expiration` Lambda
   - Status: ⏳ Pending AWS Console setup

### Event Patterns

1. **Booking Created Event**
   - Source: DynamoDB Stream on `Booking` table
   - Pattern: `status = 'confirmed'`
   - Targets: 
     - `chat-activation` Lambda
     - `booking-reminders` Lambda (schedule for 24h before)

2. **Match Accepted Event**
   - Source: DynamoDB Stream on `Match` table
   - Pattern: `status = 'accepted'`
   - Targets:
     - `booking-creation` Lambda
     - `payment-processing` Lambda

**Cost**: ~$0.00/month (within free tier for low volume)

---

## Step Functions (Planned)

### Matching & Booking Workflow
**Type**: Standard Workflow  
**Steps**:
1. Run Matching (Lambda)
2. Check Matches Found (Choice)
   - If matches: Send Notifications (Parallel)
   - If no matches: Notify Professional
3. Wait for Model Response (Wait - 24h)
4. Check Booking Status (Choice)
   - If accepted: Process Payment (Lambda with retries)
   - If declined: Notify Waitlist
5. Send Confirmation (Parallel - Email, SMS, Calendar)

**Benefits**:
- Visual workflow tracking
- Automatic retries for payment
- Error handling
- State persistence (up to 1 year)

**Cost**: ~$0.20/month (1,000 workflows/month)

**Status**: ⏳ Planned, not yet implemented

**Files to create:**
- `amplify/workflows/matching-booking-workflow.ts`

---

# 8. OPERATIONS & CRITICAL TASKS

## Critical (Do First)

### 1. EventBridge AWS Console Setup ⚠️ CRITICAL
**Status**: Code complete, AWS Console setup pending  
**Effort**: 30 minutes

**Action**: Create EventBridge rules in AWS Console:
1. Booking Reminders Rule
2. Payment Reminders Rule
3. Chat Activation Rule
4. Match Expiration Rule

**Files ready:**
- ✅ Lambda functions created
- ✅ EventBridge setup guide created
- ⏳ AWS Console rules pending

---

### 2. Auto-Trigger Matching ⚠️ CRITICAL
**Status**: Not started  
**Effort**: 2-3 hours  
**Impact**: Eliminates admin bottleneck

**Action**:
1. Add DynamoDB Stream trigger on `ModelRequest` creation
2. Auto-run matching when request status = 'pending'
3. Auto-approve matches with score > 85
4. Auto-send approved matches to models

**Files to create:**
- `amplify/functions/auto-matching/`
- Trigger configuration in `amplify/data/resource.ts`

---

### 3. Real-Time Score Updates ⚠️ CRITICAL
**Status**: Not started  
**Effort**: 2-3 hours

**Action**:
1. Add event listeners for:
   - Booking completion → Update reliability, experience, compatibility
   - Feedback submission → Update feedback score
   - Cancellation → Penalize reliability (-20)
   - Profile update → Update engagement
   - Login/activity → Update engagement (last active)

2. Add scheduled job (daily at 2am) to recalculate all scores

**Files to create:**
- `amplify/functions/score-updater/`
- Event listeners in `amplify/data/resource.ts`

---

## High Priority

### 4. Error Recovery & Retry Logic
**Status**: Not started  
**Effort**: 2-3 hours

**Action**:
1. Add retry logic for payments (3 attempts with exponential backoff)
2. Add retry logic for notifications
3. Add dead letter queues for failed operations
4. Add error logging to CloudWatch

**Files to modify:**
- `amplify/functions/stripe-payment/` (add retry)
- `amplify/functions/notifications/` (add retry)
- Create SQS dead letter queues

---

### 5. CloudWatch Monitoring & Alerts
**Status**: Not started  
**Effort**: 2-3 hours

**Action**:
1. Create CloudWatch dashboard for:
   - Request creation rate
   - Match success rate
   - Booking completion rate
   - Error rates
   - Lambda execution times

2. Set up alerts for:
   - Error rate > 5%
   - Lambda failures
   - Database connection issues
   - Payment failures

**Files to create:**
- `amplify/monitoring/dashboards.ts` (optional CDK)
- Or create manually in AWS Console

---

# 9. CODE PATTERNS & BEST PRACTICES

## Database Operations Pattern

**✅ GOOD:**
```javascript
import { safeGet } from '../utils/databaseOperations';
import { getMockProfessional } from '../utils/mockDataService';

const professional = await safeGet(
  'Professional',
  id,
  () => getMockProfessional(id)
);
```

**❌ BAD:**
```javascript
const client = generateClient();
const { data } = await client.models.Professional.get({ id });
```

---

## Error Handling Pattern

**✅ GOOD:**
```javascript
import { safeAsync, logError } from '../utils/errorHandling';

const result = await safeAsync(
  () => someOperation(),
  null, // defaultValue
  (error) => logError(error, 'ComponentName', { context: 'operation' })
);
```

**❌ BAD:**
```javascript
try {
  const result = await someOperation();
} catch (error) {
  console.error(error);
}
```

---

## Mock Data Integration Pattern

**✅ GOOD:**
```javascript
import { safeList } from '../utils/databaseOperations';
import { getMockRequests } from '../utils/mockDataService';

const requests = await safeList(
  'ModelRequest',
  { status: { eq: 'pending' } },
  100,
  () => getMockRequests({ status: 'pending' })
);
```

**❌ BAD:**
```javascript
const { data } = await client.models.ModelRequest.list({
  filter: { status: { eq: 'pending' } }
});
```

---

## Amplify Client Pattern

**✅ GOOD:**
```javascript
import { getAmplifyClient, isDatabaseAvailable } from '../utils/amplifyClient';

const client = getAmplifyClient();
if (isDatabaseAvailable()) {
  // Database operations
} else {
  // Fallback to mock data
}
```

**❌ BAD:**
```javascript
const client = generateClient();
if (client.models) {
  // ...
}
```

---

## React Error Boundary Pattern

**✅ GOOD:**
```javascript
import ErrorBoundary from '../components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

---

# 10. API ENDPOINTS & SERVICES

## AppSync GraphQL API

### Queries

```graphql
# Get all requests
query ListRequests($filter: ModelRequestFilterInput) {
  listModelRequests(filter: $filter) {
    items {
      id
      professionalId
      serviceType
      requestedDate
      status
    }
  }
}

# Get all matches for a model
query ListMatches($modelId: ID!) {
  listMatches(filter: { modelId: { eq: $modelId }, status: { eq: "sent" } }) {
    items {
      id
      requestId
      score
      status
    }
  }
}

# Get bookings for user
query ListBookings($userId: ID!, $userType: String!) {
  listBookings(filter: {
    or: [
      { modelId: { eq: $userId } }
      { professionalId: { eq: $userId } }
    ]
  }) {
    items {
      id
      appointmentDate
      appointmentTime
      serviceType
      status
    }
  }
}
```

### Mutations

```graphql
# Create request
mutation CreateRequest($input: CreateModelRequestInput!) {
  createModelRequest(input: $input) {
    id
    status
  }
}

# Accept match
mutation AcceptMatch($id: ID!, $input: UpdateMatchInput!) {
  updateMatch(id: $id, input: $input) {
    id
    status
  }
}

# Create booking
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
  }
}
```

---

## Lambda Functions

### Core Functions

1. **booking-reminders** (`amplify/functions/booking-reminders/`)
   - Scheduled: Every hour
   - Purpose: Send reminders 24h before appointment

2. **chat-activation** (`amplify/functions/chat-activation/`)
   - Scheduled: Every 15 minutes
   - Purpose: Activate chats at scheduled times

3. **model-payment-reminders** (`amplify/functions/model-payment-reminders/`)
   - Scheduled: Every 6 hours
   - Purpose: Send payment reminders

4. **match-expiration** (`amplify/functions/match-expiration/`)
   - Scheduled: Daily at 2am
   - Purpose: Expire old matches

5. **notifications** (`amplify/functions/notifications/`)
   - Invoked: On-demand
   - Purpose: Send email/SMS/push notifications

6. **stripe-payment** (`amplify/functions/stripe-payment/`)
   - Invoked: On-demand + webhooks
   - Purpose: Process payments, handle webhooks

7. **analytics-daily** (`amplify/functions/analytics-daily/`) (to be created)
   - Scheduled: Daily at 3am
   - Purpose: Calculate daily analytics

8. **auto-matching** (`amplify/functions/auto-matching/`) (to be created)
   - Triggered: DynamoDB Stream on ModelRequest
   - Purpose: Auto-run matching on request creation

9. **score-updater** (`amplify/functions/score-updater/`) (to be created)
   - Triggered: DynamoDB Streams on Booking, Feedback, Profile
   - Purpose: Update agentic scores in real-time

---

## Utility Services

### Match Service (`src/utils/matchService.js`)
- `createMatch()` - Create single match
- `createMatchesForRequest()` - Create multiple matches
- `getMatchesForRequest()` - Get matches for request
- `getMatchesForModel()` - Get matches for model
- `approveMatch()` - Approve match (admin)
- `sendMatchToModel()` - Send match to model
- `acceptMatch()` - Model accepts match
- `declineMatch()` - Model declines match

### Booking Service (`src/utils/bookingService.js`)
- `createBookingFromMatch()` - Create booking from accepted match
- `getBookingsForUser()` - Get bookings for user (model/pro/admin)
- `updateBookingStatus()` - Update booking status
- `completeBooking()` - Mark booking as completed

### Notification Service (`src/utils/createNotification.js`)
- `createNotification()` - Create in-app notification
- `sendEmail()` - Send email via SES
- `sendSMS()` - Send SMS via Pinpoint
- `sendPush()` - Send push notification via Pinpoint

### Mock Data Service (`src/utils/mockDataService.js`)
- `shouldUseMockData()` - Check if mock mode enabled
- `createMockRequest()` - Create mock request
- `getMockRequests()` - Get mock requests (with filters)
- `createMockMatch()` - Create mock match
- `getMockMatches()` - Get mock matches (with filters)
- `createMockBooking()` - Create mock booking
- `getMockBookings()` - Get mock bookings (with filters)
- `getMockProfessional()` - Get mock professional
- `getMockModel()` - Get mock model

---

# APPENDIX: QUICK REFERENCE

## Status Flow Diagrams

### Request → Match → Booking Flow
```
Request (pending)
  ↓
Admin Review
  ↓
Matching Engine
  ↓
Matches Created (pending)
  ↓
Admin Approves (approved)
  ↓
Matches Sent (sent)
  ↓
Model Accepts (accepted)
  ↓
Booking Created (confirmed)
  ↓
Service Completed (completed)
```

## Common File Locations

### Professional Portal
- Dashboard: `src/portal/pages/PortalDashboard.jsx`
- Request Creation: `src/portal/pages/ProRequestCreationLuxury.jsx`
- Request Dashboard: `src/portal/pages/ProRequestDashboard.jsx`
- Matching: `src/portal/pages/ProMatching.jsx`
- Calendar: `src/portal/pages/ProCalendar.jsx`
- Portfolio: `src/portal/pages/ProPortfolioConsolidated.jsx`

### Admin Portal
- Dashboard: `src/admin/pages/Dashboard.jsx`
- Requests: `src/admin/pages/RequestsPage.jsx`
- Match Engine: `src/admin/pages/MatchEnginePage.jsx`
- Match Approval: `src/admin/pages/MatchApprovalPage.jsx`
- Calendar: `src/admin/pages/AdminCalendar.jsx`

### Model Portal
- Opportunities: `src/portal/model-pages/ModelOpportunities.jsx`
- Profile: `src/portal/model-pages/ModelProfile.jsx`
- Calendar: `src/portal/model-pages/ModelCalendar.jsx`
- Sessions: `src/portal/model-pages/ModelSessionsConsolidated.jsx`

## Environment Variables

```bash
# Amplify
REACT_APP_AWS_REGION=us-east-1
REACT_APP_AMPLIFY_ENV=dev

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... (Lambda env)

# Pinpoint
PINPOINT_APPLICATION_ID=...
PINPOINT_ORIGINATION_NUMBER=+1234567890 (SMS)

# SES
SES_FROM_EMAIL=noreply@modeled.com
SES_REPLY_TO=support@modeled.com
```

---

**END OF DOCUMENTATION**

**Last Updated:** January 6, 2026  
**Version:** 1.0  
**Total Pages:** ~50+ (when printed)

For questions or updates, refer to individual documentation files in `/docs` directory.
