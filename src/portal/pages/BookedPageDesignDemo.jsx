import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getServiceById } from '../../admin/data/services';

// ============ COLOR PALETTES ============

// Option A: Muted Pastel Complementary (Recommended)
const paletteA = {
  haircut: {
    bg: 'rgba(200, 168, 130, 0.08)',
    border: 'rgba(200, 168, 130, 0.25)',
    accent: '#B89670',
    label: '#B89670',
  },
  color: {
    bg: 'rgba(168, 197, 176, 0.08)',
    border: 'rgba(168, 197, 176, 0.25)',
    accent: '#8FB09F',
    label: '#8FB09F',
  },
  blowdry: {
    bg: 'rgba(212, 165, 184, 0.08)',
    border: 'rgba(212, 165, 184, 0.25)',
    accent: '#C894A8',
    label: '#C894A8',
  },
  highlights: {
    bg: 'rgba(232, 200, 159, 0.08)',
    border: 'rgba(232, 200, 159, 0.25)',
    accent: '#D8B88F',
    label: '#D8B88F',
  },
  gloss: {
    bg: 'rgba(181, 196, 229, 0.08)',
    border: 'rgba(181, 196, 229, 0.25)',
    accent: '#A5B4D5',
    label: '#A5B4D5',
  },
  keratin: {
    bg: 'rgba(217, 196, 168, 0.08)',
    border: 'rgba(217, 196, 168, 0.25)',
    accent: '#C9B498',
    label: '#C9B498',
  },
};

// Option B: Earthy Warm Complementary
const paletteB = {
  haircut: {
    bg: 'rgba(184, 160, 130, 0.10)',
    border: 'rgba(184, 160, 130, 0.30)',
    accent: '#A89072',
    label: '#A89072',
  },
  color: {
    bg: 'rgba(160, 184, 168, 0.10)',
    border: 'rgba(160, 184, 168, 0.30)',
    accent: '#90A898',
    label: '#90A898',
  },
  blowdry: {
    bg: 'rgba(200, 160, 176, 0.10)',
    border: 'rgba(200, 160, 176, 0.30)',
    accent: '#B890A0',
    label: '#B890A0',
  },
  highlights: {
    bg: 'rgba(224, 184, 144, 0.10)',
    border: 'rgba(224, 184, 144, 0.30)',
    accent: '#D0A880',
    label: '#D0A880',
  },
  gloss: {
    bg: 'rgba(168, 184, 208, 0.10)',
    border: 'rgba(168, 184, 208, 0.30)',
    accent: '#98A8C0',
    label: '#98A8C0',
  },
  keratin: {
    bg: 'rgba(200, 176, 152, 0.10)',
    border: 'rgba(200, 176, 152, 0.30)',
    accent: '#B8A088',
    label: '#B8A088',
  },
};

// Option C: Soft Neutrals with Subtle Hints
const paletteC = {
  haircut: {
    bg: 'rgba(212, 196, 184, 0.06)',
    border: 'rgba(212, 196, 184, 0.20)',
    accent: '#C4B4A8',
    label: '#C4B4A8',
  },
  color: {
    bg: 'rgba(200, 212, 196, 0.06)',
    border: 'rgba(200, 212, 196, 0.20)',
    accent: '#B8C4B8',
    label: '#B8C4B8',
  },
  blowdry: {
    bg: 'rgba(216, 200, 212, 0.06)',
    border: 'rgba(216, 200, 212, 0.20)',
    accent: '#C8B8C4',
    label: '#C8B8C4',
  },
  highlights: {
    bg: 'rgba(228, 216, 200, 0.06)',
    border: 'rgba(228, 216, 200, 0.20)',
    accent: '#D4C8B8',
    label: '#D4C8B8',
  },
  gloss: {
    bg: 'rgba(208, 212, 220, 0.06)',
    border: 'rgba(208, 212, 220, 0.20)',
    accent: '#C0C4CC',
    label: '#C0C4CC',
  },
  keratin: {
    bg: 'rgba(216, 208, 196, 0.06)',
    border: 'rgba(216, 208, 196, 0.20)',
    accent: '#C8C0B4',
    label: '#C8C0B4',
  },
};

// Option D: Warm Sunset Gradient
const paletteD = {
  haircut: {
    bg: 'rgba(196, 168, 130, 0.09)',
    border: 'rgba(196, 168, 130, 0.28)',
    accent: '#B49870',
    label: '#B49870',
  },
  color: {
    bg: 'rgba(176, 196, 168, 0.09)',
    border: 'rgba(176, 196, 168, 0.28)',
    accent: '#A0B498',
    label: '#A0B498',
  },
  blowdry: {
    bg: 'rgba(208, 168, 184, 0.09)',
    border: 'rgba(208, 168, 184, 0.28)',
    accent: '#C098A8',
    label: '#C098A8',
  },
  highlights: {
    bg: 'rgba(232, 192, 144, 0.09)',
    border: 'rgba(232, 192, 144, 0.28)',
    accent: '#D8B080',
    label: '#D8B080',
  },
  gloss: {
    bg: 'rgba(184, 196, 216, 0.09)',
    border: 'rgba(184, 196, 216, 0.28)',
    accent: '#A8B4C8',
    label: '#A8B4C8',
  },
  keratin: {
    bg: 'rgba(208, 184, 160, 0.09)',
    border: 'rgba(208, 184, 160, 0.28)',
    accent: '#C0A890',
    label: '#C0A890',
  },
};

const palettes = { A: paletteA, B: paletteB, C: paletteC, D: paletteD };

// ============ MOCK BOOKING DATA ============
const mockBookings = [
  {
    id: '1',
    serviceType: 'color',
    modelName: 'Seraphina Luna',
    modelEmail: 'seraphina@example.com',
    modelPhone: '(555) 123-4567',
    appointmentDate: '2024-12-15',
    appointmentTime: '2:00 PM',
    duration: 180,
    modelFee: 30,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Full color treatment with balayage highlights',
    bookingId: 'BK-2024-0015',
  },
  {
    id: '2',
    serviceType: 'haircut',
    modelName: 'Emma Johnson',
    modelEmail: 'emma@example.com',
    modelPhone: '(555) 234-5678',
    appointmentDate: '2024-12-16',
    appointmentTime: '10:00 AM',
    duration: 60,
    modelFee: 25,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Precision cut with texturizing',
    bookingId: 'BK-2024-0016',
  },
  {
    id: '3',
    serviceType: 'blowdry',
    modelName: 'Olivia Smith',
    modelEmail: 'olivia@example.com',
    modelPhone: '(555) 345-6789',
    appointmentDate: '2024-12-17',
    appointmentTime: '3:00 PM',
    duration: 45,
    modelFee: 20,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Professional blowout styling',
    bookingId: 'BK-2024-0017',
  },
  {
    id: '4',
    serviceType: 'highlights',
    modelName: 'Sophia Williams',
    modelEmail: 'sophia@example.com',
    modelPhone: '(555) 456-7890',
    appointmentDate: '2024-12-18',
    appointmentTime: '11:00 AM',
    duration: 150,
    modelFee: 30,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Partial highlights with foils',
    bookingId: 'BK-2024-0018',
  },
  {
    id: '5',
    serviceType: 'gloss',
    modelName: 'Isabella Brown',
    modelEmail: 'isabella@example.com',
    modelPhone: '(555) 567-8901',
    appointmentDate: '2024-12-19',
    appointmentTime: '1:00 PM',
    duration: 60,
    modelFee: 25,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Shine and toning treatment',
    bookingId: 'BK-2024-0019',
  },
  {
    id: '6',
    serviceType: 'keratin',
    modelName: 'Ava Davis',
    modelEmail: 'ava@example.com',
    modelPhone: '(555) 678-9012',
    appointmentDate: '2024-12-20',
    appointmentTime: '9:00 AM',
    duration: 180,
    modelFee: 35,
    status: 'confirmed',
    location: 'Luxe Studio - 123 Main St, NYC',
    serviceDescription: 'Keratin smoothing treatment',
    bookingId: 'BK-2024-0020',
  },
];

// Helper function to calculate end time
const calculateEndTime = (startTime, durationMinutes) => {
  const [time, period] = startTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  if (period === 'PM' && hours !== 12) hour24 += 12;
  if (period === 'AM' && hours === 12) hour24 = 0;
  
  const startDate = new Date();
  startDate.setHours(hour24, minutes, 0, 0);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
  
  const endHours = endDate.getHours();
  const endMins = endDate.getMinutes();
  const endPeriod = endHours >= 12 ? 'PM' : 'AM';
  const displayHours = endHours > 12 ? endHours - 12 : (endHours === 0 ? 12 : endHours);
  
  return `${displayHours}:${endMins.toString().padStart(2, '0')} ${endPeriod}`;
};

// Helper function to get day of week
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    background: '#FFFEF9',
    minHeight: '100vh',
    fontFamily: '"Alike", "Georgia", serif',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#5A3A2A',
    marginBottom: '2rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Selector Bar
  selectorBar: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.08)',
  },
  selectorTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectorRow: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
  selectorGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  selectorLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  selectorButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  selectorBtn: {
    padding: '0.5rem 1rem',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
    color: '#4A2A1A',
  },
  selectorBtnActive: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    borderColor: '#8B1E3F',
    color: '#FFFEF9',
  },
  
  // Style 1: Magazine Card Grid
  style1Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  style1Card: (colors) => ({
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderLeft: `4px solid ${colors.accent}`,
    borderRadius: '16px',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  }),
  style1Badge: (colors) => ({
    display: 'inline-block',
    padding: '0.4rem 0.9rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: colors.bg,
    color: colors.label,
    border: `1px solid ${colors.border}`,
    marginBottom: '1rem',
  }),
  style1ModelName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style1Details: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style1Fee: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginTop: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Style 2: Timeline Vertical Stack
  style2Timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  style2Card: (colors) => ({
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    background: colors.bg,
    borderLeft: `5px solid ${colors.accent}`,
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  }),
  style2Icon: (colors) => ({
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: colors.bg,
    border: `2px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0,
  }),
  style2Content: {
    flex: 1,
  },
  style2Service: (colors) => ({
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: colors.label,
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  }),
  
  // Style 3: Minimal Card Stack
  style3Stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  style3Card: (colors) => ({
    background: colors.bg,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '1.75rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  }),
  style3AccentBar: (colors) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: colors.accent,
  }),
  
  // Style 4: Magazine Spread
  style4Layout: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  style4ViewToggle: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    justifyContent: 'flex-end',
  },
  style4ToggleBtn: (isActive) => ({
    padding: '0.75rem 1.5rem',
    background: isActive ? 'rgba(139, 30, 63, 0.1)' : 'transparent',
    border: `2px solid ${isActive ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: isActive ? '#8B1E3F' : '#5A3A2A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  }),
  style4Grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  style4CardWrapper: {
    width: '100%',
    perspective: '1000px',
    minHeight: '280px',
    cursor: 'pointer',
  },
  style4CardInner: (isFlipped) => ({
    position: 'relative',
    width: '100%',
    minHeight: '280px',
    transition: 'transform 0.6s',
    transformStyle: 'preserve-3d',
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  }),
  style4Card: (colors) => ({
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
    border: `2px solid ${colors.border}`,
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '0',
    transition: 'all 0.3s ease',
    minHeight: '280px',
    width: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    position: 'relative',
  }),
  style4CardBack: (colors) => ({
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.15')}, ${colors.bg})`,
    border: `2px solid ${colors.border}`,
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '0',
    minHeight: '280px',
    width: '100%',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }),
  style4Photo: (colors) => ({
    width: '100%',
    height: '100%',
    minHeight: '280px',
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.20')}, ${colors.bg})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRight: `2px solid ${colors.border}`,
  }),
  style4PhotoPlaceholder: {
    width: '80%',
    height: '80%',
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: '300',
    color: 'rgba(74, 42, 26, 0.3)',
    fontFamily: '"Alike", "Georgia", serif',
    textAlign: 'center',
    padding: '1rem',
  },
  style4Badge: (colors) => ({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.6rem 1.2rem',
    borderRadius: '30px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    background: colors.accent,
    color: '#FFFEF9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: '"Alike", "Georgia", serif',
  }),
  style4Content: {
    padding: '1.75rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  style4Header: {
    marginBottom: '1rem',
  },
  style4ModelName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4DateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    flexWrap: 'wrap',
  },
  style4DayOfWeek: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  style4Date: {
    fontSize: '0.95rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4TimeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4TimeLabel: {
    fontWeight: '600',
    color: '#5A3A2A',
  },
  style4TimeRange: {
    fontWeight: '600',
    color: '#4A2A1A',
  },
  style4Duration: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4DetailsSection: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
  },
  style4DetailRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.5rem',
    marginBottom: '0.75rem',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4DetailLabel: {
    fontWeight: '600',
    minWidth: '80px',
    color: '#4A2A1A',
  },
  style4DetailValue: {
    flex: 1,
  },
  style4Fee: {
    fontSize: '1.1rem',
    fontWeight: '700',
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
    fontFamily: '"Alike", "Georgia", serif',
  },
  style4Actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  style4ActionBtn: (colors) => ({
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: colors.accent,
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  }),
  
  // Calendar Visual
  calendarCard: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    padding: '1.5rem',
    position: 'sticky',
    top: '2rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  calendarMonth: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  calendarNavBtn: {
    width: '32px',
    height: '32px',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.9rem',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  calendarDayHeader: {
    padding: '0.5rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarDayCell: {
    aspectRatio: '1',
    padding: '0.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '50px',
  },
  calendarDayNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarDayDots: {
    display: 'flex',
    gap: '3px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  calendarDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  
  // Style 5: Compact List View
  style5List: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  style5Row: (colors) => ({
    display: 'grid',
    gridTemplateColumns: '60px 1fr 140px 120px 100px auto',
    gap: '1rem',
    padding: '1rem 1.5rem',
    background: colors.bg,
    borderLeft: `4px solid ${colors.accent}`,
    borderRadius: '8px',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  }),
  style5Dot: (colors) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: colors.accent,
    boxShadow: `0 0 0 3px ${colors.bg}`,
  }),
  
  // Style 6: Pinterest Grid
  style6Grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  style6Card: (colors) => ({
    background: colors.bg,
    border: `2px solid ${colors.border}`,
    borderRadius: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  }),
  style6Photo: (colors) => ({
    width: '100%',
    height: '280px',
    background: `linear-gradient(135deg, ${colors.bg.replace('0.08', '0.20')}, ${colors.bg})`,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  }),
  style6Label: (colors) => ({
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    background: colors.accent,
    color: '#FFFEF9',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  }),
  style6Content: {
    padding: '1.25rem',
  },
};

// ============ COMPONENT ============
export default function BookedPageDesignDemo() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState('4'); // Default to Magazine Spread
  const [selectedPalette, setSelectedPalette] = useState('A'); // Default to Muted Pastel
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'calendar'
  const [flippedCards, setFlippedCards] = useState(new Set());
  
  const currentPalette = palettes[selectedPalette];
  
  const getServiceColors = (serviceType) => {
    return currentPalette[serviceType] || {
      bg: '#FFFEF9',
      border: 'rgba(139, 30, 63, 0.15)',
      accent: '#8B1E3F',
      label: '#8B1E3F',
    };
  };
  
  // Render Style 1: Magazine Card Grid
  const renderStyle1 = () => (
    <div style={styles.style1Grid}>
      {mockBookings.map(booking => {
        const colors = getServiceColors(booking.serviceType);
        const service = getServiceById(booking.serviceType);
        return (
          <div
            key={booking.id}
            style={styles.style1Card(colors)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${colors.border}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.style1Badge(colors)}>
              {service?.name || booking.serviceType.toUpperCase()}
            </div>
            <div style={styles.style1ModelName}>{booking.modelName}</div>
            <div style={styles.style1Details}>
              {new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div style={styles.style1Details}>
              {booking.appointmentTime} • {service?.duration || booking.duration} min
            </div>
            <div style={{ ...styles.style1Fee, color: colors.accent }}>
              Model Fee: ${booking.modelFee}
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Render Style 2: Timeline Vertical Stack
  const renderStyle2 = () => (
    <div style={styles.style2Timeline}>
      {mockBookings.map(booking => {
        const colors = getServiceColors(booking.serviceType);
        const service = getServiceById(booking.serviceType);
        return (
          <div
            key={booking.id}
            style={styles.style2Card(colors)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(8px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.style2Icon(colors)}>
              {service?.name.substring(0, 2).toUpperCase() || booking.serviceType.substring(0, 2).toUpperCase()}
            </div>
            <div style={styles.style2Content}>
              <div style={styles.style2Service(colors)}>
                {service?.name || booking.serviceType.toUpperCase()}
              </div>
              <div style={styles.style1ModelName}>{booking.modelName}</div>
              <div style={styles.style1Details}>
                {new Date(booking.appointmentDate).toLocaleDateString()} • {booking.appointmentTime} • {service?.duration || booking.duration} min
              </div>
              <div style={{ ...styles.style1Fee, color: colors.accent }}>
                Model Fee: ${booking.modelFee}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Render Style 3: Minimal Card Stack
  const renderStyle3 = () => (
    <div style={styles.style3Stack}>
      {mockBookings.map(booking => {
        const colors = getServiceColors(booking.serviceType);
        const service = getServiceById(booking.serviceType);
        return (
          <div
            key={booking.id}
            style={styles.style3Card(colors)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.style3AccentBar(colors)} />
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ ...styles.style2Service(colors), marginBottom: '0.75rem' }}>
                {service?.name || booking.serviceType.toUpperCase()}
              </div>
              <div style={styles.style1ModelName}>{booking.modelName}</div>
              <div style={styles.style1Details}>
                {new Date(booking.appointmentDate).toLocaleDateString()} • {booking.appointmentTime} • {service?.duration || booking.duration} min
              </div>
              <div style={{ ...styles.style1Fee, color: colors.accent, marginTop: '0.5rem' }}>
                Model Fee: ${booking.modelFee}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  // Render Calendar Visual
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      const dayOfMonth = dayDate.getDate();
      const isCurrentMonth = dayDate.getMonth() === month;
      
      // Find bookings for this day
      const dayBookings = mockBookings.filter(b => {
        const bookingDate = new Date(b.appointmentDate);
        return bookingDate.toDateString() === dayDate.toDateString();
      });
      
      days.push({
        date: dayDate,
        day: isCurrentMonth ? dayOfMonth : null,
        isCurrentMonth,
        isToday: dayDate.toDateString() === new Date().toDateString(),
        bookings: dayBookings,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    return (
      <div style={styles.calendarCard}>
        <div style={styles.calendarHeader}>
          <div style={styles.calendarMonth}>{monthName}</div>
          <div style={styles.calendarNav}>
            <button
              style={styles.calendarNavBtn}
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            >
              ←
            </button>
            <button
              style={styles.calendarNavBtn}
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            >
              →
            </button>
          </div>
        </div>
        
        <div style={styles.calendarGrid}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={styles.calendarDayHeader}>{day}</div>
          ))}
          
          {days.map((day, index) => (
            <div
              key={index}
              style={{
                ...styles.calendarDayCell,
                background: day.isToday ? 'rgba(139, 30, 63, 0.1)' : 
                           day.isCurrentMonth ? '#FFFEF9' : 'rgba(139, 30, 63, 0.02)',
                opacity: day.isCurrentMonth ? 1 : 0.4,
                border: day.isToday ? '2px solid #8B1E3F' : '1px solid rgba(139, 30, 63, 0.1)',
              }}
            >
              {day.day && (
                <>
                  <div style={styles.calendarDayNumber}>{day.day}</div>
                  {day.bookings.length > 0 && (
                    <div style={styles.calendarDayDots}>
                      {day.bookings.map((booking, idx) => {
                        const colors = getServiceColors(booking.serviceType);
                        return (
                          <div
                            key={idx}
                            style={{
                              ...styles.calendarDot,
                              background: colors.accent,
                            }}
                            title={`${booking.serviceType} - ${booking.modelName}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        {/* Legend */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(139, 30, 63, 0.1)',
        }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#5A3A2A',
            marginBottom: '0.75rem',
            fontFamily: '"Alike", "Georgia", serif',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Service Types
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {Object.entries(currentPalette).map(([serviceType, colors]) => {
              const service = getServiceById(serviceType);
              return (
                <div key={serviceType} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: colors.accent,
                  }} />
                  <span style={{ color: '#4A2A1A' }}>{service?.name || serviceType}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Render Style 4: Magazine Spread (Enhanced with Flip Cards)
  const renderStyle4 = () => {
    const endTime = (booking) => calculateEndTime(booking.appointmentTime, booking.duration);
    const dayOfWeek = (dateString) => getDayOfWeek(dateString);
    
    const toggleFlip = (bookingId) => {
      setFlippedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(bookingId)) {
          newSet.delete(bookingId);
        } else {
          newSet.add(bookingId);
        }
        return newSet;
      });
    };
    
    const handleMessage = (e, booking) => {
      e.stopPropagation();
      navigate('/portal/chat', { state: { modelId: booking.id, modelName: booking.modelName } });
    };
    
    const handleViewProfile = (e, booking) => {
      e.stopPropagation();
      navigate('/portal/model/profile', { state: { modelId: booking.id } });
    };
    
    if (viewMode === 'calendar') {
      return (
        <div style={styles.style4Layout}>
          <div style={styles.style4ViewToggle}>
            <button
              style={styles.style4ToggleBtn(false)}
              onClick={() => setViewMode('cards')}
            >
              Cards View
            </button>
            <button
              style={styles.style4ToggleBtn(true)}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            {renderCalendar()}
          </div>
        </div>
      );
    }
    
    return (
      <div style={styles.style4Layout}>
        {/* View Toggle */}
        <div style={styles.style4ViewToggle}>
          <button
            style={styles.style4ToggleBtn(true)}
            onClick={() => setViewMode('cards')}
          >
            Cards View
          </button>
          <button
            style={styles.style4ToggleBtn(false)}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
        </div>
        
        {/* Cards Grid */}
        <div style={styles.style4Grid}>
          {mockBookings.map(booking => {
            const colors = getServiceColors(booking.serviceType);
            const service = getServiceById(booking.serviceType);
            const bookingEndTime = endTime(booking);
            const dayName = dayOfWeek(booking.appointmentDate);
            const formattedDate = new Date(booking.appointmentDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });
            const isFlipped = flippedCards.has(booking.id);
            
            // Extract salon name from location
            const salonName = booking.location ? booking.location.split(' - ')[0] : 'Luxe Studio';
            
            return (
              <div
                key={booking.id}
                style={styles.style4CardWrapper}
                onClick={() => toggleFlip(booking.id)}
              >
                <div style={styles.style4CardInner(isFlipped)}>
                  {/* FRONT OF CARD */}
                  <div
                    style={styles.style4Card(colors)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = `0 12px 32px ${colors.border}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={styles.style4Photo(colors)}>
                      <div style={styles.style4Badge(colors)}>
                        {service?.name || booking.serviceType.toUpperCase()}
                      </div>
                      <div style={styles.style4PhotoPlaceholder}>
                        {service?.name.substring(0, 3).toUpperCase() || booking.serviceType.substring(0, 3).toUpperCase()}
                      </div>
                    </div>
                    <div style={styles.style4Content}>
                      <div style={styles.style4Header}>
                        {/* Model Name */}
                        <div style={styles.style4ModelName}>{booking.modelName}</div>
                        
                        {/* Service */}
                        <div style={{
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          color: colors.accent,
                          marginBottom: '0.75rem',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          {service?.name || booking.serviceType.toUpperCase()}
                        </div>
                        
                        {/* Date with Day of Week */}
                        <div style={styles.style4DateRow}>
                          <span style={styles.style4DayOfWeek}>{dayName}</span>
                          <span style={styles.style4Date}>{formattedDate}</span>
                        </div>
                        
                        {/* Time Range */}
                        <div style={styles.style4TimeRow}>
                          <span style={styles.style4TimeLabel}>Time:</span>
                          <span style={styles.style4TimeRange}>
                            {booking.appointmentTime} - {bookingEndTime}
                          </span>
                        </div>
                        
                        {/* Status Badge */}
                        <div style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.7rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          background: booking.status === 'confirmed' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(139, 30, 63, 0.15)',
                          color: booking.status === 'confirmed' ? '#4caf50' : '#8B1E3F',
                          marginTop: '0.75rem',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          {booking.status}
                        </div>
                        
                        {/* Salon */}
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#5A3A2A',
                          marginTop: '0.75rem',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          {salonName}
                        </div>
                      </div>
                      
                      {/* Flip Hint */}
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#5A3A2A',
                        marginTop: 'auto',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        fontFamily: '"Alike", "Georgia", serif',
                      }}>
                        Click to view details
                      </div>
                    </div>
                  </div>
                  
                  {/* BACK OF CARD */}
                  <div style={styles.style4CardBack(colors)}>
                    <div style={styles.style4Photo(colors)}>
                      <div style={styles.style4Badge(colors)}>
                        {service?.name || booking.serviceType.toUpperCase()}
                      </div>
                      <div style={styles.style4PhotoPlaceholder}>
                        {service?.name.substring(0, 3).toUpperCase() || booking.serviceType.substring(0, 3).toUpperCase()}
                      </div>
                    </div>
                    <div style={styles.style4Content}>
                      <div style={styles.style4Header}>
                        <div style={styles.style4ModelName}>{booking.modelName}</div>
                        
                        {/* Details Section - NO MODEL FEES */}
                        <div style={styles.style4DetailsSection}>
                          {booking.serviceDescription && (
                            <div style={styles.style4DetailRow}>
                              <span style={styles.style4DetailLabel}>Service:</span>
                              <span style={styles.style4DetailValue}>{booking.serviceDescription}</span>
                            </div>
                          )}
                          {booking.location && (
                            <div style={styles.style4DetailRow}>
                              <span style={styles.style4DetailLabel}>Location:</span>
                              <span style={styles.style4DetailValue}>{booking.location}</span>
                            </div>
                          )}
                          {booking.modelEmail && (
                            <div style={styles.style4DetailRow}>
                              <span style={styles.style4DetailLabel}>Email:</span>
                              <span style={styles.style4DetailValue}>{booking.modelEmail}</span>
                            </div>
                          )}
                          {booking.modelPhone && (
                            <div style={styles.style4DetailRow}>
                              <span style={styles.style4DetailLabel}>Phone:</span>
                              <span style={styles.style4DetailValue}>{booking.modelPhone}</span>
                            </div>
                          )}
                          {booking.bookingId && (
                            <div style={styles.style4DetailRow}>
                              <span style={styles.style4DetailLabel}>Booking ID:</span>
                              <span style={styles.style4DetailValue}>{booking.bookingId}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Quick Actions */}
                        <div style={styles.style4Actions}>
                          <button
                            style={styles.style4ActionBtn(colors)}
                            onClick={(e) => handleMessage(e, booking)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.bg;
                              e.currentTarget.style.borderColor = colors.accent;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = colors.border;
                            }}
                          >
                            Message
                          </button>
                          <button
                            style={styles.style4ActionBtn(colors)}
                            onClick={(e) => handleViewProfile(e, booking)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = colors.bg;
                              e.currentTarget.style.borderColor = colors.accent;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = colors.border;
                            }}
                          >
                            Model Profile
                          </button>
                        </div>
                        
                        {/* Flip Hint */}
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#5A3A2A',
                          marginTop: '1rem',
                          textAlign: 'center',
                          fontStyle: 'italic',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          Click to flip back
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // Render Style 5: Compact List View
  const renderStyle5 = () => (
    <div style={styles.style5List}>
      {mockBookings.map(booking => {
        const colors = getServiceColors(booking.serviceType);
        const service = getServiceById(booking.serviceType);
        return (
          <div
            key={booking.id}
            style={styles.style5Row(colors)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={styles.style5Dot(colors)} />
            </div>
            <div>
              <div style={{ ...styles.style1ModelName, fontSize: '1rem', marginBottom: '0.25rem' }}>
                {service?.name || booking.serviceType.toUpperCase()}
              </div>
              <div style={{ ...styles.style1Details, fontSize: '0.85rem' }}>{booking.modelName}</div>
            </div>
            <div style={styles.style1Details}>
              {new Date(booking.appointmentDate).toLocaleDateString()}
            </div>
            <div style={styles.style1Details}>{booking.appointmentTime}</div>
            <div style={{ ...styles.style1Fee, color: colors.accent, fontSize: '0.9rem' }}>
              ${booking.modelFee}
            </div>
            <button style={{
              padding: '0.4rem 0.8rem',
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: colors.accent,
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              Details
            </button>
          </div>
        );
      })}
    </div>
  );
  
  // Render Style 6: Pinterest Grid
  const renderStyle6 = () => (
    <div style={styles.style6Grid}>
      {mockBookings.map(booking => {
        const colors = getServiceColors(booking.serviceType);
        const service = getServiceById(booking.serviceType);
        return (
          <div
            key={booking.id}
            style={styles.style6Card(colors)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = `0 12px 32px ${colors.border}50`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.style6Photo(colors)}>
              <div style={styles.style6Label(colors)}>
                {service?.name || booking.serviceType.toUpperCase()}
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '300',
                color: 'rgba(74, 42, 26, 0.3)',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {service?.name.substring(0, 3).toUpperCase() || booking.serviceType.substring(0, 3).toUpperCase()}
              </div>
            </div>
            <div style={styles.style6Content}>
              <div style={styles.style1ModelName}>{booking.modelName}</div>
              <div style={styles.style1Details}>
                {new Date(booking.appointmentDate).toLocaleDateString()}
              </div>
              <div style={styles.style1Details}>
                {booking.appointmentTime} • {service?.duration || booking.duration} min
              </div>
              <div style={{ ...styles.style1Fee, color: colors.accent, marginTop: '0.5rem' }}>
                Model Fee: ${booking.modelFee}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
  
  const renderSelectedStyle = () => {
    switch (selectedStyle) {
      case '1': return renderStyle1();
      case '2': return renderStyle2();
      case '3': return renderStyle3();
      case '4': return renderStyle4();
      case '5': return renderStyle5();
      case '6': return renderStyle6();
      default: return renderStyle1();
    }
  };
  
  const styleNames = {
    '1': 'Magazine Card Grid',
    '2': 'Timeline Vertical Stack',
    '3': 'Minimal Card Stack',
    '4': 'Magazine Spread',
    '5': 'Compact List View',
    '6': 'Pinterest Grid',
  };
  
  const paletteNames = {
    'A': 'Muted Pastel (Recommended)',
    'B': 'Earthy Warm',
    'C': 'Soft Neutrals',
    'D': 'Warm Sunset',
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Booked Page Design Options</h1>
        <p style={styles.subtitle}>
          Select a style and color palette to see how your booked sessions will look. 
          All designs use service-type color coding for easy visual differentiation.
        </p>
      </div>
      
      {/* Selector Bar */}
      <div style={styles.selectorBar}>
        <div style={styles.selectorTitle}>Choose Your Design</div>
        
        <div style={styles.selectorRow}>
          <div style={styles.selectorGroup}>
            <div style={styles.selectorLabel}>Layout Style</div>
            <div style={styles.selectorButtons}>
              {['1', '2', '3', '4', '5', '6'].map(style => (
                <button
                  key={style}
                  style={{
                    ...styles.selectorBtn,
                    ...(selectedStyle === style ? styles.selectorBtnActive : {}),
                  }}
                  onClick={() => setSelectedStyle(style)}
                >
                  {styleNames[style]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div style={styles.selectorRow}>
          <div style={styles.selectorGroup}>
            <div style={styles.selectorLabel}>Color Palette</div>
            <div style={styles.selectorButtons}>
              {['A', 'B', 'C', 'D'].map(palette => (
                <button
                  key={palette}
                  style={{
                    ...styles.selectorBtn,
                    ...(selectedPalette === palette ? styles.selectorBtnActive : {}),
                  }}
                  onClick={() => setSelectedPalette(palette)}
                >
                  {paletteNames[palette]}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: 'rgba(139, 30, 63, 0.05)',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#5A3A2A',
          fontFamily: '"Alike", "Georgia", serif',
        }}>
          <strong>Current Selection:</strong> {styleNames[selectedStyle]} with {paletteNames[selectedPalette]} palette
        </div>
      </div>
      
      {/* Render Selected Style */}
      <div>
        {renderSelectedStyle()}
      </div>
    </div>
  );
}
