import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import ModelToProChat from './ModelToProChat';

const client = generateClient();

const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  chatSchedule: {
    display: 'grid',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  chatCard: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '8px',
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  chatIcon: {
    fontSize: '1.2rem',
  },
  chatTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  chatInfo: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  chatStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statusPending: {
    background: 'rgba(158, 158, 158, 0.15)',
    color: '#9e9e9e',
    border: '1px solid rgba(158, 158, 158, 0.3)',
  },
  statusActive: {
    background: 'rgba(76, 175, 80, 0.15)',
    color: '#4caf50',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  statusClosed: {
    background: 'rgba(244, 67, 54, 0.15)',
    color: '#f44336',
    border: '1px solid rgba(244, 67, 54, 0.3)',
  },
  openChatBtn: {
    marginTop: '0.75rem',
    padding: '0.6rem 1.25rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    width: '100%',
  },
  viewDetailsBtn: {
    marginTop: '0.75rem',
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    color: '#8B1E3F',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    width: '100%',
  },
};

/**
 * ChatSchedule Component
 * Shows chat schedule and status for a booking
 * Displays 3 chat types:
 * 1. Support Chat (Modeled) - Opens 24h before, closes 30min after
 * 2. Direct Chat (Pro ↔ Model) - Opens 1h before, closes 30min after
 */
export default function ChatSchedule({ booking, userType, modelProfile, professionalProfile }) {
  const [supportChat, setSupportChat] = useState(null);
  const [directChat, setDirectChat] = useState(null);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (booking && booking.id) {
      loadChats();
    }
  }, [booking]);

  const loadChats = async () => {
    if (!booking || !booking.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load direct chat (Pro ↔ Model)
      const { data: directChats, errors } = await client.models.ModelToProChat.list({
        filter: { bookingId: { eq: booking.id } },
      });
      
      if (errors) {
        console.error('Error loading chats:', errors);
        setError('Failed to load chat information');
        return;
      }
      
      if (directChats && directChats.length > 0) {
        setDirectChat(directChats[0]);
      }

      // TODO: Load support chats when ProfessionalToModeledChat and ModelToModeledChat models are created
      // For now, we'll calculate the schedule based on booking date
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load chat information');
    } finally {
      setLoading(false);
    }
  };

  const getChatStatus = (chat, opensAt, closesAt) => {
    if (!chat && !opensAt) return { status: 'pending', label: 'Not scheduled' };
    
    const now = new Date();
    const openTime = new Date(opensAt || chat?.chatOpensAt);
    const closeTime = new Date(closesAt || chat?.chatClosesAt);

    if (now < openTime) {
      const hoursUntil = Math.floor((openTime - now) / (1000 * 60 * 60));
      return { 
        status: 'pending', 
        label: `Opens in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}`,
        icon: '⏳'
      };
    } else if (now >= openTime && now <= closeTime) {
      return { 
        status: 'active', 
        label: 'Active now',
        icon: '🟢'
      };
    } else {
      return { 
        status: 'closed', 
        label: 'Closed',
        icon: '🔴'
      };
    }
  };

  const calculateChatTimes = () => {
    if (!booking?.appointmentDate || !booking?.appointmentTime) return null;

    const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
    
    // Support chat: Opens 24h before, closes 30min after
    const supportChatOpens = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
    const supportChatCloses = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000);

    // Direct chat: Opens 1h before, closes 30min after
    const directChatOpens = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
    const directChatCloses = new Date(appointmentDateTime.getTime() + 30 * 60 * 1000);

    return {
      support: { opensAt: supportChatOpens, closesAt: supportChatCloses },
      direct: { opensAt: directChatOpens, closesAt: directChatCloses },
    };
  };

  const chatTimes = calculateChatTimes();
  const supportStatus = chatTimes?.support 
    ? getChatStatus(null, chatTimes.support.opensAt, chatTimes.support.closesAt)
    : { status: 'pending', label: 'Not scheduled', icon: '⏳' };
  const directStatus = chatTimes?.direct
    ? getChatStatus(directChat, chatTimes.direct.opensAt, chatTimes.direct.closesAt)
    : { status: 'pending', label: 'Not scheduled', icon: '⏳' };

  if (!booking) return null;

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ color: '#f44336', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Error loading chat schedule: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💬 Chat Windows</h3>
      
      <div style={styles.chatSchedule}>
        {/* Support Chat (Modeled) */}
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <span style={styles.chatIcon}>🟢</span>
            <span style={styles.chatTitle}>Support Chat (Modeled)</span>
          </div>
          {chatTimes?.support && (
            <>
              <div style={styles.chatInfo}>
                Opens: {chatTimes.support.opensAt.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
              <div style={styles.chatInfo}>
                Closes: {chatTimes.support.closesAt.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </>
          )}
          <div style={styles.chatInfo}>
            Use for: Questions, issues, support
          </div>
          <div style={{ ...styles.chatStatus, ...styles[`status${supportStatus.status.charAt(0).toUpperCase() + supportStatus.status.slice(1)}`] }}>
            <span>{supportStatus.icon}</span>
            <span>{supportStatus.label}</span>
          </div>
          {supportStatus.status === 'active' && (
            <button 
              style={styles.openChatBtn}
              onClick={() => setShowSupportChat(true)}
            >
              Open Support Chat
            </button>
          )}
          {supportStatus.status === 'pending' && chatTimes?.support && (
            <button 
              style={styles.viewDetailsBtn}
              disabled
            >
              Opens in {Math.floor((chatTimes.support.opensAt - new Date()) / (1000 * 60 * 60))} hours
            </button>
          )}
        </div>

        {/* Direct Chat (Pro ↔ Model) */}
        <div style={styles.chatCard}>
          <div style={styles.chatHeader}>
            <span style={styles.chatIcon}>🔵</span>
            <span style={styles.chatTitle}>
              Direct Chat ({userType === 'model' ? 'Professional' : 'Model'})
            </span>
          </div>
          {chatTimes?.direct && (
            <>
              <div style={styles.chatInfo}>
                Opens: {chatTimes.direct.opensAt.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
              <div style={styles.chatInfo}>
                Closes: {chatTimes.direct.closesAt.toLocaleString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </div>
            </>
          )}
          <div style={styles.chatInfo}>
            Use for: Coordination, arrival, updates
          </div>
          <div style={{ ...styles.chatStatus, ...styles[`status${directStatus.status.charAt(0).toUpperCase() + directStatus.status.slice(1)}`] }}>
            <span>{directStatus.icon}</span>
            <span>{directStatus.label}</span>
          </div>
          {directStatus.status === 'active' && directChat && (
            <button 
              style={styles.openChatBtn}
              onClick={() => setShowDirectChat(true)}
            >
              Open Direct Chat
            </button>
          )}
          {directStatus.status === 'pending' && chatTimes?.direct && (
            <button 
              style={styles.viewDetailsBtn}
              disabled
            >
              Opens in {Math.floor((chatTimes.direct.opensAt - new Date()) / (1000 * 60 * 1000))} minutes
            </button>
          )}
        </div>
      </div>

      {/* Chat Modals */}
      {showDirectChat && directChat && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#FFFEF9',
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>Direct Chat</h3>
              <button 
                onClick={() => setShowDirectChat(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5A3A2A',
                }}
              >
                ×
              </button>
            </div>
            <ModelToProChat booking={booking} modelProfile={modelProfile} />
          </div>
        </div>
      )}
    </div>
  );
}

