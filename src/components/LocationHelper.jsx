import React, { useState } from 'react';

const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  routeInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  routeText: {
    fontSize: '0.95rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  timeEstimate: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  mapButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  quickButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  quickButton: {
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s',
  },
};

// NYC Borough mapping for travel time estimates
const boroughTravelTimes = {
  'Manhattan-Manhattan': { min: 15, max: 30 },
  'Manhattan-Brooklyn': { min: 25, max: 45 },
  'Manhattan-Queens': { min: 30, max: 50 },
  'Manhattan-Bronx': { min: 25, max: 40 },
  'Brooklyn-Brooklyn': { min: 20, max: 35 },
  'Brooklyn-Queens': { min: 25, max: 40 },
  'Queens-Queens': { min: 20, max: 35 },
};

function getBoroughFromLocation(location) {
  if (!location) return 'Manhattan';
  const loc = location.toLowerCase();
  if (loc.includes('brooklyn')) return 'Brooklyn';
  if (loc.includes('queens')) return 'Queens';
  if (loc.includes('bronx')) return 'Bronx';
  if (loc.includes('staten')) return 'Staten Island';
  return 'Manhattan';
}

function estimateTravelTime(fromLocation, toLocation) {
  const fromBorough = getBoroughFromLocation(fromLocation);
  const toBorough = getBoroughFromLocation(toLocation);
  
  if (fromBorough === toBorough) {
    const times = boroughTravelTimes[`${fromBorough}-${fromBorough}`] || { min: 15, max: 30 };
    return `${times.min}-${times.max} min`;
  }
  
  const key = `${fromBorough}-${toBorough}`;
  const reverseKey = `${toBorough}-${fromBorough}`;
  const times = boroughTravelTimes[key] || boroughTravelTimes[reverseKey] || { min: 30, max: 50 };
  return `${times.min}-${times.max} min`;
}

export default function LocationHelper({ booking, onQuickMessage }) {
  const [travelTime, setTravelTime] = useState('');

  React.useEffect(() => {
    if (booking?.location) {
      // In real app, would get model's location from profile
      const modelLocation = 'Manhattan'; // Would come from ModelProfile.locationZip
      const estTime = estimateTravelTime(modelLocation, booking.location);
      setTravelTime(estTime);
    }
  }, [booking]);

  const handleOpenMaps = () => {
    if (booking?.location) {
      const encodedLocation = encodeURIComponent(booking.location);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`, '_blank');
    }
  };

  const quickPrompts = [
    { text: 'OMW', value: 'omw' },
    { text: '5 Mins Out', value: '5_mins_out' },
    { text: 'Just got off Subway', value: 'just_got_off_subway' },
    { text: 'Running Late', value: 'running_late' },
  ];

  if (!booking) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Location Helper</h3>
      
      <div style={styles.routeInfo}>
        <div>
          <div style={styles.routeText}>
            <strong>To:</strong> {booking.location}
          </div>
          {travelTime && (
            <div style={styles.timeEstimate}>
              Est. Travel: {travelTime}
            </div>
          )}
        </div>
      </div>

      <button style={styles.mapButton} onClick={handleOpenMaps}>
        Get Directions
      </button>

      <div style={styles.quickButtons}>
        {quickPrompts.map((prompt) => (
          <button
            key={prompt.value}
            style={styles.quickButton}
            onClick={() => onQuickMessage && onQuickMessage(prompt.value)}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(139, 30, 63, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(139, 30, 63, 0.1)';
            }}
          >
            {prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
}

