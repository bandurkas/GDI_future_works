import { prisma } from './prisma';
import { sendWhatsAppMessage } from './whatsapp-send';
import {
    WEBINAR_DATE,
    REMINDER_OFFSETS_MS,
    buildWebinarMessage,
    type MessageKind,
} from './webinar';

const MAX_ATTEMPTS = 5;

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
