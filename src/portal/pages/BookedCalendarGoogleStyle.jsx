import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceById } from '../../admin/data/services';
import { TRAINING_CATEGORIES } from '../../admin/data/training';
import { 
  getMockProfessional, 
  createMockBooking, 
  getMockModel 
} from '../../utils/mockDataService';

// ============ MUTED PASTEL COLOR PALETTE (Google Calendar inspired) ============
const paletteA = {
  haircut: {
    bg: 'rgba(200, 180, 160, 0.15)',
    border: 'rgba(200, 180, 160, 0.4)',
    accent: '#C8B4A0',
    label: '#A89682',
    solid: '#D4C0AC',
  },
  color: {
    bg: 'rgba(180, 200, 190, 0.15)',
    border: 'rgba(180, 200, 190, 0.4)',
    accent: '#B4C8BE',
    label: '#96A89E',
    solid: '#C0D4CA',
  },
  blowdry: {
    bg: 'rgba(220, 190, 210, 0.15)',
    border: 'rgba(220, 190, 210, 0.4)',
    accent: '#DCBED2',
    label: '#B89AA6',
    solid: '#E8CEDE',
  },
  highlights: {
    bg: 'rgba(240, 220, 200, 0.15)',
    border: 'rgba(240, 220, 200, 0.4)',
    accent: '#F0DCC8',
    label: '#D0BCA8',
    solid: '#FCE8D4',
  },
  gloss: {
    bg: 'rgba(200, 210, 230, 0.15)',
    border: 'rgba(200, 210, 230, 0.4)',
    accent: '#C8D2E6',
    label: '#A8B2C6',
    solid: '#D4DEEA',
  },
  keratin: {
    bg: 'rgba(230, 220, 200, 0.15)',
    border: 'rgba(230, 220, 200, 0.4)',
    accent: '#E6DCC8',
    label: '#C6BCA8',
    solid: '#F2E8D4',
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
  startDate.setHours(hour24, minutes || 0, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHours = endDate.getHours();
  const endMins = endDate.getMinutes();
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
  
  return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
};

// Layout constants for timeline sizing
const HOUR_HEIGHT = 40; // pixels per hour (more compact view)
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2;

// Format model name: "Seraphina Luna" -> "Seraphina L."
const formatModelName = (fullName) => {
  if (!fullName) return 'Model';
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

// Generate mock bookings - training-focused stylist (mostly blowouts)
const generateTrainingBookings = () => {
  try {
    const professional = getMockProfessional('mock-pro-1');
    const model = getMockModel('mock-model-1');
    
    if (!professional || !model) {
      return [];
    }
    
    const bookings = [];
    const today = new Date();
    
    // Training-focused: 80% blowouts, 20% other services
    // More time slots for variety
    const blowoutTimes = [
      '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
      '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
      '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
      '5:00 PM', '5:30 PM'
    ];
    
    const otherServices = [
      { type: 'haircut', time: '10:00 AM', duration: 60 },
      { type: 'haircut', time: '2:00 PM', duration: 60 },
      { type: 'color', time: '9:00 AM', duration: 180 },
      { type: 'highlights', time: '11:00 AM', duration: 240 },
      { type: 'gloss', time: '1:00 PM', duration: 90 },
    ];
    
    // Create bookings for next 30 days with multiple per day
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() + dayOffset);
      
      // Skip weekends less often (allow some weekend bookings)
      if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
        if (Math.random() > 0.3) continue; // 30% chance of weekend booking
      }
      
      // Generate 2-4 bookings per weekday, 1-2 on weekends
      const bookingsPerDay = (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) 
        ? Math.floor(Math.random() * 2) + 1 
        : Math.floor(Math.random() * 3) + 2;
      
      const usedTimes = new Set();
      
      for (let i = 0; i < bookingsPerDay; i++) {
        // 80% chance of blowout for training
        const isBlowout = Math.random() < 0.8;
        
        let service;
        if (isBlowout) {
          // Pick a random blowout time that hasn't been used
          const availableTimes = blowoutTimes.filter(t => !usedTimes.has(t));
          if (availableTimes.length === 0) continue;
          const time = availableTimes[Math.floor(Math.random() * availableTimes.length)];
          usedTimes.add(time);
          service = { type: 'blowdry', time, duration: 45 };
        } else {
          service = otherServices[Math.floor(Math.random() * otherServices.length)];
          usedTimes.add(service.time);
        }
        
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
    }
    
    return bookings;
  } catch (error) {
    console.error('Error generating bookings:', error);
    return [];
  }
};

export default function BookedCalendarGoogleStyle() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('week');
  const bookings = useMemo(() => generateTrainingBookings(), []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
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

  // Get training progress for a service type
  const getTrainingProgress = (serviceType) => {
    const category = TRAINING_CATEGORIES[serviceType];
    if (!category) return null;
    
    const completedSessions = bookings.filter(b => b.serviceType === serviceType).length;
    const requiredSessions = 15;
    
    return {
      completed: completedSessions,
      required: requiredSessions,
      remaining: Math.max(0, requiredSessions - completedSessions),
      category: category.name,
    };
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
    }
    
    setCurrentPeriod(newPeriod);
    if (selectedView === 'day') {
      setSelectedDate(newPeriod);
    }
  };

  // Generate 30-minute time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({ hour, minute: 0, display: hour === 0 ? '12:00 AM' : hour < 12 ? `${hour}:00 AM` : hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM` });
      slots.push({ hour, minute: 30, display: hour === 0 ? '12:30 AM' : hour < 12 ? `${hour}:30 AM` : hour === 12 ? '12:30 PM' : `${hour - 12}:30 PM` });
    }
    return slots;
  };

  // Get time slot position (in pixels)
  const getTimeSlotPosition = (timeString) => {
    if (!timeString) return 0;
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    // Calculate position from 8:00 AM
    // 8:00 AM = 0px, each hour = HOUR_HEIGHT
    const startHour = 8;
    const hoursFromStart = hour24 - startHour;
    const minutesOffset = (minutes || 0) / 60;
    return (hoursFromStart + minutesOffset) * HOUR_HEIGHT;
  };

  // Get duration in pixels
  const getDurationPixels = (durationMinutes) => {
    return (durationMinutes / 60) * HOUR_HEIGHT;
  };

  // ============ STYLES ============
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#FFFEF9',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    createButton: {
      padding: '0.5rem 1rem',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1.5px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '24px',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#8B1E3F',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    miniCalendar: {
      marginBottom: '1.5rem',
    },
    miniCalendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    miniCalendarMonth: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    miniCalendarNav: {
      display: 'flex',
      gap: '0.25rem',
    },
    miniCalendarNavBtn: {
      width: '24px',
      height: '24px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      color: '#5A3A2A',
    },
    miniCalendarGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: '0.25rem',
    },
    miniCalendarDayHeader: {
      fontSize: '0.7rem',
      fontWeight: '600',
      color: '#5A3A2A',
      textAlign: 'center',
      padding: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    miniCalendarDay: (isToday, isSelected, isCurrentMonth) => ({
      aspectRatio: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      color: isCurrentMonth ? '#4A2A1A' : '#9A8A7A',
      background: isToday ? 'rgba(139, 30, 63, 0.15)' : isSelected ? 'rgba(139, 30, 63, 0.1)' : 'transparent',
      borderRadius: '50%',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      fontWeight: isToday ? '700' : '400',
    }),
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      width: '100%',
    },
    header: {
      padding: '1rem 2rem',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: '#FFFEF9',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      flex: 1,
    },
    headerTitle: {
      fontSize: '1.4rem',
      fontWeight: '400',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    headerNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navButton: {
      padding: '0.5rem 1rem',
      background: 'transparent',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: '#5A3A2A',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      transition: 'all 0.2s ease',
    },
    todayButton: {
      padding: '0.5rem 1.5rem',
      background: 'transparent',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: '#8B1E3F',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontWeight: '500',
      transition: 'all 0.2s ease',
    },
    viewSelector: {
      display: 'flex',
      gap: '0.25rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '4px',
      padding: '0.25rem',
    },
    viewButton: (isActive) => ({
      padding: '0.5rem 1rem',
      background: isActive ? '#FFFEF9' : 'transparent',
      border: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      color: isActive ? '#8B1E3F' : '#5A3A2A',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontWeight: isActive ? '500' : '400',
      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
    }),
    calendarArea: {
      flex: 1,
      overflow: 'auto',
      position: 'relative',
    },
    
    // DAY VIEW
    dayViewContainer: {
      display: 'grid',
      gridTemplateColumns: '100px 1fr',
      height: '100%',
    },
    dayViewTimeColumn: {
      borderRight: '1px solid rgba(139, 30, 63, 0.1)',
      paddingTop: '60px',
    },
    dayViewTimeSlot: {
      height: HOUR_HEIGHT,
      paddingRight: '0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      textAlign: 'right',
      fontFamily: '"Roboto", "Arial", sans-serif',
      position: 'relative',
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
    },
    dayViewTimeLabel: {
      position: 'absolute',
      top: '-8px',
      right: '0.5rem',
      background: '#FFFEF9',
      padding: '0 0.25rem',
    },
    dayViewContent: {
      position: 'relative',
      paddingTop: '60px',
      minHeight: 12 * HOUR_HEIGHT, // 12 hours
    },
    dayViewHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
    },
    dayViewHalfHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTop: '1px solid rgba(139, 30, 63, 0.04)',
    },
    dayViewBooking: (colors, top, height) => ({
      position: 'absolute',
      left: '0.75rem',
      right: '0.75rem',
      top: `${top}px`,
      height: `${Math.max(height, 72)}px`,
      background: colors.solid,
      borderLeft: `4px solid ${colors.accent}`,
      borderRadius: '6px',
      padding: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '72px',
      zIndex: 1,
    }),
    
    // WEEK VIEW
    weekViewContainer: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      height: '100%',
    },
    weekViewTimeColumn: {
      borderRight: '1px solid rgba(139, 30, 63, 0.1)',
      paddingTop: '60px',
    },
    weekViewTimeSlot: {
      height: HOUR_HEIGHT,
      paddingRight: '0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      textAlign: 'right',
      fontFamily: '"Roboto", "Arial", sans-serif',
      position: 'relative',
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
    },
    weekViewDayColumn: {
      borderRight: '1px solid rgba(139, 30, 63, 0.08)',
      position: 'relative',
      paddingTop: '60px',
      minHeight: 12 * HOUR_HEIGHT, // 12 hours
    },
    weekViewDayHeader: {
      height: '60px',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      padding: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    weekViewDayName: {
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    weekViewDayNumber: (isToday) => ({
      fontSize: '1.5rem',
      fontWeight: isToday ? '700' : '400',
      color: isToday ? '#8B1E3F' : '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginTop: '0.25rem',
    }),
    weekViewHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
    },
    weekViewHalfHourLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      borderTop: '1px solid rgba(139, 30, 63, 0.04)',
    },
    weekViewBooking: (colors, top, height, left = 0, width = 100) => ({
      position: 'absolute',
      left: '0.75rem',
      right: '0.75rem',
      top: `${top}px`,
      height: `${Math.max(height, 80)}px`,
      background: colors.solid,
      borderLeft: `4px solid ${colors.accent}`,
      borderRadius: '8px',
      padding: '0.85rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '80px',
      overflow: 'visible',
      zIndex: 1,
    }),
    
    // MONTH VIEW
    monthViewContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      gridTemplateRows: 'auto 1fr',
      height: '100%',
    },
    monthViewDayHeader: {
      padding: '0.75rem',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      borderRight: '1px solid rgba(139, 30, 63, 0.08)',
    },
    monthViewDayCell: (isToday, isSelected, isCurrentMonth) => ({
      minHeight: '140px',
      padding: '0.6rem',
      borderRight: '1px solid rgba(139, 30, 63, 0.08)',
      borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
      background: isToday ? 'rgba(139, 30, 63, 0.05)' : '#FFFEF9',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.3rem',
      opacity: isCurrentMonth ? 1 : 0.4,
      transition: 'all 0.2s ease',
    }),
    monthViewDayNumber: (isToday) => ({
      fontSize: '0.9rem',
      fontWeight: isToday ? '700' : '600',
      color: isToday ? '#8B1E3F' : '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginBottom: '0.35rem',
      lineHeight: '1.2',
    }),
    monthViewBooking: (colors) => ({
      padding: '0.5rem 0.6rem',
      background: colors.solid,
      borderLeft: `3px solid ${colors.accent}`,
      borderRadius: '6px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      cursor: 'pointer',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.2rem',
      lineHeight: '1.3',
    }),
    
    // FLIP CARD
    // Modal/Overlay for booking details
    modalOverlay: {
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
    },
    modalContent: (colors) => ({
      background: '#FFFEF9',
      borderRadius: '16px',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      border: `3px solid ${colors?.accent || 'rgba(139, 30, 63, 0.3)'}`,
      position: 'relative',
    }),
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    },
    modalClose: {
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
    },
    modalTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginBottom: '0.5rem',
    },
    modalTime: {
      fontSize: '0.95rem',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      fontWeight: '500',
    },
    modalSection: {
      marginBottom: '1.5rem',
    },
    modalSectionTitle: {
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#4A2A1A',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '0.75rem',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    modalDetailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
      fontSize: '0.9rem',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    modalDetailLabel: {
      fontWeight: '600',
      color: '#5A3A2A',
      minWidth: '100px',
    },
    modalDetailValue: {
      color: '#4A2A1A',
      textAlign: 'right',
      flex: 1,
    },
    bookingTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      lineHeight: '1.4',
      wordBreak: 'break-word',
      marginBottom: '0.5rem',
    },
    bookingTime: {
      fontSize: '0.85rem',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      lineHeight: '1.4',
      fontWeight: '500',
      marginBottom: '0.4rem',
    },
    bookingModel: {
      fontSize: '0.8rem',
      fontWeight: '500',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginTop: '0.5rem',
    },
    bookingService: (colors) => ({
      fontSize: '0.8rem',
      color: colors.label,
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginTop: '0.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      wordBreak: 'break-word',
    }),
    bookingDetail: {
      fontSize: '0.8rem',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginTop: '0.5rem',
      lineHeight: '1.5',
    },
    bookingDetailLabel: {
      fontWeight: '600',
      color: '#4A2A1A',
    },
    chatButton: {
      marginTop: 'auto',
      padding: '0.5rem',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '4px',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#8B1E3F',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      textAlign: 'center',
    },
  };

  // Render Day View
  const renderDayView = () => {
    const dayBookings = getBookingsForDate(selectedDate);
    const timeSlots = generateTimeSlots().filter(slot => slot.hour >= 8 && slot.hour < 20);
    
    return (
      <div style={styles.dayViewContainer}>
        <div style={styles.dayViewTimeColumn}>
          {timeSlots.map((slot, idx) => (
            <div key={idx} style={styles.dayViewTimeSlot}>
              {slot.minute === 0 && (
                <div style={styles.dayViewTimeLabel}>{slot.display}</div>
              )}
            </div>
          ))}
        </div>
        <div style={styles.dayViewContent}>
          {/* Hour lines */}
          {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
            <React.Fragment key={hour}>
              <div style={{ ...styles.dayViewHourLine, top: `${(hour - 8) * HOUR_HEIGHT}px` }} />
              <div style={{ ...styles.dayViewHalfHourLine, top: `${(hour - 8) * HOUR_HEIGHT + HALF_HOUR_HEIGHT}px` }} />
            </React.Fragment>
          ))}
          
          {/* Bookings */}
          {dayBookings.map((booking, idx) => {
            const colors = getServiceColors(booking.serviceType || 'haircut');
            const service = getServiceById(booking.serviceType || 'haircut');
            const top = getTimeSlotPosition(booking.appointmentTime);
            const height = getDurationPixels(booking.duration || 60);
            
            return (
              <div
                key={idx}
                style={styles.dayViewBooking(colors, top, height)}
                onClick={() => openBookingDetails(booking)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.zIndex = '10';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.zIndex = '1';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div style={styles.flipCardFront}>
                  <div style={styles.bookingTitle}>
                    {formatModelName(booking.modelName)}
                  </div>
                  <div style={styles.bookingTime}>
                    {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                  </div>
                  <div style={styles.bookingService(colors)}>
                    {service?.name || booking.serviceType}
                  </div>
                </div>
              </div>
            );
          })}
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
    
    const timeSlots = generateTimeSlots().filter(slot => slot.hour >= 8 && slot.hour < 20);
    
    return (
      <div style={styles.weekViewContainer}>
        <div style={styles.weekViewTimeColumn}>
          {timeSlots.map((slot, idx) => (
            <div key={idx} style={styles.weekViewTimeSlot}>
              {slot.minute === 0 && (
                <div style={styles.dayViewTimeLabel}>{slot.display}</div>
              )}
            </div>
          ))}
        </div>
        {weekDays.map((date, dayIdx) => {
          const dayBookings = getBookingsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div key={dayIdx} style={styles.weekViewDayColumn}>
              <div style={styles.weekViewDayHeader}>
                <div style={styles.weekViewDayName}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={styles.weekViewDayNumber(isToday)}>
                  {date.getDate()}
                </div>
              </div>
              
              {/* Hour lines */}
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                <React.Fragment key={hour}>
                  <div style={{ ...styles.weekViewHourLine, top: `${(hour - 8) * HOUR_HEIGHT}px` }} />
                  <div style={{ ...styles.weekViewHalfHourLine, top: `${(hour - 8) * HOUR_HEIGHT + HALF_HOUR_HEIGHT}px` }} />
                </React.Fragment>
              ))}
              
              {/* Bookings */}
              {dayBookings.map((booking, bidx) => {
                const colors = getServiceColors(booking.serviceType || 'haircut');
                const service = getServiceById(booking.serviceType || 'haircut');
                const top = getTimeSlotPosition(booking.appointmentTime);
                const height = getDurationPixels(booking.duration || 60);
                
                return (
                  <div
                    key={bidx}
                    style={styles.weekViewBooking(colors, top, height)}
                    onClick={() => openBookingDetails(booking)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.zIndex = '10';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.zIndex = '1';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    <div style={styles.flipCardFront}>
                      <div style={styles.bookingTitle}>
                        {formatModelName(booking.modelName)}
                      </div>
                      <div style={styles.bookingTime}>
                        {booking.appointmentTime}
                      </div>
                      <div style={styles.bookingService(colors)}>
                        {service?.name || booking.serviceType}
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
    
    return (
      <div style={styles.monthViewContainer}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={styles.monthViewDayHeader}>{day}</div>
        ))}
        
        {days.map((day, idx) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          
          return (
            <div
              key={idx}
              style={styles.monthViewDayCell(isToday, isSelected, day.isCurrentMonth)}
              onClick={() => {
                if (day.isCurrentMonth && day.day) {
                  setSelectedDate(day.date);
                }
              }}
              onMouseEnter={(e) => {
                if (day.isCurrentMonth && day.day) {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (day.isCurrentMonth && day.day) {
                  e.currentTarget.style.background = isToday ? 'rgba(139, 30, 63, 0.05)' : '#FFFEF9';
                }
              }}
            >
              {day.day && (
                <>
                  <div style={styles.monthViewDayNumber(isToday)}>{day.day}</div>
                  {day.bookings.slice(0, 3).map((booking, bidx) => {
                    const colors = getServiceColors(booking.serviceType || 'haircut');
                    const service = getServiceById(booking.serviceType || 'haircut');
                    
                    return (
                      <div
                        key={bidx}
                        style={styles.monthViewBooking(colors)}
                        onClick={(e) => {
                          e.stopPropagation();
                          openBookingDetails(booking);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                          e.currentTarget.style.transform = 'translateX(2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '600', 
                          color: '#4A2A1A',
                          lineHeight: '1.2',
                        }}>
                          {booking.appointmentTime}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: '500', 
                          color: '#4A2A1A',
                          lineHeight: '1.2',
                        }}>
                          {formatModelName(booking.modelName)}
                        </div>
                        <div style={{ 
                          fontSize: '0.65rem', 
                          color: colors.label,
                          fontWeight: '500',
                          lineHeight: '1.2',
                          marginTop: '0.1rem',
                        }}>
                          {service?.name || booking.serviceType}
                        </div>
                      </div>
                    );
                  })}
                  {day.bookings.length > 3 && (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: '#8B1E3F', 
                      fontWeight: '600', 
                      marginTop: '0.2rem',
                      padding: '0.3rem 0.5rem',
                      background: 'rgba(139, 30, 63, 0.08)',
                      borderRadius: '4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDate(day.date);
                      setSelectedView('day');
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
                    }}
                    >
                      +{day.bookings.length - 3} more
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
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
      default:
        return renderWeekView();
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
      default:
        return '';
    }
  };

  // Generate mini calendar days
  const generateMiniCalendarDays = () => {
    const year = currentPeriod.getFullYear();
    const month = currentPeriod.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      days.push({
        date: dayDate,
        day: dayDate.getDate(),
        isCurrentMonth: dayDate.getMonth() === month,
        isToday: dayDate.toDateString() === new Date().toDateString(),
        isSelected: selectedDate && dayDate.toDateString() === selectedDate.toDateString(),
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const blowoutCount = bookings.filter(b => b.serviceType === 'blowdry').length;

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <button
              style={styles.createButton}
              onClick={() => navigate('/portal/matching')}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(139, 30, 63, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>+</span>
              <span>Match</span>
            </button>
            <div style={styles.headerNav}>
              <button
                style={styles.navButton}
                onClick={() => navigatePeriod(-1)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ‹
              </button>
              <button
                style={styles.navButton}
                onClick={() => navigatePeriod(1)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                ›
              </button>
              <button
                style={styles.todayButton}
                onClick={goToToday}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Today
              </button>
            </div>
            <div style={styles.headerTitle}>{getPeriodTitle()}</div>
          </div>
          <div style={styles.viewSelector}>
            <button
              style={styles.viewButton(selectedView === 'day')}
              onClick={() => {
                setSelectedView('day');
                setSelectedDate(currentPeriod);
              }}
            >
              Day
            </button>
            <button
              style={styles.viewButton(selectedView === 'week')}
              onClick={() => setSelectedView('week')}
            >
              Week
            </button>
            <button
              style={styles.viewButton(selectedView === 'month')}
              onClick={() => setSelectedView('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        <div style={styles.calendarArea}>
          {renderSelectedView()}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      {selectedBooking && (
        <div 
          style={styles.modalOverlay}
          onClick={closeBookingDetails}
        >
          <div 
            style={styles.modalContent(getServiceColors(selectedBooking.serviceType || 'haircut'))}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={styles.modalClose}
              onClick={closeBookingDetails}
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
            
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalTitle}>
                  {selectedBooking.modelName}
                </div>
                <div style={styles.modalTime}>
                  {selectedBooking.appointmentTime} - {calculateEndTime(selectedBooking.appointmentTime, selectedBooking.duration || 60)}
                </div>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Service Details</div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Service:</span>
                <span style={styles.modalDetailValue}>
                  {getServiceById(selectedBooking.serviceType)?.name || selectedBooking.serviceType}
                </span>
              </div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Duration:</span>
                <span style={styles.modalDetailValue}>{selectedBooking.duration || 60} minutes</span>
              </div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Location:</span>
                <span style={styles.modalDetailValue}>
                  {selectedBooking.location?.split(' - ')[0] || 'Luxe Studio'}
                </span>
              </div>
            </div>
            
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Match Attributes</div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Hair Length:</span>
                <span style={styles.modalDetailValue}>Long</span>
              </div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Hair Color:</span>
                <span style={styles.modalDetailValue}>Blonde</span>
              </div>
              <div style={styles.modalDetailRow}>
                <span style={styles.modalDetailLabel}>Hair Texture:</span>
                <span style={styles.modalDetailValue}>Wavy</span>
              </div>
            </div>
            
            {getTrainingProgress(selectedBooking.serviceType) && (
              <div style={styles.modalSection}>
                <div style={styles.modalSectionTitle}>Training Progress</div>
                <div style={styles.modalDetailRow}>
                  <span style={styles.modalDetailLabel}>Category:</span>
                  <span style={styles.modalDetailValue}>
                    {getTrainingProgress(selectedBooking.serviceType).category}
                  </span>
                </div>
                <div style={styles.modalDetailRow}>
                  <span style={styles.modalDetailLabel}>Sessions:</span>
                  <span style={styles.modalDetailValue}>
                    {getTrainingProgress(selectedBooking.serviceType).completed} / {getTrainingProgress(selectedBooking.serviceType).required}
                  </span>
                </div>
                {getTrainingProgress(selectedBooking.serviceType).remaining > 0 && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'rgba(139, 30, 63, 0.1)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#8B1E3F',
                    fontFamily: '"Roboto", "Arial", sans-serif',
                  }}>
                    {getTrainingProgress(selectedBooking.serviceType).remaining} more sessions needed for Level 2
                  </div>
                )}
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '2rem',
            }}>
              <button
                style={{
                  ...styles.chatButton,
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                }}
                onClick={() => {
                  navigate('/portal/chat', { state: { modelId: selectedBooking.modelId, modelName: selectedBooking.modelName } });
                  closeBookingDetails();
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
