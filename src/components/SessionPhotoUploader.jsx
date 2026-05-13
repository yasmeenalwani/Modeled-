import React, { useState } from 'react';
import PhotoUploader from './PhotoUploader';
import { getSessionPhotoPath } from '../utils/storage';

// ============ STYLES ============
const styles = {
  container: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Session info
  sessionInfo: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    marginBottom: '1.5rem',
  },
  sessionDetail: {},
  sessionLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.25rem',
  },
  sessionValue: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  
  // Upload grid
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  uploadSection: {},
  uploadLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Status message
  statusMessage: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusSuccess: {
    background: 'rgba(76,175,80,0.1)',
    border: '1px solid rgba(76,175,80,0.3)',
    color: '#4caf50',
  },
};

/**
 * SessionPhotoUploader Component
 * 
 * For uploading before/after photos from completed sessions.
 * Used by professionals after appointments.
 * 
 * @param {object} session - Session/booking data
 * @param {function} onComplete - Called when photos are submitted
 */
export default function SessionPhotoUploader({
  session = {},
  onComplete,
  accentColor = '#667eea',
}) {
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const {
    bookingId = 'booking-123',
    service = 'Balayage',
    serviceIcon = '🎨',
    modelName = 'Emma J.',
    date = 'Dec 6, 2024',
    proName = 'Sarah M.',
  } = session;

  // Handle before photos upload
  const handleBeforeUpload = (results) => {
    const newPhotos = results.map(r => ({ url: r.url, key: r.key, type: 'before' }));
    setBeforePhotos(prev => [...prev, ...newPhotos]);
    console.log('Before photos uploaded:', results);
  };

  // Handle after photos upload
  const handleAfterUpload = (results) => {
    const newPhotos = results.map(r => ({ url: r.url, key: r.key, type: 'after' }));
    setAfterPhotos(prev => [...prev, ...newPhotos]);
    console.log('After photos uploaded:', results);
  };

  // Handle submit
  const handleSubmit = () => {
    const allPhotos = [
      ...beforePhotos.map(p => ({ ...p, type: 'before' })),
      ...afterPhotos.map(p => ({ ...p, type: 'after' })),
    ];
    
    setSubmitted(true);
    
    if (onComplete) {
      onComplete({
        bookingId,
        beforePhotos,
        afterPhotos,
        totalPhotos: allPhotos.length,
      });
    }
    
    console.log('Session photos submitted:', { bookingId, beforePhotos, afterPhotos });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>
          <span>📷</span> Session Photos
        </div>
        <div style={styles.subtitle}>
          Upload before & after photos from this session
        </div>
      </div>

      {/* Session Info */}
      <div style={styles.sessionInfo}>
        <div style={styles.sessionDetail}>
          <div style={styles.sessionLabel}>Service</div>
          <div style={styles.sessionValue}>
            <span>{serviceIcon}</span> {service}
          </div>
        </div>
        <div style={styles.sessionDetail}>
          <div style={styles.sessionLabel}>Model</div>
          <div style={styles.sessionValue}>{modelName}</div>
        </div>
        <div style={styles.sessionDetail}>
          <div style={styles.sessionLabel}>Date</div>
          <div style={styles.sessionValue}>{date}</div>
        </div>
        <div style={styles.sessionDetail}>
          <div style={styles.sessionLabel}>Professional</div>
          <div style={styles.sessionValue}>{proName}</div>
        </div>
      </div>

      {/* Upload Grid */}
      <div style={styles.uploadGrid}>
        {/* Before Photos */}
        <div style={styles.uploadSection}>
          <div style={styles.uploadLabel}>
            <span>⬅️</span> Before Photos
          </div>
          <PhotoUploader
            title="Before"
            subtitle="Before the session"
            maxFiles={4}
            accentColor="#6b7280"
            existingPhotos={beforePhotos}
            pathGenerator={(filename) => getSessionPhotoPath(bookingId, 'before', filename)}
            onUpload={handleBeforeUpload}
            onDelete={(photo) => setBeforePhotos(prev => prev.filter(p => p.url !== photo.url))}
          />
        </div>

        {/* After Photos */}
        <div style={styles.uploadSection}>
          <div style={styles.uploadLabel}>
            <span>➡️</span> After Photos
          </div>
          <PhotoUploader
            title="After"
            subtitle="After the session"
            maxFiles={4}
            accentColor={accentColor}
            existingPhotos={afterPhotos}
            pathGenerator={(filename) => getSessionPhotoPath(bookingId, 'after', filename)}
            onUpload={handleAfterUpload}
            onDelete={(photo) => setAfterPhotos(prev => prev.filter(p => p.url !== photo.url))}
          />
        </div>
      </div>

      {/* Status Message */}
      {submitted && (
        <div style={{ ...styles.statusMessage, ...styles.statusSuccess }}>
          <span>✓</span> Photos submitted successfully!
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <button style={{ ...styles.btn, ...styles.btnSecondary }}>
          Skip for Now
        </button>
        <button 
          style={{ 
            ...styles.btn, 
            ...styles.btnPrimary,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            opacity: (beforePhotos.length === 0 && afterPhotos.length === 0) ? 0.5 : 1,
          }}
          onClick={handleSubmit}
          disabled={beforePhotos.length === 0 && afterPhotos.length === 0}
        >
          <span>✓</span> Submit Photos
        </button>
      </div>
    </div>
  );
}

