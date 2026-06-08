import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WEBINAR_DATE, normalizeIdPhone } from '@/lib/webinar';
import { enqueueWebinarMessages, processDueMessages } from '@/lib/webinar-dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Receives a Google-Form submission (via the bound Apps Script onFormSubmit
 * trigger) and arms the WhatsApp automation: store the registration, send the
 * Zoom confirmation immediately, and queue the 1-day / 30-min / start reminders.
 *
 * Auth: shared secret in `x-webinar-secret` header or `?secret=` query, matched
 * against env WEBINAR_SECRET. Idempotent per (phone, webinarDate).
 */
export async function POST(req: NextRequest) {
    const secret = process.env.WEBINAR_SECRET;
    if (!secret) {
        console.error('[webinar/registered] WEBINAR_SECRET not set');
        return NextResponse.json({ error: 'not configured' }, { status: 500 });
    }
    const provided = req.headers.get('x-webinar-secret') || req.nextUrl.searchParams.get('secret');
    if (provided !== secret) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
    }

    const name = String(body.name || '').trim();
    const rawPhone = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim() : null;
    const gender = body.gender ? String(body.gender).trim() : null;
    const reason = body.reason ? String(body.reason).trim() : null;

    const phone = normalizeIdPhone(rawPhone);
    if (phone.length < 10) {
        return NextResponse.json({ error: 'invalid phone', phone: rawPhone }, { status: 400 });
    }

    try {
        // Idempotent: if this number already registered for this webinar, do nothing.
        const existing = await prisma.webinarRegistration.findUnique({
            where: { phone_webinarDate: { phone, webinarDate: WEBINAR_DATE } },
        });
        if (existing) {
            return NextResponse.json({ ok: true, status: 'already_registered', id: existing.id });
        }

        const reg = await prisma.webinarRegistration.create({
            data: { name: name || 'Peserta', phone, email, gender, reason, webinarDate: WEBINAR_DATE },
        });

        // Queue confirmation + reminders, then flush the now-due confirmation inline
        // so the registrant gets the Zoom link instantly (cron handles the rest).
        await enqueueWebinarMessages({ to: phone, name: reg.name });
        const flushed = await processDueMessages();

        return NextResponse.json({ ok: true, status: 'registered', id: reg.id, flushed });
    } catch (error) {
        console.error('[webinar/registered] error', error);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}
