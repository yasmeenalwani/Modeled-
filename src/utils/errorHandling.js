/**
 * STANDARDIZED ERROR HANDLING UTILITIES
 * 
 * Centralized error handling patterns to prevent common errors
 * and ensure consistent error handling across the application
 */

/**
 * Safe async operation wrapper
 * Prevents unhandled promise rejections
 * 
 * @param {Function} operation - Async function to execute
 * @param {*} defaultValue - Value to return on error
 * @param {Function} onError - Optional error handler
 * @returns {Promise} Result or defaultValue
 */
export async function safeAsync(operation, defaultValue = null, onError = null) {
  try {
    return await operation();
  } catch (error) {
    if (onError) {
      onError(error);
    } else {
      console.error('Safe async operation failed:', error);
    }
    return defaultValue;
  }
}

/**
 * Safe database query wrapper
 * Handles database errors gracefully with mock data fallback
 * 
 * @param {Function} queryFn - Database query function
 * @param {Function} mockFn - Mock data fallback function
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise} Query result or mock data
 */
export async function safeDbQuery(queryFn, mockFn, operationName = 'database operation') {
  try {
    const result = await queryFn();
    return result;
  } catch (error) {
    console.warn(`[${operationName}] Database query failed, using mock data:`, error);
    if (mockFn) {
      try {
        return await mockFn();
      } catch (mockError) {
        console.error(`[${operationName}] Mock data fallback also failed:`, mockError);
        return null;
      }
    }
    return null;
  }
}

/**
 * Validate required parameters
 * Throws descriptive error if validation fails
 * 
 * @param {Object} params - Parameters to validate
 * @param {Array<string>} required - Required parameter names
 * @param {string} context - Context for error message
 * @throws {Error} If validation fails
 */
export function validateRequired(params, required, context = 'operation') {
  const missing = required.filter(key => params[key] === undefined || params[key] === null);
  if (missing.length > 0) {
    throw new Error(
      `[${context}] Missing required parameters: ${missing.join(', ')}`
    );
  }
}

/**
 * Safe object property access
 * Returns defaultValue if property doesn't exist
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Dot-separated path (e.g., 'user.profile.name')
 * @param {*} defaultValue - Default value if path doesn't exist
 * @returns {*} Property value or defaultValue
 */
export function safeGet(obj, path, defaultValue = null) {
  try {
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Error logger with context
 * Provides consistent error logging format
 * 
 * @param {Error} error - Error to log
 * @param {string} context - Context where error occurred
 * @param {Object} metadata - Additional metadata
 */
export function logError(error, context, metadata = {}) {
  const errorInfo = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    context,
    ...metadata,
    timestamp: new Date().toISOString(),
  };
  
  console.error(`[ERROR:${context}]`, errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Retry operation with exponential backoff
 * 
 * @param {Function} operation - Operation to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Operation result
 */
export async function retryOperation(operation, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt);
        console.warn(`Operation failed, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * Create a safe function wrapper
 * Wraps any function with error handling
 * 
 * @param {Function} fn - Function to wrap
 * @param {*} defaultValue - Default return value on error
 * @param {string} functionName - Name for logging
 * @returns {Function} Wrapped function
 */
export function safeFunction(fn, defaultValue = null, functionName = fn.name || 'anonymous') {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, functionName, { args });
      return defaultValue;
    }
  };
}
