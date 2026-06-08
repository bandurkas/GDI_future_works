import { NextRequest, NextResponse } from 'next/server';
import { processDueMessages } from '@/lib/webinar-dispatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Tick endpoint for the webinar reminder queue. A VPS cron hits this every few
 * minutes; it sends every ScheduledMessage whose sendAt has passed (idempotent,
 * with retries). Auth: shared secret in `x-webinar-secret` header or `?secret=`.
 */
async function handle(req: NextRequest) {
    const secret = process.env.WEBINAR_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'not configured' }, { status: 500 });
    }
    const provided = req.headers.get('x-webinar-secret') || req.nextUrl.searchParams.get('secret');
    if (provided !== secret) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    try {
        const result = await processDueMessages();
        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        console.error('[webinar/cron] error', error);
        return NextResponse.json({ error: 'internal error' }, { status: 500 });
    }
}

export const GET = handle;
export const POST = handle;
