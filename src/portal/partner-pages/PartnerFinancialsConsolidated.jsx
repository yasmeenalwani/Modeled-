// ============================================
// FINANCIALS - Consolidated Page
// Overview + Invoices in one unified view
// ============================================

import React, { useState } from 'react';
import PartnerFinancials from './PartnerFinancials';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  
  // Tab navigation
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid rgba(48,54,61,0.8)',
    paddingBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    background: 'rgba(88,166,255,0.2)',
    color: '#58a6ff',
    fontWeight: '600',
  },
};

// Mock invoices
const mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    dateIssued: '2024-11-01',
    dueDate: '2024-11-15',
    amount: 4250.00,
    status: 'paid',
    paidAt: '2024-11-10',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    dateIssued: '2024-12-01',
    dueDate: '2024-12-15',
    amount: 4850.00,
    status: 'sent',
  },
  {
    id: 3,
    invoiceNumber: 'INV-2024-003',
    dateIssued: '2024-10-15',
    dueDate: '2024-10-30',
    amount: 3800.00,
    status: 'overdue',
  },
];

function InvoicesTab() {
  const [filter, setFilter] = useState('all');

  const filteredInvoices = filter === 'all'
    ? mockInvoices
    : mockInvoices.filter(inv => inv.status === filter);

  const stats = {
    total: mockInvoices.length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    pending: mockInvoices.filter(i => i.status === 'sent').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
    totalPaid: mockInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    totalPending: mockInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.amount, 0),
    totalOverdue: mockInvoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            Invoices 🧾
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
            Manage invoices and payments
          </p>
        </div>
        <button style={{
          padding: '0.65rem 1.25rem',
          background: '#58a6ff',
          border: 'none',
          borderRadius: '6px',
          color: '#fff',
          fontSize: '0.85rem',
          fontWeight: '600',
          cursor: 'pointer',
        }}>
          + Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          background: 'rgba(22,27,34,0.8)',
          border: '1px solid rgba(48,54,61,0.8)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#58a6ff' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
            Total Invoices
          </div>
        </div>
        <div style={{
          background: 'rgba(22,27,34,0.8)',
          border: '1px solid rgba(48,54,61,0.8)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3fb950' }}>
            ${stats.totalPaid.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
            Paid
          </div>
        </div>
        <div style={{
          background: 'rgba(22,27,34,0.8)',
          border: '1px solid rgba(48,54,61,0.8)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d29922' }}>
            ${stats.totalPending.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
            Pending
          </div>
        </div>
        <div style={{
          background: 'rgba(22,27,34,0.8)',
          border: '1px solid rgba(48,54,61,0.8)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f85149' }}>
            ${stats.totalOverdue.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}>
            Overdue
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'paid', label: 'Paid' },
          { key: 'sent', label: 'Pending' },
          { key: 'overdue', label: 'Overdue' },
        ].map(f => (
          <button
            key={f.key}
            style={{
              padding: '0.5rem 1rem',
              background: filter === f.key ? 'rgba(88,166,255,0.2)' : 'rgba(48,54,61,0.5)',
              border: `1px solid ${filter === f.key ? '#58a6ff' : 'rgba(48,54,61,0.8)'}`,
              borderRadius: '6px',
              color: filter === f.key ? '#58a6ff' : 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredInvoices.map(invoice => (
          <div
            key={invoice.id}
            style={{
              background: 'rgba(22,27,34,0.8)',
              border: '1px solid rgba(48,54,61,0.8)',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: '600',
                marginBottom: '0.25rem',
              }}>
                {invoice.invoiceNumber}
              </div>
              <div style={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                Issued: {new Date(invoice.dateIssued).toLocaleDateString()} • 
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </div>
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              marginRight: '1.5rem',
            }}>
              ${invoice.amount.toFixed(2)}
            </div>
            <span style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: invoice.status === 'paid' ? 'rgba(46,160,67,0.2)' :
                     invoice.status === 'sent' ? 'rgba(210,153,34,0.2)' :
                     'rgba(248,81,73,0.2)',
              color: invoice.status === 'paid' ? '#3fb950' :
                     invoice.status === 'sent' ? '#d29922' :
                     '#f85149',
            }}>
              {invoice.status}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
              <button style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(48,54,61,0.5)',
                border: '1px solid rgba(48,54,61,0.8)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}>
                View
              </button>
              <button style={{
                padding: '0.4rem 0.8rem',
                background: 'rgba(48,54,61,0.5)',
                border: '1px solid rgba(48,54,61,0.8)',
                borderRadius: '4px',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}>
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PartnerFinancialsConsolidated() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'overview' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('overview')}
        >
          💰 Overview
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'invoices' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('invoices')}
        >
          🧾 Invoices
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? <PartnerFinancials /> : <InvoicesTab />}
    </div>
  );
}

