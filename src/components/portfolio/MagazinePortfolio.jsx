import React, { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { getPhotoForService, handleImageError } from '../../utils/imageHelpers';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1600px',
    margin: '0 auto',
    fontFamily: '"Alike", "Georgia", serif',
    color: '#4A2A1A',
    background: 'transparent',
  },
  
  // Magazine header
  header: {
    marginBottom: '3rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5A3A2A',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Stats strip
  statsStrip: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1), rgba(168, 90, 90, 0.05))',
    borderTop: '2px solid rgba(139, 30, 63, 0.2)',
    borderBottom: '2px solid rgba(139, 30, 63, 0.2)',
    marginBottom: '3rem',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Magazine layout - mixed grid
  magazineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  
  // Feature card (spans 2 columns)
  featureCard: {
    gridColumn: 'span 6',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  featureCardLarge: {
    gridColumn: 'span 8',
  },
  featureImage: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
    display: 'block',
  },
  featureImageTall: {
    height: '600px',
  },
  featureOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    padding: '2rem',
    color: '#FFFEF9',
  },
  featureService: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
    marginBottom: '0.5rem',
    opacity: 0.9,
    fontFamily: '"Alike", "Georgia", serif',
  },
  featureTitle: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featureMeta: {
    fontSize: '0.9rem',
    opacity: 0.8,
    fontFamily: '"Alike", "Georgia", serif',
  },
  featureRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  ratingStars: {
    color: '#ffc107',
    fontSize: '1rem',
  },
  
  // Regular card (spans 3 columns)
  regularCard: {
    gridColumn: 'span 4',
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  regularImage: {
    width: '100%',
    height: '300px',
    objectFit: 'cover',
    display: 'block',
  },
  regularContent: {
    padding: '1.5rem',
  },
  regularService: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  regularTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  regularDate: {
    fontSize: '0.85rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Small card (spans 2 columns)
  smallCard: {
    gridColumn: 'span 3',
    position: 'relative',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  smallImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    display: 'block',
  },
  smallContent: {
    padding: '1rem',
  },
  smallService: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Section divider
  sectionDivider: {
    margin: '4rem 0',
    textAlign: 'center',
    position: 'relative',
  },
  dividerLine: {
    height: '2px',
    background: 'linear-gradient(to right, transparent, rgba(139, 30, 63, 0.3), transparent)',
    marginBottom: '1rem',
  },
  dividerText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#8B1E3F',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Filters
  filters: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  filterBtn: {
    padding: '0.5rem 1.25rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
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
  
  // Loading
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Empty state
  emptyState: {
    textAlign: 'center',
    padding: '4rem',
    color: '#5A3A2A',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

export default function MagazinePortfolio({ userType = 'professional' }) {
  const { user } = useAuthenticator();
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    loadPortfolioData();
  }, [userType]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      // Load bookings (completed sessions)
      let bookingsData = [];
      
      if (userType === 'professional') {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: user?.userId } },
        });
        
        if (professionals && professionals.length > 0) {
          const { data } = await client.models.Booking.list({
            filter: { 
              professionalId: { eq: professionals[0].id },
              status: { eq: 'completed' },
            },
            limit: 50,
            sortDirection: 'DESC',
          });
          bookingsData = data || [];
        }
      } else if (userType === 'model') {
        const { data: models } = await client.models.ModelProfile.list({
          filter: { userId: { eq: user?.userId } },
        });
        
        if (models && models.length > 0) {
          const { data } = await client.models.Booking.list({
            filter: { 
              modelId: { eq: models[0].id },
              status: { eq: 'completed' },
            },
            limit: 50,
            sortDirection: 'DESC',
          });
          bookingsData = data || [];
        }
      }
      
      // Enrich with model/professional details and photos
      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          let model = null;
          let professional = null;
          
          if (booking.modelId) {
            try {
              const { data } = await client.models.ModelProfile.get({ id: booking.modelId });
              model = data;
            } catch (e) {}
          }
          
          if (booking.professionalId) {
            try {
              const { data } = await client.models.Professional.get({ id: booking.professionalId });
              professional = data;
            } catch (e) {}
          }
          
          // Get photo for service
          const photoUrl = getPhotoForService(booking.serviceType);
          
          return {
            ...booking,
            model,
            professional,
            photoUrl,
            displayDate: new Date(booking.appointmentDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
          };
        })
      );
      
      setBookings(enrichedBookings);
      
      // Load recent matches (for "upcoming" section)
      let matchesData = [];
      if (userType === 'professional') {
        const { data: professionals } = await client.models.Professional.list({
          filter: { userId: { eq: user?.userId } },
        });
        
        if (professionals && professionals.length > 0) {
          // Get matches for approved requests
          const { data: requests } = await client.models.ModelRequest.list({
            filter: { 
              professionalId: { eq: professionals[0].id },
              status: { in: ['matched', 'booked'] },
            },
            limit: 20,
          });
          
          if (requests && requests.length > 0) {
            const requestIds = requests.map(r => r.id);
            const { data: matches } = await client.models.Match.list({
              filter: { 
                requestId: { in: requestIds },
                status: { in: ['sent_to_model', 'approved'] },
              },
              limit: 10,
              sortDirection: 'DESC',
            });
            
            matchesData = matches || [];
          }
        }
      }
      
      // Enrich matches
      const enrichedMatches = await Promise.all(
        matchesData.map(async (match) => {
          let model = null;
          try {
            const { data } = await client.models.ModelProfile.get({ id: match.modelId });
            model = data;
          } catch (e) {}
          
          return {
            ...match,
            model,
            photoUrl: getPhotoForService('hair salon'),
            type: 'match',
          };
        })
      );
      
      setMatches(enrichedMatches);
      
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create magazine-style layout
  const magazineItems = useMemo(() => {
    const items = bookings.map((booking, index) => {
      const serviceName = booking.serviceType || 'Service';
      const clientName = userType === 'professional' 
        ? (booking.model ? `${booking.model.firstName} ${booking.model.lastName || ''}` : 'Model')
        : (booking.professional ? `${booking.professional.firstName} ${booking.professional.lastName || ''}` : 'Professional');
      
      // Vary card sizes for magazine layout
      let cardType = 'regular';
      if (index === 0) cardType = 'large';
      else if (index % 7 === 0) cardType = 'feature';
      else if (index % 3 === 0) cardType = 'small';
      
      return {
        ...booking,
        clientName,
        serviceName,
        cardType,
        rating: booking.rating || 5,
        feedback: booking.feedback || null,
      };
    });
    
    // Filter by active filter
    if (activeFilter !== 'all') {
      return items.filter(item => 
        item.serviceType?.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }
    
    return items;
  }, [bookings, activeFilter, userType]);

  // Get unique service types for filters
  const serviceTypes = useMemo(() => {
    const types = new Set(['all']);
    bookings.forEach(b => {
      if (b.serviceType) types.add(b.serviceType);
    });
    return Array.from(types);
  }, [bookings]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalSessions: bookings.length,
      averageRating: bookings.length > 0
        ? (bookings.reduce((sum, b) => sum + (b.rating || 5), 0) / bookings.length).toFixed(1)
        : 0,
      completedThisMonth: bookings.filter(b => {
        const bookingDate = new Date(b.appointmentDate);
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear();
      }).length,
    };
  }, [bookings]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading your portfolio...</div>
      </div>
    );
  }

  if (magazineItems.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Portfolio</h1>
          <p style={styles.subtitle}>Your work tells your story</p>
        </div>
        <div style={styles.emptyState}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            No portfolio items yet
          </p>
          <p style={{ fontSize: '0.9rem', color: '#5A3A2A' }}>
            Completed sessions will appear here with photos and details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>MY PORTFOLIO</h1>
        <p style={styles.subtitle}>
          {userType === 'professional' 
            ? 'A collection of my work, my artistry, my passion' 
            : 'My beauty journey, one session at a time'}
        </p>
      </div>

      {/* Stats Strip */}
      <div style={styles.statsStrip}>
        <div style={styles.stat}>
          <div style={styles.statValue}>{stats.totalSessions}</div>
          <div style={styles.statLabel}>Total Sessions</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{stats.averageRating}</div>
          <div style={styles.statLabel}>Average Rating</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{stats.completedThisMonth}</div>
          <div style={styles.statLabel}>This Month</div>
        </div>
        {matches.length > 0 && (
          <div style={styles.stat}>
            <div style={styles.statValue}>{matches.length}</div>
            <div style={styles.statLabel}>Active Matches</div>
          </div>
        )}
      </div>
      
      {/* Upcoming Matches Section */}
      {matches.length > 0 && (
        <>
          <div style={styles.sectionDivider}>
            <div style={styles.dividerLine} />
            <div style={styles.dividerText}>Upcoming Opportunities</div>
            <div style={styles.dividerLine} />
          </div>
          <div style={styles.magazineGrid}>
            {matches.slice(0, 3).map((match, idx) => (
              <div
                key={match.id}
                style={{
                  ...styles.regularCard,
                  gridColumn: idx === 0 ? 'span 8' : 'span 4',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 30, 63, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedPhoto(match)}
              >
                <img
                  src={match.photoUrl}
                  alt="Upcoming Match"
                  style={{
                    ...styles.regularImage,
                    height: idx === 0 ? '400px' : '300px',
                  }}
                  onError={(e) => handleImageError(e)}
                />
                <div style={styles.regularContent}>
                  <div style={styles.regularService}>📅 Upcoming Match</div>
                  <div style={styles.regularTitle}>
                    {match.model ? `${match.model.firstName} ${match.model.lastName || ''}` : 'Model'}
                  </div>
                  <div style={styles.regularDate}>
                    Match Score: {match.matchScore || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      {/* Completed Sessions Section */}
      {magazineItems.length > 0 && (
        <>
          <div style={styles.sectionDivider}>
            <div style={styles.dividerLine} />
            <div style={styles.dividerText}>Completed Work</div>
            <div style={styles.dividerLine} />
          </div>

          {/* Filters */}
          {serviceTypes.length > 1 && (
            <div style={styles.filters}>
              {serviceTypes.map(type => (
                <button
                  key={type}
                  style={{
                    ...styles.filterBtn,
                    ...(activeFilter === type ? styles.filterBtnActive : {}),
                  }}
                  onClick={() => setActiveFilter(type)}
                >
                  {type === 'all' ? 'All Work' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          )}

          {/* Magazine Grid */}
          <div style={styles.magazineGrid}>
        {magazineItems.map((item, index) => {
          if (item.cardType === 'large') {
            return (
              <div
                key={item.id}
                style={{ ...styles.featureCard, ...styles.featureCardLarge }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 30, 63, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedPhoto(item)}
              >
                <img
                  src={item.photoUrl}
                  alt={item.serviceName}
                  style={{ ...styles.featureImage, ...styles.featureImageTall }}
                  onError={(e) => handleImageError(e)}
                />
                <div style={styles.featureOverlay}>
                  <div style={styles.featureService}>{item.serviceName}</div>
                  <div style={styles.featureTitle}>Featured Work</div>
                  <div style={styles.featureMeta}>
                    With {item.clientName} • {item.displayDate}
                  </div>
                  {item.rating && (
                    <div style={styles.featureRating}>
                      <span style={styles.ratingStars}>
                        {'*'.repeat(Math.floor(item.rating))}
                      </span>
                      <span>{item.rating}/5</span>
                    </div>
                  )}
                </div>
              </div>
            );
          } else if (item.cardType === 'feature') {
            return (
              <div
                key={item.id}
                style={styles.featureCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 30, 63, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedPhoto(item)}
              >
                <img
                  src={item.photoUrl}
                  alt={item.serviceName}
                  style={styles.featureImage}
                  onError={(e) => handleImageError(e)}
                />
                <div style={styles.featureOverlay}>
                  <div style={styles.featureService}>{item.serviceName}</div>
                  <div style={styles.featureTitle}>
                    {item.serviceName.charAt(0).toUpperCase() + item.serviceName.slice(1)}
                  </div>
                  <div style={styles.featureMeta}>
                    {item.displayDate}
                  </div>
                </div>
              </div>
            );
          } else if (item.cardType === 'small') {
            return (
              <div
                key={item.id}
                style={styles.smallCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 30, 63, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedPhoto(item)}
              >
                <img
                  src={item.photoUrl}
                  alt={item.serviceName}
                  style={styles.smallImage}
                  onError={(e) => handleImageError(e)}
                />
                <div style={styles.smallContent}>
                  <div style={styles.smallService}>{item.serviceName}</div>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                style={styles.regularCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 30, 63, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => setSelectedPhoto(item)}
              >
                <img
                  src={item.photoUrl}
                  alt={item.serviceName}
                  style={styles.regularImage}
                  onError={(e) => handleImageError(e)}
                />
                <div style={styles.regularContent}>
                  <div style={styles.regularService}>{item.serviceName}</div>
                  <div style={styles.regularTitle}>
                    {item.clientName}
                  </div>
                  <div style={styles.regularDate}>{item.displayDate}</div>
                  {item.rating && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#ffc107' }}>
                      {'*'.repeat(Math.floor(item.rating))} {item.rating}/5
                    </div>
                  )}
                </div>
              </div>
            );
          }
        })}
          </div>
        </>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          userType={userType}
        />
      )}
    </div>
  );
}

// Photo Detail Modal Component
function PhotoDetailModal({ photo, onClose, userType }) {
  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '2rem',
    },
    modal: {
      maxWidth: '900px',
      width: '100%',
      background: '#FFFEF9',
      borderRadius: '16px',
      overflow: 'hidden',
      maxHeight: '90vh',
      overflowY: 'auto',
    },
    image: {
      width: '100%',
      height: '500px',
      objectFit: 'cover',
    },
    content: {
      padding: '2rem',
    },
    closeBtn: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'rgba(0,0,0,0.7)',
      color: '#FFFEF9',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      fontSize: '1.5rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: '700',
      marginBottom: '0.5rem',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
    meta: {
      fontSize: '0.9rem',
      color: '#5A3A2A',
      marginBottom: '1rem',
      fontFamily: '"Alike", "Georgia", serif',
    },
    feedback: {
      marginTop: '1.5rem',
      padding: '1.5rem',
      background: 'rgba(139, 30, 63, 0.05)',
      borderRadius: '12px',
    },
    feedbackTitle: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: '#4A2A1A',
      fontFamily: '"Alike", "Georgia", serif',
    },
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          ×
        </button>
        <img
          src={photo.photoUrl}
          alt={photo.serviceName}
          style={modalStyles.image}
          onError={(e) => handleImageError(e)}
        />
        <div style={modalStyles.content}>
          <h2 style={modalStyles.title}>{photo.serviceName}</h2>
          <div style={modalStyles.meta}>
            {userType === 'professional' ? (
              <>With <strong>{photo.clientName}</strong> • {photo.displayDate}</>
            ) : (
              <>With <strong>{photo.clientName}</strong> • {photo.displayDate}</>
            )}
          </div>
          {photo.rating && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.2rem', color: '#ffc107' }}>
                {'*'.repeat(Math.floor(photo.rating))}
              </span>
              <span style={{ marginLeft: '0.5rem', fontSize: '1rem', fontWeight: '600' }}>
                {photo.rating}/5
              </span>
            </div>
          )}
          {photo.feedback && (
            <div style={modalStyles.feedback}>
              <div style={modalStyles.feedbackTitle}>Feedback</div>
              <p style={{ color: '#5A3A2A', lineHeight: 1.6 }}>
                {photo.feedback}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

