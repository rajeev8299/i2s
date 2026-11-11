import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, User, Phone, Building } from 'lucide-react';

export const LoginPage = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null); // { message, temporaryClientId, email }

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Automatic role-based redirection based strictly on authenticated backend user record
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(regData),
      });

      setRegSuccess({
        message: res.message,
        temporaryClientId: res.temporaryClientId,
        email: res.user?.email || regData.email,
      });
      setRegData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        companyName: '',
      });
    } catch (err) {
      setError(err.message || 'Account registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2F6 50%, var(--bg-app) 100%)',
      padding: 'clamp(1.5rem, 3vw, 2.5rem) 1rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)',
        color: 'var(--text-main)',
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', textDecoration: 'none' }}>
            <img
              src="/i2s-logo.svg"
              alt="I2S — Imagination2Software"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em', color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
                Imagination2Software
              </div>
            </div>
          </Link>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.25rem 0', fontFamily: 'var(--font-heading)' }}>
            {mode === 'login' ? 'Sign In to Business Portal' : 'Register New Account'}
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
            {mode === 'login'
              ? 'Enter your corporate credentials to access your authorized workspace.'
              : 'Submit your details for verification and Admin role approval.'}
          </p>
        </div>

        {/* Tab Switcher between Sign In and Registration */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#F1F5F9',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-color)',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setRegSuccess(null); }}
            style={{
              padding: '0.6rem',
              fontSize: '0.86rem',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? '#FFFFFF' : 'var(--text-secondary)',
              background: mode === 'login' ? 'var(--primary-orange)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: mode === 'login' ? '0 2px 6px rgba(255, 90, 0, 0.25)' : 'none'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setRegSuccess(null); }}
            style={{
              padding: '0.6rem',
              fontSize: '0.86rem',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? '#FFFFFF' : 'var(--text-secondary)',
              background: mode === 'register' ? 'var(--primary-orange)' : 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: mode === 'register' ? '0 2px 6px rgba(255, 90, 0, 0.25)' : 'none'
            }}
          >
            Register Request
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.65rem',
            padding: '0.85rem 1rem',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            color: '#B91C1C',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            lineHeight: 1.4,
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Success Confirmation */}
        {regSuccess && (
          <div style={{
            padding: '1.25rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={18} />
              Registration Submitted Successfully
            </div>
            <p style={{ fontSize: '0.82rem', color: '#065F46', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
              Your account request is <strong>Pending Admin Approval</strong>. Once an administrator approves your account and assigns your organizational role, you will be able to log in.
            </p>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #A7F3D0',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#065F46',
            }}>
              <div><strong>Email:</strong> {regSuccess.email}</div>
              <div style={{ marginTop: '0.2rem' }}>
                <strong>Temporary Client ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{regSuccess.temporaryClientId}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setMode('login'); setRegSuccess(null); setEmail(regSuccess.email); }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.85rem', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        {/* MODE 1: COMMON LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.45rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email / User ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Enter your registered email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--primary-orange)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    paddingRight: '2.5rem',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.92rem'
                  }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.4rem',
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* MODE 2: ACCOUNT REGISTRATION FORM */}
        {mode === 'register' && !regSuccess && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John"
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Doe"
                  value={regData.lastName}
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                  style={{ background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="applicant@company.com"
                  value={regData.email}
                  onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                  style={{ paddingLeft: '2.5rem', background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password * (min. 8 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  className="form-input"
                  placeholder="Create secure password"
                  value={regData.password}
                  onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.85rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    style={{ paddingLeft: '2.2rem', background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--dark-navy)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Organization / Company
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Corp"
                    value={regData.companyName}
                    onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                    style={{ paddingLeft: '2.2rem', background: '#FFFFFF', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                  <Building size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: '#F8FAFC', border: '1px solid var(--border-color)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.5 }}>
              &bull; An automatic temporary Client ID will be generated upon registration.<br />
              &bull; Account access is held in <strong>Pending Admin Approval</strong> until verified and assigned an approved role by Administrator.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.4rem',
                padding: '0.85rem',
                fontWeight: 700,
                fontSize: '0.95rem'
              }}
            >
              {loading ? 'Submitting Registration...' : 'Submit Registration Request'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Security badge and return to homepage */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <ShieldCheck size={14} color="#10B981" /> Role-based session security &bull; PostgreSQL 18
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/" style={{ fontSize: '0.88rem', color: 'var(--primary-orange)', textDecoration: 'none', fontWeight: 600 }}>
              &larr; Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
