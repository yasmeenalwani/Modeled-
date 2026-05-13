/**
 * MODELED MANAGEMENT - Booking Service
 * 
 * Comprehensive booking management utilities for creating, updating, canceling, and managing bookings
 */

import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';
import { getServiceById } from '../admin/data/services';
import { getProfessionalById, getModelById } from './profileService';
import { 
  createMockBooking,
  getMockRequests,
  getMockModel,
  getMockProfessional,
  getMockProfessionalByUserId,
  getMockModels,
  getMockBookings,
  updateMockBooking,
  updateMockRequest,
  updateMockMatch,
  shouldUseMockData,
  getMockMatches,
} from './mockDataService';
import { updateScoresAfterCompletedBooking, applyCancellationPenalty } from './agenticScores';
import { refundPayment } from './stripe';

let client = null;
// In demo mode, never initialize client to prevent database access
if (!shouldUseMockData()) {
  try {
    client = generateClient();
  } catch (error) {
    console.warn('Failed to generate Amplify client, will use mock data only:', error);
    client = null;
  }
} else {
  // Demo mode - explicitly keep client as null
  client = null;
}

const BookingStatus = {
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

const MatchStatus = {
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
};

const RequestStatus = {
  BOOKED: 'booked',
};

// ============ BOOKING CREATION ============

/**
 * Create a booking from a match (after payment)
 */
export async function createBookingFromMatch(matchId, paymentData = {}) {
  try {
    console.log('📅 Creating booking from match:', matchId, 'Payment data:', paymentData);
    let match, request, model, professional;
    
    if (!matchId) throw new Error('Missing matchId');

    const hasModels = client?.models?.Match && client?.models?.ModelRequest &&
        client?.models?.ModelProfile && client?.models?.Professional && client?.models?.Booking;
    const hasGet = hasModels && typeof client.models.Match.get === 'function' && typeof client.models.ModelRequest.get === 'function' &&
        typeof client.models.ModelProfile.get === 'function' && typeof client.models.Professional.get === 'function';
    if (!shouldUseMockData() && hasModels && hasGet) {
      try {
        // 1. Get the match
        const { data: matchData } = await client.models.Match.get({ id: matchId });
        if (!matchData) {
          throw new Error('Match not found');
        }
        match = matchData;

        // 2. Get request and user details
        const { data: requestData } = await client.models.ModelRequest.get({ id: match.requestId });
        if (!requestData) {
          throw new Error('Request not found');
        }
        request = requestData;

        const { data: modelData } = await client.models.ModelProfile.get({ id: match.modelId });
        if (!modelData) {
          throw new Error('Model not found');
        }
        model = modelData;

        const { data: professionalData } = await client.models.Professional.get({ id: request.professionalId });
        if (!professionalData) {
          throw new Error('Professional not found');
        }
        professional = professionalData;

        // 3. Get service pricing
        const service = getServiceById(request.serviceType);
        const modelFee = service?.modelFee || paymentData.modelFee || 0;
        const professionalFee = service?.professionalFee || paymentData.professionalFee || 0;

        // 4. Create Booking record
        const bookingData = {
          matchId: match.id,
          requestId: match.requestId,
          modelId: match.modelId,
          professionalId: request.professionalId,
          
          // Appointment details
          appointmentDate: request.requestedDate || paymentData.appointmentDate,
          appointmentTime: request.requestedTime || paymentData.appointmentTime,
          duration: request.duration || service?.duration || 60,
          location: request.location || professional?.salonAddress || paymentData.location,
          
          // Service
          serviceType: request.serviceType,
          serviceDescription: request.serviceDescription || service?.description || '',
          
          // Payment
          modelFee,
          modelPaymentStatus: paymentData.modelPaid ? 'paid' : 'pending',
          professionalFee,
          professionalPaymentStatus: paymentData.proPaid ? 'paid' : 'pending',
          
          // Stripe
          stripePaymentIntentId: paymentData.paymentIntentId,
          stripeCustomerId: paymentData.customerId,
          stripePaymentMethodId: paymentData.paymentMethodId,
          stripeChargeId: paymentData.chargeId,
          
          // Payment details
          paymentAmount: modelFee + professionalFee,
          paymentCurrency: 'usd',
          paymentDate: new Date(),
          
          // Status
          status: BookingStatus.CONFIRMED,
        };

        const { data: booking, errors } = await client.models.Booking.create(bookingData);
        
        if (errors || !booking) {
          throw new Error(errors?.[0]?.message || 'Failed to create booking');
        }

        // 5. Update match status
        if (client && client.models) {
          try {
            await client.models.Match.update({
              id: matchId,
              status: MatchStatus.ACCEPTED,
              bookingId: booking.id,
            });
          } catch (error) {
            console.error('Error updating match status:', error);
          }
        }

        // 6. Update request status
        if (client && client.models) {
          try {
            await client.models.ModelRequest.update({
              id: match.requestId,
              status: RequestStatus.BOOKED,
            });
          } catch (error) {
            console.error('Error updating request status:', error);
          }
        }

        // 7. Send notifications (async, don't wait)
        sendBookingNotifications(booking, model, professional, request).catch(console.error);

        // 8. Move other SENT matches to waitlist (first to accept+pay wins)
        const { moveOtherMatchesToWaitlist } = await import('./matchService');
        moveOtherMatchesToWaitlist(match.requestId, matchId).catch(console.error);

        return { success: true, booking };
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
        // Fall through to mock data
      }
    }
    
    // Use mock data
    console.log('📅 Using mock data to create booking for match:', matchId);
    const mockMatches = getMockMatches({ id: matchId });
    match = mockMatches[0];
    
    if (!match) {
      console.error('❌ Match not found:', matchId);
      throw new Error('Match not found');
    }
    
    console.log('✅ Match found:', match.id, 'Request ID:', match.requestId, 'Model ID:', match.modelId);
    
    const mockRequests = getMockRequests({ id: match.requestId });
    request = mockRequests[0];
    
    if (!request) {
      console.error('❌ Request not found:', match.requestId);
      throw new Error('Request not found');
    }
    
    console.log('✅ Request found:', request.id, 'Service:', request.serviceType);
    
    model = getMockModel(match.modelId);
    professional = getMockProfessional(request.professionalId);
    
    if (!model || !professional) {
      console.error('❌ Model or professional not found:', { 
        model: !!model, 
        modelId: match.modelId,
        professional: !!professional,
        professionalId: request.professionalId 
      });
      throw new Error('Model or professional not found');
    }
    
    console.log('✅ Model and professional found:', {
      model: `${model.firstName} ${model.lastName}`,
      professional: `${professional.firstName} ${professional.lastName}`
    });
    
    // Get service pricing
    const service = getServiceById(request.serviceType);
    const modelFee = service?.modelFee || paymentData.modelFee || 50;
    const professionalFee = service?.professionalFee || paymentData.professionalFee || 100;
    
    // Create mock booking
    // DEMO MODE: Always create as 'confirmed' even without payment
    // In production, this would require payment completion
    // Default to confirmed if using mock data OR if payment is marked as paid
    const isDemoMode = shouldUseMockData();
    const isPaid = paymentData.modelPaid && paymentData.proPaid;
    const bookingStatus = (isPaid || isDemoMode) ? BookingStatus.CONFIRMED : 'pending';
    
    console.log('📅 Booking status decision:', {
      isDemoMode,
      isPaid,
      modelPaid: paymentData.modelPaid,
      proPaid: paymentData.proPaid,
      finalStatus: bookingStatus
    });
    
    const booking = createMockBooking({
      matchId: match.id,
      requestId: match.requestId,
      modelId: match.modelId,
      professionalId: request.professionalId,
      appointmentDate: request.requestedDate || paymentData.appointmentDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 3 days from now
      appointmentTime: request.requestedTime || paymentData.appointmentTime || '2:00 PM',
      duration: request.duration || service?.duration || 60,
      location: request.location || professional?.salonAddress || paymentData.location || 'Luxe Studio',
      serviceType: request.serviceType,
      serviceDescription: request.serviceDescription || service?.description || '',
      modelFee,
      // DEMO MODE: Default to 'paid' when using mock data or when explicitly marked as paid
      modelPaymentStatus: (paymentData.modelPaid !== false && (paymentData.modelPaid || shouldUseMockData())) ? 'paid' : 'pending',
      professionalFee,
      professionalPaymentStatus: (paymentData.proPaid !== false && (paymentData.proPaid || shouldUseMockData())) ? 'paid' : 'pending',
      paymentAmount: modelFee + professionalFee,
      paymentCurrency: 'usd',
      status: bookingStatus,
      // Add professional name for calendar display
      professionalName: professional ? `${professional.firstName} ${professional.lastName}` : 'Professional',
    });
    
    console.log('✅ Booking created from match:', {
      id: booking.id,
      modelId: booking.modelId,
      status: booking.status,
      appointmentDate: booking.appointmentDate,
      appointmentTime: booking.appointmentTime,
    });
    
    // Update match status
    updateMockMatch(matchId, {
      status: MatchStatus.ACCEPTED,
      bookingId: booking.id,
    });
    
    // Update request status
    updateMockRequest(match.requestId, { status: RequestStatus.BOOKED });

    // Move other SENT matches to waitlist (first to accept+pay wins)
    const { moveOtherMatchesToWaitlist } = await import('./matchService');
    moveOtherMatchesToWaitlist(match.requestId, matchId).catch(console.error);

    // Send notifications
    sendBookingNotifications(booking, model, professional, request).catch(console.error);

    return { success: true, booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// ============ BOOKING QUERIES ============

/**
 * Get bookings for a user (model, professional, or admin)
 */
export async function getBookingsForUser(userId, userType, filters = {}) {
  try {
    let bookings = [];
    const hasBooking = client?.models?.Booking && typeof client.models.Booking.list === 'function';
    const hasModelProfile = client?.models?.ModelProfile && typeof client.models.ModelProfile.list === 'function';
    const hasProfessional = client?.models?.Professional && typeof client.models.Professional.list === 'function';

    if (!shouldUseMockData() && hasBooking && (userType === 'admin' || hasModelProfile || hasProfessional)) {
      try {
        if (userType === 'admin') {
          const queryOptions = {
            limit: 1000,
          };

          if (filters.status) {
            queryOptions.filter = { status: { eq: filters.status } };
          }
          
          const { data: allBookings } = await client.models.Booking.list(queryOptions);
          bookings = allBookings || [];
        } else if (userType === 'model') {
          // Get model profile first
          const { data: modelProfiles } = await client.models.ModelProfile.list({
            filter: { userId: { eq: userId } },
            limit: 1,
          });
          const modelProfile = modelProfiles?.[0];
          
          if (modelProfile) {
            const queryOptions = {
              filter: { modelId: { eq: modelProfile.id } },
              limit: 1000,
            };
            
            if (filters.status) {
              queryOptions.filter = {
                ...queryOptions.filter,
                status: { eq: filters.status },
              };
            }
            
            const { data: modelBookings } = await client.models.Booking.list(queryOptions);
            bookings = modelBookings || [];
          }
        } else if (userType === 'professional') {
          // Get professional profile first
          const { data: professionals } = await client.models.Professional.list({
            filter: { userId: { eq: userId } },
            limit: 1,
          });
          const professional = professionals?.[0];
          
          if (professional) {
            const queryOptions = {
              filter: { professionalId: { eq: professional.id } },
              limit: 1000,
            };
            
            if (filters.status) {
              queryOptions.filter = {
                ...queryOptions.filter,
                status: { eq: filters.status },
              };
            }
            
            const { data: proBookings } = await client.models.Booking.list(queryOptions);
            bookings = proBookings || [];
          }
        }
      } catch (dbError) {
        console.error('[bookingService] Database error getBookingsForUser:', dbError);
      }
    }

    if (bookings.length === 0 || shouldUseMockData()) {
      // getMockBookings, getMockModel, getMockProfessionalByUserId, getMockModels are already imported
      
      if (userType === 'admin') {
        bookings = getMockBookings();
      } else if (userType === 'model') {
        // For demo: Use Seraphina Luna (mock-model-1) as default
        // Try to find model by userId, or default to Seraphina
        const allModels = getMockModels();
        const model = allModels.find(m => m.userId === userId) || allModels.find(m => m.id === 'mock-model-1');
        if (model) {
          bookings = getMockBookings({ modelId: model.id });
        } else {
          // Fallback to Seraphina
          bookings = getMockBookings({ modelId: 'mock-model-1' });
        }
      } else if (userType === 'professional') {
        // For demo: Use Sarah Mitchell (mock-pro-1) as default
        const professional = getMockProfessionalByUserId(userId) || getMockProfessionalByUserId('mock-pro-user-1');
        if (professional) {
          bookings = getMockBookings({ professionalId: professional.id });
        } else {
          // Fallback to Sarah
          // getMockProfessional is already imported
          const sarah = getMockProfessional('mock-pro-1');
          if (sarah) {
            bookings = getMockBookings({ professionalId: sarah.id });
          }
        }
      }
    }

    // Apply date filters if provided
    if (filters.startDate || filters.endDate) {
      bookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        if (filters.startDate && bookingDate < new Date(filters.startDate)) return false;
        if (filters.endDate && bookingDate > new Date(filters.endDate)) return false;
        return true;
      });
    }
    
    // Apply status filter if provided
    if (filters.status) {
      bookings = bookings.filter(booking => booking.status === filters.status);
    }

    // Sort by date (most recent first)
    bookings.sort((a, b) => {
      const dateA = new Date(a.appointmentDate);
      const dateB = new Date(b.appointmentDate);
      return dateB - dateA;
    });

    // Deduplicate by id (keep first)
    const seen = new Set();
    return bookings.filter(b => {
      const key = b.id || `${b.appointmentDate}|${b.appointmentTime}|${b.professionalId || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(bookingId) {
  try {
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data: booking } = await client.models.Booking.get({ id: bookingId });
        if (booking) return booking;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    const bookings = getMockBookings({ id: bookingId });
    return bookings[0] || null;
  } catch (error) {
    console.error('Error getting booking:', error);
    return null;
  }
}

/**
 * Get upcoming bookings (next N days)
 */
export async function getUpcomingBookings(userId, userType, days = 7) {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + days);
  
  const bookings = await getBookingsForUser(userId, userType, {
    startDate: today.toISOString(),
    endDate: endDate.toISOString(),
  });
  
  return bookings.filter(b => 
    b.status !== 'cancelled' && 
    b.status !== 'completed'
  );
}

/**
 * Get today's bookings
 */
export async function getTodayBookings(userId, userType) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const bookings = await getBookingsForUser(userId, userType, {
    startDate: today.toISOString(),
    endDate: tomorrow.toISOString(),
  });
  
  return bookings.filter(b => b.status !== 'cancelled');
}

// ============ BOOKING UPDATES ============

/**
 * Update booking status
 * When status is 'no_show', applies reliability penalty to the model.
 */
export async function updateBookingStatus(bookingId, status, notes = '') {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updateData = { status };
    if (notes) {
      updateData.adminNotes = notes;
    }

    let updatedBooking;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Booking.update({
          id: bookingId,
          ...updateData,
        });
        updatedBooking = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }

    if (!updatedBooking || shouldUseMockData()) {
      updatedBooking = updateMockBooking(bookingId, updateData);
    }

    // When marking as no-show, apply reliability penalty (same as cancelBooking with no-show)
    if (status === 'no_show' && booking.modelId) {
      applyCancellationPenalty(booking, 'model', true).catch(console.error);
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId, cancelledBy, reason = '') {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update booking status
    let updatedBooking;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Booking.update({
          id: bookingId,
          status: 'cancelled',
          adminNotes: reason ? `Cancelled by ${cancelledBy}: ${reason}` : `Cancelled by ${cancelledBy}`,
        });
        updatedBooking = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!updatedBooking || shouldUseMockData()) {
      // updateMockBooking is already imported
      updatedBooking = updateMockBooking(bookingId, {
        status: 'cancelled',
        adminNotes: reason ? `Cancelled by ${cancelledBy}: ${reason}` : `Cancelled by ${cancelledBy}`,
      });
    }

    // Handle refunds if payment was made - Stripe refund + DB update
    if (booking.modelPaymentStatus === 'paid' || booking.professionalPaymentStatus === 'paid') {
      const paymentIntentId = booking.stripePaymentIntentId || booking.stripeChargeId;
      if (paymentIntentId && !shouldUseMockData()) {
        try {
          await refundPayment(paymentIntentId, booking.paymentAmount);
        } catch (refundError) {
          console.error('Stripe refund failed:', refundError);
          // Continue to update DB - admin may need to process refund manually
        }
      }

      if (!shouldUseMockData() && client && client.models) {
        try {
          await client.models.Booking.update({
            id: bookingId,
            modelPaymentStatus: booking.modelPaymentStatus === 'paid' ? 'refunded' : booking.modelPaymentStatus,
            professionalPaymentStatus: booking.professionalPaymentStatus === 'paid' ? 'refunded' : booking.professionalPaymentStatus,
            refundAmount: booking.paymentAmount,
            refundDate: new Date(),
          });
        } catch (error) {
          console.error('Error updating refund status:', error);
        }
      } else {
        updateMockBooking(bookingId, {
          modelPaymentStatus: booking.modelPaymentStatus === 'paid' ? 'refunded' : booking.modelPaymentStatus,
          professionalPaymentStatus: booking.professionalPaymentStatus === 'paid' ? 'refunded' : booking.professionalPaymentStatus,
          refundAmount: booking.paymentAmount,
          refundDate: new Date().toISOString(),
        });
      }
    }

    // Update match status
    if (booking.matchId) {
      if (!shouldUseMockData() && client && client.models) {
        try {
          await client.models.Match.update({
            id: booking.matchId,
            status: MatchStatus.EXPIRED,
          });
        } catch (error) {
          console.error('Error updating match status:', error);
        }
      } else {
        updateMockMatch(booking.matchId, { status: MatchStatus.EXPIRED });
      }
    }

    // Reopen request so slot is available for waitlist
    if (booking.requestId) {
      if (!shouldUseMockData() && client && client.models?.ModelRequest) {
        try {
          await client.models.ModelRequest.update({
            id: booking.requestId,
            status: 'matching',
          });
        } catch (err) {
          console.error('Error updating request status:', err);
        }
      } else {
        updateMockRequest(booking.requestId, { status: 'matching' });
      }
    }

    // Apply reliability penalty if model cancelled or no-show
    const isNoShow = reason?.toLowerCase?.().includes('no-show') || cancelledBy === 'model';
    applyCancellationPenalty(booking, cancelledBy, isNoShow).catch(console.error);

    // Send cancellation notifications
    sendCancellationNotifications(booking, cancelledBy, reason).catch(console.error);

    // Promote from waitlist and notify next model that slot is open
    if (booking.requestId) {
      const { promoteFromWaitlist } = await import('./matchService');
      promoteFromWaitlist(booking.requestId).catch(console.error);
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
}

/**
 * Reschedule a booking
 */
export async function rescheduleBooking(bookingId, newDate, newTime, rescheduledBy) {
  try {
    const booking = await getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Validate new date/time
    const newDateTime = new Date(`${newDate}T${newTime}`);
    if (newDateTime < new Date()) {
      throw new Error('Cannot reschedule to a past date/time');
    }

    // Check for conflicts (optional - can be enhanced)
    // TODO: Check if professional/model has other bookings at this time

    // Update booking
    let updatedBooking;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Booking.update({
          id: bookingId,
          appointmentDate: newDate,
          appointmentTime: newTime,
          adminNotes: `Rescheduled by ${rescheduledBy} from ${booking.appointmentDate} ${booking.appointmentTime} to ${newDate} ${newTime}`,
        });
        updatedBooking = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }
    
    // Use mock data
    if (!updatedBooking || shouldUseMockData()) {
      // updateMockBooking is already imported
      updatedBooking = updateMockBooking(bookingId, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        adminNotes: `Rescheduled by ${rescheduledBy} from ${booking.appointmentDate} ${booking.appointmentTime} to ${newDate} ${newTime}`,
      });
    }

    // Send rescheduling notifications
    sendReschedulingNotifications(booking, newDate, newTime, rescheduledBy).catch(console.error);

    return updatedBooking;
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    throw error;
  }
}

/**
 * Complete a booking (mark as completed)
 * @param {string} bookingId
 * @param {Object} feedback - { modelFeedback, professionalFeedback, afterPhotos }
 * @param {Object} options - { attended, onTime, responseTimeHours } - explicit flags for agentic scoring
 */
export async function completeBooking(bookingId, feedback = {}, options = {}) {
  try {
    const updateData = {
      id: bookingId,
      status: BookingStatus.COMPLETED,
    };

    if (feedback.modelFeedback) {
      updateData.modelFeedback = feedback.modelFeedback;
    }
    if (feedback.professionalFeedback) {
      updateData.professionalFeedback = feedback.professionalFeedback;
    }
    if (feedback.afterPhotos) {
      updateData.afterPhotos = feedback.afterPhotos;
    }

    let booking;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const { data } = await client.models.Booking.update(updateData);
        booking = data;
      } catch (error) {
        console.error('Database error, falling back to mock data:', error);
      }
    }

    if (!booking || shouldUseMockData()) {
      booking = updateMockBooking(bookingId, updateData);
    }

    // Update model's agentic scores (reliability, feedback, experience, compatibility)
    updateScoresAfterCompletedBooking(booking, feedback.professionalFeedback || {}, {
      attended: options.attended,
      onTime: options.onTime,
      responseTimeHours: options.responseTimeHours,
    }).catch(console.error);

    // Send completion notifications
    sendCompletionNotifications(booking).catch(console.error);

    return booking;
  } catch (error) {
    console.error('Error completing booking:', error);
    throw error;
  }
}

// ============ NOTIFICATIONS ============

/**
 * Send booking confirmation notifications
 */
async function sendBookingNotifications(booking, model, professional, request) {
  try {
    // Notify model
    await createNotification({
      userId: model.userId,
      userType: 'model',
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking with ${professional?.firstName || 'the professional'} is confirmed for ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.appointmentTime}.`,
      data: {
        bookingId: booking.id,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        professionalName: professional ? `${professional.firstName} ${professional.lastName}` : 'Professional',
        serviceType: booking.serviceType,
      },
    });

    // Notify professional
    await createNotification({
      userId: professional.userId,
      userType: 'professional',
      type: 'booking_confirmed',
      title: 'New Booking Confirmed',
      message: `${model.firstName} ${model.lastName} has confirmed the booking for ${booking.serviceType} on ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.appointmentTime}.`,
      data: {
        bookingId: booking.id,
        modelName: `${model.firstName} ${model.lastName}`,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        serviceType: booking.serviceType,
      },
    });
  } catch (error) {
    console.error('Error sending booking notifications:', error);
  }
}

/**
 * Send cancellation notifications
 */
async function sendCancellationNotifications(booking, cancelledBy, reason) {
  try {
    // Get model and professional
    let model, professional;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const [modelResp, proResp] = await Promise.all([
          client.models.ModelProfile.get({ id: booking.modelId }),
          client.models.Professional.get({ id: booking.professionalId }),
        ]);
        model = modelResp.data;
        professional = proResp.data;
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data or fallback when fetch failed
    if (!model || !professional || shouldUseMockData()) {
      model = await getModelById(booking.modelId) || getMockModel(booking.modelId);
      professional = await getProfessionalById(booking.professionalId) || getMockProfessional(booking.professionalId);
    }

    if (model && cancelledBy !== 'model') {
      await createNotification({
        userId: model.userId,
        userType: 'model',
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking for ${new Date(booking.appointmentDate).toLocaleDateString()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        data: { bookingId: booking.id },
      });
    }

    if (professional && cancelledBy !== 'professional') {
      await createNotification({
        userId: professional.userId,
        userType: 'professional',
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `Your booking with ${model?.firstName || 'Model'} for ${new Date(booking.appointmentDate).toLocaleDateString()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        data: { bookingId: booking.id },
      });
    }
  } catch (error) {
    console.error('Error sending cancellation notifications:', error);
  }
}

/**
 * Send rescheduling notifications
 */
async function sendReschedulingNotifications(booking, newDate, newTime, rescheduledBy) {
  try {
    let model, professional;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const [modelResp, proResp] = await Promise.all([
          client.models.ModelProfile.get({ id: booking.modelId }),
          client.models.Professional.get({ id: booking.professionalId }),
        ]);
        model = modelResp.data;
        professional = proResp.data;
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data or fallback when fetch failed
    if (!model || !professional || shouldUseMockData()) {
      model = await getModelById(booking.modelId) || getMockModel(booking.modelId);
      professional = await getProfessionalById(booking.professionalId) || getMockProfessional(booking.professionalId);
    }

    if (model && rescheduledBy !== 'model') {
      await createNotification({
        userId: model.userId,
        userType: 'model',
        type: 'booking_rescheduled',
        title: '📅 Booking Rescheduled',
        message: `Your booking has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
        data: { bookingId: booking.id, newDate, newTime },
      });
    }

    if (professional && rescheduledBy !== 'professional') {
      await createNotification({
        userId: professional.userId,
        userType: 'professional',
        type: 'booking_rescheduled',
        title: '📅 Booking Rescheduled',
        message: `Your booking with ${model?.firstName || 'Model'} has been rescheduled to ${new Date(newDate).toLocaleDateString()} at ${newTime}.`,
        data: { bookingId: booking.id, newDate, newTime },
      });
    }
  } catch (error) {
    console.error('Error sending rescheduling notifications:', error);
  }
}

/**
 * Send completion notifications
 */
async function sendCompletionNotifications(booking) {
  try {
    let model, professional;
    if (!shouldUseMockData() && client && client.models) {
      try {
        const [modelResp, proResp] = await Promise.all([
          client.models.ModelProfile.get({ id: booking.modelId }),
          client.models.Professional.get({ id: booking.professionalId }),
        ]);
        model = modelResp.data;
        professional = proResp.data;
      } catch (error) {
        console.error('Database error, using mock data:', error);
      }
    }
    
    // Use mock data or fallback when fetch failed
    if (!model || !professional || shouldUseMockData()) {
      model = await getModelById(booking.modelId) || getMockModel(booking.modelId);
      professional = await getProfessionalById(booking.professionalId) || getMockProfessional(booking.professionalId);
    }

    if (model) {
      await createNotification({
        userId: model.userId,
        userType: 'model',
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking on ${new Date(booking.appointmentDate).toLocaleDateString()} has been marked as completed. Don't forget to leave feedback!`,
        data: { bookingId: booking.id },
      });
    }

    if (professional) {
      await createNotification({
        userId: professional.userId,
        userType: 'professional',
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking with ${model?.firstName || 'Model'} has been marked as completed.`,
        data: { bookingId: booking.id },
      });
    }
  } catch (error) {
    console.error('Error sending completion notifications:', error);
  }
}

// ============ VALIDATION ============

/**
 * Check if a time slot is available
 */
export async function checkTimeSlotAvailability(professionalId, date, time, duration = 60) {
  try {
    // Get all bookings for this professional on this date
    const { data: bookings } = await client.models.Booking.list({
      filter: {
        professionalId: { eq: professionalId },
        appointmentDate: { eq: date },
        status: { ne: 'cancelled' },
      },
      limit: 100,
    });

    if (!bookings || bookings.length === 0) {
      return { available: true };
    }

    // Parse requested time
    const [requestedHour, requestedMinute] = time.split(':').map(Number);
    const requestedStart = requestedHour * 60 + requestedMinute;
    const requestedEnd = requestedStart + duration;

    // Check for conflicts
    for (const booking of bookings) {
      const [bookingHour, bookingMinute] = booking.appointmentTime.split(':').map(Number);
      const bookingStart = bookingHour * 60 + bookingMinute;
      const bookingDuration = booking.duration || 60;
      const bookingEnd = bookingStart + bookingDuration;

      // Check if times overlap
      if (
        (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
        (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
        (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
      ) {
        return {
          available: false,
          conflict: {
            bookingId: booking.id,
            time: booking.appointmentTime,
            duration: bookingDuration,
          },
        };
      }
    }

    return { available: true };
  } catch (error) {
    console.error('Error checking time slot availability:', error);
    return { available: false, error: error.message };
  }
}

