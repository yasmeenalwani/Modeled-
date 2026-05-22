import { getUrl } from 'aws-amplify/storage';
import { toS3StorageKey } from './s3StorageKey';

/**
 * Resolve an S3 key or URL to a browser-openable HTTPS URL (presigned when needed).
 */
export async function resolveStorageUrl(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const trimmed = urlOrKey.trim();
  if (/^https?:\/\//i.test(trimmed) && !trimmed.includes('amazonaws.com')) {
    return trimmed;
  }
  const key = toS3StorageKey(trimmed) || trimmed.replace(/^\//, '').split('?')[0];
  if (!key) return null;
  const candidates = [key];
  if (!key.startsWith('public/')) candidates.push(`public/${key}`);
  for (const path of candidates) {
    try {
      const result = await getUrl({ path });
      return result?.url?.toString() || null;
    } catch {
      /* try next path */
    }
  }
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}
