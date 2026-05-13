import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

// Reuse styles (in production, extract to shared file)
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
    border: '1px solid rgba(139,30,63,0.3)',
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
    background: 'linear-gradient(135deg, #8B1E3F, #D4858A)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
    border: '3px solid rgba(139,30,63,0.4)',
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
    color: '#8B1E3F',
    borderBottomColor: '#8B1E3F',
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
    background: 'linear-gradient(135deg, #8B1E3F, #D4858A)',
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
    background: 'rgba(139,30,63,0.2)',
    color: '#8B1E3F',
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

export default function PartnerDetailModal({ partner, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(partner?.adminNotes || '');
  const [status, setStatus] = useState(partner?.status || 'pending');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  
  const handleSave = async () => {
    setSaving(true);
    try {
      if (partner?.id) {
        await client.models.Partner.update({
          id: partner.id,
          adminNotes: notes,
          status: status,
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
  
  if (!partner) return null;
  
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              🏢
            </div>
            <div style={styles.headerInfo}>
              <div style={styles.name}>{partner.businessName}</div>
              <div style={styles.email}>{partner.email}</div>
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
              </div>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕ Close</button>
        </div>
        
        <div style={styles.tabs}>
          {[
            { id: 'overview', label: '📋 Overview' },
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
                    <div style={styles.infoLabel}>Business Name</div>
                    <div style={styles.infoValue}>{partner.businessName}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Contact Name</div>
                    <div style={styles.infoValue}>{partner.contactName}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Email</div>
                    <div style={styles.infoValue}>{partner.email}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Phone</div>
                    <div style={styles.infoValue}>{partner.phone || 'Not provided'}</div>
                  </div>
                </div>
                
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>📍 Location & Business Info</div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Business Type</div>
                    <div style={styles.infoValue}>{partner.businessType || 'Not specified'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Address</div>
                    <div style={styles.infoValue}>
                      {partner.address ? `${partner.address}, ${partner.city || ''}, ${partner.state || ''} ${partner.zip || ''}`.trim() : 'Not provided'}
                    </div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Website</div>
                    <div style={styles.infoValue}>{partner.website || 'Not provided'}</div>
                  </div>
                  <div style={styles.infoCard}>
                    <div style={styles.infoLabel}>Instagram</div>
                    <div style={styles.infoValue}>{partner.instagramHandle || 'Not provided'}</div>
                  </div>
                </div>
              </div>

              {(partner.somethingFun || partner.communityInterestsOther || partner.businessGrowthGoals) && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Structured Onboarding Data</div>
                  {partner.somethingFun && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Business Notes</div>
                      <div style={styles.infoValue}>{partner.somethingFun}</div>
                    </div>
                  )}
                  {partner.businessGrowthGoals && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Growth Goals</div>
                      <div style={styles.infoValue}>{partner.businessGrowthGoals}</div>
                    </div>
                  )}
                </div>
              )}
              
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'notes' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📝 Admin Notes & Details</div>
              <div style={styles.notesContainer}>
                <textarea
                  style={styles.notesTextarea}
                  placeholder="Add notes, details, reminders, or any information about this partner..."
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
                  id="partner-file-upload"
                />
                <label
                  htmlFor="partner-file-upload"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(139,30,63,0.2)',
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
                Activity history will be tracked here (bookings, professionals, etc.)
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

