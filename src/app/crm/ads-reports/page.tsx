import { prisma } from '@/lib/prisma';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Waves, 
  PieChart, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './reports.css';

export const revalidate = 300; // Refresh every 5 mins

export default async function AdsReportsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Fetch data
  const [
    totalLeads,
    recentLeads,
    prevLeads,
    totalStudents,
    recentStudents,
    prevStudents,
    allLeadsWithUtm,
    marketPerf,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.student.count(),
    prisma.student.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.student.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.findMany({
      where: { utmSource: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      select: { utmSource: true, utmMedium: true, utmCampaign: true, createdAt: true },
    }),
    prisma.marketingPerformance.findMany({
      orderBy: { date: 'desc' },
      take: 20
    }),
  ]);

  // Qualitative Pulse Logic (Translated to English)
  const getPulse = (current: number, prev: number) => {
    if (prev === 0) return { label: 'Excellent', color: 'rgb(var(--accent-emerald-rgb))', bg: 'rgba(var(--accent-emerald-rgb), 0.1)', icon: <Zap size={14} /> };
    const delta = ((current - prev) / prev) * 100;
    if (delta > 15) return { label: 'Excellent', color: 'rgb(var(--accent-emerald-rgb))', bg: 'rgba(var(--accent-emerald-rgb), 0.1)', icon: <Zap size={14} /> };
    if (delta >= 0) return { label: 'Good', color: 'rgb(var(--accent-amber-rgb))', bg: 'rgba(var(--accent-amber-rgb), 0.1)', icon: <Waves size={14} /> };
    return { label: 'Critical', color: 'rgb(var(--accent-rose-rgb))', bg: 'rgba(var(--accent-rose-rgb), 0.1)', icon: <TrendingDown size={14} /> };
  };

  const leadPulse = getPulse(recentLeads, prevLeads);
  const studentPulse = getPulse(recentStudents, prevStudents);

  // Group Internal Leads by Source
  const sourceStats = allLeadsWithUtm.reduce((acc, lead) => {
    const src = lead.utmSource || 'Unknown';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedSources = Object.entries(sourceStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const attributionClarity = totalLeads > 0 
    ? Math.round((allLeadsWithUtm.length / totalLeads) * 100) 
    : 0;

  // Calculate Ads Data Map (Today)
  const today = marketPerf[0]?.date.toISOString().split('T')[0];
  const todayPerf = marketPerf.filter(p => p.date.toISOString().split('T')[0] === today);

  return (
    <div className="reportsContainer">
      <header className="header">
        <div>
          <h1 className="title">Command Center</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <Server size={14} /> GDI Ops Intelligence v2.1 (Full English)
          </p>
        </div>
        <div className="badge">
          <div className="badgePulse" />
          Live Agent Active
        </div>
      </header>

      {/* Pulse Summary Grid */}
      <div className="grid staggered">
        <PulseCard 
          title="Lead Velocity" 
          value={recentLeads} 
          sub={`+${(recentLeads - prevLeads >= 0 ? recentLeads-prevLeads : 0)} vs prev period`}
          pulse={leadPulse}
          icon={<Target size={20} />}
        />
        <PulseCard 
          title="Conversion" 
          value={`${totalLeads > 0 ? Math.round((totalStudents / totalLeads) * 100) : 0}%`}
          sub="Lead-to-Student Efficiency"
          pulse={studentPulse}
          icon={<TrendingUp size={20} />}
        />
        <PulseCard 
          title="Analytics Coverage" 
          value={`${attributionClarity}%`}
          sub="Marketing attribution clarify"
          pulse={{ label: 'Stable', color: 'rgb(var(--accent-indigo-rgb))', bg: 'rgba(var(--accent-indigo-rgb), 0.1)', icon: <PieChart size={14} /> }}
          icon={<ShieldCheck size={20} />}
        />
      </div>

      {/* Platform Snapshot: High-Precision Table */}
      <section className="feedSection staggered">
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-lg font-bold">Platform Feed</h2>
                <p className="text-xs text-slate-500 mt-1">Cross-channel ad spend & attribution analysis</p>
            </div>
            {today && (
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-black/5 mono">
                 LATEST_SYNC: {today}
              </div>
            )}
        </div>

        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th className="text-left">Operational Channel</th>
                        <th className="text-right">Spend (IDR)</th>
                        <th className="text-right">Impressions</th>
                        <th className="text-right">eCPM</th>
                        <th className="text-right">Internal Leads</th>
                        <th className="text-right">eCPL</th>
                    </tr>
                </thead>
                <tbody>
                    {todayPerf.map(p => {
                        const cpm = Number(p.spend) > 0 ? (Number(p.spend) / p.impressions) * 1000 : 0;
                        const leads = sourceStats[p.channel] || 0;
                        const cpl = leads > 0 ? Number(p.spend) / leads : 0;

                        return (
                            <tr key={p.id}>
                                <td className="font-bold flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(var(--accent-indigo-rgb), 0.5)]" />
                                  {p.channel}
                                </td>
                                <td className="text-right font-bold text-indigo-500 mono">
                                  {Number(p.spend).toLocaleString('id-ID')}
                                </td>
                                <td className="text-right text-slate-500 mono text-xs">{p.impressions.toLocaleString()}</td>
                                <td className="text-right font-medium text-slate-500 mono text-xs">
                                  {Math.round(cpm).toLocaleString('id-ID')}
                                </td>
                                <td className="text-right font-bold text-emerald-500 mono">{leads}</td>
                                <td className="text-right">
                                    <div className="inline-block px-3 py-1 rounded-lg bg-black/5 font-bold text-slate-800 dark:text-white mono">
                                        {cpl > 0 ? Math.round(cpl).toLocaleString('id-ID') : '–'}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
      </section>

      {/* Attribution and Intelligence sections removed momentarily for future improvement */}
    </div>
  );
}

function PulseCard({ title, value, sub, pulse, icon }: { 
  title: string; 
  value: string | number; 
  sub: string; 
  pulse: { label: string; color: string; bg: string; icon: React.ReactNode };
  icon: React.ReactNode;
}) {
  return (
    <div className="glassCard flex flex-col justify-between min-h-[220px]">
      <div className="flex justify-between items-start">
        <div className="cardIcon">{icon}</div>
        <div 
          className="px-3 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
          style={{ background: pulse.bg, color: pulse.color }}
        >
          {pulse.icon}
          {pulse.label}
        </div>
      </div>
      <div>
        <div className="cardValue">{value}</div>
        <div className="cardLabel">{title}</div>
        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{sub}</div>
      </div>
    </div>
  );
}
