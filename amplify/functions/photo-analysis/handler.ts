import { RekognitionClient, DetectLabelsCommand, DetectFacesCommand, DetectModerationLabelsCommand } from '@aws-sdk/client-rekognition';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Handler } from 'aws-lambda';
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import { getAmplifyDataClientConfig } from '@aws-amplify/backend/function/runtime';
import type { Schema } from '../../data/resource';
import { AttributeMapper } from './attributeMapper';
import { BeautyAttributeMapper } from './beautyAttributeMapper';

/**
 * Modeled Hair Engine - Photo Analysis Handler
 * 
 * MVP Version with:
 * - Rule-based hair analysis (cost optimized)
 * - User view (simple) vs Admin view (detailed)
 * - Proprietary data collection from user submissions
 * - Path to full ML when ready
 * 
 * COMMERCIAL DATASETS REFERENCED:
 * - Black Hair Detection (Roboflow) - CC BY 4.0
 * - FairFace - Apache 2.0
 */

const rekognitionClient = new RekognitionClient({ region: process.env.AWS_REGION || 'us-east-1' });
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Training data table (separate from AppSync - for ML pipeline)
const TRAINING_DATA_TABLE = process.env.TRAINING_DATA_TABLE || 'HairEngineTrainingData-dev';

export const handler: Handler = async (event) => {
  console.log('Hair Engine Analysis Event:', JSON.stringify(event, null, 2));

  try {
    // Handle S3 event (from bucket trigger)
    if (event.Records && event.Records[0]?.s3) {
      const s3Record = event.Records[0].s3;
      const bucket = s3Record.bucket.name;
      const key = decodeURIComponent(s3Record.object.key.replace(/\+/g, ' '));
      
      const pathParts = key.split('/');
      // Extract userId: path is models/{userId}/profile-photos/... or .../models/{userId}/...
      const modelsIdx = pathParts.indexOf('models');
      const userId = modelsIdx >= 0 && pathParts[modelsIdx + 1]
        ? pathParts[modelsIdx + 1]
        : (pathParts[1] || pathParts[0] || 'unknown');
      const photoType = determinePhotoType(key);
      
      return await analyzePhoto({
        bucket,
        key,
        userId,
        photoType,
      });
    }
    
    // Handle direct invocation
    const { bucket, key, userId, photoType, validateAttributes } = event;
    
    // If this is a validation request (user confirming/correcting attributes)
    if (validateAttributes && userId) {
      return await recordUserValidation(userId, validateAttributes);
    }
    
    if (!bucket || !key || !userId) {
      throw new Error('Missing required parameters: bucket, key, userId');
    }
    
    return await analyzePhoto({
      bucket,
      key,
      userId,
      photoType: photoType || determinePhotoType(key),
    });
    
  } catch (error: any) {
    console.error('Hair Engine Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};

/**
 * Main analysis function
 */
async function analyzePhoto(params: {
  bucket: string;
  key: string;
  userId: string;
  photoType: 'profile' | 'hair' | 'headshot';
}) {
  const { bucket, key, userId, photoType } = params;
  const startTime = Date.now();
  
  console.log(`[Hair Engine] Analyzing: ${key} for user ${userId} (type: ${photoType})`);

  // Step 1: Moderation gate - reject inappropriate content before any processing
  const moderationResult = await checkModeration(bucket, key);
  if (!moderationResult.approved) {
    // Delete immediately for compliance - do not retain inappropriate content
    await deleteS3Object(bucket, key);
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Photo does not meet content guidelines',
        moderationLabels: moderationResult.labels,
        message: 'Please upload a professional headshot or profile photo. Inappropriate content is not allowed.',
      }),
    };
  }

  // Step 2: Use Rekognition to detect labels and faces
  const rekognitionResults = await analyzeWithRekognition(bucket, key);

  // Step 3: Quality gate - reject blurry, tilted, or occluded faces (step-aware for side_profile)
  const stepId = extractStepIdFromKey(key);
  const qualityResult = validatePhotoQuality(rekognitionResults, { stepId });
  if (!qualityResult.passed) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: 'Photo quality does not meet requirements',
        reason: qualityResult.reason,
        message: 'Please upload a clear, front-facing photo with good lighting. Face should be clearly visible.',
      }),
    };
  }

  // Step 4: Use Bedrock for advanced understanding (if configured)
  const bedrockResults = await analyzeWithBedrock(bucket, key, rekognitionResults);
  
  // Step 5: Map results using Hair Engine attribute mapper
  const hairAttributes = AttributeMapper.mapToAttributes(
    rekognitionResults,
    bedrockResults,
    photoType
  );
  
  // Step 6: Map results using Beauty Engine attribute mapper
  const beautyAttributes = BeautyAttributeMapper.mapToBeautyAttributes(
    rekognitionResults,
    bedrockResults
  );
  
  // Step 7: Update ModelProfile with both hair and beauty attributes
  try {
    await updateModelProfile(userId, hairAttributes, beautyAttributes, key);
  } catch (dbError) {
    console.warn('[Analysis Engine] Database update failed:', dbError);
  }
  
  // Step 8: Record for proprietary training data (anonymized)
  try {
    await recordTrainingData(userId, hairAttributes, beautyAttributes, key);
  } catch (trainError) {
    console.warn('[Analysis Engine] Training data recording failed:', trainError);
  }
  
  const processingTime = Date.now() - startTime;
  
  // Step 9: Return structured results with both views
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      userId,
      photoKey: key,
      photoType,
      
      // ============ HAIR ANALYSIS ============
      hair: {
        userView: hairAttributes.simple,
        adminView: hairAttributes.detailed,
        confidence: hairAttributes.confidence,
      },
      
      // ============ BEAUTY ANALYSIS ============
      beauty: {
        userView: beautyAttributes.simple,
        adminView: beautyAttributes.detailed,
        confidence: beautyAttributes.confidence,
      },
      
      // Combined user-facing (simple) attributes
      userView: {
        ...hairAttributes.simple,
        ...beautyAttributes.simple,
      },
      
      // Combined admin-only (detailed) attributes
      adminView: {
        hair: hairAttributes.detailed,
        beauty: beautyAttributes.detailed,
      },
      
      // Combined confidence scores
      confidence: {
        ...hairAttributes.confidence,
        ...beautyAttributes.confidence,
      },
      
      // Metadata
      analysisVersion: `Hair:${hairAttributes.analysisVersion},Beauty:${beautyAttributes.analysisVersion}`,
      processingTimeMs: processingTime,
      analyzedAt: hairAttributes.analyzedAt,
      
      // Validation prompt (for proprietary data collection)
      validationPrompt: {
        message: 'Please confirm or correct your attributes',
        hair: hairAttributes.simple,
        beauty: beautyAttributes.simple,
        confidenceLow: [
          ...Object.entries(hairAttributes.confidence)
            .filter(([_, conf]) => (conf as number) < 70)
            .map(([attr, _]) => `hair.${attr}`),
          ...Object.entries(beautyAttributes.confidence)
            .filter(([_, conf]) => (conf as number) < 70)
            .map(([attr, _]) => `beauty.${attr}`),
        ],
      },
    }),
  };
}

/**
 * Get Amplify data client (for ModelProfile updates via AppSync)
 */
async function getDataClient() {
  const { env } = await import('$amplify/env/photo-analysis');
  const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
  Amplify.configure(resourceConfig, libraryOptions);
  return generateClient<Schema>();
}

/**
 * Record user validation (proprietary data collection)
 */
async function recordUserValidation(userId: string, validatedAttributes: any) {
  const timestamp = new Date().toISOString();

  try {
    const client = await getDataClient();
    const { data: profiles } = await client.models.ModelProfile.list({
      filter: { userId: { eq: userId } },
      limit: 1,
    });
    const profile = profiles?.[0];
    if (!profile) {
      console.warn(`[Hair Engine] No ModelProfile found for userId ${userId}`);
      return { statusCode: 404, body: JSON.stringify({ success: false, error: 'Profile not found' }) };
    }
    await client.models.ModelProfile.update({
      id: profile.id,
      userValidatedAttributes: validatedAttributes,
      userValidatedAt: timestamp,
      validationAccuracy: validatedAttributes.accuracy ?? null,
    });
    
    // Record in training data for ML improvements
    await docClient.send(new PutCommand({
      TableName: TRAINING_DATA_TABLE,
      Item: {
        id: `validation-${userId}-${Date.now()}`,
        type: 'user_validation',
        userId: userId, // Keep for linking, but don't use in training
        validatedAttributes,
        timestamp,
        isCommerciallyUsable: true, // User consented via terms
      },
    }));
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Validation recorded successfully',
        userId,
        timestamp,
      }),
    };
    
  } catch (error: any) {
    console.error('[Hair Engine] Validation recording failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
}

/**
 * Update ModelProfile with auto-tagged hair and beauty attributes
 * Uses AppSync client (query by userId, update by id) - correct Amplify Data primary key
 */
async function updateModelProfile(
  userId: string,
  hairAttributes: any,
  beautyAttributes: any,
  photoKey: string
) {
  const timestamp = new Date().toISOString();
  const client = await getDataClient();

  const { data: profiles } = await client.models.ModelProfile.list({
    filter: { or: [{ userId: { eq: userId } }, { storageIdentityId: { eq: userId } }] },
    limit: 1,
  });
  const profile = profiles?.[0];
  if (!profile) {
    console.warn(`[Hair Engine] No ModelProfile found for userId ${userId}, skipping update`);
    return;
  }

  const updatePayload: Record<string, unknown> = {
    id: profile.id,
    hairLengthSimple: hairAttributes.simple.hairLength,
    hairColorSimple: hairAttributes.simple.hairColor,
    hairTextureSimple: hairAttributes.simple.hairTexture,
    hairDensity: hairAttributes.simple.hairDensity,
    hairLengthDetailed: hairAttributes.detailed.hairLengthSpecific,
    hairColorDetailed: {
      depth: hairAttributes.detailed.hairColorDepth,
      undertone: hairAttributes.detailed.hairColorUndertone,
      natural: hairAttributes.detailed.hairColorNatural,
      artificial: hairAttributes.detailed.hairColorArtificial,
    },
    hairTextureDetailed: hairAttributes.detailed.curlPattern,
    hairHealth: hairAttributes.detailed.hairHealth,
    hairStyle: hairAttributes.detailed.hairStyle,
    hairPorosity: hairAttributes.detailed.hairPorosity,
    skinToneSimple: beautyAttributes.simple.skinTone,
    skinUndertone: beautyAttributes.simple.skinUndertone,
    skinType: beautyAttributes.simple.skinType,
    skinToneDetailed: beautyAttributes.detailed.skinToneDetailed,
    skinConcerns: beautyAttributes.detailed.skinConcerns,
    faceShapeSimple: beautyAttributes.simple.faceShape,
    faceShapeDetailed: beautyAttributes.detailed.faceShapeDetailed,
    faceLength: beautyAttributes.detailed.faceLength,
    jawlineType: beautyAttributes.detailed.jawlineType,
    cheekboneProminence: beautyAttributes.detailed.cheekboneProminence,
    eyeColorSimple: beautyAttributes.simple.eyeColor,
    eyeShapeSimple: beautyAttributes.simple.eyeShape,
    eyeColorDetailed: beautyAttributes.detailed.eyeColorDetailed,
    eyeSize: beautyAttributes.detailed.eyeSize,
    eyeSpacing: beautyAttributes.detailed.eyeSpacing,
    eyeLidType: beautyAttributes.detailed.eyeLidType,
    eyebrowShapeSimple: beautyAttributes.simple.eyebrowShape,
    eyebrowThickness: beautyAttributes.simple.eyebrowThickness,
    lipShapeSimple: beautyAttributes.simple.lipShape,
    lipSize: beautyAttributes.simple.lipSize,
    noseShape: beautyAttributes.detailed.noseShape,
    autoTaggedAttributes: { hair: hairAttributes, beauty: beautyAttributes },
    attributeConfidence: { ...hairAttributes.confidence, ...beautyAttributes.confidence },
    analysisVersion: `Hair:${hairAttributes.analysisVersion},Beauty:${beautyAttributes.analysisVersion}`,
    lastPhotoAnalysis: timestamp,
    lastBeautyAnalysis: timestamp,
    photoAnalysisStatus: 'completed',
    beautyProfileComplete: true,
    beautyAnalysisVersion: beautyAttributes.analysisVersion,
    analyzedPhotoCount: (profile.analyzedPhotoCount ?? 0) + 1,
  };

  await client.models.ModelProfile.update(updatePayload as any);
  console.log(`[Analysis Engine] Updated ModelProfile for ${userId} with hair and beauty attributes`);
}

/**
 * Record analysis for proprietary training data
 */
async function recordTrainingData(
  userId: string,
  hairAttributes: any,
  beautyAttributes: any,
  photoKey: string
) {
  const timestamp = new Date().toISOString();
  
  // Store analysis result for future ML training
  // This builds your proprietary dataset from user submissions
  await docClient.send(new PutCommand({
    TableName: TRAINING_DATA_TABLE,
    Item: {
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'auto_analysis',
      photoKey, // S3 key for reference
      analysisResult: {
        hair: {
          simple: hairAttributes.simple,
          detailed: hairAttributes.detailed,
          confidence: hairAttributes.confidence,
        },
        beauty: {
          simple: beautyAttributes.simple,
          detailed: beautyAttributes.detailed,
          confidence: beautyAttributes.confidence,
        },
      },
      analysisVersion: `Hair:${hairAttributes.analysisVersion},Beauty:${beautyAttributes.analysisVersion}`,
      timestamp,
      // Flag for user validation status
      userValidated: false,
      // Commercial use flag (based on user terms agreement)
      isCommerciallyUsable: true,
    },
  }));
  
  console.log(`[Analysis Engine] Recorded training data for ${photoKey}`);
}

/**
 * Delete S3 object immediately (used on moderation rejection for compliance)
 */
async function deleteS3Object(bucket: string, key: string): Promise<void> {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`[Moderation] Deleted rejected object: s3://${bucket}/${key}`);
  } catch (err: any) {
    console.error(`[Moderation] Failed to delete rejected object ${key}:`, err);
    // Do not rethrow - return 400 regardless; logging is sufficient for ops
  }
}

/**
 * Moderation gate - reject inappropriate content
 * Uses DetectModerationLabels; blocks Explicit Nudity, Suggestive, etc.
 */
async function checkModeration(bucket: string, key: string): Promise<{ approved: boolean; labels: string[] }> {
  const threshold = parseFloat(process.env.MODERATION_THRESHOLD || '80');
  const blockPatterns = ['Explicit Nudity', 'Suggestive', 'Nudity', 'Violence', 'Drug', 'Tobacco'];

  const command = new DetectModerationLabelsCommand({
    Image: { S3Object: { Bucket: bucket, Name: key } },
    MinConfidence: 50,
  });

  const response = await rekognitionClient.send(command);
  const labels = response.ModerationLabels || [];

  const blocked = labels.filter((l: { Confidence?: number; ParentName?: string; Name?: string }) => {
    if (!l.Confidence || l.Confidence < threshold) return false;
    const name = (l.ParentName || l.Name || '').toLowerCase();
    return blockPatterns.some((p) => name.includes(p.toLowerCase()));
  });
  const labelNames = blocked.map((l: { Name?: string; ParentName?: string }) => l.Name || l.ParentName || 'Unknown').filter(Boolean);

  return {
    approved: blocked.length === 0,
    labels: labelNames,
  };
}

/**
 * Quality gate - reject blurry, tilted, or occluded faces
 * Uses FaceDetails: Pose, Quality, EyesOpen, Sunglasses
 * Step-aware: side_profile skips yaw check (turned face required)
 */
function validatePhotoQuality(
  rekognitionResults: { faces: any[] },
  options?: { stepId?: string | null }
): { passed: boolean; reason?: string } {
  const faces = rekognitionResults.faces || [];
  if (faces.length === 0) {
    return { passed: false, reason: 'No face detected. Please ensure your face is clearly visible.' };
  }

  const face = faces[0];
  const pose = face.Pose || {};
  const quality = face.Quality || {};
  const yaw = Math.abs(pose.Yaw ?? 0);
  const pitch = Math.abs(pose.Pitch ?? 0);
  const sharpness = quality.Sharpness ?? 100;
  const brightness = quality.Brightness ?? 100;
  const eyesOpen = face.EyesOpen?.Value !== false;
  const sunglasses = face.Sunglasses?.Value === true;
  const isSideProfile = options?.stepId === 'side_profile';
  const maxPitch = isSideProfile ? 35 : 25;

  if (sunglasses) {
    return { passed: false, reason: 'Sunglasses detected. Please remove them for a clear face photo.' };
  }
  if (!eyesOpen) {
    return { passed: false, reason: 'Eyes appear closed. Please upload a photo with eyes open.' };
  }
  if (!isSideProfile && yaw > 30) {
    return { passed: false, reason: 'Face is turned too far. Please use a front-facing photo.' };
  }
  if (pitch > maxPitch) {
    return { passed: false, reason: 'Photo angle is too steep. Please use a straight-on headshot.' };
  }
  if (sharpness < 50) {
    return { passed: false, reason: 'Photo is blurry. Please upload a sharper image.' };
  }
  if (brightness < 40) {
    return { passed: false, reason: 'Photo is too dark. Please use better lighting.' };
  }

  return { passed: true };
}

/**
 * Analyze photo with AWS Rekognition
 * DetectLabels: objects, concepts, image properties (colors, etc.)
 * DetectFaces: face attributes (age, gender, emotions, pose, quality, landmarks)
 */
async function analyzeWithRekognition(bucket: string, key: string) {
  // Detect labels
  const labelsCommand = new DetectLabelsCommand({
    Image: { S3Object: { Bucket: bucket, Name: key } },
    MaxLabels: 50,
    MinConfidence: 50,
    Features: ['GENERAL_LABELS', 'IMAGE_PROPERTIES'],
  });
  
  const labelsResponse = await rekognitionClient.send(labelsCommand);
  
  // Detect faces
  const facesCommand = new DetectFacesCommand({
    Image: { S3Object: { Bucket: bucket, Name: key } },
    Attributes: ['ALL'],
  });
  
  const facesResponse = await rekognitionClient.send(facesCommand);
  
  return {
    labels: labelsResponse.Labels || [],
    faces: facesResponse.FaceDetails || [],
    imageProperties: labelsResponse.ImageProperties,
  };
}

/**
 * Analyze photo with AWS Bedrock (enhanced hair engine prompt)
 */
async function analyzeWithBedrock(
  bucket: string,
  key: string,
  rekognitionResults: any
) {
  try {
    const getObjectCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
    const s3Response = await s3Client.send(getObjectCommand);
    const imageBuffer = await streamToBuffer(s3Response.Body as any);
    const imageBase64 = imageBuffer.toString('base64');
    
    const prompt = buildHairEnginePrompt(rekognitionResults);
    const modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0'; // Haiku for cost optimization
    
    const bedrockCommand = new InvokeModelCommand({
      modelId,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
      }),
    });
    
    const bedrockResponse = await bedrockClient.send(bedrockCommand);
    const responseBody = JSON.parse(new TextDecoder().decode(bedrockResponse.body));
    
    return {
      analysis: responseBody.content[0]?.text || '',
      model: modelId,
    };
    
  } catch (error: any) {
    console.warn('[Hair Engine] Bedrock analysis failed:', error.message);
    return null;
  }
}

/**
 * Build specialized prompt for hair and beauty analysis
 */
function buildHairEnginePrompt(rekognitionResults: any): string {
  const labels = rekognitionResults.labels.map((l: any) => l.Name).join(', ');
  
  return `You are a professional beauty analyst for the Modeled platform. Analyze this photo to classify BOTH hair AND facial/beauty attributes.

Rekognition detected: ${labels}

Provide a JSON response with ALL these attributes:

{
  "// ===== HAIR ATTRIBUTES =====": "",
  "hairLength": "short" | "medium" | "long" | "extra_long",
  "hairLengthSpecific": "buzzed" | "pixie" | "ear-length" | "chin-length" | "shoulder" | "armpit" | "mid-back" | "waist" | "hip",
  "hairColor": "black" | "brown" | "blonde" | "red" | "gray" | "colored",
  "hairColorSpecific": "jet black" | "dark brown" | "medium brown" | "light brown" | "dark blonde" | "medium blonde" | "light blonde" | "auburn" | "copper" | "silver",
  "colorDepth": 1-10,
  "undertone": "warm" | "cool" | "neutral",
  "hairTexture": "straight" | "wavy" | "curly" | "coily",
  "curlPattern": "1A" | "1B" | "1C" | "2A" | "2B" | "2C" | "3A" | "3B" | "3C" | "4A" | "4B" | "4C",
  "hairDensity": "thin" | "medium" | "thick",
  "porosity": "low" | "medium" | "high",
  "hairCondition": "healthy" | "damaged" | "color_treated" | "virgin",
  "frizz": "none" | "low" | "medium" | "high",
  "shine": "matte" | "natural" | "glossy" | "high_shine",
  "hairstyle": "natural" | "blowout" | "silk_press" | "braids" | "cornrows" | "locs" | "twists" | "afro" | "bantu_knots" | "ponytail" | "updo" | "bob" | "wig" | "weave" | "twa" | "fade",

  "// ===== SKIN ATTRIBUTES =====": "",
  "skinTone": "fair" | "light" | "medium" | "olive" | "tan" | "brown" | "dark",
  "skinUndertone": "warm" | "cool" | "neutral",
  "skinType": "dry" | "normal" | "oily" | "combination",
  "skinTexture": "smooth" | "normal" | "textured" | "rough",
  "skinConcerns": ["acne", "redness", "hyperpigmentation", "fine_lines", "large_pores", "dryness", "oiliness", "dark_circles"],
  "fitzpatrickType": 1-6,

  "// ===== FACE ATTRIBUTES =====": "",
  "faceShape": "oval" | "round" | "square" | "heart" | "oblong" | "diamond",
  "faceLength": "short" | "average" | "long",
  "foreheadSize": "small" | "average" | "large",
  "cheekbones": "flat" | "average" | "prominent",
  "jawline": "soft" | "average" | "defined" | "angular",
  "chinShape": "pointed" | "rounded" | "square" | "recessed",

  "// ===== EYE ATTRIBUTES =====": "",
  "eyeColor": "brown" | "blue" | "green" | "hazel" | "gray" | "amber",
  "eyeColorIntensity": "light" | "medium" | "dark",
  "eyeShape": "almond" | "round" | "hooded" | "monolid" | "downturned" | "upturned",
  "eyeSize": "small" | "medium" | "large",
  "eyeSpacing": "close_set" | "average" | "wide_set",
  "eyeDepth": "deep_set" | "average" | "prominent",
  "eyelidType": "visible_crease" | "hooded" | "monolid",

  "// ===== EYEBROW ATTRIBUTES =====": "",
  "eyebrowShape": "arched" | "straight" | "curved" | "s_shaped" | "rounded",
  "eyebrowThickness": "thin" | "medium" | "thick" | "bushy",
  "eyebrowGap": "narrow" | "average" | "wide",

  "// ===== LIP ATTRIBUTES =====": "",
  "lipShape": "full" | "thin" | "heart" | "wide" | "round" | "bow_shaped",
  "lipSize": "thin" | "medium" | "full" | "very_full",
  "cupidsBow": "defined" | "soft" | "flat",

  "// ===== NOSE ATTRIBUTES =====": "",
  "noseShape": "straight" | "roman" | "button" | "snub" | "wide" | "narrow",
  "noseBridge": "low" | "medium" | "high",
  "noseWidth": "narrow" | "average" | "wide",

  "confidence": 0-100,
  "reasoning": "brief explanation of key observations"
}

IMPORTANT RULES:
- Be precise and conservative - set null for uncertain attributes
- Hair curlPattern: 1A-4C (Andre Walker system), 4A=defined coils, 4B=z-pattern, 4C=tight/dense
- Hair colorDepth: 1=jet black, 4=medium brown, 7=medium blonde, 10=platinum
- Skin fitzpatrickType: 1=very fair/always burns, 6=dark brown/never burns
- Face shape: Analyze forehead width, cheekbone width, jawline width, and face length ratio
- Eye shape: Look at crease visibility, corner angles, and lid coverage
- Return skinConcerns as an array (can be empty if none visible)`;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const KNOWN_STEP_IDS = ['front_face', 'side_profile', 'hair_front', 'hair_back', 'hair_closeup', 'hair_natural'];

function extractStepIdFromKey(key: string): string | null {
  const filename = key.split('/').pop() || '';
  const base = filename.split('.')[0] || '';
  const parts = base.split('-');
  for (const part of parts) {
    if (KNOWN_STEP_IDS.includes(part)) return part;
  }
  return null;
}

function determinePhotoType(key: string): 'profile' | 'hair' | 'headshot' {
  if (key.includes('headshot') || key.includes('head')) return 'headshot';
  if (key.includes('hair')) return 'hair';
  return 'profile';
}
