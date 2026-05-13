// ============================================
// MY SCHEDULE - Consolidated Page
// Calendar + Bookings + Pending Actions in one unified view
// ============================================

import React, { useState, useMemo } from 'react';
import PartnerCalendar from './PartnerCalendar';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  
  // Tab navigation
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#5A3A2A', // Muted brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  tabBadge: {
    marginLeft: '0.5rem',
    padding: '0.15rem 0.4rem',
    background: '#f85149',
    color: '#FFFEF9',
    borderRadius: '8px',
    fontSize: '0.65rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock bookings data
const mockBookings = [
  {
    id: 1,
    date: '2024-12-07',
    time: '10:00 AM',
    service: 'Balayage Training',
    model: 'Emma J.',
    professional: 'Sarah M.',
    status: 'confirmed',
  },
  {
    id: 2,
    date: '2024-12-08',
    time: '2:00 PM',
    service: 'Cut Practice',
    model: 'Sophia L.',
    professional: 'Jessica K.',
    status: 'pending',
  },
  {
    id: 3,
    date: '2024-12-09',
    time: '11:00 AM',
    service: 'Color Session',
    model: 'Olivia C.',
    professional: 'Amanda L.',
    status: 'confirmed',
  },
  {
    id: 4,
    date: '2024-12-10',
    time: '3:00 PM',
    service: 'Blowout',
    model: 'Ava M.',
    professional: 'Maria C.',
    status: 'pending',
  },
];

// Mock pending actions
const mockPending = [
  {
    id: 1,
    type: 'booking_request',
    service: 'Highlights',
    model: 'Isabella R.',
    requestedDate: '2024-12-12',
    requestedTime: '2:00 PM',
    professional: 'Sarah M.',
  },
  {
    id: 2,
    type: 'cancellation',
    service: 'Color Correction',
    model: 'Mia T.',
    originalDate: '2024-12-11',
    reason: 'Schedule conflict',
  },
  {
    id: 3,
    type: 'reschedule',
    service: 'Haircut',
    model: 'Charlotte W.',
    originalDate: '2024-12-13',
    newDate: '2024-12-14',
    newTime: '4:00 PM',
  },
];

function BookingsList() {
  const [filter, setFilter] = useState('all');

  const filteredBookings = useMemo(() => {
    if (filter === 'all') return mockBookings;
    return mockBookings.filter(b => b.status === filter);
  }, [filter]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
            Bookings List 📋
          </h1>
          <p style={{ color: '#5A3A2A', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
            View and manage all salon bookings
          </p>
        </div>
        <button style={{
          padding: '0.65rem 1.25rem',
          background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
          border: 'none',
          borderRadius: '6px',
          color: '#FFFEF9',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          + Add Booking
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
            {mockBookings.filter(b => new Date(b.date) >= new Date()).length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Upcoming
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d29922', fontFamily: '"Alike", "Georgia", serif' }}>
            {mockBookings.filter(b => b.status === 'pending').length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Pending
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3fb950', fontFamily: '"Alike", "Georgia", serif' }}>
            {mockBookings.filter(b => b.status === 'confirmed').length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Confirmed
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#a371f7', fontFamily: '"Alike", "Georgia", serif' }}>
            {mockBookings.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Total This Month
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { key: 'all', label: 'All Bookings' },
          { key: 'pending', label: 'Pending' },
          { key: 'confirmed', label: 'Confirmed' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              padding: '0.5rem 1rem',
              background: filter === f.key ? 'rgba(139, 30, 63, 0.1)' : '#FFFEF9',
              border: `1px solid ${filter === f.key ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
              borderRadius: '6px',
              color: filter === f.key ? '#8B1E3F' : '#4A2A1A',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredBookings.map(booking => (
          <div
            key={booking.id}
            style={{
              background: '#FFFEF9',
              border: '1px solid rgba(139, 30, 63, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{
              width: '60px',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#8B1E3F',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {new Date(booking.date).getDate()}
              </div>
              <div style={{
                fontSize: '0.7rem',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {new Date(booking.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.25rem',
                color: '#4A2A1A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {booking.service}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {booking.time} • {booking.model} with {booking.professional}
              </div>
            </div>
            <span style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: booking.status === 'confirmed' 
                ? 'rgba(46,160,67,0.2)' 
                : 'rgba(210,153,34,0.2)',
              color: booking.status === 'confirmed' ? '#3fb950' : '#d29922',
            }}>
              {booking.status}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(139, 30, 63, 0.05)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '4px',
                color: '#4A2A1A',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PendingActions() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
          Pending Actions ⚠️
        </h1>
        <p style={{ color: '#5A3A2A', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Items requiring your attention
        </p>
      </div>

      {/* Alert Banner */}
      <div style={{
        background: 'rgba(248,81,73,0.1)',
        border: '1px solid rgba(248,81,73,0.3)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
      }}>
        <span style={{ fontSize: '1.5rem' }}>⚠️</span>
        <div>
          <strong style={{ color: '#f85149' }}>{mockPending.length} items need attention</strong>
          <p style={{ color: '#5A3A2A', fontSize: '0.85rem', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Review and take action on pending requests
          </p>
        </div>
      </div>

      {/* Pending Items */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {mockPending.map(item => (
          <div
            key={item.id}
            style={{
              background: '#FFFEF9',
              border: '1px solid rgba(139, 30, 63, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}>
              <div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: '#4A2A1A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {item.type === 'booking_request' && '📅 New Booking Request'}
                  {item.type === 'cancellation' && '❌ Cancellation Request'}
                  {item.type === 'reschedule' && '🔄 Reschedule Request'}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: '#5A3A2A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {item.service} • {item.model}
                </div>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: 'rgba(248,81,73,0.2)',
                color: '#f85149',
              }}>
                Urgent
              </span>
            </div>

            <div style={{
              fontSize: '0.85rem',
              color: '#5A3A2A',
              marginBottom: '1rem',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              {item.type === 'booking_request' && (
                <>Requested: {item.requestedDate} at {item.requestedTime} with {item.professional}</>
              )}
              {item.type === 'cancellation' && (
                <>Original booking: {item.originalDate} • Reason: {item.reason}</>
              )}
              {item.type === 'reschedule' && (
                <>From: {item.originalDate} → To: {item.newDate} at {item.newTime}</>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                flex: 1,
                padding: '0.6rem',
                background: '#3fb950',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFEF9',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {item.type === 'booking_request' ? 'Approve' : item.type === 'cancellation' ? 'Confirm Cancel' : 'Approve Reschedule'}
              </button>
              <button style={{
                flex: 1,
                padding: '0.6rem',
                background: 'rgba(248,81,73,0.1)',
                border: '1px solid rgba(248,81,73,0.3)',
                borderRadius: '6px',
                color: '#f85149',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnerScheduleConsolidated() {
  const [activeTab, setActiveTab] = useState('calendar');
  const pendingCount = mockPending.length;

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'calendar' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('calendar')}
        >
          📅 Calendar
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'list' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('list')}
        >
          📋 Bookings List
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'pending' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('pending')}
        >
          ⚠️ Pending Actions
          {pendingCount > 0 && <span style={styles.tabBadge}>{pendingCount}</span>}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'calendar' && <PartnerCalendar />}
      {activeTab === 'list' && <BookingsList />}
      {activeTab === 'pending' && <PendingActions />}
    </div>
  );
}

