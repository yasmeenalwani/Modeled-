// ============================================
// MY SESSIONS - Consolidated Page
// Sessions + Calendar + Photos in one unified view
// ============================================

import React, { useState, useMemo, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getServiceById, formatDuration } from '../../admin/data/services';
import PhotoUploader from '../../components/PhotoUploader';
import GalleryTagFilter from '../../components/GalleryTagFilter';
import { getProfilePhotoPath } from '../../utils/storage';
import { photoMatchesTags } from '../../utils/galleryTags';
import AddToCalendar from '../../components/AddToCalendar';
import LocationHelper from '../../components/LocationHelper';
import ModelToProChat from '../../components/ModelToProChat';
import ChatSchedule from '../../components/ChatSchedule';
import InspirationBoard from '../../components/InspirationBoard';
import BeautyMaintenanceTimeline from '../../components/BeautyMaintenanceTimeline';
import { getUnreadNotificationsForUser, markNotificationAsRead } from '../../admin/data/mockNotifications';
import { createBookingFromMatch } from '../../utils/bookingService';
import { createNotification } from '../../utils/createNotification';
import { getMatchesForModel, acceptMatch, declineMatch } from '../../utils/matchService';
import { getPhotoForService, handleImageError } from '../../utils/imageHelpers';
import { shouldUseMockData } from '../../utils/mockDataService';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // View switcher
  viewSwitcher: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '1rem',
  },
  viewBtn: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  viewBtnActive: {
    background: 'rgba(139, 30, 63, 0.15)',
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '8px',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
  },
  
  // Stats
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Calendar view
  calendarContainer: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  calendarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  calendarMonth: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarNav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '6px',
    color: '#4A2A1A', // Darker rich espresso brown
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0.5rem',
  },
  dayHeader: {
    padding: '0.75rem',
    textAlign: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#5A3A2A', // Darker espresso brown (muted)
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayCell: {
    minHeight: '100px',
    padding: '0.5rem',
    background: 'rgba(139, 30, 63, 0.03)',
    border: '1px solid rgba(139, 30, 63, 0.1)',
    borderRadius: '6px',
    position: 'relative',
    cursor: 'pointer',
  },
  dayCellToday: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F', // Cherry
  },
  dayNumber: {
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  dayEvents: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    marginTop: '0.25rem',
  },
  event: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    background: 'rgba(139, 30, 63, 0.15)',
    borderLeft: '3px solid #8B1E3F',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Sessions list view
  sessionsList: {},
  sessionCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'grid',
    gridTemplateColumns: '80px 1fr auto',
    gap: '1.5rem',
    alignItems: 'center',
  },
  sessionIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    background: 'rgba(139, 30, 63, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
  },
  sessionInfo: {},
  sessionService: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionMeta: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  sessionRight: {
    textAlign: 'right',
  },
  sessionDate: {
    marginTop: '0.75rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Photos view
  contentLayout: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },
  filterSidebar: {
    position: 'sticky',
    top: '2rem',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  },
  photoCard: {
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  photoImage: {
    aspectRatio: '4/5',
    background: 'linear-gradient(135deg, rgba(233,69,96,0.3), rgba(255,107,138,0.2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  actualImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoEmoji: {
    fontSize: '4rem',
  },
  photoInfo: {
    padding: '1rem',
  },
  photoService: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  photoDate: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Unified view
  unifiedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  unifiedCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  unifiedCardType: {
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: '"Alike", "Georgia", serif',
  },
  unifiedCardContent: {
    padding: '1.5rem',
  },
  
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function ModelSessionsConsolidated() {
  const { user } = useAuthenticator();
  const [view, setView] = useState('unified'); // 'unified', 'sessions', 'calendar', 'photos', 'requests'
  const [filter, setFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [modelProfile, setModelProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingMatches, setPendingMatches] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    if (user) {
      loadModelProfile();
    }
  }, [user]);

  useEffect(() => {
    if (modelProfile) {
      loadBookings();
      loadBookingRequests();
      loadPendingMatches();
    }
  }, [modelProfile]);

  // Mock matches for "good model" - always shows some matches
  const mockPendingMatches = [
    {
      id: 'match-1',
      matchScore: 94,
      serviceType: 'balayage',
      professionalName: 'Sarah M.',
      location: 'Luxe Studio, Upper East Side',
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      appointmentTime: '10:00 AM',
      modelFee: 50,
      status: 'sent',
    },
    {
      id: 'match-2',
      matchScore: 87,
      serviceType: 'color-correction',
      professionalName: 'Amanda L.',
      location: 'Color Bar, West Village',
      appointmentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      appointmentTime: '2:00 PM',
      modelFee: 60,
      status: 'sent',
    },
    {
      id: 'match-3',
      matchScore: 82,
      serviceType: 'blowout',
      professionalName: 'Jessica K.',
      location: 'Glamour Salon, Soho',
      appointmentDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      appointmentTime: '3:00 PM',
      modelFee: 30,
      status: 'sent',
    },
  ];

  const normalizeMatchStatus = (status) => {
    if (!status || status === 'approved' || status === 'pending') return 'sent';
    return status;
  };

  const loadPendingMatches = async () => {
    try {
      if (!modelProfile?.id) {
        // Use mock matches if no profile
        setPendingMatches(mockPendingMatches);
        return;
      }
      
      const allMatches = await getMatchesForModel(modelProfile.id);
      // Filter to only sent opportunities (schema-aligned)
      const pending = (allMatches || []).filter(
        m => normalizeMatchStatus(m.status) === 'sent'
      );
      // Use mock matches if no real matches found (for demo purposes)
      setPendingMatches(pending.length > 0 ? pending : mockPendingMatches);
    } catch (error) {
      console.error('Error loading pending matches:', error);
      // Fall back to mock matches on error
      setPendingMatches(mockPendingMatches);
    }
  };

  const loadModelProfile = async () => {
    if (shouldUseMockData()) return;
    try {
      const model = client?.models?.ModelProfile;
      if (!model || typeof model.list !== 'function') return;
      const userId = user?.userId || user?.username;
      const { data: profiles } = await model.list({
        filter: { userId: { eq: userId } },
      });
      if (profiles && profiles.length > 0) {
        setModelProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleQuickMessage = async (promptType, booking) => {
    if (!booking || shouldUseMockData()) return;
    const chatModel = client?.models?.ModelToProChat;
    const msgModel = client?.models?.ModelToProMessage;
    if (!chatModel?.list || !chatModel?.create || !msgModel?.create) return;
    
    try {
      const { data: chats } = await chatModel.list({
        filter: { bookingId: { eq: booking.id } },
      });
      
      let chat = chats && chats.length > 0 ? chats[0] : null;
      
      if (!chat) {
        const appointmentDateTime = new Date(`${booking.appointmentDate}T${booking.appointmentTime}`);
        const chatOpensAt = new Date(appointmentDateTime.getTime() - 60 * 60 * 1000);
        const chatClosesAt = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        const { data: newChat } = await chatModel.create({
          bookingId: booking.id,
          modelId: booking.modelId,
          professionalId: booking.professionalId,
          chatOpensAt: chatOpensAt.toISOString(),
          chatClosesAt: chatClosesAt.toISOString(),
          isActive: false,
          status: 'pending',
        });
        chat = newChat;
      }
      
      const promptMessages = {
        'omw': 'On my way!',
        '5_mins_out': 'Be there in 5 minutes!',
        'just_got_off_subway': 'Just got off the subway, almost there!',
        'running_late': 'Running a bit late, sorry!',
      };
      
      await msgModel.create({
        chatId: chat.id,
        senderId: user?.userId || user?.username,
        senderType: 'model',
        senderName: modelProfile?.firstName || 'Model',
        content: promptMessages[promptType] || promptType,
        messageType: 'quick_prompt',
        quickPromptType: promptType,
      });
    } catch (error) {
      console.error('Error sending quick message:', error);
    }
  };

  const loadBookingRequests = () => {
    // Get booking requests (notifications) for this model
    // For mock data, we'll use the first mock model's ID pattern
    const modelUserId = user?.userId || `user-1`; // Default to first mock model
    const requests = getUnreadNotificationsForUser(modelUserId);
    setBookingRequests(requests);
  };

  const loadBookings = async () => {
    if (shouldUseMockData()) {
      setLoading(false);
      return;
    }
    const bookingModel = client?.models?.Booking;
    if (!bookingModel || typeof bookingModel.list !== 'function') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const userId = user?.userId || user?.username;
      
      // Load bookings from database
      const { data: bookingsData } = await bookingModel.list({
        filter: { modelId: { eq: modelProfile?.id } },
        limit: 100,
      });

      // Enrich bookings with professional details
      const enrichedBookings = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          try {
            const { data: professional } = await client.models.Professional.get({
              id: booking.professionalId,
            });
            const { data: request } = await client.models.ModelRequest.get({
              id: booking.requestId,
            });

            return {
              ...booking,
              professionalName: professional
                ? `${professional.firstName} ${professional.lastName.charAt(0)}.`
                : 'Unknown',
              salonName: professional?.salonName || 'Unknown Salon',
              serviceName: request?.serviceType || booking.serviceType || 'Service',
            };
          } catch (err) {
            return {
              ...booking,
              professionalName: 'Unknown',
              salonName: 'Unknown Salon',
              serviceName: booking.serviceType || 'Service',
            };
          }
        })
      );

      setBookings(enrichedBookings);

      // Convert bookings to sessions format
      const sessionsFromBookings = enrichedBookings.map((booking) => {
        const service = getServiceById(booking.serviceType);
        const category = service?.category || 'other';
        
        return {
          id: booking.id,
          type: 'session',
          service: booking.serviceName || booking.serviceType,
          category,
          date: booking.appointmentDate
            ? new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'TBD',
          time: booking.appointmentTime || 'TBD',
          pro: booking.professionalName || 'Unknown',
          salon: booking.salonName || 'Unknown Salon',
          duration: `${booking.duration || 60} min`,
          originalPrice: service?.price || 0,
          paid: booking.modelFee || 0,
          status: booking.status || 'pending',
          rating: booking.modelRating || null,
        };
      });

      setSessions(sessionsFromBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced mock data for "good model" scenario
  const mockBookingsForGoodModel = [
    {
      id: 'mock-1',
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
      appointmentTime: '10:00 AM',
      serviceType: 'balayage',
      location: 'Luxe Studio, Upper East Side',
      professionalId: 'pro-1',
      professionalName: 'Sarah M.',
      salonName: 'Luxe Studio',
      modelFee: 45,
      status: 'confirmed',
    },
    {
      id: 'mock-2',
      appointmentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      appointmentTime: '2:00 PM',
      serviceType: 'blowout',
      location: 'Glamour Salon, Soho',
      professionalId: 'pro-2',
      professionalName: 'Jessica K.',
      salonName: 'Glamour Salon',
      modelFee: 25,
      status: 'confirmed',
    },
    {
      id: 'mock-3',
      appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
      appointmentTime: '11:00 AM',
      serviceType: 'color-correction',
      location: 'Color Bar, West Village',
      professionalId: 'pro-3',
      professionalName: 'Amanda L.',
      salonName: 'Color Bar',
      modelFee: 55,
      status: 'confirmed',
    },
  ];
  
  const mockSessionsForGoodModel = [
    { id: 'sess-1', type: 'session', service: 'Balayage Highlights', category: 'color', date: 'Dec 15, 2024', time: '10:00 AM', pro: 'Sarah M.', salon: 'Luxe Studio', duration: '3 hours', originalPrice: 280, paid: 45, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('balayage') },
    { id: 'sess-2', type: 'session', service: 'Blowout & Style', category: 'blowouts', date: 'Dec 12, 2024', time: '2:00 PM', pro: 'Jessica K.', salon: 'Glamour Salon', duration: '45 min', originalPrice: 75, paid: 25, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('blowout') },
    { id: 'sess-3', type: 'session', service: 'Color Correction', category: 'color', date: 'Dec 8, 2024', time: '11:00 AM', pro: 'Amanda L.', salon: 'Color Bar', duration: '4 hours', originalPrice: 320, paid: 55, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('color-correction') },
    { id: 'sess-4', type: 'session', service: 'Haircut & Layers', category: 'haircuts', date: 'Dec 3, 2024', time: '1:00 PM', pro: 'Maria S.', salon: 'Studio 54 Hair', duration: '1.5 hours', originalPrice: 95, paid: 20, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('haircut') },
    { id: 'sess-5', type: 'session', service: 'Keratin Treatment', category: 'treatments', date: 'Nov 28, 2024', time: '10:00 AM', pro: 'Jessica K.', salon: 'Glamour Salon', duration: '2.5 hours', originalPrice: 180, paid: 30, status: 'completed', rating: 4, icon: '', photoUrl: getPhotoForService('treatment') },
    { id: 'sess-6', type: 'session', service: 'Highlights', category: 'color', date: 'Nov 22, 2024', time: '2:00 PM', pro: 'Sarah M.', salon: 'Luxe Studio', duration: '3.5 hours', originalPrice: 265, paid: 45, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('highlights') },
    { id: 'sess-7', type: 'session', service: 'Blowout', category: 'blowouts', date: 'Nov 18, 2024', time: '3:00 PM', pro: 'Lisa T.', salon: 'Wellness Hair', duration: '40 min', originalPrice: 65, paid: 15, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('blowout') },
    { id: 'sess-8', type: 'session', service: 'Root Touch-Up', category: 'color', date: 'Nov 12, 2024', time: '11:30 AM', pro: 'Amanda L.', salon: 'Color Bar', duration: '2 hours', originalPrice: 140, paid: 35, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('color') },
    { id: 'sess-9', type: 'session', service: 'Haircut & Style', category: 'haircuts', date: 'Nov 5, 2024', time: '10:00 AM', pro: 'Maria S.', salon: 'Studio 54 Hair', duration: '1.5 hours', originalPrice: 110, paid: 25, status: 'completed', rating: 5, icon: '', photoUrl: getPhotoForService('haircut') },
    { id: 'sess-10', type: 'session', service: 'Deep Conditioning', category: 'treatments', date: 'Oct 28, 2024', time: '1:00 PM', pro: 'Jessica K.', salon: 'Glamour Salon', duration: '1 hour', originalPrice: 85, paid: 20, status: 'completed', rating: 4, icon: '', photoUrl: getPhotoForService('treatment') },
  ];

  // Use enhanced mock data if real data is sparse
  const displayBookings = bookings.length > 0 ? bookings : mockBookingsForGoodModel;
  const displaySessions = sessions.length > 0 ? sessions : mockSessionsForGoodModel;
  
  // Filter logic
  const filteredItems = useMemo(() => {
    let items = [];
    
    if (view === 'unified' || view === 'sessions') {
      items = [...items, ...displaySessions.filter(s => s.type === 'session')];
    }
    if (view === 'unified' || view === 'photos') {
      items = [...items, ...displaySessions.filter(s => s.type === 'photo'), ...photos];
    }
    
    // Apply category filter
    if (filter !== 'all') {
      items = items.filter(item => item.category === filter || item.type === 'photo');
    }
    
    // Apply tag filter for photos
    if (selectedTags.length > 0) {
      items = items.filter(item => {
        if (item.type === 'photo' && item.tags) {
          return photoMatchesTags(item, selectedTags);
        }
        return true;
      });
    }
    
    return items;
  }, [view, filter, selectedTags, displaySessions, photos]);
  
  const stats = {
    total: Math.max(sessions.filter(s => s.type === 'session').length, displaySessions.length),
    upcoming: Math.max(bookings.filter(b => new Date(b.appointmentDate) > new Date()).length, mockBookingsForGoodModel.length),
    photos: Math.max(photos.length + sessions.filter(s => s.type === 'photo').length, 24),
    opportunities: pendingMatches.length,
  };

  // Calendar logic
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayDate = new Date(current);
      const isCurrentMonth = dayDate.getMonth() === currentMonth;
      const isToday = dayDate.toDateString() === today.toDateString();
      
      const dayEvents = displayBookings.filter(booking => {
        const bookingDate = new Date(booking.appointmentDate);
        return bookingDate.toDateString() === dayDate.toDateString();
      });
      
      days.push({
        date: dayDate,
        day: dayDate.getDate(),
        isCurrentMonth,
        isToday,
        events: dayEvents,
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth, currentYear, displayBookings, today]);

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Booked</h1>
        <p style={styles.subtitle}>Your complete hair journey - sessions, calendar, and photos all in one place</p>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.total}</div>
          <div style={styles.statLabel}>Total Sessions</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.upcoming}</div>
          <div style={styles.statLabel}>Upcoming</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.photos}</div>
          <div style={styles.statLabel}>Photos</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#8B1E3F' }}>{stats.opportunities}</div>
          <div style={styles.statLabel}>Opportunities</div>
        </div>
      </div>

      {/* Matched Section - Queue of Pending Matches */}
      {pendingMatches.length > 0 && (
        <div style={{ 
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.08), rgba(168, 90, 90, 0.05))',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid rgba(139, 30, 63, 0.15)',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem',
          }}>
            <div>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                marginBottom: '0.25rem',
                color: '#4A2A1A', 
                fontFamily: '"Alike", "Georgia", serif' 
              }}>
                New Match
              </h2>
              <p style={{ 
                fontSize: '0.85rem', 
                color: '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {pendingMatches.length} {pendingMatches.length === 1 ? 'match' : 'matches'} waiting
              </p>
            </div>
            {pendingMatches.length > 1 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <button
                  onClick={() => setCurrentMatchIndex(Math.max(0, currentMatchIndex - 1))}
                  disabled={currentMatchIndex === 0}
                  style={{
                    padding: '0.5rem',
                    background: currentMatchIndex === 0 ? 'rgba(139, 30, 63, 0.1)' : 'rgba(139, 30, 63, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentMatchIndex === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    color: currentMatchIndex === 0 ? '#5A3A2A' : '#8B1E3F',
                    opacity: currentMatchIndex === 0 ? 0.5 : 1,
                  }}
                >
                  ←
                </button>
                <span style={{ 
                  fontSize: '0.85rem',
                  color: '#5A3A2A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {currentMatchIndex + 1} / {pendingMatches.length}
                </span>
                <button
                  onClick={() => setCurrentMatchIndex(Math.min(pendingMatches.length - 1, currentMatchIndex + 1))}
                  disabled={currentMatchIndex === pendingMatches.length - 1}
                  style={{
                    padding: '0.5rem',
                    background: currentMatchIndex === pendingMatches.length - 1 ? 'rgba(139, 30, 63, 0.1)' : 'rgba(139, 30, 63, 0.2)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentMatchIndex === pendingMatches.length - 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    color: currentMatchIndex === pendingMatches.length - 1 ? '#5A3A2A' : '#8B1E3F',
                    opacity: currentMatchIndex === pendingMatches.length - 1 ? 0.5 : 1,
                  }}
                >
                  →
                </button>
              </div>
            )}
          </div>
          
          {pendingMatches[currentMatchIndex] && (() => {
            const match = pendingMatches[currentMatchIndex];
            const service = getServiceById(match.serviceType || match.requestId);
            const formatProName = (name) => {
              if (!name) return 'Professional';
              const parts = String(name).trim().split(/\s+/);
              if (parts.length === 1) return parts[0];
              return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
            };
            const durationMin = match.duration ?? service?.duration ?? 60;
            const productFeeEst = service?.price ? Math.round(service.price * 0.12) : 0;
            const suggestedTip = service?.price ? Math.round(service.price * 0.2) : 0;
            
            return (
              <div style={{
                background: '#FFFEF9',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '2px solid rgba(139, 30, 63, 0.2)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  {/* Match Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#4A2A1A',
                      fontFamily: '"Alike", "Georgia", serif',
                    }}>
                      {service?.icon || ''} {service?.name || match.serviceType || 'Service'}
                    </div>
                    <div style={{ 
                      fontSize: '0.85rem',
                      color: '#5A3A2A',
                      marginBottom: '0.5rem',
                      fontFamily: '"Alike", "Georgia", serif',
                    }}>
                      {formatProName(match.professionalName) || 'Professional'} • {match.location || 'Location TBD'}
                    </div>
                    <div style={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      color: '#5A3A2A',
                      fontFamily: '"Alike", "Georgia", serif',
                      marginBottom: '0.5rem',
                    }}>
                      {match.appointmentDate && (
                        <span>{new Date(match.appointmentDate).toLocaleDateString()}</span>
                      )}
                      {match.appointmentTime && (
                        <span>{match.appointmentTime}</span>
                      )}
                      <span>{formatDuration(durationMin)}</span>
                      {match.modelFee && (
                        <span style={{ color: '#8B1E3F', fontWeight: '600' }}>
                          Your fee: ${match.modelFee}
                        </span>
                      )}
                    </div>
                    {(productFeeEst > 0 || suggestedTip > 0) && (
                      <div style={{ fontSize: '0.8rem', color: '#6B5344', fontFamily: '"Alike", "Georgia", serif' }}>
                        {productFeeEst > 0 && <span>Est. product fee: ~${productFeeEst}</span>}
                        {productFeeEst > 0 && suggestedTip > 0 && ' • '}
                        {suggestedTip > 0 && <span>Suggested tip (20%): ~${suggestedTip}</span>}
                      </div>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '120px' }}>
                    <button
                      onClick={async () => {
                        try {
                          await acceptMatch(match.id);
                          await loadPendingMatches();
                          await loadBookings();
                          setCurrentMatchIndex(Math.max(0, currentMatchIndex - 1));
                          alert('Match accepted! Check your bookings.');
                        } catch (error) {
                          console.error('Error accepting match:', error);
                          alert('Error accepting match. Please try again.');
                        }
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#FFFEF9',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontFamily: '"Alike", "Georgia", serif',
                      }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Decline this match?')) {
                          try {
                            await declineMatch(match.id, 'Not interested');
                            await loadPendingMatches();
                            setCurrentMatchIndex(Math.max(0, currentMatchIndex - 1));
                          } catch (error) {
                            console.error('Error declining match:', error);
                            alert('Error declining match. Please try again.');
                          }
                        }
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: '1px solid rgba(139, 30, 63, 0.3)',
                        borderRadius: '8px',
                        color: '#8B1E3F',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontFamily: '"Alike", "Georgia", serif',
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Upcoming Bookings with Location Helper & Chat */}
      {(displayBookings.filter(b => new Date(b.appointmentDate) > new Date()).length > 0) && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
            Upcoming Sessions
          </h2>
          {displayBookings
            .filter(b => new Date(b.appointmentDate) > new Date())
            .map(booking => (
              <div key={booking.id || `${booking.appointmentDate}-${booking.appointmentTime}-${booking.professionalId || ''}`} style={{
                background: 'rgba(139, 30, 63, 0.05)',
                border: '1px solid rgba(139, 30, 63, 0.15)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                      {booking.serviceType || 'Service'}
                    </h3>
                    <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                      {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                    </p>
                    <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                      {booking.location}
                    </p>
                  </div>
                  <div>
                    <LocationHelper 
                      booking={booking} 
                      onQuickMessage={(promptType) => handleQuickMessage(promptType, booking)}
                    />
                  </div>
                </div>
                <div>
                  <ChatSchedule 
                    booking={booking} 
                    userType="model"
                    modelProfile={modelProfile}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      {/* View Switcher */}
      <div style={styles.viewSwitcher}>
        {[
          { key: 'unified', label: 'Unified View' },
          { key: 'sessions', label: 'Sessions' },
          { key: 'calendar', label: 'Calendar' },
          { key: 'photos', label: 'Photos' },
          { key: 'requests', label: `Booking Requests${bookingRequests.length > 0 ? ` (${bookingRequests.length})` : ''}`, badge: bookingRequests.length },
          { key: 'inspo', label: 'Inspo' },
          { key: 'routine', label: 'Routine' },
        ].map(v => (
          <button
            key={v.key}
            style={{
              ...styles.viewBtn,
              ...(view === v.key ? styles.viewBtnActive : {}),
            }}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {view !== 'calendar' && (
        <div style={styles.filters}>
          {[
            { key: 'all', label: 'All' },
            { key: 'color', label: 'Color' },
            { key: 'haircuts', label: 'Haircuts' },
            { key: 'blowouts', label: 'Blowouts' },
            { key: 'treatments', label: 'Treatments' },
          ].map(f => (
            <button
              key={f.key}
              style={{
                ...styles.filterBtn,
                ...(filter === f.key ? styles.filterBtnActive : {}),
              }}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Unified View */}
      {view === 'unified' && (
        <div style={styles.unifiedGrid}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.unifiedCard}>
              <div style={{
                ...styles.unifiedCardType,
                background: item.type === 'session' ? 'rgba(139, 30, 63, 0.15)' : 'rgba(139, 30, 63, 0.15)',
                color: item.type === 'session' ? '#8B1E3F' : '#8B1E3F',
              }}>
                {item.type === 'session' ? 'Session' : 'Photo'}
              </div>
              <div style={styles.unifiedCardContent}>
                {item.type === 'session' ? (
                  <>
                    <div style={styles.sessionService}>{item.service}</div>
                    <div style={styles.sessionMeta}>
                      {item.date} • {item.pro} • {item.salon}
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.photoImage}>
                      {item.url ? (
                        <img src={item.url} alt={item.service} style={styles.actualImage} />
                      ) : (
                        <div style={styles.photoEmoji}>{item.icon}</div>
                      )}
                    </div>
                    <div style={styles.photoInfo}>
                      <div style={styles.photoService}>{item.service}</div>
                      <div style={styles.photoDate}>{item.date}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sessions View */}
      {view === 'sessions' && (
        <div style={styles.sessionsList}>
          {filteredItems.filter(item => item.type === 'session').map(session => (
            <div key={session.id} style={styles.sessionCard}>
              <div style={styles.sessionIcon}>{session.icon}</div>
              <div style={styles.sessionInfo}>
                <div style={styles.sessionService}>{session.service}</div>
                <div style={styles.sessionMeta}>
                  with {session.pro} • {session.salon}
                </div>
              </div>
              <div style={styles.sessionRight}>
                <div style={styles.sessionDate}>{session.date}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <div style={styles.calendarContainer}>
          <div style={styles.calendarHeader}>
            <div style={styles.calendarMonth}>{monthName}</div>
            <div style={styles.calendarNav}>
              <button style={styles.navBtn} onClick={() => navigateMonth(-1)}>← Previous</button>
              <button style={styles.navBtn} onClick={() => setCurrentDate(new Date())}>Today</button>
              <button style={styles.navBtn} onClick={() => navigateMonth(1)}>Next →</button>
            </div>
          </div>

          <div style={styles.calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={styles.dayHeader}>{day}</div>
            ))}
          </div>

          <div style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <div
                key={day.date.toISOString().split('T')[0]}
                style={{
                  ...styles.dayCell,
                  ...(day.isToday ? styles.dayCellToday : {}),
                  ...(!day.isCurrentMonth ? { opacity: 0.3 } : {}),
                }}
              >
                <div style={styles.dayNumber}>{day.day}</div>
                <div style={styles.dayEvents}>
                  {day.events.slice(0, 3).map((event) => {
                    const service = getServiceById(event.serviceType);
                    const eventKey = event.id || `${event.appointmentDate}-${event.appointmentTime}-${event.professionalId || ''}`;
                    return (
                      <div key={eventKey} style={styles.event} title={`${event.appointmentTime} - ${service?.name || event.serviceType}`}>
                        {event.appointmentTime}
                      </div>
                    );
                  })}
                  {day.events.length > 3 && (
                    <div style={styles.event}>+{day.events.length - 3} more</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Requests View */}
      {view === 'requests' && (
        <div>
          {bookingRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
              <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                No Booking Requests
              </div>
              <div style={{ fontSize: '0.9rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                When professionals request you for a service, you'll see it here!
              </div>
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem',
                background: 'rgba(139, 30, 63, 0.1)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                color: '#5A3A2A',
                fontStyle: 'italic',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                (Mock data - simulates booking requests from approved matches)
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookingRequests.map(request => {
                const service = getServiceById(request.data?.serviceType);
                const date = request.data?.appointmentDate 
                  ? new Date(request.data.appointmentDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '';
                const time = request.data?.appointmentTime || '';
                const location = request.data?.location || '';
                const amount = request.data?.amount || 0;
                const proName = request.data?.professionalName || 'A professional';
                const salonName = request.data?.salonName || '';
                
                return (
                  <div key={request.id} style={{
                    background: '#FFFEF9',
                    border: '2px solid rgba(139, 30, 63, 0.2)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    position: 'relative',
                  }}>
                    {/* New Badge */}
                    {!request.read && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.25rem 0.75rem',
                        background: '#8B1E3F',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        color: '#FFFEF9',
                        fontFamily: '"Alike", "Georgia", serif',
                      }}>
                        NEW
                      </div>
                    )}
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem' }}>
                      {/* Request Details */}
                      <div>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: '600', 
                          marginBottom: '0.5rem',
                          color: '#8B1E3F',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          {request.title}
                        </div>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#4A2A1A',
                          marginBottom: '1rem',
                          lineHeight: '1.6',
                          fontFamily: '"Alike", "Georgia", serif',
                        }}>
                          {request.message}
                        </div>
                        
                        {/* Request Info Grid */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                          marginTop: '1rem',
                        }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginBottom: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                              Service
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                              {service ? `${service.icon} ${service.name}` : request.data?.serviceType}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginBottom: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                              Date & Time
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                              {date} at {time}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginBottom: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                              Professional
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                              {proName}
                              {salonName && (
                                <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                                  {salonName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#5A3A2A', marginBottom: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
                              You'll Earn
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>
                              ${amount}
                            </div>
                          </div>
                        </div>
                        
                        {location && (
                          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
                            📍 {location}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '150px' }}>
                        <button
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#FFFEF9',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: '"Alike", "Georgia", serif',
                          }}
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                          onClick={async () => {
                            try {
                              // Mark notification as read
                              markNotificationAsRead(request.id);
                              
                              // In production, this would create a booking from the request
                              // For now, just mark as read and show success
                              alert(`Booking request accepted!\n\nService: ${service?.name || request.data?.serviceType}\nDate: ${date} at ${time}\nYou'll earn: $${amount}\n\nThis will create a booking in your calendar.`);
                              
                              // Reload data
                              loadBookingRequests();
                              loadBookings();
                            } catch (error) {
                              console.error('Error accepting booking:', error);
                              alert(`Error: ${error.message}`);
                            }
                          }}
                        >
                          Accept
                        </button>
                        <button
                          style={{
                            padding: '0.75rem 1.5rem',
                            background: 'rgba(139, 30, 63, 0.1)',
                            border: '1px solid rgba(139, 30, 63, 0.2)',
                            borderRadius: '8px',
                            color: '#4A2A1A',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontFamily: '"Alike", "Georgia", serif',
                          }}
                          onClick={() => {
                            markNotificationAsRead(request.id);
                            alert('Booking request declined.');
                            loadBookingRequests();
                          }}
                        >
                          Decline
                        </button>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'transparent',
                            border: 'none',
                            color: '#5A3A2A',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                            fontFamily: '"Alike", "Georgia", serif',
                          }}
                          onClick={() => {
                            markNotificationAsRead(request.id);
                            loadBookingRequests();
                          }}
                        >
                          Mark as read
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Photos View */}
      {view === 'photos' && (
        <div style={styles.contentLayout}>
          <div style={styles.filterSidebar}>
            <GalleryTagFilter
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              photos={[...photos, ...sessions.filter(s => s.type === 'photo')]}
            />
          </div>
          <div>
            <div style={styles.photoGrid}>
              {filteredItems.filter(item => item.type === 'photo').map(photo => (
                <div key={photo.id} style={styles.photoCard}>
                  <div style={styles.photoImage}>
                    {photo.url ? (
                      <img src={photo.url} alt={photo.service} style={styles.actualImage} />
                    ) : (
                      <div style={styles.photoEmoji}>{photo.icon}</div>
                    )}
                  </div>
                  <div style={styles.photoInfo}>
                    <div style={styles.photoService}>{photo.service}</div>
                    <div style={styles.photoDate}>{photo.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspo Tab */}
      {view === 'inspo' && modelProfile && (
        <div style={{ padding: '1rem 0' }}>
          <InspirationBoard modelId={modelProfile.id} />
        </div>
      )}

      {/* Routine Tab */}
      {view === 'routine' && modelProfile && (
        <div style={{ padding: '1rem 0' }}>
          <BeautyMaintenanceTimeline modelId={modelProfile.id} />
        </div>
      )}
    </div>
  );
}

