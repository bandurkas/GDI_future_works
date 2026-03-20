import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  User, 
  MapPin, 
  Calendar, 
  CreditCard,
  Search,
  Filter,
  MoreVertical
} from "lucide-react";

const prisma = new PrismaClient();

export default async function StudentsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const students = await prisma.student.findMany({
        include: { 
            user: true,
            _count: {
                select: { bookings: true, payments: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-1px' }}>
                        Student Directory
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Manage student records, enrollment status, and booking history.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                        <input 
                            type="text" 
                            placeholder="Search students..." 
                            style={{ padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', width: '200px' }} 
                        />
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #eee', background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Student</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Location</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Activity</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#FEF2F2', color: '#e43a3d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                                            {s.user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.user.email}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>Joined {s.createdAt.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', color: '#555' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14} style={{ color: '#999' }} />
                                        {s.country || 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '100px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        background: s.status === 'ACTIVE' ? '#ECFDF5' : s.status === 'COMPLETED' ? '#DBEAFE' : '#f5f5f5',
                                        color: s.status === 'ACTIVE' ? '#059669' : s.status === 'COMPLETED' ? '#1E40AF' : '#666'
                                    }}>
                                        {s.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555' }}>
                                            <Calendar size={14} style={{ color: '#999' }} />
                                            {s._count.bookings} Bookings
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#555' }}>
                                            <CreditCard size={14} style={{ color: '#999' }} />
                                            {s._count.payments} Payments
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <button style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: '4px' }}>
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No students registered yet.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
