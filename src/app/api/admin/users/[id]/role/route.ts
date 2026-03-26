import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminRole } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';
import { ROLES } from '@/lib/roles';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  // Only OWNER can change roles
  const guard = requireAdminRole(session, [ROLES.OWNER, 'Owner'] as any);
  if (guard) return guard;

  const { id } = await params;
  const { role } = await req.json();

  if (!Object.values(ROLES).includes(role as any)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const before = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (!before) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const user = await prisma.user.update({
    where: { id },
    data: { role: role as any },
  });

  await logAudit({
    session,
    action: 'user.role.changed',
    targetType: 'User',
    targetId: id,
    before: { role: before.role },
    after: { role: user.role },
    ip: getClientIp(req),
  });

  return NextResponse.json(user);
}
