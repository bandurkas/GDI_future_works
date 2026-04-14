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
  const data = await req.json();

  if (data.status && !VALID_STATUSES.includes(data.status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updateData: any = {};
  if (data.status) updateData.status = data.status;
  if (data.name) updateData.name = data.name;
  if (data.email) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.country !== undefined) updateData.country = data.country;

  await prisma.lead.update({ where: { id }, data: updateData });

  await logAudit({
    session,
    action: 'lead.updated',
    targetType: 'Lead',
    targetId: id,
    before: { status: lead.status },
    after: updateData,
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
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

  await prisma.lead.update({
    where: { id },
    data: { deletedAt: new Date() }
  });

  await logAudit({
    session,
    action: 'lead.archived',
    targetType: 'Lead',
    targetId: id,
    before: { email: lead.email, phone: lead.phone },
    after: { deletedAt: 'now' },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true });
}
