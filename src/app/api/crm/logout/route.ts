import { NextResponse } from 'next/server';

// Kept for backward compatibility — redirects to NextAuth signOut
// CrmShell now uses signOut() directly from next-auth/react,
// but this route remains as a fallback safety net.
export async function POST() {
  const res = NextResponse.redirect(new URL('/api/auth/signout', process.env.NEXTAUTH_URL || 'https://gdifuture.works'), 302);
  // Clear any legacy cookie that might exist from old sessions
  res.cookies.set('crm_session', '', { maxAge: 0, path: '/', domain: '.gdifuture.works' });
  return res;
}
