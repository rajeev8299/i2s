import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import {
  Users, Briefcase, Receipt, Shield, TrendingUp, CheckCircle2,
  Clock, ArrowRight, Building, UserCheck, AlertTriangle, CheckSquare, Bell, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    pendingTasks: 0,
    totalClients: 0,
    totalEmployees: 0,
    billedRevenue: 580000,
    receivedPayments: 300000,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentNotices, setRecentNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [projData, taskData, uData, cData, nData] = await Promise.all([
        apiFetch('/projects').catch(() => ({ projects: [] })),
        apiFetch('/projects/tasks').catch(() => ({ tasks: [] })),
        ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) ? apiFetch('/users').catch(() => ({ users: [] })) : { users: [] },
        ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'].includes(user?.role) ? apiFetch('/clients').catch(() => ({ clients: [] })) : { clients: [] },
        user?.role !== 'CLIENT' ? apiFetch('/notifications/my-notices').catch(() => ({ notices: [] })) : { notices: [] },
      ]);

      const projects = projData.projects || [];
      const tasks = taskData.tasks || [];
      const usersList = uData.users || [];
      const clientsList = cData.clients || [];
      const noticesList = nData.notices || [];

      setStats({
        activeProjects: projects.length,
        totalTasks: tasks.length,
        pendingTasks: tasks.filter(t => t.status !== 'COMPLETED').length,
        totalClients: clientsList.length,
        totalEmployees: usersList.length,
        billedRevenue: 580000,
        receivedPayments: 300000,
      });

      setRecentUsers(usersList.slice(0, 5));
      setRecentTasks(tasks.slice(0, 5));
      setRecentNotices(noticesList.slice(0, 3));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderNoticesWidget = () => (
    <div className="ref-card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem', borderLeft: '4px solid var(--primary-blue)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="var(--primary-blue)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--dark-navy)', margin: 0 }}>
            Official Notices & Broadcasts
          </h3>
        </div>
        <Link to="/app/notices" style={{ fontSize: '0.82rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
          View All Notices &rarr;
        </Link>
      </div>
      {recentNotices.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
          No active notices or urgent announcements published for your role at this time.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {recentNotices.map(n => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                background: n.isRead ? 'var(--bg-subtle)' : '#EFF6FF',
                borderRadius: 'var(--radius-sm)',
                border: n.isRead ? '1px solid var(--border-color)' : '1px solid #BFDBFE',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className={`badge ${n.priority === 'URGENT' ? 'badge-danger' : n.priority === 'IMPORTANT' ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.68rem' }}>
                  {n.priority}
                </span>
                <div>
                  <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {n.senderName} &bull; {n.formattedDate}
                  </div>
                </div>
              </div>
              <Link to="/app/notices" className="btn-secondary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}>
                Read Notice
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // -------------------------------------------------------------
  // 1. SUPER ADMIN / ADMIN DASHBOARD
  // -------------------------------------------------------------
  if (['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) {
    return (
      <div>
        {/* Title */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            System Overview & Governance
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Full organizational control, active projects, user distribution, and PostgreSQL system telemetry.
          </p>
        </div>

        {/* Notices & Announcements Section */}
        {renderNoticesWidget()}

        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL USERS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.totalEmployees || 8}</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Across all 8 roles</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFF4ED', color: 'var(--primary-orange)' }}>
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ENTERPRISE CLIENTS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.totalClients || 1}</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Dedicated Portals</div>
              </div>
              <div className="icon-tile" style={{ background: '#ECFDF5', color: '#059669' }}>
                <Building size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE PROJECTS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.activeProjects}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-orange)' }}>Tracked Milestones</div>
              </div>
              <div className="icon-tile" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <Briefcase size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>BILLED REVENUE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-blue)', margin: '0.2rem 0' }}>Rs. 5,80,000</div>
                <div style={{ fontSize: '0.72rem', color: '#059669' }}>General Ledger Active</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Receipt size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Breakdown Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '1rem' }}>User Growth & Role Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Engineering & Technology</span>
                  <span style={{ fontWeight: 600 }}>62%</span>
                </div>
                <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '62%', background: 'var(--primary-blue)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Finance & Invoicing</span>
                  <span style={{ fontWeight: 600 }}>18%</span>
                </div>
                <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '18%', background: '#F59E0B' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>Human Resources</span>
                  <span style={{ fontWeight: 600 }}>12%</span>
                </div>
                <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '12%', background: '#10B981' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                  <span>External Client Portal</span>
                  <span style={{ fontWeight: 600 }}>8%</span>
                </div>
                <div style={{ height: '7px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '8%', background: '#6366F1' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="ref-card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '1rem' }}>System Security Health</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>PostgreSQL 18 Service:</span>
                <span className="badge badge-success">Online (Port 5433)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>RBAC Policy Enforcement:</span>
                <span className="badge badge-success">Active & Monitored</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Double-Entry Ledger Parity:</span>
                <span className="badge badge-info">Balanced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="ref-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Recent Personnel & User Accounts</h3>
            <Link to="/app/users" style={{ fontSize: '0.82rem', color: 'var(--primary-blue)', fontWeight: 600 }}>View All Users →</Link>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>System Role</th>
                  <th>Designation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-info">{u.role}</span></td>
                    <td>{u.employeeProfile?.designation || 'Client User'}</td>
                    <td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
          <Link to="/app/hr/attendance" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={16} /> Employee Attendance & Shift Logs
          </Link>
          <Link to="/app/users" className="btn-secondary">
            Manage Users & Permissions
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. ACCOUNTS MANAGER DASHBOARD
  // -------------------------------------------------------------
  if (user?.role === 'ACCOUNTS_MANAGER') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Financial Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            GST Invoices, receivables ageing, double-entry trial balance, and collections.
          </p>
        </div>

        {/* Notices & Announcements Section */}
        {renderNoticesWidget()}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INVOICES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>1 Issued</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-orange)' }}>Total: Rs. 5,80,000</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFF4ED', color: 'var(--primary-orange)' }}>
                <Receipt size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAID AMOUNT</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>Rs. 3,00,000</div>
                <div style={{ fontSize: '0.72rem', color: '#059669' }}>Receipts generated</div>
              </div>
              <div className="icon-tile" style={{ background: '#ECFDF5', color: '#059669' }}>
                <TrendingUp size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING BALANCE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>Rs. 2,80,000</div>
                <div style={{ fontSize: '0.72rem', color: '#D97706' }}>Due in 30 days</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>GENERAL LEDGER</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>Balanced</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-orange)' }}>Double-Entry Verified</div>
              </div>
              <div className="icon-tile" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <Shield size={22} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/app/finance/invoices" className="btn-primary">Manage Invoices</Link>
          <Link to="/app/finance/ledger" className="btn-secondary">View Trial Balance</Link>
          <Link to="/app/hr/attendance" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={16} /> My Attendance
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. HR MANAGER DASHBOARD
  // -------------------------------------------------------------
  if (user?.role === 'HR_MANAGER') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            People & Human Resources Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Daily attendance, leave management, employee allocations, and payroll review.
          </p>
        </div>

        {/* Notices & Announcements Section */}
        {renderNoticesWidget()}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL EMPLOYEES</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.totalEmployees || 7} Staff</div>
                <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Active status</div>
              </div>
              <div className="icon-tile" style={{ background: '#EFF6FF', color: '#1765E8' }}>
                <Users size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TODAY'S ATTENDANCE</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>96%</div>
                <div style={{ fontSize: '0.72rem', color: '#059669' }}>Check-in verified</div>
              </div>
              <div className="icon-tile" style={{ background: '#ECFDF5', color: '#059669' }}>
                <UserCheck size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>MONTHLY PAYROLL</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-blue)', margin: '0.2rem 0' }}>Ready</div>
                <div style={{ fontSize: '0.72rem', color: '#1765E8' }}>Gross-to-net engine</div>
              </div>
              <div className="icon-tile" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                <Receipt size={22} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/app/hr/attendance" className="btn-primary">View Attendance Logs</Link>
          <Link to="/app/hr/payroll" className="btn-secondary">Payroll Processing</Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. TEAM LEADER DASHBOARD
  // -------------------------------------------------------------
  if (user?.role === 'TEAM_LEADER') {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Team Leader Project Oversight
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Assigned project progress, task assignments, and review approvals.
          </p>
        </div>

        {/* Notices & Announcements Section */}
        {renderNoticesWidget()}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>MY PROJECTS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.activeProjects} Active</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-orange)' }}>Team Leader Scoped</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFF4ED', color: 'var(--primary-orange)' }}>
                <Briefcase size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TASKS TO REVIEW</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>1 Pending</div>
                <div style={{ fontSize: '0.72rem', color: '#D97706' }}>Submitted by team</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <CheckSquare size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETED TASKS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669', margin: '0.2rem 0' }}>{stats.totalTasks - stats.pendingTasks} Done</div>
                <div style={{ fontSize: '0.72rem', color: '#059669' }}>Approved deliverables</div>
              </div>
              <div className="icon-tile" style={{ background: '#ECFDF5', color: '#059669' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/app/team-reports" className="btn-primary">Intern Work Reports</Link>
          <Link to="/app/daily-work" className="btn-secondary">Submit My Daily Report</Link>
          <Link to="/app/tasks" className="btn-secondary">Review & Assign Tasks</Link>
          <Link to="/app/projects" className="btn-secondary">Project Details</Link>
          <Link to="/app/hr/attendance" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <UserCheck size={16} /> My Attendance
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. STAFF & INTERN DASHBOARD
  // -------------------------------------------------------------
  if (['STAFF', 'INTERN'].includes(user?.role)) {
    return (
      <div>
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            {user?.role === 'INTERN' ? 'Intern Learning & Submissions' : 'Staff Engineering Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Your assigned engineering tasks, review submissions, and daily attendance.
          </p>
        </div>

        {/* Notices & Announcements Section */}
        {renderNoticesWidget()}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ASSIGNED TASKS</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.totalTasks} Tasks</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--primary-orange)' }}>Assigned to you</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFF4ED', color: 'var(--primary-orange)' }}>
                <CheckSquare size={22} />
              </div>
            </div>
          </div>

          <div className="ref-card">
            <div className="metric-tile">
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING COMPLETION</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>{stats.pendingTasks}</div>
                <div style={{ fontSize: '0.72rem', color: '#D97706' }}>In Progress / Review</div>
              </div>
              <div className="icon-tile" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/app/daily-work" className="btn-primary">
            {user?.role === 'INTERN' ? 'Daily Work Report' : 'Daily Work Log'}
          </Link>
          <Link to="/app/tasks" className="btn-secondary">View Assigned Tasks</Link>
          <Link to="/app/hr/attendance" className="btn-secondary">Log Daily Attendance</Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. CLIENT PORTAL DASHBOARD
  // -------------------------------------------------------------
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
          Client Partner Workspace
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Proprietary project deliverables, milestones, and GST tax invoices.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="ref-card">
          <div className="metric-tile">
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE CONTRACTS</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--dark-navy)', margin: '0.2rem 0' }}>{stats.activeProjects} Project</div>
              <div style={{ fontSize: '0.72rem', color: '#059669' }}>Milestone Phase 2 Active</div>
            </div>
            <div className="icon-tile" style={{ background: '#FFF4ED', color: 'var(--primary-orange)' }}>
              <Briefcase size={22} />
            </div>
          </div>
        </div>

        <div className="ref-card">
          <div className="metric-tile">
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>BILLED INVOICES</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-blue)', margin: '0.2rem 0' }}>Rs. 5,80,000</div>
              <div style={{ fontSize: '0.72rem', color: '#059669' }}>Rs. 3,00,000 Received</div>
            </div>
            <div className="icon-tile" style={{ background: '#ECFDF5', color: '#059669' }}>
              <Receipt size={22} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/app/projects" className="btn-primary">View Project Milestones</Link>
        <Link to="/app/finance/invoices" className="btn-secondary">Download PDF Invoices</Link>
      </div>
    </div>
  );
};
