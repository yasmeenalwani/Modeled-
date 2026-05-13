import React from 'react';
import ChatWindow from '../../components/ChatWindow';

// ============ STYLES ============
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    height: 'calc(100vh - 100px)',
  },
  header: {
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.95rem',
  },
};

export default function PartnerChat() {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Chat Support 💬</h1>
        <p style={styles.subtitle}>
          Reach out to Modeled Management for business support and inquiries.
        </p>
      </div>
      
      <ChatWindow userType="partner" />
    </div>
  );
}

