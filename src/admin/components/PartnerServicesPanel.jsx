import React from 'react';
import { formatServicePrice, parseServicesList } from '../../utils/partnerServices';

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.88rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.65rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    verticalAlign: 'top',
  },
  name: { fontWeight: '600' },
  category: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'capitalize',
  },
  price: {
    fontWeight: '600',
    color: '#f0a8b8',
    whiteSpace: 'nowrap',
  },
  note: {
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.45)',
    marginTop: '0.35rem',
  },
  highlights: {
    marginTop: '0.5rem',
    paddingLeft: '1rem',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
  empty: { color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' },
  footnote: {
    marginTop: '1rem',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 1.5,
  },
};

export default function PartnerServicesPanel({ servicesList, pricingNote }) {
  const services = parseServicesList(servicesList);

  if (!services.length) {
    return <p style={styles.empty}>No services listed yet.</p>;
  }

  return (
    <>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Service</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Price range</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc) => (
            <tr key={svc.name || svc}>
              <td style={styles.td}>
                <div style={styles.name}>{svc.name || svc}</div>
                {svc.pricingNote && <div style={styles.note}>{svc.pricingNote}</div>}
                {Array.isArray(svc.highlights) && svc.highlights.length > 0 && (
                  <ul style={styles.highlights}>
                    {svc.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
              </td>
              <td style={styles.td}>
                <span style={styles.category}>{svc.category || '—'}</span>
              </td>
              <td style={{ ...styles.td, ...styles.price }}>{formatServicePrice(svc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {pricingNote && <p style={styles.footnote}>{pricingNote}</p>}
    </>
  );
}
