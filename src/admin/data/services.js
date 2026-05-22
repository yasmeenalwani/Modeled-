// ============================================
// MODELED MANAGEMENT - Services & Pricing
// ============================================

export const services = [
  // —— Hair: Cuts & styling ——
  { id: 'haircut', name: "Women's haircut", category: 'Hair — Cuts & styling', icon: '✂️', price: 125, duration: 90, professionalFeePercent: 17, professionalFee: 21, modelFeePercent: 20, modelFee: 25, totalRevenue: 46, description: 'Precision cut and styling', requirements: ['Any hair type'] },
  { id: 'mens_cut', name: "Men's haircut", category: 'Hair — Cuts & styling', icon: '✂️', price: 95, duration: 60, professionalFeePercent: 17, professionalFee: 16, modelFeePercent: 20, modelFee: 19, totalRevenue: 35, description: "Men's cut and finish", requirements: ['Any hair type'] },
  { id: 'blowdry', name: 'Blowdry / blowout', category: 'Hair — Cuts & styling', icon: '💨', price: 90, duration: 60, professionalFeePercent: 17, professionalFee: 15, modelFeePercent: 22, modelFee: 20, totalRevenue: 35, description: 'Professional blowout styling', requirements: ['Medium to long hair preferred'] },
  { id: 'updo', name: 'Updo / special occasion', category: 'Hair — Cuts & styling', icon: '💫', price: 175, duration: 90, professionalFeePercent: 15, professionalFee: 26, modelFeePercent: 18, modelFee: 32, totalRevenue: 58, description: 'Event or editorial updo', requirements: ['Medium to long hair'] },
  { id: 'styling', name: 'Styling session', category: 'Hair — Cuts & styling', icon: '💇', price: 100, duration: 75, professionalFeePercent: 17, professionalFee: 17, modelFeePercent: 20, modelFee: 20, totalRevenue: 37, description: 'Iron work, waves, or finish styling', requirements: ['Any hair type'] },
  // —— Hair: Color ——
  { id: 'color', name: 'Single process color', category: 'Hair — Color', icon: '🎨', price: 300, duration: 180, professionalFeePercent: 12, professionalFee: 36, modelFeePercent: 10, modelFee: 30, totalRevenue: 66, description: 'Full color application', requirements: ['Virgin or color-treated hair'] },
  { id: 'highlights', name: 'Highlights / foils', category: 'Hair — Color', icon: '🌟', price: 225, duration: 150, professionalFeePercent: 12, professionalFee: 27, modelFeePercent: 13, modelFee: 30, totalRevenue: 57, description: 'Partial or full highlights', requirements: ['Virgin or lightly processed hair preferred'] },
  { id: 'balayage', name: 'Balayage / hand-paint', category: 'Hair — Color', icon: '🖌️', price: 275, duration: 180, professionalFeePercent: 12, professionalFee: 33, modelFeePercent: 12, modelFee: 33, totalRevenue: 66, description: 'Hand-painted lightening or color melt', requirements: ['Virgin or lightly processed preferred'] },
  { id: 'gloss', name: 'Gloss / toner', category: 'Hair — Color', icon: '✨', price: 100, duration: 90, professionalFeePercent: 17, professionalFee: 17, modelFeePercent: 25, modelFee: 25, totalRevenue: 42, description: 'Shine and toning treatment', requirements: ['Any hair type'] },
  { id: 'root_touchup', name: 'Root touch-up', category: 'Hair — Color', icon: '🎯', price: 160, duration: 90, professionalFeePercent: 14, professionalFee: 22, modelFeePercent: 15, modelFee: 24, totalRevenue: 46, description: 'Regrowth color maintenance', requirements: ['Color-treated hair'] },
  { id: 'color_correction', name: 'Color correction', category: 'Hair — Color', icon: '🔧', price: 350, duration: 240, professionalFeePercent: 10, professionalFee: 35, modelFeePercent: 10, modelFee: 35, totalRevenue: 70, description: 'Corrective color work', requirements: ['Assessment required'] },
  // —— Hair: Treatments ——
  { id: 'keratin', name: 'Keratin / smoothing', category: 'Hair — Treatments', icon: '💎', price: 300, duration: 150, professionalFeePercent: 12, professionalFee: 36, modelFeePercent: 12, modelFee: 35, totalRevenue: 71, description: 'Keratin or smoothing treatment', requirements: ['Curly or frizzy hair ideal'] },
  { id: 'deep_conditioning', name: 'Deep conditioning / mask', category: 'Hair — Treatments', icon: '🧴', price: 85, duration: 60, professionalFeePercent: 18, professionalFee: 15, modelFeePercent: 22, modelFee: 19, totalRevenue: 34, description: 'Intensive moisture or repair mask', requirements: ['Any hair type'] },
  { id: 'scalp_treatment', name: 'Scalp treatment', category: 'Hair — Treatments', icon: '🌿', price: 75, duration: 45, professionalFeePercent: 18, professionalFee: 14, modelFeePercent: 22, modelFee: 17, totalRevenue: 31, description: 'Scalp detox or therapeutic treatment', requirements: ['Any hair type'] },
  // —— Hair: Extensions ——
  { id: 'extensions', name: 'Hair extensions', category: 'Hair — Extensions', icon: '🔗', price: 400, duration: 180, professionalFeePercent: 10, professionalFee: 40, modelFeePercent: 10, modelFee: 40, totalRevenue: 80, description: 'Install, move-up, or removal session', requirements: ['Consultation required'] },
  { id: 'extensions_consult', name: 'Extensions consultation', category: 'Hair — Extensions', icon: '📋', price: 0, duration: 30, professionalFeePercent: 0, professionalFee: 0, modelFeePercent: 0, modelFee: 0, totalRevenue: 0, description: 'Consult only — no model payout default', requirements: ['N/A'] },
  // —— Beauty ——
  { id: 'makeup', name: 'Makeup application', category: 'Beauty', icon: '💄', price: 200, duration: 90, professionalFeePercent: 15, professionalFee: 30, modelFeePercent: 15, modelFee: 30, totalRevenue: 60, description: 'Full face makeup', requirements: ['Skin tone match helpful'] },
  { id: 'brows', name: 'Brows / lamination', category: 'Beauty', icon: '👁️', price: 50, duration: 45, professionalFeePercent: 20, professionalFee: 10, modelFeePercent: 25, modelFee: 13, totalRevenue: 23, description: 'Brow shaping, tint, or lamination', requirements: ['Any'] },
  { id: 'lashes', name: 'Lash lift / tint', category: 'Beauty', icon: '✨', price: 160, duration: 75, professionalFeePercent: 15, professionalFee: 24, modelFeePercent: 18, modelFee: 29, totalRevenue: 53, description: 'Lash lift or tint service', requirements: ['Any'] },
  { id: 'nails_manicure', name: 'Manicure', category: 'Beauty', icon: '💅', price: 65, duration: 60, professionalFeePercent: 18, professionalFee: 12, modelFeePercent: 22, modelFee: 14, totalRevenue: 26, description: 'Classic or gel manicure', requirements: ['Any'] },
  { id: 'nails_pedi', name: 'Pedicure', category: 'Beauty', icon: '🦶', price: 75, duration: 75, professionalFeePercent: 18, professionalFee: 14, modelFeePercent: 22, modelFee: 17, totalRevenue: 31, description: 'Pedicure or medi-pedi', requirements: ['Any'] },
  { id: 'skincare', name: 'Skincare / facial', category: 'Beauty', icon: '🧖', price: 120, duration: 60, professionalFeePercent: 15, professionalFee: 18, modelFeePercent: 18, modelFee: 22, totalRevenue: 40, description: 'Facial or skincare treatment', requirements: ['Skin type match helpful'] },
  { id: 'waxing', name: 'Waxing / threading', category: 'Beauty', icon: '🪶', price: 45, duration: 30, professionalFeePercent: 20, professionalFee: 9, modelFeePercent: 25, modelFee: 11, totalRevenue: 20, description: 'Wax or threading service', requirements: ['Any'] },
  // —— Bridal ——
  { id: 'bridal_hair', name: 'Bridal hair', category: 'Bridal', icon: '👰', price: 250, duration: 120, professionalFeePercent: 12, professionalFee: 30, modelFeePercent: 12, modelFee: 30, totalRevenue: 60, description: 'Wedding day hair', requirements: ['Trial recommended'] },
  { id: 'bridal_makeup', name: 'Bridal makeup', category: 'Bridal', icon: '💒', price: 250, duration: 90, professionalFeePercent: 12, professionalFee: 30, modelFeePercent: 12, modelFee: 30, totalRevenue: 60, description: 'Wedding day makeup', requirements: ['Trial recommended'] },
  { id: 'bridal_trial', name: 'Bridal trial', category: 'Bridal', icon: '📅', price: 150, duration: 90, professionalFeePercent: 14, professionalFee: 21, modelFeePercent: 15, modelFee: 23, totalRevenue: 44, description: 'Pre-wedding trial run', requirements: ['Any'] },
];

// Helper functions
export const getServiceById = (id) => services.find(s => s.id === id);

export const getServicesByCategory = (category) =>
  services.filter(s => s.category === category);

/** Unique categories in display order */
export const getServiceCategories = () => {
  const seen = new Set();
  const order = [];
  for (const s of services) {
    if (!seen.has(s.category)) {
      seen.add(s.category);
      order.push(s.category);
    }
  }
  return order;
};

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

