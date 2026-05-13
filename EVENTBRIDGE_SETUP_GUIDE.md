# EventBridge Setup Guide - Manual Configuration

**Date:** January 6, 2026  
**Status:** Setup Instructions

---

## ⚠️ Important Note

EventBridge rules need to be created manually in AWS Console or via AWS CLI because Amplify Gen 2 doesn't fully support EventBridge scheduled rules in the backend definition yet.

---

## 📋 EventBridge Rules to Create

### **1. Booking Reminders Rule**

**Schedule:** Every hour (`rate(1 hour)`)  
**Target:** `booking-reminders` Lambda function

**AWS Console Steps:**
1. Go to EventBridge → Rules
2. Create rule
3. Name: `BookingRemindersRule`
4. Schedule: `rate(1 hour)`
5. Target: Lambda function → Select `booking-reminders`
6. Enable rule

**AWS CLI Command:**
```bash
aws events put-rule \
  --name BookingRemindersRule \
  --schedule-expression "rate(1 hour)" \
  --description "Send booking reminders 24 hours before appointment"

aws events put-targets \
  --rule BookingRemindersRule \
  --targets "Id=1,Arn=arn:aws:lambda:REGION:ACCOUNT:function:booking-reminders"
```

---

### **2. Chat Activation Rule**

**Schedule:** Every 15 minutes (`rate(15 minutes)`)  
**Target:** `chat-activation` Lambda function

**AWS Console Steps:**
1. Go to EventBridge → Rules
2. Create rule
3. Name: `ChatActivationRule`
4. Schedule: `rate(15 minutes)`
5. Target: Lambda function → Select `chat-activation`
6. Enable rule

**AWS CLI Command:**
```bash
aws events put-rule \
  --name ChatActivationRule \
  --schedule-expression "rate(15 minutes)" \
  --description "Activate chats at scheduled times"

aws events put-targets \
  --rule ChatActivationRule \
  --targets "Id=1,Arn=arn:aws:lambda:REGION:ACCOUNT:function:chat-activation"
```

---

### **3. Model Payment Reminders Rule**

**Schedule:** Every 6 hours (`rate(6 hours)`)  
**Target:** `model-payment-reminders` Lambda function

**AWS Console Steps:**
1. Go to EventBridge → Rules
2. Create rule
3. Name: `ModelPaymentRemindersRule`
4. Schedule: `rate(6 hours)`
5. Target: Lambda function → Select `model-payment-reminders`
6. Enable rule

**AWS CLI Command:**
```bash
aws events put-rule \
  --name ModelPaymentRemindersRule \
  --schedule-expression "rate(6 hours)" \
  --description "Send payment reminders to models"

aws events put-targets \
  --rule ModelPaymentRemindersRule \
  --targets "Id=1,Arn=arn:aws:lambda:REGION:ACCOUNT:function:model-payment-reminders"
```

---

## 🔐 IAM Permissions Required

EventBridge needs permission to invoke Lambda functions. Add this policy to EventBridge:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": [
        "arn:aws:lambda:*:*:function:booking-reminders",
        "arn:aws:lambda:*:*:function:chat-activation",
        "arn:aws:lambda:*:*:function:model-payment-reminders"
      ]
    }
  ]
}
```

---

## ✅ Verification

After creating rules, verify they're working:

1. **Check CloudWatch Logs:**
   - Go to CloudWatch → Log Groups
   - Check `/aws/lambda/booking-reminders`
   - Check `/aws/lambda/chat-activation`
   - Check `/aws/lambda/model-payment-reminders`

2. **Test Manually:**
   - Go to EventBridge → Rules
   - Select a rule
   - Click "Test" to manually trigger

3. **Monitor:**
   - Check CloudWatch metrics for rule invocations
   - Verify Lambda invocations match schedule

---

## 📝 Next Steps

1. Deploy Lambda functions: `npx ampx sandbox` or `npx ampx pipeline-deploy`
2. Create EventBridge rules (using AWS Console or CLI)
3. Test rules manually
4. Monitor CloudWatch logs

---

**Status:** Ready for Setup  
**Last Updated:** January 6, 2026

