// ============================================
// MOCK MATCH DATA
// ============================================
// Matches created when admin approves models for requests

export let mockMatches = [
  // Example: Matches will be added here when admin approves
];

// Helper to create a new match
export function createMatch(requestId, modelId, matchData) {
  const newMatch = {
    id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    requestId,
    modelId,
    matchScore: matchData.finalScore || 0,
    scoreBreakdown: matchData.breakdown || {},
    status: 'sent', // Standardized: match ready for model response
    sentAt: null, // Will be set when sent to model
    respondedAt: null, // Will be set when model responds
    bookingId: null, // Will be set if model accepts and booking is created
    waitlistPosition: null,
    adminNotes: null,
    createdAt: new Date().toISOString(),
    // Include match data for display
    model: matchData.model,
    request: matchData.request,
  };
  
  mockMatches.push(newMatch);
  return newMatch;
}

// Get matches for a request
export function getMatchesForRequest(requestId) {
  return mockMatches.filter(m => m.requestId === requestId);
}

// Get matches for a model
export function getMatchesForModel(modelId) {
  return mockMatches.filter(m => m.modelId === modelId);
}

// Get matches by status
export function getMatchesByStatus(status) {
  return mockMatches.filter(m => m.status === status);
}

// Update match status
export function updateMatchStatus(matchId, status, updates = {}) {
  const match = mockMatches.find(m => m.id === matchId);
  if (match) {
    match.status = status;
    Object.assign(match, updates);
    if (status === 'accepted') {
      match.respondedAt = new Date().toISOString();
    }
    return match;
  }
  return null;
}

// Get all matches
export function getAllMatches() {
  return mockMatches;
}

