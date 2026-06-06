import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus, ActivityType } from '@prisma/client';

const WHAPI_URL = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
const TOKEN = process.env.WHAPI_TOKEN;
const GROUP_ID = process.env.WHAPI_GROUP_ID;

async function whapi(method: string, path: string, body?: object): Promise<any> {
  try {
    const res = await fetch(`${WHAPI_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) console.error('[WhWebhook] whapi non-ok', method, path, res.status, text.slice(0, 200));
    try { return JSON.parse(text); } catch { return { ok: res.ok, raw: text }; }
  } catch (err) {
    console.error('[WhWebhook] whapi call failed', method, path, err);
    return null;
  }
}

// phone -> display name, from WHAPI_TEAM="6285253224400:Maya,6285159332306:Excel"
function teamName(phone: string, fallback?: string): string {
  for (const pair of (process.env.WHAPI_TEAM || '').split(',')) {
    const [num, name] = pair.split(':');
    if (num?.trim() === phone && name?.trim()) return name.trim();
  }
  return fallback || phone;
}

function isClaimKeyword(text: string): boolean {
  const t = text.trim().toLowerCase();
  const exact = ['take', 'take lead', 'ambil', 'ambil lead', 'saya', 'claim', 'mine', 'taken'];
  return exact.includes(t) || t.startsWith('take');
}

function chatLink(phone?: string | null): string | null {
  if (!phone) return null;
  return `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '62')}`;
}

function leadSummary(lead: { phone?: string | null; source?: string | null }): string {
  const lines: string[] = [];
  if (lead.phone) lines.push(`Phone: ${lead.phone}`);
  if (lead.source) lines.push(`Source: ${lead.source}`);
  return lines.join('\n');
}

// Extract the button payload + sender from a Whapi inbound message (shape varies by version)
function parseButtonReply(msg: any): { payload?: string; from?: string; fromName?: string } {
  const payload =
    msg?.reply?.buttons_reply?.id ??
    msg?.reply?.list_reply?.id ??
    msg?.interactive?.button_reply?.id ??
    msg?.interactive?.list_reply?.id ??
    msg?.action?.id ??
    msg?.button?.id ??
    msg?.button?.payload;
  // strip Whapi's "ButtonsV3:" prefix if present
  const clean = typeof payload === 'string' ? payload.replace(/^ButtonsV3:/, '') : undefined;
  return { payload: clean, from: msg?.from, fromName: msg?.from_name };
}

export async function POST(req: NextRequest) {
  // optional shared-secret (set WHAPI_WEBHOOK_SECRET and append ?secret=... to the webhook URL)
  if (process.env.WHAPI_WEBHOOK_SECRET) {
    const got = req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret');
    if (got !== process.env.WHAPI_WEBHOOK_SECRET) return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    const messages: any[] = Array.isArray(data?.messages) ? data.messages : [];
    for (const msg of messages) {
      // Skip our OWN bot messages (alerts/confirmations sent via the API) to avoid loops,
      // but still process messages typed by the channel owner on their phone (source != 'api'),
      // so the owner can claim/comment too.
      if (msg?.from_me && (msg?.source === 'api' || msg?.source === 'system')) continue;
      const from: string | undefined = msg?.from;
      if (!from) continue;

      // 1) Quick-reply button — works in 1:1 chats (not in groups)
      const { payload } = parseButtonReply(msg);
      if (payload?.startsWith('take:')) {
        await handleTake(payload.slice('take:'.length), from, msg?.from_name);
        continue;
      }

      // 2) Reply-to-message — works in groups, where reply buttons are not tappable.
      //    Manager replies "take" to the lead alert → claim; any other reply → CRM comment.
      const quotedId: string | undefined = msg?.context?.quoted_id;
      if (quotedId) {
        const lead = await prisma.lead.findFirst({ where: { waMessageId: quotedId } });
        if (lead) {
          const text = String(msg?.text?.body ?? msg?.text ?? '').trim();
          if (isClaimKeyword(text)) {
            await handleTake(lead.id, from, msg?.from_name);
          } else if (text) {
            await prisma.leadActivity
              .create({ data: { leadId: lead.id, type: ActivityType.COMMENT, notes: `${teamName(from, msg?.from_name)}: ${text}` } })
              .catch((e) => console.error('[WhWebhook] comment save failed:', e));
          }
          continue;
        }
      }

      if (process.env.WHAPI_WEBHOOK_DEBUG === '1') {
        console.log('[WhWebhook] unhandled msg:', JSON.stringify(msg).slice(0, 800));
      }
    }
  } catch (err) {
    console.error('[WhWebhook] Error:', err);
  }

  return NextResponse.json({ ok: true });
}

async function handleTake(leadId: string, fromPhone: string, fromName?: string) {
  const name = teamName(fromPhone, fromName);
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    if (GROUP_ID) await whapi('POST', '/messages/text', { to: GROUP_ID, body: '⚠️ Lead not found (already removed).' });
    return;
  }

  // claim-once: first tap wins
  if (lead.manager || lead.status !== LeadStatus.NEW) {
    if (GROUP_ID) {
      await whapi('POST', '/messages/text', {
        to: GROUP_ID,
        body: `⚠️ This lead is already taken by ${lead.manager ?? 'someone'}.`,
      });
    }
    return;
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: { status: LeadStatus.IN_PROGRESS, manager: name, claimedById: fromPhone, claimedAt: new Date() },
  });
  await prisma.leadActivity.create({
    data: { leadId, type: ActivityType.CLAIM, notes: `Lead taken by ${name} (${fromPhone}) via WhatsApp` },
  });

  // "deactivate" the button: delete the original alert, repost a buttonless confirmation
  if (lead.waMessageId) await whapi('DELETE', `/messages/${lead.waMessageId}`);
  if (GROUP_ID) {
    const link = chatLink(updated.phone);
    const body = [`✅ Taken by ${name}`, '', leadSummary(updated), link ? `\n💬 Chat: ${link}` : '']
      .filter(Boolean)
      .join('\n');
    await whapi('POST', '/messages/text', { to: GROUP_ID, body });
  }
}
