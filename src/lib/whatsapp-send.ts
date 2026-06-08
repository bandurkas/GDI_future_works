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
