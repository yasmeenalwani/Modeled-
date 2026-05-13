import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getServiceById, formatPrice } from '../data/services';
import { mockProfessionals } from '../data/mockRequests';
import { getBookingsForUser } from '../../utils/bookingFlow';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getAllBookings, getBookingsBySalon, getBookingsByProfessional, getPendingBookings } from '../data/mockBookings';
import CalendarViewSwitcher from '../components/CalendarViewSwitcher';
import CalendarDashboard from '../components/CalendarDashboard';
import MonthView from '../components/MonthView';
import ListView from '../components/ListView';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
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
  
  // View selector
  viewSelector: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  viewBtn: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewBtnActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Filter selector (for salon/professional)
  filterSection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '10px',
  },
  filterLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.5rem',
  },
  filterSelect: {
    width: '100%',
    maxWidth: '400px',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  
  // Calendar
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
  
  // Calendar grid
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
    transition: 'all 0.2s ease',
  },
  eventHover: {
    transform: 'scale(1.05)',
    zIndex: 10,
  },
  
  // Event colors by status
  eventConfirmed: {
    background: 'rgba(76,175,80,0.3)',
    borderLeft: '3px solid #4caf50',
    color: '#4caf50',
  },
  eventPending: {
    background: 'rgba(255,193,7,0.3)',
    borderLeft: '3px solid #ffc107',
    color: '#ffc107',
  },
  eventCompleted: {
    background: 'rgba(33,150,243,0.3)',
    borderLeft: '3px solid #2196f3',
    color: '#2196f3',
  },
  eventCancelled: {
    background: 'rgba(244,67,54,0.3)',
    borderLeft: '3px solid #f44336',
    color: '#f44336',
  },
  
  // Selected day details
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
  eventDetailHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '0.75rem',
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
  eventDetailFees: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.75rem',
    fontSize: '0.8rem',
  },
  feeItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  feeLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.7rem',
  },
  feeValue: {
    fontWeight: '600',
  },
};

// Use enriched mock bookings from separate file

// Mock salons
const mockSalons = [
  { id: 'luxe', name: 'Luxe Studio', professionals: ['Sarah Mitchell'] },
  { id: 'cut', name: 'The Cut Collective', professionals: ['Mike Thompson'] },
  { id: 'color', name: 'Color Theory', professionals: ['Lisa Kim'] },
  { id: 'modern', name: 'Modern Mane', professionals: ['James Wilson'] },
  { id: 'glow', name: 'Glow Up Studio', professionals: ['Emily Chen'] },
  { id: 'hairlab', name: 'The Hair Lab', professionals: ['David Park'] },
];

export default function CalendarPage() {
  const { user } = useAuthenticator();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month', 'week', 'day', 'list', 'multi'
  const [viewMode, setViewMode] = useState('all'); // 'all', 'admin', 'salon', 'professional'
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [bookings, setBookings] = useState(() => getAllBookings());
  const [loading, setLoading] = useState(false);

  // Load bookings (including new ones from mock data)
  useEffect(() => {
    const allBookings = getAllBookings();
    setBookings(allBookings);
  }, []);

  // Filter bookings based on view mode and filters
  useEffect(() => {
    let filtered = [...getAllBookings()];

    // Apply view mode filters
    if (viewMode === 'salon' && selectedSalon) {
      filtered = getBookingsBySalon(selectedSalon);
    } else if (viewMode === 'professional' && selectedProfessional) {
      filtered = getBookingsByProfessional(parseInt(selectedProfessional));
    }

    // Apply active filter
    if (activeFilter) {
      if (activeFilter.type === 'status') {
        filtered = filtered.filter(b => b.status === activeFilter.value);
      } else if (activeFilter.type === 'date') {
        const today = new Date();
        if (activeFilter.value === 'today') {
          const todayStr = today.toISOString().split('T')[0];
          filtered = filtered.filter(b => b.date === todayStr);
        } else if (activeFilter.value === 'week') {
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          filtered = filtered.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate >= today && bookingDate <= weekEnd;
          });
        }
      }
    }

    setBookings(filtered);
  }, [viewMode, selectedSalon, selectedProfessional, activeFilter]);

  // Get current month/year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  // Use bookings directly (already in correct format)
  const filteredBookings = bookings;

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      const isCurrentMonth = dayDate.getMonth() === currentMonth;
      const isToday = dayDate.toDateString() === today.toDateString();
      
      // Get events for this day
      const dayEvents = filteredBookings.filter(booking => {
        const bookingDate = new Date(booking.date);
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
  }, [currentMonth, currentYear, filteredBookings, today]);

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Get month name
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Get selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const dayStr = selectedDay.toISOString().split('T')[0];
    return filteredBookings.filter(booking => booking.date === dayStr);
  }, [selectedDay, filteredBookings]);

  // Get event style
  const getEventStyle = (status) => {
    const baseStyle = styles.event;
    const statusStyle = {
      confirmed: styles.eventConfirmed,
      pending: styles.eventPending,
      completed: styles.eventCompleted,
      cancelled: styles.eventCancelled,
    }[status] || styles.eventPending;
    
    return { ...baseStyle, ...statusStyle };
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Calendar View 📅</h1>
          <p style={styles.subtitle}>
            {viewMode === 'all' && 'View all bookings across all salons and professionals'}
            {viewMode === 'admin' && 'Admin master view - all bookings with full details'}
            {viewMode === 'salon' && selectedSalon && `Viewing bookings for ${mockSalons.find(s => s.id === selectedSalon)?.name}`}
            {viewMode === 'professional' && selectedProfessional && `Viewing bookings for ${selectedProfessional}`}
          </p>
        </div>
      </div>

      {/* Calendar Dashboard */}
      <CalendarDashboard
        bookings={getAllBookings()}
        onFilterChange={(filter) => {
          setActiveFilter(filter);
          if (filter.type === 'date' && filter.value === 'today') {
            setSelectedDay(new Date());
          }
        }}
        onDateClick={(date) => {
          setSelectedDay(date);
          setSelectedEvent(null);
        }}
      />

      {/* Quick Filters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: activeFilter?.type === 'status' && activeFilter?.value === 'pending' 
              ? 'rgba(255,193,7,0.2)' 
              : 'rgba(255,255,255,0.05)',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'pending'
              ? '1px solid #ffc107'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: activeFilter?.type === 'status' && activeFilter?.value === 'pending'
              ? '#ffc107'
              : 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (activeFilter?.type === 'status' && activeFilter?.value === 'pending') {
              setActiveFilter(null);
            } else {
              setActiveFilter({ type: 'status', value: 'pending' });
            }
          }}
        >
          ⚠️ Pending ({getPendingBookings().length})
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: activeFilter?.type === 'status' && activeFilter?.value === 'confirmed'
              ? 'rgba(76,175,80,0.2)'
              : 'rgba(255,255,255,0.05)',
            border: activeFilter?.type === 'status' && activeFilter?.value === 'confirmed'
              ? '1px solid #4caf50'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: activeFilter?.type === 'status' && activeFilter?.value === 'confirmed'
              ? '#4caf50'
              : 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (activeFilter?.type === 'status' && activeFilter?.value === 'confirmed') {
              setActiveFilter(null);
            } else {
              setActiveFilter({ type: 'status', value: 'confirmed' });
            }
          }}
        >
          ✅ Confirmed
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: activeFilter?.type === 'date' && activeFilter?.value === 'week'
              ? 'rgba(102,126,234,0.2)'
              : 'rgba(255,255,255,0.05)',
            border: activeFilter?.type === 'date' && activeFilter?.value === 'week'
              ? '1px solid #667eea'
              : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            color: activeFilter?.type === 'date' && activeFilter?.value === 'week'
              ? '#667eea'
              : 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
            cursor: 'pointer',
          }}
          onClick={() => {
            if (activeFilter?.type === 'date' && activeFilter?.value === 'week') {
              setActiveFilter(null);
            } else {
              setActiveFilter({ type: 'date', value: 'week' });
            }
          }}
        >
          📆 This Week
        </button>
        {activeFilter && (
          <button
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            onClick={() => setActiveFilter(null)}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* View Selector */}
      <div style={styles.viewSelector}>
        <button
          style={{ ...styles.viewBtn, ...(viewMode === 'all' ? styles.viewBtnActive : {}) }}
          onClick={() => {
            setViewMode('all');
            setSelectedSalon(null);
            setSelectedProfessional(null);
            setActiveFilter(null);
          }}
        >
          🌐 All Bookings
        </button>
        <button
          style={{ ...styles.viewBtn, ...(viewMode === 'salon' ? styles.viewBtnActive : {}) }}
          onClick={() => {
            setViewMode('salon');
            setSelectedProfessional(null);
            setActiveFilter(null);
          }}
        >
          🏢 By Salon
        </button>
        <button
          style={{ ...styles.viewBtn, ...(viewMode === 'professional' ? styles.viewBtnActive : {}) }}
          onClick={() => {
            setViewMode('professional');
            setSelectedSalon(null);
            setActiveFilter(null);
          }}
        >
          ✂️ By Professional
        </button>
      </div>

      {/* Filter Section */}
      {(viewMode === 'salon' || viewMode === 'professional') && (
        <div style={styles.filterSection}>
          <div style={styles.filterLabel}>
            {viewMode === 'salon' ? 'Select Salon:' : 'Select Professional:'}
          </div>
          <select
            style={styles.filterSelect}
            value={viewMode === 'salon' ? (selectedSalon || '') : (selectedProfessional || '')}
            onChange={(e) => {
              if (viewMode === 'salon') {
                setSelectedSalon(e.target.value || null);
              } else {
                setSelectedProfessional(e.target.value || null);
              }
            }}
          >
            <option value="">-- Select {viewMode === 'salon' ? 'Salon' : 'Professional'} --</option>
            {viewMode === 'salon' ? (
              mockSalons.map(salon => (
                <option key={salon.id} value={salon.id}>
                  {salon.name}
                </option>
              ))
            ) : (
              mockProfessionals.map(pro => (
                <option key={pro.id} value={`${pro.firstName} ${pro.lastName}`}>
                  {pro.firstName} {pro.lastName} - {pro.salonName}
                </option>
              ))
            )}
          </select>
        </div>
      )}

      {/* Calendar */}
      <div style={styles.calendarContainer}>
        <div style={styles.calendarHeader}>
          <div style={styles.calendarMonth}>{monthName}</div>
          <div style={styles.calendarNav}>
            <button style={styles.navBtn} onClick={() => navigateMonth(-1)}>
              ← Previous
            </button>
            <button style={styles.navBtn} onClick={() => setCurrentDate(new Date())}>
              Today
            </button>
            <button style={styles.navBtn} onClick={() => navigateMonth(1)}>
              Next →
            </button>
          </div>
        </div>

        {/* Calendar View Switcher */}
        <CalendarViewSwitcher
          viewMode={calendarView}
          onViewChange={setCalendarView}
        />

        {/* Render appropriate view */}
        {calendarView === 'month' && (
          <MonthView
            calendarDays={calendarDays}
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
            onEventClick={setSelectedEvent}
          />
        )}

        {calendarView === 'list' && (
          <ListView
            bookings={filteredBookings}
            onEventClick={setSelectedEvent}
          />
        )}
      </div>

      {/* Selected Event Details */}
      {selectedEvent && (
        <div style={styles.selectedDayPanel}>
          <div style={styles.selectedDayTitle}>
            📅 {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div style={styles.eventDetails}>
            {(() => {
              const service = getServiceById(selectedEvent.serviceId);
              return (
                <div style={styles.eventDetailCard}>
                  <div style={styles.eventDetailHeader}>
                    <div>
                      <div style={styles.eventDetailTime}>{selectedEvent.time}</div>
                      <div style={styles.eventDetailService}>
                        {service?.icon} {service?.name || selectedEvent.serviceId}
                      </div>
                      <div style={styles.eventDetailPeople}>
                        👤 {selectedEvent.model.name} ↔ ✂️ {selectedEvent.professional.name}
                      </div>
                      <div style={styles.eventDetailLocation}>
                        📍 {selectedEvent.location}
                      </div>
                    </div>
                    <span style={getEventStyle(selectedEvent.status)}>
                      {selectedEvent.status}
                    </span>
                  </div>
                  {service && (
                    <div style={styles.eventDetailFees}>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Model Pays</div>
                        <div style={{ ...styles.feeValue, color: '#e94560' }}>
                          ${service.modelFee}
                        </div>
                      </div>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Pro Pays</div>
                        <div style={{ ...styles.feeValue, color: '#667eea' }}>
                          ${service.professionalFee}
                        </div>
                      </div>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Your Revenue</div>
                        <div style={{ ...styles.feeValue, color: '#4caf50' }}>
                          ${service.totalRevenue}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Selected Day Details (if no event selected) */}
      {selectedDay && !selectedEvent && selectedDayEvents.length > 0 && (
        <div style={styles.selectedDayPanel}>
          <div style={styles.selectedDayTitle}>
            📅 {selectedDay.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div style={styles.eventDetails}>
            {selectedDayEvents.map(event => {
              const service = getServiceById(event.serviceId);
              return (
                <div key={event.id} style={styles.eventDetailCard}>
                  <div style={styles.eventDetailHeader}>
                    <div>
                      <div style={styles.eventDetailTime}>{event.time}</div>
                      <div style={styles.eventDetailService}>
                        {service?.icon} {service?.name || event.serviceId}
                      </div>
                      <div style={styles.eventDetailPeople}>
                        👤 {event.model.name} ↔ ✂️ {event.professional.name}
                      </div>
                      <div style={styles.eventDetailLocation}>
                        📍 {event.location}
                      </div>
                    </div>
                    <span style={getEventStyle(event.status)}>
                      {event.status}
                    </span>
                  </div>
                  {service && (
                    <div style={styles.eventDetailFees}>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Model Pays</div>
                        <div style={{ ...styles.feeValue, color: '#e94560' }}>
                          ${service.modelFee}
                        </div>
                      </div>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Pro Pays</div>
                        <div style={{ ...styles.feeValue, color: '#667eea' }}>
                          ${service.professionalFee}
                        </div>
                      </div>
                      <div style={styles.feeItem}>
                        <div style={styles.feeLabel}>Your Revenue</div>
                        <div style={{ ...styles.feeValue, color: '#4caf50' }}>
                          ${service.totalRevenue}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedDay && selectedDayEvents.length === 0 && (
        <div style={styles.selectedDayPanel}>
          <div style={styles.selectedDayTitle}>
            📅 {selectedDay.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
            No bookings scheduled for this day
          </div>
        </div>
      )}
    </div>
  );
}

