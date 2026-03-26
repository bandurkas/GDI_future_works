'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function StatusChanger({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newStatus: string) {
    if (newStatus === status) return;
    setSaving(true);
    const res = await fetch(`/api/admin/students/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <select
        value={status}
        disabled={saving}
        onChange={e => handleChange(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white cursor-pointer disabled:opacity-50 focus:outline-none focus:border-indigo-400 font-medium"
      >
        {['LEAD', 'ACTIVE', 'COMPLETED', 'DROPPED'].map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {saving && <Loader2 size={14} className="text-gray-400 animate-spin" />}
    </div>
  );
}
