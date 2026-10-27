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

export default router;
