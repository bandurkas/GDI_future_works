import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    select: { userId: true, user: { select: { name: true, email: true } } },
  });
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    // Delete records without cascade from Student
    await tx.payment.deleteMany({ where: { studentId: id } });
    await tx.booking.deleteMany({ where: { studentId: id } });
    // Delete student (cascades reviews)
    await tx.student.delete({ where: { id } });
    // Delete the user record
    await tx.user.delete({ where: { id: student.userId } });
  });

  await logAudit({
    session,
    action: 'student.deleted',
    targetType: 'Student',
    targetId: id,
    before: { name: student.user?.name, email: student.user?.email },
    after: null,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
