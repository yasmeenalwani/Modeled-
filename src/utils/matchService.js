/**
 * MODELED MANAGEMENT - Match Service
 * 
 * Comprehensive match management utilities for creating, updating, and managing matches
 */

import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';
import { createBookingFromMatch } from './bookingService';
import { updateModelLastActive, updateEngagementScore, recordProfessionalDecline } from './agenticScores';
import { 
  getMockMatches, 
  updateMockMatch, 
  getMockModel,
  getMockProfessional,
  shouldUseMockData,
  createMockBooking,
  getMockRequests,
  updateMockRequest,
  createMockMatch,
} from './mockDataService';

let client = null;
// Always use mock data in demo - never initialize client
// This prevents any database access attempts that cause "Cannot read properties of undefined (reading 'get')" errors
try {
  // Check if we should use mock data (always true in demo)
  const useMock = shouldUseMockData();
  if (!useMock) {
    try {
      client = generateClient();
    } catch (error) {
      console.warn('Failed to generate Amplify client, will use mock data only:', error);
      client = null;
    }
  } else {
    // Demo mode - explicitly keep client as null
    client = null;
  }
} catch (error) {
  // If shouldUseMockData() fails (e.g., localStorage not available), default to mock data
  console.warn('Error checking mock data mode, defaulting to mock data:', error);
  client = null;
}

const MatchStatus = {
  SENT: 'sent',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  WAITLIST: 'waitlist',
};

/** Max models on waitlist per request (when primary declines, we promote from here) */
const WAITLIST_MAX_PER_REQUEST = 10;

const normalizeMatchStatus = (status) => {
  if (!status || status === 'approved' || status === 'pending') return MatchStatus.SENT;
  return status;
};

// ============ MATCH CREATION ============

/**
 * Create a match from matching engine results
 * @param {string} requestId
 * @param {string} modelId
 * @param {object} matchData - { finalScore, matchScore, breakdown, scoreBreakdown }
 * @param {object} options - { status, waitlistPosition }
 */
export async function createMatch(requestId, modelId, matchData, options = {}) {
  try {
    console.log('=== createMatch ===', { requestId, modelId, matchData });
    
    // Map numeric IDs from matching engine to mockDataService string IDs
    // Seraphina Luna: id 1 -> 'mock-model-1'
    // IMPORTANT: If modelId already starts with 'mock-model-', keep it as is (already mapped)
    let mappedModelId = modelId;
    if (typeof modelId === 'number') {
      mappedModelId = `mock-model-${modelId}`;
    } else if (typeof modelId === 'string') {
      // If it's already in mock-model-X format, keep it
      if (modelId.startsWith('mock-model-')) {
        mappedModelId = modelId; // Already normalized
      } else if (modelId === '1') {
        mappedModelId = 'mock-model-1';
      } else if (modelId.match(/^\d+$/)) {
        // It's a numeric string like "1", "2", etc.
        mappedModelId = `mock-model-${modelId}`;
      }
      // Otherwise keep as is
    }
    
    console.log('Model ID mapping:', { original: modelId, mapped: mappedModelId });
    
    const matchDataToSave = {
      requestId,
      modelId: mappedModelId,
      matchScore: matchData.finalScore || matchData.matchScore || 0,
      scoreBreakdown: matchData.breakdown || matchData.scoreBreakdown || {},
      status: options.status || MatchStatus.SENT,
      ...(options.waitlistPosition != null && { waitlistPosition: options.waitlistPosition }),
    };
    
    console.log('Match data to save:', matchDataToSave);

    // Try real database first (use modelId as-is for real DB, not mock-model-X)
    const modelIdForDb = shouldUseMockData() ? mappedModelId : modelId;
    const dbPayload = { ...matchDataToSave, modelId: modelIdForDb };

    if (!shouldUseMockData() && client?.models?.Match && typeof client.models.Match.create === 'function') {
      try {
        const { data: match, errors } = await client.models.Match.create(dbPayload);
        
        if (errors || !match) {
          throw new Error(errors?.[0]?.message || 'Failed to create match');
        }

        return match;
      } catch (dbError) {
        console.error('[matchService] Database error createMatch:', dbError);
        throw dbError;
      }
    }
    
    // Use mock data
    // createMockMatch is already imported
    console.log('Creating mock match with:', { requestId, mappedModelId, matchScore: matchDataToSave.matchScore });
    const mockMatch = createMockMatch(requestId, mappedModelId, {
      matchScore: matchDataToSave.matchScore,
      scoreBreakdown: matchDataToSave.scoreBreakdown,
    });
    
    console.log('Mock match created:', mockMatch);
    
    // Verify it was saved correctly
    const verify = getMockMatches({ id: mockMatch.id })[0];
    console.log('Verification - match in storage:', verify);
    if (verify && verify.modelId !== mappedModelId) {
      console.error('ERROR: Match modelId mismatch!', { expected: mappedModelId, actual: verify.modelId });
    }
    
    return mockMatch;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
}

/**
 * Create multiple matches for a request (from matching engine)
 * All up to 11 get status 'sent' – first to accept and pay secures; others move to waitlist.
 */
export async function createMatchesForRequest(requestId, matches) {
  try {
    const createdMatches = [];

    const maxMatches = 1 + WAITLIST_MAX_PER_REQUEST; // 1 + 10 potential waitlist = 11
    for (let i = 0; i < Math.min(matches.length, maxMatches); i++) {
      const matchData = matches[i];
      try {
        const match = await createMatch(requestId, matchData.modelId, matchData, {
          status: MatchStatus.SENT,
        });
        createdMatches.push(match);
      } catch (error) {
        console.error(`Error creating match for model ${matchData.modelId}:`, error);
        // Continue with other matches
      }
    }

    return createdMatches;
  } catch (error) {
    console.error('Error creating matches for request:', error);
    throw error;
  }
}

// ============ MATCH QUERIES ============

/**
 * Get matches for a request
 */
export async function getMatchesForRequest(requestId, filters = {}) {
  try {
    if (!requestId) return [];

    if (!shouldUseMockData() && client?.models?.Match && typeof client.models.Match.list === 'function') {
      try {
        const queryOptions = {
          filter: { requestId: { eq: requestId } },
          limit: 1000,
        };
        if (filters.status) {
          queryOptions.filter = { ...queryOptions.filter, status: { eq: filters.status } };
        }
        const { data: matches } = await client.models.Match.list(queryOptions);
        if (matches?.length) return matches;
      } catch (dbError) {
        console.error('[matchService] Database error getMatchesForRequest:', dbError);
      }
    }
    
    const { getMockMatches } = await import('./mockDataService');
    return getMockMatches({ requestId, ...filters });
  } catch (error) {
    console.error('Error getting matches for request:', error);
    return [];
  }
}

/**
 * Get matches for a model
 */
export async function getMatchesForModel(modelId, filters = {}) {
  try {
    console.log('=== getMatchesForModel ===', { modelId, filters });
    
    // Normalize modelId to mock-model- format
    let normalizedModelId = modelId;
    if (typeof modelId === 'number') {
      normalizedModelId = `mock-model-${modelId}`;
    } else if (modelId === '1') {
      normalizedModelId = 'mock-model-1';
    } else if (modelId && !modelId.startsWith('mock-')) {
      // If it's a string ID but not in mock- format, try to normalize
      if (modelId.includes('-')) {
        // Already in some format, keep as is
      } else {
        // Might be just a number as string
        normalizedModelId = `mock-model-${modelId}`;
      }
    }
    
    console.log('Normalized modelId:', { original: modelId, normalized: normalizedModelId });
    
    // Real DB: use modelId as-is (DynamoDB ModelProfile id). Mock: use normalized.
    const modelIdForQuery = shouldUseMockData() ? normalizedModelId : modelId;
    if (!modelId) return [];

    if (!shouldUseMockData() && client?.models?.Match && typeof client.models.Match.list === 'function') {
      try {
        const queryOptions = {
          filter: { modelId: { eq: modelIdForQuery } },
          limit: 1000,
        };
        if (filters.status) {
          queryOptions.filter = { ...queryOptions.filter, status: { eq: filters.status } };
        }
        const { data: matches } = await client.models.Match.list(queryOptions);
        if (matches?.length) return matches;
      } catch (error) {
        console.error('[matchService] Database error getMatchesForModel:', error);
      }
    }
    
    // Use mock data
    console.log('Using mock data, searching for modelId:', normalizedModelId);
    const allMockMatches = getMockMatches(); // Get all first to debug
    console.log('All mock matches in storage:', allMockMatches.length, allMockMatches.map(m => ({ id: m.id, modelId: m.modelId, status: m.status, requestId: m.requestId })));
    
    // Try multiple ID formats to find matches
    const possibleIds = [normalizedModelId, modelId];
    if (modelId === 'mock-model-1' || normalizedModelId === 'mock-model-1') {
      possibleIds.push('1');
    }
    
    let mockMatches = [];
    for (const id of possibleIds) {
      const found = getMockMatches({ modelId: id, ...filters });
      if (found.length > 0) {
        console.log(`Found ${found.length} matches with modelId: ${id}`);
        // Normalize the modelId in results to match what we're searching for
        const normalized = found.map(m => ({ ...m, modelId: normalizedModelId }));
        mockMatches = [...mockMatches, ...normalized];
      }
    }
    
    // Remove duplicates
    const uniqueMatches = mockMatches.filter((match, index, self) => 
      index === self.findIndex(m => m.id === match.id)
    );
    
    console.log('Final matches for model:', uniqueMatches.length, uniqueMatches.map(m => ({ id: m.id, modelId: m.modelId, status: m.status })));
    
    return uniqueMatches;
  } catch (error) {
    console.error('Error getting matches for model:', error);
    return [];
  }
}

/**
 * Get all matches (admin only)
 */
export async function getAllMatches(filters = {}) {
  try {
    if (!shouldUseMockData() && client?.models?.Match && typeof client.models.Match.list === 'function') {
      try {
        const queryOptions = { limit: 1000 };
        if (filters.status || filters.requestId) {
          queryOptions.filter = {};
          if (filters.status) queryOptions.filter.status = { eq: filters.status };
          if (filters.requestId) queryOptions.filter.requestId = { eq: filters.requestId };
        }
        const { data: matches } = await client.models.Match.list(queryOptions);
        if (matches?.length) return matches;
      } catch (error) {
        console.error('[matchService] Database error getAllMatches:', error);
      }
    }
    
    // Use mock data
    return getMockMatches(filters);
  } catch (error) {
    console.error('Error getting all matches:', error);
    return [];
  }
}

/**
 * Get a single match by ID
 */
export async function getMatchById(matchId) {
  try {
    // In demo mode, ALWAYS use mock data - skip database entirely
    if (shouldUseMockData()) {
      const mockMatches = getMockMatches({ id: matchId });
      return mockMatches[0] || null;
    }
    
    // Only try database if NOT in mock mode
    if (client && client.models && client.models.Match && typeof client.models.Match.get === 'function') {
      try {
        const { data: match } = await client.models.Match.get({ id: matchId });
        if (match) return match;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Fallback to mock data
    const mockMatches = getMockMatches({ id: matchId });
    return mockMatches[0] || null;
  } catch (error) {
    console.error('Error getting match:', error);
    // Always return mock data as fallback
    const mockMatches = getMockMatches({ id: matchId });
    return mockMatches[0] || null;
  }
}

/**
 * Get sent matches (awaiting model response)
 */
export async function getPendingMatches() {
  return getAllMatches({ status: MatchStatus.SENT });
}

/**
 * Get sent matches (sent to models, awaiting response)
 */
export async function getSentMatches() {
  return getAllMatches({ status: MatchStatus.SENT });
}

/**
 * Get accepted matches (models accepted, ready for booking)
 */
export async function getAcceptedMatches() {
  return getAllMatches({ status: MatchStatus.ACCEPTED });
}

/**
 * Get matches by status
 */
export async function getMatchesByStatus(status) {
  return getAllMatches({ status });
}

// ============ MATCH ACTIONS ============

/**
 * Approve match (admin approves to send to model)
 */
export async function approveMatch(matchId, adminNotes = '') {
  try {
    const updates = {
      status: MatchStatus.SENT,
      adminNotes: adminNotes || '',
    };

    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data: match } = await client.models.Match.update({
          id: matchId,
          ...updates,
        });
        return match;
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
      }
    }

    return updateMockMatch(matchId, updates);
  } catch (error) {
    console.error('Error approving match:', error);
    throw error;
  }
}

/**
 * Approve multiple matches at once (all get SENT – first to accept/pay wins).
 */
export async function approveMatches(matchIds, adminNotes = '') {
  try {
    const approvedMatches = [];
    for (const matchId of matchIds) {
      try {
        const match = await approveMatch(matchId, adminNotes);
        approvedMatches.push(match);
      } catch (error) {
        console.error(`Error approving match ${matchId}:`, error);
      }
    }
    return approvedMatches;
  } catch (error) {
    console.error('Error approving matches:', error);
    throw error;
  }
}

/**
 * Send match to model (change status to 'sent' and send notification)
 * @param {string} matchId
 * @param {{ isSlotReopened?: boolean }} options - Use isSlotReopened when notifying waitlist that slot opened
 */
export async function sendMatchToModel(matchId, options = {}) {
  const { isSlotReopened } = options;
  // Always wrap in try-catch to ensure we never throw errors in demo mode
  try {
    console.log('=== SENDING MATCH TO MODEL ===', matchId);
    console.log('Using mock data?', shouldUseMockData());
    console.log('Client is:', client ? 'initialized' : 'null');
    
    // Safety check: If client is somehow initialized in demo mode, null it out
    if (shouldUseMockData() && client) {
      console.warn('⚠️ Client was initialized in demo mode - disabling it');
      client = null;
    }
    
    // In demo mode, skip all database code entirely
    if (shouldUseMockData()) {
      console.log('Demo mode: Using mock data only');
      const mockMatches = getMockMatches({ id: matchId });
      const match = mockMatches[0];
      
      if (!match) {
        console.error('Match not found in mock data:', matchId);
        return null;
      }
      
      console.log('Match found in mock data:', match);
      
      // Update match status directly in mock data
      let normalizedModelId = match.modelId;
      if (typeof match.modelId === 'number') {
        normalizedModelId = `mock-model-${match.modelId}`;
      } else if (match.modelId === '1') {
        normalizedModelId = 'mock-model-1';
      } else if (match.modelId && !match.modelId.startsWith('mock-')) {
        if (String(match.modelId).match(/^\d+$/)) {
          normalizedModelId = `mock-model-${match.modelId}`;
        }
      }
      
      const updatedMatch = updateMockMatch(matchId, {
        status: 'sent',
        sentAt: new Date().toISOString(),
        modelId: normalizedModelId, // Ensure normalized ID
      });
      
      console.log('Match updated in mock data:', updatedMatch);
      
      // Get model and request for notification
      const model = getMockModel(normalizedModelId);
      const requests = getMockRequests({ id: match.requestId });
      const request = requests[0];
      
      if (model && request) {
        const notif = isSlotReopened
          ? { title: 'Slot Open Again!', message: `The appointment slot you were waitlisted for is now available. Book now to secure ${request.serviceType || 'the service'} on ${new Date(request.requestedDate).toLocaleDateString()}.` }
          : { title: 'New Booking Opportunity!', message: `You've been matched for ${request.serviceType || 'a service'} on ${new Date(request.requestedDate).toLocaleDateString()}. Match score: ${Math.round(match.matchScore || 0)}/100` };
        await createNotification({
          userId: model.userId || 'mock-user-1',
          userType: 'model',
          type: 'match_opportunity',
          title: notif.title,
          message: notif.message,
          data: {
            matchId: match.id,
            requestId: match.requestId,
            matchScore: match.matchScore,
            serviceType: request.serviceType,
            appointmentDate: request.requestedDate,
            appointmentTime: request.requestedTime,
          },
        }).catch(console.error);
      }
      
      return updatedMatch;
    }
    
    // Only try database if NOT in mock mode
    // Get match - this should always work with mock data
    let match;
    try {
      match = await getMatchById(matchId);
    } catch (getError) {
      console.error('Error getting match:', getError);
      // In demo mode, try to get from mock data directly
      if (shouldUseMockData()) {
        const mockMatches = getMockMatches({ id: matchId });
        match = mockMatches[0];
      }
      if (!match) {
        throw new Error('Match not found');
      }
    }
    
    console.log('Match found:', match);
    
    if (!match) {
      throw new Error('Match not found');
    }

    console.log('Current match status:', match.status);
    const currentStatus = normalizeMatchStatus(match.status);
    if (currentStatus !== MatchStatus.SENT) {
      console.warn('Match status is not sent, but proceeding anyway:', match.status);
    }

    let updatedMatch;
    
    // Try real database first - but only if we're NOT using mock data
    // In demo mode, shouldUseMockData() returns true, so we skip this entirely
    if (!shouldUseMockData() && client && client.models && client.models.Match && typeof client.models.Match.update === 'function') {
      try {
        // Update match status
        const { data } = await client.models.Match.update({
          id: matchId,
          status: MatchStatus.SENT,
          sentAt: new Date(),
        });
        updatedMatch = data;

        // Get model and request details for notification
        let model, request;
        if (client && client.models && client.models.ModelProfile && client.models.ModelRequest && 
            typeof client.models.ModelProfile.get === 'function' && 
            typeof client.models.ModelRequest.get === 'function') {
          try {
            [model, request] = await Promise.all([
              client.models.ModelProfile.get({ id: match.modelId }),
              client.models.ModelRequest.get({ id: match.requestId }),
            ]);
          } catch (error) {
            console.error('Error fetching model/request for notification:', error);
            model = { data: null };
            request = { data: null };
          }
        } else {
          model = { data: null };
          request = { data: null };
        }

        // Send notification to model
        if (model?.data && request?.data) {
          const notif = isSlotReopened
            ? { title: 'Slot Open Again!', message: `The appointment slot you were waitlisted for is now available. Book now to secure ${request.data.serviceType || 'the service'} on ${new Date(request.data.requestedDate).toLocaleDateString()}.` }
            : { title: 'New Booking Opportunity!', message: `You've been matched for ${request.data.serviceType || 'a service'} on ${new Date(request.data.requestedDate).toLocaleDateString()}. Match score: ${Math.round(match.matchScore)}/100` };
          await createNotification({
            userId: model.data.userId,
            userType: 'model',
            type: 'match_opportunity',
            title: notif.title,
            message: notif.message,
            data: {
              matchId: match.id,
              requestId: match.requestId,
              matchScore: match.matchScore,
              serviceType: request.data.serviceType,
              appointmentDate: request.data.requestedDate,
              appointmentTime: request.data.requestedTime,
            },
          });
        }

        return updatedMatch;
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
        // Fall through to mock data - don't throw, just continue
      }
    }
    
    // Always use mock data if database failed or in demo mode
    // This ensures we never throw errors in demo mode
    
    // Use mock data
    // updateMockMatch, getMockModel, getMockRequests are already imported
    console.log('=== SEND MATCH TO MODEL ===');
    console.log('Match ID:', matchId);
    console.log('Match before update:', match);
    console.log('Match modelId:', match.modelId, 'Type:', typeof match.modelId);
    
    // Normalize modelId to ensure consistency
    let normalizedModelId = match.modelId;
    if (typeof match.modelId === 'number') {
      normalizedModelId = `mock-model-${match.modelId}`;
    } else if (match.modelId === '1') {
      normalizedModelId = 'mock-model-1';
    } else if (match.modelId && !match.modelId.startsWith('mock-')) {
      if (String(match.modelId).match(/^\d+$/)) {
        normalizedModelId = `mock-model-${match.modelId}`;
      }
    }
    
    console.log('Normalized modelId:', normalizedModelId);
    
    // Update match with normalized modelId if it changed
    const updates = {
      status: 'sent',
      sentAt: new Date().toISOString(),
    };
    
    // If modelId needs normalization, update it too
    if (normalizedModelId !== match.modelId) {
      console.log('⚠️ ModelId needs normalization! Updating from', match.modelId, 'to', normalizedModelId);
      updates.modelId = normalizedModelId;
    }
    
    updatedMatch = updateMockMatch(matchId, updates);
    console.log('Match updated:', updatedMatch);
    
    // CRITICAL VERIFICATION: Check if match can be found by querying
    const verifyMatch = getMockMatches({ id: matchId })[0];
    console.log('=== VERIFICATION ===');
    console.log('Match in storage by ID:', verifyMatch);
    
    if (!verifyMatch) {
      console.error('❌ ERROR: Match not found in storage after update!');
    } else {
      console.log('✓ Match found in storage');
      console.log('Match details:', {
        id: verifyMatch.id,
        modelId: verifyMatch.modelId,
        modelIdType: typeof verifyMatch.modelId,
        requestId: verifyMatch.requestId,
        status: verifyMatch.status,
        sentAt: verifyMatch.sentAt,
      });
      
      // Test query by modelId
      const matchesByModelId = getMockMatches({ modelId: verifyMatch.modelId, status: 'sent' });
      console.log(`Query test: Found ${matchesByModelId.length} match(es) with modelId "${verifyMatch.modelId}" and status "sent"`);
      
      // Also test with normalized ID
      if (normalizedModelId && normalizedModelId !== verifyMatch.modelId) {
        const matchesByNormalized = getMockMatches({ modelId: normalizedModelId, status: 'sent' });
        console.log(`Query test (normalized): Found ${matchesByNormalized.length} match(es) with modelId "${normalizedModelId}" and status "sent"`);
      }
      
      // Test ALL sent matches
      const allSentMatches = getMockMatches({ status: 'sent' });
      console.log(`Total sent matches in system: ${allSentMatches.length}`);
      console.log('All sent matches:', allSentMatches.map(m => ({ 
        id: m.id, 
        modelId: m.modelId, 
        modelIdType: typeof m.modelId,
        requestId: m.requestId 
      })));
      
      if (matchesByModelId.length === 0 && allSentMatches.length > 0) {
        console.error('❌ CRITICAL ERROR: Match not found when querying by modelId!');
        console.error('This match exists:', verifyMatch);
        console.error('But query for modelId "' + verifyMatch.modelId + '" returns:', matchesByModelId);
        console.error('This means ModelOpportunities page won\'t find it!');
      } else if (matchesByModelId.length > 0) {
        console.log('✓ Match can be queried successfully!');
      }
    }
    
    // Get model and request for notification
    const model = getMockModel(match.modelId);
    console.log('Model found:', model);
    const requests = getMockRequests({ id: match.requestId });
    const request = requests[0];
    console.log('Request found:', request);
    
    // Send notification to model (Seraphina)
    if (model && request) {
      console.log('Creating notification for model:', {
        modelId: match.modelId,
        modelUserId: model.userId,
        matchId: match.id,
        requestId: match.requestId,
        serviceType: request.serviceType,
      });
      const notif2 = isSlotReopened
        ? { title: 'Slot Open Again!', message: `The appointment slot you were waitlisted for is now available. Book now to secure ${request.serviceType || 'the service'} on ${new Date(request.requestedDate).toLocaleDateString()}.` }
        : { title: 'New Booking Opportunity!', message: `You've been matched for ${request.serviceType || 'a service'} on ${new Date(request.requestedDate).toLocaleDateString()}. Match score: ${Math.round(match.matchScore || 0)}/100` };
      await createNotification({
        userId: model.userId || 'mock-user-1',
        userType: 'model',
        type: 'match_opportunity',
        title: notif2.title,
        message: notif2.message,
        data: {
          matchId: match.id,
          requestId: match.requestId,
          matchScore: match.matchScore,
          serviceType: request.serviceType,
          appointmentDate: request.requestedDate,
          appointmentTime: request.requestedTime,
        },
      }).catch(console.error);
      console.log('Notification created for model userId:', model.userId || 'mock-user-1');
    } else {
      console.warn('Cannot create notification - missing model or request:', { model: !!model, request: !!request });
    }

    return updatedMatch;
  } catch (error) {
    console.error('Error sending match to model:', error);
    // In demo mode, never throw - always try to update mock data
    if (shouldUseMockData()) {
      try {
        const match = getMockMatches({ id: matchId })[0];
        if (match) {
          const updated = updateMockMatch(matchId, {
            status: 'sent',
            sentAt: new Date().toISOString(),
          });
          console.log('Fallback: Updated match in mock data:', updated);
          return updated;
        }
      } catch (fallbackError) {
        console.error('Fallback update also failed:', fallbackError);
      }
    }
    // Only throw if we're not in demo mode
    if (!shouldUseMockData()) {
      throw error;
    }
    // In demo mode, return null rather than throwing
    return null;
  }
}

/**
 * Send multiple matches to models.
 * All selected matches get notified – first to accept and pay secures the appointment.
 */
export async function sendMatchesToModels(matchIds) {
  try {
    console.log('=== SENDING MATCHES TO MODELS ===', matchIds);
    const sentMatches = [];

    for (const matchId of matchIds) {
      try {
        console.log(`Sending match ${matchId}...`);
        const result = await sendMatchToModel(matchId);
        console.log(`Match ${matchId} sent successfully:`, result);
        sentMatches.push(result);
      } catch (error) {
        console.error(`Error sending match ${matchId}:`, error);
        if (shouldUseMockData()) {
          try {
            const m = await getMatchById(matchId);
            if (m) {
              const updated = updateMockMatch(matchId, {
                status: MatchStatus.SENT,
                sentAt: new Date().toISOString(),
              });
              if (updated) sentMatches.push(updated);
            }
          } catch (fallbackError) {
            console.error(`Fallback update failed for ${matchId}:`, fallbackError);
          }
        }
      }
    }

    console.log('Sent to all matches:', sentMatches.length);
    return sentMatches;
  } catch (error) {
    console.error('Error sending matches:', error);
    throw error;
  }
}

/**
 * Model accepts match (triggers booking creation flow)
 */
export async function acceptMatch(matchId, paymentData = {}) {
  try {
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (normalizeMatchStatus(match.status) !== MatchStatus.SENT) {
      throw new Error('Match must be sent before accepting');
    }

    let updatedMatch;
    
    // Try real database first
    if (!shouldUseMockData() && client && client.models) {
      try {
        // Update match status
        const { data } = await client.models.Match.update({
          id: matchId,
          status: MatchStatus.ACCEPTED,
          respondedAt: new Date(),
        });
        updatedMatch = data;

        // Create booking from match
        const bookingResult = await createBookingFromMatch(matchId, paymentData);

        // Update match with booking ID
        if (bookingResult.booking && client && client.models) {
          try {
            await client.models.Match.update({
              id: matchId,
              bookingId: bookingResult.booking.id,
            });
          } catch (error) {
            console.error('Error updating match with booking ID:', error);
          }
        }

        // Send acceptance notifications
        sendAcceptanceNotifications(match, bookingResult.booking).catch(console.error);

        // Update model lastActiveDate and engagement (for decay/scoring)
        updateModelLastActive(match.modelId).catch(console.error);
        updateEngagementScore(match.modelId).catch(console.error);

        return { match: updatedMatch, booking: bookingResult.booking };
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
        // Fall through to mock data
      }
    }
    
    // Use mock data
    updatedMatch = updateMockMatch(matchId, {
      status: MatchStatus.ACCEPTED,
      respondedAt: new Date().toISOString(),
    });
    
    // Create mock booking using createBookingFromMatch
    // Wrap in try-catch to handle any payment-related errors gracefully
    // DEMO MODE: Default to paid to bypass payment validation
    let booking = null;
    try {
      const { createBookingFromMatch } = await import('../utils/bookingService');
      // Ensure payment is marked as paid in demo mode (bypass payment validation)
      const demoPaymentData = {
        modelPaid: paymentData.modelPaid !== false, // Default to true in demo
        proPaid: paymentData.proPaid !== false,     // Default to true in demo
        ...paymentData,
      };
      const bookingResult = await createBookingFromMatch(matchId, demoPaymentData);
      booking = bookingResult?.booking || null;
      
      if (!booking) {
        console.warn('⚠️ createBookingFromMatch returned no booking, trying fallback...');
        // Try again with minimal payment data, explicitly marked as paid
        const fallbackResult = await createBookingFromMatch(matchId, {
          modelPaid: true,
          proPaid: true,
          appointmentDate: paymentData.appointmentDate,
          appointmentTime: paymentData.appointmentTime,
        });
        booking = fallbackResult?.booking || null;
      }
    } catch (bookingError) {
      console.error('❌ Error creating booking in acceptMatch:', bookingError);
      // Don't throw - we still want to mark match as accepted
      // The calendar will try to create bookings from accepted matches on load
    }
    
    if (booking) {
      // Update match with booking ID
      updateMockMatch(matchId, { bookingId: booking.id });
      
      // Update request status
      updateMockRequest(match.requestId, { status: 'booked' });
      
      // Send notifications (using mock data)
      const request = getMockRequests({ id: match.requestId })[0];
      const model = getMockModel(match.modelId);
      const professional = getMockProfessional(request?.professionalId);
      
      // Update model lastActiveDate and engagement (mock path)
      updateModelLastActive(match.modelId).catch(console.error);
      updateEngagementScore(match.modelId).catch(console.error);

      if (request && model && professional) {
        // Notify professional
        const { createNotification } = await import('./createNotification');
        await createNotification({
          userId: professional.userId || 'pro-user',
          userType: 'professional',
          type: 'match_accepted',
          title: 'Model Accepted!',
          message: `${model.firstName || 'Model'} ${model.lastName || ''} has accepted your booking request. Booking confirmed!`,
          data: {
            matchId: match.id,
            bookingId: booking.id,
            modelName: `${model.firstName} ${model.lastName}`,
            modelId: model.id,
          },
        }).catch(console.error);
        
        // Notify admin
        await createNotification({
          userId: 'admin',
          userType: 'admin',
          type: 'match_accepted',
          title: 'Match Accepted - Booking Confirmed',
          message: `Match accepted: ${model.firstName || 'Model'} + ${professional.firstName || 'Professional'}. Booking created.`,
          data: {
            matchId: match.id,
            bookingId: booking.id,
            requestId: request.id,
          },
        }).catch(console.error);
      }
      
      return { match: updatedMatch, booking };
    }
    
    return { match: updatedMatch, booking: null };
  } catch (error) {
    console.error('❌ Error accepting match:', error);
    // In demo mode, still try to create booking even if match update fails
    if (shouldUseMockData()) {
      try {
        const match = await getMatchById(matchId);
        if (match) {
          // Try to create booking directly
          const { createBookingFromMatch } = await import('../utils/bookingService');
          const bookingResult = await createBookingFromMatch(matchId, {
            modelPaid: true,
            proPaid: true,
          });
          if (bookingResult?.booking) {
            console.log('✅ Booking created despite match update error');
            return { match, booking: bookingResult.booking };
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback booking creation also failed:', fallbackError);
      }
    }
    // Re-throw only if we couldn't create booking
    throw error;
  }
}

/**
 * Model declines match
 */
export async function declineMatch(matchId, reason = '') {
  try {
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (normalizeMatchStatus(match.status) !== MatchStatus.SENT) {
      throw new Error('Match must be sent before declining');
    }

    // Update match status
    let updatedMatch;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Match.update({
          id: matchId,
          status: 'declined',
          respondedAt: new Date(),
          adminNotes: reason ? `Declined: ${reason}` : 'Declined by model',
        });
        updatedMatch = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!updatedMatch) {
      updatedMatch = updateMockMatch(matchId, {
        status: 'declined',
        respondedAt: new Date().toISOString(),
        adminNotes: reason ? `Declined: ${reason}` : 'Declined by model',
      });
    }

    // Send decline notifications
    sendDeclineNotifications(match, reason).catch(console.error);

    // Update model lastActiveDate and engagement (for decay/scoring)
    updateModelLastActive(match.modelId).catch(console.error);
    updateEngagementScore(match.modelId).catch(console.error);

    // Check if we should offer to next model in waitlist
    await handleWaitlistAfterDecline(match.requestId).catch(console.error);

    return updatedMatch;
  } catch (error) {
    console.error('Error declining match:', error);
    throw error;
  }
}

/**
 * Professional declines match (admin reject on behalf of pro).
 * Updates match status and applies compatibility penalty to model.
 */
export async function professionalDeclineMatch(matchId, reason = '') {
  try {
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (normalizeMatchStatus(match.status) !== MatchStatus.SENT) {
      throw new Error('Match must be sent before professional can decline');
    }

    let updatedMatch;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Match.update({
          id: matchId,
          status: MatchStatus.DECLINED,
          respondedAt: new Date(),
          adminNotes: reason ? `Pro declined: ${reason}` : 'Declined by professional',
        });
        updatedMatch = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }

    if (!updatedMatch || shouldUseMockData()) {
      updatedMatch = updateMockMatch(matchId, {
        status: MatchStatus.DECLINED,
        respondedAt: new Date().toISOString(),
        adminNotes: reason ? `Pro declined: ${reason}` : 'Declined by professional',
      });
    }

    // Apply compatibility penalty (spec 3C)
    if (match.modelId) {
      recordProfessionalDecline(match.modelId).catch(console.error);
    }

    return updatedMatch;
  } catch (error) {
    console.error('Error in professionalDeclineMatch:', error);
    throw error;
  }
}

/**
 * Expire match (if not responded to in time)
 */
export async function expireMatch(matchId) {
  try {
    const match = await getMatchById(matchId);
    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status !== 'sent') {
      return match; // Already handled
    }

    // Update match status
    let updatedMatch;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Match.update({
          id: matchId,
          status: 'expired',
          respondedAt: new Date(),
        });
        updatedMatch = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!updatedMatch) {
      updatedMatch = updateMockMatch(matchId, {
        status: 'expired',
        respondedAt: new Date().toISOString(),
      });
    }

    // Send expiration notifications
    sendExpirationNotifications(match).catch(console.error);

    // Check if we should offer to next model in waitlist
    await handleWaitlistAfterExpiration(match.requestId).catch(console.error);

    return updatedMatch;
  } catch (error) {
    console.error('Error expiring match:', error);
    throw error;
  }
}

/**
 * Expire all matches that haven't been responded to (run as scheduled job)
 */
export async function expireOldMatches(expirationHours = 48) {
  try {
    const sentMatches = await getSentMatches();
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - expirationHours);

    const expiredMatches = [];

    for (const match of sentMatches) {
      if (match.sentAt) {
        const sentDate = new Date(match.sentAt);
        if (sentDate < expirationTime) {
          try {
            const expired = await expireMatch(match.id);
            expiredMatches.push(expired);
          } catch (error) {
            console.error(`Error expiring match ${match.id}:`, error);
          }
        }
      }
    }

    return expiredMatches;
  } catch (error) {
    console.error('Error expiring old matches:', error);
    return [];
  }
}

// ============ WAITLIST MANAGEMENT ============

/**
 * Move other SENT matches to waitlist when one model secures the booking (first to accept + pay).
 */
export async function moveOtherMatchesToWaitlist(requestId, winningMatchId) {
  try {
    const allMatches = await getMatchesForRequest(requestId);
    const sentStatuses = [MatchStatus.SENT, 'sent', 'approved', 'pending'];
    const others = allMatches.filter(
      (m) => m.id !== winningMatchId && sentStatuses.includes(normalizeMatchStatus(m.status) || m.status)
    );
    if (others.length === 0) return;

    let position = 1;
    for (const match of others) {
      if (!shouldUseMockData() && client && client.models) {
        try {
          await client.models.Match.update({
            id: match.id,
            status: MatchStatus.WAITLIST,
            waitlistPosition: position,
          });
        } catch (err) {
          console.error('Error moving match to waitlist:', err);
        }
      }
      if (shouldUseMockData()) {
        updateMockMatch(match.id, {
          status: MatchStatus.WAITLIST,
          waitlistPosition: position,
        });
      }
      position++;
    }
  } catch (error) {
    console.error('Error moving other matches to waitlist:', error);
  }
}

/**
 * Add match to waitlist (if booking was taken by another model)
 */
export async function addMatchToWaitlist(matchId, position) {
  try {
    let match;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Match.update({
          id: matchId,
          status: 'waitlist',
          waitlistPosition: position,
        });
        match = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!match) {
      match = updateMockMatch(matchId, {
        status: 'waitlist',
        waitlistPosition: position,
      });
    }

    return match;
  } catch (error) {
    console.error('Error adding match to waitlist:', error);
    throw error;
  }
}

/**
 * Get waitlist for a request (sorted by position)
 */
export async function getWaitlistForRequest(requestId) {
  try {
    const matches = await getMatchesForRequest(requestId, { status: 'waitlist' });
    return matches.sort((a, b) => (a.waitlistPosition || 999) - (b.waitlistPosition || 999));
  } catch (error) {
    console.error('Error getting waitlist:', error);
    return [];
  }
}

/**
 * Promote next model from waitlist (if booking cancelled)
 */
export async function promoteFromWaitlist(requestId) {
  try {
    const waitlist = await getWaitlistForRequest(requestId);
    if (waitlist.length === 0) {
      return null;
    }

    const nextMatch = waitlist[0];

    // Send match to next model (slot reopened notification)
    await sendMatchToModel(nextMatch.id, { isSlotReopened: true });
    
    // Update waitlist positions
    if (!shouldUseMockData() && client && client.models) {
      try {
        for (let i = 1; i < waitlist.length; i++) {
          await client.models.Match.update({
            id: waitlist[i].id,
            waitlistPosition: i, // Move up one position
          });
        }
      } catch (error) {
        console.error('Database error updating waitlist positions:', error);
      }
    }
    
    // Use mock data
    if (shouldUseMockData()) {
      for (let i = 1; i < waitlist.length; i++) {
        updateMockMatch(waitlist[i].id, {
          waitlistPosition: i,
        });
      }
    }

    return nextMatch;
  } catch (error) {
    console.error('Error promoting from waitlist:', error);
    throw error;
  }
}

/**
 * Handle waitlist after a match is declined
 */
async function handleWaitlistAfterDecline(requestId) {
  try {
    // Check if request is still open
    let request = null;
    if (!shouldUseMockData() && client && client.models && client.models.ModelRequest && typeof client.models.ModelRequest.get === 'function') {
      try {
        const { data } = await client.models.ModelRequest.get({ id: requestId });
        request = data;
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data
    if (!request || shouldUseMockData()) {
      const requests = getMockRequests({ id: requestId });
      request = requests[0] || null;
    }
    
    if (!request || request.status === 'booked' || request.status === 'completed') {
      return; // Request is already filled
    }

    // Promote next from waitlist
    await promoteFromWaitlist(requestId);
  } catch (error) {
    console.error('Error handling waitlist after decline:', error);
  }
}

/**
 * Handle waitlist after a match expires
 */
async function handleWaitlistAfterExpiration(requestId) {
  try {
    // Same logic as decline
    await handleWaitlistAfterDecline(requestId);
  } catch (error) {
    console.error('Error handling waitlist after expiration:', error);
  }
}

// ============ NOTIFICATIONS ============

/**
 * Send acceptance notifications
 */
async function sendAcceptanceNotifications(match, booking) {
  try {
    let model, request, professional;
    
    if (!shouldUseMockData() && client && client.models && 
        client.models.ModelProfile && client.models.ModelRequest && client.models.Professional &&
        typeof client.models.ModelProfile.get === 'function' && 
        typeof client.models.ModelRequest.get === 'function' &&
        typeof client.models.Professional.get === 'function') {
      try {
        [model, request, professional] = await Promise.all([
          client.models.ModelProfile.get({ id: match.modelId }),
          client.models.ModelRequest.get({ id: match.requestId }),
          client.models.ModelRequest.get({ id: match.requestId }).then(r => 
            r.data ? client.models.Professional.get({ id: r.data.professionalId }) : null
          ),
        ]);
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data
    if (!model || !request || shouldUseMockData()) {
      model = { data: getMockModel(match.modelId) };
      const requests = getMockRequests({ id: match.requestId });
      request = { data: requests[0] || null };
      if (request.data) {
        professional = { data: getMockProfessional(request.data.professionalId) };
      }
    }

    // Notify professional
    if (professional?.data) {
      await createNotification({
        userId: professional.data.userId,
        userType: 'professional',
        type: 'match_accepted',
        title: '✅ Model Accepted!',
        message: `${model.data?.firstName || 'Model'} has accepted your booking request. Proceed to payment.`,
        data: {
          matchId: match.id,
          bookingId: booking?.id,
          modelName: model.data ? `${model.data.firstName} ${model.data.lastName}` : 'Model',
        },
      });
    }

    // Notify admin
    await createNotification({
      userId: 'admin',
      userType: 'admin',
      type: 'match_accepted',
      title: 'Match Accepted - Payment Pending',
      message: `Match accepted: ${model.data?.firstName || 'Model'} + ${professional?.data?.firstName || 'Professional'}. Booking created.`,
      data: {
        matchId: match.id,
        bookingId: booking?.id,
      },
    });
  } catch (error) {
    console.error('Error sending acceptance notifications:', error);
  }
}

/**
 * Send decline notifications
 */
async function sendDeclineNotifications(match, reason) {
  try {
    let request, professional;
    
    if (!shouldUseMockData() && client && client.models && 
        client.models.ModelRequest && client.models.Professional &&
        typeof client.models.ModelRequest.get === 'function' &&
        typeof client.models.Professional.get === 'function') {
      try {
        [request, professional] = await Promise.all([
          client.models.ModelRequest.get({ id: match.requestId }),
          client.models.ModelRequest.get({ id: match.requestId }).then(r => 
            r.data ? client.models.Professional.get({ id: r.data.professionalId }) : null
          ),
        ]);
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data
    if (!request || shouldUseMockData()) {
      const requests = getMockRequests({ id: match.requestId });
      request = { data: requests[0] || null };
      if (request.data) {
        professional = { data: getMockProfessional(request.data.professionalId) };
      }
    }

    // Notify professional (optional - may not want to notify on every decline)
    // Uncomment if needed:
    // if (professional?.data) {
    //   await createNotification({...});
    // }

    // Notify admin
    await createNotification({
      userId: 'admin',
      userType: 'admin',
      type: 'match_declined',
      title: 'Match Declined',
      message: `Model declined match for ${request.data?.serviceType || 'service'}.${reason ? ` Reason: ${reason}` : ''}`,
      data: {
        matchId: match.id,
        requestId: match.requestId,
        reason,
      },
    });
  } catch (error) {
    console.error('Error sending decline notifications:', error);
  }
}

/**
 * Send expiration notifications
 */
async function sendExpirationNotifications(match) {
  try {
    // Notify admin
    await createNotification({
      userId: 'admin',
      userType: 'admin',
      type: 'match_expired',
      title: '⏰ Match Expired',
      message: `Match expired (no response from model). Consider waitlist or re-matching.`,
      data: {
        matchId: match.id,
        requestId: match.requestId,
      },
    });
  } catch (error) {
    console.error('Error sending expiration notifications:', error);
  }
}

// ============ UTILITIES ============

/**
 * Update match status
 */
export async function updateMatchStatus(matchId, status, updates = {}) {
  try {
    const updateData = {
      id: matchId,
      status,
      ...updates,
    };

    if (status === 'sent' && !updates.sentAt) {
      updateData.sentAt = new Date();
    }

    if ((status === 'accepted' || status === 'declined') && !updates.respondedAt) {
      updateData.respondedAt = new Date();
    }

    let match;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Match.update(updateData);
        match = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!match || shouldUseMockData()) {
      match = updateMockMatch(matchId, updateData);
    }
    
    return match;
  } catch (error) {
    console.error('Error updating match status:', error);
    throw error;
  }
}

/**
 * Get match statistics
 */
export async function getMatchStatistics(requestId = null) {
  try {
    const matches = requestId 
      ? await getMatchesForRequest(requestId)
      : await getAllMatches();

    const stats = {
      total: matches.length,
      sent: matches.filter(m => normalizeMatchStatus(m.status) === MatchStatus.SENT).length,
      accepted: matches.filter(m => m.status === MatchStatus.ACCEPTED).length,
      declined: matches.filter(m => m.status === MatchStatus.DECLINED).length,
      expired: matches.filter(m => m.status === MatchStatus.EXPIRED).length,
      waitlist: matches.filter(m => m.status === 'waitlist').length,
    };

    stats.acceptanceRate = stats.sent > 0 
      ? (stats.accepted / stats.sent * 100).toFixed(1) 
      : 0;

    return stats;
  } catch (error) {
    console.error('Error getting match statistics:', error);
    return null;
  }
}

