import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';

/**
 * Analytics API Utilities
 * 
 * Functions to query RDS analytics via Lambda API
 */

/**
 * Call analytics API
 */
async function callAnalyticsAPI(action, params = {}) {
  try {
    const session = await fetchAuthSession();
    const apiName = 'analyticsApiFunction';
    
    const response = await post({
      apiName,
      path: '/analytics',
      options: {
        body: {
          action,
          params,
        },
        headers: {
          Authorization: `Bearer ${session.tokens?.idToken}`,
        },
      },
    });

    const result = await response.body.json();
    const body = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    if (body.success) {
      return body.data;
    } else {
      throw new Error(body.error || 'Analytics query failed');
    }
  } catch (error) {
    console.error('Analytics API Error:', error);
    throw new Error(`Failed to fetch analytics: ${error.message}`);
  }
}

/**
 * Get revenue by month
 */
export async function getRevenueByMonth(months = 12) {
  return await callAnalyticsAPI('getRevenueByMonth', { months });
}

/**
 * Get revenue trends
 */
export async function getRevenueTrends(days = 30) {
  return await callAnalyticsAPI('getRevenueTrends', { days });
}

/**
 * Get service performance
 */
export async function getServicePerformance() {
  return await callAnalyticsAPI('getServicePerformance');
}

/**
 * Get match conversion rates
 */
export async function getMatchConversion(weeks = 12) {
  return await callAnalyticsAPI('getMatchConversion', { weeks });
}

/**
 * Get request trends
 */
export async function getRequestTrends(days = 30) {
  return await callAnalyticsAPI('getRequestTrends', { days });
}

/**
 * Get top professionals
 */
export async function getTopProfessionals(limit = 10) {
  return await callAnalyticsAPI('getTopProfessionals', { limit });
}

/**
 * Get top models
 */
export async function getTopModels(limit = 10) {
  return await callAnalyticsAPI('getTopModels', { limit });
}

/**
 * Get revenue by date range
 */
export async function getRevenueByDateRange(startDate, endDate) {
  return await callAnalyticsAPI('getRevenueByDateRange', { startDate, endDate });
}

/**
 * Refresh analytics views
 */
export async function refreshAnalyticsViews() {
  return await callAnalyticsAPI('refreshViews');
}

/**
 * Get onboarding funnel data
 */
export async function getOnboardingFunnel(days = 30, userType = null) {
  return await callAnalyticsAPI('getOnboardingFunnel', { days, userType });
}

/**
 * Get onboarding dropoff analysis
 */
export async function getOnboardingDropoff(userType = null) {
  return await callAnalyticsAPI('getOnboardingDropoff', { userType });
}

/**
 * Get onboarding statistics
 */
export async function getOnboardingStats(days = 30) {
  return await callAnalyticsAPI('getOnboardingStats', { days });
}

/**
 * Track an onboarding event
 */
export async function trackOnboardingEvent(event) {
  return await callAnalyticsAPI('trackOnboardingEvent', { event });
}

/**
 * Get engagement summary
 */
export async function getEngagementSummary(days = 30, userType = null) {
  return await callAnalyticsAPI('getEngagementSummary', { days, userType });
}

/**
 * Get user engagement metrics
 */
export async function getUserEngagementMetrics(userId = null, userType = null, days = null) {
  return await callAnalyticsAPI('getUserEngagementMetrics', { userId, userType, days });
}

/**
 * Get feature engagement data
 */
export async function getFeatureEngagement(userType = null) {
  return await callAnalyticsAPI('getFeatureEngagement', { userType });
}

/**
 * Get booking funnel data
 */
export async function getBookingFunnel(days = 30, userType = null) {
  return await callAnalyticsAPI('getBookingFunnel', { days, userType });
}

/**
 * Get stickiness metrics
 */
export async function getStickinessMetrics(days = 30, userType = null) {
  return await callAnalyticsAPI('getStickinessMetrics', { days, userType });
}

/**
 * Track an engagement event
 */
export async function trackEngagementEvent(event) {
  return await callAnalyticsAPI('trackEngagementEvent', { event });
}

/**
 * Track a user session
 */
export async function trackSession(session) {
  return await callAnalyticsAPI('trackSession', { session });
}

