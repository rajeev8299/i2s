import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle, Plus, Minus, ArrowRight, Sparkles, MessageSquare,
  CheckCircle2, Mail, Phone
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_FAQS } from '../data/websiteContent';

export const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(0); // Open first by default
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(I2S_FAQS.map(f => f.category))];

  const filteredFaqs = selectedCategory === 'All'
    ? I2S_FAQS
    : I2S_FAQS.filter(f => f.category === selectedCategory);

  const toggleAccordion = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Section */}
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
            Frequently Asked Questions
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '680px',
            margin: '0 auto 2.5rem'
          }}>
            Everything you need to know before starting your software, AI automation, or growth journey with I2S.
          </p>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(0);
                }}
                style={{
                  padding: '0.45rem 1.15rem',
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

      {/* Accessible Accordion Section */}
      <section style={{ padding: '3rem 2rem 3.5rem', background: 'var(--bg-app)', flex: 1 }}>
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="ref-card"
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    background: isOpen ? '#FFFFFF' : 'var(--bg-app)',
                    boxShadow: isOpen ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                    style={{
                      width: '100%',
                      padding: '1.4rem 1.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <span style={{
                        display: 'block',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--primary-orange)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        marginBottom: '0.25rem'
                      }}>
                        {faq.category}
                      </span>
                      <span style={{
                        fontSize: '1.15rem',
                        fontWeight: 800,
                        color: isOpen ? 'var(--primary-orange)' : 'var(--dark-navy)',
                        fontFamily: 'var(--font-heading)',
                        lineHeight: 1.3
                      }}>
                        {faq.question}
                      </span>
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isOpen ? 'var(--primary-orange)' : '#FFFFFF',
                      color: isOpen ? '#FFFFFF' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{
                      padding: '0 1.75rem 1.5rem',
                      borderTop: '1px solid var(--border-subtle)',
                      marginTop: '0.25rem',
                      paddingTop: '1.25rem'
                    }}>
                      <p style={{
                        fontSize: '0.96rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.7,
                        margin: 0
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Have Another Question Callout */}
          <div className="ref-card" style={{
            marginTop: '2.5rem',
            padding: '2rem 1.75rem',
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
              Have a question not listed here?
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Our engineering & strategy team is available to discuss your specific technical or growth requirements.
            </p>
            <Link
              to="/contact"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.75rem 1.6rem',
                fontSize: '0.92rem',
                textDecoration: 'none'
              }}
            >
              Ask Our Team Directly <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
