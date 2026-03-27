import React from 'react';

export default function Loader({ text = 'جارٍ التحميل...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', gap: '16px'
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{text}</p>
    </div>
  );
}
