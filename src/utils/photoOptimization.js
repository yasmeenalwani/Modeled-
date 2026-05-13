/**
 * Photo Optimization Utilities
 * 
 * Client-side photo resizing and compression before upload
 * to reduce storage costs and improve upload speed.
 */

/**
 * Resize and compress a photo
 * @param {File} file - Original photo file
 * @param {Object} options - Optimization options
 * @returns {Promise<File>} - Optimized photo file
 */
export async function optimizePhoto(file, options = {}) {
  const {
    maxDimension = 2048,
    maxSizeMB = 2,
    quality = 0.85,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob with quality compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // Check if we need further compression
            const sizeMB = blob.size / (1024 * 1024);
            if (sizeMB > maxSizeMB) {
              // Try lower quality
              const lowerQuality = Math.max(0.5, quality - 0.1);
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Failed to compress image'));
                    return;
                  }
                  const file = new File([compressedBlob], file.name, {
                    type: mimeType,
                    lastModified: Date.now(),
                  });
                  resolve(file);
                },
                mimeType,
                lowerQuality
              );
            } else {
              const optimizedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            }
          },
          mimeType,
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Generate thumbnail from photo
 * @param {File} file - Original photo file
 * @param {number} size - Thumbnail size (default 300px)
 * @returns {Promise<File>} - Thumbnail file
 */
export async function generateThumbnail(file, size = 300) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      try {
        // Calculate thumbnail dimensions (square)
        let width = img.width;
        let height = img.height;

        // Crop to square if needed
        const minDim = Math.min(width, height);
        const cropX = (width - minDim) / 2;
        const cropY = (height - minDim) / 2;

        canvas.width = size;
        canvas.height = size;

        // Draw cropped and resized image
        ctx.drawImage(
          img,
          cropX, cropY, minDim, minDim,
          0, 0, size, size
        );

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to generate thumbnail'));
              return;
            }
            const thumbnailFile = new File([blob], `thumb_${file.name}`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(thumbnailFile);
          },
          'image/jpeg',
          0.75 // 75% quality for thumbnails
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimize multiple photos
 * @param {File[]} files - Array of photo files
 * @param {Object} options - Optimization options
 * @param {Function} onProgress - Progress callback (index, total)
 * @returns {Promise<File[]>} - Array of optimized photo files
 */
export async function optimizePhotos(files, options = {}, onProgress = null) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const optimized = await optimizePhoto(files[i], options);
      results.push(optimized);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to optimize ${files[i].name}:`, error);
      // Fallback to original file if optimization fails
      results.push(files[i]);
    }
  }
  
  return results;
}

