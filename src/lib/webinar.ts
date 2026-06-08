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

export function getGoogleFormUrl(): string {
    return process.env.GOOGLE_FORM_URL || 'https://forms.gle/PnbxXmyPs8cxkPcL6';
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

/** Build the WhatsApp body for a given message kind. */
export function buildWebinarMessage(kind: MessageKind, name?: string): string {
    const zoom = getZoomLink();
    const hi = name ? `Halo ${name.split(' ')[0]}! ` : 'Halo! ';
    switch (kind) {
        case 'zoom_confirm':
            return (
                `Slot kamu terkunci ✅\n\n` +
                `*Webinar AI Vibe Coding*\n` +
                `🗓️ ${WEBINAR_DATE_LABEL}\n` +
                `⏰ ${WEBINAR_TIME_LABEL}\n` +
                `💻 Zoom: ${zoom}\n\n` +
                `Simpan pesan ini ya. Kami ingatkan lagi sebelum mulai. Sampai jumpa! 🎉`
            );
        case 'reminder_1d':
            return (
                `${hi}Pengingat: *besok* webinar AI Vibe Coding jam ${WEBINAR_TIME_LABEL} 🚀\n\n` +
                `Link Zoom kamu:\n${zoom}\n\n` +
                `Siapkan laptop & kopi ya ☕`
            );
        case 'reminder_30m':
            return (
                `30 menit lagi kita mulai! 🔴\n\n` +
                `*AI Vibe Coding* — ${WEBINAR_TIME_LABEL}\n` +
                `Gabung sekarang biar gak ketinggalan:\n${zoom}`
            );
        case 'reminder_start':
            return (
                `Kita LIVE sekarang 🔴\n\n` +
                `Webinar AI Vibe Coding udah dimulai — buruan gabung, jangan sampai kelewatan!\n👉 ${zoom}`
            );
    }
}

/** The WhatsApp message sent to a fresh webinar lead, inviting them to the form. */
export function buildFormInviteMessage(name?: string): string {
    const hi = name ? `Halo ${name.split(' ')[0]}! ` : 'Halo! ';
    return (
        `${hi}🎉 Terima kasih sudah daftar webinar *AI Vibe Coding* (${WEBINAR_DATE_LABEL}, ${WEBINAR_TIME_LABEL}).\n\n` +
        `Langkah terakhir biar slot kamu terkunci — isi formulir singkat ini (±1 menit):\n` +
        `👉 ${getGoogleFormUrl()}\n\n` +
        `Setelah kamu isi, kami kirim link Zoom-nya ke sini ya.`
    );
}
