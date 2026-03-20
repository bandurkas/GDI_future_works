import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { auth } from "@/auth";

const prisma = new PrismaClient();

export default async function ClientsDirectory() {
    const session = await auth();
    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const permissions = (session?.user as any)?.permissions || {};

    const canViewAll = role === "Owner" || permissions["view_all_enrollments"] === true;
    const canViewAssigned = role === "Sales Manager" || permissions["view_assigned_enrollments"] === true;

    // Legacy 'OWNER'/'ADMIN' fallback checks
    if (!canViewAll && !canViewAssigned && role !== 'OWNER' && role !== 'ADMIN') {
        return <div style={{ padding: '40px', fontFamily: 'var(--font-body)' }}>Unauthorized access.</div>;
    }

    const clients = await prisma.client.findMany({
        where: { 
            deleted_at: null,
            ...(canViewAll ? {} : { account_manager_id: userId })
        },
        orderBy: { created_at: 'desc' },
        include: {
            enrollments: true,
            account_manager: {
                select: { name: true }
            }
        }
    });

    return (
        <div style={{ fontFamily: 'var(--font-body)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: '28px' }}>Client Directory</h1>
                <Link href="/admin/clients/new" style={{
                    background: 'var(--red)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '14px',
                }}>
                    + Add New Client
                </Link>
            </div>

            <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: '#F8F9FA' }}>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Client Name</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Account Manager</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Contact Info</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Source</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Enrollments</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', color: 'var(--gray3)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map((client) => (
                            <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px' }}>
                                    <strong style={{ display: 'block', color: 'var(--dark2)' }}>{client.full_name}</strong>
                                    <span style={{ fontSize: '12px', color: '#888' }}>Added: {client.created_at.toLocaleDateString()}</span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#555', fontWeight: 500 }}>
                                    {client.account_manager?.name || <span style={{ color: '#ccc' }}>Unassigned</span>}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#555' }}>📞 {client.phone_whatsapp}</div>
                                    <div style={{ fontSize: '13px', color: '#555' }}>✉️ {client.email}</div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', textTransform: 'capitalize', color: '#555' }}>
                                    {client.source || '-'}
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--dark)' }}>
                                    {client.enrollments.length}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '1px',
                                        background: client.enrollments.length === 0 ? '#fef08a' : client.status === 'active' ? '#e0f2fe' : '#f1f5f9',
                                        color: client.enrollments.length === 0 ? '#854d0e' : client.status === 'active' ? '#0369a1' : '#475569',
                                        textTransform: 'uppercase'
                                    }}>
                                        {client.enrollments.length === 0 ? 'lead' : client.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                     <Link href={`/admin/clients/${client.id}`} style={{
                                         fontSize: '13px', color: 'var(--red)', textDecoration: 'none', fontWeight: 600
                                     }}>
                                         View Profile →
                                     </Link>
                                </td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                    {canViewAll ? "No clients found." : "You have no customers assigned to your account yet."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
        </div>
    );
}
