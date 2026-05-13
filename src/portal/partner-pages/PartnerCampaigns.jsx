import React, { useState } from 'react';

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
  title: {
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
  createBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    border: 'none',
    color: '#5A3A2A', // Muted brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '6px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  
  // Campaign grid
  campaignGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  },
  
  // Campaign card
  campaignCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  campaignImage: {
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    position: 'relative',
  },
  campaignBadge: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  campaignContent: {
    padding: '1.5rem',
  },
  campaignTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignDesc: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '1rem',
    lineHeight: 1.5,
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignMeta: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
    fontSize: '0.8rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
    padding: '1rem 0',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
    marginBottom: '1rem',
  },
  campaignStat: {
    textAlign: 'center',
  },
  campaignStatValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  campaignStatLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  
  // Opportunity card (from Modeled)
  opportunityCard: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(139, 30, 63, 0.05))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  opportunityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  opportunityTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  opportunityFrom: {
    fontSize: '0.8rem',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  opportunityBadge: {
    padding: '0.35rem 0.75rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
  },
  opportunityDesc: {
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    marginBottom: '1rem',
    lineHeight: 1.5,
    fontFamily: '"Alike", "Georgia", serif',
  },
  opportunityDetails: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const campaigns = [
  {
    id: 1,
    title: 'Holiday Styling Event',
    desc: 'Showcase your team\'s holiday looks. Models get styled, you get exposure!',
    emoji: '🎄',
    gradient: 'linear-gradient(135deg, rgba(248,81,73,0.3), rgba(210,153,34,0.2))',
    date: 'Dec 15, 2024',
    type: 'Event',
    status: 'active',
    rsvps: 12,
    views: 156,
    shares: 8,
  },
  {
    id: 2,
    title: 'New Colorist Showcase',
    desc: 'Introduce your newest color specialists to the Modeled community.',
    emoji: '🎨',
    gradient: 'linear-gradient(135deg, rgba(163,113,247,0.3), rgba(247,120,186,0.2))',
    date: 'Dec 20, 2024',
    type: 'Showcase',
    status: 'draft',
    rsvps: 8,
    views: 89,
    shares: 3,
  },
  {
    id: 3,
    title: 'January Balayage Special',
    desc: 'New year, new hair! Promote your balayage services at special training rates.',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, rgba(46,160,67,0.3), rgba(88,166,255,0.2))',
    date: 'Jan 5-31, 2025',
    type: 'Promo',
    status: 'scheduled',
    rsvps: 0,
    views: 0,
    shares: 0,
  },
];

const opportunities = [
  {
    id: 1,
    title: 'NYC Salon Showcase 2025',
    from: 'Modeled Management',
    desc: 'Featured opportunity to showcase your team at the annual NYC salon showcase. Limited spots available for partner salons.',
    date: 'Feb 15, 2025',
    revenueShare: '60%',
    spots: 3,
  },
  {
    id: 2,
    title: 'Beauty Brand Collaboration',
    from: 'Modeled Management',
    desc: 'Partner with a leading beauty brand for co-marketing content. Looking for salons with strong color specialists.',
    date: 'Ongoing',
    revenueShare: '70%',
    spots: 5,
  },
];

export default function PartnerCampaigns() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Campaigns & Opportunities 🚀</h1>
          <p style={styles.subtitle}>Create events, join opportunities, grow your brand</p>
        </div>
        <button style={styles.createBtn}>
          <span>+</span> Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>3</div>
          <div style={styles.statLabel}>Active Campaigns</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#3fb950' }}>245</div>
          <div style={styles.statLabel}>Total Views</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#d29922' }}>20</div>
          <div style={styles.statLabel}>Total RSVPs</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#a371f7' }}>2</div>
          <div style={styles.statLabel}>New Opportunities</div>
        </div>
      </div>

      {/* Opportunities from Modeled */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
          <span>💎</span> Opportunities from Modeled
        </h3>
        {opportunities.map(opp => (
          <div key={opp.id} style={styles.opportunityCard}>
            <div style={styles.opportunityHeader}>
              <div>
                <div style={styles.opportunityTitle}>{opp.title}</div>
                <div style={styles.opportunityFrom}>From: {opp.from}</div>
              </div>
              <span style={styles.opportunityBadge}>NEW</span>
            </div>
            <div style={styles.opportunityDesc}>{opp.desc}</div>
            <div style={styles.opportunityDetails}>
              <span>📅 {opp.date}</span>
              <span>💰 {opp.revenueShare} revenue share</span>
              <span>👥 {opp.spots} spots available</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button style={{
                padding: '0.6rem 1.5rem',
                background: '#3fb950',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFEF9',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Apply Now
              </button>
              <button style={{
                padding: '0.6rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(139, 30, 63, 0.3)',
                borderRadius: '6px',
                color: '#8B1E3F',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: 'all', label: 'All Campaigns' },
          { key: 'active', label: 'Active' },
          { key: 'draft', label: 'Drafts' },
          { key: 'scheduled', label: '📅 Scheduled' },
          { key: 'past', label: '📁 Past' },
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaign Grid */}
      <div style={styles.campaignGrid}>
        {campaigns.map(campaign => (
          <div
            key={campaign.id}
            style={styles.campaignCard}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#8B1E3F'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)'}
          >
            <div style={{ ...styles.campaignImage, background: campaign.gradient }}>
              {campaign.emoji}
              <span style={{
                ...styles.campaignBadge,
                background: campaign.status === 'active' ? '#3fb950' :
                           campaign.status === 'draft' ? 'rgba(139, 30, 63, 0.2)' :
                           '#d29922',
                color: '#fff',
              }}>
                {campaign.status.toUpperCase()}
              </span>
            </div>
            
            <div style={styles.campaignContent}>
              <div style={styles.campaignTitle}>{campaign.title}</div>
              <div style={styles.campaignDesc}>{campaign.desc}</div>
              
              <div style={styles.campaignMeta}>
                <span style={styles.metaItem}>📅 {campaign.date}</span>
                <span style={styles.metaItem}>🏷️ {campaign.type}</span>
              </div>
              
              <div style={styles.campaignStats}>
                <div style={styles.campaignStat}>
                  <div style={{ ...styles.campaignStatValue, color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{campaign.views}</div>
                  <div style={styles.campaignStatLabel}>Views</div>
                </div>
                <div style={styles.campaignStat}>
                  <div style={{ ...styles.campaignStatValue, color: '#3fb950' }}>{campaign.rsvps}</div>
                  <div style={styles.campaignStatLabel}>RSVPs</div>
                </div>
                <div style={styles.campaignStat}>
                  <div style={{ ...styles.campaignStatValue, color: '#a371f7' }}>{campaign.shares}</div>
                  <div style={styles.campaignStatLabel}>Shares</div>
                </div>
              </div>
              
              <div style={styles.campaignActions}>
                <button style={{
                  ...styles.actionBtn,
                  background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                  color: '#FFFEF9',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {campaign.status === 'draft' ? 'Edit' : 'Manage'}
                </button>
                <button style={{
                  ...styles.actionBtn,
                  background: 'rgba(139, 30, 63, 0.05)',
                  color: '#4A2A1A',
                  border: '1px solid rgba(139, 30, 63, 0.2)',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  Analytics
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

