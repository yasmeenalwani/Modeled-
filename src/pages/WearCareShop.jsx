// ============================================
// WEAR CARE SHOP - Public Shop Page
// Merch with purpose: 10% + round-up donations
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    minHeight: '100vh',
    background: '#0d0d14',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.05) 100%)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '16px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '1rem',
  },
  impactNote: {
    fontSize: '0.9rem',
    color: '#10b981',
    fontStyle: 'italic',
    marginTop: '1rem',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '2rem',
    marginBottom: '3rem',
  },
  productCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
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
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '0.5rem',
  },
  productDescription: {
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: '1rem',
    lineHeight: '1.6',
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
    color: '#fff',
  },
  roundUp: {
    fontSize: '0.9rem',
    color: '#10b981',
    fontStyle: 'italic',
  },
  totalPrice: {
    fontSize: '1rem',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '1rem',
  },
  donationBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(16,185,129,0.2)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#10b981',
    marginBottom: '1rem',
  },
  addToCartButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    color: 'rgba(255,255,255,0.5)',
  },
};

// Mock products (will be replaced with real data from Amplify)
const mockProducts = [
  {
    id: '1',
    name: 'ROLE Model Tee',
    description: 'Comfortable cotton tee with the ROLE Model logo. Wear your role model.',
    basePrice: 24.01,
    roundUpAmount: 0.99,
    totalPrice: 25.00,
    donationAmount: 3.40, // 10% of 24.01 + 0.99
    imageUrl: null,
    category: 'apparel',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Green'],
  },
  {
    id: '2',
    name: 'ROLE Model Hoodie',
    description: 'Cozy hoodie for those who care. 10% of every purchase goes to mental health access.',
    basePrice: 49.01,
    roundUpAmount: 0.99,
    totalPrice: 50.00,
    donationAmount: 5.90, // 10% of 49.01 + 0.99
    imageUrl: null,
    category: 'apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Green'],
  },
  {
    id: '3',
    name: 'ROLE Model Tote',
    description: 'Carry your impact. Sustainable tote bag perfect for everyday use.',
    basePrice: 19.01,
    roundUpAmount: 0.99,
    totalPrice: 20.00,
    donationAmount: 2.90, // 10% of 19.01 + 0.99
    imageUrl: null,
    category: 'accessories',
    colors: ['Natural', 'Black'],
  },
];

export default function WearCareShop() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(mockProducts);
  const [cart, setCart] = useState([]);

  const handleAddToCart = (product) => {
    // For MVP, we'll use Stripe Checkout directly
    // In production, this would add to cart and then checkout
    handleCheckout(product);
  };

  const handleCheckout = async (product) => {
    // TODO: Integrate with Stripe Checkout
    // For now, show an alert
    alert(`Checkout for ${product.name} - $${product.totalPrice.toFixed(2)}\n\nDonation: $${product.donationAmount.toFixed(2)} (10% + round-up)\n\nStripe Checkout integration coming soon!`);
    
    // In production, this would:
    // 1. Create Stripe Checkout session with product
    // 2. Redirect to Stripe Checkout
    // 3. On success, create Order and Donation records
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Wear Care</h1>
        <p style={styles.subtitle}>
          Wear your role model. Every purchase funds mental health and self-care access.
        </p>
        <p style={styles.impactNote}>
          💚 10% of every purchase + round-up donations = your impact
        </p>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div style={styles.productsGrid}>
          {products.map((product) => (
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
              <div style={styles.donationBadge}>
                ${product.donationAmount.toFixed(2)} donated
              </div>

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
          <p>No products available yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

