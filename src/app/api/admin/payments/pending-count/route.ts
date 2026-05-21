import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { getCrmSessionFromReq } from '@/lib/crm-session';
import { ALL_ADMIN_ROLES } from '@/lib/roles';

export async function GET(req: NextRequest) {
  const session = await auth();
  const role = session?.user?.role;
  const hasNextAuth = !!role && ALL_ADMIN_ROLES.includes(role as string);
  const hasLegacy = !!(await getCrmSessionFromReq(req));
  if (!hasNextAuth && !hasLegacy) return NextResponse.json({ count: 0 });

  const count = await prisma.payment.count({
    where: { status: { in: ['UNDER_REVIEW', 'PAYMENT_UPLOADED'] } },
  });

  return NextResponse.json({ count });
}
