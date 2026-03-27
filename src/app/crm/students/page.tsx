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

  const leads = students.filter(s => !s.payments.some(p => p.status === 'PAID'));
  const paid  = students.filter(s =>  s.payments.some(p => p.status === 'PAID'));

  return <StudentsView leads={leads} paid={paid} />;
}
