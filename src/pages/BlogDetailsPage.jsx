import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Calendar, Share2, Check, Bookmark, ArrowRight,
  BookOpen, Sparkles, CheckCircle2, ChevronRight, User, Eye, Copy,
  MessageSquare
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { BLOG_ARTICLES, getArticleBySlug, getRelatedArticles } from '../data/blogArticles';

export const BlogDetailsPage = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug, id]);

  const article = getArticleBySlug(slug) || BLOG_ARTICLES.find(a => String(a.id) === String(id)) || BLOG_ARTICLES[0];
  const relatedArticles = getRelatedArticles(article.id, article.category, 3);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Reading "${article.title}" by @I2SSoftware`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Header Breadcrumb & Category Bar */}
      <div style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        borderBottom: '1px solid var(--border-color)',
        padding: '2.5rem clamp(1rem, 3.5vw, 3rem) 2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-orange)', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to All Articles
            </Link>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{
              background: 'rgba(255, 90, 0, 0.12)',
              color: 'var(--primary-orange)',
              padding: '0.2rem 0.65rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}>
              {article.category}
            </span>
            <ChevronRight size={14} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
              {article.title}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: '-0.025em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            {article.title}
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '920px',
            marginBottom: '1.75rem'
          }}>
            {article.excerpt}
          </p>

          {/* Author Metadata Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.25rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img
                src={article.author.avatar}
                alt={article.author.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-orange)' }}
              />
              <div>
                <div style={{ fontWeight: 700, color: 'var(--dark-navy)', fontSize: '1rem' }}>{article.author.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{article.author.role}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--primary-orange)" /> {article.date}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={16} color="var(--primary-orange)" /> {article.readTime}
              </span>

              {/* Social Share Group */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleCopyLink}
                  title="Copy Article Link"
                  style={{
                    background: copied ? '#E6F4EA' : '#FFFFFF',
                    color: copied ? '#137333' : 'var(--dark-navy)',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Share'}
                </button>

                <button
                  onClick={handleShareTwitter}
                  title="Share to X"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.55rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: 'var(--dark-navy)'
                  }}
                >
                  𝕏
                </button>

                <button
                  onClick={handleShareLinkedIn}
                  title="Share to LinkedIn"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    padding: '0.4rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#0A66C2'
                  }}
                >
                  in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <section style={{ padding: '3rem clamp(1rem, 3.5vw, 3rem) 5rem', flex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '3rem', alignItems: 'start' }} className="blog-detail-grid">

          {/* Left Column: Cover + Article Sections */}
          <div>
            {/* Featured Hero Banner Image */}
            <div style={{
              width: '100%',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              marginBottom: '2.5rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)'
            }}>
              <img
                src={article.coverImage}
                alt={article.title}
                style={{ width: '100%', height: 'auto', maxHeight: '480px', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Key Takeaways Callout Card */}
            {article.keyTakeaways && article.keyTakeaways.length > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255,90,0,0.06) 0%, rgba(255,90,0,0.02) 100%)',
                border: '1px solid rgba(255,90,0,0.22)',
                borderLeft: '5px solid var(--primary-orange)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem 2rem',
                marginBottom: '3rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <Sparkles size={20} color="var(--primary-orange)" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Key Executive Takeaways
                  </h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {article.keyTakeaways.map((point, idx) => (
                    <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.98rem', lineHeight: 1.6 }}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Article Sections Loop */}
            <article style={{ display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
              {(article.content || article.sections || []).map((section, idx) => {
                const anchorId = (section.heading || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                const bodyText = section.text || section.content || '';
                return (
                  <section key={idx} id={anchorId} style={{ scrollMarginTop: '100px' }}>
                    <h2 style={{
                      fontSize: 'clamp(1.4rem, 2.4vw, 1.85rem)',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 800,
                      color: 'var(--dark-navy)',
                      letterSpacing: '-0.02em',
                      marginBottom: '1rem',
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.6rem'
                    }}>
                      <span style={{ color: 'var(--primary-orange)', fontSize: '1.1rem', fontWeight: 700 }}>0{idx + 1}.</span>
                      {section.heading}
                    </h2>

                    <div style={{
                      fontSize: '1.05rem',
                      lineHeight: 1.75,
                      color: 'var(--text-main)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      {bodyText.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx} style={{ margin: 0 }}>
                          {paragraph}
                        </p>
                      ))}
                    </div>

                    {section.quote && (
                      <div style={{
                        marginTop: '1.5rem',
                        padding: '1.25rem 1.75rem',
                        background: '#FFFFFF',
                        borderLeft: '4px solid var(--primary-orange)',
                        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                        boxShadow: 'var(--shadow-xs)',
                        fontStyle: 'italic',
                        color: 'var(--dark-navy)',
                        fontSize: '1.02rem',
                        fontWeight: 500
                      }}>
                        "{section.quote}"
                      </div>
                    )}
                  </section>
                );
              })}
            </article>

            {/* Tags Cloud */}
            {article.tags && (
              <div style={{ marginTop: '3.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tags:
                </span>
                {article.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: 500
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Profile Bio Box */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <img
                src={article.author.avatar}
                alt={article.author.name}
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-orange)' }}
              />
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary-orange)', fontWeight: 700 }}>
                  Written by
                </div>
                <h4 style={{ margin: '0.2rem 0', fontSize: '1.2rem', color: 'var(--dark-navy)', fontWeight: 800 }}>
                  {article.author.name}
                </h4>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {article.author.role} at Imagination 2 Software (I2S). Dedicated to engineering high-performance software architectures, AI pipelines, and digital experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar with Table of Contents + CTA */}
          <aside style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Table of Contents Card */}
            {article.tableOfContents && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                  <BookOpen size={18} color="var(--primary-orange)" />
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
                    Table of Contents
                  </h4>
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {article.tableOfContents.map((item, idx) => {
                    const label = typeof item === 'string' ? item : item.label;
                    const anchor = typeof item === 'string'
                      ? item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                      : item.id;
                    return (
                      <a
                        key={idx}
                        href={`#${anchor}`}
                        style={{
                          fontSize: '0.88rem',
                          color: 'var(--text-secondary)',
                          textDecoration: 'none',
                          lineHeight: 1.45,
                          transition: 'color 0.2s ease',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.45rem'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary-orange)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        <span style={{ color: 'var(--primary-orange)', fontWeight: 700, fontSize: '0.75rem' }}>0{idx + 1}.</span>
                        <span>{label}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Technology Consultation CTA Card */}
            <div style={{
              background: 'linear-gradient(135deg, var(--dark-navy) 0%, #1A1A1A 100%)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid rgba(255,90,0,0.3)'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(255, 90, 0, 0.2)',
                color: 'var(--primary-orange)',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                marginBottom: '1rem'
              }}>
                <Sparkles size={12} /> Work With I2S
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.65rem 0', lineHeight: 1.3, color: '#FFFFFF' }}>
                Need Help Implementing This in Your Business?
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#B0B0B0', lineHeight: 1.55, margin: '0 0 1.25rem 0' }}>
                Our senior software engineers and AI consultants design and deploy production-ready digital solutions tailored to your growth goals.
              </p>
              <Link
                to="/contact"
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.8rem 1.25rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Schedule Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Related Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section style={{
          background: 'linear-gradient(180deg, var(--bg-app) 0%, #FFF4ED 100%)',
          borderTop: '1px solid var(--border-color)',
          padding: '4rem clamp(1rem, 3.5vw, 3rem)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-orange)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Keep Reading
                </span>
                <h3 style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.3rem 0 0 0', fontFamily: 'var(--font-heading)' }}>
                  Related Articles & Guides
                </h3>
              </div>
              <Link to="/blog" style={{ color: 'var(--primary-orange)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem' }}>
                View All 17 Articles <ArrowRight size={16} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.75rem'
            }}>
              {relatedArticles.map((rel) => (
                <article
                  key={rel.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', height: '180px', overflow: 'hidden' }}>
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(255, 90, 0, 0.95)',
                      color: '#FFFFFF',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase'
                    }}>
                      {rel.category}
                    </span>
                  </div>

                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                      <span>{rel.date}</span>
                      <span>•</span>
                      <span>{rel.readTime}</span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark-navy)', lineHeight: 1.35, marginBottom: '0.65rem', fontFamily: 'var(--font-heading)' }}>
                      {rel.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.25rem 0', flex: 1 }}>
                      {rel.excerpt.slice(0, 110)}...
                    </p>

                    <Link
                      to={`/blog/${rel.slug}`}
                      style={{
                        color: 'var(--primary-orange)',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginTop: 'auto'
                      }}
                    >
                      Read Article <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Global Responsive Style Overrides */}
      <style>{`
        @media (max-width: 900px) {
          .blog-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          aside {
            position: static !important;
          }
        }
      `}</style>

      <PublicFooter />
    </div>
  );
};
