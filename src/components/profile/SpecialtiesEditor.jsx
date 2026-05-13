import React from 'react';
import { HAIR_SPECIALTIES, LANES, SERVICES, SERVICE_COMFORT_LEVELS, NOT_AVAILABLE_OPTIONS } from '../../utils/profileConstants';

const styles = {
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sectionDescription: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontStyle: 'italic',
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  chip: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  chipSelected: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    borderColor: '#8B1E3F',
  },
  serviceComfortSection: {
    marginBottom: '1.5rem',
  },
  serviceItem: {
    marginBottom: '1rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  serviceName: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  comfortLevels: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  comfortBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: '2px solid',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
};

export default function SpecialtiesEditor({
  formData,
  onChange,
}) {
  const handleSpecialtyToggle = (specialty) => {
    const current = formData.hairSpecialties || [];
    const updated = current.includes(specialty)
      ? current.filter(s => s !== specialty)
      : [...current, specialty];
    onChange('hairSpecialties', updated);
  };

  const handleLaneToggle = (lane) => {
    const current = formData.lanes || [];
    const updated = current.includes(lane)
      ? current.filter(l => l !== lane)
      : [...current, lane];
    onChange('lanes', updated);
  };

  const handleServiceComfort = (service, level) => {
    const current = formData.serviceComfort || {};
    onChange('serviceComfort', {
      ...current,
      [service.toLowerCase()]: level,
    });
  };

  const handleNotAvailableToggle = (option) => {
    const current = formData.notAvailableFor || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    onChange('notAvailableFor', updated);
  };

  const getServiceComfort = (service) => {
    return (formData.serviceComfort || {})[service.toLowerCase()] || null;
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <span>Specialties, Lanes & Preferences</span>
      </div>
      <div style={styles.sectionDescription}>
        These fields directly feed into the matching algorithm and determine which requests you see.
      </div>

      {/* Hair Specialties */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Hair Specialties (Multi-select)
        </label>
        <div style={styles.chipsContainer}>
          {HAIR_SPECIALTIES.map(specialty => (
            <button
              key={specialty}
              type="button"
              style={{
                ...styles.chip,
                ...((formData.hairSpecialties || []).includes(specialty) ? styles.chipSelected : {}),
              }}
              onClick={() => handleSpecialtyToggle(specialty)}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Lanes / Vibe */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Lanes / Vibe (Multi-select)
        </label>
        <div style={styles.chipsContainer}>
          {LANES.map(lane => (
            <button
              key={lane}
              type="button"
              style={{
                ...styles.chip,
                ...((formData.lanes || []).includes(lane) ? styles.chipSelected : {}),
              }}
              onClick={() => handleLaneToggle(lane)}
            >
              {lane}
            </button>
          ))}
        </div>
      </div>

      {/* Service Comfort Levels */}
      <div style={styles.serviceComfortSection}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Service Comfort & Focus
        </label>
        {SERVICES.map(service => {
          const currentLevel = getServiceComfort(service);
          return (
            <div key={service} style={styles.serviceItem}>
              <div style={styles.serviceName}>{service}</div>
              <div style={styles.comfortLevels}>
                {SERVICE_COMFORT_LEVELS.map(level => (
                  <button
                    key={level.value}
                    type="button"
                    style={{
                      ...styles.comfortBtn,
                      background: currentLevel === level.value ? level.color : '#FFFEF9',
                      color: currentLevel === level.value ? '#FFFEF9' : level.color,
                      borderColor: level.color,
                    }}
                    onClick={() => handleServiceComfort(service, level.value)}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Not Available For */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          marginBottom: '0.75rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Not Available For (Multi-select)
        </label>
        <div style={styles.chipsContainer}>
          {NOT_AVAILABLE_OPTIONS.map(option => (
            <button
              key={option}
              type="button"
              style={{
                ...styles.chip,
                ...((formData.notAvailableFor || []).includes(option) ? styles.chipSelected : {}),
              }}
              onClick={() => handleNotAvailableToggle(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

