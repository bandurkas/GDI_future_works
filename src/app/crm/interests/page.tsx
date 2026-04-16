import { prisma } from '@/lib/prisma';
import InterestsView from './InterestsView';

export const dynamic = 'force-dynamic';

export default async function CrmInterestsPage() {
  const leads = await prisma.lead.findMany({
    where: {
      source: 'Interest Form',
      deletedAt: null,
    },
    include: {
      activities: {
        where: { type: 'EMAIL' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return <InterestsView leads={JSON.parse(JSON.stringify(leads))} />;
}
