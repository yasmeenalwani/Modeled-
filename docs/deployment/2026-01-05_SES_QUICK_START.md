# SES Quick Start Guide
*Created: 2026-01-05*

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Verify Email Address**

**Option A: AWS Console**
1. Go to [SES Console](https://console.aws.amazon.com/ses/) → Verified identities
2. Click "Create identity" → "Email address"
3. Enter: `noreply@modeledmanagement.com`
4. Click "Create identity"
5. Check email and click verification link

**Option B: PowerShell Script**
```powershell
.\scripts\setup-ses-email-verification.ps1 -EmailAddress "noreply@modeledmanagement.com"
```

### **Step 2: Update Lambda Environment Variable**

Edit `amplify/functions/notifications/resource.ts`:
```typescript
environment: {
  FROM_EMAIL: 'noreply@modeledmanagement.com', // Your verified email
  FROM_NAME: 'Modeled Management',
  SES_REGION: 'us-east-1',
}
```

### **Step 3: Deploy**

```bash
npx ampx sandbox
```

### **Step 4: Test**

```powershell
.\scripts\test-ses-email.ps1 -ToEmail "your-verified-email@example.com"
```

---

## ⚠️ Important Notes

### **SES Sandbox Mode**

By default, SES is in "sandbox mode":
- ✅ Can send FROM verified email addresses
- ❌ Can only send TO verified email addresses
- ✅ Good for development/testing
- ❌ Not suitable for production

### **Moving to Production**

1. Go to SES Console → Account dashboard
2. Click "Request production access"
3. Fill out form (see full guide)
4. Wait for approval (24-48 hours)

---

## 📚 Full Documentation

See `docs/deployment/2026-01-05_SES_SETUP_GUIDE.md` for:
- Domain verification
- DKIM/SPF/DMARC setup
- Production access request
- Troubleshooting
- Best practices

---

**Last Updated:** 2026-01-05

