import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/db.js';
import { authenticate, generateToken, getEffectivePermissions } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        employeeProfile: true,
        clientProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated. Contact your administrator.' });
    }

    if (user.approvalStatus === 'PENDING') {
      return res.status(403).json({
        success: false,
        error: 'Your account registration is Pending Admin Approval. Please contact your administrator for access approval and role assignment.',
        approvalStatus: 'PENDING',
        temporaryClientId: user.temporaryClientId,
      });
    }

    if (user.approvalStatus === 'REJECTED') {
      return res.status(403).json({
        success: false,
        error: 'Your account registration request has been declined by an administrator.',
        approvalStatus: 'REJECTED',
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    // Set secure HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    const permissions = await getEffectivePermissions(user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        employeeProfile: user.employeeProfile,
        clientProfile: user.clientProfile,
        permissions,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register - Submit new account registration (Pending Admin Approval)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, companyName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    // Auto-generate unique default temporary Client ID: CLI-YYYYMM-XXXX
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
    const temporaryClientId = `CLI-${dateStr}-${randomHex}`;

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone?.trim() || null,
          role: 'CLIENT', // Default account classification
          temporaryClientId,
          approvalStatus: 'PENDING', // STRICT: Pending Admin Approval
          isActive: true, // Will be activated/permitted once approved
        },
      });

      // Also create a ClientProfile with temporary/default details
      await tx.clientProfile.create({
        data: {
          userId: user.id,
          companyName: companyName?.trim() || `${firstName.trim()} ${lastName.trim()}`,
          country: 'India',
        },
      });

      // Send notice to Admins about the new registration request
      const admins = await tx.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'ADMIN'] }, isActive: true },
        select: { id: true },
      });

      if (admins.length > 0) {
        await tx.notification.createMany({
          data: admins.map((adm) => ({
            userId: adm.id,
            title: `New Account Request: ${user.firstName} ${user.lastName}`,
            message: `Account request with Temp Client ID ${temporaryClientId} (${user.email}) submitted. Awaiting Admin role assignment & approval.`,
            type: 'USER',
            link: '/app/users',
            isRead: false,
          })),
        });
      }

      return user;
    });

    await logAudit({
      userId: newUser.id,
      action: 'USER_REGISTRATION_REQUESTED',
      entity: 'User',
      entityId: newUser.id,
      details: {
        email: newUser.email,
        temporaryClientId,
        approvalStatus: 'PENDING',
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Account registration submitted successfully. Your account is pending Admin approval and role assignment.',
      temporaryClientId,
      approvalStatus: 'PENDING',
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      employeeProfile: user.employeeProfile,
      clientProfile: user.clientProfile,
      permissions: user.permissions || {},
    },
  });
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  res.clearCookie('token');
  await logAudit({
    userId: req.user.id,
    action: 'USER_LOGOUT',
    entity: 'User',
    entityId: req.user.id,
    ipAddress: req.ip,
  });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Do not leak email existence
      return res.json({ success: true, message: 'If an account exists, a recovery token has been recorded.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_REQUESTED',
      entity: 'User',
      entityId: user.id,
    });

    res.json({
      success: true,
      message: 'Password reset token generated.',
      // In development, return token for easy verification
      ...(process.env.NODE_ENV === 'development' && { devResetToken: resetToken }),
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Valid token and password of at least 8 chars required.' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Password reset token is invalid or has expired.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'PASSWORD_RESET_COMPLETED',
      entity: 'User',
      entityId: user.id,
    });

    res.json({ success: true, message: 'Password has been updated. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

export default router;
