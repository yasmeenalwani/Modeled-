import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import PricingCalculatorPage from './PricingCalculatorPage';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    background: '#0d0d14',
    color: '#fff',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
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
    borderBottom: '2px solid transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#e94560',
    borderBottomColor: '#e94560',
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
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  filterBtnActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Prospect List
  prospectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  prospectCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  prospectCardHover: {
    background: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(233,69,96,0.3)',
  },
  prospectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  prospectName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  prospectCompany: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  prospectStage: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  prospectInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
  },
  prospectActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '8px',
    color: '#e94560',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  
  // Add Button
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #e94560, #c73650)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
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
    background: '#1a1a2e',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
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
    background: 'none',
    border: 'none',
    color: '#fff',
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
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  submitBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #e94560, #c73650)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
};

// ============ MAIN COMPONENT ============
export default function CRMPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('prospects');
  const [prospects, setProspects] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [cityExpansions, setCityExpansions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('prospect'); // 'prospect', 'campaign', 'city'
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [filters, setFilters] = useState({
    stage: 'all',
    type: 'all',
    priority: 'all',
  });

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    prospectType: 'professional',
    source: 'cold_outreach',
    city: '',
    state: '',
    stage: 'new',
    priority: 'medium',
    notes: '',
    tags: [],
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'pricing') {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      
      if (activeTab === 'prospects') {
        try {
          const { data, errors } = await client.models.Prospect.list({
            limit: 1000,
            sortDirection: 'DESC',
          });
          if (errors) throw new Error(errors[0]?.message);
          setProspects(data || []);
        } catch (err) {
          console.error('Error loading prospects:', err);
          // If Prospect model doesn't exist yet, show empty state
          if (err.message?.includes('Prospect') || err.message?.includes('not found') || err.message?.includes('does not exist')) {
            setProspects([]);
            setError('Database schema not deployed. Please run: npx ampx sandbox');
            return;
          }
          setError(err.message || 'Failed to load prospects');
        }
      } else if (activeTab === 'campaigns') {
        try {
          const { data, errors } = await client.models.OutreachCampaign.list({
            limit: 1000,
            sortDirection: 'DESC',
          });
          if (errors) throw new Error(errors[0]?.message);
          setCampaigns(data || []);
        } catch (err) {
          console.error('Error loading campaigns:', err);
          if (err.message?.includes('OutreachCampaign') || err.message?.includes('not found') || err.message?.includes('does not exist')) {
            setCampaigns([]);
            setError('Database schema not deployed. Please run: npx ampx sandbox');
            return;
          }
          setError(err.message || 'Failed to load campaigns');
        }
      } else if (activeTab === 'cities') {
        try {
          const { data, errors } = await client.models.CityExpansion.list({
            limit: 1000,
            sortDirection: 'DESC',
          });
          if (errors) throw new Error(errors[0]?.message);
          setCityExpansions(data || []);
        } catch (err) {
          console.error('Error loading city expansions:', err);
          if (err.message?.includes('CityExpansion') || err.message?.includes('not found') || err.message?.includes('does not exist')) {
            setCityExpansions([]);
            setError('Database schema not deployed. Please run: npx ampx sandbox');
            return;
          }
          setError(err.message || 'Failed to load city expansions');
        }
      }
    } catch (error) {
      console.error('Error loading CRM data:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProspect = async (e) => {
    e.preventDefault();
    try {
      const { data, errors } = await client.models.Prospect.create({
        ...formData,
        createdAt: new Date().toISOString(),
      });
      if (errors) throw new Error(errors[0]?.message);
      
      alert('✅ Prospect created!');
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        prospectType: 'professional',
        source: 'cold_outreach',
        city: '',
        state: '',
        stage: 'new',
        priority: 'medium',
        notes: '',
        tags: [],
      });
      loadData();
    } catch (error) {
      console.error('Error creating prospect:', error);
      if (error.message?.includes('Prospect') && error.message?.includes('not found')) {
        alert('⚠️ Database schema not deployed yet. Please run: npx ampx sandbox');
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      new: '#4a90e2',
      contacted: '#f5a623',
      qualified: '#7ed321',
      proposal: '#9013fe',
      negotiation: '#bd10e0',
      closed_won: '#50e3c2',
      closed_lost: '#d0021b',
      nurture: '#b8e986',
    };
    return colors[stage] || '#666';
  };

  const filteredProspects = prospects.filter(p => {
    if (filters.stage !== 'all' && p.stage !== filters.stage) return false;
    if (filters.type !== 'all' && p.prospectType !== filters.type) return false;
    if (filters.priority !== 'all' && p.priority !== filters.priority) return false;
    return true;
  });

  const stats = {
    total: prospects.length,
    new: prospects.filter(p => p.stage === 'new').length,
    contacted: prospects.filter(p => p.stage === 'contacted').length,
    qualified: prospects.filter(p => p.stage === 'qualified').length,
    closed: prospects.filter(p => p.stage === 'closed_won').length,
  };

  return (
    <div style={styles.container}>
      <div style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.25rem',
        borderRadius: '10px',
        background: 'rgba(255,193,7,0.1)',
        border: '1px solid rgba(255,193,7,0.35)',
        fontSize: '0.9rem',
        lineHeight: 1.5,
        color: 'rgba(255,255,255,0.85)',
      }}>
        <strong>Email outreach paused:</strong> Amazon SES production access is not approved on this account yet.
        CRM send actions will not deliver until SES is approved or you connect an alternate provider (e.g. Resend/Postmark).
        Onboarding review and in-app workflows are unaffected.
      </div>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>CRM & Sales Outreach 📞</h1>
          <p style={styles.subtitle}>Manage prospects, campaigns, and city expansion</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            style={{ ...styles.addBtn, background: 'rgba(255,255,255,0.1)' }}
            onClick={() => navigate('/admin/crm/templates')}
          >
            📧 Templates
          </button>
          <button
            style={{ ...styles.addBtn, background: 'rgba(255,255,255,0.1)' }}
            onClick={() => navigate('/admin/crm/analytics')}
          >
            📊 Analytics
          </button>
          <button
            style={{ ...styles.addBtn, background: 'rgba(255,255,255,0.1)' }}
            onClick={() => navigate('/admin/crm/revenue')}
          >
            💰 Revenue & Relationships
          </button>
          <button
            style={styles.addBtn}
            onClick={() => {
              setModalType('prospect');
              setShowModal(true);
            }}
          >
            + Add Prospect
          </button>
        </div>
      </div>

      {/* Stats */}
      {activeTab === 'prospects' && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total Prospects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.new}</div>
            <div style={styles.statLabel}>New</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.contacted}</div>
            <div style={styles.statLabel}>Contacted</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.qualified}</div>
            <div style={styles.statLabel}>Qualified</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'prospects' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('prospects')}
        >
          Prospects & Leads
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'campaigns' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('campaigns')}
        >
          Outreach Campaigns
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'cities' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('cities')}
        >
          City Expansion
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'events' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('events')}
        >
          Event Prospecting
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'pricing' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing Calculator
        </button>
      </div>

      {/* Filters */}
      {activeTab === 'prospects' && (
        <div style={styles.filters}>
          <button
            style={{
              ...styles.filterBtn,
              ...(filters.stage === 'all' ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilters({ ...filters, stage: 'all' })}
          >
            All Stages
          </button>
          {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won'].map(stage => (
            <button
              key={stage}
              style={{
                ...styles.filterBtn,
                ...(filters.stage === stage ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilters({ ...filters, stage })}
            >
              {stage.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '1rem',
          background: 'rgba(208,2,27,0.2)',
          border: '1px solid rgba(208,2,27,0.5)',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          color: '#ff6b6b',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
          Loading...
        </div>
      ) : activeTab === 'prospects' ? (
        <div style={styles.prospectList}>
          {filteredProspects.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No prospects yet</div>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
                Click "Add Prospect" to start building your pipeline
              </div>
            </div>
          ) : (
            filteredProspects.map(prospect => (
              <div
                key={prospect.id}
                style={styles.prospectCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
                onClick={() => {
                  setSelectedProspect(prospect);
                  setShowModal(true);
                }}
              >
                <div style={styles.prospectHeader}>
                  <div>
                    <div style={styles.prospectName}>
                      {prospect.firstName} {prospect.lastName}
                    </div>
                    <div style={styles.prospectCompany}>
                      {prospect.company || prospect.title || 'No company'}
                    </div>
                  </div>
                  <div style={{
                    ...styles.prospectStage,
                    background: `${getStageColor(prospect.stage)}20`,
                    color: getStageColor(prospect.stage),
                  }}>
                    {prospect.stage.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
                <div style={styles.prospectInfo}>
                  <div>📧 {prospect.email || 'No email'}</div>
                  <div>📞 {prospect.phone || 'No phone'}</div>
                  <div>📍 {prospect.city ? `${prospect.city}, ${prospect.state}` : 'No location'}</div>
                </div>
                {prospect.notes && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    {prospect.notes.substring(0, 150)}...
                  </div>
                )}
                <div style={styles.prospectActions}>
                  <button
                    style={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Open email composer
                      alert('Email composer coming soon!');
                    }}
                  >
                    📧 Email
                  </button>
                  <button
                    style={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Log call
                      alert('Call logging coming soon!');
                    }}
                  >
                    📞 Call
                  </button>
                  <button
                    style={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Schedule follow-up
                      alert('Follow-up scheduling coming soon!');
                    }}
                  >
                    📅 Follow-up
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'campaigns' ? (
        <div>
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Outreach Campaigns</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              Create email/SMS campaigns for bulk outreach
            </div>
            <button
              style={{
                ...styles.addBtn,
                marginTop: '1.5rem',
              }}
              onClick={() => {
                setModalType('campaign');
                setShowModal(true);
              }}
            >
              + Create Campaign
            </button>
          </div>
        </div>
      ) : activeTab === 'pricing' ? (
        <PricingCalculatorPage />
      ) : activeTab === 'cities' ? (
        <div>
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌆</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>City Expansion</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              Track expansion efforts into new cities
            </div>
            <button
              style={{
                ...styles.addBtn,
                marginTop: '1.5rem',
              }}
              onClick={() => {
                setModalType('city');
                setShowModal(true);
              }}
            >
              + Add City
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎪</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Event Prospecting</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
              Find and connect with event organizers, trade shows, and networking events
            </div>
            <button
              style={{
                ...styles.addBtn,
                marginTop: '1.5rem',
              }}
              onClick={() => {
                setModalType('event');
                setShowModal(true);
              }}
            >
              + Add Event Prospect
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalType === 'prospect' ? 'Add Prospect' :
                 modalType === 'campaign' ? 'Create Campaign' :
                 modalType === 'city' ? 'Add City Expansion' :
                 'Add Event Prospect'}
              </h2>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            {modalType === 'prospect' && (
              <form onSubmit={handleCreateProspect}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    style={styles.input}
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    style={styles.input}
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    type="tel"
                    style={styles.input}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company / Salon</label>
                  <input
                    style={styles.input}
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Prospect Type *</label>
                  <select
                    style={styles.select}
                    value={formData.prospectType}
                    onChange={(e) => setFormData({ ...formData, prospectType: e.target.value })}
                    required
                  >
                    <option value="professional">Professional</option>
                    <option value="salon">Salon</option>
                    <option value="event">Event</option>
                    <option value="city_expansion">City Expansion</option>
                    <option value="partner">Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City</label>
                  <input
                    style={styles.input}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Los Angeles"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>State</label>
                  <input
                    style={styles.input}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="CA"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Stage</label>
                  <select
                    style={styles.select}
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closed_won">Closed Won</option>
                    <option value="closed_lost">Closed Lost</option>
                    <option value="nurture">Nurture</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Notes</label>
                  <textarea
                    style={styles.textarea}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add notes about this prospect..."
                  />
                </div>
                <button type="submit" style={styles.submitBtn}>
                  Create Prospect
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

