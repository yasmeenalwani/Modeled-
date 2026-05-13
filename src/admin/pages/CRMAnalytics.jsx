import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';

const client = generateClient();

const styles = {
  container: {
    padding: '2rem',
    background: '#0d0d14',
    color: '#fff',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.5)',
  },
  chartContainer: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
};

export default function CRMAnalytics() {
  const [analytics, setAnalytics] = useState({
    totalProspects: 0,
    conversionRate: 0,
    avgResponseTime: 0,
    campaignOpenRate: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load prospects
      const { data: prospects } = await client.models.Prospect.list();
      const total = prospects?.length || 0;
      const closed = prospects?.filter(p => p.stage === 'closed_won').length || 0;
      
      // Load campaigns
      const { data: campaigns } = await client.models.OutreachCampaign.list();
      const totalSent = campaigns?.reduce((sum, c) => sum + (c.totalSent || 0), 0) || 0;
      const totalOpened = campaigns?.reduce((sum, c) => sum + (c.totalOpened || 0), 0) || 0;
      
      setAnalytics({
        totalProspects: total,
        conversionRate: total > 0 ? ((closed / total) * 100).toFixed(1) : 0,
        avgResponseTime: 24, // TODO: Calculate from activities
        campaignOpenRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>CRM Analytics</h2>
      
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{analytics.totalProspects}</div>
          <div style={styles.statLabel}>Total Prospects</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{analytics.conversionRate}%</div>
          <div style={styles.statLabel}>Conversion Rate</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{analytics.avgResponseTime}h</div>
          <div style={styles.statLabel}>Avg Response Time</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{analytics.campaignOpenRate}%</div>
          <div style={styles.statLabel}>Campaign Open Rate</div>
        </div>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.chartTitle}>Pipeline by Stage</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
          Chart visualization coming soon
        </div>
      </div>

      <div style={styles.chartContainer}>
        <div style={styles.chartTitle}>Outreach Performance</div>
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
          Email/SMS performance metrics coming soon
        </div>
      </div>
    </div>
  );
}

