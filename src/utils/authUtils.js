/**
 * Authentication Utilities
 * Helper functions for authentication, session management, and user type detection
 */

import { fetchAuthSession, signOut, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

/**
 * Get current user's Cognito groups
 * @returns {Promise<string[]>} Array of group names
 */
export async function getUserGroups() {
  try {
    const session = await fetchAuthSession();
    const groups = session.tokens?.idToken?.payload?.['cognito:groups'] || [];
    return groups;
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}

/**
 * Get current user's primary user type (Model, Professional, Partner, Admin)
 * @returns {Promise<string|null>} User type or null
 */
export async function getUserType() {
  try {
    const groups = await getUserGroups();
    // Priority: Admin > Partner > Professional > Model
    if (groups.includes('Admin')) return 'Admin';
    if (groups.includes('Partner')) return 'Partner';
    if (groups.includes('Professional')) return 'Professional';
    if (groups.includes('Model')) return 'Model';
    return null;
  } catch (error) {
    console.error('Error getting user type:', error);
    return null;
  }
}

/**
 * Check if user is admin
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
  const groups = await getUserGroups();
  return groups.includes('Admin');
}

/**
 * Get redirect path based on user type
 * @returns {Promise<string>} Path to redirect to
 */
export async function getRedirectPath() {
  const userType = await getUserType();
  
  switch (userType) {
    case 'Admin':
      return '/admin';
    case 'Model':
      return '/model-portal';
    case 'Professional':
      return '/portal';
    case 'Partner':
      return '/partner-portal';
    default:
      return '/';
  }
}

/**
 * Handle auto-logout after inactivity
 * @param {number} inactivityTimeout - Timeout in milliseconds (default: 30 minutes)
 * @param {Function} onLogout - Callback when user is logged out
 */
export function setupInactivityLogout(inactivityTimeout = 30 * 60 * 1000, onLogout = null) {
  let inactivityTimer = null;
  let lastActivity = Date.now();

  const resetTimer = () => {
    lastActivity = Date.now();
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    
    inactivityTimer = setTimeout(async () => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity >= inactivityTimeout) {
        // User has been inactive, log them out
        try {
          await signOut();
          if (onLogout) {
            onLogout();
          } else {
            // Default: redirect to home
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Error during auto-logout:', error);
        }
      }
    }, inactivityTimeout);
  };

  // Track user activity
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
  
  activityEvents.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });

  // Initialize timer
  resetTimer();

  // Return cleanup function
  return () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    activityEvents.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
  };
}

/**
 * Handle duplicate email errors during sign-up
 * @param {Error} error - The error object
 * @returns {string|null} User-friendly error message or null
 */
export function handleDuplicateEmailError(error) {
  if (!error || !error.message) return null;

  const errorMessage = error.message.toLowerCase();
  
  // Cognito error codes for duplicate emails
  if (
    errorMessage.includes('already exists') ||
    errorMessage.includes('already registered') ||
    errorMessage.includes('user already exists') ||
    error.code === 'UsernameExistsException' ||
    error.name === 'UsernameExistsException'
  ) {
    return 'An account with this email already exists. Please sign in instead or use a different email address.';
  }

  return null;
}

/**
 * Check if user has accepted privacy policy
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function hasAcceptedPrivacyPolicy(userId) {
  try {
    // Check in user's profile (ModelProfile, Professional, or Partner)
    // This would need to be implemented based on your schema
    // For now, we'll check if user has completed onboarding (which includes privacy acceptance)
    
    // Try ModelProfile first
    const { data: modelProfile } = await client.models.ModelProfile.list({
      filter: { userId: { eq: userId } }
    });
    
    if (modelProfile && modelProfile.length > 0) {
      return modelProfile[0].termsAccepted === true;
    }

    // Try Professional
    const { data: professional } = await client.models.Professional.list({
      filter: { userId: { eq: userId } }
    });
    
    if (professional && professional.length > 0) {
      return professional[0].termsAccepted === true;
    }

    // Try Partner
    const { data: partner } = await client.models.Partner.list({
      filter: { userId: { eq: userId } }
    });
    
    if (partner && partner.length > 0) {
      return partner[0].termsAccepted === true;
    }

    return false;
  } catch (error) {
    console.error('Error checking privacy policy acceptance:', error);
    return false;
  }
}

/**
 * Verify user session is still valid
 * @returns {Promise<boolean>}
 */
export async function verifySession() {
  try {
    const session = await fetchAuthSession();
    return !!session.tokens;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user ID
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserId() {
  try {
    const user = await getCurrentUser();
    return user.userId || user.username || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Cognito sub for ModelProfile.userId — use on create AND list (never email).
 * @param {object|null|undefined} user - useAuthenticator().user
 * @returns {string|null}
 */
export function getAuthenticatorUserId(user) {
  if (!user) return null;
  return user.userId || user.username || user.userSub || null;
}

