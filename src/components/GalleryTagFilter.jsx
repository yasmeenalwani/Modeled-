import React, { useState } from 'react';
import { GALLERY_TAG_CATEGORIES } from '../utils/galleryTags';

// ============ STYLES ============
const styles = {
  container: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  clearAll: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '6px',
    color: '#5A3A2A',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  category: {
    borderBottom: '1px solid rgba(139, 30, 63, 0.1)',
    paddingBottom: '0.75rem',
    marginBottom: '0.75rem',
  },
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  categoryTitle: {
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  expandIcon: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    transition: 'transform 0.2s ease',
  },
  categoryContent: {
    marginTop: '0.5rem',
    paddingLeft: '1.5rem',
  },
  subcategory: {
    marginBottom: '0.75rem',
  },
  subcategoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.4rem 0',
    cursor: 'pointer',
    userSelect: 'none',
  },
  subcategoryTitle: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subcategoryContent: {
    marginTop: '0.4rem',
    paddingLeft: '1rem',
  },
  tagList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  tagItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.25rem 0',
    userSelect: 'none',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(139, 30, 63, 0.3)',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  },
  checkboxChecked: {
    background: '#8B1E3F',
    borderColor: '#8B1E3F',
  },
  checkmark: {
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  tagLabel: {
    fontSize: '0.85rem',
    color: '#4A2A1A',
    transition: 'color 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tagLabelChecked: {
    color: '#8B1E3F',
    fontWeight: '600',
  },
  activeCount: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    marginLeft: 'auto',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function GalleryTagFilter({ 
  selectedTags = [], 
  onTagsChange, 
  photos = [],
  tagCategories = GALLERY_TAG_CATEGORIES,
  title = 'Filter by Tags'
}) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Toggle subcategory expansion
  const toggleSubcategory = (categoryId, subcategoryId) => {
    const key = `${categoryId}:${subcategoryId}`;
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle tag selection
  const toggleTag = (tagPath) => {
    const newSelectedTags = selectedTags.includes(tagPath)
      ? selectedTags.filter(t => t !== tagPath)
      : [...selectedTags, tagPath];
    
    onTagsChange(newSelectedTags);
  };

  // Clear all selected tags
  const clearAll = () => {
    onTagsChange([]);
  };

  // Count photos matching a specific tag
  const getTagCount = (tagPath) => {
    if (!photos || photos.length === 0) return 0;
    return photos.filter(photo => {
      const photoTags = photo.tags || [];
      return photoTags.some(pt => {
        if (pt === tagPath) return true;
        const selectedParts = tagPath.split(':');
        const photoParts = pt.split(':');
        if (selectedParts.length === 2 && photoParts.length >= 2) {
          return selectedParts[0] === photoParts[0] && 
                 selectedParts[1] === photoParts[photoParts.length - 1];
        }
        return false;
      });
    }).length;
  };

  const hasActiveFilters = selectedTags.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          {title}
        </div>
        {hasActiveFilters && (
          <button
            style={styles.clearAll}
            onClick={clearAll}
            onMouseOver={(e) => {
              e.target.style.borderColor = 'rgba(139, 30, 63, 0.4)';
              e.target.style.color = '#8B1E3F';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = 'rgba(139, 30, 63, 0.2)';
              e.target.style.color = '#5A3A2A';
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {tagCategories.map(category => {
        const isExpanded = expandedCategories[category.id] || false;
        
        return (
          <div key={category.id} style={styles.category}>
            {/* Category Header */}
            <div
              style={styles.categoryHeader}
              onClick={() => toggleCategory(category.id)}
            >
              <div style={styles.categoryTitle}>
                <span>{category.icon}</span>
                {category.label}
                {selectedTags.filter(t => t.startsWith(`${category.id}:`)).length > 0 && (
                  <span style={{ fontSize: '0.75rem', color: '#667eea', marginLeft: '0.25rem' }}>
                    ({selectedTags.filter(t => t.startsWith(`${category.id}:`)).length})
                  </span>
                )}
              </div>
              <span
                style={{
                  ...styles.expandIcon,
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >
                ▶
              </span>
            </div>

            {/* Category Content */}
            {isExpanded && (
              <div style={styles.categoryContent}>
                {/* Direct tags (no subcategories) */}
                {category.tags && (
                  <div style={styles.tagList}>
                    {category.tags.map(tag => {
                      const tagPath = `${category.id}:${tag.id}`;
                      const isSelected = selectedTags.includes(tagPath);
                      const count = getTagCount(tagPath);
                      
                      return (
                        <div
                          key={tag.id}
                          style={styles.tagItem}
                          onClick={() => toggleTag(tagPath)}
                        >
                          <div
                            style={{
                              ...styles.checkbox,
                              ...(isSelected ? styles.checkboxChecked : {}),
                            }}
                          >
                            {isSelected && <span style={styles.checkmark}>✓</span>}
                          </div>
                          <span
                            style={{
                              ...styles.tagLabel,
                              ...(isSelected ? styles.tagLabelChecked : {}),
                            }}
                          >
                            {tag.label}
                          </span>
                          {count > 0 && (
                            <span style={styles.activeCount}>({count})</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Subcategories */}
                {category.subcategories && category.subcategories.map(subcat => {
                  const subcatKey = `${category.id}:${subcat.id}`;
                  const isSubcatExpanded = expandedSubcategories[subcatKey] || false;
                  
                  return (
                    <div key={subcat.id} style={styles.subcategory}>
                      {/* Subcategory Header */}
                      <div
                        style={styles.subcategoryHeader}
                        onClick={() => toggleSubcategory(category.id, subcat.id)}
                      >
                        <div style={styles.subcategoryTitle}>
                          {subcat.label}
                          {selectedTags.filter(t => t.startsWith(`${subcatKey}:`)).length > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#667eea', marginLeft: '0.25rem' }}>
                              ({selectedTags.filter(t => t.startsWith(`${subcatKey}:`)).length})
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            ...styles.expandIcon,
                            transform: isSubcatExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            fontSize: '0.7rem',
                          }}
                        >
                          ▶
                        </span>
                      </div>

                      {/* Subcategory Tags */}
                      {isSubcatExpanded && (
                        <div style={styles.subcategoryContent}>
                          <div style={styles.tagList}>
                            {subcat.tags.map(tag => {
                              const tagPath = `${category.id}:${subcat.id}:${tag.id}`;
                              const isSelected = selectedTags.includes(tagPath);
                              const count = getTagCount(tagPath);
                              
                              return (
                                <div
                                  key={tag.id}
                                  style={styles.tagItem}
                                  onClick={() => toggleTag(tagPath)}
                                >
                                  <div
                                    style={{
                                      ...styles.checkbox,
                                      ...(isSelected ? styles.checkboxChecked : {}),
                                    }}
                                  >
                                    {isSelected && <span style={styles.checkmark}>✓</span>}
                                  </div>
                                  <span
                                    style={{
                                      ...styles.tagLabel,
                                      ...(isSelected ? styles.tagLabelChecked : {}),
                                    }}
                                  >
                                    {tag.label}
                                  </span>
                                  {count > 0 && (
                                    <span style={styles.activeCount}>({count})</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

