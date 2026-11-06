import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';

export const RedesignedNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Work', path: '/work' },
    { label: 'Case Studies', path: '/work' },
    { label: 'Pricing', path: '/store' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(5, 5, 5, 0.92)' : 'rgba(5, 5, 5, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'all 0.3s ease',
        padding: '1rem clamp(1.25rem, 4vw, 3.5rem)',
      }}
    >
      <div
        style={{
          maxWidth: '1360px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1A1A1A 0%, #0F0F0F 100%)',
              border: '1px solid rgba(255, 118, 40, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(255, 118, 40, 0.15)',
            }}
          >
            <img
              src="/i2s-logo.webp"
              alt="I2S Logo"
              style={{ width: '28px', height: '28px', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 900,
                fontSize: '1.1rem',
                color: '#FF7628',
                display: 'none',
              }}
              id="fallback-logo-text"
            >
              I2S
            </span>
          </div>

          <div>
            <div
              className="font-heading"
              style={{
                fontWeight: 800,
                fontSize: '1.25rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              I2S <span style={{ color: '#FF7628' }}>.</span>
            </div>
            <div
              style={{
                fontSize: '0.65rem',
                color: '#8CFF00',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Digital Growth Agency
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className="hidden-mobile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.85rem',
          }}
        >
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FF7628' : '#A5A5A5',
                  textDecoration: 'none',
                  position: 'relative',
                  padding: '0.4rem 0',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#FF7628' : '#A5A5A5')}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '2px',
                      background: 'linear-gradient(90deg, #FF7628, #8CFF00)',
                      borderRadius: '999px',
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/contact"
            className="btn-i2s-primary"
            style={{
              padding: '0.65rem 1.35rem',
              fontSize: '0.88rem',
              borderRadius: '9999px',
            }}
          >
            <span>Get Started</span>
            <ArrowUpRight size={16} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="visible-mobile"
            aria-label="Toggle menu"
            style={{
              background: '#111111',
              border: '1px solid #292929',
              borderRadius: '10px',
              padding: '0.55rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#0B0B0B',
            borderBottom: '1px solid #292929',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          }}
        >
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: location.pathname === item.path ? '#FF7628' : '#FFFFFF',
                textDecoration: 'none',
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '0.9rem',
              color: '#8CFF00',
              fontWeight: 700,
              padding: '0.5rem 0',
              textDecoration: 'none',
            }}
          >
            Access Corporate Portal →
          </Link>
        </div>
      )}
    </header>
  );
};

export default RedesignedNavbar;
