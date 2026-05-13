/**
 * MODELED MANAGEMENT - Storage Utilities
 * 
 * Centralized functions for S3 file operations
 * Used across all portals for photos, documents, and videos
 */

import { uploadData, getUrl, remove, list } from 'aws-amplify/storage';

// ============ CONFIGURATION ============
// Updated 2026-01-05: Balanced strategy for cost optimization
export const STORAGE_CONFIG = {
  // Profile Photos (models, professionals, partners) - onboarding must accept typical phone photos
  photo: {
    maxSizeMB: 15,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    maxDimension: 4096,
    quality: 0.85, // JPEG compression quality (85%)
  },
  // Inspiration Photos (inspiration board)
  inspirationPhoto: {
    maxSizeMB: 15,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
    maxDimension: 1920,
    quality: 0.80, // JPEG compression quality (80%)
  },
  // Document settings
  document: {
    maxSizeMB: 25,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  // Profile Videos (models, professionals, partners)
  video: {
    maxSizeMB: 15, // Reduced from 50MB for cost optimization
    maxDurationSeconds: 30,
    acceptedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxResolution: '1080p', // 1920x1080
    bitrate: 5000, // 5Mbps
  },
  // Inspiration Videos (inspiration board)
  inspirationVideo: {
    maxSizeMB: 8,
    maxDurationSeconds: 15,
    acceptedTypes: ['video/mp4', 'video/quicktime', 'video/webm'],
    maxResolution: '720p', // 1280x720
    bitrate: 4000, // 4Mbps
  },
  // Thumbnail settings (auto-generated)
  thumbnail: {
    size: 300, // 300x300px
    quality: 0.75, // JPEG compression quality (75%)
    maxSizeKB: 50, // Target thumbnail size
  },
};

// ============ PATH HELPERS ============

/**
 * Generate storage path for profile photos
 */
export const getProfilePhotoPath = (userType, userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `profile-photos/${userType}s/${userId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for session photos
 */
export const getSessionPhotoPath = (type, bookingId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `session-photos/${type}/${bookingId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for portfolio images
 */
export const getPortfolioPath = (professionalId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const safeBase = baseName
    .replace(/[^a-z0-9_-]+/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  const suffix = safeBase ? `-${safeBase}` : '';
  return `portfolios/${professionalId}/${timestamp}${suffix}.${ext}`;
};

/**
 * Generate storage path for documents
 */
export const getDocumentPath = (docType, userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `documents/${docType}/${userId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for profile videos
 */
export const getVideoReelPath = (userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `videos/profile/${userId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for portfolio videos
 */
export const getPortfolioVideoPath = (professionalId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `videos/portfolio/${professionalId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for inspiration photos
 */
export const getInspirationPhotoPath = (userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `inspiration/photos/${userId}/${timestamp}.${ext}`;
};

/**
 * Generate storage path for inspiration videos
 */
export const getInspirationVideoPath = (userId, filename) => {
  const timestamp = Date.now();
  const ext = filename.split('.').pop();
  return `videos/inspiration/${userId}/${timestamp}.${ext}`;
};

// ============ UPLOAD FUNCTIONS ============

/**
 * Upload a file to S3
 * @param {File} file - The file to upload
 * @param {string} path - The S3 path
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{key: string, url: string}>}
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    // Validate file
    const validation = validateFile(file, getFileCategory(file.type));
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Upload with progress tracking
    const result = await uploadData({
      path,
      data: file,
      options: {
        contentType: file.type,
        onProgress: (progress) => {
          if (onProgress) {
            const pct = Math.round((progress.transferredBytes / progress.totalBytes) * 100);
            onProgress(pct);
          }
        },
      },
    }).result;

    // Get the URL
    const storedPath = result.path || path;
    const urlResult = await getUrl({ path: storedPath });

    return {
      key: storedPath,
      url: urlResult.url.toString(),
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files, pathGenerator, onProgress = null) => {
  const results = [];
  let completed = 0;

  for (const file of files) {
    const path = pathGenerator(file.name);
    const result = await uploadFile(file, path, (pct) => {
      if (onProgress) {
        const overall = Math.round(((completed + pct / 100) / files.length) * 100);
        onProgress(overall);
      }
    });
    results.push(result);
    completed++;
  }

  return results;
};

// ============ RETRIEVE FUNCTIONS ============

/**
 * Get a signed URL for a file
 */
export const getFileUrl = async (key, expiresIn = 3600) => {
  try {
    const result = await getUrl({
      path: key,
      options: { expiresIn },
    });
    return result.url.toString();
  } catch (error) {
    console.error('Get URL error:', error);
    throw error;
  }
};

/**
 * List files in a path
 */
export const listFiles = async (path) => {
  try {
    const result = await list({
      path,
    });
    return result.items;
  } catch (error) {
    console.error('List error:', error);
    throw error;
  }
};

// ============ DELETE FUNCTIONS ============

/**
 * Delete a file
 */
export const deleteFile = async (key) => {
  try {
    await remove({ path: key });
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

/**
 * Delete multiple files
 */
export const deleteMultipleFiles = async (keys) => {
  const results = await Promise.all(
    keys.map(async (key) => {
      try {
        await remove({ path: key });
        return { key, success: true };
      } catch (error) {
        return { key, success: false, error };
      }
    })
  );
  return results;
};

// ============ VALIDATION ============

/**
 * Determine file category from MIME type
 */
const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'photo';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'document';
  return 'unknown';
};

/**
 * Validate a file against configuration
 */
export const validateFile = (file, category = 'photo') => {
  const config = STORAGE_CONFIG[category];
  
  if (!config) {
    return { valid: false, error: 'Unknown file category' };
  }

  // Check file type
  if (!config.acceptedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Accepted: ${config.acceptedTypes.join(', ')}`,
    };
  }

  // Check file size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > config.maxSizeMB) {
    return {
      valid: false,
      error: `File too large. Maximum: ${config.maxSizeMB}MB, yours: ${sizeMB.toFixed(1)}MB`,
    };
  }

  return { valid: true };
};

/**
 * Validate image dimensions (client-side)
 */
export const validateImageDimensions = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxDim = STORAGE_CONFIG.photo.maxDimension;
      if (img.width > maxDim || img.height > maxDim) {
        resolve({
          valid: false,
          error: `Image too large. Maximum dimension: ${maxDim}px`,
        });
      } else {
        resolve({ valid: true, width: img.width, height: img.height });
      }
    };
    img.onerror = () => resolve({ valid: false, error: 'Could not load image' });
    img.src = URL.createObjectURL(file);
  });
};

// ============ HELPERS ============

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Generate thumbnail URL (if using image processing)
 */
export const getThumbnailUrl = (key, size = 200) => {
  // Note: This would require Lambda@Edge or CloudFront function
  // For now, return the original URL
  return getFileUrl(key);
};

