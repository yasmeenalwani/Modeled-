import React from 'react';
import ResolvedProfileImage from './ResolvedProfileImage';

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
  profileLocation: {
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

export default function ModelCardOverview({
  model,
  onPreviewClick,
  hideStats,
}) {
  const firstName = model?.firstName || '';
  const lastName = model?.lastName || '';
  const avatarPhotoRef =
    model?.primaryPhotoUrl || model?.coverPhotoRef || model?.headshotUrl;
  const locationZip = model?.locationZip;
  const baseBio = model?.bio || [model?.whatYouCareAbout, model?.somethingFun].filter(Boolean).join(' ') || null;
  // For demo, give Seraphina and other models a slightly richer default paragraph if none is set.
  const fallbackBio =
    baseBio ||
    (firstName && lastName
      ? `${firstName} ${lastName} is part of Modeled's early cohort, here to explore new looks, build experience with world‑class professionals, and be featured in high‑impact hair drops.`
      : null);
  const bio = fallbackBio;
  const identityVerified = model?.identityVerified || model?.identityVerificationStatus === 'verified';
  const status = model?.status || 'pending';
  const cardOnFile = model?.cardOnFileStatus === 'valid' || model?.cardOnFileStatus === 'complete';

  return (
    <div style={styles.card}>
      <div style={styles.avatarSection}>
        <div style={styles.avatar}>
          {avatarPhotoRef ? (
            <ResolvedProfileImage
              photoRef={avatarPhotoRef}
              name={`${firstName} ${lastName}`}
              style={styles.avatarImage}
              alt={`${firstName} ${lastName}`}
              fallbackFontSize="4rem"
            />
          ) : (
            <span>{firstName?.charAt(0) || '?'}</span>
          )}
        </div>
      </div>

      <div style={styles.profileInfo}>
        <div style={styles.profileName}>
          {firstName} {lastName}
        </div>
        {/* Hide raw ZIP on the public-facing card; keep this line for future location text if needed */}
        <div style={styles.profileLocation}>
          {locationZip ? 'New York City' : 'Location not set'}
        </div>
        {bio && (
          <div style={styles.profileBio}>
            {bio}
          </div>
        )}

        <div style={styles.badges}>
          {identityVerified && (
            <span style={{ ...styles.badge, background: 'rgba(76,175,80,0.2)', color: '#4caf50' }}>
              Verified
            </span>
          )}
          <span
            style={{
              ...styles.badge,
              background:
                status === 'active'
                  ? 'rgba(102,126,234,0.2)'
                  : status === 'approved'
                    ? 'rgba(76,175,80,0.2)'
                    : status === 'pending'
                      ? 'rgba(255,193,7,0.2)'
                      : 'rgba(255,255,255,0.2)',
              color:
                status === 'active'
                  ? '#667eea'
                  : status === 'approved'
                    ? '#4caf50'
                    : status === 'pending'
                      ? '#ffc107'
                      : '#666',
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {cardOnFile && (
            <span style={{ ...styles.badge, background: 'rgba(102,126,234,0.2)', color: '#667eea' }}>
              Card on file
            </span>
          )}
        </div>

        {!hideStats && (
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#667eea' }}>{model?.totalBookings ?? model?.servicesCompleted?.length ?? 0}</div>
              <div style={styles.statLabel}>Total Bookings</div>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#ffc107' }}>
                {model?.agenticScores && Object.keys(model.agenticScores).length
                  ? Math.round(
                      Object.values(model.agenticScores).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) /
                        Object.keys(model.agenticScores).length
                    )
                  : '—'}
              </div>
              <div style={styles.statLabel}>Avg Score</div>
            </div>
            <div style={styles.statItem}>
              <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{model?.repeatBookings ?? 0}</div>
              <div style={styles.statLabel}>Repeats</div>
            </div>
          </div>
        )}

        {onPreviewClick && (
          <button
            style={styles.previewBtn}
            onClick={onPreviewClick}
            type="button"
          >
            Preview Public Profile
          </button>
        )}
      </div>
    </div>
  );
}
