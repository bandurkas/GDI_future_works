'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { fmt } from '@/lib/utils';
import AppActions from './AppActions';
import s from './TutorsView.module.css';

const DAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const TIME_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  morning:   { dot: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  label: 'Morning'   },
  afternoon: { dot: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  label: 'Afternoon' },
  evening:   { dot: '#8b5cf6', bg: 'rgba(139,92,246,0.15)',  label: 'Evening'   },
  night:     { dot: '#6366f1', bg: 'rgba(99,102,241,0.15)',  label: 'Night'     },
  free:      { dot: '#10b981', bg: 'rgba(16,185,129,0.15)',  label: 'Free'      },
};

function parseAvailability(raw: string | null): Record<number, string[]> {
  if (!raw) return {};
  const result: Record<number, string[]> = {};
  let items: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) items = parsed.map(String);
    else items = [String(parsed)];
  } catch {
    items = raw.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
  }
  const dayMap: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  for (const item of items) {
    const lower = item.toLowerCase().replace(/\s/g, '-');
    const dayKey = Object.keys(dayMap).find(k => lower.startsWith(k));
    if (dayKey === undefined) continue;
    const dayIdx = dayMap[dayKey];
    const timeKey = Object.keys(TIME_COLORS).find(t => lower.includes(t)) || 'free';
    if (!result[dayIdx]) result[dayIdx] = [];
    if (!result[dayIdx].includes(timeKey)) result[dayIdx].push(timeKey);
  }
  return result;
}

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

export default function TutorsView({ applications, tutors, archivedTutors }: { applications: Application[]; tutors: Tutor[]; archivedTutors: Tutor[] }) {
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
    <div className={s.wrap}>
      {/* Header */}
      <div className={s.header}>
        <div>
          <h1 className={s.heading}>TUTOR PIPELINE</h1>
          <p className={s.subHeading}>{counts.PENDING} pending · {counts.APPROVED} approved · {tutors.length} active</p>
        </div>

        <div className={s.headerRight}>
          {/* LIVE SYNC */}
          <div className={s.liveBadge}>
            <span className={s.liveDot} />
            <span className={s.liveText}>LIVE SYNC</span>
          </div>

          {/* Search */}
          <div className={s.searchWrap}>
            <span className={s.searchIcon}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input
              className={s.searchInput}
              type="text"
              placeholder="Search tutors…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <button className={s.addBtn}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Manually
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={s.tabs}>
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as Tab[]).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={tab === key ? `${s.tab} ${s.tabActive}` : s.tab}
          >
            {key}
            <span className={tab === key ? `${s.tabCount} ${s.tabCountActive}` : s.tabCount}>{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Applications */}
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

      {/* Active tutors */}
      {showTutors && filteredTutors.length > 0 && (
        <div>
          <div className={s.sectionHead}>
            <div className={s.sectionBar} style={{ background: '#10b981' }} />
            <h2 className={s.sectionTitle}>ACTIVE TUTORS</h2>
            <span className={s.sectionCount} style={{ color: '#10b981', background: 'rgba(16,185,129,0.12)' }}>
              {filteredTutors.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTutors.map(t => <TutorCard key={t.id} t={t} />)}
          </div>
        </div>
      )}

      {/* Archived tutors */}
      {archivedTutors.length > 0 && (
        <div style={{ marginTop: showTutors && filteredTutors.length > 0 ? '36px' : '8px' }}>
          <div className={s.sectionHead}>
            <div className={s.sectionBar} style={{ background: 'rgba(107,114,128,0.7)' }} />
            <h2 className={s.sectionTitle}>ARCHIVED TUTORS</h2>
            <span className={s.sectionCount} style={{ color: 'rgba(107,114,128,0.9)', background: 'rgba(107,114,128,0.1)' }}>
              {archivedTutors.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {archivedTutors.map(t => <TutorCard key={t.id} t={t} isArchived />)}
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
    <div className={s.card} style={{ borderLeft: `3px solid ${sc.border}` }}>
      <div className={s.cardHead}>
        <div className={s.cardLeft}>
          <div className={s.cardAvatar} style={{ background: sc.bg, color: sc.color }}>{initials}</div>
          <div className={s.cardNameWrap}>
            <div className={s.cardName}>{a.name}</div>
            <div className={s.cardSubRow}>
              <span className={s.cardEmail}>{a.email}</span>
              {a.expertise && <span className={s.expertiseTag}>{a.expertise}</span>}
              {a.timezone && <span className={s.cardTimezone}>🕐 {a.timezone}</span>}
            </div>
          </div>
        </div>

        <div className={s.cardRight}>
          <span className={s.cardDate}>{fmt(a.createdAt)}</span>
          <span className={s.statusBadge} style={{ background: sc.bg, color: sc.color }}>{a.status}</span>
          <button className={s.expandBtn} onClick={() => setExpanded(v => !v)}>
            <svg
              className={expanded ? `${s.chevron} ${s.chevronOpen}` : s.chevron}
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className={s.expandBody}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
            {a.bio && <Field label="Bio / Background" value={a.bio} />}
            {a.availability && <AvailabilityGrid raw={a.availability} />}
          </div>

          {(a.linkedin || a.videoLink || a.portfolioLink) && (
            <div className={s.linkChips}>
              {a.linkedin && <LinkChip label="LinkedIn" href={a.linkedin} />}
              {a.videoLink && <LinkChip label="Intro Video" href={a.videoLink} />}
              {a.portfolioLink && <LinkChip label="Portfolio" href={a.portfolioLink} />}
            </div>
          )}

          {a.curriculum && <div className={s.fieldBlock}><Field label="Curriculum / Teaching Approach" value={a.curriculum} /></div>}
          {a.lessonPlan && <div className={s.fieldBlock}><Field label="Sample Lesson Plan" value={a.lessonPlan} /></div>}

          <AppActions id={a.id} status={a.status} />
        </div>
      )}
    </div>
  );
}

function TutorCard({ t, isArchived = false }: { t: Tutor; isArchived?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const initials = (t.user.name || t.user.email || '?').slice(0, 2).toUpperCase();

  const byDay: Record<number, { start: number; end: number }[]> = {};
  for (const slot of t.availability) {
    if (!byDay[slot.dayOfWeek]) byDay[slot.dayOfWeek] = [];
    byDay[slot.dayOfWeek].push({ start: slot.startTimeM, end: slot.endTimeM });
  }
  const hasDay = (d: number) => !!byDay[d]?.length;

  const borderColor = isArchived ? 'rgba(107,114,128,0.5)' : '#10b981';
  const avatarBg    = isArchived ? 'rgba(107,114,128,0.1)' : 'rgba(16,185,129,0.12)';
  const avatarColor = isArchived ? '#9ca3af' : '#10b981';

  return (
    <div className={s.card} style={{ borderLeft: `3px solid ${borderColor}` }}>
      <div className={s.cardHead}>
        <div className={s.cardLeft}>
          <div className={s.cardAvatar} style={{ background: avatarBg, color: avatarColor }}>{initials}</div>
          <div className={s.cardNameWrap}>
            <div className={s.cardName}>{t.user.name || '—'}</div>
            <div className={s.cardSubRow}>
              <span className={s.cardEmail}>{t.user.email}</span>
              {t.expertise.slice(0, 3).map(e => (
                <span key={e} className={s.expertiseTag}>{e}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={s.cardRight}>
          {/* 7-day grid */}
          <div className={s.dayGrid}>
            {DAYS_SHORT.map((day, i) => (
              <div key={day} className={s.dayCol}>
                <span className={s.dayLabel} style={{ color: hasDay(i) ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)' }}>{day}</span>
                <div className={s.dayDot} style={{ background: hasDay(i) ? '#10b981' : 'rgba(255,255,255,0.08)' }} />
              </div>
            ))}
          </div>

          {t.isVerified && !isArchived && <span className={s.verifiedBadge}>VERIFIED</span>}
          {isArchived
            ? <span className={s.statusBadge} style={{ background: 'rgba(107,114,128,0.1)', color: '#9ca3af' }}>ARCHIVED</span>
            : <span className={s.activeBadge}>ACTIVE</span>}
          <button className={s.expandBtn} onClick={() => setExpanded(v => !v)}>
            <svg
              className={expanded ? `${s.chevron} ${s.chevronOpen}` : s.chevron}
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className={s.expandBodyPadded}>
          {t.bio && <div className={s.fieldBlock}><Field label="Bio" value={t.bio} /></div>}

          {t.availability.length > 0 && (
            <div className={s.scheduleWrap}>
              <div className={s.scheduleTitle}>Weekly Schedule</div>
              <div className={s.scheduleDays}>
                {Object.entries(byDay).map(([day, slots]) => (
                  <div key={day} className={s.scheduleDay}>
                    <div className={s.scheduleDayName}>{DAYS_SHORT[Number(day)]}</div>
                    {slots.map((sl, i) => (
                      <div key={i} className={s.scheduleSlot}>
                        {minutesToTime(sl.start)} – {minutesToTime(sl.end)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {t.profile && (
            <div className={s.profileGrid}>
              {t.profile.headline && <Field label="Headline" value={t.profile.headline} />}
              {t.profile.hourlyRate && <Field label="Hourly Rate" value={`$${t.profile.hourlyRate}/hr`} />}
              {t.profile.experienceYears && <Field label="Experience" value={`${t.profile.experienceYears} years`} />}
              {t.profile.languages?.length > 0 && <Field label="Languages" value={t.profile.languages.join(', ')} />}
            </div>
          )}

          {(t.profile?.portfolioUrl || t.profile?.introVideoUrl) && (
            <div className={s.profileLinks}>
              {t.profile?.portfolioUrl && <LinkChip label="Portfolio" href={t.profile.portfolioUrl} />}
              {t.profile?.introVideoUrl && <LinkChip label="Intro Video" href={t.profile.introVideoUrl} />}
            </div>
          )}

          <TutorCardActions id={t.id} isArchived={isArchived} />
        </div>
      )}
    </div>
  );
}

function TutorCardActions({ id, isArchived }: { id: string; isArchived: boolean }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  async function archive() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutors/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ARCHIVED' }),
    });
    if (res.ok) { router.refresh(); }
    else { const e = await res.json(); showToast(e.error || 'Failed to archive'); }
    setSaving(false);
  }

  async function unarchive() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutors/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }),
    });
    if (res.ok) { router.refresh(); }
    else { const e = await res.json(); showToast(e.error || 'Failed to unarchive'); }
    setSaving(false);
  }

  async function handleDelete() {
    setSaving(true);
    const res = await fetch(`/api/admin/tutors/${id}`, { method: 'DELETE' });
    if (res.ok) { router.refresh(); }
    else { const e = await res.json(); showToast(e.error || 'Failed to delete'); setSaving(false); }
    setConfirmDelete(false);
  }

  if (confirmDelete) {
    return (
      <div style={{ paddingTop: '14px', borderTop: '1px solid var(--crm-section-sep)', marginTop: '4px' }}>
        <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '12px 14px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#f87171', fontWeight: 500 }}>
            Delete this tutor? This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setConfirmDelete(false)} disabled={saving}
              style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'var(--crm-tag-bg)', color: 'var(--crm-text-muted)', border: '1px solid var(--crm-border)', fontFamily: "'DM Sans', sans-serif" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={saving}
              style={{ padding: '5px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontFamily: "'DM Sans', sans-serif" }}>
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
        {toast && <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: '8px', background: 'var(--crm-tag-bg)', border: '1px solid var(--crm-border)', fontSize: '12px', color: 'var(--crm-text-muted)', display: 'inline-block' }}>{toast}</div>}
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '14px', borderTop: '1px solid var(--crm-section-sep)', marginTop: '4px', paddingBottom: '2px' }}>
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'center' }}>
        {isArchived ? (
          <TutorActionBtn label="Unarchive" bg="rgba(245,158,11,0.1)" color="#f59e0b" border="rgba(245,158,11,0.2)" hoverBg="rgba(245,158,11,0.2)" disabled={saving} onClick={unarchive} />
        ) : (
          <TutorActionBtn label="Archive" bg="var(--crm-tag-bg)" color="var(--crm-text-muted)" border="var(--crm-border)" hoverBg="var(--crm-expand-hover)" disabled={saving} onClick={archive} />
        )}
        <TutorActionBtn label="Delete" bg="rgba(239,68,68,0.07)" color="#f87171" border="rgba(239,68,68,0.15)" hoverBg="rgba(239,68,68,0.18)" disabled={saving} onClick={() => setConfirmDelete(true)} />
        {saving && <span style={{ fontSize: '11px', color: 'var(--crm-text-dim)', marginLeft: '4px' }}>Saving…</span>}
      </div>
      {toast && <div style={{ marginTop: '10px', padding: '8px 14px', borderRadius: '8px', background: 'var(--crm-tag-bg)', border: '1px solid var(--crm-border)', fontSize: '12px', color: 'var(--crm-text-muted)', display: 'inline-block' }}>{toast}</div>}
    </div>
  );
}

function TutorActionBtn({ label, bg, color, border, hoverBg, disabled, onClick }: {
  label: string; bg: string; color: string; border: string; hoverBg: string; disabled: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', background: bg, color, border: `1px solid ${border}`, opacity: disabled ? 0.5 : 1, transition: 'background 0.15s', fontFamily: "'DM Sans', sans-serif" }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = hoverBg; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = bg; }}
    >{label}</button>
  );
}

function AvailabilityGrid({ raw }: { raw: string }) {
  const byDay = parseAvailability(raw);
  const hasParsed = Object.keys(byDay).length > 0;
  const usedTimes = Array.from(new Set(Object.values(byDay).flat()));

  return (
    <div className={s.availWrap}>
      <div className={s.availTitle}>Availability</div>

      {hasParsed ? (
        <>
          <div className={s.availGrid}>
            {DAYS_SHORT.map((day, i) => {
              const times = byDay[i] || [];
              const isEmpty = times.length === 0;
              return (
                <div key={day} className={isEmpty ? `${s.availDay} ${s.availDayEmpty}` : `${s.availDay} ${s.availDayFilled}`}>
                  <span className={s.availDayLabel} style={{ color: isEmpty ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}>
                    {day}
                  </span>
                  {isEmpty ? (
                    <span className={s.availDash}>—</span>
                  ) : (
                    <div className={s.availDots}>
                      {times.map(t => (
                        <div
                          key={t}
                          className={s.availDot}
                          style={{
                            background: TIME_COLORS[t]?.dot || '#10b981',
                            boxShadow: `0 0 4px ${TIME_COLORS[t]?.dot || '#10b981'}60`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {usedTimes.length > 0 && (
            <div className={s.availLegend}>
              {usedTimes.map(t => (
                <span key={t} className={s.availLegendItem} style={{ color: TIME_COLORS[t]?.dot || '#10b981', background: TIME_COLORS[t]?.bg || 'rgba(16,185,129,0.15)' }}>
                  <span className={s.availLegendDot} style={{ background: TIME_COLORS[t]?.dot || '#10b981' }} />
                  {TIME_COLORS[t]?.label || t}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className={s.availFallback}>{raw}</div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className={s.fieldLabel}>{label}</div>
      <div className={s.fieldValue}>{value}</div>
    </div>
  );
}

function LinkChip({ label, href }: { label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={s.linkChip}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
      {label}
    </a>
  );
}

function EmptyState({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className={s.emptyState}>
      <div className={s.emptyIcon}>{icon}</div>
      <div className={s.emptyTitle}>{title}</div>
      <div className={s.emptySub}>{sub}</div>
    </div>
  );
}
