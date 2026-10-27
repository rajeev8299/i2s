import express from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/hr/attendance - Daily check-in/out records
router.get('/attendance', authenticate, async (req, res, next) => {
  try {
    const user = req.user;

    // CLIENT role is completely excluded from employee attendance
    if (user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Access denied. Attendance is not accessible to client accounts.' });
    }

    let where = {};

    // Non-HR/Admin roles only see their own attendance
    if (!['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role)) {
      where.userId = user.id;
    }

    const records = await prisma.attendance.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { date: 'desc' },
      take: 100,
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
        user: { select: { id: true, firstName: true, lastName: true, role: true } },
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

// PATCH /api/hr/leave/:id/status - Approve or reject leave
router.patch('/leave/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        adminNote,
      },
      include: { user: true },
    });

    // Notify employee
    await prisma.notification.create({
      data: {
        userId: request.userId,
        title: `Leave Request ${status}`,
        message: `Your leave request for ${request.daysCount} day(s) was ${status.toLowerCase()}. Note: ${adminNote || 'None'}`,
        type: 'LEAVE',
        link: '/app/hr/leave',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: `LEAVE_${status}`,
      entity: 'LeaveRequest',
      entityId: id,
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

export default router;
