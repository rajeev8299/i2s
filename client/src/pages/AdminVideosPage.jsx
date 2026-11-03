import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Video, Plus, Edit2, Trash2, ExternalLink, RefreshCw,
  Search, Check, X, Eye, EyeOff, Sparkles, AlertCircle, Play, ArrowUpDown
} from 'lucide-react';

export const AdminVideosPage = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [fetchingMeta, setFetchingMeta] = useState(false);
  const [metaMessage, setMetaMessage] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    description: '',
    thumbnailUrl: '',
    category: 'Engineering',
    duration: '',
    displayOrder: 0,
    isActive: true,
  });

  const CATEGORIES = [
    'Engineering',
    'AI & Automation',
    'Platforms',
    'Voice AI',
    'Operations',
    'Growth',
    'Design',
    'Case Study',
  ];

  useEffect(() => {
    loadVideos();
  }, [categoryFilter, statusFilter]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      let query = '?';
      if (categoryFilter !== 'All') query += `category=${encodeURIComponent(categoryFilter)}&`;
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (search) query += `search=${encodeURIComponent(search)}&`;

      const data = await apiFetch(`/videos${query}`);
      if (data.success) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setFormData({
      originalUrl: '',
      title: '',
      description: '',
      thumbnailUrl: '',
      category: 'Engineering',
      duration: '',
      displayOrder: videos.length + 1,
      isActive: true,
    });
    setMetaMessage(null);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFormData({
      originalUrl: video.originalUrl,
      title: video.title,
      description: video.description || '',
      thumbnailUrl: video.thumbnailUrl || '',
      category: video.category || 'Engineering',
      duration: video.duration || '',
      displayOrder: video.displayOrder || 0,
      isActive: video.isActive,
    });
    setMetaMessage(null);
    setFormError('');
    setShowModal(true);
  };

  const handleFetchMetadata = async () => {
    if (!formData.originalUrl || !formData.originalUrl.trim()) {
      setFormError('Please enter a video URL first.');
      return;
    }

    setFetchingMeta(true);
    setMetaMessage(null);
    setFormError('');

    try {
      const data = await apiFetch('/videos/fetch-metadata', {
        method: 'POST',
        body: JSON.stringify({ url: formData.originalUrl.trim() }),
      });

      if (data.success && data.metadata) {
        const meta = data.metadata;
        setFormData(prev => ({
          ...prev,
          originalUrl: meta.originalUrl || prev.originalUrl,
          title: meta.title || prev.title,
          description: meta.description || prev.description,
          thumbnailUrl: meta.thumbnailUrl || prev.thumbnailUrl,
          duration: meta.duration || prev.duration,
        }));
        setMetaMessage({
          type: meta.metadataFetched ? 'success' : 'info',
          text: meta.message || 'Metadata processed successfully.',
          platform: meta.platform,
        });
      } else {
        setFormError(data.error || 'Failed to retrieve metadata.');
      }
    } catch (err) {
      setFormError(err.message || 'Network error fetching metadata. Please enter details manually.');
    } finally {
      setFetchingMeta(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.originalUrl.trim()) {
      setFormError('Original Video URL is required.');
      return;
    }
    if (!formData.title.trim()) {
      setFormError('Video Title is required.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const endpoint = editingVideo ? `/videos/${editingVideo.id}` : '/videos';
      const method = editingVideo ? 'PUT' : 'POST';

      const data = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      if (data.success) {
        setShowModal(false);
        loadVideos();
      } else {
        setFormError(data.error || 'Failed to save video record.');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save video. Please verify inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (video) => {
    try {
      const data = await apiFetch(`/videos/${video.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !video.isActive }),
      });
      if (data.success) {
        setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isActive: !v.isActive } : v));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDelete = async (video) => {
    const confirmDelete = window.confirm(
      `Remove "${video.title}" from the website listing?\n\n(This will not delete the video from its original platform.)`
    );
    if (!confirmDelete) return;

    try {
      const data = await apiFetch(`/videos/${video.id}`, { method: 'DELETE' });
      if (data.success) {
        setVideos(prev => prev.filter(v => v.id !== video.id));
      }
    } catch (err) {
      alert('Failed to delete video: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', paddingBottom: '3rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Marketing &bull; Guidance on Video Showcase
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Video Management System
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            Manage link-based video cards displayed on the public "Guidance on Video" carousel and video library.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.15rem' }}
        >
          <Plus size={16} /> Add Video Link
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255, 90, 0, 0.1)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Videos</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{videos.length}</div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(22, 163, 74, 0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active on Website</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16A34A' }}>
              {videos.filter(v => v.isActive).length}
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(100, 116, 139, 0.1)', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EyeOff size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Inactive / Hidden</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748B' }}>
              {videos.filter(v => !v.isActive).length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ref-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title, description, or URL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadVideos()}
              className="search-input"
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="search-input"
            style={{ width: 'auto' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <button
          onClick={loadVideos}
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Video Table List */}
      <div className="ref-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Thumbnail</th>
                <th style={{ minWidth: '240px' }}>Video Details</th>
                <th style={{ width: '120px' }}>Platform</th>
                <th style={{ width: '130px' }}>Category</th>
                <th style={{ width: '90px' }}>Duration</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Order</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    Loading video records...
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    No video records match your filter criteria. Click "Add Video Link" to create one.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id}>
                    <td>
                      <div style={{
                        width: '100px',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#1a1a1a',
                        position: 'relative',
                        border: '1px solid var(--border-color)',
                      }}>
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80';
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748B' }}>
                            <Video size={20} />
                          </div>
                        )}
                        <a
                          href={video.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open original video"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(0,0,0,0.3)',
                            color: '#FFFFFF',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                        >
                          <Play size={18} fill="#FFFFFF" />
                        </a>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                        {video.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineBreak: 'anywhere' }}>
                        <a
                          href={video.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          {video.originalUrl.length > 55 ? video.originalUrl.slice(0, 55) + '...' : video.originalUrl}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                      {video.description && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>
                          {video.description}
                        </div>
                      )}
                    </td>

                    <td>
                      <span className={`badge ${
                        video.platform === 'YOUTUBE' ? 'badge-danger' :
                        video.platform === 'INSTAGRAM' ? 'badge-warning' :
                        video.platform === 'FACEBOOK' ? 'badge-info' : 'badge-secondary'
                      }`} style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {video.platform}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {video.category}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {video.duration || '—'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      #{video.displayOrder}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${video.isActive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                        {video.isActive ? 'ACTIVE' : 'HIDDEN'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleToggleStatus(video)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          title={video.isActive ? 'Hide from public website' : 'Make visible on public website'}
                        >
                          {video.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => openEditModal(video)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          title="Edit details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(video)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                          title="Remove listing"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Video Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(10, 10, 10, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={() => !isSubmitting && setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-card, #FFFFFF)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {editingVideo ? 'Edit Guidance Video' : 'Add New Video Link'}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Paste a YouTube, Instagram, or Facebook link. Videos will open on their original platform.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #EF4444',
                  borderRadius: '6px',
                  color: '#DC2626',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{formError}</span>
                </div>
              )}

              {/* URL Input & Auto-Fetch Button */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Original Video URL *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=... or https://www.instagram.com/reel/..."
                    value={formData.originalUrl}
                    onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                    required
                    style={{
                      flex: 1,
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input, #F8FAFC)',
                      fontSize: '0.88rem',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleFetchMetadata}
                    disabled={fetchingMeta}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      whiteSpace: 'nowrap',
                      padding: '0.65rem 0.95rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                    title="Automatically fetch title, thumbnail, and details"
                  >
                    {fetchingMeta ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} style={{ color: 'var(--primary-orange)' }} />
                    )}
                    <span>{fetchingMeta ? 'Fetching...' : 'Fetch Info'}</span>
                  </button>
                </div>
              </div>

              {/* Status Message / Info Box */}
              {metaMessage && (
                <div style={{
                  padding: '0.7rem 0.9rem',
                  background: metaMessage.type === 'success' ? '#F0FDF4' : '#F8FAFC',
                  border: `1px solid ${metaMessage.type === 'success' ? '#BBF7D0' : '#E2E8F0'}`,
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  color: metaMessage.type === 'success' ? '#166534' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <span className={`badge ${
                    metaMessage.platform === 'YOUTUBE' ? 'badge-danger' :
                    metaMessage.platform === 'INSTAGRAM' ? 'badge-warning' : 'badge-info'
                  }`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem' }}>
                    {metaMessage.platform}
                  </span>
                  <span>{metaMessage.text}</span>
                </div>
              )}

              {/* Video Title */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Video Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Building Enterprise Full-Stack Web Applications"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input, #F8FAFC)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Short Summary / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="A concise description of the guidance or architectural demonstration..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input, #F8FAFC)',
                    fontSize: '0.88rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Thumbnail URL & Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  Thumbnail Image URL (Auto-populated or custom image link)
                </label>
                <input
                  type="url"
                  placeholder="https://... image link"
                  value={formData.thumbnailUrl}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input, #F8FAFC)',
                    fontSize: '0.88rem',
                  }}
                />

                {formData.thumbnailUrl && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '120px',
                      height: '68px',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-color)',
                      background: '#1a1a1a',
                    }}>
                      <img
                        src={formData.thumbnailUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80';
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Thumbnail Preview
                    </span>
                  </div>
                )}
              </div>

              {/* Category, Duration & Display Order Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input, #F8FAFC)',
                      fontSize: '0.88rem',
                    }}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Duration (e.g. 14:20)
                  </label>
                  <input
                    type="text"
                    placeholder="12:30"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input, #F8FAFC)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-input, #F8FAFC)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              {/* Active Toggle Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-orange)' }}
                />
                <label htmlFor="isActiveCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                  Visible on Public Website (Guidance on Video Carousel & Library)
                </label>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="btn-secondary"
                  style={{ padding: '0.65rem 1.25rem', fontSize: '0.88rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}
                >
                  {isSubmitting ? 'Saving...' : editingVideo ? 'Update Video' : 'Save & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideosPage;
