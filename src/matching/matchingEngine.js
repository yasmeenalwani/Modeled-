// ============================================
// MODELED MANAGEMENT - MATCHING ENGINE v1.0
// ============================================
// Sophisticated matching algorithm with agentic learning
// ============================================

import zipCentroids from './data/zipCentroids.json';

// ============================================
// FINAL SCORE WEIGHTS
// Launch mode: prioritize criteria + reachability, ignore agentic until enough history exists.
// ============================================
export const WEIGHT_CONFIG = {
  attribute: 0.72,    // Requested attributes + model preferences (primary)
  agentic: 0.0,       // Disabled for fresh-launch matching quality
  reachability: 0.28, // Location + availability/feasibility
};
import { getNycBorough } from './data/nycBoroughByZipPrefix.js';
import { estimateNYCTravelMinutes, travelTimeToScore } from './nycTransitEstimator.js';

/**
 * MATCH TYPES:
 * - DIRECT: Must match exactly or within close range (high weight)
 * - INDIRECT: Related values can score (e.g., blonde ≈ light brown)
 * - IF_REQUESTED: Only scores if professional specifically asks
 * - NO_MATCH: Not used for matching (profile/admin data only)
 */
export const MATCH_TYPES = {
  DIRECT: 'direct',
  INDIRECT: 'indirect',
  IF_REQUESTED: 'if_requested',
  NO_MATCH: 'no_match',
};

// ============================================
// MODEL ATTRIBUTES CONFIGURATION
// ============================================
export const MODEL_ATTRIBUTES = {
  // Personal Info (No direct match - for identification only)
  firstName: { type: 'fill_in', matchType: MATCH_TYPES.NO_MATCH },
  lastName: { type: 'fill_in', matchType: MATCH_TYPES.NO_MATCH },
  contact: { type: 'fill_in', matchType: MATCH_TYPES.NO_MATCH },
  socials: { type: 'fill_in', matchType: MATCH_TYPES.NO_MATCH },
  somethingFun: { type: 'fill_in', matchType: MATCH_TYPES.NO_MATCH },
  
  // Demographics
  ageRange: { 
    type: 'mc', 
    matchType: MATCH_TYPES.IF_REQUESTED,
    options: ['18-24', '25-34', '35-44', '45-54', '55+'],
  },
  location: { 
    type: 'mc', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 15, // High importance - logistics matter
  },
  
  // Services & Availability
  services: { 
    type: 'mc_multi', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 20, // Critical - must be willing to do the service
    options: ['haircut', 'color', 'blowdry', 'gloss', 'highlights', 'keratin'],
  },
  identification: { 
    type: 'mc', 
    matchType: MATCH_TYPES.IF_REQUESTED,
  },
  
  // ============ HAIR ENGINE ATTRIBUTES (Core Matching Criteria) ============
  // Simple attributes (user-facing, auto-tagged by Hair Engine)
  hairLengthSimple: { 
    type: 'mc', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 12,
    options: ['short', 'medium', 'long', 'extra_long'],
    scoreMatrix: {
      short: { short: 100, medium: 40, long: 10, extra_long: 0 },
      medium: { short: 30, medium: 100, long: 60, extra_long: 30 },
      long: { short: 0, medium: 40, long: 100, extra_long: 80 },
      extra_long: { short: 0, medium: 20, long: 70, extra_long: 100 },
    },
  },
  hairColorSimple: { 
    type: 'mc', 
    matchType: MATCH_TYPES.INDIRECT,
    weight: 10,
    options: ['black', 'brown', 'blonde', 'red', 'gray', 'colored'],
    similarityGroups: [
      ['black', 'brown'],
      ['brown', 'blonde'],
      ['red', 'brown'],
    ],
  },
  hairTextureSimple: { 
    type: 'mc', 
    matchType: MATCH_TYPES.INDIRECT,
    weight: 12,
    options: ['straight', 'wavy', 'curly', 'coily'],
    scoreMatrix: {
      straight: { straight: 100, wavy: 50, curly: 20, coily: 10 },
      wavy: { straight: 50, wavy: 100, curly: 60, coily: 30 },
      curly: { straight: 20, wavy: 60, curly: 100, coily: 70 },
      coily: { straight: 10, wavy: 30, curly: 70, coily: 100 },
    },
  },
  hairDensity: { 
    type: 'mc', 
    matchType: MATCH_TYPES.INDIRECT,
    weight: 6,
    options: ['thin', 'medium', 'thick'],
  },
  
  // Detailed attributes (admin-only, for advanced matching)
  // Curl Pattern - Andre Walker System (1A-4C)
  curlPattern: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 15, // High weight when specifically requested
    options: ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C', '4A', '4B', '4C'],
    scoreMatrix: {
      // Straight types
      '1A': { '1A': 100, '1B': 85, '1C': 70, '2A': 40, '2B': 20, '2C': 10, '3A': 5, '3B': 0, '3C': 0, '4A': 0, '4B': 0, '4C': 0 },
      '1B': { '1A': 85, '1B': 100, '1C': 85, '2A': 50, '2B': 30, '2C': 20, '3A': 10, '3B': 5, '3C': 0, '4A': 0, '4B': 0, '4C': 0 },
      '1C': { '1A': 70, '1B': 85, '1C': 100, '2A': 60, '2B': 40, '2C': 30, '3A': 15, '3B': 10, '3C': 5, '4A': 0, '4B': 0, '4C': 0 },
      // Wavy types
      '2A': { '1A': 40, '1B': 50, '1C': 60, '2A': 100, '2B': 85, '2C': 70, '3A': 50, '3B': 30, '3C': 20, '4A': 10, '4B': 5, '4C': 0 },
      '2B': { '1A': 20, '1B': 30, '1C': 40, '2A': 85, '2B': 100, '2C': 85, '3A': 60, '3B': 40, '3C': 30, '4A': 15, '4B': 10, '4C': 5 },
      '2C': { '1A': 10, '1B': 20, '1C': 30, '2A': 70, '2B': 85, '2C': 100, '3A': 70, '3B': 50, '3C': 40, '4A': 20, '4B': 15, '4C': 10 },
      // Curly types
      '3A': { '1A': 5, '1B': 10, '1C': 15, '2A': 50, '2B': 60, '2C': 70, '3A': 100, '3B': 85, '3C': 70, '4A': 50, '4B': 30, '4C': 20 },
      '3B': { '1A': 0, '1B': 5, '1C': 10, '2A': 30, '2B': 40, '2C': 50, '3A': 85, '3B': 100, '3C': 85, '4A': 60, '4B': 40, '4C': 30 },
      '3C': { '1A': 0, '1B': 0, '1C': 5, '2A': 20, '2B': 30, '2C': 40, '3A': 70, '3B': 85, '3C': 100, '4A': 70, '4B': 50, '4C': 40 },
      // Coily types
      '4A': { '1A': 0, '1B': 0, '1C': 0, '2A': 10, '2B': 15, '2C': 20, '3A': 50, '3B': 60, '3C': 70, '4A': 100, '4B': 85, '4C': 70 },
      '4B': { '1A': 0, '1B': 0, '1C': 0, '2A': 5, '2B': 10, '2C': 15, '3A': 30, '3B': 40, '3C': 50, '4A': 85, '4B': 100, '4C': 85 },
      '4C': { '1A': 0, '1B': 0, '1C': 0, '2A': 0, '2B': 5, '2C': 10, '3A': 20, '3B': 30, '3C': 40, '4A': 70, '4B': 85, '4C': 100 },
    },
  },
  
  // Color Depth (1-10 scale, admin-only)
  hairColorDepth: {
    type: 'range',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 8,
    min: 1,
    max: 10,
    tolerance: 2, // Matches within 2 levels score well
    description: '1=Black to 10=Lightest Blonde',
  },
  
  // Color Undertone (admin-only)
  hairColorUndertone: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 5,
    options: ['warm', 'cool', 'neutral'],
  },
  
  // Hair Porosity (admin-only)
  hairPorosity: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 6,
    options: ['low', 'medium', 'high'],
    description: 'Important for color treatments',
  },
  
  // Hair Style (for style-specific services)
  hairStyle: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 10,
    options: ['natural', 'blowout', 'silk_press', 'braids', 'cornrows', 'locs', 'twists', 'afro', 'bantu_knots', 'ponytail', 'updo', 'bob', 'wig', 'weave', 'twa', 'fade'],
  },

  // Desired cut/style: pro wants this specific look; model must list it in openToCutStyles (hyperpersonalized)
  desiredCutStyle: {
    type: 'array_contains',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 14,
    modelKey: 'openToCutStyles',
    options: ['long_layers', 'bob', 'pixie', 'lob', 'blunt', 'shag', 'layers', 'face_framing', 'curtain_bangs', 'bangs', 'trim', 'other'],
    description: 'Is model open to this specific cut/style (e.g. long layers, bob)?',
  },
  
  // Hair Health metrics (admin-only)
  hairFrizzLevel: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['none', 'low', 'medium', 'high'],
  },
  
  hairDamageLevel: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 8,
    options: ['none', 'mild', 'moderate', 'severe'],
    description: 'Critical for chemical services',
  },
  
  // Legacy fields (backwards compatibility)
  hairLength: { 
    type: 'mc', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 12,
    options: ['short', 'medium', 'long', 'extra_long'],
    aliasFor: 'hairLengthSimple', // Map to new field
  },
  hairColor: { 
    type: 'mc', 
    matchType: MATCH_TYPES.INDIRECT,
    weight: 10,
    options: ['black', 'brown', 'blonde', 'red', 'gray', 'colored'],
    aliasFor: 'hairColorSimple',
  },
  hairTexture: { 
    type: 'mc', 
    matchType: MATCH_TYPES.INDIRECT,
    weight: 10,
    options: ['straight', 'wavy', 'curly', 'coily'],
    aliasFor: 'hairTextureSimple',
  },
  hairVolume: { 
    type: 'yn', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 5,
    label: 'High Volume Hair',
  },
  hairCurl: { 
    type: 'yn', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 5,
    label: 'Natural Curl Pattern',
  },
  
  // Hair Condition (Critical for color services)
  virginHair: { 
    type: 'yn', 
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 15, // Very important when requested
    label: 'Virgin (never colored)',
  },
  hairCondition: {
    type: 'mc',
    matchType: MATCH_TYPES.DIRECT,
    weight: 8,
    options: ['healthy', 'damaged', 'color_treated', 'virgin'],
  },
  
  // ============ BEAUTY ENGINE ATTRIBUTES ============
  // Skin Attributes (simple - user-facing)
  skinToneSimple: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 6,
    options: ['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark'],
    scoreMatrix: {
      fair: { fair: 100, light: 80, medium: 40, olive: 30, tan: 20, brown: 10, dark: 5 },
      light: { fair: 80, light: 100, medium: 60, olive: 50, tan: 30, brown: 15, dark: 10 },
      medium: { fair: 40, light: 60, medium: 100, olive: 80, tan: 70, brown: 40, dark: 20 },
      olive: { fair: 30, light: 50, medium: 80, olive: 100, tan: 80, brown: 50, dark: 30 },
      tan: { fair: 20, light: 30, medium: 70, olive: 80, tan: 100, brown: 70, dark: 40 },
      brown: { fair: 10, light: 15, medium: 40, olive: 50, tan: 70, brown: 100, dark: 80 },
      dark: { fair: 5, light: 10, medium: 20, olive: 30, tan: 40, brown: 80, dark: 100 },
    },
  },
  
  skinUndertone: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 5,
    options: ['warm', 'cool', 'neutral'],
    description: 'Important for makeup color matching',
  },
  
  skinType: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['dry', 'normal', 'oily', 'combination'],
    description: 'Important for skincare services',
  },
  
  // Face Attributes
  faceShapeSimple: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 8,
    options: ['oval', 'round', 'square', 'heart', 'oblong', 'diamond'],
    description: 'Used for makeup contouring and styling',
  },
  
  jawlineType: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['soft', 'average', 'defined', 'angular'],
  },
  
  cheekboneProminence: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 3,
    options: ['flat', 'average', 'prominent'],
  },
  
  // Eye Attributes
  eyeColorSimple: { 
    type: 'mc', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 5,
    options: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'],
  },
  
  eyeShapeSimple: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 6,
    options: ['almond', 'round', 'hooded', 'monolid', 'downturned', 'upturned'],
    description: 'Critical for eye makeup application',
  },
  
  eyeSize: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 3,
    options: ['small', 'medium', 'large'],
  },
  
  eyeSpacing: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 3,
    options: ['close_set', 'average', 'wide_set'],
    description: 'Affects eye makeup technique',
  },
  
  eyeLidType: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 5,
    options: ['visible_crease', 'hooded', 'monolid'],
    description: 'Critical for eyeshadow technique',
  },
  
  // Eyebrow Attributes
  eyebrowShapeSimple: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['arched', 'straight', 'curved', 's_shaped', 'rounded'],
  },
  
  eyebrowThickness: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['thin', 'medium', 'thick', 'bushy'],
  },
  
  // Lip Attributes
  lipShapeSimple: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 5,
    options: ['full', 'thin', 'heart', 'wide', 'round', 'bow_shaped'],
    description: 'Important for lip makeup services',
  },
  
  lipSize: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['thin', 'medium', 'full', 'very_full'],
  },
  
  // Nose Attributes (for contouring)
  noseShape: {
    type: 'mc',
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 3,
    options: ['straight', 'roman', 'button', 'snub', 'wide', 'narrow'],
  },
  
  // Legacy Physical Features (backwards compatibility)
  eyeColor: { 
    type: 'mc', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 3,
    options: ['brown', 'blue', 'green', 'hazel', 'gray'],
    aliasFor: 'eyeColorSimple',
  },
  lightEyes: { 
    type: 'yn', 
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 3,
  },
  skinTone: { 
    type: 'mc', 
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 4,
    options: ['fair', 'light', 'medium', 'olive', 'tan', 'brown', 'dark'],
    aliasFor: 'skinToneSimple',
  },
  
  // Safety & Restrictions
  allergies: { 
    type: 'yn', 
    matchType: MATCH_TYPES.DIRECT,
    weight: 25, // CRITICAL - dealbreaker if allergies exist for certain services
    isDealbreaker: true,
  },
  
  // Experience & Preferences
  experience: { 
    type: 'yn', 
    matchType: MATCH_TYPES.NO_MATCH,
    label: 'Has modeling experience',
  },
  openToChange: { 
    type: 'yn', 
    matchType: MATCH_TYPES.IF_REQUESTED,
    weight: 8,
    label: 'Open to dramatic changes',
  },
  
  // Content & Marketing
  events: { type: 'yn', matchType: MATCH_TYPES.NO_MATCH, label: 'Available for events' },
  features: { type: 'yn', matchType: MATCH_TYPES.NO_MATCH, label: 'Open to being featured' },
  content: { type: 'yn', matchType: MATCH_TYPES.NO_MATCH, label: 'Open to content creation' },
  reference: { type: 'mc', matchType: MATCH_TYPES.NO_MATCH },
  
  // Photos
  photos: { type: 'upload', matchType: MATCH_TYPES.NO_MATCH },
};

// ============================================
// AGENTIC LEARNING SCORES
// ============================================
// These scores evolve over time based on behavior and feedback
// They act as multipliers/boosters to the base match score

export const AGENTIC_SCORES = {
  // 1. RELIABILITY SCORE (0-100)
  // Measures: punctuality, cancellation rate, response time, follow-through
  reliability: {
    weight: 0.20, // 20% of final score
    factors: {
      showUpRate: { weight: 0.35, description: 'Shows up to appointments' },
      onTimeRate: { weight: 0.25, description: 'Arrives on time' },
      cancellationPenalty: { weight: 0.20, description: 'Last-minute cancellations (negative)' },
      responseTime: { weight: 0.10, description: 'Response time to booking requests' },
      instructionFollowing: { weight: 0.10, description: 'Follows pre-appointment instructions' },
    },
    decayRate: 0.05, // Score decays 5% per month of inactivity
    minBookingsRequired: 3, // Needs 3 bookings before score is reliable
  },

  // 2. PROFESSIONAL FEEDBACK SCORE (0-100)
  // Measures: ratings from professionals after appointments
  feedback: {
    weight: 0.25, // 25% of final score
    factors: {
      overallRating: { weight: 0.30, description: 'Average star rating (1-5)' },
      hairAccuracy: { weight: 0.20, description: 'Hair matched expectations / accuracy' },
      punctuality: { weight: 0.20, description: 'Arrived on time' },
      professionalism: { weight: 0.15, description: 'Professional demeanor' },
      wouldBookAgain: { weight: 0.15, description: 'Pro would book again (Y/N)' },
      // Deprecated (mapped from): cooperation → hairAccuracy, communication → punctuality, photoQuality → overallRating
    },
    recencyBias: 0.7, // Recent feedback weighted 70% more
  },

  // 3. EXPERIENCE SCORE (0-100)
  // Measures: platform experience and service variety
  experience: {
    weight: 0.15, // 15% of final score
    factors: {
      totalBookings: { 
        weight: 0.40, 
        description: 'Total completed bookings',
        tiers: [
          { min: 0, max: 2, score: 20, label: 'New' },
          { min: 3, max: 5, score: 40, label: 'Getting Started' },
          { min: 6, max: 10, score: 60, label: 'Experienced' },
          { min: 11, max: 20, score: 80, label: 'Veteran' },
          { min: 21, max: Infinity, score: 100, label: 'Elite' },
        ],
      },
      serviceVariety: { weight: 0.25, description: 'Different service types completed' },
      monthsOnPlatform: { weight: 0.20, description: 'Account age' },
      repeatBookings: { weight: 0.15, description: 'Same pro booked them again' },
    },
  },

  // 4. ENGAGEMENT SCORE (0-100)
  // Measures: platform activity and profile quality
  engagement: {
    weight: 0.15, // 15% of final score
    factors: {
      profileCompleteness: { weight: 0.25, description: 'Profile fields filled' },
      photoCount: { weight: 0.20, description: 'Number of quality photos' },
      photoRecency: { weight: 0.15, description: 'How recent are photos' },
      responseRate: { weight: 0.20, description: 'Response rate to opportunities' },
      lastActive: { weight: 0.10, description: 'Days since last activity' },
      quizCompletion: { weight: 0.10, description: 'Fun quizzes completed (future)' },
    },
  },

  // 5. COMPATIBILITY SCORE (0-100) - Dynamic per request
  // Measures: historical success with similar requests
  compatibility: {
    weight: 0.25, // 25% of final score
    factors: {
      sameServiceSuccess: { weight: 0.35, description: 'Success rate for this service type' },
      sameProfessionalHistory: { weight: 0.20, description: 'Previously worked with this pro' },
      similarProSuccess: { weight: 0.15, description: 'Success with similar experience level pros' },
      timeSlotPreference: { weight: 0.15, description: 'Requested time matches availability preference' },
      locationConvenience: { weight: 0.15, description: 'Distance/travel considerations' },
    },
  },
};

// ============================================
// SERVICE-SPECIFIC WEIGHT ADJUSTMENTS
// ============================================
// Different services prioritize different attributes

export const SERVICE_WEIGHTS = {
  haircut: {
    description: 'Precision cutting - length, texture, and cut-style preferences matter most',
    attributeMultipliers: {
      hairLength: 1.5,    // Extra important
      hairTexture: 1.3,
      hairDensity: 1.2,
      hairColor: 0.5,     // Less important for cuts
      virginHair: 0.3,    // Not really relevant
      desiredCutStyle: 1.6, // Hyperpersonalized: is model open to this specific cut (bob, long layers, etc.)?
      openToChange: 1.2,  // Open to change matters for cuts
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 1.0,
      experience: 0.8,    // Less experience needed
      engagement: 0.8,
      compatibility: 1.0,
    },
  },
  
  color: {
    description: 'Color treatment - hair condition is critical',
    attributeMultipliers: {
      hairLength: 0.8,
      hairTexture: 0.7,
      hairColor: 1.5,     // Starting color matters
      hairCondition: 2.0, // CRITICAL
      virginHair: 2.0,    // Very important
      allergies: 2.0,     // Safety critical
    },
    agenticMultipliers: {
      reliability: 1.2,   // Long appointments - must show up
      feedback: 1.0,
      experience: 1.2,    // Prefer experienced for color
      engagement: 0.8,
      compatibility: 1.2,
    },
  },
  
  highlights: {
    description: 'Highlights/balayage - color and length important',
    attributeMultipliers: {
      hairLength: 1.3,
      hairColor: 1.8,     // Very important for highlights
      hairCondition: 1.5,
      virginHair: 1.5,
      hairTexture: 1.0,
    },
    agenticMultipliers: {
      reliability: 1.3,   // Long process
      feedback: 1.1,
      experience: 1.0,
      engagement: 0.9,
      compatibility: 1.1,
    },
  },
  
  blowdry: {
    description: 'Blowout styling - texture and length matter',
    attributeMultipliers: {
      hairLength: 1.4,
      hairTexture: 1.5,   // Key for blowout technique
      hairVolume: 1.3,
      hairCurl: 1.2,
      hairColor: 0.3,     // Doesn't matter
      virginHair: 0.2,
    },
    agenticMultipliers: {
      reliability: 0.9,   // Shorter appointment
      feedback: 1.0,
      experience: 0.7,    // Good for new models
      engagement: 1.0,
      compatibility: 0.9,
    },
  },
  
  gloss: {
    description: 'Gloss treatment - condition and color relevant',
    attributeMultipliers: {
      hairCondition: 1.5,
      hairColor: 1.2,
      hairLength: 0.8,
      hairTexture: 0.7,
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 0.9,
      experience: 0.8,
      engagement: 0.9,
      compatibility: 1.0,
    },
  },
  
  keratin: {
    description: 'Keratin treatment - curl pattern and damage key',
    attributeMultipliers: {
      hairTexture: 1.8,   // Curly/frizzy ideal
      hairCurl: 1.5,
      hairCondition: 1.5, // Damaged hair often good candidate
      hairLength: 1.2,
      allergies: 2.0,     // Formaldehyde concerns
    },
    agenticMultipliers: {
      reliability: 1.4,   // Very long process
      feedback: 1.2,
      experience: 1.3,    // Need patient, experienced models
      engagement: 0.8,
      compatibility: 1.2,
    },
  },
  
  // ============ BEAUTY SERVICES ============
  makeup: {
    description: 'Full makeup application - face shape and skin are critical',
    attributeMultipliers: {
      skinToneSimple: 2.0,    // Critical for color matching
      skinUndertone: 1.8,     // Very important for product selection
      faceShapeSimple: 1.5,   // Important for contouring
      eyeShapeSimple: 1.5,    // Critical for eye makeup
      eyeLidType: 1.8,        // Critical for eyeshadow technique
      lipShapeSimple: 1.3,    // Important for lip looks
      eyebrowShapeSimple: 1.2,
      hairLength: 0.3,        // Not relevant
      hairColor: 0.2,
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 1.2,
      experience: 0.9,
      engagement: 1.0,
      compatibility: 1.1,
    },
  },
  
  bridal_makeup: {
    description: 'Bridal/special occasion makeup - precision is key',
    attributeMultipliers: {
      skinToneSimple: 2.0,
      skinUndertone: 2.0,
      faceShapeSimple: 1.8,
      eyeShapeSimple: 1.8,
      eyeLidType: 2.0,
      lipShapeSimple: 1.5,
      eyebrowShapeSimple: 1.5,
      skinType: 1.5,          // Important for longevity
    },
    agenticMultipliers: {
      reliability: 1.5,       // Must be reliable for big day
      feedback: 1.3,
      experience: 1.2,        // Prefer experienced models
      engagement: 0.9,
      compatibility: 1.3,
    },
  },
  
  eyebrows: {
    description: 'Eyebrow shaping/styling - brow features are critical',
    attributeMultipliers: {
      eyebrowShapeSimple: 2.0,  // Critical
      eyebrowThickness: 2.0,   // Critical
      faceShapeSimple: 1.3,
      skinToneSimple: 0.8,
      hairColor: 0.5,          // For brow tinting
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 1.1,
      experience: 0.8,         // Good for new models
      engagement: 1.0,
      compatibility: 1.0,
    },
  },
  
  lashes: {
    description: 'Lash extensions/applications - eye features critical',
    attributeMultipliers: {
      eyeShapeSimple: 2.0,     // Critical for lash style
      eyeLidType: 1.8,
      eyeSize: 1.5,
      eyeSpacing: 1.3,
      skinType: 1.0,           // For adhesive
      allergies: 2.0,          // Important for adhesives
    },
    agenticMultipliers: {
      reliability: 1.2,        // Long appointment
      feedback: 1.1,
      experience: 0.9,
      engagement: 0.9,
      compatibility: 1.0,
    },
  },
  
  skincare: {
    description: 'Skincare treatments - skin attributes are critical',
    attributeMultipliers: {
      skinToneSimple: 1.5,
      skinType: 2.0,           // Critical
      skinUndertone: 1.0,
      allergies: 2.0,          // Very important
      faceShapeSimple: 0.5,
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 1.0,
      experience: 0.8,
      engagement: 1.0,
      compatibility: 1.0,
    },
  },
  
  facial: {
    description: 'Facial treatments - skin condition and type critical',
    attributeMultipliers: {
      skinType: 2.0,
      skinToneSimple: 1.5,
      allergies: 2.0,
    },
    agenticMultipliers: {
      reliability: 1.0,
      feedback: 1.0,
      experience: 0.7,
      engagement: 1.0,
      compatibility: 1.0,
    },
  },
  
  nails: {
    description: 'Nail services - minimal physical matching needed',
    attributeMultipliers: {
      skinToneSimple: 1.0,     // For polish color recommendations
      skinUndertone: 0.8,
    },
    agenticMultipliers: {
      reliability: 0.9,
      feedback: 1.0,
      experience: 0.6,         // Great for new models
      engagement: 1.0,
      compatibility: 0.9,
    },
  },
  
  photoshoot: {
    description: 'Photo/content shoot - overall appearance matters',
    attributeMultipliers: {
      skinToneSimple: 1.2,
      faceShapeSimple: 1.3,
      eyeColorSimple: 1.2,
      hairLengthSimple: 1.2,
      hairColorSimple: 1.2,
      hairTextureSimple: 1.1,
    },
    agenticMultipliers: {
      reliability: 1.3,
      feedback: 1.2,
      experience: 1.5,         // Experience matters for photos
      engagement: 1.2,
      compatibility: 1.2,
    },
  },
};

// ============================================
// MATCHING ENGINE CORE FUNCTIONS
// ============================================

/**
 * Calculate base attribute match score
 */
export function calculateAttributeScore(model, request, serviceType) {
  let totalScore = 0;
  let totalWeight = 0;
  const breakdown = {};
  
  const serviceConfig = SERVICE_WEIGHTS[serviceType] || {};
  const attributeMultipliers = serviceConfig.attributeMultipliers || {};

  // Go through each requested attribute
  for (const [attrKey, requestedValue] of Object.entries(request.criteria || {})) {
    const attrConfig = MODEL_ATTRIBUTES[attrKey];
    if (!attrConfig || attrConfig.matchType === MATCH_TYPES.NO_MATCH) continue;

    // 'Any', null, or undefined means "no preference" — skip this attribute entirely
    if (requestedValue === null || requestedValue === undefined || 
        requestedValue === 'Any' || requestedValue === 'any' || requestedValue === '') {
      continue;
    }
    
    const modelKey = attrConfig.modelKey || attrKey;
    const modelValue = model[modelKey];
    const baseWeight = attrConfig.weight || 5;
    const serviceMultiplier = attributeMultipliers[attrKey] || 1.0;
    const adjustedWeight = baseWeight * serviceMultiplier;
    
    let score = 0;
    
    // Array-contains: request wants X; model must have X in their open list (e.g. openToCutStyles)
    if (attrConfig.type === 'array_contains') {
      score = (Array.isArray(modelValue) && modelValue.includes(requestedValue)) ? 100 : 0;
    }
    // Calculate score based on match type
    else if (attrConfig.matchType === MATCH_TYPES.DIRECT) {
      if (attrConfig.scoreMatrix && attrConfig.scoreMatrix[requestedValue]) {
        score = attrConfig.scoreMatrix[requestedValue][modelValue] || 0;
      } else {
        score = modelValue === requestedValue ? 100 : 0;
      }
    } else if (attrConfig.matchType === MATCH_TYPES.INDIRECT) {
      score = calculateIndirectScore(requestedValue, modelValue, attrConfig);
    } else if (attrConfig.matchType === MATCH_TYPES.IF_REQUESTED) {
      // Only score if this attribute was specifically requested
      if (requestedValue !== null && requestedValue !== undefined) {
        score = modelValue === requestedValue ? 100 : 0;
      } else {
        continue; // Skip this attribute entirely
      }
    }
    
    // Check for dealbreakers
    if (attrConfig.isDealbreaker && score === 0) {
      breakdown[attrKey] = { score: 0, weight: adjustedWeight, isDealbreaker: true };
      return { totalScore: 0, breakdown, isDealbreaker: true, reason: attrKey };
    }
    
    totalScore += score * adjustedWeight;
    totalWeight += adjustedWeight;
    breakdown[attrKey] = { 
      score, 
      weight: adjustedWeight, 
      requested: requestedValue, 
      actual: modelValue 
    };
  }
  
  // No criteria (or all "Any") → neutral 100, not 0 (0 was capping everyone below minScore)
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 100;
  
  return {
    totalScore: Math.round(normalizedScore),
    breakdown,
    isDealbreaker: false,
  };
}

/**
 * Calculate indirect match score (fuzzy matching)
 */
function calculateIndirectScore(requested, actual, attrConfig) {
  if (requested === actual) return 100;
  
  // Check similarity groups
  if (attrConfig.similarityGroups) {
    for (const group of attrConfig.similarityGroups) {
      if (group.includes(requested) && group.includes(actual)) {
        return 70; // Similar values get 70%
      }
    }
  }
  
  // Check score matrix
  if (attrConfig.scoreMatrix && attrConfig.scoreMatrix[requested]) {
    return attrConfig.scoreMatrix[requested][actual] || 0;
  }
  
  return 0;
}

/**
 * Calculate agentic learning score
 */
export function calculateAgenticScore(model, request, serviceType) {
  const scores = {};
  let totalScore = 0;
  
  const serviceConfig = SERVICE_WEIGHTS[serviceType] || {};
  const agenticMultipliers = serviceConfig.agenticMultipliers || {};
  
  for (const [scoreType, config] of Object.entries(AGENTIC_SCORES)) {
    const modelScore = model.agenticScores?.[scoreType] || 50; // Default to 50 if no data
    const baseWeight = config.weight;
    const serviceMultiplier = agenticMultipliers[scoreType] || 1.0;
    const adjustedWeight = baseWeight * serviceMultiplier;
    
    // Apply minimum bookings requirement for reliability
    let adjustedScore = modelScore;
    if (scoreType === 'reliability' && (model.totalBookings || 0) < config.minBookingsRequired) {
      adjustedScore = 50; // Neutral score if not enough data
    }
    
    scores[scoreType] = {
      score: adjustedScore,
      weight: adjustedWeight,
      contribution: adjustedScore * adjustedWeight,
    };
    
    totalScore += adjustedScore * adjustedWeight;
  }
  
  // Normalize to 0-100
  const totalWeight = Object.values(scores).reduce((sum, s) => sum + s.weight, 0);
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) : 50;
  
  return {
    totalScore: Math.round(normalizedScore),
    breakdown: scores,
  };
}

/**
 * Extract 5-digit US ZIP from a location string (address, "City, ST 12345", or plain ZIP).
 * Returns null if no valid ZIP found.
 */
export function extractZipFromLocation(location) {
  if (!location || typeof location !== 'string') return null;
  const match = location.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

/**
 * Normalize location to 5-digit ZIP for distance calculation.
 * Accepts: plain ZIP, "City, ST 12345", full address, etc.
 */
function normalizeToZip(location) {
  if (!location) return null;
  const zip = extractZipFromLocation(location);
  if (zip) return zip;
  const digits = String(location).replace(/\D/g, '').slice(0, 5);
  return digits.length === 5 ? digits : null;
}

/**
 * Haversine formula: distance in miles between two lat/lng points.
 */
export function haversineMiles(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get distance in miles from model ZIP to salon coordinates.
 * Uses ZIP centroid for model location when actual coords not available.
 * @param {string} modelZip - Model's 5-digit ZIP
 * @param {{ lat: number, lng: number }} salonCoords - Salon lat/lng
 * @param {Object} [centroids] - ZIP centroid lookup (default: zipCentroids)
 * @returns {number|null} Distance in miles, or null if model ZIP not in lookup
 */
function getDistanceMilesFromModelZipToSalon(modelZip, salonCoords, centroids = zipCentroids) {
  if (!salonCoords || typeof salonCoords.lat !== 'number' || typeof salonCoords.lng !== 'number') return null;
  const normZip = String(modelZip || '').replace(/\D/g, '').slice(0, 5);
  if (!normZip) return null;
  const modelCoord = centroids[normZip];
  if (!modelCoord) return null;
  return haversineMiles(modelCoord[0], modelCoord[1], salonCoords.lat, salonCoords.lng);
}

/**
 * Get distance between two US zip codes in miles using ZCTA centroid lookup + Haversine.
 * Returns null if either zip is not in the lookup (fallback to heuristic).
 */
function getZipDistanceMiles(zipA, zipB, centroids = zipCentroids) {
  const a = String(zipA || '').replace(/\D/g, '').slice(0, 5);
  const b = String(zipB || '').replace(/\D/g, '').slice(0, 5);
  if (!a || !b) return null;
  if (a === b) return 0;
  const coordA = centroids[a];
  const coordB = centroids[b];
  if (!coordA || !coordB) return null;
  return haversineMiles(coordA[0], coordA[1], coordB[0], coordB[1]);
}

/**
 * Estimate distance between two US zip codes (in miles) using 3-digit prefix heuristic.
 * Fallback when ZCTA lookup fails (e.g. PO boxes, new ZIPs).
 */
function estimateZipDistanceMiles(zipA, zipB) {
  const a = String(zipA || '').replace(/\D/g, '').slice(0, 5);
  const b = String(zipB || '').replace(/\D/g, '').slice(0, 5);
  if (!a || !b) return 999;
  if (a === b) return 0;
  if (a.slice(0, 3) === b.slice(0, 3)) return 15;   // Same SCF (Sectional Center Facility)
  if (a.slice(0, 2) === b.slice(0, 2)) return 75;    // Same region
  if (a.slice(0, 1) === b.slice(0, 1)) return 200;  // Same area (0-9)
  return 500;  // Different coasts/areas
}

/**
 * Map distance (miles) to score (0-100). Used for both ZIP-ZIP and model ZIP + salon coords.
 */
function distanceToScore(distanceMiles) {
  if (distanceMiles == null) return 50;
  if (distanceMiles <= 5) return 95;
  if (distanceMiles <= 15) return 90;
  if (distanceMiles <= 25) return 80;
  if (distanceMiles <= 50) return 65;
  if (distanceMiles <= 100) return 45;
  if (distanceMiles <= 200) return 25;
  return 10;
}

/**
 * Calculate location/distance score (0-100).
 * Prefer: model ZIP + salon lat/lng → Haversine distance.
 * Fallback: ZIP-to-ZIP via ZCTA centroids + Haversine.
 * Hard filters: willingToTravel=false (same borough only), travelRadius (miles cap).
 *
 * @param {string} modelLocation - Model's location ZIP
 * @param {string} requestLocation - Request's location ZIP or address
 * @param {Object} options - willingToTravel, travelRadius, salonCoords, salonZip, includeMetadata
 * @returns {number|Object} Score 0-100, or { score, distanceMiles, estimatedTravelMinutes, withinRadius }
 */
export function calculateLocationScore(modelLocation, requestLocation, options = {}) {
  const opts = typeof options === 'number' ? { travelRadius: options } : options;
  const {
    willingToTravel = true,
    travelRadius,
    zipCentroids: centroids = zipCentroids,
    includeMetadata = false,
    salonCoords = null,
    salonZip = null,
  } = opts;

  const modelZip = normalizeToZip(modelLocation);
  const requestZip = salonZip || normalizeToZip(requestLocation);
  if (!modelZip || !requestZip) return includeMetadata ? { score: 50, distanceMiles: null, estimatedTravelMinutes: null, withinRadius: null } : 50;

  if (modelZip === requestZip) {
    return includeMetadata ? { score: 100, distanceMiles: 0, estimatedTravelMinutes: 0, withinRadius: true } : 100;
  }

  const modelBorough = getNycBorough(modelZip);
  const requestBorough = getNycBorough(requestZip);

  // Hard filter: willingToTravel=false -> same borough only
  if (willingToTravel === false) {
    if (!modelBorough || !requestBorough || modelBorough !== requestBorough) {
      return includeMetadata ? { score: 5, distanceMiles: null, estimatedTravelMinutes: null, withinRadius: false } : 5;
    }
  }

  let score;
  let distanceMiles = null;
  let estimatedTravelMinutes = null;
  const effectiveRadius = travelRadius ?? 25;

  const hasSalonCoords = salonCoords && typeof salonCoords.lat === 'number' && typeof salonCoords.lng === 'number';

  // Primary path: model ZIP + salon coordinates → Haversine distance
  if (hasSalonCoords) {
    distanceMiles = getDistanceMilesFromModelZipToSalon(modelZip, salonCoords, centroids);
    if (distanceMiles != null) {
      if (distanceMiles > effectiveRadius) {
        return includeMetadata ? { score: 5, distanceMiles, estimatedTravelMinutes: null, withinRadius: false } : 5;
      }
      score = distanceToScore(distanceMiles);
      // NYC travel-time estimate for metadata (when model ZIP in centroids)
      estimatedTravelMinutes = estimateNYCTravelMinutes(modelZip, salonCoords, requestZip);
    }
  }

  // Fallback: ZIP-to-ZIP (when no salon coords or model ZIP not in centroids)
  if (score == null) {
    distanceMiles = getZipDistanceMiles(modelZip, requestZip, centroids);
    if (distanceMiles == null) distanceMiles = estimateZipDistanceMiles(modelZip, requestZip);
    if (distanceMiles > effectiveRadius) {
      return includeMetadata ? { score: 5, distanceMiles, estimatedTravelMinutes: null, withinRadius: false } : 5;
    }
    score = distanceToScore(distanceMiles);
    if (modelBorough && requestBorough && modelBorough === requestBorough && distanceMiles <= 10) {
      score = Math.min(100, score + 5);
    }
    estimatedTravelMinutes = estimateNYCTravelMinutes(modelZip, hasSalonCoords ? salonCoords : null, requestZip);
  }

  const withinRadius = true;
  return includeMetadata ? { score, distanceMiles, estimatedTravelMinutes, withinRadius } : score;
}

/**
 * MAIN MATCHING FUNCTION
 * Combines all scores into final match score
 */
export function calculateMatchScore(model, request) {
  const serviceType = request.serviceId;
  
  // 1. Calculate attribute match (40% of total)
  const attributeResult = calculateAttributeScore(model, request, serviceType);
  
  // Check for dealbreakers
  if (attributeResult.isDealbreaker) {
    return {
      finalScore: 0,
      isMatch: false,
      isDealbreaker: true,
      reason: attributeResult.reason,
      breakdown: { attribute: attributeResult },
    };
  }
  
  // 2. Calculate agentic learning score (35% of total)
  const agenticResult = calculateAgenticScore(model, request, serviceType);
  
  // 3. Calculate location score (15% of total)
  const locationResult = calculateLocationScore(model.locationZip, request.location, {
    willingToTravel: model.willingToTravel,
    travelRadius: model.travelRadius,
    includeMetadata: true,
    salonCoords: request.salonCoords,
    salonZip: request.salonZip,
  });
  const locationScore = typeof locationResult === 'object' ? locationResult.score : locationResult;
  const estimatedTravelMinutes = typeof locationResult === 'object' ? locationResult.estimatedTravelMinutes : null;

  // 3b. Availability × Location triangulation: Can model reach salon in time (dealbreaker)?
  const feasibilityScore = availabilityLocationScore(model, request, estimatedTravelMinutes);
  if (feasibilityScore === 0) {
    return {
      finalScore: 0,
      isMatch: false,
      isDealbreaker: true,
      reason: 'Model cannot reach salon in time',
      breakdown: {
        attribute: { score: attributeResult.totalScore, weight: 0.4, details: attributeResult.breakdown },
        agentic: { score: agenticResult.totalScore, weight: 0.35, details: agenticResult.breakdown },
        location: { score: locationScore, weight: 0.15, estimatedTravelMinutes, withinRadius: false },
        availability: { score: 0, weight: 0.1, feasibilityDealbreaker: true },
      },
    };
  }

  // 4. Calculate availability score (10% of total)
  const availabilityScore = calculateAvailabilityScore(model, request);

  // 5. Reachability block: merge location (60%) + availability/feasibility (40%) into 27% of total
  const travelComponent = locationScore;
  const feasibilityComponent = feasibilityScore != null ? feasibilityScore : availabilityScore;
  const reachabilityScore = Math.round(travelComponent * 0.6 + feasibilityComponent * 0.4);

  const weights = WEIGHT_CONFIG;
  let finalScore = Math.round(
    attributeResult.totalScore * weights.attribute +
      agenticResult.totalScore * weights.agentic +
      reachabilityScore * weights.reachability
  );

  // Attribute floor: only when criteria were actually scored
  const attrScore = attributeResult.totalScore;
  const hadCriteria =
    attributeResult.breakdown && Object.keys(attributeResult.breakdown).length > 0;
  if (hadCriteria && attrScore < 50) {
    finalScore = Math.min(finalScore, Math.round(attrScore + 15));
  }

  return {
    finalScore,
    isMatch: finalScore >= 50,
    isStrongMatch: finalScore >= 75,
    isPerfectMatch: finalScore >= 90,
    breakdown: {
      attribute: {
        score: attributeResult.totalScore,
        weight: weights.attribute,
        details: attributeResult.breakdown,
      },
      agentic: {
        score: agenticResult.totalScore,
        weight: weights.agentic,
        details: agenticResult.breakdown,
        disabledInLaunchMode: weights.agentic === 0,
      },
      reachability: {
        score: reachabilityScore,
        weight: weights.reachability,
        travelScore: locationScore,
        feasibilityScore: feasibilityScore ?? availabilityScore,
        distanceMiles: typeof locationResult === 'object' ? locationResult.distanceMiles : undefined,
        estimatedTravelMinutes: typeof locationResult === 'object' ? locationResult.estimatedTravelMinutes : undefined,
        withinRadius: typeof locationResult === 'object' ? locationResult.withinRadius : undefined,
      },
    },
  };
}

/**
 * Calculate availability score
 */
function calculateAvailabilityScore(model, request) {
  // Check if model's availability includes the requested time
  const requestedDay = getDayFromDate(request.requestedDate);
  const requestedTime = normalizeTime(request.requestedTime);
  
  const modelAvailability = model.availability || {};
  const rawDayAvailability = modelAvailability[requestedDay];
  // Support both array format and object format { slots: [...], neighborhoods: [...] }
  const dayAvailability = Array.isArray(rawDayAvailability)
    ? rawDayAvailability
    : (rawDayAvailability?.slots || []);
  
  // Check if exact time matches
  const normalizedDayAvailability = dayAvailability.map(t => normalizeTime(t));
  if (normalizedDayAvailability.includes(requestedTime)) return 100;
  
  // Check if available that day (different time)
  if (dayAvailability.length > 0) {
    // Check if requested time is within 1 hour of any available slot
    const requestedHour = parseTimeToHour(requestedTime);
    const hasNearbySlot = normalizedDayAvailability.some(availTime => {
      const availHour = parseTimeToHour(availTime);
      return Math.abs(requestedHour - availHour) <= 1;
    });
    if (hasNearbySlot) return 75; // Available nearby
    return 50; // Available that day, different time
  }
  
  return 20; // Not available that day
}

function getDayFromDate(date) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  if (!date) return 'monday'; // default fallback
  // Parse as local time to avoid UTC shift (e.g. "2025-03-09" → Sunday not Saturday)
  const d = typeof date === 'string' && !date.includes('T')
    ? new Date(`${date}T00:00:00`)
    : new Date(date);
  return days[d.getDay()];
}

// Get detailed availability information for display
function getAvailabilityInfo(model, request) {
  const requestedDay = getDayFromDate(request.requestedDate);
  const requestedTime = normalizeTime(request.requestedTime);
  const modelAvailability = model.availability || {};
  const rawDayAvailability = modelAvailability[requestedDay];
  // Support both array format and object format { slots: [...], neighborhoods: [...] }
  const dayAvailability = Array.isArray(rawDayAvailability)
    ? rawDayAvailability
    : (rawDayAvailability?.slots || []);
  const normalizedDayAvailability = dayAvailability.map(t => normalizeTime(t));
  
  const isAvailable = normalizedDayAvailability.includes(requestedTime);
  const isAvailableNearby = normalizedDayAvailability.some(availTime => {
    const requestedHour = parseTimeToHour(requestedTime);
    const availHour = parseTimeToHour(availTime);
    return Math.abs(requestedHour - availHour) <= 1;
  });
  const isAvailableThatDay = dayAvailability.length > 0;
  
  return {
    isAvailable,
    isAvailableNearby,
    isAvailableThatDay,
    requestedDay,
    requestedTime,
    availableSlots: dayAvailability,
  };
}

// Normalize time formats: "10:00", "10am", "10:00 AM" -> "10:00 AM"
function normalizeTime(time) {
  if (!time) return '';
  // Remove spaces and convert to uppercase
  let normalized = time.trim().toUpperCase();
  // Handle formats like "10am", "10:00am", "10:00 AM"
  if (normalized.includes('AM') || normalized.includes('PM')) {
    // Already has AM/PM
    if (!normalized.includes(':')) {
      // "10AM" -> "10:00 AM"
      normalized = normalized.replace(/(\d+)(AM|PM)/, '$1:00 $2');
    }
    return normalized;
  }
  // Handle 24-hour format "10:00" -> "10:00 AM"
  if (normalized.includes(':')) {
    const [hours, mins] = normalized.split(':');
    const hour = parseInt(hours);
    if (hour < 12) {
      return `${hour}:${mins} AM`;
    } else if (hour === 12) {
      return `12:${mins} PM`;
    } else {
      return `${hour - 12}:${mins} PM`;
    }
  }
  // Handle "10am" format
  if (normalized.match(/^\d+[AP]M]$/i)) {
    return normalized.replace(/(\d+)(AM|PM)/, '$1:00 $2');
  }
  return normalized;
}

// Parse time to hour number (0-23) for comparison
function parseTimeToHour(time) {
  const normalized = normalizeTime(time);
  const match = normalized.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;
  let hour = parseInt(match[1]);
  const period = match[3];
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour;
}

// Parse time to minutes-from-midnight (0-1439)
function parseTimeToMinutes(time) {
  const normalized = normalizeTime(time);
  const match = normalized.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 0;
  let hour = parseInt(match[1]);
  const mins = parseInt(match[2]) || 0;
  const period = match[3];
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return hour * 60 + mins;
}

/**
 * Availability × Location triangulation: Can model physically reach salon in time?
 * Returns 0 (dealbreaker) if not; else feasibility score 55-100 based on buffer.
 */
function availabilityLocationScore(model, request, travelMinutes) {
  if (travelMinutes == null) return null; // Skip when no travel-time data
  const requestedDay = getDayFromDate(request.requestedDate);
  const requestedTime = request.requestedTime ? normalizeTime(request.requestedTime) : null;
  if (!requestedTime) return null;

  const appointmentMinutes = parseTimeToMinutes(requestedTime);
  const latestDeparture = appointmentMinutes - travelMinutes - 15; // 15 min buffer

  const rawDayAvailability = (model.availability || {})[requestedDay];
  // Support both array format ['9:00', '10:00'] and object format { slots: ['9:00'], neighborhoods: [...] }
  const daySlots = Array.isArray(rawDayAvailability)
    ? rawDayAvailability
    : (rawDayAvailability?.slots || []);

  // No slots for this day — indeterminate (not a hard dealbreaker, just skip the check)
  if (daySlots.length === 0) return null;

  const slotMinutes = daySlots.map((t) => parseTimeToMinutes(t));
  const canMakeIt = slotMinutes.some((m) => m <= latestDeparture);
  if (!canMakeIt) return null; // Can't confirm feasibility but don't eliminate

  const earliestSlot = Math.min(...slotMinutes);
  const bufferMinutes = latestDeparture - earliestSlot;
  if (bufferMinutes >= 60) return 100;
  if (bufferMinutes >= 30) return 85;
  if (bufferMinutes >= 15) return 70;
  return 55;
}

/**
 * Check if model is open to the requested service
 */
function isModelOpenToService(model, serviceType) {
  // Map service types to preference fields
  const servicePreferenceMap = {
    haircut: 'openToHaircut',
    mens_cut: 'openToHaircut',
    color: 'openToColor',
    highlights: 'openToColor',
    balayage: 'openToColor',
    gloss: 'openToColor',
    root_touchup: 'openToColor',
    color_correction: 'openToColor',
    blowdry: 'openToStyling',
    blowout: 'openToStyling',
    styling: 'openToStyling',
    updo: 'openToStyling',
    keratin: 'openToStyling',
    deep_conditioning: 'openToStyling',
    scalp_treatment: 'openToStyling',
    extensions: 'openToHaircut',
    extensions_consult: 'openToHaircut',
    makeup: 'openToMakeup',
    brows: 'openToMakeup',
    lashes: 'openToMakeup',
    bridal_makeup: 'openToMakeup',
    nails_manicure: 'openToNails',
    nails_pedi: 'openToNails',
    nails: 'openToNails',
    skincare: 'openToSkincare',
    waxing: 'openToSkincare',
    bridal_hair: 'openToStyling',
    bridal_trial: 'openToStyling',
  };
  
  const preferenceField = servicePreferenceMap[serviceType];
  if (preferenceField && model[preferenceField] !== undefined) {
    return model[preferenceField] === true;
  }
  
  // Fallback: check services array if preference field doesn't exist
  if (model.services && Array.isArray(model.services)) {
    return model.services.includes(serviceType);
  }
  
  // Default: assume open if no preference specified
  return true;
}

/**
 * Find and rank all matching models for a request
 */
export function findMatches(models, request, options = {}) {
  const { minScore = 30, limit = 20, requireValidCard = true } = options;
  
  const matches = models
    .filter(model => {
      // Card on file — required for model self-serve; admin can bypass at launch
      if (requireValidCard) {
        const cardStatus = model.cardOnFileStatus || 'none';
        if (cardStatus !== 'valid') {
          return false;
        }
      }
      // Check if model is open to the requested service
      if (request.serviceType && !isModelOpenToService(model, request.serviceType)) {
        return false;
      }
      return true;
    })
    .map(model => ({
      model,
      ...calculateMatchScore(model, request),
      // Add availability info
      availabilityInfo: getAvailabilityInfo(model, request),
    }))
    .filter(match => !match.isDealbreaker && match.finalScore >= minScore)
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, limit);
  
  const excludedNoCard = requireValidCard
    ? models.filter((m) => (m.cardOnFileStatus || 'none') !== 'valid').length
    : 0;

  return {
    matches,
    totalCandidates: models.length,
    qualifiedMatches: matches.length,
    excludedNoCard,
    averageScore: matches.length > 0 
      ? Math.round(matches.reduce((sum, m) => sum + m.finalScore, 0) / matches.length)
      : 0,
  };
}

// ============================================
// AGENTIC SCORE UPDATE FUNCTIONS
// ============================================
// These update the learning scores based on events

/**
 * Update scores after a completed booking
 */
export function updateScoresAfterBooking(model, booking, feedback) {
  const updates = {};
  
  // Update reliability
  if (booking.modelShowedUp) {
    updates.reliability = calculateNewReliability(model, booking);
  }
  
  // Update feedback score
  if (feedback) {
    updates.feedback = calculateNewFeedback(model, feedback);
  }
  
  // Update experience
  updates.experience = calculateNewExperience(model);
  
  // Update compatibility for this service (returns score + serviceHistory to persist)
  const compatResult = updateCompatibility(model, booking);
  let compatScore = compatResult.score;
  // Rebooking bonus: +10 when same pro books same model again
  if (booking.isRebooking) {
    compatScore = Math.min(100, compatScore + 10);
  }
  updates.compatibility = compatScore;
  updates.serviceHistory = compatResult.serviceHistory;
  
  return updates;
}

function calculateNewReliability(model, booking) {
  const currentScore = model.agenticScores?.reliability || 50;
  const totalBookings = model.totalBookings || 0;

  let adjustment = 0;

  // Show up bonus/penalty
  adjustment += booking.modelShowedUp ? 5 : -20;

  // On time bonus/penalty
  if (booking.modelShowedUp) {
    adjustment += booking.onTime ? 3 : -5;
  }

  // Response time factor
  if (booking.responseTimeHours < 2) adjustment += 2;
  else if (booking.responseTimeHours > 24) adjustment -= 3;

  // Sensitivity: new models respond more to each event; veterans are more stable
  // 0 bookings → sensitivity 1.0 (full adjustment); 20+ → sensitivity 0.3 (dampened)
  const sensitivity = Math.max(0.3, 1 - totalBookings / 20);
  const newScore = currentScore + adjustment * sensitivity;

  return Math.max(0, Math.min(100, Math.round(newScore)));
}

function calculateNewFeedback(model, feedback) {
  const currentScore = model.agenticScores?.feedback || 50;
  const totalFeedbacks = model.totalFeedbacks || 0;

  // Hair model reality schema: overall 35%, hairAccuracy 30%, professionalism 20%, punctuality 15%
  // Legacy fallbacks: cooperation→hairAccuracy, communication→punctuality, photoQuality→overall
  const hairAccuracy = feedback.hairAccuracy ?? feedback.cooperation ?? feedback.overallRating ?? 4;
  const punctualityRaw = feedback.punctuality ?? feedback.communication ?? feedback.onTime ?? feedback.overallRating ?? 4;
  const punctuality = typeof punctualityRaw === 'boolean' ? (punctualityRaw ? 5 : 2) : punctualityRaw;
  const overall = feedback.overallRating ?? 4;
  const professionalism = feedback.professionalism ?? feedback.overallExperience ?? overall;

  const feedbackScore = (
    (overall / 5) * 100 * 0.35 +
    (hairAccuracy / 5) * 100 * 0.30 +
    (professionalism / 5) * 100 * 0.20 +
    (punctuality / 5) * 100 * 0.15
  );

  const recencyWeight = 0.7;
  const historicalWeight = 0.3;

  if (totalFeedbacks === 0) {
    return Math.round(feedbackScore);
  }

  const newScore = feedbackScore * recencyWeight + currentScore * historicalWeight;
  return Math.round(newScore);
}

function calculateNewExperience(model) {
  const totalBookings = model.totalBookings || 0;
  const serviceVariety = model.servicesCompleted?.length || 1;
  const monthsOnPlatform = model.monthsOnPlatform || 1;
  const repeatBookings = model.repeatBookings || 0;
  
  // Get tier score for bookings
  const bookingTiers = AGENTIC_SCORES.experience.factors.totalBookings.tiers;
  let bookingScore = 20;
  for (const tier of bookingTiers) {
    if (totalBookings >= tier.min && totalBookings <= tier.max) {
      bookingScore = tier.score;
      break;
    }
  }
  
  const varietyScore = Math.min(100, serviceVariety * 20);
  const tenureScore = Math.min(100, monthsOnPlatform * 10);
  const repeatScore = Math.min(100, repeatBookings * 15);
  
  return Math.round(
    bookingScore * 0.40 +
    varietyScore * 0.25 +
    tenureScore * 0.20 +
    repeatScore * 0.15
  );
}

function updateCompatibility(model, booking) {
  const currentScore = model.agenticScores?.compatibility || 50;
  const serviceType = booking.serviceId;
  
  // Track success rate by service (clone to avoid mutating input)
  const serviceHistory = { ...(model.serviceHistory || {}) };
  const existing = serviceHistory[serviceType] || { successes: 0, total: 0 };
  serviceHistory[serviceType] = {
    successes: existing.successes + (booking.wasSuccessful ? 1 : 0),
    total: existing.total + 1,
  };
  
  const history = serviceHistory[serviceType];
  const serviceSuccessRate = (history.successes / history.total) * 100;
  
  // Blend with overall compatibility
  const score = Math.round(currentScore * 0.6 + serviceSuccessRate * 0.4);
  return { score: Math.max(0, Math.min(100, score)), serviceHistory };
}

