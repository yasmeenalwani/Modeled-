import { useContext } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { DemoAuthContext } from '../context/DemoAuthContext';
import { deactivateDemoPortal } from '../utils/demoPortalMode';

/**
 * Auth for portal pages — uses demo persona on /demo/* routes, else Cognito.
 */
export function usePortalAuth() {
  const demo = useContext(DemoAuthContext);
  if (demo?.user) {
    return {
      user: demo.user,
      signOut: () => {
        deactivateDemoPortal();
        window.location.href = '/demo';
      },
      route: 'authenticated',
    };
  }
  return useAuthenticator();
}
