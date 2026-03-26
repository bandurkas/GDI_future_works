import { prisma } from '@/lib/prisma';
import AppActions from './AppActions';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function minutesToTime(m: number) {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
}
function fmt(d: Date) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function CrmTutorsPage() {
  const [applications, tutors] = await Promise.all([
    prisma.tutorApplication.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.tutor.findMany({
      where: { status: 'APPROVED' },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        availability: { orderBy: [{ dayOfWeek: 'asc' }, { startTimeM: 'asc' }] },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const pending  = applications.filter(a => a.status === 'PENDING');
  const reviewed = applications.filter(a => a.status !== 'PENDING');

  return (
    <div style={{ maxWidth: '900px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#111', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
          Tutors
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#999' }}>
          {pending.length} pending applications · {tutors.length} active tutors
        </p>
      </div>

      <Section title="Pending Applications" count={pending.length} color="#f59e0b">
        {pending.length === 0 ? <Empty text="No pending applications" /> : pending.map(a => <AppCard key={a.id} a={a} />)}
      </Section>

      <Section title="Active Tutors" count={tutors.length} color="#10b981">
        {tutors.length === 0 ? <Empty text="No active tutors" /> : tutors.map(t => <TutorCard key={t.id} t={t} />)}
      </Section>

      {reviewed.length > 0 && (
        <Section title="Reviewed Applications" count={reviewed.length} color="#9ca3af">
          {reviewed.map(a => <AppCard key={a.id} a={a} compact />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, count, color, children }: {
  title: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <h2 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {title}
        </h2>
        <span style={{ fontSize: '11px', fontWeight: 700, color, background: `${color}18`, padding: '2px 8px', borderRadius: '20px' }}>
          {count}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #ebebeb', borderRadius: '12px',
      padding: '32px', textAlign: 'center', fontSize: '13px', color: '#ccc',
    }}>{text}</div>
  );
}

function AppCard({ a, compact }: { a: any; compact?: boolean }) {
  const statusMap: Record<string, { bg: string; color: string }> = {
    PENDING:  { bg: '#fef3c7', color: '#92400e' },
    APPROVED: { bg: '#d1fae5', color: '#065f46' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b' },
  };
  const sc = statusMap[a.status] || { bg: '#f3f4f6', color: '#374151' };
  const initials = (a.name || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#f0f0f0', color: '#555',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, flexShrink: 0, fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>{a.name}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{a.email}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: sc.bg, color: sc.color }}>{a.status}</span>
          <span style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace" }}>{fmt(a.createdAt)}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <Field label="Expertise" value={a.expertise || '—'} />
          <Field label="Timezone" value={a.timezone || '—'} />
        </div>

        {a.bio && <Field label="Bio / Background" value={a.bio} multiline />}
        {a.availability && <div style={{ marginTop: '12px' }}><Field label="Availability" value={a.availability} multiline /></div>}

        {!compact && (
          <>
            {(a.linkedin || a.videoLink || a.portfolioLink) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                {a.linkedin && <LinkField label="LinkedIn" href={a.linkedin} />}
                {a.videoLink && <LinkField label="Intro Video" href={a.videoLink} />}
                {a.portfolioLink && <LinkField label="Portfolio" href={a.portfolioLink} />}
              </div>
            )}
            {a.curriculum && <div style={{ marginTop: '16px' }}><Field label="Curriculum / Teaching Approach" value={a.curriculum} multiline /></div>}
            {a.lessonPlan && <div style={{ marginTop: '12px' }}><Field label="Sample Lesson Plan" value={a.lessonPlan} multiline /></div>}
          </>
        )}
        <AppActions id={a.id} status={a.status} />
      </div>
    </div>
  );
}

function TutorCard({ t }: { t: any }) {
  const initials = (t.user.name || t.user.email || '?').slice(0, 2).toUpperCase();

  const byDay: Record<number, { start: number; end: number }[]> = {};
  for (const slot of t.availability) {
    if (!byDay[slot.dayOfWeek]) byDay[slot.dayOfWeek] = [];
    byDay[slot.dayOfWeek].push({ start: slot.startTimeM, end: slot.endTimeM });
  }

  return (
    <div style={{ background: 'white', border: '1px solid #ebebeb', borderRadius: '14px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', borderBottom: '1px solid #f5f5f5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#d1fae518', color: '#065f46',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, flexShrink: 0, fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>{t.user.name || '—'}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{t.user.email}</div>
            {t.user.phone && <div style={{ fontSize: '12px', color: '#bbb', marginTop: '1px' }}>{t.user.phone}</div>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#d1fae5', color: '#065f46' }}>ACTIVE</span>
          {t.isVerified && <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', background: '#dbeafe', color: '#1e40af' }}>VERIFIED</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '18px 24px' }}>
        {/* Expertise tags */}
        {t.expertise?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Expertise</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {t.expertise.map((e: string) => (
                <span key={e} style={{ fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', background: '#f0f0f0', color: '#444' }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {t.bio && <Field label="Bio" value={t.bio} multiline />}

        {/* Availability slots */}
        {t.availability.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Weekly Schedule</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(byDay).map(([day, slots]) => (
                <div key={day} style={{ background: '#f8f8f8', border: '1px solid #ebebeb', borderRadius: '8px', padding: '8px 12px', minWidth: '110px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#555', marginBottom: '4px' }}>{DAYS[Number(day)]}</div>
                  {slots.map((sl, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#777', fontFamily: "'DM Mono', monospace" }}>
                      {minutesToTime(sl.start)} – {minutesToTime(sl.end)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile details */}
        {t.profile && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {t.profile.headline && <Field label="Headline" value={t.profile.headline} />}
            {t.profile.hourlyRate && <Field label="Hourly Rate" value={`$${t.profile.hourlyRate}/hr`} />}
            {t.profile.experienceYears && <Field label="Experience" value={`${t.profile.experienceYears} years`} />}
            {t.profile.languages?.length > 0 && <Field label="Languages" value={t.profile.languages.join(', ')} />}
            {t.profile.portfolioUrl && <LinkField label="Portfolio" href={t.profile.portfolioUrl} />}
            {t.profile.introVideoUrl && <LinkField label="Intro Video" href={t.profile.introVideoUrl} />}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: '#333', lineHeight: 1.6, whiteSpace: multiline ? 'pre-wrap' : 'normal', wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
}

function LinkField({ label, href }: { label: string; href: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: '#e43a3d', textDecoration: 'none', wordBreak: 'break-all' }}>
        {href.replace(/^https?:\/\//, '').slice(0, 40)}{href.length > 45 ? '…' : ''}
      </a>
    </div>
  );
}
