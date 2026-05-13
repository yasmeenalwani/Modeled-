// ============================================
// MOCK WAITLIST DATA
// ============================================

import { mockModels } from '../../matching/mockModels';
import { mockRequests } from './mockRequests';

export const mockWaitlistEntries = [
  {
    id: 'waitlist-1',
    matchId: 'match-2',
    requestId: 'mock-request-1',
    modelId: '2',
    waitlistPosition: 1,
    matchScore: 78,
    status: 'waitlist',
    addedAt: new Date(Date.now() - 2 * 86400000),
    respondedAt: new Date(Date.now() - 2 * 86400000 + 3600000), // 1 hour after match sent
    // Enriched data
    model: mockModels.find(m => m.id === 2),
    request: mockRequests.find(r => r.id === 'mock-request-1'),
  },
  {
    id: 'waitlist-2',
    matchId: 'match-3',
    requestId: 'mock-request-1',
    modelId: '3',
    waitlistPosition: 2,
    matchScore: 65,
    status: 'waitlist',
    addedAt: new Date(Date.now() - 2 * 86400000),
    respondedAt: new Date(Date.now() - 2 * 86400000 + 7200000), // 2 hours after match sent
    model: mockModels.find(m => m.id === 3),
    request: mockRequests.find(r => r.id === 'mock-request-1'),
  },
  {
    id: 'waitlist-3',
    matchId: 'match-4',
    requestId: 'mock-request-1',
    modelId: '4',
    waitlistPosition: 3,
    matchScore: 60,
    status: 'waitlist',
    addedAt: new Date(Date.now() - 2 * 86400000),
    respondedAt: new Date(Date.now() - 2 * 86400000 + 10800000), // 3 hours after match sent
    model: mockModels.find(m => m.id === 4),
    request: mockRequests.find(r => r.id === 'mock-request-1'),
  },
  {
    id: 'waitlist-4',
    matchId: 'match-5',
    requestId: 'mock-request-2',
    modelId: '5',
    waitlistPosition: 1,
    matchScore: 72,
    status: 'waitlist',
    addedAt: new Date(Date.now() - 1 * 86400000),
    respondedAt: new Date(Date.now() - 1 * 86400000 + 1800000), // 30 min after match sent
    model: mockModels.find(m => m.id === 5),
    request: mockRequests.find(r => r.id === 'mock-request-2'),
  },
  {
    id: 'waitlist-5',
    matchId: 'match-6',
    requestId: 'mock-request-2',
    modelId: '6',
    waitlistPosition: 2,
    matchScore: 58,
    status: 'waitlist',
    addedAt: new Date(Date.now() - 1 * 86400000),
    respondedAt: new Date(Date.now() - 1 * 86400000 + 5400000), // 1.5 hours after match sent
    model: mockModels.find(m => m.id === 6),
    request: mockRequests.find(r => r.id === 'mock-request-2'),
  },
];

// Helper functions
export const getWaitlistByRequest = (requestId) => 
  mockWaitlistEntries
    .filter(w => w.requestId === requestId)
    .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

export const getWaitlistByModel = (modelId) => 
  mockWaitlistEntries.filter(w => w.modelId === modelId.toString());

export const getNextWaitlistPosition = (requestId) => {
  const entries = getWaitlistByRequest(requestId);
  return entries.length > 0 ? entries[entries.length - 1].waitlistPosition + 1 : 1;
};

export const getTotalWaitlistCount = () => mockWaitlistEntries.length;

export const getActiveWaitlistCount = () => 
  mockWaitlistEntries.filter(w => w.status === 'waitlist').length;

