import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { verifyCrmToken } from './lib/crm-session';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET environment variable');
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // NextAuth v5 changed the cookie name from 'next-auth.session-token' to 'authjs.session-token'
  // On HTTPS (production) it is prefixed with '__Secure-'
  const secureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production';
  const cookieName = secureCookies ? '__Secure-authjs.session-token' : 'authjs.session-token';
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName, salt: cookieName });

  // ── Forward pathname to server components via header ──
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  // ─── CRM routes ─────────────────────────────────────────────────────────────
  if (pathname.startsWith('/crm')) {
    if (pathname === '/crm/login') {
      const crmToken = req.cookies.get('crm_session')?.value;
      if (crmToken && await verifyCrmToken(crmToken)) {
        return NextResponse.redirect(new URL('/crm/students', req.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const crmToken = req.cookies.get('crm_session')?.value;
    if (!crmToken || !(await verifyCrmToken(crmToken))) {
      const res = NextResponse.redirect(new URL('/crm/login', req.url));
      res.cookies.delete('crm_session');
      return res;
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ─── Student/user protected routes ─────────────────────────────────────────
  const isStudentRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  const gdiSession = req.cookies.get('gdi_session')?.value;

  if (isStudentRoute) {
    if (token) return NextResponse.next({ request: { headers: requestHeaders } });

    if (!gdiSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await jwtVerify(gdiSession, getJwtSecret());
    } catch {
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('gdi_session');
      return response;
    }
  }

  // ─── Auth pages: redirect authenticated users to dashboard ─────────────────
  if (isAuthRoute) {
    if (token) return NextResponse.redirect(new URL('/dashboard', req.url));

    if (gdiSession) {
      try {
        await jwtVerify(gdiSession, getJwtSecret());
        return NextResponse.redirect(new URL('/dashboard', req.url));
      } catch {
        const response = NextResponse.next({ request: { headers: requestHeaders } });
        response.cookies.delete('gdi_session');
        return response;
      }
    }
  }

  // ─── WhatsApp redirection (High Performance) ─────────────────────────────
  if (pathname === '/api/whatsapp') {
    const text = req.nextUrl.searchParams.get('text');
    const debugParam = req.nextUrl.searchParams.get('debug_country');
    
    // Detection priority: Debug > Cookie > Cloudflare Header > Accept-Language
    let country: string | null = null;
    let signal = 'default';

    if (debugParam) {
      country = debugParam.toUpperCase();
      signal = 'debug_param';
    } else {
      const currencyCookie = req.cookies.get('GDI_CURRENCY')?.value;
      if (currencyCookie === 'IDR') {
        country = 'ID';
        signal = 'cookie_idr';
      } else if (currencyCookie === 'MYR') {
        country = 'MY';
        signal = 'cookie_myr';
      }
    }

    if (!country) {
      const cfCountry = req.headers.get('cf-ipcountry');
      if (cfCountry && cfCountry !== 'XX') {
        country = cfCountry.toUpperCase();
        signal = 'cloudflare';
      }
    }

    if (!country) {
      const acceptLang = req.headers.get('accept-language') ?? '';
      if (acceptLang.toLowerCase().includes('id')) {
        country = 'ID';
        signal = 'accept_language';
      }
    }

    const isIndonesia = country === 'ID';
    const phone = isIndonesia ? '628211704707' : '60174833318';
    
    const url = new URL(`https://wa.me/${phone}`);
    if (text) url.searchParams.set('text', text);

    const response = NextResponse.redirect(url.toString(), 302);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Vary', 'Cookie, Accept-Language, cf-ipcountry');
    response.headers.set('X-Debug-Country', country ?? 'unknown');
    response.headers.set('X-Debug-Signal', signal);
    return response;
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/crm/:path*', '/login', '/signup', '/dashboard', '/dashboard/:path*', '/profile', '/profile/:path*', '/api/whatsapp'],
};
