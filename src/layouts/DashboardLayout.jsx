import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import {
  LayoutDashboard, Users, Briefcase, CheckSquare, Receipt,
  UserCheck, Bell, Shield, LogOut, ChevronDown, Check, Building,
  Search, BarChart3, CreditCard, DollarSign, Calendar, Clock, FileCheck, ShoppingBag,
  Video, Menu, X, FolderKanban
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [leaveCount, setLeaveCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  useEffect(() => {
    // Automatically close mobile drawer navigation whenever user changes route
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Prevent background scrolling when mobile sidebar drawer is open
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  useEffect(() => {
    fetchNotifications();
    if (user?.role === 'ADMIN') {
      fetchAdminLeaves();
    }
    const interval = setInterval(() => {
      fetchNotifications();
      if (user?.role === 'ADMIN') {
        fetchAdminLeaves();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchAdminLeaves = async () => {
    try {
      const data = await apiFetch('/hr/leave');
      if (data.success) {
        const list = data.leaveRequests || [];
        setLeaveCount(list.length);
        setPendingLeaveCount(list.filter(l => l.status === 'PENDING').length);
      }
    } catch (e) {}
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch('/notifications');
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      // Ignore background notification fetch errors
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', position: 'relative' }}>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17, 17, 17, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 40,
            display: 'block',
          }}
        />
      )}

      {/* Reference Dark Navy Sidebar */}
      <aside
        className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}
        style={{
          width: '275px',
          background: 'var(--dark-navy)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          color: '#FFFFFF',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Brand */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderBottom: '1px solid var(--dark-navy-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <img
              src="/i2s-logo-light.svg"
              alt="I2S — Imagination2Software"
              style={{
                width: '38px',
                height: '38px',
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 800,
                fontSize: '0.92rem',
                letterSpacing: '-0.01em',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-heading)',
              }}>
                Imagination2Software
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="mobile-sidebar-close"
            style={{
              background: 'transparent',
              color: '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              display: 'none',
              padding: '0.25rem',
            }}
            title="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
            Main Menu
          </div>

          <NavLink
            to="/app/dashboard"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              color: isActive ? '#FFFFFF' : '#94A3B8',
              background: isActive ? 'var(--primary-blue)' : 'transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.88rem',
              transition: 'background 0.15s ease',
            })}
          >
            <LayoutDashboard size={18} /> {user?.role === 'CLIENT' ? 'Client Workspace' : user?.role === 'ACCOUNTS_MANAGER' ? 'Finance Overview' : user?.role === 'HR_MANAGER' ? 'HR Overview' : 'Dashboard'}
          </NavLink>

          {/* ======================================================== */}
          {/* CLIENT PORTAL NAVIGATION: CLEAN & ISOLATED */}
          {/* ======================================================== */}
          {user?.role === 'CLIENT' && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Client Solutions
              </div>
              <NavLink
                to="/app/client/services"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <ShoppingBag size={18} /> Service Catalog & Orders
              </NavLink>

              <NavLink
                to="/app/client-progress"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Calendar size={18} /> Daily Progress Portal
              </NavLink>

              <NavLink
                to="/app/projects"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Briefcase size={18} /> My Projects & Milestones
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Billing
              </div>
              <NavLink
                to="/app/finance/invoices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Receipt size={18} /> Invoices & Receipts
              </NavLink>
            </>
          )}

          {/* ======================================================== */}
          {/* ACCOUNTS MANAGER: FINANCE ONLY (NO HR, NO USER ADMIN) */}
          {/* ======================================================== */}
          {user?.role === 'ACCOUNTS_MANAGER' && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Financial Modules
              </div>
              <NavLink
                to="/app/finance/invoices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Receipt size={18} /> Invoices & Billing
              </NavLink>

              <NavLink
                to="/app/finance/payments"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <CreditCard size={18} /> Payments & Receipts
              </NavLink>

              <NavLink
                to="/app/finance/ledger"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <DollarSign size={18} /> General Ledger & Trial Balance
              </NavLink>

              <NavLink
                to="/app/clients"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Building size={18} /> Client Billing Profiles
              </NavLink>

              <NavLink
                to="/app/reports"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <BarChart3 size={18} /> Financial Reports
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Self-Service & Notices
              </div>
              <NavLink
                to="/app/notices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Bell size={18} /> Messages & Notices
              </NavLink>
              <NavLink
                to="/app/hr/attendance"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <UserCheck size={18} /> Attendance
              </NavLink>
            </>
          )}

          {/* ======================================================== */}
          {/* HR MANAGER: HR & EMPLOYEE OPERATIONS ONLY (NO FINANCE) */}
          {/* ======================================================== */}
          {user?.role === 'HR_MANAGER' && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                HR & Personnel
              </div>
              <NavLink
                to="/app/users"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Users size={18} /> Employee Directory
              </NavLink>

              <NavLink
                to="/app/hr/attendance"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <UserCheck size={18} /> Daily Attendance
              </NavLink>

              <NavLink
                to="/app/hr/leave"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Calendar size={18} /> Leave Management
              </NavLink>

              <NavLink
                to="/app/hr/payroll"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Receipt size={18} /> Payroll & Payslips
              </NavLink>

              <NavLink
                to="/app/reports"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <BarChart3 size={18} /> HR Reports
              </NavLink>

              <NavLink
                to="/app/notices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Bell size={18} /> Messages & Notices
              </NavLink>
            </>
          )}

          {/* ======================================================== */}
          {/* TEAM LEADER: PROJECTS, TASKS, DAILY WORK REVIEWS */}
          {/* ======================================================== */}
          {user?.role === 'TEAM_LEADER' && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Team & Deliverables
              </div>
              <NavLink
                to="/app/projects"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Briefcase size={18} /> My Team Projects
              </NavLink>

              <NavLink
                to="/app/tasks"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <CheckSquare size={18} /> Task Assignments
              </NavLink>

              <NavLink
                to="/app/team-reports"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <FileCheck size={18} /> Daily Work Reviews & Requests
              </NavLink>

              <NavLink
                to="/app/daily-work"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Clock size={18} /> My Daily Work Log
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Self-Service HR
              </div>
              <NavLink
                to="/app/hr/attendance"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <UserCheck size={18} /> My Attendance
              </NavLink>

              <NavLink
                to="/app/hr/leave"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Calendar size={18} /> Leave Request
              </NavLink>

              <NavLink
                to="/app/notices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Bell size={18} /> Messages & Notices
              </NavLink>
            </>
          )}

          {/* ======================================================== */}
          {/* STAFF & INTERN: MY TASKS, MY LOGS, MY ATTENDANCE */}
          {/* ======================================================== */}
          {['STAFF', 'INTERN'].includes(user?.role) && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                My Workspace
              </div>
              <NavLink
                to="/app/projects"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Briefcase size={18} /> My Projects
              </NavLink>

              <NavLink
                to="/app/tasks"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <CheckSquare size={18} /> My Tasks
              </NavLink>

              <NavLink
                to="/app/daily-work"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Clock size={18} /> {user?.role === 'INTERN' ? 'Daily Work Report' : 'Daily Work Log'}
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Self-Service
              </div>
              <NavLink
                to="/app/hr/attendance"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <UserCheck size={18} /> Attendance
              </NavLink>

              <NavLink
                to="/app/hr/leave"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Calendar size={18} /> Leave Request
              </NavLink>

              <NavLink
                to="/app/notices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Bell size={18} /> Messages & Notices
              </NavLink>
            </>
          )}

          {/* ======================================================== */}
          {/* SUPER ADMIN & ADMIN: AUTHORIZED COMPANY-WIDE MODULES */}
          {/* ======================================================== */}
          {['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && (
            <>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Management
              </div>
              <NavLink
                to="/app/projects"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Briefcase size={18} /> Projects
              </NavLink>

              <NavLink
                to="/app/project-assignments"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <FolderKanban size={18} /> Project Assignment
              </NavLink>

              <NavLink
                to="/app/tasks"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <CheckSquare size={18} /> Tasks
              </NavLink>

              <NavLink
                to="/app/team-reports"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <FileCheck size={18} /> Work Reports & Reviews
              </NavLink>

              <NavLink
                to="/app/admin/services"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <ShoppingBag size={18} /> Service Management & Quotes
              </NavLink>

              <NavLink
                to="/app/admin/videos"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Video size={18} /> Video Guidance Manager
              </NavLink>

              <NavLink
                to="/app/notices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Bell size={18} /> Messages & Notices
              </NavLink>

              <NavLink
                to="/app/clients"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Building size={18} /> Clients
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                Finance
              </div>
              <NavLink
                to="/app/finance/invoices"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Receipt size={18} /> Invoices
              </NavLink>
              <NavLink
                to="/app/finance/payments"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <CreditCard size={18} /> Payments
              </NavLink>
              <NavLink
                to="/app/finance/ledger"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <DollarSign size={18} /> Trial Balance
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                People & HR
              </div>
              <NavLink
                to="/app/users"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Users size={18} /> Employees
              </NavLink>
              <NavLink
                to="/app/hr/attendance"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <UserCheck size={18} /> Attendance
              </NavLink>
              {(user?.role !== 'ADMIN' || leaveCount > 0) && (
                <NavLink
                  to="/app/hr/leave"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    background: isActive ? 'var(--primary-blue)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.88rem',
                  })}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={18} /> Leave Requests
                  </span>
                  {user?.role === 'ADMIN' && pendingLeaveCount > 0 && (
                    <span style={{
                      background: '#D97706',
                      color: '#FFFFFF',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.1rem 0.45rem',
                      borderRadius: '999px',
                    }}>
                      {pendingLeaveCount}
                    </span>
                  )}
                </NavLink>
              )}
              <NavLink
                to="/app/hr/payroll"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <Receipt size={18} /> Payroll
              </NavLink>

              <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#68778C', padding: '0.75rem 0.75rem 0.25rem', letterSpacing: '0.05em' }}>
                System
              </div>
              <NavLink
                to="/app/reports"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  background: isActive ? 'var(--primary-blue)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                })}
              >
                <BarChart3 size={18} /> Reports & Analytics
              </NavLink>

              {user?.role === 'SUPER_ADMIN' && (
                <NavLink
                  to="/app/settings"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    background: isActive ? 'var(--primary-blue)' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.88rem',
                  })}
                >
                  <Shield size={18} /> Audit & Governance
                </NavLink>
              )}
            </>
          )}
        </nav>

        {/* User Card */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid var(--dark-navy-border)',
          background: 'var(--dark-navy-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <NavLink
            to="/app/profile"
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, textDecoration: 'none' }}
            title="My Profile & Account"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: user?.avatarUrl ? '#FFFFFF' : 'var(--primary-blue-light)',
              color: 'var(--primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: '1.5px solid rgba(255, 90, 0, 0.4)',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user.firstName}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span>{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{user?.role?.replace('_', ' ')}</div>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            title="Sign Out"
            style={{ background: 'transparent', color: '#94A3B8', padding: '0.4rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Reference Topbar with global app background */}
        <header className="dashboard-topbar" style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-app)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}>
          {/* Left Topbar: Mobile Toggle + Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Hamburger button for mobile/tablet */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="dashboard-hamburger-btn"
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.45rem',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--dark-navy)',
                cursor: 'pointer',
              }}
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            {/* Topbar Search */}
            <div className="topbar-search-container" style={{ position: 'relative', width: '320px' }}>
              <input
                type="text"
                placeholder="Search projects, tasks, invoices..."
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                  background: 'var(--bg-subtle)',
                  border: '1px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  outline: 'none',
                }}
              />
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Right Topbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  position: 'relative',
                }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: 'var(--danger)',
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '45px',
                  width: '320px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 30,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ background: 'none', color: 'var(--primary-blue)', fontSize: '0.75rem' }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '0.6rem',
                          background: n.isRead ? '#FFFFFF' : 'var(--primary-blue-light)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: n.isRead ? 'none' : '3px solid var(--primary-blue)',
                          fontSize: '0.8rem',
                        }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{n.title}</div>
                          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                  {user?.role !== 'CLIENT' && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          navigate('/app/notices');
                        }}
                        style={{
                          background: 'transparent',
                          color: 'var(--primary-blue)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: 'none',
                        }}
                      >
                        View All Messages & Notices &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <NavLink
              to="/app/profile"
              style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', cursor: 'pointer' }}
              title="My Profile & Photo"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user?.avatarUrl ? '#FFFFFF' : 'var(--primary-blue-light)',
                color: 'var(--primary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: '1.5px solid rgba(255, 90, 0, 0.35)',
                overflow: 'hidden',
                flexShrink: 0,
              }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={`${user.firstName}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span>{(user?.firstName?.[0] || 'U').toUpperCase()}</span>
                )}
              </div>
              <div className="dashboard-user-meta">
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{user?.role?.replace('_', ' ')}</div>
              </div>
            </NavLink>
          </div>
        </header>

        {/* ========================================================================= */}
        {/* FEATURE 2: PERSONALIZED USER WELCOME HEADER (UNDER NAVBAR/HEADER) */}
        {/* ========================================================================= */}
        {(() => {
          const rawName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
          const displayName = rawName || user?.firstName || user?.email?.split('@')[0] || '';
          const roleLabel = user?.role ? user.role.replace(/_/g, ' ') : '';
          const isClient = user?.role === 'CLIENT';

          return (
            <div
              className="welcome-banner"
              style={{
                padding: '1.25rem 2rem 0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: 'clamp(1.15rem, 3.5vw, 1.5rem)',
                    fontWeight: 800,
                    color: 'var(--dark-navy)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-0.02em',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {displayName ? `Welcome back, ${displayName}! 👋` : 'Welcome back! 👋'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
                  {isClient
                    ? "Here's your client portal overview for today."
                    : "Here’s your dashboard overview for today."}
                </p>
              </div>

              {roleLabel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    className="badge badge-primary"
                    style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {roleLabel}
                  </span>
                </div>
              )}
            </div>
          );
        })()}

        {/* Dedicated Page Main View */}
        <main className="dashboard-main-content" style={{ padding: '1.5rem 2rem 2rem', flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
