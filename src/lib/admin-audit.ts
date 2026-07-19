import prisma from '@/lib/prisma';
import { AuditAction } from '@prisma/client';

export async function recordAdminAudit(input: { businessId: string; userId?: string | null; action?: AuditAction; details?: Record<string, unknown> }) {
  try {
    await prisma.auditLog.create({ data: { businessId: input.businessId, userId: input.userId ?? null, action: input.action ?? 'SYSTEM_ERROR', details: (input.details ?? {}) as any } });
  } catch (error) {
    console.error('No se pudo registrar auditoría:', error);
  }
}
