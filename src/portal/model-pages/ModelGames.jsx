import React, { useState } from 'react';

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
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.95rem',
  },
  
  // XP Banner
  xpBanner: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.3), rgba(255,107,138,0.2))',
    border: '1px solid rgba(233,69,96,0.4)',
    borderRadius: '20px',
    padding: '1.5rem 2rem',
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  xpIcon: {
    fontSize: '3rem',
  },
  xpText: {},
  xpLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
  },
  xpValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#e94560',
  },
  xpStats: {
    display: 'flex',
    gap: '2rem',
  },
  xpStat: {
    textAlign: 'center',
  },
  xpStatValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  xpStatLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
  },
  
  // Section
  section: {
    marginBottom: '2.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionLink: {
    color: '#e94560',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  
  // Quiz grid
  quizGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  
  // Quiz card
  quizCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '2px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
  },
  quizLocked: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  quizImage: {
    aspectRatio: '16/10',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quizEmoji: {
    fontSize: 0,
    marginBottom: 0,
  },
  quizBadge: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  quizNew: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    padding: '0.35rem 0.75rem',
    background: '#e94560',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    animation: 'pulse 2s infinite',
  },
  quizInfo: {
    padding: '1.25rem',
  },
  quizTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  quizDesc: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
  quizMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizXp: {
    fontWeight: '700',
    color: '#e94560',
  },
  quizQuestions: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
  },
  quizLockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '20px',
  },
  quizLockText: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    marginTop: '0.5rem',
  },
  
  // Daily challenge
  dailyCard: {
    background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,193,7,0.05))',
    border: '1px solid rgba(255,193,7,0.3)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  dailyContent: {},
  dailyBadge: {
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    background: '#ffc107',
    color: '#000',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  dailyTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  dailyDesc: {
    color: '#5A3A2A',
    marginBottom: '1rem',
  },
  dailyBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #ffc107, #ffca28)',
    border: 'none',
    borderRadius: '25px',
    color: '#000',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  dailyReward: {
    textAlign: 'center',
  },
  dailyRewardValue: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#ffc107',
  },
  dailyRewardLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
  },
  
  // Achievements
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '1rem',
  },
  achievementCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.25rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  achievementIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 0,
    margin: '0 auto 0.75rem',
  },
  achievementTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  achievementXp: {
    fontSize: '0.75rem',
    color: '#e94560',
  },
  
  // Leaderboard
  leaderboardCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '20px',
    padding: '1.5rem',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    marginBottom: '0.75rem',
  },
  leaderboardRank: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  leaderboardLevel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  leaderboardXp: {
    fontWeight: '700',
    color: '#e94560',
  },
};

// Quiz data - these gather insights for matching!
const quizzes = [
  {
    id: 1,
    title: 'Hair Type Detective',
    desc: 'Discover your exact hair type, texture, and porosity. Helps us find your perfect match!',
    emoji: '🔬',
    xp: 150,
    questions: 12,
    gradient: 'linear-gradient(135deg, rgba(233,69,96,0.3), rgba(255,107,138,0.2))',
    completed: true,
    locked: false,
    isNew: false,
  },
  {
    id: 2,
    title: 'Color Personality',
    desc: 'What colors suit your skin tone? Are you warm or cool? Find out your perfect palette!',
    emoji: '🌈',
    xp: 200,
    questions: 15,
    gradient: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.2))',
    completed: false,
    locked: false,
    isNew: false,
  },
  {
    id: 3,
    title: 'Style Finder',
    desc: 'Bohemian? Classic? Edgy? Discover your signature style and we\'ll match you accordingly!',
    emoji: '👗',
    xp: 175,
    questions: 10,
    gradient: 'linear-gradient(135deg, rgba(76,175,80,0.3), rgba(76,175,80,0.1))',
    completed: false,
    locked: false,
    isNew: true,
  },
  {
    id: 4,
    title: '🧪 Damage Detective',
    desc: 'How damaged is your hair really? We\'ll assess and recommend the right treatments.',
    emoji: '🔎',
    xp: 125,
    questions: 8,
    gradient: 'linear-gradient(135deg, rgba(255,193,7,0.3), rgba(255,193,7,0.1))',
    completed: false,
    locked: false,
    isNew: true,
  },
  {
    id: 5,
    title: '⏰ Lifestyle Matcher',
    desc: 'How much time do you spend on hair? We\'ll find styles that fit YOUR life.',
    emoji: '💼',
    xp: 100,
    questions: 6,
    gradient: 'linear-gradient(135deg, rgba(156,39,176,0.3), rgba(156,39,176,0.1))',
    completed: false,
    locked: false,
    isNew: false,
  },
  {
    id: 6,
    title: 'Risk Taker Quiz',
    desc: 'Are you adventurous or play it safe? Helps us know how bold to go with matches!',
    emoji: '',
    xp: 150,
    questions: 10,
    gradient: 'linear-gradient(135deg, rgba(244,67,54,0.3), rgba(244,67,54,0.1))',
    completed: false,
    locked: true,
    lockReason: 'Complete 3 quizzes to unlock',
    isNew: false,
  },
];

const achievements = [
  { icon: '', title: 'First Quiz', xp: 50, bg: 'rgba(233,69,96,0.2)', unlocked: true },
  { icon: '', title: '3 Day Streak', xp: 100, bg: 'rgba(255,193,7,0.2)', unlocked: true },
  { icon: '', title: 'Quick Thinker', xp: 75, bg: 'rgba(102,126,234,0.2)', unlocked: true },
  { icon: '', title: 'Perfect Score', xp: 200, bg: 'rgba(76,175,80,0.2)', unlocked: false },
  { icon: '', title: 'Quiz Master', xp: 500, bg: 'rgba(156,39,176,0.2)', unlocked: false },
  { icon: '', title: 'Legendary', xp: 1000, bg: 'rgba(255,107,138,0.2)', unlocked: false },
];

const leaderboard = [];

export default function ModelGames() {
  const [hoveredQuiz, setHoveredQuiz] = useState(null);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Let&apos;s Play</h1>
        <p style={styles.subtitle}>Play quizzes, earn XP, and unlock rewards.</p>
      </div>

      {/* XP Banner */}
      <div style={styles.xpBanner}>
        <div style={styles.xpInfo}>
          <div style={styles.xpIcon}></div>
          <div style={styles.xpText}>
            <div style={styles.xpLabel}>YOUR XP</div>
            <div style={styles.xpValue}>2,450 XP</div>
          </div>
        </div>
          <div style={styles.xpStats}>
            <div style={styles.xpStat}>
              <div style={{ ...styles.xpStatValue, color: '#4caf50' }}>8</div>
              <div style={styles.xpStatLabel}>Quizzes Done</div>
            </div>
            <div style={styles.xpStat}>
              <div style={{ ...styles.xpStatValue, color: '#ffc107' }}>5</div>
              <div style={styles.xpStatLabel}>Day Streak</div>
            </div>
          </div>
      </div>

      {/* Daily Challenge */}
      <div style={styles.dailyCard}>
        <div style={styles.dailyContent}>
          <span style={styles.dailyBadge}>DAILY CHALLENGE</span>
          <h2 style={styles.dailyTitle}>Quick Hair Trivia!</h2>
          <p style={styles.dailyDesc}>
            5 rapid-fire questions about hair care. Answer correctly to earn bonus XP!
          </p>
          <button style={styles.dailyBtn}>Play Now →</button>
        </div>
        <div style={styles.dailyReward}>
          <div style={styles.dailyRewardValue}>+100</div>
          <div style={styles.dailyRewardLabel}>Bonus XP</div>
        </div>
      </div>

      {/* Quizzes Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Personality Quizzes
          </h2>
          <span style={styles.sectionLink}>View All →</span>
        </div>
        
        <div style={styles.quizGrid}>
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              style={{
                ...styles.quizCard,
                ...(quiz.locked ? styles.quizLocked : {}),
                borderColor: hoveredQuiz === quiz.id && !quiz.locked ? '#e94560' : 'rgba(255,255,255,0.06)',
                transform: hoveredQuiz === quiz.id && !quiz.locked ? 'translateY(-5px)' : 'translateY(0)',
              }}
              onMouseEnter={() => setHoveredQuiz(quiz.id)}
              onMouseLeave={() => setHoveredQuiz(null)}
            >
              <div style={{ ...styles.quizImage, background: quiz.gradient }}>
                <div style={styles.quizEmoji}>{quiz.emoji}</div>
                {quiz.completed && (
                  <div style={{
                    ...styles.quizBadge,
                    background: '#4caf50',
                    color: '#fff',
                  }}>
                    DONE
                  </div>
                )}
                {quiz.isNew && !quiz.completed && (
                  <div style={styles.quizNew}>NEW!</div>
                )}
              </div>
              
              <div style={styles.quizInfo}>
                <div style={styles.quizTitle}>{quiz.title}</div>
                <div style={styles.quizDesc}>{quiz.desc}</div>
                <div style={styles.quizMeta}>
                  <span style={styles.quizXp}>+{quiz.xp} XP</span>
                  <span style={styles.quizQuestions}>{quiz.questions} questions</span>
                </div>
              </div>
              
              {quiz.locked && (
                <div style={styles.quizLockOverlay}>
                  <span style={{ fontSize: '3rem' }}></span>
                  <span style={styles.quizLockText}>{quiz.lockReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            Achievements
          </h2>
        </div>
        
        <div style={styles.achievementsGrid}>
          {achievements.map((achievement, i) => (
            <div
              key={i}
              style={{
                ...styles.achievementCard,
                opacity: achievement.unlocked ? 1 : 0.5,
              }}
            >
              <div style={{
                ...styles.achievementIcon,
                background: achievement.unlocked ? achievement.bg : 'rgba(255,255,255,0.05)',
              }}>
                {achievement.unlocked ? achievement.icon : ''}
              </div>
              <div style={styles.achievementTitle}>{achievement.title}</div>
              <div style={styles.achievementXp}>+{achievement.xp} XP</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

