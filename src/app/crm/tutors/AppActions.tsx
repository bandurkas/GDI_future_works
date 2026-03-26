'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(status);

  async function approve() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}/approve`, { method: 'POST' });
    if (res.ok) { setCurrent('APPROVED'); router.refresh(); }
    else { const e = await res.json(); alert(e.error || 'Failed to approve'); }
    setSaving(false);
  }

  async function setStatus(s: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
    if (res.ok) { setCurrent(s); router.refresh(); }
    setSaving(false);
  }

  const btn = (label: string, color: string, bg: string, hoverBg: string, onClick: () => void, show: boolean) =>
    show ? (
      <button
        key={label}
        onClick={onClick}
        disabled={saving}
        style={{
          padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
          background: bg, color, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1, transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg; }}
      >
        {saving ? '…' : label}
      </button>
    ) : null;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #f0f0f0', marginTop: '16px' }}>
      {btn('Approve', '#065f46', '#d1fae5', '#a7f3d0', approve,       current !== 'APPROVED')}
      {btn('Reject',  '#991b1b', '#fee2e2', '#fecaca', () => setStatus('REJECTED'), current !== 'REJECTED')}
      {btn('Reset to Pending', '#92400e', '#fef3c7', '#fde68a', () => setStatus('PENDING'), current !== 'PENDING')}
    </div>
  );
}
