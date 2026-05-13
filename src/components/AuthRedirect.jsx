import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getRedirectPath } from '../utils/authUtils';

/**
 * AuthRedirect Component
 * 
 * Automatically redirects users to their appropriate portal after login
 * based on their Cognito user group (Model, Professional, Partner, Admin)
 */
export default function AuthRedirect() {
  const { user, authStatus } = useAuthenticator();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (authStatus === 'authenticated' && user && !redirected) {
      getRedirectPath().then((path) => {
        setRedirected(true);
        navigate(path, { replace: true });
      });
    }
  }, [authStatus, user, navigate, redirected]);

  return null; // This component doesn't render anything
}

