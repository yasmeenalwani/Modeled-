import React, { useState, useMemo } from 'react';
import { getServiceById } from '../../admin/data/services';
import { 
  getMockProfessional, 
  createMockBooking, 
  getMockModel 
} from '../../utils/mockDataService';

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

const getServiceColors = (serviceType) => {
  return paletteA[serviceType] || paletteA.haircut;
};

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

// Generate mock bookings
const generateMockBookings = () => {
  try {
    const professional = getMockProfessional('mock-pro-1');
    const model = getMockModel('mock-model-1');
    
    if (!professional || !model) {
      console.warn('Mock professional or model not found, using fallback data');
      return [];
    }
    
    const bookings = [];
    
    const services = [
      { type: 'color', time: '10:00 AM', duration: 180, dateOffset: 2 },
      { type: 'haircut', time: '2:00 PM', duration: 60, dateOffset: 3 },
      { type: 'highlights', time: '11:00 AM', duration: 240, dateOffset: 5 },
      { type: 'blowdry', time: '3:00 PM', duration: 45, dateOffset: 7 },
      { type: 'gloss', time: '1:00 PM', duration: 90, dateOffset: 10 },
    ];
    
    services.forEach((service, index) => {
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + service.dateOffset);
      
      const serviceDetails = getServiceById(service.type);
      const booking = createMockBooking({
        modelId: model.id || 'mock-model-1',
        professionalId: professional.id || 'mock-pro-1',
        appointmentDate: bookingDate.toISOString().split('T')[0],
        appointmentTime: service.time,
        duration: service.duration,
        serviceType: service.type,
        serviceDescription: serviceDetails?.description || `${service.type} service`,
        location: professional.salonAddress || 'Luxe Studio - 123 Main St, NYC',
        modelFee: serviceDetails?.modelFee || 30,
        status: 'confirmed',
        modelName: model ? `${model.firstName} ${model.lastName}` : 'Seraphina Luna',
        modelEmail: model?.email || 'seraphina@example.com',
        modelPhone: model?.phone || '(555) 123-4567',
        bookingId: `BK-2024-${String(index + 1).padStart(4, '0')}`,
      });
      
      bookings.push(booking);
    });
    
    return bookings;
  } catch (error) {
    console.error('Error generating mock bookings:', error);
    return [];
  }
};

export default function BookedCalendarDesignDemo() {
  const [selectedStyle, setSelectedStyle] = useState('timeline');
  const bookings = useMemo(() => generateMockBookings(), []);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Safety check
  if (!bookings || bookings.length === 0) {
    return (
      <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto', background: '#FFFEF9', minHeight: '100vh' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Booked Calendar Design Options
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
      background: '#FFFEF9',
      minHeight: '100vh',
    },
    header: {
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
    styleSelector: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      padding: '1rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
    },
    styleBtn: (isActive) => ({
      padding: '0.75rem 1.5rem',
      background: isActive ? '#8B1E3F' : 'transparent',
      border: `2px solid ${isActive ? '#8B1E3F' : 'rgba(139, 30, 63, 0.3)'}`,
      borderRadius: '10px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: isActive ? '#FFFEF9' : '#5A3A2A',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s ease',
    }),
    
    // STYLE 1: Timeline Calendar
    timelineContainer: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '2rem',
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    timelineSidebar: {
      borderRight: '2px solid rgba(139, 30, 63, 0.15)',
      paddingRight: '2rem',
    },
    timelineMonth: {
      fontSize: '1.3rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '1.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineDays: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    timelineDay: (isSelected, hasBookings) => ({
      padding: '1rem',
      borderRadius: '12px',
      background: isSelected 
        ? 'rgba(139, 30, 63, 0.15)' 
        : hasBookings 
          ? 'rgba(139, 30, 63, 0.05)' 
          : 'transparent',
      border: `2px solid ${isSelected ? '#8B1E3F' : hasBookings ? 'rgba(139, 30, 63, 0.2)' : 'transparent'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    timelineDayNumber: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineDayName: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineDayCount: {
      fontSize: '0.7rem',
      color: '#8B1E3F',
      marginTop: '0.25rem',
      fontWeight: '600',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    timelineBooking: (colors) => ({
      padding: '1.25rem',
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '16px',
      display: 'grid',
      gridTemplateColumns: '80px 1fr auto',
      gap: '1.5rem',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    timelineTime: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    timelineModel: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineService: (colors) => ({
      fontSize: '0.85rem',
      fontWeight: '600',
      color: colors.accent,
      fontFamily: '"Alike", "Georgia", serif',
    }),
    timelineLocation: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    timelineBadge: (colors) => ({
      padding: '0.5rem 1rem',
      background: colors.accent,
      color: '#FFFEF9',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      fontFamily: '"Alike", "Georgia", serif',
    }),
    
    // STYLE 2: Grid Calendar with Details
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1rem',
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    gridDayHeader: {
      padding: '1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontFamily: '"Alike", "Georgia", serif',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '10px',
    },
    gridDayCell: (isSelected, hasBookings, isToday) => ({
      minHeight: '180px',
      padding: '1rem',
      borderRadius: '12px',
      background: isSelected 
        ? 'rgba(139, 30, 63, 0.15)' 
        : isToday 
          ? 'rgba(139, 30, 63, 0.1)' 
          : hasBookings 
            ? 'rgba(255, 255, 255, 0.8)' 
            : '#FFFEF9',
      border: `2px solid ${isSelected ? '#8B1E3F' : isToday ? '#8B1E3F' : hasBookings ? 'rgba(139, 30, 63, 0.2)' : 'rgba(139, 30, 63, 0.1)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }),
    gridDayNumber: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    gridBooking: (colors) => ({
      padding: '0.75rem',
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.2')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    gridBookingTime: {
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    gridBookingModel: {
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#4A2A1A',
      marginBottom: '0.15rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    gridBookingService: (colors) => ({
      fontSize: '0.65rem',
      color: colors.accent,
      fontFamily: '"Alike", "Georgia", serif',
    }),
    
    // STYLE 3: Week View with Time Slots
    weekContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    weekHeader: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    weekTimeColumn: {
      padding: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      fontFamily: '"Alike", "Georgia", serif',
    },
    weekDayHeader: {
      padding: '1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      fontFamily: '"Alike", "Georgia", serif',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '10px',
    },
    weekGrid: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      gap: '0.5rem',
    },
    weekTimeSlot: {
      padding: '0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
    },
    weekDayCell: {
      minHeight: '60px',
      padding: '0.5rem',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
      position: 'relative',
    },
    weekBooking: (colors, startHour, duration) => ({
      position: 'absolute',
      top: `${(startHour - 8) * 60}px`,
      left: '0.5rem',
      right: '0.5rem',
      height: `${(duration / 60) * 60}px`,
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.25')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    }),
    weekBookingTime: {
      fontSize: '0.7rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    weekBookingModel: {
      fontSize: '0.65rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    weekBookingService: (colors) => ({
      fontSize: '0.6rem',
      color: colors.accent,
      fontFamily: '"Alike", "Georgia", serif',
    }),
    
    // STYLE 4: Magazine Spread Calendar
    magazineContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 400px',
      gap: '2rem',
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    magazineCalendar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.75rem',
    },
    magazineDayHeader: {
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
    magazineDayCell: (isSelected, hasBookings) => ({
      aspectRatio: '1',
      padding: '0.75rem',
      borderRadius: '12px',
      background: isSelected 
        ? 'rgba(139, 30, 63, 0.15)' 
        : hasBookings 
          ? 'rgba(255, 255, 255, 0.8)' 
          : '#FFFEF9',
      border: `2px solid ${isSelected ? '#8B1E3F' : hasBookings ? 'rgba(139, 30, 63, 0.2)' : 'rgba(139, 30, 63, 0.1)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }),
    magazineDayNumber: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    magazineDot: (colors) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: colors.accent,
    }),
    magazineSidebar: {
      borderLeft: '2px solid rgba(139, 30, 63, 0.15)',
      paddingLeft: '2rem',
    },
    magazineSelectedDate: {
      fontSize: '1.2rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '1.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    magazineBookings: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    magazineBooking: (colors) => ({
      padding: '1.25rem',
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
    magazineBookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    magazineBookingTime: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    magazineBookingBadge: (colors) => ({
      padding: '0.4rem 0.8rem',
      background: colors.accent,
      color: '#FFFEF9',
      borderRadius: '20px',
      fontSize: '0.7rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      fontFamily: '"Alike", "Georgia", serif',
    }),
    magazineBookingModel: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    magazineBookingService: (colors) => ({
      fontSize: '0.85rem',
      fontWeight: '600',
      color: colors.accent,
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    }),
    magazineBookingLocation: {
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
    },
  };

  // Get bookings for a date
  const getBookingsForDate = (date) => {
    if (!date) return [];
    return bookings.filter(b => {
      const bookingDate = new Date(b.appointmentDate);
      return bookingDate.toDateString() === date.toDateString();
    }).sort((a, b) => {
      const timeA = a.appointmentTime || '12:00 PM';
      const timeB = b.appointmentTime || '12:00 PM';
      return timeA.localeCompare(timeB);
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      const dayOfMonth = dayDate.getDate();
      const isCurrentMonth = dayDate.getMonth() === month;
      const dayBookings = getBookingsForDate(dayDate);
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
      
      days.push({
        date: dayDate,
        day: isCurrentMonth ? dayOfMonth : null,
        isCurrentMonth,
        isToday,
        isSelected,
        bookings: dayBookings,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Render Style 1: Timeline Calendar
  const renderTimeline = () => {
    const days = generateCalendarDays();
    const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Get unique dates with bookings
    const datesWithBookings = [...new Set(bookings.map(b => b.appointmentDate))].map(date => new Date(date));
    
    return (
      <div style={styles.timelineContainer}>
        <div style={styles.timelineSidebar}>
          <div style={styles.timelineMonth}>{monthName}</div>
          <div style={styles.timelineDays}>
            {datesWithBookings.map((date, idx) => {
              const dayBookings = getBookingsForDate(date);
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
              
              return (
                <div
                  key={idx}
                  style={styles.timelineDay(isSelected, dayBookings.length > 0)}
                  onClick={() => setSelectedDate(date)}
                >
                  <div style={styles.timelineDayNumber}>{date.getDate()}</div>
                  <div style={styles.timelineDayName}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  {dayBookings.length > 0 && (
                    <div style={styles.timelineDayCount}>
                      {dayBookings.length} {dayBookings.length === 1 ? 'booking' : 'bookings'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div style={styles.timelineContent}>
          {selectedBookings.length > 0 ? (
            selectedBookings.map((booking, idx) => {
              const colors = getServiceColors(booking.serviceType || 'haircut');
              const service = getServiceById(booking.serviceType || 'haircut');
              const endTime = calculateEndTime(booking.appointmentTime || '2:00 PM', booking.duration || 60);
              
              return (
                <div
                  key={idx}
                  style={styles.timelineBooking(colors)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px ${colors.border}60`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={styles.timelineTime}>
                    {booking.appointmentTime || '2:00 PM'}
                    <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginTop: '0.25rem' }}>
                      - {endTime}
                    </div>
                  </div>
                  <div style={styles.timelineInfo}>
                    <div style={styles.timelineModel}>{booking.modelName || 'Model'}</div>
                    <div style={styles.timelineService(colors)}>
                      {service?.name || booking.serviceType || 'Service'}
                    </div>
                    <div style={styles.timelineLocation}>
                      {booking.location?.split(' - ')[0] || 'Luxe Studio'}
                    </div>
                  </div>
                  <div style={styles.timelineBadge(colors)}>
                    {service?.name?.substring(0, 8).toUpperCase() || booking.serviceType?.toUpperCase() || 'SERVICE'}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              Select a date to view bookings
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Style 2: Grid Calendar with Details
  const renderGrid = () => {
    const days = generateCalendarDays();
    
    return (
      <div style={styles.gridContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={styles.gridDayHeader}>{day}</div>
        ))}
        
        {days.map((day, idx) => {
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={idx}
              style={styles.gridDayCell(isSelected, day.bookings.length > 0, day.isToday)}
              onClick={() => day.isCurrentMonth && day.day && setSelectedDate(day.date)}
            >
              {day.day && (
                <>
                  <div style={styles.gridDayNumber}>{day.day}</div>
                  {day.bookings.map((booking, bidx) => {
                    const colors = getServiceColors(booking.serviceType || 'haircut');
                    const service = getServiceById(booking.serviceType || 'haircut');
                    
                    return (
                      <div
                        key={bidx}
                        style={styles.gridBooking(colors)}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDate(day.date);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}80`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={styles.gridBookingTime}>
                          {booking.appointmentTime || '2:00 PM'}
                        </div>
                        <div style={styles.gridBookingModel}>
                          {booking.modelName?.split(' ')[0] || 'Model'}
                        </div>
                        <div style={styles.gridBookingService(colors)}>
                          {service?.name?.substring(0, 10) || booking.serviceType || 'Service'}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render Style 3: Week View with Time Slots
  const renderWeekView = () => {
    const startOfWeek = new Date(currentMonth);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      timeSlots.push(hour);
    }
    
    return (
      <div style={styles.weekContainer}>
        <div style={styles.weekHeader}>
          <div style={styles.weekTimeColumn}>Time</div>
          {weekDays.map((date, idx) => (
            <div key={idx} style={styles.weekDayHeader}>
              <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{date.getDate()}</div>
            </div>
          ))}
        </div>
        
        <div style={styles.weekGrid}>
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div style={styles.weekTimeSlot}>
                {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
              </div>
              {weekDays.map((date, dayIdx) => {
                const dayBookings = getBookingsForDate(date).filter(b => {
                  const time = b.appointmentTime || '2:00 PM';
                  const [timePart, period] = time.split(' ');
                  const [hours] = timePart.split(':').map(Number);
                  const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                  return hour24 >= hour && hour24 < hour + 1;
                });
                
                return (
                  <div key={dayIdx} style={styles.weekDayCell}>
                    {dayBookings.map((booking, bidx) => {
                      const colors = getServiceColors(booking.serviceType || 'haircut');
                      const service = getServiceById(booking.serviceType || 'haircut');
                      const time = booking.appointmentTime || '2:00 PM';
                      const [timePart, period] = time.split(' ');
                      const [hours, minutes] = timePart.split(':').map(Number);
                      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                      const startMinutes = hour24 * 60 + (minutes || 0);
                      const startHour = startMinutes / 60;
                      
                      // Only render if booking is within visible hours (8 AM - 8 PM)
                      if (startHour < 8 || startHour >= 20) return null;
                      
                      return (
                        <div
                          key={bidx}
                          style={styles.weekBooking(colors, startHour, booking.duration || 60)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.zIndex = '10';
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}80`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.zIndex = '1';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={styles.weekBookingTime}>
                            {booking.appointmentTime || '2:00 PM'}
                          </div>
                          <div>
                            <div style={styles.weekBookingModel}>
                              {booking.modelName?.split(' ')[0] || 'Model'}
                            </div>
                            <div style={styles.weekBookingService(colors)}>
                              {service?.name || booking.serviceType || 'Service'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render Style 4: Magazine Spread Calendar
  const renderMagazine = () => {
    const days = generateCalendarDays();
    const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return (
      <div style={styles.magazineContainer}>
        <div>
          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '1.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
            {monthName}
          </div>
          <div style={styles.magazineCalendar}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.magazineDayHeader}>{day}</div>
            ))}
            
            {days.map((day, idx) => {
              const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
              
              return (
                <div
                  key={idx}
                  style={styles.magazineDayCell(isSelected, day.bookings.length > 0)}
                  onClick={() => day.isCurrentMonth && day.day && setSelectedDate(day.date)}
                >
                  {day.day && (
                    <>
                      <div style={styles.magazineDayNumber}>{day.day}</div>
                      {day.bookings.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {day.bookings.slice(0, 3).map((booking, bidx) => {
                            const colors = getServiceColors(booking.serviceType || 'haircut');
                            return <div key={bidx} style={styles.magazineDot(colors)} />;
                          })}
                          {day.bookings.length > 3 && (
                            <div style={{ fontSize: '0.6rem', color: '#5A3A2A' }}>+{day.bookings.length - 3}</div>
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
        
        <div style={styles.magazineSidebar}>
          {selectedDate ? (
            <>
              <div style={styles.magazineSelectedDate}>
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div style={styles.magazineBookings}>
                {selectedBookings.length > 0 ? (
                  selectedBookings.map((booking, idx) => {
                    const colors = getServiceColors(booking.serviceType || 'haircut');
                    const service = getServiceById(booking.serviceType || 'haircut');
                    const endTime = calculateEndTime(booking.appointmentTime || '2:00 PM', booking.duration || 60);
                    
                    return (
                      <div
                        key={idx}
                        style={styles.magazineBooking(colors)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 8px 24px ${colors.border}60`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={styles.magazineBookingHeader}>
                          <div style={styles.magazineBookingTime}>
                            {booking.appointmentTime || '2:00 PM'} - {endTime}
                          </div>
                          <div style={styles.magazineBookingBadge(colors)}>
                            {service?.name?.substring(0, 6).toUpperCase() || booking.serviceType?.toUpperCase() || 'SERVICE'}
                          </div>
                        </div>
                        <div style={styles.magazineBookingModel}>
                          {booking.modelName || 'Model'}
                        </div>
                        <div style={styles.magazineBookingService(colors)}>
                          {service?.name || booking.serviceType || 'Service'}
                        </div>
                        <div style={styles.magazineBookingLocation}>
                          {booking.location?.split(' - ')[0] || 'Luxe Studio'}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                    No bookings for this date
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              Select a date to view bookings
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSelectedStyle = () => {
    try {
      switch (selectedStyle) {
        case 'timeline':
          return renderTimeline();
        case 'grid':
          return renderGrid();
        case 'week':
          return renderWeekView();
        case 'magazine':
          return renderMagazine();
        default:
          return renderTimeline();
      }
    } catch (error) {
      console.error('Error rendering calendar style:', error);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
          <p>Error loading calendar view. Please refresh the page.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#5A3A2A' }}>
            {error.message}
          </p>
        </div>
      );
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Booked Calendar Design Options</h1>
        <p style={styles.subtitle}>Choose a calendar style that works best for you</p>
      </div>
      
      <div style={styles.styleSelector}>
        <button
          style={styles.styleBtn(selectedStyle === 'timeline')}
          onClick={() => setSelectedStyle('timeline')}
        >
          Timeline View
        </button>
        <button
          style={styles.styleBtn(selectedStyle === 'grid')}
          onClick={() => setSelectedStyle('grid')}
        >
          Grid Calendar
        </button>
        <button
          style={styles.styleBtn(selectedStyle === 'week')}
          onClick={() => setSelectedStyle('week')}
        >
          Week View
        </button>
        <button
          style={styles.styleBtn(selectedStyle === 'magazine')}
          onClick={() => setSelectedStyle('magazine')}
        >
          Magazine Spread
        </button>
      </div>
      
      {renderSelectedStyle()}
    </div>
  );
}
