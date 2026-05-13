import React from 'react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat', sunday: 'Sun' };

const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  focusGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  focusColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  galleryCard: {
    position: 'relative',
    aspectRatio: '4 / 5',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '0.6rem 0.75rem',
    background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
    color: '#FFFEF9',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  infoCard: {
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: 'rgba(139, 30, 63, 0.05)',
    padding: '1rem',
  },
  infoTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  listRowLast: { borderBottom: 'none' },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  chip: {
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid rgba(139, 30, 63, 0.25)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilitySection: {
    marginTop: '1.5rem',
  },
  addBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: 'rgba(139, 30, 63, 0.05)',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityCard: {
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: '#FFFEF9',
    padding: '1rem',
    marginBottom: '1rem',
  },
  availabilityHeader: {
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#8B1E3F',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.35rem 0',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  slotTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  slotTag: {
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    fontSize: '0.7rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const SERVICES_CONFIG = [
  { key: 'openToHaircut', label: 'Haircuts' },
  { key: 'openToColor', label: 'Colors' },
  { key: 'openToStyling', label: 'Styles' },
];

function parseAvailability(availability) {
  if (!availability || typeof availability !== 'object') return {};
  const out = {};
  for (const day of DAYS) {
    const val = availability[day];
    if (!val) continue;
    if (typeof val === 'object' && (val.neighborhoods || val.slots)) {
      out[day] = {
        neighborhoods: val.neighborhoods || [],
        slots: val.slots || [],
      };
    } else if (Array.isArray(val)) {
      out[day] = { neighborhoods: [], slots: val };
    }
  }
  return out;
}

export default function ModelFocusLayout({ model }) {
  const photoUrls = model?.photoUrls || [];
  const headshotUrl = model?.headshotUrl;
  const portfolioImages = headshotUrl
    ? [headshotUrl, ...photoUrls].filter(Boolean)
    : [...photoUrls].filter(Boolean);
  const portfolioTiles = Math.max(4, Math.ceil(portfolioImages.length / 4) * 4);

  const preferences = [
    model?.somethingFun,
    model?.whatYouCareAbout,
    ...(Array.isArray(model?.communityInterests) ? model.communityInterests : []),
  ].filter(Boolean);
  const defaultPrefs = ['Prefer mornings', 'Love to chat', 'Natural light photos'];
  const displayPrefs = preferences.length ? preferences : defaultPrefs;

  const availability = parseAvailability(model?.availability);
  const hasAvailability = Object.keys(availability).length > 0;

  const formatSlot = (s) => (typeof s === 'string' ? s : String(s));

  return (
    <div style={styles.container}>
      <div style={styles.sectionTitle}>Model Focus</div>

      <div style={styles.focusGrid}>
        {/* Left: Portfolio */}
        <div style={styles.focusColumn}>
          <div>
            <div style={{ ...styles.infoTitle, marginBottom: '0.75rem' }}>Portfolio</div>
            <div style={styles.galleryGrid}>
              {Array.from({ length: 6 }).map((_, i) => {
                const url = portfolioImages[i];
                return (
                  <div key={i} style={styles.galleryCard}>
                    {url ? (
                      <>
                        <img src={url} alt={`Portfolio ${i + 1}`} style={styles.galleryImage} />
                        <div style={styles.galleryOverlay}>Portfolio</div>
                      </>
                    ) : (
                      'Add photo'
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Services + Preferences */}
        <div style={styles.focusColumn}>
          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Services Open To</div>
            {SERVICES_CONFIG.map(({ key, label }, i) => {
              const isOpen = model?.[key] === true;
              const isLast = i === SERVICES_CONFIG.length - 1;
              return (
                <div key={key} style={{ ...styles.listRow, ...(isLast ? styles.listRowLast : {}) }}>
                  <span>{label}</span>
                  <span style={{ color: isOpen ? '#4caf50' : '#9e9e9e', fontWeight: isOpen ? '600' : '400' }}>
                    {isOpen ? '✓ Open' : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoTitle}>Preferences</div>
            <div style={styles.chipRow}>
              {displayPrefs.map((pref, i) => (
                <span key={i} style={styles.chip}>
                  {typeof pref === 'string' ? pref : pref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Availability (Education-style) */}
      <div style={styles.availabilitySection}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={styles.infoTitle}>Availability</div>
          <button type="button" style={styles.addBtn}>
            + Add availability
          </button>
        </div>
        {hasAvailability ? (
          DAYS.map((day) => {
            const data = availability[day];
            if (!data) return null;
            const { neighborhoods = [], slots = [] } = data;
            return (
              <div key={day} style={styles.availabilityCard}>
                <div style={styles.availabilityHeader}>{DAY_LABELS[day]}</div>
                {neighborhoods.length > 0 && (
                  <div style={styles.availabilityRow}>
                    <span>Neighborhoods</span>
                    <span>{neighborhoods.join(', ')}</span>
                  </div>
                )}
                {slots.length > 0 && (
                  <div>
                    <div style={styles.availabilityRow}>
                      <span>Times</span>
                    </div>
                    <div style={styles.slotTags}>
                      {slots.slice(0, 12).map((slot, i) => (
                        <span key={i} style={styles.slotTag}>
                          {formatSlot(slot)}
                        </span>
                      ))}
                      {slots.length > 12 && (
                        <span style={styles.slotTag}>+{slots.length - 12} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div style={{ ...styles.availabilityCard, textAlign: 'center', color: '#5A3A2A', fontStyle: 'italic' }}>
            No availability set
          </div>
        )}
      </div>
    </div>
  );
}
