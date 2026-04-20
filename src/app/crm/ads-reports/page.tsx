import { prisma } from '@/lib/prisma';
import { 
  TrendingUp, 
  Target, 
  PieChart, 
  Activity, 
  Server,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './reports.css';
import AdReportDashboard from './AdReportDashboard';
import { revalidatePath } from 'next/cache';

export const revalidate = 60; // Refresh every minute

export default async function AdsReportsPage() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Fetch data
  const [
    totalLeads,
    totalStudents,
    allLeadsWithUtm,
    marketPerf,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.student.count(),
    prisma.lead.findMany({
      where: { utmSource: { not: null }, createdAt: { gte: fourteenDaysAgo } },
      select: { utmSource: true, utmMedium: true, utmCampaign: true, createdAt: true },
    }),
    prisma.marketingPerformance.findMany({
      where: { date: { gte: fourteenDaysAgo } },
      orderBy: { date: 'asc' }
    }),
  ]);

  // Aggregate Market Performance by Date (summing across campaigns)
  const dailyStatsMap = marketPerf.reduce((acc, p) => {
    const key = p.date.toISOString().split('T')[0];
    if (!acc[key]) {
      acc[key] = { date: key, spend: 0, conversations: 0, clicks: 0, impressions: 0 };
    }
    acc[key].spend += Number(p.spend);
    acc[key].conversations += p.conversations || 0;
    acc[key].clicks += p.clicks || 0;
    acc[key].impressions += p.impressions;
    return acc;
  }, {} as Record<string, { date: string, spend: number, conversations: number, clicks: number, impressions: number }>);

  const chartData = Object.values(dailyStatsMap).sort((a, b) => a.date.localeCompare(b.date));

  // Sync Action
  async function syncAction() {
    'use server';
    try {
      const response = await fetch(`${process.env.AUTH_URL}/api/crm/ads/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        revalidatePath('/crm/ads-reports');
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
  }

  const attributionClarity = totalLeads > 0 
    ? Math.round((allLeadsWithUtm.length / totalLeads) * 100) 
    : 0;

  return (
    <div className="reportsContainer">
      <header className="header">
        <div>
          <h1 className="title">Command Center</h1>
          <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
            <Server size={14} /> GDI Ops Intelligence v2.5 (Ads Sync Enabled)
          </p>
        </div>
        <div className="badge">
          <div className="badgePulse" />
          Analytics Engine Live
        </div>
      </header>

      {/* Main Interactive Dashboard */}
      <div className="staggered mb-12">
        <AdReportDashboard data={chartData} onSync={syncAction} />
      </div>

      {/* Attribution Pulse */}
      <div className="grid staggered">
        <div className="glassCard p-6 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-start">
            <div className="cardIcon"><ShieldCheck size={20} /></div>
            <div className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              Stable
            </div>
          </div>
          <div>
            <div className="cardValue">{attributionClarity}%</div>
            <div className="cardLabel">Attribution Clarity</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Pixel vs Internal coverage</div>
          </div>
        </div>
        
        <div className="glassCard p-6 flex flex-col justify-between min-h-[180px]">
          <div className="flex justify-between items-start">
            <div className="cardIcon"><TrendingUp size={20} /></div>
            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
              High
            </div>
          </div>
          <div>
            <div className="cardValue">{totalLeads > 0 ? Math.round((totalStudents / totalLeads) * 100) : 0}%</div>
            <div className="cardLabel">Conversion Rate</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Lead to Enrollment efficiency</div>
          </div>
        </div>
      </div>
    </div>
  );
}

