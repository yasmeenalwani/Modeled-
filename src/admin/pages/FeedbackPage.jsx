import React, { useState, useMemo } from 'react';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Two column
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Feedback item
  feedbackItem: {
    padding: '1.25rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    marginBottom: '1rem',
    borderLeft: '3px solid rgba(255,255,255,0.1)',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  feedbackUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  feedbackAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '600',
  },
  feedbackUserInfo: {},
  feedbackName: {
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  feedbackDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  feedbackRating: {
    display: 'flex',
    gap: '0.25rem',
    fontSize: '1.25rem',
  },
  feedbackText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '0.75rem',
  },
  feedbackMeta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  feedbackTag: {
    padding: '0.25rem 0.6rem',
    background: 'rgba(233,69,96,0.2)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#e94560',
  },
  
  // Rating breakdown
  ratingBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  ratingLabel: {
    width: '80px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  ratingBar: {
    flex: 1,
    height: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #ff6b8a)',
    borderRadius: '10px',
  },
  ratingCount: {
    width: '50px',
    textAlign: 'right',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
};

// ============ MOCK DATA ============
const generateFeedbackData = () => {
  const allFeedback = [
    {
      id: 'fb-1',
      type: 'model',
      from: 'Sarah Mitchell',
      fromId: 'pro-1',
      to: 'Emma Johnson',
      toId: 'model-1',
      rating: 5,
      text: 'Emma was absolutely fantastic! She arrived on time, was professional throughout, and her hair was perfect for the balayage. Would definitely book again!',
      bookingId: 'booking-1',
      serviceType: 'Balayage',
      date: new Date(Date.now() - 86400000),
      helpful: 12,
    },
    {
      id: 'fb-2',
      type: 'professional',
      from: 'Emma Johnson',
      fromId: 'model-1',
      to: 'Sarah Mitchell',
      toId: 'pro-1',
      rating: 5,
      text: 'Sarah is an amazing stylist! She made me feel so comfortable and the results were incredible. The salon was clean and professional.',
      bookingId: 'booking-1',
      serviceType: 'Balayage',
      date: new Date(Date.now() - 172800000),
      helpful: 8,
    },
    {
      id: 'fb-3',
      type: 'model',
      from: 'Mike Thompson',
      fromId: 'pro-2',
      to: 'Sophia Lee',
      toId: 'model-2',
      rating: 4,
      text: 'Sophia was great for the blowout practice. Her hair texture was perfect. Only minor issue was she was 10 minutes late, but otherwise excellent.',
      bookingId: 'booking-2',
      serviceType: 'Blowout',
      date: new Date(Date.now() - 259200000),
      helpful: 5,
    },
    {
      id: 'fb-4',
      type: 'professional',
      from: 'Sophia Lee',
      fromId: 'model-2',
      to: 'Mike Thompson',
      toId: 'pro-2',
      rating: 5,
      text: 'Mike is so talented! The blowout was exactly what I wanted. Great communication and very professional.',
      bookingId: 'booking-2',
      serviceType: 'Blowout',
      date: new Date(Date.now() - 345600000),
      helpful: 10,
    },
    {
      id: 'fb-5',
      type: 'model',
      from: 'Lisa Kim',
      fromId: 'pro-3',
      to: 'Olivia Davis',
      toId: 'model-3',
      rating: 5,
      text: 'Perfect model for color correction! Olivia\'s hair was exactly as described and she was very patient during the long process.',
      bookingId: 'booking-3',
      serviceType: 'Color Correction',
      date: new Date(Date.now() - 432000000),
      helpful: 15,
    },
    {
      id: 'fb-6',
      type: 'professional',
      from: 'Olivia Davis',
      fromId: 'model-3',
      to: 'Lisa Kim',
      toId: 'pro-3',
      rating: 5,
      text: 'Lisa saved my hair! The color correction was amazing. I\'m so happy with the results. Highly recommend!',
      bookingId: 'booking-3',
      serviceType: 'Color Correction',
      date: new Date(Date.now() - 518400000),
      helpful: 20,
    },
  ];
  
  // Calculate stats
  const totalFeedback = allFeedback.length;
  const avgRating = (allFeedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1);
  const modelFeedback = allFeedback.filter(f => f.type === 'model');
  const professionalFeedback = allFeedback.filter(f => f.type === 'professional');
  const fiveStarCount = allFeedback.filter(f => f.rating === 5).length;
  
  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: allFeedback.filter(f => f.rating === rating).length,
    percentage: (allFeedback.filter(f => f.rating === rating).length / totalFeedback) * 100,
  }));
  
  return {
    allFeedback,
    modelFeedback,
    professionalFeedback,
    stats: {
      totalFeedback,
      avgRating: parseFloat(avgRating),
      fiveStarCount,
      modelCount: modelFeedback.length,
      professionalCount: professionalFeedback.length,
    },
    ratingDistribution,
  };
};

export default function FeedbackPage() {
  const [filter, setFilter] = useState('all');
  const feedbackData = useMemo(() => generateFeedbackData(), []);
  
  const { allFeedback, modelFeedback, professionalFeedback, stats, ratingDistribution } = feedbackData;
  
  const filteredFeedback = filter === 'all' 
    ? allFeedback 
    : filter === 'models' 
    ? modelFeedback 
    : professionalFeedback;
  
  const sortedFeedback = [...filteredFeedback].sort((a, b) => b.date - a.date);
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Feedback & Reviews 💬</h1>
          <p style={styles.subtitle}>Monitor and manage feedback from models and professionals</p>
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalFeedback}</div>
          <div style={styles.statLabel}>Total Reviews</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>⭐ {stats.avgRating}</div>
          <div style={styles.statLabel}>Average Rating</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.fiveStarCount}</div>
          <div style={styles.statLabel}>5-Star Reviews</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {((stats.fiveStarCount / stats.totalFeedback) * 100).toFixed(0)}%
          </div>
          <div style={styles.statLabel}>5-Star Rate</div>
        </div>
      </div>
      
      {/* Filters */}
      <div style={styles.filters}>
        {[
          { id: 'all', label: 'All Feedback' },
          { id: 'models', label: 'Model Feedback' },
          { id: 'professionals', label: 'Professional Feedback' },
        ].map(f => (
          <button
            key={f.id}
            style={{
              ...styles.filterBtn,
              ...(filter === f.id ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>
      
      {/* Two Column Layout */}
      <div style={styles.twoColumn}>
        {/* Feedback List */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <span>📝</span> Recent Feedback
            </div>
          </div>
          
          <div>
            {sortedFeedback.map(feedback => (
              <div key={feedback.id} style={styles.feedbackItem}>
                <div style={styles.feedbackHeader}>
                  <div style={styles.feedbackUser}>
                    <div style={styles.feedbackAvatar}>
                      {feedback.from.charAt(0)}
                    </div>
                    <div style={styles.feedbackUserInfo}>
                      <div style={styles.feedbackName}>
                        {feedback.from} → {feedback.to}
                      </div>
                      <div style={styles.feedbackDate}>
                        {feedback.date.toLocaleDateString()} • {feedback.serviceType}
                      </div>
                    </div>
                  </div>
                  <div style={styles.feedbackRating}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ color: star <= feedback.rating ? '#ffc107' : 'rgba(255,255,255,0.2)' }}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={styles.feedbackText}>
                  "{feedback.text}"
                </div>
                
                <div style={styles.feedbackMeta}>
                  <span style={styles.feedbackTag}>
                    {feedback.type === 'model' ? 'Model Feedback' : 'Professional Feedback'}
                  </span>
                  <span>👍 {feedback.helpful} helpful</span>
                  <span>Booking #{feedback.bookingId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Rating Breakdown */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>
              <span>📊</span> Rating Distribution
            </div>
          </div>
          
          <div style={styles.ratingBreakdown}>
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} style={styles.ratingRow}>
                <div style={styles.ratingLabel}>
                  <span>{rating}</span>
                  <span>⭐</span>
                </div>
                <div style={styles.ratingBar}>
                  <div 
                    style={{ 
                      ...styles.ratingBarFill, 
                      width: `${percentage}%` 
                    }} 
                  />
                </div>
                <div style={styles.ratingCount}>
                  {count} ({percentage.toFixed(0)}%)
                </div>
              </div>
            ))}
          </div>
          
          {/* Summary Stats */}
          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px' 
          }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <strong>Model Feedback:</strong> {stats.modelCount} reviews
            </div>
            <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <strong>Professional Feedback:</strong> {stats.professionalCount} reviews
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <strong>Response Rate:</strong> {((stats.totalFeedback / (stats.totalFeedback + 5)) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Insights */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            <span>💡</span> Feedback Insights
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(76,175,80,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #4caf50',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#4caf50', fontWeight: '600', marginBottom: '0.5rem' }}>
              ✅ Positive Trends
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              {stats.fiveStarCount} out of {stats.totalFeedback} reviews are 5-star. Excellent satisfaction rate!
            </div>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(102,126,234,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #667eea',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#667eea', fontWeight: '600', marginBottom: '0.5rem' }}>
              📈 Most Common Praise
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              "Professional", "On time", and "Great results" are the most mentioned positive aspects.
            </div>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255,193,7,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #ffc107',
          }}>
            <div style={{ fontSize: '0.85rem', color: '#ffc107', fontWeight: '600', marginBottom: '0.5rem' }}>
              ⚠️ Areas for Improvement
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              Some feedback mentions late arrivals. Consider sending reminder notifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

