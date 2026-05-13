// ============================================
// SERVICE MENU - Manage salon services
// ============================================

import React, { useState } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9', // Ivory
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#4A2A1A', // Dark brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    color: '#5A3A2A', // Muted brown
    fontSize: '0.95rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    border: 'none',
    borderRadius: '6px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock services
const mockServices = [
  {
    id: 1,
    name: 'Haircut',
    category: 'Cuts',
    description: 'Professional haircut with styling consultation',
    duration: 60,
    basePrice: 75.00,
    modelDiscount: 50,
    isActive: true,
  },
  {
    id: 2,
    name: 'Balayage',
    category: 'Color',
    description: 'Hand-painted highlights for natural-looking dimension',
    duration: 180,
    basePrice: 250.00,
    modelDiscount: 60,
    isActive: true,
  },
  {
    id: 3,
    name: 'Blowout',
    category: 'Styling',
    description: 'Professional blow-dry and styling',
    duration: 45,
    basePrice: 45.00,
    modelDiscount: 40,
    isActive: true,
  },
  {
    id: 4,
    name: 'Color Correction',
    category: 'Color',
    description: 'Fix previous color mistakes or achieve desired shade',
    duration: 240,
    basePrice: 350.00,
    modelDiscount: 65,
    isActive: true,
  },
  {
    id: 5,
    name: 'Highlights',
    category: 'Color',
    description: 'Full or partial highlights',
    duration: 150,
    basePrice: 200.00,
    modelDiscount: 55,
    isActive: true,
  },
  {
    id: 6,
    name: 'Hair Treatment',
    category: 'Treatment',
    description: 'Deep conditioning and repair treatment',
    duration: 30,
    basePrice: 60.00,
    modelDiscount: 45,
    isActive: false,
  },
];

export default function PartnerServiceMenu() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const categories = ['all', 'Cuts', 'Color', 'Styling', 'Treatment'];
  
  const filteredServices = mockServices.filter(service => {
    const matchesCategory = filter === 'all' || service.category === filter;
    const matchesSearch = service.name.toLowerCase().includes(search.toLowerCase()) ||
                         service.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const stats = {
    total: mockServices.length,
    active: mockServices.filter(s => s.isActive).length,
    avgPrice: Math.round(mockServices.reduce((sum, s) => sum + s.basePrice, 0) / mockServices.length),
    mostPopular: 'Balayage',
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Service Menu 🛍️</h1>
          <p style={styles.subtitle}>
            Manage your salon services, pricing, and availability
          </p>
        </div>
        <button style={styles.addBtn}>
          + Add Service
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
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Total Services
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3fb950', fontFamily: '"Alike", "Georgia", serif' }}>{stats.active}</div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Active Services
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#d29922', fontFamily: '"Alike", "Georgia", serif' }}>
            ${stats.avgPrice}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Average Price
          </div>
        </div>
        <div style={{
          background: '#FFFEF9',
          border: '1px solid rgba(139, 30, 63, 0.15)',
          borderRadius: '12px',
          padding: '1.25rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#a371f7', fontFamily: '"Alike", "Georgia", serif' }}>
            {stats.mostPopular}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#5A3A2A', marginTop: '0.25rem', fontFamily: '"Alike", "Georgia", serif' }}>
            Most Popular
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
      }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.65rem 1rem',
            background: '#FFFEF9',
            border: '1px solid rgba(139, 30, 63, 0.2)',
            borderRadius: '6px',
            color: '#4A2A1A',
            fontSize: '0.85rem',
            fontFamily: '"Alike", "Georgia", serif',
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                padding: '0.5rem 1rem',
                background: filter === cat ? 'rgba(139, 30, 63, 0.1)' : '#FFFEF9',
                border: `1px solid ${filter === cat ? '#8B1E3F' : 'rgba(139, 30, 63, 0.2)'}`,
                borderRadius: '6px',
                color: filter === cat ? '#8B1E3F' : '#4A2A1A',
                fontSize: '0.8rem',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontFamily: '"Alike", "Georgia", serif',
              }}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredServices.map(service => (
          <div
            key={service.id}
            style={{
              background: '#FFFEF9',
              border: '1px solid rgba(139, 30, 63, 0.15)',
              borderRadius: '12px',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#8B1E3F'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(139, 30, 63, 0.15)'}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '1rem',
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '0.25rem',
                  color: '#4A2A1A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {service.name}
                </h3>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  background: 'rgba(139, 30, 63, 0.05)',
                  color: '#5A3A2A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {service.category}
                </span>
              </div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                background: service.isActive ? 'rgba(46,160,67,0.2)' : 'rgba(139, 30, 63, 0.1)',
                color: service.isActive ? '#3fb950' : '#5A3A2A',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p style={{
              fontSize: '0.85rem',
              color: '#5A3A2A',
              marginBottom: '1rem',
              lineHeight: '1.5',
              fontFamily: '"Alike", "Georgia", serif',
            }}>
              {service.description}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'rgba(139, 30, 63, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(139, 30, 63, 0.1)',
            }}>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#5A3A2A',
                  marginBottom: '0.25rem',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  Duration
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#4A2A1A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  {service.duration} min
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#5A3A2A',
                  marginBottom: '0.25rem',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  Base Price
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#4A2A1A',
                  fontFamily: '"Alike", "Georgia", serif',
                }}>
                  ${service.basePrice.toFixed(2)}
                </div>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              background: 'rgba(139, 30, 63, 0.05)',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              border: '1px solid rgba(139, 30, 63, 0.1)',
            }}>
              <strong style={{ color: '#8B1E3F', fontFamily: '"Alike", "Georgia", serif' }}>Model Discount:</strong>{' '}
              <span style={{ color: '#4A2A1A', fontFamily: '"Alike", "Georgia", serif' }}>
                {service.modelDiscount}% off (${(service.basePrice * (1 - service.modelDiscount / 100)).toFixed(2)})
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                flex: 1,
                padding: '0.5rem',
                background: 'rgba(139, 30, 63, 0.05)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '4px',
                color: '#4A2A1A',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Edit
              </button>
              <button style={{
                flex: 1,
                padding: '0.5rem',
                background: 'rgba(139, 30, 63, 0.05)',
                border: '1px solid rgba(139, 30, 63, 0.2)',
                borderRadius: '4px',
                color: '#4A2A1A',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontFamily: '"Alike", "Georgia", serif',
              }}>
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

