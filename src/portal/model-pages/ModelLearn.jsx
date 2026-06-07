import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import DailyQuestionWidget from '../../components/DailyQuestionWidget';

const client = generateClient();

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
  
  // Progress banner
  progressBanner: {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(118,75,162,0.1))',
    border: '1px solid rgba(102,126,234,0.3)',
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
  },
  progressBar: {
    width: '300px',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
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
    color: '#667eea',
  },
  progressStatLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
  },
  
  // Category tabs
  categoryTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  categoryTab: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '25px',
    color: '#5A3A2A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  categoryTabActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Content grid
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  
  // Content card
  contentCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  contentImage: {
    aspectRatio: '16/9',
    background: 'linear-gradient(135deg, rgba(233,69,96,0.3), rgba(255,107,138,0.2))',
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
  },
  contentMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginBottom: '0.75rem',
  },
  contentProgress: {
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  contentProgressFill: {
    height: '100%',
    background: '#e94560',
    borderRadius: '2px',
  },
  contentXp: {
    marginTop: '0.75rem',
    fontSize: '0.8rem',
    color: '#e94560',
    fontWeight: '600',
  },
  
  // Featured course
  featuredCard: {
    gridColumn: '1 / -1',
    background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(255,107,138,0.1))',
    border: '1px solid rgba(233,69,96,0.3)',
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
    background: '#e94560',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  featuredTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  featuredDesc: {
    color: '#4A2A1A',
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  featuredBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '25px',
    color: '#4A2A1A',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  featuredImage: {
    aspectRatio: '16/9',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '5rem',
  },
};

// Mock learning content
const categories = [
  { key: 'all', label: 'All Topics', icon: '' },
  { key: 'hair-care', label: 'Hair Care', icon: '' },
  { key: 'styling', label: 'Styling Tips', icon: '' },
  { key: 'color', label: 'Color Knowledge', icon: '' },
  { key: 'model-tips', label: 'Model Tips', icon: '' },
  { key: 'wellness', label: 'Wellness', icon: '' },
];

const learningContent = [
  {
    id: 1,
    title: 'Understanding Your Hair Type',
    category: 'hair-care',
    emoji: '',
    duration: '8 min',
    type: 'Article',
    xp: 50,
    progress: 100,
    completed: true,
  },
  {
    id: 2,
    title: 'How to Prep for a Color Session',
    category: 'color',
    emoji: '',
    duration: '12 min',
    type: 'Video',
    xp: 100,
    progress: 75,
    completed: false,
  },
  {
    id: 3,
    title: 'Being the Perfect Model',
    category: 'model-tips',
    emoji: '',
    duration: '10 min',
    type: 'Article',
    xp: 75,
    progress: 0,
    completed: false,
  },
  {
    id: 4,
    title: 'Hair Masks: When & Why',
    category: 'hair-care',
    emoji: '',
    duration: '6 min',
    type: 'Video',
    xp: 50,
    progress: 100,
    completed: true,
  },
  {
    id: 5,
    title: 'Protecting Color-Treated Hair',
    category: 'color',
    emoji: '',
    duration: '15 min',
    type: 'Guide',
    xp: 125,
    progress: 30,
    completed: false,
  },
  {
    id: 6,
    title: 'Blowout Maintenance 101',
    category: 'styling',
    emoji: '',
    duration: '5 min',
    type: 'Quick Tip',
    xp: 25,
    progress: 100,
    completed: true,
  },
  {
    id: 7,
    title: 'Scalp Health Essentials',
    category: 'wellness',
    emoji: '',
    duration: '10 min',
    type: 'Article',
    xp: 75,
    progress: 0,
    completed: false,
  },
  {
    id: 8,
    title: 'Photo Tips for Hair Models',
    category: 'model-tips',
    emoji: '',
    duration: '8 min',
    type: 'Video',
    xp: 100,
    progress: 50,
    completed: false,
  },
];

export default function ModelLearn() {
  const { user } = useAuthenticator();
  const [activeCategory, setActiveCategory] = useState('all');
  const [modelProfile, setModelProfile] = useState(null);
  const [modelId, setModelId] = useState(null);
  
  useEffect(() => {
    loadModelProfile();
  }, [user]);

  const loadModelProfile = async () => {
    try {
      const { data } = await client.models.ModelProfile.list({
        filter: { userId: { eq: user?.userId || user?.username } },
      });
      if (data && data.length > 0) {
        setModelProfile(data[0]);
        setModelId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading model profile:', error);
    }
  };

  const handleXPUpdate = (xpEarned) => {
    // Update XP in profile or trigger refresh
    if (modelProfile) {
      loadModelProfile();
    }
  };
  
  const filteredContent = activeCategory === 'all'
    ? learningContent
    : learningContent.filter(c => c.category === activeCategory);

  const completedCount = learningContent.filter(c => c.completed).length;
  const totalXpEarned = learningContent.filter(c => c.completed).reduce((sum, c) => sum + c.xp, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Play & Glow</h1>
        <p style={styles.subtitle}>Educational content to help you shine</p>
      </div>

      {/* Daily Question Widget */}
      {modelId && (
        <div style={{ marginBottom: '2rem' }}>
          <DailyQuestionWidget modelId={modelId} onXPUpdate={handleXPUpdate} />
        </div>
      )}

      {/* Progress Banner */}
      <div style={styles.progressBanner}>
        <div style={styles.progressInfo}>
          <div style={styles.progressTitle}>
            Your Learning Progress
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${(completedCount / learningContent.length) * 100}%`,
            }} />
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem' }}>
            {completedCount} of {learningContent.length} lessons completed
          </div>
        </div>
        <div style={styles.progressStats}>
          <div style={styles.progressStat}>
            <div style={styles.progressStatValue}>{completedCount}</div>
            <div style={styles.progressStatLabel}>Completed</div>
          </div>
          <div style={styles.progressStat}>
            <div style={{ ...styles.progressStatValue, color: '#e94560' }}>{totalXpEarned}</div>
            <div style={styles.progressStatLabel}>XP Earned</div>
          </div>
          <div style={styles.progressStat}>
            <div style={{ ...styles.progressStatValue, color: '#ffc107' }}>3</div>
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

      {/* Content Grid */}
      <div style={styles.contentGrid}>
        {filteredContent.map(content => (
          <div
            key={content.id}
            style={styles.contentCard}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#e94560';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <div style={styles.contentImage}>
              <div style={{
                ...styles.contentBadge,
                background: content.completed ? '#4caf50' : 'rgba(233,69,96,0.9)',
                color: '#4A2A1A',
              }}>
                {content.completed ? 'DONE' : content.type}
              </div>
              <div style={styles.contentDuration}>{content.duration}</div>
            </div>
            <div style={styles.contentInfo}>
              <div style={styles.contentTitle}>{content.title}</div>
              <div style={styles.contentMeta}>{content.type}</div>
              {content.progress > 0 && content.progress < 100 && (
                <div style={styles.contentProgress}>
                  <div style={{
                    ...styles.contentProgressFill,
                    width: `${content.progress}%`,
                  }} />
                </div>
              )}
              <div style={styles.contentXp}>
                {content.completed ? `✓ +${content.xp} XP earned` : `+${content.xp} XP`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

