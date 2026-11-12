import express from 'express';
import prisma from '../config/db.js';
import { z } from 'zod';

const router = express.Router();

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  selectedServices: z.array(z.string()).default([]),
  budget: z.string().optional().nullable(),
  message: z.string().min(5, 'Message must be at least 5 characters'),
  honeypot: z.string().optional().nullable(),
});

const newsletterSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  source: z.string().optional().default('website_newsletter'),
});

// POST /api/public/contact
router.post('/contact', async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body);

    // Anti-spam honeypot detection
    if (data.honeypot && data.honeypot.trim() !== '') {
      return res.status(200).json({ success: true, message: 'Inquiry received' });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        company: data.company ? data.company.trim() : null,
        phone: data.phone ? data.phone.trim() : null,
        selectedServices: data.selectedServices || [],
        budget: data.budget ? data.budget.trim() : null,
        message: data.message.trim(),
        ipAddress: typeof ipAddress === 'string' ? ipAddress : null,
        userAgent: typeof userAgent === 'string' ? userAgent : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your project inquiry has been securely received by the I2S team.',
      inquiryId: inquiry.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Invalid input data' });
    }
    next(err);
  }
});

// POST /api/public/newsletter
router.post('/newsletter', async (req, res, next) => {
  try {
    const data = newsletterSchema.parse(req.body);
    const email = data.email.trim().toLowerCase();

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        isActive: true,
        source: data.source || 'website_newsletter',
      },
      create: {
        email,
        isActive: true,
        source: data.source || 'website_newsletter',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully subscribed to the I2S engineering newsletter.',
      subscriberId: subscriber.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: err.errors[0]?.message || 'Invalid email address' });
    }
    next(err);
  }
});

// GET /api/public/stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalProjects = await prisma.project.count();
    const totalServices = await prisma.serviceCatalog.count();
    return res.json({
      success: true,
      activeProjects: totalProjects,
      availableServices: totalServices,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
