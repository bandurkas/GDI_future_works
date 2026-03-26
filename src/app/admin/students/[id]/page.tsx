import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Globe, Calendar, CreditCard, BookOpen } from 'lucide-react';
import StatusChanger from './StatusChanger';

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: true,
      bookings: {
        include: { session: { include: { course: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!student) notFound();

  const totalPaid = student.payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
    LEAD:      { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
    ACTIVE:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
    COMPLETED: { bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
    DROPPED:   { bg: 'bg-red-50',     text: 'text-red-600',     dot: 'bg-red-400' },
  };
  const cfg = STATUS_CONFIG[student.status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' };

  const PAYMENT_CFG: Record<string, { bg: string; text: string }> = {
    PAID:    { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', text: '' },
    PENDING: { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',      text: '' },
    FAILED:  { bg: 'bg-red-50 text-red-600 ring-1 ring-red-100',            text: '' },
  };

  return (
    <div className="max-w-5xl">
      {/* Back */}
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Students
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl font-black text-indigo-600 shrink-0">
            {(student.user.name || student.user.email).charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-black text-gray-900">{student.user.name || '(no name)'}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {student.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Mail size={13} className="text-gray-400" />
                {student.user.email}
              </span>
              {student.user.phone && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Phone size={13} className="text-gray-400" />
                  {student.user.phone}
                </span>
              )}
              {student.country && (
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <Globe size={13} className="text-gray-400" />
                  {student.country}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Calendar size={13} className="text-gray-400" />
                Joined {new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Status changer (client component) */}
          <StatusChanger id={student.id} currentStatus={student.status} />
        </div>

        {/* Stats row */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">{student.bookings.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Bookings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-900">{student.payments.length}</p>
            <p className="text-xs text-gray-400 mt-0.5">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">
              IDR {totalPaid.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Total Paid</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Payments */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CreditCard size={15} className="text-gray-400" />
            <h2 className="font-bold text-gray-800 text-sm">Payment History</h2>
            <span className="ml-auto text-xs text-gray-400">{student.payments.length} transactions</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {student.payments.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-300">No payments.</p>
            )}
            {student.payments.map(p => {
              const pc = PAYMENT_CFG[p.status] || { bg: 'bg-gray-100 text-gray-500 ring-1 ring-gray-100', text: '' };
              return (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-700">
                      {p.currency} {Number(p.amount).toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${pc.bg}`}>
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <BookOpen size={15} className="text-gray-400" />
            <h2 className="font-bold text-gray-800 text-sm">Booking History</h2>
            <span className="ml-auto text-xs text-gray-400">{student.bookings.length} bookings</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
            {student.bookings.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-300">No bookings.</p>
            )}
            {student.bookings.map(b => (
              <div key={b.id} className="px-5 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  {b.session?.course?.title || 'Session'}
                </p>
                <p className="text-xs text-gray-400">
                  {b.session?.startTime
                    ? new Date(b.session.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                    : new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
