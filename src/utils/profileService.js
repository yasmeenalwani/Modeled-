import { generateClient } from 'aws-amplify/data';
import {
  getMockProfessionalByUserId,
  getMockProfessional,
  getMockModel,
  shouldUseMockData,
} from './mockDataService';

let client = null;
try {
  const useMock = shouldUseMockData();
  if (!useMock) {
    try {
      client = generateClient();
    } catch (error) {
      console.warn('Failed to generate Amplify client, will use mock data only:', error);
      client = null;
    }
  } else {
    client = null;
  }
} catch (error) {
  console.warn('Error checking mock data mode, defaulting to mock data:', error);
  client = null;
}

const mapProfessionalToProfile = (professional) => {
  if (!professional) return null;
  return {
    id: professional.id,
    userId: professional.userId,
    email: professional.email,
    firstName: professional.firstName,
    lastName: professional.lastName,
    phone: professional.phone,
    salonName: professional.salonName,
    salonAddress: professional.salonAddress,
    salonLat: professional.salonLat,
    salonLng: professional.salonLng,
    locationZip: professional.locationZip,
    instagramHandle: professional.instagramHandle,
    specialties: professional.specialties,
    experienceLevel: professional.experienceLevel,
    portfolioUrls: professional.portfolioUrls,
    status: professional.status,
    stripeCustomerId: professional.stripeCustomerId,
    defaultPaymentMethodId: professional.defaultPaymentMethodId,
    cardOnFileStatus: professional.cardOnFileStatus || 'none',
    cardOnFileFlaggedAt: professional.cardOnFileFlaggedAt,
  };
};

const buildProfessionalPayload = (formData) => {
  const allowedExperience = new Set(['student', 'apprentice', 'junior', 'senior']);
  const payload = {
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    salonName: formData.salonName,
    salonAddress: formData.salonAddress,
    salonLat: formData.salonLat ?? undefined,
    salonLng: formData.salonLng ?? undefined,
    locationZip: formData.locationZip ?? undefined,
    instagramHandle: formData.instagramHandle,
    specialties: Array.isArray(formData.hairSpecialties) ? formData.hairSpecialties : undefined,
    experienceLevel: allowedExperience.has(formData.tier) ? formData.tier : undefined,
    portfolioUrls: Array.isArray(formData.portfolioItems)
      ? formData.portfolioItems.map((item) => item?.url).filter(Boolean)
      : undefined,
    status: formData.status || 'active',
  };

  return payload;
};

/**
 * Fetch a model (ModelProfile) by AppSync id (for booking enrichment, etc.)
 */
export async function getModelById(modelId) {
  try {
    if (!modelId) return null;

    if (!shouldUseMockData() && client?.models?.ModelProfile && typeof client.models.ModelProfile.get === 'function') {
      try {
        const { data: model } = await client.models.ModelProfile.get({ id: modelId });
        return model || null;
      } catch (dbError) {
        console.error('[profileService] Database error fetching model by id:', dbError);
      }
    }

    return getMockModel(modelId);
  } catch (error) {
    console.error('Error loading model by id:', error);
    return null;
  }
}

/**
 * Fetch a professional by AppSync id (for booking enrichment, etc.)
 */
export async function getProfessionalById(professionalId) {
  try {
    if (!professionalId) return null;

    if (!shouldUseMockData() && client?.models?.Professional && typeof client.models.Professional.get === 'function') {
      try {
        const { data: professional } = await client.models.Professional.get({ id: professionalId });
        return professional ? mapProfessionalToProfile(professional) : null;
      } catch (dbError) {
        console.error('[profileService] Database error fetching professional by id:', dbError);
      }
    }

    return mapProfessionalToProfile(getMockProfessional(professionalId));
  } catch (error) {
    console.error('Error loading professional by id:', error);
    return null;
  }
}

export async function getProfessionalProfile(userId) {
  try {
    if (!userId) return null;

    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: userId } },
          limit: 1,
        });
        if (professionals && professionals.length > 0) {
          return mapProfessionalToProfile(professionals[0]);
        }
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
      }
    }

    const mockProfessional = getMockProfessionalByUserId(userId) || getMockProfessional('mock-pro-1');
    return mapProfessionalToProfile(mockProfessional);
  } catch (error) {
    console.error('Error loading professional profile:', error);
    return null;
  }
}

export async function saveProfessionalProfile(userId, formData) {
  try {
    if (!userId) throw new Error('Missing userId for professional profile save');

    const payload = buildProfessionalPayload(formData);
    const createPayload = {
      userId,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      salonName: payload.salonName,
      salonAddress: payload.salonAddress,
      salonLat: payload.salonLat,
      salonLng: payload.salonLng,
      locationZip: payload.locationZip,
      instagramHandle: payload.instagramHandle,
      specialties: payload.specialties,
      experienceLevel: payload.experienceLevel,
      portfolioUrls: payload.portfolioUrls,
      status: payload.status,
    };

    if (!shouldUseMockData() && client?.models?.Professional && typeof client.models.Professional.list === 'function') {
      try {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: userId } },
          limit: 1,
        });
        const existing = professionals?.[0];

        if (existing) {
          const { data: updated } = await client.models.Professional.update({
            id: existing.id,
            ...payload,
          });
          return mapProfessionalToProfile(updated);
        }

        if (!createPayload.email || !createPayload.firstName || !createPayload.lastName || !createPayload.phone) {
          throw new Error('Missing required fields to create professional profile');
        }

        const { data: created } = await client.models.Professional.create(createPayload);
        return mapProfessionalToProfile(created);
      } catch (dbError) {
        console.error('[profileService] Database error saveProfessionalProfile:', dbError);
        throw dbError;
      }
    }

    return mapProfessionalToProfile({
      id: formData.id || 'mock-pro-1',
      userId,
      ...payload,
    });
  } catch (error) {
    console.error('Error saving professional profile:', error);
    throw error;
  }
}
