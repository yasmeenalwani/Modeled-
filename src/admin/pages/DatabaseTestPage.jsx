import React, { useState } from 'react';
import { runAllDatabaseTests, testModelProfileCRUD, testProfessionalCRUD, testAuthorizationRules } from '../../utils/databaseUtils';

/**
 * Database Test Page
 * 
 * Admin page for testing CRUD operations and authorization rules
 */
export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await runAllDatabaseTests();
      setTestResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runModelProfileTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testModelProfileCRUD();
      setTestResults({ modelProfile: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runProfessionalTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testProfessionalCRUD();
      setTestResults({ professional: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const runAuthorizationTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await testAuthorizationRules();
      setTestResults({ authorization: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      background: '#FFFEF9',
      minHeight: '100vh',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '600',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    button: {
      padding: '0.75rem 1.5rem',
      margin: '0.5rem',
      borderRadius: '8px',
      border: 'none',
      background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
      color: '#FFFEF9',
      cursor: 'pointer',
      fontFamily: '"Alike", "Georgia", serif',
      fontSize: '0.9rem',
      fontWeight: '600',
    },
    results: {
      marginTop: '2rem',
      padding: '1.5rem',
      background: '#FFFEF9',
      border: '1px solid rgba(139, 30, 63, 0.2)',
      borderRadius: '12px',
    },
    resultItem: {
      marginBottom: '1rem',
      padding: '1rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '8px',
    },
    success: {
      color: '#4caf50',
    },
    failure: {
      color: '#e94560',
    },
    error: {
      padding: '1rem',
      background: 'rgba(220, 53, 69, 0.1)',
      border: '1px solid rgba(220, 53, 69, 0.3)',
      borderRadius: '8px',
      color: '#721c24',
      marginTop: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Database Integration Tests</h1>
        <p style={{ color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
          Test CRUD operations and authorization rules for database entities
        </p>
      </div>

      <div>
        <button style={styles.button} onClick={runTests} disabled={loading}>
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <button style={styles.button} onClick={runModelProfileTest} disabled={loading}>
          Test ModelProfile CRUD
        </button>
        <button style={styles.button} onClick={runProfessionalTest} disabled={loading}>
          Test Professional CRUD
        </button>
        <button style={styles.button} onClick={runAuthorizationTest} disabled={loading}>
          Test Authorization Rules
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {testResults && (
        <div style={styles.results}>
          <h2 style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>Test Results</h2>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '1rem', 
            borderRadius: '8px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}>
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

