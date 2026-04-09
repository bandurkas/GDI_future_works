import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const text = request.nextUrl.searchParams.get('text');
    
    // Read the CF-IPCountry header set by Cloudflare
    // Fallback to 'MY' if not present (testing locally or missing)
    const country = request.headers.get('cf-ipcountry') || 'MY';

    // ID = Indonesia, all else (including MY) goes to the generic number
    const phone = country.toUpperCase() === 'ID' ? '628211704707' : '60174833318';

    const url = new URL(`https://wa.me/${phone}`);
    
    if (text) {
        url.searchParams.set('text', text);
    }

    return NextResponse.redirect(url.toString(), 302);
}
