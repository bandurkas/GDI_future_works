'use client';

import { useState, useMemo } from 'react';
import { fmt } from '@/lib/utils';
import AppActions from './AppActions';

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function minutesToTime(m: number) {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
}

type Availability = { dayOfWeek: number; startTimeM: number; endTimeM: number };
type TutorProfile = {
  headline: string | null; hourlyRate: any; experienceYears: number | null;
  languages: string[]; portfolioUrl: string | null; introVideoUrl: string | null;
};
type Tutor = {
  id: string; status: string; isVerified: boolean; expertise: string[]; bio: string | null;
  createdAt: Date;
  user: { name: string | null; email: string; phone: string | null };
  availability: Availability[];
  profile: TutorProfile | null;
};
type Application = {
  id: string; name: string; email: string; status: string; expertise: string | null;
  timezone: string | null; bio: string | null; availability: string | null;
  linkedin: string | null; videoLink: string | null; portfolioLink: string | null;
  curriculum: string | null; lessonPlan: string | null;
  createdAt: Date;
};

type Tab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function TutorsView({ applications, tutors }: { applications: Application[]; tutors: Tutor[] }) {
  const [tab, setTab] = useState<Tab>('ALL');
  const [search, setSearch] = useState('');

  const counts = useMemo(() => ({
    ALL:      applications.length,
    PENDING:  applications.filter(a => a.status === 'PENDING').length,
    APPROVED: applications.filter(a => a.status === 'APPROVED').length,
    REJECTED: applications.filter(a => a.status === 'REJECTED').length,
  }), [applications]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let base = tab === 'ALL' ? applications : applications.filter(a => a.status === tab);
    if (q) base = base.filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.expertise || '').toLowerCase().includes(q)
    );
    return base;
  }, [applications, tab, search]);

  const filteredTutors = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return tutors;
    return tutors.filter(t =>
      (t.user.name || '').toLowerCase().includes(q) ||
      t.user.email.toLowerCase().includes(q) ||
      t.expertise.some(e => e.toLowerCase().includes(q))
    );
  }, [tutors, search]);

  const showTutors = tab === 'ALL' || tab === 'APPROVED';

  return (
    <div style={{ maxWidth: '960px', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
            TUTOR PIPELINE
          </h1>
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            {counts.PENDING} pending · {counts.APPROVED} approved · {tutors.length} active
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* LIVE SYNC indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="crm-live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'block', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', letterSpacing: '0.08em' }}>LIVE SYNC</span>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'rgba(255,255,255,0.2)' }}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="crm-input"
              type="text"
              placeholder="Search tutors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '7px 12px 7px 30px',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', fontSize: '12px', width: '200px',
                background: 'rgba(255,255,255,0.05)', color: 'white',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
            />
          </div>

          {/* Add manually */}
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              background: '#e43a3d', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Manually
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px' }}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as Tab[]).map(key => (
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
            {key}
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px',
              background: tab === key ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)',
              color: tab === key ? 'white' : 'rgba(255,255,255,0.3)',
            }}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Applications section */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="📋"
          title={search ? 'No results' : `No ${tab === 'ALL' ? '' : tab.toLowerCase() + ' '}applications`}
          sub={search ? 'Try a different search term' : 'Applications submitted via the tutor form will appear here'}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: showTutors ? '36px' : 0 }}>
          {filtered.map(a => <AppCard key={a.id} a={a} />)}
        </div>
      )}

      {/* Active tutors section (show when tab is ALL or APPROVED) */}
      {showTutors && filteredTutors.length > 0 && (
        <div style={{ marginTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '3px', height: '14px', background: '#10b981', borderRadius: '2px' }} />
            <h2 style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ACTIVE TUTORS
            </h2>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '20px' }}>
              {filteredTutors.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTutors.map(t => <TutorCard key={t.id} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function AppCard({ a }: { a: Application }) {
  const [expanded, setExpanded] = useState(false);

  const statusStyle: Record<string, { bg: string; color: string; border: string }> = {
    PENDING:  { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b',  border: '#f59e0b' },
    APPROVED: { bg: 'rgba(16,185,129,0.12)',  color: '#10b981',  border: '#10b981' },
    REJECTED: { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  border: '#ef4444' },
  };
  const sc = statusStyle[a.status] || { bg: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.15)' };
  const initials = (a.name || '?').slice(0, 2).toUpperCase();

  return (
    <div
      className="crm-card"
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: `3px solid ${sc.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header row — always visible */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
            background: sc.bg, color: sc.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{a.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{a.email}</span>
              {a.expertise && (
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>
                  {a.expertise}
                </span>
              )}
              {a.timezone && (
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>🕐 {a.timezone}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace" }}>{fmt(a.createdAt)}</span>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px',
            background: sc.bg, color: sc.color,
          }}>{a.status}</span>
          <button
            className="crm-expand-btn"
            onClick={() => setExpanded(v => !v)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: '5px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', transition: 'background 0.15s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {a.bio && <DarkField label="Bio / Background" value={a.bio} multiline span2 />}
            {a.availability && <DarkField label="Availability" value={a.availability} multiline />}
          </div>

          {(a.linkedin || a.videoLink || a.portfolioLink) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
              {a.linkedin && <DarkLinkChip label="LinkedIn" href={a.linkedin} />}
              {a.videoLink && <DarkLinkChip label="Intro Video" href={a.videoLink} />}
              {a.portfolioLink && <DarkLinkChip label="Portfolio" href={a.portfolioLink} />}
            </div>
          )}

          {a.curriculum && <div style={{ marginBottom: '14px' }}><DarkField label="Curriculum / Teaching Approach" value={a.curriculum} multiline /></div>}
          {a.lessonPlan && <div style={{ marginBottom: '14px' }}><DarkField label="Sample Lesson Plan" value={a.lessonPlan} multiline /></div>}

          <AppActions id={a.id} status={a.status} />
        </div>
      )}
    </div>
  );
}

function TutorCard({ t }: { t: Tutor }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (t.user.name || t.user.email || '?').slice(0, 2).toUpperCase();

  // Build day → slots map
  const byDay: Record<number, { start: number; end: number }[]> = {};
  for (const slot of t.availability) {
    if (!byDay[slot.dayOfWeek]) byDay[slot.dayOfWeek] = [];
    byDay[slot.dayOfWeek].push({ start: slot.startTimeM, end: slot.endTimeM });
  }
  const hasDay = (d: number) => !!byDay[d]?.length;

  return (
    <div
      className="crm-card"
      style={{
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.07)',
        borderLeft: '3px solid #10b981',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
            background: 'rgba(16,185,129,0.12)', color: '#10b981',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px' }}>{t.user.name || '—'}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{t.user.email}</span>
              {t.expertise.slice(0, 3).map(e => (
                <span key={e} style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '2px 7px', borderRadius: '4px' }}>
                  {e}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* 7-day grid */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {DAYS_SHORT.map((day, i) => (
              <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <span style={{ fontSize: '8px', fontWeight: 600, color: hasDay(i) ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', letterSpacing: '0.02em' }}>{day}</span>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: hasDay(i) ? '#10b981' : 'rgba(255,255,255,0.08)',
                }} />
              </div>
            ))}
          </div>

          {t.isVerified && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px', background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>VERIFIED</span>
          )}
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 9px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>ACTIVE</span>
          <button
            className="crm-expand-btn"
            onClick={() => setExpanded(v => !v)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', padding: '5px', borderRadius: '6px',
              display: 'flex', alignItems: 'center', transition: 'background 0.15s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px' }}>
          {t.bio && <div style={{ marginBottom: '14px' }}><DarkField label="Bio" value={t.bio} multiline /></div>}

          {/* Detailed schedule */}
          {t.availability.length > 0 && (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Weekly Schedule
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {Object.entries(byDay).map(([day, slots]) => (
                  <div key={day} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px 10px', minWidth: '100px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', marginBottom: '4px', letterSpacing: '0.04em' }}>{DAYS_SHORT[Number(day)]}</div>
                    {slots.map((sl, i) => (
                      <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Mono', monospace" }}>
                        {minutesToTime(sl.start)} – {minutesToTime(sl.end)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {t.profile && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {t.profile.headline && <DarkField label="Headline" value={t.profile.headline} />}
              {t.profile.hourlyRate && <DarkField label="Hourly Rate" value={`$${t.profile.hourlyRate}/hr`} />}
              {t.profile.experienceYears && <DarkField label="Experience" value={`${t.profile.experienceYears} years`} />}
              {t.profile.languages?.length > 0 && <DarkField label="Languages" value={t.profile.languages.join(', ')} />}
            </div>
          )}

          {(t.profile?.portfolioUrl || t.profile?.introVideoUrl) && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {t.profile?.portfolioUrl && <DarkLinkChip label="Portfolio" href={t.profile.portfolioUrl} />}
              {t.profile?.introVideoUrl && <DarkLinkChip label="Intro Video" href={t.profile.introVideoUrl} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DarkField({ label, value, multiline, span2 }: { label: string; value: string; multiline?: boolean; span2?: boolean }) {
  return (
    <div style={span2 ? { gridColumn: '1 / -1' } : {}}>
      <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, whiteSpace: multiline ? 'pre-wrap' : 'normal', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function DarkLinkChip({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '11px', color: '#e43a3d',
        padding: '5px 10px', borderRadius: '6px',
        background: 'rgba(228,58,61,0.08)', border: '1px solid rgba(228,58,61,0.15)',
        textDecoration: 'none', fontWeight: 500,
        transition: 'background 0.12s',
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      {label}
    </a>
  );
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: '12px',
      padding: '40px', textAlign: 'center',
    }}>
      <div style={{ fontSize: '26px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>{sub}</div>
    </div>
  );
}
