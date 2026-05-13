import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  modal: {
    background: '#FFFEF9',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    position: 'relative',
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#5A3A2A',
    padding: '0.5rem',
    lineHeight: 1,
  },
  profileCard: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    gap: '2rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '16px',
  },
  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
    fontWeight: '600',
    border: '4px solid rgba(139, 30, 63, 0.2)',
    overflow: 'hidden',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  salon: {
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  badge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  bio: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    lineHeight: 1.6,
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1.5rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  specialties: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  specialty: {
    padding: '0.4rem 0.8rem',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
  },
  portfolioItem: {
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(139, 30, 63, 0.2)',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
};

export default function PublicProfilePreview({
  profileData,
  onClose,
}) {
  if (!profileData) return null;

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.title}>Public Profile Preview</div>
          <button style={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            {profileData.profilePhoto ? (
              <img src={profileData.profilePhoto} alt="Profile" style={styles.avatarImage} />
            ) : (
              (profileData.firstName || 'P').charAt(0)
            )}
          </div>
          <div style={styles.info}>
            <div style={styles.name}>
              {profileData.firstName} {profileData.lastName}
            </div>
            <div style={styles.salon}>
              {profileData.salonName}
            </div>
            <div style={styles.badges}>
              <span style={{
                ...styles.badge,
                background: 'rgba(76,175,80,0.2)',
                color: '#4caf50',
              }}>
                Verified Pro
              </span>
              {profileData.tier && (
                <span style={{
                  ...styles.badge,
                  background: 'rgba(102,126,234,0.2)',
                  color: '#667eea',
                }}>
                  {profileData.tier.charAt(0).toUpperCase() + profileData.tier.slice(1)}
                </span>
              )}
            </div>
            {profileData.bio && (
              <div style={styles.bio}>{profileData.bio}</div>
            )}
          </div>
        </div>

        {profileData.hairSpecialties && profileData.hairSpecialties.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Specialties</div>
            <div style={styles.specialties}>
              {profileData.hairSpecialties.map((spec, i) => (
                <span key={i} style={styles.specialty}>{spec}</span>
              ))}
            </div>
          </div>
        )}

        {profileData.portfolioItems && profileData.portfolioItems.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Portfolio</div>
            <div style={styles.portfolioGrid}>
              {profileData.portfolioItems.slice(0, 6).map((item, i) => (
                <div key={i} style={styles.portfolioItem}>
                  <img src={item.url} alt="Portfolio" style={styles.portfolioImage} />
                </div>
              ))}
            </div>
          </div>
        )}

        {profileData.certifications && Object.keys(profileData.certifications).length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>Certifications</div>
            <div style={styles.specialties}>
              {Object.entries(profileData.certifications)
                .filter(([_, cert]) => cert.status === 'certified')
                .map(([key, _]) => (
                  <span key={key} style={styles.specialty}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

