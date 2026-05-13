// ============================================
// ROLE MODEL - 4th Chair Applications Review
// Admin dashboard for reviewing applications
// ============================================

import React, { useState, useMemo } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    color: '#10b981',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
  },
  filters: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  filterButtonActive: {
    background: 'rgba(16,185,129,0.2)',
    borderColor: '#10b981',
    color: '#10b981',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  applicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
    gap: '1.5rem',
  },
  applicationCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.2s ease',
  },
  applicationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  applicantName: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '0.25rem',
  },
  applicationDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusPending: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  statusSelected: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
  },
  statusRejected: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
  },
  storyPreview: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
    maxHeight: '150px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mediaPreview: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  mediaThumb: {
    width: '60px',
    height: '60px',
    borderRadius: '6px',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  buttonSelect: {
    background: '#10b981',
    color: '#fff',
  },
  buttonView: {
    background: 'rgba(255,255,255,0.05)',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

// Mock applications data
const mockApplications = [
  {
    id: 1,
    name: 'Sarah Johnson',
    pronouns: 'she/her',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    story: 'I\'m a single mother of two who recently left an abusive relationship. I haven\'t had my hair done in over two years because I\'ve been putting every dollar toward my children. This would mean so much to me—a chance to feel like myself again, to look in the mirror and see strength instead of exhaustion. My daughter keeps asking when mommy will get "pretty hair" again, and I want to show her that we\'re rebuilding, that we\'re strong, that we deserve care too.',
    location: 'Brooklyn, NY',
    hairType: 'Curly, medium length',
    submittedAt: '2024-12-01',
    status: 'pending',
    photos: ['photo1.jpg', 'photo2.jpg'],
    video: 'video1.mp4',
  },
  {
    id: 2,
    name: 'Maria Rodriguez',
    pronouns: 'she/her',
    email: 'maria.r@email.com',
    phone: '(555) 234-5678',
    story: 'I just finished my last round of chemotherapy last month. My hair is starting to grow back, but it\'s patchy and I feel so self-conscious. I haven\'t been able to look at myself in the mirror without crying. A professional cut and style would help me feel human again, help me see the person I\'m becoming after this journey. I want to celebrate surviving, not just exist.',
    location: 'Queens, NY',
    hairType: 'Growing back, short',
    submittedAt: '2024-12-03',
    status: 'pending',
    photos: ['photo3.jpg'],
    video: 'video2.mp4',
  },
  {
    id: 3,
    name: 'Jamie Chen',
    pronouns: 'they/them',
    email: 'jamie.c@email.com',
    phone: '(555) 345-6789',
    story: 'I\'m transitioning and my hair has been a huge source of dysphoria. I can\'t afford gender-affirming care right now, but a haircut that makes me feel like myself would be life-changing. Every time I see my reflection, I see someone I don\'t recognize. I just want to see me.',
    location: 'Manhattan, NY',
    hairType: 'Straight, long',
    submittedAt: '2024-11-28',
    status: 'selected',
    photos: ['photo4.jpg', 'photo5.jpg'],
    video: 'video3.mp4',
  },
];

export default function RoleModelApplicationsPage() {
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'selected', 'rejected'
  const [selectedApplication, setSelectedApplication] = useState(null);

  const filteredApplications = useMemo(() => {
    if (filter === 'all') return mockApplications;
    return mockApplications.filter(app => app.status === filter);
  }, [filter]);

  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => a.status === 'pending').length,
    selected: mockApplications.filter(a => a.status === 'selected').length,
    rejected: mockApplications.filter(a => a.status === 'rejected').length,
  };

  const getStatusStyle = (status) => {
    return {
      ...styles.statusBadge,
      ...(status === 'pending' ? styles.statusPending :
          status === 'selected' ? styles.statusSelected :
          styles.statusRejected),
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>The 4th Chair Applications</h1>
        <p style={styles.subtitle}>
          Review applications and select recipients with intention and care
        </p>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.selected}</div>
          <div style={styles.statLabel}>Selected</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.rejected}</div>
          <div style={styles.statLabel}>Not Selected</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'all' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter('all')}
        >
          All Applications
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'pending' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter('pending')}
        >
          Pending Review
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'selected' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter('selected')}
        >
          Selected
        </button>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === 'rejected' ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter('rejected')}
        >
          Not Selected
        </button>
      </div>

      {/* Applications Grid */}
      {filteredApplications.length > 0 ? (
        <div style={styles.applicationsGrid}>
          {filteredApplications.map(app => (
            <div key={app.id} style={styles.applicationCard}>
              <div style={styles.applicationHeader}>
                <div>
                  <div style={styles.applicantName}>
                    {app.name} ({app.pronouns})
                  </div>
                  <div style={styles.applicationDate}>
                    Applied: {new Date(app.submittedAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={getStatusStyle(app.status)}>
                  {app.status}
                </div>
              </div>

              <div style={styles.storyPreview}>
                {app.story.substring(0, 200)}...
              </div>

              {app.photos && app.photos.length > 0 && (
                <div style={styles.mediaPreview}>
                  {app.photos.map((photo, i) => (
                    <div key={i} style={styles.mediaThumb}>
                      📷
                    </div>
                  ))}
                  {app.video && <div style={styles.mediaThumb}>🎥</div>}
                </div>
              )}

              <div style={styles.actions}>
                <button
                  style={{ ...styles.actionButton, ...styles.buttonView }}
                  onClick={() => setSelectedApplication(app)}
                >
                  View Full Application
                </button>
                {app.status === 'pending' && (
                  <button
                    style={{ ...styles.actionButton, ...styles.buttonSelect }}
                    onClick={() => {
                      // Handle selection
                      console.log('Select application:', app.id);
                    }}
                  >
                    Select
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
          <div>No applications found</div>
        </div>
      )}

      {/* Full Application Modal (to be implemented) */}
      {selectedApplication && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            background: '#12121a',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ color: '#10b981', fontSize: '1.5rem' }}>
                {selectedApplication.name}'s Application
              </h2>
              <button
                onClick={() => setSelectedApplication(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {selectedApplication.story}
            </div>
            {/* Full details would go here */}
          </div>
        </div>
      )}
    </div>
  );
}

