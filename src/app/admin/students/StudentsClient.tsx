'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Loader2, Download, CheckSquare, Square, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  LEAD:      { bg: 'bg-amber-50 text-amber-700 ring-amber-100',       dot: 'bg-amber-400' },
  ACTIVE:    { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-100', dot: 'bg-emerald-400' },
  COMPLETED: { bg: 'bg-blue-50 text-blue-700 ring-blue-100',          dot: 'bg-blue-400' },
  DROPPED:   { bg: 'bg-red-50 text-red-600 ring-red-100',             dot: 'bg-red-400' },
} as Record<string, { bg: string; dot: string }>;

type Student = {
  id: string; status: string; createdAt: string; country?: string;
  user: { name?: string; email: string };
  _count: { bookings: number; payments: number };
};

type Props = {
  students: Student[];
  total: number;
  currentPage: number;
  totalPages: number;
  initialQ: string;
  initialStatus: string;
};

export default function StudentsClient({ students, total, currentPage, totalPages, initialQ, initialStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialQ);
  const [saving, setSaving] = useState<string | null>(null);
  const [localData, setLocalData] = useState(students);

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);

  const allIds = localData.map(s => s.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const navigate = useCallback((params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (params.q)      sp.set('q', params.q);
    if (params.status && params.status !== 'ALL') sp.set('status', params.status);
    if (params.page && params.page !== '1')       sp.set('page', params.page);
    setSelected(new Set());
    startTransition(() => router.push(`${pathname}?${sp.toString()}`));
  }, [pathname, router]);

  const handleSearch = (value: string) => {
    setSearch(value);
    navigate({ q: value, status: initialStatus, page: '1' });
  };

  // Single status change
  async function changeStatus(id: string, status: string) {
    setSaving(id);
    const res = await fetch(`/api/admin/students/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) setLocalData(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setSaving(null);
  }

  // Bulk status change
  async function bulkChangeStatus(status: string) {
    if (selected.size === 0) return;
    setBulkSaving(true);
    const res = await fetch('/api/admin/students/bulk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), status }),
    });
    if (res.ok) {
      setLocalData(prev => prev.map(s => selected.has(s.id) ? { ...s, status } : s));
      setSelected(new Set());
    }
    setBulkSaving(false);
  }

  // CSV export
  function exportCSV() {
    const ids = selected.size > 0 ? Array.from(selected).join(',') : undefined;
    const url = ids
      ? `/api/admin/students/bulk?ids=${ids}`
      : `/api/admin/students/bulk?status=${initialStatus}`;
    window.open(url, '_blank');
  }

  const displayData = localData;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition-all"
          />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED'].map(f => (
            <button
              key={f}
              onClick={() => navigate({ q: search, status: f, page: '1' })}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                initialStatus === f ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >{f}</button>
          ))}
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
        >
          <Download size={12} />
          {selected.size > 0 ? `Export ${selected.size}` : 'Export CSV'}
        </button>
        {isPending && <Loader2 size={16} className="text-gray-400 animate-spin" />}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="w-10 px-4 py-3">
                <button onClick={toggleAll} className="text-gray-400 hover:text-indigo-600 transition-colors">
                  {allSelected ? <CheckSquare size={15} className="text-indigo-600" /> :
                   someSelected ? <Minus size={15} className="text-indigo-400" /> :
                   <Square size={15} />}
                </button>
              </th>
              {['Student', 'Country', 'Status', 'Bookings', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayData.length === 0 && (
              <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-300">No students found.</td></tr>
            )}
            {displayData.map(s => {
              const cfg = STATUS_CONFIG[s.status] || { bg: 'bg-gray-100 text-gray-500 ring-gray-100', dot: 'bg-gray-400' };
              const isSelected = selected.has(s.id);
              return (
                <tr key={s.id} className={cn('transition-colors', isSelected ? 'bg-indigo-50/30' : 'hover:bg-gray-50/50')}>
                  <td className="px-4 py-3.5">
                    <button onClick={() => toggleOne(s.id)} className="text-gray-400 hover:text-indigo-600 transition-colors">
                      {isSelected ? <CheckSquare size={15} className="text-indigo-600" /> : <Square size={15} />}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/students/${s.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                        {(s.user?.name || s.user?.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{s.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{s.user?.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500">{s.country || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1', cfg.bg)}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-500 text-center">{s._count?.bookings ?? 0}</td>
                  <td className="px-4 py-3.5 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={s.status}
                        disabled={saving === s.id}
                        onChange={e => changeStatus(s.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white cursor-pointer disabled:opacity-50 focus:outline-none focus:border-indigo-400"
                      >
                        {['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED'].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      {saving === s.id && <Loader2 size={12} className="text-gray-400 animate-spin" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing {Math.min((currentPage - 1) * 50 + 1, total)}–{Math.min(currentPage * 50, total)} of {total} students
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button onClick={() => navigate({ q: search, status: initialStatus, page: String(currentPage - 1) })}
              disabled={currentPage <= 1 || isPending}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={14} className="text-gray-500" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
              return (
                <button key={p} onClick={() => navigate({ q: search, status: initialStatus, page: String(p) })}
                  disabled={isPending}
                  className={cn('w-7 h-7 rounded-lg text-xs font-semibold transition-colors',
                    p === currentPage ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  )}>{p}</button>
              );
            })}
            <button onClick={() => navigate({ q: search, status: initialStatus, page: String(currentPage + 1) })}
              disabled={currentPage >= totalPages || isPending}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={14} className="text-gray-500" />
            </button>
          </div>
        )}
      </div>

      {/* Bulk action floating bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-5 py-3 rounded-2xl shadow-2xl shadow-black/20">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="w-px h-4 bg-white/20" />
          <span className="text-xs text-gray-400">Set status:</span>
          {['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED'].map(s => (
            <button
              key={s}
              onClick={() => bulkChangeStatus(s)}
              disabled={bulkSaving}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {bulkSaving ? <Loader2 size={10} className="animate-spin" /> : s}
            </button>
          ))}
          <div className="w-px h-4 bg-white/20" />
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors">
            <Download size={11} /> CSV
          </button>
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-white transition-colors text-xs">
            ✕ Clear
          </button>
        </div>
      )}
    </div>
  );
}
