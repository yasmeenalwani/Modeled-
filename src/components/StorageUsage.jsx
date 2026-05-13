/**
 * StorageUsage Component
 * 
 * Displays storage usage and limits for a user
 */

import React from 'react';
import { getEstimatedStorage, getStorageLimits } from '../utils/storageLimits';

const styles = {
  container: {
    background: 'rgba(139, 30, 63, 0.03)',
    border: '1px solid rgba(139, 30, 63, 0.1)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.8rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#5A3A2A',
  },
  usage: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    fontWeight: '500',
  },
  bar: {
    height: '6px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '0.5rem',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    transition: 'width 0.3s',
  },
  details: {
    display: 'none', // Hide details by default - only show on hover/expand
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#5A3A2A',
  },
  detailLabel: {
    color: '#5A3A2A',
  },
  detailValue: {
    fontWeight: '600',
    color: '#4A2A1A',
  },
  warning: {
    padding: '0.5rem',
    background: 'rgba(248,81,73,0.1)',
    border: '1px solid rgba(248,81,73,0.3)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#f85149',
    marginTop: '0.5rem',
  },
};

export default function StorageUsage({ userType, contentCounts = {} }) {
  const limits = getStorageLimits(userType);
  const storage = getEstimatedStorage(userType, contentCounts);

  if (!limits || !storage) {
    return null;
  }

  const usagePercent = Math.min(100, (storage.totalMB / storage.estimated) * 100);
  const isNearLimit = usagePercent > 80;

  // Calculate counts
  const profilePhotoCount = contentCounts.profilePhotos || 0;
  const profileVideoCount = contentCounts.profileVideos || 0;
  const inspirationPhotoCount = contentCounts.inspirationPhotos || 0;
  const inspirationVideoCount = contentCounts.inspirationVideos || 0;
  const portfolioPhotoCount = contentCounts.portfolioPhotos || 0;
  const portfolioVideoCount = contentCounts.portfolioVideos || 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Storage Usage</div>
        <div style={styles.usage}>
          {storage.totalMB}MB / ~{storage.estimated}MB
        </div>
      </div>

      <div style={styles.bar}>
        <div style={{
          ...styles.fill,
          width: `${usagePercent}%`,
          background: isNearLimit
            ? 'linear-gradient(90deg, #f85149, #e94560)'
            : 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
        }} />
      </div>

      <div style={styles.details}>
        {profilePhotoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Profile Photos:</span>
            <span style={styles.detailValue}>
              {profilePhotoCount}/{limits.profilePhotos?.max || 'N/A'}
            </span>
          </div>
        )}
        {profileVideoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Profile Videos:</span>
            <span style={styles.detailValue}>
              {profileVideoCount}/{limits.profileVideos?.max || 'N/A'}
            </span>
          </div>
        )}
        {portfolioPhotoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Portfolio Photos:</span>
            <span style={styles.detailValue}>
              {portfolioPhotoCount}/{limits.portfolioPhotos?.max || 'N/A'}
            </span>
          </div>
        )}
        {portfolioVideoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Portfolio Videos:</span>
            <span style={styles.detailValue}>
              {portfolioVideoCount}/{limits.portfolioVideos?.max || 'N/A'}
            </span>
          </div>
        )}
        {inspirationPhotoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Inspiration Photos:</span>
            <span style={styles.detailValue}>
              {inspirationPhotoCount}/{limits.inspirationPhotos?.max || 'N/A'}
            </span>
          </div>
        )}
        {inspirationVideoCount > 0 && (
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Inspiration Videos:</span>
            <span style={styles.detailValue}>
              {inspirationVideoCount}/{limits.inspirationVideos?.max || 'N/A'}
            </span>
          </div>
        )}
      </div>

      {isNearLimit && (
        <div style={styles.warning}>
          ⚠️ You're approaching your storage limit. Consider removing unused content.
        </div>
      )}
    </div>
  );
}

