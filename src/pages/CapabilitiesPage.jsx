import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2, Smartphone, Bot, MessageSquare, PhoneCall, GraduationCap,
  FolderKanban, Share2, Sparkles, ShoppingBag, Cloud, ShieldCheck,
  ArrowRight, Check, Zap, Layers, Server, Search, Palette, Cpu
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';

export const I2S_EXTENDED_CAPABILITIES = [
  {
    id: 'web-development',
    title: 'Web Development',
    category: 'Engineering',
    icon: Code2,
    tag: 'Web & SaaS',
    description: 'High-performance websites, custom SaaS platforms, enterprise client portals, and conversion-focused web architectures.',
    features: [
      'Full-stack React, Next.js, and Node.js solutions',
      'Database-backed portals & secure authenticated workspaces',
      'Ultra-fast Core Web Vitals and SEO optimization',
      'REST & GraphQL API design with PostgreSQL backing'
    ]
  },
  {
    id: 'custom-software',
    title: 'Custom Software Development',
    category: 'Engineering',
    icon: Cpu,
    tag: 'Enterprise Architecture',
    description: 'Tailor-made software systems designed specifically to match unique business workflows and enterprise scale.',
    features: [
      'Custom ERP & operational business engines',
      'Microservices and scalable backend infrastructure',
      'Role-based granular access control (RBAC)',
      'Legacy migration and modernization'
    ]
  },
  {
    id: 'business-automation',
    title: 'Business Automation',
    category: 'Automation',
    icon: Zap,
    tag: 'Workflows & Efficiency',
    description: 'Streamline repetitive administrative and operational tasks with end-to-end event-driven automated workflows.',
    features: [
      'Multi-app workflow integrations and webhook triggers',
      'Automated invoice generation and payment receipts',
      'Automated customer onboarding sequences',
      'Error alerting and automated audit logs'
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI & Automation Solutions',
    category: 'AI & Automation',
    icon: Bot,
    tag: 'Generative AI',
    description: 'Smart AI assistants, conversational chatbots, WhatsApp bots, and autonomous calling agents trained on your business data.',
    features: [
      'Custom LLM training and knowledge-base retrieval',
      'WhatsApp Business Cloud API conversational journeys',
      'Natural voice AI calling agents for inbound & outbound leads',
      'Automated sentiment tracking and CRM lead routing'
    ]
  },
  {
    id: 'ecommerce-solutions',
    title: 'E-Commerce Solutions',
    category: 'Platforms',
    icon: ShoppingBag,
    tag: 'Turnkey Stores',
    description: 'High-converting online shopping platforms, turnkey ready-made stores, and custom checkout experiences.',
    features: [
      'Turnkey multi-category stores with instant deployment',
      'Integrated payment gateways (UPI, Cards, NetBanking)',
      'Real-time inventory and automated order notifications',
      'Seamless mobile-first browsing and checkout flow'
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    category: 'Growth',
    icon: Share2,
    tag: 'Campaign Execution',
    description: 'Strategic organic and paid multi-channel growth campaigns built to capture qualified customer demand.',
    features: [
      'Content systems, campaign calendars & creative execution',
      'Short-form video assets and multi-platform distribution',
      'Audience segmentation and high-conversion retargeting',
      'Attribution tracking and ROI growth analytics'
    ]
  },
  {
    id: 'seo-growth',
    title: 'SEO & Growth Systems',
    category: 'Growth',
    icon: Search,
    tag: 'Search Authority',
    description: 'Data-driven technical SEO, programmatic content strategies, and authority building for consistent inbound pipeline.',
    features: [
      'Technical SEO audits, schema markup, and crawlability',
      'Keyword gap analysis and high-intent topical mapping',
      'Search-optimized speed and mobile responsiveness',
      'Conversion rate optimization (CRO) landing pages'
    ]
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design',
    category: 'Design',
    icon: Palette,
    tag: 'Product Design',
    description: 'Intuitive user experiences, modern interface designs, interactive design systems, and functional prototypes.',
    features: [
      'User journey mapping, wireframing, and interactive prototypes',
      'Scalable design systems and component libraries',
      'Accessible WCAG-compliant color contrast and typography',
      'Mobile-first responsive interface architecture'
    ]
  },
  {
    id: 'cloud-technology',
    title: 'Cloud & Technology Solutions',
    category: 'Engineering',
    icon: Cloud,
    tag: 'Cloud & DevOps',
    description: 'Secure, fault-tolerant cloud hosting architectures, automated deployment pipelines, and zero-downtime environments.',
    features: [
      'Cloud deployment (AWS, GCP, DigitalOcean, Vercel)',
      'SSL security, DDoS mitigation, and firewall hardening',
      'Continuous Integration and Automated Deployment (CI/CD)',
      'Automated database backups and disaster recovery'
    ]
  },
  {
    id: 'business-management',
    title: 'Business Management Solutions',
    category: 'Platforms',
    icon: FolderKanban,
    tag: 'Operations & Management',
    description: 'Centralized platforms uniting client contracts, team projects, tasks, attendance, HR, and balanced finance.',
    features: [
      'Multi-stage task approvals and milestone review workflows',
      'Double-entry accounting parity and GST billing',
      'Employee attendance logging and confidential payroll generation',
      'Dedicated isolated portals for clients, staff, and leadership'
    ]
  }
];

export const CapabilitiesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Engineering', 'AI & Automation', 'Platforms', 'Automation', 'Growth', 'Design'];

  const filteredCapabilities = selectedCategory === 'All'
    ? I2S_EXTENDED_CAPABILITIES
    : I2S_EXTENDED_CAPABILITIES.filter(item => item.category === selectedCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.75rem 2rem 3rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h1 className="public-hero-title" style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.4rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            Explore Our Capabilities
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '700px',
            margin: '0 auto 2.25rem'
          }}>
            From custom software engineering and AI autonomous systems to turnkey store deployments and full-funnel growth engines — discover everything I2S delivers.
          </p>

          {/* Interactive Category Filter Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                  style={{
                    padding: '0.45rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
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

      {/* Main Capabilities Grid */}
      <section style={{ padding: '3.5rem clamp(1rem, 3.5vw, 3rem)', background: 'var(--bg-app)', flex: 1, width: '100%' }}>
        <div style={{ maxWidth: '1480px', width: '100%', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '1.75rem'
          }}>
            {filteredCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <div
                  key={cap.id}
                  className="ref-card"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Card Header with Icon & Category Tag */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '10px',
                      background: 'var(--primary-light)',
                      color: 'var(--primary-orange)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Icon size={22} />
                    </div>
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      background: '#F1F5F9',
                      color: 'var(--text-secondary)',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {cap.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: 'var(--dark-navy)',
                    marginBottom: '0.65rem',
                    lineHeight: 1.25,
                    fontFamily: 'var(--font-heading)'
                  }}>
                    {cap.title}
                  </h3>
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem'
                  }}>
                    {cap.description}
                  </p>

                  {/* Feature Bullets */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    flex: 1
                  }}>
                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: 'var(--dark-navy)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.65rem'
                    }}>
                      Key Deliverables
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                      {cap.features.map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                          <Check size={14} color="var(--primary-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Link to Contact */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.15rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Consultation Available
                    </span>
                    <Link
                      to={`/contact?service=${encodeURIComponent(cap.title)}`}
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
                      Request Proposal <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cross-Link Call to Action */}
      <section style={{
        padding: '3.5rem clamp(1rem, 3.5vw, 3rem)',
        background: 'linear-gradient(135deg, #111111 0%, #FF5A00 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        width: '100%',
      }}>
        <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to Build Your Solution?
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#FFE4D6', marginBottom: '1.75rem', lineHeight: 1.6 }}>
            Share your project requirements with our engineering and strategy team. We deliver custom roadmaps and transparent proposals within 24 hours.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              className="btn-primary"
              style={{
                background: '#FFFFFF',
                color: 'var(--primary-orange)',
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Start a Project <ArrowRight size={16} />
            </Link>
            <Link
              to="/store"
              className="btn-secondary"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.85rem 1.75rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Browse Ready-Made Stores
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default CapabilitiesPage;

