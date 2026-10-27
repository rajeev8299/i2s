import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Briefcase, Plus, Search, Filter, Calendar, Users, CheckCircle2 } from 'lucide-react';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);

  const [projectForm, setProjectForm] = useState({
    clientId: '',
    name: '',
    code: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    budget: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pData, cData] = await Promise.all([
        apiFetch('/projects'),
        ['SUPER_ADMIN', 'ADMIN'].includes(user?.role) ? apiFetch('/clients').catch(() => ({ clients: [] })) : { clients: [] },
      ]);
      setProjects(pData.projects || []);
      setClients(cData.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify(projectForm),
      });
      setShowModal(false);
      setProjectForm({ clientId: '', name: '', code: '', description: '', priority: 'MEDIUM', deadline: '', budget: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchSearch = `${p.name} ${p.code} ${p.client?.companyName}`.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter ? p.priority === priorityFilter : true;
    return matchSearch && matchPriority;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Project Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Enterprise client software projects, milestones, progress tracking, and deliverables.
          </p>
        </div>
        {['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Create Project
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="ref-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects by name, code or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        <select
          className="form-input"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ width: '200px' }}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
      </div>

      {/* Project Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {filteredProjects.length === 0 ? (
          <div className="ref-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No projects found matching the criteria.
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div key={p.id} className="ref-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark-navy)' }}>{p.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Client: <strong>{p.client?.companyName}</strong> • Code: <code>{p.code}</code>
                  </div>
                </div>
                <span className={`badge ${p.status === 'IN_PROGRESS' ? 'badge-info' : 'badge-success'}`}>
                  {p.status.replace(/_/g, ' ')}
                </span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                {p.description || 'Enterprise software architecture and infrastructure modernization project.'}
              </p>

              {/* Progress */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>Delivery Progress</span>
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{p.progress}%</span>
                </div>
                <div style={{ height: '7px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${p.progress}%`, background: 'var(--primary-blue)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Due: <strong>{new Date(p.deadline).toISOString().slice(0, 10)}</strong>
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  Tasks: <strong>{p._count?.tasks || 0}</strong>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 38, 63, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem'
        }}>
          <div className="ref-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1.25rem' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Client Organization</label>
                <select
                  required
                  className="form-input"
                  value={projectForm.clientId}
                  onChange={(e) => setProjectForm({ ...projectForm, clientId: e.target.value })}
                >
                  <option value="">Select Client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Project Name</label>
                  <input
                    required
                    className="form-input"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Project Code</label>
                  <input
                    placeholder="PRJ-XXXX"
                    className="form-input"
                    value={projectForm.code}
                    onChange={(e) => setProjectForm({ ...projectForm, code: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Priority</label>
                  <select
                    className="form-input"
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
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
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Description</label>
                <textarea
                  rows={2}
                  className="form-input"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
