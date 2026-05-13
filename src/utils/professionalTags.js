// ============================================
// PROFESSIONAL TAG FILTER CONFIGURATION
// For filtering professionals by their attributes
// ============================================

export const PROFESSIONAL_TAG_CATEGORIES = [
  {
    id: 'service',
    label: 'Service Specialties',
    icon: '💇',
    tags: [
      { id: 'haircut', label: 'Haircut' },
      { id: 'color', label: 'Color' },
      { id: 'blowdry', label: 'Blowdry' },
      { id: 'highlights', label: 'Highlights' },
      { id: 'gloss', label: 'Gloss' },
      { id: 'keratin', label: 'Keratin' },
      { id: 'balayage', label: 'Balayage' },
      { id: 'styling', label: 'Styling' },
      { id: 'updos', label: 'Updos' },
      { id: 'color_correction', label: 'Color Correction' },
      { id: 'vivid_colors', label: 'Vivid Colors' },
      { id: 'precision_cuts', label: 'Precision Cuts' },
      { id: 'fades', label: 'Fades' },
      { id: 'makeup', label: 'Makeup' },
      { id: 'bridal', label: 'Bridal' },
      { id: 'extensions', label: 'Extensions' },
      { id: 'treatments', label: 'Treatments' },
    ],
  },
  {
    id: 'certified',
    label: 'Certified In',
    icon: '',
    tags: [
      { id: 'certified_haircut', label: 'Certified: Haircut' },
      { id: 'certified_color', label: 'Certified: Color' },
      { id: 'certified_blowdry', label: 'Certified: Blowdry' },
      { id: 'certified_highlights', label: 'Certified: Highlights' },
      { id: 'certified_gloss', label: 'Certified: Gloss' },
      { id: 'certified_keratin', label: 'Certified: Keratin' },
    ],
  },
  {
    id: 'experience',
    label: 'Experience Level',
    icon: '',
    tags: [
      { id: 'senior', label: 'Senior' },
      { id: 'junior', label: 'Junior' },
      { id: 'apprentice', label: 'Apprentice' },
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
        id: 'success',
        label: 'Booking Success',
        tags: [
          { id: 'success_high', label: 'High (80%+)' },
          { id: 'success_medium', label: 'Medium (50-80%)' },
          { id: 'success_low', label: 'Low (<50%)' },
        ],
      },
      {
        id: 'volume',
        label: 'Request Volume',
        tags: [
          { id: 'volume_high', label: 'High (10+)' },
          { id: 'volume_medium', label: 'Medium (5-10)' },
          { id: 'volume_low', label: 'Low (<5)' },
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

// Convert professional to tags
export const professionalToTags = (professional) => {
  const tags = [];
  
  // Service specialties
  if (professional.specialties && Array.isArray(professional.specialties)) {
    professional.specialties.forEach(spec => {
      // Map specialty names to service tags
      const specMap = {
        'Balayage': 'balayage',
        'Color': 'color',
        'Highlights': 'highlights',
        'Blowouts': 'blowdry',
        'Styling': 'styling',
        'Updos': 'updos',
        'Color Correction': 'color_correction',
        'Vivid Colors': 'vivid_colors',
        'Precision Cuts': 'precision_cuts',
        'Fades': 'fades',
        'Makeup': 'makeup',
        'Bridal': 'bridal',
        'Extensions': 'extensions',
        'Treatments': 'treatments',
      };
      const tagId = specMap[spec] || spec.toLowerCase().replace(/\s+/g, '_');
      tags.push(`service:${tagId}`);
    });
  }
  
  // Certifications (from trainingProgress if available)
  if (professional.trainingProgress) {
    Object.keys(professional.trainingProgress).forEach(service => {
      const training = professional.trainingProgress[service];
      if (training && training.certified) {
        const serviceMap = {
          'haircut': 'certified_haircut',
          'haircuts': 'certified_haircut',
          'color': 'certified_color',
          'blowdry': 'certified_blowdry',
          'blowouts': 'certified_blowdry',
          'highlights': 'certified_highlights',
          'gloss': 'certified_gloss',
          'keratin': 'certified_keratin',
        };
        const certTag = serviceMap[service.toLowerCase()] || `certified_${service.toLowerCase()}`;
        tags.push(`certified:${certTag}`);
      }
    });
  }
  
  // Experience level
  if (professional.level) {
    tags.push(`experience:${professional.level.toLowerCase()}`);
  }
  
  // Performance metrics
  if (professional.rating !== null && professional.rating !== undefined) {
    if (professional.rating >= 4.5) tags.push('performance:rating:rating_high');
    else if (professional.rating >= 4.0) tags.push('performance:rating:rating_medium');
    else tags.push('performance:rating:rating_low');
  }
  
  if (professional.requests && professional.bookings !== undefined) {
    const successRate = professional.requests > 0 ? (professional.bookings / professional.requests) * 100 : 0;
    if (successRate >= 80) tags.push('performance:success:success_high');
    else if (successRate >= 50) tags.push('performance:success:success_medium');
    else tags.push('performance:success:success_low');
  }
  
  if (professional.requests !== undefined) {
    if (professional.requests >= 10) tags.push('performance:volume:volume_high');
    else if (professional.requests >= 5) tags.push('performance:volume:volume_medium');
    else tags.push('performance:volume:volume_low');
  }
  
  // Status
  if (professional.status) {
    tags.push(`status:${professional.status}`);
  }
  
  return tags;
};

// Check if professional matches selected tags
export const professionalMatchesTags = (professional, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return true;
  
  const professionalTags = professionalToTags(professional);
  if (professionalTags.length === 0) return false;
  
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
  
  // For each category, check if professional has at least one matching tag
  return Object.keys(tagsByCategory).every(category => {
    const categoryTags = tagsByCategory[category];
    
    return categoryTags.some(selectedTag => {
      return professionalTags.some(proTag => {
        if (proTag === selectedTag) return true;
        
        const selectedParts = selectedTag.split(':');
        const proParts = proTag.split(':');
        
        if (selectedParts.length >= 2 && proParts.length >= 2) {
          const selectedCategory = selectedParts[0];
          const selectedTagId = selectedParts[selectedParts.length - 1];
          const proCategory = proParts[0];
          const proTagId = proParts[proParts.length - 1];
          
          return selectedCategory === proCategory && selectedTagId === proTagId;
        }
        
        return false;
      });
    });
  });
};

