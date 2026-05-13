/**
 * Pinpoint Event Tracking Utility
 * 
 * Tracks user behavior and events for analytics and segmentation
 * 
 * Usage:
 * - Track booking created: trackEvent(userId, 'booking_created', { serviceType, amount })
 * - Track profile viewed: trackEvent(userId, 'profile_viewed', { profileType, profileId })
 */

import { invoke } from 'aws-amplify/function';
import { generateClient } from 'aws-amplify/data';
import type { ClientSchema } from '../../amplify/data/resource';
import outputs from '../../amplify_outputs.json';

const client = generateClient<ClientSchema>();

/**
 * Track an event in Pinpoint
 * 
 * @param userId - User ID
 * @param eventType - Event type (e.g., 'booking_created', 'profile_viewed')
 * @param attributes - Event attributes (key-value pairs)
 */
export async function trackEvent(
  userId: string,
  eventType: string,
  attributes: Record<string, any> = {}
) {
  try {
    const functionName =
      outputs?.custom?.pinpointSegmentsFunctionName ||
      outputs?.custom?.pinpointFunctionName ||
      import.meta?.env?.VITE_PINPOINT_FUNCTION_NAME ||
      'pinpoint-segments';
    // Update Pinpoint endpoint with event
    await invoke({
      functionName,
      payload: {
        action: 'updateEndpoint',
        userId,
        attributes: {
          ...attributes,
          lastEvent: [eventType],
          lastEventTime: [new Date().toISOString()],
        },
        metrics: {
          [eventType]: 1,
        },
      },
    });
    
    console.log(`Tracked event: ${eventType} for user: ${userId}`);
  } catch (error) {
    console.error('Error tracking event:', error);
    // Don't throw - event tracking should not break the app
  }
}

/**
 * Sync user data to Pinpoint endpoint
 * Call this when user profile is created or updated
 */
export async function syncUserToPinpoint(
  userId: string,
  userData: {
    email?: string;
    phone?: string;
    userType?: 'Model' | 'Professional' | 'Partner';
    locationZip?: string;
    status?: string;
    [key: string]: any;
  }
) {
  try {
    const functionName =
      outputs?.custom?.pinpointSegmentsFunctionName ||
      outputs?.custom?.pinpointFunctionName ||
      import.meta?.env?.VITE_PINPOINT_FUNCTION_NAME ||
      'pinpoint-segments';
    const attributes: Record<string, string[]> = {};
    
    if (userData.userType) {
      attributes.userType = [userData.userType];
    }
    if (userData.locationZip) {
      attributes.locationZip = [userData.locationZip];
    }
    if (userData.status) {
      attributes.status = [userData.status];
    }
    
    await invoke({
      functionName,
      payload: {
        action: 'updateEndpoint',
        userId,
        email: userData.email,
        phone: userData.phone,
        attributes,
      },
    });
    
    console.log(`Synced user to Pinpoint: ${userId}`);
  } catch (error) {
    console.error('Error syncing user to Pinpoint:', error);
  }
}

/**
 * Predefined event tracking functions
 */

export const PinpointEvents = {
  // Booking events
  bookingCreated: (userId: string, data: { bookingId: string; serviceType: string; amount: number }) =>
    trackEvent(userId, 'booking_created', data),
  
  bookingCompleted: (userId: string, data: { bookingId: string; serviceType: string }) =>
    trackEvent(userId, 'booking_completed', data),
  
  bookingCancelled: (userId: string, data: { bookingId: string; reason?: string }) =>
    trackEvent(userId, 'booking_cancelled', data),
  
  // Profile events
  profileViewed: (userId: string, data: { profileType: string; profileId: string }) =>
    trackEvent(userId, 'profile_viewed', data),
  
  profileUpdated: (userId: string, data: { profileType: string }) =>
    trackEvent(userId, 'profile_updated', data),
  
  // Request events
  requestCreated: (userId: string, data: { requestId: string; serviceType: string }) =>
    trackEvent(userId, 'request_created', data),
  
  // Match events
  matchViewed: (userId: string, data: { matchId: string; score: number }) =>
    trackEvent(userId, 'match_viewed', data),
  
  matchAccepted: (userId: string, data: { matchId: string }) =>
    trackEvent(userId, 'match_accepted', data),
  
  matchDeclined: (userId: string, data: { matchId: string }) =>
    trackEvent(userId, 'match_declined', data),
  
  // Engagement events
  login: (userId: string) =>
    trackEvent(userId, 'login', {}),
  
  photoUploaded: (userId: string, data: { photoType: string }) =>
    trackEvent(userId, 'photo_uploaded', data),
  
  feedbackSubmitted: (userId: string, data: { bookingId: string; rating: number }) =>
    trackEvent(userId, 'feedback_submitted', data),
};

