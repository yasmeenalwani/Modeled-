/**
 * Normalize an S3 object key from a storage path or presigned/https URL.
 */
export function toS3StorageKey(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const raw = urlOrKey.trim();
  if (!raw.includes('://')) {
    return raw.replace(/^\//, '').split('?')[0];
  }
  try {
    const u = new URL(raw);
    const pathname = decodeURIComponent(u.pathname.replace(/^\//, ''));
    if (pathname.startsWith('identity-verification/') || pathname.startsWith('public/identity-verification/')) {
      return pathname.split('?')[0];
    }
    if (u.hostname.includes('amazonaws.com')) {
      const match = raw.match(/amazonaws\.com\/(.+?)(?:\?|$)/);
      if (match) return decodeURIComponent(match[1]).split('?')[0];
    }
    return pathname.split('?')[0] || null;
  } catch {
    return raw.split('?')[0];
  }
}
