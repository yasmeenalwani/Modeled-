import React from 'react';
import { handleDuplicateEmailError } from '../utils/authUtils';

/**
 * ErrorHandler Component
 * 
 * Displays user-friendly error messages for authentication errors
 */
export default function ErrorHandler({ error, onDismiss }) {
  if (!error) return null;

  const duplicateEmailMessage = handleDuplicateEmailError(error);
  const displayMessage = duplicateEmailMessage || error.message || 'An error occurred. Please try again.';

  return (
    <div style={{
      padding: '1rem',
      marginBottom: '1rem',
      background: 'rgba(220, 53, 69, 0.1)',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      borderRadius: '8px',
      color: '#721c24',
      fontFamily: '"Alike", "Georgia", serif',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <span>{displayMessage}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#721c24',
            cursor: 'pointer',
            fontSize: '1.2rem',
            padding: '0 0.5rem',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

