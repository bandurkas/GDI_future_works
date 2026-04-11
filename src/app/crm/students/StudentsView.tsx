'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fmt } from '@/lib/utils';
import s from './StudentsView.module.css';

type Payment = { status: string; amount: any; currency: string; metadata: any; createdAt: Date };
type Student = {
  id: string; status: string; createdAt: Date | string; country: string | null;
  user: { name: string | null; email: string; phone: string | null };
  payments: Payment[];
};
type CRMLead = {
  id: string; email: string; phone: string | null; source: string | null; status: string;
  createdAt: Date | string;
  utmSource: string | null; utmMedium: string | null; utmCampaign: string | null;
  activities: { type: string; notes: string | null; createdAt: Date | string }[];
};

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  LEAD:      { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  border: '#f59e0b' },
  ACTIVE:    { bg: 'rgba(16,185,129,0.12)',  text: '#10b981',  border: '#10b981' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa',  border: '#3b82f6' },
  DROPPED:   { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',  border: '#ef4444' },
  ARCHIVED:  { bg: 'rgba(107,114,128,0.1)',  text: '#9ca3af',  border: 'rgba(107,114,128,0.5)' },
};

export default function StudentsView({ students, freshLeads = [] }: { students: Student[], freshLeads?: CRMLead[] }) {
  const [search, setSearch]           = useState('');
  const [tab, setTab]                 = useState<'all' | 'leads' | 'paid' | 'fresh'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const active = useMemo(() => students.filter(st => st.status !== 'ARCHIVED'), [students]);
  const archived = useMemo(() => students.filter(st => st.status === 'ARCHIVED'), [students]);
  const leads  = useMemo(() => active.filter(st => !st.payments.some(p => p.status === 'PAID')), [active]);
  const paid   = useMemo(() => active.filter(st =>  st.payments.some(p => p.status === 'PAID')), [active]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = tab === 'leads' ? leads : tab === 'paid' ? paid : active;
    if (!q) return base;
    return base.filter(st =>
      st.user.name?.toLowerCase().includes(q) ||
      st.user.email.toLowerCase().includes(q) ||
      (st.user.phone || '').toLowerCase().includes(q) ||
      (st.country || '').toLowerCase().includes(q)
    );
  }, [search, tab, active, leads, paid]);

  const fLeads = filtered.filter(st => !st.payments.some(p => p.status === 'PAID'));
  const fPaid  = filtered.filter(st =>  st.payments.some(p => p.status === 'PAID'));

  const fArchived = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return archived;
    return archived.filter(st =>
      st.user.name?.toLowerCase().includes(q) ||
      st.user.email.toLowerCase().includes(q) ||
      (st.country || '').toLowerCase().includes(q)
    );
  }, [archived, search]);

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.heading}>STUDENTS</h1>
          <p className={s.subHeading}>{leads.length} follow up · {paid.length} paid · {active.length} total</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className={s.searchInput}
              type="text"
              placeholder="Search name, email, phone, country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className={s.addBtn} onClick={() => setShowAddModal(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Student
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={s.tabs}>
        {([
          ['all',   'ALL',        active.length],
          ['fresh', 'FRESH LEADS', freshLeads.length],
          ['leads', 'FOLLOW UP',  leads.length],
          ['paid',  'PAID',       paid.length],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? `${s.tab} ${s.tabActive}` : s.tab}
          >
            {label}
            <span className={tab === key ? `${s.tabCount} ${s.tabCountActive}` : s.tabCount}>{count}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      {tab === 'fresh' && (
        <SectionBlock title="FRESH LEADS — SCHEDULE FLOW" count={freshLeads.length} accent="#ec4899">
          {freshLeads.length === 0
            ? <EmptyCard icon="⚡" title="No fresh leads" sub="Hot leads from the schedule selection flow appear here" />
            : freshLeads.map(ld => <LeadCard key={ld.id} ld={ld} />)}
        </SectionBlock>
      )}

      {tab !== 'paid' && tab !== 'fresh' && (
        <SectionBlock title="LEADS — FOLLOW UP" count={fLeads.length} accent="#f59e0b">
          {fLeads.length === 0
            ? <EmptyCard icon="👋" title="No leads yet" sub={search ? 'Try a different search' : 'Leads appear when students register without completing payment'} />
            : fLeads.map(st => <StudentCard key={st.id} st={st} />)}
        </SectionBlock>
      )}

      {tab !== 'leads' && tab !== 'fresh' && (
        <SectionBlock title="PAID STUDENTS" count={fPaid.length} accent="#10b981">
          {fPaid.length === 0
            ? <EmptyCard icon="🎓" title="No paid students yet" sub={search ? 'Try a different search' : 'Students who complete checkout will appear here'} />
            : fPaid.map(st => <StudentCard key={st.id} st={st} />)}
        </SectionBlock>
      )}

      {/* Archived section — always shown at bottom if any exist */}
      {fArchived.length > 0 && (
        <SectionBlock title="ARCHIVED STUDENTS" count={fArchived.length} accent="rgba(107,114,128,0.7)">
          {fArchived.map(st => <StudentCard key={st.id} st={st} />)}
        </SectionBlock>
      )}

      {/* Add Student Modal */}
      {showAddModal && <AddStudentModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}

/* ── Add Student Modal ─────────────────────────── */
function AddStudentModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const res = await fetch('/api/crm/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create student');
    }
    setSaving(false);
  }

  return (
    <div className={s.modalOverlay} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={s.modalBox}>
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>Add Student</h2>
          <button className={s.modalClose} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleCreate}>
          <div className={s.modalBody}>
            <div className={s.modalField}>
              <label className={s.modalLabel}>Name *</label>
              <input
                className={s.modalInput}
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className={s.modalField}>
              <label className={s.modalLabel}>Email *</label>
              <input
                className={s.modalInput}
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <div className={s.modalError}>{error}</div>}
          </div>

          <div className={s.modalFooter}>
            <button type="button" className={s.modalCancelBtn} onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className={s.modalCreateBtn} disabled={saving || !name.trim() || !email.trim()}>
              {saving ? 'Creating…' : 'Create Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Section ───────────────────────────────────── */
function SectionBlock({ title, count, accent, children }: {
  title: string; count: number; accent: string; children: React.ReactNode;
}) {
  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <div className={s.sectionBar} style={{ background: accent }} />
        <h2 className={s.sectionTitle}>{title}</h2>
        <span className={s.sectionCount} style={{ color: accent, background: `${accent}1a` }}>{count}</span>
      </div>
      <div className={s.list}>{children}</div>
    </div>
  );
}

/* ── Empty card ────────────────────────────────── */
function EmptyCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>{icon}</div>
      <div className={s.emptyTitle}>{title}</div>
      <div className={s.emptySub}>{sub}</div>
    </div>
  );
}

/* ── Student Card ──────────────────────────────── */
function StudentCard({ st }: { st: Student }) {
  const router = useRouter();
  const name     = st.user.name || '—';
  const initials = (st.user.name || st.user.email || '?').slice(0, 2).toUpperCase();
  const paidPayment    = st.payments.find(p => p.status === 'PAID');
  const latestPayment  = st.payments[0];
  const displayPayment = paidPayment || latestPayment;

  const sc = STATUS_STYLE[st.status] || { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.2)' };
  const isArchived = st.status === 'ARCHIVED';

  const allCartDetails: { courseTitle: string; dateLabel: string; timeLabel: string; priceIDR: number }[] = [];
  for (const p of st.payments) {
    const meta = p.metadata as any;
    if (meta?.cartDetails?.length) allCartDetails.push(...meta.cartDetails);
  }

  const [menuOpen, setMenuOpen]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  async function setStatus(status: string) {
    setSaving(true);
    setMenuOpen(false);
    const res = await fetch(`/api/admin/students/${st.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
    });
    if (res.ok) router.refresh();
    setSaving(false);
  }

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/admin/students/${st.id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    setSaving(false);
    setConfirmDelete(false);
  }

  return (
    <div className={s.card} style={{ borderLeft: `3px solid ${sc.border}` }}>
      <div className={s.cardTop}>
        <div className={s.cardLeft}>
          <div className={s.cardAvatar} style={{ background: sc.bg, color: sc.text, opacity: isArchived ? 0.7 : 1 }}>{initials}</div>
          <div className={s.cardNameWrap}>
            <div className={s.cardName}>{name}</div>
            <div className={s.chips}>
              <a href={`mailto:${st.user.email}`} className={`${s.chip} ${s.chipEmail}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {st.user.email}
              </a>
              {st.user.phone && (
                <a href={`tel:${st.user.phone}`} className={`${s.chip} ${s.chipPhone}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {st.user.phone}
                </a>
              )}
              {st.country && <span className={s.chipCountry}><span>🌍</span>{st.country}</span>}
            </div>
          </div>
        </div>

        <div className={s.cardRight}>
          <span className={s.statusBadge} style={{ background: sc.bg, color: sc.text }}>{st.status}</span>
          <span className={s.cardDate}>{fmt(st.createdAt)}</span>
          {displayPayment && (
            <div className={s.payRow}>
              <PayBadge status={displayPayment.status} />
              <span className={s.payAmount}>
                {displayPayment.currency === 'MYR'
                  ? `RM ${Number(displayPayment.amount).toLocaleString('ms-MY')}`
                  : `Rp ${Number(displayPayment.amount).toLocaleString('id-ID')}`}
              </span>
            </div>
          )}

          {/* "⋯" menu */}
          <div className={s.menuWrap} ref={menuRef}>
            <button
              className={s.menuBtn}
              onClick={() => setMenuOpen(v => !v)}
              disabled={saving}
              title="Actions"
            >
              ···
            </button>
            {menuOpen && (
              <div className={s.dropdown}>
                {!isArchived && (
                  <>
                    {st.status !== 'ACTIVE' && (
                      <button className={s.dropdownItem} onClick={() => setStatus('ACTIVE')}>
                        ✓ Set Active
                      </button>
                    )}
                    {st.status !== 'LEAD' && (
                      <button className={s.dropdownItem} onClick={() => setStatus('LEAD')}>
                        ○ Set Lead
                      </button>
                    )}
                    <button className={s.dropdownItem} onClick={() => setStatus('ARCHIVED')}>
                      ↓ Archive
                    </button>
                    <div className={s.dropdownDivider} />
                  </>
                )}
                {isArchived && (
                  <>
                    <button className={s.dropdownItem} onClick={() => setStatus('LEAD')}>
                      ↑ Unarchive
                    </button>
                    <div className={s.dropdownDivider} />
                  </>
                )}
                <button className={`${s.dropdownItem} ${s.dropdownItemDanger}`} onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}>
                  ✕ Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart details */}
      {allCartDetails.length > 0 && (
        <div className={s.cartSection}>
          <div className={s.cartLabel}>Selected Courses</div>
          <div className={s.cartList}>
            {allCartDetails.map((item, i) => (
              <div key={i} className={s.cartItem}>
                <div>
                  <div className={s.cartItemTitle}>{item.courseTitle}</div>
                  <div className={s.cartItemMeta}>
                    {item.dateLabel && <span className={s.cartItemDetail}>📅 {item.dateLabel}</span>}
                    {item.timeLabel && <span className={s.cartItemDetail}>🕐 {item.timeLabel}</span>}
                  </div>
                </div>
                <span className={s.cartItemPrice}>Rp {item.priceIDR?.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allCartDetails.length === 0 && !displayPayment && (
        <div className={s.cardNoData}>No course selection yet</div>
      )}

      {/* Inline delete confirmation */}
      {confirmDelete && (
        <div className={s.confirmBox}>
          <div className={s.confirmInner}>
            <p className={s.confirmText}>Delete {name}? This also removes all payment records.</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setConfirmDelete(false)} disabled={saving}>Cancel</button>
              <button className={s.confirmDelete} onClick={handleDelete} disabled={saving}>
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Lead Card ─────────────────────────────────── */
function LeadCard({ ld }: { ld: CRMLead }) {
  const router = useRouter();
  const initials = 'L';
  const sc = { bg: 'rgba(236,72,153,0.12)', text: '#ec4899', border: '#ec4899' };
  
  // Parse the latest note if it's JSON
  let details: any = null;
  const latestActivity = ld.activities[0];
  if (latestActivity?.notes) {
    try {
      details = JSON.parse(latestActivity.notes);
    } catch (e) {
      details = { course: ld.source || 'Unknown Course' };
    }
  }

  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${ld.id}`, { method: 'DELETE' });
    if (res.ok) router.refresh();
    setSaving(false);
    setConfirmDelete(false);
  }

  return (
    <div className={s.card} style={{ borderLeft: `3px solid ${sc.border}` }}>
      <div className={s.cardTop}>
        <div className={s.cardLeft}>
          <div className={s.cardAvatar} style={{ background: sc.bg, color: sc.text }}>{initials}</div>
          <div className={s.cardNameWrap}>
            <div className={s.cardName}>Fresh Lead</div>
            <div className={s.chips}>
              <a href={`mailto:${ld.email}`} className={`${s.chip} ${s.chipEmail}`}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {ld.email}
              </a>
              {ld.phone && (
                <a href={`tel:${ld.phone}`} className={`${s.chip} ${s.chipPhone}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {ld.phone}
                </a>
              )}
              {ld.utmSource && <span className={s.chipCountry} title={`UTM: ${ld.utmMedium}/${ld.utmCampaign}`}><span>📢</span>{ld.utmSource}</span>}
            </div>
          </div>
        </div>

        <div className={s.cardRight}>
          <span className={s.statusBadge} style={{ background: sc.bg, color: sc.text }}>FRESH</span>
          <span className={s.cardDate}>{fmt(ld.createdAt)}</span>
          <div className={s.menuWrap}>
             <button className={s.menuBtn} onClick={() => setConfirmDelete(true)} disabled={saving}>✕</button>
          </div>
        </div>
      </div>

      {details && (
        <div className={s.cartSection}>
          <div className={s.cartLabel}>Intent Context</div>
          <div className={s.cartList}>
            <div className={s.cartItem}>
              <div>
                <div className={s.cartItemTitle}>{details.course}</div>
                <div className={s.cartItemMeta}>
                  {details.dates && <span className={s.cartItemDetail}>📅 {details.dates}</span>}
                  {details.times && <span className={s.cartItemDetail}>🕐 {details.times}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className={s.confirmBox}>
          <div className={s.confirmInner}>
            <p className={s.confirmText}>Remove this lead permanentely?</p>
            <div className={s.confirmBtns}>
              <button className={s.confirmCancel} onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button className={s.confirmDelete} onClick={handleDelete} disabled={saving}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PAID:     { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    PENDING:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    FAILED:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
    REFUNDED: { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  };
  const st = map[status] || { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' };
  return (
    <span className={s.payBadge} style={{ background: st.bg, color: st.color }}>{status}</span>
  );
}
