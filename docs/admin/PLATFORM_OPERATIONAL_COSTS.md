# Modeled — Full Platform Operational Costs

**Complete AWS cost breakdown for the entire Modeled platform — auth, data, storage, AI, notifications, scheduled jobs, and hosting.**

---

## 1. Platform Architecture (Cost-Generating Services)

| Category | AWS Services | Purpose |
|----------|--------------|---------|
| **Auth** | Cognito | User pools, groups (Model, Professional, Partner, Admin) |
| **Data** | AppSync + DynamoDB | GraphQL API, 40+ entity types |
| **Storage** | S3 | Profile photos, portfolios, identity docs, session photos, videos |
| **Compute** | Lambda | 15+ functions (photo-analysis, identity, Stripe, notifications, scheduled jobs) |
| **API** | API Gateway | Identity verification REST endpoint |
| **AI/ML** | Rekognition, Bedrock | Photo analysis, identity verification |
| **Notifications** | SES, Pinpoint | Email, SMS, in-app |
| **Hosting** | Amplify Hosting | Frontend (React) |
| **Payments** | Stripe | External; no AWS cost |

---

## 2. Per-Unit Pricing (US East / On-Demand)

| Service | Unit | Price |
|---------|------|-------|
| **Cognito** | MAU (Lite) | First 10K free, then $0.0055/MAU |
| **AppSync** | 1M operations | $4.00 |
| **DynamoDB** | 1M write requests | $0.625 |
| **DynamoDB** | 1M read requests | $0.125 |
| **DynamoDB** | Storage | $0.25/GB-month (first 25 GB free) |
| **S3** | Storage | $0.023/GB-month |
| **S3** | PUT (1K requests) | $0.005 |
| **S3** | GET (1K requests) | $0.0004 |
| **Lambda** | 1M requests | $0.20 |
| **Lambda** | GB-second | $0.0000166667 |
| **API Gateway** | 1M requests | $3.50 |
| **Rekognition** | Image (Group 1/2) | $0.001/image |
| **Bedrock** | Claude 3 Haiku | ~$0.00125/photo |
| **SES** | 1K emails | $0.10 |
| **Pinpoint** | 1K SMS (US) | ~$0.00645 |
| **Amplify Hosting** | Build min | $0.01/min (Standard) |
| **Amplify Hosting** | Data transfer | 15 GB free, then $0.15/GB |
| **Amplify Hosting** | Storage | 5 GB free, then $0.023/GB |

---

## 3. Estimated Usage per Scale Tier

**Assumptions:**
- **MAU** = Models + Professionals + Partners + Admin (active in 30 days)
- **AppSync ops** = ~50 ops/user/month (portal) + 200 ops/admin + onboarding spikes
- **DynamoDB** = ~2 reads + 1 write per AppSync op (Amplify Data pattern)
- **S3** = 6 photos/model (~2 MB each), identity docs (~1 MB/user), portfolios
- **Scheduled Lambdas** = 12 functions, mix of daily/hourly: ~15K invocations/month baseline
- **Emails** = Match notifications, reminders, booking confirmations: ~3 per active user/month

---

## 4. Full Cost Matrix by Scale

### MVP (25 models, 50 pros, 5 partners, 1 admin)

| Service | Usage | Cost/Mo |
|---------|-------|---------|
| **Cognito** | 81 MAU (free tier) | $0 |
| **AppSync** | ~8K ops | $0.03 |
| **DynamoDB** | ~24K reads, ~8K writes, 0.5 GB | $0.01 |
| **S3** | 0.5 GB storage, 500 PUT, 5K GET | $0.02 |
| **Lambda** | 165 photo + 75 identity + 15K scheduled + 200 misc | $0.05 |
| **API Gateway** | 75 invocations | $0 |
| **Rekognition** | 165×4 + 75 identity | $0.74 |
| **Bedrock** | 165 photos | $0.21 |
| **SES** | ~250 emails | $0.03 |
| **Amplify** | 20 build min, 5 GB transfer | $0.20 |
| **TOTAL** | | **~$1.30** |

### Launch (100 models, 200 pros, 20 partners, 2 admins)

| Service | Usage | Cost/Mo |
|---------|-------|---------|
| **Cognito** | 322 MAU (free tier) | $0 |
| **AppSync** | ~25K ops | $0.10 |
| **DynamoDB** | ~75K reads, ~25K writes, 2 GB | $0.07 |
| **S3** | 2 GB storage, 2K PUT, 25K GET | $0.08 |
| **Lambda** | 660 photo + 300 identity + 18K scheduled + 500 misc | $0.25 |
| **API Gateway** | 300 invocations | $0 |
| **Rekognition** | 660×4 + 300 identity | $2.94 |
| **Bedrock** | 660 photos | $0.83 |
| **SES** | ~1K emails | $0.10 |
| **Amplify** | 30 build min, 10 GB transfer | $0.30 |
| **TOTAL** | | **~$4.90** |

### Growth (500 models, 500 pros, 50 partners, 3 admins)

| Service | Usage | Cost/Mo |
|---------|-------|---------|
| **Cognito** | 1,053 MAU (free tier) | $0 |
| **AppSync** | ~80K ops | $0.32 |
| **DynamoDB** | ~240K reads, ~80K writes, 8 GB | $0.28 |
| **S3** | 8 GB storage, 8K PUT, 80K GET | $0.25 |
| **Lambda** | 3.3K photo + 1K identity + 25K scheduled + 2K misc | $0.90 |
| **API Gateway** | 1K invocations | $0 |
| **Rekognition** | 3.3K×4 + 1K identity | $14.20 |
| **Bedrock** | 3,300 photos | $4.13 |
| **SES** | ~3.5K emails | $0.35 |
| **Amplify** | 50 build min, 25 GB transfer | $0.65 |
| **TOTAL** | | **~$21** |

### Scale (2,000 models, 1,000 pros, 100 partners, 5 admins)

| Service | Usage | Cost/Mo |
|---------|-------|---------|
| **Cognito** | 3,105 MAU (free tier) | $0 |
| **AppSync** | ~250K ops | $1.00 |
| **DynamoDB** | ~750K reads, ~250K writes, 25 GB | $0.82 |
| **S3** | 25 GB storage, 30K PUT, 250K GET | $0.75 |
| **Lambda** | 13.2K photo + 3K identity + 35K scheduled + 5K misc | $2.90 |
| **API Gateway** | 3K invocations | $0.01 |
| **Rekognition** | 13.2K×4 + 3K identity | $55.80 |
| **Bedrock** | 13,200 photos | $16.50 |
| **SES** | ~12K emails | $1.20 |
| **Amplify** | 80 build min, 60 GB transfer | $1.85 |
| **TOTAL** | | **~$81** |

### Enterprise (10,000 models, 5,000 pros, 500 partners, 10 admins)

| Service | Usage | Cost/Mo |
|---------|-------|---------|
| **Cognito** | 15,510 MAU | $30 |
| **AppSync** | ~1.2M ops | $4.80 |
| **DynamoDB** | ~3.6M reads, ~1.2M writes, 80 GB | $2.80 |
| **S3** | 80 GB storage, 120K PUT, 1M GET | $2.50 |
| **Lambda** | 66K photo + 15K identity + 50K scheduled + 15K misc | $14.00 |
| **API Gateway** | 15K invocations | $0.05 |
| **Rekognition** | 66K×4 + 15K identity | $279 |
| **Bedrock** | 66,000 photos | $82.50 |
| **SES** | ~50K emails | $5.00 |
| **Amplify** | 120 build min, 150 GB transfer | $4.50 |
| **TOTAL** | | **~$426** |

*Cognito free tier: 10K MAU. Enterprise exceeds that.*

---

## 5. Cost Summary Table

| Scale | Models | Pros | MAU | **Total AWS/Mo** | **Per Model** |
|-------|--------|-----|-----|------------------|---------------|
| **MVP** | 25 | 50 | 81 | **~$1.30** | ~$0.05 |
| **Launch** | 100 | 200 | 322 | **~$4.90** | ~$0.05 |
| **Growth** | 500 | 500 | 1,053 | **~$21** | ~$0.04 |
| **Scale** | 2,000 | 1,000 | 3,105 | **~$81** | ~$0.04 |
| **Enterprise** | 10,000 | 5,000 | 15,510 | **~$426** | ~$0.04 |

---

## 6. Cost by Category (Typical Split at Growth Tier)

| Category | % of Total | Main Drivers |
|----------|------------|--------------|
| **AI/ML** (Rekognition + Bedrock) | ~87% | Photo analysis, identity verification |
| **Compute** (Lambda) | ~4% | Photo-analysis, scheduled jobs |
| **Data** (AppSync + DynamoDB) | ~3% | GraphQL ops, storage |
| **Hosting** (Amplify) | ~3% | Builds, CDN |
| **Storage** (S3) | ~1% | Photos, documents |
| **Other** (Cognito, SES, API GW) | ~2% | Auth, email |

*At scale, AI/ML remains the dominant cost (~85–90%).*

---

## 7. Lambda Functions (Scheduled / Event-Driven)

| Function | Trigger | Est. Invocations/Mo (Growth) |
|----------|---------|------------------------------|
| photo-analysis | S3 upload | 3,300 |
| identity-verification | API call | 1,000 |
| stripe-payment | Webhook | 500 |
| notifications | EventBridge / invoke | 2,000 |
| matchExpiration | Schedule (daily) | 30 |
| bookingReminders | Schedule (daily) | 30 |
| modelPaymentReminders | Schedule (daily) | 30 |
| chatActivation | Schedule (hourly) | 720 |
| autoMatching | Schedule / event | 100 |
| agenticDecay | Schedule (daily) | 30 |
| pinpointCampaigns | Schedule | 20 |
| pinpointSegments | Schedule | 20 |
| crmOutreach | Schedule | 30 |
| crmFollowups | Schedule | 30 |
| dynamodbSync | DynamoDB Streams | 500 |
| analyticsApi | On-demand | 200 |

---

## 8. Not Included / Add Separately

| Item | Notes |
|------|-------|
| **RDS** (analytics) | If analytics-api uses PostgreSQL; ~$15–50/mo for db.t3.micro |
| **Stripe** | Payment processing; % of transactions (not AWS) |
| **Third-party APIs** | Geocoding, etc. |
| **CloudWatch** | Logs, metrics; usually minimal |
| **Data transfer** | Out to internet; first 100 GB free |

---

## 9. Optimization Levers

| Lever | Impact |
|-------|--------|
| **Rekognition-only (no Bedrock)** | Save ~22% of AI cost; lower hair/beauty fidelity |
| **Batch inference (Bedrock)** | Up to ~50% off Bedrock at volume |
| **Cognito Lite tier** | Lower MAU cost vs Essentials |
| **Amplify SSR** | If using; 500K requests free |
| **Reserved capacity** | DynamoDB, Lambda (Savings Plans) |
| **S3 lifecycle** | Move old photos to IA/Glacier |

---

## 10. Quick Reference

| Question | Answer |
|----------|--------|
| MVP (25 models) monthly cost? | **~$1.30** |
| Launch (100 models) monthly cost? | **~$5** |
| Growth (500 models) monthly cost? | **~$21** |
| Scale (2K models) monthly cost? | **~$81** |
| Enterprise (10K models) monthly cost? | **~$426** |
| Largest cost driver? | Rekognition + Bedrock (~87%) |
| Cost per model onboarded? | ~$0.04 platform + ~$0.03 AI = **~$0.07** |
