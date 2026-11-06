import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ArrowRight, ShieldCheck, CheckCircle2, Lock,
  TrendingUp, Users, FileText, Briefcase, CheckSquare, Sparkles,
  Layers, Cpu, Building, Award, Clock, Activity, ExternalLink, BarChart3,
  Code2, Smartphone, Bot, MessageSquare, PhoneCall, GraduationCap,
  FolderKanban, Share2, UserCheck, Search, Flame, ShoppingBag, Check,
  Zap, Rocket, Server, Terminal, Menu, X, ChevronRight
} from 'lucide-react';
import {
  I2S_OFFICIAL_SERVICES,
  I2S_READY_MADE_PRODUCTS,
  I2S_STORE_DEPLOYMENT_TIERS,
} from '../data/servicesData';
import { VideoCarouselSection } from '../components/VideoCarouselSection';

export const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState('All');
  const dropdownRef = useRef(null);
  const mobileMenuDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Handle escape key and outside click for mobile navigation dropdown
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    const handlePointerDown = (e) => {
      if (mobileMenuDropdownRef.current && !mobileMenuDropdownRef.current.contains(e.target)) {
        const toggleBtn = document.querySelector('.landing-mobile-toggle-btn');
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

  const serviceCategories = ['All', 'Engineering', 'AI & Automation', 'Platforms', 'Growth & Marketing'];
  const filteredServices = selectedServiceCategory === 'All'
    ? I2S_OFFICIAL_SERVICES
    : I2S_OFFICIAL_SERVICES.filter(s => s.category === selectedServiceCategory);

  const storeCategories = ['All', 'E-Commerce', 'Portfolio', 'Business', 'Booking', 'Food & Delivery', 'Education'];
  const filteredProducts = selectedStoreCategory === 'All'
    ? I2S_READY_MADE_PRODUCTS
    : I2S_READY_MADE_PRODUCTS.filter(p => p.category === selectedStoreCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. PROFESSIONAL NAVBAR */}
      <header className="public-navbar-header" style={{
        padding: '1.15rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-app)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left: Branding */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, textDecoration: 'none' }}>
          <img
            src="/i2s-logo.svg"
            alt="I2S — Imagination2Software"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain',
              flexShrink: 0
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div className="public-brand-title" style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span className="brand-text-desktop">Imagination2Software</span>
              <span className="brand-text-mobile">I2S</span>
            </div>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link
            to="/"
            className="rainfall-nav-item rainfall-delay-0"
            style={{
              fontSize: '0.92rem',
              color: 'var(--primary-orange)',
              fontWeight: 700,
              textDecoration: 'none',
              position: 'relative',
              padding: '0.35rem 0',
              transition: 'color var(--transition-fast)'
            }}
          >
            Home
            <span style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'var(--primary-orange)',
              borderRadius: '999px'
            }} />
          </Link>
          <Link to="/about" className="rainfall-nav-item rainfall-delay-1" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>About</Link>
          <Link to="/services" className="rainfall-nav-item rainfall-delay-2" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Services</Link>
          <Link to="/work" className="rainfall-nav-item rainfall-delay-3" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Work</Link>
          <Link to="/store" className="rainfall-nav-item rainfall-delay-4" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Store</Link>
          <Link to="/blog" className="rainfall-nav-item rainfall-delay-5" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Blog</Link>
          <Link to="/faq" className="rainfall-nav-item rainfall-delay-6" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>FAQ</Link>
          <Link to="/contact" className="rainfall-nav-item rainfall-delay-7" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500, textDecoration: 'none' }}>Contact</Link>
        </nav>

        {/* Right: Actions & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
            Get Started <ArrowRight size={16} />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="visible-mobile landing-mobile-toggle-btn"
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem',
              cursor: 'pointer',
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
              ref={mobileMenuDropdownRef}
              className="compact-mobile-dropdown"
              role="dialog"
              aria-label="Mobile Navigation"
            >
              <div className="compact-mobile-dropdown-body">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'About', path: '/about' },
                  { label: 'Services', path: '/services' },
                  { label: 'Work', path: '/work' },
                  { label: 'Store', path: '/store' },
                  { label: 'Blog', path: '/blog' },
                  { label: 'FAQ', path: '/faq' },
                  { label: 'Contact', path: '/contact' },
                ].map((link) => {
                  const active = link.path === '/';
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
              <div className="compact-mobile-dropdown-footer">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                >
                  Get Started <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </>
        )}
      </header>

      {/* 2. HERO SECTION — Light Blue Gradient Background matching Reference */}
      <section style={{
        background: 'linear-gradient(180deg, #EEF5FF 0%, #FFFFFF 100%)',
        padding: 'clamp(2.5rem, 5vw, 5rem) clamp(1rem, 3vw, 2rem) clamp(2rem, 4vw, 4rem)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', gap: 'clamp(2rem, 4vw, 3.5rem)', alignItems: 'center' }}>
          {/* Left Text Column */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 0.95rem',
              background: '#FFFFFF',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              color: 'var(--primary-blue)',
              marginBottom: '1.5rem',
              fontWeight: 600,
              boxShadow: '0 2px 6px rgba(23, 101, 232, 0.08)',
            }}>
              <Sparkles size={15} /> All-in-One Business Operating System
            </div>

            <h1 className="public-hero-title" style={{
              fontSize: 'clamp(2.1rem, 5.5vw, 3.4rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--dark-navy)',
              marginBottom: '1.25rem',
            }}>
              One Platform. Complete Business Control.
            </h1>

            <p style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}>
              Manage clients, projects, teams, finance, HR and business operations from one secure, centralized platform built for <strong>Imagination2Software</strong>.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem' }}>
                Enter Enterprise Portal <ArrowRight size={18} />
              </Link>
              <a href="#modules" className="btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem' }}>
                Explore Capabilities
              </a>
            </div>
          </div>

          {/* Right Dashboard Preview Visual */}
          <div className="ref-card" style={{
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            background: '#FFFFFF',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', padding: '0.2rem 0.85rem', borderRadius: '4px' }}>
                portal.imagination2software.com
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>Active</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROJECTS ACTIVE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-navy)', marginTop: '0.2rem' }}>12 Active</div>
                <div style={{ fontSize: '0.7rem', color: '#10B981', marginTop: '0.2rem' }}>100% on schedule</div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>BILLED REVENUE</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-blue)', marginTop: '0.2rem' }}>Rs. 18.5L</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Balanced ledger</div>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>Quarterly Engineering Milestone</span>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>85%</span>
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '85%', background: 'var(--primary-blue)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL FEATURE STRIP */}
      <section style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          {[
            { icon: Briefcase, label: 'Project Management' },
            { icon: Building, label: 'Client Management' },
            { icon: TrendingUp, label: 'Finance & Accounting' },
            { icon: Users, label: 'HR & Payroll' },
            { icon: CheckSquare, label: 'Team Collaboration' },
            { icon: ShieldCheck, label: 'Security & Reliability' },
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--primary-blue-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={16} />
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--dark-navy)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 4. VERIFIED SERVICES & DIGITAL SOLUTIONS (IMPORTED FROM THEI2S.COM) */}
      <section id="services" style={{ padding: '5.5rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              background: 'var(--primary-light)',
              border: '1px solid #FFEDD5',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: 'var(--primary-orange)',
              marginBottom: '1rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              <Zap size={14} /> Official Service Offerings
            </div>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              How We Can Help Your Business
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              We build custom software, AI automations, and growth systems that help brands launch faster, sell smarter, and scale with measurable results.
            </p>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {serviceCategories.map((cat) => {
                const isActive = selectedServiceCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedServiceCategory(cat)}
                    className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--primary-orange)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 2px 8px rgba(255, 90, 0, 0.25)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '1.5rem',
          }}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="ref-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.5rem',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {/* Header with thumbnail image & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                    loading="lazy"
                  />
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--primary-orange)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {service.category}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.25 }}>
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, flex: 1, marginBottom: '1.25rem' }}>
                  {service.description}
                </p>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {service.featureTags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        padding: '0.2rem 0.55rem',
                        background: '#F3F4F6',
                        color: '#374151',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Card Action Link to Service Portal or Common Login */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    Enterprise Consultation
                  </span>
                  <Link
                    to="/login"
                    className="btn-outline"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none'
                    }}
                  >
                    Request Proposal <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. READY-MADE WEBSITE STORES & PUBLISHED PLANS (IMPORTED FROM THEI2S.COM) */}
      <section id="ready-made-stores" style={{ padding: '5.5rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.95rem',
              background: '#FFFFFF',
              border: '1px solid #FFEDD5',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              color: 'var(--primary-orange)',
              marginBottom: '1rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <ShoppingBag size={14} /> Ready-Made Turnkey Solutions
            </div>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              Buy A Store, Skip The Queue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
              Pre-built, production-ready websites and platforms you can launch in days. We deploy it on your domain and hosting, or hand over the complete code.
            </p>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {storeCategories.map((cat) => {
                const isActive = selectedStoreCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedStoreCategory(cat)}
                    className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: '9999px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                      background: isActive ? 'var(--primary-orange)' : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      boxShadow: isActive ? '0 2px 8px rgba(255, 90, 0, 0.25)' : 'none'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
            gap: '1.75rem',
            marginBottom: '4rem'
          }}>
            {filteredProducts.map((product) => {
              const discountPercent = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
              return (
                <div
                  key={product.id}
                  className="ref-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                  }}
                >
                  {/* Top Image Banner */}
                  <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: '#111111' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
                      loading="lazy"
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        background: 'rgba(17, 17, 17, 0.82)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {product.category}
                      </span>
                      {product.badge && (
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          background: 'var(--primary-orange)',
                          color: '#FFFFFF',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                    }}>
                      {discountPercent}% OFF
                    </div>
                  </div>

                  {/* Body Details */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--primary-orange)', fontWeight: 600, marginBottom: '0.85rem' }}>
                      {product.tagline}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                      {product.description}
                    </p>

                    {/* Included Features List */}
                    <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                        Included Features
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {product.features.map((feat, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                            <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Pricing Block & Action */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            MRP: ₹{product.originalPrice.toLocaleString('en-IN')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            <span style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
                              ₹{product.discountedPrice.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+ taxes</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                          Save ₹{(product.originalPrice - product.discountedPrice).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Link
                        to="/login"
                        className="btn-primary"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '0.75rem 1rem',
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        Order via Client Portal <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Deployment Delivery Tiers Callout */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
                How Our Ready-Made Stores Are Delivered
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                Choose the delivery model that suits your operations — complete managed deployment or full source code handover.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {I2S_STORE_DEPLOYMENT_TIERS.map((tier, tIdx) => (
                <div key={tIdx} className="ref-card" style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tIdx === 0 ? <Server size={18} /> : <Terminal size={18} />}
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                      {tier.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1rem' }}>
                    {tier.body}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {tier.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        <CheckCircle2 size={15} color="var(--primary-orange)" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.75rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
              * Free deployment applies when you provide your own domain & hosting. Customization beyond included features is billed separately. Templates are licensed for your business use.
            </div>
          </div>
        </div>
      </section>

      {/* 6. MAIN BUSINESS MODULE CARDS */}
      <section id="modules" style={{ padding: '5rem 2rem', background: 'var(--bg-app)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              Core Business Modules
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Built specifically for modern enterprise operations with database-backed integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {[
              {
                icon: Building,
                title: 'Clients & Contracts',
                desc: 'Onboard clients, manage service contracts, track terms, and provide dedicated isolated client portals.',
                tag: 'Client Portal Scoped',
              },
              {
                icon: Briefcase,
                title: 'Projects & Tasks',
                desc: 'Track project milestones, priorities, timelines, and multi-stage task review approval workflows.',
                tag: 'Multi-stage Reviews',
              },
              {
                icon: TrendingUp,
                title: 'Finance & Accounting',
                desc: 'GST-compliant invoicing, partial payment tracking, double-entry general ledger, and streaming PDF receipts.',
                tag: 'Balanced General Ledger',
              },
              {
                icon: Users,
                title: 'HR & Payroll',
                desc: 'Staff attendance logging, leave approval workflows, salary structures, and confidential monthly payroll generation.',
                tag: 'Confidential Records',
              },
              {
                icon: CheckSquare,
                title: 'Team Management',
                desc: 'Department mappings, designations, reporting relationships, and project-specific team assignments.',
                tag: 'Role Assignments',
              },
              {
                icon: BarChart3,
                title: 'Reports & Analytics',
                desc: 'Role-appropriate reporting covering project delivery, accounts receivable ageing, and system audit trails.',
                tag: 'Live Database Analytics',
              },
            ].map((card, idx) => (
              <div key={idx} className="ref-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--primary-blue-light)',
                    color: 'var(--primary-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <card.icon size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-navy)' }}>{card.title}</h3>
                    <span className="badge badge-info" style={{ marginTop: '2px', fontSize: '0.7rem' }}>{card.tag}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, flex: 1 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BENEFITS & SECURITY */}
      <section id="security" style={{ padding: '5rem 2rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1rem' }}>
            Enterprise Reliability & Zero-Trust Access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            The platform enforces 8 granular roles directly at the backend API layer. Clients see only approved milestones; staff cannot read unpermitted payroll records; and financial ledgers stay balanced.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
            {[
              'Server-enforced role-based access control (RBAC)',
              'Double-entry accounting parity with immutable journal audit trail',
              'Dedicated client data isolation preventing cross-tenant visibility',
              'Real on-the-fly streaming PDF invoices generated from PostgreSQL',
            ].map((text, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #111111 0%, #FF5A00 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Streamline Business Operations?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#FFE4D6', marginBottom: '2rem', lineHeight: 1.6 }}>
            Access your authorized portal to manage engineering, clients, finance, and human resources.
          </p>
          <Link to="/login" className="btn-primary" style={{ background: '#FFFFFF', color: 'var(--primary-orange)', padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 700 }}>
            Open Portal Gateway <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* 7. WATCH & LEARN — GUIDANCE ON VIDEO CAROUSEL */}
      <VideoCarouselSection />

      {/* 8. FOOTER */}
      <footer style={{ background: 'var(--dark-navy)', color: '#FFFFFF', padding: 'clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 3vw, 3rem)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/i2s-logo-light.svg"
              alt="I2S — Imagination2Software"
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFFFFF' }}>Imagination2Software</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.82rem', color: '#94A3B8' }}>
            <Link to="/login?role=super-admin" style={{ color: '#94A3B8' }}>Super Admin</Link>
            <Link to="/login?role=accounts-manager" style={{ color: '#94A3B8' }}>Accounts</Link>
            <Link to="/login?role=client" style={{ color: '#94A3B8' }}>Client Portal</Link>
            <span>© 2026 Imagination2Software. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
