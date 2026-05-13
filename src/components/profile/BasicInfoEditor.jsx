import React from 'react';
import { PRONOUNS_OPTIONS, WORK_MODES, WORK_DAYS, BIO_CHARACTER_LIMIT } from '../../utils/profileConstants';

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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formGroupFull: {
    gridColumn: '1 / -1',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  required: {
    color: '#f85149',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  charCounter: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    textAlign: 'right',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  charCounterWarning: {
    color: '#f85149',
  },
  bioPreview: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  chipsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
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
  timeInputs: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
  },
};

export default function BasicInfoEditor({
  formData,
  onChange,
}) {
  const bioLength = formData.bio?.length || 0;
  const bioRemaining = BIO_CHARACTER_LIMIT - bioLength;

  const handleWorkDayToggle = (day) => {
    const current = formData.usualWorkDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    onChange('usualWorkDays', updated);
  };

  return (
    <>
      {/* Basic Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Basic Information</span>
        </div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              First Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={formData.firstName || ''}
              onChange={(e) => onChange('firstName', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Last Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={formData.lastName || ''}
              onChange={(e) => onChange('lastName', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Pronouns</label>
            <select
              style={styles.input}
              value={formData.pronouns || ''}
              onChange={(e) => onChange('pronouns', e.target.value)}
            >
              <option value="">Select pronouns</option>
              {PRONOUNS_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Email <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              style={styles.input}
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Phone <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              style={styles.input}
              value={formData.phone || ''}
              onChange={(e) => onChange('phone', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              City <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={formData.city || ''}
              onChange={(e) => onChange('city', e.target.value)}
              required
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>
              Bio <span style={styles.required}>*</span>
            </label>
            <textarea
              style={styles.textarea}
              value={formData.bio || ''}
              onChange={(e) => onChange('bio', e.target.value)}
              maxLength={BIO_CHARACTER_LIMIT}
              placeholder="Tell us about yourself and your expertise..."
              required
            />
            <div style={{
              ...styles.charCounter,
              ...(bioRemaining < 20 ? styles.charCounterWarning : {}),
            }}>
              {bioRemaining} characters remaining
            </div>
            {formData.bio && (
              <div style={styles.bioPreview}>
                Preview: {formData.bio}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Salon/Work Setup */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Salon / Work Setup</span>
        </div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Salon Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={formData.salonName || ''}
              onChange={(e) => onChange('salonName', e.target.value)}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Address</label>
            <input
              type="text"
              style={styles.input}
              value={formData.salonAddress || ''}
              onChange={(e) => onChange('salonAddress', e.target.value)}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input
              type="url"
              style={styles.input}
              value={formData.salonWebsite || ''}
              onChange={(e) => onChange('salonWebsite', e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Instagram Handle</label>
            <input
              type="text"
              style={styles.input}
              value={formData.instagramHandle || ''}
              onChange={(e) => onChange('instagramHandle', e.target.value)}
              placeholder="@username"
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>
              Work Mode <span style={styles.required}>*</span>
            </label>
            <div style={styles.chipsContainer}>
              {WORK_MODES.map(mode => (
                <button
                  key={mode.value}
                  type="button"
                  style={{
                    ...styles.chip,
                    ...(formData.workMode === mode.value ? styles.chipSelected : {}),
                  }}
                  onClick={() => onChange('workMode', mode.value)}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>
              Usual Work Days <span style={styles.required}>*</span>
            </label>
            <div style={styles.chipsContainer}>
              {WORK_DAYS.map(day => (
                <button
                  key={day.value}
                  type="button"
                  style={{
                    ...styles.chip,
                    ...((formData.usualWorkDays || []).includes(day.value) ? styles.chipSelected : {}),
                  }}
                  onClick={() => handleWorkDayToggle(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>
              Usual Work Hours <span style={styles.required}>*</span>
            </label>
            <div style={styles.timeInputs}>
              <div style={{ flex: 1 }}>
                <label style={{ ...styles.label, fontSize: '0.75rem' }}>Start Time</label>
                <input
                  type="time"
                  style={styles.timeInput}
                  value={formData.usualWorkHours?.start || '09:00'}
                  onChange={(e) => onChange('usualWorkHours', {
                    ...formData.usualWorkHours,
                    start: e.target.value,
                  })}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ ...styles.label, fontSize: '0.75rem' }}>End Time</label>
                <input
                  type="time"
                  style={styles.timeInput}
                  value={formData.usualWorkHours?.end || '18:00'}
                  onChange={(e) => onChange('usualWorkHours', {
                    ...formData.usualWorkHours,
                    end: e.target.value,
                  })}
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

