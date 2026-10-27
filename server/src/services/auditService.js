import prisma from '../config/db.js';

export const logAudit = async ({ userId = null, action, entity, resource, entityId = null, resourceId = null, details = null, ipAddress = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity: entity || resource || 'SYSTEM',
        entityId: entityId || resourceId || null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};
