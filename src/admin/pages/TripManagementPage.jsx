import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

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
  tripCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tripHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  tripName: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  tripLocation: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
  },
  tripStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  tripDates: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    marginBottom: '1rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #e94560, #c73650)',
    transition: 'width 0.3s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginTop: '1rem',
  },
  statItem: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
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
    maxWidth: '800px',
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
};

export default function TripManagementPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'schedule', 'contacts', 'followups'
  
  const [formData, setFormData] = useState({
    name: '',
    tripType: 'conference',
    city: '',
    state: '',
    venue: '',
    startDate: '',
    endDate: '',
    primaryGoal: '',
    targetContacts: 0,
    targetProspects: 0,
    budget: 0,
  });

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const { data, errors } = await client.models.BusinessTrip.list({
        limit: 1000,
        sortDirection: 'DESC',
      });
      if (errors) throw new Error(errors[0]?.message);
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    try {
      const { data, errors } = await client.models.BusinessTrip.create({
        ...formData,
        status: 'planning',
        createdAt: new Date().toISOString(),
      });
      if (errors) throw new Error(errors[0]?.message);
      
      alert('✅ Trip created!');
      setShowModal(false);
      setFormData({
        name: '',
        tripType: 'conference',
        city: '',
        state: '',
        venue: '',
        startDate: '',
        endDate: '',
        primaryGoal: '',
        targetContacts: 0,
        targetProspects: 0,
        budget: 0,
      });
      loadTrips();
    } catch (error) {
      console.error('Error creating trip:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: '#f5a623',
      confirmed: '#4a90e2',
      in_progress: '#7ed321',
      completed: '#50e3c2',
      cancelled: '#d0021b',
    };
    return colors[status] || '#666';
  };

  const getProgress = (trip) => {
    if (!trip.targetContacts) return 0;
    return Math.min((trip.contactsMade / trip.targetContacts) * 100, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Trip & Event Management ✈️</h1>
          <p style={styles.subtitle}>Plan, track, and follow up on business trips and events</p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => {
            setSelectedTrip(null);
            setShowModal(true);
          }}
        >
          + New Trip
        </button>
      </div>

      {/* Trips List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
          Loading...
        </div>
      ) : trips.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✈️</div>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No trips planned yet</div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>
            Click "New Trip" to start planning your Anaheim trip
          </div>
        </div>
      ) : (
        trips.map(trip => {
          const progress = getProgress(trip);
          return (
            <div
              key={trip.id}
              style={styles.tripCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              }}
              onClick={() => {
                setSelectedTrip(trip);
                navigate(`/admin/trips/${trip.id}`);
              }}
            >
              <div style={styles.tripHeader}>
                <div>
                  <div style={styles.tripName}>{trip.name}</div>
                  <div style={styles.tripLocation}>
                    📍 {trip.city}{trip.state ? `, ${trip.state}` : ''}
                    {trip.venue && ` • ${trip.venue}`}
                  </div>
                </div>
                <div style={{
                  ...styles.tripStatus,
                  background: `${getStatusColor(trip.status)}20`,
                  color: getStatusColor(trip.status),
                }}>
                  {trip.status.replace('_', ' ').toUpperCase()}
                </div>
              </div>
              
              <div style={styles.tripDates}>
                <div>📅 {formatDate(trip.startDate)} - {formatDate(trip.endDate)}</div>
                <div>🎯 {trip.contactsMade || 0} / {trip.targetContacts || 0} contacts</div>
              </div>
              
              {trip.targetContacts > 0 && (
                <div style={styles.progressBar}>
                  <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                </div>
              )}
              
              {trip.primaryGoal && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '1rem',
                }}>
                  <strong>Goal:</strong> {trip.primaryGoal}
                </div>
              )}
              
              <div style={styles.statsGrid}>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{trip.contactsMade || 0}</div>
                  <div style={styles.statLabel}>Contacts</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{trip.prospectsMet || 0}</div>
                  <div style={styles.statLabel}>Prospects</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{trip.meetingsScheduled || 0}</div>
                  <div style={styles.statLabel}>Meetings</div>
                </div>
                <div style={styles.statItem}>
                  <div style={styles.statValue}>{trip.followUpsCompleted || 0}</div>
                  <div style={styles.statLabel}>Follow-ups</div>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Create Trip Modal */}
      {showModal && (
        <div style={styles.modal} onClick={() => setShowModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Create New Trip</h2>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleCreateTrip}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Trip/Event Name *</label>
                <input
                  style={styles.input}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Anaheim Beauty Expo 2024"
                  required
                />
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Trip Type *</label>
                <select
                  style={styles.select}
                  value={formData.tripType}
                  onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                  required
                >
                  <option value="conference">Conference</option>
                  <option value="trade_show">Trade Show</option>
                  <option value="expo">Expo</option>
                  <option value="networking">Networking Event</option>
                  <option value="city_visit">City Visit</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>City *</label>
                  <input
                    style={styles.input}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Anaheim"
                    required
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
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Venue</label>
                <input
                  style={styles.input}
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Anaheim Convention Center"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date *</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>End Date *</label>
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
                <label style={styles.label}>Primary Goal</label>
                <textarea
                  style={styles.textarea}
                  value={formData.primaryGoal}
                  onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                  placeholder="Meet 20 beauty professionals, find 5 salon partners, recruit models..."
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Contacts</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.targetContacts}
                    onChange={(e) => setFormData({ ...formData, targetContacts: parseInt(e.target.value) || 0 })}
                    placeholder="20"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Prospects</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.targetProspects}
                    onChange={(e) => setFormData({ ...formData, targetProspects: parseInt(e.target.value) || 0 })}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Budget ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                  placeholder="2000"
                />
              </div>
              
              <button type="submit" style={styles.submitBtn}>
                Create Trip
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

