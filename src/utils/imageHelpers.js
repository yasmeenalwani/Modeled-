// Image helper utilities for fetching and displaying hair/salon photos

/**
 * Get a random hair/salon photo from Unsplash
 * @param {string} query - Search query (e.g., "hair salon", "balayage", "hair color")
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {string} Image URL
 */
export function getHairPhoto(query = 'hair salon', width = 400, height = 400) {
  // Unsplash API for high-quality photos
  const unsplashUrl = `https://source.unsplash.com/featured/${width}x${height}/?${encodeURIComponent(query)}`;
  return unsplashUrl;
}

/**
 * Get a curated list of hair photo URLs
 * These are actual Unsplash photos that work well for hair/salon contexts
 */
export const HAIR_PHOTO_URLS = {
  salon: [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=400&fit=crop',
  ],
  balayage: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1594736797933-d0e9c6d01c0a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
  ],
  haircut: [
    'https://images.unsplash.com/photo-1560869713-7d563ab9d515?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop',
  ],
  color: [
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop',
  ],
  blowout: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=400&fit=crop',
  ],
  treatment: [
    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop',
  ],
};

/**
 * Get a random photo for a service type
 * @param {string} serviceType - Service type (balayage, haircut, color, etc.)
 * @returns {string} Image URL
 */
export function getPhotoForService(serviceType) {
  const normalized = serviceType?.toLowerCase().replace(/\s+/g, '-');
  
  if (normalized?.includes('balayage') || normalized?.includes('highlight')) {
    const photos = HAIR_PHOTO_URLS.balayage;
    return photos[Math.floor(Math.random() * photos.length)];
  }
  if (normalized?.includes('cut') || normalized?.includes('trim')) {
    const photos = HAIR_PHOTO_URLS.haircut;
    return photos[Math.floor(Math.random() * photos.length)];
  }
  if (normalized?.includes('color') || normalized?.includes('dye')) {
    const photos = HAIR_PHOTO_URLS.color;
    return photos[Math.floor(Math.random() * photos.length)];
  }
  if (normalized?.includes('blowout') || normalized?.includes('style') || normalized?.includes('dry')) {
    const photos = HAIR_PHOTO_URLS.blowout;
    return photos[Math.floor(Math.random() * photos.length)];
  }
  if (normalized?.includes('treatment') || normalized?.includes('condition')) {
    const photos = HAIR_PHOTO_URLS.treatment;
    return photos[Math.floor(Math.random() * photos.length)];
  }
  
  // Default to salon photos
  const photos = HAIR_PHOTO_URLS.salon;
  return photos[Math.floor(Math.random() * photos.length)];
}

/**
 * Get photo URL with error fallback
 * @param {string} url - Image URL
 * @param {string} fallbackUrl - Fallback URL if main fails
 * @returns {string} Image URL
 */
export function getImageWithFallback(url, fallbackUrl = null) {
  if (url) return url;
  return fallbackUrl || getHairPhoto('hair salon');
}

/**
 * Handle image load error and use fallback
 * @param {Event} event - Error event
 * @param {string} fallbackUrl - Fallback URL
 */
export function handleImageError(event, fallbackUrl = null) {
  if (event.target.src !== fallbackUrl) {
    event.target.src = fallbackUrl || getHairPhoto('hair salon');
  }
}

