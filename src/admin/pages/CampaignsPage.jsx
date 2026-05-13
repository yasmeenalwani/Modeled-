import React, { useState, useMemo, useEffect } from 'react';
import { getPackagesPromosByCampaign } from '../../utils/packagesApi';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
  },
  createBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  
  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    color: '#e94560',
    borderBottomColor: '#e94560',
  },
  
  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Campaign card
  campaignCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
    borderLeft: '3px solid rgba(255,255,255,0.1)',
    transition: 'all 0.2s ease',
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  campaignName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  campaignDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  campaignStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  statusActive: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  statusScheduled: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  statusEnded: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  },
  campaignDescription: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  campaignStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
  },
  campaignStat: {
    textAlign: 'center',
  },
  campaignStatValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#e94560',
    marginBottom: '0.25rem',
  },
  campaignStatLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Modal (simplified for now)
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    border: '1px solid rgba(233,69,96,0.3)',
  },
};

// ============ MOCK DATA ============
const generateCampaignData = () => {
  const campaigns = [
    {
      id: 'camp-1',
      name: 'New Model Sign-Up Bonus',
      type: 'promotion',
      status: 'active',
      startDate: new Date(Date.now() - 7 * 86400000),
      endDate: new Date(Date.now() + 23 * 86400000),
      description: 'Get $20 bonus for new model sign-ups. Share your referral code and earn rewards!',
      target: 'models',
      metrics: {
        impressions: 1250,
        clicks: 342,
        conversions: 28,
        ctr: 27.4,
      },
    },
    {
      id: 'camp-2',
      name: 'Holiday Blowout Special',
      type: 'service',
      status: 'active',
      startDate: new Date(Date.now() - 3 * 86400000),
      endDate: new Date(Date.now() + 27 * 86400000),
      description: 'Special pricing on blowout services for the holiday season. Limited time offer!',
      target: 'all',
      metrics: {
        impressions: 890,
        clicks: 156,
        conversions: 42,
        ctr: 17.5,
      },
    },
    {
      id: 'camp-3',
      name: 'Professional Referral Program',
      type: 'referral',
      status: 'scheduled',
      startDate: new Date(Date.now() + 5 * 86400000),
      endDate: new Date(Date.now() + 65 * 86400000),
      description: 'Refer a professional and get $50 credit. Help us grow our network!',
      target: 'models',
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        ctr: 0,
      },
    },
    {
      id: 'camp-4',
      name: 'Summer Hair Color Campaign',
      type: 'service',
      status: 'ended',
      startDate: new Date(Date.now() - 90 * 86400000),
      endDate: new Date(Date.now() - 30 * 86400000),
      description: 'Summer hair color specials - book now and save!',
      target: 'all',
      metrics: {
        impressions: 2100,
        clicks: 489,
        conversions: 67,
        ctr: 23.3,
      },
    },
  ];
  
  // Calculate overall stats
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);
  const avgCtr = campaigns.length > 0 
    ? (campaigns.reduce((sum, c) => sum + c.metrics.ctr, 0) / campaigns.length).toFixed(1)
    : 0;
  
  return {
    campaigns,
    stats: {
      total: campaigns.length,
      active: activeCampaigns,
      totalImpressions,
      totalConversions,
      avgCtr: parseFloat(avgCtr),
    },
  };
};

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [linkedItems, setLinkedItems] = useState({}); // { campaignId: { packages: [], promos: [] } }
  const campaignData = useMemo(() => generateCampaignData(), []);
  
  const { campaigns, stats } = campaignData;
  
  useEffect(() => {
    // Load linked packages/promos for each campaign
    const loadLinkedItems = async () => {
      const itemsMap = {};
      for (const campaign of campaigns) {
        const linked = await getPackagesPromosByCampaign(campaign.id);
        itemsMap[campaign.id] = linked;
      }
      setLinkedItems(itemsMap);
    };
    loadLinkedItems();
  }, [campaigns]);
  
  const filteredCampaigns = activeTab === 'all'
    ? campaigns
    : activeTab === 'active'
    ? campaigns.filter(c => c.status === 'active')
    : campaigns.filter(c => c.status === 'scheduled');
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Marketing Campaigns 📣</h1>
          <p style={styles.subtitle}>Create and manage marketing campaigns and promotions</p>
        </div>
        <button 
          style={styles.createBtn}
          onClick={() => setShowCreateModal(true)}
        >
          + Create Campaign
        </button>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Campaigns</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active Campaigns</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalImpressions.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Impressions</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.avgCtr}%</div>
          <div style={styles.statLabel}>Avg CTR</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'all', label: 'All Campaigns' },
          { id: 'active', label: 'Active' },
          { id: 'scheduled', label: 'Scheduled' },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Campaigns List */}
      <div style={styles.grid}>
        {filteredCampaigns.map(campaign => (
          <div key={campaign.id} style={styles.card}>
            <div style={styles.campaignCard}>
              <div style={styles.campaignHeader}>
                <div>
                  <div style={styles.campaignName}>{campaign.name}</div>
                  <div style={styles.campaignDate}>
                    {campaign.startDate.toLocaleDateString()} - {campaign.endDate.toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  ...styles.campaignStatus,
                  ...(campaign.status === 'active' ? styles.statusActive :
                      campaign.status === 'scheduled' ? styles.statusScheduled :
                      styles.statusEnded),
                }}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
              </div>
              
              <div style={styles.campaignDescription}>
                {campaign.description}
              </div>
              
              <div style={{ 
                marginBottom: '1rem', 
                fontSize: '0.8rem', 
                color: 'rgba(255,255,255,0.5)' 
              }}>
                <span style={{ 
                  padding: '0.25rem 0.6rem', 
                  background: 'rgba(233,69,96,0.2)', 
                  borderRadius: '12px',
                  marginRight: '0.5rem',
                }}>
                  {campaign.type}
                </span>
                <span>Target: {campaign.target}</span>
              </div>
              
              <div style={styles.campaignStats}>
                <div style={styles.campaignStat}>
                  <div style={styles.campaignStatValue}>
                    {campaign.metrics.impressions.toLocaleString()}
                  </div>
                  <div style={styles.campaignStatLabel}>Impressions</div>
                </div>
                <div style={styles.campaignStat}>
                  <div style={styles.campaignStatValue}>{campaign.metrics.clicks}</div>
                  <div style={styles.campaignStatLabel}>Clicks</div>
                </div>
                <div style={styles.campaignStat}>
                  <div style={styles.campaignStatValue}>{campaign.metrics.conversions}</div>
                  <div style={styles.campaignStatLabel}>Conversions</div>
                </div>
                <div style={styles.campaignStat}>
                  <div style={styles.campaignStatValue}>{campaign.metrics.ctr}%</div>
                  <div style={styles.campaignStatLabel}>CTR</div>
                </div>
              </div>
              
              {/* Linked Packages & Promos */}
              {linkedItems[campaign.id] && 
               (linkedItems[campaign.id].packages.length > 0 || linkedItems[campaign.id].promos.length > 0) && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: 'rgba(88,166,255,0.1)',
                  borderRadius: '8px',
                  borderLeft: '3px solid #58a6ff',
                }}>
                  <div style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: '600', 
                    color: '#58a6ff',
                    marginBottom: '0.75rem',
                  }}>
                    📦 Linked Packages & Promos:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {linkedItems[campaign.id].packages.map(pkg => (
                      <span key={pkg.id} style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(233,69,96,0.2)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: '#e94560',
                      }}>
                        📦 {pkg.name}
                      </span>
                    ))}
                    {linkedItems[campaign.id].promos.map(promo => (
                      <span key={promo.id} style={{
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(163,113,247,0.2)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: '#a371f7',
                      }}>
                        🎟️ {promo.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Campaign Performance Summary */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>
            <span>📊</span> Campaign Performance Summary
          </div>
        </div>
        
        <div style={{
          height: '200px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '1rem',
        }}>
          [Chart: Campaign Performance Over Time]
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1rem',
          fontSize: '0.85rem',
        }}>
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(76,175,80,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #4caf50',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#4caf50' }}>
              ✅ Best Performing
            </div>
            <div>New Model Sign-Up Bonus: 27.4% CTR</div>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(102,126,234,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #667eea',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#667eea' }}>
              📈 Total Reach
            </div>
            <div>{stats.totalImpressions.toLocaleString()} impressions across all campaigns</div>
          </div>
          
          <div style={{ 
            padding: '1rem', 
            background: 'rgba(255,193,7,0.1)', 
            borderRadius: '8px',
            borderLeft: '3px solid #ffc107',
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#ffc107' }}>
              🎯 Conversion Rate
            </div>
            <div>{((stats.totalConversions / stats.totalImpressions) * 100).toFixed(2)}% overall conversion</div>
          </div>
        </div>
      </div>
      
      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: '1rem' }}>Create New Campaign</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>
              Campaign creation form will be implemented here.
            </p>
            <button
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
              }}
              onClick={() => setShowCreateModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

