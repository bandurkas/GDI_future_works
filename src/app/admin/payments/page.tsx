import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  CreditCard, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  RefreshCcw,
  Search,
  Filter
} from "lucide-react";

const prisma = new PrismaClient();

export default async function PaymentsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const payments = await prisma.payment.findMany({
        include: { 
            student: { include: { user: true } },
            booking: { include: { session: { include: { course: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Payment Ledger
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Monitor all inbound transactions and marketplace revenue.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                        <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            style={{ padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', width: '240px' }} 
                        />
                    </div>
                </div>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Transaction Info</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Method</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.externalId || 'Internal Receipt'}</div>
                                    <div style={{ fontSize: '12px', color: '#888' }}>
                                        {p.student.user.email} • {new Date(p.createdAt).toLocaleDateString()}
                                    </div>
                                    {p.booking && (
                                        <div style={{ fontSize: '11px', color: '#3B82F6', marginTop: '4px', fontWeight: 600 }}>
                                            Linked to: {p.booking.session.course.title}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '14px' }}>
                                        {p.currency} {Number(p.amount).toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#555' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CreditCard size={14} />
                                        {p.provider}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 10px', 
                                        borderRadius: '100px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        background: p.status === 'PAID' ? '#ECFDF5' : p.status === 'FAILED' ? '#FEF2F2' : '#FFFBEB',
                                        color: p.status === 'PAID' ? '#059669' : p.status === 'FAILED' ? '#DC2626' : '#D97706'
                                    }}>
                                        {p.status === 'PAID' ? <CheckCircle size={10} /> : p.status === 'FAILED' ? <AlertCircle size={10} /> : <RefreshCcw size={10} />}
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {payments.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No payment records found.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
