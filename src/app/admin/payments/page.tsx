import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

const PAYMENT_CFG: Record<string, { bg: string }> = {
  PAID:    { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' },
  PENDING: { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
  FAILED:  { bg: 'bg-red-50 text-red-600 ring-1 ring-red-100' },
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { status = 'ALL', page = '1' } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = status !== 'ALL' ? { status: status as any } : {};

  const [payments, total, totals] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { student: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.payment.count({ where }),
    prisma.payment.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const summary = {
    PAID:    totals.find(t => t.status === 'PAID'),
    PENDING: totals.find(t => t.status === 'PENDING'),
    FAILED:  totals.find(t => t.status === 'FAILED'),
  };

  const totalRevenue = Number(summary.PAID?._sum.amount || 0);

  return (
    <div className="max-w-7xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Payments</h1>
        <p className="text-sm text-gray-400 mt-1">{total} transactions</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `IDR ${totalRevenue.toLocaleString('id-ID')}`, sub: `${summary.PAID?._count ?? 0} paid`, color: 'text-emerald-600' },
          { label: 'Pending', value: `IDR ${Number(summary.PENDING?._sum.amount || 0).toLocaleString('id-ID')}`, sub: `${summary.PENDING?._count ?? 0} transactions`, color: 'text-amber-600' },
          { label: 'Failed', value: `${summary.FAILED?._count ?? 0}`, sub: 'failed transactions', color: 'text-red-500' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className={cn('text-2xl font-black', c.color)}>{c.value}</p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">{c.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 flex gap-2 items-center">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map(f => (
            <Link
              key={f}
              href={`/admin/payments?status=${f}`}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                status === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {f}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Student', 'Amount', 'Currency', 'Status', 'Provider', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-300">No payments found.</td>
                </tr>
              )}
              {payments.map(p => {
                const cfg = PAYMENT_CFG[p.status] || { bg: 'bg-gray-100 text-gray-500 ring-1 ring-gray-100' };
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      {p.student ? (
                        <Link href={`/admin/students/${p.student.id}`} className="group">
                          <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                            {p.student.user?.name || p.student.user?.email || '—'}
                          </p>
                          <p className="text-xs text-gray-400">{p.student.user?.email}</p>
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-gray-800">
                      {Number(p.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{p.currency}</td>
                    <td className="px-4 py-3.5">
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{(p as any).provider || 'Midtrans'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {Math.min(skip + 1, total)}–{Math.min(skip + PAGE_SIZE, total)} of {total}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {currentPage > 1 && (
                <Link href={`/admin/payments?status=${status}&page=${currentPage - 1}`}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  ‹
                </Link>
              )}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return (
                  <Link
                    key={p}
                    href={`/admin/payments?status=${status}&page=${p}`}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors',
                      p === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    {p}
                  </Link>
                );
              })}
              {currentPage < totalPages && (
                <Link href={`/admin/payments?status=${status}&page=${currentPage + 1}`}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  ›
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
