import React from 'react';
import { useNavigate } from 'react-router-dom';

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
  greeting: {
    fontSize: '2rem',
    fontWeight: '300',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  greetingName: {
    fontWeight: '600',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Featured banner
  featuredBanner: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerContent: {},
  bannerTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bannerText: {
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  bannerBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '25px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  bannerEmoji: {
    fontSize: '4rem',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  statChange: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '6px',
  },
  
  // Two column layout
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  // Card
  card: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Recent sessions
  sessionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    marginBottom: '0.75rem',
  },
  sessionIcon: {
    fontSize: '1.75rem',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionService: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionSaved: {
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Quiz cards
  quizGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  quizCard: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  quizIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  quizTitle: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    fontSize: '0.9rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizXp: {
    fontSize: '0.75rem',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizLocked: {
    opacity: 0.5,
  },
  
  // Tips
  tipCard: {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(102,126,234,0.05))',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '1rem',
  },
  tipIcon: {
    fontSize: '1.5rem',
  },
  tipText: {
    fontSize: '0.9rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const currentUser = {
  firstName: 'Seraphina',
  sessions: 12,
  opportunities: 0,
  rating: 4.9,
  xp: 2450,
  level: 1,
  impactContributed: 12.87, // Personal contribution from shop purchases
};

const recentSessions = [
  { id: 1, service: 'Balayage', icon: '', date: 'Dec 2', pro: 'Sarah M.' },
  { id: 2, service: 'Blowout', icon: '', date: 'Nov 28', pro: 'Jessica K.' },
  { id: 3, service: 'Haircut', icon: '', date: 'Nov 20', pro: 'Amanda L.' },
];

export default function ModelDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.greeting}>
          Cherry Desk
        </h1>
        <p style={styles.subtitle}>Hey <span style={styles.greetingName}>{currentUser.firstName}</span>! Welcome back to your beauty journey</p>
      </div>

      {/* Featured Banner - Play section coming later */}
      <div style={styles.featuredBanner}>
        <div style={styles.bannerContent}>
          <div style={styles.bannerTitle}>Complete Your Profile</div>
          <div style={styles.bannerText}>
            Add photos and availability to get matched with top stylists in your area.
          </div>
          <button 
            style={styles.bannerBtn}
            onClick={() => navigate('/model-portal/profile')}
          >
            Model Card <span>→</span>
          </button>
        </div>
        <div style={styles.bannerEmoji}>✨</div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{currentUser.sessions}</div>
          <div style={styles.statLabel}>Total Sessions</div>
          <div style={{
            ...styles.statChange,
            background: 'rgba(139, 30, 63, 0.2)',
            color: '#8B1E3F',
          }}>
            +2 this month
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{currentUser.opportunities}</div>
          <div style={styles.statLabel}>Opportunities</div>
          <div style={{
            ...styles.statChange,
            background: 'rgba(139, 30, 63, 0.2)',
            color: '#8B1E3F',
          }}>
            Matches waiting
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{currentUser.rating}</div>
          <div style={styles.statLabel}>Your Rating</div>
          <div style={{
            ...styles.statChange,
            background: 'rgba(139, 30, 63, 0.2)',
            color: '#8B1E3F',
          }}>
            Top 10%
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#667eea' }}>{currentUser.level}</div>
          <div style={styles.statLabel}>Level</div>
          <div style={{
            ...styles.statChange,
            background: 'rgba(102,126,234,0.2)',
            color: '#667eea',
          }}>
            Earn in Play (coming soon)
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>${currentUser.impactContributed.toFixed(2)}</div>
          <div style={styles.statLabel}>Your Impact</div>
          <div style={{
            ...styles.statChange,
            background: 'rgba(139, 30, 63, 0.2)',
            color: '#8B1E3F',
          }}>
            ROLE Model
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoCol}>
        {/* Recent Sessions */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>Recent Sessions</span>
          </div>
          {recentSessions.map(session => (
            <div key={session.id} style={styles.sessionItem}>
              <div style={styles.sessionIcon}>{session.icon}</div>
              <div style={styles.sessionInfo}>
                <div style={styles.sessionService}>{session.service}</div>
                <div style={styles.sessionMeta}>
                  {session.date} • with {session.pro}
                </div>
              </div>
            </div>
          ))}
          <button 
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.5rem',
              background: 'rgba(139, 30, 63, 0.1)',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              borderRadius: '10px',
              color: '#8B1E3F',
              cursor: 'pointer',
              fontWeight: '600',
              fontFamily: '"Alike", "Georgia", serif',
            }}
            onClick={() => navigate('/model-portal/sessions')}
          >
            View All Sessions →
          </button>
        </div>

        {/* Level Up - Play section coming later */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>Level Up</span>
          </div>
          <div style={{
            padding: '1.5rem',
            background: 'rgba(139, 30, 63, 0.06)',
            borderRadius: '12px',
            border: '1px dashed rgba(139, 30, 63, 0.2)',
            textAlign: 'center',
            color: '#5A3A2A',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎮</div>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Play section coming soon</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Earn points, level up, and unlock rewards. Stay tuned!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

