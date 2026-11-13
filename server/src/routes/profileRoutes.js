import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import prisma from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

import os from 'os';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In serverless environments (e.g. Vercel), local filesystem writes outside /tmp fail
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const UPLOAD_DIR = isServerless 
  ? path.join(os.tmpdir(), 'uploads', 'avatars')
  : path.resolve(__dirname, '../../uploads/avatars');

// Ensure upload directory exists safely
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('Could not initialize local upload directory:', e.message);
}

// Memory storage for file inspection before persisting
const storage = multer.memoryStorage();

// Maximum size: 5 MB
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Basic MIME check
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
    cb(null, true);
  },
});

/**
 * Validates actual binary file signatures (Magic Bytes)
 * Prevents executable/malicious files masquerading as images
 */
function validateImageMagicBytes(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG: starts with FF D8 FF
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  if (isJpeg) return 'jpg';

  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  const isPng =
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A;
  if (isPng) return 'png';

  // WebP: RIFF ... WEBP
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
  if (isRiff && isWebp) return 'webp';

  return false;
}

// Safely deletes an existing avatar from disk
function removeOldAvatarFile(avatarUrl) {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  try {
    const filename = path.basename(avatarUrl);
    // Strict filename check (uuid hex only)
    if (!/^[a-zA-Z0-9_-]+\.(jpg|png|webp)$/i.test(filename)) return;
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Error removing old avatar:', err);
  }
}

// -------------------------------------------------------------
// GET /api/profile - Fetch Current User Profile
// -------------------------------------------------------------
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        approvalStatus: true,
        isActive: true,
        createdAt: true,
        employeeProfile: {
          include: { department: true },
        },
        clientProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    res.json({ success: true, profile: user });
  } catch (err) {
    next(err);
  }
});

// -------------------------------------------------------------
// POST /api/profile/photo - Upload / Replace Profile Photo
// -------------------------------------------------------------
router.post('/photo', authenticate, (req, res, next) => {
  upload.single('photo')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Image file size exceeds the 5 MB limit. Please choose a smaller image.',
        });
      }
      return res.status(400).json({ success: false, error: err.message || 'File upload error.' });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No image file was uploaded.' });
      }

      // Deep binary verification of file signature
      const detectedExt = validateImageMagicBytes(req.file.buffer);
      if (!detectedExt) {
        return res.status(400).json({
          success: false,
          error: 'The uploaded file is not a valid JPEG, PNG, or WebP image.',
        });
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, avatarUrl: true },
      });

      if (!currentUser) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }

      // Generate secure unique filename
      const randomSuffix = crypto.randomBytes(16).toString('hex');
      const filename = `avatar-${currentUser.id}-${randomSuffix}.${detectedExt}`;
      const destinationPath = path.join(UPLOAD_DIR, filename);

      // Write file securely to disk
      fs.writeFileSync(destinationPath, req.file.buffer);

      const avatarUrl = `/uploads/avatars/${filename}`;

      // Clean up previous avatar if it exists
      if (currentUser.avatarUrl) {
        removeOldAvatarFile(currentUser.avatarUrl);
      }

      // Update database record
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatarUrl },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          phone: true,
          avatarUrl: true,
          approvalStatus: true,
          isActive: true,
          employeeProfile: {
            include: { department: true },
          },
          clientProfile: true,
        },
      });

      await logAudit({
        userId: req.user.id,
        action: 'PROFILE_PHOTO_UPLOADED',
        entity: 'User',
        entityId: req.user.id,
        details: { filename, size: req.file.size, format: detectedExt },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Profile photo updated successfully.',
        avatarUrl,
        user: updatedUser,
      });
    } catch (uploadErr) {
      next(uploadErr);
    }
  });
});

// -------------------------------------------------------------
// DELETE /api/profile/photo - Remove Profile Photo
// -------------------------------------------------------------
router.delete('/photo', authenticate, async (req, res, next) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, avatarUrl: true },
    });

    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (!currentUser.avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'No custom profile photo is currently set.',
      });
    }

    // Remove file from storage
    removeOldAvatarFile(currentUser.avatarUrl);

    // Clear reference in database
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        approvalStatus: true,
        isActive: true,
        employeeProfile: {
          include: { department: true },
        },
        clientProfile: true,
      },
    });

    await logAudit({
      userId: req.user.id,
      action: 'PROFILE_PHOTO_REMOVED',
      entity: 'User',
      entityId: req.user.id,
      details: { previousAvatarUrl: currentUser.avatarUrl },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Profile photo removed successfully. Default avatar restored.',
      avatarUrl: null,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
