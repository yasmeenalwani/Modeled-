import React from 'react';
import { useNavigate } from 'react-router-dom';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  greeting: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dateRange: {
    display: 'flex',
    gap: '0.5rem',
  },
  dateBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dateBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Alert banner
  alertBanner: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    marginBottom: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  alertIcon: {
    fontSize: '1.5rem',
  },
  alertText: {
    fontSize: '0.9rem',
  },
  alertBtn: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Stats grid
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  statHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  statIcon: {
    fontSize: '1.25rem',
  },
  statChange: {
    fontSize: '0.7rem',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Main grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  
  // Card
  card: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.25rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardLink: {
    fontSize: '0.8rem',
    color: '#8B1E3F', // Cherry
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Team progress
  teamMember: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(139, 30, 63, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberRole: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  memberProgress: {
    width: '100px',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.25rem',
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
  },
  progressLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    textAlign: 'right',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Bookings
  bookingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  bookingDate: {
    width: '50px',
    textAlign: 'center',
  },
  bookingDay: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingMonth: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  bookingStatus: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  
  // Conversion funnel
  funnelContainer: {},
  funnelStep: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  funnelBar: {
    height: '40px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  funnelLabel: {
    width: '120px',
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginLeft: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  funnelValue: {
    fontWeight: '700',
    marginLeft: 'auto',
    marginRight: '1rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Campaigns
  campaignItem: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  campaignTitle: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  campaignBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
};

// Mock data
const stats = [
  { icon: '👥', label: 'Team Members', value: 8, change: '+2', changeType: 'positive' },
  { icon: '📅', label: 'Bookings This Month', value: 34, change: '+18%', changeType: 'positive' },
  { icon: '', label: 'Model Conversions', value: 24, change: '+6', changeType: 'positive' },
  { icon: '', label: 'Avg Rating', value: '4.9', change: '↑0.2', changeType: 'positive' },
  { icon: '💰', label: 'Revenue (MTD)', value: '$4,250', change: '+24%', changeType: 'positive' },
];

const teamMembers = [
  { name: 'Sarah Mitchell', role: 'Colorist', initials: 'SM', progress: 92, color: '#3fb950' },
  { name: 'Jessica Kim', role: 'Stylist', initials: 'JK', progress: 75, color: '#58a6ff' },
  { name: 'Amanda Lopez', role: 'Apprentice', initials: 'AL', progress: 45, color: '#d29922' },
  { name: 'Maria Chen', role: 'Apprentice', initials: 'MC', progress: 30, color: '#f85149' },
];

const upcomingBookings = [
  { day: 7, month: 'DEC', service: 'Balayage Training', pro: 'Sarah M.', model: 'Emma J.', time: '10:00 AM', status: 'confirmed' },
  { day: 8, month: 'DEC', service: 'Cut Practice', pro: 'Jessica K.', model: 'Sophia L.', time: '2:00 PM', status: 'pending' },
  { day: 9, month: 'DEC', service: 'Color Session', pro: 'Amanda L.', model: 'Olivia C.', time: '11:00 AM', status: 'confirmed' },
];

const campaigns = [
  { 
    title: 'Holiday Styling Event', 
    date: 'Dec 15, 2024',
    type: 'Event',
    rsvps: 12,
    status: 'active',
  },
  { 
    title: 'New Colorist Showcase', 
    date: 'Dec 20, 2024',
    type: 'Showcase',
    rsvps: 8,
    status: 'draft',
  },
];

const funnelData = [
  { label: 'Models Booked', value: 156, width: 100, color: '#58a6ff' },
  { label: 'Models Served', value: 142, width: 91, color: '#3fb950' },
  { label: 'Returned', value: 45, width: 29, color: '#d29922' },
  { label: 'Full-Price Clients', value: 24, width: 15, color: '#f85149' },
];

export default function PartnerDashboard() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>Welcome back, Luxe Studio 👋</h1>
          <p style={styles.subtitle}>Here's what's happening with your team</p>
        </div>
        <div style={styles.dateRange}>
          <button style={{ ...styles.dateBtn, ...styles.dateBtnActive }}>This Week</button>
          <button style={styles.dateBtn}>This Month</button>
          <button style={styles.dateBtn}>This Year</button>
        </div>
      </div>

      {/* Alert Banner */}
      <div style={styles.alertBanner}>
        <div style={styles.alertContent}>
          <span style={styles.alertIcon}>⚠️</span>
          <div>
            <strong>3 pending booking requests</strong>
            <span style={{ marginLeft: '0.5rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              — Models are waiting for confirmation
            </span>
          </div>
        </div>
        <button style={styles.alertBtn} onClick={() => navigate('/partner-portal/bookings')}>
          Review Now →
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statIcon}>{stat.icon}</span>
              <span style={{
                ...styles.statChange,
                background: stat.changeType === 'positive' ? 'rgba(46,160,67,0.2)' : 'rgba(248,81,73,0.2)',
                color: stat.changeType === 'positive' ? '#3fb950' : '#f85149',
              }}>
                {stat.change}
              </span>
            </div>
            <div style={styles.statValue}>{stat.value}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* Left Column */}
        <div>
          {/* Team Training Progress */}
          <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                Team Training Progress
              </div>
              <span style={styles.cardLink} onClick={() => navigate('/partner-portal/training')}>
                View All →
              </span>
            </div>
            {teamMembers.map((member, i) => (
              <div key={i} style={styles.teamMember}>
                <div style={{ ...styles.memberAvatar, background: `${member.color}20`, color: member.color }}>
                  {member.initials}
                </div>
                <div style={styles.memberInfo}>
                  <div style={styles.memberName}>{member.name}</div>
                  <div style={styles.memberRole}>{member.role}</div>
                </div>
                <div style={styles.memberProgress}>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: `${member.progress}%`,
                      background: member.color,
                    }} />
                  </div>
                  <div style={styles.progressLabel}>{member.progress}% complete</div>
                </div>
              </div>
            ))}
          </div>

          {/* Model-to-Client Conversion Funnel */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <span>💎</span> Model-to-Client Conversion
              </div>
              <span style={styles.cardLink} onClick={() => navigate('/partner-portal/conversions')}>
                Details →
              </span>
            </div>
            <div style={styles.funnelContainer}>
              {funnelData.map((step, i) => (
                <div key={i} style={styles.funnelStep}>
                  <div style={{
                    ...styles.funnelBar,
                    width: `${step.width}%`,
                    background: `${step.color}30`,
                    borderLeft: `4px solid ${step.color}`,
                  }}>
                    <span style={{ color: step.color }}>{step.value}</span>
                  </div>
                  <div style={styles.funnelLabel}>{step.label}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(46,160,67,0.1)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <strong style={{ color: '#3fb950' }}>15.4%</strong>
              <span style={{ color: '#5A3A2A', marginLeft: '0.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
                conversion rate (industry avg: 8%)
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Upcoming Bookings */}
          <div style={{ ...styles.card, marginBottom: '1.5rem' }}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <span>📅</span> Upcoming Bookings
              </div>
              <span style={styles.cardLink} onClick={() => navigate('/partner-portal/calendar')}>
                Calendar →
              </span>
            </div>
            {upcomingBookings.map((booking, i) => (
              <div key={i} style={styles.bookingItem}>
                <div style={styles.bookingDate}>
                  <div style={styles.bookingDay}>{booking.day}</div>
                  <div style={styles.bookingMonth}>{booking.month}</div>
                </div>
                <div style={styles.bookingInfo}>
                  <div style={styles.bookingService}>{booking.service}</div>
                  <div style={styles.bookingMeta}>
                    {booking.pro} + {booking.model} • {booking.time}
                  </div>
                </div>
                <span style={{
                  ...styles.bookingStatus,
                  background: booking.status === 'confirmed' ? 'rgba(46,160,67,0.2)' : 'rgba(210,153,34,0.2)',
                  color: booking.status === 'confirmed' ? '#3fb950' : '#d29922',
                }}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>

          {/* Active Campaigns */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardTitle}>
                <span>🚀</span> Campaigns
              </div>
              <span style={styles.cardLink} onClick={() => navigate('/partner-portal/campaigns')}>
                View All →
              </span>
            </div>
            {campaigns.map((campaign, i) => (
              <div key={i} style={styles.campaignItem}>
                <div style={styles.campaignHeader}>
                  <div style={styles.campaignTitle}>{campaign.title}</div>
                  <span style={{
                    ...styles.campaignBadge,
                    background: campaign.status === 'active' ? 'rgba(46,160,67,0.2)' : 'rgba(48,54,61,0.5)',
                    color: campaign.status === 'active' ? '#3fb950' : '#5A3A2A',
                  }}>
                    {campaign.status}
                  </span>
                </div>
                <div style={styles.campaignMeta}>
                  📅 {campaign.date} • {campaign.type} • {campaign.rsvps} RSVPs
                </div>
                <div style={styles.campaignActions}>
                  <button style={{
                    ...styles.campaignBtn,
                    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                    color: '#FFFEF9',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    Manage
                  </button>
                  <button style={{
                    ...styles.campaignBtn,
                    background: 'rgba(139, 30, 63, 0.05)',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    color: '#4A2A1A',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}>
                    Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

