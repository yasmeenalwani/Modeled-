// ============================================
// MY TEAM - Consolidated Page
// Team Roster + Training Progress in one unified view
// ============================================

import React, { useState } from 'react';
import PartnerRoster from './PartnerRoster';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  
  // Tab navigation
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#5A3A2A', // Muted brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
};

// Mock training data
const trainingModules = [
  {
    id: 1,
    name: 'Advanced Color Theory',
    category: 'Color',
    hoursRequired: 40,
    teamMembers: [
      { id: 1, name: 'Sarah Mitchell', progress: 100, completed: true },
      { id: 2, name: 'Jessica Kim', progress: 75, completed: false },
      { id: 3, name: 'Lisa Thompson', progress: 100, completed: true },
    ],
    status: 'in-progress',
  },
  {
    id: 2,
    name: 'Textured Hair Mastery',
    category: 'Styling',
    hoursRequired: 30,
    teamMembers: [
      { id: 1, name: 'Sarah Mitchell', progress: 100, completed: true },
      { id: 2, name: 'Jessica Kim', progress: 100, completed: true },
      { id: 4, name: 'Amanda Lopez', progress: 45, completed: false },
    ],
    status: 'in-progress',
  },
  {
    id: 3,
    name: 'Blowout Techniques',
    category: 'Styling',
    hoursRequired: 20,
    teamMembers: [
      { id: 2, name: 'Jessica Kim', progress: 100, completed: true },
      { id: 4, name: 'Amanda Lopez', progress: 60, completed: false },
      { id: 6, name: 'Maria Chen', progress: 30, completed: false },
    ],
    status: 'in-progress',
  },
];

function TrainingProgress() {
  const [selectedModule, setSelectedModule] = useState(null);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
          Training Progress
        </h1>
        <p style={{ color: '#5A3A2A', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Track team training advancement and certifications
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>730</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Total Hours
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3fb950', fontFamily: '"Alike", "Georgia", serif' }}>68%</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Avg Completion
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d29922', fontFamily: '"Alike", "Georgia", serif' }}>12</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Certifications
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a371f7', fontFamily: '"Alike", "Georgia", serif' }}>4</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Active Modules
          </div>
        </div>
      </div>

      {/* Training Modules */}
      <div style={{
        display: 'grid',
        gap: '1.5rem',
      }}>
        {trainingModules.map(module => {
          const avgProgress = Math.round(
            module.teamMembers.reduce((sum, m) => sum + m.progress, 0) / module.teamMembers.length
          );
          
          return (
            <div
              key={module.id}
              style={{
                background: '#FFFEF9',
                border: '1px solid rgba(139, 30, 63, 0.15)',
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#8B1E3F'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)'}
              onClick={() => setSelectedModule(module)}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '1rem',
              }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.25rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                    {module.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                    {module.category} • {module.hoursRequired} hours
                  </p>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  background: 'rgba(139, 30, 63, 0.1)',
                  color: '#8B1E3F',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {module.status === 'in-progress' ? 'In Progress' : 'Completed'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Team Average</span>
                  <span style={{ fontWeight: '600', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{avgProgress}%</span>
                </div>
                <div style={{
                  height: '8px',
                  background: 'rgba(139, 30, 63, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${avgProgress}%`,
                    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>

              {/* Team Members */}
              <div>
                <p style={{
                  fontSize: '0.8rem',
                  color: '#5A3A2A',
                  marginBottom: '0.75rem',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  Team Members ({module.teamMembers.length})
                </p>
                <div style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}>
                  {module.teamMembers.map(member => (
                    <div
                      key={member.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        background: 'rgba(139, 30, 63, 0.05)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(139, 30, 63, 0.1)',
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: member.completed ? '#3fb950' : 'rgba(139, 30, 63, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: member.completed ? '#FFFEF9' : '#8B1E3F',
                      }}>
                        {member.completed ? '✓' : member.progress}
                      </div>
                      <span style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                        {member.name.split(' ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Training Button */}
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
          border: 'none',
          borderRadius: '6px',
          color: '#FFFEF9',
          fontSize: '0.9rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          + Assign Training to Team
        </button>
      </div>
    </div>
  );
}

export default function PartnerTeamConsolidated() {
  const [activeTab, setActiveTab] = useState('roster');

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'roster' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('roster')}
        >
          👥 Team Roster
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'training' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('training')}
        >
          🎓 Training Progress
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'roster' ? <PartnerRoster /> : <TrainingProgress />}
    </div>
  );
}

