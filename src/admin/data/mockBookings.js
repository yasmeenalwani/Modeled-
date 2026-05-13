// ============================================
// MOCK BOOKINGS DATA
// ============================================
// Bookings created when models accept booking requests

export let mockBookings = [
  // Bookings will be added here when models accept
];

// Helper to create a booking from a match/notification
export function createBookingFromMatch(match, request, professional, model) {
  const booking = {
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    matchId: match.id,
    requestId: request.id,
    modelId: model.id,
    professionalId: request.professionalId,
    
    // Appointment details
    appointmentDate: request.requestedDate,
    appointmentTime: request.requestedTime,
    duration: request.duration || 60,
    location: request.location || professional?.salonAddress || 'TBD',
    
    // Service
    serviceType: request.serviceType,
    serviceDescription: request.serviceDescription || '',
    
    // Payment (mock values - would come from service pricing)
    modelFee: request.modelPayment || 25,
    modelPaymentStatus: 'pending', // Would be 'paid' after payment
    professionalFee: request.modelSearchFee || 15,
    professionalPaymentStatus: 'pending',
    paymentAmount: (request.modelPayment || 25) + (request.modelSearchFee || 15),
    paymentCurrency: 'usd',
    
    // Status
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    
    // For display
    model: {
      id: model.id,
      name: `${model.firstName} ${model.lastName}`,
      avatar: model.firstName?.[0] || 'M',
    },
    professional: {
      id: professional?.id,
      name: professional ? `${professional.firstName} ${professional.lastName}` : 'Unknown',
      avatar: professional?.firstName?.[0] || 'P',
    },
  };
  
  mockBookings.push(booking);
  return booking;
}

// Get bookings for a model
export function getBookingsForModel(modelId) {
  return mockBookings.filter(b => b.modelId === modelId);
}

// Get bookings for a professional
export function getBookingsForProfessional(professionalId) {
  return mockBookings.filter(b => b.professionalId === professionalId);
}

// Get all bookings
export function getAllBookings() {
  return mockBookings;
}

// Enriched bookings (for calendar display - includes model/pro names)
export function getEnrichedBookings() {
  return mockBookings.map(booking => ({
    ...booking,
    // Already includes model and professional objects
  }));
}

// Alias for compatibility
export const enrichedMockBookings = getEnrichedBookings;

// Get bookings by salon (would filter by professional's partnerId)
export function getBookingsBySalon(salonId) {
  return mockBookings.filter(b => {
    // Would need to check professional's partnerId
    return true; // For now, return all
  });
}

// Get bookings by professional
export function getBookingsByProfessional(professionalId) {
  return mockBookings.filter(b => b.professionalId === professionalId);
}

// Get pending bookings
export function getPendingBookings() {
  return mockBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
}

// Get today's bookings
export function getTodayBookings() {
  const today = new Date().toISOString().split('T')[0];
  return mockBookings.filter(b => {
    const bookingDate = new Date(b.appointmentDate).toISOString().split('T')[0];
    return bookingDate === today && b.status !== 'cancelled';
  });
}

// Get upcoming bookings (next 7 days)
export function getUpcomingBookings() {
  const today = new Date();
  const weekEnd = new Date(today);
  weekEnd.setDate(today.getDate() + 7);
  
  return mockBookings.filter(b => {
    const bookingDate = new Date(b.appointmentDate);
    return bookingDate >= today && bookingDate <= weekEnd && b.status !== 'cancelled';
  }).sort((a, b) => {
    const dateA = new Date(a.appointmentDate);
    const dateB = new Date(b.appointmentDate);
    return dateA - dateB;
  });
}

// Get booking by ID
export function getBookingById(bookingId) {
  return mockBookings.find(b => b.id === bookingId);
}

// Update booking status
export function updateBookingStatus(bookingId, status) {
  const booking = mockBookings.find(b => b.id === bookingId);
  if (booking) {
    booking.status = status;
    return booking;
  }
  return null;
}
