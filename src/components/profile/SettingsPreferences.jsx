import React from 'react';

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
    marginBottom: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontStyle: 'italic',
  },
  toggleGroup: {
    marginBottom: '1.5rem',
  },
  toggleItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  toggleLabel: {
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  toggleSwitch: {
    width: '48px',
    height: '24px',
    borderRadius: '12px',
    background: '#ccc',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  toggleSwitchActive: {
    background: '#4caf50',
  },
  toggleThumb: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#FFFEF9',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'transform 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  toggleThumbActive: {
    transform: 'translateX(24px)',
  },
  timeInputs: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  timeInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      style={{
        ...styles.toggleSwitch,
        ...(checked ? styles.toggleSwitchActive : {}),
      }}
      onClick={() => onChange(!checked)}
    >
      <div
        style={{
          ...styles.toggleThumb,
          ...(checked ? styles.toggleThumbActive : {}),
        }}
      />
    </div>
  );
}

export default function SettingsPreferences({
  formData,
  onChange,
}) {
  const commPrefs = formData.communicationPrefs || {};
  const bookingPrefs = formData.bookingPrefs || {};

  const updateCommPref = (key, value) => {
    onChange('communicationPrefs', {
      ...commPrefs,
      [key]: value,
    });
  };

  const updateBookingPref = (key, value) => {
    onChange('bookingPrefs', {
      ...bookingPrefs,
      [key]: value,
    });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <span>Settings & Preferences</span>
      </div>
      <div style={styles.sectionDescription}>
        These settings affect how you receive notifications and which requests you're matched with.
      </div>

      {/* Communication Preferences */}
      <div style={styles.toggleGroup}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Communication Preferences
        </h4>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>SMS Notifications</label>
          <ToggleSwitch
            checked={commPrefs.sms !== false}
            onChange={(val) => updateCommPref('sms', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Email Notifications</label>
          <ToggleSwitch
            checked={commPrefs.email !== false}
            onChange={(val) => updateCommPref('email', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Push Notifications</label>
          <ToggleSwitch
            checked={commPrefs.push !== false}
            onChange={(val) => updateCommPref('push', val)}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label style={{
            ...styles.toggleLabel,
            display: 'block',
            marginBottom: '0.5rem',
          }}>
            Quiet Hours
          </label>
          <div style={styles.timeInputs}>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '0.75rem',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Start
              </label>
              <input
                type="time"
                style={styles.timeInput}
                value={commPrefs.quietHours?.start || '22:00'}
                onChange={(e) => updateCommPref('quietHours', {
                  ...commPrefs.quietHours,
                  start: e.target.value,
                })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                fontSize: '0.75rem',
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                End
              </label>
              <input
                type="time"
                style={styles.timeInput}
                value={commPrefs.quietHours?.end || '08:00'}
                onChange={(e) => updateCommPref('quietHours', {
                  ...commPrefs.quietHours,
                  end: e.target.value,
                })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking & Safety Preferences */}
      <div style={styles.toggleGroup}>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: '600',
          marginBottom: '1rem',
          color: '#4A2A1A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Booking & Safety Preferences
        </h4>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Comfortable with Travel</label>
          <ToggleSwitch
            checked={bookingPrefs.travel === true}
            onChange={(val) => updateBookingPref('travel', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Comfortable with Photos</label>
          <ToggleSwitch
            checked={bookingPrefs.photos !== false}
            onChange={(val) => updateBookingPref('photos', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Comfortable with Video</label>
          <ToggleSwitch
            checked={bookingPrefs.video === true}
            onChange={(val) => updateBookingPref('video', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Comfortable with Minors</label>
          <ToggleSwitch
            checked={bookingPrefs.minors === true}
            onChange={(val) => updateBookingPref('minors', val)}
          />
        </div>
        <div style={styles.toggleItem}>
          <label style={styles.toggleLabel}>Comfortable with Late Nights</label>
          <ToggleSwitch
            checked={bookingPrefs.lateNights === true}
            onChange={(val) => updateBookingPref('lateNights', val)}
          />
        </div>
      </div>
    </div>
  );
}

