import React, { useState, useEffect, useCallback } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
}
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import PortalNotifications from '../components/PortalNotifications';
import NotificationBell from '../components/NotificationBell';
import InactivityLogout from '../components/InactivityLogout.jsx';
import PortalStatusGate from '../components/PortalStatusGate.jsx';
import { updateModelLastActive } from '../utils/agenticScores';
import { shouldUseMockData } from '../utils/mockDataService';

// ============ OPTION 3 COLOR PALETTE ============
// Cherry gradient sidebar with warm orange-beige text
// Pearl main background with rich espresso brown text

// ============ STYLES ============
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#FAF6F0', // Pearl
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif', // Body text font
  },
  
  // Sidebar
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #6B1830 0%, #8B1E3F 50%, #A85A5A 100%)', // Cherry gradient
    borderRight: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '2rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#E8D5B5', // Warm orange-beige (like "Model Portal" text)
    fontFamily: '"Vintage Goods", "Brush Script MT", "Lucida Handwriting", cursive', // Brand name ONLY
    textTransform: 'uppercase',
  },
  logoSub: {
    fontSize: '0.7rem',
    color: 'rgba(232, 213, 181, 0.8)', // Warm orange-beige with opacity
    letterSpacing: '0.2em',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // User profile section
  userSection: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  userAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
    margin: '0 auto 1rem',
    border: '3px solid rgba(232, 213, 181, 0.3)',
    boxShadow: '0 0 30px rgba(139, 30, 63, 0.3)',
    color: '#E8D5B5',
  },
  userName: {
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#E8D5B5', // Warm orange-beige
    fontFamily: '"Alike", "Georgia", serif',
  },
  userLevel: {
    textAlign: 'center',
    marginTop: '0.5rem',
  },
  levelBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(232, 213, 181, 0.2)',
    color: '#E8D5B5',
    border: '1px solid rgba(232, 213, 181, 0.3)',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // XP Progress
  xpSection: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  xpHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    marginBottom: '0.5rem',
  },
  xpLabel: {
    color: 'rgba(232, 213, 181, 0.7)', // Warm orange-beige with opacity
    fontFamily: '"Alike", "Georgia", serif',
  },
  xpValue: {
    color: '#E8D5B5', // Warm orange-beige
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  xpBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)', // Cherry gradient
    borderRadius: '4px',
  },
  
  // Quick stats
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  quickStat: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    padding: '0.75rem',
    textAlign: 'center',
  },
  quickStatValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#E8D5B5', // Warm orange-beige
    fontFamily: '"Alike", "Georgia", serif',
  },
  quickStatLabel: {
    fontSize: '0.65rem',
    color: 'rgba(232, 213, 181, 0.7)', // Warm orange-beige with opacity
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
    color: 'rgba(232, 213, 181, 0.5)', // Warm orange-beige with opacity
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1.5rem',
    color: '#E8D5B5', // Warm orange-beige
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
    fontFamily: '"Alike", "Georgia", serif',
  },
  navItemActive: {
    color: '#E8D5B5', // Warm orange-beige
    background: 'rgba(255,255,255,0.15)',
    borderLeftColor: '#E8D5B5',
  },
  navIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
  },
  navBadge: {
    marginLeft: 'auto',
    background: '#8B1E3F', // Cherry
    color: '#E8D5B5', // Warm orange-beige
    padding: '0.15rem 0.5rem',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Sign out
  signOutSection: {
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  signOutBtn: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '0.85rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#E8D5B5', // Warm orange-beige
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Main content
  main: {
    flex: 1,
    marginLeft: '280px',
    minHeight: '100vh',
    position: 'relative',
  },
};

// Navigation items - Core MVP focus (Dashboard, Education, Play, Shop hidden for later roadmap)
const navItems = [
  { path: '/model-portal/profile', icon: '', label: 'Model Card', end: true },
  { path: '/model-portal/opportunities', icon: '', label: 'Matched' },
  { path: '/model-portal/photos', icon: '', label: 'Looks' },
  { path: '/model-portal/games', icon: '', label: 'Play' },
  // Hidden for later: Dashboard, Education, Shop, Savings, Feedback, Calendar, Booked
];

// Mock current user
const currentUser = {
  firstName: 'Seraphina',
  lastName: 'Luna',
  levelTier: 'Gold Model',
  levelIcon: '',
  level: 1,
  xp: 2450,
  xpToNext: 3000,
  sessions: 12,
  opportunities: 0,
  rating: 4.9,
};

export default function ModelPortalLayout() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [showNotifications, setShowNotifications] = useState(false);
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update lastActiveDate on portal load (login/activity for decay)
  useEffect(() => {
    if (shouldUseMockData() || !user?.userId) return;
    const userId = user.userId || user.username || user.userSub;
    if (!userId) return;
    (async () => {
      try {
        const client = generateClient();
        const model = client?.models?.ModelProfile;
        if (!model || typeof model.list !== 'function') return;
        const { data: profiles } = await model.list({
          filter: { userId: { eq: userId } },
          limit: 1,
        });
        const profile = profiles?.[0];
        if (profile?.id) {
          updateModelLastActive(profile.id).catch(() => {});
        }
      } catch (e) {
        // Ignore - non-critical
      }
    })();
  }, [user?.userId, user?.username, user?.userSub]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const xpPct = Math.round((currentUser.xp / currentUser.xpToNext) * 100);

  const sidebarStyle = isMobile
    ? {
        ...styles.sidebar,
        position: 'fixed',
        left: drawerOpen ? 0 : '-290px',
        top: 0,
        zIndex: 1000,
        transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: drawerOpen ? '4px 0 24px rgba(0,0,0,0.25)' : 'none',
      }
    : styles.sidebar;

  const mainStyle = isMobile
    ? { ...styles.main, marginLeft: 0, paddingTop: '56px' }
    : styles.main;

  return (
    <PortalStatusGate userType="model">
    <div style={styles.container}>
      <InactivityLogout timeoutMinutes={30} redirectTo="/" />

      {/* Mobile top bar */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          height: '56px',
          background: 'linear-gradient(90deg, #6B1830, #8B1E3F)',
          display: 'flex', alignItems: 'center',
          padding: '0 1rem', gap: '0.75rem',
          boxShadow: '0 2px 10px rgba(107,24,48,0.3)',
        }}>
          <button
            onClick={() => setDrawerOpen(o => !o)}
            style={{
              background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', flexDirection: 'column', gap: '5px',
            }}
            aria-label="Open menu"
          >
            {[0,1,2].map(i => (
              <span key={i} style={{ display: 'block', width: 20, height: 2, background: '#E8D5B5', borderRadius: 2 }} />
            ))}
          </button>
          <div style={{
            fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.1em',
            color: '#E8D5B5', fontFamily: '"Alike", serif',
          }}>MODELED</div>
          <div style={{ fontSize: '0.62rem', color: 'rgba(232,213,181,0.7)', letterSpacing: '0.15em' }}>MODEL PORTAL</div>
        </div>
      )}

      {/* Drawer backdrop */}
      {isMobile && drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={sidebarStyle} onClick={e => e.stopPropagation()}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>MODELED</div>
          <div style={styles.logoSub}>MODEL PORTAL</div>
        </div>

        {/* User Profile */}
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {currentUser.firstName.charAt(0)}
          </div>
          <div style={styles.userName}>
            {currentUser.firstName} {currentUser.lastName}
          </div>
          <div style={styles.userLevel}>
            <span style={styles.levelBadge}>
              {currentUser.levelIcon} {currentUser.levelTier}
            </span>
          </div>
        </div>

        {/* XP Progress */}
        <div style={styles.xpSection}>
          <div style={styles.xpHeader}>
            <span style={styles.xpLabel}>Level Progress</span>
            <span style={styles.xpValue}>{currentUser.xp} / {currentUser.xpToNext} XP</span>
          </div>
          <div style={styles.xpBar}>
            <div style={{ ...styles.xpFill, width: `${xpPct}%` }} />
          </div>
        </div>

        {/* Quick Stats */}
        <div style={styles.quickStats}>
          <div style={styles.quickStat}>
            <div style={styles.quickStatValue}>{currentUser.sessions}</div>
            <div style={styles.quickStatLabel}>Sessions</div>
          </div>
          <div style={styles.quickStat}>
            <div style={{ ...styles.quickStatValue, color: '#8B1E3F' }}>{currentUser.opportunities}</div>
            <div style={styles.quickStatLabel}>Opportunities</div>
          </div>
          <div style={styles.quickStat}>
            <div style={{ ...styles.quickStatValue, color: '#ffc107' }}>{currentUser.rating}</div>
            <div style={styles.quickStatLabel}>Rating</div>
          </div>
          <div style={styles.quickStat}>
            <div style={{ ...styles.quickStatValue, color: '#667eea' }}>{currentUser.level}</div>
            <div style={styles.quickStatLabel}>Level</div>
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
                ...(item.color && isActive ? { borderLeftColor: item.color } : {}),
              })}
            >
              <span style={{ ...styles.navIcon, ...(item.color ? { color: item.color } : {}) }}>{item.icon}</span>
              {item.label}
              {item.badge && <span style={styles.navBadge}>{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div style={styles.signOutSection}>
          <button
            style={styles.signOutBtn}
            onClick={handleSignOut}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.1)';
              e.target.style.color = '#4A2A1A';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.05)';
              e.target.style.color = '#E8D5B5';
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={mainStyle}>
        {/* Notification Bell */}
        {user && (user.userId || user.username || user.userSub) && (
          <>
            <NotificationBell
              onClick={() => setShowNotifications(!showNotifications)}
              userId={user.userId || user.username || user.userSub}
            />
            
            {/* Notification Panel */}
            {showNotifications && (
              <PortalNotifications 
                userId={user.userId || user.username || user.userSub} 
                userType="model" 
              />
            )}
          </>
        )}
        
        <Outlet />
      </main>
    </div>
    </PortalStatusGate>
  );
}

