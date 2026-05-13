# How ID Verification Works & What AWS Can (and Can’t) Do

## What We Do Today (AWS)

### 1. **Government ID document check**

- **Where:** `amplify/functions/identity-verification/handler.ts`
- **How:** Before comparing faces, we use **Amazon Rekognition – DetectText** on the ID image.
- **Rule:** The image must have at least **3 lines of text**. Real IDs (driver’s license, passport, state ID) have names, numbers, dates, etc. A random photo usually has little or no text.
- **If it fails:** The user sees: *"This doesn't look like a government ID. Please upload a clear photo of your ID document (driver's license, passport, or state ID) with all text visible."*
- **AWS service:** [Amazon Rekognition – DetectText](https://docs.aws.amazon.com/rekognition/latest/dg/text-detection.html)

So: **“Is this actually a gov ID?”** is handled by this Rekognition text check. Random pics get rejected.

### 2. **Face match (selfie vs ID photo)**

- **Where:** Same Lambda.
- **How:** **Amazon Rekognition – CompareFaces**: selfie image vs. photo on the ID.
- **Rule:** We use a similarity threshold (e.g. 70%+ for manual review, 80%+ for “verified”). So we’re checking: *“Does the person in the selfie look like the person on the ID?”*
- **AWS service:** [Amazon Rekognition – CompareFaces](https://docs.aws.amazon.com/rekognition/latest/dg/compare-faces.html)

So: **“Is this person the same as on the ID?”** is handled by Rekognition. We do **not** know “who” they are in the sense of legal identity or history—only that the two faces match.

---

## What AWS Does **Not** Do (Criminal / Background Checks)

- **Criminal history, felon status, background checks:** AWS does **not** provide APIs or services for:
  - Criminal record checks  
  - Sex offender registries  
  - “Felon or not” decisions  
  - General background screening  

So: **“Is this person a felon or a freak?”** is **not** something you can answer with AWS alone.

---

## How to Add “Who They Are” and Safety Checks

If you want to know more than “this looks like a gov ID” and “this face matches the ID,” you add **third‑party** services and use AWS to orchestrate and store.

### Option A – Identity + document verification (who they are)

- Use a **third‑party identity provider** that:
  - Verifies the ID is real (not forged).
  - Optionally checks against official sources (e.g. DMV, passport).
- Examples: **Jumio**, **Onfido**, **Persona**, **Stripe Identity**, **Veriff**, **Socure**, etc.
- Flow: User uploads ID + selfie in your app → you send to the provider’s API → they return verified identity (name, DOB, address, etc.) and document validity. You can store the result in DynamoDB and use it in your app/Cognito.

### Option B – Criminal / background checks (felon, etc.)

- Use a **background check / screening provider** that:
  - Runs criminal record checks (and optionally other checks).
  - Returns results you can use for policy (e.g. “no violent felons”).
- Examples: **Checkr**, **Sterling**, **GoodHire**, **Accurate Background**, etc.
- Flow: After you know who they are (from Option A or from your own ID + face match), you call the provider’s API with name/DOB/SSN (per their requirements). They return a report. You store the result and enforce your rules in your app.

### Option C – All-in-one (ID + face + background)

- Some providers do **both** ID verification and background checks (e.g. Checkr, Sterling). You can use one vendor for “verify ID + face” and “run background” and then use AWS (Lambda, API Gateway, DynamoDB) to:
  - Call the vendor from your backend.
  - Store and use verification and background results.
  - Gate access (e.g. “verified” vs “rejected”) in your app.

---

## Summary Table

| Question | Handled by | Where |
|----------|------------|--------|
| Is the upload actually a gov ID (and not a random pic)? | **AWS Rekognition (DetectText)** | `identity-verification` Lambda |
| Does the selfie match the face on the ID? | **AWS Rekognition (CompareFaces)** | Same Lambda |
| Is the ID real / not forged? | **Third‑party (e.g. Jumio, Onfido, Stripe Identity)** | Not in AWS; you integrate via API |
| Is this person a felon / safe to allow? | **Third‑party background check (e.g. Checkr, Sterling)** | Not in AWS; you integrate via API |

So: **within AWS**, you get “is this a document with text?” and “do these two faces match?”. **Outside AWS**, you add ID verification and/or background checks to understand “who they are” and “are they a felon or not?”.
