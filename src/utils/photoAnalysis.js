/**
 * Photo Analysis Utilities
 * 
 * Functions to trigger and handle AI-powered photo analysis
 */

import { invoke } from 'aws-amplify/api';

/**
 * Trigger photo analysis for an uploaded photo
 * 
 * @param {string} photoKey - S3 key of the photo (e.g., 'profile-photos/models/user123/photo.jpg')
 * @param {string} userId - User ID
 * @param {string} photoType - 'profile' | 'hair' | 'headshot'
 * @returns {Promise<Object>} Analysis results with attributes and confidence scores
 */
export async function analyzePhoto(photoKey, userId, photoType = 'profile') {
  try {
    // Extract bucket name from environment or use default
    const bucket = 'modeledStorage'; // This should match your S3 bucket name
    
    const response = await invoke({
      apiName: 'photoAnalysis', // This will be the function name
      path: '/analyze',
      options: {
        body: {
          bucket,
          key: photoKey,
          userId,
          photoType,
        },
      },
    });
    
    const result = await response.body.json();
    
    if (result.success) {
      return result;
    } else {
      throw new Error(result.error || 'Photo analysis failed');
    }
  } catch (error) {
    console.error('Photo analysis error:', error);
    throw error;
  }
}

/**
 * Apply auto-tagged attributes to model profile
 * 
 * @param {string} modelId - Model profile ID
 * @param {Object} attributes - Attributes from analysis
 * @param {Object} confidence - Confidence scores
 * @returns {Promise<Object>} Updated profile
 */
export async function applyAutoTaggedAttributes(modelId, attributes, confidence) {
  try {
    // This would use your GraphQL API to update the ModelProfile
    // For now, returning a structure that can be used with your data API
    
    return {
      autoTaggedAttributes: attributes,
      attributeConfidence: confidence,
      lastPhotoAnalysis: new Date().toISOString(),
      photoAnalysisStatus: 'completed',
    };
  } catch (error) {
    console.error('Error applying auto-tagged attributes:', error);
    throw error;
  }
}

/**
 * Get attribute display name
 */
export function getAttributeDisplayName(attributeKey) {
  const displayNames = {
    hairColor: 'Hair Color',
    hairLength: 'Hair Length',
    hairTexture: 'Hair Texture',
    hairDensity: 'Hair Density',
    hairCondition: 'Hair Condition',
    hairVolume: 'High Volume',
    hairCurl: 'Natural Curl',
    skinTone: 'Skin Tone',
    eyeColor: 'Eye Color',
  };
  
  return displayNames[attributeKey] || attributeKey;
}

/**
 * Get confidence badge color
 */
export function getConfidenceColor(confidence) {
  if (confidence >= 80) return '#4caf50'; // Green - high confidence
  if (confidence >= 60) return '#ff9800'; // Orange - medium confidence
  return '#f44336'; // Red - low confidence
}

