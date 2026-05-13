import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  uploadFile, 
  deleteFile, 
  validateFile, 
  formatFileSize,
  STORAGE_CONFIG 
} from '../utils/storage';
import { optimizePhoto, generateThumbnail } from '../utils/photoOptimization';
import { checkContentLimit, getStorageLimits } from '../utils/storageLimits';

// ============ STYLES ============
const styles = {
  container: {
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  
  // Drop zone
  dropZone: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '16px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'rgba(255,255,255,0.02)',
  },
  dropZoneActive: {
    borderColor: '#58a6ff',
    background: 'rgba(88,166,255,0.1)',
  },
  dropZoneError: {
    borderColor: '#f85149',
    background: 'rgba(248,81,73,0.1)',
  },
  dropIcon: {
    fontSize: '3rem',
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
    padding: '0.6rem 1.5rem',
    background: 'linear-gradient(135deg, #58a6ff, #1f6feb)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  dropHint: {
    marginTop: '1rem',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Preview grid
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  previewItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.05)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  previewDelete: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#f85149',
    border: 'none',
    color: '#fff',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'rgba(0,0,0,0.5)',
  },
  previewProgressBar: {
    height: '100%',
    background: '#58a6ff',
    transition: 'width 0.2s ease',
  },
  previewStatus: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
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
 * PhotoUploader Component
 * 
 * Reusable photo upload component with:
 * - Drag & drop support
 * - Multiple file upload
 * - Progress tracking
 * - Preview grid
 * - Delete functionality
 * 
 * @param {function} onUpload - Called with array of uploaded file results
 * @param {function} pathGenerator - Function to generate S3 path from filename
 * @param {number} maxFiles - Maximum number of files allowed
 * @param {string} accentColor - Primary color for the component
 * @param {array} existingPhotos - Array of existing photo URLs
 * @param {function} onDelete - Called when a photo is deleted
 */
export default function PhotoUploader({
  onUpload,
  pathGenerator,
  maxFiles = 10,
  accentColor = '#58a6ff',
  existingPhotos = [],
  onDelete,
  title = 'Upload Photos',
  subtitle = 'Drag & drop or click to select',
  userType = null, // 'model', 'professional', 'partner'
  contentType = 'profilePhotos', // 'profilePhotos', 'inspirationPhotos', 'portfolioPhotos', etc.
  isInspiration = false, // Whether this is for inspiration board
  compact = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]); // { file, progress, status, url, key }
  const [error, setError] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const fileInputRef = useRef(null);
  
  // Debug: Log existingPhotos prop changes
  useEffect(() => {
    console.log('PhotoUploader: existingPhotos prop changed:', {
      count: existingPhotos.length,
      photos: existingPhotos.map((p, i) => ({ index: i, url: p.url || p, type: typeof p }))
    });
  }, [existingPhotos]);

  // Handle drag events
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Get storage limits if userType is provided
  const limits = userType ? getStorageLimits(userType) : null;
  const currentCount = existingPhotos.length + uploads.filter(u => u.status === 'complete').length;
  const limitCheck = userType && contentType ? checkContentLimit(userType, contentType, currentCount) : { valid: true };

  // Process files
  const processFiles = async (files) => {
    setError(null);
    const fileArray = Array.from(files);
    
    // Check storage limits if configured
    if (userType && contentType) {
      const newTotal = currentCount + fileArray.length;
      const limitCheck = checkContentLimit(userType, contentType, newTotal);
      if (!limitCheck.valid && limitCheck.max !== undefined) {
        setError(limitCheck.error);
        return;
      }
    }
    
    // Check max files (fallback to component prop)
    const totalFiles = existingPhotos.length + uploads.length + fileArray.length;
    if (totalFiles > maxFiles) {
      setError(`Maximum ${maxFiles} photos allowed. You have ${existingPhotos.length + uploads.length} already.`);
      return;
    }

    // Optimize photos before upload
    setIsOptimizing(true);
    const config = isInspiration ? STORAGE_CONFIG.inspirationPhoto : STORAGE_CONFIG.photo;
    
    const optimizedFiles = [];
    for (const file of fileArray) {
      try {
        // Validate first
        const validation = validateFile(file, isInspiration ? 'inspirationPhoto' : 'photo');
        if (!validation.valid) {
          setError(validation.error);
          continue;
        }

        // Optimize photo
        const optimized = await optimizePhoto(file, {
          maxDimension: config.maxDimension,
          maxSizeMB: config.maxSizeMB,
          quality: config.quality || 0.85,
        });
        optimizedFiles.push(optimized);
      } catch (err) {
        console.error('Optimization error:', err);
        // Fallback to original file
        optimizedFiles.push(file);
      }
    }
    
    setIsOptimizing(false);
    if (optimizedFiles.length === 0) return;

    // Prepare uploads
    const newUploads = [];
    for (const file of optimizedFiles) {
      newUploads.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'pending', // pending, uploading, complete, error
        url: URL.createObjectURL(file),
        key: null,
      });
    }

    // Add to state
    setUploads(prev => [...prev, ...newUploads]);

    // Upload each file
    const results = [];
    for (const upload of newUploads) {
      try {
        // Update status to uploading
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'uploading' } : u
        ));

        // Generate path and upload
        const path = pathGenerator(upload.file.name);
        const result = await uploadFile(upload.file, path, (progress) => {
          setUploads(prev => prev.map(u => 
            u.id === upload.id ? { ...u, progress } : u
          ));
        });

        // Update with result
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'complete', key: result.key, url: result.url } : u
        ));

        results.push(result);
      } catch (err) {
        setUploads(prev => prev.map(u => 
          u.id === upload.id ? { ...u, status: 'error' } : u
        ));
        const message = err?.message || 'Unknown upload error';
        setError(`Failed to upload ${upload.file.name}: ${message}`);
      }
    }

    // Callback with results
    if (onUpload && results.length > 0) {
      onUpload(results);
    }
  };

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [pathGenerator, maxFiles, existingPhotos.length, uploads.length]);

  // Handle file input change
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle delete
  const handleDelete = async (upload) => {
    if (upload.key) {
      try {
        await deleteFile(upload.key);
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
    setUploads(prev => prev.filter(u => u.id !== upload.id));
    if (onDelete) {
      onDelete(upload);
    }
  };

  // Handle existing photo delete
  const handleExistingDelete = (photo) => {
    if (onDelete) {
      onDelete(photo);
    }
  };

  const config = isInspiration ? STORAGE_CONFIG.inspirationPhoto : STORAGE_CONFIG.photo;
  const remaining = userType && contentType && limitCheck.valid ? limitCheck.remaining : (maxFiles - currentCount);

  const compactDropZone = compact
    ? {
        padding: '1.25rem',
        borderRadius: '12px',
      }
    : {};
  const compactIcon = compact ? { fontSize: '2rem', marginBottom: '0.5rem' } : {};
  const compactTitle = compact ? { fontSize: '0.95rem' } : {};
  const compactSubtitle = compact ? { fontSize: '0.75rem', marginBottom: '0.5rem' } : {};
  const compactButton = compact ? { padding: '0.45rem 1rem', fontSize: '0.8rem' } : {};
  const compactHint = compact ? { display: 'none' } : {};

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
            `Maximum ${limitCheck.max || maxFiles} ${contentType.replace(/([A-Z])/g, ' $1').toLowerCase()} reached`
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...compactDropZone,
          ...(isDragging ? styles.dropZoneActive : {}),
          ...(error ? styles.dropZoneError : {}),
          ...(isOptimizing ? { opacity: 0.6, cursor: 'wait' } : {}),
          borderColor: isDragging ? accentColor : undefined,
        }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
          if (!isOptimizing && remaining > 0 && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
      >
        <div style={{ ...styles.dropIcon, ...compactIcon }}></div>
        <div style={{ ...styles.dropTitle, ...compactTitle }}>{title}</div>
        <div style={{ ...styles.dropSubtitle, ...compactSubtitle }}>
          {isOptimizing ? 'Optimizing photos...' : subtitle}
        </div>
        <button 
          style={{ 
            ...styles.dropButton, 
            ...compactButton,
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            opacity: (isOptimizing || remaining <= 0) ? 0.5 : 1,
            cursor: (isOptimizing || remaining <= 0) ? 'not-allowed' : 'pointer',
          }}
          disabled={isOptimizing || remaining <= 0}
          onClick={(e) => {
            e.stopPropagation();
            if (!isOptimizing && remaining > 0 && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          {isOptimizing ? 'Processing...' : 'Select Files'}
        </button>
        <div style={{ ...styles.dropHint, ...compactHint }}>
          Max {config.maxDimension}px, {config.maxSizeMB}MB per file • {config.acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={config.acceptedTypes.join(',')}
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Preview Grid - Show existing photos */}
      {(existingPhotos.length > 0 || uploads.length > 0) && (
        <div style={styles.previewGrid}>
          {/* Existing Photos */}
          {existingPhotos.map((photo, i) => {
            const photoUrl = photo.url || photo;
            return (
              <div 
                key={`existing-${i}-${photoUrl}`} 
                style={styles.previewItem}
                onMouseEnter={(e) => {
                  const overlay = e.currentTarget.querySelector('.overlay');
                  if (overlay) overlay.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  const overlay = e.currentTarget.querySelector('.overlay');
                  if (overlay) overlay.style.opacity = 0;
                }}
              >
                <img 
                  src={photoUrl} 
                  alt={`Photo ${i + 1}`}
                  style={styles.previewImage}
                  onError={(e) => {
                    console.error('Failed to load image:', photoUrl);
                    e.target.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Successfully loaded image:', photoUrl);
                  }}
                />
                <div className="overlay" style={styles.previewOverlay}>
                  <button 
                    style={styles.previewDelete}
                    onClick={() => handleExistingDelete(photo)}
                  >
                    ×
                  </button>
                </div>
                <div style={{
                  ...styles.previewStatus,
                  background: '#3fb950',
                }}>
                  ✓
                </div>
              </div>
            );
          })}

          {/* New Uploads */}
          {uploads.map((upload) => (
            <div 
              key={upload.id} 
              style={styles.previewItem}
              onMouseEnter={(e) => {
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) overlay.style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                const overlay = e.currentTarget.querySelector('.overlay');
                if (overlay) overlay.style.opacity = 0;
              }}
            >
              <img 
                src={upload.url} 
                alt="" 
                style={styles.previewImage} 
              />
              
              {upload.status === 'complete' && (
                <div className="overlay" style={styles.previewOverlay}>
                  <button 
                    style={styles.previewDelete}
                    onClick={() => handleDelete(upload)}
                  >
                    ×
                  </button>
                </div>
              )}
              
              {/* Progress bar */}
              {upload.status === 'uploading' && (
                <div style={styles.previewProgress}>
                  <div style={{
                    ...styles.previewProgressBar,
                    width: `${upload.progress}%`,
                    background: accentColor,
                  }} />
                </div>
              )}
              
              {/* Status indicator */}
              <div style={{
                ...styles.previewStatus,
                background: upload.status === 'complete' ? '#3fb950' :
                           upload.status === 'error' ? '#f85149' :
                           upload.status === 'uploading' ? accentColor :
                           'rgba(255,255,255,0.3)',
              }}>
                {upload.status === 'complete' ? '✓' :
                 upload.status === 'error' ? '!' :
                 upload.status === 'uploading' ? `${upload.progress}%` :
                 '•'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo count */}
      <div style={{
        marginTop: '1rem',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
      }}>
        {currentCount} / {userType && contentType && limits?.[contentType]?.max ? limits[contentType].max : maxFiles} photos
        {remaining > 0 && ` • ${remaining} remaining`}
      </div>
    </div>
  );
}

