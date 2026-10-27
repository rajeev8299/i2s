import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { CheckSquare, Plus, Clock, CheckCircle2, AlertCircle, Search, Filter } from 'lucide-react';

export const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVED');
  const [reviewFeedback, setReviewFeedback] = useState('');

  const [taskForm, setTaskForm] = useState({
    projectId: '',
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    assigneeId: '',
    isClientVisible: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tData, pData] = await Promise.all([
        apiFetch('/projects/tasks'),
        apiFetch('/projects'),
      ]);
      setTasks(tData.tasks || []);
      setProjects(pData.projects || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/projects/tasks', {
        method: 'POST',
        body: JSON.stringify(taskForm),
      });
      setShowTaskModal(false);
      setTaskForm({
        projectId: '',
        title: '',
        description: '',
        priority: 'MEDIUM',
        deadline: '',
        assigneeId: '',
        isClientVisible: true,
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStatusTransition = async (taskId, newStatus, extra = {}) => {
    try {
      await apiFetch(`/projects/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, ...extra }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    await handleStatusTransition(selectedTask.id, reviewAction, { reviewFeedback });
    setShowReviewModal(false);
    setSelectedTask(null);
    setReviewFeedback('');
  };

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = `${t.title} ${t.project?.name}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Tasks & Quality Approvals
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Multi-stage engineering lifecycle: To-Do → In Progress → Review → Approved → Completed.
          </p>
        </div>
        {['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'].includes(user?.role) && (
          <button onClick={() => setShowTaskModal(true)} className="btn-primary">
            <Plus size={16} /> Assign New Task
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="ref-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search tasks by title or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: '220px' }}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To-Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="SUBMITTED_FOR_REVIEW">Submitted For Review</option>
          <option value="APPROVED">Approved</option>
          <option value="CHANGES_REQUESTED">Changes Requested</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task Title & Deliverables</th>
              <th>Project</th>
              <th>Assignee & Reviewer</th>
              <th>Priority</th>
              <th>Workflow Status</th>
              <th>Deadline</th>
              <th>Action Workflow</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No tasks found matching filter criteria.
                </td>
              </tr>
            ) : (
              filteredTasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--dark-navy)' }}>{t.title}</div>
                    {t.submissionNotes && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', marginTop: '2px' }}>
                        Note: {t.submissionNotes}
                      </div>
                    )}
                    {t.reviewFeedback && (
                      <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '2px' }}>
                        Feedback: {t.reviewFeedback}
                      </div>
                    )}
                  </td>
                  <td>{t.project?.name}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{t.assignee?.firstName || 'Unassigned'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Reviewer: {t.reviewer?.firstName || 'None'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${t.priority === 'URGENT' ? 'badge-danger' : t.priority === 'HIGH' ? 'badge-warning' : 'badge-info'}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      t.status === 'COMPLETED' ? 'badge-success' :
                      t.status === 'APPROVED' ? 'badge-success' :
                      t.status === 'SUBMITTED_FOR_REVIEW' ? 'badge-warning' :
                      t.status === 'CHANGES_REQUESTED' ? 'badge-danger' : 'badge-info'
                    }`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {new Date(t.deadline).toISOString().slice(0, 10)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {t.status === 'TODO' && (t.assigneeId === user?.id || ['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) && (
                        <button
                          onClick={() => handleStatusTransition(t.id, 'IN_PROGRESS')}
                          className="btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                        >
                          Start Work
                        </button>
                      )}

                      {t.status === 'IN_PROGRESS' && (t.assigneeId === user?.id || ['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) && (
                        <button
                          onClick={() => {
                            const notes = prompt('Enter submission deliverables / notes:');
                            if (notes !== null) {
                              handleStatusTransition(t.id, 'SUBMITTED_FOR_REVIEW', { submissionNotes: notes });
                            }
                          }}
                          className="btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                        >
                          Submit Review
                        </button>
                      )}

                      {t.status === 'SUBMITTED_FOR_REVIEW' && ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'].includes(user?.role) && (
                        <button
                          onClick={() => {
                            setSelectedTask(t);
                            setShowReviewModal(true);
                          }}
                          className="btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', background: '#D97706' }}
                        >
                          Review & Decide
                        </button>
                      )}

                      {t.status === 'APPROVED' && ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'].includes(user?.role) && (
                        <button
                          onClick={() => handleStatusTransition(t.id, 'COMPLETED')}
                          className="btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', borderColor: '#10B981', color: '#059669' }}
                        >
                          Mark Complete
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

      {/* Review Modal */}
      {showReviewModal && selectedTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 38, 63, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="ref-card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>Review Task Deliverable</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Task: {selectedTask.title} (Submitted by {selectedTask.assignee?.firstName})
            </p>

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Decision</label>
                <select
                  className="form-input"
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                >
                  <option value="APPROVED">Approve Deliverable</option>
                  <option value="CHANGES_REQUESTED">Request Changes / Revision</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Reviewer Feedback</label>
                <textarea
                  required
                  rows={3}
                  className="form-input"
                  placeholder="Specific approval or change request notes..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Submit Outcome</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showTaskModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 38, 63, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="ref-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '1.25rem' }}>Assign New Task</h2>
            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Project</label>
                <select
                  required
                  className="form-input"
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Task Title</label>
                <input
                  required
                  className="form-input"
                  placeholder="Task title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Priority</label>
                  <select
                    className="form-input"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Deadline</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Assign Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
