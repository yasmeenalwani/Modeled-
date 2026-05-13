import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { useIsAdmin } from '../../components/ProtectedRoute';
import { getMatchesForRequest, professionalDeclineMatch } from '../../utils/matchService';
import { getRequestById } from '../../utils/requestService';
import { getMockModel, shouldUseMockData } from '../../utils/mockDataService';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  backBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
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
  
  // Request Info
  requestCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  requestTitle: {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Match Grid
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  matchCard: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  matchCardHover: {
    borderColor: '#8B1E3F',
    boxShadow: '0 4px 12px rgba(139, 30, 63, 0.15)',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
  },
  matchName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchScore: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchPhoto: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
  },
  matchAttributes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionBtn: {
    flex: 1,
    padding: '0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#8B1E3F',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    fontWeight: '600',
  },
  approveBtn: {
    background: 'rgba(76,175,80,0.2)',
    borderColor: '#4caf50',
    color: '#4caf50',
  },
};

export default function ProMatchViewing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestId: routeRequestId } = useParams();
  const { user } = useAuthenticator();
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const requestId = searchParams.get('requestId') || routeRequestId;
  
  const [request, setRequest] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin-only: pros must never view matches — redirect to matching
  useEffect(() => {
    if (isAdminLoading) return;
    if (!isAdmin) {
      navigate('/portal/matching', { replace: true });
      return;
    }
  }, [isAdmin, isAdminLoading, navigate]);

  useEffect(() => {
    if (requestId) {
      loadRequestAndMatches();
    }
  }, [requestId]);

  const loadRequestAndMatches = async () => {
    try {
      setLoading(true);
      
      const requestData = await getRequestById(requestId);
      let matchesData = requestData ? await getMatchesForRequest(requestId) : [];

      const enrichedMatches = await Promise.all(
        matchesData.map(async (match) => {
          if (shouldUseMockData()) {
            return { ...match, model: getMockModel(match.modelId) };
          }

          try {
            const { data: model } = await client.models.ModelProfile.get({
              id: match.modelId,
            });
            return { ...match, model: model || null };
          } catch (error) {
            console.error(`Error loading model ${match.modelId}:`, error);
            return { ...match, model: null };
          }
        })
      );
      matchesData = enrichedMatches;
      
      setRequest(requestData);
      
      // Sort by score (highest first)
      matchesData.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setMatches(matchesData);
    } catch (error) {
      console.error('Error loading matches:', error);
      // Try mock data as fallback
      try {
        const fallbackRequest = await getRequestById(requestId);
        setRequest(fallbackRequest);
        const fallbackMatches = fallbackRequest ? await getMatchesForRequest(requestId) : [];
        const enrichedMatches = fallbackMatches.map(match => ({
          ...match,
          model: getMockModel(match.modelId),
        }));
        enrichedMatches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setMatches(enrichedMatches);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Note: Professionals can view matches but cannot approve/reject
  // Only admins can approve and send to models

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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#5A3A2A' }}>
          Loading matches...
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/portal/requests')}>
          ← Back to Requests
        </button>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Request not found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/portal/requests')}>
        ← Back to Requests
      </button>
      
      <div style={styles.header}>
        <h1 style={styles.title}>Matches for Request</h1>
        <p style={styles.subtitle}>
          {getServiceName(request.serviceType)} • {new Date(request.requestedDate).toLocaleDateString()}
        </p>
      </div>

      {/* Request Info */}
      <div style={styles.requestCard}>
        <div style={styles.requestTitle}>
          {getServiceName(request.serviceType)}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#5A3A2A', marginBottom: '0.5rem' }}>
          {request.serviceDescription || 'No description'}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#5A3A2A' }}>
          {new Date(request.requestedDate).toLocaleDateString()} • 
          {request.requestedTime || 'TBD'} • 
          {request.location || 'TBD'}
        </div>
      </div>

      {/* Matches */}
      {matches.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
          <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#4A2A1A' }}>
            No matches yet
          </div>
          <div style={{ fontSize: '0.9rem', color: '#5A3A2A' }}>
            Matches will appear here once the matching engine finds suitable models
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#5A3A2A' }}>
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} found
          </div>
          <div style={styles.matchGrid}>
            {matches.map(match => (
              <div
                key={match.id}
                style={styles.matchCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#8B1E3F';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.matchHeader}>
                  <div style={styles.matchName}>
                    {match.model 
                      ? `${match.model.firstName} ${match.model.lastName || ''}`
                      : 'Model'}
                  </div>
                  <div style={styles.matchScore}>
                    {match.matchScore || 0}
                  </div>
                </div>
                
                {match.model?.headshotUrl ? (
                  <img
                    src={match.model.headshotUrl}
                    alt={match.model.firstName}
                    style={styles.matchPhoto}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    ...styles.matchPhoto,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    color: 'rgba(139, 30, 63, 0.3)',
                  }}>
                    {match.model?.firstName?.charAt(0) || '?'}
                  </div>
                )}
                
                {match.model && (
                  <div style={styles.matchAttributes}>
                    <div>{match.model.locationZip || 'Location TBD'}</div>
                    {match.model.hairColorSimple && (
                      <div>{match.model.hairColorSimple} hair</div>
                    )}
                    {match.model.hairLengthSimple && (
                      <div>{match.model.hairLengthSimple} length</div>
                    )}
                    {match.model.hairTextureSimple && (
                      <div>{match.model.hairTextureSimple} texture</div>
                    )}
                  </div>
                )}
                
                <div style={styles.matchActions}>
                  {match.status === 'pending' && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(255,193,7,0.1)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#ffc107',
                      fontWeight: '600',
                    }}>
                      Awaiting Admin Approval
                    </div>
                  )}
                  {match.status === 'approved' && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(139, 30, 63, 0.1)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#8B1E3F',
                      fontWeight: '600',
                    }}>
                      Approved by Admin
                    </div>
                  )}
                  {(match.status === 'sent_to_model' || match.status === 'sent') && (
                    <>
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(102,126,234,0.1)',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        color: '#667eea',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                      }}>
                        Sent to Model (Waiting for Acceptance)
                      </div>
                      <button
                        style={{
                          ...styles.actionBtn,
                          background: 'rgba(208,2,27,0.1)',
                          color: '#d0021b',
                          border: '1px solid rgba(208,2,27,0.3)',
                          width: '100%',
                          marginTop: '0.25rem',
                        }}
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!window.confirm('Mark as declined by professional? This will apply a compatibility penalty to the model.')) return;
                          try {
                            await professionalDeclineMatch(match.id);
                            loadRequestAndMatches();
                          } catch (err) {
                            console.error(err);
                            alert('Failed to decline match');
                          }
                        }}
                      >
                        Pro Declined
                      </button>
                    </>
                  )}
                  {match.status === 'booked' && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(76,175,80,0.2)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#4caf50',
                      fontWeight: '700',
                    }}>
                      Confirmed (Model Accepted)
                    </div>
                  )}
                  {match.status === 'rejected' && (
                    <div style={{
                      padding: '0.75rem',
                      background: 'rgba(208,2,27,0.1)',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontSize: '0.85rem',
                      color: '#d0021b',
                      fontWeight: '600',
                    }}>
                      Rejected
                    </div>
                  )}
                  {match.model && (
                    <button
                      style={styles.actionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to model profile (for demo, show in modal or navigate)
                        navigate(`/model-portal/profile?modelId=${match.modelId}`);
                      }}
                    >
                      View Profile
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

