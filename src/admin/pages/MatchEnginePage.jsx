import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { getServiceById, formatPrice, formatDuration } from '../data/services';
import { findMatches, mockModels, calculateMatchScore } from '../../matching';
import { convertModelForMatching } from '../../utils/matchingApi';
import { runMatchingEngine, convertRequestForMatching } from '../../utils/matchingApi';
import { getMockRequests, getMockProfessional, getMockModels, getMockModel, shouldUseMockData, updateMockRequest } from '../../utils/mockDataService';
import { createMatch, createMatchesForRequest, approveMatches, sendMatchesToModels, getMatchesForRequest } from '../../utils/matchService';
import { createNotification } from '../../utils/createNotification';

let client = null;
// In demo mode, never initialize client to prevent database access
if (!shouldUseMockData()) {
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

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1800px',
    margin: '0 auto',
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
  
  // Layout
  matchLayout: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '2rem',
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
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  requestValue: {
    fontSize: '1rem',
    fontWeight: '500',
    marginBottom: '0.25rem',
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
  
  // Matches panel (right)
  matchesPanel: {},
  matchesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
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
  
  // Match card
  matchCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    transition: 'all 0.2s ease',
  },
  matchCardExpanded: {
    borderColor: 'rgba(233,69,96,0.4)',
    background: 'rgba(233,69,96,0.05)',
  },
  
  // Score circle
  scoreCircle: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    marginRight: '1rem',
    flexShrink: 0,
  },
  scoreValue: {
    fontSize: '1.5rem',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.65rem',
    opacity: 0.8,
    marginTop: '0.25rem',
  },
  
  // Model info
  modelInfo: {
    flex: 1,
  },
  modelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
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
  
  // Score breakdown
  scoreBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.75rem',
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
  },
  breakdownItem: {
    textAlign: 'center',
  },
  breakdownLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
    textTransform: 'uppercase',
  },
  breakdownValue: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  breakdownBar: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    marginTop: '0.5rem',
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  
  // Match tags
  matchTags: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  matchTag: {
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  matchTagGood: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    border: '1px solid rgba(76,175,80,0.3)',
  },
  matchTagPartial: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
    border: '1px solid rgba(255,193,7,0.3)',
  },
  matchTagMiss: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Agentic breakdown
  agenticBreakdown: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    flexWrap: 'wrap',
  },
  agenticItem: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
  },
  
  // Expand button
  expandBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '6px',
    color: '#e94560',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginTop: '0.75rem',
  },
  
  // Detailed breakdown
  detailedBreakdown: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  breakdownSection: {
    marginBottom: '1rem',
  },
  breakdownSectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#e94560',
    marginBottom: '0.5rem',
  },
  attributeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '4px',
    marginBottom: '0.25rem',
    fontSize: '0.8rem',
  },
  
  // Actions
  cardActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: '120px',
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
};

// Helper to convert request to matching format (includes salonCoords for distance calculation)
function convertRequestToMatchingFormat(request, professional) {
  if (!request) return null;

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
    requestId: request.id, // Add requestId for compatibility
    professional: professional ? `${professional.firstName || ''} ${professional.lastName || ''}`.trim() : 'Unknown',
    salon: professional?.salonName || 'Unknown Salon',
    serviceId: request.serviceType || request.serviceId,
    service: request.serviceType || request.service,
    requestedDate: request.requestedDate,
    requestedTime: request.requestedTime,
    date: request.date || (request.requestedDate ? new Date(request.requestedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) : 'TBD'),
    time: request.time || request.requestedTime || 'TBD',
    location: request.location || 'TBD',
    duration: request.duration || 60,
    salonCoords,
    salonZip,
    criteria: {
      hairLength: request.desiredHairLength || request.criteria?.hairLength || 'Any',
      hairColor: request.desiredHairColor || request.criteria?.hairColor || 'Any',
      hairTexture: request.desiredHairTexture || request.criteria?.hairTexture || 'Any',
      hairCondition: request.desiredHairCondition || request.criteria?.hairCondition || 'Any',
      virginHair: (request.desiredHairCondition === 'virgin') || request.criteria?.virginHair || false,
      openToChange: request.criteria?.openToChange ?? true,
      desiredCutStyle: request.desiredCutStyle ?? request.criteria?.desiredCutStyle ?? null,
    },
  };
}

function getScoreColor(score) {
  if (score >= 90) return 'linear-gradient(135deg, #4caf50, #66bb6a)';
  if (score >= 75) return 'linear-gradient(135deg, #8bc34a, #aed581)';
  if (score >= 60) return 'linear-gradient(135deg, #ffc107, #ffca28)';
  return 'linear-gradient(135deg, #ff9800, #ffb74d)';
}

function getBreakdownColor(score) {
  if (score >= 80) return '#4caf50';
  if (score >= 50) return '#ffc107';
  return '#ff9800';
}

export default function MatchEnginePage() {
  const [searchParams] = useSearchParams();
  const requestIdFromUrl = searchParams.get('requestId');
  
  const [approvedModels, setApprovedModels] = useState([]);
  const [sortBy, setSortBy] = useState('score');
  const [expandedMatch, setExpandedMatch] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [existingMatches, setExistingMatches] = useState([]);
  const [modelsForMatching, setModelsForMatching] = useState(null); // Real ModelProfile list when !shouldUseMockData

  // Load request data when requestId changes
  useEffect(() => {
    const loadRequest = async () => {
      if (!requestIdFromUrl) {
        // Use default mock request if no ID provided
        const allRequests = getMockRequests();
        if (allRequests.length > 0) {
          const defaultRequest = allRequests[0];
          const defaultPro = getMockProfessional(defaultRequest.professionalId);
          const converted = convertRequestToMatchingFormat(defaultRequest, defaultPro);
          setSelectedRequest(converted);
        }
        return;
      }

      setLoading(true);
      try {
        // Try to load from database first
        let request = null;
        let professional = null;
        
        if (!shouldUseMockData() && client && client.models && 
            client.models.ModelRequest && client.models.Professional &&
            typeof client.models.ModelRequest.get === 'function' &&
            typeof client.models.Professional.get === 'function') {
          try {
            const { data, errors } = await client.models.ModelRequest.get({
              id: requestIdFromUrl,
            });
            if (!errors && data) {
              request = data;
              if (request.professionalId) {
                const { data: proData } = await client.models.Professional.get({
                  id: request.professionalId,
                });
                professional = proData;
              }
            }
          } catch (dbError) {
            console.error('Database error, falling back to mock data:', dbError);
          }
        }
        
        // Use mock data if database failed or mock mode enabled
        if (!request || shouldUseMockData()) {
          const allRequests = getMockRequests();
          request = allRequests.find(r => r.id === requestIdFromUrl || String(r.id) === requestIdFromUrl);
          if (request && request.professionalId) {
            professional = getMockProfessional(request.professionalId);
          }
        }
        
        if (request) {
          const converted = convertRequestToMatchingFormat(request, professional);
          setSelectedRequest(converted);
        } else {
          console.error('Request not found:', requestIdFromUrl);
        }
      } catch (error) {
        console.error('Error loading request:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRequest();
  }, [requestIdFromUrl]);

  // Load real models for matching when request is from DB (not mock)
  useEffect(() => {
    if (!selectedRequest || shouldUseMockData() || !client?.models?.ModelProfile) {
      setModelsForMatching(null);
      return;
    }
    const reqId = selectedRequest.requestId || selectedRequest.id;
    if (typeof reqId === 'string' && reqId.startsWith('mock-')) {
      setModelsForMatching(null);
      return;
    }
    let mounted = true;
    async function loadModels() {
      try {
        const { data, errors } = await client.models.ModelProfile.list({
          filter: { or: [{ status: { eq: 'active' } }, { status: { eq: 'approved' } }] },
          limit: 500,
        });
        if (errors?.length || !mounted) return;
        setModelsForMatching((data || []).map(convertModelForMatching));
      } catch (err) {
        console.error('Failed to load models for matching:', err);
        setModelsForMatching(null);
      }
    }
    loadModels();
    return () => { mounted = false; };
  }, [selectedRequest]);

  // Load existing matches for this request
  useEffect(() => {
    if (selectedRequest) {
      const requestId = selectedRequest.requestId || selectedRequest.id;
      const loadMatches = async () => {
        try {
          const matches = await getMatchesForRequest(requestId);
          setExistingMatches(matches || []);
        } catch (error) {
          console.error('Error loading existing matches:', error);
          setExistingMatches([]);
        }
      };
      loadMatches();
    }
  }, [selectedRequest]);

  // Get service details
  const serviceDetails = selectedRequest ? getServiceById(selectedRequest.serviceId) : null;

  // Run the real matching algorithm! Use real models when available.
  const effectiveModels = modelsForMatching && modelsForMatching.length > 0 ? modelsForMatching : mockModels;
  const currentMatchResult = useMemo(() => {
    if (!selectedRequest) return { matches: [], qualifiedMatches: 0, averageScore: 0 };
    if (matchResult) return matchResult;
    return findMatches(effectiveModels, selectedRequest, { minScore: 20, limit: 10 });
  }, [matchResult, selectedRequest, effectiveModels]);

  const matchedModels = useMemo(() => {
    const sorted = [...(currentMatchResult?.matches || [])];
    
    // Sort by score/reliability/experience (no special mock prioritization for real data)
    sorted.sort((a, b) => {
      if (sortBy === 'score') {
        return b.finalScore - a.finalScore;
      } else if (sortBy === 'reliability') {
        return (b.model.agenticScores?.reliability || 0) - (a.model.agenticScores?.reliability || 0);
      } else if (sortBy === 'experience') {
        return (b.model.totalBookings || 0) - (a.model.totalBookings || 0);
      }
      return 0;
    });
    
    return sorted;
  }, [currentMatchResult?.matches, sortBy]);

  const handleRunEngine = async () => {
    if (!selectedRequest) {
      alert('No request selected. Please select a request first.');
      return;
    }

    setProcessing(true);
    try {
      const result = findMatches(effectiveModels, selectedRequest, { minScore: 20, limit: 10 });
      setMatchResult(result);
      alert(`Match engine ran successfully! Found ${result.qualifiedMatches} qualified matches.`);
    } catch (error) {
      console.error('Error running match engine:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveAll = async () => {
    if (approvedModels.length === 0) {
      alert('Please select at least one model to approve.');
      return;
    }

    if (!selectedRequest) {
      alert('No request selected.');
      return;
    }

    // Capture count now — before any async ops clear state
    const selectedCount = approvedModels.length;
    setProcessing(true);

    try {
      const requestId = selectedRequest.requestId || selectedRequest.id;

      // Build match payloads — map numeric matching-engine IDs to mock-model-X format
      const matchesToCreate = approvedModels.map(modelId => {
        const matchData = matchedModels.find(m => m.model.id === modelId);
        let mappedModelId = modelId;
        if (typeof modelId === 'number' || String(modelId).match(/^\d+$/)) {
          mappedModelId = `mock-model-${modelId}`;
        }
        return {
          modelId: mappedModelId,
          finalScore: matchData?.finalScore || matchData?.matchScore || 0,
          breakdown: matchData?.breakdown || matchData?.scoreBreakdown || {},
          model: matchData?.model,
        };
      });

      // 1. Create match records in mock storage (modelId 'mock-model-1' = Seraphina; Model Matched page reads via getMatchesForSeraphina())
      const createdMatches = await createMatchesForRequest(requestId, matchesToCreate);

      // 2. Approve + send booking links to models
      const matchIds = createdMatches.map(m => m.id);
      await approveMatches(matchIds, 'Approved from match engine');
      await sendMatchesToModels(matchIds);

      // 3. Mark request as 'sent' (models now have active booking invitations)
      updateMockRequest(requestId, { status: 'sent' });

      const count = createdMatches.length > 0 ? createdMatches.length : selectedCount;
      alert(`Booking links sent to ${count} model(s)! The pro will see their confirmed match once a model accepts and pays.`);
      setApprovedModels([]);
      await loadExistingMatches();
    } catch (error) {
      console.error('Error sending booking links:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const loadExistingMatches = async () => {
    if (!selectedRequest) return;
    
    try {
      const requestId = selectedRequest.requestId || selectedRequest.id;
      const existingMatches = await getMatchesForRequest(requestId);
      // Update UI with existing matches if needed
    } catch (error) {
      console.error('Error loading existing matches:', error);
    }
  };

  const toggleApprove = (modelId) => {
    setApprovedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const toggleExpand = (modelId) => {
    setExpandedMatch(expandedMatch === modelId ? null : modelId);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          Loading request...
        </div>
      </div>
    );
  }

  if (!selectedRequest) {
    return (
      <div style={styles.container}>
        <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div>No request selected.</div>
          <div style={{ marginTop: '1rem' }}>
            <a href="/admin/requests" style={{ color: '#e94560', textDecoration: 'underline' }}>
              Go to Request Queue
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Match Engine</h1>
          <p style={styles.subtitle}>
            Real-time matching algorithm finds the best models for each request using multi-factor scoring
          </p>
        </div>
      </div>

      {/* Match Layout */}
      <div style={styles.matchLayout}>
        {/* Left Panel - Request Details */}
        <div style={styles.requestPanel}>
          <div style={styles.panelTitle}>Selected Request</div>
          
          <div style={styles.requestInfo}>
            <div style={styles.requestLabel}>Professional</div>
            <div style={styles.requestValue}>{selectedRequest.professional}</div>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
              {selectedRequest.salon}
            </div>
          </div>

          <div style={styles.requestInfo}>
            <div style={styles.requestLabel}>Service</div>
            <div style={styles.requestValue}>{selectedRequest.service}</div>
            {selectedRequest && (() => {
              const allRequests = getMockRequests();
              const request = allRequests.find(r => r.id === (selectedRequest.requestId || selectedRequest.id));
              return request && (
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '0.3rem 0.6rem',
                  background: request.status === 'matching' ? 'rgba(33,150,243,0.2)' : 
                             request.status === 'matched' ? 'rgba(76,175,80,0.2)' :
                             'rgba(255,193,7,0.2)',
                  border: `1px solid ${request.status === 'matching' ? 'rgba(33,150,243,0.4)' : 
                                         request.status === 'matched' ? 'rgba(76,175,80,0.4)' :
                                         'rgba(255,193,7,0.4)'}`,
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: request.status === 'matching' ? '#2196f3' : 
                         request.status === 'matched' ? '#4caf50' : '#ffc107',
                  fontWeight: '500',
                  display: 'inline-block',
                }}>
                  Status: {request.status}
                </div>
              );
            })()}
          </div>

          {/* Existing Matches */}
          {existingMatches.length > 0 && (
            <div style={styles.requestInfo}>
              <div style={styles.requestLabel}>Existing Matches</div>
              <div style={{ 
                padding: '0.75rem',
                background: 'rgba(33,150,243,0.1)',
                border: '1px solid rgba(33,150,243,0.2)',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '600', color: '#2196f3' }}>
                  {existingMatches.length} match(es) created
                </div>
                {existingMatches.map(match => {
                  const model = mockModels.find(m => m.id === match.modelId);
                  return (
                    <div key={match.id} style={{ 
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                    }}>
                      <div style={{ fontWeight: '500' }}>
                        {model ? `${model.firstName} ${model.lastName}` : 'Unknown Model'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>
                        Score: {match.matchScore} • Status: {match.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={styles.requestInfo}>
            <div style={styles.requestLabel}>Date & Time</div>
            <div style={styles.requestValue}>{selectedRequest.date}</div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              {selectedRequest.time} • {serviceDetails ? formatDuration(serviceDetails.duration) : ''}
            </div>
          </div>

          {/* Pricing Breakdown */}
          {serviceDetails && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '1rem',
              marginTop: '0.5rem',
              marginBottom: '1rem',
            }}>
              <div style={styles.requestLabel}>Pricing Breakdown</div>
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Service Price</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{formatPrice(serviceDetails.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#667eea' }}>Pro Pays You</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#667eea' }}>
                    {formatPrice(serviceDetails.professionalFee)} ({serviceDetails.professionalFeePercent}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#e94560' }}>Model Pays You</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e94560' }}>
                    {formatPrice(serviceDetails.modelFee)} ({serviceDetails.modelFeePercent}%)
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  marginTop: '0.5rem',
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Your Revenue</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4caf50' }}>
                    {formatPrice(serviceDetails.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div style={styles.panelTitle}>Match Criteria</div>
          <div style={styles.criteriaGrid}>
            {selectedRequest.criteria.hairColor && (
              <div style={styles.criteriaItem}>
                <div style={styles.criteriaLabel}>Hair Color</div>
                <div style={styles.criteriaValue}>{selectedRequest.criteria.hairColor}</div>
              </div>
            )}
            {selectedRequest.criteria.hairLength && (
              <div style={styles.criteriaItem}>
                <div style={styles.criteriaLabel}>Length</div>
                <div style={styles.criteriaValue}>{selectedRequest.criteria.hairLength}</div>
              </div>
            )}
            {selectedRequest.criteria.hairTexture && (
              <div style={styles.criteriaItem}>
                <div style={styles.criteriaLabel}>Texture</div>
                <div style={styles.criteriaValue}>{selectedRequest.criteria.hairTexture}</div>
              </div>
            )}
            {selectedRequest.criteria.hairCondition && (
              <div style={styles.criteriaItem}>
                <div style={styles.criteriaLabel}>Condition</div>
                <div style={styles.criteriaValue}>{selectedRequest.criteria.hairCondition}</div>
              </div>
            )}
            {selectedRequest.criteria.virginHair && (
              <div style={{ ...styles.criteriaItem, gridColumn: '1 / -1' }}>
                <div style={styles.criteriaLabel}>Virgin Hair Required</div>
                <div style={styles.criteriaValue}>✓ Yes</div>
              </div>
            )}
          </div>

          <button 
            style={styles.runEngineBtn}
            onClick={handleRunEngine}
            disabled={processing}
          >
            {processing ? 'Running...' : 'Re-run Match Engine'}
          </button>
        </div>

        {/* Right Panel - Matches */}
        <div style={styles.matchesPanel}>
          <div style={styles.matchesHeader}>
            <div style={styles.matchCount}>
              Found <strong style={{ color: '#e94560' }}>{currentMatchResult?.qualifiedMatches || 0}</strong> qualified matches
              {currentMatchResult?.averageScore && (
                <span style={{ marginLeft: '0.5rem' }}>
                  (avg score: <strong>{currentMatchResult.averageScore}</strong>)
                </span>
              )}
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
                <strong>{approvedModels.length}</strong> models selected for approval
              </div>
              <button 
                style={styles.approveAllBtn}
                onClick={handleApproveAll}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Send Booking Links'}
              </button>
            </div>
          )}

          {/* Match Cards */}
          {matchedModels.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
              No matches found. Click "Re-run Match Engine" to find matches.
            </div>
          ) : matchedModels.map((match, index) => {
            const isExpanded = expandedMatch === match.model.id;
            return (
              <div 
                key={match.model.id} 
                style={{
                  ...styles.matchCard,
                  ...(isExpanded ? styles.matchCardExpanded : {}),
                  borderColor: approvedModels.includes(match.model.id) ? 'rgba(76,175,80,0.5)' : 
                               match.isPerfectMatch ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.06)',
                  background: approvedModels.includes(match.model.id) ? 'rgba(76,175,80,0.05)' : 
                              match.isPerfectMatch ? 'rgba(255,215,0,0.05)' : 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Score Circle */}
                  <div style={{
                    ...styles.scoreCircle,
                    background: getScoreColor(match.finalScore),
                  }}>
                    <div style={styles.scoreValue}>{match.finalScore}</div>
                    <div style={styles.scoreLabel}>
                      {match.isPerfectMatch ? 'Perfect' : match.isStrongMatch ? 'Strong' : 'Good'}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div style={styles.modelInfo}>
                    <div style={styles.modelHeader}>
                      <div>
                        <div style={styles.modelName}>
                          {match.model.firstName} {match.model.lastName}
                          {match.isPerfectMatch && (
                            <span style={{ marginLeft: '0.5rem', color: '#ffd700', fontSize: '0.9rem' }}>
                              PERFECT MATCH
                            </span>
                          )}
                        </div>
                        <div style={styles.modelDetails}>
                          {match.model.hairColor} • {match.model.hairLength} • {match.model.hairTexture} • {match.model.hairCondition}
                          {match.model.virginHair && ' • Virgin'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Breakdown */}
                    <div style={styles.scoreBreakdown}>
                      <div style={styles.breakdownItem}>
                        <div style={styles.breakdownLabel}>Attribute</div>
                        <div style={{ ...styles.breakdownValue, color: getBreakdownColor(match.breakdown.attribute.score) }}>
                          {match.breakdown.attribute.score}
                        </div>
                        <div style={styles.breakdownBar}>
                          <div 
                            style={{ 
                              ...styles.breakdownBarFill, 
                              width: `${match.breakdown.attribute.score}%`,
                              background: getBreakdownColor(match.breakdown.attribute.score),
                            }} 
                          />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                          {Math.round(match.breakdown.attribute.weight * 100)}% weight
                        </div>
                      </div>
                      <div style={styles.breakdownItem}>
                        <div style={styles.breakdownLabel}>Agentic</div>
                        <div style={{ ...styles.breakdownValue, color: getBreakdownColor(match.breakdown.agentic.score) }}>
                          {match.breakdown.agentic.score}
                        </div>
                        <div style={styles.breakdownBar}>
                          <div 
                            style={{ 
                              ...styles.breakdownBarFill, 
                              width: `${match.breakdown.agentic.score}%`,
                              background: getBreakdownColor(match.breakdown.agentic.score),
                            }} 
                          />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                          {Math.round(match.breakdown.agentic.weight * 100)}% weight
                        </div>
                      </div>
                      <div style={styles.breakdownItem}>
                        <div style={styles.breakdownLabel}>Reachability</div>
                        <div style={{ ...styles.breakdownValue, color: getBreakdownColor((match.breakdown.reachability ?? match.breakdown.location)?.score ?? 0) }}>
                          {(match.breakdown.reachability ?? match.breakdown.location)?.score ?? 0}
                          {((match.breakdown.reachability ?? match.breakdown.location)?.estimatedTravelMinutes) != null && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.25rem' }}>
                              (~{(match.breakdown.reachability ?? match.breakdown.location).estimatedTravelMinutes} min)
                            </span>
                          )}
                          {((match.breakdown.reachability ?? match.breakdown.location)?.distanceMiles) != null && (
                            <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.25rem' }}>
                              (~{Math.round((match.breakdown.reachability ?? match.breakdown.location).distanceMiles)} mi)
                            </span>
                          )}
                        </div>
                        {match.availabilityInfo && (
                          <div style={{ 
                            marginTop: '0.25rem', 
                            fontSize: '0.7rem', 
                            color: match.availabilityInfo.isAvailable ? '#4caf50' : 
                                   match.availabilityInfo.isAvailableNearby ? '#ffc107' : 
                                   match.availabilityInfo.isAvailableThatDay ? '#ff9800' : 'rgba(255,255,255,0.4)',
                            fontWeight: '500',
                          }}>
                            {match.availabilityInfo.isAvailable ? 'Available at requested time' :
                             match.availabilityInfo.isAvailableNearby ? 'Available nearby (±1hr)' :
                             match.availabilityInfo.isAvailableThatDay ? 'Available that day (different time)' :
                             'Not available'}
                          </div>
                        )}
                        <div style={styles.breakdownBar}>
                          <div 
                            style={{ 
                              ...styles.breakdownBarFill, 
                              width: `${(match.breakdown.reachability ?? match.breakdown.location)?.score ?? 0}%`,
                              background: getBreakdownColor((match.breakdown.reachability ?? match.breakdown.location)?.score ?? 0),
                            }} 
                          />
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                          {Math.round(((match.breakdown.reachability ?? match.breakdown.location)?.weight ?? 0.15) * 100)}% weight
                        </div>
                      </div>
                    </div>
                    
                    {/* Service Preference Check */}
                    {selectedRequest?.serviceType && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.4rem 0.6rem',
                        background: (() => {
                          const serviceMap = {
                            'haircut': match.model.openToHaircut,
                            'color': match.model.openToColor,
                            'blowdry': match.model.openToStyling,
                            'blowout': match.model.openToStyling,
                            'styling': match.model.openToStyling,
                            'highlights': match.model.openToColor,
                            'gloss': match.model.openToColor,
                            'keratin': match.model.openToStyling,
                          };
                          const isOpen = serviceMap[selectedRequest.serviceType] || 
                                        (match.model.services || []).includes(selectedRequest.serviceType);
                          return isOpen ? 'rgba(76,175,80,0.2)' : 'rgba(233,69,96,0.2)';
                        })(),
                        border: `1px solid ${(() => {
                          const serviceMap = {
                            'haircut': match.model.openToHaircut,
                            'color': match.model.openToColor,
                            'blowdry': match.model.openToStyling,
                            'blowout': match.model.openToStyling,
                            'styling': match.model.openToStyling,
                            'highlights': match.model.openToColor,
                            'gloss': match.model.openToColor,
                            'keratin': match.model.openToStyling,
                          };
                          const isOpen = serviceMap[selectedRequest.serviceType] || 
                                        (match.model.services || []).includes(selectedRequest.serviceType);
                          return isOpen ? 'rgba(76,175,80,0.4)' : 'rgba(233,69,96,0.4)';
                        })()}`,
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: (() => {
                          const serviceMap = {
                            'haircut': match.model.openToHaircut,
                            'color': match.model.openToColor,
                            'blowdry': match.model.openToStyling,
                            'blowout': match.model.openToStyling,
                            'styling': match.model.openToStyling,
                            'highlights': match.model.openToColor,
                            'gloss': match.model.openToColor,
                            'keratin': match.model.openToStyling,
                          };
                          const isOpen = serviceMap[selectedRequest.serviceType] || 
                                        (match.model.services || []).includes(selectedRequest.serviceType);
                          return isOpen ? '#4caf50' : '#e94560';
                        })(),
                        fontWeight: '500',
                      }}>
                        {(() => {
                          const serviceMap = {
                            'haircut': match.model.openToHaircut,
                            'color': match.model.openToColor,
                            'blowdry': match.model.openToStyling,
                            'blowout': match.model.openToStyling,
                            'styling': match.model.openToStyling,
                            'highlights': match.model.openToColor,
                            'gloss': match.model.openToColor,
                            'keratin': match.model.openToStyling,
                          };
                          const isOpen = serviceMap[selectedRequest.serviceType] || 
                                        (match.model.services || []).includes(selectedRequest.serviceType);
                          return isOpen ? 'Open to this service' : 'Not open to this service';
                        })()}
                      </div>
                    )}
                    
                    {/* Agentic Breakdown */}
                    <div style={styles.agenticBreakdown}>
                      <span style={styles.agenticItem}>
                        Reliability: <strong style={{ color: getBreakdownColor(match.model.agenticScores?.reliability || 0) }}>
                          {match.model.agenticScores?.reliability || '—'}
                        </strong>
                      </span>
                      <span style={styles.agenticItem}>
                        Feedback: <strong style={{ color: getBreakdownColor(match.model.agenticScores?.feedback || 0) }}>
                          {match.model.agenticScores?.feedback || '—'}
                        </strong>
                      </span>
                      <span style={styles.agenticItem}>
                        Experience: <strong style={{ color: getBreakdownColor(match.model.agenticScores?.experience || 0) }}>
                          {match.model.agenticScores?.experience || '—'}
                        </strong>
                      </span>
                      <span style={styles.agenticItem}>
                        Engagement: <strong style={{ color: getBreakdownColor(match.model.agenticScores?.engagement || 0) }}>
                          {match.model.agenticScores?.engagement || '—'}
                        </strong>
                      </span>
                      <span style={styles.agenticItem}>
                        Compatibility: <strong style={{ color: getBreakdownColor(match.model.agenticScores?.compatibility || 0) }}>
                          {match.model.agenticScores?.compatibility || '—'}
                        </strong>
                      </span>
                    </div>
                    
                    {/* Stats */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '1.5rem', 
                      marginTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: 'rgba(255,255,255,0.6)',
                    }}>
                      <span>{match.model.totalBookings || 0} bookings</span>
                      <span>{match.model.repeatBookings || 0} repeats</span>
                      <span>{match.model.locationZip || 'N/A'}</span>
                    </div>

                    {/* Expand for detailed breakdown */}
                    <button
                      style={styles.expandBtn}
                      onClick={() => toggleExpand(match.model.id)}
                    >
                      {isExpanded ? '▼ Hide' : '▶ Show'} Detailed Breakdown
                    </button>

                    {/* Detailed Breakdown */}
                    {isExpanded && match.breakdown.attribute.details && (
                      <div style={styles.detailedBreakdown}>
                        <div style={styles.breakdownSection}>
                          <div style={styles.breakdownSectionTitle}>Attribute Match Details</div>
                          {Object.entries(match.breakdown.attribute.details).map(([attr, detail]) => (
                            <div key={attr} style={styles.attributeRow}>
                              <div>
                                <strong>{attr.replace(/([A-Z])/g, ' $1').trim()}:</strong>
                                <span style={{ marginLeft: '0.5rem', color: 'rgba(255,255,255,0.6)' }}>
                                  {detail.requested} → {detail.actual}
                                </span>
                              </div>
                              <div style={{ color: getBreakdownColor(detail.score) }}>
                                {detail.score} pts (weight: {detail.weight.toFixed(1)})
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {match.breakdown.agentic.details && (
                          <div style={styles.breakdownSection}>
                            <div style={styles.breakdownSectionTitle}>Agentic Score Details</div>
                            {Object.entries(match.breakdown.agentic.details).map(([metric, detail]) => (
                              <div key={metric} style={styles.attributeRow}>
                                <div>
                                  <strong>{metric.charAt(0).toUpperCase() + metric.slice(1)}:</strong>
                                </div>
                                <div style={{ color: getBreakdownColor(detail.score) }}>
                                  {detail.score} (weight: {detail.weight.toFixed(2)}, contribution: {detail.contribution.toFixed(1)})
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                    >
                      {approvedModels.includes(match.model.id) ? '✓ Selected' : 'Approve'}
                    </button>
                    <button 
                      style={styles.rejectBtn}
                      onClick={() => {
                        // Remove from approved if it was selected
                        if (approvedModels.includes(match.model.id)) {
                          toggleApprove(match.model.id);
                        }
                      }}
                      disabled={processing}
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
