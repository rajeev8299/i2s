import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/users (Super Admin, Admin, HR Manager)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'), async (req, res, next) => {
  try {
    const { role, search, approvalStatus, status } = req.query;
    const where = {};

    if (role) where.role = role;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (status === 'ACTIVE') where.isActive = true;
    if (status === 'INACTIVE') where.isActive = false;

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { temporaryClientId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        temporaryClientId: true,
        approvalStatus: true,
        approvalNotes: true,
        reviewedAt: true,
        createdAt: true,
        employeeProfile: {
          include: { department: true },
        },
        clientProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// POST /api/users - Create User
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone, employeeCode, departmentId, designation, baseSalary } = req.body;

    // Prevent Admin from escalating to Super Admin
    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can create Super Admin accounts.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(400).json({ success: false, error: 'A user with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password || 'TemporaryPass123!', 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName,
          lastName,
          role: role || 'STAFF',
          phone,
        },
      });

      if (['STAFF', 'INTERN', 'TEAM_LEADER', 'HR_MANAGER', 'ACCOUNTS_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        await tx.employeeProfile.create({
          data: {
            userId: user.id,
            employeeCode: employeeCode || `EMP-${Date.now().toString().slice(-4)}`,
            departmentId: departmentId || null,
            designation: designation || 'Staff Specialist',
            baseSalary: baseSalary ? parseFloat(baseSalary) : 0,
            joiningDate: new Date(),
          },
        });
      }

      return user;
    });

    await logAudit({
      userId: req.user.id,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: newUser.id,
      details: { email: newUser.email, role: newUser.role },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/status - Toggle activate/deactivate
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found.' });

    if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Cannot deactivate Super Admin account.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    await logAudit({
      userId: req.user.id,
      action: isActive ? 'USER_REACTIVATED' : 'USER_DEACTIVATED',
      entity: 'User',
      entityId: id,
    });

    res.json({ success: true, user: updated });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/:id/approval - Approve or Reject registration request & Assign Role
router.patch('/:id/approval', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision: rawDecision, status, role, notes, designation, departmentId } = req.body;
    const decision = rawDecision || status;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'Valid decision (APPROVED or REJECTED) is required.' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { employeeProfile: true, clientProfile: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Super Admin security: Only Super Admin may assign or modify Super Admin privileges
    if ((role === 'SUPER_ADMIN' || targetUser.role === 'SUPER_ADMIN') && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Only Super Admin can assign or modify Super Admin privileges.',
      });
    }

    const assignedRole = role || targetUser.role || 'CLIENT';
    const isApproved = decision === 'APPROVED';

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          approvalStatus: decision,
          role: isApproved ? assignedRole : targetUser.role,
          isActive: isApproved, // Automatically activate on approval, deactivate on reject
          approvalNotes: notes || null,
          reviewedAt: new Date(),
          reviewedById: req.user.id,
        },
      });

      // If approved into an employee role, ensure EmployeeProfile exists
      if (isApproved && ['STAFF', 'INTERN', 'TEAM_LEADER', 'HR_MANAGER', 'ACCOUNTS_MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(assignedRole)) {
        if (!targetUser.employeeProfile) {
          await tx.employeeProfile.create({
            data: {
              userId: user.id,
              employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
              departmentId: departmentId || null,
              designation: designation || (assignedRole === 'INTERN' ? 'Graduate Intern' : assignedRole === 'TEAM_LEADER' ? 'Team Lead' : 'Staff Specialist'),
              joiningDate: new Date(),
            },
          });
        } else {
          await tx.employeeProfile.update({
            where: { id: targetUser.employeeProfile.id },
            data: {
              designation: designation || targetUser.employeeProfile.designation,
              departmentId: departmentId !== undefined ? (departmentId || null) : targetUser.employeeProfile.departmentId,
            },
          });
        }
      }

      // Notify the user in-app
      await tx.notification.create({
        data: {
          userId: user.id,
          title: isApproved ? 'Account Approved & Role Assigned' : 'Account Registration Update',
          message: isApproved
            ? `Your account has been approved by Admin with role: ${assignedRole}. You can now access your assigned dashboard.`
            : `Your registration request was reviewed: ${notes || 'Declined by Administrator.'}`,
          type: 'SYSTEM',
          link: '/app/dashboard',
          isRead: false,
        },
      });

      return user;
    });

    await logAudit({
      userId: req.user.id,
      action: isApproved ? 'USER_REGISTRATION_APPROVED' : 'USER_REGISTRATION_REJECTED',
      entity: 'User',
      entityId: id,
      details: {
        email: targetUser.email,
        assignedRole,
        decision,
        temporaryClientId: targetUser.temporaryClientId,
      },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Account has been ${isApproved ? `approved and assigned role ${assignedRole}` : 'rejected'}.`,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/departments
router.get('/departments', authenticate, async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
      },
    });
    res.json({ success: true, departments });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/:id - Edit User Details
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, phone, designation, departmentId, baseSalary, clientCompanyName } = req.body;

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { employeeProfile: true, clientProfile: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Protection: Only Super Admin can change Super Admin accounts or promote to Super Admin
    if ((targetUser.role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN') && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can manage Super Admin accounts.' });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          firstName: firstName !== undefined ? firstName : targetUser.firstName,
          lastName: lastName !== undefined ? lastName : targetUser.lastName,
          role: role !== undefined ? role : targetUser.role,
          phone: phone !== undefined ? phone : targetUser.phone,
        },
      });

      if (user.role !== 'CLIENT' && targetUser.employeeProfile) {
        await tx.employeeProfile.update({
          where: { id: targetUser.employeeProfile.id },
          data: {
            designation: designation !== undefined ? designation : targetUser.employeeProfile.designation,
            departmentId: departmentId !== undefined ? (departmentId || null) : targetUser.employeeProfile.departmentId,
            baseSalary: baseSalary !== undefined ? parseFloat(baseSalary) : targetUser.employeeProfile.baseSalary,
          },
        });
      }

      if (user.role === 'CLIENT' && targetUser.clientProfile && clientCompanyName) {
        await tx.clientProfile.update({
          where: { id: targetUser.clientProfile.id },
          data: {
            companyName: clientCompanyName,
          },
        });
      }

      return user;
    });

    await logAudit({
      userId: req.user.id,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: id,
      details: { role, firstName, lastName },
      ipAddress: req.ip,
    });

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/:id/reset-password - Admin Password Reset
router.post('/:id/reset-password', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found.' });

    if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can reset Super Admin passwords.' });
    }

    const passwordToSet = newPassword || 'TempPass123!';
    const passwordHash = await bcrypt.hash(passwordToSet, 10);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_RESET_PASSWORD',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `Password for ${targetUser.email} has been reset.`,
      tempPassword: passwordToSet,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id - Safe User Deactivation / Soft-Delete
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot deactivate your own logged-in account.' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return res.status(404).json({ success: false, error: 'User not found.' });

    // Safeguard: Check if this is the last Super Admin
    if (targetUser.role === 'SUPER_ADMIN') {
      const superAdminCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN', isActive: true } });
      if (superAdminCount <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot deactivate the only active Super Admin.' });
      }
    }

    // Soft delete to preserve historical integrity with invoices, payroll, and tasks
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit({
      userId: req.user.id,
      action: 'USER_DEACTIVATED_SAFE',
      entity: 'User',
      entityId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Account safely deactivated. Historical records preserved.', user: updated });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/roles/permissions - Get Role Permissions Matrix
router.get('/roles/permissions', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const allOverrides = await prisma.rolePermission.findMany();
    res.json({ success: true, permissions: allOverrides });
  } catch (err) {
    next(err);
  }
});

// POST /api/users/roles/permissions - Update Role Permissions
router.post('/roles/permissions', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { role, module, action, isAllowed } = req.body;

    if (!role || !module || !action) {
      return res.status(400).json({ success: false, error: 'role, module, and action are required.' });
    }

    if (role === 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Super Admin permissions are immutable and complete.' });
    }

    const updated = await prisma.rolePermission.upsert({
      where: {
        role_module_action: {
          role,
          module,
          action,
        },
      },
      update: { isAllowed },
      create: {
        role,
        module,
        action,
        isAllowed,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'ROLE_PERMISSION_UPDATED',
      entity: 'RolePermission',
      details: { role, module, action, isAllowed },
      ipAddress: req.ip,
    });

    res.json({ success: true, permission: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
