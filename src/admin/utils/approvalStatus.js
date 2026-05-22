/** Shared admin approval status helpers for models & professionals */

export const REVIEW_QUEUE_STATUSES = ['pending_review', 'manual_review', 'needs_changes'];

export function normalizeApprovalStatus(status) {
  const value = String(status || '').toLowerCase();
  if (!value) return 'pending_review';
  if (value === 'pending') return 'pending_review';
  if (value === 'active') return 'approved';
  return value;
}

export function needsAdminReview(status) {
  return REVIEW_QUEUE_STATUSES.includes(normalizeApprovalStatus(status));
}

export function identityNeedsReview(identityStatus) {
  const v = String(identityStatus || '').toLowerCase();
  return !v || v === 'pending' || v === 'manual_review' || v === 'failed';
}
