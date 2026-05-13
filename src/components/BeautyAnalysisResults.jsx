import React, { useState } from 'react';
import {
  getSimpleBeautyAttributes,
  getBeautyConfidenceScores,
  getSkinToneLabel,
  getSkinToneEmoji,
  getSkinUndertoneLabel,
  getSkinTypeLabel,
  getFaceShapeLabel,
  getFaceShapeIcon,
  getEyeColorLabel,
  getEyeColorEmoji,
  getEyeShapeLabel,
  getEyebrowShapeLabel,
  getEyebrowThicknessLabel,
  getLipShapeLabel,
  getLipSizeLabel,
  getConfidenceBadgeColor,
  SKIN_TONE_OPTIONS,
  SKIN_UNDERTONE_OPTIONS,
  FACE_SHAPE_OPTIONS,
  EYE_COLOR_OPTIONS,
  EYE_SHAPE_OPTIONS,
  EYEBROW_SHAPE_OPTIONS,
  LIP_SHAPE_OPTIONS,
} from '../utils/beautyAnalysis';

/**
 * BeautyAnalysisResults - User-facing component for displaying and validating beauty attributes
 * 
 * Shows simple attributes to users (e.g., "Medium skin, Warm undertone, Oval face")
 * Allows users to confirm or correct the AI analysis (proprietary data collection)
 */
export default function BeautyAnalysisResults({ 
  analysisResult, 
  userId,
  onValidationComplete,
  showValidation = true,
  compact = false,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAttributes, setEditedAttributes] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  
  const simpleAttributes = getSimpleBeautyAttributes(analysisResult);
  const confidenceScores = getBeautyConfidenceScores(analysisResult);
  
  if (!simpleAttributes) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <span style={styles.loadingIcon}>⏳</span>
          <span>Analyzing your features...</span>
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
  
  const renderAttribute = (icon, label, value, attributeKey, options, formatter = (v) => v) => {
    const confidence = confidenceScores[attributeKey];
    const confidenceColor = getConfidenceBadgeColor(confidence);
    
    if (isEditing && options) {
      return (
        <div style={styles.attributeRow}>
          <span style={styles.attributeIcon}>{icon}</span>
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
        <span style={styles.attributeIcon}>{icon}</span>
        <span style={styles.attributeLabel}>{label}</span>
        <div style={styles.attributeValue}>
          <span style={styles.valueText}>{formatter(value)}</span>
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
  
  if (compact) {
    return (
      <div style={styles.compactContainer}>
        <div style={styles.compactGrid}>
          <span>{getSkinToneEmoji(simpleAttributes.skinTone)} {getSkinToneLabel(simpleAttributes.skinTone)}</span>
          <span>{getFaceShapeIcon(simpleAttributes.faceShape)} {getFaceShapeLabel(simpleAttributes.faceShape)}</span>
          <span>{getEyeColorEmoji(simpleAttributes.eyeColor)} {getEyeColorLabel(simpleAttributes.eyeColor)}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {validationComplete ? '✅ Your Beauty Profile' : '✨ Your Beauty Analysis'}
        </h3>
      </div>
      
      {/* Skin Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Skin</h4>
        <div style={styles.attributesGrid}>
          {renderAttribute(
            getSkinToneEmoji(simpleAttributes.skinTone),
            'Tone',
            simpleAttributes.skinTone,
            'skinTone',
            SKIN_TONE_OPTIONS,
            getSkinToneLabel
          )}
          {renderAttribute(
            '🌡️',
            'Undertone',
            simpleAttributes.skinUndertone,
            'skinUndertone',
            SKIN_UNDERTONE_OPTIONS,
            (v) => v?.charAt(0).toUpperCase() + v?.slice(1)
          )}
        </div>
      </div>
      
      {/* Face Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Face Shape</h4>
        <div style={styles.attributesGrid}>
          {renderAttribute(
            getFaceShapeIcon(simpleAttributes.faceShape),
            'Shape',
            simpleAttributes.faceShape,
            'faceShape',
            FACE_SHAPE_OPTIONS,
            getFaceShapeLabel
          )}
        </div>
      </div>
      
      {/* Eyes Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Eyes</h4>
        <div style={styles.attributesGrid}>
          {renderAttribute(
            getEyeColorEmoji(simpleAttributes.eyeColor),
            'Color',
            simpleAttributes.eyeColor,
            'eyeColor',
            EYE_COLOR_OPTIONS,
            getEyeColorLabel
          )}
          {renderAttribute(
            '👁️',
            'Shape',
            simpleAttributes.eyeShape,
            'eyeShape',
            EYE_SHAPE_OPTIONS,
            getEyeShapeLabel
          )}
        </div>
      </div>
      
      {/* Eyebrows Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Eyebrows</h4>
        <div style={styles.attributesGrid}>
          {renderAttribute(
            '〰️',
            'Shape',
            simpleAttributes.eyebrowShape,
            'eyebrowShape',
            EYEBROW_SHAPE_OPTIONS,
            getEyebrowShapeLabel
          )}
          {renderAttribute(
            '📏',
            'Thickness',
            simpleAttributes.eyebrowThickness,
            'eyebrowThickness',
            [
              { value: 'thin', label: 'Thin' },
              { value: 'medium', label: 'Medium' },
              { value: 'thick', label: 'Thick' },
              { value: 'bushy', label: 'Bushy' },
            ],
            getEyebrowThicknessLabel
          )}
        </div>
      </div>
      
      {/* Lips Section */}
      <div style={styles.section}>
        <h4 style={styles.sectionTitle}>Lips</h4>
        <div style={styles.attributesGrid}>
          {renderAttribute(
            '💋',
            'Shape',
            simpleAttributes.lipShape,
            'lipShape',
            LIP_SHAPE_OPTIONS,
            getLipShapeLabel
          )}
          {renderAttribute(
            '📐',
            'Size',
            simpleAttributes.lipSize,
            'lipSize',
            [
              { value: 'thin', label: 'Thin' },
              { value: 'medium', label: 'Medium' },
              { value: 'full', label: 'Full' },
              { value: 'very_full', label: 'Very Full' },
            ],
            getLipSizeLabel
          )}
        </div>
      </div>
      
      {showValidation && !validationComplete && (
        <div style={styles.actions}>
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} style={styles.cancelButton} disabled={isSubmitting}>
                Cancel
              </button>
              <button onClick={handleConfirm} style={styles.confirmButton} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Confirm Changes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleStartEdit} style={styles.editButton}>
                Edit
              </button>
              <button onClick={handleConfirm} style={styles.confirmButton} disabled={isSubmitting}>
                {isSubmitting ? 'Confirming...' : 'Looks Good! ✓'}
              </button>
            </>
          )}
        </div>
      )}
      
      {validationComplete && (
        <div style={styles.successMessage}>
          <span>🎉 Thank you for confirming your beauty profile!</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    maxWidth: '450px',
    margin: '0 auto',
  },
  compactContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    padding: '12px 16px',
  },
  compactGrid: {
    display: 'flex',
    gap: '16px',
    fontSize: '0.9rem',
    color: '#495057',
    flexWrap: 'wrap',
  },
  header: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2D2926',
    margin: '0',
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
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#8B1E3F',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0',
    paddingBottom: '6px',
    borderBottom: '1px solid #f0e6e9',
  },
  attributesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  attributeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    border: '1px solid #e9ecef',
  },
  attributeIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
  },
  attributeLabel: {
    fontSize: '0.9rem',
    color: '#6c757d',
    fontWeight: '500',
    minWidth: '80px',
  },
  attributeValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
  },
  valueText: {
    fontSize: '0.95rem',
    color: '#2D2926',
    fontWeight: '600',
  },
  confidenceBadge: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    color: '#fff',
    fontWeight: 'bold',
  },
  select: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #ced4da',
    fontSize: '0.9rem',
    color: '#2D2926',
    backgroundColor: '#fff',
    cursor: 'pointer',
    marginLeft: 'auto',
    minWidth: '110px',
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
  },
  successMessage: {
    marginTop: '20px',
    padding: '16px',
    backgroundColor: '#d4edda',
    borderRadius: '10px',
    textAlign: 'center',
    color: '#155724',
  },
};

