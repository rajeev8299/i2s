import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare, CheckCircle2, XCircle, Search, Filter, Eye,
  Clock, Calendar, User, FileText, Send, Share2, AlertTriangle,
  ExternalLink, Plus, ArrowRight, UserCheck, ShieldCheck
} from 'lucide-react';

export const TeamReportsPage = () => {
  const { user } = useAuth();
  const isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes(user?.role);
  const isTeamLeader = user?.role === 'TEAM_LEADER';

  const [reports, setReports] = useState([]);
  const [adminOverview, setAdminOverview] = useState({ internReports: [], teamLeaderReports: [] });
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Tab views:
  // For TL: 'intern_reports' (default) | 'all_team' | 'requests'
  // For Admin: 'forwarded_interns' (default) | 'team_leaders' | 'all_submissions' | 'requests'
  const [activeTab, setActiveTab] = useState(isAdmin ? 'forwarded_interns' : 'intern_reports');

  // Request Daily Report Feature State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [reportRequests, setReportRequests] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTargetUserId, setSelectedTargetUserId] = useState('');
  const [requestReportDate, setRequestReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestDeadline, setRequestDeadline] = useState('');
  const [requestInstructions, setRequestInstructions] = useState('');
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Review Modal State
  const [selectedReport, setSelectedReport] = useState(null);
  const [decision, setDecision] = useState('APPROVED');
  const [feedback, setFeedback] = useState('');
  const [forwardToAdmin, setForwardToAdmin] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Detail View Modal State
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    loadReports();
    loadProjectsAndRequests();
    if (isAdmin) {
      loadAdminOverview();
    }
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      const data = await apiFetch(`/reports/team${query}`);
      setReports(data.reports || []);
    } catch (err) {
      console.error('Error loading team reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminOverview = async () => {
    try {
      const data = await apiFetch('/reports/admin/overview');
      if (data.success) {
        setAdminOverview({
          internReports: data.internReports || [],
          teamLeaderReports: data.teamLeaderReports || []
        });
      }
    } catch (err) {
      console.error('Error loading admin overview:', err);
    }
  };

  const loadProjectsAndRequests = async () => {
    try {
      const [projData, reqData] = await Promise.all([
        apiFetch('/projects'),
        apiFetch('/reports/requests'),
      ]);
      if (projData.projects) {
        setProjects(projData.projects);
      }
      if (reqData.requests) {
        setReportRequests(reqData.requests);
      }
    } catch (err) {
      console.error('Error loading projects/requests:', err);
    }
  };

  const handleProjectSelect = (projId) => {
    setSelectedProjectId(projId);
    setSelectedTargetUserId('');
    const proj = projects.find(p => p.id === projId);
    if (proj && proj.members) {
      // Show only active Staff Specialists or Interns assigned to the selected project
      const eligibleMembers = proj.members.filter(m =>
        m.user && ['STAFF', 'INTERN'].includes(m.user.role)
      );
      setTeamMembers(eligibleMembers);
    } else {
      setTeamMembers([]);
    }
  };

  const handleSendReportRequest = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedTargetUserId || !requestReportDate) return;
    setIsSubmittingRequest(true);

    try {
      const res = await apiFetch('/reports/request', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          targetUserId: selectedTargetUserId,
          reportDate: requestReportDate,
          deadline: requestDeadline || null,
          instructions: requestInstructions,
        }),
      });

      if (res.success) {
        alert('Daily report requested! The team member has been notified in-app.');
        setShowRequestModal(false);
        setRequestInstructions('');
        loadProjectsAndRequests();
      } else {
        alert(res.error || 'Failed to request daily report.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleOpenReview = (report) => {
    setSelectedReport(report);
    setDecision('APPROVED');
    setFeedback('');
    setForwardToAdmin(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setIsSubmittingReview(true);

    try {
      await apiFetch(`/reports/${selectedReport.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          decision,
          feedback,
          forwardToAdmin: decision === 'APPROVED' ? forwardToAdmin : false,
        }),
      });

      setSelectedReport(null);
      await loadReports();
      if (isAdmin) await loadAdminOverview();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleForwardToAdmin = async (reportId) => {
    try {
      const res = await apiFetch(`/reports/${reportId}/forward`, {
        method: 'POST',
      });
      if (res.success) {
        alert('Report successfully forwarded to Admin.');
        await loadReports();
        if (isAdmin) await loadAdminOverview();
      } else {
        alert(res.error || 'Failed to forward report.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Determine current display list based on active tab
  let displayList = [];
  if (isAdmin) {
    if (activeTab === 'forwarded_interns') {
      displayList = adminOverview.internReports;
    } else if (activeTab === 'team_leaders') {
      displayList = adminOverview.teamLeaderReports;
    } else {
      displayList = reports;
    }
  } else {
    // Team Leader
    if (activeTab === 'intern_reports') {
      displayList = reports.filter(r => r.author?.role === 'INTERN');
    } else {
      displayList = reports;
    }
  }

  const filteredDisplayList = displayList.filter((r) => {
    const text = `${r.workTitle || ''} ${r.completedWork || ''} ${r.pendingWork || ''} ${r.author?.firstName || ''} ${r.author?.lastName || ''} ${r.project?.name || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const internReportsCount = reports.filter(r => r.author?.role === 'INTERN').length;
  const pendingReviewCount = reports.filter(r => r.status === 'SUBMITTED' || r.status === 'UNDER_REVIEW').length;
  const forwardedInternsCount = adminOverview.internReports.length;
  const tlReportsCount = adminOverview.teamLeaderReports.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            {isAdmin ? 'Administration • Daily Work Governance' : 'Team Leadership • Intern & Team Work Oversight'}
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {isAdmin ? 'Daily Work Reports (Admin Oversight)' : 'Intern Work Reports & Team Review'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {isTeamLeader && (
            <Link
              to="/app/daily-work"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
            >
              <FileText size={16} /> Submit My Daily Report
            </Link>
          )}

          <button
            onClick={() => {
              if (projects.length > 0) handleProjectSelect(projects[0].id);
              setShowRequestModal(true);
            }}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Request Daily Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {isAdmin ? (
          <>
            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Forwarded Intern Reports</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>{forwardedInternsCount} Approved</div>
              </div>
            </div>

            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Team Leader Own Reports</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{tlReportsCount} Submitted</div>
              </div>
            </div>

            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Company Submissions</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>{reports.length} Total</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Assigned Intern Reports</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-blue)' }}>{internReportsCount} Reports</div>
              </div>
            </div>

            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Awaiting Review</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>{pendingReviewCount} Pending</div>
              </div>
            </div>

            <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Approved & Forwarded</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>
                  {reports.filter(r => r.status === 'APPROVED' && r.isForwardedToAdmin).length} Forwarded
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs Switcher */}
      <div style={{ display: 'flex', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.25rem', width: 'fit-content' }}>
        {isAdmin ? (
          <>
            <button
              onClick={() => setActiveTab('forwarded_interns')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'forwarded_interns' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'forwarded_interns' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Forwarded Intern Reports ({forwardedInternsCount})
            </button>
            <button
              onClick={() => setActiveTab('team_leaders')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'team_leaders' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'team_leaders' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Team Leaders' Own Reports ({tlReportsCount})
            </button>
            <button
              onClick={() => setActiveTab('all_submissions')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'all_submissions' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'all_submissions' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              All Submissions ({reports.length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('intern_reports')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'intern_reports' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'intern_reports' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Intern Work Reports ({internReportsCount})
            </button>
            <button
              onClick={() => setActiveTab('all_team')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'all_team' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'all_team' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              All Team Reports ({reports.length})
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'requests' ? '#FFFFFF' : 'transparent',
            color: activeTab === 'requests' ? 'var(--dark-navy)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          Report Requests ({reportRequests.length})
        </button>
      </div>

      {activeTab !== 'requests' ? (
        /* Reports Table Card */
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by author, work, completed/pending tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>

              {activeTab === 'all_submissions' || activeTab === 'all_team' || activeTab === 'intern_reports' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="search-input"
                  style={{ width: 'auto' }}
                >
                  <option value="">All Review Statuses</option>
                  <option value="SUBMITTED">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="RETURNED_FOR_CORRECTION">Returned for Correction</option>
                  <option value="DRAFT">Drafts</option>
                </select>
              ) : null}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredDisplayList.length}</strong> reports
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Author & Role</th>
                  <th>Work Summary</th>
                  <th>Completed & Pending</th>
                  <th>Project & Status</th>
                  <th>Report Date</th>
                  <th>TL Feedback / Forwarded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDisplayList.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      {isAdmin && activeTab === 'forwarded_interns'
                        ? 'No Intern reports have been forwarded by Team Leaders yet. Intern reports appear here only after Team Leader approval & forwarding.'
                        : 'No reports found matching current criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredDisplayList.map((r) => {
                    const latestReview = r.reviews && r.reviews.length > 0 ? r.reviews[0] : null;

                    return (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {r.author?.firstName} {r.author?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: r.author?.role === 'INTERN' ? '#2563EB' : r.author?.role === 'TEAM_LEADER' ? '#7C3AED' : 'var(--text-muted)', fontWeight: 600 }}>
                            {r.author?.role}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {r.author?.email}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.workTitle}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {r.description}
                          </div>
                          {r.reviewedReportsCount > 0 && (
                            <div style={{ fontSize: '0.75rem', color: '#7C3AED', fontWeight: 600, marginTop: '0.2rem' }}>
                              Intern Reports Reviewed: {r.reviewedReportsCount}
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ maxWidth: '240px', fontSize: '0.8rem' }}>
                            {r.completedWork ? (
                              <div style={{ color: '#16A34A', marginBottom: '0.25rem' }}>
                                <strong>Done:</strong> {r.completedWork.slice(0, 60)}{r.completedWork.length > 60 ? '...' : ''}
                              </div>
                            ) : null}
                            {r.pendingWork ? (
                              <div style={{ color: '#D97706' }}>
                                <strong>Pending:</strong> {r.pendingWork.slice(0, 60)}{r.pendingWork.length > 60 ? '...' : ''}
                              </div>
                            ) : null}
                            {!r.completedWork && !r.pendingWork && (
                              <span style={{ color: 'var(--text-muted)' }}>Details in summary</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--primary-blue)', fontSize: '0.85rem' }}>
                            {r.project?.name || 'General Operations'}
                          </div>
                          <div style={{ marginTop: '0.25rem' }}>
                            <span className={`badge ${
                              r.status === 'APPROVED' ? 'badge-success' :
                              r.status === 'RETURNED_FOR_CORRECTION' ? 'badge-danger' : 'badge-warning'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        </td>

                        <td style={{ fontSize: '0.85rem' }}>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(r.reportDate).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {Math.floor(r.timeSpentMinutes / 60)}h {r.timeSpentMinutes % 60}m logged
                          </div>
                        </td>

                        <td>
                          {latestReview ? (
                            <div style={{ fontSize: '0.78rem', maxWidth: '220px' }}>
                              <div style={{ fontWeight: 600, color: latestReview.decision === 'APPROVED' ? '#16A34A' : '#DC2626' }}>
                                {latestReview.reviewer?.firstName} {latestReview.reviewer?.lastName}:
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                "{latestReview.feedback || 'Approved without comment'}"
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending Review</span>
                          )}

                          {r.isForwardedToAdmin && (
                            <div style={{ marginTop: '0.3rem' }}>
                              <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: '4px', background: '#DCFCE7', color: '#16A34A', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                                <CheckCircle2 size={10} /> Forwarded to Admin
                              </span>
                            </div>
                          )}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => setViewingReport(r)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <Eye size={13} /> View
                            </button>

                            {/* Team Leader Review & Forward Actions */}
                            {isTeamLeader && (
                              <>
                                <button
                                  onClick={() => handleOpenReview(r)}
                                  className="btn-primary"
                                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                >
                                  Review
                                </button>

                                {r.status === 'APPROVED' && !r.isForwardedToAdmin && (
                                  <button
                                    onClick={() => handleForwardToAdmin(r.id)}
                                    className="btn-secondary"
                                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#16A34A', borderColor: '#16A34A' }}
                                    title="Forward approved report to Admin"
                                  >
                                    Forward to Admin
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Requests Tracking View */
        <div className="ref-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '1rem' }}>
            Requested Daily Work Reports
          </h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Target Team Member</th>
                  <th>Project</th>
                  <th>Target Report Date</th>
                  <th>Reporting Deadline</th>
                  <th>Instructions</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No report requests sent yet. Use "Request Daily Report" above.
                    </td>
                  </tr>
                ) : (
                  reportRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{req.targetUser?.firstName} {req.targetUser?.lastName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{req.targetUser?.role}</div>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
                        {req.project?.name}
                      </td>
                      <td>{new Date(req.reportDate).toLocaleDateString()}</td>
                      <td>{req.deadline ? new Date(req.deadline).toLocaleDateString() : 'End of day'}</td>
                      <td style={{ fontSize: '0.82rem', maxWidth: '280px' }}>{req.instructions}</td>
                      <td>
                        <span className={`badge ${req.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {viewingReport && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(20, 38, 63, 0.6)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div className="ref-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`badge ${
                  viewingReport.status === 'APPROVED' ? 'badge-success' :
                  viewingReport.status === 'RETURNED_FOR_CORRECTION' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {viewingReport.status}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.4rem 0 0.15rem' }}>
                  {viewingReport.workTitle}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  By: <strong>{viewingReport.author?.firstName} {viewingReport.author?.lastName}</strong> ({viewingReport.author?.role}) &bull; Date: {new Date(viewingReport.reportDate).toLocaleDateString()}
                </div>
              </div>

              {viewingReport.isForwardedToAdmin && (
                <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem', borderRadius: '4px', background: '#DCFCE7', color: '#16A34A', fontWeight: 700 }}>
                  Forwarded to Admin
                </span>
              )}
            </div>

            <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.88rem' }}>
              <div style={{ marginBottom: '0.65rem' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Work Summary / Description:</strong>
                <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{viewingReport.description}</p>
              </div>

              {viewingReport.completedWork && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <strong style={{ color: '#16A34A' }}>Completed Work Today:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{viewingReport.completedWork}</p>
                </div>
              )}

              {viewingReport.pendingWork && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <strong style={{ color: '#D97706' }}>Pending Work:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{viewingReport.pendingWork}</p>
                </div>
              )}

              {viewingReport.currentStatus && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <strong>Current Status:</strong> {viewingReport.currentStatus}
                </div>
              )}

              {viewingReport.blockers && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: '#DC2626' }}>
                  <strong>Blockers / Challenges:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{viewingReport.blockers}</p>
                </div>
              )}

              {viewingReport.nextSteps && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: 'var(--primary-blue)' }}>
                  <strong>Next Steps / Plan:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{viewingReport.nextSteps}</p>
                </div>
              )}

              {viewingReport.reviewedReportsCount > 0 && (
                <div style={{ marginBottom: '0.65rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', color: '#7C3AED' }}>
                  <strong>Intern Reports Reviewed by Team Leader:</strong> {viewingReport.reviewedReportsCount}
                </div>
              )}

              {viewingReport.workLinks && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <strong>Deliverable / Link:</strong>{' '}
                  <a href={viewingReport.workLinks} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)' }}>
                    {viewingReport.workLinks} <ExternalLink size={12} style={{ display: 'inline' }} />
                  </a>
                </div>
              )}
            </div>

            {/* Team Leader Review & Feedback History */}
            {viewingReport.reviews && viewingReport.reviews.length > 0 && (
              <div style={{ marginBottom: '1.25rem' }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Review & Feedback History:
                </h4>
                {viewingReport.reviews.map((rev) => (
                  <div key={rev.id} style={{ background: '#F8FAFC', borderLeft: `3px solid ${rev.decision === 'APPROVED' ? '#16A34A' : '#DC2626'}`, padding: '0.75rem', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span>Reviewer: {rev.reviewer?.firstName} {rev.reviewer?.lastName} ({rev.reviewer?.role})</span>
                      <span style={{ color: rev.decision === 'APPROVED' ? '#16A34A' : '#DC2626' }}>{rev.decision}</span>
                    </div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      "{rev.feedback || 'No written feedback'}"
                    </p>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {new Date(rev.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setViewingReport(null)}
                className="btn-secondary"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Review Work Report: {selectedReport.workTitle}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Author: <strong>{selectedReport.author?.firstName} {selectedReport.author?.lastName}</strong> ({selectedReport.author?.role}) &bull; {selectedReport.project?.name || 'General Project'}
            </p>

            <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Completed Work:</strong>
                <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{selectedReport.completedWork || selectedReport.description}</p>
              </div>

              {selectedReport.pendingWork && (
                <div style={{ marginBottom: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                  <strong style={{ color: '#D97706' }}>Pending Work:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{selectedReport.pendingWork}</p>
                </div>
              )}

              {selectedReport.blockers && (
                <div style={{ marginBottom: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', color: '#DC2626' }}>
                  <strong>Blockers:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{selectedReport.blockers}</p>
                </div>
              )}

              {selectedReport.nextSteps && (
                <div style={{ marginBottom: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', color: 'var(--primary-blue)' }}>
                  <strong>Next Steps:</strong>
                  <p style={{ margin: '0.2rem 0 0', whiteSpace: 'pre-wrap' }}>{selectedReport.nextSteps}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Review Decision *</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#16A34A' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={decision === 'APPROVED'}
                      onChange={() => setDecision('APPROVED')}
                    />
                    Approve Work Report
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600, color: '#DC2626' }}>
                    <input
                      type="radio"
                      name="decision"
                      value="RETURNED_FOR_CORRECTION"
                      checked={decision === 'RETURNED_FOR_CORRECTION'}
                      onChange={() => setDecision('RETURNED_FOR_CORRECTION')}
                    />
                    Return for Correction
                  </label>
                </div>
              </div>

              {decision === 'APPROVED' && (
                <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #BFDBFE' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: '#1D4ED8' }}>
                    <input
                      type="checkbox"
                      checked={forwardToAdmin}
                      onChange={(e) => setForwardToAdmin(e.target.checked)}
                    />
                    Forward Approved Report to Admin Dashboard
                  </label>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Feedback / Instructions for Author</label>
                <textarea
                  rows={3}
                  placeholder={decision === 'APPROVED' ? 'Optional feedback: Great work on today deliverables...' : 'Specify what needs correction or missing details...'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedReport(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingReview} className="btn-primary">
                  {isSubmittingReview ? 'Submitting Review...' : 'Submit Review Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Daily Report Modal */}
      {showRequestModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 17, 17, 0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.25rem',
        }}>
          <div
            className="ref-card"
            style={{
              maxWidth: '520px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              background: '#FFFFFF',
              padding: '1.75rem',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.85rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
                Request Daily Work Report
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                Assign an authorized daily reporting requirement to an active Staff Specialist or Intern.
              </p>
            </div>

            <form onSubmit={handleSendReportRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Field 1: Project (Required) */}
              <div className="form-group">
                <label className="form-label">
                  Project <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={selectedProjectId}
                  onChange={(e) => handleProjectSelect(e.target.value)}
                  className="search-input"
                >
                  <option value="">Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.code ? `(${p.code})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Staff / Intern (Required) */}
              <div className="form-group">
                <label className="form-label">
                  Staff / Intern <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={selectedTargetUserId}
                  onChange={(e) => setSelectedTargetUserId(e.target.value)}
                  className="search-input"
                  disabled={!selectedProjectId || teamMembers.length === 0}
                >
                  <option value="">
                    {!selectedProjectId
                      ? 'First select a project...'
                      : teamMembers.length === 0
                      ? 'No eligible Staff or Intern members assigned to this project'
                      : 'Select Assigned Staff or Intern...'}
                  </option>
                  {teamMembers.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.firstName} {m.user?.lastName} ({m.roleTitle || (m.user?.role === 'INTERN' ? 'Intern' : 'Staff Specialist')})
                    </option>
                  ))}
                </select>

                {selectedProjectId && teamMembers.length === 0 && (
                  <div style={{
                    marginTop: '0.35rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    color: '#B45309',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                    <span>No eligible Staff or Intern members are assigned to this project.</span>
                  </div>
                )}
              </div>

              {/* Row: Report Date (Required) & Submission Deadline (Optional) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.9rem' }}>
                {/* Field 3: Report Date */}
                <div className="form-group">
                  <label className="form-label">
                    Report Date <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={requestReportDate}
                    onChange={(e) => setRequestReportDate(e.target.value)}
                    className="search-input"
                  />
                </div>

                {/* Field 4: Submission Deadline (Optional) */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Submission Deadline</span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span>
                  </label>
                  <input
                    type="date"
                    value={requestDeadline}
                    onChange={(e) => setRequestDeadline(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Field 5: Work Instructions (Optional) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Work Instructions</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>Optional</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention the main work to report today..."
                  value={requestInstructions}
                  onChange={(e) => setRequestInstructions(e.target.value)}
                  className="search-input"
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '0.5rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="btn-secondary"
                  disabled={isSubmittingRequest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRequest || !selectedProjectId || !selectedTargetUserId || !requestReportDate}
                  className="btn-primary"
                >
                  {isSubmittingRequest ? 'Sending Request...' : 'Send Report Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamReportsPage;
