import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { services, getServiceById, formatPrice } from '../data/services';
import { createRequest, updateRequestStatus } from '../../utils/requestService';
import WorkflowProgress from '../../components/workflow/WorkflowProgress';
import { getWorkflowStage } from '../../utils/workflowState';
import { getProfessionalById } from '../../utils/profileService';
import { findMatches, extractZipFromLocation } from '../../matching/matchingEngine';
import { 
  getMockRequests, 
  getMockProfessional,
  shouldUseMockData,
} from '../../utils/mockDataService';

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
  
  // Stats bar
  statsBar: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    flex: 1,
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statIcon: {
    fontSize: '1.5rem',
    width: '45px',
    height: '45px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '10px',
    background: 'rgba(233,69,96,0.2)',
  },
  statInfo: {},
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Request cards
  requestsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  requestCardUrgent: {
    borderColor: 'rgba(233,69,96,0.5)',
    background: 'rgba(233,69,96,0.05)',
  },
  
  // Request sections
  requestSection: {},
  requestLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  requestValue: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  requestSub: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.25rem',
  },
  
  // Professional info
  proInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  proAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  
  // Tags
  tagContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  tag: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Status / Priority badges
  badge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgePending: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  badgeUrgent: {
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
  },
  badgeMatching: {
    background: 'rgba(33,150,243,0.2)',
    color: '#2196f3',
  },
  
  // Action buttons
  actionBtns: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  matchBtn: {
    padding: '0.6rem 1.25rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
  },
  viewBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 10,
    pointerEvents: 'auto',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
};

// Helper to format time ago
const getTimeAgo = (dateString) => {
  if (!dateString) return 'Recently';
  const now = new Date();
  const then = new Date(dateString);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const LOCAL_PRO_CRM_TIMELINE_KEY = 'modeled_pro_crm_timeline_v1';
const INTAKE_FIELD_GUIDE = [
  ['Professional', 'Which pro this request belongs to.'],
  ['Request title', 'Short internal name for this intake.'],
  ['Service type', 'Main service being requested (blowdry, color, etc.).'],
  ['Model count', 'How many models are needed for this request.'],
  ['Duration', 'Estimated minutes per session.'],
  ['Stylist level', 'Target level for who should handle this service.'],
  ['Desired hair filters', 'Match criteria for color, length, texture, condition.'],
  ['Priority', 'How urgent this request is.'],
  ['Status', 'Workflow state when created.'],
  ['Requested date/time', 'Primary appointment slot if fixed.'],
  ['Scheduling flexibility', 'Fixed vs flexible scheduling tolerance.'],
  ['Recurring cadence', 'One-time, weekly, biweekly, or monthly pattern.'],
  ['Recurring weeks', 'How long the recurring series should run.'],
  ['Multiple date options', 'Alternative slots if not fixed (one per line).'],
  ['Location ZIP + address', 'Where appointment happens for matching/logistics.'],
  ['Quoted service price', 'Total service price per model/session.'],
  ['Pro fee charged by Modeled', 'Fee paid by pro side (per model/session).'],
  ['Model payout', 'What model receives (per model/session).'],
  ['Pro/model fee %', 'Optional percent tracking for quote consistency.'],
  ['Service brief for models', 'What the model sees as request context.'],
  ['Conversation discovery fields', 'CRM context from your stylist conversation.'],
  ['Internal admin notes', 'Private ops notes not shown externally.'],
];

export default function RequestsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [processing, setProcessing] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [professionalOptions, setProfessionalOptions] = useState([]);
  const [professionalProfilesById, setProfessionalProfilesById] = useState({});
  const [modelProfilesForPreview, setModelProfilesForPreview] = useState([]);
  const [createForm, setCreateForm] = useState({
    professionalId: '',
    requestTitle: '',
    serviceType: 'blowdry',
    serviceDescription: '',
    desiredHairColor: 'Any',
    desiredHairLength: 'Any',
    desiredHairTexture: 'Any',
    desiredHairCondition: 'Any',
    requestedDate: '',
    requestedTime: '',
    multipleDatesText: '',
    schedulingFlexibility: 'fixed',
    recurringCadence: 'none',
    recurringWeeks: 4,
    duration: 60,
    location: '',
    locationZip: '',
    modelSearchFee: '',
    modelPayment: '',
    quotedServicePrice: '',
    proFeePercent: '',
    modelFeePercent: '',
    adminNotes: '',
    modelCount: 1,
    stylistLevel: 'all_levels',
    goalPrimary: '',
    educationFocus: '',
    knownChallenges: '',
    mustAvoid: '',
    desiredOutcome: '',
    conversationNotes: '',
    priority: 'normal',
    status: 'matching',
  });
  const hairColorOptions = ['Any', 'Black', 'Brown', 'Blonde', 'Red', 'Gray', 'Fashion Color'];
  const hairLengthOptions = ['Any', 'Short', 'Medium', 'Long', 'Extra Long'];
  const hairTextureOptions = ['Any', 'Straight', 'Wavy', 'Curly', 'Coily'];
  const hairConditionOptions = ['Any', 'Healthy', 'Color Treated', 'Virgin', 'Damaged'];

  // Reload every time this page is navigated to
  useEffect(() => {
    loadRequests();
    loadProfessionalOptions();
    loadModelsForPreview();
  }, [location.key]);

  // Also reload when window regains focus (catches requests created in another tab/portal)
  useEffect(() => {
    const handleFocus = () => loadRequests();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldOpenCreate = params.get('create') === '1';
    const professionalId = params.get('professionalId');
    if (shouldOpenCreate) {
      setShowCreateModal(true);
      if (professionalId) {
        setCreateForm((prev) => ({ ...prev, professionalId }));
      }
    }
  }, [location.search]);

  useEffect(() => {
    const svc = getServiceById(createForm.serviceType);
    if (!svc) return;
    setCreateForm((prev) => ({
      ...prev,
      duration: prev.duration || svc.duration || 60,
      modelSearchFee: prev.modelSearchFee || svc.professionalFee || '',
      modelPayment: prev.modelPayment || svc.modelFee || '',
    }));
  }, [createForm.serviceType]);

  useEffect(() => {
    if (!createForm.professionalId) return;
    const selectedPro = professionalProfilesById[createForm.professionalId];
    if (!selectedPro) return;

    const composedAddress =
      selectedPro.salonAddress ||
      [selectedPro.salonStreet, selectedPro.salonCity, selectedPro.salonState, selectedPro.salonZip]
        .filter(Boolean)
        .join(', ');
    const zipFromProfile = selectedPro.salonZip || selectedPro.locationZip || '';

    setCreateForm((prev) => {
      const next = { ...prev };
      if (!prev.location || prev.location.trim() === '') next.location = composedAddress || '';
      if (!prev.locationZip || prev.locationZip.trim() === '') next.locationZip = String(zipFromProfile || '');
      return next;
    });
  }, [createForm.professionalId, professionalProfilesById]);

  const loadProfessionalOptions = async () => {
    try {
      if (!shouldUseMockData() && client?.models?.Professional) {
        const { data, errors } = await client.models.Professional.list({ limit: 200 });
        if (!errors?.length && data?.length) {
          const byId = {};
          data.forEach((p) => { byId[p.id] = p; });
          setProfessionalProfilesById(byId);
          setProfessionalOptions(
            data.map((p) => ({
              id: p.id,
              label: `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.email || p.id,
            }))
          );
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load professionals for request form:', e);
    }
    const mockPro = getMockProfessional('mock-pro-1');
    if (mockPro?.id) {
      setProfessionalProfilesById({ [mockPro.id]: mockPro });
    } else {
      setProfessionalProfilesById({});
    }
    setProfessionalOptions(
      mockPro
        ? [{ id: mockPro.id, label: `${mockPro.firstName || ''} ${mockPro.lastName || ''}`.trim() || mockPro.email || mockPro.id }]
        : []
    );
  };

  const loadModelsForPreview = async () => {
    try {
      if (!shouldUseMockData() && client?.models?.ModelProfile?.list) {
        const { data, errors } = await client.models.ModelProfile.list({ limit: 500 });
        if (!errors?.length && data?.length) {
          setModelProfilesForPreview(data);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load models for live preview:', e);
    }
    setModelProfilesForPreview([]);
  };

  const matchingServiceId = (serviceType) => {
    const map = {
      haircut: 'haircut',
      cut: 'haircut',
      color: 'color',
      blowdry: 'blowdry',
      blowout: 'blowdry',
      styling: 'blowdry',
      gloss: 'gloss',
      highlights: 'highlights',
      keratin: 'keratin',
    };
    return map[serviceType] || serviceType || 'haircut';
  };

  const toMatchingModel = (model) => ({
    id: model.id,
    firstName: model.firstName,
    lastName: model.lastName,
    locationZip: model.locationZip,
    willingToTravel: model.willingToTravel,
    travelRadius: model.travelRadius,
    hairLength: model.hairLengthSimple || model.hairLength,
    hairColor: model.hairColorSimple || model.hairColor,
    hairTexture: model.hairTextureSimple || model.hairTexture,
    hairCondition: model.hairCondition,
    virginHair: model.virginHair ?? (model.hairCondition === 'virgin'),
    openToHaircut: model.openToHaircut,
    openToColor: model.openToColor,
    openToStyling: model.openToStyling,
    openToMakeup: model.openToMakeup,
    openToNails: model.openToNails,
    openToSkincare: model.openToSkincare,
    availability: model.availability || {},
    cardOnFileStatus: model.cardOnFileStatus || 'valid',
    agenticScores: model.agenticScores || {
      reliability: 50,
      feedback: 50,
      experience: 50,
      engagement: 50,
      compatibility: 50,
    },
  });

  const liveMatchPreview = useMemo(() => {
    if (!showCreateModal || !createForm.serviceType) {
      return { eligible: 0, qualified: 0, avgScore: 0 };
    }
    try {
      const selectedPro = createForm.professionalId ? professionalProfilesById[createForm.professionalId] : null;
      const requestLocationZip = createForm.locationZip || extractZipFromLocation(createForm.location || '');
      const fallbackZip = selectedPro?.locationZip || extractZipFromLocation(selectedPro?.salonAddress || '');
      const locationForMatching = requestLocationZip || fallbackZip || createForm.location || '';
      const salonCoords =
        selectedPro?.salonLat != null && selectedPro?.salonLng != null
          ? { lat: selectedPro.salonLat, lng: selectedPro.salonLng }
          : null;

      const criteria = {};
      if (createForm.desiredHairColor && createForm.desiredHairColor !== 'Any') criteria.hairColor = createForm.desiredHairColor;
      if (createForm.desiredHairLength && createForm.desiredHairLength !== 'Any') criteria.hairLength = createForm.desiredHairLength;
      if (createForm.desiredHairTexture && createForm.desiredHairTexture !== 'Any') criteria.hairTexture = createForm.desiredHairTexture;
      if (createForm.desiredHairCondition && createForm.desiredHairCondition !== 'Any') criteria.hairCondition = createForm.desiredHairCondition;
      if ((createForm.desiredHairCondition || '').toLowerCase() === 'virgin') criteria.virginHair = true;

      const formattedRequest = {
        serviceType: createForm.serviceType,
        serviceId: matchingServiceId(createForm.serviceType),
        requestedDate: createForm.requestedDate || null,
        requestedTime: createForm.requestedTime || null,
        location: locationForMatching,
        salonCoords,
        salonZip: requestLocationZip || fallbackZip || null,
        criteria,
      };

      const models = modelProfilesForPreview
        .filter((m) => m && m.id)
        .map(toMatchingModel);
      const result = findMatches(models, formattedRequest, { minScore: 30, limit: 1000 });
      return {
        eligible: models.length,
        qualified: result.qualifiedMatches || 0,
        avgScore: result.averageScore || 0,
      };
    } catch (previewError) {
      console.warn('Live match preview failed:', previewError);
      return { eligible: 0, qualified: 0, avgScore: 0 };
    }
  }, [showCreateModal, createForm, modelProfilesForPreview, professionalProfilesById]);

  const pricingSummary = useMemo(() => {
    const modelCount = Math.max(1, Number(createForm.modelCount) || 1);
    const servicePrice = Number(createForm.quotedServicePrice) || 0;
    const modelPayoutEach = Number(createForm.modelPayment) || 0;
    const proFeeEach = Number(createForm.modelSearchFee) || 0;
    const modelTotal = modelPayoutEach * modelCount;
    const proTotal = proFeeEach * modelCount;
    const modeledRevenue = modelTotal + proTotal;
    const estimatedSessionGross = servicePrice > 0 ? servicePrice * modelCount : 0;
    return {
      modelTotal,
      proTotal,
      modeledRevenue,
      estimatedSessionGross,
    };
  }, [createForm.modelCount, createForm.quotedServicePrice, createForm.modelPayment, createForm.modelSearchFee]);

  const createRequestReadiness = useMemo(() => {
    const hasProfessional = Boolean(createForm.professionalId);
    const hasLocation = Boolean((createForm.location || '').trim());
    const hasPrimarySlot = Boolean(createForm.requestedDate && createForm.requestedTime);
    const hasMultipleDates = Boolean((createForm.multipleDatesText || '').trim());
    const hasScheduling = hasPrimarySlot || hasMultipleDates;

    const missing = [];
    if (!hasProfessional) missing.push('Professional');
    if (!hasLocation) missing.push('Location');
    if (!hasScheduling) missing.push('Date/Time or multiple date options');

    return {
      canCreate: hasProfessional && hasLocation && hasScheduling,
      missing,
    };
  }, [createForm.professionalId, createForm.location, createForm.requestedDate, createForm.requestedTime, createForm.multipleDatesText]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      let requestsData = [];
      
      // Try real database first
      if (!shouldUseMockData()) {
        try {
          const { data, errors } = await client.models.ModelRequest.list({
            limit: 100,
            sortDirection: 'DESC',
          });

          if (errors) {
            throw new Error(errors[0]?.message || 'Failed to load requests');
          }
          
          requestsData = data || [];
        } catch (dbError) {
          console.error('Database error, falling back to mock data:', dbError);
          // Fall through to mock data
        }
      }
      
      // Use mock data if database failed or mock mode enabled
      if (requestsData.length === 0 || shouldUseMockData()) {
        try {
          requestsData = getMockRequests();
        } catch (mockError) {
          console.error('Error getting mock requests:', mockError);
          requestsData = [];
        }
      }

      // Load professionals for each request
      const enrichedRequests = await Promise.all(
        (requestsData || []).map(async (req) => {
          if (!req) return null;
          
          let professional = null;
          
          try {
            if (req.professionalId) {
              professional = await getProfessionalById(req.professionalId) || getMockProfessional(req.professionalId);
            }
          } catch (err) {
            console.error(`Error loading professional for request ${req.id}:`, err);
            // Continue with null professional
          }

          return {
            id: req.id || 'unknown',
            professional: {
              name: professional
                ? `${professional.firstName || ''} ${professional.lastName || ''}`.trim() || 'Unknown'
                : 'Unknown',
              salon: professional?.salonName || 'Unknown Salon',
              avatar: professional?.firstName?.charAt(0) || '?',
              email: professional?.email,
              phone: professional?.phone,
            },
            serviceId: req.serviceType || 'service',
            service: req.serviceType || 'Service',
            description: req.serviceDescription || '',
            desiredModel: {
              hairColor: req.desiredHairColor || 'Any',
              hairLength: req.desiredHairLength || 'Any',
              hairTexture: req.desiredHairTexture || 'Any',
              hairCondition: req.desiredHairCondition || 'Any',
            },
            date: req.requestedDate
              ? new Date(req.requestedDate.includes('T') ? req.requestedDate : `${req.requestedDate}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  weekday: 'short',
                })
              : 'TBD',
            time: req.requestedTime || 'TBD',
            duration: req.duration || 60,
            location: req.location || 'TBD',
            priority: req.priority || 'normal',
            status: req.status || 'matching',
            createdAt: req.createdAt || new Date().toISOString(),
            timeAgo: getTimeAgo(req.createdAt),
            // Store original request for updates
            originalRequest: req,
          };
        })
      );

      // Filter out any null entries
      const validRequests = enrichedRequests.filter(r => r !== null);

      setRequests(validRequests);
    } catch (err) {
      console.error('Error loading requests:', err);
      
      // Try mock data as fallback
      try {
        const mockRequests = getMockRequests();
        const enrichedRequests = await Promise.all(mockRequests.map(async (req) => {
          const professional = await getProfessionalById(req.professionalId) || getMockProfessional(req.professionalId);
          return {
            id: req.id,
            professional: {
              name: professional
                ? `${professional.firstName} ${professional.lastName}`
                : 'Unknown',
              salon: professional?.salonName || 'Unknown Salon',
              avatar: professional?.firstName?.charAt(0) || '?',
              email: professional?.email,
              phone: professional?.phone,
            },
            serviceId: req.serviceType,
            service: req.serviceType,
            description: req.serviceDescription || '',
            desiredModel: {
              hairColor: req.desiredHairColor || 'Any',
              hairLength: req.desiredHairLength || 'Any',
              hairTexture: req.desiredHairTexture || 'Any',
              hairCondition: req.desiredHairCondition || 'Any',
            },
            date: req.requestedDate
              ? new Date(req.requestedDate.includes('T') ? req.requestedDate : `${req.requestedDate}T00:00:00`).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  weekday: 'short',
                })
              : 'TBD',
            time: req.requestedTime || 'TBD',
            duration: req.duration || 60,
            location: req.location || 'TBD',
            priority: req.priority || 'normal',
            status: req.status || 'matching',
            createdAt: req.createdAt || new Date().toISOString(),
            timeAgo: getTimeAgo(req.createdAt),
            originalRequest: req,
          };
        }));
        const validFallbackRequests = enrichedRequests.filter(r => r !== null);
        setRequests(validFallbackRequests);
        setError(null); // Clear error if mock data works
      } catch (mockError) {
        console.error('Error with mock data fallback:', mockError);
        setError(err.message || 'Failed to load requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: requests.length,
    matching: requests.filter((r) => r.status === 'matching').length,
    urgent: requests.filter((r) => r.priority === 'urgent').length,
    sent: requests.filter((r) => r.status === 'sent').length,
  };

  const filteredRequests =
    activeTab === 'all'
      ? requests
      : requests.filter((r) => r.status === activeTab || r.priority === activeTab);

  const handleMatch = async (requestId) => {
    if (!requestId) {
      console.error('No request ID provided');
      alert('Error: No request ID found');
      return;
    }
    
    setProcessing(prev => ({ ...prev, [requestId]: true }));
    try {
      console.log('Navigating to match engine with requestId:', requestId);
      // Navigate to match engine with this request
      navigate(`/admin/matching?requestId=${requestId}`);
    } catch (error) {
      console.error('Error navigating to match engine:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setProcessing(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const handleViewDetails = (requestId) => {
    if (!requestId) {
      console.error('No request ID provided');
      alert('Error: No request ID found');
      return;
    }
    
    console.log('Navigating to match approval with requestId:', requestId);
    // Navigate to match approval page with this request
    navigate(`/admin/match-approval?requestId=${requestId}`);
  };

  const handleCreateRequest = async () => {
    if (!createRequestReadiness.canCreate) {
      alert('Please complete professional, location, and either a primary date/time or multiple date options.');
      return;
    }
    try {
      setCreatingRequest(true);
      const discoveryNotes = [
        createForm.requestTitle ? `Request title: ${createForm.requestTitle}` : null,
        `Model count needed: ${Number(createForm.modelCount) || 1}`,
        `Stylist level target: ${createForm.stylistLevel || 'all_levels'}`,
        createForm.goalPrimary ? `Primary goal: ${createForm.goalPrimary}` : null,
        createForm.educationFocus ? `Current education/training focus: ${createForm.educationFocus}` : null,
        createForm.knownChallenges ? `Known challenges: ${createForm.knownChallenges}` : null,
        createForm.mustAvoid ? `Must avoid: ${createForm.mustAvoid}` : null,
        createForm.desiredOutcome ? `Desired outcome: ${createForm.desiredOutcome}` : null,
        createForm.conversationNotes ? `Conversation notes: ${createForm.conversationNotes}` : null,
        `Scheduling flexibility: ${createForm.schedulingFlexibility || 'fixed'}`,
        `Recurring cadence: ${createForm.recurringCadence || 'none'}`,
        `Recurring weeks: ${Number(createForm.recurringWeeks) || 0}`,
        createForm.multipleDatesText ? `Multiple date options:\n${createForm.multipleDatesText}` : null,
        createForm.quotedServicePrice ? `Quoted service price: $${Number(createForm.quotedServicePrice) || 0}` : null,
        createForm.proFeePercent ? `Pro fee percent: ${createForm.proFeePercent}%` : null,
        createForm.modelFeePercent ? `Model fee percent: ${createForm.modelFeePercent}%` : null,
        createForm.adminNotes ? `Admin notes: ${createForm.adminNotes}` : null,
      ].filter(Boolean).join('\n');

      const created = await createRequest({
        professionalId: createForm.professionalId,
        serviceType: createForm.serviceType,
        serviceDescription: createForm.serviceDescription
          ? `${createForm.serviceDescription}\n\nModel count requested: ${Number(createForm.modelCount) || 1}\nStylist level: ${createForm.stylistLevel || 'all_levels'}\nScheduling: ${createForm.schedulingFlexibility || 'fixed'} / ${createForm.recurringCadence || 'none'}`
          : null,
        desiredHairColor: createForm.desiredHairColor || null,
        desiredHairLength: createForm.desiredHairLength || null,
        desiredHairTexture: createForm.desiredHairTexture || null,
        desiredHairCondition: createForm.desiredHairCondition || null,
        requestedDate: createForm.requestedDate || null,
        requestedTime: createForm.requestedTime || null,
        duration: Number(createForm.duration) || 60,
        location: createForm.location || null,
        locationZip: createForm.locationZip || null,
        modelSearchFee: createForm.modelSearchFee === '' ? null : Number(createForm.modelSearchFee),
        modelPayment: createForm.modelPayment === '' ? null : Number(createForm.modelPayment),
        adminNotes: discoveryNotes || null,
        priority: createForm.priority || 'normal',
        status: createForm.status || 'matching',
      });

      try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_PRO_CRM_TIMELINE_KEY) || '{}');
        const proId = createForm.professionalId;
        const timeline = Array.isArray(existing[proId]) ? existing[proId] : [];
        timeline.unshift({
          type: 'request_intake',
          createdAt: new Date().toISOString(),
          requestId: created?.id || null,
          serviceType: createForm.serviceType,
          requestTitle: createForm.requestTitle || null,
          modelCount: Number(createForm.modelCount) || 1,
          stylistLevel: createForm.stylistLevel || 'all_levels',
          notes: discoveryNotes,
        });
        localStorage.setItem(
          LOCAL_PRO_CRM_TIMELINE_KEY,
          JSON.stringify({
            ...existing,
            [proId]: timeline.slice(0, 50),
          })
        );
      } catch (crmErr) {
        console.warn('Could not write professional CRM timeline:', crmErr);
      }
      await loadRequests();
      setShowCreateModal(false);
      setCreateForm((prev) => ({
        ...prev,
        serviceDescription: '',
        requestTitle: '',
        requestedDate: '',
        requestedTime: '',
        multipleDatesText: '',
        schedulingFlexibility: 'fixed',
        recurringCadence: 'none',
        recurringWeeks: 4,
        location: '',
        locationZip: '',
        modelSearchFee: '',
        modelPayment: '',
        quotedServicePrice: '',
        proFeePercent: '',
        modelFeePercent: '',
        adminNotes: '',
        modelCount: 1,
        stylistLevel: 'all_levels',
        goalPrimary: '',
        educationFocus: '',
        knownChallenges: '',
        mustAvoid: '',
        desiredOutcome: '',
        conversationNotes: '',
      }));
      if (created?.id) {
        navigate(`/admin/matching?requestId=${created.id}`);
      }
    } catch (e) {
      console.error('Create request failed:', e);
      alert(`Could not create request: ${e?.message || 'Unknown error'}`);
    } finally {
      setCreatingRequest(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Request Queue</h1>
          <p style={styles.subtitle}>Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Request Queue</h1>
          <p style={{ ...styles.subtitle, color: '#f44336' }}>
            Error: {error}
            <button
              onClick={loadRequests}
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                background: '#e94560',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Request Queue</h1>
          <p style={styles.subtitle}>
            Review and match model requests from professionals
            {requests.length === 0 && (
              <span style={{
                marginLeft: '1rem',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.5)',
                fontStyle: 'italic'
              }}>
                (No requests yet)
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={loadRequests}
            disabled={loading}
            style={{
              padding: '0.6rem 1.25rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '0.7rem 1.2rem',
              background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 22px rgba(233,69,96,0.28)',
            }}
          >
            + Create Request Intake
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{stats.total}</div>
            <div style={styles.statLabel}>Total Requests</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(255,193,7,0.2)' }}>⏳</div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{stats.matching}</div>
            <div style={styles.statLabel}>In Matching</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(233,69,96,0.3)' }}></div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{stats.urgent}</div>
            <div style={styles.statLabel}>Urgent</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(33,150,243,0.2)' }}></div>
          <div style={styles.statInfo}>
            <div style={styles.statNumber}>{stats.sent}</div>
            <div style={styles.statLabel}>Sent to Models</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: 'all', label: 'All Requests' },
          { key: 'matching', label: 'In Matching' },
          { key: 'urgent', label: 'Urgent' },
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div style={styles.requestsGrid}>
        {filteredRequests.length === 0 ? (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              {activeTab === 'all' ? 'No requests yet' : `No ${activeTab} requests`}
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              {activeTab === 'all'
                ? 'Requests from professionals will appear here'
                : `No requests match the ${activeTab} filter`}
            </div>
          </div>
        ) : (
          filteredRequests.map((request) => (
          <React.Fragment key={request.id}>
          <div 
            style={{
              ...styles.requestCard,
              ...(request.priority === 'urgent' ? styles.requestCardUrgent : {}),
            }}
          >
            {/* Professional Info */}
            <div style={styles.requestSection}>
              <div style={styles.requestLabel}>Professional</div>
              <div style={styles.proInfo}>
                <div style={styles.proAvatar}>{request.professional.avatar}</div>
                <div>
                  <div style={styles.requestValue}>{request.professional.name}</div>
                  <div style={styles.requestSub}>{request.professional.salon}</div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div style={styles.requestSection}>
              <div style={styles.requestLabel}>Service Request</div>
              <div style={styles.requestValue}>
                {(() => {
                  const svc = getServiceById(request.serviceId);
                  return svc ? `${svc.icon} ${svc.name}` : request.service;
                })()}
              </div>
              <div style={styles.requestSub}>
                {request.date} at {request.time} • {request.duration} min
              </div>
              {request.location && (
                <div style={{ ...styles.requestSub, marginTop: '0.25rem', fontSize: '0.75rem' }}>
                  📍 {request.location}
                </div>
              )}
              {request.description && (
                <div style={{ ...styles.requestSub, marginTop: '0.5rem', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  "{request.description}"
                </div>
              )}
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  ...styles.badge,
                  ...(request.priority === 'urgent' ? styles.badgeUrgent : 
                      request.status === 'matching' ? styles.badgeMatching : 
                      styles.badgePending)
                }}>
                  {request.priority === 'urgent' ? 'Urgent' : request.status}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                  {request.timeAgo}
                </span>
              </div>
            </div>

            {/* Desired Model */}
            <div style={styles.requestSection}>
              <div style={styles.requestLabel}>Looking For</div>
              <div style={styles.tagContainer}>
                <span style={styles.tag}>{request.desiredModel.hairColor}</span>
                <span style={styles.tag}>{request.desiredModel.hairLength}</span>
                <span style={styles.tag}>{request.desiredModel.hairTexture}</span>
                <span style={styles.tag}>{request.desiredModel.hairCondition}</span>
              </div>
              {(() => {
                const svc = getServiceById(request.serviceId);
                return svc ? (
                  <div style={{ marginTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: '#667eea' }}>Pro Fee: ${svc.professionalFee}</span>
                    <span style={{ color: '#e94560' }}>Model Fee: ${svc.modelFee}</span>
                    <span style={{ color: '#4caf50', fontWeight: '600' }}>Your Rev: ${svc.totalRevenue}</span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* Actions */}
            <div style={styles.actionBtns}>
              <button 
                style={styles.matchBtn}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Match button clicked for request:', request.id);
                  handleMatch(request.id);
                }}
                disabled={processing[request.id]}
                type="button"
              >
                {processing[request.id] ? 'Loading...' : 'Match'}
              </button>
              <button 
                style={styles.viewBtn}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('View Details button clicked for request:', request.id);
                  handleViewDetails(request.id);
                }}
                type="button"
              >
                View Details
              </button>
            </div>
          </div>
          
          {/* Workflow Progress */}
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <WorkflowProgress
              request={request}
              match={null}
              booking={null}
              onAction={(action) => {
                console.log('WorkflowProgress action:', action, 'for request:', request.id);
                if (action === 'start_matching') {
                  handleMatch(request.id);
                } else if (action === 'view_matches') {
                  handleViewDetails(request.id);
                }
              }}
              compact={true}
            />
          </div>
          </React.Fragment>
          ))
        )}
      </div>

      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={() => !creatingRequest && setShowCreateModal(false)}>
          <div style={{
            width: '100%', maxWidth: '980px', background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', padding: '1.25rem', maxHeight: '92vh', overflowY: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '0.35rem' }}>Create Request (Advanced Intake)</h3>
            <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>
              Capture full request detail for accurate matching and booking.
            </p>
            <details style={{ marginBottom: '0.95rem', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '10px', padding: '0.65rem 0.75rem', background: 'rgba(255,255,255,0.03)' }}>
              <summary style={{ cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#ffd8a8' }}>
                Field labels and what each one means
              </summary>
              <div style={{ marginTop: '0.65rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.45rem 0.75rem', fontSize: '0.78rem' }}>
                {INTAKE_FIELD_GUIDE.map(([label, desc]) => (
                  <React.Fragment key={label}>
                    <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.68)' }}>{desc}</div>
                  </React.Fragment>
                ))}
              </div>
            </details>
            <div style={{
              marginBottom: '0.95rem',
              padding: '0.7rem 0.85rem',
              borderRadius: '9px',
              border: '1px solid rgba(76,175,80,0.35)',
              background: 'rgba(76,175,80,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
              fontSize: '0.82rem',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>Live fit preview while you intake:</span>
              <span style={{ color: '#b9f6ca', fontWeight: 700 }}>
                {liveMatchPreview.qualified} / {liveMatchPreview.eligible} models currently match
              </span>
              <span style={{ color: 'rgba(255,255,255,0.65)' }}>
                avg score {liveMatchPreview.avgScore}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>Professional + Service</div>
              <select value={createForm.professionalId} onChange={(e) => setCreateForm({ ...createForm, professionalId: e.target.value })} style={styles.selectorSelect}>
                <option value="">Select professional</option>
                {professionalOptions.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
              <input value={createForm.requestTitle} onChange={(e) => setCreateForm({ ...createForm, requestTitle: e.target.value })} placeholder="Request title (ex: Blonde refresh campaign)" style={styles.selectorSelect} />
              <select value={createForm.serviceType} onChange={(e) => setCreateForm({ ...createForm, serviceType: e.target.value })} style={styles.selectorSelect}>
                {(services || []).map((svc) => (
                  <option key={svc.id} value={svc.id}>{svc.name}</option>
                ))}
              </select>
              <input type="number" min="1" step="1" value={createForm.modelCount} onChange={(e) => setCreateForm({ ...createForm, modelCount: e.target.value })} placeholder="How many models needed?" style={styles.selectorSelect} />
              <input type="number" min="0" step="1" value={createForm.duration} onChange={(e) => setCreateForm({ ...createForm, duration: e.target.value })} placeholder="Duration (minutes)" style={styles.selectorSelect} />
              <select value={createForm.stylistLevel} onChange={(e) => setCreateForm({ ...createForm, stylistLevel: e.target.value })} style={styles.selectorSelect}>
                <option value="all_levels">Stylist level: All levels</option>
                <option value="student">Stylist level: Student</option>
                <option value="apprentice">Stylist level: Apprentice</option>
                <option value="junior">Stylist level: Junior</option>
                <option value="senior">Stylist level: Senior</option>
                <option value="master">Stylist level: Master</option>
              </select>

              <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginTop: '0.3rem' }}>Desired Model Profile</div>
              <select value={createForm.desiredHairColor} onChange={(e) => setCreateForm({ ...createForm, desiredHairColor: e.target.value })} style={styles.selectorSelect}>
                {hairColorOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select value={createForm.desiredHairLength} onChange={(e) => setCreateForm({ ...createForm, desiredHairLength: e.target.value })} style={styles.selectorSelect}>
                {hairLengthOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select value={createForm.desiredHairTexture} onChange={(e) => setCreateForm({ ...createForm, desiredHairTexture: e.target.value })} style={styles.selectorSelect}>
                {hairTextureOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select value={createForm.desiredHairCondition} onChange={(e) => setCreateForm({ ...createForm, desiredHairCondition: e.target.value })} style={styles.selectorSelect}>
                {hairConditionOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })} style={styles.selectorSelect}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="low">Low</option>
              </select>
              <select value={createForm.status} onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })} style={styles.selectorSelect}>
                <option value="matching">Matching</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
              </select>

              <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginTop: '0.3rem' }}>Booking Details</div>
              <input type="date" value={createForm.requestedDate} onChange={(e) => setCreateForm({ ...createForm, requestedDate: e.target.value })} style={styles.selectorSelect} />
              <input type="time" value={createForm.requestedTime} onChange={(e) => setCreateForm({ ...createForm, requestedTime: e.target.value })} style={styles.selectorSelect} />
              <input value={createForm.locationZip} onChange={(e) => setCreateForm({ ...createForm, locationZip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) })} placeholder="ZIP code (optional)" style={styles.selectorSelect} />
              <input value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} placeholder="Location / salon address" style={{ ...styles.selectorSelect, gridColumn: '1 / -1' }} />
              <select value={createForm.schedulingFlexibility} onChange={(e) => setCreateForm({ ...createForm, schedulingFlexibility: e.target.value })} style={styles.selectorSelect}>
                <option value="fixed">Schedule: Fixed date/time</option>
                <option value="slightly_flexible">Schedule: Slightly flexible</option>
                <option value="flexible">Schedule: Flexible</option>
              </select>
              <select value={createForm.recurringCadence} onChange={(e) => setCreateForm({ ...createForm, recurringCadence: e.target.value })} style={styles.selectorSelect}>
                <option value="none">Recurring: One-time</option>
                <option value="weekly">Recurring: Every week</option>
                <option value="biweekly">Recurring: Every other week</option>
                <option value="monthly">Recurring: Monthly</option>
              </select>
              <input
                type="number"
                min="1"
                max="52"
                value={createForm.recurringWeeks}
                onChange={(e) => setCreateForm({ ...createForm, recurringWeeks: e.target.value })}
                placeholder="Recurring for how many weeks"
                style={styles.selectorSelect}
              />
              <textarea
                value={createForm.multipleDatesText}
                onChange={(e) => setCreateForm({ ...createForm, multipleDatesText: e.target.value })}
                placeholder="Multiple date options (one per line), ex: 2026-05-12 10:00 AM"
                style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 72 }}
              />

              <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginTop: '0.3rem' }}>Economics + Notes</div>
              <input type="number" min="0" step="1" value={createForm.quotedServicePrice} onChange={(e) => setCreateForm({ ...createForm, quotedServicePrice: e.target.value })} placeholder="Quoted service price per model/session ($)" style={styles.selectorSelect} />
              <input type="number" min="0" step="1" value={createForm.modelSearchFee} onChange={(e) => setCreateForm({ ...createForm, modelSearchFee: e.target.value })} placeholder="Pro fee charged by Modeled ($)" style={styles.selectorSelect} />
              <input type="number" min="0" step="1" value={createForm.modelPayment} onChange={(e) => setCreateForm({ ...createForm, modelPayment: e.target.value })} placeholder="Model payout ($)" style={styles.selectorSelect} />
              <input type="number" min="0" step="1" value={createForm.proFeePercent} onChange={(e) => setCreateForm({ ...createForm, proFeePercent: e.target.value })} placeholder="Pro fee percent (%)" style={styles.selectorSelect} />
              <input type="number" min="0" step="1" value={createForm.modelFeePercent} onChange={(e) => setCreateForm({ ...createForm, modelFeePercent: e.target.value })} placeholder="Model fee percent (%)" style={styles.selectorSelect} />
              <div style={{ ...styles.selectorSelect, gridColumn: '1 / -1', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Pricing preview ({Number(createForm.modelCount) || 1} model{(Number(createForm.modelCount) || 1) > 1 ? 's' : ''})</div>
                <div style={{ marginTop: '0.35rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                  <span style={{ color: '#81c784' }}>Model payout total: ${pricingSummary.modelTotal}</span>
                  <span style={{ color: '#667eea' }}>Pro fee total: ${pricingSummary.proTotal}</span>
                  <span style={{ color: '#f5c16c' }}>Modeled revenue: ${pricingSummary.modeledRevenue}</span>
                  {pricingSummary.estimatedSessionGross > 0 && (
                    <span style={{ color: 'rgba(255,255,255,0.75)' }}>Estimated session gross: ${pricingSummary.estimatedSessionGross}</span>
                  )}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em', marginTop: '0.3rem' }}>Conversation Discovery (saved in CRM notes)</div>
              <input value={createForm.goalPrimary} onChange={(e) => setCreateForm({ ...createForm, goalPrimary: e.target.value })} placeholder="Primary goal for this request (portfolio, training, campaign, content)" style={{ ...styles.selectorSelect, gridColumn: '1 / -1' }} />
              <textarea value={createForm.educationFocus} onChange={(e) => setCreateForm({ ...createForm, educationFocus: e.target.value })} placeholder="Current education/training focus from pro conversation" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 72 }} />
              <textarea value={createForm.knownChallenges} onChange={(e) => setCreateForm({ ...createForm, knownChallenges: e.target.value })} placeholder="Known challenges or constraints shared by stylist/salon" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 72 }} />
              <textarea value={createForm.mustAvoid} onChange={(e) => setCreateForm({ ...createForm, mustAvoid: e.target.value })} placeholder="Must avoid / non-negotiables" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 72 }} />
              <textarea value={createForm.desiredOutcome} onChange={(e) => setCreateForm({ ...createForm, desiredOutcome: e.target.value })} placeholder="Desired outcome and success metric for this request" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 72 }} />
              <textarea value={createForm.conversationNotes} onChange={(e) => setCreateForm({ ...createForm, conversationNotes: e.target.value })} placeholder="Anecdotal conversation notes for CRM context" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 90 }} />
              <textarea value={createForm.serviceDescription} onChange={(e) => setCreateForm({ ...createForm, serviceDescription: e.target.value })} placeholder="Service brief for models (what this request is for)" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 80 }} />
              <textarea value={createForm.adminNotes} onChange={(e) => setCreateForm({ ...createForm, adminNotes: e.target.value })} placeholder="Internal admin notes (not shown to model)" style={{ ...styles.selectorSelect, gridColumn: '1 / -1', minHeight: 70 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1rem' }}>
              <button onClick={() => setShowCreateModal(false)} disabled={creatingRequest} style={styles.viewBtn}>Cancel</button>
              <button
                onClick={handleCreateRequest}
                disabled={creatingRequest || !createRequestReadiness.canCreate}
                title={!createRequestReadiness.canCreate ? `Missing: ${createRequestReadiness.missing.join(', ')}` : ''}
                style={{
                  ...styles.matchBtn,
                  ...(creatingRequest || !createRequestReadiness.canCreate
                    ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' }
                    : {}),
                }}
              >
                {creatingRequest
                  ? 'Creating...'
                  : createRequestReadiness.canCreate
                    ? 'Create & Open Matching'
                    : 'Complete Required Fields'}
              </button>
            </div>
            {!createRequestReadiness.canCreate && (
              <div style={{ marginTop: '0.55rem', color: 'rgba(255,255,255,0.62)', fontSize: '0.78rem' }}>
                Required before request submit: {createRequestReadiness.missing.join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

