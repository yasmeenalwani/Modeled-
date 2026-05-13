import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { sendUserAttributeVerificationCode, confirmUserAttribute, updateUserAttribute, fetchAuthSession } from 'aws-amplify/auth';
import GuidedPhotoCapture from '../components/GuidedPhotoCapture';
import IdentityVerification from '../components/IdentityVerification';
import { submitPhotosForAnalysis } from '../utils/photoSubmission';
import { shouldUseMockData } from '../utils/mockDataService';

const client = generateClient();

// ============ UTILITY FUNCTIONS ============

// Auto-format phone number
const formatPhoneNumber = (value) => {
  const phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Validate email
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Validate ZIP code
const isValidZip = (zip) => {
  return /^\d{5}(-\d{4})?$/.test(zip);
};

// Auto-save to localStorage
const saveProgress = (data) => {
  try {
    localStorage.setItem('modelOnboardProgress', JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
};

// Load progress from localStorage
const loadProgress = () => {
  try {
    const saved = localStorage.getItem('modelOnboardProgress');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// ============ STYLES ============
const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFEF9', // Ivory
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto 1.5rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '25px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: 'transparent',
    color: '#4A2A1A',
    transition: 'all 0.3s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  logoImage: {
    height: '38px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0)',
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    textAlign: 'center',
    color: '#5A3A2A', // Muted brown
    marginBottom: '2rem',
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressBar: {
    height: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '3px',
    marginBottom: '2rem',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)', // Cherry gradient
    transition: 'width 0.5s ease',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  stepDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'rgba(139, 30, 63, 0.2)',
    transition: 'all 0.3s ease',
  },
  stepDotActive: {
    background: '#8B1E3F', // Cherry
    transform: 'scale(1.2)',
  },
  stepDotComplete: {
    background: '#4caf50',
  },
  // Solid color indicators (replacing emojis)
  colorIndicator: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '0.5rem',
  },
  // Progressive field styles
  fieldContainer: {
    marginBottom: '2rem',
    animation: 'fadeIn 0.3s ease',
  },
  fieldLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  helpIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'rgba(139, 30, 63, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'help',
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    transition: 'all 0.2s ease',
    border: '1px solid rgba(139, 30, 63, 0.2)',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '1.1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9', // Ivory
    color: '#4A2A1A', // Dark brown
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inputFocused: {
    borderColor: '#8B1E3F', // Cherry
    backgroundColor: '#FFFEF9',
    boxShadow: '0 0 0 3px rgba(139, 30, 63, 0.1)',
  },
  inputValid: {
    borderColor: '#4caf50',
  },
  inputInvalid: {
    borderColor: '#f44336',
  },
  validationMessage: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  validationSuccess: {
    color: '#4caf50',
  },
  validationError: {
    color: '#f44336',
  },
  validationWarning: {
    color: '#ffc107',
  },
  helpTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    marginBottom: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A', // Dark brown
    borderRadius: '8px',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    maxWidth: '300px',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.15)',
    fontFamily: '"Alike", "Georgia", serif',
  },
  buttonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginTop: '2rem',
  },
  secondaryBtn: {
    flex: 1,
    padding: '1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: 'transparent',
    color: '#4A2A1A', // Dark brown
    transition: 'all 0.3s ease',
    fontWeight: '500',
    fontFamily: '"Alike", "Georgia", serif',
  },
  primaryBtn: {
    flex: 1,
    padding: '1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    color: '#FFFEF9', // Ivory
    fontWeight: '600',
    transition: 'all 0.3s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  privacyBanner: {
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  privacyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A', // Dark brown
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  privacyText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// ============ PROGRESSIVE FIELD COMPONENT ============
function ProgressiveField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  helpText, 
  validation, 
  formatValue,
  required = false,
}) {
  const [focused, setFocused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
  const fieldRef = useRef(null);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    let newValue = e.target.value;
    if (formatValue) {
      newValue = formatValue(newValue);
    }
    
    // Update local state immediately for responsive UI
    setLocalValue(newValue);
    
    // Update parent state
    if (onChange) {
      onChange(newValue);
    }
  };

  const isValid = validation ? validation.isValid(localValue) : localValue.length > 0;
  const showValidation = focused || (localValue && localValue.length > 0);

  return (
    <div style={styles.fieldContainer} ref={fieldRef}>
      <div style={{ position: 'relative' }}>
        <label style={styles.fieldLabel}>
          {label} {required && <span style={{ color: '#8B1E3F' }}>*</span>}
          {helpText && (
            <span
              style={styles.helpIcon}
              onMouseEnter={() => setShowHelp(true)}
              onMouseLeave={() => setShowHelp(false)}
            >
              ?
            </span>
          )}
        </label>
        {showHelp && helpText && (
          <div style={styles.helpTooltip}>
            {helpText}
          </div>
        )}
        <input
          ref={inputRef}
          type={type}
          value={localValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            ...styles.input,
            ...(focused ? styles.inputFocused : {}),
            ...(showValidation && isValid ? styles.inputValid : {}),
            ...(showValidation && !isValid && localValue ? styles.inputInvalid : {}),
          }}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : 'off'}
        />
        {showValidation && validation && (
          <div style={{
            ...styles.validationMessage,
            ...(isValid ? styles.validationSuccess : styles.validationError),
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isValid ? '#4caf50' : '#f44336',
              marginRight: '0.5rem',
            }}></span>
            {validation.message(localValue, isValid)}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STEP COMPONENTS ============

function StepWelcome({ data, setData, userId, onFieldComplete, currentFieldIndex, onNext }) {
  return (
    <div>
      <div style={{
        background: 'rgba(139, 30, 63, 0.1)',
        border: '1px solid rgba(139, 30, 63, 0.2)',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#8B1E3F', // Cherry
          fontWeight: '600',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Let's set up your Cherry Desk as a Model
        </h2>
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.8',
          color: '#4A2A1A', // Dark brown
        }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>We are for the everyday girl or guy</strong> who wants financially accessible and inclusive self-care opportunities that they are selected for. We embrace expression and identity through beauty and hair and wellness services.
          </p>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#ffc107',
            marginTop: '1.5rem',
          }}>
            We are a community. We connect. We care. We create.
          </p>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center',
        color: '#5A3A2A', // Muted brown
        fontSize: '0.95rem',
        marginBottom: '2rem',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        <p>Come join the fun</p>
      </div>
    </div>
  );
}

function StepBasicInfo({ data, setData, onFieldComplete, currentFieldIndex = 0 }) {
  const fields = [
    {
      key: 'firstName',
      label: 'First name',
      placeholder: 'Emma',
      helpText: 'We use your first name to personalize your experience and match you with professionals.',
      validation: {
        isValid: (v) => v && v.length >= 2,
        message: (v, isValid) => isValid ? 'Looks good!' : 'Please enter at least 2 characters',
      },
    },
    {
      key: 'lastName',
      label: 'Last name',
      placeholder: 'Johnson',
      helpText: 'Your last name helps us verify your identity and create your profile.',
      validation: {
        isValid: (v) => v && v.length >= 2,
        message: (v, isValid) => isValid ? 'Perfect!' : 'Please enter at least 2 characters',
      },
    },
    {
      key: 'email',
      label: 'Email',
      placeholder: 'emma@example.com',
      type: 'email',
      helpText: 'We\'ll use this to send you match notifications and important updates. We never share your email with third parties.',
      validation: {
        isValid: (v) => isValidEmail(v),
        message: (v, isValid) => isValid ? 'Valid email!' : 'Please enter a valid email address',
      },
    },
    {
      key: 'phone',
      label: 'Phone',
      placeholder: '(555) 123-4567',
      type: 'tel',
      helpText: 'We use your phone number for appointment confirmations and urgent communications. Your number is kept private.',
      validation: {
        isValid: (v) => v && v.replace(/[^\d]/g, '').length === 10,
        message: (v, isValid) => isValid ? 'Great!' : 'Please enter a valid 10-digit phone number',
      },
      formatValue: formatPhoneNumber,
    },
    {
      key: 'birthday',
      label: 'Birthday',
      placeholder: 'YYYY-MM-DD',
      type: 'date',
      helpText: 'Your birthday helps us verify age eligibility.',
      validation: {
        isValid: (v) => Boolean(v),
        message: (v, isValid) => isValid ? 'Great!' : 'Please add your birthday',
      },
    },
    {
      key: 'instagram',
      label: 'Instagram (optional)',
      placeholder: '@yourhandle',
      helpText: 'Let\'s be social.',
      validation: {
        isValid: () => true,
        message: () => '',
      },
    },
    {
      key: 'tiktok',
      label: 'TikTok (optional)',
      placeholder: '@yourhandle',
      helpText: 'Let\'s be social.',
      validation: {
        isValid: () => true,
        message: () => '',
      },
    },
    {
      key: 'socialOther',
      label: 'Other social (optional)',
      placeholder: 'Portfolio or other link',
      helpText: 'Let\'s be social.',
      validation: {
        isValid: () => true,
        message: () => '',
      },
    },
    {
      key: 'locationZip',
      label: 'ZIP code',
      placeholder: '10001',
      helpText: 'Your ZIP code helps us match you with professionals in your area. We only use this for location matching.',
      validation: {
        isValid: (v) => isValidZip(v),
        message: (v, isValid) => isValid ? 'Got it!' : 'Please enter a valid 5-digit ZIP code',
      },
    },
  ];

  const safeFieldIndex = currentFieldIndex || 0;
  const currentField = fields[safeFieldIndex] || fields[0];
  const fieldValue = (data && data[currentField.key]) ? data[currentField.key] : '';

  const handleFieldComplete = () => {
    if (safeFieldIndex < fields.length - 1) {
      if (onFieldComplete) {
        onFieldComplete(safeFieldIndex + 1);
      }
    } else {
      // All fields complete, move to next step
      if (onFieldComplete) {
        onFieldComplete('next-step');
      }
    }
  };

  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F', // Cherry
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Basic Info
      </h3>
      <ProgressiveField
          label={currentField.label}
          value={fieldValue}
          onChange={(value) => {
            const updated = { ...(data || {}), [currentField.key]: value };
            setData(updated);
          }}
          type={currentField.type || 'text'}
          placeholder={currentField.placeholder}
          helpText={currentField.helpText}
          validation={currentField.validation}
          formatValue={currentField.formatValue}
          required
        />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1rem',
        fontSize: '0.85rem',
        color: '#5A3A2A', // Muted brown
      }}>
        {fields.map((_, idx) => (
          <div
            key={idx}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: idx === safeFieldIndex
                ? '#8B1E3F'
                : idx < safeFieldIndex
                ? '#4caf50'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function StepPhotos({ data, setData, userId, uploadEntityId }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handlePhotosChange = (capturedPhotos) => {
    setData({
      ...data,
      capturedPhotos,
      photoCount: Object.keys(capturedPhotos).filter(k => capturedPhotos[k]?.isValid).length,
    });
    saveProgress({ ...data, capturedPhotos });
  };

  const handlePhotosComplete = async (photoData) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const storageOwnerId = uploadEntityId;
      if (!storageOwnerId) {
        setUploadError('Upload setup is still loading. Please wait a moment and try submitting photos again.');
        return;
      }
      const result = await submitPhotosForAnalysis(photoData, storageOwnerId);

      if (result.success) {
        const photoUrls = result.uploadResults.success.map(r => r.url);
        const photoKeys = result.uploadResults.success.map(r => r.key);
        if (!photoUrls.length) {
          setUploadError('No photos were saved. Please retry and check storage permissions.');
          return;
        }
        
        const updatedData = {
          ...data,
          photoUrls,
          photoKeys,
          photoAnalysisStatus: result.analysisStatus?.status || 'pending',
          photosSubmitted: true,
        };
        setData(updatedData);
        saveProgress(updatedData);
      } else {
        setUploadError(result.errors.join(', '));
      }
    } catch (error) {
      console.error('Photo submission error:', error);
      setUploadError(error.message || 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (data.photosSubmitted && data.photoUrls?.length > 0) {
    return (
      <div>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#8B1E3F', // Cherry
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Photos Uploaded!
        </h3>
        
        <div style={{
          background: 'rgba(76,175,80,0.1)',
          border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
          marginBottom: '1.5rem',
        }}>
          <h4 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>
            {data.photoUrls.length} Photos Successfully Uploaded
          </h4>
          <p style={{ color: '#4A2A1A', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Your photos are saved. You can continue to the next step.
          </p>
        </div>

        <button
          onClick={() => setData({ ...data, photosSubmitted: false })}
          style={{
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            background: 'transparent',
            color: '#4A2A1A', // Dark brown
            cursor: 'pointer',
            fontSize: '0.9rem',
          }}
        >
          ↻ Retake Photos
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Photos
      </h3>

      {!uploadEntityId && (
        <div style={{
          background: 'rgba(255,193,7,0.15)',
          border: '1px solid rgba(255,193,7,0.4)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1rem',
          color: '#8B1E3F',
          fontSize: '0.9rem',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Preparing secure upload...
        </div>
      )}

      {uploadError && (
        <div style={{
          background: 'rgba(244,67,54,0.1)',
          border: '1px solid rgba(244,67,54,0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem',
          color: '#f44336',
        }}>
          {uploadError}
        </div>
      )}

      {isUploading ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(139, 30, 63, 0.05)',
          borderRadius: '12px',
        }}>
          <h4 style={{ color: '#8B1E3F', marginBottom: '0.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Uploading & Analyzing Photos...
          </h4>
          <p style={{ color: '#5A3A2A', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
            This may take a moment. Please don't close this page.
          </p>
        </div>
      ) : (
        <GuidedPhotoCapture
          onComplete={handlePhotosComplete}
          onPhotoChange={handlePhotosChange}
          initialPhotos={data.capturedPhotos || {}}
          accentColor="#8B1E3F"
        />
      )}
    </div>
  );
}

// Attribute options for photo validation (match ModelProfile schema & matching engine)
const HAIR_LENGTH_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'short', label: 'Short (chin or above)' },
  { value: 'medium', label: 'Medium (shoulder length)' },
  { value: 'long', label: 'Long (past shoulders)' },
  { value: 'extra_long', label: 'Extra long (mid-back or longer)' },
];
const HAIR_COLOR_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'black', label: 'Black' },
  { value: 'brown', label: 'Brown' },
  { value: 'blonde', label: 'Blonde' },
  { value: 'red', label: 'Red' },
  { value: 'gray', label: 'Gray' },
  { value: 'colored', label: 'Colored (highlights, fashion color, etc.)' },
];
const HAIR_TEXTURE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'curly', label: 'Curly' },
  { value: 'coily', label: 'Coily' },
];
const SKIN_TONE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'fair', label: 'Fair' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'olive', label: 'Olive' },
  { value: 'tan', label: 'Tan' },
  { value: 'brown', label: 'Brown' },
  { value: 'dark', label: 'Dark' },
];
const HAIR_CONDITION_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'healthy', label: 'Healthy' },
  { value: 'color_treated', label: 'Color treated' },
  { value: 'damaged', label: 'Damaged' },
  { value: 'virgin', label: 'Virgin (never colored/chemically treated)' },
];
const EYE_COLOR_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'brown', label: 'Brown' },
  { value: 'hazel', label: 'Hazel' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
  { value: 'gray', label: 'Gray' },
  { value: 'amber', label: 'Amber' },
  { value: 'other', label: 'Other' },
];
const MODELING_FOCUS_OPTIONS = [
  {
    value: 'everyday',
    label: 'Everyday',
    hint: 'Salon visits, self-care, and practice sessions with pros.',
  },
  {
    value: 'editorial',
    label: 'Editorial',
    hint: 'Campaigns, content, creative shoots, and brand work.',
  },
  {
    value: 'both',
    label: 'Both',
    hint: 'Open to everyday beauty services and editorial-style work.',
  },
];

function StepModelingFocus({ data, setData }) {
  const training = data.mediaTraining || { photo: false, video: false, acting: false };

  const setFocus = (value) => {
    const next = { ...data, modelingFocus: value };
    setData(next);
    saveProgress(next);
  };

  const toggleTraining = (key) => {
    const nextTraining = { ...training, [key]: !training[key] };
    const next = { ...data, mediaTraining: nextTraining };
    setData(next);
    saveProgress(next);
  };

  const updateAttr = (key, value) => {
    const next = { ...data, [key]: value || null };
    setData(next);
    saveProgress(next);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
        Modeling path
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.25rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        What kind of opportunities are you most interested in? Choose one.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {MODELING_FOCUS_OPTIONS.map((opt) => {
          const selected = data.modelingFocus === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFocus(opt.value)}
              style={{
                textAlign: 'left',
                padding: '1rem 1.1rem',
                borderRadius: '12px',
                border: selected ? '2px solid #8B1E3F' : '1px solid rgba(139, 30, 63, 0.22)',
                background: selected ? 'rgba(139, 30, 63, 0.08)' : '#FFFEF9',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}
            >
              <div style={{ fontWeight: 600, color: '#4A2A1A', marginBottom: '0.35rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.85rem', color: '#5A3A2A', lineHeight: 1.45 }}>{opt.hint}</div>
            </button>
          );
        })}
      </div>

      <h4 style={{ fontSize: '1.05rem', marginBottom: '0.5rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
        Training & experience (optional)
      </h4>
      <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Check any that apply—formal classes, coaching, or professional work counts.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {[
          { key: 'photo', label: 'Photo modeling' },
          { key: 'video', label: 'Video / on-camera' },
          { key: 'acting', label: 'Acting' },
        ].map(({ key, label }) => (
          <label
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              cursor: 'pointer',
              padding: '0.6rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(139, 30, 63, 0.18)',
            }}
          >
            <input
              type="checkbox"
              checked={!!training[key]}
              onChange={() => toggleTraining(key)}
            />
            <span style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{label}</span>
          </label>
        ))}
      </div>

      <h4 style={{ fontSize: '1.05rem', marginTop: '1.4rem', marginBottom: '0.5rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
        Quick features (self-selected)
      </h4>
      <p style={{ color: '#5A3A2A', marginBottom: '0.9rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Pick what is most accurate today. We combine this with photo analysis for matching.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem' }}>
        <select
          value={data.hairLengthSimple || ''}
          onChange={(e) => updateAttr('hairLengthSimple', e.target.value)}
          style={{
            width: '100%',
            padding: '0.7rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 30, 63, 0.22)',
            backgroundColor: '#FFFEF9',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}
        >
          {HAIR_LENGTH_OPTIONS.map((o) => (
            <option key={o.value || 'empty-hair-length'} value={o.value}>{`Hair length: ${o.label}`}</option>
          ))}
        </select>
        <select
          value={data.hairColorSimple || ''}
          onChange={(e) => updateAttr('hairColorSimple', e.target.value)}
          style={{
            width: '100%',
            padding: '0.7rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 30, 63, 0.22)',
            backgroundColor: '#FFFEF9',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}
        >
          {HAIR_COLOR_OPTIONS.map((o) => (
            <option key={o.value || 'empty-hair-color'} value={o.value}>{`Hair color: ${o.label}`}</option>
          ))}
        </select>
        <select
          value={data.hairTextureSimple || ''}
          onChange={(e) => updateAttr('hairTextureSimple', e.target.value)}
          style={{
            width: '100%',
            padding: '0.7rem 0.8rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 30, 63, 0.22)',
            backgroundColor: '#FFFEF9',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}
        >
          {HAIR_TEXTURE_OPTIONS.map((o) => (
            <option key={o.value || 'empty-hair-texture'} value={o.value}>{`Hair texture: ${o.label}`}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const SERVICE_CATEGORY_OPTIONS = [
  { value: 'hair_cut', label: 'Cut', group: 'hair' },
  { value: 'hair_color', label: 'Color', group: 'hair' },
  { value: 'hair_style', label: 'Style', group: 'hair' },
  { value: 'hair_extensions', label: 'Extensions', group: 'hair' },
  { value: 'hair_braids', label: 'Braids', group: 'hair' },
  { value: 'hair_treatment', label: 'Treatment', group: 'hair' },
  { value: 'hair_transformation', label: 'Transformation', group: 'hair' },
  { value: 'beauty_brows', label: 'Brows', group: 'beauty' },
  { value: 'beauty_lashes', label: 'Lashes', group: 'beauty' },
  { value: 'beauty_nails', label: 'Nails', group: 'beauty' },
  { value: 'beauty_skin', label: 'Skin', group: 'beauty' },
  { value: 'beauty_injectables', label: 'Injectables', group: 'beauty' },
  { value: 'beauty_makeup', label: 'Makeup', group: 'beauty' },
];

function StepPhotoAttributeValidation({ data, setData }) {
  const updateAttr = (key, value) => {
    const next = { ...data, [key]: value };
    setData(next);
    saveProgress(next);
  };

  const canContinue = !!(
    data.hairLengthSimple &&
    data.hairColorSimple &&
    data.hairTextureSimple &&
    data.skinToneSimple &&
    data.hairCondition &&
    data.eyeColorSimple
  );

  const selectStyle = {
    width: '100%',
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.25)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1rem',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  };

  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        color: '#8B1E3F',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Confirm your look
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Based on your photos, help us get the details right. This ensures we match you with the best opportunities.
      </p>

      <div style={{
        padding: '1.5rem',
        background: 'rgba(139, 30, 63, 0.05)',
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '12px',
        marginBottom: '1rem',
      }}>
        <label style={labelStyle}>Hair length</label>
        <select
          style={selectStyle}
          value={data.hairLengthSimple || ''}
          onChange={(e) => updateAttr('hairLengthSimple', e.target.value || null)}
        >
          {HAIR_LENGTH_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Hair color</label>
        <select
          style={selectStyle}
          value={data.hairColorSimple || ''}
          onChange={(e) => updateAttr('hairColorSimple', e.target.value || null)}
        >
          {HAIR_COLOR_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Hair texture</label>
        <select
          style={selectStyle}
          value={data.hairTextureSimple || ''}
          onChange={(e) => updateAttr('hairTextureSimple', e.target.value || null)}
        >
          {HAIR_TEXTURE_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Hair condition</label>
        <select
          style={selectStyle}
          value={data.hairCondition || ''}
          onChange={(e) => updateAttr('hairCondition', e.target.value || null)}
        >
          {HAIR_CONDITION_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Skin tone</label>
        <select
          style={selectStyle}
          value={data.skinToneSimple || ''}
          onChange={(e) => updateAttr('skinToneSimple', e.target.value || null)}
        >
          {SKIN_TONE_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>

        <label style={labelStyle}>Eye color</label>
        <select
          style={selectStyle}
          value={data.eyeColorSimple || ''}
          onChange={(e) => updateAttr('eyeColorSimple', e.target.value || null)}
        >
          {EYE_COLOR_OPTIONS.map((o) => (
            <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {!canContinue && (
        <p style={{ fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
          Please complete all fields to continue.
        </p>
      )}
    </div>
  );
}

function StepGetToKnowYou({ data, setData }) {
  const hairOptions = SERVICE_CATEGORY_OPTIONS.filter((o) => o.group === 'hair');
  const beautyOptions = SERVICE_CATEGORY_OPTIONS.filter((o) => o.group === 'beauty');

  const selected = data.servicePreferences || [];

  const togglePreference = (key, checked) => {
    const nextSelected = checked ? [...selected, key] : selected.filter((k) => k !== key);
    const next = { ...data, servicePreferences: nextSelected };
    setData(next);
    saveProgress(next);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
        Service Preferences
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.25rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Select your preferred services across Hair and Beauty.
      </p>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
          Favorite service
        </label>
        <input
          type="text"
          value={data.favoriteServiceText || ''}
          onChange={(e) => {
            const next = { ...data, favoriteServiceText: e.target.value };
            setData(next);
            saveProgress(next);
          }}
          placeholder="Ex: Blowout, color gloss, brow shaping"
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.4rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
          Service you want to try
        </label>
        <input
          type="text"
          value={data.serviceWantToTryText || ''}
          onChange={(e) => {
            const next = { ...data, serviceWantToTryText: e.target.value };
            setData(next);
            saveProgress(next);
          }}
          placeholder="Ex: Highlights, keratin, injectables"
          style={{
            width: '100%',
            padding: '0.65rem 0.75rem',
            borderRadius: '10px',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ marginBottom: '0.6rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>Hair</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
          {hairOptions.map((option) => {
            const isSelected = selected.includes(option.value);
            return (
              <label
                key={option.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '0.65rem 0.75rem',
                  border: `1px solid ${isSelected ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => togglePreference(option.value, e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h4 style={{ marginBottom: '0.6rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>Beauty</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.55rem' }}>
        {beautyOptions.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <label
              key={option.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                cursor: 'pointer',
                padding: '0.65rem 0.75rem',
                border: `1px solid ${isSelected ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
                borderRadius: '10px',
                background: isSelected ? 'rgba(233,69,96,0.12)' : 'rgba(255,255,255,0.04)',
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => togglePreference(option.value, e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{option.label}</span>
            </label>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function StepAvailability({ data, setData }) {
  const dayOptions = [
    { key: 'Mon', label: 'Monday' },
    { key: 'Tue', label: 'Tuesday' },
    { key: 'Wed', label: 'Wednesday' },
    { key: 'Thu', label: 'Thursday' },
    { key: 'Fri', label: 'Friday' },
    { key: 'Sat', label: 'Saturday' },
    { key: 'Sun', label: 'Sunday' },
  ];
  const timeOptions = [
    { key: 'morning', label: 'Morning' },
    { key: 'afternoon', label: 'Afternoon' },
    { key: 'evening', label: 'Evening' },
  ];
  const availabilityByDay = data.availabilityByDay || {};

  const toggleTimeForDay = (dayKey, timeKey) => {
    const daySelections = availabilityByDay[dayKey] || [];
    const nextDaySelections = daySelections.includes(timeKey)
      ? daySelections.filter((k) => k !== timeKey)
      : [...daySelections, timeKey];
    const updated = {
      ...data,
      availabilityByDay: {
        ...availabilityByDay,
        [dayKey]: nextDaySelections,
      },
    };
    setData(updated);
    saveProgress(updated);
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
        Availability
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.25rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Select your availability for each day.
      </p>

      <div style={{ display: 'grid', gap: '0.7rem' }}>
        {dayOptions.map((day) => (
          <div
            key={day.key}
            style={{
              border: '1px solid rgba(139, 30, 63, 0.2)',
              borderRadius: '10px',
              padding: '0.7rem 0.8rem',
              background: 'rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ fontWeight: 600, color: '#8B1E3F', marginBottom: '0.45rem' }}>{day.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
              {timeOptions.map((time) => (
                <label key={`${day.key}-${time.key}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(availabilityByDay[day.key] || []).includes(time.key)}
                    onChange={() => toggleTimeForDay(day.key, time.key)}
                  />
                  <span>{time.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ VERIFICATION STEPS ============

function StepEmailVerification({ data, setData }) {
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [codeSent, setCodeSent] = useState(data?.emailVerified || false);
  const [verified, setVerified] = useState(data?.emailVerified || data?.emailVerificationSkipped || false);

  const useMock = shouldUseMockData();

  const handleSendCode = async () => {
    if (!data?.email || !isValidEmail(data.email)) {
      setError('Please enter a valid email address first');
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      if (useMock || import.meta.env.DEV) {
        setCodeSent(true);
        return;
      }
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
      setCodeSent(true);
    } catch (err) {
      console.error('Send email code error:', err);
      setError(err.message || 'Could not send code. Try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      if (useMock || import.meta.env.DEV) {
        setVerified(true);
        const updated = { ...data, emailVerified: true, emailVerificationCode: code };
        setData(updated);
        saveProgress(updated);
        return;
      }
      await confirmUserAttribute({ userAttributeKey: 'email', confirmationCode: code.trim() });
      setVerified(true);
      const updated = { ...data, emailVerified: true, emailVerificationCode: code };
      setData(updated);
      saveProgress(updated);
    } catch (err) {
      console.error('Verify email error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (verified) {
    return (
      <div>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#8B1E3F', // Cherry
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Email Verified
        </h3>
        <div style={{
          background: 'rgba(76,175,80,0.1)',
          border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#4caf50',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#4A2A1A', // Dark brown
            fontWeight: 'bold',
          }}>✓</div>
          <p style={{ color: '#4caf50', fontWeight: '600' }}>
            {data?.email || 'Email'} has been verified
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Verify Your Email
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        We'll send a verification code to <strong>{data?.email || 'your email'}</strong>
      </p>

      {!codeSent ? (
        <div>
          <button
            onClick={handleSendCode}
            disabled={isSending || !data?.email}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: isSending || !data?.email
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#4A2A1A', // Dark brown
              fontWeight: '600',
              cursor: isSending || !data?.email ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '0.75rem',
            }}
          >
            {isSending ? 'Sending...' : 'Send Verification Code'}
          </button>
          <button
            onClick={() => {
              const updated = { ...data, emailVerified: true, emailVerificationSkipped: true };
              setData(updated);
              saveProgress(updated);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9rem',
              borderRadius: '12px',
              border: '1px solid rgba(139, 30, 63, 0.3)',
              background: 'transparent',
              color: '#4A2A1A', // Dark brown
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Skip for now (Testing)
          </button>
        </div>
      ) : (
        <div>
          <div style={styles.fieldContainer}>
            <label style={styles.fieldLabel}>
              Enter verification code <span style={{ color: '#8B1E3F' }}>*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError(null);
              }}
              placeholder="000000"
              maxLength={6}
              style={{
                ...styles.input,
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontFamily: 'monospace',
              }}
            />
            {error && (
              <div style={{ ...styles.validationMessage, ...styles.validationError, marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginTop: '0.5rem', textAlign: 'center', fontFamily: '"Alike", "Georgia", serif' }}>
              Check your email for the 6-digit code
            </p>
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || code.length !== 6}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: isVerifying || code.length !== 6
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#4A2A1A', // Dark brown
              fontWeight: '600',
              cursor: isVerifying || code.length !== 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem',
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            onClick={() => {
              setCodeSent(false);
              setCode('');
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              background: 'transparent',
              color: '#4A2A1A', // Dark brown
              cursor: 'pointer',
            }}
          >
            Resend Code
          </button>
        </div>
      )}
    </div>
  );
}

function toE164(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone ? `+${digits}` : null;
}

function StepPhoneVerification({ data, setData }) {
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [codeSent, setCodeSent] = useState(data?.phoneVerified || false);
  const [verified, setVerified] = useState(data?.phoneVerified || data?.phoneVerificationSkipped || false);
  const useMock = shouldUseMockData();

  const handleSendCode = async () => {
    if (!data?.phone || data.phone.replace(/[^\d]/g, '').length !== 10) {
      setError('Please enter a valid phone number first');
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      if (useMock || import.meta.env.DEV) {
        setCodeSent(true);
        return;
      }
      const e164 = toE164(data.phone);
      if (e164) {
        try {
          await updateUserAttribute({
            userAttribute: { attributeKey: 'phone_number', value: e164 },
          });
        } catch (_) {}
      }
      await sendUserAttributeVerificationCode({ userAttributeKey: 'phone_number' });
      setCodeSent(true);
    } catch (err) {
      console.error('Send phone code error:', err);
      setError(err.message || 'Could not send code. Try again or skip.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length < 4) {
      setError('Please enter the 6-digit code');
      return;
    }
    setIsVerifying(true);
    setError(null);
    try {
      if (useMock || import.meta.env.DEV) {
        setVerified(true);
        const updated = { ...data, phoneVerified: true, phoneVerificationCode: code };
        setData(updated);
        saveProgress(updated);
        return;
      }
      await confirmUserAttribute({ userAttributeKey: 'phone_number', confirmationCode: code.trim() });
      setVerified(true);
      const updated = { ...data, phoneVerified: true, phoneVerificationCode: code };
      setData(updated);
      saveProgress(updated);
    } catch (err) {
      console.error('Verify phone error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (verified) {
    return (
      <div>
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '1rem',
          color: '#8B1E3F', // Cherry
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          Phone Verified
        </h3>
        <div style={{
          background: 'rgba(76,175,80,0.1)',
          border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#4caf50',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: '#4A2A1A', // Dark brown
            fontWeight: 'bold',
          }}>✓</div>
          <p style={{ color: '#4caf50', fontWeight: '600' }}>
            {data?.phone || 'Phone'} has been verified
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Verify Your Phone
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        We'll send a verification code via SMS to <strong>{data?.phone || 'your phone'}</strong>
      </p>

      {!codeSent ? (
        <div>
          <button
            onClick={handleSendCode}
            disabled={isSending || !data?.phone}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: isSending || !data?.phone
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#4A2A1A', // Dark brown
              fontWeight: '600',
              cursor: isSending || !data?.phone ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '0.75rem',
            }}
          >
            {isSending ? 'Sending...' : 'Send Verification Code'}
          </button>
          <button
            onClick={() => {
              const updated = { ...data, phoneVerified: true, phoneVerificationSkipped: true };
              setData(updated);
              saveProgress(updated);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.9rem',
              borderRadius: '12px',
              border: '1px solid rgba(139, 30, 63, 0.3)',
              background: 'transparent',
              color: '#4A2A1A', // Dark brown
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Skip for now (Testing)
          </button>
        </div>
      ) : (
        <div>
          <div style={styles.fieldContainer}>
            <label style={styles.fieldLabel}>
              Enter verification code <span style={{ color: '#8B1E3F' }}>*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError(null);
              }}
              placeholder="000000"
              maxLength={6}
              style={{
                ...styles.input,
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                fontFamily: 'monospace',
              }}
            />
            {error && (
              <div style={{ ...styles.validationMessage, ...styles.validationError, marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginTop: '0.5rem', textAlign: 'center', fontFamily: '"Alike", "Georgia", serif' }}>
              Check your phone for the 6-digit code
            </p>
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={isVerifying || code.length !== 6}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              borderRadius: '12px',
              border: 'none',
              background: isVerifying || code.length !== 6
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              color: '#4A2A1A', // Dark brown
              fontWeight: '600',
              cursor: isVerifying || code.length !== 6 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginTop: '1rem',
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            onClick={() => {
              setCodeSent(false);
              setCode('');
              setError(null);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              background: 'transparent',
              color: '#4A2A1A', // Dark brown
              cursor: 'pointer',
            }}
          >
            Resend Code
          </button>
        </div>
      )}
    </div>
  );
}

function StepIdentityVerification({ data, setData, userId, uploadEntityId }) {
  return (
    <div>
      <p style={{
        marginBottom: '1rem',
        padding: '0.85rem 1rem',
        borderRadius: '12px',
        background: 'rgba(139, 30, 63, 0.06)',
        border: '1px solid rgba(139, 30, 63, 0.12)',
        color: '#5A3A2A',
        fontSize: '0.92rem',
        lineHeight: 1.55,
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        You can verify with a government ID and selfie below to move faster—or finish now and tap <strong style={{ color: '#4A2A1A' }}>Submit profile</strong>; we&apos;ll queue you for admin review either way.
      </p>
      <IdentityVerification
        userType="model"
      userId={uploadEntityId || userId}
        existingData={data}
        onVerificationComplete={(verificationData) => {
          const updated = { ...data, ...verificationData };
          setData(updated);
          saveProgress(updated);
        }}
      />
    </div>
  );
}

function StepDataPrivacy({ data, setData }) {
  return (
    <div>
      <div style={styles.privacyBanner}>
        <div style={styles.privacyTitle}>
          Your Data Privacy & Security
        </div>
        <div style={styles.privacyText}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>We take your privacy seriously.</strong> Your personal information is protected and used only to match you with the right beauty professionals.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>What we collect:</strong> Basic contact information, photos for matching purposes, and your preferences. We never sell your data to third parties.
          </p>
          <p style={{ marginBottom: '1rem' }}>
            <strong>How we protect you:</strong> All data is encrypted in transit and at rest. Your photos are stored securely and only accessible to our matching system and verified professionals you're matched with.
          </p>
          <p>
            <strong>Your control:</strong> You can update or delete your information at any time through your portal settings. For more details, see our full Privacy Policy.
          </p>
        </div>
      </div>

      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Terms & Conditions
      </h3>
      <p style={{ color: '#5A3A2A', marginBottom: '2rem', fontSize: '0.95rem', fontFamily: '"Alike", "Georgia", serif' }}>
        Please review and accept our terms and conditions to continue.
      </p>

      <div style={{
        background: 'rgba(139, 30, 63, 0.05)',
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>Model Agreement</h4>
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.8',
          color: '#4A2A1A', // Dark brown
        }}>
          <p style={{ marginBottom: '1rem' }}>
            By becoming a Model at Modeled, you agree to the following terms and conditions:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that Modeled connects models with beauty and wellness professionals for training and practice sessions.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You agree to show up on time for scheduled appointments and communicate any changes or cancellations in advance.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You consent to having your photos used for matching purposes and potentially for marketing (with your permission).
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that services are provided by professionals in training and results may vary.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You agree to provide honest feedback about your experience to help professionals improve.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that Modeled is a community platform and agree to treat all members with respect.
            </li>
          </ul>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
            <strong>Full Terms:</strong> For complete terms and conditions, please visit our legal documentation page.
            <br />
            <a 
              href="/legal/model-terms" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#8B1E3F', textDecoration: 'underline' }}
            >
              View Full Terms & Conditions →
            </a>
          </p>
        </div>
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          background: data.termsAccepted ? 'rgba(76,175,80,0.1)' : 'rgba(139, 30, 63, 0.05)',
          border: `2px solid ${data.termsAccepted ? '#4caf50' : 'rgba(139, 30, 63, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="checkbox"
          checked={data.termsAccepted || false}
          onChange={(e) => {
            const updated = { 
              ...data, 
              termsAccepted: e.target.checked,
              termsAcceptedAt: e.target.checked ? new Date().toISOString() : null,
            };
            setData(updated);
            saveProgress(updated);
          }}
          style={{
            width: '20px',
            height: '20px',
            marginTop: '0.25rem',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
            I have read and agree to the Terms & Conditions and Privacy Policy *
          </div>
          <div style={{ fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
            You must accept the terms to continue with your application.
          </div>
        </div>
      </label>
    </div>
  );
}

function StepReview({ data }) {
  const isVerified = data.identityVerificationStatus === 'verified' || 
                     data.identityVerificationStatus === 'manual_review';
  
  return (
    <div>
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#8B1E3F', // Cherry
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Review your profile
      </h3>
      {data.identityVerificationStatus && (
        <div style={{ 
          background: isVerified 
            ? 'rgba(76,175,80,0.2)' 
            : 'rgba(233,69,96,0.2)', 
          border: `1px solid ${isVerified ? 'rgba(76,175,80,0.5)' : 'rgba(233,69,96,0.5)'}`,
          borderRadius: '12px', 
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Identity Verification: {
                data.identityVerificationStatus === 'verified' ? 'Verified' :
                data.identityVerificationStatus === 'manual_review' ? 'Pending Review' :
                'Not Verified'
              }
            </div>
            {data.identityVerificationScore && (
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                Confidence: {data.identityVerificationScore.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}
      
      <div style={{ 
        background: '#FFFEF9', // Ivory
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(139, 30, 63, 0.15)',
        boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>Basic Info</h4>
        <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}><strong>Name:</strong> {data.firstName} {data.lastName}</p>
        <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}><strong>Email:</strong> {data.email || 'Not provided'}</p>
        <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}><strong>Phone:</strong> {data.phone || 'Not provided'}</p>
        <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}><strong>Location:</strong> {data.locationZip || 'Not provided'}</p>
        {data.modelingFocus && (
          <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}>
            <strong>Modeling path:</strong>{' '}
            {data.modelingFocus === 'everyday'
              ? 'Everyday'
              : data.modelingFocus === 'editorial'
                ? 'Editorial'
                : data.modelingFocus === 'both'
                  ? 'Everyday & editorial'
                  : data.modelingFocus}
          </p>
        )}
        {data.mediaTraining && (
          <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.5rem' }}>
            <strong>Training:</strong>{' '}
            {[
              data.mediaTraining.photo ? 'Photo' : null,
              data.mediaTraining.video ? 'Video' : null,
              data.mediaTraining.acting ? 'Acting' : null,
            ].filter(Boolean).join(', ') || 'None selected'}
          </p>
        )}
      </div>

      {(data.servicePreferences?.length || (data.availabilityByDay && Object.keys(data.availabilityByDay).length > 0)) && (
        <div style={{ 
          background: 'rgba(139, 30, 63, 0.05)', 
          borderRadius: '15px', 
          padding: '1.5rem',
          marginBottom: '1.5rem' 
        }}>
          <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Services & Availability</h4>
          {data.servicePreferences && data.servicePreferences.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Service preferences:</strong>
              <p style={{ marginTop: '0.25rem', color: '#4A2A1A', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
                {data.servicePreferences.map((s) => SERVICE_CATEGORY_OPTIONS.find((o) => o.value === s)?.label || s).join(', ')}
              </p>
            </div>
          )}
          {data.availabilityByDay && Object.keys(data.availabilityByDay).some((day) => (data.availabilityByDay[day] || []).length > 0) && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Availability by day:</strong>
              <p style={{ marginTop: '0.25rem', color: '#4A2A1A', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
                {Object.entries(data.availabilityByDay)
                  .filter(([, times]) => Array.isArray(times) && times.length > 0)
                  .map(([day, times]) => `${day}: ${times.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}`)
                  .join(' • ')}
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        background: '#FFFEF9',
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem',
        border: '1px solid rgba(139, 30, 63, 0.15)',
        boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>Photos</h4>
        {data.photoUrls && data.photoUrls.length > 0 ? (
          <p style={{ marginBottom: '0.75rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
            <strong>{data.photoUrls.length}</strong> photos uploaded (minimum 3)
          </p>
        ) : (
          <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>No photos uploaded yet</p>
        )}
      </div>

      {data.termsAccepted && (
        <div style={{ 
          background: 'rgba(76,175,80,0.1)', 
          border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '12px', 
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div>
            <div style={{ fontWeight: '600' }}>Terms & Conditions Accepted</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.25rem' }}>
              Accepted on {data.termsAcceptedAt ? new Date(data.termsAcceptedAt).toLocaleDateString() : 'today'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function ModelOnboard() {
  const navigate = useNavigate();
  // Get user - may be null if not authenticated yet (that's okay for onboarding)
  const authContext = useAuthenticator();
  const user = authContext?.user || null;
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [storageEntityId, setStorageEntityId] = useState('');
  const [formData, setFormData] = useState(() => {
    // Try to load saved progress
    const saved = loadProgress();
    return saved || {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if role is selected, redirect to /join if not
  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole !== 'model') {
      // Store intended route for after selection
      localStorage.setItem('intendedRoute', '/onboard/model');
      navigate('/join');
    }
  }, [navigate]);

  // Save progress on step change (not on every data change to avoid interference)
  useEffect(() => {
    if (currentStep > 0) {
      saveProgress(formData);
    }
  }, [currentStep]);

  useEffect(() => {
    let mounted = true;
    async function loadIdentityId() {
      try {
        const session = await fetchAuthSession();
        const identityId = session?.identityId || '';
        if (mounted && identityId) {
          setStorageEntityId(identityId);
        }
      } catch (error) {
        console.warn('Could not load identityId for storage paths:', error);
      }
    }
    loadIdentityId();
    return () => {
      mounted = false;
    };
  }, []);

  // Reset field index when entering steps with progressive fields
  useEffect(() => {
    if (currentStep === 0) {
      // Reset to first field when entering Basic Info
      setCurrentFieldIndex(0);
    }
  }, [currentStep]);

  const steps = [
    { title: 'Basic Info', component: StepBasicInfo },
    { title: 'Modeling path', component: StepModelingFocus },
    { title: 'Service Preferences', component: StepGetToKnowYou },
    { title: 'Availability', component: StepAvailability },
    { title: 'Photos', component: StepPhotos },
    { title: 'Data Privacy & Terms', component: StepDataPrivacy },
    { title: 'Review', component: StepReview },
    { title: 'Email Verification', component: StepEmailVerification },
    { title: 'Phone Verification', component: StepPhoneVerification },
    { title: 'Identity Verification', component: StepIdentityVerification },
  ];

  // Safety check for step component
  if (!steps[currentStep] || !steps[currentStep].component) {
    console.error('Invalid step index:', currentStep);
    return (
      <div style={styles.container}>
        <div style={styles.formContainer}>
          <h2 style={styles.title}>Error</h2>
          <p>Something went wrong. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep].component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFieldComplete = (nextIndex) => {
    if (nextIndex === 'next-step') {
      handleNext();
    } else if (typeof nextIndex === 'number') {
      setCurrentFieldIndex(nextIndex);
    } else if (nextIndex === 'community-interests') {
      setCurrentFieldIndex(4); // Community interests is after 4 text fields
    }
  };

  // Handle manual field navigation (when user clicks Continue button)
  const handleFieldNavigation = () => {
    // If we're in StepBasicInfo (step 0), advance to next field within that step
    if (currentStep === 0) {
      const totalFields = 9; // firstName, lastName, email, phone, birthday, instagram, tiktok, socialOther, locationZip
      
      if (currentFieldIndex < totalFields - 1) {
        // Move to next field within Basic Info step
        setCurrentFieldIndex(currentFieldIndex + 1);
      } else {
        // All fields complete, move to next step (Email Verification)
        handleNext();
      }
    } else {
      // For other steps, just go to next step
      handleNext();
    }
  };

  const handleNext = () => {
    const modelingFocusStepIndex = steps.findIndex((s) => s.component === StepModelingFocus);
    if (currentStep === modelingFocusStepIndex) {
      if (!formData.modelingFocus || !['everyday', 'editorial', 'both'].includes(formData.modelingFocus)) {
        alert('Please choose whether you are interested in Everyday, Editorial, or Both.');
        return;
      }
    }

    // Photos step - require at least 3 photos before continuing
    const photosStepIndex = steps.findIndex((s) => s.component === StepPhotos);
    if (currentStep === photosStepIndex && (!formData.photoUrls || formData.photoUrls.length < 3)) {
      alert('Please upload at least 3 photos before continuing.');
      return;
    }

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Reset field index when entering a new step
      setCurrentFieldIndex(0);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentFieldIndex(0); // Reset field index
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const userId = user?.userId || user?.username || user?.signInDetails?.loginId;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.locationZip) {
        alert('Please fill in all required fields (First Name, Last Name, ZIP Code)');
        setIsSubmitting(false);
        return;
      }

      if (!formData.phone || !formData.email) {
        alert('Please provide both phone number and email address. Both are required.');
        setIsSubmitting(false);
        return;
      }

      if (!isValidEmail(formData.email)) {
        alert('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.modelingFocus || !['everyday', 'editorial', 'both'].includes(formData.modelingFocus)) {
        alert('Please select your modeling path (Everyday, Editorial, or Both).');
        setIsSubmitting(false);
        return;
      }

      if (!formData.servicePreferences || formData.servicePreferences.length === 0) {
        alert('Please select at least one service preference.');
        setIsSubmitting(false);
        return;
      }

      const hasAvailability = Object.values(formData.availabilityByDay || {}).some(
        (times) => Array.isArray(times) && times.length > 0
      );
      if (!hasAvailability) {
        alert('Please select at least one day/time availability.');
        setIsSubmitting(false);
        return;
      }

      // Skip verification for now (for testing)
      // TODO: Re-enable verification checks later
      // if (!formData.emailVerified) {
      //   alert('Please verify your email address before submitting.');
      //   setIsSubmitting(false);
      //   return;
      // }

      // if (!formData.phoneVerified) {
      //   alert('Please verify your phone number before submitting.');
      //   setIsSubmitting(false);
      //   return;
      // }

      // Confirm-look attributes were intentionally removed from onboarding to keep flow fast.

      if (!formData.termsAccepted) {
        alert('Please accept the Terms & Conditions to continue.');
        setIsSubmitting(false);
        return;
      }

      const skipIdentityVerification = import.meta?.env?.VITE_SKIP_IDENTITY_VERIFICATION === 'true';
      const requireOnboardIdentity = import.meta?.env?.VITE_REQUIRE_ONBOARD_IDENTITY === 'true';

      // Launch default: identity is optional — admin completes verification in CRM. Set VITE_REQUIRE_ONBOARD_IDENTITY=true to hard-require verified/manual_review before submit.
      if (requireOnboardIdentity &&
          !skipIdentityVerification &&
          (!formData.identityVerificationStatus ||
            (formData.identityVerificationStatus !== 'verified' &&
              formData.identityVerificationStatus !== 'manual_review'))) {
        alert('Please complete identity verification before submitting your profile.');
        setIsSubmitting(false);
        return;
      }

      const resolvedIdentityStatus = skipIdentityVerification
        ? 'manual_review'
        : ['verified', 'manual_review', 'failed'].includes(formData.identityVerificationStatus)
          ? formData.identityVerificationStatus
          : 'manual_review';

      // Map formData to ModelProfile schema
      const photoUrls = formData.photoUrls || [];
      const headshotUrl = photoUrls.length > 0 ? photoUrls[0] : null;
      
      const profileData = {
        userId: userId,
        email: formData.email || user?.signInDetails?.loginId || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        locationZip: formData.locationZip,
        willingToTravel: true, // All models willing to travel; distance derived from ZIP + salon lat/long
        travelRadius: null,
        photoUrls: photoUrls,
        headshotUrl: headshotUrl,
        status: 'pending',
        photoAnalysisStatus: 'pending',
        hairLengthSimple: formData.hairLengthSimple || null,
        hairColorSimple: formData.hairColorSimple || null,
        hairTextureSimple: formData.hairTextureSimple || null,
        skinToneSimple: formData.skinToneSimple || null,
        hairCondition: formData.hairCondition || null,
        eyeColorSimple: formData.eyeColorSimple || null,
        userValidatedAttributes: null,
        userValidatedAt: new Date().toISOString(),
        identityVerified: formData.identityVerified || false,
        identityVerificationStatus: resolvedIdentityStatus,
        identityVerificationScore:
          resolvedIdentityStatus === 'manual_review' && !formData.identityVerificationScore
            ? null
            : formData.identityVerificationScore || null,
        idDocumentUrl: formData.idDocumentUrl || null,
        idDocumentType: formData.idDocumentType || null,
        verificationSelfieUrl: formData.verificationSelfieUrl || null,
        favoriteService: JSON.stringify({
          preferences: formData.servicePreferences || [],
          favoriteServiceText: formData.favoriteServiceText || '',
          serviceWantToTryText: formData.serviceWantToTryText || '',
          birthday: formData.birthday || '',
          socials: {
            instagram: formData.instagram || '',
            tiktok: formData.tiktok || '',
            other: formData.socialOther || '',
          },
          modelingFocus: formData.modelingFocus || '',
          mediaTraining: formData.mediaTraining || { photo: false, video: false, acting: false },
        }),
        communityInterests: [],
        communityInterestsOther: JSON.stringify({
          availabilityByDay: formData.availabilityByDay || {},
        }),
        allergies: false, // Set in portal
        virginHair: false, // Set in portal
        termsAccepted: formData.termsAccepted || false,
        termsAcceptedAt: formData.termsAccepted ? (formData.termsAcceptedAt ? new Date(formData.termsAcceptedAt).toISOString() : new Date().toISOString()) : null,
      };

      // Validate profile data before submission
      const validationErrors = [];
      
      if (!profileData.firstName || profileData.firstName.trim().length < 2) {
        validationErrors.push('First name must be at least 2 characters');
      }
      if (!profileData.lastName || profileData.lastName.trim().length < 2) {
        validationErrors.push('Last name must be at least 2 characters');
      }
      if (!profileData.email || !isValidEmail(profileData.email)) {
        validationErrors.push('Valid email address is required');
      }
      if (!profileData.phone || profileData.phone.replace(/[^\d]/g, '').length !== 10) {
        validationErrors.push('Valid 10-digit phone number is required');
      }
      if (!profileData.locationZip || !isValidZip(profileData.locationZip)) {
        validationErrors.push('Valid ZIP code is required');
      }
      if (!profileData.termsAccepted) {
        validationErrors.push('You must accept the Terms & Conditions');
      }
      
      if (validationErrors.length > 0) {
        alert(`Please fix the following errors:\n\n${validationErrors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // Create a new profile when this submission looks like a different model identity,
      // even under the same signed-in account (common during demo/admin testing).
      const { data: existing } = await client.models.ModelProfile.list({
        filter: { userId: { eq: userId } },
        limit: 1,
      });
      let result;
      const existingProfile = existing?.[0];
      const isSameIdentity =
        existingProfile &&
        String(existingProfile.firstName || '').trim().toLowerCase() === String(profileData.firstName || '').trim().toLowerCase() &&
        String(existingProfile.lastName || '').trim().toLowerCase() === String(profileData.lastName || '').trim().toLowerCase() &&
        String(existingProfile.email || '').trim().toLowerCase() === String(profileData.email || '').trim().toLowerCase();

      if (existingProfile && isSameIdentity) {
        result = await client.models.ModelProfile.update({
          id: existingProfile.id,
          ...profileData,
        });
      } else {
        result = await client.models.ModelProfile.create(profileData);
      }
      // Amplify generateClient may return the updated item directly or under .data depending on version.
      const savedProfile = result?.data || result;
      if (!savedProfile || !savedProfile.id) {
        console.warn('Profile save returned no data payload, proceeding in demo mode with existing profile fallback.', result);
      }
      console.log('Profile saved successfully:', savedProfile || result);
      
      // Clear saved progress
      localStorage.removeItem('modelOnboardProgress');
      
      // Show success message with profile ID for reference (fallback to existing profile if needed)
      const profileId = (savedProfile && savedProfile.id) || existing?.[0]?.id || 'unknown';
      alert(`Profile submitted successfully!\n\nYour profile ID: ${profileId}\n\nWe'll review your profile and be in touch soon.`);
      navigate('/thanks?role=model&applied=1');
    } catch (error) {
      console.error('Error submitting profile:', error);
      
      // Enhanced error handling
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.errors && error.errors.length > 0) {
        // GraphQL/AppSync errors
        errorMessage = error.errors.map(e => e.message || e.errorType || 'Unknown error').join('\n');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check for specific error types
      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        errorMessage = 'A profile with this email already exists. Please sign in or use a different email.';
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        errorMessage = 'You do not have permission to create a profile. Please contact support.';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      alert(`Error submitting profile:\n\n${errorMessage}\n\nIf this problem persists, please contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <header style={styles.header}>
        <button 
          style={styles.backBtn} 
          onClick={() => currentStep > 0 ? handleBack() : navigate('/')}
        >
          ← Back
        </button>
        <img src="/assets/logos/modeled-script-transparent.png" alt="Modeled" style={styles.logoImage} />
        <div style={{ width: '80px' }}></div>
      </header>

      <div style={styles.formContainer}>
        <h2 style={styles.title}>Become a Model</h2>
        <p style={styles.subtitle}>{`Step ${currentStep + 1} of ${steps.length}`}</p>
        
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
        </div>

        <div style={styles.stepIndicator}>
          {steps.map((_, idx) => (
            <div
              key={idx}
              style={{
                ...styles.stepDot,
                ...(idx === currentStep ? styles.stepDotActive : {}),
                ...(idx < currentStep ? styles.stepDotComplete : {}),
              }}
            />
          ))}
        </div>

        {(() => {
          try {
            return (
              <CurrentStepComponent 
                data={formData || {}} 
                setData={setFormData}
                userId={user?.userId || user?.username || user?.signInDetails?.loginId}
                uploadEntityId={storageEntityId}
                onFieldComplete={handleFieldComplete}
                currentFieldIndex={currentFieldIndex || 0}
                onNext={handleNext}
              />
            );
          } catch (error) {
            console.error('Error rendering step component:', error);
            return (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ color: '#8B1E3F', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>Error Loading Step</h3>
                <p style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                  Please refresh the page and try again.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(139, 30, 63, 0.3)',
                    background: 'transparent',
                    color: '#4A2A1A', // Dark brown
                    cursor: 'pointer',
                  }}
                >
                  Refresh Page
                </button>
              </div>
            );
          }
        })()}

        <div style={styles.buttonRow}>
          {currentStep > 0 && (
            <button style={styles.secondaryBtn} onClick={handleBack}>
              Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button
              style={styles.primaryBtn}
              onClick={currentStep === 0 ? handleFieldNavigation : handleNext}
            >
              Continue
            </button>
          ) : (
            <button 
              style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.7 : 1 }} 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Profile'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
