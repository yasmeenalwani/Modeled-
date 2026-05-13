// ============================================
// CALENDAR VIEW SWITCHER COMPONENT
// ============================================

import React from 'react';

const styles = {
  container: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '500',
  },
  buttonActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
};

export default function CalendarViewSwitcher({ viewMode, onViewChange }) {
  const views = [
    { id: 'month', label: '📅 Month', icon: '📅' },
    { id: 'week', label: '📆 Week', icon: '📆' },
    { id: 'day', label: '📋 Day', icon: '📋' },
    { id: 'list', label: '📝 List', icon: '📝' },
    { id: 'multi', label: '🔀 Multi-View', icon: '🔀' },
  ];

  return (
    <div style={styles.container}>
      {views.map(view => (
        <button
          key={view.id}
          style={{
            ...styles.button,
            ...(viewMode === view.id ? styles.buttonActive : {}),
          }}
          onClick={() => onViewChange(view.id)}
          onMouseOver={(e) => {
            if (viewMode !== view.id) {
              e.target.style.background = 'rgba(255,255,255,0.08)';
            }
          }}
          onMouseOut={(e) => {
            if (viewMode !== view.id) {
              e.target.style.background = 'rgba(255,255,255,0.05)';
            }
          }}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}

