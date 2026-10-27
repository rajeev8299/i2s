import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Calendar, CheckCircle2, Clock, ExternalLink,
  Layers, ShieldCheck, FileText, ChevronRight, Award
} from 'lucide-react';

export const ClientProgressPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectData, setProjectData] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadTimeline(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const data = await apiFetch('/projects');
      const projs = data.projects || [];
      setProjects(projs);
      if (projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async (pId) => {
    try {
      const data = await apiFetch(`/reports/client-progress/${pId}`);
      setProjectData(data.project);
      setUpdates(data.updates || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Client Partner Portal &bull; Daily Accountability
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Daily Project Progress & Milestones
          </h1>
        </div>

        {projects.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Switch Project:</span>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="search-input"
              style={{ width: 'auto', fontWeight: 600 }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Project Status Summary Card */}
      {projectData && (
        <div className="ref-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {projectData.name}
              </h2>
              <span className="badge badge-info">{projectData.status}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 0.5rem' }}>
              {projectData.description || 'Enterprise Technology Deliverable for Imagination2Software client.'}
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Project Code: <strong style={{ fontFamily: 'monospace' }}>{projectData.code}</strong> &bull; Deadline: {new Date(projectData.deadline).toLocaleDateString()}
            </div>
          </div>

          <div style={{ minWidth: '180px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ fontWeight: 600 }}>Overall Progress</span>
              <span style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>{projectData.progress || 65}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${projectData.progress || 65}%`, height: '100%', background: 'var(--primary-blue)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Daily Progress Timeline */}
      <div className="ref-card">
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            Approved Daily Progress Timeline
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Chronological log of verified daily work updates and completed deliverables.
          </p>
        </div>

        {updates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-secondary)' }}>
            <Clock size={32} color="var(--primary-blue)" style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>No daily updates published yet</div>
            <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0.4rem auto 0' }}>
              Our engineering team is actively working on your project deliverables. Daily progress summaries approved by your Team Leader will appear here.
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: 'var(--border-color)' }} />

            {updates.map((up) => (
              <div key={up.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {/* Timeline node */}
                <div style={{
                  position: 'absolute',
                  left: '-1.5rem',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'var(--primary-blue)',
                  border: '3px solid #FFFFFF',
                  boxShadow: '0 0 0 2px var(--primary-light)',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {new Date(up.updateDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
                      {up.title}
                    </h4>
                  </div>
                  <span className="badge badge-success">{up.currentStatus}</span>
                </div>

                <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>Completed Today:</strong>
                    <p style={{ margin: '0.25rem 0 0', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                      {up.completedToday}
                    </p>
                  </div>

                  {up.nextSteps && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Next Steps:</strong>
                      <p style={{ margin: '0.2rem 0 0', color: 'var(--text-primary)' }}>{up.nextSteps}</p>
                    </div>
                  )}

                  {up.deliverableLinks && (
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)' }}>
                      <strong style={{ color: 'var(--text-secondary)' }}>Deliverable Reference:</strong>{' '}
                      <a href={up.deliverableLinks} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {up.deliverableLinks} <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgressPage;
