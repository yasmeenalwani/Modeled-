// ============================================
// SERVICE-SPECIFIC ATTRIBUTE REQUIREMENTS
// Defines minimum required and optional attributes for each service
// ============================================

export const SERVICE_ATTRIBUTES = {
  haircut: {
    minRequired: [
      { category: 'hair', subcategory: 'length', required: true, label: 'Hair Length' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'texture', required: false, label: 'Hair Texture' },
      { category: 'hair', subcategory: 'density', required: false, label: 'Hair Density' },
    ],
    optional: [
      { category: 'hair', subcategory: 'color', required: false, label: 'Hair Color' },
      { category: 'hair', subcategory: 'condition', required: false, label: 'Hair Condition' },
      { category: 'features', subcategory: 'face', required: false, label: 'Face Shape' },
    ],
    description: 'Hair length is critical for cuts. Texture and density help determine the best cutting technique.',
  },
  
  color: {
    minRequired: [
      { category: 'hair', subcategory: 'condition', required: true, label: 'Hair Condition' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'color', required: false, label: 'Current Hair Color' },
    ],
    optional: [
      { category: 'hair', subcategory: 'length', required: false, label: 'Hair Length' },
      { category: 'hair', subcategory: 'texture', required: false, label: 'Hair Texture' },
      { category: 'metadata', tags: ['before'], required: false, label: 'Before Photo' },
    ],
    description: 'Hair condition is critical for color services. Virgin hair is ideal for major color changes.',
  },
  
  highlights: {
    minRequired: [
      { category: 'hair', subcategory: 'color', required: true, label: 'Current Hair Color' },
      { category: 'hair', subcategory: 'condition', required: true, label: 'Hair Condition' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'length', required: false, label: 'Hair Length' },
    ],
    optional: [
      { category: 'hair', subcategory: 'texture', required: false, label: 'Hair Texture' },
      { category: 'metadata', tags: ['before'], required: false, label: 'Before Photo' },
    ],
    description: 'Current color and condition are essential. Virgin or lightly processed hair is preferred.',
  },
  
  blowdry: {
    minRequired: [
      { category: 'hair', subcategory: 'texture', required: true, label: 'Hair Texture' },
      { category: 'hair', subcategory: 'length', required: true, label: 'Hair Length' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'density', required: false, label: 'Hair Density' },
    ],
    optional: [
      { category: 'hair', subcategory: 'style', required: false, label: 'Desired Style' },
      { category: 'hair', subcategory: 'color', required: false, label: 'Hair Color' },
    ],
    description: 'Texture and length are key for blowout technique. Medium to long hair preferred.',
  },
  
  gloss: {
    minRequired: [
      { category: 'hair', subcategory: 'condition', required: true, label: 'Hair Condition' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'color', required: false, label: 'Hair Color' },
    ],
    optional: [
      { category: 'hair', subcategory: 'length', required: false, label: 'Hair Length' },
      { category: 'hair', subcategory: 'texture', required: false, label: 'Hair Texture' },
    ],
    description: 'Hair condition is important for gloss treatments. Works on any hair type.',
  },
  
  keratin: {
    minRequired: [
      { category: 'hair', subcategory: 'texture', required: true, label: 'Hair Texture' },
      { category: 'hair', subcategory: 'condition', required: true, label: 'Hair Condition' },
    ],
    recommended: [
      { category: 'hair', subcategory: 'length', required: false, label: 'Hair Length' },
    ],
    optional: [
      { category: 'hair', subcategory: 'density', required: false, label: 'Hair Density' },
      { category: 'metadata', tags: ['before'], required: false, label: 'Before Photo' },
    ],
    description: 'Texture and condition are critical. Curly or frizzy hair is ideal for keratin treatments.',
  },
};

// Get attributes for a service
export const getServiceAttributes = (serviceId) => {
  return SERVICE_ATTRIBUTES[serviceId] || {
    minRequired: [],
    recommended: [],
    optional: [],
    description: 'Select attributes to help us find the perfect match.',
  };
};

// Check if required attributes are selected
export const validateRequiredAttributes = (serviceId, selectedTags) => {
  const serviceAttrs = getServiceAttributes(serviceId);
  const missing = [];
  
  serviceAttrs.minRequired.forEach(attr => {
    const hasTag = selectedTags.some(tag => {
      if (attr.subcategory) {
        return tag.startsWith(`${attr.category}:${attr.subcategory}:`);
      }
      return tag.startsWith(`${attr.category}:`);
    });
    
    if (!hasTag) {
      missing.push(attr.label);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

// Get tag suggestions based on service
export const getServiceTagSuggestions = (serviceId) => {
  const serviceAttrs = getServiceAttributes(serviceId);
  const suggestions = [];
  
  // Add required categories
  serviceAttrs.minRequired.forEach(attr => {
    suggestions.push({
      category: attr.category,
      subcategory: attr.subcategory,
      priority: 'required',
      label: attr.label,
    });
  });
  
  // Add recommended categories
  serviceAttrs.recommended.forEach(attr => {
    suggestions.push({
      category: attr.category,
      subcategory: attr.subcategory,
      priority: 'recommended',
      label: attr.label,
    });
  });
  
  // Add optional categories
  serviceAttrs.optional.forEach(attr => {
    suggestions.push({
      category: attr.category,
      subcategory: attr.subcategory,
      priority: 'optional',
      label: attr.label,
    });
  });
  
  return suggestions;
};

