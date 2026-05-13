import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getRequestsForProfessional, updateRequestStatus } from '../../utils/requestService';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A',
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  createBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '0.6rem 1.25rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.2s ease',
  },
  filterBtnActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  
  // Request List
  requestList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  requestCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  requestCardHover: {
    borderColor: '#8B1E3F',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.15)',
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  requestTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestService: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestInfo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  requestActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

const getStatusColor = (status) => {
  const colors = {
    pending: '#f5a623',
    matching: '#4a90e2',
    matched: '#7ed321',
    booked: '#50e3c2',
    completed: '#4caf50',
    cancelled: '#d0021b',
  };
  return colors[status] || '#666';
};

const getServiceName = (serviceId) => {
  const serviceMap = {
    haircut: 'Haircut',
    color: 'Color',
    highlights: 'Highlights',
    styling: 'Styling',
    makeup: 'Makeup',
    nails: 'Nails',
  };
  return serviceMap[serviceId] || serviceId || 'Service';
};

export default function ProRequestDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthenticator();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Reload on every navigation to this page (picks up newly created requests)
  useEffect(() => {
    if (user) {
      loadRequests();
    }
  }, [user, location.key]);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const requestsData = await getRequestsForProfessional(user?.userId);
      setRequests(requestsData || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => {
        const status = r.status === 'pending' ? 'matching' : r.status;
        return status === activeFilter;
      });

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    // Append local time to prevent UTC shift (e.g. "2025-03-09" → March 8 in US timezones)
    const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleViewBooking = (requestId) => {
    // Navigate to schedule/calendar to see booking
    navigate(`/portal/schedule?requestId=${requestId}`);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Requests</h1>
          <p style={styles.subtitle}>Manage all your model requests</p>
        </div>
        <button
          style={styles.createBtn}
          onClick={() => navigate('/portal/request')}
        >
          + New Request
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button
          style={{
            ...styles.filterBtn,
            ...(activeFilter === 'all' ? styles.filterBtnActive : {}),
          }}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
          {['matching', 'booked', 'completed', 'cancelled'].map(status => (
          <button
            key={status}
            style={{
              ...styles.filterBtn,
              ...(activeFilter === status ? styles.filterBtnActive : {}),
            }}
            onClick={() => setActiveFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#5A3A2A' }}>
          Loading requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4A2A1A' }}>
            {activeFilter === 'all' ? 'No requests yet' : `No ${activeFilter} requests`}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#5A3A2A', marginBottom: '1.5rem' }}>
            {activeFilter === 'all' 
              ? 'Create your first request to get started'
              : 'Try a different filter'}
          </div>
          {activeFilter === 'all' && (
            <button
              style={styles.createBtn}
              onClick={() => navigate('/portal/request')}
            >
              + Create Request
            </button>
          )}
        </div>
      ) : (
        <div style={styles.requestList}>
          {filteredRequests.map(request => (
            <div
              key={request.id}
              style={styles.requestCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#8B1E3F';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={styles.requestHeader}>
                <div>
                  <div style={styles.requestTitle}>
                    {getServiceName(request.serviceType)}
                  </div>
                  <div style={styles.requestService}>
                    {request.serviceDescription || 'No description'}
                  </div>
                </div>
                <div style={{
                  ...styles.requestStatus,
                  background: `${getStatusColor(request.status === 'pending' ? 'matching' : request.status)}20`,
                  color: getStatusColor(request.status === 'pending' ? 'matching' : request.status),
                }}>
                  {(request.status === 'pending' ? 'matching' : request.status).toUpperCase()}
                </div>
              </div>
              
              <div style={styles.requestInfo}>
                <div>{formatDate(request.requestedDate)}</div>
                <div>{request.requestedTime || 'TBD'}</div>
                <div>{request.location || 'TBD'}</div>
              </div>
              
              {request.serviceDescription && (
                <div style={{
                  padding: '0.75rem',
                  background: 'rgba(139, 30, 63, 0.05)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#5A3A2A',
                  marginBottom: '1rem',
                }}>
                  {request.serviceDescription}
                </div>
              )}
              
              <div style={styles.requestActions}>
                {request.status === 'booked' && (
                  <button
                    style={styles.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewBooking(request.id);
                    }}
                  >
                    View in Calendar
                  </button>
                )}
                <button
                  style={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/portal/request?edit=${request.id}`);
                  }}
                >
                  Edit
                </button>
                {request.status !== 'completed' && request.status !== 'cancelled' && (
                  <button
                    style={{
                      ...styles.actionBtn,
                      background: 'rgba(208,2,27,0.1)',
                      borderColor: 'rgba(208,2,27,0.2)',
                      color: '#d0021b',
                    }}
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Cancel this request?')) {
                        try {
                          await updateRequestStatus(request.id, 'cancelled');
                          loadRequests();
                        } catch (error) {
                          console.error('Error cancelling request:', error);
                          alert(`Error: ${error.message || 'Failed to cancel request'}`);
                        }
                      }
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

