import express from 'express';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// The 7 eligible non-client roles
const ELIGIBLE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'ACCOUNTS_MANAGER',
  'HR_MANAGER',
  'TEAM_LEADER',
  'STAFF',
  'INTERN',
];

// =============================================================
// 1. ADMIN ENDPOINTS: CREATE, LIST, DELETE NOTICES
// =============================================================

// POST /api/notifications/admin/notices - Send/Publish a Notice
router.post('/admin/notices', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { title, content, noticeType, priority, targetType, targetRoles, targetUserIds } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Title and content are required.' });
    }

    const validNoticeTypes = ['GENERAL', 'OFFICIAL_NOTICE', 'ANNOUNCEMENT', 'URGENT'];
    const validPriorities = ['NORMAL', 'IMPORTANT', 'URGENT'];

    const finalType = validNoticeTypes.includes(noticeType) ? noticeType : 'GENERAL';
    const finalPriority = validPriorities.includes(priority) ? priority : 'NORMAL';

    // Build recipient user list - STRICTLY EXCLUDE CLIENT ROLE
    // User requirement: "Reject requests that attempt to include Client users, even if someone modifies an API request."
    if (Array.isArray(targetRoles) && targetRoles.includes('CLIENT')) {
      return res.status(400).json({
        success: false,
        error: 'Client accounts are strictly prohibited from receiving Admin notices and messages.',
      });
    }

    if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      const clientUserCount = await prisma.user.count({
        where: { id: { in: targetUserIds }, role: 'CLIENT' },
      });
      if (clientUserCount > 0) {
        return res.status(400).json({
          success: false,
          error: 'Client accounts cannot be selected as notice recipients.',
        });
      }
    }

    let recipientUsers = [];

    if (targetType === 'SPECIFIC_ROLES' && Array.isArray(targetRoles) && targetRoles.length > 0) {
      const safeRoles = targetRoles.filter(r => ELIGIBLE_ROLES.includes(r));
      if (safeRoles.length === 0) {
        return res.status(400).json({ success: false, error: 'No valid employee/administrative roles selected.' });
      }
      recipientUsers = await prisma.user.findMany({
        where: {
          role: { in: safeRoles },
          isActive: true,
        },
        select: { id: true, role: true, email: true },
      });
    } else if (targetType === 'SPECIFIC_USERS' && Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      recipientUsers = await prisma.user.findMany({
        where: {
          id: { in: targetUserIds },
          role: { in: ELIGIBLE_ROLES }, // Hard enforcement: CLIENT users rejected
          isActive: true,
        },
        select: { id: true, role: true, email: true },
      });
    } else {
      // 'ALL_EMPLOYEES': All active users in the 7 eligible roles
      recipientUsers = await prisma.user.findMany({
        where: {
          role: { in: ELIGIBLE_ROLES },
          isActive: true,
        },
        select: { id: true, role: true, email: true },
      });
    }

    if (recipientUsers.length === 0) {
      return res.status(400).json({ success: false, error: 'No eligible recipients found.' });
    }

    // Database transaction: create notice + recipient records + in-app notification records
    const notice = await prisma.$transaction(async (tx) => {
      const createdNotice = await tx.adminNotice.create({
        data: {
          senderId: req.user.id,
          title: title.trim(),
          content: content.trim(),
          noticeType: finalType,
          priority: finalPriority,
          targetType: targetType || 'ALL_EMPLOYEES',
          targetRoles: Array.isArray(targetRoles) ? targetRoles.join(',') : null,
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      });

      // 1. Create NoticeRecipient records
      await tx.noticeRecipient.createMany({
        data: recipientUsers.map((u) => ({
          noticeId: createdNotice.id,
          userId: u.id,
          isRead: false,
        })),
        skipDuplicates: true,
      });

      // 2. Create in-app Notification records for real-time header bell & list
      await tx.notification.createMany({
        data: recipientUsers.map((u) => ({
          userId: u.id,
          title: `[${finalPriority}] ${title.trim()}`,
          message: content.trim().length > 140 ? content.trim().substring(0, 137) + '...' : content.trim(),
          type: 'NOTICE',
          link: '/app/notices',
          isRead: false,
        })),
      });

      return createdNotice;
    });

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_NOTICE_PUBLISHED',
      entity: 'AdminNotice',
      entityId: notice.id,
      details: {
        title: notice.title,
        priority: finalPriority,
        noticeType: finalType,
        recipientCount: recipientUsers.length,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      notice,
      recipientCount: recipientUsers.length,
      message: `Notice published successfully to ${recipientUsers.length} authorized recipients.`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/admin/notices - List all published notices with read receipts (Admin Only)
router.get('/admin/notices', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const notices = await prisma.adminNotice.findMany({
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, role: true, email: true },
        },
        recipients: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, role: true, email: true } },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, notices });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/admin/notices/:id - Delete a notice
router.delete('/admin/notices/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const notice = await prisma.adminNotice.findUnique({ where: { id } });
    if (!notice) return res.status(404).json({ success: false, error: 'Notice not found.' });

    await prisma.adminNotice.delete({ where: { id } });

    await logAudit({
      userId: req.user.id,
      action: 'ADMIN_NOTICE_DELETED',
      entity: 'AdminNotice',
      entityId: id,
      details: { title: notice.title },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// =============================================================
// 2. RECIPIENT ENDPOINTS: GET MY NOTICES, MARK AS READ
// =============================================================

// GET /api/notifications/my-notices - Eligible user's received official notices
router.get('/my-notices', authenticate, async (req, res, next) => {
  try {
    // Strictly block Client accounts
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Access denied. Notices are internal to employees only.' });
    }

    const { filter } = req.query; // 'all', 'unread', 'read', 'urgent'

    const where = {
      userId: req.user.id,
    };

    if (filter === 'unread') where.isRead = false;
    if (filter === 'read') where.isRead = true;

    let noticeWhere = {};
    if (filter === 'urgent') {
      noticeWhere.priority = { in: ['IMPORTANT', 'URGENT'] };
    }

    const recipients = await prisma.noticeRecipient.findMany({
      where: {
        ...where,
        notice: noticeWhere,
      },
      include: {
        notice: {
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
          },
        },
      },
      orderBy: { notice: { publishedAt: 'desc' } },
      take: 100,
    });

    const unreadCount = await prisma.noticeRecipient.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });

    res.json({
      success: true,
      notices: recipients.map((r) => ({
        id: r.notice.id,
        recipientId: r.id,
        title: r.notice.title,
        content: r.notice.content,
        noticeType: r.notice.noticeType,
        priority: r.notice.priority,
        publishedAt: r.notice.publishedAt,
        sender: r.notice.sender,
        isRead: r.isRead,
        readAt: r.readAt,
      })),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/my-notices/:id/read - Mark a specific notice as read
router.patch('/my-notices/:id/read', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    const { id } = req.params; // noticeId

    const recipientRecord = await prisma.noticeRecipient.findUnique({
      where: {
        noticeId_userId: {
          noticeId: id,
          userId: req.user.id,
        },
      },
    });

    if (!recipientRecord) {
      return res.status(404).json({ success: false, error: 'Notice record not found for this user.' });
    }

    const updated = await prisma.noticeRecipient.update({
      where: { id: recipientRecord.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Also mark any corresponding in-app notification as read
    await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        type: 'NOTICE',
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ success: true, recipient: updated });
  } catch (err) {
    next(err);
  }
});

// =============================================================
// 3. GENERAL NOTIFICATIONS (HEADER BELL / SHORT ALERTS)
// =============================================================

// GET /api/notifications - User's notifications
router.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Mark general notification as read
router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/read-all - Mark all general notifications as read
router.patch('/read-all', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
});

export default router;
