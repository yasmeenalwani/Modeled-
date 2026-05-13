// ============================================
// MODEL AVAILABILITY CALENDAR
// Simple time range input per day (30-min increments)
// ============================================

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient();

// Generate time options in 30-minute increments (8:00 AM - 9:00 PM)
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 8; hour <= 21; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    options.push(`${displayHour}:00 ${period}`);
    if (hour < 21) {
      options.push(`${displayHour}:30 ${period}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const DAYS = [
  { label: 'Monday', key: 'monday', short: 'Mon' },
  { label: 'Tuesday', key: 'tuesday', short: 'Tue' },
  { label: 'Wednesday', key: 'wednesday', short: 'Wed' },
  { label: 'Thursday', key: 'thursday', short: 'Thu' },
  { label: 'Friday', key: 'friday', short: 'Fri' },
  { label: 'Saturday', key: 'saturday', short: 'Sat' },
  { label: 'Sunday', key: 'sunday', short: 'Sun' },
];

const styles = {
  container: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  editBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F', // Cherry
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Day sections
  daySection: {
    marginBottom: '1.5rem',
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  dayLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  addRangeBtn: {
    padding: '0.35rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Time range item
  rangeList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  rangeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#FFFEF9',
    borderRadius: '8px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  rangeInputs: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
  },
  timeSelect: {
    padding: '0.5rem 0.75rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
    cursor: 'pointer',
  },
  rangeDisplay: {
    flex: 1,
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  deleteBtn: {
    padding: '0.35rem 0.6rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyState: {
    padding: '1rem',
    textAlign: 'center',
    color: '#5A3A2A',
    fontSize: '0.85rem',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Preferences section
  preferencesSection: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
  },
  preferencesTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Actions
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    padding: '0.6rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cancelBtn: {
    padding: '0.6rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ModelAvailabilityCalendar({ modelProfile, onSave }) {
  const { user } = useAuthenticator();
  const [isEditing, setIsEditing] = useState(false);
  const [availability, setAvailability] = useState({});
  const [preferences, setPreferences] = useState({
    openToHaircut: false,
    openToColor: false,
    openToStyling: false,
    openToMakeup: false,
    openToNails: false,
    openToSkincare: false,
  });
  const [saving, setSaving] = useState(false);

  // Initialize from model profile
  useEffect(() => {
    if (modelProfile) {
      // Convert database format to display format
      const dbAvailability = modelProfile.availability || {};
      const formatted = {};
      DAYS.forEach(day => {
        const slots = dbAvailability[day.key] || [];
        // Convert time slots to ranges for display
        formatted[day.label] = slotsToRanges(slots);
      });
      setAvailability(formatted);
      
      // Set preferences
      setPreferences({
        openToHaircut: modelProfile.openToHaircut || false,
        openToColor: modelProfile.openToColor || false,
        openToStyling: modelProfile.openToStyling || false,
        openToMakeup: modelProfile.openToMakeup || false,
        openToNails: modelProfile.openToNails || false,
        openToSkincare: modelProfile.openToSkincare || false,
      });
    }
  }, [modelProfile]);

  // Convert time slots array to ranges
  const slotsToRanges = (slots) => {
    if (!slots || slots.length === 0) return [];
    
    const sorted = [...slots].sort((a, b) => {
      const idxA = TIME_OPTIONS.indexOf(a);
      const idxB = TIME_OPTIONS.indexOf(b);
      return idxA - idxB;
    });
    
    const ranges = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      const currentIdx = TIME_OPTIONS.indexOf(sorted[i]);
      const prevIdx = TIME_OPTIONS.indexOf(sorted[i - 1]);
      
      if (currentIdx === prevIdx + 1) {
        // Consecutive slot, extend range
        end = sorted[i];
      } else {
        // Gap found, save current range and start new one
        ranges.push({ start, end });
        start = sorted[i];
        end = sorted[i];
      }
    }
    ranges.push({ start, end });
    return ranges;
  };

  // Convert ranges back to time slots array
  const rangesToSlots = (ranges) => {
    const slots = [];
    ranges.forEach(range => {
      const startIdx = TIME_OPTIONS.indexOf(range.start);
      const endIdx = TIME_OPTIONS.indexOf(range.end);
      if (startIdx !== -1 && endIdx !== -1 && startIdx <= endIdx) {
        for (let i = startIdx; i <= endIdx; i++) {
          slots.push(TIME_OPTIONS[i]);
        }
      }
    });
    return [...new Set(slots)].sort((a, b) => {
      return TIME_OPTIONS.indexOf(a) - TIME_OPTIONS.indexOf(b);
    });
  };

  const addTimeRange = (day) => {
    if (!isEditing) return;
    
    setAvailability(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { start: '8:00 AM', end: '9:00 AM' }],
    }));
  };

  const updateTimeRange = (day, index, field, value) => {
    if (!isEditing) return;
    
    setAvailability(prev => {
      const ranges = [...(prev[day] || [])];
      ranges[index] = { ...ranges[index], [field]: value };
      
      // Validate: end must be after start
      if (field === 'start' && TIME_OPTIONS.indexOf(value) >= TIME_OPTIONS.indexOf(ranges[index].end)) {
        // Auto-adjust end to be 30 min after start
        const startIdx = TIME_OPTIONS.indexOf(value);
        ranges[index].end = TIME_OPTIONS[Math.min(startIdx + 1, TIME_OPTIONS.length - 1)];
      } else if (field === 'end' && TIME_OPTIONS.indexOf(value) <= TIME_OPTIONS.indexOf(ranges[index].start)) {
        // Auto-adjust start to be 30 min before end
        const endIdx = TIME_OPTIONS.indexOf(value);
        ranges[index].start = TIME_OPTIONS[Math.max(endIdx - 1, 0)];
      }
      
      return {
        ...prev,
        [day]: ranges,
      };
    });
  };

  const deleteTimeRange = (day, index) => {
    if (!isEditing) return;
    
    setAvailability(prev => {
      const ranges = [...(prev[day] || [])];
      ranges.splice(index, 1);
      return {
        ...prev,
        [day]: ranges,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert display format back to database format
      const dbAvailability = {};
      DAYS.forEach(day => {
        const ranges = availability[day.label] || [];
        dbAvailability[day.key] = rangesToSlots(ranges);
      });

      // Update model profile in database
      const { data: updated } = await client.models.ModelProfile.update({
        id: modelProfile.id,
        availability: dbAvailability,
        openToHaircut: preferences.openToHaircut,
        openToColor: preferences.openToColor,
        openToStyling: preferences.openToStyling,
        openToMakeup: preferences.openToMakeup,
        openToNails: preferences.openToNails,
        openToSkincare: preferences.openToSkincare,
      });

      if (onSave) {
        onSave(updated);
      }

      const { updateModelLastActive, updateEngagementScore } = await import('../utils/agenticScores');
      updateModelLastActive(modelProfile.id).catch(() => {});
      updateEngagementScore(modelProfile.id).catch(() => {});

      setIsEditing(false);
      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Error saving availability:', error);
      alert('Error saving availability. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    if (modelProfile) {
      const dbAvailability = modelProfile.availability || {};
      const formatted = {};
      DAYS.forEach(day => {
        const slots = dbAvailability[day.key] || [];
        formatted[day.label] = slotsToRanges(slots);
      });
      setAvailability(formatted);
      setPreferences({
        openToHaircut: modelProfile.openToHaircut || false,
        openToColor: modelProfile.openToColor || false,
        openToStyling: modelProfile.openToStyling || false,
        openToMakeup: modelProfile.openToMakeup || false,
        openToNails: modelProfile.openToNails || false,
        openToSkincare: modelProfile.openToSkincare || false,
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>My Availability & Preferences</h3>
        {!isEditing && (
          <button
            style={styles.editBtn}
            onClick={() => setIsEditing(true)}
            onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.1)'}
          >
            Edit Availability
          </button>
        )}
      </div>

      {/* Day Sections */}
      {DAYS.map(day => {
        const ranges = availability[day.label] || [];
        return (
          <div key={day.key} style={styles.daySection}>
            <div style={styles.dayHeader}>
              <div style={styles.dayLabel}>{day.label}</div>
              {isEditing && (
                <button
                  style={styles.addRangeBtn}
                  onClick={() => addTimeRange(day.label)}
                  onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.15)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.1)'}
                >
                  + Add Time Range
                </button>
              )}
            </div>
            
            {ranges.length === 0 ? (
              <div style={styles.emptyState}>
                {isEditing ? 'Click "Add Time Range" to set availability' : 'No availability set'}
              </div>
            ) : (
              <div style={styles.rangeList}>
                {ranges.map((range, index) => (
                  <div key={index} style={styles.rangeItem}>
                    {isEditing ? (
                      <>
                        <div style={styles.rangeInputs}>
                          <select
                            style={styles.timeSelect}
                            value={range.start}
                            onChange={(e) => updateTimeRange(day.label, index, 'start', e.target.value)}
                          >
                            {TIME_OPTIONS.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>to</span>
                          <select
                            style={styles.timeSelect}
                            value={range.end}
                            onChange={(e) => updateTimeRange(day.label, index, 'end', e.target.value)}
                          >
                            {TIME_OPTIONS.filter(time => {
                              const startIdx = TIME_OPTIONS.indexOf(range.start);
                              const timeIdx = TIME_OPTIONS.indexOf(time);
                              return timeIdx > startIdx;
                            }).map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => deleteTimeRange(day.label, index)}
                          onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.15)'}
                          onMouseOut={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.1)'}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <div style={styles.rangeDisplay}>
                        {range.start} - {range.end}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Service Preferences */}
      <div style={styles.preferencesSection}>
        <div style={styles.preferencesTitle}>Services I'm Open To:</div>
        <div>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToHaircut}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToHaircut: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Haircuts</span>
          </label>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToColor}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToColor: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Color</span>
          </label>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToStyling}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToStyling: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Styling/Blowouts</span>
          </label>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToMakeup}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToMakeup: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Makeup</span>
          </label>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToNails}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToNails: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Nails</span>
          </label>
          <label style={styles.serviceCheckbox}>
            <input
              type="checkbox"
              checked={preferences.openToSkincare}
              onChange={(e) => setPreferences(prev => ({ ...prev, openToSkincare: e.target.checked }))}
              disabled={!isEditing}
              style={styles.checkbox}
            />
            <span style={styles.checkboxLabel}>Skincare</span>
          </label>
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div style={styles.actions}>
          <button
            style={styles.cancelBtn}
            onClick={handleCancel}
            onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.15)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.1)'}
          >
            Cancel
          </button>
          <button
            style={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
            onMouseOver={(e) => !saving && (e.target.style.opacity = '0.9')}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            {saving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      )}
    </div>
  );
}
