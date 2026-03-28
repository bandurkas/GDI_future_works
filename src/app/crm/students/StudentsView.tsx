'use client';

import { useState, useMemo } from 'react';
import { fmt } from '@/lib/utils';
import s from './StudentsView.module.css';

type Payment = { status: string; amount: any; currency: string; metadata: any; createdAt: Date };
type Student = {
  id: string; status: string; createdAt: Date; country: string | null;
  user: { name: string | null; email: string; phone: string | null };
  payments: Payment[];
};

const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  LEAD:      { bg: 'rgba(245,158,11,0.12)',  text: '#f59e0b',  border: '#f59e0b' },
  ACTIVE:    { bg: 'rgba(16,185,129,0.12)',  text: '#10b981',  border: '#10b981' },
  COMPLETED: { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa',  border: '#3b82f6' },
  DROPPED:   { bg: 'rgba(239,68,68,0.12)',   text: '#f87171',  border: '#ef4444' },
};

export default function StudentsView({ leads, paid }: { leads: Student[]; paid: Student[] }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'leads' | 'paid'>('all');

  const all = useMemo(() => [...leads, ...paid], [leads, paid]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const base = tab === 'leads' ? leads : tab === 'paid' ? paid : all;
    if (!q) return base;
    return base.filter(st =>
      st.user.name?.toLowerCase().includes(q) ||
      st.user.email.toLowerCase().includes(q) ||
      (st.country || '').toLowerCase().includes(q)
    );
  }, [search, tab, leads, paid, all]);

  const fLeads = filtered.filter(st => !st.payments.some(p => p.status === 'PAID'));
  const fPaid  = filtered.filter(st =>  st.payments.some(p => p.status === 'PAID'));

  return (
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.heading}>STUDENTS</h1>
          <p className={s.subHeading}>{leads.length} follow up · {paid.length} paid · {all.length} total</p>
        </div>

        <div className={s.searchWrap}>
          <span className={s.searchIcon}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            className={s.searchInput}
            type="text"
            placeholder="Search name, email, country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className={s.tabs}>
        {([
          ['all',   'ALL',        all.length],
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
      {tab !== 'paid' && (
        <SectionBlock title="LEADS — FOLLOW UP" count={fLeads.length} accent="#f59e0b">
          {fLeads.length === 0
            ? <EmptyCard icon="👋" title="No leads yet" sub={search ? 'Try a different search' : 'Leads appear when students register without completing payment'} />
            : fLeads.map(st => <StudentCard key={st.id} st={st} />)}
        </SectionBlock>
      )}

      {tab !== 'leads' && (
        <SectionBlock title="PAID STUDENTS" count={fPaid.length} accent="#10b981">
          {fPaid.length === 0
            ? <EmptyCard icon="🎓" title="No paid students yet" sub={search ? 'Try a different search' : 'Students who complete checkout will appear here'} />
            : fPaid.map(st => <StudentCard key={st.id} st={st} />)}
        </SectionBlock>
      )}
    </div>
  );
}

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

function EmptyCard({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>{icon}</div>
      <div className={s.emptyTitle}>{title}</div>
      <div className={s.emptySub}>{sub}</div>
    </div>
  );
}

function StudentCard({ st }: { st: Student }) {
  const name = st.user.name || '—';
  const initials = (st.user.name || st.user.email || '?').slice(0, 2).toUpperCase();
  const paidPayment = st.payments.find(p => p.status === 'PAID');
  const latestPayment = st.payments[0];
  const displayPayment = paidPayment || latestPayment;

  const sc = STATUS_STYLE[st.status] || { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.2)' };

  const allCartDetails: { courseTitle: string; dateLabel: string; timeLabel: string; priceIDR: number }[] = [];
  for (const p of st.payments) {
    const meta = p.metadata as any;
    if (meta?.cartDetails?.length) allCartDetails.push(...meta.cartDetails);
  }

  return (
    <div className={s.card} style={{ borderLeft: `3px solid ${sc.border}` }}>
      <div className={s.cardTop}>
        <div className={s.cardLeft}>
          <div className={s.cardAvatar} style={{ background: sc.bg, color: sc.text }}>{initials}</div>
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
              {st.country && (
                <span className={s.chipCountry}><span>🌍</span>{st.country}</span>
              )}
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
