import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function CommissionPage() {
  const claimed = await prisma.lead.findMany({
    where: { manager: { not: null }, deletedAt: null },
    select: { manager: true, claimedById: true, claimedAt: true, status: true, createdAt: true },
  });

  const som = startOfMonth();
  type Row = { manager: string; phone: string | null; total: number; month: number; converted: number };
  const map = new Map<string, Row>();

  for (const l of claimed) {
    const key = l.manager as string;
    const r = map.get(key) ?? { manager: key, phone: l.claimedById ?? null, total: 0, month: 0, converted: 0 };
    r.total += 1;
    const when = l.claimedAt ?? l.createdAt;
    if (when && when >= som) r.month += 1;
    if (l.status === LeadStatus.CONVERTED) r.converted += 1;
    if (!r.phone && l.claimedById) r.phone = l.claimedById;
    map.set(key, r);
  }

  const rows = [...map.values()].sort((a, b) => b.total - a.total);
  const totals = rows.reduce(
    (acc, r) => ({ total: acc.total + r.total, month: acc.month + r.month, converted: acc.converted + r.converted }),
    { total: 0, month: 0, converted: 0 },
  );
  const monthName = som.toLocaleString('en-GB', { month: 'long', year: 'numeric' });

  const th: React.CSSProperties = { padding: '10px 8px', textAlign: 'left' };
  const thR: React.CSSProperties = { ...th, textAlign: 'right' };
  const td: React.CSSProperties = { padding: '10px 8px' };
  const tdR: React.CSSProperties = { ...td, textAlign: 'right' };

  return (
    <div style={{ padding: '24px 28px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Commission — Leads Handled</h1>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 20 }}>
        Who claimed how many leads via the WhatsApp “Take Lead” button. Current month: {monthName}.
      </p>

      {rows.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', border: '1px dashed #d1d5db', borderRadius: 12 }}>
          No claimed leads yet. They appear here once someone taps “Take Lead” in the WhatsApp group.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280', fontSize: 12, textTransform: 'uppercase' }}>
              <th style={th}>Manager</th>
              <th style={th}>Phone</th>
              <th style={thR}>This month</th>
              <th style={thR}>Converted</th>
              <th style={thR}>Total taken</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.manager} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ ...td, fontWeight: 600 }}>{r.manager}</td>
                <td style={{ ...td, color: '#6b7280' }}>{r.phone ? `+${r.phone}` : '—'}</td>
                <td style={tdR}>{r.month}</td>
                <td style={tdR}>{r.converted}</td>
                <td style={{ ...tdR, fontWeight: 700 }}>{r.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid #e5e7eb', fontWeight: 700 }}>
              <td style={td}>Total</td>
              <td />
              <td style={tdR}>{totals.month}</td>
              <td style={tdR}>{totals.converted}</td>
              <td style={tdR}>{totals.total}</td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}
