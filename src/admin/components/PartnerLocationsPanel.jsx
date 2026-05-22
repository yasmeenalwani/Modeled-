import React from 'react';
import {
  parseLocationSites,
  formatLocationLine,
  formatHoursSummary,
} from '../../utils/partnerProfile';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  },
  card: {
    background: 'rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '1.25rem',
  },
  cardPrimary: {
    borderColor: 'rgba(139,30,63,0.5)',
    boxShadow: '0 0 0 1px rgba(139,30,63,0.2)',
  },
  name: {
    fontSize: '1.05rem',
    fontWeight: '600',
    marginBottom: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    fontSize: '0.65rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    background: 'rgba(139,30,63,0.25)',
    color: '#f0a8b8',
  },
  seasonal: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  row: {
    fontSize: '0.88rem',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: '0.4rem',
    lineHeight: 1.45,
  },
  hours: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.75rem',
    lineHeight: 1.5,
  },
  empty: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
};

export default function PartnerLocationsPanel({ locationSites }) {
  const sites = parseLocationSites(locationSites);

  if (!sites.length) {
    return <p style={styles.empty}>No locations on file. Add sites in admin or re-import from the partner website.</p>;
  }

  return (
    <div style={styles.grid}>
      {sites.map((site) => (
        <div
          key={site.id || site.name}
          style={{
            ...styles.card,
            ...(site.isPrimary ? styles.cardPrimary : {}),
          }}
        >
          <div style={styles.name}>
            {site.name}
            {site.neighborhood && (
              <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
                ({site.neighborhood})
              </span>
            )}
            {site.isPrimary && <span style={styles.badge}>Primary</span>}
            {site.seasonal && <span style={{ ...styles.badge, ...styles.seasonal }}>Seasonal</span>}
          </div>
          {site.seasonNote && <div style={styles.row}>{site.seasonNote}</div>}
          <div style={styles.row}>📍 {formatLocationLine(site) || site.address || '—'}</div>
          {site.phone && <div style={styles.row}>📞 {site.phone}</div>}
          {site.hours && (
            <div style={styles.hours}>
              {formatHoursSummary(site.hours)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
