import React, { useState, useEffect } from 'react';

/**
 * Monitoring Page
 * 
 * Displays CloudWatch metrics and CloudTrail security logs
 */
export default function MonitoringPage() {
  const [activeTab, setActiveTab] = useState('costs');
  const [timeRange, setTimeRange] = useState('24h');

  const styles = {
    container: {
      padding: '2rem',
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
      borderBottom: '2px solid transparent',
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    tabActive: {
      color: '#e94560',
      borderBottomColor: '#e94560',
    },
    timeRangeSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    timeRangeBtn: {
      padding: '0.5rem 1rem',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '6px',
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.85rem',
      cursor: 'pointer',
    },
    timeRangeBtnActive: {
      background: 'rgba(233,69,96,0.2)',
      borderColor: '#e94560',
      color: '#e94560',
    },
    card: {
      background: 'rgba(22,27,34,0.8)',
      border: '1px solid rgba(48,54,61,0.8)',
      borderRadius: '12px',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    cardTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    metricGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
    },
    metricCard: {
      background: 'rgba(48,54,61,0.5)',
      borderRadius: '8px',
      padding: '1rem',
    },
    metricLabel: {
      fontSize: '0.75rem',
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      marginBottom: '0.5rem',
    },
    metricValue: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#fff',
    },
    metricChange: {
      fontSize: '0.75rem',
      marginTop: '0.25rem',
    },
    positive: {
      color: '#3fb950',
    },
    negative: {
      color: '#f85149',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      textAlign: 'left',
      padding: '0.75rem',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    td: {
      padding: '0.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      fontSize: '0.85rem',
    },
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
    },
    badgeSuccess: {
      background: 'rgba(63,185,80,0.2)',
      color: '#3fb950',
    },
    badgeError: {
      background: 'rgba(248,81,73,0.2)',
      color: '#f85149',
    },
    badgeWarning: {
      background: 'rgba(255,193,7,0.2)',
      color: '#ffc107',
    },
    link: {
      color: '#58a6ff',
      textDecoration: 'none',
      fontSize: '0.85rem',
    },
  };

  // Mock data - replace with actual CloudWatch/CloudTrail queries
  const costMetrics = {
    total: 29.20,
    change: 2.5,
    breakdown: {
      lambda: 12.50,
      dynamodb: 8.20,
      s3: 3.40,
      appsync: 5.10,
    },
  };

  const performanceMetrics = {
    apiLatency: 120,
    errorRate: 0.2,
    activeUsers: 45,
    bookingsToday: 8,
  };

  const securityEvents = [
    {
      timestamp: '2024-12-15 10:23 AM',
      user: 'yasmeen@modeled.com',
      action: 'ConsoleLogin',
      service: 'signin.amazonaws.com',
      ipAddress: '192.168.1.1',
      success: true,
    },
    {
      timestamp: '2024-12-15 10:25 AM',
      user: 'yasmeen@modeled.com',
      action: 'CreateBooking',
      service: 'appsync',
      resource: 'booking-123',
      success: true,
    },
    {
      timestamp: '2024-12-15 10:26 AM',
      user: 'system',
      action: 'ProcessPayment',
      service: 'lambda',
      resource: 'stripe-payment',
      success: true,
    },
    {
      timestamp: '2024-12-14 3:45 PM',
      user: 'unknown@email.com',
      action: 'ConsoleLogin',
      service: 'signin.amazonaws.com',
      ipAddress: '10.0.0.1',
      success: false,
      errorCode: 'InvalidCredentials',
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Monitoring & Security 📊</h1>
        <p style={styles.subtitle}>Track costs, performance, and security events</p>
      </div>

      <div style={styles.tabs}>
        {['costs', 'performance', 'security'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.timeRangeSelector}>
        {['1h', '24h', '7d', '30d'].map(range => (
          <button
            key={range}
            style={{
              ...styles.timeRangeBtn,
              ...(timeRange === range ? styles.timeRangeBtnActive : {}),
            }}
            onClick={() => setTimeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Costs Tab */}
      {activeTab === 'costs' && (
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Cost Overview</h2>
            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Total This Month</div>
                <div style={styles.metricValue}>${costMetrics.total.toFixed(2)}</div>
                <div style={{ ...styles.metricChange, ...styles.positive }}>
                  +${costMetrics.change.toFixed(2)} from last month
                </div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Lambda</div>
                <div style={styles.metricValue}>${costMetrics.breakdown.lambda.toFixed(2)}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>DynamoDB</div>
                <div style={styles.metricValue}>${costMetrics.breakdown.dynamodb.toFixed(2)}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>S3 Storage</div>
                <div style={styles.metricValue}>${costMetrics.breakdown.s3.toFixed(2)}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>AppSync</div>
                <div style={styles.metricValue}>${costMetrics.breakdown.appsync.toFixed(2)}</div>
              </div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <a
                href="https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=ModeledManagement-Main"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                → View Full Dashboard in CloudWatch
              </a>
            </div>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Alarms</h2>
            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Billing Threshold</div>
                <div style={styles.metricValue}>$100/month</div>
                <div style={{ ...styles.metricChange, ...styles.positive }}>
                  ✅ Under threshold
                </div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Error Rate</div>
                <div style={styles.metricValue}>0.2%</div>
                <div style={{ ...styles.metricChange, ...styles.positive }}>
                  ✅ Normal
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Performance Metrics</h2>
            <div style={styles.metricGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>API Latency (avg)</div>
                <div style={styles.metricValue}>{performanceMetrics.apiLatency}ms</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Error Rate</div>
                <div style={styles.metricValue}>{performanceMetrics.errorRate}%</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Active Users (today)</div>
                <div style={styles.metricValue}>{performanceMetrics.activeUsers}</div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Bookings (today)</div>
                <div style={styles.metricValue}>{performanceMetrics.bookingsToday}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Security Events (Last 24 Hours)</h2>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Service</th>
                  <th style={styles.th}>IP Address</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {securityEvents.map((event, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{event.timestamp}</td>
                    <td style={styles.td}>{event.user}</td>
                    <td style={styles.td}>{event.action}</td>
                    <td style={styles.td}>{event.service}</td>
                    <td style={styles.td}>{event.ipAddress}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          ...(event.success ? styles.badgeSuccess : styles.badgeError),
                        }}
                      >
                        {event.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '1.5rem' }}>
              <a
                href="https://console.aws.amazon.com/cloudtrail/home?region=us-east-1"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                → View Full CloudTrail Logs
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

