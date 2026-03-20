import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session) {
        redirect('/admin/login');
    }


    const enrollments = await prisma.enrollment.findMany({
        include: { client: true, cohort: { include: { course: true } } },
        orderBy: { created_at: 'desc' }
    });

    return (
        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>CRM Dashboard</h1>
                <div style={{ fontSize: '14px', color: 'var(--gray3)' }}>Total Enrollments: {enrollments.length}</div>
            </div>

            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8F9FA' }}>
                            <th style={{ padding: '16px' }}>Date</th>
                            <th style={{ padding: '16px' }}>Student Info</th>
                            <th style={{ padding: '16px' }}>Course (ID)</th>
                            <th style={{ padding: '16px' }}>Cohort Date</th>
                            <th style={{ padding: '16px' }}>Amount</th>
                            <th style={{ padding: '16px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map((e) => (
                            <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#555' }}>
                                    {e.created_at.toLocaleDateString()}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <strong style={{ display: 'block', color: 'var(--dark2)' }}>{e.client.full_name}</strong>
                                    <span style={{ fontSize: '13px', color: '#666' }}>📞 {e.client.phone_whatsapp}</span><br />
                                    {e.client.email && <span style={{ fontSize: '13px', color: '#666' }}>✉️ {e.client.email}</span>}
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>{e.cohort.course.name}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>{e.cohort.name}</td>
                                <td style={{ padding: '16px', fontSize: '14px' }}>
                                    Rp {e.price_agreed.toLocaleString('id-ID')}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                                        background: e.payment_status === 'paid' ? '#dcfce7' : '#fee2e2',
                                        color: e.payment_status === 'paid' ? '#166534' : '#991b1b',
                                        textTransform: 'uppercase'
                                    }}>
                                        {e.payment_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {enrollments.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                    No enrollments found yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
}
