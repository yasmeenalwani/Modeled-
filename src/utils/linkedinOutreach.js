/**
 * LinkedIn Outreach Utilities
 * 
 * Functions for managing LinkedIn outreach and connections
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

/**
 * Log LinkedIn outreach activity
 */
export async function logLinkedInActivity(prospectId, activityData) {
  try {
    const { data, errors } = await client.models.OutreachActivity.create({
      prospectId,
      activityType: 'linkedin',
      ...activityData,
      createdAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to log LinkedIn activity');
    }

    return data;
  } catch (error) {
    console.error('Error logging LinkedIn activity:', error);
    throw error;
  }
}

/**
 * Get LinkedIn connection request template
 */
export function getLinkedInConnectionTemplate(prospect) {
  return `Hi ${prospect.firstName},

I noticed you're a ${prospect.title || 'beauty professional'} in ${prospect.city || 'the area'}. I'm building Modeled, a platform connecting emerging beauty professionals with aspiring models.

Would love to connect and share what we're building!

Best,
Yasmeen
Modeled`;
}

/**
 * Get LinkedIn message template
 */
export function getLinkedInMessageTemplate(prospect, templateType = 'cold') {
  const templates = {
    cold: `Hi ${prospect.firstName},

I saw your profile and thought you might be interested in Modeled - we're connecting beauty professionals with aspiring models for training and portfolio building.

Would you be open to a quick chat about how we can help grow your career?

Best,
Yasmeen`,
    
    follow_up: `Hi ${prospect.firstName},

Just following up on my previous message about Modeled. I'd love to share how we're helping professionals like you access models for training.

Are you open to a quick call?

Best,
Yasmeen`,
    
    event: `Hi ${prospect.firstName},

I noticed ${prospect.eventName || 'an event'} you're involved with. Modeled would love to connect - we're looking to partner with events in the beauty industry.

Would you be open to discussing opportunities?

Best,
Yasmeen`,
  };
  
  return templates[templateType] || templates.cold;
}

/**
 * Track LinkedIn profile views
 */
export async function trackLinkedInProfileView(prospectId) {
  try {
    await logLinkedInActivity(prospectId, {
      activityType: 'linkedin',
      message: 'Profile viewed',
      status: 'completed',
    });
  } catch (error) {
    console.error('Error tracking LinkedIn view:', error);
  }
}

