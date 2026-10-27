import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, ArrowRight, ShieldCheck, CheckCircle2, Lock,
  TrendingUp, Users, FileText, Briefcase, CheckSquare, Sparkles,
  Layers, Cpu, Building, Award, Clock, Activity, ExternalLink, BarChart3
} from 'lucide-react';

const PORTAL_OPTIONS = [
  { label: 'Super Admin', path: '/login', role: 'System Administration & Governance' },
  { label: 'Admin', path: '/login', role: 'Operations & Management' },
  { label: 'Accounts Manager', path: '/login', role: 'Invoices, Ledger & Finance' },
  { label: 'HR Manager', path: '/login', role: 'Talent, Attendance & Payroll' },
  { label: 'Team Leader', path: '/login', role: 'Project Oversight & Task Review' },
  { label: 'Staff Specialist', path: '/login', role: 'Engineering Tasks & Deliverables' },
  { label: 'Intern', path: '/login', role: 'Learning Tasks & Submissions' },
  { label: 'Client Portal', path: '/login', role: 'Approved Milestones & Invoices' },
];

export const LandingPage = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div style={{ background: '#FFFFFF', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* 1. PROFESSIONAL NAVBAR */}
      <header style={{
        padding: '1.15rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Left: Branding */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <img
            src="/i2s-logo.webp"
            alt="I2S — Imagination2Software"
            style={{
              width: '42px',
              height: '42px',
              objectFit: 'contain',
            }}
          />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)', color: 'var(--text-main)' }}>
              Imagination2Software
            </div>
          </div>
        </Link>

        {/* Center: Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <a href="#overview" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500 }}>Overview</a>
          <a href="#modules" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500 }}>Modules</a>
          <a href="#how-it-works" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500 }}>Workflow</a>
          <a href="#security" style={{ fontSize: '0.92rem', color: 'var(--text-muted)', fontWeight: 500 }}>Security</a>
        </nav>

        {/* Right: Direct Sign In link to Common Login + Get Started button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/login"
            className="btn-secondary"
            style={{
              fontSize: '0.85rem',
              padding: '0.6rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              textDecoration: 'none',
            }}
          >
            <Lock size={15} color="var(--primary-blue)" />
            <span>Sign In</span>
          </Link>

          <Link to="/login" className="btn-primary" style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem' }}>
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* 2. HERO SECTION — Light Blue Gradient Background matching Reference */}
      <section style={{
        background: 'linear-gradient(180deg, #EEF5FF 0%, #FFFFFF 100%)',
        padding: '5rem 2rem 4rem',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3.5rem', alignItems: 'center' }}>
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

            <h1 style={{
              fontSize: '3.4rem',
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
              fontSize: '1.1rem',
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
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '2rem' }}>
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

      {/* 4. MAIN BUSINESS MODULE CARDS */}
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
      <section id="security" style={{ padding: '5rem 2rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3.5rem', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1rem' }}>
              Enterprise Reliability & Zero-Trust Access
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              The platform enforces 8 granular roles directly at the backend API layer. Clients see only approved milestones; staff cannot read unpermitted payroll records; and financial ledgers stay balanced.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                'Server-enforced role-based access control (RBAC)',
                'Double-entry accounting parity with immutable journal audit trail',
                'Dedicated client data isolation preventing cross-tenant visibility',
                'Real on-the-fly streaming PDF invoices generated from PostgreSQL',
              ].map((text, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.92rem', color: 'var(--text-main)', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ref-card" style={{ padding: '2rem', background: 'var(--bg-app)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '1.25rem' }}>
              8 Configured Role Portals
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {PORTAL_OPTIONS.map((p, idx) => (
                <Link
                  key={idx}
                  to={p.path}
                  style={{
                    background: '#FFFFFF',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--dark-navy)',
                  }}
                >
                  <span>{p.label}</span>
                  <ArrowRight size={14} color="var(--primary-blue)" />
                </Link>
              ))}
            </div>
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

      {/* 7. FOOTER */}
      <footer style={{ background: 'var(--dark-navy)', color: '#FFFFFF', padding: '2.5rem 3rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="/i2s-logo.webp"
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

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.82rem', color: '#94A3B8' }}>
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
