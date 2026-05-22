import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { getServiceById } from '../data/services';
import { createRequest, updateRequestStatus } from '../../utils/requestService';
import WorkflowProgress from '../../components/workflow/WorkflowProgress';
import { getWorkflowStage } from '../../utils/workflowState';
import { getProfessionalById } from '../../utils/profileService';
import {
  getMockRequests,
  shouldUseMockData,
} from '../../utils/mockDataService';
import {
  loadAdminProfessionalOptions,
  resolveProfessionalIdForRequest,
  resolveProfessionalIdFromSearchParams,
  getAdminProfessionalProfile,
} from '../../utils/adminProfessionalOptions';
import AdminRequestIntakeModal, { INITIAL_REQUEST_FORM } from '../components/AdminRequestIntakeModal';
import {
  valueForDb,
  serializeExtendedCriteria,
  serializeSchedulingNotes,
  resolveRequestDateTime,
  validateIntakeScheduling,
} from '../../utils/requestIntakeOptions';

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
  const [createForm, setCreateForm] = useState({ ...INITIAL_REQUEST_FORM });

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
    const professionalId = resolveProfessionalIdFromSearchParams(params);
    if (shouldOpenCreate) {
      setShowCreateModal(true);
      if (professionalId) {
        setCreateForm((prev) => ({
          ...prev,
          professionalId,
          serviceType: professionalId.includes('scott') ? 'haircut' : prev.serviceType,
          stylistLevel: professionalId.includes('scott') ? 'senior' : prev.stylistLevel,
        }));
      }
    }
  }, [location.search]);

  const loadProfessionalOptions = async () => {
    const { options, byId } = await loadAdminProfessionalOptions();
    setProfessionalProfilesById(byId);
    setProfessionalOptions(options);
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
              professional =
                getAdminProfessionalProfile(req.professionalId, professionalProfilesById) ||
                (await getProfessionalById(req.professionalId));
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
          const professional =
            getAdminProfessionalProfile(req.professionalId, professionalProfilesById) ||
            (await getProfessionalById(req.professionalId));
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
    if (!createForm.professionalId || !createForm.serviceType) {
      alert('Please choose a stylist and service.');
      return;
    }
    const sched = validateIntakeScheduling(createForm);
    if (!sched.ok) {
      alert(`Please complete scheduling: ${sched.missing.join(', ')}`);
      return;
    }
    try {
      setCreatingRequest(true);
      const { resolveProfessionalIdForIntake } = await import(
        '../../utils/resolveIntakeProfessional'
      );
      const { professionalId: resolvedProId, publishWarning } = await resolveProfessionalIdForIntake(
          createForm.professionalId,
          professionalProfilesById
        );

      const { requestedDate, requestedTime } = resolveRequestDateTime(createForm);
      if (!requestedDate) {
        throw new Error('Could not resolve a date for this request. Check scheduling fields.');
      }

      const criteriaBlob = serializeExtendedCriteria(createForm);
      const schedulingNote = serializeSchedulingNotes(createForm);
      const discoveryNotes = [
        createForm.requestTitle ? `Request title: ${createForm.requestTitle}` : null,
        `Model count needed: ${Number(createForm.modelCount) || 1}`,
        `Stylist level target: ${createForm.stylistLevel || 'all_levels'}`,
        schedulingNote,
        createForm.adminNotes ? `Admin notes: ${createForm.adminNotes}` : null,
        criteriaBlob || null,
      ].filter(Boolean).join('\n');

      let created = await createRequest({
        professionalId: resolvedProId,
        serviceType: createForm.serviceType,
        serviceDescription: createForm.serviceDescription
          ? `${createForm.serviceDescription}\n\nModels needed: ${Number(createForm.modelCount) || 1}\nStylist level: ${createForm.stylistLevel || 'senior'}`
          : `Models needed: ${Number(createForm.modelCount) || 1}`,
        desiredHairColor: valueForDb('color', createForm.desiredHairColor),
        desiredHairLength: valueForDb('length', createForm.desiredHairLength),
        desiredHairTexture: valueForDb('texture', createForm.desiredHairTexture),
        desiredHairCondition: valueForDb('condition', createForm.desiredHairCondition),
        requestedDate,
        requestedTime,
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
        const proId = resolvedProId;
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
      setCreateForm({
        ...INITIAL_REQUEST_FORM,
        professionalId: resolvedProId,
      });
      await loadProfessionalOptions();
      if (created?.id) {
        if (notices.length) {
          alert(
            `Request created (id: ${created.id}).\n\n${notices.join('\n\n')}\n\nOpening matching now.`
          );
        }
        navigate(`/admin/match-approval?requestId=${created.id}`);
      } else {
        alert('Request was processed but no id was returned. Check the request queue.');
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

      <AdminRequestIntakeModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRequest}
        creating={creatingRequest}
        form={createForm}
        setForm={setCreateForm}
        professionalOptions={professionalOptions}
        professionalProfilesById={professionalProfilesById}
        modelProfilesForPreview={modelProfilesForPreview}
        getServiceById={getServiceById}
      />
    </div>
  );
}

