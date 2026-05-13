import React, { useState } from 'react';
import GalleryTagFilter from '../../components/GalleryTagFilter';
import { photoMatchesTags } from '../../utils/galleryTags';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#8b949e',
    fontSize: '0.95rem',
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(22,27,34,0.8)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#8b949e',
  },
  
  // Filters
  filtersRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(48,54,61,0.5)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '6px',
    color: '#8b949e',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(88,166,255,0.2)',
    borderColor: '#58a6ff',
    color: '#58a6ff',
  },
  searchInput: {
    padding: '0.6rem 1rem',
    background: 'rgba(48,54,61,0.5)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    width: '250px',
  },
  
  // Layout
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  filterSidebar: {
    position: 'sticky',
    top: '2rem',
  },
  
  // Photo grid
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
  },
  photoCard: {
    background: 'rgba(22,27,34,0.8)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  photoImage: {
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(88,166,255,0.2), rgba(31,111,235,0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoEmoji: {
    fontSize: '3rem',
  },
  photoBadges: {
    position: 'absolute',
    top: '0.5rem',
    left: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  photoBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  photoInfo: {
    padding: '0.75rem',
  },
  photoName: {
    fontWeight: '600',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
  },
  photoMeta: {
    fontSize: '0.75rem',
    color: '#8b949e',
  },
  
  // Modal
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.9)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  modalContent: {
    background: 'rgba(22,27,34,0.98)',
    border: '1px solid rgba(48,54,61,0.8)',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(48,54,61,0.8)',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    color: '#8b949e',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '1.5rem',
  },
  modalImage: {
    width: '100%',
    maxHeight: '500px',
    objectFit: 'contain',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    background: 'rgba(48,54,61,0.3)',
  },
  modalImagePlaceholder: {
    width: '100%',
    height: '400px',
    background: 'linear-gradient(135deg, rgba(88,166,255,0.2), rgba(31,111,235,0.2))',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '6rem',
    marginBottom: '1.5rem',
  },
  modalDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  detailItem: {
    background: 'rgba(48,54,61,0.3)',
    padding: '1rem',
    borderRadius: '8px',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#8b949e',
    marginBottom: '0.35rem',
  },
  detailValue: {
    fontWeight: '600',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#8b949e',
    gridColumn: '1 / -1',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
};

// Mock photo data with tags
const mockPhotos = [
  // Model profile photos
  { id: 1, type: 'profile', userType: 'model', name: 'Emma J.', date: 'Dec 5', service: null, emoji: '👩', url: null, tags: ['metadata:profile', 'features:face:oval', 'features:skin:fair'] },
  { id: 2, type: 'profile', userType: 'model', name: 'Sophia R.', date: 'Dec 4', service: null, emoji: '👩‍🦰', url: null, tags: ['metadata:profile', 'features:face:round', 'features:skin:medium'] },
  { id: 3, type: 'profile', userType: 'model', name: 'Olivia M.', date: 'Dec 3', service: null, emoji: '👱‍♀️', url: null, tags: ['metadata:profile', 'features:face:heart', 'features:skin:light'] },
  // Pro profile photos
  { id: 4, type: 'profile', userType: 'professional', name: 'Sarah M.', date: 'Dec 5', service: null, emoji: '💇‍♀️', url: null, tags: ['metadata:profile'] },
  { id: 5, type: 'profile', userType: 'professional', name: 'Michael T.', date: 'Dec 2', service: null, emoji: '💈', url: null, tags: ['metadata:profile'] },
  // Session photos
  { id: 6, type: 'session', subtype: 'before', userType: 'model', name: 'Emma J.', date: 'Dec 4', service: 'Balayage', serviceIcon: '🎨', emoji: '📷', url: null, tags: ['service:color', 'service:highlights', 'hair:length:long', 'hair:color:blonde', 'metadata:before'] },
  { id: 7, type: 'session', subtype: 'after', userType: 'model', name: 'Emma J.', date: 'Dec 4', service: 'Balayage', serviceIcon: '🎨', emoji: '✨', url: null, tags: ['service:color', 'service:highlights', 'hair:length:long', 'hair:color:blonde', 'metadata:after'] },
  { id: 8, type: 'session', subtype: 'before', userType: 'model', name: 'Sophia R.', date: 'Dec 3', service: 'Haircut', serviceIcon: '✂️', emoji: '📷', url: null, tags: ['service:haircut', 'hair:length:medium', 'hair:texture:straight', 'metadata:before'] },
  { id: 9, type: 'session', subtype: 'after', userType: 'model', name: 'Sophia R.', date: 'Dec 3', service: 'Haircut', serviceIcon: '✂️', emoji: '✨', url: null, tags: ['service:haircut', 'hair:length:short', 'hair:texture:straight', 'hair:style:bob', 'metadata:after'] },
  { id: 10, type: 'session', subtype: 'after', userType: 'model', name: 'Olivia M.', date: 'Dec 2', service: 'Blowout', serviceIcon: '💨', emoji: '✨', url: null, tags: ['service:blowdry', 'hair:length:medium', 'hair:texture:straight', 'hair:style:blowout', 'metadata:after'] },
  // Portfolio photos
  { id: 11, type: 'portfolio', userType: 'professional', name: 'Sarah M.', date: 'Dec 4', service: 'Color', serviceIcon: '🎨', emoji: '🎨', url: null, tags: ['service:color', 'hair:length:long', 'hair:color:colored', 'metadata:after'] },
  { id: 12, type: 'portfolio', userType: 'professional', name: 'Sarah M.', date: 'Dec 3', service: 'Balayage', serviceIcon: '🎨', emoji: '🌟', url: null, tags: ['service:color', 'service:highlights', 'hair:length:long', 'hair:color:blonde', 'metadata:after'] },
  { id: 13, type: 'portfolio', userType: 'professional', name: 'Michael T.', date: 'Dec 2', service: 'Haircut', serviceIcon: '✂️', emoji: '✂️', url: null, tags: ['service:haircut', 'hair:length:short', 'hair:texture:curly', 'metadata:after'] },
  // Salon photos
  { id: 14, type: 'salon', userType: 'partner', name: 'Luxe Studio', date: 'Dec 1', service: null, emoji: '🏢', url: null, tags: ['metadata:salon'] },
  { id: 15, type: 'salon', userType: 'partner', name: 'Glow Salon', date: 'Nov 30', service: null, emoji: '💅', url: null, tags: ['metadata:salon'] },
];

export default function PhotosPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Filter photos
  const filteredPhotos = mockPhotos.filter(photo => {
    // Type filter
    if (typeFilter !== 'all' && photo.type !== typeFilter) return false;
    // User filter
    if (userFilter !== 'all' && photo.userType !== userFilter) return false;
    // Search
    if (searchQuery && !photo.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Tag filter
    if (selectedTags.length > 0 && !photoMatchesTags(photo, selectedTags)) return false;
    return true;
  });

  // Stats
  const stats = {
    total: mockPhotos.length,
    profile: mockPhotos.filter(p => p.type === 'profile').length,
    session: mockPhotos.filter(p => p.type === 'session').length,
    portfolio: mockPhotos.filter(p => p.type === 'portfolio').length,
    salon: mockPhotos.filter(p => p.type === 'salon').length,
  };

  // Get badge color
  const getBadgeStyle = (photo) => {
    const baseStyle = { ...styles.photoBadge };
    if (photo.type === 'profile') {
      return { ...baseStyle, background: 'rgba(88,166,255,0.8)', color: '#fff' };
    }
    if (photo.type === 'session') {
      if (photo.subtype === 'before') {
        return { ...baseStyle, background: 'rgba(139,148,158,0.8)', color: '#fff' };
      }
      return { ...baseStyle, background: 'rgba(46,160,67,0.8)', color: '#fff' };
    }
    if (photo.type === 'portfolio') {
      return { ...baseStyle, background: 'rgba(163,113,247,0.8)', color: '#fff' };
    }
    if (photo.type === 'salon') {
      return { ...baseStyle, background: 'rgba(210,153,34,0.8)', color: '#fff' };
    }
    return baseStyle;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Photo Gallery 📸</h1>
          <p style={styles.subtitle}>All uploaded photos across the platform</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#58a6ff' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Photos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#58a6ff' }}>{stats.profile}</div>
          <div style={styles.statLabel}>Profile Photos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3fb950' }}>{stats.session}</div>
          <div style={styles.statLabel}>Session Photos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#a371f7' }}>{stats.portfolio}</div>
          <div style={styles.statLabel}>Portfolio</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#d29922' }}>{stats.salon}</div>
          <div style={styles.statLabel}>Salon Photos</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersRow}>
        <div style={styles.filterGroup}>
          {[
            { key: 'all', label: 'All Types' },
            { key: 'profile', label: '👤 Profile' },
            { key: 'session', label: '📷 Session' },
            { key: 'portfolio', label: '🎨 Portfolio' },
            { key: 'salon', label: '🏢 Salon' },
          ].map(filter => (
            <button
              key={filter.key}
              style={{
                ...styles.filterBtn,
                ...(typeFilter === filter.key ? styles.filterBtnActive : {}),
              }}
              onClick={() => setTypeFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          {[
            { key: 'all', label: 'All Users' },
            { key: 'model', label: '💄 Models' },
            { key: 'professional', label: '💇 Pros' },
            { key: 'partner', label: '🏢 Partners' },
          ].map(filter => (
            <button
              key={filter.key}
              style={{
                ...styles.filterBtn,
                ...(userFilter === filter.key ? styles.filterBtnActive : {}),
              }}
              onClick={() => setUserFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="🔍 Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Content Layout: Filter Sidebar + Photos */}
      <div style={styles.contentLayout}>
        {/* Tag Filter Sidebar */}
        <div style={styles.filterSidebar}>
          <GalleryTagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            photos={mockPhotos}
          />
        </div>

        {/* Photo Grid */}
        <div>
          {selectedTags.length > 0 && (
            <div style={{ marginBottom: '1rem', color: '#8b949e', fontSize: '0.9rem' }}>
              Showing {filteredPhotos.length} of {mockPhotos.length} photos
            </div>
          )}
          <div style={styles.photoGrid}>
        {filteredPhotos.length > 0 ? (
          filteredPhotos.map(photo => (
            <div
              key={photo.id}
              style={styles.photoCard}
              onClick={() => setSelectedPhoto(photo)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#58a6ff';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)';
              }}
            >
              <div style={styles.photoImage}>
                {photo.url ? (
                  <img src={photo.url} alt={photo.name} style={styles.actualImage} />
                ) : (
                  <div style={styles.photoEmoji}>{photo.emoji}</div>
                )}
                <div style={styles.photoBadges}>
                  <span style={getBadgeStyle(photo)}>
                    {photo.type === 'session' ? photo.subtype?.toUpperCase() : photo.type.toUpperCase()}
                  </span>
                  {photo.service && (
                    <span style={{ ...styles.photoBadge, background: 'rgba(0,0,0,0.7)' }}>
                      {photo.serviceIcon} {photo.service}
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.photoInfo}>
                <div style={styles.photoName}>{photo.name}</div>
                <div style={styles.photoMeta}>{photo.date}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📷</div>
            <p>No photos found matching your filters.</p>
          </div>
        )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedPhoto && (
        <div style={styles.modal} onClick={() => setSelectedPhoto(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {selectedPhoto.emoji} {selectedPhoto.name}
              </div>
              <button style={styles.modalClose} onClick={() => setSelectedPhoto(null)}>
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              {selectedPhoto.url ? (
                <img src={selectedPhoto.url} alt={selectedPhoto.name} style={styles.modalImage} />
              ) : (
                <div style={styles.modalImagePlaceholder}>
                  {selectedPhoto.emoji}
                </div>
              )}
              <div style={styles.modalDetails}>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>User</div>
                  <div style={styles.detailValue}>{selectedPhoto.name}</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Type</div>
                  <div style={styles.detailValue}>
                    {selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1)}
                    {selectedPhoto.subtype && ` (${selectedPhoto.subtype})`}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>User Type</div>
                  <div style={styles.detailValue}>
                    {selectedPhoto.userType.charAt(0).toUpperCase() + selectedPhoto.userType.slice(1)}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Uploaded</div>
                  <div style={styles.detailValue}>{selectedPhoto.date}</div>
                </div>
                {selectedPhoto.service && (
                  <div style={{ ...styles.detailItem, gridColumn: '1 / -1' }}>
                    <div style={styles.detailLabel}>Service</div>
                    <div style={styles.detailValue}>
                      {selectedPhoto.serviceIcon} {selectedPhoto.service}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

