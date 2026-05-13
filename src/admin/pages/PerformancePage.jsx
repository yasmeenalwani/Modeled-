import React, { useState, useMemo } from 'react';
import { mockModels } from '../../matching';

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
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    color: '#e94560',
    borderBottomColor: '#e94560',
  },
  
  // Stats grid
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
  },
  statIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  statChange: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  statChangePositive: {
    color: '#4caf50',
  },
  statChangeNegative: {
    color: '#e94560',
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
  
  // Performance row
  perfRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  perfAvatar: {
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
  perfInfo: {
    flex: 1,
  },
  perfName: {
    fontWeight: '500',
    marginBottom: '0.25rem',
  },
  perfLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  perfScore: {
    fontSize: '1.25rem',
    fontWeight: '700',
    textAlign: 'right',
  },
  perfBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  perfBarFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #ff6b8a)',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  
  // Score badge
  scoreBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  scoreExcellent: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  scoreGood: {
    background: 'rgba(139,195,74,0.2)',
    color: '#8bc34a',
  },
  scoreAverage: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  scorePoor: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
};

// ============ MOCK DATA ============
const generatePerformanceData = () => {
  // Model Performance
  const modelPerformance = mockModels.map(model => {
    const avgScore = Math.round(
      Object.values(model.agenticScores || {}).reduce((a, b) => a + b, 0) / 
      (Object.keys(model.agenticScores || {}).length || 1)
    );
    return {
      id: model.id,
      name: `${model.firstName} ${model.lastName}`,
      email: model.email,
      avgScore,
      reliability: model.agenticScores?.reliability || 0,
      feedback: model.agenticScores?.feedback || 0,
      experience: model.agenticScores?.experience || 0,
      engagement: model.agenticScores?.engagement || 0,
      compatibility: model.agenticScores?.compatibility || 0,
      bookings: model.totalBookings || 0,
      completionRate: Math.round((Math.random() * 20 + 80)), // 80-100%
      responseTime: Math.round(Math.random() * 60 + 15), // 15-75 minutes
    };
  }).sort((a, b) => b.avgScore - a.avgScore);
  
  // Professional Performance
  const professionalPerformance = [
    { id: 'pro-1', name: 'Sarah Mitchell', bookings: 45, completionRate: 98, avgRating: 4.9, revenue: 2500 },
    { id: 'pro-2', name: 'Mike Thompson', bookings: 38, completionRate: 95, avgRating: 4.7, revenue: 2100 },
    { id: 'pro-3', name: 'Lisa Kim', bookings: 30, completionRate: 100, avgRating: 5.0, revenue: 1800 },
    { id: 'pro-4', name: 'James Wilson', bookings: 22, completionRate: 91, avgRating: 4.6, revenue: 1200 },
    { id: 'pro-5', name: 'Emily Chen', bookings: 18, completionRate: 94, avgRating: 4.8, revenue: 1000 },
  ];
  
  // Overall Stats
  const totalModels = modelPerformance.length;
  const avgModelScore = Math.round(
    modelPerformance.reduce((sum, m) => sum + m.avgScore, 0) / totalModels
  );
  const avgCompletionRate = Math.round(
    modelPerformance.reduce((sum, m) => sum + m.completionRate, 0) / totalModels
  );
  const avgResponseTime = Math.round(
    modelPerformance.reduce((sum, m) => sum + m.responseTime, 0) / totalModels
  );
  
  return {
    modelPerformance,
    professionalPerformance,
    stats: {
      totalModels,
      avgModelScore,
      avgCompletionRate,
      avgResponseTime,
    },
  };
};

export default function PerformancePage() {
  const [activeTab, setActiveTab] = useState('models');
  const performanceData = useMemo(() => generatePerformanceData(), []);
  
  const { modelPerformance, professionalPerformance, stats } = performanceData;
  
  const getScoreColor = (score) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 75) return styles.scoreGood;
    if (score >= 60) return styles.scoreAverage;
    return styles.scorePoor;
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Performance Analytics ⭐</h1>
          <p style={styles.subtitle}>Track model and professional performance metrics</p>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💄</div>
          <div style={styles.statValue}>{stats.totalModels}</div>
          <div style={styles.statLabel}>Active Models</div>
          <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
            <span>↑</span>
            <span>+12 this month</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{stats.avgModelScore}</div>
          <div style={styles.statLabel}>Avg Model Score</div>
          <div style={styles.statChange}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Quality indicator</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{stats.avgCompletionRate}%</div>
          <div style={styles.statLabel}>Avg Completion Rate</div>
          <div style={{ ...styles.statChange, ...styles.statChangePositive }}>
            <span>↑</span>
            <span>+3% vs last month</span>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={styles.statIcon}>⏱️</div>
          <div style={styles.statValue}>{stats.avgResponseTime}m</div>
          <div style={styles.statLabel}>Avg Response Time</div>
          <div style={{ ...styles.statChange, ...styles.statChangeNegative }}>
            <span>↓</span>
            <span>-5m vs last month</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'models', label: '💄 Model Performance' },
          { id: 'professionals', label: '✂️ Professional Performance' },
          { id: 'insights', label: '📊 Insights & Trends' },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Model Performance Tab */}
      {activeTab === 'models' && (
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <span>🏆</span> Top Performing Models
              </div>
            </div>
            
            <div>
              {modelPerformance.slice(0, 10).map((model, i) => (
                <div key={model.id} style={styles.perfRow}>
                  <div style={{ width: '30px', textAlign: 'center', fontWeight: '700', color: 'rgba(255,255,255,0.4)' }}>
                    #{i + 1}
                  </div>
                  <div style={styles.perfAvatar}>
                    {model.name.charAt(0)}
                  </div>
                  <div style={styles.perfInfo}>
                    <div style={styles.perfName}>{model.name}</div>
                    <div style={styles.perfLabel}>
                      {model.bookings} bookings • {model.completionRate}% completion • {model.responseTime}m avg response
                    </div>
                    <div style={styles.perfBar}>
                      <div 
                        style={{ 
                          ...styles.perfBarFill, 
                          width: `${model.avgScore}%` 
                        }} 
                      />
                    </div>
                  </div>
                  <div style={styles.perfScore}>
                    <div style={{ marginBottom: '0.25rem' }}>{model.avgScore}</div>
                    <span style={{
                      ...styles.scoreBadge,
                      ...getScoreColor(model.avgScore),
                    }}>
                      {model.avgScore >= 90 ? 'Excellent' :
                       model.avgScore >= 75 ? 'Good' :
                       model.avgScore >= 60 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Detailed Breakdown */}
          <div style={styles.twoColumn}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <span>📊</span> Score Breakdown
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Model</th>
                    <th style={styles.th}>Reliability</th>
                    <th style={styles.th}>Feedback</th>
                    <th style={styles.th}>Experience</th>
                    <th style={styles.th}>Engagement</th>
                    <th style={styles.th}>Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {modelPerformance.slice(0, 5).map(model => (
                    <tr key={model.id}>
                      <td style={styles.td}>{model.name}</td>
                      <td style={styles.td}>
                        <span style={{ color: model.reliability >= 75 ? '#4caf50' : '#ffc107' }}>
                          {model.reliability}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: model.feedback >= 75 ? '#4caf50' : '#ffc107' }}>
                          {model.feedback}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: model.experience >= 75 ? '#4caf50' : '#ffc107' }}>
                          {model.experience}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: model.engagement >= 75 ? '#4caf50' : '#ffc107' }}>
                          {model.engagement}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <strong>{model.avgScore}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={styles.card}>
              <div style={styles.cardTitle}>
                <span>📈</span> Performance Trends
              </div>
              <div style={{
                height: '200px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '1rem',
              }}>
                [Chart: Model Performance Trends Over Time]
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Trending Up:</strong> Reliability scores increased 8% this month
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Needs Attention:</strong> 3 models with scores below 60
                </div>
                <div>
                  <strong>Top Performer:</strong> {modelPerformance[0]?.name} with {modelPerformance[0]?.avgScore} avg score
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Professional Performance Tab */}
      {activeTab === 'professionals' && (
        <div>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <span>👑</span> Professional Performance Rankings
              </div>
            </div>
            
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Rank</th>
                  <th style={styles.th}>Professional</th>
                  <th style={styles.th}>Bookings</th>
                  <th style={styles.th}>Completion Rate</th>
                  <th style={styles.th}>Avg Rating</th>
                  <th style={styles.th}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {professionalPerformance.map((pro, i) => (
                  <tr key={pro.id}>
                    <td style={styles.td}>
                      <span style={{
                        background: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'transparent',
                        color: i < 3 ? '#000' : 'rgba(255,255,255,0.6)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                      }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{pro.name}</strong>
                    </td>
                    <td style={styles.td}>{pro.bookings}</td>
                    <td style={styles.td}>
                      <span style={{ color: pro.completionRate >= 95 ? '#4caf50' : '#ffc107' }}>
                        {pro.completionRate}%
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#ffc107' }}>⭐ {pro.avgRating}</span>
                    </td>
                    <td style={styles.td}>
                      <strong>${pro.revenue.toLocaleString()}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div style={styles.twoColumn}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span>💡</span> Key Insights
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: '1.8' }}>
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(76,175,80,0.1)', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                borderLeft: '3px solid #4caf50',
              }}>
                <strong style={{ color: '#4caf50' }}>✅ Positive Trend:</strong> Model completion rates have improved by 5% this quarter.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(255,193,7,0.1)', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                borderLeft: '3px solid #ffc107',
              }}>
                <strong style={{ color: '#ffc107' }}>⚠️ Attention Needed:</strong> 3 models have response times above 60 minutes. Consider sending reminders.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(102,126,234,0.1)', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                borderLeft: '3px solid #667eea',
              }}>
                <strong style={{ color: '#667eea' }}>📊 Opportunity:</strong> Top 3 professionals account for 40% of bookings. Consider expanding their availability.
              </div>
              
              <div style={{ 
                padding: '1rem', 
                background: 'rgba(233,69,96,0.1)', 
                borderRadius: '8px',
                borderLeft: '3px solid #e94560',
              }}>
                <strong style={{ color: '#e94560' }}>🎯 Action Item:</strong> Models with scores below 60 should receive additional training or support.
              </div>
            </div>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span>📈</span> Performance Distribution
            </div>
            <div style={{
              height: '200px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '1rem',
            }}>
              [Chart: Score Distribution]
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Excellent (90+):</strong> {modelPerformance.filter(m => m.avgScore >= 90).length} models
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Good (75-89):</strong> {modelPerformance.filter(m => m.avgScore >= 75 && m.avgScore < 90).length} models
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Average (60-74):</strong> {modelPerformance.filter(m => m.avgScore >= 60 && m.avgScore < 75).length} models
              </div>
              <div>
                <strong>Needs Improvement (&lt;60):</strong> {modelPerformance.filter(m => m.avgScore < 60).length} models
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

