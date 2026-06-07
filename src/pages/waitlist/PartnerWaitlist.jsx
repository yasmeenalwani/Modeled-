import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { getAuthenticatorUserId } from '../../utils/authUtils';
import { waitlistStyles as styles } from './waitlistStyles';

const client = generateClient();

const formatPhone = (value) => {
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function PartnerWaitlist() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    city: '',
    state: '',
    zip: '',
    message: '',
    termsAccepted: false,
  });

  useEffect(() => {
    const email = user?.signInDetails?.loginId || '';
    if (email) {
      setFormData((prev) => ({ ...prev, email: prev.email || email }));
    }
  }, [user?.signInDetails?.loginId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userId = getAuthenticatorUserId(user);
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
      if (!formData.email?.trim() || !isValidEmail(formData.email)) {
        alert('Please enter a valid email.');
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

      const { data: existing } = await client.models.Partner.list({
        filter: { userId: { eq: userId } },
        limit: 1,
      });

      const now = new Date().toISOString();
      const partnerData = {
        userId,
        email: formData.email.trim(),
        businessName: formData.businessName.trim(),
        contactName: formData.contactName.trim(),
        phone: formData.phone.trim(),
        website: formData.website?.trim() || null,
        city: formData.city?.trim() || null,
        state: formData.state?.trim() || null,
        zip: formData.zip?.trim() || null,
        somethingFun: formData.message?.trim() || null,
        termsAccepted: true,
        termsAcceptedAt: now,
        status: 'pending',
        adminNotes: 'waitlist_signup',
        identityVerificationStatus: 'pending',
        selfPhotoUrls: [],
        salonPhotoUrls: [],
        communityInterests: [],
      };

      if (existing?.[0]) {
        await client.models.Partner.update({
          id: existing[0].id,
          ...partnerData,
        });
      } else {
        await client.models.Partner.create(partnerData);
      }
      navigate('/thanks?role=partner');
    } catch (error) {
      console.error('Partner waitlist submit:', error);
      alert(error?.message || error?.errors?.[0]?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button type="button" style={styles.backBtn} onClick={() => navigate('/join')}>
          ← Back
        </button>
        <div style={styles.logo}>MODELED</div>
        <div style={{ width: '60px' }} />
      </header>

      <div style={styles.formContainer}>
        <h1 style={styles.title}>Partner inquiry</h1>
        <p style={styles.subtitle}>
          Salons, schools, and studios: leave your details and we&apos;ll follow up manually while we&apos;re in early access.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Business name *</label>
            <input
              style={styles.input}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Contact name *</label>
            <input
              style={styles.input}
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
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
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              style={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input
              style={styles.input}
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>City</label>
              <input
                style={styles.input}
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>State</label>
              <input
                style={styles.input}
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>ZIP</label>
            <input
              style={styles.input}
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Anything we should know?</label>
            <textarea
              style={styles.textarea}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
              marginBottom: '1.25rem',
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
            style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.75 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit inquiry'}
          </button>
        </form>
      </div>
    </div>
  );
}
