import prisma from '../lib/prisma';

// কে কী পরিবর্তন করলো — critical action এর রেকর্ড রাখার জন্য
export const createAuditLog = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: string,
): Promise<void> => {
  await prisma.auditLog.create({
    data: { userId, action, entityType, entityId, details },
  });
};

export default createAuditLog;