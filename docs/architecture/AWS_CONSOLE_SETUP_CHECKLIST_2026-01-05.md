# AWS Console Setup Checklist ✅

## Complete Setup Guide - Everything You Need to Do

---

## 🔴 Critical (Must Do)

### 1. **Stripe Keys** 💳
**Location**: Your project `.env` file + AWS Secrets Manager

**Steps:**
1. Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. **Frontend** - Create `.env` file:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```
3. **Backend** - AWS Secrets Manager:
   - Go to **Secrets Manager** → **Create secret**
   - Type: **Other type of secret**
   - Key/value:
     ```
     stripe_secret_key: sk_test_...
     stripe_webhook_secret: whsec_... (optional, for webhooks)
     ```
   - Secret name: `stripe-secret-key`
   - Click **Create**

**Time**: 5 minutes

---

### 2. **RDS PostgreSQL** 📊
**Location**: AWS Console → RDS

**Steps:**
1. Go to **RDS** → **Create database**
2. Choose **PostgreSQL**
3. Settings:
   - **Template**: Free tier (or Production)
   - **DB instance identifier**: `modeled-analytics`
   - **Master username**: `analytics_admin`
   - **Master password**: (create strong password - save it!)
   - **DB instance class**: `db.t3.micro` (free tier)
   - **Storage**: 20GB
   - **VPC**: Default VPC
   - **Public access**: No
   - **Security group**: Create new
4. Click **Create database**
5. Wait 5-10 minutes

**After Creation:**
1. Note the **Endpoint** (e.g., `modeled-analytics.xxxxx.rds.amazonaws.com`)
2. Store credentials in Secrets Manager:
   - Go to **Secrets Manager** → **Create secret**
   - Type: **Other type of secret**
   - Key/value:
     ```
     username: analytics_admin
     password: [your password]
     host: [rds-endpoint].rds.amazonaws.com
     port: 5432
     ```
   - Secret name: `modeled-analytics-db-credentials`
   - Click **Create**

3. **Configure Security Group:**
   - Go to RDS → Your database → **Connectivity & security**
   - Click on Security Group
   - **Inbound rules** → **Edit** → **Add rule**
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your VPC CIDR (or Lambda security group)

4. **Run SQL Schema:**
   - Go to RDS → Your database → **Query Editor** (or use pgAdmin)
   - Copy contents of `amplify/analytics/schema.sql`
   - Paste and run
   - Verify tables created

**Time**: 15-20 minutes

---

### 3. **DynamoDB Streams** 🔄
**Location**: AWS Console → DynamoDB

**Steps:**
For each table (`Booking`, `ModelRequest`, `Match`):

1. Go to **DynamoDB** → **Tables**
2. Click on table name
3. Go to **Exports and streams** tab
4. Click **Enable** on DynamoDB stream
5. Stream view type: **New and old images**
6. Click **Enable stream**
7. **Copy the Stream ARN** (you'll need this)

**Connect to Lambda:**
1. Go to **Lambda** → `dynamodb-sync` function
2. Click **Add trigger**
3. Select **DynamoDB**
4. DynamoDB stream: (paste Stream ARN from step above)
5. Batch size: 10
6. Click **Add**
7. Repeat for all 3 tables

**Time**: 10 minutes

---

### 4. **SES Email Verification** 📧
**Location**: AWS Console → SES

**Steps:**
1. Go to **SES** → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter your email: `noreply@yourdomain.com` (or your personal email for testing)
5. Click **Create**
6. Check your email and click verification link
7. Update Lambda environment:
   - Go to **Lambda** → `notifications` function
   - **Configuration** → **Environment variables**
   - Update `FROM_EMAIL` to your verified email

**For Production:**
- Verify your domain instead of individual email
- Request production access (removes sandbox limits)

**Time**: 5 minutes (email verification)

---

### 5. **SNS SMS Spending Limit** 📱
**Location**: AWS Console → SNS

**Steps:**
1. Go to **SNS** → **Text messaging (SMS)**
2. Click **Edit** on **Account preferences**
3. Set **Default maximum spending limit**: $10/month (or your preferred amount)
4. Click **Save**

**Time**: 2 minutes

---

### 6. **Cognito Admin Group** 👑
**Location**: AWS Console → Cognito

**Steps:**
1. Go to **Cognito** → **User Pools**
2. Select your user pool
3. Go to **Users and groups** → **Groups**
4. If "Admin" group doesn't exist:
   - Click **Create group**
   - Group name: `Admin`
   - Click **Create**
5. Add yourself to Admin group:
   - Go to **Users** tab
   - Find your user (your email)
   - Click on user → **Add user to group**
   - Select **Admin**
   - Click **Add**

**Time**: 3 minutes

---

## 🟡 Important (Should Do)

### 7. **CloudWatch Dashboard** 📊
**Location**: AWS Console → CloudWatch

**Steps:**
1. Go to **CloudWatch** → **Dashboards**
2. Click **Create dashboard**
3. Name: `ModeledManagement-Main`
4. Add widgets:
   - Billing metrics
   - Lambda invocations
   - Lambda errors
   - DynamoDB read/write capacity
   - S3 storage
   - AppSync API calls

**Time**: 10 minutes (or use the CDK code we created)

---

### 8. **CloudWatch Alarms** 🔔
**Location**: AWS Console → CloudWatch

**Steps:**
1. Go to **CloudWatch** → **Alarms**
2. Click **Create alarm**
3. **Billing Alarm:**
   - Metric: Billing → EstimatedCharges
   - Threshold: $100
   - Name: `ModeledManagement-MonthlyBilling`
4. **Error Rate Alarm:**
   - Metric: Lambda → Errors
   - Threshold: 10 errors in 5 minutes
   - Name: `ModeledManagement-HighErrorRate`

**Time**: 5 minutes

---

### 9. **CloudTrail** 🔒
**Location**: AWS Console → CloudTrail

**Steps:**
1. Go to **CloudTrail** → **Trails**
2. Click **Create trail**
3. Name: `ModeledManagement-SecurityTrail`
4. **Storage location**: Create new S3 bucket
5. Enable **Log file validation**
6. Enable **CloudWatch Logs** (optional but recommended)
7. Click **Next** → **Next** → **Create trail**

**Time**: 5 minutes

---

### 10. **S3 Bucket Permissions** 📦
**Location**: AWS Console → S3

**Steps:**
1. Go to **S3** → Your storage bucket
2. **Permissions** tab
3. **Bucket policy** - Verify it allows:
   - Cognito users to upload/download
   - Lambda functions to access
4. **CORS configuration** - Should be set by Amplify, but verify:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```

**Time**: 3 minutes

---

## 🟢 Optional (Nice to Have)

### 11. **Stripe Webhook** (Optional)
**Location**: Stripe Dashboard + AWS API Gateway

**Steps:**
1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: (Your Lambda function URL - get from AWS)
4. Events to send:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy **Signing secret** (`whsec_...`)
6. Add to Secrets Manager: `stripe-webhook-secret`

**Time**: 10 minutes

---

### 12. **CloudWatch Log Retention** 📝
**Location**: AWS Console → CloudWatch Logs

**Steps:**
1. Go to **CloudWatch** → **Log groups**
2. For each log group (`/aws/lambda/stripe-payment`, `/aws/lambda/notifications`):
   - Click log group
   - **Actions** → **Edit retention**
   - Set to **30 days** (or your preference)
   - Click **Save**

**Time**: 2 minutes

---

## 📋 Complete Checklist

### Critical (Do First)
- [ ] **Stripe keys** - Add to `.env` and Secrets Manager
- [ ] **RDS PostgreSQL** - Create instance and run schema
- [ ] **DynamoDB Streams** - Enable on 3 tables and connect to Lambda
- [ ] **SES email** - Verify email address
- [ ] **SNS SMS** - Set spending limit
- [ ] **Cognito Admin** - Add yourself to Admin group

### Important (Do Next)
- [ ] **CloudWatch Dashboard** - Create monitoring dashboard
- [ ] **CloudWatch Alarms** - Set up billing and error alarms
- [ ] **CloudTrail** - Create security trail
- [ ] **S3 Permissions** - Verify bucket policies

### Optional (Later)
- [ ] **Stripe Webhook** - Set up webhook endpoint
- [ ] **Log Retention** - Configure log retention

---

## ⏱️ Total Time Estimate

- **Critical**: ~45-60 minutes
- **Important**: ~20-25 minutes
- **Optional**: ~15 minutes

**Total**: ~1.5-2 hours for complete setup

---

## 🎯 Priority Order

1. **Stripe keys** (5 min) - Needed for payments
2. **Cognito Admin group** (3 min) - Needed to access admin
3. **SES email** (5 min) - Needed for notifications
4. **SNS SMS limit** (2 min) - Needed for SMS
5. **RDS setup** (20 min) - Needed for analytics
6. **DynamoDB Streams** (10 min) - Needed for RDS sync
7. **CloudWatch/CloudTrail** (15 min) - Monitoring

---

## 🆘 Quick Reference

### **Where to Find Things:**

| Service | Console Location |
|---------|------------------|
| **Stripe** | [dashboard.stripe.com](https://dashboard.stripe.com) |
| **RDS** | AWS Console → RDS → Databases |
| **DynamoDB** | AWS Console → DynamoDB → Tables |
| **SES** | AWS Console → SES → Verified identities |
| **SNS** | AWS Console → SNS → Text messaging |
| **Cognito** | AWS Console → Cognito → User Pools |
| **Secrets Manager** | AWS Console → Secrets Manager |
| **Lambda** | AWS Console → Lambda → Functions |
| **CloudWatch** | AWS Console → CloudWatch |
| **CloudTrail** | AWS Console → CloudTrail |

---

## ✅ After Setup

### **Test Everything:**

1. **Stripe**: Create a test booking and try payment
2. **RDS**: Create booking, check if it syncs to RDS
3. **SES**: Send a test notification
4. **SNS**: Send a test SMS
5. **Admin Access**: Try accessing `/admin`
6. **Analytics**: Check `/admin/trends` and `/admin/revenue`

---

## 📚 Documentation References

- **Stripe**: `STRIPE_SETUP.md`
- **RDS**: `RDS_DEPLOYMENT_NOTE.md`
- **SES/SNS**: `SNS_SES_SETUP.md`
- **Monitoring**: `MONITORING_SETUP.md`

---

**You've got this!** Follow the checklist and you'll be set up in no time. 🚀

