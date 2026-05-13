import React, { useState } from 'react';
import { services, formatPrice, formatDuration, getTotalPotentialRevenue, getAverageRevenue } from '../data/services';

// ============ STYLES ============
const styles = {
  container: { padding: '2rem' },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: { fontSize: '1.75rem', fontWeight: '600' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.25rem' },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  
  // Stats
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
  statIcon: { fontSize: '1.5rem', marginBottom: '0.75rem' },
  statValue: { fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.25rem' },
  statLabel: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' },
  
  // Revenue breakdown
  revenueCard: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
    border: '1px solid rgba(233,69,96,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  revenueTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  revenueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  },
  revenueItem: {
    textAlign: 'center',
    padding: '1rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '10px',
  },
  revenueValue: { fontSize: '1.5rem', fontWeight: '700', color: '#4caf50' },
  revenueLabel: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' },
  
  // Table
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '1rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  thRight: { textAlign: 'right' },
  td: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    fontSize: '0.9rem',
  },
  tdRight: { textAlign: 'right' },
  
  // Service cell
  serviceCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  serviceIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    background: 'rgba(233,69,96,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  serviceName: { fontWeight: '600', fontSize: '1rem' },
  serviceDesc: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' },
  
  // Fee breakdown
  feeCell: {},
  feeAmount: { fontWeight: '600' },
  feePercent: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' },
  
  // Revenue cell
  revenueCell: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#4caf50',
  },
  
  // Category badge
  categoryBadge: {
    padding: '0.25rem 0.75rem',
    background: 'rgba(102,126,234,0.2)',
    borderRadius: '15px',
    fontSize: '0.7rem',
    color: '#667eea',
    fontWeight: '600',
  },
  
  // Actions
  actionBtn: {
    padding: '0.4rem 0.8rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.75rem',
    cursor: 'pointer',
    marginRight: '0.5rem',
  },
};

export default function ServicesPage() {
  const totalRevenue = getTotalPotentialRevenue();
  const avgRevenue = getAverageRevenue();
  const totalProFees = services.reduce((sum, s) => sum + s.professionalFee, 0);
  const totalModelFees = services.reduce((sum, s) => sum + s.modelFee, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Service Catalog 💇</h1>
          <p style={styles.subtitle}>Manage services, pricing, and fee structures</p>
        </div>
        <button style={styles.addBtn}>
          <span>+</span> Add Service
        </button>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📋</div>
          <div style={styles.statValue}>{services.length}</div>
          <div style={styles.statLabel}>Total Services</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💰</div>
          <div style={{ ...styles.statValue, color: '#4caf50' }}>${avgRevenue}</div>
          <div style={styles.statLabel}>Avg Revenue/Booking</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>👔</div>
          <div style={{ ...styles.statValue, color: '#667eea' }}>${totalProFees}</div>
          <div style={styles.statLabel}>Total Pro Fees (all services)</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>💄</div>
          <div style={{ ...styles.statValue, color: '#e94560' }}>${totalModelFees}</div>
          <div style={styles.statLabel}>Total Model Fees (all services)</div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div style={styles.revenueCard}>
        <div style={styles.revenueTitle}>
          <span>💵</span> Revenue Per Booking (by service)
        </div>
        <div style={styles.revenueGrid}>
          <div style={styles.revenueItem}>
            <div style={styles.revenueValue}>${totalProFees}</div>
            <div style={styles.revenueLabel}>From Professionals</div>
          </div>
          <div style={styles.revenueItem}>
            <div style={styles.revenueValue}>${totalModelFees}</div>
            <div style={styles.revenueLabel}>From Models</div>
          </div>
          <div style={styles.revenueItem}>
            <div style={{ ...styles.revenueValue, color: '#e94560' }}>${totalRevenue}</div>
            <div style={styles.revenueLabel}>Total Platform Revenue</div>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Service</th>
            <th style={styles.th}>Category</th>
            <th style={{ ...styles.th, ...styles.thRight }}>Service Price</th>
            <th style={{ ...styles.th, ...styles.thRight }}>Duration</th>
            <th style={{ ...styles.th, ...styles.thRight }}>Pro Fee</th>
            <th style={{ ...styles.th, ...styles.thRight }}>Model Fee</th>
            <th style={{ ...styles.th, ...styles.thRight }}>Your Revenue</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr 
              key={service.id}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={styles.td}>
                <div style={styles.serviceCell}>
                  <div style={styles.serviceIcon}>{service.icon}</div>
                  <div>
                    <div style={styles.serviceName}>{service.name}</div>
                    <div style={styles.serviceDesc}>{service.description}</div>
                  </div>
                </div>
              </td>
              <td style={styles.td}>
                <span style={styles.categoryBadge}>{service.category}</span>
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                <strong>{formatPrice(service.price)}</strong>
              </td>
              <td style={{ ...styles.td, ...styles.tdRight, color: 'rgba(255,255,255,0.6)' }}>
                {formatDuration(service.duration)}
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                <div style={styles.feeCell}>
                  <div style={{ ...styles.feeAmount, color: '#667eea' }}>
                    {formatPrice(service.professionalFee)}
                  </div>
                  <div style={styles.feePercent}>{service.professionalFeePercent}%</div>
                </div>
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                <div style={styles.feeCell}>
                  <div style={{ ...styles.feeAmount, color: '#e94560' }}>
                    {formatPrice(service.modelFee)}
                  </div>
                  <div style={styles.feePercent}>{service.modelFeePercent}%</div>
                </div>
              </td>
              <td style={{ ...styles.td, ...styles.tdRight }}>
                <div style={styles.revenueCell}>{formatPrice(service.totalRevenue)}</div>
              </td>
              <td style={styles.td}>
                <button style={styles.actionBtn}>Edit</button>
                <button style={styles.actionBtn}>📊</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

