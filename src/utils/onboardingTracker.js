/**
 * Onboarding Event Tracker
 * 
 * Tracks user onboarding events for analytics
 * 
 * Usage:
 *   import { trackOnboardingEvent } from '../utils/onboardingTracker';
 *   
 *   trackOnboardingEvent('signup_clicked', 'Model');
 *   trackOnboardingEvent('step_completed', 'Model', { stepName: 'welcome', stepNumber: 1 });
 */

import { trackOnboardingEvent as apiTrackEvent } from './analytics';

// Generate a session ID that persists for the onboarding session
function getSessionId() {
  let sessionId = sessionStorage.getItem('onboarding_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('onboarding_session_id', sessionId);
  }
  return sessionId;
}

// Clear session ID (call when onboarding completes or is abandoned)
export function clearOnboardingSession() {
  sessionStorage.removeItem('onboarding_session_id');
}

/**
 * Track an onboarding event
 * 
 * @param {string} eventType - 'signup_clicked', 'signup_started', 'step_completed', 'step_abandoned', 'onboarding_completed', 'onboarding_abandoned'
 * @param {string} userType - 'Model', 'Professional', 'Partner'
 * @param {object} options - Additional event data
 * @param {string} options.stepName - Name of the step (e.g., 'welcome', 'personal_info')
 * @param {number} options.stepNumber - Step number in the flow
 * @param {string} options.userId - User ID (if available)
 * @param {object} options.metadata - Additional metadata
 */
export async function trackOnboardingEvent(eventType, userType, options = {}) {
  const {
    stepName = null,
    stepNumber = null,
    userId = null,
    metadata = {},
  } = options;

  const event = {
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userType,
    eventType,
    stepName,
    stepNumber,
    sessionId: getSessionId(),
    userId,
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
      console.warn('Failed to track onboarding event:', error);
    });
  } catch (error) {
    console.warn('Error tracking onboarding event:', error);
  }
}

/**
 * Convenience functions for common events
 */

export function trackSignupClicked(userType) {
  return trackOnboardingEvent('signup_clicked', userType);
}

export function trackSignupStarted(userType) {
  return trackOnboardingEvent('signup_started', userType);
}

export function trackStepCompleted(userType, stepName, stepNumber, metadata = {}) {
  return trackOnboardingEvent('step_completed', userType, {
    stepName,
    stepNumber,
    metadata,
  });
}

export function trackStepAbandoned(userType, stepName, stepNumber, metadata = {}) {
  return trackOnboardingEvent('step_abandoned', userType, {
    stepName,
    stepNumber,
    metadata,
  });
}

export function trackOnboardingCompleted(userType, userId = null, metadata = {}) {
  clearOnboardingSession();
  return trackOnboardingEvent('onboarding_completed', userType, {
    userId,
    metadata,
  });
}

export function trackOnboardingAbandoned(userType, lastStepName = null, lastStepNumber = null, metadata = {}) {
  clearOnboardingSession();
  return trackOnboardingEvent('onboarding_abandoned', userType, {
    stepName: lastStepName,
    stepNumber: lastStepNumber,
    metadata,
  });
}

