import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getBookingsForUser, getBookingsForSalon } from '../../utils/bookingFlow';
import { getServiceById } from '../../admin/data/services';

const client = generateClient();

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
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  syncBtn: {
    padding: '0.65rem 1.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  addBtn: {
    padding: '0.65rem 1.25rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Layout
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '1.5rem',
  },
  
  // Calendar
  calendarCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  calendarMonth: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    width: '32px',
    height: '32px',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.25rem',
  },
  dayHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayCell: {
    aspectRatio: '1',
    padding: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  dayNumber: {
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
  },
  dayDots: {
    display: 'flex',
    gap: '2px',
    justifyContent: 'center',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  
  // Sidebar
  sidebar: {},
  
  // Pending requests
  pendingCard: {
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '12px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
  },
  pendingTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#f85149',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestItem: {
    padding: '1rem',
    background: '#FFFEF9',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  requestService: {
    fontWeight: '600',
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestTime: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  acceptBtn: {
    flex: 1,
    padding: '0.5rem',
    background: '#3fb950',
    border: 'none',
    borderRadius: '4px',
    color: '#FFFEF9',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  declineBtn: {
    flex: 1,
    padding: '0.5rem',
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '4px',
    color: '#f85149',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Today's schedule
  scheduleCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  scheduleTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  scheduleItem: {
    display: 'flex',
    gap: '1rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    borderLeft: '3px solid',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  scheduleTime: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#8B1E3F',
    width: '60px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleService: {
    fontWeight: '600',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  scheduleMeta: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data
const pendingRequests = [
  {
    id: 1,
    service: 'Balayage Practice',
    pro: 'Sarah M.',
    model: 'Emma J.',
    date: 'Dec 8',
    time: '10:00 AM',
  },
  {
    id: 2,
    service: 'Cut Training',
    pro: 'Amanda L.',
    model: 'Sophia L.',
    date: 'Dec 9',
    time: '2:00 PM',
  },
  {
    id: 3,
    service: 'Color Session',
    pro: 'Maria C.',
    model: 'Olivia C.',
    date: 'Dec 10',
    time: '11:00 AM',
  },
];

const todaySchedule = [
  { time: '9:00 AM', service: 'Team Meeting', pro: 'All Staff', color: '#a371f7' },
  { time: '10:30 AM', service: 'Blowout Training', pro: 'Jessica K. + Model', color: '#58a6ff' },
  { time: '1:00 PM', service: 'Color Session', pro: 'Sarah M. + Model', color: '#3fb950' },
  { time: '3:30 PM', service: 'Cut Practice', pro: 'Amanda L. + Model', color: '#d29922' },
];

const calendarDays = [
  { day: null }, { day: null }, { day: null }, { day: null }, { day: null }, { day: null }, { day: 1 },
  { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6, events: ['#58a6ff', '#3fb950'] }, { day: 7, events: ['#3fb950'] }, { day: 8, events: ['#58a6ff'] },
  { day: 9, events: ['#d29922'] }, { day: 10, events: ['#3fb950', '#58a6ff'] }, { day: 11 }, { day: 12 }, { day: 13 }, { day: 14 }, { day: 15, events: ['#a371f7', '#58a6ff', '#3fb950'] },
  { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20, events: ['#f85149'] }, { day: 21 }, { day: 22 },
  { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 },
  { day: 30 }, { day: 31 }, { day: null }, { day: null }, { day: null }, { day: null }, { day: null },
];

export default function PartnerCalendar() {
  const { user } = useAuthenticator();
  const [selectedDay, setSelectedDay] = useState(6);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // Load bookings for this partner's salon
      const loadedBookings = await getBookingsForUser(user?.userId, 'partner');
      setBookings(loadedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Calendar & Scheduling 📅</h1>
          <p style={styles.subtitle}>Manage bookings and team availability</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.syncBtn}>
            🔄 Sync with Google
          </button>
          <button style={styles.addBtn}>+ Block Time</button>
        </div>
      </div>

      {/* Layout */}
      <div style={styles.layout}>
        {/* Calendar */}
        <div style={styles.calendarCard}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarMonth}>December 2024</div>
            <div style={styles.calendarNav}>
              <button style={styles.navBtn}>←</button>
              <button style={styles.navBtn}>→</button>
            </div>
          </div>
          
          <div style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.dayHeader}>{day}</div>
            ))}
            
            {calendarDays.map((cell, i) => (
              <div
                key={i}
                style={{
                  ...styles.dayCell,
                  background: cell.day === selectedDay ? 'rgba(139, 30, 63, 0.1)' : 
                             cell.day === 6 ? 'rgba(46,160,67,0.1)' : 
                             'rgba(139, 30, 63, 0.05)',
                  border: cell.day === selectedDay ? '1px solid #8B1E3F' : '1px solid rgba(139, 30, 63, 0.1)',
                  opacity: cell.day ? 1 : 0.3,
                }}
                onClick={() => cell.day && setSelectedDay(cell.day)}
              >
                <div style={{
                  ...styles.dayNumber,
                  color: cell.day === 6 ? '#3fb950' : cell.day === selectedDay ? '#8B1E3F' : '#4A2A1A',
                  fontWeight: cell.day === 6 || cell.day === selectedDay ? '700' : '400',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {cell.day}
                </div>
                {cell.events && (
                  <div style={styles.dayDots}>
                    {cell.events.slice(0, 3).map((color, j) => (
                      <div key={j} style={{ ...styles.dot, background: color }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div style={{ 
            marginTop: '1.5rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(139, 30, 63, 0.15)',
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B1E3F' }} />
              <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Training</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950' }} />
              <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Confirmed</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d29922' }} />
              <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a371f7' }} />
              <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>Event</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Pending Requests */}
          <div style={styles.pendingCard}>
            <div style={styles.pendingTitle}>
              <span>⚠️</span> Pending Requests ({pendingRequests.length})
            </div>
            {pendingRequests.map(request => (
              <div key={request.id} style={styles.requestItem}>
                <div style={styles.requestHeader}>
                  <div style={styles.requestService}>{request.service}</div>
                  <div style={styles.requestTime}>{request.date}</div>
                </div>
                <div style={styles.requestMeta}>
                  {request.pro} + {request.model} • {request.time}
                </div>
                <div style={styles.requestActions}>
                  <button style={styles.acceptBtn}>Accept</button>
                  <button style={styles.declineBtn}>✕ Decline</button>
                </div>
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div style={styles.scheduleCard}>
            <div style={styles.scheduleTitle}>
              <span>📋</span> Today's Schedule
            </div>
            {todaySchedule.map((item, i) => (
              <div 
                key={i} 
                style={{
                  ...styles.scheduleItem,
                  borderLeftColor: item.color,
                }}
              >
                <div style={styles.scheduleTime}>{item.time}</div>
                <div style={styles.scheduleInfo}>
                  <div style={styles.scheduleService}>{item.service}</div>
                  <div style={styles.scheduleMeta}>{item.pro}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

