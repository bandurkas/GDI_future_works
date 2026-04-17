import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadStatus, ActivityType } from '@prisma/client';

const GROUP_ID = process.env.TELEGRAM_CHAT_ID!;

// userId → leadId (menunggu input komentar)
const pendingComment = new Map<number, string>();

async function tg(method: string, body: object): Promise<any> {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  return res.json();
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildText(lead: {
  name?: string | null; phone?: string | null; email?: string | null;
  source?: string | null; status: string; manager?: string | null;
}): string {
  const lines = ['<b>🔥 Lead Baru di CRM!</b>', ''];
  if (lead.name) lines.push(`<b>Nama:</b> ${esc(lead.name)}`);
  if (lead.phone) lines.push(`<b>Telepon:</b> ${esc(lead.phone)}`);
  if (lead.email && !lead.email.includes('@noemail.gdi')) lines.push(`<b>Email:</b> ${esc(lead.email)}`);
  if (lead.source) lines.push(`<b>Sumber:</b> ${esc(lead.source)}`);
  lines.push('');

  const statusLabel: Record<string, string> = {
    NEW:         '🆕 Baru',
    IN_PROGRESS: '🔄 Sedang Diproses',
    CONTACTED:   '📞 Sudah Dihubungi',
    QUALIFIED:   '⭐ Qualified',
    CONVERTED:   '🎉 Converted',
    DONE:        '✅ Selesai',
  };
  lines.push(`<b>Status:</b> ${statusLabel[lead.status] ?? lead.status}`);
  if (lead.manager) lines.push(`<b>PIC:</b> ${esc(lead.manager)}`);
  return lines.join('\n');
}

function buildKeyboard(lead: { id: string; status: string; phone?: string | null }) {
  const waUrl = lead.phone
    ? `https://wa.me/${lead.phone.replace(/\D/g, '').replace(/^0/, '62')}`
    : null;

  if (lead.status === 'NEW') {
    const rows: object[][] = [[{ text: '✅ Ambil Lead', callback_data: `take:${lead.id}` }]];
    if (waUrl) rows.push([{ text: '📱 WhatsApp', url: waUrl }]);
    return { inline_keyboard: rows };
  }

  if (lead.status === 'IN_PROGRESS') {
    const rows: object[][] = [[
      { text: '💬 Komentar', callback_data: `comment:${lead.id}` },
      { text: '✅ Selesai', callback_data: `done:${lead.id}` },
    ]];
    if (waUrl) rows.push([{ text: '📱 WhatsApp', url: waUrl }]);
    return { inline_keyboard: rows };
  }

  return { inline_keyboard: [] };
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const update = await req.json();
    if (update.callback_query) {
      await handleCallback(update.callback_query);
    } else if (update.message) {
      await handleMessage(update.message);
    }
  } catch (err) {
    console.error('[TgWebhook] Error:', err);
  }

  return NextResponse.json({ ok: true });
}

async function handleCallback(cb: any) {
  const { id: cbId, data, from, message } = cb;
  const userId: number = from.id;
  const username = from.username ? `@${from.username}` : esc(from.first_name ?? 'Manager');
  const colonIdx = (data as string).indexOf(':');
  const action = data.slice(0, colonIdx);
  const leadId = data.slice(colonIdx + 1);

  await tg('answerCallbackQuery', { callback_query_id: cbId });

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) return;

  if (action === 'take') {
    if (lead.status !== LeadStatus.NEW) {
      await tg('answerCallbackQuery', {
        callback_query_id: cbId,
        text: `Lead ini sudah diambil oleh ${lead.manager ?? 'orang lain'}.`,
        show_alert: true,
      });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: LeadStatus.IN_PROGRESS, manager: username, tgUserId: String(userId) },
    });
    await prisma.leadActivity.create({
      data: { leadId, type: ActivityType.CLAIM, notes: `Lead diambil oleh ${username}` },
    });

    if (lead.tgMessageId) {
      await tg('editMessageText', {
        chat_id: GROUP_ID,
        message_id: Number(lead.tgMessageId),
        text: buildText(updated),
        parse_mode: 'HTML',
        reply_markup: buildKeyboard(updated),
      });
    }
    return;
  }

  if (action === 'comment') {
    if (lead.tgUserId && lead.tgUserId !== String(userId)) {
      await tg('answerCallbackQuery', {
        callback_query_id: cbId,
        text: 'Hanya PIC yang bisa menambahkan komentar.',
        show_alert: true,
      });
      return;
    }
    pendingComment.set(userId, leadId);
    await tg('sendMessage', {
      chat_id: GROUP_ID,
      text: `${username}, silakan kirim komentar Anda (teks atau pesan suara):`,
      reply_to_message_id: message?.message_id,
    });
    return;
  }

  if (action === 'done') {
    if (lead.tgUserId && lead.tgUserId !== String(userId)) {
      await tg('answerCallbackQuery', {
        callback_query_id: cbId,
        text: 'Hanya PIC yang bisa menutup lead.',
        show_alert: true,
      });
      return;
    }

    const updated = await prisma.lead.update({
      where: { id: leadId },
      data: { status: LeadStatus.DONE },
    });
    await prisma.leadActivity.create({
      data: { leadId, type: ActivityType.COMMENT, notes: `Lead ditutup oleh ${username}` },
    });

    if (lead.tgMessageId) {
      await tg('editMessageText', {
        chat_id: GROUP_ID,
        message_id: Number(lead.tgMessageId),
        text: buildText(updated),
        parse_mode: 'HTML',
        reply_markup: buildKeyboard(updated),
      });
    }
    return;
  }
}

async function handleMessage(msg: any) {
  const userId: number = msg.from?.id;
  if (!userId) return;

  const leadId = pendingComment.get(userId);
  if (!leadId) return;

  pendingComment.delete(userId);

  if (msg.voice) {
    await prisma.leadActivity.create({
      data: { leadId, type: ActivityType.VOICE, notes: msg.voice.file_id },
    });
    await tg('sendMessage', {
      chat_id: msg.chat.id,
      text: '✅ Pesan suara berhasil disimpan.',
      reply_to_message_id: msg.message_id,
    });
  } else if (msg.text) {
    await prisma.leadActivity.create({
      data: { leadId, type: ActivityType.COMMENT, notes: msg.text },
    });
    await tg('sendMessage', {
      chat_id: msg.chat.id,
      text: '✅ Komentar berhasil disimpan.',
      reply_to_message_id: msg.message_id,
    });
  }
}
