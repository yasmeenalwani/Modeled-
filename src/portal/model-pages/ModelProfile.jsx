import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import PhotoUploader from '../../components/PhotoUploader';
import VideoUploader from '../../components/VideoUploader';
import ModelAvailabilityCalendar from '../../components/ModelAvailabilityCalendar';
import StorageUsage from '../../components/StorageUsage';
import InspirationBoard from '../../components/InspirationBoard';
import CardOnFileSection from '../../components/CardOnFileSection';
import ModelCardOverview from '../../components/profile/ModelCardOverview';
import ModelFocusLayout from '../../components/profile/ModelFocusLayout';
import { getProfilePhotoPath, getVideoReelPath } from '../../utils/storage';
import { getMockModel, shouldUseMockData } from '../../utils/mockDataService';
import { getAuthenticatorUserId } from '../../utils/authUtils';
import { updateEngagementScore, updateModelLastActive } from '../../utils/agenticScores';

const client = generateClient();

// ============ STYLES ============
const styles = {
  container: {
    padding: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Compact horizontal profile header
  profileHeader: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.08))',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1rem 1.5rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
    border: '3px solid rgba(139, 30, 63, 0.3)',
    overflow: 'hidden',
    color: '#FFFEF9',
    flexShrink: 0,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  profileInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  profileNameSection: {
    minWidth: '200px',
  },
  profileName: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileLocation: {
    color: '#5A3A2A',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileBadges: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '0.3rem 0.7rem',
    borderRadius: '16px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  profileStats: {
    display: 'flex',
    gap: '1rem',
    marginLeft: 'auto',
  },
  profileStat: {
    textAlign: 'center',
    minWidth: '60px',
  },
  profileStatValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginBottom: '0.15rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  profileStatLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  changePhotoBtn: {
    padding: '0.4rem 0.8rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    color: '#4A2A1A',
    fontSize: '0.75rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    marginTop: '0.5rem',
  },
  
  // Two column layout
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  
  // Professional Focus layout — left portfolio, right info panels
  focusLayout: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1fr',
    gap: '2rem',
    alignItems: 'start',
    marginTop: '1.5rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    color: '#6B1830',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1.5rem',
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  portfolioCard: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    cursor: 'pointer',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
    padding: '1rem',
  },
  portfolioLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    letterSpacing: '0.1em',
    color: '#FFFEF9',
    textTransform: 'uppercase',
  },
  portfolioAddCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8B1E3F',
    fontSize: '2rem',
  },
  portfolioAddText: {
    fontSize: '0.85rem',
    marginTop: '0.5rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  infoPanel: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1.25rem',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
  },
  infoPanelTitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.15em',
    color: '#6B1830',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0',
    borderBottom: '1px solid rgba(139, 30, 63, 0.08)',
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceListLast: { borderBottom: 'none' },
  serviceFeatured: {
    fontSize: '0.7rem',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  preferenceBadge: {
    display: 'inline-block',
    padding: '0.4rem 0.85rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    fontSize: '0.8rem',
    color: '#4A2A1A',
    margin: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#8B1E3F',
  },
  
  // Sections
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Hair profile - compact
  hairGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  hairItem: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    padding: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hairLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  hairValue: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Preferences tags - compact
  preferenceTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  preferenceTag: {
    padding: '0.4rem 0.8rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    fontSize: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Availability
  availabilityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  dayColumn: {
    textAlign: 'center',
  },
  dayLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  timeSlot: {
    padding: '0.4rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    marginBottom: '0.25rem',
  },
  
  // Form elements - compact
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.75rem',
  },
  formGroup: {},
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#5A3A2A',
    marginBottom: '0.35rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Actions
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  btn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Collapsible section
  collapsibleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
  },
  collapsibleTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Upload grid - compact
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: '1.3fr 0.7fr',
    gap: '1rem',
    alignItems: 'start',
  },
  
  // Compact horizontal availability
  availabilityCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  availabilityDetailed: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  availabilityDayCard: {
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.12)',
    background: 'rgba(139, 30, 63, 0.03)',
    padding: '0.5rem',
  },
  availabilityDayHeader: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.35rem',
    textAlign: 'center',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityLocations: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    justifyContent: 'center',
    marginBottom: '0.35rem',
  },
  availabilityLocationTag: {
    padding: '0.15rem 0.4rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: '#FFFEF9',
    fontSize: '0.6rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityRadius: {
    fontSize: '0.6rem',
    color: '#8B1E3F',
    textAlign: 'center',
    marginBottom: '0.35rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilitySlots: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    justifyContent: 'center',
  },
  availabilitySlot: {
    padding: '0.2rem 0.35rem',
    borderRadius: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    fontSize: '0.6rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  availabilityEmpty: {
    fontSize: '0.6rem',
    color: '#5A3A2A',
    textAlign: 'center',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayColumn: {
    textAlign: 'center',
  },
  dayLabel: {
    fontSize: '0.7rem',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  daySlots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    minHeight: '60px',
  },
  timeSlot: {
    padding: '0.25rem 0.4rem',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '4px',
    fontSize: '0.65rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyDay: {
    fontSize: '0.65rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    padding: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  modalContent: {
    background: '#FFFEF9',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  modalHeader: {
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modalSubtitle: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  serviceCheckbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  serviceCheckboxHover: {
    background: 'rgba(139, 30, 63, 0.05)',
  },
  serviceCheckboxInput: {
    marginRight: '0.75rem',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  serviceCheckboxLabel: {
    fontSize: '0.9rem',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    flex: 1,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
  },
  modalBtn: {
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s',
  },
  modalBtnSecondary: {
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A',
  },
  modalBtnPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  
  // Preferences modal styles
  preferencesModalContent: {
    background: '#FFFEF9',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  },
  preferencesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  preferenceCheckbox: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  preferenceCheckboxInput: {
    marginRight: '0.5rem',
    width: '16px',
    height: '16px',
    cursor: 'pointer',
  },
  preferenceCheckboxLabel: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    flex: 1,
  },
  preferenceCategoryTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#8B1E3F',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    gridColumn: '1 / -1',
  },
  preferenceCategoryTitleFirst: {
    marginTop: '0',
  },
  
  // Quick-add suggestions
  suggestionsSection: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  suggestionsTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#5A3A2A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  suggestionButton: {
    padding: '0.5rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontFamily: '"Alike", "Georgia", serif',
    cursor: 'pointer',
    border: '1px solid',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  suggestionButtonUnselected: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderColor: 'rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A',
  },
  suggestionButtonSelected: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    borderColor: '#8B1E3F',
    color: '#FFFEF9',
  },
  
};

// Mock profile data (would come from API)
const profile = {
  userId: 'user-123',
  firstName: 'Seraphina',
  lastName: 'Luna',
  email: 'seraphina.luna@email.com',
  phone: '(555) 234-5678',
  location: 'Manhattan, NYC',
  bio: 'Passionate about healthy hair and lived-in color. I love trying new salons and collaborating with stylists on creative looks. Always open to color, highlights, and anything that makes my hair feel its best.',
  joined: 'August 2024',
  level: 'Gold Model',
  sessions: 12,
  opportunities: 0,
  rating: 4.9,
  xp: 2450,
  profilePhoto: null, // URL if exists
  videoReel: null, // { url, duration } if exists
  photos: [], // Array of photo URLs - will be populated with Canva images
  hair: {
    type: 'Wavy',
    length: 'Long',
    color: 'Blonde with Highlights',
    condition: 'Color-Treated',
    virgin: false,
    texture: 'Medium-Thick',
  },
  preferences: [
    'Open to color',
    'Love balayage',
    'Trims OK',
    'Love blowouts',
    'No bleach',
    'Mornings preferred',
    'Manhattan only',
  ],
  availability: {
    Mon: ['9AM', '10AM', '11AM'],
    Tue: ['10AM', '2PM', '3PM'],
    Wed: ['9AM', '10AM'],
    Thu: [],
    Fri: ['11AM', '12PM', '2PM'],
    Sat: ['10AM', '11AM', '12PM', '1PM'],
    Sun: [],
  },
  availabilityRules: {
    monday: {
      ranges: [{ start: '09:00', end: '12:00', location: 'Tribeca' }],
      radiusMiles: 3,
    },
    tuesday: {
      ranges: [{ start: '09:00', end: '12:00', location: 'Tribeca' }],
      radiusMiles: 3,
    },
    wednesday: {
      ranges: [{ start: '09:00', end: '12:00', location: 'Tribeca' }],
      radiusMiles: 3,
    },
    thursday: {
      ranges: [],
      radiusMiles: 0,
    },
    friday: {
      ranges: [{ start: '11:00', end: '15:00', location: 'SoHo' }],
      radiusMiles: 4,
    },
    saturday: {
      ranges: [{ start: '10:00', end: '14:00', location: 'Upper East Side' }],
      radiusMiles: 5,
    },
    sunday: {
      ranges: [{ start: '10:00', end: '13:00', location: 'Upper East Side' }],
      radiusMiles: 5,
    },
  },
  servicesOpenTo: {
    haircut: true,
    color: true,
    styling: true,
    makeup: false,
    nails: false,
    skincare: false,
  },
};

const DAYS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Predefined preferences list (36 options - excluding "Allergy" which is separate field)
const PREFERENCE_OPTIONS = [
  // Service Preferences
  'Open to color',
  'Love balayage',
  'Prefer highlights',
  'Trims OK',
  'Love blowouts',
  'Open to keratin',
  'Prefer natural colors',
  'Bold changes welcome',
  'Conservative styles only',
  'Open to dramatic cuts',
  'Length maintenance only',
  // Location Preferences
  'Manhattan only',
  'Brooklyn preferred',
  'Upper East Side only',
  'Downtown preferred',
  'Willing to travel',
  'Upper West Side only',
  'Queens/Brooklyn OK',
  'No travel (in-salon only)',
  // Time Preferences
  'Mornings preferred',
  'Afternoons only',
  'Evenings OK',
  'Weekends only',
  'Weekdays preferred',
  'Flexible schedule',
  'Early morning (before 10am)',
  'Late evening (after 6pm)',
  // Style Preferences
  'Natural styles',
  'Open to experiment',
  'Prefer low-maintenance styles',
  'Love trendy styles',
  'Classic styles preferred',
  'Edgy looks welcome',
  // Restrictions/Special Requirements
  'No bleach',
  'No chemicals',
  'Organic products only',
  'Sensitive scalp',
  'Color-treated hair only',
  'Virgin hair only',
];

export default function ModelProfile() {
  const { user } = useAuthenticator();
  const [modelProfile, setModelProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videoReel, setVideoReel] = useState(null);
  const [basicInfoExpanded, setBasicInfoExpanded] = useState(false);
  const [showServiceEditor, setShowServiceEditor] = useState(false);
  const [savingServices, setSavingServices] = useState(false);
  const [servicePreferences, setServicePreferences] = useState({
    openToHaircut: false,
    openToColor: false,
    openToStyling: false,
    openToMakeup: false,
    openToNails: false,
    openToSkincare: false,
  });
  const [showPreferencesEditor, setShowPreferencesEditor] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [showPhotosEditor, setShowPhotosEditor] = useState(false);

  // Load model profile from database
  useEffect(() => {
    loadModelProfile();
  }, [user]);

  // Load photos from mock data on mount (demo mode only)
  useEffect(() => {
    if (!shouldUseMockData()) return;

    const loadPhotos = () => {
      try {
        const mockModel = getMockModel('mock-model-1'); // Seraphina Luna
        console.log('Loading Seraphina Luna photos from mock data:', {
          model: mockModel?.firstName,
          photoCount: mockModel?.photoUrls?.length || 0,
          photoUrls: mockModel?.photoUrls
        });
        
        if (mockModel && mockModel.photoUrls && Array.isArray(mockModel.photoUrls) && mockModel.photoUrls.length > 0) {
          const loadedPhotos = mockModel.photoUrls.map((url, index) => {
            // Ensure URL is a string, handle both object and string formats
            let photoUrl = typeof url === 'string' ? url : url.url || url;
            // Encode spaces in filename for proper URL handling
            // Split path and encode only the filename part
            const pathParts = photoUrl.split('/');
            const filename = pathParts[pathParts.length - 1];
            const encodedFilename = encodeURIComponent(filename);
            const encodedUrl = pathParts.slice(0, -1).join('/') + '/' + encodedFilename;
            
            return { 
              url: encodedUrl, 
              key: encodedUrl, 
              id: `seraphina-photo-${index}` 
            };
          });
          console.log('✅ Successfully loaded', loadedPhotos.length, 'photos for Seraphina Luna');
          console.log('Photo URLs:', loadedPhotos.map(p => p.url));
          setPhotos(loadedPhotos);
        } else {
          console.warn('⚠️ No photos found in mock model for Seraphina Luna');
          console.warn('Mock model:', mockModel);
        }
        
        if (mockModel && mockModel.headshotUrl) {
          // Encode spaces in headshot URL as well
          let headshotUrl = mockModel.headshotUrl;
          const headshotPathParts = headshotUrl.split('/');
          const headshotFilename = headshotPathParts[headshotPathParts.length - 1];
          const encodedHeadshotFilename = encodeURIComponent(headshotFilename);
          const encodedHeadshotUrl = headshotPathParts.slice(0, -1).join('/') + '/' + encodedHeadshotFilename;
          console.log('Setting profile photo (headshot):', encodedHeadshotUrl);
          setProfilePhoto(prev => prev || encodedHeadshotUrl);
        }
      } catch (error) {
        console.error('❌ Error loading mock photos:', error);
      }
    };
    
    // Load immediately on mount
    loadPhotos();
  }, []); // Run once on mount

  const loadModelProfile = async () => {
    try {
      if (shouldUseMockData()) {
        const mockModel = getMockModel('mock-model-1'); // Seraphina Luna
        if (mockModel) {
          const mockProfile = {
            id: 'mock',
            ...profile,
            ...mockModel,
            availability: {
              monday: profile.availability.Mon || [],
              tuesday: profile.availability.Tue || [],
              wednesday: profile.availability.Wed || [],
              thursday: profile.availability.Thu || [],
              friday: profile.availability.Fri || [],
              saturday: profile.availability.Sat || [],
              sunday: profile.availability.Sun || [],
            },
            availabilityRules: profile.availabilityRules,
          };
          setModelProfile(mockProfile);
          setServicePreferences({
            openToHaircut: mockProfile.openToHaircut || false,
            openToColor: mockProfile.openToColor || false,
            openToStyling: mockProfile.openToStyling || false,
            openToMakeup: mockProfile.openToMakeup || false,
            openToNails: mockProfile.openToNails || false,
            openToSkincare: mockProfile.openToSkincare || false,
          });
          setSelectedPreferences(mockProfile.tags || []);
        }
        setLoading(false);
        return;
      }

      const authUserId = getAuthenticatorUserId(user);
      if (!authUserId) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await client.models.ModelProfile.list({
        filter: { userId: { eq: authUserId } },
      });
      
      if (profiles && profiles.length > 0) {
        setModelProfile(profiles[0]);
        setProfilePhoto(profiles[0].headshotUrl);
        // Load photos from photoUrls array (for Canva images) - encode URLs properly
        const photoUrls = profiles[0].photoUrls || [];
        if (photoUrls.length > 0) {
          const loadedPhotos = photoUrls.map((url, index) => {
            // Encode spaces in filename for proper URL handling
            let photoUrl = typeof url === 'string' ? url : url.url || url;
            const pathParts = photoUrl.split('/');
            const filename = pathParts[pathParts.length - 1];
            const encodedFilename = encodeURIComponent(filename);
            const encodedUrl = pathParts.slice(0, -1).join('/') + '/' + encodedFilename;
            return { 
              url: encodedUrl, 
              key: encodedUrl, 
              id: `photo-${index}` 
            };
          });
          setPhotos(loadedPhotos);
          console.log('✅ Loaded', loadedPhotos.length, 'photos from database');
        } else {
          // No photos in database, keep existing photos from mock data if any
          console.log('No photos in database, keeping existing photos');
        }
        // Initialize service preferences
        setServicePreferences({
          openToHaircut: profiles[0].openToHaircut || false,
          openToColor: profiles[0].openToColor || false,
          openToStyling: profiles[0].openToStyling || false,
          openToMakeup: profiles[0].openToMakeup || false,
          openToNails: profiles[0].openToNails || false,
          openToSkincare: profiles[0].openToSkincare || false,
        });
        // Initialize preferences (tags)
        setSelectedPreferences(profiles[0].tags || []);
        setLoading(false);
      } else {
        // Fallback to mock data if no profile found - try to get from mockDataService
        try {
          const mockModel = getMockModel('mock-model-1'); // Seraphina Luna
          if (mockModel) {
            const mockProfile = {
              id: 'mock',
              ...profile,
              ...mockModel,
              availability: {
                monday: profile.availability.Mon || [],
                tuesday: profile.availability.Tue || [],
                wednesday: profile.availability.Wed || [],
                thursday: profile.availability.Thu || [],
                friday: profile.availability.Fri || [],
                saturday: profile.availability.Sat || [],
                sunday: profile.availability.Sun || [],
              },
              availabilityRules: profile.availabilityRules,
            };
            setModelProfile(mockProfile);
            // Load photos from mock data photoUrls array (from Canva) - encode URLs properly
            if (mockModel.photoUrls && mockModel.photoUrls.length > 0) {
              const loadedPhotos = mockModel.photoUrls.map((url, index) => {
                // Encode spaces in filename for proper URL handling
                let photoUrl = typeof url === 'string' ? url : url.url || url;
                const pathParts = photoUrl.split('/');
                const filename = pathParts[pathParts.length - 1];
                const encodedFilename = encodeURIComponent(filename);
                const encodedUrl = pathParts.slice(0, -1).join('/') + '/' + encodedFilename;
                return { 
                  url: encodedUrl, 
                  key: encodedUrl, 
                  id: `mock-photo-${index}` 
                };
              });
              setPhotos(loadedPhotos);
              console.log('✅ Loaded', loadedPhotos.length, 'photos from mock data (in loadModelProfile)');
            }
            if (mockModel.headshotUrl) {
              setProfilePhoto(mockModel.headshotUrl);
            }
          } else {
            setModelProfile({
              id: 'mock',
              ...profile,
              availability: {
                monday: profile.availability.Mon || [],
                tuesday: profile.availability.Tue || [],
                wednesday: profile.availability.Wed || [],
                thursday: profile.availability.Thu || [],
                friday: profile.availability.Fri || [],
                saturday: profile.availability.Sat || [],
                sunday: profile.availability.Sun || [],
              },
              availabilityRules: profile.availabilityRules,
            });
          }
        } catch (mockError) {
          console.error('Error loading mock model:', mockError);
          setModelProfile({
            id: 'mock',
            ...profile,
            availability: {
              monday: profile.availability.Mon || [],
              tuesday: profile.availability.Tue || [],
              wednesday: profile.availability.Wed || [],
              thursday: profile.availability.Thu || [],
              friday: profile.availability.Fri || [],
              saturday: profile.availability.Sat || [],
              sunday: profile.availability.Sun || [],
            },
            availabilityRules: profile.availabilityRules,
          });
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading model profile:', error);
      // Fallback to mock data - try to get from mockDataService
      try {
        const mockModel = getMockModel('mock-model-1');
        if (mockModel) {
          const mockProfile = {
            id: 'mock',
            ...profile,
            ...mockModel,
            tags: profile.preferences || [],
            photoUrls: mockModel.photoUrls || [],
            availability: {
              monday: profile.availability.Mon || [],
              tuesday: profile.availability.Tue || [],
              wednesday: profile.availability.Wed || [],
              thursday: profile.availability.Thu || [],
              friday: profile.availability.Fri || [],
              saturday: profile.availability.Sat || [],
              sunday: profile.availability.Sun || [],
            },
            availabilityRules: profile.availabilityRules,
          };
          setModelProfile(mockProfile);
          // Load photos from mock data photoUrls array (from Canva) - encode URLs properly
          if (mockModel.photoUrls && mockModel.photoUrls.length > 0) {
            const loadedPhotos = mockModel.photoUrls.map((url, index) => {
              // Encode spaces in filename for proper URL handling
              let photoUrl = typeof url === 'string' ? url : url.url || url;
              const pathParts = photoUrl.split('/');
              const filename = pathParts[pathParts.length - 1];
              const encodedFilename = encodeURIComponent(filename);
              const encodedUrl = pathParts.slice(0, -1).join('/') + '/' + encodedFilename;
              return { 
                url: encodedUrl, 
                key: encodedUrl, 
                id: `mock-photo-${index}` 
              };
            });
            setPhotos(loadedPhotos);
            console.log('✅ Loaded', loadedPhotos.length, 'photos from mock data (error fallback)');
          }
          if (mockModel.headshotUrl) {
            setProfilePhoto(mockModel.headshotUrl);
          }
        } else {
          setModelProfile({
            id: 'mock',
            ...profile,
            tags: profile.preferences || [],
            availability: {
              monday: profile.availability.Mon || [],
              tuesday: profile.availability.Tue || [],
              wednesday: profile.availability.Wed || [],
              thursday: profile.availability.Thu || [],
              friday: profile.availability.Fri || [],
              saturday: profile.availability.Sat || [],
              sunday: profile.availability.Sun || [],
            },
          });
        }
      } catch (mockError) {
        console.error('Error loading mock model:', mockError);
        setModelProfile({
          id: 'mock',
          ...profile,
          tags: profile.preferences || [],
          availability: {
            monday: profile.availability.Mon || [],
            tuesday: profile.availability.Tue || [],
            wednesday: profile.availability.Wed || [],
            thursday: profile.availability.Thu || [],
            friday: profile.availability.Fri || [],
            saturday: profile.availability.Sat || [],
            sunday: profile.availability.Sun || [],
          },
        });
      }
      setSelectedPreferences(profile.preferences || []);
      setLoading(false);
    }
  };

  const handleAvailabilitySave = (updatedProfile) => {
    setModelProfile(updatedProfile);
  };

  // Handle profile photo upload
  const handleProfilePhotoUpload = (results) => {
    if (results.length > 0) {
      setProfilePhoto(results[0].url);
      // TODO: Save to database via GraphQL
      console.log('Profile photo uploaded:', results[0]);
    }
  };

  // Handle additional photos upload
  const handlePhotosUpload = (results) => {
    const newPhotos = results.map(r => ({ url: r.url, key: r.key }));
    setPhotos(prev => [...prev, ...newPhotos]);
    // TODO: Save to database via GraphQL
    console.log('Photos uploaded:', results);
  };

  // Handle photo delete
  const handlePhotoDelete = (photo) => {
    setPhotos(prev => prev.filter(p => p.url !== photo.url && p !== photo));
    // TODO: Delete from database via GraphQL
    console.log('Photo deleted:', photo);
  };

  // Handle video upload
  const handleVideoUpload = (result) => {
    setVideoReel({ url: result.url, key: result.key, duration: result.duration });
    // TODO: Save to database via GraphQL
    console.log('Video uploaded:', result);
  };

  // Handle video delete
  const handleVideoDelete = () => {
    setVideoReel(null);
    // TODO: Delete from database via GraphQL
    console.log('Video deleted');
  };

  // Service mapping
  const serviceOptions = [
    { key: 'openToHaircut', label: 'Haircuts' },
    { key: 'openToColor', label: 'Color' },
    { key: 'openToStyling', label: 'Styling/Blowouts' },
  ];

  // Save service preferences
  const handleSaveServices = async () => {
    if (!modelProfile || !modelProfile.id || modelProfile.id === 'mock') {
      console.error('No model profile to update or using mock data');
      alert('Cannot save - using mock data. Please complete onboarding first.');
      return;
    }

    setSavingServices(true);
    try {
      const { data, errors } = await client.models.ModelProfile.update({
        id: modelProfile.id,
        ...servicePreferences,
      });

      if (errors) {
        console.error('Error updating services:', errors);
        alert('Failed to save services. Please try again.');
      } else {
        setModelProfile({ ...modelProfile, ...servicePreferences });
        setShowServiceEditor(false);
        updateModelLastActive(modelProfile.id).catch(() => {});
        updateEngagementScore(modelProfile.id).catch(() => {});
      }
    } catch (error) {
      console.error('Error saving services:', error);
      alert('Failed to save services. Please try again.');
    } finally {
      setSavingServices(false);
    }
  };

  // Save preferences (tags)
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      // In mock/demo mode or when the data client is not available,
      // treat preferences as local-only so the UI still works smoothly.
      if (!modelProfile || !modelProfile.id || modelProfile.id === 'mock' || shouldUseMockData() || !client?.models?.ModelProfile) {
        console.warn('Saving preferences locally (mock/demo mode).', {
          hasProfile: !!modelProfile,
          id: modelProfile?.id,
        });
        setModelProfile(prev => prev ? { ...prev, tags: selectedPreferences } : prev);
        setShowPreferencesEditor(false);
        return;
      }

      const { data, errors } = await client.models.ModelProfile.update({
        id: modelProfile.id,
        tags: selectedPreferences,
      });

      if (errors) {
        console.error('Error updating preferences:', errors);
        alert('Failed to save preferences. Please try again.');
      } else {
        setModelProfile({ ...modelProfile, tags: selectedPreferences });
        setShowPreferencesEditor(false);
        updateModelLastActive(modelProfile.id).catch(() => {});
        updateEngagementScore(modelProfile.id).catch(() => {});
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    } finally {
      setSavingPreferences(false);
    }
  };

  // Common preferences for quick-add suggestions
  const commonPreferences = [
    'Open to color',
    'Love balayage',
    'Love blowouts',
    'Mornings preferred',
    'Flexible schedule',
    'Manhattan only',
    'Natural styles',
    'Open to experiment',
    'Willing to travel',
    'Weekends only',
  ];

  // Group preferences by category
  const preferenceCategories = [
    {
      title: 'Service Preferences',
      options: [
        'Open to color', 'Love balayage', 'Prefer highlights', 'Trims OK',
        'Love blowouts', 'Open to keratin', 'Prefer natural colors',
        'Bold changes welcome', 'Conservative styles only',
        'Open to dramatic cuts', 'Length maintenance only',
      ],
    },
    {
      title: 'Location Preferences',
      options: [
        'Manhattan only', 'Brooklyn preferred', 'Upper East Side only',
        'Downtown preferred', 'Willing to travel', 'Upper West Side only',
        'Queens/Brooklyn OK', 'No travel (in-salon only)',
      ],
    },
    {
      title: 'Time Preferences',
      options: [
        'Mornings preferred', 'Afternoons only', 'Evenings OK',
        'Weekends only', 'Weekdays preferred', 'Flexible schedule',
        'Early morning (before 10am)', 'Late evening (after 6pm)',
      ],
    },
    {
      title: 'Style Preferences',
      options: [
        'Natural styles', 'Open to experiment', 'Prefer low-maintenance styles',
        'Love trendy styles', 'Classic styles preferred', 'Edgy looks welcome',
      ],
    },
    {
      title: 'Restrictions/Special Requirements',
      options: [
        'No bleach', 'No chemicals', 'Organic products only',
        'Sensitive scalp', 'Color-treated hair only', 'Virgin hair only',
      ],
    },
  ];

  const formatTimeLabel = (minutes) => {
    const hours24 = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const suffix = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = ((hours24 + 11) % 12) + 1;
    return `${hours12}:${mins.toString().padStart(2, '0')} ${suffix}`;
  };

  const parseTimeToMinutes = (time) => {
    if (!time) return null;
    const [rawH, rawM] = time.split(':');
    const hours = Number(rawH);
    const minutes = Number(rawM || 0);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const expandRangesToSlots = (ranges = [], stepMinutes = 30) => {
    const slots = [];
    ranges.forEach((range) => {
      const start = parseTimeToMinutes(range.start);
      const end = parseTimeToMinutes(range.end);
      if (start === null || end === null) return;
      for (let t = start; t < end; t += stepMinutes) {
        slots.push(formatTimeLabel(t));
      }
    });
    return slots;
  };

  const availabilityRules = modelProfile?.availabilityRules || profile.availabilityRules;

  // Convert availabilityRules to ModelFocusLayout format { day: { neighborhoods, slots } }
  const availabilityForCard = useMemo(() => {
    const raw = modelProfile?.availability || {};
    const rules = modelProfile?.availabilityRules || profile?.availabilityRules || {};
    const out = {};
    for (const day of DAY_KEYS) {
      const rule = rules[day];
      const rawDay = raw[day];
      if (rawDay && typeof rawDay === 'object' && (rawDay.neighborhoods || rawDay.slots)) {
        out[day] = { neighborhoods: rawDay.neighborhoods || [], slots: rawDay.slots || [] };
      } else if (rule?.ranges?.length) {
        const neighborhoods = [...new Set(rule.ranges.map((r) => r.location).filter(Boolean))];
        const slots = expandRangesToSlots(rule.ranges);
        out[day] = { neighborhoods, slots };
      } else if (Array.isArray(rawDay)) {
        out[day] = { neighborhoods: [], slots: rawDay };
      }
    }
    return out;
  }, [modelProfile?.availability, modelProfile?.availabilityRules, profile?.availabilityRules]);

  // Model object for ModelCardOverview and ModelFocusLayout
  const modelForCard = useMemo(() => {
    const p = modelProfile || profile;
    const photoUrls = photos.map((x) => (typeof x === 'object' ? x?.url : x)).filter(Boolean);
    return {
      ...p,
      firstName: p?.firstName || profile?.firstName,
      lastName: p?.lastName || profile?.lastName,
      headshotUrl: profilePhoto || p?.headshotUrl,
      photoUrls,
      bio: p?.bio || profile?.bio || [p?.whatYouCareAbout, p?.somethingFun].filter(Boolean).join(' '),
      locationZip: p?.locationZip || (p?.location && String(p.location).match(/\d{5}/)?.[0]),
      availability: availabilityForCard,
      totalBookings: p?.sessions ?? p?.totalBookings ?? profile?.sessions ?? 0,
      repeatBookings: p?.repeatBookings ?? 0,
      openToHaircut: servicePreferences?.openToHaircut ?? p?.openToHaircut,
      openToColor: servicePreferences?.openToColor ?? p?.openToColor,
      openToStyling: servicePreferences?.openToStyling ?? p?.openToStyling,
      communityInterests: p?.tags || selectedPreferences,
    };
  }, [modelProfile, profile, profilePhoto, photos, availabilityForCard, servicePreferences, selectedPreferences]);

  // Build availability summary for right panel (location × time)
  const availabilitySummary = DAY_KEYS.map((dayKey, index) => {
    const dayRule = availabilityRules?.[dayKey];
    const slotsFromRules = dayRule?.ranges?.length ? expandRangesToSlots(dayRule.ranges) : [];
    const legacySlots = (modelProfile?.availability && modelProfile.availability[dayKey]) || [];
    const slots = slotsFromRules.length > 0 ? slotsFromRules : legacySlots;
    const locations = dayRule?.ranges ? [...new Set(dayRule.ranges.map((r) => r.location).filter(Boolean))] : [];
    const locStr = locations.length > 0 ? locations.join(', ') : '—';
    const timeStr = slots.length > 0 ? `${slots[0]}${slots.length > 1 ? ' – ' + slots[slots.length - 1] : ''}` : '—';
    return { day: DAYS_FULL[index], location: locStr, time: timeStr, hasData: slots.length > 0 || locations.length > 0 };
  }).filter((r) => r.hasData);

  const editBtnStyle = {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
  };

  return (
    <div style={styles.container}>
      {/* Model Card */}
      <ModelCardOverview model={modelForCard} hideStats />
      <ModelFocusLayout model={modelForCard} />

      {/* Edit buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <button
          style={editBtnStyle}
          onClick={() => setShowPhotosEditor(true)}
        >
          Edit Photos
        </button>
        <button style={editBtnStyle} onClick={() => setShowServiceEditor(true)}>
          Edit Services
        </button>
        <button
          style={editBtnStyle}
          onClick={() => {
            if (modelProfile?.tags) setSelectedPreferences([...modelProfile.tags]);
            setShowPreferencesEditor(true);
          }}
        >
          Edit Preferences
        </button>
        <button style={editBtnStyle} onClick={() => alert('Opens availability editor')}>
          Edit Availability
        </button>
      </div>

      {/* Basic Information — includes payment method */}
      <div style={{ marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '1rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Basic Information
        </h2>
        <CardOnFileSection
          modelProfile={modelProfile}
          onUpdate={(updates) => setModelProfile(prev => prev ? { ...prev, ...updates } : prev)}
        />
      </div>

      {/* Photos Editor Modal */}
      {showPhotosEditor && (
        <div style={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowPhotosEditor(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Portfolio Photos</h2>
              <p style={styles.modalSubtitle}>Your 6 featured pics from Model Photos</p>
            </div>
            <PhotoUploader
              title="Portfolio Photos"
              subtitle="Add or update your featured hair photos"
              maxFiles={15}
              accentColor="#8B1E3F"
              existingPhotos={photos}
              pathGenerator={(filename) => getProfilePhotoPath('model', modelProfile?.userId || profile?.userId || 'mock-user-1', filename)}
              onUpload={handlePhotosUpload}
              onDelete={handlePhotoDelete}
              userType="model"
              contentType="profilePhotos"
              compact={false}
            />
            <div style={styles.modalActions}>
              <button style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }} onClick={() => setShowPhotosEditor(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service Editor Modal */}
      {showServiceEditor && (
        <div 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowServiceEditor(false);
          }}
        >
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Services</h2>
              <p style={styles.modalSubtitle}>
                Select which services you're open to receiving requests for
              </p>
            </div>

            <div>
              {serviceOptions.map((service) => (
                <label
                  key={service.key}
                  style={styles.serviceCheckbox}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <input
                    type="checkbox"
                    style={styles.serviceCheckboxInput}
                    checked={servicePreferences[service.key] || false}
                    onChange={(e) => {
                      setServicePreferences({
                        ...servicePreferences,
                        [service.key]: e.target.checked,
                      });
                    }}
                  />
                  <span style={styles.serviceCheckboxLabel}>
                    {service.label}
                  </span>
                </label>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
                onClick={() => {
                  // Reset to original values
                  if (modelProfile) {
                    setServicePreferences({
                      openToHaircut: modelProfile.openToHaircut || false,
                      openToColor: modelProfile.openToColor || false,
                      openToStyling: modelProfile.openToStyling || false,
                      openToMakeup: modelProfile.openToMakeup || false,
                      openToNails: modelProfile.openToNails || false,
                      openToSkincare: modelProfile.openToSkincare || false,
                    });
                  }
                  setShowServiceEditor(false);
                }}
                disabled={savingServices}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
                onClick={handleSaveServices}
                disabled={savingServices}
              >
                {savingServices ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Editor Modal */}
      {showPreferencesEditor && (
        <div 
          style={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Reset to original values on cancel
              if (modelProfile && modelProfile.tags) {
                setSelectedPreferences([...modelProfile.tags]);
              }
              setShowPreferencesEditor(false);
            }
          }}
        >
          <div style={styles.preferencesModalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Preferences</h2>
              <p style={styles.modalSubtitle}>
                Select your preferences from the list below. You can choose multiple options.
              </p>
            </div>

            {/* Quick-add Suggestions */}
            <div style={styles.suggestionsSection}>
              <div style={styles.suggestionsTitle}>Popular Preferences</div>
              <div style={styles.suggestionsGrid}>
                {commonPreferences.map((pref) => {
                  const isSelected = selectedPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      style={{
                        ...styles.suggestionButton,
                        ...(isSelected ? styles.suggestionButtonSelected : styles.suggestionButtonUnselected),
                      }}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
                        } else {
                          setSelectedPreferences([...selectedPreferences, pref]);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
                          e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                        }
                      }}
                    >
                      {isSelected ? '✓' : '+'} {pref}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={styles.preferencesGrid}>
              {preferenceCategories.map((category, catIndex) => (
                <React.Fragment key={category.title}>
                  <div 
                    style={{
                      ...styles.preferenceCategoryTitle,
                      ...(catIndex === 0 ? styles.preferenceCategoryTitleFirst : {}),
                    }}
                  >
                    {category.title}
                  </div>
                  {category.options.map((pref) => (
                    <label
                      key={pref}
                      style={styles.preferenceCheckbox}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <input
                        type="checkbox"
                        style={styles.preferenceCheckboxInput}
                        checked={selectedPreferences.includes(pref)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPreferences([...selectedPreferences, pref]);
                          } else {
                            setSelectedPreferences(selectedPreferences.filter(p => p !== pref));
                          }
                        }}
                      />
                      <span style={styles.preferenceCheckboxLabel}>{pref}</span>
                    </label>
                  ))}
                </React.Fragment>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
                onClick={() => {
                  // Reset to original values
                  if (modelProfile && modelProfile.tags) {
                    setSelectedPreferences([...modelProfile.tags]);
                  }
                  setShowPreferencesEditor(false);
                }}
                disabled={savingPreferences}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
                onClick={handleSavePreferences}
                disabled={savingPreferences}
              >
                {savingPreferences ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storage Usage - Small, at bottom */}
      {user?.userId && (
        <div style={{ marginTop: '2rem', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}>
          <StorageUsage
            userType="model"
            contentCounts={{
              profilePhotos: photos.length,
              profileVideos: videoReel ? 1 : 0,
              inspirationPhotos: 0, // TODO: Load from database
              inspirationVideos: 0, // TODO: Load from database
            }}
          />
        </div>
      )}

    </div>
  );
}
