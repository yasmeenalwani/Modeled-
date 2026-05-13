/**
 * Storage Limits Configuration
 * 
 * Defines content limits per user type to balance user experience
 * with storage costs. Limits are enforced in upload components.
 * 
 * Updated: 2026-01-05
 */

export const STORAGE_LIMITS = {
  // ============ MODELS ============
  model: {
    profilePhotos: {
      min: 3, // Required minimum for analysis
      max: 15, // Maximum allowed
      required: true,
    },
    profileVideos: {
      min: 0,
      max: 5,
      required: false,
    },
    inspirationPhotos: {
      min: 0,
      max: 20,
      required: false,
    },
    inspirationVideos: {
      min: 0,
      max: 5,
      required: false,
    },
    // Estimated total storage per model: ~222MB (balanced strategy)
    estimatedStorageMB: 222,
  },

  // ============ PROFESSIONALS ============
  professional: {
    profilePhotos: {
      min: 1, // Self photos for verification
      max: 10,
      required: true,
    },
    portfolioPhotos: {
      min: 5, // Before/after work photos
      max: 50,
      required: true,
    },
    profileVideos: {
      min: 0,
      max: 3,
      required: false,
    },
    portfolioVideos: {
      min: 0,
      max: 10,
      required: false,
    },
    inspirationPhotos: {
      min: 0,
      max: 15,
      required: false,
    },
    inspirationVideos: {
      min: 0,
      max: 3,
      required: false,
    },
    // Estimated total storage per professional: ~394MB (balanced strategy)
    estimatedStorageMB: 394,
  },

  // ============ PARTNERS ============
  partner: {
    salonPhotos: {
      min: 3, // Salon/studio space photos
      max: 20,
      required: true,
    },
    contactPhotos: {
      min: 1, // Contact person photos
      max: 5,
      required: true,
    },
    profileVideos: {
      min: 0,
      max: 3,
      required: false,
    },
    inspirationPhotos: {
      min: 0,
      max: 10,
      required: false,
    },
    inspirationVideos: {
      min: 0,
      max: 2,
      required: false,
    },
    // Estimated total storage per partner: ~147MB (balanced strategy)
    estimatedStorageMB: 147,
  },
};

/**
 * Get storage limits for a user type
 */
export function getStorageLimits(userType) {
  return STORAGE_LIMITS[userType] || null;
}

/**
 * Check if a content type is within limits
 */
export function checkContentLimit(userType, contentType, currentCount) {
  const limits = getStorageLimits(userType);
  if (!limits || !limits[contentType]) {
    return { valid: false, error: 'Invalid content type' };
  }

  const limit = limits[contentType];
  if (currentCount < limit.min) {
    return {
      valid: false,
      error: `Minimum ${limit.min} ${contentType} required`,
      required: limit.required,
    };
  }

  if (currentCount >= limit.max) {
    return {
      valid: false,
      error: `Maximum ${limit.max} ${contentType} allowed`,
      max: limit.max,
    };
  }

  return { valid: true, remaining: limit.max - currentCount };
}

/**
 * Get estimated storage for a user
 */
export function getEstimatedStorage(userType, contentCounts = {}) {
  const limits = getStorageLimits(userType);
  if (!limits) return null;

  // Calculate based on actual counts or use defaults
  let totalMB = 0;

  // Profile photos
  const profilePhotoCount = contentCounts.profilePhotos || limits.profilePhotos.max;
  totalMB += profilePhotoCount * 2.05; // 2MB photo + 50KB thumbnail

  // Profile videos
  const profileVideoCount = contentCounts.profileVideos || limits.profileVideos.max;
  totalMB += profileVideoCount * 15.05; // 15MB video + 50KB thumbnail

  // Portfolio photos (professionals only)
  if (userType === 'professional') {
    const portfolioPhotoCount = contentCounts.portfolioPhotos || limits.portfolioPhotos.max;
    totalMB += portfolioPhotoCount * 2.05;
  }

  // Portfolio videos (professionals only)
  if (userType === 'professional') {
    const portfolioVideoCount = contentCounts.portfolioVideos || limits.portfolioVideos.max;
    totalMB += portfolioVideoCount * 15.05;
  }

  // Inspiration photos
  const inspirationPhotoCount = contentCounts.inspirationPhotos || limits.inspirationPhotos?.max || 0;
  totalMB += inspirationPhotoCount * 1.55; // 1.5MB photo + 50KB thumbnail

  // Inspiration videos
  const inspirationVideoCount = contentCounts.inspirationVideos || limits.inspirationVideos?.max || 0;
  totalMB += inspirationVideoCount * 8.05; // 8MB video + 50KB thumbnail

  // Salon photos (partners only)
  if (userType === 'partner') {
    const salonPhotoCount = contentCounts.salonPhotos || limits.salonPhotos.max;
    totalMB += salonPhotoCount * 2.05;
  }

  // Contact photos (partners only)
  if (userType === 'partner') {
    const contactPhotoCount = contentCounts.contactPhotos || limits.contactPhotos.max;
    totalMB += contactPhotoCount * 2.05;
  }

  return {
    totalMB: Math.round(totalMB * 100) / 100,
    totalGB: Math.round((totalMB / 1024) * 100) / 100,
    estimated: limits.estimatedStorageMB,
  };
}

/**
 * Validate all content limits for a user
 */
export function validateAllLimits(userType, contentCounts) {
  const limits = getStorageLimits(userType);
  if (!limits) {
    return { valid: false, errors: ['Invalid user type'] };
  }

  const errors = [];
  const warnings = [];

  // Check each content type
  for (const [contentType, count] of Object.entries(contentCounts)) {
    const check = checkContentLimit(userType, contentType, count);
    if (!check.valid) {
      if (check.required) {
        errors.push(check.error);
      } else {
        warnings.push(check.error);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

