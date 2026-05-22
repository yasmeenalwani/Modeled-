import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { useNavigate } from 'react-router-dom';
import { shouldUseMockData } from '../../utils/mockDataService';
import { getProfessionalDraftsForPartner } from '../data/professionalDrafts';
import { mapDraftRowForTeam } from '../../utils/professionalProfile';

let client;
try {
  if (!shouldUseMockData()) client = generateClient();
} catch {
  client = null;
}

const styles = {
  stats: {
    display: 'flex',
    gap: '1.5rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  stat: {
    padding: '0.75rem 1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  statValue: { fontSize: '1.35rem', fontWeight: '700', color: '#e94560' },
  statLabel: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.2rem' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' },
  th: {
    textAlign: 'left',
    padding: '0.65rem 0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.55rem',
    borderRadius: '12px',
    fontSize: '0.72rem',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.75)',
  },
  badgeActive: {
    background: 'rgba(76,175,80,0.2)',
    color: '#4caf50',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: '10px',
    lineHeight: 1.6,
  },
  linkBtn: {
    marginTop: '1rem',
    padding: '0.6rem 1.2rem',
    background: 'rgba(233,69,96,0.2)',
    border: '1px solid rgba(233,69,96,0.4)',
    borderRadius: '8px',
    color: '#e94560',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  hint: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '1rem',
    lineHeight: 1.5,
  },
};

function mapProRow(pro) {
  const name = `${pro.firstName || ''} ${pro.lastName || ''}`.trim() || pro.email || 'Unknown';
  const branch = pro.salonLocationSuffix || pro.salonCity || '—';
  const level = pro.experienceLevel
    ? String(pro.experienceLevel).charAt(0).toUpperCase() + String(pro.experienceLevel).slice(1)
    : '—';
  return {
    id: pro.id,
    name,
    email: pro.email,
    phone: pro.phone,
    branch,
    level,
    status: pro.status || 'pending',
    specialties: pro.specialties || [],
  };
}

function salonNameMatchesPartner(salonName, businessName) {
  if (!salonName || !businessName) return false;
  const s = salonName.toLowerCase();
  const b = businessName.toLowerCase();
  return s.includes(b) || b.includes(s) || s.includes('roman k');
}

export default function PartnerTeamPanel({ partner }) {
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchMode, setMatchMode] = useState('partnerId');

  const partnerId =
    partner?.id && !String(partner.id).startsWith('draft:') ? partner.id : null;
  const isDraft = partner?.isDraft || String(partner?.id || '').startsWith('draft:');

  useEffect(() => {
    let cancelled = false;

    async function loadTeam() {
      setLoading(true);
      if (shouldUseMockData() || !client?.models?.Professional) {
        if (!cancelled) {
          setTeam([]);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, errors } = await client.models.Professional.list({ limit: 300 });
        if (errors?.length) throw new Error(errors[0]?.message);

        let rows = data || [];
        if (partnerId) {
          rows = rows.filter((p) => p.partnerId === partnerId);
          setMatchMode('partnerId');
        } else if (partner?.businessName) {
          rows = rows.filter((p) => salonNameMatchesPartner(p.salonName, partner.businessName));
          setMatchMode('salonName');
        } else {
          rows = [];
        }

        const dbTeam = rows.map(mapProRow);
        const draftTeam = (partner?.slug ? getProfessionalDraftsForPartner(partner.slug) : [])
          .map(mapDraftRowForTeam)
          .filter((d) => !dbTeam.some((m) =>
            m.name.toLowerCase() === d.name.toLowerCase()
          ));

        if (!cancelled) {
          setTeam([...draftTeam, ...dbTeam]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load partner team:', err);
        if (!cancelled) {
          setTeam([]);
          setLoading(false);
        }
      }
    }

    loadTeam();
    return () => { cancelled = true; };
  }, [partnerId, partner?.businessName, partner?.id]);

  const activeCount = team.filter((t) => ['active', 'approved'].includes(String(t.status))).length;

  return (
    <div>
      <p style={styles.hint}>
        Team members are <strong>Professionals</strong> linked via <code>partnerId</code>
        {isDraft && ' (publish this partner first, then assign pros in Professionals admin)'}.
        {matchMode === 'salonName' && !partnerId && (
          <> Showing pros whose salon name matches this business until published.</>
        )}
      </p>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <div style={styles.statValue}>{loading ? '…' : team.length}</div>
          <div style={styles.statLabel}>On roster</div>
        </div>
        <div style={styles.stat}>
          <div style={styles.statValue}>{loading ? '…' : activeCount}</div>
          <div style={styles.statLabel}>Active / approved</div>
        </div>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading team…</p>
      ) : team.length === 0 ? (
        <div style={styles.empty}>
          No professionals assigned yet.
          <br />
          After publish, set each pro&apos;s <strong>partner</strong> to {partner?.businessName || 'this partner'}.
          <br />
          <button
            type="button"
            style={styles.linkBtn}
            onClick={() => navigate('/admin/professionals')}
          >
            Open Professionals →
          </button>
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Branch</th>
              <th style={styles.th}>Level</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {team.map((member) => (
              <tr key={member.id}>
                <td style={styles.td}>
                  <strong>{member.name}</strong>
                  {member.isDraft && (
                    <span style={{ ...styles.badge, marginLeft: '0.35rem', fontSize: '0.65rem' }}>draft</span>
                  )}
                  {member.isDraft && partner?.slug && (
                    <div style={{ marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        style={styles.linkBtn}
                        onClick={() => {
                          const slug = String(member.id).replace('draft:', '');
                          navigate(`/admin/requests?create=1&professionalSlug=${slug}`);
                        }}
                      >
                        + Create request for {member.name.split(' ')[0]}
                      </button>
                    </div>
                  )}
                  {member.specialties?.length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>
                      {member.specialties.slice(0, 3).join(', ')}
                    </div>
                  )}
                </td>
                <td style={styles.td}>
                  <div>{member.email}</div>
                  {member.phone && (
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>{member.phone}</div>
                  )}
                </td>
                <td style={styles.td}>{member.branch}</td>
                <td style={styles.td}>{member.level}</td>
                <td style={styles.td}>
                  <span
                    style={{
                      ...styles.badge,
                      ...(['active', 'approved'].includes(member.status) ? styles.badgeActive : {}),
                    }}
                  >
                    {member.status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
