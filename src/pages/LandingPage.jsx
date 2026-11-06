import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, Star, CheckCircle2, Play, ChevronLeft, ChevronRight,
  Sparkles, Zap, Shield, TrendingUp, Users, CheckSquare, BarChart3, Clock,
  Cpu, Award, MessageSquare, Terminal, Eye, Code2, Rocket
} from 'lucide-react';
import { RedesignedNavbar } from '../components/redesign/RedesignedNavbar';
import { RedesignedFooter } from '../components/redesign/RedesignedFooter';
import { VideoCarouselSection } from '../components/VideoCarouselSection';
import { I2S_COMPANY_INFO } from '../data/websiteContent';

export const LandingPage = () => {
  // Testimonial Carousel state
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Pricing switch state
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  // Testimonials data
  const testimonials = [
    {
      name: 'Amit Sharma',
      role: 'Founder & CEO, TechMatrix',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: 'I2S completely transformed our digital presence. The custom web platform and automated WhatsApp workflows scaled our inbound leads by 320% within 4 months.',
      tag: 'Scale & Growth',
    },
    {
      name: 'Priya Singh',
      role: 'VP Product, Apex Commerce',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
      text: 'Their engineering team is world-class. From strict double-entry ledger bookkeeping to pixel-perfect reactive dashboards, delivery was on time with zero bugs.',
      tag: 'Enterprise Engineering',
    },
    {
      name: 'Rahul Verma',
      role: 'Director, HealthCare Global',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      text: 'The AI chatbots and booking appointment platform engineered by I2S reduced our front-desk customer support workload by 65% while handling thousands of active bookings.',
      tag: 'AI Automations',
    },
  ];

  // Verified Pricing Plans
  const pricingPlans = [
    {
      name: 'STARTER LAUNCH',
      priceINR: '19,999',
      priceMonthly: '19,999',
      priceYearly: '15,999',
      desc: 'Ideal for emerging startups & service brands needing high-impact market entry.',
      highlight: false,
      features: [
        'Single-page conversion funnel or 5-page site',
        'Mobile responsive & fluid layout',
        'WhatsApp & Lead Capture integration',
        'Speed optimization (< 1.2s load)',
        'Basic SEO meta tags & sitemap',
        'Free hosting setup on your domain',
      ],
      cta: 'Choose Starter',
    },
    {
      name: 'GROWTH SCALE',
      priceINR: '49,999',
      priceMonthly: '49,999',
      priceYearly: '39,999',
      desc: 'Our most popular tier for businesses scaling operations and automating workflows.',
      highlight: true,
      badge: 'RECOMMENDED',
      features: [
        'Full custom web app or SaaS dashboard',
        'AI chatbot & Automated WhatsApp CRM',
        'Payment gateway integration (Razorpay/Stripe)',
        'Role-based access control (Admin/Staff/Client)',
        'Double-entry invoicing & receipts',
        'Priority 24/7 technical support & SLA',
      ],
      cta: 'Scale With Growth',
    },
    {
      name: 'ENTERPRISE BESPOKE',
      priceINR: '99,999',
      priceMonthly: '99,999',
      priceYearly: '79,999',
      desc: 'Full-spectrum dedicated engineering, custom AI architectures & high-volume systems.',
      highlight: false,
      features: [
        'End-to-end multi-tenant enterprise system',
        'Custom AI voice agent & LLM fine-tuning',
        'Complex PostgreSQL database design & replication',
        'Native iOS & Android mobile application',
        'Dedicated engineering team & project lead',
        'Custom SLA, NDA & complete source code handover',
      ],
      cta: 'Consult Enterprise',
    },
  ];

  return (
    <div className="i2s-dark-theme">
      {/* 01. NAVBAR */}
      <RedesignedNavbar />

      {/* 02. HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: 'clamp(3rem, 6vw, 6rem) clamp(1.25rem, 4vw, 3.5rem) 4rem',
          overflow: 'hidden',
        }}
      >
        {/* Subtle diagonal background glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '450px',
            background: 'radial-gradient(ellipse at center, rgba(255, 118, 40, 0.15) 0%, rgba(140, 255, 0, 0.05) 50%, transparent 70%)',
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1360px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Tagline Pill */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="floating-glass-pill">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#8CFF00',
                  boxShadow: '0 0 10px #8CFF00',
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                CREATIVE SOFTWARE & AI GROWTH AGENCY
              </span>
            </div>
          </div>

          {/* Large Centered Headline with White and Orange Typography */}
          <div style={{ textAlign: 'center', maxWidth: '960px', margin: '0 auto 2.5rem' }}>
            <h1
              className="font-heading"
              style={{
                fontSize: 'clamp(2.5rem, 5.8vw, 5.2rem)',
                fontWeight: 900,
                lineHeight: 1.08,
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                marginBottom: '1.25rem',
              }}
            >
              We Engineer <span style={{ color: '#FF7628' }}>Digital Systems</span> That Drive{' '}
              <span style={{ color: '#8CFF00' }}>Real Growth</span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(1rem, 1.3vw, 1.25rem)',
                color: '#A5A5A5',
                lineHeight: 1.6,
                maxWidth: '720px',
                margin: '0 auto',
              }}
            >
              Custom software, high-converting platforms, and AI automations built for bold businesses, high-growth startups, and visionary leaders.
            </p>
          </div>

          {/* Central Portrait & Floating Graphics Composition */}
          <div
            style={{
              position: 'relative',
              maxWidth: '880px',
              margin: '0 auto 4rem',
              borderRadius: '28px',
              overflow: 'hidden',
              background: 'linear-gradient(180deg, #161616 0%, #0B0B0B 100%)',
              border: '1px solid #292929',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 118, 40, 0.1)',
            }}
          >
            {/* Portrait Image */}
            <div style={{ position: 'relative', width: '100%', maxHeight: '520px', overflow: 'hidden' }}>
              <img
                src="/hero-portrait.jpg"
                alt="I2S Leadership & Engineering"
                style={{
                  width: '100%',
                  height: '520px',
                  objectFit: 'cover',
                  objectPosition: 'center 20%',
                }}
              />
              {/* Bottom Gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(5,5,5,0) 40%, rgba(5,5,5,0.95) 100%)',
                }}
              />
            </div>

            {/* Floating Neon-Green Rating Graphic (Top Left) */}
            <div
              className="floating-glass-pill"
              style={{
                position: 'absolute',
                top: '25px',
                left: '25px',
                padding: '0.65rem 1.2rem',
                border: '1px solid rgba(140, 255, 0, 0.3)',
              }}
            >
              <div style={{ display: 'flex', gap: '3px', color: '#FF7628' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#FF7628" />
                ))}
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF' }}>4.9/5 Rating</span>
            </div>

            {/* Floating Neon Green Circular Badge (Top Right) */}
            <div
              className="floating-neon-circle"
              style={{
                position: 'absolute',
                top: '25px',
                right: '25px',
                width: '60px',
                height: '60px',
              }}
            >
              <ArrowUpRight size={28} />
            </div>

            {/* Floating Stats Label (Bottom Left) */}
            <div
              className="floating-glass-pill"
              style={{
                position: 'absolute',
                bottom: '25px',
                left: '25px',
                border: '1px solid rgba(255, 118, 40, 0.3)',
              }}
            >
              <Sparkles size={18} color="#FF7628" />
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFFFFF' }}>$5M+ Revenue</div>
                <div style={{ fontSize: '0.7rem', color: '#A5A5A5' }}>Unlocked for global clients</div>
              </div>
            </div>

            {/* Floating Action Button (Bottom Right) */}
            <Link
              to="/contact"
              className="btn-i2s-primary"
              style={{
                position: 'absolute',
                bottom: '25px',
                right: '25px',
                padding: '0.75rem 1.4rem',
                borderRadius: '9999px',
              }}
            >
              <span>Explore Ecosystem</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Three Service Highlight Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                number: '01',
                title: 'High-Impact Engineering',
                desc: 'Tailored SaaS platforms, scalable web portals, and reactive mobile apps engineered for speed, clean UX, and zero tech debt.',
              },
              {
                number: '02',
                title: 'AI & WhatsApp Automation',
                desc: '24/7 autonomous support bots, lead capture journeys, and intelligent voice agents fine-tuned to convert visitors into clients.',
              },
              {
                number: '03',
                title: 'Corporate ERP & Ledger',
                desc: 'End-to-end operational visibility with balanced double-entry trial balance, payroll governance, and milestone delivery tracking.',
              },
            ].map((col) => (
              <div
                key={col.number}
                className="i2s-card"
                style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  style={{
                    fontSize: '1.75rem',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    color: '#FF7628',
                    marginBottom: '0.75rem',
                  }}
                >
                  {col.number}
                </div>
                <h3
                  className="font-heading"
                  style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}
                >
                  {col.title}
                </h3>
                <p style={{ color: '#A5A5A5', fontSize: '0.88rem', lineHeight: 1.6, flex: 1 }}>
                  {col.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03. ABOUT SECTION */}
      <section
        id="about"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          background: '#0B0B0B',
          borderTop: '1px solid #292929',
          borderBottom: '1px solid #292929',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center',
          }}
        >
          {/* Left Collage & Floating Profile Card */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: '100%',
                maxHeight: '480px',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid #292929',
              }}
            >
              <img
                src="/team-portrait-2.jpg"
                alt="I2S Team & Vision"
                style={{ width: '100%', height: '480px', objectFit: 'cover' }}
              />
            </div>

            {/* Overlapping Orange Profile Card */}
            <div
              className="i2s-card-orange"
              style={{
                position: 'absolute',
                bottom: '-25px',
                right: '-20px',
                padding: '1.5rem',
                maxWidth: '280px',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Rajeev Yadav & Team
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0.3rem 0' }}>
                5+ Years Excellence
              </div>
              <p style={{ fontSize: '0.8rem', opacity: 0.9, margin: 0 }}>
                Delivering reliable architectures for startups and global enterprises.
              </p>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#8CFF00',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <span style={{ width: '24px', height: '2px', background: '#8CFF00' }} /> ABOUT IMAGINATION 2 SOFTWARE
            </div>

            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}
            >
              Turning Bold Imaginations Into <span style={{ color: '#FF7628' }}>Scalable Digital Realities</span>
            </h2>

            <p style={{ color: '#A5A5A5', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
              I2S is a forward-thinking digital agency and software powerhouse. We bridge the gap between creative visual artistry and rock-solid software engineering. From automated business operations to scalable full-stack applications, we build products that convert users and stand the test of high-load traffic.
            </p>

            {/* Stats Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                padding: '1.5rem',
                background: '#111111',
                borderRadius: '16px',
                border: '1px solid #292929',
                marginBottom: '2rem',
              }}
            >
              {[
                { val: '300+', label: 'Projects Shipped' },
                { val: '120+', label: 'Global Clients' },
                { val: '99%', label: 'Retention Rate' },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    className="font-heading"
                    style={{ fontSize: '1.85rem', fontWeight: 900, color: '#8CFF00', lineHeight: 1 }}
                  >
                    {s.val}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#A5A5A5', marginTop: '0.4rem' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Link to="/about" className="btn-i2s-primary">
              <span>Discover Our Story</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 04. SERVICES SECTION & DIAGONAL MARQUEE */}
      <section id="services" style={{ padding: '6rem clamp(1.25rem, 4vw, 3.5rem) 4rem', position: 'relative' }}>
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          {/* Header with Huge Outlined Background Text */}
          <div style={{ position: 'relative', marginBottom: '3.5rem', textAlign: 'center' }}>
            <div
              className="text-outline-huge"
              style={{
                fontSize: 'clamp(3.5rem, 9vw, 9rem)',
                lineHeight: 0.8,
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1,
              }}
            >
              SERVICES
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#FF7628',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                WHAT WE DO BEST
              </div>
              <h2
                className="font-heading"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#FFFFFF' }}
              >
                End-to-End <span style={{ color: '#8CFF00' }}>Digital Solutions</span>
              </h2>
            </div>
          </div>

          {/* Asymmetric Service Cards Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.75rem',
              marginBottom: '4.5rem',
            }}
          >
            {[
              {
                num: '01',
                title: 'Full-Stack Web Development',
                tags: ['React.js', 'Next.js', 'PostgreSQL', 'Tailwind'],
                desc: 'Ultra-fast, responsive web applications, client portals, and administrative backends engineered with enterprise security.',
                link: '/services',
              },
              {
                num: '02',
                title: 'Mobile App Engineering',
                tags: ['iOS', 'Android', 'Flutter', 'Cross-Platform'],
                desc: 'Native performance mobile apps with smooth gestures, offline capability, and seamless cloud synchronization.',
                link: '/services',
              },
              {
                num: '03',
                title: 'AI Chatbots & Automated Voice',
                tags: ['Custom LLM', 'Voice AI', 'WhatsApp CRM', '24/7'],
                desc: 'Intelligent conversational systems trained on your company data to resolve customer queries and capture qualified leads.',
                link: '/services',
              },
              {
                num: '04',
                title: 'WhatsApp Business Automations',
                tags: ['Automated Reminders', 'Invoicing', 'Catalog'],
                desc: 'Complete messaging workflows that automate quotes, payment links, and order updates straight to user smartphones.',
                link: '/services',
              },
              {
                num: '05',
                title: 'E-Commerce & Ready Platforms',
                tags: ['Booking Systems', 'Food Delivery', 'LMS'],
                desc: 'Battle-tested turnkey platforms deployed rapidly to accelerate your time-to-market without starting from zero.',
                link: '/store',
              },
              {
                num: '06',
                title: 'Enterprise Accounting & PMS',
                tags: ['Trial Balance', 'GST Invoices', 'Role Security'],
                desc: 'Granular role-based portals (Super Admin, Accounts, HR, Client) ensuring complete data parity and compliance.',
                link: '/services',
              },
            ].map((svc) => (
              <div
                key={svc.num}
                className="i2s-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '280px',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: '#8CFF00',
                      }}
                    >
                      {svc.num}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {svc.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: '#1A1A1A',
                            color: '#A5A5A5',
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h3
                    className="font-heading"
                    style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}
                  >
                    {svc.title}
                  </h3>
                  <p style={{ color: '#A5A5A5', fontSize: '0.88rem', lineHeight: 1.6 }}>{svc.desc}</p>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <Link
                    to={svc.link}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#FF7628',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Learn More</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagonal Animated Marquee */}
        <div style={{ margin: '2rem -2rem 0' }}>
          <div className="marquee-container">
            <div className="marquee-content">
              <span>★ CUSTOM SOFTWARE DEVELOPMENT</span>
              <span>★ AI CHATBOTS & VOICE AGENTS</span>
              <span>★ WHATSAPP AUTOMATION</span>
              <span>★ NEXT.JS & REACT ARCHITECTURES</span>
              <span>★ CLOUD SCALABILITY</span>
              <span>★ 99% CLIENT SATISFACTION</span>
            </div>
            <div className="marquee-content" aria-hidden="true">
              <span>★ CUSTOM SOFTWARE DEVELOPMENT</span>
              <span>★ AI CHATBOTS & VOICE AGENTS</span>
              <span>★ WHATSAPP AUTOMATION</span>
              <span>★ NEXT.JS & REACT ARCHITECTURES</span>
              <span>★ CLOUD SCALABILITY</span>
              <span>★ 99% CLIENT SATISFACTION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 05. CASE STUDIES */}
      <section
        id="case-studies"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          background: '#0B0B0B',
          borderTop: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '3rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#8CFF00',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                REAL PROJECTS • MEASURABLE RESULTS
              </div>
              <h2
                className="font-heading"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: '#FFFFFF' }}
              >
                Featured <span style={{ color: '#FF7628' }}>Case Studies</span>
              </h2>
            </div>

            <Link to="/work" className="btn-circle-action" title="View all portfolio projects">
              <ArrowUpRight size={22} />
            </Link>
          </div>

          {/* Two-Column Image Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Enterprise Multi-Role Operations Suite',
                category: 'Full-Stack ERP & Ledger',
                metric: '+320% Workflow Velocity',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=720&q=80',
              },
              {
                title: 'Omnichannel AI Booking & Support Agent',
                category: 'AI & WhatsApp Automation',
                metric: '65% Support Overhead Saved',
                image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=720&q=80',
              },
            ].map((p, idx) => (
              <div
                key={idx}
                className="i2s-card"
                style={{ overflow: 'hidden', padding: 0 }}
              >
                <div style={{ position: 'relative', width: '100%', height: '320px', overflow: 'hidden' }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '15px',
                      right: '15px',
                      background: 'rgba(5, 5, 5, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '0.35rem 0.85rem',
                      borderRadius: '9999px',
                      border: '1px solid #8CFF00',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#8CFF00',
                    }}
                  >
                    {p.metric}
                  </div>
                </div>

                <div style={{ padding: '1.75rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#FF7628', fontWeight: 700, marginBottom: '0.35rem' }}>
                    {p.category}
                  </div>
                  <h3 className="font-heading" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {p.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 06. WORK PROCESS */}
      <section
        id="process"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          borderTop: '1px solid #292929',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#FF7628',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              HOW WE SHIP EXCELLENCE
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#FFFFFF' }}
            >
              Our 4-Step <span style={{ color: '#8CFF00' }}>Work Process</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                step: '01',
                title: 'Architecture & Discovery',
                desc: 'We map out your operational bottlenecks, business objectives, database schemas, and UX user journeys.',
              },
              {
                step: '02',
                title: 'Iterative Rapid Prototyping',
                desc: 'Interactive Figma design systems and live staging links ensure alignment before full-scale coding begins.',
              },
              {
                step: '03',
                title: 'Engineering & AI Synthesis',
                desc: 'Rigorous clean-code implementation with automated testing, CI/CD pipelines, and zero security loopholes.',
              },
              {
                step: '04',
                title: 'Deployment & SLA Scale',
                desc: 'Go-live launch with CDN caching, cloud monitoring, analytics telemetry, and continuous improvement support.',
              },
            ].map((p) => (
              <div
                key={p.step}
                className="i2s-card"
                style={{ padding: '2rem 1.75rem', position: 'relative' }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#161616',
                    border: '1px solid #8CFF00',
                    color: '#8CFF00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 900,
                    fontSize: '1.1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  {p.step}
                </div>
                <h3 className="font-heading" style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                  {p.title}
                </h3>
                <p style={{ color: '#A5A5A5', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 07. WHY CHOOSE I2S */}
      <section
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          background: '#0B0B0B',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '4rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#8CFF00',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                }}
              >
                THE I2S ADVANTAGE
              </div>
              <h2
                className="font-heading"
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  lineHeight: 1.15,
                  marginBottom: '1.5rem',
                }}
              >
                Why Ambitious Leaders <span style={{ color: '#FF7628' }}>Choose I2S</span>
              </h2>
              <p style={{ color: '#A5A5A5', fontSize: '0.98rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                We don’t just deliver static code. We engineer mission-critical business assets that streamline internal workflows, maximize operational efficiency, and generate predictable top-line revenue.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  'Direct communication with senior architects (no middle-man telephone game)',
                  'Full intellectual property & codebase ownership upon milestone signoff',
                  'Enterprise-grade security standards (RBAC, SQL sanitization, encrypted auth)',
                  'Post-launch SLA support guarantee with sub-24hr rapid ticket turnaround',
                ].map((point, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={18} color="#8CFF00" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.92rem', color: '#E2E8F0', fontWeight: 500 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {[
                { icon: Rocket, title: 'Speed to Market', text: 'Launch MVPs in 3-4 weeks instead of endless months.' },
                { icon: Shield, title: 'Zero Tech Debt', text: 'Strict modular architecture prepared for 10x traffic bursts.' },
                { icon: Cpu, title: 'AI Automation', text: 'Cut repetitive manual labor by up to 70% with autonomous agents.' },
                { icon: Award, title: 'Proven ROI', text: 'Every rupee invested mapped to tangible business KPI milestones.' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="i2s-card"
                  style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(255, 118, 40, 0.12)',
                      color: '#FF7628',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <card.icon size={22} />
                  </div>
                  <h4 className="font-heading" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.35rem' }}>
                    {card.title}
                  </h4>
                  <p style={{ color: '#A5A5A5', fontSize: '0.82rem', lineHeight: 1.5, margin: 0 }}>
                    {card.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 08. PRICING PLANS */}
      <section
        id="pricing"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#FF7628',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              TRANSPARENT VALUE
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#FFFFFF' }}
            >
              Fixed Pricing Plans <span style={{ color: '#8CFF00' }}>No Surprises</span>
            </h2>
          </div>

          {/* Pricing Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
              gap: '2rem',
              alignItems: 'stretch',
            }}
          >
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={plan.highlight ? 'i2s-card-orange' : 'i2s-card'}
                style={{
                  padding: '2.5rem 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transform: plan.highlight ? 'scale(1.03)' : 'none',
                  zIndex: plan.highlight ? 5 : 1,
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#8CFF00',
                      color: '#000000',
                      padding: '0.3rem 0.95rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      letterSpacing: '0.05em',
                      boxShadow: '0 4px 15px rgba(140, 255, 0, 0.4)',
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    color: plan.highlight ? '#FFFFFF' : '#FF7628',
                    letterSpacing: '0.06em',
                    marginBottom: '0.5rem',
                  }}
                >
                  {plan.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: plan.highlight ? '#FFFFFF' : '#8CFF00' }}>₹</span>
                  <span
                    className="font-heading"
                    style={{ fontSize: '3rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1 }}
                  >
                    {plan.priceINR}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: plan.highlight ? '#FFE4D6' : '#A5A5A5' }}>/ project</span>
                </div>

                <p
                  style={{
                    fontSize: '0.88rem',
                    color: plan.highlight ? '#FFE4D6' : '#A5A5A5',
                    lineHeight: 1.5,
                    marginBottom: '1.75rem',
                  }}
                >
                  {plan.desc}
                </p>

                <div style={{ height: '1px', background: plan.highlight ? 'rgba(255,255,255,0.2)' : '#292929', marginBottom: '1.75rem' }} />

                {/* Features List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1, marginBottom: '2rem' }}>
                  {plan.features.map((feat) => (
                    <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <CheckCircle2
                        size={17}
                        color={plan.highlight ? '#FFFFFF' : '#8CFF00'}
                        style={{ flexShrink: 0, marginTop: '2px' }}
                      />
                      <span
                        style={{
                          fontSize: '0.88rem',
                          color: plan.highlight ? '#FFFFFF' : '#E2E8F0',
                          lineHeight: 1.4,
                        }}
                      >
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className={plan.highlight ? 'btn-i2s-outline' : 'btn-i2s-primary'}
                  style={{
                    width: '100%',
                    background: plan.highlight ? '#FFFFFF' : undefined,
                    color: plan.highlight ? '#FF7628' : undefined,
                    border: plan.highlight ? 'none' : undefined,
                  }}
                >
                  <span>{plan.cta}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 09. FEATURED HIGHLIGHTS & 3D METALLIC OBJECTS */}
      <section
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          background: '#0B0B0B',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              className="i2s-card"
              style={{
                padding: '2.5rem',
                background: 'linear-gradient(135deg, #161616 0%, #111111 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#FF7628', marginBottom: '0.5rem' }}>
                  CUTTING-EDGE STACK
                </div>
                <h3 className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
                  Modern Full-Stack Architecture
                </h3>
                <p style={{ color: '#A5A5A5', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Built on React 18, Vite, Node.js, and Prisma ORM backed by PostgreSQL. Zero bloated templates, microsecond execution, and full TypeScript safety across the entire API layer.
                </p>
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['React', 'Node.js', 'PostgreSQL', 'Express', 'Prisma', 'Tailwind'].map((tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: '0.4rem 0.85rem',
                      background: '#1A1A1A',
                      border: '1px solid #292929',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="i2s-card"
              style={{
                padding: '2.5rem',
                background: 'linear-gradient(135deg, #1A1A1A 0%, #0B0B0B 100%)',
                border: '1px solid rgba(140, 255, 0, 0.25)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8CFF00', marginBottom: '0.5rem' }}>
                AI-FIRST TRANSFORMATION
              </div>
              <h3 className="font-heading" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1rem' }}>
                Autonomous Intelligence Layer
              </h3>
              <p style={{ color: '#A5A5A5', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                Automate customer intake, booking verification, and order processing without human bottlenecks. Our integrations plug directly into your CRM, database, and messaging channels.
              </p>
              <Link to="/services" className="btn-i2s-outline" style={{ borderColor: '#8CFF00', color: '#8CFF00' }}>
                <span>Inspect AI Workflows</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. TESTIMONIALS WITH WORKING CAROUSEL */}
      <section
        id="testimonials"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '3.5rem',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  color: '#8CFF00',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                PROVEN TRACK RECORD
              </div>
              <h2
                className="font-heading"
                style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, color: '#FFFFFF' }}
              >
                What Our Clients <span style={{ color: '#FF7628' }}>Say About Us</span>
              </h2>
            </div>

            {/* Carousel Controls */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonialIdx((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                }
                className="carousel-nav-btn"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#161616',
                  border: '1px solid #292929',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonialIdx((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
                }
                className="carousel-nav-btn"
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#161616',
                  border: '1px solid #292929',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {testimonials.map((t, idx) => {
              const isSelected = idx === activeTestimonialIdx;
              return (
                <div
                  key={t.name}
                  className="i2s-card"
                  style={{
                    padding: '2.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isSelected ? '1px solid #FF7628' : '1px solid #292929',
                    boxShadow: isSelected ? '0 10px 30px rgba(255, 118, 40, 0.15)' : undefined,
                  }}
                >
                  <div>
                    {/* Stars & Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '3px', color: '#FF7628' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={15} fill="#FF7628" />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: '#8CFF00',
                          background: 'rgba(140, 255, 0, 0.1)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                        }}
                      >
                        {t.tag}
                      </span>
                    </div>

                    <p style={{ color: '#E2E8F0', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '1.75rem' }}>
                      "{t.text}"
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={t.avatar}
                      alt={t.name}
                      style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#FFFFFF' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#A5A5A5' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. BLOG SECTION */}
      <section
        id="blog"
        style={{
          padding: '6rem clamp(1.25rem, 4vw, 3.5rem)',
          background: '#0B0B0B',
          borderBottom: '1px solid #292929',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: '#FF7628',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              GROWTH DIGEST
            </div>
            <h2
              className="font-heading"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)', fontWeight: 800, color: '#FFFFFF' }}
            >
              Latest Insights & <span style={{ color: '#8CFF00' }}>Engineering Articles</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                title: 'Building Zero-Lag AI Chatbots on WhatsApp & Web',
                category: 'AI & Automation',
                date: 'November 2026',
                desc: 'How we engineered an asynchronous LLM pipeline that cuts response latency down to under 800 milliseconds for high-volume lead pipelines.',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=720&q=80',
              },
              {
                title: 'Double-Entry Accounting & Ledger Parity in PostgreSQL',
                category: 'Architecture',
                date: 'October 2026',
                desc: 'A complete architectural walkthrough on maintaining debit/credit balance, immutable audit trails, and automatic invoice reconciliations.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=720&q=80',
              },
            ].map((b, idx) => (
              <div
                key={idx}
                className="i2s-card"
                style={{ overflow: 'hidden', padding: 0 }}
              >
                <div style={{ width: '100%', height: '260px', overflow: 'hidden' }}>
                  <img
                    src={b.image}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#8CFF00', fontWeight: 700, marginBottom: '0.4rem' }}>
                    <span>{b.category}</span>
                    <span>•</span>
                    <span style={{ color: '#A5A5A5' }}>{b.date}</span>
                  </div>
                  <h3 className="font-heading" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                    {b.title}
                  </h3>
                  <p style={{ color: '#A5A5A5', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {b.desc}
                  </p>
                  <Link
                    to="/blog"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: '#FF7628',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <span>Read Full Article</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. CONSULTATION CTA BANNER */}
      <section style={{ padding: '4rem clamp(1.25rem, 4vw, 3.5rem)' }}>
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            borderRadius: '28px',
            background: 'linear-gradient(135deg, #FF7628 0%, #D8560F 100%)',
            padding: '4rem 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(255, 118, 40, 0.4)',
          }}
        >
          {/* Subtle floating glow */}
          <div
            style={{
              position: 'absolute',
              top: '-50%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '600px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '780px', margin: '0 auto' }}>
            <h2
              className="font-heading"
              style={{
                fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.1,
                marginBottom: '1.25rem',
              }}
            >
              Ready to Build Your High-Growth Digital Architecture?
            </h2>

            <p style={{ fontSize: '1.1rem', color: '#FFE4D6', lineHeight: 1.6, marginBottom: '2.25rem' }}>
              Let’s design, code, and deploy custom software and AI automations that transform your business operations and scale client revenue.
            </p>

            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                background: '#050505',
                color: '#FFFFFF',
                padding: '1rem 2.5rem',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Schedule Free Strategy Call</span>
              <ArrowUpRight size={18} color="#8CFF00" />
            </Link>
          </div>
        </div>
      </section>

      {/* WATCH & LEARN VIDEO GUIDANCE SECTION */}
      <VideoCarouselSection />

      {/* 13. FOOTER */}
      <RedesignedFooter />
    </div>
  );
};

export default LandingPage;
