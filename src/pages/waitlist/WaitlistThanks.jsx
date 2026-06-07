import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const roleCopy = {
  model: 'model waitlist',
  professional: 'professional waitlist',
  partner: 'partner inquiry',
};

const appliedCopy = {
  model:
    "Thanks — your model profile is submitted. We'll review your details and photos and email you when you're approved or if we need anything else.",
  professional:
    "Thanks — your professional application is submitted. We'll review your credentials and portfolio and email you when you're approved or if we need anything else.",
  partner:
    "Thanks — your partner inquiry is submitted. We'll review your business details and reach out when you're approved or if we need anything else.",
};

export default function WaitlistThanks() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get('role') || '';
  const applied = params.get('applied') === '1';
  const label = roleCopy[role] || 'waitlist';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFEF9',
        color: '#4A2A1A',
        fontFamily: '"Alike", "Georgia", serif',
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
        }}
      >
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#8B1E3F', marginBottom: '1rem', letterSpacing: '0.08em' }}>
          MODELED
        </div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4A2A1A' }}>
          {applied && appliedCopy[role] ? 'Application received' : "You're on the list"}
        </h1>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#5A3A2A', marginBottom: '2rem' }}>
          {applied && appliedCopy[role]
            ? appliedCopy[role]
            : `Thanks for submitting your ${label}. We're onboarding in small waves and will reach out at the email you provided.`}
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            padding: '0.9rem 2rem',
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
          Back to home
        </button>
      </div>
    </div>
  );
}
