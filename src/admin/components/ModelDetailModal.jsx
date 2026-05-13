import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getUrl, list } from 'aws-amplify/storage';
import { formatPrice } from '../data/services';
import ModelCardOverview from '../../components/profile/ModelCardOverview';
import ModelFocusLayout from '../../components/profile/ModelFocusLayout';

const client = generateClient();

// ============ STYLES ============
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
    border: '1px solid rgba(233,69,96,0.3)',
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
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '600',
    border: '3px solid rgba(233,69,96,0.4)',
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
  
  // Tabs
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
    color: '#e94560',
    borderBottomColor: '#e94560',
  },
  
  // Content
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
  
  // Two column grid
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
  },
  attributeRow: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.35rem',
    flexWrap: 'wrap',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '0.75rem',
  },
  photoThumb: {
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(0,0,0,0.25)',
    aspectRatio: '3/4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoThumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  
  // Info card
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
  
  // Notes section
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
  notesHistory: {
    marginTop: '1.5rem',
  },
  noteItem: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    marginBottom: '0.75rem',
    borderLeft: '3px solid #e94560',
  },
  noteHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  noteDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
  },
  noteText: {
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  
  // File upload
  fileUpload: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '1rem',
  },
  fileUploadHover: {
    borderColor: '#e94560',
    background: 'rgba(233,69,96,0.1)',
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
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  fileIcon: {
    fontSize: '1.5rem',
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
  
  // Tags
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  tag: {
    padding: '0.4rem 0.9rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tagInput: {
    padding: '0.4rem 0.9rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#fff',
    width: '150px',
  },
  
  // Status badge
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
  statusInactive: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Buttons
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
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    color: '#fff',
  },
  btnSecondary: {
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  
  // Activity timeline
  timeline: {
    position: 'relative',
    paddingLeft: '2rem',
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: '1.5rem',
    borderLeft: '2px solid rgba(255,255,255,0.1)',
    paddingLeft: '1.5rem',
  },
  timelineDot: {
    position: 'absolute',
    left: '-8px',
    top: '0',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#e94560',
    border: '3px solid rgba(26,26,46,0.95)',
  },
  timelineContent: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '1rem',
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.5rem',
  },
  timelineText: {
    fontSize: '0.9rem',
  },
};

export default function ModelDetailModal({ model, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState(model?.adminNotes || '');
  const [tags, setTags] = useState(model?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [status, setStatus] = useState(model?.status || 'pending');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [approvalChecklist, setApprovalChecklist] = useState({
    profileComplete: false,
    photosReviewed: false,
    verificationReviewed: false,
    servicePrefsReviewed: false,
  });
  const [decisionReason, setDecisionReason] = useState('');
  const [resolvedGalleryUrls, setResolvedGalleryUrls] = useState([]);

  const safeParseJson = (value, fallback) => {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    if (typeof value !== 'string') return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const favoriteService = safeParseJson(model?.favoriteService, {});
  const onboardingPreferences =
    (Array.isArray(model?.servicePreferences) && model.servicePreferences.length > 0
      ? model.servicePreferences
      : favoriteService?.preferences) || [];
  const onboardingAvailability =
    (model?.availabilityByDay && typeof model.availabilityByDay === 'object'
      ? model.availabilityByDay
      : safeParseJson(model?.communityInterestsOther, {})?.availabilityByDay) || {};

  const serviceLabelMap = {
    hair_cut: 'Cut',
    hair_color: 'Color',
    hair_style: 'Style',
    hair_extensions: 'Extensions',
    hair_braids: 'Braids',
    hair_treatment: 'Treatment',
    hair_transformation: 'Transformation',
    beauty_brows: 'Brows',
    beauty_lashes: 'Lashes',
    beauty_nails: 'Nails',
    beauty_skin: 'Skin',
    beauty_injectables: 'Injectables',
    beauty_makeup: 'Makeup',
  };

  const prettyServicePreferences = onboardingPreferences.map((id) => serviceLabelMap[id] || id);
  const modelingFocusRaw = model.modelingFocus || favoriteService?.modelingFocus || '';
  const modelingFocusLabel =
    modelingFocusRaw === 'everyday'
      ? 'Everyday'
      : modelingFocusRaw === 'editorial'
        ? 'Editorial'
        : modelingFocusRaw === 'both'
          ? 'Everyday & editorial'
          : modelingFocusRaw || '—';
  const mediaTraining =
    (model.mediaTraining && typeof model.mediaTraining === 'object' ? model.mediaTraining : null) ||
    favoriteService?.mediaTraining ||
    {};
  const trainingSummary = [
    mediaTraining.photo ? 'Photo' : null,
    mediaTraining.video ? 'Video' : null,
    mediaTraining.acting ? 'Acting' : null,
  ].filter(Boolean);
  const socialPresence = favoriteService?.socials || {};
  const socialSummary = [
    socialPresence.instagram ? `Instagram: ${socialPresence.instagram}` : null,
    socialPresence.tiktok ? `TikTok: ${socialPresence.tiktok}` : null,
    socialPresence.other ? `Other: ${socialPresence.other}` : null,
  ].filter(Boolean);
  const directGalleryUrls = (() => {
    const out = [];
    const add = (u) => {
      if (u && typeof u === 'string' && !out.includes(u)) out.push(u);
    };
    (model.photoUrls || []).forEach(add);
    add(model.headshotUrl);
    add(model.idDocumentUrl);
    add(model.verificationSelfieUrl);
    return out;
  })();
  const storedPhotoKeys = (() => {
    const keys = [];
    const add = (k) => {
      if (k && typeof k === 'string' && !keys.includes(k)) keys.push(k);
    };
    (Array.isArray(model.photoKeys) ? model.photoKeys : []).forEach(add);
    Object.values(model.photoMetadata || {}).forEach((entry) => add(entry?.key));
    return keys;
  })();
  const isReadyForMatching = Object.values(approvalChecklist).every(Boolean) && status === 'approved';

  useEffect(() => {
    let isMounted = true;
    async function resolveGalleryUrls() {
      const resolved = [...directGalleryUrls];
      for (const path of storedPhotoKeys) {
        try {
          const urlResult = await getUrl({ path });
          const url = urlResult?.url?.toString();
          if (url && !resolved.includes(url)) {
            resolved.push(url);
          }
        } catch (error) {
          console.warn('Could not resolve photo key in admin modal:', path, error);
        }
      }
      if (model?.userId) {
        const candidatePrefixes = [
          `profile-photos/models/${model.userId}/`,
          `identity-verification/models/${model.userId}/`,
        ];
        for (const prefix of candidatePrefixes) {
          try {
            const listed = await list({ path: prefix });
            const items = Array.isArray(listed?.items) ? listed.items : [];
            for (const item of items) {
              const itemPath = item?.path;
              if (!itemPath) continue;
              try {
                const itemUrl = await getUrl({ path: itemPath });
                const url = itemUrl?.url?.toString();
                if (url && !resolved.includes(url)) {
                  resolved.push(url);
                }
              } catch (itemErr) {
                console.warn('Could not resolve listed photo path:', itemPath, itemErr);
              }
            }
          } catch (listErr) {
            console.warn('Could not list storage prefix for admin gallery:', prefix, listErr);
          }
        }
      }
      if (isMounted) {
        setResolvedGalleryUrls(resolved);
      }
    }
    resolveGalleryUrls();
    return () => {
      isMounted = false;
    };
  }, [model?.id]);
  
  // Mock activity history
  const activityHistory = [
    { date: new Date(), type: 'profile_created', text: 'Profile created and submitted' },
    { date: new Date(Date.now() - 86400000), type: 'photo_uploaded', text: '5 photos uploaded' },
    { date: new Date(Date.now() - 172800000), type: 'status_changed', text: 'Status changed to pending' },
  ];
  
  const handleSave = async () => {
    setSaving(true);
    try {
      // Update model profile with notes, tags, status
      if (model?.id) {
        await client.models.ModelProfile.update({
          id: model.id,
          adminNotes: notes,
          tags: tags,
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
  
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    // In real implementation, upload to S3 and save URLs
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };
  
  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId));
  };
  
  if (!model) return null;
  
  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>
              {model.firstName?.charAt(0) || 'M'}
            </div>
            <div style={styles.headerInfo}>
              <div style={styles.name}>
                {model.firstName} {model.lastName}
              </div>
              <div style={styles.email}>{model.email}</div>
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
        
        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { id: 'overview', label: '📋 Overview' },
            { id: 'photos', label: '📸 Photos' },
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
        
        {/* Content */}
        <div style={styles.content}>
          {activeTab === 'overview' && (
            <div>
              <ModelCardOverview model={model} />
              <ModelFocusLayout model={model} />

              {(modelingFocusRaw ||
                trainingSummary.length > 0 ||
                prettyServicePreferences.length > 0 ||
                Object.values(onboardingAvailability).some((times) => Array.isArray(times) && times.length > 0)) && (
                <div style={{ ...styles.section, marginTop: '1.25rem' }}>
                  <div style={styles.sectionTitle}>Structured Onboarding Data</div>

                  {(modelingFocusRaw || trainingSummary.length > 0) && (
                    <div style={{ ...styles.infoCard, marginBottom: '0.75rem' }}>
                      <div style={styles.infoLabel}>Modeling path & training</div>
                      <div style={styles.infoValue}>
                        <div style={{ marginBottom: '0.35rem' }}>
                          <strong>Interest:</strong> {modelingFocusLabel}
                        </div>
                        <div>
                          <strong>Photo / video / acting:</strong>{' '}
                          {trainingSummary.length > 0 ? trainingSummary.join(', ') : 'Not specified'}
                        </div>
                      </div>
                    </div>
                  )}
                  {socialSummary.length > 0 && (
                    <div style={{ ...styles.infoCard, marginBottom: '0.75rem' }}>
                      <div style={styles.infoLabel}>Social presence / currency</div>
                      <div style={styles.infoValue}>
                        {socialSummary.map((line) => (
                          <div key={line} style={{ marginBottom: '0.3rem' }}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prettyServicePreferences.length > 0 && (
                    <div style={{ ...styles.infoCard, marginBottom: '0.75rem' }}>
                      <div style={styles.infoLabel}>Service Preferences</div>
                      <div style={{ ...styles.tagsContainer, marginBottom: 0 }}>
                        {prettyServicePreferences.map((pref) => (
                          <span key={pref} style={{ ...styles.tag, padding: '0.3rem 0.7rem' }}>
                            {pref}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.values(onboardingAvailability).some((times) => Array.isArray(times) && times.length > 0) && (
                    <div style={styles.infoCard}>
                      <div style={styles.infoLabel}>Availability By Day</div>
                      {Object.entries(onboardingAvailability)
                        .filter(([, times]) => Array.isArray(times) && times.length > 0)
                        .map(([day, times]) => (
                          <div key={day} style={styles.attributeRow}>
                            <strong>{day}</strong>
                            <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                              {times
                                .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
                                .join(', ')}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <div style={{ ...styles.section, marginTop: '2rem' }}>
                <div style={styles.sectionTitle}>🏷️ Tags</div>
                <div style={styles.tagsContainer}>
                  {tags.map(tag => (
                    <div key={tag} style={styles.tag}>
                      {tag}
                      <span 
                        style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  <input
                    type="text"
                    style={styles.tagInput}
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                </div>
              </div>
              
              <div style={styles.section}>
                <div style={styles.sectionTitle}>Approval Console</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Required Checklist</div>
                  {[
                    ['profileComplete', 'Profile complete'],
                    ['photosReviewed', 'Photos reviewed'],
                    ['verificationReviewed', 'Verification docs reviewed'],
                    ['servicePrefsReviewed', 'Service preferences reviewed'],
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

          {activeTab === 'photos' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>Profile & verification images</div>
              {resolvedGalleryUrls.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
                  No images on file yet. If the model finished onboarding recently, refresh the list or confirm uploads saved to their profile.
                </p>
              ) : (
                <div style={styles.photoGrid}>
                  {resolvedGalleryUrls.map((src, i) => (
                    <a
                      key={`${i}-${src.slice(-24)}`}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...styles.photoThumb, textDecoration: 'none' }}
                      title="Open full image"
                    >
                      <img src={src} alt={`Model photo ${i + 1}`} style={styles.photoThumbImg} loading="lazy" />
                    </a>
                  ))}
                </div>
              )}
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '1rem', lineHeight: 1.5 }}>
                Onboarding portraits, headshot when set, plus ID document and verification selfie URLs when submitted. Click any thumbnail for the full-resolution link.
              </p>
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
                      ...(model.identityVerificationStatus === 'verified' ? { background: 'rgba(76,175,80,0.2)', color: '#4caf50' } :
                          model.identityVerificationStatus === 'manual_review' ? { background: 'rgba(255,193,7,0.2)', color: '#ffc107' } :
                          model.identityVerificationStatus === 'failed' ? { background: 'rgba(244,67,54,0.2)', color: '#f44336' } :
                          { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }),
                    }}>
                      {model.identityVerificationStatus || 'pending'}
                    </span>
                    {model.identityVerificationScore != null && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                        Score: {model.identityVerificationScore.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>ID Type</div>
                  <div style={styles.infoValue}>{model.idDocumentType || 'Not specified'}</div>
                </div>
                {(model.idDocumentUrl || model.verificationSelfieUrl) && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {model.idDocumentUrl && (
                      <a
                        href={model.idDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          border: '1px solid rgba(233,69,96,0.45)',
                          background: 'rgba(233,69,96,0.18)',
                          color: '#ffd6df',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                        }}
                      >
                        View ID Document
                      </a>
                    )}
                    {model.verificationSelfieUrl && (
                      <a
                        href={model.verificationSelfieUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.55rem 0.9rem',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          border: '1px solid rgba(233,69,96,0.45)',
                          background: 'rgba(233,69,96,0.18)',
                          color: '#ffd6df',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                        }}
                      >
                        View Selfie
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div style={styles.section}>
                <div style={styles.sectionTitle}>📸 Photo Analysis (AI)</div>
                <div style={styles.infoCard}>
                  <div style={styles.infoLabel}>Status</div>
                  <div style={styles.infoValue}>
                    <span style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      ...(model.photoAnalysisStatus === 'completed' ? { background: 'rgba(76,175,80,0.2)', color: '#4caf50' } :
                          model.photoAnalysisStatus === 'failed' ? { background: 'rgba(244,67,54,0.2)', color: '#f44336' } :
                          { background: 'rgba(255,193,7,0.2)', color: '#ffc107' }),
                    }}>
                      {model.photoAnalysisStatus || 'pending'}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.5rem' }}>
                  Hair/beauty attributes are auto-tagged from photos. User can confirm or correct during onboarding.
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
                  placeholder="Add notes, details, reminders, or any information about this model..."
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
              
              {/* Notes History */}
              {notes && (
                <div style={styles.notesHistory}>
                  <div style={styles.sectionTitle}>📜 Notes History</div>
                  <div style={styles.noteItem}>
                    <div style={styles.noteHeader}>
                      <div style={styles.noteDate}>
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                    <div style={styles.noteText}>{notes}</div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'files' && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📎 Files & Documents</div>
              
              <div
                style={styles.fileUpload}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = '#e94560';
                }}
                onDragLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  handleFileUpload({ target: { files: e.dataTransfer.files } });
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📤</div>
                <div style={{ marginBottom: '0.5rem' }}>Drag & drop files here</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                  or click to browse
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(233,69,96,0.2)',
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
                      <div style={styles.fileInfo}>
                        <div style={styles.fileIcon}>📄</div>
                        <div>
                          <div style={{ fontWeight: '500' }}>{file.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            {file.size ? `${(file.size / 1024).toFixed(1)} KB` : ''} • {file.uploadedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <button
                        style={styles.fileDelete}
                        onClick={() => handleDeleteFile(file.id)}
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
              <div style={styles.timeline}>
                {activityHistory.map((activity, i) => (
                  <div key={i} style={styles.timelineItem}>
                    <div style={styles.timelineDot} />
                    <div style={styles.timelineContent}>
                      <div style={styles.timelineDate}>
                        {activity.date.toLocaleString()}
                      </div>
                      <div style={styles.timelineText}>{activity.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
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

