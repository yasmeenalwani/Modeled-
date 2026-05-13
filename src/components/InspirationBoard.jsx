/**
 * InspirationBoard Component
 * 
 * Component for managing inspiration board photos and videos
 * Used by models, professionals, and partners to showcase style preferences
 */

import React, { useState, useEffect } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import PhotoUploader from './PhotoUploader';
import VideoUploader from './VideoUploader';
import { getProfilePhotoPath } from '../utils/storage';
import { getStorageLimits, getEstimatedStorage } from '../utils/storageLimits';

const client = generateClient();

const styles = {
  container: {
    background: '#FFFEF9',
    borderRadius: '16px',
    padding: '2rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#5A3A2A',
    lineHeight: '1.6',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid rgba(139, 30, 63, 0.1)',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#5A3A2A',
    background: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tabActive: {
    color: '#8B1E3F',
    borderBottomColor: '#8B1E3F',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '1rem',
  },
  storageInfo: {
    padding: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    color: '#4A2A1A',
  },
  storageBar: {
    height: '8px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.5rem',
  },
  storageFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    transition: 'width 0.3s',
  },
};

export default function InspirationBoard({ userType, userId }) {
  const { user } = useAuthenticator();
  const [activeTab, setActiveTab] = useState('photos');
  const [inspirationPhotos, setInspirationPhotos] = useState([]);
  const [inspirationVideos, setInspirationVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const limits = getStorageLimits(userType);
  const storageEstimate = getEstimatedStorage(userType, {
    inspirationPhotos: inspirationPhotos.length,
    inspirationVideos: inspirationVideos.length,
  });

  // Load existing inspiration content
  useEffect(() => {
    loadInspirationContent();
  }, [userId, userType]);

  const loadInspirationContent = async () => {
    setLoading(true);
    try {
      // TODO: Load from database when inspiration board fields are added
      // For now, use empty arrays
      setInspirationPhotos([]);
      setInspirationVideos([]);
    } catch (error) {
      console.error('Error loading inspiration content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (results) => {
    const newPhotos = results.map(r => ({ url: r.url, key: r.key }));
    setInspirationPhotos(prev => [...prev, ...newPhotos]);
    // TODO: Save to database
  };

  const handlePhotoDelete = (photo) => {
    setInspirationPhotos(prev => prev.filter(p => p.url !== photo.url && p.key !== photo.key));
    // TODO: Delete from database
  };

  const handleVideoUpload = (result) => {
    setInspirationVideos(prev => [...prev, { url: result.url, key: result.key, duration: result.duration }]);
    // TODO: Save to database
  };

  const handleVideoDelete = (video) => {
    setInspirationVideos(prev => prev.filter(v => v.key !== video.key));
    // TODO: Delete from database
  };

  const getInspirationPhotoPath = (filename) => {
    return `inspiration/photos/${userId}/${Date.now()}_${filename}`;
  };

  const getInspirationVideoPath = (filename) => {
    return `videos/inspiration/${userId}/${Date.now()}_${filename}`;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#5A3A2A' }}>
          Loading inspiration board...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Inspiration Board</h2>
        <p style={styles.subtitle}>
          Share photos and videos that inspire your style. This helps professionals understand your aesthetic preferences.
        </p>
      </div>

      {/* Storage Info */}
      {storageEstimate && (
        <div style={styles.storageInfo}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Storage Usage</span>
            <span>{storageEstimate.totalMB}MB / ~{storageEstimate.estimated}MB</span>
          </div>
          <div style={styles.storageBar}>
            <div style={{
              ...styles.storageFill,
              width: `${Math.min(100, (storageEstimate.totalMB / storageEstimate.estimated) * 100)}%`,
            }} />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'photos' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('photos')}
        >
          Photos ({inspirationPhotos.length}/{limits?.inspirationPhotos?.max || 20})
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'videos' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('videos')}
        >
          Videos ({inspirationVideos.length}/{limits?.inspirationVideos?.max || 5})
        </button>
      </div>

      {/* Photos Tab */}
      {activeTab === 'photos' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Inspiration Photos</h3>
          <PhotoUploader
            title="Upload Inspiration Photos"
            subtitle="Share photos that inspire your style"
            maxFiles={limits?.inspirationPhotos?.max || 20}
            accentColor="#8B1E3F"
            existingPhotos={inspirationPhotos}
            pathGenerator={getInspirationPhotoPath}
            onUpload={handlePhotoUpload}
            onDelete={handlePhotoDelete}
            userType={userType}
            contentType="inspirationPhotos"
            isInspiration={true}
          />
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Inspiration Videos</h3>
          {inspirationVideos.map((video, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <VideoUploader
                title={`Video ${index + 1}`}
                subtitle="Inspiration video"
                existingVideo={video}
                pathGenerator={getInspirationVideoPath}
                onUpload={handleVideoUpload}
                onDelete={() => handleVideoDelete(video)}
                userType={userType}
                contentType="inspirationVideos"
                isInspiration={true}
                maxVideos={limits?.inspirationVideos?.max || 5}
              />
            </div>
          ))}
          {inspirationVideos.length < (limits?.inspirationVideos?.max || 5) && (
            <VideoUploader
              title="Add Inspiration Video"
              subtitle="Upload a video that inspires your style"
              pathGenerator={getInspirationVideoPath}
              onUpload={handleVideoUpload}
              userType={userType}
              contentType="inspirationVideos"
              isInspiration={true}
              maxVideos={limits?.inspirationVideos?.max || 5}
            />
          )}
        </div>
      )}
    </div>
  );
}
