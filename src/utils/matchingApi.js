import { generateClient } from 'aws-amplify/data';
import { findMatches } from '../matching/matchingEngine';
import { createNotification } from './createNotification';

const client = generateClient();

function safeParseJson(value, fallback) {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mapAvailabilityByDayToSlots(availabilityByDay) {
  const dayMap = {
    Mon: 'monday',
    Tue: 'tuesday',
    Wed: 'wednesday',
    Thu: 'thursday',
    Fri: 'friday',
    Sat: 'saturday',
    Sun: 'sunday',
  };
  const slotMap = {
    morning: '9:00 AM',
    afternoon: '1:00 PM',
    evening: '6:00 PM',
  };

  return Object.entries(dayMap).reduce((acc, [shortDay, fullDay]) => {
    const times = availabilityByDay?.[shortDay] || [];
    acc[fullDay] = times.map((t) => slotMap[t]).filter(Boolean);
    return acc;
  }, {});
}

/**
 * Convert ModelProfile from DynamoDB to format expected by matching engine
 */
export function convertModelForMatching(modelProfile) {
  const favoriteService = safeParseJson(modelProfile.favoriteService, {});
  const servicePreferences = favoriteService?.preferences || [];
  const availabilityData = safeParseJson(modelProfile.communityInterestsOther, {});
  const availabilityByDay = availabilityData?.availabilityByDay || {};
  const normalizedAvailability = Object.keys(availabilityByDay).length > 0
    ? mapAvailabilityByDayToSlots(availabilityByDay)
    : (modelProfile.availability || {});

  const hasHairPref = servicePreferences.some((s) => s.startsWith('hair_'));
  const hasColorPref = servicePreferences.includes('hair_color');
  const hasStylingPref = servicePreferences.some((s) =>
    ['hair_style', 'hair_extensions', 'hair_braids', 'hair_treatment', 'hair_transformation'].includes(s)
  );
  const hasBeautyPref = servicePreferences.some((s) => s.startsWith('beauty_'));

  return {
    id: modelProfile.id,
    userId: modelProfile.userId,
    firstName: modelProfile.firstName,
    lastName: modelProfile.lastName,
    email: modelProfile.email,
    phone: modelProfile.phone,
    
    // Physical attributes (use auto-tagged if available, fallback to manual)
    hairColor: modelProfile.autoTaggedAttributes?.hairColor || modelProfile.hairColor,
    hairLength: modelProfile.autoTaggedAttributes?.hairLength || modelProfile.hairLength,
    hairTexture: modelProfile.autoTaggedAttributes?.hairTexture || modelProfile.hairTexture,
    hairCondition: modelProfile.autoTaggedAttributes?.hairCondition || modelProfile.hairCondition,
    skinTone: modelProfile.autoTaggedAttributes?.skinTone || modelProfile.skinTone,
    
    // Location & availability
    locationZip: modelProfile.locationZip,
    availability: normalizedAvailability,
    willingToTravel: modelProfile.willingToTravel,
    travelRadius: modelProfile.travelRadius,
    
    // Services
    openToHaircut: modelProfile.openToHaircut ?? hasHairPref,
    openToColor: modelProfile.openToColor ?? hasColorPref,
    openToStyling: modelProfile.openToStyling ?? hasStylingPref,
    openToMakeup: modelProfile.openToMakeup ?? hasBeautyPref,
    services: servicePreferences,
    
    // Agentic scores (from profile or defaults)
    agenticScores: modelProfile.agenticScores && typeof modelProfile.agenticScores === 'object'
      ? { ...modelProfile.agenticScores }
      : {
          reliability: modelProfile.reliabilityScore ?? 85,
          feedback: modelProfile.feedbackScore ?? 90,
          experience: modelProfile.experienceScore ?? 75,
          engagement: modelProfile.engagementScore ?? 80,
          compatibility: modelProfile.compatibilityScore ?? 70,
        },
    
    // Stats
    totalBookings: (modelProfile.servicesCompleted || []).length,
    repeatBookings: modelProfile.repeatBookings ?? 0,
  };
}

/**
 * Convert ModelRequest to format expected by matching engine
 */
export function convertRequestForMatching(request, professional) {
  const salonCoords =
    professional?.salonLat != null && professional?.salonLng != null
      ? { lat: professional.salonLat, lng: professional.salonLng }
      : null;
  const salonZip =
    professional?.locationZip ||
    request.locationZip ||
    (request.location && request.location.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1]);

  return {
    id: request.id,
    professionalId: request.professionalId,
    professional: professional ? `${professional.firstName} ${professional.lastName}` : 'Unknown',
    salon: professional?.salonName || 'Unknown Salon',
    serviceId: request.serviceType,
    service: request.serviceType,
    requestedDate: request.requestedDate,
    requestedTime: request.requestedTime,
    location: request.locationZip || request.location,
    salonCoords,
    salonZip,
    duration: request.duration,
    criteria: {
      hairColor: request.desiredHairColor,
      hairLength: request.desiredHairLength,
      hairTexture: request.desiredHairTexture,
      hairCondition: request.desiredHairCondition,
      virginHair: request.desiredHairCondition === 'virgin',
      openToChange: request.criteria?.openToChange ?? request.openToChange ?? true,
      desiredCutStyle: request.desiredCutStyle ?? request.criteria?.desiredCutStyle ?? null,
    },
  };
}

/**
 * Run matching engine for a specific request
 */
export async function runMatchingEngine(requestId) {
  try {
    // Load request
    const { data: request } = await client.models.ModelRequest.get({ id: requestId });
    if (!request) {
      throw new Error('Request not found');
    }

    // Load professional
    const { data: professional } = await client.models.Professional.get({ 
      id: request.professionalId 
    });

    // Load all active models
    const { data: models } = await client.models.ModelProfile.list({
      filter: { status: { eq: 'active' } },
      limit: 500,
    });

    // Convert to matching format
    const requestForMatching = convertRequestForMatching(request, professional);
    const modelsForMatching = models.map(convertModelForMatching);

    // Run matching algorithm
    const matchResult = findMatches(modelsForMatching, requestForMatching, { 
      minScore: 30, 
      limit: 20 
    });

    return {
      success: true,
      matchResult,
      request,
      professional,
    };
  } catch (error) {
    console.error('Error running matching engine:', error);
    throw error;
  }
}

/**
 * Approve matches and send notifications to models
 */
export async function approveMatches(requestId, modelIds, matchResults) {
  try {
    const { data: request } = await client.models.ModelRequest.get({ id: requestId });
    if (!request) {
      throw new Error('Request not found');
    }

    const { data: professional } = await client.models.Professional.get({ 
      id: request.professionalId 
    });

    // Create Match records and send notifications
    const matchPromises = modelIds.map(async (modelId) => {
      const match = matchResults.find(m => m.model.id === modelId);
      if (!match) return;

      // Create Match record
      await client.models.Match.create({
        requestId: request.id,
        modelId: modelId,
        matchScore: match.finalScore,
        scoreBreakdown: match.breakdown,
        status: 'approved',
      });

      // Get model profile for notification
      const { data: modelProfile } = await client.models.ModelProfile.get({ id: modelId });
      if (!modelProfile) return;

      // Create notification for model
      await createNotification({
        userId: modelProfile.userId,
        userType: 'model',
        type: 'match',
        title: 'New Opportunity!',
        message: `${professional?.firstName || 'A professional'} is looking for a model for ${request.serviceType} on ${new Date(request.requestedDate).toLocaleDateString()} at ${request.requestedTime}. You'd earn $${request.modelPayment || 0}.`,
        link: `/model-portal/opportunities/${request.id}`,
        actionText: 'View Details',
        relatedEntityId: request.id,
      });
    });

    await Promise.all(matchPromises);

    // Update request status
    await client.models.ModelRequest.update({
      id: requestId,
      status: 'matching',
    });

    return { success: true, count: modelIds.length };
  } catch (error) {
    console.error('Error approving matches:', error);
    throw error;
  }
}

/**
 * Get pending requests count
 */
export async function getPendingRequestsCount() {
  try {
    const { data: requests } = await client.models.ModelRequest.list({
      filter: { status: { eq: 'pending' } },
    });
    return requests?.length || 0;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    return 0;
  }
}

/**
 * Get requests that need matching
 */
export async function getRequestsForMatching() {
  try {
    const { data: requests } = await client.models.ModelRequest.list({
      filter: { 
        or: [
          { status: { eq: 'pending' } },
          { status: { eq: 'matching' } },
        ]
      },
      limit: 100,
    });
    return requests || [];
  } catch (error) {
    console.error('Error getting requests:', error);
    return [];
  }
}

/**
 * Update request status
 */
export async function updateRequestStatus(requestId, status) {
  try {
    await client.models.ModelRequest.update({
      id: requestId,
      status,
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
}

