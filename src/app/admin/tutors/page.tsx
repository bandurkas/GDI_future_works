import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  MoreVertical,
  Search,
  Filter
} from "lucide-react";

const prisma = new PrismaClient();

export default async function TutorsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const tutors = await prisma.tutor.findMany({
        include: { 
            user: true,
            profile: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Tutor Management
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Manage applications, verification, and marketplace profiles.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', color: '#999' }} />
                        <input 
                            type="text" 
                            placeholder="Search tutors..." 
                            style={{ padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', width: '240px' }} 
                        />
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', border: '1px solid #eee', background: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                        <Filter size={16} /> Filter
                    </button>
                </div>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Tutor</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Expertise</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Rating</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tutors.map((t) => (
                            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                            {t.user.email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{t.user.email}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>{t.id.split('-')[0]} • Joined {t.createdAt.toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {t.expertise.slice(0, 2).map(skill => (
                                            <span key={skill} style={{ padding: '2px 6px', borderRadius: '4px', background: '#f0f0f0', fontSize: '11px', fontWeight: 500 }}>{skill}</span>
                                        ))}
                                        {t.expertise.length > 2 && <span style={{ fontSize: '11px', color: '#999' }}>+{t.expertise.length - 2} more</span>}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        background: t.status === 'APPROVED' ? '#ECFDF5' : t.status === 'PENDING' ? '#FFFBEB' : '#FEF2F2',
                                        color: t.status === 'APPROVED' ? '#059669' : t.status === 'PENDING' ? '#D97706' : '#DC2626'
                                    }}>
                                        {t.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 600 }}>
                                    ⭐ {t.ratingAvg.toFixed(1)} <span style={{ fontWeight: 400, color: '#999', fontSize: '12px' }}>({t.totalReviews})</span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        <button title="View Profile" style={{ p: '8px', borderRadius: '8px', border: '1px solid #eee', background: 'white', cursor: 'pointer', color: '#666' }}>
                                            <ExternalLink size={16} />
                                        </button>
                                        <button title="Approve" style={{ p: '8px', borderRadius: '8px', border: '1px solid #eee', background: 'white', cursor: 'pointer', color: '#059669' }}>
                                            <CheckCircle size={16} />
                                        </button>
                                        <button title="Reject" style={{ p: '8px', borderRadius: '8px', border: '1px solid #eee', background: 'white', cursor: 'pointer', color: '#DC2626' }}>
                                            <XCircle size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {tutors.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No tutors found in the system.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
