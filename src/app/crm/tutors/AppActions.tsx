'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import a from './AppActions.module.css';

export default function AppActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(status);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  async function setStatus(st: string) {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: st }),
    });
    if (res.ok) { setCurrent(st); router.refresh(); showToast(`Status set to ${st}`); }
    else showToast('Failed to update status');
    setSaving(false);
  }

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutor-applications/${id}`, { method: 'DELETE' });
    if (res.ok) { router.refresh(); }
    else { const e = await res.json(); showToast(e.error || 'Failed to delete'); }
    setSaving(false);
    setConfirmDelete(false);
  }

  if (confirmDelete) {
    return (
      <div className={a.actionsWrap}>
        <div className={a.confirmBox}>
          <p className={a.confirmText}>Delete this application? This cannot be undone.</p>
          <div className={a.confirmBtns}>
            <button className={a.confirmCancel} onClick={() => setConfirmDelete(false)} disabled={saving}>
              Cancel
            </button>
            <button className={a.confirmDelete} onClick={handleDelete} disabled={saving}>
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={a.actionsWrap}>
      <div className={a.btnRow}>
        {current !== 'APPROVED' && current !== 'ARCHIVED' && (
          <ActionBtn
            label="Approve"
            bg="rgba(16,185,129,0.15)" color="#10b981" border="rgba(16,185,129,0.25)"
            hoverBg="rgba(16,185,129,0.25)"
            disabled={saving}
            onClick={approve}
          />
        )}
        {current !== 'REJECTED' && current !== 'ARCHIVED' && (
          <ActionBtn
            label="Reject"
            bg="rgba(239,68,68,0.1)" color="#f87171" border="rgba(239,68,68,0.2)"
            hoverBg="rgba(239,68,68,0.2)"
            disabled={saving}
            onClick={() => setStatus('REJECTED')}
          />
        )}
        {current !== 'PENDING' && current !== 'ARCHIVED' && (
          <ActionBtn
            label="Reset to Pending"
            bg="rgba(245,158,11,0.1)" color="#f59e0b" border="rgba(245,158,11,0.2)"
            hoverBg="rgba(245,158,11,0.2)"
            disabled={saving}
            onClick={() => setStatus('PENDING')}
          />
        )}
        {current !== 'ARCHIVED' && (
          <ActionBtn
            label="Archive"
            bg="var(--crm-tag-bg)" color="var(--crm-text-muted)" border="var(--crm-border)"
            hoverBg="var(--crm-expand-hover)"
            disabled={saving}
            onClick={() => setStatus('ARCHIVED')}
          />
        )}
        {current === 'ARCHIVED' && (
          <ActionBtn
            label="Unarchive"
            bg="rgba(245,158,11,0.1)" color="#f59e0b" border="rgba(245,158,11,0.2)"
            hoverBg="rgba(245,158,11,0.2)"
            disabled={saving}
            onClick={() => setStatus('PENDING')}
          />
        )}
        <ActionBtn
          label="Delete"
          bg="rgba(239,68,68,0.07)" color="#f87171" border="rgba(239,68,68,0.15)"
          hoverBg="rgba(239,68,68,0.18)"
          disabled={saving}
          onClick={() => setConfirmDelete(true)}
        />
        {saving && <span className={a.savingText}>Saving…</span>}
      </div>

      {toast && <div className={a.toast}>{toast}</div>}
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
      className={a.btn}
      style={{ background: bg, color, border: `1px solid ${border}` }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg; }}
    >
      {label}
    </button>
  );
}
