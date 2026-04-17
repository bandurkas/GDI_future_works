import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { notifyNewLead } from '@/lib/sales-notifications';

const VERIFY_TOKEN = process.env.META_WA_VERIFY_TOKEN || '';
const APP_SECRET   = process.env.META_WA_APP_SECRET   || '';

// GET — Meta webhook verification challenge
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode      = searchParams.get('hub.mode');
    const token     = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
        return new NextResponse(challenge, { status: 200 });
    }
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// POST — incoming WhatsApp messages from Meta Cloud API
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();

        // Verify HMAC SHA256 signature
        if (APP_SECRET) {
            const signature = req.headers.get('x-hub-signature-256') || '';
            const expected  = 'sha256=' + createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
            if (signature !== expected) {
                console.warn('[MetaWA] Invalid signature');
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const payload = JSON.parse(rawBody);

        // Must return 200 quickly — process async
        processWebhook(payload).catch(err => console.error('[MetaWA] Processing failed:', err));

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('[MetaWA] Parse error:', err);
        return NextResponse.json({ ok: true }); // always 200 to Meta
    }
}

async function processWebhook(payload: any) {
    const entries = payload?.entry ?? [];

    for (const entry of entries) {
        for (const change of entry?.changes ?? []) {
            if (change?.field !== 'messages') continue;

            const value    = change?.value ?? {};
            const messages = value?.messages ?? [];
            const contacts = value?.contacts ?? [];

            for (const msg of messages) {
                // Skip non-text/non-image/status updates
                if (!msg?.from) continue;

                const waId    = msg.from; // e.g. "628123456789"
                const phone   = '+' + waId;
                const contact = contacts.find((c: any) => c.wa_id === waId);
                const name    = contact?.profile?.name || 'Meta WA Lead';
                const text    = msg?.text?.body || msg?.type || '';

                // ctwa_clid from referral (Click-to-WhatsApp ad tracking)
                const ctwaClid = msg?.referral?.ctwa_clid || null;
                const adSource = msg?.referral?.source_type === 'ad' ? 'Click-to-WhatsApp' : 'WhatsApp';

                // Dedup: only create lead once per phone number
                const existing = await prisma.lead.findFirst({
                    where: { phone, source: 'Click-to-WhatsApp' },
                    select: { id: true },
                });

                if (existing) {
                    // Already a lead — just log the activity, no Telegram spam
                    await prisma.leadActivity.create({
                        data: {
                            leadId: existing.id,
                            type: 'WHATSAPP',
                            notes: JSON.stringify({ message: text, wa_id: waId }),
                        },
                    });
                    continue;
                }

                // New lead
                const lead = await prisma.lead.create({
                    data: {
                        type:      'STUDENT',
                        name,
                        email:     `wa_${waId}@noemail.gdi`,
                        phone,
                        source:    'Click-to-WhatsApp',
                        status:    'NEW',
                        country:   'Indonesia',
                        fbClientId: waId,
                        utmSource:  'meta',
                        utmMedium:  'cpc',
                        utmContent: ctwaClid,
                    },
                });

                await prisma.leadActivity.create({
                    data: {
                        leadId: lead.id,
                        type:   'WHATSAPP',
                        notes:  JSON.stringify({
                            message:    text,
                            wa_id:      waId,
                            ad_source:  adSource,
                            ctwa_clid:  ctwaClid,
                            referral:   msg?.referral || null,
                        }),
                    },
                });

                notifyNewLead({
                    id:     lead.id,
                    source: 'Click-to-WhatsApp',
                    name,
                    phone,
                }).catch(err => console.error('[MetaWA] Notify failed:', err));
            }
        }
    }
}
