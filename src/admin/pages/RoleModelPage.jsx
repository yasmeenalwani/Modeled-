// ============================================
// ROLE MODEL - Main Landing Page
// The philanthropic heartbeat of Modeled
// ============================================

import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '16px',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '700',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1.5rem',
    fontStyle: 'italic',
  },
  heroTagline: {
    fontSize: '1rem',
    color: 'rgba(16,185,129,0.9)',
    fontWeight: '500',
    marginTop: '1rem',
  },
  pillars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  pillar: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  pillarTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pillarDescription: {
    color: 'rgba(255,255,255,0.6)',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
  },
  pillarStatus: {
    fontSize: '0.85rem',
    color: 'rgba(16,185,129,0.8)',
    fontStyle: 'italic',
  },
  ctaSection: {
    textAlign: 'center',
    padding: '2rem',
    background: 'rgba(16,185,129,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(16,185,129,0.2)',
  },
  ctaTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#10b981',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: '1.5rem',
  },
  ctaButton: {
    padding: '0.75rem 2rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  ctaButtonSecondary: {
    background: 'transparent',
    border: '1px solid #10b981',
    color: '#10b981',
  },
  values: {
    marginTop: '3rem',
    padding: '2rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(16,185,129,0.1)',
  },
  valuesTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    color: '#10b981',
    textAlign: 'center',
  },
  valuesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
  },
  valueCard: {
    textAlign: 'center',
    padding: '1.5rem',
  },
  valueIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  valueName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  valueDesc: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

export default function RoleModelPage() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>ROLE Model</h1>
        <p style={styles.heroSubtitle}>
          Where beauty funds care, and every chair is a chance to show up.
        </p>
        <p style={styles.heroTagline}>
          "Because every seat counts—in business and in beauty."
        </p>
      </div>

      {/* Three Pillars */}
      <div style={styles.pillars}>
        {/* Pillar 1: The 4th Chair */}
        <div 
          style={styles.pillar}
          onClick={() => navigate('/admin/role-model/applications')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
            e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <div style={styles.pillarTitle}>
            <span>💺</span>
            The 4th Chair
          </div>
          <p style={styles.pillarDescription}>
            Monthly sponsored beauty service by application. Share your story, tell us why this moment matters—healing, transition, celebration, or survival. One seat saved with intention.
          </p>
          <div style={styles.pillarStatus}>Active • Monthly Selection</div>
        </div>

        {/* Pillar 2: Wear Care (Merch) */}
        <div 
          style={styles.pillar}
          onClick={() => navigate('/admin/role-model/shop')}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
            e.currentTarget.style.background = 'rgba(16,185,129,0.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
          }}
        >
          <div style={styles.pillarTitle}>
            <span>👕</span>
            Wear Care
          </div>
          <p style={styles.pillarDescription}>
            10% of every merch purchase funds mental health and self-care access. "Wear your role model." Round up at checkout to amplify impact.
          </p>
          <div style={styles.pillarStatus}>Active • Shop Management</div>
        </div>

        {/* Pillar 3: Wig On. Wig Off. */}
        <div style={styles.pillar}>
          <div style={styles.pillarTitle}>
            <span>💇</span>
            Wig On. Wig Off.
          </div>
          <p style={styles.pillarDescription}>
            Donate 10+ inches of hair to Locks of Love, and Modeled covers your service in full. A haircut becomes a transformation—for two.
          </p>
          <div style={styles.pillarStatus}>Partnership Pending</div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Your ROLE is Evergreen</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
          Your role is the stem—what connects you to others. Every action multiplies.
        </p>
        <div style={styles.ctaButtons}>
          <button
            style={styles.ctaButton}
            onClick={() => navigate('/admin/role-model/applications')}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            Review Applications
          </button>
          <button
            style={{ ...styles.ctaButton, ...styles.ctaButtonSecondary }}
            onClick={() => navigate('/admin/role-model/metrics')}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(16,185,129,0.1)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'transparent';
            }}
          >
            View Impact Metrics
          </button>
        </div>
      </div>

      {/* Values Section */}
      <div style={styles.values}>
        <h2 style={styles.valuesTitle}>ROLE Model Values</h2>
        <div style={styles.valuesGrid}>
          <div style={styles.valueCard}>
            <div style={styles.valueIcon}>🌿</div>
            <div style={styles.valueName}>Evergreen</div>
            <div style={styles.valueDesc}>Your role is constant, growing, connecting</div>
          </div>
          <div style={styles.valueCard}>
            <div style={styles.valueIcon}>💚</div>
            <div style={styles.valueName}>Care</div>
            <div style={styles.valueDesc}>Beauty heals through service and support</div>
          </div>
          <div style={styles.valueCard}>
            <div style={styles.valueIcon}>👥</div>
            <div style={styles.valueName}>Representation</div>
            <div style={styles.valueDesc}>Every texture, story, identity gets a seat</div>
          </div>
          <div style={styles.valueCard}>
            <div style={styles.valueIcon}>♾️</div>
            <div style={styles.valueName}>Impact</div>
            <div style={styles.valueDesc}>We give back exponentially</div>
          </div>
        </div>
      </div>
    </div>
  );
}

