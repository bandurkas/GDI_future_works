import { Server } from 'lucide-react';
import './reports.css';

export default function AdsReportsLoading() {
  return (
    <div className="reportsContainer">
      <header className="header animate-pulse">
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-white/5 rounded-2xl mb-4" />
          <div className="flex items-center gap-2">
            <Server size={14} className="text-slate-400" />
            <div className="h-4 w-40 bg-slate-200 dark:bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 dark:bg-white/5 rounded-full" />
      </header>

      {/* Pulse Summary Grid Skeleton */}
      <div className="grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glassCard min-h-[220px] animate-pulse">
            <div className="flex justify-between items-start mb-12">
              <div className="w-10 h-10 bg-slate-200 dark:bg-white/5 rounded-xl" />
              <div className="w-20 h-6 bg-slate-200 dark:bg-white/5 rounded-full" />
            </div>
            <div className="space-y-3">
              <div className="h-12 w-32 bg-slate-200 dark:bg-white/5 rounded-2xl" />
              <div className="h-4 w-24 bg-slate-200 dark:bg-white/5 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Platform Snapshot Skeleton */}
      <section className="feedSection animate-pulse mt-10">
        <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
                <div className="h-6 w-48 bg-slate-200 dark:bg-white/5 rounded-lg" />
                <div className="h-3 w-64 bg-slate-200 dark:bg-white/5 rounded-lg" />
            </div>
        </div>
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 w-full bg-slate-200 dark:bg-white/5 rounded-2xl" />
            ))}
        </div>
      </section>
    </div>
  );
}
