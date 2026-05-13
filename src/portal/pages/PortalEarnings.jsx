import React, { useState, useMemo } from 'react';
import { services } from '../../admin/data/services';

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
  
  // Period selector
  periodSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  periodBtn: {
    padding: '0.5rem 1.25rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  periodBtnActive: {
    background: 'rgba(76,175,80,0.2)',
    borderColor: '#4caf50',
    color: '#4caf50',
  },
  
  // Total earnings card
  totalCard: {
    background: 'linear-gradient(135deg, rgba(76,175,80,0.15), rgba(76,175,80,0.05))',
    border: '1px solid rgba(76,175,80,0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2rem',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '2rem',
    textAlign: 'center',
  },
  totalMain: {
    borderRight: '1px solid rgba(76,175,80,0.2)',
  },
  totalValue: {
    fontSize: '3.5rem',
    fontWeight: '700',
    color: '#4caf50',
    lineHeight: 1,
  },
  totalLabel: {
    fontSize: '1rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.75rem',
  },
  totalSecondary: {},
  secondaryValue: {
    fontSize: '2rem',
    fontWeight: '700',
  },
  secondaryLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.5rem',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.25rem',
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
    borderRadius: '16px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Tips by service
  serviceItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  serviceIcon: {
    fontSize: '1.5rem',
    width: '40px',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  serviceCount: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceAmount: {
    fontWeight: '700',
    color: '#4caf50',
  },
  
  // Recent tips
  tipItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  tipService: {
    fontWeight: '500',
  },
  tipDate: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  tipAmount: {
    fontWeight: '700',
    color: '#4caf50',
    fontSize: '1.1rem',
  },
  
  // Chart placeholder
  chartPlaceholder: {
    height: '200px',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '1rem',
  },
  
  // Monthly bars
  monthlyBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    height: '150px',
    marginTop: '1rem',
  },
  monthBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    minHeight: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  monthLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.5rem',
  },
  
  // Projections Section
  projectionsCard: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    marginTop: '2rem',
  },
  projectionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  projectionsTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  projectionsToggle: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  projectionsToggleActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  projectionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  projectionsInputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  inputLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  slider: {
    flex: 1,
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(139, 30, 63, 0.2)',
    outline: 'none',
    appearance: 'none',
  },
  sliderThumb: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#8B1E3F',
    cursor: 'pointer',
  },
  inputValue: {
    minWidth: '60px',
    padding: '0.5rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    color: '#4A2A1A',
  },
  projectionsResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  projectionScenario: {
    padding: '1.25rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
  },
  scenarioHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  scenarioTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  scenarioAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4caf50',
    fontFamily: '"Alike", "Georgia", serif',
  },
  scenarioBreakdown: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.6,
  },
  projectionChart: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#FFFEF9',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  chartBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.5rem',
    height: '120px',
    marginTop: '1rem',
  },
  chartBar: {
    flex: 1,
    borderRadius: '4px 4px 0 0',
    minHeight: '10px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    transition: 'all 0.3s ease',
  },
  chartLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  helperText: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const monthlyData = [
  { month: 'Jul', tips: 320 },
  { month: 'Aug', tips: 410 },
  { month: 'Sep', tips: 385 },
  { month: 'Oct', tips: 450 },
  { month: 'Nov', tips: 520 },
  { month: 'Dec', tips: 485 },
];

const tipsByService = [
  { service: 'Color Services', icon: '', count: 18, total: 285 },
  { service: 'Blowouts', icon: '', count: 15, total: 125 },
  { service: 'Haircuts', icon: '', count: 9, total: 75 },
];

const recentTips = [
  { service: 'Balayage', date: 'Dec 4', amount: 35 },
  { service: 'Blowout', date: 'Dec 3', amount: 15 },
  { service: 'Color Correction', date: 'Dec 2', amount: 50 },
  { service: 'Highlights', date: 'Dec 1', amount: 25 },
  { service: 'Cut & Style', date: 'Nov 28', amount: 20 },
];

const maxTip = Math.max(...monthlyData.map(d => d.tips));

export default function PortalEarnings() {
  const [period, setPeriod] = useState('month');
  const [showProjections, setShowProjections] = useState(false);
  
  // Projection inputs
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [avgTipPerSession, setAvgTipPerSession] = useState(27);
  const [tipRate, setTipRate] = useState(92); // percentage
  
  const currentMonthTips = 485;
  const totalTips = monthlyData.reduce((sum, m) => sum + m.tips, 0);
  const avgTipPerSessionActual = 27;
  const sessionsThisMonth = 18;
  
  // Calculate projections
  const projections = useMemo(() => {
    const sessionsPerMonth = sessionsPerWeek * 4.33;
    const sessionsPerYear = sessionsPerWeek * 52;
    
    const monthlyEarnings = sessionsPerMonth * avgTipPerSession * (tipRate / 100);
    const yearlyEarnings = sessionsPerYear * avgTipPerSession * (tipRate / 100);
    const weeklyEarnings = sessionsPerWeek * avgTipPerSession * (tipRate / 100);
    
    // Growth scenarios
    const conservative = {
      label: 'Conservative',
      monthly: monthlyEarnings * 0.9,
      yearly: yearlyEarnings * 0.9,
      description: '10% below current pace',
    };
    
    const current = {
      label: 'Current Pace',
      monthly: monthlyEarnings,
      yearly: yearlyEarnings,
      description: 'Maintain current rate',
    };
    
    const growth = {
      label: 'Growth (20% increase)',
      monthly: monthlyEarnings * 1.2,
      yearly: yearlyEarnings * 1.2,
      description: 'Increase sessions by 20%',
    };
    
    return {
      weekly: weeklyEarnings,
      monthly: monthlyEarnings,
      yearly: yearlyEarnings,
      scenarios: [conservative, current, growth],
      sessionsPerMonth,
      sessionsPerYear,
    };
  }, [sessionsPerWeek, avgTipPerSession, tipRate]);
  
  const maxProjection = Math.max(...projections.scenarios.map(s => s.monthly));

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Tips & Earnings 💰</h1>
        <p style={styles.subtitle}>Track your tips from model sessions</p>
      </div>

      {/* Period Selector */}
      <div style={styles.periodSelector}>
        {['week', 'month', 'year', 'all'].map(p => (
          <button
            key={p}
            style={{
              ...styles.periodBtn,
              ...(period === p ? styles.periodBtnActive : {}),
            }}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Total Earnings Card */}
      <div style={styles.totalCard}>
        <div style={styles.totalMain}>
          <div style={styles.totalValue}>${currentMonthTips}</div>
          <div style={styles.totalLabel}>Tips This Month</div>
        </div>
        <div style={styles.totalSecondary}>
          <div style={{ ...styles.secondaryValue, color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>${totalTips}</div>
          <div style={styles.secondaryLabel}>Total Tips (6 months)</div>
        </div>
        <div style={styles.totalSecondary}>
          <div style={{ ...styles.secondaryValue, color: '#ffc107' }}>${avgTipPerSession}</div>
          <div style={styles.secondaryLabel}>Avg Tip / Session</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={{ ...styles.statValue, color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{sessionsThisMonth}</div>
          <div style={styles.statLabel}>Sessions This Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📈</div>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>+12%</div>
          <div style={styles.statLabel}>vs Last Month</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>★</div>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>$50</div>
          <div style={styles.statLabel}>Highest Tip</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={{ ...styles.statValue, color: '#e94560' }}>92%</div>
          <div style={styles.statLabel}>Tip Rate</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoCol}>
        {/* Tips by Service */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            Tips by Service
          </div>
          {tipsByService.map((service, i) => (
            <div key={i} style={styles.serviceItem}>
              <div style={styles.serviceIcon}>{service.icon}</div>
              <div style={styles.serviceInfo}>
                <div style={styles.serviceName}>{service.service}</div>
                <div style={styles.serviceCount}>{service.count} sessions</div>
              </div>
              <div style={styles.serviceAmount}>${service.total}</div>
            </div>
          ))}
          
          {/* Monthly Trend */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Monthly Trend
            </div>
            <div style={styles.monthlyBars}>
              {monthlyData.map((data, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.monthBar,
                    height: `${(data.tips / maxTip) * 100}%`,
                    background: data.month === 'Dec' 
                      ? 'linear-gradient(180deg, #4caf50, #2e7d32)' 
                      : 'rgba(76,175,80,0.3)',
                  }}
                >
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '600',
                    color: data.month === 'Dec' ? '#8B1E3F' : '#5A3A2A',
                    fontFamily: '"Alike", "Georgia", serif',
                    marginBottom: '0.25rem',
                  }}>
                    ${data.tips}
                  </div>
                  <div style={styles.monthLabel}>{data.month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tips */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <span>🧾</span> Recent Tips
          </div>
          {recentTips.map((tip, i) => (
            <div key={i} style={styles.tipItem}>
              <div>
                <div style={styles.tipService}>{tip.service}</div>
                <div style={styles.tipDate}>{tip.date}</div>
              </div>
              <div style={styles.tipAmount}>+${tip.amount}</div>
            </div>
          ))}
          
          {/* Note about payouts */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'rgba(102,126,234,0.1)',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: '#4A2A1A', // Dark brown
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>💳 Payout Info</div>
            Tips are processed weekly and deposited directly to your linked account. 
            Next payout: <strong style={{ color: '#4caf50' }}>Dec 9, 2024</strong>
          </div>
        </div>
      </div>
      
      {/* Earnings Projections */}
      <div style={styles.projectionsCard}>
        <div style={styles.projectionsHeader}>
          <div style={styles.projectionsTitle}>
            📊 Earnings Projections
          </div>
          <button
            style={{
              ...styles.projectionsToggle,
              ...(showProjections ? styles.projectionsToggleActive : {}),
            }}
            onClick={() => setShowProjections(!showProjections)}
          >
            {showProjections ? 'Hide' : 'Show'} Calculator
          </button>
        </div>
        
        {showProjections && (
          <div style={styles.projectionsGrid}>
            {/* Input Controls */}
            <div style={styles.projectionsInputs}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  Sessions per Week
                </label>
                <div style={styles.inputRow}>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(parseInt(e.target.value))}
                    style={{
                      ...styles.slider,
                      background: `linear-gradient(to right, #8B1E3F 0%, #8B1E3F ${(sessionsPerWeek / 20) * 100}%, rgba(139, 30, 63, 0.2) ${(sessionsPerWeek / 20) * 100}%, rgba(139, 30, 63, 0.2) 100%)`,
                    }}
                    className="earnings-slider"
                  />
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                    style={styles.inputValue}
                  />
                </div>
                <div style={styles.helperText}>
                  ≈ {projections.sessionsPerMonth.toFixed(0)} sessions/month
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  Average Tip per Session ($)
                </label>
                <div style={styles.inputRow}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={avgTipPerSession}
                    onChange={(e) => setAvgTipPerSession(parseInt(e.target.value))}
                    style={{
                      ...styles.slider,
                      background: `linear-gradient(to right, #8B1E3F 0%, #8B1E3F ${((avgTipPerSession - 10) / 90) * 100}%, rgba(139, 30, 63, 0.2) ${((avgTipPerSession - 10) / 90) * 100}%, rgba(139, 30, 63, 0.2) 100%)`,
                    }}
                    className="earnings-slider"
                  />
                  <input
                    type="number"
                    min="10"
                    max="100"
                    step="5"
                    value={avgTipPerSession}
                    onChange={(e) => setAvgTipPerSession(Math.min(100, Math.max(10, parseInt(e.target.value) || 10)))}
                    style={styles.inputValue}
                  />
                </div>
                <div style={styles.helperText}>
                  Based on your current average: ${avgTipPerSessionActual}
                </div>
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>
                  Tip Rate (% of sessions)
                </label>
                <div style={styles.inputRow}>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={tipRate}
                    onChange={(e) => setTipRate(parseInt(e.target.value))}
                    style={{
                      ...styles.slider,
                      background: `linear-gradient(to right, #8B1E3F 0%, #8B1E3F ${((tipRate - 50) / 50) * 100}%, rgba(139, 30, 63, 0.2) ${((tipRate - 50) / 50) * 100}%, rgba(139, 30, 63, 0.2) 100%)`,
                    }}
                    className="earnings-slider"
                  />
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="5"
                    value={tipRate}
                    onChange={(e) => setTipRate(Math.min(100, Math.max(50, parseInt(e.target.value) || 50)))}
                    style={styles.inputValue}
                  />
                </div>
                <div style={styles.helperText}>
                  Your current tip rate: 92%
                </div>
              </div>
            </div>
            
            {/* Projection Results */}
            <div style={styles.projectionsResults}>
              <div style={styles.projectionScenario}>
                <div style={styles.scenarioHeader}>
                  <div style={styles.scenarioTitle}>Weekly Projection</div>
                  <div style={styles.scenarioAmount}>${projections.weekly.toFixed(0)}</div>
                </div>
                <div style={styles.scenarioBreakdown}>
                  {sessionsPerWeek} sessions × ${avgTipPerSession} × {tipRate}% = ${projections.weekly.toFixed(0)}/week
                </div>
              </div>
              
              {projections.scenarios.map((scenario, idx) => (
                <div key={idx} style={styles.projectionScenario}>
                  <div style={styles.scenarioHeader}>
                    <div style={styles.scenarioTitle}>{scenario.label}</div>
                    <div style={styles.scenarioAmount}>${scenario.monthly.toFixed(0)}/mo</div>
                  </div>
                  <div style={styles.scenarioBreakdown}>
                    {scenario.description}
                    <br />
                    <strong>Yearly:</strong> ${scenario.yearly.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Visual Chart */}
        {showProjections && (
          <div style={styles.projectionChart}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
              Monthly Earnings Comparison
            </div>
            <div style={styles.chartBars}>
              {projections.scenarios.map((scenario, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.chartBar,
                    height: `${(scenario.monthly / maxProjection) * 100}%`,
                    background: idx === 0 
                      ? 'linear-gradient(180deg, rgba(248, 81, 73, 0.6), rgba(248, 81, 73, 0.3))'
                      : idx === 1
                      ? 'linear-gradient(180deg, #4caf50, rgba(76, 175, 80, 0.5))'
                      : 'linear-gradient(180deg, rgba(102, 126, 234, 0.6), rgba(102, 126, 234, 0.3))',
                  }}
                >
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#4A2A1A',
                    marginBottom: '0.25rem',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    ${scenario.monthly.toFixed(0)}
                  </div>
                  <div style={styles.chartLabel}>{scenario.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Payment History Section */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <div style={styles.cardTitle}>
          <span>💳</span> Payment History
        </div>
        
        {/* Payment Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'rgba(76,175,80,0.1)',
          borderRadius: '12px',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4caf50' }}>$2,570</div>
            <div style={{ fontSize: '0.75rem', color: '#5A3A2A' }}>Total Paid Out</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ffc107' }}>$485</div>
            <div style={{ fontSize: '0.75rem', color: '#5A3A2A' }}>Pending Payout</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#8B1E3F' }}>Dec 9</div>
            <div style={{ fontSize: '0.75rem', color: '#5A3A2A' }}>Next Payout</div>
          </div>
        </div>
        
        {/* Payment List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { date: 'Dec 2, 2024', amount: 520, status: 'paid', method: 'Direct Deposit' },
            { date: 'Nov 25, 2024', amount: 450, status: 'paid', method: 'Direct Deposit' },
            { date: 'Nov 18, 2024', amount: 385, status: 'paid', method: 'Direct Deposit' },
            { date: 'Nov 11, 2024', amount: 410, status: 'paid', method: 'Direct Deposit' },
            { date: 'Nov 4, 2024', amount: 320, status: 'paid', method: 'Direct Deposit' },
          ].map((payment, idx) => (
            <div key={idx} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'rgba(139, 30, 63, 0.05)',
              borderRadius: '8px',
            }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                  {payment.date}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                  {payment.method}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  padding: '0.25rem 0.5rem',
                  background: payment.status === 'paid' ? 'rgba(76,175,80,0.2)' : 'rgba(255,193,7,0.2)',
                  color: payment.status === 'paid' ? '#4caf50' : '#ffc107',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  {payment.status}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#4caf50', fontFamily: '"Alike", "Georgia", serif' }}>
                  ${payment.amount}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Payout Settings */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(102,126,234,0.1)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
              Payout Method
            </div>
            <div style={{ fontSize: '0.8rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              Direct Deposit • ****4521 • Weekly on Mondays
            </div>
          </div>
          <button style={{
            padding: '0.5rem 1rem',
            background: 'rgba(139, 30, 63, 0.1)',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#8B1E3F',
            cursor: 'pointer',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

