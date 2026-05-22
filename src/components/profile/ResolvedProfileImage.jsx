import React, { useState, useEffect } from 'react';
import { resolveModelPhotoUrl } from '../../utils/modelPhotoResolver';

const defaultFallback = {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '700',
  color: '#FFFEF9',
};

/**
 * Resolves S3 keys / presigned URLs for profile and gallery images.
 */
export default function ResolvedProfileImage({
  photoRef,
  name,
  style,
  alt,
  fallbackStyle,
  fallbackFontSize = '2rem',
}) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setUrl(null);

    (async () => {
      const resolved = await resolveModelPhotoUrl(photoRef);
      if (!cancelled) {
        setUrl(resolved);
        if (!resolved) setFailed(true);
      }
    })();

    return () => { cancelled = true; };
  }, [photoRef]);

  const initial = (name || '?').charAt(0).toUpperCase();

  if (failed || !url) {
    return (
      <div style={{ ...defaultFallback, ...fallbackStyle, fontSize: fallbackFontSize }}>
        {initial}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={alt || `${name || 'Profile'} photo`}
      style={style}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
