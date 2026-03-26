'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, CheckCircle, XCircle, RotateCcw, Loader2, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const APP_CFG: Record<string, { bg: string; dot: string }> = {
  PENDING:  { bg: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',   dot: 'bg-amber-400' },
  APPROVED: { bg: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100', dot: 'bg-emerald-400' },
  REJECTED: { bg: 'bg-red-50 text-red-600 ring-1 ring-red-100',         dot: 'bg-red-400' },
};

type Application = {
  id: string; name: string; email: string; expertise: string;
  status: string; createdAt: string; bio?: string; linkedin?: string;
  videoLink?: string; availability?: string; timezone?: string;
};
type Tutor = {
  id: string; status: string; isVerified: boolean; expertise: string[];
  createdAt: string; ratingAvg?: number; totalReviews?: number;
  user: { name?: string; email: string };
};

type Props = {
  tutors: Tutor[];
  applications: Application[];
  initialTab: 'applications' | 'tutors';
  initialQ: string;
  initialStatus: string;
  pendingCount: number;
};

export default function TutorsClient({ tutors, applications, initialTab, initialQ, initialStatus, pendingCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState(initialTab);
  const [search, setSearch] = useState(initialQ);
  const [appData, setAppData] = useState(applications);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const navigate = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    sp.set('tab', params.tab || tab);
    if (params.q) sp.set('q', params.q);
    if (params.status && params.status !== 'ALL') sp.set('status', params.status);
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    navigate({ q: val, status: initialStatus });
  };

  async function updateStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/tutor-applications/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) setAppData(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    setSaving(null);
  }

  async function approveApplication(id: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/tutor-applications/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      setAppData(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to approve');
    }
    setSaving(null);
  }

  const visibleApps = appData.filter(a => {
    const q = search.toLowerCase();
    const match = (a.name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q);
    return match && (initialStatus === 'ALL' || a.status === initialStatus);
  });

  const visibleTutors = tutors.filter(t => {
    const q = search.toLowerCase();
    return (t.user?.name || '').toLowerCase().includes(q) || (t.user?.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-5">
        {([
          { id: 'applications', label: 'Applications', badge: pendingCount },
          { id: 'tutors', label: 'Active Tutors', badge: tutors.length },
        ] as const).map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); navigate({ tab: t.id, q: search, status: initialStatus }); }}
            className={cn(
              'flex items-center gap-2 py-3.5 px-1 mr-6 text-sm font-semibold border-b-2 transition-all',
              tab === t.id
                ? 'border-[#e43a3d] text-[#e43a3d]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            )}
          >
            {t.label}
            <span className={cn(
              'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
              tab === t.id ? 'bg-[#e43a3d]/10 text-[#e43a3d]' : 'bg-gray-100 text-gray-400'
            )}>
              {t.badge}
            </span>
          </button>
        ))}
        {isPending && <Loader2 size={14} className="my-auto ml-auto text-gray-300 animate-spin" />}
      </div>

      {/* Toolbar */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={tab === 'applications' ? 'Search applicant...' : 'Search tutor...'}
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-red-400 focus:ring-2 focus:ring-red-50 transition-all"
          />
        </div>
        {tab === 'applications' && (
          <div className="flex gap-1.5">
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
              <button
                key={f}
                onClick={() => navigate({ tab, q: search, status: f })}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  initialStatus === f
                    ? 'bg-[#e43a3d] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                )}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Applications Tab ── */}
      {tab === 'applications' && (
        <div className="divide-y divide-gray-50">
          {visibleApps.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-300">No applications found.</p>
          )}
          {visibleApps.map(a => {
            const cfg = APP_CFG[a.status] || { bg: 'bg-gray-100 text-gray-500 ring-1 ring-gray-100', dot: 'bg-gray-400' };
            const busy = saving === a.id;
            const isExpanded = expanded === a.id;

            return (
              <div key={a.id}>
                <div
                  className="px-5 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : a.id)}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-sm font-bold text-amber-600 shrink-0">
                    {(a.name || '?').charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{a.name}</p>
                    <p className="text-xs text-gray-400">{a.email} · {a.expertise}</p>
                  </div>

                  {/* Status */}
                  <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {a.status}
                  </span>

                  {/* Date */}
                  <span className="text-xs text-gray-400 shrink-0 hidden sm:block">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                    {a.status !== 'APPROVED' && (
                      <button
                        onClick={() => approveApplication(a.id)}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
                      >
                        {busy ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={12} />}
                        Approve
                      </button>
                    )}
                    {a.status !== 'REJECTED' && (
                      <button
                        onClick={() => updateStatus(a.id, 'REJECTED')}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={12} />
                        Reject
                      </button>
                    )}
                    {a.status !== 'PENDING' && (
                      <button
                        onClick={() => updateStatus(a.id, 'PENDING')}
                        disabled={busy}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        <RotateCcw size={11} />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                      {a.bio && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Bio</p>
                          <p className="text-sm text-gray-600 leading-relaxed">{a.bio}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        {a.linkedin && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">LinkedIn</p>
                            <a href={a.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate block">{a.linkedin}</a>
                          </div>
                        )}
                        {a.videoLink && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Demo Video</p>
                            <a href={a.videoLink} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline truncate block">{a.videoLink}</a>
                          </div>
                        )}
                        {a.timezone && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Timezone</p>
                            <p className="text-sm text-gray-600">{a.timezone}</p>
                          </div>
                        )}
                        {a.availability && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Availability</p>
                            <p className="text-sm text-gray-600">{a.availability}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Active Tutors Tab ── */}
      {tab === 'tutors' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Tutor', 'Expertise', 'Status', 'Rating', 'Verified', 'Joined'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visibleTutors.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-300">No tutors found.</td></tr>
              )}
              {visibleTutors.map(t => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-bold text-emerald-600 shrink-0">
                        {(t.user?.name || t.user?.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{t.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{t.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1 flex-wrap">
                      {(t.expertise || []).slice(0, 3).map((e: string) => (
                        <span key={e} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-semibold">{e}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
                      t.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                    )}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600">
                    {(t.ratingAvg ?? 0) > 0 ? `⭐ ${(t.ratingAvg ?? 0).toFixed(1)}` : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {t.isVerified
                      ? <BadgeCheck size={16} className="text-emerald-500" />
                      : <span className="text-xs text-gray-300">Pending</span>
                    }
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-3.5 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {tab === 'applications'
            ? `${visibleApps.length} applications`
            : `${visibleTutors.length} tutors`}
        </p>
      </div>
    </div>
  );
}
