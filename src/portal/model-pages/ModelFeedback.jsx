import React from 'react';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
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
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
  
  // Your rating card
  ratingCard: {
    background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,193,7,0.05))',
    border: '1px solid rgba(255,193,7,0.3)',
    borderRadius: '24px',
    padding: '2.5rem',
    marginBottom: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '2rem',
    textAlign: 'center',
  },
  ratingMain: {},
  ratingValue: {
    fontSize: '4rem',
    fontWeight: '700',
    color: '#ffc107',
    lineHeight: 1,
  },
  ratingStars: {
    fontSize: '1.5rem',
    marginTop: '0.5rem',
  },
  ratingLabel: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '0.5rem',
  },
  ratingStat: {},
  ratingStatValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  ratingStatLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // What pros say
  prosSaySection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  prosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  prosCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  prosIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  prosTitle: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  prosCount: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Feedback given
  feedbackSection: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  feedbackItem: {
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  feedbackService: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  feedbackDate: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
  },
  feedbackStars: {
    color: '#ffc107',
    fontSize: '1.1rem',
  },
  feedbackText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.6,
    fontStyle: 'italic',
    marginBottom: '0.75rem',
  },
  feedbackPro: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Badges earned
  badgesSection: {
    marginTop: '2rem',
  },
  badgesGrid: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  badgeItem: {
    width: '80px',
    textAlign: 'center',
  },
  badgeIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    margin: '0 auto 0.5rem',
  },
  badgeTitle: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
  },
  
  // Pending feedback
  pendingCard: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(255,107,138,0.1))',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  pendingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  pendingTitle: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pendingBtn: {
    padding: '0.5rem 1.25rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// Mock data
const yourRating = 4.9;
const totalFeedback = 12;
const reliabilityScore = 98;

const prosComments = [
  { icon: '', title: 'Great Hair!', count: 8 },
  { icon: '', title: 'Always On Time', count: 11 },
  { icon: '', title: 'So Friendly', count: 10 },
  { icon: '', title: 'Great Communication', count: 9 },
  { icon: '', title: 'Perfect Model', count: 7 },
  { icon: '', title: 'Would Rebook', count: 11 },
];

const feedbackGiven = [
  {
    id: 1,
    service: 'Balayage',
    icon: '',
    pro: 'Sarah M.',
    date: 'Dec 2, 2024',
    rating: 5,
    comment: 'Sarah was amazing! She took her time and made sure I loved every step. My hair has never looked better!',
  },
  {
    id: 2,
    service: 'Blowout',
    icon: '',
    pro: 'Jessica K.',
    date: 'Nov 28, 2024',
    rating: 5,
    comment: 'Super fast and the volume was incredible. Jessica really knows what she\'s doing!',
  },
  {
    id: 3,
    service: 'Haircut',
    icon: '',
    pro: 'Amanda L.',
    date: 'Nov 20, 2024',
    rating: 4,
    comment: 'Great cut, very precise. Took a bit longer than expected but worth it for the result.',
  },
];

const badges = [
  { icon: '', title: 'First Review', bg: 'rgba(255,193,7,0.2)', unlocked: true },
  { icon: '', title: '5 Reviews', bg: 'rgba(102,126,234,0.2)', unlocked: true },
  { icon: '', title: 'All 5 Stars', bg: 'rgba(233,69,96,0.2)', unlocked: true },
  { icon: '', title: 'Detailed Reviewer', bg: 'rgba(76,175,80,0.2)', unlocked: true },
  { icon: '', title: 'Top Reviewer', bg: 'rgba(255,107,138,0.2)', unlocked: false },
];

export default function ModelFeedback() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Feedback</h1>
        <p style={styles.subtitle}>See what pros think of you & rate your experiences</p>
      </div>

      {/* Pending Feedback */}
      <div style={styles.pendingCard}>
        <div style={styles.pendingHeader}>
          <div style={styles.pendingTitle}>
            You have 1 pending review
          </div>
          <button style={styles.pendingBtn}>Leave Feedback</button>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
          Blowout with Jessica K. on Dec 4 • Help her grow by sharing your experience!
        </div>
      </div>

      {/* Your Rating */}
      <div style={styles.ratingCard}>
        <div style={styles.ratingMain}>
          <div style={styles.ratingValue}>{yourRating}</div>
          <div style={styles.ratingStars}>{'★'.repeat(5)}</div>
          <div style={styles.ratingLabel}>Your Model Rating</div>
        </div>
        <div style={styles.ratingStat}>
          <div style={{ ...styles.ratingStatValue, color: '#4caf50' }}>{reliabilityScore}%</div>
          <div style={styles.ratingStatLabel}>Reliability Score</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
            Shows up on time, every time
          </div>
        </div>
        <div style={styles.ratingStat}>
          <div style={{ ...styles.ratingStatValue, color: '#667eea' }}>{totalFeedback}</div>
          <div style={styles.ratingStatLabel}>Reviews Received</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
            From happy professionals
          </div>
        </div>
      </div>

      {/* What Pros Say */}
      <div style={styles.prosSaySection}>
        <div style={styles.sectionTitle}>
          What Pros Say About You
        </div>
        <div style={styles.prosGrid}>
          {prosComments.map((item, i) => (
            <div key={i} style={styles.prosCard}>
              <div style={styles.prosIcon}>{item.icon}</div>
              <div style={styles.prosTitle}>{item.title}</div>
              <div style={styles.prosCount}>{item.count} times mentioned</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Earned */}
      <div style={styles.badgesSection}>
        <div style={styles.sectionTitle}>
          Feedback Badges Earned
        </div>
        <div style={styles.badgesGrid}>
          {badges.map((badge, i) => (
            <div 
              key={i} 
              style={{
                ...styles.badgeItem,
                opacity: badge.unlocked ? 1 : 0.4,
              }}
            >
              <div style={{
                ...styles.badgeIcon,
                background: badge.unlocked ? badge.bg : 'rgba(255,255,255,0.05)',
              }}>
                {badge.unlocked ? badge.icon : ''}
              </div>
              <div style={styles.badgeTitle}>{badge.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback You've Given */}
      <div style={{ ...styles.feedbackSection, marginTop: '2rem' }}>
        <div style={styles.sectionTitle}>
          Feedback You've Given
        </div>
        {feedbackGiven.map(feedback => (
          <div key={feedback.id} style={styles.feedbackItem}>
            <div style={styles.feedbackHeader}>
              <div>
                <div style={styles.feedbackService}>
                  <span>{feedback.icon}</span>
                  {feedback.service}
                </div>
                <div style={styles.feedbackDate}>{feedback.date}</div>
              </div>
              <div style={styles.feedbackStars}>
                {'★'.repeat(feedback.rating)}
                {'☆'.repeat(5 - feedback.rating)}
              </div>
            </div>
            <div style={styles.feedbackText}>"{feedback.comment}"</div>
            <div style={styles.feedbackPro}>For: {feedback.pro}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

