import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getBookingsForUser } from '../../utils/bookingService';
import { getServiceById } from '../../admin/data/services';
import AddToCalendar from '../../components/AddToCalendar';

const client = generateClient();

// Reuse calendar styles from admin calendar
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    marginTop: '0.25rem',
  },
  calendarContainer: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  calendarMonth: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  dayHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dayCell: {
    minHeight: '100px',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dayCellToday: {
    background: 'rgba(233,69,96,0.1)',
    borderColor: '#e94560',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: 'rgba(255,255,255,0.7)',
  },
  dayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.25rem',
  },
  event: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    background: 'rgba(76,175,80,0.3)',
    borderLeft: '3px solid #4caf50',
    color: '#4caf50',
  },
  selectedDayPanel: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  selectedDayTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  eventDetailCard: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
  },
  eventDetailTime: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#e94560',
  },
  eventDetailService: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  eventDetailPeople: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '0.5rem',
  },
  eventDetailLocation: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

export default function ModelCalendar() {
  const { user } = useAuthenticator();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    
    // Auto-refresh bookings every 30 seconds to catch new bookings from accepted matches
    const interval = setInterval(() => {
      console.log('Auto-refreshing Model Calendar bookings...');
      loadBookings();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      console.log('=== Loading bookings for Model Calendar ===', { userId: user?.userId });
      
      // Use getBookingsForUser which handles both database and mock data
      // For demo: default to Seraphina's userId if no user found
      const loadedBookings = await getBookingsForUser(user?.userId || 'mock-user-1', 'model');
      console.log('Loaded bookings for model:', loadedBookings.length, loadedBookings);
      
      // Filter out cancelled bookings for calendar display
      const activeBookings = loadedBookings.filter(b => b.status !== 'cancelled');
      console.log('Active bookings (not cancelled):', activeBookings.length);
      
      setBookings(activeBookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Fallback: try mock data directly
      try {
        const { getMockBookings, getMockModel, shouldUseMockData } = await import('../../utils/mockDataService');
        if (shouldUseMockData()) {
          const model = getMockModel('mock-model-1'); // Seraphina Luna
          if (model) {
            const mockBookings = getMockBookings();
            const filteredBookings = mockBookings.filter(b => 
              b.modelId === model.id && b.status !== 'cancelled'
            );
            console.log('Fallback: Loaded', filteredBookings.length, 'mock bookings for model:', model.id);
            setBookings(filteredBookings);
          } else {
            setBookings([]);
          }
        } else {
          setBookings([]);
        }
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
        setBookings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      const isCurrentMonth = dayDate.getMonth() === currentMonth;
      const isToday = dayDate.toDateString() === today.toDateString();
      
      const dayEvents = bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        return bookingDate.toDateString() === dayDate.toDateString();
      });
      
      days.push({
        date: dayDate,
        day: dayDate.getDate(),
        isCurrentMonth,
        isToday,
        events: dayEvents,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, currentYear, bookings, today]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const selectedDayEvents = selectedDay
    ? bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        return bookingDate.toDateString() === selectedDay.toDateString();
      })
    : [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Calendar 📅</h1>
          <p style={styles.subtitle}>Your upcoming and past appointments</p>
        </div>
      </div>

      <div style={styles.calendarContainer}>
        <div style={styles.calendarHeader}>
          <div style={styles.calendarMonth}>{monthName}</div>
          <div style={styles.calendarNav}>
            <button style={styles.navBtn} onClick={() => navigateMonth(-1)}>← Previous</button>
            <button style={styles.navBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
            <button style={styles.navBtn} onClick={() => navigateMonth(1)}>Next →</button>
          </div>
        </div>

        <div style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={styles.dayHeader}>{day}</div>
          ))}
        </div>

        <div style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <div
              key={index}
              style={{
                ...styles.dayCell,
                ...(day.isToday ? styles.dayCellToday : {}),
                ...(!day.isCurrentMonth ? styles.dayCellOtherMonth : {}),
              }}
              onClick={() => setSelectedDay(day.date)}
            >
              <div style={styles.dayNumber}>{day.day}</div>
              <div style={styles.dayEvents}>
                {day.events.slice(0, 3).map((event, eventIndex) => {
                  const service = getServiceById(event.serviceType);
                  return (
                    <div key={eventIndex} style={styles.event} title={`${event.appointmentTime} - ${service?.name || event.serviceType}`}>
                      {event.appointmentTime} {service?.icon || ''}
                    </div>
                  );
                })}
                {day.events.length > 3 && (
                  <div style={styles.event}>+{day.events.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDay && selectedDayEvents.length > 0 && (
        <div style={styles.selectedDayPanel}>
          <div style={styles.selectedDayTitle}>
            📅 {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div style={styles.eventDetails}>
            {selectedDayEvents.map(event => {
              const service = getServiceById(event.serviceType);
              return (
                <div key={event.id} style={styles.eventDetailCard}>
                  <div style={styles.eventDetailTime}>{event.appointmentTime}</div>
                  <div style={styles.eventDetailService}>
                    {service?.icon} {service?.name || event.serviceType}
                  </div>
                  <div style={styles.eventDetailLocation}>📍 {event.location || 'TBD'}</div>
                  <div style={{ marginTop: '1rem' }}>
                    <AddToCalendar booking={event} userType="model" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

