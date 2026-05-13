import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getPhotoForService, handleImageError } from '../../utils/imageHelpers';

// Shared mock data (would come from API in production)
// Enhanced for "good model" - active, books frequently
// Play section (quizzes/points) coming later; saved $ hidden for new users
const currentUser = {
  firstName: 'Emma',
  lastName: 'Johnson',
  sessions: 34,
  opportunities: 0,
  rating: 4.9,
  xp: 5620,
  impactContributed: 47.25,
  level: 1,
  roleModel: true,
  xpToNextLevel: 380,
  sessionsThisMonth: 6,
  streak: 8,
  badges: 12,
};

const recentSessions = [
  { id: 1, service: 'Balayage', icon: '', date: 'Dec 15', pro: 'Sarah M.' },
  { id: 2, service: 'Blowout & Style', icon: '', date: 'Dec 12', pro: 'Jessica K.' },
  { id: 3, service: 'Color Correction', icon: '', date: 'Dec 8', pro: 'Amanda L.' },
  { id: 4, service: 'Haircut & Layers', icon: '', date: 'Dec 3', pro: 'Maria S.' },
  { id: 5, service: 'Keratin Treatment', icon: '', date: 'Nov 28', pro: 'Jessica K.' },
  { id: 6, service: 'Highlights', icon: '', date: 'Nov 22', pro: 'Sarah M.' },
];

// ============ MOCKUP 1: MAGAZINE COVER ============
function MagazineCoverDashboard({ navigate, user }) {
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      background: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
    },
    heroRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '2rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.05), rgba(168, 90, 90, 0.03))',
      borderRadius: '16px',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    heroLeft: {
      flex: '1',
      maxWidth: '60%',
    },
    heroTitle: {
      fontSize: '3rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
      letterSpacing: '-0.02em',
    },
    heroTagline: {
      fontSize: '1.1rem',
      color: '#5A3A2A',
      fontStyle: 'italic',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    pillsRow: {
      display: 'flex',
      gap: '0.75rem',
      flexWrap: 'wrap',
    },
    pill: {
      padding: '0.5rem 1rem',
      borderRadius: '25px',
      fontSize: '0.85rem',
      fontWeight: '600',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      color: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
    },
    statChips: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    statChip: {
      padding: '1rem',
      borderRadius: '12px',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      minWidth: '140px',
      transition: 'transform 0.2s',
    },
    statChipHover: {
      transform: 'scale(1.05)',
    },
    statValue: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    statSub: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    grid2Col: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    card: {
      padding: '1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    avatar: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      margin: '0 auto 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      color: '#FFFEF9',
      border: '3px solid rgba(139, 30, 63, 0.3)',
    },
    tagline: {
      fontSize: '1rem',
      fontStyle: 'italic',
      color: '#4A2A1A',
      textAlign: 'center',
      marginBottom: '0.75rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    link: {
      fontSize: '0.85rem',
      color: '#8B1E3F',
      textAlign: 'center',
      cursor: 'pointer',
      textDecoration: 'underline',
      fontFamily: '"Alike", "Georgia", serif',
    },
    sessionItem: {
      padding: '0.75rem',
      marginBottom: '0.75rem',
      fontSize: '0.85rem',
      color: '#4A2A1A',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      fontFamily: '"Alike", "Georgia", serif',
      display: 'flex',
      justifyContent: 'space-between',
    },
    quizPills: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    quizPill: {
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    quizPillLocked: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    progressText: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontStyle: 'italic',
      textAlign: 'center',
      fontFamily: '"Alike", "Georgia", serif',
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'rgba(139, 30, 63, 0.1)',
      borderRadius: '4px',
      marginTop: '0.75rem',
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      width: '84%',
      transition: 'width 0.3s',
    },
    banner: {
      padding: '1rem 1.5rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
      borderRadius: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bannerText: {
      fontSize: '0.9rem',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bannerButton: {
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      color: '#FFFEF9',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.85rem',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Row */}
      <div style={styles.heroRow}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>Cherry Desk</h1>
          <p style={styles.heroTagline}>Well red, well done, you're rare.</p>
          <div style={styles.pillsRow}>
            <span style={styles.pill}>ROLE Model</span>
            <span style={styles.pill}>Gold+ in {currentUser.xpToNextLevel} XP</span>
          </div>
        </div>
        <div style={styles.statChips}>
          <div style={styles.statChip}>
            <div style={styles.statValue}>{currentUser.sessions}</div>
            <div style={styles.statSub}>Sessions</div>
            <div style={styles.statSub}>+{currentUser.sessionsThisMonth} this month</div>
          </div>
          <div style={styles.statChip}>
            <div style={styles.statValue}>{currentUser.opportunities}</div>
            <div style={styles.statSub}>Opportunities</div>
            <div style={styles.statSub}>Matches waiting</div>
          </div>
          <div style={styles.statChip}>
            <div style={styles.statValue}>{currentUser.xp}</div>
            <div style={styles.statSub}>XP</div>
            <div style={styles.statSub}>Impact ${currentUser.impactContributed.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* 2 Column Grid */}
      <div style={styles.grid2Col}>
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>My Model Card</div>
            <div style={styles.avatar}>{user?.firstName?.charAt(0) || ''}</div>
            <div style={styles.tagline}>Cherry Bold, Rare Energy</div>
            <div style={styles.link} onClick={() => navigate('/model-portal/profile')}>
              View full card →
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>My Sessions</div>
            {recentSessions.map(session => (
              <div key={session.id} style={styles.sessionItem}>
                <div>
                  <div>{session.icon} {session.service}</div>
                  <div style={{ fontSize: '0.75rem', color: '#5A3A2A' }}>
                    {session.date} • {session.pro}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Play</div>
            <div style={{ padding: '1rem', background: 'rgba(139, 30, 63, 0.06)', borderRadius: '12px', border: '1px dashed rgba(139, 30, 63, 0.2)', textAlign: 'center', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎮</div>
              <div style={{ fontWeight: '600' }}>Coming soon</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Earn points, level up & unlock rewards</div>
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Your Impact</div>
            <div style={{ ...styles.statValue, marginBottom: '0.5rem' }}>
              ${currentUser.impactContributed.toFixed(2)}
            </div>
            <div style={styles.statSub}>
              ROLE Model contribution - Top 10%
            </div>
            <div style={styles.progressBar}>
              <div style={styles.progressBarFill}></div>
            </div>
            <div style={{ ...styles.progressText, marginTop: '0.5rem' }}>
              On track for this month's glow goal.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div style={styles.banner}>
        <div style={styles.bannerText}>
          Complete your Model Card to get matched with top stylists.
        </div>
        <button
          style={styles.bannerButton}
          onClick={() => navigate('/model-portal/profile')}
        >
          Model Card →
        </button>
      </div>
    </div>
  );
}

// ============ MOCKUP 2: TILES HUB ============
function TilesHubDashboard({ navigate, user }) {
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      background: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
    },
    statsBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
      borderRadius: '16px',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      textAlign: 'center',
      position: 'relative',
      transition: 'transform 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    statCardHover: {
      transform: 'translateY(-4px)',
    },
    statValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    statLabel: {
      fontSize: '0.9rem',
      color: '#5A3A2A',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    statTag: {
      fontSize: '0.75rem',
      color: '#8B1E3F',
      background: 'rgba(139, 30, 63, 0.1)',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      display: 'inline-block',
      fontFamily: '"Alike", "Georgia", serif',
    },
    tilesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    tile: {
      padding: '1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      minHeight: '180px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    tileHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.2)',
    },
    tileTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    tileContent: {
      fontSize: '0.85rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      marginBottom: '0.5rem',
    },
    tileIcon: {
      fontSize: '3rem',
      marginBottom: '0.5rem',
    },
    supportStrip: {
      padding: '1rem 1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
      fontSize: '0.9rem',
      color: '#5A3A2A',
      textAlign: 'center',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
      fontFamily: '"Alike", "Georgia", serif',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  };

  return (
    <div style={styles.container}>
      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{currentUser.sessions}</div>
          <div style={styles.statLabel}>Sessions</div>
          <div style={styles.statTag}>Top 10%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{currentUser.opportunities}</div>
          <div style={styles.statLabel}>Opportunities</div>
          <div style={styles.statTag}>Matches waiting</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{currentUser.rating}</div>
          <div style={styles.statLabel}>Rating</div>
          <div style={styles.statTag}>Top 10%</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{currentUser.xp}</div>
          <div style={styles.statLabel}>XP</div>
          <div style={styles.statTag}>${currentUser.impactContributed.toFixed(2)}</div>
        </div>
      </div>

      {/* Tiles Grid */}
      <div style={styles.tilesGrid}>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/profile')}
        >
          <div style={styles.tileTitle}>Model Card</div>
          <div style={styles.tileIcon}></div>
          <div style={styles.tileContent}>Cherry Bold, Rare Energy</div>
          <div style={{ ...styles.tileContent, color: '#8B1E3F', cursor: 'pointer' }}>Edit card</div>
        </div>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/sessions')}
        >
          <div style={styles.tileTitle}>Sessions</div>
          <div style={{ ...styles.tileContent, fontSize: '2rem', marginBottom: '0.5rem' }}></div>
          <div style={styles.tileContent}>{currentUser.sessions} Sessions</div>
          <div style={{ ...styles.tileContent, fontSize: '0.75rem' }}>Balayage Dec 2</div>
        </div>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/photos')}
        >
          <div style={styles.tileTitle}>Portfolio</div>
          <div style={{ ...styles.tileContent, fontSize: '1.5rem', marginBottom: '0.5rem' }}>📷 📷 📷</div>
          <div style={{ ...styles.tileContent, color: '#8B1E3F', cursor: 'pointer' }}>Open portfolio →</div>
        </div>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/learn')}
        >
          <div style={styles.tileTitle}>Learning</div>
          <div style={{ ...styles.tileContent, fontSize: '2rem', marginBottom: '0.5rem' }}>⭕</div>
          <div style={styles.tileContent}>60% complete</div>
          <div style={{ ...styles.tileContent, color: '#8B1E3F', cursor: 'pointer' }}>Continue →</div>
        </div>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/games')}
        >
          <div style={styles.tileTitle}>Play</div>
          <div style={{ ...styles.tileContent, fontSize: '1.5rem', marginBottom: '0.5rem' }}></div>
          <div style={styles.tileContent}>3-week streak</div>
          <div style={{ ...styles.tileContent, fontSize: '0.75rem' }}>You're glowing!</div>
        </div>
        <div
          style={styles.tile}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 30, 63, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={() => navigate('/model-portal/savings')}
        >
          <div style={styles.tileTitle}>Level Up</div>
          <div style={styles.statValue}>{currentUser.level}</div>
          <div style={{ ...styles.tileContent, fontSize: '0.75rem' }}>Earn in Play (coming soon)</div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(139, 30, 63, 0.1)',
            borderRadius: '3px',
            marginTop: '0.5rem',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              width: '84%',
            }}></div>
          </div>
        </div>
      </div>

      {/* Support Strip */}
      <div style={styles.supportStrip}>
        <div>Need anything? Read etiquette, safety, or get help →</div>
        <div style={{ fontSize: '1.5rem', cursor: 'pointer' }}>🔔</div>
      </div>
    </div>
  );
}

// ============ MOCKUP 3: STORYLINE ============
function StorylineDashboard({ navigate, user }) {
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      background: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
    },
    heroRow: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '2rem',
      marginBottom: '2rem',
      alignItems: 'flex-start',
    },
    heroLeft: {
      flex: '1.5',
    },
    heroTitle: {
      fontSize: '2.5rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
      lineHeight: '1.2',
    },
    heroSub: {
      fontSize: '1rem',
      color: '#5A3A2A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    heroButton: {
      padding: '0.75rem 1.5rem',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      color: '#FFFEF9',
      border: 'none',
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'transform 0.2s',
    },
    heroButtonHover: {
      transform: 'scale(1.05)',
    },
    coverCard: {
      flex: '1',
      padding: '2rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
      borderRadius: '16px',
      border: '3px solid #8B1E3F',
      textAlign: 'center',
      minHeight: '200px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(139, 30, 63, 0.2)',
    },
    coverText: {
      fontSize: '1.1rem',
      fontStyle: 'italic',
      color: '#8B1E3F',
      fontFamily: '"Alike", "Georgia", serif',
      marginTop: '1rem',
    },
    coverIcon: {
      fontSize: '4rem',
    },
    timelineSection: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginBottom: '2rem',
    },
    timeline: {
      padding: '1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    timelineTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineItem: {
      padding: '1rem',
      marginBottom: '1rem',
      fontSize: '0.85rem',
      color: '#4A2A1A',
      borderLeft: '4px solid #8B1E3F',
      paddingLeft: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
      background: 'rgba(139, 30, 63, 0.03)',
      borderRadius: '8px',
    },
    suggestionCard: {
      padding: '1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '16px',
      marginBottom: '1rem',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    suggestionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    suggestionSub: {
      fontSize: '0.85rem',
      color: '#5A3A2A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    suggestionButton: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      border: '1px solid #8B1E3F',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#8B1E3F',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s',
    },
    suggestionButtonFilled: {
      background: '#8B1E3F',
      color: '#FFFEF9',
      border: 'none',
    },
    bottomChips: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      padding: '1.5rem',
    },
    chip: {
      fontSize: '0.9rem',
      color: '#8B1E3F',
      cursor: 'pointer',
      borderBottom: '1px dashed rgba(139, 30, 63, 0.3)',
      paddingBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s',
    },
    chipHover: {
      borderBottom: '2px solid #8B1E3F',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Row */}
      <div style={styles.heroRow}>
        <div style={styles.heroLeft}>
          <h1 style={styles.heroTitle}>This month's storyline: Winter Blonde Lab</h1>
          <p style={styles.heroSub}>
            {recentSessions.length} looks this month • Level {currentUser.level}
          </p>
          <button
            style={styles.heroButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            onClick={() => navigate('/model-portal/opportunities')}
          >
            Continue your story →
          </button>
        </div>
        <div style={styles.coverCard}>
          <div style={styles.coverIcon}></div>
          <div style={styles.coverText}>Cover girl of the week</div>
        </div>
      </div>

      {/* Timeline + Suggestions */}
      <div style={styles.timelineSection}>
        <div style={styles.timeline}>
          <div style={styles.timelineTitle}>Your Cherry Timeline</div>
          {recentSessions.map(session => (
            <div key={session.id} style={styles.timelineItem}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {session.icon} {session.service}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#5A3A2A' }}>
                {session.date} • {session.pro}
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={styles.timelineTitle}>Because of your last look…</div>
          <div style={styles.suggestionCard}>
            <div style={styles.suggestionTitle}>Gloss / Toner in 4–6 weeks</div>
            <div style={styles.suggestionSub}>Recommended based on your Balayage</div>
            <button
              style={styles.suggestionButton}
              onClick={() => navigate('/model-portal/opportunities')}
            >
              Preview matches
            </button>
          </div>
          <div style={styles.suggestionCard}>
            <div style={styles.suggestionTitle}>Play section coming soon</div>
            <div style={styles.suggestionSub}>Earn points, level up & unlock rewards</div>
            <div style={{ ...styles.suggestionSub, marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.9 }}>
              Stay tuned!
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Chips */}
      <div style={styles.bottomChips}>
        <span
          style={styles.chip}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '2px solid #8B1E3F';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = '1px dashed rgba(139, 30, 63, 0.3)';
            e.currentTarget.style.fontWeight = 'normal';
          }}
          onClick={() => navigate('/model-portal/profile')}
        >
          Model Card
        </span>
        <span
          style={styles.chip}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '2px solid #8B1E3F';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = '1px dashed rgba(139, 30, 63, 0.3)';
            e.currentTarget.style.fontWeight = 'normal';
          }}
          onClick={() => navigate('/model-portal/photos')}
        >
          Portfolio
        </span>
        <span
          style={styles.chip}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderBottom = '2px solid #8B1E3F';
            e.currentTarget.style.fontWeight = '600';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderBottom = '1px dashed rgba(139, 30, 63, 0.3)';
            e.currentTarget.style.fontWeight = 'normal';
          }}
          onClick={() => navigate('/model-portal/games')}
        >
          Play
        </span>
      </div>
    </div>
  );
}

// ============ MOCKUP 4: PERSONAL MAGAZINE (Hybrid) ============
function PersonalMagazineDashboard({ navigate, user }) {
  // Mock photos for scrolling gallery - enhanced for active model with REAL hair photos
  const photos = [
    { id: 1, url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop', caption: 'Profile Headshot', service: 'profile' },
    { id: 2, url: getPhotoForService('balayage'), caption: 'Balayage - Dec 15', service: 'balayage' },
    { id: 3, url: getPhotoForService('color-correction'), caption: 'Color Correction - Dec 8', service: 'color' },
    { id: 4, url: getPhotoForService('haircut'), caption: 'Layered Cut - Dec 3', service: 'haircut' },
    { id: 5, url: getPhotoForService('treatment'), caption: 'Keratin Glow - Nov 28', service: 'treatment' },
    { id: 6, url: getPhotoForService('highlights'), caption: 'Highlights - Nov 22', service: 'color' },
    { id: 7, url: getPhotoForService('blowout'), caption: 'Blowout Style - Dec 12', service: 'blowout' },
    { id: 8, url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop', caption: 'Bold Transformation', service: 'color' },
  ];

  const styles = {
    container: {
      padding: '0',
      maxWidth: '100%',
      margin: '0 auto',
      background: '#FFFEF9',
      fontFamily: '"Alike", "Georgia", serif',
      minHeight: '100vh',
    },
    // Magazine-style hero
    heroSection: {
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.95), rgba(168, 90, 90, 0.9))',
      padding: '4rem 2rem 3rem',
      textAlign: 'center',
      color: '#FFFEF9',
      position: 'relative',
      overflow: 'hidden',
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
      letterSpacing: '-0.02em',
      textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    },
    heroTagline: {
      fontSize: '1.3rem',
      fontStyle: 'italic',
      marginBottom: '1rem',
      opacity: 0.95,
      fontFamily: '"Alike", "Georgia", serif',
    },
    heroPills: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      flexWrap: 'wrap',
      marginTop: '1rem',
    },
    heroPill: {
      padding: '0.5rem 1.25rem',
      borderRadius: '25px',
      fontSize: '0.9rem',
      fontWeight: '600',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      color: '#FFFEF9',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      fontFamily: '"Alike", "Georgia", serif',
    },
    // Narrative story section
    storySection: {
      padding: '3rem 2rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    storyTitle: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
      fontStyle: 'italic',
    },
    storyText: {
      fontSize: '1.1rem',
      lineHeight: '1.8',
      color: '#4A2A1A',
      marginBottom: '2rem',
      fontFamily: '"Alike", "Georgia", serif',
      maxWidth: '800px',
    },
    // Financial snapshot (no header)
    financialSnapshot: {
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
      borderRadius: '20px',
      padding: '2rem',
      margin: '2rem 0',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    financialGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
    },
    financialCard: {
      textAlign: 'center',
      padding: '1.5rem',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '12px',
    },
    financialValue: {
      fontSize: '2rem',
      fontWeight: '700',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    financialLabel: {
      fontSize: '0.9rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    // Scrolling sections container
    scrollSections: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '2rem',
      marginTop: '2rem',
      maxWidth: '1200px',
      margin: '2rem auto',
      padding: '0 2rem',
    },
    scrollSection: {
      background: '#FFFEF9',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
    },
    scrollSectionTitle: {
      padding: '1.5rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
      borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      opacity: 0.7,
    },
    scrollContent: {
      maxHeight: '400px',
      overflowY: 'auto',
      padding: '1rem',
    },
    // Photo scroll item
    photoItem: {
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    photoImage: {
      width: '100%',
      aspectRatio: '4/3',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '4rem',
      marginBottom: '0.5rem',
      border: '1px solid rgba(139, 30, 63, 0.15)',
    },
    photoCaption: {
      fontSize: '0.85rem',
      color: '#5A3A2A',
      fontStyle: 'italic',
      fontFamily: '"Alike", "Georgia", serif',
    },
    // Session scroll item
    sessionItem: {
      padding: '1rem',
      marginBottom: '1rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
      borderLeft: '4px solid #8B1E3F',
    },
    sessionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.5rem',
    },
    sessionService: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    sessionValue: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#8B1E3F',
      fontFamily: '"Alike", "Georgia", serif',
    },
    sessionMeta: {
      fontSize: '0.85rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    // Interests section
    interestsSection: {
      padding: '2rem',
      background: 'rgba(139, 30, 63, 0.03)',
      borderRadius: '16px',
      marginTop: '2rem',
      maxWidth: '1200px',
      margin: '2rem auto',
      border: '1px solid rgba(139, 30, 63, 0.1)',
    },
    // Archive section
    archiveSection: {
      padding: '2rem',
      background: 'rgba(139, 30, 63, 0.03)',
      borderRadius: '16px',
      marginTop: '2rem',
      maxWidth: '1200px',
      margin: '2rem auto',
      border: '1px solid rgba(139, 30, 63, 0.1)',
    },
    archiveGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '1rem',
      marginTop: '1rem',
    },
    archiveItem: {
      padding: '1rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(139, 30, 63, 0.1)',
      textAlign: 'center',
    },
    archiveIcon: {
      fontSize: '2rem',
      marginBottom: '0.5rem',
    },
    archiveName: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    archiveMeta: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    interestsGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
    },
    interestTag: {
      padding: '0.5rem 1rem',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '20px',
      fontSize: '0.85rem',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero Section - Magazine Cover Style */}
      <div style={styles.heroSection}>
        <h1 style={styles.heroTitle}>Cherry Desk</h1>
        <p style={styles.heroTagline}>Well red, well done, you're rare.</p>
        <div style={styles.heroPills}>
          <span style={styles.heroPill}>ROLE Model</span>
          <span style={styles.heroPill}>{currentUser.level}</span>
          <span style={styles.heroPill}>{currentUser.xp} XP</span>
          <span style={styles.heroPill}>Top 10%</span>
        </div>
      </div>

      {/* Narrative Story Section */}
      <div style={styles.storySection}>
        <h2 style={styles.storyTitle}>This Month's Story: Winter Blonde Lab</h2>
        <p style={styles.storyText}>
          Welcome to your personal beauty journey. This month, you've explored {currentUser.sessionsThisMonth} stunning looks 
          and continued your growth as a beauty enthusiast. 
          With {currentUser.sessions} total sessions and an {currentUser.rating}-star rating, you've established yourself as one of our top models. 
          Each session tells a story—from the bold Balayage transformation to the sleek blowouts that frame your features. 
          You're not just a model; you're a canvas, an artist, a storyteller of style.
        </p>
        <p style={styles.storyText}>
          Your journey with Cherry Desk is about more than beauty—it's about discovering who you are through 
          experimentation, refinement, and the confidence that comes from looking and feeling your absolute best. 
          Every cut, every color, every style is a chapter in your unique narrative. Your {currentUser.streak}-week booking streak 
          and your contribution of ${currentUser.impactContributed.toFixed(2)} to our community—that's impact.
        </p>
      </div>

      {/* Financial Snapshot - No Header */}
      <div style={styles.financialSnapshot}>
        <div style={styles.financialGrid}>
          <div style={styles.financialCard}>
            <div style={styles.financialValue}>{currentUser.opportunities}</div>
            <div style={styles.financialLabel}>Opportunities</div>
            <div style={{ ...styles.financialLabel, fontSize: '0.75rem', marginTop: '0.25rem', color: '#8B1E3F' }}>
              Matches waiting
            </div>
          </div>
          <div style={styles.financialCard}>
            <div style={styles.financialValue}>{currentUser.sessions}</div>
            <div style={styles.financialLabel}>Sessions Completed</div>
            <div style={{ ...styles.financialLabel, fontSize: '0.75rem', marginTop: '0.25rem', color: '#8B1E3F' }}>
              {currentUser.sessionsThisMonth} this month
            </div>
          </div>
          <div style={styles.financialCard}>
            <div style={styles.financialValue}>${currentUser.impactContributed.toFixed(2)}</div>
            <div style={styles.financialLabel}>Impact Contributed</div>
            <div style={{ ...styles.financialLabel, fontSize: '0.75rem', marginTop: '0.25rem', color: '#8B1E3F' }}>
              ROLE Model Status
            </div>
          </div>
        </div>
      </div>

      {/* Scrolling Sections: Photos & Sessions */}
      <div style={styles.scrollSections}>
        {/* Scrolling Photos */}
        <div style={styles.scrollSection}>
          <div style={styles.scrollSectionTitle}>Photo Journey</div>
          <div style={styles.scrollContent}>
            {photos.map((photo) => (
              <div key={photo.id} style={styles.photoItem}>
                <div style={styles.photoImage}>
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                    onError={handleImageError}
                  />
                </div>
                <div style={styles.photoCaption}>{photo.caption}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid #8B1E3F',
                  borderRadius: '8px',
                  color: '#8B1E3F',
                  cursor: 'pointer',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
                onClick={() => navigate('/model-portal/photos')}
              >
                View Full Portfolio →
              </button>
            </div>
          </div>
        </div>

        {/* Scrolling Sessions */}
        <div style={styles.scrollSection}>
          <div style={styles.scrollSectionTitle}>Session History</div>
          <div style={styles.scrollContent}>
            {recentSessions.map((session) => (
              <div key={session.id} style={styles.sessionItem}>
                <div style={styles.sessionHeader}>
                  <div style={styles.sessionService}>
                    {session.icon} {session.service}
                  </div>
                </div>
                <div style={styles.sessionMeta}>
                  {session.date} • with {session.pro}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <button
                style={{
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid #8B1E3F',
                  borderRadius: '8px',
                  color: '#8B1E3F',
                  cursor: 'pointer',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
                onClick={() => navigate('/model-portal/sessions')}
              >
                View All Sessions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Archive - Play section coming later */}
      <div style={styles.archiveSection}>
        <div style={styles.archiveGrid}>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}>⭐</div>
            <div style={styles.archiveName}>Top 5% Rating</div>
            <div style={styles.archiveMeta}>Elite Achievement</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}></div>
            <div style={styles.archiveName}>8-Week Streak</div>
            <div style={styles.archiveMeta}>Consistency Badge</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}></div>
            <div style={styles.archiveName}>ROLE Model</div>
            <div style={styles.archiveMeta}>Status Badge</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}></div>
            <div style={styles.archiveName}>Platinum Level</div>
            <div style={styles.archiveMeta}>${currentUser.impactContributed.toFixed(2)} Impact</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}></div>
            <div style={styles.archiveName}>30+ Sessions</div>
            <div style={styles.archiveMeta}>Milestone Badge</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}>🏆</div>
            <div style={styles.archiveName}>Community Champion</div>
            <div style={styles.archiveMeta}>Impact Badge</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}>⚡</div>
            <div style={styles.archiveName}>Fast Responder</div>
            <div style={styles.archiveMeta}>Quick Action Badge</div>
          </div>
          <div style={styles.archiveItem}>
            <div style={styles.archiveIcon}>🌙</div>
            <div style={styles.archiveName}>Night Owl</div>
            <div style={styles.archiveMeta}>Flexible Availability</div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid #8B1E3F',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              color: '#8B1E3F',
              fontFamily: '"Alike", "Georgia", serif',
            }}
            onClick={() => navigate('/model-portal/profile')}
          >
            Play coming soon →
          </button>
        </div>
      </div>

      {/* Interests & Services Section */}
      <div style={styles.interestsSection}>
        <div style={styles.interestsGrid}>
          <span style={styles.interestTag}>Open to color</span>
          <span style={styles.interestTag}>Love balayage</span>
          <span style={styles.interestTag}>Trims OK</span>
          <span style={styles.interestTag}>Love blowouts</span>
          <span style={styles.interestTag}>No bleach</span>
          <span style={styles.interestTag}>Mornings preferred</span>
          <span style={styles.interestTag}>Manhattan only</span>
          <span style={styles.interestTag}>Natural styles</span>
          <span style={styles.interestTag}>Open to experiment</span>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#FFFEF9',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
            onClick={() => navigate('/model-portal/profile')}
          >
            Edit Your Preferences →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT WITH SWITCHER ============
export default function CherryDeskDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [activeMockup, setActiveMockup] = useState(4); // Default to Personal Magazine

  const switcherStyles = {
    container: {
      padding: '1rem 2rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    button: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#5A3A2A',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s',
    },
    buttonActive: {
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      color: '#FFFEF9',
      border: 'none',
      fontWeight: '600',
    },
  };

  return (
    <div>
      {/* Switcher */}
      <div style={switcherStyles.container}>
        <button
          style={{
            ...switcherStyles.button,
            ...(activeMockup === 1 ? switcherStyles.buttonActive : {}),
          }}
          onClick={() => setActiveMockup(1)}
        >
          Mockup 1: Magazine Cover
        </button>
        <button
          style={{
            ...switcherStyles.button,
            ...(activeMockup === 2 ? switcherStyles.buttonActive : {}),
          }}
          onClick={() => setActiveMockup(2)}
        >
          Mockup 2: Tiles Hub
        </button>
        <button
          style={{
            ...switcherStyles.button,
            ...(activeMockup === 3 ? switcherStyles.buttonActive : {}),
          }}
          onClick={() => setActiveMockup(3)}
        >
          Mockup 3: Storyline
        </button>
        <button
          style={{
            ...switcherStyles.button,
            ...(activeMockup === 4 ? switcherStyles.buttonActive : {}),
          }}
          onClick={() => setActiveMockup(4)}
        >
          Personal Magazine
        </button>
      </div>

      {/* Render Active Mockup */}
      {activeMockup === 1 && <MagazineCoverDashboard navigate={navigate} user={user} />}
      {activeMockup === 2 && <TilesHubDashboard navigate={navigate} user={user} />}
      {activeMockup === 3 && <StorylineDashboard navigate={navigate} user={user} />}
      {activeMockup === 4 && <PersonalMagazineDashboard navigate={navigate} user={user} />}
    </div>
  );
}

