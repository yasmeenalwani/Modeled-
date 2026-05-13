import React, { useState } from 'react';
import PhotoUploader from '../../components/PhotoUploader';
import GalleryTagFilter from '../../components/GalleryTagFilter';
import { getPortfolioPath, getSessionPhotoPath } from '../../utils/storage';
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
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  uploadBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '10px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.25rem',
  },
  
  // Section
  section: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Upload grid
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
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
  
  // Gallery grid
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  galleryItem: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  galleryImage: {
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.15), rgba(168, 90, 90, 0.1))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    position: 'relative',
    overflow: 'hidden',
  },
  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  beforeAfter: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  galleryInfo: {
    padding: '1rem',
  },
  galleryService: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  galleryMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.5rem',
  },
  galleryRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
  },
  star: {
    color: '#ffc107',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    gridColumn: '1 / -1',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
};

// Mock professional ID
const professionalId = 'pro-456';

// Mock gallery data (would come from API)
// Tags would be auto-generated from analysis or manually added
const initialPhotos = [
  {
    id: 1,
    service: 'Balayage',
    icon: '',
    category: 'color',
    date: 'Dec 4, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    tags: ['service:color', 'service:highlights', 'hair:length:long', 'hair:color:blonde', 'hair:texture:wavy', 'metadata:before', 'metadata:after', 'metadata:rated_5'],
  },
  {
    id: 2,
    service: 'Precision Cut',
    icon: '',
    category: 'haircuts',
    date: 'Dec 3, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    tags: ['service:haircut', 'hair:length:medium', 'hair:texture:straight', 'hair:style:bob', 'metadata:before', 'metadata:after', 'metadata:rated_5'],
  },
  {
    id: 3,
    service: 'Blowout',
    icon: '',
    category: 'blowouts',
    date: 'Dec 2, 2024',
    rating: 4,
    hasBefore: false,
    hasAfter: true,
    url: null,
    tags: ['service:blowdry', 'hair:length:long', 'hair:texture:straight', 'hair:style:blowout', 'metadata:after', 'metadata:rated_4'],
  },
  {
    id: 4,
    service: 'Highlights',
    icon: '',
    category: 'color',
    date: 'Dec 1, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    tags: ['service:color', 'service:highlights', 'hair:length:medium', 'hair:color:blonde', 'hair:texture:wavy', 'metadata:before', 'metadata:after', 'metadata:rated_5'],
  },
];

export default function PortalGallery() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [photos, setPhotos] = useState(initialPhotos);
  const [colorPhotos, setColorPhotos] = useState([]);
  const [haircutPhotos, setHaircutPhotos] = useState([]);
  const [blowoutPhotos, setBlowoutPhotos] = useState([]);
  const [showUploadSection, setShowUploadSection] = useState(false);
  
  // Combine all photos for filtered view
  const allPhotos = [
    ...photos,
    ...colorPhotos.map(p => ({ ...p, category: 'color', tags: p.tags || ['service:color'] })),
    ...haircutPhotos.map(p => ({ ...p, category: 'haircuts', tags: p.tags || ['service:haircut'] })),
    ...blowoutPhotos.map(p => ({ ...p, category: 'blowouts', tags: p.tags || ['service:blowdry'] })),
  ];
  
  // Filter photos by selected tags
  const filteredPhotos = selectedTags.length === 0
    ? allPhotos
    : allPhotos.filter(photo => photoMatchesTags(photo, selectedTags));

  // Calculate stats
  const stats = {
    total: allPhotos.length,
    color: allPhotos.filter(p => p.category === 'color').length,
    haircuts: allPhotos.filter(p => p.category === 'haircuts').length,
    blowouts: allPhotos.filter(p => p.category === 'blowouts').length,
  };

  // Handle photo uploads by category
  const handleColorUpload = (results) => {
    const newPhotos = results.map((r, i) => ({
      id: `color-${Date.now()}-${i}`,
      url: r.url,
      key: r.key,
      service: 'Color Work',
      icon: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: null,
      hasBefore: false,
      hasAfter: true,
      tags: ['service:color', 'metadata:after'],
    }));
    setColorPhotos(prev => [...prev, ...newPhotos]);
    console.log('Color photos uploaded:', results);
  };

  const handleHaircutUpload = (results) => {
    const newPhotos = results.map((r, i) => ({
      id: `haircut-${Date.now()}-${i}`,
      url: r.url,
      key: r.key,
      service: 'Haircut',
      icon: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: null,
      hasBefore: false,
      hasAfter: true,
      tags: ['service:haircut', 'metadata:after'],
    }));
    setHaircutPhotos(prev => [...prev, ...newPhotos]);
    console.log('Haircut photos uploaded:', results);
  };

  const handleBlowoutUpload = (results) => {
    const newPhotos = results.map((r, i) => ({
      id: `blowout-${Date.now()}-${i}`,
      url: r.url,
      key: r.key,
      service: 'Blowout',
      icon: '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: null,
      hasBefore: false,
      hasAfter: true,
      tags: ['service:blowdry', 'metadata:after'],
    }));
    setBlowoutPhotos(prev => [...prev, ...newPhotos]);
    console.log('Blowout photos uploaded:', results);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Work Gallery 📸</h1>
          <p style={styles.subtitle}>Photos from your sessions - building your portfolio</p>
        </div>
        <button 
          style={styles.uploadBtn}
          onClick={() => setShowUploadSection(!showUploadSection)}
        >
          <span>{showUploadSection ? '−' : '+'}</span> 
          {showUploadSection ? 'Hide Upload' : 'Upload Photos'}
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Photos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>{stats.color}</div>
          <div style={styles.statLabel}>Color</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.haircuts}</div>
          <div style={styles.statLabel}>Cut</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#e94560' }}>{stats.blowouts}</div>
          <div style={styles.statLabel}>Style</div>
        </div>
      </div>

      {/* Upload Section */}
      {showUploadSection && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            <span>📤</span> Upload Portfolio Photos
          </div>
          <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Upload your best work by category. High-quality photos help attract more clients!
          </p>
          <div style={styles.uploadGrid}>
            <PhotoUploader
              title="Color"
              subtitle="Balayage, highlights, etc."
              maxFiles={10}
              accentColor="#4caf50"
              existingPhotos={colorPhotos}
              pathGenerator={(filename) => getPortfolioPath(professionalId, `color-${filename}`)}
              onUpload={handleColorUpload}
              onDelete={(photo) => setColorPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
            <PhotoUploader
              title="Haircuts"
              subtitle="Cuts, trims, styles"
              maxFiles={10}
              accentColor="#8B1E3F"
              existingPhotos={haircutPhotos}
              pathGenerator={(filename) => getPortfolioPath(professionalId, `haircut-${filename}`)}
              onUpload={handleHaircutUpload}
              onDelete={(photo) => setHaircutPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
            <PhotoUploader
              title="Style"
              subtitle="Styling & blowouts"
              maxFiles={10}
              accentColor="#e94560"
              existingPhotos={blowoutPhotos}
              pathGenerator={(filename) => getPortfolioPath(professionalId, `blowout-${filename}`)}
              onUpload={handleBlowoutUpload}
              onDelete={(photo) => setBlowoutPhotos(prev => prev.filter(p => p.url !== photo.url))}
            />
          </div>
        </div>
      )}

      {/* Content Layout: Filter Sidebar + Gallery */}
      <div style={styles.contentLayout}>
        {/* Tag Filter Sidebar */}
        <div style={styles.filterSidebar}>
          <GalleryTagFilter
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            photos={allPhotos}
          />
        </div>

        {/* Gallery Grid */}
        <div>
          {selectedTags.length > 0 && (
            <div style={{ marginBottom: '1rem', color: '#5A3A2A', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
              Showing {filteredPhotos.length} of {allPhotos.length} photos
            </div>
          )}
          <div style={styles.gallery}>
        {filteredPhotos.length > 0 ? (
          filteredPhotos.map(photo => (
            <div
              key={photo.id}
              style={styles.galleryItem}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = '#8B1E3F';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
              }}
            >
              <div style={styles.galleryImage}>
                {photo.url ? (
                  <img src={photo.url} alt={photo.service} style={styles.actualImage} />
                ) : (
                  photo.icon
                )}
                <div style={styles.beforeAfter}>
                  {photo.hasBefore && (
                    <span style={{
                      ...styles.badge,
                      background: 'rgba(0,0,0,0.7)',
                      color: '#fff',
                    }}>
                      Before
                    </span>
                  )}
                  {photo.hasAfter && (
                    <span style={{
                      ...styles.badge,
                      background: '#8B1E3F',
                      color: '#FFFEF9',
                    }}>
                      After
                    </span>
                  )}
                </div>
              </div>
              <div style={styles.galleryInfo}>
                <div style={styles.galleryService}>
                  <span>{photo.icon}</span>
                  {photo.service}
                </div>
                <div style={styles.galleryMeta}>{photo.date}</div>
                {photo.rating && (
                  <div style={styles.galleryRating}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} style={{ ...styles.star, opacity: i < photo.rating ? 1 : 0.3 }}>
                        ★
                      </span>
                    ))}
                    <span style={{ marginLeft: '0.5rem', color: '#5A3A2A', fontSize: '0.8rem', fontFamily: '"Alike", "Georgia", serif' }}>
                      {photo.rating}.0
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}></div>
            <p>No photos in this category yet. Upload your work above!</p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
