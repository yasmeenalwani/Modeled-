// ============================================
// 4TH CHAIR APPLICATION - Public Route
// Accessible via Instagram/TikTok link
// Requires model login to apply
// ============================================

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#0d0d14',
    color: '#fff',
  },
  hero: {
    textAlign: 'center',
    padding: '3rem 2rem',
    marginBottom: '3rem',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '16px',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
  heroTagline: {
    fontSize: '1.1rem',
    color: '#10b981',
    fontWeight: '600',
    marginTop: '1rem',
  },
  intro: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    lineHeight: '1.8',
  },
  introTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '1rem',
  },
  introText: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1rem',
  },
  applicationCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '1.5rem',
  },
  loginPrompt: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    marginBottom: '2rem',
  },
  loginTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '1rem',
  },
  loginText: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  loginButton: {
    padding: '0.75rem 2rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '0.5rem',
  },
  labelRequired: {
    color: '#10b981',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  charCounter: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '0.25rem',
    textAlign: 'right',
  },
  charCounterWarning: {
    color: '#ffc107',
  },
  fileUpload: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  fileInput: {
    display: 'none',
  },
  fileButton: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.2s ease',
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    marginTop: '0.1rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  button: {
    padding: '0.75rem 2rem',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
  },
  buttonSave: {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  buttonSubmit: {
    background: '#10b981',
    color: '#fff',
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

const MIN_WORDS = 250;

export default function FourthChairApplication() {
  const navigate = useNavigate();
  const { user, signOut } = useAuthenticator();
  const [formData, setFormData] = useState({
    name: '',
    pronouns: '',
    email: '',
    phone: '',
    story: '',
    whyThisMoment: '',
    location: '',
    serviceRequested: '',
    anythingElse: '',
    consentToShare: false,
  });
  const [photos, setPhotos] = useState([]);
  const [video, setVideo] = useState(null);
  const MAX_PHOTOS = 5;
  const MAX_VIDEO_DURATION = 180;
  const [wordCount, setWordCount] = useState(0);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Check if user is logged in and is a model
  const isModel = user && (user.groups?.includes('Model') || true); // TODO: Check actual model status

  React.useEffect(() => {
    const words = formData.story.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [formData.story]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      alert(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }
    const filesToAdd = files.slice(0, remainingSlots);
    setPhotos(prev => [...prev, ...filesToAdd]);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;
      if (duration > MAX_VIDEO_DURATION) {
        alert(`Video must be 3 minutes or less. Your video is ${Math.round(duration / 60)} minutes.`);
        e.target.value = '';
        return;
      }
      setVideo(file);
    };
    videoElement.src = URL.createObjectURL(file);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    const draft = {
      ...formData,
      photos: photos.map(p => p.name),
      video: video?.name,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('roleModel_4thChair_draft', JSON.stringify(draft));
    alert('Draft saved! You can come back anytime to continue.');
  };

  const handleSubmit = () => {
    if (wordCount < MIN_WORDS) {
      alert(`Your story needs at least ${MIN_WORDS} words. You have ${wordCount}.`);
      return;
    }
    if (photos.length === 0) {
      alert('Please upload at least one photo that aligns with your story.');
      return;
    }
    if (!video) {
      alert('Please upload a video (3 minutes max) sharing your story.');
      return;
    }
    if (!formData.consentToShare) {
      alert('Please confirm your consent to share your story if selected.');
      return;
    }

    // Submit application
    localStorage.removeItem('roleModel_4thChair_draft');
    alert('Your application has been submitted! You will be notified directly by Yasmeen if selected. Thank you for sharing your story. 💚');
  };

  const canSubmit = wordCount >= MIN_WORDS && photos.length > 0 && photos.length <= MAX_PHOTOS && video && formData.serviceRequested && formData.consentToShare;

  // Show login prompt if not a model
  if (!isModel) {
    return (
      <div style={styles.container}>
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>The 4th Chair is 4 You</h1>
          <p style={styles.heroSubtitle}>
            Because every seat counts—in business and in beauty.
          </p>
        </div>

        <div style={styles.loginPrompt}>
          <h2 style={styles.loginTitle}>Model Login Required</h2>
          <p style={styles.loginText}>
            The 4th Chair application is available to Modeled models only. Please sign in to your model account to apply.
          </p>
          <button
            style={styles.loginButton}
            onClick={() => navigate('/model-portal')}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            Sign In to Apply
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>The 4th Chair is 4 You</h1>
        <p style={styles.heroSubtitle}>
          Because every seat counts—in business and in beauty.
        </p>
        <p style={styles.heroTagline}>
          Share your story. Tell us why this moment matters. One seat opens monthly.
        </p>
      </div>

      {/* Intro Section */}
      <div style={styles.intro}>
        <h2 style={styles.introTitle}>The 4th Chair</h2>
        <p style={styles.introText}>
          Often, it takes four chairs to complete a table—and who is seated there shapes who feels seen, heard, and worthy of being included. The 4th Chair is Modeled's promise that there is always one seat saved with intention: for the person stepping into a new chapter, carrying a quiet burden, or needing proof that care can show up for them, too.
        </p>
        <p style={styles.introText}>
          Just as Modeled advocates for representation at the decision-making table, this initiative brings those same values into the salon. The professionals in Modeled's network are trained across hair types, textures, and identities, ensuring that whoever sits in the 4th Chair sees themselves reflected in the hands that serve them.
        </p>
        <p style={{ ...styles.introText, color: '#10b981', fontWeight: '500' }}>
          Because care should never be a luxury. And beauty belongs to everyone.
        </p>
      </div>

      {/* Application Form */}
      <div style={styles.applicationCard}>
        <h2 style={styles.cardTitle}>Apply for The 4th Chair</h2>

        {/* Basic Info */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Your Name <span style={styles.labelRequired}>*</span>
          </label>
          <input
            type="text"
            style={styles.input}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="First and last name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Pronouns <span style={styles.labelRequired}>*</span>
          </label>
          <input
            type="text"
            style={styles.input}
            value={formData.pronouns}
            onChange={(e) => handleInputChange('pronouns', e.target.value)}
            placeholder="she/her, he/him, they/them, etc."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email <span style={styles.labelRequired}>*</span>
          </label>
          <input
            type="email"
            style={styles.input}
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your.email@example.com"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Phone <span style={styles.labelRequired}>*</span>
          </label>
          <input
            type="tel"
            style={styles.input}
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        {/* Story */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Your Story <span style={styles.labelRequired}>*</span>
          </label>
          <textarea
            style={styles.textarea}
            value={formData.story}
            onChange={(e) => handleInputChange('story', e.target.value)}
            placeholder="Share your story in 250 words or more. Tell us about your journey, what you're going through, and why this moment matters to you."
          />
          <div style={{
            ...styles.charCounter,
            ...(wordCount < MIN_WORDS ? styles.charCounterWarning : {}),
          }}>
            {wordCount} words {wordCount < MIN_WORDS ? `(minimum ${MIN_WORDS} words)` : '✓'}
          </div>
        </div>

        {/* Why This Moment */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Why Does This Moment Matter? <span style={styles.labelRequired}>*</span>
          </label>
          <textarea
            style={{ ...styles.textarea, minHeight: '120px' }}
            value={formData.whyThisMoment}
            onChange={(e) => handleInputChange('whyThisMoment', e.target.value)}
            placeholder="Is this about healing, transition, celebration, survival, or something else?"
          />
        </div>

        {/* Photos */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Photos <span style={styles.labelRequired}>*</span>
          </label>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
            Upload up to {MAX_PHOTOS} photos that align with your story
          </div>
          <div style={styles.fileUpload}>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              multiple
              style={styles.fileInput}
              onChange={handlePhotoUpload}
            />
            <button
              type="button"
              style={styles.fileButton}
              onClick={() => photoInputRef.current?.click()}
              disabled={photos.length >= MAX_PHOTOS}
            >
              📷 Upload Photos ({photos.length}/{MAX_PHOTOS})
            </button>
          </div>
        </div>

        {/* Video */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Video <span style={styles.labelRequired}>*</span>
          </label>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
            Upload a video (3 minutes max) sharing your story
          </div>
          <div style={styles.fileUpload}>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              style={styles.fileInput}
              onChange={handleVideoUpload}
            />
            <button
              type="button"
              style={styles.fileButton}
              onClick={() => videoInputRef.current?.click()}
            >
              🎥 {video ? 'Change Video' : 'Upload Video (3 min max)'}
            </button>
          </div>
        </div>

        {/* Location */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Location <span style={styles.labelRequired}>*</span>
          </label>
          <input
            type="text"
            style={styles.input}
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="City, State"
          />
        </div>

        {/* Service Requested */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Service You'd Like to Receive <span style={styles.labelRequired}>*</span>
          </label>
          <select
            style={styles.input}
            value={formData.serviceRequested}
            onChange={(e) => handleInputChange('serviceRequested', e.target.value)}
          >
            <option value="">Select a service...</option>
            <option value="haircut">Haircut</option>
            <option value="color">Color</option>
            <option value="highlights">Highlights</option>
            <option value="blowdry">Blowdry</option>
            <option value="gloss">Gloss</option>
            <option value="keratin">Keratin</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Consent */}
        <div style={styles.checkboxGroup}>
          <input
            type="checkbox"
            style={styles.checkbox}
            checked={formData.consentToShare}
            onChange={(e) => handleInputChange('consentToShare', e.target.checked)}
          />
          <label style={styles.checkboxLabel}>
            I consent to sharing my story if selected. <span style={styles.labelRequired}>*</span>
          </label>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={styles.buttonSave}
            onClick={handleSaveDraft}
          >
            Save Draft
          </button>
          <button
            style={{
              ...styles.buttonSubmit,
              ...(!canSubmit ? styles.buttonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
}

