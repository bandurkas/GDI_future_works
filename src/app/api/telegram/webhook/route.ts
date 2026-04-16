import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handle Telegram Bot Webhooks
 * POST /api/telegram/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Handle Callback Queries (Button Clicks)
    if (body.callback_query) {
      const { data, from, message } = body.callback_query;
      const [action, leadId] = data.split(':');

      if (action === 'take') {
        const username = from.username || from.first_name || 'Manager';
        
        // Find lead
        const lead = await prisma.lead.findUnique({
          where: { id: leadId },
        });

        if (!lead) {
          return answerCallback(body.callback_query.id, '❌ Лид не найден');
        }

        // Check if already assigned
        if (lead.manager) {
          await editMessage(
            message.chat.id,
            message.message_id,
            `${message.text}\n\n⚠️ Уже взял @${lead.manager}`
          );
          return answerCallback(body.callback_query.id, `❌ Уже занято @${lead.manager}`);
        }

        // Atomic update
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            manager: username,
            status: 'CONTACTED',
            activities: {
              create: {
                type: 'CLAIM',
                notes: `Lead claimed by Telegram user @${username}`
              }
            }
          }
        });

        // Feedback in Telegram
        await editMessage(
          message.chat.id,
          message.message_id,
          `${message.text}\n\n✅ Лид взял @${username}`
        );

        return answerCallback(body.callback_query.id, '🚀 Вы взяли лид!');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[TelegramWebhook] Error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// Helpers
async function answerCallback(callbackQueryId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId, text, show_alert: true }),
  });
  return NextResponse.json({ ok: true });
}

async function editMessage(chatId: number, messageId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId, text, parse_mode: 'Markdown' }),
  });
}
