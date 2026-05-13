import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { findMatches, calculateMatchScore } from '../../matching/matchingEngine';
import { getServiceById, formatPrice, formatDuration } from '../data/services';
import { createNotification } from '../../utils/createNotification';
import { mockModels } from '../../matching/mockModels';
import { getProfessionalById } from '../../utils/profileService';
import { getMockRequests, getMockProfessional, getMockModel, getMockModels, updateMockRequest, createMockMatch, shouldUseMockData } from '../../utils/mockDataService';
import { getAllMatches, getMatchesByStatus, updateMatchStatus, approveMatch, sendMatchToModel, approveMatches, sendMatchesToModels, createMatchesForRequest } from '../../utils/matchService';
import WaitlistPanel from '../components/WaitlistPanel';

let client;
try {
  client = generateClient();
} catch (error) {
  console.warn('Failed to generate Amplify client, will use mock data only:', error);
  client = null;
}

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  
  // Request selector
  requestSelector: {
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  selectorLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.75rem',
  },
  selectorSelect: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
  
  // Match Layout
  matchLayout: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '1.5rem',
    minHeight: 'calc(100vh - 200px)',
  },
  
  // Request panel (left)
  requestPanel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    height: 'fit-content',
    position: 'sticky',
    top: '100px',
  },
  panelTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  requestInfo: {
    marginBottom: '1.5rem',
  },
  requestLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
  },
  requestValue: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  
  // Criteria tags
  criteriaGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  criteriaItem: {
    background: 'rgba(233,69,96,0.1)',
    border: '1px solid rgba(233,69,96,0.2)',
    borderRadius: '8px',
    padding: '0.75rem',
  },
  criteriaLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    marginBottom: '0.25rem',
  },
  criteriaValue: {
    fontSize: '0.85rem',
    color: '#e94560',
    fontWeight: '500',
  },
  
  // Run engine button
  runEngineBtn: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  
  // Matches panel (right)
  matchesPanel: {},
  matchesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  matchCount: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
  },
  sortSelect: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  
  // Approve all banner
  approveAllBanner: {
    background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.1))',
    border: '1px solid rgba(76,175,80,0.3)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  approveAllText: {
    fontSize: '0.9rem',
  },
  approveAllBtn: {
    padding: '0.6rem 1.5rem',
    background: '#4caf50',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  // Match card
  matchCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1rem',
    display: 'grid',
    gridTemplateColumns: '60px 1fr auto auto',
    gap: '1.25rem',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  
  // Score circle
  scoreCircle: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
  },
  scoreValue: {
    fontSize: '1.25rem',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.6rem',
    opacity: 0.7,
  },
  
  // Model info
  modelInfo: {},
  modelName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  modelDetails: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.5rem',
  },
  matchTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  matchTag: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500',
  },
  matchTagGood: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  matchTagPartial: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  matchTagMiss: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Availability
  availability: {
    textAlign: 'center',
  },
  availLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
  },
  availValue: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  availStatus: {
    fontSize: '0.7rem',
    marginTop: '0.25rem',
  },
  
  // Actions
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  approveBtn: {
    padding: '0.6rem 1.5rem',
    background: 'linear-gradient(135deg, #4caf50, #66bb6a)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  rejectBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  
  // Loading
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Error
  error: {
    padding: '1.5rem',
    background: 'rgba(233,69,96,0.1)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '12px',
    color: '#e94560',
    marginBottom: '1rem',
  },
};

function getScoreColor(score) {
  if (score >= 90) return 'linear-gradient(135deg, #4caf50, #66bb6a)';
  if (score >= 75) return 'linear-gradient(135deg, #8bc34a, #aed581)';
  if (score >= 60) return 'linear-gradient(135deg, #ffc107, #ffca28)';
  return 'linear-gradient(135deg, #ff9800, #ffb74d)';
}

/**
 * Convert ModelProfile from DynamoDB to format expected by matching engine
 */
function convertModelForMatching(modelProfile) {
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
    availability: modelProfile.availability || {},
    willingToTravel: modelProfile.willingToTravel,
    travelRadius: modelProfile.travelRadius,
    
    // Services
    openToHaircut: modelProfile.openToHaircut,
    openToColor: modelProfile.openToColor,
    openToStyling: modelProfile.openToStyling,
    
    // Agentic scores (from Booking history - TODO: calculate from real data)
    agenticScores: {
      reliability: 85, // TODO: Calculate from bookings
      feedback: 90,    // TODO: Calculate from feedback
      experience: 75,  // TODO: Calculate from total bookings
      engagement: 80,  // TODO: Calculate from profile completeness
      compatibility: 70, // TODO: Calculate from service history
    },
    
    // Stats
    totalBookings: 0, // TODO: Count from Booking records
    repeatBookings: 0, // TODO: Count from Booking records
  };
}

/**
 * Convert ModelRequest to format expected by matching engine
 */
function convertRequestForMatching(request, professional) {
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

export default function MatchApprovalPage() {
  const { user } = useAuthenticator();
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [models, setModels] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvedModels, setApprovedModels] = useState([]);
  const [sortBy, setSortBy] = useState('score');
  const [processing, setProcessing] = useState(false);
  const [pendingMatches, setPendingMatches] = useState([]);

  // Load data
  useEffect(() => {
    loadData();
    loadPendingMatches();
  }, []);

  // Load sent matches
  const loadPendingMatches = async () => {
    try {
      const matches = await getMatchesByStatus('sent');
      setPendingMatches(matches);
    } catch (error) {
      console.error('Error loading pending matches:', error);
      setPendingMatches([]);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let requestsData = [];
      let modelsData = [];
      let professionalsData = [];

      // Try to load real data, fall back to mock if empty or error
      if (!shouldUseMockData() && client && client.models) {
        try {
          const { data: realRequests } = await client.models.ModelRequest.list({
            filter: { status: { eq: 'matching' } },
            limit: 100,
          });
          requestsData = realRequests || [];

          const { data: realModels } = await client.models.ModelProfile.list({
            filter: { or: [{ status: { eq: 'active' } }, { status: { eq: 'approved' } }] },
            limit: 500,
          });
          modelsData = realModels || [];

          const { data: realProfessionals } = await client.models.Professional.list({
            limit: 100,
          });
          professionalsData = realProfessionals || [];
        } catch (dbError) {
          console.log('Database query failed, using mock data:', dbError);
        }
      }

      // Use mock data if no real data available or mock mode enabled
      if (requestsData.length === 0 || shouldUseMockData()) {
        console.log('Using mock requests for testing');
        requestsData = getMockRequests({ status: 'matching' });
        if (requestsData.length === 0) {
          requestsData = getMockRequests();
        }
      }
      if (modelsData.length === 0) {
        console.log('Using mock models for testing');
        // Convert mock models to ModelProfile format
        modelsData = mockModels.map(model => ({
          id: `mock-${model.id}`,
          userId: `user-${model.id}`,
          firstName: model.firstName,
          lastName: model.lastName,
          email: model.email,
          phone: model.phone,
          hairColor: model.hairColor,
          hairLength: model.hairLength,
          hairTexture: model.hairTexture,
          hairCondition: model.hairCondition,
          locationZip: model.locationZip,
          availability: model.availability,
          openToHaircut: model.services?.includes('haircut'),
          openToColor: model.services?.includes('color'),
          openToStyling: model.services?.includes('blowdry'),
          status: 'active',
        }));
      }
      if (professionalsData.length === 0 || shouldUseMockData()) {
        const sourceRequests = requestsData.length > 0 ? requestsData : getMockRequests();
        const uniqueProIds = [...new Set(sourceRequests.map(r => r.professionalId).filter(Boolean))];
        professionalsData = await Promise.all(uniqueProIds.map(async (id) => {
          const pro = await getProfessionalById(id) || getMockProfessional(id);
          return pro || { id, firstName: 'Unknown', lastName: 'Professional' };
        }));
      }

      setRequests(requestsData);
      setModels(modelsData);
      setProfessionals(professionalsData);

      // Auto-select first request
      if (requestsData.length > 0 && !selectedRequestId) {
        setSelectedRequestId(requestsData[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      // Fall back to mock data on error
      const mockRequests = getMockRequests();
      setRequests(mockRequests);
      setModels(mockModels.map(model => ({
        id: `mock-${model.id}`,
        userId: `user-${model.id}`,
        firstName: model.firstName,
        lastName: model.lastName,
        email: model.email,
        phone: model.phone,
        hairColor: model.hairColor,
        hairLength: model.hairLength,
        hairTexture: model.hairTexture,
        hairCondition: model.hairCondition,
        locationZip: model.locationZip,
        availability: model.availability,
        openToHaircut: model.services?.includes('haircut'),
        openToColor: model.services?.includes('color'),
        openToStyling: model.services?.includes('blowdry'),
        status: 'active',
      })));
      const uniqueProIds = [...new Set(mockRequests.map(r => r.professionalId).filter(Boolean))];
      const mockProfs = await Promise.all(uniqueProIds.map(async (id) => {
        const pro = await getProfessionalById(id) || getMockProfessional(id);
        return pro || { id, firstName: 'Unknown', lastName: 'Professional' };
      }));
      setProfessionals(mockProfs);
      if (mockRequests.length > 0 && !selectedRequestId) {
        setSelectedRequestId(mockRequests[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get selected request
  const selectedRequest = requests.find(r => r.id === selectedRequestId);
  const selectedProfessional = selectedRequest
    ? professionals.find(p => p.id === selectedRequest.professionalId)
    : null;

  // Run matching engine
  const matchResult = useMemo(() => {
    if (!selectedRequest || models.length === 0) {
      return { matches: [], qualifiedMatches: 0, averageScore: 0 };
    }

    const requestForMatching = convertRequestForMatching(selectedRequest, selectedProfessional);
    
      // Use mock models directly if we're using mock data
      let modelsForMatching;
      if (selectedRequest.id?.startsWith('mock-')) {
        modelsForMatching = mockModels; // Use mock models directly
      } else {
        modelsForMatching = models.map(convertModelForMatching);
      }

    return findMatches(modelsForMatching, requestForMatching, { minScore: 30, limit: 20 });
  }, [selectedRequest, models, selectedProfessional]);

  // Sort matches
  const matchedModels = useMemo(() => {
    const sorted = [...matchResult.matches];
    if (sortBy === 'score') {
      sorted.sort((a, b) => b.finalScore - a.finalScore);
    } else if (sortBy === 'reliability') {
      sorted.sort((a, b) => (b.model.agenticScores?.reliability || 0) - (a.model.agenticScores?.reliability || 0));
    } else if (sortBy === 'experience') {
      sorted.sort((a, b) => (b.model.totalBookings || 0) - (a.model.totalBookings || 0));
    }
    return sorted;
  }, [matchResult.matches, sortBy]);

  const toggleApprove = (modelId) => {
    setApprovedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleApproveMatches = async () => {
    if (approvedModels.length === 0 || !selectedRequest) return;

    setProcessing(true);
    try {
      const requestId = selectedRequest.id || selectedRequest.requestId;
      const isMockData = requestId?.startsWith('mock-') || !requestId;
      
      // Prepare match data for each approved model
      const matchesToCreate = approvedModels.map(modelId => {
        const match = matchedModels.find(m => {
          const mId = m.model.id;
          return mId === modelId || mId === parseInt(modelId) || `mock-${mId}` === modelId;
        });
        
        // Map numeric model IDs to mock IDs (Emma: 1 -> 'mock-model-1')
        let mappedModelId = match?.model.id || modelId;
        if (typeof mappedModelId === 'number') {
          mappedModelId = `mock-model-${mappedModelId}`;
        }
        
        console.log('Creating match for model:', {
          originalModelId: modelId,
          matchModelId: match?.model.id,
          mappedModelId,
          match,
        });
        
        return {
          modelId: mappedModelId, // Use mapped ID
          finalScore: match?.finalScore || match?.matchScore || 0,
          breakdown: match?.breakdown || match?.scoreBreakdown || {},
          model: match?.model,
        };
      });

      console.log('Creating matches:', matchesToCreate);
      // Create matches (works with both mock and real data)
      const createdMatches = await createMatchesForRequest(requestId, matchesToCreate);
      console.log('Created matches:', createdMatches);

      // Approve all matches
      const matchIds = createdMatches.map(m => m.id);
      console.log('Approving matches:', matchIds);
      await approveMatches(matchIds, 'Approved from match approval page');
      console.log('Matches approved');

      // Send matches to models
      console.log('Sending matches to models:', matchIds);
      await sendMatchesToModels(matchIds);
      console.log('Matches sent to models');

      // Update request status to 'sent' — matches have been sent to models
      if (shouldUseMockData()) {
        updateMockRequest(requestId, { status: 'sent' });
      } else {
        if (client && client.models) {
          try {
            await client.models.ModelRequest.update({
              id: requestId,
              status: 'sent',
            });
          } catch (error) {
            console.error('Error updating request status:', error);
            updateMockRequest(requestId, { status: 'sent' });
          }
        } else {
          updateMockRequest(requestId, { status: 'sent' });
        }
      }

      loadPendingMatches();
      setApprovedModels([]);
      alert(`Booking links sent to ${approvedModels.length} model(s)! The pro will see their confirmed match once a model accepts and pays.`);
    } catch (err) {
      console.error('Error approving matches:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading requests and models...</div>;
  }

  if (error) {
    return <div style={styles.error}>Error: {error}</div>;
  }

  if (requests.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Match Approval</h1>
            <p style={styles.subtitle}>Approve matches and send opportunities to models</p>
          </div>
        </div>
        <div style={styles.loading}>
          <div>No matching requests found.</div>
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            Using sample data for testing...
          </div>
          <button
            onClick={loadData}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Load Sample Data
          </button>
        </div>
      </div>
    );
  }

  const serviceDetails = selectedRequest ? getServiceById(selectedRequest.serviceType) : null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Match Approval 🎯</h1>
          <p style={styles.subtitle}>Approve matches and send opportunities to models</p>
        </div>
      </div>

      {/* Pending Matches Banner */}
      {pendingMatches.length > 0 && (
        <div style={{
          padding: '1rem 1.5rem',
          background: 'rgba(33,150,243,0.1)',
          border: '1px solid rgba(33,150,243,0.3)',
          borderRadius: '12px',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#2196f3', marginBottom: '0.25rem' }}>
              📋 {pendingMatches.length} Match(es) Ready to Send
            </div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
              These matches are ready to be sent to models as booking opportunities
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            (Mock data - simulates created matches)
          </div>
        </div>
      )}

      {/* Request Selector */}
      <div style={styles.requestSelector}>
        <div style={styles.selectorLabel}>Select Request to Match:</div>
        <select
          style={styles.selectorSelect}
          value={selectedRequestId || ''}
          onChange={(e) => setSelectedRequestId(e.target.value)}
        >
          {requests.map(request => {
            const pro = professionals.find(p => p.id === request.professionalId);
            return (
              <option key={request.id} value={request.id}>
                {pro ? `${pro.firstName} ${pro.lastName}` : 'Unknown'} - {request.serviceType} - {new Date(request.requestedDate).toLocaleDateString()} {request.requestedTime}
              </option>
            );
          })}
        </select>
      </div>

      {selectedRequest && (
        <div style={styles.matchLayout}>
          {/* Left Panel - Request Details */}
          <div style={styles.requestPanel}>
            <div style={styles.panelTitle}>Request Details</div>
            
            <div style={styles.requestInfo}>
              <div style={styles.requestLabel}>Professional</div>
              <div style={styles.requestValue}>
                {selectedProfessional ? `${selectedProfessional.firstName} ${selectedProfessional.lastName}` : 'Unknown'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                {selectedProfessional?.salonName || 'Unknown Salon'}
              </div>
            </div>

            <div style={styles.requestInfo}>
              <div style={styles.requestLabel}>Service</div>
              <div style={styles.requestValue}>{selectedRequest.serviceType}</div>
            </div>

            <div style={styles.requestInfo}>
              <div style={styles.requestLabel}>Date & Time</div>
              <div style={styles.requestValue}>
                {new Date(selectedRequest.requestedDate).toLocaleDateString()}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                {selectedRequest.requestedTime} • {selectedRequest.duration ? `${selectedRequest.duration} min` : ''}
              </div>
            </div>

            {/* Pricing */}
            {selectedRequest.modelPayment && (
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '1rem',
                marginTop: '0.5rem',
              }}>
                <div style={styles.requestLabel}>Model Payment</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4caf50', marginTop: '0.5rem' }}>
                  ${selectedRequest.modelPayment}
                </div>
              </div>
            )}

            <div style={styles.panelTitle}>Match Criteria</div>
            <div style={styles.criteriaGrid}>
              {selectedRequest.desiredHairColor && (
                <div style={styles.criteriaItem}>
                  <div style={styles.criteriaLabel}>Hair Color</div>
                  <div style={styles.criteriaValue}>{selectedRequest.desiredHairColor}</div>
                </div>
              )}
              {selectedRequest.desiredHairLength && (
                <div style={styles.criteriaItem}>
                  <div style={styles.criteriaLabel}>Length</div>
                  <div style={styles.criteriaValue}>{selectedRequest.desiredHairLength}</div>
                </div>
              )}
              {selectedRequest.desiredHairTexture && (
                <div style={styles.criteriaItem}>
                  <div style={styles.criteriaLabel}>Texture</div>
                  <div style={styles.criteriaValue}>{selectedRequest.desiredHairTexture}</div>
                </div>
              )}
              {selectedRequest.desiredHairCondition && (
                <div style={styles.criteriaItem}>
                  <div style={styles.criteriaLabel}>Condition</div>
                  <div style={styles.criteriaValue}>{selectedRequest.desiredHairCondition}</div>
                </div>
              )}
            </div>

            <button
              style={styles.runEngineBtn}
              onClick={loadData}
              disabled={processing}
            >
              Refresh Matches
            </button>

            {/* Waitlist Panel */}
            {selectedRequestId && (
              <WaitlistPanel 
                requestId={selectedRequestId} 
                onPromote={() => {
                  // Refresh matches after promotion
                  loadData();
                }}
              />
            )}
          </div>

          {/* Right Panel - Matches */}
          <div style={styles.matchesPanel}>
            <div style={styles.matchesHeader}>
              <div style={styles.matchCount}>
                Found <strong>{matchResult.qualifiedMatches}</strong> matches
                (avg score: {matchResult.averageScore})
              </div>
              <select
                style={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="score">Sort by: Match Score</option>
                <option value="reliability">Sort by: Reliability</option>
                <option value="experience">Sort by: Experience</option>
              </select>
            </div>

            {/* Approve All Banner */}
            {approvedModels.length > 0 && (
              <div style={styles.approveAllBanner}>
                <div style={styles.approveAllText}>
                  <strong>{approvedModels.length}</strong> model(s) selected for approval
                </div>
                <button
                  style={styles.approveAllBtn}
                  onClick={handleApproveMatches}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Send Opportunities'}
                </button>
              </div>
            )}

            {/* Match Cards */}
            {matchedModels.length === 0 ? (
              <div style={styles.loading}>No matches found. Try adjusting criteria or check model availability.</div>
            ) : (
              matchedModels.map((match) => {
                // For mock data, find model by matching ID pattern
                let modelProfile;
                if (selectedRequest.id?.startsWith('mock-')) {
                  // Mock mode - match by extracting ID from mock model
                  const mockModelId = typeof match.model.id === 'number' ? `mock-${match.model.id}` : match.model.id;
                  modelProfile = models.find(m => m.id === mockModelId || m.id === match.model.id);
                } else {
                  modelProfile = models.find(m => m.id === match.model.id);
                }
                return (
                  <div
                    key={match.model.id}
                    style={{
                      ...styles.matchCard,
                      borderColor: approvedModels.includes(match.model.id.toString())
                        ? 'rgba(76,175,80,0.5)'
                        : match.isPerfectMatch
                        ? 'rgba(255,215,0,0.5)'
                        : 'rgba(255,255,255,0.06)',
                      background: approvedModels.includes(match.model.id.toString())
                        ? 'rgba(76,175,80,0.05)'
                        : match.isPerfectMatch
                        ? 'rgba(255,215,0,0.05)'
                        : 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {/* Score */}
                    <div
                      style={{
                        ...styles.scoreCircle,
                        background: getScoreColor(match.finalScore),
                      }}
                    >
                      <div style={styles.scoreValue}>{match.finalScore}</div>
                      <div style={styles.scoreLabel}>
                        {match.isPerfectMatch ? '' : match.isStrongMatch ? '✓' : ''}
                      </div>
                    </div>

                    {/* Model Info */}
                    <div style={styles.modelInfo}>
                      <div style={styles.modelName}>
                        {match.model.firstName} {match.model.lastName}
                        {match.isPerfectMatch && (
                          <span style={{ marginLeft: '0.5rem', color: '#ffd700' }}>PERFECT</span>
                        )}
                      </div>
                      <div style={styles.modelDetails}>
                        {match.model.hairColor} • {match.model.hairLength} • {match.model.hairTexture} • {match.model.hairCondition}
                      </div>

                      {/* Score Breakdown */}
                      <div style={styles.matchTags}>
                        <span
                          style={{
                            ...styles.matchTag,
                            ...(match.breakdown.attribute.score >= 80
                              ? styles.matchTagGood
                              : match.breakdown.attribute.score >= 50
                              ? styles.matchTagPartial
                              : styles.matchTagMiss),
                          }}
                        >
                          Attr: {match.breakdown.attribute.score}
                        </span>
                        <span
                          style={{
                            ...styles.matchTag,
                            ...(match.breakdown.agentic.score >= 80
                              ? styles.matchTagGood
                              : match.breakdown.agentic.score >= 50
                              ? styles.matchTagPartial
                              : styles.matchTagMiss),
                          }}
                        >
                          Agentic: {match.breakdown.agentic.score}
                        </span>
                        <span
                          style={{
                            ...styles.matchTag,
                            ...((match.breakdown.reachability?.score ?? match.breakdown.location?.score ?? 0) >= 80
                              ? styles.matchTagGood
                              : (match.breakdown.reachability?.score ?? match.breakdown.location?.score ?? 0) >= 50
                              ? styles.matchTagPartial
                              : styles.matchTagMiss),
                          }}
                        >
                          Reach: {match.breakdown.reachability?.score ?? match.breakdown.location?.score ?? 0}
                          {(match.breakdown.reachability?.estimatedTravelMinutes ?? match.breakdown.location?.estimatedTravelMinutes) != null ? (
                            <span style={{ opacity: 0.85, fontSize: '0.85em' }}>
                              {' '}(~{match.breakdown.reachability?.estimatedTravelMinutes ?? match.breakdown.location?.estimatedTravelMinutes} min)
                            </span>
                          ) : (match.breakdown.reachability?.distanceMiles ?? match.breakdown.location?.distanceMiles) != null ? (
                            <span style={{ opacity: 0.85, fontSize: '0.85em' }}>
                              {' '}(~{Math.round(match.breakdown.reachability?.distanceMiles ?? match.breakdown.location?.distanceMiles)} mi)
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={styles.availability}>
                      <div style={styles.availLabel}>Bookings</div>
                      <div style={styles.availValue}>{match.model.totalBookings || 0}</div>
                      <div style={{ ...styles.availStatus, color: '#4caf50' }}>
                        {match.model.repeatBookings || 0} repeats
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={styles.cardActions}>
                      <button
                        style={{
                          ...styles.approveBtn,
                          background: approvedModels.includes(match.model.id)
                            ? 'transparent'
                            : 'linear-gradient(135deg, #4caf50, #66bb6a)',
                          border: approvedModels.includes(match.model.id)
                            ? '1px solid #4caf50'
                            : 'none',
                        }}
                        onClick={() => toggleApprove(match.model.id)}
                        disabled={processing}
                      >
                        {approvedModels.includes(match.model.id) ? '✓ Selected' : 'Approve'}
                      </button>
                      <button
                        style={styles.rejectBtn}
                        onClick={() => {
                          // TODO: Mark as rejected
                        }}
                        disabled={processing}
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

