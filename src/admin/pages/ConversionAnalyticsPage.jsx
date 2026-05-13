import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
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
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Two column
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  tableCell: {
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
  },
  tableRow: {
    transition: 'background 0.2s',
  },
  tableRowHover: {
    background: 'rgba(255,255,255,0.03)',
  },
  
  // Badge
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeHigh: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  badgeMedium: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  badgeLow: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
  
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.5)',
  },
  error: {
    padding: '1rem',
    background: 'rgba(244,67,54,0.1)',
    border: '1px solid rgba(244,67,54,0.3)',
    borderRadius: '8px',
    color: '#f44336',
    marginBottom: '1rem',
  },
};

export default function ConversionAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [conversionData, setConversionData] = useState(null);

  useEffect(() => {
    loadConversionData();
  }, []);

  const loadConversionData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all matches
      const { data: matches, errors: matchesError } = await client.models.Match.list();
      if (matchesError) throw new Error(`Error loading matches: ${matchesError[0]?.message}`);
      
      // Load all bookings
      const { data: bookings, errors: bookingsError } = await client.models.Booking.list();
      if (bookingsError) throw new Error(`Error loading bookings: ${bookingsError[0]?.message}`);
      
      // Calculate conversion metrics
      const totalMatches = matches?.length || 0;
      const convertedMatches = matches?.filter(m => m.bookingId) || [];
      const convertedCount = convertedMatches.length;
      const conversionRate = totalMatches > 0 ? (convertedCount / totalMatches * 100).toFixed(1) : 0;
      
      const normalizeMatchStatus = (status) => {
        if (!status || status === 'pending' || status === 'approved') return 'sent';
        return status;
      };

      // Conversion by status
      const statusConversion = {};
      matches?.forEach(match => {
        const rawStatus = match.status ? String(match.status).toLowerCase() : null;
        const status = normalizeMatchStatus(rawStatus);
        if (!statusConversion[status]) {
          statusConversion[status] = { total: 0, converted: 0 };
        }
        statusConversion[status].total++;
        if (match.bookingId) {
          statusConversion[status].converted++;
        }
      });
      
      // Conversion by score ranges
      const scoreRanges = [
        { label: '90-100', min: 90, max: 100 },
        { label: '80-89', min: 80, max: 89 },
        { label: '70-79', min: 70, max: 79 },
        { label: '60-69', min: 60, max: 69 },
        { label: 'Below 60', min: 0, max: 59 },
      ];
      
      const scoreConversion = scoreRanges.map(range => {
        const rangeMatches = matches?.filter(m => {
          const score = m.matchScore || 0;
          return score >= range.min && score <= range.max;
        }) || [];
        const converted = rangeMatches.filter(m => m.bookingId).length;
        return {
          range: range.label,
          total: rangeMatches.length,
          converted,
          rate: rangeMatches.length > 0 ? (converted / rangeMatches.length * 100).toFixed(1) : 0,
        };
      });
      
      // Funnel analysis
      const funnel = {
        sent: matches?.filter(m => normalizeMatchStatus(m.status) === 'sent').length || 0,
        accepted: matches?.filter(m => m.status === 'accepted').length || 0,
        declined: matches?.filter(m => m.status === 'declined').length || 0,
        expired: matches?.filter(m => m.status === 'expired').length || 0,
        converted: convertedCount,
      };
      
      setConversionData({
        totalMatches,
        convertedCount,
        conversionRate: parseFloat(conversionRate),
        statusConversion,
        scoreConversion,
        funnel,
        totalBookings: bookings?.length || 0,
      });
      
    } catch (err) {
      console.error('Error loading conversion data:', err);
      setError(err.message || 'Failed to load conversion data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading conversion analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button 
          onClick={loadConversionData}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#e94560',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const getConversionBadge = (rate) => {
    if (rate >= 30) return { style: styles.badgeHigh, label: 'High' };
    if (rate >= 15) return { style: styles.badgeMedium, label: 'Medium' };
    return { style: styles.badgeLow, label: 'Low' };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Match-to-Booking Conversion Analytics</h1>
        <p style={styles.subtitle}>Track how matches convert to confirmed bookings</p>
      </div>

      {/* Key Metrics */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>🎯</div>
          <div style={styles.statValue}>{conversionData.totalMatches}</div>
          <div style={styles.statLabel}>Total Matches</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statValue}>{conversionData.convertedCount}</div>
          <div style={styles.statLabel}>Converted to Bookings</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statValue}>{conversionData.conversionRate}%</div>
          <div style={styles.statLabel}>Conversion Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📅</div>
          <div style={styles.statValue}>{conversionData.totalBookings}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumn}>
        {/* Conversion by Status */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <span>📈</span> Conversion by Match Status
          </h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Total</th>
                <th style={styles.tableHeader}>Converted</th>
                <th style={styles.tableHeader}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(conversionData.statusConversion).map(([status, data]) => {
                const rate = data.total > 0 ? (data.converted / data.total * 100).toFixed(1) : 0;
                const badge = getConversionBadge(parseFloat(rate));
                return (
                  <tr key={status} style={styles.tableRow}>
                    <td style={styles.tableCell}>{status.charAt(0).toUpperCase() + status.slice(1)}</td>
                    <td style={styles.tableCell}>{data.total}</td>
                    <td style={styles.tableCell}>{data.converted}</td>
                    <td style={styles.tableCell}>
                      <span style={badge.style}>{rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Conversion by Score Range */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <span>⭐</span> Conversion by Match Score
          </h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Score Range</th>
                <th style={styles.tableHeader}>Total</th>
                <th style={styles.tableHeader}>Converted</th>
                <th style={styles.tableHeader}>Rate</th>
              </tr>
            </thead>
            <tbody>
              {conversionData.scoreConversion.map((data) => {
                const badge = getConversionBadge(parseFloat(data.rate));
                return (
                  <tr key={data.range} style={styles.tableRow}>
                    <td style={styles.tableCell}>{data.range}</td>
                    <td style={styles.tableCell}>{data.total}</td>
                    <td style={styles.tableCell}>{data.converted}</td>
                    <td style={styles.tableCell}>
                      <span style={badge.style}>{data.rate}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <span>🔽</span> Conversion Funnel
          </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {conversionData.funnel.sent}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Sent</div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {conversionData.funnel.accepted}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Accepted</div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {conversionData.funnel.declined}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Declined</div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem' }}>
              {conversionData.funnel.expired}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Expired</div>
          </div>
          <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.3)' }}>→</div>
          <div style={{ flex: 1, minWidth: '120px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.25rem', color: '#4caf50' }}>
              {conversionData.funnel.converted}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Booked</div>
          </div>
        </div>
      </div>
    </div>
  );
}

