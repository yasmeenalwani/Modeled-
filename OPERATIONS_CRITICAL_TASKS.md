# 🚨 CRITICAL Operations Tasks - What Needs to Be Done

**Last Updated:** January 6, 2026  
**Status:** URGENT - Blocking Production

---

## 🔴 CRITICAL (Do First - This Week)

### 1. **EventBridge AWS Console Setup** ⚠️ CRITICAL
**Status:** Code complete, AWS Console setup pending  
**Impact:** No automated reminders, no chat activation, no payment reminders  
**Effort:** 30 minutes (AWS Console clicks)

**What to do:**
1. Go to AWS Console → EventBridge → Rules
2. Create 3 scheduled rules:

   **Rule 1: Booking Reminders (24h before)**
   - Name: `booking-reminders-24h`
   - Schedule: `rate(1 hour)` (runs every hour, checks for bookings 24h away)
   - Target: Lambda function `booking-reminders`
   - Input: `{"reminderType": "24h"}`

   **Rule 2: Payment Reminders (Every 6 hours)**
   - Name: `model-payment-reminders`
   - Schedule: `rate(6 hours)`
   - Target: Lambda function `model-payment-reminders`

   **Rule 3: Chat Activation (On booking confirmation)**
   - Name: `chat-activation-on-booking`
   - Event pattern: DynamoDB stream on `Booking` table (status = 'confirmed')
   - Target: Lambda function `chat-activation`

**Files ready:**
- ✅ `amplify/functions/booking-reminders/` (Lambda exists)
- ✅ `amplify/functions/chat-activation/` (Lambda exists)
- ✅ `amplify/functions/model-payment-reminders/` (Lambda exists)
- ✅ `amplify/eventbridge/scheduled-rules.ts` (Config exists)

**Action:** Create rules in AWS Console NOW

---

### 2. **Auto-Trigger Matching** ⚠️ CRITICAL
**Status:** Not started  
**Impact:** Admin bottleneck - must manually click "Run Match Engine" for every request  
**Effort:** 2-3 hours

**What to do:**
1. Add Lambda trigger on `ModelRequest` creation
2. Auto-run matching when request status = 'pending'
3. Auto-approve matches with score > 85
4. Auto-send approved matches to models

**Files to modify:**
- `amplify/functions/matching-engine/` (create new Lambda)
- `amplify/data/resource.ts` (add trigger)
- `src/admin/pages/RequestsPage.jsx` (remove manual "Run Match Engine" button)

**Action:** Implement auto-matching trigger

---

### 3. **Real-Time Score Updates** ⚠️ CRITICAL
**Status:** Not started  
**Impact:** Stale scores = poor matching quality  
**Effort:** 2-3 hours

**What to do:**
1. Add event listeners for:
   - Booking completion → Update reliability, experience, compatibility
   - Feedback submission → Update feedback score
   - Cancellation → Penalize reliability (-20)
   - Profile update → Update engagement
   - Login/activity → Update engagement (last active)

2. Add scheduled job (daily at 2am) to recalculate all scores

**Files to modify:**
- `amplify/functions/score-updater/` (create new Lambda)
- `amplify/data/resource.ts` (add triggers)
- `src/utils/agenticScores.js` (add update functions)

**Action:** Implement score update triggers

---

## 🟠 HIGH PRIORITY (Do This Week)

### 4. **Error Recovery & Retry Logic** ⚠️ HIGH
**Status:** Not started  
**Impact:** Failed payments/notifications lost forever  
**Effort:** 2-3 hours

**What to do:**
1. Add retry logic for payments (3 attempts with exponential backoff)
2. Add retry logic for notifications
3. Add dead letter queues for failed operations
4. Add error logging to CloudWatch

**Files to modify:**
- `amplify/functions/stripe-payment/` (add retry)
- `amplify/functions/notifications/` (add retry)
- Create SQS dead letter queues

**Action:** Add retry logic to critical functions

---

### 5. **CloudWatch Monitoring & Alerts** ⚠️ HIGH
**Status:** Not started  
**Impact:** No visibility into system health, errors go unnoticed  
**Effort:** 2-3 hours

**What to do:**
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
- `amplify/monitoring/dashboards.ts` (if using CDK)
- Or create manually in AWS Console

**Action:** Set up basic monitoring dashboard

---

## ✅ COMPLETED (Already Done)

### Mock Data Replacement ✅
- ✅ RequestsPage - Real database queries
- ✅ Dashboard - Real database queries  
- ✅ ModelSessionsConsolidated - Real booking data
- ✅ All pages show real data now

---

## 📋 Quick Action Plan

### **Today (30 min):**
1. ✅ Set up EventBridge rules in AWS Console (3 rules)

### **This Week (2-3 days):**
2. ✅ Auto-trigger matching on request creation
3. ✅ Real-time score updates
4. ✅ Error recovery & retry logic
5. ✅ Basic CloudWatch monitoring

### **Next Week:**
6. Auto-onboarding approval (if time permits)
7. Comprehensive validations
8. Auto-expiration cleanup

---

## 🎯 Success Criteria

**Critical tasks are done when:**
- ✅ EventBridge rules created and tested
- ✅ Matching auto-triggers on request creation
- ✅ Scores update within 5 minutes of events
- ✅ Failed operations retry automatically
- ✅ CloudWatch dashboard shows system health

---

## 📝 Notes

- **EventBridge:** Code is ready, just needs AWS Console setup
- **Matching:** Needs Lambda trigger implementation
- **Scores:** Needs event listeners + scheduled job
- **Monitoring:** Can be done in AWS Console or via CDK

**Priority Order:**
1. EventBridge (30 min) - EASIEST WIN
2. Auto-matching (2-3 hours) - BIGGEST IMPACT
3. Score updates (2-3 hours) - QUALITY IMPROVEMENT
4. Error recovery (2-3 hours) - RELIABILITY
5. Monitoring (2-3 hours) - VISIBILITY

---

**Total Critical Effort:** ~8-12 hours  
**Can be done in 1-2 days if focused**

