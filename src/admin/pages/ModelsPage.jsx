import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { mockModels, getTopPerformers } from '../../matching';
import { shouldUseMockData } from '../../utils/mockDataService';
import { resolveModelCoverPhoto } from '../../utils/modelPhotoResolver';
import { buildModelCardTags } from '../../utils/modelDisplayTags';
import ModelDetailModal from '../components/ModelDetailModal';
import ModelCoverImage from '../components/ModelCoverImage';
import GalleryTagFilter from '../../components/GalleryTagFilter';

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch (e) { client = null; }

/** Map ModelProfile from DB to UI format (compatible with mockModels) */
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

function mapAvailabilityByDayToLegacySlots(availabilityByDay) {
  const dayMap = {
    Mon: 'monday',
    Tue: 'tuesday',
    Wed: 'wednesday',
    Thu: 'thursday',
    Fri: 'friday',
    Sat: 'saturday',
    Sun: 'sunday',
  };
  const timeSlots = {
    morning: '9:00 AM',
    afternoon: '1:00 PM',
    evening: '6:00 PM',
  };

  return Object.entries(dayMap).reduce((acc, [shortDay, fullDay]) => {
    const selections = availabilityByDay?.[shortDay] || [];
    acc[fullDay] = selections
      .map((slot) => timeSlots[slot])
      .filter(Boolean);
    return acc;
  }, {});
}

function mapModelProfileToUI(profile) {
  if (!profile) return null;
  const favoriteService = safeParseJson(profile.favoriteService, {});
  const photoMetadata = safeParseJson(profile.photoMetadata, {});
  const servicePreferences = favoriteService?.preferences || [];
  const availabilityData = safeParseJson(profile.communityInterestsOther, {});
  const availabilityByDay = availabilityData?.availabilityByDay || {};
  const availability = mapAvailabilityByDayToLegacySlots(availabilityByDay);

  const hasHairPref = servicePreferences.some((s) => s.startsWith('hair_'));
  const hasColorPref = servicePreferences.includes('hair_color');
  const hasStylingPref = servicePreferences.some((s) =>
    ['hair_style', 'hair_extensions', 'hair_braids', 'hair_treatment', 'hair_transformation'].includes(s)
  );
  const hasBeautyPref = servicePreferences.some((s) => s.startsWith('beauty_'));

  let agentic = profile.agenticScores && typeof profile.agenticScores === 'object' ? { ...profile.agenticScores } : {};
  if (Object.keys(agentic).length === 0 && (profile.reliabilityScore != null || profile.feedbackScore != null)) {
    agentic = {
      reliability: profile.reliabilityScore ?? 0,
      feedback: profile.feedbackScore ?? 0,
      experience: profile.experienceScore ?? 0,
      engagement: profile.engagementScore ?? 0,
      compatibility: profile.compatibilityScore ?? 0,
    };
  }
  return {
    id: profile.id,
    userId: profile.userId || '',
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    locationZip: profile.locationZip || '',
    hairColor: profile.hairColorSimple || profile.hairColor || '—',
    hairLength: profile.hairLengthSimple || profile.hairLength || '—',
    hairTexture: profile.hairTextureSimple || profile.hairTexture || '—',
    hairCondition: profile.hairCondition || '—',
    hairDensity: profile.hairDensity,
    virginHair: profile.virginHair || false,
    skinTone: profile.skinToneSimple || profile.skinTone,
    eyeColor: profile.eyeColorSimple || profile.eyeColor,
    services: servicePreferences.length > 0 ? servicePreferences : (profile.servicesCompleted || []),
    status: profile.status || 'pending',
    agenticScores: agentic,
    totalBookings: (profile.servicesCompleted || []).length || 0,
    repeatBookings: profile.repeatBookings || 0,
    tags: profile.tags || [],
    availability,
    openToHaircut: profile.openToHaircut ?? hasHairPref,
    openToColor: profile.openToColor ?? hasColorPref,
    openToStyling: profile.openToStyling ?? hasStylingPref,
    openToMakeup: profile.openToMakeup ?? hasBeautyPref,
    servicePreferences,
    availabilityByDay,
    adminNotes: profile.adminNotes,
    identityVerificationStatus: profile.identityVerificationStatus,
    identityVerificationScore: profile.identityVerificationScore,
    idDocumentUrl: profile.idDocumentUrl,
    idDocumentType: profile.idDocumentType,
    verificationSelfieUrl: profile.verificationSelfieUrl,
    photoAnalysisStatus: profile.photoAnalysisStatus,
    photoUrls: Array.isArray(profile.photoUrls) ? profile.photoUrls : [],
    photoKeys: Array.isArray(profile.photoKeys) ? profile.photoKeys : [],
    photoMetadata,
    headshotUrl: profile.headshotUrl || null,
    favoriteService: profile.favoriteService,
    modelingFocus: favoriteService?.modelingFocus || '',
    mediaTraining: favoriteService?.mediaTraining || {},
    coverPhotoRef:
      profile.headshotUrl ||
      (Array.isArray(profile.photoUrls) && profile.photoUrls.length > 0 ? profile.photoUrls[0] : null),
    primaryPhotoUrl: null,
    displayTags: [],
  };
}

function modelReadyForMatching(model) {
  const status = String(model?.status || '').toLowerCase();
  const approved = ['active', 'approved'].includes(status);
  return approved && !!model?.email && !!model?.phone;
}

const APPROVAL_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'manual_review', label: 'Manual review' },
  { id: 'needs_changes', label: 'Needs changes' },
  { id: 'approved', label: 'Approved' },
];

const normalizeApprovalStatus = (status) => {
  const value = String(status || '').toLowerCase();
  if (!value) return 'pending_review';
  if (value === 'pending') return 'pending_review';
  if (value === 'active') return 'approved';
  return value;
};

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
  headerActions: {
    display: 'flex',
    gap: '1rem',
  },
  searchInput: {
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    width: '250px',
  },
  filterBtn: {
    padding: '0.6rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
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
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#e94560',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Card grid (matches Professionals aesthetic)
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1rem',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '0',
    objectFit: 'cover',
  },
  name: { fontSize: '1.06rem', fontWeight: '600' },
  coverFrame: {
    width: '100%',
    aspectRatio: '4 / 5',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '0.8rem',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverFallback: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '700',
  },
  focusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '14px',
    fontSize: '0.7rem',
    background: 'rgba(233,69,96,0.16)',
    color: '#ffb7c5',
    border: '1px solid rgba(233,69,96,0.35)',
    marginBottom: '0.6rem',
  },
  featuresRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.45rem',
  },
  featureChip: {
    padding: '0.2rem 0.55rem',
    borderRadius: '12px',
    fontSize: '0.72rem',
    border: '1px solid rgba(255,255,255,0.18)',
    color: 'rgba(255,255,255,0.82)',
    background: 'rgba(255,255,255,0.04)',
  },
  contactMeta: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.5rem',
    lineHeight: 1.45,
  },
  matchReady: {
    fontSize: '0.7rem',
    color: '#9ae2a3',
    marginBottom: '0.45rem',
    fontWeight: '600',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  badgeActive: { background: 'rgba(76,175,80,0.2)', color: '#4caf50' },
  badgePending: { background: 'rgba(255,193,7,0.2)', color: '#ffc107' },
  badgeInactive: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
  
  // Filter panel
  filterPanel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  filterPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  filterPanelTitle: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  filterPanelClose: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Helper to get score color
const getScoreColor = (score) => {
  if (score >= 90) return '#4caf50';
  if (score >= 75) return '#8bc34a';
  if (score >= 60) return '#ffc107';
  if (score >= 40) return '#ff9800';
  return '#f44336';
};

// Calculate average agentic score
const getAvgAgenticScore = (scores) => {
  if (!scores) return 0;
  const values = Object.values(scores).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!values.length) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
};

// Convert model attributes to tags for filtering
const modelToTags = (model) => {
  const tags = [];
  
  // Service tags
  if (model.services && Array.isArray(model.services)) {
    model.services.forEach(service => {
      tags.push(`service:${service}`);
    });
  }
  
  // Hair tags
  if (model.hairLength) tags.push(`hair:length:${model.hairLength}`);
  if (model.hairColor) tags.push(`hair:color:${model.hairColor}`);
  if (model.hairTexture) tags.push(`hair:texture:${model.hairTexture}`);
  if (model.hairDensity) tags.push(`hair:density:${model.hairDensity}`);
  if (model.hairCondition) tags.push(`hair:condition:${model.hairCondition}`);
  if (model.virginHair) tags.push('hair:condition:virgin');
  
  // Feature tags
  if (model.skinTone) tags.push(`features:skin:${model.skinTone}`);
  if (model.eyeColor) {
    // Map eye color to match tag format
    const eyeColorMap = {
      'brown': 'brown_eyes',
      'blue': 'blue_eyes',
      'green': 'green_eyes',
      'hazel': 'hazel_eyes',
      'gray': 'gray_eyes',
      'amber': 'amber_eyes',
    };
    const eyeTag = eyeColorMap[model.eyeColor.toLowerCase()] || `${model.eyeColor}_eyes`;
    tags.push(`features:eyes:${eyeTag}`);
  }
  
  return tags;
};

// Check if model matches selected tags
const modelMatchesTags = (model, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return true;
  
  const modelTags = modelToTags(model);
  if (modelTags.length === 0) return false;
  
  // Group selected tags by category
  const tagsByCategory = {};
  selectedTags.forEach(tag => {
    const parts = tag.split(':');
    const category = parts[0];
    if (!tagsByCategory[category]) {
      tagsByCategory[category] = [];
    }
    tagsByCategory[category].push(tag);
  });
  
  // For each category, check if model has at least one matching tag
  return Object.keys(tagsByCategory).every(category => {
    const categoryTags = tagsByCategory[category];
    
    return categoryTags.some(selectedTag => {
      return modelTags.some(modelTag => {
        if (modelTag === selectedTag) return true;
        
        const selectedParts = selectedTag.split(':');
        const modelParts = modelTag.split(':');
        
        if (selectedParts.length >= 2 && modelParts.length >= 2) {
          const selectedCategory = selectedParts[0];
          const selectedTagId = selectedParts[selectedParts.length - 1];
          const modelCategory = modelParts[0];
          const modelTagId = modelParts[modelParts.length - 1];
          
          return selectedCategory === modelCategory && selectedTagId === modelTagId;
        }
        
        return false;
      });
    });
  });
};

function getTopPerformersFromList(models, limit = 5) {
  return [...(models || [])]
    .map(m => ({
      ...m,
      avgAgenticScore: m.agenticScores && typeof m.agenticScores === 'object'
        ? Math.round(Object.values(m.agenticScores).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0) / 5) || 0
        : 0,
    }))
    .sort((a, b) => (b.avgAgenticScore || 0) - (a.avgAgenticScore || 0))
    .slice(0, limit);
}

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadModels() {
      if (shouldUseMockData() || !client?.models?.ModelProfile) {
        setModels(mockModels);
        setLoading(false);
        return;
      }
      try {
        const { data, errors } = await client.models.ModelProfile.list({ limit: 200 });
        if (errors?.length) throw new Error(errors[0]?.message);
        const mapped = (data || []).map(mapModelProfileToUI).filter(Boolean);
        const withPhotos = await Promise.all(
          mapped.map(async (model) => {
            const profile = (data || []).find((p) => p?.id === model.id);
            const primaryPhotoUrl = await resolveModelCoverPhoto(profile);
            return {
              ...model,
              primaryPhotoUrl,
              displayTags: buildModelCardTags(model),
            };
          })
        );
        if (mounted) setModels(withPhotos);
      } catch (err) {
        console.error('Failed to load models, using mock:', err);
        if (mounted) setModels(mockModels);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadModels();
    return () => { mounted = false; };
  }, []);

  const refreshModels = async () => {
    if (shouldUseMockData() || !client?.models?.ModelProfile) return;
    try {
      const { data, errors } = await client.models.ModelProfile.list({ limit: 200 });
      if (!errors?.length && data) {
        const mapped = data.map(mapModelProfileToUI).filter(Boolean);
        const withPhotos = await Promise.all(
          mapped.map(async (model) => {
            const profile = data.find((p) => p?.id === model.id);
            const primaryPhotoUrl = await resolveModelCoverPhoto(profile);
            return {
              ...model,
              primaryPhotoUrl,
              displayTags: buildModelCardTags(model),
            };
          })
        );
        setModels(withPhotos);
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const filteredModels = models.filter(model => {
    const fullName = `${model.firstName} ${model.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                          model.email.toLowerCase().includes(searchTerm.toLowerCase());
    const normalizedStatus = normalizeApprovalStatus(model.status);
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'manual_review'
        ? normalizedStatus === 'manual_review' || normalizedStatus === 'rejected'
        : normalizedStatus === activeTab);
    const matchesTags = modelMatchesTags(model, selectedTags);
    return matchesSearch && matchesTab && matchesTags;
  });
  
  // Convert models to "photo-like" format for the filter component
  const modelsAsPhotos = models.map(model => ({
    id: model.id,
    tags: modelToTags(model),
  }));
  
  const handleModelClick = (model) => {
    setSelectedModel(model);
    setShowDetailModal(true);
  };
  
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedModel(null);
  };

  const stats = {
    total: models.length,
    active: models.filter(m => ['approved', 'active'].includes(normalizeApprovalStatus(m.status))).length,
    pending: models.filter(m => normalizeApprovalStatus(m.status) === 'pending_review').length,
    totalBookings: models.reduce((sum, m) => sum + (m.totalBookings || 0), 0),
  };
  
  const topPerformers = getTopPerformersFromList(models, 3);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'rgba(255,255,255,0.6)' }}>
          Loading models...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Models Gallery 💄</h1>
          <p style={styles.subtitle}>Manage your model profiles and availability</p>
        </div>
        <div style={styles.headerActions}>
          <input
            type="text"
            placeholder="Search models..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            style={{
              ...styles.filterBtn,
              ...(showFilterPanel ? { background: 'rgba(233,69,96,0.2)', borderColor: '#e94560' } : {}),
            }}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <span>{showFilterPanel ? '🔼' : '🔽'}</span> Filter
            {selectedTags.length > 0 && (
              <span style={{
                background: '#e94560',
                color: '#fff',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                fontSize: '0.7rem',
                marginLeft: '0.25rem',
              }}>
                {selectedTags.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div style={styles.filterPanel}>
          <div style={styles.filterPanelHeader}>
            <div style={styles.filterPanelTitle}>Filter Models by Attributes</div>
            <button 
              style={styles.filterPanelClose}
              onClick={() => setShowFilterPanel(false)}
              onMouseOver={(e) => e.target.style.color = 'rgba(255,255,255,0.9)'}
              onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
            >
              ×
            </button>
          </div>
          <GalleryTagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            photos={modelsAsPhotos}
          />
        </div>
      )}

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Models</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Approval</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalBookings}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {APPROVAL_FILTERS.map((tab) => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'pending_review' && stats.pending > 0 && (
              <span style={{ 
                marginLeft: '0.5rem', 
                background: '#e94560', 
                color: '#fff',
                padding: '0.1rem 0.4rem',
                borderRadius: '10px',
                fontSize: '0.7rem',
              }}>
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Top Performers Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))',
        border: '1px solid rgba(76,175,80,0.3)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
      }}>
        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>⭐ Top Performers</div>
        {topPerformers.map((model, i) => (
          <div key={model.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32',
              color: '#000',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontWeight: '700',
            }}>#{i + 1}</span>
            <span>{model.firstName} {model.lastName}</span>
            <span style={{ color: '#4caf50', fontWeight: '600' }}>{model.avgAgenticScore}</span>
          </div>
        ))}
      </div>

      {/* Results count */}
      {(selectedTags.length > 0 || searchTerm) && (
        <div style={{ 
          marginBottom: '1rem', 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '0.9rem' 
        }}>
          Showing {filteredModels.length} of {models.length} models
        </div>
      )}

      {/* Card Grid (matches Professionals aesthetic, model context) */}
      <div style={styles.grid}>
        {filteredModels.map((model) => (
          <div 
            key={model.id} 
            style={{ ...styles.card, cursor: 'pointer' }}
            onClick={() => handleModelClick(model)}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(233,69,96,0.5)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(233,69,96,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.coverFrame}>
              <ModelCoverImage
                photoRef={model.primaryPhotoUrl || model.coverPhotoRef}
                name={`${model.firstName} ${model.lastName}`}
                style={styles.avatarImage}
                alt={`${model.firstName || 'Model'} cover`}
              />
            </div>
            <div style={{ ...styles.name, marginBottom: '0.35rem' }}>{model.firstName} {model.lastName}</div>
            <div style={styles.contactMeta}>
              {model.email && <div>{model.email}</div>}
              {model.phone && <div>{model.phone}</div>}
              {model.locationZip && <div>ZIP {model.locationZip}</div>}
            </div>
            {modelReadyForMatching(model) && (
              <div style={styles.matchReady}>✓ Ready for matching & notifications</div>
            )}
            <div style={styles.focusBadge}>
              {model.modelingFocus === 'editorial'
                ? 'Editorial'
                : model.modelingFocus === 'everyday'
                  ? 'Everyday'
                  : model.modelingFocus === 'both'
                    ? 'Everyday + Editorial'
                    : 'Focus not set'}
            </div>

            <div style={styles.featuresRow}>
              {(model.displayTags?.length ? model.displayTags : buildModelCardTags(model)).map((feature) => (
                <span key={feature} style={styles.featureChip}>
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* CRM Detail Modal */}
      {showDetailModal && selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={handleCloseModal}
          onUpdate={() => {
            refreshModels();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

