import React from 'react';

const styles = {
  card: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    gap: '2rem',
  },
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
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
    position: 'relative',
  },
  avatarButton: {
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    background: 'rgba(0,0,0,0.6)',
    color: '#FFFEF9',
    fontSize: '0.7rem',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileSalon: {
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileBio: {
    fontSize: '0.95rem',
    color: '#4A2A1A',
    lineHeight: 1.6,
    marginBottom: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  badges: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  badge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  statItem: {
    textAlign: 'center',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  previewBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
    alignSelf: 'flex-start',
  },
};

export default function ProCardOverview({ 
  profilePhoto, 
  firstName, 
  lastName, 
  salonName,
  city,
  bio,
  tier,
  certificationsCount,
  isTopRated,
  totalSessions,
  rating,
  memberSince,
  onPreviewClick,
  onChangePhotoClick,
}) {
  const getTierLabel = (tier) => {
    const labels = {
      apprentice: 'Apprentice',
      junior: 'Junior',
      senior: 'Senior',
    };
    return labels[tier] || 'Apprentice';
  };

  const getTierColor = (tier) => {
    const colors = {
      apprentice: '#ffc107',
      junior: '#667eea',
      senior: '#4caf50',
    };
    return colors[tier] || '#ffc107';
  };

  return (
    <div style={styles.card}>
      <div style={styles.avatarSection}>
        <button style={styles.avatarButton} onClick={onChangePhotoClick} type="button">
          <div style={styles.avatar}>
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" style={styles.avatarImage} />
            ) : (
              firstName?.charAt(0) || 'P'
            )}
            <div style={styles.avatarOverlay}>
              {profilePhoto ? 'Update' : 'Upload'}
            </div>
          </div>
        </button>
      </div>
      
      <div style={styles.profileInfo}>
        <div style={styles.profileName}>
          {firstName} {lastName}
        </div>
        <div style={styles.profileSalon}>
          {salonName}{city ? ` • ${city}` : ''}
        </div>
        {bio && (
          <div style={styles.profileBio}>
            {bio}
          </div>
        )}
        
        <div style={styles.badges}>
          <span style={{
            ...styles.badge,
            background: 'rgba(76,175,80,0.2)',
            color: '#4caf50',
          }}>
            Verified Pro
          </span>
          {tier && (
            <span style={{
              ...styles.badge,
              background: `${getTierColor(tier)}20`,
              color: getTierColor(tier),
            }}>
              {getTierLabel(tier)}
            </span>
          )}
          {certificationsCount > 0 && (
            <span style={{
              ...styles.badge,
              background: 'rgba(102,126,234,0.2)',
              color: '#667eea',
            }}>
              {certificationsCount} Certifications
            </span>
          )}
          {isTopRated && (
            <span style={{
              ...styles.badge,
              background: 'rgba(255,193,7,0.2)',
              color: '#ffc107',
            }}>
              Top Rated
            </span>
          )}
        </div>
        
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <div style={{ ...styles.statValue, color: '#667eea' }}>{totalSessions || 0}</div>
            <div style={styles.statLabel}>Total Sessions</div>
          </div>
          <div style={styles.statItem}>
            <div style={{ ...styles.statValue, color: '#ffc107' }}>{rating || 'N/A'}</div>
            <div style={styles.statLabel}>Rating</div>
          </div>
          <div style={styles.statItem}>
            <div style={{ ...styles.statValue, color: '#8B1E3F' }}>
              {memberSince ? new Date(memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
            <div style={styles.statLabel}>Member Since</div>
          </div>
        </div>
        
        <button
          style={styles.previewBtn}
          onClick={onPreviewClick}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Preview Public Profile
        </button>
      </div>
    </div>
  );
}

