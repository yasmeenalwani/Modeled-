# RDS PostgreSQL Setup - Complete Guide
*Created: 2026-01-05*

## ✅ Quick Start

Run the automated setup script:

```powershell
.\scripts\setup-rds-postgres.ps1
```

This script will:
1. Create RDS PostgreSQL instance
2. Set up security groups
3. Store credentials in Secrets Manager
4. Provide instructions for schema initialization

Then initialize the schema:

```powershell
.\scripts\initialize-rds-schema.ps1
```

Test the connection:

```powershell
.\scripts\test-rds-connection.ps1
```

---

## 📋 Prerequisites

- AWS CLI configured with appropriate permissions
- PowerShell (Windows) or Bash (Linux/Mac)
- PostgreSQL client tools (psql) - optional, for schema initialization
- AWS permissions:
  - `rds:*` (create, describe, modify RDS instances)
  - `ec2:*` (create security groups, describe VPCs)
  - `secretsmanager:*` (create, update secrets)
  - `lambda:*` (test Lambda function)

---

## 🚀 Automated Setup

### Step 1: Create RDS Instance

```powershell
.\scripts\setup-rds-postgres.ps1
```

**Options:**
- `-Region`: AWS region (default: `us-east-1`)
- `-InstanceClass`: Instance type (default: `db.t3.micro` - free tier eligible)
- `-StorageGB`: Storage size in GB (default: `20`)
- `-MasterUsername`: Database admin username (default: `modeled_admin`)
- `-DatabaseName`: Database name (default: `modeled_analytics`)

**Example:**
```powershell
.\scripts\setup-rds-postgres.ps1 -Region us-east-1 -InstanceClass db.t3.small -StorageGB 50
```

**What it does:**
- Creates VPC security group for RDS
- Creates RDS subnet group
- Creates RDS PostgreSQL 15.4 instance
- Stores credentials in Secrets Manager (`modeled-analytics-db-credentials`)
- Stores endpoint in Secrets Manager (`rds-endpoint`)
- Waits for instance to be available

**Time:** ~5-10 minutes

---

### Step 2: Initialize Schema

```powershell
.\scripts\initialize-rds-schema.ps1
```

**What it does:**
- Retrieves credentials from Secrets Manager
- Connects to RDS using psql
- Runs `amplify/analytics/schema.sql`
- Verifies tables were created

**Alternative (if psql not installed):**
1. Go to AWS RDS Console → Databases → `modeled-analytics`
2. Click "Query Editor" (or use RDS Query Editor v2)
3. Connect using credentials from Secrets Manager
4. Copy/paste contents of `amplify/analytics/schema.sql`
5. Run the script

---

### Step 3: Test Connection

```powershell
.\scripts\test-rds-connection.ps1
```

**What it does:**
- Tests connection to RDS
- Verifies credentials in Secrets Manager
- Tests Lambda function permissions
- Attempts to invoke Lambda function

---

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or the script fails:

### 1. Create Security Group

```bash
aws ec2 create-security-group \
  --group-name modeled-rds-sg \
  --description "Security group for Modeled Management RDS" \
  --vpc-id vpc-xxxxxxxxx
```

Allow PostgreSQL access:
```bash
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --cidr 10.0.0.0/16  # Your VPC CIDR
```

### 2. Create RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier modeled-analytics \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username modeled_admin \
  --master-user-password 'YourStrongPassword123!' \
  --allocated-storage 20 \
  --db-name modeled_analytics \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --publicly-accessible \
  --backup-retention-period 7 \
  --enable-cloudwatch-logs-exports postgresql \
  --storage-encrypted
```

### 3. Store Credentials in Secrets Manager

```bash
aws secretsmanager create-secret \
  --name modeled-analytics-db-credentials \
  --description "RDS PostgreSQL credentials for Modeled Analytics" \
  --secret-string '{
    "username": "modeled_admin",
    "password": "YourStrongPassword123!",
    "engine": "postgres",
    "host": "modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com",
    "port": 5432,
    "dbname": "modeled_analytics"
  }'
```

Store endpoint:
```bash
aws secretsmanager create-secret \
  --name rds-endpoint \
  --description "RDS endpoint for Modeled Analytics" \
  --secret-string "modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com"
```

### 4. Initialize Schema

```bash
psql -h modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com \
     -U modeled_admin \
     -d modeled_analytics \
     -f amplify/analytics/schema.sql
```

---

## 🔐 Secrets Manager Configuration

The Lambda function expects these secrets:

### 1. `modeled-analytics-db-credentials`
**Format:**
```json
{
  "username": "modeled_admin",
  "password": "YourPassword",
  "engine": "postgres",
  "host": "modeled-analytics.xxxxx.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "dbname": "modeled_analytics"
}
```

### 2. `rds-endpoint`
**Format:**
```
modeled-analytics.xxxxx.us-east-1.rds.amazonaws.com
```

---

## 🔄 Lambda Function Configuration

The `analytics-api` Lambda function needs:

1. **IAM Permissions:**
   - `secretsmanager:GetSecretValue` for both secrets
   - VPC access (if RDS is in private subnet)
   - CloudWatch Logs

2. **Environment Variables:**
   - `RDS_SECRET_ARN`: ARN of `modeled-analytics-db-credentials` secret
   - `RDS_ENDPOINT`: (Optional) RDS endpoint (can be retrieved from secret)
   - `RDS_DATABASE`: `modeled_analytics`
   - `RDS_REGION`: `us-east-1` (or your region)

3. **VPC Configuration (if RDS is private):**
   - Lambda must be in same VPC as RDS
   - Lambda needs VPC subnet and security group
   - Security group must allow outbound to RDS port 5432

---

## 🧪 Testing

### Test 1: Direct Connection

```bash
psql -h <RDS_ENDPOINT> -U modeled_admin -d modeled_analytics
```

### Test 2: Lambda Function

```bash
aws lambda invoke \
  --function-name analytics-api-* \
  --payload '{"action": "testConnection"}' \
  response.json

cat response.json
```

### Test 3: Query Data

```sql
-- Connect to database
SELECT version();

-- Check tables
\dt

-- Check materialized views
\dmv

-- Test query
SELECT COUNT(*) FROM bookings;
```

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

See `amplify/analytics/schema.sql` for complete schema.

---

## 🔄 Data Sync

### DynamoDB → RDS Sync

The `dynamodb-sync` Lambda function syncs data from DynamoDB to RDS:

1. **Enable DynamoDB Streams:**
   - Enable streams on `Booking`, `ModelRequest`, `Match` tables
   - Stream view type: `NEW_AND_OLD_IMAGES`

2. **Lambda Function:**
   - `amplify/functions/dynamodb-sync/handler.ts`
   - Processes stream events
   - Inserts/updates RDS tables

3. **Test Sync:**
   - Create a booking in DynamoDB
   - Verify it appears in RDS `bookings` table
   - Check CloudWatch logs for sync function

---

## 💰 Cost Optimization

### Development
- Use `db.t3.micro` (free tier eligible)
- Disable automated backups (set to 0 days)
- Use minimal storage (20 GB)
- Single-AZ deployment

### Production
- Use `db.t3.small` or larger (based on load)
- Enable automated backups (7 days retention)
- Use provisioned IOPS if needed
- Multi-AZ deployment for high availability
- Consider Reserved Instances for long-term savings

**Estimated Monthly Cost:**
- `db.t3.micro`: ~$15-20/month (free tier: $0 for first 750 hours)
- `db.t3.small`: ~$30-40/month
- Storage: ~$2.30/GB-month
- Backups: ~$0.095/GB-month

---

## 🔒 Security Best Practices

1. **Credentials**
   - ✅ Store in Secrets Manager (never hardcode)
   - ✅ Rotate passwords regularly
   - ✅ Use IAM database authentication (future enhancement)

2. **Network**
   - ✅ Use security groups to restrict access
   - ✅ Enable SSL/TLS for connections
   - ✅ Use private subnets for production
   - ✅ Use VPC endpoints for Lambda access

3. **Encryption**
   - ✅ Enable encryption at rest
   - ✅ Enable encryption in transit (SSL)

4. **Backups**
   - ✅ Enable automated backups
   - ✅ Test restore procedures
   - ✅ Store backups in separate region (production)

---

## 🐛 Troubleshooting

### Connection Issues

**Problem:** Cannot connect to RDS
- Check security group allows Lambda access
- Verify RDS endpoint is correct
- Check credentials in Secrets Manager
- Verify Lambda is in same VPC (if RDS is private)

**Problem:** Lambda timeout
- Increase Lambda timeout (default: 30 seconds)
- Check RDS instance is not overloaded
- Verify network connectivity

### Schema Issues

**Problem:** Tables not created
- Verify schema.sql ran successfully
- Check table names match Lambda code
- Verify column names and types

### Sync Issues

**Problem:** DynamoDB data not syncing to RDS
- Check DynamoDB Streams enabled
- Verify Lambda function has stream permissions
- Check CloudWatch logs for errors
- Verify RDS connection from Lambda

---

## ✅ Success Criteria

- [x] RDS instance created and available
- [x] Credentials stored in Secrets Manager
- [x] Schema initialized successfully
- [x] Lambda function can connect
- [x] Test queries return results
- [x] Materialized views refresh successfully
- [x] DynamoDB sync working (if implemented)
- [x] Admin analytics page shows data

---

## 📝 Next Steps

1. **Deploy Backend:**
   ```bash
   npx ampx sandbox
   ```

2. **Test Analytics API:**
   - Go to Admin Portal → Analytics
   - Verify data loads correctly

3. **Set Up Data Sync:**
   - Enable DynamoDB Streams
   - Deploy `dynamodb-sync` function
   - Test sync with sample data

4. **Monitor:**
   - Set up CloudWatch alarms
   - Monitor RDS performance
   - Track Lambda invocations

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Setup

