import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Award,
  Users, TrendingUp, Cpu, Rocket, Check
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_COMPANY_INFO } from '../data/websiteContent';

export const AboutPage = () => {
  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero / Introduction */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.5rem 2rem 3rem',
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
            We Turn Imagination Into Powerful Software
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.5rem'
          }}>
            {I2S_COMPANY_INFO.subheading}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/contact" className="btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none' }}>
              Start a Project <ArrowRight size={16} />
            </Link>
            <Link to="/services" className="btn-secondary" style={{ padding: '0.85rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none' }}>
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Stats Bar */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '2.5rem 2rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem',
          textAlign: 'center'
        }}>
          {I2S_COMPANY_INFO.stats.map((stat, idx) => (
            <div key={idx} style={{ padding: '1rem', borderRight: idx !== 3 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ fontSize: '2.75rem', fontWeight: 900, fontFamily: 'var(--font-heading)', color: 'var(--primary-orange)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.45rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Positioning Statement */}
      <section style={{ padding: '3rem 2rem', background: 'var(--bg-app)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '2.4rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--dark-navy)',
            lineHeight: 1.35,
            marginBottom: '1.5rem'
          }}>
            {I2S_COMPANY_INFO.mission}
          </h2>
          <div style={{ width: '60px', height: '3px', background: 'var(--primary-orange)', margin: '0 auto' }} />
        </div>
      </section>

      {/* Pillars / Achievements */}
      <section style={{ padding: '3.25rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              A Little About Our Track Record
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto' }}>
              Proven outcomes across high-growth startups, scale-ups, and global enterprises.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {I2S_COMPANY_INFO.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="ref-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FFFFFF'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'var(--primary-light)',
                  color: 'var(--primary-orange)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem'
                }}>
                  {idx === 0 ? <Award size={22} /> : idx === 1 ? <Users size={22} /> : <TrendingUp size={22} />}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem', lineHeight: 1.25 }}>
                  {pillar.badge}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.65, flex: 1 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Working Philosophy: BUILD · AUTOMATE · BRAND · SCALE */}
      <section style={{ padding: '3.25rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.75rem' }}>
              We Build Products That Scale
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              At I2S, we specialise in building software and AI solutions that don't just look good, they perform. By blending technical excellence with creative strategy, we help businesses break through and grow.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {I2S_COMPANY_INFO.approach.map((item, idx) => (
              <div
                key={idx}
                className="ref-card"
                style={{
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#FFFFFF'
                }}
              >
                <div>
                  <span style={{
                    padding: '0.3rem 0.75rem',
                    background: 'var(--dark-navy)',
                    color: '#FFFFFF',
                    borderRadius: '999px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em'
                  }}>
                    {item.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', marginTop: '0.25rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Client Roster */}
      <section style={{ padding: '3rem 2rem', background: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '1.25rem' }}>
            Selected Clients & Ecosystem Partners
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            {I2S_COMPANY_INFO.featuredClients.map((c, idx) => (
              <a
                key={idx}
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  letterSpacing: '0.04em',
                  transition: 'color var(--transition-fast)'
                }}
              >
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{
        padding: '3.5rem 2rem',
        background: 'linear-gradient(135deg, #111111 0%, #FF5A00 100%)',
        color: '#FFFFFF',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '1rem' }}>
            Let's Build Something Great Together
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#FFE4D6', marginBottom: '2rem', lineHeight: 1.6 }}>
            Ready to build high-performance software, automate operations with AI, or launch a dedicated growth system?
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
