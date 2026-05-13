// ============================================
// LIST/AGENDA VIEW COMPONENT
// ============================================

import React from 'react';
import { getServiceById } from '../data/services';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  dateGroup: {
    marginBottom: '1.5rem',
  },
  dateHeader: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.8)',
  },
  dateHeaderToday: {
    color: '#e94560',
  },
  eventCard: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderLeft: '4px solid',
  },
  eventCardConfirmed: {
    borderLeftColor: '#4caf50',
  },
  eventCardPending: {
    borderLeftColor: '#ffc107',
  },
  eventCardCompleted: {
    borderLeftColor: '#2196f3',
  },
  eventCardCancelled: {
    borderLeftColor: '#f44336',
    opacity: 0.6,
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  eventTime: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e94560',
    minWidth: '80px',
  },
  eventService: {
    fontSize: '1rem',
    fontWeight: '600',
    flex: 1,
    marginLeft: '1rem',
  },
  eventStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusConfirmed: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  statusPending: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  statusCompleted: {
    background: 'rgba(33,150,243,0.2)',
    color: '#2196f3',
  },
  statusCancelled: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
  eventDetails: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '0.5rem',
  },
  eventDetailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

export default function ListView({ bookings, onEventClick }) {
  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const dateKey = booking.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(booking);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedBookings).sort();

  const getStatusStyle = (status) => {
    return {
      ...styles.eventStatus,
      ...(status === 'confirmed' ? styles.statusConfirmed :
          status === 'pending' ? styles.statusPending :
          status === 'completed' ? styles.statusCompleted :
          styles.statusCancelled),
    };
  };

  const getCardStyle = (status) => {
    return {
      ...styles.eventCard,
      ...(status === 'confirmed' ? styles.eventCardConfirmed :
          status === 'pending' ? styles.eventCardPending :
          status === 'completed' ? styles.eventCardCompleted :
          styles.eventCardCancelled),
    };
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  if (sortedDates.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
        <div>No bookings found</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {sortedDates.map(dateKey => {
        const dateBookings = groupedBookings[dateKey].sort((a, b) => {
          // Sort by time
          const timeA = a.time.replace(/[^0-9]/g, '');
          const timeB = b.time.replace(/[^0-9]/g, '');
          return timeA.localeCompare(timeB);
        });

        return (
          <div key={dateKey} style={styles.dateGroup}>
            <div style={{
              ...styles.dateHeader,
              ...(isToday(dateKey) ? styles.dateHeaderToday : {}),
            }}>
              {formatDate(dateKey)}
            </div>
            {dateBookings.map(booking => {
              const service = getServiceById(booking.serviceId);
              return (
                <div
                  key={booking.id}
                  style={getCardStyle(booking.status)}
                  onClick={() => onEventClick(booking)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={styles.eventHeader}>
                    <div style={styles.eventTime}>{booking.time}</div>
                    <div style={styles.eventService}>
                      {service?.icon} {service?.name || booking.serviceId}
                    </div>
                    <div style={getStatusStyle(booking.status)}>
                      {booking.status}
                    </div>
                  </div>
                  <div style={styles.eventDetails}>
                    <div style={styles.eventDetailItem}>
                      <span>👤</span>
                      <span>{booking.model.name}</span>
                    </div>
                    <div style={styles.eventDetailItem}>
                      <span>✂️</span>
                      <span>{booking.professional.name}</span>
                    </div>
                    <div style={styles.eventDetailItem}>
                      <span>📍</span>
                      <span>{booking.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

