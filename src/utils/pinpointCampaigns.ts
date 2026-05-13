/**
 * Pinpoint Campaigns Utility
 * 
 * Functions for sending marketing campaigns via Pinpoint
 * 
 * Usage:
 * - Send campaign: sendCampaign(segmentId, template, data)
 * - Create campaign: createCampaign(name, segmentId, template, schedule)
 */

import { invoke } from 'aws-amplify/function';

export interface CampaignTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface CampaignSchedule {
  startTime: string; // ISO 8601
  endTime?: string;
  timezone?: string;
}

/**
 * Send a marketing campaign to a segment
 */
export async function sendCampaign(
  segmentId: string,
  template: CampaignTemplate,
  data?: Record<string, any>
) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-campaigns',
      payload: {
        action: 'sendCampaign',
        segmentId,
        template,
        data,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error sending campaign:', error);
    throw error;
  }
}

/**
 * Create a scheduled campaign
 */
export async function createCampaign(
  name: string,
  segmentId: string,
  template: CampaignTemplate,
  schedule?: CampaignSchedule
) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-campaigns',
      payload: {
        action: 'createCampaign',
        name,
        segmentId,
        template,
        schedule,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

/**
 * Get campaign details and analytics
 */
export async function getCampaign(campaignId: string) {
  try {
    const response = await invoke({
      functionName: 'pinpoint-campaigns',
      payload: {
        action: 'getCampaign',
        campaignId,
      },
    });
    
    return response;
  } catch (error) {
    console.error('Error getting campaign:', error);
    throw error;
  }
}

/**
 * Predefined campaign templates
 */
export const CampaignTemplates = {
  welcomeModel: (firstName: string, portalLink: string): CampaignTemplate => ({
    subject: `Welcome to Modeled, ${firstName}!`,
    html: `
      <h1>Welcome to Modeled, ${firstName}!</h1>
      <p>We're excited to have you join our community of models and beauty professionals.</p>
      <p>Complete your profile to start receiving opportunities:</p>
      <a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #FFFEF9; text-decoration: none; border-radius: 8px;">Complete Profile</a>
    `,
    text: `Welcome to Modeled, ${firstName}! Complete your profile at ${portalLink}`,
  }),
  
  reEngagement: (firstName: string, portalLink: string): CampaignTemplate => ({
    subject: `We miss you, ${firstName}!`,
    html: `
      <h1>We miss you, ${firstName}!</h1>
      <p>It's been a while since you've been active. Check out new opportunities:</p>
      <a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #FFFEF9; text-decoration: none; border-radius: 8px;">View Opportunities</a>
    `,
    text: `We miss you! Check out new opportunities at ${portalLink}`,
  }),
  
  newService: (serviceName: string, portalLink: string): CampaignTemplate => ({
    subject: `New Service Available: ${serviceName}`,
    html: `
      <h1>New Service Available!</h1>
      <p>We're excited to announce ${serviceName} is now available on Modeled.</p>
      <a href="${portalLink}" style="display: inline-block; padding: 12px 24px; background: #8B1E3F; color: #FFFEF9; text-decoration: none; border-radius: 8px;">Learn More</a>
    `,
    text: `New service available: ${serviceName}. Learn more at ${portalLink}`,
  }),
};

