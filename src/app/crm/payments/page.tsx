import { getCrmSession } from '@/lib/crm-session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import PaymentsView from './PaymentsView';

export default async function PaymentsPage() {
  const session = await getCrmSession();
  if (!session) redirect('/crm/login');

  const raw = await prisma.payment.findMany({
    where: { provider: { in: ['QRIS', 'PAYPAL'] } },
    include: { student: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  });

  // Serialize Decimal + Date for client component
  const payments = raw.map((p) => ({
    id: p.id,
    externalId: p.externalId ?? '',
    status: p.status,
    provider: p.provider,
    amount: Number(p.amount),
    currency: p.currency,
    createdAt: p.createdAt.toISOString(),
    metadata: p.metadata as Record<string, unknown> | null,
    student: {
      id: p.student.id,
      name: p.student.user.name ?? '',
      email: p.student.user.email,
      phone: p.student.user.phone ?? '',
    },
  }));

  return <PaymentsView payments={payments} />;
}
