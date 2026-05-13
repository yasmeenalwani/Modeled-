# 🔄 End-to-End Flow Walkthrough

**Purpose:** Comprehensive testing and verification of all user flows  
**Last Updated:** January 6, 2026

---

## 📋 Table of Contents

1. [Model Onboarding Flow](#1-model-onboarding-flow)
2. [Professional Onboarding Flow](#2-professional-onboarding-flow)
3. [Partner Onboarding Flow](#3-partner-onboarding-flow)
4. [Model Portal Flows](#4-model-portal-flows)
5. [Professional Portal Flows](#5-professional-portal-flows)
6. [Admin Portal Flows](#6-admin-portal-flows)
7. [Request Creation Flow](#7-request-creation-flow)
8. [Matching Flow](#8-matching-flow)
9. [Booking Flow](#9-booking-flow)
10. [Payment Flow](#10-payment-flow)
11. [Post-Booking Flow](#11-post-booking-flow)
12. [Management Flows](#12-management-flows)

---

## 1. Model Onboarding Flow

### **Route:** `/model-onboard` or `/signup?type=model`

### **Steps:**

#### **Step 1: Welcome**
- ✅ Landing page explaining what Modeled is
- ✅ "Get Started" button
- **What to check:**
  - [ ] Page loads without errors
  - [ ] Button navigates to next step

#### **Step 2: Basic Information**
Fields collected:
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Phone (required)
- ✅ ZIP Code
- **What to check:**
  - [ ] All fields validate correctly
  - [ ] Phone number auto-formats
  - [ ] Email validation works
  - [ ] ZIP code validates (5 digits)
  - [ ] Progress saves to localStorage
  - [ ] Can go back and edit

#### **Step 3: Get to Know You**
Questions:
- ✅ "Tell us something fun or unexpected about you"
- ✅ "What do you care about or love spending your energy on?"
- ✅ "What's your favorite beauty/hair service and one you'd love to try?"
- ✅ Community interests (checkboxes: parties, events, perks, panels, photoshoots, other)
- **What to check:**
  - [ ] All fields save
  - [ ] "Other" shows text input when selected
  - [ ] Can skip optional fields

#### **Step 4: Physical Attributes**
- ✅ Hair Length (short, medium, long, extra_long)
- ✅ Hair Color
- ✅ Hair Texture (straight, wavy, curly, coily)
- ✅ Hair Condition (healthy, damaged, color_treated, virgin)
- ✅ Skin Tone
- **What to check:**
  - [ ] All dropdowns work
  - [ ] Selected values save
  - [ ] Can change selections

#### **Step 5: Availability & Preferences**
- ✅ Location ZIP
- ✅ Willing to Travel (yes/no)
- ✅ Travel Radius (if yes)
- ✅ Services open to (checkboxes: haircut, color, styling, makeup, nails, skincare)
- ✅ Availability schedule (days/times)
- **What to check:**
  - [ ] Availability picker works
  - [ ] Multiple days/times can be selected
  - [ ] Travel radius only shows if "willing to travel" = yes

#### **Step 6: Photo Upload**
- ✅ Profile headshot upload
- ✅ Additional photos (optional)
- **What to check:**
  - [ ] Photos upload to S3
  - [ ] Photo preview shows
  - [ ] Can delete/replace photos
  - [ ] Headshot required, others optional

#### **Step 7: Identity Verification**
- ✅ ID Document upload (driver's license, passport, state ID)
- ✅ Verification selfie
- ✅ AWS Rekognition verification (automatic)
- **What to check:**
  - [ ] ID upload works
  - [ ] Selfie upload works
  - [ ] Verification runs automatically
  - [ ] Status shows (pending/verified/failed)

#### **Step 8: Terms & Conditions**
- ✅ Read and accept terms
- ✅ Acknowledge data usage
- **What to check:**
  - [ ] Checkbox required to proceed
  - [ ] Terms link works
  - [ ] Can't submit without acceptance

#### **Step 9: Submit & Create Profile**
- ✅ Creates ModelProfile in database
- ✅ Creates Cognito user (if not already exists)
- ✅ Sets status to 'pending'
- ✅ Redirects to model portal
- **What to check:**
  - [ ] Profile saves to database
  - [ ] All fields persist
  - [ ] Status = 'pending'
  - [ ] User redirected to `/model-portal`
  - [ ] Welcome message shows

### **Expected Outcome:**
- ✅ ModelProfile created in DynamoDB
- ✅ Status = 'pending'
- ✅ User can access model portal (limited until approved)
- ✅ Admin sees new profile in admin portal

### **Common Issues to Check:**
- [ ] Form doesn't save if browser closes
- [ ] Validation errors show clearly
- [ ] Upload failures handled gracefully
- [ ] Database errors don't lose data

---

## 2. Professional Onboarding Flow

### **Route:** `/pro-onboard` or `/signup?type=professional`

### **Steps:**

#### **Step 1: Welcome**
- ✅ Introduction to professional benefits
- ✅ "Get Started" button

#### **Step 2: Basic Information**
- ✅ First Name
- ✅ Last Name
- ✅ Email
- ✅ Phone (required)
- ✅ Salon Name
- ✅ Salon Address
- **What to check:**
  - [ ] All fields validate
  - [ ] Phone formats correctly
  - [ ] Can link to existing Partner account

#### **Step 3: Professional Details**
- ✅ Years of Experience
- ✅ Specializations
- ✅ Services Offered (checkboxes)
- ✅ Portfolio photos
- ✅ Instagram handle
- **What to check:**
  - [ ] Portfolio upload works
  - [ ] Multiple photos can be uploaded
  - [ ] Instagram validation (optional)

#### **Step 4: Verification & Compliance**
- ✅ Government ID upload
- ✅ Selfie verification
- ✅ Cosmetology License upload
- ✅ Additional certifications (optional)
- ✅ Background check consent
- **What to check:**
  - [ ] ID verification runs automatically
  - [ ] License upload works
  - [ ] Consent checkbox required

#### **Step 5: Documents & Agreements**
- ✅ Service Agreement (read & accept)
- ✅ NDA / Confidentiality (read & accept)
- ✅ Code of Conduct (read & accept)
- ✅ Payment Terms (read & accept)
- ✅ Insurance Verification (optional)
- **What to check:**
  - [ ] All agreements can be read
  - [ ] Checkboxes required for required docs
  - [ ] Can't proceed without acceptance

#### **Step 6: Training**
- ✅ Platform Overview (required)
- ✅ Model Interaction Guidelines (required)
- ✅ Safety & Hygiene Protocols (required)
- ✅ Booking System Tutorial (required)
- ✅ Feedback & Rating System (required)
- **What to check:**
  - [ ] Training modules load
  - [ ] Completion tracked
  - [ ] Can't skip required training

#### **Step 7: Submit & Create Profile**
- ✅ Creates Professional profile in database
- ✅ Sets status to 'pending_verification'
- ✅ Notifies admin for review
- ✅ Redirects to pro portal (limited access)
- **What to check:**
  - [ ] Profile saves correctly
  - [ ] Status = 'pending_verification'
  - [ ] Admin notification created
  - [ ] User redirected appropriately

### **Expected Outcome:**
- ✅ Professional profile created
- ✅ Status = 'pending_verification'
- ✅ Admin sees profile in admin portal
- ✅ Professional can access limited portal

---

## 3. Partner Onboarding Flow

### **Route:** `/partner-onboard` or `/signup?type=partner`

### **Steps:**

#### **Step 1-6: Similar to Professional**
- Business Information
- Team Members
- Services Offered
- Verification
- Agreements
- Submit

### **Expected Outcome:**
- ✅ Partner profile created
- ✅ Can add professionals to team
- ✅ Can create campaigns

---

## 4. Model Portal Flows

### **Portal Access:** `/model-portal`

### **Main Sections:**

#### **4.1 Dashboard (Cherry Desk)**
- ✅ Personal Magazine view (default)
- ✅ Stats: Sessions, Saved, XP, Impact
- ✅ Recent sessions
- ✅ Photos gallery
- ✅ Games & achievements
- **What to check:**
  - [ ] All stats display correctly
  - [ ] Photos load from S3
  - [ ] Navigation works
  - [ ] Mockup switcher works (if enabled)

#### **4.2 Matched Opportunities**
- ✅ View pending matches
- ✅ Match details (service, date, time, earnings)
- ✅ Accept/Decline buttons
- ✅ Flip-to-reveal interaction
- **What to check:**
  - [ ] Matches load from database
  - [ ] Match scores display
  - [ ] Accept creates booking
  - [ ] Decline updates status

#### **4.3 Booked Sessions**
- ✅ View all sessions (past & upcoming)
- ✅ Calendar view
- ✅ Photos from sessions
- ✅ Booking requests
- **What to check:**
  - [ ] Sessions display correctly
  - [ ] Calendar shows bookings
  - [ ] Photos display
  - [ ] Can filter by category

#### **4.4 Profile**
- ✅ Edit profile information
- ✅ Update photos
- ✅ Update availability
- ✅ Update preferences
- **What to check:**
  - [ ] Changes save to database
  - [ ] Photos upload
  - [ ] Validation works
  - [ ] Changes reflect immediately

#### **4.5 Photos**
- ✅ View all photos
- ✅ Filter by tags
- ✅ Upload new photos
- ✅ Before/after comparisons
- **What to check:**
  - [ ] Photos load from S3
  - [ ] Tag filtering works
  - [ ] Upload works
  - [ ] Tags auto-assign

---

## 5. Professional Portal Flows

### **Portal Access:** `/pro-portal`

### **Main Sections:**

#### **5.1 Dashboard**
- ✅ Overview stats
- ✅ Recent requests
- ✅ Upcoming bookings
- ✅ Active matches
- **What to check:**
  - [ ] Stats load correctly
  - [ ] Data is real (not mock)
  - [ ] Quick actions work

#### **5.2 Create Request**
- ✅ Service type selection
- ✅ Desired model attributes
- ✅ Date & time
- ✅ Location
- ✅ Description
- ✅ Auto-save draft
- ✅ Submit (requires payment)
- **What to check:**
  - [ ] Form validates
  - [ ] Auto-save works (localStorage)
  - [ ] Payment required to submit
  - [ ] Request creates in database
  - [ ] Status = 'pending'

#### **5.3 My Requests**
- ✅ View all requests
- ✅ Request status
- ✅ Matches for each request
- ✅ Edit/Cancel requests
- **What to check:**
  - [ ] Requests load from database
  - [ ] Status updates reflect
  - [ ] Can edit pending requests
  - [ ] Can't edit booked requests

#### **5.4 Bookings**
- ✅ View all bookings
- ✅ Booking details
- ✅ Model information
- ✅ Chat access
- ✅ Location helper
- **What to check:**
  - [ ] Bookings display correctly
  - [ ] Model info loads
  - [ ] Chat activates at right time
  - [ ] Location helper works

#### **5.5 Profile**
- ✅ Edit professional info
- ✅ Update portfolio
- ✅ Update services
- ✅ Verification status
- **What to check:**
  - [ ] Changes save
  - [ ] Portfolio uploads
  - [ ] Verification status visible

---

## 6. Admin Portal Flows

### **Portal Access:** `/admin`

### **Main Sections:**

#### **6.1 Dashboard**
- ✅ Overview metrics
- ✅ Top performers
- ✅ Pending approvals
- ✅ Recent activity
- **What to check:**
  - [ ] All data loads from database
  - [ ] No mock data
  - [ ] Metrics calculate correctly

#### **6.2 Models Management**
- ✅ View all models
- ✅ Filter by status
- ✅ Approve/Reject profiles
- ✅ View model details
- ✅ Edit model info
- **What to check:**
  - [ ] Models load from database
  - [ ] Status filter works
  - [ ] Approve/Reject updates database
  - [ ] Details page shows all info

#### **6.3 Professionals Management**
- ✅ View all professionals
- ✅ Verify identity
- ✅ Approve licenses
- ✅ Activate/Deactivate accounts
- **What to check:**
  - [ ] Professionals load correctly
  - [ ] Verification workflow works
  - [ ] Approval updates status
  - [ ] Can view all documents

#### **6.4 Requests Queue**
- ✅ View all requests
- ✅ Filter by status
- ✅ Run matching engine (or auto-trigger)
- ✅ View matches
- ✅ Approve matches
- ✅ Send matches to models
- **What to check:**
  - [ ] Requests load from database
  - [ ] Matching runs (auto or manual)
  - [ ] Matches display with scores
  - [ ] Can approve/send matches
  - [ ] Status updates correctly

#### **6.5 Match Approval**
- ✅ View match details
- ✅ See match score breakdown
- ✅ See model & request info
- ✅ Approve/Reject matches
- ✅ Send to models
- **What to check:**
  - [ ] Match details show correctly
  - [ ] Score breakdown visible
  - [ ] Can approve multiple
  - [ ] Can reject with reason

#### **6.6 Bookings Management**
- ✅ View all bookings
- ✅ Filter by status
- ✅ View booking details
- ✅ Update booking status
- ✅ Handle cancellations
- **What to check:**
  - [ ] Bookings load correctly
  - [ ] Status updates work
  - [ ] Cancellation handled properly
  - [ ] Waitlist promotion works

---

## 7. Request Creation Flow

### **Who:** Professional
### **Route:** `/pro-portal/create-request` or `/pro-portal/request/new`

### **Steps:**

1. **Select Service Type**
   - ✅ Choose from service list
   - ✅ See service details
   - **Check:** Service list loads, details show

2. **Set Desired Model Attributes**
   - ✅ Hair Length
   - ✅ Hair Color
   - ✅ Hair Texture
   - ✅ Hair Condition
   - ✅ Optional: Age, Skin Tone, etc.
   - **Check:** All dropdowns work, can select multiple options

3. **Set Date & Time**
   - ✅ Requested date
   - ✅ Requested time
   - ✅ Duration
   - **Check:** Date picker works, time validates

4. **Set Location**
   - ✅ Salon address
   - ✅ Travel radius (if applicable)
   - **Check:** Address auto-complete works (if implemented)

5. **Add Description**
   - ✅ Service description (optional)
   - ✅ Special requirements
   - **Check:** Text area works, character limit enforced

6. **Review & Submit**
   - ✅ Review all details
   - ✅ Auto-save draft (if not submitting)
   - ✅ Payment required to submit
   - ✅ Submit creates ModelRequest
   - **Check:**
     - [ ] Draft saves to localStorage
     - [ ] Payment modal shows
     - [ ] Payment processes
     - [ ] Request creates with status='pending'
     - [ ] Auto-matching triggers (if enabled)

### **Expected Outcome:**
- ✅ ModelRequest created in database
- ✅ Status = 'pending'
- ✅ Professional charged payment
- ✅ Matching runs automatically (or admin triggered)
- ✅ Professional sees request in "My Requests"

---

## 8. Matching Flow

### **Trigger:** Automatic (when request created) OR Manual (admin clicks "Run Match Engine")

### **Steps:**

1. **Match Engine Runs**
   - ✅ Gets all active models
   - ✅ Filters by location, availability, services
   - ✅ Calculates match scores for each model
   - ✅ Sorts by score (highest first)
   - **Check:**
     - [ ] All eligible models included
     - [ ] Scores calculated correctly
     - [ ] Top matches are best fits

2. **Matches Created**
   - ✅ Match records created in database
   - ✅ Status = 'pending' (awaiting admin approval)
   - ✅ Match scores stored
   - ✅ Score breakdown stored
   - **Check:**
     - [ ] Matches created in Match table
     - [ ] Scores are reasonable (0-100)
     - [ ] Breakdown shows attribute matching

3. **Auto-Approval (if enabled)**
   - ✅ Matches with score >= 85 auto-approved
   - ✅ Status changes to 'approved'
   - ✅ Auto-sent to models (if enabled)
   - **Check:**
     - [ ] High-score matches auto-approved
     - [ ] Lower scores remain 'pending'
     - [ ] Notifications sent to models

4. **Admin Review (manual approval)**
   - ✅ Admin views matches in "Match Approval" page
   - ✅ Sees score breakdown
   - ✅ Approves/Rejects matches
   - ✅ Sends approved matches to models
   - **Check:**
     - [ ] Admin can see all matches
     - [ ] Score breakdown visible
     - [ ] Can approve/reject
     - [ ] Sending updates status to 'sent'

5. **Matches Sent to Models**
   - ✅ Status = 'sent'
   - ✅ Notifications created
   - ✅ Models see in "Matched" section
   - **Check:**
     - [ ] Models receive notifications
     - [ ] Matches appear in model portal
     - [ ] Model can accept/decline

### **Expected Outcome:**
- ✅ Multiple matches created per request
- ✅ Best matches have highest scores
- ✅ Admin can review and approve
- ✅ Models receive matches to review

---

## 9. Booking Flow

### **Trigger:** Model accepts a match

### **Steps:**

1. **Model Views Match**
   - ✅ Sees match in "Matched" section
   - ✅ Views details (service, date, time, earnings)
   - ✅ Sees professional info
   - **Check:**
     - [ ] Match details display correctly
     - [ ] Professional info loads
     - [ ] Earnings amount shows

2. **Model Accepts Match**
   - ✅ Clicks "Accept" button
   - ✅ Payment required (if not already paid by pro)
   - ✅ Booking created
   - ✅ Match status = 'accepted'
   - ✅ Notifications sent
   - **Check:**
     - [ ] Payment processes
     - [ ] Booking created in database
     - [ ] Booking status = 'confirmed'
     - [ ] Professional notified
     - [ ] Admin notified

3. **Booking Confirmation**
   - ✅ Booking details visible to both parties
   - ✅ Calendar event created
   - ✅ Chat activated (at scheduled times)
   - ✅ Location helper available
   - **Check:**
     - [ ] Both parties see booking
     - [ ] Calendar shows booking
     - [ ] Chat activates at 24h before (support) and 1h before (direct)

4. **Waitlist Handling (if booking taken)**
   - ✅ If model accepts but slot taken, goes to waitlist
   - ✅ Next model in waitlist promoted if cancellation
   - **Check:**
     - [ ] Waitlist position assigned
     - [ ] Promotion works on cancellation

### **Expected Outcome:**
- ✅ Booking created in database
- ✅ Status = 'confirmed'
- ✅ Both parties notified
- ✅ Chat scheduled for activation
- ✅ Calendar updated

---

## 10. Payment Flow

### **Who:** Professional (for request) OR Model (for booking)

### **Steps:**

1. **Payment Initiation**
   - ✅ Stripe Payment Intent created
   - ✅ Amount calculated
   - ✅ Payment modal shows
   - **Check:**
     - [ ] Stripe loads correctly
     - [ ] Amount is correct
     - [ ] Payment methods available

2. **Payment Processing**
   - ✅ User enters payment details
   - ✅ Payment processes via Stripe
   - ✅ Webhook receives confirmation
   - **Check:**
     - [ ] Payment processes successfully
     - [ ] Error handling works
     - [ ] Retry logic works (if payment fails)
     - [ ] Webhook updates database

3. **Payment Confirmation**
   - ✅ Payment status updated in database
   - ✅ Request/Booking status updated
   - ✅ Receipt sent
   - **Check:**
     - [ ] Status updates correctly
     - [ ] Receipt email sent (if configured)
     - [ ] Payment record stored

### **Expected Outcome:**
- ✅ Payment processed successfully
- ✅ Status updated
- ✅ Receipt generated
- ✅ User can proceed

---

## 11. Post-Booking Flow

### **Steps After Booking:**

1. **Pre-Appointment (24h before)**
   - ✅ Booking reminder sent (EventBridge)
   - ✅ Support chat activated
   - ✅ Location helper available
   - **Check:**
     - [ ] Reminder email/SMS sent
     - [ ] Chat activates
     - [ ] Location helper works

2. **Day of Appointment (1h before)**
   - ✅ Direct chat activated
   - ✅ Final reminder sent
   - **Check:**
     - [ ] Direct chat activates
     - [ ] Reminder sent

3. **After Appointment**
   - ✅ Booking status = 'completed'
   - ✅ Feedback prompts sent
   - ✅ Photo submission prompts
   - ✅ Payment reminders (if model fee pending)
   - **Check:**
     - [ ] Status updates automatically
     - [ ] Feedback prompts sent
     - [ ] Photo upload works
     - [ ] Payment reminders work

4. **Feedback Submission**
   - ✅ Model rates professional
   - ✅ Professional rates model
   - ✅ Comments (optional)
   - ✅ Photos uploaded
   - ✅ Agentic scores updated
   - **Check:**
     - [ ] Feedback saves
     - [ ] Ratings update
     - [ ] Scores recalculate
     - [ ] Photos associated with booking

### **Expected Outcome:**
- ✅ Booking completed
- ✅ Feedback collected
- ✅ Scores updated
- ✅ Photos saved

---

## 12. Management Flows

### **12.1 Admin Approves Model Profile**

**Steps:**
1. Admin views model in Models page
2. Reviews profile, photos, verification
3. Approves or Rejects
4. If approved: Status = 'approved' or 'active'
5. Model can now receive matches

**Check:**
- [ ] Status updates
- [ ] Model notified
- [ ] Model can access full portal

### **12.2 Admin Approves Professional Profile**

**Steps:**
1. Admin views professional
2. Verifies identity, license, documents
3. Approves profile
4. If approved: Status = 'approved' or 'active'
5. Professional can create requests

**Check:**
- [ ] Status updates
- [ ] Professional notified
- [ ] Professional can create requests

### **12.3 Admin Manages Requests**

**Steps:**
1. View requests queue
2. Filter by status
3. Run matching (if auto-disabled)
4. Approve matches
5. Send to models
6. Monitor booking creation

**Check:**
- [ ] All requests visible
- [ ] Matching works
- [ ] Can manage matches
- [ ] Status tracking works

### **12.4 Admin Manages Bookings**

**Steps:**
1. View all bookings
2. Filter by status
3. Update booking status
4. Handle cancellations
5. Promote waitlist
6. Process refunds

**Check:**
- [ ] Bookings display correctly
- [ ] Status updates work
- [ ] Cancellation handling works
- [ ] Waitlist promotion works

---

## 🔍 Testing Checklist

### **For Each Flow, Verify:**

**Functionality:**
- [ ] Flow works end-to-end without errors
- [ ] Data saves to database correctly
- [ ] Status transitions work properly
- [ ] Notifications sent when expected
- [ ] Auto-save works (where applicable)

**Data Integrity:**
- [ ] All fields save correctly
- [ ] No data loss on errors
- [ ] Statuses are valid transitions
- [ ] Relationships link correctly (booking → match → request)

**User Experience:**
- [ ] UI is clear and intuitive
- [ ] Loading states show
- [ ] Error messages are helpful
- [ ] Success messages show
- [ ] Navigation works smoothly

**Edge Cases:**
- [ ] What happens if payment fails?
- [ ] What happens if user closes browser mid-flow?
- [ ] What happens if multiple users accept same match?
- [ ] What happens if booking is cancelled?
- [ ] What happens if verification fails?

---

## 📊 Status Tracking

### **Model Status Flow:**
```
pending → approved → active → inactive
```

### **Professional Status Flow:**
```
pending_verification → approved → active → inactive
```

### **Request Status Flow:**
```
pending → matching → matched → booked → completed → cancelled
```

### **Match Status Flow:**
```
pending → approved → sent → accepted → declined → expired → waitlist
```

### **Booking Status Flow:**
```
confirmed → completed → cancelled
```

---

## 🚨 Common Issues to Check

1. **Data Not Saving**
   - Check database permissions
   - Check GraphQL mutations
   - Check error logs

2. **Status Not Updating**
   - Check status transition logic
   - Check database updates
   - Check UI refresh

3. **Notifications Not Sending**
   - Check EventBridge rules
   - Check Lambda functions
   - Check notification service

4. **Photos Not Uploading**
   - Check S3 permissions
   - Check file size limits
   - Check upload component

5. **Payments Not Processing**
   - Check Stripe keys
   - Check webhook configuration
   - Check retry logic

---

## 📝 Testing Log

**Use this to track what you've tested:**

| Flow | Tested | Issues Found | Status |
|------|--------|--------------|--------|
| Model Onboarding | [ ] | - | - |
| Professional Onboarding | [ ] | - | - |
| Partner Onboarding | [ ] | - | - |
| Request Creation | [ ] | - | - |
| Matching | [ ] | - | - |
| Booking | [ ] | - | - |
| Payment | [ ] | - | - |
| Post-Booking | [ ] | - | - |
| Admin Management | [ ] | - | - |

---

**Ready to test? Start with Model Onboarding and work through each flow!** 🚀

