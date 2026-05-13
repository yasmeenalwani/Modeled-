# RDS Deployment Note ⚠️

## Important: Amplify Gen 2 RDS Limitation

**Amplify Gen 2 doesn't directly support RDS** in the same way it supports DynamoDB. You have two options:

---

## Option 1: Manual Setup (Recommended for Now)

### **Step 1: Create RDS via AWS Console**

1. Go to AWS Console → **RDS** → **Create database**
2. Choose **PostgreSQL**
3. Settings:
   - **DB instance identifier**: `modeled-analytics`
   - **Master username**: `analytics_admin`
   - **Master password**: (create strong password)
   - **DB instance class**: `db.t3.micro` (free tier)
   - **Storage**: 20GB
   - **VPC**: Default VPC (or create new)
   - **Public access**: No (for security)
   - **Security group**: Create new (allow Lambda access)

4. Click **Create database**
5. Wait 5-10 minutes for creation

### **Step 2: Update Lambda Environment Variables**

After RDS is created:

1. Get RDS endpoint from RDS Console
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

3. Update Lambda functions:
   - `dynamodb-sync`: Add RDS endpoint to environment
   - `analytics-api`: Add RDS endpoint to environment

### **Step 3: Configure Security Group**

1. Go to RDS → Your database → **Connectivity & security**
2. Click on Security Group
3. **Inbound rules** → **Edit**
4. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Your Lambda security group (or VPC CIDR)

### **Step 4: Run SQL Schema**

1. Connect to RDS (via AWS Console → RDS → Connect)
2. Use **Query Editor** or **pgAdmin**
3. Copy contents of `amplify/analytics/schema.sql`
4. Run the SQL script
5. Verify tables created:
   ```sql
   \dt  -- List tables
   ```

### **Step 5: Enable DynamoDB Streams**

1. Go to **DynamoDB** → **Tables**
2. For each table (`Booking`, `ModelRequest`, `Match`):
   - Click table → **Exports and streams** tab
   - Enable **DynamoDB stream**
   - Stream view type: **New and old images**

### **Step 6: Connect Streams to Lambda**

1. Go to **Lambda** → `dynamodb-sync`
2. **Add trigger** → **DynamoDB stream**
3. Select stream from `Booking` table
4. Batch size: 10
5. Enable trigger
6. Repeat for `ModelRequest` and `Match` tables

---

## Option 2: CDK Stack (Advanced)

Create a separate CDK stack for RDS:

```bash
# Create CDK project
mkdir rds-stack
cd rds-stack
cdk init app --language typescript

# Copy RDS setup from amplify/analytics/rds-resource.ts
# Deploy
cdk deploy
```

---

## Quick Setup Checklist

- [ ] Create RDS PostgreSQL instance
- [ ] Store credentials in Secrets Manager
- [ ] Update Lambda environment variables
- [ ] Configure security group
- [ ] Run SQL schema (`amplify/analytics/schema.sql`)
- [ ] Enable DynamoDB Streams
- [ ] Connect streams to Lambda
- [ ] Test sync (create test booking)
- [ ] Verify data in RDS
- [ ] Test analytics pages

---

## Cost Reminder

- **RDS db.t3.micro**: FREE (first year)
- **After free tier**: ~$15/month
- **Storage**: $0.115/GB/month
- **Backup**: $0.095/GB/month

---

## Testing

### **Test Sync:**
1. Create a booking in DynamoDB (via admin dashboard)
2. Check Lambda logs (CloudWatch)
3. Query RDS:
   ```sql
   SELECT * FROM bookings ORDER BY created_at DESC LIMIT 1;
   ```

### **Test Analytics:**
1. Go to `/admin/trends`
2. Should show data (if sync is working)
3. Go to `/admin/revenue`
4. Should show revenue data

---

**Note**: The code is ready! You just need to set up RDS manually via AWS Console. This is a one-time setup. 🚀

