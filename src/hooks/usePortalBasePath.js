import { useDemoPortal } from '../context/DemoAuthContext';

/** Base path for portal nav links: /demo/seraphina or /model-portal, etc. */
export function usePortalBasePath(fallback) {
  const demo = useDemoPortal();
  return demo?.basePath || fallback;
}
