import React, { useState, useRef, useEffect } from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';
import { post } from 'aws-amplify/api';
import outputs from '../../amplify_outputs.json';
import { shouldUseMockData } from '../utils/mockDataService';

const IDENTITY_VERIFICATION_API = outputs?.custom?.API?.identityVerificationApi?.apiName || 'identityVerificationApi';

// ============ STYLES ============
const styles = {
  container: {
    padding: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  title: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    color: '#8B1E3F', // Cherry
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    fontFamily: '"Alike", "Georgia", serif',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  uploadArea: {
    border: '2px dashed rgba(139, 30, 63, 0.3)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    background: '#FFFEF9', // Ivory
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: '1rem',
  },
  uploadAreaHover: {
    borderColor: '#8B1E3F', // Cherry
    background: 'rgba(139, 30, 63, 0.05)',
  },
  uploadAreaActive: {
    borderColor: '#4caf50',
    background: 'rgba(76,175,80,0.1)',
  },
  uploadIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  uploadText: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  uploadHint: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  fileInput: {
    display: 'none',
  },
  previewContainer: {
    marginTop: '1rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
  },
  preview: {
    position: 'relative',
    borderRadius: '8px',
    overflow: 'hidden',
    background: 'rgba(139, 30, 63, 0.05)',
  },
  previewImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  previewRemove: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    background: 'rgba(139, 30, 63, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    color: '#FFFEF9', // Ivory
    cursor: 'pointer',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButton: {
    width: '100%',
    padding: '1rem',
    fontSize: '1rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '10px',
    color: '#FFFEF9', // Ivory
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  verifyButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultContainer: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  resultSuccess: {
    background: 'rgba(76,175,80,0.2)',
    border: '1px solid rgba(76,175,80,0.5)',
    color: '#4caf50',
  },
  resultPending: {
    background: 'rgba(255,193,7,0.2)',
    border: '1px solid rgba(255,193,7,0.5)',
    color: '#ffc107',
  },
  resultError: {
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.3)',
    color: '#8B1E3F', // Cherry
  },
  resultIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  resultText: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  resultSubtext: {
    fontSize: '0.85rem',
    opacity: 0.8,
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    color: '#5A3A2A', // Muted brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  requirements: {
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
    border: '1px solid rgba(139, 30, 63, 0.15)',
  },
  requirementsTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  requirement: {
    fontSize: '0.85rem',
    color: '#4A2A1A', // Dark brown
    marginBottom: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function IdentityVerification({ 
  userType = 'model', 
  userId, 
  onVerificationComplete,
  existingData = {} 
}) {
  const [idDocument, setIdDocument] = useState(null);
  const [idDocumentUrl, setIdDocumentUrl] = useState(existingData.idDocumentUrl || null);
  const [idDocumentType, setIdDocumentType] = useState(existingData.idDocumentType || '');
  const [selfie, setSelfie] = useState(null);
  const [selfieUrl, setSelfieUrl] = useState(existingData.verificationSelfieUrl || null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ id: 0, selfie: 0 });
  const [showSelfieCamera, setShowSelfieCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam for selfie (works on desktop with webcam)
  const startSelfieCamera = async () => {
    setCameraError(null);
    setShowSelfieCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(err.name === 'NotAllowedError' ? 'Camera permission denied.' : 'Could not access camera. Use "Upload" to choose a file instead.');
      setShowSelfieCamera(false);
    }
  };

  const stopSelfieCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setShowSelfieCamera(false);
    setCameraError(null);
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
        stopSelfieCamera();
        handleSelfieUpload(file);
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (showSelfieCamera && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [showSelfieCamera]);

  // Only bypass real S3 + API when explicitly in mock/demo mode — not for every dev server session (so staging-style local URLs still hit Rekognition).
  const useMockOrDev = shouldUseMockData();

  const handleIdUpload = async (file) => {
    if (!file) return;
    setUploadProgress(prev => ({ ...prev, id: 0 }));
    try {
      if (useMockOrDev) {
        setIdDocumentUrl(URL.createObjectURL(file));
        setIdDocument(file);
        setUploadProgress(prev => ({ ...prev, id: 100 }));
        return;
      }
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const path = `identity-verification/${userType}s/${userId}/id-${timestamp}.${ext}`;
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            const pct = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
            setUploadProgress(prev => ({ ...prev, id: pct }));
          },
        },
      }).result;
      const urlResult = await getUrl({ path });
      setIdDocumentUrl(urlResult.url.toString());
      setIdDocument(file);
      setUploadProgress(prev => ({ ...prev, id: 100 }));
    } catch (error) {
      console.error('ID upload error:', error);
      if (useMockOrDev) {
        setIdDocumentUrl(URL.createObjectURL(file));
        setIdDocument(file);
        setUploadProgress(prev => ({ ...prev, id: 100 }));
      } else {
        alert('Failed to upload ID. Please try again.');
      }
    }
  };

  const handleSelfieUpload = async (file) => {
    if (!file) return;
    setUploadProgress(prev => ({ ...prev, selfie: 0 }));
    try {
      if (useMockOrDev) {
        setSelfieUrl(URL.createObjectURL(file));
        setSelfie(file);
        setUploadProgress(prev => ({ ...prev, selfie: 100 }));
        return;
      }
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const path = `identity-verification/${userType}s/${userId}/selfie-${timestamp}.${ext}`;
      await uploadData({
        path,
        data: file,
        options: {
          contentType: file.type,
          onProgress: ({ transferredBytes, totalBytes }) => {
            const pct = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
            setUploadProgress(prev => ({ ...prev, selfie: pct }));
          },
        },
      }).result;
      const urlResult = await getUrl({ path });
      setSelfieUrl(urlResult.url.toString());
      setSelfie(file);
      setUploadProgress(prev => ({ ...prev, selfie: 100 }));
    } catch (error) {
      console.error('Selfie upload error:', error);
      if (useMockOrDev) {
        setSelfieUrl(URL.createObjectURL(file));
        setSelfie(file);
        setUploadProgress(prev => ({ ...prev, selfie: 100 }));
      } else {
        alert('Failed to upload selfie. Please try again.');
      }
    }
  };

  const handleVerify = async () => {
    if (!idDocumentUrl || !selfieUrl) {
      alert('Please upload both your ID document and selfie.');
      return;
    }

    if (!idDocumentType) {
      alert('Please select your ID document type.');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);

    try {
      if (useMockOrDev) {
        setVerificationResult({
          verified: true,
          confidence: 100,
          status: 'manual_review',
          message: 'Verification submitted. In demo mode this is marked for review.',
        });
        if (onVerificationComplete) {
          onVerificationComplete({
            idDocumentUrl,
            idDocumentType,
            verificationSelfieUrl: selfieUrl,
            identityVerificationStatus: 'manual_review',
            identityVerificationScore: 100,
            identityVerified: true,
          });
        }
        return;
      }

      const response = await post({
        apiName: IDENTITY_VERIFICATION_API,
        path: '/verify-identity',
        options: {
          body: {
            idDocumentUrl,
            selfieUrl,
            idDocumentType,
            userType,
            userId,
          },
        },
      });

      const result = await response.body.json();

      setVerificationResult({
        verified: result.verified,
        confidence: result.confidence,
        status: result.status || (result.verified ? 'verified' : result.confidence >= 60 ? 'manual_review' : 'failed'),
        message: result.message || (result.verified
          ? `Identity verified! (${result.confidence?.toFixed(1)}% match)`
          : result.confidence >= 60
          ? `Verification needs manual review (${result.confidence?.toFixed(1)}% match)`
          : `Verification failed (${result.confidence?.toFixed(1)}% match). Please try again with clearer photos.`),
      });

      if (onVerificationComplete) {
        onVerificationComplete({
          idDocumentUrl,
          idDocumentType,
          verificationSelfieUrl: selfieUrl,
          identityVerificationStatus: result.status || (result.verified ? 'verified' : result.confidence >= 60 ? 'manual_review' : 'failed'),
          identityVerificationScore: result.confidence,
          identityVerified: result.verified,
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      if (useMockOrDev) {
        setVerificationResult({
          verified: true,
          confidence: 100,
          status: 'manual_review',
          message: 'Verification submitted (demo mode).',
        });
        if (onVerificationComplete) {
          onVerificationComplete({
            idDocumentUrl,
            idDocumentType,
            verificationSelfieUrl: selfieUrl,
            identityVerificationStatus: 'manual_review',
            identityVerificationScore: 100,
            identityVerified: true,
          });
        }
      } else {
        const serverMessage = error?.body?.message ?? error?.response?.data?.message ?? error?.message;
        setVerificationResult({
          verified: false,
          confidence: 0,
          status: 'failed',
          message: serverMessage || 'Verification failed. Please try again.',
        });
        if (onVerificationComplete) {
          onVerificationComplete({
            idDocumentUrl,
            idDocumentType,
            verificationSelfieUrl: selfieUrl,
            identityVerificationStatus: 'failed',
            identityVerificationScore: 0,
            identityVerified: false,
          });
        }
      }
    } finally {
      setVerifying(false);
    }
  };

  const canVerify = idDocumentUrl && selfieUrl && idDocumentType && !verifying;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Verify Your Identity</h3>
      <p style={styles.subtitle}>
        We need to verify your identity to ensure safety and security. Please upload a government-issued ID and take a selfie.
      </p>

      {/* ID Document Upload */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>1. Upload Government ID</div>
        <label
          htmlFor="id-upload"
          style={{
            ...styles.uploadArea,
            ...(idDocumentUrl ? styles.uploadAreaActive : {}),
          }}
          onMouseEnter={(e) => {
            if (!idDocumentUrl) {
              e.currentTarget.style.borderColor = '#8B1E3F';
              e.currentTarget.style.background = 'rgba(139, 30, 63, 0.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!idDocumentUrl) {
              e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.3)';
              e.currentTarget.style.background = '#FFFEF9';
            }
          }}
        >
          <input
            id="id-upload"
            type="file"
            accept="image/*"
            style={styles.fileInput}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleIdUpload(file);
            }}
          />
          {idDocumentUrl ? (
            <>
              <div style={styles.uploadIcon}></div>
              <div style={styles.uploadText}>ID Document Uploaded</div>
              {uploadProgress.id < 100 && (
                <div style={styles.uploadHint}>Uploading... {uploadProgress.id}%</div>
              )}
            </>
          ) : (
            <>
              <div style={styles.uploadIcon}></div>
              <div style={styles.uploadText}>Click to upload ID</div>
              <div style={styles.uploadHint}>Driver's license, passport, or state ID</div>
            </>
          )}
        </label>

        {idDocumentUrl && (
          <div style={styles.previewContainer}>
            <div style={styles.preview}>
              <img src={idDocumentUrl} alt="ID Document" style={styles.previewImage} />
              <button
                style={styles.previewRemove}
                onClick={() => {
                  setIdDocumentUrl(null);
                  setIdDocument(null);
                  setIdDocumentType('');
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {idDocumentUrl && !idDocumentType && (
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem', color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>ID Document Type:</label>
            <select
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                fontSize: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                backgroundColor: '#FFFEF9', // Ivory
                color: '#4A2A1A', // Dark brown
                outline: 'none',
                fontFamily: '"Alike", "Georgia", serif',
              }}
              value={idDocumentType}
              onChange={(e) => setIdDocumentType(e.target.value)}
            >
              <option value="">Select type...</option>
              <option value="drivers_license">Driver's License</option>
              <option value="passport">Passport</option>
              <option value="state_id">State ID</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}
      </div>

      {/* Selfie Upload */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>2. Take a Selfie</div>
        {showSelfieCamera ? (
          <div style={{ ...styles.uploadArea, padding: '1rem' }}>
            <p style={{ ...styles.uploadHint, marginBottom: '0.75rem' }}>Position your face in the frame, then click Capture.</p>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', maxWidth: 400, borderRadius: 8, background: '#000' }}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={captureSelfie}
                style={{ ...styles.verifyButton, marginTop: 0, flex: '1', minWidth: 120 }}
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopSelfieCamera}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'transparent',
                  border: '1px solid #8B1E3F',
                  borderRadius: 10,
                  color: '#8B1E3F',
                  cursor: 'pointer',
                  fontFamily: '"Alike", "Georgia", serif',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : cameraError ? (
          <div style={{ ...styles.uploadArea, borderColor: 'rgba(200,80,80,0.5)', background: 'rgba(200,80,80,0.08)' }}>
            <div style={{ ...styles.uploadHint, color: '#8B1E3F', marginBottom: '0.75rem' }}>{cameraError}</div>
            <button type="button" onClick={() => setCameraError(null)} style={styles.verifyButton}>
              Choose file instead
            </button>
          </div>
        ) : !selfieUrl ? (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={startSelfieCamera}
                style={{ ...styles.verifyButton, marginTop: 0, flex: '1', minWidth: 160 }}
              >
                Take with camera
              </button>
              <label
                htmlFor="selfie-upload"
                style={{ ...styles.uploadArea, flex: '1', minWidth: 160, marginBottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <input
                  id="selfie-upload"
                  type="file"
                  accept="image/*"
                  capture="user"
                  style={styles.fileInput}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleSelfieUpload(file);
                    e.target.value = '';
                  }}
                />
                <span style={styles.uploadText}>Upload photo</span>
              </label>
            </div>
            <div style={styles.uploadHint}>Make sure your face is clearly visible. Works on desktop (webcam) or phone.</div>
          </>
        ) : null}

        {!showSelfieCamera && !cameraError && (
          <label
            htmlFor="selfie-upload-alt"
            style={{
              ...styles.uploadArea,
              ...(selfieUrl ? styles.uploadAreaActive : {}),
              display: selfieUrl ? 'block' : 'none',
            }}
          >
            <input
              id="selfie-upload-alt"
              type="file"
              accept="image/*"
              capture="user"
              style={styles.fileInput}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSelfieUpload(file);
                e.target.value = '';
              }}
            />
            {selfieUrl && (
              <>
                <div style={styles.uploadIcon}></div>
                <div style={styles.uploadText}>Selfie Uploaded</div>
                {uploadProgress.selfie < 100 && (
                  <div style={styles.uploadHint}>Uploading... {uploadProgress.selfie}%</div>
                )}
              </>
            )}
          </label>
        )}

        {selfieUrl && !showSelfieCamera && (
          <div style={styles.previewContainer}>
            <div style={styles.preview}>
              <img src={selfieUrl} alt="Selfie" style={styles.previewImage} />
              <button
                style={styles.previewRemove}
                onClick={() => {
                  setSelfieUrl(null);
                  setSelfie(null);
                }}
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requirements */}
      <div style={styles.requirements}>
        <div style={styles.requirementsTitle}>Requirements:</div>
        <div style={styles.requirement}>ID must be government-issued and valid</div>
        <div style={styles.requirement}>ID photo must be clear and readable</div>
        <div style={styles.requirement}>Selfie must show your full face clearly</div>
        <div style={styles.requirement}>Good lighting and no filters</div>
        <div style={styles.requirement}>You must be 18+ to use this platform</div>
      </div>

      {/* Verify Button */}
      <button
        style={{
          ...styles.verifyButton,
          ...(!canVerify ? styles.verifyButtonDisabled : {}),
        }}
        onClick={handleVerify}
        disabled={!canVerify}
      >
        {verifying ? 'Verifying...' : 'Verify Identity'}
      </button>

      {/* Verification Result */}
      {verificationResult && (
        <div
          style={{
            ...styles.resultContainer,
            ...(verificationResult.status === 'verified'
              ? styles.resultSuccess
              : verificationResult.status === 'manual_review'
              ? styles.resultPending
              : styles.resultError),
          }}
        >
          <div style={styles.resultIcon}></div>
          <div style={{...styles.resultText, fontFamily: '"Alike", "Georgia", serif'}}>{verificationResult.message}</div>
          {verificationResult.status === 'manual_review' && (
            <div style={{...styles.resultSubtext, fontFamily: '"Alike", "Georgia", serif'}}>
              Don't worry! Our team will review your verification shortly.
            </div>
          )}
          {verificationResult.status === 'failed' && (
            <div style={{...styles.resultSubtext, fontFamily: '"Alike", "Georgia", serif'}}>
              Please try again with clearer photos or contact support if you continue to have issues.
            </div>
          )}
        </div>
      )}

      {verifying && (
        <div style={styles.loading}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}></div>
          <div>Comparing your selfie to your ID...</div>
        </div>
      )}
    </div>
  );
}

