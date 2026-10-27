import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, UserPlus, Search, Shield, Building, ToggleLeft, ToggleRight,
  Mail, Phone, Briefcase, Key, Edit, Trash2, CheckCircle2, AlertCircle,
  Sliders, Save, RefreshCw, Lock
} from 'lucide-react';

const SYSTEM_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'STAFF',
  'INTERN',
  'CLIENT',
  'ACCOUNTS_MANAGER',
  'HR_MANAGER',
  'TEAM_LEADER',
];

const PERMISSION_MODULES = [
  { id: 'dashboard', label: 'Dashboard Overview', actions: ['view'] },
  { id: 'users', label: 'User Management', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'clients', label: 'Client Accounts', actions: ['view', 'create', 'edit', 'manage'] },
  { id: 'projects', label: 'Project Tracking', actions: ['view', 'create', 'edit', 'assign'] },
  { id: 'tasks', label: 'Tasks & Code Reviews', actions: ['view', 'create', 'edit', 'assign', 'review'] },
  { id: 'finance', label: 'Finance & Invoices', actions: ['view', 'create', 'edit', 'approve'] },
  { id: 'hr', label: 'HR & Personnel', actions: ['view', 'create', 'edit', 'manage'] },
  { id: 'payroll', label: 'Payroll Operations', actions: ['view', 'process', 'approve'] },
  { id: 'reports', label: 'Reports & Analytics', actions: ['view', 'export'] },
  { id: 'settings', label: 'System Configuration', actions: ['view', 'edit'] },
];

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('ALL'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'DEACTIVATED'
  const [approvalSearch, setApprovalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'users', or 'permissions'
  const [loading, setLoading] = useState(true);

  // Approvals & Role Assignment Modal State
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalTargetUser, setApprovalTargetUser] = useState(null);
  const [approvalDecision, setApprovalDecision] = useState('APPROVED'); // 'APPROVED' or 'REJECTED'
  const [approvalRole, setApprovalRole] = useState('CLIENT');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalDepartmentId, setApprovalDepartmentId] = useState('');
  const [approvalDesignation, setApprovalDesignation] = useState('');
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempPasswordNotice, setTempPasswordNotice] = useState(null);

  // Permission Matrix State
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState('ADMIN');
  const [permissionOverrides, setPermissionOverrides] = useState([]);
  const [savingPerm, setSavingPerm] = useState(false);

  // User form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STAFF',
    phone: '',
    employeeCode: '',
    designation: '',
    departmentId: '',
    baseSalary: '',
    clientCompanyName: '',
  });

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    role: 'STAFF',
    phone: '',
    designation: '',
    departmentId: '',
    baseSalary: '',
    clientCompanyName: '',
  });

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  useEffect(() => {
    if (activeTab === 'permissions') {
      loadPermissions();
    }
  }, [activeTab]);

  const loadData = async () => {
    try {
      const query = roleFilter ? `?role=${roleFilter}` : '';
      const [uData, dData] = await Promise.all([
        apiFetch(`/users${query}`),
        apiFetch('/users/departments'),
      ]);
      setUsers(uData.users || []);
      setDepartments(dData.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const data = await apiFetch('/users/roles/permissions');
      setPermissionOverrides(data.permissions || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'STAFF',
        phone: '',
        employeeCode: '',
        designation: '',
        departmentId: '',
        baseSalary: '',
        clientCompanyName: '',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await apiFetch(`/users/${selectedUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData),
      });
      setShowEditModal(false);
      setSelectedUser(null);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await apiFetch(`/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Reset password for ${user.firstName} ${user.lastName} (${user.email})?`)) {
      return;
    }
    try {
      const res = await apiFetch(`/users/${user.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setTempPasswordNotice({ email: user.email, tempPass: res.tempPassword });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteSafe = async (user) => {
    if (!window.confirm(`Safely deactivate ${user.firstName} ${user.lastName}? Historical projects, tasks, and audit logs will be preserved.`)) {
      return;
    }
    try {
      await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const openApprovalModal = (u) => {
    setApprovalTargetUser(u);
    setApprovalDecision(u.approvalStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setApprovalRole(u.role || 'CLIENT');
    setApprovalNotes(u.approvalNotes || '');
    setApprovalDepartmentId(u.employeeProfile?.departmentId || '');
    setApprovalDesignation(u.employeeProfile?.designation || '');
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    if (!approvalTargetUser) return;
    try {
      setApprovalSubmitting(true);
      await apiFetch(`/users/${approvalTargetUser.id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({
          decision: approvalDecision,
          role: approvalRole,
          notes: approvalNotes,
          departmentId: approvalDepartmentId || undefined,
          designation: approvalDesignation || undefined,
        }),
      });
      setShowApprovalModal(false);
      setApprovalTargetUser(null);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setApprovalSubmitting(false);
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditFormData({
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      role: u.role || 'STAFF',
      phone: u.phone || '',
      designation: u.employeeProfile?.designation || '',
      departmentId: u.employeeProfile?.departmentId || '',
      baseSalary: u.employeeProfile?.baseSalary || '',
      clientCompanyName: u.clientProfile?.companyName || '',
    });
    setShowEditModal(true);
  };

  const isPermissionEnabled = (role, module, action) => {
    if (role === 'SUPER_ADMIN') return true;

    // Check dynamic overrides
    const override = permissionOverrides.find(
      (p) => p.role === role && p.module === module && p.action === action
    );
    if (override) return override.isAllowed;

    // Fallback default role access
    if (role === 'ADMIN') return true;
    if (role === 'STAFF' && (module === 'projects' || module === 'tasks' || module === 'dashboard')) return true;
    if (role === 'INTERN' && (module === 'tasks' || module === 'dashboard')) return true;
    if (role === 'CLIENT' && (module === 'dashboard' || (module === 'projects' && action === 'view') || (module === 'finance' && action === 'view'))) return true;
    if (role === 'ACCOUNTS_MANAGER' && (module === 'finance' || module === 'clients' || module === 'dashboard' || module === 'reports')) return true;
    if (role === 'HR_MANAGER' && (module === 'hr' || module === 'payroll' || module === 'users' || module === 'dashboard' || module === 'reports')) return true;
    if (role === 'TEAM_LEADER' && (module === 'projects' || module === 'tasks' || module === 'dashboard' || module === 'reports')) return true;

    return false;
  };

  const handleTogglePermission = async (role, module, action, currentVal) => {
    if (role === 'SUPER_ADMIN') {
      alert('Super Admin permissions are full and permanent.');
      return;
    }
    if (currentUser?.role !== 'SUPER_ADMIN') {
      alert('Only Super Admin can edit the global role permission matrix.');
      return;
    }

    try {
      setSavingPerm(true);
      await apiFetch('/users/roles/permissions', {
        method: 'POST',
        body: JSON.stringify({
          role,
          module,
          action,
          isAllowed: !currentVal,
        }),
      });
      await loadPermissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPerm(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ACTIVE' ? u.isActive : statusFilter === 'INACTIVE' ? !u.isActive : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Administration &bull; Access & Personnel
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Admin Panel — User & Role Management
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['SUPER_ADMIN', 'ADMIN'].includes(currentUser?.role) && (
            <button
              onClick={() => setActiveTab('approvals')}
              className={activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', position: 'relative' }}
            >
              <Shield size={16} /> New User Approvals & Department Assignment
              {users.filter(u => u.approvalStatus === 'PENDING').length > 0 && (
                <span style={{
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                }}>
                  {users.filter(u => u.approvalStatus === 'PENDING').length}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('users')}
            className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Users size={16} /> User Directory
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={activeTab === 'permissions' ? 'btn-primary' : 'btn-secondary'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sliders size={16} /> Permissions Matrix
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <UserPlus size={16} /> Create User Account
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Pending Approvals</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>
              {users.filter(u => u.approvalStatus === 'PENDING').length} Requests
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Accounts</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>{users.length} Users</div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Logins</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>
              {users.filter(u => u.isActive && u.approvalStatus === 'APPROVED').length} Enabled
            </div>
          </div>
        </div>
      </div>

      {/* Temp Password Notice Banner */}
      {tempPasswordNotice && (
        <div style={{
          padding: '1rem 1.25rem',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '0.92rem' }}>
              Password Reset Success for {tempPasswordNotice.email}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#1E40AF', marginTop: '0.2rem' }}>
              Temporary password: <strong style={{ fontFamily: 'monospace', background: '#DBEAFE', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{tempPasswordNotice.tempPass}</strong> (User will be prompted to change upon next login)
            </div>
          </div>
          <button
            onClick={() => setTempPasswordNotice(null)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* VIEW: NEW USER APPROVALS & DEPARTMENT ASSIGNMENT TAB */}
      {activeTab === 'approvals' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                New User Approvals & Department Assignment
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
                Every newly registered user defaults to a Client account and appears here automatically. Authorized Admins can review details, assign departments and primary roles, and activate or reject accounts.
              </p>
            </div>
          </div>

          {/* Search and Status Tabs */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {[
                { id: 'ALL', label: 'All Requests' },
                { id: 'PENDING', label: 'Pending Approval', count: users.filter(u => u.approvalStatus === 'PENDING').length },
                { id: 'APPROVED', label: 'Approved / Active', count: users.filter(u => u.approvalStatus === 'APPROVED' && u.isActive).length },
                { id: 'REJECTED', label: 'Rejected', count: users.filter(u => u.approvalStatus === 'REJECTED').length },
                { id: 'DEACTIVATED', label: 'Deactivated', count: users.filter(u => !u.isActive).length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setApprovalStatusFilter(tab.id)}
                  className={approvalStatusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}
                  style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span style={{
                      background: tab.id === 'PENDING' ? '#EF4444' : 'rgba(0,0,0,0.15)',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '8px'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name, email, client ID..."
                value={approvalSearch}
                onChange={(e) => setApprovalSearch(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '2.4rem', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID / Client ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Registration Date & Time</th>
                  <th>Current Role</th>
                  <th>Assigned Department</th>
                  <th>Account Status</th>
                  <th>Approval Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredList = users.filter((u) => {
                    // Filter by tab
                    if (approvalStatusFilter === 'PENDING' && u.approvalStatus !== 'PENDING') return false;
                    if (approvalStatusFilter === 'APPROVED' && (u.approvalStatus !== 'APPROVED' || !u.isActive)) return false;
                    if (approvalStatusFilter === 'REJECTED' && u.approvalStatus !== 'REJECTED') return false;
                    if (approvalStatusFilter === 'DEACTIVATED' && u.isActive) return false;

                    // Filter by search
                    if (approvalSearch) {
                      const q = approvalSearch.toLowerCase();
                      const matchName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q);
                      const matchEmail = (u.email || '').toLowerCase().includes(q);
                      const matchClientId = (u.temporaryClientId || '').toLowerCase().includes(q);
                      const matchUuid = (u.id || '').toLowerCase().includes(q);
                      if (!matchName && !matchEmail && !matchClientId && !matchUuid) return false;
                    }
                    return true;
                  });

                  if (filteredList.length === 0) {
                    return (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                          No registration records match the selected filter.
                        </td>
                      </tr>
                    );
                  }

                  return filteredList.map((u) => {
                    const isPending = u.approvalStatus === 'PENDING';
                    const isRejected = u.approvalStatus === 'REJECTED';
                    const isApproved = u.approvalStatus === 'APPROVED';

                    return (
                      <tr key={u.id} style={{ background: isPending ? 'rgba(245, 158, 11, 0.04)' : undefined }}>
                        <td>
                          {u.temporaryClientId ? (
                            <span style={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              background: 'rgba(23, 101, 232, 0.1)',
                              color: 'var(--primary-blue)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: '1px solid rgba(23, 101, 232, 0.25)',
                              display: 'inline-block',
                            }}>
                              {u.temporaryClientId}
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {u.id.slice(0, 8)}
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                            {u.firstName} {u.lastName}
                          </div>
                          {u.phone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                              <Phone size={11} /> {u.phone}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Mail size={13} /> {u.email}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            u.role === 'SUPER_ADMIN' ? 'badge-danger' :
                            u.role === 'ADMIN' ? 'badge-warning' :
                            u.role === 'CLIENT' ? 'badge-success' : 'badge-info'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {u.employeeProfile?.department?.name || (u.role === 'CLIENT' ? 'External / Client Portal' : 'Unassigned')}
                          </div>
                          {u.employeeProfile?.designation && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {u.employeeProfile.designation}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>
                        <td>
                          {isPending && (
                            <span className="badge badge-warning" style={{ fontWeight: 700, letterSpacing: '0.02em' }}>
                              PENDING APPROVAL
                            </span>
                          )}
                          {isApproved && (
                            <span className="badge badge-success" style={{ fontWeight: 700 }}>
                              APPROVED
                            </span>
                          )}
                          {isRejected && (
                            <span className="badge badge-danger" style={{ fontWeight: 700 }}>
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => openApprovalModal(u)}
                              className="btn-primary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <Shield size={13} /> Assign Department
                            </button>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className="btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              title="Activate or Deactivate User Login"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 1: USERS DIRECTORY TAB */}
      {activeTab === 'users' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="search-input"
                style={{ width: 'auto' }}
              >
                <option value="">All Roles (8)</option>
                {SYSTEM_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="search-input"
                style={{ width: 'auto' }}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role & Assignment</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No accounts found matching search filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Mail size={12} /> {u.email}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          ID: {u.id.slice(0, 8)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          u.role === 'SUPER_ADMIN' ? 'badge-danger' :
                          u.role === 'ADMIN' ? 'badge-warning' :
                          u.role === 'CLIENT' ? 'badge-success' : 'badge-info'
                        }`}>
                          {u.role}
                        </span>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {u.role === 'CLIENT' ? (u.clientProfile?.companyName || 'Enterprise Client') : (u.employeeProfile?.designation || 'Staff')}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openEditModal(u)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            title="Edit details"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            title="Reset password"
                          >
                            <Key size={13} /> Reset Pass
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                          {currentUser?.role === 'SUPER_ADMIN' && u.id !== currentUser.id && (
                            <button
                              onClick={() => handleDeleteSafe(u)}
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                              title="Deactivate safely"
                            >
                              <Trash2 size={13} />
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
      )}

      {/* VIEW 2: ROLE PERMISSION MATRIX TAB */}
      {activeTab === 'permissions' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Configure fine-grained module privileges for each organizational role.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Select Role:</span>
              <select
                value={selectedRoleForPerms}
                onChange={(e) => setSelectedRoleForPerms(e.target.value)}
                className="search-input"
                style={{ width: 'auto', fontWeight: 600 }}
              >
                {SYSTEM_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedRoleForPerms === 'SUPER_ADMIN' ? (
            <div style={{ padding: '1.5rem', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-sm)', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={20} />
              <div>
                <strong>Super Admin Role Protected:</strong> Super Admin has complete and immutable privileges across all modules, APIs, audit logs, and system operations.
              </div>
            </div>
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    {['view', 'create', 'edit', 'delete', 'assign', 'review', 'approve', 'process', 'export'].map((act) => (
                      <th key={act} style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {act}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERMISSION_MODULES.map((mod) => (
                    <tr key={mod.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {mod.label}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{mod.id}</div>
                      </td>
                      {['view', 'create', 'edit', 'delete', 'assign', 'review', 'approve', 'process', 'export'].map((act) => {
                        const isApplicable = mod.actions.includes(act);
                        const isEnabled = isApplicable && isPermissionEnabled(selectedRoleForPerms, mod.id, act);

                        return (
                          <td key={act} style={{ textAlign: 'center' }}>
                            {isApplicable ? (
                              <input
                                type="checkbox"
                                checked={isEnabled}
                                disabled={savingPerm || currentUser?.role !== 'SUPER_ADMIN'}
                                onChange={() => handleTogglePermission(selectedRoleForPerms, mod.id, act, isEnabled)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            ) : (
                              <span style={{ color: 'var(--border-color)', fontSize: '0.8rem' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '620px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Create New User Account
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Assign role, department, credentials, and initial access permissions.
            </p>

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Work Email / Username *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Role Category *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="search-input"
                  >
                    <option value="STAFF">Staff Specialist</option>
                    <option value="INTERN">Intern</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="ACCOUNTS_MANAGER">Accounts Manager</option>
                    <option value="ADMIN">Admin</option>
                    {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                    <option value="CLIENT">Client Portal Account</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              {formData.role === 'CLIENT' ? (
                <div className="form-group">
                  <label className="form-label">Enterprise Client Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Innovations Pvt Ltd"
                    value={formData.clientCompanyName}
                    onChange={(e) => setFormData({ ...formData, clientCompanyName: e.target.value })}
                    className="search-input"
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <select
                        value={formData.departmentId}
                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                        className="search-input"
                      >
                        <option value="">Select Department...</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Engineer"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        className="search-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Base Monthly Salary (INR)</label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={formData.baseSalary}
                      onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                      className="search-input"
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save & Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Edit User: {selectedUser.email}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Update profile, role privileges, and department assignments.
            </p>

            <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Assigned Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="search-input"
                  >
                    <option value="STAFF">Staff Specialist</option>
                    <option value="INTERN">Intern</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="ACCOUNTS_MANAGER">Accounts Manager</option>
                    <option value="ADMIN">Admin</option>
                    {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                    <option value="CLIENT">Client</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              {editFormData.role !== 'CLIENT' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <select
                      value={editFormData.departmentId}
                      onChange={(e) => setEditFormData({ ...editFormData, departmentId: e.target.value })}
                      className="search-input"
                    >
                      <option value="">None</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      value={editFormData.designation}
                      onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                      className="search-input"
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Approval & Role Assignment Modal */}
      {showApprovalModal && approvalTargetUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
                  New User Approvals & Department Assignment
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Review applicant details, assign primary role and department access, and confirm approval or rejection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
              >
                &times;
              </button>
            </div>

            {/* Applicant Summary Card */}
            <div style={{
              background: 'rgba(23, 101, 232, 0.08)',
              border: '1px solid rgba(23, 101, 232, 0.2)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              fontSize: '0.82rem',
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Applicant Name:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {approvalTargetUser.firstName} {approvalTargetUser.lastName}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Email / User ID:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {approvalTargetUser.email}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Temporary Client ID:</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-blue)', marginTop: '2px' }}>
                  {approvalTargetUser.temporaryClientId || 'N/A (Direct Account)'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Registration Date:</span>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>
                  {new Date(approvalTargetUser.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                <div style={{ marginTop: '2px' }}>
                  <span className={`badge ${
                    approvalTargetUser.approvalStatus === 'PENDING' ? 'badge-warning' :
                    approvalTargetUser.approvalStatus === 'APPROVED' ? 'badge-success' : 'badge-danger'
                  }`}>
                    {approvalTargetUser.approvalStatus}
                  </span>
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Current Role:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {approvalTargetUser.role}
                </div>
              </div>
            </div>

            <form onSubmit={handleApprovalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Approval Decision Selection */}
              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>
                  Approval Action / Decision *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.35rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${approvalDecision === 'APPROVED' ? '#10B981' : 'var(--border-color)'}`,
                    background: approvalDecision === 'APPROVED' ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="APPROVED"
                      checked={approvalDecision === 'APPROVED'}
                      onChange={() => setApprovalDecision('APPROVED')}
                    />
                    <span>Approve & Grant Access</span>
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    border: `1.5px solid ${approvalDecision === 'REJECTED' ? '#EF4444' : 'var(--border-color)'}`,
                    background: approvalDecision === 'REJECTED' ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                  }}>
                    <input
                      type="radio"
                      name="decision"
                      value="REJECTED"
                      checked={approvalDecision === 'REJECTED'}
                      onChange={() => setApprovalDecision('REJECTED')}
                    />
                    <span>Reject Registration</span>
                  </label>
                </div>
              </div>

              {/* Role Assignment Dropdown */}
              {approvalDecision === 'APPROVED' && (
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    Assign Final Role *
                  </label>
                  <select
                    value={approvalRole}
                    onChange={(e) => setApprovalRole(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', fontWeight: 600 }}
                  >
                    <option value="CLIENT">Client</option>
                    <option value="INTERN">Intern</option>
                    <option value="STAFF">Staff Specialist</option>
                    <option value="TEAM_LEADER">Team Leader</option>
                    <option value="ACCOUNTS_MANAGER">Accounts Manager</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="ADMIN">Admin</option>
                    {/* Super Admin security check: Only Super Admin can assign Super Admin */}
                    {currentUser?.role === 'SUPER_ADMIN' && (
                      <option value="SUPER_ADMIN">Super Admin</option>
                    )}
                  </select>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    * Users cannot self-assign roles. Upon approval, their access permissions and dashboard redirect will match this role.
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="btn-secondary"
                  disabled={approvalSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvalSubmitting}
                  className="btn-primary"
                  style={{
                    background: approvalDecision === 'REJECTED' ? '#DC2626' : undefined,
                    borderColor: approvalDecision === 'REJECTED' ? '#DC2626' : undefined,
                  }}
                >
                  {approvalSubmitting
                    ? 'Saving Decision...'
                    : approvalDecision === 'APPROVED'
                    ? 'Confirm Role & Department Assignment'
                    : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
