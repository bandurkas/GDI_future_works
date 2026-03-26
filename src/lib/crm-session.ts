import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

const secret = () =>
  new TextEncoder().encode(process.env.CRM_SECRET || 'crm-super-secret-key-change-in-prod');

export async function signCrmToken(email: string) {
  return new SignJWT({ email, type: 'crm' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyCrmToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

/** For server components / layouts */
export async function getCrmSession() {
  const store = await cookies();
  const token = store.get('crm_session')?.value;
  if (!token) return null;
  return verifyCrmToken(token);
}

/** For API route handlers (NextRequest) */
export async function getCrmSessionFromReq(req: NextRequest) {
  const token = req.cookies.get('crm_session')?.value;
  if (!token) return null;
  return verifyCrmToken(token);
}
