import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { services, formatPrice } from '../data/services';
import { getPendingRequestsCount, getRequestsForMatching } from '../../utils/matchingApi';
import { generateClient } from 'aws-amplify/data';
import { getWorkflowStage, getStatusLabel, getStatusColor } from '../../utils/workflowState';

const client = generateClient();

// ============ STYLES ============
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
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  statChange: {
    fontSize: '0.75rem',
    marginTop: '0.5rem',
  },
  
  // Section
  section: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  viewAllBtn: {
    fontSize: '0.8rem',
    color: '#e94560',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  
  // Two column layout
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // List items
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  listItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  listItemAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
  },
  listItemName: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  listItemSub: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Status badges
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgePending: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  badgeActive: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  badgeUrgent: {
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
  },
  
  // Quick actions
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, rgba(233,69,96,0.2), rgba(233,69,96,0.1))',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  // Training map table
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.6)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
    gap: '1rem',
    padding: '0.85rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.9rem',
  },
  tableCellMuted: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.8rem',
  },
};

// Helper to calculate stats from real data
const calculateStats = (modelsCount, professionalsCount, pendingCount, bookingsCount) => [
  { icon: '', value: String(modelsCount), label: 'Active Models', change: 'Active now', changeType: 'positive' },
  { icon: '', value: String(professionalsCount), label: 'Professionals', change: 'On platform', changeType: 'positive' },
  { icon: '', value: String(pendingCount), label: 'Matching Requests', change: 'Need matching', changeType: 'urgent' },
  { icon: '', value: String(bookingsCount), label: 'Upcoming Bookings', change: 'Next 7 days', changeType: 'neutral' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    models: 0,
    professionals: 0,
    pendingRequests: 0,
    upcomingBookings: 0,
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [trainingMap, setTrainingMap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all stats in parallel
      const [
        modelsResult,
        professionalsResult,
        requestsResult,
        bookingsResult,
        allRequestsResult,
      ] = await Promise.all([
        client.models.ModelProfile.list({
          filter: { status: { eq: 'active' } },
        }),
        client.models.Professional.list({
          filter: { status: { eq: 'active' } },
        }),
        client.models.ModelRequest.list({
          filter: { status: { eq: 'matching' } },
          limit: 10,
        }),
        client.models.Booking.list({
          filter: {
            status: { eq: 'confirmed' },
            appointmentDate: {
              ge: new Date().toISOString().split('T')[0],
              le: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            },
          },
        }),
        client.models.ModelRequest.list({
          limit: 1000,
        }),
      ]);

      // Calculate stats
      const modelsCount = modelsResult.data?.length || 0;
      const professionalsCount = professionalsResult.data?.length || 0;
      const pendingCount = requestsResult.data?.length || 0;
      const bookingsCount = bookingsResult.data?.length || 0;

      setStats({
        models: modelsCount,
        professionals: professionalsCount,
        pendingRequests: pendingCount,
        upcomingBookings: bookingsCount,
      });

      // Load matching requests with professional details
      const enrichedRequests = await Promise.all(
        (requestsResult.data || []).slice(0, 3).map(async (req) => {
          try {
            const { data: professional } = await client.models.Professional.get({
              id: req.professionalId,
            });

            return {
              id: req.id,
              pro: professional
                ? `${professional.firstName} ${professional.lastName.charAt(0)}.`
                : 'Unknown',
              service: req.serviceType || 'Service',
              model: `${req.desiredHairLength || 'Any'} ${req.desiredHairCondition || 'hair'}`,
              urgency: req.priority || 'matching',
              date: req.requestedDate
                ? new Date(req.requestedDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'TBD',
            };
          } catch (err) {
            return {
              id: req.id,
              pro: 'Unknown',
              service: req.serviceType || 'Service',
              model: 'Any',
              urgency: req.priority || 'matching',
              date: 'TBD',
            };
          }
        })
      );

      setPendingRequests(enrichedRequests);

      // Load top performers (models with most bookings)
      const { data: allBookings } = await client.models.Booking.list({
        limit: 1000,
      });

      // Build training map (requests → bookings → models used)
      const trainingServices = [
        { key: 'blowouts', label: 'Blowouts', match: ['blowout', 'blowdry'] },
        { key: 'haircuts', label: 'Haircuts', match: ['haircut', 'haircuts', 'cut'] },
        { key: 'color', label: 'Color', match: ['color', 'highlights', 'balayage', 'color-correction'] },
      ];
      const allRequests = allRequestsResult.data || [];
      const allBookingsList = allBookings || [];
      const normalizeService = (serviceType) => (serviceType || '').toLowerCase();

      const trainingRows = trainingServices.map((service) => {
        const requestsCount = allRequests.filter((req) =>
          service.match.includes(normalizeService(req.serviceType || req.serviceId))
        ).length;
        const bookingsForService = allBookingsList.filter((booking) =>
          service.match.includes(normalizeService(booking.serviceType || booking.serviceId))
        );
        const modelsUsed = new Set(
          bookingsForService.map((booking) => booking.modelId).filter(Boolean)
        ).size;
        const hours = bookingsForService.reduce(
          (sum, booking) => sum + (booking.duration || 0),
          0
        ) / 60;

        return {
          key: service.key,
          label: service.label,
          requestsCount,
          modelsUsed,
          hours: Number.isFinite(hours) ? hours : 0,
        };
      });

      setTrainingMap(trainingRows);

      // Count bookings per model
      const modelBookingCounts = {};
      (allBookings || []).forEach((booking) => {
        if (booking.modelId) {
          modelBookingCounts[booking.modelId] =
            (modelBookingCounts[booking.modelId] || 0) + 1;
        }
      });

      // Get top 5 models by booking count
      const topModelIds = Object.entries(modelBookingCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([modelId]) => modelId);

      const topModelsData = await Promise.all(
        topModelIds.map(async (modelId) => {
          try {
            const { data: model } = await client.models.ModelProfile.get({
              id: modelId,
            });
            if (!model) return null;

            return {
              id: model.id,
              firstName: model.firstName,
              lastName: model.lastName,
              totalBookings: modelBookingCounts[modelId],
              repeatBookings: 0, // TODO: Calculate from booking history
              avgAgenticScore: 85, // TODO: Calculate from real scores
            };
          } catch (err) {
            return null;
          }
        })
      );

      setTopPerformers(topModelsData.filter(Boolean));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatchEngine = () => {
    navigate('/admin/matching');
  };

  const handleReviewRequests = () => {
    navigate('/admin/requests');
  };

  const handleApprovePending = () => {
    navigate('/admin/match-approval');
  };

  const handleViewAllRequests = () => {
    navigate('/admin/requests');
  };

  const handleViewAllModels = () => {
    navigate('/admin/models');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Good morning, Yasmeen 👑</h1>
        <p style={styles.subtitle}>Here's what's happening with Modeled today</p>
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <button 
          style={styles.actionBtn}
          onClick={handleRunMatchEngine}
          disabled={loading}
        >
          Run Match Engine
        </button>
        <button 
          style={styles.actionBtn}
          onClick={handleReviewRequests}
          disabled={loading}
        >
          Review Requests
        </button>
        <button 
          style={styles.actionBtn}
          onClick={handleApprovePending}
          disabled={loading}
        >
          Approve Pending
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {loading ? (
          // Loading skeletons
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} style={styles.statCard}>
                <div
                  style={{
                    ...styles.statIcon,
                    background: 'rgba(255,255,255,0.05)',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                >
                  ⏳
                </div>
                <div
                  style={{
                    ...styles.statValue,
                    background: 'rgba(255,255,255,0.05)',
                    width: '60px',
                    height: '32px',
                    borderRadius: '4px',
                  }}
                />
                <div
                  style={{
                    ...styles.statLabel,
                    background: 'rgba(255,255,255,0.05)',
                    width: '120px',
                    height: '16px',
                    borderRadius: '4px',
                  }}
                />
              </div>
            ))
        ) : (
          calculateStats(
            stats.models,
            stats.professionals,
            stats.pendingRequests,
            stats.upcomingBookings
          ).map((stat, index) => (
          <div key={index} style={styles.statCard}>
            <div style={styles.statIcon}>{stat.icon}</div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
            <div style={{
              ...styles.statChange,
              color: stat.changeType === 'positive' ? '#4caf50' : 
                     stat.changeType === 'urgent' ? '#e94560' : 
                     'rgba(255,255,255,0.5)'
            }}>
              {stat.change}
            </div>
          </div>
          ))
        )}
      </div>

      {/* Two Column Layout */}
      <div style={styles.twoColumn}>
        {/* Matching Requests */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            Matching Requests
          </h3>
          {loading ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              Loading...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              No matching requests
            </div>
          ) : (
            pendingRequests.map((req) => (
            <div key={req.id} style={styles.listItem}>
              <div style={styles.listItemLeft}>
                <div style={styles.listItemAvatar}>
                  {req.pro.charAt(0)}
                </div>
                <div>
                  <div style={styles.listItemName}>{req.pro}</div>
                  <div style={styles.listItemSub}>{req.service} • {req.model}</div>
                </div>
              </div>
              <div>
                <span style={{
                  ...styles.badge,
                  ...(req.urgency === 'urgent' ? styles.badgeUrgent : styles.badgePending)
                }}>
                  {req.urgency}
                </span>
              </div>
            </div>
            ))
          )}
          <button
            style={{ ...styles.viewAllBtn, marginTop: '1rem' }}
            onClick={handleViewAllRequests}
          >
            View all requests →
          </button>
        </div>

        {/* Top Performers - Agentic Leaderboard */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>
            <span>🏆</span> Top Performers (Booking Count)
          </h3>
          {loading ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              Loading...
            </div>
          ) : topPerformers.length === 0 ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              No performers yet
            </div>
          ) : (
            topPerformers.map((model, index) => (
            <div key={model.id} style={styles.listItem}>
              <div style={styles.listItemLeft}>
                <div style={{
                  ...styles.listItemAvatar,
                  background: index === 0 ? 'linear-gradient(135deg, #ffd700, #ffed4a)' :
                              index === 1 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' :
                              index === 2 ? 'linear-gradient(135deg, #cd7f32, #daa06d)' :
                              'linear-gradient(135deg, #e94560, #ff6b8a)',
                  color: index < 3 ? '#000' : '#fff',
                }}>
                  #{index + 1}
                </div>
                <div>
                  <div style={styles.listItemName}>{model.firstName} {model.lastName}</div>
                  <div style={styles.listItemSub}>
                    {model.totalBookings} bookings • {model.repeatBookings} repeats
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '700', 
                  color: model.avgAgenticScore >= 90 ? '#4caf50' : 
                         model.avgAgenticScore >= 75 ? '#8bc34a' : '#ffc107' 
                }}>
                  {model.avgAgenticScore}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}>AVG SCORE</div>
              </div>
            </div>
            ))
          )}
          <button
            style={{ ...styles.viewAllBtn, marginTop: '1rem' }}
            onClick={handleViewAllModels}
          >
            View all models →
          </button>
        </div>
      </div>

      {/* Training Map */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitle}>Training Map (Requests → Bookings)</div>
          <button
            type="button"
            style={styles.viewAllBtn}
            onClick={() => navigate('/admin/training')}
          >
            View Training
          </button>
        </div>
        <div style={styles.card}>
          <div style={styles.tableHeader}>
            <div>Service</div>
            <div>Requests</div>
            <div>Models Used</div>
            <div>Hours</div>
          </div>
          {loading ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              Loading...
            </div>
          ) : trainingMap.length === 0 ? (
            <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
              No training data yet
            </div>
          ) : (
            trainingMap.map((row) => (
              <div key={row.key} style={styles.tableRow}>
                <div>{row.label}</div>
                <div>{row.requestsCount}</div>
                <div>{row.modelsUsed}</div>
                <div>
                  {row.hours.toFixed(1)}
                  <span style={styles.tableCellMuted}> hrs</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Bookings Preview */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3 style={styles.cardTitle}>
          Today's Appointments
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          marginTop: '1rem' 
        }}>
          {[
            { time: '10:00 AM', model: 'Emma J.', pro: 'Sarah M.', service: 'Color', revenue: 66 },
            { time: '1:00 PM', model: 'Sophia L.', pro: 'Mike T.', service: 'Blowdry', revenue: 35 },
            { time: '4:00 PM', model: 'Olivia C.', pro: 'Lisa K.', service: 'Haircut', revenue: 46 },
          ].map((apt, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              padding: '1rem',
              borderLeft: '3px solid #e94560',
            }}>
              <div style={{ fontSize: '0.8rem', color: '#e94560', fontWeight: '600' }}>{apt.time}</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{apt.service}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                {apt.model} ↔ {apt.pro}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4caf50', marginTop: '0.5rem', fontWeight: '600' }}>
                +${apt.revenue} revenue
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Revenue Breakdown */}
      <div style={{ ...styles.card, marginTop: '1.5rem' }}>
        <h3 style={styles.cardTitle}>
          Revenue by Service
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '1rem',
          marginTop: '1rem' 
        }}>
          {services.map((service) => (
            <div key={service.id} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '10px',
              padding: '1rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{service.icon}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem' }}>{service.name}</div>
              <div style={{ fontSize: '1rem', color: '#4caf50', fontWeight: '700' }}>
                {formatPrice(service.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>
                per booking
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

