/**
 * CRM Service Utilities
 * 
 * Functions for managing prospects, campaigns, and outreach activities
 */

import { generateClient } from 'aws-amplify/data';

const client = generateClient();

/**
 * Create a new prospect
 */
export async function createProspect(prospectData) {
  try {
    const { data, errors } = await client.models.Prospect.create({
      ...prospectData,
      createdAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to create prospect');
    }

    return data;
  } catch (error) {
    console.error('Error creating prospect:', error);
    throw error;
  }
}

/**
 * Update prospect stage
 */
export async function updateProspectStage(prospectId, newStage) {
  try {
    const { data, errors } = await client.models.Prospect.update({
      id: prospectId,
      stage: newStage,
      updatedAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to update prospect');
    }

    return data;
  } catch (error) {
    console.error('Error updating prospect stage:', error);
    throw error;
  }
}

/**
 * Log outreach activity (email, call, etc.)
 */
export async function logOutreachActivity(activityData) {
  try {
    const { data, errors } = await client.models.OutreachActivity.create({
      ...activityData,
      createdAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to log activity');
    }

    // Update prospect's last contacted date
    if (activityData.prospectId) {
      await client.models.Prospect.update({
        id: activityData.prospectId,
        lastContactedAt: new Date().toISOString(),
        contactCount: (await getProspect(activityData.prospectId))?.contactCount + 1 || 1,
      });
    }

    return data;
  } catch (error) {
    console.error('Error logging outreach activity:', error);
    throw error;
  }
}

/**
 * Get prospect by ID
 */
export async function getProspect(prospectId) {
  try {
    const { data, errors } = await client.models.Prospect.get({
      id: prospectId,
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Prospect not found');
    }

    return data;
  } catch (error) {
    console.error('Error getting prospect:', error);
    return null;
  }
}

/**
 * Get all prospects with filters
 */
export async function getProspects(filters = {}) {
  try {
    const queryOptions = {
      limit: 1000,
    };

    if (filters.stage) {
      queryOptions.filter = { stage: { eq: filters.stage } };
    }
    if (filters.prospectType) {
      queryOptions.filter = {
        ...queryOptions.filter,
        prospectType: { eq: filters.prospectType },
      };
    }
    if (filters.city) {
      queryOptions.filter = {
        ...queryOptions.filter,
        city: { eq: filters.city },
      };
    }

    const { data, errors } = await client.models.Prospect.list(queryOptions);

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to load prospects');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting prospects:', error);
    return [];
  }
}

/**
 * Create outreach campaign
 */
export async function createCampaign(campaignData) {
  try {
    const { data, errors } = await client.models.OutreachCampaign.create({
      ...campaignData,
      createdAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to create campaign');
    }

    return data;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
}

/**
 * Send campaign to prospects
 */
export async function sendCampaign(campaignId, prospectIds) {
  try {
    // This would integrate with SES/Pinpoint for actual email sending
    // For now, create outreach activities for each prospect
    
    const activities = await Promise.all(
      prospectIds.map(prospectId =>
        logOutreachActivity({
          prospectId,
          campaignId,
          activityType: 'email',
          status: 'sent',
        })
      )
    );

    // Update campaign metrics
    const { data: campaign } = await client.models.OutreachCampaign.get({ id: campaignId });
    await client.models.OutreachCampaign.update({
      id: campaignId,
      totalSent: (campaign?.totalSent || 0) + prospectIds.length,
      status: 'sent',
      sentAt: new Date().toISOString(),
    });

    return activities;
  } catch (error) {
    console.error('Error sending campaign:', error);
    throw error;
  }
}

/**
 * Create or update city expansion
 */
export async function createCityExpansion(cityData) {
  try {
    const { data, errors } = await client.models.CityExpansion.create({
      ...cityData,
      createdAt: new Date().toISOString(),
    });

    if (errors) {
      throw new Error(errors[0]?.message || 'Failed to create city expansion');
    }

    return data;
  } catch (error) {
    console.error('Error creating city expansion:', error);
    throw error;
  }
}

/**
 * Get prospects for a specific city (for city expansion)
 */
export async function getProspectsByCity(city, state) {
  return getProspects({ city, prospectType: 'professional' });
}

/**
 * Get event prospects
 */
export async function getEventProspects() {
  return getProspects({ prospectType: 'event' });
}

