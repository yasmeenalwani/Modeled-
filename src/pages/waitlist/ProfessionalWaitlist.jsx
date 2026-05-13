import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { waitlistStyles as styles } from './waitlistStyles';

const client = generateClient();

const formatPhone = (value) => {
  const d = value.replace(/\D/g, '');
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6, 10)}`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const HEAR_OPTIONS = [
  { value: '', label: 'Select one' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google' },
  { value: 'friend', label: 'Friend' },
  { value: 'salon', label: 'Salon' },
  { value: 'school', label: 'School' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
];

export default function ProfessionalWaitlist() {
  const navigate = useNavigate();
  const { user } = useAuthenticator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zip: '',
    howDidYouHear: '',
    focusArea: '',
    termsAccepted: false,
  });

  useEffect(() => {
    const email = user?.signInDetails?.loginId || '';
    const given = user?.attributes?.given_name || '';
    const family = user?.attributes?.family_name || '';
    setFormData((prev) => ({
      ...prev,
      email: prev.email || email,
      firstName: prev.firstName || given,
      lastName: prev.lastName || family,
    }));
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const userId = user?.userId || user?.username || user?.signInDetails?.loginId;
      if (!userId) {
        alert('Please sign in to join the waitlist.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        alert('Please enter your first and last name.');
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
      if (!formData.howDidYouHear) {
        alert('Please tell us how you heard about Modeled.');
        setIsSubmitting(false);
        return;
      }
      if (!formData.termsAccepted) {
        alert('Please accept the terms to continue.');
        setIsSubmitting(false);
        return;
      }

      const { data: existing } = await client.models.Professional.list({
        filter: { userId: { eq: userId } },
        limit: 1,
      });

      const now = new Date().toISOString();
      const payload = {
        userId,
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        locationZip: formData.zip?.trim() || null,
        howDidYouHear: formData.howDidYouHear,
        somethingFun: formData.focusArea?.trim() || null,
        termsAccepted: true,
        termsAcceptedAt: now,
        status: 'pending',
        adminNotes: 'waitlist_signup',
      };

      if (existing?.[0]) {
        await client.models.Professional.update({
          id: existing[0].id,
          ...payload,
        });
      } else {
        await client.models.Professional.create(payload);
      }
      navigate('/thanks?role=professional');
    } catch (err) {
      console.error(err);
      alert(err?.message || err?.errors?.[0]?.message || 'Something went wrong. Please try again.');
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
        <div style={{ width: '72px' }} />
      </header>

      <div style={styles.formContainer}>
        <h1 style={styles.title}>Professional waitlist</h1>
        <p style={styles.subtitle}>
          Early access for beauty professionals. We&apos;ll reach out when the next wave opens.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>First name *</label>
            <input
              style={styles.input}
              value={formData.firstName}
              onChange={(ev) => setFormData({ ...formData, firstName: ev.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last name *</label>
            <input
              style={styles.input}
              value={formData.lastName}
              onChange={(ev) => setFormData({ ...formData, lastName: ev.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              style={styles.input}
              value={formData.email}
              onChange={(ev) => setFormData({ ...formData, email: ev.target.value })}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              style={styles.input}
              value={formData.phone}
              onChange={(ev) => setFormData({ ...formData, phone: formatPhone(ev.target.value) })}
              placeholder="(555) 555-5555"
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>ZIP code (work or home)</label>
            <input
              style={styles.input}
              value={formData.zip}
              onChange={(ev) => setFormData({ ...formData, zip: ev.target.value.replace(/\D/g, '').slice(0, 5) })}
              placeholder="Optional"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>How did you hear about us? *</label>
            <select
              style={styles.select}
              value={formData.howDidYouHear}
              onChange={(ev) => setFormData({ ...formData, howDidYouHear: ev.target.value })}
            >
              {HEAR_OPTIONS.map((o) => (
                <option key={o.value || 'empty'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>What services or skills are you most interested in?</label>
            <textarea
              style={styles.textarea}
              value={formData.focusArea}
              onChange={(ev) => setFormData({ ...formData, focusArea: ev.target.value })}
              placeholder="Optional — e.g. color, cuts, styling."
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
              onChange={(ev) => setFormData({ ...formData, termsAccepted: ev.target.checked })}
              style={{ width: '18px', height: '18px', marginTop: '0.2rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.9rem', color: '#5A3A2A' }}>
              I agree to the Terms & Conditions and Privacy Policy, and consent to be contacted about early access.
            </span>
          </label>

          <button type="submit" style={{ ...styles.primaryBtn, opacity: isSubmitting ? 0.75 : 1 }} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : 'Join the waitlist'}
          </button>
        </form>
      </div>
    </div>
  );
}
