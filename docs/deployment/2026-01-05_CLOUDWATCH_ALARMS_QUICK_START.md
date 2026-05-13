# CloudWatch Alarms Quick Start
*Created: 2026-01-05*

## 🚀 Quick Setup (10 Minutes)

### **Step 1: Create SNS Topic**

**AWS Console:**
1. Go to SNS → Topics → Create topic
2. Name: `modeled-management-alerts`
3. Create subscription → Email → Your email
4. Confirm subscription in email

### **Step 2: Run Setup Script**

```powershell
.\scripts\setup-cloudwatch-alarms.ps1 -AlertEmail "your-email@example.com"
```

This creates all critical alarms automatically!

### **Step 3: Verify**

1. Go to CloudWatch → Alarms
2. Should see 6+ alarms created
3. Test by triggering an error
4. Check email for alert

---

## 📋 What Gets Created

### **Critical Alarms:**
- ✅ Lambda Errors (> 1 error in 5 min)
- ✅ DynamoDB Throttling (> 10 throttles in 5 min)
- ✅ AppSync 5XX Errors (> 5 errors in 5 min)
- ✅ SES Bounce Rate (> 5%)
- ✅ SES Complaint Rate (> 0.1%)

### **Performance Alarms:**
- ✅ Lambda Duration (> 10 seconds)
- ✅ AppSync Latency (> 2 seconds)

### **Cost Alarms:**
- ✅ Monthly Billing (> $100)

---

## 🔧 Manual Setup

If you prefer manual setup, see:
`docs/deployment/2026-01-05_CLOUDWATCH_ALARMS_SETUP.md`

---

## 📊 View Alarms

**CloudWatch Console:**
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:

---

**Last Updated:** 2026-01-05

