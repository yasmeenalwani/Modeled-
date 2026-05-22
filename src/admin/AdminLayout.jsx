import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';

// ============ STYLES ============
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0d0d14',
    color: '#fff',
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  
  // Sidebar
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #12121a 0%, #0a0a10 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#e94560',
    fontFamily: '"Playfair Display", serif',
  },
  logoSub: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '0.2em',
    marginTop: '0.25rem',
  },
  
  // Nav sections
  navSection: {
    padding: '1rem 0',
  },
  navSectionTitle: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.65rem',
    fontWeight: '600',
    letterSpacing: '0.15em',
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 1.5rem',
    color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid transparent',
  },
  navItemActive: {
    color: '#fff',
    background: 'rgba(233,69,96,0.1)',
    borderLeftColor: '#e94560',
  },
  navIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
  },
  
  // User section at bottom
  userSection: {
    marginTop: 'auto',
    padding: '1rem 1.5rem',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  userRole: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
  },
  signOutBtn: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.8rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  
  // Main content
  main: {
    flex: 1,
    marginLeft: '260px',
    minHeight: '100vh',
  },
  topBar: {
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
  },
  pageTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  content: {
    padding: '2rem',
  },
};

// Navigation items configuration
const navItems = [
  {
    section: 'Overview',
    items: [
      { path: '/admin', icon: '', label: 'Dashboard', end: true },
      { path: '/admin/trends', icon: '', label: 'Trend Analysis' },
      { path: '/admin/revenue', icon: '', label: 'Revenue Tracker' },
    ],
  },
  {
    section: 'People',
    items: [
      { path: '/admin/models', icon: '', label: 'Models' },
      { path: '/admin/professionals', icon: '', label: 'Professionals' },
      { path: '/admin/salons', icon: '', label: 'Salons / Partners' },
    ],
  },
    {
      section: 'Matching',
      items: [
        { path: '/admin/requests', icon: '', label: 'Request Queue' },
        { path: '/admin/matching', icon: '', label: 'Match Engine' },
        { path: '/admin/match-approval', icon: '', label: 'Match Approval' },
        { path: '/admin/criteria', icon: '', label: 'Match Criteria' },
        { path: '/admin/ai-analysis', icon: '', label: 'AI Analysis Demo' },
      ],
    },
  {
    section: 'Bookings',
    items: [
      { path: '/admin/bookings', icon: '', label: 'All Bookings' },
      { path: '/admin/calendar', icon: '', label: 'Calendar View' },
      { path: '/admin/waitlist', icon: '', label: 'Waitlist' },
    ],
  },
  {
    section: 'Offerings',
    items: [
      { path: '/admin/services', icon: '', label: 'Service Catalog' },
      { path: '/admin/packages', icon: '', label: 'Packages & Promos' },
    ],
  },
  {
    section: 'Onboarding & Training',
    items: [
      { path: '/admin/onboarding', icon: '', label: 'Review Queue' },
      { path: '/admin/training', icon: '', label: 'Training Program' },
    ],
  },
  {
    section: 'Media',
    items: [
      { path: '/admin/photos', icon: '', label: 'Photo Gallery' },
      { path: '/admin/videos', icon: '', label: 'Video Library' },
    ],
  },
  {
    section: 'Sales & Growth',
    items: [
      { path: '/admin/crm', icon: '', label: 'CRM & Outreach' },
      { path: '/admin/trips', icon: '', label: 'Trip Management' },
      { path: '/admin/campaigns', icon: '', label: 'Campaigns' },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { path: '/admin/monitoring', icon: '', label: 'Monitoring & Security' },
      { path: '/admin/performance', icon: '', label: 'Performance' },
      { path: '/admin/feedback', icon: '', label: 'Feedback' },
      { path: '/admin/chat', icon: '', label: 'Chat Management' },
      { path: '/admin/onboarding-analytics', icon: '', label: 'Onboarding Analytics' },
      { path: '/admin/engagement-analytics', icon: '', label: 'Engagement Analytics' },
      { path: '/admin/conversion-analytics', icon: '', label: 'Conversion Analytics' },
    ],
  },
        {
          section: 'Testing',
          items: [
            { path: '/admin/database-test', icon: '', label: 'Database Tests' },
            { path: '/admin/rds-test', icon: '', label: 'RDS Tests' },
          ],
        },
  {
    section: 'IMPACT',
    items: [
      { path: '/admin/role-model', icon: '', label: 'ROLE Model', color: '#10b981' },
      { path: '/admin/role-model/applications', icon: '', label: '4th Chair Applications', color: '#10b981' },
      { path: '/admin/role-model/professionals', icon: '', label: 'Pro Applications', color: '#10b981' },
      { path: '/admin/role-model/matching', icon: '', label: 'Matching', color: '#10b981' },
      { path: '/admin/role-model/shop', icon: '', label: 'Wear Care Shop', color: '#10b981' },
      { path: '/admin/role-model/metrics', icon: '', label: 'Impact Metrics', color: '#10b981' },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo}>MODELED</div>
          <div style={styles.logoSub}>COMMAND CENTER</div>
        </div>

        {/* Navigation */}
        <nav>
          {navItems.map((section) => (
            <div key={section.section} style={styles.navSection}>
              <div style={styles.navSectionTitle}>{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setCurrentPage(item.label)}
                  style={({ isActive }) => ({
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                    ...(item.color && isActive ? { borderLeftColor: item.color } : {}),
                  })}
                >
                  <span style={{ ...styles.navIcon, ...(item.color ? { color: item.color } : {}) }}>{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>Y</div>
            <div>
              <div style={styles.userName}>Yasmeen</div>
              <div style={styles.userRole}>Chess Master 👑</div>
            </div>
          </div>
          <button 
            style={styles.signOutBtn}
            onClick={handleSignOut}
            onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

