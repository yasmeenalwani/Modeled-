import React from 'react';
import { useLocation } from 'react-router-dom';

export default function PartnerPlaceholder() {
  const location = useLocation();
  const pageName = location.pathname.split('/').pop();
  
  const pageInfo = {
    services: { title: 'Service Menu', icon: '', desc: 'Manage your services and pricing' },
    compliance: { title: 'Compliance', icon: '📋', desc: 'Licenses, insurance, and certifications' },
    training: { title: 'Training Progress', icon: '', desc: 'Track team training advancement' },
    bookings: { title: 'Bookings', icon: '', desc: 'View and manage all bookings' },
    invoices: { title: 'Invoices', icon: '🧾', desc: 'Invoice history and submissions' },
    messages: { title: 'Messages', icon: '', desc: 'Communication with Modeled team' },
    assets: { title: 'Marketing Assets', icon: '', desc: 'Logos, templates, and brand materials' },
  };

  const info = pageInfo[pageName] || { title: 'Coming Soon', icon: '🚀', desc: 'This feature is being built' };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      textAlign: 'center',
      paddingTop: '4rem',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>{info.icon}</div>
      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '0.75rem' }}>
        {info.title}
      </h1>
      <p style={{ 
        fontSize: '1.1rem', 
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '2rem',
      }}>
        {info.desc}
      </p>
      <div style={{
        padding: '2rem',
        background: 'rgba(88,166,255,0.1)',
        border: '1px solid rgba(88,166,255,0.2)',
        borderRadius: '16px',
        maxWidth: '400px',
        margin: '0 auto',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛠️</div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
          This page is under construction. Check back soon!
        </p>
      </div>
    </div>
  );
}

