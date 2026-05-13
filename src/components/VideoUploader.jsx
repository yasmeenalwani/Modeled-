import React, { useState, useCallback, useRef } from 'react';
import { 
  uploadFile, 
  deleteFile, 
  validateFile, 
  formatFileSize,
  STORAGE_CONFIG 
} from '../utils/storage';
import { checkContentLimit, getStorageLimits } from '../utils/storageLimits';

// ============ STYLES ============
const styles = {
  container: {
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  
  // Warning banner
  warningBanner: {
    padding: '1rem 1.25rem',
    background: 'rgba(210,153,34,0.1)',
    border: '1px solid rgba(210,153,34,0.3)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  warningIcon: {
    fontSize: '1.5rem',
  },
  warningText: {
    flex: 1,
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.8)',
  },
  warningTitle: {
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#d29922',
  },
  
  // Drop zone
  dropZone: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '2.5rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'rgba(255,255,255,0.02)',
  },
  dropZoneActive: {
    borderColor: '#a371f7',
    background: 'rgba(163,113,247,0.1)',
  },
  dropIcon: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
  },
  dropTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  dropSubtitle: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '1rem',
  },
  dropButton: {
    padding: '0.75rem 2rem',
    background: 'linear-gradient(135deg, #a371f7, #8957e5)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropSpecs: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.4)',
  },
  spec: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  
  // Video preview
  previewContainer: {
    marginTop: '1.5rem',
  },
  videoCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  videoWrapper: {
    position: 'relative',
    background: '#000',
  },
  video: {
    width: '100%',
    maxHeight: '300px',
    display: 'block',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoInfo: {
    padding: '1rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  videoMeta: {},
  videoName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  videoDetails: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  videoActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
  },
  
  // Progress
  progressContainer: {
    padding: '1rem',
    background: 'rgba(163,113,247,0.1)',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
  },
  progressBar: {
    height: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #a371f7, #8957e5)',
    borderRadius: '4px',
    transition: 'width 0.2s ease',
  },
  
  // Error
  errorMessage: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '8px',
    color: '#f85149',
    fontSize: '0.85rem',
  },
};

/**
 * VideoUploader Component
 * 
 * Video upload with strict limitations:
 * - 30 seconds max duration
 * - 50MB max file size
 * - MP4, MOV, WebM formats
 * 
 * @param {function} onUpload - Called with uploaded video result
 * @param {function} pathGenerator - Function to generate S3 path
 * @param {object} existingVideo - Existing video data { url, key, duration }
 * @param {function} onDelete - Called when video is deleted
 */
export default function VideoUploader({
  onUpload,
  pathGenerator,
  existingVideo = null,
  onDelete,
  title = 'Upload Video Reel',
  subtitle = '30-second intro video (optional)',
  userType = null, // 'model', 'professional', 'partner'
  contentType = 'profileVideos', // 'profileVideos', 'inspirationVideos', 'portfolioVideos'
  isInspiration = false, // Whether this is for inspiration board
  maxVideos = 1, // Maximum videos allowed
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [upload, setUpload] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  const config = isInspiration ? STORAGE_CONFIG.inspirationVideo : STORAGE_CONFIG.video;
  const limits = userType ? getStorageLimits(userType) : null;
  const currentCount = (existingVideo ? 1 : 0) + (upload?.status === 'complete' ? 1 : 0);
  const limitCheck = userType && contentType ? checkContentLimit(userType, contentType, currentCount) : { valid: true };
  const remaining = userType && contentType && limitCheck.valid ? limitCheck.remaining : (maxVideos - currentCount);

  // Validate video duration
  const validateDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        if (video.duration > config.maxDurationSeconds) {
          resolve({
            valid: false,
            error: `Video too long. Maximum: ${config.maxDurationSeconds} seconds, yours: ${Math.round(video.duration)} seconds`,
          });
        } else {
          resolve({ valid: true, duration: video.duration });
        }
      };
      video.onerror = () => {
        resolve({ valid: false, error: 'Could not read video file' });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  // Process file
  const processFile = async (file) => {
    setError(null);

    // Check storage limits if configured
    if (userType && contentType) {
      const newTotal = currentCount + 1;
      const limitCheck = checkContentLimit(userType, contentType, newTotal);
      if (!limitCheck.valid && limitCheck.max !== undefined) {
        setError(limitCheck.error);
        return;
      }
    }

    // Check max videos (fallback to component prop)
    if (currentCount >= maxVideos) {
      setError(`Maximum ${maxVideos} video${maxVideos > 1 ? 's' : ''} allowed.`);
      return;
    }

    // Basic validation
    const basicValidation = validateFile(file, isInspiration ? 'inspirationVideo' : 'video');
    if (!basicValidation.valid) {
      setError(basicValidation.error);
      return;
    }

    // Duration validation
    const durationValidation = await validateDuration(file);
    if (!durationValidation.valid) {
      setError(durationValidation.error);
      return;
    }

    // Prepare upload
    const newUpload = {
      id: Date.now(),
      file,
      progress: 0,
      status: 'pending',
      url: URL.createObjectURL(file),
      key: null,
      duration: durationValidation.duration,
    };

    setUpload(newUpload);

    // Start upload
    try {
      setUpload(prev => ({ ...prev, status: 'uploading' }));

      const path = pathGenerator(file.name);
      const result = await uploadFile(file, path, (progress) => {
        setUpload(prev => ({ ...prev, progress }));
      });

      setUpload(prev => ({
        ...prev,
        status: 'complete',
        key: result.key,
        url: result.url,
      }));

      if (onUpload) {
        onUpload({
          ...result,
          duration: durationValidation.duration,
        });
      }
    } catch (err) {
      setUpload(prev => ({ ...prev, status: 'error' }));
      setError(`Failed to upload video: ${err.message}`);
    }
  };

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file);
  }, [pathGenerator]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDelete = async () => {
    if (upload?.key) {
      try {
        await deleteFile(upload.key);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
    setUpload(null);
    if (onDelete) onDelete();
  };

  const handleExistingDelete = async () => {
    if (existingVideo?.key) {
      try {
        await deleteFile(existingVideo.key);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
    if (onDelete) onDelete();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show existing video
  if (existingVideo && !upload) {
    return (
      <div style={styles.container}>
        <div style={styles.videoCard}>
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              src={existingVideo.url}
              style={styles.video}
              controls
            />
          </div>
          <div style={styles.videoInfo}>
            <div style={styles.videoMeta}>
              <div style={styles.videoName}>Video Reel</div>
              <div style={styles.videoDetails}>
                {existingVideo.duration ? formatDuration(existingVideo.duration) : 'Video'} • Uploaded
              </div>
            </div>
            <div style={styles.videoActions}>
              <button
                style={{ ...styles.actionBtn, background: 'rgba(248,81,73,0.2)', color: '#f85149' }}
                onClick={handleExistingDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show uploaded video
  if (upload && upload.status === 'complete') {
    return (
      <div style={styles.container}>
        <div style={styles.videoCard}>
          <div style={styles.videoWrapper}>
            <video
              ref={videoRef}
              src={upload.url}
              style={styles.video}
              controls
            />
          </div>
          <div style={styles.videoInfo}>
            <div style={styles.videoMeta}>
              <div style={styles.videoName}>{upload.file.name}</div>
              <div style={styles.videoDetails}>
                {formatDuration(upload.duration)} • {formatFileSize(upload.file.size)}
              </div>
            </div>
            <div style={styles.videoActions}>
              <button
                style={{ ...styles.actionBtn, background: 'rgba(248,81,73,0.2)', color: '#f85149' }}
                onClick={handleDelete}
              >
                Delete
              </button>
              <button
                style={{ ...styles.actionBtn, background: '#3fb950', color: '#fff' }}
              >
                ✓ Uploaded
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const compactDropZone = compact ? { padding: '1.5rem', borderRadius: '12px' } : {};
  const compactIcon = compact ? { fontSize: '2.5rem', marginBottom: '0.5rem' } : {};
  const compactTitle = compact ? { fontSize: '0.95rem' } : {};
  const compactSubtitle = compact ? { fontSize: '0.75rem', marginBottom: '0.5rem' } : {};
  const compactButton = compact ? { padding: '0.55rem 1.2rem', fontSize: '0.8rem' } : {};
  const compactSpecs = compact ? { display: 'none' } : {};
  const compactWarning = compact ? { padding: '0.75rem 1rem', marginBottom: '1rem' } : {};

  return (
    <div style={styles.container}>
      {/* Storage Limit Info */}
      {userType && contentType && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.75rem 1rem',
          background: remaining > 0 ? 'rgba(76,175,80,0.1)' : 'rgba(248,81,73,0.1)',
          border: `1px solid ${remaining > 0 ? 'rgba(76,175,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: remaining > 0 ? '#4caf50' : '#f85149',
        }}>
          {remaining > 0 ? (
            `You can upload ${remaining} more ${contentType.replace(/([A-Z])/g, ' $1').toLowerCase()}`
          ) : (
            `Maximum ${limitCheck.max || maxVideos} ${contentType.replace(/([A-Z])/g, ' $1').toLowerCase()} reached`
          )}
        </div>
      )}

      {/* Warning Banner */}
      <div style={{ ...styles.warningBanner, ...compactWarning }}>
        <div style={styles.warningIcon}></div>
        <div style={styles.warningText}>
          <div style={styles.warningTitle}>Video Reel (Optional)</div>
          Keep it short & sweet! {config.maxDurationSeconds}-second max intro video helps you stand out.
        </div>
      </div>

      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...compactDropZone,
          ...(isDragging ? styles.dropZoneActive : {}),
          ...(remaining <= 0 ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => remaining > 0 && document.getElementById('video-input').click()}
      >
        <div style={{ ...styles.dropIcon, ...compactIcon }}></div>
        <div style={{ ...styles.dropTitle, ...compactTitle }}>{title}</div>
        <div style={{ ...styles.dropSubtitle, ...compactSubtitle }}>{subtitle}</div>
        <button
          style={{
            ...styles.dropButton,
            ...compactButton,
            opacity: remaining <= 0 ? 0.5 : 1,
            cursor: remaining <= 0 ? 'not-allowed' : 'pointer',
          }}
          disabled={remaining <= 0}
          onClick={(e) => {
            e.stopPropagation();
            if (remaining > 0) {
              document.getElementById('video-input').click();
            }
          }}
        >
          Select Video
        </button>
        <div style={{ ...styles.dropSpecs, ...compactSpecs }}>
          <div style={styles.spec}>Max {config.maxDurationSeconds}s</div>
          <div style={styles.spec}>Max {config.maxSizeMB}MB</div>
          <div style={styles.spec}>MP4, MOV, WebM</div>
        </div>
        <input
          id="video-input"
          type="file"
          accept={config.acceptedTypes.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Upload Progress */}
      {upload && upload.status === 'uploading' && (
        <div style={styles.progressContainer}>
          <div style={styles.progressHeader}>
            <span>Uploading {upload.file.name}...</span>
            <span>{upload.progress}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${upload.progress}%` }} />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
}

