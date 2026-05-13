/**
 * PRO MATCHING PAGE — Unified Concierge Feed
 *
 * Single scrollable feed. No tabs. Status lives on the card.
 * Matching (amber) → Matched (rose) → Modeled (emerald)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getRequestsForProfessional } from '../../utils/requestService';
import { getMatchesForRequest } from '../../utils/matchService';
import { getModelById } from '../../utils/profileService';
import { getMockModels, getMockBookings, shouldUseMockData } from '../../utils/mockDataService';
import { getServiceById } from '../../admin/data/services';

// ─── Brand status config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  matching: {
    label: 'Matching',
    bg: '#FEF3C7',
    color: '#92400E',
    dot: '#F59E0B',
    border: 'rgba(245,158,11,0.3)',
  },
  matched: {
    label: 'Matched',
    bg: 'rgba(139,30,63,0.1)',
    color: '#8B1E3F',
    dot: '#8B1E3F',
    border: 'rgba(139,30,63,0.3)',
  },
  modeled: {
    label: 'Modeled',
    bg: '#D1FAE5',
    color: '#065F46',
    dot: '#10B981',
    border: 'rgba(16,185,129,0.3)',
  },
};

// ─── Service color map ────────────────────────────────────────────────────────
const SERVICE_COLORS = {
  haircut:   { primary: '#667eea', bg: 'rgba(102,126,234,0.08)' },
  color:     { primary: '#e94560', bg: 'rgba(233,69,96,0.08)' },
  styling:   { primary: '#d97706', bg: 'rgba(217,119,6,0.08)' },
  blowout:   { primary: '#4caf50', bg: 'rgba(76,175,80,0.08)' },
  treatment: { primary: '#9c27b0', bg: 'rgba(156,39,176,0.08)' },
  default:   { primary: '#8B1E3F', bg: 'rgba(139,30,63,0.08)' },
};

// ─── Curated photos ───────────────────────────────────────────────────────────
const HEADSHOTS = [
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1485290334039-a3c69043e517?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRequestStage(status) {
  if (['accepted', 'booked', 'completed'].includes(status)) return 'modeled';
  if (['sent', 'approved', 'matched'].includes(status)) return 'matched';
  return 'matching';
}

function formatWeekdayDate(dateStr) {
  if (!dateStr) return 'Date TBD';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Split a freeform location into a primary studio name and secondary area/address
// Examples:
// - "Luxe Studio - Tribeca, Manhattan" -> primary: "Luxe Studio", secondary: "Tribeca, Manhattan"
// - "Luxe Studio, Tribeca" -> primary: "Luxe Studio", secondary: "Tribeca"
function splitLocation(location) {
  if (!location) return { primary: '', secondary: null };
  const raw = String(location).trim();
  if (!raw) return { primary: '', secondary: null };

  // Prefer "Studio - Area" pattern
  if (raw.includes('-')) {
    const [first, ...rest] = raw.split('-').map(part => part.trim()).filter(Boolean);
    if (rest.length) {
      return { primary: first, secondary: rest.join(' - ') };
    }
  }

  // Fallback to "Name, Area" pattern
  if (raw.includes(',')) {
    const [first, ...rest] = raw.split(',').map(part => part.trim()).filter(Boolean);
    if (rest.length) {
      return { primary: first, secondary: rest.join(', ') };
    }
  }

  return { primary: raw, secondary: null };
}

// Parse any common time string → { h, m } in 24h integers
// Handles: "2:00 PM", "10:00 AM", "14:00", "10:30", "1000", etc.
function parseTimeString(timeStr) {
  if (!timeStr) return null;
  const str = String(timeStr).trim();

  // "2:00 PM" / "10:00 AM"
  const ampm = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let h = parseInt(ampm[1], 10);
    const m = parseInt(ampm[2], 10);
    const period = ampm[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return { h, m };
  }

  // "14:00" / "09:30"
  const hhmm = str.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return { h: parseInt(hhmm[1], 10), m: parseInt(hhmm[2], 10) };
  }

  // "1400" / "0930"
  const mil = str.match(/^(\d{2})(\d{2})$/);
  if (mil) {
    return { h: parseInt(mil[1], 10), m: parseInt(mil[2], 10) };
  }

  return null;
}

function formatHour(h, m) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const displayH = ((h + 11) % 12) + 1;
  return `${displayH}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatTimeRange(startTime, durationMinutes) {
  if (!startTime) return 'Time TBD';
  const parsed = parseTimeString(startTime);
  if (!parsed) return String(startTime);

  const { h, m } = parsed;
  const startLabel = formatHour(h, m);

  if (!durationMinutes || Number.isNaN(Number(durationMinutes))) {
    return `${startLabel} EST`;
  }

  const totalMins = h * 60 + m + Number(durationMinutes);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  return `${startLabel} – ${formatHour(endH, endM)} EST`;
}

function modelDisplayName(model) {
  if (!model) return 'Your Match';
  const last = model.lastName ? model.lastName[0] + '.' : '';
  return `${model.firstName || 'Model'} ${last}`.trim();
}

function formatRequirement(value) {
  return value ? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
}

function getServiceColor(serviceId) {
  const svc = getServiceById(serviceId);
  const key = svc?.category?.toLowerCase() || serviceId?.toLowerCase() || 'default';
  return SERVICE_COLORS[key] || SERVICE_COLORS.default;
}

// ─── useIsMobile hook ─────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ stage }) {
  const cfg = STATUS_CONFIG[stage];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: '700',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      fontFamily: '"Alike", serif',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        animation: stage === 'matching' ? 'pulseDot 1.5s ease-in-out infinite' : 'none',
      }} />
      {cfg.label}
    </span>
  );
}

// ─── MatchingCard (amber — no model yet) ─────────────────────────────────────
function MatchingCard({ request, service, isMobile }) {
  const [hovered, setHovered] = useState(false);
  const serviceId = request.serviceId || request.serviceType || 'haircut';
  const sc = getServiceColor(serviceId);
  const duration = request.duration || service?.duration;
  const requirements = [
    formatRequirement(request.desiredHairLength),
    formatRequirement(request.desiredHairColor),
    formatRequirement(request.desiredHairTexture),
    formatRequirement(request.hairCondition),
  ].filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFEF9',
        borderRadius: '20px',
        overflow: 'hidden',
        border: hovered ? '2px solid #F59E0B' : '2px solid rgba(245,158,11,0.2)',
        boxShadow: hovered ? '0 12px 40px rgba(245,158,11,0.15)' : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Image area — mystery gradient with pulsing icon */}
      <div style={{
        width: '100%',
        aspectRatio: '4/3',
        background: `linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05), ${sc.bg})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        position: 'relative',
      }}>
        {/* Dot grid pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.15) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }} />
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(245,158,11,0.12)',
          border: '2px dashed rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', position: 'relative', zIndex: 1,
        }}>✦</div>
        <div style={{
          fontSize: '0.78rem', fontWeight: '600', color: '#92400E',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: '"Alike", serif', position: 'relative', zIndex: 1,
        }}>
          Searching for your model
        </div>
        {/* Status pill top-right */}
        <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
          <StatusPill stage="matching" />
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1.4rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", serif', marginBottom: '0.75rem' }}>
          {service?.name || 'Service Request'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
          <MetaRow label="Date">
            {formatWeekdayDate(request.preferredDate || request.requestedDate)}
          </MetaRow>
          <MetaRow label="Time" sub={duration ? `${duration} min` : null}>
            {formatTimeRange(request.preferredTime || request.requestedTime, duration)}
          </MetaRow>
          {request.location && (() => {
            const { primary, secondary } = splitLocation(request.location);
            return (
              <MetaRow label="Place" sub={secondary}>
                {primary}
              </MetaRow>
            );
          })()}
        </div>
        {requirements.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {requirements.map(r => <Chip key={r}>{r}</Chip>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MatchedCard (rose — model cherry-picked) ────────────────────────────────
function MatchedCard({ request, model, index, service, navigate }) {
  const [hovered, setHovered] = useState(false);
  const serviceId = request.serviceId || request.serviceType || 'haircut';
  const sc = getServiceColor(serviceId);
  const duration = request.duration || service?.duration;
  const modelName = modelDisplayName(model);
  const modelImage = model?.headshotUrl || HEADSHOTS[index % HEADSHOTS.length];
  const requirements = [
    formatRequirement(request.desiredHairLength),
    formatRequirement(request.desiredHairColor),
    formatRequirement(request.desiredHairTexture),
    formatRequirement(request.hairCondition),
  ].filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFEF9',
        borderRadius: '20px',
        overflow: 'hidden',
        border: hovered ? '2px solid #8B1E3F' : '2px solid rgba(139,30,63,0.2)',
        boxShadow: hovered ? '0 12px 40px rgba(139,30,63,0.18)' : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Model headshot */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: `linear-gradient(135deg, ${sc.primary}30, ${sc.bg})`,
        position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={modelImage}
          alt={modelName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />
        {/* Model name overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0.75rem 1rem',
          color: '#FFFEF9',
          fontFamily: '"Alike", serif',
          fontSize: '1rem',
          fontWeight: '700',
          letterSpacing: '0.03em',
        }}>
          {modelName}
        </div>
        {/* Status pill */}
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <StatusPill stage="matched" />
        </div>
      </div>

      <div style={{ padding: '1.4rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", serif', marginBottom: '0.75rem' }}>
          {service?.name || 'Service Request'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
          <MetaRow label="Date">
            {formatWeekdayDate(request.preferredDate || request.requestedDate)}
          </MetaRow>
          <MetaRow label="Time" sub={duration ? `${duration} min` : null}>
            {formatTimeRange(request.preferredTime || request.requestedTime, duration)}
          </MetaRow>
          {request.location && (() => {
            const { primary, secondary } = splitLocation(request.location);
            return (
              <MetaRow label="Place" sub={secondary}>
                {primary}
              </MetaRow>
            );
          })()}
        </div>
        {requirements.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {requirements.map(r => <Chip key={r}>{r}</Chip>)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ModeledCard (emerald — model accepted & paid, session confirmed) ─────────
function ModeledCard({ request, model, index, service, navigate, bookingId }) {
  const [hovered, setHovered] = useState(false);
  const serviceId = request.serviceId || request.serviceType || 'haircut';
  const sc = getServiceColor(serviceId);
  const duration = request.duration || service?.duration;
  const modelName = modelDisplayName(model);
  const modelImage = model?.headshotUrl || HEADSHOTS[index % HEADSHOTS.length];
  const requirements = [
    formatRequirement(request.desiredHairLength),
    formatRequirement(request.desiredHairColor),
    formatRequirement(request.desiredHairTexture),
    formatRequirement(request.hairCondition),
  ].filter(Boolean);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#FFFEF9',
        borderRadius: '20px',
        overflow: 'hidden',
        border: hovered ? '2px solid #10B981' : '2px solid rgba(16,185,129,0.25)',
        boxShadow: hovered ? '0 12px 40px rgba(16,185,129,0.18)' : '0 4px 20px rgba(0,0,0,0.07)',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-6px)' : 'none',
        cursor: 'default',
      }}
    >
      {/* Confirmed header bar */}
      <div style={{
        background: 'linear-gradient(90deg, #10B981, #059669)',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#fff',
        fontSize: '0.75rem',
        fontWeight: '700',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontFamily: '"Alike", serif',
      }}>
        <span>✓</span> Session Confirmed
      </div>

      {/* Model headshot */}
      <div style={{
        width: '100%', aspectRatio: '4/3',
        background: `linear-gradient(135deg, ${sc.primary}30, ${sc.bg})`,
        position: 'relative', overflow: 'hidden',
      }}>
        <img
          src={modelImage}
          alt={modelName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '0.75rem 1rem',
          color: '#FFFEF9',
          fontFamily: '"Alike", serif',
          fontSize: '1rem',
          fontWeight: '700',
        }}>
          {modelName}
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <StatusPill stage="modeled" />
        </div>
      </div>

      <div style={{ padding: '1.4rem' }}>
        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#4A2A1A', fontFamily: '"Alike", serif', marginBottom: '0.75rem' }}>
          {service?.name || 'Service Request'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1rem' }}>
          <MetaRow label="Date">
            {formatWeekdayDate(request.preferredDate || request.requestedDate)}
          </MetaRow>
          <MetaRow label="Time" sub={duration ? `${duration} min` : null}>
            {formatTimeRange(request.preferredTime || request.requestedTime, duration)}
          </MetaRow>
          {request.location && (() => {
            const { primary, secondary } = splitLocation(request.location);
            return (
              <MetaRow label="Place" sub={secondary}>
                {primary}
              </MetaRow>
            );
          })()}
        </div>
        {requirements.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
            {requirements.map(r => <Chip key={r}>{r}</Chip>)}
          </div>
        )}
        {bookingId && (
          <button
            type="button"
            onClick={() => navigate(`/portal/bookings/${bookingId}/complete`)}
            style={{
              marginTop: '1rem',
              width: '100%',
              padding: '0.75rem 1.25rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              fontFamily: '"Alike", serif',
              boxShadow: '0 4px 14px rgba(16,185,129,0.35)',
            }}
          >
            Add feedback & photos
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tiny shared helpers ──────────────────────────────────────────────────────
function MetaRow({ label, children, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: '#5A3A2A', fontFamily: '"Alike", serif' }}>
      {label && (
        <span style={{
          fontSize: '0.7rem', fontWeight: '700', color: '#9B7B6A',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          flexShrink: 0, minWidth: '52px', paddingTop: '2px',
        }}>{label}</span>
      )}
      <div>
        <div>{children}</div>
        {sub && (
          <div style={{ fontSize: '0.75rem', color: '#9B7B6A', marginTop: '1px' }}>{sub}</div>
        )}
      </div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      padding: '0.3rem 0.65rem',
      borderRadius: '999px',
      border: '1px solid rgba(139,30,63,0.18)',
      background: 'rgba(139,30,63,0.05)',
      fontSize: '0.73rem',
      color: '#5A3A2A',
      fontFamily: '"Alike", serif',
    }}>
      {children}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProMatching() {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [requests, setRequests] = useState([]);
  const [modelMap, setModelMap] = useState({}); // requestId → model
  const [bookingIdMap, setBookingIdMap] = useState({}); // requestId → bookingId (for modeled)
  const [loading, setLoading] = useState(true);

  // Reload whenever user navigates here or window regains focus
  useEffect(() => {
    if (user) loadRequests();
  }, [user, location.key]);

  useEffect(() => {
    const handler = () => { if (user) loadRequests(); };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [user]);

  // After requests load, fetch models for matched/modeled entries
  useEffect(() => {
    if (requests.length) loadModels();
  }, [requests]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const myRequests = await getRequestsForProfessional(user?.userId);
      const stageOrder = { matching: 0, matched: 1, modeled: 2 };
      const sorted = [...(myRequests || [])].sort((a, b) => {
        // Primary: appointment date ascending (soonest first)
        const dateA = new Date((a.preferredDate || a.requestedDate || a.createdAt || 0) + 'T00:00:00');
        const dateB = new Date((b.preferredDate || b.requestedDate || b.createdAt || 0) + 'T00:00:00');
        if (dateA - dateB !== 0) return dateA - dateB;
        // Tiebreaker: stage order (matching → matched → modeled)
        return (stageOrder[getRequestStage(a.status)] || 0) - (stageOrder[getRequestStage(b.status)] || 0);
      });
      setRequests(sorted);
    } catch (err) {
      console.error('Error loading requests:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    const needModel = requests.filter(r =>
      ['sent', 'approved', 'matched', 'accepted', 'booked', 'completed'].includes(r.status)
    );
    if (!needModel.length) {
      setBookingIdMap({});
      return;
    }

    const mockModels = getMockModels({ status: 'active' });
    const map = {};
    const bookingIds = {};

    await Promise.all(needModel.map(async (request, idx) => {
      let model = null;
      let bookingId = null;
      const isModeled = getRequestStage(request.status) === 'modeled';

      if (!shouldUseMockData()) {
        try {
          const matches = await getMatchesForRequest(request.id);
          const match = matches?.find(m => m.bookingId) || matches?.[0];
          if (match?.modelId) model = await getModelById(match.modelId);
          if (isModeled && match?.bookingId) bookingId = match.bookingId;
        } catch (_) {}
      } else {
        model = mockModels[idx % (mockModels.length || 1)] || null;
        if (isModeled && request.professionalId) {
          const bookings = getMockBookings({ professionalId: request.professionalId });
          const b = bookings.find(b => b.requestId === request.id);
          if (b?.id) bookingId = b.id;
        }
      }
      map[request.id] = model || mockModels[idx % (mockModels.length || 1)] || null;
      if (bookingId) bookingIds[request.id] = bookingId;
    }));

    setModelMap(map);
    setBookingIdMap(bookingIds);
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', fontFamily: '"Alike", serif', color: '#4A2A1A' }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✦</div>
        Loading your requests…
      </div>
    );
  }

  const matchedIdx = {}; // track index per matched/modeled for photo cycling
  let matchedCount = 0;

  return (
    <div style={{
      padding: isMobile ? '1rem' : '2rem',
      maxWidth: '1600px',
      margin: '0 auto',
      background: '#FFFEF9',
      minHeight: '100vh',
      fontFamily: '"Alike", serif',
    }}>
      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,30,63,0.95), rgba(168,90,90,0.9))',
        borderRadius: isMobile ? '16px' : '20px',
        padding: isMobile ? '2rem 1.25rem' : '3rem 2rem',
        marginBottom: isMobile ? '1.5rem' : '2.5rem',
        color: '#FFFEF9',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <h1 style={{
          fontSize: isMobile ? '1.75rem' : '2.5rem',
          fontWeight: '700',
          marginBottom: '0.5rem',
          fontFamily: '"Alike", serif',
          position: 'relative',
          zIndex: 1,
          margin: 0,
        }}>
          Matching Concierge
        </h1>
        <p style={{
          fontSize: isMobile ? '0.9rem' : '1.05rem',
          opacity: 0.92,
          fontFamily: '"Alike", serif',
          position: 'relative',
          zIndex: 1,
          maxWidth: '560px',
          margin: '0.5rem auto 0',
        }}>
          Request models, track your matches, and manage every session in one place.
        </p>
        <button
          onClick={() => navigate('/portal/matching/create')}
          style={{
            marginTop: '1.5rem',
            padding: isMobile ? '0.8rem 2rem' : '1rem 2.5rem',
            background: '#FFFEF9',
            color: '#8B1E3F',
            border: 'none',
            borderRadius: '12px',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            fontFamily: '"Alike", serif',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          + Create New Request
        </button>
      </div>

      {/* ── Legend pills ── */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        flexWrap: 'wrap',
        marginBottom: '1.75rem',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.8rem', color: '#9B7B6A', marginRight: '0.25rem' }}>Status:</span>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <span key={key} style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 12px', borderRadius: '999px',
            fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.04em',
            textTransform: 'uppercase',
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
            {cfg.label}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9B7B6A' }}>
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Feed ── */}
      {requests.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '2px dashed rgba(139,30,63,0.2)', borderRadius: '20px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✦</div>
          <div style={{ fontSize: '1.4rem', fontWeight: '700', color: '#4A2A1A', marginBottom: '0.5rem' }}>
            No Requests Yet
          </div>
          <div style={{ fontSize: '0.95rem', color: '#5A3A2A', marginBottom: '1.5rem' }}>
            Create your first request to begin matching with models.
          </div>
          <button
            onClick={() => navigate('/portal/matching/create')}
            style={{
              padding: '0.85rem 2rem', background: '#8B1E3F', color: '#FFFEF9',
              border: 'none', borderRadius: '12px', fontSize: '0.95rem',
              fontWeight: '700', cursor: 'pointer', fontFamily: '"Alike", serif',
            }}
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(360px, 100%), 1fr))',
          gap: isMobile ? '1.25rem' : '2rem',
          marginBottom: '3rem',
        }}>
          {requests.map((request, idx) => {
            const serviceId = request.serviceId || request.serviceType || 'haircut';
            const service = getServiceById(serviceId);
            const stage = getRequestStage(request.status);

            if (stage === 'matching') {
              return (
                <MatchingCard
                  key={request.id}
                  request={request}
                  service={service}
                  isMobile={isMobile}
                />
              );
            }

            const modelIdx = matchedCount++;
            const model = modelMap[request.id] || null;

            if (stage === 'matched') {
              return (
                <MatchedCard
                  key={request.id}
                  request={request}
                  model={model}
                  index={modelIdx}
                  service={service}
                  navigate={navigate}
                />
              );
            }

            return (
              <ModeledCard
                key={request.id}
                request={request}
                model={model}
                index={modelIdx}
                service={service}
                navigate={navigate}
                bookingId={bookingIdMap[request.id]}
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
