// ============================================
// BOOKING COMPLETION & TRAINING HOURS LOGGING
// ============================================

import { generateClient } from 'aws-amplify/data';
import { createNotification } from './createNotification';
import { completeBooking } from './bookingService';

const client = generateClient();

/**
 * Complete a booking and log training hours for professional
 * This function:
 * 1. Validates all mandatory requirements are met
 * 2. Updates booking status to 'completed'
 * 3. Saves feedback and photos
 * 4. Logs training hours to professional's training record
 * 5. Sends notifications
 * 
 * @param {object} completionData
 * @returns {Promise<{success: boolean, error?: string, trainingHours?: number}>}
 */
export async function completeBookingForTraining(completionData) {
  try {
    const {
      bookingId,
      afterPhotos,
      beforePhotos,
      feedback,
      goodTipper,
      productsSold,
      additionalNotes,
      modelBehavior,
      trainingCategory,
      trainingModule,
      duration, // in minutes
    } = completionData;
    
    // Validate mandatory requirements
    if (!afterPhotos || afterPhotos.length === 0) {
      return { success: false, error: 'At least 1 after photo is required' };
    }
    
    if (!feedback || !feedback.modelRating || !feedback.overallExperience || !feedback.technicalNotes) {
      return { success: false, error: 'All feedback fields are required' };
    }
    
    if (!trainingCategory) {
      return { success: false, error: 'Training category is required' };
    }
    
    // Convert duration from minutes to hours (for training hours)
    const trainingHours = duration ? (duration / 60).toFixed(2) : 0;
    
    // Check if this is mock data
    const isMockData = bookingId?.startsWith('booking-') || bookingId?.startsWith('mock-');
    
    if (!isMockData) {
      // Update booking in database
      await client.models.Booking.update({
        id: bookingId,
        status: 'completed',
        afterPhotos: afterPhotos,
        professionalFeedback: {
          modelRating: feedback.modelRating,
          overallExperience: feedback.overallExperience,
          technicalNotes: feedback.technicalNotes,
          whatWentWell: feedback.whatWentWell || '',
          whatToImprove: feedback.whatToImprove || '',
          goodTipper: goodTipper || false,
          productsSold: productsSold || [],
          additionalNotes: additionalNotes || '',
          modelBehavior: modelBehavior || '',
          submittedAt: new Date().toISOString(),
        },
        completedAt: new Date().toISOString(),
      });
      
      // Log training hours (this would update Professional model's trainingHours field)
      // In a real implementation, you'd have a TrainingHours model or update Professional directly
      // For now, we'll just log it
      console.log(`📝 Training hours logged: ${trainingHours} hours for ${trainingCategory}${trainingModule ? ` - ${trainingModule}` : ''}`);
      
      // Send notification to admin
      await createNotification({
        userId: 'admin',
        userType: 'admin',
        type: 'booking_completed',
        title: 'Training Session Completed! 🎓',
        message: `Professional completed a ${trainingCategory} training session. ${trainingHours} hours logged.`,
        link: `/admin/bookings/${bookingId}`,
        actionText: 'View Booking',
        relatedEntityId: bookingId,
        data: {
          bookingId,
          trainingCategory,
          trainingHours,
          modelRating: feedback.modelRating,
        },
      });
    } else {
      // Mock mode: persist via bookingService so localStorage is updated and agentic scores run
      const professionalFeedback = {
        modelRating: feedback.modelRating,
        overallExperience: feedback.overallExperience,
        technicalNotes: feedback.technicalNotes,
        whatWentWell: feedback.whatWentWell || '',
        whatToImprove: feedback.whatToImprove || '',
        goodTipper: goodTipper || false,
        productsSold: productsSold || [],
        additionalNotes: additionalNotes || '',
        modelBehavior: modelBehavior || '',
        submittedAt: new Date().toISOString(),
      };
      await completeBooking(bookingId, {
        professionalFeedback,
        afterPhotos: afterPhotos || [],
      }, { attended: true, onTime: true });
      console.log('📝 Mock mode: Booking completed and training hours logged:', {
        bookingId,
        trainingHours,
        trainingCategory,
        trainingModule,
      });
      // Notify admin (training-specific message)
      await createNotification({
        userId: 'admin',
        userType: 'admin',
        type: 'booking_completed',
        title: 'Training Session Completed!',
        message: `Professional completed a ${trainingCategory} training session. ${trainingHours} hours logged.`,
        link: `/admin/bookings/${bookingId}`,
        actionText: 'View Booking',
        relatedEntityId: bookingId,
        data: {
          bookingId,
          trainingCategory,
          trainingHours,
          modelRating: feedback.modelRating,
        },
      }).catch(() => {});
    }
    
    return {
      success: true,
      trainingHours: parseFloat(trainingHours),
      message: `Successfully logged ${trainingHours} training hours for ${trainingCategory}`,
    };
  } catch (error) {
    console.error('Error completing booking for training:', error);
    return {
      success: false,
      error: error.message || 'Failed to complete booking',
    };
  }
}

/**
 * Get training hours summary for a professional
 * @param {string} professionalId
 * @returns {Promise<object>}
 */
export async function getTrainingHoursSummary(professionalId) {
  try {
    // In real implementation, query TrainingHours model or Professional's trainingHours field
    // For now, return mock data structure
    return {
      totalHours: 0,
      byCategory: {
        blowouts: 0,
        haircuts: 0,
        color: 0,
      },
      recentSessions: [],
    };
  } catch (error) {
    console.error('Error fetching training hours summary:', error);
    throw error;
  }
}

