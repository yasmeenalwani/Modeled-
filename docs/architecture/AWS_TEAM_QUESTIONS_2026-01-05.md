# 🤔 Questions for AWS Team Meeting

## Overview
**Platform**: Modeled Management - Beauty/Hair Model Matching Platform  
**Tech Stack**: AWS Amplify Gen 2, Cognito, AppSync, DynamoDB, RDS, S3, Lambda, SES, SNS, Stripe

---

## 💰 Cost Management & Optimization

### **1. Cost Estimation**
- What's a realistic monthly cost estimate for our current setup (Amplify, DynamoDB, RDS, Lambda, S3, SES, SNS)?
- At what user scale (models, professionals, bookings) should we expect cost increases?
- Are there any AWS cost optimization programs or credits for startups we should know about?

### **2. DynamoDB Costs**
- What's the best pricing strategy for DynamoDB? On-demand vs provisioned capacity?
- How can we optimize DynamoDB costs as we scale?
- Should we use DynamoDB Streams for RDS sync, or is there a better approach?

### **3. RDS Costs**
- For our analytics use case (admin dashboards, trends, revenue), what's the most cost-effective RDS instance type?
- Can we use RDS Serverless for cost savings, or should we stick with provisioned?
- What's the best backup/retention strategy to balance cost and data safety?

### **4. Lambda Costs**
- How can we optimize Lambda cold starts and costs?
- Should we use Lambda provisioned concurrency for payment processing?
- What's the best approach for Lambda timeout/retry for Stripe webhooks?

### **5. S3 Storage Costs**
- What's the best S3 storage class for profile photos vs session photos?
- Should we implement lifecycle policies to move old photos to cheaper storage?
- What's the cost impact of S3 for video storage (if we add that later)?

---

## 🔒 Security & Compliance

### **6. Cognito Best Practices**
- Are there any security best practices we should implement for Cognito user pools?
- How should we handle password policies and MFA for different user groups (Models, Professionals, Admins)?
- What's the best approach for handling user data deletion requests (GDPR compliance)?

### **7. Secrets Management**
- Should we use AWS Secrets Manager or Parameter Store for Stripe keys and RDS credentials?
- What's the cost difference between the two?
- How do we rotate secrets securely?

### **8. Data Encryption**
- Are DynamoDB tables encrypted at rest by default?
- Should we enable encryption for S3 buckets beyond default?
- Do we need to encrypt data in transit between services?

### **9. Access Control**
- Are our AppSync authorization rules sufficient, or should we add additional IAM policies?
- How can we audit who's accessing what data (CloudTrail setup)?

---

## 📊 Monitoring & Observability

### **10. CloudWatch Setup**
- What CloudWatch metrics should we prioritize for cost monitoring?
- Should we set up custom dashboards or use AWS's default ones?
- What's the best alerting strategy for billing thresholds?

### **11. Error Tracking**
- What's the best way to track and alert on Lambda errors?
- Should we use CloudWatch Logs Insights or a third-party tool (Sentry, etc.)?
- How do we monitor AppSync API errors?

### **12. Performance Monitoring**
- How do we monitor DynamoDB performance (read/write capacity, throttling)?
- What metrics should we track for AppSync API latency?
- How can we identify performance bottlenecks as we scale?

---

## 🚀 Scaling & Performance

### **13. DynamoDB Scaling**
- How does DynamoDB auto-scaling work, and when should we enable it?
- What's the best partition key strategy for our tables (ModelProfile, Booking, Match)?
- How do we handle hot partitions as we grow?

### **14. AppSync Scaling**
- What are AppSync's scaling limits?
- How do we handle GraphQL query complexity and rate limiting?
- Should we implement caching for frequently accessed data?

### **15. Lambda Scaling**
- How do Lambda concurrent executions work, and what are the limits?
- Should we use reserved concurrency for critical functions (Stripe payments)?
- How do we handle Lambda timeouts for long-running operations?

### **16. RDS Scaling**
- When should we scale up RDS instances vs use read replicas?
- Can we use RDS Proxy for connection pooling?
- What's the best approach for RDS failover and high availability?

---

## 🔄 Data Sync & Architecture

### **17. DynamoDB to RDS Sync**
- Is DynamoDB Streams the best approach for syncing to RDS, or should we use EventBridge?
- How do we handle sync failures and retries?
- Should we sync all data or only specific tables/fields?

### **18. Real-time Updates**
- How do AppSync subscriptions work for real-time updates (booking status changes)?
- What's the cost of AppSync subscriptions?
- Should we use WebSockets or AppSync subscriptions for real-time features?

---

## 📧 Notifications (SES & SNS)

### **19. SES Setup**
- What's the process for moving SES out of sandbox mode?
- How do we handle email bounces and complaints?
- What's the best approach for email templates and personalization?

### **20. SNS SMS**
- What are SNS SMS pricing and limits?
- How do we handle SMS delivery failures?
- Should we use SNS or a third-party service (Twilio) for SMS?

### **21. Notification Reliability**
- How do we ensure notifications are delivered reliably?
- Should we implement retry logic for failed notifications?
- How do we track notification delivery rates?

---

## 💳 Payment Processing (Stripe Integration)

### **22. Lambda Security**
- How do we securely handle Stripe webhooks in Lambda?
- Should we use API Gateway or direct Lambda invocation for Stripe?
- How do we prevent webhook replay attacks?

### **23. Payment Error Handling**
- What's the best retry strategy for failed Stripe API calls?
- How do we handle partial refunds and payment disputes?
- Should we log payment data for compliance/auditing?

---

## 🗄️ Database Strategy

### **24. Hybrid Approach (DynamoDB + RDS)**
- Is our hybrid approach (DynamoDB for operational, RDS for analytics) the right strategy?
- When should we consider migrating more data to RDS?
- How do we handle data consistency between the two databases?

### **24b. Architecture Framework Discussion**
- AWS suggested: RDS as primary DB, API Gateway + Lambda, separate Cognito pools
- We're using: DynamoDB + RDS hybrid, AppSync + GraphQL, single Cognito pool with groups
- Should we pivot to their framework, or is our Amplify Gen 2 approach appropriate?
- What are the trade-offs between the two approaches for our use case?

### **25. Backup & Recovery**
- What's the best backup strategy for DynamoDB?
- How do we handle point-in-time recovery for RDS?
- What's our disaster recovery plan?

---

## 🛠️ Development & Deployment

### **26. Amplify Gen 2**
- Are there any known limitations or gotchas with Amplify Gen 2 we should be aware of?
- How do we handle environment-specific configurations (dev, staging, prod)?
- What's the best CI/CD approach for Amplify deployments?

### **27. Local Development**
- How do we test Lambda functions locally?
- Can we run DynamoDB locally for development?
- What's the best approach for local AppSync testing?

### **28. Deployment Strategy**
- Should we use Amplify hosting or deploy frontend separately?
- How do we handle zero-downtime deployments?
- What's the best approach for database migrations?

---

## 📈 Future Considerations

### **29. Video Storage**
- If we add video uploads later, what's the best AWS service (S3, CloudFront, MediaConvert)?
- What are the cost implications of video storage and streaming?
- Should we use external services (YouTube, Vimeo) instead?

### **30. Advanced Features**
- Should we consider AWS Step Functions for complex workflows (matching process)?
- Is EventBridge useful for our use case (event-driven architecture)?
- Should we use AWS Batch for any heavy processing (analytics calculations)?

### **31. Multi-Region**
- When should we consider multi-region deployment?
- How do we handle data replication across regions?
- What are the cost implications?

---

## 🆘 Support & Resources

### **32. AWS Support**
- What AWS support plan should we consider (Basic, Developer, Business)?
- Are there any AWS startup programs or credits we qualify for?
- How do we get help with technical issues?

### **33. Documentation & Training**
- What AWS training resources are best for our team?
- Are there Amplify-specific resources or communities?
- What AWS certifications would be most valuable?

---

## ✅ Quick Checklist for Meeting

**Bring these to the meeting:**
- [ ] Current AWS account details
- [ ] Expected user scale (models, professionals, bookings/month)
- [ ] Budget constraints
- [ ] Timeline for launch
- [ ] List of critical features (payments, matching, notifications)

**Ask about:**
- [ ] Cost optimization strategies
- [ ] Security best practices
- [ ] Scaling recommendations
- [ ] Support options
- [ ] Startup programs/credits

---

## 📝 Notes Section

_Use this space to take notes during the meeting:_

---

**Good luck with your AWS team meeting!** 🚀

