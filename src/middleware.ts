import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';
import { checkRateLimit } from './lib/rate-limit';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET environment variable');
  return new TextEncoder().encode(secret);
}

import { ALL_ADMIN_ROLES, SYSTEM_ADMIN_ROLES, TUTOR_MANAGER_ROLES, STUDENT_MANAGER_ROLES, ROLES } from './lib/roles';
import { verifyCrmToken } from './lib/crm-session';

// ─── Route → minimum required roles ───
const ROUTE_PERMISSIONS: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/admin/users',     roles: [ROLES.OWNER, 'Owner'] },
  { prefix: '/admin/settings',  roles: SYSTEM_ADMIN_ROLES },
  { prefix: '/admin/audit-log', roles: SYSTEM_ADMIN_ROLES },
  { prefix: '/admin/payments',  roles: [ROLES.OWNER, ROLES.ADMIN, 'Owner', ROLES.SALES_MANAGER, 'SalesManager'] },
  { prefix: '/admin/leads',     roles: [ROLES.OWNER, ROLES.ADMIN, 'Owner', ROLES.SALES_MANAGER, 'SalesManager'] },
  { prefix: '/admin/tutors',    roles: TUTOR_MANAGER_ROLES },
  { prefix: '/admin/students',  roles: STUDENT_MANAGER_ROLES },
  { prefix: '/admin/courses',   roles: ALL_ADMIN_ROLES },
  { prefix: '/admin',           roles: ALL_ADMIN_ROLES },
];

const ADMIN_ROLES = ALL_ADMIN_ROLES;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // NextAuth v5 changed the cookie name from 'next-auth.session-token' to 'authjs.session-token'
  // On HTTPS (production) it is prefixed with '__Secure-'
  const secureCookies = process.env.NEXTAUTH_URL?.startsWith('https://') ?? process.env.NODE_ENV === 'production';
  const cookieName = secureCookies ? '__Secure-authjs.session-token' : 'authjs.session-token';
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName, salt: cookieName });

  // ── Forward pathname to server components via header (used in admin/layout.tsx) ──
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  // ─── Admin routes ───────────────────────────────────────────────────────────
  if (pathname.startsWith('/admin')) {
    // Rate limit check for admin API routes
    if (pathname.startsWith('/api/admin')) {
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const { success } = await checkRateLimit(`admin-api-${ip}`);
      if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
      }
    }
    // Login page: already-authed users bounce to dashboard
    if (pathname === '/admin/login') {
      if (token && ADMIN_ROLES.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Not authenticated → go to login
    if (!token) {
      const url = new URL('/admin/login', req.nextUrl.origin);
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url);
    }

    const userRole = token.role as string;

    // Not an admin role at all → back to login
    if (!ADMIN_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', req.url));
    }

    // Route-level permission check (most specific prefix wins)
    for (const rule of ROUTE_PERMISSIONS) {
      if (pathname.startsWith(rule.prefix)) {
        if (!rule.roles.includes(userRole)) {
          const url = new URL('/admin', req.url);
          url.searchParams.set('error', 'unauthorized');
          return NextResponse.redirect(url);
        }
        break;
      }
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/admin/:path*', '/crm/:path*', '/login', '/signup', '/dashboard', '/dashboard/:path*', '/profile', '/profile/:path*'],
};
