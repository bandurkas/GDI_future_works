import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, TUTOR_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, TUTOR_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;

  const app = await prisma.tutorApplication.findUnique({
    where: { id },
    select: { name: true, email: true, status: true },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.tutorApplication.delete({ where: { id } });

  await logAudit({
    session,
    action: 'tutor.application.deleted',
    targetType: 'TutorApplication',
    targetId: id,
    before: { name: app.name, email: app.email, status: app.status },
    after: null,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
