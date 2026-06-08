/**
 * One-off re-invite broadcast to QUALIFIED CRM leads for the 13 Juni webinar.
 *
 * SAFETY: dry-run by default. It only actually sends when DRY_RUN=0.
 *   Dry run (default):  npx tsx scripts/webinar-broadcast.ts
 *   Real send:          DRY_RUN=0 npx tsx scripts/webinar-broadcast.ts
 *
 * Safeguards: WhatsApp-existence check (skip non-WA), ~8–14s throttle between
 * sends, dedupe by normalized phone, skip anyone already registered for this
 * webinar, hard cap, soft opt-out line.
 */
import { prisma } from '../src/lib/prisma';
import { sendWhatsAppMessage, whatsappExists } from '../src/lib/whatsapp-send';
import { WEBINAR_DATE, WEBINAR_DATE_LABEL, WEBINAR_TIME_LABEL, normalizeIdPhone } from '../src/lib/webinar';

const DRY_RUN = process.env.DRY_RUN !== '0';
const HARD_CAP = 200; // sanity guard
const MIN_DELAY = 8000;
const MAX_DELAY = 14000;
const REGISTER_URL = 'https://gdifuture.works/webinar';

function firstName(name?: string | null, phone?: string): string {
    if (!name) return '';
    const n = name.trim();
    if (!n || /wa lead|peserta/i.test(n)) return '';
    if (phone && n.replace(/\D/g, '') === phone) return '';
    return n.split(/\s+/)[0];
}

function buildMessage(name?: string | null, phone?: string): string {
    const f = firstName(name, phone);
    const hi = f ? `Halo ${f}! ` : 'Halo! ';
    return (
        `${hi}👋 Kemarin kami adain webinar *AI Vibe Coding* — kalau kamu belum sempat ikut, kabar baik: kami buka sesi lagi!\n\n` +
        `🗓️ ${WEBINAR_DATE_LABEL}\n` +
        `⏰ ${WEBINAR_TIME_LABEL}\n` +
        `💻 Online via Zoom — GRATIS\n\n` +
        `Belajar pakai AI (Claude, Gemini, GPT) buat ngoding lebih cepat, plus live build bareng. Amankan slot kamu di sini:\n` +
        `👉 ${REGISTER_URL}\n\n` +
        `Sampai ketemu di sana! 🙌\n` +
        `(Balas STOP kalau gak mau terima info webinar lagi.)`
    );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
    const leads = await prisma.lead.findMany({
        where: { type: 'STUDENT', deletedAt: null, status: 'QUALIFIED', phone: { not: null } },
        select: { name: true, phone: true },
    });

    // Dedupe by normalized phone; drop too-short.
    const byPhone = new Map<string, { name: string | null; phone: string }>();
    for (const l of leads) {
        const p = normalizeIdPhone(l.phone || '');
        if (p.length >= 10 && !byPhone.has(p)) byPhone.set(p, { name: l.name, phone: p });
    }

    // Skip anyone already registered for this webinar.
    const regs = await prisma.webinarRegistration.findMany({
        where: { webinarDate: WEBINAR_DATE },
        select: { phone: true },
    });
    const already = new Set(regs.map((r) => r.phone));
    const recipients = [...byPhone.values()].filter((r) => !already.has(r.phone));

    console.log(`Qualified leads: ${leads.length} | unique phones: ${byPhone.size} | after skip-registered: ${recipients.length}`);
    console.log(`Mode: ${DRY_RUN ? 'DRY-RUN (no sends)' : '*** REAL SEND ***'}`);
    console.log('\n--- sample message ---\n' + buildMessage(recipients[0]?.name, recipients[0]?.phone) + '\n----------------------\n');

    if (recipients.length > HARD_CAP) {
        console.error(`Recipients (${recipients.length}) exceed HARD_CAP (${HARD_CAP}) — aborting.`);
        process.exit(1);
    }

    if (DRY_RUN) {
        console.log('First 5 recipients (masked):');
        recipients.slice(0, 5).forEach((r) => console.log(`  ${r.phone.slice(0, 5)}***${r.phone.slice(-3)}  ${firstName(r.name, r.phone) || '(no name)'}`));
        console.log('\nDRY-RUN complete. Re-run with DRY_RUN=0 to send.');
        return;
    }

    let sent = 0, skippedNoWa = 0, failed = 0;
    for (let i = 0; i < recipients.length; i++) {
        const r = recipients[i];
        const wa = await whatsappExists(r.phone);
        if (wa.known && !wa.valid) { skippedNoWa++; console.log(`[${i + 1}/${recipients.length}] skip (not on WA): ${r.phone}`); continue; }
        const res = await sendWhatsAppMessage(r.phone, buildMessage(r.name, r.phone));
        if (res.ok) { sent++; console.log(`[${i + 1}/${recipients.length}] sent: ${r.phone}`); }
        else { failed++; console.log(`[${i + 1}/${recipients.length}] FAIL: ${r.phone} — ${res.error}`); }
        if (i < recipients.length - 1) await sleep(MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY));
    }
    console.log(`\nDone. sent=${sent} skippedNoWa=${skippedNoWa} failed=${failed}`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
