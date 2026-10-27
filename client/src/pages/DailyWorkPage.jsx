import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, FileText, Plus,
  Edit, Send, Link as LinkIcon, AlertTriangle, Eye, ShieldCheck,
  ChevronRight, ExternalLink
} from 'lucide-react';

export const DailyWorkPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [selectedReportView, setSelectedReportView] = useState(null);

  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    reportDate: new Date().toISOString().split('T')[0],
    workTitle: '',
    description: '',
    completedWork: '',
    pendingWork: '',
    currentStatus: 'In Progress',
    timeSpentMinutes: 60,
    completionPercent: 50,
    workLinks: '',
    blockers: '',
    nextSteps: '',
    plannedTomorrow: '',
    internalNotes: '',
    clientSummary: '',
    reviewedReportsCount: 0,
    status: 'SUBMITTED', // or DRAFT
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [repData, projData, taskData] = await Promise.all([
        apiFetch('/reports/my'),
        apiFetch('/projects'),
        apiFetch('/projects/tasks'),
      ]);
      setReports(repData.reports || []);
      setProjects(projData.projects || []);
      setTasks(taskData.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingReport(null);
    setFormData({
      projectId: projects[0]?.id || '',
      taskId: '',
      reportDate: new Date().toISOString().split('T')[0],
      workTitle: '',
      description: '',
      completedWork: '',
      pendingWork: '',
      currentStatus: 'In Progress',
      timeSpentMinutes: 120,
      completionPercent: 50,
      workLinks: '',
      blockers: '',
      nextSteps: '',
      plannedTomorrow: '',
      internalNotes: '',
      clientSummary: '',
      reviewedReportsCount: 0,
      status: 'SUBMITTED',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (rep) => {
    setEditingReport(rep);
    setFormData({
      projectId: rep.projectId,
      taskId: rep.taskId || '',
      reportDate: new Date(rep.reportDate).toISOString().split('T')[0],
      workTitle: rep.workTitle,
      description: rep.description,
      completedWork: rep.completedWork || rep.description || '',
      pendingWork: rep.pendingWork || '',
      currentStatus: rep.currentStatus || 'In Progress',
      timeSpentMinutes: rep.timeSpentMinutes || 60,
      completionPercent: rep.completionPercent || 0,
      workLinks: rep.workLinks || '',
      blockers: rep.blockers || '',
      nextSteps: rep.nextSteps || '',
      plannedTomorrow: rep.plannedTomorrow || '',
      internalNotes: rep.internalNotes || '',
      clientSummary: rep.clientSummary || '',
      reviewedReportsCount: rep.reviewedReportsCount || 0,
      status: rep.status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED',
    });
    setShowModal(true);
  };

  const handleSubmit = async (submitStatus) => {
    try {
      const derivedTitle = formData.workTitle?.trim() ||
        (formData.completedWork ? formData.completedWork.trim().slice(0, 70) : 'Daily Work Progress');
      const derivedDescription = formData.description?.trim() ||
        formData.completedWork?.trim() ||
        'Daily Work Progress Report';

      const payload = {
        ...formData,
        workTitle: derivedTitle,
        description: derivedDescription,
        status: submitStatus,
      };

      if (editingReport) {
        await apiFetch(`/reports/${editingReport.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/reports', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper status color badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="badge badge-success">Approved</span>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return <span className="badge badge-info">Submitted &bull; Pending Review</span>;
      case 'RETURNED_FOR_CORRECTION':
        return <span className="badge badge-danger">Returned for Correction</span>;
      default:
        return <span className="badge badge-neutral">Draft</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Workforce &bull; Daily Accountability
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {user?.role === 'INTERN' ? 'Intern Daily Work Report' : user?.role === 'TEAM_LEADER' ? 'Team Leader Daily Work Report' : 'My Daily Work Log'}
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> {user?.role === 'INTERN' || user?.role === 'TEAM_LEADER' ? 'Record Daily Report' : "Log Today's Work"}
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Reports Logged</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{reports.length} Entries</div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Approved by Lead</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>
              {reports.filter(r => r.status === 'APPROVED').length}
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Time Logged</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>
              {(reports.reduce((acc, r) => acc + (r.timeSpentMinutes || 0), 0) / 60).toFixed(1)} Hours
            </div>
          </div>
        </div>
      </div>

      {/* Reports History Table Card */}
      <div className="ref-card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            Chronological Work History
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Daily progress updates, task completion, and Team Leader feedback.
          </p>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Deliverable</th>
                <th>Project & Task</th>
                <th>Time Spent</th>
                <th>Status</th>
                <th>Client Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                    No daily reports submitted yet. Click "Log Today's Work" to begin.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {new Date(r.reportDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {r.workTitle}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.description}
                      </div>
                      {r.reviewFeedback && (
                        <div style={{ fontSize: '0.75rem', color: r.status === 'APPROVED' ? '#16A34A' : '#DC2626', background: r.status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2', padding: '0.2rem 0.4rem', borderRadius: '4px', marginTop: '0.25rem' }}>
                          Review Feedback: {r.reviewFeedback}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary-blue)', fontSize: '0.85rem' }}>
                        {r.project?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.task?.title || 'General Engineering'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {Math.floor(r.timeSpentMinutes / 60)}h {r.timeSpentMinutes % 60}m
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>
                      {r.isClientPublished ? (
                        <span className="badge badge-success">Published</span>
                      ) : (
                        <span className="badge badge-neutral">Internal</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => setSelectedReportView(r)}
                          className="btn-secondary"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          title="View full report"
                        >
                          <Eye size={13} /> View
                        </button>
                        {r.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            title="Edit / Resubmit"
                          >
                            <Edit size={13} /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Daily Work Report */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {editingReport ? 'Edit / Resubmit Daily Work Report' : user?.role === 'INTERN' ? 'Intern Daily Work Report' : 'Submit Daily Work Report'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {user?.role === 'INTERN'
                ? 'Quickly record what you completed today, what is pending, and your current status (1-2 minutes).'
                : 'Record your daily deliverables, pending tasks, and work updates.'}
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit('SUBMITTED'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Field 1: Report Date (automatically selected) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Report Date <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.reportDate}
                  onChange={(e) => setFormData({ ...formData, reportDate: e.target.value })}
                  className="search-input"
                  style={{ background: 'var(--bg-app)' }}
                />
              </div>

              {/* Field 2: Project / Task (one combined dropdown) */}
              <div className="form-group">
                <label className="form-label">
                  Project / Task <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={formData.taskId ? `task:${formData.taskId}` : formData.projectId ? `proj:${formData.projectId}` : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('task:')) {
                      const tId = val.replace('task:', '');
                      const tObj = tasks.find(t => t.id === tId);
                      setFormData({
                        ...formData,
                        taskId: tId,
                        projectId: tObj?.projectId || formData.projectId || (projects[0]?.id || ''),
                      });
                    } else if (val.startsWith('proj:')) {
                      const pId = val.replace('proj:', '');
                      setFormData({
                        ...formData,
                        projectId: pId,
                        taskId: '',
                      });
                    } else {
                      setFormData({ ...formData, projectId: '', taskId: '' });
                    }
                  }}
                  className="search-input"
                >
                  <option value="">Select Assigned Project or Task...</option>
                  {projects.map((p) => {
                    const projTasks = tasks.filter(t => t.projectId === p.id);
                    return (
                      <optgroup key={p.id} label={`Project: ${p.name} (${p.code})`}>
                        <option value={`proj:${p.id}`}>
                          {p.name} — General Project Work
                        </option>
                        {projTasks.map((t) => (
                          <option key={t.id} value={`task:${t.id}`}>
                            &nbsp;&nbsp;↳ Task: {t.title}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Field 3: Work Completed Today */}
              <div className="form-group">
                <label className="form-label">
                  Work Completed Today <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize the work, modules, or features you completed today..."
                  value={formData.completedWork}
                  onChange={(e) => setFormData({
                    ...formData,
                    completedWork: e.target.value,
                    description: e.target.value,
                    workTitle: formData.workTitle || e.target.value.slice(0, 60),
                  })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Field 4: Pending Work */}
              <div className="form-group">
                <label className="form-label">
                  Pending Work
                </label>
                <textarea
                  rows={2}
                  placeholder="What work or tasks remain pending for tomorrow..."
                  value={formData.pendingWork}
                  onChange={(e) => setFormData({ ...formData, pendingWork: e.target.value })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Field 5: Status (Dropdown: In Progress, Completed, or Blocked) */}
              <div className="form-group">
                <label className="form-label">
                  Status <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={formData.currentStatus}
                  onChange={(e) => setFormData({
                    ...formData,
                    currentStatus: e.target.value,
                    completionPercent: e.target.value === 'Completed' ? 100 : e.target.value === 'Blocked' ? 30 : 60,
                  })}
                  className="search-input"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Additional optional field only for Team Leader (Internal reports reviewed count) */}
              {user?.role === 'TEAM_LEADER' && (
                <div className="form-group">
                  <label className="form-label">Intern Reports Reviewed Today</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviewedReportsCount}
                    onChange={(e) => setFormData({ ...formData, reviewedReportsCount: e.target.value })}
                    className="search-input"
                    placeholder="e.g. 2"
                  />
                </div>
              )}

              {/* Buttons: Save Draft & Submit Report */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  Save Draft
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Send size={15} /> Submit Report
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedReportView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '0.4rem' }}>{selectedReportView.project?.name}</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedReportView.workTitle}
                </h3>
              </div>
              <div>{getStatusBadge(selectedReportView.status)}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Completed Work:</strong>
                <p style={{ marginTop: '0.2rem', whiteSpace: 'pre-wrap' }}>
                  {selectedReportView.completedWork || selectedReportView.description}
                </p>
              </div>

              {selectedReportView.pendingWork && (
                <div>
                  <strong style={{ color: '#D97706' }}>Pending Work / Incomplete Items:</strong>
                  <p style={{ marginTop: '0.2rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {selectedReportView.pendingWork}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Current Status:</strong>
                  <p style={{ marginTop: '0.2rem', fontWeight: 600 }}>
                    {selectedReportView.currentStatus || (selectedReportView.completionPercent >= 100 ? 'Completed' : 'In Progress')}
                  </p>
                </div>
                {selectedReportView.reviewedReportsCount !== null && selectedReportView.reviewedReportsCount !== undefined && (
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Intern Reports Reviewed:</strong>
                    <p style={{ marginTop: '0.2rem', fontWeight: 600 }}>
                      {selectedReportView.reviewedReportsCount} Reports
                    </p>
                  </div>
                )}
              </div>

              {selectedReportView.blockers && (
                <div>
                  <strong style={{ color: '#DC2626' }}>Reported Blockers:</strong>
                  <p style={{ marginTop: '0.2rem', color: '#DC2626' }}>{selectedReportView.blockers}</p>
                </div>
              )}

              {selectedReportView.nextSteps && (
                <div>
                  <strong style={{ color: 'var(--primary-blue)' }}>Next Steps:</strong>
                  <p style={{ marginTop: '0.2rem' }}>{selectedReportView.nextSteps}</p>
                </div>
              )}

              {/* Team Leader Feedback Section */}
              {selectedReportView.reviewFeedback && (
                <div style={{
                  background: selectedReportView.status === 'APPROVED' ? '#DCFCE7' : '#FEE2E2',
                  border: `1px solid ${selectedReportView.status === 'APPROVED' ? '#86EFAC' : '#FCA5A5'}`,
                  padding: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <strong style={{ color: selectedReportView.status === 'APPROVED' ? '#166534' : '#991B1B' }}>
                    Team Leader Review & Feedback:
                  </strong>
                  <p style={{ margin: '0.35rem 0 0', color: selectedReportView.status === 'APPROVED' ? '#14532D' : '#7F1D1D' }}>
                    {selectedReportView.reviewFeedback}
                  </p>
                  {selectedReportView.reviewer && (
                    <div style={{ fontSize: '0.75rem', color: selectedReportView.status === 'APPROVED' ? '#15803D' : '#B91C1C', marginTop: '0.35rem' }}>
                      Reviewed by {selectedReportView.reviewer.firstName} {selectedReportView.reviewer.lastName}
                    </div>
                  )}
                </div>
              )}

              {selectedReportView.workLinks && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)' }}>Deliverable Links:</strong>
                  <div>
                    <a href={selectedReportView.workLinks} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      {selectedReportView.workLinks} <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setSelectedReportView(null)} className="btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyWorkPage;
