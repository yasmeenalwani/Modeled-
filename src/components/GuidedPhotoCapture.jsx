/**
 * GuidedPhotoCapture Component
 * 
 * A step-by-step guided photo capture flow that ensures models
 * upload high-quality photos for accurate AI analysis.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import PhotoQualityChecker, { PhotoQualityBadge } from './PhotoQualityChecker';
import {
  PHOTO_STEPS,
  getRequiredPhotoIds,
  getCompletionPercentage,
  getNextIncompleteStep,
  areAllPhotosComplete,
} from '../utils/photoRequirements';

export default function GuidedPhotoCapture({
  onComplete,
  onPhotoChange,
  initialPhotos = {},
  accentColor = '#8B1E3F',
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedPhotos, setCapturedPhotos] = useState(initialPhotos);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [qualityResult, setQualityResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const currentStep = PHOTO_STEPS[currentStepIndex];
  const requiredPhotoIds = getRequiredPhotoIds();
  const completionPercentage = getCompletionPercentage(capturedPhotos);
  const allComplete = areAllPhotosComplete(capturedPhotos);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPendingFile(file);
    setQualityResult(null);
  }, []);

  // Handle quality check result
  const handleQualityResult = useCallback((result) => {
    setQualityResult(result);
  }, []);

  // Accept photo and move to next
  const acceptPhoto = useCallback(() => {
    if (!pendingFile || !qualityResult?.isValid) return;

    const newPhotos = {
      ...capturedPhotos,
      [currentStep.id]: {
        file: pendingFile,
        url: previewUrl,
        quality: qualityResult,
        capturedAt: new Date().toISOString(),
        isValid: true,
      },
    };

    setCapturedPhotos(newPhotos);
    onPhotoChange?.(newPhotos);

    // Clear preview
    setPreviewUrl(null);
    setPendingFile(null);
    setQualityResult(null);

    // Move to next step or show review
    if (currentStepIndex < PHOTO_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setShowReview(true);
    }
  }, [pendingFile, qualityResult, capturedPhotos, currentStep, previewUrl, currentStepIndex, onPhotoChange]);

  // Retake current photo
  const retakePhoto = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setQualityResult(null);
  }, [previewUrl]);

  // Navigate to specific step
  const goToStep = useCallback((index) => {
    setCurrentStepIndex(index);
    setPreviewUrl(null);
    setPendingFile(null);
    setQualityResult(null);
    setShowReview(false);
  }, []);

  // Skip to review (only if all required photos captured)
  const goToReview = useCallback(() => {
    if (allComplete) {
      setShowReview(true);
    }
  }, [allComplete]);

  // Remove a captured photo
  const removePhoto = useCallback((stepId) => {
    const newPhotos = { ...capturedPhotos };
    if (newPhotos[stepId]?.url) {
      URL.revokeObjectURL(newPhotos[stepId].url);
    }
    delete newPhotos[stepId];
    setCapturedPhotos(newPhotos);
    onPhotoChange?.(newPhotos);
  }, [capturedPhotos, onPhotoChange]);

  // Submit all photos
  const handleSubmit = useCallback(async () => {
    if (!allComplete) return;

    setIsSubmitting(true);
    try {
      // Prepare photos for submission
      const photoData = Object.entries(capturedPhotos).map(([stepId, photo]) => ({
        stepId,
        file: photo.file,
        quality: photo.quality,
        capturedAt: photo.capturedAt,
      }));

      await onComplete?.(photoData);
    } finally {
      setIsSubmitting(false);
    }
  }, [allComplete, capturedPhotos, onComplete]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      Object.values(capturedPhotos).forEach(photo => {
        if (photo.url) {
          URL.revokeObjectURL(photo.url);
        }
      });
    };
  }, []);

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Progress Bar
    progressContainer: {
      marginBottom: '2rem',
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    progressText: {
      fontSize: '0.9rem',
      color: '#5A3A2A', // Muted brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    progressPercentage: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: accentColor,
      fontFamily: '"Alike", "Georgia", serif',
    },
    progressBar: {
      height: '8px',
      background: 'rgba(139, 30, 63, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: `linear-gradient(90deg, ${accentColor}, #A85A5A)`,
      borderRadius: '4px',
      transition: 'width 0.5s ease',
    },
    
    // Step Indicators
    stepIndicators: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    stepDot: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
    },
    stepDotActive: {
      background: accentColor,
      color: '#FFFEF9', // Ivory
      transform: 'scale(1.1)',
    },
    stepDotComplete: {
      background: 'rgba(76, 175, 80, 0.2)',
      border: '2px solid #4CAF50',
      color: '#4CAF50',
    },
    stepDotIncomplete: {
      background: 'rgba(139, 30, 63, 0.1)',
      color: '#5A3A2A', // Muted brown
    },
    
    // Current Step Card
    stepCard: {
      background: '#FFFEF9', // Ivory
      borderRadius: '16px',
      padding: '2rem',
      marginBottom: '1.5rem',
      border: '1px solid rgba(139, 30, 63, 0.15)',
      boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
    },
    stepHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '1rem',
    },
    stepIcon: {
      fontSize: '2.5rem',
    },
    stepTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#4A2A1A', // Dark brown
      margin: 0,
      fontFamily: '"Alike", "Georgia", serif',
    },
    stepSubtitle: {
      fontSize: '0.9rem',
      color: '#5A3A2A', // Muted brown
      marginTop: '0.25rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Instruction
    instruction: {
      background: `linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.1))`,
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '1.5rem',
      borderLeft: `4px solid ${accentColor}`,
    },
    instructionText: {
      fontSize: '1.1rem',
      fontWeight: 500,
      color: '#4A2A1A', // Dark brown
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    purposeText: {
      fontSize: '0.85rem',
      color: '#5A3A2A', // Muted brown
      fontStyle: 'italic',
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Tips
    tipsList: {
      listStyle: 'none',
      padding: 0,
      margin: '0 0 1.5rem 0',
    },
    tipItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '0.75rem 0',
      borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
      fontSize: '0.95rem',
      color: '#4A2A1A', // Dark brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    tipIcon: {
      color: '#4CAF50',
      fontSize: '1.1rem',
      flexShrink: 0,
    },
    
    // Examples
    examples: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    exampleBox: {
      padding: '1rem',
      borderRadius: '8px',
      fontSize: '0.85rem',
      color: '#4A2A1A', // Dark brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    goodExample: {
      background: 'rgba(76, 175, 80, 0.1)',
      border: '1px solid rgba(76, 175, 80, 0.3)',
    },
    badExample: {
      background: 'rgba(244, 67, 54, 0.1)',
      border: '1px solid rgba(244, 67, 54, 0.3)',
    },
    exampleLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontWeight: 600,
      marginBottom: '0.5rem',
    },
    
    // Upload Area
    uploadArea: {
      border: `2px dashed ${previewUrl ? 'transparent' : 'rgba(139, 30, 63, 0.3)'}`,
      borderRadius: '16px',
      padding: previewUrl ? '0' : '3rem 2rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: previewUrl ? 'transparent' : '#FFFEF9', // Ivory
      position: 'relative',
      overflow: 'hidden',
    },
    uploadIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.7,
    },
    uploadText: {
      fontSize: '1.1rem',
      color: '#4A2A1A', // Dark brown
      marginBottom: '0.5rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    uploadSubtext: {
      fontSize: '0.85rem',
      color: '#5A3A2A', // Muted brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    uploadButtons: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '1.5rem',
    },
    uploadButton: {
      padding: '0.75rem 1.5rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 500,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    primaryUploadButton: {
      background: accentColor,
      color: '#FFFEF9', // Ivory
      fontFamily: '"Alike", "Georgia", serif',
    },
    secondaryUploadButton: {
      background: 'rgba(139, 30, 63, 0.1)',
      color: '#4A2A1A', // Dark brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    
    // Preview
    previewContainer: {
      position: 'relative',
      marginBottom: '1rem',
    },
    previewImage: {
      width: '100%',
      maxHeight: '400px',
      objectFit: 'contain',
      borderRadius: '12px',
    },
    
    // Action Buttons
    actionButtons: {
      display: 'flex',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    button: {
      flex: 1,
      padding: '1rem',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 600,
      fontSize: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      transition: 'all 0.2s ease',
    },
    primaryButton: {
      background: accentColor,
      color: '#FFFEF9', // Ivory
      fontFamily: '"Alike", "Georgia", serif',
    },
    secondaryButton: {
      background: 'rgba(139, 30, 63, 0.1)',
      color: '#4A2A1A', // Dark brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    disabledButton: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    
    // Review Section
    reviewGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1rem',
      marginBottom: '2rem',
    },
    reviewCard: {
      background: '#FFFEF9', // Ivory
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid rgba(139, 30, 63, 0.15)',
    },
    reviewCardComplete: {
      borderColor: 'rgba(76, 175, 80, 0.5)',
    },
    reviewCardMissing: {
      borderColor: 'rgba(244, 67, 54, 0.5)',
      background: 'rgba(244, 67, 54, 0.05)',
    },
    reviewImage: {
      width: '100%',
      aspectRatio: '1',
      objectFit: 'cover',
    },
    reviewPlaceholder: {
      width: '100%',
      aspectRatio: '1',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      color: '#5A3A2A', // Muted brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    reviewLabel: {
      padding: '0.5rem',
      fontSize: '0.75rem',
      fontWeight: 500,
      textAlign: 'center',
      color: '#4A2A1A', // Dark brown
      fontFamily: '"Alike", "Georgia", serif',
    },
    reviewBadge: {
      position: 'absolute',
      top: '0.5rem',
      right: '0.5rem',
    },
    removeButton: {
      position: 'absolute',
      top: '0.5rem',
      left: '0.5rem',
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'rgba(244, 67, 54, 0.9)',
      color: '#FFFEF9', // Ivory
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      opacity: 0,
      transition: 'opacity 0.2s ease',
    },
    
    // Hidden inputs
    hiddenInput: {
      display: 'none',
    },
  };

  // Review Screen
  if (showReview) {
    return (
      <div style={styles.container}>
        <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
          Review Your Photos
        </h2>
        <p style={{ textAlign: 'center', color: '#5A3A2A', marginBottom: '2rem', fontFamily: '"Alike", "Georgia", serif' }}>
          Make sure all photos are clear and follow the guidelines. Click any photo to retake.
        </p>

        <div style={styles.reviewGrid}>
          {PHOTO_STEPS.map((step, index) => {
            const photo = capturedPhotos[step.id];
            const isComplete = photo?.isValid;

            return (
              <div
                key={step.id}
                style={{
                  ...styles.reviewCard,
                  ...(isComplete ? styles.reviewCardComplete : styles.reviewCardMissing),
                }}
                onClick={() => goToStep(index)}
                onMouseEnter={(e) => {
                  const removeBtn = e.currentTarget.querySelector('.remove-btn');
                  if (removeBtn) removeBtn.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  const removeBtn = e.currentTarget.querySelector('.remove-btn');
                  if (removeBtn) removeBtn.style.opacity = '0';
                }}
              >
                {isComplete ? (
                  <>
                    <img src={photo.url} alt={step.title} style={styles.reviewImage} />
                    <button
                      className="remove-btn"
                      style={styles.removeButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(step.id);
                      }}
                    >
                      ×
                    </button>
                    <div style={styles.reviewBadge}>
                      <PhotoQualityBadge qualityResult={photo.quality} size="small" />
                    </div>
                  </>
                ) : (
                  <div style={styles.reviewPlaceholder}>
                    <span style={{ fontSize: '2rem' }}>{step.icon}</span>
                    <span>Tap to add</span>
                  </div>
                )}
                <div style={styles.reviewLabel}>
                  {step.shortTitle}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.actionButtons}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => {
              const nextStep = getNextIncompleteStep(capturedPhotos);
              if (nextStep) {
                goToStep(PHOTO_STEPS.findIndex(s => s.id === nextStep.id));
              } else {
                goToStep(0);
              }
            }}
          >
            ← Back to Edit
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(allComplete && !isSubmitting ? {} : styles.disabledButton),
            }}
            disabled={!allComplete || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : allComplete ? (
              <>Submit Photos</>
            ) : (
              <>Complete All Photos</>
            )}
          </button>
        </div>

        {!allComplete && (
          <p style={{ textAlign: 'center', color: '#f44336', marginTop: '1rem', fontSize: '0.9rem', fontFamily: '"Alike", "Georgia", serif' }}>
            {requiredPhotoIds.length - requiredPhotoIds.filter((id) => capturedPhotos[id]?.isValid).length} required photos still needed
          </p>
        )}
      </div>
    );
  }

  // Capture Screen
  return (
    <div style={styles.container}>
      {/* Step Indicators */}
      <div style={styles.stepIndicators}>
        {PHOTO_STEPS.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isComplete = capturedPhotos[step.id]?.isValid;

          return (
            <div
              key={step.id}
              style={{
                ...styles.stepDot,
                ...(isActive ? styles.stepDotActive : 
                    isComplete ? styles.stepDotComplete : 
                    styles.stepDotIncomplete),
              }}
              onClick={() => goToStep(index)}
              title={step.title}
            >
              {isComplete ? '' : step.icon}
            </div>
          );
        })}
      </div>

      {/* Current Step Card */}
      <div style={styles.stepCard}>
        <div style={styles.stepHeader}>
          <span style={styles.stepIcon}>{currentStep.icon}</span>
          <div>
            <h3 style={styles.stepTitle}>{currentStep.title}</h3>
            <span style={styles.stepSubtitle}>
              {capturedPhotos[currentStep.id]?.isValid ? 'Captured' : 'Not yet captured'}
            </span>
          </div>
        </div>

        {/* Instruction */}
        <div style={styles.instruction}>
          <div style={styles.instructionText}>
            {currentStep.instruction}
          </div>
          <div style={styles.purposeText}>
            {currentStep.purpose}
          </div>
        </div>

        {/* Tips */}
        <ul style={styles.tipsList}>
          {currentStep.tips.map((tip, index) => (
            <li key={index} style={styles.tipItem}>
              <span style={styles.tipIcon}></span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>

        {/* Examples */}
        {currentStep.examples && (
          <div style={styles.examples}>
            <div style={{ ...styles.exampleBox, ...styles.goodExample }}>
              <div style={{ ...styles.exampleLabel, color: '#4CAF50', fontFamily: '"Alike", "Georgia", serif' }}>
                Good
              </div>
              <span style={{ fontFamily: '"Alike", "Georgia", serif', color: '#4A2A1A' }}>{currentStep.examples.good}</span>
            </div>
            <div style={{ ...styles.exampleBox, ...styles.badExample }}>
              <div style={{ ...styles.exampleLabel, color: '#f44336', fontFamily: '"Alike", "Georgia", serif' }}>
                Avoid
              </div>
              <span style={{ fontFamily: '"Alike", "Georgia", serif', color: '#4A2A1A' }}>{currentStep.examples.bad}</span>
            </div>
          </div>
        )}

        {/* Upload Area or Preview */}
        {previewUrl ? (
          <div style={styles.previewContainer}>
            <img src={previewUrl} alt="Preview" style={styles.previewImage} />
            
            {/* Quality Checker */}
            <PhotoQualityChecker
              imageUrl={previewUrl}
              imageFile={pendingFile}
              stepConfig={currentStep}
              onQualityResult={handleQualityResult}
              accentColor={accentColor}
              showTechnicalMetrics={false}
            />
            
            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={retakePhoto}
              >
                Retake
              </button>
              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                  ...(qualityResult?.isValid ? {} : styles.disabledButton),
                }}
                disabled={!qualityResult?.isValid}
                onClick={acceptPhoto}
              >
                {qualityResult?.isValid ? 'Accept & Continue' : 'Fix Issues First'}
              </button>
            </div>
          </div>
        ) : (
          <div 
            style={styles.uploadArea}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={styles.uploadIcon}></div>
            <div style={styles.uploadText}>
              Tap to capture or upload
            </div>
            <div style={styles.uploadSubtext}>
              JPG, PNG, or WebP • Max 10MB • Within last 3 weeks
            </div>
            
            <div style={styles.uploadButtons}>
              <button
                style={{ ...styles.uploadButton, ...styles.primaryUploadButton }}
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
              >
                Take Photo
              </button>
              <button
                style={{ ...styles.uploadButton, ...styles.secondaryUploadButton }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Upload File
              </button>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={styles.hiddenInput}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          onChange={handleFileSelect}
          style={styles.hiddenInput}
        />
      </div>

      {/* Navigation */}
      <div style={styles.actionButtons}>
        <button
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            ...(currentStepIndex === 0 ? styles.disabledButton : {}),
          }}
          disabled={currentStepIndex === 0}
          onClick={() => goToStep(currentStepIndex - 1)}
        >
          ← Previous
        </button>
        
        {capturedPhotos[currentStep.id]?.isValid && (
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => {
              if (currentStepIndex < PHOTO_STEPS.length - 1) {
                goToStep(currentStepIndex + 1);
              } else {
                setShowReview(true);
              }
            }}
          >
            Skip to {currentStepIndex < PHOTO_STEPS.length - 1 ? 'Next' : 'Review'} →
          </button>
        )}
        
        {allComplete && (
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={goToReview}
          >
            Review All Photos →
          </button>
        )}
      </div>

      {/* Quick tip */}
      <p style={{ 
        textAlign: 'center', 
        color: '#5A3A2A', // Muted brown
        marginTop: '1.5rem',
        fontSize: '0.85rem',
        fontFamily: '"Alike", "Georgia", serif',
      }}>
        Better photos = better matches! Take your time to get clear, well-lit shots.
      </p>
    </div>
  );
}

