import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #FFFEF9 0%, #f5ebe3 100%)',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    padding: '2.5rem 1.5rem',
  },
  inner: { maxWidth: '960px', margin: '0 auto' },
  title: { fontSize: '2rem', fontWeight: '700', color: '#8B1E3F', marginBottom: '0.5rem' },
  sub: { color: '#5A3A2A', marginBottom: '2rem', lineHeight: 1.6 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  card: {
    display: 'block',
    padding: '1.5rem',
    borderRadius: '14px',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardTitle: { fontSize: '1.15rem', fontWeight: '600', color: '#8B1E3F', marginBottom: '0.35rem' },
  cardSub: { fontSize: '0.9rem', color: '#5A3A2A', lineHeight: 1.5 },
  sectionTitle: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#8B1E3F' },
  docList: { listStyle: 'none', padding: 0, margin: 0 },
  docItem: { marginBottom: '0.5rem' },
  docLink: { color: '#8B1E3F', textDecoration: 'underline' },
  note: {
    marginTop: '2rem',
    padding: '1rem 1.25rem',
    borderRadius: '10px',
    background: 'rgba(139, 30, 63, 0.06)',
    fontSize: '0.85rem',
    color: '#5A3A2A',
  },
};

const DEMOS = [
  {
    to: '/demo/seraphina/profile',
    title: 'Seraphina Luna',
    subtitle: 'Model portal — profile, matched opportunities, looks, play',
  },
  {
    to: '/demo/sarah/profile',
    title: 'Sarah Mitchell',
    subtitle: 'Professional portal — profile, matching, portfolio, calendar',
  },
  {
    to: '/demo/partner',
    title: 'Luxe Studio',
    subtitle: 'Partner portal — dashboard, team, schedule, campaigns',
  },
];

const DOC_LINKS = [
  { label: 'Print hub (start here)', path: 'docs/PRINT_HUB.md' },
  { label: 'June launch plan', path: 'docs/LAUNCH_PLAN_JUNE_2026.md' },
  { label: 'E2E salon → model flow', path: 'docs/E2E_SALON_TO_MODEL_FLOW.md' },
  { label: 'AWS architecture & costs', path: 'docs/architecture/AWS_ARCHITECTURE_AND_COSTS_2026-01-05.md' },
  { label: 'Database schema index', path: 'docs/database/DATABASE_SCHEMA_INDEX_2026-01-05.md' },
  { label: 'Deployment checklist', path: 'docs/deployment/2026-01-05_DEPLOYMENT_CHECKLIST.md' },
  { label: 'Full documentation index', path: 'DOCUMENTATION_INDEX.md' },
];

export default function DemoHub() {
  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <h1 style={styles.title}>Modeled — Demo & docs</h1>
        <p style={styles.sub}>
          Open these links in a browser tab to show portals <strong>without signing in</strong>.
          Use your editor or GitHub to open markdown docs for printing.
        </p>

        <div style={styles.grid}>
          {DEMOS.map((d) => (
            <Link key={d.to} to={d.to} style={styles.card}>
              <div style={styles.cardTitle}>{d.title}</div>
              <div style={styles.cardSub}>{d.subtitle}</div>
            </Link>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>Documentation (print / organize)</h2>
        <ul style={styles.docList}>
          {DOC_LINKS.map((doc) => (
            <li key={doc.path} style={styles.docItem}>
              <span style={styles.docLink}>{doc.label}</span>
              <span style={{ color: '#5A3A2A', fontSize: '0.85rem' }}> — {doc.path}</span>
            </li>
          ))}
        </ul>

        <p style={styles.note}>
          Tip: In VS Code, open <code>docs/PRINT_HUB.md</code> → Markdown: Open Preview → Print (Ctrl+P).
          Signed-in portals remain at <code>/model-portal</code>, <code>/portal</code>, <code>/partner-portal</code>.
        </p>

        <p style={{ marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#8B1E3F' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
