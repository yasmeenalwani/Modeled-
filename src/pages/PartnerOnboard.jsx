import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Auto-format phone number
const formatPhoneNumber = (value) => {
  const phoneNumber = value.replace(/[^\d]/g, '');
  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
    maxWidth: '600px',
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
    maxWidth: '560px',
    margin: '0 auto',
    background: '#FFFEF9',
    borderRadius: '20px',
    padding: '2rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  title: {
    fontSize: '1.75rem',
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
  formGroup: { marginBottom: '1.25rem' },
  label: {
    display: 'block',
    marginBottom: '0.4rem',
    fontSize: '0.95rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '0.9rem 1.1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: '"Alike", "Georgia", serif',
  },
  select: {
    width: '100%',
    padding: '0.9rem 1.1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  textarea: {
    width: '100%',
    padding: '0.9rem 1.1rem',
    fontSize: '1rem',
    borderRadius: '12px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    backgroundColor: '#FFFEF9',
    color: '#4A2A1A',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: '"Alike", "Georgia", serif',
  },
  primaryBtn: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    cursor: 'pointer',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.5rem',
  },
};

export default function PartnerOnboard() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: user?.signInDetails?.loginId || '',
    phone: '',
    website: '',
    city: '',
    state: '',
    zip: '',
    message: '',
    termsAccepted: false,
  });

  useEffect(() => {
    const email = user?.signInDetails?.loginId;
    if (email) {
      setFormData((prev) => (prev.email ? prev : { ...prev, email }));
    }
  }, [user?.signInDetails?.loginId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const userId = user?.userId || user?.username || user?.signInDetails?.loginId;
      if (!userId) {
        alert('Please sign in to submit your inquiry.');
        setIsSubmitting(false);
        return;
      }

      if (!formData.businessName?.trim()) {
        alert('Please enter your business name.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.contactName?.trim()) {
        alert('Please enter your contact name.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.email?.trim()) {
        alert('Please enter your email.');
        setIsSubmitting(false);
        return;
      }
      if (!isValidEmail(formData.email)) {
        alert('Please enter a valid email address.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.phone?.trim() || formData.phone.replace(/\D/g, '').length < 10) {
        alert('Please enter a valid phone number.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.termsAccepted) {
        alert('Please accept the terms to continue.');
        setIsSubmitting(false);
        return;
      }

      const partnerData = {
        userId,
        email: formData.email.trim(),
        businessName: formData.businessName.trim(),
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        website: formData.website?.trim() || null,
        address: null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip: formData.zip?.trim() || null,
        businessType: null,
        instagramHandle: null,
        yearsInBusiness: null,
        numberOfLocations: null,
        numberOfProfessionals: null,
        servicesList: null,
        selfPhotoUrls: [],
        salonPhotoUrls: [],
        somethingFun: formData.message?.trim() || null,
        whatYouCareAbout: null,
        businessGrowthGoals: null,
        communityInterests: [],
        communityInterestsOther: null,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        status: 'pending',
        identityVerificationStatus: 'pending',
      };

      await client.models.Partner.create(partnerData);
      alert("Thanks for your interest! We'll be in touch soon.");
      navigate('/');
    } catch (error) {
      console.error('Error submitting partner inquiry:', error);
      alert(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Back
        </button>
        <div style={styles.logo}>MODELED</div>
        <div style={{ width: '60px' }} />
      </header>

      <div style={styles.formContainer}>
        <h1 style={styles.title}>Partner with Modeled</h1>
        <p style={styles.subtitle}>
          Interested in partnering with Modeled? Share your info and we&apos;ll reach out.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Name *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              placeholder="e.g. Luxe Studio"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contact Name *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              placeholder="Your name"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              style={styles.input}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@business.com"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              type="tel"
              style={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input
              type="text"
              style={styles.input}
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="www.yoursalon.com (optional)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                type="text"
                style={styles.input}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State</label>
              <input
                type="text"
                style={styles.input}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="State"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>ZIP</label>
              <input
                type="text"
                style={styles.input}
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="ZIP"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tell us about your business</label>
            <textarea
              style={styles.textarea}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Why are you interested in partnering with Modeled? What does your salon or studio do?"
            />
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              padding: '1rem',
              background: 'rgba(139, 30, 63, 0.04)',
              border: `2px solid ${formData.termsAccepted ? '#4caf50' : 'rgba(139, 30, 63, 0.2)'}`,
              borderRadius: '12px',
              cursor: 'pointer',
              marginBottom: '1.5rem',
            }}
          >
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
              style={{ width: '18px', height: '18px', marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#5A3A2A' }}>
              I agree to the Partner Terms & Conditions and consent to being contacted about this inquiry.
            </span>
          </label>

          <button
            type="submit"
            style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.7 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
