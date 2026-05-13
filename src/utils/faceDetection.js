/**
 * Client-side face detection using MediaPipe Face Detector (BlazeFace short-range).
 * Lazy-loads the model on first use. Used for front_face and side_profile photo validation.
 */

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const DETECTION_TIMEOUT_MS = 5000;

let faceDetectorPromise = null;

/**
 * Get or create the FaceDetector instance (lazy load, cached).
 * @returns {Promise<import('@mediapipe/tasks-vision').FaceDetector>}
 */
async function getFaceDetector() {
  if (faceDetectorPromise) return faceDetectorPromise;
  faceDetectorPromise = (async () => {
    const { FilesetResolver, FaceDetector } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
    return FaceDetector.createFromModelPath(vision, MODEL_URL);
  })();
  return faceDetectorPromise;
}

/**
 * Run face detection with a timeout.
 * @param {HTMLImageElement|HTMLCanvasElement} image - Image or canvas to analyze
 * @returns {Promise<{ detected: boolean; confidence: number; size: number; position: { x: number; y: number } }>}
 */
export async function detectFaces(image) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Face detection timed out')), DETECTION_TIMEOUT_MS);
  });

  const runDetection = async () => {
    const detector = await getFaceDetector();
    const result = detector.detect(image);
    const detections = result?.detections ?? [];

    if (detections.length === 0) {
      return {
        detected: false,
        confidence: 0,
        size: 0,
        position: { x: 0.5, y: 0.5 },
      };
    }

    // Use largest face (by bounding box area) - use natural dimensions for correct scale
    const imgWidth = image.naturalWidth || image.width || 1;
    const imgHeight = image.naturalHeight || image.height || 1;
    const imgArea = imgWidth * imgHeight;

    let best = null;
    let bestArea = 0;

    for (const d of detections) {
      const box = d.boundingBox;
      if (!box) continue;
      const area = box.width * box.height;
      if (area > bestArea) {
        bestArea = area;
        best = d;
      }
    }

    if (!best?.boundingBox) {
      return {
        detected: true,
        confidence: 0.9,
        size: 0.2,
        position: { x: 0.5, y: 0.5 },
      };
    }

    const box = best.boundingBox;
    const faceArea = box.width * box.height;
    const size = Math.min(1, faceArea / imgArea);
    const centerX = box.originX + box.width / 2;
    const centerY = box.originY + box.height / 2;
    const position = {
      x: centerX / imgWidth,
      y: centerY / imgHeight,
    };
    const confidence = best.categories?.[0]?.score ?? 0.9;

    return {
      detected: true,
      confidence,
      size,
      position,
    };
  };

  return Promise.race([runDetection(), timeoutPromise]);
}

/**
 * Check if face detection is available (model can be loaded).
 * Useful for graceful degradation.
 */
export async function isFaceDetectionAvailable() {
  try {
    await getFaceDetector();
    return true;
  } catch {
    return false;
  }
}
