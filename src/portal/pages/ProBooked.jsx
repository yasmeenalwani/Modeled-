import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getBookingsForUser } from '../../utils/bookingService';
import { getServiceById } from '../../admin/data/services';
import { 
  getMockProfessional, 
  getMockMatches, 
  createMockBooking, 
  getMockModel 
} from '../../utils/mockDataService';
import { downloadICSFile, getGoogleCalendarLink, getOutlookCalendarLink } from '../../utils/calendarUtils';

// ============ COLOR PALETTE ============
const paletteA = {
  haircut: {
    bg: 'rgba(200, 168, 130, 0.08)',
    border: 'rgba(200, 168, 130, 0.25)',
    accent: '#B89670',
    label: '#B89670',
  },
  color: {
    bg: 'rgba(168, 197, 176, 0.08)',
    border: 'rgba(168, 197, 176, 0.25)',
    accent: '#8FB09F',
    label: '#8FB09F',
  },
  blowdry: {
    bg: 'rgba(212, 165, 184, 0.08)',
    border: 'rgba(212, 165, 184, 0.25)',
    accent: '#C894A8',
    label: '#C894A8',
  },
  highlights: {
    bg: 'rgba(232, 200, 159, 0.08)',
    border: 'rgba(232, 200, 159, 0.25)',
    accent: '#D8B88F',
    label: '#D8B88F',
  },
  gloss: {
    bg: 'rgba(181, 196, 229, 0.08)',
    border: 'rgba(181, 196, 229, 0.25)',
    accent: '#A5B4D5',
    label: '#A5B4D5',
  },
  keratin: {
    bg: 'rgba(217, 196, 168, 0.08)',
    border: 'rgba(217, 196, 168, 0.25)',
    accent: '#C9B498',
    label: '#C9B498',
  },
};

// Helper functions
const calculateEndTime = (startTime, durationMinutes) => {
  const [time, period] = startTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  const startDate = new Date();
  startDate.setHours(hour24, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHours = endDate.getHours();
  const endMins = endDate.getMinutes();
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
  
  return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
};

const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const getServiceColors = (serviceType) => {
  return paletteA[serviceType] || paletteA.haircut;
};

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9',
    minHeight: '100vh',
  },
  pageHeader: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  viewToggle: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    justifyContent: 'flex-end',
  },
  toggleBtn: (isActive) => ({
    padding: '0.75rem 1.5rem',
    background: isActive ? 'rgba(139, 30, 63, 0.1)' : 'transparent',
    border: `2px solid ${isActive ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: isActive ? '#8B1E3F' : '#5A3A2A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  }),
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '2rem',
  },
  requestCard: {
    background: '#FFFEF9',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  requestCardHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 12px 40px rgba(139, 30, 63, 0.2)',
    borderColor: '#8B1E3F',
  },
  cardImage: {
    width: '100%',
    aspectRatio: '4/3',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.2), rgba(168, 90, 90, 0.15))',
    position: 'relative',
    overflow: 'hidden',
  },
  modelOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '0.75rem 1rem',
    background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
    color: '#FFFEF9',
    fontSize: '0.8rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardContent: {
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  cardMetaItem: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  // Calendar styles
  calendarCard: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  calendarHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  calendarMonth: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarViewToggle: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    padding: '0.25rem',
  },
  calendarViewBtn: (isActive) => ({
    padding: '0.5rem 1rem',
    background: isActive ? '#8B1E3F' : 'transparent',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: isActive ? '#FFFEF9' : '#5A3A2A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  }),
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  calendarNavBtn: {
    width: '36px',
    height: '36px',
    background: 'rgba(139, 30, 63, 0.08)',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '10px',
    color: '#4A2A1A',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
  calendarNavBtnHover: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F',
    transform: 'scale(1.05)',
  },
  todayBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '2px solid rgba(139, 30, 63, 0.25)',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.75rem',
    marginBottom: '2rem',
  },
  calendarDayHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: '"Alike", "Georgia", serif',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
  },
  calendarDayCell: {
    minHeight: '100px',
    padding: '0.75rem',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    border: '2px solid transparent',
  },
  calendarDayCellToday: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
  },
  calendarDayCellSelected: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.2)',
  },
  calendarDayCellHasBookings: {
    background: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(139, 30, 63, 0.2)',
  },
  calendarDayNumber: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    alignSelf: 'flex-start',
  },
  calendarDayBookings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    width: '100%',
    flex: 1,
  },
  calendarBookingItem: (colors) => ({
    padding: '0.4rem 0.6rem',
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.2')}, ${colors.bg})`,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: colors.accent,
    fontFamily: '"Alike", "Georgia", serif',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  }),
  calendarBookingTime: {
    fontSize: '0.65rem',
    fontWeight: '700',
    marginBottom: '0.2rem',
    opacity: 0.9,
  },
  calendarBookingService: {
    fontSize: '0.7rem',
    opacity: 0.85,
  },
  calendarDayMore: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#8B1E3F',
    textAlign: 'center',
    padding: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectedDayPanel: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  selectedDayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  selectedDayTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectedDayClose: {
    width: '28px',
    height: '28px',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: '700',
    transition: 'all 0.2s ease',
  },
  selectedDayBookings: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  selectedDayBookingCard: (colors) => ({
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
    border: `2px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  }),
  selectedDayBookingInfo: {
    flex: 1,
  },
  selectedDayBookingTime: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectedDayBookingModel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#5A3A2A',
    marginBottom: '0.15rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectedDayBookingService: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ProBooked() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarViewType, setCalendarViewType] = useState('month'); // 'month' or 'week'
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadBookings, 30000);
    
    // Refresh when window regains focus (user returns to tab)
    const handleFocus = () => {
      loadBookings();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const professional = getMockProfessional('mock-pro-1');
      
      if (!professional) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      let loadedBookings = await getBookingsForUser(professional.userId, 'professional');
      
      // Filter to only confirmed/booked sessions
      let confirmedBookings = loadedBookings.filter(b => 
        b.status === 'confirmed' || b.status === 'booked'
      );
      
      // If no bookings, create sample bookings from accepted matches or create demo bookings
      if (confirmedBookings.length === 0) {
        const acceptedMatches = getMockMatches({ status: 'accepted' });
        
        const createdBookings = [];
        
        if (acceptedMatches.length > 0) {
          // Create bookings from accepted matches
          for (const match of acceptedMatches.slice(0, 2)) { // Use up to 2 accepted matches
            const model = getMockModel(match.modelId);
            const service = getServiceById(match.serviceType || 'color');
            
            const booking = createMockBooking({
              matchId: match.id,
              requestId: match.requestId,
              modelId: match.modelId,
              professionalId: professional.id,
              appointmentDate: new Date(Date.now() + (createdBookings.length + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              appointmentTime: '2:00 PM',
              duration: service?.duration || 180,
              serviceType: match.serviceType || 'color',
              serviceDescription: service?.description || 'Full color treatment',
              location: professional.salonAddress || 'Luxe Studio - 123 Main St, NYC',
              modelFee: service?.modelFee || 30,
              status: 'confirmed',
              modelName: model ? `${model.firstName} ${model.lastName}`.trim() : 'Seraphina Luna',
              modelHeadshotUrl: model?.headshotUrl || model?.photoUrls?.[0],
              modelEmail: model?.email || 'seraphina@example.com',
              modelPhone: model?.phone || '(555) 123-4567',
              bookingId: `BK-2024-${String(createdBookings.length + 1).padStart(4, '0')}`,
            });
            
            createdBookings.push(booking);
          }
        } else {
          const model = getMockModel('mock-model-1'); // Seraphina Luna
          
          const demoBookings = [
            {
              serviceType: 'color',
              serviceDescription: 'Full color treatment with balayage highlights',
              appointmentTime: '2:00 PM',
              duration: 180,
            },
            {
              serviceType: 'haircut',
              serviceDescription: 'Precision cut with texturizing',
              appointmentTime: '10:00 AM',
              duration: 60,
            },
            {
              serviceType: 'blowdry',
              serviceDescription: 'Signature blowout with volume finish',
              appointmentTime: '4:30 PM',
              duration: 45,
            },
            {
              serviceType: 'highlights',
              serviceDescription: 'Soft face-framing highlights',
              appointmentTime: '11:15 AM',
              duration: 150,
            },
          ];
          
          demoBookings.forEach((demo, index) => {
            const service = getServiceById(demo.serviceType);
            const bookingDate = new Date();
            bookingDate.setDate(bookingDate.getDate() + (index + 1) * 3); // 3 days apart
            
            const booking = createMockBooking({
              modelId: model.id,
              professionalId: professional.id,
              appointmentDate: bookingDate.toISOString().split('T')[0],
              appointmentTime: demo.appointmentTime,
              duration: demo.duration,
              serviceType: demo.serviceType,
              serviceDescription: demo.serviceDescription,
              location: professional.salonAddress || 'Luxe Studio - 123 Main St, NYC',
              modelFee: service?.modelFee || 30,
              status: 'confirmed',
              modelName: `${model.firstName} ${model.lastName}`.trim(),
              modelHeadshotUrl: model?.headshotUrl || model?.photoUrls?.[0],
              modelEmail: model.email,
              modelPhone: model.phone,
              bookingId: `BK-2024-${String(index + 1).padStart(4, '0')}`,
            });
            
            createdBookings.push(booking);
          });
        }
        
        confirmedBookings = createdBookings;
      }
      
      setBookings(confirmedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (e, booking) => {
    e.stopPropagation();
    navigate('/portal/chat', { state: { modelId: booking.modelId, modelName: booking.modelName } });
  };

  const handleViewProfile = (e, booking) => {
    e.stopPropagation();
    navigate('/portal/model/profile', { state: { modelId: booking.modelId } });
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    if (!date) return [];
    return bookings.filter(b => {
      const bookingDate = new Date(b.appointmentDate);
      return bookingDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      // Sort by time
      const timeA = a.appointmentTime || '12:00 PM';
      const timeB = b.appointmentTime || '12:00 PM';
      return timeA.localeCompare(timeB);
    });
  };

  // Render Calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    const totalDays = calendarViewType === 'week' ? 7 : 42;
    
    for (let i = 0; i < totalDays; i++) {
      const dayDate = new Date(current);
      const dayOfMonth = dayDate.getDate();
      const isCurrentMonth = dayDate.getMonth() === month;
      
      const dayBookings = bookings.filter(b => {
        const bookingDate = new Date(b.appointmentDate);
        return bookingDate.toDateString() === dayDate.toDateString();
      });
      
      const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: dayDate,
        day: isCurrentMonth ? dayOfMonth : null,
        isCurrentMonth,
        isToday: dayDate.toDateString() === new Date().toDateString(),
        bookings: dayBookings,
        isSelected,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const selectedDayBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
    
    const goToToday = () => {
      setCurrentMonth(new Date());
      setSelectedDate(new Date());
    };
    
    return (
      <>
        <div style={styles.calendarCard}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarHeaderLeft}>
              <div style={styles.calendarMonth}>{monthName}</div>
              <div style={styles.calendarViewToggle}>
                <button
                  style={styles.calendarViewBtn(calendarViewType === 'month')}
                  onClick={() => setCalendarViewType('month')}
                >
                  Month
                </button>
                <button
                  style={styles.calendarViewBtn(calendarViewType === 'week')}
                  onClick={() => setCalendarViewType('week')}
                >
                  Week
                </button>
              </div>
            </div>
            <div style={styles.calendarNav}>
              <button
                style={styles.todayBtn}
                onClick={goToToday}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
                  e.currentTarget.style.borderColor = '#8B1E3F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.25)';
                }}
              >
                Today
              </button>
              <button
                style={styles.calendarNavBtn}
                onClick={() => {
                  const newDate = new Date(year, month - 1, 1);
                  setCurrentMonth(newDate);
                }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.calendarNavBtnHover)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ←
              </button>
              <button
                style={styles.calendarNavBtn}
                onClick={() => {
                  const newDate = new Date(year, month + 1, 1);
                  setCurrentMonth(newDate);
                }}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.calendarNavBtnHover)}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                →
              </button>
            </div>
          </div>
          
          <div style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.calendarDayHeader}>{day}</div>
            ))}
            
            {days.map((day, index) => {
              const cellStyle = {
                ...styles.calendarDayCell,
                background: day.isSelected 
                  ? 'rgba(139, 30, 63, 0.15)' 
                  : day.isToday 
                    ? 'rgba(139, 30, 63, 0.1)' 
                    : day.isCurrentMonth 
                      ? (day.bookings.length > 0 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 254, 249, 0.6)')
                      : 'rgba(139, 30, 63, 0.02)',
                opacity: day.isCurrentMonth ? 1 : 0.4,
                border: day.isSelected 
                  ? '2px solid #8B1E3F' 
                  : day.isToday 
                    ? '2px solid #8B1E3F' 
                    : day.bookings.length > 0 
                      ? '2px solid rgba(139, 30, 63, 0.2)'
                      : '2px solid transparent',
                boxShadow: day.isSelected ? '0 4px 12px rgba(139, 30, 63, 0.2)' : 'none',
              };
              
              return (
                <div
                  key={index}
                  style={cellStyle}
                  onClick={() => {
                    if (day.isCurrentMonth && day.day) {
                      setSelectedDate(day.date);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (day.isCurrentMonth && day.day && !day.isSelected) {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
                      e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!day.isSelected) {
                      e.currentTarget.style.background = cellStyle.background;
                      e.currentTarget.style.borderColor = cellStyle.border;
                    }
                  }}
                >
                  {day.day && (
                    <>
                      <div style={styles.calendarDayNumber}>{day.day}</div>
                      {day.bookings.length > 0 && (
                        <div style={styles.calendarDayBookings}>
                          {day.bookings.slice(0, 2).map((booking, idx) => {
                            const colors = getServiceColors(booking.serviceType || 'haircut');
                            const service = getServiceById(booking.serviceType || 'haircut');
                            return (
                              <div
                                key={idx}
                                style={styles.calendarBookingItem(colors)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDate(day.date);
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                  e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}80`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'scale(1)';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              >
                                <div style={styles.calendarBookingTime}>
                                  {booking.appointmentTime || '2:00 PM'}
                                </div>
                                <div style={styles.calendarBookingService}>
                                  {service?.name?.substring(0, 12) || booking.serviceType || 'Service'}
                                </div>
                              </div>
                            );
                          })}
                          {day.bookings.length > 2 && (
                            <div style={styles.calendarDayMore}>
                              +{day.bookings.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {selectedDate && selectedDayBookings.length > 0 && (
          <div style={styles.selectedDayPanel}>
            <div style={styles.selectedDayHeader}>
              <div style={styles.selectedDayTitle}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <button
                style={styles.selectedDayClose}
                onClick={() => setSelectedDate(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.2)';
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.selectedDayBookings}>
              {selectedDayBookings.map((booking, idx) => {
                const colors = getServiceColors(booking.serviceType || 'haircut');
                const service = getServiceById(booking.serviceType || 'haircut');
                const endTime = calculateEndTime(booking.appointmentTime || '2:00 PM', booking.duration || 60);
                
                return (
                  <div
                    key={idx}
                    style={styles.selectedDayBookingCard(colors)}
                    onClick={() => {
                      setSelectedBooking(booking);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}60`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={styles.selectedDayBookingInfo}>
                      <div style={styles.selectedDayBookingTime}>
                        {booking.appointmentTime || '2:00 PM'} - {endTime}
                      </div>
                      <div style={styles.selectedDayBookingModel}>
                        {(booking.modelName || 'Model').split(' ')[0]}
                      </div>
                      <div style={styles.selectedDayBookingService}>
                        {service?.name || booking.serviceType || 'Service'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading bookings...</div>
      </div>
    );
  }

  if (viewMode === 'calendar') {
    return (
      <div style={styles.container}>
        <div style={styles.viewToggle}>
          <button
            style={styles.toggleBtn(false)}
            onClick={() => setViewMode('cards')}
          >
            Cards View
          </button>
          <button
            style={styles.toggleBtn(true)}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
        </div>
        {renderCalendar()}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.viewToggle}>
        <button
          style={styles.toggleBtn(true)}
          onClick={() => setViewMode('cards')}
        >
          Cards View
        </button>
        <button
          style={styles.toggleBtn(false)}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
      </div>

      {bookings.length === 0 ? (
        <div style={styles.empty}>
          <p>No booked sessions yet.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Start by creating a request in the <strong>Matching</strong> section.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {bookings.map((booking, index) => {
            const serviceTypeCycle = ['color', 'haircut', 'blowdry', 'highlights'];
            const fallbackNames = {
              color: 'Color',
              haircut: 'Haircut',
              blowdry: 'Blowdry',
              highlights: 'Highlights',
            };
            const serviceType = booking.serviceType || serviceTypeCycle[index % serviceTypeCycle.length];
            const service = getServiceById(serviceType);
            const serviceNameCycle = ['Color', 'Haircut', 'Blowdry', 'Highlights', 'Gloss', 'Treatment'];
            const serviceName = service?.name || fallbackNames[serviceType] || serviceNameCycle[index % serviceNameCycle.length] || serviceType;
            const bookingEndTime = calculateEndTime(booking.appointmentTime || '2:00 PM', booking.duration || 60);
            const formattedDate = new Date(booking.appointmentDate || new Date()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const salonName = booking.location ? booking.location.split(' - ')[0] : 'Luxe Studio';
            const fullName = booking.modelName || (booking.modelId ? (getMockModel(booking.modelId)?.firstName + ' ' + (getMockModel(booking.modelId)?.lastName || '')) : null) || ['Seraphina', 'Ava', 'Isla', 'Maya', 'Noa', 'Lena'][index % 6] + ' Model';
            const modelFirstName = fullName?.split(' ')[0] || 'Model';
            const rawId = booking.id;
            const cardId = (typeof rawId === 'string' || typeof rawId === 'number')
              ? rawId
              : `booking-${index}`;
            
            return (
              <div
                key={cardId}
                data-booking-id={String(cardId)}
                style={{
                  ...styles.requestCard,
                  ...(hoveredCard === cardId ? styles.requestCardHover : {}),
                }}
                onMouseEnter={() => setHoveredCard(cardId)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => setSelectedBooking(booking)}
              >
                <div style={styles.cardImage}>
                  <div style={styles.modelOverlay}>{modelFirstName}</div>
                </div>
                <div style={styles.cardContent}>
                  <div style={styles.cardTitle}>{serviceName}</div>
                  <div style={styles.cardMeta}>
                    <div style={styles.cardMetaItem}>{formattedDate}</div>
                    <div style={styles.cardMetaItem}>
                      {booking.appointmentTime || '2:00 PM'} - {bookingEndTime}
                    </div>
                    <div style={styles.cardMetaItem}>{salonName}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal with Calendar Invites */}
      {selectedBooking && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem',
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            style={{
              background: '#FFFEF9',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: '3px solid rgba(139, 30, 63, 0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '32px',
                height: '32px',
                background: 'rgba(139, 30, 63, 0.1)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                color: '#8B1E3F',
                fontFamily: '"Roboto", "Arial", sans-serif',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setSelectedBooking(null)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 30, 63, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(139, 30, 63, 0.1)' }}>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#4A2A1A',
                fontFamily: '"Roboto", "Arial", sans-serif',
                marginBottom: '0.5rem',
              }}>
                {(selectedBooking.modelName || 'Model').split(' ')[0]}
              </div>
              <div style={{
                fontSize: '0.95rem',
                color: '#5A3A2A',
                fontFamily: '"Roboto", "Arial", sans-serif',
                fontWeight: '500',
              }}>
                {selectedBooking.appointmentTime} - {calculateEndTime(selectedBooking.appointmentTime || '2:00 PM', selectedBooking.duration || 60)}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#4A2A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem',
                fontFamily: '"Roboto", "Arial", sans-serif',
              }}>
                Service Details
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
                fontSize: '0.9rem',
                fontFamily: '"Roboto", "Arial", sans-serif',
              }}>
                <span style={{ fontWeight: '600', color: '#5A3A2A', minWidth: '100px' }}>Service:</span>
                <span style={{ color: '#4A2A1A', textAlign: 'right', flex: 1 }}>
                  {getServiceById(selectedBooking.serviceType)?.name || selectedBooking.serviceType}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
                fontSize: '0.9rem',
                fontFamily: '"Roboto", "Arial", sans-serif',
              }}>
                <span style={{ fontWeight: '600', color: '#5A3A2A', minWidth: '100px' }}>Duration:</span>
                <span style={{ color: '#4A2A1A', textAlign: 'right', flex: 1 }}>{selectedBooking.duration || 60} minutes</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '0.75rem 0',
                borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
                fontSize: '0.9rem',
                fontFamily: '"Roboto", "Arial", sans-serif',
              }}>
                <span style={{ fontWeight: '600', color: '#5A3A2A', minWidth: '100px' }}>Location:</span>
                <span style={{ color: '#4A2A1A', textAlign: 'right', flex: 1 }}>
                  {selectedBooking.location?.split(' - ')[0] || 'Luxe Studio'}
                </span>
              </div>
            </div>
            
            {/* Add to Calendar Section */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#4A2A1A',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem',
                fontFamily: '"Roboto", "Arial", sans-serif',
              }}>
                Add to Calendar
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <button
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(46, 160, 67, 0.1)',
                    border: '1px solid rgba(46, 160, 67, 0.2)',
                    borderRadius: '4px',
                    color: '#3fb950',
                    cursor: 'pointer',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    const googleLink = getGoogleCalendarLink(selectedBooking);
                    window.open(googleLink, '_blank');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(46, 160, 67, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(46, 160, 67, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(46, 160, 67, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(46, 160, 67, 0.2)';
                  }}
                >
                  <span>📅</span>
                  <span>Add to Google Calendar</span>
                </button>
                
                <button
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(0, 120, 212, 0.1)',
                    border: '1px solid rgba(0, 120, 212, 0.2)',
                    borderRadius: '4px',
                    color: '#0078d4',
                    cursor: 'pointer',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    const outlookLink = getOutlookCalendarLink(selectedBooking);
                    window.open(outlookLink, '_blank');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 120, 212, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(0, 120, 212, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 120, 212, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 120, 212, 0.2)';
                  }}
                >
                  <span>📧</span>
                  <span>Add to Outlook</span>
                </button>
                
                <button
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(139, 30, 63, 0.1)',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    borderRadius: '4px',
                    color: '#8B1E3F',
                    cursor: 'pointer',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => {
                    downloadICSFile(selectedBooking);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                  }}
                >
                  <span>📥</span>
                  <span>Download .ics File</span>
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
            }}>
              <button
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  background: 'rgba(139, 30, 63, 0.1)',
                  border: '1px solid rgba(139, 30, 63, 0.2)',
                  borderRadius: '4px',
                  color: '#8B1E3F',
                  cursor: 'pointer',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  navigate('/pro-portal/chat', { state: { modelId: selectedBooking.modelId, modelName: selectedBooking.modelName } });
                  setSelectedBooking(null);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                }}
              >
                Message Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
