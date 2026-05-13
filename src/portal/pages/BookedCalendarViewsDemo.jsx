import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Generate mock bookings across multiple months
const generateMockBookings = () => {
  try {
    const professional = getMockProfessional('mock-pro-1');
    const model = getMockModel('mock-model-1');
    
    if (!professional || !model) {
      return [];
    }
    
    const bookings = [];
    const today = new Date();
    
    // Generate bookings for the next 3 months
    const services = [
      { type: 'color', time: '10:00 AM', duration: 180 },
      { type: 'haircut', time: '2:00 PM', duration: 60 },
      { type: 'highlights', time: '11:00 AM', duration: 240 },
      { type: 'blowdry', time: '3:00 PM', duration: 45 },
      { type: 'gloss', time: '1:00 PM', duration: 90 },
      { type: 'color', time: '9:00 AM', duration: 180 },
      { type: 'haircut', time: '4:00 PM', duration: 60 },
    ];
    
    // Create bookings spread across 90 days
    for (let dayOffset = 0; dayOffset < 90; dayOffset += Math.floor(Math.random() * 5) + 2) {
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() + dayOffset);
      
      // Skip weekends randomly (70% chance)
      if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
        if (Math.random() > 0.3) continue;
      }
      
      const service = services[Math.floor(Math.random() * services.length)];
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
        bookingId: `BK-2024-${String(bookings.length + 1).padStart(4, '0')}`,
      });
      
      bookings.push(booking);
    }
    
    return bookings;
  } catch (error) {
    console.error('Error generating mock bookings:', error);
    return [];
  }
};

export default function BookedCalendarViewsDemo() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('month');
  const bookings = useMemo(() => generateMockBookings(), []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [flippedCards, setFlippedCards] = useState(new Set());

  const toggleFlip = (bookingId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  // Get bookings for a specific date
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

  // Get bookings for a date range
  const getBookingsForRange = (startDate, endDate) => {
    return bookings.filter(b => {
      const bookingDate = new Date(b.appointmentDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    }).sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      const timeA = a.appointmentTime || '12:00 PM';
      const timeB = b.appointmentTime || '12:00 PM';
      return timeA.localeCompare(timeB);
    });
  };

  // Navigation helpers
  const goToToday = () => {
    setCurrentPeriod(new Date());
    setSelectedDate(new Date());
  };

  const navigatePeriod = (direction) => {
    const newPeriod = new Date(currentPeriod);
    
    switch (selectedView) {
      case 'day':
        newPeriod.setDate(newPeriod.getDate() + direction);
        break;
      case 'week':
        newPeriod.setDate(newPeriod.getDate() + (direction * 7));
        break;
      case 'month':
        newPeriod.setMonth(newPeriod.getMonth() + direction);
        break;
      case 'quarter':
        newPeriod.setMonth(newPeriod.getMonth() + (direction * 3));
        break;
      case 'year':
        newPeriod.setFullYear(newPeriod.getFullYear() + direction);
        break;
    }
    
    setCurrentPeriod(newPeriod);
  };

  // ============ STYLES ============
  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1800px',
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
    viewSelector: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      padding: '1rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
      flexWrap: 'wrap',
    },
    viewBtn: (isActive) => ({
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
    calendarControls: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    periodTitle: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    navButtons: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    navBtn: {
      width: '40px',
      height: '40px',
      background: 'rgba(139, 30, 63, 0.08)',
      border: '2px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '10px',
      color: '#4A2A1A',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      fontFamily: '"Alike", "Georgia", serif',
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
    
    // DAY VIEW
    dayViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    dayViewHeader: {
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      gap: '1rem',
      marginBottom: '2rem',
    },
    dayViewTimeColumn: {
      paddingTop: '3rem',
    },
    dayViewTimeSlot: {
      height: '60px',
      padding: '0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
      display: 'flex',
      alignItems: 'flex-start',
    },
    dayViewContent: {
      position: 'relative',
      minHeight: '800px',
    },
    dayViewBooking: (colors, startHour, duration) => {
      const startMinutes = (startHour - 8) * 60;
      const height = (duration / 60) * 60;
      return {
        position: 'absolute',
        top: `${startMinutes}px`,
        left: '1rem',
        right: '1rem',
        height: `${height}px`,
        background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.25')}, ${colors.bg})`,
        border: `2px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '1rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      };
    },
    
    // WEEK VIEW
    weekViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    weekViewHeader: {
      display: 'grid',
      gridTemplateColumns: '120px repeat(7, 1fr)',
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    weekViewDayHeader: {
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
    weekViewGrid: {
      display: 'grid',
      gridTemplateColumns: '120px repeat(7, 1fr)',
      gap: '0.5rem',
    },
    weekViewTimeSlot: {
      padding: '0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
      height: '60px',
    },
    weekViewDayCell: {
      minHeight: '60px',
      borderTop: '1px solid rgba(139, 30, 63, 0.1)',
      position: 'relative',
    },
    weekViewBooking: (colors, startHour, duration) => {
      const startMinutes = (startHour - 8) * 60;
      const height = (duration / 60) * 60;
      return {
        position: 'absolute',
        top: `${startMinutes}px`,
        left: '0.5rem',
        right: '0.5rem',
        height: `${height}px`,
        background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.25')}, ${colors.bg})`,
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.7rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      };
    },
    
    // MONTH VIEW (Grid)
    monthViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    monthViewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '1rem',
    },
    monthViewDayHeader: {
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
    monthViewDayCell: (isSelected, hasBookings, isToday, isCurrentMonth) => ({
      minHeight: '140px',
      padding: '0.75rem',
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
      gap: '0.5rem',
      opacity: isCurrentMonth ? 1 : 0.4,
    }),
    monthViewDayNumber: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    monthViewBooking: (colors) => ({
      padding: '0.5rem',
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
    
    // QUARTER VIEW
    quarterViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    quarterViewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    quarterViewMonth: {
      border: '2px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      background: '#FFFEF9',
    },
    quarterViewMonthHeader: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
      textAlign: 'center',
    },
    quarterViewMonthGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.5rem',
    },
    quarterViewMiniDay: (hasBookings) => ({
      aspectRatio: '1',
      padding: '0.25rem',
      borderRadius: '6px',
      background: hasBookings ? 'rgba(139, 30, 63, 0.15)' : 'transparent',
      border: `1px solid ${hasBookings ? '#8B1E3F' : 'rgba(139, 30, 63, 0.1)'}`,
      fontSize: '0.7rem',
      textAlign: 'center',
      color: hasBookings ? '#8B1E3F' : '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      fontWeight: hasBookings ? '700' : '400',
    }),
    
    // YEAR VIEW
    yearViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
    },
    yearViewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1.5rem',
    },
    yearViewQuarter: {
      border: '2px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '16px',
      padding: '1rem',
      background: '#FFFEF9',
    },
    yearViewQuarterHeader: {
      fontSize: '0.95rem',
      fontWeight: '700',
      color: '#4A2A1A',
      marginBottom: '0.75rem',
      fontFamily: '"Alike", "Georgia", serif',
      textAlign: 'center',
    },
    yearViewQuarterGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.5rem',
    },
    yearViewMonth: (hasBookings) => ({
      padding: '0.5rem',
      borderRadius: '8px',
      background: hasBookings ? 'rgba(139, 30, 63, 0.1)' : 'transparent',
      border: `1px solid ${hasBookings ? '#8B1E3F' : 'rgba(139, 30, 63, 0.1)'}`,
      fontSize: '0.7rem',
      textAlign: 'center',
      color: hasBookings ? '#8B1E3F' : '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      fontWeight: hasBookings ? '700' : '400',
    }),
    
    // FLIP CARD STYLES
    flipCardWrapper: {
      width: '100%',
      perspective: '1000px',
      cursor: 'pointer',
    },
    flipCardInner: (isFlipped) => ({
      position: 'relative',
      width: '100%',
      transition: 'transform 0.6s',
      transformStyle: 'preserve-3d',
      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    }),
    flipCardFront: (colors) => ({
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1rem',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }),
    flipCardBack: (colors) => ({
      background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
      border: `2px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '1rem',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }),
    bookingTime: {
      fontSize: '0.9rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bookingModel: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bookingService: (colors) => ({
      fontSize: '0.75rem',
      fontWeight: '600',
      color: colors.accent,
      fontFamily: '"Alike", "Georgia", serif',
    }),
    bookingDetail: {
      fontSize: '0.7rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      display: 'flex',
      justifyContent: 'space-between',
    },
    bookingDetailLabel: {
      fontWeight: '600',
    },
  };

  // Render Day View
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayDate = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      timeSlots.push(hour);
    }
    
    return (
      <div style={styles.dayViewContainer}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={styles.periodTitle}>{dayName}</div>
          <div style={{ fontSize: '1rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
            {dayDate}
          </div>
        </div>
        
        <div style={styles.dayViewHeader}>
          <div style={styles.dayViewTimeColumn}>
            {timeSlots.map(hour => (
              <div key={hour} style={styles.dayViewTimeSlot}>
                {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
              </div>
            ))}
          </div>
          <div style={styles.dayViewContent}>
            {dayBookings.map((booking, idx) => {
              const colors = getServiceColors(booking.serviceType || 'haircut');
              const service = getServiceById(booking.serviceType || 'haircut');
              const time = booking.appointmentTime || '2:00 PM';
              const [timePart, period] = time.split(' ');
              const [hours, minutes] = timePart.split(':').map(Number);
              const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
              const startHour = hour24 + (minutes || 0) / 60;
              const isFlipped = flippedCards.has(booking.id);
              
              if (startHour < 8 || startHour >= 20) return null;
              
              return (
                <div
                  key={idx}
                  style={styles.dayViewBooking(colors, startHour, booking.duration || 60)}
                  onClick={() => toggleFlip(booking.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.zIndex = '10';
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}80`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.zIndex = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={styles.flipCardWrapper}>
                    <div style={styles.flipCardInner(isFlipped)}>
                      <div style={styles.flipCardFront(colors)}>
                        <div style={styles.bookingTime}>{booking.appointmentTime}</div>
                        <div style={styles.bookingModel}>{booking.modelName}</div>
                        <div style={styles.bookingService(colors)}>
                          {service?.name || booking.serviceType}
                        </div>
                      </div>
                      <div style={styles.flipCardBack(colors)}>
                        <div style={styles.bookingTime}>
                          {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                        </div>
                        <div style={styles.bookingModel}>{booking.modelName}</div>
                        <div style={styles.bookingService(colors)}>
                          {service?.name || booking.serviceType}
                        </div>
                        <div style={styles.bookingDetail}>
                          <span style={styles.bookingDetailLabel}>Location:</span>
                          <span>{booking.location?.split(' - ')[0] || 'Luxe Studio'}</span>
                        </div>
                        <div style={styles.bookingDetail}>
                          <span style={styles.bookingDetailLabel}>Duration:</span>
                          <span>{booking.duration || 60} min</span>
                        </div>
                        <div style={styles.bookingDetail}>
                          <span style={styles.bookingDetailLabel}>Booking ID:</span>
                          <span>{booking.bookingId}</span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#5A3A2A', fontStyle: 'italic', marginTop: '0.5rem' }}>
                          Tap to flip back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const startOfWeek = new Date(currentPeriod);
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
    
    const weekStart = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const weekEnd = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return (
      <div style={styles.weekViewContainer}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={styles.periodTitle}>{weekStart} - {weekEnd}</div>
        </div>
        
        <div style={styles.weekViewHeader}>
          <div style={styles.weekViewDayHeader}>Time</div>
          {weekDays.map((date, idx) => (
            <div key={idx} style={styles.weekViewDayHeader}>
              <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>{date.getDate()}</div>
            </div>
          ))}
        </div>
        
        <div style={styles.weekViewGrid}>
          {timeSlots.map(hour => (
            <React.Fragment key={hour}>
              <div style={styles.weekViewTimeSlot}>
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
                  <div key={dayIdx} style={styles.weekViewDayCell}>
                    {dayBookings.map((booking, bidx) => {
                      const colors = getServiceColors(booking.serviceType || 'haircut');
                      const time = booking.appointmentTime || '2:00 PM';
                      const [timePart, period] = time.split(' ');
                      const [hours, minutes] = timePart.split(':').map(Number);
                      const hour24 = period === 'PM' && hours !== 12 ? hours + 12 : (period === 'AM' && hours === 12 ? 0 : hours);
                      const startMinutes = hour24 * 60 + (minutes || 0);
                      const startHour = startMinutes / 60;
                      
                      if (startHour < 8 || startHour >= 20) return null;
                      
                      return (
                        <div
                          key={bidx}
                          style={styles.weekViewBooking(colors, startHour, booking.duration || 60)}
                          onClick={() => toggleFlip(booking.id)}
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
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#4A2A1A' }}>
                            {booking.appointmentTime}
                          </div>
                          <div style={{ fontSize: '0.6rem', fontWeight: '600', color: '#4A2A1A' }}>
                            {booking.modelName?.split(' ')[0] || 'Model'}
                          </div>
                          <div style={{ fontSize: '0.55rem', color: colors.accent }}>
                            {getServiceById(booking.serviceType)?.name?.substring(0, 8) || booking.serviceType}
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

  // Render Month View
  const renderMonthView = () => {
    const year = currentPeriod.getFullYear();
    const month = currentPeriod.getMonth();
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
    
    const monthName = currentPeriod.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return (
      <div style={styles.monthViewContainer}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={styles.periodTitle}>{monthName}</div>
        </div>
        
        <div style={styles.monthViewGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={styles.monthViewDayHeader}>{day}</div>
          ))}
          
          {days.map((day, idx) => {
            const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
            
            return (
              <div
                key={idx}
                style={styles.monthViewDayCell(isSelected, day.bookings.length > 0, day.isToday, day.isCurrentMonth)}
                onClick={() => {
                  if (day.isCurrentMonth && day.day) {
                    setSelectedDate(day.date);
                  }
                }}
              >
                {day.day && (
                  <>
                    <div style={styles.monthViewDayNumber}>{day.day}</div>
                    {day.bookings.slice(0, 3).map((booking, bidx) => {
                      const colors = getServiceColors(booking.serviceType || 'haircut');
                      const isFlipped = flippedCards.has(booking.id);
                      
                      return (
                        <div
                          key={bidx}
                          style={styles.flipCardWrapper}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFlip(booking.id);
                          }}
                        >
                          <div style={styles.flipCardInner(isFlipped)}>
                            <div style={styles.flipCardFront(colors)}>
                              <div style={styles.monthViewBooking(colors)}>
                                {booking.appointmentTime} - {booking.modelName?.split(' ')[0]}
                              </div>
                            </div>
                            <div style={styles.flipCardBack(colors)}>
                              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.25rem' }}>
                                {booking.appointmentTime}
                              </div>
                              <div style={{ fontSize: '0.65rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.15rem' }}>
                                {booking.modelName}
                              </div>
                              <div style={{ fontSize: '0.6rem', color: colors.accent, marginBottom: '0.5rem' }}>
                                {getServiceById(booking.serviceType)?.name || booking.serviceType}
                              </div>
                              <div style={{ fontSize: '0.55rem', color: '#5A3A2A' }}>
                                {booking.location?.split(' - ')[0]}
                              </div>
                              <div style={{ fontSize: '0.5rem', color: '#5A3A2A', fontStyle: 'italic', marginTop: '0.25rem' }}>
                                Tap to flip
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {day.bookings.length > 3 && (
                      <div style={{ fontSize: '0.65rem', color: '#8B1E3F', fontWeight: '600', textAlign: 'center', marginTop: '0.25rem' }}>
                        +{day.bookings.length - 3} more
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Quarter View
  const renderQuarterView = () => {
    const year = currentPeriod.getFullYear();
    const quarter = Math.floor(currentPeriod.getMonth() / 3);
    const startMonth = quarter * 3;
    
    const months = [];
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(year, startMonth + i, 1);
      months.push(monthDate);
    }
    
    const quarterName = `Q${quarter + 1} ${year}`;
    
    return (
      <div style={styles.quarterViewContainer}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={styles.periodTitle}>{quarterName}</div>
        </div>
        
        <div style={styles.quarterViewGrid}>
          {months.map((monthDate, monthIdx) => {
            const month = monthDate.getMonth();
            const year = monthDate.getFullYear();
            const firstDay = new Date(year, month, 1);
            const startDate = new Date(firstDay);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            
            const days = [];
            const current = new Date(startDate);
            for (let i = 0; i < 42; i++) {
              const dayDate = new Date(current);
              const dayBookings = getBookingsForDate(dayDate);
              days.push({
                date: dayDate,
                day: dayDate.getMonth() === month ? dayDate.getDate() : null,
                bookings: dayBookings,
              });
              current.setDate(current.getDate() + 1);
            }
            
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'long' });
            
            return (
              <div key={monthIdx} style={styles.quarterViewMonth}>
                <div style={styles.quarterViewMonthHeader}>{monthName}</div>
                <div style={styles.quarterViewMonthGrid}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} style={{ fontSize: '0.6rem', textAlign: 'center', fontWeight: '700', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                      {day}
                    </div>
                  ))}
                  {days.map((day, idx) => (
                    <div
                      key={idx}
                      style={styles.quarterViewMiniDay(day.bookings.length > 0)}
                    >
                      {day.day}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Year View
  const renderYearView = () => {
    const year = currentPeriod.getFullYear();
    const quarters = [];
    for (let q = 0; q < 4; q++) {
      quarters.push(q);
    }
    
    return (
      <div style={styles.yearViewContainer}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={styles.periodTitle}>{year}</div>
        </div>
        
        <div style={styles.yearViewGrid}>
          {quarters.map((quarter, qIdx) => {
            const startMonth = quarter * 3;
            const months = [];
            for (let i = 0; i < 3; i++) {
              const monthDate = new Date(year, startMonth + i, 1);
              const monthEnd = new Date(year, startMonth + i + 1, 0);
              const monthBookings = getBookingsForRange(monthDate, monthEnd);
              months.push({
                date: monthDate,
                name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
                bookings: monthBookings,
              });
            }
            
            return (
              <div key={qIdx} style={styles.yearViewQuarter}>
                <div style={styles.yearViewQuarterHeader}>Q{quarter + 1}</div>
                <div style={styles.yearViewQuarterGrid}>
                  {months.map((month, mIdx) => (
                    <div
                      key={mIdx}
                      style={styles.yearViewMonth(month.bookings.length > 0)}
                    >
                      {month.name}
                      {month.bookings.length > 0 && (
                        <div style={{ fontSize: '0.6rem', marginTop: '0.25rem', fontWeight: '600' }}>
                          {month.bookings.length}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSelectedView = () => {
    switch (selectedView) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
      case 'quarter':
        return renderQuarterView();
      case 'year':
        return renderYearView();
      default:
        return renderMonthView();
    }
  };

  const getPeriodTitle = () => {
    switch (selectedView) {
      case 'day':
        return selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      case 'week':
        const startOfWeek = new Date(currentPeriod);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
        return currentPeriod.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(currentPeriod.getMonth() / 3);
        return `Q${quarter + 1} ${currentPeriod.getFullYear()}`;
      case 'year':
        return currentPeriod.getFullYear().toString();
      default:
        return '';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Booked Calendar Views</h1>
        <p style={styles.subtitle}>
          Confirmed appointments - Match fee & booking fee paid
        </p>
      </div>
      
      <div style={styles.viewSelector}>
        <button
          style={styles.viewBtn(selectedView === 'day')}
          onClick={() => setSelectedView('day')}
        >
          Day
        </button>
        <button
          style={styles.viewBtn(selectedView === 'week')}
          onClick={() => setSelectedView('week')}
        >
          Week
        </button>
        <button
          style={styles.viewBtn(selectedView === 'month')}
          onClick={() => setSelectedView('month')}
        >
          Month
        </button>
        <button
          style={styles.viewBtn(selectedView === 'quarter')}
          onClick={() => setSelectedView('quarter')}
        >
          Quarter
        </button>
        <button
          style={styles.viewBtn(selectedView === 'year')}
          onClick={() => setSelectedView('year')}
        >
          Year
        </button>
      </div>
      
      <div style={styles.calendarControls}>
        <div style={styles.periodTitle}>{getPeriodTitle()}</div>
        <div style={styles.navButtons}>
          <button
            style={styles.navBtn}
            onClick={() => navigatePeriod(-1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
              e.currentTarget.style.borderColor = '#8B1E3F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
            }}
          >
            ←
          </button>
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
            style={styles.navBtn}
            onClick={() => navigatePeriod(1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
              e.currentTarget.style.borderColor = '#8B1E3F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
            }}
          >
            →
          </button>
        </div>
      </div>
      
      {renderSelectedView()}
    </div>
  );
}
