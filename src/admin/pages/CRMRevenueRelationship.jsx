import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    background: '#0d0d14',
    color: '#fff',
    minHeight: '100vh',
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
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  section: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  prospectCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  prospectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '0.5rem',
  },
  prospectName: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  revenueBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: '#50e3c220',
    color: '#50e3c2',
  },
  relationshipBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    marginBottom: '1rem',
  },
  btn: {
    padding: '0.5rem 1rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '8px',
    color: '#e94560',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};

const getRelationshipColor = (strength) => {
  const colors = {
    cold: '#4a90e2',
    warm: '#f5a623',
    hot: '#e94560',
    partner: '#7ed321',
    advocate: '#50e3c2',
  };
  return colors[strength] || '#666';
};

export default function CRMRevenueRelationship() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDeals: 0,
    avgDealSize: 0,
    lifetimeValue: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data, errors } = await client.models.Prospect.list({
        limit: 1000,
      });
      if (errors) throw new Error(errors[0]?.message);
      
      const prospectsData = data || [];
      setProspects(prospectsData);
      
      // Calculate stats
      const totalRevenue = prospectsData.reduce((sum, p) => sum + (p.actualRevenue || 0), 0);
      const totalDeals = prospectsData.reduce((sum, p) => sum + (p.dealsClosed || 0), 0);
      const avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;
      const lifetimeValue = prospectsData.reduce((sum, p) => sum + (p.lifetimeValue || 0), 0);
      
      setStats({
        totalRevenue,
        totalDeals,
        avgDealSize,
        lifetimeValue,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRevenue = async (prospectId, revenue) => {
    try {
      const prospect = prospects.find(p => p.id === prospectId);
      const newRevenue = parseFloat(revenue) || 0;
      const newActualRevenue = (prospect.actualRevenue || 0) + newRevenue;
      const newDealsClosed = (prospect.dealsClosed || 0) + 1;
      const newAvgDealSize = newDealsClosed > 0 ? newActualRevenue / newDealsClosed : 0;
      
      await client.models.Prospect.update({
        id: prospectId,
        actualRevenue: newActualRevenue,
        dealsClosed: newDealsClosed,
        averageDealSize: newAvgDealSize,
        lifetimeValue: newActualRevenue, // Simple: actual revenue = LTV for now
      });
      
      alert('✅ Revenue updated!');
      loadData();
    } catch (error) {
      console.error('Error updating revenue:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUpdateRelationship = async (prospectId, strength) => {
    try {
      await client.models.Prospect.update({
        id: prospectId,
        relationshipStrength: strength,
      });
      
      alert('✅ Relationship updated!');
      loadData();
    } catch (error) {
      console.error('Error updating relationship:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const topRevenueProspects = [...prospects]
    .filter(p => (p.actualRevenue || 0) > 0)
    .sort((a, b) => (b.actualRevenue || 0) - (a.actualRevenue || 0))
    .slice(0, 10);

  const topRelationshipProspects = [...prospects]
    .filter(p => p.relationshipStrength && p.relationshipStrength !== 'cold')
    .sort((a, b) => {
      const order = { cold: 0, warm: 1, hot: 2, partner: 3, advocate: 4 };
      return (order[b.relationshipStrength] || 0) - (order[a.relationshipStrength] || 0);
    })
    .slice(0, 10);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Revenue & Relationships 💰🤝</h1>
        <p style={styles.subtitle}>Track revenue and build relationships</p>
      </div>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${stats.totalRevenue.toLocaleString()}</div>
          <div style={styles.statLabel}>Total Revenue</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.totalDeals}</div>
          <div style={styles.statLabel}>Total Deals Closed</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${stats.avgDealSize.toLocaleString()}</div>
          <div style={styles.statLabel}>Avg Deal Size</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>${stats.lifetimeValue.toLocaleString()}</div>
          <div style={styles.statLabel}>Lifetime Value</div>
        </div>
      </div>

      {/* Top Revenue Prospects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Top Revenue Prospects</h2>
        {topRevenueProspects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
            No revenue tracked yet. Start closing deals!
          </div>
        ) : (
          topRevenueProspects.map(prospect => (
            <div key={prospect.id} style={styles.prospectCard}>
              <div style={styles.prospectHeader}>
                <div>
                  <div style={styles.prospectName}>
                    {prospect.firstName} {prospect.lastName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    {prospect.company || 'No company'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={styles.revenueBadge}>
                    ${(prospect.actualRevenue || 0).toLocaleString()}
                  </div>
                  <div style={{
                    ...styles.relationshipBadge,
                    background: `${getRelationshipColor(prospect.relationshipStrength || 'cold')}20`,
                    color: getRelationshipColor(prospect.relationshipStrength || 'cold'),
                  }}>
                    {prospect.relationshipStrength?.toUpperCase() || 'COLD'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                {prospect.dealsClosed || 0} deals • ${(prospect.averageDealSize || 0).toLocaleString()} avg
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input
                  type="number"
                  style={{ ...styles.input, width: '150px', marginBottom: 0 }}
                  placeholder="Add revenue"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateRevenue(prospect.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <select
                  style={{ ...styles.input, width: '150px', marginBottom: 0 }}
                  value={prospect.relationshipStrength || 'cold'}
                  onChange={(e) => handleUpdateRelationship(prospect.id, e.target.value)}
                >
                  <option value="cold">Cold</option>
                  <option value="warm">Warm</option>
                  <option value="hot">Hot</option>
                  <option value="partner">Partner</option>
                  <option value="advocate">Advocate</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Top Relationship Prospects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Strongest Relationships</h2>
        {topRelationshipProspects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
            No relationships tracked yet. Start building connections!
          </div>
        ) : (
          topRelationshipProspects.map(prospect => (
            <div key={prospect.id} style={styles.prospectCard}>
              <div style={styles.prospectHeader}>
                <div>
                  <div style={styles.prospectName}>
                    {prospect.firstName} {prospect.lastName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                    {prospect.company || 'No company'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {(prospect.actualRevenue || 0) > 0 && (
                    <div style={styles.revenueBadge}>
                      ${(prospect.actualRevenue || 0).toLocaleString()}
                    </div>
                  )}
                  <div style={{
                    ...styles.relationshipBadge,
                    background: `${getRelationshipColor(prospect.relationshipStrength || 'cold')}20`,
                    color: getRelationshipColor(prospect.relationshipStrength || 'cold'),
                  }}>
                    {prospect.relationshipStrength?.toUpperCase() || 'COLD'}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                {prospect.interactionCount || 0} interactions • {prospect.meetingCount || 0} meetings
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

