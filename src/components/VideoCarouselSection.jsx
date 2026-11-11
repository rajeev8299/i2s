import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play, ChevronLeft, ChevronRight, X, Clock,
  Video, ArrowRight
} from 'lucide-react';
import { I2S_VIDEO_GALLERY } from '../data/videoData';
import { apiFetch } from '../services/api';

const DEFAULT_FALLBACK_THUMB = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=720&q=80';

export const VideoCarouselSection = () => {
  const [videoList, setVideoList] = useState(I2S_VIDEO_GALLERY);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);
  const animFrameRef = useRef(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const data = await apiFetch('/videos/public');
        if (data.success && Array.isArray(data.videos) && data.videos.length > 0 && isMounted) {
          // Normalize server videos with required UI fields
          const formatted = data.videos.map(v => ({
            id: v.id,
            title: v.title,
            category: v.category || 'Engineering',
            duration: v.duration || '',
            thumbnail: v.thumbnailUrl || DEFAULT_FALLBACK_THUMB,
            originalUrl: v.originalUrl,
            platform: v.platform || 'YOUTUBE',
            description: v.description || '',
          }));
          setVideoList(formatted);
        }
      } catch (err) {
        // Silently use verified fallback static videos if server is unreachable
      }
    };
    fetchVideos();
    return () => { isMounted = false; };
  }, []);

  // Triple set of items for a seamless, continuous infinite scroll loop
  const displayItems = [
    ...videoList.map((item, idx) => ({ ...item, uniqueKey: `set1-${item.id || idx}` })),
    ...videoList.map((item, idx) => ({ ...item, uniqueKey: `set2-${item.id || idx}` })),
    ...videoList.map((item, idx) => ({ ...item, uniqueKey: `set3-${item.id || idx}` })),
  ];

  const sectionRef = useRef(null);
  const isSectionVisibleRef = useRef(true);
  const hoveredCardCountRef = useRef(0);

  // Monitor section visibility so we only slide when the section is visible
  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isSectionVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, []);

  // Continuous auto-sliding animation loop using requestAnimationFrame
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    let lastTimestamp = performance.now();
    const speed = 0.75; // Pixels per frame (~45px per second for comfortable viewing & readability)

    const step = (timestamp) => {
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Only auto-slide when section is visible, NOT hovered, and NOT explicitly paused
      if (!isHoveredRef.current && isSectionVisibleRef.current) {
        const delta = Math.min(elapsed * 0.06, 2.5); // Cap delta to prevent jump after tab switch
        container.scrollLeft += speed * delta;

        // Reset scroll position seamlessly when one set has scrolled past
        const oneSetWidth = container.scrollWidth / 3;
        if (container.scrollLeft >= oneSetWidth * 2) {
          container.scrollLeft -= oneSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += oneSetWidth;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [videoList]);

  const handleCardMouseEnter = () => {
    hoveredCardCountRef.current += 1;
    isHoveredRef.current = true;
    setIsPaused(true);
  };

  const handleCardMouseLeave = () => {
    hoveredCardCountRef.current = Math.max(0, hoveredCardCountRef.current - 1);
    if (hoveredCardCountRef.current === 0) {
      isHoveredRef.current = false;
      setIsPaused(false);
    }
  };

  const manualScrollPauseTimeoutRef = useRef(null);

  const handleManualScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Temporarily pause continuous auto-sliding during user manual scroll
    isHoveredRef.current = true;
    setIsPaused(true);

    if (manualScrollPauseTimeoutRef.current) {
      clearTimeout(manualScrollPauseTimeoutRef.current);
    }
    manualScrollPauseTimeoutRef.current = setTimeout(() => {
      // Resume auto-sliding after 1800ms if mouse is not currently hovering over cards
      if (hoveredCardCountRef.current === 0) {
        isHoveredRef.current = false;
        setIsPaused(false);
      }
    }, 1800);

    // Calculate actual card width dynamically from DOM or fallback
    const firstCard = container.querySelector('.video-carousel-card');
    const computedCardWidth = firstCard ? firstCard.getBoundingClientRect().width : 360;
    const gap = 24; // 1.5rem gap
    const scrollStep = computedCardWidth + gap;

    const scrollAmount = direction === 'left' ? -scrollStep : scrollStep;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });

    // Handle seamless boundary wrap if near the edges
    const oneSetWidth = container.scrollWidth / 3;
    if (oneSetWidth > 0) {
      if (container.scrollLeft >= oneSetWidth * 2) {
        container.scrollLeft -= oneSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += oneSetWidth;
      }
    }
  };

  return (
    <section
      ref={sectionRef}
      id="watch-and-learn"
      style={{
        padding: '3rem 2rem 2.75rem',
        background: 'var(--bg-app)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}
      aria-label="Watch & Learn — Guidance on Video"
    >
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        {/* Section Header - Centered */}
        <div style={{
          position: 'relative',
          marginBottom: '1.75rem',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>

            <h2 style={{
              fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              margin: '0.2rem 0 0.5rem 0',
              lineHeight: 1.15,
            }}>
              Guidance on Video
            </h2>

            <p style={{
              fontSize: '1rem',
              color: 'var(--text-secondary)',
              maxWidth: '620px',
              margin: '0 auto',
              lineHeight: 1.5,
            }}>
              Quick, helpful architectural insights, live system demonstrations, and engineering guidance direct from the I2S team.
            </p>
          </div>

          {/* Carousel Arrows */}
          <div
            className="carousel-header-nav"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleManualScroll('left');
              }}
              aria-label="Previous video card"
              className="carousel-nav-btn"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleManualScroll('right');
              }}
              aria-label="Next video card"
              className="carousel-nav-btn"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Viewport Container with Continuous Infinite Scroll */}
        <div
          ref={scrollContainerRef}
          className="hide-scrollbar"
          style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            scrollBehavior: 'auto',
            padding: '0.5rem 0 1.5rem',
            WebkitOverflowScrolling: 'touch',
            cursor: isPaused ? 'default' : 'pointer',
          }}
        >
          {displayItems.map((video) => (
            <div
              key={video.uniqueKey}
              className="video-carousel-card"
              onMouseEnter={handleCardMouseEnter}
              onMouseLeave={handleCardMouseLeave}
              onTouchStart={handleCardMouseEnter}
              onTouchEnd={handleCardMouseLeave}
              style={{
                flex: '0 0 min(360px, 85vw)',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
              }}
            >
              {/* Thumbnail Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '56.25%', // 16:9 Aspect Ratio
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
                    transition: 'transform 0.4s ease',
                  }}
                  className="card-thumb-img"
                />
                {/* Subtle dark gradient overlay */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)',
                  }}
                />

                {/* Play Button Overlay */}
                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Play video: ${video.title} on ${video.platform || 'original platform'}`}
                  className="play-overlay-btn"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(255, 90, 0, 0.95)',
                    color: '#FFFFFF',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(255, 90, 0, 0.45)',
                    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.2s ease',
                    textDecoration: 'none',
                  }}
                >
                  <Play size={22} fill="#FFFFFF" style={{ marginLeft: '3px' }} />
                </a>

                {/* Category Badge & Duration */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '0.85rem',
                    left: '0.85rem',
                    right: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#FFFFFF',
                      background: 'rgba(17, 17, 17, 0.75)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    {video.category}
                  </span>

                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      background: 'rgba(0, 0, 0, 0.8)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <Clock size={12} /> {video.duration}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div style={{ padding: '1.35rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    lineHeight: 1.4,
                    marginBottom: '0.65rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {video.title}
                </h3>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: '1.25rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {video.description}
                </p>

                <a
                  href={video.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Watch ${video.title} on original platform`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--primary-orange)',
                    textDecoration: 'none',
                    marginTop: 'auto',
                    textAlign: 'left',
                  }}
                >
                  <span>Watch Video</span>
                  <ArrowRight size={15} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button: "Watch All Videos" */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link
            to="/videos"
            className="btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255, 90, 0, 0.25)',
            }}
          >
            <span>Watch All Videos</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* Scoped Hover & Hide Scrollbar Styles */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .video-carousel-card {
          transition: border-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .video-carousel-card:hover {
          border-color: rgba(255, 90, 0, 0.65) !important;
          box-shadow:
            0 0 0 1px rgba(255, 90, 0, 0.35),
            0 4px 20px rgba(255, 90, 0, 0.14),
            0 1px 3px rgba(17, 17, 17, 0.05) !important;
        }
        .video-carousel-card:hover .card-thumb-img {
          transform: scale(1.05);
        }
        .video-carousel-card:hover .play-overlay-btn {
          transform: translate(-50%, -50%) scale(1.1);
          background: #FF5A00;
        }
        .carousel-nav-btn:hover {
          background: var(--primary-orange) !important;
          color: #FFFFFF !important;
          border-color: var(--primary-orange) !important;
        }
        @media (max-width: 768px) {
          .carousel-header-nav {
            position: static !important;
            justify-content: center !important;
            margin-top: 1.25rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default VideoCarouselSection;
