/**
 * Auto-Tagged Attributes Component
 * 
 * Displays AI-analyzed attributes from photos with confidence scores
 * Allows users to confirm or edit auto-tagged values
 */

import React, { useState } from 'react';
import { getAttributeDisplayName, getConfidenceColor } from '../utils/photoAnalysis';

const styles = {
  container: {
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  badge: {
    background: 'rgba(233, 69, 96, 0.2)',
    color: '#e94560',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  attributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  attributeCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    padding: '1rem',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'all 0.2s',
  },
  attributeCardHover: {
    borderColor: 'rgba(233, 69, 96, 0.3)',
    background: 'rgba(233, 69, 96, 0.05)',
  },
  attributeLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  },
  attributeValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '0.5rem',
    textTransform: 'capitalize',
  },
  confidenceBar: {
    height: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s',
  },
  confidenceText: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  button: {
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    background: '#4caf50',
    color: '#fff',
  },
  editButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  loadingState: {
    textAlign: 'center',
    padding: '2rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
};

export default function AutoTaggedAttributes({ 
  attributes = {}, 
  confidence = {},
  onConfirm,
  onEdit,
  isLoading = false,
}) {
  const [hoveredAttribute, setHoveredAttribute] = useState(null);
  const [confirmedAttributes, setConfirmedAttributes] = useState(new Set());
  
  const attributeEntries = Object.entries(attributes).filter(([key, value]) => value !== null && value !== undefined);
  
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={{ marginBottom: '0.5rem' }}>🤖</div>
          <div>Analyzing your photos...</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
            This may take a few seconds
          </div>
        </div>
      </div>
    );
  }
  
  if (attributeEntries.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📸</div>
          <div>No auto-tagged attributes yet</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', opacity: 0.7 }}>
            Upload photos to get AI-powered attribute suggestions
          </div>
        </div>
      </div>
    );
  }
  
  const handleConfirm = (attributeKey) => {
    setConfirmedAttributes(prev => new Set([...prev, attributeKey]));
    if (onConfirm) {
      onConfirm(attributeKey, attributes[attributeKey]);
    }
  };
  
  const handleEdit = (attributeKey) => {
    if (onEdit) {
      onEdit(attributeKey, attributes[attributeKey]);
    }
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>🤖</span>
          AI Auto-Tagged Attributes
        </div>
        <div style={styles.badge}>
          {attributeEntries.length} Detected
        </div>
      </div>
      
      <div style={styles.attributesGrid}>
        {attributeEntries.map(([key, value]) => {
          const conf = confidence[key] || 0;
          const isConfirmed = confirmedAttributes.has(key);
          const isHovered = hoveredAttribute === key;
          
          return (
            <div
              key={key}
              style={{
                ...styles.attributeCard,
                ...(isHovered ? styles.attributeCardHover : {}),
                ...(isConfirmed ? { borderColor: '#4caf50', opacity: 0.7 } : {}),
              }}
              onMouseEnter={() => setHoveredAttribute(key)}
              onMouseLeave={() => setHoveredAttribute(null)}
            >
              <div style={styles.attributeLabel}>
                {getAttributeDisplayName(key)}
              </div>
              
              <div style={styles.attributeValue}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
              </div>
              
              <div style={styles.confidenceBar}>
                <div
                  style={{
                    ...styles.confidenceFill,
                    width: `${conf}%`,
                    background: getConfidenceColor(conf),
                  }}
                />
              </div>
              
              <div style={styles.confidenceText}>
                {conf}% confidence
              </div>
              
              {!isConfirmed && (
                <div style={styles.actionButtons}>
                  <button
                    style={{ ...styles.button, ...styles.confirmButton }}
                    onClick={() => handleConfirm(key)}
                  >
                    ✓ Confirm
                  </button>
                  <button
                    style={{ ...styles.button, ...styles.editButton }}
                    onClick={() => handleEdit(key)}
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
              
              {isConfirmed && (
                <div style={{ ...styles.confidenceText, color: '#4caf50', marginTop: '0.5rem' }}>
                  ✓ Confirmed
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {confirmedAttributes.size > 0 && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(76, 175, 80, 0.1)', borderRadius: '8px', fontSize: '0.85rem', color: '#4caf50' }}>
          ✓ {confirmedAttributes.size} attribute(s) confirmed. These will be saved to your profile.
        </div>
      )}
    </div>
  );
}

