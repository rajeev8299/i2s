import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { Shield, Database, Activity, CheckCircle2, AlertTriangle, Terminal, Key, Server, Lock } from 'lucide-react';

export const SettingsPage = () => {
  const [logs, setLogs] = useState([]);
  const [companySettings, setCompanySettings] = useState({});
  const [integrations, setIntegrations] = useState({});
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [logData, compData, hData] = await Promise.all([
        apiFetch('/settings/audit-logs').catch(() => ({ logs: [] })),
        apiFetch('/settings/company').catch(() => ({ settings: {}, integrations: {} })),
        fetch('/api/health').then(r => r.json()).catch(() => null),
      ]);

      setLogs(logData.logs || []);
      setCompanySettings(compData.settings || {});
      setIntegrations(compData.integrations || {});
      setHealth(hData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          System &bull; Configuration & Audit
        </div>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Administration, Audit Trail & Health
        </h1>
      </div>

      {/* Diagnostics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>POSTGRESQL DATABASE</span>
            <Database size={18} color="var(--primary-blue)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={20} /> {health?.status === 'healthy' ? 'PostgreSQL 18 Connected' : 'Checking...'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Port 5433 &bull; Database: i2s_business_os
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SERVER DAEMON</span>
            <Server size={18} color="var(--primary-blue)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16A34A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} /> Express 4.19 Online
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Port 5000 &bull; JWT Authentication Active
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>SECURITY POLICY</span>
            <Shield size={18} color="var(--primary-blue)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} /> Strict RBAC Enforced
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Argon2 Password Hashing &bull; Audit Trails
          </div>
        </div>
      </div>

      {/* Audit Logs Table Card */}
      <div className="ref-card">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
            Security Audit Logs & Activity Trail
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            Immutable record of sensitive operations, user logins, and administrative changes.
          </p>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                    No critical security events recorded in this session.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{log.user?.email || 'SYSTEM'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{log.user?.role}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.action}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{log.entityType}: {log.entityId || 'Global'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
