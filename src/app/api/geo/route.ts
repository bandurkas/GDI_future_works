import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * GET /api/geo
 * Returns the visitor's country code using Cloudflare's cf-ipcountry header.
 * Fallback: Accept-Language heuristic for dev/direct access (no Cloudflare).
 */
export async function GET() {
    const headerStore = await headers();

    // Priority 1: Cloudflare provides accurate country on every request
    const cfCountry = headerStore.get('cf-ipcountry');
    if (cfCountry && cfCountry !== 'XX') {
        return NextResponse.json(
            { country: cfCountry },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    }

    // Priority 2: Accept-Language fallback (dev / direct server access)
    const acceptLang = headerStore.get('accept-language') ?? '';
    const country = acceptLang.toLowerCase().includes('id') ? 'ID' : null;

    return NextResponse.json(
        { country },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
