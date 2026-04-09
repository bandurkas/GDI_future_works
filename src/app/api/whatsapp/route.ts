import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { headers, cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/whatsapp
 * A smart redirector that routes the user to the correct WhatsApp phone number
 * based on multi-layered signals:
 * 1. Forced debug parameter (for testing)
 * 2. User selection (Cookie)
 * 3. Cloudflare Geolocation (Header)
 * 4. Browser language (Accept-Language fallback)
 */
export async function GET(request: NextRequest) {
    const text = request.nextUrl.searchParams.get('text');
    const debugParam = request.nextUrl.searchParams.get('debug_country');
    
    const headerStore = await headers();
    const cookieStore = await cookies();

    // --- DETECTION LOGIC ---
    let country: string | null = null;
    let signal = 'default';

    // 1. Debug Override
    if (debugParam) {
        country = debugParam.toUpperCase();
        signal = 'debug_param';
    } 
    // 2. Cookie Preference (set by CurrencyContext/LanguageContext)
    else {
        const currencyCookie = cookieStore.get('GDI_CURRENCY')?.value;
        if (currencyCookie === 'IDR') {
            country = 'ID';
            signal = 'cookie_idr';
        } else if (currencyCookie === 'MYR') {
            country = 'MY';
            signal = 'cookie_myr';
        }
    }

    // 3. Cloudflare Header
    if (!country) {
        const cfCountry = headerStore.get('cf-ipcountry');
        if (cfCountry && cfCountry !== 'XX') {
            country = cfCountry.toUpperCase();
            signal = 'cloudflare';
        }
    }

    // 4. Accept-Language Fallback
    if (!country) {
        const acceptLang = headerStore.get('accept-language') ?? '';
        if (acceptLang.toLowerCase().includes('id')) {
            country = 'ID';
            signal = 'accept_language';
        }
    }

    // --- MAPPING ---
    // Indonesia gets the ID number, everyone else (including MY) gets the Malaysia number
    const isIndonesia = country === 'ID';
    const phone = isIndonesia ? '628211704707' : '60174833318';

    const url = new URL(`https://wa.me/${phone}`);
    if (text) {
        url.searchParams.set('text', text);
    }

    // --- RESPONSE ---
    return new NextResponse(null, {
        status: 302,
        headers: {
            'Location': url.toString(),
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Vary': 'Cookie, Accept-Language, cf-ipcountry',
            'X-Debug-Country': country ?? 'unknown',
            'X-Debug-Signal': signal,
        },
    });
}
