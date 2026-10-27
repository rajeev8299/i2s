import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET /api/clients
router.get('/', authenticate, async (req, res, next) => {
  try {
    // If client role, return ONLY their own profile and NEVER internalNotes
    if (req.user.role === 'CLIENT') {
      const client = await prisma.clientProfile.findUnique({
        where: { userId: req.user.id },
        select: {
          id: true,
          companyName: true,
          gstin: true,
          address: true,
          city: true,
          country: true,
          createdAt: true,
          contracts: true,
          projects: {
            where: { isClientPortal: true },
            select: { id: true, name: true, code: true, progress: true, status: true, deadline: true },
          },
        },
      });
      return res.json({ success: true, clients: client ? [client] : [] });
    }

    // Internal staff can see client records: filter to only approved users whose active role is CLIENT
    const clients = await prisma.clientProfile.findMany({
      where: {
        user: {
          role: 'CLIENT',
          approvalStatus: 'APPROVED',
        },
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true, isActive: true, approvalStatus: true } },
        projects: { select: { id: true, name: true, code: true, status: true, progress: true } },
        contracts: true,
        _count: { select: { invoices: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, clients });
  } catch (err) {
    next(err);
  }
});

// POST /api/clients - Onboard new client (Admin, Super Admin, Accounts Manager)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_MANAGER'), async (req, res, next) => {
  try {
    const { email, firstName, lastName, phone, companyName, gstin, address, city, internalNotes } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'A user with this client email already exists.' });
    }

    const defaultPassword = 'ClientPortal2026!';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const client = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          firstName,
          lastName,
          phone,
          role: 'CLIENT',
        },
      });

      const profile = await tx.clientProfile.create({
        data: {
          userId: user.id,
          companyName,
          gstin,
          address,
          city,
          internalNotes,
        },
      });

      return { ...profile, user };
    });

    await logAudit({
      userId: req.user.id,
      action: 'CLIENT_ONBOARDED',
      entity: 'ClientProfile',
      entityId: client.id,
      details: { companyName, email },
    });

    res.status(201).json({ success: true, client });
  } catch (err) {
    next(err);
  }
});

// GET /api/clients/services - Service Catalog
router.get('/services', authenticate, async (req, res, next) => {
  try {
    const services = await prisma.serviceCatalog.findMany({
      where: { isActive: true },
      orderBy: { title: 'asc' },
    });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
});

// POST /api/clients/services - Add Catalog Item
router.post('/services', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { title, description, basePrice, unit } = req.body;
    const service = await prisma.serviceCatalog.create({
      data: {
        title,
        description,
        basePrice: parseFloat(basePrice),
        unit: unit || 'project',
      },
    });
    res.status(201).json({ success: true, service });
  } catch (err) {
    next(err);
  }
});

export default router;
