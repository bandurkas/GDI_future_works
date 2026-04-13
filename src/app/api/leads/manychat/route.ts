import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';

/**
 * ManyChat Webhook — receives qualified leads from ManyChat flows.
 * Configure in ManyChat: Custom Action → External Request → POST this URL.
 *
 * Expected payload (configure field mapping in ManyChat):
 * {
 *   "name": "...",
 *   "phone": "...",
 *   "email": "...",        // optional
 *   "channel": "whatsapp", // whatsapp | instagram | messenger
 *   "course": "...",       // from AI/flow qualification
 *   "budget": "...",       // optional
 *   "schedule": "...",     // optional
 *   "notes": "...",        // optional — AI conversation summary
 *   "manychat_id": "...",  // ManyChat subscriber ID
 *   "key": "..."           // simple auth key
 * }
 */

const WEBHOOK_KEY = process.env.MANYCHAT_WEBHOOK_KEY || 'gdi-mc-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Simple auth check
    if (body.key !== WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      name, phone, email, channel, course, budget, schedule, notes, manychat_id,
    } = body;

    if (!phone && !email) {
      return NextResponse.json({ error: 'Phone or email required' }, { status: 400 });
    }

    const cleanPhone = phone ? phone.replace(/\D/g, '') : null;
    const pseudoEmail = email || (cleanPhone ? `mc_${cleanPhone}@noemail.gdi` : `mc_${Date.now()}@noemail.gdi`);

    const channelLabel = channel === 'instagram' ? 'Instagram DM'
      : channel === 'messenger' ? 'Facebook Messenger'
      : channel === 'whatsapp' ? 'WhatsApp Bot'
      : 'ManyChat';

    const source = `ManyChat: ${channelLabel}`;

    // Upsert lead
    const existing = await prisma.lead.findFirst({
      where: { email: pseudoEmail },
      select: { id: true },
    });

    let leadId: string;
    if (existing) {
      leadId = existing.id;
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          status: 'NEW',
          source,
          phone: phone || undefined,
          name: name || undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      const lead = await prisma.lead.create({
        data: {
          type: 'STUDENT',
          name: name || 'ManyChat Lead',
          email: pseudoEmail,
          phone: phone || null,
          source,
          status: 'NEW',
          country: 'Indonesia',
        },
      });
      leadId = lead.id;
    }

    // Record activity with qualification data
    await prisma.leadActivity.create({
      data: {
        leadId,
        type: channel === 'whatsapp' ? 'WHATSAPP' : 'EMAIL',
        notes: JSON.stringify({
          channel: channelLabel,
          course: course || null,
          budget: budget || null,
          schedule: schedule || null,
          notes: notes || null,
          manychat_id: manychat_id || null,
          qualified_at: new Date().toISOString(),
        }),
      },
    });

    // Notify sales team
    notifyNewLead({
      source,
      name: name || undefined,
      phone: phone || undefined,
      email: email && !email.includes('@noemail.gdi') ? email : undefined,
      course: course || undefined,
      country: 'Indonesia',
    }).catch(err => console.error('[ManyChat] Notification failed:', err));

    return NextResponse.json({ ok: true, leadId });
  } catch (error) {
    console.error('[ManyChat webhook] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
