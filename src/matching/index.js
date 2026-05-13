// ============================================
// MODELED MATCHING ENGINE - EXPORTS
// ============================================

// Core matching functions
export {
  calculateMatchScore,
  calculateAttributeScore,
  calculateAgenticScore,
  calculateLocationScore,
  extractZipFromLocation,
  findMatches,
  updateScoresAfterBooking,
  MATCH_TYPES,
  MODEL_ATTRIBUTES,
  AGENTIC_SCORES,
  SERVICE_WEIGHTS,
} from './matchingEngine';

// Mock data
export {
  mockModels,
  getModelById,
  getModelsByStatus,
  getTopPerformers,
} from './mockModels';

// Demo
export {
  runMatchingDemo,
  sampleRequest,
} from './matchingDemo';

