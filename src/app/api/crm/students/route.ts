import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
  }

  const student = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        role: 'STUDENT',
        isActive: true,
      },
    });
    return tx.student.create({
      data: { userId: user.id, status: 'LEAD' },
      include: { user: { select: { name: true, email: true } } },
    });
  });

  await logAudit({
    session,
    action: 'student.created',
    targetType: 'Student',
    targetId: student.id,
    before: null,
    after: { name: name.trim(), email: normalizedEmail },
    ip: getClientIp(req),
  });

  return NextResponse.json(student, { status: 201 });
}
