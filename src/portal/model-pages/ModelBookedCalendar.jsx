import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getServiceById } from '../../admin/data/services';
import { getBookingsForUser } from '../../utils/bookingService';
import { getProfessionalById } from '../../utils/profileService';
import { downloadICSFile, getGoogleCalendarLink, getOutlookCalendarLink } from '../../utils/calendarUtils';
import { 
  getMockProfessional,
  getMockModel,
  getMockModel as getMockModelById,
  getMockMatches
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

// Format professional name: "Sarah Johnson" -> "Sarah J."
const formatProfessionalName = (fullName) => {
  if (!fullName) return 'Stylist';
  const parts = fullName.split(' ');
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
};

// Service constraints for models
const SERVICE_CONSTRAINTS = {
  blowdry: { minDaysBetween: 3, maxPerWeek: 3 },
  haircut: { minDaysBetween: 14, maxPerMonth: 2 },
  color: { minDaysBetween: 14, maxPerMonth: 1 },
  highlights: { minDaysBetween: 14, maxPerMonth: 1 },
  gloss: { minDaysBetween: 7, maxPerMonth: 2 },
  keratin: { minDaysBetween: 30, maxPerMonth: 1 },
};

/** Deduplicate bookings by id; fallback to composite key when id missing. Keeps first occurrence. */
function deduplicateBookings(bookings) {
  if (!Array.isArray(bookings) || bookings.length === 0) return bookings;
  const seen = new Set();
  return bookings.filter((b) => {
    const key = b.id || `${b.appointmentDate}|${b.appointmentTime}|${b.professionalId || ''}|${b.serviceType || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Generate realistic model bookings respecting hair care constraints
const generateModelBookings = () => {
  try {
    const model = getMockModel('mock-model-1');
    const professional = getMockProfessional('mock-pro-1');
    
    if (!model || !professional) {
      return [];
    }
    
    const bookings = [];
    const today = new Date();
    
    // Track last booking date for each service type
    const lastBookingDates = {};
    const monthlyCounts = {};
    
    // Available time slots
    const serviceTimes = [
      '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
      '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];
    
    const services = [
      { type: 'blowdry', duration: 45 },
      { type: 'haircut', duration: 60 },
      { type: 'color', duration: 180 },
      { type: 'highlights', duration: 240 },
      { type: 'gloss', duration: 90 },
      { type: 'keratin', duration: 120 },
    ];
    
    // Start with a baseline - assume some recent bookings
    const baselineBookings = [
      { type: 'blowdry', daysAgo: 2 },
      { type: 'haircut', daysAgo: 10 },
      { type: 'color', daysAgo: 16 },
    ];
    
    baselineBookings.forEach(baseline => {
      const date = new Date(today);
      date.setDate(date.getDate() - baseline.daysAgo);
      lastBookingDates[baseline.type] = date;
      monthlyCounts[baseline.type] = 1;
    });
    
    // Demo-friendly: ~8-10 bookings over next 14 days (not 60 days of clutter)
    const DEMO_MAX_BOOKINGS = 10;
    const DEMO_DAYS_FORWARD = 14;
    for (let dayOffset = 0; dayOffset < DEMO_DAYS_FORWARD && bookings.length < DEMO_MAX_BOOKINGS; dayOffset++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() + dayOffset);
      
      // Prefer weekdays but allow some weekends
      if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
        if (Math.random() > 0.2) continue; // 20% chance of weekend booking
      }
      
      const usedTimes = new Set();
      const dayBookings = [];
      
      // Check which services are eligible for this day
      const eligibleServices = services.filter(service => {
        const constraint = SERVICE_CONSTRAINTS[service.type];
        if (!constraint) return true;
        
        const lastDate = lastBookingDates[service.type];
        if (!lastDate) return true; // Never had this service, eligible
        
        const daysSince = Math.floor((bookingDate - lastDate) / (1000 * 60 * 60 * 24));
        if (daysSince < constraint.minDaysBetween) return false;
        
        // Check monthly limits
        const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
        const count = monthlyCounts[service.type] || 0;
        if (constraint.maxPerMonth && count >= constraint.maxPerMonth) return false;
        
        // Check weekly limits for blowdry
        if (service.type === 'blowdry' && constraint.maxPerWeek) {
          const weekStart = new Date(bookingDate);
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const weekBookings = bookings.filter(b => {
            const bDate = new Date(b.appointmentDate);
            return bDate >= weekStart && bDate <= bookingDate && b.serviceType === 'blowdry';
          });
          if (weekBookings.length >= constraint.maxPerWeek) return false;
        }
        
        return true;
      });
      
      // Prioritize blowouts (most frequent)
      const blowdryAvailable = eligibleServices.find(s => s.type === 'blowdry');
      if (blowdryAvailable && Math.random() < 0.6) { // 60% chance of blowout if eligible
        const availableTimes = serviceTimes.filter(t => !usedTimes.has(t));
        if (availableTimes.length > 0) {
          const time = availableTimes[Math.floor(Math.random() * availableTimes.length)];
          usedTimes.add(time);
          
          const serviceDetails = getServiceById('blowdry');
          const booking = {
            id: `mock-display-${bookingDate.toISOString().split('T')[0]}-${time}-blowdry`,
            modelId: model.id || 'mock-model-1',
            professionalId: professional.id || 'mock-pro-1',
            appointmentDate: bookingDate.toISOString().split('T')[0],
            appointmentTime: time,
            duration: 45,
            serviceType: 'blowdry',
            serviceDescription: serviceDetails?.description || 'Blowdry service',
            location: professional.salonAddress || 'Luxe Studio - 123 Main St, NYC',
            modelFee: serviceDetails?.modelFee || 30,
            status: 'confirmed',
            professionalName: professional ? `${professional.firstName} ${professional.lastName}` : 'Sarah Johnson',
          };
          
          dayBookings.push(booking);
          lastBookingDates['blowdry'] = bookingDate;
          const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
          monthlyCounts['blowdry'] = (monthlyCounts['blowdry'] || 0) + 1;
        }
      }
      
      // Add other services if eligible and not too many bookings today
      const otherEligible = eligibleServices.filter(s => s.type !== 'blowdry');
      if (otherEligible.length > 0 && dayBookings.length === 0 && Math.random() < 0.3) {
        const service = otherEligible[Math.floor(Math.random() * otherEligible.length)];
        const availableTimes = serviceTimes.filter(t => !usedTimes.has(t));
        if (availableTimes.length > 0) {
          const time = availableTimes[Math.floor(Math.random() * availableTimes.length)];
          usedTimes.add(time);
          
          const serviceDetails = getServiceById(service.type);
          const booking = {
            id: `mock-display-${bookingDate.toISOString().split('T')[0]}-${time}-${service.type}`,
            modelId: model.id || 'mock-model-1',
            professionalId: professional.id || 'mock-pro-1',
            appointmentDate: bookingDate.toISOString().split('T')[0],
            appointmentTime: time,
            duration: service.duration,
            serviceType: service.type,
            serviceDescription: serviceDetails?.description || `${service.type} service`,
            location: professional.salonAddress || 'Luxe Studio - 123 Main St, NYC',
            modelFee: serviceDetails?.modelFee || 30,
            status: 'confirmed',
            professionalName: professional ? `${professional.firstName} ${professional.lastName}` : 'Sarah Johnson',
          };
          
          dayBookings.push(booking);
          lastBookingDates[service.type] = bookingDate;
          const monthKey = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`;
          monthlyCounts[service.type] = (monthlyCounts[service.type] || 0) + 1;
        }
      }
      
      bookings.push(...dayBookings);
      if (bookings.length >= DEMO_MAX_BOOKINGS) break;
    }
    
    return bookings;
  } catch (error) {
    console.error('Error generating model bookings:', error);
    return [];
  }
};

export default function ModelBookedCalendar() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [selectedView, setSelectedView] = useState('week');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentPeriod, setCurrentPeriod] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load real bookings from database/mock data
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

  const fetchBookingsWithTimeout = (userId, userType, filters = {}, timeoutMs = 4000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Booking load timeout'));
      }, timeoutMs);
    });

    return Promise.race([
      getBookingsForUser(userId, userType, filters),
      timeoutPromise,
    ]).finally(() => {
      clearTimeout(timeoutId);
    });
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Get model profile to find modelId
      let modelId = null;
      let loadedBookings = [];
      
      // Use authenticated user when available; fall back to mock model for demo
      const mockModel = getMockModelById('mock-model-1');
      const userId = user?.userId || mockModel?.userId;
      
      if (userId) {
        loadedBookings = await fetchBookingsWithTimeout(userId, 'model');
        
        // Also try without status filter to see all bookings
        if (loadedBookings.length === 0) {
          loadedBookings = await fetchBookingsWithTimeout(mockModel.userId, 'model', {});
        }
        
        // Filter to confirmed/booked status for calendar display
        const confirmedBookings = loadedBookings.filter(b => 
          b.status === 'confirmed' || b.status === 'booked'
        );
        loadedBookings = confirmedBookings;
      }
      
      // Fallback: try localStorage / accepted matches only when we have mock model (demo)
      if (loadedBookings.length === 0 && mockModel) {
        const storageData = localStorage.getItem('modeled_mock_data');
        if (storageData) {
          const data = JSON.parse(storageData);
          const allBookings = data.bookings || [];
          
          const modelBookings = allBookings.filter(b => 
            b.modelId === mockModel.id || 
            b.modelId === 'mock-model-1' ||
            b.modelId === '1'
          );
          
          if (modelBookings.length > 0) {
            loadedBookings = modelBookings.filter(b => 
              b.status === 'confirmed' || b.status === 'booked'
            );
            
            // If we have accepted matches but no bookings, create bookings from them (for demo)
            if (loadedBookings.length === 0) {
              const acceptedMatches = getMockMatches({ 
                modelId: mockModel.id,
                status: 'accepted' 
              });
              
              // For demo: Create bookings from accepted matches that don't have bookings yet
              if (acceptedMatches.length > 0) {
                const { createBookingFromMatch } = await import('../../utils/bookingService');
                const { getMockRequests } = await import('../../utils/mockDataService');
                
                for (const match of acceptedMatches) {
                  // Check if booking already exists for this match
                  const existingBooking = allBookings.find(b => b.matchId === match.id);
                  if (!existingBooking) {
                    try {
                      const request = getMockRequests({ id: match.requestId })[0];
                      if (request) {
                        const bookingResult = await createBookingFromMatch(match.id, {
                          modelPaid: true, // Demo mode
                          proPaid: true,   // Demo mode
                          appointmentDate: request.requestedDate,
                          appointmentTime: request.requestedTime,
                        });
                        if (bookingResult.booking) {
                          loadedBookings.push(bookingResult.booking);
                        }
                      }
                    } catch (error) {
                      console.error('Error creating booking from match:', error);
                    }
                  }
                }
              }
            }
          }
        }
      }
      
      // Enrich bookings with professional names and ensure proper formatting
      if (loadedBookings && loadedBookings.length > 0) {
        const enrichedBookings = await Promise.all(loadedBookings.map(async (booking) => {
          let professionalName = booking.professionalName;
          if (!professionalName && booking.professionalId) {
            const professional = await getProfessionalById(booking.professionalId);
            if (professional) {
              professionalName = `${professional.firstName} ${professional.lastName}`;
            }
          }
          return {
            ...booking,
            appointmentDate: booking.appointmentDate || booking.date,
            appointmentTime: booking.appointmentTime || booking.time,
            duration: booking.duration || 60,
            serviceType: booking.serviceType || booking.serviceId,
            professionalName: professionalName || 'Professional',
            location: booking.location || 'TBD',
          };
        }));
        
        const deduped = deduplicateBookings(enrichedBookings);
        setBookings(deduped);
        setLoading(false);
        return;
      }
      
      // Fallback: Use mock bookings if no real bookings found (for demo purposes)
      const mockBookings = deduplicateBookings(generateModelBookings());
      setBookings(mockBookings);
    } catch (error) {
      console.error('❌ Error loading bookings:', error);
      const mockBookings = deduplicateBookings(generateModelBookings());
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const closeBookingDetails = () => {
    setSelectedBooking(null);
  };

  // Calculate maintenance suggestions based on last bookings
  const getMaintenanceSuggestions = () => {
    const today = new Date();
    const suggestions = [];
    
    // Find last booking date for each service type
    const lastBookings = {};
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.appointmentDate);
      const serviceType = booking.serviceType;
      
      if (!lastBookings[serviceType] || bookingDate > lastBookings[serviceType].date) {
        lastBookings[serviceType] = {
          date: bookingDate,
          booking: booking
        };
      }
    });
    
    // Calculate next suggested dates
    Object.keys(SERVICE_CONSTRAINTS).forEach(serviceType => {
      const constraint = SERVICE_CONSTRAINTS[serviceType];
      const lastBooking = lastBookings[serviceType];
      
      if (lastBooking) {
        const daysSince = Math.floor((today - lastBooking.date) / (1000 * 60 * 60 * 24));
        const daysUntilEligible = constraint.minDaysBetween - daysSince;
        
        if (daysUntilEligible <= 7) { // Suggest if eligible within a week
          const suggestedDate = new Date(lastBooking.date);
          suggestedDate.setDate(suggestedDate.getDate() + constraint.minDaysBetween);
          
          suggestions.push({
            serviceType,
            serviceName: getServiceById(serviceType)?.name || serviceType,
            lastDate: lastBooking.date,
            suggestedDate,
            daysUntilEligible: Math.max(0, daysUntilEligible),
            isEligible: daysUntilEligible <= 0,
            color: getServiceColors(serviceType),
          });
        }
      } else {
        // Never had this service, suggest it
        suggestions.push({
          serviceType,
          serviceName: getServiceById(serviceType)?.name || serviceType,
          lastDate: null,
          suggestedDate: new Date(today),
          daysUntilEligible: 0,
          isEligible: true,
          color: getServiceColors(serviceType),
        });
      }
    });
    
    return suggestions.sort((a, b) => {
      if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
      return a.daysUntilEligible - b.daysUntilEligible;
    });
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    if (!date) return [];
    if (!bookings || bookings.length === 0) return [];
    
    const filtered = bookings.filter(b => {
      if (!b.appointmentDate) {
        console.warn('⚠️ Booking missing appointmentDate:', b);
        return false;
      }
      const bookingDate = new Date(b.appointmentDate);
      const targetDate = new Date(date);
      const matches = bookingDate.toDateString() === targetDate.toDateString();
      return matches;
    });
    
    const sorted = filtered.sort((a, b) => {
      const timeA = a.appointmentTime || '12:00 PM';
      const timeB = b.appointmentTime || '12:00 PM';
      return timeA.localeCompare(timeB);
    });
    
    return sorted;
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

  // Get time slot position (in pixels, 40px per hour)
  const getTimeSlotPosition = (timeString) => {
    if (!timeString) return 0;
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    // Calculate position from 8:00 AM
    const startHour = 8;
    const hoursFromStart = hour24 - startHour;
    const minutesOffset = (minutes || 0) / 60;
    return (hoursFromStart + minutesOffset) * HOUR_HEIGHT;
  };

  // Get duration in pixels (40px per hour)
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
    headerNav: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    navButton: {
      width: '36px',
      height: '36px',
      background: 'transparent',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '4px',
      fontSize: '1.2rem',
      color: '#5A3A2A',
      cursor: 'pointer',
      fontFamily: '"Roboto", "Arial", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    todayButton: {
      padding: '0.5rem 1rem',
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
    headerTitle: {
      fontSize: '1.25rem',
      fontWeight: '500',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginLeft: '1rem',
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1rem',
      padding: '1.5rem 2rem 2rem',
    },
    bookingCard: {
      background: '#FFFEF9',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '12px',
      padding: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    bookingHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '0.75rem',
      gap: '0.75rem',
    },
    bookingServiceText: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    bookingMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem',
      fontSize: '0.85rem',
      color: '#5A3A2A',
      fontFamily: '"Roboto", "Arial", sans-serif',
    },
    bookingStatus: {
      padding: '0.2rem 0.6rem',
      borderRadius: '999px',
      background: 'rgba(139, 30, 63, 0.12)',
      color: '#8B1E3F',
      fontSize: '0.75rem',
      fontWeight: '600',
      fontFamily: '"Roboto", "Arial", sans-serif',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
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
      height: `${HOUR_HEIGHT}px`,
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
      minHeight: `${12 * HOUR_HEIGHT}px`, // 12 hours
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
      left: '1rem',
      right: '1rem',
      top: `${top}px`,
      height: `${Math.max(height, 72)}px`,
      background: colors.solid,
      borderLeft: `4px solid ${colors.accent}`,
      borderRadius: '8px',
      padding: '0.9rem',
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
      height: `${HOUR_HEIGHT}px`,
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
      minHeight: `${12 * HOUR_HEIGHT}px`,
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
    weekViewBooking: (colors, top, height) => ({
      position: 'absolute',
      left: '0.75rem',
      right: '0.75rem',
      top: `${top}px`,
      height: `${Math.max(height, 60)}px`,
      background: colors.solid,
      borderLeft: `4px solid ${colors.accent}`,
      borderRadius: '8px',
      padding: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      minHeight: '60px',
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
    
    // Card text styles
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
    bookingServiceLabel: (colors) => ({
      fontSize: '0.8rem',
      color: colors.label,
      fontFamily: '"Roboto", "Arial", sans-serif',
      marginTop: '0.25rem',
      fontWeight: '600',
      lineHeight: '1.4',
      wordBreak: 'break-word',
    }),
    
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
            const bookingKey = booking.id || `day-${idx}-${booking.appointmentDate}-${booking.appointmentTime}-${booking.serviceType}`;
            
            return (
              <div
                key={bookingKey}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={styles.bookingTitle}>
                    {formatProfessionalName(booking.professionalName)}
                  </div>
                  <div style={styles.bookingTime}>
                    {booking.appointmentTime} - {calculateEndTime(booking.appointmentTime, booking.duration || 60)}
                  </div>
                  <div style={styles.bookingServiceLabel(colors)}>
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
                const bookingKey = booking.id || `week-${dayIdx}-${bidx}-${booking.appointmentDate}-${booking.appointmentTime}-${booking.serviceType}`;
                
                return (
                  <div
                    key={bookingKey}
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <div style={styles.bookingTitle}>
                        {formatProfessionalName(booking.professionalName)}
                      </div>
                      <div style={styles.bookingTime}>
                        {booking.appointmentTime}
                      </div>
                      <div style={styles.bookingServiceLabel(colors)}>
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
          const dayKey = day.date.toISOString().split('T')[0];
          
          return (
            <div
              key={dayKey}
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
                    const bookingKey = booking.id || `month-${dayKey}-${bidx}-${booking.appointmentDate}-${booking.appointmentTime}`;
                    
                    return (
                      <div
                        key={bookingKey}
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
                          {formatProfessionalName(booking.professionalName)}
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

  const sortedBookings = [...bookings].sort((a, b) => {
    const aDate = new Date(`${a.appointmentDate} ${a.appointmentTime || '12:00 AM'}`);
    const bDate = new Date(`${b.appointmentDate} ${b.appointmentTime || '12:00 AM'}`);
    return aDate - bDate;
  });

  // Full loading state - prevent layout shift and show clear feedback
  if (loading && bookings.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={{ ...styles.headerTitle, opacity: 0.7 }}>Booked Sessions</div>
            </div>
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 2rem',
            gap: '1rem',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(139, 30, 63, 0.2)',
              borderTopColor: '#8B1E3F',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{
              color: '#5A3A2A',
              fontFamily: '"Roboto", "Arial", sans-serif',
              fontSize: '0.95rem',
            }}>
              Loading bookings...
            </div>
          </div>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerTitle}>
              Booked Sessions
              {bookings.length > 0 && (
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: '400',
                  color: '#5A3A2A',
                  marginLeft: '0.75rem',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                }}>
                  ({bookings.length} session{bookings.length !== 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
          <button
            style={styles.todayButton}
            onClick={loadBookings}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)')}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Refresh bookings"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div style={styles.cardsGrid}>
          {sortedBookings.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              color: '#5A3A2A',
              fontFamily: '"Roboto", "Arial", sans-serif',
              padding: '2rem 0',
            }}>
              No booked sessions yet.
            </div>
          ) : (
            sortedBookings.map((booking) => {
              const serviceName = getServiceById(booking.serviceType)?.name || booking.serviceType || 'Service';
              const appointmentDate = booking.appointmentDate
                ? new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Date TBD';
              const startTime = booking.appointmentTime || 'Time TBD';
              const endTime = booking.duration ? calculateEndTime(startTime, booking.duration) : null;
              const timeLabel = endTime ? `${startTime} - ${endTime}` : startTime;
              const cardKey = booking.id || `${booking.appointmentDate}-${booking.appointmentTime}-${booking.serviceType}`;

              return (
                <div
                  key={cardKey}
                  style={styles.bookingCard}
                  onClick={() => openBookingDetails(booking)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 30, 63, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={styles.bookingHeader}>
                    <div style={styles.bookingServiceText}>{serviceName}</div>
                    {booking.status && (
                      <div style={styles.bookingStatus}>{booking.status}</div>
                    )}
                  </div>
                  <div style={styles.bookingMeta}>
                    <div>{appointmentDate}</div>
                    <div>{timeLabel}</div>
                    <div>{formatProfessionalName(booking.professionalName) || 'Stylist'}</div>
                    <div>{booking.location || 'Location TBD'}</div>
                  </div>
                </div>
              );
            })
          )}
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
            
            <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(139, 30, 63, 0.1)' }}>
              <div style={styles.modalTitle}>
                {formatProfessionalName(selectedBooking.professionalName)}
              </div>
              <div style={styles.modalTime}>
                {selectedBooking.appointmentTime} - {calculateEndTime(selectedBooking.appointmentTime, selectedBooking.duration || 60)}
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
            
            {/* Add to Calendar Section */}
            <div style={styles.modalSection}>
              <div style={styles.modalSectionTitle}>Add to Calendar</div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <button
                  style={{
                    ...styles.chatButton,
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(46, 160, 67, 0.1)',
                    border: '1px solid rgba(46, 160, 67, 0.2)',
                    color: '#3fb950',
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
                    ...styles.chatButton,
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(0, 120, 212, 0.1)',
                    border: '1px solid rgba(0, 120, 212, 0.2)',
                    color: '#0078d4',
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
                    ...styles.chatButton,
                    padding: '0.75rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    background: 'rgba(139, 30, 63, 0.1)',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    color: '#8B1E3F',
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
                  ...styles.chatButton,
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                }}
                onClick={() => {
                  navigate('/model-portal/chat', { state: { professionalId: selectedBooking.professionalId, professionalName: selectedBooking.professionalName } });
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
                Message Stylist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
