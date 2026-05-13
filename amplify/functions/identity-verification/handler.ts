import { RekognitionClient, CompareFacesCommand, DetectTextCommand } from '@aws-sdk/client-rekognition';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';

const rekognition = new RekognitionClient({ region: process.env.REGION || 'us-east-1' });
const s3 = new S3Client({ region: process.env.REGION || 'us-east-1' });

/** Minimum text lines we expect on a real government ID (name, DOB, number, etc.) */
const MIN_ID_TEXT_LINES = 3;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Content-Type': 'application/json',
};

/**
 * Identity Verification Handler
 *
 * Compares a selfie to an ID document photo using AWS Rekognition
 * Supports API Gateway REST API (POST body) and direct invocation
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Identity verification request:', JSON.stringify({ path: event.path, hasBody: !!event.body }, null, 2));

  const parsePayload = (): { idDocumentUrl: string; selfieUrl: string } | null => {
    if (event.body) {
      try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { idDocumentUrl, selfieUrl } = body || {};
        return idDocumentUrl && selfieUrl ? { idDocumentUrl, selfieUrl } : null;
      } catch {
        return null;
      }
    }
    const ev = event as { arguments?: Record<string, unknown>; idDocumentUrl?: string; selfieUrl?: string };
    const payload = ev?.arguments ?? ev;
    const { idDocumentUrl, selfieUrl } = (payload || {}) as { idDocumentUrl?: string; selfieUrl?: string };
    return idDocumentUrl && selfieUrl ? { idDocumentUrl, selfieUrl } : null;
  };

  const sendResponse = (statusCode: number, body: Record<string, unknown>): APIGatewayProxyResult => ({
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  });

  try {
    const payload = parsePayload();
    if (!payload) {
      return sendResponse(400, { error: 'Missing required parameters: idDocumentUrl and selfieUrl' });
    }

    const { idDocumentUrl, selfieUrl } = payload;

    // Extract S3 keys from URLs (strip query params for presigned URLs)
    const idKey = extractS3Key(idDocumentUrl);
    const selfieKey = extractS3Key(selfieUrl);

    if (!idKey || !selfieKey) {
      return sendResponse(400, { error: 'Invalid S3 URLs provided' });
    }

    // Get images from S3
    const [idImage, selfieImage] = await Promise.all([
      getS3Object(idKey),
      getS3Object(selfieKey),
    ]);

    // Validate that the ID image looks like a document (government IDs have visible text)
    const textResult = await rekognition.send(new DetectTextCommand({
      Image: { Bytes: idImage },
    }));
    const lineCount = (textResult.TextDetections || []).filter((t: any) => t.Type === 'LINE').length;
    if (lineCount < MIN_ID_TEXT_LINES) {
      console.log('ID document validation failed: insufficient text', { lineCount, minRequired: MIN_ID_TEXT_LINES });
      return sendResponse(400, {
        verified: false,
        confidence: 0,
        status: 'failed',
        message: 'This doesn\'t look like a government ID. Please upload a clear photo of your ID document (driver\'s license, passport, or state ID) with all text visible.',
      });
    }

    // Compare faces using Rekognition
    const compareCommand = new CompareFacesCommand({
      SourceImage: { Bytes: selfieImage }, // Selfie
      TargetImage: { Bytes: idImage }, // ID photo
      SimilarityThreshold: 70, // Minimum 70% similarity
      QualityFilter: 'AUTO', // Filter low quality images
    });

    const result = await rekognition.send(compareCommand);

    // Extract confidence score
    const faceMatch = result.FaceMatches?.[0];
    const confidence = faceMatch?.Similarity || 0;
    const verified = confidence >= 80; // 80%+ = verified, 70-79% = manual review

    console.log('Rekognition result:', {
      confidence,
      verified,
      faceMatches: result.FaceMatches?.length || 0,
      sourceFaceDetails: result.SourceImageFace,
    });

    const responseBody = {
      verified,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
      status: verified ? 'verified' : confidence >= 70 ? 'manual_review' : 'failed',
      faceMatches: result.FaceMatches?.length || 0,
      message: verified
        ? `Identity verified with ${confidence.toFixed(1)}% confidence`
        : confidence >= 70
        ? `Verification needs manual review (${confidence.toFixed(1)}% confidence)`
        : `Verification failed (${confidence.toFixed(1)}% confidence). Please try again with clearer photos.`,
    };

    return sendResponse(200, responseBody);
  } catch (error: unknown) {
    console.error('Identity verification error:', error);

    return sendResponse(500, {
      verified: false,
      confidence: 0,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Verification failed',
      message: 'An error occurred during verification. Please try again.',
    });
  }
};

/**
 * Extract S3 key from URL (supports presigned URLs with query params)
 */
function extractS3Key(url: string): string | null {
  try {
    let key: string | null = null;
    if (url.includes('amazonaws.com')) {
      const match = url.match(/amazonaws\.com\/(.+?)(?:\?|$)/);
      key = match ? decodeURIComponent(match[1]) : null;
    } else if (url.startsWith('/') || !url.includes('://')) {
      key = url.startsWith('/') ? url.substring(1) : url;
    }
    return key ? key.split('?')[0] : null; // Strip query params
  } catch (error) {
    console.error('Error extracting S3 key:', error);
    return null;
  }
}

/**
 * Get object from S3
 */
async function getS3Object(key: string): Promise<Uint8Array> {
  try {
    // Amplify sets MODELEDSTORAGE_BUCKET_NAME when storage access is granted
    const bucketName = process.env.MODELEDSTORAGE_BUCKET_NAME || process.env.STORAGE_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('Storage bucket not configured. Grant identity-verification Lambda read access to storage.');
    }
    
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3.send(command);
    const body = response.Body;
    if (!body) throw new Error('Empty S3 response');
    const bytes = await body.transformToByteArray();
    return Buffer.from(bytes);
  } catch (error) {
    console.error('Error getting S3 object:', error);
    throw new Error(`Failed to retrieve image from S3: ${error instanceof Error ? error.message : String(error)}`);
  }
}

