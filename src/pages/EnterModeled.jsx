import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsAdmin, useStrictAdmin } from '../components/ProtectedRoute';

export default function EnterModeled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { isAdmin: strictAdmin, isLoading: strictLoading } = useStrictAdmin();
  const fullAppAccess = import.meta.env.VITE_FULL_APP_ACCESS === 'true';
  const portalsOpen = fullAppAccess || strictAdmin;

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);

    if (role === 'model') {
      navigate('/model-portal');
    } else if (role === 'professional') {
      navigate('/portal');
    } else if (role === 'partner') {
      navigate('/partner-portal');
    } else if (role === 'admin') {
      navigate('/admin');
    }
  };

  useEffect(() => {
    if (!portalsOpen || strictLoading) return;
    const roleParam = searchParams.get('role');
    if (roleParam && ['model', 'professional', 'partner', 'admin'].includes(roleParam)) {
      if (roleParam === 'admin' && !isAdminLoading && !isAdmin) {
        return;
      }
      handleRoleSelect(roleParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAdmin, isAdminLoading, portalsOpen, strictLoading]);

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#FFFEF9', // Ivory
      padding: '2rem 1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '600',
      color: '#8B1E3F', // Cherry
      marginBottom: '0.75rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#5A3A2A', // Muted brown
      lineHeight: '1.6',
      fontFamily: '"Alike", "Georgia", serif',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      marginTop: '2rem',
    },
    card: {
      background: 'rgba(255, 254, 249, 0.6)', // Semi-transparent ivory
      borderRadius: '24px',
      padding: '2rem',
      border: '1px solid rgba(139, 30, 63, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 15px rgba(139, 30, 63, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
      position: 'relative',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)',
    },
    cardHover: {
      borderColor: 'rgba(212, 133, 138, 0.3)', // Lighter cherry red, more transparent
      boxShadow: '0 8px 30px rgba(212, 133, 138, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      transform: 'translateY(-4px)',
      background: 'linear-gradient(135deg, rgba(212, 133, 138, 0.08), rgba(232, 180, 184, 0.04))',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#8B1E3F', // Cherry
      marginBottom: '0.75rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    cardDescription: {
      fontSize: '0.95rem',
      color: '#4A2A1A', // Dark brown
      lineHeight: '1.6',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    cardFeatures: {
      fontSize: '0.85rem',
      color: '#4A2A1A', // Dark brown for better contrast
      lineHeight: '1.8',
      fontFamily: '"Alike", "Georgia", serif',
    },
    featureItem: {
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
    },
    featureDot: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#D4858A', // Lighter cherry red for contrast
      marginTop: '0.4rem',
      flexShrink: 0,
    },
  };

  const roles = [
    {
      id: 'model',
      title: 'Model',
      description: 'Access your Cherry Desk, view bookings, track savings, and manage your profile.',
      features: [
        'View your bookings & sessions',
        'Track savings & rewards',
        'Manage your beauty profile',
        'Access exclusive services',
      ],
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Access your portal to manage clients, bookings, training, and grow your practice.',
      features: [
        'Manage clients & bookings',
        'Track chair revenue',
        'Access training resources',
        'Build your portfolio',
      ],
    },
    {
      id: 'partner',
      title: 'Partner',
      description: 'Access your salon dashboard to manage your team, revenue, and business operations.',
      features: [
        'Manage your salon team',
        'Track revenue & analytics',
        'View training sessions',
        'Access business tools',
      ],
    },
    ...(isAdmin ? [{
      id: 'admin',
      title: 'Admin',
      description: 'Access the admin dashboard to approve models & professionals, manage matches, and oversee operations.',
      features: [
        'Approve models & professionals',
        'Manage requests & matches',
        'View bookings & calendar',
        'Oversee platform operations',
      ],
    }] : []),
  ];

  if (strictLoading) {
    return (
      <div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Loading…</p>
      </div>
    );
  }

  if (!portalsOpen) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.content, maxWidth: '560px', margin: '0 auto', textAlign: 'center', paddingTop: '3rem' }}>
          <h1 style={styles.title}>Enter Modeled</h1>
          <p style={{ ...styles.subtitle, marginBottom: '2rem' }}>
            Team sign-in and dashboards are limited right now.
          </p>
          <button
            type="button"
            onClick={() => navigate('/join')}
            style={{
              padding: '1rem 2.5rem',
              fontSize: '1.05rem',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#FFFEF9',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Join
          </button>
          <div style={{ marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.95rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 30, 63, 0.3)',
                background: 'transparent',
                color: '#8B1E3F',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}
            >
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Enter Modeled</h1>
          <p style={styles.subtitle}>
            Select your role to sign in to your portal.
          </p>
        </div>

        <div style={styles.cardsContainer}>
          {roles.map((role) => (
            <div
              key={role.id}
              style={styles.card}
              onClick={() => handleRoleSelect(role.id)}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.cardHover);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.08)';
                e.currentTarget.style.boxShadow = '0 2px 15px rgba(139, 30, 63, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 254, 249, 0.6)';
              }}
            >
              <h2 style={styles.cardTitle}>{role.title}</h2>
              <p style={styles.cardDescription}>{role.description}</p>
              <div style={styles.cardFeatures}>
                {role.features.map((feature, idx) => (
                  <div key={idx} style={styles.featureItem}>
                    <div style={styles.featureDot}></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

