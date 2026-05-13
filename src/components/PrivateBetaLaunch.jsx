import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Shown to signed-in users who are not in the Admin group while the product is in waitlist-only launch.
 * Admins and optional VITE_FULL_APP_ACCESS bypass this elsewhere.
 */
export default function PrivateBetaLaunch({ signOut }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFEF9',
        color: '#4A2A1A',
        fontFamily: '"Alike", "Georgia", serif',
        padding: '2rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#8B1E3F', marginBottom: '1.25rem', letterSpacing: '0.06em' }}>
          MODELED
        </div>
        <h1 style={{ fontSize: '1.45rem', marginBottom: '1rem', color: '#4A2A1A' }}>Modeled</h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.65, color: '#5A3A2A', marginBottom: '1.75rem' }}>
          Sign in access is limited right now. Please return to the main Modeled experience.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => navigate('/join')}
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#FFFEF9',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Join
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              borderRadius: '10px',
              border: '1px solid rgba(139, 30, 63, 0.35)',
              background: 'transparent',
              color: '#8B1E3F',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => signOut?.()}
            style={{
              padding: '0.65rem',
              fontSize: '0.9rem',
              border: 'none',
              background: 'transparent',
              color: '#5A3A2A',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
