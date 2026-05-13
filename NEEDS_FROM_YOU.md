# 🚨 WHAT I NEED FROM YOU

**Status:** Action Required - AWS Console & Decisions  
**Created:** January 6, 2026

> **📖 NEW: Detailed walkthrough available!**  
> See `AWS_SETUP_WALKTHROUGH.md` for step-by-step instructions with screenshots guidance.  
> See `QUICK_START.md` for fastest path (5 minutes).

---

## ✅ WHAT I'VE DONE (Automatically)

### 1. Auto-Matching Implementation ✅
- ✅ Created Lambda function `auto-matching` 
- ✅ Auto-triggers matching when request status = 'pending'
- ✅ Auto-approves matches with score >= 85
- ✅ Auto-sends approved matches to models
- **File:** `amplify/functions/auto-matching/`

### 2. Score Update Utilities ✅
- ✅ Created score update functions for booking completion
- ✅ Created score update functions for feedback submission
- ✅ Created score update functions for cancellations
- ✅ Created engagement score updates
- **File:** `src/utils/scoreUpdater.js`

### 3. Auto-Matching Utilities ✅
- ✅ Created `runMatchingForRequest()` function
- ✅ Created `approveMatch()` function
- ✅ Created `sendMatchToModel()` function
- **File:** `src/utils/autoMatching.js`

---

## 🔴 WHAT I NEED FROM YOU

### 1. **AWS Console: EventBridge Setup** (30 minutes) ⚠️ CRITICAL

**Location:** AWS Console → EventBridge → Rules

**Create these 3 rules:**

#### Rule 1: Booking Reminders
```
Name: booking-reminders-24h
Schedule: rate(1 hour)
Target: Lambda function → booking-reminders
Input: {"reminderType": "24h"}
```

#### Rule 2: Payment Reminders
```
Name: model-payment-reminders
Schedule: rate(6 hours)
Target: Lambda function → model-payment-reminders
```

#### Rule 3: Chat Activation
```
Name: chat-activation-on-booking
Event Pattern: DynamoDB Stream → Booking table → status = 'confirmed'
Target: Lambda function → chat-activation
```

**Quick Guide:**
1. Go to AWS Console → EventBridge
2. Click "Rules" → "Create rule"
3. Fill in the details above
4. Select Lambda function as target
5. Repeat for all 3 rules

**Script:** I've created `scripts/setup-eventbridge.sh` for you (see below)

---

### 2. **AWS Console: Enable DynamoDB Stream for Auto-Matching** (5 minutes)

**What:** Enable DynamoDB Stream on `ModelRequest` table to trigger auto-matching

**Steps:**
1. Go to AWS Console → DynamoDB
2. Find table: `ModelRequest-xxxxx` (or search for "ModelRequest")
3. Click "Exports and streams" tab
4. Enable "DynamoDB stream"
5. Select "New and old images"
6. Note the stream ARN (you'll need it)

**Then:** Connect stream to Lambda
1. Go to Lambda → `auto-matching` function
2. Click "Add trigger"
3. Select "DynamoDB"
4. Select your ModelRequest table stream
5. Batch size: 10
6. Click "Add"

---

### 3. **AWS Console: Enable DynamoDB Streams for Score Updates** (5 minutes)

**What:** Enable streams on `Booking` table to trigger score updates

**Steps:**
1. DynamoDB → `Booking-xxxxx` table
2. Enable DynamoDB stream (same as above)
3. Connect to a Lambda function (or create one - I can help)

**Optional:** I can create a Lambda function for this if you want

---

### 4. **Decision: Auto-Approve Threshold** ⚠️ NEEDS YOUR INPUT

**Question:** What match score should trigger auto-approval?

**Current Setting:** 85 (in `auto-matching/resource.ts`)

**Options:**
- 80 = More matches auto-approved (less manual work, more risk)
- 85 = Balanced (current setting)
- 90 = Conservative (fewer auto-approvals, more manual review)

**Action:** Tell me what threshold you want, or leave at 85

---

### 5. **Decision: Auto-Send to Models** ⚠️ NEEDS YOUR INPUT

**Question:** Should approved matches automatically be sent to models?

**Current Setting:** Yes (enabled)

**Options:**
- Yes = Auto-send approved matches immediately
- No = Auto-approve but wait for admin to manually send

**Action:** Tell me if you want this enabled or disabled

---

### 6. **AWS Console: Deploy Lambda Functions** (10 minutes)

**What:** Deploy the new `auto-matching` Lambda function

**Option 1: Via Amplify (Recommended)**
```bash
npm run amplify deploy
```

**Option 2: Manual (if Amplify doesn't deploy it)**
- The function code is ready in `amplify/functions/auto-matching/`
- You may need to manually deploy it via AWS Console or CLI

---

### 7. **Testing: Verify Auto-Matching Works** (10 minutes)

**Test Steps:**
1. Create a new ModelRequest via Pro portal
2. Check if matching runs automatically (check CloudWatch logs)
3. Verify matches are created in database
4. Verify high-score matches are auto-approved
5. Verify matches are sent to models (if enabled)

**What to Check:**
- CloudWatch logs for `auto-matching` function
- Database: `Match` table should have new records
- Match status should be 'approved' or 'sent' for high scores

---

## 📋 QUICK CHECKLIST

**Must Do:**
- [ ] Create 3 EventBridge rules (30 min)
- [ ] Enable DynamoDB stream on ModelRequest table (5 min)
- [ ] Deploy auto-matching Lambda function (10 min)
- [ ] Test auto-matching works (10 min)

**Decisions Needed:**
- [ ] Confirm auto-approve threshold (85 is current)
- [ ] Confirm auto-send to models (enabled is current)

**Optional (Can Do Later):**
- [ ] Enable DynamoDB stream on Booking table for score updates
- [ ] Set up CloudWatch monitoring dashboard
- [ ] Add retry logic to payment functions

---

## 🚀 HELPFUL SCRIPTS I CREATED

### Script 1: EventBridge Setup (CLI)
**File:** `scripts/setup-eventbridge.sh`

Run this to create EventBridge rules via AWS CLI:
```bash
chmod +x scripts/setup-eventbridge.sh
./scripts/setup-eventbridge.sh
```

### Script 2: Test Auto-Matching
**File:** `scripts/test-auto-matching.js`

Run this to test if auto-matching works:
```bash
node scripts/test-auto-matching.js
```

---

## 📞 QUESTIONS?

**If you get stuck:**
1. Check CloudWatch logs for errors
2. Verify Lambda functions are deployed
3. Verify DynamoDB streams are enabled
4. Let me know and I'll help debug!

---

**Total Time Needed:** ~1 hour  
**Priority:** CRITICAL - Do EventBridge setup first (30 min)

