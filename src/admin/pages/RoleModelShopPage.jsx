// ============================================
// ROLE MODEL - Shop Management
// Admin page for managing Wear Care products
// ============================================

import React, { useState } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1rem',
  },
  addButton: {
    padding: '0.75rem 2rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  productCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  productHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
  },
  productName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#10b981',
    marginBottom: '0.25rem',
  },
  productStatus: {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  statusActive: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
  },
  statusInactive: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  productImage: {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginBottom: '1rem',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
  },
  productInfo: {
    marginBottom: '1rem',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.5)',
  },
  infoValue: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  productActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  editButton: {
    background: 'rgba(16,185,129,0.2)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
  },
  deleteButton: {
    background: 'rgba(244,67,54,0.2)',
    color: '#f44336',
    border: '1px solid rgba(244,67,54,0.3)',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#1a1a24',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#10b981',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  saveButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  cancelButton: {
    flex: 1,
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

// Mock products (will be replaced with Amplify data)
const mockProducts = [
  {
    id: '1',
    name: 'ROLE Model Tee',
    description: 'Comfortable cotton tee with the ROLE Model logo.',
    basePrice: 24.01,
    roundUpAmount: 0.99,
    totalPrice: 25.00,
    donationPercent: 10.0,
    donationAmount: 3.40,
    category: 'apparel',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'White', 'Green'],
    isActive: true,
  },
  {
    id: '2',
    name: 'ROLE Model Hoodie',
    description: 'Cozy hoodie for those who care.',
    basePrice: 49.01,
    roundUpAmount: 0.99,
    totalPrice: 50.00,
    donationPercent: 10.0,
    donationAmount: 5.90,
    category: 'apparel',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Green'],
    isActive: true,
  },
];

export default function RoleModelShopPage() {
  const [products, setProducts] = useState(mockProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    roundUpAmount: 0.99,
    donationPercent: 10.0,
    category: 'apparel',
    sizes: [],
    colors: [],
    isActive: true,
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      roundUpAmount: 0.99,
      donationPercent: 10.0,
      category: 'apparel',
      sizes: [],
      colors: [],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      roundUpAmount: product.roundUpAmount,
      donationPercent: product.donationPercent,
      category: product.category,
      sizes: product.sizes,
      colors: product.colors,
      isActive: product.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = () => {
    const basePrice = parseFloat(formData.basePrice);
    const roundUpAmount = parseFloat(formData.roundUpAmount);
    const totalPrice = basePrice + roundUpAmount;
    const donationAmount = (basePrice * (formData.donationPercent / 100)) + roundUpAmount;

    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...formData, basePrice, totalPrice, donationAmount }
          : p
      ));
    } else {
      // Add new product
      const newProduct = {
        id: Date.now().toString(),
        ...formData,
        basePrice,
        totalPrice,
        donationAmount,
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const calculateDonation = () => {
    const basePrice = parseFloat(formData.basePrice) || 0;
    const roundUpAmount = parseFloat(formData.roundUpAmount) || 0;
    const donationPercent = parseFloat(formData.donationPercent) || 10;
    return (basePrice * (donationPercent / 100)) + roundUpAmount;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Wear Care Shop</h1>
          <p style={styles.subtitle}>Manage products for the Wear Care merch shop</p>
        </div>
        <button
          style={styles.addButton}
          onClick={handleAddProduct}
          onMouseOver={(e) => e.target.style.background = '#059669'}
          onMouseOut={(e) => e.target.style.background = '#10b981'}
        >
          + Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div style={styles.productsGrid}>
        {products.map((product) => (
          <div key={product.id} style={styles.productCard}>
            <div style={styles.productHeader}>
              <div>
                <h3 style={styles.productName}>{product.name}</h3>
                <div style={{
                  ...styles.productStatus,
                  ...(product.isActive ? styles.statusActive : styles.statusInactive),
                }}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>

            <div style={styles.productImage}>
              👕
            </div>

            <div style={styles.productInfo}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Base Price:</span>
                <span style={styles.infoValue}>${product.basePrice.toFixed(2)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Round-up:</span>
                <span style={styles.infoValue}>${product.roundUpAmount.toFixed(2)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Total:</span>
                <span style={styles.infoValue}>${product.totalPrice.toFixed(2)}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Donation:</span>
                <span style={{ ...styles.infoValue, color: '#10b981' }}>
                  ${product.donationAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={styles.productActions}>
              <button
                style={{ ...styles.actionButton, ...styles.editButton }}
                onClick={() => handleEditProduct(product)}
                onMouseOver={(e) => e.target.style.background = 'rgba(16,185,129,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(16,185,129,0.2)'}
              >
                Edit
              </button>
              <button
                style={{ ...styles.actionButton, ...styles.deleteButton }}
                onClick={() => handleDeleteProduct(product.id)}
                onMouseOver={(e) => e.target.style.background = 'rgba(244,67,54,0.3)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(244,67,54,0.2)'}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={styles.modal} onClick={() => setIsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                style={styles.closeButton}
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Product Name *</label>
              <input
                type="text"
                style={styles.input}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ROLE Model Tee"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                style={styles.textarea}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description..."
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Base Price *</label>
              <input
                type="number"
                step="0.01"
                style={styles.input}
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                placeholder="24.01"
              />
              <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                Use intentional pricing (e.g., $24.01 instead of $24.99)
              </small>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Round-up Amount</label>
              <input
                type="number"
                step="0.01"
                style={styles.input}
                value={formData.roundUpAmount}
                onChange={(e) => setFormData({ ...formData, roundUpAmount: parseFloat(e.target.value) })}
                placeholder="0.99"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Donation Percent</label>
              <input
                type="number"
                step="0.1"
                style={styles.input}
                value={formData.donationPercent}
                onChange={(e) => setFormData({ ...formData, donationPercent: parseFloat(e.target.value) })}
                placeholder="10.0"
              />
              <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                Percentage of base price that goes to mental health (default: 10%)
              </small>
            </div>

            {formData.basePrice && (
              <div style={{
                padding: '1rem',
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: '8px',
                marginBottom: '1rem',
              }}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Price:</span>
                  <span style={{ ...styles.infoValue, color: '#10b981' }}>
                    ${(parseFloat(formData.basePrice || 0) + parseFloat(formData.roundUpAmount || 0)).toFixed(2)}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Total Donation:</span>
                  <span style={{ ...styles.infoValue, color: '#10b981' }}>
                    ${calculateDonation().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setIsModalOpen(false)}
                onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              >
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={handleSaveProduct}
                onMouseOver={(e) => e.target.style.background = '#059669'}
                onMouseOut={(e) => e.target.style.background = '#10b981'}
              >
                {editingProduct ? 'Update' : 'Create'} Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

