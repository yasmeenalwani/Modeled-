// ============================================
// PACKAGES & PROMOS API UTILITIES
// ============================================

import { generateClient } from 'aws-amplify/data';
import { mockPackages, mockPromos, getAllPackagesAndPromos, getPackagesByCampaign } from '../admin/data/mockPackages';

const client = generateClient();

/**
 * Fetch all packages and promos
 * @param {boolean} activeOnly - Only return active items
 * @returns {Promise<Array>}
 */
export async function getPackagesAndPromos(activeOnly = false) {
  try {
    // Try to fetch from real backend first
    // For now, using mock data
    const allItems = getAllPackagesAndPromos();
    
    if (activeOnly) {
      const now = new Date();
      return allItems.filter(item => 
        item.status === 'active' && 
        item.startDate <= now && 
        item.endDate >= now
      );
    }
    
    return allItems;
  } catch (error) {
    console.error('Error fetching packages/promos:', error);
    return getAllPackagesAndPromos();
  }
}

/**
 * Get packages and promos linked to a specific campaign
 * @param {string} campaignId
 * @returns {Promise<{packages: Array, promos: Array}>}
 */
export async function getPackagesPromosByCampaign(campaignId) {
  try {
    return getPackagesByCampaign(campaignId);
  } catch (error) {
    console.error('Error fetching packages/promos by campaign:', error);
    return { packages: [], promos: [] };
  }
}

/**
 * Create a new package
 * @param {object} packageData
 * @returns {Promise<object>}
 */
export async function createPackage(packageData) {
  try {
    const isMockData = !packageData.id || packageData.id.startsWith('pkg-');
    
    if (!isMockData) {
      // In real implementation, create via GraphQL
      // const { data } = await client.models.Package.create(packageData);
      // return data;
    }
    
    console.log('📝 Mock mode: Would create package:', packageData);
    return {
      ...packageData,
      id: `pkg-${Date.now()}`,
      createdAt: new Date(),
      usageCount: 0,
      revenue: 0,
    };
  } catch (error) {
    console.error('Error creating package:', error);
    throw error;
  }
}

/**
 * Create a new promo
 * @param {object} promoData
 * @returns {Promise<object>}
 */
export async function createPromo(promoData) {
  try {
    const isMockData = !promoData.id || promoData.id.startsWith('promo-');
    
    if (!isMockData) {
      // In real implementation, create via GraphQL
      // const { data } = await client.models.Promo.create(promoData);
      // return data;
    }
    
    console.log('📝 Mock mode: Would create promo:', promoData);
    return {
      ...promoData,
      id: `promo-${Date.now()}`,
      createdAt: new Date(),
      usageCount: 0,
      revenue: 0,
    };
  } catch (error) {
    console.error('Error creating promo:', error);
    throw error;
  }
}

/**
 * Update a package or promo
 * @param {string} id
 * @param {object} updates
 * @param {'package' | 'promo'} type
 * @returns {Promise<object>}
 */
export async function updatePackageOrPromo(id, updates, type) {
  try {
    const isMockData = id.startsWith('pkg-') || id.startsWith('promo-');
    
    if (!isMockData) {
      // In real implementation, update via GraphQL
      // if (type === 'package') {
      //   const { data } = await client.models.Package.update({ id, ...updates });
      //   return data;
      // } else {
      //   const { data } = await client.models.Promo.update({ id, ...updates });
      //   return data;
      // }
    }
    
    console.log(`📝 Mock mode: Would update ${type} ${id}:`, updates);
    return { id, ...updates };
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    throw error;
  }
}

/**
 * Link a package or promo to a campaign
 * @param {string} id
 * @param {string} campaignId
 * @param {'package' | 'promo'} type
 * @returns {Promise<object>}
 */
export async function linkToCampaign(id, campaignId, type) {
  try {
    // Get current item
    const allItems = getAllPackagesAndPromos();
    const item = allItems.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`${type} not found`);
    }
    
    // Add campaign ID if not already linked
    const campaignIds = item.campaignIds || [];
    if (!campaignIds.includes(campaignId)) {
      campaignIds.push(campaignId);
    }
    
    return await updatePackageOrPromo(id, { campaignIds }, type);
  } catch (error) {
    console.error('Error linking to campaign:', error);
    throw error;
  }
}

/**
 * Unlink a package or promo from a campaign
 * @param {string} id
 * @param {string} campaignId
 * @param {'package' | 'promo'} type
 * @returns {Promise<object>}
 */
export async function unlinkFromCampaign(id, campaignId, type) {
  try {
    // Get current item
    const allItems = getAllPackagesAndPromos();
    const item = allItems.find(i => i.id === id);
    
    if (!item) {
      throw new Error(`${type} not found`);
    }
    
    // Remove campaign ID
    const campaignIds = (item.campaignIds || []).filter(cid => cid !== campaignId);
    
    return await updatePackageOrPromo(id, { campaignIds }, type);
  } catch (error) {
    console.error('Error unlinking from campaign:', error);
    throw error;
  }
}

