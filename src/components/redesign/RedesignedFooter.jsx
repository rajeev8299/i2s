import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Mail, Phone, MapPin, Globe,
  Share2, MessageCircle, Heart, Shield
} from 'lucide-react';
import { I2S_COMPANY_INFO } from '../../data/websiteContent';

export const RedesignedFooter = () => {
  return (
    <footer
      style={{
        background: '#0B0B0B',
        borderTop: '1px solid #292929',
        padding: '5rem clamp(1.25rem, 4vw, 3.5rem) 2rem',
        color: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '250px',
          background: 'radial-gradient(ellipse at bottom, rgba(255, 118, 40, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '3rem',
            marginBottom: '4rem',
          }}
        >
          {/* Column 1: Brand & Bio */}
          <div>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                textDecoration: 'none',
                marginBottom: '1.25rem',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#161616',
                  border: '1px solid rgba(255, 118, 40, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img src="/i2s-logo.webp" alt="I2S" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              </div>
              <span className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                I2S <span style={{ color: '#FF7628' }}>.</span>
              </span>
            </Link>

            <p style={{ color: '#A5A5A5', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '320px', marginBottom: '1.5rem' }}>
              We design & build custom high-growth digital systems, high-converting platforms, and AI automations that help bold brands dominate their markets.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <a
                href={I2S_COMPANY_INFO.socials.instagram}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#161616',
                  border: '1px solid #292929',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF7628';
                  e.currentTarget.style.color = '#FF7628';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#292929';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                <Share2 size={17} />
              </a>

              <a
                href={I2S_COMPANY_INFO.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#161616',
                  border: '1px solid #292929',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FF7628';
                  e.currentTarget.style.color = '#FF7628';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#292929';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                <Globe size={17} />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div>
            <h4 className="font-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'About Our Story', path: '/about' },
                { label: 'Case Studies', path: '/work' },
                { label: 'Services Catalog', path: '/services' },
                { label: 'Store & Solutions', path: '/store' },
                { label: 'Growth Insights & Blog', path: '/blog' },
                { label: 'Frequently Asked Questions', path: '/faq' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    style={{
                      color: '#A5A5A5',
                      fontSize: '0.88rem',
                      textDecoration: 'none',
                      transition: 'color 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7628')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#A5A5A5')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Expertise
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                'Full-Stack Web Development',
                'Mobile Application Engineering',
                'AI Chatbots & Automated Voice Agents',
                'WhatsApp Workflow Automation',
                'High-Converting SaaS Dashboards',
                'Enterprise Double-Entry Accounting',
              ].map((item) => (
                <li key={item} style={{ color: '#A5A5A5', fontSize: '0.88rem' }}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div>
            <h4 className="font-heading" style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem' }}>
              Stay Updated
            </h4>
            <p style={{ color: '#A5A5A5', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Receive our monthly engineering teardown, AI templates, and growth strategies directly to your inbox.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for subscribing to I2S Growth Digest!');
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
            >
              <input
                type="email"
                required
                placeholder="Enter your corporate email..."
                style={{
                  background: '#161616',
                  border: '1px solid #292929',
                  borderRadius: '8px',
                  padding: '0.65rem 0.95rem',
                  fontSize: '0.85rem',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                className="btn-i2s-primary"
                style={{
                  padding: '0.65rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  width: '100%',
                }}
              >
                <span>Subscribe to Newsletter</span>
                <ArrowUpRight size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.82rem',
            color: '#6E6E6E',
          }}
        >
          <div>
            © {new Date().getFullYear()} Imagination2Software (I2S). All rights reserved.
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#8CFF00', textDecoration: 'none', fontWeight: 600 }}>
              Corporate Portal Login →
            </Link>
            <Link to="/faq" style={{ color: '#6E6E6E', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
            <Link to="/faq" style={{ color: '#6E6E6E', textDecoration: 'none' }}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default RedesignedFooter;
