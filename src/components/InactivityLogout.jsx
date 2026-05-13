import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupInactivityLogout } from '../utils/authUtils';

/**
 * InactivityLogout Component
 * 
 * Automatically logs out users after a period of inactivity.
 * Tracks mouse, keyboard, scroll, and touch events.
 * 
 * @param {number} timeoutMinutes - Minutes of inactivity before logout (default: 30)
 * @param {string} redirectTo - Where to redirect after logout (default: '/')
 */
export default function InactivityLogout({ 
  timeoutMinutes = 30, 
  redirectTo = '/' 
}) {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    const cleanup = setupInactivityLogout(timeoutMs, () => {
      navigate(redirectTo);
    });

    // Cleanup on unmount
    return cleanup;
  }, [timeoutMinutes, redirectTo, navigate]);

  // This component doesn't render anything
  return null;
}

