# ⚡ QUICK START - Do This First

**Total Time:** 5 minutes  
**Priority:** HIGHEST

---

## 🎯 What This Does

This enables automated reminders and chat activation - the most critical automation features.

---

## ✅ DO THIS NOW (5 minutes)

### 1. Go to AWS Console → EventBridge (2 min)

1. Log in to https://console.aws.amazon.com
2. Search "EventBridge" at the top
3. Click "Rules" → "Create rule"

### 2. Create Booking Reminders Rule (3 min)

**Copy/paste these exact values:**

- **Name:** `booking-reminders-24h`
- **Pattern:** Select "Schedule" → "Rate-based" → `1 hour`
- **Target:** Lambda function → `booking-reminders`
- **Input:** Constant JSON → `{"reminderType": "24h"}`
- Click "Create rule"

✅ **DONE!** You just enabled automated booking reminders!

---

## 🎯 DO THIS NEXT (10 minutes)

### 3. Create Payment Reminders Rule

Same steps, different values:
- **Name:** `model-payment-reminders`
- **Pattern:** Schedule → `6 hours`
- **Target:** `model-payment-reminders`

### 4. Create Chat Activation Rule

- **Name:** `chat-activation-scheduled`
- **Pattern:** Schedule → `15 minutes`
- **Target:** `chat-activation`

✅ **All 3 rules created!**

---

## 🚨 THAT'S IT FOR NOW

**You can stop here!** The rest can wait:

- DynamoDB stream (needed for auto-matching) - can do later
- Lambda deployment - can do later
- Testing - can do later

**What you just enabled:**
- ✅ Booking reminders work automatically
- ✅ Payment reminders work automatically
- ✅ Chat activation works automatically

---

## 📞 Need Help?

**Tell me:**
- "I'm on Step 2" 
- "I can't find EventBridge"
- "It says permission denied"

I'll help you through it step by step! 🚀

