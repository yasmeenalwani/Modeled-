import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { sendUserAttributeVerificationCode, confirmUserAttribute, updateUserAttribute, fetchAuthSession } from 'aws-amplify/auth';
import IdentityVerification from '../components/IdentityVerification';
import PhotoUploader from '../components/PhotoUploader';
import { getPortfolioPath, getProfilePhotoPath } from '../utils/storage';
import { geocodeAddress } from '../utils/geocoding';
import { shouldUseMockData } from '../utils/mockDataService';
import {
  ensureEmailVerificationCodeSent,
  confirmEmailVerificationCode,
  getCognitoEmailState,
  formatVerificationError,
} from '../utils/cognitoAttributeVerification';
import { allowOnboardingVerificationBypass } from '../utils/verificationBypass';

const client = generateClient();
const LOCAL_PRO_SUBMISSIONS_KEY = 'modeled_local_professional_submissions';

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

// Validate ZIP code (5-digit or 5+4)
const isValidZip = (zip) => {
  return /^\d{5}(-\d{4})?$/.test(zip);
};

// Portfolio service labels (per-photo)
const PORTFOLIO_SERVICE_OPTIONS = [
  { key: 'blowout', label: 'Blowout' },
  { key: 'cut', label: 'Cut' },
  { key: 'color', label: 'Color' },
  { key: 'highlights', label: 'Highlights' },
  { key: 'gloss', label: 'Gloss' },
  { key: 'keratin', label: 'Keratin' },
  { key: 'styling', label: 'Styling' },
  { key: 'makeup', label: 'Makeup' },
  { key: 'nails', label: 'Nails' },
  { key: 'skincare', label: 'Skincare' },
  { key: 'other', label: 'Other' },
];

const COMMUNITY_INTEREST_OPTIONS = [
  'Perks',
  'Parties',
  'Photoshoots',
  'Other',
];

// US states for address dropdown
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

// Auto-save to localStorage
const saveProgress = (data, type = 'professional') => {
  try {
    localStorage.setItem(`${type}OnboardProgress`, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save progress:', e);
  }
};

// Load progress from localStorage
const loadProgress = (type = 'professional') => {
  try {
    const saved = localStorage.getItem(`${type}OnboardProgress`);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

// ============ STYLES ============
const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFFEF9',
    color: '#4A2A1A',
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
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  formContainer: {
    maxWidth: '600px',
    margin: '0 auto',
    background: '#FFFEF9',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  title: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    textAlign: 'center',
    color: '#5A3A2A',
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
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    transition: 'width 0.5s ease',
  },
  stepTitle: {
    fontSize: '1.3rem',
    marginBottom: '1.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.95rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Alike", "Georgia", serif',
  },
  textarea: {
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Alike", "Georgia", serif',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    background: '#FFFEF9',
    borderRadius: '12px',
    cursor: 'pointer',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    transition: 'all 0.2s ease',
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
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: 'transparent',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  primaryBtn: {
    flex: 1,
    padding: '1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
    color: '#fff',
    fontWeight: '600',
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
    color: '#2D2926',
  },
  helpIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    background: 'rgba(139, 30, 63, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'help',
    fontSize: '0.75rem',
    color: '#5A3A2A',
    transition: 'all 0.2s ease',
  },
  inputFocused: {
    borderColor: '#f4ddb0',
    backgroundColor: 'rgba(244,221,176,0.25)',
    boxShadow: '0 0 0 3px rgba(244,221,176,0.25)',
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
  helpTooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    marginBottom: '0.5rem',
    padding: '0.75rem 1rem',
    background: 'rgba(0,0,0,0.9)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.85rem',
    lineHeight: '1.5',
    maxWidth: '300px',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  privacyBanner: {
    background: 'rgba(244,221,176,0.2)',
    border: '1px solid rgba(244,221,176,0.55)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  privacyTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#8B1E3F',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  privacyText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
    color: '#4A2A1A',
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
    background: '#f4ddb0',
    transform: 'scale(1.2)',
  },
  stepDotComplete: {
    background: '#4caf50',
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
          {label} {required && <span style={{ color: '#e94560' }}>*</span>}
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
        {showValidation && validation && !isValid && localValue && (
          <div style={{
            ...styles.validationMessage,
            ...styles.validationError,
          }}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#f44336',
              marginRight: '0.5rem',
            }}></span>
            {validation.message(localValue, false)}
          </div>
        )}
      </div>
    </div>
  );
}

// ============ STEP COMPONENTS ============

function StepWelcome({ data, setData }) {
  return (
    <div>
      <div style={{
        background: 'rgba(244,221,176,0.18)',
        border: '1px solid rgba(244,221,176,0.45)',
        borderRadius: '15px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          marginBottom: '1rem',
          color: '#e94560',
          fontWeight: '600',
        }}>
          Let's set up your Modeled professional profile
        </h2>
        <div style={{
          fontSize: '1rem',
          lineHeight: '1.8',
          color: '#2D2926',
        }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong>We cultivate talent.</strong> We support emerging professionals through continued education and experience. We help you train, develop, and master all beauty and hair services by connecting you to models.
          </p>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#8B1E3F',
            marginTop: '1.5rem',
          }}>
            Grow your skills. Build your portfolio. Join our community.
          </p>
        </div>
      </div>
      
      <div style={{
        textAlign: 'center',
        color: '#5A3A2A',
        fontSize: '0.95rem',
      }}>
        <p>Ready to start your journey? Let's get started!</p>
      </div>
    </div>
  );
}

function StepBasicInfo({ data, setData, onFieldComplete, currentFieldIndex = 0 }) {
  const fields = [
    {
      key: 'firstName',
      label: 'First name',
      placeholder: 'Sarah',
      helpText: 'We use your first name to personalize your experience and create your professional profile.',
      validation: {
        isValid: (v) => v && v.length >= 2,
        message: (v, isValid) => isValid ? 'Looks good!' : 'Please enter at least 2 characters',
      },
    },
    {
      key: 'lastName',
      label: 'Last name',
      placeholder: 'Martinez',
      helpText: 'Your last name helps us verify your identity and create your professional profile.',
      validation: {
        isValid: (v) => v && v.length >= 2,
        message: (v, isValid) => isValid ? 'Perfect!' : 'Please enter at least 2 characters',
      },
    },
    {
      key: 'email',
      label: 'Email',
      placeholder: 'sarah@example.com',
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
      key: 'instagramHandle',
      label: 'Instagram Handle (optional)',
      placeholder: '@yourhandle',
      helpText: 'Your Instagram handle helps us showcase your work and connect with you on social media.',
    },
  ];

  const safeFieldIndex = currentFieldIndex || 0;
  const currentField = fields[safeFieldIndex] || fields[0];
  const fieldValue = (data && data[currentField.key]) ? data[currentField.key] : '';

  const handleFieldChange = (newValue) => {
    setData({ ...data, [currentField.key]: newValue });
  };

  return (
    <div>
      <h3 style={styles.stepTitle}>Tell us about yourself</h3>
      
      {/* Progress dots */}
      <div style={styles.stepIndicator}>
        {fields.map((_, idx) => (
          <div
            key={idx}
            style={{
              ...styles.stepDot,
              ...(idx === safeFieldIndex ? styles.stepDotActive : {}),
              ...(idx < safeFieldIndex ? styles.stepDotComplete : {}),
            }}
          />
        ))}
      </div>

      <ProgressiveField
          label={currentField.label}
          value={fieldValue}
          onChange={handleFieldChange}
          type={currentField.type || 'text'}
          placeholder={currentField.placeholder}
          helpText={currentField.helpText}
          validation={currentField.validation}
          formatValue={currentField.formatValue}
          required={currentField.key !== 'instagramHandle'}
        />
    </div>
  );
}

function StepEmailVerification({ data, setData, onSkip }) {
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(data?.emailVerified || false);
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [cognitoEmail, setCognitoEmail] = useState(null);
  const allowTestBypass = allowOnboardingVerificationBypass();

  useEffect(() => {
    if (allowTestBypass || isVerified) return;
    let cancelled = false;
    (async () => {
      try {
        const state = await getCognitoEmailState();
        if (cancelled) return;
        if (state.email) setCognitoEmail(state.email);
        if (state.emailVerified) {
          setIsVerified(true);
          setData({ ...data, emailVerified: true, email: data?.email || state.email });
        }
      } catch (err) {
        console.warn('Could not read Cognito email state:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [allowTestBypass, isVerified]);

  const handleSendCode = async () => {
    if (!data?.email) {
      setError('Enter your email in Basic Info first.');
      return;
    }
    setError(null);
    setIsSending(true);
    try {
      if (allowTestBypass) {
        setCodeSent(true);
        return;
      }
      const result = await ensureEmailVerificationCodeSent(data.email);
      if (result.status === 'already_verified') {
        setIsVerified(true);
        setData({ ...data, emailVerified: true, email: result.email || data.email });
        return;
      }
      setCodeSent(true);
    } catch (err) {
      console.error('Send email code error:', err);
      setError(formatVerificationError(err));
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setError(null);
    setIsVerifying(true);
    try {
      if (allowTestBypass) {
        setIsVerified(true);
        setData({ ...data, emailVerified: true });
        return;
      }
      await confirmEmailVerificationCode(code);
      setIsVerified(true);
      setData({ ...data, emailVerified: true });
    } catch (err) {
      console.error('Verify email error:', err);
      setError(formatVerificationError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div>
        <h3 style={styles.stepTitle}>Email Verified</h3>
        <div style={{
          background: 'rgba(76,175,80,0.2)',
          border: '1px solid rgba(76,175,80,0.5)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#2D2926', fontSize: '1.1rem' }}>
            Your email has been verified!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={styles.stepTitle}>Verify Your Email</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.95rem' }}>
        We'll send a verification code to <strong>{data?.email || 'your email'}</strong>. Click below to send the code, then enter it here.
        {cognitoEmail && cognitoEmail.toLowerCase() !== (data?.email || '').toLowerCase() && (
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            Your sign-in email is <strong>{cognitoEmail}</strong>. Use the same address in Basic Info.
          </span>
        )}
      </p>

      {!codeSent ? (
        <button
          style={{ ...styles.primaryBtn, width: '100%', marginBottom: '1rem' }}
          onClick={handleSendCode}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send verification code'}
        </button>
      ) : (
        <>
          <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.9rem' }}>Code sent. Check your inbox and enter it below.</p>
          <div style={styles.formGroup}>
            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              style={styles.input}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          <button
            style={{ ...styles.primaryBtn, width: '100%', marginTop: '0.5rem', opacity: code.length >= 4 ? 1 : 0.5 }}
            onClick={handleVerify}
            disabled={code.length < 4 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Email'}
          </button>
        </>
      )}

      {error && <p style={{ color: '#c62828', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}

      
    </div>
  );
}

// Normalize US phone to E.164 for Cognito (+1xxxxxxxxxx)
function toE164(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return phone ? `+${digits}` : null;
}

function StepPhoneVerification({ data, setData, onSkip }) {
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const allowTestBypass = allowOnboardingVerificationBypass();

  const handleSendCode = async () => {
    setError(null);
    setIsSending(true);
    try {
      if (allowTestBypass) {
        setCodeSent(true);
        return;
      }
      const e164 = toE164(data?.phone);
      if (e164) {
        try {
          await updateUserAttribute({
            userAttribute: { attributeKey: 'phone_number', value: e164 },
          });
        } catch (_) {
          // Attribute may already be set
        }
      }
      await sendUserAttributeVerificationCode({ userAttributeKey: 'phone_number' });
      setCodeSent(true);
    } catch (err) {
      console.error('Send phone code error:', err);
      setError(err.message || 'Could not send code. Ensure your phone is set in Basic Info and try again, or skip.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) return;
    setError(null);
    setIsVerifying(true);
    try {
      if (allowTestBypass) {
        setIsVerified(true);
        setData({ ...data, phoneVerified: true });
        return;
      }
      await confirmUserAttribute({ userAttributeKey: 'phone_number', confirmationCode: code.trim() });
      setIsVerified(true);
      setData({ ...data, phoneVerified: true });
    } catch (err) {
      console.error('Verify phone error:', err);
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div>
        <h3 style={styles.stepTitle}>Phone Verified</h3>
        <div style={{
          background: 'rgba(76,175,80,0.2)',
          border: '1px solid rgba(76,175,80,0.5)',
          borderRadius: '12px',
          padding: '1.5rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#2D2926', fontSize: '1.1rem' }}>
            Your phone number has been verified!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={styles.stepTitle}>Verify Your Phone</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.95rem' }}>
        We'll send a verification code via SMS to <strong>{data?.phone || 'your phone'}</strong>. Click below to send the code, then enter it here.
      </p>

      {!codeSent ? (
        <button
          style={{ ...styles.primaryBtn, width: '100%', marginBottom: '1rem' }}
          onClick={handleSendCode}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : 'Send verification code'}
        </button>
      ) : (
        <>
          <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.9rem' }}>Code sent. Check your phone and enter it below.</p>
          <div style={styles.formGroup}>
            <label style={styles.label}>Verification Code</label>
            <input
              type="text"
              style={styles.input}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError(null); }}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>
          <button
            style={{ ...styles.primaryBtn, width: '100%', marginTop: '0.5rem', opacity: code.length >= 4 ? 1 : 0.5 }}
            onClick={handleVerify}
            disabled={code.length < 4 || isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Phone'}
          </button>
        </>
      )}

      {error && <p style={{ color: '#c62828', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}

      
    </div>
  );
}

function StepEducation({ data, setData, currentFieldIndex = 0 }) {
  const fields = ['educationSchool', 'schoolStatus', 'yearsExperience', 'licenseNumber', 'licenseState', 'education'];
  const safeFieldIndex = Math.min(Math.max(currentFieldIndex || 0, 0), fields.length - 1);
  const currentField = fields[safeFieldIndex];

  return (
    <div>
      <h3 style={styles.stepTitle}>Education & Training</h3>
      {currentField === 'educationSchool' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Cosmetology / Beauty School *</label>
          <input
            type="text"
            style={styles.input}
            value={data.educationSchool || ''}
            onChange={(e) => setData({ ...data, educationSchool: e.target.value })}
            placeholder="e.g. Aveda Institute, Paul Mitchell School"
            required
          />
        </div>
      )}

      {currentField === 'schoolStatus' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>School Status *</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ ...styles.checkboxLabel, flex: 1, justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={data.schoolStatus === 'in_school'}
                onChange={() => setData({ ...data, schoolStatus: data.schoolStatus === 'in_school' ? '' : 'in_school' })}
              />
              <span>In school</span>
            </label>
            <label style={{ ...styles.checkboxLabel, flex: 1, justifyContent: 'center' }}>
              <input
                type="checkbox"
                checked={data.schoolStatus === 'graduated'}
                onChange={() => setData({ ...data, schoolStatus: data.schoolStatus === 'graduated' ? '' : 'graduated' })}
              />
              <span>Graduated</span>
            </label>
          </div>
        </div>
      )}

      {currentField === 'yearsExperience' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Years Experience *</label>
          <input
            type="number"
            style={styles.input}
            value={data.yearsExperience ?? ''}
            onChange={(e) => setData({ ...data, yearsExperience: parseInt(e.target.value, 10) || 0 })}
            min="0"
            placeholder="0"
            required
          />
        </div>
      )}

      {currentField === 'licenseNumber' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Cosmetology License Number *</label>
          <input
            type="text"
            style={styles.input}
            value={data.licenseNumber || ''}
            onChange={(e) => setData({ ...data, licenseNumber: e.target.value })}
            placeholder="Your license number"
          />
        </div>
      )}

      {currentField === 'licenseState' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>License State *</label>
          <select
            style={styles.select}
            value={data.licenseState || ''}
            onChange={(e) => setData({ ...data, licenseState: e.target.value })}
          >
            <option value="">Select state...</option>
            {US_STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      )}

      {currentField === 'education' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Additional education notes (workshops, courses, etc.)</label>
          <textarea
            style={{ ...styles.textarea, minHeight: '80px' }}
            value={data.education || ''}
            onChange={(e) => setData({ ...data, education: e.target.value })}
            placeholder="Optional notes"
          />
        </div>
      )}
    </div>
  );
}

function StepExperience({ data, setData }) {
  return (
    <div>
      <h3 style={styles.stepTitle}>Your experience</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        We'll learn about your services from your portfolio photos. Tell us your professional level and years in the industry.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Experience Level *</label>
        <select
          style={styles.select}
          value={data.experienceLevel || ''}
          onChange={(e) => setData({ ...data, experienceLevel: e.target.value })}
        >
          <option value="">Select your level</option>
          <option value="student">Student / In Training</option>
          <option value="apprentice">Apprentice</option>
          <option value="junior">Junior Stylist</option>
          <option value="senior">Senior Stylist</option>
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Years Working (total in industry) *</label>
        <input
          type="number"
          style={styles.input}
          value={data.yearsWorking ?? ''}
          onChange={(e) => setData({ ...data, yearsWorking: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min="0"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Years in a Salon *</label>
        <input
          type="number"
          style={styles.input}
          value={data.yearsInSalon ?? ''}
          onChange={(e) => setData({ ...data, yearsInSalon: parseInt(e.target.value) || 0 })}
          placeholder="0"
          min="0"
          required
        />
        <p style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.35rem' }}>
          Time spent working in a salon environment (vs. school, freelance, etc.)
        </p>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>License Number *</label>
        <input
          type="text"
          style={styles.input}
          value={data.licenseNumber || ''}
          onChange={(e) => setData({ ...data, licenseNumber: e.target.value })}
          placeholder="Your professional license number"
          required
        />
      </div>
    </div>
  );
}

function StepGetToKnowYou({ data, setData, currentFieldIndex = 0 }) {
  const questions = [
    {
      key: 'signatureService',
      label: 'Any signature services...',
      placeholder: 'Any signature services...',
      helpText: '',
    },
    {
      key: 'serviceWantToTry',
      label: 'And new services...',
      placeholder: 'And new services...',
      helpText: '',
    },
    {
      key: 'communityInterests',
      label: 'Interests',
      placeholder: '',
      helpText: '',
    },
  ];

  const safeFieldIndex = currentFieldIndex || 0;
  const currentQuestion = questions[safeFieldIndex] || questions[0];
  const questionValue = (data && data[currentQuestion.key]) ? data[currentQuestion.key] : '';

  const handleQuestionChange = (newValue) => {
    setData({ ...data, [currentQuestion.key]: newValue });
  };

  const handleCommunityInterestChange = (value, checked) => {
    const current = data.communityInterests || [];
    if (checked) {
      setData({ ...data, communityInterests: [...current, value] });
    } else {
      const updated = current.filter((k) => k !== value);
      setData({
        ...data,
        communityInterests: updated,
        communityInterestsOtherText: value === 'Other' ? '' : (data.communityInterestsOtherText || ''),
      });
    }
  };

  return (
    <div>
      <h3 style={styles.stepTitle}>Interests</h3>
      
      {/* Progress dots */}
      <div style={styles.stepIndicator}>
        {questions.map((_, idx) => (
          <div
            key={idx}
            style={{
              ...styles.stepDot,
              ...(idx === safeFieldIndex ? styles.stepDotActive : {}),
              ...(idx < safeFieldIndex ? styles.stepDotComplete : {}),
            }}
          />
        ))}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>{currentQuestion.label}</label>
        {currentQuestion.helpText && (
          <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
            {currentQuestion.helpText}
          </p>
        )}
        {currentQuestion.key !== 'communityInterests' ? (
          <>
            <textarea
              style={{
                ...styles.textarea,
                minHeight: '120px',
                borderColor: questionValue ? '#4caf50' : 'rgba(139, 30, 63, 0.2)',
              }}
              value={questionValue}
              onChange={(e) => handleQuestionChange(e.target.value)}
              placeholder={currentQuestion.placeholder}
            />
          </>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
              {COMMUNITY_INTEREST_OPTIONS.map((option) => (
                <label key={option} style={{ ...styles.checkboxLabel, justifyContent: 'flex-start' }}>
                  <input
                    type="checkbox"
                    checked={(data.communityInterests || []).includes(option)}
                    onChange={(e) => handleCommunityInterestChange(option, e.target.checked)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {(data.communityInterests || []).includes('Other') && (
              <div style={{ marginTop: '1rem' }}>
                <label style={styles.label}>Other community interest (optional)</label>
                <input
                  type="text"
                  style={styles.input}
                  value={data.communityInterestsOtherText || ''}
                  onChange={(e) => setData({ ...data, communityInterestsOtherText: e.target.value })}
                  placeholder="Add your own preference"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StepWorkplace({ data, setData, currentFieldIndex = 0 }) {
  const fields = ['salonName', 'salonStreet', 'salonCity', 'salonState', 'salonZip'];
  const safeFieldIndex = Math.min(Math.max(currentFieldIndex || 0, 0), fields.length - 1);
  const currentField = fields[safeFieldIndex];

  return (
    <div>
      <h3 style={styles.stepTitle}>Where do you work?</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        One question at a time. This address will be used for location.
      </p>

      {currentField === 'salonName' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Salon/Studio Name *</label>
          <input
            type="text"
            style={styles.input}
            value={data.salonName || ''}
            onChange={(e) => setData({ ...data, salonName: e.target.value })}
            placeholder="e.g. Luxe Studio"
          />
        </div>
      )}

      {currentField === 'salonStreet' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Street Address *</label>
          <input
            type="text"
            style={styles.input}
            value={data.salonStreet || ''}
            onChange={(e) => setData({ ...data, salonStreet: e.target.value })}
            placeholder="e.g. 123 Madison Ave, Suite 4"
          />
        </div>
      )}

      {currentField === 'salonCity' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>City *</label>
          <input
            type="text"
            style={styles.input}
            value={data.salonCity || ''}
            onChange={(e) => setData({ ...data, salonCity: e.target.value })}
            placeholder="e.g. New York"
          />
        </div>
      )}

      {currentField === 'salonState' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>State *</label>
          <select
            style={styles.select}
            value={data.salonState || ''}
            onChange={(e) => setData({ ...data, salonState: e.target.value })}
          >
            <option value="">Select state</option>
            {US_STATES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      )}

      {currentField === 'salonZip' && (
        <div style={styles.formGroup}>
          <label style={styles.label}>ZIP Code *</label>
          <input
            type="text"
            style={styles.input}
            value={data.salonZip || ''}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 5);
              setData({ ...data, salonZip: val });
            }}
            placeholder="12345"
            maxLength={5}
          />
          {data.salonZip && !isValidZip(data.salonZip) && (
            <p style={{ fontSize: '0.8rem', color: '#e94560', marginTop: '0.35rem' }}>
              Please enter a valid 5-digit ZIP.
            </p>
          )}
        </div>
      )}

    </div>
  );
}

function StepPortfolio({ data, setData, userId, storageEntityId }) {
  const uploadEntityId = storageEntityId || userId;

  const handleSelfPhotoUpload = (results) => {
    const photoUrls = results.map(r => r.url);
    const photoKeys = results.map(r => r.key);
    setData({
      ...data,
      selfPhotoUrls: [...(data.selfPhotoUrls || []), ...photoUrls],
      selfPhotoKeys: [...(data.selfPhotoKeys || []), ...photoKeys],
    });
  };

  const handleSelfPhotoDelete = (photo) => {
    const updatedUrls = (data.selfPhotoUrls || []).filter(url => url !== photo.url);
    const updatedKeys = (data.selfPhotoKeys || []).filter(key => key !== photo.key);
    setData({
      ...data,
      selfPhotoUrls: updatedUrls,
      selfPhotoKeys: updatedKeys,
    });
  };

  const handleWorkPhotoUpload = (results) => {
    const newItems = results.map(r => ({ url: r.url, key: r.key, serviceLabel: '' }));
    setData({
      ...data,
      portfolioItems: [...(data.portfolioItems || []), ...newItems],
    });
  };

  const handleWorkPhotoDelete = (photo) => {
    const updated = (data.portfolioItems || []).filter(item => item.url !== photo.url);
    setData({ ...data, portfolioItems: updated });
  };

  const handlePortfolioServiceLabel = (index, serviceLabel) => {
    const items = [...(data.portfolioItems || [])];
    if (items[index]) {
      items[index] = { ...items[index], serviceLabel };
      setData({ ...data, portfolioItems: items });
    }
  };

  return (
    <div>
      <h3 style={styles.stepTitle}>Portfolio</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Upload your photos and portfolio.
      </p>

      <div style={styles.formGroup}>
        <label style={styles.label}>Photo of Self *</label>
        <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
          Upload clear photos of yourself for identity verification
        </p>
        <PhotoUploader
          onUpload={handleSelfPhotoUpload}
          pathGenerator={(filename) => getProfilePhotoPath('professional', uploadEntityId, `pro-verification-self-${filename}`)}
          maxFiles={3}
          accentColor="#e94560"
          existingPhotos={data.selfPhotoUrls?.map((url, idx) => ({
            url,
            key: data.selfPhotoKeys?.[idx] || url,
          })) || []}
          onDelete={handleSelfPhotoDelete}
          title="Upload Self Photos"
          subtitle="Clear photos for verification (up to 3)"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Portfolio * (min 6 photos)</label>
        <p style={{ fontSize: '0.85rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
          Add at least 6 photos of your work. Label each with the service (blowout, cut, color, etc.).
        </p>
        <PhotoUploader
          onUpload={handleWorkPhotoUpload}
          pathGenerator={(filename) => getPortfolioPath(uploadEntityId, `pro-work-portfolio-${filename}`)}
          maxFiles={20}
          accentColor="#e94560"
          existingPhotos={(data.portfolioItems || []).map(item => ({ url: item.url, key: item.key }))}
          onDelete={handleWorkPhotoDelete}
          title="Upload Portfolio"
          subtitle={`${(data.portfolioItems || []).length}/6 minimum – before & after photos`}
        />
        {(data.portfolioItems || []).length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', color: '#4A2A1A' }}>
              Label each photo
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '1rem',
            }}>
              {(data.portfolioItems || []).map((item, idx) => (
                <div
                  key={item.url || idx}
                  style={{
                    background: 'rgba(139, 30, 63, 0.04)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: `1px solid ${item.serviceLabel ? 'rgba(76,175,80,0.3)' : 'rgba(139, 30, 63, 0.15)'}`,
                  }}
                >
                  <div style={{ aspectRatio: '1', overflow: 'hidden' }}>
                    <img src={item.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <select
                      style={{
                        ...styles.select,
                        padding: '0.4rem 0.5rem',
                        fontSize: '0.8rem',
                        width: '100%',
                        border: `1px solid ${item.serviceLabel ? 'rgba(76,175,80,0.4)' : 'rgba(139, 30, 63, 0.2)'}`,
                      }}
                      value={item.serviceLabel || ''}
                      onChange={(e) => handlePortfolioServiceLabel(idx, e.target.value)}
                    >
                      <option value="">Select service</option>
                      {PORTFOLIO_SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function StepVerification({ data, setData, userId, storageEntityId }) {
  return (
    <div>
      <h3 style={styles.stepTitle}>Verification</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1rem', fontSize: '0.95rem' }}>
        Complete identity verification using your ID and selfie.
      </p>
      <IdentityVerification
        userType="professional"
        userId={storageEntityId || userId}
        existingData={data}
        onVerificationComplete={(verificationData) => {
          setData({ ...data, ...verificationData });
        }}
      />
    </div>
  );
}

function StepDataPrivacy({ data, setData }) {
  return (
    <div>
      <h3 style={styles.stepTitle}>Data Privacy & Protection</h3>
      <div style={styles.privacyBanner}>
        <div style={styles.privacyTitle}>
          Your Data is Protected
        </div>
        <div style={styles.privacyText}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>Privacy First:</strong> We take your privacy seriously. All personal information you provide is encrypted and stored securely.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>What We Collect:</strong> We only collect information necessary to match you with models and provide our services. This includes your professional credentials, contact information, and portfolio photos.
          </p>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong>How We Use It:</strong> Your information is used exclusively for matching, communication, and platform operations. We never sell your data to third parties.
          </p>
          <p>
            <strong>Your Control:</strong> You can update or delete your information at any time through your portal settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTermsAndConditions({ data, setData }) {
  return (
    <div>
      <h3 style={styles.stepTitle}>Terms & Conditions</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '2rem', fontSize: '0.95rem' }}>
        Please review and accept our terms and conditions to continue.
      </p>

      <div style={{
        background: 'rgba(139, 30, 63, 0.06)',
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        maxHeight: '400px',
        overflowY: 'auto',
      }}>
        <h4 style={{ color: '#e94560', marginBottom: '1rem' }}>Professional Agreement</h4>
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.8',
          color: '#4A2A1A',
        }}>
          <p style={{ marginBottom: '1rem' }}>
            By becoming a Professional at Modeled, you agree to the following terms and conditions:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that Modeled connects professionals with models for training and practice sessions.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You agree to provide quality services and maintain professional standards at all times.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You consent to having your work photos and portfolio used for matching and marketing purposes.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that models are providing their time and hair/beauty services for your training.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You agree to provide honest feedback and complete training hour logs after each session.
            </li>
            <li style={{ marginBottom: '0.5rem' }}>
              You understand that Modeled is a community platform and agree to treat all members with respect.
            </li>
          </ul>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#5A3A2A' }}>
            <strong>Full Terms:</strong> For complete terms and conditions, please visit our legal documentation page.
            <br />
            <a 
              href="/legal/professional-terms" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#e94560', textDecoration: 'underline' }}
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
          background: data.termsAccepted ? 'rgba(76,175,80,0.1)' : 'rgba(139, 30, 63, 0.04)',
          border: `2px solid ${data.termsAccepted ? '#4caf50' : 'rgba(139, 30, 63, 0.2)'}`,
          borderRadius: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          type="checkbox"
          checked={data.termsAccepted || false}
          onChange={(e) => setData({ 
            ...data, 
            termsAccepted: e.target.checked,
            termsAcceptedAt: e.target.checked ? new Date().toISOString() : null,
          })}
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
            I have read and agree to the Terms & Conditions *
          </div>
          <div style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>
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
      <h3 style={styles.stepTitle}>Review your profile</h3>
      <p style={{ color: '#5A3A2A', marginBottom: '1.5rem' }}>
        Once approved, you'll be able to edit your profile and preferences in your portal.
      </p>
      
      {/* Verification Status */}
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
          <span style={{ fontSize: '1.5rem' }}>
            {isVerified ? '' : ''}
          </span>
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
        background: 'rgba(139, 30, 63, 0.06)', 
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem' 
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Basic Info</h4>
        <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
        <p><strong>Email:</strong> {data.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> {data.phone || 'Not provided'}</p>
        <p><strong>Instagram:</strong> {data.instagramHandle || 'Not provided'}</p>
      </div>

      <div style={{ 
        background: 'rgba(139, 30, 63, 0.06)', 
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem' 
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Education</h4>
        {data.educationSchool && <p><strong>School:</strong> {data.educationSchool}</p>}
        {data.schoolStatus && <p><strong>Status:</strong> {data.schoolStatus === 'in_school' ? 'In school' : 'Graduated'}</p>}
        {(data.yearsExperience !== undefined && data.yearsExperience !== null) && (
          <p><strong>Years Experience:</strong> {data.yearsExperience}</p>
        )}
        {data.licenseNumber && <p><strong>License Number:</strong> {data.licenseNumber}</p>}
        {data.licenseState && <p><strong>License State:</strong> {data.licenseState}</p>}
        {data.education && <p><strong>Additional notes:</strong> {data.education}</p>}
      </div>

      <div style={{ 
        background: 'rgba(139, 30, 63, 0.06)', 
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem' 
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Workplace</h4>
        <p><strong>Salon:</strong> {data.salonName || 'Not provided'}</p>
        <p><strong>Address:</strong>{' '}
          {[data.salonStreet, data.salonCity, data.salonState, data.salonZip].filter(Boolean).join(', ') || 'Not provided'}
        </p>
      </div>

      {(data.yearsExperience !== undefined || data.licenseNumber || data.licenseState) && (
        <div style={{ 
          background: 'rgba(139, 30, 63, 0.06)', 
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '15px', 
          padding: '1.5rem',
          marginBottom: '1.5rem' 
        }}>
          <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Professional Credentials</h4>
          <p><strong>Years Experience:</strong> {data.yearsExperience ?? 'Not provided'}</p>
          <p><strong>License Number:</strong> {data.licenseNumber || 'Not provided'}</p>
          <p><strong>License State:</strong> {data.licenseState || 'Not provided'}</p>
        </div>
      )}

      {/* Get to Know You */}
      {(data.signatureService || data.serviceWantToTry || (data.communityInterests && data.communityInterests.length > 0)) && (
        <div style={{ 
          background: 'rgba(139, 30, 63, 0.06)', 
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '15px', 
          padding: '1.5rem',
          marginBottom: '1.5rem' 
        }}>
          <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Professional Focus</h4>
          {data.signatureService && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>Signature service:</strong>
              <p style={{ marginTop: '0.25rem', color: '#4A2A1A', fontSize: '0.9rem' }}>
                {data.signatureService}
              </p>
            </div>
          )}
          {data.serviceWantToTry && (
            <div style={{ marginBottom: '1rem' }}>
              <strong>New service to practice:</strong>
              <p style={{ marginTop: '0.25rem', color: '#4A2A1A', fontSize: '0.9rem' }}>
                {data.serviceWantToTry}
              </p>
            </div>
          )}
          {data.communityInterests && data.communityInterests.length > 0 && (
            <div>
              <strong>Community interests:</strong>
              <p style={{ marginTop: '0.25rem', color: '#4A2A1A', fontSize: '0.9rem' }}>
                {data.communityInterests.join(', ')}
                {data.communityInterestsOtherText ? ` (${data.communityInterestsOtherText})` : ''}
              </p>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        background: 'rgba(139, 30, 63, 0.06)', 
        border: '1px solid rgba(139, 30, 63, 0.15)',
        borderRadius: '15px', 
        padding: '1.5rem',
        marginBottom: '1.5rem' 
      }}>
        <h4 style={{ color: '#8B1E3F', marginBottom: '1rem' }}>Photos</h4>
        <p><strong>Self Photos:</strong> {(data.selfPhotoUrls || []).length} uploaded</p>
        <p><strong>Work Portfolio:</strong> {(data.portfolioItems || []).length} photos</p>
        {(data.portfolioItems || []).length > 0 && (
          <ul style={{ marginTop: '0.5rem', marginLeft: '1.25rem', fontSize: '0.9rem' }}>
            {(data.portfolioItems || []).map((item, idx) => (
              <li key={idx}>{item.serviceLabel || 'Unlabeled'}: {item.url ? '✓' : '—'}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Terms Acceptance */}
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
          <span style={{ fontSize: '1.5rem' }}></span>
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
export default function ProfessionalOnboard() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [storageEntityId, setStorageEntityId] = useState('');
  const [formData, setFormData] = useState(() => {
    // Load saved progress on mount
    const saved = loadProgress('professional');
    return saved || {
      email: '',
      specialties: [],
    };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if role is selected, redirect to /join if not
  useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole !== 'professional') {
      // Store intended route for after selection
      localStorage.setItem('intendedRoute', '/onboard/professional');
      navigate('/join');
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadStorageIdentity = async () => {
      try {
        const session = await fetchAuthSession();
        const identityId = session?.identityId || '';
        if (mounted && identityId) {
          setStorageEntityId(identityId);
        }
      } catch (error) {
        console.warn('Unable to load storage identity id:', error);
      }
    };
    loadStorageIdentity();
    return () => { mounted = false; };
  }, []);

  // Save progress whenever formData changes
  useEffect(() => {
    saveProgress(formData, 'professional');
  }, [formData]);

  // Reset currentFieldIndex when entering progressive steps
  useEffect(() => {
    if (currentStep === 0 || currentStep === 1 || currentStep === 2 || currentStep === 3) {
      setCurrentFieldIndex(0);
    }
  }, [currentStep]);

  const steps = [
    { title: 'Basic Info', component: StepBasicInfo },
    { title: 'Education', component: StepEducation },
    { title: 'Workplace', component: StepWorkplace },
    { title: 'Get to Know You', component: StepGetToKnowYou },
    { title: 'Portfolio', component: StepPortfolio },
    { title: 'Data Privacy', component: StepDataPrivacy },
    { title: 'Terms & Conditions', component: StepTermsAndConditions },
    { title: 'Review', component: StepReview },
    { title: 'Email Verification', component: StepEmailVerification },
    { title: 'Phone Verification', component: StepPhoneVerification },
    { title: 'Verification', component: StepVerification },
  ];

  const CurrentStepComponent = steps[currentStep]?.component;
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Handle field navigation within progressive steps
  const handleFieldNavigation = (newFieldIndex) => {
    setCurrentFieldIndex(newFieldIndex);
  };

  const getCurrentStepFieldError = () => {
    if (currentStep === 0) {
      const basicInfoFields = ['firstName', 'lastName', 'email', 'phone', 'instagramHandle'];
      const currentField = basicInfoFields[currentFieldIndex];
      if (currentField === 'firstName' && !formData.firstName?.trim()) return 'Please enter your first name.';
      if (currentField === 'lastName' && !formData.lastName?.trim()) return 'Please enter your last name.';
      if (currentField === 'email') {
        if (!formData.email?.trim()) return 'Please enter your email address.';
        if (!isValidEmail(formData.email)) return 'Please enter a valid email address.';
      }
      if (currentField === 'phone') {
        const digits = (formData.phone || '').replace(/[^\d]/g, '');
        if (digits.length !== 10) return 'Please enter a valid 10-digit phone number.';
      }
    }

    if (currentStep === 1) {
      const educationFields = ['educationSchool', 'schoolStatus', 'yearsExperience', 'licenseNumber', 'licenseState', 'education'];
      const currentField = educationFields[currentFieldIndex];
      if (currentField === 'educationSchool' && !formData.educationSchool?.trim()) return 'Please enter your cosmetology/beauty school.';
      if (currentField === 'schoolStatus' && !formData.schoolStatus) return 'Please select in school or graduated.';
      if (currentField === 'yearsExperience' && (formData.yearsExperience === undefined || formData.yearsExperience === null || formData.yearsExperience === '')) {
        return 'Please enter your years of experience.';
      }
      if (currentField === 'licenseNumber' && !formData.licenseNumber?.trim()) return 'Please enter your license number.';
      if (currentField === 'licenseState' && !formData.licenseState) return 'Please select your license state.';
    }

    if (currentStep === 2) {
      const workplaceFields = ['salonName', 'salonStreet', 'salonCity', 'salonState', 'salonZip'];
      const currentField = workplaceFields[currentFieldIndex];
      if (currentField === 'salonName' && !formData.salonName?.trim()) return 'Please enter your salon/studio name.';
      if (currentField === 'salonStreet' && !formData.salonStreet?.trim()) return 'Please enter your street address.';
      if (currentField === 'salonCity' && !formData.salonCity?.trim()) return 'Please enter your city.';
      if (currentField === 'salonState' && !formData.salonState) return 'Please select your state.';
      if (currentField === 'salonZip') {
        if (!formData.salonZip?.trim()) return 'Please enter your ZIP code.';
        if (!isValidZip(formData.salonZip)) return 'Please enter a valid 5-digit ZIP code.';
      }
    }

    if (currentStep === 3) {
      const questions = ['signatureService', 'serviceWantToTry', 'communityInterests'];
      const currentField = questions[currentFieldIndex];
      if (currentField === 'signatureService' && !formData.signatureService?.trim()) return 'Please enter your signature service.';
      if (currentField === 'serviceWantToTry' && !formData.serviceWantToTry?.trim()) return 'Please enter the new service you want to practice.';
      if (currentField === 'communityInterests' && (!formData.communityInterests || formData.communityInterests.length === 0)) {
        return 'Please select at least one community interest.';
      }
    }

    return null;
  };

  const handleNext = () => {
    const currentFieldError = getCurrentStepFieldError();
    if (currentFieldError) {
      alert(currentFieldError);
      return;
    }

    // Handle progressive fields within steps
    if (currentStep === 0) { // StepBasicInfo
      const basicInfoFields = ['firstName', 'lastName', 'email', 'phone', 'instagramHandle'];
      if (currentFieldIndex < basicInfoFields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
        return;
      }
    } else if (currentStep === 1) { // StepEducation
      const educationFields = ['educationSchool', 'schoolStatus', 'yearsExperience', 'licenseNumber', 'licenseState', 'education'];
      if (currentFieldIndex < educationFields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
        return;
      }
    } else if (currentStep === 2) { // StepWorkplace
      const workplaceFields = ['salonName', 'salonStreet', 'salonCity', 'salonState', 'salonZip'];
      if (currentFieldIndex < workplaceFields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
        return;
      }
    } else if (currentStep === 3) { // StepGetToKnowYou
      const questions = ['signatureService', 'serviceWantToTry', 'communityInterests'];
      if (currentFieldIndex < questions.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
        return;
      }
    }

    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentFieldIndex(0);
    }
  };

  const handleBack = () => {
    // Handle progressive fields within steps
    if (currentStep === 0 && currentFieldIndex > 0) { // StepBasicInfo
      setCurrentFieldIndex(currentFieldIndex - 1);
      return;
    } else if (currentStep === 1 && currentFieldIndex > 0) { // StepEducation
      setCurrentFieldIndex(currentFieldIndex - 1);
      return;
    } else if (currentStep === 2 && currentFieldIndex > 0) { // StepWorkplace
      setCurrentFieldIndex(currentFieldIndex - 1);
      return;
    } else if (currentStep === 3 && currentFieldIndex > 0) { // StepGetToKnowYou
      setCurrentFieldIndex(currentFieldIndex - 1);
      return;
    }

    // Move to previous step
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentFieldIndex(0);
    }
  };

  const handleSkipVerification = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Get userId from user object
      const userId = user?.userId || user?.username || user?.signInDetails?.loginId;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!formData.firstName || !formData.lastName) {
        alert('Please fill in all required fields (First Name, Last Name).');
        setIsSubmitting(false);
        return;
      }

      // Validate phone and email (now required)
      if (!formData.phone || !formData.email) {
        alert('Please provide both phone number and email address. Both are required.');
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.educationSchool || !formData.educationSchool.trim()) {
        alert('Please enter the school where you completed your cosmetology/beauty education.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.schoolStatus) {
        alert('Please select whether you are in school or graduated.');
        setIsSubmitting(false);
        return;
      }
      if (formData.yearsExperience === undefined || formData.yearsExperience === null || formData.yearsExperience === '') {
        alert('Please enter your years of experience.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.licenseNumber || !formData.licenseState) {
        alert('Please provide your license number and state.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.signatureService || formData.signatureService.trim().length === 0) {
        alert('Please answer "What\'s your signature service clients come back for?".');
        setIsSubmitting(false);
        return;
      }

      if (!formData.serviceWantToTry || formData.serviceWantToTry.trim().length === 0) {
        alert('Please answer "What\'s your new service you want to practice?".');
        setIsSubmitting(false);
        return;
      }

      if (!formData.communityInterests || formData.communityInterests.length === 0) {
        alert('Please select at least one community interest.');
        setIsSubmitting(false);
        return;
      }

      // Validate terms and conditions
      if (!formData.termsAccepted) {
        alert('Please accept the Terms & Conditions to continue.');
        setIsSubmitting(false);
        return;
      }

      const skipIdentityVerification = import.meta?.env?.VITE_SKIP_IDENTITY_VERIFICATION === 'true';
      const requireOnboardIdentity = import.meta?.env?.VITE_REQUIRE_ONBOARD_IDENTITY === 'true';

      if (requireOnboardIdentity &&
          !skipIdentityVerification &&
          (!formData.identityVerificationStatus ||
            (formData.identityVerificationStatus !== 'verified' &&
              formData.identityVerificationStatus !== 'manual_review'))) {
        alert('Please complete identity verification before submitting your profile.');
        setIsSubmitting(false);
        return;
      }

      const resolvedProfessionalIdentityStatus = skipIdentityVerification
        ? 'manual_review'
        : ['verified', 'manual_review', 'failed'].includes(formData.identityVerificationStatus)
          ? formData.identityVerificationStatus
          : 'manual_review';

      // Validate photos
      if (!formData.selfPhotoUrls || formData.selfPhotoUrls.length === 0) {
        alert('Please upload at least one photo of yourself for verification.');
        setIsSubmitting(false);
        return;
      }

      const portfolioItems = formData.portfolioItems || [];
      if (portfolioItems.length < 6) {
        alert('Please upload at least 6 portfolio photos of your work.');
        setIsSubmitting(false);
        return;
      }
      const unlabeled = portfolioItems.filter(p => !p.serviceLabel || !p.serviceLabel.trim());
      if (unlabeled.length > 0) {
        alert(`Please label each portfolio photo with the service (blowout, cut, color, etc.). ${unlabeled.length} photo(s) still need a label.`);
        setIsSubmitting(false);
        return;
      }

      // Validate salon name and address (structured fields)
      if (!formData.salonName || formData.salonName.trim().length === 0) {
        alert('Please enter your salon or studio name.');
        setIsSubmitting(false);
        return;
      }
      const hasStructuredAddress = formData.salonStreet?.trim() && formData.salonCity?.trim() &&
        formData.salonState?.trim() && formData.salonZip?.trim();
      if (!hasStructuredAddress || !isValidZip(formData.salonZip)) {
        alert('Please enter a complete work address (street, city, state, and valid 5-digit ZIP).');
        setIsSubmitting(false);
        return;
      }

      // Compose full address and geocode
      const salonAddress = [
        formData.salonStreet?.trim(),
        formData.salonCity?.trim(),
        formData.salonState?.trim(),
        formData.salonZip?.trim(),
      ].filter(Boolean).join(', ');

      let salonLat = formData.salonLat;
      let salonLng = formData.salonLng;
      if (salonLat == null || salonLng == null) {
        const coords = await geocodeAddress(salonAddress);
        if (!coords) {
          alert('We couldn\'t verify your salon address. Please check the address and try again.');
          setIsSubmitting(false);
          return;
        }
        salonLat = coords.lat;
        salonLng = coords.lng;
      }

      // Map formData to Professional schema
      const professionalData = {
        userId: userId,
        email: formData.email || user?.signInDetails?.loginId || '',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone, // Now required
        instagramHandle: formData.instagramHandle || null,
        
        // Professional info
        // Must match schema enum: student | apprentice | junior | senior
        experienceLevel: formData.schoolStatus === 'in_school'
          ? 'student'
          : (formData.yearsExperience >= 5 ? 'senior' : formData.yearsExperience >= 2 ? 'junior' : 'apprentice'),
        licenseNumber: formData.licenseNumber || null,
        yearsWorking: formData.yearsExperience ?? 0,
        yearsInSalon: formData.yearsExperience ?? 0,
        certifications: [],
        education: formData.education || null,
        educationSchool: formData.educationSchool || null,
        educationYearsCompleted: formData.schoolStatus || null,
        educationWorkshopsCourses: formData.education || null,
        inSalonTraining: null,
        inSalonTrainingDetails: formData.licenseState || null,
        specialties: formData.specialties || [],
        
        // Workplace (structured for approval verification)
        salonName: formData.salonName || null,
        salonLocationSuffix: null,
        salonStreet: formData.salonStreet || null,
        salonCity: formData.salonCity || null,
        salonState: formData.salonState || null,
        salonAddress,
        salonLat: salonLat ?? null,
        salonLng: salonLng ?? null,
        locationZip: formData.salonZip || null,
        partnerId: null, // Will be set if affiliated with partner
        
        // Portfolio & Photos (items with labels; derive specialties from labels)
        portfolioItems: formData.portfolioItems || [],
        portfolioUrls: (formData.portfolioItems || []).map(p => p.url).filter(Boolean),
        specialties: [...new Set((formData.portfolioItems || []).map(p => p.serviceLabel).filter(Boolean))],
        selfPhotoUrls: formData.selfPhotoUrls || [],
        
        // Get to Know You Questions
        somethingFun: null,
        whatYouCareAbout: null,
        signatureService: formData.signatureService || null,
        serviceWantToTry: formData.serviceWantToTry || null,
        workValues: formData.communityInterests || [],
        workValuesOther: formData.communityInterestsOtherText || null,
        
        // Terms & Conditions
        termsAccepted: formData.termsAccepted || false,
        termsAcceptedAt: formData.termsAccepted ? (formData.termsAcceptedAt ? new Date(formData.termsAcceptedAt).toISOString() : new Date().toISOString()) : null,
        
        // Identity Verification
        identityVerified: formData.identityVerified || false,
        identityVerificationStatus: resolvedProfessionalIdentityStatus,
        identityVerificationScore:
          resolvedProfessionalIdentityStatus === 'manual_review' && !formData.identityVerificationScore
            ? null
            : formData.identityVerificationScore || null,
        idDocumentUrl: formData.idDocumentUrl || null,
        idDocumentType: formData.idDocumentType || null,
        verificationSelfieUrl: formData.verificationSelfieUrl || null,
        
        // Status
        status: 'pending',
      };

      // Save to DynamoDB via AppSync
      const result = await client.models.Professional.create(professionalData);
      
      console.log('Professional profile saved successfully:', result);

      // Local mirror fallback so Admin can render newly submitted pros
      try {
        const savedPro = result?.data || result || {};
        const existingRaw = localStorage.getItem(LOCAL_PRO_SUBMISSIONS_KEY);
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        const nextRecord = { ...professionalData, ...savedPro, id: savedPro.id || professionalData.userId, _localMirror: true };
        const deduped = [
          nextRecord,
          ...existing.filter((p) => (p.id || p.userId || p.email) !== (nextRecord.id || nextRecord.userId || nextRecord.email)),
        ].slice(0, 200);
        localStorage.setItem(LOCAL_PRO_SUBMISSIONS_KEY, JSON.stringify(deduped));
      } catch (mirrorErr) {
        console.warn('Could not mirror professional submission locally:', mirrorErr);
      }

      alert('Application submitted! We\'ll review and get back to you soon.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting professional profile:', error);
      const errorMessage = error.errors?.[0]?.message || error.message || 'Something went wrong. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button 
          style={styles.backBtn} 
          onClick={() => currentStep > 0 ? handleBack() : navigate('/')}
        >
          ← Back
        </button>
        <div style={styles.logo}>MODELED</div>
        <div style={{ width: '80px' }}></div>
      </header>

      <div style={styles.formContainer}>
        <h2 style={styles.title}>Join as a Professional</h2>
        <p style={styles.subtitle}>Step {currentStep + 1} of {steps.length}</p>
        
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }}></div>
        </div>

        {CurrentStepComponent ? (
          <CurrentStepComponent 
            data={formData} 
            setData={setFormData}
            userId={user?.userId || user?.username || user?.signInDetails?.loginId}
            storageEntityId={storageEntityId}
            onFieldComplete={handleFieldNavigation}
            currentFieldIndex={currentFieldIndex}
            onSkip={handleSkipVerification}
          />
        ) : (
          <div style={{ color: '#f44336', textAlign: 'center', padding: '2rem' }}>
            Error: Invalid step. Please refresh the page.
          </div>
        )}

        <div style={styles.buttonRow}>
          {currentStep > 0 && (
            <button style={styles.secondaryBtn} onClick={handleBack}>
              Previous
            </button>
          )}
          
          {currentStep < steps.length - 1 ? (
            <button style={styles.primaryBtn} onClick={handleNext}>
              Continue
            </button>
          ) : (
            <button 
              style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.7 : 1 }} 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

