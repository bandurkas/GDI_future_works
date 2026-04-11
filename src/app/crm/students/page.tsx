import { prisma } from '@/lib/prisma';
import StudentsView from './StudentsView';

export default async function CrmStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: { status: true, amount: true, currency: true, metadata: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Backfill phone from payment metadata for students where user.phone is null
  const studentsWithPhone = students.map(st => {
    if (st.user.phone) return st;
    // Try to find phone stored in any payment's metadata
    for (const p of st.payments) {
      const meta = p.metadata as any;
      const phone = meta?.customerPhone || meta?.customer_details?.phone;
      if (phone) {
        return { ...st, user: { ...st.user, phone } };
      }
    }
    return st;
  });

  // Fetch high-intent leads from the schedule flow
  const leads = await prisma.lead.findMany({
    where: { 
      status: 'NEW',
      type: 'STUDENT'
    },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <StudentsView students={studentsWithPhone} freshLeads={JSON.parse(JSON.stringify(leads))} />;
}
