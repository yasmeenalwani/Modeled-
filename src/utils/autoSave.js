/**
 * Auto-Save Utility
 * 
 * Automatically saves form data to localStorage
 * Restores on page load
 */

const STORAGE_PREFIX = 'modeled_draft_';

/**
 * Save form data to localStorage
 */
export function saveDraft(formId, data) {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    const timestamp = new Date().toISOString();
    const draft = {
      data,
      timestamp,
      version: '1.0',
    };
    localStorage.setItem(key, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

/**
 * Load draft from localStorage
 */
export function loadDraft(formId) {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    
    const draft = JSON.parse(stored);
    
    // Check if draft is older than 7 days
    const draftDate = new Date(draft.timestamp);
    const now = new Date();
    const daysDiff = (now - draftDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      // Draft expired, remove it
      localStorage.removeItem(key);
      return null;
    }
    
    return draft.data;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
}

/**
 * Clear draft from localStorage
 */
export function clearDraft(formId) {
  try {
    const key = `${STORAGE_PREFIX}${formId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error clearing draft:', error);
    return false;
  }
}

/**
 * Get all drafts
 */
export function getAllDrafts() {
  const drafts = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const formId = key.replace(STORAGE_PREFIX, '');
        const draft = loadDraft(formId);
        if (draft) {
          drafts.push({ formId, ...draft });
        }
      }
    }
  } catch (error) {
    console.error('Error getting all drafts:', error);
  }
  return drafts;
}

/**
 * Auto-save helper (use in useEffect in component)
 * This is a helper function, not a hook, to avoid React dependency in utils
 */
export function setupAutoSave(formId, data, debounceMs = 1000, onSaved = null) {
  let timeoutId = null;
  
  // Clear existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  
  // Set new timeout
  timeoutId = setTimeout(() => {
    if (data && Object.keys(data).length > 0) {
      const saved = saveDraft(formId, data);
      if (saved && onSaved) {
        onSaved(new Date());
      }
    }
  }, debounceMs);
  
  // Return cleanup function
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}

