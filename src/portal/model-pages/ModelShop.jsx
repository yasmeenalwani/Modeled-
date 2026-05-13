// ============================================
// MY ROLE - Shop Page
// Traditional business shop with Wear Care as a category
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1) 0%, rgba(168, 90, 90, 0.05) 100%)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Category tabs
  categoryTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.15)',
  },
  categoryTab: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(139, 30, 63, 0.05)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '25px',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    fontFamily: '"Alike", "Georgia", serif',
  },
  categoryTabActive: {
    background: 'rgba(139, 30, 63, 0.15)',
    borderColor: '#8B1E3F', // Cherry
    color: '#8B1E3F', // Cherry
    fontWeight: '600',
  },
  
  // Products grid
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  productCard: {
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    padding: '1.5rem',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  productImage: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'rgba(139, 30, 63, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4A2A1A', // Darker rich espresso brown
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  productDescription: {
    fontSize: '0.9rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    lineHeight: '1.6',
    fontFamily: '"Alike", "Georgia", serif',
  },
  productPrice: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  basePrice: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4A2A1A', // Darker rich espresso brown
    fontFamily: '"Alike", "Georgia", serif',
  },
  roundUp: {
    fontSize: '0.9rem',
    color: '#8B1E3F', // Cherry
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  totalPrice: {
    fontSize: '1rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  donationBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.15)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#8B1E3F', // Cherry
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  roundUpBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.1)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  addToCartButton: {
    width: '100%',
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)', // Cherry gradient
    border: 'none',
    borderRadius: '8px',
    color: '#FFFEF9', // Ivory
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Impact counter
  impactCounter: {
    background: 'linear-gradient(135deg, rgba(139, 30, 63, 0.1) 0%, rgba(168, 90, 90, 0.08) 100%)',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  impactTitle: {
    fontSize: '0.9rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: '"Alike", "Georgia", serif',
  },
  impactAmount: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#8B1E3F', // Cherry
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  impactSubtext: {
    fontSize: '0.85rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    fontFamily: '"Alike", "Georgia", serif',
  },
  
  // Cause selection
  causeSelect: {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    background: '#FFFEF9', // Ivory
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '8px',
    color: '#4A2A1A', // Darker rich espresso brown
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  causeLabel: {
    fontSize: '0.8rem',
    color: '#5A3A2A', // Darker espresso brown (muted)
    marginBottom: '0.5rem',
    display: 'block',
    fontFamily: '"Alike", "Georgia", serif',
  },
};

// Mock products - Mix of Wear Care and regular items
const mockProducts = [
  // Wear Care items (10% donation + round-up)
  {
    id: '1',
    name: 'ROLE Model Tee',
    description: 'Comfortable cotton tee with the ROLE Model logo. Wear your role model.',
    basePrice: 24.01,
    roundUpAmount: 0.99,
    totalPrice: 25.00,
    donationAmount: 3.40, // 10% of 24.01 + 0.99
    category: 'wear-care',
    imageUrl: null,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Green'],
    isWearCare: true,
  },
  {
    id: '2',
    name: 'ROLE Model Hoodie',
    description: 'Cozy hoodie for those who care. 10% of every purchase goes to mental health access.',
    basePrice: 49.01,
    roundUpAmount: 0.99,
    totalPrice: 50.00,
    donationAmount: 5.90, // 10% of 49.01 + 0.99
    category: 'wear-care',
    imageUrl: null,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Green'],
    isWearCare: true,
  },
  {
    id: '3',
    name: 'ROLE Model Tote',
    description: 'Carry your impact. Sustainable tote bag perfect for everyday use.',
    basePrice: 19.01,
    roundUpAmount: 0.99,
    totalPrice: 20.00,
    donationAmount: 2.90, // 10% of 19.01 + 0.99
    category: 'wear-care',
    imageUrl: null,
    colors: ['Natural', 'Black'],
    isWearCare: true,
  },
  // Regular items (round-up only, no 10% donation)
  {
    id: '4',
    name: 'Modeled Logo Sticker Pack',
    description: 'Set of 5 vinyl stickers with Modeled branding.',
    basePrice: 9.01,
    roundUpAmount: 0.99,
    totalPrice: 10.00,
    donationAmount: 0.99, // Only round-up, no 10%
    category: 'accessories',
    imageUrl: null,
    isWearCare: false,
  },
  {
    id: '5',
    name: 'Modeled Water Bottle',
    description: 'Insulated stainless steel water bottle with Modeled logo.',
    basePrice: 29.01,
    roundUpAmount: 0.99,
    totalPrice: 30.00,
    donationAmount: 0.99, // Only round-up, no 10%
    category: 'accessories',
    imageUrl: null,
    colors: ['Black', 'Pink'],
    isWearCare: false,
  },
];

// Partner causes for round-up selection
const partnerCauses = [
  { id: 'mental-health', name: 'Mental Health Access', description: 'Support therapy and counseling access' },
  { id: 'hair-donation', name: 'Hair Donation Programs', description: 'Wigs for cancer patients' },
  { id: 'youth-programs', name: 'Youth Development', description: 'Mentorship and skill-building' },
  { id: 'community-care', name: 'Community Care Fund', description: 'General community support' },
];

// Mock total community impact (would come from database)
const totalCommunityImpact = 1247.50; // Total donations from all users

export default function ModelShop() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCauses, setSelectedCauses] = useState({}); // productId -> causeId

  const categories = [
    { key: 'all', label: 'All Products' },
    { key: 'wear-care', label: 'Wear Care' },
    { key: 'accessories', label: 'Accessories' },
    { key: 'apparel', label: 'Apparel' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCategory);

  const handleCauseChange = (productId, causeId) => {
    setSelectedCauses(prev => ({ ...prev, [productId]: causeId }));
  };

  const handleAddToCart = (product) => {
    const selectedCause = selectedCauses[product.id] 
      ? partnerCauses.find(c => c.id === selectedCauses[product.id])
      : null;
    
    // TODO: Integrate with Stripe Checkout
    alert(`Checkout for ${product.name} - $${product.totalPrice.toFixed(2)}\n\n${product.isWearCare ? `Donation: $${product.donationAmount.toFixed(2)} (10% + round-up)` : `Round-up donation: $${product.roundUpAmount.toFixed(2)}`}${selectedCause ? `\n\nSupporting: ${selectedCause.name}` : ''}\n\nStripe Checkout integration coming soon!`);
  };

  return (
    <div style={styles.container}>
      {/* Impact Counter */}
      <div style={styles.impactCounter}>
        <div style={styles.impactTitle}>Together We've Donated</div>
        <div style={styles.impactAmount}>${totalCommunityImpact.toFixed(2)}</div>
        <div style={styles.impactSubtext}>
          Every $0.99 round-up adds up!
        </div>
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Shop</h1>
        <p style={styles.subtitle}>
          Every purchase supports the ROLE Model mission. Round up to amplify your impact.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(cat => (
          <button
            key={cat.key}
            style={{
              ...styles.categoryTab,
              ...(selectedCategory === cat.key ? styles.categoryTabActive : {}),
            }}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={styles.productsGrid}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={styles.productCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(16,185,129,0.2)';
              }}
            >
              {/* Product Image */}
              <div style={styles.productImage}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>👕</span>
                )}
              </div>

              {/* Product Info */}
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productDescription}>{product.description}</p>

              {/* Pricing */}
              <div style={styles.productPrice}>
                <span style={styles.basePrice}>${product.basePrice.toFixed(2)}</span>
                <span style={styles.roundUp}>+ ${product.roundUpAmount.toFixed(2)} round-up</span>
              </div>
              <div style={styles.totalPrice}>
                Total: ${product.totalPrice.toFixed(2)}
              </div>

              {/* Donation Badge */}
              {product.isWearCare ? (
                <div style={styles.donationBadge}>
                  ${product.donationAmount.toFixed(2)} donated (10% + round-up)
                </div>
              ) : (
                <div style={styles.roundUpBadge}>
                  ${product.roundUpAmount.toFixed(2)} round-up donation
                </div>
              )}

              {/* Cause Selection (Optional) */}
              <label style={styles.causeLabel}>
                Choose where your round-up goes (optional):
              </label>
              <select
                style={styles.causeSelect}
                value={selectedCauses[product.id] || ''}
                onChange={(e) => handleCauseChange(product.id, e.target.value)}
              >
                <option value="">General ROLE Model Fund</option>
                {partnerCauses.map(cause => (
                  <option key={cause.id} value={cause.id}>
                    {cause.name} - {cause.description}
                  </option>
                ))}
              </select>

              {/* Add to Cart Button */}
              <button
                style={styles.addToCartButton}
                onClick={() => handleAddToCart(product)}
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <p>No products in this category yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

