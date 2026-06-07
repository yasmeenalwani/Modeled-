import React, { useState } from 'react';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import PhotoUploader from '../../components/PhotoUploader';
import VideoUploader from '../../components/VideoUploader';
import StorageUsage from '../../components/StorageUsage';
import InspirationBoard from '../../components/InspirationBoard';
import { getProfilePhotoPath, getDocumentPath, getVideoReelPath } from '../../utils/storage';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
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
  
  // Profile header
  profileHeader: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '2rem',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  logoUpload: {
    width: '140px',
    height: '140px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  logoText: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  logoChange: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '0.5rem',
    background: 'rgba(74, 42, 26, 0.8)', // Dark brown overlay
    fontSize: '0.75rem',
    textAlign: 'center',
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileInfo: {},
  profileName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileLocation: {
    color: '#5A3A2A', // Muted brown
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileBadges: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  badge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  profileStats: {
    display: 'flex',
    gap: '2rem',
  },
  profileStat: {},
  profileStatValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileStatLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Section
  section: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Upload grids
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  uploadGridFull: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
  },
  
  // Form
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {},
  formGroupFull: {
    gridColumn: '1 / -1',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.9rem',
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Hours
  hoursGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  dayColumn: {
    textAlign: 'center',
  },
  dayLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayHours: {
    padding: '0.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    color: '#FFFEF9', // Ivory
    fontFamily: '"Alike", "Georgia", serif',
  },
  btnSecondary: {
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock data (would come from API)
const salonData = {
  id: 'salon-789',
  name: 'Luxe Studio',
  tagline: 'Where Beauty Meets Innovation',
  address: '123 5th Avenue, Suite 400',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  phone: '(212) 555-0123',
  email: 'hello@luxestudio.com',
  website: 'www.luxestudio.com',
  description: 'Premium hair salon specializing in color, cuts, and styling. Our team of expert stylists are dedicated to creating your perfect look.',
  founded: '2019',
  teamSize: 8,
  modelsServed: 156,
  rating: 4.9,
  logo: null, // URL if exists
  salonPhotos: [], // Array of salon interior/exterior photos
  hours: {
    Mon: '9AM - 7PM',
    Tue: '9AM - 7PM',
    Wed: '9AM - 8PM',
    Thu: '9AM - 8PM',
    Fri: '9AM - 7PM',
    Sat: '10AM - 6PM',
    Sun: 'Closed',
  },
};

export default function PartnerProfile() {
  const { user } = useAuthenticator();
  const [logo, setLogo] = useState(salonData.logo);
  const [salonPhotos, setSalonPhotos] = useState(salonData.salonPhotos);
  const [contactPhotos, setContactPhotos] = useState([]);
  const [profileVideo, setProfileVideo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  // Handle logo upload
  const handleLogoUpload = (results) => {
    if (results.length > 0) {
      setLogo(results[0].url);
      setShowLogoUpload(false);
      console.log('Logo uploaded:', results[0]);
    }
  };

  // Handle salon photos upload
  const handleSalonPhotosUpload = (results) => {
    const newPhotos = results.map(r => ({ url: r.url, key: r.key, type: r.type || 'interior' }));
    setSalonPhotos(prev => [...prev, ...newPhotos]);
    console.log('Salon photos uploaded:', results);
  };

  // Handle documents upload
  const handleDocumentsUpload = (results) => {
    const newDocs = results.map(r => ({ url: r.url, key: r.key }));
    setDocuments(prev => [...prev, ...newDocs]);
    console.log('Documents uploaded:', results);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Salon Profile 🏢</h1>
        <p style={styles.subtitle}>Manage your business identity</p>
      </div>

      {/* Profile Header */}
      <div style={styles.profileHeader}>
        <div 
          style={styles.logoUpload}
          onClick={() => setShowLogoUpload(!showLogoUpload)}
        >
          {logo ? (
            <img src={logo} alt="Logo" style={styles.logoImage} />
          ) : (
            <div style={styles.logoText}>
              {salonData.name.split(' ').map(w => w[0]).join('').substring(0, 2)}
            </div>
          )}
          <div style={styles.logoChange}>{logo ? 'Change' : 'Add'}</div>
        </div>
        
        <div style={styles.profileInfo}>
          <h2 style={styles.profileName}>{salonData.name}</h2>
          <div style={styles.profileLocation}>
            {salonData.address}, {salonData.city}, {salonData.state}
          </div>
          
          <div style={styles.profileBadges}>
            <span style={{ ...styles.badge, background: 'rgba(46,160,67,0.2)', color: '#3fb950' }}>
              Verified Partner
            </span>
            <span style={{ ...styles.badge, background: 'rgba(88,166,255,0.2)', color: '#58a6ff' }}>
              🌟 Top Rated
            </span>
            <span style={{ ...styles.badge, background: 'rgba(210,153,34,0.2)', color: '#d29922' }}>
              Since {salonData.founded}
            </span>
          </div>
          
          <div style={styles.profileStats}>
            <div style={styles.profileStat}>
              <div style={{ ...styles.profileStatValue, color: '#58a6ff' }}>{salonData.teamSize}</div>
              <div style={styles.profileStatLabel}>Team Members</div>
            </div>
            <div style={styles.profileStat}>
              <div style={{ ...styles.profileStatValue, color: '#3fb950' }}>{salonData.modelsServed}</div>
              <div style={styles.profileStatLabel}>Models Served</div>
            </div>
            <div style={styles.profileStat}>
              <div style={{ ...styles.profileStatValue, color: '#d29922' }}>{salonData.rating}</div>
              <div style={styles.profileStatLabel}>Avg Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Upload Modal */}
      {showLogoUpload && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            <span>🎨</span> Upload Logo
          </div>
          <PhotoUploader
            title="Business Logo"
            subtitle="Square image recommended"
            maxFiles={1}
            accentColor="#58a6ff"
            existingPhotos={logo ? [{ url: logo }] : []}
            pathGenerator={(filename) => getProfilePhotoPath('partner', salonData.id, `logo-${filename}`)}
            onUpload={handleLogoUpload}
            onDelete={() => setLogo(null)}
          />
        </div>
      )}

      {/* Salon Photos Section */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📸</span> Salon Photos
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Upload photos of your salon interior, exterior, and workspace. These will be visible to models considering your location.
        </p>
        <div style={styles.uploadGrid}>
          <PhotoUploader
            title="Interior Photos"
            subtitle="Workspace, stations, etc."
            maxFiles={20}
            accentColor="#58a6ff"
            existingPhotos={salonPhotos.filter(p => p.type === 'interior' || !p.type).slice(0, 10)}
            pathGenerator={(filename) => getProfilePhotoPath('partner', salonData.id, `interior-${filename}`)}
            onUpload={(results) => {
              const tagged = results.map(r => ({ ...r, type: 'interior' }));
              handleSalonPhotosUpload(tagged);
            }}
            onDelete={(photo) => setSalonPhotos(prev => prev.filter(p => p.url !== photo.url))}
            userType="partner"
            contentType="salonPhotos"
          />
          <PhotoUploader
            title="Contact Person Photos"
            subtitle="Photos of contact person"
            maxFiles={5}
            accentColor="#3fb950"
            existingPhotos={contactPhotos}
            pathGenerator={(filename) => getProfilePhotoPath('partner', salonData.id, `contact-${filename}`)}
            onUpload={(results) => {
              const newPhotos = results.map(r => ({ url: r.url, key: r.key }));
              setContactPhotos(prev => [...prev, ...newPhotos]);
            }}
            onDelete={(photo) => setContactPhotos(prev => prev.filter(p => p.url !== photo.url))}
            userType="partner"
            contentType="contactPhotos"
          />
        </div>
      </div>

      {/* Profile Video */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🎥</span> Profile Video
        </div>
        <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Upload a short video showcasing your salon atmosphere and team.
        </p>
        <VideoUploader
          title="Salon Video"
          subtitle="30-second intro video (optional)"
          existingVideo={profileVideo}
          pathGenerator={(filename) => getVideoReelPath(salonData.id, filename)}
          onUpload={(result) => setProfileVideo({ url: result.url, key: result.key, duration: result.duration })}
          onDelete={() => setProfileVideo(null)}
          userType="partner"
          contentType="profileVideos"
          maxVideos={3}
        />
      </div>

      {/* Inspiration Board */}
      {user?.userId && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>
            <span>✨</span> Inspiration Board
          </div>
          <InspirationBoard
            userType="partner"
            userId={user.userId || salonData.id}
          />
        </div>
      )}

      {/* Business Documents */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Business Documents
        </div>
        <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Upload business license, insurance certificates, and other required documents.
        </p>
        <PhotoUploader
          title="Upload Documents"
          subtitle="PDF, JPG, PNG supported"
          maxFiles={10}
          acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']}
          accentColor="#d29922"
          existingPhotos={documents}
          pathGenerator={(filename) => getDocumentPath('business', salonData.id, filename)}
          onUpload={handleDocumentsUpload}
          onDelete={(doc) => setDocuments(prev => prev.filter(d => d.url !== doc.url))}
        />
      </div>

      {/* Business Information */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📋</span> Business Information
        </div>
        <div style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Name</label>
            <input style={styles.input} type="text" defaultValue={salonData.name} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tagline</label>
            <input style={styles.input} type="text" defaultValue={salonData.tagline} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input style={styles.input} type="tel" defaultValue={salonData.phone} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" defaultValue={salonData.email} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Website</label>
            <input style={styles.input} type="url" defaultValue={salonData.website} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Year Founded</label>
            <input style={styles.input} type="text" defaultValue={salonData.founded} />
          </div>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} defaultValue={salonData.description} />
          </div>
        </div>
      </div>

      {/* Location */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>📍</span> Location
        </div>
        <div style={styles.formGrid}>
          <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
            <label style={styles.label}>Street Address</label>
            <input style={styles.input} type="text" defaultValue={salonData.address} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>City</label>
            <input style={styles.input} type="text" defaultValue={salonData.city} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>State</label>
            <input style={styles.input} type="text" defaultValue={salonData.state} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>ZIP Code</label>
            <input style={styles.input} type="text" defaultValue={salonData.zip} />
          </div>
        </div>
      </div>

      {/* Hours of Operation */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>🕐</span> Hours of Operation
        </div>
        <div style={styles.hoursGrid}>
          {Object.entries(salonData.hours).map(([day, hours]) => (
            <div key={day} style={styles.dayColumn}>
              <div style={styles.dayLabel}>{day}</div>
              <div style={{
                ...styles.dayHours,
                background: hours === 'Closed' ? 'rgba(248,81,73,0.1)' : 'rgba(46,160,67,0.1)',
                color: hours === 'Closed' ? '#f85149' : '#3fb950',
              }}>
                {hours}
              </div>
            </div>
          ))}
        </div>
        <button style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: 'transparent',
          border: '1px dashed rgba(88,166,255,0.3)',
          borderRadius: '6px',
          color: '#58a6ff',
          cursor: 'pointer',
          fontSize: '0.8rem',
        }}>
          + Add Blackout Dates
        </button>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button style={{ ...styles.btn, ...styles.btnSecondary }}>Cancel</button>
        <button style={{ ...styles.btn, ...styles.btnPrimary }}>Save Changes</button>
      </div>

      {/* Storage Usage - Small, at bottom */}
      {user?.userId && (
        <div style={{ marginTop: '2rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          <StorageUsage
            userType="partner"
            contentCounts={{
              salonPhotos: salonPhotos.length,
              contactPhotos: contactPhotos.length,
              profileVideos: profileVideo ? 1 : 0,
              inspirationPhotos: 0, // TODO: Load from database
              inspirationVideos: 0, // TODO: Load from database
            }}
          />
        </div>
      )}
    </div>
  );
}
