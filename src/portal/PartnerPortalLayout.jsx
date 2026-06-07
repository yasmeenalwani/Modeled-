import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { usePortalBasePath } from '../hooks/usePortalBasePath';
import { useDemoPortal } from '../context/DemoAuthContext';
import { usePortalAuth } from '../hooks/usePortalAuth';
import InactivityLogout from '../components/InactivityLogout.jsx';
import PortalStatusGate from '../components/PortalStatusGate.jsx';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
}

// ============ STYLES ============
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#FFFEF9', // Ivory
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Sidebar
  sidebar: {
    width: '280px',
    background: '#FFFEF9', // Ivory
    borderRight: '1px solid rgba(139, 30, 63, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxShadow: '2px 0 10px rgba(139, 30, 63, 0.05)',
  },
  sidebarHeader: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    flexShrink: 0,
    textAlign: 'center',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: '"Alike", "Georgia", serif',
  },
  logoSub: {
    fontSize: '0.65rem',
    color: '#5A3A2A', // Muted brown
    letterSpacing: '0.2em',
    marginTop: '0.15rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Salon profile
  salonSection: {
    padding: '1rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    flexShrink: 0,
  },
  salonLogo: {
    width: '50px',
    height: '50px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 auto 0.75rem',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
    border: '2px solid rgba(139, 30, 63, 0.2)',
  },
  salonName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.2rem',
    textAlign: 'center',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  salonLocation: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.4rem',
    textAlign: 'center',
    fontFamily: '"Alike", "Georgia", serif',
  },
  salonStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.65rem',
    fontWeight: '600',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    margin: '0 auto',
    justifyContent: 'center',
  },
  
  // Quick metrics
  quickMetrics: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    flexShrink: 0,
  },
  metric: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '6px',
    padding: '0.5rem',
    textAlign: 'center',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  metricValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  metricLabel: {
    fontSize: '0.65rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.2rem',
    lineHeight: '1.2',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Navigation
  nav: {
    padding: '0.5rem 0',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: 0,
  },
  navSection: {
    padding: '1.25rem 1.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#4A2A1A', // Dark brown - increased contrast
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.85rem 1.5rem',
    color: '#4A2A1A', // Dark brown
    textDecoration: 'none',
    fontSize: '0.9rem', // Slightly larger
    fontWeight: '500', // Added weight for better visibility
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    whiteSpace: 'nowrap',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItemActive: {
    color: '#8B1E3F', // Cherry
    background: 'rgba(139, 30, 63, 0.15)', // Slightly more visible background
    borderLeftColor: '#8B1E3F', // Cherry
    fontWeight: '600', // Bolder for active state
  },
  navIcon: {
    fontSize: '0.9rem',
    width: '18px',
    textAlign: 'center',
    flexShrink: 0,
  },
  navBadge: {
    marginLeft: 'auto',
    background: '#8B1E3F', // Cherry
    color: '#FFFEF9', // Ivory
    padding: '0.15rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.65rem',
    fontWeight: '600',
    flexShrink: 0,
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Sign out
  signOutSection: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
    flexShrink: 0,
  },
  signOutBtn: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.85rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Main content
  main: {
    flex: 1,
    marginLeft: '280px',
    minHeight: '100vh',
  },
};

// Navigation structure
const navSections = [
  {
    title: 'Overview',
    items: [
      { path: '/partner-portal', icon: '', label: 'Dashboard', end: true },
    ],
  },
  {
    title: 'Business',
    items: [
      { path: '/partner-portal/profile', icon: '', label: 'Salon Profile' },
      { path: '/partner-portal/services', icon: '', label: 'Service Menu' },
      { path: '/partner-portal/compliance', icon: '', label: 'Compliance' },
    ],
  },
  {
    title: 'Team',
    items: [
      { path: '/partner-portal/team', icon: '', label: 'My Team' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { path: '/partner-portal/schedule', icon: '', label: 'My Schedule', badge: '3' },
    ],
  },
  {
    title: 'Growth',
    items: [
      { path: '/partner-portal/campaigns', icon: '', label: 'Campaigns', badge: '2' },
      { path: '/partner-portal/conversions', icon: '', label: 'Model Conversions' },
    ],
  },
  {
    title: 'Financial',
    items: [
      { path: '/partner-portal/financials', icon: '', label: 'Financials' },
    ],
  },
  {
    title: 'Support',
    items: [
      { path: '/partner-portal/support', icon: '', label: 'Support' },
    ],
  },
];

// Mock salon data
const salonData = {
  name: 'Luxe Studio',
  location: 'Manhattan, NYC',
  status: 'Verified Partner',
  teamSize: 8,
  activeApps: 3,
  conversions: 24,
  rating: 4.9,
};

export default function PartnerPortalLayout() {
  const navigate = useNavigate();
  const demo = useDemoPortal();
  const { signOut: portalSignOut } = usePortalAuth();
  const basePath = usePortalBasePath('/partner-portal');
  const navSections = buildPartnerNavSections(basePath);
  const displaySalon = demo?.display?.salonName
    ? { ...salonData, name: demo.display.salonName }
    : salonData;
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSignOut = async () => {
    if (demo) {
      portalSignOut();
      return;
    }
    await signOut();
    navigate('/');
  };

  const sidebarStyle = isMobile
    ? {
        ...styles.sidebar,
        position: 'fixed',
        left: drawerOpen ? 0 : '-290px',
        top: 0,
        zIndex: 1000,
        transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
      }
    : styles.sidebar;

  const mainStyle = isMobile
    ? { flex: 1, marginLeft: 0, minHeight: '100vh', paddingTop: '56px' }
    : styles.main;

  return (
    <PortalStatusGate userType="partner">
    <div style={styles.container}>
      {!demo && <InactivityLogout timeoutMinutes={30} redirectTo="/" />}
      {demo && (
        <div style={{
          background: '#8B1E3F',
          color: '#E8D5B5',
          padding: '0.4rem 1rem',
          fontSize: '0.8rem',
          textAlign: 'center',
        }}>
          Demo mode — <a href="/demo" style={{ color: '#fff', marginLeft: '0.5rem' }}>All demos</a>
        </div>
      )}

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: '56px', background: '#FFFEF9',
          borderBottom: '1px solid rgba(139,30,63,0.15)',
          display: 'flex', alignItems: 'center',
          padding: '0 1rem', gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(139,30,63,0.06)',
        }}>
          <button
            onClick={() => setDrawerOpen(o => !o)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '6px',
              borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px',
            }}
            aria-label="Open menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 22, height: 2, background: '#8B1E3F', borderRadius: 2 }} />
            ))}
          </button>
          <div style={{
            fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            fontFamily: '"Alike", serif',
          }}>MODELED</div>
          <div style={{ fontSize: '0.62rem', color: '#5A3A2A', letterSpacing: '0.15em', marginTop: '1px' }}>PARTNER PORTAL</div>
        </div>
      )}

      {/* Drawer backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        aside::-webkit-scrollbar {
          width: 6px;
        }
        aside::-webkit-scrollbar-track {
          background: rgba(139, 30, 63, 0.05);
        }
        aside::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 63, 0.2);
          border-radius: 3px;
        }
        aside::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 30, 63, 0.3);
        }
        nav::-webkit-scrollbar {
          width: 6px;
        }
        nav::-webkit-scrollbar-track {
          background: rgba(139, 30, 63, 0.05);
        }
        nav::-webkit-scrollbar-thumb {
          background: rgba(139, 30, 63, 0.2);
          border-radius: 3px;
        }
        nav::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 30, 63, 0.3);
        }
      `}</style>
      {/* Sidebar */}
      <aside style={sidebarStyle} onClick={e => e.stopPropagation()}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>MODELED</div>
          <div style={styles.logoSub}>PARTNER PORTAL</div>
        </div>

        {/* Salon Profile */}
        <div style={styles.salonSection}>
          <div style={styles.salonLogo}>LS</div>
          <div style={styles.salonName}>{displaySalon.name}</div>
          <div style={styles.salonLocation}>{displaySalon.location}</div>
          <span style={styles.salonStatus}>
            {displaySalon.status}
          </span>
        </div>

        {/* Quick Metrics */}
        <div style={styles.quickMetrics}>
          <div style={styles.metric}>
            <div style={styles.metricValue}>{displaySalon.teamSize}</div>
            <div style={styles.metricLabel}>Team Members</div>
          </div>
          <div style={styles.metric}>
            <div style={{ ...styles.metricValue, color: '#8B1E3F' }}>{displaySalon.activeApps}</div>
            <div style={styles.metricLabel}>Pending</div>
          </div>
          <div style={styles.metric}>
            <div style={{ ...styles.metricValue, color: '#4caf50' }}>{displaySalon.conversions}</div>
            <div style={styles.metricLabel}>Conversions</div>
          </div>
          <div style={styles.metric}>
            <div style={{ ...styles.metricValue, color: '#ffc107' }}>{displaySalon.rating}</div>
            <div style={styles.metricLabel}>Rating</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navSections.map((section, i) => (
            <div key={i}>
              <div style={styles.navSection}>{section.title}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setDrawerOpen(false)}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  })}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  {item.label}
                  {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sign Out */}
        <div style={styles.signOutSection}>
          <button
            style={styles.signOutBtn}
            onClick={handleSignOut}
            onMouseOver={(e) => e.target.style.background = 'rgba(48,54,61,0.8)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(48,54,61,0.5)'}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={mainStyle}>
        <Outlet />
      </main>
    </div>
    </PortalStatusGate>
  );
}

