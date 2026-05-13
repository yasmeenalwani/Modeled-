# Environment Variables Setup 🔐

## Quick Start

1. **Create a `.env` file** in the root directory (same level as `package.json`)
2. **Add your Stripe key:**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   ```
3. **Restart your dev server** (`npm run dev`)

---

## Required Variables

### **Stripe Publishable Key** (Frontend)

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
```

- **Get it from:** https://dashboard.stripe.com/apikeys
- **For testing:** Use `pk_test_...`
- **For production:** Use `pk_live_...`
- **Safe to expose:** This key is public and used in the browser

---

## Important Notes

### ✅ **DO:**
- Store keys in `.env` file (not committed to git)
- Use `VITE_` prefix for Vite projects
- Restart dev server after changing `.env`
- Use test keys during development

### ❌ **DON'T:**
- Commit `.env` file to git (it's in `.gitignore`)
- Put secret keys in code
- Share your keys publicly
- Use production keys in development

---

## File Structure

```
modeled-frontend/
├── .env                 ← Create this file (not in git)
├── .env.example         ← Example file (safe to commit)
├── package.json
└── src/
```

---

## Stripe Keys Explained

### **Publishable Key** (Frontend)
- **Format:** `pk_test_...` or `pk_live_...`
- **Used in:** Browser (StripeProvider.jsx)
- **Purpose:** Initialize Stripe Elements
- **Safe:** Can be exposed in frontend code

### **Secret Key** (Backend Only)
- **Format:** `sk_test_...` or `sk_live_...`
- **Used in:** AWS Lambda functions (backend)
- **Purpose:** Process payments, create payment intents
- **NEVER:** Put this in frontend code or `.env` file
- **Set in:** AWS Lambda environment variables

---

## Troubleshooting

### Error: "Failed to resolve import @stripe/stripe-js"
**Solution:** Run `npm install @stripe/stripe-js @stripe/react-stripe-js`

### Error: "Stripe publishable key not configured"
**Solution:** 
1. Create `.env` file in root directory
2. Add `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
3. Restart dev server

### Error: "Invalid Stripe key format"
**Solution:** Make sure key starts with `pk_test_` or `pk_live_`

---

## Example .env File

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890

# Optional: Development overrides
# NODE_ENV=development
```

---

**Your `.env` file is automatically ignored by git, so your keys stay safe!** 🔒

