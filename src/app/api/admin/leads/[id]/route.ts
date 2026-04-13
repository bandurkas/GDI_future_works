import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED'];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.lead.update({ where: { id }, data: { status } });

  await logAudit({
    session,
    action: 'lead.status_changed',
    targetType: 'Lead',
    targetId: id,
    before: { status: lead.status },
    after: { status },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true, status });
}

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
