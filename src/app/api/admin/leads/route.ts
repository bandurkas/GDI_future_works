import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const data = await req.json();

  if (!data.name || !data.email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  const existing = await prisma.lead.findFirst({
    where: { email: data.email, deletedAt: null }
  });

  if (existing) {
    return NextResponse.json({ error: 'Lead with this email already exists' }, { status: 400 });
  }

  const newLead = await prisma.lead.create({
    data: {
      type: 'STUDENT',
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      country: data.country || null,
      source: 'MANUAL',
      status: 'NEW',
    }
  });

  await logAudit({
    session,
    action: 'lead.created',
    targetType: 'Lead',
    targetId: newLead.id,
    before: null,
    after: { email: newLead.email, phone: newLead.phone },
    ip: getClientIp(req),
  });

  return NextResponse.json({ ok: true, lead: newLead });
}
