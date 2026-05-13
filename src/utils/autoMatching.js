/**
 * Auto-Matching Utilities
 * 
 * Functions for automatic matching, approval, and sending matches to models
 */

import { generateClient } from 'aws-amplify/data';
import { findMatches, extractZipFromLocation } from '../matching/matchingEngine';

let client = null;

async function getClient() {
  if (client) return client;
  // Lambda: configure Amplify from env before using data client
  if (typeof process !== 'undefined' && process.env?.AWS_LAMBDA_FUNCTION_NAME) {
    try {
      const { Amplify } = await import('aws-amplify');
      const { getAmplifyDataClientConfig } = await import('@aws-amplify/backend/function/runtime');
      const { env } = await import('$amplify/env/auto-matching');
      const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
      Amplify.configure(resourceConfig, libraryOptions);
    } catch (e) {
      console.warn('Lambda Amplify config failed:', e?.message);
    }
  }
  client = generateClient();
  return client;
}

/** Map ModelRequest.serviceType to matching engine serviceId */
const SERVICE_TYPE_TO_ID = {
  haircut: 'haircut',
  cut: 'haircut',
  color: 'color',
  blowdry: 'blowdry',
  blowout: 'blowdry',
  styling: 'blowdry',
  gloss: 'gloss',
  highlights: 'highlights',
  keratin: 'keratin',
  makeup: 'haircut', // fallback
  nails: 'haircut',
  skincare: 'haircut',
};

function isIdentityReadyForMatching(model) {
  const status = String(model?.identityVerificationStatus || '').toLowerCase();
  if (model?.identityVerified === true) return true;
  return status === 'verified';
}

/**
 * Run matching for a specific request
 * @param {string} requestId - The ModelRequest ID
 * @returns {Promise<Array>} Array of matches with scores
 */
export async function runMatchingForRequest(requestId) {
  try {
    const c = await getClient();

    // Get the request
    const { data: request, errors: requestErrors } = await c.models.ModelRequest.get({
      id: requestId,
    });

    if (requestErrors || !request) {
      throw new Error(`Request ${requestId} not found`);
    }

    // Get professional for location fallback
    let professional = null;
    if (request.professionalId) {
      const { data: pro } = await c.models.Professional.get({ id: request.professionalId });
      professional = pro;
    }

    // Get all active models
    const { data: models, errors: modelsErrors } = await c.models.ModelProfile.list({
      filter: { status: { eq: 'active' } },
    });

    if (modelsErrors) {
      throw new Error('Failed to load models');
    }

    const identityEligibleModels = (models || []).filter(isIdentityReadyForMatching);

    // Convert models to matching engine format (use stored agentic scores when available)
    const formattedModels = identityEligibleModels.map(model => ({
      id: model.id,
      firstName: model.firstName,
      lastName: model.lastName,
      email: model.email,
      locationZip: model.locationZip,
      willingToTravel: model.willingToTravel,
      travelRadius: model.travelRadius,
      hairLength: model.hairLengthSimple || model.hairLength,
      hairColor: model.hairColorSimple || model.hairColor,
      hairTexture: model.hairTextureSimple || model.hairTexture,
      hairCondition: model.hairCondition,
      skinTone: model.skinToneSimple || model.skinTone,
      allergies: model.allergies ?? false,
      virginHair: model.virginHair ?? (model.hairCondition === 'virgin'),
      openToHaircut: model.openToHaircut,
      openToColor: model.openToColor,
      openToStyling: model.openToStyling,
      availability: model.availability || {},
      agenticScores: model.agenticScores || {
        // Use neutral defaults so new profiles are not artificially boosted or penalized.
        reliability: model.reliabilityScore ?? 50,
        feedback: model.feedbackScore ?? 50,
        experience: model.experienceScore ?? 50,
        engagement: model.engagementScore ?? 50,
        compatibility: model.compatibilityScore ?? 50,
      },
    }));

    if (formattedModels.length === 0) {
      console.warn(
        `No identity-ready active models for request ${requestId}. Active models: ${(models || []).length}`
      );
      return [];
    }

    // Build criteria from ModelRequest desired* fields for matching engine
    const criteria = {};
    if (request.desiredHairLength) criteria.hairLength = request.desiredHairLength;
    if (request.desiredHairColor) criteria.hairColor = request.desiredHairColor;
    if (request.desiredHairTexture) criteria.hairTexture = request.desiredHairTexture;
    if (request.desiredHairCondition) criteria.hairCondition = request.desiredHairCondition;
    if (request.desiredHairCondition === 'virgin') criteria.virginHair = true;

    const serviceId = SERVICE_TYPE_TO_ID[request.serviceType] || request.serviceType || 'haircut';

    // Convert request to matching engine format
    const requestLocationZip = request.locationZip || extractZipFromLocation(request.location);
    const fallbackZip = professional?.locationZip || extractZipFromLocation(professional?.salonAddress);
    const locationForMatching = requestLocationZip || fallbackZip || request.location;

    const salonCoords =
      professional?.salonLat != null && professional?.salonLng != null
        ? { lat: professional.salonLat, lng: professional.salonLng }
        : null;
    const salonZip =
      professional?.locationZip || requestLocationZip || extractZipFromLocation(request.location);

    const formattedRequest = {
      id: request.id,
      serviceType: request.serviceType,
      serviceId,
      requestedDate: request.requestedDate,
      requestedTime: request.requestedTime,
      location: locationForMatching,
      salonCoords,
      salonZip,
      criteria,
    };

    // Run matching engine (findMatches(models, request, options))
    const result = findMatches(formattedModels, formattedRequest, { minScore: 30, limit: 20 });

    // Save matches to database
    const savedMatches = await Promise.all(
      (result.matches || []).map(async (match) => {
        const modelId = match.model?.id ?? match.modelId;
        const finalScore = match.finalScore ?? match.matchScore ?? 0;
        const scoreBreakdown = match.breakdown ?? match.scoreBreakdown ?? {};

        const { data, errors } = await c.models.Match.create({
          requestId: request.id,
          modelId,
          matchScore: finalScore,
          status: 'pending',
          scoreBreakdown,
        });

        if (errors) {
          console.error(`Error saving match for model ${modelId}:`, errors);
          return null;
        }

        return {
          id: data.id,
          modelId,
          matchScore: finalScore,
          ...data,
        };
      })
    );

    return savedMatches.filter(m => m !== null);
  } catch (error) {
    console.error('Error running matching for request:', error);
    throw error;
  }
}

/**
 * Approve a match
 * @param {string} matchId - The Match ID
 */
export async function approveMatch(matchId) {
  try {
    const c = await getClient();
    const { data, errors } = await c.models.Match.update({
      id: matchId,
      status: 'approved',
    });

    if (errors) {
      throw new Error(`Failed to approve match: ${errors[0]?.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error approving match:', error);
    throw error;
  }
}

/**
 * Send match to model (change status to 'sent')
 * @param {string} matchId - The Match ID
 */
export async function sendMatchToModel(matchId) {
  try {
    const c = await getClient();
    const { data, errors } = await c.models.Match.update({
      id: matchId,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(`Failed to send match to model: ${errors[0]?.message}`);
    }

    // Create notification for model (handled by matchService or separate flow)
    return data;
  } catch (error) {
    console.error('Error sending match to model:', error);
    throw error;
  }
}

