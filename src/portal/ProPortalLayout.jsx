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
    boxShadow: '2px 0 10px rgba(139, 30, 63, 0.05)',
  },
  sidebarHeader: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: '"Alike", "Georgia", serif',
  },
  logoSub: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    letterSpacing: '0.2em',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // User profile section
  userSection: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  userAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: '600',
    margin: '0 auto 1rem',
    border: '3px solid rgba(139, 30, 63, 0.2)',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  userName: {
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  userSalon: {
    textAlign: 'center',
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  userStatus: {
    textAlign: 'center',
    marginTop: '0.75rem',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  
  // Quick stats
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  quickStat: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    padding: '0.75rem',
    textAlign: 'center',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  quickStatValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  quickStatLabel: {
    fontSize: '0.65rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Navigation
  nav: {
    padding: '1rem 0',
    flex: 1,
  },
  navSection: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.15em',
    color: '#5A3A2A', // Muted brown
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.5rem',
    color: '#4A2A1A', // Dark brown
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItemActive: {
    color: '#8B1E3F', // Cherry
    background: 'rgba(139, 30, 63, 0.1)',
    borderLeftColor: '#8B1E3F', // Cherry
  },
  navIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
  },
  
  // Sign out
  signOutSection: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
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

function buildProNavItems(base) {
  return [
  { 
    path: `${base}/profile`, 
    icon: '', 
    label: 'Pro Card',
    end: true,
    description: 'Professional Card, Services & Certifications'
  },
  { 
    path: `${base}/matching`, 
    icon: '', 
    label: 'Matched',
    description: 'Matches & Requests',
    color: '#8B1E3F'
  },
  { 
    path: `${base}/portfolio`, 
    icon: '', 
    label: 'Looks',
    description: 'Sessions & Inspiration'
  },
  {
    path: `${base}/education`,
    icon: '',
    label: 'Education',
    description: 'Training, classes & resources',
  },
  {
    path: `${base}/shop`,
    icon: '',
    label: 'Pro Shop',
    description: 'Tools, Supplies & Brands',
  },
  // Hidden for later: Dashboard (cherry desk, training videos)
  ];
}

// Mock current user (would come from auth)
const currentUser = {
  firstName: 'Sarah',
  lastName: 'Mitchell',
  salon: 'Luxe Studio',
  status: 'Active',
  trainingHours: 730,
  totalHours: 800,
  rating: 4.9,
  tipsThisMonth: 485,
};

export default function ProPortalLayout() {
  const navigate = useNavigate();
  const demo = useDemoPortal();
  const { signOut: portalSignOut } = usePortalAuth();
  const basePath = usePortalBasePath('/portal');
  const navItems = buildProNavItems(basePath);
  const displayUser = demo?.display
    ? {
        firstName: demo.display.firstName,
        lastName: demo.display.lastName,
        salon: demo.display.salonName || 'Luxe Studio',
        status: 'Active',
        trainingHours: 730,
        totalHours: 800,
        rating: 4.9,
        tipsThisMonth: 485,
      }
    : currentUser;
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

  const trainingPct = Math.round((displayUser.trainingHours / displayUser.totalHours) * 100);

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
    <PortalStatusGate userType="professional">
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
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px', borderRadius: '8px', color: '#8B1E3F',
              display: 'flex', flexDirection: 'column', gap: '5px',
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
          <div style={{ fontSize: '0.65rem', color: '#5A3A2A', letterSpacing: '0.15em', marginTop: '1px' }}>PRO PORTAL</div>
        </div>
      )}

      {/* Drawer backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle} onClick={e => e.stopPropagation()}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>MODELED</div>
          <div style={styles.logoSub}>PRO PORTAL</div>
        </div>

        {/* User Profile */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {displayUser.firstName.charAt(0)}
          </div>
          <div style={styles.userName}>
            {displayUser.firstName} {displayUser.lastName}
          </div>
          <div style={styles.userSalon}>{displayUser.salon}</div>
          <div style={styles.userStatus}>
            <span style={styles.statusBadge}>{displayUser.status}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.quickStats}>
          <div style={styles.quickStat}>
            <div style={styles.quickStatValue}>{trainingPct}%</div>
            <div style={styles.quickStatLabel}>Training</div>
          </div>
          <div style={styles.quickStat}>
            <div style={{ ...styles.quickStatValue, color: '#D4858A' }}>{displayUser.rating}</div>
            <div style={styles.quickStatLabel}>Rating</div>
          </div>
          <div style={styles.quickStat}>
            <div style={{ ...styles.quickStatValue, color: '#4caf50' }}>${displayUser.tipsThisMonth}</div>
            <div style={styles.quickStatLabel}>Tips (Dec)</div>
          </div>
          <div style={styles.quickStat}>
            <div style={styles.quickStatValue}>{displayUser.trainingHours}</div>
            <div style={styles.quickStatLabel}>Hours</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navSection}>Menu</div>
          {navItems.map((item) => (
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
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div style={styles.signOutSection}>
          <button
            style={styles.signOutBtn}
            onClick={handleSignOut}
            onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.05)'}
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

