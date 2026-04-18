import { prisma } from '@/lib/prisma';
import StudentsView from './StudentsView';

export const dynamic = 'force-dynamic';

export default async function CrmStudentsPage() {
  const tutorEmails = await prisma.tutorApplication.findMany({
    select: { email: true },
  });
  const tutorEmailSet = new Set(tutorEmails.map((t: { email: string }) => t.email));

  const students = await prisma.student.findMany({
    where: {
      deletedAt: null,
    },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: { status: true, amount: true, currency: true, metadata: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const studentsWithPhone = students
    .filter((st: any) => !tutorEmailSet.has(st.user.email))
    .map((st: any) => {
      if (st.user.phone) return st;
      for (const p of st.payments) {
        const meta = p.metadata as any;
        const phone = meta?.customerPhone || meta?.customer_details?.phone;
        if (phone) {
          return { ...st, user: { ...st.user, phone } };
        }
      }
      return st;
    });

  const leads = await prisma.lead.findMany({
    where: { 
      type: 'STUDENT',
      deletedAt: null,
    },
    include: {
      activities: {
        where: { type: { in: ['COMMENT', 'VOICE', 'CLAIM'] } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <StudentsView students={studentsWithPhone} freshLeads={JSON.parse(JSON.stringify(leads))} />;
}
