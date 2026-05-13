import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient();

const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  serviceLabel: {
    fontSize: '0.95rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  frequencyInput: {
    width: '120px',
    padding: '0.5rem',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  saveBtn: {
    marginTop: '1rem',
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const services = [
  { key: 'hairColor', label: 'Hair Color', icon: '' },
  { key: 'haircut', label: 'Haircut', icon: '' },
  { key: 'eyelash', label: 'Eyelashes', icon: '' },
  { key: 'blowout', label: 'Blowout', icon: '' },
  { key: 'treatment', label: 'Treatment', icon: '' },
  { key: 'nail', label: 'Nails', icon: '' },
  { key: 'brow', label: 'Brows', icon: '' },
];

export default function BeautyMaintenanceTimeline({ modelId }) {
  const { user } = useAuthenticator();
  const [routine, setRoutine] = useState(null);
  const [frequencies, setFrequencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRoutine();
  }, [modelId]);

  const loadRoutine = async () => {
    try {
      const { data } = await client.models.BeautyMaintenanceRoutine.list({
        filter: { modelId: { eq: modelId } },
      });
      
      if (data && data.length > 0) {
        const r = data[0];
        setRoutine(r);
        setFrequencies({
          hairColor: r.hairColorFrequency || '',
          haircut: r.haircutFrequency || '',
          eyelash: r.eyelashFrequency || '',
          blowout: r.blowoutFrequency || '',
          treatment: r.treatmentFrequency || '',
          nail: r.nailFrequency || '',
          brow: r.browFrequency || '',
        });
      }
    } catch (error) {
      console.error('Error loading routine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFrequencyChange = (service, value) => {
    setFrequencies({ ...frequencies, [service]: parseInt(value) || '' });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const routineData = {
        modelId,
        hairColorFrequency: frequencies.hairColor || null,
        haircutFrequency: frequencies.haircut || null,
        eyelashFrequency: frequencies.eyelash || null,
        blowoutFrequency: frequencies.blowout || null,
        treatmentFrequency: frequencies.treatment || null,
        nailFrequency: frequencies.nail || null,
        browFrequency: frequencies.brow || null,
      };

      if (routine) {
        await client.models.BeautyMaintenanceRoutine.update({
          id: routine.id,
          ...routineData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await client.models.BeautyMaintenanceRoutine.create(routineData);
      }
      
      await loadRoutine();
      alert('Routine saved!');
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('Failed to save routine. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Beauty Maintenance Timeline</h3>
      <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Set how often you want each service (in weeks)
      </p>
      
      {services.map((service) => (
        <div key={service.key} style={styles.serviceRow}>
          <span style={styles.serviceLabel}>
            {service.icon} {service.label}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              min="1"
              style={styles.frequencyInput}
              value={frequencies[service.key] || ''}
              onChange={(e) => handleFrequencyChange(service.key, e.target.value)}
              placeholder="Weeks"
            />
            <span style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>weeks</span>
          </div>
        </div>
      ))}
      
      <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Routine'}
      </button>
    </div>
  );
}

