import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TutorsClient from './TutorsClient';

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string; status?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { tab = 'applications', q = '', status = 'ALL' } = await searchParams;

  const appWhere = {
    ...(status !== 'ALL' && { status: status as any }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { email: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  };

  const tutorWhere = q
    ? {
        user: {
          OR: [
            { name: { contains: q, mode: 'insensitive' as const } },
            { email: { contains: q, mode: 'insensitive' as const } },
          ],
        },
      }
    : {};

  const [tutors, applications, pendingCount] = await Promise.all([
    prisma.tutor.findMany({
      where: tutorWhere,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tutorApplication.findMany({
      where: appWhere,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tutorApplication.count({ where: { status: 'PENDING' } }),
  ]);

  return (
    <div className="max-w-7xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Tutors & Applications</h1>
        <p className="text-sm text-gray-400 mt-1">
          {tutors.length} active tutors · {pendingCount} pending applications
        </p>
      </div>
      <TutorsClient
        tutors={tutors as any}
        applications={applications as any}
        initialTab={tab as 'applications' | 'tutors'}
        initialQ={q}
        initialStatus={status}
        pendingCount={pendingCount}
      />
    </div>
  );
}
