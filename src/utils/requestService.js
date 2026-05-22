import { generateClient } from 'aws-amplify/data';
import { extractZipFromLocation } from '../matching/matchingEngine';
import {
  getMockRequests,
  getMockProfessionalByUserId,
  getMockProfessional,
  createMockRequest,
  updateMockRequest,
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

/** Strip fields / values the live API may reject on ModelRequest.create */
function sanitizeModelRequestCreatePayload(payload) {
  const out = { ...payload };
  const nullableEnums = [
    'desiredHairLength',
    'desiredHairTexture',
    'desiredHairCondition',
  ];
  nullableEnums.forEach((key) => {
    if (out[key] === null || out[key] === undefined || out[key] === '') {
      delete out[key];
    }
  });
  if (out.desiredHairColor === null || out.desiredHairColor === '') {
    delete out.desiredHairColor;
  }
  if (out.priority === null || out.priority === undefined) {
    out.priority = 'normal';
  }
  if (out.status === null || out.status === undefined) {
    out.status = 'matching';
  }
  return out;
}

const mapToBackendStatus = (status) => {
  if (!status) return status;
  if (status === 'booked') return 'approved';
  if (status === 'cancelled') return 'expired';
  return status;
};

const mapFromBackendStatus = (status) => {
  if (!status) return status;
  if (status === 'approved') return 'booked';
  if (status === 'expired') return 'cancelled';
  return status;
};

const normalizeRequest = (request) => {
  if (!request) return request;
  return {
    ...request,
    status: mapFromBackendStatus(request.status),
  };
};

export async function getRequestsForProfessional(userId, filters = {}) {
  try {
    let requests = [];
    let professional = null;

    if (!userId) return [];

    if (!shouldUseMockData() && client?.models?.Professional && client?.models?.ModelRequest &&
        typeof client.models.Professional.list === 'function' && typeof client.models.ModelRequest.list === 'function') {
      try {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: userId } },
          limit: 1,
        });
        professional = professionals?.[0] || null;

        if (professional) {
          const queryOptions = {
            filter: { professionalId: { eq: professional.id } },
            limit: 1000,
          };
          if (filters.status) {
            queryOptions.filter = {
              ...queryOptions.filter,
              status: { eq: mapToBackendStatus(filters.status) },
            };
          }

          const { data: requestData } = await client.models.ModelRequest.list(queryOptions);
          requests = (requestData || []).map(normalizeRequest);
        }
      } catch (dbError) {
        console.error('[requestService] Database error getRequestsForProfessional:', dbError);
      }
    }

    if (requests.length === 0 || shouldUseMockData()) {
      try {
        if (userId) {
          professional = getMockProfessionalByUserId(userId);
        }
        if (!professional) {
          professional = getMockProfessional('mock-pro-1') || { id: 'mock-pro-1' };
        }

        requests = getMockRequests({ professionalId: professional.id });
        if (requests.length === 0) {
          requests = getMockRequests();
        }
      } catch (mockError) {
        console.error('Error loading mock requests:', mockError);
        requests = [];
      }
    }

    return requests;
  } catch (error) {
    console.error('Error getting professional requests:', error);
    return [];
  }
}

export async function getRequestById(requestId) {
  try {
    if (!requestId) return null;

    if (!shouldUseMockData() && client?.models?.ModelRequest && typeof client.models.ModelRequest.get === 'function') {
      try {
        const { data: request } = await client.models.ModelRequest.get({ id: requestId });
        if (request) return normalizeRequest(request);
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
      }
    }

    const requests = getMockRequests({ id: requestId });
    return requests[0] || null;
  } catch (error) {
    console.error('Error getting request by id:', error);
    return null;
  }
}

export async function updateRequestStatus(requestId, status, updates = {}) {
  try {
    if (!requestId) throw new Error('Missing requestId');

    const mappedStatus = mapToBackendStatus(status);
    const updateData = {
      id: requestId,
      status: mappedStatus,
      ...updates,
    };

    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data: request } = await client.models.ModelRequest.update(updateData);
        if (request) return normalizeRequest(request);
      } catch (dbError) {
        console.error('Database error, falling back to mock data:', dbError);
      }
    }

    return updateMockRequest(requestId, { status, ...updates });
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
}

export async function createRequest(requestData) {
  try {
    const locationStr = requestData.location || '';
    const locationZip = requestData.locationZip ?? extractZipFromLocation(locationStr);
    const payload = {
      ...requestData,
      locationZip: locationZip || undefined,
      status: mapToBackendStatus(requestData.status),
    };

    if (!shouldUseMockData() && client?.models?.ModelRequest && typeof client.models.ModelRequest.create === 'function') {
      try {
        const safePayload = sanitizeModelRequestCreatePayload(payload);
        const { data: request, errors } = await client.models.ModelRequest.create(safePayload);
        if (errors?.length) throw new Error(errors[0]?.message || 'ModelRequest.create failed');
        if (request) return normalizeRequest(request);
      } catch (dbError) {
        console.error('[requestService] Database createRequest failed, saving locally:', dbError);
        const mock = createMockRequest({
          ...requestData,
          status: requestData.status,
          _savedLocally: true,
          _dbError: dbError?.message || String(dbError),
        });
        mock._usedLocalFallback = true;
        return mock;
      }
    }

    return createMockRequest({
      ...requestData,
      status: requestData.status,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
}
