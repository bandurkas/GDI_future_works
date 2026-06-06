import { sendEmail } from './email';
import { prisma } from './prisma';

const SALES_EMAIL = process.env.SALES_NOTIFY_EMAIL || process.env.CRM_EMAIL || 'bandurkas@gmail.com';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://gdifuture.works';

interface LeadInfo {
  id?: string;
  source: string;
  name?: string;
  email?: string;
  phone?: string;
  interest?: string;
  course?: string;
  country?: string;
}

/**
 * Notify sales team about a new lead.
 * Email via Resend + Telegram Bot API + WhatsApp + Make.com backup.
 */
export async function notifyNewLead(lead: LeadInfo) {
  const waLink = lead.phone
    ? `https://wa.me/${lead.phone.replace(/\D/g, '').replace(/^0/, '62')}`
    : null;
  const crmLink = `${BASE_URL}/crm/students`;
  const mailLink = lead.email && !lead.email.includes('@noemail.gdi')
    ? `mailto:${lead.email}`
    : null;

  // 1. Email notification
  try {
    await sendEmail({
      to: SALES_EMAIL,
      subject: `New Lead: ${lead.name || lead.phone || lead.email || 'Unknown'} (${lead.source})`,
      html: buildEmailHTML(lead, crmLink, waLink, mailLink),
    });
  } catch (err) {
    console.error('[SalesNotify] Email failed:', err);
  }

  // 2. WhatsApp Business API hook (Fonnte/Wablas/Meta — plug in via env)
  if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_KEY) {
    try {
      await fetch(process.env.WHATSAPP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.WHATSAPP_API_KEY,
        },
        body: JSON.stringify({
          target: process.env.SALES_NOTIFY_WHATSAPP || '628211704707',
          message: buildTelegramText(lead, crmLink),
        }),
      });
    } catch (err) {
      console.error('[SalesNotify] WhatsApp API failed:', err);
    }
  }

  // 3. Telegram Direct Bot API (inline buttons + save message_id for CRM editing)
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const text = buildTelegramText(lead, crmLink);
      const keyboard = {
        inline_keyboard: [
          [{ text: '✅ Ambil Lead', callback_data: `take:${lead.id}` }],
          [{ text: '📱 WhatsApp', url: waLink || `https://wa.me/${lead.phone?.replace(/\D/g, '') || ''}` }],
        ],
      };

      const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const msgId = json?.result?.message_id;
        if (msgId && lead.id) {
          prisma.lead.update({ where: { id: lead.id }, data: { tgMessageId: String(msgId) } })
            .catch(e => console.error('[SalesNotify] tgMessageId save failed:', e));
        }
      } else {
        const errBody = await response.text();
        console.error(`[SalesNotify] Telegram Direct failed (${response.status}):`, errBody);
      }
    } catch (err) {
      console.error('[SalesNotify] Telegram Direct failed:', err);
    }
  }

  // 4. WhatsApp group via Whapi. Reply buttons aren't tappable in WhatsApp groups, so the lead
  //    is claimed by REPLYING "take" to the alert (handled in /api/whatsapp/webhook, which records
  //    who replied). The "Message Lead" URL button DOES work in groups and opens the lead's chat.
  if (process.env.WHAPI_TOKEN && process.env.WHAPI_GROUP_ID && lead.id) {
    try {
      const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
      const mentionIds = (process.env.WHAPI_MENTION_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

      let text = buildWhatsAppText(lead);
      text += '\n\n↩️ Reply *take* to this message to claim the lead.';
      if (mentionIds.length) text += '\n' + mentionIds.map(id => `@${id}`).join(' ');

      const payload: Record<string, unknown> = waLink
        ? { to: process.env.WHAPI_GROUP_ID, type: 'button', body: { text }, action: { buttons: [{ type: 'url', id: 'msg', title: 'Message Lead', url: waLink }] } }
        : { to: process.env.WHAPI_GROUP_ID, body: text };
      if (mentionIds.length) payload.mentions = mentionIds;
      const endpoint = waLink ? '/messages/interactive' : '/messages/text';

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        // Save the group message id so the webhook can match replies and delete it on claim
        const json = await res.json().catch(() => null);
        const msgId = json?.message?.id;
        if (msgId) {
          prisma.lead.update({ where: { id: lead.id }, data: { waMessageId: String(msgId) } })
            .catch(e => console.error('[SalesNotify] waMessageId save failed:', e));
        }
      } else {
        console.error('[SalesNotify] Whapi group failed:', res.status, await res.text());
      }
    } catch (err) {
      console.error('[SalesNotify] Whapi group failed:', err);
    }
  }

  // 5. Make.com Webhook — disabled (set MAKE_WEBHOOK_ENABLED=true in .env to re-enable)
  if (process.env.MAKE_WEBHOOK_ENABLED === 'true' && process.env.MAKE_WEBHOOK_URL) {
    try {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          name: lead.name || 'Unknown',
          phone: lead.phone || 'Unknown',
          course: lead.course || lead.interest || 'Not specified',
          wa_link: waLink || `https://wa.me/${lead.phone?.replace(/\D/g, '') || ''}`,
          take_url: lead.id ? `${BASE_URL}/api/leads/take?id=${lead.id}` : null,
        }),
      });
    } catch (err) {
      console.error('[SalesNotify] Make.com Webhook failed:', err);
    }
  }
}

function buildTelegramText(lead: LeadInfo, crmLink: string): string {
  const lines = [`<b>🔥 NEW LEAD</b>`, ''];
  if (lead.name) lines.push(`<b>Name:</b> ${esc(lead.name)}`);
  if (lead.phone) lines.push(`<b>Phone:</b> ${esc(lead.phone)}`);
  if (lead.email && !lead.email.includes('@noemail.gdi')) lines.push(`<b>Email:</b> ${esc(lead.email)}`);
  if (lead.course || lead.interest) lines.push(`<b>Interest:</b> ${esc(lead.course || lead.interest || '')}`);
  lines.push(`<b>Source:</b> ${esc(lead.source)}`, '', `<a href="${crmLink}">📊 Open CRM</a>`);
  return lines.join('\n');
}

function buildWhatsAppText(lead: LeadInfo): string {
  const lines = ['🔥 NEW LEAD'];
  if (lead.name && lead.name !== lead.phone) lines.push(`Name: ${lead.name}`);
  if (lead.phone) lines.push(`Phone: ${lead.phone}`);
  if (lead.email && !lead.email.includes('@noemail.gdi')) lines.push(`Email: ${lead.email}`);
  if (lead.course || lead.interest) lines.push(`Interest: ${lead.course || lead.interest}`);
  lines.push(`Source: ${lead.source}`);
  return lines.join('\n');
}

function buildEmailHTML(lead: LeadInfo, crmLink: string, waLink: string | null, mailLink: string | null): string {
  const sourceIcon = lead.source.includes('Maya') ? '🤖' : lead.source.includes('Interest') ? '📋' : '📢';

  const btns: string[] = [];
  if (waLink) btns.push(btn(waLink, '#25D366', '📱 WhatsApp'));
  if (mailLink) btns.push(btn(mailLink, '#3b82f6', '✉️ Email'));
  btns.push(btn(crmLink, '#e43a3d', '📊 Open CRM'));

  const rows: string[] = [];
  rows.push(row('Source', `${sourceIcon} ${lead.source}`));
  if (lead.name) rows.push(row('Name', lead.name));
  if (lead.phone) rows.push(row('Phone', lead.phone));
  if (lead.email && !lead.email.includes('@noemail.gdi')) rows.push(row('Email', lead.email));
  if (lead.course) rows.push(row('Course', lead.course));
  if (lead.interest) rows.push(row('Interest', lead.interest));
  if (lead.country) rows.push(row('Country', lead.country));

  const time = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f5;">
<div style="max-width:520px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<div style="background:linear-gradient(135deg,#e43a3d,#c0292c);padding:24px 28px;color:#fff;">
<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.8;margin-bottom:6px;">⚡ Lead Alert</div>
<div style="font-size:22px;font-weight:800;">${esc(lead.name || lead.phone || lead.email || 'New Lead')}</div>
<div style="font-size:13px;opacity:0.85;margin-top:4px;">${sourceIcon} ${esc(lead.source)} · ${time} WIB</div>
</div>
<div style="padding:24px 28px;"><table style="width:100%;border-collapse:collapse;">${rows.join('')}</table></div>
<div style="padding:0 28px 28px;text-align:center;">${btns.join('&nbsp;&nbsp;')}</div>
<div style="padding:14px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
<span style="font-size:11px;color:#9ca3af;">GDI FutureWorks CRM · Respond within 15 min for best conversion</span>
</div></div></body></html>`;
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;font-size:12px;color:#6b7280;font-weight:600;width:90px;vertical-align:top;">${label}</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${esc(value)}</td></tr>`;
}

function btn(href: string, bg: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;padding:10px 20px;background:${bg};color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">${label}</a>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
