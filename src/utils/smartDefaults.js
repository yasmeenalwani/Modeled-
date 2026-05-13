/**
 * Smart Defaults Utility
 * 
 * Provides intelligent defaults based on user history and patterns
 */

import { generateClient } from 'aws-amplify/data';

const client = generateClient();

/**
 * Get smart defaults for request creation based on professional history
 */
export async function getRequestDefaults(professionalId) {
  try {
    // Get professional's recent requests
    const recentRequests = await client.models.ModelRequest.list({
      filter: {
        professionalId: { eq: professionalId },
      },
      limit: 10,
      sortDirection: 'DESC',
    });

    if (!recentRequests.data || recentRequests.data.length === 0) {
      return getDefaultDefaults();
    }

    // Analyze patterns
    const serviceTypes = recentRequests.data.map(r => r.serviceType).filter(Boolean);
    const mostCommonService = getMostCommon(serviceTypes);
    
    const durations = recentRequests.data.map(r => r.duration).filter(Boolean);
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 60;

    const locations = recentRequests.data.map(r => r.location).filter(Boolean);
    const mostCommonLocation = getMostCommon(locations);

    const times = recentRequests.data.map(r => r.requestedTime).filter(Boolean);
    const mostCommonTime = getMostCommon(times);

    // Get preferred attributes from recent requests
    const preferredAttributes = {
      hairColor: getMostCommon(recentRequests.data.map(r => r.desiredHairColor).filter(Boolean)),
      hairLength: getMostCommon(recentRequests.data.map(r => r.desiredHairLength).filter(Boolean)),
      hairTexture: getMostCommon(recentRequests.data.map(r => r.desiredHairTexture).filter(Boolean)),
      hairCondition: getMostCommon(recentRequests.data.map(r => r.desiredHairCondition).filter(Boolean)),
    };

    return {
      serviceType: mostCommonService || 'haircut',
      duration: avgDuration,
      location: mostCommonLocation || '',
      requestedTime: mostCommonTime || '10:00 AM',
      desiredHairColor: preferredAttributes.hairColor || '',
      desiredHairLength: preferredAttributes.hairLength || 'medium',
      desiredHairTexture: preferredAttributes.hairTexture || 'straight',
      desiredHairCondition: preferredAttributes.hairCondition || 'healthy',
      // Default date to tomorrow
      requestedDate: getTomorrowDate(),
    };
  } catch (error) {
    console.error('Error getting smart defaults:', error);
    return getDefaultDefaults();
  }
}

/**
 * Get default defaults (when no history)
 */
function getDefaultDefaults() {
  return {
    serviceType: 'haircut',
    duration: 60,
    location: '',
    requestedTime: '10:00 AM',
    desiredHairColor: '',
    desiredHairLength: 'medium',
    desiredHairTexture: 'straight',
    desiredHairCondition: 'healthy',
    requestedDate: getTomorrowDate(),
  };
}

/**
 * Get most common value in array
 */
function getMostCommon(arr) {
  if (!arr || arr.length === 0) return null;
  
  const counts = {};
  arr.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
}

/**
 * Get tomorrow's date in YYYY-MM-DD format
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

/**
 * Get smart time suggestions based on service type
 */
export function getTimeSuggestions(serviceType) {
  const suggestions = {
    haircut: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    color: ['9:00 AM', '10:00 AM', '11:00 AM'], // Earlier for longer services
    highlights: ['9:00 AM', '10:00 AM'],
    blowdry: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
    gloss: ['10:00 AM', '11:00 AM', '2:00 PM'],
    keratin: ['9:00 AM', '10:00 AM'], // Very long service
  };

  return suggestions[serviceType] || suggestions.haircut;
}

/**
 * Get smart duration based on service type
 */
export function getDurationForService(serviceType) {
  const durations = {
    haircut: 60,
    color: 180,
    highlights: 240,
    blowdry: 45,
    gloss: 60,
    keratin: 300,
  };

  return durations[serviceType] || 60;
}

/**
 * Get predictive next actions based on current state
 */
export function getPredictiveActions(request, match, booking) {
  const actions = [];

  if (!request) return actions;

  // If request is pending, suggest starting matching
  if (request.status === 'pending') {
    actions.push({
      label: 'Start Matching',
      action: 'start_matching',
      priority: 'high',
      icon: '',
    });
  }

  // If matches exist but not sent, suggest sending
  if (match && match.status === 'approved') {
    actions.push({
      label: 'Send to Models',
      action: 'send_matches',
      priority: 'high',
      icon: '📤',
    });
  }

  // If booking needs payment, suggest payment
  if (booking && booking.modelPaymentStatus === 'pending') {
    actions.push({
      label: 'Complete Payment',
      action: 'pay',
      priority: 'urgent',
      icon: '💳',
    });
  }

  // If booking is confirmed and tomorrow, suggest reminder
  if (booking && booking.status === 'confirmed') {
    const appointmentDate = new Date(booking.appointmentDate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      actions.push({
        label: 'Send Reminder',
        action: 'send_reminder',
        priority: 'medium',
        icon: '⏰',
      });
    }
  }

  return actions;
}

