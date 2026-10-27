import express from 'express';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// -------------------------------------------------------------
// 1. GET /api/reports/my - Current user's daily work reports
// -------------------------------------------------------------
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate, projectId, status } = req.query;
    const where = { authorId: req.user.id };

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.reportDate = {};
      if (startDate) where.reportDate.gte = new Date(startDate);
      if (endDate) where.reportDate.lte = new Date(endDate);
    }

    const reports = await prisma.dailyWorkReport.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true, status: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { reportDate: 'desc' },
    });

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 2. POST /api/reports - Create/Submit a Daily Work Report
// -------------------------------------------------------------
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      projectId,
      taskId,
      reportDate,
      workTitle,
      description,
      completedWork,
      pendingWork,
      currentStatus,
      timeSpentMinutes,
      completionPercent,
      workLinks,
      blockers,
      nextSteps,
      plannedTomorrow,
      internalNotes,
      clientSummary,
      status, // 'DRAFT' or 'SUBMITTED'
      reviewedReportsCount,
    } = req.body;

    const resolvedDescription = description || completedWork || 'Daily Work Report';
    const resolvedTitle = workTitle || (completedWork ? completedWork.slice(0, 80) : 'Daily Work Progress');

    if (!projectId) {
      return res.status(400).json({ success: false, error: 'Project is required.' });
    }

    if (!resolvedTitle || !resolvedDescription) {
      return res.status(400).json({ success: false, error: 'Completed work description or title is required.' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const parsedDate = reportDate ? new Date(reportDate) : new Date();
    const finalStatus = status === 'DRAFT' ? 'DRAFT' : 'SUBMITTED';

    const newReport = await prisma.dailyWorkReport.create({
      data: {
        authorId: req.user.id,
        projectId,
        taskId: taskId || null,
        reportDate: parsedDate,
        workTitle: resolvedTitle,
        description: resolvedDescription,
        completedWork: completedWork || description || null,
        pendingWork: pendingWork || null,
        currentStatus: currentStatus || null,
        timeSpentMinutes: parseInt(timeSpentMinutes) || 0,
        completionPercent: Math.min(100, Math.max(0, parseInt(completionPercent) || 0)),
        workLinks: workLinks || null,
        blockers: blockers || null,
        nextSteps: nextSteps || null,
        plannedTomorrow: plannedTomorrow || null,
        internalNotes: internalNotes || null,
        clientSummary: clientSummary || null,
        reviewedReportsCount: reviewedReportsCount !== undefined ? parseInt(reviewedReportsCount) : null,
        status: finalStatus,
        submittedAt: finalStatus === 'SUBMITTED' ? new Date() : null,
      },
      include: {
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true } },
      },
    });

    await logAudit({
      userId: req.user.id,
      action: finalStatus === 'DRAFT' ? 'REPORT_DRAFT_SAVED' : 'REPORT_SUBMITTED',
      entity: 'DailyWorkReport',
      entityId: newReport.id,
      details: { title: workTitle, project: project.name },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, report: newReport });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 3. PUT /api/reports/:id - Edit/Resubmit Draft or Returned Report
// -------------------------------------------------------------
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await prisma.dailyWorkReport.findUnique({ where: { id } });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    // Report author or admin check
    if (report.authorId !== req.user.id && !['SUPER_ADMIN', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this report.' });
    }

    // Locked if already APPROVED
    if (report.status === 'APPROVED' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(400).json({ success: false, error: 'Approved reports are locked from regular editing.' });
    }

    const {
      workTitle,
      description,
      completedWork,
      pendingWork,
      currentStatus,
      timeSpentMinutes,
      completionPercent,
      workLinks,
      blockers,
      nextSteps,
      plannedTomorrow,
      internalNotes,
      clientSummary,
      status, // Can transition from DRAFT or RETURNED_FOR_CORRECTION to SUBMITTED
      reviewedReportsCount,
    } = req.body;

    const newStatus = status || (report.status === 'RETURNED_FOR_CORRECTION' ? 'SUBMITTED' : report.status);

    const updated = await prisma.dailyWorkReport.update({
      where: { id },
      data: {
        workTitle: workTitle !== undefined ? workTitle : report.workTitle,
        description: description !== undefined ? description : (completedWork || report.description),
        completedWork: completedWork !== undefined ? completedWork : report.completedWork,
        pendingWork: pendingWork !== undefined ? pendingWork : report.pendingWork,
        currentStatus: currentStatus !== undefined ? currentStatus : report.currentStatus,
        timeSpentMinutes: timeSpentMinutes !== undefined ? parseInt(timeSpentMinutes) : report.timeSpentMinutes,
        completionPercent: completionPercent !== undefined ? parseInt(completionPercent) : report.completionPercent,
        workLinks: workLinks !== undefined ? workLinks : report.workLinks,
        blockers: blockers !== undefined ? blockers : report.blockers,
        nextSteps: nextSteps !== undefined ? nextSteps : report.nextSteps,
        plannedTomorrow: plannedTomorrow !== undefined ? plannedTomorrow : report.plannedTomorrow,
        internalNotes: internalNotes !== undefined ? internalNotes : report.internalNotes,
        clientSummary: clientSummary !== undefined ? clientSummary : report.clientSummary,
        reviewedReportsCount: reviewedReportsCount !== undefined ? parseInt(reviewedReportsCount) : report.reviewedReportsCount,
        status: newStatus,
        submittedAt: newStatus === 'SUBMITTED' && report.status !== 'SUBMITTED' ? new Date() : report.submittedAt,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'REPORT_UPDATED',
      entity: 'DailyWorkReport',
      entityId: id,
      details: { status: newStatus },
      ipAddress: req.ip,
    });

    res.json({ success: true, report: updated });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 4. GET /api/reports/team - Review Queue (Team Leaders, Admins)
// -------------------------------------------------------------
router.get('/team', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'), async (req, res, next) => {
  try {
    const { status, projectId, authorId, date, role } = req.query;
    const where = {};

    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (authorId) where.authorId = authorId;
    if (date) where.reportDate = new Date(date);

    // If role filter provided (e.g., 'INTERN')
    if (role) {
      where.author = { role };
    }

    // If Team Leader: view reports from assigned projects
    if (req.user.role === 'TEAM_LEADER') {
      const leaderProjects = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      if (leaderProjects.length > 0) {
        where.projectId = { in: leaderProjects.map(p => p.projectId) };
      }
    }

    const reports = await prisma.dailyWorkReport.findMany({
      where,
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true, email: true } },
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviews: {
          include: {
            reviewer: { select: { firstName: true, lastName: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { reportDate: 'desc' },
    });

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5. POST /api/reports/:id/review - Review decision (Approve / Return) & Optional Forward
// -------------------------------------------------------------
router.post('/:id/review', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, feedback, forwardToAdmin } = req.body;

    if (!['APPROVED', 'RETURNED_FOR_CORRECTION'].includes(decision)) {
      return res.status(400).json({ success: false, error: 'decision must be APPROVED or RETURNED_FOR_CORRECTION.' });
    }

    const report = await prisma.dailyWorkReport.findUnique({
      where: { id },
      include: {
        project: true,
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    // Client accounts are strictly excluded from internal reports
    if (report.author.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Cannot review client accounts.' });
    }

    const isForwarding = decision === 'APPROVED' && forwardToAdmin === true;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record review history
      const reviewRecord = await tx.workReportReview.create({
        data: {
          reportId: id,
          reviewerId: req.user.id,
          decision,
          feedback: feedback || '',
          previousStatus: report.status,
        },
      });

      // 2. Update report status
      const updatedReport = await tx.dailyWorkReport.update({
        where: { id },
        data: {
          status: decision,
          reviewerId: req.user.id,
          reviewFeedback: feedback || '',
          reviewedAt: new Date(),
          isForwardedToAdmin: isForwarding ? true : report.isForwardedToAdmin,
          forwardedAt: isForwarding ? new Date() : report.forwardedAt,
        },
      });

      // 3. Create notification for report author (Intern / Team Member)
      await tx.notification.create({
        data: {
          userId: report.authorId,
          title: `Daily Work Report ${decision === 'APPROVED' ? 'Approved' : 'Returned for Correction'}`,
          message: `Your report "${report.workTitle}" was ${decision === 'APPROVED' ? 'approved' : 'returned for correction'}. Feedback: ${feedback || 'No feedback provided.'}`,
          type: 'TASK',
          link: '/app/daily-work',
        },
      });

      // 4. If forwarded to Admin, notify all Admins & Super Admins (EXCLUDING CLIENTS)
      if (isForwarding) {
        const admins = await tx.user.findMany({
          where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, isActive: true },
          select: { id: true },
        });

        for (const admin of admins) {
          await tx.notification.create({
            data: {
              userId: admin.id,
              title: `Approved Intern Report Forwarded: ${report.author.firstName} ${report.author.lastName}`,
              message: `Team Leader approved and forwarded Intern report for "${report.workTitle}".`,
              type: 'TASK',
              link: '/app/team-reports',
            },
          });
        }
      }

      return { updatedReport, reviewRecord };
    });

    await logAudit({
      userId: req.user.id,
      action: `REPORT_REVIEW_${decision}`,
      entity: 'DailyWorkReport',
      entityId: id,
      details: { decision, isForwardedToAdmin: isForwarding },
      ipAddress: req.ip,
    });

    res.json({ success: true, report: result.updatedReport });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5b. POST /api/reports/:id/forward - Forward Approved Report to Admin
// -------------------------------------------------------------
router.post('/:id/forward', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await prisma.dailyWorkReport.findUnique({
      where: { id },
      include: {
        project: true,
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
    });

    if (!report) {
      return res.status(404).json({ success: false, error: 'Report not found.' });
    }

    if (report.status !== 'APPROVED') {
      return res.status(400).json({ success: false, error: 'Only approved reports can be forwarded to Admin.' });
    }

    const updated = await prisma.dailyWorkReport.update({
      where: { id },
      data: {
        isForwardedToAdmin: true,
        forwardedAt: new Date(),
      },
    });

    // Notify Admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          title: `Approved Report Forwarded: ${report.author.firstName} ${report.author.lastName}`,
          message: `Report for "${report.workTitle}" was approved and forwarded to Admin.`,
          type: 'TASK',
          link: '/app/team-reports',
        },
      });
    }

    await logAudit({
      userId: req.user.id,
      action: 'REPORT_FORWARDED_TO_ADMIN',
      entity: 'DailyWorkReport',
      entityId: id,
      details: { authorId: report.authorId },
      ipAddress: req.ip,
    });

    res.json({ success: true, report: updated, message: 'Report successfully forwarded to Admin.' });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 5c. GET /api/reports/admin/overview - Admin-specific Views
// 1. Intern reports ONLY if approved AND forwarded
// 2. Team Leaders' own reports
// -------------------------------------------------------------
router.get('/admin/overview', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { view } = req.query; // 'interns' | 'team_leaders' | 'all'

    // 1. Intern reports: only after Team Leader approval and forwarding
    const internReports = await prisma.dailyWorkReport.findMany({
      where: {
        author: { role: 'INTERN' },
        status: 'APPROVED',
        isForwardedToAdmin: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            employeeProfile: { select: { designation: true, employeeCode: true } },
          },
        },
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true, role: true } },
        reviews: {
          include: { reviewer: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { reportDate: 'desc' },
    });

    // 2. Team Leaders' own reports
    const teamLeaderReports = await prisma.dailyWorkReport.findMany({
      where: {
        author: { role: 'TEAM_LEADER' },
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            employeeProfile: { select: { designation: true, employeeCode: true } },
          },
        },
        project: { select: { id: true, name: true, code: true } },
        task: { select: { id: true, title: true } },
        reviews: {
          include: { reviewer: { select: { firstName: true, lastName: true, role: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { reportDate: 'desc' },
    });

    res.json({
      success: true,
      internReports,
      teamLeaderReports,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 6. GET /api/reports/client-progress/:projectId - Client Portal Daily Progress Timeline
// -------------------------------------------------------------
router.get('/client-progress/:projectId', authenticate, async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    // Record-level Authorization: Clients can ONLY view their own project
    if (req.user.role === 'CLIENT' && project.client?.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: Access restricted to authorized client.' });
    }

    // Fetch authorized approved client updates (Strictly excluding internalNotes)
    const updates = await prisma.clientProgressUpdate.findMany({
      where: { projectId },
      select: {
        id: true,
        updateDate: true,
        title: true,
        completedToday: true,
        currentStatus: true,
        nextSteps: true,
        deliverableLinks: true,
        createdAt: true,
      },
      orderBy: { updateDate: 'desc' },
    });

    res.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        description: project.description,
        status: project.status,
        progress: project.progress,
        deadline: project.deadline,
      },
      updates,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 7. GET /api/reports/overview - Super Admin & Admin Daily Operations Monitor
// -------------------------------------------------------------
router.get('/overview', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalTasks,
      completedTasks,
      todayReports,
      pendingReviews,
      returnedReports,
      approvedReports,
      totalUsers,
    ] = await Promise.all([
      prisma.task.count(),
      prisma.task.count({ where: { status: 'COMPLETED' } }),
      prisma.dailyWorkReport.count({ where: { reportDate: today } }),
      prisma.dailyWorkReport.count({ where: { status: 'SUBMITTED' } }),
      prisma.dailyWorkReport.count({ where: { status: 'RETURNED_FOR_CORRECTION' } }),
      prisma.dailyWorkReport.count({ where: { status: 'APPROVED' } }),
      prisma.user.count({ where: { isActive: true, role: { in: ['STAFF', 'INTERN', 'TEAM_LEADER'] } } }),
    ]);

    const recentActivity = await prisma.dailyWorkReport.findMany({
      take: 20,
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        project: { select: { name: true, code: true } },
        reviewer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      metrics: {
        totalTasks,
        completedTasks,
        todayReports,
        pendingReviews,
        returnedReports,
        approvedReports,
        activeWorkforce: totalUsers,
        missingTodayReports: Math.max(0, totalUsers - todayReports),
      },
      recentActivity,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 10. POST /api/reports/request - Team Leader Requests Daily Work Report
// -------------------------------------------------------------
router.post('/request', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'TEAM_LEADER'), async (req, res, next) => {
  try {
    const { targetUserId, projectId, reportDate, instructions, deadline } = req.body;

    if (!targetUserId || !projectId || !reportDate) {
      return res.status(400).json({ success: false, error: 'Target user, project, and report date are required.' });
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    // If requester is TEAM_LEADER, verify requester is assigned as leader or member
    if (req.user.role === 'TEAM_LEADER') {
      const isLeader = project.members.some(m => m.userId === req.user.id);
      if (!isLeader) {
        return res.status(403).json({ success: false, error: 'You are not assigned as leader or member of this project.' });
      }
    }

    // Verify target user is assigned to this project
    const isTargetAssigned = project.members.some(m => m.userId === targetUserId);
    if (!isTargetAssigned) {
      return res.status(400).json({
        success: false,
        error: 'The selected user is not a member of this project. Only assigned team members can report.',
      });
    }

    // Verify target user is active Staff or Intern (never Client)
    const targetUserRecord = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, isActive: true },
    });

    if (!targetUserRecord || !targetUserRecord.isActive) {
      return res.status(400).json({ success: false, error: 'The selected user is not active.' });
    }

    if (!['STAFF', 'INTERN'].includes(targetUserRecord.role)) {
      return res.status(400).json({
        success: false,
        error: 'Daily work reports can only be requested from Staff Specialists or Interns.',
      });
    }

    const reportRequest = await prisma.dailyReportRequest.create({
      data: {
        requesterId: req.user.id,
        targetUserId,
        projectId,
        reportDate: new Date(reportDate),
        deadline: deadline ? new Date(deadline) : null,
        instructions: instructions || 'Please submit your detailed daily work report for this project.',
        status: 'PENDING',
      },
      include: {
        targetUser: { select: { firstName: true, lastName: true, email: true } },
        project: { select: { name: true, code: true } },
      },
    });

    // In-app notification for the target user
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'Daily Report Requested',
        message: `${req.user.firstName} ${req.user.lastName} requested your daily work report for ${project.name} (${reportDate}).`,
        type: 'TASK',
        link: '/app/daily-work',
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'REQUEST_DAILY_REPORT',
      resource: 'DailyReportRequest',
      resourceId: reportRequest.id,
      details: { targetUserId, projectId, reportDate },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Daily report requested successfully.',
      reportRequest,
    });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// 11. GET /api/reports/requests - List Daily Report Requests
// -------------------------------------------------------------
router.get('/requests', authenticate, async (req, res, next) => {
  try {
    const { status, projectId } = req.query;
    const where = {};

    if (req.user.role === 'STAFF' || req.user.role === 'INTERN') {
      where.targetUserId = req.user.id;
    } else if (req.user.role === 'TEAM_LEADER') {
      where.requesterId = req.user.id;
    }

    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const requests = await prisma.dailyReportRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        targetUser: { select: { id: true, firstName: true, lastName: true, role: true } },
        project: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, requests });
  } catch (err) {
    next(err);
  }
});

export default router;

