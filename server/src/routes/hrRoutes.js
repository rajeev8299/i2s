import express from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/hr/attendance - Daily check-in/out records with employee & date filters
router.get('/attendance', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const { employeeId, startDate, endDate, limit } = req.query;

    // CLIENT role is completely excluded from employee attendance
    if (user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Access denied. Attendance is not accessible to client accounts.' });
    }

    let where = {};

    // 1. Role-based scoping
    if (['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role)) {
      // Admin / HR can view all or filter by specific employee
      if (employeeId && employeeId !== 'ALL') {
        where.userId = employeeId;
      }
    } else if (user.role === 'TEAM_LEADER') {
      // Team Leader: can view their own, or members of projects they lead
      if (employeeId && employeeId !== 'ALL') {
        if (employeeId === user.id) {
          where.userId = user.id;
        } else {
          // Check if target user is in a project led by this Team Leader
          const isTeamMember = await prisma.projectMember.findFirst({
            where: {
              userId: employeeId,
              project: {
                members: {
                  some: { userId: user.id, isLeader: true },
                },
              },
            },
          });
          if (!isTeamMember) {
            return res.status(403).json({ success: false, error: 'You are only authorized to view attendance for members of projects you lead.' });
          }
          where.userId = employeeId;
        }
      } else {
        // Find all users in projects led by this team leader + team leader self
        const ledProjects = await prisma.project.findMany({
          where: { members: { some: { userId: user.id, isLeader: true } } },
          select: { members: { select: { userId: true } } },
        });
        const allowedUserIds = new Set([user.id]);
        ledProjects.forEach((p) => p.members.forEach((m) => allowedUserIds.add(m.userId)));
        where.userId = { in: Array.from(allowedUserIds) };
      }
    } else {
      // Regular employees (STAFF, INTERN, etc.) strictly restricted to their own attendance
      if (employeeId && employeeId !== user.id) {
        return res.status(403).json({ success: false, error: 'Unauthorized. You can only access your own attendance records.' });
      }
      where.userId = user.id;
    }

    // 2. Date filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const takeCount = limit ? parseInt(limit, 10) : 500;

    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            temporaryClientId: true,
            employeeProfile: {
              select: {
                employeeCode: true,
                designation: true,
                department: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: takeCount,
    });

    res.json({ success: true, attendance: records });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/attendance/check-in
router.post('/attendance/check-in', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Client accounts cannot record employee attendance.' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if record exists for today
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today,
        },
      },
    });

    if (existing && existing.checkInTime) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked in today.',
        record: existing,
      });
    }

    const now = new Date();
    const record = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today,
        },
      },
      update: {
        checkInTime: now,
        status: 'PRESENT',
      },
      create: {
        userId: req.user.id,
        date: today,
        checkInTime: now,
        status: 'PRESENT',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'ATTENDANCE_CHECK_IN',
      entity: 'Attendance',
      entityId: record.id,
      details: { checkInTime: now.toISOString(), date: today.toISOString() },
      ipAddress: req.ip,
    });

    res.json({ success: true, record, message: 'Check-in recorded successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/attendance/check-out
router.post('/attendance/check-out', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Client accounts cannot record employee attendance.' });
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today,
        },
      },
    });

    if (!existing || !existing.checkInTime) {
      return res.status(400).json({
        success: false,
        error: 'No active check-in found for today. Please check in first.',
      });
    }

    if (existing.checkOutTime) {
      return res.status(400).json({
        success: false,
        error: 'You have already checked out for today.',
        record: existing,
      });
    }

    // Requirement 2: Before an Intern or Team Leader checks out, check whether their required daily report has been submitted.
    // If not, show a message asking them to submit it first.
    if (['INTERN', 'TEAM_LEADER'].includes(req.user.role)) {
      const todayReport = await prisma.dailyWorkReport.findFirst({
        where: {
          authorId: req.user.id,
          reportDate: today,
          status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'] },
        },
      });

      if (!todayReport) {
        return res.status(400).json({
          success: false,
          requiresDailyReport: true,
          error: 'Please submit your required Daily Work Report before checking out for today.',
        });
      }
    }

    const now = new Date();
    const record = await prisma.attendance.update({
      where: {
        userId_date: {
          userId: req.user.id,
          date: today,
        },
      },
      data: {
        checkOutTime: now,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'ATTENDANCE_CHECK_OUT',
      entity: 'Attendance',
      entityId: record.id,
      details: { checkOutTime: now.toISOString(), checkInTime: existing.checkInTime.toISOString() },
      ipAddress: req.ip,
    });

    res.json({ success: true, record, message: 'Check-out recorded successfully.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/leave - Leave applications
router.get('/leave', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let where = {};

    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role)) {
      where.userId = user.id;
    }

    const requests = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            employeeProfile: {
              select: {
                employeeCode: true,
                designation: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, leaveRequests: requests });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/leave - Submit leave application
router.post('/leave', authenticate, async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, daysCount, reason } = req.body;

    const request = await prisma.leaveRequest.create({
      data: {
        userId: req.user.id,
        leaveType: leaveType || 'CASUAL',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        daysCount: parseInt(daysCount) || 1,
        reason,
        status: 'PENDING',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'LEAVE_REQUESTED',
      entity: 'LeaveRequest',
      entityId: request.id,
      details: { leaveType, daysCount },
    });

    res.status(201).json({ success: true, leaveRequest: request });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/hr/leave/:id/status - Approve or reject leave (ADMIN ONLY)
router.patch('/leave/:id/status', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be APPROVED or REJECTED' });
    }

    // Verify existing request
    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Leave request not found.' });
    }

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || (status === 'APPROVED' ? 'Approved by Admin' : 'Rejected by Admin'),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            employeeProfile: {
              select: {
                employeeCode: true,
                designation: true,
              },
            },
          },
        },
      },
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Leave Request ${status}`,
        message: `Your leave request for ${request.daysCount} day(s) was ${status.toLowerCase()} by Admin. Note: ${adminNote || 'None'}`,
        type: 'LEAVE',
        link: '/app/hr/leave',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: `LEAVE_${status}`,
      entity: 'LeaveRequest',
      entityId: id,
      details: { reviewedByRole: req.user.role, reviewerId: req.user.id },
    });

    res.json({ success: true, leaveRequest: request });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/payroll - Confidential Payroll review
router.get('/payroll', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let where = {};

    // Confidentiality enforcement: Non-HR roles only see their own payslips
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'ACCOUNTS_MANAGER'].includes(user.role)) {
      const emp = await prisma.employeeProfile.findUnique({ where: { userId: user.id } });
      if (!emp) return res.json({ success: true, payslips: [] });
      where.employeeProfileId = emp.id;
    }

    const payslips = await prisma.payslip.findMany({
      where,
      include: {
        employeeProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true } },
            department: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    res.json({ success: true, payslips });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/payroll/generate - Generate monthly payroll
router.post('/payroll/generate', authenticate, authorize('SUPER_ADMIN', 'HR_MANAGER', 'ACCOUNTS_MANAGER'), async (req, res, next) => {
  try {
    const { month, year } = req.body;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const employees = await prisma.employeeProfile.findMany({
      where: { employmentStatus: 'ACTIVE' },
    });

    const generated = [];

    for (const emp of employees) {
      const basic = parseFloat(emp.baseSalary) > 0 ? parseFloat(emp.baseSalary) : parseFloat(emp.stipendAmount || 0);
      const allowances = basic * 0.1; // 10% standard HRA/allowance
      const deductions = basic * 0.05; // 5% standard deductions
      const net = basic + allowances - deductions;

      const payslip = await prisma.payslip.upsert({
        where: {
          employeeProfileId_month_year: {
            employeeProfileId: emp.id,
            month: m,
            year: y,
          },
        },
        update: {
          basicSalary: basic,
          allowances,
          deductions,
          netSalary: net,
        },
        create: {
          employeeProfileId: emp.id,
          month: m,
          year: y,
          basicSalary: basic,
          allowances,
          deductions,
          netSalary: net,
          isPaid: false,
        },
      });

      generated.push(payslip);
    }

    await logAudit({
      userId: req.user.id,
      action: 'PAYROLL_GENERATED',
      entity: 'Payroll',
      details: { month: m, year: y, count: generated.length },
    });

    res.status(201).json({ success: true, count: generated.length, month: m, year: y });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/attendance/sheet - Complete attendance sheet & summary for a specific employee
router.get('/attendance/sheet', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    const { employeeId, range, startDate, endDate } = req.query;

    if (user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Access denied to attendance sheets.' });
    }

    const targetUserId = employeeId || user.id;

    // Authorization verification
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role)) {
      if (user.role === 'TEAM_LEADER') {
        if (targetUserId !== user.id) {
          const isMember = await prisma.projectMember.findFirst({
            where: {
              userId: targetUserId,
              project: {
                members: { some: { userId: user.id, isLeader: true } },
              },
            },
          });
          if (!isMember) {
            return res.status(403).json({ success: false, error: 'You are only authorized to view attendance sheets for your team members.' });
          }
        }
      } else {
        if (targetUserId !== user.id) {
          return res.status(403).json({ success: false, error: 'You can only view your own attendance sheet.' });
        }
      }
    }

    // Target employee profile details
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        temporaryClientId: true,
        employeeProfile: {
          select: {
            employeeCode: true,
            designation: true,
            employmentStatus: true,
            joiningDate: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target employee not found.' });
    }

    // Date range calculations
    let start = null;
    let end = null;
    const now = new Date();

    if (range === 'THIS_MONTH') {
      start = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      end = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));
    } else if (range === 'PREVIOUS_MONTH') {
      start = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 1));
      end = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999));
    } else if (range === 'CUSTOM' && (startDate || endDate)) {
      if (startDate) {
        start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
      }
      if (endDate) {
        end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
      }
    }
    // If range === 'ALL', start & end remain null

    const where = {
      userId: targetUserId,
      ...(start || end ? {
        date: {
          ...(start && { gte: start }),
          ...(end && { lte: end }),
        },
      } : {}),
    };

    const [attendanceRecords, leaveRecords] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy: { date: 'desc' },
      }),
      prisma.leaveRequest.findMany({
        where: {
          userId: targetUserId,
          status: 'APPROVED',
          ...(start || end ? {
            startDate: {
              ...(start && { gte: start }),
              ...(end && { lte: end }),
            },
          } : {}),
        },
      }),
    ]);

    // Calculate Summary Metrics
    let totalRecordedWorkingDays = attendanceRecords.length;
    let presentDays = 0;
    let lateArrivals = 0;
    let totalMinutesWorked = 0;

    attendanceRecords.forEach((rec) => {
      if (rec.checkInTime) {
        presentDays++;

        // Late arrival check: e.g. checked in after 9:30 AM IST (04:00 UTC)
        const checkInIST = new Date(rec.checkInTime);
        const hoursIST = (checkInIST.getUTCHours() + 5 + Math.floor((checkInIST.getUTCMinutes() + 30) / 60)) % 24;
        const minutesIST = (checkInIST.getUTCMinutes() + 30) % 60;
        if (hoursIST > 9 || (hoursIST === 9 && minutesIST > 30)) {
          lateArrivals++;
        }

        // Calculate working hours
        if (rec.checkOutTime) {
          const diffMs = new Date(rec.checkOutTime).getTime() - new Date(rec.checkInTime).getTime();
          if (diffMs > 0) {
            totalMinutesWorked += Math.floor(diffMs / 60000);
          }
        }
      }
    });

    const approvedLeaveDays = leaveRecords.reduce((acc, curr) => acc + (curr.daysCount || 0), 0);
    const totalWorkingHours = (totalMinutesWorked / 60).toFixed(1);

    res.json({
      success: true,
      employee: targetUser,
      range: range || 'ALL',
      summary: {
        totalRecordedWorkingDays,
        presentDays,
        absentDays: 0, // Note: per prompt, do not automatically mark missing records absent
        approvedLeaveDays,
        lateArrivals,
        totalWorkingHours: parseFloat(totalWorkingHours),
      },
      records: attendanceRecords,
      leaves: leaveRecords,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
