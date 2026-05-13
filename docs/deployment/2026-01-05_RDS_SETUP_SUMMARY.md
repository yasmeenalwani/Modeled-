# RDS PostgreSQL Setup - Summary
*Created: 2026-01-05*

## ✅ What's Been Completed

### 1. **Setup Scripts Created**
- ✅ `scripts/setup-rds-postgres.ps1` - Automated RDS instance creation
- ✅ `scripts/initialize-rds-schema.ps1` - Schema initialization
- ✅ `scripts/test-rds-connection.ps1` - Connection testing
- ✅ `scripts/update-lambda-env.ps1` - Lambda environment variable updates

### 2. **Lambda Function Updated**
- ✅ `amplify/functions/analytics-api/handler.ts` - Enhanced error handling and secret retrieval
- ✅ `amplify/functions/analytics-api/resource.ts` - Updated configuration
- ✅ Installed `@types/pg` for TypeScript support

### 3. **Documentation Created**
- ✅ `docs/deployment/2026-01-05_RDS_SETUP_COMPLETE.md` - Comprehensive setup guide
- ✅ Updated `docs/deployment/2026-01-05_PRE_DEPLOYMENT_STATUS.md` - Status tracking

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create RDS Instance
```powershell
.\scripts\setup-rds-postgres.ps1
```
**Time:** ~5-10 minutes  
**What it does:**
- Creates RDS PostgreSQL 15.4 instance
- Sets up security groups
- Stores credentials in Secrets Manager
- Stores endpoint in Secrets Manager

### Step 2: Initialize Schema
```powershell
.\scripts\initialize-rds-schema.ps1
```
**Time:** ~1-2 minutes  
**What it does:**
- Connects to RDS
- Runs `amplify/analytics/schema.sql`
- Creates all tables and views
- Verifies schema

### Step 3: Update Lambda & Test
```powershell
.\scripts\update-lambda-env.ps1
.\scripts\test-rds-connection.ps1
```
**Time:** ~1 minute  
**What it does:**
- Updates Lambda environment variables
- Tests connection from Lambda
- Verifies everything works

---

## 📋 Prerequisites

Before running the scripts, ensure:
- ✅ AWS CLI configured (`aws configure`)
- ✅ Appropriate AWS permissions (RDS, EC2, Secrets Manager, Lambda)
- ✅ PowerShell (Windows) or Bash (Linux/Mac)
- ✅ PostgreSQL client tools (psql) - optional, for schema initialization

---

## 🔐 Secrets Manager

The setup creates two secrets:

1. **`modeled-analytics-db-credentials`**
   - Contains: username, password, host, port, dbname
   - Used by: Lambda function for database connection

2. **`rds-endpoint`**
   - Contains: RDS endpoint hostname
   - Used by: Lambda function (optional, can also get from credentials secret)

---

## 📊 Schema Overview

The schema includes:

### Core Tables
- `bookings` - All booking records
- `model_requests` - Professional requests  
- `matches` - Match records with scores

### Analytics Tables
- `onboarding_events` - User onboarding tracking
- `engagement_events` - User engagement tracking
- `user_sessions` - Session tracking

### Materialized Views
- `revenue_summary` - Revenue by month/service
- `trends_summary` - Daily trends
- `service_performance` - Service-level metrics
- `match_conversion` - Match conversion rates
- `onboarding_funnel` - Onboarding funnel
- `engagement_summary` - Engagement metrics

---

## 💰 Estimated Costs

### Development (db.t3.micro)
- **Instance:** $0 (free tier - 750 hours/month) or ~$15/month
- **Storage:** ~$2.30/GB-month (20 GB = ~$46/month)
- **Backups:** ~$0.095/GB-month (20 GB = ~$1.90/month)
- **Total:** ~$0-65/month (depending on free tier eligibility)

### Production (db.t3.small)
- **Instance:** ~$30-40/month
- **Storage:** ~$2.30/GB-month
- **Backups:** ~$0.095/GB-month
- **Total:** ~$80-100/month (for 20 GB storage)

---

## 🧪 Testing

After setup, test the connection:

```powershell
# Test direct connection
.\scripts\test-rds-connection.ps1

# Test Lambda function
aws lambda invoke \
  --function-name analytics-api-* \
  --payload '{"action": "testConnection"}' \
  response.json
```

---

## 📝 Next Steps

1. **Run Setup Scripts** (see Quick Start above)
2. **Deploy Backend:**
   ```bash
   npx ampx sandbox
   ```
3. **Test Analytics:**
   - Go to Admin Portal → Analytics
   - Verify data loads correctly
4. **Set Up Data Sync:**
   - Enable DynamoDB Streams
   - Deploy `dynamodb-sync` function
   - Test sync with sample data

---

## 🐛 Troubleshooting

### Script Fails
- Check AWS CLI is configured: `aws sts get-caller-identity`
- Verify permissions: RDS, EC2, Secrets Manager, Lambda
- Check region matches your AWS account

### Connection Issues
- Verify RDS instance is "available" status
- Check security group allows Lambda access
- Verify credentials in Secrets Manager

### Lambda Can't Connect
- Run `update-lambda-env.ps1` to set environment variables
- Check Lambda has Secrets Manager permissions
- Verify Lambda is in same VPC (if RDS is private)

---

## 📚 Documentation

- **Complete Guide:** `docs/deployment/2026-01-05_RDS_SETUP_COMPLETE.md`
- **Setup Guide:** `docs/deployment/2026-01-05_RDS_SETUP_GUIDE.md`
- **Pre-Deployment Status:** `docs/deployment/2026-01-05_PRE_DEPLOYMENT_STATUS.md`

---

**Status:** ✅ Ready to Run  
**Last Updated:** 2026-01-05

