import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      if (data.devResetToken) {
        setDevToken(data.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Unable to process reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Password Recovery
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Enter your registered work email to receive password recovery authorization.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {submitted ? (
          <div>
            <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <CheckCircle2 size={18} /> Password reset instructions have been logged.
            </div>
            {devToken && (
              <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Development Reset Token:</span>
                <code style={{ wordBreak: 'break-all', color: '#60a5fa' }}>{devToken}</code>
                <div style={{ marginTop: '0.5rem' }}>
                  <Link to={`/reset-password?token=${devToken}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                    Click here to reset password directly
                  </Link>
                </div>
              </div>
            )}
            <Link to="/login" className="secondary-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Work Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="name@i2s.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="glow-btn" style={{ justifyContent: 'center', width: '100%' }}>
              {loading ? 'Processing...' : 'Send Recovery Token'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
