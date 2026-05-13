import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { verifyModelProfile, verifyProfessional, verifyPartner } from '../../utils/onboardingVerification';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '2px solid rgba(139, 30, 63, 0.2)',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
  },
  section: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    color: '#4A2A1A',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.3s ease',
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
  },
  secondaryButton: {
    background: 'transparent',
    border: '2px solid #8B1E3F',
    color: '#8B1E3F',
  },
  resultBox: {
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    whiteSpace: 'pre-wrap',
    maxHeight: '400px',
    overflow: 'auto',
  },
  success: {
    color: '#4caf50',
    fontWeight: '600',
  },
  error: {
    color: '#f44336',
    fontWeight: '600',
  },
  warning: {
    color: '#ff9800',
    fontWeight: '600',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0.5rem 0',
  },
  listItem: {
    padding: '0.5rem',
    marginBottom: '0.25rem',
    background: 'rgba(139, 30, 63, 0.05)',
    borderRadius: '4px',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: 'rgba(139, 30, 63, 0.05)',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid rgba(139, 30, 63, 0.1)',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#8B1E3F',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    marginTop: '0.25rem',
  },
};

export default function OnboardingTestPage() {
  const { user } = useAuthenticator();
  const [loading, setLoading] = useState(false);
  [results, setResults] = useState(null);
  const [stats, setStats] = useState(null);
  const [userId, setUserId] = useState('');

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get counts
      const [models, professionals, partners] = await Promise.all([
        client.models.ModelProfile.list({ limit: 1000 }),
        client.models.Professional.list({ limit: 1000 }),
        client.models.Partner.list({ limit: 1000 }),
      ]);

      const modelData = models.data || [];
      const professionalData = professionals.data || [];
      const partnerData = partners.data || [];

      setStats({
        totalModels: modelData.length,
        pendingModels: modelData.filter(m => m.status === 'pending').length,
        approvedModels: modelData.filter(m => m.status === 'approved').length,
        totalProfessionals: professionalData.length,
        pendingProfessionals: professionalData.filter(p => p.status === 'pending').length,
        approvedProfessionals: professionalData.filter(p => p.status === 'approved').length,
        totalPartners: partnerData.length,
        pendingPartners: partnerData.filter(p => p.status === 'pending').length,
        approvedPartners: partnerData.filter(p => p.status === 'approved').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testModelOnboarding = async () => {
    if (!userId) {
      setResults({ error: 'Please enter a user ID' });
      return;
    }

    try {
      setLoading(true);
      const result = await verifyModelProfile(userId);
      setResults({ type: 'model', ...result });
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testProfessionalOnboarding = async () => {
    if (!userId) {
      setResults({ error: 'Please enter a user ID' });
      return;
    }

    try {
      setLoading(true);
      const result = await verifyProfessional(userId);
      setResults({ type: 'professional', ...result });
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testPartnerOnboarding = async () => {
    if (!userId) {
      setResults({ error: 'Please enter a user ID' });
      return;
    }

    try {
      setLoading(true);
      const result = await verifyPartner(userId);
      setResults({ type: 'partner', ...result });
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testAllOnboarding = async () => {
    try {
      setLoading(true);
      const results = {
        models: [],
        professionals: [],
        partners: [],
      };

      // Get all profiles
      const [models, professionals, partners] = await Promise.all([
        client.models.ModelProfile.list({ limit: 100 }),
        client.models.Professional.list({ limit: 100 }),
        client.models.Partner.list({ limit: 100 }),
      ]);

      // Verify each model
      for (const model of models.data || []) {
        try {
          const result = await verifyModelProfile(model.userId);
          results.models.push({ userId: model.userId, ...result });
        } catch (error) {
          results.models.push({ userId: model.userId, error: error.message });
        }
      }

      // Verify each professional
      for (const professional of professionals.data || []) {
        try {
          const result = await verifyProfessional(professional.userId);
          results.professionals.push({ userId: professional.userId, ...result });
        } catch (error) {
          results.professionals.push({ userId: professional.userId, error: error.message });
        }
      }

      // Verify each partner
      for (const partner of partners.data || []) {
        try {
          const result = await verifyPartner(partner.userId);
          results.partners.push({ userId: partner.userId, ...result });
        } catch (error) {
          results.partners.push({ userId: partner.userId, error: error.message });
        }
      }

      setResults({ type: 'all', results });
    } catch (error) {
      setResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Onboarding Verification & Testing</h1>
        <p style={{ color: '#5A3A2A' }}>
          Test and verify onboarding forms are correctly saving data to the database.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Onboarding Statistics</h2>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalModels}</div>
              <div style={styles.statLabel}>Total Models</div>
              <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem' }}>
                {stats.pendingModels} pending, {stats.approvedModels} approved
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalProfessionals}</div>
              <div style={styles.statLabel}>Total Professionals</div>
              <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem' }}>
                {stats.pendingProfessionals} pending, {stats.approvedProfessionals} approved
              </div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.totalPartners}</div>
              <div style={styles.statLabel}>Total Partners</div>
              <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.5rem' }}>
                {stats.pendingPartners} pending, {stats.approvedPartners} approved
              </div>
            </div>
          </div>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={loadStats}
            disabled={loading}
          >
            Refresh Stats
          </button>
        </div>
      )}

      {/* Individual Testing */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Test Individual Profile</h2>
        <input
          type="text"
          placeholder="Enter User ID (userId from Cognito)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={styles.input}
        />
        <div>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={testModelOnboarding}
            disabled={loading || !userId}
          >
            Test Model Profile
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={testProfessionalOnboarding}
            disabled={loading || !userId}
          >
            Test Professional Profile
          </button>
          <button
            style={{ ...styles.button, ...styles.primaryButton }}
            onClick={testPartnerOnboarding}
            disabled={loading || !userId}
          >
            Test Partner Profile
          </button>
        </div>
      </div>

      {/* Bulk Testing */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Bulk Verification</h2>
        <p style={{ color: '#5A3A2A', marginBottom: '1rem' }}>
          Verify all onboarding profiles in the database (first 100 of each type).
        </p>
        <button
          style={{ ...styles.button, ...styles.secondaryButton }}
          onClick={testAllOnboarding}
          disabled={loading}
        >
          Verify All Profiles
        </button>
      </div>

      {/* Results */}
      {results && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Results</h2>
          <div style={styles.resultBox}>
            {results.error ? (
              <div style={styles.error}>Error: {results.error}</div>
            ) : results.type === 'all' ? (
              <div>
                <h3 style={{ color: '#8B1E3F' }}>Bulk Verification Results</h3>
                <div>
                  <h4>Models ({results.results.models.length})</h4>
                  <ul style={styles.list}>
                    {results.results.models.map((r, i) => (
                      <li key={i} style={styles.listItem}>
                        <strong>{r.userId}:</strong>{' '}
                        {r.valid ? (
                          <span style={styles.success}>✓ Valid</span>
                        ) : (
                          <span style={styles.error}>✗ {r.error}</span>
                        )}
                        {r.warnings && (
                          <div style={styles.warning}>
                            Warnings: {r.warnings.join(', ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Professionals ({results.results.professionals.length})</h4>
                  <ul style={styles.list}>
                    {results.results.professionals.map((r, i) => (
                      <li key={i} style={styles.listItem}>
                        <strong>{r.userId}:</strong>{' '}
                        {r.valid ? (
                          <span style={styles.success}>✓ Valid</span>
                        ) : (
                          <span style={styles.error}>✗ {r.error}</span>
                        )}
                        {r.warnings && (
                          <div style={styles.warning}>
                            Warnings: {r.warnings.join(', ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Partners ({results.results.partners.length})</h4>
                  <ul style={styles.list}>
                    {results.results.partners.map((r, i) => (
                      <li key={i} style={styles.listItem}>
                        <strong>{r.userId}:</strong>{' '}
                        {r.valid ? (
                          <span style={styles.success}>✓ Valid</span>
                        ) : (
                          <span style={styles.error}>✗ {r.error}</span>
                        )}
                        {r.warnings && (
                          <div style={styles.warning}>
                            Warnings: {r.warnings.join(', ')}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div>
                {results.valid ? (
                  <div>
                    <div style={styles.success}>✓ Profile is valid!</div>
                    {results.warnings && (
                      <div style={styles.warning}>
                        <strong>Warnings:</strong>
                        <ul style={styles.list}>
                          {results.warnings.map((w, i) => (
                            <li key={i} style={styles.listItem}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <pre style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                      {JSON.stringify(results[results.type === 'model' ? 'profile' : results.type === 'professional' ? 'professional' : 'partner'], null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div style={styles.error}>
                    ✗ Profile validation failed: {results.error}
                    {results[results.type === 'model' ? 'profile' : results.type === 'professional' ? 'professional' : 'partner'] && (
                      <pre style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                        {JSON.stringify(results[results.type === 'model' ? 'profile' : results.type === 'professional' ? 'professional' : 'partner'], null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#5A3A2A' }}>
          Loading...
        </div>
      )}
    </div>
  );
}

