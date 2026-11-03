import express from 'express';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/projects - Projects with client isolation
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let where = {};

    // 1. Client isolation
    if (user.role === 'CLIENT') {
      const client = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
      if (!client) return res.json({ success: true, projects: [] });
      where.clientId = client.id;
      where.isClientPortal = true;
    }
    // 2. Staff / Intern / Team Leader scoping
    else if (['STAFF', 'INTERN', 'TEAM_LEADER'].includes(user.role)) {
      where.members = {
        some: { userId: user.id },
      };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        members: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true, email: true } },
            assignedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        milestones: {
          ...(user.role === 'CLIENT' && { where: { isClientVisible: true } }),
        },
        _count: { select: { tasks: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, projects });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects - Create Project (Admin, Super Admin)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { clientId, name, code, description, priority, startDate, deadline, budget, leaderId, memberIds } = req.body;

    const project = await prisma.$transaction(async (tx) => {
      const newPrj = await tx.project.create({
        data: {
          clientId,
          name,
          code: code || `PRJ-${Date.now().toString().slice(-4)}`,
          description,
          priority: priority || 'MEDIUM',
          startDate: new Date(startDate || Date.now()),
          deadline: new Date(deadline),
          budget: budget ? parseFloat(budget) : null,
        },
      });

      if (leaderId) {
        await tx.projectMember.create({
          data: {
            projectId: newPrj.id,
            userId: leaderId,
            roleTitle: 'Team Leader',
            isLeader: true,
          },
        });
      }

      if (memberIds && Array.isArray(memberIds)) {
        for (const mid of memberIds) {
          if (mid !== leaderId) {
            await tx.projectMember.create({
              data: {
                projectId: newPrj.id,
                userId: mid,
                roleTitle: 'Team Member',
                isLeader: false,
              },
            });
          }
        }
      }

      return newPrj;
    });

    await logAudit({
      userId: req.user.id,
      action: 'PROJECT_CREATED',
      entity: 'Project',
      entityId: project.id,
      details: { name: project.name, code: project.code },
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/tasks - Filtered tasks with state transitions
router.get('/tasks', authenticate, async (req, res, next) => {
  try {
    const user = req.user;
    let where = {};

    if (user.role === 'CLIENT') {
      const client = await prisma.clientProfile.findUnique({ where: { userId: user.id } });
      where.project = { clientId: client?.id, isClientPortal: true };
      where.isClientVisible = true;
    } else if (['STAFF', 'INTERN'].includes(user.role)) {
      where.assigneeId = user.id;
    } else if (user.role === 'TEAM_LEADER') {
      where.project = {
        members: {
          some: { userId: user.id, isLeader: true },
        },
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
        comments: {
          include: { user: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    res.json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/tasks - Create Task
router.post('/tasks', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'), async (req, res, next) => {
  try {
    const { projectId, title, description, priority, deadline, assigneeId, reviewerId, isClientVisible } = req.body;

    // If Team Leader, verify assignment to their project
    if (req.user.role === 'TEAM_LEADER') {
      const isLeader = await prisma.projectMember.findFirst({
        where: { projectId, userId: req.user.id, isLeader: true },
      });
      if (!isLeader) {
        return res.status(403).json({ success: false, error: 'You can only assign tasks within your led projects.' });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority: priority || 'MEDIUM',
        deadline: new Date(deadline),
        assigneeId: assigneeId || null,
        reviewerId: reviewerId || req.user.id,
        isClientVisible: !!isClientVisible,
      },
    });

    if (assigneeId) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'New Task Assigned',
          message: `You were assigned task: "${title}".`,
          type: 'TASK',
          link: '/app/projects/tasks',
        },
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'TASK_CREATED',
      entity: 'Task',
      entityId: task.id,
      details: { title, projectId },
    });

    res.status(201).json({ success: true, task });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/tasks/:id/status - Workflow transitions: TODO -> IN_PROGRESS -> SUBMITTED_FOR_REVIEW -> APPROVED / CHANGES_REQUESTED -> COMPLETED
router.patch('/tasks/:id/status', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, submissionNotes, reviewFeedback } = req.body;
    const user = req.user;

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });

    if (!task) return res.status(404).json({ success: false, error: 'Task not found.' });

    // Validate permission for transition
    if (status === 'SUBMITTED_FOR_REVIEW') {
      // Must be assignee or leader
      if (task.assigneeId !== user.id && !['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'].includes(user.role)) {
        return res.status(403).json({ success: false, error: 'Only the assignee can submit this task for review.' });
      }
    }

    if (['APPROVED', 'CHANGES_REQUESTED', 'COMPLETED'].includes(status)) {
      const isProjectLeader = task.project.members.some((m) => m.userId === user.id && m.isLeader);
      const isAuthorized = ['SUPER_ADMIN', 'ADMIN'].includes(user.role) || task.reviewerId === user.id || isProjectLeader;

      if (!isAuthorized) {
        return res.status(403).json({ success: false, error: 'Only authorized reviewers or team leaders can approve/change request tasks.' });
      }
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status,
        ...(submissionNotes && { submissionNotes }),
        ...(reviewFeedback && { reviewFeedback }),
      },
    });

    // Notify assignee if reviewed
    if (['APPROVED', 'CHANGES_REQUESTED'].includes(status) && task.assigneeId) {
      await prisma.notification.create({
        data: {
          userId: task.assigneeId,
          title: `Task Review: ${status === 'APPROVED' ? 'Approved' : 'Changes Requested'}`,
          message: `Your task "${task.title}" status changed to ${status}. Feedback: ${reviewFeedback || 'None'}`,
          type: 'TASK',
          link: '/app/projects/tasks',
        },
      });
    }

    await logAudit({
      userId: user.id,
      action: 'TASK_STATUS_TRANSITION',
      entity: 'Task',
      entityId: id,
      details: { previousStatus: task.status, newStatus: status },
    });

    res.json({ success: true, task: updated });
  } catch (err) {
    next(err);
  }
});

// =========================================================================
// PROJECT ASSIGNMENT SYSTEM (ADMIN DIRECT PROJECT ASSIGNMENT)
// =========================================================================

// GET /api/projects/assignments - List all direct project assignments with full metadata
router.get('/assignments', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const assignments = await prisma.projectMember.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
            priority: true,
            deadline: true,
            client: { select: { id: true, companyName: true } },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, assignments });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/assignable-users - List all eligible internal users for assignment
router.get('/assignable-users', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        // Exclude pure client users from internal technical assignments unless desired, but allow team members
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER', 'STAFF', 'INTERN', 'HR_MANAGER', 'ACCOUNTS_MANAGER'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
        temporaryClientId: true,
      },
      orderBy: [{ role: 'asc' }, { firstName: 'asc' }],
    });

    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
});

// POST /api/projects/assign - Direct Project Assignment by Admin
router.post('/assign', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { projectId, userId, roleTitle, isLeader } = req.body;
    const adminUser = req.user;

    // 1. Meaningful Validations
    if (!projectId || !projectId.trim()) {
      return res.status(400).json({ success: false, error: 'Please select a valid Project to assign.' });
    }
    if (!userId || !userId.trim()) {
      return res.status(400).json({ success: false, error: 'Please select a valid User to assign the project to.' });
    }

    // 2. Verify Project Exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, code: true, status: true },
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Target project does not exist.' });
    }

    // 3. Verify User Exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true },
    });
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target user does not exist.' });
    }
    if (!targetUser.isActive) {
      return res.status(400).json({ success: false, error: 'Cannot assign project to an inactive user account.' });
    }

    // 4. Duplicate Check
    const existingMembership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        assignedBy: { select: { firstName: true, lastName: true } },
      },
    });

    if (existingMembership) {
      const assignedByName = existingMembership.assignedBy
        ? `${existingMembership.assignedBy.firstName} ${existingMembership.assignedBy.lastName}`
        : 'System Admin';
      return res.status(400).json({
        success: false,
        error: `User "${targetUser.firstName} ${targetUser.lastName}" is already assigned to project "${project.name}" (Assigned by: ${assignedByName} on ${new Date(existingMembership.createdAt).toLocaleDateString()}). Duplicate assignment prevented.`,
      });
    }

    // 5. Secure Database Operation (assignedById derived exclusively from authenticated admin)
    const assignment = await prisma.$transaction(async (tx) => {
      const newMember = await tx.projectMember.create({
        data: {
          projectId,
          userId,
          roleTitle: roleTitle?.trim() || (isLeader ? 'Team Leader' : 'Team Member'),
          isLeader: !!isLeader,
          assignedById: adminUser.id, // Strictly server-derived from verified auth token
        },
        include: {
          project: {
            select: { id: true, name: true, code: true, status: true, priority: true, deadline: true },
          },
          user: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
          assignedBy: {
            select: { id: true, firstName: true, lastName: true, email: true, role: true },
          },
        },
      });

      // 6. Existing Notification System Integration
      await tx.notification.create({
        data: {
          userId,
          title: 'New Project Assigned',
          message: `You have been directly assigned to project "${project.name}" (${project.code}) by Admin ${adminUser.firstName} ${adminUser.lastName}.`,
          type: 'PROJECT',
          link: '/app/projects',
        },
      });

      return newMember;
    });

    // 7. Audit Log
    await logAudit({
      userId: adminUser.id,
      action: 'PROJECT_ASSIGNED_DIRECTLY',
      entity: 'ProjectMember',
      entityId: assignment.id,
      details: {
        projectId,
        projectName: project.name,
        assignedToUserId: userId,
        assignedToName: `${targetUser.firstName} ${targetUser.lastName}`,
        roleTitle: assignment.roleTitle,
      },
    });

    res.status(201).json({
      success: true,
      message: `Project "${project.name}" successfully assigned to ${targetUser.firstName} ${targetUser.lastName}.`,
      assignment,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/assignments/:id - Remove or Revoke Project Assignment
router.delete('/assignments/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.projectMember.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Project assignment record not found.' });
    }

    await prisma.projectMember.delete({ where: { id } });

    await logAudit({
      userId: req.user.id,
      action: 'PROJECT_ASSIGNMENT_REVOKED',
      entity: 'ProjectMember',
      entityId: id,
      details: {
        projectName: existing.project?.name,
        userName: `${existing.user?.firstName} ${existing.user?.lastName}`,
      },
    });

    res.json({
      success: true,
      message: `Assignment for "${existing.user?.firstName} ${existing.user?.lastName}" from project "${existing.project?.name}" has been revoked.`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
