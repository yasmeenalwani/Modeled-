// ============================================
// CALENDAR DASHBOARD - At-a-Glance Stats & Alerts
// ============================================

import React from 'react';
import { getTodayBookings, getPendingBookings, getUpcomingBookings, getAllBookings } from '../data/mockBookings';

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.25rem',
    transition: 'all 0.2s ease',
  },
  cardUrgent: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  cardIcon: {
    fontSize: '1.5rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  cardSubtext: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  cardAction: {
    marginTop: '0.75rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  upcomingList: {
    marginTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  upcomingItem: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.7rem',
  },
  upcomingService: {
    fontWeight: '500',
  },
};

export default function CalendarDashboard({ bookings = getAllBookings(), onFilterChange, onDateClick }) {
  const todayBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = b.appointmentDate ? new Date(b.appointmentDate).toISOString().split('T')[0] : (b.date || '');
    return bookingDate === today && b.status !== 'cancelled';
  });
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const upcomingBookings = bookings.filter(b => {
    const today = new Date();
    const bookingDate = b.appointmentDate ? new Date(b.appointmentDate) : (b.date ? new Date(b.date) : null);
    if (!bookingDate) return false;
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    return bookingDate >= today && bookingDate <= weekEnd && b.status !== 'cancelled';
  }).sort((a, b) => {
    const dateA = a.appointmentDate ? new Date(a.appointmentDate) : (a.date ? new Date(a.date) : new Date(0));
    const dateB = b.appointmentDate ? new Date(b.appointmentDate) : (b.date ? new Date(b.date) : new Date(0));
    return dateA - dateB;
  });
  
  const stats = {
    today: todayBookings.length,
    pending: pendingBookings.length,
    upcoming: upcomingBookings.length,
    total: bookings.filter(b => b.status !== 'cancelled').length,
  };

  const nextBooking = upcomingBookings[0];
  const urgentBookings = pendingBookings.filter(b => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    const daysDiff = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
    return daysDiff <= 2;
  });

  return (
    <div style={styles.container}>
      {/* Today's Bookings */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Today</div>
          <div style={styles.cardIcon}>📅</div>
        </div>
        <div style={{ ...styles.cardValue, color: '#e94560' }}>{stats.today}</div>
        <div style={styles.cardSubtext}>appointments scheduled</div>
        {stats.today > 0 && (
          <div
            style={styles.cardAction}
            onClick={() => {
              onFilterChange({ type: 'date', value: 'today' });
              onDateClick(new Date());
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            View Today →
          </div>
        )}
      </div>

      {/* Pending Actions */}
      <div style={{ ...styles.card, ...(urgentBookings.length > 0 ? styles.cardUrgent : {}) }}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Pending</div>
          <div style={styles.cardIcon}>⚠️</div>
        </div>
        <div style={{ ...styles.cardValue, color: urgentBookings.length > 0 ? '#f85149' : '#ffc107' }}>
          {stats.pending}
        </div>
        <div style={styles.cardSubtext}>
          {urgentBookings.length > 0 ? `${urgentBookings.length} urgent` : 'awaiting confirmation'}
        </div>
        {stats.pending > 0 && (
          <div
            style={styles.cardAction}
            onClick={() => onFilterChange({ type: 'status', value: 'pending' })}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            Review Pending →
          </div>
        )}
      </div>

      {/* Next Booking */}
      {nextBooking && (
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitle}>Next Up</div>
            <div style={styles.cardIcon}>⏰</div>
          </div>
          <div style={{ ...styles.cardValue, fontSize: '1.25rem', color: '#667eea' }}>
            {nextBooking.appointmentTime || nextBooking.time || 'TBD'}
          </div>
          <div style={styles.cardSubtext}>
            {new Date(nextBooking.appointmentDate || nextBooking.date || Date.now()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div style={styles.upcomingList}>
            <div style={styles.upcomingItem}>
              <div>
                <div style={styles.upcomingService}>
                  {nextBooking.serviceType || (nextBooking.service?.icon ? `${nextBooking.service.icon} ${nextBooking.service.name}` : 'Service')}
                </div>
                <div style={styles.upcomingTime}>
                  {nextBooking.model?.name || 'Model'} ↔ {nextBooking.professional?.name || 'Professional'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming This Week */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>This Week</div>
          <div style={styles.cardIcon}>📆</div>
        </div>
        <div style={{ ...styles.cardValue, color: '#4caf50' }}>{stats.upcoming}</div>
        <div style={styles.cardSubtext}>bookings in next 7 days</div>
        {stats.upcoming > 0 && (
          <div
            style={styles.cardAction}
            onClick={() => onFilterChange({ type: 'date', value: 'week' })}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            View Week →
          </div>
        )}
      </div>

      {/* Total Active */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>Total Active</div>
          <div style={styles.cardIcon}>📊</div>
        </div>
        <div style={{ ...styles.cardValue, color: '#667eea' }}>{stats.total}</div>
        <div style={styles.cardSubtext}>active bookings</div>
      </div>
    </div>
  );
}

