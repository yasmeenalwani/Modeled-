import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceById } from '../../admin/data/services';
import { TRAINING_CATEGORIES } from '../../admin/data/training';
import { 
  getMockProfessional, 
  createMockBooking, 
  getMockModel 
} from '../../utils/mockDataService';

// ============ MUTED PASTEL COLOR PALETTE ============
const paletteA = {
  haircut: {
    bg: 'rgba(200, 180, 160, 0.12)',
    border: 'rgba(200, 180, 160, 0.3)',
    accent: '#C8B4A0',
    label: '#A89682',
  },
  color: {
    bg: 'rgba(180, 200, 190, 0.12)',
    border: 'rgba(180, 200, 190, 0.3)',
    accent: '#B4C8BE',
    label: '#96A89E',
  },
  blowdry: {
    bg: 'rgba(220, 190, 210, 0.12)',
    border: 'rgba(220, 190, 210, 0.3)',
    accent: '#DCBED2',
    label: '#B89AA6',
  },
  highlights: {
    bg: 'rgba(240, 220, 200, 0.12)',
    border: 'rgba(240, 220, 200, 0.3)',
    accent: '#F0DCC8',
    label: '#D0BCA8',
  },
  gloss: {
    bg: 'rgba(200, 210, 230, 0.12)',
    border: 'rgba(200, 210, 230, 0.3)',
    accent: '#C8D2E6',
    label: '#A8B2C6',
  },
  keratin: {
    bg: 'rgba(230, 220, 200, 0.12)',
    border: 'rgba(230, 220, 200, 0.3)',
    accent: '#E6DCC8',
    label: '#C6BCA8',
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
    const services = [
      { type: 'blowdry', time: '9:00 AM', duration: 45 },
      { type: 'blowdry', time: '10:30 AM', duration: 45 },
      { type: 'blowdry', time: '2:00 PM', duration: 45 },
      { type: 'blowdry', time: '3:30 PM', duration: 45 },
      { type: 'haircut', time: '11:00 AM', duration: 60 },
      { type: 'color', time: '1:00 PM', duration: 180 },
    ];
    
    // Create bookings for next 30 days, mostly blowouts
    for (let dayOffset = 0; dayOffset < 30; dayOffset += Math.floor(Math.random() * 2) + 1) {
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() + dayOffset);
      
      // Skip weekends (training focused, so weekdays only)
      if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
        continue;
      }
      
      // 80% chance of blowout for training
      const isBlowout = Math.random() < 0.8;
      const service = isBlowout 
        ? services.find(s => s.type === 'blowdry')
        : services[Math.floor(Math.random() * services.length)];
      
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
    console.error('Error generating bookings:', error);
    return [];
  }
};

export default function BookedCalendarRefined() {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('month');
  const bookings = useMemo(() => generateTrainingBookings(), []);
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

  // Get training progress for a service type
  const getTrainingProgress = (serviceType) => {
    const category = TRAINING_CATEGORIES[serviceType];
    if (!category) return null;
    
    // Count completed sessions (mock - in real app, this would come from training data)
    const completedSessions = bookings.filter(b => b.serviceType === serviceType).length;
    const requiredSessions = 15; // Example: 15 sessions needed for Level 2
    
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
      background: 'rgba(139, 30, 63, 0.03)',
      borderRadius: '16px',
      flexWrap: 'wrap',
    },
    viewBtn: (isActive) => ({
      padding: '0.75rem 1.5rem',
      background: isActive ? 'rgba(139, 30, 63, 0.1)' : 'transparent',
      border: `1.5px solid ${isActive ? 'rgba(139, 30, 63, 0.3)' : 'rgba(139, 30, 63, 0.15)'}`,
      borderRadius: '12px',
      fontSize: '0.9rem',
      fontWeight: '600',
      color: isActive ? '#8B1E3F' : '#5A3A2A',
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
      background: 'rgba(139, 30, 63, 0.06)',
      border: '1.5px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '12px',
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
      background: 'rgba(139, 30, 63, 0.08)',
      border: '1.5px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '12px',
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
      border: '1.5px solid rgba(139, 30, 63, 0.1)',
      padding: '2rem',
      boxShadow: '0 2px 12px rgba(139, 30, 63, 0.05)',
    },
    dayViewHeader: {
      display: 'grid',
      gridTemplateColumns: '100px 1fr',
      gap: '1rem',
      marginBottom: '2rem',
    },
    dayViewTimeColumn: {
      paddingTop: '3rem',
    },
    dayViewTimeSlot: {
      height: '80px',
      padding: '0.75rem 0.5rem',
      fontSize: '0.8rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
      display: 'flex',
      alignItems: 'flex-start',
      fontWeight: '500',
    },
    dayViewContent: {
      position: 'relative',
      minHeight: '900px',
    },
    dayViewBooking: (colors, startHour, duration) => {
      const startMinutes = (startHour - 8) * 60;
      const height = (duration / 60) * 80;
      return {
        position: 'absolute',
        top: `${startMinutes}px`,
        left: '1rem',
        right: '1rem',
        height: `${height}px`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      };
    },
    
    // WEEK VIEW
    weekViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '1.5px solid rgba(139, 30, 63, 0.1)',
      padding: '2rem',
      boxShadow: '0 2px 12px rgba(139, 30, 63, 0.05)',
    },
    weekViewHeader: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    weekViewDayHeader: {
      padding: '1rem',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: '"Alike", "Georgia", serif',
      background: 'rgba(139, 30, 63, 0.04)',
      borderRadius: '12px',
    },
    weekViewGrid: {
      display: 'grid',
      gridTemplateColumns: '100px repeat(7, 1fr)',
      gap: '0.75rem',
    },
    weekViewTimeSlot: {
      padding: '0.75rem 0.5rem',
      fontSize: '0.75rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", "Georgia", serif',
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
      height: '80px',
      fontWeight: '500',
    },
    weekViewDayCell: {
      minHeight: '80px',
      borderTop: '1px solid rgba(139, 30, 63, 0.08)',
      position: 'relative',
    },
    weekViewBooking: (colors, startHour, duration) => {
      const startMinutes = (startHour - 8) * 60;
      const height = (duration / 60) * 80;
      return {
        position: 'absolute',
        top: `${startMinutes}px`,
        left: '0.5rem',
        right: '0.5rem',
        height: `${height}px`,
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      };
    },
    
    // MONTH VIEW
    monthViewContainer: {
      background: '#FFFEF9',
      borderRadius: '20px',
      border: '1.5px solid rgba(139, 30, 63, 0.1)',
      padding: '2rem',
      boxShadow: '0 2px 12px rgba(139, 30, 63, 0.05)',
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
      fontWeight: '600',
      color: '#5A3A2A',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      fontFamily: '"Alike", "Georgia", serif',
      background: 'rgba(139, 30, 63, 0.04)',
      borderRadius: '12px',
    },
    monthViewDayCell: (isSelected, hasBookings, isToday, isCurrentMonth) => ({
      minHeight: '160px',
      padding: '1rem',
      borderRadius: '16px',
      background: isSelected 
        ? 'rgba(139, 30, 63, 0.08)' 
        : isToday 
          ? 'rgba(139, 30, 63, 0.05)' 
          : hasBookings 
            ? 'rgba(255, 255, 255, 0.6)' 
            : '#FFFEF9',
      border: `1.5px solid ${isSelected ? 'rgba(139, 30, 63, 0.3)' : isToday ? 'rgba(139, 30, 63, 0.2)' : hasBookings ? 'rgba(139, 30, 63, 0.15)' : 'rgba(139, 30, 63, 0.08)'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      opacity: isCurrentMonth ? 1 : 0.35,
    }),
    monthViewDayNumber: {
      fontSize: '1.1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // FLIP CARD STYLES
    flipCardWrapper: {
      width: '100%',
      perspective: '1000px',
      cursor: 'pointer',
    },
    flipCardInner: (isFlipped) => ({
      position: 'relative',
      width: '100%',
      height: '100%',
      transition: 'transform 0.6s',
      transformStyle: 'preserve-3d',
      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    }),
    flipCardFront: (colors) => ({
      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg.replace('0.12', '0.18')})`,
      border: `1.5px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '1rem',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      height: '100%',
      justifyContent: 'space-between',
    }),
    flipCardBack: (colors) => ({
      background: `linear-gradient(135deg, ${colors.bg}, ${colors.bg.replace('0.12', '0.18')})`,
      border: `1.5px solid ${colors.border}`,
      borderRadius: '16px',
      padding: '1.25rem',
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
      gap: '1rem',
      overflowY: 'auto',
    }),
    bookingTime: {
      fontSize: '0.85rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bookingModel: {
      fontSize: '1rem',
      fontWeight: '700',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bookingService: (colors) => ({
      fontSize: '0.8rem',
      fontWeight: '600',
      color: colors.label,
      fontFamily: '"Alike", "Georgia", serif',
      textTransform: 'capitalize',
    }),
    bookingDetailSection: {
      marginTop: '0.5rem',
    },
    bookingDetailTitle: {
      fontSize: '0.75rem',
      fontWeight: '700',
      color: '#5A3A2A',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    bookingDetailItem: {
      fontSize: '0.7rem',
      color: '#5A3A2A',
      marginBottom: '0.35rem',
      fontFamily: '"Alike", "Georgia", serif',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    bookingDetailLabel: {
      fontWeight: '600',
      minWidth: '80px',
    },
    trainingBadge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      borderRadius: '8px',
      fontSize: '0.65rem',
      fontWeight: '600',
      background: 'rgba(139, 30, 63, 0.1)',
      color: '#8B1E3F',
      fontFamily: '"Alike", "Georgia", serif',
    },
    chatButton: {
      marginTop: 'auto',
      padding: '0.75rem',
      background: 'rgba(139, 30, 63, 0.1)',
      border: '1.5px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '12px',
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#8B1E3F',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      textAlign: 'center',
      transition: 'all 0.2s ease',
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
          <div style={{ fontSize: '1rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif', marginTop: '0.25rem' }}>
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
              const trainingProgress = getTrainingProgress(booking.serviceType);
              
              if (startHour < 8 || startHour >= 20) return null;
              
              return (
                <div
                  key={idx}
                  style={styles.dayViewBooking(colors, startHour, booking.duration || 60)}
                  onClick={() => toggleFlip(booking.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.zIndex = '10';
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.zIndex = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                  }}
                >
                  <div style={styles.flipCardWrapper}>
                    <div style={styles.flipCardInner(isFlipped)}>
                      {/* FRONT */}
                      <div style={styles.flipCardFront(colors)}>
                        <div>
                          <div style={styles.bookingTime}>
                            {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                          </div>
                          <div style={styles.bookingModel}>
                            {formatModelName(booking.modelName)}
                          </div>
                          <div style={styles.bookingService(colors)}>
                            {service?.name || booking.serviceType}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#5A3A2A', fontStyle: 'italic', opacity: 0.7 }}>
                          Tap for details
                        </div>
                      </div>
                      
                      {/* BACK */}
                      <div style={styles.flipCardBack(colors)}>
                        <div>
                          <div style={styles.bookingTime}>
                            {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                          </div>
                          <div style={styles.bookingModel}>
                            {booking.modelName}
                          </div>
                          <div style={styles.bookingService(colors)}>
                            {service?.name || booking.serviceType}
                          </div>
                        </div>
                        
                        {trainingProgress && (
                          <div style={styles.bookingDetailSection}>
                            <div style={styles.bookingDetailTitle}>Training Progress</div>
                            <div style={styles.bookingDetailItem}>
                              <span style={styles.bookingDetailLabel}>Category:</span>
                              <span>{trainingProgress.category}</span>
                            </div>
                            <div style={styles.bookingDetailItem}>
                              <span style={styles.bookingDetailLabel}>Sessions:</span>
                              <span>{trainingProgress.completed} / {trainingProgress.required}</span>
                            </div>
                            {trainingProgress.remaining > 0 && (
                              <div style={styles.trainingBadge}>
                                {trainingProgress.remaining} more for Level 2
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div style={styles.bookingDetailSection}>
                          <div style={styles.bookingDetailTitle}>Match Attributes</div>
                          <div style={styles.bookingDetailItem}>
                            <span style={styles.bookingDetailLabel}>Hair:</span>
                            <span>Long, Blonde, Wavy</span>
                          </div>
                          <div style={styles.bookingDetailItem}>
                            <span style={styles.bookingDetailLabel}>Location:</span>
                            <span>{booking.location?.split(' - ')[0] || 'Luxe Studio'}</span>
                          </div>
                          <div style={styles.bookingDetailItem}>
                            <span style={styles.bookingDetailLabel}>Duration:</span>
                            <span>{booking.duration || 60} minutes</span>
                          </div>
                        </div>
                        
                        <button
                          style={styles.chatButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/portal/chat', { state: { modelId: booking.modelId, modelName: booking.modelName } });
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
                        
                        <div style={{ fontSize: '0.65rem', color: '#5A3A2A', fontStyle: 'italic', opacity: 0.7, textAlign: 'center', marginTop: '0.5rem' }}>
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
              <div style={{ fontSize: '0.7rem', marginTop: '0.25rem', fontWeight: '400' }}>{date.getDate()}</div>
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
                      const isFlipped = flippedCards.has(booking.id);
                      
                      if (startHour < 8 || startHour >= 20) return null;
                      
                      return (
                        <div
                          key={bidx}
                          style={styles.weekViewBooking(colors, startHour, booking.duration || 60)}
                          onClick={() => toggleFlip(booking.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.zIndex = '10';
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.border}40`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.zIndex = '1';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                          }}
                        >
                          <div style={styles.flipCardWrapper}>
                            <div style={styles.flipCardInner(isFlipped)}>
                              <div style={styles.flipCardFront(colors)}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.25rem' }}>
                                  {booking.appointmentTime}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.15rem' }}>
                                  {formatModelName(booking.modelName)}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: colors.label }}>
                                  {getServiceById(booking.serviceType)?.name?.substring(0, 10) || booking.serviceType}
                                </div>
                              </div>
                              <div style={styles.flipCardBack(colors)}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.5rem' }}>
                                  {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                                </div>
                                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.25rem' }}>
                                  {booking.modelName}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: colors.label, marginBottom: '0.75rem' }}>
                                  {getServiceById(booking.serviceType)?.name || booking.serviceType}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
                                  Hair: Long, Blonde
                                </div>
                                <button
                                  style={{
                                    ...styles.chatButton,
                                    padding: '0.5rem',
                                    fontSize: '0.7rem',
                                    marginTop: '0.5rem',
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/portal/chat', { state: { modelId: booking.modelId, modelName: booking.modelName } });
                                  }}
                                >
                                  Message
                                </button>
                              </div>
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
                      const trainingProgress = getTrainingProgress(booking.serviceType);
                      
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
                              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.25rem' }}>
                                {booking.appointmentTime}
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.15rem' }}>
                                {formatModelName(booking.modelName)}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: colors.label }}>
                                {getServiceById(booking.serviceType)?.name || booking.serviceType}
                              </div>
                            </div>
                            <div style={styles.flipCardBack(colors)}>
                              <div style={{ fontSize: '0.7rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.25rem' }}>
                                {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                              </div>
                              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.15rem' }}>
                                {booking.modelName}
                              </div>
                              <div style={{ fontSize: '0.65rem', color: colors.label, marginBottom: '0.5rem' }}>
                                {getServiceById(booking.serviceType)?.name || booking.serviceType}
                              </div>
                              {trainingProgress && (
                                <div style={{ fontSize: '0.6rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
                                  Training: {trainingProgress.completed}/{trainingProgress.required}
                                </div>
                              )}
                              <div style={{ fontSize: '0.6rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
                                Hair: Long, Blonde
                              </div>
                              <button
                                style={{
                                  ...styles.chatButton,
                                  padding: '0.5rem',
                                  fontSize: '0.7rem',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/portal/chat', { state: { modelId: booking.modelId, modelName: booking.modelName } });
                                }}
                              >
                                Message
                              </button>
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

  const renderSelectedView = () => {
    switch (selectedView) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
        return renderMonthView();
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
      default:
        return '';
    }
  };

  // Count blowout bookings for training display
  const blowoutCount = bookings.filter(b => b.serviceType === 'blowdry').length;
  const totalBookings = bookings.length;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Booked Calendar</h1>
        <p style={styles.subtitle}>
          Confirmed appointments • Training Focus: Blowouts & Styling
        </p>
        {totalBookings > 0 && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'rgba(220, 190, 210, 0.1)', 
            borderRadius: '12px',
            border: '1.5px solid rgba(220, 190, 210, 0.2)',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              <strong style={{ color: '#8B1E3F' }}>{blowoutCount}</strong> blowout sessions completed • 
              <strong style={{ color: '#8B1E3F' }}> {Math.max(0, 15 - blowoutCount)}</strong> more needed for Level 2
            </div>
          </div>
        )}
      </div>
      
      <div style={styles.viewSelector}>
        <button
          style={styles.viewBtn(selectedView === 'day')}
          onClick={() => {
            setSelectedView('day');
            setSelectedDate(currentPeriod);
          }}
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
      </div>
      
      <div style={styles.calendarControls}>
        <div style={styles.periodTitle}>{getPeriodTitle()}</div>
        <div style={styles.navButtons}>
          <button
            style={styles.navBtn}
            onClick={() => navigatePeriod(-1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
            }}
          >
            ←
          </button>
          <button
            style={styles.todayBtn}
            onClick={goToToday}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
            }}
          >
            Today
          </button>
          <button
            style={styles.navBtn}
            onClick={() => navigatePeriod(1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
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
