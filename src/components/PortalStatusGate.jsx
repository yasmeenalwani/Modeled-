import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData } from '../utils/mockDataService';
import { getAuthenticatorUserId } from '../utils/authUtils';
import { isDemoPortalActive } from '../utils/demoPortalMode';

const client = generateClient();

const ALLOWED_STATUSES = ['approved', 'active'];

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  card: {
    maxWidth: '480px',
    padding: '2.5rem',
    borderRadius: '16px',
    textAlign: 'center',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    boxShadow: '0 4px 24px rgba(139, 30, 63, 0.08)',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  message: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#5A3A2A',
    marginBottom: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  signOutBtn: {
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    background: 'rgba(139, 30, 63, 0.08)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  loading: {
    fontSize: '1rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

/**
 * PortalStatusGate – gates portal access by profile status.
 * Only allows entry when status is 'approved' or 'active'.
 * Shows pending/inactive/no-profile screens otherwise.
 *
 * @param {string} userType - 'model' | 'professional' | 'partner'
 * @param {React.ReactNode} children - Content to render when gate passes (default: <Outlet />)
 */
export default function PortalStatusGate({ userType, children }) {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wrongPortal, setWrongPortal] = useState(null); // { redirectTo: '/model-portal' } when user has different profile

  const userId = getAuthenticatorUserId(user);

  useEffect(() => {
    if (isDemoPortalActive()) {
      setLoading(false);
      setStatus('active');
      return;
    }
    const mockMode = shouldUseMockData();
    const devMode = import.meta.env.DEV;
    if (!userId || mockMode || devMode) {
      setLoading(false);
      setStatus('active'); // Allow through in mock mode or local dev
      return;
    }

    let mounted = true;
    const fetchStatus = async () => {
      try {
        const ModelProfile = client?.models?.ModelProfile;
        const Professional = client?.models?.Professional;
        const Partner = client?.models?.Partner;

        if (!ModelProfile?.list || !Professional?.list || !Partner?.list) {
          // Schema not synced (e.g. amplify_outputs has old/demo schema) – allow through for dev
          if (mounted) setStatus('active');
          return;
        }

        const filter = { filter: { userId: { eq: userId } }, limit: 1 };
        const [modelRes, proRes, partnerRes] = await Promise.all([
          ModelProfile.list(filter),
          Professional.list(filter),
          Partner.list(filter),
        ]);
        const hasModel = modelRes?.data?.[0];
        const hasPro = proRes?.data?.[0];
        const hasPartner = partnerRes?.data?.[0];

        const model = userType === 'model' ? ModelProfile : userType === 'professional' ? Professional : Partner;
        const data = userType === 'model' ? modelRes?.data : userType === 'professional' ? proRes?.data : partnerRes?.data;

        if (mounted && data?.[0]) {
          setStatus(data[0].status || 'pending');
          setWrongPortal(null);
          return;
        }

        // No profile for this portal type – check if they have a different profile (wrong portal)
        if (mounted && (hasModel || hasPro || hasPartner)) {
          if (hasModel && userType !== 'model') {
            setWrongPortal({ redirectTo: '/model-portal', label: 'Model' });
          } else if (hasPro && userType !== 'professional') {
            setWrongPortal({ redirectTo: '/portal', label: 'Professional' });
          } else if (hasPartner && userType !== 'partner') {
            setWrongPortal({ redirectTo: '/partner-portal', label: 'Partner' });
          }
        }
        if (mounted) setStatus(null);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setStatus(null);
          setWrongPortal(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatus();
    return () => { mounted = false; };
  }, [userId, userType]);

  // Redirect to correct portal when user has different profile type
  useEffect(() => {
    if (wrongPortal?.redirectTo) {
      navigate(wrongPortal.redirectTo, { replace: true });
    }
  }, [wrongPortal?.redirectTo, navigate]);

  const handleSignOut = async () => {
    const { signOut } = await import('aws-amplify/auth');
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⚠️</div>
          <div style={styles.title}>Something went wrong</div>
          <div style={styles.message}>{error}</div>
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (ALLOWED_STATUSES.includes(status)) {
    return children || <Outlet />;
  }

  if (status === 'pending') {
    const onboardingPath =
      userType === 'model' ? '/onboard/model' :
      userType === 'professional' ? '/onboard/professional' :
      '/onboard/partner';
    const portalLabel =
      userType === 'model' ? 'Model' :
      userType === 'professional' ? 'Professional' :
      'Partner';

    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⏳</div>
          <div style={styles.title}>Application Under Review</div>
          <div style={styles.message}>
            Your {portalLabel} application is being reviewed by our team.
            You'll get an email when your account is approved. Usually within 1–2 business days.
          </div>
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (status === 'inactive') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <div style={styles.title}>Account Inactive</div>
          <div style={styles.message}>
            Your account is currently inactive. Please contact support if you believe this is an error.
          </div>
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // User has a different profile type – show redirect message (useEffect above does the redirect)
  if (status === null && wrongPortal) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Redirecting to your {wrongPortal.label} portal...</div>
      </div>
    );
  }

  // No profile (null) – redirect to onboarding
  const onboardingPath =
    userType === 'model' ? '/onboard/model' :
    userType === 'professional' ? '/onboard/professional' :
    '/onboard/partner';
  const portalLabel =
    userType === 'model' ? 'Model' :
    userType === 'professional' ? 'Professional' :
    'Partner';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📋</div>
        <div style={styles.title}>Complete Your Application</div>
        <div style={styles.message}>
          You need to complete the {portalLabel} onboarding before accessing the portal.
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            style={{ ...styles.signOutBtn, background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', color: '#FFFEF9' }}
            onClick={() => navigate(onboardingPath)}
          >
            Go to Onboarding
          </button>
          <button style={styles.signOutBtn} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
