import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;
  const data = await req.json();

  const student = await prisma.student.findUnique({
    where: { id },
    select: { userId: true, user: { select: { name: true, email: true, phone: true } } },
  });

  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const studentUpdateData: any = {};
  if (data.country !== undefined) studentUpdateData.country = data.country;

  const userUpdateData: any = {};
  if (data.name) userUpdateData.name = data.name;
  if (data.email) userUpdateData.email = data.email;
  if (data.phone !== undefined) userUpdateData.phone = data.phone;

  await prisma.$transaction(async (tx) => {
    if (Object.keys(studentUpdateData).length > 0) {
      await tx.student.update({ where: { id }, data: studentUpdateData });
    }
    if (Object.keys(userUpdateData).length > 0) {
      await tx.user.update({ where: { id: student.userId }, data: userUpdateData });
    }
  });

  await logAudit({
    session,
    action: 'student.updated',
    targetType: 'Student',
    targetId: id,
    before: { name: student.user?.name, email: student.user?.email, phone: student.user?.phone },
    after: data,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}

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
    // Soft delete student
    await tx.student.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    // Soft delete user record too since it's practically a student-only user in CRM context usually
    await tx.user.update({
      where: { id: student.userId },
      data: { deletedAt: new Date() }
    });
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
