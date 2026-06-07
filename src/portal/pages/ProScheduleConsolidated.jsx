// ============================================
// MY SCHEDULE - Consolidated Page
// Calendar + Bookings in one unified view
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import { useNavigate } from 'react-router-dom';
import { getBookingsForUser } from '../../utils/bookingFlow';
import { getServiceById } from '../../admin/data/services';
import AddToCalendar from '../../components/AddToCalendar';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {},
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  createRequestBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // View switcher
  viewSwitcher: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    paddingBottom: '1rem',
  },
  viewBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  viewBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Calendar view
  calendarContainer: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
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
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
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
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
    textTransform: 'uppercase',
  },
  dayCell: {
    minHeight: '100px',
    padding: '0.5rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '6px',
    position: 'relative',
    cursor: 'pointer',
  },
  dayCellToday: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
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
    background: 'rgba(139, 30, 63, 0.15)',
    borderLeft: '3px solid #8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Bookings list view
  bookingsList: {},
  bookingCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
  },
  bookingIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'rgba(102,126,234,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
  },
  bookingInfo: {},
  bookingService: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  bookingMeta: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingRight: {
    textAlign: 'right',
  },
  bookingDate: {
    marginTop: '0.75rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingStatus: {
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    display: 'inline-block',
  },
  
  // Unified view
  unifiedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  unifiedCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  unifiedCardContent: {
    padding: '1.5rem',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Floating Action Button
  fab: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    color: '#FFFEF9',
    fontSize: '1.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  
  // Quick request button in calendar cells
  quickRequestBtn: {
    marginTop: '0.5rem',
    padding: '0.35rem 0.6rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px dashed rgba(139, 30, 63, 0.3)',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Quick action in bookings list
  quickActionBtn: {
    marginTop: '0.75rem',
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
};

export default function ProScheduleConsolidated() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [view, setView] = useState('unified'); // 'unified', 'calendar', 'bookings'
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past', 'confirmed', 'pending'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock booking data
  const mockBookings = [
    {
      id: 'booking-1',
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      appointmentTime: '10:00 AM',
      serviceType: 'balayage',
      status: 'confirmed',
      modelId: 'Emma Johnson',
      location: 'Luxe Studio - Chair 3',
    },
    {
      id: 'booking-2',
      appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
      appointmentTime: '2:00 PM',
      serviceType: 'haircut',
      status: 'pending',
      modelId: 'Sophia Martinez',
      location: 'Luxe Studio - Chair 2',
    },
    {
      id: 'booking-3',
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      appointmentTime: '11:30 AM',
      serviceType: 'color',
      status: 'confirmed',
      modelId: 'Olivia Chen',
      location: 'Luxe Studio - Chair 1',
    },
    {
      id: 'booking-4',
      appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      appointmentTime: '3:00 PM',
      serviceType: 'blowout',
      status: 'confirmed',
      modelId: 'Ava Williams',
      location: 'Luxe Studio - Chair 2',
    },
    {
      id: 'booking-5',
      appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      appointmentTime: '1:00 PM',
      serviceType: 'balayage',
      status: 'completed',
      modelId: 'Isabella Taylor',
      location: 'Luxe Studio - Chair 1',
    },
    {
      id: 'booking-6',
      appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      appointmentTime: '10:00 AM',
      serviceType: 'haircut',
      status: 'completed',
      modelId: 'Mia Anderson',
      location: 'Luxe Studio - Chair 3',
    },
    {
      id: 'booking-7',
      appointmentDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      appointmentTime: '9:00 AM',
      serviceType: 'highlight',
      status: 'confirmed',
      modelId: 'Charlotte Brown',
      location: 'Luxe Studio - Chair 1',
    },
    {
      id: 'booking-8',
      appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
      appointmentTime: '4:00 PM',
      serviceType: 'treatment',
      status: 'pending',
      modelId: 'Amelia Davis',
      location: 'Luxe Studio - Chair 2',
    },
    {
      id: 'booking-9',
      appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      appointmentTime: '12:00 PM',
      serviceType: 'color',
      status: 'matching',
      modelId: 'Harper Wilson',
      location: 'TBD',
    },
    {
      id: 'booking-10',
      appointmentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
      appointmentTime: '2:30 PM',
      serviceType: 'blowout',
      status: 'completed',
      modelId: 'Evelyn Moore',
      location: 'Luxe Studio - Chair 3',
    },
  ];

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const loadedBookings = await getBookingsForUser(user?.userId, 'professional');
      // Use mock data if no real bookings found
      if (loadedBookings && loadedBookings.length > 0) {
        setBookings(loadedBookings);
      } else {
        setBookings(mockBookings);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Use mock data on error
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];
    
    if (filter === 'upcoming') {
      filtered = filtered.filter(b => new Date(b.appointmentDate) >= new Date());
    } else if (filter === 'past') {
      filtered = filtered.filter(b => new Date(b.appointmentDate) < new Date());
    } else if (filter === 'confirmed') {
      filtered = filtered.filter(b => b.status === 'confirmed');
    } else if (filter === 'pending') {
      filtered = filtered.filter(b => b.status === 'pending' || b.status === 'matching');
    }
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return dateA - dateB;
    });
  }, [bookings, filter]);

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => new Date(b.appointmentDate) >= new Date()).length,
    thisWeek: bookings.filter(b => {
      const bookingDate = new Date(b.appointmentDate);
      const today = new Date();
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      return bookingDate >= today && bookingDate <= weekFromNow;
    }).length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  // Calendar logic
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return { bg: 'rgba(76,175,80,0.2)', color: '#4caf50' };
      case 'pending':
      case 'matching':
        return { bg: 'rgba(255,193,7,0.2)', color: '#ffc107' };
      case 'completed':
        return { bg: 'rgba(139, 30, 63, 0.1)', color: '#8B1E3F' };
      default:
        return { bg: 'rgba(139, 30, 63, 0.1)', color: '#5A3A2A' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>My Schedule</h1>
          <p style={styles.subtitle}>Your appointments and bookings - manage your calendar in one place</p>
        </div>
        <button
          style={styles.createRequestBtn}
          onClick={() => navigate('/portal/request')}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          Create Request
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Bookings</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>{stats.upcoming}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>{stats.thisWeek}</div>
          <div style={styles.statLabel}>This Week</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      {/* View Switcher */}
      <div style={styles.viewSwitcher}>
        {[
          { key: 'unified', label: '📋 Unified View' },
          { key: 'calendar', label: 'Calendar' },
          { key: 'bookings', label: 'Bookings List' },
        ].map(v => (
          <button
            key={v.key}
            style={{
              ...styles.viewBtn,
              ...(view === v.key ? styles.viewBtnActive : {}),
            }}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {view !== 'calendar' && (
        <div style={styles.filters}>
          {[
            { key: 'all', label: 'All' },
            { key: 'upcoming', label: '⏰ Upcoming' },
            { key: 'past', label: '📜 Past' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'pending', label: '⏳ Pending' },
          ].map(f => (
            <button
              key={f.key}
              style={{
                ...styles.filterBtn,
                ...(filter === f.key ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Unified View */}
      {view === 'unified' && (
        <div style={styles.unifiedGrid}>
          {filteredBookings.map(booking => {
            const service = getServiceById(booking.serviceType);
            const statusStyle = getStatusColor(booking.status);
            return (
              <div key={booking.id} style={styles.unifiedCard}>
                <div style={styles.unifiedCardContent}>
                  <div style={{
                    ...styles.bookingStatus,
                    ...statusStyle,
                  }}>
                    {booking.status}
                  </div>
                  <div style={styles.bookingService}>
                    {service?.icon} {service?.name || booking.serviceType}
                  </div>
                  <div style={styles.bookingMeta}>
                    {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={styles.bookingMeta}>
                    {booking.appointmentTime}
                  </div>
                  <div style={styles.bookingMeta}>
                    Model: {booking.modelId || 'TBD'}
                  </div>
                  <div style={styles.bookingMeta}>
                    {booking.location || 'TBD'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
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
              const dateStr = day.date.toISOString().split('T')[0];
              const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <div
                  key={index}
                  style={{
                    ...styles.dayCell,
                    ...(day.isToday ? styles.dayCellToday : {}),
                    ...(!day.isCurrentMonth ? { opacity: 0.3 } : {}),
                    cursor: day.isCurrentMonth && !isPast ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (day.isCurrentMonth && !isPast) {
                      navigate(`/portal/request?date=${dateStr}`);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (day.isCurrentMonth && !isPast) {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                  }}
                >
                  <div style={styles.dayNumber}>{day.day}</div>
                  <div style={styles.dayEvents}>
                    {day.events.slice(0, 3).map((event, eventIndex) => {
                      const service = getServiceById(event.serviceType);
                      return (
                        <div key={eventIndex} style={styles.event} title={`${event.appointmentTime} - ${service?.name || event.serviceType}`}>
                          {event.appointmentTime} {service?.icon || '💇'}
                        </div>
                      );
                    })}
                    {day.events.length > 3 && (
                      <div style={styles.event}>+{day.events.length - 3} more</div>
                    )}
                    {day.events.length === 0 && day.isCurrentMonth && !isPast && (
                      <button
                        style={styles.quickRequestBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portal/request?date=${dateStr}`);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(139, 30, 63, 0.2)';
                          e.currentTarget.style.borderColor = '#8B1E3F';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                        }}
                      >
                        + Request Model
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bookings List View */}
      {view === 'bookings' && (
        <div style={styles.bookingsList}>
          {filteredBookings.map(booking => {
            const service = getServiceById(booking.serviceType);
            const statusStyle = getStatusColor(booking.status);
            return (
              <div key={booking.id} style={styles.bookingCard}>
                <div style={styles.bookingIcon}>
                </div>
                <div style={styles.bookingInfo}>
                  <div style={styles.bookingService}>
                    {service?.name || booking.serviceType}
                  </div>
                  <div style={styles.bookingMeta}>
                    with {booking.modelId || 'TBD'} • {booking.location || 'TBD'}
                  </div>
                  <div style={styles.bookingMeta}>
                    {booking.appointmentTime} • {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div style={styles.bookingRight}>
                  <div style={{
                    ...styles.bookingStatus,
                    ...statusStyle,
                  }}>
                    {booking.status}
                  </div>
                  <div style={styles.bookingDate}>
                    {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <button
                    style={styles.quickActionBtn}
                    onClick={() => {
                      const dateStr = new Date(booking.appointmentDate).toISOString().split('T')[0];
                      navigate(`/portal/request?date=${dateStr}&time=${encodeURIComponent(booking.appointmentTime)}`);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.2)';
                      e.currentTarget.style.borderColor = '#8B1E3F';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                    }}
                  >
                    Request Another Model
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredBookings.length === 0 && (
        <div style={styles.emptyState}>
          <p>No bookings found. Check back when you have appointments scheduled!</p>
          <button
            style={{
              ...styles.createRequestBtn,
              marginTop: '1.5rem',
            }}
            onClick={() => navigate('/portal/request')}
          >
            Create Your First Request
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        style={styles.fab}
        onClick={() => navigate('/portal/request')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 30, 63, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.3)';
        }}
        title="Create Model Request"
      >
        +
      </button>
    </div>
  );
}

