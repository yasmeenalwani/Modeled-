// ============================================
// WAITLIST API UTILITIES
// ============================================

import { generateClient } from 'aws-amplify/data';
import { 
  mockWaitlistEntries, 
  getWaitlistByRequest, 
  getWaitlistByModel,
  getNextWaitlistPosition 
} from '../admin/data/mockWaitlist';
import { createNotification } from './createNotification';

const client = generateClient();

/**
 * Get all waitlist entries
 * @param {object} filters - Optional filters { requestId, modelId, status }
 * @returns {Promise<Array>}
 */
export async function getWaitlistEntries(filters = {}) {
  try {
    let entries = mockWaitlistEntries;
    
    // Try to fetch from real backend
    // For now, using mock data
    // if (filters.requestId) {
    //   const { data } = await client.models.Match.list({
    //     filter: { 
    //       requestId: { eq: filters.requestId },
    //       status: { eq: 'waitlist' }
    //     }
    //   });
    //   entries = data;
    // }
    
    // Apply filters
    if (filters.requestId) {
      entries = entries.filter(e => e.requestId === filters.requestId);
    }
    if (filters.modelId) {
      entries = entries.filter(e => e.modelId === filters.modelId.toString());
    }
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    
    // Sort by position
    return entries.sort((a, b) => {
      if (a.requestId !== b.requestId) {
        return a.requestId.localeCompare(b.requestId);
      }
      return a.waitlistPosition - b.waitlistPosition;
    });
  } catch (error) {
    console.error('Error fetching waitlist entries:', error);
    return mockWaitlistEntries;
  }
}

/**
 * Get waitlist entries for a specific request
 * @param {string} requestId
 * @returns {Promise<Array>}
 */
export async function getWaitlistByRequestId(requestId) {
  return getWaitlistEntries({ requestId, status: 'waitlist' });
}

/**
 * Promote the next model from waitlist to active booking
 * @param {string} requestId
 * @param {string} cancelledBookingId - ID of the cancelled booking
 * @returns {Promise<object>}
 */
export async function promoteFromWaitlist(requestId, cancelledBookingId = null) {
  try {
    const waitlistEntries = await getWaitlistByRequestId(requestId);
    
    if (waitlistEntries.length === 0) {
      throw new Error('No waitlist entries found for this request');
    }
    
    // Get the first entry (position 1)
    const nextEntry = waitlistEntries.find(e => e.waitlistPosition === 1);
    
    if (!nextEntry) {
      throw new Error('No model at position 1 in waitlist');
    }
    
    const isMockData = nextEntry.id.startsWith('waitlist-');
    
    if (!isMockData) {
      // Update match status from waitlist to accepted
      await client.models.Match.update({
        id: nextEntry.matchId,
        status: 'accepted',
        waitlistPosition: null,
      });
      
      // Update other waitlist positions (decrement by 1)
      const otherEntries = waitlistEntries.filter(e => e.waitlistPosition > 1);
      for (const entry of otherEntries) {
        await client.models.Match.update({
          id: entry.matchId,
          waitlistPosition: entry.waitlistPosition - 1,
        });
      }
    } else {
      console.log('📝 Mock mode: Would promote from waitlist:', nextEntry);
    }
    
    // Notify the promoted model
    await createNotification({
      userId: nextEntry.model.userId,
      userType: 'model',
      type: 'waitlist_promotion',
      title: 'Great News!',
      message: `A booking opened up for ${nextEntry.request.serviceType} on ${new Date(nextEntry.request.requestedDate).toLocaleDateString()}. You're next in line! Click to claim it.`,
      link: `/model-portal/opportunities/${nextEntry.requestId}`,
      actionText: 'Claim Booking',
      relatedEntityId: nextEntry.requestId,
      data: { 
        matchId: nextEntry.matchId,
        requestId: nextEntry.requestId,
        waitlistPosition: 1,
      },
    });
    
    return {
      success: true,
      promotedMatch: nextEntry,
      message: `Successfully promoted ${nextEntry.model.firstName} ${nextEntry.model.lastName} from waitlist position 1`,
    };
  } catch (error) {
    console.error('Error promoting from waitlist:', error);
    throw error;
  }
}

/**
 * Remove a model from waitlist (e.g., if they decline)
 * @param {string} matchId
 * @returns {Promise<object>}
 */
export async function removeFromWaitlist(matchId) {
  try {
    const isMockData = matchId.startsWith('match-');
    
    if (!isMockData) {
      await client.models.Match.update({
        id: matchId,
        status: 'declined',
        waitlistPosition: null,
      });
      
      // Recalculate positions for remaining waitlist entries
      // This would require fetching all entries for the same request
    } else {
      console.log('📝 Mock mode: Would remove from waitlist:', matchId);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from waitlist:', error);
    throw error;
  }
}

/**
 * Get waitlist statistics
 * @returns {Promise<object>}
 */
export async function getWaitlistStats() {
  try {
    const entries = await getWaitlistEntries();
    const activeEntries = entries.filter(e => e.status === 'waitlist');
    
    // Group by request
    const byRequest = {};
    activeEntries.forEach(entry => {
      if (!byRequest[entry.requestId]) {
        byRequest[entry.requestId] = [];
      }
      byRequest[entry.requestId].push(entry);
    });
    
    return {
      total: activeEntries.length,
      uniqueRequests: Object.keys(byRequest).length,
      averageWaitlistSize: activeEntries.length / Math.max(Object.keys(byRequest).length, 1),
      byRequest,
    };
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return {
      total: 0,
      uniqueRequests: 0,
      averageWaitlistSize: 0,
      byRequest: {},
    };
  }
}

