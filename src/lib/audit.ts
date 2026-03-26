import { prisma } from '@/lib/prisma';

export type AuditAction =
  | 'student.status.changed'
  | 'student.deleted'
  | 'tutor.application.approved'
  | 'tutor.application.rejected'
  | 'tutor.application.reset'
  | 'tutor.verified'
  | 'payment.refunded'
  | 'user.role.changed'
  | 'user.deactivated';

/**
 * Write an audit log entry.
 * Call this after every successful admin mutation.
 * Errors are silently swallowed so a logging failure never breaks the primary operation.
 */
export async function logAudit({
  session,
  action,
  targetType,
  targetId,
  before,
  after,
  ip,
}: {
  session: { user?: { id?: string; email?: string | null; role?: string } } | null;
  action: AuditAction | string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
}) {
  try {
    const actorId = session?.user?.id;
    const actorEmail = session?.user?.email || 'unknown';
    const actorRole = session?.user?.role || 'unknown';

    if (!actorId) return; // can't log without an actor

    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        actorRole,
        action,
        targetType,
        targetId,
        before: (before as any) ?? undefined,
        after: (after as any) ?? undefined,
        ipAddress: ip,
      },
    });
  } catch {
    // Silent fail — audit log must never break the primary operation
  }
}

/**
 * Extract client IP from a Next.js request.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}
