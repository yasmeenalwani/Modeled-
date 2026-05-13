# RDS Analytics Setup Guide 📊

## Overview

**Hybrid Architecture**: DynamoDB for operations + RDS PostgreSQL for analytics

- **DynamoDB**: All user-facing operations (bookings, models, professionals)
- **RDS**: Analytics, reporting, trends, revenue tracking

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER OPERATIONS                       │
│  (Bookings, Models, Professionals, Matches)            │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              DynamoDB (Primary Database)                  │
│  • Fast reads/writes                                     │
│  • Real-time operations                                  │
│  • AppSync integration                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         │ DynamoDB Streams
                         ▼
┌─────────────────────────────────────────────────────────┐
│         Lambda: dynamodb-sync Function                   │
│  • Listens to DynamoDB changes                           │
│  • Syncs to RDS PostgreSQL                               │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│         RDS PostgreSQL (Analytics Database)              │
│  • Complex queries                                       │
│  • Revenue reporting                                     │
│  • Trend analysis                                        │
│  • Materialized views                                    │
└─────────────────────────────────────────────────────────┘
                         │
                         │ Lambda: analytics-api
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Admin Dashboard (Frontend)                   │
│  • Trends page                                           │
│  • Revenue page                                          │
│  • Analytics queries                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Steps

### 1. **Deploy RDS Instance**

The RDS instance will be created when you deploy:

```bash
npx ampx sandbox
```

**Note**: RDS setup requires CDK resources. You may need to:
- Set up RDS manually via AWS Console, OR
- Deploy via separate CDK stack

### 2. **Initialize Database Schema**

After RDS is created, run the SQL schema:

1. Connect to RDS (via AWS Console → RDS → Connect)
2. Run `amplify/analytics/schema.sql`
3. This creates:
   - Tables: `bookings`, `model_requests`, `matches`
   - Materialized views: `revenue_summary`, `trends_summary`, etc.
   - Indexes for performance

### 3. **Enable DynamoDB Streams**

For each DynamoDB table, enable streams:

1. Go to AWS Console → DynamoDB → Tables
2. Select table (e.g., `Booking-dev`)
3. Go to "Exports and streams" tab
4. Enable "DynamoDB stream"
5. Stream view type: "New and old images"
6. Repeat for: `ModelRequest`, `Match` tables

### 4. **Configure Lambda Trigger**

Connect DynamoDB Streams to Lambda:

1. Go to AWS Console → Lambda → `dynamodb-sync`
2. Add trigger → DynamoDB stream
3. Select stream from table
4. Batch size: 10
5. Enable trigger

### 5. **Set Up Secrets Manager**

RDS credentials are stored in Secrets Manager:

1. Go to AWS Console → Secrets Manager
2. Find `modeled-analytics-db-credentials`
3. Verify it contains:
   - `username`
   - `password`
   - `host` (RDS endpoint)
   - `port`

### 6. **Test Sync**

1. Create a test booking in DynamoDB
2. Check Lambda logs (CloudWatch)
3. Verify data appears in RDS:
   ```sql
   SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;
   ```

---

## 📊 Available Analytics Queries

### **Revenue Analytics**
- `getRevenueByMonth(months)` - Revenue by month and service
- `getRevenueTrends(days)` - Daily revenue trends
- `getRevenueByDateRange(start, end)` - Custom date range

### **Trend Analytics**
- `getRequestTrends(days)` - Request creation trends
- `getMatchConversion(weeks)` - Match conversion rates
- `getServicePerformance()` - Service performance metrics

### **Top Performers**
- `getTopProfessionals(limit)` - Top revenue-generating professionals
- `getTopModels(limit)` - Most active models

---

## 🔄 Data Sync Flow

### **When Booking is Created:**

1. **DynamoDB**: Booking saved to `Booking` table
2. **DynamoDB Stream**: Event triggered
3. **Lambda**: `dynamodb-sync` function invoked
4. **RDS**: Booking inserted/updated in `bookings` table
5. **Materialized Views**: Auto-updated (or manually refreshed)

### **Sync Latency:**
- **Near real-time**: 1-5 seconds
- **Materialized views**: Refresh every hour (or manually)

---

## 💰 Cost Estimate

### **RDS PostgreSQL:**
- **Free Tier**: db.t3.micro (1 year free)
- **After Free Tier**: ~$15-20/month (db.t3.small)
- **Storage**: $0.115/GB/month
- **Backup**: $0.095/GB/month

### **DynamoDB Streams:**
- **Free**: 2.5M read requests/month
- **After Free**: $0.02 per 100K read requests

### **Lambda (Sync Function):**
- **Free**: 1M requests/month
- **After Free**: $0.20 per 1M requests

**Total Estimated Cost**: ~$15-25/month

---

## 📈 Materialized Views

### **Auto-Refresh Strategy:**

**Option 1: Scheduled Refresh (Recommended)**
```sql
-- Set up EventBridge rule to call Lambda
-- Lambda refreshes views every hour
```

**Option 2: Manual Refresh**
```javascript
// Admin dashboard button
await refreshAnalyticsViews();
```

**Option 3: On-Demand Refresh**
- Refresh when admin views analytics page
- Cache for 5-10 minutes

---

## 🔧 Troubleshooting

### **"Cannot connect to RDS"**
- Check security group allows Lambda access
- Verify VPC configuration
- Check Secrets Manager credentials

### **"Data not syncing"**
- Verify DynamoDB Streams enabled
- Check Lambda trigger is active
- Review CloudWatch logs

### **"Views not updating"**
- Manually refresh: `REFRESH MATERIALIZED VIEW revenue_summary;`
- Check refresh function is working
- Verify data exists in base tables

---

## 📚 SQL Queries Examples

### **Custom Revenue Report**
```sql
SELECT 
  service_type,
  DATE_TRUNC('month', appointment_date) as month,
  COUNT(*) as bookings,
  SUM(payment_amount) as revenue
FROM bookings
WHERE status = 'completed'
  AND appointment_date >= '2024-01-01'
GROUP BY service_type, month
ORDER BY month DESC, revenue DESC;
```

### **Conversion Funnel**
```sql
SELECT 
  COUNT(DISTINCT mr.id) as requests,
  COUNT(DISTINCT m.id) as matches,
  COUNT(DISTINCT b.id) as bookings,
  (COUNT(DISTINCT b.id)::DECIMAL / COUNT(DISTINCT mr.id) * 100) as conversion_rate
FROM model_requests mr
LEFT JOIN matches m ON mr.id = m.request_id
LEFT JOIN bookings b ON m.booking_id = b.id
WHERE mr.created_at >= CURRENT_DATE - INTERVAL '30 days';
```

---

## ✅ Next Steps

1. ✅ Deploy backend (`npx ampx sandbox`)
2. ⏳ Set up RDS (via Console or CDK)
3. ⏳ Run SQL schema
4. ⏳ Enable DynamoDB Streams
5. ⏳ Configure Lambda triggers
6. ⏳ Test sync
7. ⏳ View analytics in admin dashboard

---

**Status**: ✅ Code ready, needs deployment and configuration!

