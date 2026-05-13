// ============================================
// MONTH VIEW COMPONENT
// ============================================

import React from 'react';
import { getServiceById } from '../data/services';

const styles = {
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  dayHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  dayCell: {
    minHeight: '120px',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  dayCellToday: {
    background: 'rgba(233,69,96,0.15)',
    borderColor: '#e94560',
    borderWidth: '2px',
  },
  dayCellSelected: {
    background: 'rgba(102,126,234,0.2)',
    borderColor: '#667eea',
    borderWidth: '2px',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: 'rgba(255,255,255,0.7)',
  },
  dayNumberToday: {
    color: '#e94560',
    fontWeight: '700',
  },
  dayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.25rem',
  },
  event: {
    padding: '0.3rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderLeft: '3px solid',
  },
  eventConfirmed: {
    background: 'rgba(76,175,80,0.25)',
    borderLeftColor: '#4caf50',
    color: '#4caf50',
  },
  eventPending: {
    background: 'rgba(255,193,7,0.25)',
    borderLeftColor: '#ffc107',
    color: '#ffc107',
  },
  eventCompleted: {
    background: 'rgba(33,150,243,0.25)',
    borderLeftColor: '#2196f3',
    color: '#2196f3',
  },
  eventCancelled: {
    background: 'rgba(244,67,54,0.25)',
    borderLeftColor: '#f44336',
    color: '#f44336',
    opacity: 0.6,
  },
  eventCount: {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    background: 'rgba(233,69,96,0.8)',
    color: '#fff',
    borderRadius: '10px',
    padding: '0.1rem 0.4rem',
    fontSize: '0.65rem',
    fontWeight: '700',
  },
};

export default function MonthView({ calendarDays, selectedDay, onDayClick, onEventClick }) {
  const getEventStyle = (status) => {
    return {
      ...styles.event,
      ...(status === 'confirmed' ? styles.eventConfirmed :
          status === 'pending' ? styles.eventPending :
          status === 'completed' ? styles.eventCompleted :
          styles.eventCancelled),
    };
  };

  const isSelected = (dayDate) => {
    if (!selectedDay) return false;
    return dayDate.toDateString() === selectedDay.toDateString();
  };

  const isToday = (dayDate) => {
    const today = new Date();
    return dayDate.toDateString() === today.toDateString();
  };

  return (
    <>
      <div style={styles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={styles.dayHeader}>{day}</div>
        ))}
      </div>
      <div style={styles.calendarGrid}>
        {calendarDays.map((day, index) => {
          const dayIsToday = isToday(day.date);
          const dayIsSelected = isSelected(day.date);
          
          return (
            <div
              key={index}
              style={{
                ...styles.dayCell,
                ...(dayIsToday ? styles.dayCellToday : {}),
                ...(dayIsSelected && !dayIsToday ? styles.dayCellSelected : {}),
                ...(!day.isCurrentMonth ? styles.dayCellOtherMonth : {}),
              }}
              onClick={() => onDayClick(day.date)}
              onMouseOver={(e) => {
                if (!dayIsSelected && !dayIsToday) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (!dayIsSelected && !dayIsToday) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }
              }}
            >
              <div style={{
                ...styles.dayNumber,
                ...(dayIsToday ? styles.dayNumberToday : {}),
              }}>
                {day.day}
              </div>
              {day.events.length > 0 && day.events.length <= 3 && (
                <div style={styles.dayEvents}>
                  {day.events.map((event, eventIndex) => {
                    const service = getServiceById(event.serviceId);
                    return (
                      <div
                        key={eventIndex}
                        style={getEventStyle(event.status)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        title={`${event.time} - ${service?.name || event.serviceId} - ${event.model.name} + ${event.professional.name}`}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.zIndex = '10';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = '1';
                        }}
                      >
                        {event.time} {service?.icon || '💇'}
                      </div>
                    );
                  })}
                </div>
              )}
              {day.events.length > 3 && (
                <>
                  <div style={styles.dayEvents}>
                    {day.events.slice(0, 2).map((event, eventIndex) => {
                      const service = getServiceById(event.serviceId);
                      return (
                        <div
                          key={eventIndex}
                          style={getEventStyle(event.status)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          title={`${event.time} - ${service?.name || event.serviceId}`}
                        >
                          {event.time} {service?.icon || '💇'}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.eventCount}>
                    +{day.events.length - 2}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

