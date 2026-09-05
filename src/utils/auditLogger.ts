// TODO: implement reusable audit-log writer, called from services
// after critical actions (role change, status transition, payment update, etc.)
export const createAuditLog = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: string,
): Promise<void> => {
  // await prisma.auditLog.create({
  //   data: { userId, action, entityType, entityId, details },
  // });
};

export default createAuditLog;
