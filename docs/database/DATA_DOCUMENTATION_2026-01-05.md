# Data Documentation - Modeled Management Platform
## Comprehensive Guide to Data Collection, Usage, Privacy & Rights

---

## 📋 **Table of Contents**

1. [Data Collection Overview](#data-collection-overview)
2. [Data Types & Sources](#data-types--sources)
3. [ML/AI Datasets & Training](#mlai-datasets--training)
4. [Data Storage & Architecture](#data-storage--architecture)
5. [Data Privacy & Compliance](#data-privacy--compliance)
6. [User Data Rights](#user-data-rights)
7. [Data Retention & Deletion](#data-retention--deletion)
8. [Data Security](#data-security)
9. [Third-Party Data Sharing](#third-party-data-sharing)
10. [Data Governance](#data-governance)

---

## 📊 **Data Collection Overview**

### **What Data We Collect**

Modeled collects data to:
- **Match models with professionals** (hair attributes, availability, preferences)
- **Process payments** (Stripe payment information)
- **Provide services** (bookings, communications, training)
- **Improve matching** (ML/AI analysis of photos)
- **Comply with legal requirements** (identity verification)

### **Data Collection Principles**

1. **Minimal Collection**: Only collect what's necessary for the service
2. **Explicit Consent**: Users must agree to data collection
3. **Transparency**: Clear disclosure of what's collected and why
4. **User Control**: Users can access, export, and delete their data
5. **Security First**: All data encrypted and secured

### **Consent Tracking**

**Current Implementation**:
- ✅ **Terms Acceptance**: `termsAccepted` boolean + `termsAcceptedAt` timestamp
  - Tracked for: Models, Professionals, Partners
  - Stored in: DynamoDB (ModelProfile, Professional, Partner tables)
  - Purpose: Legal agreement to use the platform

**Needs Implementation**:
- ⚠️ **ML Training Data Consent**: Separate consent for using data in ML training
  - Should be: Explicit opt-in checkbox
  - Stored as: `mlTrainingConsent` boolean + `mlTrainingConsentAt` timestamp
  - Default: `false` (opt-in, not opt-out)
  
- ⚠️ **Marketing Communications Consent**: Opt-in for marketing emails
  - Should be: Separate from transactional emails
  - Stored as: `marketingConsent` boolean
  - Default: `false` (opt-in)

- ⚠️ **Analytics Consent**: Opt-out for analytics tracking
  - Should be: Opt-out checkbox (legitimate interest basis)
  - Stored as: `analyticsOptOut` boolean
  - Default: `false` (tracking enabled, user can opt-out)

**Consent Management Best Practices**:
- Granular consent (separate checkboxes for different uses)
- Easy to withdraw (one-click opt-out)
- Clear language (what data, how used, who sees it)
- Record consent history (when given, when withdrawn)
- Regular consent refresh (re-consent after major changes)

---

## 📝 **Data Types & Sources**

### **1. Model Profile Data**

**Collected From**: Model onboarding, profile updates, availability calendar

**Data Points**:
- **Identity**: First name, last name, email, phone, ZIP code
- **Physical Attributes**: 
  - Hair: color, length, texture, condition, density, porosity
  - Skin: tone, undertone
  - Eyes: color, shape
  - Face: shape, features (for makeup/contouring matching)
- **Preferences**: 
  - Services open to (haircut, color, styling, makeup, nails, skincare)
  - Availability schedule (weekly calendar)
  - Location preferences (ZIP, travel radius)
- **Get to Know You**: 
  - Something fun about you
  - What you care about
  - Favorite services
  - Community interests
- **Photos**: Profile photos, session photos (before/after)
- **Verification**: ID documents, verification selfies
- **Platform Activity**: 
  - Bookings history
  - Feedback/ratings received
  - Shop purchases
  - Learning progress

**Purpose**: Matching models with professional requests, identity verification, service delivery

**Legal Basis**: Contract (service provision), Consent (optional data)

---

### **2. Professional Profile Data**

**Collected From**: Professional onboarding, profile updates

**Data Points**:
- **Identity**: First name, last name, email, phone
- **Business**: Salon name, address, partner affiliation
- **Portfolio**: Before/after work photos, self photos
- **Credentials**: Licenses, certifications, training completion
- **Performance**: Ratings, feedback, booking success rate
- **Instagram**: Handle (optional)

**Purpose**: Matching professionals with model requests, verification, service delivery

**Legal Basis**: Contract (service provision)

---

### **3. Partner/Salon Data**

**Collected From**: Partner onboarding, business registration

**Data Points**:
- **Business**: Business name, contact name, email, phone, address
- **Team**: Roster of professionals
- **Services**: Service menu, pricing
- **Compliance**: Licenses, insurance documents
- **Financial**: Invoices, payment history

**Purpose**: Business operations, compliance, team management

**Legal Basis**: Contract (service provision)

---

### **4. Booking & Transaction Data**

**Collected From**: Booking creation, payment processing

**Data Points**:
- **Booking Details**: Date, time, location, service type, duration
- **Participants**: Model ID, Professional ID, Request ID, Match ID
- **Payment**: 
  - Amount, currency, payment method (via Stripe)
  - Payment status, transaction IDs
  - **Note**: We do NOT store full credit card numbers (Stripe handles this)
- **Status**: Confirmed, completed, cancelled
- **Feedback**: Ratings, reviews (after session)

**Purpose**: Service delivery, payment processing, analytics

**Legal Basis**: Contract (service provision), Legal obligation (financial records)

---

### **5. Photo & Media Data**

**Collected From**: User uploads, session photos

**Data Points**:
- **Profile Photos**: Headshots, full-body photos
- **Session Photos**: Before/after service photos
- **Portfolio Photos**: Professional work samples
- **ID Documents**: Driver's license, passport, state ID (encrypted)
- **Verification Selfies**: For identity verification

**Storage**: Amazon S3 (encrypted at rest)

**Purpose**: 
- Profile display
- Matching (hair/beauty attributes)
- Identity verification
- Portfolio showcase

**Legal Basis**: Consent (explicit for photos), Legal obligation (ID verification)

---

### **6. ML/AI Analysis Data**

**Collected From**: Automated analysis of uploaded photos

**Data Points**:
- **Rekognition Labels**: Detected objects, scenes, concepts
- **Rekognition Face Analysis**: Face detection, landmarks
- **Bedrock Analysis**: 
  - Hair attributes (color, length, texture, condition)
  - Beauty attributes (skin tone, eye color, face shape)
  - Confidence scores for each attribute
- **Auto-Tagged Attributes**: 
  - Simple (user-facing): hairLengthSimple, hairColorSimple
  - Detailed (admin-only): hairLengthDetailed, hairColorDetailed
- **Training Data**: Anonymized analysis results (for ML improvement)

**Purpose**: Automated matching, attribute detection, matching engine improvement

**Legal Basis**: Legitimate interest (service improvement), Consent (for ML training)

---

### **7. Communication Data**

**Collected From**: In-app messaging, notifications, emails

**Data Points**:
- **Messages**: Chat conversations between users and support
- **Notifications**: In-app notification history
- **Emails**: Transactional emails (booking confirmations, reminders)
- **SMS**: Urgent notifications (if opted in)

**Purpose**: Customer support, service delivery, user engagement

**Legal Basis**: Contract (service provision)

---

### **8. Analytics & Usage Data**

**Collected From**: Platform usage, API calls, user interactions

**Data Points**:
- **Usage Metrics**: Page views, feature usage, session duration
- **Performance**: API response times, error rates
- **Business Metrics**: 
  - Booking conversion rates
  - Match success rates
  - Revenue metrics
- **Device Info**: Browser, device type (anonymized)

**Purpose**: Platform improvement, analytics, business intelligence

**Legal Basis**: Legitimate interest (service improvement)

---

## 🤖 **ML/AI Datasets & Training**

### **Datasets Used**

#### **1. AWS Rekognition (Pre-trained Model)**
- **Source**: Amazon's pre-trained computer vision model
- **Data**: Trained on millions of images (Amazon's dataset)
- **Usage**: 
  - Object detection (hair, face, skin)
  - Label detection (hair color, texture)
  - Face analysis (landmarks, features)
- **Privacy**: We don't train Rekognition - it's a pre-trained service
- **Cost**: Pay-per-use, no data ownership transfer

#### **2. AWS Bedrock (Claude AI)**
- **Source**: Anthropic's Claude model via AWS Bedrock
- **Data**: Trained on public internet data (Anthropic's training)
- **Usage**: 
  - Contextual understanding of photos
  - Attribute extraction (hair, beauty attributes)
  - Natural language analysis
- **Privacy**: We send photos to Bedrock for analysis, but don't train the model
- **Cost**: Pay-per-use, no data ownership transfer

#### **3. Proprietary Training Data (Future)**
- **Source**: Our own analysis results (anonymized)
- **Data**: 
  - Auto-tagged attributes from user photos
  - User-validated attributes (when users confirm/correct)
  - Match success outcomes (which matches led to bookings)
- **Purpose**: Improve our matching algorithms over time
- **Privacy**: 
  - Fully anonymized (no PII)
  - Aggregated patterns only
  - User consent required for inclusion
- **Storage**: Separate training data table (no PII)

**Current Implementation**:
- Training data recording is implemented in `photo-analysis` Lambda
- Data stored in `HairEngineTrainingData` DynamoDB table
- Includes: photo analysis results, confidence scores, analysis version
- **Not yet anonymized** - needs implementation before production use
- **User consent tracking** - needs to be added to onboarding flow

### **ML Training Process**

**Current (MVP)**:
- Rule-based attribute mapping from Rekognition/Bedrock
- No custom ML training yet
- Uses pre-trained models only

**Future (ML Phase)**:
- Collect anonymized training data (with consent)
- Train custom models on our data
- Improve matching accuracy over time
- **User Consent**: Explicit opt-in required for training data use

### **Data Sources Referenced (Commercial Datasets)**

**Mentioned in Code** (for reference, not directly used):
- **Black Hair Detection (Roboflow)**: CC BY 4.0 license
- **FairFace**: Apache 2.0 license

**Note**: These are referenced for research/development context, not directly integrated.

---

## 💾 **Data Storage & Architecture**

### **Storage Systems**

#### **1. Amazon DynamoDB (Operational Data)**
**What's Stored**:
- ModelProfile
- Professional
- Partner
- ModelRequest
- Match
- Booking
- Product
- Order
- Donation
- Notification

**Data Characteristics**:
- **Encryption**: At rest (AES-256)
- **Backup**: Point-in-time recovery enabled
- **Retention**: Indefinite (until user deletion request)
- **Access**: Via AppSync GraphQL API only

**Location**: AWS Region (us-east-1 or your choice)

---

#### **2. Amazon S3 (File Storage)**
**What's Stored**:
- Profile photos
- Session photos (before/after)
- Portfolio photos
- ID documents (encrypted)
- Marketing assets

**Data Characteristics**:
- **Encryption**: At rest (AES-256)
- **Access Control**: IAM-based, per-user paths
- **Retention**: Indefinite (until user deletion request)
- **Lifecycle**: Can move to cheaper storage after 90 days

**Bucket Structure**:
```
modeledStorage/
├── profile-photos/
│   ├── models/{userId}/
│   ├── professionals/{userId}/
│   └── partners/{userId}/
├── session-photos/
│   ├── before/{bookingId}/
│   └── after/{bookingId}/
├── portfolios/
│   └── {professionalId}/
└── documents/
    ├── licenses/
    └── insurance/
```

---

#### **3. Amazon RDS PostgreSQL (Analytics)**
**What's Stored**:
- Aggregated analytics data
- Revenue metrics
- Performance metrics
- Historical trends

**Data Characteristics**:
- **Encryption**: At rest (AES-256)
- **Backup**: Daily automated backups
- **Retention**: 2 years (then archived)
- **Access**: Admin-only, read-only for analytics

**Note**: No PII stored - only aggregated, anonymized metrics

---

#### **4. AWS Secrets Manager**
**What's Stored**:
- Stripe API keys
- Stripe webhook secrets
- Database credentials
- Third-party API keys

**Data Characteristics**:
- **Encryption**: At rest (AWS KMS)
- **Access**: Lambda functions only (via IAM)
- **Rotation**: Automatic (where supported)

---

### **Data Flow Architecture**

```
User Uploads Photo
    ↓
S3 Storage (encrypted)
    ↓
Lambda Trigger (photo-analysis)
    ↓
Rekognition API → Labels/Faces
Bedrock API → Attribute Analysis
    ↓
DynamoDB (ModelProfile updated)
    ↓
Matching Engine (uses attributes)
```

---

## 🔒 **Data Privacy & Compliance**

### **Privacy Principles**

1. **Data Minimization**: Only collect what's necessary
2. **Purpose Limitation**: Use data only for stated purposes
3. **Storage Limitation**: Delete data when no longer needed
4. **Accuracy**: Keep data accurate and up-to-date
5. **Security**: Encrypt and protect all data
6. **Transparency**: Clear privacy policy and disclosures
7. **User Control**: Users can access, export, delete their data

---

### **Compliance Frameworks**

#### **GDPR (General Data Protection Regulation)**
**Applicable**: If you have EU users

**Requirements**:
- ✅ **Lawful Basis**: Contract (service), Consent (optional data)
- ✅ **Right to Access**: Users can request their data
- ✅ **Right to Rectification**: Users can correct data
- ✅ **Right to Erasure**: Users can delete their data
- ✅ **Right to Portability**: Users can export their data
- ✅ **Right to Object**: Users can opt-out of processing
- ✅ **Data Protection Officer**: Required if processing large volumes
- ✅ **Privacy by Design**: Built into system architecture

**Implementation**:
- Privacy policy with GDPR disclosures
- User data export functionality
- User data deletion functionality
- Consent management system
- Data processing agreements with AWS

---

#### **CCPA (California Consumer Privacy Act)**
**Applicable**: If you have California users

**Requirements**:
- ✅ **Right to Know**: Disclose what data is collected
- ✅ **Right to Delete**: Users can request deletion
- ✅ **Right to Opt-Out**: Users can opt-out of data sales
- ✅ **Non-Discrimination**: Can't penalize users for exercising rights
- ✅ **Disclosure**: Privacy policy must include CCPA disclosures

**Implementation**:
- Privacy policy with CCPA disclosures
- "Do Not Sell My Data" option (if applicable)
- User data request process

---

#### **COPPA (Children's Online Privacy Protection Act)**
**Applicable**: If users under 13

**Requirements**:
- ✅ **Age Verification**: Verify users are 13+
- ✅ **Parental Consent**: Required for users under 13
- ✅ **Limited Data Collection**: Minimal data for under-13 users

**Implementation**:
- Age verification during signup
- Terms require users to be 13+
- No collection from under-13 users

---

### **Privacy Policy Requirements**

**Must Include**:
1. What data is collected
2. How data is used
3. Who data is shared with
4. User rights and how to exercise them
5. Data security measures
6. Contact information for privacy inquiries
7. Cookie/analytics disclosure
8. Third-party services (Stripe, AWS, etc.)

---

## 👤 **User Data Rights**

### **Right to Access**

**What Users Can Request**:
- All personal data we have about them
- How data is being used
- Who data is shared with
- Data retention periods

**How to Exercise**:
- In-app: "Export My Data" button
- Email: privacy@modeled.com
- Response Time: 30 days (GDPR requirement)

**What's Included in Export**:
- Profile data (JSON format)
- Booking history
- Photos (downloadable links)
- Communication history
- Shop order history
- ML analysis results (auto-tagged attributes)
- User validation data (if provided)

**Implementation Status**: 
- ⚠️ **Not yet implemented** - needs to be built
- **Planned**: Lambda function to aggregate all user data
- **Format**: ZIP file with JSON files + photo download links
- **Timeline**: Pre-launch requirement

---

### **Right to Rectification (Correction)**

**What Users Can Do**:
- Update profile information
- Correct auto-tagged attributes
- Validate ML analysis results

**How to Exercise**:
- In-app: Edit profile
- Admin: Can correct on user's behalf

---

### **Right to Erasure (Deletion)**

**What Users Can Request**:
- Delete their account
- Delete specific data points
- Delete photos

**How to Exercise**:
- In-app: "Delete My Account" button
- Email: privacy@modeled.com
- Response Time: 30 days (GDPR requirement)

**What Gets Deleted**:
- ✅ Profile data (from DynamoDB)
- ✅ Photos (from S3)
- ✅ Booking history (anonymized for business records)
- ✅ Communication history
- ✅ ML analysis results (from user's profile)
- ✅ User validation data

**What's Retained** (for legal/compliance):
- ⚠️ Financial records (7 years - legal requirement)
- ⚠️ Anonymized analytics (no PII)
- ⚠️ Aggregated business metrics
- ⚠️ Training data (if user consented, fully anonymized)

**Implementation Status**:
- ⚠️ **Partially implemented** - S3 delete functions exist (`deleteFile`, `deleteMultipleFiles`)
- ⚠️ **Needs**: Full account deletion Lambda function
- ⚠️ **Needs**: Cascade deletion logic (bookings, matches, orders)
- **Timeline**: Pre-launch requirement

---

### **Right to Portability**

**What Users Can Request**:
- Export their data in machine-readable format
- Transfer data to another service

**Format**: JSON, CSV (structured data)

**Includes**:
- Profile data
- Booking history
- Preferences
- Photos (downloadable links)

---

### **Right to Object**

**What Users Can Do**:
- Opt-out of marketing communications
- Opt-out of analytics tracking
- Opt-out of ML training data use

**How to Exercise**:
- In-app: Privacy settings
- Email preferences
- Account settings

---

### **Right to Restrict Processing**

**What Users Can Request**:
- Temporarily stop processing their data
- Keep data but don't use it

**Use Cases**:
- Dispute over data accuracy
- Objection to processing
- Legal investigation

---

## 🗑️ **Data Retention & Deletion**

### **Retention Periods**

| Data Type | Retention Period | Reason |
|-----------|----------------|--------|
| **Active User Profiles** | Indefinite | Service provision |
| **Inactive User Profiles** | 3 years | Re-engagement possibility |
| **Booking Records** | 7 years | Legal/financial records |
| **Payment Records** | 7 years | Legal/financial records |
| **Photos** | Until user deletion | User content |
| **ID Documents** | Until verification complete + 90 days | Security/verification |
| **Analytics Data** | 2 years | Business intelligence |
| **Training Data (ML)** | Indefinite (anonymized) | ML improvement |
| **Communication Logs** | 1 year | Customer support |

### **Deletion Process**

**Automatic Deletion**:
- Inactive accounts (3 years)
- Expired verification documents (90 days after verification)
- Old analytics data (2 years)

**Manual Deletion**:
- User requests (30 days)
- Legal requests (as required)
- Account closure (immediate for user data, 7 years for financial)

**Deletion Steps**:
1. Remove from DynamoDB
2. Delete from S3
3. Anonymize in analytics (if aggregated)
4. Confirm deletion to user

---

## 🔐 **Data Security**

### **Encryption**

**At Rest**:
- ✅ DynamoDB: AES-256 encryption
- ✅ S3: AES-256 encryption
- ✅ RDS: AES-256 encryption
- ✅ Secrets Manager: AWS KMS encryption

**In Transit**:
- ✅ HTTPS/TLS 1.2+ for all API calls
- ✅ AppSync: HTTPS only
- ✅ S3: HTTPS for uploads/downloads

### **Access Control**

**Authentication**:
- AWS Cognito (MFA available)
- Role-based access (Model, Professional, Partner, Admin)

**Authorization**:
- IAM policies (least privilege)
- DynamoDB row-level security (owner-based)
- S3 path-based access control

**Admin Access**:
- Admin group only
- Audit logging (CloudTrail)
- MFA required for admin accounts

### **Security Measures**

1. **Network Security**:
   - VPC isolation (if using)
   - Security groups
   - No public database access

2. **Application Security**:
   - Input validation
   - SQL injection prevention (DynamoDB - NoSQL)
   - XSS prevention
   - CSRF protection

3. **Monitoring**:
   - CloudWatch alarms
   - Unusual access pattern detection
   - Failed login attempts tracking

4. **Incident Response**:
   - Security incident plan
   - Breach notification procedures (72 hours for GDPR)
   - User notification process

---

## 🤝 **Third-Party Data Sharing**

### **Service Providers**

#### **1. AWS (Infrastructure)**
**Data Shared**: All platform data (stored on AWS)
**Purpose**: Infrastructure hosting
**Privacy**: AWS Data Processing Agreement
**Location**: US (or your chosen region)
**Safeguards**: Encryption, access controls

#### **2. Stripe (Payments)**
**Data Shared**: 
- Payment amounts
- Transaction IDs
- Customer email (for receipts)
- **NOT**: Full credit card numbers (Stripe handles this)

**Purpose**: Payment processing
**Privacy**: Stripe Privacy Policy
**Location**: US
**Safeguards**: PCI-DSS compliant

#### **3. AWS Rekognition (Photo Analysis)**
**Data Shared**: Uploaded photos (temporarily)
**Purpose**: Object/face detection
**Privacy**: AWS Data Processing Agreement
**Location**: US
**Safeguards**: 
- Photos sent for analysis only
- Not stored by Rekognition
- Not used for training Rekognition

#### **4. AWS Bedrock/Anthropic (Photo Analysis)**
**Data Shared**: Uploaded photos (temporarily)
**Purpose**: AI attribute analysis
**Privacy**: AWS Data Processing Agreement, Anthropic Privacy Policy
**Location**: US
**Safeguards**:
- Photos sent for analysis only
- Not stored by Bedrock
- Not used for training Claude (unless you opt-in)

#### **5. Email/SMS Providers (SES/SNS)**
**Data Shared**: Email addresses, phone numbers, message content
**Purpose**: Transactional communications
**Privacy**: AWS Data Processing Agreement
**Location**: US
**Safeguards**: Encrypted transmission

### **Data Sales**

**Current**: We do NOT sell user data to third parties

**Future**: If we ever do, we'll:
- Get explicit consent
- Provide opt-out mechanism
- Disclose in privacy policy

---

## 📋 **Data Governance**

### **Data Ownership**

**User Data**: Users own their data
- Can export it
- Can delete it
- Can correct it

**Platform Data**: Modeled owns aggregated, anonymized data
- Business metrics
- Analytics
- Training data (anonymized)

### **Data Processing Agreements**

**Required With**:
- AWS (Data Processing Addendum)
- Stripe (Data Processing Agreement)
- Any other processors

**Key Terms**:
- Purpose limitation
- Security requirements
- Data breach notification
- Sub-processor restrictions

### **Data Breach Procedures**

**If Breach Occurs**:
1. **Immediate**: Contain breach, assess impact
2. **Within 72 Hours**: Report to supervisory authority (GDPR)
3. **Within 72 Hours**: Notify affected users (if high risk)
4. **Ongoing**: Investigate, remediate, prevent recurrence

**Notification Includes**:
- What happened
- What data was affected
- What we're doing about it
- What users should do
- How to contact us

---

## 📊 **Data Inventory**

### **Complete Data Map**

| Data Category | Collection Point | Storage | Retention | Access |
|--------------|-----------------|---------|-----------|--------|
| Model Profile | Onboarding | DynamoDB | Indefinite | User, Admin |
| Pro Profile | Onboarding | DynamoDB | Indefinite | User, Admin |
| Partner Data | Onboarding | DynamoDB | Indefinite | User, Admin |
| Photos | Upload | S3 | Until deletion | User, Admin |
| ID Documents | Verification | S3 (encrypted) | 90 days | Admin only |
| Bookings | Booking creation | DynamoDB | 7 years | User, Admin |
| Payments | Stripe | Stripe (we store IDs) | 7 years | Admin only |
| ML Analysis | Auto-tagging | DynamoDB | Indefinite | User, Admin |
| Training Data | Anonymized | DynamoDB | Indefinite | Admin only |
| Analytics | Aggregated | RDS | 2 years | Admin only |

---

## 🎯 **Key Takeaways**

1. **We collect minimal data** - only what's necessary for the service
2. **Users own their data** - can access, export, delete anytime
3. **Everything is encrypted** - at rest and in transit
4. **No data sales** - we don't sell user data
5. **ML training is opt-in** - users can opt-out of training data use
6. **Compliance ready** - GDPR, CCPA considerations built in
7. **Transparent** - clear privacy policy and disclosures

---

## 📝 **Implementation Roadmap**

### **Current Status** ✅

- ✅ Data schema defined (DynamoDB models)
- ✅ S3 storage with access controls
- ✅ Photo analysis Lambda (Rekognition + Bedrock)
- ✅ Training data recording (Lambda function)
- ✅ Terms acceptance tracking (`termsAccepted`, `termsAcceptedAt`)
- ✅ Basic S3 delete functions
- ✅ Encryption at rest and in transit
- ✅ Role-based access control

### **To Complete Before Launch** ⚠️

1. **Privacy Policy** - Create comprehensive privacy policy
   - **Status**: Not started
   - **Priority**: HIGH
   - **Timeline**: Pre-launch

2. **Terms of Service** - Include data usage terms
   - **Status**: Not started
   - **Priority**: HIGH
   - **Timeline**: Pre-launch

3. **User Data Export** - Build export functionality
   - **Status**: Not implemented
   - **Priority**: HIGH (GDPR/CCPA requirement)
   - **Implementation**: Lambda function to aggregate all user data
   - **Format**: ZIP file with JSON + photo download links
   - **Timeline**: Pre-launch

4. **User Data Deletion** - Build full account deletion
   - **Status**: Partially implemented (S3 delete functions exist)
   - **Priority**: HIGH (GDPR/CCPA requirement)
   - **Implementation**: Lambda function with cascade deletion
   - **Timeline**: Pre-launch

5. **Consent Management** - Build consent tracking system
   - **Status**: Basic terms acceptance exists
   - **Priority**: MEDIUM
   - **Needs**: 
     - ML training data consent checkbox
     - Marketing communications opt-in/out
     - Analytics opt-out
   - **Timeline**: Pre-launch

6. **Training Data Anonymization** - Anonymize before storage
   - **Status**: Not implemented (currently stores with userId)
   - **Priority**: HIGH (before production use)
   - **Implementation**: Remove PII before storing in training table
   - **Timeline**: Before production

7. **Data Processing Agreements** - Sign with AWS, Stripe
   - **Status**: Not started
   - **Priority**: MEDIUM
   - **Timeline**: Pre-launch

8. **Data Protection Impact Assessment** - For GDPR compliance
   - **Status**: Not started
   - **Priority**: MEDIUM (if EU users)
   - **Timeline**: Pre-launch

9. **Cookie Policy** - If using analytics cookies
   - **Status**: Not started
   - **Priority**: LOW (if no cookies, not needed)
   - **Timeline**: As needed

10. **Breach Notification Process** - Document and test
    - **Status**: Not started
    - **Priority**: MEDIUM
    - **Timeline**: Pre-launch

---

## 🔄 **Data Flow Diagrams**

### **Photo Upload & Analysis Flow**

```
User Uploads Photo
    ↓
S3 Storage (encrypted, path: profile-photos/models/{userId}/photo.jpg)
    ↓
S3 Event Trigger → Lambda (photo-analysis)
    ↓
┌─────────────────────────────────────┐
│ 1. Rekognition Analysis             │
│    - DetectLabels                   │
│    - DetectFaces                    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Bedrock Analysis (if needed)    │
│    - Hair attributes                │
│    - Beauty attributes              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 3. Attribute Mapping                │
│    - Simple (user-facing)           │
│    - Detailed (admin-only)          │
└─────────────────────────────────────┘
    ↓
DynamoDB Update (ModelProfile)
    - autoTaggedAttributes
    - attributeConfidence
    - hairLengthSimple, etc.
    ↓
┌─────────────────────────────────────┐
│ 4. Training Data Recording          │
│    (if user consented)               │
│    - Anonymized analysis results    │
│    - No PII                         │
└─────────────────────────────────────┘
    ↓
HairEngineTrainingData Table
```

### **User Validation Flow**

```
User Reviews Auto-Tagged Attributes
    ↓
User Confirms/Corrects Attributes
    ↓
Lambda (photo-analysis) with validateAttributes flag
    ↓
DynamoDB Update (ModelProfile)
    - userValidatedAttributes
    - validationAccuracy (auto vs user)
    ↓
Training Data Update (if consented)
    - User corrections improve ML accuracy
```

### **Data Export Flow (To Be Implemented)**

```
User Requests Data Export
    ↓
Lambda (data-export) Function
    ↓
┌─────────────────────────────────────┐
│ Aggregate All User Data:            │
│ - ModelProfile (DynamoDB)           │
│ - Bookings (DynamoDB)               │
│ - Orders (DynamoDB)                 │
│ - Photos (S3 signed URLs)           │
│ - Communications (DynamoDB)        │
└─────────────────────────────────────┘
    ↓
Generate ZIP File
    - profile.json
    - bookings.json
    - orders.json
    - photos.json (with download links)
    - communications.json
    ↓
Upload to S3 (temporary, 7 days)
    ↓
Email User Download Link
    ↓
Auto-delete after 7 days
```

### **Data Deletion Flow (To Be Implemented)**

```
User Requests Account Deletion
    ↓
Lambda (data-deletion) Function
    ↓
┌─────────────────────────────────────┐
│ Cascade Deletion:                   │
│ 1. Delete from DynamoDB:            │
│    - ModelProfile                    │
│    - Related Bookings (anonymize)   │
│    - Related Orders (anonymize)     │
│    - Related Matches                │
│    - Related Notifications          │
│                                     │
│ 2. Delete from S3:                  │
│    - All user photos                │
│    - ID documents                   │
│                                     │
│ 3. Anonymize in Analytics:         │
│    - Replace userId with "deleted"  │
│                                     │
│ 4. Retain (legal):                  │
│    - Financial records (7 years)    │
│    - Training data (if consented)   │
└─────────────────────────────────────┘
    ↓
Confirm Deletion to User
```

---

## 📊 **Data Inventory Matrix**

| Data Category | Collection Point | Storage | Retention | Access | Export | Delete |
|--------------|-----------------|---------|-----------|--------|--------|--------|
| Model Profile | Onboarding | DynamoDB | Indefinite | User, Admin | ✅ Planned | ✅ Planned |
| Pro Profile | Onboarding | DynamoDB | Indefinite | User, Admin | ✅ Planned | ✅ Planned |
| Partner Data | Onboarding | DynamoDB | Indefinite | User, Admin | ✅ Planned | ✅ Planned |
| Photos | Upload | S3 | Until deletion | User, Admin | ✅ Planned | ✅ Partial |
| ID Documents | Verification | S3 (encrypted) | 90 days | Admin only | ✅ Planned | ✅ Partial |
| Bookings | Booking creation | DynamoDB | 7 years | User, Admin | ✅ Planned | ⚠️ Anonymize |
| Payments | Stripe | Stripe (we store IDs) | 7 years | Admin only | ✅ Planned | ⚠️ Retain |
| ML Analysis | Auto-tagging | DynamoDB | Indefinite | User, Admin | ✅ Planned | ✅ Planned |
| Training Data | Anonymized | DynamoDB | Indefinite | Admin only | ❌ No PII | ⚠️ If consented |
| Analytics | Aggregated | RDS | 2 years | Admin only | ❌ No PII | ⚠️ Anonymize |

**Legend**:
- ✅ = Implemented or Planned
- ⚠️ = Special handling (retain for legal, anonymize, etc.)
- ❌ = Not applicable (no PII)

---

**This is a living document** - will be updated as the platform evolves and new data is collected.

**Last Updated**: [Current Date]
**Next Review**: [Quarterly or after major changes]

