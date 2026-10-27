import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'i2s_default_fallback_secret_key_2026';

// Cache for role permissions to prevent excessive DB lookups
const DEFAULT_PERMISSIONS = {
  SUPER_ADMIN: {
    dashboard: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    clients: ['view', 'create', 'edit', 'manage'],
    projects: ['view', 'create', 'edit', 'assign'],
    tasks: ['view', 'create', 'edit', 'assign', 'review'],
    finance: ['view', 'create', 'edit', 'approve'],
    hr: ['view', 'create', 'edit', 'manage'],
    payroll: ['view', 'process', 'approve'],
    reports: ['view', 'export'],
    settings: ['view', 'edit'],
  },
  ADMIN: {
    dashboard: ['view'],
    users: ['view', 'create', 'edit', 'delete'],
    clients: ['view', 'create', 'edit', 'manage'],
    projects: ['view', 'create', 'edit', 'assign'],
    tasks: ['view', 'create', 'edit', 'assign', 'review'],
    finance: ['view', 'create', 'edit'],
    hr: ['view', 'create', 'edit'],
    payroll: ['view'],
    reports: ['view', 'export'],
    settings: ['view'],
  },
  ACCOUNTS_MANAGER: {
    dashboard: ['view'],
    clients: ['view', 'create', 'edit'],
    finance: ['view', 'create', 'edit', 'approve'],
    reports: ['view', 'export'],
  },
  HR_MANAGER: {
    dashboard: ['view'],
    users: ['view', 'create', 'edit'],
    hr: ['view', 'create', 'edit', 'manage'],
    payroll: ['view', 'process', 'approve'],
    reports: ['view', 'export'],
  },
  TEAM_LEADER: {
    dashboard: ['view'],
    projects: ['view', 'edit', 'assign'],
    tasks: ['view', 'create', 'edit', 'assign', 'review'],
    hr: ['view', 'create'], // Can view attendance & request leave
    reports: ['view'],
  },
  STAFF: {
    dashboard: ['view'],
    projects: ['view'],
    tasks: ['view', 'edit'],
    hr: ['view', 'create'], // Attendance & personal leave
  },
  INTERN: {
    dashboard: ['view'],
    projects: ['view'],
    tasks: ['view', 'edit'],
    hr: ['view', 'create'], // Attendance & personal leave
  },
  CLIENT: {
    dashboard: ['view'],
    projects: ['view'],
    finance: ['view'], // Invoices only
  },
};

export const getEffectivePermissions = async (role) => {
  if (role === 'SUPER_ADMIN') {
    return DEFAULT_PERMISSIONS.SUPER_ADMIN;
  }

  try {
    const overrides = await prisma.rolePermission.findMany({
      where: { role },
    });

    const base = JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS[role] || {}));

    overrides.forEach((p) => {
      if (!base[p.module]) base[p.module] = [];
      if (p.isAllowed && !base[p.module].includes(p.action)) {
        base[p.module].push(p.action);
      } else if (!p.isAllowed && base[p.module].includes(p.action)) {
        base[p.module] = base[p.module].filter(a => a !== p.action);
      }
    });

    return base;
  } catch (err) {
    return DEFAULT_PERMISSIONS[role] || {};
  }
};

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. No authorization token provided.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        employeeProfile: true,
        clientProfile: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive or no longer exists.',
      });
    }

    if (user.approvalStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        error: 'Your account registration is Pending Admin Approval and Role Assignment.',
        approvalStatus: user.approvalStatus,
      });
    }

    req.user = user;
    req.user.permissions = await getEffectivePermissions(user.role);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] permissions. Current role is ${req.user.role}.`,
      });
    }

    next();
  };
};

export const checkPermission = (moduleName, action = 'view') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const perms = req.user.permissions || {};
    const moduleActions = perms[moduleName] || [];

    if (!moduleActions.includes(action)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: Insufficient privileges for ${moduleName}:${action}.`,
      });
    }

    next();
  };
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};
