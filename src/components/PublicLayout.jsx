import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu, X, Lock, ArrowRight, ShieldCheck, Mail, Globe,
  Sparkles, ExternalLink, ChevronRight
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
      background: 'var(--dark-navy)',
      color: '#FFFFFF',
      borderTop: '1px solid rgba(255,255,255,0.08)'
    }}>
      {/* Upper Footer: Continuous Auto-Rotating Infinite Services Marquee Slider */}
      <div className="services-marquee-wrapper" style={{
        padding: '1.15rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.3)',
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
                padding: '0 0.75rem',
              }}
            >
              <span>{item}</span>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary-orange)', display: 'inline-block' }} />
            </span>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="public-footer-container" style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '3.5rem 2rem 2.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '2.5rem'
      }}>
        {/* Col 1: Brand & Positioning */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <img src="/i2s-logo-light.svg" alt="I2S Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#FFFFFF', fontFamily: 'var(--font-heading)' }}>
              Imagination 2 Software
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Custom software, AI automation & social media branding, built for impact and scale.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href={I2S_COMPANY_INFO.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.45rem 0.85rem',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#CBD5E1',
                textDecoration: 'none'
              }}
            >
              Instagram
            </a>
            <a
              href={I2S_COMPANY_INFO.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.45rem 0.85rem',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#CBD5E1',
                textDecoration: 'none'
              }}
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Pages
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link to="/about" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>About Us</Link>
            <Link to="/services" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>All Services</Link>
            <Link to="/work" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>Selected Work</Link>
            <Link to="/store" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>Ready-Made Stores</Link>
            <Link to="/blog" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>Blog & Insights</Link>
            <Link to="/faq" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>Frequently Asked Questions</Link>
            <Link to="/contact" style={{ fontSize: '0.88rem', color: '#94A3B8', textDecoration: 'none' }}>Contact Us</Link>
          </div>
        </div>

        {/* Col 3: Contact & Location */}
        <div>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFFFFF', marginBottom: '1.25rem' }}>
            Direct Contact
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#94A3B8' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Official Email</div>
              <a href="mailto:hello@i2s.in" style={{ color: 'var(--primary-orange)', fontWeight: 700, textDecoration: 'none' }}>hello@i2s.in</a>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>HQ & Operations</div>
              <div>India — Remote Worldwide</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Turnaround Guarantee</div>
              <div>Replies within 24 hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Strip */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1.5rem 2rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: '#64748B'
      }}>
        © 2026 Imagination 2 Software (I2S). All Rights Reserved.
      </div>
    </footer>
  );
};
