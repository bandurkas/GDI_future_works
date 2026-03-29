import { PrismaClient } from '@prisma/client';
import { auth } from "@/auth";
import { redirect } from 'next/navigation';
import { 
  Video, 
  Users, 
  Clock, 
  BookOpen,
  Plus,
  ArrowUpRight
} from "lucide-react";
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function SessionsAdminPage() {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const sessions = await prisma.session.findMany({
        include: { 
            course: { include: { tutor: { include: { user: true } } } },
            _count: { select: { bookings: true } }
        },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'var(--font-body)', color: '#1a1a1a' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', letterSpacing: '-1px' }}>
                        Session Scheduler
                    </h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>Monitor and manage live learning sessions across the marketplace.</p>
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
                    <Plus size={18} /> Schedule Session
                </button>
            </header>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #eee', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #eee', background: '#fafafa' }}>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Time & Date</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Course & Tutor</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Capacity</th>
                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '16px', textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((s) => (
                            <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{new Date(s.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                    <div style={{ fontSize: '12px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} />
                                        {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <BookOpen size={14} style={{ color: '#e43a3d' }} />
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{s.course.title}</div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>Tutor: {s.course.tutor.user.email}</div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '100px', height: '6px', borderRadius: '3px', background: '#f0f0f0', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(s._count.bookings / s.capacity) * 100}%`, background: '#3B82F6' }}></div>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#666' }}>{s._count.bookings}/{s.capacity}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '6px', 
                                        fontSize: '11px', 
                                        fontWeight: 700,
                                        background: s.status === 'SCHEDULED' ? '#DBEAFE' : s.status === 'COMPLETED' ? '#ECFDF5' : '#FEF2F2',
                                        color: s.status === 'SCHEDULED' ? '#1E40AF' : s.status === 'COMPLETED' ? '#059669' : '#DC2626'
                                    }}>
                                        {s.status}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                        {s.meetingUrl && (
                                            <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee', background: 'white', color: '#3B82F6', textDecoration: 'none' }}>
                                                <Video size={16} />
                                            </a>
                                        )}
                                        <Link href={`/admin/sessions/${s.id}`} style={{ padding: '8px', borderRadius: '8px', border: '1px solid #eee', background: 'white', color: '#666' }}>
                                            <ArrowUpRight size={16} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {sessions.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ color: '#999', fontSize: '14px' }}>No sessions scheduled at this time.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
