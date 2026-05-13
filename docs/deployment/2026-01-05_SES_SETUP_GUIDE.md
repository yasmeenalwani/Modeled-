# AWS SES (Simple Email Service) Setup Guide
*Created: 2026-01-05*

## 🎯 Goal

Set up AWS SES to send transactional emails (notifications, confirmations, reminders) for Modeled Management.

---

## 📋 Prerequisites

- AWS account with SES access
- Domain name (recommended) or email address to verify
- Lambda function `notifications` deployed

---

## 🚀 Setup Steps

### **Step 1: Choose Verification Method**

You have two options:

#### **Option A: Verify Email Address (Quick Start - Development)**
- ✅ Fast setup (minutes)
- ✅ Good for testing/development
- ❌ Limited to one email address
- ❌ Must stay in SES sandbox (can only send to verified emails)

#### **Option B: Verify Domain (Production - Recommended)**
- ✅ Can send from any email on domain (noreply@, support@, etc.)
- ✅ Can move out of sandbox
- ✅ Better deliverability
- ❌ Requires DNS access
- ❌ Takes longer to set up

**For MVP:** Start with Option A (email verification), then move to Option B (domain verification) for production.

---

## 📧 Option A: Email Address Verification (Quick Start)

### **Step 1.1: Verify Email Address**

1. **Go to SES Console**
   - Navigate to AWS Console → SES → Verified identities
   - Click "Create identity"

2. **Select Email Address**
   - Choose "Email address"
   - Enter: `noreply@modeledmanagement.com` (or your email)
   - Click "Create identity"

3. **Check Email**
   - AWS sends verification email
   - Click verification link in email
   - Status changes to "Verified"

### **Step 1.2: Update Lambda Environment Variable**

Update `amplify/functions/notifications/resource.ts`:
```typescript
environment: {
  FROM_EMAIL: 'noreply@modeledmanagement.com', // Your verified email
  FROM_NAME: 'Modeled Management',
  SES_REGION: 'us-east-1',
}
```

### **Step 1.3: Verify Recipient Emails (Sandbox Mode)**

**Important:** In sandbox mode, you can only send to verified email addresses.

1. **Verify Test Recipients**
   - Go to SES → Verified identities
   - Verify your test email addresses
   - Verify admin email address

2. **Test Email Sending**
   ```bash
   # Test via Lambda
   aws lambda invoke \
     --function-name notifications-* \
     --payload '{
       "type": "email",
       "template": "booking_confirmed",
       "recipient": {
         "email": "your-verified-email@example.com",
         "name": "Test User"
       },
       "data": {
         "serviceType": "Haircut",
         "professionalName": "Sarah M.",
         "appointmentDate": "2026-01-15",
         "appointmentTime": "10:00 AM",
         "location": "123 Main St"
       }
     }' \
     response.json
   
   cat response.json
   ```

---

## 🌐 Option B: Domain Verification (Production)

### **Step 2.1: Verify Domain**

1. **Go to SES Console**
   - Navigate to SES → Verified identities
   - Click "Create identity"

2. **Select Domain**
   - Choose "Domain"
   - Enter: `modeledmanagement.com` (your domain)
   - Click "Create identity"

3. **Add DNS Records**
   - AWS provides DNS records to add
   - You'll need to add:
     - **TXT record** (for domain verification)
     - **CNAME records** (for DKIM signing - optional but recommended)
     - **MX record** (for receiving emails - optional)

4. **Add Records to DNS**
   - Go to your domain registrar (GoDaddy, Route 53, etc.)
   - Add the provided DNS records
   - Wait for DNS propagation (5-60 minutes)

5. **Verify Domain**
   - Return to SES Console
   - Click "Verify" or wait for automatic verification
   - Status changes to "Verified"

### **Step 2.2: Configure DKIM (Recommended)**

DKIM (DomainKeys Identified Mail) improves email deliverability:

1. **Enable DKIM**
   - In SES → Verified identities → Your domain
   - Scroll to "DKIM signing"
   - Click "Edit"
   - Select "Easy DKIM"
   - Click "Save"

2. **Add DKIM CNAME Records**
   - AWS provides 3 CNAME records
   - Add them to your DNS
   - Wait for verification (can take up to 72 hours)

### **Step 2.3: Set Up SPF Record (Recommended)**

SPF (Sender Policy Framework) authorizes AWS to send emails from your domain:

1. **Add SPF TXT Record**
   - In your DNS, add:
   ```
   Type: TXT
   Name: @ (or your domain)
   Value: v=spf1 include:amazonses.com ~all
   ```

2. **Verify**
   - Use online SPF checker to verify

### **Step 2.4: Set Up DMARC (Optional but Recommended)**

DMARC (Domain-based Message Authentication) provides additional security:

1. **Add DMARC TXT Record**
   ```
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@modeledmanagement.com
   ```

---

## 🚪 Step 3: Move Out of SES Sandbox

**Important:** In sandbox mode, you can only send to verified email addresses. For production, you need to request production access.

### **Request Production Access**

1. **Go to SES Console**
   - Navigate to SES → Account dashboard
   - Click "Request production access"

2. **Fill Out Request Form**
   - **Mail Type:** Transactional
   - **Website URL:** Your website URL
   - **Use case description:**
     ```
     Modeled Management is a platform connecting beauty models with 
     professionals. We send transactional emails including:
     - Welcome emails for new users
     - Booking confirmations
     - Appointment reminders
     - Match notifications
     - Profile approval/rejection notifications
     ```
   - **Expected sending volume:** Estimate (e.g., 1,000-10,000 emails/month initially)
   - **How you'll handle bounces/complaints:** 
     ```
     We will monitor bounce and complaint rates via CloudWatch. 
     Users can unsubscribe via email preferences in their portal.
     We will remove bounced emails from our database.
     ```
   - **Click "Submit request"**

3. **Wait for Approval**
   - Usually approved within 24-48 hours
   - AWS may ask for additional information
   - You'll receive email when approved

### **Alternative: Stay in Sandbox (Development Only)**

If you're in development and only need to send to a few test emails:
- Keep sandbox mode
- Verify all test recipient emails
- Move to production when ready

---

## 🔐 Step 4: Configure IAM Permissions

The Lambda function needs permissions to send emails via SES.

### **Check Current Permissions**

The Lambda execution role should have:
- `ses:SendEmail`
- `ses:SendRawEmail` (if using attachments)

### **Add Permissions via AWS Console**

1. **Go to Lambda Console**
   - Navigate to Lambda → `notifications-*` function
   - Configuration → Permissions
   - Click on the execution role

2. **Add SES Policy**
   - Click "Add permissions" → "Create inline policy"
   - JSON tab, paste:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ses:SendEmail",
           "ses:SendRawEmail"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
   - Name: `SES-SendEmail-Policy`
   - Click "Create policy"

### **Verify Permissions**

```bash
# Test Lambda has SES permissions
aws lambda invoke \
  --function-name notifications-* \
  --payload '{"type": "email", "template": "test", "recipient": {"email": "test@example.com", "name": "Test"}}' \
  response.json
```

---

## 🧪 Step 5: Test Email Sending

### **Test 1: Send Test Email via Lambda**

```bash
# Test booking confirmation email
aws lambda invoke \
  --function-name notifications-* \
  --payload '{
    "type": "email",
    "template": "booking_confirmed",
    "recipient": {
      "email": "your-verified-email@example.com",
      "name": "Test User"
    },
    "data": {
      "bookingId": "test-123",
      "serviceType": "Haircut",
      "professionalName": "Sarah M.",
      "appointmentDate": "2026-01-15",
      "appointmentTime": "10:00 AM",
      "location": "123 Main St, New York, NY"
    }
  }' \
  response.json

cat response.json
```

### **Test 2: Send Test Email via AWS Console**

1. **Go to SES Console**
   - Navigate to SES → Verified identities
   - Select your verified email/domain
   - Click "Send test email"

2. **Compose Test Email**
   - **From:** Your verified email
   - **To:** Verified recipient email
   - **Subject:** Test Email
   - **Body:** Test content
   - Click "Send test email"

3. **Check Email**
   - Check recipient inbox
   - Check spam folder if not received

### **Test 3: Test from Application**

1. **Trigger Notification from App**
   - Create a test booking
   - Accept a match
   - Complete onboarding

2. **Check CloudWatch Logs**
   ```bash
   aws logs tail /aws/lambda/notifications --follow
   ```

3. **Verify Email Received**
   - Check recipient inbox
   - Verify email content and formatting

---

## 📊 Step 6: Monitor and Configure

### **Set Up CloudWatch Alarms**

Monitor email sending health:

1. **Go to CloudWatch**
   - Navigate to CloudWatch → Alarms
   - Create alarm

2. **Configure Alarm**
   - **Metric:** SES → Reputation metrics → Bounce rate
   - **Threshold:** > 5% bounce rate
   - **Action:** Send to SNS topic (email alert)

3. **Create Additional Alarms**
   - Complaint rate > 0.1%
   - Send quota usage > 80%
   - Rejection rate > 1%

### **Configure Sending Limits**

1. **Check Current Limits**
   - SES Console → Account dashboard
   - View "Sending statistics"

2. **Request Limit Increase (if needed)**
   - Click "Request limit increase"
   - Specify new sending rate
   - Usually approved quickly

### **Set Up Bounce/Complaint Handling**

1. **Configure SNS Topics**
   - SES Console → Configuration → Notifications
   - Create SNS topics for:
     - Bounces
     - Complaints
     - Deliveries (optional)

2. **Subscribe to Topics**
   - Subscribe your email to receive notifications
   - Handle bounces/complaints automatically

3. **Implement Bounce Handling**
   - Create Lambda function to process bounces
   - Remove bounced emails from database
   - Update user status

---

## 🔒 Security Best Practices

### **1. Use IAM Roles (Not Access Keys)**
- ✅ Lambda uses execution role (already configured)
- ❌ Don't hardcode AWS credentials

### **2. Restrict SES Permissions**
- Only grant `ses:SendEmail` to specific resources
- Use resource-based policies if possible

### **3. Enable Encryption**
- Use HTTPS for API calls
- Encrypt sensitive data in transit

### **4. Monitor Access**
- Enable CloudTrail for SES API calls
- Monitor for unauthorized access

### **5. Rate Limiting**
- Implement rate limiting in application
- Respect SES sending limits
- Use SES sending quotas

---

## 📧 Email Template Configuration

### **Current Templates**

The notifications function includes these templates:
- `booking_confirmed`
- `booking_reminder`
- `match_opportunity`
- `payment_required`
- `payment_reminder`

See `amplify/functions/notifications/handler.ts` for all templates.

### **Customize Templates**

1. **Edit Handler**
   - Open `amplify/functions/notifications/handler.ts`
   - Find `getEmailTemplate()` function
   - Modify HTML/text templates

2. **Add New Templates**
   - Add new template to `templates` object
   - Use existing templates as reference

3. **Test Templates**
   - Send test emails with new templates
   - Verify rendering in different email clients

---

## 🐛 Troubleshooting

### **Issue: "Email address not verified"**

**Solution:**
- Verify the FROM_EMAIL in SES Console
- Verify recipient email (if in sandbox)
- Check Lambda environment variable matches verified email

### **Issue: "Message rejected"**

**Possible Causes:**
- Sending from unverified email/domain
- In sandbox mode, sending to unverified recipient
- Domain not properly configured (SPF/DKIM)

**Solution:**
- Verify email/domain in SES
- Check DNS records
- Request production access if needed

### **Issue: "Access Denied"**

**Solution:**
- Check Lambda execution role has `ses:SendEmail` permission
- Verify IAM policy is attached
- Check CloudWatch logs for detailed error

### **Issue: "Emails going to spam"**

**Solution:**
- Set up SPF record
- Configure DKIM
- Set up DMARC
- Use verified domain (not just email)
- Avoid spam trigger words
- Include unsubscribe link

### **Issue: "Rate limit exceeded"**

**Solution:**
- Check current sending quota
- Request limit increase
- Implement rate limiting in application
- Use SES sending quotas feature

---

## ✅ Success Criteria

- [ ] Email address or domain verified in SES
- [ ] Lambda function has SES permissions
- [ ] Test email sent successfully
- [ ] Email received in inbox (not spam)
- [ ] Production access requested (if needed)
- [ ] SPF/DKIM configured (if using domain)
- [ ] CloudWatch alarms configured
- [ ] Bounce/complaint handling set up

---

## 📝 Next Steps

1. **Production Access**
   - Request production access when ready
   - Monitor bounce/complaint rates
   - Set up automated bounce handling

2. **Domain Configuration**
   - Set up SPF, DKIM, DMARC
   - Improve deliverability
   - Monitor reputation

3. **Template Refinement**
   - Test templates in different email clients
   - Optimize for mobile
   - A/B test subject lines

4. **Analytics**
   - Track open rates (requires tracking pixels)
   - Track click rates
   - Monitor bounce/complaint rates

---

## 🔗 Quick Reference

### **SES Console Links**
- [SES Console](https://console.aws.amazon.com/ses/)
- [Verified Identities](https://console.aws.amazon.com/ses/home#/verified-identities)
- [Account Dashboard](https://console.aws.amazon.com/ses/home#/account)
- [Sending Statistics](https://console.aws.amazon.com/ses/home#/account/sending-statistics)

### **Useful Commands**

```bash
# List verified identities
aws ses list-identities

# Get identity verification status
aws ses get-identity-verification-attributes \
  --identities noreply@modeledmanagement.com

# Get sending quota
aws ses get-send-quota

# Get sending statistics
aws ses get-send-statistics
```

---

**Last Updated:** 2026-01-05  
**Status:** Ready for Setup

