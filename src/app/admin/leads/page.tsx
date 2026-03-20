import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  UserPlus, 
  MessageSquare, 
  Phone, 
  Mail, 
  MoreVertical,
  Plus,
  ArrowRight
} from "lucide-react";

const prisma = new PrismaClient();

export default async function LeadsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const leads = await prisma.lead.findMany({
        include: { activities: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                        Lead Management
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Track prospective students and tutors through the sales pipeline.</p>
                </div>
                <button style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    padding: '12px 20px', 
                    borderRadius: '12px', 
                    background: '#e43a3d', 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '14px', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(228, 58, 61, 0.2)'
                }}>
                    <Plus size={18} /> Add New Lead
                </button>
            </header>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
                {['ALL', 'STUDENT', 'TUTOR'].map(tab => (
                    <button key={tab} style={{ 
                        background: 'none', 
                        border: 'none', 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: tab === 'ALL' ? '#e43a3d' : '#666',
                        cursor: 'pointer',
                        padding: '8px 4px',
                        borderBottom: tab === 'ALL' ? '2px solid #e43a3d' : 'none'
                    }}>
                        {tab === 'ALL' ? 'All Leads' : tab === 'STUDENT' ? 'Student Leads' : 'Tutor Leads'}
                    </button>
                ))}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Lead Info</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Source</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Last Activity</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map((l) => (
                            <tr key={l.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: l.type === 'STUDENT' ? '#DBEAFE' : '#E0E7FF', color: l.type === 'STUDENT' ? '#1E40AF' : '#3730A3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                                            {l.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '14px' }}>{l.name}</div>
                                            <div style={{ fontSize: '12px', color: '#888' }}>{l.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', fontSize: '13px', color: '#555' }}>
                                    {l.source || 'Direct'}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        background: l.status === 'CONVERTED' ? '#ECFDF5' : l.status === 'QUALIFIED' ? '#E0E7FF' : '#FFFBEB',
                                        color: l.status === 'CONVERTED' ? '#059669' : l.status === 'QUALIFIED' ? '#3730A3' : '#D97706'
                                    }}>
                                        {l.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '13px', color: '#1a1a1a' }}>
                                        {l.activities[0]?.notes || 'No activity yet'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#999' }}>
                                        {l.activities[0] ? new Date(l.activities[0].createdAt).toLocaleDateString() : 'N/A'}
                                    </div>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button title="Call" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}><Phone size={16} /></button>
                                        <button title="WhatsApp" style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }}><MessageSquare size={16} /></button>
                                        <button title="Convert to User" style={{ p: '6px 10px', borderRadius: '8px', border: '1px solid #eee', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                                            Convert <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>The lead pipeline is currently empty.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
