import React, { useState } from 'react';
import { 
  ONBOARDING_STEPS, 
  PROFESSIONAL_STATUS, 
  TRAINING_CATEGORIES,
  TOTAL_TRAINING_HOURS,
  ACCESS_LEVELS 
} from '../data/training';
import { 
  mockProfessionals, 
  getOnboardingProgress, 
  getTrainingProgress,
  getProfessionalsNeedingAttention 
} from '../data/mockProfessionals';

// ============ STYLES ============
const styles = {
  container: { padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
  
  // Stats row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: { fontSize: '2rem', fontWeight: '700' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '0.5rem',
  },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
  },
  tabBadge: {
    background: '#e94560',
    color: '#fff',
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  
  // Pro cards
  proGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  proCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  proHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  proInfo: {
    display: 'flex',
    gap: '1rem',
  },
  proAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  proName: { fontSize: '1.1rem', fontWeight: '600' },
  proSalon: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
  proEmail: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' },
  
  // Status badge
  badge: {
    padding: '0.3rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Progress section
  progressSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  progressLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  
  // Onboarding steps
  stepsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  stepBadge: {
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  
  // Training progress
  trainingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  trainingItem: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '0.75rem',
    textAlign: 'center',
  },
  trainingHours: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  trainingLabel: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '0.25rem',
  },
  
  // Actions
  actionBtn: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
  actionBtnPrimary: {
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
  },
  
  // Alerts section
  alertsSection: {
    background: 'rgba(255,193,7,0.1)',
    border: '1px solid rgba(255,193,7,0.3)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
  },
  alertTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#ffc107',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  alertItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,193,7,0.1)',
  },
};

const getStatusBadge = (status) => {
  const configs = {
    [PROFESSIONAL_STATUS.ACTIVE]: { bg: 'rgba(76,175,80,0.2)', color: '#4caf50', label: 'Active' },
    [PROFESSIONAL_STATUS.IN_TRAINING]: { bg: 'rgba(33,150,243,0.2)', color: '#2196f3', label: 'In Training' },
    [PROFESSIONAL_STATUS.IN_ONBOARDING]: { bg: 'rgba(255,193,7,0.2)', color: '#ffc107', label: 'Onboarding' },
    [PROFESSIONAL_STATUS.PENDING_VERIFICATION]: { bg: 'rgba(255,152,0,0.2)', color: '#ff9800', label: 'Pending Verification' },
    [PROFESSIONAL_STATUS.SUSPENDED]: { bg: 'rgba(244,67,54,0.2)', color: '#f44336', label: 'Suspended' },
    [PROFESSIONAL_STATUS.INACTIVE]: { bg: 'rgba(158,158,158,0.2)', color: '#9e9e9e', label: 'Inactive' },
  };
  return configs[status] || configs[PROFESSIONAL_STATUS.INACTIVE];
};

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  const needsAttention = getProfessionalsNeedingAttention();
  
  const stats = {
    total: mockProfessionals.length,
    active: mockProfessionals.filter(p => p.status === PROFESSIONAL_STATUS.ACTIVE).length,
    inTraining: mockProfessionals.filter(p => p.status === PROFESSIONAL_STATUS.IN_TRAINING).length,
    inOnboarding: mockProfessionals.filter(p => p.status === PROFESSIONAL_STATUS.IN_ONBOARDING).length,
    pending: mockProfessionals.filter(p => p.status === PROFESSIONAL_STATUS.PENDING_VERIFICATION).length,
  };
  
  const filteredPros = activeTab === 'all' 
    ? mockProfessionals 
    : activeTab === 'attention'
    ? needsAttention
    : mockProfessionals.filter(p => p.status === activeTab);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Professional Onboarding & Training 📚</h1>
          <p style={styles.subtitle}>Track onboarding progress and training certification</p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#667eea' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Professionals</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#2196f3' }}>{stats.inTraining}</div>
          <div style={styles.statLabel}>In Training</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>{stats.inOnboarding}</div>
          <div style={styles.statLabel}>Onboarding</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ff9800' }}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Verification</div>
        </div>
      </div>

      {/* Needs Attention Alert */}
      {needsAttention.length > 0 && (
        <div style={styles.alertsSection}>
          <div style={styles.alertTitle}>
            <span>⚠️</span> Needs Your Attention ({needsAttention.length})
          </div>
          {needsAttention.slice(0, 3).map(pro => (
            <div key={pro.id} style={styles.alertItem}>
              <div>
                <strong>{pro.firstName} {pro.lastName}</strong>
                <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }}>
                  {!pro.licenseVerified && '• License pending '}
                  {!pro.backgroundCheckCleared && '• Background check pending '}
                  {!pro.onboardingComplete && '• Onboarding incomplete'}
                </span>
              </div>
              <button style={styles.actionBtn}>Review →</button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'all' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('all')}
        >
          All Professionals
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'attention' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('attention')}
        >
          Needs Attention
          {needsAttention.length > 0 && (
            <span style={styles.tabBadge}>{needsAttention.length}</span>
          )}
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === PROFESSIONAL_STATUS.IN_TRAINING ? styles.tabActive : {}) }}
          onClick={() => setActiveTab(PROFESSIONAL_STATUS.IN_TRAINING)}
        >
          In Training
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === PROFESSIONAL_STATUS.ACTIVE ? styles.tabActive : {}) }}
          onClick={() => setActiveTab(PROFESSIONAL_STATUS.ACTIVE)}
        >
          Active
        </button>
      </div>

      {/* Professional Cards */}
      <div style={styles.proGrid}>
        {filteredPros.map(pro => {
          const statusConfig = getStatusBadge(pro.status);
          const onboardingPct = getOnboardingProgress(pro);
          const trainingPct = getTrainingProgress(pro);
          
          return (
            <div key={pro.id} style={styles.proCard}>
              {/* Header */}
              <div style={styles.proHeader}>
                <div style={styles.proInfo}>
                  <div style={styles.proAvatar}>{pro.firstName.charAt(0)}</div>
                  <div>
                    <div style={styles.proName}>{pro.firstName} {pro.lastName}</div>
                    <div style={styles.proSalon}>{pro.salon} • {ACCESS_LEVELS[pro.role]?.name}</div>
                    <div style={styles.proEmail}>{pro.email}</div>
                  </div>
                </div>
                <span style={{
                  ...styles.badge,
                  background: statusConfig.bg,
                  color: statusConfig.color,
                }}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Verification Status */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{
                  ...styles.stepBadge,
                  background: pro.idVerified ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                  color: pro.idVerified ? '#4caf50' : 'rgba(255,255,255,0.4)',
                }}>
                  {pro.idVerified ? '✓' : '○'} ID
                </span>
                <span style={{
                  ...styles.stepBadge,
                  background: pro.licenseVerified ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                  color: pro.licenseVerified ? '#4caf50' : 'rgba(255,255,255,0.4)',
                }}>
                  {pro.licenseVerified ? '✓' : '○'} License
                </span>
                <span style={{
                  ...styles.stepBadge,
                  background: pro.backgroundCheckCleared ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                  color: pro.backgroundCheckCleared ? '#4caf50' : 'rgba(255,255,255,0.4)',
                }}>
                  {pro.backgroundCheckCleared ? '✓' : '○'} Background
                </span>
                <span style={{
                  ...styles.stepBadge,
                  background: pro.documentsComplete ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                  color: pro.documentsComplete ? '#4caf50' : 'rgba(255,255,255,0.4)',
                }}>
                  {pro.documentsComplete ? '✓' : '○'} Docs
                </span>
              </div>

              {/* Onboarding Progress */}
              <div style={styles.progressSection}>
                <div style={styles.progressLabel}>
                  <span>Onboarding Progress</span>
                  <span>{onboardingPct}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${onboardingPct}%`,
                    background: onboardingPct === 100 ? '#4caf50' : 'linear-gradient(90deg, #667eea, #764ba2)',
                  }} />
                </div>

                {/* Onboarding Steps */}
                <div style={styles.stepsRow}>
                  {ONBOARDING_STEPS.map(step => {
                    const stepProgress = pro.onboardingProgress[step.id];
                    return (
                      <span
                        key={step.id}
                        style={{
                          ...styles.stepBadge,
                          background: stepProgress?.completed ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                          color: stepProgress?.completed ? '#4caf50' : 'rgba(255,255,255,0.4)',
                        }}
                        title={`${step.name}: ${stepProgress?.tasksComplete || 0}/${stepProgress?.totalTasks || 0}`}
                      >
                        {step.icon} {stepProgress?.completed ? '✓' : `${stepProgress?.tasksComplete || 0}/${stepProgress?.totalTasks || 0}`}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Training Progress */}
              <div style={styles.progressSection}>
                <div style={styles.progressLabel}>
                  <span>Training Progress ({pro.totalTrainingHours}/{TOTAL_TRAINING_HOURS} hrs)</span>
                  <span>{trainingPct}%</span>
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${trainingPct}%`,
                    background: trainingPct === 100 ? '#4caf50' : 'linear-gradient(90deg, #e94560, #ff6b8a)',
                  }} />
                </div>

                {/* Training by Category */}
                <div style={styles.trainingGrid}>
                  {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => {
                    const progress = pro.trainingProgress[key];
                    return (
                      <div key={key} style={styles.trainingItem}>
                        <div style={{ fontSize: '1.25rem' }}>{cat.icon}</div>
                        <div style={{
                          ...styles.trainingHours,
                          color: progress?.certified ? '#4caf50' : cat.color,
                        }}>
                          {progress?.hoursCompleted || 0}/{cat.totalHours}
                        </div>
                        <div style={styles.trainingLabel}>
                          {cat.name}
                          {progress?.certified && ' ✓'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button style={styles.actionBtn}>View Profile</button>
                <button style={styles.actionBtn}>Training Log</button>
                {!pro.onboardingComplete && (
                  <button style={{ ...styles.actionBtn, ...styles.actionBtnPrimary }}>
                    Resume Onboarding
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

