import React, { useState } from 'react';

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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  exportBtn: {
    padding: '0.65rem 1.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Period selector
  periodSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
  },
  periodBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  periodBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Summary cards
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  summaryIcon: {
    fontSize: '1.5rem',
    marginBottom: '0.75rem',
  },
  summaryValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  summaryLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  summaryChange: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Two column
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  
  // Card
  card: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Rate card table
  rateTable: {},
  rateRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    alignItems: 'center',
  },
  rateHeader: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  rateService: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  rateValue: {
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  rateRevenue: {
    color: '#3fb950',
    fontWeight: '600',
  },
  
  // Transactions
  transactionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  transactionIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  transactionMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  transactionAmount: {
    fontWeight: '700',
    fontSize: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Payout card
  payoutCard: {
    background: 'linear-gradient(135deg, rgba(46,160,67,0.2), rgba(46,160,67,0.05))',
    border: '1px solid rgba(46,160,67,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  payoutLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  payoutValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#3fb950',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  payoutDate: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const rateCard = [
  { service: 'Blowout', icon: '', perService: 20, perHour: null, sessions: 15, revenue: 300 },
  { service: 'Haircut', icon: '', perService: 25, perHour: null, sessions: 12, revenue: 300 },
  { service: 'Color - Roots', icon: '', perService: 35, perHour: null, sessions: 8, revenue: 280 },
  { service: 'Balayage', icon: '', perService: 50, perHour: null, sessions: 6, revenue: 300 },
  { service: 'Highlights', icon: '', perService: 45, perHour: null, sessions: 5, revenue: 225 },
];

const recentTransactions = [
  { type: 'payout', title: 'Weekly Payout', date: 'Dec 2, 2024', amount: 485, status: 'completed' },
  { type: 'session', title: 'Balayage Session', date: 'Dec 4, 2024', amount: 50, status: 'pending' },
  { type: 'session', title: 'Color Training', date: 'Dec 3, 2024', amount: 35, status: 'pending' },
  { type: 'campaign', title: 'Holiday Event Revenue', date: 'Dec 1, 2024', amount: 120, status: 'completed' },
  { type: 'payout', title: 'Weekly Payout', date: 'Nov 25, 2024', amount: 420, status: 'completed' },
];

export default function PartnerFinancials() {
  const [period, setPeriod] = useState('month');

  const totalRevenue = rateCard.reduce((sum, r) => sum + r.revenue, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Financials 💰</h1>
          <p style={styles.subtitle}>Track revenue, payouts, and rate cards</p>
        </div>
        <button style={styles.exportBtn}>
          📥 Export Report
        </button>
      </div>

      {/* Period Selector */}
      <div style={styles.periodSelector}>
        {['week', 'month', 'quarter', 'year'].map(p => (
          <button
            key={p}
            style={{
              ...styles.periodBtn,
              ...(period === p ? styles.periodBtnActive : {}),
            }}
            onClick={() => setPeriod(p)}
          >
            This {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💵</div>
          <div style={{ ...styles.summaryValue, color: '#3fb950' }}>${totalRevenue.toLocaleString()}</div>
          <div style={styles.summaryLabel}>Total Revenue</div>
          <div style={{ ...styles.summaryChange, color: '#3fb950' }}>↑ 18% vs last month</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📅</div>
          <div style={{ ...styles.summaryValue, color: '#58a6ff' }}>46</div>
          <div style={styles.summaryLabel}>Sessions Completed</div>
          <div style={{ ...styles.summaryChange, color: '#3fb950' }}>↑ 12 vs last month</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>💎</div>
          <div style={{ ...styles.summaryValue, color: '#d29922' }}>$2,840</div>
          <div style={styles.summaryLabel}>From Conversions</div>
          <div style={{ ...styles.summaryChange, color: '#3fb950' }}>↑ $450 this month</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🚀</div>
          <div style={{ ...styles.summaryValue, color: '#a371f7' }}>$380</div>
          <div style={styles.summaryLabel}>Campaign Revenue</div>
          <div style={{ ...styles.summaryChange, color: '#3fb950' }}>↑ from 2 events</div>
        </div>
      </div>

      {/* Two Column */}
      <div style={styles.twoCol}>
        {/* Left Column */}
        <div>
          {/* Rate Card */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📋</span> Rate Card
              </span>
              <button style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(139, 30, 63, 0.05)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '4px',
                color: '#4A2A1A',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Edit Rates
              </button>
            </div>
            
            <div style={styles.rateTable}>
              <div style={{ ...styles.rateRow, borderBottom: '2px solid rgba(139, 30, 63, 0.15)' }}>
                <div style={styles.rateHeader}>Service</div>
                <div style={styles.rateHeader}>Rate</div>
                <div style={styles.rateHeader}>Sessions</div>
                <div style={styles.rateHeader}>Revenue</div>
              </div>
              {rateCard.map((rate, i) => (
                <div key={i} style={styles.rateRow}>
                  <div style={styles.rateService}>
                    <span>{rate.icon}</span>
                    {rate.service}
                  </div>
                  <div style={styles.rateValue}>${rate.perService}/session</div>
                  <div style={styles.rateValue}>{rate.sessions}</div>
                  <div style={styles.rateRevenue}>${rate.revenue}</div>
                </div>
              ))}
              <div style={{ ...styles.rateRow, background: 'rgba(46,160,67,0.1)', borderRadius: '0 0 8px 8px', marginTop: '0.5rem' }}>
                <div style={{ fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>Total</div>
                <div></div>
                <div style={{ fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{rateCard.reduce((sum, r) => sum + r.sessions, 0)}</div>
                <div style={{ fontWeight: '700', color: '#3fb950', fontFamily: '"Alike", "Georgia", serif' }}>${totalRevenue}</div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🧾</span> Recent Transactions
              </span>
              <span style={{ color: '#8B1E3F', fontSize: '0.8rem', cursor: 'pointer', fontFamily: '"Alike", "Georgia", serif' }}>View All →</span>
            </div>
            {recentTransactions.map((tx, i) => (
              <div key={i} style={styles.transactionItem}>
                <div style={{
                  ...styles.transactionIcon,
                  background: tx.type === 'payout' ? 'rgba(46,160,67,0.2)' :
                             tx.type === 'campaign' ? 'rgba(163,113,247,0.2)' :
                             'rgba(88,166,255,0.2)',
                }}>
                </div>
                <div style={styles.transactionInfo}>
                  <div style={styles.transactionTitle}>{tx.title}</div>
                  <div style={styles.transactionMeta}>{tx.date}</div>
                </div>
                <div style={{
                  ...styles.transactionAmount,
                  color: tx.type === 'payout' ? '#3fb950' : tx.status === 'pending' ? '#d29922' : '#58a6ff',
                }}>
                  {tx.type === 'payout' ? '-' : '+'}${tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Next Payout */}
          <div style={styles.payoutCard}>
            <div style={styles.payoutLabel}>Next Payout</div>
            <div style={styles.payoutValue}>$485</div>
            <div style={styles.payoutDate}>Monday, Dec 9, 2024</div>
            <button style={{
              marginTop: '1rem',
              padding: '0.6rem 1.5rem',
              background: 'rgba(46,160,67,0.3)',
              border: '1px solid #3fb950',
              borderRadius: '6px',
              color: '#3fb950',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}>
              View Payout Details
            </button>
          </div>

          {/* Bank Info */}
          <div style={{ ...styles.card, marginTop: '1.5rem' }}>
            <div style={styles.cardTitle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>🏦</span> Payout Account
              </span>
            </div>
            <div style={{
              padding: '1rem',
              background: 'rgba(139, 30, 63, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 30, 63, 0.1)',
            }}>
              <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                <strong>Bank of America</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                ****4521 • Checking
              </div>
            </div>
            <button style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.6rem',
              background: 'transparent',
              border: '1px dashed rgba(139, 30, 63, 0.3)',
              borderRadius: '6px',
              color: '#8B1E3F',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              Update Payment Method
            </button>
          </div>

          {/* Invoice */}
          <div style={{ ...styles.card, marginTop: '1.5rem' }}>
            <div style={styles.cardTitle}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📄</span> Submit Invoice
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>
              Submit invoices for special services or campaign work.
            </p>
            <button style={{
              width: '100%',
              padding: '0.75rem',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              border: 'none',
              borderRadius: '6px',
              color: '#FFFEF9',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              + Create Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

