/**
 * Modeled Photo Requirements & Validation
 * 
 * Ensures models upload high-quality photos for accurate AI analysis.
 * All requirements are designed to maximize matching accuracy.
 */

// ============ PHOTO STEP CONFIGURATION ============

export const PHOTO_STEPS = [
  {
    id: 'front_face',
    order: 1,
    title: 'Natural Face',
    shortTitle: 'Natural Face',
    icon: '',
    instruction: 'Upload a clean natural-face photo in good lighting',
    purpose: 'Used for authentic identity and face-feature matching',
    tips: [
      'Remove makeup if possible for accurate skin analysis',
      'Use natural lighting (near a window is perfect)',
      'Keep hair away from your face',
      'Neutral expression - no big smile',
    ],
    examples: {
      good: 'Clear front view, natural light, neutral expression',
      bad: 'Heavy makeup, harsh shadows, hair covering face',
    },
    requirements: {
      faceRequired: true,
      minFaceSize: 0.20, // Face must be 20%+ of image
      facePosition: 'center',
    },
    analysisTargets: ['faceShape', 'eyeColor', 'eyeShape', 'skinTone', 'skinUndertone', 'eyebrows', 'lips'],
  },
  {
    id: 'side_profile',
    order: 2,
    title: 'Natural Hair',
    shortTitle: 'Natural Hair',
    icon: '',
    instruction: 'Upload your hair in a natural, unstyled state',
    purpose: 'Captures natural texture and condition for service matching',
    tips: [
      'Turn 90 degrees to one side',
      'Keep your chin level (not tilted up or down)',
      'Tuck hair behind your ear if possible',
      'Look straight ahead, not at the camera',
    ],
    examples: {
      good: 'Clear 90° profile, chin level, ear visible',
      bad: 'Partial turn, chin tilted, hair covering profile',
    },
    requirements: {
      faceRequired: true,
      profileView: true,
    },
    analysisTargets: ['noseShape', 'jawline', 'chinShape', 'faceLength'],
  },
  {
    id: 'hair_front',
    order: 3,
    title: 'Makeup / Hair Done',
    shortTitle: 'Done Look',
    icon: '',
    instruction: 'Upload a polished look with makeup and/or styled hair',
    purpose: 'Shows your finished look preferences for creative and editorial opportunities',
    tips: [
      'Let your hair fall naturally (no holding or posing)',
      'Step back so shoulders are visible',
      'Show your natural part',
      'Good lighting to capture true hair color',
    ],
    examples: {
      good: 'Natural hair, shoulders visible, good lighting',
      bad: 'Hair pulled back, too close, poor lighting',
    },
    requirements: {
      minBodyVisible: 0.30, // See shoulders
      hairVisible: true,
    },
    analysisTargets: ['hairColor', 'hairTexture', 'hairStyle', 'hairDensity'],
  },
  {
    id: 'hair_back',
    order: 4,
    title: 'Hair - Back View',
    shortTitle: 'Hair Back',
    icon: '',
    instruction: 'Show the back of your hair to capture full length',
    purpose: 'Analyzes your hair length and how it falls naturally',
    tips: [
      'Turn completely around (back to camera)',
      'Let hair fall naturally',
      'Step back so we can see where your hair ends',
      'Waist or below should be visible if hair is long',
    ],
    examples: {
      good: 'Full back view, hair ends visible, natural fall',
      bad: 'Side angle, hair bundled up, can\'t see length',
    },
    requirements: {
      backView: true,
      showHairLength: true,
    },
    analysisTargets: ['hairLength', 'hairLengthDetailed'],
  },
  {
    id: 'hair_closeup',
    order: 5,
    title: 'Hair Texture Close-Up',
    shortTitle: 'Texture',
    icon: '',
    instruction: 'Show your hair texture up close (6-12 inches from camera)',
    purpose: 'Analyzes your curl pattern, hair health, and strand thickness',
    tips: [
      'Hold a section of mid-length hair near the camera',
      'Natural light is essential for accuracy',
      'Show your natural texture (not straightened or curled)',
      'Multiple strands, not just one',
    ],
    examples: {
      good: 'Clear texture visible, natural light, mid-section hair',
      bad: 'Too far away, flash reflection, styled/altered texture',
    },
    requirements: {
      closeUp: true,
      minDetail: true,
    },
    analysisTargets: ['curlPattern', 'hairHealth', 'hairDensity', 'hairPorosity'],
  },
  {
    id: 'hair_natural',
    order: 6,
    title: 'Hair - Natural State',
    shortTitle: 'Natural',
    icon: '',
    instruction: 'Show your hair in its natural state (air-dried, no heat styling)',
    purpose: 'Captures your true texture for accurate curl pattern matching',
    tips: [
      'Best taken after air-drying (no blow dryer)',
      'No flat iron, curling iron, or heat tools',
      'This is YOUR natural hair - embrace it!',
      'If you always wear it styled, show that too in notes',
    ],
    examples: {
      good: 'Air-dried hair, natural texture, no heat styling',
      bad: 'Freshly straightened, wet hair, heavy products',
    },
    requirements: {
      naturalState: true,
    },
    analysisTargets: ['hairTexture', 'curlPattern', 'hairTextureDetailed'],
  },
];

// Fast-launch setting: only require the first few photos for onboarding completion.
// Keep full PHOTO_STEPS so we can expand requirements later without rebuilding flow.
export const MIN_REQUIRED_PHOTOS = 3;

// ============ TECHNICAL REQUIREMENTS ============

export const PHOTO_TECHNICAL_REQUIREMENTS = {
  // File requirements (320 min so normal phone photos and crops pass; backend can re-check)
  minResolution: { width: 320, height: 320 },
  maxResolution: { width: 4096, height: 4096 },
  maxFileSize: 15 * 1024 * 1024, // 15MB - allow typical phone photos for onboarding
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Quality thresholds (relaxed for scaled analysis - we downsample to 500px, which reduces variance)
  quality: {
    minBrightness: 25,        // 0-255, reject if too dark (allow indoor/dark-background photos)
    maxBrightness: 248,       // 0-255, reject if overexposed (was 240 - allow bright indoor)
    maxBlur: 55,              // Laplacian variance on 500px canvas - lower = reject more blur (was 100, too strict for scaled images)
    minContrast: 30,          // Minimum contrast ratio
    minSharpness: 50,         // Sharpness score
  },
  
  // Face detection (for face photos) - client-side MediaPipe; backend Rekognition can re-check
  face: {
    minConfidence: 90,        // Rekognition confidence % (backend)
    minFaceSize: 0.10,        // Face must be 10%+ of image (relaxed so headshots pass)
    maxFaceSize: 0.85,        // Face shouldn't be >85% (too close)
    centerTolerance: 0.3,     // How far from center is OK
  },
  
  // Recency
  maxPhotoAge: 21, // days - within last 3 weeks
};

// ============ QUALITY CHECK MESSAGES ============

export const QUALITY_MESSAGES = {
  // Passing
  perfect: {
    icon: '',
    message: 'Perfect! Great photo.',
    type: 'success',
  },
  good: {
    icon: '',
    message: 'Good photo captured!',
    type: 'success',
  },
  
  // Warnings (can still submit)
  lowLight: {
    icon: '💡',
    message: 'Try moving to better lighting',
    type: 'warning',
  },
  slightBlur: {
    icon: '📸',
    message: 'Hold steady - slight blur detected',
    type: 'warning',
  },
  
  // Errors (must fix)
  tooDark: {
    icon: '🌑',
    message: 'Too dark - move to a brighter area',
    type: 'error',
  },
  tooBlurry: {
    icon: '🌫️',
    message: 'Too blurry - hold still and try again',
    type: 'error',
  },
  noFace: {
    icon: '👤',
    message: 'No face detected - make sure your face is visible',
    type: 'error',
  },
  faceTooSmall: {
    icon: '🔍',
    message: 'Move closer - your face is too small',
    type: 'error',
  },
  faceTooLarge: {
    icon: '↔️',
    message: 'Move back - your face is too close',
    type: 'error',
  },
  faceNotCentered: {
    icon: '⬅️',
    message: 'Center your face in the frame',
    type: 'error',
  },
  wrongContent: {
    icon: '📷',
    message: 'This doesn\'t look like a photo of you - please upload a clear photo of your face or hair',
    type: 'error',
  },
  wrongContentLandscape: {
    icon: '🏞️',
    message: 'Please upload a photo of yourself, not a landscape or scenery',
    type: 'error',
  },
  tooSmall: {
    icon: '📐',
    message: 'Image too small - use a higher resolution',
    type: 'error',
  },
  wrongFormat: {
    icon: '📁',
    message: 'Please use JPG, PNG, or WebP format',
    type: 'error',
  },
  tooLarge: {
    icon: '📦',
    message: 'File too large - must be under 15MB',
    type: 'error',
  },
};

// ============ VALIDATION FUNCTIONS ============

/**
 * Validate image file before upload
 */
export function validateImageFile(file) {
  const errors = [];
  const warnings = [];
  
  // Check format
  if (!PHOTO_TECHNICAL_REQUIREMENTS.acceptedFormats.includes(file.type)) {
    errors.push(QUALITY_MESSAGES.wrongFormat);
  }
  
  // Check file size
  if (file.size > PHOTO_TECHNICAL_REQUIREMENTS.maxFileSize) {
    errors.push(QUALITY_MESSAGES.tooLarge);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(width, height) {
  const { minResolution } = PHOTO_TECHNICAL_REQUIREMENTS;
  
  if (width < minResolution.width || height < minResolution.height) {
    return {
      // For onboarding we treat this as a soft warning so good photos aren't blocked.
      // Downstream callers can choose to surface QUALITY_MESSAGES.tooSmall as a warning.
      isValid: true,
      error: QUALITY_MESSAGES.tooSmall,
    };
  }
  
  return { isValid: true };
}

/**
 * Check if image content is relevant (person/face/hair) vs landscape/ocean/etc.
 * Uses pixel analysis - rejects obviously wrong images (ocean, sky, grass).
 */
export function checkImageContentRelevance(imageData, options = {}) {
  const data = imageData.data;
  const pixelCount = data.length / 4;
  const stepConfig = options.stepConfig;
  const requirePerson = stepConfig?.requirements?.faceRequired || stepConfig?.requirements?.hairVisible;

  let skinPixels = 0;
  let blueDominantPixels = 0;   // water, sky
  let greenDominantPixels = 0;  // grass, landscape
  let neutralPixels = 0;
  let colorVariance = 0;
  const colorSums = [0, 0, 0];

  // Sample every 4th pixel for speed (or every 8th for large images)
  const step = pixelCount > 100000 ? 8 : 4;

  for (let i = 0; i < data.length; i += step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    colorSums[0] += r;
    colorSums[1] += g;
    colorSums[2] += b;

    // Skin tone heuristic (covers light to dark skin - Chai/Kriegman inspired)
    const isSkin =
      r > 55 && g > 25 && b > 12 &&
      r < 255 && g < 245 && b < 235 &&
      r > b && (r > g || Math.abs(r - g) < 35) &&
      Math.abs(r - g) < 100 &&
      (Math.max(r, g, b) - Math.min(r, g, b)) > 15;
    if (isSkin) skinPixels++;

    // Blue-dominant (ocean, sky, water)
    if (b > r && b > g && b > 100) blueDominantPixels++;
    // Cyan/teal (water)
    else if (b > 120 && g > 100 && r < g && r < b) blueDominantPixels++;

    // Green-dominant (grass, trees, landscape)
    if (g > r && g > b && g > 80) greenDominantPixels++;

    // Very uniform (solid color - maybe a wall or blank)
    const range = Math.max(r, g, b) - Math.min(r, g, b);
    if (range < 20) neutralPixels++;
  }

  const sampled = Math.floor(pixelCount / step);
  const skinPct = (skinPixels / sampled) * 100;
  const bluePct = (blueDominantPixels / sampled) * 100;
  const greenPct = (greenDominantPixels / sampled) * 100;
  const neutralPct = (neutralPixels / sampled) * 100;

  // Reject: ocean, water, sky (blue dominant) - only when clearly no person
  if (bluePct > 42 && skinPct < 3) {
    return { isValid: false, reason: 'wrongContentLandscape', labels: ['water', 'sky', 'ocean'] };
  }

  // Reject: grass/landscape dominant with no person (person in park can have green + skin)
  if (greenPct > 55 && skinPct < 2) {
    return { isValid: false, reason: 'wrongContentLandscape', labels: ['landscape', 'grass'] };
  }

  // Reject: very uniform (solid color, blank - not a real photo)
  if (neutralPct > 95 && skinPct < 1) {
    return { isValid: false, reason: 'wrongContent', labels: ['uniform'] };
  }

  // For face steps: require meaningful face visibility (lips-only, hands, etc. have very little skin)
  const faceRequired = stepConfig?.requirements?.faceRequired;
  if (faceRequired && skinPct < 5) {
    return { isValid: false, reason: 'wrongContent', labels: ['no_face'] };
  }

  // For hair steps (hairVisible): require some skin (forehead, neck visible)
  if (requirePerson && !faceRequired && skinPct < 1 && bluePct < 30 && greenPct < 40) {
    return { isValid: false, reason: 'wrongContent', labels: ['no_person'] };
  }

  return { isValid: true };
}

/**
 * Calculate image brightness (0-255)
 */
export function calculateBrightness(imageData) {
  const data = imageData.data;
  let totalBrightness = 0;
  const pixelCount = data.length / 4;
  
  for (let i = 0; i < data.length; i += 4) {
    // Luminosity formula
    const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    totalBrightness += brightness;
  }
  
  return totalBrightness / pixelCount;
}

/**
 * Estimate blur using Laplacian variance
 */
export function estimateBlur(imageData, width, height) {
  // Simplified blur detection using variance
  const data = imageData.data;
  const gray = [];
  
  // Convert to grayscale
  for (let i = 0; i < data.length; i += 4) {
    gray.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  }
  
  // Calculate variance (higher = sharper)
  let sum = 0;
  let sumSq = 0;
  for (const val of gray) {
    sum += val;
    sumSq += val * val;
  }
  
  const mean = sum / gray.length;
  const variance = (sumSq / gray.length) - (mean * mean);
  
  return variance;
}

/**
 * Comprehensive quality check
 */
export function checkPhotoQuality(imageData, width, height, options = {}) {
  const results = {
    isValid: true,
    score: 100,
    errors: [],
    warnings: [],
    checks: {},
  };
  
  const { quality } = PHOTO_TECHNICAL_REQUIREMENTS;
  const { stepConfig } = options;

  // Content relevance check (reject ocean, landscape, wrong pics)
  const contentCheck = checkImageContentRelevance(imageData, { stepConfig });
  if (!contentCheck.isValid) {
    const msg = contentCheck.reason === 'wrongContentLandscape'
      ? QUALITY_MESSAGES.wrongContentLandscape
      : QUALITY_MESSAGES.wrongContent;
    results.errors.push(msg);
    results.score -= 50;
    results.isValid = false;
  }

  // Brightness check
  const brightness = calculateBrightness(imageData);
  results.checks.brightness = brightness;
  
  if (brightness < quality.minBrightness) {
    results.errors.push(QUALITY_MESSAGES.tooDark);
    results.score -= 30;
    results.isValid = false;
  } else if (brightness < quality.minBrightness + 25) {
    results.warnings.push(QUALITY_MESSAGES.lowLight);
    results.score -= 10;
  }
  
  if (brightness > quality.maxBrightness) {
    results.warnings.push({
      icon: '',
      message: 'Slightly overexposed - try less direct light',
      type: 'warning',
    });
    results.score -= 10;
  }
  
  // Blur check
  const blurScore = estimateBlur(imageData, width, height);
  results.checks.blur = blurScore;
  
  if (blurScore < quality.maxBlur) {
    results.errors.push(QUALITY_MESSAGES.tooBlurry);
    results.score -= 30;
    results.isValid = false;
  } else if (blurScore < quality.maxBlur + 80) {
    results.warnings.push(QUALITY_MESSAGES.slightBlur);
    results.score -= 10;
  }
  
  // Clamp score
  results.score = Math.max(0, Math.min(100, results.score));
  
  // Overall status
  if (results.errors.length === 0 && results.warnings.length === 0) {
    results.status = QUALITY_MESSAGES.perfect;
  } else if (results.errors.length === 0) {
    results.status = QUALITY_MESSAGES.good;
  }
  
  return results;
}

// ============ HELPER FUNCTIONS ============

/**
 * Get all required photo step IDs
 */
export function getRequiredPhotoIds() {
  return PHOTO_STEPS.slice(0, MIN_REQUIRED_PHOTOS).map(step => step.id);
}

/**
 * Get photo step by ID
 */
export function getPhotoStep(stepId) {
  return PHOTO_STEPS.find(step => step.id === stepId);
}

/**
 * Check if all required photos are captured
 */
export function areAllPhotosComplete(capturedPhotos) {
  const requiredIds = getRequiredPhotoIds();
  return requiredIds.every(id => capturedPhotos[id]?.isValid);
}

/**
 * Get completion percentage
 */
export function getCompletionPercentage(capturedPhotos) {
  const requiredIds = getRequiredPhotoIds();
  const completedCount = requiredIds.filter(id => capturedPhotos[id]?.isValid).length;
  return Math.round((completedCount / requiredIds.length) * 100);
}

/**
 * Get next incomplete step
 */
export function getNextIncompleteStep(capturedPhotos) {
  const requiredIds = getRequiredPhotoIds();
  for (const stepId of requiredIds) {
    if (!capturedPhotos[stepId]?.isValid) {
      return getPhotoStep(stepId);
    }
  }
  return null;
}

/**
 * Get analysis targets for all photos
 */
export function getAllAnalysisTargets() {
  const targets = new Set();
  PHOTO_STEPS.forEach(step => {
    step.analysisTargets?.forEach(target => targets.add(target));
  });
  return Array.from(targets);
}

