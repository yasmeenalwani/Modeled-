/**
 * Modeled Hair Engine - Frontend Utilities
 * 
 * MVP Version with:
 * - Trigger photo analysis
 * - Get user (simple) vs admin (detailed) views
 * - Submit user validations (proprietary data collection)
 */

// Mock mode for development (when Lambda not deployed)
const MOCK_MODE = import.meta.env.DEV && !import.meta.env.VITE_HAIR_ENGINE_LIVE;

/**
 * Trigger hair analysis for a photo
 * @param {string} photoKey - S3 key of the photo
 * @param {string} userId - User ID
 * @param {string} photoType - 'profile' | 'hair' | 'headshot'
 */
export async function analyzeHairPhoto(photoKey, userId, photoType = 'profile') {
  if (MOCK_MODE) {
    console.log('[Hair Engine] Mock mode - returning simulated analysis');
    return getMockAnalysisResult(photoType);
  }
  
  try {
    // In production, this would invoke the Lambda function
    // For now, using AppSync/GraphQL or direct Lambda invoke
    const response = await fetch('/api/hair-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bucket: 'modeled-storage',
        key: photoKey,
        userId,
        photoType,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Hair analysis failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('[Hair Engine] Analysis error:', error);
    // Return mock data as fallback in development
    if (import.meta.env.DEV) {
      return getMockAnalysisResult(photoType);
    }
    throw error;
  }
}

/**
 * Submit user validation of hair attributes (proprietary data collection)
 * @param {string} userId - User ID
 * @param {object} validatedAttributes - User-confirmed/corrected attributes
 */
export async function submitHairValidation(userId, validatedAttributes) {
  if (MOCK_MODE) {
    console.log('[Hair Engine] Mock mode - validation recorded:', validatedAttributes);
    return { success: true, message: 'Validation recorded (mock)' };
  }
  
  try {
    const response = await fetch('/api/hair-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        validateAttributes: validatedAttributes,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('[Hair Engine] Validation error:', error);
    throw error;
  }
}

/**
 * Get simple (user-facing) attributes
 * @param {object} analysisResult - Full analysis result
 */
export function getSimpleAttributes(analysisResult) {
  if (!analysisResult) return null;
  return analysisResult.userView || analysisResult.simple;
}

/**
 * Get detailed (admin-only) attributes
 * @param {object} analysisResult - Full analysis result
 */
export function getDetailedAttributes(analysisResult) {
  if (!analysisResult) return null;
  return analysisResult.adminView || analysisResult.detailed;
}

/**
 * Get confidence scores
 */
export function getConfidenceScores(analysisResult) {
  if (!analysisResult) return {};
  return analysisResult.confidence || {};
}

/**
 * Check if any attribute has low confidence (needs user validation)
 */
export function hasLowConfidenceAttributes(analysisResult, threshold = 70) {
  const confidence = getConfidenceScores(analysisResult);
  return Object.values(confidence).some(score => score < threshold);
}

/**
 * Get attributes that need user validation
 */
export function getAttributesNeedingValidation(analysisResult, threshold = 70) {
  const confidence = getConfidenceScores(analysisResult);
  return Object.entries(confidence)
    .filter(([_, score]) => score < threshold)
    .map(([attr, _]) => attr);
}

// ============ DISPLAY HELPERS ============

/**
 * Get user-friendly label for hair length
 */
export function getHairLengthLabel(length) {
  const labels = {
    short: 'Short',
    medium: 'Medium',
    long: 'Long',
    extra_long: 'Extra Long',
  };
  return labels[length] || length;
}

/**
 * Get user-friendly label for hair color
 */
export function getHairColorLabel(color) {
  const labels = {
    black: 'Black',
    brown: 'Brown',
    blonde: 'Blonde',
    red: 'Red',
    gray: 'Gray/Silver',
    colored: 'Colored/Fantasy',
  };
  return labels[color] || color;
}

/**
 * Get user-friendly label for hair texture
 */
export function getHairTextureLabel(texture) {
  const labels = {
    straight: 'Straight',
    wavy: 'Wavy',
    curly: 'Curly',
    coily: 'Coily',
  };
  return labels[texture] || texture;
}

/**
 * Get user-friendly label for hair density
 */
export function getHairDensityLabel(density) {
  const labels = {
    thin: 'Fine/Thin',
    medium: 'Medium',
    thick: 'Thick',
  };
  return labels[density] || density;
}

/**
 * Get detailed curl pattern description (admin only)
 */
export function getCurlPatternDescription(pattern) {
  const descriptions = {
    '1A': 'Type 1A - Fine, thin, straight',
    '1B': 'Type 1B - Medium straight',
    '1C': 'Type 1C - Coarse straight',
    '2A': 'Type 2A - Fine wavy',
    '2B': 'Type 2B - Medium wavy',
    '2C': 'Type 2C - Coarse wavy',
    '3A': 'Type 3A - Loose curls',
    '3B': 'Type 3B - Medium curls',
    '3C': 'Type 3C - Tight curls',
    '4A': 'Type 4A - Soft coils',
    '4B': 'Type 4B - Z-coils',
    '4C': 'Type 4C - Tight coils',
  };
  return descriptions[pattern] || pattern;
}

/**
 * Get color depth description (admin only)
 */
export function getColorDepthDescription(depth) {
  const descriptions = {
    1: 'Level 1 - Black',
    2: 'Level 2 - Very Dark Brown',
    3: 'Level 3 - Dark Brown',
    4: 'Level 4 - Medium Brown',
    5: 'Level 5 - Light Brown',
    6: 'Level 6 - Dark Blonde',
    7: 'Level 7 - Medium Blonde',
    8: 'Level 8 - Light Blonde',
    9: 'Level 9 - Very Light Blonde',
    10: 'Level 10 - Lightest Blonde',
  };
  return descriptions[depth] || `Level ${depth}`;
}

/**
 * Get confidence badge color
 */
export function getConfidenceBadgeColor(confidence) {
  if (confidence >= 85) return '#4CAF50'; // Green
  if (confidence >= 70) return '#FFC107'; // Yellow
  return '#FF5722'; // Orange/Red
}

/**
 * Get confidence label
 */
export function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Medium';
  return 'Low';
}

// ============ MOCK DATA (Development) ============

function getMockAnalysisResult(photoType) {
  // Simulate different results based on photo type
  const mockResults = {
    profile: {
      userView: {
        hairLength: 'long',
        hairColor: 'brown',
        hairTexture: 'curly',
        hairDensity: 'medium',
      },
      adminView: {
        hairLengthSpecific: 'mid-back',
        hairColorDepth: 4,
        hairColorUndertone: 'warm',
        hairColorNatural: 'medium brown',
        hairColorArtificial: null,
        curlPattern: '3B',
        hairPorosity: 'medium',
        hairHealth: {
          frizz: 'low',
          damage: 'none',
          shine: 'natural',
          splitEnds: false,
        },
        hairStyle: 'natural',
      },
      confidence: {
        hairLength: 88,
        hairColor: 82,
        hairTexture: 75,
        hairDensity: 68,
        curlPattern: 65,
        hairHealth: 60,
      },
      analysisVersion: 'MVP-1.0.0',
      analyzedAt: new Date().toISOString(),
    },
    hair: {
      userView: {
        hairLength: 'medium',
        hairColor: 'blonde',
        hairTexture: 'wavy',
        hairDensity: 'thick',
      },
      adminView: {
        hairLengthSpecific: 'shoulder',
        hairColorDepth: 7,
        hairColorUndertone: 'cool',
        hairColorNatural: 'medium blonde',
        hairColorArtificial: null,
        curlPattern: '2B',
        hairPorosity: 'low',
        hairHealth: {
          frizz: 'none',
          damage: 'none',
          shine: 'glossy',
          splitEnds: false,
        },
        hairStyle: 'natural',
      },
      confidence: {
        hairLength: 92,
        hairColor: 85,
        hairTexture: 80,
        hairDensity: 78,
        curlPattern: 72,
        hairHealth: 65,
      },
      analysisVersion: 'MVP-1.0.0',
      analyzedAt: new Date().toISOString(),
    },
    headshot: {
      userView: {
        hairLength: 'short',
        hairColor: 'black',
        hairTexture: 'coily',
        hairDensity: 'thick',
      },
      adminView: {
        hairLengthSpecific: 'ear-length',
        hairColorDepth: 2,
        hairColorUndertone: 'neutral',
        hairColorNatural: 'black',
        hairColorArtificial: null,
        curlPattern: '4B',
        hairPorosity: 'high',
        hairHealth: {
          frizz: 'low',
          damage: 'none',
          shine: 'natural',
          splitEnds: false,
        },
        hairStyle: 'twa',
      },
      confidence: {
        hairLength: 95,
        hairColor: 90,
        hairTexture: 85,
        hairDensity: 80,
        curlPattern: 75,
        hairHealth: 70,
      },
      analysisVersion: 'MVP-1.0.0',
      analyzedAt: new Date().toISOString(),
    },
  };
  
  return mockResults[photoType] || mockResults.profile;
}

// ============ VALIDATION OPTIONS (for user correction) ============

export const HAIR_LENGTH_OPTIONS = [
  { value: 'short', label: 'Short' },
  { value: 'medium', label: 'Medium' },
  { value: 'long', label: 'Long' },
  { value: 'extra_long', label: 'Extra Long' },
];

export const HAIR_COLOR_OPTIONS = [
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray/Silver' },
  { value: 'colored', label: 'Colored/Fantasy' },
];

export const HAIR_TEXTURE_OPTIONS = [
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'coily', label: 'Coily' },
];

export const HAIR_DENSITY_OPTIONS = [
  { value: 'thin', label: 'Fine/Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
];

