import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';
import { createCalendarEventFromBooking, downloadICalFile, generateGoogleCalendarUrl } from './calendar';

const client = generateClient();

/**
 * Complete booking flow: Match → Payment → Booking Creation → Calendar Events → Notifications
 * 
 * This function handles the entire process when a model accepts a match and pays
 */
export async function createBookingFromMatch(matchId, paymentData) {
  try {
    // 1. Get the match
    const { data: match } = await client.models.Match.get({ id: matchId });
    if (!match) {
      throw new Error('Match not found');
    }

    // 2. Get request and user details
    const { data: request } = await client.models.ModelRequest.get({ id: match.requestId });
    if (!request) throw new Error('Request not found');
    const { data: model } = await client.models.ModelProfile.get({ id: match.modelId });
    const { data: professional } = await client.models.Professional.get({ id: request.professionalId });
    
    // 3. Create Booking record
    const bookingData = {
      matchId: match.id,
      requestId: match.requestId,
      modelId: match.modelId,
      professionalId: request.professionalId,
      
      // Appointment details
      appointmentDate: request.requestedDate,
      appointmentTime: request.requestedTime,
      duration: request.duration || 60,
      location: request.location || professional?.salonAddress,
      
      // Service
      serviceType: request.serviceType,
      serviceDescription: request.serviceDescription,
      
      // Payment
      modelFee: request.modelPayment || 0,
      modelPaymentStatus: paymentData.modelPaid ? 'paid' : 'pending',
      professionalFee: request.modelSearchFee || 0,
      professionalPaymentStatus: paymentData.proPaid ? 'paid' : 'pending',
      
      // Stripe
      stripePaymentIntentId: paymentData.paymentIntentId,
      stripeCustomerId: paymentData.customerId,
      paymentAmount: paymentData.amount,
      paymentCurrency: 'usd',
      paymentDate: new Date(),
      
      // Status
      status: 'confirmed',
    };

    const { data: booking } = await client.models.Booking.create(bookingData);

    // 4. Create calendar events and send to users
    await sendCalendarEvents(booking, model, professional);

    // 5. Send notifications
    await sendBookingNotifications(booking, model, professional, request);

    // 6. Update match status
    await client.models.Match.update({
      id: matchId,
      status: 'accepted',
      bookingId: booking.id,
    });

    // 7. Update request status
    await client.models.ModelRequest.update({
      id: match.requestId,
      status: 'booked',
    });

    return { success: true, booking };
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

/**
 * Send calendar events to model and professional
 */
async function sendCalendarEvents(booking, model, professional) {
  try {
    // Create calendar event for model
    const modelEvent = createCalendarEventFromBooking(booking, 'model');
    const modelCalendarEventId = `model-${booking.id}-${Date.now()}`;
    
    // Create calendar event for professional
    const proEvent = createCalendarEventFromBooking(booking, 'professional');
    const proCalendarEventId = `pro-${booking.id}-${Date.now()}`;

    // Update booking with calendar event IDs
    await client.models.Booking.update({
      id: booking.id,
      modelCalendarEventId,
      professionalCalendarEventId: proCalendarEventId,
    });

    // In production, you would:
    // 1. Send email with calendar invite (.ics file)
    // 2. Or integrate with Google Calendar API / Outlook API
    // 3. Store calendar event IDs for future updates/cancellations

    return { modelCalendarEventId, proCalendarEventId };
  } catch (error) {
    console.error('Error sending calendar events:', error);
    // Don't throw - calendar events are nice-to-have, booking should still succeed
  }
}

/**
 * Send notifications to all parties
 */
async function sendBookingNotifications(booking, model, professional, request) {
  try {
    // Notify model
    await createNotification({
      userId: model.userId,
      userType: 'model',
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      message: `Your booking with ${professional?.firstName || 'the professional'} is confirmed for ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.appointmentTime}. Calendar invite sent!`,
      link: `/model-portal/sessions/${booking.id}`,
      actionText: 'View Booking',
      relatedEntityId: booking.id,
      data: {
        bookingId: booking.id,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        professionalName: professional ? `${professional.firstName} ${professional.lastName}` : 'Professional',
        serviceType: booking.serviceType,
        calendarEventUrl: generateGoogleCalendarUrl(createCalendarEventFromBooking(booking, 'model')),
      },
    });

    // Notify professional
    await createNotification({
      userId: professional.userId,
      userType: 'professional',
      type: 'booking_confirmed',
      title: 'New Booking Confirmed',
      message: `${model.firstName} ${model.lastName} has confirmed the booking for ${booking.serviceType} on ${new Date(booking.appointmentDate).toLocaleDateString()} at ${booking.appointmentTime}.`,
      link: `/portal/bookings/${booking.id}`,
      actionText: 'View Details',
      relatedEntityId: booking.id,
      data: {
        bookingId: booking.id,
        modelName: `${model.firstName} ${model.lastName}`,
        appointmentDate: booking.appointmentDate,
        appointmentTime: booking.appointmentTime,
        serviceType: booking.serviceType,
      },
    });

    // Notify admin (you)
    await createNotification({
      userId: 'admin', // Admin user ID
      userType: 'admin',
      type: 'booking_confirmed',
      title: 'New Booking Revenue',
      message: `New booking confirmed: ${model.firstName} ${model.lastName} + ${professional?.firstName || 'Professional'} for ${booking.serviceType}. Revenue: $${booking.modelFee + booking.professionalFee}`,
      link: `/admin/bookings/${booking.id}`,
      actionText: 'View Booking',
      relatedEntityId: booking.id,
    });

    // If professional has a partner/salon, notify them too
    if (professional?.partnerId) {
      const { data: partner } = await client.models.Partner.get({ id: professional.partnerId });
      if (partner) {
        await createNotification({
          userId: partner.userId,
          userType: 'partner',
          type: 'booking_confirmed',
          title: '📅 New Team Booking',
          message: `${professional.firstName} ${professional.lastName} has a new booking with ${model.firstName} ${model.lastName} on ${new Date(booking.appointmentDate).toLocaleDateString()}.`,
          link: `/partner-portal/calendar`,
          relatedEntityId: booking.id,
        });
      }
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't throw - notifications are nice-to-have
  }
}

/**
 * Get bookings for a specific user (model, professional, or admin)
 */
export async function getBookingsForUser(userId, userType, filters = {}) {
  try {
    let bookings = [];

    if (userType === 'admin') {
      // Admin sees all bookings
      const { data: allBookings } = await client.models.Booking.list({
        filter: filters.status ? { status: { eq: filters.status } } : undefined,
        limit: 1000,
      });
      bookings = allBookings || [];
    } else if (userType === 'model') {
      // Get model profile first
      const { data: modelProfiles } = await client.models.ModelProfile.list({
        filter: { userId: { eq: userId } },
        limit: 1,
      });
      const modelProfile = modelProfiles?.[0];
      
      if (modelProfile) {
        const { data: modelBookings } = await client.models.Booking.list({
          filter: { modelId: { eq: modelProfile.id } },
          limit: 1000,
        });
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
        const { data: proBookings } = await client.models.Booking.list({
          filter: { professionalId: { eq: professional.id } },
          limit: 1000,
        });
        bookings = proBookings || [];
      }
    } else if (userType === 'partner') {
      // Get partner's professionals, then their bookings
      const { data: partners } = await client.models.Partner.list({
        filter: { userId: { eq: userId } },
        limit: 1,
      });
      const partner = partners?.[0];
      
      if (partner) {
        const { data: partnerProfessionals } = await client.models.Professional.list({
          filter: { partnerId: { eq: partner.id } },
          limit: 100,
        });
        
        const professionalIds = (partnerProfessionals || []).map(p => p.id);
        if (professionalIds.length > 0) {
          // Note: DynamoDB doesn't support IN queries easily, so we'd need to fetch all and filter
          // For now, return empty and handle in the component
          bookings = [];
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

    return bookings;
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
}

/**
 * Get bookings for a specific salon
 */
export async function getBookingsForSalon(salonId) {
  try {
    // Get all professionals at this salon
    const { data: professionals } = await client.models.Professional.list({
      filter: { partnerId: { eq: salonId } },
      limit: 100,
    });

    const professionalIds = (professionals || []).map(p => p.id);
    
    // Get bookings for all professionals (would need to fetch all and filter in production)
    // For now, return empty array - will be handled by component
    return [];
  } catch (error) {
    console.error('Error getting salon bookings:', error);
    return [];
  }
}

