import React, { useState, useMemo, useEffect } from 'react';
import { 
  getWaitlistEntries, 
  getWaitlistByRequestId,
  promoteFromWaitlist,
  removeFromWaitlist,
  getWaitlistStats,
} from '../../utils/waitlistApi';
import { getServiceById } from '../data/services';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
  },
  
  // Stats
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
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '0.5rem',
  },
  filterInput: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  
  // Table
  table: {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 100px',
    gap: '1rem',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 120px 100px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background 0.2s ease',
  },
  tableCell: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.9)',
  },
  positionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  modelInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  modelName: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  modelEmail: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  requestInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  requestService: {
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  requestDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
  },
  scoreBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    background: 'rgba(88,166,255,0.2)',
    color: '#58a6ff',
  },
  timeInfo: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.7)',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  btnPromote: {
    background: '#4caf50',
    color: '#fff',
  },
  btnRemove: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.7)',
  },
  
  // Grouped by Request
  requestGroup: {
    marginBottom: '2rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  requestGroupHeader: {
    padding: '1.5rem',
    background: 'rgba(0,0,0,0.2)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestGroupTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  requestGroupMeta: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  requestGroupActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

export default function WaitlistPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'flat'
  const [filterRequestId, setFilterRequestId] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    uniqueRequests: 0,
    averageWaitlistSize: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWaitlistEntries({ status: 'waitlist' });
      setEntries(data);
      
      const waitlistStats = await getWaitlistStats();
      setStats(waitlistStats);
    } catch (error) {
      console.error('Error loading waitlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (requestId) => {
    if (!confirm('Promote the first model from waitlist to active booking?')) {
      return;
    }
    
    try {
      const result = await promoteFromWaitlist(requestId);
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Error promoting from waitlist:', error);
      alert('Error promoting from waitlist. Please try again.');
    }
  };

  const handleRemove = async (matchId) => {
    if (!confirm('Remove this model from the waitlist?')) {
      return;
    }
    
    try {
      await removeFromWaitlist(matchId);
      await loadData();
    } catch (error) {
      console.error('Error removing from waitlist:', error);
      alert('Error removing from waitlist. Please try again.');
    }
  };

  const groupedEntries = useMemo(() => {
    const grouped = {};
    entries.forEach(entry => {
      if (!grouped[entry.requestId]) {
        grouped[entry.requestId] = [];
      }
      grouped[entry.requestId].push(entry);
    });
    
    // Sort each group by position
    Object.keys(grouped).forEach(requestId => {
      grouped[requestId].sort((a, b) => a.waitlistPosition - b.waitlistPosition);
    });
    
    return grouped;
  }, [entries]);

  const filteredEntries = useMemo(() => {
    if (!filterRequestId) return entries;
    return entries.filter(e => e.requestId === filterRequestId);
  }, [entries, filterRequestId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Waitlist Management ⏳</h1>
          <p style={styles.subtitle}>Manage models waiting for booking opportunities</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'grouped' ? '#58a6ff' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('grouped')}
          >
            Grouped View
          </button>
          <button
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'flat' ? '#58a6ff' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={() => setViewMode('flat')}
          >
            Flat View
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Waitlisted</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.uniqueRequests}</div>
          <div style={styles.statLabel}>Unique Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.averageWaitlistSize.toFixed(1)}</div>
          <div style={styles.statLabel}>Avg Waitlist Size</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>
            {Object.keys(groupedEntries).length}
          </div>
          <div style={styles.statLabel}>Active Waitlists</div>
        </div>
      </div>
      
      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Filter by Request ID</label>
          <input
            type="text"
            style={styles.filterInput}
            placeholder="Enter request ID..."
            value={filterRequestId}
            onChange={(e) => setFilterRequestId(e.target.value)}
          />
        </div>
      </div>
      
      {/* Content */}
      {viewMode === 'grouped' ? (
        // Grouped View
        Object.keys(groupedEntries).length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <div>No waitlist entries found</div>
          </div>
        ) : (
          Object.entries(groupedEntries).map(([requestId, requestEntries]) => {
            const firstEntry = requestEntries[0];
            const service = getServiceById(firstEntry.request?.serviceType);
            
            return (
              <div key={requestId} style={styles.requestGroup}>
                <div style={styles.requestGroupHeader}>
                  <div>
                    <div style={styles.requestGroupTitle}>
                      {service ? service.name : firstEntry.request?.serviceType} - Request {requestId.slice(-8)}
                    </div>
                    <div style={styles.requestGroupMeta}>
                      {new Date(firstEntry.request?.requestedDate).toLocaleDateString()} at {firstEntry.request?.requestedTime} • {requestEntries.length} model{requestEntries.length !== 1 ? 's' : ''} on waitlist
                    </div>
                  </div>
                  <div style={styles.requestGroupActions}>
                    <button
                      style={{ ...styles.actionBtn, ...styles.btnPromote }}
                      onClick={() => handlePromote(requestId)}
                    >
                      Promote #1
                    </button>
                  </div>
                </div>
                
                <div style={styles.table}>
                  <div style={styles.tableHeader}>
                    <div>Pos</div>
                    <div>Model</div>
                    <div>Match Score</div>
                    <div>Added</div>
                    <div>Time on Waitlist</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  
                  {requestEntries.map(entry => {
                    const timeOnWaitlist = Math.floor((Date.now() - new Date(entry.addedAt).getTime()) / (1000 * 60 * 60));
                    
                    return (
                      <div key={entry.id} style={styles.tableRow}>
                        <div style={styles.tableCell}>
                          <span style={styles.positionBadge}>
                            {entry.waitlistPosition}
                          </span>
                        </div>
                        <div style={styles.tableCell}>
                          <div style={styles.modelInfo}>
                            <div style={styles.modelName}>
                              {entry.model?.firstName} {entry.model?.lastName}
                            </div>
                            <div style={styles.modelEmail}>
                              {entry.model?.email}
                            </div>
                          </div>
                        </div>
                        <div style={styles.tableCell}>
                          <span style={styles.scoreBadge}>
                            {entry.matchScore}%
                          </span>
                        </div>
                        <div style={styles.tableCell}>
                          <div style={styles.timeInfo}>
                            {new Date(entry.addedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div style={styles.tableCell}>
                          <div style={styles.timeInfo}>
                            {timeOnWaitlist < 24 
                              ? `${timeOnWaitlist}h` 
                              : `${Math.floor(timeOnWaitlist / 24)}d`}
                          </div>
                        </div>
                        <div style={styles.tableCell}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            background: 'rgba(255,193,7,0.2)',
                            color: '#ffc107',
                          }}>
                            Waitlist
                          </span>
                        </div>
                        <div style={styles.tableCell}>
                          <button
                            style={{ ...styles.actionBtn, ...styles.btnRemove }}
                            onClick={() => handleRemove(entry.matchId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )
      ) : (
        // Flat View
        filteredEntries.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
            <div>No waitlist entries found</div>
          </div>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <div>Pos</div>
              <div>Model</div>
              <div>Request</div>
              <div>Match Score</div>
              <div>Added</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {filteredEntries.map(entry => {
              const service = getServiceById(entry.request?.serviceType);
              
              return (
                <div key={entry.id} style={styles.tableRow}>
                  <div style={styles.tableCell}>
                    <span style={styles.positionBadge}>
                      {entry.waitlistPosition}
                    </span>
                  </div>
                  <div style={styles.tableCell}>
                    <div style={styles.modelInfo}>
                      <div style={styles.modelName}>
                        {entry.model?.firstName} {entry.model?.lastName}
                      </div>
                      <div style={styles.modelEmail}>
                        {entry.model?.email}
                      </div>
                    </div>
                  </div>
                  <div style={styles.tableCell}>
                    <div style={styles.requestInfo}>
                      <div style={styles.requestService}>
                        {service ? service.name : entry.request?.serviceType}
                      </div>
                      <div style={styles.requestDate}>
                        {new Date(entry.request?.requestedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={styles.tableCell}>
                    <span style={styles.scoreBadge}>
                      {entry.matchScore}%
                    </span>
                  </div>
                  <div style={styles.tableCell}>
                    <div style={styles.timeInfo}>
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={styles.tableCell}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      background: 'rgba(255,193,7,0.2)',
                      color: '#ffc107',
                    }}>
                      Waitlist
                    </span>
                  </div>
                  <div style={styles.tableCell}>
                    <button
                      style={{ ...styles.actionBtn, ...styles.btnRemove }}
                      onClick={() => handleRemove(entry.matchId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

