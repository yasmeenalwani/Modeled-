import React from 'react';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
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
  
  // Hero stat
  heroCard: {
    background: 'linear-gradient(135deg, rgba(46,160,67,0.2), rgba(46,160,67,0.05))',
    border: '1px solid rgba(46,160,67,0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '2rem',
    textAlign: 'center',
  },
  heroStat: {},
  heroValue: {
    fontSize: '3rem',
    fontWeight: '700',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  heroLabel: {
    fontSize: '0.9rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroChange: {
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Funnel
  funnelCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  funnelTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  funnelSteps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  funnelStep: {
    flex: 1,
    textAlign: 'center',
    position: 'relative',
  },
  funnelCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 0.75rem',
    border: '3px solid',
  },
  funnelValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  funnelPct: {
    fontSize: '0.7rem',
  },
  funnelLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  funnelArrow: {
    fontSize: '1.5rem',
    color: '#5A3A2A', // Muted brown
  },
  
  // Two column
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  
  // Card
  card: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Converted models list
  modelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  modelAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: 'rgba(46,160,67,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    color: '#3fb950',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelRevenue: {
    textAlign: 'right',
  },
  modelRevenueValue: {
    fontWeight: '700',
    color: '#3fb950',
    fontSize: '1rem',
  },
  modelRevenueLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Tips
  tipCard: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(139, 30, 63, 0.05))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginTop: '1.5rem',
  },
  tipTitle: {
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#8B1E3F', // Cherry
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tipItem: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 0',
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Monthly trend
  trendBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    height: '150px',
    marginTop: '1rem',
  },
  trendBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    minHeight: '20px',
  },
  trendLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const funnelData = [
  { label: 'Models Booked', value: 156, pct: 100, color: '#58a6ff' },
  { label: 'Models Served', value: 142, pct: 91, color: '#a371f7' },
  { label: 'Returned', value: 45, pct: 29, color: '#d29922' },
  { label: 'Full-Price Clients', value: 24, pct: 15, color: '#3fb950' },
];

const convertedModels = [
  { name: 'Emma J.', initials: 'EJ', firstService: 'Balayage', conversions: 4, revenue: 680 },
  { name: 'Sophia L.', initials: 'SL', firstService: 'Blowout', conversions: 3, revenue: 420 },
  { name: 'Olivia C.', initials: 'OC', firstService: 'Highlights', conversions: 5, revenue: 890 },
  { name: 'Isabella M.', initials: 'IM', firstService: 'Cut & Color', conversions: 3, revenue: 510 },
  { name: 'Ava T.', initials: 'AT', firstService: 'Color', conversions: 2, revenue: 340 },
];

const monthlyTrend = [
  { month: 'Jul', conversions: 2 },
  { month: 'Aug', conversions: 3 },
  { month: 'Sep', conversions: 4 },
  { month: 'Oct', conversions: 5 },
  { month: 'Nov', conversions: 6 },
  { month: 'Dec', conversions: 4 },
];

const maxConversions = Math.max(...monthlyTrend.map(d => d.conversions));
const totalRevenue = convertedModels.reduce((sum, m) => sum + m.revenue, 0);

export default function PartnerConversions() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Model-to-Client Conversions 💎</h1>
        <p style={styles.subtitle}>Track models who became paying clients</p>
      </div>

      {/* Hero Stats */}
      <div style={styles.heroCard}>
        <div style={styles.heroStat}>
          <div style={{ ...styles.heroValue, color: '#3fb950' }}>24</div>
          <div style={styles.heroLabel}>Total Conversions</div>
          <div style={{ ...styles.heroChange, color: '#3fb950' }}>↑ 6 this month</div>
        </div>
        <div style={styles.heroStat}>
          <div style={{ ...styles.heroValue, color: '#58a6ff' }}>15.4%</div>
          <div style={styles.heroLabel}>Conversion Rate</div>
          <div style={{ ...styles.heroChange, color: '#3fb950' }}>↑ 2.3% vs avg</div>
        </div>
        <div style={styles.heroStat}>
          <div style={{ ...styles.heroValue, color: '#d29922' }}>${totalRevenue.toLocaleString()}</div>
          <div style={styles.heroLabel}>Revenue Generated</div>
          <div style={{ ...styles.heroChange, color: '#3fb950' }}>↑ $890 this month</div>
        </div>
        <div style={styles.heroStat}>
          <div style={{ ...styles.heroValue, color: '#a371f7' }}>$118</div>
          <div style={styles.heroLabel}>Avg Revenue/Convert</div>
          <div style={{ ...styles.heroChange, color: '#3fb950' }}>↑ $12 vs last month</div>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div style={styles.funnelCard}>
        <div style={styles.funnelTitle}>
          <span>📊</span> Conversion Funnel
        </div>
        <div style={styles.funnelSteps}>
          {funnelData.map((step, i) => (
            <React.Fragment key={i}>
              <div style={styles.funnelStep}>
                <div style={{
                  ...styles.funnelCircle,
                  borderColor: step.color,
                  background: `${step.color}15`,
                }}>
                  <div style={{ ...styles.funnelValue, color: step.color }}>{step.value}</div>
                  <div style={{ ...styles.funnelPct, color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>{step.pct}%</div>
                </div>
                <div style={styles.funnelLabel}>{step.label}</div>
              </div>
              {i < funnelData.length - 1 && (
                <div style={styles.funnelArrow}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(46,160,67,0.1)',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '0.9rem',
        }}>
          <strong style={{ color: '#3fb950' }}>Industry benchmark: 8%</strong>
          <span style={{ color: '#5A3A2A', marginLeft: '0.75rem', fontFamily: '"Alike", "Georgia", serif' }}>
            — You're outperforming by <strong style={{ color: '#3fb950' }}>92%</strong>! 🎉
          </span>
        </div>
      </div>

      {/* Two Column */}
      <div style={styles.twoCol}>
        {/* Converted Models */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>👑</span> Top Converted Models
          </div>
          {convertedModels.map((model, i) => (
            <div key={i} style={styles.modelItem}>
              <div style={styles.modelAvatar}>{model.initials}</div>
              <div style={styles.modelInfo}>
                <div style={styles.modelName}>{model.name}</div>
                <div style={styles.modelMeta}>
                  First: {model.firstService} • {model.conversions} visits
                </div>
              </div>
              <div style={styles.modelRevenue}>
                <div style={styles.modelRevenueValue}>${model.revenue}</div>
                <div style={styles.modelRevenueLabel}>total revenue</div>
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Trend + Tips */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span>📈</span> Monthly Conversions
            </div>
            <div style={styles.trendBars}>
              {monthlyTrend.map((data, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.trendBar,
                    height: `${(data.conversions / maxConversions) * 100}%`,
                    background: data.month === 'Dec'
                      ? 'linear-gradient(180deg, #3fb950, #238636)'
                      : 'rgba(46,160,67,0.4)',
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: data.month === 'Dec' ? '#FFFEF9' : '#5A3A2A',
                    marginBottom: '0.25rem',
                  }}>
                    {data.conversions}
                  </div>
                  <div style={styles.trendLabel}>{data.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={styles.tipCard}>
            <div style={styles.tipTitle}>💡 Boost Your Conversions</div>
            <div style={styles.tipItem}>
              <span>✓</span>
              <span>Offer 15% off first full-price service</span>
            </div>
            <div style={styles.tipItem}>
              <span>✓</span>
              <span>Follow up within 48 hours of model session</span>
            </div>
            <div style={styles.tipItem}>
              <span>✓</span>
              <span>Create VIP loyalty program for converts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

