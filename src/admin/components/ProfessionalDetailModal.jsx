import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Reuse styles from ModelDetailModal (in production, extract to shared file)
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    overflowY: 'auto',
  },
  modal: {
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1200px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid rgba(102,126,234,0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  header: {
    padding: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%)',
    zIndex: 10,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
    border: '3px solid rgba(102,126,234,0.4)',
  },
  headerInfo: {},
  name: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
  },
  email: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
  },
  closeBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
    position: 'sticky',
    top: '120px',
    zIndex: 9,
  },
  tab: {
    padding: '1rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderBottom: '3px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    color: '#667eea',
    borderBottomColor: '#667eea',
  },
  content: {
    padding: '2rem',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  infoCard: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '1.25rem',
    marginBottom: '1rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '500',
  },
  notesContainer: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
    padding: '1.5rem',
  },
  notesTextarea: {
    width: '100%',
    minHeight: '200px',
    padding: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    marginBottom: '1rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  btn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.4rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  statusPending: {
    background: 'rgba(255,193,7,0.2)',
    color: '#ffc107',
  },
  statusApproved: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  statusActive: {
    background: 'rgba(102,126,234,0.2)',
    color: '#667eea',
  },
  fileUpload: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
  },
  fileDelete: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '6px',
    color: '#e94560',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
};

export default function ProfessionalDetailModal({ professional, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(professional?.adminNotes || '');
  const [status, setStatus] = useState(professional?.status || 'pending');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [approvalChecklist, setApprovalChecklist] = useState({
    profileComplete: false,
    portfolioReviewed: false,
    verificationReviewed: false,
    licenseReviewed: false,
  });
  const [decisionReason, setDecisionReason] = useState('');
  const isReadyForMatching = Object.values(approvalChecklist).every(Boolean) && status === 'approved';
  
  const handleSave = async () => {
    setSaving(true);
    try {
      if (professional?.id) {
        await client.models.Professional.update({
          id: professional.id,
          adminNotes: notes,
          status: status,
          reviewChecklist: JSON.stringify(approvalChecklist),
          reviewDecisionReason: decisionReason,
        });
        
        if (onUpdate) {
          onUpdate();
        }
        
        alert('✅ Changes saved successfully!');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };
  
  if (!professional) return null;

  const schoolStatusRaw = professional.educationYearsCompleted || '';
  const schoolStatus =
    schoolStatusRaw === 'in_school'
      ? 'In school'
      : schoolStatusRaw === 'graduated'
        ? 'Graduated'
        : schoolStatusRaw || 'Not provided';
  const yearsExperience =
    professional.yearsWorking ??
    professional.yearsInSalon ??
    'Not provided';
  const licenseState =
    professional.licenseState ||
    professional.inSalonTrainingDetails ||
    'Not provided';
  const communityInterests = professional.workValues || [];
  
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              {professional.firstName?.charAt(0) || 'P'}
            </div>
            <div style={styles.headerInfo}>
              <div style={styles.name}>
                {professional.firstName} {professional.lastName}
              </div>
              <div style={styles.email}>{professional.email}</div>
              <div style={{ marginTop: '0.5rem' }}>
                <span style={{
                  ...styles.statusBadge,
                  ...(status === 'pending' ? styles.statusPending :
                      status === 'approved' ? styles.statusApproved :
                      status === 'active' ? styles.statusActive :
                      styles.statusInactive),
                }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                {isReadyForMatching && (
                  <span style={{
                    marginLeft: '0.5rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    background: 'rgba(76,175,80,0.2)',
                    color: '#9ae2a3',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}>
                    Ready for matching
                  </span>
                )}
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕ Close</button>
        </div>
        
        <div style={styles.tabs}>
          {[
            { id: 'overview', label: '📋 Overview' },
            { id: 'verification', label: '✅ Verification' },
            { id: 'notes', label: '📝 Notes & Details' },
            { id: 'files', label: '📎 Files & Documents' },
            { id: 'activity', label: '📊 Activity History' },
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
        
        <div style={styles.content}>
          {activeTab === 'overview' && (
            <div>
              <div style={styles.twoColumn}>
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>📞 Contact Information</div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{professional.email}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{professional.phone || 'Not provided'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Instagram</div>
                    <div style={styles.infoValue}>{professional.instagramHandle || 'Not provided'}</div>
                  </div>
                </div>
                
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>💼 Professional Info</div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Experience Level</div>
                    <div style={styles.infoValue}>{professional.experienceLevel || 'Not specified'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>License Number</div>
                    <div style={styles.infoValue}>{professional.licenseNumber || 'Not provided'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>License State</div>
                    <div style={styles.infoValue}>{licenseState}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Years Experience</div>
                    <div style={styles.infoValue}>{yearsExperience}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Salon</div>
                    <div style={styles.infoValue}>{professional.salonName || 'Not specified'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Specialties</div>
                    <div style={styles.infoValue}>
                      {professional.specialties?.length > 0 
                        ? professional.specialties.join(', ')
                        : 'None specified'}
                    </div>
                  </div>
                </div>
              </div>

              {(professional.educationSchool || professional.education || professional.signatureService || professional.serviceWantToTry || communityInterests.length > 0) && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Structured Onboarding Data</div>
                  {professional.educationSchool && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Education</div>
                      <div style={styles.infoValue}>
                        {professional.educationSchool}
                        {schoolStatus ? ` • ${schoolStatus}` : ''}
                      </div>
                    </div>
                  )}
                  {professional.education && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Additional Education Notes</div>
                      <div style={styles.infoValue}>{professional.education}</div>
                    </div>
                  )}
                  {(professional.signatureService || professional.serviceWantToTry) && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Service Direction</div>
                      <div style={styles.infoValue}>
                        {professional.signatureService ? `Signature: ${professional.signatureService}` : 'Signature: —'}
                        <br />
                        {professional.serviceWantToTry ? `Wants to practice: ${professional.serviceWantToTry}` : 'Wants to practice: —'}
                      </div>
                    </div>
                  )}
                  {communityInterests.length > 0 && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Community Interests</div>
                      <div style={styles.infoValue}>
                        {communityInterests.join(', ')}
                        {professional.workValuesOther ? ` (${professional.workValuesOther})` : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Approval Console</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Required Checklist</div>
                  {[
                    ['profileComplete', 'Profile complete'],
                    ['portfolioReviewed', 'Portfolio reviewed'],
                    ['verificationReviewed', 'Verification docs reviewed'],
                    ['licenseReviewed', 'License reviewed'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.9rem' }}>
                      <input
                        type="checkbox"
                        checked={approvalChecklist[key]}
                        onChange={(e) => setApprovalChecklist((prev) => ({ ...prev, [key]: e.target.checked }))}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Decision Reason</div>
                  <textarea
                    value={decisionReason}
                    onChange={(e) => setDecisionReason(e.target.value)}
                    placeholder="Required for reject/needs changes decisions."
                    style={{ ...styles.notesTextarea, minHeight: '90px', marginBottom: 0 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => setStatus('approved')}
                  >
                    Approve
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnSecondary, borderColor: 'rgba(255,193,7,0.6)', color: '#ffd56e' }}
                    onClick={() => setStatus('needs_changes')}
                  >
                    Needs changes
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnSecondary, borderColor: 'rgba(244,67,54,0.6)', color: '#ff9088' }}
                    onClick={() => setStatus('rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>⚙️ Status Management</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Current Status</div>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginTop: '0.5rem',
                    }}
                  >
                    <option value="pending_review">Pending review</option>
                    <option value="manual_review">Manual review</option>
                    <option value="needs_changes">Needs changes</option>
                    <option value="rejected">Rejected</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>🪪 Identity Verification</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Status</div>
                  <div style={styles.infoValue}>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      ...(professional.identityVerificationStatus === 'verified' ? { background: 'rgba(76,175,80,0.2)', color: '#4caf50' } :
                          professional.identityVerificationStatus === 'manual_review' ? { background: 'rgba(255,193,7,0.2)', color: '#ffc107' } :
                          professional.identityVerificationStatus === 'failed' ? { background: 'rgba(244,67,54,0.2)', color: '#f44336' } :
                          { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }),
                    }}>
                      {professional.identityVerificationStatus || 'pending'}
                    </span>
                    {professional.identityVerificationScore != null && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        Score: {professional.identityVerificationScore.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>ID Type</div>
                  <div style={styles.infoValue}>{professional.idDocumentType || 'Not specified'}</div>
                </div>
                {(professional.idDocumentUrl || professional.verificationSelfieUrl) && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {professional.idDocumentUrl && (
                      <a href={professional.idDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', background: 'rgba(102,126,234,0.2)', border: '1px solid #667eea', borderRadius: '8px', color: '#667eea', fontSize: '0.9rem', textDecoration: 'none' }}>
                        View ID Document
                      </a>
                    )}
                    {professional.verificationSelfieUrl && (
                      <a href={professional.verificationSelfieUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.5rem 1rem', background: 'rgba(102,126,234,0.2)', border: '1px solid #667eea', borderRadius: '8px', color: '#667eea', fontSize: '0.9rem', textDecoration: 'none' }}>
                        View Selfie
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>📋 License Verification</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>License Number</div>
                  <div style={styles.infoValue}>{professional.licenseNumber || 'Not provided'}</div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>License State</div>
                  <div style={styles.infoValue}>{licenseState}</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                  Manually verify license with state board if required for your market.
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📝 Admin Notes & Details</div>
              <div style={styles.notesContainer}>
                <textarea
                  style={styles.notesTextarea}
                  placeholder="Add notes, details, reminders, or any information about this professional..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div style={styles.buttonRow}>
                  <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : '💾 Save Notes'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'files' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📎 Files & Documents</div>
              <div style={styles.fileUpload}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                <div style={{ marginBottom: '0.5rem' }}>Drag & drop files here</div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="pro-file-upload"
                />
                <label
                  htmlFor="pro-file-upload"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(102,126,234,0.2)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                  }}
                >
                  Choose Files
                </label>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div style={styles.fileList}>
                  {uploadedFiles.map(file => (
                    <div key={file.id} style={styles.fileItem}>
                      <div>📄 {file.name}</div>
                      <button
                        style={styles.fileDelete}
                        onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📊 Activity History</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                Activity history will be tracked here (requests, bookings, etc.)
              </div>
            </div>
          )}
        </div>
        
        <div style={{
          padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
        }}>
          <button
            style={{ ...styles.btn, ...styles.btnSecondary }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{ ...styles.btn, ...styles.btnPrimary }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save All Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

