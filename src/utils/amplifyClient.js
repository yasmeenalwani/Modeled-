/**
 * Safe Amplify Client Initialization
 * 
 * Centralized utility for safely initializing the Amplify client
 * with proper error handling and mock data fallback
 */

import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData } from './mockDataService';

let client = null;
let clientInitialized = false;

/**
 * Get the Amplify client, initializing it if needed
 * Returns null if initialization fails (will use mock data)
 */
export function getAmplifyClient() {
  if (clientInitialized) {
    return client;
  }

  try {
    client = generateClient();
    clientInitialized = true;
    return client;
  } catch (error) {
    console.warn('Failed to generate Amplify client, will use mock data only:', error);
    client = null;
    clientInitialized = true;
    return null;
  }
}

/**
 * Check if database operations are available
 */
export function isDatabaseAvailable() {
  const c = getAmplifyClient();
  return !shouldUseMockData() && c !== null && c.models !== undefined;
}

/**
 * Safely execute a database operation with fallback
 * 
 * @param {Function} dbOperation - Function that performs database operation
 * @param {Function} fallback - Function that returns mock/fallback data
 * @returns {Promise} Result of dbOperation or fallback
 */
export async function safeDbOperation(dbOperation, fallback) {
  if (!isDatabaseAvailable()) {
    if (fallback) {
      return await fallback();
    }
    return null;
  }

  try {
    return await dbOperation();
  } catch (error) {
    console.warn('Database operation failed, using fallback:', error);
    if (fallback) {
      return await fallback();
    }
    throw error;
  }
}
