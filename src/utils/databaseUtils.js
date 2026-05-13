/**
 * Database Utilities
 * Helper functions for CRUD operations and authorization verification
 */

import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import { getUserType } from './authUtils';

const client = generateClient();

/**
 * Test CRUD operations for ModelProfile
 * @returns {Promise<{success: boolean, results: object, errors: array}>}
 */
export async function testModelProfileCRUD() {
  const results = {
    create: null,
    read: null,
    update: null,
    delete: null,
    errors: []
  };

  try {
    const user = await getCurrentUser();
    const testId = `test-${Date.now()}`;

    // CREATE
    try {
      const { data, errors } = await client.models.ModelProfile.create({
        userId: user.userId,
        email: `test-${testId}@test.com`,
        firstName: 'Test',
        lastName: 'Model',
        phone: '555-0000',
        status: 'pending',
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
      });

      if (errors) {
        results.errors.push({ operation: 'create', errors });
      } else {
        results.create = { success: true, data };
        
        // READ
        try {
          const { data: readData, errors: readErrors } = await client.models.ModelProfile.get({
            id: data.id
          });

          if (readErrors) {
            results.errors.push({ operation: 'read', errors: readErrors });
          } else {
            results.read = { success: true, data: readData };
          }
        } catch (readError) {
          results.errors.push({ operation: 'read', error: readError.message });
        }

        // UPDATE
        try {
          const { data: updateData, errors: updateErrors } = await client.models.ModelProfile.update({
            id: data.id,
            firstName: 'Updated Test',
          });

          if (updateErrors) {
            results.errors.push({ operation: 'update', errors: updateErrors });
          } else {
            results.update = { success: true, data: updateData };
          }
        } catch (updateError) {
          results.errors.push({ operation: 'update', error: updateError.message });
        }

        // DELETE
        try {
          const { errors: deleteErrors } = await client.models.ModelProfile.delete({
            id: data.id
          });

          if (deleteErrors) {
            results.errors.push({ operation: 'delete', errors: deleteErrors });
          } else {
            results.delete = { success: true };
          }
        } catch (deleteError) {
          results.errors.push({ operation: 'delete', error: deleteError.message });
        }
      }
    } catch (createError) {
      results.errors.push({ operation: 'create', error: createError.message });
    }

    return {
      success: results.create && results.read && results.update && results.delete,
      results,
      errors: results.errors
    };
  } catch (error) {
    return {
      success: false,
      results,
      errors: [{ operation: 'general', error: error.message }]
    };
  }
}

/**
 * Test CRUD operations for Professional
 * @returns {Promise<{success: boolean, results: object, errors: array}>}
 */
export async function testProfessionalCRUD() {
  const results = {
    create: null,
    read: null,
    update: null,
    delete: null,
    errors: []
  };

  try {
    const user = await getCurrentUser();
    const testId = `test-${Date.now()}`;

    // CREATE
    try {
      const { data, errors } = await client.models.Professional.create({
        userId: user.userId,
        email: `test-${testId}@test.com`,
        firstName: 'Test',
        lastName: 'Professional',
        phone: '555-0000',
        website: 'https://test.com',
        status: 'pending',
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
      });

      if (errors) {
        results.errors.push({ operation: 'create', errors });
      } else {
        results.create = { success: true, data };
        
        // READ, UPDATE, DELETE (similar to ModelProfile)
        // ... (implement similar pattern)
      }
    } catch (createError) {
      results.errors.push({ operation: 'create', error: createError.message });
    }

    return {
      success: results.create && results.read && results.update && results.delete,
      results,
      errors: results.errors
    };
  } catch (error) {
    return {
      success: false,
      results,
      errors: [{ operation: 'general', error: error.message }]
    };
  }
}

/**
 * Test authorization rules
 * @returns {Promise<{success: boolean, results: object, errors: array}>}
 */
export async function testAuthorizationRules() {
  const results = {
    ownerAccess: null,
    adminAccess: null,
    unauthorizedAccess: null,
    errors: []
  };

  try {
    const user = await getCurrentUser();
    const userType = await getUserType();

    // Test owner access (user can read their own profile)
    try {
      const { data, errors } = await client.models.ModelProfile.list({
        filter: { userId: { eq: user.userId } }
      });

      if (errors) {
        results.errors.push({ test: 'ownerAccess', errors });
      } else {
        results.ownerAccess = { success: true, canAccess: true };
      }
    } catch (error) {
      results.errors.push({ test: 'ownerAccess', error: error.message });
    }

    // Test admin access (if user is admin)
    if (userType === 'Admin') {
      try {
        const { data, errors } = await client.models.ModelProfile.list();

        if (errors) {
          results.errors.push({ test: 'adminAccess', errors });
        } else {
          results.adminAccess = { success: true, canAccess: true };
        }
      } catch (error) {
        results.errors.push({ test: 'adminAccess', error: error.message });
      }
    }

    return {
      success: results.ownerAccess?.success && (userType !== 'Admin' || results.adminAccess?.success),
      results,
      errors: results.errors
    };
  } catch (error) {
    return {
      success: false,
      results,
      errors: [{ test: 'general', error: error.message }]
    };
  }
}

/**
 * Run all database tests
 * @returns {Promise<{modelProfile: object, professional: object, authorization: object}>}
 */
export async function runAllDatabaseTests() {
  const userType = await getUserType();
  
  const tests = {
    modelProfile: null,
    professional: null,
    partner: null,
    authorization: null,
  };

  // Test ModelProfile CRUD
  if (userType === 'Model' || userType === 'Admin') {
    tests.modelProfile = await testModelProfileCRUD();
  }

  // Test Professional CRUD
  if (userType === 'Professional' || userType === 'Admin') {
    tests.professional = await testProfessionalCRUD();
  }

  // Test authorization
  tests.authorization = await testAuthorizationRules();

  return tests;
}

