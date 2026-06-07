import React, { useEffect, useState } from 'react';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import ProCardOverview from '../../components/profile/ProCardOverview';
import ProCardOnFileSection from '../../components/ProCardOnFileSection';
import DocumentsCertifications from '../../components/profile/DocumentsCertifications';
import PublicProfilePreview from '../../components/profile/PublicProfilePreview';
import { getProfessionalProfile, saveProfessionalProfile } from '../../utils/profileService';
import { geocodeAddress } from '../../utils/geocoding';
import { extractZipFromLocation } from '../../matching/matchingEngine';

// Mock data (would come from API)
const mockProfile = {
  id: 'pro-456',
  firstName: 'Sarah',
  lastName: 'Mitchell',
  email: 'sarah.m@email.com',
  phone: '(555) 123-4567',
  pronouns: 'she/her',
  city: 'New York',
  salonName: 'Luxe Studio',
  salonAddress: '123 Beauty Lane, NYC',
  salonWebsite: 'https://luxestudio.com',
  instagramHandle: '@sarahm_hair',
  tiktokHandle: '@sarahm.hair',
  articlesWritten: [
    { title: 'Soft Dimension: The 3-Step Gloss Method', outlet: 'Modeled-it Mag', date: 'Jan 2026' },
    { title: 'Healthy-Blonde Maintenance for Busy Schedules', outlet: 'Modeled-it Mag', date: 'Nov 2025' },
  ],
  bio: 'Color-obsessed, detail-driven, and all about lived-in luxury. I blend modern techniques with healthy-hair priorities for a signature finish. Known for soft dimension, seamless grow-outs, and a calm, confidence-building chair experience. Expect thoughtful consultations, clear maintenance plans, and a vibe that feels polished but never fussy.',
  signatureServices: ['Lived-in blonding', 'Soft balayage', 'Gloss + tone', 'Healthy hair rehab'],
  awardsPress: [
    'NAHA Finalist',
    'Modern Salon Top 30',
    'Behind The Chair feature',
    'Beauty Launchpad Talent Award',
  ],
  equipmentProducts: ['Olaplex', 'K18', 'Redken Shades EQ', 'Dyson Airwrap'],
  cosmoSchool: {
    name: 'Aveda Institute',
    location: 'New York, NY',
    program: 'Cosmetology',
    graduationYear: '2022',
  },
  workMode: 'salon_employee',
  usualWorkDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  usualWorkHours: { start: '09:00', end: '18:00' },
  profilePhoto: null,
  salonPhotos: [
    {
      url: null,
      label: 'Luxe Studio',
      location: 'SoHo, NYC',
      days: 'Mon–Thu',
      hours: '9:00 AM – 6:00 PM',
      specialties: ['Color', 'Blonding'],
    },
    {
      url: null,
      label: 'Private Studio',
      location: 'Brooklyn, NY',
      days: 'Fri–Sat',
      hours: '10:00 AM – 7:00 PM',
      specialties: ['Extensions', 'Glam'],
    },
  ],
  portfolioItems: [],
  documents: [],
  externalCertifications: [],
  hairSpecialties: ['Blonding', 'Lived-in Color'],
  lanes: ['Glam', 'Clean Girl'],
  training: ['Redken Color Lab', 'Wella Blonding Mastery', 'Olaplex Repair Intensive'],
  serviceComfort: {
    haircuts: 'love',
    color: 'love',
    blowouts: 'ok',
    extensions: 'prefer_less',
    styling: 'ok',
    treatments: 'ok',
  },
  notAvailableFor: ['Kids Cuts'],
  tier: 'junior',
  certifications: {
    blowouts: {
      status: 'certified',
      completed: 10,
      total: 10,
    },
    color: {
      status: 'certified',
      completed: 10,
      total: 10,
    },
    haircuts: {
      status: 'in_progress',
      completed: 7,
      total: 10,
    },
  },
  totalSessions: 42,
  rating: 4.9,
  memberSince: '2024-03-15',
  cardOnFileStatus: 'none',
  stripeCustomerId: null,
  thisMonthEarnings: 1250,
};

// Mock data for certification details (models and feedback)
const certificationDetails = {
  blowouts: {
    models: [
      {
        id: 'model-1',
        name: 'Emma Thompson',
        photo: null,
        date: 'Aug 15, 2024',
        feedback: 'Sarah did an amazing job! My hair looked so smooth and voluminous. She was professional and made me feel comfortable.',
        rating: 5,
      },
      {
        id: 'model-2',
        name: 'Sophia Martinez',
        photo: null,
        date: 'Aug 22, 2024',
        feedback: 'Perfect blowout! Exactly what I wanted. Would definitely book again.',
        rating: 5,
      },
    ],
  },
  color: {
    models: [
      {
        id: 'model-4',
        name: 'Isabella Rodriguez',
        photo: null,
        date: 'Oct 10, 2024',
        feedback: 'Beautiful balayage! Sarah really understood what I wanted and delivered perfectly.',
        rating: 5,
      },
    ],
  },
  haircuts: {
    models: [
      {
        id: 'model-6',
        name: 'Ava Williams',
        photo: null,
        date: 'Nov 2, 2024',
        feedback: 'Great cut! Still learning but shows real potential.',
        rating: 4,
      },
    ],
  },
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    background: '#FFFEF9',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  actions: {
    position: 'sticky',
    bottom: 0,
    background: '#FFFEF9',
    padding: '1.5rem 0',
    borderTop: '1px solid rgba(139, 30, 63, 0.15)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '2rem',
    zIndex: 100,
  },
  btn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  btnSecondary: {
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A',
  },
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
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sectionSubtext: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1rem',
  },
  galleryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  portfolioExtras: {
    marginTop: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
  },
  miniCard: {
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: 'rgba(139, 30, 63, 0.03)',
    padding: '1rem',
  },
  miniTitle: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  miniText: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.5,
  },
  socialLink: {
    color: '#8B1E3F',
    textDecoration: 'none',
    fontWeight: '600',
  },
  socialPreview: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.35rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  galleryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  galleryCard: {
    position: 'relative',
    aspectRatio: '4 / 3',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  flipFrontLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.7)',
    color: '#8B1E3F',
    fontSize: '0.9rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  locationText: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  galleryOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: '0.6rem 0.75rem',
    background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
    color: '#FFFEF9',
    fontSize: '0.75rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  flipCard: {
    perspective: '900px',
  },
  flipShell: {
    aspectRatio: '4 / 3',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  flipInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.4s ease',
  },
  flipInnerActive: {
    transform: 'rotateY(180deg)',
  },
  flipFace: {
    position: 'absolute',
    inset: 0,
    backfaceVisibility: 'hidden',
  },
  flipBack: {
    transform: 'rotateY(180deg)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    padding: '0.9rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    fontFamily: '"Alike", "Georgia", serif',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    fontSize: '0.8rem',
  },
  detailLabel: {
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8B1E3F',
  },
  detailValue: {
    color: '#4A2A1A',
  },
  focusGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '1.5rem',
  },
  focusColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  infoCard: {
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: 'rgba(139, 30, 63, 0.05)',
    padding: '1rem',
  },
  infoTitle: {
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  chip: {
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid rgba(139, 30, 63, 0.25)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  listRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  listRowWrap: {
    display: 'grid',
    gridTemplateColumns: '80px 1fr',
    gap: '0.75rem',
    alignItems: 'start',
  },
  listValueWrap: {
    textAlign: 'right',
    lineHeight: 1.4,
  },
  settingsBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: 'rgba(139, 30, 63, 0.05)',
    color: '#4A2A1A',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
  },
  modalContent: {
    background: '#FFFEF9',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    position: 'relative',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#5A3A2A',
    padding: '0.5rem',
    lineHeight: 1,
  },
  modelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  modelCard: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  modelAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#FFFEF9',
    marginBottom: '0.75rem',
    margin: '0 auto 0.75rem',
  },
  modelName: {
    fontWeight: '600',
    marginBottom: '0.5rem',
    textAlign: 'center',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
  },
  modelDate: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    textAlign: 'center',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modelRating: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.25rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  modelFeedback: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.5,
  },
};

export default function PortalProfile() {
  const { user } = useAuthenticator();
  const [formData, setFormData] = useState(mockProfile);
  const [showPreview, setShowPreview] = useState(false);
  const [showCardManager, setShowCardManager] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredSalonIndex, setHoveredSalonIndex] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfessionalProfile(user?.userId);
        if (profile) {
          setFormData(prev => ({
            ...prev,
            ...profile,
          }));
        }
      } catch (error) {
        console.error('Error loading professional profile:', error);
      }
    };

    loadProfile();
  }, [user]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let salonLat = formData.salonLat;
      let salonLng = formData.salonLng;
      let locationZip = formData.locationZip;

      if (formData.salonAddress && formData.salonAddress.trim().length > 0) {
        if (salonLat == null || salonLng == null) {
          const coords = await geocodeAddress(formData.salonAddress.trim());
          if (!coords) {
            alert("We couldn't verify your salon address. Please enter a full address (street, city, state, ZIP) and try again.");
            setIsSaving(false);
            return;
          }
          salonLat = coords.lat;
          salonLng = coords.lng;
        }
        locationZip = locationZip || extractZipFromLocation(formData.salonAddress) || null;
      }

      const payload = {
        ...formData,
        userId: user?.userId,
        email: formData.email || user?.signInDetails?.loginId || user?.username,
        salonLat: salonLat ?? null,
        salonLng: salonLng ?? null,
        locationZip: locationZip ?? null,
      };
      await saveProfessionalProfile(user?.userId, payload);
      alert('Pro Card saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving Pro Card. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentAdd = (doc) => {
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), doc],
    }));
  };

  const handleDocumentDelete = (doc) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d =>
        d.key !== doc.key && d.url !== doc.url
      ),
    }));
  };

  const handleExternalCertAdd = (cert) => {
    setFormData(prev => ({
      ...prev,
      externalCertifications: [...(prev.externalCertifications || []), cert],
    }));
  };

  const handleExternalCertDelete = (cert) => {
    setFormData(prev => ({
      ...prev,
      externalCertifications: prev.externalCertifications.filter(c =>
        c.brand !== cert.brand || c.name !== cert.name
      ),
    }));
  };

  const certificationsCount = Object.values(formData.certifications || {})
    .filter(c => c.status === 'certified').length;

  const salonPhotos = formData.salonPhotos || [];
  const portfolioTiles = (formData.portfolioItems || []).length > 0
    ? formData.portfolioItems
    : Array.from({ length: 6 }, (_, i) => ({ placeholder: true, label: `Portfolio ${i + 1}` }));
  const serviceLevelLabels = {
    love: 'Certified',
    ok: 'Training',
    prefer_less: 'Training',
  };
  const formatServiceLabel = (key) => (
    key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())
  );
  const formatDayLabel = (day) => (
    day.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase())
  );
  const formatTimeLabel = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = ((hours + 11) % 12) + 1;
    return `${formattedHour}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  };

  return (
    <div style={styles.container}>
      {/* Profile Overview Card */}
      <ProCardOverview
        profilePhoto={formData.profilePhoto}
        firstName={formData.firstName}
        lastName={formData.lastName}
        salonName={formData.salonName}
        city={formData.city}
        bio={formData.bio}
        tier={formData.tier}
        certificationsCount={certificationsCount}
        isTopRated={formData.rating >= 4.8}
        totalSessions={formData.totalSessions}
        rating={formData.rating}
        memberSince={formData.memberSince}
        onPreviewClick={() => setShowPreview(true)}
        onChangePhotoClick={() => {
          // Trigger photo upload - could open a modal or use PhotoUploader
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const previewUrl = URL.createObjectURL(file);
            handleFieldChange('profilePhoto', previewUrl);
          };
          input.click();
        }}
      />

      {/* Account basics — private details, hidden by default */}
      <div style={{
        background: '#FFFEF9',
        border: '1px solid rgba(139, 30, 63, 0.12)',
        borderRadius: '14px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
      }}>
        {/* Header row with toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showAccountDetails ? '1.25rem' : 0 }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8B1E3F', fontWeight: 700, fontFamily: '"Alike", "Georgia", serif' }}>
            Account Info
          </div>
          <button
            onClick={() => setShowAccountDetails(prev => !prev)}
            style={{ background: 'none', border: 'none', fontSize: '0.78rem', color: '#8B1E3F', cursor: 'pointer', fontFamily: '"Alike", "Georgia", serif', padding: 0, textDecoration: 'underline' }}
          >
            {showAccountDetails ? 'Hide' : 'Show'}
          </button>
        </div>

        {showAccountDetails && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem 2rem' }}>
            {/* Email */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5A3A2A', fontWeight: 600, marginBottom: '0.3rem', fontFamily: '"Alike", "Georgia", serif' }}>Email</div>
              <div style={{ fontSize: '0.9rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{formData.email || '—'}</div>
            </div>

            {/* Phone */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5A3A2A', fontWeight: 600, marginBottom: '0.3rem', fontFamily: '"Alike", "Georgia", serif' }}>Phone</div>
              <div style={{ fontSize: '0.9rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>{formData.phone || '—'}</div>
            </div>

            {/* Billing */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5A3A2A', fontWeight: 600, marginBottom: '0.3rem', fontFamily: '"Alike", "Georgia", serif' }}>Billing</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, display: 'inline-block',
                  background: formData.cardOnFileStatus === 'valid' ? '#27ae60' : formData.cardOnFileStatus === 'expired' || formData.cardOnFileStatus === 'declined' ? '#e67e22' : '#bbb'
                }} />
                <span style={{ fontSize: '0.9rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                  {formData.cardOnFileStatus === 'valid' ? 'Card on file' : formData.cardOnFileStatus === 'expired' || formData.cardOnFileStatus === 'declined' ? 'Update required' : 'No card on file'}
                </span>
                <button
                  onClick={() => setShowCardManager(prev => !prev)}
                  style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: '#8B1E3F', cursor: 'pointer', textDecoration: 'underline', fontFamily: '"Alike", "Georgia", serif', padding: 0 }}
                >
                  {formData.cardOnFileStatus === 'valid' ? 'Manage' : 'Add'}
                </button>
              </div>
              {showCardManager && (
                <div style={{ marginTop: '0.75rem' }}>
                  <ProCardOnFileSection
                    professional={formData}
                    onUpdate={(updates) => { setFormData(prev => ({ ...prev, ...updates })); setShowCardManager(false); }}
                    accentColor="#8B1E3F"
                  />
                </div>
              )}
            </div>

            {/* This month */}
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5A3A2A', fontWeight: 600, marginBottom: '0.3rem', fontFamily: '"Alike", "Georgia", serif' }}>This Month</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#27ae60', fontFamily: '"Alike", "Georgia", serif' }}>
                ${(formData.thisMonthEarnings || 0).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Salon / Work Photos */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Work Locations</span>
          <button type="button" style={styles.settingsBtn}>
            + Add location
          </button>
        </div>
        <div style={styles.galleryGrid}>
          {(salonPhotos.length > 0 ? salonPhotos : Array.from({ length: 2 })).map((photo, index) => (
            <div key={photo?.url || index} style={styles.galleryItem}>
              <div
                style={{ ...styles.flipShell, ...styles.flipCard }}
                onMouseEnter={() => setHoveredSalonIndex(index)}
                onMouseLeave={() => setHoveredSalonIndex(null)}
              >
                <div style={{
                  ...styles.flipInner,
                  ...(hoveredSalonIndex === index ? styles.flipInnerActive : {}),
                }}>
                  <div style={{ ...styles.flipFace, ...styles.galleryCard }}>
                    {photo?.url ? (
                      <img src={photo.url} alt="Salon" style={styles.galleryImage} />
                    ) : (
                      'Add photo'
                    )}
                    <div style={styles.flipFrontLabel}>
                      {photo?.label || `Setup ${index + 1}`}
                    </div>
                  </div>
                  <div style={{ ...styles.flipFace, ...styles.flipBack }}>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Days</div>
                      <div style={styles.detailValue}>{photo?.days || 'Add days'}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Hours</div>
                      <div style={styles.detailValue}>{photo?.hours || 'Add hours'}</div>
                    </div>
                    <div style={styles.detailRow}>
                      <div style={styles.detailLabel}>Specialties</div>
                      <div style={styles.detailValue}>
                        {(photo?.specialties || []).length > 0 ? photo.specialties.join(', ') : 'Add specialties'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={styles.locationText}>
                {photo?.location || 'Add location'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio + Specialties + Training + Services + Preferences */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Professional Focus</span>
        </div>
        <div style={styles.focusGrid}>
          <div style={styles.focusColumn}>
            <div style={styles.galleryGrid}>
              {portfolioTiles.map((item, index) => (
                <div key={item.key || item.url || index} style={styles.galleryCard}>
                  {item.url ? (
                    <img src={item.url} alt="Portfolio" style={styles.galleryImage} />
                  ) : (
                    item.label || `Portfolio ${index + 1}`
                  )}
                  <div style={styles.galleryOverlay}>
                    {item.tags && item.tags.length > 0 ? item.tags.join(' • ') : 'Portfolio'}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.portfolioExtras}>
              <div style={styles.miniCard}>
                <div style={styles.miniTitle}>Goals</div>
                <div style={styles.miniText}>
                  Build a signature color portfolio, grow rebook rate, and hit Platinum tier this season.
                </div>
              </div>
              <div style={styles.miniCard}>
                <div style={styles.miniTitle}>Client Fit</div>
                <div style={styles.listRow}>
                  <span>Best for</span>
                  <span>Lived-in color</span>
                </div>
                <div style={styles.listRow}>
                  <span>Ideal length</span>
                  <span>Medium to long</span>
                </div>
                <div style={{ ...styles.listRow, borderBottom: 'none' }}>
                  <span>Typical time</span>
                  <span>2–3 hours</span>
                </div>
              </div>
              <div style={styles.miniCard}>
                <div style={styles.miniTitle}>Socials</div>
                <div style={styles.socialRow}>
                  <span>Instagram</span>
                  <span>
                    <a
                      style={styles.socialLink}
                      href={formData.instagramHandle ? `https://instagram.com/${formData.instagramHandle.replace('@', '')}` : '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formData.instagramHandle || '@addhandle'}
                    </a>
                    <div style={styles.socialPreview}>instagram.com/{formData.instagramHandle?.replace('@', '') || 'addhandle'}</div>
                  </span>
                </div>
                <div style={styles.socialRow}>
                  <span>TikTok</span>
                  <span>
                    <a
                      style={styles.socialLink}
                      href={formData.tiktokHandle ? `https://tiktok.com/@${formData.tiktokHandle.replace('@', '')}` : '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formData.tiktokHandle || '@addhandle'}
                    </a>
                    <div style={styles.socialPreview}>tiktok.com/@{formData.tiktokHandle?.replace('@', '') || 'addhandle'}</div>
                  </span>
                </div>
                <div style={{ ...styles.socialRow, borderBottom: 'none' }}>
                  <span>Website</span>
                  <span>
                    <a
                      style={styles.socialLink}
                      href={formData.salonWebsite || '#'}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {formData.salonWebsite || 'Add link'}
                    </a>
                    <div style={styles.socialPreview}>
                      {formData.salonWebsite ? formData.salonWebsite.replace(/^https?:\/\//, '') : 'addlink.com'}
                    </div>
                  </span>
                </div>
              </div>
              <div style={styles.miniCard}>
                <div style={styles.miniTitle}>Articles</div>
                {(formData.articlesWritten || []).length > 0 ? (
                  formData.articlesWritten.map((article) => (
                    <div key={`${article.title}-${article.date}`} style={styles.listRow}>
                      <span>{article.title}</span>
                      <span>{article.outlet} • {article.date}</span>
                    </div>
                  ))
                ) : (
                  <div style={styles.listRow}>
                    <span>Add articles for Modeled-it Mag</span>
                    <span>—</span>
                  </div>
                )}
              </div>
              <div style={styles.miniCard}>
                <div style={styles.miniTitle}>Notes</div>
                <div style={styles.miniText}>
                  Prefers morning sessions, natural light photos, and soft glam styling on shoot days.
                </div>
              </div>
            </div>
          </div>
          <div style={styles.focusColumn}>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Signature Services</div>
              {(formData.signatureServices || []).length > 0 ? (
                formData.signatureServices.map((service) => (
                  <div key={service} style={styles.listRow}>
                    <span>{service}</span>
                    <span>Featured</span>
                  </div>
                ))
              ) : (
                <div style={styles.listRow}>
                  <span>Add signature services</span>
                  <span>—</span>
                </div>
              )}
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Awards & Press</div>
              <div style={styles.chipRow}>
                {(formData.awardsPress || []).length > 0 ? (
                  formData.awardsPress.map((item) => (
                    <span key={item} style={styles.chip}>{item}</span>
                  ))
                ) : (
                  <span style={styles.chip}>Add awards</span>
                )}
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Equipment & Products</div>
              <div style={styles.chipRow}>
                {(formData.equipmentProducts || []).length > 0 ? (
                  formData.equipmentProducts.map((item) => (
                    <span key={item} style={styles.chip}>{item}</span>
                  ))
                ) : (
                  <span style={styles.chip}>Add products</span>
                )}
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Specialties</div>
              <div style={styles.chipRow}>
                {(formData.hairSpecialties || []).map((item) => (
                  <span key={item} style={styles.chip}>{item}</span>
                ))}
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Lanes</div>
              <div style={styles.chipRow}>
                {(formData.lanes || []).map((item) => (
                  <span key={item} style={styles.chip}>{item}</span>
                ))}
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Training</div>
              <div style={styles.chipRow}>
                {(formData.training || []).map((item) => (
                  <span key={item} style={styles.chip}>{item}</span>
                ))}
              </div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Services</div>
              {Object.entries(formData.serviceComfort || {}).map(([service, level]) => (
                <div key={service} style={styles.listRow}>
                  <span>{formatServiceLabel(service)}</span>
                  <span>{serviceLevelLabels[level] || level}</span>
                </div>
              ))}
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoTitle}>Availability</div>
              <div style={{ ...styles.listRow, ...styles.listRowWrap }}>
                <span>Days</span>
                <span style={styles.listValueWrap}>
                  {(formData.usualWorkDays || []).length > 0
                    ? formData.usualWorkDays.map(formatDayLabel).join(', ')
                    : 'Add days'}
                </span>
              </div>
              <div style={{ ...styles.listRow, ...styles.listRowWrap }}>
                <span>Hours</span>
                <span style={styles.listValueWrap}>
                  {formData.usualWorkHours?.start && formData.usualWorkHours?.end
                    ? `${formatTimeLabel(formData.usualWorkHours.start)} – ${formatTimeLabel(formData.usualWorkHours.end)}`
                    : 'Add hours'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Education</span>
          <button type="button" style={styles.settingsBtn}>
            + Add education
          </button>
        </div>
        <div style={styles.sectionSubtext}>
          Add cosmetology school details and credentials.
        </div>
        <div style={styles.infoCard}>
          <div style={styles.infoTitle}>{formData.cosmoSchool?.program || 'Cosmetology'}</div>
          <div style={styles.listRow}>
            <span>School</span>
            <span>{formData.cosmoSchool?.name || 'Add school'}</span>
          </div>
          <div style={styles.listRow}>
            <span>Location</span>
            <span>{formData.cosmoSchool?.location || 'Add location'}</span>
          </div>
          <div style={{ ...styles.listRow, borderBottom: 'none' }}>
            <span>Graduation</span>
            <span>{formData.cosmoSchool?.graduationYear || 'Add year'}</span>
          </div>
        </div>
      </div>

      {/* Documents & Certifications */}
      <DocumentsCertifications
        documents={formData.documents || []}
        certifications={formData.certifications || {}}
        externalCertifications={formData.externalCertifications || []}
        onDocumentAdd={handleDocumentAdd}
        onDocumentDelete={handleDocumentDelete}
        onExternalCertAdd={handleExternalCertAdd}
        onExternalCertDelete={handleExternalCertDelete}
        userId={user?.userId || formData.id}
      />

      {/* Save Actions */}
      <div style={styles.actions}>
        <button
          style={{ ...styles.btn, ...styles.btnSecondary }}
          onClick={() => window.location.reload()}
        >
          Cancel
        </button>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Public Profile Preview Modal */}
      {showPreview && (
        <PublicProfilePreview
          profileData={formData}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Certification Details Modal */}
      {selectedCert && (
        <div
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCert(null);
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {selectedCert.charAt(0).toUpperCase() + selectedCert.slice(1)} - Models & Feedback
              </div>
              <button
                style={styles.modalClose}
                onClick={() => setSelectedCert(null)}
              >
                ×
              </button>
            </div>

            {certificationDetails[selectedCert] && certificationDetails[selectedCert].models.length > 0 ? (
              <div style={styles.modelGrid}>
                {certificationDetails[selectedCert].models.map((model) => (
                  <div key={model.id} style={styles.modelCard}>
                    <div style={styles.modelAvatar}>
                      {model.photo ? (
                        <img src={model.photo} alt={model.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        model.name.charAt(0)
                      )}
                    </div>
                    <div style={styles.modelName}>{model.name}</div>
                    <div style={styles.modelDate}>{model.date}</div>
                    <div style={styles.modelRating}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < model.rating ? '#ffc107' : '#ddd' }}>★</span>
                      ))}
                    </div>
                    <div style={styles.modelFeedback}>"{model.feedback}"</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                No models yet for this certification
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
