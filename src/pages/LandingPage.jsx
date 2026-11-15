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
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { HeroServicesWheel } from '../components/HeroServicesWheel';

export const LandingPage = () => {
  const [selectedServiceCategory, setSelectedServiceCategory] = useState('All');
  const [selectedStoreCategory, setSelectedStoreCategory] = useState('All');

  const serviceCategories = ['All', 'Engineering', 'AI & Automation', 'Platforms', 'Growth & Marketing'];
  const filteredServices = selectedServiceCategory === 'All'
    ? I2S_OFFICIAL_SERVICES
    : I2S_OFFICIAL_SERVICES.filter(s => s.category === selectedServiceCategory);

  const storeCategories = ['All', 'E-Commerce', 'Portfolio', 'Business', 'Booking', 'Food & Delivery', 'Education'];
  const filteredProducts = selectedStoreCategory === 'All'
    ? I2S_READY_MADE_PRODUCTS
    : I2S_READY_MADE_PRODUCTS.filter(p => p.category === selectedStoreCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      {/* 1. PROFESSIONAL NAVBAR */}
      <PublicNavbar />

      {/* 2. HERO SECTION — EXACT REFERENCE-BASED IMPLEMENTATION */}
      <section className="public-home-hero" style={{
        background: 'linear-gradient(180deg, #F0F5B8 0%, #F5F7D8 50%, #FAFCE8 100%)',
        padding: 'clamp(1.25rem, 2.8vw, 2.5rem) clamp(1rem, 3.5vw, 3rem) clamp(2.25rem, 3.5vw, 3.25rem)',
        borderBottom: '1px solid var(--border-color)',
        width: '100%',
        minHeight: 'auto',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Decorative background ambient soft curves */}
        <div style={{
          position: 'absolute',
          top: '-15%',
          right: '-8%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 101, 0, 0.08) 0%, rgba(240, 245, 184, 0.4) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(245, 247, 216, 0.3) 50%, transparent 75%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          maxWidth: '1480px',
          width: '100%',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 480px), 1fr))',
          gap: 'clamp(2rem, 3.8vw, 3.5rem)',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Left Hero Content */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Small Eyebrow Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              color: 'var(--primary-orange)',
              padding: '0.38rem 1rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              marginBottom: '1.25rem',
              width: 'fit-content',
              boxShadow: '0 2px 6px rgba(17, 17, 17, 0.04)'
            }}>
              <Sparkles size={14} color="var(--primary-orange)" />
              <span>All-in-One Digital Solutions by I2S</span>
            </div>

            {/* Main Heading with Orange Highlight */}
            <h1 className="public-hero-title" style={{
              fontSize: 'clamp(2.2rem, 5.2vw, 3.5rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              color: 'var(--dark-navy)',
              marginBottom: '1.25rem',
            }}>
              Complete Digital Growth for <span style={{ color: 'var(--primary-orange)' }}>Your Business</span>
            </h1>

            {/* Description */}
            <p style={{
              fontSize: 'clamp(0.98rem, 2vw, 1.15rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '2rem',
              maxWidth: '580px'
            }}>
              From website & app development to marketing, branding and automation — I2S delivers end-to-end digital solutions to build, grow and scale your business.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '2.5rem' }}>
              <Link
                to="/contact"
                className="btn-primary"
                style={{
                  padding: '0.9rem 1.85rem',
                  fontSize: '0.96rem',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 6px 18px rgba(255, 101, 0, 0.35)',
                  textDecoration: 'none'
                }}
              >
                Get Started with I2S <ArrowRight size={18} />
              </Link>
              <a
                href="#services"
                className="btn-secondary"
                style={{
                  padding: '0.9rem 1.65rem',
                  fontSize: '0.96rem',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: '#FFFFFF',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 2px 8px rgba(17, 17, 17, 0.04)'
                }}
              >
                Explore Services
              </a>
            </div>

            {/* Business Statistics with Thin Orange Dividers */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'clamp(1rem, 2vw, 1.75rem)',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(225, 229, 201, 0.9)',
            }}>
              {/* Stat 1 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 101, 0, 0.12)',
                  color: 'var(--primary-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Rocket size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.1 }}>
                    150+
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Projects Delivered
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '36px', background: 'rgba(255, 101, 0, 0.35)' }} className="hidden-mobile" />

              {/* Stat 2 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 101, 0, 0.12)',
                  color: 'var(--primary-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.1 }}>
                    50+
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Happy Clients
                  </div>
                </div>
              </div>

              {/* Vertical Divider */}
              <div style={{ width: '1px', height: '36px', background: 'rgba(255, 101, 0, 0.35)' }} className="hidden-mobile" />

              {/* Stat 3 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'rgba(255, 101, 0, 0.12)',
                  color: 'var(--primary-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.1 }}>
                    5+
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Years Experience
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right-Side Circular Services Infographic Wheel */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <HeroServicesWheel />
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL FEATURE STRIP */}
      <section style={{ background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', padding: '2rem clamp(1rem, 3.5vw, 3rem)', width: '100%' }}>
        <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
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
      <section id="services" style={{ padding: '3.25rem clamp(1rem, 3.5vw, 3rem) 3rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
        <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              How We Can Help Your Business
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              We build custom software, AI automations, and growth systems that help brands launch faster, sell smarter, and scale with measurable results.
            </p>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
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
      <section id="ready-made-stores" style={{ padding: '3.25rem clamp(1rem, 3.5vw, 3rem) 3rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
        <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              Buy A Store, Skip The Queue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
              Pre-built, production-ready websites and platforms you can launch in days. We deploy it on your domain and hosting, or hand over the complete code.
            </p>

            {/* Category Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
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
            gap: '1.5rem',
            marginBottom: '2.5rem'
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
      <section id="modules" style={{ padding: '3.25rem clamp(1rem, 3.5vw, 3rem) 3rem', background: 'var(--bg-app)', width: '100%' }}>
        <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              Core Business Modules
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
              Built specifically for modern enterprise operations with database-backed integrity.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
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
      <section id="security" style={{ padding: '3.25rem clamp(1rem, 3.5vw, 3rem) 3rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)', width: '100%' }}>
        <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
            Enterprise Reliability & Zero-Trust Access
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            The platform enforces 8 granular roles directly at the backend API layer. Clients see only approved milestones; staff cannot read unpermitted payroll records; and financial ledgers stay balanced.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem', textAlign: 'left' }}>
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
        padding: '3.5rem clamp(1rem, 3.5vw, 3rem)',
        background: 'linear-gradient(135deg, #111111 0%, #FF5A00 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        width: '100%',
      }}>
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
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

      {/* 8. FOOTER WITH MARQUEE SERVICES SLIDER */}
      <PublicFooter />
    </div>
  );
};
