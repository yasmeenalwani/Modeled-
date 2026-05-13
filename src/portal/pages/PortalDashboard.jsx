import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getBookingsForUser } from '../../utils/bookingService';
import { getProfessionalProfile } from '../../utils/profileService';
import { getTipStats } from '../../utils/tipTracking';
import { getTrainingSummary } from '../data/trainingData';
import { overallRating, totalReviews } from '../data/feedbackData';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  greeting: {
    fontSize: '2rem',
    fontWeight: '300',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  greetingName: {
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Week View Hero Strip
  weekHero: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.12), rgba(168, 90, 90, 0.08))',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 8px 24px rgba(139, 30, 63, 0.15)',
  },
  weekHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  weekTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  notepadButton: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    color: '#8B1E3F',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  notepadButtonActive: {
    background: 'rgba(139, 30, 63, 0.2)',
    transform: 'scale(1.05)',
  },
  todayEarnings: {
    textAlign: 'right',
  },
  todayEarningsLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.25rem',
  },
  todayEarningsValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4caf50',
    fontFamily: '"Alike", "Georgia", serif',
  },
  todaySessions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  weekTasks: {
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.2)',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#FFFEF9',
    borderRadius: '8px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    marginBottom: '0.5rem',
  },
  taskCheckbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer',
  },
  taskText: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  taskPriority: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '14px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(139, 30, 63, 0.08)',
  },
  sessionCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.12)',
    borderColor: 'rgba(139, 30, 63, 0.3)',
  },
  sessionTime: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionService: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionModel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionStatus: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
  },
  sessionActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  sessionActionBtn: {
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Pro Intelligence Widget - Enhanced Design
  proIntelligence: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '1.5rem',
    marginBottom: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.25rem',
    boxShadow: '0 2px 8px rgba(139, 30, 63, 0.08)',
  },
  intelItem: {
    textAlign: 'center',
    cursor: 'pointer',
    padding: '1.25rem',
    borderRadius: '16px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    perspective: '1000px',
    background: 'rgba(139, 30, 63, 0.02)',
    border: '1px solid rgba(139, 30, 63, 0.08)',
    minHeight: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  intelItemHover: {
    background: 'rgba(139, 30, 63, 0.08)',
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(139, 30, 63, 0.15)',
    borderColor: 'rgba(139, 30, 63, 0.2)',
  },
  intelCard: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 0.6s',
  },
  intelCardFlipped: {
    transform: 'rotateY(180deg)',
  },
  intelFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  intelBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    padding: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  intelIcon: {
    fontSize: '1.75rem',
    marginBottom: '0.75rem',
    opacity: 0.8,
  },
  intelValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.2,
  },
  intelLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.5rem',
    fontWeight: '500',
    letterSpacing: '0.01em',
  },
  intelTrend: {
    fontSize: '0.7rem',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
  },
  intelChart: {
    width: '100%',
    padding: '0.5rem',
  },
  chartContainer: {
    height: '80px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: '0.25rem',
    marginTop: '0.5rem',
    padding: '0 0.25rem',
  },
  chartBar: {
    flex: 1,
    background: 'linear-gradient(180deg, rgba(76,175,80,0.6), rgba(76,175,80,0.9))',
    borderRadius: '4px 4px 0 0',
    minHeight: '8px',
    maxHeight: '100%',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  chartBarHover: {
    background: 'linear-gradient(180deg, #4caf50, #2e7d32)',
    transform: 'scaleY(1.05)',
  },
  intelLink: {
    fontSize: '0.7rem',
    color: '#8B1E3F',
    textDecoration: 'none',
    cursor: 'pointer',
    marginTop: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
    opacity: 0.8,
    transition: 'opacity 0.2s ease',
  },
  intelLinkHover: {
    opacity: 1,
    textDecoration: 'underline',
  },
  ratingStar: {
    color: '#ffc107',
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
  },
  ratingDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    marginBottom: '0.25rem',
  },
  
  // Money Tiles
  moneySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  moneyCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  moneyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  moneyTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  moneyValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  moneySub: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  moneyTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.8rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // For You Lane
  forYouSection: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(139, 30, 63, 0.05))',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  forYouTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  forYouItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  forYouItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem',
    background: '#FFFEF9',
    borderRadius: '8px',
    border: '1px solid rgba(102, 126, 234, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  forYouIcon: {
    fontSize: '1.25rem',
  },
  forYouText: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  forYouArrow: {
    color: '#667eea',
    fontSize: '1rem',
  },
  
  // Education Card (split layout) - Enhanced
  educationCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  educationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  educationTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  educationCTA: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  educationSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  educationHalf: {
    padding: '1.5rem',
    background: 'rgba(139, 30, 63, 0.03)',
    borderRadius: '14px',
    border: '1px solid rgba(139, 30, 63, 0.1)',
    transition: 'all 0.2s ease',
  },
  educationHalfHover: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderColor: 'rgba(139, 30, 63, 0.15)',
  },
  educationHalfTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#8B1E3F',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
    letterSpacing: '0.02em',
  },
  educationVideoProgress: {
    marginBottom: '0.75rem',
  },
  educationVideoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  educationCredits: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  educationHours: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  educationHoursLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  trainingTrack: {
    marginBottom: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  trainingTrackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  trainingTrackName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  trainingNextStep: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    marginTop: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Campaigns & Mag
  campaignsCard: {
    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05))',
    border: '2px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  campaignsTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  campaignsCount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#ffc107',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  magBanner: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.15), rgba(168, 90, 90, 0.1))',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  magText: {
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.6,
  },
  
  // Collapsible
  collapsibleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.5rem 0',
  },
  collapseIcon: {
    fontSize: '1.25rem',
    color: '#5A3A2A',
    transition: 'transform 0.2s ease',
  },
  
  // Card - Enhanced
  card: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    letterSpacing: '0.01em',
  },
  
  // Portfolio/Recent Work (5 pics layout) - Enhanced
  portfolioSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  portfolioItem: {
    aspectRatio: '1',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.12), rgba(168, 90, 90, 0.08))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(139, 30, 63, 0.1)',
  },
  portfolioItemHover: {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 8px 20px rgba(139, 30, 63, 0.2)',
    borderColor: 'rgba(139, 30, 63, 0.3)',
  },
  portfolioItemHighlight: {
    border: '2px solid #ffc107',
    boxShadow: '0 0 0 3px rgba(255, 193, 7, 0.2), 0 4px 12px rgba(139, 30, 63, 0.15)',
  },
  portfolioItemImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  portfolioPlaceholder: {
    fontSize: '2rem',
    opacity: 0.3,
    color: '#8B1E3F',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    background: 'linear-gradient(to top, rgba(74, 42, 26, 0.95) 0%, rgba(74, 42, 26, 0.8) 70%, transparent 100%)',
    padding: '0.75rem 0.5rem 0.5rem',
    fontSize: '0.7rem',
    color: '#FFFEF9',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '500',
  },
  portfolioBadge: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    background: 'rgba(255, 193, 7, 0.95)',
    color: '#4A2A1A',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '0.2rem 0.4rem',
    borderRadius: '4px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  portfolioActions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  
  // Quick Actions
  quickActions: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    zIndex: 1000,
  },
  quickActionBtn: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    color: '#FFFEF9',
    fontSize: '1.5rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  quickActionLabel: {
    position: 'absolute',
    right: '70px',
    background: 'rgba(74, 42, 26, 0.95)',
    color: '#FFFEF9',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Loading States
  skeleton: {
    background: 'linear-gradient(90deg, rgba(139, 30, 63, 0.1) 25%, rgba(139, 30, 63, 0.2) 50%, rgba(139, 30, 63, 0.1) 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '8px',
  },
  
  // Empty States
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyStateIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyStateText: {
    fontSize: '0.95rem',
    marginBottom: '1.5rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyStateAction: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  
  // Onboarding Banner
  onboardingBanner: {
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(139, 30, 63, 0.1))',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    position: 'relative',
  },
  onboardingClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    background: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#5A3A2A',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s ease',
  },
  onboardingTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  onboardingSteps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  onboardingStep: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: '#FFFEF9',
    borderRadius: '8px',
    border: '1px solid rgba(102, 126, 234, 0.2)',
  },
  onboardingStepCheck: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: '#4caf50',
    color: '#FFFEF9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    flexShrink: 0,
  },
  onboardingStepPending: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '2px solid rgba(102, 126, 234, 0.3)',
    flexShrink: 0,
  },
  onboardingStepText: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  onboardingStepAction: {
    padding: '0.5rem 1rem',
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '6px',
    color: '#667eea',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
};

const portfolioPics = [
  { id: 1, date: 'Jan 10', service: 'Balayage', highlighted: true },
  { id: 2, date: 'Jan 8', service: 'Cut', highlighted: false },
  { id: 3, date: 'Jan 5', service: 'Blowout', highlighted: true },
  { id: 4, date: 'Jan 3', service: 'Highlights', highlighted: false },
  { id: 5, date: 'Dec 30', service: 'Color', highlighted: false },
];

const forYouItems = [
  { icon: '🎯', text: '2 campaigns match your skills this week → View', action: 'campaigns' },
  { icon: '📧', text: '3 clients have no rebook yet → Send follow-up', action: 'followup' },
  { icon: '📸', text: 'Add 2 photos to your portfolio to qualify for Modeled Mag', action: 'portfolio' },
];

const campaigns = {
  open: 2,
  highlighted: 'Holiday Styling Event',
};

const magEligibility = {
  close: true,
  action: 'complete 2 more portfolio photos',
};

const parseDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateShort = (date) => (
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
);

const isConfirmedBooking = (booking) => {
  const status = String(booking?.status || '').toLowerCase();
  return status === 'confirmed' || status === 'completed';
};

const getWeekRange = (date = new Date()) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
};

export default function PortalDashboard() {
  const { user } = useAuthenticator((context) => [context.user]);
  const navigate = useNavigate();
  const [trainingExpanded, setTrainingExpanded] = useState(true);
  const [recentWorkExpanded, setRecentWorkExpanded] = useState(true);
  const [loading, setLoading] = useState(false); // Start as false to show content immediately
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hoveredQuickAction, setHoveredQuickAction] = useState(null);
  const [flippedMetrics, setFlippedMetrics] = useState({}); // Track which metric cards are flipped
  const [showTasks, setShowTasks] = useState(false); // Toggle tasks view
  const [hoveredMetric, setHoveredMetric] = useState(null); // Track hovered metric for better UX
  const [tipStats, setTipStats] = useState({ totalTips: 0, totalFees: 0, byMethod: {} });
  const [dashboardData, setDashboardData] = useState({
    currentUser: {
      firstName: 'Professional',
      trainingProgress: {},
      totalTrainingHours: 0,
      videoCredits: 0,
      handsOnHours: 0,
      rating: overallRating,
      totalReviews,
      tipsThisMonth: 0,
      totalEarningsThisMonth: 0,
      earningsLastMonth: 0,
      sessionsThisMonth: 0,
      sessionsLastMonth: 0,
      learningScore: 0,
      tipSourceLabel: 'STRIPE',
    },
    weekSessionsData: [],
    todayTasks: [],
  });
  
  // Simulate loading (disabled for now to show content)
  // useEffect(() => {
  //   const timer = setTimeout(() => setLoading(false), 1000);
  //   return () => clearTimeout(timer);
  // }, []);
  
  // Check if new user (show onboarding)
  useEffect(() => {
    const isNewUser = !localStorage.getItem('dashboardOnboardingDismissed');
    const hasCompletedProfile = true; // Would check actual profile completion
    if (isNewUser && !hasCompletedProfile) {
      setShowOnboarding(true);
    }
  }, []);
  
  const onboardingSteps = [
    { id: 1, text: 'Complete your Pro Card', completed: false, action: () => navigate('/portal/profile') },
    { id: 2, text: 'Upload portfolio photos', completed: false, action: () => navigate('/portal/portfolio') },
    { id: 3, text: 'Create your first model request', completed: false, action: () => navigate('/portal/request') },
  ];
  
  const quickActions = [
    { icon: '+', label: 'Request Model', action: () => navigate('/portal/matching') },
    { icon: '📅', label: 'View Calendar', action: () => navigate('/portal/calendar') },
    { icon: '💬', label: 'Messages', action: () => navigate('/portal/chat') },
  ];
  
  // Skeleton Loader Component
  const SkeletonCard = ({ height = '120px' }) => (
    <div className="skeleton-loader" style={{ ...styles.skeleton, height, marginBottom: '1rem' }} />
  );
  
  // Empty State Component
  const EmptyState = ({ icon, title, text, actionLabel, onAction }) => (
    <div style={styles.emptyState}>
      <div style={styles.emptyStateIcon}>{icon}</div>
      <div style={styles.emptyStateTitle}>{title}</div>
      <div style={styles.emptyStateText}>{text}</div>
      {actionLabel && (
        <button
          style={styles.emptyStateAction}
          onClick={onAction}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
  
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.userId) return;
      const professional = await getProfessionalProfile(user.userId);
      const professionalId = professional?.id || 'mock-pro-1';
      const bookings = await getBookingsForUser(user.userId, 'professional');
      const confirmedBookings = bookings.filter(isConfirmedBooking);
      const { trainingProgress, totalCompleted, totalHours, videoCredits, handsOnHours, learningScore } = getTrainingSummary();
      const { start, end } = getWeekRange(new Date());

      const weekSessionsData = confirmedBookings
        .map((booking) => {
          const appointmentDate = parseDate(booking.appointmentDate);
          if (!appointmentDate) return null;
          if (appointmentDate < start || appointmentDate > end) return null;
          const statusValue = String(booking.status || 'confirmed').toLowerCase();
          const statusLabel = statusValue === 'completed' ? 'completed' : 'confirmed';
          return {
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][appointmentDate.getDay()],
            date: formatDateShort(appointmentDate),
            time: booking.appointmentTime,
            service: booking.serviceDescription || booking.serviceType || 'Session',
            model: booking.modelName || 'Model',
            status: statusLabel,
            statusColor: '#4caf50',
            statusBg: 'rgba(76,175,80,0.2)',
          };
        })
        .filter(Boolean);

      const todayTasks = weekSessionsData.slice(0, 3).map((session, index) => ({
        id: index + 1,
        text: `Prepare for ${session.service} with ${session.model}.`,
        priority: index === 0 ? 'high' : 'medium',
      }));

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const inMonth = (date, month, year) => (
        date && date.getMonth() === month && date.getFullYear() === year
      );

      const bookingsThisMonth = confirmedBookings.filter((booking) => {
        const appointmentDate = parseDate(booking.appointmentDate);
        return inMonth(appointmentDate, currentMonth, currentYear);
      });

      const bookingsLastMonth = confirmedBookings.filter((booking) => {
        const appointmentDate = parseDate(booking.appointmentDate);
        return inMonth(appointmentDate, lastMonth, lastMonthYear);
      });

      const baseEarningsThisMonth = bookingsThisMonth.reduce((sum, booking) => sum + (booking.modelFee || 0), 0);
      const baseEarningsLastMonth = bookingsLastMonth.reduce((sum, booking) => sum + (booking.modelFee || 0), 0);

      let latestTipStats = tipStats;
      try {
        latestTipStats = await getTipStats(professionalId, {
          startDate: new Date(currentYear, currentMonth, 1).toISOString(),
          endDate: new Date(currentYear, currentMonth + 1, 0).toISOString(),
        });
        setTipStats(latestTipStats);
      } catch (error) {
        latestTipStats = tipStats;
      }

      const tipsThisMonth = latestTipStats?.totalTips || 0;
      const totalEarningsThisMonth = baseEarningsThisMonth + tipsThisMonth;
      const tipSources = latestTipStats?.byMethod
        ? Object.entries(latestTipStats.byMethod)
          .filter(([, stats]) => (stats?.total || 0) > 0)
          .map(([method]) => method.toUpperCase())
        : [];
      const tipSourceLabel = tipSources.length > 0 ? tipSources.join(', ') : 'STRIPE';

      setDashboardData({
        currentUser: {
          firstName: professional?.firstName || 'Professional',
          trainingProgress,
          totalTrainingHours: totalCompleted,
          videoCredits,
          handsOnHours,
          rating: overallRating,
          totalReviews,
          tipsThisMonth,
          totalEarningsThisMonth,
          earningsLastMonth: baseEarningsLastMonth,
          sessionsThisMonth: bookingsThisMonth.length,
          sessionsLastMonth: bookingsLastMonth.length,
          learningScore,
          tipSourceLabel,
        },
        weekSessionsData,
        todayTasks,
      });
    };

    loadDashboardData();
  }, [user?.userId]);

  const { currentUser, weekSessionsData, todayTasks } = dashboardData;
  const totalHours = Math.max(800, currentUser.totalTrainingHours);
  const trainingPct = totalHours > 0 ? Math.round((currentUser.totalTrainingHours / totalHours) * 100) : 0;
  const earningsChange = currentUser.earningsLastMonth > 0
    ? ((currentUser.totalEarningsThisMonth - currentUser.earningsLastMonth) / currentUser.earningsLastMonth * 100).toFixed(0)
    : '0';
  
  // Helper to toggle metric card flip
  const toggleMetricFlip = (metricKey) => {
    setFlippedMetrics(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }));
  };

  // Helper to render star rating
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <span style={styles.ratingStar}>
        {'★'.repeat(fullStars)}{hasHalfStar ? '½' : ''}{'☆'.repeat(emptyStars)}
      </span>
    );
  };

  // Earnings chart data (last 7 days) - normalized for display
  const earningsChartData = [
    { day: 'Mon', value: 120, max: 210 },
    { day: 'Tue', value: 180, max: 210 },
    { day: 'Wed', value: 150, max: 210 },
    { day: 'Thu', value: 210, max: 210 },
    { day: 'Fri', value: 175, max: 210 },
    { day: 'Sat', value: 85, max: 210 },
    { day: 'Sun', value: 95, max: 210 },
  ];

  return (
    <div style={styles.container}>
      {/* Onboarding Banner */}
      {showOnboarding && (
        <div style={styles.onboardingBanner}>
          <button
            style={styles.onboardingClose}
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('dashboardOnboardingDismissed', 'true');
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 30, 63, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            ×
          </button>
          <div style={styles.onboardingTitle}>Welcome to Modeled! Let's get you started</div>
          <div style={{ fontSize: '0.9rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
            Complete these steps to unlock all features and start booking models
          </div>
          <div style={styles.onboardingSteps}>
            {onboardingSteps.map((step) => (
              <div key={step.id} style={styles.onboardingStep}>
                {step.completed ? (
                  <div style={styles.onboardingStepCheck}>✓</div>
                ) : (
                  <div style={styles.onboardingStepPending} />
                )}
                <div style={styles.onboardingStepText}>{step.text}</div>
                {!step.completed && (
                  <button
                    style={styles.onboardingStepAction}
                    onClick={step.action}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                      e.currentTarget.style.borderColor = '#667eea';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                    }}
                  >
                    Get Started →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN METRICS AT TOP - Clickable with flip functionality */}
      {loading ? (
        <div style={styles.proIntelligence}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={styles.intelItem}>
              <SkeletonCard height="80px" />
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.proIntelligence}>
          {/* Earnings - Clickable, flips to show chart */}
          <div 
            style={styles.intelItem}
            onClick={() => toggleMetricFlip('earnings')}
            onMouseEnter={(e) => {
              if (!flippedMetrics.earnings) {
                e.currentTarget.style.background = styles.intelItemHover.background;
                e.currentTarget.style.transform = styles.intelItemHover.transform;
                e.currentTarget.style.boxShadow = styles.intelItemHover.boxShadow;
                e.currentTarget.style.borderColor = styles.intelItemHover.borderColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!flippedMetrics.earnings) {
                e.currentTarget.style.background = 'rgba(139, 30, 63, 0.02)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.08)';
              }
            }}
          >
            <div style={{
              ...styles.intelCard,
              ...(flippedMetrics.earnings ? styles.intelCardFlipped : {})
            }}>
              <div style={styles.intelFront}>
                <div style={{ ...styles.intelValue, color: '#4caf50' }}>${currentUser.totalEarningsThisMonth}</div>
                <div style={styles.intelLabel}>Earnings (MTD)</div>
                <div style={{ fontSize: '0.65rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                  Tips tracked via {currentUser.tipSourceLabel}. Payments settle after session completion.
                </div>
                <div style={{ ...styles.intelTrend, color: '#4caf50' }}>↑ {earningsChange}%</div>
                <div style={styles.intelLink} onClick={(e) => { e.stopPropagation(); navigate('/portal/earnings'); }}>View Details →</div>
              </div>
              <div style={styles.intelBack}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.75rem', fontFamily: '"Alike", "Georgia", serif' }}>
                  Last 7 Days
                </div>
                <div style={styles.chartContainer}>
                  {earningsChartData.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        ...styles.chartBar,
                        height: `${Math.max((item.value / item.max) * 100, 15)}%`,
                      }}
                      title={`${item.day}: $${item.value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(180deg, #4caf50, #2e7d32)';
                        e.currentTarget.style.transform = 'scaleY(1.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(180deg, rgba(76,175,80,0.6), rgba(76,175,80,0.9))';
                        e.currentTarget.style.transform = 'scaleY(1)';
                      }}
                    />
                  ))}
                </div>
                <div style={{ 
                  fontSize: '0.65rem', 
                  color: '#5A3A2A', 
                  marginTop: '0.5rem', 
                  fontFamily: '"Alike", "Georgia", serif', 
                  display: 'flex', 
                  justifyContent: 'space-around',
                  fontWeight: '500',
                }}>
                  {earningsChartData.map((item, idx) => (
                    <span key={idx} style={{ fontSize: '0.6rem', minWidth: '24px', textAlign: 'center' }}>{item.day}</span>
                  ))}
                </div>
                <div style={{ ...styles.intelLink, marginTop: '0.75rem' }} onClick={(e) => { e.stopPropagation(); navigate('/portal/earnings'); }}>
                  View Full Analytics →
                </div>
                <div style={{ ...styles.intelLink, fontSize: '0.65rem', marginTop: '0.5rem' }} onClick={(e) => { e.stopPropagation(); toggleMetricFlip('earnings'); }}>
                  ← Back
                </div>
              </div>
            </div>
          </div>

          {/* Sessions - Clickable, links to sessions list (completed sessions) */}
          <div 
            style={styles.intelItem}
            onClick={() => navigate('/portal/calendar?view=completed')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.intelItemHover.background;
              e.currentTarget.style.transform = styles.intelItemHover.transform;
              e.currentTarget.style.boxShadow = styles.intelItemHover.boxShadow;
              e.currentTarget.style.borderColor = styles.intelItemHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.02)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.08)';
            }}
          >
            <div style={{ ...styles.intelValue, color: '#8B1E3F' }}>{Math.round(currentUser.sessionsThisMonth)}</div>
            <div style={styles.intelLabel}>Sessions</div>
            <div style={{ ...styles.intelLink, marginTop: '0.5rem' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              View Completed →
            </div>
          </div>

          {/* Rating - Clickable, links to feedback queue */}
          <div 
            style={styles.intelItem}
            onClick={() => navigate('/portal/feedback')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.intelItemHover.background;
              e.currentTarget.style.transform = styles.intelItemHover.transform;
              e.currentTarget.style.boxShadow = styles.intelItemHover.boxShadow;
              e.currentTarget.style.borderColor = styles.intelItemHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.02)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.08)';
            }}
          >
            <div style={{ ...styles.intelValue, color: '#ffc107', marginBottom: '0.25rem' }}>
              {currentUser.rating}
            </div>
            <div style={styles.ratingDisplay}>
              {renderStars(currentUser.rating)}
            </div>
            <div style={styles.intelLabel}>Rating ({currentUser.totalReviews})</div>
            <div style={{ ...styles.intelLink, marginTop: '0.5rem' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              View Feedback →
            </div>
          </div>

          {/* Learning Score - Clickable, links to education */}
          <div 
            style={styles.intelItem}
            onClick={() => navigate('/portal/education')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.intelItemHover.background;
              e.currentTarget.style.transform = styles.intelItemHover.transform;
              e.currentTarget.style.boxShadow = styles.intelItemHover.boxShadow;
              e.currentTarget.style.borderColor = styles.intelItemHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.02)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.08)';
            }}
          >
            <div style={{ ...styles.intelValue, color: '#667eea' }}>{currentUser.learningScore}</div>
            <div style={styles.intelLabel}>Learning Score</div>
            <div style={{ ...styles.intelLink, marginTop: '0.5rem' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
            >
              View Education →
            </div>
          </div>
        </div>
      )}

      {/* WEEK VIEW - Appointments + Notepad Tasks */}
      <div style={styles.weekHero}>
        <div style={styles.weekHeader}>
          <div style={styles.weekTitle}>This Week</div>
          <button
            style={{
              ...styles.notepadButton,
              ...(showTasks ? styles.notepadButtonActive : {})
            }}
            onClick={() => setShowTasks(!showTasks)}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Tasks"
          >
            📝
          </button>
        </div>
        
        <div style={styles.todaySessions}>
          {loading ? (
            <>
              <SkeletonCard height="180px" />
              <SkeletonCard height="180px" />
            </>
          ) : weekSessionsData.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No sessions this week"
              text="Create a model request to book your next session."
              actionLabel="Request a Model"
              onAction={() => navigate('/portal/matching')}
            />
          ) : (
            weekSessionsData.map((session, i) => (
              <div 
                key={i} 
                style={styles.sessionCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = styles.sessionCardHover.transform;
                  e.currentTarget.style.boxShadow = styles.sessionCardHover.boxShadow;
                  e.currentTarget.style.borderColor = styles.sessionCardHover.borderColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(139, 30, 63, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.2)';
                }}
              >
              <div style={{ 
                fontSize: '0.7rem', 
                color: '#5A3A2A', 
                marginBottom: '0.5rem', 
                fontFamily: '"Alike", "Georgia", serif',
                fontWeight: '600',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}>
                {session.day} • {session.date}
              </div>
              <div style={styles.sessionTime}>{session.time}</div>
              <div style={styles.sessionService}>{session.service}</div>
              <div style={styles.sessionModel}>with {session.model}</div>
              <div style={{
                ...styles.sessionStatus,
                background: session.statusBg,
                color: session.statusColor,
                marginBottom: '1rem',
              }}>
                {session.status === 'confirmed' ? 'Confirmed' : session.status === 'needs_confirm' ? 'Needs Confirm' : 'Pending'}
              </div>
              <div style={styles.sessionActions}>
                {session.status === 'needs_confirm' && (
                  <button 
                    style={{
                      ...styles.sessionActionBtn,
                      background: '#4caf50',
                      color: '#FFFEF9',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#45a049'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#4caf50'}
                  >
                    Confirm
                  </button>
                )}
                <button 
                  style={{
                    ...styles.sessionActionBtn,
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                  }}
                  onClick={(e) => { e.stopPropagation(); navigate('/portal/chat'); }}
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                >
                  Message
                </button>
                {session.status === 'confirmed' && (
                  <button 
                    style={{
                      ...styles.sessionActionBtn,
                      background: 'rgba(76, 175, 80, 0.1)',
                      color: '#4caf50',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)'}
                  >
                    Complete
                  </button>
                )}
              </div>
              </div>
            ))
          )}
        </div>
        
        {/* Tasks Section - Only shown when notepad clicked */}
        {showTasks && (
          <div style={styles.weekTasks}>
            {todayTasks.length === 0 ? (
              <EmptyState
                icon="✅"
                title="All caught up!"
                text="You have no pending tasks."
              />
            ) : (
              todayTasks.map((task) => (
                <div key={task.id} style={styles.taskItem}>
                <input 
                  type="checkbox" 
                  style={styles.taskCheckbox}
                />
                <div style={styles.taskText}>{task.text}</div>
                <div style={{
                  ...styles.taskPriority,
                  background: task.priority === 'high' 
                    ? 'rgba(248, 81, 73, 0.2)' 
                    : task.priority === 'medium'
                    ? 'rgba(255, 193, 7, 0.2)'
                    : 'rgba(139, 30, 63, 0.1)',
                  color: task.priority === 'high'
                    ? '#f85149'
                    : task.priority === 'medium'
                    ? '#ffc107'
                    : '#8B1E3F',
                }}>
                  {task.priority.toUpperCase()}
                </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* EDUCATION - Split Layout: Videos/Courses & Hands-On Training */}
      <div style={styles.educationCard}>
        <div style={styles.educationHeader}>
          <div style={styles.educationTitle}>Education</div>
          <button 
            style={styles.educationCTA}
            onClick={() => navigate('/portal/education')}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Continue Learning
          </button>
        </div>
        
        <div style={styles.educationSplit}>
          {/* Left Half: Videos/Courses & Credits */}
          <div 
            style={styles.educationHalf}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.educationHalfHover.background;
              e.currentTarget.style.borderColor = styles.educationHalfHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.1)';
            }}
          >
            <div style={styles.educationHalfTitle}>Videos & Courses</div>
            <div style={styles.educationVideoProgress}>
              {Object.entries(currentUser.trainingProgress).map(([key, progress]) => {
                const pct = Math.round((progress.completed / progress.total) * 100);
                const icons = {
                  blowouts: 'Blowouts',
                  haircuts: 'Haircuts',
                  color: 'Color',
                };
                const colors = {
                  blowouts: '#8B1E3F',
                  haircuts: '#D4858A',
                  color: '#4caf50',
                };
                return (
                  <div key={key} style={{ marginBottom: '1rem' }}>
                    <div style={{ ...styles.educationVideoItem, marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{icons[key]}</span>
                      <span style={{ fontWeight: '700', color: colors[key], fontSize: '0.95rem' }}>{pct}%</span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(139, 30, 63, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginBottom: '0.25rem',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${colors[key]}, ${colors[key]}dd)`,
                        transition: 'width 0.5s ease',
                        borderRadius: '4px',
                      }} />
                    </div>
                    {progress.certified && (
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: '#4caf50', 
                        marginTop: '0.25rem', 
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                      }}>
                        CERTIFIED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: '1.25rem',
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(139, 30, 63, 0.03))',
              borderRadius: '10px',
              border: '1px solid rgba(139, 30, 63, 0.12)',
            }}>
              <div style={styles.educationCredits}>{currentUser.videoCredits} Credits</div>
              <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif', fontWeight: '500' }}>
                {Object.values(currentUser.trainingProgress).filter(p => p.certified).length} Certifications Earned
              </div>
            </div>
          </div>

          {/* Right Half: Hands-On Model Training Hours */}
          <div 
            style={styles.educationHalf}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.educationHalfHover.background;
              e.currentTarget.style.borderColor = styles.educationHalfHover.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.1)';
            }}
          >
            <div style={styles.educationHalfTitle}>Hands-On Training</div>
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(139, 30, 63, 0.03))',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <div style={styles.educationHours}>{currentUser.handsOnHours}h</div>
              <div style={styles.educationHoursLabel}>Model Training Hours</div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
              {Object.entries(currentUser.trainingProgress).map(([key, progress]) => {
                const colors = {
                  blowouts: '#8B1E3F',
                  haircuts: '#D4858A',
                  color: '#4caf50',
                };
                const pct = Math.round((progress.completed / progress.total) * 100);
                return (
                  <div key={key} style={{ ...styles.trainingTrack, marginBottom: '1rem' }}>
                    <div style={styles.trainingTrackHeader}>
                      <div style={{ ...styles.trainingTrackName, fontSize: '0.9rem' }}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                        {progress.certified && (
                          <span style={{
                            marginLeft: '0.5rem',
                            background: 'rgba(76,175,80,0.2)',
                            color: '#4caf50',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            letterSpacing: '0.05em',
                          }}>
                            CERTIFIED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif', fontWeight: '600' }}>
                        {progress.completed}/{progress.total}h
                      </div>
                    </div>
                    <div style={{
                      height: '8px',
                      background: 'rgba(139, 30, 63, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      marginTop: '0.5rem',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${colors[key]}, ${colors[key]}dd)`,
                        transition: 'width 0.5s ease',
                        borderRadius: '4px',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PORTFOLIO / RECENT WORK - Latest 5 Pics */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <span>Portfolio & Work</span>
        </div>
        <div style={styles.portfolioSection}>
          {portfolioPics.map((pic) => (
            <div 
              key={pic.id}
              style={{
                ...styles.portfolioItem,
                ...(pic.highlighted ? styles.portfolioItemHighlight : {}),
              }}
              onClick={() => navigate('/portal/portfolio')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = styles.portfolioItemHover.transform;
                e.currentTarget.style.boxShadow = styles.portfolioItemHover.boxShadow;
                e.currentTarget.style.borderColor = styles.portfolioItemHover.borderColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = pic.highlighted 
                  ? '0 0 0 3px rgba(255, 193, 7, 0.2), 0 4px 12px rgba(139, 30, 63, 0.15)'
                  : '0 2px 8px rgba(139, 30, 63, 0.1)';
                e.currentTarget.style.borderColor = pic.highlighted 
                  ? '#ffc107'
                  : 'rgba(139, 30, 63, 0.15)';
              }}
            >
              {/* Placeholder for image - would use actual image URL */}
              <div style={styles.portfolioPlaceholder}>
                {pic.service.charAt(0)}
              </div>
              {pic.highlighted && (
                <div style={styles.portfolioBadge}>Featured</div>
              )}
              <div style={styles.portfolioOverlay}>
                {pic.date}
                <br />
                <strong>{pic.service}</strong>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.portfolioActions}>
          <button 
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(139, 30, 63, 0.3)',
              borderRadius: '8px',
              color: '#8B1E3F',
              fontFamily: '"Alike", "Georgia", serif',
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginRight: '0.5rem',
            }}
            onClick={() => navigate('/portal/portfolio')}
          >
            View All →
          </button>
          <button 
            style={{
              padding: '0.5rem 1.5rem',
              background: 'rgba(139, 30, 63, 0.1)',
              border: '1px solid rgba(139, 30, 63, 0.3)',
              borderRadius: '8px',
              color: '#8B1E3F',
              fontFamily: '"Alike", "Georgia", serif',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/portal/portfolio?add=true')}
          >
            Add Photo
          </button>
        </div>
      </div>

      {/* CAMPAIGNS AND MARKETING - Moved to Bottom */}
      <div style={styles.campaignsCard}>
        <div style={styles.campaignsTitle}>Campaigns & Marketing</div>
        <div style={styles.campaignsCount}>{campaigns.open} Open Campaigns</div>
        <div style={{ fontSize: '0.9rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif', marginBottom: '0.75rem' }}>
          Highlighted: <strong>{campaigns.highlighted}</strong>
        </div>
        {magEligibility.close && (
          <div style={{
            padding: '0.75rem',
            background: 'rgba(139, 30, 63, 0.1)',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            fontSize: '0.85rem',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            <strong>Modeled Mag:</strong> {magEligibility.action} to qualify.
          </div>
        )}
        <button 
          style={{
            marginTop: '0.5rem',
            padding: '0.6rem 1.25rem',
            background: 'rgba(255, 193, 7, 0.2)',
            border: '1px solid rgba(255, 193, 7, 0.4)',
            borderRadius: '8px',
            color: '#4A2A1A',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: '"Alike", "Georgia", serif',
          }}
          onClick={() => navigate('/portal/campaigns')}
        >
          View Campaigns →
        </button>
      </div>

      {/* Quick Actions FAB */}
      <div style={styles.quickActions}>
        {quickActions.map((action, index) => (
          <div
            key={index}
            style={{ position: 'relative' }}
            onMouseEnter={() => setHoveredQuickAction(index)}
            onMouseLeave={() => setHoveredQuickAction(null)}
          >
            <button
              style={{
                ...styles.quickActionBtn,
                transform: hoveredQuickAction === index ? 'scale(1.1)' : 'scale(1)',
                boxShadow: hoveredQuickAction === index
                  ? '0 6px 20px rgba(139, 30, 63, 0.4)'
                  : '0 4px 12px rgba(139, 30, 63, 0.3)',
              }}
              onClick={action.action}
              title={action.label}
            >
              {action.icon}
            </button>
            {hoveredQuickAction === index && (
              <div style={{ ...styles.quickActionLabel, opacity: 1 }}>
                {action.label}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
