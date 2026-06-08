import { normalizeIdPhone } from './webinar';

/**
 * Send a free-form WhatsApp text to an individual number via Whapi.
 * Returns {ok:false} (never throws) so callers can record FAILED + retry.
 *
 * Note: this is NOT fail-open like the lead-capture existence check — for the
 * webinar automation we need to know whether a send actually succeeded.
 */
export async function sendWhatsAppMessage(
    to: string,
    body: string,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
    const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
    const token = process.env.WHAPI_TOKEN;
    if (!token) return { ok: false, error: 'WHAPI_TOKEN not set' };

    const phone = normalizeIdPhone(to);
    if (phone.length < 10) return { ok: false, error: `invalid phone: ${to}` };

    try {
        const res = await fetch(`${apiUrl}/messages/text`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to: phone, body }),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return { ok: false, error: `whapi ${res.status}: ${text.slice(0, 200)}` };
        }
        const data = await res.json().catch(() => null);
        const messageId = data?.message?.id || data?.id || undefined;
        // Whapi returns { sent: true, message: {...} } on success.
        if (data && data.sent === false) {
            return { ok: false, error: `whapi sent=false: ${JSON.stringify(data).slice(0, 200)}` };
        }
        return { ok: true, messageId };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'fetch failed' };
    }
}

/**
 * Server-side WhatsApp existence check via Whapi /contacts.
 * The number is normalized to international digits (62…, no "+") — the format
 * Whapi expects. `known` is false when we couldn't determine (no token / API
 * error): callers should only treat a number as bad when `known && !valid`.
 */
export async function whatsappExists(phone: string): Promise<{ valid: boolean; known: boolean }> {
    const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
    const token = process.env.WHAPI_TOKEN;
    const clean = normalizeIdPhone(phone); // → 62…, no "+"
    if (!token || clean.length < 10) return { valid: true, known: false };

    try {
        const res = await fetch(`${apiUrl}/contacts`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocking: 'wait', contacts: [clean] }),
        });
        if (!res.ok) return { valid: true, known: false };
        const data = await res.json().catch(() => null);
        const contact = Array.isArray(data?.contacts) ? data.contacts[0] : null;
        if (!contact || !contact.status) return { valid: true, known: false };
        return { valid: contact.status === 'valid', known: true };
    } catch {
        return { valid: true, known: false };
    }
}

/**
 * Post a raw text to the sales WhatsApp group (WHAPI_GROUP_ID) — used for
 * follow-up alerts. Group IDs (…@g.us) are passed through unchanged.
 */
export async function notifyWhatsAppGroup(text: string): Promise<boolean> {
    const apiUrl = process.env.WHAPI_API_URL || 'https://gate.whapi.cloud';
    const token = process.env.WHAPI_TOKEN;
    const group = process.env.WHAPI_GROUP_ID;
    if (!token || !group) return false;
    try {
        const res = await fetch(`${apiUrl}/messages/text`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: group, body: text }),
        });
        return res.ok;
    } catch {
        return false;
    }
}
