import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function CohortRoster({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;

    const cohort = await prisma.cohort.findUnique({
        where: { id },
        include: {
            course: true,
            instructors: { include: { user: true } },
            enrollments: {
                where: { status: 'active' },
                include: { client: true, attendance: true },
                orderBy: { created_at: 'asc' }
            }
        }
    });

    if (!cohort) return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Cohort not found.</div>;

    // Authorization Check for Instructors
    if (session?.user?.role === 'INSTRUCTOR') {
        const isAssigned = cohort.instructors.some(inst => inst.user.email === session.user.email);
        if (!isAssigned) {
             return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Unauthorized. You are not assigned to this cohort.</div>;
        }
    }

    return (
        <div style={{ fontFamily: 'var(--font-body)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <Link href="/admin/cohorts" style={{ fontSize: '13px', color: 'var(--gray3)', textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                        ← Back to Cohorts
                    </Link>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '28px', color: 'var(--dark)' }}>
                        {cohort.course.name} <span style={{ color: 'var(--gray3)', fontSize: '20px' }}>— {cohort.name}</span>
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                     {cohort.meeting_url && (
                        <a href={cohort.meeting_url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: 'var(--red)', color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            Launch Session (Zoom)
                        </a>
                     )}
                     {cohort.resources_url && (
                        <a href={cohort.resources_url} target="_blank" rel="noreferrer" style={{ padding: '8px 16px', background: 'white', color: 'var(--dark)', border: '1px solid var(--border)', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>
                            Materials (Drive)
                        </a>
                     )}
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '24px' }}>🎓</div>
                    <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Enrolled Clients</div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dark)' }}>{cohort.enrollments.length} <span style={{ fontSize: '13px', color: 'var(--gray3)', fontWeight: 400 }}>/ {cohort.max_seats} Max</span></div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '24px' }}>📅</div>
                    <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Date Range</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                            {cohort.start_date.toLocaleDateString()} — {cohort.end_date.toLocaleDateString()}
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '24px' }}>👨‍🏫</div>
                    <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Assigned Instructors</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                            {cohort.instructors.length > 0 ? cohort.instructors.map(i => i.user.name).join(', ') : 'None'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Roster Table */}
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 20px', fontSize: '20px' }}>Active Roster</h2>
            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8F9FA' }}>
                            <th style={{ padding: '16px', fontSize: '12px', color: 'var(--gray3)' }}>Client Name</th>
                            <th style={{ padding: '16px', fontSize: '12px', color: 'var(--gray3)' }}>Phone Number</th>
                            {session?.user?.role !== 'INSTRUCTOR' && (
                                <th style={{ padding: '16px', fontSize: '12px', color: 'var(--gray3)' }}>Payment Status</th>
                            )}
                            <th style={{ padding: '16px', fontSize: '12px', color: 'var(--gray3)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cohort.enrollments.map((enrollment, index) => (
                            <tr key={enrollment.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '28px', height: '28px', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: '#555' }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <strong style={{ display: 'block', color: 'var(--dark2)' }}>{enrollment.client.full_name}</strong>
                                            {session?.user?.role !== 'INSTRUCTOR' && <span style={{ fontSize: '12px', color: '#666' }}>{enrollment.client.email}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#444' }}>
                                    <a href={`https://wa.me/${enrollment.client.phone_whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 600 }}>
                                        {enrollment.client.phone_whatsapp}
                                    </a>
                                </td>
                                
                                {session?.user?.role !== 'INSTRUCTOR' && (
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                                            background: enrollment.payment_status === 'paid' ? '#dcfce7' : enrollment.payment_status === 'partial' ? '#fef08a' : '#fee2e2',
                                            color: enrollment.payment_status === 'paid' ? '#166534' : enrollment.payment_status === 'partial' ? '#854d0e' : '#991b1b',
                                            textTransform: 'uppercase'
                                        }}>
                                            {enrollment.payment_status}
                                        </span>
                                    </td>
                                )}

                                <td style={{ padding: '16px' }}>
                                     <button style={{
                                         background: 'white', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 600
                                     }}>Mark Attendance</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
}
