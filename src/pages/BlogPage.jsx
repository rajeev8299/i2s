import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ArrowRight, Sparkles, Clock, Search,
  CheckCircle2, Bell, Calendar, User, ChevronRight,
  TrendingUp, Award, Layers, ShieldCheck, Zap
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { apiFetch } from '../services/api';
import {
  BLOG_CATEGORIES,
  BLOG_ARTICLES,
  FEATURED_ARTICLE
} from '../data/blogArticles';

export const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Articles');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const articlesPerPage = 6;

  // Filter articles based on Category and Search Query
  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All Articles' || article.category === selectedCategory;

      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        (article.tags && article.tags.some((tag) => tag.toLowerCase().includes(query)));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage) || 1;
  const currentArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    return filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  }, [filteredArticles, currentPage, articlesPerPage]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    try {
      await apiFetch('/public/newsletter', {
        method: 'POST',
        body: JSON.stringify({ email: newsletterEmail, source: 'blog_briefing' }),
      });
      setIsSubscribed(true);
    } catch (err) {
      // Fallback display
      setIsSubscribed(true);
    }
  };

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.75rem clamp(1rem, 3.5vw, 3rem) 2.5rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 90, 0, 0.12)',
            color: 'var(--primary-orange)',
            padding: '0.35rem 0.9rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={14} /> I2S INSIGHTS & KNOWLEDGE
          </div>

          {/* Heading */}
          <h1 className="public-hero-title" style={{
            fontSize: 'clamp(2.1rem, 5.5vw, 3.6rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: 'var(--dark-navy)',
            marginBottom: '1.25rem'
          }}>
            Insights That Drive <span style={{ color: 'var(--primary-orange)' }}>Innovation</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.25rem'
          }}>
            Explore technology trends, software development insights, AI innovations and practical digital strategies from the I2S team.
          </p>

          {/* Live Search Bar */}
          <div style={{
            maxWidth: '620px',
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search
              size={20}
              color="var(--primary-orange)"
              style={{ position: 'absolute', left: '18px', pointerEvents: 'none' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by topic, keyword, or technology (e.g. AI, React, Cloud)..."
              style={{
                width: '100%',
                padding: '0.95rem 1.25rem 0.95rem 3.25rem',
                fontSize: '1rem',
                borderRadius: '999px',
                border: '1.5px solid var(--border-color)',
                background: '#FFFFFF',
                boxShadow: 'var(--shadow-sm)',
                outline: 'none',
                color: 'var(--dark-navy)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-orange)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 90, 0, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'var(--shadow-sm)';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. FEATURED ARTICLE SECTION (Shown when no search query or on initial page) */}
      {!searchQuery && selectedCategory === 'All Articles' && currentPage === 1 && (
        <section style={{
          padding: '2.5rem clamp(1rem, 3.5vw, 3rem) 1.5rem',
          maxWidth: '1480px',
          margin: '0 auto',
          width: '100%'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            alignItems: 'stretch'
          }}>
            {/* Featured Image */}
            <div style={{ position: 'relative', minHeight: '340px', overflow: 'hidden' }}>
              <img
                src={FEATURED_ARTICLE.coverImage}
                alt={FEATURED_ARTICLE.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                background: 'var(--primary-orange)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                textTransform: 'uppercase',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}>
                ⭐ FEATURED INSIGHT
              </span>
            </div>

            {/* Featured Content */}
            <div style={{
              padding: 'clamp(1.75rem, 3.5vw, 3rem)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: 'var(--primary-orange)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem'
              }}>
                <span>{FEATURED_ARTICLE.category}</span>
                <span>•</span>
                <span style={{ color: 'var(--text-muted)' }}>{FEATURED_ARTICLE.readTime}</span>
              </div>

              <h2 style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'var(--dark-navy)',
                marginBottom: '1rem'
              }}>
                <Link
                  to={`/blog/${FEATURED_ARTICLE.slug}`}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {FEATURED_ARTICLE.title}
                </Link>
              </h2>

              <p style={{
                fontSize: '1rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '1.75rem'
              }}>
                {FEATURED_ARTICLE.excerpt}
              </p>

              {/* Author & Read Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                paddingTop: '1.25rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={FEATURED_ARTICLE.author.avatar}
                    alt={FEATURED_ARTICLE.author.name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--dark-navy)' }}>
                      {FEATURED_ARTICLE.author.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {FEATURED_ARTICLE.date}
                    </div>
                  </div>
                </div>

                <Link
                  to={`/blog/${FEATURED_ARTICLE.slug}`}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Read Full Article <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. HORIZONTAL CATEGORY FILTER BAR */}
      <section style={{
        padding: '1.5rem clamp(1rem, 3.5vw, 3rem) 1rem',
        maxWidth: '1480px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          overflowX: 'auto',
          paddingBottom: '0.5rem',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }} className="category-scroll-container">
          {BLOG_CATEGORIES.map((cat) => {
            const count = cat === 'All Articles'
              ? BLOG_ARTICLES.length
              : BLOG_ARTICLES.filter((a) => a.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.86rem',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                  background: isSelected ? 'var(--primary-orange)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}
              >
                <span>{cat}</span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.06)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. ARTICLES GRID & LISTING */}
      <section style={{
        padding: '1.5rem clamp(1rem, 3.5vw, 3rem) 4rem',
        maxWidth: '1480px',
        margin: '0 auto',
        width: '100%',
        flex: 1
      }}>
        {/* Results summary bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
            Showing <strong style={{ color: 'var(--dark-navy)' }}>{filteredArticles.length}</strong> {filteredArticles.length === 1 ? 'article' : 'articles'}
            {selectedCategory !== 'All Articles' && <span> in <strong style={{ color: 'var(--primary-orange)' }}>{selectedCategory}</strong></span>}
            {searchQuery && <span> matching "<strong style={{ color: 'var(--dark-navy)' }}>{searchQuery}</strong>"</span>}
          </div>

          {(selectedCategory !== 'All Articles' || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory('All Articles'); setSearchQuery(''); setCurrentPage(1); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-orange)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Empty State when no results found */}
        {filteredArticles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 1.5rem',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 90, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <Search size={28} color="var(--primary-orange)" />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
              No Articles Matched Your Search
            </h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
              We couldn't find any articles matching your search query. Try searching for different keywords or explore other categories.
            </p>
            <button
              onClick={() => { setSelectedCategory('All Articles'); setSearchQuery(''); }}
              className="btn-primary"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              View All Articles
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '2rem'
          }}>
            {currentArticles.map((article) => (
              <article
                key={article.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease'
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
                {/* Article Cover Image */}
                <div style={{ position: 'relative', width: '100%', height: '220px', overflow: 'hidden' }}>
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: 'rgba(255, 90, 0, 0.95)',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '0.25rem 0.7rem',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {article.category}
                  </span>
                </div>

                {/* Article Body */}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {/* Metadata Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {article.date}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> {article.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    color: 'var(--dark-navy)',
                    lineHeight: 1.35,
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-heading)'
                  }}>
                    <Link
                      to={`/blog/${article.slug}`}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {/* Excerpt */}
                  <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.55,
                    margin: '0 0 1.5rem 0',
                    flex: 1
                  }}>
                    {article.excerpt}
                  </p>

                  {/* Author & Action Footer */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    marginTop: 'auto'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-navy)' }}>
                        {article.author.name}
                      </span>
                    </div>

                    <Link
                      to={`/blog/${article.slug}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: 'var(--primary-orange)',
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* 5. PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3.5rem'
          }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: currentPage === 1 ? '#F0F0F0' : '#FFFFFF',
                color: currentPage === 1 ? '#AAAAAA' : 'var(--dark-navy)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  border: currentPage === page ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                  background: currentPage === page ? 'var(--primary-orange)' : '#FFFFFF',
                  color: currentPage === page ? '#FFFFFF' : 'var(--dark-navy)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: currentPage === totalPages ? '#F0F0F0' : '#FFFFFF',
                color: currentPage === totalPages ? '#AAAAAA' : 'var(--dark-navy)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem'
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* 6. WHY READ I2S INSIGHTS? (4 PILLARS) */}
      <section style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '4.5rem clamp(1rem, 3.5vw, 3rem)'
      }}>
        <div style={{ maxWidth: '1480px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3rem' }}>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 800,
              color: 'var(--primary-orange)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase'
            }}>
              ENGINEERED KNOWLEDGE
            </span>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3.2vw, 2.6rem)',
              fontWeight: 800,
              color: 'var(--dark-navy)',
              fontFamily: 'var(--font-heading)',
              margin: '0.5rem 0 1rem 0'
            }}>
              Why Read I2S Insights?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
              We bridge high-level strategy and low-level code implementation, delivering actionable insights crafted directly by practicing engineers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.75rem'
          }}>
            {[
              {
                icon: TrendingUp,
                title: 'Battle-Tested Architectures',
                description: 'Case studies and architecture benchmarks drawn from real client deployments, high-load systems, and scaling challenges.'
              },
              {
                icon: Zap,
                title: 'Practical AI & Automation',
                description: 'No marketing fluff: actionable frameworks for deploying RAG, LLM agents, WhatsApp automation, and custom ML pipelines.'
              },
              {
                icon: ShieldCheck,
                title: 'Zero-Trust Cybersecurity',
                description: 'Deep dives on threat prevention, credential hardening, cloud compliance, and secure software development lifecycle.'
              },
              {
                icon: Layers,
                title: 'Modern Full-Stack Engineering',
                description: 'Hands-on comparisons across React, Next.js, Node.js, Flutter, microservices, and high-throughput databases.'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '2rem',
                    background: 'var(--bg-app)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-orange)',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {pillar.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. STAY AHEAD OF TECHNOLOGY NEWSLETTER */}
      <section style={{
        background: 'linear-gradient(135deg, var(--dark-navy) 0%, #161616 100%)',
        color: '#FFFFFF',
        padding: '4.5rem clamp(1rem, 3.5vw, 3rem)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '820px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'rgba(255, 90, 0, 0.2)',
            color: 'var(--primary-orange)',
            padding: '0.35rem 0.85rem',
            borderRadius: '999px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem'
          }}>
            <Bell size={14} /> I2S TECH BRIEFING
          </div>

          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 2.85rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            lineHeight: 1.2,
            marginBottom: '1rem',
            color: '#FFFFFF'
          }}>
            Stay Ahead of Technology
          </h2>

          <p style={{
            fontSize: '1.05rem',
            color: '#B8B8B8',
            lineHeight: 1.6,
            maxWidth: '640px',
            margin: '0 auto 2.25rem'
          }}>
            Subscribe to our bi-weekly engineering newsletter. We curate the latest in AI, full-stack frameworks, cloud infrastructure, and software scalability.
          </p>

          {isSubscribed ? (
            <div style={{
              background: 'rgba(46, 204, 113, 0.15)',
              border: '1px solid rgba(46, 204, 113, 0.35)',
              color: '#2ECC71',
              padding: '1.25rem 2rem',
              borderRadius: 'var(--radius-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 700,
              fontSize: '1rem'
            }}>
              <CheckCircle2 size={22} />
              Thank you for subscribing! Check your inbox soon for our latest engineering briefing.
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} style={{
              display: 'flex',
              gap: '0.75rem',
              maxWidth: '520px',
              margin: '0 auto',
              flexWrap: 'wrap'
            }}>
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your business email address..."
                style={{
                  flex: '1 1 280px',
                  padding: '0.9rem 1.25rem',
                  fontSize: '0.95rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '0.9rem 1.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flex: '0 0 auto'
                }}
              >
                Subscribe Now
              </button>
            </form>
          )}

          <div style={{ fontSize: '0.78rem', color: '#888888', marginTop: '1rem' }}>
            🔒 We respect your privacy. No spam, ever. Unsubscribe at any time with one click.
          </div>
        </div>
      </section>

      {/* 8. FINAL PROJECT CTA */}
      <section style={{
        padding: '4.5rem clamp(1rem, 3.5vw, 3rem)',
        background: 'linear-gradient(180deg, var(--bg-app) 0%, #FFF4ED 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(1.9rem, 3.5vw, 2.75rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--dark-navy)',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Have a Technology Project in Mind?
          </h2>
          <p style={{
            fontSize: '1.05rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}>
            From custom web and mobile apps to enterprise AI integrations, our senior team is ready to help you plan, architect and build your next digital product.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/contact"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Start a Conversation <ArrowRight size={18} />
            </Link>
            <Link
              to="/services"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.9rem 1.85rem',
                fontSize: '1rem',
                fontWeight: 700,
                textDecoration: 'none',
                background: '#FFFFFF',
                color: 'var(--dark-navy)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* CSS Helper */}
      <style>{`
        .category-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <PublicFooter />
    </div>
  );
};
