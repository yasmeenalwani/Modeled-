# RDS PostgreSQL Setup Guide
*Created: 2026-01-05*

## 🎯 Goal

Set up RDS PostgreSQL database for analytics and reporting, with schema initialized and Lambda function connected.

---

## 📋 Prerequisites

- AWS account with RDS access
- VPC configured (if using private RDS)
- Secrets Manager access
- Lambda function `analytics-api` deployed

---

## 🚀 Setup Steps

### **Step 1: Create RDS Instance**

#### **Option A: AWS Console**

1. **Go to RDS Console**
   - Navigate to RDS → Databases
   - Click "Create database"

2. **Database Configuration**
   - **Engine:** PostgreSQL
   - **Version:** 15.x (or latest stable)
   - **Template:** Free tier (for dev) or Production (for prod)
   - **DB instance identifier:** `modeled-analytics`
   - **Master username:** `modeled_admin` (or your choice)
   - **Master password:** Generate strong password (save it!)
   - **DB instance class:** `db.t3.micro` (free tier) or `db.t3.small` (production)
   - **Storage:** 20 GB (adjust as needed)
   - **VPC:** Default VPC or your custom VPC
   - **Public access:** Yes (for Lambda access) or No (if using VPC endpoint)
   - **Security group:** Create new or use existing
     - Allow inbound: PostgreSQL (5432) from Lambda security group

3. **Advanced Settings**
   - **Database name:** `modeled_analytics`
   - **Backup retention:** 7 days (production) or 0 days (dev)
   - **Enable encryption:** Yes (recommended)
   - **Enable monitoring:** Yes (CloudWatch)

4. **Click "Create database"**
   - Wait 5-10 minutes for instance to be available

#### **Option B: AWS CLI**

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier modeled-analytics \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username modeled_admin \
  --master-user-password 'YourStrongPassword123!' \
  --allocated-storage 20 \
  --storage-type gp2 \
  --db-name modeled_analytics \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --publicly-accessible \
  --backup-retention-period 7 \
  --enable-cloudwatch-logs-exports postgresql
```

### **Step 2: Store Credentials in Secrets Manager**

**Important:** Never hardcode database credentials. Store them in AWS Secrets Manager.

```bash
# Create secret
aws secretsmanager create-secret \
  --name modeled-rds-credentials \
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

**Note:** Replace `host` with your actual RDS endpoint (found in RDS Console → Databases → Endpoint).

### **Step 3: Initialize Schema**

1. **Get RDS Endpoint**
   - RDS Console → Databases → Your instance → Endpoint
   - Example: `modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com`

2. **Connect to Database**
   ```bash
   # Using psql (if installed)
   psql -h modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com \
        -U modeled_admin \
        -d modeled_analytics
   ```

   Or use a database client like:
   - pgAdmin
   - DBeaver
   - TablePlus
   - VS Code PostgreSQL extension

3. **Run Schema Script**
   ```bash
   # From project root
   psql -h <RDS_ENDPOINT> \
        -U modeled_admin \
        -d modeled_analytics \
        -f amplify/analytics/schema.sql
   ```

   Or copy/paste the contents of `amplify/analytics/schema.sql` into your database client.

### **Step 4: Configure Lambda Function**

1. **Update Environment Variables**
   
   In `amplify/functions/analytics-api/resource.ts` or via AWS Console:
   ```typescript
   environment: {
     RDS_SECRET_ARN: 'arn:aws:secretsmanager:us-east-1:ACCOUNT:secret:modeled-rds-credentials-xxxxx',
     RDS_ENDPOINT: 'modeled-analytics.xxxxxxxxx.us-east-1.rds.amazonaws.com',
     RDS_DATABASE: 'modeled_analytics',
     RDS_REGION: 'us-east-1',
   }
   ```

2. **Update IAM Permissions**
   
   Lambda execution role needs:
   - `secretsmanager:GetSecretValue` (for RDS credentials)
   - VPC access (if RDS is in private subnet)
   - CloudWatch Logs (for logging)

3. **VPC Configuration (if RDS is private)**
   - Lambda function must be in same VPC as RDS
   - Lambda needs VPC subnet and security group
   - Security group must allow outbound to RDS port 5432

### **Step 5: Test Connection**

1. **Test Lambda Function**
   ```bash
   # Invoke Lambda with test event
   aws lambda invoke \
     --function-name analytics-api-* \
     --payload '{"action": "testConnection"}' \
     response.json
   
   cat response.json
   ```

2. **Test from Frontend**
   - Go to Admin Portal → Analytics
   - Should see data loading (may be empty initially)
   - Check browser console for errors

---

## 📊 Schema Overview

The schema includes:

1. **Core Tables**
   - `bookings` - All booking records
   - `model_requests` - Professional requests
   - `matches` - Match records with scores

2. **Analytics Tables**
   - `onboarding_events` - User onboarding tracking
   - `engagement_events` - User engagement tracking
   - `user_sessions` - Session tracking

3. **Materialized Views**
   - `revenue_summary` - Revenue by month/service
   - `trends_summary` - Daily trends
   - `service_performance` - Service-level metrics
   - `match_conversion` - Match conversion rates
   - `onboarding_funnel` - Onboarding funnel
   - `engagement_summary` - Engagement metrics

See `amplify/analytics/schema.sql` for complete schema.

---

## 🔄 Data Sync

### **DynamoDB → RDS Sync**

The `dynamodb-sync` Lambda function syncs data from DynamoDB to RDS:

1. **Configure DynamoDB Streams**
   - Enable streams on `Booking`, `ModelRequest`, `Match` tables
   - Stream view type: `NEW_AND_OLD_IMAGES`

2. **Lambda Function**
   - `amplify/functions/dynamodb-sync/handler.ts`
   - Processes stream events
   - Inserts/updates RDS tables

3. **Test Sync**
   - Create a booking in DynamoDB
   - Verify it appears in RDS `bookings` table
   - Check CloudWatch logs for sync function

---

## 🧪 Testing

### **Test 1: Connection**
```sql
-- Connect to database
SELECT version();

-- Check tables exist
\dt

-- Check materialized views
\dmv
```

### **Test 2: Insert Test Data**
```sql
-- Insert test booking
INSERT INTO bookings (
  id, request_id, model_id, professional_id,
  appointment_date, appointment_time, duration,
  service_type, status, payment_amount
) VALUES (
  'test-booking-1',
  'test-request-1',
  'test-model-1',
  'test-pro-1',
  '2026-01-10',
  '10:00 AM',
  120,
  'Haircut',
  'confirmed',
  150.00
);

-- Query test data
SELECT * FROM bookings WHERE id = 'test-booking-1';
```

### **Test 3: Query Materialized Views**
```sql
-- Refresh views
SELECT refresh_revenue_summary();
SELECT refresh_engagement_views();

-- Query views
SELECT * FROM revenue_summary LIMIT 10;
SELECT * FROM engagement_summary LIMIT 10;
```

### **Test 4: Lambda Function**
```bash
# Test analytics API
aws lambda invoke \
  --function-name analytics-api-* \
  --payload '{
    "action": "getRevenueByMonth",
    "params": { "months": 12 }
  }' \
  response.json
```

---

## 🔒 Security

### **Best Practices**

1. **Credentials**
   - ✅ Store in Secrets Manager (never hardcode)
   - ✅ Rotate passwords regularly
   - ✅ Use IAM database authentication (future enhancement)

2. **Network**
   - ✅ Use security groups to restrict access
   - ✅ Enable SSL/TLS for connections
   - ✅ Use private subnets for production

3. **Encryption**
   - ✅ Enable encryption at rest
   - ✅ Enable encryption in transit (SSL)

4. **Backups**
   - ✅ Enable automated backups
   - ✅ Test restore procedures
   - ✅ Store backups in separate region (production)

---

## 📊 Monitoring

### **CloudWatch Metrics**
- Database connections
- CPU utilization
- Storage space
- Read/write IOPS

### **CloudWatch Alarms**
Set up alarms for:
- CPU utilization > 80%
- Storage space < 20% free
- Database connections > 80% of max
- Failed connection attempts

### **CloudWatch Logs**
- Enable PostgreSQL logs
- Monitor slow queries
- Track errors

---

## 💰 Cost Optimization

### **Development**
- Use `db.t3.micro` (free tier eligible)
- Disable automated backups
- Use minimal storage (20 GB)

### **Production**
- Use `db.t3.small` or larger (based on load)
- Enable automated backups (7 days retention)
- Use provisioned IOPS if needed
- Consider Reserved Instances for long-term savings

---

## 🐛 Troubleshooting

### **Connection Issues**
- Check security group allows Lambda access
- Verify RDS endpoint is correct
- Check credentials in Secrets Manager
- Verify Lambda is in same VPC (if RDS is private)

### **Schema Issues**
- Verify schema.sql ran successfully
- Check table names match Lambda code
- Verify column names and types

### **Sync Issues**
- Check DynamoDB Streams enabled
- Verify Lambda function has stream permissions
- Check CloudWatch logs for errors
- Verify RDS connection from Lambda

---

## ✅ Success Criteria

- [ ] RDS instance created and available
- [ ] Credentials stored in Secrets Manager
- [ ] Schema initialized successfully
- [ ] Lambda function can connect
- [ ] Test queries return results
- [ ] Materialized views refresh successfully
- [ ] DynamoDB sync working (if implemented)
- [ ] Admin analytics page shows data

---

## 📝 Next Steps

1. **Data Population**
   - Set up DynamoDB → RDS sync
   - Backfill historical data (if needed)
   - Test with real data

2. **Analytics Dashboard**
   - Build admin analytics pages
   - Create charts and visualizations
   - Set up scheduled reports

3. **Optimization**
   - Tune materialized view refresh schedule
   - Optimize slow queries
   - Add indexes as needed

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Setup

