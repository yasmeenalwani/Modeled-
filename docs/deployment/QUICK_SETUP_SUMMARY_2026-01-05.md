# Quick Setup Summary 🚀

## What You Need to Do in AWS Console

### ✅ **Critical (Do These First)**

1. **Stripe Keys** (5 min)
   - Get from Stripe Dashboard
   - Add to `.env` file (frontend)
   - Add to Secrets Manager (backend)

2. **RDS PostgreSQL** (20 min)
   - Create database
   - Run SQL schema
   - Store credentials in Secrets Manager

3. **DynamoDB Streams** (10 min)
   - Enable on 3 tables
   - Connect to Lambda

4. **SES Email** (5 min)
   - Verify email address
   - Update Lambda environment

5. **SNS SMS** (2 min)
   - Set spending limit

6. **Cognito Admin** (3 min)
   - Add yourself to Admin group

**Total Critical Time**: ~45 minutes

---

### ⚠️ **Important (Do Next)**

7. **CloudWatch Dashboard** (10 min)
8. **CloudWatch Alarms** (5 min)
9. **CloudTrail** (5 min)

**Total Important Time**: ~20 minutes

---

## 📋 Complete Checklist

See `AWS_CONSOLE_SETUP_CHECKLIST.md` for detailed step-by-step instructions.

---

## 🎯 Quick Reference

| What | Where | Time |
|------|-------|------|
| Stripe keys | Stripe Dashboard + Secrets Manager | 5 min |
| RDS | AWS Console → RDS | 20 min |
| DynamoDB Streams | AWS Console → DynamoDB | 10 min |
| SES | AWS Console → SES | 5 min |
| SNS | AWS Console → SNS | 2 min |
| Cognito | AWS Console → Cognito | 3 min |
| CloudWatch | AWS Console → CloudWatch | 15 min |
| CloudTrail | AWS Console → CloudTrail | 5 min |

**Total**: ~1.5 hours

---

## ✅ After Setup

1. Deploy: `npx ampx sandbox`
2. Test payments
3. Test notifications
4. Check analytics
5. Verify admin access

---

**You've got this!** 🎉

