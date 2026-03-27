'use client';

import { useState, useMemo } from 'react';
import { fmt } from '@/lib/utils';

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
    return base.filter(s =>
      s.user.name?.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      (s.country || '').toLowerCase().includes(q)
    );
  }, [search, tab, leads, paid, all]);

  const fLeads = filtered.filter(s => !s.payments.some(p => p.status === 'PAID'));
  const fPaid  = filtered.filter(s =>  s.payments.some(p => p.status === 'PAID'));

  return (
    <div style={{ maxWidth: '960px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
            STUDENTS
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.02em' }}>
            {leads.length} follow up · {paid.length} paid · {all.length} total
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.2)' }}
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="crm-input"
            type="text"
            placeholder="Search name, email, country…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '8px 14px 8px 32px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '9px', fontSize: '12px', width: '240px',
              background: 'rgba(255,255,255,0.05)', color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px' }}>
        {([
          ['all',   'ALL',        all.length],
          ['leads', 'FOLLOW UP',  leads.length],
          ['paid',  'PAID',       paid.length],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab !== key ? 'crm-filter-tab' : undefined}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '7px',
              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.05em',
              border: tab === key ? 'none' : '1px solid rgba(255,255,255,0.08)',
              background: tab === key ? '#e43a3d' : 'transparent',
              color: tab === key ? 'white' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.15s',
            }}
          >
            {label}
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px',
              background: tab === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              color: tab === key ? 'white' : 'rgba(255,255,255,0.3)',
            }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Sections */}
      {tab !== 'paid' && (
        <Section title="LEADS — FOLLOW UP" count={fLeads.length} accent="#f59e0b">
          {fLeads.length === 0
            ? <EmptyState icon="👋" title="No leads yet" sub={search ? 'Try a different search' : 'Leads appear when students register without completing payment'} />
            : fLeads.map(s => <StudentCard key={s.id} s={s} />)}
        </Section>
      )}

      {tab !== 'leads' && (
        <Section title="PAID STUDENTS" count={fPaid.length} accent="#10b981">
          {fPaid.length === 0
            ? <EmptyState icon="🎓" title="No paid students yet" sub={search ? 'Try a different search' : 'Students who complete checkout will appear here'} />
            : fPaid.map(s => <StudentCard key={s.id} s={s} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, count, accent, children }: {
  title: string; count: number; accent: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '3px', height: '14px', background: accent, borderRadius: '2px' }} />
        <h2 style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {title}
        </h2>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: accent,
          background: `${accent}1a`, padding: '2px 8px', borderRadius: '20px',
        }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{children}</div>
    </div>
  );
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px',
      padding: '36px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '26px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>{sub}</div>
    </div>
  );
}

function StudentCard({ s }: { s: Student }) {
  const name = s.user.name || '—';
  const initials = (s.user.name || s.user.email || '?').slice(0, 2).toUpperCase();
  const paidPayment = s.payments.find(p => p.status === 'PAID');
  const latestPayment = s.payments[0];
  const displayPayment = paidPayment || latestPayment;

  const sc = STATUS_STYLE[s.status] || { bg: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.2)' };

  const allCartDetails: { courseTitle: string; dateLabel: string; timeLabel: string; priceIDR: number }[] = [];
  for (const p of s.payments) {
    const meta = p.metadata as any;
    if (meta?.cartDetails?.length) allCartDetails.push(...meta.cartDetails);
  }

  return (
    <div
      className="crm-card"
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${sc.border}`,
        borderRadius: '12px',
        padding: '16px 18px',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
            background: sc.bg, color: sc.text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {name}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <ContactChip
                type="email"
                icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                value={s.user.email}
                href={`mailto:${s.user.email}`}
              />
              {s.user.phone && (
                <ContactChip
                  type="phone"
                  icon={<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l1.27-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  value={s.user.phone}
                  href={`tel:${s.user.phone}`}
                />
              )}
              {s.country && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>🌍</span>{s.country}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right meta */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
            background: sc.bg, color: sc.text,
          }}>{s.status}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace" }}>
            {fmt(s.createdAt)}
          </span>
          {displayPayment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <PayBadge status={displayPayment.status} />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Mono', monospace" }}>
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
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Selected Courses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {allCartDetails.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 12px', gap: '12px',
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{item.courseTitle}</div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                    {item.dateLabel && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>📅 {item.dateLabel}</span>}
                    {item.timeLabel && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>🕐 {item.timeLabel}</span>}
                  </div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                  Rp {item.priceIDR?.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {allCartDetails.length === 0 && !displayPayment && (
        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>No course selection yet</span>
        </div>
      )}
    </div>
  );
}

function ContactChip({ type, icon, value, href }: { type: 'email' | 'phone'; icon: React.ReactNode; value: string; href: string }) {
  return (
    <a
      href={href}
      className={type === 'email' ? 'crm-chip-email' : 'crm-chip-phone'}
      style={{
        fontSize: '11px', color: 'rgba(255,255,255,0.4)',
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 7px', borderRadius: '6px',
        background: 'rgba(255,255,255,0.05)',
        textDecoration: 'none', transition: 'background 0.12s, color 0.12s',
      }}
    >
      {icon}{value}
    </a>
  );
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PAID:     { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
    PENDING:  { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
    FAILED:   { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
    REFUNDED: { bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  };
  const s = map[status] || { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' };
  return (
    <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
