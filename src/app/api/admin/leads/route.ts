import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';
import { notifyNewLead } from '@/lib/sales-notifications';

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const data = await req.json();

  // Apply defaults for WA leads without name/email
  const phone = data.phone?.trim() || null;
  const name = data.name?.trim() || 'WA Lead';
  const email = data.email?.trim() ||
    (phone ? `wa-${phone.replace(/\D/g, '')}@lead.com` : `wa-${Date.now()}@lead.com`);

  // Skip duplicate check for placeholder emails
  if (!email.endsWith('@lead.com')) {
    const existing = await prisma.lead.findFirst({
      where: { email, deletedAt: null }
    });
    if (existing) {
      return NextResponse.json({ error: 'Lead with this email already exists' }, { status: 400 });
    }
  }

  const newLead = await prisma.lead.create({
    data: {
      type: 'STUDENT',
      name,
      email,
      phone,
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

  // Notify sales team via Telegram (fire-and-forget)
  notifyNewLead({
    id: newLead.id,
    source: 'MANUAL (CRM)',
    name,
    email: email.endsWith('@lead.com') ? undefined : email,
    phone: phone || undefined,
    country: newLead.country || undefined,
  }).catch(e => console.error('[AdminLeads] notifyNewLead failed:', e));

  return NextResponse.json({ ok: true, lead: newLead });
}
