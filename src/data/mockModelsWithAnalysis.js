/**
 * ============================================
 * MOCK MODELS WITH FULL HAIR & BEAUTY ENGINE DATA
 * ============================================
 * 
 * 5 Diverse Models - DATA MATCHES THE ACTUAL PHOTOS!
 * 
 * Photo sources (Unsplash):
 * 1. Zara - Black woman, natural curly hair, deep skin
 * 2. Emma - Short auburn bob, fair skin, green eyes  
 * 3. Sofia - Slicked back dark hair, olive/tan skin
 * 4. Lily - Blonde wavy hair, light skin, blue eyes
 * 5. Maya - Brown wavy hair, medium skin, brown eyes
 */

// ============ MOCK MODELS WITH ACCURATE DATA ============

export const mockModelsWithAnalysis = [
  // ============ MODEL 1: ZARA - Natural Curly, Deep Skin ============
  {
    id: 'model-001',
    firstName: 'Zara',
    lastName: 'Williams',
    email: 'zara.w@email.com',
    phone: '(555) 100-1001',
    locationZip: '10001',
    ageRange: '25-34',
    
    // Photo - Black woman with natural curly/coily hair
    profilePhoto: 'https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=400&h=400&fit=crop&crop=face',
    photoCount: 6,
    photoSubmittedAt: '2024-12-20T10:30:00Z',
    
    // ============ HAIR - SIMPLE (User View) ============
    hairLengthSimple: 'medium',
    hairColorSimple: 'black',
    hairTextureSimple: 'curly',
    
    // ============ HAIR - DETAILED (Admin View) ============
    hairLengthDetailed: 'shoulder-length',
    hairColorDetailed: {
      natural: 'black',
      depth: 2,
      undertone: 'neutral',
      artificial: 'none',
      grayPercentage: 0,
    },
    hairTextureDetailed: '3C',  // Tight curls
    hairDensity: 'thick',
    hairPorosity: 'medium',
    hairHealth: {
      frizz: 'low',
      damage: 'none',
      splitEnds: false,
      shine: 'natural',
      elasticity: 'good',
      moistureLevel: 'balanced',
    },
    hairStyle: 'natural_curls',
    
    // ============ BEAUTY - SIMPLE (User View) ============
    skinToneSimple: 'dark',
    faceShapeSimple: 'oval',
    eyeColorSimple: 'brown',
    
    // ============ BEAUTY - DETAILED (Admin View) ============
    skinToneDetailed: {
      fitzpatrick: 5,
      hex: '#8D5524',
      undertone: 'warm',
      texture: 'smooth',
      clarity: 'clear',
    },
    faceShapeDetailed: {
      shape: 'oval',
      lengthRatio: 1.4,
      jawline: 'soft',
      cheekbones: 'high',
      foreheadWidth: 'average',
    },
    eyeShapeDetailed: {
      shape: 'almond',
      size: 'large',
      lidType: 'visible_crease',
      crease: 'defined',
      spacing: 'average',
    },
    eyebrowShape: {
      shape: 'arched',
      thickness: 'medium',
      density: 'full',
      gap: 'average',
      arch: 'high',
    },
    lipShape: {
      shape: 'full',
      upperToLowerRatio: '1:1.2',
      cupidBow: 'defined',
      width: 'wide',
    },
    noseShape: {
      shape: 'nubian',
      bridge: 'low',
      width: 'wide',
      tip: 'rounded',
    },
    
    // ============ AI CONFIDENCE ============
    autoTaggedAttributes: {
      hairType: '3C',
      hairLength: 'shoulder',
      hairColor: 'natural_black',
      hairDensity: 'high',
      curlPattern: 'corkscrew',
      skinTone: 'deep',
      faceShape: 'oval',
      eyeColor: 'dark_brown',
    },
    attributeConfidence: {
      hairType: 0.94,
      hairLength: 0.91,
      hairColor: 0.98,
      hairDensity: 0.89,
      skinTone: 0.96,
      faceShape: 0.88,
      eyeColor: 0.97,
    },
    analysisVersion: 'MVP-1.0',
    
    userValidatedAttributes: {
      hairTextureSimple: 'curly',
      hairLengthSimple: 'medium',
      skinToneSimple: 'dark',
    },
    userValidatedAt: '2024-12-20T11:00:00Z',
    validationAccuracy: 0.95,
    
    lastPhotoAnalysis: '2024-12-20T10:45:00Z',
    photoAnalysisStatus: 'completed',
    analyzedPhotoCount: 6,
    
    // Legacy
    hairLength: 'medium',
    hairColor: 'black',
    hairTexture: 'curly',
    hairCondition: 'healthy',
    virginHair: true,
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'dark',
    
    services: ['haircut', 'blowdry', 'braids', 'twists'],
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    allergies: false,
    
    availability: {
      monday: ['10am', '11am', '2pm', '3pm'],
      wednesday: ['9am', '10am', '11am'],
      friday: ['2pm', '3pm', '4pm'],
      saturday: ['10am', '11am', '12pm'],
    },
    
    totalBookings: 15,
    totalFeedbacks: 13,
    repeatBookings: 5,
    monthsOnPlatform: 10,
    servicesCompleted: ['haircut', 'blowdry', 'braids'],
    lastActive: '2024-12-21',
    
    agenticScores: {
      reliability: 94,
      feedback: 92,
      experience: 78,
      engagement: 88,
      compatibility: 85,
    },
    
    status: 'active',
    profileCompleteness: 100,
  },
  
  // ============ MODEL 2: EMMA - Short Auburn Bob, Fair Skin ============
  {
    id: 'model-002',
    firstName: 'Emma',
    lastName: 'Collins',
    email: 'emma.c@email.com',
    phone: '(555) 200-2002',
    locationZip: '10002',
    ageRange: '25-34',
    
    // Photo - Short auburn/reddish bob, fair skin
    profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    photoCount: 6,
    photoSubmittedAt: '2024-12-19T14:20:00Z',
    
    // ============ HAIR - SIMPLE ============
    hairLengthSimple: 'short',
    hairColorSimple: 'red',
    hairTextureSimple: 'straight',
    
    // ============ HAIR - DETAILED ============
    hairLengthDetailed: 'chin-length bob',
    hairColorDetailed: {
      natural: 'auburn',
      depth: 6,
      undertone: 'warm_copper',
      artificial: 'none',
      grayPercentage: 0,
    },
    hairTextureDetailed: '1B',  // Straight with slight bend
    hairDensity: 'medium',
    hairPorosity: 'low',
    hairHealth: {
      frizz: 'none',
      damage: 'none',
      splitEnds: false,
      shine: 'high',
      elasticity: 'excellent',
      moistureLevel: 'balanced',
    },
    hairStyle: 'layered_bob',
    
    // ============ BEAUTY - SIMPLE ============
    skinToneSimple: 'fair',
    faceShapeSimple: 'oval',
    eyeColorSimple: 'green',
    
    // ============ BEAUTY - DETAILED ============
    skinToneDetailed: {
      fitzpatrick: 2,
      hex: '#FAD7C5',
      undertone: 'cool_pink',
      texture: 'smooth',
      clarity: 'clear',
    },
    faceShapeDetailed: {
      shape: 'oval',
      lengthRatio: 1.5,
      jawline: 'soft',
      cheekbones: 'defined',
      foreheadWidth: 'average',
    },
    eyeShapeDetailed: {
      shape: 'almond',
      size: 'medium',
      lidType: 'double_lid',
      crease: 'visible',
      spacing: 'average',
    },
    eyebrowShape: {
      shape: 'soft_arched',
      thickness: 'thin',
      density: 'natural',
      gap: 'average',
      arch: 'subtle',
    },
    lipShape: {
      shape: 'medium',
      upperToLowerRatio: '1:1',
      cupidBow: 'soft',
      width: 'average',
    },
    noseShape: {
      shape: 'straight',
      bridge: 'medium',
      width: 'narrow',
      tip: 'rounded',
    },
    
    // ============ AI CONFIDENCE ============
    autoTaggedAttributes: {
      hairType: '1B',
      hairLength: 'chin',
      hairColor: 'auburn_red',
      hairDensity: 'medium',
      curlPattern: 'none',
      skinTone: 'fair',
      faceShape: 'oval',
      eyeColor: 'green',
    },
    attributeConfidence: {
      hairType: 0.96,
      hairLength: 0.94,
      hairColor: 0.92,
      hairDensity: 0.88,
      skinTone: 0.97,
      faceShape: 0.91,
      eyeColor: 0.89,
    },
    analysisVersion: 'MVP-1.0',
    
    userValidatedAttributes: {
      hairTextureSimple: 'straight',
      hairColorSimple: 'red',
      eyeColorSimple: 'green',
    },
    userValidatedAt: '2024-12-19T15:00:00Z',
    validationAccuracy: 1.0,
    
    lastPhotoAnalysis: '2024-12-19T14:35:00Z',
    photoAnalysisStatus: 'completed',
    analyzedPhotoCount: 6,
    
    hairLength: 'short',
    hairColor: 'red',
    hairTexture: 'straight',
    hairCondition: 'healthy',
    virginHair: true,
    eyeColor: 'green',
    lightEyes: true,
    skinTone: 'fair',
    
    services: ['haircut', 'blowdry', 'color', 'gloss'],
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    allergies: false,
    
    availability: {
      tuesday: ['9am', '10am', '11am', '2pm', '3pm'],
      thursday: ['9am', '10am', '11am', '2pm', '3pm'],
      saturday: ['10am', '11am', '12pm', '1pm', '2pm'],
    },
    
    totalBookings: 18,
    totalFeedbacks: 16,
    repeatBookings: 6,
    monthsOnPlatform: 8,
    servicesCompleted: ['haircut', 'blowdry', 'gloss'],
    lastActive: '2024-12-22',
    
    agenticScores: {
      reliability: 96,
      feedback: 94,
      experience: 72,
      engagement: 90,
      compatibility: 88,
    },
    
    status: 'active',
    profileCompleteness: 100,
  },
  
  // ============ MODEL 3: SOFIA - Slicked Back Dark Hair, Olive Skin ============
  {
    id: 'model-003',
    firstName: 'Sofia',
    lastName: 'Martinez',
    email: 'sofia.m@email.com',
    phone: '(555) 300-3003',
    locationZip: '10003',
    ageRange: '25-34',
    
    // Photo - Slicked back dark hair, tan/olive skin, striking features
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    photoCount: 6,
    photoSubmittedAt: '2024-12-18T09:15:00Z',
    
    // ============ HAIR - SIMPLE ============
    hairLengthSimple: 'medium',
    hairColorSimple: 'brown',
    hairTextureSimple: 'straight',
    
    // ============ HAIR - DETAILED ============
    hairLengthDetailed: 'shoulder-length',
    hairColorDetailed: {
      natural: 'dark_brown',
      depth: 3,
      undertone: 'neutral',
      artificial: 'none',
      grayPercentage: 0,
    },
    hairTextureDetailed: '1A',  // Pin straight
    hairDensity: 'medium',
    hairPorosity: 'low',
    hairHealth: {
      frizz: 'none',
      damage: 'none',
      splitEnds: false,
      shine: 'high',
      elasticity: 'excellent',
      moistureLevel: 'balanced',
    },
    hairStyle: 'slicked_back',
    
    // ============ BEAUTY - SIMPLE ============
    skinToneSimple: 'tan',
    faceShapeSimple: 'square',
    eyeColorSimple: 'brown',
    
    // ============ BEAUTY - DETAILED ============
    skinToneDetailed: {
      fitzpatrick: 4,
      hex: '#C68642',
      undertone: 'warm_olive',
      texture: 'smooth',
      clarity: 'clear',
    },
    faceShapeDetailed: {
      shape: 'square',
      lengthRatio: 1.2,
      jawline: 'strong_defined',
      cheekbones: 'prominent',
      foreheadWidth: 'wide',
    },
    eyeShapeDetailed: {
      shape: 'almond',
      size: 'large',
      lidType: 'double_lid',
      crease: 'deep',
      spacing: 'wide',
    },
    eyebrowShape: {
      shape: 'straight',
      thickness: 'thick',
      density: 'full',
      gap: 'narrow',
      arch: 'minimal',
    },
    lipShape: {
      shape: 'full',
      upperToLowerRatio: '1:1.1',
      cupidBow: 'defined',
      width: 'average',
    },
    noseShape: {
      shape: 'straight',
      bridge: 'high',
      width: 'average',
      tip: 'refined',
    },
    
    // ============ AI CONFIDENCE ============
    autoTaggedAttributes: {
      hairType: '1A',
      hairLength: 'shoulder',
      hairColor: 'dark_brown',
      hairDensity: 'medium',
      curlPattern: 'none',
      skinTone: 'olive',
      faceShape: 'square',
      eyeColor: 'brown',
    },
    attributeConfidence: {
      hairType: 0.97,
      hairLength: 0.89,
      hairColor: 0.95,
      hairDensity: 0.86,
      skinTone: 0.93,
      faceShape: 0.91,
      eyeColor: 0.96,
    },
    analysisVersion: 'MVP-1.0',
    
    userValidatedAttributes: {
      hairTextureSimple: 'straight',
      hairColorSimple: 'brown',
      faceShapeSimple: 'square',
    },
    userValidatedAt: '2024-12-18T10:00:00Z',
    validationAccuracy: 0.94,
    
    lastPhotoAnalysis: '2024-12-18T09:30:00Z',
    photoAnalysisStatus: 'completed',
    analyzedPhotoCount: 6,
    
    hairLength: 'medium',
    hairColor: 'dark_brown',
    hairTexture: 'straight',
    hairCondition: 'healthy',
    virginHair: true,
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'tan',
    
    services: ['haircut', 'color', 'blowdry', 'highlights', 'gloss'],
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    allergies: false,
    
    availability: {
      monday: ['2pm', '3pm', '4pm'],
      wednesday: ['2pm', '3pm', '4pm'],
      friday: ['10am', '11am', '2pm', '3pm', '4pm'],
    },
    
    totalBookings: 22,
    totalFeedbacks: 20,
    repeatBookings: 8,
    monthsOnPlatform: 14,
    servicesCompleted: ['haircut', 'color', 'blowdry', 'highlights'],
    lastActive: '2024-12-21',
    
    agenticScores: {
      reliability: 96,
      feedback: 94,
      experience: 85,
      engagement: 82,
      compatibility: 90,
    },
    
    status: 'active',
    profileCompleteness: 95,
  },
  
  // ============ MODEL 4: LILY - Blonde Wavy, Light Skin ============
  {
    id: 'model-004',
    firstName: 'Lily',
    lastName: 'Anderson',
    email: 'lily.a@email.com',
    phone: '(555) 400-4004',
    locationZip: '10004',
    ageRange: '25-34',
    
    // Photo - Blonde wavy hair, light skin, blue eyes
    profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    photoCount: 6,
    photoSubmittedAt: '2024-12-17T16:45:00Z',
    
    // ============ HAIR - SIMPLE ============
    hairLengthSimple: 'long',
    hairColorSimple: 'blonde',
    hairTextureSimple: 'wavy',
    
    // ============ HAIR - DETAILED ============
    hairLengthDetailed: 'mid-back',
    hairColorDetailed: {
      natural: 'golden_blonde',
      depth: 8,
      undertone: 'warm_gold',
      artificial: 'highlights',
      grayPercentage: 0,
    },
    hairTextureDetailed: '2A',  // Loose waves
    hairDensity: 'medium',
    hairPorosity: 'medium',
    hairHealth: {
      frizz: 'low',
      damage: 'minimal',
      splitEnds: false,
      shine: 'natural',
      elasticity: 'good',
      moistureLevel: 'normal',
    },
    hairStyle: 'loose_waves',
    
    // ============ BEAUTY - SIMPLE ============
    skinToneSimple: 'light',
    faceShapeSimple: 'oval',
    eyeColorSimple: 'blue',
    
    // ============ BEAUTY - DETAILED ============
    skinToneDetailed: {
      fitzpatrick: 2,
      hex: '#FFE0C4',
      undertone: 'warm_peachy',
      texture: 'smooth',
      clarity: 'clear',
    },
    faceShapeDetailed: {
      shape: 'oval',
      lengthRatio: 1.4,
      jawline: 'soft',
      cheekbones: 'defined',
      foreheadWidth: 'average',
    },
    eyeShapeDetailed: {
      shape: 'round',
      size: 'large',
      lidType: 'double_lid',
      crease: 'visible',
      spacing: 'average',
    },
    eyebrowShape: {
      shape: 'soft_arched',
      thickness: 'medium',
      density: 'natural',
      gap: 'average',
      arch: 'medium',
    },
    lipShape: {
      shape: 'medium',
      upperToLowerRatio: '1:1',
      cupidBow: 'defined',
      width: 'average',
    },
    noseShape: {
      shape: 'button',
      bridge: 'medium',
      width: 'narrow',
      tip: 'rounded',
    },
    
    // ============ AI CONFIDENCE ============
    autoTaggedAttributes: {
      hairType: '2A',
      hairLength: 'mid-back',
      hairColor: 'blonde_highlighted',
      hairDensity: 'medium',
      curlPattern: 'loose_wave',
      skinTone: 'light',
      faceShape: 'oval',
      eyeColor: 'blue',
    },
    attributeConfidence: {
      hairType: 0.91,
      hairLength: 0.93,
      hairColor: 0.95,
      hairDensity: 0.87,
      skinTone: 0.98,
      faceShape: 0.90,
      eyeColor: 0.96,
    },
    analysisVersion: 'MVP-1.0',
    
    userValidatedAttributes: {
      hairTextureSimple: 'wavy',
      hairColorSimple: 'blonde',
      eyeColorSimple: 'blue',
    },
    userValidatedAt: '2024-12-17T17:30:00Z',
    validationAccuracy: 1.0,
    
    lastPhotoAnalysis: '2024-12-17T17:00:00Z',
    photoAnalysisStatus: 'completed',
    analyzedPhotoCount: 6,
    
    hairLength: 'long',
    hairColor: 'blonde',
    hairTexture: 'wavy',
    hairCondition: 'healthy',
    virginHair: false,
    eyeColor: 'blue',
    lightEyes: true,
    skinTone: 'light',
    
    services: ['haircut', 'blowdry', 'highlights', 'gloss', 'balayage'],
    openToChange: true,
    experience: true,
    events: true,
    features: true,
    content: true,
    allergies: false,
    
    availability: {
      tuesday: ['10am', '11am', '2pm'],
      thursday: ['10am', '11am', '2pm'],
      saturday: ['9am', '10am', '11am', '12pm'],
    },
    
    totalBookings: 25,
    totalFeedbacks: 23,
    repeatBookings: 10,
    monthsOnPlatform: 16,
    servicesCompleted: ['haircut', 'blowdry', 'highlights', 'gloss'],
    lastActive: '2024-12-20',
    
    agenticScores: {
      reliability: 98,
      feedback: 96,
      experience: 88,
      engagement: 85,
      compatibility: 92,
    },
    
    status: 'active',
    profileCompleteness: 100,
  },
  
  // ============ MODEL 5: MAYA - Brown Wavy Hair, Warm Smile ============
  {
    id: 'model-005',
    firstName: 'Maya',
    lastName: 'Thompson',
    email: 'maya.t@email.com',
    phone: '(555) 500-5005',
    locationZip: '10001',
    ageRange: '25-34',
    
    // Photo - Brown wavy hair, medium skin, warm smile
    profilePhoto: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=face',
    photoCount: 6,
    photoSubmittedAt: '2024-12-21T11:00:00Z',
    
    // ============ HAIR - SIMPLE ============
    hairLengthSimple: 'long',
    hairColorSimple: 'brown',
    hairTextureSimple: 'wavy',
    
    // ============ HAIR - DETAILED ============
    hairLengthDetailed: 'mid-back',
    hairColorDetailed: {
      natural: 'medium_brown',
      depth: 5,
      undertone: 'warm_caramel',
      artificial: 'none',
      grayPercentage: 0,
    },
    hairTextureDetailed: '2B',  // S-shaped waves
    hairDensity: 'thick',
    hairPorosity: 'medium',
    hairHealth: {
      frizz: 'low',
      damage: 'none',
      splitEnds: false,
      shine: 'natural',
      elasticity: 'good',
      moistureLevel: 'balanced',
    },
    hairStyle: 'natural_waves',
    
    // ============ BEAUTY - SIMPLE ============
    skinToneSimple: 'light',
    faceShapeSimple: 'heart',
    eyeColorSimple: 'brown',
    
    // ============ BEAUTY - DETAILED ============
    skinToneDetailed: {
      fitzpatrick: 2,
      hex: '#F5DEB3',
      undertone: 'warm',
      texture: 'smooth',
      clarity: 'clear',
    },
    faceShapeDetailed: {
      shape: 'heart',
      lengthRatio: 1.3,
      jawline: 'pointed',
      cheekbones: 'high',
      foreheadWidth: 'wide',
    },
    eyeShapeDetailed: {
      shape: 'almond',
      size: 'medium',
      lidType: 'double_lid',
      crease: 'visible',
      spacing: 'average',
    },
    eyebrowShape: {
      shape: 'arched',
      thickness: 'medium',
      density: 'full',
      gap: 'average',
      arch: 'high',
    },
    lipShape: {
      shape: 'full',
      upperToLowerRatio: '1:1',
      cupidBow: 'defined',
      width: 'wide',
    },
    noseShape: {
      shape: 'straight',
      bridge: 'medium',
      width: 'average',
      tip: 'rounded',
    },
    
    // ============ AI CONFIDENCE ============
    autoTaggedAttributes: {
      hairType: '2B',
      hairLength: 'mid-back',
      hairColor: 'medium_brown',
      hairDensity: 'high',
      curlPattern: 's_wave',
      skinTone: 'light',
      faceShape: 'heart',
      eyeColor: 'brown',
    },
    attributeConfidence: {
      hairType: 0.88,
      hairLength: 0.92,
      hairColor: 0.94,
      hairDensity: 0.86,
      skinTone: 0.95,
      faceShape: 0.84,
      eyeColor: 0.97,
    },
    analysisVersion: 'MVP-1.0',
    
    userValidatedAttributes: {
      hairTextureSimple: 'wavy',
      hairColorSimple: 'brown',
      faceShapeSimple: 'heart',
    },
    userValidatedAt: '2024-12-21T11:30:00Z',
    validationAccuracy: 0.96,
    
    lastPhotoAnalysis: '2024-12-21T11:15:00Z',
    photoAnalysisStatus: 'completed',
    analyzedPhotoCount: 6,
    
    hairLength: 'long',
    hairColor: 'brown',
    hairTexture: 'wavy',
    hairCondition: 'healthy',
    virginHair: true,
    eyeColor: 'brown',
    lightEyes: false,
    skinTone: 'light',
    
    services: ['haircut', 'color', 'blowdry', 'gloss', 'balayage'],
    openToChange: true,
    experience: false,
    events: true,
    features: true,
    content: true,
    allergies: false,
    
    availability: {
      monday: ['9am', '10am', '11am', '2pm', '3pm', '4pm'],
      tuesday: ['9am', '10am', '11am', '2pm', '3pm', '4pm'],
      wednesday: ['9am', '10am', '11am', '2pm', '3pm', '4pm'],
      thursday: ['9am', '10am', '11am', '2pm', '3pm', '4pm'],
      friday: ['9am', '10am', '11am', '2pm', '3pm', '4pm'],
    },
    
    totalBookings: 8,
    totalFeedbacks: 7,
    repeatBookings: 2,
    monthsOnPlatform: 3,
    servicesCompleted: ['blowdry', 'gloss'],
    lastActive: '2024-12-22',
    
    agenticScores: {
      reliability: 90,
      feedback: 95,
      experience: 35,
      engagement: 92,
      compatibility: 78,
    },
    
    status: 'active',
    profileCompleteness: 100,
  },
];

// ============ HELPER FUNCTIONS ============

export const getModelById = (id) => mockModelsWithAnalysis.find(m => m.id === id);

export const getModelsByHairType = (type) => 
  mockModelsWithAnalysis.filter(m => m.hairTextureDetailed === type);

export const getModelsBySkinTone = (tone) => 
  mockModelsWithAnalysis.filter(m => m.skinToneSimple === tone);

export const getModelsWithHighConfidence = (threshold = 0.90) => 
  mockModelsWithAnalysis.filter(m => {
    const avgConfidence = Object.values(m.attributeConfidence).reduce((a, b) => a + b, 0) / 
                          Object.values(m.attributeConfidence).length;
    return avgConfidence >= threshold;
  });

export const getModelAnalysisSummary = (model) => ({
  userView: {
    hair: `${model.hairTextureSimple}, ${model.hairColorSimple}, ${model.hairLengthSimple}`,
    beauty: `${model.faceShapeSimple} face, ${model.eyeColorSimple} eyes, ${model.skinToneSimple} skin`,
  },
  adminView: {
    hair: `${model.hairTextureDetailed}, Level ${model.hairColorDetailed?.depth} ${model.hairColorDetailed?.natural}, ${model.hairLengthDetailed}`,
    beauty: `${model.faceShapeDetailed?.shape} face (ratio ${model.faceShapeDetailed?.lengthRatio}), Fitzpatrick ${model.skinToneDetailed?.fitzpatrick}`,
  },
  confidence: {
    average: Math.round(
      Object.values(model.attributeConfidence).reduce((a, b) => a + b, 0) / 
      Object.values(model.attributeConfidence).length * 100
    ),
    lowest: Math.round(Math.min(...Object.values(model.attributeConfidence)) * 100),
    highest: Math.round(Math.max(...Object.values(model.attributeConfidence)) * 100),
  },
});

export const getAllAnalysisSummaries = () => 
  mockModelsWithAnalysis.map(m => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    ...getModelAnalysisSummary(m),
  }));

export default mockModelsWithAnalysis;
