import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, ArrowRight, CheckCircle2, Check, Sparkles, Layers,
  Code2, Smartphone, Bot, MessageSquare, PhoneCall, GraduationCap,
  FolderKanban, Share2, UserCheck, Search, Flame
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_SERVICES } from '../data/websiteContent';

export const ServicesPublicPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Engineering', 'AI & Automation', 'Platforms', 'Growth & Marketing'];

  const filteredServices = selectedCategory === 'All'
    ? I2S_SERVICES
    : I2S_SERVICES.filter(s => s.category === selectedCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.5rem 2rem 2.75rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="public-hero-title" style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.2rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            How We Can Help Your Business Scale
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.5rem'
          }}>
            We build software, AI automations, and growth systems that help brands launch faster, sell smarter, and scale with measurable results.
          </p>

          {/* Interactive Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '9999px',
                    fontSize: '0.88rem',
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
      </section>

      {/* Services Grid with Detailed Specifications */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-app)', flex: 1 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '2rem'
          }}>
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="ref-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FFFFFF',
                }}
              >
                {/* Header with thumbnail image & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      border: '1px solid var(--border-color)',
                      flexShrink: 0
                    }}
                    loading="lazy"
                  />
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--primary-orange)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em'
                    }}>
                      {service.category}
                    </span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.2 }}>
                      {service.title}
                    </h2>
                  </div>
                </div>

                {/* Short & Detailed Description */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {service.description}
                </p>

                {/* Feature Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.25rem' }}>
                  {service.featureTags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        padding: '0.25rem 0.6rem',
                        background: '#F3F4F6',
                        color: '#1F2937',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Verified Capabilities Bullet Points */}
                <div style={{
                  marginBottom: '1.5rem',
                  background: 'var(--bg-app)',
                  padding: '1.1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  flex: 1
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark-navy)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                    Core Deliverables & Capabilities
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {service.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                        <Check size={14} color="var(--primary-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Link */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Tailored Proposal
                  </span>
                  <Link
                    to={`/contact?service=${encodeURIComponent(service.title)}`}
                    className="btn-primary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none'
                    }}
                  >
                    Start Project <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Link Callout to Ready-Made Stores */}
      <section style={{ padding: '4rem 2rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
            Looking for a Pre-Built Solution Instead?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Browse our turn-key ready-made stores and platforms. Skip the development queue and launch live in days.
          </p>
          <Link
            to="/store"
            className="btn-secondary"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.92rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
          >
            Explore Ready-Made Stores <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
