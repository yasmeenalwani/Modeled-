import React, { useState, useMemo } from 'react';
import { services, formatPrice } from '../data/services';

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
  metricChangePositive: {
    color: '#4caf50',
  },
  metricChangeNegative: {
    color: '#e94560',
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
  
  // Chart placeholder
  chartPlaceholder: {
    height: '250px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  
  // Trend indicators
  trendIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
  },
  trendUp: {
    color: '#4caf50',
  },
  trendDown: {
    color: '#e94560',
  },
  trendNeutral: {
    color: 'rgba(255,255,255,0.4)',
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
  
  // Service breakdown
  serviceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  // Service trend row
  serviceTrendRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto auto',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  serviceIcon: {
    fontSize: '1.5rem',
  },
  serviceName: {
    fontWeight: '500',
  },
  serviceStat: {
    textAlign: 'right',
    fontSize: '0.9rem',
  },
  serviceStatLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginTop: '0.25rem',
  },
  
  // Conversion funnel
  funnel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  funnelStep: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
  },
  funnelStepLabel: {
    fontWeight: '500',
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
  
  // Insight cards
  insightCard: {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(102,126,234,0.05))',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '10px',
    padding: '1rem',
    marginBottom: '0.75rem',
  },
  insightTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#667eea',
  },
  insightText: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.5',
  },
};

// ============ MOCK DATA GENERATORS ============
const generateTrendData = (timeRange) => {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const now = new Date();
  
  // Daily request trends
  const dailyTrends = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const requestsCreated = Math.floor(Math.random() * 8) + 2;
    const requestsBooked = Math.floor(requestsCreated * (0.6 + Math.random() * 0.2));
    const requestsCompleted = Math.floor(requestsBooked * (0.85 + Math.random() * 0.1));
    const avgMatchScore = 70 + Math.random() * 20;
    const waitlistCount = Math.floor(requestsCreated * 0.3);
    
    dailyTrends.push({
      date: date.toISOString().slice(0, 10),
      requestsCreated,
      requestsBooked,
      requestsCompleted,
      avgMatchScore: Math.round(avgMatchScore),
      waitlistCount,
      conversionRate: ((requestsBooked / requestsCreated) * 100).toFixed(1),
    });
  }
  
  // Weekly match conversion
  const weeks = Math.ceil(days / 7);
  const weeklyConversion = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    
    const matchesSent = Math.floor(Math.random() * 50) + 20;
    const matchesAccepted = Math.floor(matchesSent * (0.35 + Math.random() * 0.15));
    const matchesWaitlisted = Math.floor(matchesSent * (0.15 + Math.random() * 0.1));
    const matchesDeclined = matchesSent - matchesAccepted - matchesWaitlisted;
    const conversionRate = ((matchesAccepted / matchesSent) * 100).toFixed(1);
    const avgScore = 75 + Math.random() * 15;
    
    weeklyConversion.push({
      week: weekStart.toISOString().slice(0, 10),
      weekLabel: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      matchesSent,
      matchesAccepted,
      matchesWaitlisted,
      matchesDeclined,
      conversionRate: parseFloat(conversionRate),
      avgScore: Math.round(avgScore),
    });
  }
  
  // Service performance trends
  const serviceTrends = services.map(service => {
    const totalBookings = Math.floor(Math.random() * 40) + 10;
    const completed = Math.floor(totalBookings * (0.88 + Math.random() * 0.08));
    const cancelled = totalBookings - completed;
    const avgRevenue = service.totalRevenue;
    const totalRevenue = completed * avgRevenue;
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const trendPercent = (Math.random() * 15 + 5).toFixed(1);
    
    return {
      ...service,
      totalBookings,
      completed,
      cancelled,
      avgRevenue,
      totalRevenue: Math.round(totalRevenue),
      trend,
      trendPercent: parseFloat(trendPercent),
    };
  }).sort((a, b) => b.totalBookings - a.totalBookings);
  
  // Calculate totals
  const totalRequests = dailyTrends.reduce((sum, d) => sum + d.requestsCreated, 0);
  const totalBookings = dailyTrends.reduce((sum, d) => sum + d.requestsBooked, 0);
  const totalCompleted = dailyTrends.reduce((sum, d) => sum + d.requestsCompleted, 0);
  const avgConversionRate = ((totalBookings / totalRequests) * 100).toFixed(1);
  const overallAvgScore = Math.round(
    dailyTrends.reduce((sum, d) => sum + d.avgMatchScore, 0) / dailyTrends.length
  );
  
  // Popular times
  const popularDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => ({
    day,
    bookings: Math.floor(Math.random() * 15) + 5,
  })).sort((a, b) => b.bookings - a.bookings);
  
  const popularTimes = ['9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm'].map(time => ({
    time,
    bookings: Math.floor(Math.random() * 20) + 3,
  })).sort((a, b) => b.bookings - a.bookings);
  
  return {
    dailyTrends,
    weeklyConversion,
    serviceTrends,
    totalRequests,
    totalBookings,
    totalCompleted,
    avgConversionRate: parseFloat(avgConversionRate),
    overallAvgScore,
    popularDays,
    popularTimes,
  };
};

export default function TrendsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  const trendData = useMemo(() => {
    return generateTrendData(timeRange);
  }, [timeRange]);
  
  const {
    dailyTrends,
    weeklyConversion,
    serviceTrends,
    totalRequests,
    totalBookings,
    totalCompleted,
    avgConversionRate,
    overallAvgScore,
    popularDays,
    popularTimes,
  } = trendData;
  
  // Calculate growth rates (mock)
  const requestGrowth = 15.3;
  const bookingGrowth = 12.7;
  const conversionGrowth = 3.2;
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Trend Analysis 📈</h1>
          <p style={styles.subtitle}>Track patterns, conversions, and performance over time</p>
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
      
      {/* Key Metrics */}
      <div style={styles.metricsGrid}>
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📋</div>
          <div style={styles.metricValue}>{totalRequests}</div>
          <div style={styles.metricLabel}>Total Requests</div>
          <div style={{ ...styles.metricChange, ...styles.metricChangePositive }}>
            <span>↑</span>
            <span>{requestGrowth}% vs previous period</span>
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>📅</div>
          <div style={styles.metricValue}>{totalBookings}</div>
          <div style={styles.metricLabel}>Total Bookings</div>
          <div style={{ ...styles.metricChange, ...styles.metricChangePositive }}>
            <span>↑</span>
            <span>{bookingGrowth}% vs previous period</span>
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>✅</div>
          <div style={styles.metricValue}>{avgConversionRate}%</div>
          <div style={styles.metricLabel}>Conversion Rate</div>
          <div style={{ ...styles.metricChange, ...styles.metricChangePositive }}>
            <span>↑</span>
            <span>{conversionGrowth}% vs previous period</span>
          </div>
        </div>
        
        <div style={styles.metricCard}>
          <div style={styles.metricIcon}>🎯</div>
          <div style={styles.metricValue}>{overallAvgScore}</div>
          <div style={styles.metricLabel}>Avg Match Score</div>
          <div style={styles.metricChange}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Quality indicator</span>
          </div>
        </div>
      </div>
      
      {/* Two Column: Request Trends & Conversion Funnel */}
      <div style={styles.twoColumn}>
        {/* Request Trends Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📊</span> Request Trends
              </div>
              <div style={styles.cardSubtitle}>Daily request volume and booking conversion</div>
            </div>
          </div>
          
          <div style={styles.chartPlaceholder}>
            📈 Line chart showing daily requests and bookings
            <br />
            <span style={{ fontSize: '0.75rem' }}>
              (Will visualize request volume, bookings, and conversion trends)
            </span>
          </div>
          
          {/* Recent Days Table */}
          <div style={{ marginTop: '1.5rem' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Requests</th>
                  <th style={styles.th}>Booked</th>
                  <th style={styles.th}>Converted</th>
                  <th style={styles.th}>Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrends.slice(-7).map((day, i) => (
                  <tr key={i}>
                    <td style={styles.td}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td style={styles.td}>{day.requestsCreated}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#4caf50' }}>
                        {day.requestsBooked}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: '#667eea' }}>{day.conversionRate}%</span>
                    </td>
                    <td style={styles.td}>{day.avgMatchScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Conversion Funnel */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>🔄</span> Conversion Funnel
              </div>
              <div style={styles.cardSubtitle}>Request to booking conversion pipeline</div>
            </div>
          </div>
          
          <div style={styles.funnel}>
            <div style={styles.funnelStep}>
              <div style={styles.funnelStepLabel}>Requests Created</div>
              <div>
                <span style={styles.funnelStepValue}>{totalRequests}</span>
                <span style={styles.funnelStepPercent}>100%</span>
              </div>
            </div>
            
            <div style={styles.funnelStep}>
              <div style={styles.funnelStepLabel}>Matches Sent</div>
              <div>
                <span style={styles.funnelStepValue}>
                  {Math.round(totalRequests * 1.5)}
                </span>
                <span style={styles.funnelStepPercent}>
                  {((Math.round(totalRequests * 1.5) / totalRequests) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
            
            <div style={styles.funnelStep}>
              <div style={styles.funnelStepLabel}>Bookings Confirmed</div>
              <div>
                <span style={styles.funnelStepValue}>{totalBookings}</span>
                <span style={styles.funnelStepPercent}>
                  {avgConversionRate}%
                </span>
              </div>
            </div>
            
            <div style={styles.funnelStep}>
              <div style={styles.funnelStepLabel}>Completed</div>
              <div>
                <span style={styles.funnelStepValue}>{totalCompleted}</span>
                <span style={styles.funnelStepPercent}>
                  {((totalCompleted / totalBookings) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Insights */}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={styles.insightCard}>
              <div style={styles.insightTitle}>💡 Insight</div>
              <div style={styles.insightText}>
                {avgConversionRate > 60 
                  ? 'Conversion rate is strong! Most requests are successfully converting to bookings.'
                  : 'Consider reviewing match quality or model response rates to improve conversion.'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Match Conversion Rates */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <span>🎯</span> Match Conversion Rates
            </div>
            <div style={styles.cardSubtitle}>Weekly breakdown of match acceptance and conversion</div>
          </div>
        </div>
        
        <div style={styles.chartPlaceholder}>
          📊 Bar/line chart showing weekly match conversion trends
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Week</th>
              <th style={styles.th}>Matches Sent</th>
              <th style={styles.th}>Accepted</th>
              <th style={styles.th}>Waitlisted</th>
              <th style={styles.th}>Declined</th>
              <th style={styles.th}>Conversion Rate</th>
              <th style={styles.th}>Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {weeklyConversion.map((week, i) => (
              <tr key={i}>
                <td style={styles.td}>{week.weekLabel}</td>
                <td style={styles.td}>{week.matchesSent}</td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600', color: '#4caf50' }}>
                    {week.matchesAccepted}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: '#ffc107' }}>{week.matchesWaitlisted}</span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {week.matchesDeclined}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600', color: '#667eea' }}>
                    {week.conversionRate}%
                  </span>
                </td>
                <td style={styles.td}>{week.avgScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Two Column: Service Performance & Popular Times */}
      <div style={styles.twoColumn}>
        {/* Service Performance Trends */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>🎨</span> Service Performance Trends
              </div>
              <div style={styles.cardSubtitle}>Booking trends by service type</div>
            </div>
          </div>
          
          <div style={styles.serviceBreakdown}>
            {serviceTrends.map(service => (
              <div key={service.id} style={styles.serviceTrendRow}>
                <div style={styles.serviceIcon}>{service.icon}</div>
                <div>
                  <div style={styles.serviceName}>{service.name}</div>
                  <div style={styles.serviceStatLabel}>
                    {service.completed}/{service.totalBookings} completed
                  </div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '600', color: '#e94560' }}>
                    {service.totalBookings}
                  </div>
                  <div style={styles.serviceStatLabel}>Bookings</div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '500', color: service.trend === 'up' ? '#4caf50' : '#e94560' }}>
                    {service.trend === 'up' ? '↑' : '↓'} {service.trendPercent}%
                  </div>
                  <div style={styles.serviceStatLabel}>Trend</div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '500', color: '#4caf50' }}>
                    {formatPrice(service.totalRevenue)}
                  </div>
                  <div style={styles.serviceStatLabel}>Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Popular Times */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>⏰</span> Popular Booking Times
              </div>
              <div style={styles.cardSubtitle}>Peak days and times for bookings</div>
            </div>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
              Most Popular Days
            </div>
            {popularDays.map((day, i) => (
              <div key={i} style={styles.funnelStep}>
                <div style={styles.funnelStepLabel}>{day.day}</div>
                <div>
                  <span style={styles.funnelStepValue}>{day.bookings}</span>
                  <span style={styles.funnelStepPercent}>
                    {((day.bookings / popularDays.reduce((sum, d) => sum + d.bookings, 0)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem' }}>
              Most Popular Times
            </div>
            {popularTimes.slice(0, 5).map((time, i) => (
              <div key={i} style={styles.funnelStep}>
                <div style={styles.funnelStepLabel}>{time.time}</div>
                <div>
                  <span style={styles.funnelStepValue}>{time.bookings}</span>
                  <span style={styles.funnelStepPercent}>
                    {((time.bookings / popularTimes.reduce((sum, t) => sum + t.bookings, 0)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed Daily Trends Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <span>📋</span> Detailed Daily Trends
            </div>
            <div style={styles.cardSubtitle}>Complete daily breakdown of requests, bookings, and metrics</div>
          </div>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Requests Created</th>
              <th style={styles.th}>Booked</th>
              <th style={styles.th}>Completed</th>
              <th style={styles.th}>Conversion Rate</th>
              <th style={styles.th}>Avg Match Score</th>
              <th style={styles.th}>Waitlist</th>
            </tr>
          </thead>
          <tbody>
            {dailyTrends.slice(-14).map((day, i) => (
              <tr key={i}>
                <td style={styles.td}>
                  <strong>
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </strong>
                </td>
                <td style={styles.td}>{day.requestsCreated}</td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '600', color: '#4caf50' }}>
                    {day.requestsBooked}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: '#667eea' }}>{day.requestsCompleted}</span>
                </td>
                <td style={styles.td}>
                  <span style={{ fontWeight: '500' }}>{day.conversionRate}%</span>
                </td>
                <td style={styles.td}>{day.avgMatchScore}</td>
                <td style={styles.td}>
                  <span style={{ color: '#ffc107' }}>{day.waitlistCount}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
