/**
 * Modeled Hair Engine - Attribute Mapper
 * 
 * MVP Version with:
 * - Rule-based hair analysis
 * - User view (simple) vs Admin view (detailed)
 * - Proprietary data collection support
 * - Andre Walker curl pattern system (1A-4C)
 * - Color depth scale (1-10)
 * 
 * COMMERCIAL DATASETS USED:
 * - Black Hair Detection (Roboflow) - CC BY 4.0
 * - FairFace - Apache 2.0
 */

// ============ TYPES ============

export interface HairAnalysisResult {
  // User-facing (simple) attributes
  simple: {
    hairLength: 'short' | 'medium' | 'long' | 'extra_long' | null;
    hairColor: 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'colored' | null;
    hairTexture: 'straight' | 'wavy' | 'curly' | 'coily' | null;
    hairDensity: 'thin' | 'medium' | 'thick' | null;
  };
  
  // Admin-only (detailed) attributes
  detailed: {
    hairLengthSpecific: string | null; // "buzzed", "chin-length", "shoulder", "mid-back", "waist+"
    hairColorDepth: number | null; // 1-10 (1=black, 10=lightest blonde)
    hairColorUndertone: 'warm' | 'cool' | 'neutral' | null;
    hairColorNatural: string | null;
    hairColorArtificial: string | null;
    curlPattern: string | null; // "1A"-"4C" (Andre Walker system)
    hairPorosity: 'low' | 'medium' | 'high' | null;
    hairHealth: {
      frizz: 'none' | 'low' | 'medium' | 'high';
      damage: 'none' | 'mild' | 'moderate' | 'severe';
      shine: 'matte' | 'natural' | 'glossy' | 'high_shine';
      splitEnds: boolean;
    } | null;
    hairStyle: string | null; // "natural", "blowout", "braids", "locs", etc.
  };
  
  // Confidence scores
  confidence: {
    hairLength: number;
    hairColor: number;
    hairTexture: number;
    hairDensity: number;
    curlPattern: number;
    hairHealth: number;
  };
  
  // Metadata
  analysisVersion: string;
  analyzedAt: string;
  photoType: string;
}

export interface MappedAttributes {
  // Simple view (for users)
  simple: HairAnalysisResult['simple'];
  
  // Detailed view (for admin)
  detailed: HairAnalysisResult['detailed'];
  
  // Full attributes object (backwards compatible)
  attributes: {
    hairColor?: string;
    hairLength?: string;
    hairTexture?: string;
    hairDensity?: string;
    hairCondition?: string;
    hairVolume?: boolean;
    hairCurl?: boolean;
    skinTone?: string;
    eyeColor?: string;
    curlPattern?: string;
    hairColorDepth?: number;
  };
  
  // Confidence scores
  confidence: {
    [key: string]: number;
  };
  
  // Metadata
  analysisVersion: string;
  analyzedAt: string;
}

// ============ HAIR ENGINE CLASSIFICATION MAPS ============

/**
 * Andre Walker Hair Typing System
 * Used for detailed curl pattern classification
 */
const CURL_PATTERN_MAP = {
  // Type 1: Straight
  '1A': { description: 'Fine, thin, straight', texture: 'straight', characteristics: 'Very flat, no bend' },
  '1B': { description: 'Medium straight', texture: 'straight', characteristics: 'Has body, slight bend at ends' },
  '1C': { description: 'Coarse straight', texture: 'straight', characteristics: 'Most resistant to curling' },
  
  // Type 2: Wavy
  '2A': { description: 'Fine wavy', texture: 'wavy', characteristics: 'Loose, stretched S-pattern' },
  '2B': { description: 'Medium wavy', texture: 'wavy', characteristics: 'S-waves from mid-length' },
  '2C': { description: 'Coarse wavy', texture: 'wavy', characteristics: 'Thick waves, prone to frizz' },
  
  // Type 3: Curly
  '3A': { description: 'Loose curls', texture: 'curly', characteristics: 'Big, loose spirals' },
  '3B': { description: 'Medium curls', texture: 'curly', characteristics: 'Springy, bouncy curls' },
  '3C': { description: 'Tight curls', texture: 'curly', characteristics: 'Densely packed corkscrews' },
  
  // Type 4: Coily
  '4A': { description: 'Soft coils', texture: 'coily', characteristics: 'Defined S-pattern coils' },
  '4B': { description: 'Z-coils', texture: 'coily', characteristics: 'Sharp Z-angles, less defined' },
  '4C': { description: 'Tight coils', texture: 'coily', characteristics: 'Very tight, dense coils' },
};

/**
 * Hair Color Depth Scale (International Color Code)
 * 1 = Black, 10 = Lightest Blonde
 */
const COLOR_DEPTH_MAP: { [key: number]: { name: string; simple: string } } = {
  1: { name: 'Black', simple: 'black' },
  2: { name: 'Very Dark Brown', simple: 'black' },
  3: { name: 'Dark Brown', simple: 'brown' },
  4: { name: 'Medium Brown', simple: 'brown' },
  5: { name: 'Light Brown', simple: 'brown' },
  6: { name: 'Dark Blonde', simple: 'blonde' },
  7: { name: 'Medium Blonde', simple: 'blonde' },
  8: { name: 'Light Blonde', simple: 'blonde' },
  9: { name: 'Very Light Blonde', simple: 'blonde' },
  10: { name: 'Lightest Blonde', simple: 'blonde' },
};

/**
 * Hair Length Classification
 */
const LENGTH_MAP: { [key: string]: { simple: string; range: string } } = {
  'buzzed': { simple: 'short', range: 'Less than 1 inch' },
  'pixie': { simple: 'short', range: '1-3 inches' },
  'ear-length': { simple: 'short', range: 'At or above ears' },
  'chin-length': { simple: 'medium', range: 'At chin (bob)' },
  'shoulder': { simple: 'medium', range: 'At shoulders' },
  'armpit': { simple: 'long', range: 'At armpit level' },
  'mid-back': { simple: 'long', range: 'Middle of back' },
  'waist': { simple: 'extra_long', range: 'At waist level' },
  'hip': { simple: 'extra_long', range: 'At hip level' },
  'tailbone': { simple: 'extra_long', range: 'At tailbone' },
};

/**
 * Hairstyle Classifications (from Black Hair Detection dataset - CC BY 4.0)
 * These are commercially licensed for use
 */
const HAIRSTYLE_MAP = {
  'natural': 'Hair in natural/unmanipulated state',
  'afro': 'Natural afro hairstyle',
  'braids': 'Various braid styles',
  'cornrows': 'Cornrow braiding',
  'locs': 'Dreadlocks/locs',
  'sisterlocs': 'Smaller loc variations',
  'twists': 'Twisted styles',
  'bantu_knots': 'Bantu knot style',
  'blowout': 'Heat-styled smooth',
  'silk_press': 'Straightened natural hair',
  'wig': 'Wearing a wig',
  'weave': 'Hair weave/extensions',
  'ponytail': 'Hair in ponytail',
  'updo': 'Hair in updo style',
  'bob': 'Bob cut style',
  'twa': 'Teeny Weeny Afro',
  'fade': 'Fade cut style',
};

// ============ MAIN MAPPER CLASS ============

export class AttributeMapper {
  static readonly VERSION = 'MVP-1.0.0';
  
  /**
   * Map Rekognition and Bedrock results to our dual-view attribute system
   * Returns both simple (user-facing) and detailed (admin) attributes
   */
  static mapToAttributes(
    rekognitionResults: any,
    bedrockResults: any | null,
    photoType: 'profile' | 'hair' | 'headshot'
  ): MappedAttributes {
    const now = new Date().toISOString();
    
    // Initialize result structure
    const result: MappedAttributes = {
      simple: {
        hairLength: null,
        hairColor: null,
        hairTexture: null,
        hairDensity: null,
      },
      detailed: {
        hairLengthSpecific: null,
        hairColorDepth: null,
        hairColorUndertone: null,
        hairColorNatural: null,
        hairColorArtificial: null,
        curlPattern: null,
        hairPorosity: null,
        hairHealth: null,
        hairStyle: null,
      },
      attributes: {},
      confidence: {},
      analysisVersion: this.VERSION,
      analyzedAt: now,
    };
    
    // If Bedrock provided structured analysis, use it (more accurate)
    if (bedrockResults?.analysis) {
      try {
        const bedrockJson = this.extractJsonFromBedrock(bedrockResults.analysis);
        if (bedrockJson) {
          return this.mapBedrockToHairEngine(bedrockJson, result, photoType);
        }
      } catch (error) {
        console.warn('Failed to parse Bedrock JSON, falling back to Rekognition');
      }
    }
    
    // Fallback: Map Rekognition labels using rule-based analysis
    return this.mapRekognitionToHairEngine(rekognitionResults, result, photoType);
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
   * Map Bedrock structured analysis to hair engine format
   */
  private static mapBedrockToHairEngine(
    bedrockJson: any,
    result: MappedAttributes,
    photoType: string
  ): MappedAttributes {
    const baseConfidence = bedrockJson.confidence || 75;
    
    // Hair Length
    if (bedrockJson.hairLength) {
      const length = this.classifyHairLength(bedrockJson.hairLength);
      result.simple.hairLength = length.simple as any;
      result.detailed.hairLengthSpecific = length.specific;
      result.attributes.hairLength = length.simple;
      result.confidence.hairLength = baseConfidence;
    }
    
    // Hair Color with depth
    if (bedrockJson.hairColor) {
      const color = this.classifyHairColor(bedrockJson.hairColor, bedrockJson.undertone);
      result.simple.hairColor = color.simple as any;
      result.detailed.hairColorDepth = color.depth;
      result.detailed.hairColorUndertone = color.undertone as any;
      result.detailed.hairColorNatural = color.natural;
      result.detailed.hairColorArtificial = bedrockJson.colorTreatment || null;
      result.attributes.hairColor = color.simple;
      result.attributes.hairColorDepth = color.depth;
      result.confidence.hairColor = baseConfidence - 5;
    }
    
    // Hair Texture / Curl Pattern
    if (bedrockJson.hairTexture) {
      const texture = this.classifyHairTexture(bedrockJson.hairTexture, bedrockJson);
      result.simple.hairTexture = texture.simple as any;
      result.detailed.curlPattern = texture.curlPattern;
      result.attributes.hairTexture = texture.simple;
      result.attributes.curlPattern = texture.curlPattern ?? undefined;
      result.confidence.hairTexture = baseConfidence - 10;
      result.confidence.curlPattern = baseConfidence - 15;
    }
    
    // Hair Density
    if (bedrockJson.hairDensity) {
      const density = this.normalizeHairDensity(bedrockJson.hairDensity);
      result.simple.hairDensity = density as any;
      result.attributes.hairDensity = density;
      result.confidence.hairDensity = baseConfidence - 10;
    }
    
    // Hair Health (detailed only)
    result.detailed.hairHealth = {
      frizz: this.normalizeFrizzLevel(bedrockJson.frizz || bedrockJson.hairCondition) as any || 'low',
      damage: this.normalizeDamageLevel(bedrockJson.damage || bedrockJson.hairCondition) as any || 'none',
      shine: this.normalizeShine(bedrockJson.shine) as any || 'natural',
      splitEnds: bedrockJson.splitEnds || false,
    };
    result.confidence.hairHealth = baseConfidence - 20;
    
    // Hair Style
    if (bedrockJson.hairstyle || bedrockJson.hairStyle) {
      result.detailed.hairStyle = this.classifyHairStyle(bedrockJson.hairstyle || bedrockJson.hairStyle);
    }
    
    // Hair Porosity (if provided)
    if (bedrockJson.porosity || bedrockJson.hairPorosity) {
      result.detailed.hairPorosity = this.normalizePorosity(bedrockJson.porosity || bedrockJson.hairPorosity) as any;
    }
    
    // Additional attributes for backwards compatibility
    if (bedrockJson.skinTone) {
      result.attributes.skinTone = this.normalizeSkinTone(bedrockJson.skinTone);
    }
    if (bedrockJson.eyeColor) {
      result.attributes.eyeColor = this.normalizeEyeColor(bedrockJson.eyeColor);
    }
    result.attributes.hairCondition = this.normalizeHairCondition(bedrockJson.hairCondition);
    result.attributes.hairVolume = bedrockJson.hairVolume || false;
    result.attributes.hairCurl = ['wavy', 'curly', 'coily'].includes(result.simple.hairTexture || '');
    
    return result;
  }
  
  /**
   * Map Rekognition labels to hair engine format (rule-based MVP)
   */
  private static mapRekognitionToHairEngine(
    rekognitionResults: any,
    result: MappedAttributes,
    photoType: string
  ): MappedAttributes {
    const labels = rekognitionResults.labels || [];
    const faces = rekognitionResults.faces || [];
    
    // Build label map
    const labelMap = new Map<string, number>();
    labels.forEach((label: any) => {
      labelMap.set(label.Name.toLowerCase(), label.Confidence || 0);
    });
    
    // Hair Length Detection
    const length = this.detectHairLengthFromLabels(labelMap, faces);
    if (length) {
      result.simple.hairLength = length.simple as any;
      result.detailed.hairLengthSpecific = length.specific;
      result.attributes.hairLength = length.simple;
      result.confidence.hairLength = length.confidence;
    }
    
    // Hair Color Detection
    const color = this.detectHairColorFromLabels(labelMap);
    if (color) {
      result.simple.hairColor = color.simple as any;
      result.detailed.hairColorDepth = color.depth;
      result.detailed.hairColorNatural = color.natural;
      result.attributes.hairColor = color.simple;
      result.attributes.hairColorDepth = color.depth;
      result.confidence.hairColor = color.confidence;
    }
    
    // Hair Texture Detection
    const texture = this.detectHairTextureFromLabels(labelMap);
    if (texture) {
      result.simple.hairTexture = texture.simple as any;
      result.detailed.curlPattern = texture.curlPattern;
      result.attributes.hairTexture = texture.simple;
      result.attributes.curlPattern = texture.curlPattern ?? undefined;
      result.confidence.hairTexture = texture.confidence;
      result.confidence.curlPattern = texture.confidence - 10;
    }
    
    // Hair Density Detection
    const density = this.detectHairDensityFromLabels(labelMap);
    if (density) {
      result.simple.hairDensity = density.value as any;
      result.attributes.hairDensity = density.value;
      result.confidence.hairDensity = density.confidence;
    }
    
    // Hair Style Detection (using Black Hair Detection categories)
    const style = this.detectHairStyleFromLabels(labelMap);
    if (style) {
      result.detailed.hairStyle = style.value;
    }
    
    // Default hair health (conservative estimate from labels)
    result.detailed.hairHealth = {
      frizz: labelMap.has('frizzy') ? 'medium' : 'low',
      damage: 'none',
      shine: labelMap.has('shiny') ? 'glossy' : 'natural',
      splitEnds: false,
    };
    result.confidence.hairHealth = 50; // Lower confidence for rule-based
    
    // Additional attributes
    result.attributes.hairCurl = ['wavy', 'curly', 'coily'].includes(result.simple.hairTexture || '');
    result.attributes.hairVolume = labelMap.has('voluminous') || labelMap.has('thick');
    result.attributes.hairCondition = 'healthy'; // Default
    
    return result;
  }
  
  // ============ CLASSIFICATION HELPERS ============
  
  /**
   * Classify hair length to simple + specific
   */
  private static classifyHairLength(lengthInput: string): { simple: string; specific: string } {
    const input = lengthInput.toLowerCase().trim();
    
    // Check specific lengths first
    for (const [specific, data] of Object.entries(LENGTH_MAP)) {
      if (input.includes(specific)) {
        return { simple: data.simple, specific };
      }
    }
    
    // Fall back to simple classification
    if (input.includes('short') || input.includes('pixie') || input.includes('buzz')) {
      return { simple: 'short', specific: 'pixie' };
    }
    if (input.includes('extra') || input.includes('very long') || input.includes('waist')) {
      return { simple: 'extra_long', specific: 'waist' };
    }
    if (input.includes('long')) {
      return { simple: 'long', specific: 'mid-back' };
    }
    
    return { simple: 'medium', specific: 'shoulder' };
  }
  
  /**
   * Classify hair color with depth scale
   */
  private static classifyHairColor(
    colorInput: string,
    undertone?: string
  ): { simple: string; depth: number; undertone: string; natural: string } {
    const input = colorInput.toLowerCase().trim();
    
    // Detect depth and simple color
    let depth = 5; // Default medium
    let simple = 'brown';
    let natural = input;
    
    // Black
    if (input.includes('black')) {
      depth = input.includes('jet') ? 1 : 2;
      simple = 'black';
    }
    // Brown variations
    else if (input.includes('brown') || input.includes('brunette')) {
      if (input.includes('dark')) depth = 3;
      else if (input.includes('medium')) depth = 4;
      else if (input.includes('light')) depth = 5;
      else depth = 4;
      simple = 'brown';
    }
    // Blonde variations
    else if (input.includes('blonde') || input.includes('blond')) {
      if (input.includes('dark')) depth = 6;
      else if (input.includes('medium')) depth = 7;
      else if (input.includes('light')) depth = 8;
      else if (input.includes('very light') || input.includes('platinum')) depth = 9;
      else if (input.includes('lightest') || input.includes('white blonde')) depth = 10;
      else depth = 7;
      simple = 'blonde';
    }
    // Red
    else if (input.includes('red') || input.includes('ginger') || input.includes('auburn')) {
      depth = 5; // Red doesn't follow depth scale directly
      simple = 'red';
    }
    // Gray
    else if (input.includes('gray') || input.includes('grey') || input.includes('silver') || input.includes('white')) {
      depth = 8;
      simple = 'gray';
    }
    // Fantasy/Colored
    else if (input.includes('purple') || input.includes('pink') || input.includes('blue') || input.includes('green')) {
      depth = 5;
      simple = 'colored';
    }
    
    // Determine undertone
    let detectedUndertone = 'neutral';
    if (undertone) {
      detectedUndertone = undertone.toLowerCase().includes('warm') ? 'warm' :
                         undertone.toLowerCase().includes('cool') ? 'cool' : 'neutral';
    } else if (input.includes('ash') || input.includes('cool')) {
      detectedUndertone = 'cool';
    } else if (input.includes('golden') || input.includes('warm') || input.includes('honey')) {
      detectedUndertone = 'warm';
    }
    
    return { simple, depth, undertone: detectedUndertone, natural };
  }
  
  /**
   * Classify hair texture to simple + curl pattern
   */
  private static classifyHairTexture(
    textureInput: string,
    fullData?: any
  ): { simple: string; curlPattern: string | null } {
    const input = textureInput.toLowerCase().trim();
    
    // Check for specific curl patterns (1A-4C)
    const patternMatch = input.match(/([1-4][abc])/i);
    if (patternMatch) {
      const pattern = patternMatch[1].toUpperCase();
      const patternData = CURL_PATTERN_MAP[pattern as keyof typeof CURL_PATTERN_MAP];
      return {
        simple: patternData?.texture || 'curly',
        curlPattern: pattern,
      };
    }
    
    // Map texture descriptions to curl patterns
    if (input.includes('coily') || input.includes('kinky')) {
      // Determine 4A/4B/4C based on additional info
      if (input.includes('tight') || input.includes('dense')) return { simple: 'coily', curlPattern: '4C' };
      if (input.includes('z-pattern') || input.includes('zigzag')) return { simple: 'coily', curlPattern: '4B' };
      return { simple: 'coily', curlPattern: '4A' };
    }
    
    if (input.includes('curly') || input.includes('curl')) {
      if (input.includes('tight') || input.includes('corkscrew')) return { simple: 'curly', curlPattern: '3C' };
      if (input.includes('springy') || input.includes('bouncy')) return { simple: 'curly', curlPattern: '3B' };
      if (input.includes('loose')) return { simple: 'curly', curlPattern: '3A' };
      return { simple: 'curly', curlPattern: '3B' }; // Default curly
    }
    
    if (input.includes('wavy') || input.includes('wave')) {
      if (input.includes('coarse') || input.includes('thick waves')) return { simple: 'wavy', curlPattern: '2C' };
      if (input.includes('defined')) return { simple: 'wavy', curlPattern: '2B' };
      if (input.includes('loose') || input.includes('fine')) return { simple: 'wavy', curlPattern: '2A' };
      return { simple: 'wavy', curlPattern: '2B' }; // Default wavy
    }
    
    if (input.includes('straight')) {
      if (input.includes('coarse') || input.includes('thick')) return { simple: 'straight', curlPattern: '1C' };
      if (input.includes('fine') || input.includes('thin')) return { simple: 'straight', curlPattern: '1A' };
      return { simple: 'straight', curlPattern: '1B' }; // Default straight
    }
    
    return { simple: 'straight', curlPattern: '1B' }; // Default
  }
  
  /**
   * Classify hair style (using commercially-licensed categories)
   */
  private static classifyHairStyle(styleInput: string): string {
    const input = styleInput.toLowerCase().trim();
    
    for (const style of Object.keys(HAIRSTYLE_MAP)) {
      if (input.includes(style.replace('_', ' '))) {
        return style;
      }
    }
    
    // Additional matching
    if (input.includes('natural') || input.includes('down')) return 'natural';
    if (input.includes('braid')) return 'braids';
    if (input.includes('loc') || input.includes('dread')) return 'locs';
    if (input.includes('twist')) return 'twists';
    if (input.includes('afro')) return 'afro';
    if (input.includes('straight') || input.includes('silk')) return 'silk_press';
    
    return 'natural'; // Default
  }
  
  // ============ LABEL DETECTION HELPERS ============
  
  private static detectHairLengthFromLabels(
    labelMap: Map<string, number>,
    faces: any[]
  ): { simple: string; specific: string; confidence: number } | null {
    // Check for length keywords
    const lengthKeywords: { [key: string]: { simple: string; specific: string } } = {
      'short hair': { simple: 'short', specific: 'pixie' },
      'long hair': { simple: 'long', specific: 'mid-back' },
      'medium hair': { simple: 'medium', specific: 'shoulder' },
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, length] of Object.entries(lengthKeywords)) {
        if (label.includes(keyword) && conf > 60) {
          return { ...length, confidence: Math.min(conf, 80) };
        }
      }
    }
    
    // Infer from face bounding box if available
    if (faces.length > 0 && faces[0].BoundingBox) {
      const faceBox = faces[0].BoundingBox;
      // If face is in upper half of image, hair might be long
      if (faceBox.Top > 0.3) {
        return { simple: 'medium', specific: 'shoulder', confidence: 50 };
      }
    }
    
    return null;
  }
  
  private static detectHairColorFromLabels(
    labelMap: Map<string, number>
  ): { simple: string; depth: number; natural: string; confidence: number } | null {
    const colorKeywords: { [key: string]: { simple: string; depth: number } } = {
      'blonde': { simple: 'blonde', depth: 7 },
      'blond': { simple: 'blonde', depth: 7 },
      'brown': { simple: 'brown', depth: 4 },
      'brunette': { simple: 'brown', depth: 4 },
      'black hair': { simple: 'black', depth: 2 },
      'red hair': { simple: 'red', depth: 5 },
      'ginger': { simple: 'red', depth: 5 },
      'gray': { simple: 'gray', depth: 8 },
      'grey': { simple: 'gray', depth: 8 },
      'silver': { simple: 'gray', depth: 9 },
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, color] of Object.entries(colorKeywords)) {
        if (label.includes(keyword) && conf > 50) {
          return { ...color, natural: keyword, confidence: Math.min(conf, 85) };
        }
      }
    }
    
    return null;
  }
  
  private static detectHairTextureFromLabels(
    labelMap: Map<string, number>
  ): { simple: string; curlPattern: string; confidence: number } | null {
    // Texture keywords mapped to curl patterns
    const textureKeywords: { [key: string]: { simple: string; curlPattern: string } } = {
      'curly': { simple: 'curly', curlPattern: '3B' },
      'curl': { simple: 'curly', curlPattern: '3B' },
      'wavy': { simple: 'wavy', curlPattern: '2B' },
      'wave': { simple: 'wavy', curlPattern: '2B' },
      'straight': { simple: 'straight', curlPattern: '1B' },
      'coily': { simple: 'coily', curlPattern: '4A' },
      'afro': { simple: 'coily', curlPattern: '4B' },
      'kinky': { simple: 'coily', curlPattern: '4C' },
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, texture] of Object.entries(textureKeywords)) {
        if (label.includes(keyword) && conf > 50) {
          return { ...texture, confidence: Math.min(conf, 80) };
        }
      }
    }
    
    return null;
  }
  
  private static detectHairDensityFromLabels(
    labelMap: Map<string, number>
  ): { value: string; confidence: number } | null {
    const densityKeywords: { [key: string]: string } = {
      'thick': 'thick',
      'dense': 'thick',
      'voluminous': 'thick',
      'thin': 'thin',
      'fine': 'thin',
      'sparse': 'thin',
    };
    
    for (const [label, conf] of labelMap.entries()) {
      for (const [keyword, density] of Object.entries(densityKeywords)) {
        if (label.includes(keyword) && conf > 50) {
          return { value: density, confidence: Math.min(conf, 75) };
        }
      }
    }
    
    return null;
  }
  
  private static detectHairStyleFromLabels(
    labelMap: Map<string, number>
  ): { value: string } | null {
    // Check for specific hairstyle labels (from Black Hair Detection categories)
    const styleKeywords = Object.keys(HAIRSTYLE_MAP);
    
    for (const [label, conf] of labelMap.entries()) {
      for (const style of styleKeywords) {
        if (label.includes(style.replace('_', ' ')) && conf > 50) {
          return { value: style };
        }
      }
    }
    
    // Check for general styles
    if (labelMap.has('braid') || labelMap.has('braids')) return { value: 'braids' };
    if (labelMap.has('ponytail')) return { value: 'ponytail' };
    if (labelMap.has('updo')) return { value: 'updo' };
    
    return null;
  }
  
  // ============ NORMALIZATION HELPERS ============
  
  private static normalizeHairDensity(density: string): string {
    const d = density.toLowerCase().trim();
    if (d.includes('thin') || d.includes('fine') || d.includes('sparse')) return 'thin';
    if (d.includes('thick') || d.includes('dense') || d.includes('coarse')) return 'thick';
    return 'medium';
  }
  
  private static normalizePorosity(porosity: string): string {
    const p = porosity.toLowerCase().trim();
    if (p.includes('low')) return 'low';
    if (p.includes('high')) return 'high';
    return 'medium';
  }
  
  private static normalizeFrizzLevel(input?: string): string {
    if (!input) return 'low';
    const i = input.toLowerCase();
    if (i.includes('none') || i.includes('smooth')) return 'none';
    if (i.includes('high') || i.includes('very frizzy')) return 'high';
    if (i.includes('medium') || i.includes('some frizz')) return 'medium';
    return 'low';
  }
  
  private static normalizeDamageLevel(input?: string): string {
    if (!input) return 'none';
    const i = input.toLowerCase();
    if (i.includes('severe') || i.includes('very damaged')) return 'severe';
    if (i.includes('moderate') || i.includes('damaged')) return 'moderate';
    if (i.includes('mild') || i.includes('slight')) return 'mild';
    return 'none';
  }
  
  private static normalizeShine(input?: string): string {
    if (!input) return 'natural';
    const i = input.toLowerCase();
    if (i.includes('matte') || i.includes('dull')) return 'matte';
    if (i.includes('high') || i.includes('very shiny')) return 'high_shine';
    if (i.includes('glossy') || i.includes('shiny')) return 'glossy';
    return 'natural';
  }
  
  private static normalizeHairCondition(condition?: string): string {
    if (!condition) return 'healthy';
    const c = condition.toLowerCase();
    if (c.includes('virgin') || c.includes('untreated')) return 'virgin';
    if (c.includes('damaged') || c.includes('dry')) return 'damaged';
    if (c.includes('color') || c.includes('treated') || c.includes('dyed')) return 'color_treated';
    return 'healthy';
  }
  
  private static normalizeSkinTone(tone: string): string {
    const t = tone.toLowerCase().trim();
    const tones = ['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark'];
    for (const valid of tones) {
      if (t.includes(valid)) return valid;
    }
    return 'medium';
  }
  
  private static normalizeEyeColor(color: string): string {
    const c = color.toLowerCase().trim();
    const colors = ['brown', 'blue', 'green', 'hazel', 'gray'];
    for (const valid of colors) {
      if (c.includes(valid)) return valid;
    }
    return 'brown';
  }
  
  // ============ UTILITY METHODS ============
  
  /**
   * Get simple (user-facing) attributes only
   */
  static getSimpleAttributes(result: MappedAttributes): HairAnalysisResult['simple'] {
    return result.simple;
  }
  
  /**
   * Get detailed (admin-only) attributes
   */
  static getDetailedAttributes(result: MappedAttributes): HairAnalysisResult['detailed'] {
    return result.detailed;
  }
  
  /**
   * Convert detailed curl pattern to user-friendly text
   */
  static getCurlPatternDescription(pattern: string | null): string {
    if (!pattern) return 'Unknown';
    const data = CURL_PATTERN_MAP[pattern as keyof typeof CURL_PATTERN_MAP];
    return data?.description || pattern;
  }
  
  /**
   * Convert color depth to user-friendly text
   */
  static getColorDepthDescription(depth: number | null): string {
    if (!depth) return 'Unknown';
    return COLOR_DEPTH_MAP[depth]?.name || `Level ${depth}`;
  }
}
