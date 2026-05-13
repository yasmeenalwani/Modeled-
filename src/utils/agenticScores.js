/**
 * Agentic Score Updates
 *
 * Updates ModelProfile agentic scores when bookings complete, get cancelled, or receive feedback.
 */

import { generateClient } from 'aws-amplify/data';
import { updateScoresAfterBooking } from '../matching/matchingEngine';
import { calculateEngagementScore } from './agenticScoreCalculator';
import { shouldUseMockData } from './mockDataService';

let client = null;

function getClient() {
  if (!client) {
    client = generateClient();
  }
  return client;
}

/**
 * Update model's agentic scores after a booking is completed.
 * @param {Object} booking - Completed booking with modelId, professionalId, serviceType, etc.
 * @param {Object} feedback - professionalFeedback from booking (pro's rating of model)
 * @param {Object} options - { attended, onTime } - explicit flags (default true for backward compat)
 */
export async function updateScoresAfterCompletedBooking(booking, feedback = {}, options = {}) {
  if (shouldUseMockData()) return; // Skip in demo mode
  try {
    const c = getClient();
    const { data: modelProfile } = await c.models.ModelProfile.get({ id: booking.modelId });
    if (!modelProfile) return;

    // Count completed bookings for this model
    const { data: completedBookings } = await c.models.Booking.list({
      filter: {
        modelId: { eq: booking.modelId },
        status: { eq: 'completed' },
      },
    });
    const completed = completedBookings || [];
    const totalBookings = completed.length;

    // Compute servicesCompleted: unique service types
    const servicesCompleted = [...(modelProfile.servicesCompleted || [])];
    const serviceType = booking.serviceType || 'haircut';
    if (serviceType && !servicesCompleted.includes(serviceType)) {
      servicesCompleted.push(serviceType);
    }

    // Compute repeatBookings: total - unique professionals
    const professionalIds = completed.map((b) => b.professionalId).filter(Boolean);
    const repeatBookings = Math.max(0, professionalIds.length - new Set(professionalIds).size);

    // Rebooking: same pro has booked this model before (completed includes current booking)
    const bookingsWithThisPro = completed.filter((b) => b.professionalId === booking.professionalId);
    const isRebooking = bookingsWithThisPro.length >= 2;

    const model = {
      id: modelProfile.id,
      agenticScores: modelProfile.agenticScores || {
        reliability: modelProfile.reliabilityScore ?? 85,
        feedback: modelProfile.feedbackScore ?? 80,
        experience: modelProfile.experienceScore ?? 75,
        engagement: modelProfile.engagementScore ?? 80,
        compatibility: modelProfile.compatibilityScore ?? 82,
      },
      totalBookings,
      servicesCompleted,
      monthsOnPlatform: modelProfile.monthsOnPlatform ?? 1,
      repeatBookings,
      serviceHistory: modelProfile.serviceHistory || {},
    };

    const bookingForEngine = {
      modelShowedUp: options.attended !== false,
      onTime: options.onTime !== false,
      responseTimeHours: options.responseTimeHours ?? 1,
      serviceId: serviceType,
      wasSuccessful: true,
      isRebooking,
    };

    const feedbackForEngine = feedback.overallRating || feedback.hairAccuracy || feedback.punctuality
      ? {
          overallRating: feedback.overallRating ?? feedback.modelRating ?? 4,
          hairAccuracy: feedback.hairAccuracy ?? feedback.cooperation ?? feedback.overallRating ?? feedback.modelRating ?? 4,
          punctuality: feedback.punctuality ?? feedback.communication ?? feedback.onTime ?? feedback.overallRating ?? feedback.modelRating ?? 4,
          professionalism: feedback.professionalism ?? feedback.overallExperience ?? feedback.overallRating ?? 4,
          wouldBookAgain: feedback.wouldBookAgain ?? true,
          // Legacy fallbacks
          cooperation: feedback.cooperation ?? feedback.hairAccuracy ?? feedback.overallRating,
          communication: feedback.communication ?? feedback.punctuality ?? feedback.overallRating,
          photoQuality: feedback.photoQuality ?? feedback.overallRating,
        }
      : null;

    const updates = updateScoresAfterBooking(model, bookingForEngine, feedbackForEngine);

    const updateData = {};
    if (updates.reliability != null) updateData.reliabilityScore = updates.reliability;
    if (updates.feedback != null) updateData.feedbackScore = updates.feedback;
    if (updates.experience != null) updateData.experienceScore = updates.experience;
    if (updates.compatibility != null) updateData.compatibilityScore = updates.compatibility;
    if (updates.engagement != null) updateData.engagementScore = updates.engagement;
    if (updates.serviceHistory != null) updateData.serviceHistory = updates.serviceHistory;
    updateData.servicesCompleted = servicesCompleted;
    updateData.repeatBookings = repeatBookings;
    updateData.rebookingCount = repeatBookings; // Explicit signal for compatibility
    updateData.lastActiveDate = new Date().toISOString();

    if (Object.keys(updateData).length > 0) {
      updateData.agenticScores = {
        ...(modelProfile.agenticScores || {}),
        ...(updates.reliability != null && { reliability: updates.reliability }),
        ...(updates.feedback != null && { feedback: updates.feedback }),
        ...(updates.experience != null && { experience: updates.experience }),
        ...(updates.compatibility != null && { compatibility: updates.compatibility }),
      };

      await c.models.ModelProfile.update({
        id: modelProfile.id,
        ...updateData,
      });
    }
  } catch (error) {
    console.error('Error updating agentic scores:', error);
  }
}

/**
 * Apply reliability penalty when a booking is cancelled (especially no-show).
 * @param {Object} booking - Cancelled booking
 * @param {string} cancelledBy - 'model' | 'professional' | 'admin'
 * @param {boolean} isNoShow - True if model no-show
 */
export async function applyCancellationPenalty(booking, cancelledBy, isNoShow = false) {
  if (shouldUseMockData()) return; // Skip in demo mode
  try {
    const c = getClient();
    const { data: modelProfile } = await c.models.ModelProfile.get({ id: booking.modelId });
    if (!modelProfile) return;

    const current = modelProfile.reliabilityScore ?? modelProfile.agenticScores?.reliability ?? 85;
    const penalty = isNoShow ? 20 : cancelledBy === 'model' ? 10 : 5;
    const newScore = Math.max(0, Math.min(100, current - penalty));

    await c.models.ModelProfile.update({
      id: modelProfile.id,
      reliabilityScore: newScore,
      agenticScores: {
        ...(modelProfile.agenticScores || {}),
        reliability: newScore,
      },
    });
  } catch (error) {
    console.error('Error applying cancellation penalty:', error);
  }
}

/**
 * Update lastActiveDate when model is active (match response, profile edit, booking).
 * Used for engagement score and decay calculations.
 */
export async function updateModelLastActive(modelId) {
  if (shouldUseMockData() || !modelId) return;
  try {
    const c = getClient();
    await c.models.ModelProfile.update({
      id: modelId,
      lastActiveDate: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Error updating lastActiveDate:', error?.message);
  }
}

/**
 * Record when a professional declines a model (admin reject on behalf of pro).
 * Increments professionalDeclines and applies a small compatibility penalty.
 * Call when admin/pro explicitly rejects a match for a model.
 */
export async function recordProfessionalDecline(modelId) {
  if (shouldUseMockData() || !modelId) return;
  try {
    const c = getClient();
    const { data: profile } = await c.models.ModelProfile.get({ id: modelId });
    if (!profile) return;

    const currentDeclines = profile.professionalDeclines ?? 0;
    const newDeclines = currentDeclines + 1;

    // Compatibility penalty: -4 per professional decline (spec 3C)
    const compat = profile.compatibilityScore ?? profile.agenticScores?.compatibility ?? 82;
    const newCompat = Math.max(40, Math.round(compat - 4));

    await c.models.ModelProfile.update({
      id: modelId,
      professionalDeclines: newDeclines,
      compatibilityScore: newCompat,
      agenticScores: {
        ...(profile.agenticScores || {}),
        compatibility: newCompat,
      },
    });
  } catch (err) {
    console.warn('Error recording professional decline:', err?.message);
  }
}

/**
 * Recalculate and persist engagement score (profile completeness, photos, response rate, last active).
 * Call after profile update or when engagement factors change.
 */
export async function updateEngagementScore(modelId) {
  if (shouldUseMockData() || !modelId) return;
  try {
    const c = getClient();
    const { data: profile } = await c.models.ModelProfile.get({ id: modelId });
    if (!profile) return;

    const { data: matches } = await c.models.Match.list({
      filter: { modelId: { eq: modelId } },
    });

    const engagement = calculateEngagementScore(profile, matches || []);

    await c.models.ModelProfile.update({
      id: modelId,
      engagementScore: engagement,
      agenticScores: {
        ...(profile.agenticScores || {}),
        engagement,
      },
    });
  } catch (error) {
    console.warn('Error updating engagement score:', error?.message);
  }
}
