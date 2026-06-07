import React, { useState, useEffect } from 'react';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import PhotoUploader from '../../components/PhotoUploader';
import { getProfilePhotoPath } from '../../utils/storage';
import { getMockModel, shouldUseMockData } from '../../utils/mockDataService';

// ─── Service config ───────────────────────────────────────────────────────────
const SERVICE_CATEGORIES = [
  { key: 'all',     label: 'All' },
  { key: 'color',   label: 'Color' },
  { key: 'haircut', label: 'Cut' },
  { key: 'blowdry', label: 'Style' },
  { key: 'profile', label: 'Profile' },
];

const SERVICE_LABELS = {
  color:   'Color',
  haircut: 'Haircut',
  blowdry: 'Blowout',
  profile: 'Profile',
  session: 'Session',
};

// Cherry-brand accent per service
const SERVICE_COLORS = {
  color:   '#4caf50',
  haircut: '#667eea',
  blowdry: '#e94560',
  profile: '#A85A5A',
  session: '#8B1E3F',
};

// Mock session photos from completed appointments (with salon + stylist for demo)
const SESSION_PHOTOS = [
  {
    id: 's1',
    service: 'color',
    label: 'Balayage',
    date: 'Dec 2',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600',
    salonName: 'Luxe Studio',
    stylistName: 'Sarah M.',
  },
  {
    id: 's2',
    service: 'blowdry',
    label: 'Blowout',
    date: 'Nov 28',
    url: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600',
    salonName: 'SoHo Collective',
    stylistName: 'Alex R.',
  },
  {
    id: 's3',
    service: 'haircut',
    label: 'Precision Cut',
    date: 'Nov 20',
    url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600',
    salonName: 'Downtown Atelier',
    stylistName: 'Mia K.',
  },
  {
    id: 's4',
    service: 'color',
    label: 'Root Touch',
    date: 'Nov 12',
    url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=600',
    salonName: 'Color Lab',
    stylistName: 'Jordan P.',
  },
  {
    id: 's5',
    service: 'blowdry',
    label: 'Blowout',
    date: 'Nov 5',
    url: 'https://images.unsplash.com/photo-1560066984-1383b3ce8b94?w=600',
    salonName: 'Tribeca Lounge',
    stylistName: 'Nina L.',
  },
  {
    id: 's6',
    service: 'haircut',
    label: 'Trim',
    date: 'Oct 30',
    url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600',
    salonName: 'Uptown Studio',
    stylistName: 'Chris D.',
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    background: '#FFFEF9',
    minHeight: '100vh',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.75rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.35rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  addBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    color: '#FFFEF9',
    fontSize: '1.5rem',
    lineHeight: '1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 10px rgba(139, 30, 63, 0.25)',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },

  // Upload panel (collapsed by default)
  uploadPanel: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.75rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  uploadPanelTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.5rem',
  },
  uploadPanelSub: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1.25rem',
  },
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.25rem',
  },

  // Filter pills
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterPill: {
    padding: '0.5rem 1.1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '999px',
    color: '#5A3A2A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '500',
  },
  filterPillActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },

  // Photo grid — same as Pro
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1.25rem',
  },
  galleryItem: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.12)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    position: 'relative',
  },
  galleryImage: {
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(139,30,63,0.1), rgba(168,90,90,0.06))',
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
  serviceBadge: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    padding: '0.3rem 0.75rem',
    background: 'rgba(139,30,63,0.88)',
    color: '#FFFEF9',
    borderRadius: '999px',
    fontSize: '0.72rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
    backdropFilter: 'blur(4px)',
  },
  galleryInfo: {
    padding: '0.75rem 1rem',
    borderTop: '1px solid rgba(139,30,63,0.07)',
  },
  galleryService: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.2rem',
  },
  galleryDate: {
    fontSize: '0.78rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },

  // Empty state
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyIcon: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  emptyText: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#5A3A2A',
  },

  // Detail modal
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '2rem',
  },
  modalContent: {
    background: '#FFFEF9',
    borderRadius: '20px',
    maxWidth: '520px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
    position: 'relative',
  },
  modalClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1.75rem',
    color: '#5A3A2A',
    cursor: 'pointer',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
    zIndex: 1,
  },
  modalImage: {
    width: '100%',
    aspectRatio: '4/5',
    objectFit: 'cover',
    borderRadius: '20px 20px 0 0',
  },
  modalImagePlaceholder: {
    width: '100%',
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(139,30,63,0.12), rgba(168,90,90,0.07))',
    borderRadius: '20px 20px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    color: 'rgba(139,30,63,0.3)',
  },
  modalBody: {
    padding: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.25rem',
  },
  modalMeta: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.35rem',
  },
  modalMetaSub: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1rem',
  },
  modalTag: {
    display: 'inline-block',
    padding: '0.3rem 0.75rem',
    background: 'rgba(139,30,63,0.1)',
    border: '1px solid rgba(139,30,63,0.2)',
    borderRadius: '999px',
    fontSize: '0.78rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ModelPhotos() {
  const { user } = useAuthenticator();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // Load any uploaded profile photos from mock model
  useEffect(() => {
    try {
      const model = getMockModel('mock-model-1');
      if (model?.photoUrls?.length) {
        const loaded = model.photoUrls.map((url, i) => ({
          id: `profile-${i}`,
          service: 'profile',
          label: 'Profile',
          date: 'Recent',
          url,
        }));
        setUploadedPhotos(loaded);
      }
    } catch (e) {
      // silently ignore in production
    }
  }, []);

  // Merge session photos + uploaded profile photos
  const allPhotos = [
    ...SESSION_PHOTOS,
    ...uploadedPhotos,
  ];

  const filtered = activeFilter === 'all'
    ? allPhotos
    : allPhotos.filter(p => p.service === activeFilter);

  const handleUpload = (results) => {
    const newPhotos = results.map((r, i) => ({
      id: `uploaded-${Date.now()}-${i}`,
      service: 'profile',
      label: 'Profile',
      date: 'Just now',
      url: r.url,
      key: r.key,
    }));
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
  };

  const userId = user?.userId || 'user-123';

  return (
    <div style={styles.container}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Photos</h1>
          <p style={styles.subtitle}>Your hair journey — photos from sessions, transformations, and your profile.</p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => setShowUpload(v => !v)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,30,63,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(139,30,63,0.25)'; }}
          title="Upload photos"
        >
          {showUpload ? '−' : '+'}
        </button>
      </div>

      {/* ── Upload Panel ── */}
      {showUpload && (
        <div style={styles.uploadPanel}>
          <div style={styles.uploadPanelTitle}>Upload Photos</div>
          <p style={styles.uploadPanelSub}>
            Add photos of yourself and your hair — better photos help us find you the best matches.
          </p>
          <div style={styles.uploadGrid}>
            <PhotoUploader
              title="Profile Photos"
              subtitle="Headshots & face photos"
              maxFiles={5}
              accentColor="#8B1E3F"
              existingPhotos={uploadedPhotos.filter(p => p.service === 'profile')}
              pathGenerator={(filename) => getProfilePhotoPath('model', userId, filename)}
              onUpload={handleUpload}
              onDelete={(photo) => setUploadedPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
            <PhotoUploader
              title="Hair Photos"
              subtitle="Close-ups of your hair"
              maxFiles={5}
              accentColor="#A85A5A"
              existingPhotos={[]}
              pathGenerator={(filename) => getProfilePhotoPath('model', userId, `hair-${filename}`)}
              onUpload={(results) => {
                const newPhotos = results.map((r, i) => ({
                  id: `hair-${Date.now()}-${i}`,
                  service: 'profile',
                  label: 'Hair',
                  date: 'Just now',
                  url: r.url,
                  key: r.key,
                }));
                setUploadedPhotos(prev => [...prev, ...newPhotos]);
              }}
              onDelete={(photo) => setUploadedPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
            <PhotoUploader
              title="Style Shots"
              subtitle="After-session photos"
              maxFiles={10}
              accentColor="#4A2A1A"
              existingPhotos={[]}
              pathGenerator={(filename) => getProfilePhotoPath('model', userId, `style-${filename}`)}
              onUpload={(results) => {
                const newPhotos = results.map((r, i) => ({
                  id: `style-${Date.now()}-${i}`,
                  service: 'blowdry',
                  label: 'Style',
                  date: 'Just now',
                  url: r.url,
                  key: r.key,
                }));
                setUploadedPhotos(prev => [...prev, ...newPhotos]);
              }}
              onDelete={(photo) => setUploadedPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
          </div>
        </div>
      )}

      {/* ── Service Filter Pills ── */}
      <div style={styles.filters}>
        {SERVICE_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            style={{
              ...styles.filterPill,
              ...(activeFilter === cat.key ? styles.filterPillActive : {}),
            }}
            onClick={() => setActiveFilter(cat.key)}
          >
            {cat.label}
            {cat.key !== 'all' && (
              <span style={{ marginLeft: '0.4rem', opacity: 0.65, fontSize: '0.78rem' }}>
                ({cat.key === 'all' ? allPhotos.length : allPhotos.filter(p => p.service === cat.key).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Photo Grid ── */}
      <div style={styles.gallery}>
        {filtered.length > 0 ? filtered.map((photo) => (
          <div
            key={photo.id}
            style={styles.galleryItem}
            onClick={() => setSelectedPhoto(photo)}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,30,63,0.14)';
              e.currentTarget.style.borderColor = 'rgba(139,30,63,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = 'rgba(139,30,63,0.12)';
            }}
          >
            <div style={styles.galleryImage}>
              {photo.url
                ? <img src={photo.url} alt={photo.label} style={styles.actualImage} />
                : <span style={{ fontSize: '2.5rem', color: 'rgba(139,30,63,0.25)' }}>✦</span>
              }
              <div style={{
                ...styles.serviceBadge,
                background: `${SERVICE_COLORS[photo.service] || '#8B1E3F'}dd`,
              }}>
                {photo.label || SERVICE_LABELS[photo.service] || 'Photo'}
              </div>
            </div>
            <div style={styles.galleryInfo}>
              <div style={styles.galleryService}>{photo.label || SERVICE_LABELS[photo.service] || 'Photo'}</div>
              <div style={styles.galleryDate}>{photo.date}</div>
              {(photo.salonName || photo.stylistName) && (
                <div style={styles.galleryDate}>
                  {photo.salonName && <span>{photo.salonName}</span>}
                  {photo.salonName && photo.stylistName && <span> · </span>}
                  {photo.stylistName && <span>{photo.stylistName}</span>}
                </div>
              )}
            </div>
          </div>
        )) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📷</div>
            <div style={styles.emptyText}>No photos yet</div>
            <div style={styles.emptySubtext}>
              {activeFilter === 'all'
                ? 'Tap + to upload your first photos.'
                : `No ${SERVICE_LABELS[activeFilter] || activeFilter} photos yet.`}
            </div>
          </div>
        )}
      </div>

      {/* ── Photo Detail Modal ── */}
      {selectedPhoto && (
        <div style={styles.modalOverlay} onClick={() => setSelectedPhoto(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button
              style={styles.modalClose}
              onClick={() => setSelectedPhoto(null)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,30,63,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              ×
            </button>

            {selectedPhoto.url
              ? <img src={selectedPhoto.url} alt={selectedPhoto.label} style={styles.modalImage} />
              : <div style={styles.modalImagePlaceholder}>✦</div>
            }

            <div style={styles.modalBody}>
              <div style={styles.modalTitle}>{selectedPhoto.label || SERVICE_LABELS[selectedPhoto.service] || 'Photo'}</div>
              <div style={styles.modalMeta}>{selectedPhoto.date}</div>
              {(selectedPhoto.salonName || selectedPhoto.stylistName) && (
                <div style={styles.modalMetaSub}>
                  {selectedPhoto.salonName && <span>{selectedPhoto.salonName}</span>}
                  {selectedPhoto.salonName && selectedPhoto.stylistName && <span> · </span>}
                  {selectedPhoto.stylistName && <span>{selectedPhoto.stylistName}</span>}
                </div>
              )}
              <span
                style={{
                  ...styles.modalTag,
                  background: `${SERVICE_COLORS[selectedPhoto.service] || '#8B1E3F'}18`,
                  borderColor: `${SERVICE_COLORS[selectedPhoto.service] || '#8B1E3F'}40`,
                  color: SERVICE_COLORS[selectedPhoto.service] || '#8B1E3F',
                }}
              >
                {SERVICE_LABELS[selectedPhoto.service] || 'Photo'}
              </span>

              {(selectedPhoto.salonName || selectedPhoto.stylistName) && (
                <div style={{ marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    style={{
                      padding: '0.85rem 1.5rem',
                      borderRadius: '999px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                      color: '#FFFEF9',
                      fontFamily: '"Alike", "Georgia", serif',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      // For now this is a demo-only CTA. Real rebook flow will be wired later.
                      alert('In the full product, this will let you rebook this service at full price with the same salon and stylist.');
                    }}
                  >
                    Rebook this service at full price
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
