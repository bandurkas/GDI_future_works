import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  DollarSign, 
  User, 
  Calendar, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from "lucide-react";

const prisma = new PrismaClient();

export default async function PayoutsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const payouts = await prisma.tutorPayout.findMany({
        include: { 
            tutor: { include: { user: true } }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Tutor Payouts
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Manage and process payments to your marketplace tutors.</p>
                </div>
                <button style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px 20px', 
                    borderRadius: '12px', 
                    background: '#1a1a1a', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    cursor: 'pointer'
                }}>
                    <Clock size={18} /> Schedule Payout Run
                </button>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Tutor</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Amount</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Period</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((p) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '18px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={18} color="#666" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{p.tutor.user.email}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>ID: {p.tutorId.split('-')[0]}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#1a1a1a' }}>
                                        Rp {Number(p.amount).toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#555', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={14} color="#999" />
                                        {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
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
                                        background: p.status === 'PAID' ? '#ECFDF5' : '#FFFBEB',
                                        color: p.status === 'PAID' ? '#059669' : '#D97706'
                                    }}>
                                        {p.status === 'PAID' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                        {p.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    {p.status === 'PENDING' && (
                                        <button style={{ 
                                            padding: '8px 12px', 
                                            borderRadius: '8px', 
                                            border: '1px solid #eee', 
                                            background: 'white', 
                                            fontSize: '12px', 
                                            fontWeight: 600, 
                                            color: '#e43a3d',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginLeft: 'auto'
                                        }}>
                                            Process Payout <ArrowRight size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {payouts.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No payouts currently scheduled or processed.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
