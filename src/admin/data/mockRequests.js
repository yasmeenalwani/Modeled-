// ============================================
// MOCK MODEL REQUEST DATA
// ============================================
// Sample requests that match the Pro Request Creation form structure
// These simulate requests created by professionals through the portal

export const mockRequests = [
  {
    id: 'mock-request-1',
    professionalId: 'pro-1', // Links to mockProfessionals
    serviceType: 'highlights',
    serviceDescription: 'Need a model for balayage/highlights practice - looking for virgin long hair to practice dimensional color techniques',
    desiredHairColor: 'blonde',
    desiredHairLength: 'long',
    desiredHairTexture: 'wavy',
    desiredHairCondition: 'virgin',
    requestedDate: '2024-12-20',
    requestedTime: '10:00',
    duration: 180, // 3 hours
    location: '123 Main St, Manhattan, NY 10001',
    modelSearchFee: 50.00,
    modelPayment: 30.00,
    status: 'matching',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'mock-request-2',
    professionalId: 'pro-2',
    serviceType: 'blowdry',
    serviceDescription: 'Practicing blowout techniques on thick curly hair - need someone with natural texture to work with',
    desiredHairColor: null, // Any
    desiredHairLength: 'medium',
    desiredHairTexture: 'curly',
    desiredHairCondition: 'healthy',
    requestedDate: '2024-12-22',
    requestedTime: '14:00',
    duration: 60, // 1 hour
    location: '456 Broadway, Brooklyn, NY 11211',
    modelSearchFee: 25.00,
    modelPayment: 20.00,
    status: 'matching',
    priority: 'normal',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: 'mock-request-3',
    professionalId: 'pro-3',
    serviceType: 'color',
    serviceDescription: 'Advanced color correction training - need previously colored hair to practice removal and correction techniques',
    desiredHairColor: null,
    desiredHairLength: null, // Any
    desiredHairTexture: null,
    desiredHairCondition: 'color_treated',
    requestedDate: '2024-12-25',
    requestedTime: '11:00',
    duration: 240, // 4 hours
    location: '789 Park Ave, Manhattan, NY 10021',
    modelSearchFee: 75.00,
    modelPayment: 50.00,
    status: 'matching',
    priority: 'normal',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'mock-request-4',
    professionalId: 'pro-1',
    serviceType: 'haircut',
    serviceDescription: 'Precision cut practice - looking for medium to long hair for layered cut techniques',
    desiredHairColor: 'brunette',
    desiredHairLength: 'long',
    desiredHairTexture: 'straight',
    desiredHairCondition: 'healthy',
    requestedDate: '2024-12-19',
    requestedTime: '09:00',
    duration: 90, // 1.5 hours
    location: '123 Main St, Manhattan, NY 10001',
    modelSearchFee: 30.00,
    modelPayment: 25.00,
    status: 'matching',
    priority: 'high',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
  },
  {
    id: 'mock-request-5',
    professionalId: 'pro-4',
    serviceType: 'gloss',
    serviceDescription: 'Gloss treatment practice - any hair type welcome, focusing on shine and toning techniques',
    desiredHairColor: null,
    desiredHairLength: null,
    desiredHairTexture: null,
    desiredHairCondition: null,
    requestedDate: '2024-12-21',
    requestedTime: '13:00',
    duration: 60,
    location: '321 5th Ave, Manhattan, NY 10016',
    modelSearchFee: 20.00,
    modelPayment: 25.00,
    status: 'matching',
    priority: 'normal',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
  },
  {
    id: 'mock-request-6',
    professionalId: 'pro-5',
    serviceType: 'highlights',
    serviceDescription: 'Babylights practice - looking for medium to long hair, any color, for fine highlight work',
    desiredHairColor: null,
    desiredHairLength: 'medium',
    desiredHairTexture: 'straight',
    desiredHairCondition: 'healthy',
    requestedDate: '2024-12-23',
    requestedTime: '15:00',
    duration: 150, // 2.5 hours
    location: '555 Madison Ave, Manhattan, NY 10022',
    modelSearchFee: 45.00,
    modelPayment: 30.00,
    status: 'matched',
    priority: 'normal',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
];

// Simplified professional data for request display
// Full professional data is in mockProfessionals.js
export const mockProfessionals = [
  {
    id: 'pro-1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    salonName: 'Luxe Studio',
    email: 'sarah.m@luxestudio.com',
    phone: '(555) 111-2222',
  },
  {
    id: 'pro-2',
    firstName: 'Mike',
    lastName: 'Thompson',
    salonName: 'The Cut Collective',
    email: 'mike.t@cutcollective.com',
    phone: '(555) 222-3333',
  },
  {
    id: 'pro-3',
    firstName: 'Lisa',
    lastName: 'Kim',
    salonName: 'Color Theory',
    email: 'lisa.k@colortheory.com',
    phone: '(555) 333-4444',
  },
  {
    id: 'pro-4',
    firstName: 'Jessica',
    lastName: 'Rodriguez',
    salonName: 'Glamour Studio',
    email: 'jessica.r@glamourstudio.com',
    phone: '(555) 444-5555',
  },
  {
    id: 'pro-5',
    firstName: 'Alex',
    lastName: 'Chen',
    salonName: 'The Artisan',
    email: 'alex.c@theartisan.com',
    phone: '(555) 555-6666',
  },
];

