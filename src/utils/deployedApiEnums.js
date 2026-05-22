/**
 * Enums accepted by the currently deployed Amplify API (see deploy/ci-amplify-outputs.json).
 * Local schema may include manual_review, needs_changes, etc. — map those before create.
 */

export const DEPLOYED_PROFILE_STATUSES = new Set(['pending', 'approved', 'active', 'inactive']);

/**
 * @param {string|null|undefined} status - draft or form status
 * @param {'pending'|'approved'} defaultStatus - fallback when unknown
 */
export function normalizeDeployedProfileStatus(status, defaultStatus = 'pending') {
  if (status && DEPLOYED_PROFILE_STATUSES.has(status)) return status;
  if (status === 'manual_review' || status === 'needs_changes') return defaultStatus;
  if (status === 'rejected') return 'inactive';
  return defaultStatus;
}
