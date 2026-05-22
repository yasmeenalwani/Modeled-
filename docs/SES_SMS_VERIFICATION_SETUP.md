# SES and SMS Setup for Email & Text Verification

Cognito sends **email** verification codes via **Amazon SES** and **SMS** verification codes via **Amazon SNS** (and Pinpoint for origination numbers). Until these are configured and connected, email and text verifications in onboarding may fail or not send.

---

## 1. Email verification (Amazon SES)

### 1.1 Verify a sender in SES

1. Open **AWS Console** → **Amazon SES** → **Verified identities**.
2. Click **Create identity**.
3. Choose **Email address** (or **Domain** to send from any address at your domain).
4. Enter the email you want to use (e.g. `noreply@yourdomain.com`). This must match what you configure in Amplify auth.
5. SES sends a verification email to that address. Click the link to verify.

### 1.2 SES sandbox vs production

- **Sandbox:** You can only send **to** verified addresses. Good for testing.
- **Production:** You can send to any address after you **request production access** in SES (Console → Account dashboard → Request production access). Approval is often within 24 hours.

For **sign-up and attribute verification**, Cognito sends **to** the user’s email. In sandbox, that user email must be verified in SES as well (add it under Verified identities) or requests will fail.

### 1.3 Connect SES to Cognito (Amplify)

In this project, auth is already configured to use a custom sender in `amplify/auth/resource.ts`:

Auth uses a custom SES sender only when `AMPLIFY_SES_FROM_EMAIL` is set at deploy time (see `amplify/auth/resource.ts`). Otherwise Cognito uses its default email until you verify an identity and set that env var.

- **Option A:** Set **`AMPLIFY_SES_FROM_EMAIL`** to your SES-verified email (e.g. in your CI/env or `.env` used at deploy), then redeploy (e.g. `npx ampx sandbox` or your pipeline).
- **Option B:** Change **`noreply@modeled.app`** in `amplify/auth/resource.ts` to your SES-verified email, then redeploy.

After deploy, Cognito will use SES for sign-up and email attribute verification. If you still don’t receive emails, check SES sending limits and that the **From** identity is verified.

---

## 2. SMS verification (SNS / Pinpoint)

Cognito sends SMS codes using **SNS** (and for production, often an **origination number** from **Pinpoint**).

### 2.1 SMS sandbox (quick test)

1. Open **AWS Console** → **SNS** → **Text messaging (SMS)**.
2. Under **Account information**, check **Account status**. If it’s **Sandbox**, you can only send to **verified destination phone numbers**.
3. Add test numbers: **Pinpoint** → **SMS and voice** → **Destination phone numbers** → **Add phone number**, verify with the code sent to that number.

In sandbox, only these verified destinations receive SMS. Your app’s “Send verification code” will work only for numbers added here.

### 2.2 Production SMS (optional)

1. **Request an origination number** (recommended for production):  
   **Pinpoint** → **SMS and voice** → **Phone numbers** → **Request phone number** (or request a toll-free number). This gives a number that appears as the sender of verification texts.
2. **Request production access for SMS** if your account is still in SNS SMS sandbox:  
   **SNS** → **Text messaging (SMS)** → **Account information** → request production access and complete the form.

Cognito automatically uses the account’s SMS configuration; no extra “senders” config is required in `defineAuth` for basic SMS. Ensuring the account can send SMS (sandbox destinations or production) is what makes “Send verification code” for phone work.

### 2.3 IAM (Cognito → SNS)

Amplify/Gen 2 typically grants Cognito permission to publish to SNS when the user pool is created. If SMS still doesn’t send, confirm the Cognito user pool’s IAM role has `sns:Publish` (and that you’re not in a region with extra SMS restrictions).

---

## 3. Checklist

| Step | Action |
|------|--------|
| **SES** | Create and verify a sender identity (email or domain) in SES. |
| **SES** | (Production) Request production access in SES if you need to send to unverified addresses. |
| **Auth** | Set `AMPLIFY_SES_FROM_EMAIL` or set `fromEmail` in `amplify/auth/resource.ts` to your SES-verified address. |
| **Auth** | Redeploy (e.g. `npx ampx sandbox` or your deployment pipeline). |
| **SMS** | (Sandbox) Add destination phone numbers in Pinpoint so test users receive SMS. |
| **SMS** | (Production) Request origination number and/or SNS production access if needed. |

After SES is connected and the auth sender is updated and redeployed, **email** verification in the app should work. After the SMS side (sandbox or production) is set up, **text** verification should work for the allowed destinations.

### Local onboarding

- By default, **localhost runs real Cognito verification** (SES/SNS) unless `VITE_BYPASS_ONBOARDING_VERIFICATION=true` or `VITE_USE_MOCK_DATA=true`.
- Transactional emails (bookings, etc.) use the `notifications` Lambda; redeploy after backend changes so SES IAM permissions apply.
