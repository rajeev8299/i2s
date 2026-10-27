import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
          Set New Password
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Please choose a strong password for your Imagination2Software profile.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success ? (
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: 'var(--radius-sm)', color: '#34d399', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <CheckCircle2 size={18} /> Password updated successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>New Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Confirm Password</label>
              <input
                type="password"
                required
                className="form-input"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="glow-btn" style={{ justifyContent: 'center', width: '100%' }}>
              {loading ? 'Updating Password...' : 'Save Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
