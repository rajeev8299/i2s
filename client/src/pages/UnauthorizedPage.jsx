import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const UnauthorizedPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          403 Access Forbidden
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          Your current user role lacks server authorization to view or manipulate this operational module.
        </p>
        <Link to="/app/dashboard" className="glow-btn" style={{ justifyContent: 'center', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Return to Permitted Dashboard
        </Link>
      </div>
    </div>
  );
};
