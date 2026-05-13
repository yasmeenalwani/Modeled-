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
  
  // Hero savings
  heroCard: {
    background: 'linear-gradient(135deg, rgba(76,175,80,0.2), rgba(76,175,80,0.05))',
    border: '1px solid rgba(76,175,80,0.3)',
    borderRadius: '24px',
    padding: '3rem',
    textAlign: 'center',
    marginBottom: '2rem',
    position: 'relative',
    overflow: 'hidden',
  },
  heroEmoji: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  heroValue: {
    fontSize: '5rem',
    fontWeight: '700',
    color: '#4caf50',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  heroLabel: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.7)',
  },
  heroSubtext: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '1rem',
  },
  sparkle: {
    position: 'absolute',
    fontSize: '2rem',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Two column
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Breakdown
  breakdownItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  breakdownLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  breakdownIcon: {
    fontSize: '1.5rem',
  },
  breakdownService: {
    fontWeight: '600',
  },
  breakdownCount: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  breakdownAmount: {
    fontWeight: '700',
    color: '#4caf50',
    fontSize: '1.1rem',
  },
  
  // Monthly chart
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.75rem',
    height: '180px',
    paddingTop: '1rem',
  },
  chartBar: {
    flex: 1,
    borderRadius: '6px 6px 0 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minHeight: '30px',
  },
  chartLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.5rem',
  },
  chartValue: {
    fontSize: '0.7rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#fff',
  },
  
  // Fun comparison
  comparisonCard: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(255,107,138,0.1))',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  comparisonTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  comparisonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  comparisonEmoji: {
    fontSize: '1.5rem',
  },
  comparisonText: {
    flex: 1,
    fontSize: '0.9rem',
  },
  comparisonCheck: {
    color: '#4caf50',
    fontSize: '1.25rem',
  },
};

// Mock data
const totalSaved = 840;

const savingsByService = [
  { service: 'Color Services', icon: '', count: 4, saved: 430 },
  { service: 'Blowouts', icon: '', count: 5, saved: 195 },
  { service: 'Haircuts', icon: '', count: 2, saved: 130 },
  { service: 'Treatments', icon: '', count: 1, saved: 85 },
];

const monthlyData = [
  { month: 'Jul', saved: 65 },
  { month: 'Aug', saved: 120 },
  { month: 'Sep', saved: 95 },
  { month: 'Oct', saved: 180 },
  { month: 'Nov', saved: 230 },
  { month: 'Dec', saved: 150 },
];

const funComparisons = [
  { emoji: '', text: '280 fancy lattes', check: true },
  { emoji: '', text: '84 pizza nights', check: true },
  { emoji: '', text: '56 movie tickets', check: true },
  { emoji: '', text: '2 designer heels', check: true },
  { emoji: '', text: '1 weekend getaway', check: true },
];

const maxSaved = Math.max(...monthlyData.map(d => d.saved));

export default function ModelSavings() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Savings</h1>
        <p style={styles.subtitle}>Track how much you've saved with Modeled</p>
      </div>

      {/* Hero Savings Card */}
      <div style={styles.heroCard}>
        <span style={{ ...styles.sparkle, top: '20%', left: '15%' }}></span>
        <span style={{ ...styles.sparkle, top: '30%', right: '20%' }}></span>
        <span style={{ ...styles.sparkle, bottom: '25%', left: '25%' }}></span>
        <span style={{ ...styles.sparkle, bottom: '35%', right: '15%' }}></span>
        
        <div style={styles.heroEmoji}></div>
        <div style={styles.heroValue}>${totalSaved}</div>
        <div style={styles.heroLabel}>Total Saved So Far!</div>
        <div style={styles.heroSubtext}>
          You've been a model for 5 months • That's $168/month on average!
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#e94560' }}>12</div>
          <div style={styles.statLabel}>Total Sessions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>$70</div>
          <div style={styles.statLabel}>Avg. Saved/Session</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#667eea' }}>82%</div>
          <div style={styles.statLabel}>Avg. Discount</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}></div>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>$130</div>
          <div style={styles.statLabel}>Total Paid</div>
        </div>
      </div>

      {/* Two Column */}
      <div style={styles.twoCol}>
        {/* Savings by Service */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Savings by Service
          </div>
          {savingsByService.map((item, i) => (
            <div key={i} style={styles.breakdownItem}>
              <div style={styles.breakdownLeft}>
                <div style={styles.breakdownIcon}>{item.icon}</div>
                <div>
                  <div style={styles.breakdownService}>{item.service}</div>
                  <div style={styles.breakdownCount}>{item.count} sessions</div>
                </div>
              </div>
              <div style={styles.breakdownAmount}>${item.saved}</div>
            </div>
          ))}
        </div>

        {/* Monthly Trend */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Monthly Savings
          </div>
          <div style={styles.chartBars}>
            {monthlyData.map((data, i) => (
              <div
                key={i}
                style={{
                  ...styles.chartBar,
                  height: `${(data.saved / maxSaved) * 100}%`,
                  background: data.month === 'Dec' 
                    ? 'linear-gradient(180deg, #4caf50, #2e7d32)'
                    : 'rgba(76,175,80,0.4)',
                }}
              >
                <div style={styles.chartValue}>${data.saved}</div>
                <div style={styles.chartLabel}>{data.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fun Comparison */}
      <div style={styles.comparisonCard}>
        <div style={styles.comparisonTitle}>
          What $840 Could Buy...
        </div>
        {funComparisons.map((item, i) => (
          <div key={i} style={styles.comparisonItem}>
            <div style={styles.comparisonEmoji}>{item.emoji}</div>
            <div style={styles.comparisonText}>{item.text}</div>
            <div style={styles.comparisonCheck}>✓</div>
          </div>
        ))}
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(76,175,80,0.2)',
          borderRadius: '10px',
          textAlign: 'center',
          fontWeight: '600',
          color: '#4caf50',
        }}>
          But you got GORGEOUS hair instead!
        </div>
      </div>
    </div>
  );
}

