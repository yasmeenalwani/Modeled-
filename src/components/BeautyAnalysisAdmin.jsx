import React from 'react';
import {
  getDetailedBeautyAttributes,
  getSimpleBeautyAttributes,
  getBeautyConfidenceScores,
  getSkinToneLabel,
  getSkinUndertoneLabel,
  getSkinTypeLabel,
  getFitzpatrickDescription,
  getFaceShapeLabel,
  getFaceShapeDescription,
  getEyeColorLabel,
  getEyeShapeLabel,
  getEyeShapeDescription,
  getEyebrowShapeLabel,
  getEyebrowThicknessLabel,
  getLipShapeLabel,
  getLipSizeLabel,
  getNoseShapeLabel,
  getConfidenceBadgeColor,
  getConfidenceLabel,
} from '../utils/beautyAnalysis';

/**
 * BeautyAnalysisAdmin - Admin-only detailed view of beauty analysis
 * 
 * Shows all detailed attributes including:
 * - Fitzpatrick scale (1-6)
 * - Face proportions
 * - Eye depth, spacing, lid type
 * - Eyebrow arch details
 * - Lip proportions
 * - Nose analysis
 */
export default function BeautyAnalysisAdmin({ 
  analysisResult, 
  modelName = 'Model',
  showUserValidation = false,
  userValidation = null,
}) {
  const simpleAttributes = getSimpleBeautyAttributes(analysisResult);
  const detailedAttributes = getDetailedBeautyAttributes(analysisResult);
  const confidenceScores = getBeautyConfidenceScores(analysisResult);
  
  if (!simpleAttributes || !detailedAttributes) {
    return (
      <div style={styles.container}>
        <div style={styles.noData}>No beauty analysis data available</div>
      </div>
    );
  }
  
  const renderConfidenceBar = (score) => {
    const color = getConfidenceBadgeColor(score || 0);
    return (
      <div style={styles.confidenceBarContainer}>
        <div 
          style={{
            ...styles.confidenceBar,
            width: `${score || 0}%`,
            backgroundColor: color,
          }}
        />
        <span style={styles.confidenceScore}>{score || 0}%</span>
      </div>
    );
  };
  
  const renderDetailRow = (label, value) => {
    if (value === null || value === undefined) return null;
    return (
      <div style={styles.detailRow}>
        <span style={styles.detailLabel}>{label}</span>
        <span style={styles.detailValue}>{value}</span>
      </div>
    );
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>🎨 Beauty Analysis - Admin View</h3>
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
      
      {/* Three Column Layout */}
      <div style={styles.grid}>
        {/* Column 1: Skin & Face */}
        <div style={styles.column}>
          {/* Skin Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>🏻 Skin Analysis</h4>
            <div style={styles.simpleValue}>
              {getSkinToneLabel(simpleAttributes.skinTone)} • {getSkinUndertoneLabel(simpleAttributes.skinUndertone)?.split(' ')[0]}
            </div>
            
            {detailedAttributes.skinToneDetailed && (
              <div style={styles.detailSection}>
                <div style={styles.fitzpatrickBadge}>
                  <span style={styles.fitzNumber}>
                    {detailedAttributes.skinToneDetailed.fitzpatrick}
                  </span>
                  <span style={styles.fitzLabel}>Fitzpatrick</span>
                </div>
                <div style={styles.fitzDesc}>
                  {getFitzpatrickDescription(detailedAttributes.skinToneDetailed.fitzpatrick)}
                </div>
                {detailedAttributes.skinToneDetailed.hex && (
                  <div style={styles.colorSwatch}>
                    <div 
                      style={{
                        ...styles.swatchBox,
                        backgroundColor: detailedAttributes.skinToneDetailed.hex,
                      }}
                    />
                    <span>{detailedAttributes.skinToneDetailed.hex}</span>
                  </div>
                )}
              </div>
            )}
            
            {renderDetailRow('Skin Type', getSkinTypeLabel(simpleAttributes.skinType))}
            {renderDetailRow('Texture', detailedAttributes.skinTexture?.replace(/\b\w/g, l => l.toUpperCase()))}
            
            {detailedAttributes.skinConcerns?.length > 0 && (
              <div style={styles.concernsSection}>
                <span style={styles.detailLabel}>Concerns:</span>
                <div style={styles.concernTags}>
                  {detailedAttributes.skinConcerns.map((concern, i) => (
                    <span key={i} style={styles.concernTag}>
                      {concern.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {renderConfidenceBar(confidenceScores.skinTone)}
          </div>
          
          {/* Face Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>⬭ Face Shape</h4>
            <div style={styles.simpleValue}>{getFaceShapeLabel(simpleAttributes.faceShape)}</div>
            <div style={styles.shapeDesc}>{getFaceShapeDescription(simpleAttributes.faceShape)}</div>
            
            <div style={styles.detailSection}>
              {renderDetailRow('Length', detailedAttributes.faceLength?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Forehead', detailedAttributes.foreheadSize?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Cheekbones', detailedAttributes.cheekboneProminence?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Jawline', detailedAttributes.jawlineType?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Chin', detailedAttributes.chinShape?.replace(/\b\w/g, l => l.toUpperCase()))}
            </div>
            
            {renderConfidenceBar(confidenceScores.faceShape)}
          </div>
        </div>
        
        {/* Column 2: Eyes & Eyebrows */}
        <div style={styles.column}>
          {/* Eyes Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>👁️ Eye Analysis</h4>
            <div style={styles.simpleValue}>
              {getEyeColorLabel(simpleAttributes.eyeColor)} • {getEyeShapeLabel(simpleAttributes.eyeShape)}
            </div>
            <div style={styles.shapeDesc}>{getEyeShapeDescription(simpleAttributes.eyeShape)}</div>
            
            {detailedAttributes.eyeColorDetailed && (
              <div style={styles.eyeColorDetail}>
                <span style={styles.eyeColorPrimary}>
                  {detailedAttributes.eyeColorDetailed.primary}
                </span>
                <span style={styles.eyeColorIntensity}>
                  {detailedAttributes.eyeColorDetailed.intensity} intensity
                </span>
                {detailedAttributes.eyeColorDetailed.pattern !== 'solid' && (
                  <span style={styles.eyeColorPattern}>
                    {detailedAttributes.eyeColorDetailed.pattern}
                  </span>
                )}
              </div>
            )}
            
            <div style={styles.detailSection}>
              {renderDetailRow('Size', detailedAttributes.eyeSize?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Spacing', detailedAttributes.eyeSpacing?.replace('_', '-')?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Depth', detailedAttributes.eyeDepth?.replace('_', '-')?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Lid Type', detailedAttributes.eyeLidType?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase()))}
            </div>
            
            {renderConfidenceBar(confidenceScores.eyeColor)}
          </div>
          
          {/* Eyebrows Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>〰️ Eyebrow Analysis</h4>
            <div style={styles.simpleValue}>
              {getEyebrowShapeLabel(simpleAttributes.eyebrowShape)} • {getEyebrowThicknessLabel(simpleAttributes.eyebrowThickness)}
            </div>
            
            <div style={styles.detailSection}>
              {renderDetailRow('Gap', detailedAttributes.eyebrowGap?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Tail Length', detailedAttributes.eyebrowTailLength?.replace(/\b\w/g, l => l.toUpperCase()))}
              {detailedAttributes.eyebrowArch && (
                <>
                  {renderDetailRow('Arch Position', detailedAttributes.eyebrowArch.position?.replace(/\b\w/g, l => l.toUpperCase()))}
                  {renderDetailRow('Arch Angle', `${detailedAttributes.eyebrowArch.angle}°`)}
                </>
              )}
              {renderDetailRow('Matches Hair', detailedAttributes.eyebrowColorMatch ? 'Yes' : 'No')}
            </div>
            
            {renderConfidenceBar(confidenceScores.eyebrowShape)}
          </div>
        </div>
        
        {/* Column 3: Lips & Nose */}
        <div style={styles.column}>
          {/* Lips Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>💋 Lip Analysis</h4>
            <div style={styles.simpleValue}>
              {getLipShapeLabel(simpleAttributes.lipShape)} • {getLipSizeLabel(simpleAttributes.lipSize)}
            </div>
            
            <div style={styles.detailSection}>
              {detailedAttributes.lipProportions && (
                <>
                  {renderDetailRow('Upper:Lower Ratio', detailedAttributes.lipProportions.upperToLower?.toFixed(2))}
                  {renderDetailRow('Width', detailedAttributes.lipProportions.width?.replace(/\b\w/g, l => l.toUpperCase()))}
                </>
              )}
              {renderDetailRow('Cupid\'s Bow', detailedAttributes.cupidsBow?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Natural Color', detailedAttributes.lipColor)}
            </div>
            
            {renderConfidenceBar(confidenceScores.lipShape)}
          </div>
          
          {/* Nose Card */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>👃 Nose Analysis</h4>
            <div style={styles.simpleValue}>
              {getNoseShapeLabel(detailedAttributes.noseShape) || 'N/A'}
            </div>
            
            <div style={styles.detailSection}>
              {renderDetailRow('Bridge', detailedAttributes.noseBridge?.replace(/\b\w/g, l => l.toUpperCase()))}
              {renderDetailRow('Width', detailedAttributes.noseWidth?.replace(/\b\w/g, l => l.toUpperCase()))}
            </div>
          </div>
          
          {/* Confidence Summary */}
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>📊 Confidence Overview</h4>
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
    maxWidth: '1100px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e9ecef',
    flexWrap: 'wrap',
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
  validated: { color: '#28a745', fontWeight: '500' },
  pending: { color: '#ffc107', fontWeight: '500' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e9ecef',
  },
  cardTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2D2926',
    margin: '0 0 12px 0',
  },
  simpleValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '8px',
  },
  shapeDesc: {
    fontSize: '0.8rem',
    color: '#6c757d',
    fontStyle: 'italic',
    marginBottom: '12px',
  },
  detailSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e9ecef',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0',
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#6c757d',
  },
  detailValue: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#2D2926',
  },
  fitzpatrickBadge: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#8B1E3F',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  fitzNumber: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  fitzLabel: {
    fontSize: '0.7rem',
    opacity: 0.8,
  },
  fitzDesc: {
    fontSize: '0.75rem',
    color: '#6c757d',
    marginBottom: '8px',
  },
  colorSwatch: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  swatchBox: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
  },
  concernsSection: {
    marginTop: '8px',
  },
  concernTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginTop: '4px',
  },
  concernTag: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '0.7rem',
  },
  eyeColorDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    flexWrap: 'wrap',
  },
  eyeColorPrimary: {
    backgroundColor: '#e9ecef',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  eyeColorIntensity: {
    fontSize: '0.8rem',
    color: '#6c757d',
  },
  eyeColorPattern: {
    fontSize: '0.75rem',
    color: '#8B1E3F',
    fontStyle: 'italic',
  },
  confidenceSummary: {},
  confidenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  confidenceAttr: {
    fontSize: '0.75rem',
    color: '#6c757d',
    minWidth: '70px',
  },
  confidenceBarContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    height: '14px',
    backgroundColor: '#e9ecef',
    borderRadius: '7px',
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    borderRadius: '7px',
    transition: 'width 0.3s ease',
  },
  confidenceScore: {
    fontSize: '0.7rem',
    color: '#495057',
    fontWeight: '500',
    paddingRight: '6px',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#6c757d',
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

// Make responsive
const mediaQuery = `
  @media (max-width: 900px) {
    .beauty-admin-grid {
      grid-template-columns: 1fr 1fr !important;
    }
  }
  @media (max-width: 600px) {
    .beauty-admin-grid {
      grid-template-columns: 1fr !important;
    }
  }
`;

