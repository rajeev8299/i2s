import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { UserCheck, Clock, Calendar, CheckCircle2, XCircle, Plus, FileText, Download, Users, Briefcase, AlertTriangle } from 'lucide-react';

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
  const [reportWarningModal, setReportWarningModal] = useState(null); // string error message if missing report

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

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [attData, leaveData, payData] = await Promise.all([
        apiFetch('/hr/attendance'),
        apiFetch('/hr/leave'),
        apiFetch('/hr/payroll').catch(() => ({ payslips: [] })),
      ]);
      setAttendance(attData.attendance || []);
      setLeaveRequests(leaveData.leaveRequests || []);
      setPayslips(payData.payslips || []);
    } catch (err) {
      console.error(err);
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
    try {
      await apiFetch('/hr/attendance/check-out', { method: 'POST' });
      await loadData();
    } catch (err) {
      if (err.data?.requiresDailyReport || err.message?.includes('Daily Work Report')) {
        setReportWarningModal(err.message || 'Please submit your required Daily Work Report before checking out for today.');
      } else {
        alert(err.message);
      }
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
          <button onClick={() => setShowLeaveModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} /> Request Leave
          </button>
        </div>
      </div>

      {/* KPI & Quick Action Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Attendance & Shift Logs
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Clock-in and clock-out timestamps, active shift durations, and automated presence tracking.
            </p>
          </div>

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
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No attendance activity recorded.
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
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.user?.role}</div>
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
                        {['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'TEAM_LEADER'].includes(user?.role) && l.status === 'PENDING' ? (
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
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
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

      {/* Attendance Sign-off Warning: Missing Daily Work Report */}
      {reportWarningModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '1.75rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={28} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
              Daily Report Required
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              {reportWarningModal}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setReportWarningModal(null)}
                className="btn-secondary"
                style={{ padding: '0.55rem 1.25rem' }}
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setReportWarningModal(null);
                  navigate('/app/daily-work');
                }}
                className="btn-primary"
                style={{ padding: '0.55rem 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <FileText size={16} /> Submit Report Now &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRPage;
