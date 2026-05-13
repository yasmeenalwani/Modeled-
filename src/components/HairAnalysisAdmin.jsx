import React from 'react';
import {
  getDetailedAttributes,
  getSimpleAttributes,
  getConfidenceScores,
  getCurlPatternDescription,
  getColorDepthDescription,
  getHairLengthLabel,
  getHairColorLabel,
  getHairTextureLabel,
  getHairDensityLabel,
  getConfidenceBadgeColor,
  getConfidenceLabel,
} from '../utils/hairAnalysis';

/**
 * HairAnalysisAdmin - Admin-only detailed view of hair analysis
 * 
 * Shows all detailed attributes including:
 * - Curl pattern (1A-4C)
 * - Color depth (1-10)
 * - Undertone (warm/cool/neutral)
 * - Hair health metrics
 * - Confidence scores
 */
export default function HairAnalysisAdmin({ 
  analysisResult, 
  modelName = 'Model',
  showUserValidation = false,
  userValidation = null,
}) {
  const simpleAttributes = getSimpleAttributes(analysisResult);
  const detailedAttributes = getDetailedAttributes(analysisResult);
  const confidenceScores = getConfidenceScores(analysisResult);
  
  if (!simpleAttributes || !detailedAttributes) {
    return (
      <div style={styles.container}>
        <div style={styles.noData}>No hair analysis data available</div>
      </div>
    );
  }
  
  const renderConfidenceBar = (score) => {
    const color = getConfidenceBadgeColor(score);
    return (
      <div style={styles.confidenceBarContainer}>
        <div 
          style={{
            ...styles.confidenceBar,
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
        <span style={styles.confidenceScore}>{score}%</span>
      </div>
    );
  };
  
  const renderHealthMetric = (label, value) => {
    const getHealthColor = (val) => {
      if (val === 'none' || val === 'high_shine' || val === 'glossy') return '#4CAF50';
      if (val === 'low' || val === 'natural') return '#8BC34A';
      if (val === 'medium') return '#FFC107';
      if (val === 'high' || val === 'severe' || val === 'matte') return '#FF5722';
      return '#9E9E9E';
    };
    
    return (
      <div style={styles.healthRow}>
        <span style={styles.healthLabel}>{label}</span>
        <span style={{
          ...styles.healthValue,
          color: getHealthColor(value),
        }}>
          {String(value).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      </div>
    );
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>🔬 Hair Analysis - Admin View</h3>
        <span style={styles.modelName}>{modelName}</span>
        <span style={styles.version}>v{analysisResult.analysisVersion || 'MVP-1.0'}</span>
      </div>
      
      {/* User Validation Status */}
      {showUserValidation && (
        <div style={styles.validationStatus}>
          {userValidation ? (
            <span style={styles.validated}>✅ User Validated ({userValidation.accuracy?.toFixed(0)}% match)</span>
          ) : (
            <span style={styles.pending}>⏳ Awaiting User Validation</span>
          )}
        </div>
      )}
      
      {/* Two Column Layout */}
      <div style={styles.grid}>
        {/* Left Column - Basic + Detailed */}
        <div style={styles.column}>
          <h4 style={styles.sectionTitle}>Hair Profile</h4>
          
          {/* Length */}
          <div style={styles.attributeCard}>
            <div style={styles.attributeHeader}>
              <span style={styles.attributeIcon}>📏</span>
              <span style={styles.attributeTitle}>Length</span>
            </div>
            <div style={styles.attributeBody}>
              <div style={styles.simpleValue}>{getHairLengthLabel(simpleAttributes.hairLength)}</div>
              <div style={styles.detailedValue}>
                <span style={styles.detailLabel}>Specific:</span>
                {detailedAttributes.hairLengthSpecific?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
              </div>
              {renderConfidenceBar(confidenceScores.hairLength || 0)}
            </div>
          </div>
          
          {/* Color */}
          <div style={styles.attributeCard}>
            <div style={styles.attributeHeader}>
              <span style={styles.attributeIcon}>🎨</span>
              <span style={styles.attributeTitle}>Color</span>
            </div>
            <div style={styles.attributeBody}>
              <div style={styles.simpleValue}>{getHairColorLabel(simpleAttributes.hairColor)}</div>
              <div style={styles.detailedValue}>
                <span style={styles.detailLabel}>Depth:</span>
                {getColorDepthDescription(detailedAttributes.hairColorDepth)}
              </div>
              <div style={styles.detailedValue}>
                <span style={styles.detailLabel}>Undertone:</span>
                <span style={{
                  color: detailedAttributes.hairColorUndertone === 'warm' ? '#FF9800' :
                         detailedAttributes.hairColorUndertone === 'cool' ? '#2196F3' : '#9E9E9E'
                }}>
                  {detailedAttributes.hairColorUndertone?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                </span>
              </div>
              {detailedAttributes.hairColorArtificial && (
                <div style={styles.detailedValue}>
                  <span style={styles.detailLabel}>Treatment:</span>
                  {detailedAttributes.hairColorArtificial}
                </div>
              )}
              {renderConfidenceBar(confidenceScores.hairColor || 0)}
            </div>
          </div>
          
          {/* Texture / Curl Pattern */}
          <div style={styles.attributeCard}>
            <div style={styles.attributeHeader}>
              <span style={styles.attributeIcon}>〰️</span>
              <span style={styles.attributeTitle}>Texture & Curl</span>
            </div>
            <div style={styles.attributeBody}>
              <div style={styles.simpleValue}>{getHairTextureLabel(simpleAttributes.hairTexture)}</div>
              <div style={styles.curlPattern}>
                <span style={styles.curlPatternCode}>{detailedAttributes.curlPattern || 'N/A'}</span>
                <span style={styles.curlPatternDesc}>
                  {getCurlPatternDescription(detailedAttributes.curlPattern)}
                </span>
              </div>
              {renderConfidenceBar(confidenceScores.curlPattern || confidenceScores.hairTexture || 0)}
            </div>
          </div>
          
          {/* Density */}
          <div style={styles.attributeCard}>
            <div style={styles.attributeHeader}>
              <span style={styles.attributeIcon}>📊</span>
              <span style={styles.attributeTitle}>Density & Porosity</span>
            </div>
            <div style={styles.attributeBody}>
              <div style={styles.simpleValue}>{getHairDensityLabel(simpleAttributes.hairDensity)}</div>
              <div style={styles.detailedValue}>
                <span style={styles.detailLabel}>Porosity:</span>
                {detailedAttributes.hairPorosity?.replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
              </div>
              {renderConfidenceBar(confidenceScores.hairDensity || 0)}
            </div>
          </div>
        </div>
        
        {/* Right Column - Health & Style */}
        <div style={styles.column}>
          <h4 style={styles.sectionTitle}>Hair Health</h4>
          
          {detailedAttributes.hairHealth ? (
            <div style={styles.healthCard}>
              {renderHealthMetric('Frizz Level', detailedAttributes.hairHealth.frizz)}
              {renderHealthMetric('Damage', detailedAttributes.hairHealth.damage)}
              {renderHealthMetric('Shine', detailedAttributes.hairHealth.shine)}
              {renderHealthMetric('Split Ends', detailedAttributes.hairHealth.splitEnds ? 'Yes' : 'None')}
              <div style={styles.healthConfidence}>
                <span>Confidence:</span>
                <span style={{ color: getConfidenceBadgeColor(confidenceScores.hairHealth || 0) }}>
                  {getConfidenceLabel(confidenceScores.hairHealth || 0)}
                </span>
              </div>
            </div>
          ) : (
            <div style={styles.noData}>No health data available</div>
          )}
          
          <h4 style={styles.sectionTitle}>Current Style</h4>
          <div style={styles.styleCard}>
            <span style={styles.styleValue}>
              {detailedAttributes.hairStyle?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Natural'}
            </span>
          </div>
          
          {/* Confidence Summary */}
          <h4 style={styles.sectionTitle}>Overall Confidence</h4>
          <div style={styles.confidenceSummary}>
            {Object.entries(confidenceScores).map(([attr, score]) => (
              <div key={attr} style={styles.confidenceRow}>
                <span style={styles.confidenceAttr}>
                  {attr.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                {renderConfidenceBar(score)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div style={styles.footer}>
        <span>Analyzed: {new Date(analysisResult.analyzedAt).toLocaleString()}</span>
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
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e9ecef',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#2D2926',
    margin: 0,
  },
  modelName: {
    padding: '4px 12px',
    backgroundColor: '#8B1E3F',
    color: '#fff',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  version: {
    marginLeft: 'auto',
    fontSize: '0.8rem',
    color: '#adb5bd',
  },
  validationStatus: {
    padding: '8px 16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  validated: {
    color: '#28a745',
    fontWeight: '500',
  },
  pending: {
    color: '#ffc107',
    fontWeight: '500',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  column: {},
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 12px 0',
  },
  attributeCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e9ecef',
  },
  attributeHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  attributeIcon: {
    fontSize: '1.2rem',
  },
  attributeTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2D2926',
  },
  attributeBody: {},
  simpleValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '8px',
  },
  detailedValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    color: '#495057',
    marginBottom: '4px',
  },
  detailLabel: {
    color: '#6c757d',
    minWidth: '80px',
  },
  curlPattern: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  curlPatternCode: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#8B1E3F',
    backgroundColor: '#f8d7da',
    padding: '4px 12px',
    borderRadius: '8px',
  },
  curlPatternDesc: {
    fontSize: '0.85rem',
    color: '#495057',
    fontStyle: 'italic',
  },
  healthCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    border: '1px solid #e9ecef',
  },
  healthRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #e9ecef',
  },
  healthLabel: {
    fontSize: '0.9rem',
    color: '#495057',
  },
  healthValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  healthConfidence: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    marginTop: '8px',
    fontSize: '0.85rem',
    color: '#6c757d',
  },
  styleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #e9ecef',
  },
  styleValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#2D2926',
  },
  confidenceSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e9ecef',
  },
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  },
  confidenceAttr: {
    fontSize: '0.8rem',
    color: '#6c757d',
    minWidth: '100px',
  },
  confidenceBarContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    height: '16px',
    backgroundColor: '#e9ecef',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.3s ease',
  },
  confidenceScore: {
    fontSize: '0.75rem',
    color: '#495057',
    fontWeight: '500',
    paddingRight: '8px',
  },
  noData: {
    padding: '20px',
    textAlign: 'center',
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '12px',
  },
  footer: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#adb5bd',
  },
};

// Responsive styles for smaller screens
const mediaStyles = `
  @media (max-width: 768px) {
    .hair-admin-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

