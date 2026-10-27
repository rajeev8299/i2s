import express from 'express';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settings/company
router.get('/company', async (req, res, next) => {
  try {
    const settings = await prisma.companySetting.findMany();
    const configMap = {};
    settings.forEach((s) => {
      configMap[s.key] = s.value;
    });

    res.json({
      success: true,
      settings: configMap,
      integrations: {
        smtpConfigured: !!process.env.SMTP_HOST,
        whatsappConfigured: !!process.env.WHATSAPP_API_KEY,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/settings/audit-logs (Super Admin only)
router.get('/audit-logs', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
});

export default router;
