import React, { useState, useEffect, useMemo } from 'react';
import { getOnboardingFunnel, getOnboardingDropoff, getOnboardingStats } from '../../utils/analytics';

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
  metricChange: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
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
  
  // Funnel visualization
  funnel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  funnelStep: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    position: 'relative',
  },
  funnelStepBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, rgba(233,69,96,0.3), rgba(233,69,96,0.1))',
    borderRadius: '8px',
    transition: 'width 0.3s ease',
  },
  funnelStepContent: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  funnelStepLabel: {
    fontWeight: '500',
    fontSize: '0.9rem',
  },
  funnelStepValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#e94560',
  },
  funnelStepPercent: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginLeft: '0.5rem',
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
  
  // Dropoff visualization
  dropoffRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto auto',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  dropoffStepName: {
    fontWeight: '500',
    minWidth: '120px',
  },
  dropoffBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
  },
  dropoffBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #ff6b8a)',
    transition: 'width 0.3s ease',
  },
  dropoffStat: {
    textAlign: 'right',
    fontSize: '0.9rem',
    minWidth: '80px',
  },
  dropoffRate: {
    fontWeight: '600',
    color: '#e94560',
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

export default function OnboardingAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [funnelData, setFunnelData] = useState([]);
  const [dropoffData, setDropoffData] = useState([]);
  const [statsData, setStatsData] = useState([]);
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
      const [funnel, dropoff, stats] = await Promise.all([
        getOnboardingFunnel(days, selectedUserType || undefined),
        getOnboardingDropoff(selectedUserType || undefined),
        getOnboardingStats(days),
      ]);
      setFunnelData(funnel || []);
      setDropoffData(dropoff || []);
      setStatsData(stats || []);
    } catch (err) {
      console.error('Error loading onboarding analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    if (!statsData || statsData.length === 0) {
      return {
        totalClicks: 0,
        totalStarts: 0,
        totalCompletions: 0,
        overallCompletionRate: 0,
        overallStartRate: 0,
      };
    }

    const totals = statsData.reduce((acc, stat) => ({
      totalClicks: acc.totalClicks + (parseInt(stat.total_signup_clicks) || 0),
      totalStarts: acc.totalStarts + (parseInt(stat.total_signup_starts) || 0),
      totalCompletions: acc.totalCompletions + (parseInt(stat.total_completions) || 0),
    }), { totalClicks: 0, totalStarts: 0, totalCompletions: 0 });

    return {
      ...totals,
      overallCompletionRate: totals.totalClicks > 0 
        ? ((totals.totalCompletions / totals.totalClicks) * 100).toFixed(1)
        : 0,
      overallStartRate: totals.totalClicks > 0
        ? ((totals.totalStarts / totals.totalClicks) * 100).toFixed(1)
        : 0,
    };
  }, [statsData]);

  // Filter funnel data by user type if selected
  const filteredFunnelData = useMemo(() => {
    if (!selectedUserType) return funnelData;
    return funnelData.filter(d => d.user_type === selectedUserType);
  }, [funnelData, selectedUserType]);

  // Get latest funnel data for visualization
  const latestFunnel = useMemo(() => {
    if (!filteredFunnelData || filteredFunnelData.length === 0) return null;
    
    // Aggregate across all dates
    return filteredFunnelData.reduce((acc, day) => ({
      signups_clicked: acc.signups_clicked + (parseInt(day.signups_clicked) || 0),
      signups_started: acc.signups_started + (parseInt(day.signups_started) || 0),
      onboarding_completed: acc.onboarding_completed + (parseInt(day.onboarding_completed) || 0),
      onboarding_abandoned: acc.onboarding_abandoned + (parseInt(day.onboarding_abandoned) || 0),
    }), { signups_clicked: 0, signups_started: 0, onboarding_completed: 0, onboarding_abandoned: 0 });
  }, [filteredFunnelData]);

  // Calculate max value for funnel visualization
  const maxFunnelValue = latestFunnel ? latestFunnel.signups_clicked : 1;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading onboarding analytics...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Onboarding Analytics 📊</h1>
          <p style={styles.subtitle}>Track sign-up funnels, completion rates, and drop-off points</p>
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

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>👆</div>
          <div style={styles.metricValue}>{overallMetrics.totalClicks}</div>
          <div style={styles.metricLabel}>Sign-Up Clicks</div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>🚀</div>
          <div style={styles.metricValue}>{overallMetrics.totalStarts}</div>
          <div style={styles.metricLabel}>Onboarding Started</div>
          <div style={styles.metricChange}>
            {overallMetrics.overallStartRate}% start rate
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>✅</div>
          <div style={styles.metricValue}>{overallMetrics.totalCompletions}</div>
          <div style={styles.metricLabel}>Completed Onboarding</div>
          <div style={styles.metricChange}>
            {overallMetrics.overallCompletionRate}% completion rate
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📉</div>
          <div style={styles.metricValue}>
            {overallMetrics.totalClicks > 0 
              ? (100 - parseFloat(overallMetrics.overallCompletionRate)).toFixed(1)
              : 0}%
          </div>
          <div style={styles.metricLabel}>Drop-Off Rate</div>
        </div>
      </div>

      {/* Two Column: Funnel & Dropoff Analysis */}
      <div style={styles.twoColumn}>
        {/* Onboarding Funnel */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>🔄</span> Onboarding Funnel
              </div>
              <div style={styles.cardSubtitle}>
                {selectedUserType || 'All'} sign-up flow conversion
              </div>
            </div>
          </div>
          
          {latestFunnel ? (
            <div style={styles.funnel}>
              <div style={styles.funnelStep}>
                <div style={{
                  ...styles.funnelStepBar,
                  width: '100%',
                }}></div>
                <div style={styles.funnelStepContent}>
                  <div style={styles.funnelStepLabel}>Sign-Up Clicked</div>
                  <div>
                    <span style={styles.funnelStepValue}>{latestFunnel.signups_clicked}</span>
                    <span style={styles.funnelStepPercent}>100%</span>
                  </div>
                </div>
              </div>
              
              <div style={styles.funnelStep}>
                <div style={{
                  ...styles.funnelStepBar,
                  width: `${(latestFunnel.signups_started / maxFunnelValue) * 100}%`,
                }}></div>
                <div style={styles.funnelStepContent}>
                  <div style={styles.funnelStepLabel}>Onboarding Started</div>
                  <div>
                    <span style={styles.funnelStepValue}>{latestFunnel.signups_started}</span>
                    <span style={styles.funnelStepPercent}>
                      {maxFunnelValue > 0 
                        ? ((latestFunnel.signups_started / maxFunnelValue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={styles.funnelStep}>
                <div style={{
                  ...styles.funnelStepBar,
                  width: `${(latestFunnel.onboarding_completed / maxFunnelValue) * 100}%`,
                }}></div>
                <div style={styles.funnelStepContent}>
                  <div style={styles.funnelStepLabel}>Completed</div>
                  <div>
                    <span style={styles.funnelStepValue}>{latestFunnel.onboarding_completed}</span>
                    <span style={styles.funnelStepPercent}>
                      {maxFunnelValue > 0
                        ? ((latestFunnel.onboarding_completed / maxFunnelValue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={styles.funnelStep}>
                <div style={{
                  ...styles.funnelStepBar,
                  width: `${(latestFunnel.onboarding_abandoned / maxFunnelValue) * 100}%`,
                }}></div>
                <div style={styles.funnelStepContent}>
                  <div style={styles.funnelStepLabel}>Abandoned</div>
                  <div>
                    <span style={styles.funnelStepValue}>{latestFunnel.onboarding_abandoned}</span>
                    <span style={styles.funnelStepPercent}>
                      {maxFunnelValue > 0
                        ? ((latestFunnel.onboarding_abandoned / maxFunnelValue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No funnel data available
            </div>
          )}
        </div>
        
        {/* Dropoff Analysis */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📉</span> Step Drop-Off Analysis
              </div>
              <div style={styles.cardSubtitle}>
                Where users abandon the onboarding process
              </div>
            </div>
          </div>
          
          {dropoffData && dropoffData.length > 0 ? (
            <div>
              {dropoffData
                .filter(d => !selectedUserType || d.user_type === selectedUserType)
                .map((step, i) => {
                  const total = (parseInt(step.completed) || 0) + (parseInt(step.abandoned) || 0);
                  const dropoffRate = parseFloat(step.dropoff_rate) || 0;
                  
                  return (
                    <div key={i} style={styles.dropoffRow}>
                      <div style={styles.dropoffStepName}>
                        {step.step_name || `Step ${step.step_number}`}
                      </div>
                      <div style={styles.dropoffBar}>
                        <div style={{
                          ...styles.dropoffBarFill,
                          width: `${dropoffRate}%`,
                        }}></div>
                      </div>
                      <div style={styles.dropoffStat}>
                        {step.completed} completed
                      </div>
                      <div style={styles.dropoffStat}>
                        {step.abandoned} abandoned
                      </div>
                      <div style={styles.dropoffRate}>
                        {dropoffRate.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
              No drop-off data available
            </div>
          )}
        </div>
      </div>

      {/* Stats by User Type */}
      {statsData && statsData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📊</span> Stats by User Type
              </div>
              <div style={styles.cardSubtitle}>
                Breakdown of onboarding metrics by user type
              </div>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User Type</th>
                <th style={styles.th}>Sign-Up Clicks</th>
                <th style={styles.th}>Started</th>
                <th style={styles.th}>Completed</th>
                <th style={styles.th}>Abandoned</th>
                <th style={styles.th}>Start Rate</th>
                <th style={styles.th}>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {statsData.map((stat, i) => {
                const clicks = parseInt(stat.total_signup_clicks) || 0;
                const starts = parseInt(stat.total_signup_starts) || 0;
                const completions = parseInt(stat.total_completions) || 0;
                const abandonments = parseInt(stat.total_abandonments) || 0;
                const startRate = clicks > 0 ? ((starts / clicks) * 100).toFixed(1) : 0;
                const completionRate = parseFloat(stat.overall_completion_rate) || 0;
                
                return (
                  <tr key={i}>
                    <td style={styles.td}>
                      <strong>{stat.user_type}</strong>
                    </td>
                    <td style={styles.td}>{clicks}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#4caf50' }}>{starts}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#e94560' }}>{completions}</span>
                    </td>
                    <td style={styles.td}>{abandonments}</td>
                    <td style={styles.td}>
                      <span style={{ color: '#667eea' }}>{startRate}%</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#e94560' }}>
                        {completionRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Daily Funnel Trends */}
      {filteredFunnelData && filteredFunnelData.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📈</span> Daily Funnel Trends
              </div>
              <div style={styles.cardSubtitle}>
                Daily breakdown of sign-up funnel metrics
              </div>
            </div>
          </div>
          
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>User Type</th>
                <th style={styles.th}>Clicks</th>
                <th style={styles.th}>Started</th>
                <th style={styles.th}>Completed</th>
                <th style={styles.th}>Abandoned</th>
                <th style={styles.th}>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredFunnelData.slice(0, 14).map((day, i) => {
                const clicks = parseInt(day.signups_clicked) || 0;
                const started = parseInt(day.signups_started) || 0;
                const completed = parseInt(day.onboarding_completed) || 0;
                const abandoned = parseInt(day.onboarding_abandoned) || 0;
                const completionRate = parseFloat(day.completion_rate) || 0;
                
                return (
                  <tr key={i}>
                    <td style={styles.td}>
                      {new Date(day.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td style={styles.td}>{day.user_type}</td>
                    <td style={styles.td}>{clicks}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#4caf50' }}>{started}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#e94560' }}>{completed}</span>
                    </td>
                    <td style={styles.td}>{abandoned}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '500' }}>{completionRate.toFixed(1)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

