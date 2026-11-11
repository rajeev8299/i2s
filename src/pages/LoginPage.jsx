import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import {
  Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck,
  CheckCircle2, User, Phone, Building, Sparkles, UserCheck, Key
} from 'lucide-react';

const DEMO_ROLES = [
  { role: 'Super Admin', email: 'superadmin@i2s.com', tag: 'Full Control', desc: 'Managing Director & Executive Governance' },
  { role: 'Admin', email: 'admin@i2s.com', tag: 'Operations', desc: 'Operations Director & Admin Management' },
  { role: 'Accounts Manager', email: 'accounts@i2s.com', tag: 'Finance', desc: 'Invoices, Receipts & General Ledger' },
  { role: 'HR Manager', email: 'hr@i2s.com', tag: 'HR & Payroll', desc: 'Staff Profiles, Attendance & Salaries' },
  { role: 'Team Leader', email: 'teamlead@i2s.com', tag: 'Projects', desc: 'Project Delivery & Task Reviews' },
  { role: 'Staff Specialist', email: 'staff@i2s.com', tag: 'Engineering', desc: 'Full Stack Development & Tasks' },
  { role: 'Intern', email: 'intern@i2s.com', tag: 'Internship', desc: 'Learning Submissions & Daily Tasks' },
  { role: 'Client Portal', email: 'client@acmecorp.com', tag: 'Client', desc: 'Milestones, Invoices & Service Catalog' },
];

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Quick Demo role selection from URL query or click
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const match = DEMO_ROLES.find(r => 
        r.role.toLowerCase().replace(/\s+/g, '-') === roleParam.toLowerCase() ||
        r.role.toLowerCase().replace(/\s+/g, '') === roleParam.toLowerCase() ||
        r.email.toLowerCase().includes(roleParam.toLowerCase())
      );
      if (match) {
        setEmail(match.email);
        setPassword('Password123!');
      }
    }
  }, [searchParams]);

  const selectDemoRole = (demo) => {
    setEmail(demo.email);
    setPassword('Password123!');
    setError('');
  };

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
      background: 'radial-gradient(circle at top, #1e1e1e 0%, #111111 100%)',
      padding: 'clamp(1rem, 3vw, 2rem) 1rem',
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <img
              src="/i2s-logo-light.svg"
              alt="I2S — Imagination2Software"
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'contain',
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-0.02em', color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
                Imagination2Software
              </div>
            </div>
          </Link>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#FFFFFF', margin: '0.25rem 0' }}>
            {mode === 'login' ? 'Sign In to Business Portal' : 'Register New Account'}
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {mode === 'login'
              ? 'Enter your corporate credentials to access your authorized workspace.'
              : 'Submit your details for verification and Admin role approval.'}
          </p>
        </div>

        {/* Tab Switcher between Sign In and Registration */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '4px',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setRegSuccess(null); }}
            style={{
              padding: '0.55rem',
              fontSize: '0.84rem',
              fontWeight: mode === 'login' ? 700 : 500,
              color: mode === 'login' ? '#FFFFFF' : '#94A3B8',
              background: mode === 'login' ? 'var(--primary-blue)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setRegSuccess(null); }}
            style={{
              padding: '0.55rem',
              fontSize: '0.84rem',
              fontWeight: mode === 'register' ? 700 : 500,
              color: mode === 'register' ? '#FFFFFF' : '#94A3B8',
              background: mode === 'register' ? 'var(--primary-blue)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
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
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
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
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34D399', fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.4rem' }}>
              <CheckCircle2 size={18} />
              Registration Submitted Successfully
            </div>
            <p style={{ fontSize: '0.82rem', color: '#D1FAE5', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
              Your account request is <strong>Pending Admin Approval</strong>. Once an administrator approves your account and assigns your organizational role, you will be able to log in.
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '0.6rem 0.8rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              color: '#A7F3D0',
            }}>
              <div><strong>Email:</strong> {regSuccess.email}</div>
              <div style={{ marginTop: '0.2rem' }}>
                <strong>Temporary Client ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{regSuccess.temporaryClientId}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setMode('login'); setRegSuccess(null); setEmail(regSuccess.email); }}
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.85rem', padding: '0.55rem', fontSize: '0.82rem' }}
            >
              Proceed to Sign In
            </button>
          </div>
        )}

        {/* MODE 1: COMMON LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 500, marginBottom: '0.45rem', color: '#E2E8F0' }}>
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
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 500, color: '#E2E8F0' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
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
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
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
                    color: 'var(--text-dim)',
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
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem', padding: '0.85rem', fontWeight: 600 }}
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John"
                  value={regData.firstName}
                  onChange={(e) => setRegData({ ...regData, firstName: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Doe"
                  value={regData.lastName}
                  onChange={(e) => setRegData({ ...regData, lastName: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
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
                  style={{ paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
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
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
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
                    color: 'var(--text-dim)',
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
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 9876543210"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <Phone size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, marginBottom: '0.35rem', color: '#E2E8F0' }}>
                  Organization / Company
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Acme Corp"
                    value={regData.companyName}
                    onChange={(e) => setRegData({ ...regData, companyName: e.target.value })}
                    style={{ paddingLeft: '2.2rem' }}
                  />
                  <Building size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#94A3B8', background: 'rgba(255, 255, 255, 0.04)', padding: '0.65rem 0.85rem', borderRadius: '6px' }}>
              &bull; An automatic temporary Client ID will be generated upon registration.<br />
              &bull; Account access is held in <strong>Pending Admin Approval</strong> until verified and assigned an approved role by Administrator.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.4rem', padding: '0.85rem', fontWeight: 600 }}
            >
              {loading ? 'Submitting Registration...' : 'Submit Registration Request'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* Quick Demo Role Switcher for Testing & Verification */}
        {mode === 'login' && (
          <div style={{
            marginTop: '1.75rem',
            padding: '1.15rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 700, color: '#F8FAFC' }}>
                <Key size={14} color="var(--primary-orange)" />
                <span>Quick Role Login Selection</span>
              </div>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Click to auto-fill</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.45rem',
            }}>
              {DEMO_ROLES.map((d, idx) => {
                const isSelected = email === d.email;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDemoRole(d)}
                    style={{
                      background: isSelected ? 'rgba(255, 90, 0, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1px solid var(--primary-orange)' : '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '6px',
                      padding: '0.45rem 0.6rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--primary-orange)' : '#FFFFFF',
                    }}>
                      <span>{d.role}</span>
                      {isSelected && <CheckCircle2 size={12} color="var(--primary-orange)" />}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.tag}
                    </div>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '0.65rem', textAlign: 'center' }}>
              Default development password: <code style={{ color: '#E2E8F0', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>Password123!</code>
            </div>
          </div>
        )}

        {/* Security badge and return to homepage */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#94A3B8' }}>
            <ShieldCheck size={14} color="#10B981" /> Role-based session security &bull; PostgreSQL 18
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textDecoration: 'none' }}>
              &larr; Return to Public Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
