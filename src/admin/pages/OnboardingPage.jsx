import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { generateClient } from 'aws-amplify/data';
import { shouldUseMockData } from '../../utils/mockDataService';
import { mockModels } from '../../matching';
import { mockProfessionals } from '../data/mockProfessionals';
import ModelDetailModal from '../components/ModelDetailModal';
import ProfessionalDetailModal from '../components/ProfessionalDetailModal';
import {
  normalizeApprovalStatus,
  needsAdminReview,
  identityNeedsReview,
} from '../utils/approvalStatus';

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch {
  client = null;
}

const styles = {
  container: { padding: '2rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.25rem',
    textAlign: 'center',
  },
  statValue: { fontSize: '2rem', fontWeight: '700' },
  statLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  tabActive: {
    background: 'rgba(233,69,96,0.2)',
    borderColor: '#e94560',
    color: '#e94560',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto auto',
    gap: '1rem',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  typeBadge: {
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  name: { fontWeight: '600', fontSize: '1rem' },
  meta: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem' },
  badge: {
    padding: '0.25rem 0.65rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
  },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  btn: {
    padding: '0.4rem 0.85rem',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: '#fff',
    fontSize: '0.8rem',
    cursor: 'pointer',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #4caf50, #2e7d32)',
    border: 'none',
  },
  btnWarn: {
    background: 'rgba(255,193,7,0.15)',
    borderColor: 'rgba(255,193,7,0.4)',
    color: '#ffc107',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    color: 'rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
  },
  links: { marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
};

function statusBadgeStyle(status) {
  const n = normalizeApprovalStatus(status);
  if (n === 'approved') return { background: 'rgba(76,175,80,0.2)', color: '#4caf50' };
  if (n === 'manual_review') return { background: 'rgba(255,193,7,0.2)', color: '#ffc107' };
  if (n === 'needs_changes') return { background: 'rgba(255,152,0,0.2)', color: '#ff9800' };
  if (n === 'rejected') return { background: 'rgba(244,67,54,0.2)', color: '#f44336' };
  return { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' };
}

function mapModelRow(profile) {
  return {
    type: 'model',
    id: profile.id,
    record: profile,
    name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
    email: profile.email || '',
    status: profile.status,
    identityStatus: profile.identityVerificationStatus,
    phone: profile.phone,
  };
}

function mapProfessionalRow(pro) {
  return {
    type: 'professional',
    id: pro.id,
    record: pro,
    name: `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || 'Unknown',
    email: pro.email || '',
    status: pro.status,
    identityStatus: pro.identityVerificationStatus,
    phone: pro.phone,
    salon: pro.salonName,
  };
}

export default function OnboardingPage() {
  const [activeTab, setActiveTab] = useState('queue');
  const [models, setModels] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    if (shouldUseMockData() || !client?.models) {
      const mockModelRows = (mockModels || []).slice(0, 6).map((m) =>
        mapModelRow({
          id: String(m.id),
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email || 'model@mock.local',
          status: m.status || 'pending',
          identityVerificationStatus: m.identityVerificationStatus || 'manual_review',
          phone: m.phone,
        })
      );
      const mockProRows = mockProfessionals.slice(0, 6).map((p, i) =>
        mapProfessionalRow({
          id: p.id || `mock-pro-${i}`,
          firstName: p.firstName || p.name?.split(' ')[0],
          lastName: p.lastName || p.name?.split(' ').slice(1).join(' '),
          email: p.email || `pro${i}@mock.local`,
          status: p.status === 'active' ? 'approved' : 'pending',
          identityVerificationStatus: 'manual_review',
          salonName: p.salon,
        })
      );
      setModels(mockModelRows.filter((r) => needsAdminReview(r.status) || identityNeedsReview(r.identityStatus)));
      setProfessionals(mockProRows.filter((r) => needsAdminReview(r.status) || identityNeedsReview(r.identityStatus)));
      setLoading(false);
      return;
    }

    try {
      const [modelRes, proRes] = await Promise.all([
        client.models.ModelProfile.list({ limit: 200 }),
        client.models.Professional.list({ limit: 200 }),
      ]);
      const modelRows = (modelRes.data || [])
        .map(mapModelRow)
        .filter((r) => needsAdminReview(r.status) || identityNeedsReview(r.identityStatus));
      const proRows = (proRes.data || [])
        .map(mapProfessionalRow)
        .filter((r) => needsAdminReview(r.status) || identityNeedsReview(r.identityStatus));
      setModels(modelRows);
      setProfessionals(proRows);
    } catch (err) {
      console.error('Review queue load failed:', err);
      setModels([]);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const updateStatus = async (row, nextStatus, e) => {
    e?.stopPropagation?.();
    if (shouldUseMockData() || !client?.models) return;
    try {
      if (row.type === 'model' && client.models.ModelProfile) {
        await client.models.ModelProfile.update({ id: row.id, status: nextStatus });
      } else if (row.type === 'professional' && client.models.Professional) {
        await client.models.Professional.update({ id: row.id, status: nextStatus });
      }
      await loadQueue();
    } catch (err) {
      console.error('Status update failed:', err);
      alert(`Could not update status: ${err.message}`);
    }
  };

  const queue =
    activeTab === 'models'
      ? models
      : activeTab === 'professionals'
        ? professionals
        : [...models, ...professionals].sort((a, b) => a.name.localeCompare(b.name));

  const stats = {
    modelsPending: models.length,
    prosPending: professionals.length,
    identityReview: [...models, ...professionals].filter((r) => identityNeedsReview(r.identityStatus)).length,
    total: models.length + professionals.length,
  };

  const openRow = (row) => {
    if (row.type === 'model') {
      setSelectedProfessional(null);
      setSelectedModel(row.record);
    } else {
      setSelectedModel(null);
      setSelectedProfessional(row.record);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Review Queue</h1>
        <p style={styles.subtitle}>
          Approve new models and professionals after onboarding. Identity verification can be completed here while SES is pending.
        </p>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#e94560' }}>{stats.total}</div>
          <div style={styles.statLabel}>Needs review</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#667eea' }}>{stats.modelsPending}</div>
          <div style={styles.statLabel}>Models</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>{stats.prosPending}</div>
          <div style={styles.statLabel}>Professionals</div>
        </div>
        <div style={styles.statCard}>
          <div style={{ ...styles.statValue, color: '#ffc107' }}>{stats.identityReview}</div>
          <div style={styles.statLabel}>ID / selfie review</div>
        </div>
      </div>

      <div style={styles.tabs}>
        {[
          { id: 'queue', label: `All (${stats.total})` },
          { id: 'models', label: `Models (${stats.modelsPending})` },
          { id: 'professionals', label: `Professionals (${stats.prosPending})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.empty}>Loading review queue…</div>
      ) : queue.length === 0 ? (
        <div style={styles.empty}>
          <p>No profiles waiting for review.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
            New signups appear here when status is pending or identity needs manual review.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {queue.map((row) => (
            <div
              key={`${row.type}-${row.id}`}
              style={styles.row}
              onClick={() => openRow(row)}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(233,69,96,0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
            >
              <span
                style={{
                  ...styles.typeBadge,
                  background: row.type === 'model' ? 'rgba(233,69,96,0.2)' : 'rgba(102,126,234,0.2)',
                  color: row.type === 'model' ? '#e94560' : '#667eea',
                }}
              >
                {row.type}
              </span>
              <div>
                <div style={styles.name}>{row.name}</div>
                <div style={styles.meta}>
                  {row.email}
                  {row.salon ? ` · ${row.salon}` : ''}
                  {row.phone ? ` · ${row.phone}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
                <span style={{ ...styles.badge, ...statusBadgeStyle(row.status) }}>
                  {normalizeApprovalStatus(row.status).replace('_', ' ')}
                </span>
                {identityNeedsReview(row.identityStatus) && (
                  <span style={{ ...styles.badge, background: 'rgba(255,193,7,0.15)', color: '#ffc107' }}>
                    ID: {row.identityStatus || 'pending'}
                  </span>
                )}
              </div>
              <div style={styles.actions} onClick={(e) => e.stopPropagation()}>
                <button type="button" style={{ ...styles.btn, ...styles.btnPrimary }} onClick={(e) => updateStatus(row, 'active', e)}>
                  Approve
                </button>
                <button type="button" style={{ ...styles.btn, ...styles.btnWarn }} onClick={(e) => updateStatus(row, 'manual_review', e)}>
                  Manual review
                </button>
                <button type="button" style={styles.btn} onClick={() => openRow(row)}>
                  Open
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p style={styles.links}>
        Full galleries: <Link to="/admin/models" style={{ color: '#e94560' }}>Models</Link>
        {' · '}
        <Link to="/admin/professionals" style={{ color: '#667eea' }}>Professionals</Link>
        {' · '}
        <Link to="/admin/training" style={{ color: 'rgba(255,255,255,0.6)' }}>Training program</Link>
      </p>

      {selectedModel && (
        <ModelDetailModal
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
          onUpdate={() => {
            setSelectedModel(null);
            loadQueue();
          }}
        />
      )}
      {selectedProfessional && (
        <ProfessionalDetailModal
          professional={selectedProfessional}
          onClose={() => setSelectedProfessional(null)}
          onUpdate={() => {
            setSelectedProfessional(null);
            loadQueue();
          }}
        />
      )}
    </div>
  );
}
