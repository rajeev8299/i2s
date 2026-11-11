import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Lock, ArrowRight, ShieldCheck, Mail, Globe,
  Sparkles, ExternalLink, ChevronRight, MapPin, Clock
} from 'lucide-react';
import { I2S_COMPANY_INFO } from '../data/websiteContent';

export const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = React.useRef(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Work', path: '/work' },
    { label: 'Store', path: '/store' },
    { label: 'Blog', path: '/blog' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  // Automatically close mobile menu when path changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle outside click and escape key to close menu
  React.useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const handlePointerDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Only close if click is outside the toggle button as well
        const toggleBtn = document.querySelector('.public-mobile-toggle-btn');
        if (toggleBtn && toggleBtn.contains(e.target)) return;
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mobileMenuOpen]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="public-navbar-header" style={{
      padding: '1.1rem 2.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-app)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Brand Logo & Name */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', minWidth: 0 }}>
        <img
          src="/i2s-logo.svg"
          alt="I2S — Imagination2Software"
          style={{ width: '38px', height: '38px', objectFit: 'contain', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div className="public-brand-title" style={{
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-main)',
            lineHeight: 1.1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            <span className="brand-text-desktop">Imagination2Software</span>
            <span className="brand-text-mobile">I2S</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--primary-orange)', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            SOFTWARE & AI AGENCY
          </div>
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.75rem',
      }} className="hidden-mobile">
        {navLinks.map((link, idx) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`rainfall-nav-item rainfall-delay-${idx}`}
              style={{
                fontSize: '0.92rem',
                color: active ? 'var(--primary-orange)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                position: 'relative',
                padding: '0.35rem 0',
                transition: 'color var(--transition-fast)'
              }}
            >
              {link.label}
              {active && (
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: 'var(--primary-orange)',
                  borderRadius: '999px'
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <Link
          to="/login"
          className="btn-outline hidden-mobile"
          style={{
            fontSize: '0.85rem',
            padding: '0.55rem 1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Lock size={14} color="var(--primary-orange)" />
          <span>Login</span>
        </Link>

        <Link
          to="/contact"
          className="btn-primary"
          style={{
            fontSize: '0.85rem',
            padding: '0.6rem 1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            textDecoration: 'none'
          }}
        >
          Start a Project <ArrowRight size={16} />
        </Link>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="visible-mobile public-mobile-toggle-btn"
          style={{
            background: 'none',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            cursor: 'pointer',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            minHeight: '40px',
            minWidth: '40px'
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Compact Floating Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <>
          <div
            className="compact-mobile-dropdown-backdrop"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dropdownRef}
            className="compact-mobile-dropdown"
            role="dialog"
            aria-label="Mobile Navigation"
          >
            <div className="compact-mobile-dropdown-body">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`compact-mobile-nav-link ${active ? 'active' : ''}`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight size={15} color={active ? 'var(--primary-orange)' : 'rgba(255,255,255,0.4)'} />
                  </Link>
                );
              })}
            </div>
            <div className="compact-mobile-dropdown-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-primary"
              >
                Start a Project <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.85rem'
                }}
              >
                <Lock size={14} color="var(--primary-orange)" />
                <span>Portal Login</span>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Inline styles for responsive visibility */}
      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
          .visible-mobile { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export const PublicFooter = () => {
  return (
    <footer style={{
      background: '#0B0F17',
      color: '#CBD5E1',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Upper Footer: Continuous Auto-Rotating Infinite Services Marquee Slider */}
      <div className="services-marquee-wrapper" style={{
        padding: '1rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.35)',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
      }}>
        <div className="services-marquee-track">
          {[
            'Web Development', 'App Development', 'AI Chatbots', 'WhatsApp Bots',
            'AI Calling Agents', 'LMS Platforms', 'PMS Platforms', 'Social Media',
            'AI Branding', 'SEO & AI SEO', 'Paid Growth'
          ].concat([
            'Web Development', 'App Development', 'AI Chatbots', 'WhatsApp Bots',
            'AI Calling Agents', 'LMS Platforms', 'PMS Platforms', 'Social Media',
            'AI Branding', 'SEO & AI SEO', 'Paid Growth'
          ]).concat([
            'Web Development', 'App Development', 'AI Chatbots', 'WhatsApp Bots',
            'AI Calling Agents', 'LMS Platforms', 'PMS Platforms', 'Social Media',
            'AI Branding', 'SEO & AI SEO', 'Paid Growth'
          ]).map((item, idx) => (
            <span
              key={idx}
              className="services-marquee-item"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#94A3B8',
                flexShrink: 0,
                padding: '0 0.85rem',
              }}
            >
              <span>{item}</span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'inline-block' }} />
            </span>
          ))}
        </div>
      </div>

      {/* Main 4-Column Footer Container */}
      <div className="public-footer-container" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '3.75rem 2rem 2.75rem',
      }}>
        <div className="public-footer-grid">
          {/* COLUMN 1 — BRAND & ABOUT */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img
                src="/i2s-logo-light.svg"
                alt="I2S Logo"
                style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              />
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: '#FFFFFF', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                Imagination 2 Software
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              {I2S_COMPANY_INFO.subheading || 'Custom software, AI automation & social media branding, built for impact, performance, and enterprise scale.'}
            </p>

            {/* Subtle Visual Accent Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.8rem',
              background: 'rgba(255, 90, 0, 0.08)',
              border: '1px solid rgba(255, 90, 0, 0.22)',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FF8A3D',
              marginBottom: '1.5rem',
              width: 'fit-content'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px #22C55E', display: 'inline-block' }} />
              <span>Accepting New Projects Worldwide</span>
            </div>

            {/* Social Media Links with Professional Icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <a
                href={I2S_COMPANY_INFO.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="public-footer-social-btn"
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>

              <a
                href={I2S_COMPANY_INFO.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="public-footer-social-btn"
                aria-label="LinkedIn"
                title="Connect on LinkedIn"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect width="4" height="12" x="2" y="9"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>

              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="public-footer-social-btn"
                aria-label="X (Twitter)"
                title="Follow us on X"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="public-footer-social-btn"
                aria-label="GitHub"
                title="View our GitHub"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div>
            <h4 className="public-footer-col-heading">
              <span>Quick Links</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/" className="public-footer-link">Home</Link>
              <Link to="/about" className="public-footer-link">About Us</Link>
              <Link to="/services" className="public-footer-link">All Services</Link>
              <Link to="/work" className="public-footer-link">Selected Work</Link>
              <Link to="/store" className="public-footer-link">Ready-Made Stores</Link>
              <Link to="/blog" className="public-footer-link">Blog & Insights</Link>
              <Link to="/faq" className="public-footer-link">Frequently Asked Questions</Link>
              <Link to="/contact" className="public-footer-link">Contact Us</Link>
            </div>
          </div>

          {/* COLUMN 3 — OUR SERVICES */}
          <div>
            <h4 className="public-footer-col-heading">
              <span>Our Services</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/services" className="public-footer-link">Web Development</Link>
              <Link to="/services" className="public-footer-link">App Development</Link>
              <Link to="/services" className="public-footer-link">AI Chatbots</Link>
              <Link to="/services" className="public-footer-link">WhatsApp Bots</Link>
              <Link to="/services" className="public-footer-link">AI Calling Agents</Link>
              <Link to="/services" className="public-footer-link">LMS Platforms</Link>
              <Link to="/services" className="public-footer-link">PMS Platforms</Link>
              <Link to="/services" className="public-footer-link">Social Media Marketing</Link>
              <Link to="/services" className="public-footer-link">AI Branding</Link>
              <Link to="/services" className="public-footer-link">SEO & Growth</Link>
            </div>
          </div>

          {/* COLUMN 4 — CONTACT & GET IN TOUCH */}
          <div>
            <h4 className="public-footer-col-heading">
              <span>Get in Touch</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Official Email
                </div>
                <a
                  href={`mailto:${I2S_COMPANY_INFO.email || 'hello@i2s.in'}`}
                  style={{
                    color: 'var(--primary-orange)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'color 0.2s ease'
                  }}
                  className="footer-email-link"
                >
                  <Mail size={15} style={{ flexShrink: 0 }} />
                  <span>{I2S_COMPANY_INFO.email || 'hello@i2s.in'}</span>
                </a>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  HQ & Operations
                </div>
                <div style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <MapPin size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  <span>{I2S_COMPANY_INFO.location || 'India — Remote Worldwide'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Turnaround Guarantee
                </div>
                <div style={{ color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Clock size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  <span>Replies {I2S_COMPANY_INFO.responseTime ? I2S_COMPANY_INFO.responseTime.toLowerCase() : 'within 24 hours'}</span>
                </div>
              </div>

              {/* Start a Project CTA Button */}
              <Link
                to="/contact"
                className="public-footer-cta-btn"
                style={{
                  marginTop: '0.35rem',
                  width: '100%',
                }}
              >
                <span>Start a Project</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Separate Bottom Footer Strip */}
      <div style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#070A10',
        padding: '1.5rem 2rem',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#64748B'
        }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: '#CBD5E1', fontWeight: 600 }}>Imagination 2 Software</strong>. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link to="/about" className="public-footer-bottom-link">Privacy Policy</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            <Link to="/about" className="public-footer-bottom-link">Terms & Conditions</Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>•</span>
            <span style={{ color: '#94A3B8' }}>Engineered for High-Growth Scale</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
