// ============================================
// MOCK PACKAGES & PROMOS DATA
// ============================================

export const mockPackages = [
  {
    id: 'pkg-1',
    name: 'Holiday Glam Package',
    type: 'package',
    description: 'Complete holiday transformation: color, cut, and styling',
    services: ['color', 'haircut', 'blowdry'],
    originalPrice: 515, // $300 + $125 + $90
    packagePrice: 450,
    discount: 65,
    discountPercent: 12.6,
    duration: 285, // minutes
    status: 'active',
    startDate: new Date(Date.now() - 5 * 86400000),
    endDate: new Date(Date.now() + 25 * 86400000),
    campaignIds: ['camp-2'], // Linked to Holiday Blowout Special campaign
    targetAudience: 'all',
    usageCount: 23,
    revenue: 10350,
    createdAt: new Date(Date.now() - 10 * 86400000),
  },
  {
    id: 'pkg-2',
    name: 'New Model Welcome Bundle',
    type: 'package',
    description: 'Perfect starter package for new models: cut and style',
    services: ['haircut', 'blowdry'],
    originalPrice: 215,
    packagePrice: 180,
    discount: 35,
    discountPercent: 16.3,
    duration: 105,
    status: 'active',
    startDate: new Date(Date.now() - 7 * 86400000),
    endDate: new Date(Date.now() + 53 * 86400000),
    campaignIds: ['camp-1'], // Linked to New Model Sign-Up Bonus
    targetAudience: 'models',
    usageCount: 45,
    revenue: 8100,
    createdAt: new Date(Date.now() - 15 * 86400000),
  },
  {
    id: 'pkg-3',
    name: 'Color Specialist Training Package',
    type: 'package',
    description: 'Advanced color training: highlights and gloss treatment',
    services: ['highlights', 'gloss'],
    originalPrice: 325,
    packagePrice: 280,
    discount: 45,
    discountPercent: 13.8,
    duration: 210,
    status: 'active',
    startDate: new Date(Date.now() - 2 * 86400000),
    endDate: new Date(Date.now() + 58 * 86400000),
    campaignIds: [], // Not linked to any campaign yet
    targetAudience: 'all',
    usageCount: 12,
    revenue: 3360,
    createdAt: new Date(Date.now() - 5 * 86400000),
  },
];

export const mockPromos = [
  {
    id: 'promo-1',
    name: '20% Off First Color Service',
    type: 'promo',
    description: 'New models get 20% off their first color service',
    discountType: 'percentage',
    discountValue: 20,
    applicableServices: ['color'],
    minPurchase: null,
    maxUses: 1,
    status: 'active',
    startDate: new Date(Date.now() - 7 * 86400000),
    endDate: new Date(Date.now() + 23 * 86400000),
    campaignIds: ['camp-1'], // Linked to New Model Sign-Up Bonus
    targetAudience: 'models',
    usageCount: 18,
    revenue: 1080, // Discount amount saved by users
    code: 'NEWMODEL20',
    createdAt: new Date(Date.now() - 10 * 86400000),
  },
  {
    id: 'promo-2',
    name: 'Holiday Blowout Special',
    type: 'promo',
    description: 'Special holiday pricing on blowout services',
    discountType: 'fixed',
    discountValue: 15,
    applicableServices: ['blowdry'],
    minPurchase: null,
    maxUses: null,
    status: 'active',
    startDate: new Date(Date.now() - 3 * 86400000),
    endDate: new Date(Date.now() + 27 * 86400000),
    campaignIds: ['camp-2'], // Linked to Holiday Blowout Special campaign
    targetAudience: 'all',
    usageCount: 42,
    revenue: 630,
    code: 'HOLIDAYBLOWOUT',
    createdAt: new Date(Date.now() - 5 * 86400000),
  },
  {
    id: 'promo-3',
    name: 'Referral Bonus',
    type: 'promo',
    description: 'Get $50 credit when you refer a professional',
    discountType: 'fixed',
    discountValue: 50,
    applicableServices: ['all'],
    minPurchase: null,
    maxUses: null,
    status: 'scheduled',
    startDate: new Date(Date.now() + 5 * 86400000),
    endDate: new Date(Date.now() + 65 * 86400000),
    campaignIds: ['camp-3'], // Linked to Professional Referral Program
    targetAudience: 'models',
    usageCount: 0,
    revenue: 0,
    code: 'REFER50',
    createdAt: new Date(Date.now() - 2 * 86400000),
  },
];

// Helper functions
export const getAllPackagesAndPromos = () => [...mockPackages, ...mockPromos];

export const getPackagesByCampaign = (campaignId) => {
  const packages = mockPackages.filter(p => p.campaignIds?.includes(campaignId));
  const promos = mockPromos.filter(p => p.campaignIds?.includes(campaignId));
  return { packages, promos };
};

export const getActivePackagesAndPromos = () => {
  const now = new Date();
  return {
    packages: mockPackages.filter(p => 
      p.status === 'active' && 
      p.startDate <= now && 
      p.endDate >= now
    ),
    promos: mockPromos.filter(p => 
      p.status === 'active' && 
      p.startDate <= now && 
      p.endDate >= now
    ),
  };
};

