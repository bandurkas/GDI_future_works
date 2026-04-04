import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCrmSessionFromReq } from '@/lib/crm-session';

export async function GET(req: NextRequest) {
  const session = await getCrmSessionFromReq(req);
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.payment.count({
    where: { status: { in: ['UNDER_REVIEW', 'PAYMENT_UPLOADED'] } },
  });

  return NextResponse.json({ count });
}
