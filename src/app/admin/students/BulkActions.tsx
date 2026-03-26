'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, ShieldAlert, Download } from 'lucide-react';

type BulkActionsProps = {
  selectedIds: string[];
  clearSelection: () => void;
  onSuccess: () => void;
  data: any[];
  filename: string;
};

export default function BulkActions({ selectedIds, clearSelection, onSuccess, data, filename }: BulkActionsProps) {
  const [loading, setLoading] = useState(false);
  const count = selectedIds.length;

  const handleBulkStatus = async (status: string) => {
    if (!confirm(`Change status to ${status} for ${count} students?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/students/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, status }),
      });
      if (res.ok) {
        onSuccess();
        clearSelection();
      } else {
        alert('Bulk update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const selectedData = data.filter(d => selectedIds.includes(d.id));
    if (selectedData.length === 0) return;

    const headers = ['ID', 'Name', 'Email', 'Status', 'Joined'];
    const rows = selectedData.map(d => [
      d.id,
      d.user?.name || '',
      d.user?.email || '',
      d.status,
      new Date(d.createdAt).toISOString(),
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    link.click();
  };

  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6 border border-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-3 pr-6 border-r border-white/10">
          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-black">
            {count}
          </div>
          <p className="text-sm font-bold tracking-tight">Selected</p>
        </div>

        <div className="flex items-center gap-2">
          {['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED'].map(s => (
            <button
              key={s}
              disabled={loading}
              onClick={() => handleBulkStatus(s)}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              SET {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <button
            onClick={exportToCSV}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            title="Export to CSV"
          >
            <Download size={18} />
          </button>
          <button
            onClick={clearSelection}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
