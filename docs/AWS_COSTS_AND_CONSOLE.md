# AWS Costs & Console – Modeled Management

## Are you paying for these services?

**Yes.** Once you deploy the Amplify backend (`npx amplica sandbox` or `amplify deploy`), AWS bills you for the resources it creates. Until you deploy, nothing is running and there are no charges.

## What’s in the AWS Console?

After deployment, you’ll see these in the AWS Console:

| Service | Where in Console | What it does |
|---------|------------------|--------------|
| **Cognito** | Cognito → User pools | Auth (login, groups) |
| **AppSync** | AppSync → APIs | GraphQL API |
| **DynamoDB** | DynamoDB → Tables | Data storage |
| **S3** | S3 → Buckets | File storage |
| **Lambda** | Lambda → Functions | Backend logic |
| **EventBridge** | EventBridge → Rules | Scheduled triggers |
| **API Gateway** | API Gateway → APIs | REST APIs (e.g. Stripe) |
| **Secrets Manager** | Secrets Manager | Stripe keys, etc. |
| **SES** | SES → Verified identities | Email sending |
| **SNS** | SNS → Topics | SMS sending |

## Rough cost ranges (early usage)

| Service | Free tier | Typical early cost |
|---------|-----------|---------------------|
| Cognito | 50K MAU free | $0 |
| AppSync | 250K ops/mo free | $0–5/mo |
| DynamoDB | 25 GB, 25 WCU/RCU free | $0–5/mo |
| S3 | 5 GB free | $0–2/mo |
| Lambda | 1M requests/mo free | $0 |
| EventBridge | 14M events/mo free | $0 |
| SES | 62K emails/mo (from EC2) | $0 |
| SNS | 1M publishes free | $0 |

**Overall:** Often **$0–15/month** at low usage. As traffic grows, expect **$15–60/month** or more.

## How to see your costs

1. **AWS Billing Dashboard**  
   AWS Console → Billing and Cost Management → Cost Explorer

2. **Cost Explorer**  
   View costs by service, time range, etc.

3. **Budgets**  
   Set a monthly budget and get alerts when you approach it.

## What’s deployed vs. configured

- **Deployed:** Cognito, AppSync, DynamoDB, S3, Lambda, EventBridge rules (from `schedule` in `defineFunction`).
- **Configured manually:** Stripe API Gateway, Stripe webhook URL, Secrets Manager entries, SES verification.

## Reducing costs

- Use **Amplify Sandbox** for local/dev; it creates real AWS resources but you can tear them down.
- Turn off or delete sandbox when not developing.
- Use **DynamoDB on-demand** (default) so you pay per request.
- Monitor Billing and Cost Management regularly.
