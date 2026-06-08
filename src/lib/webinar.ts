/**
 * Single source of truth for the webinar funnel: schedule, assets, phone
 * normalization, and the WhatsApp message templates used by the automation.
 *
 * Pure constants (WEBINAR_DATE / labels) are safe to import from the client
 * webinar landing page. The env-backed getters and message builders are only
 * ever called server-side (API routes), so missing NEXT_PUBLIC inlining on the
 * client is irrelevant.
 *
 * EDIT THESE TWO CONSTANTS TO RESCHEDULE THE WEBINAR.
 */
export const WEBINAR_DATE = new Date('2026-06-13T10:00:00+07:00'); // 13 Juni 2026, 10:00 WIB
export const WEBINAR_DATE_LABEL = '13 Juni 2026';
export const WEBINAR_TIME_LABEL = '10:00 WIB';

export function getZoomLink(): string {
    return process.env.ZOOM_LINK || '';
}

/** Reminder kinds, in send order. Offsets are relative to WEBINAR_DATE. */
export const REMINDER_OFFSETS_MS: Record<'reminder_1d' | 'reminder_30m' | 'reminder_start', number> = {
    reminder_1d: -24 * 60 * 60 * 1000,
    reminder_30m: -30 * 60 * 1000,
    reminder_start: 0,
};

export type MessageKind = 'zoom_confirm' | 'reminder_1d' | 'reminder_30m' | 'reminder_start';

/**
 * Normalize an Indonesian phone number to international digits (no +), e.g.
 * "0812-3456-789" / "+62 812..." / "812..." → "62812...". Whapi addresses
 * individual chats by this digit string.
 */
export function normalizeIdPhone(raw: string): string {
    let d = String(raw || '').replace(/\D/g, '');
    if (d.startsWith('620')) d = '62' + d.slice(3); // 6208xx → 628xx
    else if (d.startsWith('0')) d = '62' + d.slice(1); // 08xx → 628xx
    else if (d.startsWith('8')) d = '62' + d; // 8xx → 628xx
    return d;
}

/** Build the WhatsApp body for a given message kind. Warm, human Indonesian. */
export function buildWebinarMessage(kind: MessageKind, name?: string): string {
    const zoom = getZoomLink();
    const first = name ? name.split(' ')[0] : '';
    const hi = first ? `Halo ${first}! ` : 'Halo! ';
    switch (kind) {
        case 'zoom_confirm':
            return (
                `${hi}slot kamu resmi kekunci! ✅\n\n` +
                `Sampai ketemu di webinar *AI Vibe Coding* ya:\n` +
                `🗓️ ${WEBINAR_DATE_LABEL}\n` +
                `⏰ ${WEBINAR_TIME_LABEL}\n` +
                `💻 Link Zoom: ${zoom}\n\n` +
                `Simpen pesan ini biar gampang dicari pas harinya 🙂 Nanti aku ingetin lagi sebelum mulai, jadi kamu nggak bakal kelewatan. Sampai jumpa! 🎉`
            );
        case 'reminder_1d':
            return (
                `${hi}Besok hari-H nya nih 🎉\n\n` +
                `Webinar *AI Vibe Coding* mulai jam ${WEBINAR_TIME_LABEL}. Simpen dulu link Zoom-nya ya, biar besok tinggal klik:\n${zoom}\n\n` +
                `Siapin laptop sama kopi favorit kamu — kita bakal langsung praktek bareng ☕ Sampai ketemu besok!`
            );
        case 'reminder_30m':
            return (
                `${hi}Bentar lagi mulai — 30 menit lagi ya ⏳\n\n` +
                `Webinar *AI Vibe Coding* jam ${WEBINAR_TIME_LABEL}. Yuk masuk Zoom-nya dari sekarang biar nggak buru-buru:\n👉 ${zoom}\n\n` +
                `Aku tunggu di dalam! 🙌`
            );
        case 'reminder_start':
            return (
                `Kita udah mulai, lho! 🔴\n\n` +
                `Webinar *AI Vibe Coding* lagi jalan sekarang. Masih keburu kok — yuk langsung gabung, sayang banget kalau kelewatan:\n👉 ${zoom}\n\n` +
                `Ditunggu ya! 🙌`
            );
    }
}
