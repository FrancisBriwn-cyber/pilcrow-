import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        border: '3px solid var(--border)', borderTopColor: 'var(--primary)',
        animation: 'spin 0.7s linear infinite', margin: '0 auto 12px'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '14px' }}>{message}</p>
    </div>
  );
}
