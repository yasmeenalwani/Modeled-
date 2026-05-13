/**
 * Modeled Beauty Engine - Frontend Utilities
 * 
 * MVP Version with:
 * - Skin tone, undertone, type analysis
 * - Face shape detection
 * - Eye color and shape analysis
 * - Eyebrow and lip analysis
 * - User view (simple) vs Admin view (detailed)
 */

// Mock mode for development
const MOCK_MODE = import.meta.env.DEV && !import.meta.env.VITE_BEAUTY_ENGINE_LIVE;

/**
 * Get simple (user-facing) beauty attributes
 */
export function getSimpleBeautyAttributes(analysisResult) {
  if (!analysisResult) return null;
  return analysisResult.beauty?.userView || analysisResult.userView;
}

/**
 * Get detailed (admin-only) beauty attributes
 */
export function getDetailedBeautyAttributes(analysisResult) {
  if (!analysisResult) return null;
  return analysisResult.beauty?.adminView || analysisResult.adminView;
}

/**
 * Get confidence scores for beauty attributes
 */
export function getBeautyConfidenceScores(analysisResult) {
  if (!analysisResult) return {};
  return analysisResult.beauty?.confidence || analysisResult.confidence || {};
}

// ============ DISPLAY HELPERS - SKIN ============

export function getSkinToneLabel(tone) {
  const labels = {
    fair: 'Fair',
    light: 'Light',
    medium: 'Medium',
    olive: 'Olive',
    tan: 'Tan',
    brown: 'Brown',
    dark: 'Dark',
  };
  return labels[tone] || tone;
}

export function getSkinToneEmoji(tone) {
  const emojis = {
    fair: '🏻',
    light: '🏻',
    medium: '🏽',
    olive: '🏽',
    tan: '🏽',
    brown: '🏾',
    dark: '🏿',
  };
  return emojis[tone] || '🏽';
}

export function getSkinUndertoneLabel(undertone) {
  const labels = {
    warm: 'Warm (golden/yellow)',
    cool: 'Cool (pink/blue)',
    neutral: 'Neutral',
  };
  return labels[undertone] || undertone;
}

export function getSkinTypeLabel(type) {
  const labels = {
    dry: 'Dry',
    normal: 'Normal',
    oily: 'Oily',
    combination: 'Combination',
  };
  return labels[type] || type;
}

export function getFitzpatrickDescription(type) {
  const descriptions = {
    1: 'Type I - Very fair, always burns, never tans',
    2: 'Type II - Fair, usually burns, tans minimally',
    3: 'Type III - Light-medium, sometimes burns, tans uniformly',
    4: 'Type IV - Olive/moderate brown, rarely burns, tans easily',
    5: 'Type V - Brown, very rarely burns, tans very easily',
    6: 'Type VI - Dark brown/black, never burns, deeply pigmented',
  };
  return descriptions[type] || `Type ${type}`;
}

// ============ DISPLAY HELPERS - FACE ============

export function getFaceShapeLabel(shape) {
  const labels = {
    oval: 'Oval',
    round: 'Round',
    square: 'Square',
    heart: 'Heart',
    oblong: 'Oblong',
    diamond: 'Diamond',
  };
  return labels[shape] || shape;
}

export function getFaceShapeDescription(shape) {
  const descriptions = {
    oval: 'Balanced proportions, slightly narrower at jaw',
    round: 'Similar width and length with soft angles',
    square: 'Strong jaw with angular features',
    heart: 'Wider forehead narrowing to pointed chin',
    oblong: 'Longer than wide with balanced features',
    diamond: 'Narrow forehead and chin, wide cheekbones',
  };
  return descriptions[shape] || '';
}

export function getFaceShapeIcon(shape) {
  const icons = {
    oval: '⬭',
    round: '⬤',
    square: '◼',
    heart: '♥',
    oblong: '▯',
    diamond: '◇',
  };
  return icons[shape] || '○';
}

// ============ DISPLAY HELPERS - EYES ============

export function getEyeColorLabel(color) {
  const labels = {
    brown: 'Brown',
    blue: 'Blue',
    green: 'Green',
    hazel: 'Hazel',
    gray: 'Gray',
    amber: 'Amber',
  };
  return labels[color] || color;
}

export function getEyeColorEmoji(color) {
  const emojis = {
    brown: '🟤',
    blue: '🔵',
    green: '🟢',
    hazel: '🟠',
    gray: '⚪',
    amber: '🟡',
  };
  return emojis[color] || '👁';
}

export function getEyeShapeLabel(shape) {
  const labels = {
    almond: 'Almond',
    round: 'Round',
    hooded: 'Hooded',
    monolid: 'Monolid',
    downturned: 'Downturned',
    upturned: 'Upturned',
  };
  return labels[shape] || shape;
}

export function getEyeShapeDescription(shape) {
  const descriptions = {
    almond: 'Pointed corners, wider in middle - versatile for any look',
    round: 'More circular, expressive and open',
    hooded: 'Crease hidden by upper lid - focus on outer corners',
    monolid: 'No visible crease - beautiful canvas for creative looks',
    downturned: 'Outer corners point down - lift with liner techniques',
    upturned: 'Outer corners point up - natural cat-eye effect',
  };
  return descriptions[shape] || '';
}

// ============ DISPLAY HELPERS - EYEBROWS ============

export function getEyebrowShapeLabel(shape) {
  const labels = {
    arched: 'Arched',
    straight: 'Straight',
    curved: 'Curved',
    s_shaped: 'S-Shaped',
    rounded: 'Rounded',
  };
  return labels[shape] || shape;
}

export function getEyebrowThicknessLabel(thickness) {
  const labels = {
    thin: 'Thin',
    medium: 'Medium',
    thick: 'Thick',
    bushy: 'Bushy',
  };
  return labels[thickness] || thickness;
}

// ============ DISPLAY HELPERS - LIPS ============

export function getLipShapeLabel(shape) {
  const labels = {
    full: 'Full',
    thin: 'Thin',
    heart: 'Heart-Shaped',
    wide: 'Wide',
    round: 'Round',
    bow_shaped: 'Bow-Shaped',
  };
  return labels[shape] || shape;
}

export function getLipSizeLabel(size) {
  const labels = {
    thin: 'Thin',
    medium: 'Medium',
    full: 'Full',
    very_full: 'Very Full',
  };
  return labels[size] || size;
}

// ============ DISPLAY HELPERS - NOSE ============

export function getNoseShapeLabel(shape) {
  const labels = {
    straight: 'Straight',
    roman: 'Roman/Aquiline',
    button: 'Button',
    snub: 'Snub/Upturned',
    wide: 'Wide',
    narrow: 'Narrow',
  };
  return labels[shape] || shape;
}

// ============ VALIDATION OPTIONS ============

export const SKIN_TONE_OPTIONS = [
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'brown', label: 'Brown' },
  { value: 'dark', label: 'Dark' },
];

export const SKIN_UNDERTONE_OPTIONS = [
  { value: 'warm', label: 'Warm (golden/yellow undertones)' },
  { value: 'cool', label: 'Cool (pink/blue undertones)' },
  { value: 'neutral', label: 'Neutral' },
];

export const SKIN_TYPE_OPTIONS = [
  { value: 'dry', label: 'Dry' },
  { value: 'normal', label: 'Normal' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
];

export const FACE_SHAPE_OPTIONS = [
  { value: 'oval', label: 'Oval' },
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
  { value: 'heart', label: 'Heart' },
  { value: 'oblong', label: 'Oblong' },
  { value: 'diamond', label: 'Diamond' },
];

export const EYE_COLOR_OPTIONS = [
  { value: 'brown', label: 'Brown' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'gray', label: 'Gray' },
  { value: 'amber', label: 'Amber' },
];

export const EYE_SHAPE_OPTIONS = [
  { value: 'almond', label: 'Almond' },
  { value: 'round', label: 'Round' },
  { value: 'hooded', label: 'Hooded' },
  { value: 'monolid', label: 'Monolid' },
  { value: 'downturned', label: 'Downturned' },
  { value: 'upturned', label: 'Upturned' },
];

export const EYEBROW_SHAPE_OPTIONS = [
  { value: 'arched', label: 'Arched' },
  { value: 'straight', label: 'Straight' },
  { value: 'curved', label: 'Curved' },
  { value: 's_shaped', label: 'S-Shaped' },
  { value: 'rounded', label: 'Rounded' },
];

export const EYEBROW_THICKNESS_OPTIONS = [
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'thick', label: 'Thick' },
  { value: 'bushy', label: 'Bushy' },
];

export const LIP_SHAPE_OPTIONS = [
  { value: 'full', label: 'Full' },
  { value: 'thin', label: 'Thin' },
  { value: 'heart', label: 'Heart-Shaped' },
  { value: 'wide', label: 'Wide' },
  { value: 'round', label: 'Round' },
  { value: 'bow_shaped', label: 'Bow-Shaped' },
];

export const LIP_SIZE_OPTIONS = [
  { value: 'thin', label: 'Thin' },
  { value: 'medium', label: 'Medium' },
  { value: 'full', label: 'Full' },
  { value: 'very_full', label: 'Very Full' },
];

// ============ CONFIDENCE HELPERS ============

export function getConfidenceBadgeColor(confidence) {
  if (confidence >= 85) return '#4CAF50'; // Green
  if (confidence >= 70) return '#FFC107'; // Yellow
  return '#FF5722'; // Orange/Red
}

export function getConfidenceLabel(confidence) {
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Medium';
  return 'Low';
}

// ============ MOCK DATA ============

export function getMockBeautyAnalysis() {
  return {
    userView: {
      skinTone: 'medium',
      skinUndertone: 'warm',
      skinType: 'combination',
      faceShape: 'oval',
      eyeColor: 'brown',
      eyeShape: 'almond',
      eyebrowShape: 'arched',
      eyebrowThickness: 'medium',
      lipShape: 'full',
      lipSize: 'medium',
    },
    adminView: {
      skinToneDetailed: {
        fitzpatrick: 4,
        hex: '#C99A6B',
        description: 'Olive/moderate brown, rarely burns, tans easily',
      },
      skinConcerns: [],
      skinTexture: 'normal',
      faceShapeDetailed: {
        primary: 'oval',
        secondary: null,
        proportions: { foreheadWidth: 0.3, cheekboneWidth: 0.35, jawWidth: 0.28, faceLength: 0.45 },
      },
      faceLength: 'average',
      foreheadSize: 'average',
      cheekboneProminence: 'average',
      jawlineType: 'soft',
      chinShape: 'rounded',
      eyeColorDetailed: {
        primary: 'brown',
        secondary: null,
        pattern: 'solid',
        intensity: 'dark',
      },
      eyeSize: 'medium',
      eyeSpacing: 'average',
      eyeDepth: 'average',
      eyeLidType: 'visible_crease',
      eyebrowColorMatch: true,
      eyebrowGap: 'average',
      eyebrowTailLength: 'medium',
      eyebrowArch: { position: 'medium', angle: 15 },
      lipProportions: { upperToLower: 0.8, width: 'average' },
      lipColor: 'pink',
      cupidsBow: 'soft',
      noseShape: 'straight',
      noseBridge: 'medium',
      noseWidth: 'average',
    },
    confidence: {
      skinTone: 85,
      skinUndertone: 75,
      faceShape: 70,
      eyeColor: 90,
      eyeShape: 72,
      eyebrowShape: 65,
      lipShape: 68,
    },
    analysisVersion: 'MVP-1.0.0',
    analyzedAt: new Date().toISOString(),
  };
}

// ============ COMBINED ANALYSIS DISPLAY ============

/**
 * Get a combined summary of all attributes for display
 */
export function getBeautySummary(beautyResult) {
  if (!beautyResult?.userView) return null;
  
  const u = beautyResult.userView;
  
  return {
    skin: `${getSkinToneLabel(u.skinTone)} with ${getSkinUndertoneLabel(u.skinUndertone).toLowerCase()}`,
    face: getFaceShapeLabel(u.faceShape),
    eyes: `${getEyeColorLabel(u.eyeColor)} ${getEyeShapeLabel(u.eyeShape).toLowerCase()} eyes`,
    eyebrows: `${getEyebrowThicknessLabel(u.eyebrowThickness)} ${getEyebrowShapeLabel(u.eyebrowShape).toLowerCase()} brows`,
    lips: `${getLipSizeLabel(u.lipSize)} ${getLipShapeLabel(u.lipShape).toLowerCase()} lips`,
  };
}

