import React, { useState, useMemo, useEffect } from 'react';
import { 
  getPackagesAndPromos, 
  getPackagesPromosByCampaign,
  createPackage,
  createPromo,
  updatePackageOrPromo,
  linkToCampaign,
  unlinkFromCampaign,
} from '../../utils/packagesApi';
import { services } from '../data/services';

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
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  cardTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  cardType: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(233,69,96,0.2)',
    color: '#e94560',
  },
  cardStatus: {
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
  cardDescription: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1rem',
    lineHeight: '1.6',
  },
  cardDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
  },
  detailItem: {
    fontSize: '0.85rem',
  },
  detailLabel: {
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
  },
  detailValue: {
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  campaignLinks: {
    marginTop: '1rem',
    padding: '0.75rem',
    background: 'rgba(88,166,255,0.1)',
    borderRadius: '8px',
    borderLeft: '3px solid #58a6ff',
  },
  campaignLink: {
    fontSize: '0.8rem',
    color: '#58a6ff',
    marginRight: '0.5rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  cardActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: '#58a6ff',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Modal
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
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid rgba(233,69,96,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  submitBtn: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
  },
};

export default function PackagesPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState('package'); // 'package' or 'promo'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'package',
    services: [],
    originalPrice: '',
    packagePrice: '',
    discountType: 'percentage',
    discountValue: '',
    applicableServices: [],
    startDate: '',
    endDate: '',
    targetAudience: 'all',
    campaignIds: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getPackagesAndPromos();
      setItems(data);
      
      // Load campaigns (mock for now)
      setCampaigns([
        { id: 'camp-1', name: 'New Model Sign-Up Bonus' },
        { id: 'camp-2', name: 'Holiday Blowout Special' },
        { id: 'camp-3', name: 'Professional Referral Program' },
        { id: 'camp-4', name: 'Summer Hair Color Campaign' },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return items;
    if (activeTab === 'packages') return items.filter(i => i.type === 'package');
    if (activeTab === 'promos') return items.filter(i => i.type === 'promo');
    if (activeTab === 'active') {
      const now = new Date();
      return items.filter(i => 
        i.status === 'active' && 
        i.startDate <= now && 
        i.endDate >= now
      );
    }
    return items;
  }, [items, activeTab]);

  const stats = useMemo(() => {
    const now = new Date();
    const activeItems = items.filter(i => 
      i.status === 'active' && 
      i.startDate <= now && 
      i.endDate >= now
    );
    const totalRevenue = items.reduce((sum, i) => sum + (i.revenue || 0), 0);
    const totalUsage = items.reduce((sum, i) => sum + (i.usageCount || 0), 0);
    
    return {
      total: items.length,
      active: activeItems.length,
      totalRevenue,
      totalUsage,
    };
  }, [items]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (createType === 'package') {
        await createPackage({
          ...formData,
          services: formData.services,
          originalPrice: parseFloat(formData.originalPrice),
          packagePrice: parseFloat(formData.packagePrice),
          discount: formData.originalPrice - formData.packagePrice,
          discountPercent: ((formData.originalPrice - formData.packagePrice) / formData.originalPrice * 100).toFixed(1),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          status: 'active',
        });
      } else {
        await createPromo({
          ...formData,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          applicableServices: formData.applicableServices,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          status: 'active',
          code: formData.name.toUpperCase().replace(/\s+/g, ''),
        });
      }
      
      setShowCreateModal(false);
      setFormData({
        name: '',
        description: '',
        type: 'package',
        services: [],
        originalPrice: '',
        packagePrice: '',
        discountType: 'percentage',
        discountValue: '',
        applicableServices: [],
        startDate: '',
        endDate: '',
        targetAudience: 'all',
        campaignIds: [],
      });
      await loadData();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating item. Please try again.');
    }
  };

  const handleLinkCampaign = async (itemId, campaignId, type) => {
    try {
      await linkToCampaign(itemId, campaignId, type);
      await loadData();
    } catch (error) {
      console.error('Error linking campaign:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Packages & Promos 📦</h1>
          <p style={styles.subtitle}>Create bundles and promotional offers with campaign integration</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            style={styles.createBtn}
            onClick={() => {
              setCreateType('promo');
              setShowCreateModal(true);
            }}
          >
            + Create Promo
          </button>
          <button 
            style={styles.createBtn}
            onClick={() => {
              setCreateType('package');
              setShowCreateModal(true);
            }}
          >
            + Create Package
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Items</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.active}</div>
          <div style={styles.statLabel}>Active</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${stats.totalRevenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalUsage}</div>
          <div style={styles.statLabel}>Total Uses</div>
        </div>
      </div>
      
      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'all', label: 'All' },
          { id: 'packages', label: 'Packages' },
          { id: 'promos', label: 'Promos' },
          { id: 'active', label: 'Active' },
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
      
      {/* Items Grid */}
      <div style={styles.grid}>
        {filteredItems.map(item => {
          const isPackage = item.type === 'package';
          const now = new Date();
          const isActive = item.status === 'active' && item.startDate <= now && item.endDate >= now;
          
          return (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.cardTitle}>{item.name}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                    <span style={styles.cardType}>
                      {isPackage ? '📦 Package' : '🎟️ Promo'}
                    </span>
                    <span style={{
                      ...styles.cardStatus,
                      ...(isActive ? styles.statusActive :
                          item.status === 'scheduled' ? styles.statusScheduled :
                          styles.statusEnded),
                    }}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={styles.cardDescription}>{item.description}</div>
              
              <div style={styles.cardDetails}>
                {isPackage ? (
                  <>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Original Price</div>
                      <div style={styles.detailValue}>${item.originalPrice}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Package Price</div>
                      <div style={styles.detailValue}>${item.packagePrice}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Discount</div>
                      <div style={styles.detailValue}>${item.discount} ({item.discountPercent}%)</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Services</div>
                      <div style={styles.detailValue}>
                        {item.services.map(s => {
                          const service = services.find(svc => svc.id === s);
                          return service ? service.name : s;
                        }).join(', ')}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Discount</div>
                      <div style={styles.detailValue}>
                        {item.discountType === 'percentage' 
                          ? `${item.discountValue}%` 
                          : `$${item.discountValue}`}
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Code</div>
                      <div style={styles.detailValue}>{item.code}</div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Usage</div>
                      <div style={styles.detailValue}>
                        {item.usageCount} {item.maxUses ? `/ ${item.maxUses}` : ''}
                      </div>
                    </div>
                    <div style={styles.detailItem}>
                      <div style={styles.detailLabel}>Target</div>
                      <div style={styles.detailValue}>{item.targetAudience}</div>
                    </div>
                  </>
                )}
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Valid Until</div>
                  <div style={styles.detailValue}>
                    {new Date(item.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailLabel}>Revenue</div>
                  <div style={styles.detailValue}>${item.revenue || 0}</div>
                </div>
              </div>
              
              {/* Campaign Links */}
              {item.campaignIds && item.campaignIds.length > 0 && (
                <div style={styles.campaignLinks}>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem' }}>
                    Linked Campaigns:
                  </div>
                  {item.campaignIds.map(campaignId => {
                    const campaign = campaigns.find(c => c.id === campaignId);
                    return campaign ? (
                      <span key={campaignId} style={styles.campaignLink}>
                        📣 {campaign.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
              
              <div style={styles.cardActions}>
                <button style={{ ...styles.actionBtn, ...styles.btnPrimary }}>
                  Edit
                </button>
                <button style={{ ...styles.actionBtn, ...styles.btnSecondary }}>
                  Link Campaign
                </button>
                <button style={{ ...styles.actionBtn, ...styles.btnSecondary }}>
                  Analytics
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                Create {createType === 'package' ? 'Package' : 'Promo'}
              </h2>
              <button style={styles.closeBtn} onClick={() => setShowCreateModal(false)}>
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Name</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.input}
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              {createType === 'package' ? (
                <>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Services</label>
                    <div style={styles.checkboxGroup}>
                      {services.map(service => (
                        <label key={service.id} style={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={formData.services.includes(service.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, services: [...formData.services, service.id] });
                              } else {
                                setFormData({ ...formData, services: formData.services.filter(s => s !== service.id) });
                              }
                            }}
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Original Price</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Package Price</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.packagePrice}
                        onChange={(e) => setFormData({ ...formData, packagePrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Discount Type</label>
                      <select
                        style={styles.select}
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Discount Value</label>
                      <input
                        type="number"
                        style={styles.input}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Applicable Services</label>
                    <div style={styles.checkboxGroup}>
                      <label style={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={formData.applicableServices.includes('all')}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, applicableServices: ['all'] });
                            } else {
                              setFormData({ ...formData, applicableServices: [] });
                            }
                          }}
                        />
                        All Services
                      </label>
                      {services.map(service => (
                        <label key={service.id} style={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={formData.applicableServices.includes(service.id)}
                            disabled={formData.applicableServices.includes('all')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, applicableServices: [...formData.applicableServices, service.id] });
                              } else {
                                setFormData({ ...formData, applicableServices: formData.applicableServices.filter(s => s !== service.id) });
                              }
                            }}
                          />
                          {service.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Audience</label>
                <select
                  style={styles.select}
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                >
                  <option value="all">All Users</option>
                  <option value="models">Models Only</option>
                  <option value="professionals">Professionals Only</option>
                </select>
              </div>
              
              <button type="submit" style={styles.submitBtn}>
                Create {createType === 'package' ? 'Package' : 'Promo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

