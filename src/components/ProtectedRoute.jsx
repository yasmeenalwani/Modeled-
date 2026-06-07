import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { fetchAuthSession } from 'aws-amplify/auth';
import { isLocalDevHost } from '../utils/isLocalDevHost';

/**
 * ProtectedRoute Component
 * 
 * Protects routes based on Cognito user groups.
 * Redirects unauthorized users silently - they won't even know the route exists.
 * 
 * @param {ReactNode} children - The protected content to render
 * @param {string[]} allowedGroups - Array of Cognito group names allowed to access
 * @param {string} redirectTo - Where to redirect unauthorized users (default: /)
 */
export default function ProtectedRoute({ 
  children, 
  allowedGroups = [], 
  redirectTo = '/' 
}) {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const devBypass = isLocalDevHost() && import.meta.env?.VITE_DEV_ADMIN_BYPASS !== 'false';

      // Dev bypass: on localhost, allow access to admin (like before protection was added)
      if (allowedGroups.includes('Admin') && devBypass) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      const session = await fetchAuthSession();
      const tokens = session.tokens;
      
      if (!tokens) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Get groups from the ID token
      const groups = tokens.idToken?.payload?.['cognito:groups'] || [];
      
      // Check if user belongs to any of the allowed groups
      const hasAccess = allowedGroups.some(group => groups.includes(group));
      
      setIsAuthorized(hasAccess);
      setIsLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthorized(false);
      setIsLoading(false);
    }
  };

  // Show nothing while checking (keeps it secret)
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0d14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#e94560',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Silently redirect unauthorized users - they'll never know the route existed
  if (!isAuthorized) {
    return <Navigate to={redirectTo} replace />;
  }

  // Authorized - render the protected content
  return children;
}

/**
 * Hook to check if current user is an admin
 * Useful for conditionally showing UI elements
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const session = await fetchAuthSession();
      const tokens = session.tokens;
      if (!tokens) {
        setIsAdmin(isLocalDevHost());
        return;
      }
      const groups = tokens.idToken?.payload?.['cognito:groups'] || [];
      let admin = groups.includes('Admin');
      if (isLocalDevHost() && !admin) admin = true;
      setIsAdmin(admin);
    } catch (error) {
      setIsAdmin(isLocalDevHost());
    } finally {
      setIsLoading(false);
    }
  };

  return { isAdmin, isLoading };
}

/**
 * Admin check without localhost dev bypass — use for waitlist launch gating so non-admins
 * don't see portals in local dev either (unless VITE_FULL_APP_ACCESS is set).
 */
export function useStrictAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await fetchAuthSession();
        const tokens = session.tokens;
        if (!tokens) {
          if (!cancelled) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }
        const groups = tokens.idToken?.payload?.['cognito:groups'] || [];
        if (!cancelled) setIsAdmin(groups.includes('Admin'));
      } catch {
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isAdmin, isLoading };
}

