'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AppActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(status);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  async function approve() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}/approve`, { method: 'POST' });
    if (res.ok) { setCurrent('APPROVED'); router.refresh(); showToast('Approved successfully'); }
    else { const e = await res.json(); showToast(e.error || 'Failed to approve'); }
    setSaving(false);
  }

  async function setStatus(s: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }),
    });
    if (res.ok) { setCurrent(s); router.refresh(); showToast(`Status set to ${s}`); }
    else showToast('Failed to update status');
    setSaving(false);
  }

  return (
    <div style={{ paddingTop: '14px', paddingBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px' }}>
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
        {current !== 'APPROVED' && (
          <ActionBtn
            label="Approve"
            bg="rgba(16,185,129,0.15)" color="#10b981" border="rgba(16,185,129,0.25)"
            hoverBg="rgba(16,185,129,0.25)"
            disabled={saving}
            onClick={approve}
          />
        )}
        {current !== 'REJECTED' && (
          <ActionBtn
            label="Reject"
            bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)"
            hoverBg="rgba(239,68,68,0.2)"
            disabled={saving}
            onClick={() => setStatus('REJECTED')}
          />
        )}
        {current !== 'PENDING' && (
          <ActionBtn
            label="Reset to Pending"
            bg="rgba(245,158,11,0.1)" color="#f59e0b" border="rgba(245,158,11,0.2)"
            hoverBg="rgba(245,158,11,0.2)"
            disabled={saving}
            onClick={() => setStatus('PENDING')}
          />
        )}
        {saving && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>Saving…</span>}
      </div>

      {toast && (
        <div className="crm-toast" style={{
          marginTop: '10px', padding: '8px 14px', borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '12px', color: 'rgba(255,255,255,0.6)',
          display: 'inline-block',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, bg, color, border, hoverBg, disabled, onClick }: {
  label: string; bg: string; color: string; border: string; hoverBg: string;
  disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="crm-action-btn"
      style={{
        padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
        background: bg, color, border: `1px solid ${border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        fontFamily: "'DM Sans', sans-serif",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg; }}
    >
      {label}
    </button>
  );
}
