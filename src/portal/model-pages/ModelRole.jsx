// ============================================
// MY ROLE - Model Portal Page
// The 4th Chair is 4 You
// ============================================

import React, { useState, useRef } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
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
  filePreview: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  previewItem: {
    position: 'relative',
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  removeButton: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#f44336',
    border: 'none',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  consentText: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    padding: '1rem',
    background: 'rgba(16,185,129,0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(16,185,129,0.1)',
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
  statusCard: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  statusTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  statusMessage: {
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
  },
  statusPending: {
    background: 'rgba(255,193,7,0.1)',
    borderColor: 'rgba(255,193,7,0.3)',
  },
  statusSelected: {
    background: 'rgba(16,185,129,0.15)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  statusNotSelected: {
    background: 'rgba(244,67,54,0.1)',
    borderColor: 'rgba(244,67,54,0.3)',
  },
};

const MIN_WORDS = 250;

export default function ModelRole() {
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
  const MAX_VIDEO_DURATION = 180; // 3 minutes in seconds
  const [applicationStatus, setApplicationStatus] = useState(null); // 'draft', 'submitted', 'pending', 'selected', 'not_selected'
  const [wordCount, setWordCount] = useState(0);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Check if user has already applied this period
  const hasAppliedThisPeriod = applicationStatus && applicationStatus !== 'draft';

  // Calculate word count
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
    if (files.length > remainingSlots) {
      alert(`You can only upload ${MAX_PHOTOS} photos total. Added ${filesToAdd.length} photo(s).`);
    }
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check video duration
    const videoElement = document.createElement('video');
    videoElement.preload = 'metadata';
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;
      if (duration > MAX_VIDEO_DURATION) {
        alert(`Video must be 3 minutes or less. Your video is ${Math.round(duration / 60)} minutes.`);
        e.target.value = ''; // Clear the input
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
    // Save to localStorage for now (would be backend in production)
    const draft = {
      ...formData,
      photos: photos.map(p => p.name),
      video: video?.name,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('roleModel_4thChair_draft', JSON.stringify(draft));
    setApplicationStatus('draft');
    alert('Draft saved! You can come back anytime to continue.');
  };

  const handleSubmit = () => {
    // Validate
    if (wordCount < MIN_WORDS) {
      alert(`Your story needs at least ${MIN_WORDS} words. You have ${wordCount}.`);
      return;
    }
    if (photos.length === 0) {
      alert('Please upload at least one photo that aligns with your story.');
      return;
    }
    if (photos.length > MAX_PHOTOS) {
      alert(`Please limit your photos to ${MAX_PHOTOS}.`);
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
    setApplicationStatus('submitted');
    localStorage.removeItem('roleModel_4thChair_draft');
    alert('Your application has been submitted! You will be notified directly by Yasmeen if selected. Thank you for sharing your story.');
  };

  const canSubmit = wordCount >= MIN_WORDS && photos.length > 0 && photos.length <= MAX_PHOTOS && video && formData.serviceRequested && formData.consentToShare;

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>My ROLE</h1>
        <p style={styles.heroSubtitle}>
          The 4th Chair is 4 You
        </p>
        <p style={styles.heroTagline}>
          Because every seat counts—in business and in beauty.
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

      {/* Application Status (if already applied) */}
      {hasAppliedThisPeriod && (
        <div style={{
          ...styles.statusCard,
          ...(applicationStatus === 'pending' ? styles.statusPending :
              applicationStatus === 'selected' ? styles.statusSelected :
              styles.statusNotSelected),
        }}>
          <div style={styles.statusTitle}>
            {applicationStatus === 'pending' && 'Application Under Review'}
            {applicationStatus === 'selected' && 'You\'ve Been Selected!'}
            {applicationStatus === 'not_selected' && 'Thank You for Applying'}
          </div>
          <div style={styles.statusMessage}>
            {applicationStatus === 'pending' && 'Your story has been received. Yasmeen will review applications monthly and notify you directly if selected.'}
            {applicationStatus === 'selected' && 'Congratulations! You\'ve been selected for The 4th Chair. Yasmeen will reach out to you directly to coordinate your service.'}
            {applicationStatus === 'not_selected' && 'Thank you for sharing your story. While you weren\'t selected this period, we encourage you to apply again in the future.'}
          </div>
        </div>
      )}

      {/* Wear Care Section */}
      <div style={styles.applicationCard}>
        <h2 style={styles.cardTitle}>Wear Care</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Wear your role model. 10% of every purchase funds mental health and self-care access. Round up at checkout to amplify your impact.
        </p>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}>
          <button
            style={{
              ...styles.buttonSubmit,
              flex: 'none',
              padding: '0.75rem 2rem',
            }}
            onClick={() => window.location.href = '/shop'}
            onMouseOver={(e) => e.target.style.background = '#059669'}
            onMouseOut={(e) => e.target.style.background = '#10b981'}
          >
            Shop Wear Care
          </button>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            Every purchase makes a difference
          </span>
        </div>
      </div>

      {/* Application Form */}
      {!hasAppliedThisPeriod && (
        <div style={styles.applicationCard}>
          <h2 style={styles.cardTitle}>Apply for The 4th Chair</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Share your story. Tell us why this moment matters. One seat opens monthly.
          </p>

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
              placeholder="Share your story in 250 words or more. Tell us about your journey, what you're going through, and why this moment matters to you. This is your space to be seen and heard."
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
              placeholder="Is this about healing, transition, celebration, survival, or something else? Help us understand why now."
            />
          </div>

          {/* Photos */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Photos <span style={styles.labelRequired}>*</span>
            </label>
            <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>
              Upload up to {MAX_PHOTOS} photos that align with your story (not necessarily of you)
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
                onMouseOver={(e) => e.target.style.background = 'rgba(16,185,129,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(16,185,129,0.1)'}
                disabled={photos.length >= MAX_PHOTOS}
              >
                Upload Photos ({photos.length}/{MAX_PHOTOS})
              </button>
              {photos.length > 0 && (
                <div style={styles.filePreview}>
                  {photos.map((photo, i) => (
                    <div key={i} style={styles.previewItem}>
                      📷
                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => removePhoto(i)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                onMouseOver={(e) => e.target.style.background = 'rgba(16,185,129,0.2)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(16,185,129,0.1)'}
              >
                🎥 {video ? 'Change Video' : 'Upload Video (3 min max)'}
              </button>
              {video && (
                <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>
                  ✓ {video.name}
                </div>
              )}
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
              placeholder="City, State (for stylist matching)"
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
              <option value="other">Other (specify in notes)</option>
            </select>
          </div>

          {/* Anything Else */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Anything Else We Should Know?
            </label>
            <textarea
              style={{ ...styles.textarea, minHeight: '100px' }}
              value={formData.anythingElse}
              onChange={(e) => handleInputChange('anythingElse', e.target.value)}
              placeholder="Optional: Any additional information that would help us understand your needs or story better."
            />
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
              I consent to sharing my story if selected. I understand that stories are meant to be celebrated and seen, and I'm comfortable with this. <span style={styles.labelRequired}>*</span>
            </label>
          </div>
          <div style={styles.consentText}>
            By checking this box, you're giving permission for your story to be shared (with your name or anonymously, as you prefer) if you're selected for The 4th Chair. This helps celebrate you and inspire others. You can always reach out to change your preferences.
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.buttonSave}
              onClick={handleSaveDraft}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
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
              onMouseOver={(e) => {
                if (canSubmit) e.target.style.background = '#059669';
              }}
              onMouseOut={(e) => {
                if (canSubmit) e.target.style.background = '#10b981';
              }}
            >
              Submit Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

