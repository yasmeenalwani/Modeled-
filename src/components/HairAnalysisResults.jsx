import React, { useState } from 'react';
import {
  getSimpleAttributes,
  getConfidenceScores,
  hasLowConfidenceAttributes,
  getHairLengthLabel,
  getHairColorLabel,
  getHairTextureLabel,
  getHairDensityLabel,
  getConfidenceBadgeColor,
  submitHairValidation,
  HAIR_LENGTH_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_TEXTURE_OPTIONS,
  HAIR_DENSITY_OPTIONS,
} from '../utils/hairAnalysis';

/**
 * HairAnalysisResults - User-facing component for displaying and validating hair attributes
 * 
 * Shows simple attributes to users (e.g., "Curly", "Brown", "Long")
 * Allows users to confirm or correct the AI analysis (proprietary data collection)
 */
export default function HairAnalysisResults({ 
  analysisResult, 
  userId,
  onValidationComplete,
  showValidation = true,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  
  const simpleAttributes = getSimpleAttributes(analysisResult);
  const confidenceScores = getConfidenceScores(analysisResult);
  const needsValidation = hasLowConfidenceAttributes(analysisResult);
  
  if (!simpleAttributes) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <span style={styles.loadingIcon}>⏳</span>
          <span>Analyzing your photos...</span>
        </div>
      </div>
    );
  }
  
  const handleStartEdit = () => {
    setEditedAttributes({ ...simpleAttributes });
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setEditedAttributes(null);
    setIsEditing(false);
  };
  
  const handleAttributeChange = (attribute, value) => {
    setEditedAttributes(prev => ({
      ...prev,
      [attribute]: value,
    }));
  };
  
  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const validatedData = editedAttributes || simpleAttributes;
      
      // Calculate accuracy (how much user changed vs original)
      let changesCount = 0;
      Object.keys(simpleAttributes).forEach(key => {
        if (validatedData[key] !== simpleAttributes[key]) {
          changesCount++;
        }
      });
      const accuracy = ((Object.keys(simpleAttributes).length - changesCount) / Object.keys(simpleAttributes).length) * 100;
      
      await submitHairValidation(userId, {
        ...validatedData,
        originalAttributes: simpleAttributes,
        accuracy,
        validatedAt: new Date().toISOString(),
      });
      
      setValidationComplete(true);
      setIsEditing(false);
      
      if (onValidationComplete) {
        onValidationComplete(validatedData);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderAttribute = (label, value, attributeKey, options) => {
    const confidence = confidenceScores[attributeKey];
    const confidenceColor = getConfidenceBadgeColor(confidence);
    
    if (isEditing && options) {
      return (
        <div style={styles.attributeRow}>
          <span style={styles.attributeLabel}>{label}</span>
          <select
            value={editedAttributes?.[attributeKey] || value}
            onChange={(e) => handleAttributeChange(attributeKey, e.target.value)}
            style={styles.select}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }
    
    return (
      <div style={styles.attributeRow}>
        <span style={styles.attributeLabel}>{label}</span>
        <div style={styles.attributeValue}>
          <span style={styles.valueText}>{value}</span>
          {confidence && (
            <span 
              style={{
                ...styles.confidenceBadge,
                backgroundColor: confidenceColor,
              }}
              title={`${confidence}% confidence`}
            >
              {confidence >= 85 ? '✓' : confidence >= 70 ? '~' : '?'}
            </span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {validationComplete ? '✅ Your Hair Profile' : '✨ Your Hair Analysis'}
        </h3>
        {!validationComplete && needsValidation && (
          <span style={styles.validationHint}>
            Please confirm your hair attributes
          </span>
        )}
      </div>
      
      <div style={styles.attributesGrid}>
        {renderAttribute(
          '📏 Length',
          getHairLengthLabel(simpleAttributes.hairLength),
          'hairLength',
          HAIR_LENGTH_OPTIONS
        )}
        
        {renderAttribute(
          '🎨 Color',
          getHairColorLabel(simpleAttributes.hairColor),
          'hairColor',
          HAIR_COLOR_OPTIONS
        )}
        
        {renderAttribute(
          '〰️ Texture',
          getHairTextureLabel(simpleAttributes.hairTexture),
          'hairTexture',
          HAIR_TEXTURE_OPTIONS
        )}
        
        {renderAttribute(
          '📊 Density',
          getHairDensityLabel(simpleAttributes.hairDensity),
          'hairDensity',
          HAIR_DENSITY_OPTIONS
        )}
      </div>
      
      {showValidation && !validationComplete && (
        <div style={styles.actions}>
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={styles.confirmButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Confirm Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStartEdit}
                style={styles.editButton}
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                style={styles.confirmButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Confirming...' : 'Looks Good! ✓'}
              </button>
            </>
          )}
        </div>
      )}
      
      {validationComplete && (
        <div style={styles.successMessage}>
          <span>🎉 Thank you for confirming your hair profile!</span>
          <span style={styles.successSubtext}>This helps us make better matches for you.</span>
        </div>
      )}
      
      <div style={styles.footer}>
        <span style={styles.version}>
          Analysis v{analysisResult.analysisVersion || 'MVP-1.0'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2D2926',
    margin: '0 0 8px 0',
  },
  validationHint: {
    fontSize: '0.85rem',
    color: '#8B1E3F',
    fontStyle: 'italic',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '40px',
    color: '#666',
  },
  loadingIcon: {
    fontSize: '1.5rem',
    animation: 'spin 1s linear infinite',
  },
  attributesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  attributeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  attributeLabel: {
    fontSize: '0.95rem',
    color: '#495057',
    fontWeight: '500',
  },
  attributeValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  valueText: {
    fontSize: '0.95rem',
    color: '#2D2926',
    fontWeight: '600',
  },
  confidenceBadge: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    color: '#fff',
    fontWeight: 'bold',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #ced4da',
    fontSize: '0.95rem',
    color: '#2D2926',
    backgroundColor: '#fff',
    cursor: 'pointer',
    minWidth: '120px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '24px',
    justifyContent: 'center',
  },
  editButton: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid #8B1E3F',
    backgroundColor: 'transparent',
    color: '#8B1E3F',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: '1px solid #6c757d',
    backgroundColor: 'transparent',
    color: '#6c757d',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  confirmButton: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#8B1E3F',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  successMessage: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#d4edda',
    borderRadius: '10px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    color: '#155724',
  },
  successSubtext: {
    fontSize: '0.85rem',
    opacity: 0.8,
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    borderTop: '1px solid #e9ecef',
    paddingTop: '12px',
  },
  version: {
    fontSize: '0.75rem',
    color: '#adb5bd',
  },
};

