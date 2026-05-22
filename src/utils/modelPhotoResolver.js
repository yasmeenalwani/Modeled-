import { getUrl, list } from 'aws-amplify/storage';
import { resolveStorageUrl } from './resolveStorageUrl';
import { toS3StorageKey } from './s3StorageKey';

/**
 * Resolve a model photo reference (S3 key, presigned URL, or /public path) for <img src>.
 */
export async function resolveModelPhotoUrl(urlOrKey) {
  if (!urlOrKey || typeof urlOrKey !== 'string') return null;
  const trimmed = urlOrKey.trim();
  if (!trimmed) return null;

  // Vite public folder paths
  if (trimmed.startsWith('/')) return trimmed;

  // Stable external URLs (not expired S3 presigns)
  if (/^https?:\/\//i.test(trimmed) && !trimmed.includes('amazonaws.com')) {
    return trimmed;
  }

  const resolved = await resolveStorageUrl(trimmed);
  if (resolved) return resolved;

  const key = toS3StorageKey(trimmed);
  if (key) {
    const fromKey = await resolveStorageUrl(key);
    if (fromKey) return fromKey;
  }

  return null;
}

/**
 * Pick the best cover photo URL for a ModelProfile record.
 */
export async function resolveModelCoverPhoto(profile) {
  if (!profile) return null;

  const candidates = [
    profile.headshotUrl,
    ...(Array.isArray(profile.photoUrls) ? profile.photoUrls : []),
    ...(Array.isArray(profile.photoKeys) ? profile.photoKeys : []),
  ].filter(Boolean);

  let photoMetadata = profile.photoMetadata;
  if (typeof photoMetadata === 'string') {
    try {
      photoMetadata = JSON.parse(photoMetadata);
    } catch {
      photoMetadata = {};
    }
  }
  if (photoMetadata && typeof photoMetadata === 'object') {
    Object.values(photoMetadata).forEach((entry) => {
      if (entry?.key) candidates.push(entry.key);
      if (entry?.url) candidates.push(entry.url);
    });
  }

  for (const candidate of candidates) {
    const url = await resolveModelPhotoUrl(candidate);
    if (url) return url;
  }

  if (profile.userId) {
    const prefixes = [
      `profile-photos/models/${profile.userId}/`,
      `public/profile-photos/models/${profile.userId}/`,
    ];
    for (const prefix of prefixes) {
      try {
        const listed = await list({ path: prefix });
        const first = (listed?.items || []).find((item) => item?.path);
        if (!first?.path) continue;
        const url = await resolveModelPhotoUrl(first.path);
        if (url) return url;
      } catch {
        /* try next prefix */
      }
    }
  }

  return null;
}

/** Ordered unique photo refs from a mapped model or profile (keys + URLs). */
export function collectModelPhotoRefs(model) {
  if (!model) return [];
  const refs = [];
  const add = (value) => {
    if (value == null || value === '') return;
    const s = String(value).trim();
    if (!s || refs.includes(s)) return;
    refs.push(s);
  };

  add(model.headshotUrl);
  if (Array.isArray(model.photoUrls)) model.photoUrls.forEach(add);
  if (Array.isArray(model.photoKeys)) model.photoKeys.forEach(add);

  let metadata = model.photoMetadata;
  if (typeof metadata === 'string') {
    try {
      metadata = JSON.parse(metadata);
    } catch {
      metadata = {};
    }
  }
  if (metadata && typeof metadata === 'object') {
    Object.values(metadata).forEach((entry) => {
      add(entry?.key);
      add(entry?.url);
    });
  }

  return refs;
}
