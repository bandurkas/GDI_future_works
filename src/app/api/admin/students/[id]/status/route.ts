import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

const VALID_STATUSES = ['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED', 'ARCHIVED'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const before = await prisma.student.findUnique({ where: { id }, select: { status: true } });
  const student = await prisma.student.update({ where: { id }, data: { status } });

  await logAudit({
    session,
    action: 'student.status.changed',
    targetType: 'Student',
    targetId: id,
    before: { status: before?.status },
    after: { status },
    ip: getClientIp(req),
  });

  return NextResponse.json(student);
}
