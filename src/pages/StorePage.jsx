import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, ArrowRight, Check, CheckCircle2, Server,
  Terminal, Sparkles, Tag, ShieldCheck, Zap
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_STORE_PRODUCTS } from '../data/websiteContent';
import { I2S_STORE_DEPLOYMENT_TIERS } from '../data/servicesData';

export const StorePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'E-Commerce', 'Portfolio', 'Business', 'Booking', 'Food & Delivery', 'Education'];

  const filteredProducts = selectedCategory === 'All'
    ? I2S_STORE_PRODUCTS
    : I2S_STORE_PRODUCTS.filter(p => p.category === selectedCategory);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.5rem 2rem 2.75rem',
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
            Buy A Store, Skip The Queue
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.65,
            maxWidth: '750px',
            margin: '0 auto 2.5rem'
          }}>
            Don't want to wait for a custom build? Buy a ready-made store off the shelf. We'll deploy it for you — or hand it over to your team. Live in days, not months.
          </p>

          {/* Interactive Category Filter Pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
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

      {/* Product Cards Grid */}
      <section style={{ padding: '3rem 2rem', background: 'var(--bg-app)', flex: 1 }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '1.75rem',
            marginBottom: '2.5rem'
          }}>
            {filteredProducts.map((product) => {
              const discountPercent = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
              return (
                <div
                  key={product.id}
                  className="ref-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0,
                    overflow: 'hidden',
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                  }}
                >
                  {/* Top Image Banner */}
                  <div style={{ position: 'relative', height: '190px', overflow: 'hidden', background: '#111111' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }}
                      loading="lazy"
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '0.5rem'
                    }}>
                      <span style={{
                        padding: '0.25rem 0.65rem',
                        background: 'rgba(17, 17, 17, 0.82)',
                        backdropFilter: 'blur(4px)',
                        color: '#FFFFFF',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase'
                      }}>
                        {product.category}
                      </span>
                      {product.badge && (
                        <span style={{
                          padding: '0.25rem 0.65rem',
                          background: 'var(--primary-orange)',
                          color: '#FFFFFF',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {product.badge}
                        </span>
                      )}
                    </div>

                    {/* Discount Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}>
                      {discountPercent}% OFF
                    </div>
                  </div>

                  {/* Body Details */}
                  <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                      {product.name}
                    </h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--primary-orange)', fontWeight: 600, marginBottom: '0.85rem' }}>
                      {product.tagline}
                    </p>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                      {product.description}
                    </p>

                    {/* Included Features List */}
                    <div style={{ marginBottom: '1.5rem', background: '#F8FAFC', padding: '1.1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--dark-navy)', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
                        Included Features & Modules
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        {product.features.map((feat, fIdx) => (
                          <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-main)' }}>
                            <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Verified Pricing Block & Action */}
                    <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.15rem' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                            MRP: ₹{product.originalPrice.toLocaleString('en-IN')}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                            <span style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
                              ₹{product.discountedPrice.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+ taxes</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700, background: '#ECFDF5', padding: '0.2rem 0.55rem', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                          Save ₹{(product.originalPrice - product.discountedPrice).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Link
                          to={`/contact?product=${encodeURIComponent(product.name)}`}
                          className="btn-primary"
                          style={{
                            flex: 1,
                            justifyContent: 'center',
                            padding: '0.75rem 1rem',
                            fontSize: '0.88rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          Enquire Now <ArrowRight size={15} />
                        </Link>
                        <Link
                          to="/login"
                          className="btn-secondary"
                          style={{
                            padding: '0.75rem 1rem',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem'
                          }}
                        >
                          Client Portal
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery & Deployment Models (Verified Source Details) */}
          <div style={{
            background: 'var(--bg-app)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
                How Our Ready-Made Stores Are Delivered
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
                Choose the delivery model that suits your operations — complete managed deployment or full source code handover.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
              {I2S_STORE_DEPLOYMENT_TIERS.map((tier, tIdx) => (
                <div key={tIdx} className="ref-card" style={{ background: '#FFFFFF', padding: '2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tIdx === 0 ? <Server size={20} /> : <Terminal size={20} />}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)' }}>
                      {tier.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {tier.body}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                    {tier.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
                        <CheckCircle2 size={16} color="var(--primary-orange)" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              * Free deployment applies when you provide your own domain & hosting. Customization beyond included features is billed separately. Templates are licensed for your business use.
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
