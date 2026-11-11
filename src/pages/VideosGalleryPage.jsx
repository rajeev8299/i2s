import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, Clock, Video, ArrowRight, ExternalLink, RefreshCw, Filter
} from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/PublicLayout';
import { I2S_VIDEO_GALLERY } from '../data/videoData';
import { apiFetch } from '../services/api';

const DEFAULT_FALLBACK_THUMB = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=80';

export const VideosGalleryPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [videos, setVideos] = useState(I2S_VIDEO_GALLERY);

  const categories = ['All', 'Engineering', 'AI & Automation', 'Platforms', 'Voice AI', 'Operations', 'Growth'];

  useEffect(() => {
    let isMounted = true;
    const loadVideos = async () => {
      try {
        const data = await apiFetch('/videos/public');
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0 && isMounted) {
          const mapped = data.videos.map(v => ({
            id: v.id,
            title: v.title,
            category: v.category || 'Engineering',
            duration: v.duration || '',
            thumbnail: v.thumbnailUrl || DEFAULT_FALLBACK_THUMB,
            originalUrl: v.originalUrl,
            platform: v.platform || 'YOUTUBE',
            description: v.description || '',
          }));
          setVideos(mapped);
        }
      } catch (e) {
        // Fallback to initial curated gallery
      }
    };
    loadVideos();
    return () => { isMounted = false; };
  }, []);

  const filteredVideos = selectedCategory === 'All'
    ? videos
    : videos.filter((v) => (v.category || '').toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(180deg, #FFF4ED 0%, var(--bg-app) 100%)',
        padding: '3.5rem 2rem 2.75rem',
        borderBottom: '1px solid var(--border-color)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            color: 'var(--text-main)',
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
          }}>
            Watch & Learn Video Library
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '720px', margin: '0 auto' }}>
            Comprehensive architectural walkthroughs, software demos, AI bot setups, and growth strategies curated for clients and partners.
          </p>
        </div>
      </section>

      {/* Filter Tabs & Grid */}
      <section style={{ padding: '2.5rem 2rem 3.5rem', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        {/* Category Filters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '2rem',
        }}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`category-filter-btn ${isActive ? 'is-active' : ''}`}
                style={{
                  padding: '0.55rem 1.15rem',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary-orange)' : '#F1F5F9',
                  border: isActive ? '1px solid var(--primary-orange)' : '1px solid var(--border-color)',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Video Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '2rem',
        }}>
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="video-grid-card ref-card"
              style={{
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%',
                  background: '#111111',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_FALLBACK_THUMB;
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Play ${video.title} on ${video.platform || 'original platform'}`}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'var(--primary-orange)',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(255, 90, 0, 0.4)',
                    textDecoration: 'none',
                  }}
                >
                  <Play size={20} fill="#FFFFFF" style={{ marginLeft: '3px' }} />
                </a>

                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.75rem',
                    left: '0.75rem',
                    right: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    background: 'rgba(0,0,0,0.75)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                  }}>
                    {video.category}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}>
                    <Clock size={11} /> {video.duration || 'Video'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.4 }}>
                  {video.title}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem', flex: 1 }}>
                  {video.description}
                </p>
                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--primary-orange)',
                    textDecoration: 'none',
                    marginTop: 'auto',
                  }}
                >
                  <span>Watch Video</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};

export default VideosGalleryPage;
