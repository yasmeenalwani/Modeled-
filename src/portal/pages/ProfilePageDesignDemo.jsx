/**
 * PROFILE PAGE DESIGN DEMO - Magazine Editorial Style
 * 
 * Clean, professional, portfolio-focused profile page
 * Like a high-end salon professional card - editorial magazine aesthetic
 */

import React, { useState } from 'react';

// Mock professional data
const mockProfile = {
  firstName: 'Sarah',
  lastName: 'Mitchell',
  salonName: 'Luxe Studio',
  salonAddress: '123 Beauty Lane, New York, NY 10001',
  city: 'New York',
  phone: '(555) 123-4567',
  instagramHandle: '@sarahm_hair',
  profilePhoto: null,
  bio: 'Passionate colorist specializing in balayage and lived-in color. Building expertise through Modeled Management.',
  tier: 'developing',
  totalSessions: 42,
  rating: 4.9,
  memberSince: '2024-03-15',
  thisMonthEarnings: 1250,
  certifications: {
    blowouts: { status: 'certified', completed: 10, total: 10, completedAt: '2024-05-15' },
    color: { status: 'certified', completed: 10, total: 10, completedAt: '2024-07-20' },
    haircuts: { status: 'in_progress', completed: 7, total: 10 },
  },
  specialties: ['Blonding', 'Lived-in Color', 'Balayage', 'Color Correction'],
  lanes: ['Glam', 'Clean Girl'],
  serviceComfort: {
    haircuts: 'love',
    color: 'love',
    blowouts: 'ok',
  },
  trainingHours: 85,
  reliabilityScore: 95,
};

export default function ProfilePageDesignDemo() {
  const [selectedSection, setSelectedSection] = useState('overview');

  const styles = {
    container: {
      padding: '0',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#FFFEF9',
      minHeight: '100vh',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Magazine-style header
    header: {
      background: 'linear-gradient(to bottom, #FFFEF9 0%, rgba(255,254,249,0.95) 100%)',
      borderBottom: '2px solid rgba(139, 30, 63, 0.15)',
      padding: '2rem',
      position: 'relative',
    },
    headerAccent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #8B1E3F, #A85A5A, #8B1E3F)',
    },
    headerContent: {
      display: 'grid',
      gridTemplateColumns: '200px 1fr auto',
      gap: '3rem',
      alignItems: 'start',
    },
    profileImage: {
      width: '200px',
      height: '200px',
      borderRadius: '0',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.05))',
      border: '2px solid rgba(139, 30, 63, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '4rem',
      fontWeight: '300',
      color: '#8B1E3F',
      letterSpacing: '0.05em',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(139, 30, 63, 0.1)',
    },
    headerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    name: {
      fontSize: '3rem',
      fontWeight: '300',
      letterSpacing: '0.02em',
      color: '#1a1a1a',
      marginBottom: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
      position: 'relative',
    },
    nameAccent: {
      position: 'absolute',
      bottom: '-2px',
      left: 0,
      width: '60px',
      height: '2px',
      background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    },
    location: {
      fontSize: '0.95rem',
      color: '#8B1E3F',
      fontWeight: '500',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    bio: {
      fontSize: '0.95rem',
      color: '#333',
      lineHeight: 1.7,
      maxWidth: '600px',
      fontWeight: '300',
      fontFamily: '"Alike", "Georgia", serif',
    },
    headerMeta: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      textAlign: 'right',
      fontSize: '0.85rem',
      color: '#666',
      fontFamily: '"Alike", "Georgia", serif',
    },
    metaLine: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
    },
    metaLabel: {
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#999',
      fontWeight: '400',
    },
    metaValue: {
      fontSize: '1rem',
      color: '#8B1E3F',
      fontWeight: '500',
    },
    
    // Navigation tabs
    nav: {
      display: 'flex',
      borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
      background: '#FFFEF9',
      padding: '0 2rem',
    },
    navItem: {
      padding: '1.25rem 2rem',
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#666',
      cursor: 'pointer',
      borderBottom: '2px solid transparent',
      marginBottom: '-1px',
      fontWeight: '400',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s ease',
    },
    navItemActive: {
      color: '#8B1E3F',
      borderBottomColor: '#8B1E3F',
      fontWeight: '500',
      background: 'rgba(139, 30, 63, 0.03)',
    },
    
    // Content sections
    content: {
      padding: '3rem 2rem',
    },
    
    // Portfolio grid
    portfolioGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '1rem',
      marginBottom: '3rem',
    },
    portfolioItem: {
      aspectRatio: '3/4',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#8B1E3F',
      opacity: 0.6,
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    },
    
    // Services section
    servicesSection: {
      marginBottom: '3rem',
    },
    sectionTitle: {
      fontSize: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: '#8B1E3F',
      marginBottom: '2rem',
      fontWeight: '500',
      fontFamily: '"Alike", "Georgia", serif',
      position: 'relative',
      paddingBottom: '0.5rem',
    },
    sectionTitleUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '40px',
      height: '2px',
      background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    },
    servicesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '2rem',
    },
    serviceRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      borderRadius: '4px',
      background: 'rgba(139, 30, 63, 0.03)',
      borderLeft: '3px solid rgba(139, 30, 63, 0.2)',
      fontSize: '0.95rem',
      color: '#1a1a1a',
      fontFamily: '"Alike", "Georgia", serif',
      transition: 'all 0.2s ease',
    },
    serviceName: {
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: '#8B1E3F',
    },
    serviceStatus: {
      fontSize: '0.85rem',
      color: '#A85A5A',
      fontStyle: 'italic',
      fontWeight: '400',
    },
    
    // Training section
    trainingSection: {
      marginBottom: '3rem',
    },
    certGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    certCard: {
      border: '2px solid rgba(139, 30, 63, 0.15)',
      background: 'rgba(255, 255, 255, 0.8)',
      padding: '2rem',
      textAlign: 'center',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
    },
    certCardCertified: {
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
      borderColor: 'rgba(139, 30, 63, 0.3)',
    },
    certName: {
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#8B1E3F',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
      fontWeight: '500',
    },
    certStatus: {
      fontSize: '1.5rem',
      fontWeight: '300',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    certProgress: {
      fontSize: '0.8rem',
      color: '#A85A5A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Stats grid
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '2rem',
      marginBottom: '3rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.05), rgba(168, 90, 90, 0.02))',
      borderTop: '1px solid rgba(139, 30, 63, 0.15)',
      borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
      borderRadius: '8px',
    },
    statItem: {
      textAlign: 'center',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.5)',
      borderRadius: '4px',
    },
    statValue: {
      fontSize: '2.5rem',
      fontWeight: '300',
      color: '#8B1E3F',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
      letterSpacing: '0.02em',
    },
    statLabel: {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.15em',
      color: '#A85A5A',
      fontFamily: '"Alike", "Georgia", serif',
      fontWeight: '500',
    },
    
    // Preferences section
    preferencesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '3rem',
    },
    prefSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    prefItem: {
      display: 'flex',
      justifyContent: 'space-between',
      paddingBottom: '1rem',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
    },
    prefLabel: {
      fontSize: '0.85rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#666',
      fontFamily: '"Alike", "Georgia", serif',
    },
    prefValue: {
      fontSize: '0.95rem',
      color: '#1a1a1a',
      fontFamily: '"Alike", "Georgia", serif',
      textAlign: 'right',
    },
    
    // Contact section
    contactSection: {
      marginTop: '3rem',
      paddingTop: '3rem',
      borderTop: '1px solid rgba(0,0,0,0.1)',
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
    contactItem: {
      fontSize: '0.9rem',
      color: '#1a1a1a',
      fontFamily: '"Alike", "Georgia", serif',
    },
    contactLabel: {
      fontSize: '0.7rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: '#999',
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
  };

  const certifications = Object.entries(mockProfile.certifications);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerAccent} />
        <div style={styles.headerContent}>
          <div style={styles.profileImage}>
            {mockProfile.profilePhoto ? (
              <img src={mockProfile.profilePhoto} alt={`${mockProfile.firstName} ${mockProfile.lastName}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              `${mockProfile.firstName.charAt(0)}${mockProfile.lastName.charAt(0)}`
            )}
          </div>
          
          <div style={styles.headerInfo}>
            <div style={styles.name}>
              {mockProfile.firstName} {mockProfile.lastName}
              <div style={styles.nameAccent} />
            </div>
            <div style={styles.location}>
              {mockProfile.city} • {mockProfile.salonName}
            </div>
            <div style={styles.bio}>
              {mockProfile.bio}
            </div>
          </div>
          
          <div style={styles.headerMeta}>
            <div style={styles.metaLine}>
              <div style={styles.metaLabel}>Rating</div>
              <div style={styles.metaValue}>{mockProfile.rating}</div>
            </div>
            <div style={styles.metaLine}>
              <div style={styles.metaLabel}>Sessions</div>
              <div style={styles.metaValue}>{mockProfile.totalSessions}</div>
            </div>
            <div style={styles.metaLine}>
              <div style={styles.metaLabel}>Member Since</div>
              <div style={styles.metaValue}>{new Date(mockProfile.memberSince).getFullYear()}</div>
            </div>
            <div style={styles.metaLine}>
              <div style={styles.metaLabel}>Training Hours</div>
              <div style={styles.metaValue}>{mockProfile.trainingHours}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={styles.nav}>
        <div
          style={{
            ...styles.navItem,
            ...(selectedSection === 'overview' ? styles.navItemActive : {}),
          }}
          onClick={() => setSelectedSection('overview')}
        >
          Overview
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(selectedSection === 'portfolio' ? styles.navItemActive : {}),
          }}
          onClick={() => setSelectedSection('portfolio')}
        >
          Portfolio
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(selectedSection === 'training' ? styles.navItemActive : {}),
          }}
          onClick={() => setSelectedSection('training')}
        >
          Training
        </div>
        <div
          style={{
            ...styles.navItem,
            ...(selectedSection === 'preferences' ? styles.navItemActive : {}),
          }}
          onClick={() => setSelectedSection('preferences')}
        >
          Preferences
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {selectedSection === 'overview' && (
          <>
            {/* Stats */}
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{mockProfile.totalSessions}</div>
                <div style={styles.statLabel}>Sessions</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{mockProfile.rating}</div>
                <div style={styles.statLabel}>Rating</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>
                  {certifications.filter(([_, c]) => c.status === 'certified').length}
                </div>
                <div style={styles.statLabel}>Certifications</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statValue}>{mockProfile.reliabilityScore}%</div>
                <div style={styles.statLabel}>Reliability</div>
              </div>
            </div>

            {/* Services */}
            <div style={styles.servicesSection}>
              <div style={styles.sectionTitle}>
                Services
                <div style={styles.sectionTitleUnderline} />
              </div>
              <div style={styles.servicesGrid}>
                <div style={styles.serviceRow}>
                  <span style={styles.serviceName}>Color</span>
                  <span style={styles.serviceStatus}>{mockProfile.serviceComfort.color}</span>
                </div>
                <div style={styles.serviceRow}>
                  <span style={styles.serviceName}>Haircuts</span>
                  <span style={styles.serviceStatus}>{mockProfile.serviceComfort.haircuts}</span>
                </div>
                <div style={styles.serviceRow}>
                  <span style={styles.serviceName}>Blowouts</span>
                  <span style={styles.serviceStatus}>{mockProfile.serviceComfort.blowouts}</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div style={styles.servicesSection}>
              <div style={styles.sectionTitle}>
                Specialties
                <div style={styles.sectionTitleUnderline} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                {mockProfile.specialties.map((spec, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '0.5rem 1rem',
                      border: '1px solid rgba(139, 30, 63, 0.2)',
                      background: 'rgba(139, 30, 63, 0.05)',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#8B1E3F',
                      fontFamily: '"Alike", "Georgia", serif',
                      fontWeight: '500',
                    }}
                  >
                    {spec}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={styles.contactSection}>
              <div style={styles.contactGrid}>
                <div style={styles.contactItem}>
                  <div style={styles.contactLabel}>Phone</div>
                  <div>{mockProfile.phone}</div>
                </div>
                <div style={styles.contactItem}>
                  <div style={styles.contactLabel}>Instagram</div>
                  <div>{mockProfile.instagramHandle}</div>
                </div>
                <div style={styles.contactItem}>
                  <div style={styles.contactLabel}>Location</div>
                  <div>{mockProfile.salonAddress}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedSection === 'portfolio' && (
          <div style={styles.portfolioGrid}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={styles.portfolioItem}>
                Photo {i + 1}
              </div>
            ))}
          </div>
        )}

        {selectedSection === 'training' && (
          <div style={styles.trainingSection}>
            <div style={styles.sectionTitle}>
              Certifications
              <div style={styles.sectionTitleUnderline} />
            </div>
            <div style={styles.certGrid}>
              {certifications.map(([key, cert]) => (
                <div key={key} style={{
                  ...styles.certCard,
                  ...(cert.status === 'certified' ? styles.certCardCertified : {}),
                }}>
                  <div style={styles.certName}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                  <div style={styles.certStatus}>
                    {cert.status === 'certified' ? 'Certified' : `${cert.completed}/${cert.total}`}
                  </div>
                  <div style={styles.certProgress}>
                    {cert.status === 'certified' 
                      ? `Completed ${new Date(cert.completedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                      : 'In Progress'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedSection === 'preferences' && (
          <div style={styles.preferencesGrid}>
            <div style={styles.prefSection}>
              <div style={styles.sectionTitle}>
                Service Preferences
                <div style={styles.sectionTitleUnderline} />
              </div>
              {Object.entries(mockProfile.serviceComfort).map(([service, level]) => (
                <div key={service} style={styles.prefItem}>
                  <div style={styles.prefLabel}>
                    {service.charAt(0).toUpperCase() + service.slice(1)}
                  </div>
                  <div style={styles.prefValue}>{level}</div>
                </div>
              ))}
            </div>
            
            <div style={styles.prefSection}>
              <div style={styles.sectionTitle}>
                Specialty Lanes
                <div style={styles.sectionTitleUnderline} />
              </div>
              {mockProfile.lanes.map((lane, i) => (
                <div key={i} style={styles.prefItem}>
                  <div style={styles.prefLabel}>Lane {i + 1}</div>
                  <div style={styles.prefValue}>{lane}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
