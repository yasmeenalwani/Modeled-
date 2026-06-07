import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import { useNavigate } from 'react-router-dom';
import { getBookingsForUser } from '../../utils/bookingService';
import { getServiceById } from '../../admin/data/services';
import AddToCalendar from '../../components/AddToCalendar';
import { getMockBookings, getMockProfessionalByUserId, shouldUseMockData, getMockProfessional } from '../../utils/mockDataService';

let client;
try {
  client = generateClient();
} catch (error) {
  console.warn('Failed to generate Amplify client, will use mock data only:', error);
  client = null;
}

// Day Cell Component with hover state
function DayCell({ day, hasEvents, onDayClick, onCreateRequest, getServiceById }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      style={{
        ...styles.dayCell,
        ...(day.isToday ? styles.dayCellToday : {}),
        ...(!day.isCurrentMonth ? styles.dayCellOtherMonth : {}),
        ...(isHovered && !hasEvents && day.isCurrentMonth ? styles.dayCellHover : {}),
      }}
      onClick={() => day.isCurrentMonth && onDayClick(day)}
      onMouseEnter={() => day.isCurrentMonth && !hasEvents && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.dayNumber}>{day.day}</div>
      {hasEvents ? (
        <div style={styles.dayEvents}>
          {day.events.slice(0, 3).map((event, eventIndex) => {
            const service = getServiceById(event.serviceType);
            return (
              <div 
                key={eventIndex} 
                style={styles.event} 
                title={`${event.appointmentTime} - ${service?.name || event.serviceType}`}
                onClick={(e) => e.stopPropagation()}
              >
                {event.appointmentTime}
              </div>
            );
          })}
          {day.events.length > 3 && (
            <div style={styles.event}>+{day.events.length - 3} more</div>
          )}
        </div>
      ) : day.isCurrentMonth ? (
        <div 
          style={{
            ...styles.dayCellEmpty,
            opacity: isHovered ? 1 : 0.3,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onCreateRequest(day);
          }}
        >
          <div style={{
            ...styles.addRequestBtn,
            opacity: isHovered ? 1 : 0,
          }}>
            + Request Model
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Calendar styles - updated for Pro Portal light background
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory background
    color: '#4A2A1A', // Dark brown text
    minHeight: '100vh',
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
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.9rem',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarContainer: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)', // Cherry border
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(139, 30, 63, 0.08)',
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
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.05)', // Cherry tint
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(139, 30, 63, 0.1)',
      borderColor: 'rgba(139, 30, 63, 0.3)',
    },
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
    color: '#8B1E3F', // Cherry
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayCell: {
    minHeight: '100px',
    padding: '0.5rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.1)',
    borderRadius: '6px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dayCellEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100px',
  },
  addRequestBtn: {
    marginTop: '0.5rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(139, 30, 63, 0.2)',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#8B1E3F',
    cursor: 'pointer',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
  },
  dayCellHover: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: 'rgba(139, 30, 63, 0.3)',
  },
  dayCellToday: {
    background: 'rgba(139, 30, 63, 0.1)', // Cherry tint
    borderColor: '#8B1E3F', // Cherry
    borderWidth: '2px',
  },
  dayCellOtherMonth: {
    opacity: 0.4,
    background: 'rgba(139, 30, 63, 0.02)',
  },
  dayNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
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
    background: 'rgba(139, 30, 63, 0.15)', // Cherry tint
    borderLeft: '3px solid #8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectedDayPanel: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(139, 30, 63, 0.08)',
  },
  selectedDayTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  eventDetailCard: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.03)', // Cherry tint
    border: '1px solid rgba(139, 30, 63, 0.1)',
    borderRadius: '8px',
  },
  eventDetailTime: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  eventDetailService: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  eventDetailPeople: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  eventDetailLocation: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ProCalendar() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    
    // Auto-refresh bookings every 30 seconds to catch new bookings from accepted matches
    const interval = setInterval(() => {
      console.log('Auto-refreshing Pro Calendar bookings...');
      loadBookings();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const loadedBookings = await getBookingsForUser(user?.userId || 'mock-pro-user-1', 'professional');
      const activeBookings = loadedBookings.filter(b => b.status !== 'cancelled');
      
      setBookings(activeBookings || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Fallback: try mock data directly
      try {
        const professional = getMockProfessionalByUserId(user?.userId) || getMockProfessional('mock-pro-1');
        if (professional) {
          const mockBookings = getMockBookings();
          const filteredBookings = mockBookings.filter(b => 
            b.professionalId === professional.id && b.status !== 'cancelled'
          );
          setBookings(filteredBookings);
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

  const handleDayClick = (day) => {
    setSelectedDay(day.date);
  };

  const handleCreateRequest = (date, event) => {
    event.stopPropagation();
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/portal/request?date=${dateStr}`);
  };

  const handleEmptyCellClick = (day) => {
    if (!day.isCurrentMonth) return;
    const dateStr = day.date.toISOString().split('T')[0];
    navigate(`/portal/request?date=${dateStr}`);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>My Calendar</h1>
            <p style={styles.subtitle}>Your scheduled appointments with models</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Calendar</h1>
          <p style={styles.subtitle}>Your scheduled appointments with models</p>
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
          {calendarDays.map((day, index) => {
            const hasEvents = day.events.length > 0;
            
            return (
              <DayCell
                key={index}
                day={day}
                hasEvents={hasEvents}
                onDayClick={handleDayClick}
                onCreateRequest={handleEmptyCellClick}
                getServiceById={getServiceById}
              />
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div style={styles.selectedDayPanel}>
          <div style={styles.selectedDayTitle}>
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          {selectedDayEvents.length > 0 ? (
            <div style={styles.eventDetails}>
              {selectedDayEvents.map(event => {
                const service = getServiceById(event.serviceType);
                return (
                  <div key={event.id} style={styles.eventDetailCard}>
                    <div style={styles.eventDetailTime}>{event.appointmentTime}</div>
                    <div style={styles.eventDetailService}>
                      {service?.name || event.serviceType}
                    </div>
                    <div style={styles.eventDetailPeople}>Model: {event.modelId || 'TBD'}</div>
                    <div style={styles.eventDetailLocation}>{event.location || 'TBD'}</div>
                    <div style={{ marginTop: '1rem' }}>
                      <AddToCalendar booking={event} userType="professional" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)', fontFamily: '"Alike", "Georgia", serif' }}>
                No bookings scheduled
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'rgba(255,255,255,0.6)', fontFamily: '"Alike", "Georgia", serif' }}>
                  Select a time slot to create a request:
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
                  maxWidth: '500px',
                  margin: '0 auto',
                }}>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                    <button
                      key={time}
                      style={{
                        padding: '0.5rem',
                        background: 'rgba(139, 30, 63, 0.2)',
                        border: '1px solid rgba(139, 30, 63, 0.3)',
                        borderRadius: '6px',
                        color: '#FFFEF9',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        fontFamily: '"Alike", "Georgia", serif',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(139, 30, 63, 0.4)';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'rgba(139, 30, 63, 0.2)';
                        e.target.style.transform = 'translateY(0)';
                      }}
                      onClick={() => {
                        const dateStr = selectedDay.toISOString().split('T')[0];
                        navigate(`/portal/request?date=${dateStr}&time=${time}`);
                      }}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#FFFEF9',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
                onClick={() => {
                  const dateStr = selectedDay.toISOString().split('T')[0];
                  navigate(`/portal/request?date=${dateStr}`);
                }}
              >
                Or Create Request Without Time
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

