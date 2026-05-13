import React, { useState } from 'react';
import PhotoUploader from '../PhotoUploader';
import { PORTFOLIO_TARGET_MIN, PORTFOLIO_TARGET_MAX } from '../../utils/profileConstants';

const styles = {
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(139, 30, 63, 0.08)',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  progressBar: {
    height: '10px',
    background: 'rgba(139, 30, 63, 0.1)',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '1rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8B1E3F, #A85A5A)',
    transition: 'width 0.5s ease',
  },
  progressText: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  portfolioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  portfolioItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  portfolioImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  portfolioOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    padding: '0.75rem',
    color: '#FFFEF9',
    fontSize: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  portfolioTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginTop: '0.25rem',
  },
  tag: {
    padding: '0.2rem 0.5rem',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    fontSize: '0.65rem',
  },
  editButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    padding: '0.4rem 0.8rem',
    background: 'rgba(139, 30, 63, 0.9)',
    color: '#FFFEF9',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function PortfolioEditor({
  portfolioItems = [],
  onPortfolioAdd,
  onPortfolioUpdate,
  onPortfolioDelete,
  userId,
}) {
  const [editingItem, setEditingItem] = useState(null);

  const portfolioCount = portfolioItems.length;
  const portfolioProgress = Math.min(100, (portfolioCount / PORTFOLIO_TARGET_MAX) * 100);
  const isComplete = portfolioCount >= PORTFOLIO_TARGET_MIN;

  const handlePortfolioUpload = (results) => {
    const newItems = results.map(r => ({
      url: r.url,
      key: r.key,
      tags: [],
      date: new Date().toISOString().split('T')[0],
      usedInCampaign: false,
    }));
    onPortfolioAdd(newItems);
  };

  return (
    <>
      {/* Portfolio / Recent Work */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          <span>Portfolio / Recent Work</span>
        </div>
        
        {/* Portfolio Completeness */}
        <div style={styles.progressText}>
          Portfolio Completeness: {portfolioCount} / {PORTFOLIO_TARGET_MAX} photos
          {isComplete && ' (Complete!)'}
        </div>
        <div style={styles.progressBar}>
          <div style={{
            ...styles.progressFill,
            width: `${portfolioProgress}%`,
          }} />
        </div>
        {!isComplete && (
          <div style={{
            fontSize: '0.8rem',
            color: '#5A3A2A',
            fontFamily: '"Alike", "Georgia", serif',
            marginBottom: '1rem',
          }}>
            Add {PORTFOLIO_TARGET_MIN - portfolioCount} more tagged photos to unlock Modeled Mag eligibility
          </div>
        )}

        {/* Portfolio Upload */}
        <PhotoUploader
          title="Add Portfolio Photos"
          subtitle="Upload work examples with tags"
          maxFiles={20}
          accentColor="#667eea"
          existingPhotos={[]}
          pathGenerator={(filename) => getProfilePhotoPath('professional', userId, `portfolio-${filename}`)}
          onUpload={handlePortfolioUpload}
          userType="professional"
          contentType="portfolioPhotos"
        />

        {/* Portfolio Grid */}
        {portfolioItems.length > 0 && (
          <div style={styles.portfolioGrid}>
            {portfolioItems.map((item, index) => (
              <div
                key={item.key || index}
                style={styles.portfolioItem}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onClick={() => setEditingItem(item)}
              >
                <img src={item.url} alt="Portfolio" style={styles.portfolioImage} />
                <button
                  style={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingItem(item);
                  }}
                >
                  Edit Tags
                </button>
                <div style={styles.portfolioOverlay}>
                  <div>{item.date || 'No date'}</div>
                  {item.tags && item.tags.length > 0 && (
                    <div style={styles.portfolioTags}>
                      {item.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} style={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {item.usedInCampaign && (
                    <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', opacity: 0.9 }}>
                      Used in Campaign
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Tags Modal */}
      {editingItem && (
        <PortfolioTagEditor
          item={editingItem}
          onSave={(updatedItem) => {
            onPortfolioUpdate(updatedItem);
            setEditingItem(null);
          }}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}

// Portfolio Tag Editor Modal
function PortfolioTagEditor({ item, onSave, onClose }) {
  const [tags, setTags] = useState(item.tags || []);
  const [date, setDate] = useState(item.date || new Date().toISOString().split('T')[0]);
  const [usedInCampaign, setUsedInCampaign] = useState(item.usedInCampaign || false);
  const [newTag, setNewTag] = useState('');

  const tagOptions = ['Balayage', 'Highlights', 'Color', 'Cut', 'Blowout', 'Styling', 'Long', 'Short', 'Curly', 'Straight', 'Glam', 'Natural'];

  const addTag = (tag) => {
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    onSave({
      ...item,
      tags,
      date,
      usedInCampaign,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    }}>
      <div style={{
        background: '#FFFEF9',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            Tag Portfolio Photo
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#5A3A2A',
            }}
          >
            ×
          </button>
        </div>

        <img src={item.url} alt="Portfolio" style={{
          width: '100%',
          maxHeight: '300px',
          objectFit: 'contain',
          borderRadius: '12px',
          marginBottom: '1.5rem',
        }} />

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              borderRadius: '8px',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
          }}>
            Tags ({tags.length}/5)
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '0.5rem',
          }}>
            {tags.map(tag => (
              <span
                key={tag}
                style={{
                  padding: '0.4rem 0.8rem',
                  background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
                  color: '#FFFEF9',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontFamily: '"Alike", "Georgia", serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFEF9',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}>
              {tagOptions.filter(opt => !tags.includes(opt)).map(opt => (
                <button
                  key={opt}
                  onClick={() => addTag(opt)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#FFFEF9',
                    border: '1px solid rgba(139, 30, 63, 0.2)',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontFamily: '"Alike", "Georgia", serif',
                  }}
                >
                  + {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#4A2A1A',
            fontFamily: '"Alike", "Georgia", serif',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={usedInCampaign}
              onChange={(e) => setUsedInCampaign(e.target.checked)}
            />
            Used in Campaign
          </label>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(139, 30, 63, 0.05)',
              border: '1px solid rgba(139, 30, 63, 0.2)',
              borderRadius: '8px',
              color: '#4A2A1A',
              fontSize: '0.9rem',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
              border: 'none',
              borderRadius: '8px',
              color: '#FFFEF9',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: '"Alike", "Georgia", serif',
            }}
          >
            Save Tags
          </button>
        </div>
      </div>
    </div>
  );
}

