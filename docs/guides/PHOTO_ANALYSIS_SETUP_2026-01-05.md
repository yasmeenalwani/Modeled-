# Photo Analysis System - Setup Guide

## Overview

This system uses **AWS Rekognition** and **AWS Bedrock** to automatically analyze model photos and extract attributes like hair color, length, texture, etc. Models just upload photos, and the system auto-tags their attributes!

## Architecture

```
Photo Upload (S3) → Lambda Trigger → Rekognition Analysis → Bedrock Enhancement → Attribute Mapping → Database Update
```

## Components

### 1. Lambda Function (`amplify/functions/photo-analysis/`)
- **handler.ts**: Main analysis logic
- **attributeMapper.ts**: Maps AI output to our attribute system
- **resource.ts**: Function configuration with IAM permissions

### 2. Frontend Components
- **src/utils/photoAnalysis.js**: Utilities to trigger analysis
- **src/components/AutoTaggedAttributes.jsx**: UI to display and confirm auto-tagged attributes

### 3. Database Schema Updates
- Added `autoTaggedAttributes` (JSON) to store detected attributes
- Added `attributeConfidence` (JSON) to store confidence scores
- Added `lastPhotoAnalysis` (datetime) to track when last analyzed
- Added `photoAnalysisStatus` (enum) to track analysis state

## Setup Steps

### 1. Install Dependencies

The Lambda function dependencies are already in `package.json`. When you deploy, Amplify will install them automatically.

### 2. Configure Bedrock Model

Edit `amplify/functions/photo-analysis/resource.ts` to choose your Bedrock model:

```typescript
BEDROCK_MODEL_ID: 'anthropic.claude-3-sonnet-20240229-v1:0' // More accurate, slower
// OR
BEDROCK_MODEL_ID: 'anthropic.claude-3-haiku-20240307-v1:0' // Faster, cheaper
```

### 3. Set Up S3 Trigger (Two Options)

#### Option A: Automatic Trigger (Recommended for Production)

Set up an S3 event notification in AWS Console:
1. Go to S3 → Your bucket → Properties → Event notifications
2. Create event notification:
   - **Event type**: `PUT` (when objects are created)
   - **Prefix**: `profile-photos/models/`
   - **Suffix**: `.jpg` or `.png` (or leave blank for all)
   - **Destination**: Lambda function → `photo-analysis`

#### Option B: Manual Trigger (For Development)

Call the function from the frontend after photo upload:

```javascript
import { analyzePhoto } from '../utils/photoAnalysis';

// After photo upload
const result = await analyzePhoto(photoKey, userId, 'profile');
```

### 4. Grant Bedrock Permissions

The Lambda function needs permission to invoke Bedrock. This is already configured in `resource.ts`, but you may need to:

1. Go to AWS IAM → Roles → Find your Lambda execution role
2. Ensure it has `bedrock:InvokeModel` permission
3. If using Bedrock for the first time, you may need to enable it in the AWS Console

### 5. Test the System

1. Upload a photo through the model portal
2. The Lambda function will automatically analyze it (if S3 trigger is set up)
3. Check the `AutoTaggedAttributes` component to see results
4. Models can confirm or edit the auto-tagged values

## How It Works

### Step 1: Rekognition Analysis
- Detects labels (objects, scenes, concepts)
- Detects faces (for headshot analysis)
- Returns structured data about what's in the image

### Step 2: Bedrock Enhancement (Optional)
- Uses Claude to understand context
- Makes nuanced decisions about hair attributes
- Returns structured JSON with attributes and confidence

### Step 3: Attribute Mapping
- Maps AI output to our `MODEL_ATTRIBUTES` system
- Normalizes values (e.g., "blond" → "blonde")
- Calculates confidence scores

### Step 4: Database Update
- Stores auto-tagged attributes in `ModelProfile.autoTaggedAttributes`
- Stores confidence scores in `ModelProfile.attributeConfidence`
- Models can review and confirm before applying to profile

## Attribute Mapping Rules

The `AttributeMapper` class knows how to translate AI output to our system:

### Hair Color
- Rekognition labels: "blonde", "brown", "black", "red", "gray"
- Bedrock: More nuanced understanding (e.g., "light brown" vs "dark brown")
- Maps to: `black`, `dark_brown`, `light_brown`, `blonde`, `red`, `gray`, `colored`

### Hair Length
- Rekognition: Basic detection from labels
- Bedrock: Better understanding of relative length
- Maps to: `short`, `medium`, `long`, `extra_long`

### Hair Texture
- Rekognition: Detects "curly", "wavy", "straight" labels
- Bedrock: Better at distinguishing texture patterns
- Maps to: `straight`, `wavy`, `curly`, `coily`

### Hair Density
- Harder to detect from labels alone
- Bedrock can analyze visual density
- Maps to: `thin`, `medium`, `thick`

## Confidence Scores

- **80-100%**: High confidence - likely accurate
- **60-79%**: Medium confidence - probably correct but review recommended
- **Below 60%**: Low confidence - manual review required

## Cost Considerations

### Rekognition
- **DetectLabels**: $1.00 per 1,000 images
- **DetectFaces**: $1.00 per 1,000 images
- First 5,000 images/month are FREE

### Bedrock (Claude)
- **Claude 3 Sonnet**: ~$0.003 per image (more accurate)
- **Claude 3 Haiku**: ~$0.00025 per image (faster, cheaper)
- Recommendation: Use Haiku for most cases, Sonnet for critical analysis

### Estimated Monthly Cost
- 1,000 photos/month:
  - Rekognition: ~$2.00 (after free tier)
  - Bedrock Haiku: ~$0.25
  - **Total: ~$2.25/month**

## Database Schema

You **don't need a separate database** for attribute definitions. The mapping rules are in code (`attributeMapper.ts`), which is:
- ✅ Easy to update
- ✅ Version controlled
- ✅ No database queries needed
- ✅ Fast and efficient

If you want to make attributes configurable via admin panel later, you can move the mapping rules to DynamoDB or RDS, but it's not necessary for MVP.

## Troubleshooting

### "Bedrock access denied"
- Enable Bedrock in AWS Console (one-time setup)
- Check IAM permissions on Lambda role

### "No attributes detected"
- Check photo quality (needs clear view of hair)
- Try different photo angles
- Bedrock may provide better results than Rekognition alone

### "Analysis taking too long"
- Switch to Claude Haiku (faster)
- Increase Lambda timeout in `resource.ts`
- Consider async processing for large batches

## Future Enhancements

1. **Batch Processing**: Analyze multiple photos at once
2. **Custom Models**: Train custom Rekognition models for hair-specific attributes
3. **Confidence Learning**: Improve confidence scores based on user confirmations
4. **Multi-Photo Analysis**: Combine results from multiple photos for better accuracy
5. **Admin Override**: Allow admins to manually adjust auto-tagged attributes

