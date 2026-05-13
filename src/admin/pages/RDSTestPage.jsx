import React, { useState } from 'react';

/**
 * RDS Test Page
 * 
 * Tests RDS PostgreSQL connection and queries from the admin portal
 * 
 * Note: This page requires the analytics-api Lambda function to be accessible
 * via API Gateway or a proxy endpoint. For now, use the PowerShell scripts
 * to test RDS connection directly.
 */
export default function RDSTestPage() {
  const [testResults, setTestResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: '"Inter", system-ui, sans-serif',
    },
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#fff',
    },
    subtitle: {
      fontSize: '0.9rem',
      color: 'rgba(255,255,255,0.6)',
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: '0.9rem',
      fontWeight: '500',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
    },
    buttonPrimary: {
      background: '#e94560',
      color: '#fff',
    },
    buttonSecondary: {
      background: 'rgba(255,255,255,0.1)',
      color: '#fff',
    },
    resultsContainer: {
      marginTop: '2rem',
      padding: '1.5rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      border: '1px solid rgba(255,255,255,0.1)',
    },
    resultSection: {
      marginBottom: '1.5rem',
    },
    resultTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#fff',
    },
    resultContent: {
      background: 'rgba(0,0,0,0.3)',
      padding: '1rem',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      color: '#fff',
      overflowX: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
    success: {
      color: '#4caf50',
    },
    error: {
      color: '#f44336',
    },
    loading: {
      color: '#ffa726',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '1rem',
    },
    tableHeader: {
      background: 'rgba(255,255,255,0.1)',
      padding: '0.75rem',
      textAlign: 'left',
      fontWeight: '600',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    tableCell: {
      padding: '0.75rem',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
  };

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    setTestResults(null);

    try {
      // Call the analytics-api Lambda function
      // Note: This requires the Lambda function to be deployed and accessible
      // For now, we'll use a direct Lambda invocation pattern
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'testConnection',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseBody = await response.json();

      setTestResults({
        test: 'Connection Test',
        success: responseBody.success !== false,
        data: responseBody,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message || 'Connection test failed');
      setTestResults({
        test: 'Connection Test',
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testQuery = async (queryName) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: queryName,
          params: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseBody = await response.json();

      setTestResults({
        test: queryName,
        success: responseBody.success !== false,
        data: responseBody,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message || `Query ${queryName} failed`);
      setTestResults({
        test: queryName,
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testSimpleQuery = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Test a simple SELECT query
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'executeQuery',
          params: {
            query: 'SELECT NOW() as current_time, version() as postgres_version;',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseBody = await response.json();

      setTestResults({
        test: 'Simple Query Test',
        success: responseBody.success !== false,
        data: responseBody,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.message || 'Simple query test failed');
      setTestResults({
        test: 'Simple Query Test',
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>RDS PostgreSQL Test</h1>
        <p style={styles.subtitle}>
          Test RDS connection and run analytics queries. Make sure RDS is set up and Lambda function is configured.
        </p>
      </div>

      <div>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={testConnection}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Connection'}
        </button>

        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={testSimpleQuery}
          disabled={isLoading}
        >
          {isLoading ? 'Running...' : 'Test Simple Query'}
        </button>

        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={() => testQuery('getRevenueByMonth')}
          disabled={isLoading}
        >
          Test Revenue Query
        </button>

        <button
          style={{ ...styles.button, ...styles.buttonSecondary }}
          onClick={() => testQuery('getServicePerformance')}
          disabled={isLoading}
        >
          Test Service Performance
        </button>
      </div>

      {error && (
        <div style={{ ...styles.resultsContainer, ...styles.error }}>
          <div style={styles.resultTitle}>Error</div>
          <div style={styles.resultContent}>{error}</div>
        </div>
      )}

      {testResults && (
        <div style={styles.resultsContainer}>
          <div style={styles.resultSection}>
            <div style={styles.resultTitle}>
              {testResults.test}
              <span style={{ marginLeft: '1rem', ...(testResults.success ? styles.success : styles.error) }}>
                {testResults.success ? '✓ Success' : '✗ Failed'}
              </span>
            </div>
            <div style={styles.resultContent}>
              {testResults.success ? (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Timestamp:</strong> {testResults.timestamp}
                  </div>
                  <div>
                    <strong>Response:</strong>
                    <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(testResults.data, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Error:</strong> {testResults.error}
                  </div>
                  <div>
                    <strong>Timestamp:</strong> {testResults.timestamp}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ ...styles.resultsContainer, marginTop: '2rem', background: 'rgba(255,255,255,0.03)' }}>
        <div style={styles.resultTitle}>Setup Instructions</div>
        <div style={{ ...styles.resultContent, background: 'transparent', padding: 0 }}>
          <ol style={{ lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>Run <code>scripts/setup-rds-postgres.ps1</code> to create the RDS instance</li>
            <li>Run <code>scripts/initialize-rds-schema.ps1</code> to initialize the schema</li>
            <li>Run <code>scripts/update-lambda-env.ps1</code> to configure Lambda environment variables</li>
            <li>Run <code>scripts/test-rds-connection.ps1</code> to verify the connection</li>
            <li>Use this page to test queries from the admin portal</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

