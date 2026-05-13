/**
 * EXIF Orientation handling for photo upload/analysis.
 * Ensures images are correctly oriented before dimension and quality checks.
 * Uses createImageBitmap with imageOrientation: 'from-image' to respect EXIF.
 * Critical for mobile: photos often have orientation metadata (e.g. 6 = rotate 90° CW).
 */

/**
 * Load image with EXIF orientation applied.
 * Returns a canvas with correctly oriented pixels and dimensions.
 * @param {File|Blob|string} source - File, Blob, or URL
 * @returns {Promise<{ canvas: HTMLCanvasElement; width: number; height: number }>}
 */
export async function loadImageWithCorrectOrientation(source) {
  let blob;
  if (typeof source === 'string') {
    const resp = await fetch(source);
    blob = await resp.blob();
  } else {
    blob = source;
  }

  // createImageBitmap with imageOrientation respects EXIF (Chrome 112+, Safari 16+, Firefox 111+)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      return {
        canvas,
        width: canvas.width,
        height: canvas.height,
      };
    } catch (e) {
      console.warn('createImageBitmap failed, falling back to Image:', e);
    }
  }

  // Fallback: load via Image (may not respect EXIF on some browsers)
  return loadImageFallback(blob);
}

/**
 * Fallback when createImageBitmap unavailable or fails
 */
function loadImageFallback(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve({
        canvas,
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
