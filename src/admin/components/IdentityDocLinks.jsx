import React, { useState, useEffect } from 'react';
import { resolveStorageUrl } from '../../utils/resolveStorageUrl';

const linkStyle = {
  padding: '0.5rem 1rem',
  background: 'rgba(102,126,234,0.2)',
  border: '1px solid #667eea',
  borderRadius: '8px',
  color: '#667eea',
  fontSize: '0.9rem',
  textDecoration: 'none',
};

const thumbStyle = {
  maxWidth: '220px',
  maxHeight: '160px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.15)',
  objectFit: 'cover',
};

/**
 * Resolves S3 keys to presigned URLs and shows ID + selfie for admin review.
 */
export default function IdentityDocLinks({ idDocumentUrl, verificationSelfieUrl }) {
  const [idUrl, setIdUrl] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [idResolved, selfieResolved] = await Promise.all([
        idDocumentUrl ? resolveStorageUrl(idDocumentUrl) : null,
        verificationSelfieUrl ? resolveStorageUrl(verificationSelfieUrl) : null,
      ]);
      if (!cancelled) {
        setIdUrl(idResolved);
        setSelfieUrl(selfieResolved);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [idDocumentUrl, verificationSelfieUrl]);

  if (!idDocumentUrl && !verificationSelfieUrl) return null;

  if (loading) {
    return <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Loading verification images…</p>;
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {idUrl && (
          <a href={idUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            View ID Document
          </a>
        )}
        {selfieUrl && (
          <a href={selfieUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            View Selfie
          </a>
        )}
        {!idUrl && idDocumentUrl && (
          <span style={{ fontSize: '0.8rem', color: '#ffc107' }}>ID on file (could not load preview)</span>
        )}
        {!selfieUrl && verificationSelfieUrl && (
          <span style={{ fontSize: '0.8rem', color: '#ffc107' }}>Selfie on file (could not load preview)</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {idUrl && (
          <a href={idUrl} target="_blank" rel="noopener noreferrer">
            <img src={idUrl} alt="ID document" style={thumbStyle} />
          </a>
        )}
        {selfieUrl && (
          <a href={selfieUrl} target="_blank" rel="noopener noreferrer">
            <img src={selfieUrl} alt="Verification selfie" style={thumbStyle} />
          </a>
        )}
      </div>
    </div>
  );
}
