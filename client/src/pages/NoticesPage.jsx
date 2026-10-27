import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell, Send, Trash2, Eye, ShieldAlert, AlertTriangle, Info,
  CheckCircle2, Users, Filter, Clock, Check, RefreshCw, X, FileText
} from 'lucide-react';

export const NoticesPage = () => {
  const { user } = useAuth();
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);

  // Tabs: For Admin: 'my_notices' | 'admin_compose' | 'admin_sent'
  // For non-admin employees: 'my_notices'
  const [activeTab, setActiveTab] = useState('my_notices');

  // Employee Received Notices State
  const [notices, setNotices] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read, urgent
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNoticeModal, setSelectedNoticeModal] = useState(null);
  const [loading, setLoading] = useState(true);

  // Admin Compose State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noticeType, setNoticeType] = useState('OFFICIAL_NOTICE');
  const [priority, setPriority] = useState('NORMAL');
  const [targetType, setTargetType] = useState('ALL_EMPLOYEES');
  const [targetRoles, setTargetRoles] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminNoticeList, setAdminNoticeList] = useState([]);

  const AVAILABLE_ROLES = [
    { id: 'SUPER_ADMIN', label: 'Super Admin' },
    { id: 'ADMIN', label: 'Admin' },
    { id: 'ACCOUNTS_MANAGER', label: 'Accounts Manager' },
    { id: 'HR_MANAGER', label: 'HR Manager' },
    { id: 'TEAM_LEADER', label: 'Team Leader' },
    { id: 'STAFF', label: 'Staff Specialist' },
    { id: 'INTERN', label: 'Intern' },
  ];

  useEffect(() => {
    loadMyNotices();
    if (isAdmin) {
      loadAdminSentNotices();
    }
  }, [filter]);

  const loadMyNotices = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/notifications/my-notices?filter=${filter}`);
      if (res.success) {
        setNotices(res.notices || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSentNotices = async () => {
    try {
      const res = await apiFetch('/notifications/admin/notices');
      if (res.success) {
        setAdminNoticeList(res.notices || []);
      }
    } catch (err) {
      console.error('Failed to load sent notices:', err);
    }
  };

  const handleOpenNotice = async (notice) => {
    setSelectedNoticeModal(notice);
    if (!notice.isRead) {
      try {
        await apiFetch(`/notifications/my-notices/${notice.id}/read`, { method: 'PATCH' });
        // Update local state
        setNotices(notices.map(n => n.id === notice.id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark notice read:', err);
      }
    }
  };

  const handlePublishNotice = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please enter a title and content.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/notifications/admin/notices', {
        method: 'POST',
        body: JSON.stringify({
          title,
          content,
          noticeType,
          priority,
          targetType,
          targetRoles: targetType === 'SPECIFIC_ROLES' ? targetRoles : [],
        }),
      });

      if (res.success) {
        alert(res.message || 'Notice published successfully!');
        setTitle('');
        setContent('');
        setNoticeType('OFFICIAL_NOTICE');
        setPriority('NORMAL');
        setTargetType('ALL_EMPLOYEES');
        setTargetRoles([]);
        setShowPreviewModal(false);
        setActiveTab('admin_sent');
        loadAdminSentNotices();
        loadMyNotices();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await apiFetch(`/notifications/admin/notices/${id}`, { method: 'DELETE' });
      loadAdminSentNotices();
      loadMyNotices();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleRoleSelection = (roleId) => {
    setTargetRoles(prev =>
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const formatDateIST = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPriorityBadge = (p) => {
    if (p === 'URGENT') {
      return (
        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ShieldAlert size={12} /> Urgent Notice
        </span>
      );
    }
    if (p === 'IMPORTANT') {
      return (
        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={12} /> Important
        </span>
      );
    }
    return (
      <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <Info size={12} /> General
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Corporate Communications &bull; Broadcast System
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isAdmin ? 'Admin Messages & Official Notices' : 'Notifications & Official Notices'}
          </h1>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('admin_compose')}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Send size={16} /> Compose New Notice
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('my_notices')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'my_notices' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'my_notices' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Bell size={16} /> My Notices ({notices.length})
          {unreadCount > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              borderRadius: '999px',
              padding: '0.1rem 0.45rem',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}>
              {unreadCount} new
            </span>
          )}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('admin_compose')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'admin_compose' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'admin_compose' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Send size={16} /> Compose Notice
            </button>

            <button
              onClick={() => setActiveTab('admin_sent')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'admin_sent' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'admin_sent' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <FileText size={16} /> Sent Notices & Read Receipts ({adminNoticeList.length})
            </button>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY RECEIVED NOTICES */}
      {/* ======================================================== */}
      {activeTab === 'my_notices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['all', 'unread', 'read', 'urgent'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.35rem 0.8rem',
                    fontSize: '0.82rem',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    background: filter === f ? 'var(--primary-blue)' : '#FFFFFF',
                    color: filter === f ? '#FFFFFF' : 'var(--text-main)',
                    fontWeight: filter === f ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f === 'urgent' ? 'Important / Urgent' : f}
                </button>
              ))}
            </div>

            <button onClick={loadMyNotices} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Notices Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading notices...</div>
          ) : notices.length === 0 ? (
            <div className="ref-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Bell size={36} color="var(--border-subtle)" style={{ margin: '0 auto 1rem' }} />
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>No official notices found</div>
              <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                All corporate announcements and urgent alerts will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
              {notices.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleOpenNotice(n)}
                  className="ref-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    borderLeft: !n.isRead ? '4px solid var(--primary-blue)' : '1px solid var(--border-color)',
                    background: !n.isRead ? 'rgba(23, 101, 232, 0.02)' : '#FFFFFF',
                    padding: '1.25rem 1.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, marginRight: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      {getPriorityBadge(n.priority)}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Published: {formatDateIST(n.publishedAt)}
                      </span>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                        From: {n.sender ? `${n.sender.firstName} ${n.sender.lastName} (${n.sender.role.replace('_', ' ')})` : 'Authorized Admin'}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark-navy)', marginTop: '0.15rem' }}>
                      {n.title}
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', margin: 0, lineClamp: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.content}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!n.isRead ? (
                      <span className="badge badge-danger" style={{ fontSize: '0.75rem' }}>Unread</span>
                    ) : (
                      <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Read</span>
                    )}
                    <button className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}>
                      View Notice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ADMIN COMPOSE NOTICE */}
      {/* ======================================================== */}
      {isAdmin && activeTab === 'admin_compose' && (
        <div className="ref-card" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1.25rem' }}>
            Publish Official Message / Notice
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); setShowPreviewModal(true); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Notice Title *
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Mandatory System Maintenance / Company Townhall Notice"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Notice Category
                </label>
                <select
                  className="form-input"
                  value={noticeType}
                  onChange={(e) => setNoticeType(e.target.value)}
                >
                  <option value="GENERAL">General Message</option>
                  <option value="OFFICIAL_NOTICE">Official Notice</option>
                  <option value="ANNOUNCEMENT">Important Announcement</option>
                  <option value="URGENT">Urgent Notice</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Priority Level
                </label>
                <select
                  className="form-input"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Target Recipients (Excludes Clients Completely)
              </label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'ALL_EMPLOYEES'}
                    onChange={() => setTargetType('ALL_EMPLOYEES')}
                  />
                  <span>All 7 Employee Roles (Everyone)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === 'SPECIFIC_ROLES'}
                    onChange={() => setTargetType('SPECIFIC_ROLES')}
                  />
                  <span>Select Specific Roles</span>
                </label>
              </div>

              {targetType === 'SPECIFIC_ROLES' && (
                <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                  {AVAILABLE_ROLES.map((r) => (
                    <label
                      key={r.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.82rem',
                        padding: '0.35rem 0.65rem',
                        borderRadius: '4px',
                        background: targetRoles.includes(r.id) ? 'var(--primary-blue)' : '#FFFFFF',
                        color: targetRoles.includes(r.id) ? '#FFFFFF' : 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={targetRoles.includes(r.id)}
                        onChange={() => toggleRoleSelection(r.id)}
                        style={{ display: 'none' }}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Message Content *
              </label>
              <textarea
                required
                rows={6}
                className="form-input"
                placeholder="Enter the full official communication or instructions..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Eye size={16} /> Preview Notice
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Send size={16} /> Review & Publish
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ADMIN SENT NOTICES & READ RECEIPTS */}
      {/* ======================================================== */}
      {isAdmin && activeTab === 'admin_sent' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0 }}>
                Sent Notices & Read Receipts Audit
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                Track delivery status and see which authorized employees have opened your official notices.
              </p>
            </div>
            <button onClick={loadAdminSentNotices} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title & Category</th>
                  <th>Priority</th>
                  <th>Published Date (IST)</th>
                  <th>Target Group</th>
                  <th>Read Receipts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminNoticeList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      No sent notices found.
                    </td>
                  </tr>
                ) : (
                  adminNoticeList.map((n) => {
                    const totalRecipients = n.recipients?.length || 0;
                    const readCount = n.recipients?.filter(r => r.isRead).length || 0;
                    const percent = totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0;

                    return (
                      <tr key={n.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--dark-navy)' }}>{n.title}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{n.noticeType}</div>
                        </td>
                        <td>{getPriorityBadge(n.priority)}</td>
                        <td>{formatDateIST(n.publishedAt)}</td>
                        <td>
                          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                            {n.targetType === 'ALL_EMPLOYEES' ? 'All 7 Roles' : n.targetRoles || 'Selected Roles'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ flex: 1, minWidth: '70px', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${percent}%`, background: percent === 100 ? '#10B981' : 'var(--primary-blue)' }} />
                            </div>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{readCount}/{totalRecipients} ({percent}%)</span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteNotice(n.id)}
                            style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.35rem' }}
                            title="Delete Notice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: VIEW FULL NOTICE DETAILS (READ RECEIPT PERSISTENCE) */}
      {/* ======================================================== */}
      {selectedNoticeModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="ref-card" style={{ maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  {getPriorityBadge(selectedNoticeModal.priority)}
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                    From: {selectedNoticeModal.sender ? `${selectedNoticeModal.sender.firstName} ${selectedNoticeModal.sender.lastName} (${selectedNoticeModal.sender.role.replace('_', ' ')})` : 'Authorized Administrator'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0 }}>
                  {selectedNoticeModal.title}
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  Published: {formatDateIST(selectedNoticeModal.publishedAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedNoticeModal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem',
              fontSize: '0.92rem',
              lineHeight: 1.7,
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              marginBottom: '1.5rem',
            }}>
              {selectedNoticeModal.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#10B981' }}>
                <CheckCircle2 size={16} /> Read receipt confirmed & recorded in database
              </div>
              <button onClick={() => setSelectedNoticeModal(null)} className="btn-primary" style={{ padding: '0.45rem 1.25rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADMIN NOTICE PREVIEW MODAL */}
      {/* ======================================================== */}
      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
        }}>
          <div className="ref-card" style={{ maxWidth: '650px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0 }}>
                Notice Preview
              </h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.5rem',
              marginBottom: '1.5rem',
              background: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {getPriorityBadge(priority)}
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  From: {user?.firstName} {user?.lastName} ({user?.role?.replace('_', ' ')})
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  Target: {targetType === 'ALL_EMPLOYEES' ? 'All 7 Eligible Roles (Clients Excluded)' : targetRoles.join(', ')}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.5rem 0' }}>
                {title || 'Untitled Notice'}
              </h3>

              <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
                {content || 'No message content provided.'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowPreviewModal(false)} className="btn-secondary" style={{ padding: '0.45rem 1.25rem' }}>
                Back to Edit
              </button>
              <button
                onClick={handlePublishNotice}
                disabled={submitting}
                className="btn-primary"
                style={{ padding: '0.45rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Send size={16} /> {submitting ? 'Publishing...' : 'Confirm & Publish to All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
