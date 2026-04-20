'use client';

import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Zap, RefreshCcw, TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyData {
  date: string;
  spend: number;
  conversations: number;
}

interface AdReportDashboardProps {
  data: DailyData[];
  onSync: () => Promise<void>;
}

export default function AdReportDashboard({ data, onSync }: AdReportDashboardProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
    } finally {
      setIsSyncing(false);
    }
  };

  // Calculate aggregate metrics
  const totalSpend = data.reduce((acc, d) => acc + d.spend, 0);
  const totalLeads = data.reduce((acc, d) => acc + d.conversations, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  return (
    <div className="space-y-8">
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassCard p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-2xl font-black mono text-indigo-500">
              {Math.round(totalSpend).toLocaleString('id-ID')}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Spend (14d)</div>
          </div>
        </div>

        <div className="glassCard p-6 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Users size={24} />
          </div>
          <div>
            <div className="text-2xl font-black mono text-emerald-500">
              {totalLeads}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Conv. Started (14d)</div>
          </div>
        </div>

        <div className="glassCard p-6 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Target size={24} />
          </div>
          <div>
            <div className="text-2xl font-black mono text-slate-800 dark:text-white">
              {avgCpl > 0 ? Math.round(avgCpl).toLocaleString('id-ID') : '—'}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Average CPL</div>
          </div>
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-black/5 hover:bg-black/10 transition-all text-slate-400 hover:text-indigo-500",
              isSyncing && "animate-spin text-indigo-500"
            )}
            title="Sync with Meta Ads"
          >
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <section className="glassCard p-8 min-h-[450px] relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 opacity-20" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Zap size={18} className="text-amber-500" />
              Lead Dynamics
            </h2>
            <p className="text-xs text-slate-500 font-medium">Daily correlation between spend and conversations started</p>
          </div>
        </div>

        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#6366f1' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: '#10b981' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(8px)',
                  borderRadius: '16px',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  padding: '12px'
                }}
                labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#1e293b' }}
              />
              <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="spend" 
                name="Spend (IDR)"
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSpend)" 
                animationDuration={1500}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="conversations" 
                name="Conversations"
                stroke="#10b981" 
                strokeWidth={4}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
