/**
 * Waitlist Panel Component
 * 
 * Displays waitlist for a request and allows promotion
 */

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { getWaitlistForRequest, promoteFromWaitlist, getMatchById } from '../../utils/matchService';

const client = generateClient();

const styles = {
  panel: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  panelTitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
  },
  waitlistItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  waitlistInfo: {
    flex: 1,
  },
  waitlistPosition: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.25rem',
  },
  waitlistModel: {
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  waitlistScore: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
  },
  promoteBtn: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '1rem',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
  },
};

export default function WaitlistPanel({ requestId, onPromote }) {
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(null);

  useEffect(() => {
    if (requestId) {
      loadWaitlist();
    }
  }, [requestId]);

  const loadWaitlist = async () => {
    try {
      setLoading(true);
      const list = await getWaitlistForRequest(requestId);
      
      // Enrich with model details
      const enriched = await Promise.all(
        list.map(async (match) => {
          try {
            const { data: model } = await client.models.ModelProfile.get({ id: match.modelId });
            return {
              ...match,
              modelName: model ? `${model.firstName} ${model.lastName}` : 'Unknown Model',
            };
          } catch (error) {
            return {
              ...match,
              modelName: 'Unknown Model',
            };
          }
        })
      );
      
      setWaitlist(enriched);
    } catch (error) {
      console.error('Error loading waitlist:', error);
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (matchId) => {
    try {
      setPromoting(matchId);
      await promoteFromWaitlist(requestId);
      await loadWaitlist();
      if (onPromote) {
        onPromote();
      }
      alert('Model promoted from waitlist!');
    } catch (error) {
      console.error('Error promoting from waitlist:', error);
      alert('Error promoting model. Please try again.');
    } finally {
      setPromoting(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.panel}>
        <div style={styles.panelTitle}>Waitlist</div>
        <div style={styles.emptyState}>Loading...</div>
      </div>
    );
  }

  if (waitlist.length === 0) {
    return (
      <div style={styles.panel}>
        <div style={styles.panelTitle}>Waitlist</div>
        <div style={styles.emptyState}>No models on waitlist</div>
      </div>
    );
  }

  return (
    <div style={styles.panel}>
      <div style={styles.panelTitle}>Waitlist ({waitlist.length})</div>
      {waitlist.map((match) => (
        <div key={match.id} style={styles.waitlistItem}>
          <div style={styles.waitlistInfo}>
            <div style={styles.waitlistPosition}>
              Position #{match.waitlistPosition || '?'}
            </div>
            <div style={styles.waitlistModel}>
              {match.modelName}
            </div>
            <div style={styles.waitlistScore}>
              Match Score: {Math.round(match.matchScore || 0)}/100
            </div>
          </div>
          {match.waitlistPosition === 1 && (
            <button
              style={styles.promoteBtn}
              onClick={() => handlePromote(match.id)}
              disabled={promoting === match.id}
            >
              {promoting === match.id ? 'Promoting...' : 'Promote'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

