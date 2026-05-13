import React, { useState } from 'react';
import PhotoUploader from '../PhotoUploader';
import { getDocumentPath } from '../../utils/storage';
import { DOCUMENT_TYPES, CERTIFICATION_UNLOCKS, DOCUMENT_EXPIRY_WARNING_DAYS } from '../../utils/profileConstants';

const styles = {
  section: {
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
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  documentMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  warningBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: 'rgba(248, 81, 73, 0.2)',
    color: '#f85149',
    fontFamily: '"Alike", "Georgia", serif',
  },
  certTrack: {
    marginBottom: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  certHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  certName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  certStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  certUnlocks: {
    marginTop: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(76, 175, 80, 0.1)',
    borderRadius: '8px',
    fontSize: '0.8rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  unlocksTitle: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4caf50',
  },
  unlocksList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  unlockItem: {
    padding: '0.25rem 0',
    paddingLeft: '1rem',
    position: 'relative',
  },
};

export default function DocumentsCertifications({
  documents = [],
  certifications = {},
  externalCertifications = [],
  onDocumentAdd,
  onDocumentDelete,
  onExternalCertAdd,
  onExternalCertDelete,
  userId,
}) {
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [newDocument, setNewDocument] = useState({ type: 'License', expiryDate: '' });

  const checkExpiryWarning = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= DOCUMENT_EXPIRY_WARNING_DAYS;
  };

  const handleDocumentUpload = (results) => {
    if (results.length > 0) {
      onDocumentAdd({
        type: newDocument.type,
        url: results[0].url,
        key: results[0].key,
        expiryDate: newDocument.expiryDate || null,
        verified: false,
      });
      setNewDocument({ type: 'License', expiryDate: '' });
      setShowDocumentForm(false);
    }
  };

  return (
    <>
      {/* Documents */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Documents</span>
        </div>
        <p style={{
          fontSize: '0.85rem',
          color: '#5A3A2A',
          marginBottom: '1rem',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Upload license, insurance, and certifications. Expiry dates help us remind you before expiration.
        </p>

        {!showDocumentForm ? (
          <button
            onClick={() => setShowDocumentForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(139, 30, 63, 0.1)',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              borderRadius: '8px',
              color: '#8B1E3F',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
              marginBottom: '1rem',
            }}
          >
            + Add Document
          </button>
        ) : (
          <div style={{
            padding: '1rem',
            background: 'rgba(139, 30, 63, 0.05)',
            borderRadius: '10px',
            marginBottom: '1rem',
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#4A2A1A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Document Type
              </label>
              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(139, 30, 63, 0.2)',
                  borderRadius: '8px',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
              >
                {DOCUMENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#4A2A1A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={newDocument.expiryDate}
                onChange={(e) => setNewDocument({ ...newDocument, expiryDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid rgba(139, 30, 63, 0.2)',
                  borderRadius: '8px',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
              />
            </div>
            <PhotoUploader
              title="Upload Document"
              subtitle="PDF, JPG, PNG supported"
              maxFiles={1}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']}
              accentColor="#8B1E3F"
              existingPhotos={[]}
              pathGenerator={(filename) => getDocumentPath('certificates', userId, filename)}
              onUpload={handleDocumentUpload}
              userType="professional"
              contentType="documents"
            />
            <button
              onClick={() => setShowDocumentForm(false)}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '8px',
                color: '#4A2A1A',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <div style={styles.documentList}>
          {documents.map((doc, index) => {
            const isExpiring = checkExpiryWarning(doc.expiryDate);
            return (
              <div key={doc.key || index} style={styles.documentItem}>
                <div style={styles.documentInfo}>
                  <div style={styles.documentName}>{doc.type}</div>
                  <div style={styles.documentMeta}>
                    {doc.expiryDate 
                      ? `Expires: ${new Date(doc.expiryDate).toLocaleDateString()}`
                      : 'No expiry date'
                    }
                    {doc.verified && ' • Verified'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {isExpiring && (
                    <span style={styles.warningBadge}>
                      Expiring Soon
                    </span>
                  )}
                  <button
                    onClick={() => onDocumentDelete(doc)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: 'rgba(248, 81, 73, 0.1)',
                      border: '1px solid rgba(248, 81, 73, 0.3)',
                      borderRadius: '6px',
                      color: '#f85149',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontFamily: '"Alike", "Georgia", serif',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modeled Certifications */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Modeled Certifications</span>
        </div>
        {Object.entries(certifications).map(([key, cert]) => {
          const pct = Math.round((cert.completed / cert.total) * 100);
          const unlocks = CERTIFICATION_UNLOCKS[key];
          const isCertified = cert.status === 'certified';
          
          return (
            <div key={key} style={styles.certTrack}>
              <div style={styles.certHeader}>
                <div style={styles.certName}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
                <span style={{
                  ...styles.certStatus,
                  background: isCertified 
                    ? 'rgba(76,175,80,0.2)' 
                    : cert.status === 'in_progress'
                    ? 'rgba(255,193,7,0.2)'
                    : 'rgba(139, 30, 63, 0.1)',
                  color: isCertified 
                    ? '#4caf50' 
                    : cert.status === 'in_progress'
                    ? '#ffc107'
                    : '#5A3A2A',
                }}>
                  {isCertified ? 'CERTIFIED' : cert.status === 'in_progress' ? 'IN PROGRESS' : 'NOT STARTED'}
                </span>
              </div>
              {cert.status === 'in_progress' && (
                <div style={{
                  height: '8px',
                  background: 'rgba(139, 30, 63, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: '#ffc107',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              )}
              {isCertified && unlocks && (
                <div style={styles.certUnlocks}>
                  <div style={styles.unlocksTitle}>What you unlock:</div>
                  <ul style={styles.unlocksList}>
                    {unlocks.certified.map((unlock, i) => (
                      <li key={i} style={styles.unlockItem}>
                        <span style={{ position: 'absolute', left: 0, color: '#4caf50' }}>✓</span>
                        {unlock}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* External Certifications */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>External Certifications</span>
        </div>
        <p style={{
          fontSize: '0.85rem',
          color: '#5A3A2A',
          marginBottom: '1rem',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Add certifications from brands like Wella, Redken, etc.
        </p>
        <button
          onClick={() => {
            const brand = prompt('Brand name:');
            const name = prompt('Certification name:');
            const year = prompt('Year:');
            if (brand && name) {
              onExternalCertAdd({ brand, name, year: year || null });
            }
          }}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(139, 30, 63, 0.1)',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            borderRadius: '8px',
            color: '#8B1E3F',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: '"Alike", "Georgia", serif',
            marginBottom: '1rem',
          }}
        >
          + Add Certification
        </button>
        <div style={styles.documentList}>
          {externalCertifications.map((cert, index) => (
            <div key={index} style={styles.documentItem}>
              <div style={styles.documentInfo}>
                <div style={styles.documentName}>{cert.brand} - {cert.name}</div>
                <div style={styles.documentMeta}>
                  {cert.year ? `Year: ${cert.year}` : 'No year specified'}
                </div>
              </div>
              <button
                onClick={() => onExternalCertDelete(cert)}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'rgba(248, 81, 73, 0.1)',
                  border: '1px solid rgba(248, 81, 73, 0.3)',
                  borderRadius: '6px',
                  color: '#f85149',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

