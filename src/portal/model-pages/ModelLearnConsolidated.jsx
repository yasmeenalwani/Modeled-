// ============================================
// LEARN & GLOW - Consolidated Page
// Learning content + Quizzes/Games in unified feed
// ============================================

import React, { useState, useMemo } from 'react';

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
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Progress banner
  progressBanner: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {},
  progressTitle: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressBar: {
    width: '300px',
    height: '8px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)', // Cherry gradient
    borderRadius: '4px',
  },
  progressStats: {
    display: 'flex',
    gap: '2rem',
  },
  progressStat: {
    textAlign: 'center',
  },
  progressStatValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressStatLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Category filters
  categoryTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  categoryTab: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '25px',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  categoryTabActive: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Unified feed
  feedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  
  // Content card (for learning)
  contentCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  contentImage: {
    aspectRatio: '16/9',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.2), rgba(168, 90, 90, 0.15))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    position: 'relative',
  },
  contentBadge: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  contentDuration: {
    position: 'absolute',
    bottom: '0.75rem',
    right: '0.75rem',
    padding: '0.3rem 0.6rem',
    background: 'rgba(0,0,0,0.7)',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  contentInfo: {
    padding: '1.25rem',
  },
  contentTitle: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    fontSize: '1rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  contentMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  contentProgress: {
    height: '4px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  contentProgressFill: {
    height: '100%',
    background: '#8B1E3F', // Cherry
    borderRadius: '2px',
  },
  contentXp: {
    marginTop: '0.75rem',
    fontSize: '0.8rem',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Quiz card (for games/quizzes)
  quizCard: {
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
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
    fontSize: '4rem',
    marginBottom: '0.5rem',
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
    background: '#8B1E3F', // Cherry
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizInfo: {
    padding: '1.25rem',
  },
  quizTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizDesc: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    lineHeight: 1.5,
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quizXp: {
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  quizQuestions: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Featured
  featuredCard: {
    gridColumn: '1 / -1',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  featuredContent: {},
  featuredBadge: {
    display: 'inline-block',
    padding: '0.35rem 0.75rem',
    background: '#8B1E3F', // Cherry
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredDesc: {
    color: '#5A3A2A', // Darker espresso brown (muted)
    lineHeight: 1.6,
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '25px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredImage: {
    aspectRatio: '16/9',
    borderRadius: '12px',
    background: 'rgba(139, 30, 63, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '5rem',
  },
};

// Combined content (learning + quizzes)
const allContent = [
  // Learning content
  {
    id: 1,
    type: 'learning',
    title: 'Understanding Your Hair Type',
    category: 'hair-care',
    emoji: '🔬',
    duration: '8 min',
    contentType: 'Article',
    xp: 50,
    progress: 100,
    completed: true,
  },
  {
    id: 2,
    type: 'learning',
    title: 'How to Prep for a Color Session',
    category: 'color',
    emoji: '',
    duration: '12 min',
    contentType: 'Video',
    xp: 100,
    progress: 75,
    completed: false,
  },
  // Quizzes
  {
    id: 3,
    type: 'quiz',
    title: 'Hair Type Detective',
    category: 'hair-care',
    emoji: '🔬',
    desc: 'Discover your exact hair type, texture, and porosity. Helps us find your perfect match!',
    xp: 150,
    questions: 12,
    gradient: 'linear-gradient(135deg, rgba(233,69,96,0.3), rgba(255,107,138,0.2))',
    completed: true,
    locked: false,
    isNew: false,
  },
  {
    id: 4,
    type: 'learning',
    title: 'Being the Perfect Model',
    category: 'model-tips',
    emoji: '💄',
    duration: '10 min',
    contentType: 'Article',
    xp: 75,
    progress: 0,
    completed: false,
  },
  {
    id: 5,
    type: 'quiz',
    title: 'Color Personality',
    category: 'color',
    emoji: '🌈',
    desc: 'What colors suit your skin tone? Are you warm or cool? Find out your perfect palette!',
    xp: 200,
    questions: 15,
    gradient: 'linear-gradient(135deg, rgba(102,126,234,0.3), rgba(118,75,162,0.2))',
    completed: false,
    locked: false,
    isNew: false,
  },
  {
    id: 6,
    type: 'learning',
    title: 'Hair Masks: When & Why',
    category: 'hair-care',
    emoji: '🧴',
    duration: '6 min',
    contentType: 'Video',
    xp: 50,
    progress: 100,
    completed: true,
  },
  {
    id: 7,
    type: 'quiz',
    title: 'Style Finder',
    category: 'styling',
    emoji: '👗',
    desc: 'Bohemian? Classic? Edgy? Discover your signature style and we\'ll match you accordingly!',
    xp: 175,
    questions: 10,
    gradient: 'linear-gradient(135deg, rgba(76,175,80,0.3), rgba(76,175,80,0.1))',
    completed: false,
    locked: false,
    isNew: true,
  },
  {
    id: 8,
    type: 'learning',
    title: 'Protecting Color-Treated Hair',
    category: 'color',
    emoji: '',
    duration: '15 min',
    contentType: 'Guide',
    xp: 125,
    progress: 30,
    completed: false,
  },
];

const categories = [
  { key: 'all', label: 'All Content', icon: '' },
  { key: 'hair-care', label: 'Hair Care', icon: '' },
  { key: 'styling', label: 'Styling Tips', icon: '' },
  { key: 'color', label: 'Color Knowledge', icon: '' },
  { key: 'model-tips', label: 'Model Tips', icon: '' },
  { key: 'wellness', label: 'Wellness', icon: '' },
];

export default function ModelLearnConsolidated() {
  const [activeCategory, setActiveCategory] = useState('all');
  
  const filteredContent = useMemo(() => {
    if (activeCategory === 'all') {
      return allContent;
    }
    return allContent.filter(c => c.category === activeCategory);
  }, [activeCategory]);

  const completedCount = allContent.filter(c => c.completed).length;
  const totalXpEarned = allContent.filter(c => c.completed).reduce((sum, c) => sum + c.xp, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Learn & Glow</h1>
        <p style={styles.subtitle}>Educational content, quizzes, and games to help you shine and improve your matches</p>
      </div>

      {/* Progress Banner */}
      <div style={styles.progressBanner}>
        <div style={styles.progressInfo}>
          <div style={styles.progressTitle}>
            Your Learning Progress
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${(completedCount / allContent.length) * 100}%`,
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
            {completedCount} of {allContent.length} items completed
          </div>
        </div>
        <div style={styles.progressStats}>
          <div style={styles.progressStat}>
            <div style={styles.progressStatValue}>{completedCount}</div>
            <div style={styles.progressStatLabel}>Completed</div>
          </div>
          <div style={styles.progressStat}>
            <div style={{ ...styles.progressStatValue, color: '#8B1E3F' }}>{totalXpEarned}</div>
            <div style={styles.progressStatLabel}>XP Earned</div>
          </div>
          <div style={styles.progressStat}>
            <div style={{ ...styles.progressStatValue, color: '#8B1E3F' }}>3</div>
            <div style={styles.progressStatLabel}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* Featured Course */}
      <div style={styles.featuredCard}>
        <div style={styles.featuredContent}>
          <span style={styles.featuredBadge}>FEATURED</span>
          <h2 style={styles.featuredTitle}>Complete Hair Care Guide</h2>
          <p style={styles.featuredDesc}>
            Everything you need to know about keeping your hair healthy, shiny, and 
            ready for your next session. Learn from industry experts!
          </p>
          <button style={styles.featuredBtn}>Start Learning → +250 XP</button>
        </div>
        <div style={styles.featuredImage}></div>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(cat => (
          <button
            key={cat.key}
            style={{
              ...styles.categoryTab,
              ...(activeCategory === cat.key ? styles.categoryTabActive : {}),
            }}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Unified Feed */}
      <div style={styles.feedGrid}>
        {filteredContent.map(item => {
          if (item.type === 'learning') {
            return (
              <div
                key={item.id}
                style={styles.contentCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#8B1E3F';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
                }}
              >
                <div style={styles.contentImage}>
                  {item.emoji}
                  <div style={{
                    ...styles.contentBadge,
                    background: item.completed ? 'rgba(139, 30, 63, 0.8)' : '#8B1E3F',
                    color: '#FFFEF9',
                  }}>
                    {item.completed ? 'DONE' : item.contentType}
                  </div>
                  <div style={styles.contentDuration}>{item.duration}</div>
                </div>
                <div style={styles.contentInfo}>
                  <div style={styles.contentTitle}>{item.title}</div>
                  <div style={styles.contentMeta}>{item.contentType}</div>
                  {item.progress > 0 && item.progress < 100 && (
                    <div style={styles.contentProgress}>
                      <div style={{
                        ...styles.contentProgressFill,
                        width: `${item.progress}%`,
                      }} />
                    </div>
                  )}
                  <div style={styles.contentXp}>
                    {item.completed ? `✓ +${item.xp} XP earned` : `+${item.xp} XP`}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                style={styles.quizCard}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#8B1E3F';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
                }}
              >
                <div style={{ ...styles.quizImage, background: item.gradient }}>
                  <div style={styles.quizEmoji}>{item.emoji}</div>
                  {item.completed && (
                    <div style={{
                      ...styles.quizBadge,
                      background: '#4caf50',
                      color: '#FFFEF9',
                    }}>
                      ✓ DONE
                    </div>
                  )}
                  {item.isNew && !item.completed && (
                    <div style={styles.quizNew}>NEW!</div>
                  )}
                </div>
                <div style={styles.quizInfo}>
                  <div style={styles.quizTitle}>{item.title}</div>
                  <div style={styles.quizDesc}>{item.desc}</div>
                  <div style={styles.quizMeta}>
                    <span style={styles.quizXp}>+{item.xp} XP</span>
                    <span style={styles.quizQuestions}>{item.questions} questions</span>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}

