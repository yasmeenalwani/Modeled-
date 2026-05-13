/**
 * ERROR BOUNDARY COMPONENT
 * 
 * Catches React component errors and displays a fallback UI
 * Prevents the entire app from crashing
 */

import React from 'react';
import { logError } from '../utils/errorHandling';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    textAlign: 'center',
    background: '#FFFEF9',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#8B1E3F',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  message: {
    fontSize: '1.1rem',
    color: '#4A2A1A',
    marginBottom: '2rem',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.6,
  },
  errorDetails: {
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left',
    maxWidth: '600px',
    width: '100%',
  },
  errorText: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  buttonSecondary: {
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    color: '#4A2A1A',
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to error tracking service
    logError(error, 'ErrorBoundary', {
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo } = this.state;
      const { fallback: Fallback, showDetails = false } = this.props;

      if (Fallback) {
        return <Fallback error={error} resetError={this.handleReset} />;
      }

      return (
        <div style={styles.container}>
          <div style={styles.title}>Something went wrong</div>
          <div style={styles.message}>
            We encountered an unexpected error. Don't worry, your data is safe.
            Please try reloading the page or contact support if the problem persists.
          </div>

          {showDetails && error && (
            <div style={styles.errorDetails}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#8B1E3F' }}>
                Error Details:
              </div>
              <div style={styles.errorText}>
                {error.toString()}
                {errorInfo?.componentStack && (
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                    {errorInfo.componentStack}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={styles.actions}>
            <button
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={this.handleReload}
            >
              Reload Page
            </button>
            <button
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={this.handleReset}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
