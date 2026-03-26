import { prisma } from '@/lib/prisma';
import { fmt } from '@/lib/utils';

export default async function CrmStudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      payments: {
        orderBy: { createdAt: 'desc' },
        select: { status: true, amount: true, currency: true, metadata: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const leads = students.filter(s => !s.payments.some(p => p.status === 'PAID'));
  const paid  = students.filter(s =>  s.payments.some(p => p.status === 'PAID'));

  return (
    <div style={{ maxWidth: '900px', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#111', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
          Students
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#999', fontWeight: 400 }}>
          {leads.length} not paid · {paid.length} paid
        </p>
      </div>

      <Section title="Registered · Not Paid" count={leads.length} color="#f59e0b">
        {leads.length === 0
          ? <Empty text="No unpaid leads" />
          : leads.map(s => <StudentCard key={s.id} s={s} />)}
      </Section>

      <Section title="Paid Students" count={paid.length} color="#10b981">
        {paid.length === 0
          ? <Empty text="No paid students yet" />
          : paid.map(s => <StudentCard key={s.id} s={s} />)}
      </Section>
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
        <span style={{
          fontSize: '11px', fontWeight: 700, color, background: `${color}18`,
          padding: '2px 8px', borderRadius: '20px',
        }}>{count}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
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

function StudentCard({ s }: { s: any }) {
  const name = s.user.name || '—';
  const initials = (s.user.name || s.user.email || '?').slice(0, 2).toUpperCase();

  // Collect all cart details across all payments
  const allCartDetails: { courseTitle: string; dateLabel: string; timeLabel: string; priceIDR: number; priceMYR: number }[] = [];
  for (const payment of s.payments) {
    const meta = payment.metadata as any;
    if (meta?.cartDetails?.length) {
      for (const item of meta.cartDetails) {
        allCartDetails.push(item);
      }
    }
  }

  // Best payment to show for status/amount
  const paidPayment = s.payments.find((p: any) => p.status === 'PAID');
  const latestPayment = s.payments[0];
  const displayPayment = paidPayment || latestPayment;

  const statusColors: Record<string, { bg: string; text: string }> = {
    LEAD:      { bg: '#fef3c7', text: '#92400e' },
    ACTIVE:    { bg: '#d1fae5', text: '#065f46' },
    COMPLETED: { bg: '#dbeafe', text: '#1e40af' },
    DROPPED:   { bg: '#fee2e2', text: '#991b1b' },
  };
  const sc = statusColors[s.status] || { bg: '#f3f4f6', text: '#374151' };

  const hasDetails = allCartDetails.length > 0;

  return (
    <div style={{
      background: 'white', border: '1px solid #ebebeb', borderRadius: '14px',
      padding: '20px 24px',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: hasDetails ? '16px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: '#e43a3d18', color: '#e43a3d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: 700, flexShrink: 0,
            fontFamily: "'Syne', sans-serif",
          }}>{initials}</div>

          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '3px' }}>{name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <ContactChip icon="✉" value={s.user.email} />
              {s.user.phone && <ContactChip icon="📞" value={s.user.phone} />}
              {s.country && <ContactChip icon="🌍" value={s.country} />}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', background: sc.bg, color: sc.text,
          }}>{s.status}</span>
          <span style={{ fontSize: '11px', color: '#bbb', fontFamily: "'DM Mono', monospace" }}>
            Joined {fmt(s.createdAt)}
          </span>
          {displayPayment && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <PayBadge status={displayPayment.status} />
              <span style={{ fontSize: '11px', color: '#999', fontFamily: "'DM Mono', monospace" }}>
                Rp {Number(displayPayment.amount).toLocaleString('id-ID')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Cart details — selected courses */}
      {hasDetails && (
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Selected Courses
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {allCartDetails.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f9f9f9', borderRadius: '8px', padding: '10px 14px',
                gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{item.courseTitle}</div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '3px' }}>
                      {item.dateLabel && (
                        <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px' }}>📅</span> {item.dateLabel}
                        </span>
                      )}
                      {item.timeLabel && (
                        <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '11px' }}>🕐</span> {item.timeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#444', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>
                  Rp {item.priceIDR.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasDetails && !displayPayment && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: '12px', color: '#d1d5db', fontStyle: 'italic' }}>No selection yet</span>
        </div>
      )}
    </div>
  );
}

function ContactChip({ icon, value }: { icon: string; value: string }) {
  return (
    <span style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '11px' }}>{icon}</span>
      {value}
    </span>
  );
}

function PayBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    PAID:     { bg: '#d1fae5', color: '#065f46' },
    PENDING:  { bg: '#fef3c7', color: '#92400e' },
    FAILED:   { bg: '#fee2e2', color: '#991b1b' },
    REFUNDED: { bg: '#ede9fe', color: '#5b21b6' },
  };
  const s = map[status] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px', background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}
