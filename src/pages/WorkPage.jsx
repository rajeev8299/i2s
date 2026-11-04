import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, ArrowRight, ExternalLink, TrendingUp, CheckCircle2,
  Users, Eye, Award, Sparkles, Smartphone, Globe
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_WORK_ITEMS, I2S_TESTIMONIALS, I2S_COMPANY_INFO } from '../data/websiteContent';

export const WorkPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Growth & Talent', 'Personal Branding', 'Software Engineering', 'Social Marketing', 'Influencer Campaigns', 'Performance Ads'];

  const filteredItems = selectedCategory === 'All'
    ? I2S_WORK_ITEMS
    : I2S_WORK_ITEMS.filter(w => w.category === selectedCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '5rem 2rem 3.5rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
            marginBottom: '1.25rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '0 2px 6px rgba(255, 90, 0, 0.08)'
          }}>
            <Briefcase size={14} /> Featured Client Case Studies & Deliverables
          </div>

          <h1 className="public-hero-title" style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.2rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            Our Selected Projects
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.5rem'
          }}>
            A look at the digital platforms, mobile apps, creator operations, and personal brands we've built, optimized, and scaled.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1.15rem',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  border: selectedCategory === cat ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                  background: selectedCategory === cat ? 'var(--primary-orange)' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-secondary)',
                  boxShadow: selectedCategory === cat ? '0 2px 8px rgba(255, 90, 0, 0.25)' : 'none'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Cards Grid */}
      <section style={{ padding: '5rem 2rem', background: 'var(--bg-app)', flex: 1 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '2.5rem'
          }}>
            {filteredItems.map((item) => (
              <article
                key={item.num}
                className="ref-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FFFFFF',
                }}
              >
                {/* Visual Thumbnail */}
                <div style={{ position: 'relative', height: '220px', overflow: 'hidden', background: '#111111' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                    loading="lazy"
                  />
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      background: 'var(--primary-orange)',
                      color: '#FFFFFF',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-heading)'
                    }}>
                      {item.num}.
                    </span>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      background: 'rgba(17, 17, 17, 0.82)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Content Container */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2 style={{
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    color: 'var(--dark-navy)',
                    lineHeight: 1.2,
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {item.title}
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                    {item.summary}
                  </p>

                  {/* Verified Stats Row */}
                  <div style={{
                    marginTop: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    padding: '1.1rem 0.75rem',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    textAlign: 'center',
                    marginBottom: '1.5rem'
                  }}>
                    {item.stats.map((st, sIdx) => (
                      <div key={sIdx}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--primary-orange)', lineHeight: 1.1 }}>
                          {st.value}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.25rem', letterSpacing: '0.04em' }}>
                          {st.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Custom Architecture
                    </span>
                    <Link
                      to="/contact"
                      className="btn-outline"
                      style={{
                        padding: '0.45rem 0.95rem',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        textDecoration: 'none'
                      }}
                    >
                      Build Similar <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Verified Client Testimonials */}
      <section style={{ padding: '5.5rem 2rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: '0.5rem' }}>
              [ CLIENT REVIEWS ]
            </span>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              See Why Our Clients Partner With Us
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Verifiable feedback from founders, product heads, and growth leaders who trust I2S.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem' }}>
            {I2S_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="ref-card"
                style={{
                  padding: '2rem',
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <p style={{
                  fontSize: '1.05rem',
                  fontStyle: 'italic',
                  color: 'var(--dark-navy)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  fontWeight: 500
                }}>
                  "{t.quote}"
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <img
                    src={t.avatar}
                    alt={t.author}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--dark-navy)' }}>
                      {t.author}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '5rem 2rem',
        background: 'linear-gradient(135deg, #111111 0%, #FF5A00 100%)',
        color: '#FFFFFF',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem' }}>
            Ready to Build Your Next Flagship Product?
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#FFE4D6', marginBottom: '2rem', lineHeight: 1.6 }}>
            Tell us about your project requirements. We respond with a roadmap and proposal within 24 hours.
          </p>
          <Link
            to="/contact"
            className="btn-primary"
            style={{
              background: '#FFFFFF',
              color: 'var(--primary-orange)',
              padding: '0.9rem 2.2rem',
              fontSize: '1rem',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            Start a Project <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
