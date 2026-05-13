// ============================================
// ROLE MODEL - Professional Applications
// Pros who want to participate in 4th Chair
// ============================================

import React, { useState } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#10b981',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
  },
  professionalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '1.5rem',
  },
  proCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  proHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  proName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#10b981',
  },
  proSalon: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.25rem',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusApplied: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  statusApproved: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
  },
  whySection: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(16,185,129,0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(16,185,129,0.1)',
  },
  whyLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  whyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  careInterests: {
    marginTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  interestTag: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#10b981',
  },
};

// Mock professional applications
const mockProApplications = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    salon: 'Luxe Studio',
    email: 'sarah.m@luxestudio.com',
    phone: '(555) 111-2222',
    why: 'I\'ve been doing hair for 15 years, and the moments that mean the most aren\'t the high-end clients—they\'re the ones where I get to help someone see themselves differently. When someone sits in my chair after a hard time, whether it\'s illness, loss, or just life being heavy, I get to be part of their healing. That\'s why I do this. The 4th Chair feels like an extension of that calling.',
    careInterests: ['Cancer survivors', 'Domestic violence survivors', 'Transitions'],
    specialties: ['Color', 'Cuts', 'Styling'],
    status: 'approved',
    appliedAt: '2024-11-15',
  },
  {
    id: 2,
    name: 'Mike Thompson',
    salon: 'The Cut Collective',
    email: 'mike.t@cutcollective.com',
    phone: '(555) 222-3333',
    why: 'I grew up watching my mom struggle to afford basic care. She\'d go years without a haircut because it wasn\'t a priority when you\'re choosing between groceries and rent. Now that I\'m in a position to give back, I want to. Every person deserves to feel good in their own skin, regardless of their circumstances.',
    careInterests: ['Low-income families', 'Single parents', 'Mental health'],
    specialties: ['Cuts', 'Fades', 'Men\'s grooming'],
    status: 'approved',
    appliedAt: '2024-11-20',
  },
  {
    id: 3,
    name: 'Lisa Kim',
    salon: 'Color Theory',
    email: 'lisa.k@colortheory.com',
    phone: '(555) 333-4444',
    why: 'Beauty is healing. I\'ve seen clients transform not just their hair, but their entire outlook after a service. When someone is going through something difficult, a moment of care can be everything. I want to be part of making that accessible.',
    careInterests: ['Medical recovery', 'Life transitions', 'Celebrations'],
    specialties: ['Color', 'Highlights', 'Color correction'],
    status: 'applied',
    appliedAt: '2024-12-01',
  },
];

export default function RoleModelProfessionalsPage() {
  const [selectedPro, setSelectedPro] = useState(null);

  const getStatusStyle = (status) => {
    return {
      ...styles.statusBadge,
      ...(status === 'approved' ? styles.statusApproved : styles.statusApplied),
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Professional Applications</h1>
        <p style={styles.subtitle}>
          Stylists who want to participate in The 4th Chair program
        </p>
      </div>

      <div style={styles.professionalsGrid}>
        {mockProApplications.map(pro => (
          <div key={pro.id} style={styles.proCard}>
            <div style={styles.proHeader}>
              <div>
                <div style={styles.proName}>{pro.name}</div>
                <div style={styles.proSalon}>{pro.salon}</div>
              </div>
              <div style={getStatusStyle(pro.status)}>
                {pro.status}
              </div>
            </div>

            <div style={styles.whySection}>
              <div style={styles.whyLabel}>Why They Want to Participate</div>
              <div style={styles.whyText}>{pro.why}</div>
            </div>

            <div style={styles.careInterests}>
              {pro.careInterests.map((interest, i) => (
                <span key={i} style={styles.interestTag}>
                  {interest}
                </span>
              ))}
            </div>

            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              Specialties: {pro.specialties.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

