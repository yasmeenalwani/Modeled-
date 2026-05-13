import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getServiceById, formatPrice } from '../data/services';
import { getBookingsForUser } from '../../utils/bookingService';
import WorkflowProgress from '../../components/workflow/WorkflowProgress';
import { getMatchesForRequest } from '../../utils/matchService';

const client = generateClient();

const styles = {
  container: { padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
  
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.9rem',
  },
  
  personCell: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  modelThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  avatarModel: { background: 'linear-gradient(135deg, #e94560, #ff6b8a)' },
  avatarPro: { background: 'linear-gradient(135deg, #667eea, #764ba2)' },
  
  badge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badgeConfirmed: { background: 'rgba(76,175,80,0.2)', color: '#4caf50' },
  badgePending: { background: 'rgba(255,193,7,0.2)', color: '#ffc107' },
  badgeCompleted: { background: 'rgba(33,150,243,0.2)', color: '#2196f3' },
  badgeCancelled: { background: 'rgba(244,67,54,0.2)', color: '#f44336' },
  
  actionBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
};

export default function BookingsPage() {
  const { user } = useAuthenticator();
  const [activeTab, setActiveTab] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrichedBookings, setEnrichedBookings] = useState([]);

  // Load bookings from database
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const userId = user?.userId || 'admin';
      const allBookings = await getBookingsForUser(userId, 'admin');
      
      // Enrich bookings with model and professional details
      const enriched = await Promise.all(
        allBookings.map(async (booking) => {
          try {
            const [model, professional] = await Promise.all([
              client.models.ModelProfile.get({ id: booking.modelId }),
              client.models.Professional.get({ id: booking.professionalId }),
            ]);

            return {
              ...booking,
              model: {
                id: model.data?.id,
                name: model.data ? (model.data.firstName || 'Model') : 'Unknown Model',
                fullName: model.data ? `${model.data.firstName} ${model.data.lastName}`.trim() : 'Unknown Model',
                avatar: model.data?.firstName?.[0] || 'M',
                headshotUrl: model.data?.headshotUrl || model.data?.photoUrls?.[0],
              },
              professional: {
                id: professional.data?.id,
                name: professional.data ? `${professional.data.firstName} ${professional.data.lastName}` : 'Unknown Professional',
                avatar: professional.data?.firstName?.[0] || 'P',
              },
              serviceId: booking.serviceType,
              date: booking.appointmentDate,
              time: booking.appointmentTime,
            };
          } catch (error) {
            console.error('Error enriching booking:', error);
            return {
              ...booking,
              model: { name: 'Unknown Model', fullName: 'Unknown Model', avatar: 'M', headshotUrl: null },
              professional: { name: 'Unknown Professional', avatar: 'P' },
              serviceId: booking.serviceType,
              date: booking.appointmentDate,
              time: booking.appointmentTime,
            };
          }
        })
      );

      setBookings(allBookings);
      setEnrichedBookings(enriched);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = activeTab === 'all' 
    ? enrichedBookings 
    : enrichedBookings.filter(b => b.status === activeTab);

  const getStatusBadge = (status) => {
    const badgeStyles = {
      confirmed: styles.badgeConfirmed,
      pending: styles.badgePending,
      completed: styles.badgeCompleted,
      cancelled: styles.badgeCancelled,
    };
    return { ...styles.badge, ...badgeStyles[status] };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>All Bookings 📅</h1>
          <p style={styles.subtitle}>Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>All Bookings 📅</h1>
        <p style={styles.subtitle}>Manage appointments between models and professionals ({filteredBookings.length} {activeTab === 'all' ? 'total' : activeTab})</p>
      </div>

      <div style={styles.tabs}>
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Model</th>
            <th style={styles.th}>Professional</th>
            <th style={styles.th}>Service</th>
            <th style={styles.th}>Date & Time</th>
            <th style={styles.th}>Location</th>
            <th style={styles.th}>Fees</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ ...styles.td, textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)' }}>No bookings found</p>
              </td>
            </tr>
          ) : (
            filteredBookings.map(booking => {
              const service = getServiceById(booking.serviceId || booking.serviceType);
              return (
                <tr key={booking.id}>
                <td style={styles.td}>
                  <div style={styles.personCell}>
                    {booking.model.headshotUrl ? (
                      <img src={booking.model.headshotUrl} alt="" style={styles.modelThumb} />
                    ) : (
                      <div style={{ ...styles.avatar, ...styles.avatarModel }}>
                        {booking.model.avatar}
                      </div>
                    )}
                    {booking.model.name}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={styles.personCell}>
                    <div style={{ ...styles.avatar, ...styles.avatarPro }}>
                      {booking.professional.avatar}
                    </div>
                    {booking.professional.name}
                  </div>
                </td>
                <td style={styles.td}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{service?.icon}</span>
                    <span>{service?.name}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                    {service ? formatPrice(service.price) : ''}
                  </div>
                </td>
                <td style={styles.td}>
                  <div>{booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                    {booking.time || booking.appointmentTime || 'N/A'}
                  </div>
                </td>
                <td style={styles.td}>{booking.location || 'TBD'}</td>
                <td style={styles.td}>
                  {service ? (
                    <>
                      <div style={{ color: '#e94560', fontSize: '0.85rem' }}>
                        Model pays: ${service.modelFee}
                      </div>
                      <div style={{ color: '#667eea', fontSize: '0.85rem' }}>
                        Pro pays: ${service.professionalFee}
                      </div>
                      <div style={{ color: '#4caf50', fontWeight: '600', marginTop: '0.25rem' }}>
                        = ${service.totalRevenue}
                      </div>
                    </>
                  ) : booking.modelFee || booking.professionalFee ? (
                    <>
                      <div style={{ color: '#e94560', fontSize: '0.85rem' }}>
                        Model: ${booking.modelFee || 0}
                      </div>
                      <div style={{ color: '#667eea', fontSize: '0.85rem' }}>
                        Pro: ${booking.professionalFee || 0}
                      </div>
                      <div style={{ color: '#4caf50', fontWeight: '600', marginTop: '0.25rem' }}>
                        = ${(booking.modelFee || 0) + (booking.professionalFee || 0)}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>N/A</span>
                  )}
                </td>
                <td style={styles.td}>
                  <span style={getStatusBadge(booking.status)}>{booking.status}</span>
                </td>
                <td style={styles.td}>
                  <button style={styles.actionBtn}>View</button>
                  <button style={styles.actionBtn}>Edit</button>
                </td>
              </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

