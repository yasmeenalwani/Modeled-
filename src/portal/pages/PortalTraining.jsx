import React, { useEffect, useMemo, useState } from 'react';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import { trainingCategories, practiceFocusTargets, mapServiceToFocus } from '../data/trainingData';
import { getBookingsForUser } from '../../utils/bookingService';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
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
  
  // Overall progress
  overallProgress: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '2rem',
    alignItems: 'center',
  },
  progressCircle: {
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'conic-gradient(#8B1E3F 0deg, #8B1E3F calc(3.6deg * 91), rgba(139, 30, 63, 0.1) calc(3.6deg * 91))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  progressInner: {
    width: '130px',
    height: '130px',
    borderRadius: '50%',
    background: '#FFFEF9', // Ivory
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPct: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#667eea',
  },
  progressLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressDetails: {},
  progressTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressStats: {
    display: 'flex',
    gap: '2rem',
  },
  progressStat: {},
  progressStatValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  progressStatLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Category tabs
  categoryTabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  categoryTab: {
    flex: 1,
    padding: '1.25rem',
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
  },
  categoryTabActive: {
    borderColor: '#8B1E3F', // Cherry
    background: 'rgba(139, 30, 63, 0.1)',
  },
  categoryIcon: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  categoryName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  categoryProgress: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  certBadge: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.2rem 0.5rem',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  
  // Modules list
  modulesList: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  moduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    transition: 'background 0.2s ease',
    cursor: 'pointer',
  },
  moduleNumber: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  moduleMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    gap: '1rem',
  },
  moduleStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  moduleProgress: {
    width: '120px',
  },
  progressBarSmall: {
    height: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  moduleBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  
  modelTrainingSection: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '2rem',
  },
  modelTrainingTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelTrainingSub: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1rem',
  },
  modelTrainingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  modelTrainingCard: {
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.03)',
  },
  modelTrainingLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '0.35rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelTrainingValue: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelTrainingMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    marginTop: '0.35rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const categories = trainingCategories;

const getTypeIcon = (type) => {
  const icons = { video: '', 'hands-on': '', quiz: '', assessment: '' };
  return icons[type] || '';
};

const formatModuleType = (type) => (
  (type || '').replace(/_/g, ' ')
);

export default function PortalTraining() {
  const { user } = useAuthenticator();
  const [selectedCategory, setSelectedCategory] = useState('haircuts');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadBookings = async () => {
      try {
        const data = await getBookingsForUser(user?.userId, 'professional');
        if (isMounted) {
          setBookings(data || []);
        }
      } catch (error) {
        console.error('Error loading bookings for training:', error);
        if (isMounted) {
          setBookings([]);
        }
      }
    };

    loadBookings();

    return () => {
      isMounted = false;
    };
  }, [user]);
  
  const practiceCounts = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);

    const counts = {
      blowouts: { hours: 0, models: [] },
      haircuts: { hours: 0, models: [] },
      color: { hours: 0, models: [] },
    };

    (bookings || []).forEach((booking) => {
      const appointmentDateValue = booking.appointmentDate || booking.date;
      const appointmentDate = appointmentDateValue ? new Date(appointmentDateValue) : null;
      if (!appointmentDate || appointmentDate < cutoff) return;
      const focus = mapServiceToFocus(booking.serviceType || '');
      counts[focus].hours += 1;
      counts[focus].models.push({
        name: booking.modelName || booking.model?.firstName || 'Model',
        date: appointmentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    });

    return counts;
  }, [bookings]);

  const categoriesWithPractice = useMemo(() => categories.map((cat) => {
    const practice = practiceCounts[cat.id] || { hours: 0, models: [] };
    const total = (practiceFocusTargets.find(t => t.id === cat.id)?.weeklyTarget || 2) * 26;
    const completed = practice.hours;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...cat,
      completed,
      total,
      percent: pct,
      models: practice.models,
      modules: (cat.modules || []).map((module, index) => {
        const moduleCount = cat.modules.length || 1;
        const perModuleTarget = total / moduleCount;
        const moduleCompleted = Math.min(Math.max(completed - index * perModuleTarget, 0), perModuleTarget);
        const status = moduleCompleted >= perModuleTarget ? 'complete' : moduleCompleted > 0 ? 'in_progress' : 'locked';
        return {
          ...module,
          completed: Math.round(moduleCompleted),
          status,
        };
      }),
    };
  }), [categories, practiceCounts]);

  const category = categoriesWithPractice.find(c => c.id === selectedCategory);
  const totalCompleted = categoriesWithPractice.reduce((sum, c) => sum + c.completed, 0);
  const totalHours = categoriesWithPractice.reduce((sum, c) => sum + c.total, 0);
  const overallPct = totalHours > 0 ? Math.round((totalCompleted / totalHours) * 100) : 0;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Training & Courses</h1>
        <p style={styles.subtitle}>Complete modules and earn certifications</p>
      </div>

      {/* Overall Progress */}
      <div style={styles.overallProgress}>
        <div style={{
          ...styles.progressCircle,
          background: `conic-gradient(#8B1E3F 0deg, #8B1E3F calc(3.6deg * ${overallPct}), rgba(139, 30, 63, 0.1) calc(3.6deg * ${overallPct}))`,
        }}>
          <div style={styles.progressInner}>
            <div style={styles.progressPct}>{overallPct}%</div>
            <div style={styles.progressLabel}>Complete</div>
          </div>
        </div>
        <div style={styles.progressDetails}>
          <div style={styles.progressTitle}>Overall Training Progress</div>
          <div style={styles.progressStats}>
            <div style={styles.progressStat}>
              <div style={{ ...styles.progressStatValue, color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{totalCompleted}</div>
              <div style={styles.progressStatLabel}>Hours Completed</div>
            </div>
            <div style={styles.progressStat}>
              <div style={{ ...styles.progressStatValue, color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{totalHours - totalCompleted}</div>
              <div style={styles.progressStatLabel}>Hours Remaining</div>
            </div>
            <div style={styles.progressStat}>
              <div style={{ ...styles.progressStatValue, color: '#4caf50', fontFamily: '"Alike", "Georgia", serif' }}>
                {categoriesWithPractice.filter(c => c.certified).length}
              </div>
              <div style={styles.progressStatLabel}>Certifications</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categoriesWithPractice.map((cat) => {
          const pct = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
          const isActive = selectedCategory === cat.id;
          
          return (
            <div
              key={cat.id}
              style={{
                ...styles.categoryTab,
                ...(isActive ? { ...styles.categoryTabActive, borderColor: cat.color } : {}),
              }}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <div style={styles.categoryIcon}>{cat.icon}</div>
              <div style={{ ...styles.categoryName, color: isActive ? cat.color : '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                {cat.name}
              </div>
              <div style={styles.categoryProgress}>
                {cat.completed}/{cat.total} hrs ({pct}%)
              </div>
              {cat.certified && (
                <div style={styles.certBadge}>CERTIFIED</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modules List */}
      <div style={styles.modulesList}>
        {category.modules.map((module, index) => {
          const pct = Math.round((module.completed / module.hours) * 100);
          const isComplete = module.status === 'complete';
          const isLocked = module.status === 'locked';
          const isInProgress = module.status === 'in_progress';
          
          return (
            <div
              key={module.id}
              style={{
                ...styles.moduleItem,
                opacity: isLocked ? 0.5 : 1,
                background: isInProgress ? 'rgba(139, 30, 63, 0.05)' : 'transparent',
              }}
            >
              <div style={{
                ...styles.moduleNumber,
                background: isComplete ? 'rgba(76,175,80,0.2)' : 
                           isInProgress ? 'rgba(139, 30, 63, 0.2)' : 
                           'rgba(139, 30, 63, 0.1)',
                color: isComplete ? '#4caf50' : 
                       isInProgress ? '#8B1E3F' : 
                       '#5A3A2A',
              }}>
                {isComplete ? '✓' : index + 1}
              </div>
              
              <div style={styles.moduleInfo}>
                <div style={styles.moduleName}>{module.name}</div>
                <div style={styles.moduleMeta}>
                  <span>{getTypeIcon(module.type)} {formatModuleType(module.type)}</span>
                  <span>{module.hours} hours</span>
                </div>
              </div>
              
              <div style={styles.moduleStatus}>
                <div style={styles.moduleProgress}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    marginBottom: '0.25rem',
                    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    {module.completed}/{module.hours} hrs
                  </div>
                  <div style={styles.progressBarSmall}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${pct}%`,
                      background: category.color,
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', marginTop: '0.35rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                    Instructor sign-off: {module.signoffStatus === 'approved' ? 'Approved' : 'Awaiting sign-off'}
                  </div>
                </div>
                
                <button style={{
                  ...styles.moduleBtn,
                  background: isComplete ? 'rgba(76,175,80,0.2)' :
                              isInProgress ? 'linear-gradient(135deg, #8B1E3F, #A85A5A)' :
                              isLocked ? 'rgba(139, 30, 63, 0.1)' :
                              'rgba(139, 30, 63, 0.1)',
                  color: isLocked ? '#5A3A2A' : '#FFFEF9',
                  fontFamily: '"Alike", "Georgia", serif',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                }}>
                  {isComplete ? 'Review' : isInProgress ? 'Continue' : isLocked ? 'Locked' : 'Start'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Training Practice */}
      <div style={styles.modelTrainingSection}>
        <div style={styles.modelTrainingTitle}>Model Training Practice</div>
        <div style={styles.modelTrainingSub}>
          Practice sessions are tracked from booked sessions. Each service targets 2 practice sessions per week for 6 months.
        </div>
        <div style={styles.modelTrainingGrid}>
          {practiceFocusTargets.map((req) => {
            const targetSessions = req.weeklyTarget * 26;
            const completed = practiceCounts[req.id]?.hours || 0;
            const models = practiceCounts[req.id]?.models || [];
            return (
              <div key={req.id} style={styles.modelTrainingCard}>
                <div style={styles.modelTrainingLabel}>{req.label} practice</div>
                <div style={styles.modelTrainingValue}>
                  {completed}/{targetSessions}
                </div>
                <div style={styles.modelTrainingMeta}>
                  {req.weeklyTarget}x/week for {req.months} months
                </div>
                {/* Practice log removed */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

