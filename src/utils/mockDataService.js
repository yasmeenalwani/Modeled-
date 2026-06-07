/**
 * MOCK DATA SERVICE
 * 
 * Provides mock data for demo purposes when database is not available.
 * Stores data in localStorage for persistence across page refreshes.
 */

import { generateClient } from 'aws-amplify/data';
import { isDemoPortalActive } from './demoPortalMode';

const MOCK_STORAGE_KEY = 'modeled_mock_data';
const MOCK_DATA_VERSION = 6; // bump so Seraphina gets seed matches in Matched page (fresh localStorage)

// Initialize mock data structure
function initializeMockData() {
  const existing = localStorage.getItem(MOCK_STORAGE_KEY);
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      // If version is stale, reset so nextId fixes take effect
      if (!parsed._version || parsed._version < MOCK_DATA_VERSION) {
        localStorage.removeItem(MOCK_STORAGE_KEY);
        return initializeMockData(); // re-run with fresh data
      }
      return parsed;
    } catch {
      localStorage.removeItem(MOCK_STORAGE_KEY);
    }
  }
  
  const initialData = {
    _version: MOCK_DATA_VERSION,
    requests: [
      {
        id: 'mock-request-1',
        professionalId: 'mock-pro-1',
        serviceType: 'color',
        serviceId: 'color',
        serviceDescription: 'Full color treatment with balayage highlights - looking for blonde with dimension',
        preferredDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '2:00 PM',
        requestedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedTime: '2:00 PM',
        duration: 180,
        location: 'Luxe Studio - 123 Beauty St, New York, NY 10001',
        budget: 150,
        desiredHairLength: 'long',
        desiredHairColor: 'blonde',
        desiredHairTexture: 'wavy',
        hairCondition: 'color_treated',
        status: 'matching',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-request-2',
        professionalId: 'mock-pro-1',
        serviceType: 'haircut',
        serviceId: 'haircut',
        serviceDescription: 'Precision cut with texturizing layers - modern bob or pixie',
        preferredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '10:00 AM',
        requestedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedTime: '10:00 AM',
        duration: 60,
        location: 'Luxe Studio - 123 Beauty St, New York, NY 10001',
        budget: 120,
        desiredHairLength: 'medium',
        desiredHairColor: 'any',
        desiredHairTexture: 'straight',
        hairCondition: 'healthy',
        status: 'sent',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-request-3',
        professionalId: 'mock-pro-1',
        serviceType: 'highlights',
        serviceId: 'highlights',
        serviceDescription: 'Partial highlights with foils - warm tones, face-framing',
        preferredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '11:00 AM',
        requestedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedTime: '11:00 AM',
        duration: 150,
        location: 'Luxe Studio - 123 Beauty St, New York, NY 10001',
        budget: 130,
        desiredHairLength: 'long',
        desiredHairColor: 'blonde',
        desiredHairTexture: 'wavy',
        hairCondition: 'virgin',
        status: 'sent',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-request-4',
        professionalId: 'mock-pro-1',
        serviceType: 'blowdry',
        serviceId: 'blowdry',
        serviceDescription: 'Professional blowout styling for photoshoot',
        preferredDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        preferredTime: '3:00 PM',
        requestedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        requestedTime: '3:00 PM',
        duration: 45,
        location: 'Luxe Studio - 123 Beauty St, New York, NY 10001',
        budget: 80,
        desiredHairLength: 'long',
        desiredHairColor: 'any',
        desiredHairTexture: 'straight',
        hairCondition: 'any',
        status: 'approved',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    matches: [],
    bookings: [],
    models: [
      {
        id: 'mock-model-1',
        userId: 'mock-user-1',
        email: 'seraphina@example.com',
        firstName: 'Seraphina',
        lastName: 'Luna',
        phone: '(555) 123-4567',
        locationZip: '10001',
        hairLengthSimple: 'long',
        hairColorSimple: 'blonde',
        hairTextureSimple: 'wavy',
        hairCondition: 'color_treated',
        headshotUrl: null,
        photoUrls: [
          'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
          'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400',
          'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
          'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400',
          'https://images.unsplash.com/photo-1560066984-1383b3ce8b94?w=400',
          'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
        ],
        status: 'active',
        cardOnFileStatus: 'valid', // Required for matching - demo model has card on file
        openToHaircut: true,
        openToColor: true,
        openToStyling: true,
        openToCutStyles: ['long_layers', 'bob', 'lob', 'face_framing', 'curtain_bangs', 'trim'],
        openToChange: true,
        // Updated hair attributes based on images
        hairColor: 'blonde with highlights',
        hairLength: 'long',
        hairTexture: 'wavy',
        hairVolume: true,
        hairCurl: true,
      },
      {
        id: 'mock-model-2',
        userId: 'mock-user-2',
        email: 'sophia@example.com',
        firstName: 'Sophia',
        lastName: 'Williams',
        phone: '(555) 234-5678',
        locationZip: '10002',
        hairLengthSimple: 'medium',
        hairColorSimple: 'blonde',
        hairTextureSimple: 'straight',
        hairCondition: 'color_treated',
        headshotUrl: null,
        photoUrls: [],
        status: 'active',
        openToHaircut: true,
        openToColor: true,
        openToStyling: true,
      },
      {
        id: 'mock-model-3',
        userId: 'mock-user-3',
        email: 'olivia@example.com',
        firstName: 'Olivia',
        lastName: 'Brown',
        phone: '(555) 345-6789',
        locationZip: '10003',
        hairLengthSimple: 'short',
        hairColorSimple: 'black',
        hairTextureSimple: 'curly',
        hairCondition: 'healthy',
        headshotUrl: null,
        photoUrls: [],
        status: 'active',
        openToHaircut: true,
        openToColor: true,
        openToStyling: true,
        openToCutStyles: ['long_layers', 'shag', 'trim'],
        openToChange: false,
      },
    ],
    professionals: [
      {
        id: 'mock-pro-1',
        userId: 'mock-pro-user-1',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        phone: '(555) 456-7890',
        salonName: 'Luxe Studio',
        salonAddress: '123 Beauty St, New York, NY 10001',
        locationZip: '10001',
        salonLat: 40.7506,  // ZCTA centroid for 10001 (Manhattan)
        salonLng: -73.9972,
        status: 'active',
        cardOnFileStatus: 'none',
        stripeCustomerId: null,
      },
    ],
    stylists: [
      {
        id: 'mock-stylist-1',
        firstName: 'Ariana',
        lastName: 'Vale',
        level: 'Certified',
        yearsExperience: 6,
        certified: true,
        salonName: 'Tribeca Atelier',
        salonBio: 'Boutique salon focused on soft dimension and healthy hair.',
        bio: 'Precision colorist known for lived-in highlights and seamless grow-outs.',
        salonType: 'Boutique',
        boroughs: ['Tribeca', 'SoHo', 'West Village'],
        radiusMiles: 3,
        servicesOffered: ['color', 'highlights', 'gloss', 'haircut', 'blowdry'],
        priceRange: { min: 180, max: 320 },
        availabilityRules: {
          monday: [{ start: '09:00', end: '13:00', location: 'Tribeca' }],
          tuesday: [{ start: '09:00', end: '13:00', location: 'Tribeca' }],
          wednesday: [{ start: '09:00', end: '13:00', location: 'Tribeca' }],
          thursday: [],
          friday: [{ start: '11:00', end: '15:00', location: 'SoHo' }],
          saturday: [],
          sunday: [],
        },
        portfolio: [
          { url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&h=800&fit=crop', tags: ['highlights', 'blonde', 'soft-dimension'] },
          { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop', tags: ['balayage', 'brunette', 'lived-in'] },
        ],
      },
      {
        id: 'mock-stylist-2',
        firstName: 'Jules',
        lastName: 'Kim',
        level: 'Senior',
        yearsExperience: 9,
        certified: true,
        salonName: 'Studio East',
        salonBio: 'High‑volume salon specializing in color transformations.',
        bio: 'Senior stylist with a focus on highlights and color corrections.',
        salonType: 'Large Salon',
        boroughs: ['Upper East Side', 'Midtown'],
        radiusMiles: 5,
        servicesOffered: ['color', 'highlights', 'keratin', 'haircut'],
        priceRange: { min: 200, max: 380 },
        availabilityRules: {
          monday: [],
          tuesday: [{ start: '12:00', end: '18:00', location: 'Upper East Side' }],
          wednesday: [{ start: '12:00', end: '18:00', location: 'Upper East Side' }],
          thursday: [{ start: '12:00', end: '18:00', location: 'Upper East Side' }],
          friday: [],
          saturday: [{ start: '10:00', end: '14:00', location: 'Upper East Side' }],
          sunday: [],
        },
        portfolio: [
          { url: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&h=800&fit=crop', tags: ['highlights', 'ash-blonde', 'cool-tone'] },
          { url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop', tags: ['color', 'gloss', 'shine'] },
        ],
      },
      {
        id: 'mock-stylist-3',
        firstName: 'Marin',
        lastName: 'Lopez',
        level: 'Junior',
        yearsExperience: 2,
        certified: true,
        salonName: 'Brooklyn Color Lab',
        salonBio: 'Creative studio with a focus on modern color techniques.',
        bio: 'Rising stylist with a passion for lived‑in color and blowouts.',
        salonType: 'Studio',
        boroughs: ['Brooklyn', 'Williamsburg'],
        radiusMiles: 4,
        servicesOffered: ['blowdry', 'gloss', 'color'],
        priceRange: { min: 120, max: 220 },
        availabilityRules: {
          monday: [{ start: '10:00', end: '14:00', location: 'Williamsburg' }],
          tuesday: [],
          wednesday: [{ start: '10:00', end: '14:00', location: 'Williamsburg' }],
          thursday: [],
          friday: [{ start: '12:00', end: '16:00', location: 'Williamsburg' }],
          saturday: [{ start: '10:00', end: '13:00', location: 'Brooklyn' }],
          sunday: [],
        },
        portfolio: [
          { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop', tags: ['blowout', 'gloss', 'shine'] },
          { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop', tags: ['color', 'warm-brunette'] },
        ],
      },
    ],
    matches: [
      {
        id: 'mock-match-seed-1',
        requestId: 'mock-request-2',
        modelId: 'mock-model-1',
        matchScore: 94,
        scoreBreakdown: { attributeMatch: 40, agenticScore: 30, location: 15, availability: 9 },
        status: 'sent',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'mock-match-seed-2',
        requestId: 'mock-request-1',
        modelId: 'mock-model-2',
        matchScore: 88,
        scoreBreakdown: { attributeMatch: 35, agenticScore: 28, location: 14, availability: 11 },
        status: 'sent',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    bookings: [],
    stylistRequests: [],
    stylistMatches: [],
    // ── CHAT CONVERSATIONS ─────────────────────────────────────
    conversations: [
      {
        id: 'conv-pro-model-1',
        type: 'pro_model',          // direct between pro and model
        requestId: 'mock-request-2',
        proId: 'mock-pro-1',
        modelId: 'mock-model-1',
        participants: ['mock-pro-1', 'mock-model-1'],
        lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        unreadCount: { 'mock-pro-1': 1, 'mock-model-1': 0 },
      },
      {
        id: 'conv-support-pro-1',
        type: 'support',            // pro ↔ Modeled support
        proId: 'mock-pro-1',
        participants: ['mock-pro-1', 'modeled-support'],
        lastMessageAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        unreadCount: { 'mock-pro-1': 0 },
      },
      {
        id: 'conv-support-model-1',
        type: 'support',            // model ↔ Modeled support
        modelId: 'mock-model-1',
        participants: ['mock-model-1', 'modeled-support'],
        lastMessageAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        unreadCount: { 'mock-model-1': 0 },
      },
    ],
    messages: {
      'conv-pro-model-1': [
        {
          id: 'msg-1',
          conversationId: 'conv-pro-model-1',
          senderId: 'modeled-system',
          senderName: 'Modeled',
          senderType: 'system',
          text: 'Your session with Seraphina L. has been confirmed for next week — Haircut at Luxe Studio. Chat is now open.',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isSystem: true,
        },
        {
          id: 'msg-2',
          conversationId: 'conv-pro-model-1',
          senderId: 'mock-model-1',
          senderName: 'Seraphina L.',
          senderType: 'model',
          text: 'Hi! So excited for this. Quick question — should I come with my hair washed and dried, or is that something you prefer to do at the salon?',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-3',
          conversationId: 'conv-pro-model-1',
          senderId: 'mock-pro-1',
          senderName: 'Sarah M.',
          senderType: 'professional',
          text: 'Hey Seraphina! Come with clean, dry hair if you can. Makes it much easier to see the natural texture. See you soon!',
          timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'msg-4',
          conversationId: 'conv-pro-model-1',
          senderId: 'modeled-system',
          senderName: 'Modeled',
          senderType: 'system',
          text: 'Reminder: Your session is tomorrow at 10:00 AM. Address: Luxe Studio, 123 Beauty St, New York.',
          timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          isSystem: true,
        },
        {
          id: 'msg-5',
          conversationId: 'conv-pro-model-1',
          senderId: 'mock-model-1',
          senderName: 'Seraphina L.',
          senderType: 'model',
          text: 'Perfect, I have the address. See you at 10!',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
      'conv-support-pro-1': [
        {
          id: 'sup-msg-1',
          conversationId: 'conv-support-pro-1',
          senderId: 'modeled-support',
          senderName: 'Modeled Team',
          senderType: 'support',
          text: 'Hi Sarah! Welcome to Modeled. Your professional profile is live. Let us know if you have any questions about the platform or your first request.',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isSystem: false,
        },
        {
          id: 'sup-msg-2',
          conversationId: 'conv-support-pro-1',
          senderId: 'mock-pro-1',
          senderName: 'Sarah M.',
          senderType: 'professional',
          text: 'Thanks! How quickly do models typically respond once I send a booking request?',
          timestamp: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sup-msg-3',
          conversationId: 'conv-support-pro-1',
          senderId: 'modeled-support',
          senderName: 'Modeled Team',
          senderType: 'support',
          text: 'Most models respond within 24 hours. Top-rated models average under 4 hours. You can always reach us here if a match needs attention.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
      'conv-support-model-1': [
        {
          id: 'mod-msg-1',
          conversationId: 'conv-support-model-1',
          senderId: 'modeled-support',
          senderName: 'Modeled Team',
          senderType: 'support',
          text: 'Welcome Seraphina! Your model profile is verified and active. You\'ll receive booking opportunities directly in your Opportunities tab.',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'mod-msg-2',
          conversationId: 'conv-support-model-1',
          senderId: 'mock-model-1',
          senderName: 'Seraphina L.',
          senderType: 'model',
          text: 'Thank you! What should I bring to a haircut session?',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'mod-msg-3',
          conversationId: 'conv-support-model-1',
          senderId: 'modeled-support',
          senderName: 'Modeled Team',
          senderType: 'support',
          text: 'Just yourself! The professional provides everything. Show up with clean hair when possible. Your model fee is paid directly after the session.',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        },
      ],
    },
    nextId: {
      request: 5,   // 4 pre-seeded requests (1-4) already exist
      match: 100,   // start above seed IDs to avoid collisions
      booking: 1,
      stylistRequest: 1,
      stylistMatch: 1,
      message: 200,
    },
  };
  
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

// Get all mock data
export function getMockData() {
  return initializeMockData();
}

// Save mock data
function saveMockData(data) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
}

// ============ REQUESTS ============

export function createMockRequest(requestData) {
  const data = getMockData();
  const request = {
    id: `mock-request-${data.nextId.request++}`,
    ...requestData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.requests.push(request);
  saveMockData(data);
  return request;
}

export function getMockRequests(filters = {}) {
  const data = getMockData();
  let requests = [...data.requests];
  
  if (filters.professionalId) {
    requests = requests.filter(r => r.professionalId === filters.professionalId);
  }
  
  if (filters.status) {
    requests = requests.filter(r => r.status === filters.status);
  }
  
  if (filters.id) {
    requests = requests.filter(r => r.id === filters.id);
  }
  
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateMockRequest(requestId, updates) {
  const data = getMockData();
  const index = data.requests.findIndex(r => r.id === requestId);
  
  if (index === -1) return null;
  
  data.requests[index] = {
    ...data.requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveMockData(data);
  return data.requests[index];
}

// ============ MATCHES ============

// In-memory list so matches sent to Seraphina show up on her Matched page even if localStorage isn't shared (e.g. different tab)
const _seraphinaSessionMatches = typeof window !== 'undefined' ? (window.__modeled_seraphina_matches = window.__modeled_seraphina_matches || []) : [];

export function pushSeraphinaSessionMatch(match) {
  if (!match || !match.id) return;
  if (_seraphinaSessionMatches.some(m => m.id === match.id)) return;
  _seraphinaSessionMatches.push({ ...match, modelId: 'mock-model-1', status: match.status || 'sent' });
}

/** Get all matches for Seraphina from in-memory session (for same-tab / demo reliability). */
export function getSeraphinaSessionMatches() {
  return _seraphinaSessionMatches.slice();
}

/**
 * SINGLE SOURCE FOR "MATCHES SERAPHINA SEES" (Model Matched page).
 * Admin writes: MatchEnginePage → createMatchesForRequest → createMatch → createMockMatch
 *   (writes to localStorage key "modeled_mock_data" + pushSeraphinaSessionMatch).
 * Model reads: ModelOpportunities loadMatches() calls this.
 * Both must use same storage key and same modelId 'mock-model-1'.
 * See docs/WORKFLOW_MATCH_TO_MODEL.md for full alignment.
 */
export function getMatchesForSeraphina() {
  const fromStorage = getMockMatches({ modelId: 'mock-model-1' });
  const fromSession = getSeraphinaSessionMatches();
  const seen = new Set();
  const combined = [];
  for (const m of fromStorage) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      combined.push(m);
    }
  }
  for (const m of fromSession) {
    if (!seen.has(m.id)) {
      seen.add(m.id);
      combined.push(m);
    }
  }
  return combined.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

/** Normalize model id to string 'mock-model-X' so storage and filters are consistent (Seraphina = mock-model-1). */
export function normalizeModelId(id) {
  if (id == null) return null;
  if (typeof id === 'number') return `mock-model-${id}`;
  if (typeof id === 'string' && id.startsWith('mock-model-')) return id;
  if (typeof id === 'string' && /^\d+$/.test(id)) return `mock-model-${id}`;
  return id;
}

export function createMockMatch(requestId, modelId, matchData = {}) {
  console.log('=== CREATE MOCK MATCH ===');
  console.log('Input:', { requestId, modelId, modelIdType: typeof modelId, matchData });
  const data = getMockData();
  
  // CRITICAL: Normalize modelId to ensure consistency
  let finalModelId = modelId;
  if (typeof modelId === 'number') {
    finalModelId = `mock-model-${modelId}`;
    console.log('Normalized number ID:', modelId, '->', finalModelId);
  } else if (modelId === '1') {
    finalModelId = 'mock-model-1';
    console.log('Normalized string "1" ->', finalModelId);
  } else if (modelId && typeof modelId === 'string') {
    // If it's already in mock-model-X format, keep it
    if (modelId.startsWith('mock-model-')) {
      finalModelId = modelId;
      console.log('Already normalized format:', finalModelId);
    } else if (modelId.match(/^\d+$/)) {
      // It's a numeric string like "1", "2", etc.
      finalModelId = `mock-model-${modelId}`;
      console.log('Normalized numeric string:', modelId, '->', finalModelId);
    } else {
      // Unknown format, keep as is but log warning
      console.warn('⚠️ Unknown modelId format:', modelId, 'keeping as is');
      finalModelId = modelId;
    }
  }
  
  console.log('Final normalized modelId:', finalModelId);
  
  const match = {
    id: `mock-match-${data.nextId.match++}`,
    requestId,
    modelId: finalModelId, // ALWAYS use normalized ID
    matchScore: matchData.matchScore || Math.floor(Math.random() * 30) + 70,
    scoreBreakdown: matchData.scoreBreakdown || {
      attributeMatch: Math.floor(Math.random() * 20) + 30,
      agenticScore: Math.floor(Math.random() * 20) + 25,
      location: Math.floor(Math.random() * 10) + 10,
      availability: Math.floor(Math.random() * 5) + 5,
    },
    status: 'sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  console.log('Created match:', match);
  if (!Array.isArray(data.matches)) data.matches = [];
  data.matches.push(match);
  saveMockData(data);

  if (finalModelId === 'mock-model-1') {
    pushSeraphinaSessionMatch(match);
  }

  // CRITICAL VERIFICATION: Check if match can be queried
  const saved = getMockMatches({ id: match.id })[0];
  console.log('✓ Match saved, verification:', saved);
  
  // Test query by modelId
  const queryTest = getMockMatches({ modelId: finalModelId });
  console.log(`✓ Query test: Found ${queryTest.length} match(es) with modelId "${finalModelId}"`);
  if (queryTest.length === 0 || !queryTest.find(m => m.id === match.id)) {
    console.error('❌ ERROR: Match not found when querying by modelId! This is a CRITICAL issue!');
  } else {
    console.log('✅ Match can be queried successfully!');
  }
  
  return match;
}

export function createMockMatches(requestId, modelIds, matchScores = []) {
  const data = getMockData();
  const matches = [];
  
  modelIds.forEach((modelId, index) => {
    const normalizedId = normalizeModelId(modelId);
    const match = {
      id: `mock-match-${data.nextId.match++}`,
      requestId,
      modelId: normalizedId,
      matchScore: matchScores[index] || Math.floor(Math.random() * 30) + 70, // 70-100
      scoreBreakdown: {
        attributeMatch: matchScores[index] ? matchScores[index] * 0.4 : Math.floor(Math.random() * 20) + 30,
        agenticScore: matchScores[index] ? matchScores[index] * 0.35 : Math.floor(Math.random() * 20) + 25,
        location: matchScores[index] ? matchScores[index] * 0.15 : Math.floor(Math.random() * 10) + 10,
        availability: matchScores[index] ? matchScores[index] * 0.10 : Math.floor(Math.random() * 5) + 5,
      },
      status: 'sent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (normalizedId === 'mock-model-1') {
      pushSeraphinaSessionMatch(match);
    }
    data.matches.push(match);
    matches.push(match);
  });

  saveMockData(data);
  return matches;
}

export function getMockMatches(filters = {}) {
  const data = getMockData();
  let matches = [...(data.matches || [])];
  
  if (filters.requestId) {
    matches = matches.filter(m => m.requestId === filters.requestId);
  }
  
  if (filters.modelId) {
    const want = normalizeModelId(filters.modelId);
    matches = matches.filter(m => normalizeModelId(m.modelId) === want);
  }
  
  if (filters.status) {
    matches = matches.filter(m => m.status === filters.status);
  }
  
  if (filters.id) {
    matches = matches.filter(m => m.id === filters.id);
  }
  
  // Sort by match score (highest first)
  return matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

export function updateMockMatch(matchId, updates) {
  console.log('updateMockMatch called with:', { matchId, updates });
  const data = getMockData();
  const index = data.matches.findIndex(m => m.id === matchId);
  
  if (index === -1) {
    console.error('Match not found for update:', matchId);
    console.log('Available matches:', data.matches.map(m => ({ id: m.id, modelId: m.modelId, status: m.status })));
    return null;
  }
  
  console.log('Updating match at index', index, ':', data.matches[index]);
  data.matches[index] = {
    ...data.matches[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  console.log('Updated match:', data.matches[index]);
  saveMockData(data);
  
  // Verify update
  const verify = getMockMatches({ id: matchId })[0];
  console.log('Update verification:', verify);
  
  return data.matches[index];
}

// ============ BOOKINGS ============

export function createMockBooking(bookingData) {
  const data = getMockData();
  const booking = {
    id: `mock-booking-${data.nextId.booking++}`,
    ...bookingData,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  data.bookings.push(booking);
  saveMockData(data);
  return booking;
}

export function getMockBookings(filters = {}) {
  const data = getMockData();
  let bookings = [...data.bookings];
  
  if (filters.professionalId) {
    bookings = bookings.filter(b => b.professionalId === filters.professionalId);
  }
  
  if (filters.modelId) {
    bookings = bookings.filter(b => b.modelId === filters.modelId);
  }
  
  if (filters.status) {
    bookings = bookings.filter(b => b.status === filters.status);
  }
  
  if (filters.id) {
    bookings = bookings.filter(b => b.id === filters.id);
  }
  
  // Deduplicate by id (keep first occurrence)
  const seen = new Set();
  bookings = bookings.filter(b => {
    const key = b.id || `${b.appointmentDate}|${b.appointmentTime}|${b.professionalId || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateMockBooking(bookingId, updates) {
  const data = getMockData();
  const index = data.bookings.findIndex(b => b.id === bookingId);
  
  if (index === -1) return null;
  
  data.bookings[index] = {
    ...data.bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveMockData(data);
  return data.bookings[index];
}

// ============ MODELS ============

export function getMockModels(filters = {}) {
  const data = getMockData();
  let models = [...data.models];
  
  if (filters.id) {
    models = models.filter(m => m.id === filters.id);
  }
  
  if (filters.status) {
    models = models.filter(m => m.status === filters.status);
  }
  
  return models;
}

export function getMockModel(modelId) {
  const data = getMockData();
  return data.models.find(m => m.id === modelId) || null;
}

// ============ PROFESSIONALS ============

export function getMockProfessional(professionalId) {
  const data = getMockData();
  return data.professionals.find(p => p.id === professionalId) || null;
}

export function getMockProfessionalByUserId(userId) {
  const data = getMockData();
  return data.professionals.find(p => p.userId === userId) || null;
}

// ============ STYLISTS (Model → Stylist Matching) ============

export function getMockStylists(filters = {}) {
  const data = getMockData();
  let stylists = [...(data.stylists || [])];
  if (filters.id) {
    stylists = stylists.filter(s => s.id === filters.id);
  }
  if (filters.level) {
    stylists = stylists.filter(s => s.level === filters.level);
  }
  return stylists;
}

export function addMockStylistRequest(requestData) {
  const data = getMockData();
  const request = {
    id: `mock-stylist-request-${data.nextId.stylistRequest++}`,
    ...requestData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.stylistRequests = data.stylistRequests || [];
  data.stylistRequests.unshift(request);
  saveMockData(data);
  return request;
}

export function getMockStylistRequests(filters = {}) {
  const data = getMockData();
  let requests = [...(data.stylistRequests || [])];
  if (filters.id) {
    requests = requests.filter(r => r.id === filters.id);
  }
  if (filters.userId) {
    requests = requests.filter(r => r.userId === filters.userId);
  }
  return requests;
}

export function addMockStylistMatches(requestId, matches = []) {
  const data = getMockData();
  data.stylistMatches = data.stylistMatches || [];
  const created = matches.map(match => ({
    id: `mock-stylist-match-${data.nextId.stylistMatch++}`,
    requestId,
    ...match,
    createdAt: new Date().toISOString(),
  }));
  data.stylistMatches.unshift(...created);
  saveMockData(data);
  return created;
}

export function getMockStylistMatches(filters = {}) {
  const data = getMockData();
  let matches = [...(data.stylistMatches || [])];
  if (filters.requestId) {
    matches = matches.filter(m => m.requestId === filters.requestId);
  }
  return matches;
}

// ============ AUTO-MATCHING ============

/**
 * Automatically create matches for a request (for demo purposes)
 */
export function autoCreateMatchesForRequest(requestId) {
  const data = getMockData();
  const request = data.requests.find(r => r.id === requestId);
  
  if (!request) return [];
  
  // Find matching models based on request criteria
  const matchingModels = data.models.filter(model => {
    // Basic matching logic
    if (request.desiredHairLength && model.hairLengthSimple !== request.desiredHairLength) {
      return false;
    }
    if (request.desiredHairColor && model.hairColorSimple !== request.desiredHairColor) {
      return false;
    }
    if (request.desiredHairTexture && model.hairTextureSimple !== request.desiredHairTexture) {
      return false;
    }
    return true;
  });
  
  // If no exact matches, use all active models
  const modelsToMatch = matchingModels.length > 0 
    ? matchingModels 
    : data.models.filter(m => m.status === 'active');
  
  // Prioritize Seraphina Luna (mock-model-1) - put her first
  const sortedModels = [...modelsToMatch].sort((a, b) => {
    if (a.id === 'mock-model-1') return -1; // Seraphina first
    if (b.id === 'mock-model-1') return 1;
    return 0;
  });
  
  // Create matches with scores - Seraphina gets highest score
  const modelIds = sortedModels.slice(0, 5).map(m => m.id); // Top 5 matches
  const scores = modelIds.map((id, index) => {
    // Seraphina (mock-model-1) gets highest score (90-95), others get 75-85
    return id === 'mock-model-1' 
      ? Math.floor(Math.random() * 6) + 90  // 90-95 for Seraphina
      : Math.floor(Math.random() * 11) + 75; // 75-85 for others
  });
  
  const matches = createMockMatches(requestId, modelIds, scores);
  
  // For demo purposes, automatically approve and send matches
  setTimeout(() => {
    matches.forEach(match => {
      updateMockMatch(match.id, { 
        status: 'sent',
        sentAt: new Date().toISOString(),
      });
    });
  }, 500);
  
  return matches;
}

// ============ UTILITIES ============

/**
 * Clear all mock data (for testing)
 */
export function clearMockData() {
  localStorage.removeItem(MOCK_STORAGE_KEY);
  initializeMockData();
}

/**
 * Check if we should use mock data (when database is unavailable)
 */
export function shouldUseMockData() {
  if (isDemoPortalActive()) return true;
  const override = import.meta?.env?.VITE_USE_MOCK_DATA;
  if (typeof override === 'string') return override.toLowerCase() === 'true';

  try {
    const c = generateClient();
    const hasModelProfile = !!(c?.models?.ModelProfile && typeof c.models.ModelProfile.list === 'function');
    const hasProfessional = !!(c?.models?.Professional && typeof c.models.Professional.list === 'function');
    return !(hasModelProfile && hasProfessional);
  } catch {
    return true;
  }
}

// ============ CHAT ============

export function getMockConversations(userId) {
  const data = getMockData();
  const conversations = data.conversations || [];
  return conversations.filter(c => c.participants?.includes(userId) || !userId);
}

export function getMockMessages(conversationId) {
  const data = getMockData();
  return (data.messages?.[conversationId] || []).sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );
}

export function sendMockMessage(conversationId, senderId, senderName, senderType, text) {
  const data = getMockData();
  if (!data.messages) data.messages = {};
  if (!data.messages[conversationId]) data.messages[conversationId] = [];

  const msg = {
    id: `msg-${data.nextId.message++}`,
    conversationId,
    senderId,
    senderName,
    senderType,
    text,
    timestamp: new Date().toISOString(),
  };
  data.messages[conversationId].push(msg);

  // Update conversation's lastMessageAt
  const conv = (data.conversations || []).find(c => c.id === conversationId);
  if (conv) conv.lastMessageAt = msg.timestamp;

  saveMockData(data);
  return msg;
}
