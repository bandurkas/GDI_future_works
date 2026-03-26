import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { ALL_ADMIN_ROLES, TUTOR_MANAGER_ROLES, STUDENT_MANAGER_ROLES } from './roles';
import { getCrmSessionFromReq } from './crm-session';

/** Returns null if authorized via admin role OR valid CRM session. */
export async function requireAdminOrCrm(
  req: NextRequest,
  session: { user?: { role?: string } } | null,
  allowedRoles: string[]
): Promise<Response | null> {
  const adminGuard = requireAdminRole(session, allowedRoles);
  if (!adminGuard) return null;

  const crm = await getCrmSessionFromReq(req);
  if (crm) return null;

  return adminGuard;
}

/**
 * Call at the top of every admin API route handler.
 * Returns a 401/403 NextResponse if the request should be blocked,
 * or null if the caller is authorized.
 */
export function requireAdminRole(
  session: { user?: { role?: string } } | null,
  allowedRoles: string[]
): Response | null {
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = session.user.role;

  if (!role || !allowedRoles.includes(role)) {
    return Response.json(
      { error: 'Forbidden: insufficient role' },
      { status: 403 }
    );
  }

  return null;
}

export { ALL_ADMIN_ROLES as ADMIN_ROLES, TUTOR_MANAGER_ROLES, STUDENT_MANAGER_ROLES };
