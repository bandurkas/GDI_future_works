import { NextRequest, NextResponse } from 'next/server';
import { registerForWebinar } from '@/lib/webinar-dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Optional Google-Form entry point (parallel record channel). The primary
 * trigger is the landing-page lead capture; this endpoint just reuses the same
 * registerForWebinar() so a bound Apps Script onFormSubmit can also arm the
 * automation. Auth: shared secret in `x-webinar-secret` header or `?secret=`.
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

    try {
        const result = await registerForWebinar({
            name: body.name ? String(body.name) : null,
            phone: String(body.phone || ''),
            email: body.email ? String(body.email) : null,
            gender: body.gender ? String(body.gender) : null,
            reason: body.reason ? String(body.reason) : null,
            source: 'google_form',
        });
        if (result.status === 'invalid_phone') {
            return NextResponse.json({ error: 'invalid phone', phone: body.phone }, { status: 400 });
        }
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('[webinar/registered] error', error);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}
