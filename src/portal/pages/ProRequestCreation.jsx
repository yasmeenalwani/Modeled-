// ============================================
// PRO REQUEST CREATION
// Professionals create requests looking for models
// ============================================

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { services } from '../../admin/data/services';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
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
  
  // Form card
  formCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.1)',
  },
  formSection: {
    marginBottom: '2.5rem',
    padding: '1.5rem',
    background: 'rgba(255, 254, 249, 0.5)', // Slightly different ivory for depth
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    boxShadow: 'inset 0 1px 3px rgba(139, 30, 63, 0.05)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    paddingBottom: '0.75rem',
    borderBottom: '2px solid rgba(139, 30, 63, 0.2)',
  },
  
  // Form elements
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    marginBottom: '0.5rem',
    fontWeight: '500',
    fontFamily: '"Alike", "Georgia", serif',
  },
  required: {
    color: '#8B1E3F', // Cherry
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  select: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Model attributes
  attributesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  helpText: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Actions
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '2px solid rgba(139, 30, 63, 0.15)',
  },
  submitBtn: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    boxShadow: '0 4px 15px rgba(139, 30, 63, 0.3)',
    transition: 'all 0.2s ease',
  },
  cancelBtn: {
    padding: '0.75rem 2rem',
    background: '#FFFEF9', // Ivory
    border: '2px solid rgba(139, 30, 63, 0.3)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Preview
  previewCard: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    border: '2px solid rgba(139, 30, 63, 0.25)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
    boxShadow: 'inset 0 1px 3px rgba(139, 30, 63, 0.1)',
  },
  previewTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F', // Cherry
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  previewText: {
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    lineHeight: '1.6',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const HAIR_LENGTHS = ['short', 'medium', 'long', 'extra_long'];
const HAIR_TEXTURES = ['straight', 'wavy', 'curly', 'coily'];
const HAIR_CONDITIONS = ['healthy', 'damaged', 'color_treated', 'virgin'];

export default function ProRequestCreation() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [professional, setProfessional] = useState(null);
  
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceDescription: '',
    desiredHairColor: '',
    desiredHairLength: '',
    desiredHairTexture: '',
    desiredHairCondition: '',
    requestedDate: '',
    requestedTime: '',
    duration: 60,
    location: '',
  });

  // Load professional profile
  useEffect(() => {
    loadProfessionalProfile();
  }, [user]);

  const loadProfessionalProfile = async () => {
    try {
      const { data: pros } = await client.models.Professional.list({
        filter: { userId: { eq: user.userId } },
      });
      
      if (pros && pros.length > 0) {
        setProfessional(pros[0]);
        // Pre-fill location from professional's salon
        if (pros[0].salonAddress) {
          setFormData(prev => ({ ...prev, location: pros[0].salonAddress }));
        }
      }
    } catch (error) {
      console.error('Error loading professional profile:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!professional) {
      alert('Professional profile not found. Please complete your profile first.');
      return;
    }

    if (!formData.serviceType || !formData.requestedDate || !formData.requestedTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Create ModelRequest in database
      const location = formData.location || professional.salonAddress || '';
      const { data: request, errors } = await client.models.ModelRequest.create({
        professionalId: professional.id,
        serviceType: formData.serviceType,
        serviceDescription: formData.serviceDescription,
        desiredHairColor: formData.desiredHairColor || null,
        desiredHairLength: formData.desiredHairLength || null,
        desiredHairTexture: formData.desiredHairTexture || null,
        desiredHairCondition: formData.desiredHairCondition || null,
        requestedDate: formData.requestedDate,
        requestedTime: formData.requestedTime,
        duration: formData.duration || 60,
        location,
        locationZip: (location.match(/\b(\d{5})(?:-\d{4})?\b/)?.[1]) || undefined,
        status: 'matching',
        priority: 'normal',
      });

      if (errors) {
        throw new Error(errors[0].message);
      }

      alert('Request created successfully! It will appear in the Admin Request Queue for matching.');
      navigate('/portal/schedule');
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Error creating request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePreview = () => {
    if (!formData.serviceType || !formData.requestedDate || !formData.requestedTime) {
      return null;
    }

    const service = services.find(s => s.id === formData.serviceType);
    const date = new Date(formData.requestedDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let preview = `Looking for a model for ${service?.name || formData.serviceType}`;
    
    if (formData.desiredHairLength) {
      preview += ` with ${formData.desiredHairLength} hair`;
    }
    if (formData.desiredHairColor) {
      preview += `, ${formData.desiredHairColor} color`;
    }
    if (formData.desiredHairTexture) {
      preview += `, ${formData.desiredHairTexture} texture`;
    }
    
    preview += ` on ${date} at ${formData.requestedTime}`;
    
    if (formData.serviceDescription) {
      preview += `.\n\nDetails: ${formData.serviceDescription}`;
    }

    return preview;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create Model Request</h1>
        <p style={styles.subtitle}>
          Tell us what you're looking for. We'll match you with available models.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={styles.formCard}>
          {/* Service Details */}
          <div style={styles.formSection}>
            <div style={styles.sectionTitle}>
              Service Details
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Service Type <span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.select}
                  value={formData.serviceType}
                  onChange={(e) => handleInputChange('serviceType', e.target.value)}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                >
                  <option value="">Select a service...</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Duration (minutes)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  min="15"
                  max="480"
                  step="15"
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Service Description</label>
              <textarea
                style={styles.textarea}
                value={formData.serviceDescription}
                onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                placeholder="Describe what you'll be doing (e.g., 'Practice balayage technique', 'Cut and style for portfolio')"
                onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
              />
            </div>
          </div>

          {/* Model Attributes */}
          <div style={styles.formSection}>
            <div style={styles.sectionTitle}>
              Ideal Model Attributes
            </div>
            <p style={styles.helpText}>
              Specify what you're looking for. Leave blank if flexible.
            </p>
            <div style={styles.attributesGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hair Color</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.desiredHairColor}
                  onChange={(e) => handleInputChange('desiredHairColor', e.target.value)}
                  placeholder="e.g., Blonde, Brunette, Red"
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hair Length</label>
                <select
                  style={styles.select}
                  value={formData.desiredHairLength}
                  onChange={(e) => handleInputChange('desiredHairLength', e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                >
                  <option value="">Any</option>
                  {HAIR_LENGTHS.map(length => (
                    <option key={length} value={length}>
                      {length.charAt(0).toUpperCase() + length.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hair Texture</label>
                <select
                  style={styles.select}
                  value={formData.desiredHairTexture}
                  onChange={(e) => handleInputChange('desiredHairTexture', e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                >
                  <option value="">Any</option>
                  {HAIR_TEXTURES.map(texture => (
                    <option key={texture} value={texture}>
                      {texture.charAt(0).toUpperCase() + texture.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Hair Condition</label>
                <select
                  style={styles.select}
                  value={formData.desiredHairCondition}
                  onChange={(e) => handleInputChange('desiredHairCondition', e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                >
                  <option value="">Any</option>
                  {HAIR_CONDITIONS.map(condition => (
                    <option key={condition} value={condition}>
                      {condition.charAt(0).toUpperCase() + condition.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* When & Where */}
          <div style={styles.formSection}>
            <div style={styles.sectionTitle}>
              When & Where
            </div>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Requested Date <span style={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.requestedDate}
                  onChange={(e) => handleInputChange('requestedDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Requested Time <span style={styles.required}>*</span>
                </label>
                <input
                  type="time"
                  style={styles.input}
                  value={formData.requestedTime}
                  onChange={(e) => handleInputChange('requestedTime', e.target.value)}
                  required
                  onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
                />
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Location</label>
              <input
                type="text"
                style={styles.input}
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={professional?.salonAddress || "Salon address or location"}
                onFocus={(e) => e.target.style.borderColor = '#8B1E3F'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)'}
              />
            </div>
          </div>

          {/* Preview */}
          {generatePreview() && (
            <div style={styles.previewCard}>
              <div style={styles.previewTitle}>Request Preview:</div>
              <div style={styles.previewText}>{generatePreview()}</div>
            </div>
          )}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate('/portal/schedule')}
              onMouseOver={(e) => e.target.style.background = 'rgba(139, 30, 63, 0.05)'}
              onMouseOut={(e) => e.target.style.background = '#FFFEF9'}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={submitting}
              onMouseOver={(e) => !submitting && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 20px rgba(139, 30, 63, 0.4)')}
              onMouseOut={(e) => !submitting && (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 15px rgba(139, 30, 63, 0.3)')}
            >
              {submitting ? 'Creating Request...' : 'Create Request'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

