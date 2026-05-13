/**
 * ============================================
 * DEMO: Hair & Beauty Analysis System
 * ============================================
 * 
 * Showcases the complete system we built:
 * - 5 Diverse Models with full analysis data
 * - User View (Simple classifications)
 * - Admin View (Detailed classifications)
 * - Photo Capture Flow Preview
 * - Confidence Scores & Validation
 */

import { useState } from 'react';
import { mockModelsWithAnalysis, getModelAnalysisSummary, getAllAnalysisSummaries } from '../data/mockModelsWithAnalysis';
import { PHOTO_STEPS } from '../utils/photoRequirements';

// ============ STYLES ============
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    color: '#fff',
    fontFamily: '"DM Sans", sans-serif',
    padding: '40px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '48px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#a0a0b0',
    maxWidth: '600px',
    margin: '0 auto',
  },
  tabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
  },
  tab: {
    padding: '12px 24px',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#a0a0b0',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '14px',
    fontWeight: '500',
  },
  tabActive: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: '1px solid transparent',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    transition: 'all 0.3s',
  },
  cardHeader: {
    padding: '20px',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    overflow: 'hidden',
    border: '3px solid rgba(255,255,255,0.1)',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  modelName: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '4px',
  },
  modelMeta: {
    fontSize: '13px',
    color: '#888',
  },
  cardBody: {
    padding: '20px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#667eea',
    marginBottom: '12px',
    fontWeight: '600',
  },
  attributeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  attributeLabel: {
    fontSize: '14px',
    color: '#888',
  },
  attributeValue: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#fff',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgeSuccess: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#22c55e',
  },
  badgeInfo: {
    background: 'rgba(59, 130, 246, 0.2)',
    color: '#3b82f6',
  },
  badgeWarning: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#f59e0b',
  },
  confidenceBar: {
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease-out',
  },
  photoSteps: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '12px',
    marginTop: '20px',
  },
  photoStep: {
    textAlign: 'center',
    padding: '16px 8px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  photoIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  photoTitle: {
    fontSize: '11px',
    color: '#a0a0b0',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '30px',
    marginBottom: '20px',
  },
  toggleButton: {
    padding: '8px 20px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '16px',
  },
  statBox: {
    textAlign: 'center',
    padding: '16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
  },
  statValue: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
};

// ============ CONFIDENCE COLOR ============
const getConfidenceColor = (value) => {
  if (value >= 0.95) return '#22c55e';
  if (value >= 0.90) return '#10b981';
  if (value >= 0.85) return '#3b82f6';
  if (value >= 0.80) return '#f59e0b';
  return '#ef4444';
};

// ============ MODEL CARD COMPONENT ============
const ModelCard = ({ model, viewMode }) => {
  const summary = getModelAnalysisSummary(model);
  const isAdmin = viewMode === 'admin';
  
  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>
          {model.profilePhoto ? (
            <img src={model.profilePhoto} alt={model.firstName} style={styles.avatarImg} />
          ) : (
            model.firstName[0]
          )}
        </div>
        <div>
          <div style={styles.modelName}>{model.firstName} {model.lastName}</div>
          <div style={styles.modelMeta}>
            {model.hairTextureDetailed} · {model.ageRange} · {model.locationZip}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            ...styles.badge,
            ...(model.photoAnalysisStatus === 'completed' ? styles.badgeSuccess : styles.badgeWarning)
          }}>
            {model.photoAnalysisStatus === 'completed' ? '✓ Analyzed' : 'Pending'}
          </span>
        </div>
      </div>
      
      {/* Body */}
      <div style={styles.cardBody}>
        {/* Hair Classification */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>💇‍♀️ Hair Classification</div>
          {isAdmin ? (
            <>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Type</span>
                <span style={styles.attributeValue}>{model.hairTextureDetailed}</span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Length</span>
                <span style={styles.attributeValue}>{model.hairLengthDetailed}</span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Color</span>
                <span style={styles.attributeValue}>
                  Level {model.hairColorDetailed?.depth} {model.hairColorDetailed?.natural}
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Density</span>
                <span style={styles.attributeValue}>{model.hairDensity}</span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Porosity</span>
                <span style={styles.attributeValue}>{model.hairPorosity}</span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Health</span>
                <span style={styles.attributeValue}>
                  {model.hairHealth?.damage === 'none' ? '✨ Healthy' : 
                   model.hairHealth?.damage === 'minimal' ? '👍 Minimal damage' : 
                   '⚠️ ' + model.hairHealth?.damage}
                </span>
              </div>
            </>
          ) : (
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '500',
              padding: '12px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              {summary.userView.hair}
            </div>
          )}
        </div>
        
        {/* Beauty Classification */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>✨ Beauty Classification</div>
          {isAdmin ? (
            <>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Face Shape</span>
                <span style={styles.attributeValue}>
                  {model.faceShapeDetailed?.shape} (ratio {model.faceShapeDetailed?.lengthRatio})
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Skin</span>
                <span style={styles.attributeValue}>
                  Fitzpatrick {model.skinToneDetailed?.fitzpatrick} · {model.skinToneDetailed?.undertone}
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Eyes</span>
                <span style={styles.attributeValue}>
                  {model.eyeShapeDetailed?.shape} · {model.eyeShapeDetailed?.lidType}
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Eyebrows</span>
                <span style={styles.attributeValue}>
                  {model.eyebrowShape?.shape} · {model.eyebrowShape?.thickness}
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Lips</span>
                <span style={styles.attributeValue}>
                  {model.lipShape?.shape} ({model.lipShape?.upperToLowerRatio})
                </span>
              </div>
              <div style={styles.attributeRow}>
                <span style={styles.attributeLabel}>Nose</span>
                <span style={styles.attributeValue}>
                  {model.noseShape?.shape} · {model.noseShape?.width} width
                </span>
              </div>
            </>
          ) : (
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '500',
              padding: '12px',
              background: 'rgba(118, 75, 162, 0.1)',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              {summary.userView.beauty}
            </div>
          )}
        </div>
        
        {/* AI Confidence Scores */}
        {isAdmin && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🤖 AI Confidence Scores</div>
            {Object.entries(model.attributeConfidence).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span style={{ fontSize: '12px', color: getConfidenceColor(value), fontWeight: '600' }}>
                    {Math.round(value * 100)}%
                  </span>
                </div>
                <div style={styles.confidenceBar}>
                  <div style={{
                    ...styles.confidenceFill,
                    width: `${value * 100}%`,
                    background: getConfidenceColor(value),
                  }} />
                </div>
              </div>
            ))}
            <div style={{ 
              marginTop: '12px', 
              padding: '8px', 
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              textAlign: 'center',
              fontSize: '12px',
              color: '#888'
            }}>
              Avg: {summary.confidence.average}% · Version: {model.analysisVersion}
            </div>
          </div>
        )}
        
        {/* User Validation Status */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>👤 User Validation</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            padding: '12px',
            background: model.userValidatedAt ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            borderRadius: '10px',
          }}>
            <span style={{ fontSize: '24px' }}>
              {model.userValidatedAt ? '✅' : '⏳'}
            </span>
            <div>
              <div style={{ fontWeight: '500', fontSize: '14px' }}>
                {model.userValidatedAt ? 'Validated' : 'Awaiting Validation'}
              </div>
              {model.userValidatedAt && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {Math.round(model.validationAccuracy * 100)}% match with AI · 
                  {new Date(model.userValidatedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ PHOTO STEPS PREVIEW ============
const PhotoStepsPreview = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
    <div style={styles.summaryCard}>
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>📸 Guided Photo Capture Flow</h3>
      <p style={{ color: '#888', fontSize: '14px' }}>
        Models complete 6 guided photo steps with real-time quality feedback
      </p>
      <div style={styles.photoSteps}>
        {PHOTO_STEPS.map((step, index) => (
          <div key={step.id} style={styles.photoStep}>
            <div style={styles.photoIcon}>{step.icon}</div>
            <div style={styles.photoTitle}>{step.shortTitle}</div>
            <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
              Step {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ============ MODEL GALLERY (Quick Visual Check) ============
const ModelGallery = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
    <div style={styles.summaryCard}>
      <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>👁️ Visual Sanity Check - All 5 Models</h3>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
        Quickly verify AI classifications match each model's appearance
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '16px',
      }}>
        {mockModelsWithAnalysis.map(model => {
          const summary = getModelAnalysisSummary(model);
          return (
            <div key={model.id} style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '20px',
                overflow: 'hidden',
                margin: '0 auto 12px',
                border: '3px solid rgba(102, 126, 234, 0.3)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}>
                {model.profilePhoto ? (
                  <img 
                    src={model.profilePhoto} 
                    alt={model.firstName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '40px',
                    fontWeight: '700',
                  }}>
                    {model.firstName[0]}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>
                {model.firstName}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: '#667eea',
                fontWeight: '500',
                marginBottom: '4px',
              }}>
                {model.hairTextureDetailed} · {model.hairColorSimple}
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: '#888',
                lineHeight: '1.4',
              }}>
                {model.skinToneSimple} skin<br/>
                {model.eyeColorSimple} eyes<br/>
                {model.faceShapeSimple} face
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ============ SUMMARY STATS ============
const SummaryStats = () => {
  const summaries = getAllAnalysisSummaries();
  const avgConfidence = Math.round(
    summaries.reduce((acc, s) => acc + s.confidence.average, 0) / summaries.length
  );
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto 40px' }}>
      <div style={styles.summaryCard}>
        <h3 style={{ fontSize: '20px', marginBottom: '4px' }}>📊 System Overview</h3>
        <p style={{ color: '#888', fontSize: '14px' }}>
          5 diverse models demonstrating the full Hair & Beauty Engine
        </p>
        <div style={styles.summaryGrid}>
          <div style={styles.statBox}>
            <div style={styles.statValue}>5</div>
            <div style={styles.statLabel}>Models Analyzed</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>30</div>
            <div style={styles.statLabel}>Photos Processed</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>{avgConfidence}%</div>
            <div style={styles.statLabel}>Avg Confidence</div>
          </div>
        </div>
        
        {/* Hair Types Distribution */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
            Hair Type Distribution
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['1A', '2A', '2B', '3A', '4C'].map(type => {
              const count = mockModelsWithAnalysis.filter(m => m.hairTextureDetailed === type).length;
              return (
                <span key={type} style={{
                  padding: '8px 16px',
                  background: 'rgba(102, 126, 234, 0.15)',
                  borderRadius: '20px',
                  fontSize: '13px',
                }}>
                  {type}: {count}
                </span>
              );
            })}
          </div>
        </div>
        
        {/* Skin Tone Distribution */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
            Skin Tone Distribution (Fitzpatrick)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 6].map(fitz => {
              const count = mockModelsWithAnalysis.filter(
                m => m.skinToneDetailed?.fitzpatrick === fitz
              ).length;
              const labels = {
                1: 'Type I (Fair)',
                2: 'Type II (Light)',
                3: 'Type III (Medium)',
                4: 'Type IV (Olive)',
                6: 'Type VI (Deep)',
              };
              return (
                <span key={fitz} style={{
                  padding: '8px 16px',
                  background: 'rgba(118, 75, 162, 0.15)',
                  borderRadius: '20px',
                  fontSize: '13px',
                }}>
                  {labels[fitz]}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export default function DemoAnalysisSystem() {
  const [activeTab, setActiveTab] = useState('models');
  const [viewMode, setViewMode] = useState('user');
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Modeled AI Engine Demo</h1>
        <p style={styles.subtitle}>
          Complete Hair & Beauty Analysis System with 5 diverse models showcasing 
          user/admin views, AI confidence scores, and validation workflows
        </p>
      </header>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'photos', label: '📸 Photo Flow' },
          { id: 'models', label: '👥 Model Cards' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <ModelGallery />
          <SummaryStats />
        </>
      )}
      
      {/* Photos Tab */}
      {activeTab === 'photos' && <PhotoStepsPreview />}
      
      {/* Models Tab */}
      {activeTab === 'models' && (
        <>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={styles.toggle}>
              <button
                onClick={() => setViewMode('user')}
                style={{
                  ...styles.toggleButton,
                  background: viewMode === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: viewMode === 'user' ? '#fff' : '#888',
                }}
              >
                👤 User View
              </button>
              <button
                onClick={() => setViewMode('admin')}
                style={{
                  ...styles.toggleButton,
                  background: viewMode === 'admin' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'transparent',
                  color: viewMode === 'admin' ? '#fff' : '#888',
                }}
              >
                🔐 Admin View
              </button>
            </div>
          </div>
          
          {/* Model Cards Grid */}
          <div style={styles.grid}>
            {mockModelsWithAnalysis.map(model => (
              <ModelCard key={model.id} model={model} viewMode={viewMode} />
            ))}
          </div>
        </>
      )}
      
      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        marginTop: '60px', 
        padding: '20px',
        color: '#666',
        fontSize: '13px',
      }}>
        <p>Modeled Hair & Beauty Engine MVP v1.0</p>
        <p style={{ marginTop: '8px' }}>
          ✅ AWS Rekognition + Bedrock · 🔒 Commercial License Compliant · 📊 Proprietary Data Collection
        </p>
      </footer>
    </div>
  );
}

