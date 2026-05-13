import React, { useState } from 'react';
import { SERVICE_WEIGHTS, MODEL_ATTRIBUTES, AGENTIC_SCORES } from '../../matching/matchingEngine';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  
  // Info banner
  infoBanner: {
    background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(102,126,234,0.05))',
    border: '1px solid rgba(102,126,234,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#667eea',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  infoText: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.8',
  },
  
  // Tabs
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '2px solid rgba(255,255,255,0.1)',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s',
    position: 'relative',
    top: '2px',
  },
  tabActive: {
    color: '#e94560',
    borderBottomColor: '#e94560',
    fontWeight: '600',
  },
  
  // Section
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
    maxWidth: '900px',
  },
  
  // Score formula card
  formulaCard: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  formulaTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e94560',
    marginBottom: '1rem',
  },
  formula: {
    fontSize: '1.1rem',
    fontFamily: 'monospace',
    background: 'rgba(0,0,0,0.3)',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: '#fff',
    lineHeight: '1.8',
  },
  formulaBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  formulaComponent: {
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
  },
  formulaComponentLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
  },
  formulaComponentValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e94560',
  },
  
  // Table
  tableContainer: {
    overflowX: 'auto',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    background: 'rgba(233,69,96,0.1)',
    color: '#e94560',
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '600',
    borderBottom: '2px solid rgba(233,69,96,0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.8)',
  },
  tr: {
    transition: 'background 0.2s',
  },
  
  // Weight badges
  weightBadge: {
    display: 'inline-block',
    padding: '0.3rem 0.6rem',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.8rem',
    marginRight: '0.25rem',
    marginBottom: '0.25rem',
  },
  weightCritical: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
    border: '1px solid rgba(244,67,54,0.3)',
  },
  weightHigh: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    border: '1px solid rgba(76,175,80,0.3)',
  },
  weightMedium: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
    border: '1px solid rgba(255,193,7,0.3)',
  },
  weightLow: {
    background: 'rgba(255,152,0,0.2)',
    color: '#ff9800',
    border: '1px solid rgba(255,152,0,0.3)',
  },
  weightNeutral: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  
  // Card
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  
  // Score matrix
  matrixCell: {
    padding: '0.5rem',
    textAlign: 'center',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.85rem',
    minWidth: '50px',
  },
  score100: {
    background: 'rgba(76,175,80,0.3)',
    color: '#4caf50',
    border: '1px solid rgba(76,175,80,0.4)',
  },
  score75: {
    background: 'rgba(139,195,74,0.3)',
    color: '#8bc34a',
    border: '1px solid rgba(139,195,74,0.4)',
  },
  score50: {
    background: 'rgba(255,193,7,0.3)',
    color: '#ffc107',
    border: '1px solid rgba(255,193,7,0.4)',
  },
  score30: {
    background: 'rgba(255,152,0,0.3)',
    color: '#ff9800',
    border: '1px solid rgba(255,152,0,0.4)',
  },
  score0: {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.4)',
  },
  
  // Match type badges
  matchTypeBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.6rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    marginRight: '0.5rem',
  },
  matchDirect: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
  matchIndirect: {
    background: 'rgba(102,126,234,0.2)',
    color: '#667eea',
  },
  matchIfRequested: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  matchNoMatch: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.4)',
  },
};

function getWeightStyle(weight) {
  if (weight >= 1.5) return styles.weightCritical;
  if (weight >= 1.3) return styles.weightHigh;
  if (weight >= 1.0) return styles.weightMedium;
  if (weight >= 0.5) return styles.weightLow;
  return styles.weightNeutral;
}

function getScoreStyle(score) {
  if (score === 100) return styles.score100;
  if (score >= 75) return styles.score75;
  if (score >= 50) return styles.score50;
  if (score >= 30) return styles.score30;
  return styles.score0;
}

function getMatchTypeStyle(matchType) {
  switch(matchType) {
    case 'direct': return styles.matchDirect;
    case 'indirect': return styles.matchIndirect;
    case 'if_requested': return styles.matchIfRequested;
    default: return styles.matchNoMatch;
  }
}

export default function MatchCriteriaPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedService, setExpandedService] = useState(null);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Match Criteria & Algorithm ⚙️</h1>
        <p style={styles.subtitle}>
          Complete documentation of how the matching engine works. This algorithm combines physical attributes, 
          behavioral scores, location, and availability to find the perfect models for each request.
        </p>
      </div>

      {/* Info Banner */}
      <div style={styles.infoBanner}>
        <div style={styles.infoTitle}>
          <span>💡</span> How It Works
        </div>
        <div style={styles.infoText}>
          <strong>Final Score = (Attribute Match × 40%) + (Agentic Score × 35%) + (Location × 15%) + (Availability × 10%)</strong>
          <br />
          Each component is calculated independently, then weighted and combined. Scores range from 0-100, with 90+ being a "Perfect Match", 
          75-89 a "Strong Match", 50-74 a "Good Match", and below 50 typically not recommended.
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'overview', label: '📊 Overview & Formula' },
          { id: 'services', label: '💇 Service-Specific Rules' },
          { id: 'attributes', label: '🎨 Attribute Weights' },
          { id: 'agentic', label: '🧠 Agentic Learning' },
          { id: 'matrices', label: '📐 Scoring Matrices' },
        ].map(tab => (
          <button
            key={tab.id}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Score Calculation Formula</h2>
          <p style={styles.sectionDescription}>
            The matching engine uses a weighted multi-factor scoring system. Here's exactly how it works:
          </p>

          <div style={styles.formulaCard}>
            <div style={styles.formulaTitle}>Final Match Score Formula</div>
            <div style={styles.formula}>
              Final Score = <br />
              &nbsp;&nbsp;(Attribute Match × 0.40) +<br />
              &nbsp;&nbsp;(Agentic Score × 0.35) +<br />
              &nbsp;&nbsp;(Location Score × 0.15) +<br />
              &nbsp;&nbsp;(Availability Score × 0.10)
            </div>
            
            <div style={styles.formulaBreakdown}>
              <div style={styles.formulaComponent}>
                <div style={styles.formulaComponentLabel}>Attribute Match</div>
                <div style={styles.formulaComponentValue}>40%</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  Physical attributes (hair color, length, texture, etc.) matched against request requirements
                </div>
              </div>
              <div style={styles.formulaComponent}>
                <div style={styles.formulaComponentLabel}>Agentic Score</div>
                <div style={styles.formulaComponentValue}>35%</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  Dynamic behavioral scores (reliability, feedback, experience, engagement, compatibility)
                </div>
              </div>
              <div style={styles.formulaComponent}>
                <div style={styles.formulaComponentLabel}>Location Score</div>
                <div style={styles.formulaComponentValue}>15%</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  Proximity and travel convenience (same zip = 100, nearby = 70-90, far = 10-50)
                </div>
              </div>
              <div style={styles.formulaComponent}>
                <div style={styles.formulaComponentLabel}>Availability Score</div>
                <div style={styles.formulaComponentValue}>10%</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                  Schedule alignment (available at requested time = 100, flexible = 50-80)
                </div>
              </div>
            </div>
          </div>

          {/* Match Quality Labels */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Match Quality Interpretation</h3>
            <div style={styles.grid}>
              {[
                { range: '90-100', label: 'Perfect Match', desc: 'Excellent fit across all criteria. Highly recommended.', color: '#4caf50' },
                { range: '75-89', label: 'Strong Match', desc: 'Very good fit with minor variations. Recommended.', color: '#8bc34a' },
                { range: '50-74', label: 'Good Match', desc: 'Acceptable fit with some differences. Consider if needed.', color: '#ffc107' },
                { range: 'Below 50', label: 'Weak Match', desc: 'Not recommended - significant mismatches or dealbreakers.', color: '#ff9800' },
              ].map((label, idx) => (
                <div key={idx} style={{
                  ...styles.card,
                  borderColor: label.color,
                  borderWidth: '2px',
                  marginBottom: 0,
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: label.color, marginBottom: '0.5rem' }}>
                    {label.range}
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                    {label.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    {label.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Match Types */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Match Types Explained</h3>
            <div style={styles.grid}>
              <div style={styles.card}>
                <span style={{ ...styles.matchTypeBadge, ...styles.matchDirect }}>DIRECT</span>
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Must match exactly or very closely.</strong>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                    Used for: Hair Length, Services Available, Location, Allergies (dealbreaker)
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <span style={{ ...styles.matchTypeBadge, ...styles.matchIndirect }}>INDIRECT</span>
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Similar values can score partially.</strong>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                    Used for: Hair Color (blonde ≈ light brown), Hair Texture (wavy ≈ curly), Hair Density
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <span style={{ ...styles.matchTypeBadge, ...styles.matchIfRequested }}>IF REQUESTED</span>
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Only factors in if specifically requested.</strong>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                    Used for: Virgin Hair, Age Range, Skin Tone, Eye Color, Open to Change
                  </div>
                </div>
              </div>
              <div style={styles.card}>
                <span style={{ ...styles.matchTypeBadge, ...styles.matchNoMatch }}>NO MATCH</span>
                <div style={{ marginTop: '0.75rem' }}>
                  <strong>Not used for matching - profile only.</strong>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                    Used for: Name, Contact Info, Socials, Photos (viewed manually)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service-Specific Rules Tab */}
      {activeTab === 'services' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Service-Specific Weight Adjustments</h2>
          <p style={styles.sectionDescription}>
            Different services prioritize different attributes. The engine adjusts weights automatically based on service type. 
            Values &gt; 1.0 increase importance, &lt; 1.0 decrease it. This ensures color services prioritize hair condition, 
            while blowouts prioritize texture and length.
          </p>
          
          {Object.entries(SERVICE_WEIGHTS).map(([serviceId, config]) => (
            <div key={serviceId} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={styles.cardTitle}>
                  {serviceId === 'blowdry' ? '💨 Blowout' :
                   serviceId === 'highlights' ? '✨ Highlights' :
                   serviceId.charAt(0).toUpperCase() + serviceId.slice(1)}
                </h3>
                <button
                  onClick={() => setExpandedService(expandedService === serviceId ? null : serviceId)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'rgba(233,69,96,0.2)',
                    border: '1px solid rgba(233,69,96,0.3)',
                    borderRadius: '6px',
                    color: '#e94560',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  {expandedService === serviceId ? '▼ Hide Details' : '▶ Show Details'}
                </button>
              </div>
              
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                {config.description}
              </div>

              {expandedService === serviceId && (
                <div>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#e94560' }}>
                      Attribute Multipliers:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {Object.entries(config.attributeMultipliers || {}).map(([attr, weight]) => (
                        <span key={attr} style={getWeightStyle(weight)}>
                          {attr.replace(/([A-Z])/g, ' $1').trim()}: {weight.toFixed(1)}x
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#667eea' }}>
                      Agentic Score Multipliers:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {Object.entries(config.agenticMultipliers || {}).map(([metric, weight]) => (
                        <span key={metric} style={getWeightStyle(weight)}>
                          {metric.charAt(0).toUpperCase() + metric.slice(1)}: {weight.toFixed(1)}x
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Attribute Weights Tab */}
      {activeTab === 'attributes' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Model Attribute Configuration</h2>
          <p style={styles.sectionDescription}>
            How each model attribute is configured for matching. Each attribute has a match type, base weight, 
            and optional scoring matrices for partial matches.
          </p>
          
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Attribute</th>
                  <th style={styles.th}>Match Type</th>
                  <th style={styles.th}>Base Weight</th>
                  <th style={styles.th}>Options/Description</th>
                  <th style={styles.th}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(MODEL_ATTRIBUTES).filter(([key, config]) => 
                  config.matchType !== 'no_match' && !['firstName', 'lastName', 'contact', 'socials', 'somethingFun', 'photos'].includes(key)
                ).map(([key, config]) => (
                  <tr key={key} style={styles.tr}>
                    <td style={styles.td}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.matchTypeBadge, ...getMatchTypeStyle(config.matchType) }}>
                        {config.matchType?.toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {config.weight ? (
                        <span style={getWeightStyle(config.weight / 10)}>
                          {config.weight}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td style={styles.td}>
                      {config.options ? (
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                          {config.options.join(', ')}
                        </div>
                      ) : config.label || 'N/A'}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                        {config.isDealbreaker && '⚠️ Dealbreaker'}
                        {config.scoreMatrix && '📐 Has scoring matrix'}
                        {config.similarityGroups && '🔗 Has similarity groups'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agentic Learning Tab */}
      {activeTab === 'agentic' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Agentic Learning Scores</h2>
          <p style={styles.sectionDescription}>
            These scores evolve over time based on model behavior. They reward good behavior and help identify the best models. 
            Each score is calculated from multiple factors and contributes to the final agentic score (35% of total match score).
          </p>

          {Object.entries(AGENTIC_SCORES).map(([scoreType, config]) => (
            <div key={scoreType} style={styles.card}>
              <h3 style={styles.cardTitle}>
                {scoreType.charAt(0).toUpperCase() + scoreType.slice(1)} Score
                <span style={{ 
                  marginLeft: '0.5rem', 
                  fontSize: '0.85rem', 
                  color: '#e94560',
                  fontWeight: 'normal' 
                }}>
                  ({Math.round(config.weight * 100)}% of agentic score)
                </span>
              </h3>
              
              <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                {scoreType === 'reliability' && 'Measures consistency and dependability. Tracks show-up rate, punctuality, cancellations, and response time.'}
                {scoreType === 'feedback' && 'Average ratings from professionals after appointments. Includes cooperation, communication, professionalism, and photo quality.'}
                {scoreType === 'experience' && 'Platform tenure and service variety. Rewards models with more bookings and diverse service experience.'}
                {scoreType === 'engagement' && 'Profile quality and activity. Measures profile completeness, photo count, response rate, and recent activity.'}
                {scoreType === 'compatibility' && 'Dynamic per request. Measures historical success with similar requests, same professionals, and service types.'}
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Factor</th>
                      <th style={styles.th}>Weight</th>
                      <th style={styles.th}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(config.factors || {}).map(([factor, factorConfig]) => (
                      <tr key={factor} style={styles.tr}>
                        <td style={styles.td}>
                          <strong>{factor.replace(/([A-Z])/g, ' $1').trim()}</strong>
                        </td>
                        <td style={styles.td}>
                          <span style={getWeightStyle(factorConfig.weight)}>
                            {Math.round(factorConfig.weight * 100)}%
                          </span>
                        </td>
                        <td style={styles.td}>
                          {factorConfig.description || 'N/A'}
                          {factorConfig.tiers && (
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
                              Tiers: {factorConfig.tiers.map(t => `${t.label} (${t.min}-${t.max === Infinity ? '∞' : t.max})`).join(', ')}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {config.minBookingsRequired && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  background: 'rgba(255,193,7,0.1)', 
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}>
                  ⚠️ Requires {config.minBookingsRequired}+ bookings before score is reliable. 
                  {config.decayRate && ` Score decays ${Math.round(config.decayRate * 100)}% per month of inactivity.`}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scoring Matrices Tab */}
      {activeTab === 'matrices' && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Attribute Matching Matrices</h2>
          <p style={styles.sectionDescription}>
            How attribute matches are scored. Exact matches get 100 points, similar values get partial scores based on these matrices.
          </p>

          <div style={styles.grid}>
            {/* Hair Length Matrix */}
            {MODEL_ATTRIBUTES.hairLength?.scoreMatrix && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Hair Length Matching</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Pro Needs</th>
                        {Object.keys(MODEL_ATTRIBUTES.hairLength.scoreMatrix.short || {}).map(len => (
                          <th key={len} style={styles.th}>{len.replace('_', ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(MODEL_ATTRIBUTES.hairLength.scoreMatrix).map(([needed, scores]) => (
                        <tr key={needed} style={styles.tr}>
                          <td style={styles.td}><strong>{needed.replace('_', ' ')}</strong></td>
                          {Object.entries(scores).map(([has, score]) => (
                            <td key={has} style={styles.td}>
                              <span style={{ ...styles.matrixCell, ...getScoreStyle(score) }}>
                                {score}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Hair Texture Matrix */}
            {MODEL_ATTRIBUTES.hairTexture?.scoreMatrix && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Hair Texture Matching</h3>
                <div style={styles.tableContainer}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Pro Needs</th>
                        {Object.keys(MODEL_ATTRIBUTES.hairTexture.scoreMatrix.straight || {}).map(tex => (
                          <th key={tex} style={styles.th}>{tex}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(MODEL_ATTRIBUTES.hairTexture.scoreMatrix).map(([needed, scores]) => (
                        <tr key={needed} style={styles.tr}>
                          <td style={styles.td}><strong>{needed}</strong></td>
                          {Object.entries(scores).map(([has, score]) => (
                            <td key={has} style={styles.td}>
                              <span style={{ ...styles.matrixCell, ...getScoreStyle(score) }}>
                                {score}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Hair Color Similarity */}
          {MODEL_ATTRIBUTES.hairColor?.similarityGroups && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Hair Color Similarity Groups</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
                Colors within the same group score 70 points when matched. Exact matches score 100.
              </p>
              <div style={styles.grid}>
                {MODEL_ATTRIBUTES.hairColor.similarityGroups.map((group, idx) => (
                  <div key={idx} style={styles.card}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Group {idx + 1}</div>
                    <div style={{ fontSize: '0.9rem' }}>
                      {group.join(', ')}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span style={styles.weightMedium}>70 points within group</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
