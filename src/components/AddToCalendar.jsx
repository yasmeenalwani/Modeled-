import React, { useState } from 'react';
import {
  downloadICalFile,
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  createCalendarEventFromBooking,
} from '../utils/calendar';

/**
 * AddToCalendar Component
 * 
 * Provides buttons to add events to various calendars
 * 
 * @param {Object} props
 * @param {Object} props.booking - Booking object
 * @param {string} props.userType - 'model' | 'professional'
 */
export default function AddToCalendar({ booking, userType = 'model' }) {
  const [showMenu, setShowMenu] = useState(false);

  const event = createCalendarEventFromBooking(booking, userType);

  const handleICalDownload = () => {
    downloadICalFile(event, `modeled-booking-${booking.id}.ics`);
    setShowMenu(false);
  };

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(event), '_blank');
    setShowMenu(false);
  };

  const handleOutlookCalendar = () => {
    window.open(generateOutlookCalendarUrl(event), '_blank');
    setShowMenu(false);
  };

  const styles = {
    container: {
      position: 'relative',
      display: 'inline-block',
    },
    button: {
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      fontWeight: '500',
      color: '#fff',
      background: '#8B1E3F',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    menu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '0.5rem',
      background: '#fff',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      minWidth: '200px',
      zIndex: 1000,
      overflow: 'hidden',
    },
    menuItem: {
      padding: '0.75rem 1rem',
      cursor: 'pointer',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      fontSize: '0.9rem',
      color: '#2D2926',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'background 0.2s',
    },
    menuItemLast: {
      borderBottom: 'none',
    },
  };

  return (
    <div style={styles.container}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={styles.button}
        onMouseOver={(e) => {
          e.target.style.opacity = '0.9';
        }}
        onMouseOut={(e) => {
          e.target.style.opacity = '1';
        }}
      >
        <span>📅</span>
        Add to Calendar
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div style={styles.menu}>
            <div
              style={styles.menuItem}
              onClick={handleGoogleCalendar}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(139, 30, 63, 0.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span>📅</span>
              Google Calendar
            </div>
            <div
              style={styles.menuItem}
              onClick={handleOutlookCalendar}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(139, 30, 63, 0.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span>📅</span>
              Outlook Calendar
            </div>
            <div
              style={{ ...styles.menuItem, ...styles.menuItemLast }}
              onClick={handleICalDownload}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(139, 30, 63, 0.05)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <span>📥</span>
              Download .ics (Any Calendar)
            </div>
          </div>
        </>
      )}
    </div>
  );
}

