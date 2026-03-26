import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, GraduationCap, ClipboardList, TrendingUp, ArrowRight, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import RevenueChart from './RevenueChart';
import PipelineFunnel from './PipelineFunnel';

export const revalidate = 60;

const STATUS_CFG: Record<string, { bg: string; dot: string }> = {
  LEAD:      { bg: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-400' },
  ACTIVE:    { bg: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-400' },
  COMPLETED: { bg: 'bg-blue-50 text-blue-700',      dot: 'bg-blue-400' },
  DROPPED:   { bg: 'bg-red-50 text-red-600',        dot: 'bg-red-400' },
};

const APP_CFG: Record<string, { bg: string }> = {
  PENDING:  { bg: 'bg-amber-50 text-amber-700' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700' },
  REJECTED: { bg: 'bg-red-50 text-red-600' },
};

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [
    totalStudents,
    current30dStudents,
    prev30dStudents,
    activeStudents,
    totalTutors,
    pendingApps,
    recentStudents,
    recentApps,
    totalRevenue,
    current30dRevenue,
    prev30dRevenue,
    leadsCount,
    payments,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.student.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.student.count({ where: { status: 'ACTIVE' } }),
    prisma.tutor.count(),
    prisma.tutorApplication.count({ where: { status: 'PENDING' } }),
    prisma.student.findMany({
      take: 6, orderBy: { createdAt: 'desc' }, include: { user: true },
    }),
    prisma.tutorApplication.findMany({
      take: 6, orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.count(),
    prisma.payment.findMany({
      where: { status: 'PAID', createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'asc' },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const rev = Number(totalRevenue._sum.amount || 0);
  const c30Rev = Number(current30dRevenue._sum.amount || 0);
  const p30Rev = Number(prev30dRevenue._sum.amount || 0);

  const revDelta = p30Rev > 0 ? ((c30Rev - p30Rev) / p30Rev) * 100 : 0;
  const studDelta = prev30dStudents > 0 ? ((current30dStudents - prev30dStudents) / prev30dStudents) * 100 : 0;

  // Chart data: Group payments by day
  const dailyRevMap = payments.reduce((acc, p) => {
    const day = p.createdAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    acc[day] = (acc[day] || 0) + Number(p.amount);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyRevMap).map(([date, amount]) => ({ date, amount }));

  const firstName = session.user?.name?.split(' ')[0] || 'Admin';

  const stats = [
    {
      label: 'Total Students',
      value: totalStudents,
      delta: studDelta,
      sub: `+${current30dStudents} vs prev 30d`,
      icon: <Users size={18} />,
      iconBg: 'bg-indigo-50 text-indigo-600',
      href: '/admin/students',
    },
    {
      label: 'Active Students',
      value: activeStudents,
      sub: `${Math.round((activeStudents / Math.max(totalStudents, 1)) * 100)}% of total`,
      icon: <TrendingUp size={18} />,
      iconBg: 'bg-emerald-50 text-emerald-600',
      href: '/admin/students?status=ACTIVE',
    },
    {
      label: 'Pending Applications',
      value: pendingApps,
      sub: `${totalTutors} active tutors`,
      icon: <ClipboardList size={18} />,
      iconBg: 'bg-amber-50 text-amber-600',
      href: '/admin/tutors',
    },
    {
      label: 'Monthly Revenue',
      value: `IDR ${c30Rev.toLocaleString('id-ID')}`,
      delta: revDelta,
      sub: `IDR ${rev.toLocaleString('id-ID')} all-time`,
      icon: <GraduationCap size={18} />,
      iconBg: 'bg-red-50 text-red-500',
      href: '/admin/payments',
    },
  ];

  const funnelSteps = [
    { label: 'Leads', count: leadsCount, color: 'bg-gray-200', width: '100%' },
    { label: 'Students', count: totalStudents, color: 'bg-indigo-300', width: `${(totalStudents / Math.max(leadsCount, 1)) * 100}%` },
    { label: 'Active', count: activeStudents, color: 'bg-emerald-400', width: `${(activeStudents / Math.max(leadsCount, 1)) * 100}%` },
  ];

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        {/* Simple Quick Actions */}
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/tutors" 
            className="flex items-center gap-2 px-5 py-2.5 bg-[#e43a3d] text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] transition-transform"
          >
            <GraduationCap size={16} />
            Review Tutors ({pendingApps})
          </Link>
          <Link 
            href="/admin/students" 
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
          >
            <Users size={16} />
            Manage Students
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow group relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', s.iconBg)}>
                {s.icon}
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm font-semibold text-gray-600">{s.label}</p>
              {s.delta !== undefined && (
                <span className={cn(
                  'text-[10px] font-black flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                  s.delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                )}>
                  {s.delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(Math.round(s.delta))}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-800 text-sm">Revenue Growth</h2>
              <p className="text-xs text-gray-400 mt-0.5">Daily paid revenue for the last 30 days</p>
            </div>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Pipeline Funnel */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-sm">Conversion Funnel</h2>
          <p className="text-xs text-gray-400 mt-0.5">Lead to Active Student pipeline</p>
          <PipelineFunnel steps={funnelSteps} />
          
          <div className="mt-8 pt-6 border-t border-gray-50">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Recent Status Changes</h3>
            <div className="space-y-3">
              {recentStudents.slice(0, 3).map(s => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <p className="text-xs text-gray-600 flex-1 truncate">
                    <span className="font-bold">{s.user.name || 'Student'}</span> was promoted to {s.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column activity feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Students */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Recent Students</h2>
            <Link href="/admin/students" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentStudents.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-300">No students yet.</p>
            )}
            {recentStudents.map(s => {
              const cfg = STATUS_CFG[s.status] || { bg: 'bg-gray-50 text-gray-500', dot: 'bg-gray-400' };
              return (
                <Link key={s.id} href={`/admin/students/${s.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                    {(s.user.name || s.user.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.user.name || s.user.email}</p>
                    <p className="text-xs text-gray-400">{new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                  </div>
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold', cfg.bg)}>
                    <span className={cn('w-1 h-1 rounded-full', cfg.dot)} />
                    {s.status}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tutor Applications */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-sm">Tutor Applications</h2>
            <Link href="/admin/tutors" className="text-xs font-semibold text-[#e43a3d] hover:text-red-700 flex items-center gap-1">
              Review all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApps.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-300">No applications yet.</p>
            )}
            {recentApps.map(a => {
              const cfg = APP_CFG[a.status] || { bg: 'bg-gray-50 text-gray-500' };
              return (
                <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.expertise}</p>
                  </div>
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', cfg.bg)}>
                    {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
