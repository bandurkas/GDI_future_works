import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { requireAdminOrCrm, STUDENT_MANAGER_ROLES } from '@/lib/auth-guards';
import { logAudit, getClientIp } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids')?.split(',');
  const status = searchParams.get('status');

  const where = {
    ...(ids && { id: { in: ids } }),
    ...(status && status !== 'ALL' && { status: status as any }),
  };

  const students = await prisma.student.findMany({
    where,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  const headers = ['ID', 'Name', 'Email', 'Status', 'Country', 'Joined'];
  const rows = students.map(s => [
    s.id,
    s.user?.name || '',
    s.user?.email || '',
    s.status,
    s.country || '',
    s.createdAt.toISOString(),
  ]);

  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="students-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const guard = await requireAdminOrCrm(req, session, STUDENT_MANAGER_ROLES);
  if (guard) return guard;

  const { ids, status } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
  }

  const VALID_STATUSES = ['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED', 'ARCHIVED'];
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const result = await prisma.student.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await logAudit({
      session,
      action: 'student.status.bulk_changed',
      targetType: 'Student',
      targetId: ids.join(','),
      before: { count: ids.length },
      after: { status, count: result.count },
      ip: getClientIp(req),
    });

    return NextResponse.json({ count: result.count });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
