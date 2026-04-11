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

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: { email: true, phone: true }
  });
  
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.lead.delete({
    where: { id }
  });

  await logAudit({
    session,
    action: 'lead.deleted',
    targetType: 'Lead',
    targetId: id,
    before: { email: lead.email, phone: lead.phone },
    after: null,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
