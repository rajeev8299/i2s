import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ArrowRight, Sparkles, Clock, Search,
  CheckCircle2, Bell, ExternalLink
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_BLOG_STATUS } from '../data/websiteContent';

export const BlogPage = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '5.5rem 2rem 4rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
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
            <Sparkles size={14} /> [ {I2S_BLOG_STATUS.kicker} ]
          </div>

          <h1 style={{
            fontSize: '3.4rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            {I2S_BLOG_STATUS.heading}
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            {I2S_BLOG_STATUS.subtitle}
          </p>
        </div>
      </section>

      {/* Main Body: Factual Publication State from Reference Source */}
      <section style={{ padding: '6rem 2rem', background: 'var(--bg-app)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          maxWidth: '680px',
          width: '100%',
          textAlign: 'center',
          padding: '3.5rem 2.5rem',
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Centered Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <BookOpen size={36} color="var(--primary-orange)" />
          </div>

          <h2 style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--dark-navy)',
            marginBottom: '0.75rem',
            fontFamily: 'var(--font-heading)'
          }}>
            {I2S_BLOG_STATUS.statusMessage}
          </h2>

          <p style={{
            fontSize: '1rem',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            marginBottom: '2rem',
            maxWidth: '460px',
            margin: '0 auto 2rem'
          }}>
            {I2S_BLOG_STATUS.statusDescription}
          </p>

          {/* Source Verification Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.95rem',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginBottom: '2.5rem'
          }}>
            <CheckCircle2 size={14} color="#10B981" />
            <span>Verified with live reference: <a href={I2S_BLOG_STATUS.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-orange)', fontWeight: 600 }}>thei2s.com/blog</a></span>
          </div>

          {/* Subscribe for Upcoming Articles */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
              Want to be notified when our first issue drops?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Get our engineering deep dives, AI automation playbooks, and growth breakdowns straight to your inbox.
            </p>

            {subscribed ? (
              <div style={{ padding: '0.85rem 1.25rem', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)', color: '#065F46', fontSize: '0.9rem', fontWeight: 600 }}>
                Thank you! You're on the early-access list for new I2S insights.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', maxWidth: '420px', margin: '0 auto', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '0.65rem 1rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#FFFFFF'
                  }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem', cursor: 'pointer' }}
                >
                  Notify Me
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '4.5rem 2rem',
        background: 'var(--dark-navy)',
        color: '#FFFFFF',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to Build Something?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#94A3B8', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Strategy, software, and growth systems — all under one roof.
          </p>
          <Link
            to="/contact"
            className="btn-primary"
            style={{
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 800,
              textDecoration: 'none'
            }}
          >
            Start a Project <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
