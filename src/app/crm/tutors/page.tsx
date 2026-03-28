import { prisma } from '@/lib/prisma';
import TutorsView from './TutorsView';

const tutorInclude = {
  user: { select: { name: true, email: true, phone: true } },
  availability: { orderBy: [{ dayOfWeek: 'asc' as const }, { startTimeM: 'asc' as const }] },
  profile: true,
};

export default async function CrmTutorsPage() {
  const [applications, tutors, archivedTutors] = await Promise.all([
    prisma.tutorApplication.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.tutor.findMany({
      where: { status: 'APPROVED' },
      include: tutorInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.tutor.findMany({
      where: { status: 'ARCHIVED' },
      include: tutorInclude,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return <TutorsView applications={applications} tutors={tutors} archivedTutors={archivedTutors} />;
}
