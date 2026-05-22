// ============================================
// PARTNER/SALON TAG FILTER CONFIGURATION
// For filtering partners by their attributes
// ============================================

export const PARTNER_TAG_CATEGORIES = [
  {
    id: 'type',
    label: 'Business Type',
    icon: '🏢',
    tags: [
      { id: 'salon', label: 'Salon' },
      { id: 'studio', label: 'Studio' },
      { id: 'school', label: 'School' },
      { id: 'spa', label: 'Spa' },
      { id: 'med_spa', label: 'Med Spa' },
      { id: 'barbershop', label: 'Barbershop' },
      { id: 'other', label: 'Other' },
    ],
  },
  {
    id: 'size',
    label: 'Size',
    icon: '👥',
    subcategories: [
      {
        id: 'stylists',
        label: 'By Stylists',
        tags: [
          { id: 'large', label: 'Large (8+)' },
          { id: 'medium', label: 'Medium (4-7)' },
          { id: 'small', label: 'Small (1-3)' },
        ],
      },
      {
        id: 'locations',
        label: 'By Locations',
        tags: [
          { id: 'multi_location', label: 'Multi-Location' },
          { id: 'single_location', label: 'Single Location' },
        ],
      },
    ],
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: '📊',
    subcategories: [
      {
        id: 'rating',
        label: 'Rating',
        tags: [
          { id: 'rating_high', label: '4.5+ Stars' },
          { id: 'rating_medium', label: '4.0-4.5 Stars' },
          { id: 'rating_low', label: 'Below 4.0' },
        ],
      },
      {
        id: 'bookings',
        label: 'Booking Volume',
        tags: [
          { id: 'bookings_high', label: 'High (50+)' },
          { id: 'bookings_medium', label: 'Medium (25-50)' },
          { id: 'bookings_low', label: 'Low (<25)' },
        ],
      },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    icon: '🔔',
    tags: [
      { id: 'active', label: 'Active' },
      { id: 'pending', label: 'Pending' },
      { id: 'inactive', label: 'Inactive' },
    ],
  },
];

// Convert partner/salon to tags
export const partnerToTags = (partner) => {
  const tags = [];
  
  // Business type
  if (partner.type || partner.businessType) {
    const type = (partner.type || partner.businessType).toLowerCase();
    tags.push(`type:${type}`);
  }
  
  // Size by stylists
  if (partner.stylists !== undefined) {
    if (partner.stylists >= 8) tags.push('size:stylists:large');
    else if (partner.stylists >= 4) tags.push('size:stylists:medium');
    else tags.push('size:stylists:small');
  }
  
  // Size by locations
  const siteCount =
    partner.locationCount ??
    (Array.isArray(partner.locationSites) ? partner.locationSites.filter((s) => !s?.seasonal).length : null) ??
    (partner.locations ? partner.locations.length : 1);
  if (siteCount > 1) {
    tags.push('size:locations:multi_location');
  } else {
    tags.push('size:locations:single_location');
  }

  if (Array.isArray(partner.tags)) {
    partner.tags.forEach((t) => {
      if (typeof t === 'string' && t.trim()) tags.push(`tag:${t.trim()}`);
    });
  }
  
  // Performance metrics
  if (partner.rating !== null && partner.rating !== undefined) {
    if (partner.rating >= 4.5) tags.push('performance:rating:rating_high');
    else if (partner.rating >= 4.0) tags.push('performance:rating:rating_medium');
    else tags.push('performance:rating:rating_low');
  }
  
  if (partner.bookings !== undefined) {
    if (partner.bookings >= 50) tags.push('performance:bookings:bookings_high');
    else if (partner.bookings >= 25) tags.push('performance:bookings:bookings_medium');
    else tags.push('performance:bookings:bookings_low');
  }
  
  // Status
  if (partner.status) {
    tags.push(`status:${partner.status}`);
  }
  
  return tags;
};

// Check if partner matches selected tags
export const partnerMatchesTags = (partner, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return true;
  
  const partnerTags = partnerToTags(partner);
  if (partnerTags.length === 0) return false;
  
  // Group selected tags by category
  const tagsByCategory = {};
  selectedTags.forEach(tag => {
    const parts = tag.split(':');
    const category = parts[0];
    if (!tagsByCategory[category]) {
      tagsByCategory[category] = [];
    }
    tagsByCategory[category].push(tag);
  });
  
  // For each category, check if partner has at least one matching tag
  return Object.keys(tagsByCategory).every(category => {
    const categoryTags = tagsByCategory[category];
    
    return categoryTags.some(selectedTag => {
      return partnerTags.some(partnerTag => {
        if (partnerTag === selectedTag) return true;
        
        const selectedParts = selectedTag.split(':');
        const partnerParts = partnerTag.split(':');
        
        if (selectedParts.length >= 2 && partnerParts.length >= 2) {
          const selectedCategory = selectedParts[0];
          const selectedTagId = selectedParts[selectedParts.length - 1];
          const partnerCategory = partnerParts[0];
          const partnerTagId = partnerParts[partnerParts.length - 1];
          
          return selectedCategory === partnerCategory && selectedTagId === partnerTagId;
        }
        
        return false;
      });
    });
  });
};

