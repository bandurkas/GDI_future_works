import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import Link from 'next/link';
import { ClientAccountManagerAssign } from "./ClientAccountManagerAssign";

const prisma = new PrismaClient();

export default async function ClientProfile({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    const { id } = await params;

    if (session?.user?.role === 'INSTRUCTOR') {
        return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Unauthorized access.</div>;
    }

    const client = await prisma.client.findUnique({
        where: { id },
        include: {
            enrollments: {
                include: {
                    cohort: { include: { course: true } },
                    payments: true,
                    attendance: true
                },
                orderBy: { created_at: 'desc' }
            },
            notes: {
                include: { author: true },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    if (!client) return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Client not found.</div>;

    const role = (session?.user as any)?.role;
    const permissions = (session?.user as any)?.permissions || {};
    const canAssign = role === "Owner" || permissions["assign_roles"] || role === 'Admin';

    let availableManagers: any[] = [];
    if (canAssign) {
        availableManagers = await prisma.appUser.findMany({
            where: { is_active: true },
            select: { id: true, name: true, role: true }
        });
        // Further filter or keep all users? 
        // Best practice typically restricts to roles that manage accounts
        availableManagers = availableManagers.filter(u => ['Sales Manager', 'Owner'].includes(u.role) || u.role === 'Admin');
    }

    if (!client) return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Client not found.</div>;

    return (
        <div style={{ fontFamily: 'var(--font-body)' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <Link href="/admin/clients" style={{ fontSize: '13px', color: 'var(--gray3)', textDecoration: 'none', marginBottom: '8px', display: 'block' }}>
                        ← Back to Directory
                    </Link>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '28px', color: 'var(--dark)' }}>
                        {client.full_name}
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button style={{ padding: '8px 16px', background: 'white', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Edit Client</button>
                    {session?.user?.role === 'Owner' && (
                        <button style={{ padding: '8px 16px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>Delete</button>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px' }}>
                
                {/* Left Column: Client Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {canAssign && (
                        <ClientAccountManagerAssign 
                            clientId={client.id} 
                            initialManagerId={client.account_manager_id} 
                            availableManagers={availableManagers} 
                        />
                    )}

                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '14px', margin: '0 0 16px', color: 'var(--dark)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Contact Information</h3>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Email</div>
                            <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{client.email}</div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Phone (WhatsApp)</div>
                            <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{client.phone_whatsapp}</div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Location</div>
                            <div style={{ fontSize: '14px', color: 'var(--dark)' }}>{client.city || '-'}, {client.country || '-'}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Source</div>
                            <div style={{ fontSize: '14px', color: 'var(--dark)', textTransform: 'capitalize' }}>{client.source || '-'}</div>
                        </div>
                    </div>

                    {/* Notes Section Placeholder */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', margin: 0, color: 'var(--dark)' }}>Internal Notes</h3>
                            <button style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Add Note</button>
                         </div>
                         
                         {client.notes.length === 0 ? (
                             <div style={{ fontSize: '13px', color: 'var(--gray3)', textAlign: 'center', padding: '20px 0' }}>No notes explicitly recorded.</div>
                         ) : (
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                 {client.notes.map(note => (
                                     <div key={note.id} style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                                         <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                             <span>{note.author?.name || 'System'}</span>
                                             <span>{note.created_at.toLocaleDateString()}</span>
                                         </div>
                                         <div style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>{note.content}</div>
                                     </div>
                                 ))}
                             </div>
                         )}
                    </div>
                </div>

                {/* Right Column: Enrollments & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <h2 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '20px' }}>Enrollment History</h2>
                    
                    {client.enrollments.map(enrollment => (
                        <div key={enrollment.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark)', marginBottom: '4px' }}>{enrollment.cohort.course.name}</div>
                                    <div style={{ fontSize: '13px', color: '#666' }}>Cohort: {enrollment.cohort.name} • Started {enrollment.cohort.start_date.toLocaleDateString()}</div>
                                </div>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                                    background: enrollment.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                                    color: enrollment.status === 'active' ? '#0369a1' : '#475569',
                                    textTransform: 'uppercase'
                                }}>
                                    {enrollment.status}
                                </span>
                            </div>

                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Financials</div>
                                        <div style={{ fontSize: '14px', marginBottom: '4px' }}>Agreed Price: <strong style={{color: 'var(--dark)'}}>Rp {enrollment.price_agreed.toLocaleString('id-ID')}</strong></div>
                                        <div style={{ fontSize: '14px' }}>Total Paid: <strong style={{color: 'var(--red)'}}>Rp {enrollment.total_paid.toLocaleString('id-ID')}</strong></div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'var(--gray3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Payment Status</div>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
                                            background: enrollment.payment_status === 'paid' ? '#dcfce7' : enrollment.payment_status === 'partial' ? '#fef08a' : '#fee2e2',
                                            color: enrollment.payment_status === 'paid' ? '#166534' : enrollment.payment_status === 'partial' ? '#854d0e' : '#991b1b',
                                            textTransform: 'uppercase'
                                        }}>
                                            {enrollment.payment_status}
                                        </span>
                                    </div>
                                </div>

                                {/* Ledger / Payments Table */}
                                <h4 style={{ fontSize: '13px', margin: '0 0 12px', color: 'var(--dark)' }}>Payment Ledger</h4>
                                {enrollment.payments.length === 0 ? (
                                    <div style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>No payments logged yet.</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid #eee', color: '#888' }}>
                                                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 600 }}>Date</th>
                                                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 600 }}>Type</th>
                                                <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 600 }}>Method</th>
                                                <th style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600 }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {enrollment.payments.map(payment => (
                                                <tr key={payment.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                                    <td style={{ padding: '8px 4px', color: '#555' }}>{payment.paid_at.toLocaleDateString()}</td>
                                                    <td style={{ padding: '8px 4px', textTransform: 'capitalize', color: payment.transaction_type === 'refund' ? '#991b1b' : '#166534' }}>{payment.transaction_type}</td>
                                                    <td style={{ padding: '8px 4px', textTransform: 'capitalize', color: '#555' }}>{payment.method}</td>
                                                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: 600, color: 'var(--dark)' }}>Rp {payment.amount.toLocaleString('id-ID')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    ))}

                    {client.enrollments.length === 0 && (
                        <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', color: '#888' }}>
                            <div style={{ fontSize: '24px', marginBottom: '10px' }}>📭</div>
                            No enrollments found for this client.
                        </div>
                    )}

                </div>
            </div>
            
        </div>
    );
}
