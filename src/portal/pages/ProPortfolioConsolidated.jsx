// ============================================
// MY PORTFOLIO - Consolidated Page
// Magazine-style portfolio with calendar integration
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { usePortalAuth as useAuthenticator } from '../../hooks/usePortalAuth';
import PhotoUploader from '../../components/PhotoUploader';
import { deleteFile, getPortfolioPath } from '../../utils/storage';
import { shouldUseMockData, getMockProfessionalByUserId } from '../../utils/mockDataService';

let client;
try {
  client = generateClient();
} catch (error) {
  console.warn('Failed to generate Amplify client, will use mock data only:', error);
  client = null;
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '1.1rem 1.5rem',
    borderRadius: '16px',
    background: 'linear-gradient(90deg, rgba(139, 30, 63, 0.08), rgba(250, 246, 240, 0.9))',
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
  uploadBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '10px',
    color: '#FFFEF9', // Ivory
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#5A3A2A', // Muted brown
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  tabShop: {
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '999px',
  },
  
  // Stats
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },

  filterLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", \"Georgia\", serif',
    marginRight: '0.5rem',
  },
  filterChip: {
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    border: '1px solid rgba(139, 30, 63, 0.18)',
    background: 'rgba(139, 30, 63, 0.03)',
    fontSize: '0.75rem',
    color: '#5A3A2A',
    cursor: 'pointer',
    fontFamily: '"Alike", \"Georgia\", serif',
    marginRight: '0.35rem',
  },
  filterChipActive: {
    background: 'rgba(139, 30, 63, 0.14)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  
  // Section
  section: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Upload grid
  uploadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Dark brown
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Search bar container
  searchContainer: {
    marginBottom: '2rem',
  },
  filterToggle: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  
  // Modal overlay for tag editor
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
  },
  modalContent: {
    background: '#FFFEF9',
    borderRadius: '16px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  
  // Photo actions overlay
  photoActions: {
    position: 'absolute',
    top: '0.75rem',
    right: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
    zIndex: 10,
  },
  photoActionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.9)',
    color: '#8B1E3F',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease',
  },
  photoTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  photoTag: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Gallery grid - Enhanced responsive grid
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
    '@media (min-width: 1200px)': {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
  },
  galleryItem: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    position: 'relative',
  },
  galleryItemHover: {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 24px rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F',
  },
  flatCard: {
    height: '340px',
  },
  serviceBadge: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.9)',
    color: '#FFFEF9',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  flipDetails: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  detailLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(74, 42, 26, 0.6)',
    marginBottom: '0.25rem',
  },
  detailValue: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    fontWeight: '600',
  },
  detailBtn: {
    marginTop: '1rem',
    padding: '0.6rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.25)',
    background: 'rgba(139, 30, 63, 0.08)',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  detailModalImage: {
    width: '100%',
    borderRadius: '14px',
    objectFit: 'cover',
    maxHeight: '420px',
  },
  detailStrip: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  detailThumb: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '2px solid transparent',
    cursor: 'pointer',
  },
  detailThumbActive: {
    borderColor: '#8B1E3F',
  },
  galleryImage: {
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.06))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    position: 'relative',
    overflow: 'hidden',
    color: 'rgba(139, 30, 63, 0.5)',
    fontFamily: '"Alike", "Georgia", serif',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  beforeAfter: {
    position: 'absolute',
    top: '0.75rem',
    left: '0.75rem',
    display: 'flex',
    gap: '0.5rem',
  },
  badge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.65rem',
    fontWeight: '600',
  },
  galleryInfo: {
    padding: '1rem',
  },
  galleryService: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  galleryMeta: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  galleryRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.85rem',
  },
  star: {
    color: '#ffc107',
  },
  
  // Feedback section
  overallRating: {
    background: 'linear-gradient(135deg, rgba(255,193,7,0.15), rgba(255,193,7,0.05))',
    border: '1px solid rgba(255,193,7,0.3)',
    borderRadius: '20px',
    padding: '2.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  ratingValue: {
    fontSize: '5rem',
    fontWeight: '700',
    color: '#ffc107',
    lineHeight: 1,
  },
  ratingStars: {
    fontSize: '2rem',
    marginTop: '0.5rem',
    marginBottom: '1rem',
  },
  ratingLabel: {
    fontSize: '1.1rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  ratingCount: {
    fontSize: '0.9rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Rating breakdown
  breakdownSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  breakdownCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  breakdownTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  breakdownItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  breakdownLabel: {
    width: '140px',
    fontSize: '0.9rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  breakdownBar: {
    flex: 1,
    height: '10px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '5px',
    overflow: 'hidden',
    marginRight: '1rem',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: '5px',
    background: '#ffc107',
  },
  breakdownValue: {
    width: '40px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#ffc107',
  },
  
  // Recent feedback
  recentSection: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  feedbackItem: {
    padding: '1.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    marginBottom: '1rem',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  feedbackService: {
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  feedbackDate: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  feedbackStars: {
    color: '#ffc107',
  },
  feedbackText: {
    fontSize: '0.9rem',
    color: '#4A2A1A', // Dark brown
    lineHeight: 1.6,
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  feedbackAnon: {
    fontSize: '0.75rem',
    color: '#5A3A2A', // Muted brown
    marginTop: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A', // Muted brown
    gridColumn: '1 / -1',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  
  // Inspo tab styles
  inspoSection: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  },
  socialLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '2rem',
  },
  socialLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '10px',
    color: '#4A2A1A',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  socialLinkHover: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderColor: '#8B1E3F',
    transform: 'translateY(-2px)',
  },
  
  // Photo details modal
  photoDetailsModal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '2rem',
  },
  photoDetailsContent: {
    background: '#FFFEF9',
    borderRadius: '20px',
    maxWidth: '800px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  photoDetailsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  photoDetailsTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  photoDetailsClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '2rem',
    color: '#5A3A2A',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  photoDetailsBody: {
    padding: '1.5rem',
  },
  photoDetailsImage: {
    width: '100%',
    aspectRatio: '4/5',
    objectFit: 'cover',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.15), rgba(168, 90, 90, 0.1))',
  },
  photoDetailsInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  photoDetailsItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  photoDetailsLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  photoDetailsValue: {
    fontSize: '1rem',
    color: '#4A2A1A',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  photoDetailsActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  photoDetailsBtn: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  photoDetailsBtnPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  photoDetailsBtnSecondary: {
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    color: '#8B1E3F',
  },
};

// Mock professional ID
const professionalId = 'pro-456';

const placeholderWorkImages = [];

// Mock gallery data
const initialPhotos = [
  {
    id: 1,
    service: 'Balayage',
    category: 'color',
    date: 'Dec 4, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:color', 'service:highlights', 'hair:length:long', 'hair:color:blonde', 'metadata:before', 'metadata:after', 'metadata:rated_5'],
  },
  {
    id: 2,
    service: 'Precision Cut',
    category: 'haircuts',
    date: 'Dec 3, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:haircut', 'hair:length:medium', 'hair:texture:straight', 'metadata:before', 'metadata:after', 'metadata:rated_5'],
  },
  {
    id: 3,
    service: 'Blowout',
    category: 'blowouts',
    date: 'Dec 2, 2024',
    rating: 4,
    hasBefore: false,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:blowdry', 'hair:length:long', 'metadata:after', 'metadata:rated_4'],
  },
  {
    id: 4,
    service: 'Rich Brunette Gloss',
    category: 'color',
    date: 'Nov 28, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:color', 'hair:color:brunette', 'hair:length:medium', 'metadata:before', 'metadata:after'],
  },
  {
    id: 5,
    service: 'Lived-In Highlight',
    category: 'color',
    date: 'Nov 20, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:highlights', 'hair:length:long', 'hair:texture:wavy', 'metadata:before', 'metadata:after'],
  },
  {
    id: 6,
    service: 'Bob Transformation',
    category: 'haircuts',
    date: 'Nov 15, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:haircut', 'hair:length:short', 'metadata:before', 'metadata:after'],
  },
  {
    id: 7,
    service: 'Editorial Updo',
    category: 'blowouts',
    date: 'Nov 10, 2024',
    rating: 5,
    hasBefore: false,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:blowdry', 'service:style', 'hair:length:long', 'metadata:after'],
  },
  {
    id: 8,
    service: 'Sleek Blowout',
    category: 'blowouts',
    date: 'Nov 5, 2024',
    rating: 4,
    hasBefore: false,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:blowdry', 'hair:length:medium', 'metadata:after'],
  },
  {
    id: 9,
    service: 'Face-Framing Layers',
    category: 'haircuts',
    date: 'Nov 1, 2024',
    rating: 5,
    hasBefore: true,
    hasAfter: true,
    url: null,
    appointmentImages: [],
    tags: ['service:haircut', 'hair:length:long', 'metadata:before', 'metadata:after'],
  },
];

// Mock feedback data
const recentFeedback = [
  {
    id: 1,
    service: 'Balayage',
    date: 'Dec 4, 2024',
    rating: 5,
    comment: 'Amazing attention to detail! The color came out exactly how I wanted. Very gentle with my hair and explained everything along the way.',
    thumbnail: null,
  },
  {
    id: 2,
    service: 'Blowout',
    date: 'Dec 2, 2024',
    rating: 5,
    comment: 'Super fast and the volume lasted all day! Would definitely book again.',
    thumbnail: null,
  },
  {
    id: 3,
    service: 'Highlights',
    date: 'Nov 28, 2024',
    rating: 4,
    comment: 'Great results overall. Took a bit longer than expected but the outcome was worth it.',
    thumbnail: null,
  },
];

export default function ProPortfolioConsolidated() {
  const [activeTab, setActiveTab] = useState('work'); // 'work', 'inspo', 'feedback'
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [photos, setPhotos] = useState(initialPhotos);
  const [colorPhotos, setColorPhotos] = useState([]);
  const [haircutPhotos, setHaircutPhotos] = useState([]);
  const [blowoutPhotos, setBlowoutPhotos] = useState([]);
  const [portfolioUrls, setPortfolioUrls] = useState([]);
  const [hoveredPhoto, setHoveredPhoto] = useState(null); // Photo being hovered
  const [professionalId, setProfessionalId] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Item selected for detail view
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const { user } = useAuthenticator();
  
  // Load professional ID
  useEffect(() => {
    const loadProfessionalId = async () => {
      try {
        // Try database first
        if (!shouldUseMockData() && client && client.models) {
      try {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: user?.userId } },
        });
        if (professionals && professionals.length > 0) {
          setProfessionalId(professionals[0].id);
              return;
            }
          } catch (dbError) {
            console.error('Database error, falling back to mock data:', dbError);
          }
        }
        
        // Use mock data
        const mockPro = getMockProfessionalByUserId(user?.userId);
        if (mockPro) {
          setProfessionalId(mockPro.id);
        }
      } catch (error) {
        console.error('Error loading professional:', error);
      }
    };
    
    if (user?.userId) {
      loadProfessionalId();
    }
  }, [user]);

  const extractKeyFromUrl = (url) => {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const path = decodeURIComponent(parsed.pathname || '');
      const publicIndex = path.indexOf('/public/');
      if (publicIndex !== -1) return path.slice(publicIndex + 8);
      return path.startsWith('/') ? path.slice(1) : path;
    } catch (error) {
      return null;
    }
  };

  const inferTrainingFocus = (value) => {
    const candidate = String(value || '').toLowerCase();
    if (candidate.includes('color-')) return 'color';
    if (candidate.includes('haircut-')) return 'haircuts';
    if (candidate.includes('blowout-')) return 'blowouts';
    return 'portfolio';
  };

  const buildPortfolioPhoto = ({ url, key, trainingFocus }) => {
    const focus = trainingFocus || inferTrainingFocus(key || url);
    const focusConfig = {
      color: {
        service: 'Color Work',
        icon: '🎨',
        tags: ['service:color', 'metadata:after', 'metadata:uploaded'],
      },
      haircuts: {
        service: 'Haircut',
        icon: '✂️',
        tags: ['service:haircut', 'metadata:after', 'metadata:uploaded'],
      },
      blowouts: {
        service: 'Blowout',
        icon: '💨',
        tags: ['service:blowdry', 'metadata:after', 'metadata:uploaded'],
      },
      portfolio: {
        service: 'Portfolio',
        icon: '✨',
        tags: ['metadata:after', 'metadata:uploaded'],
      },
    };

    const config = focusConfig[focus] || focusConfig.portfolio;
    return {
      id: `${focus}-${Date.now()}-${Math.random()}`,
      url,
      key,
      service: config.service,
      icon: config.icon,
      trainingFocus: focus,
      reviewStatus: 'pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      rating: null,
      hasBefore: false,
      hasAfter: true,
      tags: config.tags,
    };
  };

  const hydratePortfolioFromUrls = (urls) => {
    const normalized = (urls || []).map((url) => {
      const key = extractKeyFromUrl(url);
      return buildPortfolioPhoto({ url, key });
    });

    setPhotos([]);
    setColorPhotos(normalized.filter((item) => item.trainingFocus === 'color'));
    setHaircutPhotos(normalized.filter((item) => item.trainingFocus === 'haircuts'));
    setBlowoutPhotos(normalized.filter((item) => item.trainingFocus === 'blowouts'));
    setPortfolioUrls(urls || []);
  };

  const persistPortfolioUrls = async (nextUrls) => {
    setPortfolioUrls(nextUrls);
    if (shouldUseMockData() || !client?.models?.Professional || !professionalId) return;

    try {
      await client.models.Professional.update({
        id: professionalId,
        portfolioUrls: nextUrls,
      });
    } catch (error) {
      console.error('Error saving portfolio URLs:', error);
    }
  };

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!professionalId) return;
      if (shouldUseMockData() || !client?.models?.Professional) return;

      try {
        const { data: professional } = await client.models.Professional.get({ id: professionalId });
        const urls = professional?.portfolioUrls || [];
        hydratePortfolioFromUrls(urls);
      } catch (error) {
        console.error('Error loading portfolio URLs:', error);
      }
    };

    loadPortfolio();
  }, [professionalId]);
  
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'color' | 'cut' | 'style'

  // Combine all photos for filtered view
  const allPhotos = [
    ...photos,
    ...colorPhotos.map(p => ({ ...p, category: 'color', tags: p.tags || ['service:color'] })),
    ...haircutPhotos.map(p => ({ ...p, category: 'haircuts', tags: p.tags || ['service:haircut'] })),
    ...blowoutPhotos.map(p => ({ ...p, category: 'blowouts', tags: p.tags || ['service:blowdry'] })),
  ];
  
  // Filter photos by selected tags
  const filteredPhotos = allPhotos.filter((p) => {
    if (activeFilter === 'all') return true;
    const tags = p.tags || [];
    if (activeFilter === 'color') {
      return p.category === 'color' || tags.includes('service:color') || tags.includes('service:highlights');
    }
    if (activeFilter === 'cut') {
      return p.category === 'haircuts' || tags.includes('service:haircut');
    }
    if (activeFilter === 'style') {
      return p.category === 'blowouts' || tags.includes('service:blowdry') || tags.includes('service:style');
    }
    return true;
  });

  // Calculate stats
  const stats = {
    total: allPhotos.length,
    color: allPhotos.filter(p => p.category === 'color').length,
    haircuts: allPhotos.filter(p => p.category === 'haircuts').length,
    blowouts: allPhotos.filter(p => p.category === 'blowouts').length,
  };

  // Handle photo uploads by category
  const handleColorUpload = async (results) => {
    const newPhotos = results.map((r) => buildPortfolioPhoto({
      url: r.url,
      key: r.key,
      trainingFocus: 'color',
    }));
    const nextUrls = [...portfolioUrls, ...results.map((r) => r.url)];
    setColorPhotos(prev => [...prev, ...newPhotos]);
    await persistPortfolioUrls(nextUrls);
  };

  const handleHaircutUpload = async (results) => {
    const newPhotos = results.map((r) => buildPortfolioPhoto({
      url: r.url,
      key: r.key,
      trainingFocus: 'haircuts',
    }));
    const nextUrls = [...portfolioUrls, ...results.map((r) => r.url)];
    setHaircutPhotos(prev => [...prev, ...newPhotos]);
    await persistPortfolioUrls(nextUrls);
  };

  const handleBlowoutUpload = async (results) => {
    const newPhotos = results.map((r) => buildPortfolioPhoto({
      url: r.url,
      key: r.key,
      trainingFocus: 'blowouts',
    }));
    const nextUrls = [...portfolioUrls, ...results.map((r) => r.url)];
    setBlowoutPhotos(prev => [...prev, ...newPhotos]);
    await persistPortfolioUrls(nextUrls);
  };

  const handlePortfolioDelete = async (photo) => {
    const url = photo?.url;
    const key = photo?.key || extractKeyFromUrl(url);
    const nextUrls = portfolioUrls.filter((u) => u !== url);

    if (key) {
      try {
        await deleteFile(key);
      } catch (error) {
        console.error('Error deleting portfolio file:', error);
      }
    }

    await persistPortfolioUrls(nextUrls);

    setColorPhotos(prev => prev.filter(p => p.url !== url));
    setHaircutPhotos(prev => prev.filter(p => p.url !== url));
    setBlowoutPhotos(prev => prev.filter(p => p.url !== url));
    setPhotos(prev => prev.filter(p => p.url !== url));
  };
  
  // Tag editing removed for simplified portfolio

  const toggleFlip = () => {};

  const getItemImages = (item) => {
    if (item?.appointmentImages?.length) return item.appointmentImages.filter(Boolean);
    if (item?.url) return [item.url];
    return [];
  };

  const openDetails = (item) => {
    setSelectedPhoto(item);
    setSelectedImageIndex(0);
  };

  const closeDetails = () => {
    setSelectedPhoto(null);
    setSelectedImageIndex(0);
  };
  
  // Tag helpers removed

  const selectedImages = selectedPhoto ? getItemImages(selectedPhoto) : [];
  const activeImage = selectedImages[selectedImageIndex] || selectedImages[0] || null;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.title}>My Work</div>
          <div style={styles.subtitle}>A quick snapshot of what you actually do behind the chair.</div>
        </div>
        {activeTab === 'work' && (
          <button 
            style={styles.uploadBtn}
            onClick={() => setShowUploadSection(!showUploadSection)}
          >
            <span>{showUploadSection ? '−' : '+'}</span> 
            {showUploadSection ? 'Hide Upload' : 'Upload Photos'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { key: 'work', label: 'My Work' },
          { key: 'feedback', label: 'Feedback' },
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...styles.tabShop,
              ...(activeTab === tab.key ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Tab */}
      {activeTab === 'work' && (
        <>
          {/* Filter */}
          <div style={styles.statsRow}>
            <div>
              <span style={styles.filterLabel}>Filter</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'color', label: 'Color' },
                { key: 'cut', label: 'Cut' },
                { key: 'style', label: 'Style' },
              ].map(option => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setActiveFilter(option.key)}
                  style={{
                    ...styles.filterChip,
                    ...(activeFilter === option.key ? styles.filterChipActive : {}),
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9B7B6A', fontFamily: '"Alike", "Georgia", serif' }}>
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} shown
            </div>
          </div>

          {/* Upload Section */}
          {showUploadSection && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                Upload Portfolio Photos
              </div>
              <p style={{ color: '#5A3A2A', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
                Upload session photos to complete in-person training requirements. Instructor review is required before they count toward certification.
              </p>
              <div style={styles.uploadGrid}>
                <PhotoUploader
                  title="Color"
                  subtitle="Balayage, highlights, etc."
                  maxFiles={10}
                  accentColor="#4caf50"
                  existingPhotos={colorPhotos}
                  pathGenerator={(filename) => professionalId ? getPortfolioPath(professionalId, `color-${filename}`) : `portfolios/color-${filename}`}
                  onUpload={handleColorUpload}
                  onDelete={handlePortfolioDelete}
                />
                <PhotoUploader
                  title="Cut"
                  subtitle="Cuts, trims, styles"
                  maxFiles={10}
                  accentColor="#667eea"
                  existingPhotos={haircutPhotos}
                  pathGenerator={(filename) => professionalId ? getPortfolioPath(professionalId, `haircut-${filename}`) : `portfolios/haircut-${filename}`}
                  onUpload={handleHaircutUpload}
                  onDelete={handlePortfolioDelete}
                />
                <PhotoUploader
                  title="Style"
                  subtitle="Styling & blowouts"
                  maxFiles={10}
                  accentColor="#e94560"
                  existingPhotos={blowoutPhotos}
                  pathGenerator={(filename) => professionalId ? getPortfolioPath(professionalId, `blowout-${filename}`) : `portfolios/blowout-${filename}`}
                  onUpload={handleBlowoutUpload}
                  onDelete={handlePortfolioDelete}
                />
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          <div>
            <div style={styles.gallery}>
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map(photo => {
                  return (
                    <div
                      key={photo.id}
                      style={styles.flatCard}
                    >
                      <div style={styles.galleryImage}>
                        <div style={styles.serviceBadge}>{photo.service || 'Service'}</div>
                        {photo.reviewStatus === 'pending' && (
                          <div style={{
                            position: 'absolute',
                            bottom: '0.75rem',
                            left: '0.75rem',
                            background: 'rgba(139, 30, 63, 0.85)',
                            color: '#FFFEF9',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontFamily: '"Alike", "Georgia", serif',
                          }}>
                            Pending instructor review
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}></div>
                  <p>No photos yet. Upload your work above!</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Photo Details Modal */}
      {selectedPhoto && (
        <div style={styles.photoDetailsModal} onClick={closeDetails}>
          <div style={styles.photoDetailsContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.photoDetailsHeader}>
              <div style={styles.photoDetailsTitle}>{selectedPhoto.service || 'Photo Details'}</div>
              <button
                style={styles.photoDetailsClose}
                onClick={closeDetails}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.photoDetailsBody}>
              {activeImage ? (
                <img src={activeImage} alt={selectedPhoto.service} style={styles.detailModalImage} />
              ) : (
                <div style={{...styles.detailModalImage, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'rgba(139, 30, 63, 0.3)'}}>
                  Image
                </div>
              )}

              {selectedImages.length > 1 && (
                <div style={styles.detailStrip}>
                  {selectedImages.map((img, index) => (
                    <img
                      key={`${selectedPhoto.id}-${index}`}
                      src={img}
                      alt={`${selectedPhoto.service || 'Service'} ${index + 1}`}
                      style={{
                        ...styles.detailThumb,
                        ...(index === selectedImageIndex ? styles.detailThumbActive : {}),
                      }}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}

              <div style={styles.photoDetailsInfo}>
                <div style={styles.photoDetailsItem}>
                  <div style={styles.photoDetailsLabel}>Service</div>
                  <div style={styles.photoDetailsValue}>{selectedPhoto.service || 'N/A'}</div>
                </div>
                <div style={styles.photoDetailsItem}>
                  <div style={styles.photoDetailsLabel}>Date</div>
                  <div style={styles.photoDetailsValue}>{selectedPhoto.date || 'N/A'}</div>
                </div>
                <div style={styles.photoDetailsItem}>
                  <div style={styles.photoDetailsLabel}>Model</div>
                  <div style={styles.photoDetailsValue}>{selectedPhoto.modelName || 'Model'}</div>
                </div>
                <div style={styles.photoDetailsItem}>
                  <div style={styles.photoDetailsLabel}>Location</div>
                  <div style={styles.photoDetailsValue}>{selectedPhoto.location || 'Studio'}</div>
                </div>
                {selectedPhoto.rating && (
                  <div style={styles.photoDetailsItem}>
                    <div style={styles.photoDetailsLabel}>Rating</div>
                    <div style={styles.photoDetailsValue}>{selectedPhoto.rating}.0</div>
                  </div>
                )}
              </div>

              {selectedPhoto.description && (
                <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={styles.photoDetailsLabel}>Notes</div>
                  <div style={{...styles.photoDetailsValue, fontWeight: '400', marginTop: '0.5rem'}}>
                    {selectedPhoto.description}
                  </div>
                </div>
              )}

              <div style={styles.photoDetailsActions}>
                {selectedPhoto.bookingId ? (
                  <button
                    style={{...styles.photoDetailsBtn, ...styles.photoDetailsBtnPrimary}}
                    onClick={() => {
                      navigate(`/portal/booked?booking=${selectedPhoto.bookingId}`);
                      closeDetails();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    View Booking
                  </button>
                ) : (
                  <button
                    style={{...styles.photoDetailsBtn, ...styles.photoDetailsBtnPrimary}}
                    onClick={() => {
                      navigate('/portal/matching/create');
                      closeDetails();
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Create Request
                  </button>
                )}
                <button
                  style={{...styles.photoDetailsBtn, ...styles.photoDetailsBtnSecondary}}
                  onClick={closeDetails}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
                    e.currentTarget.style.borderColor = '#8B1E3F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Feedback</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentFeedback.map(feedback => (
              <div key={feedback.id} style={{ ...styles.feedbackItem, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'rgba(139, 30, 63, 0.08)',
                  flexShrink: 0,
                }}>
                  {feedback.thumbnail ? (
                    <img src={feedback.thumbnail} alt={feedback.service} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : null}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.feedbackHeader}>
                    <div>
                      <div style={styles.feedbackService}>{feedback.service}</div>
                      <div style={styles.feedbackDate}>{feedback.date}</div>
                    </div>
                    <div style={styles.feedbackStars}>
                      {'★'.repeat(feedback.rating)}
                      {'☆'.repeat(5 - feedback.rating)}
                    </div>
                  </div>
                  <div style={styles.feedbackText}>"{feedback.comment}"</div>
                  <div style={styles.feedbackAnon}>— Anonymous Model</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

