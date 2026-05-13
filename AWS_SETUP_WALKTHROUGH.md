# 🚶 AWS Console Setup - Step-by-Step Walkthrough

**Don't worry!** I'll walk you through every click. This should take about 30 minutes total.

---

## 📋 Before You Start

**What you need:**
- AWS Console access (log in at https://console.aws.amazon.com)
- Admin permissions (or ask someone who has them)

**What we're doing:**
1. Create 3 EventBridge rules (automated reminders)
2. Enable DynamoDB stream (for auto-matching)
3. Deploy the Lambda function

---

## 🎯 STEP 1: Create EventBridge Rules (20 minutes)

### Rule 1: Booking Reminders

1. **Go to EventBridge**
   - In AWS Console, search "EventBridge" at the top
   - Click "Amazon EventBridge" (or "EventBridge")

2. **Create Rule**
   - Click "Rules" in left sidebar
   - Click orange "Create rule" button

3. **Name & Description**
   - **Name:** `booking-reminders-24h`
   - **Description:** `Send booking reminders 24 hours before appointment`
   - Leave everything else default

4. **Define Pattern**
   - Select **"Schedule"** (not Event pattern)
   - Choose **"Schedule pattern"**
   - Select **"Rate-based schedule"**
   - **Rate expression:** `1 hour`
   - Click "Next"

5. **Select Targets**
   - Click **"AWS service"**
   - Select **"Lambda function"**
   - **Function:** Choose `booking-reminders` from dropdown
   - Click "Next"

6. **Configure Target Input**
   - Select **"Constant (JSON text)"**
   - **JSON:** Paste this:
     ```json
     {"reminderType": "24h"}
     ```
   - Click "Next"

7. **Review & Create**
   - Review everything looks right
   - Click **"Create rule"**

✅ **Done with Rule 1!**

---

### Rule 2: Payment Reminders

1. **Create Another Rule**
   - Click "Create rule" again

2. **Name & Description**
   - **Name:** `model-payment-reminders`
   - **Description:** `Send payment reminders to models every 6 hours`

3. **Define Pattern**
   - Select **"Schedule"**
   - **Rate expression:** `6 hours`
   - Click "Next"

4. **Select Targets**
   - **Function:** Choose `model-payment-reminders`
   - Click "Next"

5. **Configure Target Input**
   - Select **"Matched event"** (or leave default)
   - Click "Next"

6. **Create Rule**
   - Click "Create rule"

✅ **Done with Rule 2!**

---

### Rule 3: Chat Activation

1. **Create Rule**
   - Click "Create rule"

2. **Name & Description**
   - **Name:** `chat-activation-scheduled`
   - **Description:** `Activate chats at scheduled times`

3. **Define Pattern**
   - Select **"Schedule"**
   - **Rate expression:** `15 minutes`
   - Click "Next"

4. **Select Targets**
   - **Function:** Choose `chat-activation`
   - Click "Next"

5. **Create Rule**
   - Click "Create rule"

✅ **All 3 EventBridge rules done!**

---

## 🎯 STEP 2: Enable DynamoDB Stream (10 minutes)

### Enable Stream on ModelRequest Table

1. **Go to DynamoDB**
   - In AWS Console, search "DynamoDB"
   - Click "DynamoDB"

2. **Find Your Table**
   - Click "Tables" in left sidebar
   - Look for table name containing "ModelRequest"
   - It might be named like: `ModelRequest-xxxxxxxxx` or `amplify-xxxx-ModelRequest-xxxx`
   - **Can't find it?** Scroll down or use search box

3. **Enable Stream**
   - Click on the table name
   - Click **"Exports and streams"** tab
   - Click **"Turn on"** under "DynamoDB stream"
   - Select **"New and old images"**
   - Click **"Turn on stream"**

4. **Note the Stream ARN**
   - Copy the Stream ARN (it looks like: `arn:aws:dynamodb:region:account:table/ModelRequest-xxx/stream/2024-...`)
   - You'll need this in next step

✅ **Stream enabled!**

---

### Connect Stream to Lambda Function

1. **Go to Lambda**
   - Search "Lambda" in AWS Console
   - Click "Lambda"

2. **Find Auto-Matching Function**
   - Click "Functions" in left sidebar
   - Look for function: `auto-matching` or `amplify-xxxx-auto-matching`
   - **Can't find it?** It might not be deployed yet - that's okay, we'll deploy it next

3. **If Function Exists - Add Trigger:**
   - Click on the function name
   - Scroll to "Function overview"
   - Click **"Add trigger"**
   - Select **"DynamoDB"**
   - **DynamoDB table:** Choose your ModelRequest table
   - **Batch size:** `10`
   - **Starting position:** `Latest` (or `Trim horizon`)
   - Click **"Add"**

4. **If Function Doesn't Exist Yet:**
   - That's okay! We'll deploy it in Step 3, then come back here

✅ **Stream connection done (or will do after deployment)!**

---

## 🎯 STEP 3: Deploy Lambda Function (10 minutes)

### Option A: Deploy via Amplify CLI (Easiest)

1. **Open Terminal**
   - In your project folder (where `package.json` is)

2. **Deploy**
   ```bash
   npx ampx sandbox
   ```
   OR
   ```bash
   npm run amplify deploy
   ```

3. **Wait**
   - This will deploy all functions including `auto-matching`
   - Takes 5-10 minutes

4. **Verify**
   - Go to Lambda in AWS Console
   - You should see `auto-matching` function appear

✅ **Function deployed!**

---

### Option B: Manual Deploy (If CLI doesn't work)

**Skip this for now** - let's try Option A first. If it doesn't work, let me know and I'll help you manually.

---

## ✅ STEP 4: Test It Works (5 minutes)

### Quick Test

1. **Create a Test Request**
   - Go to your app
   - Log in as a professional
   - Create a new model request
   - Save it

2. **Check CloudWatch Logs**
   - Go to AWS Console → CloudWatch
   - Click "Logs" → "Log groups"
   - Find `/aws/lambda/auto-matching` (or similar)
   - Click on it
   - Click latest log stream
   - Look for "Auto-matching triggered" messages

3. **Check Database**
   - Go to DynamoDB → Tables → `Match-xxxxx`
   - You should see new match records created

✅ **If you see matches created automatically, it works!**

---

## 🆘 NEED HELP?

**Stuck on a step?**
- Tell me which step number you're on
- Tell me what you see (or what error you get)
- I'll help you through it!

**Common Issues:**

1. **"Can't find ModelRequest table"**
   - Look in different AWS region (top right corner)
   - Try searching "ModelRequest" in DynamoDB search

2. **"Function doesn't exist"**
   - That's okay! Deploy it first (Step 3)
   - Then come back to add the trigger

3. **"Permission denied"**
   - You might need admin permissions
   - Ask your AWS admin to do these steps

4. **"EventBridge rule fails"**
   - Check Lambda function has correct permissions
   - Check CloudWatch logs for errors

---

## 📞 QUICK REFERENCE

**EventBridge Rules Created:**
- ✅ `booking-reminders-24h` (every hour)
- ✅ `model-payment-reminders` (every 6 hours)  
- ✅ `chat-activation-scheduled` (every 15 minutes)

**DynamoDB Stream:**
- ✅ Enabled on ModelRequest table

**Lambda Function:**
- ✅ `auto-matching` deployed and connected

---

**Time Estimate:** 30-45 minutes  
**Difficulty:** Medium (but I'm here to help!)  
**Can be done in:** Multiple sessions (save progress as you go)

---

**Ready? Start with Step 1 and let me know when you're done or if you get stuck!** 🚀

