import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { logOutreachActivity } from '../../utils/crmService';

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
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
    marginBottom: '1rem',
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
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  contactCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    marginBottom: '1rem',
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
  btn: {
    padding: '0.5rem 1rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '8px',
    color: '#e94560',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
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
};

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddContact, setShowAddContact] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    title: '',
    meetingNotes: '',
    interestLevel: 'medium',
    nextSteps: '',
  });

  useEffect(() => {
    loadTrip();
    loadContacts();
  }, [id]);

  const loadTrip = async () => {
    try {
      const { data, errors } = await client.models.BusinessTrip.get({ id });
      if (errors) throw new Error(errors[0]?.message);
      setTrip(data);
    } catch (error) {
      console.error('Error loading trip:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const { data, errors } = await client.models.TripContact.list({
        filter: { tripId: { eq: id } },
      });
      if (errors) throw new Error(errors[0]?.message);
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      const { data, errors } = await client.models.TripContact.create({
        ...contactForm,
        tripId: id,
        createdAt: new Date().toISOString(),
      });
      if (errors) throw new Error(errors[0]?.message);
      
      // Update trip stats
      await client.models.BusinessTrip.update({
        id,
        contactsMade: (trip.contactsMade || 0) + 1,
      });
      
      alert('✅ Contact added!');
      setShowAddContact(false);
      setContactForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        title: '',
        meetingNotes: '',
        interestLevel: 'medium',
        nextSteps: '',
      });
      loadContacts();
      loadTrip();
    } catch (error) {
      console.error('Error adding contact:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleCreateProspect = async (contact) => {
    try {
      // Create prospect in CRM
      const { data: prospect, errors } = await client.models.Prospect.create({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        title: contact.title,
        prospectType: 'professional',
        source: 'event',
        city: trip.city,
        state: trip.state,
        stage: contact.interestLevel === 'high' ? 'qualified' : 'contacted',
        notes: `Met at ${trip.name}. ${contact.meetingNotes || ''}`,
        createdAt: new Date().toISOString(),
      });
      
      if (errors) throw new Error(errors[0]?.message);
      
      // Link contact to prospect
      await client.models.TripContact.update({
        id: contact.id,
        prospectId: prospect.id,
      });
      
      // Update trip stats
      await client.models.BusinessTrip.update({
        id,
        prospectsMet: (trip.prospectsMet || 0) + 1,
      });
      
      alert('✅ Prospect created in CRM!');
      loadTrip();
    } catch (error) {
      console.error('Error creating prospect:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Trip not found</div>
          <button style={styles.backBtn} onClick={() => navigate('/admin/trips')}>
            ← Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/admin/trips')}>
        ← Back to Trips
      </button>
      
      <div style={styles.header}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{trip.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>
            📍 {trip.city}{trip.state ? `, ${trip.state}` : ''}
            {trip.venue && ` • ${trip.venue}`}
          </p>
        </div>
        <button
          style={styles.addBtn}
          onClick={() => setShowAddContact(true)}
        >
          + Add Contact
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'overview' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'contacts' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('contacts')}
        >
          Contacts ({contacts.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'schedule' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('schedule')}
        >
          Schedule
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'followups' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('followups')}
        >
          Follow-ups
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Trip Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <strong>Dates:</strong> {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Status:</strong> {trip.status.replace('_', ' ').toUpperCase()}
              </div>
              <div>
                <strong>Type:</strong> {trip.tripType.replace('_', ' ').toUpperCase()}
              </div>
              <div>
                <strong>Budget:</strong> ${trip.budget || 0}
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Goals & Progress</h2>
            {trip.primaryGoal && (
              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                <strong>Primary Goal:</strong> {trip.primaryGoal}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{trip.contactsMade || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  / {trip.targetContacts || 0} Contacts
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{trip.prospectsMet || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  / {trip.targetProspects || 0} Prospects
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{trip.meetingsScheduled || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Meetings</div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>{trip.followUpsCompleted || 0}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Follow-ups</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Contacts Made</h2>
          {contacts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
              No contacts added yet. Click "Add Contact" to start tracking.
            </div>
          ) : (
            contacts.map(contact => (
              <div key={contact.id} style={styles.contactCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                      {contact.firstName} {contact.lastName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                      {contact.title} {contact.company && `at ${contact.company}`}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    background: contact.interestLevel === 'high' ? '#7ed32120' : '#f5a62320',
                    color: contact.interestLevel === 'high' ? '#7ed321' : '#f5a623',
                  }}>
                    {contact.interestLevel.toUpperCase()}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
                  📧 {contact.email || 'No email'} • 📞 {contact.phone || 'No phone'}
                </div>
                {contact.meetingNotes && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '0.5rem',
                  }}>
                    {contact.meetingNotes}
                  </div>
                )}
                {contact.nextSteps && (
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
                    <strong>Next Steps:</strong> {contact.nextSteps}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {!contact.prospectId && (
                    <button
                      style={styles.btn}
                      onClick={() => handleCreateProspect(contact)}
                    >
                      ➕ Add to CRM
                    </button>
                  )}
                  {contact.prospectId && (
                    <button
                      style={styles.btn}
                      onClick={() => navigate(`/admin/crm`)}
                    >
                      📞 View in CRM
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddContact && (
        <div style={{
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
        }} onClick={() => setShowAddContact(false)}>
          <div style={{
            background: '#1a1a2e',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Add Contact</h2>
            <form onSubmit={handleAddContact}>
              <input
                style={styles.input}
                placeholder="First Name *"
                value={contactForm.firstName}
                onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                required
              />
              <input
                style={styles.input}
                placeholder="Last Name"
                value={contactForm.lastName}
                onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
              />
              <input
                style={styles.input}
                type="email"
                placeholder="Email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
              <input
                style={styles.input}
                type="tel"
                placeholder="Phone"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Company"
                value={contactForm.company}
                onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
              />
              <input
                style={styles.input}
                placeholder="Title"
                value={contactForm.title}
                onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
              />
              <textarea
                style={styles.textarea}
                placeholder="Meeting Notes"
                value={contactForm.meetingNotes}
                onChange={(e) => setContactForm({ ...contactForm, meetingNotes: e.target.value })}
              />
              <select
                style={styles.input}
                value={contactForm.interestLevel}
                onChange={(e) => setContactForm({ ...contactForm, interestLevel: e.target.value })}
              >
                <option value="high">High Interest</option>
                <option value="medium">Medium Interest</option>
                <option value="low">Low Interest</option>
                <option value="not_interested">Not Interested</option>
              </select>
              <input
                style={styles.input}
                placeholder="Next Steps"
                value={contactForm.nextSteps}
                onChange={(e) => setContactForm({ ...contactForm, nextSteps: e.target.value })}
              />
              <button
                type="submit"
                style={{
                  ...styles.addBtn,
                  width: '100%',
                  marginTop: '1rem',
                }}
              >
                Add Contact
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

