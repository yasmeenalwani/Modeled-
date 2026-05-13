# Workflow Next Steps - Implementation Plan

**Created:** January 6, 2026  
**Status:** Ready to Implement  
**Focus:** Workflow automation and reliability

---

## 🎯 Priority Order

Based on the documented workflow, here's what to implement next:

---

## 1️⃣ EVENTBRIDGE SETUP (CRITICAL - Supports Workflow Steps 10-11)

### **Why First:**
- Directly supports documented workflow steps
- Enables automated reminders and chat activation
- Low effort, high impact
- Foundation for other automations

### **What to Implement:**

#### **A. Booking Reminders (24h before) - Step 10**
- **EventBridge Rule:** Run every hour
- **Lambda Function:** Query bookings where `appointmentDate = tomorrow` AND `reminderSent = false`
- **Action:** Send email/SMS reminders, update `reminderSent = true`
- **Effort:** 1 day

#### **B. Chat Activation (1h before) - Step 11**
- **EventBridge Rule:** Run every 15 minutes
- **Lambda Function:** Query bookings where `appointmentDate = today` AND `appointmentTime` is within 1 hour AND `ModelToProChat.isActive = false`
- **Action:** Create/activate chat, set `isActive = true`, send notifications
- **Effort:** 1 day

#### **C. Payment Reminders (Every 6 hours)**
- **EventBridge Rule:** Run every 6 hours
- **Lambda Function:** Query matches where `status = 'accepted'` AND `paymentStatus = 'pending'` AND `acceptedAt < 24h ago`
- **Action:** Send payment reminder notifications
- **Effort:** 0.5 days

#### **D. Match Expiration (Daily at 2am)**
- **EventBridge Rule:** `cron(0 2 * * ? *)` (daily at 2am)
- **Lambda Function:** Use existing `match-expiration` function
- **Action:** Expire old matches, update status
- **Effort:** 0.5 days

**Total Effort:** 3 days  
**Impact:** High - Automates 4 critical workflow steps

---

## 2️⃣ REAL-TIME SCORE UPDATES (HIGH PRIORITY - Supports Matching Quality)

### **Why Second:**
- Improves matching accuracy over time
- Agentic learning requires real-time updates
- Supports workflow step 14 (portal updates)

### **What to Implement:**

#### **A. Event-Driven Score Updates**
- **Trigger:** Booking completed → Update reliability, experience, compatibility scores
- **Trigger:** Feedback submitted → Update feedback score
- **Trigger:** Profile updated → Update engagement score
- **Trigger:** Cancellation → Penalize reliability score
- **Effort:** 2 days

#### **B. Scheduled Score Recalculation**
- **EventBridge Rule:** Daily at 3am
- **Lambda Function:** Recalculate all model agentic scores
- **Action:** Update scores based on latest booking/feedback data
- **Effort:** 1 day

**Total Effort:** 3 days  
**Impact:** High - Improves matching quality

---

## 3️⃣ ERROR RECOVERY & RETRY LOGIC (HIGH PRIORITY - Reliability)

### **Why Third:**
- Ensures workflow doesn't break on errors
- Critical for payment and notification reliability
- Supports all workflow steps

### **What to Implement:**

#### **A. Payment Retry Logic**
- **Retry:** 3 attempts with exponential backoff
- **Dead Letter Queue:** Failed payments after 3 retries
- **Notification:** Alert admin on DLQ messages
- **Effort:** 1 day

#### **B. Notification Retry Logic**
- **Retry:** 3 attempts with exponential backoff
- **Dead Letter Queue:** Failed notifications after 3 retries
- **Notification:** Alert admin on DLQ messages
- **Effort:** 1 day

#### **C. Error Logging & Alerting**
- **CloudWatch Logs:** Structured error logging
- **CloudWatch Alarms:** Alert on error rates > threshold
- **SNS Topic:** Send alerts to admin
- **Effort:** 1 day

**Total Effort:** 3 days  
**Impact:** High - Improves reliability

---

## 4️⃣ MONITORING & DASHBOARDS (HIGH PRIORITY - Visibility)

### **Why Fourth:**
- Provides visibility into workflow health
- Enables proactive issue detection
- Supports operational excellence

### **What to Implement:**

#### **A. CloudWatch Dashboards**
- **Workflow Metrics:** Request → Match → Booking → Complete flow
- **Performance Metrics:** Matching time, booking conversion rate
- **Error Metrics:** Error rates, retry counts
- **Effort:** 2 days

#### **B. CloudWatch Alarms**
- **Error Rate:** Alert if > 5% errors
- **Latency:** Alert if matching takes > 30s
- **Failed Payments:** Alert on payment failures
- **Effort:** 1 day

#### **C. Health Check Endpoints**
- **Lambda Function:** Health check endpoint
- **Checks:** Database connectivity, Lambda availability, EventBridge rules
- **Action:** Return health status
- **Effort:** 0.5 days

**Total Effort:** 3.5 days  
**Impact:** High - Provides visibility

---

## 📊 Implementation Timeline

### **Week 1: EventBridge Setup**
- Day 1-2: Booking reminders + Chat activation
- Day 3: Payment reminders + Match expiration
- **Result:** Automated workflow steps 10-11

### **Week 2: Score Updates + Error Recovery**
- Day 1-2: Event-driven score updates
- Day 3: Scheduled score recalculation
- Day 4-5: Payment retry logic
- Day 6: Notification retry logic
- **Result:** Improved matching quality + reliability

### **Week 3: Monitoring**
- Day 1-2: CloudWatch dashboards
- Day 3: CloudWatch alarms
- Day 4: Health check endpoints
- **Result:** Full visibility into workflow

---

## 🎯 Success Metrics

### **EventBridge:**
- ✅ 100% of reminders sent automatically
- ✅ 100% of chats activated automatically
- ✅ 0 manual intervention needed

### **Score Updates:**
- ✅ Scores update within 5 minutes of event
- ✅ Daily recalculation completes successfully
- ✅ Matching accuracy improves over time

### **Error Recovery:**
- ✅ 95%+ success rate with retries
- ✅ Failed operations logged and alerted
- ✅ 0 silent failures

### **Monitoring:**
- ✅ 100% visibility into workflow health
- ✅ Alerts trigger within 5 minutes of issues
- ✅ Dashboards show real-time metrics

---

## 🚀 Quick Start

### **Start with EventBridge (Highest Impact):**

1. **Create EventBridge rules** in `amplify/backend.ts`
2. **Create Lambda functions** for reminders and chat activation
3. **Test with sample bookings**
4. **Deploy and monitor**

### **Files to Create:**
- `amplify/functions/booking-reminders/`
- `amplify/functions/chat-activation/`
- `amplify/functions/payment-reminders/`
- `amplify/eventbridge/` (rules configuration)

---

## 📝 Next Actions

1. ✅ **Review this plan** - Confirm priorities
2. ⏳ **Start EventBridge setup** - Begin with booking reminders
3. ⏳ **Test automations** - Verify workflow steps 10-11 work
4. ⏳ **Move to score updates** - After EventBridge is working

---

**Status:** Ready to Start  
**Recommended Start:** EventBridge Setup (Step 1)  
**Last Updated:** January 6, 2026

