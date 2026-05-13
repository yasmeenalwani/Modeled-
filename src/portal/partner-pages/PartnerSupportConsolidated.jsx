// ============================================
// SUPPORT - Consolidated Page
// Chat Support + Marketing Assets in one unified view
// ============================================

import React, { useState } from 'react';
import PartnerChat from './PartnerChat';

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

// Mock marketing assets
const mockAssets = [
  {
    id: 1,
    name: 'Modeled Logo - Primary',
    category: 'logo',
    fileType: 'PNG',
    fileSize: '2.5 MB',
    thumbnail: '🎨',
  },
  {
    id: 2,
    name: 'Modeled Logo - White',
    category: 'logo',
    fileType: 'PNG',
    fileSize: '2.3 MB',
    thumbnail: '🎨',
  },
  {
    id: 3,
    name: 'Instagram Post Template',
    category: 'template',
    fileType: 'PSD',
    fileSize: '15 MB',
    thumbnail: '📱',
  },
  {
    id: 4,
    name: 'Email Template - Welcome',
    category: 'template',
    fileType: 'HTML',
    fileSize: '45 KB',
    thumbnail: '📧',
  },
  {
    id: 5,
    name: 'Brand Guidelines PDF',
    category: 'guidelines',
    fileType: 'PDF',
    fileSize: '8.2 MB',
    thumbnail: '',
  },
  {
    id: 6,
    name: 'Lifestyle Photo Pack',
    category: 'photo',
    fileType: 'ZIP',
    fileSize: '125 MB',
    thumbnail: '📸',
  },
];

function MarketingAssetsTab() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { key: 'all', label: 'All Assets' },
    { key: 'logo', label: 'Logos' },
    { key: 'template', label: 'Templates' },
    { key: 'photo', label: 'Photos' },
    { key: 'guidelines', label: 'Guidelines' },
  ];

  const filteredAssets = selectedCategory === 'all'
    ? mockAssets
    : mockAssets.filter(a => a.category === selectedCategory);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Marketing Assets 📦
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
          Access Modeled brand assets, templates, and marketing materials
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        {categories.map(cat => (
          <button
            key={cat.key}
            style={{
              padding: '0.5rem 1rem',
              background: selectedCategory === cat.key ? 'rgba(88,166,255,0.2)' : 'rgba(48,54,61,0.5)',
              border: `1px solid ${selectedCategory === cat.key ? '#58a6ff' : 'rgba(48,54,61,0.8)'}`,
              borderRadius: '6px',
              color: selectedCategory === cat.key ? '#58a6ff' : 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Assets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredAssets.map(asset => (
          <div
            key={asset.id}
            style={{
              background: 'rgba(22,27,34,0.8)',
              border: '1px solid rgba(48,54,61,0.8)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#58a6ff'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(48,54,61,0.8)'}
          >
            {/* Thumbnail */}
            <div style={{
              width: '100%',
              height: '150px',
              background: 'rgba(48,54,61,0.3)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              marginBottom: '1rem',
            }}>
              {asset.thumbnail}
            </div>

            {/* Asset Info */}
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
            }}>
              {asset.name}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.5)',
              marginBottom: '1rem',
            }}>
              {asset.fileType} • {asset.fileSize}
            </div>

            {/* Download Button */}
            <button style={{
              width: '100%',
              padding: '0.6rem',
              background: '#58a6ff',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Brand Guidelines Section */}
      {selectedCategory === 'all' || selectedCategory === 'guidelines' ? (
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: 'rgba(88,166,255,0.1)',
          border: '1px solid rgba(88,166,255,0.2)',
          borderRadius: '12px',
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
          }}>
            📋 Brand Guidelines
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Color Palette
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Primary, secondary, and accent colors
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Typography
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Font families and usage rules
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Logo Usage
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                Do's and don'ts for logo placement
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function PartnerSupportConsolidated() {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div style={styles.container}>
      {/* Tab Navigation */}
      <div style={styles.tabNav}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'chat' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat Support
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'assets' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('assets')}
        >
          📦 Marketing Assets
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'chat' ? <PartnerChat /> : <MarketingAssetsTab />}
    </div>
  );
}

