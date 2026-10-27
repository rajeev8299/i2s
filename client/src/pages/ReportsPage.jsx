import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, TrendingUp, Users, Briefcase, Receipt, DollarSign, Calendar, CheckCircle2, Download } from 'lucide-react';

export const ReportsPage = () => {
  const { user } = useAuth();
  const [financeReports, setFinanceReports] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const [repData, projData, usrData] = await Promise.all([
        apiFetch('/finance/reports').catch(() => null),
        apiFetch('/projects').catch(() => ({ projects: [] })),
        apiFetch('/users').catch(() => ({ users: [] })),
      ]);
      setFinanceReports(repData);
      setProjects(projData.projects || []);
      setUsers(usrData.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Executive &bull; Analytics & Insights
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Reports & Business Intelligence
          </h1>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={16} /> Export Executive Summary
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Projects</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {inProgressProjects} Running
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Delivered Projects</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>
              {completedProjects} Completed
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Active Staff</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>
              {users.length} Team Members
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Project Velocity Breakdown */}
        <div className="ref-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            Project Lifecycle Status
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            Current distribution of pipeline engagements.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>In Progress</span>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 700 }}>{inProgressProjects}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${projects.length ? (inProgressProjects / projects.length) * 100 : 0}%`, height: '100%', background: 'var(--primary-blue)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>Completed & Delivered</span>
                <span style={{ color: '#16A34A', fontWeight: 700 }}>{completedProjects}</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${projects.length ? (completedProjects / projects.length) * 100 : 0}%`, height: '100%', background: '#16A34A' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 600 }}>Planning & Scoping</span>
                <span style={{ color: '#D97706', fontWeight: 700 }}>
                  {projects.filter(p => p.status === 'PLANNING').length}
                </span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${projects.length ? (projects.filter(p => p.status === 'PLANNING').length / projects.length) * 100 : 0}%`, height: '100%', background: '#D97706' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Parity & Health */}
        <div className="ref-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
            Financial Health & Trial Balance
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 1.25rem' }}>
            Balance sheet debit/credit alignment and collection efficiency.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Accounting Method:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Double-entry Accrual</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fiscal Year:</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>2026-2027</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-app)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Compliance:</span>
              <span style={{ fontWeight: 700, color: '#16A34A' }}>GST & TDS Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
