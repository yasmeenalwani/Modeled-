import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import ProfessionalDetailModal from '../components/ProfessionalDetailModal';
import GalleryTagFilter from '../../components/GalleryTagFilter';
import { PROFESSIONAL_TAG_CATEGORIES, professionalToTags, professionalMatchesTags } from '../../utils/professionalTags';
import { shouldUseMockData } from '../../utils/mockDataService';

const LOCAL_PRO_SUBMISSIONS_KEY = 'modeled_local_professional_submissions';
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

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch (e) { client = null; }

/** Map Professional from DB to card format (compatible with mockProfessionals) */
function mapProfessionalToCard(pro) {
  if (!pro) return null;
  const fallbackNameFromEmail = pro.email ? pro.email.split('@')[0] : '';
  const name = `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || fallbackNameFromEmail || 'Unknown';
  const salonDisplay =
    pro.salonName ||
    [pro.salonCity, pro.salonState].filter(Boolean).join(', ') ||
    pro.locationZip ||
    '—';
  const levelDisplay = (() => {
    const raw = (pro.experienceLevel || '').toLowerCase();
    if (!raw) return '—';
    if (raw === 'student') return 'Student';
    if (raw === 'apprentice') return 'Apprentice';
    if (raw === 'junior') return 'Junior';
    if (raw === 'senior') return 'Senior';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();
  return {
    id: pro.id,
    name,
    salon: salonDisplay,
    specialties: pro.specialties || [],
    level: levelDisplay,
    status: pro.status || 'pending',
    requests: 0,
    bookings: 0,
    rating: null,
    trainingProgress: {},
    // Keep DB fields for modal
    _db: pro,
  };
}

const styles = {
  container: { padding: '2rem' },
  header: { 
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
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
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
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
    background: 'rgba(102,126,234,0.2)',
    color: '#8ea0ff',
  },
  
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
  statNumber: { fontSize: '1.5rem', fontWeight: '700', color: '#667eea' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  
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
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  name: { fontSize: '1.1rem', fontWeight: '600' },
  salon: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  
  specialties: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  tag: {
    padding: '0.25rem 0.6rem',
    background: 'rgba(102,126,234,0.2)',
    borderRadius: '15px',
    fontSize: '0.7rem',
    color: '#667eea',
  },
  
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  stat: {},
  statValue: { fontSize: '1rem', fontWeight: '600' },
  statName: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' },
  
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  badgeActive: { background: 'rgba(76,175,80,0.2)', color: '#4caf50' },
  badgePending: { background: 'rgba(255,193,7,0.2)', color: '#ffc107' },
};

const mockProfessionals = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    salon: 'Luxe Studio',
    specialties: ['Balayage', 'Color', 'Highlights'],
    level: 'Senior',
    status: 'active',
    requests: 12,
    bookings: 8,
    rating: 4.9,
    trainingProgress: {
      color: { certified: true, certifiedAt: '2024-08-15' },
      highlights: { certified: true, certifiedAt: '2024-09-20' },
      blowdry: { certified: true, certifiedAt: '2024-07-10' },
    },
  },
  {
    id: 2,
    name: 'Mike Thompson',
    salon: 'The Cut Collective',
    specialties: ['Blowouts', 'Styling', 'Updos'],
    level: 'Junior',
    status: 'active',
    requests: 5,
    bookings: 3,
    rating: 4.7,
    trainingProgress: {
      blowdry: { certified: true, certifiedAt: '2024-10-05' },
      haircut: { certified: false },
    },
  },
  {
    id: 3,
    name: 'Lisa Kim',
    salon: 'Color Theory',
    specialties: ['Color Correction', 'Vivid Colors'],
    level: 'Senior',
    status: 'active',
    requests: 18,
    bookings: 15,
    rating: 5.0,
    trainingProgress: {
      color: { certified: true, certifiedAt: '2024-06-15' },
      highlights: { certified: true, certifiedAt: '2024-07-01' },
      gloss: { certified: true, certifiedAt: '2024-08-20' },
    },
  },
  {
    id: 4,
    name: 'James Wilson',
    salon: 'Modern Mane',
    specialties: ['Precision Cuts', 'Fades'],
    level: 'Apprentice',
    status: 'pending',
    requests: 2,
    bookings: 0,
    rating: null,
    trainingProgress: {
      haircut: { certified: false },
    },
  },
  {
    id: 5,
    name: 'Emily Chen',
    salon: 'Glow Up Studio',
    specialties: ['Makeup', 'Bridal'],
    level: 'Junior',
    status: 'active',
    requests: 7,
    bookings: 5,
    rating: 4.8,
    trainingProgress: {
      blowdry: { certified: true, certifiedAt: '2024-09-10' },
    },
  },
  {
    id: 6,
    name: 'David Park',
    salon: 'The Hair Lab',
    specialties: ['Extensions', 'Treatments'],
    level: 'Senior',
    status: 'active',
    requests: 9,
    bookings: 7,
    rating: 4.6,
    trainingProgress: {
      haircut: { certified: true, certifiedAt: '2024-05-20' },
      color: { certified: true, certifiedAt: '2024-06-30' },
      keratin: { certified: true, certifiedAt: '2024-08-15' },
    },
  },
];

// Helper to get top performers
const getTopPerformers = (professionals, count = 3) => {
  return [...professionals]
    .filter(p => p.rating !== null && p.rating !== undefined)
    .sort((a, b) => {
      // Sort by rating first, then by booking success rate
      if (b.rating !== a.rating) return b.rating - a.rating;
      const aSuccess = a.requests > 0 ? (a.bookings / a.requests) * 100 : 0;
      const bSuccess = b.requests > 0 ? (b.bookings / b.requests) * 100 : 0;
      return bSuccess - aSuccess;
    })
    .slice(0, count);
};

export default function ProfessionalsPage() {
  const navigate = useNavigate();
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let mounted = true;
    const getLocalMirrors = () => {
      try {
        const raw = localStorage.getItem(LOCAL_PRO_SUBMISSIONS_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const mergeWithLocalMirrors = (list) => {
      const mirrors = getLocalMirrors();
      const merged = [...(list || [])]; // raw DB records
      const seen = new Set(
        merged.map((p) => p?.id || p?.userId || p?.email).filter(Boolean)
      );
      mirrors.forEach((p) => {
        const key = p?.id || p?.userId || p?.email;
        if (!key || seen.has(key)) return;
        seen.add(key);
        merged.unshift(p);
      });
      return merged;
    };

    const toCards = (records) => (records || []).map((p) => mapProfessionalToCard(p)).filter(Boolean);

    async function loadProfessionals() {
      if (shouldUseMockData() || !client?.models?.Professional) {
        const mockAsRaw = mockProfessionals.map((p, idx) => ({
          id: p.id?.toString?.() || `mock-pro-${idx + 1}`,
          firstName: p.name?.split(' ')[0] || 'Pro',
          lastName: p.name?.split(' ').slice(1).join(' ') || '',
          email: `${(p.name || `pro${idx + 1}`).toLowerCase().replace(/\s+/g, '')}@mock.local`,
          salonName: p.salon || null,
          specialties: p.specialties || [],
          experienceLevel: (p.level || '').toLowerCase(),
          status: p.status || 'pending',
          _fromMock: true,
        }));
        const merged = mergeWithLocalMirrors(mockAsRaw);
        setProfessionals(toCards(merged));
        setLoading(false);
        return;
      }
      try {
        const { data, errors } = await client.models.Professional.list({ limit: 200 });
        if (errors?.length) throw new Error(errors[0]?.message);
        if (mounted) {
          const merged = mergeWithLocalMirrors(data || []);
          setProfessionals(toCards(merged));
        }
      } catch (err) {
        console.error('Failed to load professionals, using mock:', err);
        if (mounted) {
          const mockAsRaw = mockProfessionals.map((p, idx) => ({
            id: p.id?.toString?.() || `mock-pro-${idx + 1}`,
            firstName: p.name?.split(' ')[0] || 'Pro',
            lastName: p.name?.split(' ').slice(1).join(' ') || '',
            email: `${(p.name || `pro${idx + 1}`).toLowerCase().replace(/\s+/g, '')}@mock.local`,
            salonName: p.salon || null,
            specialties: p.specialties || [],
            experienceLevel: (p.level || '').toLowerCase(),
            status: p.status || 'pending',
            _fromMock: true,
          }));
          const merged = mergeWithLocalMirrors(mockAsRaw);
          setProfessionals(toCards(merged));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProfessionals();
    return () => { mounted = false; };
  }, []);

  const refreshProfessionals = async () => {
    if (shouldUseMockData() || !client?.models?.Professional) return;
    try {
      const { data, errors } = await client.models.Professional.list({ limit: 200 });
      if (!errors?.length && data) {
        let mirrors = [];
        try {
          const raw = localStorage.getItem(LOCAL_PRO_SUBMISSIONS_KEY);
          mirrors = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(mirrors)) mirrors = [];
        } catch {
          mirrors = [];
        }
        const merged = [...data];
        const seen = new Set(merged.map((p) => p?.id || p?.userId || p?.email).filter(Boolean));
        mirrors.forEach((p) => {
          const key = p?.id || p?.userId || p?.email;
          if (!key || seen.has(key)) return;
          seen.add(key);
          merged.unshift(p);
        });
        setProfessionals(merged.map((p) => mapProfessionalToCard(p)).filter(Boolean));
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  };

  const updateProfessionalStatus = async (professional, nextStatus, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    const proId = professional?._db?.id || professional?.id;
    if (!proId || shouldUseMockData() || !client?.models?.Professional) return;
    try {
      await client.models.Professional.update({
        id: proId,
        status: nextStatus,
      });
      await refreshProfessionals();
    } catch (err) {
      console.error('Failed to update professional status:', err);
    }
  };

  const handleProfessionalClick = (professional) => {
    // Use _db (real Professional) when available, else build from mock format
    const proData = professional._db || {
      id: professional.id.toString(),
      firstName: professional.name?.split(' ')[0] || '',
      lastName: professional.name?.split(' ').slice(1).join(' ') || '',
      email: professional.email || `${(professional.name || '').toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: professional.phone || null,
      specialties: professional.specialties || [],
      experienceLevel: (professional.level || '').toLowerCase(),
      licenseNumber: null,
      salonName: professional.salon || '',
      salonAddress: null,
      instagramHandle: null,
      status: professional.status || 'pending',
      adminNotes: null,
    };
    setSelectedProfessional(proData);
    setShowDetailModal(true);
  };

  const handleQuickCreateRequest = (professional, e) => {
    e.preventDefault();
    e.stopPropagation();
    const professionalId = professional?._db?.id || professional?.id;
    if (!professionalId) return;
    navigate(`/admin/requests?create=1&professionalId=${encodeURIComponent(professionalId)}`);
  };
  
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedProfessional(null);
  };

  // Filter professionals
  const filteredProfessionals = professionals.filter(professional => {
    // Search filter
    const fullName = (professional.name || '').toLowerCase();
    const salonName = (professional.salon || '').toLowerCase();
    const matchesSearch = !searchTerm || 
      fullName.includes(searchTerm.toLowerCase()) ||
      salonName.includes(searchTerm.toLowerCase());
    
    // Tag filter
    const matchesTags = professionalMatchesTags(professional, selectedTags);
    
    const normalizedStatus = normalizeApprovalStatus(professional.status);
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'manual_review'
        ? normalizedStatus === 'manual_review' || normalizedStatus === 'rejected'
        : normalizedStatus === activeTab);
    return matchesSearch && matchesTags && matchesTab;
  });
  
  // Convert professionals to "photo-like" format for filter component
  const professionalsAsPhotos = professionals.map(pro => ({
    id: pro.id,
    tags: professionalToTags(pro),
  }));
  
  const topPerformers = getTopPerformers(filteredProfessionals, 3);

  const stats = {
    total: professionals.length,
    active: professionals.filter(p => ['approved', 'active'].includes(normalizeApprovalStatus(p.status))).length,
    pending: professionals.filter(p => normalizeApprovalStatus(p.status) === 'pending_review').length,
    totalRequests: professionals.reduce((sum, p) => sum + (p.requests || 0), 0),
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'rgba(255,255,255,0.6)' }}>
          Loading professionals...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Professionals ✂️</h1>
          <p style={styles.subtitle}>Beauty pros looking for models</p>
        </div>
        <div style={styles.headerActions}>
          <input
            type="text"
            placeholder="Search professionals..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button 
            style={{
              ...styles.filterBtn,
              ...(showFilterPanel ? { background: 'rgba(102,126,234,0.2)', borderColor: '#667eea' } : {}),
            }}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <span>{showFilterPanel ? '🔼' : '🔽'}</span> Filter
            {selectedTags.length > 0 && (
              <span style={{
                background: '#667eea',
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
            <div style={styles.filterPanelTitle}>Filter Professionals by Attributes</div>
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
            photos={professionalsAsPhotos}
            tagCategories={PROFESSIONAL_TAG_CATEGORIES}
            title="Filter Professionals"
          />
        </div>
      )}

      {/* Top Performers Banner */}
      {topPerformers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(102,126,234,0.05))',
          border: '1px solid rgba(102,126,234,0.3)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>⭐ Top Performers</div>
          {topPerformers.map((pro, i) => (
            <div key={pro.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32',
                color: '#000',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '700',
              }}>#{i + 1}</span>
              <span>{pro.name}</span>
              <span style={{ color: '#667eea', fontWeight: '600' }}>{pro.rating}</span>
            </div>
          ))}
        </div>
      )}

      {/* Results count */}
      {(selectedTags.length > 0 || searchTerm) && (
        <div style={{ 
          marginBottom: '1rem', 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '0.9rem' 
        }}>
          Showing {filteredProfessionals.length} of {professionals.length} professionals
        </div>
      )}

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
          </button>
        ))}
      </div>

      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Professionals</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.totalRequests}</div>
          <div style={styles.statLabel}>Total Requests</div>
        </div>
      </div>

      <div style={styles.grid}>
        {filteredProfessionals.map(pro => (
          <div 
            key={pro.id} 
            style={{ ...styles.card, cursor: 'pointer' }}
            onClick={() => handleProfessionalClick(pro)}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(102,126,234,0.5)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(102,126,234,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.cardHeader}>
              <div style={styles.avatar}>{pro.name?.charAt(0) || '?'}</div>
              <div>
                <div style={styles.name}>{pro.name}</div>
                <div style={styles.salon}>{pro.salon} • {pro.level}</div>
              </div>
            </div>

            <div style={styles.specialties}>
              {pro.specialties.map((spec, i) => (
                <span key={i} style={styles.tag}>{spec}</span>
              ))}
            </div>

            <span style={{
              ...styles.badge,
              ...(normalizeApprovalStatus(pro.status) === 'approved' ? styles.badgeActive : styles.badgePending),
            }}>
              {normalizeApprovalStatus(pro.status).replace('_', ' ')}
            </span>

            <div style={styles.stats}>
              <div style={styles.stat}>
                <div style={styles.statValue}>{pro.requests}</div>
                <div style={styles.statName}>Requests</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>{pro.bookings}</div>
                <div style={styles.statName}>Bookings</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>{pro.rating || '—'}</div>
                <div style={styles.statName}>Rating</div>
              </div>
              <div style={styles.stat}>
                <div style={styles.statValue}>{pro.bookings > 0 ? Math.round((pro.bookings / pro.requests) * 100) : 0}%</div>
                <div style={styles.statName}>Success</div>
              </div>
            </div>
            <button
              onClick={(e) => handleQuickCreateRequest(pro, e)}
              style={{
                marginTop: '0.9rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: 'linear-gradient(135deg, rgba(233,69,96,0.9), rgba(255,107,138,0.9))',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Create Request
            </button>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
              <button
                onClick={(e) => updateProfessionalStatus(pro, 'approved', e)}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.4rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(76,175,80,0.5)',
                  background: 'rgba(76,175,80,0.2)',
                  color: '#9ae2a3',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={(e) => updateProfessionalStatus(pro, 'needs_changes', e)}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.4rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,193,7,0.5)',
                  background: 'rgba(255,193,7,0.18)',
                  color: '#ffd56e',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Needs changes
              </button>
              <button
                onClick={(e) => updateProfessionalStatus(pro, 'rejected', e)}
                style={{
                  flex: 1,
                  padding: '0.35rem 0.4rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(244,67,54,0.5)',
                  background: 'rgba(244,67,54,0.18)',
                  color: '#ff9088',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* CRM Detail Modal */}
      {showDetailModal && selectedProfessional && (
        <ProfessionalDetailModal
          professional={selectedProfessional}
          onClose={handleCloseModal}
          onUpdate={() => {
            refreshProfessionals();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

