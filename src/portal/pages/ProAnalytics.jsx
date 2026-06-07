import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
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
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  periodBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statTrend: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Section
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Performance bars
  performanceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  performanceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  performanceLabel: {
    width: '120px',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  performanceBarContainer: {
    flex: 1,
    height: '24px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  performanceBar: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.5s ease',
  },
  performanceValue: {
    width: '60px',
    textAlign: 'right',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Two column layout
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  
  // Model list
  modelList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  modelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
  },
  modelAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFEF9',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelBookings: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Service breakdown
  serviceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  serviceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
  },
  serviceName: {
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceCount: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Timeline
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  timelineItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: '#8B1E3F',
    marginTop: '4px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ProAnalytics() {
  const { user } = useAuthenticator();
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalBookings: 0,
    matchRate: 0,
    bookingRate: 0,
    avgTimeToMatch: 0,
    avgTimeToBook: 0,
    totalEarnings: 0,
    completedSessions: 0,
  });
  const [topModels, setTopModels] = useState([]);
  const [serviceBreakdown, setServiceBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Get professional profile
      const { data: professionals } = await client.models.Professional.list({
        filter: { userId: { eq: user?.userId } },
      });
      
      if (!professionals || professionals.length === 0) {
        setLoading(false);
        return;
      }
      
      const professional = professionals[0];
      
      // Get requests
      const { data: requests } = await client.models.ModelRequest.list({
        filter: { professionalId: { eq: professional.id } },
        limit: 1000,
      });
      
      // Get bookings
      const { data: bookings } = await client.models.Booking.list({
        filter: { professionalId: { eq: professional.id } },
        limit: 1000,
      });
      
      // Calculate date range based on period
      const now = new Date();
      let startDate = new Date();
      if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarter') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Filter by period
      const periodRequests = (requests || []).filter(r => 
        new Date(r.createdAt) >= startDate
      );
      const periodBookings = (bookings || []).filter(b => 
        new Date(b.createdAt) >= startDate
      );
      
      // Calculate stats
      const matchedRequests = periodRequests.filter(r => 
        ['matched', 'booked', 'completed'].includes(r.status)
      );
      const bookedRequests = periodRequests.filter(r => 
        ['booked', 'completed'].includes(r.status)
      );
      const completedBookings = periodBookings.filter(b => 
        b.status === 'completed'
      );
      
      // Calculate earnings (mock for now)
      const mockEarnings = completedBookings.length * 85; // Average session value
      
      setStats({
        totalRequests: periodRequests.length,
        totalBookings: periodBookings.length,
        matchRate: periodRequests.length > 0 
          ? Math.round((matchedRequests.length / periodRequests.length) * 100) 
          : 0,
        bookingRate: matchedRequests.length > 0 
          ? Math.round((bookedRequests.length / matchedRequests.length) * 100) 
          : 0,
        avgTimeToMatch: 2.4, // Mock: days
        avgTimeToBook: 1.2, // Mock: days
        totalEarnings: mockEarnings,
        completedSessions: completedBookings.length,
      });
      
      // Service breakdown
      const serviceCounts = {};
      periodRequests.forEach(r => {
        const service = r.serviceType || 'Other';
        serviceCounts[service] = (serviceCounts[service] || 0) + 1;
      });
      setServiceBreakdown(
        Object.entries(serviceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
      );
      
      // Top models (mock data for now)
      setTopModels([
        { name: 'Emma Johnson', bookings: 8, rating: 4.9 },
        { name: 'Sophia Martinez', bookings: 6, rating: 4.8 },
        { name: 'Olivia Chen', bookings: 5, rating: 5.0 },
        { name: 'Ava Williams', bookings: 4, rating: 4.7 },
        { name: 'Isabella Taylor', bookings: 3, rating: 4.9 },
      ]);
      
      // Recent activity
      const allActivity = [
        ...periodRequests.map(r => ({
          type: 'request',
          title: `Request created: ${r.serviceType || 'Service'}`,
          date: r.createdAt,
        })),
        ...periodBookings.map(b => ({
          type: 'booking',
          title: `Booking ${b.status}: ${b.serviceType || 'Session'}`,
          date: b.createdAt,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
      
      setRecentActivity(allActivity);
      
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getServiceLabel = (service) => {
    const labels = {
      haircut: 'Haircut',
      color: 'Color',
      highlights: 'Highlights',
      balayage: 'Balayage',
      styling: 'Styling',
      blowout: 'Blowout',
      treatment: 'Treatment',
      makeup: 'Makeup',
    };
    return labels[service] || service || 'Other';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#5A3A2A' }}>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics 📊</h1>
        <p style={styles.subtitle}>Track your performance, bookings, and growth</p>
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
            {p === 'week' ? 'This Week' : 
             p === 'month' ? 'This Month' : 
             p === 'quarter' ? 'This Quarter' : 'This Year'}
          </button>
        ))}
      </div>

      {/* Main Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>
            {stats.totalRequests}
          </div>
          <div style={styles.statLabel}>Total Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>
            {stats.totalBookings}
          </div>
          <div style={styles.statLabel}>Bookings</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#667eea' }}>
            {stats.matchRate}%
          </div>
          <div style={styles.statLabel}>Match Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#f5a623' }}>
            {stats.bookingRate}%
          </div>
          <div style={styles.statLabel}>Booking Rate</div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Performance Metrics</div>
        <div style={styles.performanceList}>
          <div style={styles.performanceItem}>
            <div style={styles.performanceLabel}>Match Rate</div>
            <div style={styles.performanceBarContainer}>
              <div 
                style={{ 
                  ...styles.performanceBar, 
                  width: `${stats.matchRate}%`,
                  background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
                }} 
              />
            </div>
            <div style={styles.performanceValue}>{stats.matchRate}%</div>
          </div>
          <div style={styles.performanceItem}>
            <div style={styles.performanceLabel}>Booking Rate</div>
            <div style={styles.performanceBarContainer}>
              <div 
                style={{ 
                  ...styles.performanceBar, 
                  width: `${stats.bookingRate}%`,
                  background: 'linear-gradient(90deg, #4caf50, #81c784)',
                }} 
              />
            </div>
            <div style={styles.performanceValue}>{stats.bookingRate}%</div>
          </div>
          <div style={styles.performanceItem}>
            <div style={styles.performanceLabel}>Completion</div>
            <div style={styles.performanceBarContainer}>
              <div 
                style={{ 
                  ...styles.performanceBar, 
                  width: `${stats.totalBookings > 0 ? Math.round((stats.completedSessions / stats.totalBookings) * 100) : 0}%`,
                  background: 'linear-gradient(90deg, #667eea, #9c88ff)',
                }} 
              />
            </div>
            <div style={styles.performanceValue}>
              {stats.totalBookings > 0 ? Math.round((stats.completedSessions / stats.totalBookings) * 100) : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Two Column: Top Models & Service Breakdown */}
      <div style={styles.twoColumn}>
        {/* Top Models */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Top Models Worked With</div>
          {topModels.length > 0 ? (
            <div style={styles.modelList}>
              {topModels.map((model, idx) => (
                <div key={idx} style={styles.modelItem}>
                  <div style={styles.modelAvatar}>
                    {model.name.charAt(0)}
                  </div>
                  <div style={styles.modelInfo}>
                    <div style={styles.modelName}>{model.name}</div>
                    <div style={styles.modelMeta}>⭐ {model.rating} rating</div>
                  </div>
                  <div style={styles.modelBookings}>{model.bookings} sessions</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>No models yet</div>
          )}
        </div>

        {/* Service Breakdown */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Service Breakdown</div>
          {serviceBreakdown.length > 0 ? (
            <div style={styles.serviceList}>
              {serviceBreakdown.map((service, idx) => (
                <div key={idx} style={styles.serviceItem}>
                  <div style={styles.serviceName}>{getServiceLabel(service.name)}</div>
                  <div style={styles.serviceCount}>{service.count} requests</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>No services yet</div>
          )}
        </div>
      </div>

      {/* Earnings Summary */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Earnings Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4caf50' }}>
              ${stats.totalEarnings}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>Total Earnings</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B1E3F' }}>
              {stats.completedSessions}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>Sessions Completed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              ${stats.completedSessions > 0 ? Math.round(stats.totalEarnings / stats.completedSessions) : 0}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>Avg per Session</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Recent Activity</div>
        {recentActivity.length > 0 ? (
          <div style={styles.timeline}>
            {recentActivity.map((activity, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={{
                  ...styles.timelineDot,
                  background: activity.type === 'booking' ? '#4caf50' : '#8B1E3F',
                }} />
                <div style={styles.timelineContent}>
                  <div style={styles.timelineTitle}>{activity.title}</div>
                  <div style={styles.timelineDate}>{formatDate(activity.date)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>No recent activity</div>
        )}
      </div>
    </div>
  );
}

