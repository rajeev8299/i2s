import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import {
  UserCheck, Clock, Calendar, CheckCircle2, XCircle, Plus, FileText, Download,
  Users, Briefcase, AlertTriangle, AlertCircle, Send, Search, Printer, Eye, Filter
} from 'lucide-react';

export const HRPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    if (location.pathname.includes('/leave')) return 'leave';
    if (location.pathname.includes('/payroll')) return 'payroll';
    return 'attendance';
  };

  const [attendance, setAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [checkoutSuccessMsg, setCheckoutSuccessMsg] = useState('');

  // Daily Work Report Modal State within Attendance Checkout
  const [showReportCheckoutModal, setShowReportCheckoutModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reportFormData, setReportFormData] = useState({
    projectId: '',
    taskId: '',
    reportDate: new Date().toISOString().split('T')[0],
    completedWork: '',
    pendingWork: '',
    currentStatus: 'In Progress',
  });
  const [reportFormError, setReportFormError] = useState('');

  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'CASUAL',
    startDate: '',
    endDate: '',
    daysCount: 1,
    reason: '',
  });

  const [payrollForm, setPayrollForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Employee Filter & Attendance Sheet State
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('ALL');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Attendance Sheet Modal State
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [sheetEmployeeId, setSheetEmployeeId] = useState('');
  const [sheetRange, setSheetRange] = useState('THIS_MONTH'); // THIS_MONTH, PREVIOUS_MONTH, CUSTOM, ALL
  const [sheetCustomStart, setSheetCustomStart] = useState('');
  const [sheetCustomEnd, setSheetCustomEnd] = useState('');
  const [sheetData, setSheetData] = useState(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attData, leaveData, payData, projData, taskData, empData] = await Promise.all([
        apiFetch('/hr/attendance'),
        apiFetch('/hr/leave'),
        apiFetch('/hr/payroll').catch(() => ({ payslips: [] })),
        apiFetch('/projects').catch(() => ({ projects: [] })),
        apiFetch('/projects/tasks').catch(() => ({ tasks: [] })),
        apiFetch('/projects/assignable-users').catch(() => ({ users: [] })),
      ]);
      setAttendance(attData.attendance || []);
      setLeaveRequests(leaveData.leaveRequests || []);
      setPayslips(payData.payslips || []);
      setProjects(projData.projects || []);
      setTasks(taskData.tasks || []);
      setEmployees(empData.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-fetch attendance when employee filter or date filter changes
  const fetchFilteredAttendance = async (empId = selectedEmployeeId, start = dateFilterStart, end = dateFilterEnd) => {
    try {
      setAttendanceLoading(true);
      const params = new URLSearchParams();
      if (empId && empId !== 'ALL') params.append('employeeId', empId);
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch(`/hr/attendance${query}`);
      setAttendance(data.attendance || []);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to filter attendance records.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Fetch individual attendance sheet
  const fetchAttendanceSheet = async (empId = sheetEmployeeId, range = sheetRange, customStart = sheetCustomStart, customEnd = sheetCustomEnd) => {
    if (!empId) {
      alert('Please select an employee to view their attendance sheet.');
      return;
    }
    try {
      setSheetLoading(true);
      const params = new URLSearchParams();
      params.append('employeeId', empId);
      params.append('range', range);
      if (range === 'CUSTOM') {
        if (customStart) params.append('startDate', customStart);
        if (customEnd) params.append('endDate', customEnd);
      }
      const data = await apiFetch(`/hr/attendance/sheet?${params.toString()}`);
      setSheetData(data);
      setShowSheetModal(true);
    } catch (err) {
      alert(err.message || 'Failed to load employee attendance sheet.');
    } finally {
      setSheetLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await apiFetch('/hr/attendance/check-in', { method: 'POST' });
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCheckOut = async () => {
    if (checkoutSubmitting) return;

    // First check if today's daily work report has already been submitted
    try {
      const myReportsData = await apiFetch('/reports/my').catch(() => ({ reports: [] }));
      const todayStr = new Date().toISOString().split('T')[0];
      const hasTodayReport = (myReportsData.reports || []).some((r) => {
        const rDate = new Date(r.reportDate).toISOString().split('T')[0];
        return rDate === todayStr && ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(r.status);
      });

      if (!hasTodayReport) {
        // Open the simplified Daily Work Report modal within the Attendance checkout flow
        setReportFormError('');
        setReportFormData({
          projectId: projects[0]?.id || '',
          taskId: '',
          reportDate: todayStr,
          completedWork: '',
          pendingWork: '',
          currentStatus: 'In Progress',
        });
        setShowReportCheckoutModal(true);
        return;
      }

      // If report already submitted, proceed directly with checkout
      setCheckoutSubmitting(true);
      await apiFetch('/hr/attendance/check-out', { method: 'POST' });
      await loadData();
      setCheckoutSuccessMsg('Checked out successfully!');
      setTimeout(() => setCheckoutSuccessMsg(''), 4000);
    } catch (err) {
      if (err.data?.requiresDailyReport || err.message?.includes('Daily Work Report')) {
        setReportFormError('');
        setReportFormData({
          projectId: projects[0]?.id || '',
          taskId: '',
          reportDate: new Date().toISOString().split('T')[0],
          completedWork: '',
          pendingWork: '',
          currentStatus: 'In Progress',
        });
        setShowReportCheckoutModal(true);
      } else {
        alert(err.message || 'Check out failed. Please try again.');
      }
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleSubmitReportAndCheckout = async (e) => {
    e.preventDefault();
    setReportFormError('');

    if (!reportFormData.projectId) {
      setReportFormError('Please select a project or task.');
      return;
    }

    if (!reportFormData.completedWork?.trim()) {
      setReportFormError('Please describe the work completed today.');
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const trimmedCompleted = reportFormData.completedWork.trim();
      const derivedTitle = trimmedCompleted.slice(0, 70);
      const derivedDescription = trimmedCompleted;

      const reportPayload = {
        ...reportFormData,
        workTitle: derivedTitle,
        description: derivedDescription,
        completedWork: trimmedCompleted,
        pendingWork: reportFormData.pendingWork?.trim() || null,
        blockers: reportFormData.pendingWork?.trim() || null,
        completionPercent: reportFormData.currentStatus === 'Completed' ? 100 : reportFormData.currentStatus === 'Blocked' ? 30 : 60,
        status: 'SUBMITTED',
      };

      // 1. Submit report
      await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify(reportPayload),
      });

      // 2. Complete attendance check out
      await apiFetch('/hr/attendance/check-out', { method: 'POST' });

      setShowReportCheckoutModal(false);
      await loadData();
      setCheckoutSuccessMsg('Daily report submitted and checked out successfully!');
      setTimeout(() => setCheckoutSuccessMsg(''), 4000);
    } catch (err) {
      setReportFormError(err.message || 'Failed to submit report and check out. Please try again.');
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/hr/leave', {
        method: 'POST',
        body: JSON.stringify(leaveForm),
      });
      setShowLeaveModal(false);
      setLeaveForm({
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        daysCount: 1,
        reason: '',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateLeaveStatus = async (id, status) => {
    try {
      await apiFetch(`/hr/leave/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/hr/payroll/run', {
        method: 'POST',
        body: JSON.stringify(payrollForm),
      });
      setShowPayrollModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Helper: Format date & time in Asia/Kolkata timezone
  const formatTimeIST = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDateIST = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate duration between check-in and check-out (or current time if in progress)
  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return '-';
    const start = new Date(checkIn).getTime();
    const end = checkOut ? new Date(checkOut).getTime() : Date.now();
    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hrs}h ${mins}m`;
  };

  // Determine today's user check-in record
  const todayRecord = attendance.find((a) => {
    if (a.userId !== user?.id) return false;
    const recDate = new Date(a.date).toISOString().slice(0, 10);
    const todayDate = new Date().toISOString().slice(0, 10);
    return recDate === todayDate;
  });

  // Current session status: 'Not Started' | 'In Progress' | 'Completed'
  const currentAttendanceStatus = !todayRecord || !todayRecord.checkInTime
    ? 'Not Started'
    : todayRecord.checkOutTime
    ? 'Completed'
    : 'In Progress';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Workforce &bull; Attendance & Operations
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) ? 'Attendance & Workforce Operations' : 'My Daily Attendance & Leave'}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) && (
            <button onClick={() => setShowPayrollModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Run Monthly Payroll
            </button>
          )}
          {!['SUPER_ADMIN', 'ADMIN'].includes(user?.role) && (
            <button onClick={() => setShowLeaveModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> Request Leave
            </button>
          )}
        </div>
      </div>

      {checkoutSuccessMsg && (
        <div style={{ background: '#DCFCE7', border: '1px solid #86EFAC', color: '#166534', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{checkoutSuccessMsg}</span>
        </div>
      )}

      {/* KPI & Quick Action Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        {/* Today's Session Attendance Card (Hidden for ADMIN role only) */}
        {user?.role !== 'ADMIN' && (
          <div className="ref-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Today's Session</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {currentAttendanceStatus}
                </div>
                {todayRecord?.checkInTime && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Duration: {calculateDuration(todayRecord.checkInTime, todayRecord.checkOutTime)}
                  </div>
                )}
              </div>
            </div>
            <div>
              {currentAttendanceStatus === 'Not Started' && (
                <button
                  onClick={handleCheckIn}
                  className="btn-primary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  Check In
                </button>
              )}
              {currentAttendanceStatus === 'In Progress' && (
                <button
                  onClick={handleCheckOut}
                  className="btn-secondary"
                  style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem', borderColor: '#DC2626', color: '#DC2626', fontWeight: 700 }}
                >
                  Check Out
                </button>
              )}
              {currentAttendanceStatus === 'Completed' && (
                <span className="badge badge-success" style={{ padding: '0.35rem 0.65rem' }}>
                  <CheckCircle2 size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  Shift Completed
                </span>
              )}
            </div>
          </div>
        )}

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) ? 'All Logged Records' : 'My Total Logs'}
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {attendance.length} Shifts
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Timezone Reference</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Asia/Kolkata (IST)
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('attendance')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'attendance' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'attendance' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <UserCheck size={16} /> Attendance Logs ({attendance.length})
        </button>

        <button
          onClick={() => setActiveTab('leave')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'leave' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'leave' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Calendar size={16} /> Leave Management ({leaveRequests.length})
        </button>

        {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) && (
          <button
            onClick={() => setActiveTab('payroll')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'payroll' ? 'var(--primary-blue)' : 'transparent',
              color: activeTab === 'payroll' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FileText size={16} /> Payroll & Payslips ({payslips.length})
          </button>
        )}
      </div>

      {/* SECTION 1: ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                Attendance & Shift Logs
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Clock-in and clock-out timestamps, active shift durations, and automated presence tracking.
              </p>
            </div>

            {/* View Attendance Sheet Button */}
            {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'TEAM_LEADER'].includes(user?.role) && (
              <button
                onClick={() => {
                  setSheetEmployeeId(selectedEmployeeId !== 'ALL' ? selectedEmployeeId : (employees[0]?.id || user?.id));
                  fetchAttendanceSheet(selectedEmployeeId !== 'ALL' ? selectedEmployeeId : (employees[0]?.id || user?.id), 'THIS_MONTH');
                }}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  padding: '0.5rem 1rem',
                  fontWeight: 700,
                }}
              >
                <Eye size={15} /> View Attendance Sheet
              </button>
            )}
          </div>

          {/* Employee Filter & Date Filter Bar */}
          {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'TEAM_LEADER'].includes(user?.role) && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
                padding: '1rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                alignItems: 'flex-end',
              }}
            >
              {/* Employee Filter */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                  Filter by Employee
                </label>
                <div style={{ position: 'relative', marginBottom: '0.35rem' }}>
                  <input
                    type="text"
                    placeholder="Search name, ID or role..."
                    value={employeeSearchTerm}
                    onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '2rem', fontSize: '0.8rem', padding: '0.35rem 0.5rem 0.35rem 2rem' }}
                  />
                  <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
                <select
                  className="form-input"
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    const newEmp = e.target.value;
                    setSelectedEmployeeId(newEmp);
                    fetchFilteredAttendance(newEmp, dateFilterStart, dateFilterEnd);
                  }}
                  style={{ fontSize: '0.82rem', fontWeight: selectedEmployeeId !== 'ALL' ? 600 : 400 }}
                >
                  <option value="ALL">All Employees (Company-wide)</option>
                  {employees
                    .filter((e) => {
                      const term = employeeSearchTerm.toLowerCase();
                      const name = `${e.firstName} ${e.lastName}`.toLowerCase();
                      return name.includes(term) || (e.role && e.role.toLowerCase().includes(term)) || (e.temporaryClientId && e.temporaryClientId.toLowerCase().includes(term));
                    })
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} — {emp.role.replace(/_/g, ' ')} {emp.temporaryClientId ? `(ID: ${emp.temporaryClientId})` : ''}
                      </option>
                    ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                  From Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dateFilterStart}
                  onChange={(e) => {
                    setDateFilterStart(e.target.value);
                    fetchFilteredAttendance(selectedEmployeeId, e.target.value, dateFilterEnd);
                  }}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                  To Date
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={dateFilterEnd}
                  onChange={(e) => {
                    setDateFilterEnd(e.target.value);
                    fetchFilteredAttendance(selectedEmployeeId, dateFilterStart, e.target.value);
                  }}
                  style={{ fontSize: '0.82rem' }}
                />
              </div>

              {/* Clear / Reset */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedEmployeeId('ALL');
                    setDateFilterStart('');
                    setDateFilterEnd('');
                    setEmployeeSearchTerm('');
                    fetchFilteredAttendance('ALL', '', '');
                  }}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '0.45rem 0.85rem', width: '100%', justifyContent: 'center' }}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Shift Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Total Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceLoading ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No attendance records found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  attendance.map((a) => {
                    const checkInVal = a.checkInTime || a.checkIn;
                    const checkOutVal = a.checkOutTime || a.checkOut;
                    const durationText = calculateDuration(checkInVal, checkOutVal);
                    const shiftStatus = !checkInVal
                      ? 'NOT_STARTED'
                      : checkOutVal
                      ? 'COMPLETED'
                      : 'IN_PROGRESS';

                    return (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {a.user?.firstName} {a.user?.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {a.user?.employeeProfile?.employeeCode || a.user?.role?.replace('_', ' ')}
                          </div>
                        </td>
                        <td>{formatDateIST(a.date)}</td>
                        <td>{formatTimeIST(checkInVal)}</td>
                        <td>{formatTimeIST(checkOutVal)}</td>
                        <td style={{ fontWeight: 500 }}>
                          {checkInVal ? durationText : '-'}
                        </td>
                        <td>
                          <span className={`badge ${shiftStatus === 'COMPLETED' ? 'badge-success' : shiftStatus === 'IN_PROGRESS' ? 'badge-warning' : 'badge-danger'}`}>
                            {shiftStatus === 'COMPLETED' ? 'Completed' : shiftStatus === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: LEAVE MANAGEMENT TAB */}
      {activeTab === 'leave' && (
        <div className="ref-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Employee Leave Requests
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Formal leave applications, reason declarations, and management approvals.
            </p>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Leave Type</th>
                  <th>Dates Range</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No leave applications submitted.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {l.user?.firstName} {l.user?.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {l.user?.employeeProfile?.employeeCode ? `${l.user.employeeProfile.employeeCode} • ` : ''}{l.user?.role}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{l.leaveType}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {new Date(l.startDate).toLocaleDateString()} &rarr; {new Date(l.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.daysCount} Day(s)</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {l.reason || 'Personal leave'}
                      </td>
                      <td>
                        <span className={`badge ${l.status === 'APPROVED' ? 'badge-success' : l.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        {user?.role === 'ADMIN' && l.status === 'PENDING' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleUpdateLeaveStatus(l.id, 'APPROVED')}
                              className="btn-primary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#16A34A', borderColor: '#16A34A' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateLeaveStatus(l.id, 'REJECTED')}
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#DC2626', borderColor: '#DC2626' }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {l.status !== 'PENDING' ? l.status : '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: PAYROLL TAB */}
      {activeTab === 'payroll' && ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user?.role) && (
        <div className="ref-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Payroll Runs & Disbursed Payslips
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Calculated base wages, statutory deductions, net salaries, and digital payslips.
            </p>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Salary Cycle</th>
                  <th>Base Pay</th>
                  <th>Deductions</th>
                  <th>Net Disbursed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No payroll records generated yet.
                    </td>
                  </tr>
                ) : (
                  payslips.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {p.user?.firstName} {p.user?.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.user?.employeeProfile?.employeeCode || p.user?.role}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {p.month} / {p.year}
                      </td>
                      <td>Rs. {Number(p.baseSalary || 0).toLocaleString('en-IN')}</td>
                      <td style={{ color: '#DC2626' }}>Rs. {Number(p.deductions || 0).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>
                        Rs. {Number(p.netSalary || 0).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${p.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                          {p.status}
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

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Submit Leave Application
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Your designated team leader and HR manager will review this request.
            </p>

            <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Leave Category *</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="search-input"
                >
                  <option value="CASUAL">Casual Leave (CL)</option>
                  <option value="SICK">Medical / Sick Leave (SL)</option>
                  <option value="PRIVILEGE">Privilege / Paid Leave (PL)</option>
                  <option value="UNPAID">Leave Without Pay (LWP)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.startDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.endDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Number of Working Days *</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  required
                  value={leaveForm.daysCount}
                  onChange={(e) => setLeaveForm({ ...leaveForm, daysCount: parseFloat(e.target.value) || 1 })}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason / Justification *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief context for this time off..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowLeaveModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {showPayrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Run Monthly Payroll
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Executes salary calculations for all active company employees.
            </p>

            <form onSubmit={handleRunPayroll} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select
                    value={payrollForm.month}
                    onChange={(e) => setPayrollForm({ ...payrollForm, month: parseInt(e.target.value) })}
                    className="search-input"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    value={payrollForm.year}
                    onChange={(e) => setPayrollForm({ ...payrollForm, year: parseInt(e.target.value) })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowPayrollModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Process Payroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simplified Daily Work Report Form Modal integrated into Attendance Checkout */}
      {showReportCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Daily Work Report &bull; Check Out
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Submit your work report for today to complete Attendance checkout (1–2 minutes).
            </p>

            {reportFormError && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{reportFormError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReportAndCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Field 1: Report Date (automatically populated, read-only) */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Report Date
                </label>
                <input
                  type="date"
                  value={reportFormData.reportDate}
                  readOnly
                  className="search-input"
                  style={{ background: 'var(--bg-app)', cursor: 'default' }}
                />
              </div>

              {/* Field 2: Project / Task (dropdown from assigned projects/tasks) */}
              <div className="form-group">
                <label className="form-label">
                  Project / Task <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={reportFormData.taskId ? `task:${reportFormData.taskId}` : reportFormData.projectId ? `proj:${reportFormData.projectId}` : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('task:')) {
                      const tId = val.replace('task:', '');
                      const tObj = tasks.find(t => t.id === tId);
                      setReportFormData({
                        ...reportFormData,
                        taskId: tId,
                        projectId: tObj?.projectId || reportFormData.projectId || (projects[0]?.id || ''),
                      });
                    } else if (val.startsWith('proj:')) {
                      const pId = val.replace('proj:', '');
                      setReportFormData({
                        ...reportFormData,
                        projectId: pId,
                        taskId: '',
                      });
                    } else {
                      setReportFormData({ ...reportFormData, projectId: '', taskId: '' });
                    }
                  }}
                  className="search-input"
                >
                  <option value="">Select Project or Task...</option>
                  {projects.map((p) => {
                    const projTasks = tasks.filter(t => t.projectId === p.id);
                    return (
                      <optgroup key={p.id} label={`Project: ${p.name} (${p.code})`}>
                        <option value={`proj:${p.id}`}>
                          {p.name} — General Project Work
                        </option>
                        {projTasks.map((t) => (
                          <option key={t.id} value={`task:${t.id}`}>
                            &nbsp;&nbsp;↳ Task: {t.title}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>

              {/* Field 3: Work Completed Today (required, short textarea) */}
              <div className="form-group">
                <label className="form-label">
                  Work Completed Today <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the tasks, features, or updates completed today..."
                  value={reportFormData.completedWork}
                  onChange={(e) => setReportFormData({ ...reportFormData, completedWork: e.target.value })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Field 4: Status (required dropdown) */}
              <div className="form-group">
                <label className="form-label">
                  Status <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  required
                  value={reportFormData.currentStatus}
                  onChange={(e) => setReportFormData({ ...reportFormData, currentStatus: e.target.value })}
                  className="search-input"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  disabled={checkoutSubmitting}
                  onClick={() => setShowReportCheckoutModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkoutSubmitting}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#DC2626', borderColor: '#DC2626' }}
                >
                  <Send size={15} /> {checkoutSubmitting ? 'Submitting & Checking Out...' : 'Submit Report & Complete Check Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 4: INDIVIDUAL EMPLOYEE ATTENDANCE SHEET MODAL */}
      {showSheetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(20, 38, 63, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem',
          backdropFilter: 'blur(3px)',
        }}>
          <div className="ref-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <FileText size={22} style={{ color: 'var(--primary-blue)' }} />
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', margin: 0 }}>
                    Employee Attendance Sheet
                  </h2>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                  Formal workforce attendance register, presence calculation, and shift history.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <Printer size={15} /> Print Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setShowSheetModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, padding: '0 0.5rem' }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Filter controls inside Sheet */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                  Employee
                </label>
                <select
                  className="form-input"
                  value={sheetEmployeeId}
                  onChange={(e) => {
                    setSheetEmployeeId(e.target.value);
                    fetchAttendanceSheet(e.target.value, sheetRange, sheetCustomStart, sheetCustomEnd);
                  }}
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.role.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                  Date Range
                </label>
                <select
                  className="form-input"
                  value={sheetRange}
                  onChange={(e) => {
                    setSheetRange(e.target.value);
                    if (e.target.value !== 'CUSTOM') {
                      fetchAttendanceSheet(sheetEmployeeId, e.target.value, '', '');
                    }
                  }}
                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <option value="THIS_MONTH">This Month</option>
                  <option value="PREVIOUS_MONTH">Previous Month</option>
                  <option value="CUSTOM">Custom Date Range</option>
                  <option value="ALL">All Available Records</option>
                </select>
              </div>

              {sheetRange === 'CUSTOM' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={sheetCustomStart}
                      onChange={(e) => setSheetCustomStart(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.3rem' }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      className="form-input"
                      value={sheetCustomEnd}
                      onChange={(e) => setSheetCustomEnd(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => fetchAttendanceSheet(sheetEmployeeId, 'CUSTOM', sheetCustomStart, sheetCustomEnd)}
                      className="btn-primary"
                      style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}
                    >
                      Apply Range
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Sheet Content Body */}
            {sheetLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Loading employee attendance sheet...
              </div>
            ) : !sheetData ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No attendance sheet data available.
              </div>
            ) : (
              <>
                {/* Employee Info Header Box */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--dark-navy)' }}>
                      {sheetData.employee?.firstName} {sheetData.employee?.lastName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Email: <strong>{sheetData.employee?.email}</strong> &bull; Role: <strong style={{ textTransform: 'capitalize' }}>{sheetData.employee?.role?.replace(/_/g, ' ')}</strong>
                      {sheetData.employee?.employeeProfile?.employeeCode ? ` • ID: ${sheetData.employee.employeeProfile.employeeCode}` : sheetData.employee?.temporaryClientId ? ` • ID: ${sheetData.employee.temporaryClientId}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>Designation: <strong>{sheetData.employee?.employeeProfile?.designation || 'Specialist'}</strong></div>
                    <div>Department: <strong>{sheetData.employee?.employeeProfile?.department?.name || 'Operations'}</strong></div>
                  </div>
                </div>

                {/* Summary Metrics Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.85rem' }}>
                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Working Days</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark-navy)', marginTop: '0.2rem' }}>
                      {sheetData.summary?.totalRecordedWorkingDays || 0}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>Present Days</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                      {sheetData.summary?.presentDays || 0}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase' }}>Hours Worked</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--primary-blue)', marginTop: '0.2rem' }}>
                      {sheetData.summary?.totalWorkingHours || 0}h
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Late Arrivals</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
                      {sheetData.summary?.lateArrivals || 0}
                    </div>
                  </div>

                  <div style={{ padding: '0.85rem', background: '#FFFFFF', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4F46E5', textTransform: 'uppercase' }}>Approved Leaves</div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#4F46E5', marginTop: '0.2rem' }}>
                      {sheetData.summary?.approvedLeaveDays || 0}
                    </div>
                  </div>
                </div>

                {/* Date-wise Attendance Table */}
                <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>DATE</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>CHECK-IN</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>CHECK-OUT</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>WORKING HOURS</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>STATUS</th>
                        <th style={{ padding: '0.65rem 0.85rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>NOTES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sheetData.records?.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No attendance records recorded for this period.
                          </td>
                        </tr>
                      ) : (
                        sheetData.records.map((rec) => {
                          const checkInVal = rec.checkInTime;
                          const checkOutVal = rec.checkOutTime;
                          const durationText = calculateDuration(checkInVal, checkOutVal);
                          return (
                            <tr key={rec.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem' }}>
                              <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600 }}>
                                {formatDateIST(rec.date)}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-main)' }}>
                                {formatTimeIST(checkInVal)}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-main)' }}>
                                {formatTimeIST(checkOutVal)}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--primary-blue)' }}>
                                {checkInVal ? durationText : '-'}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem' }}>
                                <span className={`badge ${checkOutVal ? 'badge-success' : checkInVal ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.72rem' }}>
                                  {checkOutVal ? 'Completed' : checkInVal ? 'In Progress' : 'Not Started'}
                                </span>
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                {rec.notes || '-'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPage;
