import { prisma } from './prisma';
import { sendWhatsAppMessage, whatsappExists, notifyWhatsAppGroup } from './whatsapp-send';
import {
    WEBINAR_DATE,
    WEBINAR_DATE_LABEL,
    REMINDER_OFFSETS_MS,
    buildWebinarMessage,
    normalizeIdPhone,
    type MessageKind,
} from './webinar';

const MAX_ATTEMPTS = 5;

/**
 * Move the matching CRM lead(s) into the QUALIFIED pipeline column once the Zoom
 * link has been sent. Matches by normalized phone (62-form + local 0-form, both
 * occur in stored leads). Never downgrades a lead already past QUALIFIED.
 */
async function qualifyLeadByPhone(phone: string): Promise<void> {
    const local0 = phone.startsWith('62') ? '0' + phone.slice(2) : phone;
    try {
        await prisma.$executeRaw`
            UPDATE "Lead"
            SET status = 'QUALIFIED', "updatedAt" = now()
            WHERE "deletedAt" IS NULL
              AND status IN ('NEW', 'IN_PROGRESS', 'CONTACTED')
              AND regexp_replace(phone, '[^0-9]', '', 'g') IN (${phone}, ${local0})`;
    } catch (e) {
        console.error('[qualifyLeadByPhone] failed', e);
    }
}

/**
 * Register a person for the webinar and arm the WhatsApp automation. This is the
 * single entry point — driven by the landing-page lead capture (the data we
 * already have). The Google Form is a parallel, optional record channel and no
 * longer gates anything.
 *
 * - Idempotent per (phone, webinarDate).
 * - Verifies the number is on WhatsApp; if Whapi is sure it isn't, flags
 *   waValid=false, skips the (doomed) queue, and alerts the sales group.
 * - On success: sends the confirmation (with the Zoom link) immediately and
 *   queues the H-1 / 30-min / start reminders as follow-up nudges.
 */
export async function registerForWebinar(input: {
    name?: string | null;
    phone: string;
    email?: string | null;
    gender?: string | null;
    reason?: string | null;
    source?: string;
}): Promise<{ status: 'registered' | 'already_registered' | 'registered_no_wa' | 'invalid_phone'; id?: string }> {
    const phone = normalizeIdPhone(input.phone);
    if (phone.length < 10) return { status: 'invalid_phone' };

    const existing = await prisma.webinarRegistration.findUnique({
        where: { phone_webinarDate: { phone, webinarDate: WEBINAR_DATE } },
    });
    if (existing) {
        if (existing.waValid) await qualifyLeadByPhone(phone); // link already sent → keep them in Qualified
        return { status: 'already_registered', id: existing.id };
    }

    const wa = await whatsappExists(phone);
    const waValid = !(wa.known && !wa.valid);

    let reg: { id: string; name: string };
    try {
        reg = await prisma.webinarRegistration.create({
            data: {
                name: input.name?.trim() || 'Peserta',
                phone,
                email: input.email || null,
                gender: input.gender || null,
                reason: input.reason || null,
                webinarDate: WEBINAR_DATE,
                source: input.source || 'webinar_landing',
                waValid,
            },
        });
    } catch (e) {
        // Concurrent double-submit lost the unique race — already registered.
        if (e && typeof e === 'object' && (e as { code?: string }).code === 'P2002') {
            const ex = await prisma.webinarRegistration.findUnique({
                where: { phone_webinarDate: { phone, webinarDate: WEBINAR_DATE } },
            });
            return { status: 'already_registered', id: ex?.id };
        }
        throw e;
    }

    if (!waValid) {
        notifyWhatsAppGroup(
            `⚠️ Pendaftar webinar dengan nomor TIDAK aktif di WhatsApp\n\n` +
                `Nama: ${reg.name}\nNomor: ${phone}\nWebinar: AI Vibe Coding (${WEBINAR_DATE_LABEL})\n\n` +
                `Mohon follow up untuk minta nomor WhatsApp yang aktif — kalau tidak, dia tidak akan terima link Zoom & pengingat.`,
        ).catch((e) => console.error('[registerForWebinar] group alert failed', e));
        return { status: 'registered_no_wa', id: reg.id };
    }

    await enqueueWebinarMessages({ to: phone, name: reg.name });
    await processDueMessages();
    await qualifyLeadByPhone(phone); // link sent → move lead to Qualified
    return { status: 'registered', id: reg.id };
}

/**
 * Enqueue the confirmation + the three reminders for a registration.
 * - zoom_confirm is due immediately (sendAt = now).
 * - reminders whose time has already passed are skipped.
 * The unique constraint (to, kind, webinarDate) makes this idempotent, so a
 * duplicate form submit never double-schedules.
 */
export async function enqueueWebinarMessages(reg: { to: string; name?: string | null }) {
    const now = new Date();
    const rows: Array<{
        to: string;
        name: string | null;
        kind: MessageKind;
        body: string;
        webinarDate: Date;
        sendAt: Date;
    }> = [];

    const push = (kind: MessageKind, sendAt: Date) => {
        rows.push({
            to: reg.to,
            name: reg.name ?? null,
            kind,
            body: buildWebinarMessage(kind, reg.name ?? undefined),
            webinarDate: WEBINAR_DATE,
            sendAt,
        });
    };

    push('zoom_confirm', now);
    (Object.keys(REMINDER_OFFSETS_MS) as Array<keyof typeof REMINDER_OFFSETS_MS>).forEach((kind) => {
        const sendAt = new Date(WEBINAR_DATE.getTime() + REMINDER_OFFSETS_MS[kind]);
        if (sendAt.getTime() > now.getTime()) push(kind, sendAt);
    });

    if (rows.length === 0) return 0;
    const res = await prisma.scheduledMessage.createMany({ data: rows, skipDuplicates: true });
    return res.count;
}

/**
 * Send all messages whose sendAt has passed. Idempotent and safe to run
 * concurrently: each row is claimed via a compare-and-set on `attempts`, so two
 * overlapping runs (cron + inline flush) never send the same row twice.
 * At-least-once semantics — a crash mid-send may retry, which is fine for reminders.
 */
export async function processDueMessages(limit = 100) {
    const now = new Date();
    const due = await prisma.scheduledMessage.findMany({
        where: {
            status: { in: ['PENDING', 'FAILED'] },
            attempts: { lt: MAX_ATTEMPTS },
            sendAt: { lte: now },
        },
        orderBy: { sendAt: 'asc' },
        take: limit,
    });

    let sent = 0;
    let failed = 0;
    for (const m of due) {
        // Claim: only one worker wins the attempts bump for this (id, attempts).
        const claim = await prisma.scheduledMessage.updateMany({
            where: { id: m.id, attempts: m.attempts, status: { in: ['PENDING', 'FAILED'] } },
            data: { attempts: m.attempts + 1 },
        });
        if (claim.count !== 1) continue;

        const result = await sendWhatsAppMessage(m.to, m.body);
        if (result.ok) {
            sent++;
            await prisma.scheduledMessage.update({
                where: { id: m.id },
                data: { status: 'SENT', sentAt: new Date(), lastError: null },
            });
        } else {
            failed++;
            await prisma.scheduledMessage.update({
                where: { id: m.id },
                data: { status: 'FAILED', lastError: (result.error || 'unknown').slice(0, 500) },
            });
        }
    }

    return { picked: due.length, sent, failed };
}
