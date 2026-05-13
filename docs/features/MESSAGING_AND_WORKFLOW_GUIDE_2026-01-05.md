# Modeled Management - Complete Messaging & Workflow Guide
## All Messages, Content, and User Journeys

**Last Updated:** December 2024  
**Version:** MVP 1.0

---

## 📋 Table of Contents

1. [Model Workflows & Messages](#model-workflows--messages)
2. [Professional Workflows & Messages](#professional-workflows--messages)
3. [Admin Workflows & Messages](#admin-workflows--messages)
4. [Shared Messages](#shared-messages)
5. [Error Messages](#error-messages)
6. [Status Messages](#status-messages)

---

## 👩‍🦰 MODEL WORKFLOWS & MESSAGES

### **1. SIGN-UP & ONBOARDING**

#### **1.1 Email Verification (After Sign-Up)**

**Subject:** Welcome to Modeled! Verify your email ✨

**Body:**
```
Hi [FirstName]! 👋

Welcome to Modeled Management! We're so excited to have you join our community of models.

To get started, please verify your email address by clicking the link below:

[VERIFY EMAIL BUTTON]

This link will expire in 24 hours.

Once verified, you'll be able to:
✨ Complete your profile
📸 Upload photos
💄 Start receiving match opportunities
💰 Earn money while getting beautiful services

If you didn't create an account, you can safely ignore this email.

Questions? Just reply to this email - we're here to help!

With love,
The Modeled Team 💕

---
Modeled Management
Connecting models with beauty professionals
```

**Trigger:** Immediately after sign-up  
**Type:** Email only  
**Priority:** High

---

#### **1.2 Onboarding Welcome (After Email Verification)**

**Subject:** Let's build your profile! 📸

**Body:**
```
Hi [FirstName]! 

Your email is verified - you're all set! 🎉

Now let's get your profile ready so you can get cherry-picked. Here's what's next:

**Step 1: Basic Info** (2 minutes)
- Contact information
- Location 

**Step 2: Upload 5 Photos** (5 minutes)
Upload:
- Styled front view
- Up close hair detail
- Natural/unstyled
- Back view
- Side profile

Add Preferences 
- Service selected 

Add availabiliity 
- Calendar view and weekly availability 

**Step 3: Review & Submit**
- Review your info

[START ONBOARDING BUTTON]

Questions? We're here to help! 💕

The Modeled Team
```

**Trigger:** After email verification  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **1.3 Photos Uploaded**

**In-App Notification (Portal):**
```
✅ Photos uploaded!

Your photos have been uploaded successfully. Complete your profile to start receiving opportunities!

[COMPLETE PROFILE BUTTON]
```

**Trigger:** After photos are uploaded  
**Type:** Portal notification only  
**Priority:** Low

---

#### **1.5 Profile Submitted for Review**

**In-App Notification:**
```
✅ Profile submitted!

Your profile has been submitted for review. We'll notify you once it's approved (usually within 24-48 hours).

You can still edit your profile while it's pending.
```

**Email:**
```
Subject: Profile submitted! We'll review it soon 💕

Hi [FirstName]!

Your profile has been submitted for review. Our team will review it within 24-48 hours.

**What happens next:**
1. Admin reviews your profile
2. You'll receive an email when approved
3. Once approved, you'll start receiving match opportunities!

**While you wait:**
- Complete any quizzes in the Fun Zone to boost your engagement score
- Browse the Learn & Glow section for beauty tips
- Make sure your availability is up to date

We'll be in touch soon! ✨

The Modeled Team
```

**Trigger:** After profile submission  
**Type:** Email + In-app notification  
**Priority:** High

---

### **2. PROFILE STATUS UPDATES**

#### **2.1 Profile Approved**

**In-App Notification:**
```
🎉 Your profile is approved!

You're now active and can receive match opportunities!

[VIEW DASHBOARD BUTTON]
```

**Email:**
```
Subject: You're approved! Start receiving matches 🎉

Hi [FirstName]!

Great news - your profile has been approved! 🎊

You're now active on Modeled. 

**What's next:**
- Keep your availability updated
- Respond quickly to match opportunities
- Complete sessions to build your reliability score
- Earn money while getting beautiful services!

[GO TO DASHBOARD BUTTON]

**Pro Tips:**
✨ Respond to matches within 24 hours for best results
✨ Keep your photos updated (especially after hair changes)
✨ Set your availability at least 2 weeks in advance
✨ Complete your profile quizzes to boost your score

Welcome to Modeled! We're so excited to have you! 💕

The Modeled Team
```

**Trigger:** When admin approves profile  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **2.2 Profile Rejected (Needs Changes)**

**In-App Notification:**
```
⚠️ Profile needs updates

Your profile was reviewed but needs some changes. Check the admin notes for details.

[VIEW PROFILE BUTTON]
```

**Email:**
```
Subject: Profile update needed

Hi [FirstName],

We've reviewed your profile, but we need a few updates before we can approve it:

**Required Changes:**
[Admin Notes - specific feedback]

**Common reasons:**
- Photos need to be clearer or show hair better
- Missing required information
- Age verification needed

[UPDATE PROFILE BUTTON]

Once you make these changes, we'll review it again within 24 hours.

Questions? Just reply to this email - we're here to help!

The Modeled Team
```

**Trigger:** When admin rejects profile  
**Type:** Email + In-app notification  
**Priority:** High

---

### **3. MATCHING & BOOKING**

#### **3.1 New Match Opportunity**

**Portal Notification (Primary):**
```
🎯 New opportunity!

[Professional Name] is looking for a model for [Service Type] on [Date] at [Time].

You'd earn: $[Amount]

[VIEW DETAILS] [ACCEPT] [DECLINE]
```

**Email (Backup):**
```
Subject: New opportunity! 🎯

Hi [FirstName]!

You're cherry-picked! 

**The Opportunity:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date] at [Time]
• Location: [Location]
• You'd earn: $[Amount]

[VIEW IN PORTAL BUTTON]

**Act fast!** The first model to accept and pay gets the booking. Others go on a waitlist.

Questions? Reply to this email!

The Modeled Team 💕
```

**Trigger:** When admin approves a match  
**Type:** Portal notification (primary) + Email (backup)  
**Priority:** High  
**Urgency:** Time-sensitive (first to book wins)

---

#### **3.2 Match Accepted - Payment Required**

**Portal Notification (Primary):**
```
✅ Opportunity accepted!

Complete your booking by paying the model search fee ($[Amount]).

[PAY NOW BUTTON]
```

**Email (Backup):**
```
Subject: Payment required to confirm booking 💳

Hi [FirstName]!

You've accepted the opportunity! Now complete payment to secure your booking.

**Booking Details:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date] at [Time]
• Location: [Location]
• Model Fee: $[Amount]

[PAY NOW BUTTON]

**What happens next:**
1. Complete payment
2. Get approved and receive calendar invite with all details
3. Get reminder 24 hours before
4. Show up and enjoy your service!

**Important:** Payment must be completed within 24 hours or the booking will be released to the waitlist.

[PAY NOW BUTTON]

Questions? We're here to help!

The Modeled Team
```

**Trigger:** When model accepts match  
**Type:** Portal notification (primary) + Email (backup)  
**Priority:** High  
**Urgency:** Time-sensitive

---

#### **3.3 Payment Complete - Booking Approved**

**Portal Notification (Primary):**
```
✅ Payment received! Booking approved!

Your booking is confirmed. Calendar invite with all details has been sent to your email.

[VIEW BOOKING DETAILS] [ADD TO CALENDAR]
```

**Email (With Calendar Invite):**
```
Subject: Booking confirmed! Calendar invite attached 🎉

Hi [FirstName]!

Your booking is confirmed! 

**Booking Details:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date]
• Time: [Time]
• Location: [Location/Address]
• Professional Phone: [Phone]

**Calendar Invite:**
A calendar invite (.ics file) is attached to this email. Add it to your calendar to never miss an appointment!

**What to expect:**
- You'll receive a reminder 24 hours before your appointment
- Show up on time 
- Bring a valid ID for verification
- Enjoy your service

**Important reminders:**
⚠️ Cancellations less than 24 hours before affect your reliability score
⚠️ No-shows result in a penalty
✅ Complete the session and submit feedback to boost your score

[VIEW BOOKING IN PORTAL] [ADD TO CALENDAR]

We're so excited for you! Have fun! ✨

The Modeled Team 💕

---
[Calendar invite attached as .ics file]
```

**Trigger:** After payment is confirmed  
**Type:** Portal notification (primary) + Email with calendar invite (required)  
**Priority:** High

---

#### **3.4 Booking Reminder (24 Hours Before)**

**In-App Notification:**
```
⏰ Reminder: Booking tomorrow!

Your booking with [Professional Name] is tomorrow at [Time].

[VIEW DETAILS BUTTON]
```

**Email:**
```
Subject: Reminder: Your booking is tomorrow! ⏰

Hi [FirstName]!

Just a friendly reminder - you have a booking tomorrow!

**Booking Details:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date]
• Time: [Time]
• Location: [Location/Address]
• Professional Phone: [Phone]

**What to bring:**
✓ Valid ID
✓ Your phone (for check-in)
✓ Any specific items mentioned by the professional

**Important:**
- Arrive on time (punctuality matters!)
- If you need to cancel, do it ASAP
- No-shows affect your reliability score

[VIEW BOOKING DETAILS BUTTON] [CANCEL BOOKING]

See you tomorrow! ✨

The Modeled Team
```

**SMS (Recommended):**
```
Reminder: [Service] with [Pro] tomorrow at [Time]. Location: [Location]. Cancel: [Link]
```

**Trigger:** 24 hours before appointment  
**Type:** Email + In-app notification + SMS (recommended)  
**Priority:** High  
**Urgency:** Time-sensitive

---

#### **3.5 Booking Cancelled (By Model)**

**In-App Notification:**
```
⚠️ Booking cancelled

Your booking with [Professional Name] has been cancelled.

[VIEW CANCELLATION POLICY BUTTON]
```

**Email:**
```
Subject: Booking cancelled

Hi [FirstName],

Your booking with [Professional Name] for [Service Type] on [Date] has been cancelled.

**Cancellation Details:**
• Cancelled by: You
• Cancellation time: [Time]
• Refund status: [Refunded/Partial/No refund based on timing]

**Impact on your profile:**
- Cancellations less than 24 hours before affect your reliability score
- Multiple cancellations may limit future opportunities

**What's next:**
- You can browse other match opportunities
- Keep your availability updated
- Respond quickly to new matches

[VIEW OTHER OPPORTUNITIES BUTTON]

Questions? We're here to help!

The Modeled Team
```

**Trigger:** When model cancels booking  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.6 Booking Completed**

**In-App Notification:**
```
✅ Booking completed!

Your session with [Professional Name] is complete. Submit feedback to boost your score!

[SUBMIT FEEDBACK BUTTON]
```

**Email:**
```
Subject: How was your session? Share your feedback! ⭐

Hi [FirstName]!

We hope you had an amazing session with [Professional Name]! 

**Your session:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date]

**What's next:**
1. Submit feedback about your experience (takes 2 minutes)
2. Upload before/after photos (optional but helps!)
3. Get paid! Payment will be processed within 3-5 business days

[SUBMIT FEEDBACK BUTTON]

**Why feedback matters:**
- Helps professionals improve
- Builds your engagement score
- Helps us match you with better opportunities

[SUBMIT FEEDBACK BUTTON]

Thank you for being part of Modeled! 💕

The Modeled Team
```

**Trigger:** After professional marks booking as complete  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.7 Payment Processed**

**In-App Notification:**
```
💰 Payment received!

$[Amount] has been deposited to your account for your session on [Date].

[VIEW EARNINGS BUTTON]
```

**Email:**
```
Subject: Payment received! 💰

Hi [FirstName]!

Great news - your payment has been processed!

**Payment Details:**
• Amount: $[Amount]
• Service: [Service Type]
• Date: [Date]
• Payment method: [Bank Account/Venmo/etc.]

**Your total earnings this month:** $[Total]

[VIEW EARNINGS HISTORY BUTTON]

Keep up the great work! Your reliability and engagement scores are looking great! ✨

The Modeled Team
```

**Trigger:** After payment is processed  
**Type:** Email + In-app notification  
**Priority:** Medium

---

### **4. ENGAGEMENT & GAMIFICATION**

#### **4.1 Level Up**

**In-App Notification:**
```
🎉 Level up!

You've reached Level [X]! Unlock new features and opportunities.

[VIEW REWARDS BUTTON]
```

**Email:**
```
Subject: Congratulations! You've leveled up! 🎉

Hi [FirstName]!

Amazing work - you've reached Level [X]! 

**What you've unlocked:**
• [New Feature/Reward]
• [New Feature/Reward]
• Priority matching for high-score opportunities

**Your stats:**
• Total XP: [XP]
• Sessions completed: [Count]
• Reliability score: [Score]/100
• Feedback score: [Score]/100

Keep it up! You're doing great! ✨

[VIEW PROFILE BUTTON]

The Modeled Team 💕
```

**Trigger:** When model levels up  
**Type:** Email + In-app notification  
**Priority:** Low (nice to have)

---

#### **4.2 Achievement Unlocked**

**In-App Notification:**
```
🏆 Achievement unlocked!

[Achievement Name]: [Description]

[VIEW ACHIEVEMENTS BUTTON]
```

**Email:**
```
Subject: Achievement unlocked! 🏆

Hi [FirstName]!

You've unlocked a new achievement!

**Achievement:** [Achievement Name]
**Description:** [Description]

**Your progress:**
• Total achievements: [Count]
• XP earned: [XP]

Keep up the amazing work! ✨

[VIEW ALL ACHIEVEMENTS BUTTON]

The Modeled Team
```

**Trigger:** When achievement is unlocked  
**Type:** Email + In-app notification  
**Priority:** Low

---

---

## ✂️ PROFESSIONAL WORKFLOWS & MESSAGES

### **1. SIGN-UP & ONBOARDING**

#### **1.1 Email Verification (After Sign-Up)**

**Subject:** Welcome to Modeled! Verify your email ✂️

**Body:**
```
Hi [FirstName]! 👋

Welcome to Modeled Management! We're excited to help you find the perfect models for your practice sessions.

To get started, please verify your email address:

[VERIFY EMAIL BUTTON]

This link expires in 24 hours.

Once verified, you'll be able to:
✂️ Create model requests
🎯 Get matched with perfect models
💼 Build your portfolio
📈 Track your progress

If you didn't create an account, you can safely ignore this email.

Questions? Just reply - we're here to help!

Best,
The Modeled Team
```

**Trigger:** Immediately after sign-up  
**Type:** Email only  
**Priority:** High

---

#### **1.2 Onboarding Welcome (After Email Verification)**

**Subject:** Let's set up your professional profile! ✂️

**Body:**
```
Hi [FirstName]!

Your email is verified - you're all set! 🎉

Now let's get your professional profile ready. Here's what we need:

**Step 1: Basic Info** (2 minutes)
- Contact information
- Professional details

**Step 2: Professional Background** (3 minutes)
- Experience level
- License number (if applicable)
- Specialties

**Step 3: Workplace** (2 minutes)
- Salon/studio name
- Location
- Partner affiliation (if applicable)

**Step 4: Review & Submit**
- Review your info
- Submit for admin approval

[START ONBOARDING BUTTON]

Once approved, you can start creating model requests!

Questions? We're here to help! 💕

The Modeled Team
```

**Trigger:** After email verification  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **1.3 Profile Submitted for Review**

**In-App Notification:**
```
✅ Profile submitted!

Your professional profile has been submitted for review. We'll notify you once it's approved (usually within 24-48 hours).
```

**Email:**
```
Subject: Profile submitted! We'll review it soon ✂️

Hi [FirstName]!

Your professional profile has been submitted for review. Our team will review it within 24-48 hours.

**What happens next:**
1. Admin reviews your profile and license (if applicable)
2. You'll receive an email when approved
3. Once approved, you can start creating model requests!

**While you wait:**
- Complete your portfolio uploads
- Review our training materials
- Make sure all your information is accurate

We'll be in touch soon! ✨

The Modeled Team
```

**Trigger:** After profile submission  
**Type:** Email + In-app notification  
**Priority:** High

---

### **2. PROFILE STATUS UPDATES**

#### **2.1 Profile Approved**

**In-App Notification:**
```
🎉 Your profile is approved!

You can now create model requests and start finding models!

[CREATE REQUEST BUTTON]
```

**Email:**
```
Subject: You're approved! Start finding models 🎯

Hi [FirstName]!

Great news - your professional profile has been approved! 🎊

You're now active on Modeled and can start creating model requests.

**What's next:**
- Create your first model request
- Get matched with perfect models
- Build your portfolio
- Track your progress

[CREATE REQUEST BUTTON]

**Pro Tips:**
✨ Be specific about what you're looking for
✨ Set realistic dates and times
✨ Respond quickly to matches
✨ Complete sessions and submit feedback

Welcome to Modeled! We're excited to have you! ✂️

The Modeled Team
```

**Trigger:** When admin approves profile  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **2.2 Profile Rejected (Needs Changes)**

**In-App Notification:**
```
⚠️ Profile needs updates

Your profile was reviewed but needs some changes. Check the admin notes for details.

[VIEW PROFILE BUTTON]
```

**Email:**
```
Subject: Profile update needed

Hi [FirstName],

We've reviewed your profile, but we need a few updates before we can approve it:

**Required Changes:**
[Admin Notes - specific feedback]

**Common reasons:**
- License verification needed
- Missing required information
- Portfolio needs more examples

[UPDATE PROFILE BUTTON]

Once you make these changes, we'll review it again within 24 hours.

Questions? Just reply to this email - we're here to help!

The Modeled Team
```

**Trigger:** When admin rejects profile  
**Type:** Email + In-app notification  
**Priority:** High

---

### **3. MODEL REQUESTS**

#### **3.1 Request Created - Pending Admin Review**

**In-App Notification:**
```
✅ Request created!

Your model request for [Service Type] has been created and is pending admin review.

[VIEW REQUEST BUTTON]
```

**Email:**
```
Subject: Model request created! 🎯

Hi [FirstName]!

Your model request has been created!

**Request Details:**
• Service: [Service Type]
• Date: [Date] at [Time]
• Location: [Location]
• Model search fee: $[Amount]

**What happens next:**
1. Admin reviews your request
2. Matching engine finds suitable models
3. You'll receive match notifications
4. First model to book gets the spot!

[VIEW REQUEST BUTTON]

We'll notify you as soon as we find matches!

The Modeled Team
```

**Trigger:** After request is created  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.2 Matches Found**

**In-App Notification:**
```
🎯 [X] matches found!

We found [X] models that match your request for [Service Type].

[VIEW MATCHES BUTTON]
```

**Email:**
```
Subject: We found matches for your request! 🎯

Hi [FirstName]!

Great news - we found [X] models that match your request!

**Your Request:**
• Service: [Service Type]
• Date: [Date] at [Time]
• Location: [Location]

**Top Matches:**
1. [Model Name] - Score: 92/100
2. [Model Name] - Score: 88/100
3. [Model Name] - Score: 85/100

[VIEW ALL MATCHES BUTTON]

**What's next:**
- Review match details and scores
- Admin will send booking links to models
- First model to book gets the spot
- Others go on waitlist

[VIEW MATCHES BUTTON]

The Modeled Team
```

**Trigger:** After matching engine finds matches  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **3.3 Model Booked**

**In-App Notification:**
```
✅ Model booked!

[Model Name] has booked your [Service Type] session on [Date] at [Time].

[VIEW BOOKING DETAILS BUTTON]
```

**Email:**
```
Subject: Model booked! Your session is confirmed 🎉

Hi [FirstName]!

Great news - a model has booked your session!

**Booking Details:**
• Model: [Model Name]
• Service: [Service Type]
• Date: [Date]
• Time: [Time]
• Location: [Location]
• Model payment: $[Amount] (paid by model)

**Model Profile:**
• Hair: [Color], [Length], [Texture]
• Reliability score: [Score]/100
• Experience: [X] sessions completed

**What's next:**
1. You'll receive a reminder 24 hours before
2. Show up on time for the session
3. Complete the service
4. Submit feedback and upload before/after photos
5. Get paid!

[VIEW BOOKING DETAILS BUTTON]

**Important reminders:**
⚠️ Cancellations less than 24 hours before affect your reliability
⚠️ No-shows result in penalties
✅ Complete the session and submit feedback

We're excited for your session! ✨

The Modeled Team
```

**Trigger:** When model completes payment  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **3.4 Booking Reminder (24 Hours Before)**

**In-App Notification:**
```
⏰ Reminder: Booking tomorrow!

Your session with [Model Name] is tomorrow at [Time].

[VIEW DETAILS BUTTON]
```

**Email:**
```
Subject: Reminder: Your session is tomorrow! ⏰

Hi [FirstName]!

Just a friendly reminder - you have a session tomorrow!

**Booking Details:**
• Model: [Model Name]
• Service: [Service Type]
• Date: [Date]
• Time: [Time]
• Location: [Location]
• Model Phone: [Phone] (if applicable)

**What to prepare:**
✓ All necessary tools and products
✓ Portfolio camera ready (for before/after photos)
✓ Model's contact information
✓ Any specific requirements

**Important:**
- Arrive on time (punctuality matters!)
- If you need to cancel, do it ASAP
- No-shows affect your reliability score

[VIEW BOOKING DETAILS BUTTON] [CANCEL BOOKING]

See you tomorrow! ✨

The Modeled Team
```

**SMS (Recommended):**
```
Reminder: [Service] with [Model] tomorrow at [Time]. Location: [Location]. Cancel: [Link]
```

**Trigger:** 24 hours before appointment  
**Type:** Email + In-app notification + SMS (recommended)  
**Priority:** High  
**Urgency:** Time-sensitive

---

#### **3.5 Booking Cancelled (By Professional)**

**In-App Notification:**
```
⚠️ Booking cancelled

Your booking with [Model Name] has been cancelled.

[VIEW CANCELLATION POLICY BUTTON]
```

**Email:**
```
Subject: Booking cancelled

Hi [FirstName],

Your booking with [Model Name] for [Service Type] on [Date] has been cancelled.

**Cancellation Details:**
• Cancelled by: You
• Cancellation time: [Time]
• Refund status: [Refunded/Partial/No refund based on timing]

**Impact on your profile:**
- Cancellations less than 24 hours before affect your reliability score
- Multiple cancellations may limit future opportunities

**What's next:**
- You can create new model requests
- Keep your availability updated
- Respond quickly to new matches

[CREATE NEW REQUEST BUTTON]

Questions? We're here to help!

The Modeled Team
```

**Trigger:** When professional cancels booking  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.6 Session Complete - Submit Feedback**

**In-App Notification:**
```
✅ Session complete!

Your session with [Model Name] is complete. Submit feedback and upload photos!

[SUBMIT FEEDBACK BUTTON]
```

**Email:**
```
Subject: How was your session? Share your feedback! ⭐

Hi [FirstName]!

We hope you had a great session with [Model Name]!

**Your session:**
• Service: [Service Type]
• Model: [Model Name]
• Date: [Date]

**What's next:**
1. Submit feedback about the model (takes 2 minutes)
2. Upload before/after photos to your portfolio
3. Get paid! Payment will be processed within 3-5 business days

[SUBMIT FEEDBACK BUTTON]

**Why feedback matters:**
- Helps models improve
- Builds your engagement score
- Helps us match you with better models

[SUBMIT FEEDBACK BUTTON]

Thank you for being part of Modeled! ✂️

The Modeled Team
```

**Trigger:** After professional marks booking as complete  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.7 Payment Processed**

**In-App Notification:**
```
💰 Payment received!

$[Amount] has been deposited to your account for your session on [Date].

[VIEW EARNINGS BUTTON]
```

**Email:**
```
Subject: Payment received! 💰

Hi [FirstName]!

Great news - your payment has been processed!

**Payment Details:**
• Amount: $[Amount]
• Service: [Service Type]
• Date: [Date]
• Payment method: [Bank Account/Venmo/etc.]

**Your total earnings this month:** $[Total]

[VIEW EARNINGS HISTORY BUTTON]

Keep up the great work! Your reliability and engagement scores are looking great! ✨

The Modeled Team
```

**Trigger:** After payment is processed  
**Type:** Email + In-app notification  
**Priority:** Medium

---

---

## 👑 ADMIN WORKFLOWS & MESSAGES

### **1. NEW SIGN-UPS**

#### **1.1 New Model Sign-Up**

**In-App Notification:**
```
👤 New model sign-up

[FirstName] [LastName] has signed up and submitted their profile for review.

[REVIEW PROFILE BUTTON]
```

**Email:**
```
Subject: New model sign-up: [FirstName] [LastName] 👤

Hi Yasmeen,

A new model has signed up!

**Model Details:**
• Name: [FirstName] [LastName]
• Email: [Email]
• Phone: [Phone]
• Location: [ZIP Code]
• Status: Pending Review

**Profile Status:**
• Photos uploaded: [X]/5
• Photo analysis: [Status]
• Profile completion: [X]%

[REVIEW PROFILE BUTTON]

**Action needed:**
- Review profile information
- Check photo quality
- Verify auto-tagged attributes
- Approve or request changes

[REVIEW PROFILE BUTTON]

The Modeled Team
```

**Trigger:** When model submits profile  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **1.2 New Professional Sign-Up**

**In-App Notification:**
```
✂️ New professional sign-up

[FirstName] [LastName] has signed up and submitted their profile for review.

[REVIEW PROFILE BUTTON]
```

**Email:**
```
Subject: New professional sign-up: [FirstName] [LastName] ✂️

Hi Yasmeen,

A new professional has signed up!

**Professional Details:**
• Name: [FirstName] [LastName]
• Email: [Email]
• Phone: [Phone]
• Experience Level: [Level]
• License Number: [License] (if provided)
• Salon: [Salon Name]

**Profile Status:**
• Status: Pending Review
• Portfolio: [X] photos
• Profile completion: [X]%

[REVIEW PROFILE BUTTON]

**Action needed:**
- Verify license (if applicable)
- Review portfolio
- Check specialties
- Approve or request changes

[REVIEW PROFILE BUTTON]

The Modeled Team
```

**Trigger:** When professional submits profile  
**Type:** Email + In-app notification  
**Priority:** High

---

#### **1.3 New Partner Sign-Up**

**In-App Notification:**
```
🏢 New partner sign-up

[Business Name] has signed up and submitted their profile for review.

[REVIEW PROFILE BUTTON]
```

**Email:**
```
Subject: New partner sign-up: [Business Name] 🏢

Hi Yasmeen,

A new partner has signed up!

**Partner Details:**
• Business Name: [Business Name]
• Contact: [Contact Name]
• Email: [Email]
• Phone: [Phone]
• Type: [Salon/Studio/School/Spa]
• Location: [City, State]

**Profile Status:**
• Status: Pending Review
• Profile completion: [X]%

[REVIEW PROFILE BUTTON]

**Action needed:**
- Verify business information
- Check compliance documents
- Review location and services
- Approve or request changes

[REVIEW PROFILE BUTTON]

The Modeled Team
```

**Trigger:** When partner submits profile  
**Type:** Email + In-app notification  
**Priority:** High

---

### **2. MATCHING & BOOKING**

#### **2.1 New Model Request Created**

**In-App Notification:**
```
📋 New model request

[Professional Name] has created a new model request for [Service Type] on [Date].

[REVIEW REQUEST BUTTON]
```

**Email:**
```
Subject: New model request: [Service Type] by [Professional Name] 📋

Hi Yasmeen,

A new model request has been created!

**Request Details:**
• Professional: [Professional Name]
• Service: [Service Type]
• Date: [Date] at [Time]
• Location: [Location]
• Model search fee: $[Amount]

**Desired Attributes:**
• Hair Color: [Color]
• Hair Length: [Length]
• Hair Texture: [Texture]
• Hair Condition: [Condition]

**Action needed:**
- Review request details
- Run matching engine
- Approve matches
- Send booking links to models

[REVIEW REQUEST BUTTON] [RUN MATCHING ENGINE]

The Modeled Team
```

**Trigger:** When professional creates request  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **2.2 Matches Found - Ready for Review**

**In-App Notification:**
```
🎯 Matches found!

Matching engine found [X] matches for [Service Type] request.

[REVIEW MATCHES BUTTON]
```

**Email:**
```
Subject: Matches found: [X] models for [Service Type] 🎯

Hi Yasmeen,

The matching engine has found matches!

**Request:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date] at [Time]

**Matches Found:**
• [X] total matches
• Top 3 scores: [Score1], [Score2], [Score3]

**Action needed:**
- Review match scores and breakdowns
- Approve matches to send to models
- Reject low-quality matches
- Send booking links

[REVIEW MATCHES BUTTON]

The Modeled Team
```

**Trigger:** After matching engine runs  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **2.3 Booking Confirmed**

**In-App Notification:**
```
✅ Booking confirmed!

[Model Name] has booked [Service Type] with [Professional Name] on [Date].

[VIEW BOOKING BUTTON]
```

**Email:**
```
Subject: Booking confirmed: [Model Name] ↔ [Professional Name] ✅

Hi Yasmeen,

A booking has been confirmed!

**Booking Details:**
• Model: [Model Name]
• Professional: [Professional Name]
• Service: [Service Type]
• Date: [Date] at [Time]
• Location: [Location]
• Model payment: $[Amount]

**Status:**
• Payment: Confirmed
• Reminder: Scheduled for 24h before
• Status: Confirmed

[VIEW BOOKING BUTTON]

The Modeled Team
```

**Trigger:** When booking is confirmed  
**Type:** Email + In-app notification  
**Priority:** Low (informational)

---

#### **2.4 Booking Cancelled**

**In-App Notification:**
```
⚠️ Booking cancelled

[Model Name]'s booking with [Professional Name] has been cancelled.

[VIEW DETAILS BUTTON]
```

**Email:**
```
Subject: Booking cancelled: [Model Name] ↔ [Professional Name] ⚠️

Hi Yasmeen,

A booking has been cancelled.

**Booking Details:**
• Model: [Model Name]
• Professional: [Professional Name]
• Service: [Service Type]
• Date: [Date]
• Cancelled by: [Model/Professional]
• Refund status: [Status]

**Action needed:**
- Check if waitlist models should be notified
- Update professional's availability
- Review cancellation reason

[VIEW DETAILS BUTTON]

The Modeled Team
```

**Trigger:** When booking is cancelled  
**Type:** Email + In-app notification  
**Priority:** Medium

---

### **3. SYSTEM ALERTS**

#### **3.1 Low Match Quality Alert**

**In-App Notification:**
```
⚠️ Low match quality

Request [ID] has matches with scores below 60. Review before sending.

[REVIEW MATCHES BUTTON]
```

**Email:**
```
Subject: Low match quality alert ⚠️

Hi Yasmeen,

A model request has matches with low scores.

**Request:**
• Service: [Service Type]
• Professional: [Professional Name]
• Date: [Date]

**Issue:**
• [X] matches have scores below 60
• Lowest score: [Score]
• May need manual review or request adjustment

[REVIEW MATCHES BUTTON]

The Modeled Team
```

**Trigger:** When matches have low scores  
**Type:** Email + In-app notification  
**Priority:** Medium

---

#### **3.2 Photo Analysis Failed**

**In-App Notification:**
```
❌ Photo analysis failed

Photo analysis failed for [Model Name]. Manual review needed.

[REVIEW PROFILE BUTTON]
```

**Email:**
```
Subject: Photo analysis failed: [Model Name] ❌

Hi Yasmeen,

Photo analysis failed for a model.

**Model:**
• Name: [Model Name]
• Email: [Email]
• Photo: [Photo Key]

**Error:**
[Error message]

**Action needed:**
- Review photos manually
- Tag attributes manually if needed
- Contact model if photos are unclear

[REVIEW PROFILE BUTTON]

The Modeled Team
```

**Trigger:** When photo analysis fails  
**Type:** Email + In-app notification  
**Priority:** Medium

---

---

## 🔄 SHARED MESSAGES

### **1. PASSWORD RESET**

#### **1.1 Password Reset Request**

**Subject:** Reset your Modeled password 🔐

**Body:**
```
Hi [FirstName],

You requested to reset your password for your Modeled account.

Click the link below to reset your password:

[RESET PASSWORD BUTTON]

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email. Your password will not be changed.

Questions? Just reply to this email!

The Modeled Team
```

**Trigger:** When user requests password reset  
**Type:** Email only  
**Priority:** High

---

#### **1.2 Password Reset Success**

**Subject:** Password reset successful ✅

**Body:**
```
Hi [FirstName],

Your password has been successfully reset!

If you didn't make this change, please contact us immediately at support@modeledmanagement.com.

[LOG IN BUTTON]

The Modeled Team
```

**Trigger:** After password is reset  
**Type:** Email only  
**Priority:** High

---

### **2. ACCOUNT UPDATES**

#### **2.1 Email Changed**

**Subject:** Email address changed

**Body:**
```
Hi [FirstName],

Your email address has been changed to [NewEmail].

If you didn't make this change, please contact us immediately at support@modeledmanagement.com.

[CONTACT SUPPORT BUTTON]

The Modeled Team
```

**Trigger:** When email is changed  
**Type:** Email to old and new address  
**Priority:** High

---

#### **2.2 Profile Updated**

**In-App Notification:**
```
✅ Profile updated

Your profile has been successfully updated.

[VIEW PROFILE BUTTON]
```

**Email (Optional):**
```
Subject: Profile updated ✅

Hi [FirstName],

Your profile has been successfully updated!

**Changes made:**
[List of changes]

[VIEW PROFILE BUTTON]

The Modeled Team
```

**Trigger:** After profile update  
**Type:** In-app notification (required), Email (optional)  
**Priority:** Low

---

---

## ❌ ERROR MESSAGES

### **1. VALIDATION ERRORS**

#### **1.1 Required Field Missing**

**Message:**
```
⚠️ [Field Name] is required

Please fill in this field to continue.
```

**Context:** Form validation  
**Priority:** High

---

#### **1.2 Invalid Email Format**

**Message:**
```
⚠️ Invalid email format

Please enter a valid email address (e.g., name@example.com).
```

**Context:** Email input validation  
**Priority:** High

---

#### **1.3 Invalid Phone Format**

**Message:**
```
⚠️ Invalid phone number

Please enter a valid phone number (e.g., (555) 123-4567).
```

**Context:** Phone input validation  
**Priority:** High

---

#### **1.4 File Too Large**

**Message:**
```
⚠️ File too large

The file "[FileName]" is too large. Maximum size is 10MB. Please choose a smaller file.
```

**Context:** File upload  
**Priority:** High

---

#### **1.5 Invalid File Type**

**Message:**
```
⚠️ Invalid file type

"[FileName]" is not a supported file type. Please upload a JPG, PNG, or WebP image.
```

**Context:** File upload  
**Priority:** High

---

### **2. AUTHENTICATION ERRORS**

#### **2.1 Invalid Credentials**

**Message:**
```
❌ Invalid email or password

Please check your credentials and try again. If you've forgotten your password, you can reset it.
```

**Context:** Login  
**Priority:** High

---

#### **2.2 Email Not Verified**

**Message:**
```
⚠️ Email not verified

Please verify your email address before logging in. Check your inbox for the verification email.
```

**Context:** Login  
**Priority:** High

---

#### **2.3 Session Expired**

**Message:**
```
⏰ Session expired

Your session has expired. Please log in again.

[LOG IN BUTTON]
```

**Context:** Protected route access  
**Priority:** Medium

---

### **3. NETWORK ERRORS**

#### **3.1 Connection Error**

**Message:**
```
❌ Connection error

Unable to connect to the server. Please check your internet connection and try again.

[RETRY BUTTON]
```

**Context:** API calls  
**Priority:** High

---

#### **3.2 Upload Failed**

**Message:**
```
❌ Upload failed

The file "[FileName]" failed to upload. Please try again.

[RETRY BUTTON]
```

**Context:** File upload  
**Priority:** High

---

### **4. BUSINESS LOGIC ERRORS**

#### **4.1 Already Booked**

**Message:**
```
⚠️ Already booked

This booking has already been taken by another model. Check out other opportunities!

[VIEW OTHER OPPORTUNITIES BUTTON]
```

**Context:** Booking attempt  
**Priority:** High

---

#### **4.2 Payment Failed**

**Message:**
```
❌ Payment failed

Your payment could not be processed. Please check your payment method and try again.

[RETRY PAYMENT BUTTON]
```

**Context:** Payment processing  
**Priority:** High

---

#### **4.3 Cancellation Too Late**

**Message:**
```
⚠️ Cancellation too late

Cancellations must be made at least 24 hours before the appointment. Please contact support if you have an emergency.

[CONTACT SUPPORT BUTTON]
```

**Context:** Booking cancellation  
**Priority:** High

---

---

## ✅ STATUS MESSAGES

### **1. SUCCESS MESSAGES**

#### **1.1 Action Successful**

**Message:**
```
✅ [Action] successful!

[Details about what was successful]
```

**Examples:**
- "✅ Profile saved successfully!"
- "✅ Photo uploaded successfully!"
- "✅ Booking confirmed successfully!"

---

#### **1.2 Changes Saved**

**Message:**
```
✅ Changes saved

Your changes have been saved successfully.
```

**Context:** Form submission  
**Priority:** Low

---

### **2. INFORMATIONAL MESSAGES**

#### **2.1 Loading**

**Message:**
```
⏳ Loading...

Please wait while we [action]...
```

**Context:** Async operations  
**Priority:** Low

---

#### **2.2 Processing**

**Message:**
```
🔄 Processing...

This may take a few moments...
```

**Context:** Long-running operations  
**Priority:** Low

---

#### **2.3 No Results**

**Message:**
```
📭 No [items] found

[Suggestions for what to do next]
```

**Examples:**
- "📭 No matches found. Try adjusting your search criteria."
- "📭 No bookings found. Check back later!"

---

---

## 📱 SMS MESSAGES (OPTIONAL)

### **1. BOOKING REMINDERS**

**Message:**
```
Modeled Reminder: [Service] with [Name] tomorrow at [Time]. Location: [Location]. Cancel: [Link]
```

**Trigger:** 24 hours before appointment  
**Priority:** High (if user opted in)

---

### **2. URGENT NOTIFICATIONS**

**Message:**
```
Modeled: [Urgent message]. [Action link]
```

**Examples:**
- "Modeled: Payment required for booking. Pay: [Link]"
- "Modeled: Booking cancelled. View: [Link]"

**Trigger:** Urgent actions only  
**Priority:** High (if user opted in)

---

---

## 🎨 TONE & VOICE GUIDELINES

### **For Models:**
- Warm, encouraging, supportive
- Use emojis liberally (✨ 💕 🎉)
- Focus on benefits and rewards
- Friendly and approachable

### **For Professionals:**
- Professional but friendly
- Clear and direct
- Focus on efficiency and results
- Supportive of their growth

### **For Admins:**
- Professional and concise
- Action-oriented
- Clear about what needs to be done
- Data-driven when relevant

---

## 📊 MESSAGE PRIORITY LEVELS

- **High:** Critical actions, time-sensitive, user-blocking
- **Medium:** Important updates, status changes
- **Low:** Nice-to-have, informational, non-urgent

---

## 🔔 NOTIFICATION CHANNELS

- **Email:** All important updates, confirmations, reminders
- **In-App:** Real-time updates, quick actions, status changes
- **SMS:** Urgent reminders, critical actions (opt-in only)

---

**This document should be updated as new message types are added or existing ones are modified.**

