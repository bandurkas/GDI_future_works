import { prisma } from '@/lib/prisma';
import TutorsView from './TutorsView';

export default async function CrmTutorsPage() {
  const [applications, tutors] = await Promise.all([
    prisma.tutorApplication.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.tutor.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTimeM: 'asc' }] },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return <TutorsView applications={applications} tutors={tutors} />;
}
