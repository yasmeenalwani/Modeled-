/**
 * STANDARDIZED DATABASE OPERATIONS
 * 
 * Wrapper utilities for safe database operations with consistent
 * error handling and mock data fallback
 */

import { getAmplifyClient, isDatabaseAvailable, safeDbOperation } from './amplifyClient';
import { shouldUseMockData } from './mockDataService';
import { logError, safeAsync } from './errorHandling';

/**
 * Safe database GET operation
 * 
 * @param {string} modelName - Model name (e.g., 'Professional', 'ModelProfile')
 * @param {string} id - Record ID
 * @param {Function} mockFn - Mock data function
 * @returns {Promise<Object|null>} Record or null
 */
export async function safeGet(modelName, id, mockFn = null) {
  return safeDbOperation(
    async () => {
      const client = getAmplifyClient();
      if (!client?.models?.[modelName]) {
        throw new Error(`Model ${modelName} not available`);
      }
      const { data, errors } = await client.models[modelName].get({ id });
      if (errors) {
        throw new Error(errors[0]?.message || 'Get operation failed');
      }
      return data;
    },
    mockFn,
  );
}

/**
 * Safe database LIST operation
 * 
 * @param {string} modelName - Model name
 * @param {Object} filter - Filter object
 * @param {number} limit - Maximum results
 * @param {Function} mockFn - Mock data function
 * @returns {Promise<Array>} Array of records
 */
export async function safeList(modelName, filter = null, limit = 1000, mockFn = null) {
  return safeDbOperation(
    async () => {
      const client = getAmplifyClient();
      if (!client?.models?.[modelName]) {
        throw new Error(`Model ${modelName} not available`);
      }
      const { data, errors } = await client.models[modelName].list({
        filter: filter || undefined,
        limit,
      });
      if (errors) {
        throw new Error(errors[0]?.message || 'List operation failed');
      }
      return data || [];
    },
    mockFn,
  );
}

/**
 * Safe database CREATE operation
 * 
 * @param {string} modelName - Model name
 * @param {Object} data - Data to create
 * @param {Function} mockFn - Mock data function
 * @returns {Promise<Object>} Created record
 */
export async function safeCreate(modelName, data, mockFn = null) {
  return safeDbOperation(
    async () => {
      const client = getAmplifyClient();
      if (!client?.models?.[modelName]) {
        throw new Error(`Model ${modelName} not available`);
      }
      const { data: result, errors } = await client.models[modelName].create(data);
      if (errors) {
        throw new Error(errors[0]?.message || 'Create operation failed');
      }
      return result;
    },
    mockFn,
  );
}

/**
 * Safe database UPDATE operation
 * 
 * @param {string} modelName - Model name
 * @param {string} id - Record ID
 * @param {Object} data - Data to update
 * @param {Function} mockFn - Mock data function
 * @returns {Promise<Object>} Updated record
 */
export async function safeUpdate(modelName, id, data, mockFn = null) {
  return safeDbOperation(
    async () => {
      const client = getAmplifyClient();
      if (!client?.models?.[modelName]) {
        throw new Error(`Model ${modelName} not available`);
      }
      const { data: result, errors } = await client.models[modelName].update({
        id,
        ...data,
      });
      if (errors) {
        throw new Error(errors[0]?.message || 'Update operation failed');
      }
      return result;
    },
    mockFn,
  );
}

/**
 * Safe database DELETE operation
 * 
 * @param {string} modelName - Model name
 * @param {string} id - Record ID
 * @param {Function} mockFn - Mock data function
 * @returns {Promise<boolean>} Success status
 */
export async function safeDelete(modelName, id, mockFn = null) {
  return safeDbOperation(
    async () => {
      const client = getAmplifyClient();
      if (!client?.models?.[modelName]) {
        throw new Error(`Model ${modelName} not available`);
      }
      const { errors } = await client.models[modelName].delete({ id });
      if (errors) {
        throw new Error(errors[0]?.message || 'Delete operation failed');
      }
      return true;
    },
    mockFn || (async () => true),
  );
}

/**
 * Check if a model is available
 * 
 * @param {string} modelName - Model name to check
 * @returns {boolean} True if model is available
 */
export function isModelAvailable(modelName) {
  const client = getAmplifyClient();
  return client?.models?.[modelName] !== undefined;
}
