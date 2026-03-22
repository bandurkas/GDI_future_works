import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { jwtVerify } from 'jose';

// jose is required for Edge runtime JWT verification since jsonwebtoken uses Node.js crypto APIs
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_SECRET environment variable");
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      if (token) {
        // Redirect already logged-in users away from the login page
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      // Redirect unauthenticated users to the login page
      const url = new URL('/admin/login', req.url);
      url.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(url);
    }

    const userRole = (token as any).role;
    
    // Explicitly guard User Management
    if (pathname.startsWith('/admin/users') && userRole !== 'Owner') {
        const unauthorizedUrl = new URL('/admin', req.url);
        unauthorizedUrl.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Protect student/lead routes (/dashboard, /profile)
  const isStudentRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isAuthRoute = pathname === '/login' || pathname === '/signup';
  
  const gdiSession = req.cookies.get('gdi_session')?.value;

  if (isStudentRoute) {
    // If NextAuth token exists, we are authenticated
    if (token) {
        return NextResponse.next();
    }

    // Fallback to legacy gdi_session check
    if (!gdiSession) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      await jwtVerify(gdiSession, getJwtSecret());
      // Valid token, proceed
    } catch (err) {
      // Invalid or expired token
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete('gdi_session');
      return response;
    }
  }

  // Redirect authenticated users away from login/signup pages
  if (isAuthRoute) {
    if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (gdiSession) {
        try {
          await jwtVerify(gdiSession, getJwtSecret());
          return NextResponse.redirect(new URL('/dashboard', req.url));
        } catch (err) {
          // Invalid token, allow them to view login page
          const response = NextResponse.next();
          response.cookies.delete('gdi_session');
          return response;
        }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/login', '/signup'],
};
