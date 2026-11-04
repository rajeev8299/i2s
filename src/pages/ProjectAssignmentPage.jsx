import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import {
  FolderKanban,
  UserCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Briefcase,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProjectAssignmentPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [roleTitle, setRoleTitle] = useState('Team Member');
  const [isLeader, setIsLeader] = useState(false);

  // Search/Filter State
  const [projectSearch, setProjectSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');

  // UI Messages
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [projRes, userRes, assignRes] = await Promise.all([
        apiFetch('/projects'),
        apiFetch('/projects/assignable-users'),
        apiFetch('/projects/assignments'),
      ]);

      setProjects(projRes.projects || []);
      setUsers(userRes.users || []);
      setAssignments(assignRes.assignments || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to load project assignment data.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Validation
    if (!selectedProjectId) {
      setFeedback({ type: 'error', message: 'Please select a Project from the list.' });
      return;
    }
    if (!selectedUserId) {
      setFeedback({ type: 'error', message: 'Please select a User to assign the project to.' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiFetch('/projects/assign', {
        method: 'POST',
        body: JSON.stringify({
          projectId: selectedProjectId,
          userId: selectedUserId,
          roleTitle: roleTitle.trim() || 'Team Member',
          isLeader,
        }),
      });

      setFeedback({
        type: 'success',
        message: res.message || 'Project successfully assigned to the user!',
      });

      // Reset selection
      setSelectedProjectId('');
      setSelectedUserId('');
      setRoleTitle('Team Member');
      setIsLeader(false);
      setProjectSearch('');
      setUserSearch('');

      // Reload assignments list & projects
      const assignRes = await apiFetch('/projects/assignments');
      setAssignments(assignRes.assignments || []);
      const projRes = await apiFetch('/projects');
      setProjects(projRes.projects || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'An error occurred while creating project assignment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevokeAssignment = async (assignmentId, userName, projectName) => {
    if (!window.confirm(`Are you sure you want to remove assignment of "${userName}" from project "${projectName}"?`)) {
      return;
    }

    try {
      const res = await apiFetch(`/projects/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      setFeedback({
        type: 'success',
        message: res.message || 'Assignment revoked successfully.',
      });
      // Refresh
      const assignRes = await apiFetch('/projects/assignments');
      setAssignments(assignRes.assignments || []);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Failed to revoke assignment.',
      });
    }
  };

  // Filtered dropdown lists
  const filteredProjects = projects.filter((p) => {
    const term = projectSearch.toLowerCase();
    return (
      p.name?.toLowerCase().includes(term) ||
      p.code?.toLowerCase().includes(term) ||
      p.client?.companyName?.toLowerCase().includes(term)
    );
  });

  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term) ||
      u.temporaryClientId?.toLowerCase().includes(term)
    );
  });

  const filteredAssignments = assignments.filter((a) => {
    const term = assignmentSearch.toLowerCase();
    const projName = a.project?.name?.toLowerCase() || '';
    const projCode = a.project?.code?.toLowerCase() || '';
    const userName = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.toLowerCase();
    const adminName = `${a.assignedBy?.firstName || ''} ${a.assignedBy?.lastName || ''}`.toLowerCase();
    const role = a.roleTitle?.toLowerCase() || '';

    return (
      projName.includes(term) ||
      projCode.includes(term) ||
      userName.includes(term) ||
      adminName.includes(term) ||
      role.includes(term)
    );
  });

  const selectedProjectObj = projects.find((p) => p.id === selectedProjectId);
  const selectedUserObj = users.find((u) => u.id === selectedUserId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{
              display: 'inline-flex',
              padding: '0.4rem',
              borderRadius: '8px',
              background: 'rgba(255, 90, 0, 0.12)',
              color: 'var(--primary-blue)',
            }}>
              <FolderKanban size={22} />
            </span>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Direct Project Assignment
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
            Directly assign enterprise client projects to eligible team members. Changes automatically sync to member dashboards and send real-time notifications.
          </p>
        </div>
      </div>

      {/* Alert Banner */}
      {feedback.message && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.12)',
            border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: feedback.type === 'error' ? '#B91C1C' : '#047857',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          {feedback.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <div style={{ flex: 1 }}>{feedback.message}</div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Top Section: Assignment Form Card */}
      <div className="ref-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <UserCheck size={20} style={{ color: 'var(--primary-blue)' }} />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-navy)', margin: 0 }}>
            Assign Project to Team Member
          </h2>
        </div>

        <form onSubmit={handleAssignProject}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Step 1: Select Project */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.4rem' }}>
                1. Select Project <span style={{ color: '#EF4444' }}>*</span>
              </label>
              
              {/* Search input for Project */}
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Filter projects by title, code or client..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* Project Select */}
              <select
                className="form-input"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', fontWeight: selectedProjectId ? 600 : 400 }}
                required
              >
                <option value="">-- Choose an Existing Project ({filteredProjects.length}) --</option>
                {filteredProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code}) • [{p.status.replace(/_/g, ' ')}] {p.client?.companyName ? `• ${p.client.companyName}` : ''}
                  </option>
                ))}
              </select>

              {/* Selected Project Summary Pill */}
              {selectedProjectObj && (
                <div style={{
                  marginTop: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong>{selectedProjectObj.name}</strong> (Code: <code>{selectedProjectObj.code}</code>)
                  </div>
                  <span className={`badge ${selectedProjectObj.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-success'}`}>
                    {selectedProjectObj.status.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Select User */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.4rem' }}>
                2. Select User (Eligible Personnel) <span style={{ color: '#EF4444' }}>*</span>
              </label>

              {/* Search input for User */}
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Filter users by name, email or role..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* User Select */}
              <select
                className="form-input"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={{ width: '100%', fontWeight: selectedUserId ? 600 : 400 }}
                required
              >
                <option value="">-- Choose an Eligible User ({filteredUsers.length}) --</option>
                {filteredUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} — Role: {u.role} (ID: {u.temporaryClientId || u.id.slice(0, 8)})
                  </option>
                ))}
              </select>

              {/* Selected User Summary Pill */}
              {selectedUserObj && (
                <div style={{
                  marginTop: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.78rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <strong>{selectedUserObj.firstName} {selectedUserObj.lastName}</strong> ({selectedUserObj.email})
                  </div>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                    {selectedUserObj.role.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>

            {/* Step 3: Assignment Role & Options */}
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', alignItems: 'flex-end', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Assignment Role / Designation in Project
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lead Developer, Frontend Engineer, QA, Specialist"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isLeaderCheckbox"
                  checked={isLeader}
                  onChange={(e) => {
                    setIsLeader(e.target.checked);
                    if (e.target.checked && roleTitle === 'Team Member') {
                      setRoleTitle('Team Leader');
                    }
                  }}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
                />
                <label htmlFor="isLeaderCheckbox" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--dark-navy)', cursor: 'pointer' }}>
                  Assign as Project Team Leader
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submitting || !selectedProjectId || !selectedUserId}
                  className="btn-primary"
                  style={{
                    padding: '0.75rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  {submitting ? (
                    'Processing Assignment...'
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Assign Project
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Section: Existing Project Assignments Table */}
      <div className="ref-card" style={{ padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-navy)', margin: 0 }}>
              Active Project Assignments ({assignments.length})
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0' }}>
              Full audit trail of all project assignments, responsible Admin, and assigned team members.
            </p>
          </div>

          {/* Table Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search assignments..."
              value={assignmentSearch}
              onChange={(e) => setAssignmentSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.2rem', fontSize: '0.82rem' }}
            />
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading assignments list...
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
            No project assignments found matching your search.
          </div>
        ) : (
          <div className="data-table-container" style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>PROJECT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>ASSIGNED TO (USER)</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>ROLE / TITLE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>ASSIGNED BY (ADMIN)</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>ASSIGNED DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)' }}>PROJECT STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((a) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    {/* Project */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--dark-navy)' }}>{a.project?.name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Code: <code>{a.project?.code}</code>
                      </div>
                    </td>

                    {/* Assigned To User */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: 'rgba(255, 90, 0, 0.1)',
                          color: 'var(--primary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}>
                          {(a.user?.firstName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {a.user?.firstName} {a.user?.lastName}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            {a.user?.email} • <span style={{ textTransform: 'capitalize' }}>{a.user?.role?.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Title */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${a.isLeader ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '0.76rem' }}>
                        {a.roleTitle || (a.isLeader ? 'Team Leader' : 'Team Member')}
                      </span>
                    </td>

                    {/* Assigned By Admin */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {a.assignedBy ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>
                            {a.assignedBy.firstName} {a.assignedBy.lastName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Admin ({a.assignedBy.email})
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>System / Initial Creation</span>
                      )}
                    </td>

                    {/* Assigned Date */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        {new Date(a.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>

                    {/* Project Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${a.project?.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-success'}`}>
                        {a.project?.status?.replace(/_/g, ' ') || 'ACTIVE'}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleRevokeAssignment(a.id, `${a.user?.firstName} ${a.user?.lastName}`, a.project?.name)}
                        className="btn-danger"
                        title="Revoke Assignment"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Trash2 size={13} /> Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
