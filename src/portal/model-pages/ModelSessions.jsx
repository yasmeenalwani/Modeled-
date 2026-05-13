import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import LocationHelper from '../../components/LocationHelper';
import ModelToProChat from '../../components/ModelToProChat';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
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
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.25rem',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  
  // Sessions list
  sessionsList: {},
  sessionCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  sessionIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'rgba(233,69,96,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
  },
  sessionInfo: {},
  sessionService: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  sessionMeta: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.5rem',
  },
  sessionTags: {
    display: 'flex',
    gap: '0.5rem',
  },
  sessionTag: {
    padding: '0.25rem 0.6rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  sessionRight: {
    textAlign: 'right',
  },
  sessionSaved: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: '0.25rem',
  },
  sessionOriginal: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.4)',
    textDecoration: 'line-through',
  },
  sessionPaid: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    marginTop: '0.25rem',
  },
  sessionDate: {
    marginTop: '0.75rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    display: 'inline-block',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'rgba(255,255,255,0.5)',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
};

// Mock sessions data
const mockSessions = [
  {
    id: 1,
    service: 'Balayage Highlights',
    icon: '',
    category: 'color',
    date: 'Dec 2, 2024',
    time: '10:00 AM',
    pro: 'Sarah M.',
    salon: 'Luxe Studio',
    duration: '3 hours',
    originalPrice: 250,
    paid: 45,
    status: 'completed',
    rating: 5,
  },
  {
    id: 2,
    service: 'Blowout & Style',
    icon: '',
    category: 'blowouts',
    date: 'Nov 28, 2024',
    time: '2:00 PM',
    pro: 'Jessica K.',
    salon: 'Glamour Salon',
    duration: '45 min',
    originalPrice: 65,
    paid: 20,
    status: 'completed',
    rating: 5,
  },
  {
    id: 3,
    service: 'Haircut & Trim',
    icon: '',
    category: 'haircuts',
    date: 'Nov 20, 2024',
    time: '11:00 AM',
    pro: 'Amanda L.',
    salon: 'Studio 54 Hair',
    duration: '1 hour',
    originalPrice: 85,
    paid: 20,
    status: 'completed',
    rating: 4,
  },
  {
    id: 4,
    service: 'Root Touch-Up',
    icon: '',
    category: 'color',
    date: 'Nov 12, 2024',
    time: '10:30 AM',
    pro: 'Maria C.',
    salon: 'Color Bar',
    duration: '2 hours',
    originalPrice: 120,
    paid: 30,
    status: 'completed',
    rating: 5,
  },
  {
    id: 5,
    service: 'Blowout',
    icon: '',
    category: 'blowouts',
    date: 'Nov 5, 2024',
    time: '3:00 PM',
    pro: 'Sarah M.',
    salon: 'Luxe Studio',
    duration: '40 min',
    originalPrice: 55,
    paid: 15,
    status: 'completed',
    rating: 5,
  },
  {
    id: 6,
    service: 'Deep Conditioning',
    icon: '',
    category: 'treatments',
    date: 'Oct 28, 2024',
    time: '1:00 PM',
    pro: 'Lisa T.',
    salon: 'Wellness Hair',
    duration: '1 hour',
    originalPrice: 75,
    paid: 15,
    status: 'completed',
    rating: 4,
  },
];

export default function ModelSessions() {
  const { user } = useAuthenticator();
  const [filter, setFilter] = useState('all');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modelProfile, setModelProfile] = useState(null);
  
  useEffect(() => {
    loadUpcomingBookings();
    loadModelProfile();
  }, [user]);

  const loadUpcomingBookings = async () => {
    try {
      const userId = user?.userId || user?.username;
      const { data: profiles } = await client.models.ModelProfile.list({
        filter: { userId: { eq: userId } },
      });
      
      if (profiles && profiles.length > 0) {
        const modelId = profiles[0].id;
        const { data: bookings } = await client.models.Booking.list({
          filter: {
            modelId: { eq: modelId },
            status: { eq: 'confirmed' },
          },
        });
        
        // Filter to only upcoming bookings
        const now = new Date();
        const upcoming = (bookings || []).filter(b => {
          const appointmentDate = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
          return appointmentDate > now;
        });
        setUpcomingBookings(upcoming);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadModelProfile = async () => {
    try {
      const userId = user?.userId || user?.username;
      const { data: profiles } = await client.models.ModelProfile.list({
        filter: { userId: { eq: userId } },
      });
      if (profiles && profiles.length > 0) {
        setModelProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleQuickMessage = async (promptType) => {
    if (!selectedBooking) return;
    
    // Find or create chat and send message
    try {
      const { data: chats } = await client.models.ModelToProChat.list({
        filter: { bookingId: { eq: selectedBooking.id } },
      });
      
      let chat = chats && chats.length > 0 ? chats[0] : null;
      
      if (!chat) {
        const appointmentDateTime = new Date(`${selectedBooking.appointmentDate}T${selectedBooking.appointmentTime}`);
        const chatOpensAt = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
        const chatClosesAt = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        const { data: newChat } = await client.models.ModelToProChat.create({
          bookingId: selectedBooking.id,
          modelId: selectedBooking.modelId,
          professionalId: selectedBooking.professionalId,
          chatOpensAt: chatOpensAt.toISOString(),
          chatClosesAt: chatClosesAt.toISOString(),
          isActive: false,
          status: 'pending',
        });
        chat = newChat;
      }
      
      const promptMessages = {
        'omw': 'On my way!',
        '5_mins_out': 'Be there in 5 minutes!',
        'just_got_off_subway': 'Just got off the subway, almost there!',
        'running_late': 'Running a bit late, sorry!',
      };
      
      await client.models.ModelToProMessage.create({
        chatId: chat.id,
        senderId: user?.userId || user?.username,
        senderType: 'model',
        senderName: modelProfile?.firstName || 'Model',
        content: promptMessages[promptType] || promptType,
        messageType: 'quick_prompt',
        quickPromptType: promptType,
      });
    } catch (error) {
      console.error('Error sending quick message:', error);
    }
  };
  
  const filteredSessions = filter === 'all' 
    ? mockSessions 
    : mockSessions.filter(s => s.category === filter);

  const stats = {
    total: mockSessions.length,
    upcoming: upcomingBookings.length,
    level: 1,
    avgRating: (mockSessions.reduce((sum, s) => sum + s.rating, 0) / mockSessions.length).toFixed(1),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Sessions</h1>
          <p style={styles.subtitle}>Your complete hair journey history</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#e94560' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Sessions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.upcoming}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#667eea' }}>{stats.level}</div>
          <div style={styles.statLabel}>Level</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>{stats.avgRating}</div>
          <div style={styles.statLabel}>Avg. Rating Given</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {[
          { key: 'all', label: 'All Sessions' },
          { key: 'color', label: 'Color' },
          { key: 'haircuts', label: 'Haircuts' },
          { key: 'blowouts', label: 'Blowouts' },
          { key: 'treatments', label: 'Treatments' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              ...styles.filterBtn,
              ...(filter === f.key ? styles.filterBtnActive : {}),
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Upcoming Sessions with Location Helper & Chat */}
      {upcomingBookings.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
            📍 Upcoming Sessions
          </h2>
          {upcomingBookings.map(booking => (
            <div key={booking.id} style={{
              background: 'rgba(139, 30, 63, 0.05)',
              border: '1px solid rgba(139, 30, 63, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                    {booking.serviceType || 'Service'}
                  </h3>
                  <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                    {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                  </p>
                  <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                    {booking.location}
                  </p>
                </div>
                <div>
                  <LocationHelper 
                    booking={booking} 
                    onQuickMessage={handleQuickMessage}
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <ModelToProChat booking={booking} modelProfile={modelProfile} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions List */}
      <div style={styles.sessionsList}>
        {filteredSessions.map(session => (
          <div
            key={session.id}
            style={styles.sessionCard}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)';
              e.currentTarget.style.transform = 'translateX(5px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={styles.sessionIcon}>{session.icon}</div>
            
            <div style={styles.sessionInfo}>
              <div style={styles.sessionService}>{session.service}</div>
              <div style={styles.sessionMeta}>
                with {session.pro} • {session.salon} • {session.duration}
              </div>
              <div style={styles.sessionTags}>
                <span style={{
                  ...styles.sessionTag,
                  background: 'rgba(76,175,80,0.2)',
                  color: '#4caf50',
                }}>
                  {session.status}
                </span>
                <span style={{
                  ...styles.sessionTag,
                  background: 'rgba(255,193,7,0.2)',
                  color: '#ffc107',
                }}>
                  {'★'.repeat(session.rating)}
                </span>
              </div>
            </div>
            
            <div style={styles.sessionRight}>
              <div style={styles.sessionPaid}>You paid ${session.paid}</div>
              <div style={styles.sessionDate}>📅 {session.date}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

