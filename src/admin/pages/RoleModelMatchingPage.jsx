// ============================================
// ROLE MODEL - Matching Interface
// Manual matching by Yasmeen with intention
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
  matchingInterface: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginTop: '2rem',
  },
  column: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  columnTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#10b981',
  },
  recipientCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  recipientCardSelected: {
    borderColor: '#10b981',
    background: 'rgba(16,185,129,0.1)',
  },
  proCard: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  proCardSelected: {
    borderColor: '#10b981',
    background: 'rgba(16,185,129,0.1)',
  },
  matchButton: {
    width: '100%',
    padding: '1rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '2rem',
    transition: 'all 0.2s ease',
  },
  matchButtonDisabled: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.3)',
    cursor: 'not-allowed',
  },
};

// Mock data
const selectedRecipients = [
  { id: 1, name: 'Jamie Chen', story: 'Transitioning, hair dysphoria...', careNeeds: ['Gender-affirming', 'Confidence building'] },
  { id: 2, name: 'Sarah Johnson', story: 'Single mother, left abusive relationship...', careNeeds: ['Rebuilding confidence', 'Self-care'] },
];

const approvedPros = [
  { id: 1, name: 'Sarah Mitchell', salon: 'Luxe Studio', careInterests: ['Cancer survivors', 'Domestic violence survivors'], specialties: ['Color', 'Cuts'] },
  { id: 2, name: 'Mike Thompson', salon: 'The Cut Collective', careInterests: ['Low-income families', 'Single parents'], specialties: ['Cuts', 'Fades'] },
];

export default function RoleModelMatchingPage() {
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [selectedPro, setSelectedPro] = useState(null);

  const canMatch = selectedRecipient && selectedPro;

  const handleMatch = () => {
    if (canMatch) {
      // Handle matching logic
      console.log('Match:', { recipient: selectedRecipient, pro: selectedPro });
      alert(`Matched ${selectedRecipient.name} with ${selectedPro.name}! This connection will be made with care and intention.`);
      setSelectedRecipient(null);
      setSelectedPro(null);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>4th Chair Matching</h1>
        <p style={styles.subtitle}>
          Match selected recipients with professionals based on shared values and care interests
        </p>
      </div>

      <div style={styles.matchingInterface}>
        {/* Selected Recipients */}
        <div style={styles.column}>
          <h2 style={styles.columnTitle}>Selected Recipients</h2>
          {selectedRecipients.map(recipient => (
            <div
              key={recipient.id}
              style={{
                ...styles.recipientCard,
                ...(selectedRecipient?.id === recipient.id ? styles.recipientCardSelected : {}),
              }}
              onClick={() => setSelectedRecipient(recipient)}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                {recipient.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                {recipient.story.substring(0, 100)}...
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Care needs: {recipient.careNeeds.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Approved Professionals */}
        <div style={styles.column}>
          <h2 style={styles.columnTitle}>Approved Professionals</h2>
          {approvedPros.map(pro => (
            <div
              key={pro.id}
              style={{
                ...styles.proCard,
                ...(selectedPro?.id === pro.id ? styles.proCardSelected : {}),
              }}
              onClick={() => setSelectedPro(pro)}
            >
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                {pro.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                {pro.salon}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                Care interests: {pro.careInterests.join(', ')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Specialties: {pro.specialties.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Button */}
      <button
        style={{
          ...styles.matchButton,
          ...(!canMatch ? styles.matchButtonDisabled : {}),
        }}
        onClick={handleMatch}
        disabled={!canMatch}
      >
        {canMatch 
          ? `Create Match: ${selectedRecipient.name} ↔ ${selectedPro.name}`
          : 'Select a recipient and professional to match'
        }
      </button>
    </div>
  );
}

