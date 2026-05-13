/**
 * PhotoQualityChecker Component
 * 
 * Provides real-time feedback on photo quality during capture.
 * Checks brightness, blur, face detection, and positioning.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  PHOTO_TECHNICAL_REQUIREMENTS,
  QUALITY_MESSAGES,
  validateImageFile,
  validateImageDimensions,
  checkPhotoQuality,
} from '../utils/photoRequirements';
import { detectFaces } from '../utils/faceDetection';
import { loadImageWithCorrectOrientation } from '../utils/exifOrientation';

export default function PhotoQualityChecker({
  imageFile,
  imageUrl,
  stepConfig,
  onQualityResult,
  showDetails = true,
  showTechnicalMetrics = true, // Brightness, Sharpness, Face detected - admin only
  accentColor = '#8B1E3F',
}) {
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [qualityResult, setQualityResult] = useState(null);
  const [faceResult, setFaceResult] = useState(null);

  // Analyze image when file or URL changes
  useEffect(() => {
    if (imageFile || imageUrl) {
      analyzeImage();
    } else {
      setQualityResult(null);
      setFaceResult(null);
    }
  }, [imageFile, imageUrl]);

  const analyzeImage = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      // If file, validate first
      if (imageFile) {
        const fileValidation = validateImageFile(imageFile);
        if (!fileValidation.isValid) {
          setQualityResult({
            isValid: false,
            errors: fileValidation.errors,
            warnings: [],
            score: 0,
          });
          setIsAnalyzing(false);
          onQualityResult?.({
            isValid: false,
            errors: fileValidation.errors,
          });
          return;
        }
      }

      // Load image with EXIF orientation applied (critical for mobile)
      const { canvas: orientedCanvas, width, height } = await loadImageWithCorrectOrientation(
        imageUrl || imageFile
      );

      // Check dimensions (using correctly oriented dimensions)
      const dimValidation = validateImageDimensions(width, height);

      // Draw oriented image to canvas for pixel analysis (scaled down)
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const maxSize = 500;
      const scale = Math.min(maxSize / width, maxSize / height, 1);
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.drawImage(orientedCanvas, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Run quality checks
      const quality = checkPhotoQuality(
        imageData, 
        canvas.width, 
        canvas.height,
        { stepConfig }
      );

      // If dimensions were below our recommended minimum, treat as a warning
      if (dimValidation.error) {
        quality.warnings.push(dimValidation.error);
      }

      // Add step-specific checks (MediaPipe face detection) - use oriented canvas
      if (stepConfig?.requirements?.faceRequired) {
        let hasFace;
        try {
          hasFace = await detectFaces(orientedCanvas);
        } catch (err) {
          console.warn('Face detection unavailable:', err);
          // Fallback: allow with warning - backend Rekognition remains final gate
          hasFace = { detected: true, confidence: 0, size: 0.25, position: { x: 0.5, y: 0.5 } };
          quality.warnings.push({
            icon: '⚠️',
            message: 'Face detection unavailable — your photo will be checked after upload.',
            type: 'warning',
          });
        }

        if (!hasFace.detected) {
          quality.errors.push(QUALITY_MESSAGES.noFace);
          quality.isValid = false;
          quality.score -= 40;
        } else {
          setFaceResult(hasFace);

          // Check face size
          // If face is slightly small, treat as a warning so user can continue.
          // Only treat as a hard error when it's extremely small.
          const minFaceSize = PHOTO_TECHNICAL_REQUIREMENTS.face.minFaceSize || 0.1;
          const hardFailThreshold = minFaceSize * 0.5; // e.g. 5% of image when minFaceSize is 10%

          if (hasFace.size < hardFailThreshold) {
            quality.errors.push(QUALITY_MESSAGES.faceTooSmall);
            quality.isValid = false;
          } else if (hasFace.size < minFaceSize) {
            quality.warnings.push(QUALITY_MESSAGES.faceTooSmall);
          } else if (hasFace.size > PHOTO_TECHNICAL_REQUIREMENTS.face.maxFaceSize) {
            quality.errors.push(QUALITY_MESSAGES.faceTooLarge);
            quality.isValid = false;
          }
        }
      }

      setQualityResult(quality);
      onQualityResult?.(quality);
    } catch (error) {
      console.error('Error analyzing image:', error);
      setQualityResult({
        isValid: false,
        errors: [{ icon: '❌', message: 'Error analyzing image', type: 'error' }],
        warnings: [],
        score: 0,
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, imageUrl, stepConfig, onQualityResult]);

  const styles = {
    container: {
      padding: '1rem',
      borderRadius: '12px',
      background: qualityResult?.isValid 
        ? 'rgba(76, 175, 80, 0.1)' 
        : qualityResult?.errors?.length 
          ? 'rgba(244, 67, 54, 0.1)'
          : 'rgba(255, 255, 255, 0.05)',
      border: `1px solid ${
        qualityResult?.isValid 
          ? 'rgba(76, 175, 80, 0.3)' 
          : qualityResult?.errors?.length 
            ? 'rgba(244, 67, 54, 0.3)'
            : 'rgba(255, 255, 255, 0.1)'
      }`,
      transition: 'all 0.3s ease',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: showDetails ? '0.75rem' : 0,
    },
    status: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1rem',
      fontWeight: 500,
    },
    statusIcon: {
      fontSize: '1.25rem',
    },
    score: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    scoreBar: {
      width: '60px',
      height: '6px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '3px',
      overflow: 'hidden',
    },
    scoreFill: {
      height: '100%',
      background: qualityResult?.score >= 80 
        ? '#4CAF50' 
        : qualityResult?.score >= 50 
          ? '#FFC107' 
          : '#f44336',
      transition: 'width 0.5s ease',
    },
    scoreText: {
      fontSize: '0.85rem',
      fontWeight: 600,
      color: qualityResult?.score >= 80 
        ? '#4CAF50' 
        : qualityResult?.score >= 50 
          ? '#FFC107' 
          : '#f44336',
    },
    messageList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    message: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
      fontSize: '0.9rem',
    },
    errorMessage: {
      background: 'rgba(244, 67, 54, 0.1)',
      color: '#f44336',
    },
    warningMessage: {
      background: 'rgba(255, 193, 7, 0.1)',
      color: '#FFC107',
    },
    successMessage: {
      background: 'rgba(76, 175, 80, 0.1)',
      color: '#4CAF50',
    },
    analyzing: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.1)',
      borderTop: `2px solid ${accentColor}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    canvas: {
      display: 'none',
    },
    details: {
      marginTop: '0.75rem',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      fontSize: '0.8rem',
      opacity: 0.7,
    },
    detailRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.25rem 0',
    },
  };

  // Inject keyframes for spinner
  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  if (!imageFile && !imageUrl) {
    return null;
  }

  if (isAnalyzing) {
    return (
      <div style={styles.container}>
        <div style={styles.analyzing}>
          <div style={styles.spinner} />
          <span>Analyzing photo quality...</span>
        </div>
        <canvas ref={canvasRef} style={styles.canvas} />
      </div>
    );
  }

  if (!qualityResult) {
    return (
      <canvas ref={canvasRef} style={styles.canvas} />
    );
  }

  const getStatusMessage = () => {
    if (qualityResult.isValid) {
      return qualityResult.warnings.length > 0 
        ? { icon: '', text: 'Good - minor improvements possible', color: '#FFC107' }
        : { icon: '', text: 'Perfect quality!', color: '#4CAF50' };
    }
    return { icon: '', text: 'Needs improvement', color: '#f44336' };
  };

  const status = getStatusMessage();

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />
      
      <div style={styles.header}>
        <div style={styles.status}>
          <span style={{ color: status.color }}>{status.text}</span>
        </div>
        
        {showTechnicalMetrics && qualityResult.score !== undefined && (
          <div style={styles.score}>
            <div style={styles.scoreBar}>
              <div 
                style={{ 
                  ...styles.scoreFill, 
                  width: `${qualityResult.score}%` 
                }} 
              />
            </div>
            <span style={styles.scoreText}>{qualityResult.score}%</span>
          </div>
        )}
      </div>

      {showDetails && (qualityResult.errors.length > 0 || qualityResult.warnings.length > 0) && (
        <div style={styles.messageList}>
          {qualityResult.errors.map((error, index) => (
            <div key={`error-${index}`} style={{ ...styles.message, ...styles.errorMessage }}>
              <span>{error.message}</span>
            </div>
          ))}
          
          {qualityResult.warnings.map((warning, index) => (
            <div key={`warning-${index}`} style={{ ...styles.message, ...styles.warningMessage }}>
              <span>{warning.message}</span>
            </div>
          ))}
        </div>
      )}

      {showDetails && showTechnicalMetrics && qualityResult.isValid && qualityResult.checks && (
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <span>Brightness:</span>
            <span>{Math.round(qualityResult.checks.brightness)}/255</span>
          </div>
          <div style={styles.detailRow}>
            <span>Sharpness:</span>
            <span>{Math.round(qualityResult.checks.blur)}</span>
          </div>
          {faceResult && (
            <div style={styles.detailRow}>
              <span>Face detected:</span>
              <span>
                {faceResult.confidence > 0
                  ? `${(faceResult.confidence * 100).toFixed(1)}% confidence`
                  : 'N/A (check on upload)'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ COMPACT VERSION ============

export function PhotoQualityBadge({ qualityResult, size = 'medium' }) {
  if (!qualityResult) return null;

  const sizes = {
    small: { padding: '0.25rem 0.5rem', fontSize: '0.75rem' },
    medium: { padding: '0.5rem 0.75rem', fontSize: '0.85rem' },
    large: { padding: '0.75rem 1rem', fontSize: '1rem' },
  };

  const getStatus = () => {
    if (qualityResult.isValid) {
      return { icon: '', text: 'Good', bg: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50' };
    }
    if (qualityResult.errors?.length > 0) {
      return { icon: '', text: 'Fix issues', bg: 'rgba(244, 67, 54, 0.2)', color: '#f44336' };
    }
    return { icon: '', text: 'Warnings', bg: 'rgba(255, 193, 7, 0.2)', color: '#FFC107' };
  };

  const status = getStatus();

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      background: status.bg,
      color: status.color,
      borderRadius: '20px',
      fontWeight: 500,
      ...sizes[size],
    }}>
      <span>{status.text}</span>
    </div>
  );
}

