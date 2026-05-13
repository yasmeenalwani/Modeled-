import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GALLERY_TAG_CATEGORIES, getAllTagIds } from '../utils/galleryTags';

// ============ STYLES ============
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: '1.5rem',
  },
  searchWrapper: {
    position: 'relative',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '1rem 1.25rem',
    paddingRight: '3rem',
    fontSize: '1rem',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  searchInputFocused: {
    borderColor: '#8B1E3F',
    boxShadow: '0 0 0 3px rgba(139, 30, 63, 0.1)',
  },
  searchIcon: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '1.25rem',
    color: '#5A3A2A',
    pointerEvents: 'none',
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.5rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    maxHeight: '400px',
    overflowY: 'auto',
    zIndex: 1000,
  },
  suggestionGroup: {
    padding: '0.75rem 0',
  },
  suggestionGroupTitle: {
    padding: '0.5rem 1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionItem: {
    padding: '0.75rem 1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  suggestionItemHover: {
    background: 'rgba(139, 30, 63, 0.1)',
  },
  suggestionIcon: {
    fontSize: '1rem',
  },
  suggestionLabel: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#4A2A1A',
  },
  suggestionPath: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    opacity: 0.6,
  },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(102, 126, 234, 0.05))',
    border: '1px solid rgba(102, 126, 234, 0.2)',
    borderRadius: '6px',
    fontSize: '0.7rem',
    color: '#667eea',
    fontWeight: '600',
    marginLeft: '0.5rem',
  },
  selectedTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  selectedTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    fontSize: '0.85rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  removeTag: {
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#8B1E3F',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#5A3A2A',
    fontSize: '0.9rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Flatten all tags into a searchable structure
const flattenTags = () => {
  const flatTags = [];
  
  GALLERY_TAG_CATEGORIES.forEach(category => {
    if (category.tags) {
      category.tags.forEach(tag => {
        flatTags.push({
          id: `${category.id}:${tag.id}`,
          label: tag.label,
          category: category.label,
          categoryIcon: category.icon,
          path: `${category.label} > ${tag.label}`,
        });
      });
    }
    if (category.subcategories) {
      category.subcategories.forEach(subcat => {
        subcat.tags.forEach(tag => {
          flatTags.push({
            id: `${category.id}:${subcat.id}:${tag.id}`,
            label: tag.label,
            category: `${category.label} > ${subcat.label}`,
            categoryIcon: category.icon,
            path: `${category.label} > ${subcat.label} > ${tag.label}`,
          });
        });
      });
    }
  });
  
  return flatTags;
};

// AI-powered tag suggestion (simulated - in production, this would call an AI service)
const getAISuggestions = (query, allTags, selectedTags, photos) => {
  if (!query || query.length < 2) return [];
  
  const queryLower = query.toLowerCase();
  
  // Simple fuzzy matching for now (can be replaced with AI API call)
  const matches = allTags
    .filter(tag => {
      // Don't suggest already selected tags
      if (selectedTags.includes(tag.id)) return false;
      
      // Match label or category
      return tag.label.toLowerCase().includes(queryLower) ||
             tag.category.toLowerCase().includes(queryLower) ||
             tag.path.toLowerCase().includes(queryLower);
    })
    .slice(0, 10); // Limit to 10 suggestions
  
  // Group by category
  const grouped = {};
  matches.forEach(tag => {
    const categoryKey = tag.category;
    if (!grouped[categoryKey]) {
      grouped[categoryKey] = {
        icon: tag.categoryIcon,
        tags: [],
      };
    }
    grouped[categoryKey].tags.push(tag);
  });
  
  return grouped;
};

export default function TagSearchBar({ 
  selectedTags = [], 
  onTagsChange,
  photos = [],
  placeholder = 'Search tags with AI suggestions...',
  maxTags = 5,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const allTags = useMemo(() => flattenTags(), []);
  
  const suggestions = useMemo(() => {
    if (!isFocused || !searchQuery) return {};
    return getAISuggestions(searchQuery, allTags, selectedTags, photos);
  }, [searchQuery, selectedTags, allTags, photos, isFocused]);
  
  const hasSuggestions = Object.keys(suggestions).length > 0;
  
  // Handle tag selection
  const handleTagSelect = (tagId) => {
    if (selectedTags.includes(tagId)) {
      // Remove if already selected
      onTagsChange(selectedTags.filter(t => t !== tagId));
    } else {
      // Add if under limit
      if (selectedTags.length < maxTags) {
        onTagsChange([...selectedTags, tagId]);
      }
    }
    setSearchQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };
  
  // Handle tag removal
  const handleTagRemove = (tagId) => {
    onTagsChange(selectedTags.filter(t => t !== tagId));
  };
  
  // Get tag label by ID
  const getTagLabel = (tagId) => {
    const tag = allTags.find(t => t.id === tagId);
    return tag ? tag.label : tagId;
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!hasSuggestions) return;
    
    const allSuggestions = Object.values(suggestions).flatMap(group => group.tags);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < allSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleTagSelect(allSuggestions[highlightedIndex].id);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSearchQuery('');
    }
  };
  
  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <div style={styles.container}>
      <div style={styles.searchWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            ...styles.searchInput,
            ...(isFocused ? styles.searchInputFocused : {}),
          }}
        />
        <span style={styles.searchIcon}>🔍</span>
        
        {/* AI Suggestions Dropdown */}
        {isFocused && hasSuggestions && (
          <div ref={dropdownRef} style={styles.suggestionsDropdown}>
            <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid rgba(139, 30, 63, 0.1)' }}>
              <span style={styles.aiBadge}>
                ✨ AI Suggestions
              </span>
            </div>
            {Object.entries(suggestions).map(([category, group]) => (
              <div key={category} style={styles.suggestionGroup}>
                <div style={styles.suggestionGroupTitle}>
                  {group.icon} {category}
                </div>
                {group.tags.map((tag, index) => {
                  const globalIndex = Object.values(suggestions)
                    .slice(0, Object.keys(suggestions).indexOf(category))
                    .reduce((sum, g) => sum + g.tags.length, 0) + index;
                  const isHighlighted = globalIndex === highlightedIndex;
                  
                  return (
                    <div
                      key={tag.id}
                      style={{
                        ...styles.suggestionItem,
                        ...(isHighlighted ? styles.suggestionItemHover : {}),
                      }}
                      onMouseEnter={() => setHighlightedIndex(globalIndex)}
                      onClick={() => handleTagSelect(tag.id)}
                    >
                      <span style={styles.suggestionIcon}>
                        {selectedTags.includes(tag.id) ? '✓' : '○'}
                      </span>
                      <span style={styles.suggestionLabel}>{tag.label}</span>
                      <span style={styles.suggestionPath}>{tag.path}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        
        {isFocused && !hasSuggestions && searchQuery.length >= 2 && (
          <div ref={dropdownRef} style={styles.suggestionsDropdown}>
            <div style={styles.emptyState}>
              No tags found matching "{searchQuery}"
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div style={styles.selectedTags}>
          {selectedTags.map(tagId => (
            <div key={tagId} style={styles.selectedTag}>
              <span>{getTagLabel(tagId)}</span>
              <span
                style={styles.removeTag}
                onClick={() => handleTagRemove(tagId)}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.7}
              >
                ×
              </span>
            </div>
          ))}
          {selectedTags.length >= maxTags && (
            <div style={{
              ...styles.selectedTag,
              background: 'rgba(248, 81, 73, 0.1)',
              borderColor: 'rgba(248, 81, 73, 0.3)',
              color: '#f85149',
            }}>
              Maximum {maxTags} tags selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}

