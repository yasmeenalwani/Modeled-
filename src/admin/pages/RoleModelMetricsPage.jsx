// ============================================
// ROLE MODEL - Impact Metrics
// Comprehensive impact measurement
// ============================================

import React from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1.1rem',
    fontStyle: 'italic',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  metricCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  metricValue: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  metricLabel: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.5rem',
  },
  metricChange: {
    fontSize: '0.85rem',
    color: 'rgba(16,185,129,0.8)',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(16,185,129,0.2)',
    paddingBottom: '0.5rem',
  },
  chartPlaceholder: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    minHeight: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// Mock metrics data
const metrics = {
  // People Impact
  totalApplications: 47,
  recipientsSelected: 12,
  recipientsServed: 8,
  storiesShared: 6,
  professionalsParticipating: 5,
  nominationsReceived: 15,
  
  // Financial Impact
  totalValueProvided: 2400, // $300 avg service × 8 served
  averageServiceValue: 300,
  monthlyBudget: 300,
  
  // Wear Care Impact
  totalOrders: 23,
  totalRevenue: 575, // From merch sales
  totalDonations: 78.20, // 10% + round-ups from all orders
  donationsFromPercent: 57.50, // 10% of base prices
  donationsFromRoundUp: 20.70, // Sum of all round-ups
  averageOrderValue: 25.00,
  averageDonationPerOrder: 3.40,
  
  // Program Health
  selectionRate: 25.5, // 12 selected / 47 applied
  completionRate: 66.7, // 8 completed / 12 selected
  avgDaysToService: 14,
  
  // Community Impact
  careInterestsServed: ['Cancer recovery', 'Domestic violence', 'Gender transition', 'Mental health', 'Life transitions'],
  locationsServed: 3, // NYC boroughs
};

export default function RoleModelMetricsPage() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ROLE Model Impact</h1>
        <p style={styles.subtitle}>
          Measuring care, connection, and community transformation
        </p>
      </div>

      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{metrics.totalApplications}</div>
          <div style={styles.metricLabel}>Total Applications</div>
          <div style={styles.metricChange}>+12 this month</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{metrics.recipientsSelected}</div>
          <div style={styles.metricLabel}>Recipients Selected</div>
          <div style={styles.metricChange}>Monthly selection</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{metrics.recipientsServed}</div>
          <div style={styles.metricLabel}>Services Completed</div>
          <div style={styles.metricChange}>66.7% completion rate</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>${metrics.totalValueProvided.toLocaleString()}</div>
          <div style={styles.metricLabel}>Total Value Provided</div>
          <div style={styles.metricChange}>$300 avg per service</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{metrics.professionalsParticipating}</div>
          <div style={styles.metricLabel}>Pros Participating</div>
          <div style={styles.metricChange}>Approved & active</div>
        </div>
        <div style={styles.metricCard}>
          <div style={styles.metricValue}>{metrics.storiesShared}</div>
          <div style={styles.metricLabel}>Stories Celebrated</div>
          <div style={styles.metricChange}>With consent</div>
        </div>
      </div>

      {/* Wear Care Impact Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Wear Care Impact</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.totalOrders}</div>
            <div style={styles.metricLabel}>Total Orders</div>
            <div style={styles.metricChange}>From merch shop</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>${metrics.totalRevenue.toLocaleString()}</div>
            <div style={styles.metricLabel}>Total Revenue</div>
            <div style={styles.metricChange}>From Wear Care</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>${metrics.totalDonations.toFixed(2)}</div>
            <div style={styles.metricLabel}>Total Donations</div>
            <div style={styles.metricChange}>10% + round-ups</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>${metrics.donationsFromPercent.toFixed(2)}</div>
            <div style={styles.metricLabel}>From 10% Donation</div>
            <div style={styles.metricChange}>Base price percentage</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>${metrics.donationsFromRoundUp.toFixed(2)}</div>
            <div style={styles.metricLabel}>From Round-ups</div>
            <div style={styles.metricChange}>Customer round-ups</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>${metrics.averageDonationPerOrder.toFixed(2)}</div>
            <div style={styles.metricLabel}>Avg Donation/Order</div>
            <div style={styles.metricChange}>Per transaction</div>
          </div>
        </div>
      </div>

      {/* People Impact Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>People Impact</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.nominationsReceived}</div>
            <div style={styles.metricLabel}>Nominations Received</div>
            <div style={styles.metricChange}>Community-driven</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.locationsServed}</div>
            <div style={styles.metricLabel}>Locations Served</div>
            <div style={styles.metricChange}>NYC boroughs</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.avgDaysToService}</div>
            <div style={styles.metricLabel}>Avg Days to Service</div>
            <div style={styles.metricChange}>From selection</div>
          </div>
        </div>
      </div>

      {/* Care Interests Served */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Care Interests Served</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          {metrics.careInterestsServed.map((interest, i) => (
            <div key={i} style={{
              padding: '1rem 1.5rem',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '8px',
              color: '#10b981',
              fontWeight: '500',
            }}>
              {interest}
            </div>
          ))}
        </div>
      </div>

      {/* Program Health */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Program Health</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.selectionRate}%</div>
            <div style={styles.metricLabel}>Selection Rate</div>
            <div style={styles.metricChange}>Applications → Selected</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricValue}>{metrics.completionRate}%</div>
            <div style={styles.metricLabel}>Completion Rate</div>
            <div style={styles.metricChange}>Selected → Served</div>
          </div>
        </div>
      </div>

      {/* Future Visualizations */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Trends & Growth</h2>
        <div style={styles.chartPlaceholder}>
          📈 Monthly application trends, service completion timeline, and impact growth charts coming soon
        </div>
      </div>
    </div>
  );
}

