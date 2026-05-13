/**
 * Modeled Beauty Engine - Attribute Mapper
 * 
 * MVP Version with:
 * - Skin tone and undertone analysis
 * - Face shape detection
 * - Eye color and shape analysis
 * - Eyebrow analysis
 * - Lip analysis
 * - User view (simple) vs Admin view (detailed)
 * 
 * COMMERCIAL DATASETS USED:
 * - FairFace (Apache 2.0) - Balanced demographics for skin tone
 */

// ============ TYPES ============

export interface BeautyAnalysisResult {
  // User-facing (simple) attributes
  simple: {
    // Skin
    skinTone: 'fair' | 'light' | 'medium' | 'olive' | 'tan' | 'brown' | 'dark' | null;
    skinUndertone: 'warm' | 'cool' | 'neutral' | null;
    skinType: 'dry' | 'normal' | 'oily' | 'combination' | null;
    
    // Face
    faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong' | 'diamond' | null;
    
    // Eyes
    eyeColor: 'brown' | 'blue' | 'green' | 'hazel' | 'gray' | 'amber' | null;
    eyeShape: 'almond' | 'round' | 'hooded' | 'monolid' | 'downturned' | 'upturned' | null;
    
    // Eyebrows
    eyebrowShape: 'arched' | 'straight' | 'curved' | 's_shaped' | 'rounded' | null;
    eyebrowThickness: 'thin' | 'medium' | 'thick' | 'bushy' | null;
    
    // Lips
    lipShape: 'full' | 'thin' | 'heart' | 'wide' | 'round' | 'bow_shaped' | null;
    lipSize: 'thin' | 'medium' | 'full' | 'very_full' | null;
  };
  
  // Admin-only (detailed) attributes
  detailed: {
    // Skin
    skinToneDetailed: {
      fitzpatrick: number; // 1-6 scale
      hex: string;
      description: string;
    } | null;
    skinConcerns: string[];
    skinTexture: 'smooth' | 'normal' | 'textured' | 'rough' | null;
    
    // Face
    faceShapeDetailed: {
      primary: string;
      secondary: string | null;
      proportions: {
        foreheadWidth: number;
        cheekboneWidth: number;
        jawWidth: number;
        faceLength: number;
      };
    } | null;
    faceLength: 'short' | 'average' | 'long' | null;
    foreheadSize: 'small' | 'average' | 'large' | null;
    cheekboneProminence: 'flat' | 'average' | 'prominent' | null;
    jawlineType: 'soft' | 'average' | 'defined' | 'angular' | null;
    chinShape: 'pointed' | 'rounded' | 'square' | 'recessed' | null;
    
    // Eyes
    eyeColorDetailed: {
      primary: string;
      secondary: string | null;
      pattern: 'solid' | 'central_heterochromia' | 'sectoral' | 'speckled';
      intensity: 'light' | 'medium' | 'dark';
    } | null;
    eyeSize: 'small' | 'medium' | 'large' | null;
    eyeSpacing: 'close_set' | 'average' | 'wide_set' | null;
    eyeDepth: 'deep_set' | 'average' | 'prominent' | null;
    eyeLidType: 'visible_crease' | 'hooded' | 'monolid' | null;
    
    // Eyebrows
    eyebrowColorMatch: boolean;
    eyebrowGap: 'narrow' | 'average' | 'wide' | null;
    eyebrowTailLength: 'short' | 'medium' | 'long' | null;
    eyebrowArch: {
      position: 'high' | 'medium' | 'low';
      angle: number;
    } | null;
    
    // Lips
    lipProportions: {
      upperToLower: number;
      width: 'narrow' | 'average' | 'wide';
    } | null;
    lipColor: string | null;
    cupidsBow: 'defined' | 'soft' | 'flat' | null;
    
    // Nose
    noseShape: 'straight' | 'roman' | 'button' | 'snub' | 'wide' | 'narrow' | null;
    noseBridge: 'low' | 'medium' | 'high' | null;
    noseWidth: 'narrow' | 'average' | 'wide' | null;
  };
  
  // Confidence scores
  confidence: {
    skinTone: number;
    skinUndertone: number;
    faceShape: number;
    eyeColor: number;
    eyeShape: number;
    eyebrowShape: number;
    lipShape: number;
  };
  
  // Metadata
  analysisVersion: string;
  analyzedAt: string;
}

// ============ CLASSIFICATION MAPS ============

/**
 * Fitzpatrick Skin Type Scale
 * Used for detailed skin tone classification
 */
const FITZPATRICK_SCALE = {
  1: { name: 'Type I', description: 'Very fair, always burns, never tans', simple: 'fair' },
  2: { name: 'Type II', description: 'Fair, usually burns, tans minimally', simple: 'light' },
  3: { name: 'Type III', description: 'Light-medium, sometimes burns, tans uniformly', simple: 'medium' },
  4: { name: 'Type IV', description: 'Olive/moderate brown, rarely burns, tans easily', simple: 'olive' },
  5: { name: 'Type V', description: 'Brown, very rarely burns, tans very easily', simple: 'brown' },
  6: { name: 'Type VI', description: 'Dark brown/black, never burns, deeply pigmented', simple: 'dark' },
};

/**
 * Skin Tone to Simple Mapping
 */
const SKIN_TONE_MAP: { [key: string]: string } = {
  'very fair': 'fair',
  'fair': 'fair',
  'pale': 'fair',
  'light': 'light',
  'light-medium': 'medium',
  'medium': 'medium',
  'olive': 'olive',
  'tan': 'tan',
  'caramel': 'tan',
  'brown': 'brown',
  'dark brown': 'brown',
  'dark': 'dark',
  'deep': 'dark',
  'ebony': 'dark',
};

/**
 * Face Shape Classification
 */
const FACE_SHAPE_MAP = {
  oval: {
    description: 'Balanced proportions, slightly narrower at jaw',
    characteristics: ['Forehead slightly wider than chin', 'Soft curves', 'Balanced length'],
  },
  round: {
    description: 'Similar width and length with soft angles',
    characteristics: ['Full cheeks', 'Rounded chin', 'Equal width and length'],
  },
  square: {
    description: 'Strong jaw with angular features',
    characteristics: ['Wide forehead', 'Strong jaw', 'Similar width at forehead and jaw'],
  },
  heart: {
    description: 'Wider forehead narrowing to pointed chin',
    characteristics: ['Wide forehead', 'High cheekbones', 'Narrow chin'],
  },
  oblong: {
    description: 'Longer than wide with balanced features',
    characteristics: ['Long face', 'Similar width throughout', 'High forehead'],
  },
  diamond: {
    description: 'Narrow forehead and chin, wide cheekbones',
    characteristics: ['Narrow forehead', 'High cheekbones', 'Pointed chin'],
  },
};

/**
 * Eye Color Classification
 */
const EYE_COLOR_MAP = {
  brown: { variations: ['dark brown', 'medium brown', 'light brown', 'chocolate'], simple: 'brown' },
  blue: { variations: ['light blue', 'sky blue', 'deep blue', 'gray-blue'], simple: 'blue' },
  green: { variations: ['emerald', 'light green', 'olive green', 'teal'], simple: 'green' },
  hazel: { variations: ['hazel', 'gold-brown', 'greenish-brown'], simple: 'hazel' },
  gray: { variations: ['gray', 'silver', 'slate'], simple: 'gray' },
  amber: { variations: ['amber', 'golden', 'honey'], simple: 'amber' },
};

/**
 * Eye Shape Classification
 */
const EYE_SHAPE_MAP = {
  almond: { description: 'Pointed corners, wider in middle', indicators: ['visible crease', 'tapered ends'] },
  round: { description: 'More circular, whites visible above/below iris', indicators: ['wide open', 'circular'] },
  hooded: { description: 'Crease hidden by upper lid', indicators: ['heavy lid', 'hidden crease'] },
  monolid: { description: 'No visible crease', indicators: ['flat surface', 'no crease'] },
  downturned: { description: 'Outer corners point down', indicators: ['drooping outer corner'] },
  upturned: { description: 'Outer corners point up', indicators: ['lifted outer corner', 'cat eye'] },
};

/**
 * Eyebrow Shape Classification
 */
const EYEBROW_SHAPE_MAP = {
  arched: { description: 'High arch point, dramatic curve' },
  straight: { description: 'Minimal arch, horizontal line' },
  curved: { description: 'Soft, rounded arch' },
  s_shaped: { description: 'S-curve with multiple angles' },
  rounded: { description: 'Soft arch, no sharp angles' },
};

/**
 * Lip Shape Classification
 */
const LIP_SHAPE_MAP = {
  full: { description: 'Full upper and lower lips' },
  thin: { description: 'Narrower upper and lower lips' },
  heart: { description: 'Pronounced cupid\'s bow' },
  wide: { description: 'Wider mouth, extended corners' },
  round: { description: 'Circular, rounded shape' },
  bow_shaped: { description: 'Defined cupid\'s bow with full center' },
};

// ============ MAIN MAPPER CLASS ============

export class BeautyAttributeMapper {
  static readonly VERSION = 'MVP-1.0.0';
  
  /**
   * Map Rekognition and Bedrock results to beauty attributes
   */
  static mapToBeautyAttributes(
    rekognitionResults: any,
    bedrockResults: any | null
  ): BeautyAnalysisResult {
    const now = new Date().toISOString();
    
    // Initialize result structure
    const result: BeautyAnalysisResult = {
      simple: {
        skinTone: null,
        skinUndertone: null,
        skinType: null,
        faceShape: null,
        eyeColor: null,
        eyeShape: null,
        eyebrowShape: null,
        eyebrowThickness: null,
        lipShape: null,
        lipSize: null,
      },
      detailed: {
        skinToneDetailed: null,
        skinConcerns: [],
        skinTexture: null,
        faceShapeDetailed: null,
        faceLength: null,
        foreheadSize: null,
        cheekboneProminence: null,
        jawlineType: null,
        chinShape: null,
        eyeColorDetailed: null,
        eyeSize: null,
        eyeSpacing: null,
        eyeDepth: null,
        eyeLidType: null,
        eyebrowColorMatch: true,
        eyebrowGap: null,
        eyebrowTailLength: null,
        eyebrowArch: null,
        lipProportions: null,
        lipColor: null,
        cupidsBow: null,
        noseShape: null,
        noseBridge: null,
        noseWidth: null,
      },
      confidence: {
        skinTone: 0,
        skinUndertone: 0,
        faceShape: 0,
        eyeColor: 0,
        eyeShape: 0,
        eyebrowShape: 0,
        lipShape: 0,
      },
      analysisVersion: this.VERSION,
      analyzedAt: now,
    };
    
    // If Bedrock provided structured analysis, use it
    if (bedrockResults?.analysis) {
      try {
        const bedrockJson = this.extractJsonFromBedrock(bedrockResults.analysis);
        if (bedrockJson) {
          return this.mapBedrockToBeautyAttributes(bedrockJson, result);
        }
      } catch (error) {
        console.warn('Failed to parse Bedrock beauty JSON, falling back to Rekognition');
      }
    }
    
    // Fallback: Map Rekognition labels
    return this.mapRekognitionToBeautyAttributes(rekognitionResults, result);
  }
  
  /**
   * Extract JSON from Bedrock response
   */
  private static extractJsonFromBedrock(analysis: string): any | null {
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }
  
  /**
   * Map Bedrock analysis to beauty attributes
   */
  private static mapBedrockToBeautyAttributes(
    bedrockJson: any,
    result: BeautyAnalysisResult
  ): BeautyAnalysisResult {
    const baseConfidence = bedrockJson.confidence || 75;
    
    // ============ SKIN ============
    if (bedrockJson.skinTone) {
      const skin = this.classifySkinTone(bedrockJson.skinTone, bedrockJson.skinUndertone);
      result.simple.skinTone = skin.simple as any;
      result.simple.skinUndertone = skin.undertone as any;
      result.detailed.skinToneDetailed = skin.detailed;
      result.confidence.skinTone = baseConfidence;
      result.confidence.skinUndertone = baseConfidence - 5;
    }
    
    if (bedrockJson.skinType) {
      result.simple.skinType = this.normalizeSkinType(bedrockJson.skinType) as any;
    }
    
    if (bedrockJson.skinConcerns) {
      result.detailed.skinConcerns = Array.isArray(bedrockJson.skinConcerns) 
        ? bedrockJson.skinConcerns 
        : [bedrockJson.skinConcerns];
    }
    
    if (bedrockJson.skinTexture) {
      result.detailed.skinTexture = this.normalizeSkinTexture(bedrockJson.skinTexture) as any;
    }
    
    // ============ FACE ============
    if (bedrockJson.faceShape) {
      const face = this.classifyFaceShape(bedrockJson.faceShape, bedrockJson);
      result.simple.faceShape = face.simple as any;
      result.detailed.faceShapeDetailed = face.detailed;
      result.confidence.faceShape = baseConfidence - 10;
    }
    
    if (bedrockJson.faceLength) {
      result.detailed.faceLength = this.normalizeFaceLength(bedrockJson.faceLength) as any;
    }
    if (bedrockJson.jawline || bedrockJson.jawlineType) {
      result.detailed.jawlineType = this.normalizeJawline(bedrockJson.jawline || bedrockJson.jawlineType) as any;
    }
    if (bedrockJson.cheekbones) {
      result.detailed.cheekboneProminence = this.normalizeCheekbones(bedrockJson.cheekbones) as any;
    }
    
    // ============ EYES ============
    if (bedrockJson.eyeColor) {
      const eye = this.classifyEyeColor(bedrockJson.eyeColor);
      result.simple.eyeColor = eye.simple as any;
      result.detailed.eyeColorDetailed = eye.detailed;
      result.confidence.eyeColor = baseConfidence;
    }
    
    if (bedrockJson.eyeShape) {
      result.simple.eyeShape = this.normalizeEyeShape(bedrockJson.eyeShape) as any;
      result.confidence.eyeShape = baseConfidence - 10;
    }
    
    if (bedrockJson.eyeSize) {
      result.detailed.eyeSize = this.normalizeEyeSize(bedrockJson.eyeSize) as any;
    }
    if (bedrockJson.eyeSpacing) {
      result.detailed.eyeSpacing = this.normalizeEyeSpacing(bedrockJson.eyeSpacing) as any;
    }
    if (bedrockJson.eyeDepth) {
      result.detailed.eyeDepth = this.normalizeEyeDepth(bedrockJson.eyeDepth) as any;
    }
    if (bedrockJson.eyelidType || bedrockJson.eyeLidType) {
      result.detailed.eyeLidType = this.normalizeEyeLidType(bedrockJson.eyelidType || bedrockJson.eyeLidType) as any;
    }
    
    // ============ EYEBROWS ============
    if (bedrockJson.eyebrowShape) {
      result.simple.eyebrowShape = this.normalizeEyebrowShape(bedrockJson.eyebrowShape) as any;
      result.confidence.eyebrowShape = baseConfidence - 15;
    }
    if (bedrockJson.eyebrowThickness) {
      result.simple.eyebrowThickness = this.normalizeEyebrowThickness(bedrockJson.eyebrowThickness) as any;
    }
    if (bedrockJson.eyebrowGap) {
      result.detailed.eyebrowGap = this.normalizeEyebrowGap(bedrockJson.eyebrowGap) as any;
    }
    
    // ============ LIPS ============
    if (bedrockJson.lipShape) {
      result.simple.lipShape = this.normalizeLipShape(bedrockJson.lipShape) as any;
      result.confidence.lipShape = baseConfidence - 15;
    }
    if (bedrockJson.lipSize) {
      result.simple.lipSize = this.normalizeLipSize(bedrockJson.lipSize) as any;
    }
    if (bedrockJson.cupidsBow) {
      result.detailed.cupidsBow = this.normalizeCupidsBow(bedrockJson.cupidsBow) as any;
    }
    
    // ============ NOSE ============
    if (bedrockJson.noseShape) {
      result.detailed.noseShape = this.normalizeNoseShape(bedrockJson.noseShape) as any;
    }
    if (bedrockJson.noseBridge) {
      result.detailed.noseBridge = this.normalizeNoseBridge(bedrockJson.noseBridge) as any;
    }
    if (bedrockJson.noseWidth) {
      result.detailed.noseWidth = this.normalizeNoseWidth(bedrockJson.noseWidth) as any;
    }
    
    return result;
  }
  
  /**
   * Map Rekognition labels to beauty attributes (fallback)
   */
  private static mapRekognitionToBeautyAttributes(
    rekognitionResults: any,
    result: BeautyAnalysisResult
  ): BeautyAnalysisResult {
    const faces = rekognitionResults.faces || [];
    const labels = rekognitionResults.labels || [];
    
    // Build label map
    const labelMap = new Map<string, number>();
    labels.forEach((label: any) => {
      labelMap.set(label.Name.toLowerCase(), label.Confidence || 0);
    });
    
    // Get face details from first face
    if (faces.length > 0) {
      const face = faces[0];
      
      // Eye color (if detected)
      // Note: Rekognition doesn't directly provide eye color
      // This would require custom detection or Bedrock
      
      // Use face landmarks for shape analysis
      if (face.Landmarks) {
        const faceShape = this.analyzeFaceShapeFromLandmarks(face.Landmarks, face.BoundingBox);
        if (faceShape) {
          result.simple.faceShape = faceShape.simple as any;
          result.detailed.faceShapeDetailed = faceShape.detailed;
          result.confidence.faceShape = 60; // Lower confidence for rule-based
        }
      }
    }
    
    // Detect from labels
    const skinTone = this.detectSkinToneFromLabels(labelMap);
    if (skinTone) {
      result.simple.skinTone = skinTone.simple as any;
      result.confidence.skinTone = skinTone.confidence;
    }
    
    const eyeColor = this.detectEyeColorFromLabels(labelMap);
    if (eyeColor) {
      result.simple.eyeColor = eyeColor.simple as any;
      result.confidence.eyeColor = eyeColor.confidence;
    }
    
    return result;
  }
  
  // ============ CLASSIFICATION HELPERS ============
  
  /**
   * Classify skin tone
   */
  private static classifySkinTone(
    toneInput: string,
    undertoneInput?: string
  ): {
    simple: string;
    undertone: string;
    detailed: BeautyAnalysisResult['detailed']['skinToneDetailed'];
  } {
    const input = toneInput.toLowerCase().trim();
    
    // Determine simple tone
    let simple = 'medium';
    let fitzpatrick = 3;
    
    for (const [key, value] of Object.entries(SKIN_TONE_MAP)) {
      if (input.includes(key)) {
        simple = value;
        break;
      }
    }
    
    // Map to Fitzpatrick
    switch (simple) {
      case 'fair': fitzpatrick = 1; break;
      case 'light': fitzpatrick = 2; break;
      case 'medium': fitzpatrick = 3; break;
      case 'olive': fitzpatrick = 4; break;
      case 'tan': fitzpatrick = 4; break;
      case 'brown': fitzpatrick = 5; break;
      case 'dark': fitzpatrick = 6; break;
    }
    
    // Determine undertone
    let undertone = 'neutral';
    if (undertoneInput) {
      const ut = undertoneInput.toLowerCase();
      if (ut.includes('warm') || ut.includes('golden') || ut.includes('yellow')) {
        undertone = 'warm';
      } else if (ut.includes('cool') || ut.includes('pink') || ut.includes('blue')) {
        undertone = 'cool';
      }
    }
    
    return {
      simple,
      undertone,
      detailed: {
        fitzpatrick,
        hex: this.getFitzpatrickHex(fitzpatrick),
        description: FITZPATRICK_SCALE[fitzpatrick as keyof typeof FITZPATRICK_SCALE]?.description || '',
      },
    };
  }
  
  /**
   * Get hex color for Fitzpatrick type
   */
  private static getFitzpatrickHex(type: number): string {
    const hexMap: { [key: number]: string } = {
      1: '#FFE5D9',
      2: '#F5D5C8',
      3: '#E5B8A1',
      4: '#C99A6B',
      5: '#9B6B4A',
      6: '#5C4033',
    };
    return hexMap[type] || '#D4A574';
  }
  
  /**
   * Classify face shape
   */
  private static classifyFaceShape(
    shapeInput: string,
    fullData?: any
  ): {
    simple: string;
    detailed: BeautyAnalysisResult['detailed']['faceShapeDetailed'];
  } {
    const input = shapeInput.toLowerCase().trim();
    
    let simple = 'oval';
    for (const shape of Object.keys(FACE_SHAPE_MAP)) {
      if (input.includes(shape)) {
        simple = shape;
        break;
      }
    }
    
    return {
      simple,
      detailed: {
        primary: simple,
        secondary: fullData?.secondaryFaceShape || null,
        proportions: {
          foreheadWidth: fullData?.foreheadWidth || 0,
          cheekboneWidth: fullData?.cheekboneWidth || 0,
          jawWidth: fullData?.jawWidth || 0,
          faceLength: fullData?.faceLength || 0,
        },
      },
    };
  }
  
  /**
   * Classify eye color
   */
  private static classifyEyeColor(
    colorInput: string
  ): {
    simple: string;
    detailed: BeautyAnalysisResult['detailed']['eyeColorDetailed'];
  } {
    const input = colorInput.toLowerCase().trim();
    
    let simple = 'brown';
    let primary = input;
    
    for (const [color, data] of Object.entries(EYE_COLOR_MAP)) {
      if (input.includes(color) || data.variations.some(v => input.includes(v))) {
        simple = data.simple;
        primary = color;
        break;
      }
    }
    
    return {
      simple,
      detailed: {
        primary,
        secondary: null,
        pattern: 'solid',
        intensity: input.includes('light') ? 'light' : input.includes('dark') ? 'dark' : 'medium',
      },
    };
  }
  
  /**
   * Analyze face shape from landmarks (rule-based)
   */
  private static analyzeFaceShapeFromLandmarks(
    landmarks: any[],
    boundingBox: any
  ): { simple: string; detailed: any } | null {
    try {
      // Get key landmarks
      const leftEye = landmarks.find((l: any) => l.Type === 'eyeLeft');
      const rightEye = landmarks.find((l: any) => l.Type === 'eyeRight');
      const nose = landmarks.find((l: any) => l.Type === 'nose');
      const mouthLeft = landmarks.find((l: any) => l.Type === 'mouthLeft');
      const mouthRight = landmarks.find((l: any) => l.Type === 'mouthRight');
      
      if (!leftEye || !rightEye || !nose || !mouthLeft || !mouthRight) {
        return null;
      }
      
      // Calculate proportions
      const eyeDistance = Math.abs(rightEye.X - leftEye.X);
      const mouthWidth = Math.abs(mouthRight.X - mouthLeft.X);
      const faceWidth = boundingBox.Width;
      const faceHeight = boundingBox.Height;
      
      const widthToHeightRatio = faceWidth / faceHeight;
      const eyeToMouthRatio = eyeDistance / mouthWidth;
      
      // Determine face shape based on proportions
      let simple = 'oval';
      
      if (widthToHeightRatio > 0.9) {
        simple = 'round';
      } else if (widthToHeightRatio < 0.7) {
        simple = 'oblong';
      } else if (eyeToMouthRatio > 1.2) {
        simple = 'heart';
      } else if (eyeToMouthRatio < 0.85) {
        simple = 'square';
      }
      
      return {
        simple,
        detailed: {
          primary: simple,
          secondary: null,
          proportions: {
            foreheadWidth: boundingBox.Width,
            cheekboneWidth: eyeDistance * 1.5,
            jawWidth: mouthWidth * 1.2,
            faceLength: boundingBox.Height,
          },
        },
      };
    } catch {
      return null;
    }
  }
  
  // ============ DETECTION FROM LABELS ============
  
  private static detectSkinToneFromLabels(
    labelMap: Map<string, number>
  ): { simple: string; confidence: number } | null {
    const toneKeywords: { [key: string]: string } = {
      'fair skin': 'fair',
      'pale': 'fair',
      'light skin': 'light',
      'medium skin': 'medium',
      'olive': 'olive',
      'tan': 'tan',
      'brown skin': 'brown',
      'dark skin': 'dark',
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, tone] of Object.entries(toneKeywords)) {
        if (label.includes(keyword) && conf > 50) {
          return { simple: tone, confidence: Math.min(conf, 75) };
        }
      }
    }
    
    return null;
  }
  
  private static detectEyeColorFromLabels(
    labelMap: Map<string, number>
  ): { simple: string; confidence: number } | null {
    const colorKeywords: { [key: string]: string } = {
      'brown eyes': 'brown',
      'blue eyes': 'blue',
      'green eyes': 'green',
      'hazel eyes': 'hazel',
      'gray eyes': 'gray',
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, color] of Object.entries(colorKeywords)) {
        if (label.includes(keyword) && conf > 50) {
          return { simple: color, confidence: Math.min(conf, 80) };
        }
      }
    }
    
    return null;
  }
  
  // ============ NORMALIZATION HELPERS ============
  
  private static normalizeSkinType(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('dry')) return 'dry';
    if (i.includes('oily')) return 'oily';
    if (i.includes('combination') || i.includes('combo')) return 'combination';
    return 'normal';
  }
  
  private static normalizeSkinTexture(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('smooth')) return 'smooth';
    if (i.includes('textured') || i.includes('uneven')) return 'textured';
    if (i.includes('rough')) return 'rough';
    return 'normal';
  }
  
  private static normalizeFaceLength(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('short')) return 'short';
    if (i.includes('long')) return 'long';
    return 'average';
  }
  
  private static normalizeJawline(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('soft') || i.includes('round')) return 'soft';
    if (i.includes('angular') || i.includes('sharp')) return 'angular';
    if (i.includes('defined') || i.includes('strong')) return 'defined';
    return 'average';
  }
  
  private static normalizeCheekbones(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('prominent') || i.includes('high')) return 'prominent';
    if (i.includes('flat') || i.includes('low')) return 'flat';
    return 'average';
  }
  
  private static normalizeEyeShape(input: string): string {
    const i = input.toLowerCase();
    for (const shape of Object.keys(EYE_SHAPE_MAP)) {
      if (i.includes(shape.replace('_', ' '))) return shape;
    }
    if (i.includes('cat')) return 'upturned';
    return 'almond';
  }
  
  private static normalizeEyeSize(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('small')) return 'small';
    if (i.includes('large') || i.includes('big')) return 'large';
    return 'medium';
  }
  
  private static normalizeEyeSpacing(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('close')) return 'close_set';
    if (i.includes('wide') || i.includes('far')) return 'wide_set';
    return 'average';
  }
  
  private static normalizeEyeDepth(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('deep')) return 'deep_set';
    if (i.includes('prominent') || i.includes('protruding')) return 'prominent';
    return 'average';
  }
  
  private static normalizeEyeLidType(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('monolid') || i.includes('mono')) return 'monolid';
    if (i.includes('hooded')) return 'hooded';
    return 'visible_crease';
  }
  
  private static normalizeEyebrowShape(input: string): string {
    const i = input.toLowerCase();
    for (const shape of Object.keys(EYEBROW_SHAPE_MAP)) {
      if (i.includes(shape.replace('_', ' '))) return shape;
    }
    return 'curved';
  }
  
  private static normalizeEyebrowThickness(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('thin') || i.includes('sparse')) return 'thin';
    if (i.includes('thick') || i.includes('full')) return 'thick';
    if (i.includes('bushy') || i.includes('very thick')) return 'bushy';
    return 'medium';
  }
  
  private static normalizeEyebrowGap(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('narrow') || i.includes('close')) return 'narrow';
    if (i.includes('wide') || i.includes('far')) return 'wide';
    return 'average';
  }
  
  private static normalizeLipShape(input: string): string {
    const i = input.toLowerCase();
    for (const shape of Object.keys(LIP_SHAPE_MAP)) {
      if (i.includes(shape.replace('_', ' '))) return shape;
    }
    if (i.includes('cupid')) return 'bow_shaped';
    return 'round';
  }
  
  private static normalizeLipSize(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('thin') || i.includes('narrow')) return 'thin';
    if (i.includes('very full') || i.includes('plump')) return 'very_full';
    if (i.includes('full')) return 'full';
    return 'medium';
  }
  
  private static normalizeCupidsBow(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('defined') || i.includes('sharp') || i.includes('pronounced')) return 'defined';
    if (i.includes('flat') || i.includes('subtle')) return 'flat';
    return 'soft';
  }
  
  private static normalizeNoseShape(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('roman') || i.includes('aquiline')) return 'roman';
    if (i.includes('button')) return 'button';
    if (i.includes('snub') || i.includes('upturned')) return 'snub';
    if (i.includes('wide')) return 'wide';
    if (i.includes('narrow') || i.includes('thin')) return 'narrow';
    return 'straight';
  }
  
  private static normalizeNoseBridge(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('low') || i.includes('flat')) return 'low';
    if (i.includes('high') || i.includes('prominent')) return 'high';
    return 'medium';
  }
  
  private static normalizeNoseWidth(input: string): string {
    const i = input.toLowerCase();
    if (i.includes('narrow') || i.includes('thin')) return 'narrow';
    if (i.includes('wide') || i.includes('broad')) return 'wide';
    return 'average';
  }
  
  // ============ UTILITY METHODS ============
  
  /**
   * Get simple (user-facing) attributes only
   */
  static getSimpleAttributes(result: BeautyAnalysisResult): BeautyAnalysisResult['simple'] {
    return result.simple;
  }
  
  /**
   * Get detailed (admin-only) attributes
   */
  static getDetailedAttributes(result: BeautyAnalysisResult): BeautyAnalysisResult['detailed'] {
    return result.detailed;
  }
}

