import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import StudentsClient from './StudentsClient';

const PAGE_SIZE = 50;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { q = '', status = 'ALL', page = '1' } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    ...(status !== 'ALL' && { status: status as any }),
    ...(q && {
      user: {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
        ],
      },
    }),
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        user: true,
        _count: { select: { bookings: true, payments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.student.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Students</h1>
        <p className="text-sm text-gray-400 mt-1">{total} total students</p>
      </div>
      <StudentsClient
        students={students as any}
        total={total}
        currentPage={currentPage}
        totalPages={totalPages}
        initialQ={q}
        initialStatus={status}
      />
    </div>
  );
}
