import React, { useState, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { services, formatPrice, formatDuration } from '../data/services';

const client = generateClient();

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
  
  // Summary cards
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  summaryCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  summaryCardHighlight: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
    borderColor: 'rgba(233,69,96,0.3)',
  },
  summaryIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  summaryValueSecondary: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#4caf50',
  },
  summaryLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.5rem',
  },
  summaryChange: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  summaryChangePositive: {
    color: '#4caf50',
  },
  summaryChangeNegative: {
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
  
  // Revenue breakdown
  revenueBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  revenueItem: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  revenueItemLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  revenueItemValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  revenueItemPercent: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Service breakdown
  serviceBreakdown: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  serviceRow: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto auto',
    gap: '1rem',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
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
  trHover: {
    background: 'rgba(255,255,255,0.02)',
  },
  
  // Chart placeholder
  chartPlaceholder: {
    height: '300px',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
  },
  
  // Top performers
  performerList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  performerItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
  },
  performerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  performerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  performerName: {
    fontWeight: '500',
  },
  performerStats: {
    textAlign: 'right',
  },
  performerValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4caf50',
  },
  performerLabel: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
  },
};

// ============ MOCK DATA ============
// This will be replaced with real data from RDS/Bookings
const generateMockRevenueData = (timeRange) => {
  const months = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
  const now = new Date();
  
  // Generate monthly revenue
  const monthlyRevenue = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const bookings = Math.floor(Math.random() * 50) + 20;
    const revenue = bookings * (35 + Math.random() * 40); // $35-$75 per booking
    
    monthlyRevenue.push({
      month: date.toISOString().slice(0, 7),
      monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      bookings,
      revenue: Math.round(revenue),
      avgBookingValue: Math.round(revenue / bookings),
    });
  }
  
  // Calculate totals
  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = monthlyRevenue.reduce((sum, m) => sum + m.bookings, 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  // Revenue by service
  const revenueByService = services.map(service => {
    const serviceBookings = Math.floor(totalBookings * (0.1 + Math.random() * 0.2));
    const serviceRevenue = serviceBookings * service.totalRevenue;
    return {
      ...service,
      bookings: serviceBookings,
      revenue: Math.round(serviceRevenue),
      percentOfTotal: totalRevenue > 0 ? (serviceRevenue / totalRevenue * 100).toFixed(1) : 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);
  
  // Revenue breakdown (from pros vs models)
  const revenueFromPros = revenueByService.reduce((sum, s) => 
    sum + (s.bookings * s.professionalFee), 0
  );
  const revenueFromModels = revenueByService.reduce((sum, s) => 
    sum + (s.bookings * s.modelFee), 0
  );
  
  // Top professionals (mock)
  const topProfessionals = [
    { id: 'pro-1', name: 'Sarah Mitchell', bookings: 45, revenue: 1890, avgRevenue: 42 },
    { id: 'pro-2', name: 'Mike Thompson', bookings: 38, revenue: 1596, avgRevenue: 42 },
    { id: 'pro-3', name: 'Lisa Kim', bookings: 32, revenue: 1344, avgRevenue: 42 },
    { id: 'pro-4', name: 'James Wilson', bookings: 28, revenue: 1176, avgRevenue: 42 },
    { id: 'pro-5', name: 'Emma Davis', bookings: 25, revenue: 1050, avgRevenue: 42 },
  ];
  
  // Top models (mock)
  const topModels = [
    { id: 'model-1', name: 'Emma Johnson', bookings: 12, completed: 11, avgScore: 92 },
    { id: 'model-2', name: 'Sophia Lee', bookings: 10, completed: 10, avgScore: 89 },
    { id: 'model-3', name: 'Olivia Martinez', bookings: 9, completed: 8, avgScore: 87 },
    { id: 'model-4', name: 'Isabella Garcia', bookings: 8, completed: 8, avgScore: 85 },
    { id: 'model-5', name: 'Ava Rodriguez', bookings: 7, completed: 7, avgScore: 88 },
  ];
  
  return {
    monthlyRevenue,
    totalRevenue,
    totalBookings,
    avgBookingValue,
    revenueByService,
    revenueFromPros,
    revenueFromModels,
    topProfessionals,
    topModels,
  };
};

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState('12m');
  const [loading, setLoading] = useState(false);
  
  // Generate mock data based on time range
  const revenueData = useMemo(() => {
    return generateMockRevenueData(timeRange);
  }, [timeRange]);
  
  const {
    monthlyRevenue,
    totalRevenue,
    totalBookings,
    avgBookingValue,
    revenueByService,
    revenueFromPros,
    revenueFromModels,
    topProfessionals,
    topModels,
  } = revenueData;
  
  // Calculate growth (mock - would come from comparing periods)
  const revenueGrowth = 12.5; // %
  const bookingsGrowth = 8.3; // %
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Revenue Tracker 💰</h1>
          <p style={styles.subtitle}>Track revenue, bookings, and platform performance</p>
        </div>
        
        {/* Time Range Selector */}
        <div style={styles.timeRangeSelector}>
          {['3m', '6m', '12m'].map(range => (
            <button
              key={range}
              style={{
                ...styles.timeRangeBtn,
                ...(timeRange === range ? styles.timeRangeBtnActive : {}),
              }}
              onClick={() => setTimeRange(range)}
            >
              {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '12 Months'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.summaryCard, ...styles.summaryCardHighlight }}>
          <div style={styles.summaryIcon}>💰</div>
          <div style={styles.summaryValue}>{formatPrice(totalRevenue)}</div>
          <div style={styles.summaryLabel}>Total Revenue</div>
          <div style={{ ...styles.summaryChange, ...styles.summaryChangePositive }}>
            <span>↑</span>
            <span>{revenueGrowth}% vs previous period</span>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📅</div>
          <div style={styles.summaryValue}>{totalBookings}</div>
          <div style={styles.summaryLabel}>Total Bookings</div>
          <div style={{ ...styles.summaryChange, ...styles.summaryChangePositive }}>
            <span>↑</span>
            <span>{bookingsGrowth}% vs previous period</span>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>📊</div>
          <div style={styles.summaryValue}>{formatPrice(avgBookingValue)}</div>
          <div style={styles.summaryLabel}>Avg Booking Value</div>
          <div style={styles.summaryChange}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Per booking</span>
          </div>
        </div>
        
        <div style={styles.summaryCard}>
          <div style={styles.summaryIcon}>🎯</div>
          <div style={{ ...styles.summaryValue, color: '#4caf50' }}>
            {((totalBookings / (timeRange === '3m' ? 90 : timeRange === '6m' ? 180 : 365)) * 30).toFixed(1)}
          </div>
          <div style={styles.summaryLabel}>Avg Bookings/Month</div>
          <div style={styles.summaryChange}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Projected monthly</span>
          </div>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <span>💵</span> Revenue Breakdown
            </div>
            <div style={styles.cardSubtitle}>Platform revenue from professionals and models</div>
          </div>
        </div>
        
        <div style={styles.revenueBreakdown}>
          <div style={styles.revenueItem}>
            <div style={styles.revenueItemLabel}>From Professionals</div>
            <div style={{ ...styles.revenueItemValue, color: '#667eea' }}>
              {formatPrice(revenueFromPros)}
            </div>
            <div style={styles.revenueItemPercent}>
              {((revenueFromPros / totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </div>
          
          <div style={styles.revenueItem}>
            <div style={styles.revenueItemLabel}>From Models</div>
            <div style={{ ...styles.revenueItemValue, color: '#4caf50' }}>
              {formatPrice(revenueFromModels)}
            </div>
            <div style={styles.revenueItemPercent}>
              {((revenueFromModels / totalRevenue) * 100).toFixed(1)}% of total
            </div>
          </div>
          
          <div style={styles.revenueItem}>
            <div style={styles.revenueItemLabel}>Total Platform Revenue</div>
            <div style={{ ...styles.revenueItemValue, color: '#e94560' }}>
              {formatPrice(totalRevenue)}
            </div>
            <div style={styles.revenueItemPercent}>
              100% of bookings
            </div>
          </div>
        </div>
      </div>
      
      {/* Two Column Layout */}
      <div style={styles.twoColumn}>
        {/* Revenue by Service */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>🎨</span> Revenue by Service
              </div>
              <div style={styles.cardSubtitle}>Breakdown of revenue by service type</div>
            </div>
          </div>
          
          <div style={styles.serviceBreakdown}>
            {revenueByService.map(service => (
              <div key={service.id} style={styles.serviceRow}>
                <div style={styles.serviceIcon}>{service.icon}</div>
                <div>
                  <div style={styles.serviceName}>{service.name}</div>
                  <div style={styles.serviceStatLabel}>
                    {service.bookings} booking{service.bookings !== 1 ? 's' : ''}
                  </div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '600', color: '#e94560' }}>
                    {formatPrice(service.revenue)}
                  </div>
                  <div style={styles.serviceStatLabel}>{service.percentOfTotal}%</div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '500' }}>
                    {formatPrice(service.professionalFee)}
                  </div>
                  <div style={styles.serviceStatLabel}>Per booking</div>
                </div>
                <div style={styles.serviceStat}>
                  <div style={{ fontWeight: '500', color: '#4caf50' }}>
                    {formatPrice(service.totalRevenue)}
                  </div>
                  <div style={styles.serviceStatLabel}>Total/booking</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Monthly Revenue Chart */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>📈</span> Monthly Revenue Trend
              </div>
              <div style={styles.cardSubtitle}>Revenue and bookings over time</div>
            </div>
          </div>
          
          <div style={styles.chartPlaceholder}>
            📊 Chart visualization coming soon
            <br />
            <span style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>
              (Will show line/bar chart of monthly revenue)
            </span>
          </div>
          
          {/* Monthly Table */}
          <div style={{ marginTop: '1.5rem' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Month</th>
                  <th style={styles.th}>Revenue</th>
                  <th style={styles.th}>Bookings</th>
                  <th style={styles.th}>Avg Value</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenue.slice(-6).map((month, i) => (
                  <tr key={i}>
                    <td style={styles.td}>{month.monthName}</td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: '600', color: '#e94560' }}>
                        {formatPrice(month.revenue)}
                      </span>
                    </td>
                    <td style={styles.td}>{month.bookings}</td>
                    <td style={styles.td}>{formatPrice(month.avgBookingValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Top Performers */}
      <div style={styles.twoColumn}>
        {/* Top Professionals */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>👑</span> Top Professionals
              </div>
              <div style={styles.cardSubtitle}>Highest revenue generating professionals</div>
            </div>
          </div>
          
          <div style={styles.performerList}>
            {topProfessionals.map((pro, i) => (
              <div key={pro.id} style={styles.performerItem}>
                <div style={styles.performerInfo}>
                  <div style={styles.performerAvatar}>
                    {pro.name.charAt(0)}
                  </div>
                  <div>
                    <div style={styles.performerName}>{pro.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {pro.bookings} booking{pro.bookings !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div style={styles.performerStats}>
                  <div style={styles.performerValue}>{formatPrice(pro.revenue)}</div>
                  <div style={styles.performerLabel}>
                    {formatPrice(pro.avgRevenue)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Models */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <div style={styles.cardTitle}>
                <span>⭐</span> Top Models
              </div>
              <div style={styles.cardSubtitle}>Most active and highest-rated models</div>
            </div>
          </div>
          
          <div style={styles.performerList}>
            {topModels.map((model, i) => (
              <div key={model.id} style={styles.performerItem}>
                <div style={styles.performerInfo}>
                  <div style={styles.performerAvatar}>
                    {model.name.charAt(0)}
                  </div>
                  <div>
                    <div style={styles.performerName}>{model.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                      {model.completed}/{model.bookings} completed
                    </div>
                  </div>
                </div>
                <div style={styles.performerStats}>
                  <div style={{ ...styles.performerValue, color: '#ffc107' }}>
                    {model.avgScore}%
                  </div>
                  <div style={styles.performerLabel}>
                    Avg match score
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed Monthly Revenue Table */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>
              <span>📋</span> Detailed Monthly Breakdown
            </div>
            <div style={styles.cardSubtitle}>Complete revenue and booking data by month</div>
          </div>
        </div>
        
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Month</th>
              <th style={styles.th}>Total Revenue</th>
              <th style={styles.th}>Bookings</th>
              <th style={styles.th}>Avg Booking Value</th>
              <th style={styles.th}>From Pros</th>
              <th style={styles.th}>From Models</th>
            </tr>
          </thead>
          <tbody>
            {monthlyRevenue.map((month, i) => {
              const monthProRevenue = Math.round(month.revenue * 0.55); // Approx 55% from pros
              const monthModelRevenue = month.revenue - monthProRevenue;
              
              return (
                <tr key={i}>
                  <td style={styles.td}>
                    <strong>{month.monthName}</strong>
                  </td>
                  <td style={styles.td}>
                    <span style={{ fontWeight: '600', color: '#e94560' }}>
                      {formatPrice(month.revenue)}
                    </span>
                  </td>
                  <td style={styles.td}>{month.bookings}</td>
                  <td style={styles.td}>{formatPrice(month.avgBookingValue)}</td>
                  <td style={styles.td}>
                    <span style={{ color: '#667eea' }}>
                      {formatPrice(monthProRevenue)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ color: '#4caf50' }}>
                      {formatPrice(monthModelRevenue)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
