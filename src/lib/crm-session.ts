import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'gdi-secret-fallback');

/**
 * signs a JWT token for the CRM session.
 */
export async function signCrmToken(email: string) {
  return await new SignJWT({ email, role: 'ADMIN' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Gets the current CRM session from cookies in a server component/action.
 */
export async function getCrmSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('crm_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the CRM session from a NextRequest object (Edge/Middleware/Route).
 */
export async function getCrmSessionFromReq(req: NextRequest) {
  const token = req.cookies.get('crm_session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
