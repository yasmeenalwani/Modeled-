/**
 * Agentic Score Calculator
 * 
 * Dynamically calculates agentic learning scores (reliability, feedback, experience, 
 * engagement, compatibility) based on actual booking/activity data from the database.
 * 
 * These scores evolve over time based on model behavior and are used in the matching algorithm.
 */

import { AGENTIC_SCORES } from '../matching/matchingEngine';

/**
 * Calculate reliability score (0-100) based on booking behavior
 * 
 * Factors:
 * - Show Up Rate (35%): Attends scheduled appointments
 * - On Time Rate (25%): Arrives within grace period
 * - Cancellation Penalty (20%): Last-minute cancellations (NEGATIVE)
 * - Response Time (10%): How fast they respond to requests
 * - Instruction Following (10%): Follows pre-appointment prep
 * 
 * Special Rules:
 * - Requires 3+ bookings before score is reliable
 * - Decays 5% per month of inactivity
 * - No-shows cause -20 point penalty
 */
export function calculateReliabilityScore(modelProfile, bookings, matches) {
  if (!bookings || bookings.length === 0) {
    return 50; // Default for new models
  }

  const completedBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'confirmed'
  );
  
  if (completedBookings.length < 3) {
    return 50; // Not enough data
  }

  // Show Up Rate (35%)
  const totalBookings = bookings.length;
  const noShows = bookings.filter(b => b.status === 'no_show').length;
  const showUpRate = ((totalBookings - noShows) / totalBookings) * 100;
  const showUpScore = showUpRate * 0.35;

  // On Time Rate (25%) - simplified: assume on time if completed
  // In real implementation, would track arrival time
  const onTimeScore = showUpRate * 0.25;

  // Cancellation Penalty (20%) - negative impact
  const cancelledBookings = bookings.filter(b => 
    b.status === 'cancelled'
  ).length;
  const cancellationPenalty = Math.min((cancelledBookings / totalBookings) * 100, 50) * 0.20;
  const cancellationScore = -cancellationPenalty;

  // Response Time (10%) - simplified
  // In real implementation, would track time from match sent to response
  const responseTimeScore = 80 * 0.10; // Default assumption

  // Instruction Following (10%) - simplified
  // In real implementation, would track prep completion
  const instructionScore = 85 * 0.10; // Default assumption

  let score = showUpScore + onTimeScore + cancellationScore + responseTimeScore + instructionScore;

  // No-show penalty (-20 points per no-show)
  score -= noShows * 20;
  score = Math.max(0, Math.min(100, score));

  // Decay: 5% per month of inactivity
  if (bookings.length > 0) {
    const lastBooking = bookings.sort((a, b) => 
      new Date(b.appointmentDate) - new Date(a.appointmentDate)
    )[0];
    const monthsSinceLastBooking = (Date.now() - new Date(lastBooking.appointmentDate)) / (1000 * 60 * 60 * 24 * 30);
    if (monthsSinceLastBooking > 1) {
      score *= Math.max(0, 1 - (monthsSinceLastBooking - 1) * 0.05);
    }
  }

  return Math.round(score);
}

/**
 * Calculate feedback score (0-100) based on professional ratings
 * Aligned with matchingEngine.calculateNewFeedback (spec 3A - hair model reality)
 *
 * Factors: overall 35%, hairAccuracy 30%, professionalism 20%, punctuality 15%
 * Legacy fallbacks: cooperation→hairAccuracy, communication→punctuality
 */
export function calculateFeedbackScore(modelProfile, bookings) {
  if (!bookings || bookings.length === 0) {
    return 70; // Default for new models
  }

  const bookingsWithFeedback = bookings.filter(b =>
    b.professionalFeedback && Object.keys(b.professionalFeedback).length > 0
  );

  if (bookingsWithFeedback.length === 0) {
    return 70; // Default if no feedback yet
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;

  bookingsWithFeedback.forEach((booking, index) => {
    const feedback = booking.professionalFeedback;
    const isRecent = index < bookingsWithFeedback.length / 2;
    const weight = isRecent ? 1.7 : 1.0;

    const overall = feedback.rating ?? feedback.overallRating ?? 3.5;
    const hairAccuracy = feedback.hairAccuracy ?? feedback.cooperation ?? overall;
    const professionalism = feedback.professionalism ?? overall;
    const punctualityRaw = feedback.punctuality ?? feedback.communication ?? feedback.onTime ?? overall;
    const punctuality = typeof punctualityRaw === 'boolean' ? (punctualityRaw ? 5 : 2) : punctualityRaw;

    const score = (
      (overall / 5) * 100 * 0.35 +
      (hairAccuracy / 5) * 100 * 0.30 +
      (professionalism / 5) * 100 * 0.20 +
      (punctuality / 5) * 100 * 0.15
    );

    totalWeightedScore += score * weight;
    totalWeight += weight;
  });

  const avgScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 70;
  return Math.round(Math.max(0, Math.min(100, avgScore)));
}

/**
 * Calculate experience score (0-100) - Uses same tiers as matchingEngine.calculateNewExperience
 */
export function calculateExperienceScore(modelProfile, bookings) {
  // Prefer profile fields when available (set by live engine)
  const servicesCompleted = modelProfile?.servicesCompleted;
  const repeatBookings = modelProfile?.repeatBookings ?? 0;

  const completed = bookings?.filter((b) => b.status === 'completed' || b.status === 'confirmed').length ?? 0;
  const totalBookings = completed || (modelProfile?.totalBookings ?? 0);

  // Base score from tiers (matches AGENTIC_SCORES.experience.factors.totalBookings.tiers)
  const tiers = [
    { min: 0, max: 2, score: 20 },
    { min: 3, max: 5, score: 40 },
    { min: 6, max: 10, score: 60 },
    { min: 11, max: 20, score: 80 },
    { min: 21, max: Infinity, score: 100 },
  ];
  let bookingScore = 20;
  for (const t of tiers) {
    if (totalBookings >= t.min && totalBookings <= t.max) {
      bookingScore = t.score;
      break;
    }
  }

  const serviceVariety = servicesCompleted?.length ?? new Set(bookings?.map((b) => b.serviceType).filter(Boolean) ?? []).size ?? 1;
  const monthsOnPlatform = modelProfile?.createdAt
    ? (Date.now() - new Date(modelProfile.createdAt)) / (1000 * 60 * 60 * 24 * 30)
    : 1;

  const varietyScore = Math.min(100, serviceVariety * 20);
  const tenureScore = Math.min(100, monthsOnPlatform * 10);
  const repeatScore = Math.min(100, repeatBookings * 15);

  return Math.round(
    Math.max(
      0,
      Math.min(
        100,
        bookingScore * 0.4 + varietyScore * 0.25 + tenureScore * 0.2 + repeatScore * 0.15
      )
    )
  );
}

/**
 * Calculate engagement score (0-100) based on profile quality and activity
 * 
 * Factors:
 * - Profile Completeness (25%)
 * - Photo Count (20%)
 * - Photo Recency (15%)
 * - Response Rate (20%)
 * - Last Active (10%)
 * - Quiz Completion (10%) - future feature
 */
export function calculateEngagementScore(modelProfile, matches) {
  // Profile Completeness (25%)
  let completenessScore = 0;
  const fields = ['firstName', 'lastName', 'email', 'phone', 'locationZip', 
    'hairLengthSimple', 'hairColorSimple', 'hairTextureSimple', 'somethingFun', 
    'whatYouCareAbout', 'favoriteService'];
  const filledFields = fields.filter(f => modelProfile[f] != null && modelProfile[f] !== '').length;
  completenessScore = (filledFields / fields.length) * 100 * 0.25;

  // Photo Count (20%)
  const photoCount = (modelProfile.photoUrls || []).length;
  const photoCountScore = Math.min((photoCount / 6) * 100, 100) * 0.20;

  // Photo Recency (15%) - simplified
  const photoRecencyScore = modelProfile.photoUrls && modelProfile.photoUrls.length > 0 ? 100 * 0.15 : 0;

  // Response Rate (20%) - from matches
  let responseRateScore = 50 * 0.20; // Default
  if (matches && matches.length > 0) {
    const respondedMatches = matches.filter(m => 
      m.status === 'accepted' || m.status === 'declined'
    ).length;
    const responseRate = (respondedMatches / matches.length) * 100;
    responseRateScore = responseRate * 0.20;
  }

  // Last Active (10%) - lastActiveDate or legacy lastActive
  const lastActive = modelProfile.lastActiveDate || modelProfile.lastActive;
  const lastActiveScore = lastActive ? 100 * 0.10 : 50 * 0.10;

  // Quiz Completion (10%) - future feature, default for now
  const quizScore = 0 * 0.10;

  const score = completenessScore + photoCountScore + photoRecencyScore + 
                responseRateScore + lastActiveScore + quizScore;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate compatibility score (0-100) - Dynamic per request
 *
 * Prefers serviceHistory from profile (persisted by live engine) when available.
 * Falls back to aggregate computation from bookings when serviceHistory is empty.
 */
export function calculateCompatibilityScore(modelProfile, bookings) {
  // Use persisted serviceHistory when available (aligns with live updateCompatibility)
  const serviceHistory = modelProfile?.serviceHistory;
  if (serviceHistory && typeof serviceHistory === 'object' && Object.keys(serviceHistory).length > 0) {
    let totalSuccesses = 0;
    let totalTotal = 0;
    for (const h of Object.values(serviceHistory)) {
      totalSuccesses += h.successes || 0;
      totalTotal += h.total || 0;
    }
    if (totalTotal > 0) {
      const currentScore = modelProfile?.agenticScores?.compatibility || 50;
      const overallRate = (totalSuccesses / totalTotal) * 100;
      return Math.max(0, Math.min(100, Math.round(currentScore * 0.6 + overallRate * 0.4)));
    }
  }

  // Fallback: aggregate from bookings
  if (!bookings || bookings.length === 0) return 50;

  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const successRate = (completedCount / bookings.length) * 100;
  const uniqueServices = new Set(bookings.map((b) => b.serviceType).filter(Boolean));
  const varietyBonus = Math.min(uniqueServices.size * 5, 20);
  const professionalIds = bookings.map((b) => b.professionalId);
  const uniquePros = new Set(professionalIds).size;
  const repeatRate =
    professionalIds.length > uniquePros
      ? ((professionalIds.length - uniquePros) / professionalIds.length) * 100
      : 0;
  const repeatBonus = repeatRate * 0.15;
  const score = successRate * 0.5 + varietyBonus + repeatBonus;
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate all agentic scores for a model profile
 * 
 * @param {Object} modelProfile - The model profile from database
 * @param {Array} bookings - All bookings for this model
 * @param {Array} matches - All matches for this model
 * @returns {Object} Object with all agentic scores
 */
export function calculateAllAgenticScores(modelProfile, bookings = [], matches = []) {
  return {
    reliability: calculateReliabilityScore(modelProfile, bookings, matches),
    feedback: calculateFeedbackScore(modelProfile, bookings),
    experience: calculateExperienceScore(modelProfile, bookings),
    engagement: calculateEngagementScore(modelProfile, matches),
    compatibility: calculateCompatibilityScore(modelProfile, bookings),
  };
}

/**
 * Update agentic scores in the database for a model profile
 * 
 * Note: This would need to be called periodically or after significant events
 * (e.g., after booking completion, feedback submission, etc.)
 */
export async function updateAgenticScoresInDatabase(modelId, client) {
  try {
    // Load model profile
    const { data: profile, errors: profileError } = await client.models.ModelProfile.get({ id: modelId });
    if (profileError) throw new Error(`Error loading profile: ${profileError[0]?.message}`);

    // Load bookings for this model
    const { data: bookings, errors: bookingsError } = await client.models.Booking.list({
      filter: { modelId: { eq: modelId } },
    });
    if (bookingsError) throw new Error(`Error loading bookings: ${bookingsError[0]?.message}`);

    // Load matches for this model
    const { data: matches, errors: matchesError } = await client.models.Match.list({
      filter: { modelId: { eq: modelId } },
    });
    if (matchesError) throw new Error(`Error loading matches: ${matchesError[0]?.message}`);

    // Calculate scores
    const scores = calculateAllAgenticScores(profile, bookings || [], matches || []);

    // Update profile with scores
    // Note: This assumes the schema has fields for agentic scores
    // If not, we may need to store them in a JSON field or add fields to schema
    const { errors: updateError } = await client.models.ModelProfile.update({
      id: modelId,
      // Store scores - adjust field names based on schema
      agenticScores: scores, // If JSON field exists
      // Or individual fields if they exist:
      // reliabilityScore: scores.reliability,
      // feedbackScore: scores.feedback,
      // experienceScore: scores.experience,
      // engagementScore: scores.engagement,
      // compatibilityScore: scores.compatibility,
    });

    if (updateError) {
      throw new Error(`Error updating scores: ${updateError[0]?.message}`);
    }

    return scores;
  } catch (error) {
    console.error('Error updating agentic scores:', error);
    throw error;
  }
}

