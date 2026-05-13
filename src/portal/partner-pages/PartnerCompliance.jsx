// ============================================
// COMPLIANCE - Track licenses, insurance, certifications
// ============================================

import React, { useState } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock compliance documents
const mockDocuments = [
  {
    id: 1,
    type: 'license',
    name: 'Business License',
    issuingOrg: 'NYC Department of Consumer Affairs',
    issueDate: '2024-01-15',
    expirationDate: '2025-01-15',
    status: 'valid',
    daysUntilExpiry: 35,
  },
  {
    id: 2,
    type: 'insurance',
    name: 'General Liability Insurance',
    issuingOrg: 'State Farm Insurance',
    issueDate: '2024-03-01',
    expirationDate: '2025-03-01',
    status: 'valid',
    daysUntilExpiry: 85,
  },
  {
    id: 3,
    type: 'certification',
    name: 'OSHA Safety Certification',
    issuingOrg: 'OSHA',
    issueDate: '2023-06-10',
    expirationDate: '2024-12-10',
    status: 'expiring',
    daysUntilExpiry: 0,
  },
  {
    id: 4,
    type: 'license',
    name: 'Cosmetology License',
    issuingOrg: 'NY State Board of Cosmetology',
    issueDate: '2022-05-20',
    expirationDate: '2024-11-20',
    status: 'expired',
    daysUntilExpiry: -20,
  },
];

export default function PartnerCompliance() {
  const [filter, setFilter] = useState('all');

  const filteredDocs = filter === 'all'
    ? mockDocuments
    : mockDocuments.filter(doc => doc.type === filter);

  const stats = {
    total: mockDocuments.length,
    valid: mockDocuments.filter(d => d.status === 'valid').length,
    expiring: mockDocuments.filter(d => d.status === 'expiring').length,
    expired: mockDocuments.filter(d => d.status === 'expired').length,
  };

  const expiringSoon = mockDocuments.filter(d => d.daysUntilExpiry <= 30 && d.daysUntilExpiry >= 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Compliance 📋</h1>
          <p style={styles.subtitle}>
            Track licenses, insurance, and certifications with expiration alerts
          </p>
        </div>
        <button style={styles.addBtn}>
          + Add Document
        </button>
      </div>

      {/* Alert Banner */}
      {expiringSoon.length > 0 && (
        <div style={{
          background: 'rgba(210,153,34,0.1)',
          border: '1px solid rgba(210,153,34,0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚠️</span>
          <div>
            <strong style={{ color: '#d29922' }}>
              {expiringSoon.length} document{expiringSoon.length > 1 ? 's' : ''} expiring soon
            </strong>
            <p style={{
              color: '#5A3A2A',
              fontSize: '0.85rem',
              marginTop: '0.25rem',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              Review and renew before expiration
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Total Documents
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3fb950', fontFamily: '"Alike", "Georgia", serif' }}>{stats.valid}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Valid
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d29922', fontFamily: '"Alike", "Georgia", serif' }}>{stats.expiring}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Expiring Soon
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f85149', fontFamily: '"Alike", "Georgia", serif' }}>{stats.expired}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Expired
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {[
          { key: 'all', label: 'All Documents' },
          { key: 'license', label: 'Licenses' },
          { key: 'insurance', label: 'Insurance' },
          { key: 'certification', label: 'Certifications' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              padding: '0.5rem 1rem',
              background: filter === f.key ? 'rgba(139, 30, 63, 0.1)' : '#FFFEF9',
              border: `1px solid ${filter === f.key ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
              borderRadius: '6px',
              color: filter === f.key ? '#8B1E3F' : '#4A2A1A',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: '"Alike", "Georgia", serif',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredDocs.map(doc => {
          const statusColor = doc.status === 'valid' ? '#3fb950' :
                             doc.status === 'expiring' ? '#d29922' : '#f85149';
          const statusBg = doc.status === 'valid' ? 'rgba(46,160,67,0.2)' :
                          doc.status === 'expiring' ? 'rgba(210,153,34,0.2)' : 'rgba(248,81,73,0.2)';

          return (
            <div
              key={doc.id}
              style={{
                background: '#FFFEF9',
                border: '1px solid rgba(139, 30, 63, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#4A2A1A',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    {doc.name}
                  </h3>
                  <span style={{
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    background: 'rgba(139, 30, 63, 0.05)',
                    color: '#5A3A2A',
                    textTransform: 'capitalize',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    {doc.type}
                  </span>
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#5A3A2A',
                  marginBottom: '0.5rem',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {doc.issuingOrg}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  color: '#5A3A2A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  Issued: {new Date(doc.issueDate).toLocaleDateString()} • 
                  Expires: {new Date(doc.expirationDate).toLocaleDateString()}
                  {doc.daysUntilExpiry >= 0 && (
                    <span style={{ marginLeft: '0.5rem', color: statusColor }}>
                      ({doc.daysUntilExpiry} days remaining)
                    </span>
                  )}
                  {doc.daysUntilExpiry < 0 && (
                    <span style={{ marginLeft: '0.5rem', color: '#f85149' }}>
                      (Expired {Math.abs(doc.daysUntilExpiry)} days ago)
                    </span>
                  )}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <span style={{
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: statusBg,
                  color: statusColor,
                }}>
                  {doc.status === 'valid' ? 'Valid' :
                   doc.status === 'expiring' ? '⚠ Expiring Soon' : '✗ Expired'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(139, 30, 63, 0.05)',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    borderRadius: '4px',
                    color: '#4A2A1A',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    View
                  </button>
                  <button style={{
                    padding: '0.4rem 0.8rem',
                    background: 'rgba(139, 30, 63, 0.05)',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    borderRadius: '4px',
                    color: '#4A2A1A',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    Renew
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

