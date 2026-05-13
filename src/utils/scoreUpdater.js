/**
 * Real-Time Score Update Utilities
 * 
 * Updates agentic scores based on events (booking completion, feedback, etc.)
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Update scores when a booking is completed
 * @param {string} bookingId - The Booking ID
 */
export async function updateScoresOnBookingComplete(bookingId) {
  try {
    const { data: booking, errors } = await client.models.Booking.get({
      id: bookingId,
    });

    if (errors || !booking || booking.status !== 'completed') {
      return;
    }

    const modelId = booking.modelId;
    const professionalId = booking.professionalId;

    // Update reliability score (+10 for completing booking)
    await updateModelScore(modelId, 'reliability', 10);

    // Update experience score (based on service type)
    await updateModelScore(modelId, 'experience', 5);

    // Update compatibility (if feedback is positive)
    if (booking.modelRating && booking.modelRating >= 4) {
      await updateModelScore(modelId, 'compatibility', 5);
    }

    console.log(`Updated scores for model ${modelId} after booking completion`);
  } catch (error) {
    console.error('Error updating scores on booking complete:', error);
  }
}

/**
 * Update scores when feedback is submitted
 * @param {string} feedbackId - The Feedback ID (or bookingId with feedback)
 */
export async function updateScoresOnFeedback(feedbackId, rating, comments) {
  try {
    // Get booking from feedback
    // (Assuming feedback is linked to booking)
    const { data: booking, errors } = await client.models.Booking.list({
      filter: { id: { eq: feedbackId } },
    });

    if (errors || !booking || booking.length === 0) {
      return;
    }

    const modelId = booking[0].modelId;

    // Update feedback score based on rating
    if (rating >= 5) {
      await updateModelScore(modelId, 'feedback', 10);
    } else if (rating >= 4) {
      await updateModelScore(modelId, 'feedback', 5);
    } else if (rating <= 2) {
      await updateModelScore(modelId, 'feedback', -10);
    }

    console.log(`Updated feedback score for model ${modelId} to ${rating}`);
  } catch (error) {
    console.error('Error updating scores on feedback:', error);
  }
}

/**
 * Update scores when a cancellation happens
 * @param {string} bookingId - The Booking ID
 */
export async function updateScoresOnCancellation(bookingId) {
  try {
    const { data: booking, errors } = await client.models.Booking.get({
      id: bookingId,
    });

    if (errors || !booking) {
      return;
    }

    const modelId = booking.modelId;

    // Penalize reliability (-20 for cancellation)
    await updateModelScore(modelId, 'reliability', -20);

    console.log(`Penalized reliability score for model ${modelId} due to cancellation`);
  } catch (error) {
    console.error('Error updating scores on cancellation:', error);
  }
}

/**
 * Update a specific score for a model
 * @param {string} modelId - The Model ID
 * @param {string} scoreType - 'reliability', 'feedback', 'experience', 'engagement', 'compatibility'
 * @param {number} delta - Change to apply (positive or negative)
 */
async function updateModelScore(modelId, scoreType, delta) {
  try {
    // Get current model profile
    const { data: model, errors } = await client.models.ModelProfile.get({
      id: modelId,
    });

    if (errors || !model) {
      return;
    }

    // Get current scores (would be stored in agenticScores field or separate table)
    // For now, we'll update a hypothetical agenticScores field
    const currentScores = model.agenticScores || {
      reliability: 80,
      feedback: 80,
      experience: 75,
      engagement: 80,
      compatibility: 82,
    };

    // Update the specific score
    const newScore = Math.max(0, Math.min(100, (currentScores[scoreType] || 80) + delta));

    // Save updated scores
    await client.models.ModelProfile.update({
      id: modelId,
      agenticScores: {
        ...currentScores,
        [scoreType]: newScore,
      },
      lastScoreUpdate: new Date().toISOString(),
    });

    console.log(`Updated ${scoreType} score for model ${modelId}: ${currentScores[scoreType]} → ${newScore}`);
  } catch (error) {
    console.error(`Error updating ${scoreType} score for model ${modelId}:`, error);
  }
}

/**
 * Update engagement score based on activity
 * @param {string} modelId - The Model ID
 */
export async function updateEngagementScore(modelId) {
  try {
    // Small boost for being active
    await updateModelScore(modelId, 'engagement', 2);

    // Update lastActive timestamp
    await client.models.ModelProfile.update({
      id: modelId,
      lastActive: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating engagement score for model ${modelId}:`, error);
  }
}

