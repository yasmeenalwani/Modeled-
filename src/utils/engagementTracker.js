/**
 * Engagement Event Tracker
 * 
 * Tracks post-activation user engagement: sessions, features, bookings, etc.
 * 
 * Usage:
 *   import { trackEngagementEvent, trackSession } from '../utils/engagementTracker';
 *   
 *   trackEngagementEvent('game_started', userId, 'Model', { featureName: 'hair_damage_quiz' });
 *   trackSession(userId, 'Model', sessionId);
 */

import { trackEngagementEvent as apiTrackEvent, trackSession as apiTrackSession } from './analytics';

// Generate a session ID that persists for the browser session
function getSessionId() {
  let sessionId = sessionStorage.getItem('engagement_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('engagement_session_id', sessionId);
  }
  return sessionId;
}

// Track session start/end
let sessionStartTime = null;
let sessionTracked = false;

export function startSession(userId, userType, deviceType = null) {
  const sessionId = getSessionId();
  sessionStartTime = Date.now();
  sessionTracked = false;

  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userType,
    sessionId,
    startedAt: new Date().toISOString(),
    pageViews: 1,
    deviceType: deviceType || (window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop'),
    metadata: {
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  };

  apiTrackSession(session).catch(error => {
    console.warn('Failed to track session:', error);
  });

  // Track session start event
  trackEngagementEvent('session_start', userId, userType, {
    sessionId,
    eventCategory: 'session',
  });

  return sessionId;
}

export function endSession(userId, userType) {
  if (!sessionStartTime) return;

  const sessionId = getSessionId();
  const duration = Math.floor((Date.now() - sessionStartTime) / 1000);

  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userType,
    sessionId,
    endedAt: new Date().toISOString(),
    durationSeconds: duration,
  };

  apiTrackSession(session).catch(error => {
    console.warn('Failed to track session end:', error);
  });

  // Track session end event
  trackEngagementEvent('session_end', userId, userType, {
    sessionId,
    sessionDuration: duration,
    eventCategory: 'session',
  });

  sessionStartTime = null;
  sessionStorage.removeItem('engagement_session_id');
}

/**
 * Track an engagement event
 * 
 * @param {string} eventType - Event type (e.g., 'game_started', 'quiz_completed', 'booking_intent_created')
 * @param {string} userId - User ID
 * @param {string} userType - 'Model', 'Professional', 'Partner'
 * @param {object} options - Additional event data
 */
export async function trackEngagementEvent(eventType, userId, userType, options = {}) {
  const {
    eventCategory = 'feature',
    featureName = null,
    featureType = null,
    bookingId = null,
    requestId = null,
    waitlistId = null,
    intentType = null,
    sessionId = getSessionId(),
    sessionDuration = null,
    pagePath = window.location.pathname,
    completionStatus = null,
    score = null,
    metadata = {},
  } = options;

  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    userType,
    eventType,
    eventCategory,
    featureName,
    featureType,
    bookingId,
    requestId,
    waitlistId,
    intentType,
    sessionId,
    sessionDuration,
    pagePath,
    completionStatus,
    score,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
  };

  try {
    // Fire and forget - don't block the UI
    apiTrackEvent(event).catch(error => {
      console.warn('Failed to track engagement event:', error);
    });
  } catch (error) {
    console.warn('Error tracking engagement event:', error);
  }
}

/**
 * Convenience functions for common events
 */

// Session events
export function trackSessionStart(userId, userType) {
  return startSession(userId, userType);
}

export function trackSessionEnd(userId, userType) {
  return endSession(userId, userType);
}

export function trackPageView(userId, userType, pagePath) {
  return trackEngagementEvent('page_view', userId, userType, {
    eventCategory: 'session',
    pagePath,
  });
}

// Feature engagement
export function trackGameStarted(userId, userType, gameName, gameType = 'game') {
  return trackEngagementEvent('game_started', userId, userType, {
    eventCategory: 'feature',
    featureName: gameName,
    featureType: gameType,
  });
}

export function trackGameCompleted(userId, userType, gameName, gameType = 'game', score = null) {
  return trackEngagementEvent('game_completed', userId, userType, {
    eventCategory: 'feature',
    featureName: gameName,
    featureType: gameType,
    completionStatus: 'completed',
    score,
  });
}

export function trackQuizStarted(userId, userType, quizName) {
  return trackEngagementEvent('quiz_started', userId, userType, {
    eventCategory: 'learning',
    featureName: quizName,
    featureType: 'quiz',
  });
}

export function trackQuizCompleted(userId, userType, quizName, score = null) {
  return trackEngagementEvent('quiz_completed', userId, userType, {
    eventCategory: 'learning',
    featureName: quizName,
    featureType: 'quiz',
    completionStatus: 'completed',
    score,
  });
}

export function trackLearningModuleCompleted(userId, userType, moduleName) {
  return trackEngagementEvent('learning_module_completed', userId, userType, {
    eventCategory: 'learning',
    featureName: moduleName,
    featureType: 'learning_module',
    completionStatus: 'completed',
  });
}

// Booking & marketplace
export function trackBookingIntent(userId, userType, requestId, intentType = 'booking') {
  return trackEngagementEvent('booking_intent_created', userId, userType, {
    eventCategory: 'booking',
    requestId,
    intentType,
  });
}

export function trackBookingConfirmed(userId, userType, bookingId, requestId = null) {
  return trackEngagementEvent('booking_confirmed', userId, userType, {
    eventCategory: 'booking',
    bookingId,
    requestId,
  });
}

export function trackWaitlistJoined(userId, userType, waitlistId, requestId = null) {
  return trackEngagementEvent('waitlist_joined', userId, userType, {
    eventCategory: 'booking',
    waitlistId,
    requestId,
  });
}

export function trackWaitlistConverted(userId, userType, waitlistId, bookingId) {
  return trackEngagementEvent('waitlist_converted', userId, userType, {
    eventCategory: 'booking',
    waitlistId,
    bookingId,
  });
}

export function trackProfileViewed(userId, userType, viewedUserId) {
  return trackEngagementEvent('profile_viewed', userId, userType, {
    eventCategory: 'booking',
    metadata: { viewedUserId },
  });
}

// Feature usage
export function trackFeatureUsed(userId, userType, featureName, featureType) {
  return trackEngagementEvent('feature_used', userId, userType, {
    eventCategory: 'feature',
    featureName,
    featureType,
  });
}

