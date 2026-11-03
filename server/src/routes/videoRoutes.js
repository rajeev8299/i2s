import express from 'express';
import { z } from 'zod';
import prisma from '../config/db.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { fetchVideoMetadata, identifyVideoPlatform } from '../services/videoMetadataService.js';

const router = express.Router();

// Validation Schemas
const videoSchema = z.object({
  originalUrl: z.string().url('Must be a valid URL'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().max(2000).optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable().or(z.literal('')),
  category: z.string().min(2).max(50).default('Engineering'),
  duration: z.string().max(20).optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// ============================================================================
// 1. PUBLIC ENDPOINTS (No Auth Required)
// ============================================================================

/**
 * GET /api/videos/public
 * Returns active videos for the Guidance on Video public section
 */
router.get('/public', async (req, res, next) => {
  try {
    const videos = await prisma.guidanceVideo.findMany({
      where: { isActive: true },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 2. ADMIN PROTECTED ENDPOINTS (SUPER_ADMIN & ADMIN ONLY)
// ============================================================================

/**
 * GET /api/videos
 * Returns all video records (including inactive) for Admin management
 */
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { category, search, status } = req.query;

    const where = {};
    if (category && category !== 'All') {
      where.category = { equals: category, mode: 'insensitive' };
    }
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
      ];
    }

    const videos = await prisma.guidanceVideo.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/videos/fetch-metadata
 * Validates link and fetches public video metadata from platform
 */
router.post('/fetch-metadata', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Video URL is required.' });
    }

    const result = await fetchVideoMetadata(url);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      metadata: result.metadata,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/videos
 * Create a new Guidance Video listing
 */
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const validated = videoSchema.parse(req.body);

    const platformCheck = identifyVideoPlatform(validated.originalUrl);
    if (!platformCheck.isValid) {
      return res.status(400).json({ success: false, error: platformCheck.error });
    }

    const newVideo = await prisma.guidanceVideo.create({
      data: {
        originalUrl: validated.originalUrl.trim(),
        platform: platformCheck.platform,
        title: validated.title.trim(),
        description: validated.description ? validated.description.trim() : null,
        thumbnailUrl: validated.thumbnailUrl ? validated.thumbnailUrl.trim() : null,
        category: validated.category.trim(),
        duration: validated.duration ? validated.duration.trim() : null,
        displayOrder: validated.displayOrder || 0,
        isActive: validated.isActive !== false,
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Video listing created successfully.',
      video: newVideo,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.errors[0]?.message || 'Validation error',
      });
    }
    next(err);
  }
});

/**
 * PUT /api/videos/:id
 * Update an existing video listing
 */
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.guidanceVideo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Video record not found.' });
    }

    const validated = videoSchema.parse(req.body);
    const platformCheck = identifyVideoPlatform(validated.originalUrl);
    if (!platformCheck.isValid) {
      return res.status(400).json({ success: false, error: platformCheck.error });
    }

    const updated = await prisma.guidanceVideo.update({
      where: { id },
      data: {
        originalUrl: validated.originalUrl.trim(),
        platform: platformCheck.platform,
        title: validated.title.trim(),
        description: validated.description ? validated.description.trim() : null,
        thumbnailUrl: validated.thumbnailUrl ? validated.thumbnailUrl.trim() : null,
        category: validated.category.trim(),
        duration: validated.duration ? validated.duration.trim() : null,
        displayOrder: validated.displayOrder || 0,
        isActive: validated.isActive !== false,
      },
    });

    res.json({
      success: true,
      message: 'Video listing updated successfully.',
      video: updated,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.errors[0]?.message || 'Validation error',
      });
    }
    next(err);
  }
});

/**
 * PATCH /api/videos/:id/status
 * Toggle video active status
 */
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.guidanceVideo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Video record not found.' });
    }

    const { isActive } = req.body;
    const nextStatus = typeof isActive === 'boolean' ? isActive : !existing.isActive;

    const updated = await prisma.guidanceVideo.update({
      where: { id },
      data: { isActive: nextStatus },
    });

    res.json({
      success: true,
      message: `Video is now ${updated.isActive ? 'Active' : 'Inactive'}.`,
      video: updated,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/videos/:id
 * Remove a video from website listings
 */
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.guidanceVideo.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Video record not found.' });
    }

    await prisma.guidanceVideo.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Video listing removed from website.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
