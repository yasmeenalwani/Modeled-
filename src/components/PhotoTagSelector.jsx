import React, { useState, useEffect } from 'react';
import { GALLERY_TAG_CATEGORIES } from '../utils/galleryTags';

// ============ STYLES ============
const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '600px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tagCount: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  categorySection: {
    marginBottom: '1.5rem',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tagButton: {
    padding: '0.5rem 0.75rem',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#4A2A1A',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  tagButtonSelected: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  tagButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  checkmark: {
    fontSize: '0.9rem',
  },
  subcategory: {
    marginLeft: '1rem',
    marginTop: '0.75rem',
  },
  subcategoryLabel: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#5A3A2A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(139, 30, 63, 0.1)',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  buttonCancel: {
    background: 'transparent',
    color: '#5A3A2A',
    border: '1px solid rgba(139, 30, 63, 0.2)',
  },
  buttonSave: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  warning: {
    padding: '0.75rem 1rem',
    background: 'rgba(255, 193, 7, 0.1)',
    border: '1px solid rgba(255, 193, 7, 0.3)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#ffc107',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Flatten tags for easy access
const getAllAvailableTags = () => {
  const tags = [];
  
  GALLERY_TAG_CATEGORIES.forEach(category => {
    if (category.tags) {
      category.tags.forEach(tag => {
        tags.push({
          id: `${category.id}:${tag.id}`,
          label: tag.label,
          category: category.label,
          categoryIcon: category.icon,
        });
      });
    }
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        subcat.tags.forEach(tag => {
          tags.push({
            id: `${category.id}:${subcat.id}:${tag.id}`,
            label: tag.label,
            category: `${category.label} > ${subcat.label}`,
            categoryIcon: category.icon,
            subcategory: subcat.label,
          });
        });
      });
    }
  });
  
  return tags;
};

export default function PhotoTagSelector({
  selectedTags = [],
  onTagsChange,
  onSave,
  onCancel,
  maxTags = 5,
}) {
  const [localTags, setLocalTags] = useState(selectedTags);
  
  useEffect(() => {
    setLocalTags(selectedTags);
  }, [selectedTags]);
  
  const allTags = getAllAvailableTags();
  const tagsByCategory = {};
  
  allTags.forEach(tag => {
    const categoryKey = tag.category.split(' > ')[0];
    if (!tagsByCategory[categoryKey]) {
      tagsByCategory[categoryKey] = {
        icon: tag.categoryIcon,
        tags: [],
      };
    }
    tagsByCategory[categoryKey].tags.push(tag);
  });
  
  const handleTagToggle = (tagId) => {
    if (localTags.includes(tagId)) {
      setLocalTags(localTags.filter(t => t !== tagId));
    } else {
      if (localTags.length < maxTags) {
        setLocalTags([...localTags, tagId]);
      }
    }
  };
  
  const handleSave = () => {
    onTagsChange(localTags);
    if (onSave) onSave(localTags);
  };
  
  const handleCancel = () => {
    setLocalTags(selectedTags);
    if (onCancel) onCancel();
  };
  
  const getTagLabel = (tagId) => {
    const tag = allTags.find(t => t.id === tagId);
    return tag ? tag.label : tagId;
  };
  
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Select Tags (up to {maxTags})</div>
        <div style={styles.tagCount}>
          {localTags.length} / {maxTags} selected
        </div>
      </div>
      
      {localTags.length >= maxTags && (
        <div style={styles.warning}>
          ⚠️ Maximum {maxTags} tags allowed. Remove a tag to add another.
        </div>
      )}
      
      {/* Selected Tags Preview */}
      {localTags.length > 0 && (
        <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(139, 30, 63, 0.1)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4A2A1A', marginBottom: '0.5rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Selected:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {localTags.map(tagId => (
              <div
                key={tagId}
                style={{
                  ...styles.tagButton,
                  ...styles.tagButtonSelected,
                }}
                onClick={() => handleTagToggle(tagId)}
              >
                <span>{getTagLabel(tagId)}</span>
                <span style={styles.checkmark}>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tag Categories */}
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {Object.entries(tagsByCategory).map(([category, group]) => (
          <div key={category} style={styles.categorySection}>
            <div style={styles.categoryHeader}>
              <span>{group.icon}</span>
              <span>{category}</span>
            </div>
            <div style={styles.tagGrid}>
              {group.tags.map(tag => {
                const isSelected = localTags.includes(tag.id);
                const isDisabled = !isSelected && localTags.length >= maxTags;
                
                return (
                  <button
                    key={tag.id}
                    style={{
                      ...styles.tagButton,
                      ...(isSelected ? styles.tagButtonSelected : {}),
                      ...(isDisabled ? styles.tagButtonDisabled : {}),
                    }}
                    onClick={() => !isDisabled && handleTagToggle(tag.id)}
                    disabled={isDisabled}
                  >
                    {isSelected && <span style={styles.checkmark}>✓</span>}
                    <span>{tag.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div style={styles.actions}>
        <button
          style={styles.buttonCancel}
          onClick={handleCancel}
          onMouseOver={(e) => {
            e.target.style.borderColor = 'rgba(139, 30, 63, 0.4)';
            e.target.style.color = '#8B1E3F';
          }}
          onMouseOut={(e) => {
            e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)';
            e.target.style.color = '#5A3A2A';
          }}
        >
          Cancel
        </button>
        <button
          style={styles.buttonSave}
          onClick={handleSave}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Save Tags
        </button>
      </div>
    </div>
  );
}

