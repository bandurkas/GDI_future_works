import { NextRequest, NextResponse } from 'next/server';
import { signCrmToken } from '@/lib/crm-session';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const validEmail = process.env.CRM_EMAIL || 'bandurkas@gmail.com';
  const validPassword = process.env.CRM_PASSWORD || 'Admin123';

  if (
    email?.toLowerCase().trim() !== validEmail.toLowerCase() ||
    password !== validPassword
  ) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signCrmToken(email);

  const res = NextResponse.json({ ok: true });
  res.cookies.set('crm_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
