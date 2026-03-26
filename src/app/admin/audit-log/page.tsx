import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AuditLog } from '@prisma/client';

const PAGE_SIZE = 50;

const ACTION_CFG: Record<string, { bg: string; label: string }> = {
  'student.status.changed':        { bg: 'bg-indigo-50 text-indigo-700',  label: 'Status changed' },
  'tutor.application.approved':    { bg: 'bg-emerald-50 text-emerald-700', label: 'Approved' },
  'tutor.application.rejected':    { bg: 'bg-red-50 text-red-600',         label: 'Rejected' },
  'tutor.application.reset':       { bg: 'bg-gray-100 text-gray-600',      label: 'Reset' },
  'tutor.verified':                { bg: 'bg-teal-50 text-teal-700',       label: 'Verified' },
  'payment.refunded':              { bg: 'bg-orange-50 text-orange-700',   label: 'Refunded' },
  'user.role.changed':             { bg: 'bg-purple-50 text-purple-700',   label: 'Role changed' },
  'user.deactivated':              { bg: 'bg-red-50 text-red-700',         label: 'Deactivated' },
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; action?: string; actor?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { page = '1', action = '', actor = '' } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const where = {
    ...(action && { action: { contains: action, mode: 'insensitive' as const } }),
    ...(actor && { actorEmail: { contains: actor, mode: 'insensitive' as const } }),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Audit Log</h1>
        <p className="text-sm text-gray-400 mt-1">{total} events recorded</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
          <form className="flex flex-wrap gap-2 flex-1" method="GET">
            <input
              name="actor"
              defaultValue={actor}
              placeholder="Filter by actor email..."
              className="flex-1 min-w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
            />
            <input
              name="action"
              defaultValue={action}
              placeholder="Filter by action..."
              className="flex-1 min-w-40 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Filter
            </button>
            {(actor || action) && (
              <Link href="/admin/audit-log" className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Quick action filters */}
        <div className="px-5 py-2.5 border-b border-gray-100 flex gap-2 flex-wrap">
          {[
            { label: 'All', value: '' },
            { label: 'Student changes', value: 'student' },
            { label: 'Tutor approvals', value: 'tutor.application.approved' },
            { label: 'Rejections', value: 'tutor.application.rejected' },
          ].map(f => (
            <Link
              key={f.value}
              href={`/admin/audit-log?action=${f.value}`}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                action === f.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {/* Log table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Time', 'Actor', 'Action', 'Target', 'Changes', 'IP'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-300">
                    No audit events found.
                  </td>
                </tr>
              )}
              {logs.map((log: AuditLog) => {
                const cfg = ACTION_CFG[log.action] || { bg: 'bg-gray-100 text-gray-600', label: log.action };
                const before = log.before as Record<string, unknown> | null;
                const after = log.after as Record<string, unknown> | null;

                return (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Time */}
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      <p>{new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-gray-300">{new Date(log.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-semibold text-gray-700 truncate max-w-36">{log.actorEmail}</p>
                      <p className="text-[10px] text-gray-400">{log.actorRole}</p>
                    </td>

                    {/* Action badge */}
                    <td className="px-4 py-3.5">
                      <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap', cfg.bg)}>
                        {cfg.label}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-500 font-mono truncate max-w-28">{log.targetType}</p>
                      <p className="text-[10px] text-gray-300 font-mono truncate max-w-28">{log.targetId}</p>
                    </td>

                    {/* Changes diff */}
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {before && after && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.keys(after).map(key => (
                            before[key] !== after[key] && (
                              <span key={key} className="inline-flex items-center gap-1">
                                <span className="line-through text-red-400">{String(before[key] ?? '—')}</span>
                                <span className="text-gray-400">→</span>
                                <span className="text-emerald-600 font-semibold">{String(after[key])}</span>
                              </span>
                            )
                          ))}
                        </div>
                      )}
                    </td>

                    {/* IP */}
                    <td className="px-4 py-3.5 text-[10px] text-gray-300 font-mono">
                      {log.ipAddress || '—'}
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
            <div className="flex gap-1">
              {currentPage > 1 && (
                <Link href={`/admin/audit-log?page=${currentPage - 1}&action=${action}&actor=${actor}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  ← Prev
                </Link>
              )}
              {currentPage < totalPages && (
                <Link href={`/admin/audit-log?page=${currentPage + 1}&action=${action}&actor=${actor}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-colors">
                  Next →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
