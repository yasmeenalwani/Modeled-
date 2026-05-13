// ============================================
// MODELED MANAGEMENT - Services & Pricing
// ============================================

export const services = [
  {
    id: 'haircut',
    name: 'Haircut',
    category: 'Hair',
    icon: '✂️',
    price: 125,
    duration: 90, // 1.5 hours
    professionalFeePercent: 17,
    professionalFee: 21,
    modelFeePercent: 20,
    modelFee: 25,
    totalRevenue: 46,
    description: 'Precision cut and styling',
    requirements: ['Any hair type'],
  },
  {
    id: 'color',
    name: 'Color',
    category: 'Hair',
    icon: '🎨',
    price: 300,
    duration: 180, // 3 hours
    professionalFeePercent: 12,
    professionalFee: 36,
    modelFeePercent: 10,
    modelFee: 30,
    totalRevenue: 66,
    description: 'Full color treatment',
    requirements: ['Virgin or color-treated hair'],
  },
  {
    id: 'blowdry',
    name: 'Blowdry',
    category: 'Hair',
    icon: '💨',
    price: 90,
    duration: 60, // 1 hour
    professionalFeePercent: 17,
    professionalFee: 15,
    modelFeePercent: 22,
    modelFee: 20,
    totalRevenue: 35,
    description: 'Professional blowout styling',
    requirements: ['Medium to long hair preferred'],
  },
  {
    id: 'gloss',
    name: 'Gloss',
    category: 'Hair',
    icon: '✨',
    price: 100,
    duration: 90, // 1.5 hours
    professionalFeePercent: 17,
    professionalFee: 17,
    modelFeePercent: 25,
    modelFee: 25,
    totalRevenue: 42,
    description: 'Shine and toning treatment',
    requirements: ['Any hair type'],
  },
  {
    id: 'highlights',
    name: 'Highlights',
    category: 'Hair',
    icon: '🌟',
    price: 225,
    duration: 150, // 2.5 hours
    professionalFeePercent: 12,
    professionalFee: 27,
    modelFeePercent: 13,
    modelFee: 30,
    totalRevenue: 57,
    description: 'Partial or full highlights',
    requirements: ['Virgin or lightly processed hair preferred'],
  },
  {
    id: 'keratin',
    name: 'Treatment',
    category: 'Hair',
    icon: '💎',
    price: 300,
    duration: 150, // 2.5 hours
    professionalFeePercent: 12,
    professionalFee: 36,
    modelFeePercent: 12,
    modelFee: 35,
    totalRevenue: 71,
    description: 'Deep conditioning, keratin, or other treatments',
    requirements: ['Frizzy or curly hair ideal for keratin'],
  },
];

// Helper functions
export const getServiceById = (id) => services.find(s => s.id === id);

export const getServicesByCategory = (category) => 
  services.filter(s => s.category === category);

export const formatPrice = (amount) => `$${amount.toLocaleString()}`;

export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Calculate totals
export const getTotalPotentialRevenue = () => 
  services.reduce((sum, s) => sum + s.totalRevenue, 0);

export const getAverageRevenue = () => 
  Math.round(getTotalPotentialRevenue() / services.length);

