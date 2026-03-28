import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, TUTOR_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

// PATCH — archive tutor (set status to ARCHIVED)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, TUTOR_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;
  const { status } = await req.json();

  if (!['ARCHIVED', 'APPROVED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const before = await prisma.tutor.findUnique({ where: { id }, select: { status: true } });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const tutor = await prisma.tutor.update({ where: { id }, data: { status } });

  await logAudit({
    session,
    action: status === 'ARCHIVED' ? 'tutor.archived' : 'tutor.unarchived',
    targetType: 'Tutor',
    targetId: id,
    before: { status: before.status },
    after: { status },
    ip: getClientIp(req),
  });

  return NextResponse.json(tutor);
}

// DELETE — hard delete tutor + user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, TUTOR_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;

  const tutor = await prisma.tutor.findUnique({
    where: { id },
    select: { userId: true, user: { select: { name: true, email: true } } },
  });
  if (!tutor) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    await prisma.$transaction(async (tx) => {
      // Delete records without cascade from Tutor
      await tx.tutorPayout.deleteMany({ where: { tutorId: id } });
      await tx.course.deleteMany({ where: { tutorId: id } });
      // Delete tutor (cascades TutorAvailability, TutorProfile, Review)
      await tx.tutor.delete({ where: { id } });
      // Delete user
      await tx.user.delete({ where: { id: tutor.userId } });
    });
  } catch (err: any) {
    if (err?.code === 'P2003') {
      return NextResponse.json(
        { error: 'Cannot delete tutor with active bookings. Archive instead.' },
        { status: 409 }
      );
    }
    throw err;
  }

  await logAudit({
    session,
    action: 'tutor.deleted',
    targetType: 'Tutor',
    targetId: id,
    before: { name: tutor.user?.name, email: tutor.user?.email },
    after: null,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
