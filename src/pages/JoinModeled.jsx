import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function JoinModeled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRoleSelect = (role) => {
    localStorage.setItem('selectedRole', role);

    const intendedRoute = localStorage.getItem('intendedRoute');
    if (intendedRoute) {
      localStorage.removeItem('intendedRoute');
      const intendedRole = intendedRoute.split('/').pop();
      if (intendedRole === role) {
        navigate(intendedRoute);
      } else {
        navigate(`/onboard/${role}`);
      }
    } else {
      navigate(`/onboard/${role}`);
    }
  };

  // Check for role in URL params (for deep linking)
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['model', 'professional', 'partner'].includes(roleParam)) {
      handleRoleSelect(roleParam);
    }
  }, [searchParams]);

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
      description: 'Join as a Model and access affordable beauty services while helping professionals grow.',
      features: [
        'Track bookings & savings',
        'Earn XP & unlock rewards',
        'Access exclusive services',
        'Build your beauty profile',
      ],
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Join as a Professional to practice skills, build your portfolio, and grow your client base.',
      features: [
        'Manage clients & bookings',
        'Track chair revenue',
        'Build your portfolio',
        'Access training resources',
      ],
    },
    {
      id: 'partner',
      title: 'Partner',
      description: 'Join as a Partner salon to host professionals, manage your team, and grow your business.',
      features: [
        'Manage your salon team',
        'Track revenue & analytics',
        'Host training sessions',
        'Access business tools',
      ],
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Join Modeled</h1>
          <p style={styles.subtitle}>
            Choose Model, Professional, or Partner to start the full application—all profile questions and steps are unchanged.
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

