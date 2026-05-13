import React, { useState } from 'react';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
  },
  
  // Team grid
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  
  // Member card
  memberCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  memberHeader: {
    display: 'flex',
    gap: '1.25rem',
    marginBottom: '1.25rem',
  },
  memberAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberRole: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberBadges: {
    display: 'flex',
    gap: '0.35rem',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  memberActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.4rem 0.6rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '4px',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Progress section
  memberProgress: {
    marginBottom: '1rem',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.8rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressLabel: {
    color: '#5A3A2A',
  },
  progressValue: {
    fontWeight: '600',
    color: '#8B1E3F',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
  },
  
  // Stats row
  memberStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
  },
  memberStat: {
    textAlign: 'center',
  },
  memberStatValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberStatLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock team data
const teamMembers = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    initials: 'SM',
    role: 'Senior Colorist',
    status: 'certified',
    specialties: ['Color', 'Balayage', 'Highlights'],
    progress: 92,
    sessions: 45,
    rating: 4.9,
    conversions: 8,
    color: '#3fb950',
  },
  {
    id: 2,
    name: 'Jessica Kim',
    initials: 'JK',
    role: 'Stylist',
    status: 'certified',
    specialties: ['Cuts', 'Styling', 'Blowouts'],
    progress: 100,
    sessions: 38,
    rating: 4.8,
    conversions: 6,
    color: '#58a6ff',
  },
  {
    id: 3,
    name: 'Amanda Lopez',
    initials: 'AL',
    role: 'Junior Stylist',
    status: 'training',
    specialties: ['Blowouts', 'Cuts'],
    progress: 45,
    sessions: 22,
    rating: 4.6,
    conversions: 4,
    color: '#d29922',
  },
  {
    id: 4,
    name: 'Maria Chen',
    initials: 'MC',
    role: 'Apprentice',
    status: 'training',
    specialties: ['Blowouts'],
    progress: 30,
    sessions: 12,
    rating: 4.5,
    conversions: 2,
    color: '#f85149',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    initials: 'LT',
    role: 'Color Specialist',
    status: 'certified',
    specialties: ['Color', 'Correction', 'Toning'],
    progress: 88,
    sessions: 52,
    rating: 4.9,
    conversions: 10,
    color: '#a371f7',
  },
  {
    id: 6,
    name: 'Nina Patel',
    initials: 'NP',
    role: 'Junior Colorist',
    status: 'training',
    specialties: ['Color', 'Highlights'],
    progress: 65,
    sessions: 28,
    rating: 4.7,
    conversions: 5,
    color: '#f778ba',
  },
];

export default function PartnerRoster() {
  const [filter, setFilter] = useState('all');
  
  const filteredMembers = filter === 'all' 
    ? teamMembers 
    : teamMembers.filter(m => m.status === filter);

  const stats = {
    total: teamMembers.length,
    certified: teamMembers.filter(m => m.status === 'certified').length,
    training: teamMembers.filter(m => m.status === 'training').length,
    avgProgress: Math.round(teamMembers.reduce((sum, m) => sum + m.progress, 0) / teamMembers.length),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Team Roster 👥</h1>
          <p style={styles.subtitle}>Manage your stylists and apprentices</p>
        </div>
        <button style={styles.addBtn}>
          <span>+</span> Add Team Member
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Team</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3fb950' }}>{stats.certified}</div>
          <div style={styles.statLabel}>Certified</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#d29922' }}>{stats.training}</div>
          <div style={styles.statLabel}>In Training</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#a371f7' }}>{stats.avgProgress}%</div>
          <div style={styles.statLabel}>Avg Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {[
          { key: 'all', label: 'All Members' },
          { key: 'certified', label: 'Certified' },
          { key: 'training', label: 'In Training' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Team Grid */}
      <div style={styles.teamGrid}>
        {filteredMembers.map(member => (
          <div
            key={member.id}
            style={styles.memberCard}
            onMouseOver={(e) => e.currentTarget.style.borderColor = member.color}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)'}
          >
            <div style={styles.memberHeader}>
              <div style={{
                ...styles.memberAvatar,
                background: `${member.color}20`,
                color: member.color,
              }}>
                {member.initials}
              </div>
              <div style={styles.memberInfo}>
                <div style={styles.memberName}>{member.name}</div>
                <div style={styles.memberRole}>{member.role}</div>
                <div style={styles.memberBadges}>
                  <span style={{
                    ...styles.badge,
                    background: member.status === 'certified' ? 'rgba(46,160,67,0.2)' : 'rgba(210,153,34,0.2)',
                    color: member.status === 'certified' ? '#3fb950' : '#d29922',
                  }}>
                    {member.status === 'certified' ? '✓ Certified' : '📚 Training'}
                  </span>
                  {member.specialties.map((spec, i) => (
                    <span key={i} style={{
                      ...styles.badge,
                      background: 'rgba(139, 30, 63, 0.05)',
                      color: '#5A3A2A',
                      fontFamily: '"Alike", "Georgia", serif',
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div style={styles.memberActions}>
                <button style={styles.actionBtn}>Edit</button>
                <button style={styles.actionBtn}>📊</button>
              </div>
            </div>

            {/* Progress */}
            <div style={styles.memberProgress}>
              <div style={styles.progressHeader}>
                <span style={styles.progressLabel}>Training Progress</span>
                <span style={{ ...styles.progressValue, color: member.color }}>{member.progress}%</span>
              </div>
              <div style={styles.progressBar}>
                <div style={{
                  ...styles.progressFill,
                  width: `${member.progress}%`,
                  background: member.color,
                }} />
              </div>
            </div>

            {/* Stats */}
            <div style={styles.memberStats}>
              <div style={styles.memberStat}>
                <div style={{ ...styles.memberStatValue, color: '#8B1E3F' }}>{member.sessions}</div>
                <div style={styles.memberStatLabel}>Sessions</div>
              </div>
              <div style={styles.memberStat}>
                <div style={{ ...styles.memberStatValue, color: '#d29922' }}>{member.rating}</div>
                <div style={styles.memberStatLabel}>Rating</div>
              </div>
              <div style={styles.memberStat}>
                <div style={{ ...styles.memberStatValue, color: '#3fb950' }}>{member.conversions}</div>
                <div style={styles.memberStatLabel}>Conversions</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

