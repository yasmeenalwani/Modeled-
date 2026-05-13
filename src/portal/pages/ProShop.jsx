// ============================================
// PRO SHOP — Professional Tools & Brand Partnerships
// ============================================

import React, { useState } from 'react';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: '#FFFEF9',
    minHeight: '100vh',
    fontFamily: '"Alike", "Georgia", serif',
  },

  // Hero banner
  hero: {
    background: 'linear-gradient(135deg, #6B1830 0%, #8B1E3F 60%, #A85A5A 100%)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    marginBottom: '2.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  heroText: { flex: 1 },
  heroTitle: {
    fontSize: '2.4rem',
    fontWeight: '700',
    color: '#FFFEF9',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroSub: {
    fontSize: '1rem',
    color: 'rgba(255,254,249,0.75)',
    maxWidth: '480px',
    lineHeight: 1.6,
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroBadge: {
    background: 'rgba(255,254,249,0.15)',
    border: '1px solid rgba(255,254,249,0.3)',
    borderRadius: '50px',
    padding: '0.4rem 1rem',
    color: '#FFFEF9',
    fontSize: '0.8rem',
    display: 'inline-block',
    marginTop: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroStats: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  heroStat: {
    textAlign: 'center',
    background: 'rgba(255,254,249,0.1)',
    borderRadius: '12px',
    padding: '1rem 1.5rem',
    minWidth: '100px',
  },
  heroStatNum: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#FFFEF9',
    display: 'block',
    fontFamily: '"Alike", "Georgia", serif',
  },
  heroStatLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255,254,249,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },

  // Featured product
  featuredSection: { marginBottom: '2.5rem' },
  sectionTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredCard: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0',
    background: '#FFFEF9',
    border: '2px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(107, 24, 48, 0.12)',
  },
  featuredImage: {
    width: '100%',
    height: '380px',
    objectFit: 'cover',
    display: 'block',
  },
  featuredImagePlaceholder: {
    width: '100%',
    height: '380px',
    background: 'linear-gradient(135deg, #f5e6e8 0%, #e8d5d5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '6rem',
  },
  featuredContent: {
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  featuredBrand: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#8B1E3F',
    fontWeight: '700',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredName: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    lineHeight: 1.2,
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredDesc: {
    fontSize: '0.95rem',
    color: '#5A3A2A',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredSpecs: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1.5rem',
  },
  specTag: {
    padding: '0.3rem 0.75rem',
    background: 'rgba(139, 30, 63, 0.08)',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '20px',
    fontSize: '0.78rem',
    color: '#8B1E3F',
    fontFamily: '"Alike", "Georgia", serif',
  },
  featuredPriceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  featuredPrice: {
    fontSize: '2.25rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  roundUpNote: {
    fontSize: '0.85rem',
    color: '#8B1E3F',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  donationNote: {
    fontSize: '0.82rem',
    color: '#10b981',
    marginBottom: '1.5rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  buyBtn: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #6B1830, #8B1E3F)',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFEF9',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: '"Alike", "Georgia", serif',
    letterSpacing: '0.03em',
  },

  // Lifestyle banner
  lifestyleBanner: {
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '2.5rem',
    position: 'relative',
    height: '280px',
  },
  lifestyleImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center 30%',
    display: 'block',
  },
  lifestyleOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(107,24,48,0.75) 0%, rgba(107,24,48,0.2) 60%, transparent 100%)',
    display: 'flex',
    alignItems: 'center',
    padding: '2.5rem',
  },
  lifestyleText: {
    color: '#FFFEF9',
  },
  lifestyleHeading: {
    fontSize: '1.6rem',
    fontWeight: '700',
    marginBottom: '0.4rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  lifestyleSub: {
    fontSize: '0.95rem',
    opacity: 0.85,
    fontFamily: '"Alike", "Georgia", serif',
    maxWidth: '360px',
    lineHeight: 1.5,
  },

  // Category tabs
  categoryTabs: {
    display: 'flex',
    gap: '0.6rem',
    marginBottom: '2rem',
    overflowX: 'auto',
    paddingBottom: '0.25rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.55rem 1.25rem',
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '25px',
    color: '#4A2A1A',
    fontSize: '0.85rem',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.1)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '700',
  },

  // Product grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
    gap: '1.75rem',
    marginBottom: '3rem',
  },
  card: {
    background: '#FFFEF9',
    border: '1px solid rgba(139, 30, 63, 0.12)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 10px rgba(107, 24, 48, 0.06)',
    cursor: 'pointer',
  },
  cardImg: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    display: 'block',
  },
  cardImgPlaceholder: {
    width: '100%',
    height: '220px',
    background: 'linear-gradient(135deg, #f9f0f2 0%, #f0e4e8 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
  },
  cardBody: {
    padding: '1.25rem',
  },
  cardBrand: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8B1E3F',
    fontWeight: '700',
    marginBottom: '0.3rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#4A2A1A',
    marginBottom: '0.5rem',
    fontFamily: '"Alike", "Georgia", serif',
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '0.83rem',
    color: '#5A3A2A',
    lineHeight: 1.55,
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardPriceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  },
  cardPrice: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardRoundUp: {
    fontSize: '0.75rem',
    color: '#8B1E3F',
    fontStyle: 'italic',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardDonation: {
    fontSize: '0.75rem',
    color: '#10b981',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  cardBtn: {
    width: '100%',
    padding: '0.7rem',
    background: 'linear-gradient(135deg, #6B1830, #8B1E3F)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFEF9',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    transition: 'opacity 0.15s',
  },

  // Impact bar
  impactBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2rem',
    background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.04))',
    border: '1px solid rgba(16,185,129,0.2)',
    borderRadius: '14px',
    padding: '1.25rem 2rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
  },
  impactItem: { textAlign: 'center' },
  impactNum: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#10b981',
    display: 'block',
    fontFamily: '"Alike", "Georgia", serif',
  },
  impactLabel: {
    fontSize: '0.75rem',
    color: '#5A3A2A',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontFamily: '"Alike", "Georgia", serif',
  },
  impactDivider: {
    width: '1px',
    height: '40px',
    background: 'rgba(16,185,129,0.2)',
  },
};

const products = [
  // ── TOOLS ──────────────────────────────────────────────────────
  {
    id: 'kashi-shears-pro',
    name: 'Kashi G2 Pro Shears',
    brand: 'Kashi',
    description: 'Japanese 440C stainless steel with a convex edge for razor-sharp, effortless cuts. The G2 Pro is the tool of choice for precision stylists who demand performance every session.',
    specs: ['440C Japanese Steel', 'Offset Handle', '5.5"', 'Convex Edge', 'Ergonomic Thumb Ring'],
    basePrice: 299.01,
    roundUpAmount: 0.99,
    totalPrice: 300.00,
    donationAmount: 0.99,
    category: 'tools',
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=1000&fit=crop',
    featured: true,
    isWearCare: false,
  },
  {
    id: 'kashi-thinning-shears',
    name: 'Kashi T-Series Thinning Shears',
    brand: 'Kashi',
    description: '30-tooth blending shears for seamless texture removal and soft movement. Ideal for layering and finishing on all hair types.',
    specs: ['30-Tooth Blade', '6.0"', 'Rotating Thumb', 'Tension Screw'],
    basePrice: 189.01,
    roundUpAmount: 0.99,
    totalPrice: 190.00,
    donationAmount: 0.99,
    category: 'tools',
    imageUrl: 'https://images.unsplash.com/photo-1598524374912-27b9b5aa5d64?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
  {
    id: 'dyson-airwrap',
    name: 'Dyson Airwrap Complete',
    brand: 'Dyson',
    description: 'Multi-styler that curls, waves, smooths, and dries without extreme heat. The Coanda effect wraps hair around the barrel — no clamp, no damage.',
    specs: ['Long Barrel', 'Ionic Technology', 'No Extreme Heat', '3 Heat + Flow Settings'],
    basePrice: 599.01,
    roundUpAmount: 0.99,
    totalPrice: 600.00,
    donationAmount: 0.99,
    category: 'tools',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
  {
    id: 'olivia-garden-brush',
    name: 'Olivia Garden Ceramic + Ion Brush Set',
    brand: 'Olivia Garden',
    description: 'Boar + nylon bristle round brushes with ceramic barrel for frizz-free blowouts. Set of 3 sizes for versatile styling.',
    specs: ['3-Piece Set', 'Boar & Nylon Bristle', 'Ceramic Barrel', 'Anti-Static'],
    basePrice: 79.01,
    roundUpAmount: 0.99,
    totalPrice: 80.00,
    donationAmount: 0.99,
    category: 'tools',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },

  // ── SUPPLIES ───────────────────────────────────────────────────
  {
    id: 'olaplex-kit',
    name: 'Olaplex In-Salon System',
    brand: 'Olaplex',
    description: 'Bond-building treatment system (No.1 & No.2) for use during color and chemical services. Reduces breakage, maintains integrity, and extends color vibrancy.',
    specs: ['No.1 Bond Multiplier', 'No.2 Bond Perfector', '525mL Each', 'Color-Safe'],
    basePrice: 119.01,
    roundUpAmount: 0.99,
    totalPrice: 120.00,
    donationAmount: 0.99,
    category: 'supplies',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
  {
    id: 'redken-shades',
    name: 'Redken Shades EQ Gloss Kit',
    brand: 'Redken',
    description: 'Professional demi-permanent color gloss. Tones, refreshes, and seals the cuticle for mirror-like shine. 70 shades available.',
    specs: ['Demi-Permanent', 'Acid-Balanced', 'No Lift', 'Up to 4 Weeks'],
    basePrice: 89.01,
    roundUpAmount: 0.99,
    totalPrice: 90.00,
    donationAmount: 0.99,
    category: 'supplies',
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
  {
    id: 'kerastase-resistance',
    name: 'Kérastase Résistance Bundle',
    brand: 'Kérastase',
    description: 'Strengthening shampoo, conditioner, and masque for damaged or over-processed hair. Reconstructs internal fibers for noticeable strength after one use.',
    specs: ['Shampoo 250mL', 'Fondant 200mL', 'Masque 200mL', 'Fiber Reconstruction'],
    basePrice: 134.01,
    roundUpAmount: 0.99,
    totalPrice: 135.00,
    donationAmount: 0.99,
    category: 'supplies',
    imageUrl: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },

  // ── TRAINING ──────────────────────────────────────────────────
  {
    id: 'balayage-masterclass',
    name: 'Balayage & Lived-In Color Masterclass',
    brand: 'Modeled Academy',
    description: 'Step-by-step video course on freehand painting, sectioning, and toning for sun-kissed, natural results. Certificate included.',
    specs: ['12 Video Modules', 'Certificate', 'Lifetime Access', 'Q&A Sessions'],
    basePrice: 199.01,
    roundUpAmount: 0.99,
    totalPrice: 200.00,
    donationAmount: 0.99,
    category: 'training',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
  {
    id: 'curl-texture-course',
    name: 'Textured Hair & Curl Pattern Course',
    brand: 'Modeled Academy',
    description: 'Master cuts, color, and styling for Type 3 and 4 hair. Includes dry cutting, twist-outs, and protective styling modules.',
    specs: ['8 Modules', 'Live Demo Videos', 'Certificate', 'Resource Library'],
    basePrice: 149.01,
    roundUpAmount: 0.99,
    totalPrice: 150.00,
    donationAmount: 0.99,
    category: 'training',
    imageUrl: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },

  // ── WEAR CARE ─────────────────────────────────────────────────
  {
    id: 'role-model-tee',
    name: 'ROLE Model Pro Tee',
    brand: 'Modeled',
    description: 'Heavyweight 100% cotton tee. Understated, clean, and built for long days behind the chair. 10% of every sale goes directly to mental health access for beauty professionals.',
    specs: ['100% Cotton', 'Unisex Fit', 'S–2XL', 'Stonewash Black'],
    basePrice: 42.01,
    roundUpAmount: 0.99,
    totalPrice: 43.00,
    donationAmount: 5.20,
    category: 'wear-care',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: true,
  },
  {
    id: 'salon-apron',
    name: 'Canvas Pro Apron',
    brand: 'Modeled',
    description: 'Waxed canvas apron with chest pocket, side pockets, and adjustable straps. Protective and stylish for color and cut work.',
    specs: ['Waxed Canvas', 'Adjustable Neck', '3 Pockets', 'Water-Resistant'],
    basePrice: 69.01,
    roundUpAmount: 0.99,
    totalPrice: 70.00,
    donationAmount: 0.99,
    category: 'wear-care',
    imageUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=600&fit=crop',
    featured: false,
    isWearCare: false,
  },
];

const categories = [
  { key: 'all', label: 'All' },
  { key: 'tools', label: 'Tools & Equipment' },
  { key: 'supplies', label: 'Products & Supplies' },
  { key: 'training', label: 'Training' },
  { key: 'wear-care', label: 'Wear Care' },
];

export default function ProShop() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addedToCart, setAddedToCart] = useState({});

  const featured = products.find(p => p.featured);
  const filteredProducts = (selectedCategory === 'all'
    ? products.filter(p => !p.featured)
    : products.filter(p => p.category === selectedCategory && !p.featured)
  );

  const handleBuy = (product) => {
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 2000);
    alert(
      `${product.name} — $${product.totalPrice.toFixed(2)}\n\n` +
      `${product.isWearCare
        ? `✦ $${Math.round(product.donationAmount)} donated to mental health access (10% of sale)\n`
        : `✦ $1 round-up goes to the ROLE Model Fund\n`}` +
      `\nStripe Checkout integration is live — this will complete payment.`
    );
  };

  return (
    <div style={styles.container}>

      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>The Pro Shop</h1>
          <p style={styles.heroSub}>
            Curated tools, supplies, and education from the brands professionals actually use.
            Every purchase rounds up to support the ROLE Model mission.
          </p>
          <span style={styles.heroBadge}>✦ $0.99 round-up on every order</span>
        </div>
        <div style={styles.heroStats}>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>$1,247</span>
            <span style={styles.heroStatLabel}>Donated</span>
          </div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>312</span>
            <span style={styles.heroStatLabel}>Orders</span>
          </div>
          <div style={styles.heroStat}>
            <span style={styles.heroStatNum}>8</span>
            <span style={styles.heroStatLabel}>Brands</span>
          </div>
        </div>
      </div>

      {/* Impact bar */}
      <div style={styles.impactBar}>
        <div style={styles.impactItem}>
          <span style={styles.impactNum}>$1,248</span>
          <span style={styles.impactLabel}>Total Donated</span>
        </div>
        <div style={styles.impactDivider} />
        <div style={styles.impactItem}>
          <span style={styles.impactNum}>312</span>
          <span style={styles.impactLabel}>Round-Ups</span>
        </div>
        <div style={styles.impactDivider} />
        <div style={styles.impactItem}>
          <span style={styles.impactNum}>4</span>
          <span style={styles.impactLabel}>Causes Supported</span>
        </div>
        <div style={styles.impactDivider} />
        <div style={{ fontSize: '0.85rem', color: '#5A3A2A', fontStyle: 'italic', fontFamily: '"Alike", "Georgia", serif' }}>
          Every $0.99 adds up to real change.
        </div>
      </div>

      {/* Featured Product — Kashi Shears */}
      {featured && (
        <div style={styles.featuredSection}>
          <div style={styles.sectionTitle}>
            ✦ Featured Product
          </div>
          <div style={styles.featuredCard}>
            {featured.imageUrl ? (
              <img
                src={featured.imageUrl}
                alt={featured.name}
                style={styles.featuredImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={styles.featuredImagePlaceholder}>✂️</div>
            )}
            <div style={styles.featuredContent}>
              <div style={styles.featuredBrand}>{featured.brand}</div>
              <h2 style={styles.featuredName}>{featured.name}</h2>
              <p style={styles.featuredDesc}>{featured.description}</p>
              <div style={styles.featuredSpecs}>
                {featured.specs.map(s => (
                  <span key={s} style={styles.specTag}>{s}</span>
                ))}
              </div>
              <div style={styles.featuredPriceRow}>
                <span style={styles.featuredPrice}>${featured.basePrice.toFixed(2)}</span>
                <span style={styles.roundUpNote}>+ $1 round-up donation</span>
              </div>
              <div style={styles.donationNote}>
                ✦ $1 goes to the ROLE Model Fund
              </div>
              <button
                style={styles.buyBtn}
                onClick={() => handleBuy(featured)}
                onMouseOver={e => e.target.style.opacity = '0.88'}
                onMouseOut={e => e.target.style.opacity = '1'}
              >
                {addedToCart[featured.id] ? '✓ Added!' : 'Buy Now — $300.00'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle Banner */}
      <div style={styles.lifestyleBanner}>
        <img
          src="https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=1400&h=560&fit=crop&q=80"
          alt="Professional stylist at work"
          style={styles.lifestyleImg}
        />
        <div style={styles.lifestyleOverlay}>
          <div style={styles.lifestyleText}>
            <div style={styles.lifestyleHeading}>Craft Starts With the Right Tools</div>
            <div style={styles.lifestyleSub}>
              Every item in the Pro Shop is hand-picked for working professionals. Tools that perform, supplies that last.
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={styles.categoryTabs}>
        {categories.map(cat => (
          <button
            key={cat.key}
            style={{ ...styles.tab, ...(selectedCategory === cat.key ? styles.tabActive : {}) }}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div style={styles.grid}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              style={styles.card}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(107, 24, 48, 0.14)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(107, 24, 48, 0.06)';
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={styles.cardImg}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div style={styles.cardImgPlaceholder}>
                  {product.category === 'tools' ? '✂️'
                    : product.category === 'supplies' ? '🧴'
                    : product.category === 'training' ? '🎓'
                    : '👕'}
                </div>
              )}
              <div style={styles.cardBody}>
                <div style={styles.cardBrand}>{product.brand}</div>
                <div style={styles.cardName}>{product.name}</div>
                <div style={styles.cardDesc}>{product.description}</div>
                <div style={styles.cardPriceRow}>
                  <span style={styles.cardPrice}>${product.basePrice.toFixed(2)}</span>
                  <span style={styles.cardRoundUp}>+$1 donation</span>
                </div>
                <div style={styles.cardDonation}>
                  {product.isWearCare
                    ? `✦ $${Math.round(product.donationAmount)} donated (10% of sale)`
                    : `✦ $1 round-up to ROLE Model Fund`}
                </div>
                <button
                  style={{
                    ...styles.cardBtn,
                    opacity: addedToCart[product.id] ? 0.75 : 1,
                  }}
                  onClick={() => handleBuy(product)}
                >
                  {addedToCart[product.id] ? '✓ Added!' : `Buy Now — $${product.totalPrice.toFixed(2)}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#5A3A2A', fontFamily: '"Alike", "Georgia", serif' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#8B1E3F' }}>More coming soon</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>We're curating the best in this category.</div>
        </div>
      )}
    </div>
  );
}
