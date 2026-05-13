import React from 'react';
import {
  overallRating,
  totalReviews,
  ratingBreakdown,
  serviceBreakdown,
  recentFeedback,
  improvementTips,
} from '../data/feedbackData';

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
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  note: {
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '10px',
    padding: '1rem 1.5rem',
    marginTop: '1rem',
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Overall rating
  overallRating: {
    background: 'linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))',
    border: '1px solid rgba(255,193,7,0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  ratingValue: {
    fontSize: '5rem',
    fontWeight: '700',
    color: '#ffc107',
    lineHeight: 1,
    fontFamily: '"Alike", "Georgia", serif',
  },
  ratingStars: {
    fontSize: '2rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
  },
  ratingLabel: {
    fontSize: '1.1rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  ratingCount: {
    fontSize: '0.9rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.5rem',
  },
  
  // Rating breakdown
  breakdownSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  breakdownCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  breakdownTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  breakdownLabel: {
    width: '140px',
    fontSize: '0.9rem',
  },
  breakdownBar: {
    flex: 1,
    height: '10px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '5px',
    overflow: 'hidden',
    marginRight: '1rem',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '5px',
    background: '#ffc107',
  },
  breakdownValue: {
    width: '40px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#ffc107',
  },
  
  // Recent feedback
  recentSection: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  feedbackItem: {
    padding: '1.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
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
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  feedbackStars: {
    color: '#ffc107',
  },
  feedbackText: {
    fontSize: '0.9rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.6,
    fontStyle: 'italic',
  },
  feedbackAnon: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.75rem',
  },
  
  // Improvement tips
  tipsCard: {
    background: 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.05))',
    border: '1px solid rgba(76,175,80,0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  tipsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tipItem: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  },
};


export default function PortalFeedback() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Feedback & Ratings</h1>
        <p style={styles.subtitle}>See how models rate their experience with you</p>
        <div style={styles.note}>
          <span>🔒</span>
          All feedback is anonymized and aggregated to protect model privacy
        </div>
      </div>

      {/* Overall Rating */}
      <div style={styles.overallRating}>
        <div style={styles.ratingValue}>{overallRating}</div>
        <div style={styles.ratingStars}>
          {'★'.repeat(5)}
        </div>
        <div style={styles.ratingLabel}>Your Overall Rating</div>
        <div style={styles.ratingCount}>Based on {totalReviews} reviews</div>
      </div>

      {/* Rating Breakdown */}
      <div style={styles.breakdownSection}>
        {/* By Category */}
        <div style={styles.breakdownCard}>
          <div style={styles.breakdownTitle}>
            <span>📊</span> Rating by Category
          </div>
          {Object.entries(ratingBreakdown).map(([label, value]) => (
            <div key={label} style={styles.breakdownItem}>
              <div style={styles.breakdownLabel}>{label}</div>
              <div style={styles.breakdownBar}>
                <div style={{
                  ...styles.breakdownFill,
                  width: `${(value / 5) * 100}%`,
                }} />
              </div>
              <div style={styles.breakdownValue}>{value}</div>
            </div>
          ))}
        </div>

        {/* By Service */}
        <div style={styles.breakdownCard}>
          <div style={styles.breakdownTitle}>
            <span>💇</span> Rating by Service
          </div>
          {Object.entries(serviceBreakdown).map(([label, data]) => (
            <div key={label} style={styles.breakdownItem}>
              <div style={styles.breakdownLabel}>
                {label}
                <div style={{ fontSize: '0.75rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                  {data.count} reviews
                </div>
              </div>
              <div style={styles.breakdownBar}>
                <div style={{
                  ...styles.breakdownFill,
                  width: `${(data.rating / 5) * 100}%`,
                }} />
              </div>
              <div style={styles.breakdownValue}>{data.rating}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Feedback */}
      <div style={styles.recentSection}>
        <div style={styles.sectionTitle}>
          <span>💬</span> Recent Feedback
        </div>
        
        {recentFeedback.map(feedback => (
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
            <div style={styles.feedbackAnon}>— Anonymous Model</div>
          </div>
        ))}
      </div>

      {/* Improvement Tips */}
      <div style={styles.tipsCard}>
        <div style={styles.tipsTitle}>
          <span>🎯</span> Tips to Improve Your Rating
        </div>
        {improvementTips.map((tip, i) => (
          <div key={i} style={styles.tipItem}>
            {tip}
          </div>
        ))}
      </div>
    </div>
  );
}

