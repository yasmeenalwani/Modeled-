// ============================================
// GALLERY TAG FILTER CONFIGURATION
// Aligned with matching engine attributes
// ============================================

export const GALLERY_TAG_CATEGORIES = [
  {
    id: 'service',
    label: 'Service Type',
    icon: '💇',
    tags: [
      { id: 'haircut', label: 'Haircut' },
      { id: 'color', label: 'Color' },
      { id: 'blowdry', label: 'Blowdry' },
      { id: 'highlights', label: 'Highlights' },
      { id: 'gloss', label: 'Gloss' },
      { id: 'keratin', label: 'Keratin' },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    icon: '',
    subcategories: [
      {
        id: 'length',
        label: 'Length',
        tags: [
          { id: 'short', label: 'Short' },
          { id: 'medium', label: 'Medium' },
          { id: 'long', label: 'Long' },
          { id: 'extra_long', label: 'Extra Long' },
        ],
      },
      {
        id: 'color',
        label: 'Color',
        tags: [
          { id: 'black', label: 'Black' },
          { id: 'brown', label: 'Brown' },
          { id: 'blonde', label: 'Blonde' },
          { id: 'red', label: 'Red' },
          { id: 'gray', label: 'Gray' },
          { id: 'colored', label: 'Colored' },
        ],
      },
      {
        id: 'texture',
        label: 'Texture',
        tags: [
          { id: 'straight', label: 'Straight' },
          { id: 'wavy', label: 'Wavy' },
          { id: 'curly', label: 'Curly' },
          { id: 'coily', label: 'Coily' },
        ],
      },
      {
        id: 'density',
        label: 'Density',
        tags: [
          { id: 'thin', label: 'Thin' },
          { id: 'medium', label: 'Medium' },
          { id: 'thick', label: 'Thick' },
        ],
      },
      {
        id: 'style',
        label: 'Style',
        tags: [
          { id: 'natural', label: 'Natural' },
          { id: 'blowout', label: 'Blowout' },
          { id: 'silk_press', label: 'Silk Press' },
          { id: 'braids', label: 'Braids' },
          { id: 'cornrows', label: 'Cornrows' },
          { id: 'locs', label: 'Locs' },
          { id: 'twists', label: 'Twists' },
          { id: 'afro', label: 'Afro' },
          { id: 'bantu_knots', label: 'Bantu Knots' },
          { id: 'ponytail', label: 'Ponytail' },
          { id: 'updo', label: 'Updo' },
          { id: 'bob', label: 'Bob' },
        ],
      },
      {
        id: 'condition',
        label: 'Condition',
        tags: [
          { id: 'healthy', label: 'Healthy' },
          { id: 'damaged', label: 'Damaged' },
          { id: 'color_treated', label: 'Color Treated' },
          { id: 'virgin', label: 'Virgin' },
        ],
      },
    ],
  },
  {
    id: 'features',
    label: 'Features',
    icon: '👤',
    subcategories: [
      {
        id: 'face',
        label: 'Face Shape',
        tags: [
          { id: 'oval', label: 'Oval' },
          { id: 'round', label: 'Round' },
          { id: 'square', label: 'Square' },
          { id: 'heart', label: 'Heart' },
          { id: 'oblong', label: 'Oblong' },
          { id: 'diamond', label: 'Diamond' },
        ],
      },
      {
        id: 'skin',
        label: 'Skin Tone',
        tags: [
          { id: 'fair', label: 'Fair' },
          { id: 'light', label: 'Light' },
          { id: 'medium', label: 'Medium' },
          { id: 'olive', label: 'Olive' },
          { id: 'tan', label: 'Tan' },
          { id: 'brown', label: 'Brown' },
          { id: 'dark', label: 'Dark' },
        ],
      },
      {
        id: 'eyes',
        label: 'Eyes',
        tags: [
          { id: 'brown_eyes', label: 'Brown' },
          { id: 'blue_eyes', label: 'Blue' },
          { id: 'green_eyes', label: 'Green' },
          { id: 'hazel_eyes', label: 'Hazel' },
          { id: 'gray_eyes', label: 'Gray' },
          { id: 'amber_eyes', label: 'Amber' },
          { id: 'almond_eyes', label: 'Almond Shape' },
          { id: 'round_eyes', label: 'Round Shape' },
          { id: 'hooded_eyes', label: 'Hooded' },
        ],
      },
      {
        id: 'eyebrows',
        label: 'Eyebrows',
        tags: [
          { id: 'arched', label: 'Arched' },
          { id: 'straight_brows', label: 'Straight' },
          { id: 'curved_brows', label: 'Curved' },
          { id: 's_shaped', label: 'S-Shaped' },
          { id: 'rounded_brows', label: 'Rounded' },
        ],
      },
    ],
  },
  {
    id: 'metadata',
    label: 'Photo Info',
    icon: '📸',
    tags: [
      { id: 'before', label: 'Before' },
      { id: 'after', label: 'After' },
      { id: 'both', label: 'Before & After' },
      { id: 'rated_5', label: '5 Stars' },
      { id: 'rated_4', label: '4 Stars' },
      { id: 'rated_3', label: '3 Stars' },
    ],
  },
];

// Helper function to get all tag IDs in a flat structure
export const getAllTagIds = () => {
  const tagIds = [];
  
  GALLERY_TAG_CATEGORIES.forEach(category => {
    if (category.tags) {
      category.tags.forEach(tag => {
        tagIds.push(`${category.id}:${tag.id}`);
      });
    }
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        subcat.tags.forEach(tag => {
          tagIds.push(`${category.id}:${subcat.id}:${tag.id}`);
        });
      });
    }
  });
  
  return tagIds;
};

// Helper function to check if a photo matches selected tags
// Uses OR logic across categories (if you select "Hair: Long" OR "Service: Color", shows photos with either)
// Uses AND logic within same category (if you select "Hair: Long" AND "Hair: Brown", shows photos with both)
export const photoMatchesTags = (photo, selectedTags) => {
  if (!selectedTags || selectedTags.length === 0) return true;
  
  // Get photo tags (could be from photo.tags array or photo attributes)
  const photoTags = photo.tags || [];
  if (photoTags.length === 0) return false;
  
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
  
  // For each category, check if photo has at least one matching tag (AND within category)
  // Then all categories must match (OR across categories)
  return Object.keys(tagsByCategory).every(category => {
    const categoryTags = tagsByCategory[category];
    
    // Check if photo has any of the tags in this category
    return categoryTags.some(selectedTag => {
      return photoTags.some(photoTag => {
        // Exact match
        if (photoTag === selectedTag) return true;
        
        // Check if tag is part of a category match
        const selectedParts = selectedTag.split(':');
        const photoParts = photoTag.split(':');
        
        // Match if category and tag match (ignore subcategory)
        if (selectedParts.length >= 2 && photoParts.length >= 2) {
          const selectedCategory = selectedParts[0];
          const selectedTagId = selectedParts[selectedParts.length - 1];
          const photoCategory = photoParts[0];
          const photoTagId = photoParts[photoParts.length - 1];
          
          return selectedCategory === photoCategory && selectedTagId === photoTagId;
        }
        
        return false;
      });
    });
  });
};

