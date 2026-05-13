/**
 * Automated Follow-up Utilities
 * 
 * Functions for scheduling and managing automated follow-ups
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Schedule automated follow-up for a prospect
 * @param {string} prospectId - Prospect ID
 * @param {number} daysFromNow - Days from now to follow up
 * @param {string} templateId - Email template to use
 */
export async function scheduleFollowUp(prospectId, daysFromNow = 3, templateId = 'follow_up') {
  try {
    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + daysFromNow);

    const { data, errors } = await client.models.Prospect.update({
      id: prospectId,
      nextFollowUpAt: followUpDate.toISOString(),
      requiresFollowUp: true,
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to schedule follow-up');
    }

    // TODO: Create EventBridge rule or scheduled task
    // This would trigger the follow-up email on the scheduled date

    return data;
  } catch (error) {
    console.error('Error scheduling follow-up:', error);
    throw error;
  }
}

/**
 * Get prospects needing follow-up
 */
export async function getProspectsNeedingFollowUp() {
  try {
    const now = new Date();
    const { data, errors } = await client.models.Prospect.list({
      filter: {
        nextFollowUpAt: { le: now.toISOString() },
        requiresFollowUp: { eq: true },
        status: { eq: 'active' },
      },
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to load prospects');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting prospects needing follow-up:', error);
    return [];
  }
}

/**
 * Process automated follow-ups (called by scheduled job)
 */
export async function processAutomatedFollowUps() {
  try {
    const prospects = await getProspectsNeedingFollowUp();
    
    for (const prospect of prospects) {
      // Send follow-up email
      // TODO: Integrate with email sending service
      console.log(`Sending follow-up to ${prospect.email}`);
      
      // Update prospect
      await client.models.Prospect.update({
        id: prospect.id,
        lastContactedAt: new Date().toISOString(),
        contactCount: (prospect.contactCount || 0) + 1,
        // Don't clear nextFollowUpAt - schedule next one if needed
      });
    }

    return { processed: prospects.length };
  } catch (error) {
    console.error('Error processing automated follow-ups:', error);
    throw error;
  }
}

/**
 * Auto-schedule next follow-up based on stage
 */
export function getFollowUpDaysForStage(stage) {
  const followUpSchedule = {
    new: 3, // Follow up in 3 days
    contacted: 5, // Follow up in 5 days
    qualified: 7, // Follow up in 7 days
    proposal: 3, // Follow up in 3 days (urgent)
    negotiation: 2, // Follow up in 2 days (very urgent)
    nurture: 14, // Follow up in 14 days (long-term)
  };
  
  return followUpSchedule[stage] || 7; // Default: 7 days
}

