import React, { useState } from 'react';
import { 
  TRAINING_CATEGORIES, 
  TOTAL_TRAINING_HOURS,
  getModuleTypeIcon,
  PROFESSIONAL_STATUS,
} from '../data/training';
import { 
  mockProfessionals, 
  getTrainingProgress 
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
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
  downloadBtn: {
    padding: '0.65rem 1rem',
    background: 'rgba(16,185,129,0.15)',
    border: '1px solid rgba(16,185,129,0.4)',
    borderRadius: '10px',
    color: '#10b981',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Overview cards
  overviewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  categoryCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  categoryIcon: {
    fontSize: '2.5rem',
  },
  categoryHours: {
    textAlign: 'right',
  },
  hoursValue: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  hoursLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  categoryName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  categoryObjectives: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 1.6,
  },
  moduleCount: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    display: 'flex',
    justifyContent: 'space-between',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Modules table
  modulesSection: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
  },
  moduleType: {
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  
  // Leaderboard
  leaderboard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  leaderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  leaderRank: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  leaderMeta: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  leaderHours: {
    textAlign: 'right',
  },
  leaderHoursValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
  },
  leaderHoursLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Progress bar
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    width: '100px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  
  // Certifications
  certBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.6rem',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  
  // Two column layout
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
};

const getModuleTypeStyle = (type) => {
  const configs = {
    video: { bg: 'rgba(33,150,243,0.2)', color: '#2196f3' },
    'hands-on': { bg: 'rgba(233,69,96,0.2)', color: '#e94560' },
    quiz: { bg: 'rgba(255,193,7,0.2)', color: '#ffc107' },
    assessment: { bg: 'rgba(76,175,80,0.2)', color: '#4caf50' },
  };
  return configs[type] || configs.video;
};

export default function TrainingPage() {
  const [selectedCategory, setSelectedCategory] = useState('blowouts');
  
  const category = TRAINING_CATEGORIES[selectedCategory];

  const studentProfessionals = mockProfessionals.filter((pro) => {
    return (
      pro.status === PROFESSIONAL_STATUS.IN_TRAINING ||
      pro.status === PROFESSIONAL_STATUS.IN_ONBOARDING ||
      pro.role === 'APPRENTICE'
    );
  });

  const buildCsvValue = (value) => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const downloadStudentsReport = () => {
    const headers = [
      'id',
      'first_name',
      'last_name',
      'email',
      'phone',
      'salon',
      'role',
      'status',
      'joined_date',
      'onboarding_complete',
      'total_training_hours',
      'training_progress_pct',
      'avg_rating',
      'total_bookings',
      'model_requests_submitted',
    ];

    const rows = studentProfessionals.map((pro) => [
      pro.id,
      pro.firstName,
      pro.lastName,
      pro.email,
      pro.phone,
      pro.salon,
      pro.role,
      pro.status,
      pro.joinedDate,
      pro.onboardingComplete ? 'yes' : 'no',
      pro.totalTrainingHours ?? 0,
      getTrainingProgress(pro),
      pro.avgRating ?? '',
      pro.totalBookings ?? 0,
      pro.modelRequestsSubmitted ?? 0,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map(buildCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modeled_students_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Calculate certifications
  const certificationStats = Object.keys(TRAINING_CATEGORIES).map(catKey => {
    const certified = mockProfessionals.filter(
      p => p.trainingProgress[catKey]?.certified
    ).length;
    return { category: catKey, certified, total: mockProfessionals.length };
  });
  
  // Training leaderboard
  const leaderboard = [...mockProfessionals]
    .sort((a, b) => b.totalTrainingHours - a.totalTrainingHours)
    .slice(0, 5);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Training Program 🎓</h1>
          <p style={styles.subtitle}>
            {TOTAL_TRAINING_HOURS} hours total training across {Object.keys(TRAINING_CATEGORIES).length} categories
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.downloadBtn}
            onClick={downloadStudentsReport}
          >
            ⬇️ Download Students Report
          </button>
        </div>
      </div>

      {/* Category Overview */}
      <div style={styles.overviewGrid}>
        {Object.entries(TRAINING_CATEGORIES).map(([key, cat]) => {
          const stats = certificationStats.find(s => s.category === key);
          return (
            <div 
              key={key} 
              style={{
                ...styles.categoryCard,
                borderColor: selectedCategory === key ? cat.color : 'rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory(key)}
            >
              <div style={styles.categoryHeader}>
                <div style={styles.categoryIcon}>{cat.icon}</div>
                <div style={styles.categoryHours}>
                  <div style={{ ...styles.hoursValue, color: cat.color }}>{cat.totalHours}</div>
                  <div style={styles.hoursLabel}>hours</div>
                </div>
              </div>
              <div style={{ ...styles.categoryName, color: cat.color }}>{cat.name}</div>
              <div style={styles.categoryObjectives}>
                {cat.objectives.join(' • ')}
              </div>
              <div style={styles.moduleCount}>
                <span>{cat.modules.length} modules</span>
                <span style={{ color: '#4caf50' }}>
                  {stats?.certified || 0}/{stats?.total || 0} certified
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoCol}>
        {/* Modules Table */}
        <div style={styles.modulesSection}>
          <div style={styles.sectionTitle}>
            <span>{category.icon}</span>
            {category.name} Modules
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Module</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Hours</th>
                <th style={styles.th}>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {category.modules.map((module, index) => {
                const typeStyle = getModuleTypeStyle(module.type);
                // Mock completion rate
                const completionRate = Math.floor(Math.random() * 40) + 60;
                
                return (
                  <tr key={module.id}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                        }}>
                          {index + 1}
                        </span>
                        {module.name}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.moduleType,
                        background: typeStyle.bg,
                        color: typeStyle.color,
                      }}>
                        {getModuleTypeIcon(module.type)} {module.type}
                      </span>
                    </td>
                    <td style={styles.td}>{module.hours}h</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={styles.progressBar}>
                          <div style={{
                            ...styles.progressFill,
                            width: `${completionRate}%`,
                            background: category.color,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.85rem' }}>{completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Leaderboard */}
        <div style={styles.leaderboard}>
          <div style={styles.sectionTitle}>
            <span>🏆</span>
            Training Leaderboard
          </div>
          
          {leaderboard.map((pro, index) => {
            const pct = getTrainingProgress(pro);
            
            return (
              <div key={pro.id} style={styles.leaderItem}>
                <div style={{
                  ...styles.leaderRank,
                  background: index === 0 ? '#ffd700' : 
                              index === 1 ? '#c0c0c0' : 
                              index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                  color: index < 3 ? '#000' : '#fff',
                }}>
                  {index + 1}
                </div>
                <div style={styles.leaderInfo}>
                  <div style={styles.leaderName}>
                    {pro.firstName} {pro.lastName}
                  </div>
                  <div style={styles.leaderMeta}>
                    {pro.salon}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {Object.entries(pro.trainingProgress).map(([key, progress]) => (
                        progress.certified && (
                          <span key={key} style={styles.certBadge}>
                            {TRAINING_CATEGORIES[key].icon} ✓
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                </div>
                <div style={styles.leaderHours}>
                  <div style={{ ...styles.leaderHoursValue, color: pct === 100 ? '#4caf50' : '#e94560' }}>
                    {pro.totalTrainingHours}
                  </div>
                  <div style={styles.leaderHoursLabel}>hours ({pct}%)</div>
                </div>
              </div>
            );
          })}
          
          {/* Certification Summary */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>
              Certification Summary
            </div>
            {certificationStats.map(stat => (
              <div key={stat.category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {TRAINING_CATEGORIES[stat.category].icon}
                  {TRAINING_CATEGORIES[stat.category].name}
                </span>
                <span style={{ color: '#4caf50' }}>
                  {stat.certified}/{stat.total}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

