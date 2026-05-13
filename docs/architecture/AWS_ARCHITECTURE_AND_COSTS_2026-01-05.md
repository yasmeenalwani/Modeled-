# AWS Architecture & Cost Analysis
## Modeled Management Platform

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                    Vite + React + Amplify SDK                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS AMPLIFY (Hosting)                        │
│              CloudFront CDN + S3 Static Hosting                  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER (AWS AppSync)                      │
│                    GraphQL API Gateway                           │
└───────────┬───────────┬───────────┬───────────┬───────────────┘
            │           │           │           │
            ▼           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ DynamoDB │ │   S3     │ │  Lambda  │ │  Cognito │
    │  (Data)  │ │(Storage) │ │(Functions)│ │   (Auth) │
    └──────────┘ └──────────┘ └──────────┘ └──────────┘
            │           │           │
            └───────────┴───────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐       ┌──────────────┐
    │     RDS      │       │  Rekognition │
    │  PostgreSQL  │       │   + Bedrock  │
    │  (Analytics) │       │   (AI/ML)    │
    └──────────────┘       └──────────────┘
```

---

## 📊 Service Breakdown & Costs

### 1. **AWS Amplify (Hosting & CI/CD)**

**What it does:**
- Hosts your React frontend
- Provides CDN via CloudFront
- Automatic deployments from Git
- SSL certificates
- Build pipeline

**Cost Structure:**
- **Free Tier**: 1,000 build minutes/month, 15 GB storage, 5 GB data transfer
- **Paid Tier**:
  - Build: $0.01 per build minute (after free tier)
  - Storage: $0.023 per GB/month
  - Data Transfer: $0.15 per GB (first 10 TB)

**Scaling:**
- **0-1,000 users/month**: FREE (within free tier)
- **1,000-10,000 users/month**: ~$5-15/month
- **10,000-100,000 users/month**: ~$50-150/month
- **100,000+ users/month**: ~$200-500/month

**Example Monthly Cost:**
- 50 builds/month × 5 min = 250 min (FREE)
- 20 GB storage = $0.46
- 50 GB transfer = $7.50
- **Total: ~$8/month**

---

### 2. **AWS AppSync (GraphQL API)**

**What it does:**
- GraphQL API layer
- Real-time subscriptions
- Automatic API generation from schema
- Built-in caching

**Cost Structure:**
- **Free Tier**: 250,000 queries/month, 250,000 mutations/month
- **Paid Tier**:
  - Queries/Mutations: $4.00 per million
  - Real-time subscriptions: $2.00 per million connection-minutes
  - Data transfer: $0.09 per GB

**Scaling:**
- **0-250K requests/month**: FREE
- **250K-1M requests/month**: ~$3-4/month
- **1M-10M requests/month**: ~$15-40/month
- **10M-100M requests/month**: ~$150-400/month

**Example Monthly Cost:**
- 500K queries = $1.00 (250K free, 250K paid)
- 100K mutations = FREE
- 10 GB transfer = $0.90
- **Total: ~$2/month**

---

### 3. **Amazon DynamoDB (NoSQL Database)**

**What it does:**
- Stores operational data (profiles, bookings, matches)
- Fast, scalable NoSQL database
- Automatic scaling

**Cost Structure:**
- **Free Tier**: 25 GB storage, 25 read units, 25 write units
- **On-Demand Pricing** (recommended for variable traffic):
  - Storage: $0.25 per GB/month
  - Reads: $1.25 per million
  - Writes: $1.25 per million
- **Provisioned Pricing** (for steady traffic):
  - Storage: $0.25 per GB/month
  - Read capacity: $0.00013 per RCU/hour
  - Write capacity: $0.00065 per WCU/hour

**Scaling:**
- **0-1,000 users/month**: FREE (within free tier)
- **1,000-10,000 users/month**: ~$5-20/month
- **10,000-100,000 users/month**: ~$50-200/month
- **100,000+ users/month**: ~$200-1,000/month

**Example Monthly Cost (On-Demand):**
- 10 GB storage = $2.50
- 5M reads = $6.25
- 2M writes = $2.50
- **Total: ~$11/month**

---

### 4. **Amazon S3 (File Storage)**

**What it does:**
- Stores photos, videos, documents
- Profile pictures, session photos, portfolios

**Cost Structure:**
- **Free Tier**: 5 GB storage, 20,000 GET requests, 2,000 PUT requests
- **Standard Storage**: $0.023 per GB/month
- **Requests**:
  - PUT/COPY/POST: $0.005 per 1,000
  - GET: $0.0004 per 1,000
- **Data Transfer Out**: $0.09 per GB (first 10 TB)

**Scaling:**
- **0-1,000 users/month**: FREE (within free tier)
- **1,000-10,000 users/month**: ~$10-50/month
- **10,000-100,000 users/month**: ~$100-500/month
- **100,000+ users/month**: ~$500-2,000/month

**Example Monthly Cost:**
- 50 GB storage (photos) = $1.15
- 100K GET requests = $0.04
- 10K PUT requests = $0.05
- 20 GB transfer = $1.80
- **Total: ~$3/month**

---

### 5. **AWS Lambda (Serverless Functions)**

**What it does:**
- Photo analysis (Rekognition + Bedrock)
- Stripe payment processing
- Notifications (SES/SNS)
- Analytics API (RDS queries)
- DynamoDB sync (DynamoDB → RDS)
- Identity verification (Rekognition)

**Lambda Functions:**
1. `photo-analysis` - Analyzes uploaded photos with Rekognition + Bedrock
2. `stripe-payment` - Handles payment intents, confirmations, refunds, webhooks
3. `notifications` - Sends emails (SES) and SMS (SNS)
4. `analytics-api` - Queries RDS for dashboard metrics
5. `dynamodb-sync` - Syncs DynamoDB data to RDS for analytics
6. `identity-verification` - Verifies ID documents with Rekognition

**Cost Structure:**
- **Free Tier**: 1M requests/month, 400,000 GB-seconds compute
- **Paid Tier**:
  - Requests: $0.20 per million
  - Compute: $0.0000166667 per GB-second
  - Duration billed in 1ms increments

**Scaling:**
- **0-1M requests/month**: FREE
- **1M-10M requests/month**: ~$2-20/month
- **10M-100M requests/month**: ~$20-200/month

**Example Monthly Cost:**
- 2M requests = $0.20
- 500K GB-seconds = $8.33
- **Total: ~$9/month**

---

### 6. **Amazon Cognito (Authentication)**

**What it does:**
- User authentication (login, signup)
- User management
- MFA, password reset

**Cost Structure:**
- **Free Tier**: 50,000 MAU (Monthly Active Users)
- **Paid Tier**: $0.0055 per MAU after free tier

**Scaling:**
- **0-50K MAU**: FREE
- **50K-100K MAU**: ~$275/month
- **100K-500K MAU**: ~$275-2,475/month

**Example Monthly Cost:**
- 10K MAU = FREE
- 60K MAU = $55 (10K × $0.0055)
- **Total: ~$0-55/month**

---

### 7. **Amazon RDS PostgreSQL (Analytics Database)**

**What it does:**
- Analytics and reporting
- Admin dashboard data
- Revenue tracking
- Historical trends

**Cost Structure:**
- **Free Tier**: db.t3.micro for 750 hours/month (first year only)
- **Paid Tier** (db.t3.micro - smallest):
  - On-Demand: ~$15/month
  - Reserved (1-year): ~$10/month
  - Storage: $0.115 per GB/month
  - I/O: $0.10 per million requests

**Scaling:**
- **MVP/Startup**: db.t3.micro (~$15/month)
- **Growth**: db.t3.small (~$30/month)
- **Scale**: db.t3.medium (~$60/month)
- **Enterprise**: db.t3.large+ (~$120+/month)

**Example Monthly Cost:**
- db.t3.micro instance = $15
- 20 GB storage = $2.30
- 1M I/O requests = $0.10
- **Total: ~$17/month**

---

### 8. **Amazon Rekognition (Image Analysis)**

**What it does:**
- Detects labels, faces, objects in photos
- Auto-tags model attributes

**Cost Structure:**
- **Free Tier**: 5,000 images/month (DetectLabels)
- **Paid Tier**:
  - DetectLabels: $1.00 per 1,000 images
  - DetectFaces: $1.00 per 1,000 images
  - First 5,000 images/month are FREE

**Scaling:**
- **0-5K images/month**: FREE
- **5K-50K images/month**: ~$45-90/month
- **50K-500K images/month**: ~$450-900/month

**Example Monthly Cost:**
- 10K images analyzed = $5 (5K free, 5K paid)
- **Total: ~$5/month**

---

### 9. **AWS Bedrock (Claude AI)**

**What it does:**
- Advanced photo understanding
- Contextual attribute detection
- Natural language analysis

**Cost Structure:**
- **No free tier**
- **Claude 3 Haiku** (recommended):
  - Input: $0.25 per 1M tokens
  - Output: $1.25 per 1M tokens
  - ~$0.00025 per image analysis
- **Claude 3 Sonnet** (more accurate):
  - Input: $3.00 per 1M tokens
  - Output: $15.00 per 1M tokens
  - ~$0.003 per image analysis

**Scaling:**
- **0-1K images/month**: ~$0.25-3/month
- **1K-10K images/month**: ~$2.50-30/month
- **10K-100K images/month**: ~$25-300/month

**Example Monthly Cost (Haiku):**
- 1K images = $0.25
- **Total: ~$0.25/month**

---

### 10. **Amazon SES (Email Notifications)**

**What it does:**
- Sends transactional emails
- Booking confirmations, reminders

**Cost Structure:**
- **Free Tier**: 62,000 emails/month (if on EC2)
- **Paid Tier**: $0.10 per 1,000 emails

**Scaling:**
- **0-62K emails/month**: FREE (if on EC2)
- **62K-1M emails/month**: ~$9-100/month
- **1M+ emails/month**: ~$100+/month

**Example Monthly Cost:**
- 10K emails = FREE (if on EC2) or $1
- **Total: ~$0-1/month**

---

### 11. **Amazon SNS (SMS/Push Notifications)**

**What it does:**
- SMS notifications
- Push notifications (future)

**Cost Structure:**
- **SMS**: $0.00645 per SMS (US)
- **Push**: $0.50 per million

**Scaling:**
- **0-1K SMS/month**: ~$6.45/month
- **1K-10K SMS/month**: ~$6.45-64.50/month

**Example Monthly Cost:**
- 500 SMS = $3.23
- **Total: ~$3/month**

---

### 12. **CloudWatch (Monitoring & Logs)**

**What it does:**
- Logs, metrics, alarms
- Performance monitoring

**Cost Structure:**
- **Free Tier**: 5 GB logs, 10 custom metrics, 1M API requests
- **Paid Tier**:
  - Logs: $0.50 per GB
  - Custom metrics: $0.30 per metric
  - API requests: $0.01 per 1,000

**Scaling:**
- **Small scale**: FREE
- **Medium scale**: ~$5-20/month
- **Large scale**: ~$50-200/month

**Example Monthly Cost:**
- 10 GB logs = $2.50
- 20 custom metrics = $3.00
- **Total: ~$5/month**

---

### 13. **Stripe (Payment Processing)** ⚠️ **NOT AWS - Separate Service**

**What it does:**
- Payment processing for bookings
- Shop purchases (Wear Care merch)
- Round-up donations
- Payment intents and confirmations

**Cost Structure:**
- **Transaction Fees**: 2.9% + $0.30 per successful charge
- **No monthly fees** (pay-as-you-go)
- **Refunds**: Fee is refunded, but $0.30 is not

**Scaling:**
- **0-100 transactions/month**: ~$3-30/month (depends on transaction size)
- **100-1,000 transactions/month**: ~$30-300/month
- **1,000-10,000 transactions/month**: ~$300-3,000/month

**Example Monthly Cost:**
- 50 bookings × $25 average = $1,250 revenue
- Stripe fees: $1,250 × 2.9% + (50 × $0.30) = $36.25 + $15 = **$51.25/month**
- 100 shop orders × $30 average = $3,000 revenue
- Stripe fees: $3,000 × 2.9% + (100 × $0.30) = $87 + $30 = **$117/month**

**Note:** Stripe fees are separate from AWS costs and scale with revenue, not users.

---

## 💰 Total Cost Summary by Scale

### **MVP/Launch (0-1,000 users/month)**
```
AWS Services:
Amplify:        $8/month
AppSync:        FREE
DynamoDB:       FREE
S3:             FREE
Lambda:         FREE
Cognito:        FREE
RDS:            $17/month (or FREE first year)
Rekognition:   FREE
Bedrock:        $0.25/month
SES:            FREE
SNS:            $3/month
CloudWatch:     FREE
─────────────────────────
AWS TOTAL:       ~$28/month (or ~$11/month first year)

External Services:
Stripe:         ~$50-150/month (depends on revenue)
─────────────────────────
GRAND TOTAL:    ~$78-178/month (or ~$61-161/month first year)
```

### **Growth (1,000-10,000 users/month)**
```
Amplify:        $15/month
AppSync:        $4/month
DynamoDB:       $15/month
S3:             $20/month
Lambda:         $10/month
Cognito:        FREE
RDS:            $17/month
Rekognition:    $5/month
Bedrock:        $2.50/month
SES:            $1/month
SNS:            $10/month
CloudWatch:     $5/month
─────────────────────────
TOTAL:          ~$104/month
```

### **Scale (10,000-100,000 users/month)**
```
Amplify:        $150/month
AppSync:        $40/month
DynamoDB:       $150/month
S3:             $300/month
Lambda:         $50/month
Cognito:        $275/month
RDS:            $30/month
Rekognition:    $50/month
Bedrock:        $25/month
SES:            $10/month
SNS:            $65/month
CloudWatch:     $20/month
─────────────────────────
TOTAL:          ~$1,165/month (~$1.17K/month)
```

### **Enterprise (100,000+ users/month)**
```
Amplify:        $500/month
AppSync:        $400/month
DynamoDB:       $800/month
S3:             $1,500/month
Lambda:         $200/month
Cognito:        $2,475/month
RDS:            $120/month
Rekognition:    $500/month
Bedrock:        $250/month
SES:            $100/month
SNS:            $650/month
CloudWatch:     $100/month
─────────────────────────
TOTAL:          ~$7,495/month (~$7.5K/month)
```

---

## 📈 Scaling Patterns

### **Cost per User (Approximate)**
- **0-1K users**: ~$0.03/user/month
- **1K-10K users**: ~$0.01/user/month
- **10K-100K users**: ~$0.012/user/month
- **100K+ users**: ~$0.075/user/month

### **Key Scaling Points**
1. **Cognito free tier (50K MAU)**: Major cost jump at 50K users
2. **DynamoDB on-demand**: Scales linearly, no surprises
3. **S3 storage**: Grows with photo uploads
4. **RDS**: Fixed cost, scales with instance size
5. **Lambda**: Scales automatically, pay per use

---

## 🎯 Cost Optimization Tips

### **Immediate (MVP)**
1. ✅ Use free tiers aggressively
2. ✅ Use RDS free tier (first year)
3. ✅ Use Bedrock Haiku (cheaper than Sonnet)
4. ✅ Use DynamoDB on-demand (no over-provisioning)

### **Growth Phase**
1. ✅ Move to RDS Reserved Instances (save 30-40%)
2. ✅ Use S3 lifecycle policies (move old photos to cheaper storage)
3. ✅ Cache aggressively (AppSync caching)
4. ✅ Batch operations where possible

### **Scale Phase**
1. ✅ Consider DynamoDB provisioned capacity (if steady traffic)
2. ✅ Use CloudFront caching (reduce S3 transfer costs)
3. ✅ Optimize Lambda memory/timeout (reduce compute costs)
4. ✅ Use S3 Intelligent-Tiering (automatic cost optimization)

---

## 🚀 Next Steps for Deployment

### **1. AWS Console Setup (Required)**
- [ ] Enable AWS Bedrock (one-time, in AWS Console)
- [ ] Configure IAM permissions for Lambda functions
- [ ] Set up RDS instance (or use free tier)
- [ ] Configure Stripe keys (if using payments)

### **2. Amplify Deployment**
```bash
# Install Amplify CLI (if not already)
npm install -g @aws-amplify/cli

# Initialize and deploy
amplify init
amplify push
```

### **3. Environment Variables**
Set in AWS Console or Amplify dashboard:
- `BEDROCK_MODEL_ID` (already in code)
- `RDS_SECRET_ARN` (for analytics)
- `STRIPE_SECRET_KEY` (for payments)

### **4. S3 Event Trigger (Optional)**
- Go to S3 → Your bucket → Properties → Event notifications
- Create trigger for `profile-photos/models/` → Lambda `photo-analysis`

### **5. Test the System**
1. Upload a test photo
2. Check CloudWatch logs for Lambda execution
3. Verify auto-tagged attributes appear in database
4. Test matching engine with auto-tagged data

---

## 📊 Monitoring & Alerts

### **Set Up CloudWatch Alarms**
1. **Cost Alerts**: Alert if monthly cost exceeds threshold
2. **Lambda Errors**: Alert on function failures
3. **DynamoDB Throttling**: Alert on capacity issues
4. **RDS CPU**: Alert on high database usage

### **Cost Tracking**
- Use AWS Cost Explorer to track spending
- Set up budgets in AWS Budgets
- Tag resources for cost allocation

---

## 🔒 Security Considerations

### **IAM Permissions**
- Lambda functions need:
  - `rekognition:DetectLabels`
  - `rekognition:DetectFaces`
  - `bedrock:InvokeModel`
  - `s3:GetObject`
  - `dynamodb:PutItem`, `dynamodb:GetItem`
  - `rds-data:ExecuteStatement` (for analytics)

### **Data Encryption**
- S3: Enable encryption at rest
- DynamoDB: Enable encryption at rest
- RDS: Enable encryption at rest
- AppSync: HTTPS only

---

## 📝 Notes

- **Free tiers**: Most services have generous free tiers for MVP
- **On-demand pricing**: Recommended for variable traffic (no over-provisioning)
- **Reserved instances**: Consider for RDS if you have steady traffic
- **Cost per user**: Decreases as you scale (economies of scale)
- **Photo storage**: Largest cost driver at scale (optimize with compression/lifecycle)

---

**Estimated MVP Cost:**
- **AWS Only**: ~$28/month (or ~$11/month first year with RDS free tier)
- **With Stripe**: ~$78-178/month (depends on transaction volume)
- **Note**: Currently using mock data - real AWS costs will apply when deployed

---

## 📋 Current Implementation Status

### **Mock Data Phase (Current)**
- ✅ Full integration flow working with mock data
- ✅ All portals connected and functional
- ✅ Matching engine operational
- ✅ Booking system complete
- ✅ Notification system (mock)
- ⏳ **AWS costs: $0** (not deployed yet)

### **Production Deployment (When Ready)**
- [ ] Deploy to AWS Amplify
- [ ] Connect to real DynamoDB
- [ ] Set up Lambda functions
- [ ] Configure Stripe keys
- [ ] Enable Rekognition/Bedrock
- [ ] Set up RDS for analytics
- [ ] Configure SES/SNS for notifications

