import React from 'react';
import { useLocation } from 'react-router-dom';

const styles = {
  container: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 200px)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    opacity: 0.5,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.8)',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.4)',
    maxWidth: '400px',
  },
  path: {
    marginTop: '2rem',
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontFamily: 'monospace',
    color: 'rgba(255,255,255,0.4)',
  },
};

const pageInfo = {
  '/admin/trends': { icon: '📈', title: 'Trend Analysis', desc: 'Visualize trends and patterns over time' },
  '/admin/revenue': { icon: '💰', title: 'Revenue Tracker', desc: 'Track earnings and financial metrics' },
  '/admin/calendar': { icon: '🗓️', title: 'Calendar View', desc: 'Visual calendar of all appointments' },
  '/admin/waitlist': { icon: '⏳', title: 'Waitlist', desc: 'Models waiting for booking slots' },
  '/admin/criteria': { icon: '⚙️', title: 'Match Criteria', desc: 'Configure matching algorithm weights' },
  '/admin/services': { icon: '💇', title: 'Service Catalog', desc: 'Manage available services and pricing' },
  '/admin/packages': { icon: '📦', title: 'Packages & Promos', desc: 'Create bundles and promotional offers' },
  '/admin/performance': { icon: '⭐', title: 'Performance', desc: 'Stylist and model performance metrics' },
  '/admin/feedback': { icon: '💬', title: 'Feedback', desc: 'Review and manage feedback submissions' },
  '/admin/campaigns': { icon: '📣', title: 'Campaigns', desc: 'Marketing campaigns and analytics' },
};

export default function PlaceholderPage() {
  const location = useLocation();
  const info = pageInfo[location.pathname] || { 
    icon: '🚧', 
    title: 'Coming Soon', 
    desc: 'This page is under construction' 
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{info.icon}</div>
      <h1 style={styles.title}>{info.title}</h1>
      <p style={styles.subtitle}>{info.desc}</p>
      <div style={styles.path}>{location.pathname}</div>
    </div>
  );
}

