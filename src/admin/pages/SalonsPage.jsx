import React, { useState } from 'react';
import { useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import PartnerDetailModal from '../components/PartnerDetailModal';
import GalleryTagFilter from '../../components/GalleryTagFilter';
import { PARTNER_TAG_CATEGORIES, partnerToTags, partnerMatchesTags } from '../../utils/partnerTags';
import { shouldUseMockData } from '../../utils/mockDataService';
import { normalizeApprovalStatus } from '../utils/approvalStatus';
import { PARTNER_DRAFTS } from '../data/partnerDrafts';
import { mapPartnerToCard, mapDraftToCard, resolvePartnerForModal } from '../../utils/partnerProfile';

const APPROVAL_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'manual_review', label: 'Manual review' },
  { id: 'needs_changes', label: 'Needs changes' },
  { id: 'approved', label: 'Approved' },
];

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch (e) { client = null; }

const draftCards = PARTNER_DRAFTS.map(mapDraftToCard).filter(Boolean);

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
  
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  cardImage: {
    height: '120px',
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  cardBody: { padding: '1.25rem' },
  salonName: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem' },
  salonType: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' },
  salonInfo: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' },
  
  stats: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  stat: { textAlign: 'center', flex: 1 },
  statValue: { fontSize: '1.1rem', fontWeight: '600', color: '#e94560' },
  statLabel: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' },
  
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  draftBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: 'rgba(102,126,234,0.25)',
    color: '#9aaeff',
    marginLeft: '0.35rem',
  },
  locationChip: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '0.35rem',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    marginTop: '0.5rem',
  },
  tagChip: {
    padding: '0.2rem 0.55rem',
    borderRadius: '12px',
    fontSize: '0.68rem',
    border: '1px solid rgba(255,255,255,0.15)',
    color: 'rgba(255,255,255,0.7)',
  },
};

const mockSalons = [
  { id: 1, name: 'Luxe Studio', type: 'Salon', address: '123 Main St, NYC', stylists: 5, bookings: 42, rating: 4.9, status: 'active', locationCount: 1 },
  { id: 2, name: 'The Cut Collective', type: 'Studio', address: '456 Broadway, NYC', stylists: 3, bookings: 28, rating: 4.7, status: 'active', locationCount: 1 },
  { id: 3, name: 'Color Theory', type: 'Salon', address: '789 5th Ave, NYC', stylists: 4, bookings: 56, rating: 5.0, status: 'active', locationCount: 3 },
  { id: 4, name: 'Modern Mane', type: 'Salon', address: '321 Park Ave, NYC', stylists: 6, bookings: 35, rating: 4.6, status: 'active', locationCount: 1 },
  { id: 5, name: 'Glow Up Studio', type: 'Studio', address: '654 Lexington, NYC', stylists: 2, bookings: 18, rating: 4.8, status: 'active', locationCount: 1 },
  { id: 6, name: 'The Hair Lab', type: 'School', address: '987 Madison, NYC', stylists: 12, bookings: 89, rating: 4.5, status: 'active', locationCount: 2 },
  { id: 7, name: 'Serenity Spa', type: 'Spa', address: '111 Wellness Blvd, NYC', stylists: 8, bookings: 62, rating: 4.9, status: 'active', locationCount: 1 },
  { id: 8, name: 'Bliss Beauty Spa', type: 'Spa', address: '222 Relaxation Way, NYC', stylists: 4, bookings: 45, rating: 4.7, status: 'active', locationCount: 4 },
];

// Helper to get top performers
const getTopPerformers = (partners, count = 3) => {
  return [...partners]
    .filter(p => p.rating !== null && p.rating !== undefined)
    .sort((a, b) => {
      // Sort by rating first, then by bookings
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.bookings - a.bookings;
    })
    .slice(0, count);
};

export default function SalonsPage() {
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const refreshPartners = async () => {
    if (shouldUseMockData() || !client?.models?.Partner) {
      setPartners([...draftCards, ...mockSalons.map((s) => ({ ...s, _db: null }))]);
      return;
    }
    try {
      const { data, errors } = await client.models.Partner.list({ limit: 200 });
      if (!errors?.length && data) {
        const dbCards = (data || []).map(mapPartnerToCard);
        const dbSlugs = new Set(dbCards.map((c) => c.slug).filter(Boolean));
        const draftsNotInDb = draftCards.filter((d) => !dbSlugs.has(d.slug));
        setPartners([...draftsNotInDb, ...dbCards]);
      }
    } catch (err) {
      console.error('Refresh partners failed:', err);
    }
  };

  const updatePartnerStatus = async (partner, nextStatus, e) => {
    e?.stopPropagation?.();
    const partnerId = partner?._db?.id || partner?.id;
    if (!partnerId || shouldUseMockData() || !client?.models?.Partner) return;
    try {
      await client.models.Partner.update({ id: partnerId, status: nextStatus });
      await refreshPartners();
    } catch (err) {
      console.error('Failed to update partner status:', err);
      alert(`Could not update status: ${err.message}`);
    }
  };

  useEffect(() => {
    let mounted = true;
    async function loadPartners() {
      if (shouldUseMockData() || !client?.models?.Partner) {
        const mock = mockSalons.map((s) => ({ ...s, _db: null }));
        if (mounted) setPartners([...draftCards, ...mock]);
        setLoading(false);
        return;
      }
      try {
        const { data, errors } = await client.models.Partner.list({ limit: 200 });
        if (errors?.length) throw new Error(errors[0]?.message);
        const dbCards = (data || []).map(mapPartnerToCard);
        const dbSlugs = new Set(dbCards.map((c) => c.slug).filter(Boolean));
        const draftsNotInDb = draftCards.filter((d) => !dbSlugs.has(d.slug));
        if (mounted) setPartners([...draftsNotInDb, ...dbCards]);
      } catch (err) {
        console.error('Failed to load partners, using mock:', err);
        if (mounted) setPartners([...draftCards, ...mockSalons.map((s) => ({ ...s, _db: null }))]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPartners();
    return () => { mounted = false; };
  }, []);
  
  // Filter partners
  const filteredSalons = partners.filter(salon => {
    // Search filter
    const name = salon.name.toLowerCase();
    const address = (salon.address || '').toLowerCase();
    const matchesSearch = !searchTerm || 
      name.includes(searchTerm.toLowerCase()) ||
      address.includes(searchTerm.toLowerCase());
    
    // Tag filter
    const matchesTags = partnerMatchesTags(salon, selectedTags);
    const normalizedStatus = normalizeApprovalStatus(salon.status);
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'manual_review'
        ? normalizedStatus === 'manual_review' || normalizedStatus === 'rejected'
        : normalizedStatus === activeTab);
    return matchesSearch && matchesTags && matchesTab;
  });
  
  // Convert salons to "photo-like" format for filter component
  const salonsAsPhotos = partners.map(salon => ({
    id: salon.id,
    tags: partnerToTags(salon),
  }));
  
  const topPerformers = getTopPerformers(filteredSalons, 3);
  
  const handlePartnerClick = (card) => {
    setSelectedPartner(resolvePartnerForModal(card));
    setShowDetailModal(true);
  };
  
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedPartner(null);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'rgba(255,255,255,0.6)' }}>
          Loading partners...
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Salons & Partners 🏢</h1>
          <p style={styles.subtitle}>Partner locations and studios</p>
        </div>
        <div style={styles.headerActions}>
          <input
            type="text"
            placeholder="Search salons..."
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
            <div style={styles.filterPanelTitle}>Filter Partners by Attributes</div>
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
            photos={salonsAsPhotos}
            tagCategories={PARTNER_TAG_CATEGORIES}
            title="Filter Partners"
          />
        </div>
      )}

      {/* Top Performers Banner */}
      {topPerformers.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
          border: '1px solid rgba(233,69,96,0.3)',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
        }}>
          <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>⭐ Top Performers</div>
          {topPerformers.map((salon, i) => (
            <div key={salon.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : '#cd7f32',
                color: '#000',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: '700',
              }}>#{i + 1}</span>
              <span>{salon.name}</span>
              <span style={{ color: '#e94560', fontWeight: '600' }}>{salon.rating}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {APPROVAL_FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #e94560' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === tab.id ? 'rgba(233,69,96,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#e94560' : 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      {(selectedTags.length > 0 || searchTerm || activeTab !== 'all') && (
        <div style={{ 
          marginBottom: '1rem', 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '0.9rem' 
        }}>
          Showing {filteredSalons.length} of {partners.length} partners
        </div>
      )}

      <div style={styles.grid}>
        {filteredSalons.map(salon => (
            <div 
              key={salon.id} 
              style={{ ...styles.card, cursor: 'pointer' }}
              onClick={() => handlePartnerClick(salon)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,30,63,0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
            <div style={styles.cardImage}>🏢</div>
            <div style={styles.cardBody}>
              <div style={styles.salonName}>
                {salon.name}
                {salon.isDraft && <span style={styles.draftBadge}>Draft · review</span>}
              </div>
              <div style={styles.salonType}>{salon.type}</div>
              {salon.locationLabel && <div style={styles.locationChip}>{salon.locationLabel}</div>}
              <div style={styles.salonInfo}>📍 {salon.address}</div>
              {salon.phone && <div style={styles.salonInfo}>📞 {salon.phone}</div>}
              {salon.tags?.length > 0 && (
                <div style={styles.tagRow}>
                  {salon.tags.slice(0, 4).map((tag) => (
                    <span key={tag} style={styles.tagChip}>{tag.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              )}
              <span style={{
                ...styles.badge,
                ...(normalizeApprovalStatus(salon.status) === 'approved' || salon.status === 'active'
                  ? {}
                  : { background: 'rgba(255,193,7,0.2)', color: '#ffc107' }),
              }}>
                {normalizeApprovalStatus(salon.status).replace('_', ' ')}
              </span>

              <div
                style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'rgba(76,175,80,0.25)',
                    color: '#4caf50',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => updatePartnerStatus(salon, 'active', e)}
                >
                  Approve
                </button>
                <button
                  type="button"
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,193,7,0.4)',
                    background: 'transparent',
                    color: '#ffc107',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => updatePartnerStatus(salon, 'manual_review', e)}
                >
                  Review
                </button>
              </div>
              
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{salon.stylists}</div>
                  <div style={styles.statLabel}>Stylists</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{salon.bookings}</div>
                  <div style={styles.statLabel}>Bookings</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>{salon.rating}</div>
                  <div style={styles.statLabel}>Rating</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* CRM Detail Modal */}
      {showDetailModal && selectedPartner && (
        <PartnerDetailModal
          partner={selectedPartner}
          onClose={handleCloseModal}
          onUpdate={async () => {
            await refreshPartners();
            handleCloseModal();
          }}
        />
      )}
    </div>
  );
}

