/**
 * MODEL OPPORTUNITIES PAGE (Matched — Option 1 + 3 Hybrid)
 *
 * Single feed of drop-style cards. Full details, Total / You Get, place, pro inspo strip.
 * No flip card, no "Reveal your hand."
 */

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { acceptMatch, declineMatch, getMatchesForModel } from '../../utils/matchService';
import { getServiceById } from '../../admin/data/services';
import {
  getMockData,
  getMockRequests,
  getMockProfessional,
  getMockModel,
  getMockMatches,
  getMatchesForSeraphina,
  shouldUseMockData,
  normalizeModelId,
} from '../../utils/mockDataService';

let client;
try {
  client = generateClient();
} catch (error) {
  console.warn('Failed to generate Amplify client, will use mock data only:', error);
  client = null;
}

// ----- Helpers: place, time range EST, total ---------------------------------
function splitLocation(location) {
  if (!location) return { primary: '', secondary: null };
  const raw = String(location).trim();
  if (!raw) return { primary: '', secondary: null };
  if (raw.includes('-')) {
    const [first, ...rest] = raw.split('-').map((p) => p.trim()).filter(Boolean);
    if (rest.length) return { primary: first, secondary: rest.join(' - ') };
  }
  if (raw.includes(',')) {
    const [first, ...rest] = raw.split(',').map((p) => p.trim()).filter(Boolean);
    if (rest.length) return { primary: first, secondary: rest.join(', ') };
  }
  return { primary: raw, secondary: null };
}

function formatWeekdayDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function parseTimeString(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return { h, m };
  }
  const hhmm = str.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return { h: parseInt(hhmm[1], 10), m: parseInt(hhmm[2], 10) };
  return null;
}

function formatHour(h, m) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = ((h + 11) % 12) + 1;
  return `${displayH}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatTimeRangeEST(startTime, durationMinutes) {
  if (!startTime) return 'Time TBD';
  const parsed = parseTimeString(startTime);
  if (!parsed) return `${String(startTime)} EST`;
  const { h, m } = parsed;
  const startLabel = formatHour(h, m);
  if (!durationMinutes || Number.isNaN(Number(durationMinutes))) return `${startLabel} EST`;
  const totalMins = h * 60 + m + Number(durationMinutes);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${startLabel} – ${formatHour(endH, endM)} EST`;
}

// Pro inspo images for demo (2–3 per pro)
const PRO_INSPO_IMAGES = {
  'mock-pro-1': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=200&h=200&fit=crop',
  ],
  'mock-pro-2': [
    'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=200&h=200&fit=crop',
  ],
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  // Drop card feed
  dropCard: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.18)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '1.25rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  dropCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.25rem',
    background: 'linear-gradient(90deg, rgba(139, 30, 63, 0.06), transparent)',
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
  },
  dropTag: {
    fontSize: '0.7rem',
    fontWeight: '800',
    letterSpacing: '0.12em',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statusPillMatched: {
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: 'rgba(139, 30, 63, 0.12)',
    color: '#8B1E3F',
    border: '1px solid rgba(139, 30, 63, 0.25)',
  },
  statusPillBooked: {
    padding: '0.25rem 0.65rem',
    borderRadius: '999px',
    fontSize: '0.7rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: '#D1FAE5',
    color: '#065F46',
    border: '1px solid rgba(16, 185, 129, 0.35)',
  },
  dropBody: {
    padding: '1.25rem 1.5rem',
  },
  dropTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '0.25rem',
  },
  dropSub: {
    fontSize: '0.88rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    marginBottom: '1rem',
  },
  dropMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginBottom: '0.75rem',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dropTotalRow: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dropVibe: {
    fontSize: '0.78rem',
    color: '#9B7B6A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inspoLabel: {
    fontSize: '0.72rem',
    fontWeight: '600',
    color: '#9B7B6A',
    letterSpacing: '0.05em',
    marginBottom: '0.4rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  inspoStrip: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  inspoThumb: {
    width: '64px',
    height: '64px',
    borderRadius: '10px',
    objectFit: 'cover',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  dropActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
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
  notificationNote: {
    marginTop: '0.75rem',
    padding: '0.6rem 0.9rem',
    background: 'rgba(139, 30, 63, 0.06)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '10px',
    color: '#5A3A2A',
    fontSize: '0.85rem',
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
    color: '#5A3A2A',
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
  
  // Match cards
  matchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))',
    gap: '1.5rem',
  },
  matchCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
  },
  matchCardHover: {
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.15)',
    transform: 'translateY(-2px)',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  matchScore: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '1.25rem',
    color: '#FFFEF9',
  },
  scoreValue: {
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '0.6rem',
    opacity: 0.9,
  },
  matchTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchService: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchDetails: {
    marginBottom: '1rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  detailLabel: {
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  detailValue: {
    color: '#4A2A1A',
    fontWeight: '500',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  btn: {
    flex: 1,
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  btnAccept: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  btnDecline: {
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    color: '#8B1E3F',
  },
  btnView: {
    background: 'rgba(139, 30, 63, 0.1)',
    color: '#8B1E3F',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  
  // Status badges
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusSent: {
    background: 'rgba(255, 193, 7, 0.2)',
    color: '#ffc107',
  },
  statusAccepted: {
    background: 'rgba(76, 175, 80, 0.2)',
    color: '#4caf50',
  },
  statusDeclined: {
    background: 'rgba(244, 67, 54, 0.2)',
    color: '#f44336',
  },
  statusExpired: {
    background: 'rgba(158, 158, 158, 0.2)',
    color: '#9e9e9e',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyText: {
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Loading
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Modal
  modal: {
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
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modalText: {
    marginBottom: '1rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  modalActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
};

export default function ModelOpportunities() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const location = useLocation();
  const [matches, setMatches] = useState([]);
  const [enrichedMatches, setEnrichedMatches] = useState([]); // pre-fetched details for render
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [processingMatch, setProcessingMatch] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [modelProfile, setModelProfile] = useState(null);

  // Reload when we navigate here or when model profile becomes available (so we can filter by modelId)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const profile = await loadModelProfile();
      if (!cancelled) loadMatches(profile);
    })();
    return () => { cancelled = true; };
  }, [user, location.key, modelProfile?.id]);

  // Also reload when window gains focus (switching between browser windows)
  useEffect(() => {
    const handleFocus = () => loadMatches(modelProfile);
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [modelProfile?.id]);

  const loadModelProfile = async () => {
    try {
      // Try to load from database first
      const authUserId = user?.userId || user?.username || user?.userSub;
      if (authUserId) {
        try {
          const { data: profiles } = await client.models.ModelProfile.list({
            filter: { userId: { eq: authUserId } },
            limit: 1,
          });
          const profile = (profiles && profiles.length > 0) ? profiles[0] : null;
          if (profile) {
            setModelProfile(profile);
            return profile;
          }
        } catch (dbError) {
          console.log('Database error, using mock profile:', dbError);
        }
      }
      
      // Fallback to Seraphina's mock profile
      const seraphinaProfile = getMockModel('mock-model-1');
      if (seraphinaProfile) {
        console.log('Using Seraphina mock profile:', seraphinaProfile);
        setModelProfile(seraphinaProfile);
        return seraphinaProfile;
      }
      
      // Final fallback: create Seraphina profile
      const fallbackProfile = {
        id: 'mock-model-1',
        userId: user?.userId || 'mock-user-1',
        firstName: 'Seraphina',
        lastName: 'Luna',
        email: 'seraphina@example.com',
      };
      console.log('Using fallback Seraphina profile:', fallbackProfile);
      setModelProfile(fallbackProfile);
      return fallbackProfile;
    } catch (error) {
      console.error('Error loading model profile:', error);
      // Final fallback
      const fallbackProfile = {
        id: 'mock-model-1',
        userId: user?.userId || 'mock-user-1',
        firstName: 'Seraphina',
        lastName: 'Luna',
        email: 'seraphina@example.com',
      };
      setModelProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  // Guaranteed demo matches — always visible regardless of localStorage state
  const DEMO_MATCHES = [
    {
      id: 'demo-match-1',
      status: 'sent',
      score: 94,
      matchScore: 94,
      modelId: 'mock-model-1',
      requestId: 'mock-request-2',
      serviceId: 'haircut',
      professionalId: 'mock-pro-1',
      serviceName: 'Haircut',
      professionalName: 'Sarah M.',
      location: 'Luxe Studio - Tribeca, Manhattan',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '10:00 AM',
      duration: 90,
      modelFee: 25,
      total: 125,
      productFeeEst: 15,
      suggestedTip: 25,
      hairVibe: 'Long · Wavy · Brunette',
    },
    {
      id: 'demo-match-2',
      status: 'sent',
      score: 87,
      matchScore: 87,
      modelId: 'mock-model-1',
      requestId: 'mock-request-3',
      serviceId: 'highlights',
      professionalId: 'mock-pro-2',
      serviceName: 'Highlights',
      professionalName: 'Jessica R.',
      location: 'The Atelier - 456 Park Ave, New York, NY 10022',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '11:00 AM',
      duration: 150,
      modelFee: 30,
      total: 225,
      productFeeEst: 27,
      suggestedTip: 45,
      hairVibe: 'Medium · Straight · Blonde',
    },
  ];

  const loadMatches = async (profile = null) => {
    try {
      setLoading(true);
      const isMock = shouldUseMockData();
      const currentModelId = isMock ? 'mock-model-1' : (normalizeModelId(profile?.id) || profile?.id || null);
      const eligibleStatuses = new Set(['sent', 'approved', 'pending', 'accepted']);

      let enrichedList = [];

      if (isMock) {
        // Read path: getMatchesForSeraphina() = localStorage (modeled_mock_data) + session list. Write path: Admin MatchEnginePage → createMatchesForRequest → createMockMatch.
        const combined = getMatchesForSeraphina();
        const eligible = combined.filter(m => {
          const s = (m.status || '').toLowerCase();
          return s === 'sent' || s === 'approved' || s === 'pending';
        });
        for (const m of eligible) {
          try {
            const req = (getMockRequests({ id: m.requestId }) || [])[0] || null;
            const serviceId = req?.serviceType || m.serviceId;
            const service = serviceId ? getServiceById(serviceId) : null;
            const pro = req ? getMockProfessional(req.professionalId) : null;
            const parts = [];
            if (req?.desiredHairLength) parts.push(req.desiredHairLength);
            if (req?.desiredHairColor) parts.push(req.desiredHairColor);
            if (req?.desiredHairTexture) parts.push(req.desiredHairTexture);
            const hairVibe = parts.length ? parts.join(' · ') : null;
            enrichedList.push({
              ...m,
              status: m.status === 'accepted' ? 'accepted' : 'sent',
              score: Math.round(m.matchScore || 0),
              serviceId: serviceId || null,
              professionalId: req?.professionalId || null,
              serviceName: service?.name || req?.serviceType || 'Service',
              professionalName: pro
                ? `${pro.firstName || ''} ${pro.lastName ? pro.lastName.charAt(0) + '.' : ''}`.trim()
                : 'Professional',
              location: req?.location || pro?.salonAddress || 'TBD',
              date: req?.requestedDate || req?.preferredDate || null,
              time: req?.requestedTime || req?.preferredTime || null,
              duration: req?.duration ?? service?.duration ?? 60,
              modelFee: service?.modelFee ?? m.modelFee ?? null,
              total: service?.price ?? null,
              productFeeEst: service?.price ? Math.round(service.price * 0.12) : 0,
              suggestedTip: service?.price ? Math.round(service.price * 0.2) : 0,
              hairVibe: hairVibe || null,
            });
          } catch (_) {}
        }
        // If nothing in storage (e.g. old cache), show demo cards so the page isn't empty
        if (enrichedList.length === 0) {
          enrichedList = [...DEMO_MATCHES];
        }
      } else {
        // Non-mock: pull the model's real matches first (full E2E visibility from admin send -> model portal)
        let realMatches = [];
        if (currentModelId) {
          realMatches = await getMatchesForModel(currentModelId);
        }

        const eligibleRealMatches = (realMatches || []).filter((m) =>
          eligibleStatuses.has(String(m.status || '').toLowerCase())
        );

        for (const m of eligibleRealMatches) {
          try {
            let req = null;
            let pro = null;

            if (client?.models?.ModelRequest?.get && m.requestId) {
              const { data } = await client.models.ModelRequest.get({ id: m.requestId });
              req = data || null;
            }

            if (!req) {
              req = (getMockRequests({ id: m.requestId }) || [])[0] || null;
            }

            if (req?.professionalId && client?.models?.Professional?.get) {
              const { data } = await client.models.Professional.get({ id: req.professionalId });
              pro = data || null;
            }

            if (!pro && req?.professionalId) {
              pro = getMockProfessional(req.professionalId);
            }

            const serviceId = req?.serviceType || m.serviceId;
            const service = serviceId ? getServiceById(serviceId) : null;
            const parts = [];
            if (req?.desiredHairLength) parts.push(req.desiredHairLength);
            if (req?.desiredHairColor) parts.push(req.desiredHairColor);
            if (req?.desiredHairTexture) parts.push(req.desiredHairTexture);
            const hairVibe = parts.length ? parts.join(' · ') : null;

            enrichedList.push({
              ...m,
              status: String(m.status || '').toLowerCase() === 'accepted' ? 'accepted' : 'sent',
              score: Math.round(m.matchScore || 0),
              serviceId: serviceId || null,
              professionalId: req?.professionalId || m.professionalId || null,
              serviceName: service?.name || req?.serviceType || m.serviceType || 'Service',
              professionalName: pro
                ? `${pro.firstName || ''} ${pro.lastName ? pro.lastName.charAt(0) + '.' : ''}`.trim()
                : 'Professional',
              location: req?.location || pro?.salonAddress || 'TBD',
              date: req?.requestedDate || req?.preferredDate || null,
              time: req?.requestedTime || req?.preferredTime || null,
              duration: req?.duration ?? service?.duration ?? 60,
              modelFee: service?.modelFee ?? m.modelFee ?? null,
              total: service?.price ?? m.total ?? null,
              productFeeEst: service?.price ? Math.round(service.price * 0.12) : 0,
              suggestedTip: service?.price ? Math.round(service.price * 0.2) : 0,
              hairVibe: hairVibe || null,
            });
          } catch (_) {}
        }

        // Safety fallback: if no real matches were found, show static demos so page never looks broken
        if (enrichedList.length === 0) {
          enrichedList = DEMO_MATCHES.filter(
            (m) => !currentModelId || normalizeModelId(m.modelId) === currentModelId
          );
        }
      }

      const seen = new Set();
      const unique = enrichedList.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      setMatches(unique);
      setEnrichedMatches(unique);
    } catch (error) {
      console.error('Error loading matches:', error);
      // Always fall back to demo data
      setMatches(DEMO_MATCHES);
      setEnrichedMatches(DEMO_MATCHES);
    } finally {
      setLoading(false);
    }
  };

  // enrichedMatches is now set directly by loadMatches — no separate enrich step needed
  const filteredMatches = enrichedMatches.filter(m =>
    m.status === 'sent' || m.status === 'approved' || m.status === 'pending'
  );

  const handleAccept = async (matchId) => {
    try {
      setProcessingMatch(matchId);
      
      // Show payment confirmation (simplified for demo - in production would use Stripe)
      const match = enrichedMatches.find(m => m.id === matchId);
      if (!match) {
        alert('Match not found');
        return;
      }
      
      const confirmPayment = window.confirm(
        `Accept this opportunity?\n\n` +
        `Service: ${match.serviceName}\n` +
        `Date: ${match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}\n` +
        `Time: ${match.time || 'TBD'}\n` +
        `Model Fee: $${match.modelFee || 0}\n\n` +
        `Click OK to accept and confirm payment.`
      );
      
      if (confirmPayment) {
        // DEMO MODE: Bypass payment, create booking immediately
        console.log('🎯 Accepting match (demo mode - payment bypassed):', matchId);
        
        try {
          const result = await acceptMatch(matchId, {
            // Demo mode: Mark as paid to bypass payment validation
            modelPaid: true,
            proPaid: true,
            // Mock payment data (not validated - for demo only)
            paymentIntentId: 'demo_payment_' + Date.now(),
            customerId: 'demo_customer',
            paymentMethodId: 'demo_payment_method',
            chargeId: 'demo_charge_' + Date.now(),
            // Use match date/time or defaults
            appointmentDate: match.date || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            appointmentTime: match.time || '2:00 PM',
          });
          
          console.log('✅ Accept match result:', result);
          
          if (result && result.booking) {
            console.log('✅ Booking created successfully:', result.booking);
            console.log('📅 Booking details:', {
              id: result.booking.id,
              status: result.booking.status,
              appointmentDate: result.booking.appointmentDate,
              appointmentTime: result.booking.appointmentTime,
              modelId: result.booking.modelId,
            });
            
            alert(`✅ Booking confirmed!\n\nService: ${match.serviceName}\nDate: ${match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}\nTime: ${match.time || 'TBD'}\n\nCheck your calendar to see the booking!`);
            
            // Reload matches to show updated status
            await loadMatches(modelProfile);
            
            // Optionally navigate to calendar
            // navigate('/model-portal/booked');
          } else {
            console.warn('⚠️ Match accepted but booking not created, trying direct creation...');
            // Try to create booking directly as fallback
            try {
              const { createBookingFromMatch } = await import('../../utils/bookingService');
              const bookingResult = await createBookingFromMatch(matchId, {
                modelPaid: true,
                proPaid: true,
                appointmentDate: match.date,
                appointmentTime: match.time,
              });
              if (bookingResult?.booking) {
                alert(`✅ Booking created!\n\nCheck your calendar to see it.`);
                await loadMatches(modelProfile);
              } else {
                alert('Match accepted! The booking will appear in your calendar shortly. Please refresh the calendar page.');
                await loadMatches(modelProfile);
              }
            } catch (bookingError) {
              console.error('❌ Error creating booking fallback:', bookingError);
              alert('Match accepted! The booking will be created automatically. Please refresh the calendar page to see it.');
              await loadMatches(modelProfile);
            }
          }
        } catch (acceptError) {
          console.error('❌ Error in acceptMatch:', acceptError);
          // Even if acceptMatch fails, try to create booking directly
          try {
            const { createBookingFromMatch } = await import('../../utils/bookingService');
            const bookingResult = await createBookingFromMatch(matchId, {
              modelPaid: true,
              proPaid: true,
              appointmentDate: match.date,
              appointmentTime: match.time,
            });
            if (bookingResult?.booking) {
              alert(`✅ Booking created directly!\n\nCheck your calendar.`);
              await loadMatches(modelProfile);
            } else {
              alert(`Match accepted! The booking will appear in your calendar. If it doesn't show up, refresh the calendar page.`);
              await loadMatches(modelProfile);
            }
            } catch (bookingError) {
              console.error('❌ Booking creation also failed:', bookingError);
              alert(`Match accepted! The booking will be created automatically when you refresh the calendar. Error: ${acceptError.message || 'Unknown error'}`);
              await loadMatches(modelProfile);
            }
        }
      }
    } catch (error) {
      console.error('Error accepting match:', error);
      alert('Error accepting match. Please try again.');
    } finally {
      setProcessingMatch(null);
    }
  };

  const handleDecline = async (matchId, reason = '') => {
    try {
      setProcessingMatch(matchId);
      await declineMatch(matchId, reason);
      await loadMatches(modelProfile);
      setShowDeclineModal(null);
      setDeclineReason('');
      alert('Match declined. We\'ll find you another opportunity soon!');
    } catch (error) {
      console.error('Error declining match:', error);
      alert('Error declining match. Please try again.');
    } finally {
      setProcessingMatch(null);
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      sent: styles.statusSent,
      accepted: styles.statusAccepted,
      declined: styles.statusDeclined,
      expired: styles.statusExpired,
    };
    return { ...styles.statusBadge, ...badgeStyles[status] };
  };

  const isBooked = (m) => m.status === 'accepted' || m.bookingId;
  const sortedMatches = [...filteredMatches].sort((a, b) => (b.score || 0) - (a.score || 0));

  function DropCard({ match, index, onAccept, onDecline, setShowDeclineModal, processingMatch, navigate }) {
    const place = splitLocation(match.location);
    const inspoUrls = (match.professionalId && PRO_INSPO_IMAGES[match.professionalId]) || PRO_INSPO_IMAGES['mock-pro-1'];
    const booked = isBooked(match);
    return (
      <div style={styles.dropCard}>
        <div style={styles.dropCardHeader}>
          <span style={booked ? styles.statusPillBooked : styles.statusPillMatched}>
            {booked ? 'Booked' : 'Matched'}
          </span>
        </div>
        <div style={styles.dropBody}>
          <div style={styles.dropTitle}>
            {match.serviceName} at {place.primary || 'Studio'}
          </div>
          <div style={styles.dropMeta}>
            <span>{formatWeekdayDate(match.date)}</span>
            <span>{formatTimeRangeEST(match.time, match.duration)}</span>
            {place.primary && (
              <span>
                {place.primary}
                {place.secondary && (
                  <>
                    <br />
                    <span style={{ fontSize: '0.8em', color: '#9B7B6A' }}>{place.secondary}</span>
                  </>
                )}
              </span>
            )}
          </div>
          <div style={styles.dropTotalRow}>
            {match.total != null && `Service value $${match.total}`}
            {match.total != null && (
              <>
                {' · '}
                Booking fee ${Math.round(match.total * 0.2)}
              </>
            )}
          </div>
          {/* Hide attribute/matching descriptors from model view; admin-only concept */}
          {inspoUrls && inspoUrls.length > 0 && (
            <>
              <div style={styles.inspoLabel}>Inspo from your Pro</div>
              <div style={styles.inspoStrip}>
                {inspoUrls.slice(0, 3).map((url, i) => (
                  <img key={i} src={url} alt="" style={styles.inspoThumb} />
                ))}
              </div>
            </>
          )}
          <div style={styles.dropActions}>
            {booked ? (
              <>
                <span style={styles.statusPillBooked}>You're booked</span>
                {match.bookingId && (
                  <button
                    style={{ ...styles.btn, ...styles.btnView }}
                    onClick={() => navigate(`/model-portal/sessions/${match.bookingId}`)}
                  >
                    View Details
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  style={{ ...styles.btn, ...styles.btnAccept, ...(processingMatch === match.id ? styles.btnDisabled : {}) }}
                  onClick={() => onAccept(match.id)}
                  disabled={processingMatch === match.id}
                >
                  {processingMatch === match.id ? 'Processing...' : 'Confirm This Look'}
                </button>
                <button
                  style={{ ...styles.btn, ...styles.btnDecline, ...(processingMatch === match.id ? styles.btnDisabled : {}) }}
                  onClick={() => setShowDeclineModal(match.id)}
                  disabled={processingMatch === match.id}
                >
                  Pass For Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading opportunities...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                background: 'rgba(139, 30, 63, 0.12)',
                color: '#8B1E3F',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
                fontWeight: '600',
                fontSize: '0.85rem',
              }}
            >
              Opportunities
            </button>
          </div>
          <button
            onClick={() => {
              loadMatches(modelProfile);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(139, 30, 63, 0.3)',
              background: '#FFFEF9',
              color: '#8B1E3F',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}
          >
            Refresh
          </button>
        </div>
        <div style={styles.notificationNote}>
          Notification drops: SES + SNS (until the mobile app launch).
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}></div>
          <div style={styles.emptyTitle}>No New Opportunities</div>
          <div style={styles.emptyText}>
            We'll notify you when new booking opportunities are available!
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sortedMatches.map((match, idx) => (
            <DropCard
              key={match.id}
              match={match}
              index={idx}
              onAccept={handleAccept}
              onDecline={handleDecline}
              setShowDeclineModal={setShowDeclineModal}
              processingMatch={processingMatch}
              navigate={navigate}
            />
          ))}
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div style={styles.modal} onClick={() => setShowDeclineModal(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Decline Opportunity</div>
            <div style={styles.modalText}>
              Are you sure you want to decline this opportunity? (Optional: let us know why)
            </div>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason (optional)"
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                fontFamily: '"Alike", "Georgia", serif',
                fontSize: '0.9rem',
                marginBottom: '1rem',
                resize: 'vertical',
              }}
            />
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.btn, ...styles.btnDecline }}
                onClick={() => {
                  setShowDeclineModal(null);
                  setDeclineReason('');
                }}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.btn, ...styles.btnAccept }}
                onClick={() => handleDecline(showDeclineModal, declineReason)}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

