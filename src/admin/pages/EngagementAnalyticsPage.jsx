import React, { useState, useEffect, useMemo } from 'react';
import { 
  getEngagementSummary, 
  getUserEngagementMetrics, 
  getFeatureEngagement, 
  getBookingFunnel,
  getStickinessMetrics 
} from '../../utils/analytics';

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
  
  // Time range selector
  timeRangeSelector: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '0.25rem',
    borderRadius: '10px',
  },
  timeRangeBtn: {
    padding: '0.5rem 1.25rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  timeRangeBtnActive: {
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    color: '#fff',
  },
  
  // User type filter
  userTypeFilter: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  userTypeBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  userTypeBtnActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#fff',
  },
  
  // Key metrics grid
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  metricCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  metricIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    opacity: 0.8,
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.5rem',
  },
  
  // Two column layout
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  
  // Cards
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
  cardSubtitle: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '0.25rem',
  },
  
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  td: {
    padding: '0.75rem',
    fontSize: '0.9rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  
  // Feature engagement row
  featureRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto auto auto',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  featureName: {
    fontWeight: '500',
    minWidth: '150px',
  },
  featureStat: {
    textAlign: 'right',
    fontSize: '0.9rem',
    minWidth: '80px',
  },
  completionRate: {
    fontWeight: '600',
    color: '#4caf50',
    minWidth: '80px',
    textAlign: 'right',
  },
  
  // Loading state
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.5)',
  },
  error: {
    background: 'rgba(233,69,96,0.1)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '8px',
    padding: '1rem',
    color: '#e94560',
    marginBottom: '1rem',
  },
};

export default function EngagementAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [engagementSummary, setEngagementSummary] = useState([]);
  const [userMetrics, setUserMetrics] = useState([]);
  const [featureEngagement, setFeatureEngagement] = useState([]);
  const [bookingFunnel, setBookingFunnel] = useState([]);
  const [stickinessMetrics, setStickinessMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

  useEffect(() => {
    loadData();
  }, [timeRange, selectedUserType]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, users, features, funnel, stickiness] = await Promise.all([
        getEngagementSummary(days, selectedUserType || undefined),
        getUserEngagementMetrics(null, selectedUserType || undefined, days),
        getFeatureEngagement(selectedUserType || undefined),
        getBookingFunnel(days, selectedUserType || undefined),
        getStickinessMetrics(days, selectedUserType || undefined),
      ]);
      setEngagementSummary(summary || []);
      setUserMetrics(users || []);
      setFeatureEngagement(features || []);
      setBookingFunnel(funnel || []);
      setStickinessMetrics(stickiness || []);
    } catch (err) {
      console.error('Error loading engagement analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    const summary = engagementSummary.reduce((acc, day) => ({
      activeUsers: acc.activeUsers + (parseInt(day.active_users) || 0),
      totalSessions: acc.totalSessions + (parseInt(day.total_sessions) || 0),
      gamesStarted: acc.gamesStarted + (parseInt(day.games_started) || 0),
      gamesCompleted: acc.gamesCompleted + (parseInt(day.games_completed) || 0),
      quizzesCompleted: acc.quizzesCompleted + (parseInt(day.quizzes_completed) || 0),
      bookingIntents: acc.bookingIntents + (parseInt(day.booking_intents) || 0),
      bookingsConfirmed: acc.bookingsConfirmed + (parseInt(day.bookings_confirmed) || 0),
      totalDuration: acc.totalDuration + (parseFloat(day.avg_session_duration) || 0),
      count: acc.count + 1,
    }), { activeUsers: 0, totalSessions: 0, gamesStarted: 0, gamesCompleted: 0, quizzesCompleted: 0, bookingIntents: 0, bookingsConfirmed: 0, totalDuration: 0, count: 0 });

    return {
      activeUsers: summary.activeUsers,
      totalSessions: summary.totalSessions,
      avgSessionsPerUser: summary.activeUsers > 0 ? (summary.totalSessions / summary.activeUsers).toFixed(1) : 0,
      avgSessionDuration: summary.count > 0 ? Math.round(summary.totalDuration / summary.count) : 0,
      gamesStarted: summary.gamesStarted,
      gamesCompleted: summary.gamesCompleted,
      gameCompletionRate: summary.gamesStarted > 0 ? ((summary.gamesCompleted / summary.gamesStarted) * 100).toFixed(1) : 0,
      quizzesCompleted: summary.quizzesCompleted,
      bookingIntents: summary.bookingIntents,
      bookingsConfirmed: summary.bookingsConfirmed,
      bookingConversionRate: summary.bookingIntents > 0 ? ((summary.bookingsConfirmed / summary.bookingIntents) * 100).toFixed(1) : 0,
    };
  }, [engagementSummary]);

  // Calculate stickiness
  const stickiness = useMemo(() => {
    if (!stickinessMetrics || stickinessMetrics.length === 0) {
      return { avgSessionsPerUser: 0, avgDaysActive: 0, engagementRate: 0 };
    }
    
    const totals = stickinessMetrics.reduce((acc, metric) => ({
      totalUsers: acc.totalUsers + (parseInt(metric.total_users) || 0),
      totalSessions: acc.totalSessions + (parseInt(metric.total_sessions) || 0),
      totalSessionsPerUser: acc.totalSessionsPerUser + (parseFloat(metric.avg_sessions_per_user) || 0),
      totalDaysActive: acc.totalDaysActive + (parseFloat(metric.avg_days_active) || 0),
      engagedUsers: acc.engagedUsers + (parseInt(metric.engaged_users) || 0),
      count: acc.count + 1,
    }), { totalUsers: 0, totalSessions: 0, totalSessionsPerUser: 0, totalDaysActive: 0, engagedUsers: 0, count: 0 });

    return {
      avgSessionsPerUser: totals.count > 0 ? (totals.totalSessionsPerUser / totals.count).toFixed(1) : 0,
      avgDaysActive: totals.count > 0 ? (totals.totalDaysActive / totals.count).toFixed(1) : 0,
      engagementRate: totals.totalUsers > 0 ? ((totals.engagedUsers / totals.totalUsers) * 100).toFixed(1) : 0,
    };
  }, [stickinessMetrics]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading engagement analytics...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Engagement Analytics 📊</h1>
          <p style={styles.subtitle}>Track post-activation user behavior, feature usage, and booking patterns</p>
        </div>
        
        {/* Time Range Selector */}
        <div style={styles.timeRangeSelector}>
          {['7d', '30d', '90d'].map(range => (
            <button
              key={range}
              style={{
                ...styles.timeRangeBtn,
                ...(timeRange === range ? styles.timeRangeBtnActive : {}),
              }}
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* User Type Filter */}
      <div style={styles.userTypeFilter}>
        <button
          style={{
            ...styles.userTypeBtn,
            ...(selectedUserType === null ? styles.userTypeBtnActive : {}),
          }}
          onClick={() => setSelectedUserType(null)}
        >
          All Types
        </button>
        {['Model', 'Professional', 'Partner'].map(type => (
          <button
            key={type}
            style={{
              ...styles.userTypeBtn,
              ...(selectedUserType === type ? styles.userTypeBtnActive : {}),
            }}
            onClick={() => setSelectedUserType(type)}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Key Metrics - Use & Stickiness */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>👥</div>
          <div style={styles.metricValue}>{overallMetrics.activeUsers}</div>
          <div style={styles.metricLabel}>Active Users</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📱</div>
          <div style={styles.metricValue}>{overallMetrics.totalSessions}</div>
          <div style={styles.metricLabel}>Total Sessions</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            {overallMetrics.avgSessionsPerUser} per user
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>⏱️</div>
          <div style={styles.metricValue}>
            {overallMetrics.avgSessionDuration > 60 
              ? `${Math.floor(overallMetrics.avgSessionDuration / 60)}m`
              : `${overallMetrics.avgSessionDuration}s`}
          </div>
          <div style={styles.metricLabel}>Avg Session Duration</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📈</div>
          <div style={styles.metricValue}>{stickiness.engagementRate}%</div>
          <div style={styles.metricLabel}>Engagement Rate</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            {stickiness.avgDaysActive} days active avg
          </div>
        </div>
      </div>

      {/* Two Column: Feature Engagement & Booking Funnel */}
      <div style={styles.twoColumn}>
        {/* Feature Engagement */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>🎮</span> Feature Engagement
              </div>
              <div style={styles.cardSubtitle}>
                Games, quizzes, and learning module usage
              </div>
            </div>
          </div>
          
          {featureEngagement && featureEngagement.length > 0 ? (
            <div>
              {featureEngagement
                .filter(f => !selectedUserType || f.user_type === selectedUserType)
                .slice(0, 10)
                .map((feature, i) => {
                  const starts = parseInt(feature.starts) || 0;
                  const completions = parseInt(feature.completions) || 0;
                  const completionRate = parseFloat(feature.completion_rate) || 0;
                  
                  return (
                    <div key={i} style={styles.featureRow}>
                      <div style={styles.featureName}>
                        <div style={{ fontWeight: '500' }}>{feature.feature_name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                          {feature.feature_type}
                        </div>
                      </div>
                      <div style={styles.featureStat}>
                        <div>{feature.unique_users}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>users</div>
                      </div>
                      <div style={styles.featureStat}>
                        <div>{starts}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>started</div>
                      </div>
                      <div style={styles.featureStat}>
                        <div>{completions}</div>
                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>completed</div>
                      </div>
                      <div style={styles.completionRate}>
                        {completionRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No feature engagement data available
            </div>
          )}
        </div>
        
        {/* Booking Funnel */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📅</span> Booking Funnel
              </div>
              <div style={styles.cardSubtitle}>
                Profile views → Intent → Booking conversion
              </div>
            </div>
          </div>
          
          {bookingFunnel && bookingFunnel.length > 0 ? (
            (() => {
              const latest = bookingFunnel
                .filter(f => !selectedUserType || f.user_type === selectedUserType)
                .reduce((acc, day) => ({
                  profileViews: acc.profileViews + (parseInt(day.profile_views) || 0),
                  bookingIntents: acc.bookingIntents + (parseInt(day.booking_intents) || 0),
                  bookingsConfirmed: acc.bookingsConfirmed + (parseInt(day.bookings_confirmed) || 0),
                  waitlistJoins: acc.waitlistJoins + (parseInt(day.waitlist_joins) || 0),
                  waitlistConversions: acc.waitlistConversions + (parseInt(day.waitlist_conversions) || 0),
                }), { profileViews: 0, bookingIntents: 0, bookingsConfirmed: 0, waitlistJoins: 0, waitlistConversions: 0 });
              
              const maxValue = latest.profileViews || 1;
              
              return (
                <div>
                  <div style={{ ...styles.featureRow, gridTemplateColumns: '1fr auto' }}>
                    <div style={styles.featureName}>Profile Views</div>
                    <div style={styles.featureStat}>{latest.profileViews}</div>
                  </div>
                  <div style={{ ...styles.featureRow, gridTemplateColumns: '1fr auto' }}>
                    <div style={styles.featureName}>Booking Intents</div>
                    <div style={styles.featureStat}>
                      {latest.bookingIntents} 
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                        ({latest.profileViews > 0 ? ((latest.bookingIntents / latest.profileViews) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ ...styles.featureRow, gridTemplateColumns: '1fr auto' }}>
                    <div style={styles.featureName}>Bookings Confirmed</div>
                    <div style={styles.featureStat}>
                      <span style={{ color: '#4caf50', fontWeight: '600' }}>{latest.bookingsConfirmed}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                        ({latest.bookingIntents > 0 ? ((latest.bookingsConfirmed / latest.bookingIntents) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div style={{ ...styles.featureRow, gridTemplateColumns: '1fr auto' }}>
                    <div style={styles.featureName}>Waitlist Joins</div>
                    <div style={styles.featureStat}>{latest.waitlistJoins}</div>
                  </div>
                  <div style={{ ...styles.featureRow, gridTemplateColumns: '1fr auto' }}>
                    <div style={styles.featureName}>Waitlist → Booking</div>
                    <div style={styles.featureStat}>
                      <span style={{ color: '#4caf50' }}>{latest.waitlistConversions}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: '0.5rem' }}>
                        ({latest.waitlistJoins > 0 ? ((latest.waitlistConversions / latest.waitlistJoins) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No booking funnel data available
            </div>
          )}
        </div>
      </div>

      {/* Feature Engagement Metrics */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <span>🎯</span> Feature Engagement Summary
            </div>
            <div style={styles.cardSubtitle}>
              Overall games, quizzes, and learning module metrics
            </div>
          </div>
        </div>
        
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>🎮</div>
            <div style={styles.metricValue}>{overallMetrics.gamesStarted}</div>
            <div style={styles.metricLabel}>Games Started</div>
          </div>
          
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>✅</div>
            <div style={styles.metricValue}>{overallMetrics.gamesCompleted}</div>
            <div style={styles.metricLabel}>Games Completed</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
              {overallMetrics.gameCompletionRate}% completion rate
            </div>
          </div>
          
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>📝</div>
            <div style={styles.metricValue}>{overallMetrics.quizzesCompleted}</div>
            <div style={styles.metricLabel}>Quizzes Completed</div>
          </div>
          
          <div style={styles.metricCard}>
            <div style={styles.metricIcon}>💡</div>
            <div style={styles.metricValue}>
              {overallMetrics.bookingIntents}
            </div>
            <div style={styles.metricLabel}>Booking Intents</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
              {overallMetrics.bookingConversionRate}% conversion
            </div>
          </div>
        </div>
      </div>

      {/* Top Engaged Users */}
      {userMetrics && userMetrics.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>⭐</span> Top Engaged Users
              </div>
              <div style={styles.cardSubtitle}>
                Users with highest engagement metrics
              </div>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User Type</th>
                <th style={styles.th}>Days Active</th>
                <th style={styles.th}>Sessions</th>
                <th style={styles.th}>Games</th>
                <th style={styles.th}>Quizzes</th>
                <th style={styles.th}>Booking Intents</th>
                <th style={styles.th}>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {userMetrics.slice(0, 20).map((user, i) => (
                <tr key={i}>
                  <td style={styles.td}>{user.user_type}</td>
                  <td style={styles.td}>
                    <strong>{user.days_active}</strong>
                  </td>
                  <td style={styles.td}>{user.total_sessions}</td>
                  <td style={styles.td}>
                    {user.games_completed}/{user.games_started}
                  </td>
                  <td style={styles.td}>{user.quizzes_completed}</td>
                  <td style={styles.td}>{user.booking_intents}</td>
                  <td style={styles.td}>
                    {user.last_active_at 
                      ? new Date(user.last_active_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

